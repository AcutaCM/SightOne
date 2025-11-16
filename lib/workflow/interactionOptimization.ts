/**
 * Interaction Optimization Utilities
 * 
 * Provides debounce and throttle utilities for optimizing user interactions:
 * - Search input debouncing (300ms)
 * - Canvas zoom throttling (16ms)
 * - Window resize throttling (100ms)
 * 
 * Task 10.3: Interaction Optimization
 * Requirements: 8.3
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce function
 * Delays execution until after wait milliseconds have elapsed since the last call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle function
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * React hook for debounced value
 * Returns a debounced version of the input value
 * 
 * @example
 * const debouncedSearch = useDebouncedValue(searchQuery, 300);
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook for debounced callback
 * Returns a debounced version of the callback function
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback(handleSearch, 300);
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * React hook for throttled callback
 * Returns a throttled version of the callback function
 * 
 * @example
 * const throttledZoom = useThrottledCallback(handleZoom, 16);
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const lastRun = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= limit) {
        callbackRef.current(...args);
        lastRun.current = now;
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRun.current = Date.now();
        }, limit - timeSinceLastRun);
      }
    },
    [limit]
  );
}

/**
 * React hook for search input optimization
 * Combines debouncing with loading state management
 * 
 * @example
 * const { value, debouncedValue, isDebouncing, setValue } = useSearchInput('', 300);
 */
export function useSearchInput(
  initialValue: string = '',
  delay: number = 300
): {
  value: string;
  debouncedValue: string;
  isDebouncing: boolean;
  setValue: (value: string) => void;
  clear: () => void;
} {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(value, delay);
  const isDebouncing = value !== debouncedValue;

  const clear = useCallback(() => {
    setValue('');
  }, []);

  return {
    value,
    debouncedValue,
    isDebouncing,
    setValue,
    clear,
  };
}

/**
 * React hook for canvas zoom optimization
 * Throttles zoom events to maintain 60fps
 * 
 * @example
 * const handleZoom = useCanvasZoomOptimization((zoom) => {
 *   setZoomLevel(zoom);
 * });
 */
export function useCanvasZoomOptimization(
  onZoom: (zoom: number) => void
): (zoom: number) => void {
  return useThrottledCallback(onZoom, 16); // ~60fps
}

/**
 * React hook for window resize optimization
 * Throttles resize events to prevent excessive re-renders
 * 
 * @example
 * const { width, height } = useWindowResize();
 */
export function useWindowResize(throttleMs: number = 100): {
  width: number;
  height: number;
} {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = throttle(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, throttleMs);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [throttleMs]);

  return size;
}

/**
 * React hook for scroll optimization
 * Throttles scroll events to improve performance
 * 
 * @example
 * const { scrollY, isScrolling } = useScrollOptimization(element, 16);
 */
export function useScrollOptimization(
  element: HTMLElement | null,
  throttleMs: number = 16
): {
  scrollY: number;
  scrollX: number;
  isScrolling: boolean;
} {
  const [scroll, setScroll] = useState({
    scrollY: 0,
    scrollX: 0,
    isScrolling: false,
  });

  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!element) {
      return;
    }

    const handleScroll = throttle(() => {
      setScroll({
        scrollY: element.scrollTop,
        scrollX: element.scrollLeft,
        isScrolling: true,
      });

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set isScrolling to false after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setScroll(prev => ({
          ...prev,
          isScrolling: false,
        }));
      }, 150);
    }, throttleMs);

    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [element, throttleMs]);

  return scroll;
}

/**
 * React hook for input optimization
 * Combines debouncing with validation
 * 
 * @example
 * const { value, debouncedValue, isValid, error, setValue } = useOptimizedInput(
 *   '',
 *   300,
 *   (val) => val.length >= 3
 * );
 */
export function useOptimizedInput<T>(
  initialValue: T,
  delay: number,
  validator?: (value: T) => boolean | string
): {
  value: T;
  debouncedValue: T;
  isDebouncing: boolean;
  isValid: boolean;
  error: string | null;
  setValue: (value: T) => void;
  clear: () => void;
} {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebouncedValue(value, delay);
  const isDebouncing = value !== debouncedValue;

  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (validator) {
      const result = validator(debouncedValue);
      if (typeof result === 'boolean') {
        setIsValid(result);
        setError(result ? null : 'Invalid input');
      } else if (typeof result === 'string') {
        setIsValid(false);
        setError(result);
      } else {
        setIsValid(true);
        setError(null);
      }
    }
  }, [debouncedValue, validator]);

  const clear = useCallback(() => {
    setValue(initialValue);
    setIsValid(true);
    setError(null);
  }, [initialValue]);

  return {
    value,
    debouncedValue,
    isDebouncing,
    isValid,
    error,
    setValue,
    clear,
  };
}

/**
 * Performance metrics for interaction optimization
 */
export interface InteractionMetrics {
  totalInteractions: number;
  debouncedInteractions: number;
  throttledInteractions: number;
  savedExecutions: number;
  savingsPercentage: number;
}

/**
 * React hook for tracking interaction optimization metrics
 */
export function useInteractionMetrics(): {
  metrics: InteractionMetrics;
  recordDebounce: () => void;
  recordThrottle: () => void;
  recordInteraction: () => void;
  reset: () => void;
} {
  const [metrics, setMetrics] = useState<InteractionMetrics>({
    totalInteractions: 0,
    debouncedInteractions: 0,
    throttledInteractions: 0,
    savedExecutions: 0,
    savingsPercentage: 0,
  });

  const recordInteraction = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
    }));
  }, []);

  const recordDebounce = useCallback(() => {
    setMetrics(prev => {
      const debouncedInteractions = prev.debouncedInteractions + 1;
      const savedExecutions = prev.totalInteractions - debouncedInteractions;
      const savingsPercentage =
        prev.totalInteractions > 0
          ? (savedExecutions / prev.totalInteractions) * 100
          : 0;

      return {
        ...prev,
        debouncedInteractions,
        savedExecutions,
        savingsPercentage,
      };
    });
  }, []);

  const recordThrottle = useCallback(() => {
    setMetrics(prev => {
      const throttledInteractions = prev.throttledInteractions + 1;
      const savedExecutions = prev.totalInteractions - throttledInteractions;
      const savingsPercentage =
        prev.totalInteractions > 0
          ? (savedExecutions / prev.totalInteractions) * 100
          : 0;

      return {
        ...prev,
        throttledInteractions,
        savedExecutions,
        savingsPercentage,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setMetrics({
      totalInteractions: 0,
      debouncedInteractions: 0,
      throttledInteractions: 0,
      savedExecutions: 0,
      savingsPercentage: 0,
    });
  }, []);

  return {
    metrics,
    recordDebounce,
    recordThrottle,
    recordInteraction,
    reset,
  };
}
