/**
 * TouchGestureCanvas Component
 * 
 * Wrapper component that adds touch gesture support to the workflow canvas.
 * Provides pinch-to-zoom, pan gestures, and double-tap to reset view.
 */

'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { useTouchGestures } from '@/hooks/useResponsiveLayout';
import styles from '@/styles/TouchGestureCanvas.module.css';

export interface TouchGestureCanvasProps {
  /**
   * Child content (typically the workflow canvas)
   */
  children: React.ReactNode;
  
  /**
   * Whether touch gestures are enabled
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Callback when pinch zoom occurs
   */
  onPinchZoom?: (scale: number, centerX: number, centerY: number) => void;
  
  /**
   * Callback when pan gesture occurs
   */
  onPan?: (deltaX: number, deltaY: number) => void;
  
  /**
   * Callback when double tap occurs
   */
  onDoubleTap?: () => void;
  
  /**
   * Minimum zoom scale
   * @default 0.5
   */
  minZoom?: number;
  
  /**
   * Maximum zoom scale
   * @default 2.0
   */
  maxZoom?: number;
  
  /**
   * Current zoom level (controlled)
   */
  zoom?: number;
  
  /**
   * Callback when zoom changes
   */
  onZoomChange?: (zoom: number) => void;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * TouchGestureCanvas Component
 */
export const TouchGestureCanvas: React.FC<TouchGestureCanvasProps> = ({
  children,
  enabled = true,
  onPinchZoom,
  onPan,
  onDoubleTap,
  minZoom = 0.5,
  maxZoom = 2.0,
  zoom,
  onZoomChange,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentZoomRef = useRef<number>(zoom || 1);
  const lastScaleRef = useRef<number>(1);
  const pinchCenterRef = useRef<{ x: number; y: number } | null>(null);
  
  // Update current zoom when prop changes
  useEffect(() => {
    if (zoom !== undefined) {
      currentZoomRef.current = zoom;
    }
  }, [zoom]);
  
  // Handle pinch zoom
  const handlePinchZoom = useCallback((scale: number) => {
    if (!containerRef.current) return;
    
    // Calculate new zoom level
    const deltaScale = scale / lastScaleRef.current;
    let newZoom = currentZoomRef.current * deltaScale;
    
    // Clamp zoom level
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
    
    // Update refs
    currentZoomRef.current = newZoom;
    lastScaleRef.current = scale;
    
    // Get pinch center point
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = pinchCenterRef.current?.x || rect.width / 2;
    const centerY = pinchCenterRef.current?.y || rect.height / 2;
    
    // Notify parent
    if (onPinchZoom) {
      onPinchZoom(newZoom, centerX, centerY);
    }
    
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  }, [minZoom, maxZoom, onPinchZoom, onZoomChange]);
  
  // Handle pan gesture
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    if (onPan) {
      onPan(deltaX, deltaY);
    }
  }, [onPan]);
  
  // Handle double tap
  const handleDoubleTap = useCallback(() => {
    // Reset zoom to 1.0
    currentZoomRef.current = 1;
    lastScaleRef.current = 1;
    
    if (onDoubleTap) {
      onDoubleTap();
    }
    
    if (onZoomChange) {
      onZoomChange(1);
    }
  }, [onDoubleTap, onZoomChange]);
  
  // Track pinch center point
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    
    const element = containerRef.current;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Calculate center point between two touches
        const rect = element.getBoundingClientRect();
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        
        pinchCenterRef.current = { x: centerX, y: centerY };
        lastScaleRef.current = 1;
      }
    };
    
    const handleTouchEnd = () => {
      pinchCenterRef.current = null;
      lastScaleRef.current = 1;
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled]);
  
  // Use touch gestures hook
  useTouchGestures(
    containerRef,
    {
      onPinchZoom: handlePinchZoom,
      onPan: handlePan,
      onDoubleTap: handleDoubleTap,
    },
    enabled
  );
  
  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      data-touch-enabled={enabled}
    >
      {children}
      
      {/* Touch gesture hint overlay (shows on first touch) */}
      {enabled && (
        <div className={styles.gestureHint} aria-hidden="true">
          <div className={styles.hintContent}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className={styles.hintIcon}
            >
              <path
                d="M24 8V40M8 24H40"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
            <p className={styles.hintText}>
              双指缩放 · 单指拖动 · 双击重置
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouchGestureCanvas;
