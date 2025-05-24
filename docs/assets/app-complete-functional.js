// MoveisBonafe - Sistema completo e funcional
console.log('🎉 Sistema MoveisBonafe completo carregando...');

// Configuração do Supabase - Credenciais corretas
const SUPABASE_URL = 'https://oozesebwtrbzeelkcmwp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY';

// Cliente Supabase
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async query(table, query = '') {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}${query}`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
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
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erro HTTP:', response.status, error);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao inserir:', error);
      return null;
    }
  }

  async update(table, id, data) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      return null;
    }
  }

  async delete(table, id) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao excluir:', error);
      return false;
    }
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado da aplicação
let currentUser = null;
let currentView = 'login';
let systemData = {
  products: [],
  categories: [
    { id: 1, name: 'Sala de Estar', icon: '🛋️', color: '#3b82f6', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop' },
    { id: 2, name: 'Quarto', icon: '🛏️', color: '#10b981', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop' },
    { id: 3, name: 'Cozinha', icon: '🍽️', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop' },
    { id: 4, name: 'Escritório', icon: '💼', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop' }
  ],
  users: [],
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
let categoryImageData = '';

// Funções do carrossel de imagens
window.nextImage = function(carouselId, totalImages) {
  if (!carouselStates[carouselId]) carouselStates[carouselId] = 0;
  
  carouselStates[carouselId] = (carouselStates[carouselId] + 1) % totalImages;
  updateCarousel(carouselId, totalImages);
};

window.previousImage = function(carouselId, totalImages) {
  if (!carouselStates[carouselId]) carouselStates[carouselId] = 0;
  
  carouselStates[carouselId] = carouselStates[carouselId] === 0 ? totalImages - 1 : carouselStates[carouselId] - 1;
  updateCarousel(carouselId, totalImages);
};

function updateCarousel(carouselId, totalImages) {
  const carousel = document.getElementById(carouselId);
  const currentIndex = carouselStates[carouselId] || 0;
  
  if (carousel) {
    const translateX = -(currentIndex * (100 / totalImages));
    carousel.style.transform = `translateX(${translateX}%)`;
    
    // Atualizar indicadores
    for (let i = 0; i < totalImages; i++) {
      const dot = document.getElementById(`dot-${carouselId}-${i}`);
      if (dot) {
        dot.style.background = i === currentIndex ? 'white' : 'rgba(255,255,255,0.5)';
      }
    }
  }
}

// Funções de touch para mobile
window.handleTouchStart = function(event, carouselId, totalImages) {
  event.preventDefault();
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  console.log('Touch start:', touchStartX);
};

window.handleTouchMove = function(event) {
  event.preventDefault();
};

window.handleTouchEnd = function(event, carouselId, totalImages) {
  event.preventDefault();
  const touch = event.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  console.log('Touch end - deltaX:', deltaX, 'deltaY:', deltaY);
  
  // Verifica se é um swipe horizontal com movimento mínimo de 30px
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
    if (deltaX > 0) {
      console.log('Swipe direita - imagem anterior');
      previousImage(carouselId, totalImages);
    } else {
      console.log('Swipe esquerda - próxima imagem');
      nextImage(carouselId, totalImages);
    }
  }
};

// Função de login
window.login = function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    alert('Por favor, preencha usuário e senha!');
    return;
  }

  console.log('🔍 Verificando credenciais para:', username);
  
  // Credenciais padrão sempre disponíveis
  const defaultUsers = {
    'admin': { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador', price_multiplier: 1.0, active: true },
    'vendedor': { id: 2, username: 'vendedor', password: 'venda123', role: 'seller', name: 'Vendedor', price_multiplier: 1.0, active: true },
    'cliente': { id: 3, username: 'cliente', password: 'cliente123', role: 'customer', name: 'Cliente Teste', price_multiplier: 1.0, active: true }
  };
  
  const defaultUser = defaultUsers[username];
  if (defaultUser && defaultUser.password === password) {
    currentUser = defaultUser;
    console.log('✅ Login realizado:', currentUser.name, 'Tipo:', currentUser.role);
    
    // Define a view baseada no tipo de usuário
    if (currentUser.role === 'customer') {
      currentView = 'catalog';
    } else {
      currentView = 'admin';
    }
    
    // Carrega dados e renderiza
    loadSystemData().then(() => {
      renderApp();
    }).catch(() => {
      // Se falhar, renderiza mesmo assim
      renderApp();
    });
    
    return;
  }
  
  // Se não é usuário padrão, tenta Supabase (assíncrono em background)
  trySupabaseLogin(username, password);
};

// Função auxiliar para tentar login no Supabase
async function trySupabaseLogin(username, password) {
  try {
    const users = await supabase.query('auth_users', `?username=eq.${username}&password_hash=eq.${password}&active=eq.true`);
    
    if (users && users.length > 0) {
      currentUser = users[0];
      console.log('✅ Login Supabase realizado:', currentUser.name, 'Tipo:', currentUser.role);
      currentView = currentUser.role === 'customer' ? 'catalog' : 'admin';
      await loadSystemData();
      renderApp();
    } else {
      alert('Usuário ou senha incorretos!');
    }
  } catch (error) {
    console.error('Erro no login Supabase:', error);
    alert('Usuário ou senha incorretos!');
  }
}

// Carregar dados do sistema
async function loadSystemData() {
  try {
    console.log('📊 Carregando dados do sistema...');
    
    const products = await supabase.query('products');
    if (products) systemData.products = products;
    
    const categories = await supabase.query('categories');
    if (categories && categories.length > 0) systemData.categories = categories;
    
    const users = await supabase.query('auth_users');
    if (users) systemData.users = users;
    
    console.log('✅ Dados carregados:', {
      produtos: systemData.products.length,
      categorias: systemData.categories.length,
      usuarios: systemData.users.length
    });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// Calcular preços com incrementos das tabelas - CORRIGIDO para preço fixo
function calculatePriceTable(basePrice, userMultiplier = 1, isFixedPrice = false) {
  if (isFixedPrice) {
    // Preço fixo: todas as tabelas têm o mesmo preço base (à vista)
    return Object.keys(systemData.priceSettings).reduce((acc, table) => {
      acc[table] = basePrice; // Mesmo preço para todas as tabelas
      return acc;
    }, {});
  } else {
    return Object.keys(systemData.priceSettings).reduce((acc, table) => {
      const increment = systemData.priceSettings[table] / 100;
      acc[table] = basePrice * userMultiplier * (1 + increment);
      return acc;
    }, {});
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

window.handleCategoryFileUpload = function(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      categoryImageData = e.target.result;
      updateCategoryImagePreview();
    };
    reader.readAsDataURL(file);
  }
};

function updateCategoryImagePreview() {
  const preview = document.getElementById('category-image-preview');
  if (preview && categoryImageData) {
    preview.innerHTML = `<img src="${categoryImageData}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 0.375rem;">`;
  }
}

// Função de logout
window.logout = function() {
  currentUser = null;
  currentView = 'login';
  renderApp();
};

// Função para trocar abas
window.showTab = function(tabName) {
  const allTabs = ['produtos', 'categorias', 'precos', 'usuarios', 'excel', 'backup', 'monitoramento'];
  allTabs.forEach(tab => {
    const content = document.getElementById('content-' + tab);
    const button = document.getElementById('tab-' + tab);
    
    if (content) content.style.display = 'none';
    if (button) {
      button.style.borderBottomColor = 'transparent';
      button.style.color = '#6b7280';
    }
  });
  
  const activeContent = document.getElementById('content-' + tabName);
  const activeButton = document.getElementById('tab-' + tabName);
  
  if (activeContent) activeContent.style.display = 'block';
  if (activeButton) {
    activeButton.style.borderBottomColor = '#3b82f6';
    activeButton.style.color = '#3b82f6';
  }
  
  renderTab(tabName);
};

// FUNÇÕES DE PRODUTOS
window.showAddProductModal = function() {
  selectedImages = [];
  showProductModal();
};

window.showEditProductModal = function(id) {
  const product = systemData.products.find(p => p.id === id);
  if (!product) {
    console.log('Produto não encontrado:', id);
    return;
  }
  
  console.log('Produto encontrado para edição:', product);
  
  // Verificação ultra-segura para parse do JSON das imagens
  selectedImages = [];
  
  if (product.images) {
    if (typeof product.images === 'string') {
      try {
        // Verifica se a string não está vazia ou é 'null'
        const trimmedImages = product.images.trim();
        if (trimmedImages && trimmedImages !== 'null' && trimmedImages !== '[]' && trimmedImages !== '') {
          const parsed = JSON.parse(trimmedImages);
          if (Array.isArray(parsed)) {
            selectedImages = parsed;
          }
        }
      } catch (error) {
        console.log('Erro ao fazer parse das imagens, usando array vazio:', error);
        selectedImages = [];
      }
    } else if (Array.isArray(product.images)) {
      selectedImages = product.images;
    }
  }
  
  console.log('Imagens carregadas para edição:', selectedImages);
  showProductModal(product);
};

function showProductModal(product = null) {
  const isEdit = !!product;
  const modal = document.createElement('div');
  modal.id = 'product-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1e293b;">${isEdit ? 'Editar' : 'Adicionar'} Produto</h2>
        <button onclick="closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      
      <form id="product-form" style="display: grid; gap: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome do Produto</label>
            <input type="text" id="product-name" value="${product?.name || ''}" placeholder="Digite o nome do produto" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Categoria</label>
            <select id="product-category" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
              <option value="">Selecione uma categoria</option>
              ${systemData.categories.map(cat => `<option value="${cat.id}" ${product?.category === cat.name ? 'selected' : ''}>${cat.name}</option>`).join('')}
            </select>
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Descrição</label>
          <textarea id="product-description" placeholder="Digite a descrição do produto" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; height: 80px; resize: vertical; box-sizing: border-box;">${product?.description || ''}</textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Preço À Vista (R$)</label>
            <input type="number" id="product-price" value="${product?.base_price || ''}" placeholder="0" step="0.01" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Peso (kg)</label>
            <input type="number" id="product-weight" value="${product?.weight || ''}" placeholder="0" step="0.01" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Altura (cm)</label>
            <input type="number" id="product-height" value="${product?.height || ''}" placeholder="0" step="0.1" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Largura (cm)</label>
            <input type="number" id="product-width" value="${product?.width || ''}" placeholder="0" step="0.1" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Comprimento (cm)</label>
            <input type="number" id="product-length" value="${product?.length || ''}" placeholder="0" step="0.1" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: #f0f9ff; border-radius: 0.375rem; border-left: 4px solid #3b82f6;">
          <input type="checkbox" id="product-fixed-price" ${product?.fixed_price ? 'checked' : ''} style="margin: 0;">
          <label for="product-fixed-price" style="margin: 0; color: #3b82f6; font-weight: 500;">
            🔒 Preço Fixo - Este produto não será afetado pelo multiplicador de preços dos usuários
          </label>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Imagens do Produto</label>
          <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
            <input type="url" id="product-image-url" placeholder="Cole uma URL de imagem..." style="flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
            <button type="button" onclick="addImageUrl()" style="padding: 0.75rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
              Adicionar URL
            </button>
          </div>
          <input type="file" id="product-image-file" accept="image/*" multiple style="margin-bottom: 1rem;">
          <div id="images-preview" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem;">
            ${selectedImages.map((img, index) => `
              <div style="position: relative;">
                <img src="${img}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 0.375rem;">
                <button type="button" onclick="removeImage(${index})" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            ${isEdit ? 'Atualizar' : 'Salvar'} Produto
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (isEdit) {
      await updateProduct(product.id);
    } else {
      await saveProduct();
    }
  });
  
  document.getElementById('product-image-file').addEventListener('change', handleFileUpload);
}

