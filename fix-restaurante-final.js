// Fix final para preços de usuários Restaurante
// Execute este código no console do navegador

// Aguardar carregamento completo e aplicar correção
setTimeout(function() {
  console.log('🍽️ Iniciando correção para usuários Restaurante...');
  
  // Verificar se é usuário restaurante
  if (window.currentUser && window.currentUser.role === 'customer_restaurant') {
    console.log('✅ Usuário Restaurante detectado:', window.currentUser.name);
    
    // Função para corrigir um grid de preços
    function fixPriceGrid(grid) {
      // Verificar se é realmente um grid de preços
      if (grid.innerHTML.includes('À Vista') && grid.innerHTML.includes('30')) {
        console.log('🔧 Corrigindo grid de preços...');
        
        // Pegar o preço à vista
        const avistaElement = grid.querySelector('div:first-child div:last-child');
        const price = avistaElement ? avistaElement.textContent : 'R$ 0,00';
        
        // Substituir todo o conteúdo
        grid.innerHTML = `
          <div style="padding: 1rem; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 0.5rem; text-align: center; color: white; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);">
            <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.25rem;">🍽️ Preço Especial Restaurante</div>
            <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${price}</div>
            <div style="font-size: 0.75rem; opacity: 0.8;">Pagamento À Vista</div>
          </div>
        `;
        
        // Ajustar o grid para uma coluna
        grid.style.gridTemplateColumns = '1fr';
        
        return true;
      }
      return false;
    }
    
    // Aplicar correção inicial
    function applyFix() {
      const grids = document.querySelectorAll('div[style*="grid-template-columns"]');
      let fixedCount = 0;
      
      grids.forEach(grid => {
        if (fixPriceGrid(grid)) {
          fixedCount++;
        }
      });
      
      console.log(`🎯 ${fixedCount} grids de preço corrigidos`);
      return fixedCount;
    }
    
    // Aplicar correção inicial
    applyFix();
    
    // Observar mudanças no DOM e reaplicar a correção quando necessário
    const observer = new MutationObserver(function(mutations) {
      let needsFix = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.innerHTML && node.innerHTML.includes('grid-template-columns')) {
              needsFix = true;
            }
          });
        }
      });
      
      if (needsFix) {
        setTimeout(applyFix, 100);
      }
    });
    
    // Observar o body para mudanças
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ Correção aplicada com sucesso! Usuários restaurante agora veem apenas preço à vista.');
    console.log('🔄 Sistema de monitoramento ativado para reaplicar correções automaticamente.');
    
  } else {
    console.log('ℹ️ Usuário não é do tipo Restaurante, correção não aplicada.');
  }
}, 1000);

console.log('📝 Script de correção para usuários Restaurante carregado.');