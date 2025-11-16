/**
 * WebSocket Connection Pool Manager
 * 
 * Manages multiple WebSocket connections efficiently:
 * - Connection pooling and reuse
 * - Load balancing across connections
 * - Automatic cleanup of idle connections
 */

import { AIConfigSyncClient } from './aiConfigSync';
import { logger } from '@/lib/logger/logger';

interface PooledConnection {
  client: AIConfigSyncClient;
  url: string;
  lastUsed: number;
  activeRequests: number;
}

const MAX_POOL_SIZE = 3;
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

/**
 * Connection Pool Manager for WebSocket connections
 */
export class ConnectionPoolManager {
  private pool: Map<string, PooledConnection> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  /**
   * Start periodic cleanup of idle connections
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, CLEANUP_INTERVAL);
  }

  /**
   * Clean up idle connections
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    let cleaned = 0;

    this.pool.forEach((conn, url) => {
      // Remove if idle for too long and no active requests
      if (conn.activeRequests === 0 && now - conn.lastUsed >= IDLE_TIMEOUT) {
        logger.info('Cleaning up idle connection', { url, idleTime: now - conn.lastUsed }, 'ConnectionPoolManager');
        conn.client.disconnect();
        this.pool.delete(url);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} idle connections`, { poolSize: this.pool.size }, 'ConnectionPoolManager');
    }
  }

  /**
   * Get or create a connection from the pool
   * 
   * @param url - WebSocket URL
   * @returns Promise resolving to the connection client
   */
  async getConnection(url: string): Promise<AIConfigSyncClient> {
    // Check if connection exists in pool
    let pooled = this.pool.get(url);

    if (pooled) {
      // Check if connection is still alive
      if (pooled.client.isConnected()) {
        pooled.lastUsed = Date.now();
        logger.info('Reusing pooled connection', { url, poolSize: this.pool.size }, 'ConnectionPoolManager');
        return pooled.client;
      } else {
        // Connection is dead, remove from pool
        logger.warn('Pooled connection is dead, removing', { url }, 'ConnectionPoolManager');
        this.pool.delete(url);
      }
    }

    // Check pool size limit
    if (this.pool.size >= MAX_POOL_SIZE) {
      // Find least recently used connection with no active requests
      let lruUrl: string | null = null;
      let lruTime = Infinity;

      this.pool.forEach((conn, poolUrl) => {
        if (conn.activeRequests === 0 && conn.lastUsed < lruTime) {
          lruUrl = poolUrl;
          lruTime = conn.lastUsed;
        }
      });

      // Remove LRU connection if found
      if (lruUrl) {
        logger.info('Pool full, removing LRU connection', { url: lruUrl }, 'ConnectionPoolManager');
        const lruConn = this.pool.get(lruUrl);
        lruConn?.client.disconnect();
        this.pool.delete(lruUrl);
      }
    }

    // Create new connection
    logger.info('Creating new pooled connection', { url, poolSize: this.pool.size }, 'ConnectionPoolManager');
    const client = new AIConfigSyncClient(url);
    await client.connect();

    // Add to pool
    pooled = {
      client,
      url,
      lastUsed: Date.now(),
      activeRequests: 0,
    };
    this.pool.set(url, pooled);

    logger.info('Connection added to pool', { url, poolSize: this.pool.size }, 'ConnectionPoolManager');
    return client;
  }

  /**
   * Release a connection back to the pool
   * 
   * @param url - WebSocket URL
   */
  releaseConnection(url: string): void {
    const pooled = this.pool.get(url);
    if (pooled) {
      pooled.lastUsed = Date.now();
      pooled.activeRequests = Math.max(0, pooled.activeRequests - 1);
      logger.info('Connection released', { url, activeRequests: pooled.activeRequests }, 'ConnectionPoolManager');
    }
  }

  /**
   * Mark connection as in use
   * 
   * @param url - WebSocket URL
   */
  markInUse(url: string): void {
    const pooled = this.pool.get(url);
    if (pooled) {
      pooled.activeRequests++;
      logger.info('Connection marked in use', { url, activeRequests: pooled.activeRequests }, 'ConnectionPoolManager');
    }
  }

  /**
   * Remove a connection from the pool
   * 
   * @param url - WebSocket URL
   */
  removeConnection(url: string): void {
    const pooled = this.pool.get(url);
    if (pooled) {
      logger.info('Removing connection from pool', { url }, 'ConnectionPoolManager');
      pooled.client.disconnect();
      this.pool.delete(url);
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): {
    size: number;
    connections: Array<{
      url: string;
      connected: boolean;
      lastUsed: number;
      activeRequests: number;
      idleTime: number;
    }>;
  } {
    const now = Date.now();
    const connections: Array<{
      url: string;
      connected: boolean;
      lastUsed: number;
      activeRequests: number;
      idleTime: number;
    }> = [];

    this.pool.forEach((conn) => {
      connections.push({
        url: conn.url,
        connected: conn.client.isConnected(),
        lastUsed: conn.lastUsed,
        activeRequests: conn.activeRequests,
        idleTime: now - conn.lastUsed,
      });
    });

    return {
      size: this.pool.size,
      connections,
    };
  }

  /**
   * Clear all connections from the pool
   */
  clearPool(): void {
    logger.info('Clearing connection pool', { size: this.pool.size }, 'ConnectionPoolManager');
    
    this.pool.forEach((pooled) => {
      pooled.client.disconnect();
    });
    
    this.pool.clear();
  }

  /**
   * Destroy the pool manager
   */
  destroy(): void {
    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Clear all connections
    this.clearPool();

    logger.info('Connection pool manager destroyed', {}, 'ConnectionPoolManager');
  }
}

// Export singleton instance
export const connectionPoolManager = new ConnectionPoolManager();

/**
 * Helper function to execute a WebSocket operation with connection pooling
 * 
 * @param url - WebSocket URL
 * @param operation - Function that uses the connection
 * @returns Promise resolving to the operation result
 */
export async function withPooledConnection<T>(
  url: string,
  operation: (client: AIConfigSyncClient) => Promise<T>
): Promise<T> {
  const client = await connectionPoolManager.getConnection(url);
  connectionPoolManager.markInUse(url);

  try {
    const result = await operation(client);
    return result;
  } finally {
    connectionPoolManager.releaseConnection(url);
  }
}
