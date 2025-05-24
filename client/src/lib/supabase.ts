import { createClient } from '@supabase/supabase-js';

// Detectar se as credenciais do Supabase estão disponíveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseCredentials = !!(supabaseUrl && supabaseAnonKey);

// Criar cliente Supabase apenas se as credenciais estiverem disponíveis
export const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Configuração das tabelas
export const TABLES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories'
} as const;