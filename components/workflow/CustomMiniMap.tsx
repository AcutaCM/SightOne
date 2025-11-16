/**
 * CustomMiniMap Component
 * 
 * A customizable minimap component for workflow navigation with show/hide functionality.
 * Provides a bird's-eye view of the entire workflow with theme-aware styling.
 * 
 * Features:
 * - Toggle visibility
 * - Theme-aware styling
 * - Custom node colors
 * - Smooth animations
 * - Draggable position
 * 
 * Requirements: 10.1
 */

'use client';

import React, { useState, useCallback } from 'react';
import { MiniMap, MiniMapProps } from 'reactflow';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import { Button } from '@heroui/react';
import { MapIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import styles from '../../styles/CustomMiniMap.module.css';

export interface CustomMiniMapProps extends Partial<MiniMapProps> {
  defaultVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

/**
 * CustomMiniMap Component
 * 
 * Enhanced minimap with visibility toggle and custom styling.
 * Implements requirement 10.1 for minimap navigation.
 */
const CustomMiniMap: React.FC<CustomMiniMapProps> = ({
  defaultVisible = true,
  onVisibilityChange,
  nodeColor,
  maskColor,
  position = 'bottom-left',
  className,
  style,
  ...props
}) => {
  const { theme, tokens } = useWorkflowTheme();
  const [isVisible, setIsVisible] = useState(defaultVisible);

  // Toggle minimap visibility
  const toggleVisibility = useCallback(() => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onVisibilityChange?.(newVisibility);
  }, [isVisible, onVisibilityChange]);

  // Default node color function
  const defaultNodeColor = useCallback((node: any) => {
    return node.data?.color || tokens.colors.node.border;
  }, [tokens.colors.node.border]);

  // Default mask color based on theme
  const defaultMaskColor = theme === 'dark' 
    ? 'rgba(10, 15, 30, 0.8)' 
    : 'rgba(248, 250, 252, 0.8)';

  return (
    <div className={styles.minimapContainer} data-theme={theme}>
      {/* Toggle Button */}
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        className={styles.toggleButton}
        onPress={toggleVisibility}
        aria-label={isVisible ? '隐藏小地图' : '显示小地图'}
        title={isVisible ? '隐藏小地图' : '显示小地图'}
      >
        {isVisible ? (
          <EyeSlashIcon className={styles.icon} />
        ) : (
          <MapIcon className={styles.icon} />
        )}
      </Button>

      {/* MiniMap */}
      {isVisible && (
        <div className={styles.minimapWrapper}>
          <MiniMap
            nodeColor={nodeColor || defaultNodeColor}
            maskColor={maskColor || defaultMaskColor}
            position={position}
            className={`${styles.minimap} ${className || ''}`}
            style={{
              background: tokens.colors.panel.background,
              border: `1px solid ${tokens.colors.panel.border}`,
              borderRadius: tokens.radius.md,
              boxShadow: tokens.shadows.md,
              ...style,
            }}
            {...props}
          />
        </div>
      )}
    </div>
  );
};

export default CustomMiniMap;
