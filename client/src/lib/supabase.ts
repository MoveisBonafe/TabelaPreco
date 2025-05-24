import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase para GitHub Pages
const supabaseUrl = 'https://oozesebwtrbzeelkcmwp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vemVzZWJ3dHJiemVlbGtjbXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTE1NDEsImV4cCI6MjA2MzUyNzU0MX0.tTe3kNKFl20-bIZZxJVRLd4hU2YYGB1Cn7KTcF1kMW4';

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