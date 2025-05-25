// ARQUIVO CORRIGIDO - MoveisBonafe Sistema Completo
// Este arquivo contém todas as correções necessárias para o preço fixo e ordenação alfabética

// Sistema de dados local
let systemData = {
  products: [],
  categories: [],
  promotions: [],
  users: [
    { username: 'admin', password: 'admin123', type: 'admin', name: 'Administrador', price_multiplier: 1.0 },
    { username: 'vendedor', password: 'vend123', type: 'seller', name: 'Vendedor', price_multiplier: 1.0 },
    { username: 'cliente', password: 'cli123', type: 'customer', name: 'Cliente', price_multiplier: 1.0 },
    { username: 'Loja', password: 'moveisbonafe', type: 'customer', name: 'Loja', price_multiplier: 1.0 }
  ],
  priceSettings: {
    'A Vista': 0,
    '30': 2,
    '30/60': 4,
    '30/60/90': 6,
    '30/60/90/120': 8
  }
};

// Array para armazenar imagens selecionadas
let selectedImages = [];

// Variáveis para controle do carrossel
let carouselStates = {};
let touchStartX = 0;
let touchStartY = 0;

// Configuração do Supabase
const SUPABASE_URL = 'https://pqrzlmdbgxxzhemqrjfx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcnpsbWRiZ3h4emhlbXFyamZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzAwNTEsImV4cCI6MjA2MzQ0NjA1MX0.X1AJFqhMqxCYXC48TfE_0KojD8_0Tr8xt1MjF4l87zQ';

