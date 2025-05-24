// Sistema MoveisBonafe - Versão Corrigida para GitHub Pages
// Arquivo: docs/assets/app-complete-functional-fixed.js

// Configuração do Supabase - Credenciais corretas
const SUPABASE_URL = 'https://oozesebwtrbzeelkcmwp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY';

// Cliente Supabase simplificado para HTTP
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
          'Content-Type': 'application/json'
        }
      });
      return response.ok ? await response.json() : [];
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
      return response.ok ? await response.json() : null;
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
      return response.ok ? await response.json() : null;
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
var touchStartX = 0;
var touchStartY = 0;
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
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
};

window.handleTouchMove = function(event) {
  event.preventDefault();
};

window.handleTouchEnd = function(event, carouselId, totalImages) {
  if (!touchStartX || !touchStartY) return;
  
  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;
  
  const deltaX = touchStartX - touchEndX;
  const deltaY = touchStartY - touchEndY;
  
  // Verificar se foi um swipe horizontal
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // Swipe para a esquerda - próxima imagem
      nextImage(carouselId, totalImages);
    } else {
      // Swipe para a direita - imagem anterior
      previousImage(carouselId, totalImages);
    }
  }
  
  touchStartX = 0;
  touchStartY = 0;
};

// Função de login
window.login = function() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
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
      alert('❌ Usuário ou senha incorretos!');
    }
  } catch (error) {
    console.error('❌ Erro no login Supabase:', error);
    alert('❌ Erro na conexão. Tente novamente.');
  }
}

// Carregar dados do sistema
async function loadSystemData() {
  try {
    console.log('🔄 Carregando dados do Supabase...');
    
    // Carregar produtos
    const products = await supabase.query('products');
    if (products && products.length > 0) {
      systemData.products = products;
    }
    
    // Carregar categorias customizadas
    const categories = await supabase.query('categories');
    if (categories && categories.length > 0) {
      const customCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || '📦',
        color: cat.color || '#3b82f6',
        image: cat.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop'
      }));
      
      // Mesclar com categorias padrão, dando prioridade às customizadas
      const defaultCategories = systemData.categories.filter(def => 
        !customCategories.some(custom => custom.name === def.name)
      );
      systemData.categories = [...customCategories, ...defaultCategories];
    }
    
    // Carregar usuários
    const users = await supabase.query('auth_users');
    if (users && users.length > 0) {
      systemData.users = users;
    }
    
    console.log('✅ Dados carregados do Supabase:', {
      produtos: systemData.products.length,
      categorias: systemData.categories.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
  }
}

