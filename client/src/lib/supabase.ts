import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase para GitHub Pages
const supabaseUrl = 'https://oozesebwtrbzeelkcmwp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDk2MzAsImV4cCI6MjA2MzU4NTYzMH0.yL6FHKbig8Uqn-e4gZzXbuBm3YuB5gmCeowRD96n7OY';

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