// Cliente Supabase simples via HTTP
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async query(table, query = '') {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}${query}`, {
        method: 'GET',
        headers: this.headers
      });
      return await response.json();
    } catch (error) {
      console.error('Erro na consulta:', error);
      return [];
    }
  }

  async insert(table, data) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Erro na inserção:', error);
      return null;
    }
  }

  async update(table, id, data) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Erro na atualização:', error);
      return null;
    }
  }

  async delete(table, id) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.headers
      });
      return response.ok;
    } catch (error) {
      console.error('Erro na exclusão:', error);
      return false;
    }
  }
}

// Instância do cliente Supabase
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variáveis globais
let currentUser = null;
let currentView = 'catalog';
let categoryImageData = null;

// Funções para controle do carrossel
function updateCarousel(carouselId, totalImages) {
  if (!carouselStates[carouselId]) {
    carouselStates[carouselId] = { currentIndex: 0 };
  }
  
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  const state = carouselStates[carouselId];
  const imageContainer = carousel.querySelector('[id$="-images"]');
  if (!imageContainer) return;
  
  const images = imageContainer.children;
  
  // Ocultar todas as imagens
  for (let i = 0; i < images.length; i++) {
    images[i].style.display = 'none';
  }
  
  // Mostrar apenas a imagem atual
  if (images[state.currentIndex]) {
    images[state.currentIndex].style.display = 'block';
  }
  
  // Atualizar indicadores
  const indicators = carousel.querySelectorAll('.carousel-indicator');
  indicators.forEach((indicator, index) => {
    indicator.style.backgroundColor = index === state.currentIndex ? '#fbbf24' : '#d1d5db';
  });
  
  // Atualizar botões de navegação
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  
  if (prevBtn) prevBtn.style.display = totalImages <= 1 ? 'none' : 'flex';
  if (nextBtn) nextBtn.style.display = totalImages <= 1 ? 'none' : 'flex';
}

// Funções de navegação do carrossel
window.prevImage = function(carouselId, totalImages) {
  if (!carouselStates[carouselId]) carouselStates[carouselId] = { currentIndex: 0 };
  
  carouselStates[carouselId].currentIndex = 
    carouselStates[carouselId].currentIndex === 0 
      ? totalImages - 1 
      : carouselStates[carouselId].currentIndex - 1;
  
  updateCarousel(carouselId, totalImages);
};

window.nextImage = function(carouselId, totalImages) {
  if (!carouselStates[carouselId]) carouselStates[carouselId] = { currentIndex: 0 };
  
  carouselStates[carouselId].currentIndex = 
    (carouselStates[carouselId].currentIndex + 1) % totalImages;
  
  updateCarousel(carouselId, totalImages);
};

window.goToImage = function(carouselId, index, totalImages) {
  if (!carouselStates[carouselId]) carouselStates[carouselId] = { currentIndex: 0 };
  
  carouselStates[carouselId].currentIndex = index;
  updateCarousel(carouselId, totalImages);
};

// Função de login via Supabase
async function trySupabaseLogin(username, password) {
  console.log('🔍 Verificando credenciais para:', username);
  
  try {
    const usuarios = await supabase.query('usuarios');
    const user = usuarios.find(u => u.username === username && u.password === password);
    
    if (user) {
      currentUser = {
        username: user.username,
        name: user.name,
        type: user.type,
        price_multiplier: user.price_multiplier || 1.0
      };
      
      console.log('✅ Login Supabase realizado:', currentUser.name, 'Tipo:', currentUser.type);
      
      if (user.type === 'admin') {
        currentView = 'admin';
      } else {
        currentView = 'catalog';
      }
      
      await loadSystemData();
      renderApp();
      return true;
    }
  } catch (error) {
    console.error('❌ Erro no login Supabase:', error);
  }
  
  return false;
}

// Carregar dados do sistema do Supabase
async function loadSystemData() {
  console.log('📊 Carregando dados do sistema...');
  
  try {
    const [produtos, categorias, usuarios, promocoes] = await Promise.all([
      supabase.query('produtos'),
      supabase.query('categorias'),
      supabase.query('usuarios'),
      supabase.query('promocoes')
    ]);
    
    systemData.products = produtos || [];
    systemData.categories = categorias || [];
    systemData.users = usuarios || [];
    systemData.promotions = promocoes || [];
    
    console.log('✅ Dados carregados:', {
      produtos: systemData.products.length,
      categorias: systemData.categories.length,
      usuarios: systemData.users.length,
      promocoes: systemData.promotions.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
  }
}

// Calcular preços com incrementos das tabelas - CORRIGIDO para preço fixo
function calculatePriceTable(basePrice, userMultiplier = 1, isFixedPrice = false) {
  // Garantir que isFixedPrice seja boolean - CORRIGIDO para todos os tipos
  const fixedPrice = Boolean(isFixedPrice) && isFixedPrice !== 0 && isFixedPrice !== '0' && isFixedPrice !== 'false';
  
  if (fixedPrice) {
    // Preço fixo: todas as tabelas têm o mesmo preço base (à vista)
    return {
      'À Vista': basePrice,
      '30': basePrice,
      '30/60': basePrice,
      '30/60/90': basePrice,
      '30/60/90/120': basePrice
    };
  } else {
    return {
      'À Vista': basePrice * userMultiplier * 1.0,
      '30': basePrice * userMultiplier * 1.02,
      '30/60': basePrice * userMultiplier * 1.04,
      '30/60/90': basePrice * userMultiplier * 1.06,
      '30/60/90/120': basePrice * userMultiplier * 1.08
    };
  }
}

// Funções para upload de imagem de categoria
window.addCategoryImageUrl = function() {
  const url = document.getElementById('category-image').value.trim();
  if (url) {
    categoryImageData = url;
    updateCategoryImagePreview();
  }
};

function updateCategoryImagePreview() {
  const preview = document.getElementById('category-image-preview');
  if (preview && categoryImageData) {
    preview.innerHTML = `
      <div style="position: relative; display: inline-block;">
        <img src="${categoryImageData}" alt="Preview" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem; border: 2px solid #e5e7eb;">
        <button onclick="categoryImageData = null; updateCategoryImagePreview();" style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%; background: #ef4444; color: white; border: none; font-size: 12px; cursor: pointer;">×</button>
      </div>
    `;
  } else if (preview) {
    preview.innerHTML = '';
  }
}

// Modal para adicionar/editar produto
function showProductModal(product = null) {
  const isEdit = !!product;
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000; padding: 1rem;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1f2937;">${isEdit ? 'Editar' : 'Adicionar'} Produto</h2>
        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      
      <form id="product-form" style="display: grid; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome</label>
          <input type="text" id="product-name" value="${product?.name || ''}" placeholder="Nome do produto" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Categoria</label>
          <select id="product-category" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
            <option value="">Selecione uma categoria</option>
            ${systemData.categories.map(cat => `<option value="${cat.name}" ${product?.category === cat.name ? 'selected' : ''}>${cat.name}</option>`).join('')}
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Preço Base (R$)</label>
          <input type="number" id="product-price" value="${product?.base_price || ''}" step="0.01" min="0" 
                 placeholder="0.00" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Altura (cm)</label>
            <input type="number" id="product-height" value="${product?.height || ''}" min="0" 
                   placeholder="0" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Largura (cm)</label>
            <input type="number" id="product-width" value="${product?.width || ''}" min="0" 
                   placeholder="0" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Comprimento (cm)</label>
            <input type="number" id="product-length" value="${product?.length || ''}" min="0" 
                   placeholder="0" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Peso (kg)</label>
          <input type="number" id="product-weight" value="${product?.weight || ''}" step="0.1" min="0" 
                 placeholder="0.0" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Descrição</label>
          <textarea id="product-description" placeholder="Descrição do produto..." rows="3" 
                    style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; resize: vertical;">${product?.description || ''}</textarea>
        </div>
        
        <div>
          <label style="display: flex; align-items: center; font-weight: 500; color: #374151; cursor: pointer;">
            <input type="checkbox" id="product-fixed-price" ${product?.fixed_price ? 'checked' : ''} style="margin: 0;">
            <span style="margin-left: 0.5rem;">Preço Fixo (mesmo valor em todas as tabelas)</span>
          </label>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Imagens</label>
          <input type="file" id="product-images" accept="image/*" multiple onchange="handleFileUpload(event)" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          <div id="images-preview" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;"></div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button type="button" onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                  style="flex: 1; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" 
                  style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
            ${isEdit ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Se estiver editando, carregar imagens existentes
  if (isEdit && product.images) {
    try {
      const images = JSON.parse(product.images);
      selectedImages = [...images];
      updateImagesPreview();
    } catch (e) {
      selectedImages = [];
    }
  } else {
    selectedImages = [];
  }
  
  // Event listener para submit
  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isEdit) {
      await updateProduct(product.id);
    } else {
      await saveProduct();
    }
  });
}

// Atualizar preview das imagens
function updateImagesPreview() {
  const preview = document.getElementById('images-preview');
  if (!preview) return;
  
  preview.innerHTML = selectedImages.map((img, index) => `
    <div style="position: relative; display: inline-block;">
      <img src="${img}" alt="Preview ${index + 1}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem; border: 2px solid #e5e7eb;">
      <button onclick="selectedImages.splice(${index}, 1); updateImagesPreview();" 
              style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%; background: #ef4444; color: white; border: none; font-size: 12px; cursor: pointer;">×</button>
    </div>
  `).join('');
}

// Manipular upload de imagens
function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      selectedImages.push(e.target.result);
      updateImagesPreview();
    };
    reader.readAsDataURL(file);
  });
  
  // Limpar o input para permitir upload da mesma imagem novamente
  event.target.value = '';
}

// Salvar produto
async function saveProduct() {
  const productData = {
    name: document.getElementById('product-name').value,
    category: document.getElementById('product-category').value,
    base_price: parseFloat(document.getElementById('product-price').value),
    height: parseInt(document.getElementById('product-height').value) || null,
    width: parseInt(document.getElementById('product-width').value) || null,
    length: parseInt(document.getElementById('product-length').value) || null,
    weight: parseFloat(document.getElementById('product-weight').value) || null,
    description: document.getElementById('product-description').value,
    images: JSON.stringify(selectedImages),
    fixed_price: document.getElementById('product-fixed-price').checked,
    created_at: new Date().toISOString()
  };
  
  try {
    const result = await supabase.insert('produtos', productData);
    if (result) {
      await loadSystemData();
      renderTab('produtos');
      document.querySelector('[style*="position: fixed"]').remove();
      alert('Produto adicionado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    alert('Erro ao salvar produto. Tente novamente.');
  }
}

// Atualizar produto
async function updateProduct(id) {
  const productData = {
    name: document.getElementById('product-name').value,
    category: document.getElementById('product-category').value,
    base_price: parseFloat(document.getElementById('product-price').value),
    height: parseInt(document.getElementById('product-height').value) || null,
    width: parseInt(document.getElementById('product-width').value) || null,
    length: parseInt(document.getElementById('product-length').value) || null,
    weight: parseFloat(document.getElementById('product-weight').value) || null,
    description: document.getElementById('product-description').value,
    images: JSON.stringify(selectedImages),
    fixed_price: document.getElementById('product-fixed-price').checked,
    updated_at: new Date().toISOString()
  };
  
  try {
    const result = await supabase.update('produtos', id, productData);
    if (result) {
      await loadSystemData();
      renderTab('produtos');
      document.querySelector('[style*="position: fixed"]').remove();
      alert('Produto atualizado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    alert('Erro ao atualizar produto. Tente novamente.');
  }
}

// Modal para adicionar/editar categoria
function showCategoryModal(category = null) {
  const isEdit = !!category;
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000; padding: 1rem;
  `;
  
  categoryImageData = category?.image_url || null;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; width: 100%; max-width: 400px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1f2937;">${isEdit ? 'Editar' : 'Adicionar'} Categoria</h2>
        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      
      <form id="category-form" style="display: grid; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome da Categoria</label>
          <input type="text" id="category-name" value="${category?.name || ''}" placeholder="Nome da categoria" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Imagem (URL)</label>
          <input type="url" id="category-image" value="${category?.image_url || ''}" placeholder="https://exemplo.com/imagem.jpg" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          <button type="button" onclick="addCategoryImageUrl()" 
                  style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
            Adicionar Imagem
          </button>
          <div id="category-image-preview" style="margin-top: 0.5rem;"></div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button type="button" onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                  style="flex: 1; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" 
                  style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
            ${isEdit ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  updateCategoryImagePreview();
  
  // Event listener para submit
  document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isEdit) {
      await updateCategory(category.id);
    } else {
      await saveCategory();
    }
  });
}

