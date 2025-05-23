import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { supabaseLogger, reconnectWithRetry, testSupabaseConnection } from './supabase-logger';

// Tenta conectar primeiro com Supabase, depois fallback para local
const supabaseUrl = process.env.SUPABASE_DATABASE_URL || "postgresql://postgres:6OrkEBSgQUUuiKTH@db.oozesebwtrbzeelkcmwp.supabase.co:5432/postgres";
const localUrl = process.env.DATABASE_URL;

let pool: Pool | null = null;
let isSupabaseConnected = false;

async function initializeDatabase() {
  console.log('🚀 Inicializando conexão com banco de dados...');
  
  // Tenta conectar com Supabase primeiro
  if (supabaseUrl) {
    console.log('🔗 Testando conexão com Supabase...');
    const supabasePool = await reconnectWithRetry(supabaseUrl, 2);
    
    if (supabasePool) {
      pool = supabasePool;
      isSupabaseConnected = true;
      console.log('✅ Conectado ao Supabase com sucesso!');
    }
  }
  
  // Fallback para banco local se Supabase falhar
  if (!pool && localUrl) {
    console.log('🔄 Fallback: conectando ao banco local...');
    try {
      pool = new Pool({ connectionString: localUrl });
      await pool.query('SELECT 1'); // Testa conexão
      console.log('✅ Conectado ao banco local!');
    } catch (error) {
      console.error('❌ Falha ao conectar ao banco local:', error);
      throw new Error('Nenhuma conexão de banco disponível');
    }
  }
  
  if (!pool) {
    throw new Error('Falha ao conectar com qualquer banco de dados');
  }
}

// Inicializa a conexão
initializeDatabase().catch(console.error);

export { pool, isSupabaseConnected };
export const db = pool ? drizzle(pool, { schema }) : null;

// Função para obter status da conexão
export function getConnectionStatus() {
  return {
    isSupabaseConnected,
    hasConnection: !!pool,
    connectionStats: supabaseLogger.getConnectionStats()
  };
}