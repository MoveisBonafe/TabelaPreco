import { Pool } from '@neondatabase/serverless';

interface ConnectionError {
  timestamp: Date;
  error: string;
  details: any;
  connectionString?: string;
  retryAttempt?: number;
}

interface ConnectionStats {
  totalAttempts: number;
  successfulConnections: number;
  failedConnections: number;
  lastSuccessfulConnection?: Date;
  lastFailedConnection?: Date;
  averageResponseTime: number;
  errorTypes: { [key: string]: number };
}

class SupabaseLogger {
  private connectionErrors: ConnectionError[] = [];
  private connectionStats: ConnectionStats = {
    totalAttempts: 0,
    successfulConnections: 0,
    failedConnections: 0,
    averageResponseTime: 0,
    errorTypes: {}
  };
  private responseTimes: number[] = [];

  // Log de erro de conexão
  logConnectionError(error: any, connectionString?: string, retryAttempt?: number) {
    const connectionError: ConnectionError = {
      timestamp: new Date(),
      error: error.message || String(error),
      details: {
        name: error.name,
        code: error.code,
        severity: error.severity,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
        internalPosition: error.internalPosition,
        internalQuery: error.internalQuery,
        where: error.where,
        schema: error.schema,
        table: error.table,
        column: error.column,
        dataType: error.dataType,
        constraint: error.constraint,
        file: error.file,
        line: error.line,
        routine: error.routine
      },
      connectionString: connectionString ? this.sanitizeConnectionString(connectionString) : undefined,
      retryAttempt
    };

    this.connectionErrors.push(connectionError);
    
    // Manter apenas os últimos 100 erros
    if (this.connectionErrors.length > 100) {
      this.connectionErrors = this.connectionErrors.slice(-100);
    }

    // Atualizar estatísticas
    this.updateErrorStats(error);
    
    console.error('🔴 [Supabase] Erro de conexão:', {
      timestamp: connectionError.timestamp.toISOString(),
      error: connectionError.error,
      code: error.code,
      retryAttempt: retryAttempt || 'N/A'
    });
  }

  // Log de conexão bem-sucedida
  logSuccessfulConnection(responseTime: number) {
    this.connectionStats.totalAttempts++;
    this.connectionStats.successfulConnections++;
    this.connectionStats.lastSuccessfulConnection = new Date();
    
    this.responseTimes.push(responseTime);
    
    // Manter apenas os últimos 50 tempos de resposta
    if (this.responseTimes.length > 50) {
      this.responseTimes = this.responseTimes.slice(-50);
    }
    
    // Calcular tempo médio de resposta
    this.connectionStats.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    
    console.log('🟢 [Supabase] Conexão bem-sucedida:', {
      responseTime: `${responseTime}ms`,
      averageResponseTime: `${Math.round(this.connectionStats.averageResponseTime)}ms`
    });
  }

  // Log de tentativa de conexão
  logConnectionAttempt() {
    this.connectionStats.totalAttempts++;
    console.log('🔄 [Supabase] Tentativa de conexão...', {
      attempt: this.connectionStats.totalAttempts,
      timestamp: new Date().toISOString()
    });
  }

  // Atualizar estatísticas de erro
  private updateErrorStats(error: any) {
    this.connectionStats.failedConnections++;
    this.connectionStats.lastFailedConnection = new Date();
    
    const errorType = error.code || error.name || 'UNKNOWN_ERROR';
    this.connectionStats.errorTypes[errorType] = (this.connectionStats.errorTypes[errorType] || 0) + 1;
  }

  // Sanitizar string de conexão para logs
  private sanitizeConnectionString(connectionString: string): string {
    return connectionString.replace(/:[^:@]+@/, ':***@');
  }

  // Obter erros recentes
  getRecentErrors(limit: number = 10): ConnectionError[] {
    return this.connectionErrors.slice(-limit);
  }

  // Obter estatísticas de conexão
  getConnectionStats(): ConnectionStats {
    return { ...this.connectionStats };
  }

  // Gerar relatório de saúde
  generateHealthReport() {
    const stats = this.getConnectionStats();
    const recentErrors = this.getRecentErrors(5);
    
    const successRate = stats.totalAttempts > 0 
      ? ((stats.successfulConnections / stats.totalAttempts) * 100).toFixed(2)
      : '0';
    
    const report = {
      health: {
        status: stats.failedConnections === 0 ? 'HEALTHY' : 
                stats.successfulConnections > stats.failedConnections ? 'WARNING' : 'CRITICAL',
        successRate: `${successRate}%`,
        totalAttempts: stats.totalAttempts,
        lastConnection: stats.lastSuccessfulConnection?.toISOString() || 'Never',
        averageResponseTime: `${Math.round(stats.averageResponseTime)}ms`
      },
      errors: {
        totalErrors: stats.failedConnections,
        lastError: stats.lastFailedConnection?.toISOString() || 'None',
        errorTypes: stats.errorTypes,
        recentErrors: recentErrors.map(err => ({
          timestamp: err.timestamp.toISOString(),
          error: err.error,
          code: err.details.code
        }))
      },
      recommendations: this.generateRecommendations(stats)
    };

    return report;
  }

  // Gerar recomendações baseadas nos erros
  private generateRecommendations(stats: ConnectionStats): string[] {
    const recommendations: string[] = [];
    
    if (stats.failedConnections > stats.successfulConnections) {
      recommendations.push('🔧 Alta taxa de falhas - verifique a string de conexão do Supabase');
    }
    
    if (stats.averageResponseTime > 5000) {
      recommendations.push('⚡ Tempo de resposta alto - considere otimizar queries ou verificar rede');
    }
    
    if (stats.errorTypes['ENOTFOUND']) {
      recommendations.push('🌐 Erros de DNS - verifique a URL do Supabase');
    }
    
    if (stats.errorTypes['ECONNREFUSED'] || stats.errorTypes['ETIMEDOUT']) {
      recommendations.push('🔒 Problemas de conectividade - verifique firewall e proxy');
    }
    
    if (stats.errorTypes['INVALID_AUTHORIZATION_SPECIFICATION']) {
      recommendations.push('🔑 Problemas de autenticação - verifique credenciais do Supabase');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Sistema funcionando corretamente');
    }
    
    return recommendations;
  }

  // Limpar logs antigos
  clearOldLogs() {
    this.connectionErrors = [];
    this.connectionStats = {
      totalAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0,
      averageResponseTime: 0,
      errorTypes: {}
    };
    this.responseTimes = [];
    
    console.log('🧹 [Supabase] Logs limpos');
  }
}

// Instância singleton
export const supabaseLogger = new SupabaseLogger();

// Função para testar conexão com Supabase
export async function testSupabaseConnection(connectionString: string): Promise<boolean> {
  const startTime = Date.now();
  supabaseLogger.logConnectionAttempt();
  
  try {
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    
    // Teste simples de query
    await client.query('SELECT 1');
    client.release();
    
    const responseTime = Date.now() - startTime;
    supabaseLogger.logSuccessfulConnection(responseTime);
    
    return true;
  } catch (error) {
    supabaseLogger.logConnectionError(error, connectionString);
    return false;
  }
}

// Função para monitorar conexão em intervalo
export function startConnectionMonitoring(connectionString: string, intervalMs: number = 60000) {
  console.log('🔍 [Supabase] Iniciando monitoramento de conexão...');
  
  const monitor = setInterval(async () => {
    await testSupabaseConnection(connectionString);
  }, intervalMs);
  
  // Cleanup function
  return () => {
    clearInterval(monitor);
    console.log('🛑 [Supabase] Monitoramento de conexão parado');
  };
}