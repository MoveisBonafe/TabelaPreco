import { useState, useEffect } from 'react';
import { supabase, TABLES, hasSupabaseCredentials } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  base_price: number;
  discount: number;
  final_price: number;
  price_a_vista: number;
  price_30: number;
  price_30_60: number;
  price_30_60_90: number;
  price_30_60_90_120: number;
  image: string;
  images: string[];
  specifications: string[];
  active: boolean;
  fixed_price: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  active: boolean;
  product_count: number;
  created_at: string;
}

export function useSupabaseProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Verificar se Supabase está configurado
      if (!hasSupabaseCredentials || !supabase) {
        console.log('🔄 Supabase não configurado. Sistema funcionando localmente.');
        setProducts([]);
        setCategories([
          { id: 1, name: 'Sofás', description: 'Sofás e estofados', icon: '🛋️', color: '#3b82f6', active: true, product_count: 0, created_at: new Date().toISOString() },
          { id: 2, name: 'Mesas', description: 'Mesas de centro e jantar', icon: '🪑', color: '#8b5cf6', active: true, product_count: 0, created_at: new Date().toISOString() },
          { id: 3, name: 'Cadeiras', description: 'Cadeiras e assentos', icon: '💺', color: '#06b6d4', active: true, product_count: 0, created_at: new Date().toISOString() },
          { id: 4, name: 'Decoração', description: 'Itens decorativos', icon: '🏺', color: '#84cc16', active: true, product_count: 0, created_at: new Date().toISOString() }
        ]);
        return;
      }

      console.log('🔄 Conectando ao Supabase...');
      
      // Carregar produtos
      const { data: productsData, error: productsError } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Carregar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      
      console.log('✅ Dados carregados do Supabase:', {
        produtos: productsData?.length || 0,
        categorias: categoriesData?.length || 0
      });
    } catch (error) {
      console.error('❌ Erro ao carregar dados do Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar sincronização em tempo real
  useEffect(() => {
    loadData();

    // Por enquanto, vamos desabilitar a sincronização em tempo real via WebSocket
    // devido a limitações de conectividade no ambiente atual
    // O sistema funcionará perfeitamente com dados do Supabase via HTTP
    
    console.log('🔄 Sistema configurado para usar Supabase via HTTP (sincronização manual)');
    
    if (hasSupabaseCredentials && supabase) {
      setIsConnected(true);
      console.log('✅ Conexão Supabase ativa via HTTP');
    }

    return () => {
      // Cleanup se necessário
    };
  }, []);

  // Funções CRUD para produtos
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    if (!hasSupabaseCredentials || !supabase) {
      console.warn('Supabase não configurado');
      return null;
    }
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Produto criado:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      throw error;
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    if (!hasSupabaseCredentials || !supabase) {
      console.warn('Supabase não configurado');
      return null;
    }
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Produto atualizado:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    if (!hasSupabaseCredentials || !supabase) {
      console.warn('Supabase não configurado');
      return false;
    }
    try {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('✅ Produto excluído:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir produto:', error);
      throw error;
    }
  };

  // Funções CRUD para categorias
  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'product_count'>) => {
    if (!hasSupabaseCredentials || !supabase) {
      console.warn('Supabase não configurado');
      return null;
    }
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Categoria criada:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error);
      throw error;
    }
  };

  return {
    products,
    categories,
    isLoading,
    isConnected,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    loadData
  };
}