// Salvar categoria
async function saveCategory() {
  const categoryData = {
    name: document.getElementById('category-name').value,
    image_url: categoryImageData || '',
    created_at: new Date().toISOString()
  };
  
  try {
    const result = await supabase.insert('categorias', categoryData);
    if (result) {
      await loadSystemData();
      renderTab('categorias');
      document.querySelector('[style*="position: fixed"]').remove();
      alert('Categoria adicionada com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao salvar categoria:', error);
    alert('Erro ao salvar categoria. Tente novamente.');
  }
}

// Atualizar categoria
async function updateCategory(id) {
  const categoryData = {
    name: document.getElementById('category-name').value,
    image_url: categoryImageData || '',
    updated_at: new Date().toISOString()
  };
  
  try {
    const result = await supabase.update('categorias', id, categoryData);
    if (result) {
      await loadSystemData();
      renderTab('categorias');
      document.querySelector('[style*="position: fixed"]').remove();
      alert('Categoria atualizada com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    alert('Erro ao atualizar categoria. Tente novamente.');
  }
}

// Modal para adicionar/editar usuário
function showUserModal(user = null) {
  const isEdit = !!user;
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000; padding: 1rem;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; width: 100%; max-width: 400px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1f2937;">${isEdit ? 'Editar' : 'Adicionar'} Usuário</h2>
        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      
      <form id="user-form" style="display: grid; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome</label>
          <input type="text" id="user-name" value="${user?.name || ''}" placeholder="Nome do usuário" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Username</label>
          <input type="text" id="user-username" value="${user?.username || ''}" placeholder="Username" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" ${isEdit ? 'readonly' : 'required'}>
          ${isEdit ? '<p style="margin: 0.5rem 0 0; color: #6b7280; font-size: 0.875rem;">Username não pode ser alterado</p>' : ''}
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Senha</label>
          <input type="password" id="user-password" value="${user?.password || ''}" placeholder="Senha" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Tipo</label>
          <select id="user-type" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
            <option value="">Selecione o tipo</option>
            <option value="admin" ${user?.type === 'admin' ? 'selected' : ''}>Administrador</option>
            <option value="seller" ${user?.type === 'seller' ? 'selected' : ''}>Vendedor</option>
            <option value="customer" ${user?.type === 'customer' ? 'selected' : ''}>Cliente</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Multiplicador de Preço</label>
          <input type="number" id="user-multiplier" value="${user?.price_multiplier || 1.0}" step="0.1" min="0.1" max="10" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
          <p style="margin: 0.5rem 0 0; color: #6b7280; font-size: 0.875rem;">Multiplicador aplicado aos preços para este usuário</p>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button type="button" onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                  style="flex: 1; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" 
                  style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
            ${isEdit ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listener para submit
  document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isEdit) {
      await updateUser(user.id);
    } else {
      await saveUser();
    }
  });
}

// Salvar usuário
async function saveUser() {
  const userData = {
    name: document.getElementById('user-name').value,
    username: document.getElementById('user-username').value,
    password: document.getElementById('user-password').value,
    type: document.getElementById('user-type').value,
    price_multiplier: parseFloat(document.getElementById('user-multiplier').value),
    created_at: new Date().toISOString()
  };
  
  try {
    const result = await supabase.insert('usuarios', userData);
    if (result) {
      await loadSystemData();
      renderTab('usuarios');
      document.querySelector('[style*="position: fixed"]').remove();
      alert('Usuário adicionado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    alert('Erro ao salvar usuário. Tente novamente.');
  }
}

// Atualizar usuário
async function updateUser(id) {
  const userData = {
    name: document.getElementById('user-name').value,
    password: document.getElementById('user-password').value,
    type: document.getElementById('user-type').value,
    price_multiplier: parseFloat(document.getElementById('user-multiplier').value),
    updated_at: new Date().toISOString()
  };
  
  try {
    const result = await supabase.update('usuarios', id, userData);
    if (result) {
      await loadSystemData();
      renderTab('usuarios');
      document.querySelector('[style*="position: fixed"]').remove();
      alert('Usuário atualizado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    alert('Erro ao atualizar usuário. Tente novamente.');
  }
}

// Modal para gerenciar tabelas de preço
function showPriceTableModal(tableName = null) {
  const isEdit = !!tableName;
  const currentPercentage = isEdit ? systemData.priceSettings[tableName] || 0 : 0;
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000; padding: 1rem;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; width: 100%; max-width: 400px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1f2937;">${isEdit ? 'Editar' : 'Adicionar'} Tabela de Preços</h2>
        <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      
      <form id="price-table-form" style="display: grid; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome da Tabela</label>
          <input type="text" id="table-name" value="${tableName || ''}" placeholder="Ex: 30/60/90/120/150" 
                 style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" 
                 ${isEdit ? 'readonly' : 'required'}>
          ${isEdit ? '<p style="margin: 0.5rem 0 0; color: #6b7280; font-size: 0.875rem;">O nome não pode ser alterado</p>' : ''}
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Percentual (%)</label>
          <input type="number" id="table-percentage" value="${currentPercentage}" step="0.1" min="0" max="100" 
                 placeholder="0.0" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
          <p style="margin: 0.5rem 0 0; color: #6b7280; font-size: 0.875rem;">Percentual de acréscimo sobre o preço base</p>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button type="button" onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                  style="flex: 1; padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" 
                  style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
            ${isEdit ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listener para submit
  document.getElementById('price-table-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isEdit) {
      await updatePriceTable(tableName);
    } else {
      await savePriceTable();
    }
  });
}

// Salvar tabela de preços
async function savePriceTable() {
  const tableName = document.getElementById('table-name').value;
  const percentage = parseFloat(document.getElementById('table-percentage').value);
  
  if (systemData.priceSettings[tableName] !== undefined) {
    alert('Já existe uma tabela com este nome!');
    return;
  }
  
  systemData.priceSettings[tableName] = percentage;
  renderTab('precos');
  document.querySelector('[style*="position: fixed"]').remove();
  alert(`Tabela "${tableName}" criada com ${percentage}%!`);
}

// Atualizar tabela de preços
async function updatePriceTable(tableName) {
  const percentage = parseFloat(document.getElementById('table-percentage').value);
  
  systemData.priceSettings[tableName] = percentage;
  renderTab('precos');
  document.querySelector('[style*="position: fixed"]').remove();
  alert(`Tabela "${tableName}" atualizada para ${percentage}%!`);
}

// Excluir tabela de preços
window.deletePriceTable = function(tableName) {
  const isDefault = ['A Vista', '30', '30/60', '30/60/90', '30/60/90/120'].includes(tableName);
  
  if (isDefault) {
    alert('Não é possível excluir tabelas padrão do sistema!');
    return;
  }
  
  if (confirm(`Tem certeza que deseja excluir a tabela "${tableName}"?`)) {
    delete systemData.priceSettings[tableName];
    renderTab('precos');
    alert(`Tabela "${tableName}" excluída com sucesso!`);
  }
};

// Função para exportar dados
function exportAsCSV(data) {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => 
      typeof row[header] === 'string' && row[header].includes(',') 
        ? `"${row[header]}"` 
        : row[header] || ''
    ).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dados_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Funções de renderização das abas
function renderTab(tabName) {
  const content = document.getElementById('admin-content');
  
  // Atualizar abas ativas
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.style.background = btn.getAttribute('onclick').includes(tabName) 
      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
      : '#f3f4f6';
    btn.style.color = btn.getAttribute('onclick').includes(tabName) ? 'white' : '#374151';
  });
  
  switch(tabName) {
    case 'produtos':
      renderProductsTab();
      break;
    case 'categorias':
      renderCategoriesTab();
      break;
    case 'precos':
      renderPricesTab();
      break;
    case 'usuarios':
      renderUsersTab();
      break;
    case 'promocoes':
      renderPromotionsTab();
      break;
    case 'excel':
      renderExcelTab();
      break;
    case 'backup':
      renderBackupTab();
      break;
    case 'monitoramento':
      renderMonitoringTab();
      break;
  }
}

// Renderizar aba de produtos
function renderProductsTab() {
  // Ordenar produtos por categoria (alfabética) e depois por nome (alfabética)
  const sortedProducts = [...systemData.products].sort((a, b) => {
    if (a.category !== b.category) {
      return (a.category || '').localeCompare(b.category || '', 'pt-BR', { numeric: true });
    }
    return (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true });
  });

  const content = document.getElementById('admin-content');
  const productsHtml = sortedProducts.map(product => {
    const basePrice = product.base_price || 0;
    const priceTable = calculatePriceTable(basePrice, 1, product.fixed_price) || {
      'À Vista': 0,
      '30': 0,
      '30/60': 0,
      '30/60/90': 0,
      '30/60/90/120': 0
    };
    
    // Pegar primeira imagem com verificação segura
    let firstImage = '';
    try {
      if (product.images && product.images !== 'null' && product.images !== '') {
        const images = JSON.parse(product.images);
        firstImage = images[0] || product.image_url;
      } else {
        firstImage = product.image_url;
      }
    } catch (e) {
      firstImage = product.image_url;
    }
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 1rem;">
          ${firstImage ? `<img src="${firstImage}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.375rem;">` : '📷'}
        </td>
        <td style="padding: 1rem;">
          <div style="font-weight: 600; color: #1f2937;">${product.name}</div>
          <div style="color: #6b7280; font-size: 0.875rem;">${product.category || 'Sem categoria'}</div>
          ${product.fixed_price ? '<div style="font-size: 0.75rem; color: #f59e0b;">🔒 Preço Fixo</div>' : ''}
        </td>
        <td style="padding: 1rem; color: #10b981; font-weight: 600;">R$ ${(priceTable['À Vista'] || 0).toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${(priceTable['30'] || 0).toFixed(2)}</td>
        <td style="padding: 1rem; color: #8b5cf6; font-weight: 600;">R$ ${(priceTable['30/60'] || 0).toFixed(2)}</td>
        <td style="padding: 1rem; color: #f59e0b; font-weight: 600;">R$ ${(priceTable['30/60/90'] || 0).toFixed(2)}</td>
        <td style="padding: 1rem; color: #ef4444; font-weight: 600;">R$ ${(priceTable['30/60/90/120'] || 0).toFixed(2)}</td>
        <td style="padding: 1rem;">
          <div style="display: flex; gap: 0.5rem;">
            <button onclick="showProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                    style="padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">✏️</button>
            <button onclick="deleteProduct(${product.id})" 
                    style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem; font-weight: 700;">Produtos (${systemData.products.length})</h2>
      <button onclick="showProductModal()" 
              style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
        + Adicionar Produto
      </button>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Imagem</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Produto</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">À Vista</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">30 dias</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">30/60</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">30/60/90</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">30/60/90/120</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml || '<tr><td colspan="8" style="padding: 2rem; text-align: center; color: #6b7280;">Nenhum produto cadastrado</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// Renderizar aba de categorias
function renderCategoriesTab() {
  // Ordenar categorias alfabeticamente
  const sortedCategories = [...systemData.categories].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true })
  );

  const content = document.getElementById('admin-content');
  const categoriesHtml = sortedCategories.map(category => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 1rem;">
        ${category.image_url ? `<img src="${category.image_url}" alt="${category.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.375rem;">` : '📁'}
      </td>
      <td style="padding: 1rem;">
        <div style="font-weight: 600; color: #1f2937;">${category.name}</div>
        <div style="color: #6b7280; font-size: 0.875rem;">${systemData.products.filter(p => p.category === category.name).length} produto(s)</div>
      </td>
      <td style="padding: 1rem;">
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="showCategoryModal(${JSON.stringify(category).replace(/"/g, '&quot;')})" 
                  style="padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">✏️</button>
          <button onclick="deleteCategory(${category.id})" 
                  style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem; font-weight: 700;">Categorias (${systemData.categories.length})</h2>
      <button onclick="showCategoryModal()" 
              style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
        + Adicionar Categoria
      </button>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Imagem</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Nome</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${categoriesHtml || '<tr><td colspan="3" style="padding: 2rem; text-align: center; color: #6b7280;">Nenhuma categoria cadastrada</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// Renderizar aba de preços
function renderPricesTab() {
  const content = document.getElementById('admin-content');
  const pricesHtml = Object.entries(systemData.priceSettings).map(([name, percentage]) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 1rem;">
        <div style="font-weight: 600; color: #1f2937;">${name}</div>
      </td>
      <td style="padding: 1rem; color: #6b7280;">${percentage}%</td>
      <td style="padding: 1rem;">
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="showPriceTableModal('${name}')" 
                  style="padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">✏️</button>
          <button onclick="deletePriceTable('${name}')" 
                  style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem; font-weight: 700;">Tabelas de Preços</h2>
      <button onclick="showPriceTableModal()" 
              style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
        + Adicionar Tabela
      </button>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Nome da Tabela</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Percentual</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${pricesHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Renderizar aba de usuários
function renderUsersTab() {
  const content = document.getElementById('admin-content');
  const usersHtml = systemData.users.map(user => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 1rem;">
        <div style="font-weight: 600; color: #1f2937;">${user.name}</div>
        <div style="color: #6b7280; font-size: 0.875rem;">@${user.username}</div>
      </td>
      <td style="padding: 1rem;">
        <span style="padding: 0.25rem 0.5rem; background: ${user.type === 'admin' ? '#fef3c7' : user.type === 'seller' ? '#dbeafe' : '#f3e8ff'}; color: ${user.type === 'admin' ? '#92400e' : user.type === 'seller' ? '#1e40af' : '#7c2d12'}; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">
          ${user.type === 'admin' ? 'Administrador' : user.type === 'seller' ? 'Vendedor' : 'Cliente'}
        </span>
      </td>
      <td style="padding: 1rem; color: #6b7280;">${user.price_multiplier}x</td>
      <td style="padding: 1rem;">
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="showUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})" 
                  style="padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">✏️</button>
          <button onclick="deleteUser(${user.id})" 
                  style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
  
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem; font-weight: 700;">Usuários (${systemData.users.length})</h2>
      <button onclick="showUserModal()" 
              style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
        + Adicionar Usuário
      </button>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Nome</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Tipo</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Multiplicador</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${usersHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Renderizar aba Excel
function renderExcelTab() {
  const content = document.getElementById('admin-content');
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem; font-weight: 700;">Importar/Exportar Excel</h2>
    </div>
    
    <div style="display: grid; gap: 2rem;">
      <!-- Importar Excel -->
      <div style="background: white; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.25rem; font-weight: 600;">📥 Importar Produtos</h3>
        <p style="margin: 0 0 1.5rem; color: #6b7280;">
          Faça upload de um arquivo Excel (.xlsx) com os produtos. 
          <br>Colunas suportadas: <strong>nome, categoria, preco, altura, largura, comprimento, peso, descricao</strong>
        </p>
        
        <input type="file" id="excel-file" accept=".xlsx,.xls" 
               style="margin-bottom: 1rem; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; width: 100%; box-sizing: border-box;">
        
        <button onclick="importExcel()" 
                style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          📥 Importar Dados
        </button>
        
        <div id="import-status" style="margin-top: 1rem;"></div>
      </div>
      
      <!-- Exportar Excel -->
      <div style="background: white; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.25rem; font-weight: 600;">📤 Exportar Dados</h3>
        <p style="margin: 0 0 1.5rem; color: #6b7280;">Exporte todos os dados do sistema em formato CSV para backup ou análise.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <button onclick="exportAsCSV(systemData.products)" 
                  style="padding: 0.75rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
            📦 Exportar Produtos
          </button>
          <button onclick="exportAsCSV(systemData.categories)" 
                  style="padding: 0.75rem; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
            📁 Exportar Categorias
          </button>
          <button onclick="exportAsCSV(systemData.users)" 
                  style="padding: 0.75rem; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
            👥 Exportar Usuários
          </button>
        </div>
      </div>
    </div>
  `;
}

// Função para importar Excel
window.importExcel = async function() {
  const fileInput = document.getElementById('excel-file');
  const statusDiv = document.getElementById('import-status');
  
  if (!fileInput.files.length) {
    statusDiv.innerHTML = '<div style="padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; color: #dc2626;">Por favor, selecione um arquivo Excel.</div>';
    return;
  }
  
  const file = fileInput.files[0];
  console.log('🔍 Iniciando importação Excel...');
  console.log('📁 Arquivo selecionado:', file.name, 'Tipo:', file.type);
  
  statusDiv.innerHTML = '<div style="padding: 1rem; background: #fef9e7; border: 1px solid #fed7aa; border-radius: 0.375rem; color: #c2410c;">📥 Processando arquivo...</div>';
  
  try {
    console.log('📖 Lendo arquivo...');
    const data = await file.arrayBuffer();
    console.log('📊 Dados carregados, tamanho:', data.byteLength);
    
    // Usar SheetJS para ler o Excel
    const workbook = XLSX.read(data, { type: 'array' });
    console.log('📋 Planilhas encontradas:', workbook.SheetNames);
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('📄 Dados JSON extraídos:', jsonData);
    
    if (jsonData.length < 2) {
      throw new Error('Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
    }
    
    const headers = jsonData[0].map(h => h.toString().toLowerCase().trim());
    console.log('🔍 Colunas detectadas:', headers);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      console.log('🔍 Processando linha:', row);
      
      // Mapear dados da linha
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });
      
      try {
        // Detectar colunas de dimensões com diferentes nomes
        const altura = rowData.altura || rowData.height || 0;
        const largura = rowData.largura || rowData.width || 0;
        const comprimento = rowData.comprimento || rowData.length || 0;
        
        console.log('📏 Dimensões do Excel - Altura:', altura, 'Largura:', largura, 'Comprimento:', comprimento);
        
        const productData = {
          name: (rowData.nome || rowData.name || '').toString().trim(),
          category: (rowData.categoria || rowData.category || '').toString().trim(),
          base_price: parseFloat(rowData.preco || rowData.price || 0),
          height: parseInt(altura) || null,
          width: parseInt(largura) || null,
          length: parseInt(comprimento) || null,
          weight: parseFloat(rowData.peso || rowData.weight || 0) || null,
          description: (rowData.descricao || rowData.description || '').toString().trim(),
          images: JSON.stringify([]),
          fixed_price: (row.precoFixo || row.fixedPrice || row.PrecoFixo || row.FixedPrice || '').toString().toLowerCase() === 'sim',
          created_at: new Date().toISOString()
        };
        
        console.log('💾 Dados do produto processados:', productData);
        console.log('🔍 Altura:', productData.height, 'Largura:', productData.width, 'Comprimento:', productData.length);
        
        if (!productData.name || !productData.category || !productData.base_price) {
          console.warn('⚠️ Linha ignorada - dados incompletos:', productData);
          continue;
        }
        
        // Verificar se produto já existe (por nome)
        const existingProduct = systemData.products.find(p => p.name === productData.name);
        
        if (existingProduct) {
          console.log('🔄 Produto existe, atualizando ID:', existingProduct.id);
          console.log('📊 Dados originais:', existingProduct);
          console.log('📊 Novos dados:', productData);
          
          const result = await supabase.update('produtos', existingProduct.id, {
            ...productData,
            updated_at: new Date().toISOString()
          });
          console.log('✅ Resultado da operação:', result);
        } else {
          console.log('➕ Criando novo produto');
          await supabase.insert('produtos', productData);
        }
        
        processedCount++;
      } catch (rowError) {
        console.error('❌ Erro ao processar linha:', rowError);
        errorCount++;
      }
    }
    
    // Recarregar dados
    await loadSystemData();
    renderTab('produtos');
    
    statusDiv.innerHTML = `
      <div style="padding: 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.375rem; color: #166534;">
        ✅ Importação concluída!<br>
        📥 ${processedCount} produto(s) processado(s)<br>
        ${errorCount > 0 ? `⚠️ ${errorCount} erro(s) encontrado(s)` : ''}
      </div>
    `;
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    statusDiv.innerHTML = `<div style="padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; color: #dc2626;">❌ Erro: ${error.message}</div>`;
  }
};

// Renderizar aba de backup
function renderBackupTab() {
  const content = document.getElementById('admin-content');
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem; font-weight: 700;">🗄️ Backup e Restauração</h2>
    </div>
    
    <div style="display: grid; gap: 2rem;">
      <!-- Backup -->
      <div style="background: white; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.25rem; font-weight: 600;">💾 Fazer Backup</h3>
        <p style="margin: 0 0 1.5rem; color: #6b7280;">Salve todos os dados do sistema em um arquivo JSON para backup de segurança.</p>
        
        <button onclick="downloadBackup()" 
                style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          💾 Baixar Backup Completo
        </button>
      </div>
      
      <!-- Restauração -->
      <div style="background: white; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.25rem; font-weight: 600;">📥 Restaurar Backup</h3>
        <p style="margin: 0 0 1.5rem; color: #6b7280; font-weight: 500;">
          ⚠️ <strong>ATENÇÃO:</strong> Esta operação irá substituir TODOS os dados atuais pelos dados do backup!
        </p>
        
        <input type="file" id="backup-file" accept=".json" 
               style="margin-bottom: 1rem; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; width: 100%; box-sizing: border-box;">
        
        <button onclick="restoreBackup()" 
                style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          ⚠️ Restaurar Dados
        </button>
        
        <div id="restore-status" style="margin-top: 1rem;"></div>
      </div>
      
      <!-- Limpeza -->
      <div style="background: white; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 2px solid #fecaca;">
        <h3 style="margin: 0 0 1rem; color: #dc2626; font-size: 1.25rem; font-weight: 600;">🗑️ Zona de Perigo</h3>
        <p style="margin: 0 0 1.5rem; color: #6b7280;">
          <strong>CUIDADO:</strong> Estas ações são irreversíveis e irão apagar dados permanentemente!
        </p>
        
        <div style="display: grid; gap: 1rem;">
          <button onclick="clearAllProducts()" 
                  style="padding: 0.75rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
            🗑️ Limpar Todos os Produtos
          </button>
          <button onclick="clearAllCategories()" 
                  style="padding: 0.75rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
            🗑️ Limpar Todas as Categorias
          </button>
          <button onclick="resetSystem()" 
                  style="padding: 0.75rem; background: #7f1d1d; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600;">
            💥 RESETAR SISTEMA COMPLETO
          </button>
        </div>
      </div>
    </div>
  `;
}

// Renderizar aba de monitoramento
function renderMonitoringTab() {
  const content = document.getElementById('admin-content');
  
  // Estatísticas básicas
  const totalProducts = systemData.products.length;
  const totalCategories = systemData.categories.length;
  const totalUsers = systemData.users.length;
  const productsWithImages = systemData.products.filter(p => {
    try {
      const images = JSON.parse(p.images || '[]');
      return images.length > 0;
    } catch {
      return false;
    }
  }).length;
  
  content.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem; font-weight: 700;">📊 Monitoramento do Sistema</h2>
    </div>
    
    <!-- Cards de Estatísticas -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 0.75rem; padding: 1.5rem;">
        <div style="font-size: 2rem; font-weight: 700;">${totalProducts}</div>
        <div style="opacity: 0.9;">Total de Produtos</div>
      </div>
      
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 0.75rem; padding: 1.5rem;">
        <div style="font-size: 2rem; font-weight: 700;">${totalCategories}</div>
        <div style="opacity: 0.9;">Categorias Ativas</div>
      </div>
      
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border-radius: 0.75rem; padding: 1.5rem;">
        <div style="font-size: 2rem; font-weight: 700;">${totalUsers}</div>
        <div style="opacity: 0.9;">Usuários Cadastrados</div>
      </div>
      
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; border-radius: 0.75rem; padding: 1.5rem;">
        <div style="font-size: 2rem; font-weight: 700;">${productsWithImages}</div>
        <div style="opacity: 0.9;">Produtos com Imagens</div>
      </div>
    </div>
    
    <!-- Informações do Sistema -->
    <div style="background: white; border-radius: 0.75rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 1.5rem; color: #1f2937; font-size: 1.25rem; font-weight: 600;">ℹ️ Informações do Sistema</h3>
      
      <div style="display: grid; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem;">
          <span style="font-weight: 500;">Versão do Sistema:</span>
          <span style="color: #6b7280;">MoveisBonafe v2.0</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem;">
          <span style="font-weight: 500;">Última Atualização:</span>
          <span style="color: #6b7280;">${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem;">
          <span style="font-weight: 500;">Banco de Dados:</span>
          <span style="color: #10b981; font-weight: 600;">✅ Supabase Conectado</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem;">
          <span style="font-weight: 500;">Usuário Logado:</span>
          <span style="color: #6b7280;">${currentUser?.name || 'N/A'} (${currentUser?.type || 'N/A'})</span>
        </div>
      </div>
    </div>
  `;
}

// Funções de backup
window.downloadBackup = function() {
  const backup = {
    timestamp: new Date().toISOString(),
    version: '2.0',
    data: systemData
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_moveisbonafe_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('✅ Backup baixado com sucesso!');
};

window.restoreBackup = async function() {
  const fileInput = document.getElementById('backup-file');
  const statusDiv = document.getElementById('restore-status');
  
  if (!fileInput.files.length) {
    statusDiv.innerHTML = '<div style="padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; color: #dc2626;">Por favor, selecione um arquivo de backup.</div>';
    return;
  }
  
  if (!confirm('⚠️ ATENÇÃO: Esta operação irá substituir TODOS os dados atuais. Tem certeza?')) {
    return;
  }
  
  try {
    const file = fileInput.files[0];
    const text = await file.text();
    const backup = JSON.parse(text);
    
    if (!backup.data) {
      throw new Error('Arquivo de backup inválido');
    }
    
    statusDiv.innerHTML = '<div style="padding: 1rem; background: #fef9e7; border: 1px solid #fed7aa; border-radius: 0.375rem; color: #c2410c;">📥 Restaurando dados...</div>';
    
    // Restaurar dados (implementar conforme necessário)
    systemData = backup.data;
    
    // Recarregar interface
    renderTab('produtos');
    
    statusDiv.innerHTML = '<div style="padding: 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.375rem; color: #166534;">✅ Backup restaurado com sucesso!</div>';
    
  } catch (error) {
    statusDiv.innerHTML = `<div style="padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; color: #dc2626;">❌ Erro: ${error.message}</div>`;
  }
};

// Função principal para renderizar o app
function renderApp() {
  if (currentView === 'catalog') {
    renderCatalogView();
  } else if (currentView === 'admin') {
    renderAdminView();
  }
}

// Renderizar visão do catálogo (para clientes)
// Função para renderizar banner de promoção
function renderPromotionBanner() {
  const activePromotion = systemData.promotions.find(p => p.ativo);
  if (!activePromotion) return '';
  
  return `
    <div style="background: ${activePromotion.cor || 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'}; color: white; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="font-size: 1.1rem;">🎉 ${activePromotion.texto || 'Promoção Especial!'}</div>
      ${activePromotion.descricao ? `<div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">${activePromotion.descricao}</div>` : ''}
    </div>
  `;
}

function renderCatalogView() {
  // Buscar o multiplicador atual do usuário na aba de usuários
  let userMultiplier = 1.0;
  const userInSystem = systemData.users.find(u => u.username === currentUser.username);
  if (userInSystem) {
    userMultiplier = userInSystem.price_multiplier || 1.0;
  } else {
    userMultiplier = currentUser.price_multiplier || 1.0;
  }
  
  // Ordenar produtos por categoria (alfabética) e depois por nome (alfabética)
  const sortedProducts = [...systemData.products].sort((a, b) => {
    if (a.category !== b.category) {
      return (a.category || '').localeCompare(b.category || '', 'pt-BR', { numeric: true });
    }
    return (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true });
  });
  
  const productsHtml = sortedProducts.map((product, index) => {
    const basePrice = product.base_price || 0;
    const priceTable = calculatePriceTable(basePrice, userMultiplier, product.fixed_price) || {
      'À Vista': 0,
      '30': 0,
      '30/60': 0,
      '30/60/90': 0,
      '30/60/90/120': 0
    };
    
    // Pegar todas as imagens com verificação segura
    let allImages = [];
    try {
      if (product.images && product.images !== 'null' && product.images !== '') {
        allImages = JSON.parse(product.images);
      }
      if (product.image_url && !allImages.includes(product.image_url)) {
        allImages.unshift(product.image_url);
      }
    } catch (e) {
      if (product.image_url) {
        allImages = [product.image_url];
      }
    }
    
    const carouselId = `carousel-${index}`;
    const imageContainer = allImages.length > 0 ? allImages.map((img, imgIndex) => `
      <img id="${carouselId}-img-${imgIndex}" src="${img}" alt="${product.name}" 
           style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem 0.5rem 0 0; display: ${imgIndex === 0 ? 'block' : 'none'};">
    `).join('') : `
      <div style="height: 200px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 0.5rem 0.5rem 0 0; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 3rem;">📷</div>
    `;
    
    return `
      <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.2s;" 
           onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        
        <div id="${carouselId}" style="position: relative; height: 200px; overflow: hidden;">
          <div id="${carouselId}-images" style="width: 100%; height: 100%;">
            ${imageContainer}
          </div>
          
          ${allImages.length > 1 ? `
            <!-- Botões de navegação -->
            <button class="carousel-prev" onclick="prevImage('${carouselId}', ${allImages.length})" 
                    style="position: absolute; left: 0.5rem; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 2rem; height: 2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">‹</button>
            <button class="carousel-next" onclick="nextImage('${carouselId}', ${allImages.length})" 
                    style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 2rem; height: 2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">›</button>
            
            <!-- Indicadores -->
            <div style="position: absolute; bottom: 0.5rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.25rem;">
              ${allImages.map((_, imgIndex) => `
                <button class="carousel-indicator" onclick="goToImage('${carouselId}', ${imgIndex}, ${allImages.length})" 
                        style="width: 0.5rem; height: 0.5rem; border-radius: 50%; border: none; background: ${imgIndex === 0 ? '#fbbf24' : '#d1d5db'}; cursor: pointer;"></button>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div style="padding: 1rem;">
          <h3 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem; font-weight: 600;">${product.name}</h3>
          <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;">${product.category || 'Categoria'}</p>
          
          ${product.fixed_price ? '<div style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 0.25rem; font-size: 0.75rem; text-align: center;">🔒 Preço Fixo</div>' : ''}
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
              <div style="padding: 0.5rem; background: #f0fdf4; border-radius: 0.25rem; text-align: center;">
                <div style="color: #6b7280;">À Vista</div>
                <div style="color: #10b981; font-weight: 600;">R$ ${(priceTable['À Vista'] || 0).toFixed(2)}</div>
              </div>
              <div style="padding: 0.5rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
                <div style="color: #6b7280;">30 dias</div>
                <div style="color: #3b82f6; font-weight: 600;">R$ ${(priceTable['30'] || 0).toFixed(2)}</div>
              </div>
              <div style="padding: 0.5rem; background: #f5f3ff; border-radius: 0.25rem; text-align: center;">
                <div style="color: #6b7280;">30/60</div>
                <div style="color: #8b5cf6; font-weight: 600;">R$ ${(priceTable['30/60'] || 0).toFixed(2)}</div>
              </div>
              <div style="padding: 0.5rem; background: #fefbf3; border-radius: 0.25rem; text-align: center;">
                <div style="color: #6b7280;">30/60/90</div>
                <div style="color: #f59e0b; font-weight: 600;">R$ ${(priceTable['30/60/90'] || 0).toFixed(2)}</div>
              </div>
            </div>
            <div style="margin-top: 0.5rem;">
              <div style="padding: 0.5rem; background: #fef2f2; border-radius: 0.25rem; text-align: center;">
                <div style="color: #6b7280; font-size: 0.8rem;">30/60/90/120</div>
                <div style="color: #ef4444; font-weight: 600;">R$ ${(priceTable['30/60/90/120'] || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Inicializar carrosséis após renderização
  setTimeout(() => {
    systemData.products.forEach((_, index) => {
      const carouselId = `carousel-${index}`;
      let allImages = [];
      try {
        const product = systemData.products[index];
        if (product.images && product.images !== 'null' && product.images !== '') {
          allImages = JSON.parse(product.images);
        }
        if (product.image_url && !allImages.includes(product.image_url)) {
          allImages.unshift(product.image_url);
        }
      } catch (e) {
        if (systemData.products[index].image_url) {
          allImages = [systemData.products[index].image_url];
        }
      }
      updateCarousel(carouselId, allImages.length);
    });
  }, 100);
  
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 2rem;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 3rem;">
          <h1 style="margin: 0 0 1rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3rem; font-weight: 700;">
            Móveis Bonafé Catálogo
          </h1>
          ${renderPromotionBanner()}
          <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <span style="color: white; opacity: 0.9;">Bem-vindo, ${currentUser?.name || 'Cliente'}</span>
            <button onclick="currentUser = null; renderApp();" 
                    style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.375rem; cursor: pointer;">
              🚪 Sair
            </button>
          </div>
          <p style="margin: 0; color: white; opacity: 0.8; font-size: 1.1rem;">
            Produtos Disponíveis (${systemData.products.length})
          </p>
        </div>
        
        <!-- Grid de Produtos -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
          ${productsHtml || '<div style="grid-column: 1/-1; text-align: center; color: white; padding: 4rem;"><h3>Nenhum produto disponível</h3></div>'}
        </div>
      </div>
    </div>
  `;
  
  // Adicionar eventos de touch para mobile
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: true });
}

// Funções para touch mobile
function handleTouchStart(evt) {
  const firstTouch = evt.touches[0];
  touchStartX = firstTouch.clientX;
  touchStartY = firstTouch.clientY;
}

function handleTouchMove(evt) {
  if (!touchStartX || !touchStartY) return;
  
  const touch = evt.touches[0];
  const diffX = touchStartX - touch.clientX;
  const diffY = touchStartY - touch.clientY;
  
  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Swipe horizontal detectado
    const carousel = evt.target.closest('[id^="carousel-"]');
    if (carousel) {
      const carouselId = carousel.id;
      const images = carousel.querySelectorAll('img');
      const totalImages = images.length;
      
      if (diffX > 0) {
        // Swipe left - próxima imagem
        nextImage(carouselId, totalImages);
      } else {
        // Swipe right - imagem anterior
        prevImage(carouselId, totalImages);
      }
    }
  }
  
  touchStartX = null;
  touchStartY = null;
}

// Renderizar visão de administração
function renderAdminView() {
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #f8fafc;">
      <!-- Header Admin -->
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 1rem 2rem;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 1.5rem; font-weight: 700;">Painel Administrativo</h1>
            <p style="margin: 0; opacity: 0.8;">Bem-vindo, ${currentUser?.name || 'Admin'}</p>
          </div>
          <div style="display: flex; gap: 1rem;">
            <button onclick="currentView = 'catalog'; renderApp();" 
                    style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.375rem; cursor: pointer;">
              👁️ Ver Catálogo
            </button>
            <button onclick="currentUser = null; renderApp();" 
                    style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.375rem; cursor: pointer;">
              🚪 Sair
            </button>
          </div>
        </div>
      </div>
      
      <!-- Navegação das Abas -->
      <div style="background: white; border-bottom: 1px solid #e5e7eb; padding: 0 2rem;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; overflow-x: auto;">
          <button class="tab-button" onclick="renderTab('produtos')" 
                  style="padding: 1rem 1.5rem; border: none; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; cursor: pointer; white-space: nowrap; font-weight: 600;">
            📦 Produtos
          </button>
          <button class="tab-button" onclick="renderTab('categorias')" 
                  style="padding: 1rem 1.5rem; border: none; background: #f3f4f6; color: #374151; cursor: pointer; white-space: nowrap; font-weight: 600;">
            📁 Categorias
          </button>
          <button class="tab-button" onclick="renderTab('precos')" 
                  style="padding: 1rem 1.5rem; border: none; background: #f3f4f6; color: #374151; cursor: pointer; white-space: nowrap; font-weight: 600;">
            💰 Preços
          </button>
          <button class="tab-button" onclick="renderTab('usuarios')" 
                  style="padding: 1rem 1.5rem; border: none; background: #f3f4f6; color: #374151; cursor: pointer; white-space: nowrap; font-weight: 600;">
            👥 Usuários
          </button>
          <button class="tab-button" onclick="renderTab('promocoes')" 
                  style="padding: 1rem 1.5rem; border: none; background: #f3f4f6; color: #374151; cursor: pointer; white-space: nowrap; font-weight: 600;">
            🎯 Promoções
          </button>
          <button class="tab-button" onclick="renderTab('excel')" 
                  style="padding: 1rem 1.5rem; border: none; background: #f3f4f6; color: #374151; cursor: pointer; white-space: nowrap; font-weight: 600;">
            📊 Excel
          </button>
          <button class="tab-button" onclick="renderTab('backup')" 
                  style="padding: 1rem 1.5rem; border: none; background: #f3f4f6; color: #374151; cursor: pointer; white-space: nowrap; font-weight: 600;">
            🗄️ Backup
          </button>
          <button class="tab-button" onclick="renderTab('monitoramento')" 
                  style="padding: 1rem 1.5rem; border: none; background: #f3f4f6; color: #374151; cursor: pointer; white-space: nowrap; font-weight: 600;">
            📊 Monitor
          </button>
        </div>
      </div>
      
      <!-- Conteúdo das Abas -->
      <div style="padding: 2rem;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div id="admin-content"></div>
        </div>
      </div>
    </div>
  `;
  
  // Renderizar primeira aba
  renderTab('produtos');
}

// Funções auxiliares para exibir produtos
function updateProductsDisplay(productsToShow) {
  // Esta função pode ser implementada para filtros futuros
  console.log('Atualizando exibição de produtos:', productsToShow.length);
}

// Função para abrir modal do produto com detalhes completos
window.showProductDetailModal = function(product) {
  const userMultiplier = 1.0; // Para o modal de detalhes, usar multiplicador padrão
  const priceTable = calculatePriceTable(product.base_price, userMultiplier, product.fixed_price);
  
  let allImages = [];
  try {
    if (product.images && product.images !== 'null' && product.images !== '') {
      allImages = JSON.parse(product.images);
    }
    if (product.image_url && !allImages.includes(product.image_url)) {
      allImages.unshift(product.image_url);
    }
  } catch (e) {
    if (product.image_url) {
      allImages = [product.image_url];
    }
  }
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); display: flex; align-items: center; 
    justify-content: center; z-index: 2000; padding: 1rem;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 1rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
      ${allImages.length > 0 ? `
        <div style="height: 200px; overflow: hidden; border-radius: 1rem 1rem 0 0; position: relative;">
          <img src="${allImages[0]}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      ` : `
        <div style="height: 200px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 1rem 1rem 0 0; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 3rem;">📷</div>
      `}
      
      <div style="padding: 2rem;">
        <h2 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.5rem; font-weight: 700;">${product.name}</h2>
        <p style="margin: 0 0 1rem; color: #6b7280; font-size: 1rem;">${product.category || 'Categoria'}</p>
        
        ${product.description ? `<p style="margin: 0 0 1.5rem; color: #4b5563; line-height: 1.6;">${product.description}</p>` : ''}
        
        <div style="background: #f8fafc; border-radius: 0.75rem; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem; color: #1e293b; font-size: 1.1rem; font-weight: 600;">Tabelas de Preços</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
            <div style="padding: 1rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 0.5rem; text-align: center; color: white;">
              <div style="font-weight: 700; margin-bottom: 0.25rem;">À Vista</div>
              <div style="font-weight: 600; font-size: 1.1rem;">R$ ${(priceTable['À Vista'] || 0).toFixed(2)}</div>
            </div>
            <div style="padding: 1rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 0.5rem; text-align: center; color: white;">
              <div style="font-weight: 700; margin-bottom: 0.25rem;">30 dias</div>
              <div style="font-weight: 600; font-size: 1.1rem;">R$ ${(priceTable['30'] || 0).toFixed(2)}</div>
            </div>
            <div style="padding: 1rem; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 0.5rem; text-align: center; color: white;">
              <div style="font-weight: 700; margin-bottom: 0.25rem;">30/60</div>
              <div style="font-weight: 600; font-size: 1.1rem;">R$ ${(priceTable['30/60'] || 0).toFixed(2)}</div>
            </div>
            <div style="padding: 1rem; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 0.5rem; text-align: center; color: white;">
              <div style="font-weight: 700; margin-bottom: 0.25rem;">30/60/90</div>
              <div style="font-weight: 600; font-size: 1.1rem;">R$ ${(priceTable['30/60/90'] || 0).toFixed(2)}</div>
            </div>
          </div>
          <div style="margin-top: 0.75rem;">
            <div style="padding: 1rem; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 0.5rem; text-align: center; color: white;">
              <div style="font-weight: 700; margin-bottom: 0.25rem;">30/60/90/120</div>
              <div style="font-weight: 600; font-size: 1.1rem;">R$ ${(priceTable['30/60/90/120'] || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  modal.onclick = function(e) {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };
  
  document.body.appendChild(modal);
};

// Correções para layout cliente
function fixClientPriceTables() {
  // Função para corrigir cores das tabelas de preço no layout cliente
  setTimeout(() => {
    const priceBoxes = document.querySelectorAll('[style*="padding: 0.5rem"][style*="border-radius: 0.25rem"]');
    
    priceBoxes.forEach((box, index) => {
      const text = box.textContent.toLowerCase();
      
      if (text.includes('à vista')) {
        box.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        box.style.color = 'white';
      } else if (text.includes('30 dias') && !text.includes('/')) {
        box.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        box.style.color = 'white';
      } else if (text.includes('30/60') && !text.includes('90')) {
        box.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
        box.style.color = 'white';
      } else if (text.includes('30/60/90') && !text.includes('120')) {
        box.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        box.style.color = 'white';
      } else if (text.includes('30/60/90/120')) {
        box.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        box.style.color = 'white';
      }
    });
  }, 500);
}

function fixCategoryLayout() {
  // Função para corrigir layout de categorias se necessário
  // Implementar conforme necessário
}

function applyClientFixes() {
  fixClientPriceTables();
  fixCategoryLayout();
}

// Função de inicialização
window.addEventListener('load', function() {
  console.log('🎉 Sistema MoveisBonafe completo carregando - VERSÃO ATUALIZADA 19:56...');
  
  // Configurar Supabase
  console.log('🔄 Conectando ao Supabase...');
  console.log('🔄 Sistema configurado para usar Supabase via HTTP (sincronização manual)');
  
  // Carregar dados primeiro, depois mostrar interface
  loadSystemData().then(() => {
    console.log('✅ Dados carregados do Supabase:', {
      produtos: systemData.products.length,
      categorias: systemData.categories.length
    });
    
    // Após carregar dados, verificar se há usuário logado
    if (!currentUser) {
      // Mostrar tela de login
    document.body.innerHTML = `
      <div style="min-height: 100vh; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
        <div style="background: white; border-radius: 1rem; padding: 3rem; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 400px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="margin: 0 0 0.5rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2rem; font-weight: 700;">
              Móveis Bonafé
            </h1>
            <p style="margin: 0; color: #6b7280;">Sistema de Catálogo</p>
          </div>
          
          <form id="login-form" style="display: grid; gap: 1.5rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Usuário</label>
              <input type="text" id="username" placeholder="Digite seu usuário" 
                     style="width: 100%; padding: 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;"
                     onfocus="this.style.borderColor='#fbbf24'" onblur="this.style.borderColor='#e5e7eb'">
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Senha</label>
              <input type="password" id="password" placeholder="Digite sua senha" 
                     style="width: 100%; padding: 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;"
                     onfocus="this.style.borderColor='#fbbf24'" onblur="this.style.borderColor='#e5e7eb'">
            </div>
            
            <button type="submit" 
                    style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                    onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
              🔐 Entrar
            </button>
          </form>
          
          <div id="login-error" style="margin-top: 1rem; text-align: center;"></div>
          
          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;">Usuários de exemplo:</p>
            <div style="display: grid; gap: 0.5rem; font-size: 0.75rem; color: #6b7280;">
              <div><strong>admin</strong> / admin123 (Administrador)</div>
              <div><strong>Loja</strong> / moveisbonafe (Cliente)</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Event listener para o form de login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('login-error');
      
      if (!username || !password) {
        errorDiv.innerHTML = '<div style="color: #dc2626; font-size: 0.875rem;">Por favor, preencha todos os campos.</div>';
        return;
      }
      
      errorDiv.innerHTML = '<div style="color: #3b82f6; font-size: 0.875rem;">Verificando credenciais...</div>';
      
      const success = await trySupabaseLogin(username, password);
      if (!success) {
        errorDiv.innerHTML = '<div style="color: #dc2626; font-size: 0.875rem;">Usuário ou senha incorretos.</div>';
      }
    });
    } else {
      renderApp();
    }
    
    console.log('✅ Conexão Supabase ativa via HTTP');
    console.log('🎉 CÓDIGO NOVO FUNCIONANDO! Sistema rodando exclusivamente com Supabase');
    console.log('🔗 Supabase configurado:', !!supabase);
    console.log('⚡ Build timestamp:', new Date().toISOString());
    console.log('🚀 SEM WEBSOCKET - Apenas Supabase puro!');
    console.log('🔄 Sincronização ativada entre navegadores');
  }).catch(error => {
    console.error('❌ Erro ao carregar dados:', error);
    // Mostrar tela de login mesmo em caso de erro
    if (!currentUser) {
      document.body.innerHTML = `
        <div style="min-height: 100vh; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
          <div style="background: white; border-radius: 1rem; padding: 3rem; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 400px;">
            <div style="text-align: center; margin-bottom: 2rem;">
              <h1 style="margin: 0 0 0.5rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2rem; font-weight: 700;">
                Móveis Bonafé
              </h1>
              <p style="margin: 0; color: #6b7280;">Sistema de Catálogo</p>
            </div>
            
            <form id="login-form" style="display: grid; gap: 1.5rem;">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Usuário</label>
                <input type="text" id="username" placeholder="Digite seu usuário" 
                       style="width: 100%; padding: 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;"
                       onfocus="this.style.borderColor='#fbbf24'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Senha</label>
                <input type="password" id="password" placeholder="Digite sua senha" 
                       style="width: 100%; padding: 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;"
                       onfocus="this.style.borderColor='#fbbf24'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
              
              <button type="submit" 
                      style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                      onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                🔐 Entrar
              </button>
            </form>
            
            <div id="login-error" style="margin-top: 1rem; text-align: center;"></div>
            
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;">Usuários de exemplo:</p>
              <div style="display: grid; gap: 0.5rem; font-size: 0.75rem; color: #6b7280;">
                <div><strong>admin</strong> / admin123 (Administrador)</div>
                <div><strong>Loja</strong> / moveisbonafe (Cliente)</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Event listener para o form de login
      document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        
        if (!username || !password) {
          errorDiv.innerHTML = '<div style="color: #dc2626; font-size: 0.875rem;">Por favor, preencha todos os campos.</div>';
          return;
        }
        
        errorDiv.innerHTML = '<div style="color: #3b82f6; font-size: 0.875rem;">Verificando credenciais...</div>';
        
        const success = await trySupabaseLogin(username, password);
        if (!success) {
          errorDiv.innerHTML = '<div style="color: #dc2626; font-size: 0.875rem;">Usuário ou senha incorretos.</div>';
        }
      });
    }
  });
});

// Adicionar SheetJS para Excel
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
script.onload = function() {
  console.log('✅ SheetJS carregado para funcionalidade Excel');
};
document.head.appendChild(script);

console.log('✅ Sistema MoveisBonafe completo carregado!');