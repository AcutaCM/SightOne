import { logger } from '../logger/logger';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
}

export interface PerformanceReport {
  apiMetrics: {
    totalRequests: number;
    averageResponseTime: number;
    slowestEndpoint: { endpoint: string; duration: number } | null;
    fastestEndpoint: { endpoint: string; duration: number } | null;
  };
  databaseMetrics: {
    totalQueries: number;
    averageQueryTime: number;
    slowestQuery: { query: string; duration: number } | null;
  };
  cacheMetrics: CacheMetrics;
  timeRange: {
    start: Date;
    end: Date;
  };
}

class PerformanceMonitor {
  private apiMetrics: Map<string, PerformanceMetric[]> = new Map();
  private dbMetrics: PerformanceMetric[] = [];
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private monitoringStartTime: Date = new Date();

  // Track API response time
  trackApiRequest(endpoint: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name: endpoint,
      duration,
      timestamp: new Date(),
      metadata,
    };

    if (!this.apiMetrics.has(endpoint)) {
      this.apiMetrics.set(endpoint, []);
    }
    this.apiMetrics.get(endpoint)!.push(metric);

    // Log slow requests (>1000ms)
    if (duration > 1000) {
      logger.warn('Slow API request detected', {
        endpoint,
        duration,
        metadata,
      }, 'PerformanceMonitor');
    }

    logger.debug('API request tracked', {
      endpoint,
      duration,
    }, 'PerformanceMonitor');
  }

  // Track database query time
  trackDatabaseQuery(query: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name: query,
      duration,
      timestamp: new Date(),
      metadata,
    };

    this.dbMetrics.push(metric);

    // Log slow queries (>200ms)
    if (duration > 200) {
      logger.warn('Slow database query detected', {
        query,
        duration,
        metadata,
      }, 'PerformanceMonitor');
    }

    logger.debug('Database query tracked', {
      query,
      duration,
    }, 'PerformanceMonitor');
  }

  // Track cache hit
  trackCacheHit(): void {
    this.cacheHits++;
    logger.debug('Cache hit recorded', {
      totalHits: this.cacheHits,
      hitRate: this.getCacheHitRate(),
    }, 'PerformanceMonitor');
  }

  // Track cache miss
  trackCacheMiss(): void {
    this.cacheMisses++;
    logger.debug('Cache miss recorded', {
      totalMisses: this.cacheMisses,
      hitRate: this.getCacheHitRate(),
    }, 'PerformanceMonitor');
  }

  // Get cache hit rate
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total === 0 ? 0 : (this.cacheHits / total) * 100;
  }

  // Get cache metrics
  getCacheMetrics(): CacheMetrics {
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.getCacheHitRate(),
    };
  }

  // Generate performance report
  generateReport(): PerformanceReport {
    const now = new Date();

    // Calculate API metrics
    let totalApiRequests = 0;
    let totalApiDuration = 0;
    let slowestEndpoint: { endpoint: string; duration: number } | null = null;
    let fastestEndpoint: { endpoint: string; duration: number } | null = null;

    this.apiMetrics.forEach((metrics, endpoint) => {
      metrics.forEach(metric => {
        totalApiRequests++;
        totalApiDuration += metric.duration;

        if (!slowestEndpoint || metric.duration > slowestEndpoint.duration) {
          slowestEndpoint = { endpoint, duration: metric.duration };
        }

        if (!fastestEndpoint || metric.duration < fastestEndpoint.duration) {
          fastestEndpoint = { endpoint, duration: metric.duration };
        }
      });
    });

    // Calculate database metrics
    let totalDbQueries = this.dbMetrics.length;
    let totalDbDuration = this.dbMetrics.reduce((sum, m) => sum + m.duration, 0);
    let slowestQuery: { query: string; duration: number } | null = null;

    this.dbMetrics.forEach(metric => {
      if (!slowestQuery || metric.duration > slowestQuery.duration) {
        slowestQuery = { query: metric.name, duration: metric.duration };
      }
    });

    const report: PerformanceReport = {
      apiMetrics: {
        totalRequests: totalApiRequests,
        averageResponseTime: totalApiRequests > 0 ? totalApiDuration / totalApiRequests : 0,
        slowestEndpoint,
        fastestEndpoint,
      },
      databaseMetrics: {
        totalQueries: totalDbQueries,
        averageQueryTime: totalDbQueries > 0 ? totalDbDuration / totalDbQueries : 0,
        slowestQuery,
      },
      cacheMetrics: this.getCacheMetrics(),
      timeRange: {
        start: this.monitoringStartTime,
        end: now,
      },
    };

    logger.info('Performance report generated', report, 'PerformanceMonitor');

    return report;
  }

  // Reset all metrics
  reset(): void {
    this.apiMetrics.clear();
    this.dbMetrics = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.monitoringStartTime = new Date();
    logger.info('Performance metrics reset', {}, 'PerformanceMonitor');
  }

  // Get metrics for a specific endpoint
  getEndpointMetrics(endpoint: string): PerformanceMetric[] {
    return this.apiMetrics.get(endpoint) || [];
  }

  // Get all database metrics
  getDatabaseMetrics(): PerformanceMetric[] {
    return [...this.dbMetrics];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure execution time
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  type: 'api' | 'database' = 'api'
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (type === 'api') {
      performanceMonitor.trackApiRequest(name, duration);
    } else {
      performanceMonitor.trackDatabaseQuery(name, duration);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    if (type === 'api') {
      performanceMonitor.trackApiRequest(name, duration, { error: true });
    } else {
      performanceMonitor.trackDatabaseQuery(name, duration, { error: true });
    }
    
    throw error;
  }
}

// Utility function to measure synchronous execution time
export function measureSync<T>(
  name: string,
  fn: () => T,
  type: 'api' | 'database' = 'database'
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    
    if (type === 'api') {
      performanceMonitor.trackApiRequest(name, duration);
    } else {
      performanceMonitor.trackDatabaseQuery(name, duration);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    if (type === 'api') {
      performanceMonitor.trackApiRequest(name, duration, { error: true });
    } else {
      performanceMonitor.trackDatabaseQuery(name, duration, { error: true });
    }
    
    throw error;
  }
}
