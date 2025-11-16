/**
 * ExportButton Component
 * 
 * Button component for exporting workflow diagrams as PNG or SVG.
 * Provides a dropdown menu with export options.
 * 
 * Implements requirement 10.7 from the design specification.
 */

'use client';

import React, { useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import { exportWorkflow, isExportSupported } from '../../lib/workflow/workflowExporter';
import styles from '../../styles/ExportButton.module.css';

export interface ExportButtonProps {
  className?: string;
  /**
   * Show export button as icon only
   * @default false
   */
  iconOnly?: boolean;
  /**
   * Position of the button
   */
  position?: 'toolbar' | 'standalone';
}

/**
 * ExportButton Component
 * 
 * Provides export functionality for workflow diagrams.
 */
const ExportButton: React.FC<ExportButtonProps> = ({
  className,
  iconOnly = false,
  position = 'toolbar',
}) => {
  const { getNodes } = useReactFlow();
  const { theme, tokens } = useWorkflowTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Check if component is mounted (client-side only)
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if export is supported (only on client)
  const exportSupported = isMounted && isExportSupported();

  // Handle export
  const handleExport = async (format: 'png' | 'svg', selectedOnly: boolean = false) => {
    setIsMenuOpen(false);
    setIsExporting(true);
    setExportError(null);

    try {
      const nodes = getNodes();
      const nodesToExport = selectedOnly ? nodes.filter(n => n.selected) : nodes;

      if (nodesToExport.length === 0) {
        throw new Error(selectedOnly ? '请先选择要导出的节点' : '工作流中没有节点');
      }

      // Get background color based on theme
      const backgroundColor = theme === 'light' 
        ? tokens.colors.canvas.background 
        : tokens.colors.canvas.background;

      // Generate filename with timestamp (client-side only)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      
      await exportWorkflow(nodes, format, {
        backgroundColor,
        padding: 40,
        quality: 1,
        selectedOnly,
        filename: `workflow-${timestamp}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : '导出失败');
      
      // Clear error after 3 seconds
      setTimeout(() => setExportError(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.exportButton}`)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className={`${styles.exportButton} ${className || ''}`} style={{ opacity: 0, pointerEvents: 'none' }}>
        <button
          className={`${styles.button} ${position === 'toolbar' ? styles.toolbarButton : styles.standaloneButton}`}
          disabled
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    );
  }

  if (!exportSupported) {
    return null;
  }

  return (
    <div className={`${styles.exportButton} ${className || ''}`}>
      <button
        className={`${styles.button} ${position === 'toolbar' ? styles.toolbarButton : styles.standaloneButton}`}
        onClick={toggleMenu}
        disabled={isExporting}
        title="导出工作流 (Export Workflow)"
        aria-label="Export workflow"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        style={{
          background: tokens.colors.panel.background,
          border: `1px solid ${tokens.colors.panel.border}`,
          color: tokens.colors.panel.text,
        }}
      >
        {isExporting ? (
          <svg 
            className={styles.spinner} 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        {!iconOnly && <span className={styles.buttonText}>导出</span>}
        {!iconOnly && (
          <svg 
            className={`${styles.chevron} ${isMenuOpen ? styles.chevronOpen : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {/* Export Menu */}
      {isMenuOpen && (
        <div 
          className={styles.menu}
          role="menu"
          style={{
            background: tokens.colors.panel.background,
            border: `1px solid ${tokens.colors.panel.border}`,
            boxShadow: tokens.shadows.lg,
            borderRadius: tokens.radius.md,
          }}
        >
          <div className={styles.menuSection}>
            <div 
              className={styles.menuLabel}
              style={{ color: tokens.colors.panel.textSecondary }}
            >
              导出全部节点
            </div>
            <button
              className={styles.menuItem}
              onClick={() => handleExport('png', false)}
              role="menuitem"
              style={{
                color: tokens.colors.panel.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tokens.colors.panel.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>PNG 图片</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleExport('svg', false)}
              role="menuitem"
              style={{
                color: tokens.colors.panel.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tokens.colors.panel.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>SVG 矢量图</span>
            </button>
          </div>

          <div 
            className={styles.menuDivider}
            style={{ background: tokens.colors.panel.border }}
          />

          <div className={styles.menuSection}>
            <div 
              className={styles.menuLabel}
              style={{ color: tokens.colors.panel.textSecondary }}
            >
              仅导出选中节点
            </div>
            <button
              className={styles.menuItem}
              onClick={() => handleExport('png', true)}
              role="menuitem"
              style={{
                color: tokens.colors.panel.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tokens.colors.panel.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>PNG 图片 (选中)</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleExport('svg', true)}
              role="menuitem"
              style={{
                color: tokens.colors.panel.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tokens.colors.panel.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>SVG 矢量图 (选中)</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {exportError && (
        <div 
          className={styles.errorToast}
          style={{
            background: tokens.colors.status.error,
            color: '#ffffff',
            borderRadius: tokens.radius.md,
            boxShadow: tokens.shadows.lg,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{exportError}</span>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
