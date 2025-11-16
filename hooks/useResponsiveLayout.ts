/**
 * useResponsiveLayout Hook
 * 
 * Custom hook for managing responsive layout behavior across different screen sizes.
 * Provides breakpoint detection, layout mode management, and touch gesture support.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type LayoutMode = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveLayoutConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  enableTouchGestures: boolean;
  drawerAnimationDuration: number;
}

export interface ResponsiveLayoutState {
  layoutMode: LayoutMode;
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
  isPortrait: boolean;
}

export interface TouchGestureHandlers {
  onPinchZoom?: (scale: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onDoubleTap?: () => void;
}

const DEFAULT_CONFIG: ResponsiveLayoutConfig = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1024,
  },
  enableTouchGestures: true,
  drawerAnimationDuration: 300,
};

/**
 * Determine layout mode based on screen width
 */
function getLayoutMode(width: number, breakpoints: ResponsiveLayoutConfig['breakpoints']): LayoutMode {
  if (width < breakpoints.mobile) {
    return 'mobile';
  } else if (width < breakpoints.desktop) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Check if device supports touch
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * useResponsiveLayout Hook
 */
export function useResponsiveLayout(
  config: Partial<ResponsiveLayoutConfig> = {}
): ResponsiveLayoutState & {
  isDrawerMode: boolean;
  shouldUseTouchGestures: boolean;
  getOptimizedSidebarWidth: (defaultWidth: number) => number;
  getOptimizedSpacing: (defaultSpacing: number) => number;
  getOptimizedButtonSize: (defaultSize: number) => number;
} {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<ResponsiveLayoutState>(() => {
    if (typeof window === 'undefined') {
      return {
        layoutMode: 'desktop',
        screenWidth: 1920,
        screenHeight: 1080,
        isTouchDevice: false,
        isPortrait: false,
      };
    }
    
    return {
      layoutMode: getLayoutMode(window.innerWidth, mergedConfig.breakpoints),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      isTouchDevice: isTouchDevice(),
      isPortrait: window.innerHeight > window.innerWidth,
    };
  });
  
  // Update layout state on window resize
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setState({
          layoutMode: getLayoutMode(window.innerWidth, mergedConfig.breakpoints),
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          isTouchDevice: isTouchDevice(),
          isPortrait: window.innerHeight > window.innerWidth,
        });
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [mergedConfig.breakpoints]);
  
  // Check if should use drawer mode (mobile)
  const isDrawerMode = state.layoutMode === 'mobile';
  
  // Check if should use touch gestures
  const shouldUseTouchGestures = 
    mergedConfig.enableTouchGestures && 
    (state.isTouchDevice || state.layoutMode === 'mobile');
  
  // Get optimized sidebar width based on layout mode
  const getOptimizedSidebarWidth = useCallback((defaultWidth: number): number => {
    switch (state.layoutMode) {
      case 'mobile':
        return Math.min(280, state.screenWidth * 0.85);
      case 'tablet':
        return Math.min(defaultWidth * 0.85, 320);
      case 'desktop':
      default:
        return defaultWidth;
    }
  }, [state.layoutMode, state.screenWidth]);
  
  // Get optimized spacing based on layout mode
  const getOptimizedSpacing = useCallback((defaultSpacing: number): number => {
    switch (state.layoutMode) {
      case 'mobile':
        return Math.max(defaultSpacing * 0.75, 4);
      case 'tablet':
        return Math.max(defaultSpacing * 0.875, 6);
      case 'desktop':
      default:
        return defaultSpacing;
    }
  }, [state.layoutMode]);
  
  // Get optimized button size based on layout mode and touch support
  const getOptimizedButtonSize = useCallback((defaultSize: number): number => {
    if (shouldUseTouchGestures) {
      // Ensure minimum 44x44px touch target
      return Math.max(defaultSize, 44);
    }
    
    switch (state.layoutMode) {
      case 'mobile':
        return Math.max(defaultSize, 44);
      case 'tablet':
        return Math.max(defaultSize, 40);
      case 'desktop':
      default:
        return defaultSize;
    }
  }, [state.layoutMode, shouldUseTouchGestures]);
  
  return {
    ...state,
    isDrawerMode,
    shouldUseTouchGestures,
    getOptimizedSidebarWidth,
    getOptimizedSpacing,
    getOptimizedButtonSize,
  };
}

/**
 * useTouchGestures Hook
 * 
 * Provides touch gesture support for pinch zoom, pan, and double tap
 */
export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  handlers: TouchGestureHandlers,
  enabled: boolean = true
) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const pinchStartDistanceRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (!enabled || !elementRef.current) {
      return;
    }
    
    const element = elementRef.current;
    
    // Calculate distance between two touch points
    const getTouchDistance = (touches: TouchList): number => {
      if (touches.length < 2) return 0;
      
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    
    // Handle touch start
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - prepare for pan or tap
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
        lastTouchRef.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
      } else if (e.touches.length === 2) {
        // Two touches - prepare for pinch zoom
        pinchStartDistanceRef.current = getTouchDistance(e.touches);
      }
    };
    
    // Handle touch move
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && handlers.onPan && lastTouchRef.current) {
        // Single touch - pan gesture
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchRef.current.x;
        const deltaY = touch.clientY - lastTouchRef.current.y;
        
        handlers.onPan(deltaX, deltaY);
        
        lastTouchRef.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
      } else if (e.touches.length === 2 && handlers.onPinchZoom) {
        // Two touches - pinch zoom gesture
        const currentDistance = getTouchDistance(e.touches);
        
        if (pinchStartDistanceRef.current > 0) {
          const scale = currentDistance / pinchStartDistanceRef.current;
          handlers.onPinchZoom(scale);
        }
        
        pinchStartDistanceRef.current = currentDistance;
      }
    };
    
    // Handle touch end
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0 && touchStartRef.current) {
        // Check for double tap
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTimeRef.current;
        
        if (timeSinceLastTap < 300 && handlers.onDoubleTap) {
          // Double tap detected
          handlers.onDoubleTap();
          lastTapTimeRef.current = 0; // Reset to prevent triple tap
        } else {
          lastTapTimeRef.current = now;
        }
        
        // Reset refs
        touchStartRef.current = null;
        lastTouchRef.current = null;
        pinchStartDistanceRef.current = 0;
      }
    };
    
    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handlers, elementRef]);
}

/**
 * useDrawerAnimation Hook
 * 
 * Provides animation state management for drawer-style sidebars
 */
export function useDrawerAnimation(
  isOpen: boolean,
  duration: number = 300
): {
  isAnimating: boolean;
  shouldRender: boolean;
} {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  
  useEffect(() => {
    if (isOpen) {
      // Opening: render immediately, then animate
      setShouldRender(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      // Closing: animate first, then unmount
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShouldRender(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);
  
  return {
    isAnimating,
    shouldRender,
  };
}

/**
 * useViewportHeight Hook
 * 
 * Provides accurate viewport height that accounts for mobile browser chrome
 */
export function useViewportHeight(): number {
  const [height, setHeight] = useState(() => {
    if (typeof window === 'undefined') {
      return 0;
    }
    return window.innerHeight;
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const updateHeight = () => {
      // Use visualViewport if available (more accurate on mobile)
      const vh = window.visualViewport?.height || window.innerHeight;
      setHeight(vh);
      
      // Update CSS custom property
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };
    
    updateHeight();
    
    window.addEventListener('resize', updateHeight);
    window.visualViewport?.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('resize', updateHeight);
    };
  }, []);
  
  return height;
}
