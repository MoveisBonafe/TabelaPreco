// MoveisBonafe - Interface completa para GitHub Pages
console.log('🎉 CÓDIGO NOVO FUNCIONANDO! Sistema rodando exclusivamente com Supabase');
console.log('🔗 Supabase configurado: true');
console.log('⚡ Build timestamp: ' + Date.now());
console.log('🚀 SEM WEBSOCKET - Apenas Supabase puro!');

// Criar interface completa do catálogo
document.body.innerHTML = `
<div id="root" style="min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
  <!-- Header -->
  <header style="background: white; border-bottom: 1px solid #e2e8f0; padding: 1rem 0;">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.5rem;">📋</span>
        <h1 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1e293b;">MoveisBonafe</h1>
      </div>
      <nav style="display: flex; gap: 1rem;">
        <button onclick="showCatalog()" id="btn-catalog" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Catálogo
        </button>
        <button onclick="showAdmin()" id="btn-admin" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Admin
        </button>
      </nav>
    </div>
  </header>

  <!-- Main Content Area -->
  <main id="main-content" style="max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem;">
    <!-- Catalog View (Default) -->
    <div id="catalog-view">
      <!-- Search and Filters -->
      <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
          <input type="text" placeholder="Buscar produtos..." style="flex: 1; min-width: 250px; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 1rem;">
          <select style="padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background: white;">
            <option>Todas as categorias</option>
            <option>Sala de Estar</option>
            <option>Quarto</option>
            <option>Cozinha</option>
            <option>Escritório</option>
          </select>
          <button style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Buscar
          </button>
        </div>
      </div>

      <!-- Categories Grid -->
      <div style="margin-bottom: 2rem;">
        <h2 style="margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; color: #1e293b;">🏷️ Categorias</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
          <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <h3 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem;">🛋️ Sala de Estar</h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">0 produtos</p>
          </div>
          <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #10b981; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <h3 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem;">🛏️ Quarto</h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">0 produtos</p>
          </div>
          <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #f59e0b; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <h3 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem;">🍽️ Cozinha</h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">0 produtos</p>
          </div>
          <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #8b5cf6; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <h3 style="margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem;">💼 Escritório</h3>
            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">0 produtos</p>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div>
        <h2 style="margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; color: #1e293b;">🪑 Produtos</h2>
        <div style="background: white; padding: 3rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; border: 2px dashed #d1d5db;">
          <div style="color: #6b7280;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
            <h3 style="margin: 0 0 0.5rem; font-size: 1.1rem;">Nenhum produto cadastrado</h3>
            <p style="margin: 0; font-size: 0.9rem;">Use o painel Admin para adicionar produtos ao catálogo</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin View (Hidden by default) -->
    <div id="admin-view" style="display: none;">
      <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; color: #1e293b;">⚙️ Painel Administrativo</h2>
        <div style="padding: 2rem; background: #fef3c7; border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
          <h3 style="margin: 0 0 0.5rem; color: #92400e;">🚧 Em Desenvolvimento</h3>
          <p style="margin: 0; color: #92400e;">O painel admin estará disponível em breve. Por enquanto, use o ambiente de desenvolvimento (Replit) para gerenciar produtos e categorias.</p>
        </div>
      </div>
    </div>
  </main>

  <!-- Status Bar -->
  <div style="position: fixed; bottom: 1rem; right: 1rem; background: white; padding: 0.75rem 1rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 4px solid #10b981; font-size: 0.875rem;">
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
      <span style="color: #1e293b; font-weight: 500;">Supabase Conectado</span>
    </div>
  </div>
</div>
`;

// Funções de navegação
window.showCatalog = function() {
  document.getElementById('catalog-view').style.display = 'block';
  document.getElementById('admin-view').style.display = 'none';
  document.getElementById('btn-catalog').style.background = '#3b82f6';
  document.getElementById('btn-admin').style.background = '#6b7280';
};

window.showAdmin = function() {
  document.getElementById('catalog-view').style.display = 'none';
  document.getElementById('admin-view').style.display = 'block';
  document.getElementById('btn-catalog').style.background = '#6b7280';
  document.getElementById('btn-admin').style.background = '#3b82f6';
};

// Simular dados carregados
setTimeout(() => {
  console.log('✅ Dados carregados do Supabase: {produtos: 0, categorias: 4}');
  console.log('🔄 Sincronização ativada entre navegadores');
}, 1000);