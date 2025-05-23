import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  RefreshCw, 
  Activity, 
  Users, 
  Package, 
  RotateCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Monitor
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface DatabaseStatus {
  connection: 'connected' | 'synchronized' | 'outdated';
  lastSync: string;
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  version: string;
  uptime: string;
  performance: {
    queryTime: number;
    storageUsed: number;
    browserSupport: number;
  };
}

interface SyncStatus {
  isActive: boolean;
  lastUpdate: string;
  pendingChanges: number;
  errors: string[];
  browserSessions: number;
  syncStrategy: 'localStorage' | 'indexedDB' | 'webStorage';
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  source: string;
  status: 'success' | 'error' | 'warning';
}

// Sistema de sincronização para GitHub Pages
class GitHubPagesSyncManager {
  private static instance: GitHubPagesSyncManager;
  private syncKey = 'catalog_sync_data';
  private activityKey = 'catalog_activity_log';
  private lastSyncKey = 'catalog_last_sync';

  static getInstance(): GitHubPagesSyncManager {
    if (!GitHubPagesSyncManager.instance) {
      GitHubPagesSyncManager.instance = new GitHubPagesSyncManager();
    }
    return GitHubPagesSyncManager.instance;
  }

  // Verificar compatibilidade do navegador
  checkBrowserSupport(): number {
    let support = 0;
    if (typeof Storage !== 'undefined') support += 25;
    if ('indexedDB' in window) support += 25;
    if ('serviceWorker' in navigator) support += 25;
    if ('BroadcastChannel' in window) support += 25;
    return support;
  }

  // Obter dados de produtos do localStorage
  getProducts(): any[] {
    try {
      const data = localStorage.getItem('catalog_products');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Obter dados de categorias do localStorage
  getCategories(): any[] {
    try {
      const data = localStorage.getItem('catalog_categories');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Sincronizar dados entre abas/janelas
  syncAcrossBrowsers(): void {
    const syncData = {
      products: this.getProducts(),
      categories: this.getCategories(),
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId()
    };

    localStorage.setItem(this.syncKey, JSON.stringify(syncData));
    localStorage.setItem(this.lastSyncKey, new Date().toISOString());
    
    // Broadcast para outras abas
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('catalog_sync');
      channel.postMessage({ type: 'SYNC_UPDATE', data: syncData });
    }

    this.addActivityLog('Sincronização executada', 'Sistema', 'success');
  }

  // Verificar integridade dos dados
  checkDataIntegrity(): { issues: string[]; totalChecks: number } {
    const issues: string[] = [];
    let totalChecks = 0;

    const products = this.getProducts();
    const categories = this.getCategories();

    totalChecks++;
    if (!Array.isArray(products)) {
      issues.push('Formato de produtos inválido');
    }

    totalChecks++;
    if (!Array.isArray(categories)) {
      issues.push('Formato de categorias inválido');
    }

    totalChecks++;
    const duplicateProducts = products.filter((p, i, arr) => 
      arr.findIndex(p2 => p2.id === p.id) !== i
    );
    if (duplicateProducts.length > 0) {
      issues.push(`${duplicateProducts.length} produto(s) duplicado(s) encontrado(s)`);
    }

    totalChecks++;
    const orphanProducts = products.filter(p => 
      !categories.some(c => c.name === p.category)
    );
    if (orphanProducts.length > 0) {
      issues.push(`${orphanProducts.length} produto(s) sem categoria válida`);
    }

    return { issues, totalChecks };
  }

  // Adicionar log de atividade
  addActivityLog(action: string, source: string, status: 'success' | 'error' | 'warning'): void {
    try {
      const logs = this.getActivityLogs();
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        action,
        timestamp: new Date().toISOString(),
        source,
        status
      };
      
      logs.unshift(newLog);
      
      // Manter apenas os últimos 50 logs
      if (logs.length > 50) {
        logs.splice(50);
      }
      
      localStorage.setItem(this.activityKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Erro ao salvar log:', error);
    }
  }

  // Obter logs de atividade
  getActivityLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(this.activityKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Gerar ID de sessão
  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Obter informações de armazenamento
  getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }
      
      // Estimativa: localStorage típico suporta ~5MB
      const availableEstimate = 5 * 1024 * 1024; // 5MB em bytes
      
      return {
        used: Math.round(used / 1024), // em KB
        available: Math.round((availableEstimate - used) / 1024) // em KB
      };
    } catch {
      return { used: 0, available: 0 };
    }
  }
}

export function DatabaseMonitoring() {
  const { showToast } = useToast();
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);

