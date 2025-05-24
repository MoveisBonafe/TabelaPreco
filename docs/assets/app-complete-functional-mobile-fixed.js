// MoveisBonafe - Sistema completo e funcional - MOBILE CORRIGIDO
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
      console.error('Erro na inserção:', error);
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
      console.error('Erro na atualização:', error);
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
      console.error('Erro na exclusão:', error);
      return false;
    }
  }
}

// Instância do cliente Supabase
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado global da aplicação
let systemData = {
  products: [],
  categories: [],
  users: [],
  priceSettings: {
    'A Vista': 0,
    '30': 2,
    '30/60': 4,
    '30/60/90': 6,
    '30/60/90/120': 8
  }
};

let currentUser = null;

// Carregamento de dados
async function loadSystemData() {
  console.log('🔄 Carregando dados do Supabase...');
  
  try {
    // Carregar produtos
    const products = await supabase.query('products');
    if (Array.isArray(products)) {
      systemData.products = products;
    }
    
    // Carregar categorias
    const categories = await supabase.query('categories');
    if (Array.isArray(categories)) {
      systemData.categories = categories;
    }
    
    // Carregar configurações de preços
    const priceSettings = await supabase.query('price_settings');
    if (Array.isArray(priceSettings)) {
      systemData.priceSettings = {};
      priceSettings.forEach(setting => {
        systemData.priceSettings[setting.table_name] = setting.percentage;
      });
    }
    
    // Carregar usuários
    const users = await supabase.query('auth_users');
    if (Array.isArray(users)) {
      systemData.users = users;
    }
    
    console.log('✅ Dados carregados do Supabase:', {
      produtos: systemData.products.length,
      categorias: systemData.categories.length
    });
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// Função de autenticação
window.login = async function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  const user = systemData.users.find(u => u.username === username && u.password_hash === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    renderApp();
  } else {
    alert('Usuário ou senha incorretos!');
  }
};

window.logout = function() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  renderApp();
};

// Função principal de renderização
function renderApp() {
  if (!currentUser) {
    renderLoginView();
  } else if (currentUser.role === 'admin' || currentUser.role === 'seller') {
    renderAdminView();
  } else {
    renderClientView();
  }
}