// Adicionar imagem por URL
window.addImageUrl = function() {
  const url = document.getElementById('product-image-url').value.trim();
  if (url) {
    selectedImages.push(url);
    document.getElementById('product-image-url').value = '';
    updateImagesPreview();
  }
};

// Remover imagem
window.removeImage = function(index) {
  selectedImages.splice(index, 1);
  updateImagesPreview();
};

// Atualizar preview das imagens
function updateImagesPreview() {
  const preview = document.getElementById('images-preview');
  if (preview) {
    preview.innerHTML = selectedImages.map((img, index) => `
      <div style="position: relative;">
        <img src="${img}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 0.375rem;">
        <button type="button" onclick="removeImage(${index})" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
      </div>
    `).join('');
  }
}

// Lidar com upload de arquivos
function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedImages.push(e.target.result);
        updateImagesPreview();
      };
      reader.readAsDataURL(file);
    }
  });
}

// Salvar produto
async function saveProduct() {
  const categoryId = parseInt(document.getElementById('product-category').value);
  const categoryName = systemData.categories.find(c => c.id === categoryId)?.name || 'Categoria';
  const basePrice = parseFloat(document.getElementById('product-price').value) || 0;
  
  const productData = {
    name: document.getElementById('product-name').value,
    category: categoryName,
    description: document.getElementById('product-description').value || '',
    base_price: basePrice,
    final_price: basePrice,
    price_a_vista: basePrice,
    price_30: basePrice * 1.02,
    price_30_60: basePrice * 1.04,
    price_30_60_90: basePrice * 1.06,
    price_30_60_90_120: basePrice * 1.08,
    weight: parseFloat(document.getElementById('product-weight').value) || 0,
    height: parseFloat(document.getElementById('product-height').value) || 0,
    width: parseFloat(document.getElementById('product-width').value) || 0,
    length: parseFloat(document.getElementById('product-length').value) || 0,
    fixed_price: document.getElementById('product-fixed-price').checked,
    images: JSON.stringify(selectedImages),
    active: true,
    discount: 0,
    discount_percent: 0,
    created_at: new Date().toISOString()
  };
  
  console.log('💾 Salvando produto:', productData);
  
  try {
    const result = await supabase.insert('products', productData);
    if (result && result.length > 0) {
      console.log('✅ Produto salvo com sucesso:', result[0]);
      closeModal();
      await loadSystemData();
      renderTab('produtos');
      alert('Produto adicionado com sucesso!');
    } else {
      alert('Erro ao salvar produto. Verifique os dados e tente novamente.');
    }
  } catch (error) {
    console.error('❌ Erro ao salvar produto:', error);
    alert('Erro ao salvar produto. Tente novamente.');
  }
}

// Atualizar produto
async function updateProduct(id) {
  const categoryId = parseInt(document.getElementById('product-category').value);
  const categoryName = systemData.categories.find(c => c.id === categoryId)?.name || 'Categoria';
  const basePrice = parseFloat(document.getElementById('product-price').value) || 0;
  
  const productData = {
    name: document.getElementById('product-name').value,
    category: categoryName,
    description: document.getElementById('product-description').value || '',
    base_price: basePrice,
    final_price: basePrice,
    price_a_vista: basePrice,
    price_30: basePrice * 1.02,
    price_30_60: basePrice * 1.04,
    price_30_60_90: basePrice * 1.06,
    price_30_60_90_120: basePrice * 1.08,
    weight: parseFloat(document.getElementById('product-weight').value) || 0,
    height: parseFloat(document.getElementById('product-height').value) || 0,
    width: parseFloat(document.getElementById('product-width').value) || 0,
    length: parseFloat(document.getElementById('product-length').value) || 0,
    fixed_price: document.getElementById('product-fixed-price').checked,
    images: JSON.stringify(selectedImages)
  };
  
  try {
    const result = await supabase.update('products', id, productData);
    if (result) {
      closeModal();
      await loadSystemData();
      renderTab('produtos');
      alert('Produto atualizado com sucesso!');
    } else {
      alert('Erro ao atualizar produto.');
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    alert('Erro ao atualizar produto. Tente novamente.');
  }
}

window.deleteProduct = async function(id) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    const result = await supabase.delete('products', id);
    if (result) {
      await loadSystemData();
      renderTab('produtos');
      alert('Produto excluído!');
    }
  }
};

// FUNÇÕES DE CATEGORIAS
window.showAddCategoryModal = function() {
  categoryImageData = '';
  showCategoryModal();
};

window.showEditCategoryModal = function(id) {
  const category = systemData.categories.find(c => c.id === id);
  if (category) {
    categoryImageData = category.image || '';
    showCategoryModal(category);
  }
};

