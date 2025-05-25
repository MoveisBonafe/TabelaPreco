// Sistema MoveisBonafe - Versão Otimizada para Performance
let supabaseClient;
let currentUser = null;
let allProducts = [];
let allCategories = [];
let allUsers = [];
let allPriceTables = [];

// Inicialização do Supabase
function initSupabase() {
  const SUPABASE_URL = 'https://eecmhuxqjhfpwtexjwby.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlY21odXhxamhmcHd0ZXhqd2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk0ODEsImV4cCI6MjA2MzYxNTQ4MX0.XpV0QU5XGfPtqGOXKYjgLBEGPXLPqKhFXzNHCGhLh-w';
  
  supabaseClient = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase inicializado');
}

// Cliente Supabase simplificado
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    };
  }

  async query(table, query = '') {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}${query}`, {
        headers: this.headers
      });
      return await response.json();
    } catch (error) {
      console.error(`Erro ao consultar ${table}:`, error);
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
      console.error(`Erro ao inserir em ${table}:`, error);
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
      console.error(`Erro ao atualizar ${table}:`, error);
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
      console.error(`Erro ao deletar de ${table}:`, error);
      return false;
    }
  }
}

// Carregamento otimizado de dados
async function loadSystemData() {
  try {
    console.log('🔄 Carregando dados...');
    
    const [products, categories, users, priceTables] = await Promise.all([
      supabaseClient.query('produtos'),
      supabaseClient.query('categorias'),
      supabaseClient.query('usuarios'),
      supabaseClient.query('tabelas_precos')
    ]);

    allProducts = products || [];
    allCategories = categories || [];
    allUsers = users || [];
    allPriceTables = priceTables || [];

    console.log('✅ Dados carregados:', {
      produtos: allProducts.length,
      categorias: allCategories.length
    });

    return true;
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    return false;
  }
}

// Sistema de login otimizado
window.login = function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    alert('Por favor, preencha usuário e senha!');
    return;
  }
  
  // Credenciais padrão
  const defaultUsers = {
    'admin': { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador', price_multiplier: 1.0, active: true },
    'vendedor': { id: 2, username: 'vendedor', password: 'venda123', role: 'seller', name: 'Vendedor', price_multiplier: 1.0, active: true },
    'cliente': { id: 3, username: 'cliente', password: 'cliente123', role: 'customer', name: 'Cliente Teste', price_multiplier: 1.0, active: true }
  };
  
  const defaultUser = defaultUsers[username];
  if (defaultUser && defaultUser.password === password) {
    currentUser = defaultUser;
    renderApp();
    return;
  }
  
  alert('Usuário ou senha inválidos!');
};

// Cálculo de preços otimizado
function calculatePriceTable(basePrice, userMultiplier = 1, isFixedPrice = false) {
  const price = parseFloat(basePrice) || 0;
  const multiplier = isFixedPrice ? 1 : (userMultiplier || 1);
  
  return {
    'À Vista': price * multiplier,
    '30': price * multiplier * 1.02,
    '30/60': price * multiplier * 1.04,
    '30/60/90': price * multiplier * 1.06,
    '30/60/90/120': price * multiplier * 1.08
  };
}

// Renderização do catálogo otimizada
function renderCatalogView() {
  const sortedProducts = allProducts
    .filter(product => product.active !== false)
    .sort((a, b) => {
      const categoryA = allCategories.find(cat => cat.id === a.category_id)?.name || '';
      const categoryB = allCategories.find(cat => cat.id === b.category_id)?.name || '';
      
      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }
      return a.name.localeCompare(b.name);
    });

  const productsHtml = sortedProducts.map(product => {
    const category = allCategories.find(cat => cat.id === product.category_id);
    const priceTable = calculatePriceTable(product.price, currentUser?.price_multiplier, product.fixed_price);
    
    let allImages = [];
    if (product.images && Array.isArray(product.images)) {
      allImages = product.images;
    } else if (product.image_url) {
      allImages = [product.image_url];
    }

    const firstImage = allImages[0];

    return `
      <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.2s;">
        <div style="height: 200px; overflow: hidden; position: relative;">
          ${firstImage ? 
            `<img src="${firstImage}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain; background: #f8f9fa;">` :
            `<div style="width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 2rem;">📷</div>`
          }
        </div>
        
        <div style="padding: 1rem;">
          <h3 style="margin: 0 0 0.5rem; font-size: 1.125rem; font-weight: 600; color: #1f2937;">${product.name}</h3>
          <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;">${category?.name || 'Sem categoria'}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">À Vista</div>
              <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable['À Vista'] || 0).toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30</div>
              <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable['30'] || 0).toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30/60</div>
              <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable['30/60'] || 0).toFixed(2)}</div>
            </div>
            <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30/60/90</div>
              <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable['30/60/90'] || 0).toFixed(2)}</div>
            </div>
          </div>
          <div style="margin-top: 0.5rem;">
            <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
              <div style="color: #6b7280;">30/60/90/120</div>
              <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable['30/60/90/120'] || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        ${product.description ? `<p style="margin: 1rem; color: #6b7280; font-size: 0.875rem;">${product.description}</p>` : ''}
        ${product.fixed_price ? '<div style="margin: 0 1rem 1rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 0.25rem; font-size: 0.75rem; text-align: center;">🔒 Preço Fixo</div>' : ''}
      </div>
    `;
  }).join('');

  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <header style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 1rem 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1 style="margin: 0; font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Móveis Bonafé Catálogo</h1>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <span>Bem-vindo, ${currentUser?.name || 'Usuário'}</span>
            ${currentUser?.role === 'admin' ? '<button onclick="renderApp()" style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Admin</button>' : ''}
            <button onclick="logout()" style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 0.375rem; cursor: pointer;">Sair</button>
          </div>
        </div>
      </header>
      
      <main style="padding: 2rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
          ${productsHtml}
        </div>
      </main>
    </div>
  `;
}

// Função de logout
window.logout = function() {
  currentUser = null;
  location.reload();
};

// Renderização principal otimizada
function renderApp() {
  if (!currentUser) {
    document.body.innerHTML = `
      <div style="min-height: 100vh; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
        <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 20px 50px rgba(0,0,0,0.3); width: 100%; max-width: 400px;">
          <h1 style="text-align: center; margin: 0 0 2rem; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 1.8rem; font-weight: 700;">Móveis Bonafé</h1>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500;">Usuário</label>
            <input type="text" id="username" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
          </div>
          <div style="margin-bottom: 2rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 500;">Senha</label>
            <input type="password" id="password" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
          </div>
          <button onclick="login()" style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; border: none; border-radius: 0.375rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">Entrar</button>
        </div>
      </div>
    `;
    return;
  }

  if (currentUser.role === 'admin') {
    renderAdminView();
  } else {
    renderCatalogView();
  }
}

// Renderização admin simplificada
function renderAdminView() {
  renderCatalogView(); // Por simplicidade, mostrar apenas o catálogo
}

// Inicialização otimizada
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🔄 Inicializando sistema...');
  initSupabase();
  await loadSystemData();
  renderApp();
  console.log('✅ Sistema inicializado');
});