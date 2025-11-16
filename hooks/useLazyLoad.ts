/**
 * Lazy Load Hook
 * 
 * Provides lazy loading functionality using Intersection Observer API with:
 * - Automatic loading when element enters viewport
 * - Configurable threshold and root margin
 * - Loading state management
 * - Error handling
 * 
 * Requirements: 15.3
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface UseLazyLoadOptions {
  /**
   * Threshold for intersection (0-1)
   * 0 = as soon as any part is visible
   * 1 = entire element must be visible
   */
  threshold?: number;
  
  /**
   * Root margin (e.g., '100px' to load 100px before entering viewport)
   */
  rootMargin?: string;
  
  /**
   * Root element for intersection (default: viewport)
   */
  root?: Element | null;
  
  /**
   * Whether to trigger only once
   */
  triggerOnce?: boolean;
  
  /**
   * Callback when element enters viewport
   */
  onIntersect?: () => void;
}

export interface UseLazyLoadReturn {
  /**
   * Ref to attach to the element to observe
   */
  ref: React.RefObject<HTMLElement>;
  
  /**
   * Whether the element is in viewport
   */
  isIntersecting: boolean;
  
  /**
   * Whether the element has been loaded
   */
  hasLoaded: boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for lazy loading elements using Intersection Observer
 * 
 * @example
 * ```tsx
 * const { ref, isIntersecting, hasLoaded } = useLazyLoad({
 *   threshold: 0.1,
 *   rootMargin: '100px',
 *   triggerOnce: true,
 * });
 * 
 * return (
 *   <div ref={ref}>
 *     {hasLoaded && <ExpensiveComponent />}
 *   </div>
 * );
 * ```
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}): UseLazyLoadReturn {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    root = null,
    triggerOnce = true,
    onIntersect,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting) {
      setIsIntersecting(true);
      setHasLoaded(true);
      
      // Call callback if provided
      if (onIntersect) {
        onIntersect();
      }
    } else {
      setIsIntersecting(false);
    }
  }, [onIntersect]);

  useEffect(() => {
    const element = ref.current;
    
    if (!element) {
      return;
    }

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('[useLazyLoad] IntersectionObserver not supported, loading immediately');
      setIsIntersecting(true);
      setHasLoaded(true);
      return;
    }

    // If already loaded and triggerOnce is true, don't observe
    if (hasLoaded && triggerOnce) {
      return;
    }

    // Create observer
    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
      root,
    });

    // Start observing
    observer.observe(element);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, root, triggerOnce, hasLoaded, handleIntersect]);

  return {
    ref,
    isIntersecting,
    hasLoaded,
  };
}

// ============================================================================
// Image Lazy Load Hook
// ============================================================================

export interface UseImageLazyLoadOptions extends UseLazyLoadOptions {
  /**
   * Image source URL
   */
  src: string;
  
  /**
   * Placeholder image URL
   */
  placeholder?: string;
}

export interface UseImageLazyLoadReturn extends UseLazyLoadReturn {
  /**
   * Current image source (placeholder or actual)
   */
  currentSrc: string;
  
  /**
   * Whether the image is loading
   */
  isLoading: boolean;
  
  /**
   * Whether the image has loaded successfully
   */
  isLoaded: boolean;
  
  /**
   * Error if image failed to load
   */
  error: Error | null;
}

/**
 * Hook for lazy loading images
 * 
 * @example
 * ```tsx
 * const { ref, currentSrc, isLoading, isLoaded, error } = useImageLazyLoad({
 *   src: '/image.jpg',
 *   placeholder: '/placeholder.jpg',
 *   threshold: 0.1,
 *   rootMargin: '100px',
 * });
 * 
 * return (
 *   <img
 *     ref={ref}
 *     src={currentSrc}
 *     alt="Lazy loaded image"
 *     style={{ opacity: isLoaded ? 1 : 0.5 }}
 *   />
 * );
 * ```
 */
export function useImageLazyLoad(options: UseImageLazyLoadOptions): UseImageLazyLoadReturn {
  const { src, placeholder = '', ...lazyLoadOptions } = options;
  
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { ref, isIntersecting, hasLoaded } = useLazyLoad(lazyLoadOptions);

  useEffect(() => {
    if (!hasLoaded || isLoaded) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create image element to preload
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      const err = new Error(`Failed to load image: ${src}`);
      setError(err);
      setIsLoading(false);
      console.error('[useImageLazyLoad]', err);
    };
    
    img.src = src;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [hasLoaded, isLoaded, src]);

  return {
    ref,
    isIntersecting,
    hasLoaded,
    currentSrc,
    isLoading,
    isLoaded,
    error,
  };
}

// ============================================================================
// Component Lazy Load Hook
// ============================================================================

export interface UseComponentLazyLoadOptions extends UseLazyLoadOptions {
  /**
   * Delay before loading component (in milliseconds)
   */
  delay?: number;
}

export interface UseComponentLazyLoadReturn extends UseLazyLoadReturn {
  /**
   * Whether to render the component
   */
  shouldRender: boolean;
}

/**
 * Hook for lazy loading components
 * 
 * @example
 * ```tsx
 * const { ref, shouldRender } = useComponentLazyLoad({
 *   threshold: 0.1,
 *   rootMargin: '100px',
 *   delay: 100,
 * });
 * 
 * return (
 *   <div ref={ref}>
 *     {shouldRender && <ExpensiveComponent />}
 *   </div>
 * );
 * ```
 */
export function useComponentLazyLoad(
  options: UseComponentLazyLoadOptions = {}
): UseComponentLazyLoadReturn {
  const { delay = 0, ...lazyLoadOptions } = options;
  
  const [shouldRender, setShouldRender] = useState(false);
  const { ref, isIntersecting, hasLoaded } = useLazyLoad(lazyLoadOptions);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [hasLoaded, delay]);

  return {
    ref,
    isIntersecting,
    hasLoaded,
    shouldRender,
  };
}

// ============================================================================
// Export
// ============================================================================

export default useLazyLoad;
