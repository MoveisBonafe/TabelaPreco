import { useEffect, useState } from 'react';
import { supabase, hasSupabaseCredentials } from '@/lib/supabase';

export function useGitHubPagesSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('offline');

  useEffect(() => {
    // Detectar se está rodando no GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (!isGitHubPages || !hasSupabaseCredentials || !supabase) {
      setStatus('offline');
      return;
    }

    const initializeConnection = async () => {
      try {
        setStatus('connecting');
        
        // Testar conexão com Supabase
        const { data, error } = await supabase
          .from('products')
          .select('count', { count: 'exact', head: true });

        if (error) {
          console.error('Erro ao conectar com Supabase:', error);
          setStatus('error');
          setIsConnected(false);
        } else {
          setStatus('connected');
          setIsConnected(true);
          console.log('✅ Conectado ao Supabase no GitHub Pages!');
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setStatus('error');
        setIsConnected(false);
      }
    };

    initializeConnection();

    // Configurar listener para mudanças em tempo real
    if (supabase) {
      const channel = supabase
        .channel('github-pages-sync')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('🔄 Mudança detectada:', payload);
            // Trigger para re-fetch dos dados
            window.dispatchEvent(new CustomEvent('supabase-sync', { detail: payload }));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return {
    isConnected,
    status,
    isGitHubPages: window.location.hostname.includes('github.io'),
    hasCredentials: hasSupabaseCredentials
  };
}