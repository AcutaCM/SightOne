/**
 * CanvasToolbar Component
 * 
 * Toolbar for canvas controls including zoom, fit view, and other utilities.
 * Implements requirement 3.6 from the design specification.
 */

'use client';

import React from 'react';
import { useReactFlow } from 'reactflow';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import ExportButton from './ExportButton';
import styles from '../../styles/CanvasToolbar.module.css';

export interface CanvasToolbarProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showZoomLevel?: boolean;
  showResetButton?: boolean;
  showFitViewButton?: boolean;
  showZoomControls?: boolean;
  showExportButton?: boolean;
}

/**
 * CanvasToolbar Component
 * 
 * Provides zoom controls, zoom level display, and view reset functionality.
 */
const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  className,
  position = 'top-right',
  showZoomLevel = true,
  showResetButton = true,
  showFitViewButton = true,
  showZoomControls = true,
  showExportButton = true,
}) => {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const { tokens } = useWorkflowTheme();
  const [zoomLevel, setZoomLevel] = React.useState(100);

  // Update zoom level display
  React.useEffect(() => {
    const updateZoom = () => {
      const zoom = getZoom();
      setZoomLevel(Math.round(zoom * 100));
    };

    // Update initially
    updateZoom();

    // Update on zoom changes
    const interval = setInterval(updateZoom, 100);

    return () => clearInterval(interval);
  }, [getZoom]);

  // Handle zoom in
  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  // Handle zoom out
  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  // Handle fit view
  const handleFitView = () => {
    fitView({ 
      duration: 300,
      padding: 0.2,
    });
  };

  // Handle reset view (100% zoom + center)
  const handleResetView = () => {
    fitView({ 
      duration: 300,
      padding: 0.1,
      minZoom: 1,
      maxZoom: 1,
    });
  };

  return (
    <div 
      className={`${styles.toolbar} ${styles[position]} ${className || ''}`}
      style={{
        background: tokens.colors.panel.background,
        border: `1px solid ${tokens.colors.panel.border}`,
        borderRadius: tokens.radius.md,
        boxShadow: tokens.shadows.md,
      }}
    >
      {/* Zoom Controls */}
      {showZoomControls && (
        <div className={styles.zoomControls}>
          <button
            className={styles.toolbarButton}
            onClick={handleZoomOut}
            title="缩小 (Zoom Out)"
            aria-label="Zoom out"
            style={{
              color: tokens.colors.panel.text,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          {showZoomLevel && (
            <div 
              className={styles.zoomLevel}
              style={{
                color: tokens.colors.panel.text,
              }}
            >
              {zoomLevel}%
            </div>
          )}

          <button
            className={styles.toolbarButton}
            onClick={handleZoomIn}
            title="放大 (Zoom In)"
            aria-label="Zoom in"
            style={{
              color: tokens.colors.panel.text,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      )}

      {/* Divider */}
      {(showZoomControls && (showFitViewButton || showResetButton || showExportButton)) && (
        <div 
          className={styles.divider}
          style={{
            background: tokens.colors.panel.border,
          }}
        />
      )}

      {/* View Controls */}
      <div className={styles.viewControls}>
        {showFitViewButton && (
          <button
            className={styles.toolbarButton}
            onClick={handleFitView}
            title="适应视图 (Fit View)"
            aria-label="Fit view"
            style={{
              color: tokens.colors.panel.text,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        )}

        {showResetButton && (
          <button
            className={styles.toolbarButton}
            onClick={handleResetView}
            title="重置视图 (Reset View)"
            aria-label="Reset view"
            style={{
              color: tokens.colors.panel.text,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        )}
      </div>

      {/* Export Button */}
      {showExportButton && (
        <>
          <div 
            className={styles.divider}
            style={{
              background: tokens.colors.panel.border,
            }}
          />
          <ExportButton iconOnly position="toolbar" />
        </>
      )}
    </div>
  );
};

export default CanvasToolbar;
