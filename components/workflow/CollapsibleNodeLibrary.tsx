/**
 * CollapsibleNodeLibrary Component
 * 
 * A collapsible node library panel with width adjustment and smooth animations.
 * Part of the workflow UI redesign (Task 3.1).
 * Enhanced with virtual scrolling for performance (Task 10.1).
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import { defaultLayoutConfig } from '@/lib/workflow/theme';
import styles from '@/styles/CollapsibleNodeLibrary.module.css';

export interface CollapsibleNodeLibraryProps {
  /**
   * Whether the panel is collapsed
   */
  isCollapsed?: boolean;
  
  /**
   * Current width of the panel (in pixels)
   */
  width?: number;
  
  /**
   * Callback when collapse state changes
   */
  onToggleCollapse?: () => void;
  
  /**
   * Callback when width changes
   */
  onWidthChange?: (width: number) => void;
  
  /**
   * Children components (header, content, footer)
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * CollapsibleNodeLibrary Component
 */
export const CollapsibleNodeLibrary: React.FC<CollapsibleNodeLibraryProps> = ({
  isCollapsed: controlledIsCollapsed,
  width: controlledWidth,
  onToggleCollapse,
  onWidthChange,
  children,
  className = '',
}) => {
  const { theme } = useWorkflowTheme();
  const config = defaultLayoutConfig.nodeLibrary;
  
  // Internal state (used when not controlled)
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [internalWidth, setInternalWidth] = useState(config.defaultWidth);
  
  // Use controlled or internal state
  const isCollapsed = controlledIsCollapsed ?? internalIsCollapsed;
  const width = controlledWidth ?? internalWidth;
  
  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(width);
  
  // Handle collapse toggle
  const handleToggleCollapse = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalIsCollapsed(prev => !prev);
    }
  }, [onToggleCollapse]);
  
  // Handle width change
  const handleWidthChange = useCallback((newWidth: number) => {
    // Clamp width to min/max
    const clampedWidth = Math.max(
      config.minWidth,
      Math.min(config.maxWidth, newWidth)
    );
    
    if (onWidthChange) {
      onWidthChange(clampedWidth);
    } else {
      setInternalWidth(clampedWidth);
    }
  }, [config.minWidth, config.maxWidth, onWidthChange]);
  
  // Start resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = width;
  }, [width]);
  
  // Handle resize
  useEffect(() => {
    if (!isResizing) {
      return;
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current;
      const newWidth = resizeStartWidth.current + delta;
      handleWidthChange(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleWidthChange]);
  
  // Save width to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !isCollapsed) {
      localStorage.setItem('workflow-node-library-width', width.toString());
    }
  }, [width, isCollapsed]);
  
  // Load width from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !controlledWidth) {
      const stored = localStorage.getItem('workflow-node-library-width');
      if (stored) {
        const parsedWidth = parseInt(stored, 10);
        if (!isNaN(parsedWidth)) {
          setInternalWidth(parsedWidth);
        }
      }
    }
  }, [controlledWidth]);
  
  // Calculate actual width
  const actualWidth = isCollapsed ? config.collapsedWidth : width;
  
  return (
    <div
      className={`${styles.container} ${className}`}
      style={{
        width: `${actualWidth}px`,
        minWidth: `${actualWidth}px`,
        maxWidth: `${actualWidth}px`,
      }}
      data-theme={theme}
      data-collapsed={isCollapsed}
      data-resizing={isResizing}
    >
      {/* Main content */}
      <div className={styles.content}>
        {children}
      </div>
      
      {/* Resize handle */}
      {!isCollapsed && (
        <div
          className={styles.resizeHandle}
          onMouseDown={handleResizeStart}
          title="拖拽调整宽度"
        >
          <div className={styles.resizeIndicator} />
        </div>
      )}
      
      {/* Collapse button */}
      <button
        className={styles.collapseButton}
        onClick={handleToggleCollapse}
        title={isCollapsed ? '展开节点库' : '折叠节点库'}
        aria-label={isCollapsed ? '展开节点库' : '折叠节点库'}
      >
        {isCollapsed ? (
          <ChevronRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>
    </div>
  );
};

export default CollapsibleNodeLibrary;
