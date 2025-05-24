// MoveisBonafe - Sistema com autenticação via Supabase
console.log('🎉 Sistema MoveisBonafe carregando com Supabase...');

// Configuração do Supabase
const SUPABASE_URL = 'https://oozesebwtrbzeelkcmwp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY';

// Cliente Supabase simplificado
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
      return await response.json();
    } catch (error) {
      console.error('Erro ao inserir:', error);
      return null;
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
  users: []
};

// Função de login com Supabase
window.login = async function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    alert('Por favor, preencha usuário e senha!');
    return;
  }

  console.log('🔍 Verificando credenciais no Supabase...');
  
  try {
    // Buscar usuário no Supabase
    const users = await supabase.query('auth_users', `?username=eq.${username}&password_hash=eq.${password}&active=eq.true`);
    
    if (users && users.length > 0) {
      currentUser = users[0];
      currentView = currentUser.role === 'customer' ? 'catalog' : 'admin';
      console.log('✅ Login realizado:', currentUser.name);
      await loadSystemData();
      renderApp();
    } else {
      alert('Usuário ou senha incorretos!');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    alert('Erro ao fazer login. Tente novamente.');
  }
};

// Carregar dados do sistema
async function loadSystemData() {
  try {
    console.log('📊 Carregando dados do sistema...');
    
    // Carregar produtos
    const products = await supabase.query('products');
    if (products) systemData.products = products;
    
    // Carregar categorias
    const categories = await supabase.query('categories');
    if (categories && categories.length > 0) systemData.categories = categories;
    
    // Carregar usuários
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

// Função de logout
window.logout = function() {
  currentUser = null;
  currentView = 'login';
  console.log('👋 Logout realizado');
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
  
  // Recarregar dados da aba ativa
  renderTab(tabName);
};

// Função para adicionar produto
window.addProduct = async function() {
  const name = prompt('Nome do produto:');
  const price = prompt('Preço:');
  const category = prompt('Categoria (1-Sala, 2-Quarto, 3-Cozinha, 4-Escritório):');
  
  if (name && price && category) {
    const product = {
      name,
      price: parseFloat(price),
      category_id: parseInt(category),
      created_at: new Date().toISOString()
    };
    
    console.log('➕ Adicionando produto ao Supabase...');
    const result = await supabase.insert('products', product);
    
    if (result) {
      console.log('✅ Produto adicionado:', product);
      await loadSystemData();
      renderTab('produtos');
    } else {
      alert('Erro ao adicionar produto!');
    }
  }
};

// Função para adicionar categoria
window.addCategory = async function() {
  const name = prompt('Nome da categoria:');
  const icon = prompt('Ícone (emoji):');
  
  if (name && icon) {
    const category = {
      name,
      icon,
      color: '#6b7280'
    };
    
    console.log('➕ Adicionando categoria ao Supabase...');
    const result = await supabase.insert('categories', category);
    
    if (result) {
      console.log('✅ Categoria adicionada:', category);
      await loadSystemData();
      renderTab('categorias');
    } else {
      alert('Erro ao adicionar categoria!');
    }
  }
};

// Função para renderizar uma aba específica
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
  }
}

