// Sistema de sincronização para GitHub Pages
// Usa eventos do navegador para sincronizar dados entre abas/janelas

const SYNC_CHANNEL = 'catalog-sync';
const LAST_UPDATE_KEY = 'catalog-last-update';

class GitHubPagesSync {
  private channel: BroadcastChannel;
  private listeners: Array<() => void> = [];

  constructor() {
    // BroadcastChannel para comunicação entre abas
    this.channel = new BroadcastChannel(SYNC_CHANNEL);
    this.setupListeners();
  }

  private setupListeners() {
    // Escuta mensagens de outras abas
    this.channel.addEventListener('message', (event) => {
      if (event.data.type === 'data-updated') {
        // Notifica todos os listeners que os dados mudaram
        this.listeners.forEach(callback => callback());
      }
    });

    // Fallback para navegadores sem BroadcastChannel
    window.addEventListener('storage', (event) => {
      if (event.key === LAST_UPDATE_KEY) {
        this.listeners.forEach(callback => callback());
      }
    });
  }

  // Notifica que os dados foram atualizados
  notifyDataUpdated() {
    const timestamp = Date.now();
    
    // Método 1: BroadcastChannel (moderno)
    try {
      this.channel.postMessage({
        type: 'data-updated',
        timestamp
      });
    } catch (error) {
      console.log('BroadcastChannel não disponível, usando localStorage');
    }

    // Método 2: localStorage (fallback)
    localStorage.setItem(LAST_UPDATE_KEY, timestamp.toString());
  }

  // Registra callback para quando dados são atualizados
  onDataUpdated(callback: () => void) {
    this.listeners.push(callback);
    
    // Retorna função para remover o listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

export const githubPagesSync = new GitHubPagesSync();