// Sistema de reset completo para garantir dados compartilhados
export function clearLocalStorage() {
  // Remove todos os dados do localStorage
  const keysToRemove = [
    'catalog-products',
    'catalog-categories', 
    'catalog-users',
    'catalog-settings',
    'catalog-data'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ LocalStorage limpo completamente');
}

export function forceReload() {
  // Força reload completo da página
  window.location.reload();
}

export async function resetDatabase() {
  try {
    // Limpa produtos
    await fetch('/api/reset/products', { method: 'DELETE' });
    
    // Limpa categorias  
    await fetch('/api/reset/categories', { method: 'DELETE' });
    
    console.log('✅ Banco de dados limpo');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    return false;
  }
}

export async function fullSystemReset() {
  // 1. Limpa localStorage
  clearLocalStorage();
  
  // 2. Limpa banco de dados
  await resetDatabase();
  
  // 3. Força reload da página
  setTimeout(() => {
    forceReload();
  }, 1000);
}