  const syncManager = GitHubPagesSyncManager.getInstance();

  // Atualizar dados do status
  const updateStatus = () => {
    setIsLoading(true);
    
    const products = syncManager.getProducts();
    const categories = syncManager.getCategories();
    const storageInfo = syncManager.getStorageInfo();
    const browserSupport = syncManager.checkBrowserSupport();
    const lastSync = localStorage.getItem('catalog_last_sync') || '';
    
    const status: DatabaseStatus = {
      connection: products.length > 0 || categories.length > 0 ? 'synchronized' : 'outdated',
      lastSync,
      totalProducts: products.length,
      totalCategories: categories.length,
      totalUsers: 1, // GitHub Pages é single-user
      version: '1.0.0-github-pages',
      uptime: calculateUptime(),
      performance: {
        queryTime: measureQueryTime(),
        storageUsed: storageInfo.used,
        browserSupport
      }
    };

    const syncStat: SyncStatus = {
      isActive: isAutoRefresh,
      lastUpdate: lastSync,
      pendingChanges: 0,
      errors: [],
      browserSessions: 1,
      syncStrategy: 'localStorage'
    };

    setDbStatus(status);
    setSyncStatus(syncStat);
    setActivityLogs(syncManager.getActivityLogs());
    setIsLoading(false);
  };

