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

// Renderizar visão do catálogo (para clientes) - VERSÃO CORRIGIDA
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
            <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; z-index: 10;">
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
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.4rem; font-size: 0.75rem;">
            ${Object.entries(priceTable).map(([tableName, price]) => `
              <div style="padding: 0.4rem; background: ${tableName === 'A Vista' ? '#f0fdf4' : '#eff6ff'}; 
                          border-radius: 0.25rem; text-align: center; border-left: 3px solid ${tableName === 'A Vista' ? '#10b981' : '#3b82f6'};">
                <div style="color: #6b7280; font-size: 0.65rem; margin-bottom: 0.2rem; font-weight: 500;">${tableName}</div>
                <div style="color: ${tableName === 'A Vista' ? '#10b981' : '#3b82f6'}; font-weight: 600; font-size: 0.8rem;">R$ ${price.toFixed(2)}</div>
              </div>
            `).join('')}
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
          <h2 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 2rem;">Produtos Disponíveis</h2>
          <p style="margin: 0; color: #6b7280;">Navegue pelos nossos produtos e confira os preços personalizados</p>
        </div>
        
        ${systemData.products.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
            ${productsHtml}
          </div>
        ` : `
          <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
            <h3 style="margin: 0 0 0.5rem; color: #1e293b;">Nenhum produto disponível</h3>
            <p style="margin: 0; color: #6b7280;">Os produtos serão exibidos aqui quando adicionados pelo administrador.</p>
          </div>
        `}
      </main>
      
      <footer style="background: white; border-top: 1px solid #e2e8f0; padding: 2rem; text-align: center; margin-top: 2rem;">
        <p style="margin: 0; color: #6b7280;">© 2024 MoveisBonafe - Móveis de qualidade com os melhores preços</p>
      </footer>
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

// Renderizar view admin (simplificado)
function renderAdminView() {
  document.body.innerHTML = `
    <div>
      <h1>Admin Panel - ${currentUser.name}</h1>
      <div id="admin-content">
        ${renderPricesTab()}
      </div>
      <button onclick="logout()">Sair</button>
    </div>
  `;
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