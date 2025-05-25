// MoveisBonafe - Sistema completo com promoções - Deploy GitHub Pages
console.log('🎉 Sistema MoveisBonafe com promoções carregando...');

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
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erro HTTP:', response.status, error);
        return null;
      }
      
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
          'Authorization': `Bearer ${this.key}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao deletar:', error);
      return false;
    }
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dados do sistema
let systemData = {
  products: [],
  categories: [],
  users: [],
  promotions: [], // Nova seção para promoções
  priceSettings: {
    'À Vista': 0,
    '30': 5,
    '60': 10,
    '90': 15,
    '120': 20
  }
};

let currentUser = null;
let currentTab = 'produtos';

// Sistema de autenticação
async function trySupabaseLogin(username, password) {
  try {
    console.log('🔐 Tentando login no Supabase...');
    
    const users = await supabase.query('auth_users', `?username=eq.${username}&active=eq.true`);
    
    if (users && users.length > 0) {
      const user = users[0];
      
      if (user.password_hash === password) {
        console.log('✅ Login bem-sucedido!');
        currentUser = {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          price_multiplier: user.price_multiplier || 1.0
        };
        
        await loadSystemData();
        renderApp();
        return true;
      }
    }
    
    console.log('❌ Credenciais inválidas');
    return false;
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return false;
  }
}

// Carregar dados do sistema
async function loadSystemData() {
  try {
    console.log('📊 Carregando dados do sistema...');
    
    const products = await supabase.query('products');
    if (products && Array.isArray(products)) {
      systemData.products = products;
    } else {
      systemData.products = [];
    }
    
    const categories = await supabase.query('categories');
    if (categories && Array.isArray(categories) && categories.length > 0) {
      systemData.categories = categories;
    }
    
    const users = await supabase.query('auth_users');
    if (users && Array.isArray(users)) {
      systemData.users = users;
    }
    
    const promotions = await supabase.query('promocoes');
    if (promotions && Array.isArray(promotions)) {
      systemData.promotions = promotions;
    } else {
      systemData.promotions = [];
    }
    
    console.log('✅ Dados carregados:', {
      products: systemData.products.length,
      categories: systemData.categories.length,
      users: systemData.users.length,
      promotions: systemData.promotions.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
  }
}

// Função para renderizar banner de promoção
function renderPromotionBanner() {
  const activePromotion = systemData.promotions.find(p => p.ativo);
  if (!activePromotion) return '';
  
  return `
    <div style="background: ${activePromotion.cor || 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'}; color: white; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative;">
      <div style="font-size: 1.1rem;">🎉 ${activePromotion.texto || 'Promoção Especial!'}</div>
      ${activePromotion.descricao ? `<div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">${activePromotion.descricao}</div>` : ''}
    </div>
  `;
}

// Função para calcular tabela de preços
function calculatePriceTable(basePrice, userMultiplier = 1, isFixedPrice = false) {
  if (isFixedPrice || !basePrice) {
    return {
      'À Vista': basePrice || 0,
      '30': basePrice || 0,
      '60': basePrice || 0,
      '90': basePrice || 0,
      '120': basePrice || 0
    };
  }

  const adjustedPrice = basePrice * userMultiplier;
  
  return {
    'À Vista': adjustedPrice,
    '30': adjustedPrice * (1 + (systemData.priceSettings['30'] / 100)),
    '60': adjustedPrice * (1 + (systemData.priceSettings['60'] / 100)),
    '90': adjustedPrice * (1 + (systemData.priceSettings['90'] / 100)),
    '120': adjustedPrice * (1 + (systemData.priceSettings['120'] / 100))
  };
}

// Funções de gerenciamento de promoções
function showPromotionModal(promotionId = null) {
  const promotion = promotionId ? systemData.promotions.find(p => p.id === promotionId) : null;
  
  const modal = document.createElement('div');
  modal.id = 'promotion-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); display: flex; align-items: center; 
    justify-content: center; z-index: 1000; padding: 1rem;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 1rem; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;">
      <div style="padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h3 style="margin: 0; color: #1e293b; font-size: 1.25rem;">
            ${promotion ? '🎯 Editar Promoção' : '🎯 Nova Promoção'}
          </h3>
          <button onclick="closePromotionModal()" style="background: rgba(0,0,0,0.1); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center;">×</button>
        </div>
        
        <form onsubmit="${promotion ? `updatePromotion('${promotion.id}', event)` : 'savePromotion(event)'}" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Texto da Promoção *</label>
            <input type="text" id="promotion-texto" value="${promotion?.texto || ''}" required
                   placeholder="Ex: Desconto Especial de 20%!"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Descrição (opcional)</label>
            <textarea id="promotion-descricao" placeholder="Ex: Válido até o final do mês para todos os produtos"
                      style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem; resize: vertical; min-height: 80px;">${promotion?.descricao || ''}</textarea>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Cor de Fundo</label>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <input type="color" id="promotion-cor" value="${promotion?.cor || '#ff6b6b'}"
                     style="width: 50px; height: 40px; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer;">
              <span style="color: #6b7280; font-size: 0.875rem;">Escolha a cor de fundo do banner</span>
            </div>
          </div>
          
          <div>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="promotion-ativo" ${promotion?.ativo ? 'checked' : ''}
                     style="width: 18px; height: 18px; cursor: pointer;">
              <span style="font-weight: 500; color: #374151;">Ativar esta promoção</span>
            </label>
            <p style="margin: 0.5rem 0 0; color: #6b7280; font-size: 0.875rem;">Apenas uma promoção pode estar ativa por vez</p>
          </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button type="button" onclick="closePromotionModal()" 
                    style="flex: 1; padding: 0.75rem; background: #f3f4f6; color: #374151; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
              Cancelar
            </button>
            <button type="submit" 
                    style="flex: 1; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
              ${promotion ? 'Atualizar' : 'Criar'} Promoção
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function closePromotionModal() {
  const modal = document.getElementById('promotion-modal');
  if (modal) {
    modal.remove();
  }
}

async function savePromotion(event) {
  event.preventDefault();
  
  try {
    const texto = document.getElementById('promotion-texto').value.trim();
    const descricao = document.getElementById('promotion-descricao').value.trim();
    const cor = document.getElementById('promotion-cor').value;
    const ativo = document.getElementById('promotion-ativo').checked;
    
    if (!texto) {
      alert('Por favor, insira o texto da promoção.');
      return;
    }
    
    // Se ativar esta promoção, desativar todas as outras
    if (ativo) {
      for (const promo of systemData.promotions) {
        if (promo.ativo) {
          await supabase.update('promocoes', promo.id, { ativo: false });
        }
      }
    }
    
    const promotionData = {
      texto,
      descricao,
      cor,
      ativo
    };
    
    const result = await supabase.insert('promocoes', promotionData);
    
    if (result) {
      console.log('✅ Promoção salva com sucesso!');
      await loadSystemData();
      renderTab('promocoes');
      closePromotionModal();
    } else {
      alert('Erro ao salvar promoção. Tente novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao salvar promoção:', error);
    alert('Erro ao salvar promoção. Verifique os dados e tente novamente.');
  }
}

async function updatePromotion(id, event) {
  event.preventDefault();
  
  try {
    const texto = document.getElementById('promotion-texto').value.trim();
    const descricao = document.getElementById('promotion-descricao').value.trim();
    const cor = document.getElementById('promotion-cor').value;
    const ativo = document.getElementById('promotion-ativo').checked;
    
    if (!texto) {
      alert('Por favor, insira o texto da promoção.');
      return;
    }
    
    // Se ativar esta promoção, desativar todas as outras
    if (ativo) {
      for (const promo of systemData.promotions) {
        if (promo.id !== id && promo.ativo) {
          await supabase.update('promocoes', promo.id, { ativo: false });
        }
      }
    }
    
    const promotionData = {
      texto,
      descricao,
      cor,
      ativo
    };
    
    const result = await supabase.update('promocoes', id, promotionData);
    
    if (result) {
      console.log('✅ Promoção atualizada com sucesso!');
      await loadSystemData();
      renderTab('promocoes');
      closePromotionModal();
    } else {
      alert('Erro ao atualizar promoção. Tente novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar promoção:', error);
    alert('Erro ao atualizar promoção. Verifique os dados e tente novamente.');
  }
}

async function deletePromotion(id) {
  if (!confirm('Tem certeza que deseja excluir esta promoção?')) {
    return;
  }
  
  try {
    const result = await supabase.delete('promocoes', id);
    
    if (result) {
      console.log('✅ Promoção excluída com sucesso!');
      await loadSystemData();
      renderTab('promocoes');
    } else {
      alert('Erro ao excluir promoção. Tente novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao excluir promoção:', error);
    alert('Erro ao excluir promoção. Tente novamente.');
  }
}

// Renderizar aba de promoções
function renderPromotionsTab() {
  const promotions = systemData.promotions || [];
  
  const promotionsHtml = promotions.map(promotion => `
    <tr>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">${promotion.texto || ''}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">${promotion.descricao || ''}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">
        <div style="width: 30px; height: 20px; background: ${promotion.cor || '#ff6b6b'}; border-radius: 4px; border: 1px solid #ddd;"></div>
      </td>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">
        <span style="padding: 0.25rem 0.5rem; background: ${promotion.ativo ? '#10b981' : '#ef4444'}; color: white; border-radius: 0.25rem; font-size: 0.75rem;">
          ${promotion.ativo ? 'Ativa' : 'Inativa'}
        </span>
      </td>
      <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="showPromotionModal('${promotion.id}')" style="padding: 0.25rem 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
            Editar
          </button>
          <button onclick="deletePromotion('${promotion.id}')" style="padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.75rem;">
            Excluir
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 style="margin: 0; color: #1e293b; font-size: 1.5rem;">🎯 Gerenciar Promoções</h2>
        <button onclick="showPromotionModal()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          + Nova Promoção
        </button>
      </div>
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead style="background: #f8f9fa;">
            <tr>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;">Texto</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;">Descrição</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;">Cor</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;">Status</th>
              <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${promotionsHtml || '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: #6b7280;">Nenhuma promoção cadastrada</td></tr>'}
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 1.5rem; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
        <h4 style="margin: 0 0 0.5rem; color: #1e40af;">💡 Dica:</h4>
        <p style="margin: 0; color: #1e40af; font-size: 0.875rem;">Apenas uma promoção pode estar ativa por vez. Ao ativar uma nova promoção, as outras serão automaticamente desativadas.</p>
      </div>
    </div>
  `;
}

// Funções principais do sistema (simplificadas para deploy)
function renderTab(tabName) {
  currentTab = tabName;
  const content = document.getElementById('admin-content');
  
  switch (tabName) {
    case 'promocoes':
      content.innerHTML = renderPromotionsTab();
      break;
    default:
      content.innerHTML = '<div style="padding: 2rem; text-align: center;">Aba em desenvolvimento...</div>';
  }
  
  // Atualizar tabs ativas
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
}

function renderCatalogView() {
  const userMultiplier = currentUser?.price_multiplier || 1.0;
  
  return `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
      <header style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <h1 style="margin: 0; font-size: 1.25rem; background: linear-gradient(135deg, #8B4513 0%, #DAA520 50%, #FFD700 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">Móveis Bonafé Catálogo</h1>
            <span style="padding: 0.25rem 0.5rem; background: #10b981; color: white; border-radius: 0.25rem; font-size: 0.75rem;">Cliente - ${currentUser.name}</span>
          </div>
          <button onclick="logout()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Sair
          </button>
        </div>
      </header>
      
      <main style="padding: 1.5rem; max-width: 1200px; margin: 0 auto;">
        ${renderPromotionBanner()}
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <h2 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 2rem;">Nossos Produtos</h2>
          <p style="margin: 0; color: #6b7280;">Explore nossa coleção completa de móveis com preços especiais para você</p>
        </div>
        
        <div style="text-align: center; padding: 2rem;">
          <p style="color: #6b7280;">Sistema de catálogo carregando...</p>
        </div>
      </main>
    </div>
  `;
}

function renderAdminView() {
  return `
    <div style="min-height: 100vh; background: #f8fafc; display: flex;">
      <nav style="width: 250px; background: white; border-right: 1px solid #e5e7eb; padding: 1.5rem;">
        <div style="margin-bottom: 2rem;">
          <h1 style="margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 700;">Admin Panel</h1>
          <p style="margin: 0.5rem 0 0; color: #6b7280; font-size: 0.875rem;">Móveis Bonafé</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <button onclick="renderTab('promocoes')" id="tab-promocoes" class="admin-tab active">
            🎯 <span>Promoções</span>
          </button>
        </div>
      </nav>

      <main style="flex: 1; padding: 1.5rem;" id="admin-content">
        ${renderPromotionsTab()}
      </main>
    </div>
  `;
}

function renderApp() {
  const app = document.getElementById('app');
  
  if (!currentUser) {
    app.innerHTML = `
      <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
        <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 20px 25px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.875rem; font-weight: 700;">Móveis Bonafé</h1>
            <p style="margin: 0; color: #6b7280;">Sistema de Catálogo</p>
          </div>
          
          <form onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Usuário</label>
              <input type="text" id="username" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Senha</label>
              <div style="position: relative;">
                <input type="password" id="password" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
                <button type="button" onclick="togglePassword()" style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #6b7280; cursor: pointer;">👁️</button>
              </div>
            </div>
            
            <button type="submit" id="login-btn" style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; font-size: 1rem;">
              Entrar
            </button>
          </form>
        </div>
      </div>
    `;
    return;
  }
  
  if (currentUser.role === 'admin') {
    app.innerHTML = renderAdminView();
  } else {
    app.innerHTML = renderCatalogView();
  }
}

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
}

async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  const loginBtn = document.getElementById('login-btn');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Entrando...';
  
  try {
    const success = await trySupabaseLogin(username, password);
    
    if (!success) {
      alert('Usuário ou senha incorretos!');
    }
  } catch (error) {
    alert('Erro ao fazer login. Tente novamente.');
    console.error('Erro no login:', error);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar';
  }
}

function logout() {
  currentUser = null;
  renderApp();
}

// CSS para abas
const style = document.createElement('style');
style.textContent = `
  .admin-tab {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.2s;
    text-align: left;
  }
  
  .admin-tab:hover {
    background: #f3f4f6;
    color: #1e293b;
  }
  
  .admin-tab.active {
    background: #3b82f6;
    color: white;
  }
`;
document.head.appendChild(style);

// Inicializar aplicação
console.log('🚀 Inicializando aplicação...');
renderApp();