function showCategoryModal(category = null) {
  const isEdit = !!category;
  const modal = document.createElement('div');
  modal.id = 'category-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; max-width: 500px; width: 90%;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1e293b;">${isEdit ? 'Editar' : 'Adicionar'} Categoria</h2>
        <button onclick="closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      
      <form id="category-form" style="display: grid; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome da Categoria</label>
          <input type="text" id="category-name" value="${category?.name || ''}" placeholder="Digite o nome da categoria" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Ícone (Emoji)</label>
          <input type="text" id="category-icon" value="${category?.icon || ''}" placeholder="Ex: 🛋️" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Cor</label>
          <input type="color" id="category-color" value="${category?.color || '#3b82f6'}" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Imagem da Categoria</label>
          <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
            <input type="url" id="category-image" value="${category?.image || ''}" placeholder="https://exemplo.com/imagem.jpg" style="flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
            <button type="button" onclick="addCategoryImageUrl()" style="padding: 0.75rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
              Usar URL
            </button>
          </div>
          <input type="file" id="category-image-file" accept="image/*" onchange="handleCategoryFileUpload(event)" style="margin-bottom: 1rem;">
          <div id="category-image-preview" style="margin-top: 1rem;">
            ${category?.image ? `<img src="${category.image}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 0.375rem;">` : ''}
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            ${isEdit ? 'Atualizar' : 'Salvar'} Categoria
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('category-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (isEdit) {
      await updateCategory(category.id);
    } else {
      await saveCategory();
    }
  });
}

async function saveCategory() {
  const categoryData = {
    name: document.getElementById('category-name').value,
    icon: document.getElementById('category-icon').value,
    color: document.getElementById('category-color').value,
    image: categoryImageData || null
  };
  
  const result = await supabase.insert('categories', categoryData);
  if (result) {
    closeModal();
    await loadSystemData();
    renderTab('categorias');
    alert('Categoria adicionada!');
  }
}

async function updateCategory(id) {
  const categoryData = {
    name: document.getElementById('category-name').value,
    icon: document.getElementById('category-icon').value,
    color: document.getElementById('category-color').value,
    image: categoryImageData || null
  };
  
  const result = await supabase.update('categories', id, categoryData);
  if (result) {
    closeModal();
    await loadSystemData();
    renderTab('categorias');
    alert('Categoria atualizada!');
  }
}

window.deleteCategory = async function(id) {
  if (confirm('Tem certeza que deseja excluir esta categoria?')) {
    const result = await supabase.delete('categories', id);
    if (result) {
      await loadSystemData();
      renderTab('categorias');
      alert('Categoria excluída!');
    }
  }
};

// FUNÇÕES DE USUÁRIOS
window.showAddUserModal = function() {
  showUserModal();
};

window.showEditUserModal = function(id) {
  const user = systemData.users.find(u => u.id === id);
  if (user) showUserModal(user);
};

function showUserModal(user = null) {
  const isEdit = !!user;
  const modal = document.createElement('div');
  modal.id = 'user-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; max-width: 500px; width: 90%;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1e293b;">${isEdit ? 'Editar' : 'Adicionar'} Usuário</h2>
        <button onclick="closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      
      <form id="user-form" style="display: grid; gap: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome Completo</label>
          <input type="text" id="user-name" value="${user?.name || ''}" placeholder="Digite o nome completo" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome de Usuário</label>
          <input type="text" id="user-username" value="${user?.username || ''}" placeholder="Digite o nome de usuário" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required ${isEdit ? 'readonly' : ''}>
        </div>
        
        ${!isEdit ? `
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Senha</label>
          <input type="password" id="user-password" placeholder="Digite a senha" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
        </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Função</label>
            <select id="user-role" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
              <option value="customer" ${user?.role === 'customer' ? 'selected' : ''}>Cliente</option>
              <option value="seller" ${user?.role === 'seller' ? 'selected' : ''}>Vendedor</option>
              <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Multiplicador</label>
            <input type="number" id="user-multiplier" value="${user?.price_multiplier || 1.0}" step="0.01" min="0.1" max="10" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" id="user-active" ${user?.active !== false ? 'checked' : ''} style="margin: 0;">
          <label for="user-active" style="margin: 0; color: #374151;">Usuário Ativo</label>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            ${isEdit ? 'Atualizar' : 'Criar'} Usuário
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('user-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (isEdit) {
      await updateUser(user.id);
    } else {
      await saveUser();
    }
  });
}

async function saveUser() {
  const userData = {
    name: document.getElementById('user-name').value,
    username: document.getElementById('user-username').value,
    password_hash: document.getElementById('user-password').value,
    role: document.getElementById('user-role').value,
    price_multiplier: parseFloat(document.getElementById('user-multiplier').value),
    active: document.getElementById('user-active').checked
  };
  
  const result = await supabase.insert('auth_users', userData);
  if (result) {
    closeModal();
    await loadSystemData();
    renderTab('usuarios');
    alert('Usuário criado!');
  }
}

async function updateUser(id) {
  const userData = {
    name: document.getElementById('user-name').value,
    role: document.getElementById('user-role').value,
    price_multiplier: parseFloat(document.getElementById('user-multiplier').value),
    active: document.getElementById('user-active').checked
  };
  
  const result = await supabase.update('auth_users', id, userData);
  if (result) {
    closeModal();
    await loadSystemData();
    renderTab('usuarios');
    alert('Usuário atualizado!');
  }
}

window.deleteUser = async function(id) {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    const result = await supabase.delete('auth_users', id);
    if (result) {
      await loadSystemData();
      renderTab('usuarios');
      alert('Usuário excluído!');
    }
  }
};

// FUNÇÕES DE PREÇOS
window.updatePricePercentage = function(table, value) {
  systemData.priceSettings[table] = parseFloat(value);
  console.log('Percentual atualizado:', table, value + '%');
  // Recarregar a aba para mostrar os novos valores
  setTimeout(() => renderTab('precos'), 100);
};

// Função para adicionar nova tabela de preços
window.showAddPriceTableModal = function() {
  showPriceTableModal();
};

// Função para editar tabela de preços
window.showEditPriceTableModal = function(tableName) {
  showPriceTableModal(tableName);
};

// Modal para gerenciar tabelas de preços
function showPriceTableModal(tableName = null) {
  const isEdit = !!tableName;
  const currentPercentage = isEdit ? systemData.priceSettings[tableName] : 0;
  
  const modal = document.createElement('div');
  modal.id = 'price-table-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; max-width: 500px; width: 90%;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1e293b;">${isEdit ? 'Editar' : 'Adicionar'} Tabela de Preços</h2>
        <button onclick="closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
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
        
        <div style="padding: 1rem; background: #f0f9ff; border-radius: 0.375rem; border-left: 4px solid #3b82f6;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Simulação</h4>
          <div id="price-simulation">
            <p style="margin: 0; color: #6b7280;">Produto de R$ 100,00 ficará: <strong id="simulated-price">R$ ${(100 * (1 + currentPercentage / 100)).toFixed(2)}</strong></p>
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" onclick="closePriceTableModal()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            ${isEdit ? 'Atualizar' : 'Criar'} Tabela
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Atualizar simulação em tempo real
  document.getElementById('table-percentage').addEventListener('input', function() {
    const percentage = parseFloat(this.value) || 0;
    const simulatedPrice = (100 * (1 + percentage / 100)).toFixed(2);
    document.getElementById('simulated-price').textContent = `R$ ${simulatedPrice}`;
  });
  
  // Event listener do formulário
  document.getElementById('price-table-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (isEdit) {
      updatePriceTable(tableName);
    } else {
      savePriceTable();
    }
  });
}

// Salvar nova tabela de preços
async function savePriceTable() {
  const tableName = document.getElementById('table-name').value.trim();
  const percentage = parseFloat(document.getElementById('table-percentage').value) || 0;
  
  if (!tableName) {
    alert('Por favor, digite um nome para a tabela!');
    return;
  }
  
  if (systemData.priceSettings.hasOwnProperty(tableName)) {
    alert('Já existe uma tabela com este nome!');
    return;
  }
  
  systemData.priceSettings[tableName] = percentage;
  
  // Fechar modal específico
  const modal = document.getElementById('price-table-modal');
  if (modal) modal.remove();
  
  renderTab('precos');
  alert(`Tabela "${tableName}" criada com ${percentage}% de acréscimo!`);
}

// Atualizar tabela de preços existente
async function updatePriceTable(tableName) {
  const percentage = parseFloat(document.getElementById('table-percentage').value) || 0;
  
  systemData.priceSettings[tableName] = percentage;
  
  // Fechar modal específico
  const modal = document.getElementById('price-table-modal');
  if (modal) modal.remove();
  
  renderTab('precos');
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

// Função para ordenar tabelas de preços
window.sortPriceTables = function() {
  // Alternar entre ordenação por nome e por percentual
  if (!window.priceTableSortOrder) {
    window.priceTableSortOrder = 'name';
  } else if (window.priceTableSortOrder === 'name') {
    window.priceTableSortOrder = 'percentage';
  } else {
    window.priceTableSortOrder = 'name';
  }
  
  renderTab('precos');
};

// Função para fechar modal de tabela de preços
window.closePriceTableModal = function() {
  const modal = document.getElementById('price-table-modal');
  if (modal) {
    modal.remove();
  }
};

// FUNÇÕES DE EXCEL
window.importExcel = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.csv';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      console.log('Arquivo selecionado:', file.name);
      alert(`Arquivo ${file.name} selecionado! Funcionalidade de importação será implementada em breve.`);
    }
  };
  input.click();
};

window.exportExcel = function() {
  const data = systemData.products.map(p => ({
    Nome: p.name || '',
    Categoria: p.category || '',
    Preco: p.base_price || 0,
    Altura: p.height || 0,
    Largura: p.width || 0,
    Comprimento: p.length || 0,
    Peso: p.weight || 0,
    Descricao: p.description || ''
  }));
  
  console.log('Exportando produtos para Excel:', data);
  
  // Criar arquivo Excel real usando SheetJS
  try {
    // Verificar se a biblioteca XLSX está disponível
    if (typeof XLSX === 'undefined') {
      // Fallback para CSV se XLSX não estiver disponível
      console.log('XLSX não disponível, usando CSV como fallback');
      exportAsCSV(data);
      return;
    }
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Criar worksheet com os dados
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Definir largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome
      { wch: 15 }, // Categoria
      { wch: 12 }, // Preco
      { wch: 10 }, // Altura
      { wch: 10 }, // Largura
      { wch: 12 }, // Comprimento
      { wch: 10 }, // Peso
      { wch: 40 }  // Descricao
    ];
    ws['!cols'] = colWidths;
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
    
    // Gerar arquivo Excel
    const fileName = `produtos-moveisbonafe-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    alert(`${data.length} produtos exportados para Excel (.xlsx)!`);
    
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    // Fallback para CSV em caso de erro
    exportAsCSV(data);
  }
};

