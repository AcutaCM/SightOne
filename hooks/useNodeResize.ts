'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';

/**
 * useNodeResize Hook
 * 
 * 处理节点尺寸调整的自定义Hook
 * 
 * Requirements: 8.2, 8.3, 8.4
 */

interface UseNodeResizeOptions {
  nodeId: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize?: (width: number, height: number) => void;
}

interface UseNodeResizeReturn {
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent) => void;
  currentSize: { width: number; height: number } | null;
}

const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_MIN_HEIGHT = 150;
const DEFAULT_MAX_WIDTH = 600;
const DEFAULT_MAX_HEIGHT = 800;

export const useNodeResize = ({
  nodeId,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxWidth = DEFAULT_MAX_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT,
  onResize,
}: UseNodeResizeOptions): UseNodeResizeReturn => {
  const { setNodes, getNode } = useReactFlow();
  const [isResizing, setIsResizing] = useState(false);
  const [currentSize, setCurrentSize] = useState<{ width: number; height: number } | null>(null);
  
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const startSizeRef = useRef<{ width: number; height: number } | null>(null);

  /**
   * 限制尺寸在最小和最大值之间
   */
  const clampSize = useCallback((width: number, height: number) => {
    return {
      width: Math.max(minWidth, Math.min(maxWidth, width)),
      height: Math.max(minHeight, Math.min(maxHeight, height)),
    };
  }, [minWidth, minHeight, maxWidth, maxHeight]);

  /**
   * 更新节点尺寸
   */
  const updateNodeSize = useCallback((width: number, height: number) => {
    const clampedSize = clampSize(width, height);
    
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              customSize: clampedSize,
            },
          };
        }
        return node;
      })
    );

    setCurrentSize(clampedSize);
    
    if (onResize) {
      onResize(clampedSize.width, clampedSize.height);
    }
  }, [nodeId, setNodes, clampSize, onResize]);

  /**
   * 处理鼠标移动
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!startPosRef.current || !startSizeRef.current) return;

    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    const newWidth = startSizeRef.current.width + deltaX;
    const newHeight = startSizeRef.current.height + deltaY;

    updateNodeSize(newWidth, newHeight);
  }, [updateNodeSize]);

  /**
   * 处理鼠标释放
   */
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    startPosRef.current = null;
    startSizeRef.current = null;
    
    // 移除事件监听器
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // 恢复body的用户选择
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleMouseMove]);

  /**
   * 处理调整大小开始
   */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const node = getNode(nodeId);
    if (!node) return;

    // 获取当前节点尺寸
    const currentWidth = node.data.customSize?.width || 280;
    const currentHeight = node.data.customSize?.height || 200;

    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { width: currentWidth, height: currentHeight };
    
    setIsResizing(true);
    setCurrentSize({ width: currentWidth, height: currentHeight });

    // 添加事件监听器
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 禁用文本选择和设置光标
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';
  }, [nodeId, getNode, handleMouseMove, handleMouseUp]);

  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    isResizing,
    handleResizeStart,
    currentSize,
  };
};
