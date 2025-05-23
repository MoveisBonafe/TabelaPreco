import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, HardDrive, Wifi, WifiOff, CheckCircle, AlertTriangle } from 'lucide-react';

interface StorageStats {
  productsCount: number;
  categoriesCount: number;
  storageSize: string;
  isOnline: boolean;
  environment: 'development' | 'production';
  lastSync: string;
}

export function StorageMonitor() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  const loadStats = () => {
    setLoading(true);
    
    try {
      // Carrega dados do localStorage
      const products = localStorage.getItem('catalog-products-v2');
      const categories = localStorage.getItem('catalog-categories-v2');
      const lastSync = localStorage.getItem('catalog-last-update');
      
      const productsData = products ? JSON.parse(products) : [];
      const categoriesData = categories ? JSON.parse(categories) : [];
      
      // Calcula tamanho aproximado do storage
      const storageSize = new Blob([
        products || '', 
        categories || ''
      ]).size;
      
      const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      setStats({
        productsCount: productsData.length,
        categoriesCount: categoriesData.length,
        storageSize: formatSize(storageSize),
        isOnline: navigator.onLine,
        environment: isDevelopment ? 'development' : 'production',
        lastSync: lastSync ? new Date(parseInt(lastSync)).toLocaleString() : 'Nunca'
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados armazenados?')) {
      localStorage.removeItem('catalog-products-v2');
      localStorage.removeItem('catalog-categories-v2');
      localStorage.removeItem('catalog-last-update');
      loadStats();
    }
  };

  const exportData = () => {
    try {
      const products = localStorage.getItem('catalog-products-v2');
      const categories = localStorage.getItem('catalog-categories-v2');
      
      const exportData = {
        timestamp: new Date().toISOString(),
        products: products ? JSON.parse(products) : [],
        categories: categories ? JSON.parse(categories) : []
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `catalogo-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Atualiza quando muda o status online/offline
    const handleOnlineStatus = () => loadStats();
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Monitor de Armazenamento</h2>
        <Button onClick={loadStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stats.environment === 'development' ? (
                    <Database className="h-8 w-8 text-blue-500" />
                  ) : (
                    <HardDrive className="h-8 w-8 text-green-500" />
                  )}
                </div>
                <Badge variant={stats.environment === 'development' ? "default" : "secondary"}>
                  {stats.environment === 'development' ? 'Desenvolvimento' : 'GitHub Pages'}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stats.isOnline ? (
                    <Wifi className="h-8 w-8 text-green-500" />
                  ) : (
                    <WifiOff className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <Badge variant={stats.isOnline ? "default" : "destructive"}>
                  {stats.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-slate-600">Sistema</p>
                <p className="font-semibold text-green-600">Funcionando</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">Carregando status...</div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Dados */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Armazenados</CardTitle>
            <CardDescription>Informações sobre os dados no armazenamento local</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.productsCount}</p>
                <p className="text-sm text-slate-600">Produtos</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.categoriesCount}</p>
                <p className="text-sm text-slate-600">Categorias</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.storageSize}</p>
                <p className="text-sm text-slate-600">Tamanho</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-lg font-bold text-orange-600">
                  {stats.lastSync !== 'Nunca' ? '✓' : '—'}
                </p>
                <p className="text-sm text-slate-600">Sincronizado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Ambiente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="font-medium">Modo de Operação:</span>
            <Badge variant={isDevelopment ? "default" : "secondary"}>
              {isDevelopment ? 'Desenvolvimento (Supabase)' : 'Produção (LocalStorage)'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="font-medium">Sincronização:</span>
            <span className="text-sm text-slate-600">
              {isDevelopment ? 'Banco de dados compartilhado' : 'Entre abas do navegador'}
            </span>
          </div>
          
          {stats && (
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">Última Sincronização:</span>
              <span className="text-sm text-slate-600">{stats.lastSync}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações de Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle>Manutenção de Dados</CardTitle>
          <CardDescription>Ferramentas para gerenciar os dados armazenados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={exportData} variant="outline">
              Exportar Backup
            </Button>
            
            <Button onClick={clearStorage} variant="destructive">
              Limpar Dados
            </Button>
          </div>
          
          <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
            <strong>💡 Dica:</strong> {isDevelopment 
              ? 'No modo desenvolvimento, os dados são sincronizados via banco de dados.'
              : 'No GitHub Pages, os dados são sincronizados automaticamente entre abas do mesmo navegador.'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}