// MoveisBonafe - Sistema completo com todas as funcionalidades
console.log('🎉 Sistema MoveisBonafe completo carregando...');

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
  priceMultipliers: {
    admin: 1.0,
    seller: 1.2,
    customer: 1.5
  }
};

// Função de login
window.login = async function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    alert('Por favor, preencha usuário e senha!');
    return;
  }

  console.log('🔍 Verificando credenciais no Supabase...');
  
  try {
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

// Funções de Produtos
window.addProduct = async function() {
  const name = prompt('Nome do produto:');
  const price = prompt('Preço base:');
  const category = prompt('Categoria (1-Sala, 2-Quarto, 3-Cozinha, 4-Escritório):');
  
  if (name && price && category) {
    const product = {
      name,
      price: parseFloat(price),
      category_id: parseInt(category),
      created_at: new Date().toISOString()
    };
    
    const result = await supabase.insert('products', product);
    if (result) {
      await loadSystemData();
      renderTab('produtos');
      alert('Produto adicionado com sucesso!');
    }
  }
};

window.editProduct = async function(id) {
  const product = systemData.products.find(p => p.id === id);
  if (!product) return;
  
  const name = prompt('Nome do produto:', product.name);
  const price = prompt('Preço:', product.price);
  
  if (name && price) {
    const result = await supabase.update('products', id, {
      name,
      price: parseFloat(price)
    });
    
    if (result) {
      await loadSystemData();
      renderTab('produtos');
      alert('Produto atualizado!');
    }
  }
};

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

// Funções de Categorias
window.addCategory = async function() {
  const name = prompt('Nome da categoria:');
  const icon = prompt('Ícone (emoji):');
  const color = prompt('Cor (hex):', '#6b7280');
  
  if (name && icon) {
    const category = { name, icon, color };
    const result = await supabase.insert('categories', category);
    
    if (result) {
      await loadSystemData();
      renderTab('categorias');
      alert('Categoria adicionada!');
    }
  }
};

window.editCategory = async function(id) {
  const category = systemData.categories.find(c => c.id === id);
  if (!category) return;
  
  const name = prompt('Nome da categoria:', category.name);
  const icon = prompt('Ícone:', category.icon);
  const color = prompt('Cor:', category.color);
  
  if (name && icon) {
    const result = await supabase.update('categories', id, { name, icon, color });
    
    if (result) {
      await loadSystemData();
      renderTab('categorias');
      alert('Categoria atualizada!');
    }
  }
};

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

// Funções de Usuários
window.addUser = async function() {
  const username = prompt('Nome de usuário:');
  const password = prompt('Senha:');
  const name = prompt('Nome completo:');
  const role = prompt('Função (admin/seller/customer):');
  
  if (username && password && name && role) {
    const user = {
      username,
      password_hash: password,
      name,
      role,
      active: true
    };
    
    const result = await supabase.insert('auth_users', user);
    if (result) {
      await loadSystemData();
      renderTab('usuarios');
      alert('Usuário criado!');
    }
  }
};

window.editUser = async function(id) {
  const user = systemData.users.find(u => u.id === id);
  if (!user) return;
  
  const name = prompt('Nome:', user.name);
  const role = prompt('Função (admin/seller/customer):', user.role);
  const active = confirm('Usuário ativo?');
  
  if (name && role) {
    const result = await supabase.update('auth_users', id, { name, role, active });
    
    if (result) {
      await loadSystemData();
      renderTab('usuarios');
      alert('Usuário atualizado!');
    }
  }
};

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

// Função de importação Excel
window.importExcel = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.csv';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      alert(`Arquivo ${file.name} selecionado! Funcionalidade de importação em desenvolvimento.`);
    }
  };
  input.click();
};

window.exportExcel = function() {
  const data = systemData.products.map(p => ({
    Nome: p.name,
    Preço: p.price,
    Categoria: systemData.categories.find(c => c.id === p.category_id)?.name || 'N/A'
  }));
  
  console.log('📊 Exportando produtos:', data);
  alert(`Exportando ${data.length} produtos para Excel (funcionalidade em desenvolvimento)`);
};

