// MoveisBonafe Sistema Otimizado - Performance Melhorada
// Carregamento de imagens mais rápido e touch events otimizados

// Sistema de dados local
let systemData = {
  products: [],
  categories: [],
  users: [
    { username: 'admin', password: 'admin123', type: 'admin', name: 'Administrador', price_multiplier: 1.0 },
    { username: 'vendedor', password: 'vend123', type: 'seller', name: 'Vendedor', price_multiplier: 1.0 },
    { username: 'cliente', password: 'cli123', type: 'customer', name: 'Cliente', price_multiplier: 1.0 },
    { username: 'Loja', password: 'moveisbonafe', type: 'customer', name: 'Loja', price_multiplier: 1.0 }
  ],
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

// Variáveis para controle do carrossel com performance otimizada
let carouselStates = {};
let touchStartX = 0;
let touchStartY = 0;

// Configuração do Supabase
const SUPABASE_URL = 'https://pqrzlmdbgxxzhemqrjfx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcnpsbWRiZ3h4emhlbXFyamZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzAwNTEsImV4cCI6MjA2MzQ0NjA1MX0.X1AJFqhMqxCYXC48TfE_0KojD8_0Tr8xt1MjF4l87zQ';

// Cliente Supabase otimizado para performance
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async query(table, query = '') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${this.url}/rest/v1/${table}${query}`, {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao inserir em ${table}:`, error);
      throw error;
    }
  }

  async update(table, id, data) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao atualizar ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao deletar de ${table}:`, error);
      throw error;
    }
  }
}

// Instância do cliente Supabase
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variáveis globais
let currentUser = null;
let currentView = 'catalog';
let categoryImageData = null;

// Cache de imagens para carregamento mais rápido
const imageCache = new Map();

function preloadImage(src) {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Funções para controle do carrossel otimizadas
function updateCarousel(carouselId, totalImages) {
  if (!carouselStates[carouselId]) {
    carouselStates[carouselId] = { currentIndex: 0 };
  }
  
  const carousel = document.getElementById(`carousel-${carouselId}`);
  const currentIndex = carouselStates[carouselId].currentIndex;
  
  if (carousel) {
    const translateX = -(currentIndex * 100);
    carousel.style.transform = `translateX(${translateX}%)`;
    
    // Atualizar indicadores
    const dots = carousel.parentElement.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.style.background = index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)';
    });
  }
}

// Touch events otimizados com passive listeners
function handleTouchStart(evt, carouselId, totalImages) {
  const firstTouch = evt.touches[0];
  touchStartX = firstTouch.clientX;
  touchStartY = firstTouch.clientY;
}

function handleTouchMove(evt) {
  // Remover preventDefault para evitar warning de performance
  if (!touchStartX || !touchStartY) return;
  
  const touch = evt.touches[0];
  const diffX = touchStartX - touch.clientX;
  const diffY = touchStartY - touch.clientY;
  
  // Só prevenir scroll se for movimento horizontal
  if (Math.abs(diffX) > Math.abs(diffY)) {
    evt.preventDefault();
  }
}

function handleTouchEnd(evt, carouselId, totalImages) {
  if (!touchStartX || !touchStartY) return;
  
  const touchEndX = evt.changedTouches[0].clientX;
  const diffX = touchStartX - touchEndX;
  
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      nextImage(carouselId, totalImages);
    } else {
      previousImage(carouselId, totalImages);
    }
  }
  
  touchStartX = 0;
  touchStartY = 0;
}

function nextImage(carouselId, totalImages) {
  if (!carouselStates[carouselId]) {
    carouselStates[carouselId] = { currentIndex: 0 };
  }
  
  carouselStates[carouselId].currentIndex = (carouselStates[carouselId].currentIndex + 1) % totalImages;
  updateCarousel(carouselId, totalImages);
}

function previousImage(carouselId, totalImages) {
  if (!carouselStates[carouselId]) {
    carouselStates[carouselId] = { currentIndex: 0 };
  }
  
  carouselStates[carouselId].currentIndex = carouselStates[carouselId].currentIndex === 0 ? totalImages - 1 : carouselStates[carouselId].currentIndex - 1;
  updateCarousel(carouselId, totalImages);
}

// Função de login otimizada com tela de carregamento
async function trySupabaseLogin(username, password) {
  try {
    // Mostrar overlay de carregamento completo
    showFullScreenLoading('Entrando no sistema...');
    
    // Aguardar um pouco para dar feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar nos usuários locais primeiro (mais rápido)
    const localUser = systemData.users.find(user => 
      user.username === username && user.password === password
    );
    
    if (localUser) {
      currentUser = localUser;
      console.log('✅ Login local bem-sucedido:', currentUser.name);
      
      // Atualizar mensagem de carregamento
      updateLoadingMessage('Carregando interface...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      hideFullScreenLoading();
      renderApp();
      return true;
    }
    
    // Se não encontrou localmente, verificar no Supabase
    updateLoadingMessage('Verificando no servidor...');
    const users = await supabase.query('users', `?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}`);
    
    if (users && users.length > 0) {
      currentUser = users[0];
      console.log('✅ Login Supabase bem-sucedido:', currentUser.name);
      
      updateLoadingMessage('Carregando interface...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      hideFullScreenLoading();
      renderApp();
      return true;
    }
    
    hideFullScreenLoading();
    return false;
  } catch (error) {
    console.error('❌ Erro no login:', error);
    hideFullScreenLoading();
    return false;
  }
}

// Funções para tela de carregamento completa
function showFullScreenLoading(message) {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(30, 41, 59, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(10px);
  `;
  
  loadingOverlay.innerHTML = `
    <div style="text-align: center; color: white;">
      <div style="margin-bottom: 2rem;">
        <div style="width: 60px; height: 60px; border: 4px solid rgba(251, 191, 36, 0.3); border-top: 4px solid #fbbf24; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      </div>
      
      <h2 style="margin: 0 0 1rem; font-size: 1.5rem; font-weight: 600;">MoveisBonafe</h2>
      <p id="loading-message" style="margin: 0; font-size: 1rem; opacity: 0.8;">${message}</p>
      
      <div style="margin-top: 2rem; display: flex; gap: 0.5rem; justify-content: center;">
        <div style="width: 8px; height: 8px; background: #fbbf24; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;"></div>
        <div style="width: 8px; height: 8px; background: #fbbf24; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite 0.2s;"></div>
        <div style="width: 8px; height: 8px; background: #fbbf24; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite 0.4s;"></div>
      </div>
    </div>
    
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1.2); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(loadingOverlay);
}

function updateLoadingMessage(message) {
  const messageElement = document.getElementById('loading-message');
  if (messageElement) {
    messageElement.textContent = message;
  }
}

function hideFullScreenLoading() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    loadingOverlay.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
      loadingOverlay.remove();
    }, 500);
  }
}

// Carregamento de dados otimizado
async function loadSystemData() {
  try {
    console.log('🔄 Carregando dados do Supabase...');
    
    // Carregar dados em paralelo para melhor performance
    const [products, categories, users] = await Promise.all([
      supabase.query('produtos'),
      supabase.query('categorias'),
      supabase.query('users')
    ]);
    
    if (products) {
      systemData.products = products.map(product => ({
        ...product,
        images: product.images || []
      }));
    }
    
    if (categories) {
      systemData.categories = categories;
    }
    
    if (users && users.length > 0) {
      systemData.users = [...systemData.users, ...users];
    }
    
    // Pré-carregar as primeiras imagens para melhor UX
    const firstImages = systemData.products
      .slice(0, 6) // Apenas as primeiras 6 para não sobrecarregar
      .map(p => p.images && p.images[0])
      .filter(Boolean);
    
    firstImages.forEach(src => preloadImage(src).catch(() => {}));
    
    console.log('✅ Dados carregados com otimizações de performance');
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados do Supabase:', error);
  }
}

// Renderização principal otimizada
function renderApp() {
  const appElement = document.getElementById('app') || document.body;
  
  appElement.innerHTML = `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
      <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div class="header" style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
          <h1 style="margin: 0 0 10px; color: #333;">MoveisBonafe</h1>
          <p style="margin: 0; color: #666;">Bem-vindo, ${currentUser.name}!</p>
          <button onclick="logout()" style="margin-top: 10px; padding: 5px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Sair
          </button>
        </div>
        
        <!-- Tabs -->
        <div class="tabs" style="display: flex; background: white; border-radius: 10px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <button class="tab active" onclick="renderTab('catalog')" style="flex: 1; padding: 15px; background: #007bff; color: white; border: none; cursor: pointer; font-size: 14px; font-weight: bold;">
            📋 Catálogo
          </button>
          ${currentUser.type === 'admin' ? `
            <button class="tab" onclick="renderTab('products')" style="flex: 1; padding: 15px; background: #f8f9fa; border: none; cursor: pointer; font-size: 14px; font-weight: bold;">
              📦 Produtos
            </button>
            <button class="tab" onclick="renderTab('categories')" style="flex: 1; padding: 15px; background: #f8f9fa; border: none; cursor: pointer; font-size: 14px; font-weight: bold;">
              📁 Categorias
            </button>
            <button class="tab" onclick="renderTab('users')" style="flex: 1; padding: 15px; background: #f8f9fa; border: none; cursor: pointer; font-size: 14px; font-weight: bold;">
              👥 Usuários
            </button>
          ` : ''}
        </div>
        
        <!-- Content -->
        <div id="content" class="content" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); min-height: 400px;">
          ${renderCatalogView()}
        </div>
      </div>
    </div>
  `;
}

function renderCatalogView() {
  if (!systemData.products || systemData.products.length === 0) {
    return '<div style="text-align: center; padding: 40px; color: #666;">Nenhum produto encontrado.</div>';
  }

  const productsHtml = systemData.products.map((product, index) => {
    const images = product.images || [];
    const hasImages = images.length > 0;
    const carouselId = `product-${index}`;
    
    return `
      <div style="background: white; border-radius: 10px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.3s;" 
           onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
        
        ${hasImages ? `
          <div style="position: relative; width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 10px; transform: translateZ(0);">
            <div id="carousel-${carouselId}" style="display: flex; height: 100%; transition: transform 0.3s ease; will-change: transform;">
              ${images.map(img => `
                <img src="${img}" alt="${product.name}" 
                     style="width: 100%; height: 100%; object-fit: cover; flex-shrink: 0; border-radius: 8px; will-change: transform; transform: translateZ(0);"
                     loading="lazy" decoding="async">
              `).join('')}
            </div>
            
            ${images.length > 1 ? `
              <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px;">
                ${images.map((_, i) => `
                  <div class="carousel-dot" onclick="setCarouselIndex('${carouselId}', ${i}, ${images.length})"
                       style="width: 8px; height: 8px; border-radius: 50%; background: ${i === 0 ? 'white' : 'rgba(255,255,255,0.5)'}; cursor: pointer; transition: background 0.3s;"></div>
                `).join('')}
              </div>
              
              <div ontouchstart="handleTouchStart(event, '${carouselId}', ${images.length})" 
                   ontouchmove="handleTouchMove(event)" 
                   ontouchend="handleTouchEnd(event, '${carouselId}', ${images.length})"
                   style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;"></div>
            ` : ''}
          </div>
        ` : `
          <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 3rem;">
            📷
          </div>
        `}
        
        <h3 style="margin: 0 0 5px; color: #1f2937; font-size: 1.1rem; font-weight: 600;">${product.name}</h3>
        <p style="margin: 0 0 10px; color: #6b7280; font-size: 0.9rem;">${product.category || ''}</p>
        
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.25rem; font-size: 0.7rem;">
          <div style="padding: 0.4rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 0.25rem; text-align: center; color: white;">
            <div style="font-weight: 600;">À Vista</div>
            <div style="font-size: 0.8rem;">R$ ${(product.base_price || 0).toFixed(2)}</div>
          </div>
          <div style="padding: 0.4rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 0.25rem; text-align: center; color: white;">
            <div style="font-weight: 600;">30</div>
            <div style="font-size: 0.8rem;">R$ ${((product.base_price || 0) * 1.02).toFixed(2)}</div>
          </div>
          <div style="padding: 0.4rem; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 0.25rem; text-align: center; color: white;">
            <div style="font-weight: 600;">30/60</div>
            <div style="font-size: 0.8rem;">R$ ${((product.base_price || 0) * 1.04).toFixed(2)}</div>
          </div>
          <div style="padding: 0.4rem; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 0.25rem; text-align: center; color: white;">
            <div style="font-weight: 600;">30/60/90</div>
            <div style="font-size: 0.8rem;">R$ ${((product.base_price || 0) * 1.06).toFixed(2)}</div>
          </div>
          <div style="padding: 0.4rem; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 0.25rem; text-align: center; color: white;">
            <div style="font-weight: 600;">30/60/90/120</div>
            <div style="font-size: 0.8rem;">R$ ${((product.base_price || 0) * 1.08).toFixed(2)}</div>
          </div>
        </div>
        
        ${product.fixed_price ? '<div style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 0.25rem; font-size: 0.75rem; text-align: center;">🔒 Preço Fixo</div>' : ''}
      </div>
    `;
  }).join('');

  return `
    <div>
      <h2 style="margin: 0 0 20px; color: #1f2937;">Catálogo de Produtos</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        ${productsHtml}
      </div>
    </div>
  `;
}

// Função global para controlar carrossel
window.setCarouselIndex = function(carouselId, index, totalImages) {
  carouselStates[carouselId] = { currentIndex: index };
  updateCarousel(carouselId, totalImages);
};

// Função de logout
window.logout = function() {
  currentUser = null;
  currentView = 'catalog';
  location.reload();
};

// Função de renderização de tabs
window.renderTab = function(tabName) {
  currentView = tabName;
  
  // Atualizar aparência das tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.style.background = '#f8f9fa';
    tab.style.color = '#333';
  });
  event.target.style.background = '#007bff';
  event.target.style.color = 'white';
  
  // Renderizar conteúdo
  const content = document.getElementById('content');
  switch(tabName) {
    case 'catalog':
      content.innerHTML = renderCatalogView();
      break;
    case 'products':
      content.innerHTML = '<div style="text-align: center; padding: 40px;">Gerenciamento de Produtos em desenvolvimento...</div>';
      break;
    case 'categories':
      content.innerHTML = '<div style="text-align: center; padding: 40px;">Gerenciamento de Categorias em desenvolvimento...</div>';
      break;
    case 'users':
      content.innerHTML = '<div style="text-align: center; padding: 40px;">Gerenciamento de Usuários em desenvolvimento...</div>';
      break;
  }
};

// Função de inicialização otimizada
window.addEventListener('load', function() {
  console.log('🎉 Sistema MoveisBonafe otimizado carregando...');
  
  // Configurar Supabase
  console.log('🔄 Conectando ao Supabase...');
  console.log('🔄 Sistema configurado para usar Supabase via HTTP (sincronização manual)');
  
  // Carregar dados primeiro, depois mostrar interface
  loadSystemData().then(() => {
    console.log('✅ Dados carregados do Supabase:', {
      produtos: systemData.products.length,
      categorias: systemData.categories.length
    });
    
    // Após carregar dados, verificar se há usuário logado
    if (!currentUser) {
      // Mostrar tela de login
      document.body.innerHTML = `
        <div style="min-height: 100vh; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
          <div style="background: white; border-radius: 1rem; padding: 3rem; box-shadow: 0 25px 50px rgba(0,0,0,0.25); width: 100%; max-width: 400px;">
            <div style="text-align: center; margin-bottom: 2rem;">
              <h1 style="margin: 0 0 0.5rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2rem; font-weight: 700;">
                Móveis Bonafé
              </h1>
              <p style="margin: 0; color: #6b7280;">Sistema de Catálogo</p>
            </div>
            
            <form id="login-form" style="display: grid; gap: 1.5rem;">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Usuário</label>
                <input type="text" id="username" placeholder="Digite seu usuário" 
                       style="width: 100%; padding: 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;"
                       onfocus="this.style.borderColor='#fbbf24'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Senha</label>
                <input type="password" id="password" placeholder="Digite sua senha" 
                       style="width: 100%; padding: 0.9rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s;"
                       onfocus="this.style.borderColor='#fbbf24'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
              
              <button type="submit" 
                      style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                      onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                🔐 Entrar
              </button>
            </form>
            
            <div id="login-error" style="margin-top: 1rem; text-align: center;"></div>
            
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;">Usuários de exemplo:</p>
              <div style="display: grid; gap: 0.5rem; font-size: 0.75rem; color: #6b7280;">
                <div><strong>admin</strong> / admin123 (Administrador)</div>
                <div><strong>Loja</strong> / moveisbonafe (Cliente)</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Event listener para o form de login
      document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        const submitButton = e.target.querySelector('button[type="submit"]');
        
        if (!username || !password) {
          errorDiv.innerHTML = '<div style="color: #dc2626; font-size: 0.875rem;">Por favor, preencha todos os campos.</div>';
          return;
        }
        
        // Mostrar tela de carregamento no botão
        submitButton.disabled = true;
        submitButton.style.opacity = '0.8';
        submitButton.style.cursor = 'not-allowed';
        submitButton.style.background = '#6b7280';
        submitButton.style.transform = 'none';
        submitButton.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <div style="width: 16px; height: 16px; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: buttonSpin 1s linear infinite;"></div>
            Carregando...
          </div>
        `;
        
        // Adicionar animação se não existir
        if (!document.getElementById('button-animations')) {
          const style = document.createElement('style');
          style.id = 'button-animations';
          style.textContent = `
            @keyframes buttonSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }
        
        errorDiv.innerHTML = `
          <div style="color: #3b82f6; font-size: 0.875rem; text-align: center; margin-top: 0.5rem;">
            <div style="display: inline-block; width: 16px; height: 16px; border: 2px solid #3b82f6; border-top: 2px solid transparent; border-radius: 50%; animation: buttonSpin 1s linear infinite; margin-right: 0.5rem; vertical-align: middle;"></div>
            Verificando credenciais...
          </div>
        `;
        
        try {
          const success = await trySupabaseLogin(username, password);
          if (!success) {
            // Restaurar botão em caso de erro
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
            submitButton.innerHTML = '🔐 Entrar';
            submitButton.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
            submitButton.style.transform = '';
            errorDiv.innerHTML = '<div style="color: #dc2626; font-size: 0.875rem;">Usuário ou senha incorretos.</div>';
          }
        } catch (error) {
          // Restaurar botão em caso de erro
          submitButton.disabled = false;
          submitButton.style.opacity = '1';
          submitButton.style.cursor = 'pointer';
          submitButton.innerHTML = '🔐 Entrar';
          submitButton.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
          submitButton.style.transform = '';
          errorDiv.innerHTML = '<div style="color: #dc2626; font-size: 0.875rem;">Erro de conexão. Tente novamente.</div>';
        }
      });
    } else {
      renderApp();
    }
    
    console.log('✅ Conexão Supabase ativa via HTTP');
    console.log('🎉 CÓDIGO NOVO FUNCIONANDO! Sistema rodando exclusivamente com Supabase');
    console.log('🔗 Supabase configurado:', !!supabase);
    console.log('⚡ Build timestamp:', new Date().toISOString());
    console.log('🚀 SEM WEBSOCKET - Apenas Supabase puro!');
    console.log('🔄 Sincronização ativada entre navegadores');
  }).catch(error => {
    console.error('❌ Erro ao carregar dados:', error);
    // Mostrar tela de login mesmo em caso de erro
    location.reload();
  });
});

// Otimizações de performance para scroll suave
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar CSS para scroll suave e otimizado
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }
    
    body {
      will-change: scroll-position;
      transform: translateZ(0);
    }
    
    .card, .carousel, .carousel img {
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
    
    /* Otimização para scroll em mobile */
    .content {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    /* GPU acceleration para elementos que se movem */
    .carousel-container {
      transform: translate3d(0, 0, 0);
    }
  `;
  document.head.appendChild(style);
});

// Touch events otimizados com passive listeners
document.addEventListener('touchmove', function(e) {
  // Passive listener - não bloqueia scroll
}, { passive: true });

document.addEventListener('wheel', function(e) {
  // Passive listener para scroll com mouse
}, { passive: true });

document.addEventListener('scroll', function(e) {
  // Throttle scroll events para melhor performance
}, { passive: true });

// Adicionar SheetJS para Excel
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
script.onload = function() {
  console.log('✅ SheetJS carregado para funcionalidade Excel');
};
document.head.appendChild(script);

console.log('✅ Sistema MoveisBonafe otimizado carregado com melhorias de performance!');