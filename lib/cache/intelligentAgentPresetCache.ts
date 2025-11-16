/**
 * Intelligent Agent Preset Cache Service
 * 
 * Specialized caching layer for the intelligent agent preset assistant.
 * Uses IndexedDB for persistent client-side caching with automatic expiration.
 */

import { Assistant } from '@/types/assistant';
import { INTELLIGENT_AGENT_ID } from '@/lib/constants/intelligentAgentPreset';
import { logger } from '@/lib/logger/logger';

const DB_NAME = 'IntelligentAgentPresetDB';
const DB_VERSION = 1;
const STORE_NAME = 'preset';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedPreset extends Assistant {
  cachedAt: number;
  lastChecked: number;
}

/**
 * Cache service for intelligent agent preset
 * Provides fast access to preset data with automatic expiration and update checking
 */
export class IntelligentAgentPresetCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.db) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.initPromise = null;
        logger.error('Failed to open IndexedDB for preset cache', { error: request.error }, 'IntelligentAgentPresetCache');
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        logger.info('IndexedDB initialized for preset cache', {}, 'IntelligentAgentPresetCache');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
          store.createIndex('lastChecked', 'lastChecked', { unique: false });
          logger.info('Created preset cache object store', {}, 'IntelligentAgentPresetCache');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get the cached preset
   * Returns null if not found or expired
   */
  async get(): Promise<Assistant | null> {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(INTELLIGENT_AGENT_ID);

        request.onsuccess = () => {
          const item = request.result as CachedPreset | undefined;
          
          if (!item) {
            logger.info('Preset not found in cache', {}, 'IntelligentAgentPresetCache');
            resolve(null);
            return;
          }

          // Check if cache is expired
          const now = Date.now();
          if (now - item.cachedAt >= CACHE_TTL) {
            logger.info('Preset cache expired', { 
              cachedAt: new Date(item.cachedAt).toISOString(),
              age: now - item.cachedAt 
            }, 'IntelligentAgentPresetCache');
            
            // Clean up expired cache asynchronously
            this.delete().catch(err => 
              logger.warn('Failed to clean up expired cache', { error: err }, 'IntelligentAgentPresetCache')
            );
            resolve(null);
            return;
          }

          logger.info('Preset loaded from cache', { 
            cachedAt: new Date(item.cachedAt).toISOString(),
            age: now - item.cachedAt 
          }, 'IntelligentAgentPresetCache');

          // Remove cache metadata before returning
          const { cachedAt, lastChecked, ...assistant } = item;
          resolve(assistant);
        };

        request.onerror = () => {
          logger.error('Failed to get preset from cache', { error: request.error }, 'IntelligentAgentPresetCache');
          reject(new Error(`Failed to get preset: ${request.error?.message}`));
        };
      });
    } catch (error) {
      logger.error('Error getting preset from cache', { error }, 'IntelligentAgentPresetCache');
      return null;
    }
  }

  /**
   * Store the preset in cache
   */
  async set(assistant: Assistant): Promise<void> {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const now = Date.now();
        const item: CachedPreset = { 
          ...assistant, 
          cachedAt: now,
          lastChecked: now
        };
        const request = store.put(item);

        request.onsuccess = () => {
          logger.info('Preset cached successfully', { 
            id: assistant.id,
            cachedAt: new Date(now).toISOString()
          }, 'IntelligentAgentPresetCache');
          resolve();
        };

        request.onerror = () => {
          logger.error('Failed to cache preset', { 
            id: assistant.id, 
            error: request.error 
          }, 'IntelligentAgentPresetCache');
          reject(new Error(`Failed to cache preset: ${request.error?.message}`));
        };
      });
    } catch (error) {
      logger.error('Error caching preset', { error }, 'IntelligentAgentPresetCache');
      throw error;
    }
  }

  /**
   * Update the last checked timestamp
   * Used to track when we last verified the preset with the server
   */
  async updateLastChecked(): Promise<void> {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(INTELLIGENT_AGENT_ID);

        getRequest.onsuccess = () => {
          const item = getRequest.result as CachedPreset | undefined;
          
          if (!item) {
            resolve();
            return;
          }

          item.lastChecked = Date.now();
          const putRequest = store.put(item);

          putRequest.onsuccess = () => {
            logger.info('Updated last checked timestamp', { 
              lastChecked: new Date(item.lastChecked).toISOString()
            }, 'IntelligentAgentPresetCache');
            resolve();
          };

          putRequest.onerror = () => {
            logger.error('Failed to update last checked', { error: putRequest.error }, 'IntelligentAgentPresetCache');
            reject(new Error(`Failed to update last checked: ${putRequest.error?.message}`));
          };
        };

        getRequest.onerror = () => {
          logger.error('Failed to get preset for update', { error: getRequest.error }, 'IntelligentAgentPresetCache');
          reject(new Error(`Failed to get preset: ${getRequest.error?.message}`));
        };
      });
    } catch (error) {
      logger.error('Error updating last checked', { error }, 'IntelligentAgentPresetCache');
    }
  }

  /**
   * Check if we should verify the preset with the server
   * Returns true if more than 24 hours have passed since last check
   */
  async shouldCheckForUpdates(): Promise<boolean> {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(INTELLIGENT_AGENT_ID);

        request.onsuccess = () => {
          const item = request.result as CachedPreset | undefined;
          
          if (!item) {
            resolve(true); // No cache, should check
            return;
          }

          const now = Date.now();
          const shouldCheck = now - item.lastChecked >= CACHE_TTL;
          
          logger.info('Checked if update verification needed', { 
            shouldCheck,
            lastChecked: new Date(item.lastChecked).toISOString(),
            timeSinceCheck: now - item.lastChecked
          }, 'IntelligentAgentPresetCache');

          resolve(shouldCheck);
        };

        request.onerror = () => {
          logger.error('Failed to check update status', { error: request.error }, 'IntelligentAgentPresetCache');
          resolve(true); // On error, assume we should check
        };
      });
    } catch (error) {
      logger.error('Error checking update status', { error }, 'IntelligentAgentPresetCache');
      return true; // On error, assume we should check
    }
  }

  /**
   * Delete the cached preset
   */
  async delete(): Promise<void> {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(INTELLIGENT_AGENT_ID);

        request.onsuccess = () => {
          logger.info('Preset cache cleared', {}, 'IntelligentAgentPresetCache');
          resolve();
        };

        request.onerror = () => {
          logger.error('Failed to clear preset cache', { error: request.error }, 'IntelligentAgentPresetCache');
          reject(new Error(`Failed to clear cache: ${request.error?.message}`));
        };
      });
    } catch (error) {
      logger.error('Error clearing preset cache', { error }, 'IntelligentAgentPresetCache');
      throw error;
    }
  }

  /**
   * Clear all cache data
   */
  async clear(): Promise<void> {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          logger.info('All preset cache cleared', {}, 'IntelligentAgentPresetCache');
          resolve();
        };

        request.onerror = () => {
          logger.error('Failed to clear all cache', { error: request.error }, 'IntelligentAgentPresetCache');
          reject(new Error(`Failed to clear all cache: ${request.error?.message}`));
        };
      });
    } catch (error) {
      logger.error('Error clearing all cache', { error }, 'IntelligentAgentPresetCache');
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      logger.info('Preset cache database closed', {}, 'IntelligentAgentPresetCache');
    }
  }
}

// Export singleton instance
export const intelligentAgentPresetCache = new IntelligentAgentPresetCache();
