import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Download, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BackupSystem() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const { toast } = useToast();

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    try {
      // Criar backup manual no Supabase
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setLastBackup(new Date());
        toast({
          title: "Backup criado com sucesso!",
          description: "Seus dados foram salvos na nuvem Supabase.",
        });
      } else {
        throw new Error('Falha no backup');
      }
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: "Não foi possível criar o backup. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/backup/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-catalogo-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Dados exportados!",
        description: "Arquivo de backup baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Status do Backup Automático */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            <CardTitle>Backup Automático na Nuvem</CardTitle>
          </div>
          <CardDescription>
            Sistema de backup automático com Supabase - seus dados são protegidos automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Backup Automático Ativo
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Supabase realiza backups automáticos diários dos seus dados
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              24h
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                🔄 Backup Contínuo
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Todas as alterações são automaticamente salvas no banco Supabase em tempo real
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                📊 Recuperação Pontual
              </h4>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Possibilidade de restaurar dados de qualquer momento específico
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações de Backup */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Backup</CardTitle>
          <CardDescription>
            Ferramentas adicionais para gerenciar seus backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              className="h-20 flex-col space-y-2"
              variant="outline"
            >
              <Upload className="h-6 w-6" />
              <span>
                {isBackingUp ? 'Criando Backup...' : 'Backup Manual'}
              </span>
            </Button>

            <Button
              onClick={handleExportData}
              className="h-20 flex-col space-y-2"
              variant="outline"
            >
              <Download className="h-6 w-6" />
              <span>Exportar Dados</span>
            </Button>
          </div>

          {lastBackup && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Último backup manual:</strong> {lastBackup.toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Dados criptografados em trânsito e em repouso</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Backup automático diário com retenção de 7 dias</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Recuperação pontual disponível</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Infraestrutura gerenciada pelo Supabase</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}