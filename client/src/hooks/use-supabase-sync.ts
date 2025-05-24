import { useEffect, useState } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useSupabaseSync() {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Configurar sincronização em tempo real para produtos
    const productsChannel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.PRODUCTS
        },
        (payload) => {
          console.log('🔄 Produto atualizado em tempo real:', payload);
          // Invalidar cache para atualizar a interface
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('✅ Sincronização Supabase ativa para produtos');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('❌ Erro na sincronização Supabase');
        }
      });

    // Configurar sincronização para categorias
    const categoriesChannel = supabase
      .channel('categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.CATEGORIES
        },
        (payload) => {
          console.log('🔄 Categoria atualizada em tempo real:', payload);
          queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
        }
      )
      .subscribe();

    // Cleanup ao desmontar
    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, [queryClient]);

  return { isConnected };
}