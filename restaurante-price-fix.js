// Aplicar este código no console do navegador para corrigir os preços dos usuários Restaurante

// Função para corrigir a exibição de preços para usuários Restaurante
function fixRestaurantePrice() {
  // Verifica se é usuário restaurante
  if (currentUser && currentUser.role === 'customer_restaurant') {
    console.log('🍽️ Aplicando correção para usuário Restaurante');
    
    // Encontra todos os elementos de preço e esconde os que não são "À Vista"
    const priceElements = document.querySelectorAll('[style*="grid-template-columns: 1fr 1fr"]');
    
    priceElements.forEach(element => {
      const children = element.children;
      
      // Manter apenas o primeiro elemento (À Vista) e esconder os outros
      for (let i = 1; i < children.length; i++) {
        children[i].style.display = 'none';
      }
      
      // Ajustar o primeiro elemento para ocupar toda a largura
      if (children[0]) {
        children[0].style.gridColumn = '1 / -1';
        children[0].style.background = 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)';
        children[0].style.color = 'white';
        children[0].style.padding = '1rem';
        children[0].style.borderRadius = '0.5rem';
        children[0].style.boxShadow = '0 4px 6px rgba(245, 158, 11, 0.2)';
        
        // Adicionar ícone e texto especial
        const priceText = children[0].querySelector('[style*="font-weight: 600"]');
        if (priceText) {
          children[0].innerHTML = `
            <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.25rem;">🍽️ Preço Especial Restaurante</div>
            <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${priceText.textContent}</div>
            <div style="font-size: 0.75rem; opacity: 0.8;">Pagamento À Vista</div>
          `;
        }
      }
      
      // Ajustar o grid para uma coluna
      element.style.gridTemplateColumns = '1fr';
    });
    
    console.log('✅ Correção aplicada para usuário Restaurante');
  }
}

// Aplicar a correção
fixRestaurantePrice();

// Aplicar novamente quando a página for atualizada
setTimeout(fixRestaurantePrice, 1000);
setTimeout(fixRestaurantePrice, 3000);

console.log('📝 Correção para preços de Restaurante carregada. Execute fixRestaurantePrice() se necessário.');