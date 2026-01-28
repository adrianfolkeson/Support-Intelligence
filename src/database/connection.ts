import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Check database health
 */
export async function checkHealth(): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return { healthy: true, latency: Date.now() - start };
  } catch (error) {
    return { healthy: false, latency: Date.now() - start, error: String(error) };
  }
}

/**
 * Mask sensitive data for logging
 */
function maskSensitiveData(params: any[] | undefined): any[] | undefined {
  if (!params) return params;
  
  const sensitiveKeys = ['api_key', 'apikey', 'password', 'secret', 'token', 'key'];
  
  return params.map(param => {
    if (typeof param === 'string' && param.length > 8) {
      // Check if it looks like an API key or token
      if (sensitiveKeys.some(key => param.toLowerCase().includes(key))) {
        return param.substring(0, 4) + '***MASKED***' + param.substring(param.length - 4);
      }
    }
    return param;
  });
}

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Only log query metadata, not the full params
    console.log('Executed query', { 
      text: text.substring(0, 100), 
      duration, 
      rows: res.rowCount 
    });
    
    return res;
  } catch (error) {
    console.error('Database query error:', { 
      text: text.substring(0, 100), 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export const closePool = async () => {
  await pool.end();
};

export default { query, getClient, closePool, checkHealth };