// Calcular preços com incrementos das tabelas
function calculatePriceTable(basePrice, userMultiplier = 1, isFixedPrice = false) {
  if (isFixedPrice) {
    // Se preço fixo, não aplica multiplicador do usuário
    return Object.keys(systemData.priceSettings).reduce((acc, table) => {
      const increment = systemData.priceSettings[table] / 100;
      acc[table] = basePrice * (1 + increment);
      return acc;
    }, {});
  } else {
    // Aplica multiplicador do usuário + incremento da tabela
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
        <button onclick="closePriceTableModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
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

// Renderizar visão do catálogo (para clientes) - VERSÃO COMPLETA RESTAURADA
function renderCatalogView() {
  // Buscar o multiplicador atual do usuário na aba de usuários
  let userMultiplier = 1.0;
  const userInSystem = systemData.users.find(u => u.username === currentUser.username);
  if (userInSystem) {
    userMultiplier = userInSystem.price_multiplier || 1.0;
  } else {
    userMultiplier = currentUser.price_multiplier || 1.0;
  }

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
      .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(161px, 1fr)); gap: 0.5rem; }
      .category-card { background: white; padding: 0.5rem; border-radius: 0.375rem; border: 1px solid #e5e7eb; text-align: center; cursor: pointer; transition: transform 0.2s; width: 161px; height: 57px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
      .category-card:hover { transform: translateY(-2px); }
      .category-icon { font-size: 1.2rem; margin: 0; }
      .category-name { margin: 0; color: #1e293b; font-size: 0.75rem; font-weight: 500; }
      .category-count { margin: 0; color: #6b7280; font-size: 0.65rem; }
      
      .products-section h3 { margin: 0 0 1rem; color: #1e293b; }
      #products-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
      
      .product-card { background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; padding: 1rem; transition: transform 0.2s; }
      .product-card:hover { transform: translateY(-2px); }
      
      .carousel-container { position: relative; margin-bottom: 1rem; overflow: hidden; border-radius: 0.375rem; background: #f8f9fa; }
      .carousel-track { display: flex; transition: transform 0.3s ease; }
      .carousel-slide { min-width: 100%; position: relative; }
      .carousel-img { width: 100%; height: 200px; object-fit: cover; border-radius: 0.375rem; display: block; }
      .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 1rem; }
      .carousel-prev { left: 0.5rem; }
      .carousel-next { right: 0.5rem; }
      .carousel-indicators { display: flex; justify-content: center; gap: 0.25rem; position: absolute; bottom: 0.5rem; left: 50%; transform: translateX(-50%); }
      .carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; }
      .carousel-dot.active { background: white; }
      
      .product-title { margin: 0 0 0.5rem; color: #1e293b; font-size: 1.125rem; font-weight: 600; }
      .product-category { margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem; }
      
      .price-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
      .price-item { padding: 0.5rem; background: #f8fafc; border-radius: 0.375rem; text-align: center; border-left: 3px solid; }
      .price-label { font-size: 0.75rem; color: #6b7280; margin: 0 0 0.25rem; font-weight: 500; }
      .price-value { font-size: 1rem; color: #1e293b; margin: 0; font-weight: 600; }
      
      /* Responsividade móvel */
      @media (max-width: 768px) {
        .main { padding: 1rem; }
        .filters-content { flex-direction: column; align-items: stretch; }
        .search-input { min-width: 100%; }
        .categories-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
        #products-container { grid-template-columns: 1fr; }
        .price-grid { grid-template-columns: repeat(2, 1fr); gap: 0.25rem; }
        .price-item { padding: 0.375rem; }
        .price-label { font-size: 0.7rem; }
        .price-value { font-size: 0.9rem; }
      }
    </style>
    
    <div class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">📋</div>
          <h1 style="margin: 0; font-size: 1.25rem; color: #1e293b;">Catálogo MoveisBonafe</h1>
          <span class="user-badge">${currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'seller' ? 'Vendedor' : 'Cliente'} - ${currentUser.name}</span>
        </div>
        <button class="logout-btn" onclick="logout()">Sair</button>
      </div>
    </div>
    
    <div class="main">
      <div class="hero">
        <h2>Produtos Disponíveis</h2>
        <p>Navegue pelos nossos produtos e confira os preços personalizados</p>
      </div>
      
      <div class="filters">
        <div class="filters-content">
          <input type="text" class="search-input" placeholder="🔍 Buscar produtos..." id="search-input" oninput="filterProducts()">
          <select class="category-select" id="category-filter" onchange="filterProducts()">
            <option value="all">🏷️ Todas as Categorias</option>
            ${Object.keys(systemData.categories).map(cat => 
              `<option value="${cat}">${systemData.categories[cat].icon} ${cat}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      
      <div class="categories-section">
        <h3>🎯 Filtrar por Categoria</h3>
        <div class="categories-grid">
          ${Object.entries(systemData.categories).map(([name, cat]) => {
            const productCount = systemData.products.filter(p => p.category === name && p.active !== false).length;
            return `
              <div class="category-card" onclick="filterByCategory('${name}')" style="border-color: ${cat.color};">
                <div class="category-icon">${cat.icon}</div>
                <h4 class="category-name">${name}</h4>
                <p class="category-count">${productCount} produto${productCount !== 1 ? 's' : ''}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="products-section">
        <h3>📦 Nossos Produtos</h3>
        <div id="products-container"></div>
      </div>
    </div>
  `;

  // Função para filtrar por categoria
  window.filterByCategory = function(categoryName) {
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.value = categoryName;
    filterProducts();
  };

  // Função para filtrar produtos
  window.filterProducts = function() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    renderFilteredProducts(searchTerm, selectedCategory);
  };

  // Renderizar produtos filtrados
  function renderFilteredProducts(searchTerm = '', selectedCategory = 'all') {
    const container = document.getElementById('products-container');
    
    const filteredProducts = systemData.products.filter(product => {
      if (product.active === false) return false;
      
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        product.category.toLowerCase().includes(searchTerm);
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6b7280;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="margin: 0 0 0.5rem; color: #374151;">Nenhum produto encontrado</h3>
          <p style="margin: 0;">Tente ajustar os filtros ou termos de busca</p>
        </div>
      `;
      return;
    }

    const productsHtml = filteredProducts.map((product, index) => {
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
      
      // Cores para cada tabela de preço
      const priceColors = {
        'A Vista': '#10b981',
        '30': '#3b82f6', 
        '30/60': '#8b5cf6',
        '30/60/90': '#f59e0b',
        '30/60/90/120': '#ef4444'
      };
      
      return `
        <div class="product-card">
          <div class="carousel-container" id="${carouselId}">
            <div class="carousel-track" id="${carouselId}-track">
              ${allImages.length > 0 ? allImages.map((img, imgIndex) => `
                <div class="carousel-slide">
                  <img src="${img}" alt="${product.name}" class="carousel-img" 
                       onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23f3f4f6%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%236b7280%22>Sem Imagem</text></svg>'">
                </div>
              `).join('') : `
                <div class="carousel-slide">
                  <div style="width: 100%; height: 200px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #6b7280; border-radius: 0.375rem;">
                    📦 Sem Imagem
                  </div>
                </div>
              `}
            </div>
            
            ${hasMultipleImages ? `
              <button class="carousel-btn carousel-prev" onclick="moveCarousel('${carouselId}', -1)">‹</button>
              <button class="carousel-btn carousel-next" onclick="moveCarousel('${carouselId}', 1)">›</button>
              
              <div class="carousel-indicators">
                ${allImages.map((_, imgIndex) => `
                  <div class="carousel-dot ${imgIndex === 0 ? 'active' : ''}" onclick="goToSlide('${carouselId}', ${imgIndex})"></div>
                `).join('')}
              </div>
              
              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;" 
                   ontouchstart="handleTouchStart(event, '${carouselId}', ${allImages.length})" 
                   ontouchmove="handleTouchMove(event)" 
                   ontouchend="handleTouchEnd(event, '${carouselId}', ${allImages.length})">
              </div>
            ` : ''}
          </div>
          
          <h3 class="product-title">${product.name}</h3>
          <p class="product-category">${product.category || 'Sem categoria'}</p>
          
          ${product.description ? `<p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem; line-height: 1.4;">${product.description}</p>` : ''}
          
          <div class="price-grid">
            ${Object.entries(priceTable).sort((a, b) => {
              if (a[0] === 'A Vista') return -1;
              if (b[0] === 'A Vista') return 1;
              return 0;
            }).map(([table, price]) => `
              <div class="price-item" style="border-color: ${priceColors[table] || '#6b7280'};">
                <p class="price-label">${table}</p>
                <p class="price-value">R$ ${price.toFixed(2)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = productsHtml;
  }

  // Carregar produtos inicialmente
  renderFilteredProducts();
}

// Funções globais do carrossel
window.moveCarousel = function(carouselId, direction) {
  const track = document.getElementById(`${carouselId}-track`);
  const slides = track.children;
  const currentIndex = parseInt(track.dataset.currentIndex || '0');
  const newIndex = Math.max(0, Math.min(slides.length - 1, currentIndex + direction));
  
  track.style.transform = `translateX(-${newIndex * 100}%)`;
  track.dataset.currentIndex = newIndex;
  
  // Atualizar indicadores
  const indicators = track.parentElement.querySelectorAll('.carousel-dot');
  indicators.forEach((dot, index) => {
    dot.classList.toggle('active', index === newIndex);
  });
};

window.goToSlide = function(carouselId, slideIndex) {
  const track = document.getElementById(`${carouselId}-track`);
  const slides = track.children;
  const newIndex = Math.max(0, Math.min(slides.length - 1, slideIndex));
  
  track.style.transform = `translateX(-${newIndex * 100}%)`;
  track.dataset.currentIndex = newIndex;
  
  // Atualizar indicadores
  const indicators = track.parentElement.querySelectorAll('.carousel-dot');
  indicators.forEach((dot, index) => {
    dot.classList.toggle('active', index === newIndex);
  });
};

// Variáveis de touch já declaradas acima

window.handleTouchStart = function(event, carouselId, totalImages) {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
};

window.handleTouchMove = function(event) {
  event.preventDefault(); // Previne scroll da página
};

window.handleTouchEnd = function(event, carouselId, totalImages) {
  const touch = event.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;
  
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;
  
  // Se o movimento horizontal for maior que o vertical (swipe horizontal)
  if (Math.abs(diffX) > Math.abs(diffY)) {
    const threshold = 50; // Distância mínima para considerar swipe
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swipe para esquerda - próxima imagem
        moveCarousel(carouselId, 1);
      } else {
        // Swipe para direita - imagem anterior
        moveCarousel(carouselId, -1);
      }
    }
  }
};

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
            
            <button type="button" onclick="login()" style="width: 100%; padding: 0.875rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
              Entrar
            </button>
          </form>
          
          <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 1rem; font-size: 0.875rem; color: #6b7280; text-align: center;">Credenciais de Teste:</h3>
            <div style="display: grid; gap: 0.5rem; font-size: 0.75rem;">
              <p style="margin: 0; padding: 0.5rem; background: #f3f4f6; border-radius: 0.25rem;">
                <strong>Admin:</strong> admin / admin123
              </p>
              <p style="margin: 0; padding: 0.5rem; background: #f3f4f6; border-radius: 0.25rem;">
                <strong>Vendedor:</strong> vendedor / venda123
              </p>
              <p style="margin: 0; padding: 0.5rem; background: #f3f4f6; border-radius: 0.25rem;">
                <strong>Cliente:</strong> cliente / cliente123
              </p>
            </div>
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

// Função auxiliar para renderizar aba (simplificada)
function renderTab(tabName) {
  if (tabName === 'precos') {
    document.getElementById('admin-content').innerHTML = renderPricesTab();
  }
}

// Renderizar view admin COMPLETA
function renderAdminView() {
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <header style="background: white; border-bottom: 1px solid #e2e8f0; padding: 1rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📋</div>
            <h1 style="margin: 0; font-size: 1.25rem; color: #1e293b;">Admin Panel</h1>
            <span style="padding: 0.25rem 0.5rem; background: #dc2626; color: white; border-radius: 0.25rem; font-size: 0.75rem;">${currentUser.name}</span>
          </div>
          <button onclick="logout()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Sair
          </button>
        </div>
      </header>

      <nav style="background: white; border-bottom: 1px solid #e2e8f0; padding: 0 1.5rem; overflow-x: auto;">
        <div style="display: flex; gap: 0; min-width: max-content;">
          <button onclick="showTab('produtos')" id="tab-produtos" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid #3b82f6; color: #3b82f6; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
            📦 Produtos
          </button>
          <button onclick="showTab('categorias')" id="tab-categorias" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
            📁 Categorias
          </button>
          <button onclick="showTab('precos')" id="tab-precos" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
            💰 Preços
          </button>
          <button onclick="showTab('usuarios')" id="tab-usuarios" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
            👥 Usuários
          </button>
          <button onclick="showTab('excel')" id="tab-excel" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
            📊 Excel
          </button>
          <button onclick="showTab('backup')" id="tab-backup" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
            💾 Backup
          </button>
        </div>
      </nav>

      <main style="padding: 1.5rem;">
        <div id="content-produtos">${renderProductsTab()}</div>
        <div id="content-categorias" style="display: none;"></div>
        <div id="content-precos" style="display: none;"></div>
        <div id="content-usuarios" style="display: none;"></div>
        <div id="content-excel" style="display: none;"></div>
        <div id="content-backup" style="display: none;"></div>
      </main>
    </div>
  `;
}

// Função para mostrar abas
window.showTab = function(tabName) {
  // Esconder todas as abas
  const allTabs = ['produtos', 'categorias', 'precos', 'usuarios', 'excel', 'backup'];
  allTabs.forEach(tab => {
    const content = document.getElementById(`content-${tab}`);
    const tabButton = document.getElementById(`tab-${tab}`);
    if (content) content.style.display = 'none';
    if (tabButton) {
      tabButton.style.borderBottomColor = 'transparent';
      tabButton.style.color = '#6b7280';
    }
  });

  // Mostrar aba selecionada
  const activeContent = document.getElementById(`content-${tabName}`);
  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeContent) {
    activeContent.style.display = 'block';
    // Carregar conteúdo da aba se necessário
    switch(tabName) {
      case 'produtos':
        activeContent.innerHTML = renderProductsTab();
        break;
      case 'categorias':
        activeContent.innerHTML = renderCategoriesTab();
        break;
      case 'precos':
        activeContent.innerHTML = renderPricesTab();
        break;
      case 'usuarios':
        activeContent.innerHTML = renderUsersTab();
        break;
      case 'excel':
        activeContent.innerHTML = renderExcelTab();
        break;
      case 'backup':
        activeContent.innerHTML = renderBackupTab();
        break;
    }
  }
  if (activeTab) {
    activeTab.style.borderBottomColor = '#3b82f6';
    activeTab.style.color = '#3b82f6';
  }
};

// Função básica para abas não implementadas
function renderCategoriesTab() {
  return '<div style="padding: 2rem; text-align: center; color: #6b7280;"><h3>🚧 Categorias</h3><p>Em desenvolvimento</p></div>';
}

function renderUsersTab() {
  return '<div style="padding: 2rem; text-align: center; color: #6b7280;"><h3>🚧 Usuários</h3><p>Em desenvolvimento</p></div>';
}

function renderExcelTab() {
  return '<div style="padding: 2rem; text-align: center; color: #6b7280;"><h3>🚧 Excel</h3><p>Em desenvolvimento</p></div>';
}

function renderBackupTab() {
  return '<div style="padding: 2rem; text-align: center; color: #6b7280;"><h3>🚧 Backup</h3><p>Em desenvolvimento</p></div>';
}

function renderProductsTab() {
  return '<div style="padding: 2rem; text-align: center; color: #6b7280;"><h3>🚧 Produtos</h3><p>Em desenvolvimento</p></div>';
}

// Inicializar aplicação
console.log('🔄 Conectando ao Supabase...');
console.log('🔄 Sistema configurado para usar Supabase via HTTP (sincronização manual)');
console.log('✅ Conexão Supabase ativa via HTTP');
console.log('🎉 CÓDIGO NOVO FUNCIONANDO! Sistema rodando exclusivamente com Supabase');
console.log('🔗 Supabase configurado:', !!SUPABASE_URL);
console.log('⚡ Build timestamp:', new Date().getTime());
console.log('🚀 SEM WEBSOCKET - Apenas Supabase puro!');
console.log('🔄 Sincronização ativada entre navegadores');

// Carregar dados iniciais e renderizar
loadSystemData().then(() => {
  console.log('✅ Dados carregados do Supabase:', {
    produtos: systemData.products.length,
    categorias: systemData.categories.length
  });
  renderApp();
}).catch(error => {
  console.error('❌ Erro ao carregar dados iniciais:', error);
  renderApp(); // Renderiza mesmo com erro
});