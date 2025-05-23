// Sistema de log detalhado para conexões Supabase
import { Pool } from 'pg';

interface ConnectionAttempt {
  timestamp: Date;
  success: boolean;
  error?: string;
  duration: number;
  connectionString?: string;
  retryCount: number;
}

class SupabaseLogger {
  private attempts: ConnectionAttempt[] = [];
  private maxAttempts = 100; // Mantém os últimos 100 logs

  logConnectionAttempt(attempt: ConnectionAttempt) {
    this.attempts.push(attempt);
    
    // Mantém apenas os logs mais recentes
    if (this.attempts.length > this.maxAttempts) {
      this.attempts = this.attempts.slice(-this.maxAttempts);
    }

    // Log detalhado no console
    const status = attempt.success ? '✅ SUCESSO' : '❌ FALHA';
    const duration = `${attempt.duration}ms`;
    const host = this.extractHost(attempt.connectionString);
    
    console.log(`🔗 [SUPABASE] ${status} - ${host} (${duration})`);
    
    if (!attempt.success && attempt.error) {
      console.error(`   Erro: ${attempt.error}`);
      console.error(`   Tentativa: ${attempt.retryCount}`);
    }
  }

  private extractHost(connectionString?: string): string {
    if (!connectionString) return 'host desconhecido';
    try {
      const match = connectionString.match(/@([^:]+)/);
      return match ? match[1] : 'host não identificado';
    } catch {
      return 'host inválido';
    }
  }

  getConnectionStats() {
    const total = this.attempts.length;
    const successful = this.attempts.filter(a => a.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total * 100).toFixed(1) : '0';
    
    const lastAttempt = this.attempts[this.attempts.length - 1];
    const avgDuration = this.attempts.length > 0 
      ? Math.round(this.attempts.reduce((sum, a) => sum + a.duration, 0) / this.attempts.length)
      : 0;

    return {
      total,
      successful,
      failed,
      successRate: `${successRate}%`,
      lastAttempt: lastAttempt?.timestamp,
      lastSuccess: this.attempts.findLast(a => a.success)?.timestamp,
      avgDuration: `${avgDuration}ms`,
      recentErrors: this.getRecentErrors()
    };
  }

  getRecentErrors(limit = 5) {
    return this.attempts
      .filter(a => !a.success)
      .slice(-limit)
      .map(a => ({
        timestamp: a.timestamp,
        error: a.error,
        retryCount: a.retryCount
      }));
  }

  generateHealthReport() {
    const stats = this.getConnectionStats();
    
    console.log('\n📊 === RELATÓRIO DE SAÚDE SUPABASE ===');
    console.log(`📈 Taxa de sucesso: ${stats.successRate}`);
    console.log(`🔢 Total de tentativas: ${stats.total}`);
    console.log(`✅ Sucessos: ${stats.successful}`);
    console.log(`❌ Falhas: ${stats.failed}`);
    console.log(`⏱️  Duração média: ${stats.avgDuration}`);
    console.log(`🕐 Última tentativa: ${stats.lastAttempt?.toLocaleString()}`);
    console.log(`🎯 Último sucesso: ${stats.lastSuccess?.toLocaleString() || 'Nunca'}`);
    
    if (stats.recentErrors.length > 0) {
      console.log('\n🚨 Erros recentes:');
      stats.recentErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.timestamp.toLocaleTimeString()}: ${error.error}`);
      });
    }
    
    console.log('=====================================\n');
    
    return stats;
  }
}

export const supabaseLogger = new SupabaseLogger();

// Função para testar conexão com logs detalhados
export async function testSupabaseConnection(connectionString: string, retryCount = 0): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const pool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000, // 5 segundos timeout
      idleTimeoutMillis: 10000, // 10 segundos idle
    });

    // Testa a conexão
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();

    const duration = Date.now() - startTime;
    
    supabaseLogger.logConnectionAttempt({
      timestamp: new Date(),
      success: true,
      duration,
      connectionString,
      retryCount
    });

    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    supabaseLogger.logConnectionAttempt({
      timestamp: new Date(),
      success: false,
      error: errorMessage,
      duration,
      connectionString,
      retryCount
    });

    return false;
  }
}

// Função para reconectar com retry automático
export async function reconnectWithRetry(connectionString: string, maxRetries = 3): Promise<Pool | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Tentativa ${attempt}/${maxRetries} de conexão com Supabase...`);
    
    const success = await testSupabaseConnection(connectionString, attempt);
    
    if (success) {
      console.log('🎉 Conexão com Supabase estabelecida com sucesso!');
      return new Pool({ 
        connectionString,
        ssl: { rejectUnauthorized: false }
      });
    }
    
    if (attempt < maxRetries) {
      const delay = attempt * 2000; // Delay crescente: 2s, 4s, 6s
      console.log(`⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('💥 Falha ao conectar com Supabase após todas as tentativas');
  supabaseLogger.generateHealthReport();
  return null;
}