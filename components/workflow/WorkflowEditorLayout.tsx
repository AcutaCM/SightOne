/**
 * WorkflowEditorLayout Component
 * 
 * Main layout component for the workflow editor with three-column layout:
 * - Left: Collapsible Node Library
 * - Center: Workflow Canvas
 * - Right: Collapsible Control Panel
 * 
 * Features:
 * - Responsive three-column layout using Flexbox
 * - Collapsible sidebars with smooth animations
 * - Resizable sidebars with drag handles
 * - Layout state persistence to localStorage
 * - Responsive breakpoints for mobile/tablet/desktop
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import { useResponsiveLayout, useDrawerAnimation } from '@/hooks/useResponsiveLayout';
import {
  defaultLayoutConfig,
  getLayoutMode,
  calculateSidebarWidth,
} from '@/lib/workflow/theme';
import styles from '@/styles/WorkflowEditorLayout.module.css';

export interface LayoutState {
  isNodeLibraryCollapsed: boolean;
  isControlPanelCollapsed: boolean;
  nodeLibraryWidth: number;
  controlPanelWidth: number;
}

export interface WorkflowEditorLayoutProps {
  /**
   * Node library content
   */
  nodeLibrary?: React.ReactNode;
  
  /**
   * Canvas content
   */
  canvas: React.ReactNode;
  
  /**
   * Control panel content
   */
  controlPanel?: React.ReactNode;
  
  /**
   * Initial layout state
   */
  initialState?: Partial<LayoutState>;
  
  /**
   * Callback when layout state changes
   */
  onLayoutChange?: (state: LayoutState) => void;
  
  /**
   * Whether to persist layout state to localStorage
   * @default true
   */
  persistLayout?: boolean;
  
  /**
   * LocalStorage key for persisting layout state
   * @default 'workflow-layout-state'
   */
  storageKey?: string;
}

const STORAGE_KEY_DEFAULT = 'workflow-layout-state';
const MIN_DRAG_DISTANCE = 5; // Minimum pixels to drag before considering it a resize

/**
 * Load layout state from localStorage
 */
function loadLayoutState(storageKey: string): Partial<LayoutState> | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load layout state:', error);
  }
  
  return null;
}

/**
 * Save layout state to localStorage
 */
function saveLayoutState(storageKey: string, state: LayoutState): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save layout state:', error);
  }
}

/**
 * WorkflowEditorLayout Component
 */