// Renderizar aba de produtos
function renderProductsTab() {
  const productsHtml = systemData.products.map(product => {
    const category = systemData.categories.find(c => c.id === product.category_id);
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 1rem; color: #1e293b;">${product.name}</td>
        <td style="padding: 1rem; color: #1e293b;">R$ ${product.price ? product.price.toFixed(2) : '0.00'}</td>
        <td style="padding: 1rem; color: #1e293b;">${category ? category.name : 'N/A'}</td>
        <td style="padding: 1rem; color: #6b7280; font-size: 0.875rem;">${product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}</td>
        <td style="padding: 1rem;">
          <button style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
            Excluir
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Produtos</h2>
      <button onclick="addProduct()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
        + Novo Produto
      </button>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Nome</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Preço</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Categoria</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Data</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml || '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: #6b7280;">Nenhum produto cadastrado</td></tr>'}
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
        <button style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
          Excluir
        </button>
      </div>
    </div>
  `).join('');

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Categorias</h2>
      <button onclick="addCategory()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
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
  const totalProducts = systemData.products.length;
  const avgPrice = totalProducts > 0 ? (systemData.products.reduce((sum, p) => sum + (p.price || 0), 0) / totalProducts) : 0;
  
  return `
    <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Preços</h2>
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        <div style="padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Produtos Cadastrados</h4>
          <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #3b82f6;">${totalProducts}</p>
        </div>
        <div style="padding: 1rem; background: #f0fdf4; border-radius: 0.5rem; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Preço Médio</h4>
          <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #10b981;">R$ ${avgPrice.toFixed(2)}</p>
        </div>
        <div style="padding: 1rem; background: #fefce8; border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Categorias</h4>
          <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #f59e0b;">${systemData.categories.length}</p>
        </div>
      </div>
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
      <td style="padding: 1rem;">
        <span style="color: ${user.active ? '#10b981' : '#ef4444'};">
          ${user.active ? '● Ativo' : '○ Inativo'}
        </span>
      </td>
    </tr>
  `).join('');

  return `
    <h2 style="margin: 0 0 1.5rem; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Usuários</h2>
    
    <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Nome</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Usuário</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Tipo</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${usersHtml || '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: #6b7280;">Carregando usuários...</td></tr>'}
        </tbody>
      </table>
    </div>
    
    <div style="margin-top: 1.5rem; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
      <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Dados armazenados no Supabase</h4>
      <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">
        Usuários e senhas estão salvos na tabela 'auth_users' do banco de dados Supabase
      </p>
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
            <p style="margin: 0.5rem 0 0; color: #6b7280;">Faça login para continuar</p>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500;">Usuário</label>
            <input type="text" id="username" placeholder="Digite seu usuário" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500;">Senha</label>
            <input type="password" id="password" placeholder="Digite sua senha" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; box-sizing: border-box;">
          </div>
          
          <button onclick="login()" style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 1rem;">
            Entrar
          </button>
          
          <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
            <h4 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 0.875rem;">Contas armazenadas no Supabase:</h4>
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
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <header style="background: white; border-bottom: 1px solid #e2e8f0; padding: 1rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📋</div>
            <h1 style="margin: 0; font-size: 1.25rem; color: #1e293b;">Catálogo MoveisBonafe</h1>
            <span style="padding: 0.25rem 0.5rem; background: #10b981; color: white; border-radius: 0.25rem; font-size: 0.75rem;">Cliente</span>
          </div>
          <button onclick="logout()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Sair
          </button>
        </div>
      </header>
      
      <main style="padding: 1.5rem; max-width: 1200px; margin: 0 auto;">
        <h2 style="margin: 0 0 1.5rem; color: #1e293b;">Nossos Produtos</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
          ${systemData.categories.map(category => `
            <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; border-left: 4px solid ${category.color};">
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <span style="font-size: 2rem;">${category.icon}</span>
                <h3 style="margin: 0; color: #1e293b;">${category.name}</h3>
              </div>
              <p style="margin: 0; color: #6b7280;">
                ${systemData.products.filter(p => p.category_id === category.id).length} produtos disponíveis
              </p>
            </div>
          `).join('')}
        </div>
      </main>
    </div>
  `;
}

// Renderizar visão admin
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

      <nav style="background: white; border-bottom: 1px solid #e2e8f0; padding: 0 1.5rem;">
        <div style="display: flex; gap: 0;">
          <button onclick="showTab('produtos')" id="tab-produtos" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid #3b82f6; color: #3b82f6; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            📦 Produtos
          </button>
          <button onclick="showTab('categorias')" id="tab-categorias" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            📁 Categorias
          </button>
          <button onclick="showTab('precos')" id="tab-precos" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            💰 Preços
          </button>
          <button onclick="showTab('usuarios')" id="tab-usuarios" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            👥 Usuários
          </button>
        </div>
      </nav>

      <main style="padding: 1.5rem;">
        <div id="content-produtos">${renderProductsTab()}</div>
        <div id="content-categorias" style="display: none;">${renderCategoriesTab()}</div>
        <div id="content-precos" style="display: none;">${renderPricesTab()}</div>
        <div id="content-usuarios" style="display: none;">${renderUsersTab()}</div>
      </main>
    </div>
  `;
}

// Inicializar aplicação
console.log('✅ Sistema MoveisBonafe com Supabase carregado!');
renderApp();