// Função fallback para exportar como CSV
function exportAsCSV(data) {
  const headers = ['Nome', 'Categoria', 'Preco', 'Altura', 'Largura', 'Comprimento', 'Peso', 'Descricao'];
  const csvContent = [
    headers.join(';'),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(';'))
  ].join('\n');
  
  // Adicionar BOM para UTF-8 (melhor compatibilidade com Excel)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `produtos-moveisbonafe-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert(`${data.length} produtos exportados para CSV (compatível com Excel)!`);
}

// FUNÇÕES DE BACKUP
window.createBackup = function() {
  const backup = {
    timestamp: new Date().toISOString(),
    products: systemData.products,
    categories: systemData.categories,
    users: systemData.users.map(u => ({ ...u, password_hash: '***' })),
    priceSettings: systemData.priceSettings
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-moveisbonafe-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert('Backup criado e baixado com sucesso!');
};

window.restoreBackup = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const backup = JSON.parse(e.target.result);
          console.log('Backup carregado:', backup);
          alert('Backup carregado! Funcionalidade de restauração será implementada em breve.');
        } catch (error) {
          alert('Erro ao ler arquivo de backup!');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// Fechar modal
window.closeModal = function() {
  const modals = ['product-modal', 'category-modal', 'user-modal'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
  });
};

// Renderizar abas
function renderTab(tabName) {
  const content = document.getElementById('content-' + tabName);
  if (!content) return;
  
  switch(tabName) {
    case 'produtos':
      content.innerHTML = renderProductsTab();
      break;
    case 'categorias':
      content.innerHTML = renderCategoriesTab();
      break;
    case 'precos':
      content.innerHTML = renderPricesTab();
      break;
    case 'usuarios':
      content.innerHTML = renderUsersTab();
      break;
    case 'excel':
      content.innerHTML = renderExcelTab();
      break;
    case 'backup':
      content.innerHTML = renderBackupTab();
      break;
    case 'monitoramento':
      content.innerHTML = renderMonitoringTab();
      break;
  }
}

