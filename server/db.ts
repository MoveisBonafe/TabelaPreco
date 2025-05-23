import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { supabaseLogger } from "./supabase-logger";

neonConfig.webSocketConstructor = ws;

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set. Did you forget to configure the database URL?",
  );
}

// Criar pool com logging
const connectionString = process.env.SUPABASE_DATABASE_URL;
export const pool = new Pool({ connectionString });

// Interceptar eventos de conexão
pool.on('connect', () => {
  const responseTime = Date.now() - (pool as any)._lastConnectionAttempt || 0;
  supabaseLogger.logSuccessfulConnection(responseTime);
});

pool.on('error', (error) => {
  supabaseLogger.logConnectionError(error, connectionString);
});

// Wrapper para queries com logging
const originalQuery = pool.query.bind(pool);
pool.query = async (...args: any[]) => {
  const startTime = Date.now();
  supabaseLogger.logConnectionAttempt();
  
  try {
    const result = await originalQuery(...args);
    const responseTime = Date.now() - startTime;
    supabaseLogger.logSuccessfulConnection(responseTime);
    return result;
  } catch (error) {
    supabaseLogger.logConnectionError(error, connectionString);
    throw error;
  }
};

export const db = drizzle({ client: pool, schema });

// Função para obter status da conexão
export function getConnectionStatus() {
  const stats = supabaseLogger.getConnectionStats();
  return {
    isConnected: stats.successfulConnections > 0,
    lastConnection: stats.lastSuccessfulConnection,
    totalAttempts: stats.totalAttempts,
    successRate: stats.totalAttempts > 0 
      ? ((stats.successfulConnections / stats.totalAttempts) * 100).toFixed(2)
      : '0',
    averageResponseTime: Math.round(stats.averageResponseTime)
  };
}