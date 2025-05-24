import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  Database, 
  Cloud,
  RefreshCw
} from 'lucide-react';
import { useSupabaseProducts } from '@/hooks/use-supabase-products';
import { supabase } from '@/lib/supabase';

interface SimpleStats {
  totalProducts: number;
  totalCategories: number;
  activeProducts: number;
  supabaseConnection: 'connected' | 'disconnected';
}

export function MonitoringTabSimple() {
  const { isConnected } = useSupabaseProducts();
  
  const { data: stats, isLoading, error, refetch } = useQuery<SimpleStats>({
    queryKey: ['supabase-stats'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase não configurado');
      
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;
      
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      
      return {
        totalProducts: products?.length || 0,
        totalCategories: categories?.length || 0,
        activeProducts: products?.filter(p => p.active).length || 0,
        supabaseConnection: 'connected' as const
      };
    },
    refetchInterval: 30000, // Verificar a cada 30 segundos
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sistema</h2>
          <Button onClick={handleRefresh} disabled size="sm">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Atualizando...
          </Button>
        </div>
        <div className="text-center py-8">Carregando estatísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sistema</h2>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Erro ao conectar com o banco de dados
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sistema</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Supabase Cloud Database
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas dos Dados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
            <p className="text-xs text-muted-foreground">
              categorias ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              visíveis no catálogo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Plataforma:</span>
            <span className="font-medium">GitHub Pages</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Banco de Dados:</span>
            <span className="font-medium">Supabase</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Sincronização:</span>
            <span className="font-medium">Tempo Real</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Última Atualização:</span>
            <span className="font-medium">{new Date().toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}