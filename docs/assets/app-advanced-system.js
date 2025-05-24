// MoveisBonafe - Sistema avançado com formulários e tabelas de preços
console.log('🎉 Sistema MoveisBonafe avançado carregando...');

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
  users: []
};

// Configuração de tabelas de preços
const priceIncrements = {
  'A Vista': 0,
  '30': 2,
  '30/60': 4,
  '30/60/90': 6,
  '30/60/90/120': 8
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

// Calcular preços com incrementos das tabelas
function calculatePriceTable(basePrice, userMultiplier = 1, isFixedPrice = false) {
  if (isFixedPrice) {
    // Se preço fixo, não aplica multiplicador do usuário
    return Object.keys(priceIncrements).reduce((acc, table) => {
      const increment = priceIncrements[table] / 100;
      acc[table] = basePrice * (1 + increment);
      return acc;
    }, {});
  } else {
    // Aplica multiplicador do usuário + incremento da tabela
    return Object.keys(priceIncrements).reduce((acc, table) => {
      const increment = priceIncrements[table] / 100;
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

// Modal para adicionar produto
window.showAddProductModal = function() {
  const modal = document.createElement('div');
  modal.id = 'product-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 0.5rem; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #1e293b;">Adicionar Produto</h2>
        <button onclick="closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
      </div>
      
      <form id="product-form" style="display: grid; gap: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Nome do Produto</label>
            <input type="text" id="product-name" placeholder="Digite o nome do produto" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Categoria</label>
            <select id="product-category" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
              <option value="">Selecione uma categoria</option>
              ${systemData.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
            </select>
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Descrição</label>
          <textarea id="product-description" placeholder="Digite a descrição do produto" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; height: 80px; resize: vertical; box-sizing: border-box;"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Preço Base (R$)</label>
            <input type="number" id="product-base-price" placeholder="0" step="0.01" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Desconto (%)</label>
            <input type="number" id="product-discount" placeholder="0" step="0.01" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Preço À Vista (R$)</label>
            <input type="number" id="product-cash-price" placeholder="0" step="0.01" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;" readonly>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Preço Final (R$)</label>
            <input type="number" id="product-final-price" placeholder="0.00" step="0.01" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: #f0f9ff; border-radius: 0.375rem; border-left: 4px solid #3b82f6;">
          <input type="checkbox" id="product-fixed-price" style="margin: 0;">
          <label for="product-fixed-price" style="margin: 0; color: #3b82f6; font-weight: 500;">
            🔒 Preço Fixo - Este produto não será afetado pelo multiplicador de preços dos usuários
          </label>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Imagens do Produto</label>
          <input type="url" id="product-image" placeholder="Cole uma URL de imagem aqui..." style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
          <p style="margin: 0.5rem 0 0; font-size: 0.875rem; color: #6b7280;">
            • A primeira imagem será a principal<br>
            • Máximo 5MB por imagem<br>
            • Formatos: JPG, PNG, GIF<br>
            • Pressione Enter para adicionar URL
          </p>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="submit" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Salvar Produto
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-calcular preços
  const basePriceInput = document.getElementById('product-base-price');
  const discountInput = document.getElementById('product-discount');
  const cashPriceInput = document.getElementById('product-cash-price');
  
  function updatePrices() {
    const basePrice = parseFloat(basePriceInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;
    const cashPrice = basePrice * (1 - discount / 100);
    cashPriceInput.value = cashPrice.toFixed(2);
  }
  
  basePriceInput.addEventListener('input', updatePrices);
  discountInput.addEventListener('input', updatePrices);
  
  // Submeter formulário
  document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    await saveProduct();
  });
};

// Função para salvar produto
async function saveProduct() {
  const productData = {
    name: document.getElementById('product-name').value,
    category_id: parseInt(document.getElementById('product-category').value),
    description: document.getElementById('product-description').value,
    base_price: parseFloat(document.getElementById('product-base-price').value),
    discount_percent: parseFloat(document.getElementById('product-discount').value) || 0,
    cash_price: parseFloat(document.getElementById('product-cash-price').value),
    final_price: parseFloat(document.getElementById('product-final-price').value),
    fixed_price: document.getElementById('product-fixed-price').checked,
    image_url: document.getElementById('product-image').value || null,
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
      console.error('❌ Erro ao salvar produto');
      alert('Erro ao salvar produto. Verifique os dados e tente novamente.');
    }
  } catch (error) {
    console.error('❌ Erro ao salvar produto:', error);
    alert('Erro ao salvar produto. Tente novamente.');
  }
}

// Fechar modal
window.closeModal = function() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.remove();
  }
};

// Funções CRUD para outras entidades
window.editProduct = async function(id) {
  // TODO: Implementar edição de produto
  alert('Funcionalidade de edição em desenvolvimento');
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

// Funções para usuários
window.editUser = async function(id) {
  const user = systemData.users.find(u => u.id === id);
  if (!user) return;
  
  const multiplier = prompt('Multiplicador de preços para este usuário:', user.price_multiplier || 1.0);
  
  if (multiplier && !isNaN(multiplier)) {
    const result = await supabase.update('auth_users', id, { 
      price_multiplier: parseFloat(multiplier) 
    });
    
    if (result) {
      await loadSystemData();
      renderTab('usuarios');
      alert('Multiplicador atualizado!');
    }
  }
};

// Renderizar abas
function renderTab(tabName) {
  const content = document.getElementById('content-' + tabName);
  if (!content) return;
  
  switch(tabName) {
    case 'produtos':
      content.innerHTML = renderProductsTab();
      break;
    case 'usuarios':
      content.innerHTML = renderUsersTab();
      break;
    default:
      content.innerHTML = '<div style="padding: 2rem; text-align: center; color: #6b7280;">Aba em desenvolvimento...</div>';
  }
}

// Renderizar aba de produtos
function renderProductsTab() {
  const productsHtml = systemData.products.map(product => {
    const category = systemData.categories.find(c => c.id === product.category_id);
    const userMultiplier = currentUser.price_multiplier || 1.0;
    const priceTable = calculatePriceTable(product.base_price || 0, userMultiplier, product.fixed_price);
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 1rem;">
          ${product.image_url ? 
            `<img src="${product.image_url}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.375rem;">` :
            `<div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; color: #6b7280;">📷</div>`
          }
        </td>
        <td style="padding: 1rem;">
          <div style="font-weight: 600; color: #1e293b;">${product.name}</div>
          <div style="font-size: 0.875rem; color: #6b7280;">${category ? category.name : 'N/A'}</div>
          ${product.fixed_price ? '<div style="font-size: 0.75rem; color: #f59e0b;">🔒 Preço Fixo</div>' : ''}
        </td>
        <td style="padding: 1rem; color: #10b981; font-weight: 600;">R$ ${priceTable['A Vista'].toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${priceTable['30'].toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60'].toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60/90'].toFixed(2)}</td>
        <td style="padding: 1rem; color: #3b82f6; font-weight: 600;">R$ ${priceTable['30/60/90/120'].toFixed(2)}</td>
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
        <button onclick="editUser(${user.id})" style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem; margin-right: 0.5rem;">
          Editar Multiplicador
        </button>
      </td>
    </tr>
  `).join('');

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b;">Gerenciar Usuários</h2>
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
    
    <div style="margin-top: 1.5rem; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
      <h4 style="margin: 0 0 0.5rem; color: #1e293b;">Sistema de Multiplicadores</h4>
      <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">
        Cada usuário pode ter um multiplicador personalizado que afeta todos os preços dos produtos (exceto produtos com "Preço Fixo" habilitado).
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
            <p style="margin: 0.5rem 0 0; color: #6b7280;">Sistema avançado de gestão</p>
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
  } else if (currentView === 'admin') {
    renderAdminView();
  }
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
          <button onclick="showTab('usuarios')" id="tab-usuarios" style="padding: 1rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            👥 Usuários
          </button>
        </div>
      </nav>

      <main style="padding: 1.5rem;">
        <div id="content-produtos">${renderProductsTab()}</div>
        <div id="content-usuarios" style="display: none;"></div>
      </main>
    </div>
  `;
}

// Inicializar aplicação
console.log('✅ Sistema MoveisBonafe avançado carregado!');
renderApp();