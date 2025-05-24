import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  Database, 
  Server, 
  Cpu, 
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  Cloud
} from 'lucide-react';
import { useSync } from '@/hooks/use-sync';
import { useSupabaseProducts } from '@/hooks/use-supabase-products';
import { isGitHubPages } from '@/lib/github-pages-adapter';
import { hasSupabaseCredentials, supabase } from '@/lib/supabase';

interface MonitoringStats {
  totalProducts: number;
  totalCategories: number;
  activeProducts: number;
  inactiveProducts: number;
  connectedClients: number;
  serverUptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  lastUpdate: string;
}

export function MonitoringTab() {
  const { isConnected, reconnect } = useSync();
  const { products, categories, isConnected: supabaseConnected, isLoading: supabaseLoading } = useSupabaseProducts();
  
  // Detectar ambiente automaticamente
  const isGitHubPagesEnv = isGitHubPages();
  
  const { data: stats, isLoading, refetch } = useQuery<MonitoringStats>({
    queryKey: ['/api/monitoring/stats'],
    refetchInterval: isGitHubPagesEnv ? false : 5000, // Não fazer polling no GitHub Pages
    enabled: !isGitHubPagesEnv, // Desabilitar no GitHub Pages
  });

  // Calcular estatísticas em tempo real do Supabase
  const supabaseStats = {
    totalProducts: products.length,
    totalCategories: categories.length,
    activeProducts: products.filter(p => p.active).length,
    inactiveProducts: products.filter(p => !p.active).length,
  };

  const formatUptime = (uptimeInSeconds: number) => {
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header com status da sincronização */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento MoveisBonafe</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de monitoramento em tempo real
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {supabaseConnected ? (
              <>
                <Cloud className="h-5 w-5 text-blue-600" />
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  Supabase Online
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                  Supabase Offline
                </Badge>
              </>
            )}
          </div>
          {!isGitHubPagesEnv && (
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    WebSocket Online
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-orange-600" />
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                    WebSocket Offline
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={reconnect}
                    className="ml-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reconectar
                  </Button>
                </>
              )}
            </div>
          )}
          {!isGitHubPagesEnv && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          )}
          {isGitHubPagesEnv && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              GitHub Pages
            </Badge>
          )}
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Total</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supabaseStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {supabaseStats.activeProducts} ativos, {supabaseStats.inactiveProducts} inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supabaseStats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Categorias cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Navegadores Conectados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.connectedClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sincronização ativa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Online</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.serverUptime ? formatUptime(stats.serverUptime) : '0h 0m 0s'}
            </div>
            <p className="text-xs text-muted-foreground">
              Servidor ativo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status do Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Última atualização</span>
              <span className="text-sm text-muted-foreground">
                {stats?.lastUpdate ? formatTime(stats.lastUpdate) : 'Carregando...'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supabase</span>
              {supabaseConnected ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  Conectado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                  Desconectado
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">WebSocket</span>
              {isConnected ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                  Inativo
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Uso de Memória
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">RSS</span>
              <span className="text-sm font-mono">
                {stats?.memoryUsage ? formatBytes(stats.memoryUsage.rss) : '0 MB'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Heap Total</span>
              <span className="text-sm font-mono">
                {stats?.memoryUsage ? formatBytes(stats.memoryUsage.heapTotal) : '0 MB'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Heap Usado</span>
              <span className="text-sm font-mono">
                {stats?.memoryUsage ? formatBytes(stats.memoryUsage.heapUsed) : '0 MB'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Externo</span>
              <span className="text-sm font-mono">
                {stats?.memoryUsage ? formatBytes(stats.memoryUsage.external) : '0 MB'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre sincronização */}
      <Card>
        <CardHeader>
          <CardTitle>Sincronização entre Navegadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Como funciona a sincronização:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Todos os navegadores conectados visualizam as mesmas alterações em tempo real</li>
                <li>• Quando um produto é criado, editado ou excluído, todos os usuários veem a mudança instantaneamente</li>
                <li>• A importação de planilhas também sincroniza automaticamente entre todos os navegadores</li>
                <li>• A conexão é restabelecida automaticamente em caso de perda</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>
                  {isConnected ? 'Sincronização ativa' : 'Aguardando conexão'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{stats?.connectedClients || 0} navegadores conectados</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}