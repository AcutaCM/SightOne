/**
 * Response Time Optimization Utilities
 * 
 * Ensures interface operations respond within 100ms:
 * - Loading state indicators
 * - Optimized workflow loading
 * - Response time monitoring
 * 
 * Task 10.5: Response Time Optimization
 * Requirements: 8.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';

/**
 * Response time thresholds (in milliseconds)
 */
export const RESPONSE_TIME_THRESHOLDS = {
  INSTANT: 50, // Feels instant
  FAST: 100, // Acceptable for most interactions
  MODERATE: 300, // Noticeable but acceptable
  SLOW: 1000, // Feels slow
  VERY_SLOW: 3000, // Unacceptable
} as const;

/**
 * Loading state with automatic timeout
 */
export function useLoadingState(
  initialState: boolean = false,
  timeout: number = RESPONSE_TIME_THRESHOLDS.FAST
): {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
} {
  const [isLoading, setIsLoading] = useState(initialState);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startLoading = useCallback(() => {
    setIsLoading(true);

    // Auto-stop loading after timeout to prevent stuck states
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, timeout);
  }, [timeout]);

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      startLoading();
      try {
        const result = await fn();
        stopLoading();
        return result;
      } catch (error) {
        stopLoading();
        throw error;
      }
    },
    [startLoading, stopLoading]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

/**
 * Optimized workflow loading with chunking
 * Loads large workflows in chunks to maintain responsiveness
 */
export function useOptimizedWorkflowLoading(): {
  loadWorkflow: (
    nodes: Node[],
    edges: Edge[],
    chunkSize?: number
  ) => Promise<{ nodes: Node[]; edges: Edge[] }>;
  isLoading: boolean;
  progress: number;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadWorkflow = useCallback(
    async (
      nodes: Node[],
      edges: Edge[],
      chunkSize: number = 50
    ): Promise<{ nodes: Node[]; edges: Edge[] }> => {
      setIsLoading(true);
      setProgress(0);

      // If workflow is small, load immediately
      if (nodes.length <= chunkSize) {
        setProgress(100);
        setIsLoading(false);
        return { nodes, edges };
      }

      // Load in chunks for large workflows
      const loadedNodes: Node[] = [];
      const totalChunks = Math.ceil(nodes.length / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, nodes.length);
        const chunk = nodes.slice(start, end);

        // Add chunk
        loadedNodes.push(...chunk);

        // Update progress
        const currentProgress = ((i + 1) / totalChunks) * 100;
        setProgress(currentProgress);

        // Yield to browser to maintain responsiveness
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setProgress(100);
      setIsLoading(false);

      return { nodes: loadedNodes, edges };
    },
    []
  );

  return {
    loadWorkflow,
    isLoading,
    progress,
  };
}

/**
 * Response time monitor
 * Tracks and reports operation response times
 */
export interface ResponseTimeMetrics {
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  threshold: number;
  isWithinThreshold: boolean;
}

export function useResponseTimeMonitor(): {
  startOperation: (name: string, threshold?: number) => void;
  endOperation: (name: string) => ResponseTimeMetrics | null;
  getMetrics: () => ResponseTimeMetrics[];
  clearMetrics: () => void;
} {
  const operationsRef = useRef<Map<string, { startTime: number; threshold: number }>>(
    new Map()
  );
  const metricsRef = useRef<ResponseTimeMetrics[]>([]);

  const startOperation = useCallback(
    (name: string, threshold: number = RESPONSE_TIME_THRESHOLDS.FAST) => {
      operationsRef.current.set(name, {
        startTime: performance.now(),
        threshold,
      });
    },
    []
  );

  const endOperation = useCallback((name: string): ResponseTimeMetrics | null => {
    const operation = operationsRef.current.get(name);
    if (!operation) {
      console.warn(`Operation "${name}" was not started`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - operation.startTime;
    const isWithinThreshold = duration <= operation.threshold;

    const metrics: ResponseTimeMetrics = {
      operationName: name,
      startTime: operation.startTime,
      endTime,
      duration,
      threshold: operation.threshold,
      isWithinThreshold,
    };

    metricsRef.current.push(metrics);
    operationsRef.current.delete(name);

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && !isWithinThreshold) {
      console.warn(
        `[Performance] Operation "${name}" took ${duration.toFixed(2)}ms (threshold: ${operation.threshold}ms)`
      );
    }

    return metrics;
  }, []);

  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
    operationsRef.current.clear();
  }, []);

  return {
    startOperation,
    endOperation,
    getMetrics,
    clearMetrics,
  };
}

/**
 * Optimized async operation with timeout
 * Ensures operations complete within specified time or show loading indicator
 */
