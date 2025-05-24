// MoveisBonafe - Sistema ATUALIZADO 24/05/2025 20:00 - TODAS AS MELHORIAS
console.log('🎉 Sistema MoveisBonafe NOVO carregando - VERSÃO FINAL 20:00...');

// Configuração do Supabase - Credenciais corretas
const SUPABASE_URL = 'https://oozesebwtrbzeelkcmwp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY';

// Cliente Supabase CORRIGIDO
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async select(table, query = '*') {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}?select=${query}`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Erro no select:', error);
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
      return await response.json();
    } catch (error) {
      console.error('Erro no insert:', error);
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
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro no update:', response.status, errorText);
        alert(`Erro ao atualizar: ${response.status} - ${errorText}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert(`Erro de conexão: ${error.message}`);
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
      console.error('Erro no delete:', error);
      return false;
    }
  }
}

// Inicializar cliente Supabase
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado global do sistema
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

// Sistema de touch para navegação em produtos
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  console.log('Touch start:', touchStartX);
}

function handleTouchEnd(e, index) {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  console.log(`Touch end - deltaX: ${deltaX} deltaY: ${deltaY}`);
  
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      console.log('Swipe direita - imagem anterior');
      previousImage(index);
    } else {
      console.log('Swipe esquerda - próxima imagem');
      nextImage(index);
    }
  }
}

// Autenticação e login
async function trySupabaseLogin(username, password) {
  console.log(`🔍 Verificando credenciais para: ${username}`);
  
  try {
    const users = await supabase.select('users');
    
    if (!users || users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco');
      return false;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      currentUser = user;
      if (user.type === 'admin') {
        console.log(`✅ Login realizado: ${user.name} Tipo: ${user.type}`);
      } else {
        console.log(`✅ Login Supabase realizado: ${user.name} Tipo: ${user.type}`);
      }
      
      await loadSystemData();
      renderApp();
      return true;
    } else {
      console.log('❌ Credenciais inválidas');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return false;
  }
}

async function loadSystemData() {
  console.log('📊 Carregando dados do sistema...');
  
  try {
    const [products, categories, users] = await Promise.all([
      supabase.select('products'),
      supabase.select('categories'),
      supabase.select('users')
    ]);
    
    systemData.products = products || [];
    systemData.categories = categories || [];
    systemData.users = users || [];
    
    console.log(`✅ Dados carregados: {produtos: ${systemData.products.length}, categorias: ${systemData.categories.length}, usuarios: ${systemData.users.length}}`);
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
  }
}

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if (!username || !password) {
    alert('Por favor, preencha todos os campos!');
    return;
  }
  
  const success = await trySupabaseLogin(username, password);
  
  if (!success) {
    alert('Usuário ou senha incorretos!');
    document.getElementById('password').value = '';
  }
}

function logout() {
  currentUser = null;
  renderLoginView();
}

