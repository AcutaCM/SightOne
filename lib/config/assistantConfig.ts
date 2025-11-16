/**
 * Assistant Data Persistence System - Configuration
 * 
 * This module loads and validates configuration from environment variables
 * and provides typed configuration objects for the application.
 */

import { SystemConfig } from '@/types/assistant';
import path from 'path';

/**
 * Load configuration from environment variables with defaults
 */
export function loadConfig(): SystemConfig {
  const config: SystemConfig = {
    database: {
      path: process.env.DATABASE_PATH || './data/assistants.db',
      backupDir: process.env.DATABASE_BACKUP_DIR || './data/backups',
      connectionPoolSize: parseInt(process.env.DB_CONNECTION_POOL_SIZE || '10', 10),
      timeout: parseInt(process.env.DB_TIMEOUT || '5000', 10),
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      dir: process.env.LOG_DIR || './logs',
      maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB default
    },
    cache: {
      ttl: parseInt(process.env.CACHE_TTL || '604800000', 10), // 7 days default
    },
    backup: {
      enabled: process.env.AUTO_BACKUP_ENABLED === 'true',
      time: process.env.AUTO_BACKUP_TIME || '02:00',
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
    },
    security: {
      enableCsrf: process.env.ENABLE_CSRF_PROTECTION !== 'false',
      enableRateLimit: process.env.ENABLE_RATE_LIMITING !== 'false',
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    },
  };

  return config;
}

/**
 * Get the absolute database path
 */
export function getDatabasePath(): string {
  const config = loadConfig();
  return path.resolve(process.cwd(), config.database.path);
}

/**
 * Get the absolute backup directory path
 */
export function getBackupDir(): string {
  const config = loadConfig();
  return path.resolve(process.cwd(), config.database.backupDir);
}

/**
 * Get the absolute logs directory path
 */
export function getLogsDir(): string {
  const config = loadConfig();
  return path.resolve(process.cwd(), config.logging.dir);
}

/**
 * Validate configuration
 */
export function validateConfig(config: SystemConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate database configuration
  if (!config.database.path) {
    errors.push('DATABASE_PATH is required');
  }
  if (!config.database.backupDir) {
    errors.push('DATABASE_BACKUP_DIR is required');
  }
  if (config.database.connectionPoolSize < 1) {
    errors.push('DB_CONNECTION_POOL_SIZE must be at least 1');
  }
  if (config.database.timeout < 1000) {
    errors.push('DB_TIMEOUT must be at least 1000ms');
  }

  // Validate logging configuration
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(config.logging.level)) {
    errors.push(`LOG_LEVEL must be one of: ${validLogLevels.join(', ')}`);
  }
  if (config.logging.maxSize < 1024) {
    errors.push('LOG_MAX_SIZE must be at least 1024 bytes');
  }

  // Validate cache configuration
  if (config.cache.ttl < 0) {
    errors.push('CACHE_TTL must be non-negative');
  }

  // Validate backup configuration
  if (config.backup.retentionDays < 1) {
    errors.push('BACKUP_RETENTION_DAYS must be at least 1');
  }

  // Validate security configuration
  if (config.security.rateLimitMaxRequests < 1) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be at least 1');
  }
  if (config.security.rateLimitWindowMs < 1000) {
    errors.push('RATE_LIMIT_WINDOW_MS must be at least 1000ms');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get configuration with validation
 */
export function getConfig(): SystemConfig {
  const config = loadConfig();
  const validation = validateConfig(config);

  if (!validation.valid) {
    console.error('Configuration validation failed:', validation.errors);
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
  }

  return config;
}

// Export singleton instance
export const config = getConfig();
