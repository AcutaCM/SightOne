'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

/**
 * SizeIndicator Component - 黑白灰极简主题
 * 
 * 在调整节点大小时显示实时尺寸
 * 
 * Requirements: 7.5
 */
interface SizeIndicatorProps {
  width: number;
  height: number;
  isVisible: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

const SizeIndicator: React.FC<SizeIndicatorProps> = ({
  width,
  height,
  isVisible,
  position = 'center'
}) => {
  const theme = useWorkflowTheme();

  // 根据位置计算样式
  const getPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      pointerEvents: 'none',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: 8, left: 8 };
      case 'top-right':
        return { ...baseStyle, top: 8, right: 8 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 8, left: 8 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 8, right: 8 };
      case 'center':
      default:
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            ...getPositionStyle(),
            background: theme.node.selected,
            color: theme.node.bg,
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'monospace',
            boxShadow: theme.shadow.selected,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ opacity: 0.7 }}>W:</span>
            <span>{Math.round(width)}px</span>
          </div>
          <div 
            style={{ 
              width: '1px', 
              height: '14px', 
              background: theme.node.bg,
              opacity: 0.3
            }} 
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ opacity: 0.7 }}>H:</span>
            <span>{Math.round(height)}px</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SizeIndicator;
