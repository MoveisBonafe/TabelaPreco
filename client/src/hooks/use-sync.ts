import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface SyncMessage {
  type: string;
  data: any;
  timestamp: string;
}

export function useSync() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    // Detectar se está no GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
      // No GitHub Pages, usar apenas Supabase (sem WebSocket)
      console.log('🔄 Sistema configurado para usar Supabase via HTTP (sincronização manual)');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔄 Sincronização ativada entre navegadores');
      };

      ws.onmessage = (event) => {
        try {
          const message: SyncMessage = JSON.parse(event.data);
          console.log('📡 Atualização recebida:', message.type, message.data);
          
          // Invalidar cache para atualizar dados em tempo real
          switch (message.type) {
            case 'product_created':
            case 'product_updated':
            case 'product_deleted':
            case 'products_bulk_imported':
              queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              break;
            case 'category_created':
            case 'category_updated':
            case 'category_deleted':
              queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
              break;
          }
        } catch (error) {
          console.error('Erro ao processar mensagem de sincronização:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 Conexão de sincronização perdida. Tentando reconectar...');
        // Tentar reconectar após 3 segundos
        setTimeout(() => connect(), 3000);
      };

      ws.onerror = (error) => {
        console.error('Erro na sincronização:', error);
      };
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      // Tentar novamente após 5 segundos
      setTimeout(() => connect(), 5000);
    }
  }, [queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect
  };
}