/**
 * Performance Optimization Utilities
 * 
 * Provides debouncing, throttling, and lazy loading utilities
 * for optimizing the assistant settings sidebar performance
 * 
 * Requirements: 4.1
 */

/**
 * Debounce function - delays execution until after wait time has elapsed
 * since the last call. Perfect for validation and search.
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds (default: 300ms for validation)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once per interval
 * Perfect for draft saves and scroll events.
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds (default: 30000ms for draft saves)
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 30000
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };
}

/**
 * Lazy load component wrapper
 * Delays component loading until it's needed
 * 
 * @param importFunc - Dynamic import function
 * @returns Lazy loaded component
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

/**
 * Measure performance of a function
 * Useful for identifying bottlenecks
 * 
 * @param name - Name of the operation
 * @param func - Function to measure
 * @returns Result of the function
 */
export async function measurePerformance<T>(
  name: string,
  func: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await func();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    
    // Warn if operation takes too long
    if (duration > 100) {
      console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms (> 100ms threshold)`);
    }
    
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Request Animation Frame wrapper for smooth animations
 * Ensures updates happen at optimal times
 * 
 * @param callback - Function to execute
 */
export function requestAnimationFramePolyfill(callback: () => void): void {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    window.requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 16); // ~60fps fallback
  }
}

/**
 * Batch multiple state updates into a single render
 * Reduces unnecessary re-renders
 * 
 * @param updates - Array of update functions
 */
export function batchUpdates(updates: Array<() => void>): void {
  requestAnimationFramePolyfill(() => {
    updates.forEach(update => update());
  });
}

/**
 * Memoization helper for expensive computations
 * Caches results based on input parameters
 * 
 * @param func - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
}

/**
 * Performance monitoring class
 * Tracks and reports performance metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Record a metric
   */
  record(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  /**
   * Get average for a metric
   */
  getAverage(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  /**
   * Get all metrics summary
   */
  getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, any> = {};
    
    this.metrics.forEach((values, name) => {
      summary[name] = {
        avg: this.getAverage(name),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    });
    
    return summary;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Log summary to console
   */
  logSummary(): void {
    const summary = this.getSummary();
    console.table(summary);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React import for lazy loading
import React from 'react';
