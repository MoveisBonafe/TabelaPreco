// CORREÇÕES PARA AS PROMOÇÕES - Aplicar no arquivo do GitHub Pages

// 1. CORREÇÃO DA FUNÇÃO DE EDIÇÃO - Substituir a função showPromotionModal
window.showPromotionModal = function(promotionId = null) {
  console.log('🔍 Abrindo modal para promoção ID:', promotionId, 'Tipo:', typeof promotionId);
  console.log('📋 Promoções disponíveis:', systemData.promotions);
  
  // Buscar promoção usando comparação flexível
  const promotion = promotionId ? systemData.promotions.find(p => p.id == promotionId) : null;
  console.log('📋 Promoção encontrada:', promotion);
  
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
        
        <form onsubmit="handlePromotionSubmit(event, '${promotion?.id || ''}')" style="display: flex; flex-direction: column; gap: 1.5rem;">
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
};

// 2. CORREÇÃO DA FUNÇÃO DE EXCLUSÃO - Substituir a função deletePromotion
window.deletePromotion = async function(id) {
  console.log('🗑️ Tentando excluir promoção ID:', id, 'Tipo:', typeof id);
  
  const promotion = systemData.promotions?.find(p => p.id == id);
  const promotionName = promotion ? promotion.texto : 'esta promoção';
  
  if (!confirm(`Tem certeza que deseja excluir "${promotionName}"?`)) {
    return;
  }
  
  try {
    // Converter ID para número se necessário
    const numericId = parseInt(id);
    console.log('🔢 ID convertido para número:', numericId);
    
    // Fazer a exclusão no Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/promocoes?id=eq.${numericId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Status da exclusão:', response.status, response.ok);
    
    if (response.ok) {
      console.log('✅ Promoção excluída com sucesso do Supabase!');
      
      // Recarregar dados e atualizar tela
      await loadSystemData();
      renderTab('promocoes');
      alert('Promoção excluída com sucesso!');
    } else {
      const errorText = await response.text();
      console.error('❌ Erro na exclusão:', response.status, errorText);
      alert('Erro ao excluir promoção. Tente novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao excluir promoção:', error);
    alert(`Erro ao excluir promoção: ${error.message || 'Tente novamente.'}`);
  }
};

// 3. CORREÇÃO DO BANNER DE PROMOÇÃO - Substituir a função renderPromotionBanner
function renderPromotionBanner() {
  console.log('🎯 Verificando promoções ativas:', systemData.promotions);
  
  if (!systemData.promotions || !Array.isArray(systemData.promotions)) {
    console.log('❌ Array de promoções não existe ou não é válido');
    return '';
  }
  
  const activePromotion = systemData.promotions.find(p => p.ativo === true);
  
  if (!activePromotion) {
    console.log('❌ Nenhuma promoção ativa encontrada');
    console.log('📋 Promoções disponíveis:', systemData.promotions.map(p => ({id: p.id, texto: p.texto, ativo: p.ativo})));
    return '';
  }
  
  console.log('✅ Promoção ativa encontrada:', activePromotion);
  
  return `
    <div style="background: ${activePromotion.cor || 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'}; color: white; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative;">
      <div style="font-size: 1.1rem;">🎉 ${activePromotion.texto || 'Promoção Especial!'}</div>
      ${activePromotion.descricao ? `<div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">${activePromotion.descricao}</div>` : ''}
    </div>
  `;
}