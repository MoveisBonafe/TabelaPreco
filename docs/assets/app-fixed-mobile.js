// MoveisBonafe - Sistema corrigido para mobile
console.log('🎉 Sistema MoveisBonafe com correções mobile carregando...');

// Configuração do Supabase
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
    { id: 1, name: 'Sala de Estar', icon: '🛋️', color: '#3b82f6' },
    { id: 2, name: 'Quarto', icon: '🛏️', color: '#10b981' },
    { id: 3, name: 'Cozinha', icon: '🍽️', color: '#f59e0b' },
    { id: 4, name: 'Escritório', icon: '💼', color: '#8b5cf6' }
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

// Variáveis para controle do carrossel
let carouselStates = {};
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;

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
    'cliente': { id: 3, username: 'cliente', password: 'cliente123', role: 'customer', name: 'Cliente Teste', price_multiplier: 1.5, active: true }
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

// Calcular preços com incrementos das tabelas
function calculatePriceTable(basePrice, userMultiplier = 1, isFixedPrice = false) {
  if (isFixedPrice) {
    return Object.keys(systemData.priceSettings).reduce((acc, table) => {
      const increment = systemData.priceSettings[table] / 100;
      acc[table] = basePrice * (1 + increment);
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

// Função de logout
window.logout = function() {
  currentUser = null;
  currentView = 'login';
  renderApp();
};

// Funções do carrossel com touch melhorado
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

// Funções de touch CORRIGIDAS para mobile
window.handleTouchStart = function(evt, carouselId, totalImages) {
  evt.stopPropagation();
  const touch = evt.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  isDragging = false;
  console.log('Touch iniciado:', touchStartX);
};

window.handleTouchMove = function(evt) {
  evt.stopPropagation();
  if (Math.abs(evt.touches[0].clientX - touchStartX) > 10) {
    isDragging = true;
    evt.preventDefault();
  }
};

window.handleTouchEnd = function(evt, carouselId, totalImages) {
  evt.stopPropagation();
  
  if (!isDragging) return;
  
  const touch = evt.changedTouches[0];
  const touchEndX = touch.clientX;
  const deltaX = touchEndX - touchStartX;
  
  console.log('Swipe detectado - deltaX:', deltaX);
  
  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      console.log('Swipe direita');
      previousImage(carouselId, totalImages);
    } else {
      console.log('Swipe esquerda');
      nextImage(carouselId, totalImages);
    }
  }
  
  isDragging = false;
};

// Função de filtro CORRIGIDA
window.filterProducts = function() {
  console.log('Filtro acionado');
  
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  
  if (!searchInput || !categoryFilter) {
    console.log('Elementos de filtro não encontrados');
    return;
  }
  
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  
  console.log('Busca:', searchTerm, 'Categoria:', selectedCategory);
  
  const filteredProducts = systemData.products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm));
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  console.log('Produtos filtrados:', filteredProducts.length);
  updateProductsDisplay(filteredProducts);
};