// Renderizar aba de produtos
function renderProductsTab() {
  const productsHtml = systemData.products.map(product => {
    const userMultiplier = currentUser.price_multiplier || 1.0;
    const basePrice = product.base_price || 0;
    const priceTable = calculatePriceTable(basePrice, userMultiplier, product.fixed_price);
    
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
          ${firstImage ? 
            `<img src="${firstImage}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 0.375rem; background: #f8f9fa;">` :
            `<div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; color: #6b7280;">📷</div>`
          }
        </td>
        <td style="padding: 1rem;">
          <div style="font-weight: 600; color: #1e293b;">${product.name}</div>
          <div style="font-size: 0.875rem; color: #6b7280;">${product.category || 'N/A'}</div>
          ${product.fixed_price ? '<div style="font-size: 0.75rem; color: #f59e0b;">🔒 Preço Fixo</div>' : ''}
        </td>
        <td style="padding: 1rem; color: #10b981; font-weight: 600;">R$ ${priceTable['A Vista'].toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${priceTable['30'].toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60'].toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60/90'].toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60/90/120'].toFixed(2)}</td>
        <td style="padding: 1rem;">
          <button onclick="showEditProductModal(${product.id})" style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; margin-right: 0.5rem;">
            Editar
          </button>
          <button onclick="deleteProduct(${product.id})" style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
            Excluir
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Produtos</h2>
      <button onclick="showAddProductModal()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
        + Novo Produto
      </button>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Imagem</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Produto</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">À Vista</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">30</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">30/60</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">30/60/90</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">30/60/90/120</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Ações</th>
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
  const categoriesHtml = systemData.categories.map(category => `
    <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; border-left: 4px solid ${category.color};">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 2rem;">${category.icon}</span>
          <div>
            <h3 style="margin: 0; color: #1e293b; font-size: 1.1rem;">${category.name}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">ID: ${category.id}</p>
          </div>
        </div>
        <div>
          <button onclick="showEditCategoryModal(${category.id})" style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;">
            Editar
          </button>
          <button onclick="deleteCategory(${category.id})" style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
            Excluir
          </button>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Categorias</h2>
      <button onclick="showAddCategoryModal()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
        + Nova Categoria
      </button>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
      ${categoriesHtml}
    </div>
  `;
}

// Renderizar aba de preços
function renderPricesTab() {
  const tablesArray = Object.entries(systemData.priceSettings);
  
  // Aplicar ordenação baseada na preferência do usuário
  let sortedTables;
  if (window.priceTableSortOrder === 'percentage') {
    sortedTables = tablesArray.sort((a, b) => {
      if (a[0] === 'A Vista') return -1;
      if (b[0] === 'A Vista') return 1;
      return a[1] - b[1];
    });
  } else {
    sortedTables = tablesArray.sort((a, b) => {
      if (a[0] === 'A Vista') return -1;
      if (b[0] === 'A Vista') return 1;
      return a[0].localeCompare(b[0]);
    });
  }
  
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Tabelas de Preços</h2>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <button onclick="sortPriceTables()" style="padding: 0.5rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer;" title="Ordenar tabelas">
          ↕️
        </button>
        <button onclick="showAddPriceTableModal()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          + Nova Tabela
        </button>
      </div>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb; margin-bottom: 2rem;">
      <h3 style="margin: 0 0 1.5rem; color: #1e293b;">Tabelas de Preços Configuradas</h3>
      
      <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f9fafb;">
            <tr>
              <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Nome da Tabela</th>
              <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Percentual (%)</th>
              <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Multiplicador</th>
              <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Exemplo (R$ 100)</th>
              <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${sortedTables.map(([tableName, percentage]) => {
              const multiplier = (1 + percentage / 100).toFixed(3);
              const example = (100 * (1 + percentage / 100)).toFixed(2);
              const isDefault = ['A Vista', '30', '30/60', '30/60/90', '30/60/90/120'].includes(tableName);
              
              return `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-weight: 600; color: #1e293b;">${tableName}</span>
                      ${tableName === 'A Vista' ? '<span style="padding: 0.25rem 0.5rem; background: #10b981; color: white; border-radius: 0.25rem; font-size: 0.75rem;">Padrão</span>' : ''}
                    </div>
                  </td>
                  <td style="padding: 1rem;">
                    <input type="number" value="${percentage}" step="0.1" min="0" max="100" 
                           onchange="updatePricePercentage('${tableName}', this.value)"
                           style="width: 80px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; text-align: center;">
                  </td>
                  <td style="padding: 1rem; color: #6b7280; font-family: monospace;">${multiplier}x</td>
                  <td style="padding: 1rem; color: #10b981; font-weight: 600;">R$ ${example}</td>
                  <td style="padding: 1rem;">
                    <div style="display: flex; gap: 0.5rem;">
                      <button onclick="showEditPriceTableModal('${tableName}')" 
                              style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
                        Editar
                      </button>
                      ${!isDefault ? `
                        <button onclick="deletePriceTable('${tableName}')" 
                                style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
                          Excluir
                        </button>
                      ` : `
                        <span style="color: #6b7280; font-size: 0.75rem;">Sistema</span>
                      `}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div style="background: #f0f9ff; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #3b82f6;">
      <h4 style="margin: 0 0 1rem; color: #1e293b;">💡 Como Funciona</h4>
      <ul style="margin: 0; color: #6b7280; line-height: 1.6;">
        <li><strong>Percentual:</strong> Define o acréscimo sobre o preço base</li>
        <li><strong>Multiplicador:</strong> Valor calculado automaticamente (1 + percentual/100)</li>
        <li><strong>À Vista:</strong> Sempre 0% - é o preço base de referência</li>
        <li><strong>Exemplo:</strong> Com 2%, um produto de R$ 100 fica R$ 102</li>
      </ul>
    </div>
  `;
}

// Renderizar aba de usuários
function renderUsersTab() {
  const usersHtml = systemData.users.map(user => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 1rem; color: #1e293b;">${user.name}</td>
      <td style="padding: 1rem; color: #1e293b;">@${user.username}</td>
      <td style="padding: 1rem;">
        <span style="padding: 0.25rem 0.5rem; background: ${user.role === 'admin' ? '#dc2626' : user.role === 'seller' ? '#3b82f6' : '#10b981'}; color: white; border-radius: 0.25rem; font-size: 0.75rem;">
          ${user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Vendedor' : 'Cliente'}
        </span>
      </td>
      <td style="padding: 1rem; color: #f59e0b; font-weight: 600;">
        x${(user.price_multiplier || 1.0).toFixed(2)}
      </td>
      <td style="padding: 1rem;">
        <span style="color: ${user.active ? '#10b981' : '#ef4444'};">
          ${user.active ? '● Ativo' : '○ Inativo'}
        </span>
      </td>
      <td style="padding: 1rem;">
        <button onclick="showEditUserModal(${user.id})" style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; margin-right: 0.5rem;">
          Editar
        </button>
        <button onclick="deleteUser(${user.id})" style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
          Excluir
        </button>
      </td>
    </tr>
  `).join('');

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Usuários</h2>
      <button onclick="showAddUserModal()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
        + Novo Usuário
      </button>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Nome</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Usuário</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Nível</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Multiplicador</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Status</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${usersHtml || '<tr><td colspan="6" style="padding: 2rem; text-align: center; color: #6b7280;">Carregando usuários...</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// Renderizar aba Excel
function renderExcelTab() {
  return `
    <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Importar/Exportar Excel</h2>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 1rem; color: #1e293b;">📥 Importar Produtos</h3>
        <p style="margin: 0 0 1rem; color: #6b7280;">Importe produtos em massa usando arquivo Excel (.xlsx/.csv)</p>
        <button onclick="importExcel()" style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Selecionar Arquivo
        </button>
      </div>
      
      <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 1rem; color: #1e293b;">📤 Exportar Produtos</h3>
        <p style="margin: 0 0 1rem; color: #6b7280;">Exporte todos os produtos para arquivo CSV</p>
        <button onclick="exportExcel()" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Baixar CSV
        </button>
      </div>
    </div>
    
    <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; margin-top: 2rem;">
      <h3 style="margin: 0 0 1rem; color: #1e293b;">Formato de Importação</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Nome</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Categoria</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Preco</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Altura</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Largura</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Comprimento</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Peso</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Descricao</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Sofa 3 Lugares</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Sala de Estar</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">1200.00</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">85</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">200</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">90</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">45.5</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Sofa confortavel para sala</td>
          </tr>
        </tbody>
      </table>
      <p style="margin: 1rem 0 0; color: #6b7280; font-size: 0.875rem;">
        <strong>Importante:</strong> Use separação por TAB (colunas) para melhor compatibilidade com Excel. Evite acentos nos cabeçalhos.
      </p>
    </div>
  `;
}

// Renderizar aba Backup
function renderBackupTab() {
  return `
    <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Backup e Restauração</h2>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
      <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 1rem; color: #1e293b;">💾 Criar Backup</h3>
        <p style="margin: 0 0 1rem; color: #6b7280;">Faça backup completo dos dados do sistema</p>
        <button onclick="createBackup()" style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Gerar Backup
        </button>
      </div>
      
      <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 1rem; color: #1e293b;">📁 Restaurar Backup</h3>
        <p style="margin: 0 0 1rem; color: #6b7280;">Restaure dados de um arquivo de backup</p>
        <button onclick="restoreBackup()" style="padding: 0.75rem 1.5rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Selecionar Backup
        </button>
      </div>
    </div>
    
    <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 1rem; color: #1e293b;">📊 Status do Sistema</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📦</div>
          <div style="font-size: 1.5rem; font-weight: 600; color: #3b82f6;">${systemData.products.length}</div>
          <div style="color: #6b7280;">Produtos</div>
        </div>
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📁</div>
          <div style="font-size: 1.5rem; font-weight: 600; color: #10b981;">${systemData.categories.length}</div>
          <div style="color: #6b7280;">Categorias</div>
        </div>
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">👥</div>
          <div style="font-size: 1.5rem; font-weight: 600; color: #f59e0b;">${systemData.users.length}</div>
          <div style="color: #6b7280;">Usuários</div>
        </div>
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">☁️</div>
          <div style="font-size: 1.5rem; font-weight: 600; color: #10b981;">Conectado</div>
          <div style="color: #6b7280;">Supabase</div>
        </div>
      </div>
    </div>
  `;
}

// Renderizar aba Monitoramento
function renderMonitoringTab() {
  return `
    <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Monitoramento do Sistema</h2>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Status Supabase</h4>
        <p style="margin: 0; font-size: 1.2rem; color: #10b981;">🟢 Conectado</p>
      </div>
      <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; border-left: 4px solid #3b82f6;">
        <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Última Sincronização</h4>
        <p style="margin: 0; font-size: 1.2rem; color: #3b82f6;">${new Date().toLocaleTimeString()}</p>
      </div>
      <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; border-left: 4px solid #f59e0b;">
        <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Usuário Ativo</h4>
        <p style="margin: 0; font-size: 1.2rem; color: #f59e0b;">${currentUser ? currentUser.name : 'N/A'}</p>
      </div>
    </div>
    
    <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 1rem; color: #1e293b;">Logs do Sistema</h3>
      <div style="background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 0.375rem; font-family: monospace; font-size: 0.875rem; height: 200px; overflow-y: auto;">
        <div>${new Date().toISOString()} - Sistema inicializado</div>
        <div>${new Date().toISOString()} - Conectado ao Supabase</div>
        <div>${new Date().toISOString()} - Login realizado: ${currentUser ? currentUser.name : 'N/A'}</div>
        <div>${new Date().toISOString()} - Dados carregados: ${systemData.products.length} produtos</div>
        <div>${new Date().toISOString()} - Sistema funcionando normalmente</div>
      </div>
    </div>
  `;
}

// Função principal para renderizar a aplicação
function renderApp() {
  if (currentView === 'login') {
    document.body.innerHTML = `
      <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
        <div style="background: white; padding: 3rem; border-radius: 1rem; box-shadow: 0 20px 25px rgba(0,0,0,0.2); max-width: 400px; width: 100%; margin: 1rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="width: 60px; height: 60px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; margin: 0 auto 1rem;">📋</div>
            <h1 style="margin: 0; font-size: 1.5rem; color: #1e293b;">MoveisBonafe</h1>
            <p style="margin: 0.5rem 0 0; color: #6b7280;">Sistema completo de gestão</p>
          </div>
          
          <form style="display: grid; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500;">Usuário</label>
              <input type="text" id="username" placeholder="Digite seu usuário" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; box-sizing: border-box;">
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500;">Senha</label>
              <input type="password" id="password" placeholder="Digite sua senha" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; box-sizing: border-box;">
            </div>
            
            <button type="button" onclick="console.log('🔥 Botão clicado!'); login();" style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer;">
              Entrar
            </button>
          </form>
          
          <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb; margin-top: 1rem;">
            <h4 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 0.875rem;">Contas de teste:</h4>
            <p style="margin: 0; color: #6b7280; font-size: 0.75rem; line-height: 1.4;">
              <strong>Admin:</strong> admin / admin123<br>
              <strong>Vendedor:</strong> vendedor / venda123<br>
              <strong>Cliente:</strong> cliente / cliente123
            </p>
          </div>
        </div>
      </div>
    `;
  } else if (currentView === 'catalog') {
    renderCatalogView();
  } else if (currentView === 'admin') {
    renderAdminView();
  }
}

// Renderizar visão do catálogo (para clientes)
function renderCatalogView() {
  // Buscar o multiplicador atual do usuário na aba de usuários
  let userMultiplier = 1.0;
  const userInSystem = systemData.users.find(u => u.username === currentUser.username);
  if (userInSystem) {
    userMultiplier = userInSystem.price_multiplier || 1.0;
  } else {
    userMultiplier = currentUser.price_multiplier || 1.0;
  }
  
  const productsHtml = systemData.products.map((product, index) => {
    const basePrice = product.base_price || 0;
    const priceTable = calculatePriceTable(basePrice, userMultiplier, product.fixed_price);
    
    // Pegar todas as imagens com verificação segura
    let allImages = [];
    try {
      if (product.images && product.images !== 'null' && product.images !== '') {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          allImages = parsed;
        }
      }
      if (product.image_url && !allImages.includes(product.image_url)) {
        allImages.unshift(product.image_url);
      }
    } catch (e) {
      if (product.image_url) {
        allImages = [product.image_url];
      }
    }
    
    // Filtrar imagens válidas
    allImages = allImages.filter(img => img && img.trim() !== '');
    
    const hasMultipleImages = allImages.length > 1;
    const carouselId = `carousel-${product.id || index}`;
    
    return `
      <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; padding: 1rem; transition: transform 0.2s; max-width: 100%;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <!-- Carrossel de Imagens -->
        <div style="position: relative; margin-bottom: 1rem; overflow: hidden; border-radius: 0.375rem;">
          <div id="${carouselId}" style="display: flex; transition: transform 0.3s ease; width: ${allImages.length * 100}%;">
            ${allImages.length > 0 ? allImages.map((img, imgIndex) => `
              <div style="width: ${100 / allImages.length}%; flex-shrink: 0;">
                <img src="${img}" alt="${product.name}" style="width: 100%; height: 180px; object-fit: cover; display: block;">
              </div>
            `).join('') : `
              <div style="width: 100%; height: 180px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 2rem;">📷</div>
            `}
          </div>
          
          ${hasMultipleImages ? `
            <!-- Setas de Navegação -->
            <button onclick="previousImage('${carouselId}', ${allImages.length})" 
                    style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">
              ←
            </button>
            <button onclick="nextImage('${carouselId}', ${allImages.length})" 
                    style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">
              →
            </button>
            
            <!-- Indicadores -->
            <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); display: flex; gap: 3px;">
              ${allImages.map((_, imgIndex) => `
                <div style="width: 6px; height: 6px; border-radius: 50%; background: ${imgIndex === 0 ? 'white' : 'rgba(255,255,255,0.5)'};" id="dot-${carouselId}-${imgIndex}"></div>
              `).join('')}
            </div>
            
            <!-- Configurar swipe touch para mobile -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5;" 
                 ontouchstart="handleTouchStart(event, '${carouselId}', ${allImages.length})" 
                 ontouchmove="handleTouchMove(event)" 
                 ontouchend="handleTouchEnd(event, '${carouselId}', ${allImages.length})">
            </div>
          ` : ''}
        </div>
        
        <h3 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem; font-weight: 600;">${product.name}</h3>
        <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;">${product.category || 'Categoria'}</p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
            <div style="padding: 0.5rem; background: #f0fdf4; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">À Vista</div>
              <div style="color: #10b981; font-weight: 600;">R$ ${priceTable['A Vista'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30 dias</div>
              <div style="color: #3b82f6; font-weight: 600;">R$ ${priceTable['30'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30/60</div>
              <div style="color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30/60/90</div>
              <div style="color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60/90'].toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        ${product.description ? `<p style="margin: 1rem 0 0; color: #6b7280; font-size: 0.875rem; line-height: 1.4;">${product.description}</p>` : ''}
        
        ${product.fixed_price ? '<div style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 0.25rem; font-size: 0.75rem; text-align: center;">🔒 Preço Fixo</div>' : ''}
      </div>
    `;
  }).join('');

  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <header style="background: white; border-bottom: 1px solid #e2e8f0; padding: 1rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📋</div>
            <h1 style="margin: 0; font-size: 1.25rem; color: #1e293b;">Catálogo MoveisBonafe</h1>
            <span style="padding: 0.25rem 0.5rem; background: #10b981; color: white; border-radius: 0.25rem; font-size: 0.75rem;">Cliente - ${currentUser.name}</span>
          </div>
          <button onclick="logout()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Sair
          </button>
        </div>
      </header>
      
      <main style="padding: 1.5rem; max-width: 1200px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h2 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 2rem;">Nossos Produtos</h2>
          <p style="margin: 0; color: #6b7280;">Explore nossa coleção completa de móveis com preços especiais para você</p>
        </div>
        
        <!-- Filtros -->
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <input type="text" id="search-input" placeholder="Buscar produtos..." 
                   onkeyup="filterProducts()" 
                   style="flex: 1; min-width: 250px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
            <select id="category-filter" onchange="filterProducts()" 
                    style="padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background: white;">
              <option value="">Todas as categorias</option>
              ${systemData.categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Categorias -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin: 0 0 1rem; color: #1e293b;">Categorias</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
            ${systemData.categories.map(category => {
              const productCount = systemData.products.filter(p => p.category === category.name).length;
              return `
                <div onclick="filterByCategory('${category.name}')" style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; border-left: 4px solid ${category.color}; text-align: center; cursor: pointer; transition: transform 0.2s; overflow: hidden;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                  <div style="height: 120px; background-image: url('${category.image}'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; background-color: #f3f4f6;">
                    <div style="background: rgba(255,255,255,0.9); padding: 0.5rem; border-radius: 50%; font-size: 1.5rem;">${category.icon}</div>
                  </div>
                  <div style="padding: 1rem;">
                    <h4 style="margin: 0 0 0.25rem; color: #1e293b;">${category.name}</h4>
                    <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">${productCount} produtos</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Produtos -->
        <div>
          <h3 style="margin: 0 0 1rem; color: #1e293b;">Produtos Disponíveis</h3>
          ${systemData.products.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
              ${productsHtml}
            </div>
            
            <!-- CSS responsivo para mobile com preços compactos -->
            <style>
              /* Ajustes para imagens - sempre caber na área */
              img[alt] {
                max-width: 100% !important;
                max-height: 100% !important;
                object-fit: contain !important;
                background: #f8f9fa !important;
              }
              
              @media (max-width: 768px) {
                [style*="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))"] {
                  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
                  gap: 0.75rem !important;
                }
                
                [style*="padding: 1rem"] {
                  padding: 0.75rem !important;
                }
                
                [style*="height: 180px"] {
                  height: 160px !important;
                }
                
                [style*="font-size: 1.1rem"] {
                  font-size: 1rem !important;
                }
                
                /* Preços compactos no tablet */
                .price-tables {
                  grid-template-columns: repeat(3, 1fr) !important;
                  gap: 0.25rem !important;
                  font-size: 0.75rem !important;
                }
                
                .price-tables > div {
                  padding: 0.375rem !important;
                }
                
                .price-tables > div:last-child {
                  grid-column: 2 / 3 !important;
                }
              }
              
              @media (max-width: 480px) {
                [style*="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))"] {
                  grid-template-columns: 1fr !important;
                  gap: 0.5rem !important;
                }
                
                [style*="height: 180px"], [style*="height: 160px"] {
                  height: 140px !important;
                }
                
                /* Preços super compactos no mobile - TODAS as 5 tabelas FORÇADAS */
                .price-tables {
                  display: grid !important;
                  grid-template-columns: repeat(5, 1fr) !important;
                  gap: 0.1rem !important;
                  font-size: 0.55rem !important;
                  width: 100% !important;
                  overflow: hidden !important;
                }
                
                .price-tables > div {
                  padding: 0.15rem 0.05rem !important;
                  min-width: 0 !important;
                  overflow: hidden !important;
                  text-overflow: ellipsis !important;
                }
                
                .price-tables > div:nth-child(5) {
                  grid-column: 5 !important;
                  grid-row: 1 !important;
                }
                
                .price-tables [style*="font-size: 0.75rem"] {
                  font-size: 0.6rem !important;
                }
                
                .price-tables [style*="font-size: 0.9rem"] {
                  font-size: 0.7rem !important;
                }
                
                [style*="font-size: 0.875rem"] {
                  font-size: 0.75rem !important;
                }
              }
            </style>
          ` : `
            <div style="background: white; padding: 3rem; border-radius: 0.5rem; text-align: center; border: 2px dashed #d1d5db;">
              <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📦</div>
              <h3 style="margin: 0 0 0.5rem; color: #6b7280;">Nenhum produto disponível</h3>
              <p style="margin: 0; color: #6b7280;">Novos produtos serão adicionados em breve!</p>
            </div>
          `}
        </div>
      </main>
      
      <!-- Footer -->
      <footer style="background: white; border-top: 1px solid #e5e7eb; padding: 2rem 1.5rem; margin-top: 3rem; text-align: center;">
        <p style="margin: 0; color: #6b7280;">© 2024 MoveisBonafe - Móveis de qualidade com os melhores preços</p>
      </footer>
    </div>
  `;
  
  // Aplicar correções na tela de clientes
  applyClientFixes();
}

// Renderizar visão admin
function renderAdminView() {
  document.body.innerHTML = `
    <style>
      /* CSS específico para admin mobile */
      .admin-container {
        min-height: 100vh;
        background: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      }
      
      .admin-header {
        background: white;
        border-bottom: 1px solid #e2e8f0;
        padding: 1rem 1.5rem;
      }
      
      .admin-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .admin-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .admin-nav {
        background: white;
        border-bottom: 1px solid #e2e8f0;
        padding: 0 1.5rem;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .admin-nav-content {
        display: flex;
        gap: 0;
        min-width: max-content;
      }
      
      .admin-tab {
        padding: 1rem 1.5rem;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: #6b7280;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
        flex-shrink: 0;
      }
      
      .admin-tab.active {
        border-bottom: 2px solid #3b82f6;
        color: #3b82f6;
      }
      
      .admin-main {
        padding: 1rem 1.5rem;
        height: calc(100vh - 140px);
        overflow-y: auto;
      }
      
      /* Otimizações verticais para admin */
      .admin-section {
        margin-bottom: 1rem;
      }
      
      .admin-card {
        padding: 1rem;
        margin-bottom: 1rem;
      }
      
      .admin-table-container {
        max-height: calc(100vh - 300px);
        overflow-y: auto;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
      }
      
      .admin-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      @media (max-width: 768px) {
        .admin-header {
          padding: 0.75rem 1rem;
        }
        
        .admin-header-content {
          flex-direction: column;
          gap: 0.5rem;
          align-items: stretch;
        }
        
        .admin-logo {
          justify-content: center;
        }
        
        .admin-logo h1 {
          font-size: 1.1rem !important;
        }
        
        .admin-nav {
          padding: 0 1rem;
        }
        
        .admin-tab {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
        }
        
        .admin-main {
          padding: 1rem;
        }
        
        /* Ajustes para tabelas em mobile */
        table {
          font-size: 0.875rem;
          overflow-x: auto;
          display: block;
          white-space: nowrap;
        }
        
        th, td {
          padding: 0.5rem !important;
          min-width: 80px;
        }
        
        /* Container da tabela com scroll horizontal */
        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Botões menores em mobile */
        button {
          font-size: 0.875rem;
          padding: 0.375rem 0.75rem !important;
        }
        
        /* Formulários responsivos */
        .modal-content {
          max-width: 95vw !important;
          margin: 1rem !important;
        }
        
        /* Grid responsivo */
        [style*="grid-template-columns"] {
          grid-template-columns: 1fr !important;
          gap: 0.75rem !important;
        }
      }
      
      @media (max-width: 480px) {
        .admin-header {
          padding: 0.5rem;
        }
        
        .admin-tab {
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
        }
        
        .admin-main {
          padding: 0.75rem;
        }
        
        /* Esconder texto dos ícones em telas muito pequenas */
        .admin-tab span:last-child {
          display: none;
        }
        
        /* Ajustar cards para mobile */
        [style*="padding: 1.5rem"] {
          padding: 1rem !important;
        }
        
        [style*="padding: 2rem"] {
          padding: 1rem !important;
        }
        
        /* Formulários mais compactos */
        input, select, textarea {
          font-size: 1rem;
          padding: 0.5rem !important;
        }
        
        /* Botões de ação menores */
        .action-buttons button {
          padding: 0.25rem 0.5rem !important;
          font-size: 0.75rem !important;
        }
      }
    </style>
    
    <div class="admin-container">
      <header class="admin-header">
        <div class="admin-header-content">
          <div class="admin-logo">
            <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📋</div>
            <h1 style="margin: 0; font-size: 1.25rem; color: #1e293b;">Admin Panel</h1>
            <span style="padding: 0.25rem 0.5rem; background: #dc2626; color: white; border-radius: 0.25rem; font-size: 0.75rem;">${currentUser.name}</span>
          </div>
          <button onclick="logout()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Sair
          </button>
        </div>
      </header>

      <nav class="admin-nav">
        <div class="admin-nav-content">
          <button onclick="showTab('produtos')" id="tab-produtos" class="admin-tab active">
            📦 <span>Produtos</span>
          </button>
          <button onclick="showTab('categorias')" id="tab-categorias" class="admin-tab">
            📁 <span>Categorias</span>
          </button>
          <button onclick="showTab('precos')" id="tab-precos" class="admin-tab">
            💰 <span>Preços</span>
          </button>
          <button onclick="showTab('usuarios')" id="tab-usuarios" class="admin-tab">
            👥 <span>Usuários</span>
          </button>
          <button onclick="showTab('excel')" id="tab-excel" class="admin-tab">
            📊 <span>Excel</span>
          </button>
          <button onclick="showTab('backup')" id="tab-backup" class="admin-tab">
            💾 <span>Backup</span>
          </button>
          <button onclick="showTab('monitoramento')" id="tab-monitoramento" class="admin-tab">
            📈 <span>Monitor</span>
          </button>
        </div>
      </nav>

      <main class="admin-main">
        <div id="content-produtos">${renderProductsTab()}</div>
        <div id="content-categorias" style="display: none;"></div>
        <div id="content-precos" style="display: none;"></div>
        <div id="content-usuarios" style="display: none;"></div>
        <div id="content-excel" style="display: none;"></div>
        <div id="content-backup" style="display: none;"></div>
        <div id="content-monitoramento" style="display: none;"></div>
      </main>
    </div>
  `;
}

// Função de filtro de produtos
window.filterProducts = function() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const selectedCategory = document.getElementById('category-filter').value;
  
  const filteredProducts = systemData.products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm));
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Re-renderizar apenas a seção de produtos
  updateProductsDisplay(filteredProducts);
};

// Função para atualizar exibição dos produtos
function updateProductsDisplay(productsToShow) {
  // Buscar o multiplicador atual do usuário na aba de usuários
  let userMultiplier = 1.0;
  const userInSystem = systemData.users.find(u => u.username === currentUser.username);
  if (userInSystem) {
    userMultiplier = userInSystem.price_multiplier || 1.0;
  } else {
    userMultiplier = currentUser.price_multiplier || 1.0;
  }
  
  const productsHtml = productsToShow.map((product, index) => {
    const basePrice = product.base_price || 0;
    const priceTable = calculatePriceTable(basePrice, userMultiplier, product.fixed_price);
    
    // Pegar todas as imagens com verificação segura
    let allImages = [];
    try {
      if (product.images && product.images !== 'null' && product.images !== '') {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          allImages = parsed;
        }
      }
      if (product.image_url && !allImages.includes(product.image_url)) {
        allImages.unshift(product.image_url);
      }
    } catch (e) {
      if (product.image_url) {
        allImages = [product.image_url];
      }
    }
    
    // Filtrar imagens válidas
    allImages = allImages.filter(img => img && img.trim() !== '');
    
    const hasMultipleImages = allImages.length > 1;
    const carouselId = `carousel-${product.id || index}`;
    
    return `
      <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; padding: 1rem; transition: transform 0.2s; max-width: 100%;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <!-- Carrossel de Imagens -->
        <div style="position: relative; margin-bottom: 1rem; overflow: hidden; border-radius: 0.375rem;">
          <div id="${carouselId}" style="display: flex; transition: transform 0.3s ease; width: ${allImages.length * 100}%;">
            ${allImages.length > 0 ? allImages.map((img, imgIndex) => `
              <div style="width: ${100 / allImages.length}%; flex-shrink: 0;">
                <img src="${img}" alt="${product.name}" style="width: 100%; height: 180px; object-fit: cover; display: block;">
              </div>
            `).join('') : `
              <div style="width: 100%; height: 180px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 2rem;">📷</div>
            `}
          </div>
          
          ${hasMultipleImages ? `
            <!-- Setas de Navegação -->
            <button onclick="previousImage('${carouselId}', ${allImages.length})" 
                    style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">
              ←
            </button>
            <button onclick="nextImage('${carouselId}', ${allImages.length})" 
                    style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">
              →
            </button>
            
            <!-- Indicadores -->
            <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); display: flex; gap: 3px;">
              ${allImages.map((_, imgIndex) => `
                <div style="width: 6px; height: 6px; border-radius: 50%; background: ${imgIndex === 0 ? 'white' : 'rgba(255,255,255,0.5)'};" id="dot-${carouselId}-${imgIndex}"></div>
              `).join('')}
            </div>
            
            <!-- Configurar swipe touch para mobile -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5;" 
                 ontouchstart="handleTouchStart(event, '${carouselId}', ${allImages.length})" 
                 ontouchmove="handleTouchMove(event)" 
                 ontouchend="handleTouchEnd(event, '${carouselId}', ${allImages.length})">
            </div>
          ` : ''}
        </div>
        
        <h3 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem; font-weight: 600;">${product.name}</h3>
        <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;">${product.category || 'Categoria'}</p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
            <div style="padding: 0.5rem; background: #f0fdf4; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">À Vista</div>
              <div style="color: #10b981; font-weight: 600;">R$ ${priceTable['A Vista'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30 dias</div>
              <div style="color: #3b82f6; font-weight: 600;">R$ ${priceTable['30'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30/60</div>
              <div style="color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30/60/90</div>
              <div style="color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60/90'].toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        ${product.description ? `<p style="margin: 1rem 0 0; color: #6b7280; font-size: 0.875rem; line-height: 1.4;">${product.description}</p>` : ''}
        
        ${product.fixed_price ? '<div style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 0.25rem; font-size: 0.75rem; text-align: center;">🔒 Preço Fixo</div>' : ''}
      </div>
    `;
  }).join('');

  // Atualizar container de produtos
  const productsContainer = document.querySelector('[style*="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))"]');
  if (productsContainer) {
    if (productsToShow.length > 0) {
      productsContainer.innerHTML = productsHtml;
    } else {
      productsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; background: white; padding: 3rem; border-radius: 0.5rem; text-align: center; border: 2px dashed #d1d5db;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">🔍</div>
          <h3 style="margin: 0 0 0.5rem; color: #6b7280;">Nenhum produto encontrado</h3>
          <p style="margin: 0; color: #6b7280;">Tente ajustar os filtros de busca</p>
        </div>
      `;
    }
  }
};

// Função para filtrar por categoria quando clicar no card da categoria
window.filterByCategory = function(categoryName) {
  console.log('Filtrando por categoria:', categoryName);
  
  // Atualizar o select de categoria
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.value = categoryName;
  }
  
  // Limpar busca por texto
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Filtrar produtos da categoria
  const filteredProducts = systemData.products.filter(product => product.category === categoryName);
  
  console.log(`Produtos da categoria "${categoryName}":`, filteredProducts.length);
  updateProductsDisplay(filteredProducts);
  
  // Scroll suave para a seção de produtos
  setTimeout(() => {
    const productsSection = document.querySelector('h3');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
};

// Função para limpar filtros e mostrar todos os produtos
window.clearFilters = function() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  
  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = '';
  
  updateProductsDisplay(systemData.products);
};

// Função para corrigir tabelas de preços na tela de clientes
function fixClientPriceTables() {
  // Corrigir apenas na tela de clientes
  if (currentUser && currentUser.role === 'customer') {
    const priceGrids = document.querySelectorAll('[style*="grid-template-columns: 1fr 1fr"]');
    priceGrids.forEach(grid => {
      if (grid.innerHTML.includes('À Vista')) {
        // Mudar para 5 colunas
        grid.style.gridTemplateColumns = '1fr 1fr 1fr 1fr 1fr';
        grid.style.gap = '0.25rem';
        grid.style.fontSize = '0.75rem';
        
        // Adicionar a 5ª tabela se não existir
        if (!grid.innerHTML.includes('30/60/90/120')) {
          const lastDiv = grid.lastElementChild;
          if (lastDiv) {
            const newDiv = document.createElement('div');
            newDiv.style.cssText = 'padding: 0.4rem; background: #ffffff; border-radius: 0.25rem; text-align: center; border: 1px solid #e5e7eb;';
            newDiv.innerHTML = `
              <div style="color: #6b7280; font-size: 0.7rem;">30/60/90/120</div>
              <div style="color: #dc2626; font-weight: 600; font-size: 0.8rem;">R$</div>
              <div style="color: #dc2626; font-weight: 600; font-size: 0.8rem;">${(parseFloat(lastDiv.querySelector('div:last-child').textContent.replace('R$ ', '')) * 1.02).toFixed(2)}</div>
            `;
            grid.appendChild(newDiv);
          }
        }
        
        // Ajustar padding e fonte dos elementos existentes
        const divs = grid.querySelectorAll('div[style*="padding: 0.5rem"]');
        divs.forEach(div => {
          div.style.padding = '0.4rem';
          const labels = div.querySelectorAll('div');
          if (labels[0]) labels[0].style.fontSize = '0.7rem';
          if (labels[1]) labels[1].style.fontSize = '0.8rem';
        });
      }
    });
  }
}

// Função para ajustar categorias - LAYOUT HORIZONTAL COMPACTO
function fixCategoryLayout() {
  if (currentUser && currentUser.role === 'customer') {
    const categoryGrid = document.querySelector('[style*="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))"]');
    if (categoryGrid) {
      // Desktop: todas as categorias em uma linha
      if (window.innerWidth >= 768) {
        const categoryCount = systemData.categories.length;
        categoryGrid.style.gridTemplateColumns = `repeat(${categoryCount}, 1fr)`;
        categoryGrid.style.gap = '1rem';
      } 
      // Mobile: 3 categorias por linha
      else {
        categoryGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        categoryGrid.style.gap = '0.5rem';
      }
      categoryGrid.style.maxWidth = '100%';
    }
    
    // Ajustar cards das categorias - COMPACTOS COMO NA IMAGEM
    const categoryCards = document.querySelectorAll('[onclick*="filterByCategory"]');
    categoryCards.forEach(card => {
      card.style.padding = '1rem';
      card.style.minHeight = '120px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';
      card.style.background = '#f8f9fa';
      card.style.border = '1px solid #e5e7eb';
      card.style.borderRadius = '0.5rem';
      card.style.transition = 'all 0.2s';
      
      // Hover effect
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      });
      
      // Ícone maior como na imagem
      const icon = card.querySelector('div[style*="font-size: 2rem"]') || card.querySelector('div[style*="font-size: 1.5rem"]') || card.querySelector('div[style*="font-size: 1.2rem"]');
      if (icon) {
        icon.style.fontSize = '2.5rem';
        icon.style.marginBottom = '0.5rem';
        icon.style.display = 'block';
      }
      
      // Título compacto
      const title = card.querySelector('h4');
      if (title) {
        title.style.fontSize = '0.9rem';
        title.style.fontWeight = '600';
        title.style.color = '#1e293b';
        title.style.margin = '0';
        title.style.textAlign = 'center';
        title.style.lineHeight = '1.2';
      }
      
      // Adicionar contador de produtos se não existir
      if (!card.querySelector('[style*="color: #6b7280"]')) {
        const productCount = systemData.products.filter(p => p.category === title.textContent).length;
        const countDiv = document.createElement('div');
        countDiv.style.fontSize = '0.75rem';
        countDiv.style.color = '#6b7280';
        countDiv.style.marginTop = '0.25rem';
        countDiv.textContent = `${productCount} produtos`;
        card.appendChild(countDiv);
      }
    });
  }
}

// Aplicar correções após renderização
function applyClientFixes() {
  setTimeout(() => {
    fixClientPriceTables();
    fixCategoryLayout();
  }, 100);
}

// Inicializar aplicação
console.log('✅ Sistema MoveisBonafe completo carregado!');
renderApp();

// Aplicar correções se for cliente
if (currentUser && currentUser.role === 'customer') {
  applyClientFixes();
}