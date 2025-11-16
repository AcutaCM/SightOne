'use client';

import React from 'react';
import { GripHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip } from '@heroui/react';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

/**
 * ResizeHandle Component - 黑白灰极简主题
 * 
 * 节点右下角的调整大小手柄
 * 
 * Requirements: 1.1, 4.1
 */
interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing?: boolean;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ 
  onMouseDown,
  isResizing = false
}) => {
  const theme = useWorkflowTheme();

  return (
    <Tooltip
      content={
        <div style={{ padding: '4px 8px' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            调整节点大小
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            拖动以调整节点的宽度和高度
          </div>
          <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
            提示: 调整时会显示实时尺寸
          </div>
        </div>
      }
      placement="left"
      delay={500}
      closeDelay={0}
      classNames={{
        base: 'max-w-xs',
        content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
      }}
    >
      <motion.div
        className="resize-handle"
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 20,
          height: 20,
          cursor: 'nwse-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isResizing 
            ? theme.node.selected 
            : theme.node.border,
          borderTopLeftRadius: 4,
          borderBottomRightRadius: 6,
          zIndex: 20,
          userSelect: 'none',
          transition: 'all 0.2s ease',
          opacity: 0.6,
        }}
        whileHover={{
          background: theme.node.selected,
          opacity: 1,
          scale: 1.15,
        }}
        animate={{
          opacity: isResizing ? 1 : 0.6,
          scale: isResizing ? 1.1 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <GripHorizontal 
          size={14} 
          color={isResizing ? theme.node.bg : theme.text.secondary}
          style={{
            transform: 'rotate(-45deg)',
            transition: 'color 0.2s ease',
          }}
        />
      </motion.div>
    </Tooltip>
  );
};

export default ResizeHandle;
