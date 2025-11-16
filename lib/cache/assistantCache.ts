/**
 * Assistant Cache Service
 * 
 * Provides caching functionality for assistant data with:
 * - In-memory cache with TTL (Time To Live)
 * - Cache invalidation
 * - Cache statistics
 * - Automatic cleanup of expired entries
 * 
 * Requirements: 15.4
 */

import { Assistant } from '@/types/assistant';

// ============================================================================
// Types
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

// ============================================================================
// Assistant Cache Class
// ============================================================================

export class AssistantCache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl: number; // Time to live in milliseconds
  private hits = 0;
  private misses = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Create a new AssistantCache instance
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  constructor(ttl: number = 5 * 60 * 1000) {
    this.ttl = ttl;
    this.startCleanupInterval();
  }

  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param customTtl Optional custom TTL for this entry
   */
  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl ?? this.ttl;
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Check if key exists in cache and is not expired
   * @param key Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete entry from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Get or set data in cache
   * If data exists in cache, return it. Otherwise, fetch it using the provided function and cache it.
   * @param key Cache key
   * @param fetchFn Function to fetch data if not in cache
   * @param customTtl Optional custom TTL for this entry
   * @returns Cached or fetched data
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch data
    const data = await fetchFn();
    
    // Cache the result
    this.set(key, data, customTtl);
    
    return data;
  }

  /**
   * Start automatic cleanup of expired entries
   * Runs every minute
   */
  private startCleanupInterval(): void {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    // Find expired entries
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    // Delete expired entries
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });

    if (keysToDelete.length > 0) {
      console.log(`[AssistantCache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Stop cleanup interval
   * Should be called when cache is no longer needed
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultCacheInstance: AssistantCache | null = null;

/**
 * Get the default cache instance
 * @returns Default AssistantCache instance
 */
export function getDefaultCache(): AssistantCache {
  if (!defaultCacheInstance) {
    defaultCacheInstance = new AssistantCache();
  }
  return defaultCacheInstance;
}

/**
 * Create a new cache instance with custom TTL
 * @param ttl Time to live in milliseconds
 * @returns New AssistantCache instance
 */
export function createCache(ttl: number): AssistantCache {
  return new AssistantCache(ttl);
}

// ============================================================================
// Cache Key Versioning
// ============================================================================

/**
 * Cache version for invalidation
 * Increment this when you need to invalidate all caches
 */
const CACHE_VERSION = 1;

/**
 * Get the current cache version
 * @returns Current cache version
 */
export function getCacheVersion(): number {
  return CACHE_VERSION;
}

/**
 * Generate versioned cache key
 * @param key Base cache key
 * @returns Versioned cache key
 */
function versionedKey(key: string): string {
  return `v${CACHE_VERSION}:${key}`;
}

// ============================================================================
// Cache Key Generators
// ============================================================================

/**
 * Generate cache key for assistant list
 * @returns Cache key
 */
export function getAssistantListCacheKey(): string {
  return versionedKey('assistants:list');
}

/**
 * Generate cache key for assistant by ID
 * @param id Assistant ID
 * @returns Cache key
 */
export function getAssistantByIdCacheKey(id: string): string {
  return versionedKey(`assistants:id:${id}`);
}

/**
 * Generate cache key for assistants by category
 * @param category Category name
 * @returns Cache key
 */
export function getAssistantsByCategoryCacheKey(category: string): string {
  return versionedKey(`assistants:category:${category}`);
}

/**
 * Generate cache key for search results
 * @param query Search query
 * @returns Cache key
 */
export function getSearchResultsCacheKey(query: string): string {
  return versionedKey(`assistants:search:${query.toLowerCase()}`);
}

/**
 * Generate cache key for recommended assistants
 * @param limit Number of recommendations
 * @returns Cache key
 */
export function getRecommendedAssistantsCacheKey(limit: number): string {
  return versionedKey(`assistants:recommended:${limit}`);
}

/**
 * Generate cache key for assistant tags
 * @returns Cache key
 */
export function getAssistantTagsCacheKey(): string {
  return versionedKey('assistants:tags');
}

/**
 * Generate cache key for assistant categories
 * @returns Cache key
 */
export function getAssistantCategoriesCacheKey(): string {
  return versionedKey('assistants:categories');
}

// ============================================================================
// Export
// ============================================================================

export default AssistantCache;