export const WorkflowEditorLayout: React.FC<WorkflowEditorLayoutProps> = ({
  nodeLibrary,
  canvas,
  controlPanel,
  initialState,
  onLayoutChange,
  persistLayout = true,
  storageKey = STORAGE_KEY_DEFAULT,
}) => {
  const { theme } = useWorkflowTheme();
  const responsiveLayout = useResponsiveLayout({
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1024,
    },
    enableTouchGestures: true,
    drawerAnimationDuration: 300,
  });
  
  // Initialize layout state
  const getInitialState = useCallback((): LayoutState => {
    // Try to load from localStorage first
    if (persistLayout) {
      const stored = loadLayoutState(storageKey);
      if (stored) {
        return {
          isNodeLibraryCollapsed: stored.isNodeLibraryCollapsed ?? false,
          isControlPanelCollapsed: stored.isControlPanelCollapsed ?? false,
          nodeLibraryWidth: stored.nodeLibraryWidth ?? defaultLayoutConfig.nodeLibrary.defaultWidth,
          controlPanelWidth: stored.controlPanelWidth ?? defaultLayoutConfig.controlPanel.defaultWidth,
        };
      }
    }
    
    // Use initial state or defaults
    return {
      isNodeLibraryCollapsed: initialState?.isNodeLibraryCollapsed ?? false,
      isControlPanelCollapsed: initialState?.isControlPanelCollapsed ?? false,
      nodeLibraryWidth: initialState?.nodeLibraryWidth ?? defaultLayoutConfig.nodeLibrary.defaultWidth,
      controlPanelWidth: initialState?.controlPanelWidth ?? defaultLayoutConfig.controlPanel.defaultWidth,
    };
  }, [initialState, persistLayout, storageKey]);
  
  const [layoutState, setLayoutState] = useState<LayoutState>(getInitialState);
  const [isResizingNodeLibrary, setIsResizingNodeLibrary] = useState(false);
  const [isResizingControlPanel, setIsResizingControlPanel] = useState(false);
  
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  
  // Use responsive layout mode from hook
  const layoutMode = responsiveLayout.layoutMode;
  const isDrawerMode = responsiveLayout.isDrawerMode;
  
  // Drawer animation states
  const nodeLibraryDrawer = useDrawerAnimation(
    !layoutState.isNodeLibraryCollapsed && isDrawerMode,
    300
  );
  const controlPanelDrawer = useDrawerAnimation(
    !layoutState.isControlPanelCollapsed && isDrawerMode,
    300
  );
  
  // Auto-collapse sidebars when switching to mobile mode
  useEffect(() => {
    if (isDrawerMode) {
      setLayoutState(prev => ({
        ...prev,
        isNodeLibraryCollapsed: true,
        isControlPanelCollapsed: true,
      }));
    }
  }, [isDrawerMode]);
  
  // Save layout state when it changes
  useEffect(() => {
    if (persistLayout) {
      saveLayoutState(storageKey, layoutState);
    }
    
    onLayoutChange?.(layoutState);
  }, [layoutState, persistLayout, storageKey, onLayoutChange]);
  
  // Toggle node library
  const toggleNodeLibrary = useCallback(() => {
    setLayoutState(prev => ({
      ...prev,
      isNodeLibraryCollapsed: !prev.isNodeLibraryCollapsed,
    }));
  }, []);
  
  // Toggle control panel
  const toggleControlPanel = useCallback(() => {
    setLayoutState(prev => ({
      ...prev,
      isControlPanelCollapsed: !prev.isControlPanelCollapsed,
    }));
  }, []);
  
  // Start resizing node library
  const startResizeNodeLibrary = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingNodeLibrary(true);
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = layoutState.nodeLibraryWidth;
    hasDraggedRef.current = false;
  }, [layoutState.nodeLibraryWidth]);
  
  // Start resizing control panel
  const startResizeControlPanel = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingControlPanel(true);
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = layoutState.controlPanelWidth;
    hasDraggedRef.current = false;
  }, [layoutState.controlPanelWidth]);
  
  // Handle mouse move during resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingNodeLibrary) {
        const delta = e.clientX - resizeStartXRef.current;
        
        // Check if dragged enough
        if (Math.abs(delta) > MIN_DRAG_DISTANCE) {
          hasDraggedRef.current = true;
        }
        
        if (hasDraggedRef.current) {
          const newWidth = Math.max(
            defaultLayoutConfig.nodeLibrary.minWidth,
            Math.min(
              defaultLayoutConfig.nodeLibrary.maxWidth,
              resizeStartWidthRef.current + delta
            )
          );
          
          setLayoutState(prev => ({
            ...prev,
            nodeLibraryWidth: newWidth,
          }));
        }
      } else if (isResizingControlPanel) {
        const delta = resizeStartXRef.current - e.clientX; // Reversed for right panel
        
        // Check if dragged enough
        if (Math.abs(delta) > MIN_DRAG_DISTANCE) {
          hasDraggedRef.current = true;
        }
        
        if (hasDraggedRef.current) {
          const newWidth = Math.max(
            defaultLayoutConfig.controlPanel.minWidth,
            Math.min(
              defaultLayoutConfig.controlPanel.maxWidth,
              resizeStartWidthRef.current + delta
            )
          );
          
          setLayoutState(prev => ({
            ...prev,
            controlPanelWidth: newWidth,
          }));
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsResizingNodeLibrary(false);
      setIsResizingControlPanel(false);
      hasDraggedRef.current = false;
    };
    
    if (isResizingNodeLibrary || isResizingControlPanel) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizingNodeLibrary, isResizingControlPanel]);
  
  // Calculate actual widths based on layout mode and collapse state
  const nodeLibraryWidth = calculateSidebarWidth(
    layoutMode,
    layoutState.isNodeLibraryCollapsed,
    defaultLayoutConfig.nodeLibrary
  );
  
  const controlPanelWidth = calculateSidebarWidth(
    layoutMode,
    layoutState.isControlPanelCollapsed,
    defaultLayoutConfig.controlPanel
  );
  
  // Use optimized widths based on layout mode
  const actualNodeLibraryWidth = (() => {
    if (layoutState.isNodeLibraryCollapsed) {
      return defaultLayoutConfig.nodeLibrary.collapsedWidth;
    }
    
    switch (layoutMode) {
      case 'mobile':
        return responsiveLayout.getOptimizedSidebarWidth(defaultLayoutConfig.nodeLibrary.defaultWidth);
      case 'tablet':
        return Math.min(240, responsiveLayout.screenWidth * 0.25);
      case 'desktop':
      default:
        return layoutState.nodeLibraryWidth;
    }
  })();
    
  const actualControlPanelWidth = (() => {
    if (layoutState.isControlPanelCollapsed) {
      return defaultLayoutConfig.controlPanel.collapsedWidth;
    }
    
    switch (layoutMode) {
      case 'mobile':
        return responsiveLayout.getOptimizedSidebarWidth(defaultLayoutConfig.controlPanel.defaultWidth);
      case 'tablet':
        return Math.min(300, responsiveLayout.screenWidth * 0.30);
      case 'desktop':
      default:
        return layoutState.controlPanelWidth;
    }
  })();
  
  return (
    <div 
      className={styles.layout}
      data-theme={theme}
      data-layout-mode={layoutMode}
    >
      {/* Node Library */}
      {nodeLibrary && (
        <aside
          className={`${styles.sidebar} ${styles.nodeLibrary} ${
            layoutState.isNodeLibraryCollapsed ? styles.collapsed : ''
          }`}
          style={{
            width: layoutMode === 'mobile' ? undefined : `${actualNodeLibraryWidth}px`,
          }}
        >
          <div className={styles.sidebarContent}>
            {nodeLibrary}
          </div>
          
          {/* Collapse Button */}
          <button
            className={`${styles.collapseButton} ${styles.collapseButtonLeft}`}
            onClick={toggleNodeLibrary}
            aria-label={layoutState.isNodeLibraryCollapsed ? '展开节点库' : '折叠节点库'}
            title={layoutState.isNodeLibraryCollapsed ? '展开节点库' : '折叠节点库'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.collapseIcon}
            >
              <path
                d={layoutState.isNodeLibraryCollapsed ? 'M6 12L10 8L6 4' : 'M10 12L6 8L10 4'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          {/* Resize Handle */}
          {!layoutState.isNodeLibraryCollapsed && layoutMode === 'desktop' && (
            <div
              className={`${styles.resizeHandle} ${styles.resizeHandleRight}`}
              onMouseDown={startResizeNodeLibrary}
              role="separator"
              aria-label="调整节点库宽度"
            />
          )}
        </aside>
      )}
      
      {/* Canvas */}
      <main className={styles.canvas}>
        {canvas}
      </main>
      
      {/* Control Panel */}
      {controlPanel && (
        <aside
          className={`${styles.sidebar} ${styles.controlPanel} ${
            layoutState.isControlPanelCollapsed ? styles.collapsed : ''
          }`}
          style={{
            width: layoutMode === 'mobile' ? undefined : `${actualControlPanelWidth}px`,
          }}
        >
          {/* Resize Handle */}
          {!layoutState.isControlPanelCollapsed && layoutMode === 'desktop' && (
            <div
              className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`}
              onMouseDown={startResizeControlPanel}
              role="separator"
              aria-label="调整控制面板宽度"
            />
          )}
          
          <div className={styles.sidebarContent}>
            {controlPanel}
          </div>
          
          {/* Collapse Button */}
          <button
            className={`${styles.collapseButton} ${styles.collapseButtonRight}`}
            onClick={toggleControlPanel}
            aria-label={layoutState.isControlPanelCollapsed ? '展开控制面板' : '折叠控制面板'}
            title={layoutState.isControlPanelCollapsed ? '展开控制面板' : '折叠控制面板'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.collapseIcon}
            >
              <path
                d={layoutState.isControlPanelCollapsed ? 'M10 12L6 8L10 4' : 'M6 12L10 8L6 4'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </aside>
      )}
      
      {/* Overlay for mobile drawer */}
      {layoutMode === 'mobile' && (
        <>
          {!layoutState.isNodeLibraryCollapsed && (
            <div
              className={styles.overlay}
              onClick={toggleNodeLibrary}
              aria-label="关闭节点库"
            />
          )}
          {!layoutState.isControlPanelCollapsed && (
            <div
              className={styles.overlay}
              onClick={toggleControlPanel}
              aria-label="关闭控制面板"
            />
          )}
        </>
      )}
    </div>
  );
};

export default WorkflowEditorLayout;