// Função para atualizar produtos na tela
function updateProductsDisplay(productsToShow) {
  const userMultiplier = currentUser.price_multiplier || 1.5;
  
  const productsHtml = productsToShow.map((product, index) => {
    const basePrice = product.base_price || 0;
    const priceTable = calculatePriceTable(basePrice, userMultiplier, product.fixed_price);
    
    // Pegar todas as imagens
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
      <div class="product-card">
        <div class="carousel-container">
          <div id="${carouselId}" class="carousel-track" style="width: ${allImages.length * 100}%;">
            ${allImages.length > 0 ? allImages.map(img => `
              <div class="carousel-slide" style="width: ${100 / allImages.length}%;">
                <img src="${img}" alt="${product.name}" class="product-image">
              </div>
            `).join('') : `
              <div class="carousel-slide no-image">📷</div>
            `}
          </div>
          
          ${hasMultipleImages ? `
            <button onclick="previousImage('${carouselId}', ${allImages.length})" class="carousel-btn carousel-btn-prev">←</button>
            <button onclick="nextImage('${carouselId}', ${allImages.length})" class="carousel-btn carousel-btn-next">→</button>
            
            <div class="carousel-dots">
              ${allImages.map((_, imgIndex) => `
                <div class="carousel-dot ${imgIndex === 0 ? 'active' : ''}" id="dot-${carouselId}-${imgIndex}"></div>
              `).join('')}
            </div>
            
            <div class="touch-area" 
                 ontouchstart="handleTouchStart(event, '${carouselId}', ${allImages.length})" 
                 ontouchmove="handleTouchMove(event)" 
                 ontouchend="handleTouchEnd(event, '${carouselId}', ${allImages.length})">
            </div>
          ` : ''}
        </div>
        
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${product.category || 'Categoria'}</p>
          
          <div class="price-grid">
            <div class="price-item price-vista">
              <div class="price-label">À Vista</div>
              <div class="price-value">R$ ${priceTable['A Vista'].toFixed(2)}</div>
            </div>
            <div class="price-item price-parcel">
              <div class="price-label">30 dias</div>
              <div class="price-value">R$ ${priceTable['30'].toFixed(2)}</div>
            </div>
            <div class="price-item price-parcel">
              <div class="price-label">30/60</div>
              <div class="price-value">R$ ${priceTable['30/60'].toFixed(2)}</div>
            </div>
            <div class="price-item price-parcel">
              <div class="price-label">30/60/90</div>
              <div class="price-value">R$ ${priceTable['30/60/90'].toFixed(2)}</div>
            </div>
          </div>
          
          ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
          ${product.fixed_price ? '<div class="fixed-price-badge">🔒 Preço Fixo</div>' : ''}
        </div>
      </div>
    `;
  }).join('');

  const productsContainer = document.getElementById('products-container');
  if (productsContainer) {
    if (productsToShow.length > 0) {
      productsContainer.innerHTML = productsHtml;
    } else {
      productsContainer.innerHTML = `
        <div class="no-products">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">🔍</div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar os filtros de busca</p>
        </div>
      `;
    }
  }
}

// Renderizar visão do catálogo para clientes
function renderCatalogView() {
  const userMultiplier = currentUser.price_multiplier || 1.5;
  
  document.body.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
      
      .header { background: white; border-bottom: 1px solid #e2e8f0; padding: 1rem 1.5rem; }
      .header-content { display: flex; justify-content: space-between; align-items: center; }
      .logo { display: flex; align-items: center; gap: 0.75rem; }
      .logo-icon { width: 32px; height: 32px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
      .user-badge { padding: 0.25rem 0.5rem; background: #10b981; color: white; border-radius: 0.25rem; font-size: 0.75rem; }
      .logout-btn { padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; }
      
      .main { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }
      .hero { text-align: center; margin-bottom: 2rem; }
      .hero h2 { margin: 0 0 0.5rem; color: #1e293b; font-size: 2rem; }
      .hero p { margin: 0; color: #6b7280; }
      
      .filters { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
      .filters-content { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
      .search-input { flex: 1; min-width: 250px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem; }
      .category-select { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background: white; }
      
      .categories-section { margin-bottom: 2rem; }
      .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
      .category-card { background: white; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; text-align: center; cursor: pointer; transition: transform 0.2s; }
      .category-card:hover { transform: translateY(-2px); }
      .category-icon { font-size: 2rem; margin-bottom: 0.5rem; }
      .category-name { margin: 0 0 0.25rem; color: #1e293b; }
      .category-count { margin: 0; color: #6b7280; font-size: 0.875rem; }
      
      .products-section h3 { margin: 0 0 1rem; color: #1e293b; }
      #products-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
      
      .product-card { background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; padding: 1rem; transition: transform 0.2s; }
      .product-card:hover { transform: translateY(-2px); }
      
      .carousel-container { position: relative; margin-bottom: 1rem; overflow: hidden; border-radius: 0.375rem; background: #f8f9fa; }
      .carousel-track { display: flex; transition: transform 0.3s ease; }
      .carousel-slide { flex-shrink: 0; }
      .product-image { width: 100%; height: 180px; object-fit: contain; display: block; }
      .no-image { width: 100%; height: 180px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 2rem; background: #f3f4f6; }
      
      .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }
      .carousel-btn-prev { left: 5px; }
      .carousel-btn-next { right: 5px; }
      
      .carousel-dots { position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); display: flex; gap: 3px; }
      .carousel-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.5); }
      .carousel-dot.active { background: white; }
      
      .touch-area { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; }
      
      .product-info { }
      .product-name { margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem; font-weight: 600; }
      .product-category { margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem; }
      
      .price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem; border-top: 1px solid #e5e7eb; padding-top: 1rem; }
      .price-item { padding: 0.5rem; border-radius: 0.25rem; text-align: center; }
      .price-vista { background: #f0fdf4; }
      .price-parcel { background: #eff6ff; }
      .price-label { color: #6b7280; }
      .price-value { font-weight: 600; margin-top: 0.25rem; }
      .price-vista .price-value { color: #10b981; }
      .price-parcel .price-value { color: #3b82f6; }
      
      .product-description { margin: 1rem 0 0; color: #6b7280; font-size: 0.875rem; line-height: 1.4; }
      .fixed-price-badge { margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 0.25rem; font-size: 0.75rem; text-align: center; }
      
      .no-products { grid-column: 1 / -1; background: white; padding: 3rem; border-radius: 0.5rem; text-align: center; border: 2px dashed #d1d5db; }
      .no-products h3 { margin: 0 0 0.5rem; color: #6b7280; }
      .no-products p { margin: 0; color: #6b7280; }
      
      .footer { background: white; border-top: 1px solid #e5e7eb; padding: 2rem 1.5rem; margin-top: 3rem; text-align: center; }
      .footer p { margin: 0; color: #6b7280; }
      
      @media (max-width: 768px) {
        .main { padding: 1rem; }
        .hero h2 { font-size: 1.5rem; }
        .filters { padding: 1rem; }
        .filters-content { flex-direction: column; align-items: stretch; }
        .search-input { min-width: auto; }
        .categories-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
        #products-container { grid-template-columns: 1fr; gap: 0.75rem; }
        .product-image { height: 160px; }
        .price-grid { grid-template-columns: 1fr; gap: 0.25rem; }
      }
      
      @media (max-width: 480px) {
        .header { padding: 0.75rem 1rem; }
        .header-content { flex-direction: column; gap: 0.5rem; align-items: stretch; }
        .main { padding: 0.75rem; }
        .hero h2 { font-size: 1.25rem; }
        .filters { padding: 0.75rem; }
        .product-card { padding: 0.75rem; }
        .product-image { height: 140px; }
        .carousel-btn { width: 25px; height: 25px; }
      }
    </style>
    
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">📋</div>
          <h1 style="margin: 0; font-size: 1.25rem; color: #1e293b;">Catálogo MoveisBonafe</h1>
          <span class="user-badge">Cliente - ${currentUser.name}</span>
        </div>
        <button onclick="logout()" class="logout-btn">Sair</button>
      </div>
    </header>
    
    <main class="main">
      <div class="hero">
        <h2>Nossos Produtos</h2>
        <p>Explore nossa coleção completa de móveis com preços especiais para você</p>
      </div>
      
      <div class="filters">
        <div class="filters-content">
          <input type="text" id="search-input" placeholder="Buscar produtos..." class="search-input" onkeyup="filterProducts()" oninput="filterProducts()">
          <select id="category-filter" onchange="filterProducts()" class="category-select">
            <option value="">Todas as categorias</option>
            ${systemData.categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="categories-section">
        <h3>Categorias</h3>
        <div class="categories-grid">
          ${systemData.categories.map(category => {
            const productCount = systemData.products.filter(p => p.category === category.name).length;
            return `
              <div class="category-card" style="border-left: 4px solid ${category.color};">
                <div class="category-icon">${category.icon}</div>
                <h4 class="category-name">${category.name}</h4>
                <p class="category-count">${productCount} produtos</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="products-section">
        <h3>Produtos Disponíveis</h3>
        <div id="products-container">
          ${systemData.products.length > 0 ? '' : `
            <div class="no-products">
              <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📦</div>
              <h3>Nenhum produto disponível</h3>
              <p>Novos produtos serão adicionados em breve!</p>
            </div>
          `}
        </div>
      </div>
    </main>
    
    <footer class="footer">
      <p>© 2024 MoveisBonafe - Móveis de qualidade com os melhores preços</p>
    </footer>
  `;
  
  // Renderizar produtos inicial
  if (systemData.products.length > 0) {
    updateProductsDisplay(systemData.products);
  }
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
            
            <button type="button" onclick="login()" style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer;">
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
    // Aqui você manteria a função de admin que já estava funcionando
    document.body.innerHTML = '<h1>Painel Admin - Em desenvolvimento</h1>';
  }
}

// Inicializar aplicação
console.log('✅ Sistema MoveisBonafe com correções mobile carregado!');
renderApp();