// CORREÇÃO FINAL PARA PROMOÇÕES - COPIE E COLE NO ARQUIVO DO GITHUB

// 1. FUNÇÃO DE ATUALIZAÇÃO CORRIGIDA (substituir a função updatePromotion)
async function updatePromotion(id) {
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
      for (const promo of systemData.promotions || []) {
        if (promo.id != id && promo.ativo) {
          await supabase.update('promocoes', promo.id, { ativo: false });
        }
      }
    }
    
    // APENAS OS CAMPOS QUE EXISTEM NA TABELA
    const promotionData = {
      texto,
      descricao,
      cor,
      ativo
    };
    
    console.log('📤 Atualizando promoção no Supabase:', id, promotionData);
    const result = await supabase.update('promocoes', id, promotionData);
    
    if (result && result.length > 0) {
      console.log('✅ Promoção atualizada com sucesso!');
      await loadSystemData();
      renderTab('promocoes');
      closePromotionModal();
      alert('Promoção atualizada com sucesso!');
    } else {
      console.error('❌ Erro: Resultado vazio do Supabase');
      alert('Erro ao atualizar promoção. Tente novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar promoção:', error);
    alert(`Erro ao atualizar promoção: ${error.message || 'Verifique os dados e tente novamente.'}`);
  }
}

// 2. FUNÇÃO DE EXCLUSÃO CORRIGIDA (substituir a função deletePromotion)
window.deletePromotion = async function(id) {
  console.log('🗑️ Tentando excluir promoção ID:', id, 'Tipo:', typeof id);
  
  const promotion = systemData.promotions?.find(p => p.id == id);
  const promotionName = promotion ? promotion.texto : 'esta promoção';
  
  if (!confirm(`Tem certeza que deseja excluir "${promotionName}"?`)) {
    return;
  }
  
  try {
    const numericId = parseInt(id);
    console.log('🔢 ID convertido para número:', numericId);
    
    // EXCLUSÃO DIRETA COM FETCH
    const response = await fetch(`https://oozesebwtrbzeelkcmwp.supabase.co/rest/v1/promocoes?id=eq.${numericId}`, {
      method: 'DELETE',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Resposta da exclusão:', response.status, response.ok);
    
    // VERIFICAR SE REALMENTE EXCLUIU
    const checkResponse = await fetch(`https://oozesebwtrbzeelkcmwp.supabase.co/rest/v1/promocoes?id=eq.${numericId}`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY'
      }
    });
    
    const remainingPromotions = await checkResponse.json();
    console.log('🔍 Promoções restantes após exclusão:', remainingPromotions);
    
    if (remainingPromotions.length === 0) {
      console.log('✅ Promoção realmente excluída!');
      await loadSystemData();
      renderTab('promocoes');
      alert('Promoção excluída com sucesso!');
    } else {
      console.log('⚠️ Promoção ainda existe no banco');
      alert('Erro: Promoção não foi excluída do banco.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao excluir promoção:', error);
    alert(`Erro ao excluir promoção: ${error.message}`);
  }
};