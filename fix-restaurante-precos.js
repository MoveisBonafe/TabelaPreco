// Fix para preços de usuários Restaurante
// Este código deve ser aplicado no arquivo principal

// Substitua a função renderCatalogView para corrigir os preços dos restaurantes
function renderCatalogView() {
  const userMultiplier = currentUser?.price_multiplier || 1;

  // Verificar se há promoção ativa para exibir o banner
  const activePromotion = systemData.promotions?.find(p => p.ativo) || null;

  // Função para calcular tabela de preços baseada no preço base e multiplicador
  function calculatePriceTable(basePrice, userMultiplier = 1, isFixedPrice = false) {
    if (isFixedPrice) {
      return {
        "À Vista": basePrice * userMultiplier,
        30: basePrice * userMultiplier,
        "30/60": basePrice * userMultiplier,
        "30/60/90": basePrice * userMultiplier,
        "30/60/90/120": basePrice * userMultiplier,
      };
    }

    return {
      "À Vista": basePrice * (1 + (systemData.priceSettings["A Vista"] || 0) / 100) * userMultiplier,
      30: basePrice * (1 + (systemData.priceSettings["30"] || 2) / 100) * userMultiplier,
      "30/60": basePrice * (1 + (systemData.priceSettings["30/60"] || 4) / 100) * userMultiplier,
      "30/60/90": basePrice * (1 + (systemData.priceSettings["30/60/90"] || 6) / 100) * userMultiplier,
      "30/60/90/120": basePrice * (1 + (systemData.priceSettings["30/60/90/120"] || 8) / 100) * userMultiplier,
    };
  }

  // Função para renderizar preços baseado no tipo de usuário
  function renderPriceSection(priceTable, userRole) {
    if (userRole === 'customer_restaurant') {
      // Usuários restaurante veem apenas preço à vista com destaque especial
      return `
        <div style="padding: 1rem; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 0.5rem; text-align: center; color: white; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);">
          <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.25rem;">🍽️ Preço Especial Restaurante</div>
          <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">R$ ${(priceTable["À Vista"] || 0).toFixed(2)}</div>
          <div style="font-size: 0.75rem; opacity: 0.8;">Pagamento À Vista</div>
        </div>
      `;
    } else {
      // Outros usuários veem todas as tabelas de preço
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.875rem;">
          <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
            <div style="color: #6b7280; font-size: 0.8rem;">À Vista</div>
            <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable["À Vista"] || 0).toFixed(2)}</div>
          </div>
          <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
            <div style="color: #6b7280; font-size: 0.8rem;">30</div>
            <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable["30"] || 0).toFixed(2)}</div>
          </div>
          <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
            <div style="color: #6b7280; font-size: 0.8rem;">30/60</div>
            <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable["30/60"] || 0).toFixed(2)}</div>
          </div>
          <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center;">
            <div style="color: #6b7280; font-size: 0.8rem;">30/60/90</div>
            <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable["30/60/90"] || 0).toFixed(2)}</div>
          </div>
          <div style="padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem; text-align: center; grid-column: 1 / -1;">
            <div style="color: #6b7280; font-size: 0.8rem;">30/60/90/120</div>
            <div style="color: #1f2937; font-weight: 600;">R$ ${(priceTable["30/60/90/120"] || 0).toFixed(2)}</div>
          </div>
        </div>
      `;
    }
  }

  // Resto da função renderCatalogView continua igual...
  // Esta parte deve ser aplicada na linha onde os preços são renderizados
}

console.log("📝 Fix para preços de restaurante carregado. Use renderPriceSection(priceTable, currentUser.role) para renderizar preços corretamente.");