'use client';

import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

/**
 * useNodeCollapse Hook
 * 
 * 提供节点折叠/展开功能的自定义Hook
 * 
 * 功能：
 * - 切换节点的折叠状态
 * - 更新节点数据中的isCollapsed字段
 * - 持久化折叠状态到工作流
 * 
 * @returns {Object} 包含toggleCollapse方法的对象
 * 
 * @example
 * ```tsx
 * const { toggleCollapse } = useNodeCollapse();
 * 
 * const handleToggle = () => {
 *   toggleCollapse(nodeId);
 * };
 * ```
 */
export const useNodeCollapse = () => {
  const { setNodes } = useReactFlow();

  /**
   * 切换节点的折叠状态
   * @param nodeId 节点ID
   */
  const toggleCollapse = useCallback((nodeId: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              isCollapsed: !node.data.isCollapsed,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  /**
   * 设置节点的折叠状态
   * @param nodeId 节点ID
   * @param isCollapsed 是否折叠
   */
  const setCollapse = useCallback((nodeId: string, isCollapsed: boolean) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              isCollapsed,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  /**
   * 获取节点的折叠状态
   * @param nodeId 节点ID
   * @returns 是否折叠
   */
  const getCollapseState = useCallback((nodeId: string): boolean => {
    // 注意：这个方法需要在ReactFlow上下文中使用
    // 实际使用时应该从节点数据中直接读取
    return false;
  }, []);

  return {
    toggleCollapse,
    setCollapse,
    getCollapseState,
  };
};

export default useNodeCollapse;