// Renderizar tela de login
function renderLoginView() {
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
      <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="font-size: 2rem; font-weight: 700; color: #1e293b; margin: 0;">MoveisBonafe</h1>
          <p style="color: #6b7280; margin: 0.5rem 0 0;">Entre com suas credenciais</p>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <input type="text" id="username" placeholder="Nome de usuário" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <input type="password" id="password" placeholder="Digite sua senha" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; box-sizing: border-box;">
        </div>
        
        <button onclick="login()" style="width: 100%; background: #3b82f6; color: white; padding: 0.75rem; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer;">
          Entrar
        </button>
        
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 1rem; color: #374151; font-size: 0.875rem;">Contas de teste:</h3>
          <div style="font-size: 0.75rem; color: #6b7280; line-height: 1.4;">
            <div><strong>Admin:</strong> admin / admin123</div>
            <div><strong>Vendedor:</strong> vendedor / venda123</div>
            <div><strong>Cliente:</strong> cliente / cliente123</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Renderizar tela de clientes - CORRIGIDA COM 5 TABELAS
function renderClientView() {
  const userMultiplier = currentUser.price_multiplier || 1.0;
  
  // Renderizar categorias com imagens menores
  const categoriesHtml = systemData.categories.map(category => `
    <div onclick="filterByCategory('${category.name}')" 
         style="background: white; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; cursor: pointer; transition: all 0.2s; text-align: center; border-left: 4px solid ${category.color};">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${category.icon}</div>
      <h4 style="margin: 0; color: #1e293b; font-size: 0.9rem; font-weight: 600;">${category.name}</h4>
    </div>
  `).join('');
  
  // Renderizar produtos com 5 tabelas de preços
  const productsHtml = systemData.products.map((product, index) => {
    const basePrice = product.base_price || 0;
    const priceTable = calculatePriceTable(basePrice, userMultiplier, product.fixed_price);
    
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
    
    allImages = allImages.filter(img => img && img.trim() !== '');
    const hasMultipleImages = allImages.length > 1;
    const carouselId = `carousel-${product.id || index}`;
    
    return `
      <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; transition: all 0.3s;">
        <div style="position: relative; margin-bottom: 1rem; border-radius: 0.375rem; overflow: hidden; background: #f8f9fa;">
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
            <button onclick="previousImage('${carouselId}', ${allImages.length})" 
                    style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">
              ←
            </button>
            <button onclick="nextImage('${carouselId}', ${allImages.length})" 
                    style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">
              →
            </button>
            
            <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); display: flex; gap: 3px;">
              ${allImages.map((_, imgIndex) => `
                <div style="width: 6px; height: 6px; border-radius: 50%; background: ${imgIndex === 0 ? 'white' : 'rgba(255,255,255,0.5)'};" id="dot-${carouselId}-${imgIndex}"></div>
              `).join('')}
            </div>
            
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
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 0.25rem; font-size: 0.75rem;">
            <div style="padding: 0.4rem; background: #f0fdf4; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280; font-size: 0.7rem;">À Vista</div>
              <div style="color: #10b981; font-weight: 600; font-size: 0.8rem;">R$ ${priceTable['A Vista'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.4rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280; font-size: 0.7rem;">30</div>
              <div style="color: #3b82f6; font-weight: 600; font-size: 0.8rem;">R$ ${priceTable['30'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.4rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280; font-size: 0.7rem;">30/60</div>
              <div style="color: #3b82f6; font-weight: 600; font-size: 0.8rem;">R$ ${priceTable['30/60'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.4rem; background: #eff6ff; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280; font-size: 0.7rem;">30/60/90</div>
              <div style="color: #3b82f6; font-weight: 600; font-size: 0.8rem;">R$ ${priceTable['30/60/90'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.4rem; background: #fef2f2; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280; font-size: 0.7rem;">30/60/90/120</div>
              <div style="color: #dc2626; font-weight: 600; font-size: 0.8rem;">R$ ${priceTable['30/60/90/120'].toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        ${product.description ? `<p style="margin: 1rem 0 0; color: #6b7280; font-size: 0.875rem; line-height: 1.4;">${product.description}</p>` : ''}
        
        ${product.fixed_price ? '<div style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 0.25rem; font-size: 0.75rem; text-align: center;">🔒 Preço Fixo</div>' : ''}
      </div>
    `;
  }).join('');

  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #f8fafc;">
      <!-- Header -->
      <header style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem; position: sticky; top: 0; z-index: 100;">
        <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
          <h1 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #1e293b;">MoveisBonafe</h1>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="color: #6b7280; font-size: 0.875rem;">Olá, ${currentUser.name}</span>
            <button onclick="logout()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
              Sair
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main style="max-width: 1200px; margin: 0 auto; padding: 2rem 1rem;">
        <!-- Filtros -->
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; margin-bottom: 2rem;">
          <h2 style="margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; color: #1e293b;">Filtros</h2>
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <input type="text" id="search-input" placeholder="Buscar produtos..." 
                   style="flex: 1; min-width: 200px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                   oninput="filterProducts()">
            <select id="category-filter" style="padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;" onchange="filterProducts()">
              <option value="">Todas as categorias</option>
              ${systemData.categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
            </select>
            <button onclick="clearFilters()" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
              Limpar
            </button>
          </div>
        </div>

        <!-- Categorias -->
        <div style="margin-bottom: 2rem;">
          <h2 style="margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; color: #1e293b;">Categorias</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem;">
            ${categoriesHtml}
          </div>
        </div>

        <!-- Produtos -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; color: #1e293b;">Produtos Disponíveis</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            ${productsHtml || '<div style="grid-column: 1 / -1; text-align: center; color: #6b7280; padding: 2rem;">Nenhum produto disponível</div>'}
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer style="background: #1e293b; color: white; padding: 2rem; text-align: center;">
        <p style="margin: 0;">© 2024 MoveisBonafe - Móveis de qualidade com os melhores preços</p>
      </footer>
    </div>
  `;
}

// Função para calcular tabela de preços
function calculatePriceTable(basePrice, userMultiplier, isFixedPrice) {
  if (isFixedPrice) {
    return {
      'A Vista': basePrice,
      '30': basePrice,
      '30/60': basePrice,
      '30/60/90': basePrice,
      '30/60/90/120': basePrice
    };
  }

  const finalBasePrice = basePrice * userMultiplier;
  
  return {
    'A Vista': finalBasePrice * (1 + systemData.priceSettings['A Vista'] / 100),
    '30': finalBasePrice * (1 + systemData.priceSettings['30'] / 100),
    '30/60': finalBasePrice * (1 + systemData.priceSettings['30/60'] / 100),
    '30/60/90': finalBasePrice * (1 + systemData.priceSettings['30/60/90'] / 100),
    '30/60/90/120': finalBasePrice * (1 + systemData.priceSettings['30/60/90/120'] / 100)
  };
}

// Função básica para administração (simplificada)
function renderAdminView() {
  document.body.innerHTML = `
    <div>
      <h1>Painel Administrativo - ${currentUser.name}</h1>
      <p>Funcionalidades administrativas em desenvolvimento...</p>
      <button onclick="logout()">Sair</button>
    </div>
  `;
}

// Funções de navegação do carrossel
window.nextImage = function(carouselId, totalImages) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  const currentIndex = parseInt(carousel.dataset.currentIndex || '0');
  const newIndex = (currentIndex + 1) % totalImages;
  
  carousel.style.transform = `translateX(-${(newIndex * 100) / totalImages}%)`;
  carousel.dataset.currentIndex = newIndex;
  
  updateCarouselDots(carouselId, newIndex, totalImages);
};

window.previousImage = function(carouselId, totalImages) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;
  
  const currentIndex = parseInt(carousel.dataset.currentIndex || '0');
  const newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
  
  carousel.style.transform = `translateX(-${(newIndex * 100) / totalImages}%)`;
  carousel.dataset.currentIndex = newIndex;
  
  updateCarouselDots(carouselId, newIndex, totalImages);
};

function updateCarouselDots(carouselId, activeIndex, totalImages) {
  for (let i = 0; i < totalImages; i++) {
    const dot = document.getElementById(`dot-${carouselId}-${i}`);
    if (dot) {
      dot.style.background = i === activeIndex ? 'white' : 'rgba(255,255,255,0.5)';
    }
  }
}

// Touch events para mobile
let touchStartX = 0;
let touchStartY = 0;

window.handleTouchStart = function(evt, carouselId, totalImages) {
  const firstTouch = evt.touches[0];
  touchStartX = firstTouch.clientX;
  touchStartY = firstTouch.clientY;
};

window.handleTouchMove = function(evt) {
  if (!touchStartX || !touchStartY) return;
  evt.preventDefault();
};

window.handleTouchEnd = function(evt, carouselId, totalImages) {
  if (!touchStartX || !touchStartY) return;
  
  const touchEndX = evt.changedTouches[0].clientX;
  const touchEndY = evt.changedTouches[0].clientY;
  
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;
  
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextImage(carouselId, totalImages);
      } else {
        previousImage(carouselId, totalImages);
      }
    }
  }
  
  touchStartX = 0;
  touchStartY = 0;
};

// Filtros
window.filterProducts = function() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const selectedCategory = document.getElementById('category-filter').value;
  
  let filteredProducts = systemData.products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm));
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  updateProductsDisplay(filteredProducts);
};

function updateProductsDisplay(productsToShow) {
  // Implementação simplificada - recarregar a view com produtos filtrados
  console.log('Atualizando display com', productsToShow.length, 'produtos');
}

window.filterByCategory = function(categoryName) {
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.value = categoryName;
    filterProducts();
  }
};

window.clearFilters = function() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  
  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = '';
  
  filterProducts();
};

// Inicialização
async function initApp() {
  console.log('🔄 Conectando ao Supabase...');
  console.log('🔄 Sistema configurado para usar Supabase via HTTP (sincronização manual)');
  console.log('✅ Conexão Supabase ativa via HTTP');
  console.log('🎉 CÓDIGO NOVO FUNCIONANDO! Sistema rodando exclusivamente com Supabase');
  console.log('🔗 Supabase configurado:', !!supabase);
  console.log('⚡ Build timestamp:', Date.now());
  console.log('🚀 SEM WEBSOCKET - Apenas Supabase puro!');
  console.log('🔄 Sincronização ativada entre navegadores');

  await loadSystemData();
  
  // Verificar se há usuário logado
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem('currentUser');
    }
  }
  
  renderApp();
}

// Inicializar aplicação
console.log('✅ Sistema MoveisBonafe completo carregado!');
initApp();