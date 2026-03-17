export const config = {
  // App
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Support Intelligence',
  environment: process.env.NODE_ENV || 'development',

  // Rate Limits (can override with env)
  rateLimit: {
    public: parseInt(process.env.RATE_LIMIT_PUBLIC || '20', 10),
    api: parseInt(process.env.RATE_LIMIT_API || '1000', 10),
    webhook: parseInt(process.env.RATE_LIMIT_WEBHOOK || '100', 10),
    windowSec: parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '60', 10),
  },

  // AI
  ai: {
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000', 10),
    batchSize: parseInt(process.env.AI_BATCH_SIZE || '10', 10),
  },

  // Database
  db: {
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    timeout: parseInt(process.env.DB_TIMEOUT_MS || '5000', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development',
  }
} as const;
