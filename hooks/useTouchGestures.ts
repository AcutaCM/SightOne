/**
 * Touch Gestures Hook
 * 
 * Provides touch gesture support for mobile devices:
 * - Tap feedback
 * - Long press
 * - Swipe detection
 * - Touch target optimization
 * 
 * Requirements: 14.4, 14.5
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

export interface TouchGestureOptions {
  /**
   * Enable tap feedback animation
   */
  enableTapFeedback?: boolean;
  
  /**
   * Enable long press detection
   */
  enableLongPress?: boolean;
  
  /**
   * Long press duration in milliseconds
   */
  longPressDuration?: number;
  
  /**
   * Enable swipe detection
   */
  enableSwipe?: boolean;
  
  /**
   * Minimum swipe distance in pixels
   */
  swipeThreshold?: number;
  
  /**
   * Callback for tap event
   */
  onTap?: () => void;
  
  /**
   * Callback for long press event
   */
  onLongPress?: () => void;
  
  /**
   * Callback for swipe event
   */
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

export interface TouchGestureState {
  /**
   * Whether the element is currently being touched
   */
  isTouching: boolean;
  
  /**
   * Whether a long press is in progress
   */
  isLongPressing: boolean;
  
  /**
   * Touch feedback class name
   */
  touchFeedbackClass: string;
}

/**
 * Custom hook for touch gesture handling
 */
export function useTouchGestures(options: TouchGestureOptions = {}): {
  state: TouchGestureState;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchCancel: (e: React.TouchEvent) => void;
  };
} {
  const {
    enableTapFeedback = true,
    enableLongPress = false,
    longPressDuration = 500,
    enableSwipe = false,
    swipeThreshold = 50,
    onTap,
    onLongPress,
    onSwipe,
  } = options;

  const [isTouching, setIsTouching] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [touchFeedbackClass, setTouchFeedbackClass] = useState('');

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // Record touch start position and time
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setIsTouching(true);

    // Apply tap feedback
    if (enableTapFeedback) {
      setTouchFeedbackClass('touch-active');
    }

    // Start long press timer
    if (enableLongPress && onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress();
      }, longPressDuration);
    }
  }, [enableTapFeedback, enableLongPress, longPressDuration, onLongPress]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel long press if moved too much
    if (distance > 10) {
      clearLongPressTimer();
      setIsLongPressing(false);
    }
  }, [clearLongPressTimer]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    setIsTouching(false);
    clearLongPressTimer();

    // Remove tap feedback
    if (enableTapFeedback) {
      setTouchFeedbackClass('touch-release');
      setTimeout(() => setTouchFeedbackClass(''), 200);
    }

    // Detect swipe
    if (enableSwipe && onSwipe && deltaTime < 300) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > swipeThreshold || absY > swipeThreshold) {
        if (absX > absY) {
          // Horizontal swipe
          onSwipe(deltaX > 0 ? 'right' : 'left');
        } else {
          // Vertical swipe
          onSwipe(deltaY > 0 ? 'down' : 'up');
        }
        return;
      }
    }

    // Detect tap (if not long pressing)
    if (!isLongPressing && onTap && deltaTime < 300) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < 10) {
        onTap();
      }
    }

    setIsLongPressing(false);
    touchStartRef.current = null;
  }, [
    enableTapFeedback,
    enableSwipe,
    swipeThreshold,
    isLongPressing,
    onTap,
    onSwipe,
    clearLongPressTimer,
  ]);

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    setIsTouching(false);
    setIsLongPressing(false);
    clearLongPressTimer();
    setTouchFeedbackClass('');
    touchStartRef.current = null;
  }, [clearLongPressTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return {
    state: {
      isTouching,
      isLongPressing,
      touchFeedbackClass,
    },
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}

/**
 * Hook for optimizing touch target sizes
 * Ensures minimum 44x44px touch targets on mobile
 */
export function useTouchTargetSize(minSize: number = 44): {
  style: React.CSSProperties;
  className: string;
} {
  return {
    style: {
      minWidth: `${minSize}px`,
      minHeight: `${minSize}px`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    className: 'touch-target',
  };
}

/**
 * Hook for detecting if device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchSupport = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouchSupport());
  }, []);

  return isTouchDevice;
}