export function useOptimizedAsyncOperation<T>(): {
  execute: (
    operation: () => Promise<T>,
    options?: {
      timeout?: number;
      showLoadingAfter?: number;
      onTimeout?: () => void;
    }
  ) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const operationTimeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      options: {
        timeout?: number;
        showLoadingAfter?: number;
        onTimeout?: () => void;
      } = {}
    ): Promise<T> => {
      const {
        timeout = RESPONSE_TIME_THRESHOLDS.VERY_SLOW,
        showLoadingAfter = RESPONSE_TIME_THRESHOLDS.FAST,
        onTimeout,
      } = options;

      setError(null);

      // Show loading indicator after delay
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(true);
      }, showLoadingAfter);

      // Set operation timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        operationTimeoutRef.current = setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`));
          if (onTimeout) {
            onTimeout();
          }
        }, timeout);
      });

      try {
        // Race between operation and timeout
        const result = await Promise.race([operation(), timeoutPromise]);

        // Clear timeouts
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        if (operationTimeoutRef.current) {
          clearTimeout(operationTimeoutRef.current);
        }

        setIsLoading(false);
        return result;
      } catch (err) {
        // Clear timeouts
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        if (operationTimeoutRef.current) {
          clearTimeout(operationTimeoutRef.current);
        }

        setIsLoading(false);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (operationTimeoutRef.current) {
        clearTimeout(operationTimeoutRef.current);
      }
    };
  }, []);

  return {
    execute,
    isLoading,
    error,
  };
}

/**
 * Progressive loading indicator
 * Shows different loading states based on elapsed time
 */
export function useProgressiveLoadingIndicator(): {
  startLoading: () => void;
  stopLoading: () => void;
  loadingState: 'none' | 'fast' | 'moderate' | 'slow';
  elapsedTime: number;
} {
  const [loadingState, setLoadingState] = useState<'none' | 'fast' | 'moderate' | 'slow'>(
    'none'
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const startLoading = useCallback(() => {
    startTimeRef.current = Date.now();
    setLoadingState('fast');
    setElapsedTime(0);

    // Update elapsed time
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setElapsedTime(elapsed);
    }, 100);

    // Transition to moderate after 300ms
    const moderateTimeout = setTimeout(() => {
      setLoadingState('moderate');
    }, RESPONSE_TIME_THRESHOLDS.MODERATE);
    timeoutsRef.current.push(moderateTimeout);

    // Transition to slow after 1000ms
    const slowTimeout = setTimeout(() => {
      setLoadingState('slow');
    }, RESPONSE_TIME_THRESHOLDS.SLOW);
    timeoutsRef.current.push(slowTimeout);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState('none');
    setElapsedTime(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return {
    startLoading,
    stopLoading,
    loadingState,
    elapsedTime,
  };
}

/**
 * Batch operation processor
 * Processes operations in batches to maintain responsiveness
 */
export function useBatchProcessor<T, R>(): {
  processBatch: (
    items: T[],
    processor: (item: T) => Promise<R>,
    options?: {
      batchSize?: number;
      delayBetweenBatches?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ) => Promise<R[]>;
  isProcessing: boolean;
  progress: number;
} {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processBatch = useCallback(
    async (
      items: T[],
      processor: (item: T) => Promise<R>,
      options: {
        batchSize?: number;
        delayBetweenBatches?: number;
        onProgress?: (processed: number, total: number) => void;
      } = {}
    ): Promise<R[]> => {
      const { batchSize = 10, delayBetweenBatches = 0, onProgress } = options;

      setIsProcessing(true);
      setProgress(0);

      const results: R[] = [];
      const totalBatches = Math.ceil(items.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, items.length);
        const batch = items.slice(start, end);

        // Process batch in parallel
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);

        // Update progress
        const currentProgress = ((i + 1) / totalBatches) * 100;
        setProgress(currentProgress);

        if (onProgress) {
          onProgress(results.length, items.length);
        }

        // Delay between batches to maintain responsiveness
        if (i < totalBatches - 1 && delayBetweenBatches > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
        }
      }

      setIsProcessing(false);
      setProgress(100);

      return results;
    },
    []
  );

  return {
    processBatch,
    isProcessing,
    progress,
  };
}

/**
 * Performance budget monitor
 * Warns when operations exceed performance budgets
 */
export interface PerformanceBudget {
  operationName: string;
  budget: number; // in milliseconds
  actual: number;
  exceeded: boolean;
  overagePercentage: number;
}

export function usePerformanceBudget(): {
  checkBudget: (operationName: string, duration: number, budget: number) => PerformanceBudget;
  getBudgetViolations: () => PerformanceBudget[];
  clearViolations: () => void;
} {
  const violationsRef = useRef<PerformanceBudget[]>([]);

  const checkBudget = useCallback(
    (operationName: string, duration: number, budget: number): PerformanceBudget => {
      const exceeded = duration > budget;
      const overagePercentage = exceeded ? ((duration - budget) / budget) * 100 : 0;

      const budgetCheck: PerformanceBudget = {
        operationName,
        budget,
        actual: duration,
        exceeded,
        overagePercentage,
      };

      if (exceeded) {
        violationsRef.current.push(budgetCheck);

        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[Performance Budget] "${operationName}" exceeded budget by ${overagePercentage.toFixed(1)}% (${duration.toFixed(2)}ms / ${budget}ms)`
          );
        }
      }

      return budgetCheck;
    },
    []
  );

  const getBudgetViolations = useCallback(() => {
    return [...violationsRef.current];
  }, []);

  const clearViolations = useCallback(() => {
    violationsRef.current = [];
  }, []);

  return {
    checkBudget,
    getBudgetViolations,
    clearViolations,
  };
}