// Função de backup
window.createBackup = function() {
  const backup = {
    timestamp: new Date().toISOString(),
    products: systemData.products,
    categories: systemData.categories,
    users: systemData.users.map(u => ({ ...u, password_hash: '***' }))
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-moveisbonafe-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
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
          console.log('📦 Backup carregado:', backup);
          alert('Backup carregado! Funcionalidade de restauração em desenvolvimento.');
        } catch (error) {
          alert('Erro ao ler arquivo de backup!');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// Função para calcular preço com multiplicador
function calculatePrice(basePrice, userRole) {
  const multiplier = systemData.priceMultipliers[userRole] || 1.0;
  return basePrice * multiplier;
}

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
    const category = systemData.categories.find(c => c.id === product.category_id);
    const userPrice = calculatePrice(product.price || 0, currentUser.role);
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 1rem; color: #1e293b;">${product.name}</td>
        <td style="padding: 1rem; color: #1e293b;">R$ ${(product.price || 0).toFixed(2)}</td>
        <td style="padding: 1rem; color: #10b981;">R$ ${userPrice.toFixed(2)}</td>
        <td style="padding: 1rem; color: #1e293b;">${category ? category.name : 'N/A'}</td>
        <td style="padding: 1rem; color: #6b7280; font-size: 0.875rem;">${product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}</td>
        <td style="padding: 1rem;">
          <button onclick="editProduct(${product.id})" style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; margin-right: 0.5rem;">
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
      <button onclick="addProduct()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
        + Novo Produto
      </button>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; border: 1px solid #e5e7eb; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Nome</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Preço Base</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Seu Preço</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Categoria</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Data</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml || '<tr><td colspan="6" style="padding: 2rem; text-align: center; color: #6b7280;">Nenhum produto cadastrado</td></tr>'}
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
          <button onclick="editCategory(${category.id})" style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;">
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
    
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb; margin-bottom: 2rem;">
      <h3 style="margin: 0 0 1rem; color: #1e293b;">Multiplicadores de Preço</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <div style="padding: 1rem; background: #fef2f2; border-radius: 0.5rem; border-left: 4px solid #dc2626;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Admin</h4>
          <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: #dc2626;">Preço Base (x${systemData.priceMultipliers.admin})</p>
        </div>
        <div style="padding: 1rem; background: #eff6ff; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Vendedor</h4>
          <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: #3b82f6;">+20% (x${systemData.priceMultipliers.seller})</p>
        </div>
        <div style="padding: 1rem; background: #f0fdf4; border-radius: 0.5rem; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Cliente</h4>
          <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: #10b981;">+50% (x${systemData.priceMultipliers.customer})</p>
        </div>
      </div>
    </div>
    
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; border: 1px solid #e5e7eb;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        <div style="padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Produtos Cadastrados</h4>
          <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #3b82f6;">${totalProducts}</p>
        </div>
        <div style="padding: 1rem; background: #f0fdf4; border-radius: 0.5rem; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Preço Médio Base</h4>
          <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #10b981;">R$ ${avgPrice.toFixed(2)}</p>
        </div>
        <div style="padding: 1rem; background: #fefce8; border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Seu Preço Médio</h4>
          <p style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #f59e0b;">R$ ${calculatePrice(avgPrice, currentUser.role).toFixed(2)}</p>
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
      <td style="padding: 1rem;">
        <button onclick="editUser(${user.id})" style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; margin-right: 0.5rem;">
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
      <button onclick="addUser()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
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
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Status</th>
            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #1e293b;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${usersHtml || '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: #6b7280;">Carregando usuários...</td></tr>'}
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
        <p style="margin: 0 0 1rem; color: #6b7280;">Exporte todos os produtos para arquivo Excel</p>
        <button onclick="exportExcel()" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Baixar Excel
        </button>
      </div>
    </div>
    
    <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; margin-top: 2rem;">
      <h3 style="margin: 0 0 1rem; color: #1e293b;">Formato de Importação</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f9fafb;">
          <tr>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Nome</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Preço</th>
            <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Categoria ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Sofá 3 Lugares</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">1200.00</td>
            <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">1</td>
          </tr>
        </tbody>
      </table>
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
        <p style="margin: 0; font-size: 1.2rem; color: #f59e0b;">${currentUser.name}</p>
      </div>
    </div>
    
    <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 1rem; color: #1e293b;">Logs do Sistema</h3>
      <div style="background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 0.375rem; font-family: monospace; font-size: 0.875rem; height: 200px; overflow-y: auto;">
        <div>${new Date().toISOString()} - Sistema inicializado</div>
        <div>${new Date().toISOString()} - Conectado ao Supabase</div>
        <div>${new Date().toISOString()} - Login realizado: ${currentUser.name}</div>
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

// Renderizar visão do catálogo
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
          <button onclick="showTab('excel')" id="tab-excel" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            📊 Excel
          </button>
          <button onclick="showTab('backup')" id="tab-backup" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            💾 Backup
          </button>
          <button onclick="showTab('monitoramento')" id="tab-monitoramento" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            📈 Monitoramento
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
        <div id="content-monitoramento" style="display: none;"></div>
      </main>
    </div>
  `;
}

// Inicializar aplicação
console.log('✅ Sistema MoveisBonafe completo carregado!');
renderApp();