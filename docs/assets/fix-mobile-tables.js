// Script para corrigir a exibição de todas as tabelas de preços no mobile
// Executar após o carregamento da página

function fixMobilePriceTables() {
  // Aguardar a página carregar completamente
  setTimeout(() => {
    // Encontrar todos os grids de preços
    const priceGrids = document.querySelectorAll('[style*="display: grid; grid-template-columns: 1fr 1fr"]');
    
    priceGrids.forEach(grid => {
      // Verificar se é um grid de preços (tem divs com "R$")
      const hasPrice = grid.querySelector('[style*="R$"]');
      if (hasPrice) {
        // Aplicar estilos para mostrar todas as tabelas
        grid.style.cssText = `
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 0.3rem !important;
          min-height: 200px !important;
          grid-auto-rows: minmax(35px, auto) !important;
          overflow: visible !important;
          max-height: none !important;
        `;
        
        // Garantir que o container pai tenha altura suficiente
        const container = grid.closest('[style*="border-top: 1px solid #e5e7eb"]');
        if (container) {
          container.style.minHeight = '220px';
          container.style.paddingBottom = '1rem';
        }
      }
    });
    
    console.log('🔧 Tabelas de preços otimizadas para mobile');
  }, 1000);
}

// Executar quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixMobilePriceTables);
} else {
  fixMobilePriceTables();
}

// Executar novamente quando houver mudanças no DOM
const observer = new MutationObserver((mutations) => {
  let shouldFix = false;
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Verificar se novos produtos foram adicionados
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && (
          node.querySelector && node.querySelector('[style*="R$"]') ||
          node.textContent && node.textContent.includes('R$')
        )) {
          shouldFix = true;
        }
      });
    }
  });
  
  if (shouldFix) {
    fixMobilePriceTables();
  }
});

// Observar mudanças no body
observer.observe(document.body, {
  childList: true,
  subtree: true
});