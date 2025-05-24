import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e chave anônima são obrigatórias');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuração das tabelas
export const TABLES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories'
} as const;