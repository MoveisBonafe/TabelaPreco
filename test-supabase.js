// Teste rápido de conectividade com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oozesebwtrbzeelkcmwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNDI4ODAsImV4cCI6MjA2MzYxODg4MH0.B7r5fxV2mCvQ0GQUk-oEEXsPlYdJTHhQ8KH8zwEWMn8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testando conexão com Supabase...');
    
    // Testar consulta simples
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro na consulta:', error);
    } else {
      console.log('✅ Conexão Supabase funcionando!');
      console.log('Dados recebidos:', data);
    }
  } catch (err) {
    console.error('❌ Erro de conexão:', err);
  }
}

testConnection();