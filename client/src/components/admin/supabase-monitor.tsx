import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Database, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ConnectionStats {
  total: number;
  successful: number;
  failed: number;
  successRate: string;
  lastAttempt?: string;
  lastSuccess?: string;
  avgDuration: string;
  recentErrors: Array<{
    timestamp: string;
    error: string;
    retryCount: number;
  }>;
}

interface SupabaseStatus {
  isSupabaseConnected: boolean;
  hasConnection: boolean;
  connectionStats: ConnectionStats;
  timestamp: string;
  uptime: number;
}

export function SupabaseMonitor() {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testConnectionString, setTestConnectionString] = useState('');
  const [testing, setTesting] = useState(false);
  const { showToast } = useToast();

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/supabase/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/supabase/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      showToast('Erro ao carregar logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!testConnectionString.trim()) {
      showToast('Digite uma string de conexão válida', 'error');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: testConnectionString })
      });
      
      const result = await response.json();
      
      if (result.success) {
        showToast('✅ Conexão bem-sucedida!', 'success');
      } else {
        showToast('❌ Falha na conexão', 'error');
      }
      
      // Recarrega status após teste
      await loadStatus();
      await loadLogs();
    } catch (error) {
      showToast('Erro ao testar conexão', 'error');
    } finally {
      setTesting(false);
    }
  };

  const generateHealthReport = async () => {
    try {
      const response = await fetch('/api/supabase/health-report');
      const data = await response.json();
      
      // Mostra no console para análise detalhada
      console.log('📊 RELATÓRIO DE SAÚDE SUPABASE', data.report);
      showToast('Relatório gerado no console', 'success');
    } catch (error) {
      showToast('Erro ao gerar relatório', 'error');
    }
  };

  useEffect(() => {
    loadStatus();
    loadLogs();
    
    // Atualiza a cada 30 segundos
    const interval = setInterval(() => {
      loadStatus();
      loadLogs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Monitor Supabase</h2>
        <Button onClick={() => { loadStatus(); loadLogs(); }} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {status.isSupabaseConnected ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <Badge variant={status.isSupabaseConnected ? "default" : "destructive"}>
                  {status.isSupabaseConnected ? 'Supabase Conectado' : 'Supabase Desconectado'}
                </Badge>
              </div>
              
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-slate-600">Uptime</p>
                <p className="font-semibold">{formatUptime(status.uptime)}</p>
              </div>
              
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-slate-600">Taxa de Sucesso</p>
                <p className="font-semibold">{status.connectionStats.successRate}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">Carregando status...</div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Detalhadas */}
      {logs && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Conexão</CardTitle>
            <CardDescription>Dados detalhados das tentativas de conexão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{logs.statistics.total}</p>
                <p className="text-sm text-slate-600">Total</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{logs.statistics.successful}</p>
                <p className="text-sm text-slate-600">Sucessos</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{logs.statistics.failed}</p>
                <p className="text-sm text-slate-600">Falhas</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{logs.statistics.avgDuration}</p>
                <p className="text-sm text-slate-600">Duração Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erros Recentes */}
      {logs && logs.recentErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Erros Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.recentErrors.map((error: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{error.error}</p>
                      <p className="text-xs text-red-600">
                        {new Date(error.timestamp).toLocaleString()} • Tentativa #{error.retryCount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teste Manual de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle>Teste Manual de Conexão</CardTitle>
          <CardDescription>Teste uma string de conexão Supabase específica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="connectionString">String de Conexão PostgreSQL</Label>
            <Textarea
              id="connectionString"
              placeholder="postgresql://postgres:password@host:5432/database"
              value={testConnectionString}
              onChange={(e) => setTestConnectionString(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={testing}>
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>
            
            <Button variant="outline" onClick={generateHealthReport}>
              Gerar Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}