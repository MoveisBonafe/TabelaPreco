// MoveisBonafe - Sistema atualizado com filtro de categorias clicáveis e tabela de preços
console.log('🎉 Sistema MoveisBonafe atualizado carregando...');

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
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado da aplicação
let currentUser = null;
let currentView = 'login';
let selectedCategory = 'all'; // Nova variável para filtro de categoria
let systemData = {
  products: [],
  categories: [],
  users: []
};

// Carregar dados do Supabase
async function loadData() {
  try {
    console.log('🔄 Carregando dados do Supabase...');
    
    const [products, categories] = await Promise.all([
      supabase.query('products', '?active=eq.true&order=created_at.desc'),
      supabase.query('categories', '?active=eq.true&order=name')
    ]);
    
    systemData.products = products.map(p => ({
      ...p,
      basePrice: parseFloat(p.base_price) || 0,
      finalPrice: parseFloat(p.final_price) || 0,
      priceAVista: parseFloat(p.price_a_vista) || 0,
      price30: parseFloat(p.price_30) || 0,
      price30_60: parseFloat(p.price_30_60) || 0,
      price30_60_90: parseFloat(p.price_30_60_90) || 0,
      price30_60_90_120: parseFloat(p.price_30_60_90_120) || 0
    }));
    
    systemData.categories = categories.map(c => ({
      ...c,
      productCount: c.product_count || 0
    }));
    
    console.log('✅ Dados carregados:', {
      produtos: systemData.products.length,
      categorias: systemData.categories.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
  }
}

// Função para filtrar produtos por categoria
function filterProductsByCategory(categoryName) {
  selectedCategory = categoryName;
  console.log('🔄 Filtrando por categoria:', categoryName);
  renderCatalogView();
}

// Renderizar categorias clicáveis
function renderCategoryFilter() {
  return `
    <div style="margin-bottom: 2rem;">
      <h2 style="margin: 0 0 1rem; color: #1e293b; font-size: 1.5rem;">Categorias</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        ${systemData.categories.map(category => `
          <div onclick="filterProductsByCategory('${category.name}')" 
               style="background: white; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; border-left: 4px solid ${category.color}; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <div style="width: 4rem; height: 4rem; border-radius: 0.5rem; background: ${category.color}20; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                <span style="font-size: 2rem;">${category.icon}</span>
              </div>
              <h3 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem;">${category.name}</h3>
              <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">
                ${category.productCount} produto${category.productCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Renderizar produtos com tabela de preços
function renderProductsWithPriceTable(products) {
  if (products.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem; color: #6b7280;">
        <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">🔍</div>
        <h3>Nenhum produto encontrado</h3>
        <p>Tente selecionar uma categoria diferente</p>
        <button onclick="filterProductsByCategory('all')" 
                style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
          Ver Todos os Produtos
        </button>
      </div>
    `;
  }

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
      ${products.map(product => `
        <div style="background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.3s;"
             onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
          
          <!-- Imagem do Produto -->
          <div style="width: 100%; height: 12rem; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            ${product.image ? 
              `<img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` :
              `<div style="color: #94a3b8; font-size: 3rem;">📷</div>`
            }
          </div>
          
          <!-- Informações do Produto -->
          <div style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <h3 style="margin: 0; color: #1e293b; font-size: 1.1rem; font-weight: 600;">${product.name}</h3>
              <span style="background: #dbeafe; color: #1d4ed8; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; white-space: nowrap;">
                ${product.category}
              </span>
            </div>
            
            <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem; line-height: 1.4;">
              ${product.description || 'Sem descrição disponível'}
            </p>
            
            <!-- Tabela de Preços -->
            <div style="margin-bottom: 1rem;">
              <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.5rem;">
                À Vista: R$ ${product.priceAVista.toFixed(2).replace('.', ',')}
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; border: 1px solid #e5e7eb; border-radius: 0.375rem; overflow: hidden; font-size: 0.75rem;">
                <div style="background: #dbeafe; color: #1d4ed8; padding: 0.5rem; text-align: center; font-weight: 500;">30 dias</div>
                <div style="background: #dbeafe; color: #1d4ed8; padding: 0.5rem; text-align: center; font-weight: 500;">30/60</div>
                <div style="background: #dbeafe; color: #1d4ed8; padding: 0.5rem; text-align: center; font-weight: 500;">30/60/90</div>
                <div style="background: #dbeafe; color: #1d4ed8; padding: 0.5rem; text-align: center; font-weight: 500;">30/60/90/120</div>
                <div style="background: white; padding: 0.5rem; text-align: center;">R$ ${product.price30.toFixed(2).replace('.', ',')}</div>
                <div style="background: white; padding: 0.5rem; text-align: center;">R$ ${product.price30_60.toFixed(2).replace('.', ',')}</div>
                <div style="background: white; padding: 0.5rem; text-align: center;">R$ ${product.price30_60_90.toFixed(2).replace('.', ',')}</div>
                <div style="background: white; padding: 0.5rem; text-align: center;">R$ ${product.price30_60_90_120.toFixed(2).replace('.', ',')}</div>
              </div>
            </div>
            
            <!-- Preço Final -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 1.25rem; font-weight: 700; color: #059669;">
                R$ ${product.finalPrice.toFixed(2).replace('.', ',')}
              </span>
              <button style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;"
                      onmouseover="this.style.background='#2563eb'"
                      onmouseout="this.style.background='#3b82f6'">
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Renderizar visão do catálogo
function renderCatalogView() {
  // Filtrar produtos por categoria selecionada
  const filteredProducts = selectedCategory === 'all' 
    ? systemData.products 
    : systemData.products.filter(p => p.category === selectedCategory);

  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #f8fafc;">
      <!-- Header -->
      <header style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 1.5rem;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2rem; height: 2rem; background: #3b82f6; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🏠</div>
            <h1 style="margin: 0; color: #1e293b; font-size: 1.5rem;">MoveisBonafe</h1>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            ${selectedCategory !== 'all' ? 
              `<button onclick="filterProductsByCategory('all')" 
                       style="padding: 0.5rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                Todas as Categorias
              </button>` : ''
            }
            <button onclick="currentView='login'; renderView()" 
                    style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
              Admin
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main style="max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem;">
        <!-- Hero Section -->
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 2.5rem; font-weight: bold;">Nossos Produtos</h2>
          <p style="margin: 0; color: #6b7280; font-size: 1.125rem;">
            ${selectedCategory === 'all' 
              ? 'Explore nossa coleção completa de móveis' 
              : `Produtos da categoria: ${selectedCategory}`
            }
          </p>
        </div>
        
        <!-- Category Filter (apenas se estiver mostrando todos) -->
        ${selectedCategory === 'all' ? renderCategoryFilter() : ''}
        
        <!-- Products Section -->
        <div>
          <h2 style="margin: 0 0 1.5rem; color: #1e293b; font-size: 1.5rem;">
            ${selectedCategory === 'all' ? 'Produtos Disponíveis' : `Categoria: ${selectedCategory}`}
            <span style="color: #6b7280; font-size: 1rem; font-weight: normal;">
              (${filteredProducts.length} produto${filteredProducts.length !== 1 ? 's' : ''})
            </span>
          </h2>
          ${renderProductsWithPriceTable(filteredProducts)}
        </div>
      </main>
    </div>
  `;
}

// Renderizar tela de login
function renderLoginView() {
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); max-width: 400px; width: 100%; margin: 1rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 4rem; height: 4rem; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-size: 1.5rem;">🏠</div>
          <h1 style="margin: 0; color: #1e293b; font-size: 1.5rem;">MoveisBonafe</h1>
          <p style="margin: 0.5rem 0 0; color: #6b7280;">Sistema de Gestão</p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <button onclick="currentView='catalog'; renderView()" 
                  style="width: 100%; padding: 1rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; margin-bottom: 1rem;">
            🛍️ Ver Catálogo
          </button>
          <button onclick="currentView='admin-login'; renderView()" 
                  style="width: 100%; padding: 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
            🔐 Área Administrativa
          </button>
        </div>
      </div>
    </div>
  `;
}

// Renderizar view principal
function renderView() {
  switch(currentView) {
    case 'login':
      renderLoginView();
      break;
    case 'catalog':
      renderCatalogView();
      break;
    default:
      renderLoginView();
      break;
  }
}

// Inicializar aplicação
async function init() {
  console.log('🚀 Inicializando MoveisBonafe...');
  await loadData();
  renderView();
}

// Inicializar quando DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}