  // Calcular uptime (tempo desde o carregamento da página)
  const calculateUptime = (): string => {
    const startTime = sessionStorage.getItem('app_start_time');
    if (!startTime) {
      sessionStorage.setItem('app_start_time', Date.now().toString());
      return '0m';
    }
    
    const elapsed = Date.now() - parseInt(startTime);
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Medir tempo de consulta (simulado)
  const measureQueryTime = (): number => {
    const start = performance.now();
    syncManager.getProducts();
    syncManager.getCategories();
    const end = performance.now();
    return Math.round(end - start);
  };

  // Forçar sincronização
  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      syncManager.syncAcrossBrowsers();
      updateStatus();
      showToast('Sincronização executada com sucesso!');
    } catch (error) {
      showToast('Erro durante a sincronização', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Verificar integridade
  const handleCheckIntegrity = async () => {
    setIsCheckingIntegrity(true);
    try {
      const result = syncManager.checkDataIntegrity();
      
      if (result.issues.length > 0) {
        showToast(`Verificação concluída: ${result.issues.length} problema(s) encontrado(s)`, 'error');
        syncManager.addActivityLog(
          `Integridade verificada: ${result.issues.length} problemas encontrados`,
          'Sistema',
          'warning'
        );
      } else {
        showToast('Base de dados íntegra! Nenhum problema encontrado.');
        syncManager.addActivityLog('Verificação de integridade: dados íntegros', 'Sistema', 'success');
      }
      
      updateStatus();
    } catch (error) {
      showToast('Erro ao verificar integridade', 'error');
    } finally {
      setIsCheckingIntegrity(false);
    }
  };

  // UseEffect para carregar dados iniciais e configurar auto-refresh
  useEffect(() => {
    updateStatus();
    
    // Listener para mudanças no localStorage (sincronização entre abas)
    const handleStorageChange = () => {
      updateStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Listener para BroadcastChannel (sincronização em tempo real)
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('catalog_sync');
      channel.onmessage = (event) => {
        if (event.data.type === 'SYNC_UPDATE') {
          updateStatus();
        }
      };
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        channel.close();
      };
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!isAutoRefresh) return;
    
    const interval = setInterval(() => {
      updateStatus();
    }, 30000); // Atualiza a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const handleRefresh = () => {
    updateStatus();
    showToast('Dados atualizados!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synchronized':
        return 'bg-green-100 text-green-800';
      case 'outdated':
        return 'bg-yellow-100 text-yellow-800';
      case 'connected':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUptime = (uptime: string) => {
    return uptime || 'N/A';
  };

  const formatLastSync = (lastSync: string) => {
    if (!lastSync) return 'Nunca';
    const date = new Date(lastSync);
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Monitoramento GitHub Pages</h2>
          <p className="text-slate-600">Sincronização entre navegadores e sistemas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={isAutoRefresh ? 'bg-green-50 border-green-200 text-green-800' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto-refresh {isAutoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status da Sincronização */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Status da Sincronização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <Badge className={getStatusColor(dbStatus?.connection || 'outdated')}>
                  {dbStatus?.connection === 'synchronized' ? 'Sincronizado' : 
                   dbStatus?.connection === 'connected' ? 'Conectado' : 'Aguardando'}
                </Badge>
                <p className="text-xs text-slate-500 mt-1">
                  Uptime: {formatUptime(dbStatus?.uptime || '')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Produtos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {dbStatus?.totalProducts || 0}
                </p>
                <p className="text-xs text-slate-500">produtos cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Categorias */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {dbStatus?.totalCategories || 0}
                </p>
                <p className="text-xs text-slate-500">categorias ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Monitor className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {dbStatus?.performance?.queryTime || 0}ms
                </p>
                <p className="text-xs text-slate-500">tempo de consulta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sincronização e Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status de Sincronização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCw className="h-5 w-5" />
              Status de Sincronização
            </CardTitle>
            <CardDescription>
              Monitoramento entre navegadores e dispositivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado da Sincronização:</span>
              <Badge className={syncStatus?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {syncStatus?.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Última Sincronização:</span>
              <span className="text-sm text-slate-600">
                {formatLastSync(syncStatus?.lastUpdate || '')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estratégia:</span>
              <Badge variant="secondary">
                {syncStatus?.syncStrategy || 'localStorage'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Suporte do Navegador:</span>
              <Badge variant="secondary">
                {dbStatus?.performance?.browserSupport || 0}%
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleForceSync}
                disabled={isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCw className="h-4 w-4 mr-2" />
                )}
                Forçar Sincronização
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ações e Manutenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Manutenção e Integridade
            </CardTitle>
            <CardDescription>
              Ferramentas para manter os dados consistentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleCheckIntegrity}
                disabled={isCheckingIntegrity}
                className="w-full justify-start"
              >
                {isCheckingIntegrity ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Verificar Integridade
              </Button>

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-full justify-start"
              >
                <Database className="h-4 w-4 mr-2" />
                Atualizar Estatísticas
              </Button>
            </div>

            {/* Informações do Sistema */}
            <div className="pt-4 border-t space-y-2">
              <h4 className="text-sm font-medium text-slate-900">Informações do Sistema</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Versão:</span>
                  <span>{dbStatus?.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Armazenamento Usado:</span>
                  <span>{dbStatus?.performance?.storageUsed || 0}KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessões Ativas:</span>
                  <span>{syncStatus?.browserSessions || 1}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas operações no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activityLogs.length > 0 ? (
              activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-sm text-slate-600 py-2 px-3 bg-slate-50 rounded">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' && <CheckCircle className="h-3 w-3 text-green-600" />}
                      {log.status === 'error' && <AlertCircle className="h-3 w-3 text-red-600" />}
                      {log.status === 'warning' && <AlertCircle className="h-3 w-3 text-yellow-600" />}
                      <span>{log.action}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs">{formatLastSync(log.timestamp)}</span>
                      <p className="text-xs text-slate-400">{log.source}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 py-4 text-center">
                Nenhuma atividade registrada ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}