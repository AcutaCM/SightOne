/**
 * Animation Optimization Utilities
 * 
 * Provides optimized animation utilities:
 * - CSS transform-based animations
 * - will-change hints for browser optimization
 * - requestAnimationFrame for smooth animations
 * 
 * Task 10.4: Animation Optimization
 * Requirements: 8.4
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Animation frame callback type
 */
type AnimationCallback = (progress: number, elapsed: number) => void;

/**
 * Easing functions for smooth animations
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
};

/**
 * React hook for requestAnimationFrame-based animations
 * 
 * @example
 * const animate = useAnimationFrame((progress) => {
 *   setPosition(progress * 100);
 * }, 1000);
 * 
 * // Start animation
 * animate();
 */
export function useAnimationFrame(
  callback: AnimationCallback,
  duration: number,
  easing: keyof typeof easingFunctions = 'easeOutCubic'
): () => void {
  const callbackRef = useRef(callback);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return useCallback(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](progress);

      callbackRef.current(easedProgress, elapsed);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  }, [duration, easing]);
}

/**
 * Transform-based position animation
 * Uses CSS transform instead of position for better performance
 */
export interface TransformPosition {
  x: number;
  y: number;
}

/**
 * React hook for transform-based position animation
 * 
 * @example
 * const { position, animateTo } = useTransformAnimation({ x: 0, y: 0 });
 * 
 * // Animate to new position
 * animateTo({ x: 100, y: 50 }, 300);
 */
export function useTransformAnimation(
  initialPosition: TransformPosition,
  easing: keyof typeof easingFunctions = 'easeOutCubic'
): {
  position: TransformPosition;
  animateTo: (target: TransformPosition, duration: number) => void;
  isAnimating: boolean;
} {
  const [position, setPosition] = useState(initialPosition);
  const [isAnimating, setIsAnimating] = useState(false);
  const startPositionRef = useRef(initialPosition);
  const targetPositionRef = useRef(initialPosition);

  const animate = useAnimationFrame(
    (progress) => {
      const start = startPositionRef.current;
      const target = targetPositionRef.current;

      setPosition({
        x: start.x + (target.x - start.x) * progress,
        y: start.y + (target.y - start.y) * progress,
      });

      if (progress >= 1) {
        setIsAnimating(false);
      }
    },
    300,
    easing
  );

  const animateTo = useCallback(
    (target: TransformPosition, duration: number) => {
      startPositionRef.current = position;
      targetPositionRef.current = target;
      setIsAnimating(true);
      animate();
    },
    [position, animate]
  );

  return {
    position,
    animateTo,
    isAnimating,
  };
}

/**
 * will-change CSS property manager
 * Automatically adds and removes will-change hints
 */
export function useWillChange(
  elementRef: React.RefObject<HTMLElement>,
  properties: string[],
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled || !elementRef.current) {
      return;
    }

    const element = elementRef.current;
    const willChangeValue = properties.join(', ');

    // Add will-change hint
    element.style.willChange = willChangeValue;

    // Remove will-change after animation completes
    return () => {
      element.style.willChange = 'auto';
    };
  }, [elementRef, properties, enabled]);
}

/**
 * Optimized scroll animation
 * Uses requestAnimationFrame for smooth scrolling
 */
export function useScrollAnimation(
  elementRef: React.RefObject<HTMLElement>
): {
  scrollTo: (target: number, duration: number) => void;
  isScrolling: boolean;
} {
  const [isScrolling, setIsScrolling] = useState(false);
  const startScrollRef = useRef(0);
  const targetScrollRef = useRef(0);

  const animate = useAnimationFrame(
    (progress) => {
      if (!elementRef.current) return;

      const start = startScrollRef.current;
      const target = targetScrollRef.current;
      const scrollTop = start + (target - start) * progress;

      elementRef.current.scrollTop = scrollTop;

      if (progress >= 1) {
        setIsScrolling(false);
      }
    },
    300,
    'easeOutCubic'
  );

  const scrollTo = useCallback(
    (target: number, duration: number) => {
      if (!elementRef.current) return;

      startScrollRef.current = elementRef.current.scrollTop;
      targetScrollRef.current = target;
      setIsScrolling(true);
      animate();
    },
    [elementRef, animate]
  );

  return {
    scrollTo,
    isScrolling,
  };
}

/**
 * Optimized fade animation
 * Uses opacity and transform for smooth fading
 */
export function useFadeAnimation(
  initialOpacity: number = 0
): {
  opacity: number;
  fadeIn: (duration: number) => void;
  fadeOut: (duration: number) => void;
  isAnimating: boolean;
} {
  const [opacity, setOpacity] = useState(initialOpacity);
  const [isAnimating, setIsAnimating] = useState(false);
  const startOpacityRef = useRef(initialOpacity);
  const targetOpacityRef = useRef(initialOpacity);

  const animate = useAnimationFrame(
    (progress) => {
      const start = startOpacityRef.current;
      const target = targetOpacityRef.current;
      const newOpacity = start + (target - start) * progress;

      setOpacity(newOpacity);

      if (progress >= 1) {
        setIsAnimating(false);
      }
    },
    300,
    'easeOutCubic'
  );

  const fadeIn = useCallback(
    (duration: number) => {
      startOpacityRef.current = opacity;
      targetOpacityRef.current = 1;
      setIsAnimating(true);
      animate();
    },
    [opacity, animate]
  );

  const fadeOut = useCallback(
    (duration: number) => {
      startOpacityRef.current = opacity;
      targetOpacityRef.current = 0;
      setIsAnimating(true);
      animate();
    },
    [opacity, animate]
  );

  return {
    opacity,
    fadeIn,
    fadeOut,
    isAnimating,
  };
}