// Modal de produto MELHORADO
function showProductModal(index) {
  const product = systemData.products[index];
  if (!product) return;
  
  const userMultiplier = currentUser?.price_multiplier || 1;
  const priceData = [
    { name: 'À Vista', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', price: product.base_price * (1 + systemData.priceSettings['A Vista'] / 100) * userMultiplier },
    { name: '30', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', price: product.base_price * (1 + systemData.priceSettings['30'] / 100) * userMultiplier },
    { name: '30/60', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', price: product.base_price * (1 + systemData.priceSettings['30/60'] / 100) * userMultiplier },
    { name: '30/60/90', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', price: product.base_price * (1 + systemData.priceSettings['30/60/90'] / 100) * userMultiplier },
    { name: '30/60/90/120', bg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', price: product.base_price * (1 + systemData.priceSettings['30/60/90/120'] / 100) * userMultiplier }
  ];

  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
    background: rgba(0,0,0,0.8); display: flex; align-items: center; 
    justify-content: center; z-index: 1000; padding: 1rem;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 1rem; max-width: 90vw; max-height: 90vh; 
                overflow-y: auto; padding: 2rem; position: relative;">
      <button onclick="this.closest('.modal').remove()" 
              style="position: absolute; top: 1rem; right: 1rem; background: #ef4444; 
                     color: white; border: none; border-radius: 50%; width: 32px; height: 32px; 
                     cursor: pointer; font-weight: bold;">×</button>
      
      <h2 style="margin: 0 0 1rem; color: #1e293b; font-size: 1.5rem;">${product.name}</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        <div>
          <img src="${product.image || '/api/placeholder/300/300'}" 
               style="width: 100%; height: 300px; object-fit: cover; border-radius: 0.5rem;" 
               alt="${product.name}">
        </div>
        <div>
          <p style="color: #6b7280; margin: 0 0 1rem;">${product.description || 'Descrição não disponível'}</p>
          
          <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem;">
            <h3 style="margin: 0 0 1rem; color: #1e293b;">Tabelas de Preços</h3>
            <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
              ${priceData.map(item => `
                <div style="padding: 0.75rem; background: ${item.bg}; border-radius: 0.375rem; 
                           text-align: center; color: white;">
                  <div style="font-weight: 700; font-size: 1rem;">${item.name}</div>
                  <div style="font-weight: 600; font-size: 1.2rem;">R$ ${item.price.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  modal.className = 'modal';
  document.body.appendChild(modal);
}

// Renderizar produtos MELHORADO
function renderProducts(productsToShow) {
  if (!productsToShow || productsToShow.length === 0) {
    return '<div style="text-align: center; padding: 2rem; color: #6b7280;">Nenhum produto encontrado</div>';
  }

  const userMultiplier = currentUser?.price_multiplier || 1;
  
  return productsToShow.map((product, index) => {
    const priceTable = {};
    Object.keys(systemData.priceSettings).forEach(tableName => {
      const percentage = systemData.priceSettings[tableName];
      const multiplier = 1 + (percentage / 100);
      priceTable[tableName] = product.base_price * multiplier * userMultiplier;
    });

    return `
      <div onclick="showProductModal(${systemData.products.indexOf(product)})" 
           style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; 
                  padding: 1rem; transition: transform 0.2s; cursor: pointer;" 
           onmouseover="this.style.transform='translateY(-2px)'" 
           onmouseout="this.style.transform='translateY(0)'">
        
        ${product.fixed_price ? '<div style="position: absolute; top: 10px; right: 10px; background: #fbbf24; color: #92400e; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">🔒 FIXO</div>' : ''}
        
        <div style="position: relative; margin-bottom: 1rem;">
          <img src="${product.image || '/api/placeholder/300/200'}" 
               style="width: 100%; height: 200px; object-fit: cover; border-radius: 0.375rem;" 
               alt="${product.name}">
        </div>
        
        <h3 style="margin: 0 0 0.5rem; font-size: 1.125rem; font-weight: 600; color: #1e293b;">${product.name}</h3>
        <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">${product.description || 'Descrição não disponível'}</p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem;">
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; font-size: 0.75rem;">
            <div style="padding: 0.5rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 0.375rem; text-align: center; color: white;">
              <div style="font-weight: 700;">À Vista</div>
              <div style="font-weight: 600; font-size: 0.9rem;">R$ ${priceTable['A Vista'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 0.375rem; text-align: center; color: white;">
              <div style="font-weight: 700;">30</div>
              <div style="font-weight: 600; font-size: 0.9rem;">R$ ${priceTable['30'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 0.375rem; text-align: center; color: white;">
              <div style="font-weight: 700;">30/60</div>
              <div style="font-weight: 600; font-size: 0.9rem;">R$ ${priceTable['30/60'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 0.375rem; text-align: center; color: white;">
              <div style="font-weight: 700;">30/60/90</div>
              <div style="font-weight: 600; font-size: 0.9rem;">R$ ${priceTable['30/60/90'].toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 0.375rem; text-align: center; color: white;">
              <div style="font-weight: 700;">30/60/90/120</div>
              <div style="font-weight: 600; font-size: 0.9rem;">R$ ${priceTable['30/60/90/120'].toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Renderizar visão do catálogo MELHORADA
function renderCatalogView() {
  document.body.innerHTML = `
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); min-height: 100vh; color: white;">
      <div style="padding: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <div style="font-size: 1.5rem; font-weight: bold; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Móveis Bonafé Catálogo</div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="padding: 0.25rem 0.75rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 0.5rem; font-size: 0.875rem;">${currentUser.name}</span>
            <button onclick="logout()" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">Sair</button>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <input type="text" id="search-input" placeholder="🔍 Buscar produtos..." style="width: 100%; padding: 0.75rem; border: 2px solid #374151; border-radius: 0.75rem; background: #374151; color: white; font-size: 1rem;" onkeyup="filterProducts()">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
            <button onclick="filterByCategory('all')" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem;">Todos</button>
            ${systemData.categories.map(cat => `
              <button onclick="filterByCategory('${cat.name}')" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, ${cat.color || '#6b7280'} 0%, #4b5563 100%); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem;">${cat.name}</button>
            `).join('')}
          </div>
        </div>
        
        <div id="products-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${renderProducts(systemData.products)}
        </div>
      </div>
    </div>
  `;
}

// Filtros
function filterProducts() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const filteredProducts = systemData.products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    (product.description && product.description.toLowerCase().includes(searchTerm))
  );
  
  document.getElementById('products-container').innerHTML = renderProducts(filteredProducts);
}

function filterByCategory(categoryName) {
  const filteredProducts = categoryName === 'all' 
    ? systemData.products 
    : systemData.products.filter(product => product.category === categoryName);
  
  document.getElementById('products-container').innerHTML = renderProducts(filteredProducts);
}

// ADMIN FUNCTIONS
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

// Renderizar tela de login MELHORADA
function renderLoginView() {
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
      <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); width: 100%; max-width: 400px;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">Móveis Bonafé</h1>
          <p style="color: #6b7280; margin: 0.5rem 0 0;">Sistema de Catálogo</p>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <input type="text" id="username" placeholder="Nome de usuário" style="width: 100%; padding: 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='#fbbf24'" onblur="this.style.borderColor='#e5e7eb'">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <input type="password" id="password" placeholder="Digite sua senha" style="width: 100%; padding: 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='#fbbf24'" onblur="this.style.borderColor='#e5e7eb'">
        </div>
        
        <button onclick="login()" style="width: 100%; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 0.9rem; border: none; border-radius: 0.75rem; font-size: 1rem; font-weight: 700; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
          Entrar
        </button>
        
        <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #6b7280;">
          <p style="margin: 0;">Usuários de teste:</p>
          <p style="margin: 0.25rem 0;"><strong>admin</strong> / admin123</p>
          <p style="margin: 0;"><strong>Loja</strong> / loja123</p>
        </div>
      </div>
    </div>
  `;
  
  // Permitir login com Enter
  document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      login();
    }
  });
}

// Renderizar aplicação principal
function renderApp() {
  if (!currentUser) {
    renderLoginView();
    return;
  }
  
  if (currentUser.type === 'admin') {
    renderAdminView();
  } else {
    renderCatalogView();
  }
}

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
  renderLoginView();
});

console.log('✅ Sistema MoveisBonafe NOVO completo carregado!');