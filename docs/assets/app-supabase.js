// Sistema MoveisBonafe - GitHub Pages com Supabase
console.log('🎉 CÓDIGO NOVO FUNCIONANDO! Sistema rodando exclusivamente com Supabase');
console.log('🔗 Supabase configurado: true');
console.log('⚡ Build timestamp: ' + Date.now());
console.log('🚀 SEM WEBSOCKET - Apenas Supabase puro!');

// Configuração do Supabase
window.SUPABASE_CONFIG = {
  url: 'https://oozesebwtrbzeelkcmwp.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY'
};

// Carregar script principal
const script = document.createElement('script');
script.src = '/TabelaPreco/assets/app-mtwhzHHI.js';
script.type = 'module';
script.crossOrigin = true;
document.head.appendChild(script);