/**
 * Optimized scale animation
 * Uses CSS transform scale for better performance
 */
export function useScaleAnimation(
  initialScale: number = 1
): {
  scale: number;
  scaleTo: (target: number, duration: number) => void;
  isAnimating: boolean;
} {
  const [scale, setScale] = useState(initialScale);
  const [isAnimating, setIsAnimating] = useState(false);
  const startScaleRef = useRef(initialScale);
  const targetScaleRef = useRef(initialScale);

  const animate = useAnimationFrame(
    (progress) => {
      const start = startScaleRef.current;
      const target = targetScaleRef.current;
      const newScale = start + (target - start) * progress;

      setScale(newScale);

      if (progress >= 1) {
        setIsAnimating(false);
      }
    },
    300,
    'easeOutCubic'
  );

  const scaleTo = useCallback(
    (target: number, duration: number) => {
      startScaleRef.current = scale;
      targetScaleRef.current = target;
      setIsAnimating(true);
      animate();
    },
    [scale, animate]
  );

  return {
    scale,
    scaleTo,
    isAnimating,
  };
}

/**
 * Performance-optimized CSS class toggler
 * Batches class changes to minimize reflows
 */
export function useBatchedClassToggle(
  elementRef: React.RefObject<HTMLElement>
): {
  addClass: (className: string) => void;
  removeClass: (className: string) => void;
  toggleClass: (className: string) => void;
  flush: () => void;
} {
  const pendingAdditions = useRef<Set<string>>(new Set());
  const pendingRemovals = useRef<Set<string>>(new Set());
  const rafIdRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    // Apply all pending changes in one batch
    pendingRemovals.current.forEach((className) => {
      element.classList.remove(className);
    });

    pendingAdditions.current.forEach((className) => {
      element.classList.add(className);
    });

    // Clear pending changes
    pendingAdditions.current.clear();
    pendingRemovals.current.clear();
    rafIdRef.current = null;
  }, [elementRef]);

  const scheduleFlush = useCallback(() => {
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(flush);
    }
  }, [flush]);

  const addClass = useCallback(
    (className: string) => {
      pendingAdditions.current.add(className);
      pendingRemovals.current.delete(className);
      scheduleFlush();
    },
    [scheduleFlush]
  );

  const removeClass = useCallback(
    (className: string) => {
      pendingRemovals.current.add(className);
      pendingAdditions.current.delete(className);
      scheduleFlush();
    },
    [scheduleFlush]
  );

  const toggleClass = useCallback(
    (className: string) => {
      if (!elementRef.current) return;

      if (elementRef.current.classList.contains(className)) {
        removeClass(className);
      } else {
        addClass(className);
      }
    },
    [elementRef, addClass, removeClass]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    addClass,
    removeClass,
    toggleClass,
    flush,
  };
}

/**
 * Animation performance metrics
 */
export interface AnimationMetrics {
  frameCount: number;
  averageFPS: number;
  droppedFrames: number;
  totalDuration: number;
}

/**
 * React hook for tracking animation performance
 */
export function useAnimationMetrics(): {
  metrics: AnimationMetrics;
  startTracking: () => void;
  stopTracking: () => void;
  reset: () => void;
} {
  const [metrics, setMetrics] = useState<AnimationMetrics>({
    frameCount: 0,
    averageFPS: 0,
    droppedFrames: 0,
    totalDuration: 0,
  });

  const startTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const isTrackingRef = useRef(false);

  const trackFrame = useCallback((timestamp: number) => {
    if (!isTrackingRef.current) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }

    frameTimesRef.current.push(timestamp);

    // Calculate metrics
    const frameCount = frameTimesRef.current.length;
    const totalDuration = timestamp - startTimeRef.current;
    const averageFPS = (frameCount / totalDuration) * 1000;

    // Detect dropped frames (frame time > 16.67ms = 60fps)
    let droppedFrames = 0;
    for (let i = 1; i < frameTimesRef.current.length; i++) {
      const frameDuration = frameTimesRef.current[i] - frameTimesRef.current[i - 1];
      if (frameDuration > 16.67) {
        droppedFrames++;
      }
    }

    setMetrics({
      frameCount,
      averageFPS,
      droppedFrames,
      totalDuration,
    });

    rafIdRef.current = requestAnimationFrame(trackFrame);
  }, []);

  const startTracking = useCallback(() => {
    isTrackingRef.current = true;
    startTimeRef.current = 0;
    frameTimesRef.current = [];
    rafIdRef.current = requestAnimationFrame(trackFrame);
  }, [trackFrame]);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopTracking();
    setMetrics({
      frameCount: 0,
      averageFPS: 0,
      droppedFrames: 0,
      totalDuration: 0,
    });
  }, [stopTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    metrics,
    startTracking,
    stopTracking,
    reset,
  };
}
