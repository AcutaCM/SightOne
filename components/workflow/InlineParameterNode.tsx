'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import NodeHeader from './NodeHeader';
import ParameterList from './ParameterList';
import ResizeHandle from './ResizeHandle';
import SizeIndicator from './SizeIndicator';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';
import { ParameterValidationService } from '@/lib/workflow/parameterValidation';
import { NodeStatus } from '@/lib/workflow/designSystem';
import { useNodeResize } from '@/hooks/useNodeResize';
import { getCSSVariable } from '@/lib/workflow/workflowTheme';
import { optimizeParameterUpdate } from '@/lib/workflow/performanceUtils';
import '@/styles/WorkflowAnimations.css';

/**
 * InlineParameterNode数据接口
 */
export interface InlineParameterNodeData {
  id: string;
  type: string;
  label: string;
  category: string;
  icon: LucideIcon;
  color: string;
  status: NodeStatus;
  parameters: Record<string, any>;
  isCollapsed: boolean;
  priorityParams?: string[];
  customSize?: { width: number; height: number };
  lastModified?: number;
}

/**
 * InlineParameterNode组件属性
 */
export interface InlineParameterNodeProps extends NodeProps {
  data: InlineParameterNodeData;
}

/**
 * InlineParameterNode Component
 * 
 * 新的节点组件，替代AnimatedWorkflowNode，提供内联参数编辑功能
 * 
 * 功能：
 * - 集成NodeHeader、ParameterList和NodeStatusIndicator
 * - 支持参数内联编辑
 * - 支持折叠/展开参数区域
 * - 支持参数验证和错误提示
 * - 支持参数持久化
 * - 根据参数数量自动调整节点尺寸
 * 
 * 性能优化 (Requirements: 9.4):
 * - 使用React.memo避免不必要的重渲染
 * - 使用useMemo缓存计算结果
 * - 使用useCallback缓存事件处理函数
 * - 使用防抖优化参数更新
 * 
 * Requirements: 1.1, 1.2, 2.1, 2.6, 3.1, 3.2, 3.3
 */
const InlineParameterNode: React.FC<InlineParameterNodeProps> = React.memo(({ 
  data, 
  selected,
  id 
}) => {
  const { setNodes } = useReactFlow();
  
  // 本地状态
  const [localParams, setLocalParams] = useState(data.parameters || {});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  
  // 使用调整大小Hook
  // Requirements: 8.1, 8.2, 8.3, 8.4
  const { isResizing, handleResizeStart, currentSize } = useNodeResize({
    nodeId: id,
    minWidth: 200,
    minHeight: 150,
    maxWidth: 600,
    maxHeight: 800,
  });

  // 获取节点定义
  const nodeDefinition = useMemo(() => {
    return nodeRegistry.getNode(data.type);
  }, [data.type]);

  // 计算参数数量
  const parameterCount = useMemo(() => {
    return nodeDefinition?.parameters.length || 0;
  }, [nodeDefinition]);

  // 检查是否有必填参数未配置
  const hasErrors = useMemo(() => {
    if (!nodeDefinition) return false;
    
    return nodeDefinition.parameters.some(param => {
      if (param.required) {
        const value = localParams[param.name];
        return value === undefined || value === null || value === '';
      }
      return false;
    });
  }, [nodeDefinition, localParams]);

  // 优化的参数更新函数 - Requirements: 2.6, 6.5, 9.3
  const parameterUpdater = useMemo(
    () => optimizeParameterUpdate<any>(
      (paramName: string, value: any) => {
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  parameters: {
                    ...node.data.parameters,
                    [paramName]: value,
                  },
                  lastModified: Date.now(),
                },
              };
            }
            return node;
          })
        );
      },
      {
        debounceTime: 300,
        immediate: false,
      }
    ),
    [id, setNodes]
  );

  // 同步外部参数变化到本地状态
  useEffect(() => {
    setLocalParams(data.parameters || {});
  }, [data.parameters]);

  // 清理参数更新器 - Requirements: 9.3
  useEffect(() => {
    return () => {
      parameterUpdater.cancel();
    };
  }, [parameterUpdater]);

  // 处理参数更新 - Requirements: 9.3
  const handleParameterChange = useCallback((paramName: string, value: any) => {
    // 更新本地状态
    setLocalParams(prev => {
      const newParams = {
        ...prev,
        [paramName]: value,
      };

      // 验证参数
      if (nodeDefinition) {
        const param = nodeDefinition.parameters.find(p => p.name === paramName);
        if (param) {
          const validation = ParameterValidationService.validateParameter(param, value);
          
          setValidationErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            if (!validation.valid && validation.error) {
              newErrors[paramName] = validation.error;
            } else {
              delete newErrors[paramName];
            }
            return newErrors;
          });
        }
      }

      // 使用优化的参数更新器 - Requirements: 9.3
      parameterUpdater.update(paramName, value);

      return newParams;
    });
  }, [nodeDefinition, parameterUpdater]);

  // 处理折叠/展开
  const handleToggleCollapse = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
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
  }, [id, setNodes]);

  // 处理打开高级设置
  const handleOpenAdvanced = useCallback(() => {
    setShowAdvancedModal(true);
    // TODO: 实际实现中应该打开EnhancedNodeConfigModal
    console.log('Open advanced settings for node:', id);
  }, [id]);

  // 计算节点布局模式
  const layoutMode = useMemo(() => {
    if (parameterCount < 3) return 'compact';
    if (parameterCount <= 6) return 'standard';
    return 'extended';
  }, [parameterCount]);

  // 计算节点尺寸
  // Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.2, 8.3, 8.4
  const nodeSize = useMemo(() => {
    // 如果正在调整大小，使用当前尺寸
    if (isResizing && currentSize) {
      return {
        width: currentSize.width,
        height: currentSize.height,
        mode: layoutMode,
      };
    }
    
    // 如果有自定义尺寸，使用自定义尺寸
    const customSize = data.customSize;
    if (customSize) {
      return {
        ...customSize,
        mode: layoutMode,
      };
    }

    // 最小宽度200px，最大宽度400px
    const minWidth = 200;
    const maxWidth = 400;
    
    // 折叠状态：固定尺寸
    if (data.isCollapsed) {
      return { 
        width: 280, 
        height: 80,
        mode: 'collapsed' as const
      };
    }

    // 根据布局模式调整尺寸
    let width: number;
    let baseHeight: number;
    
    switch (layoutMode) {
      case 'compact':
        // 紧凑布局：少于3个参数
        width = Math.max(minWidth, 240);
        baseHeight = 80;
        break;
      case 'standard':
        // 标准布局：3-6个参数
        width = Math.max(minWidth, 280);
        baseHeight = 80;
        break;
      case 'extended':
        // 扩展布局：超过6个参数，提供滚动
        width = Math.min(maxWidth, 320);
        baseHeight = 80;
        break;
      default:
        width = 280;
        baseHeight = 80;
    }

    // 根据参数数量计算高度
    const paramHeight = parameterCount * 60; // 每个参数约60px
    const maxHeight = layoutMode === 'extended' ? 400 : 500;
    const calculatedHeight = Math.min(baseHeight + paramHeight, maxHeight);

    return {
      width,
      height: calculatedHeight,
      mode: layoutMode,
    };
  }, [data.customSize, data.isCollapsed, parameterCount, layoutMode, isResizing, currentSize]);

  // 获取节点样式 - 使用黑白灰主题
  // Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3
  const nodeStyle = useMemo(() => {
    const nodeBg = getCSSVariable('--node-bg', '#FFFFFF');
    const nodeBorder = getCSSVariable('--node-border', '#E5E5E5');
    const nodeBorderHover = getCSSVariable('--node-border-hover', '#CCCCCC');
    const nodeSelected = getCSSVariable('--node-selected', '#000000');
    const nodeSelectedGlow = getCSSVariable('--node-selected-glow', 'rgba(0, 0, 0, 0.1)');
    const shadowBase = getCSSVariable('--node-shadow', '0 2px 8px rgba(0, 0, 0, 0.08)');
    const shadowHover = getCSSVariable('--node-shadow-hover', '0 4px 16px rgba(0, 0, 0, 0.12)');
    const shadowSelected = getCSSVariable('--node-shadow-selected', '0 8px 24px rgba(0, 0, 0, 0.16)');

    const baseStyle = {
      width: `${nodeSize.width}px`,
      minWidth: '200px',
      maxWidth: '600px',
      minHeight: data.isCollapsed ? '80px' : '150px',
      maxHeight: data.isCollapsed ? '80px' : '800px',
      background: nodeBg,
      border: `2px solid ${
        isResizing 
          ? nodeSelected 
          : selected 
            ? nodeSelected 
            : nodeBorder
      }`,
      borderRadius: '8px',
      boxShadow: isResizing
        ? `0 0 0 4px ${nodeSelectedGlow}, ${shadowSelected}`
        : selected 
          ? `0 0 0 3px ${nodeSelectedGlow}, ${shadowSelected}`
          : shadowBase,
      overflow: 'hidden',
      transition: isResizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: isResizing ? 'nwse-resize' : 'default',
    };

    return baseStyle;
  }, [nodeSize, data.isCollapsed, selected, isResizing]);

  // 如果节点定义不存在，显示错误
  if (!nodeDefinition) {
    return (
      <div style={{ ...nodeStyle, padding: '16px' }}>
        <div style={{ color: '#EF4444', fontSize: '14px' }}>
          未知的节点类型: {data.type}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: data.color,
          width: 10,
          height: 10,
          border: '2px solid #0A192F',
        }}
      />

      {/* 节点主体 - Requirements: 2.5, 7.1, 7.2, 8.1, 8.2, 9.2 */}
      <motion.div
        className="hw-accelerated node-hover-animation node-selected-animation"
        style={nodeStyle}
        initial={false}
        animate={{
          scale: selected ? 1.02 : 1,
          borderColor: selected 
            ? getCSSVariable('--node-selected', '#000000')
            : getCSSVariable('--node-border', '#E5E5E5'),
        }}
        whileHover={{
          y: -2,
          borderColor: getCSSVariable('--node-border-hover', '#CCCCCC'),
          transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
        }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        role="article"
        aria-label={`${data.label} 工作流节点`}
        aria-describedby={`node-${id}-description`}
        tabIndex={0}
        onKeyDown={(e) => {
          // 键盘导航支持 - Requirements: 8.1, 8.2
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // 空格键或回车键切换折叠状态
            handleToggleCollapse();
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            // Delete键删除节点（需要确认）
            e.preventDefault();
            console.log('Delete node:', id);
            // TODO: 实现删除确认对话框
          }
        }}
      >
        {/* 节点头部 */}
        <NodeHeader
          icon={data.icon}
          label={data.label}
          color={data.color}
          isCollapsed={data.isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenAdvanced={handleOpenAdvanced}
          parameterCount={parameterCount}
          hasErrors={hasErrors}
        />

        {/* 参数列表（展开时显示） - Requirements: 2.5, 7.1, 9.2 */}
        <AnimatePresence mode="wait">
          {!data.isCollapsed && (
            <motion.div
              className="hw-accelerated node-expand-animation"
              initial={{ 
                height: 0, 
                opacity: 0,
                y: -10,
                scale: 0.95
              }}
              animate={{ 
                height: 'auto', 
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                y: -10,
                scale: 0.95
              }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0, 0.2, 1],
                height: { duration: 0.3 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.2 }
              }}
              style={{
                overflow: 'hidden',
                transformOrigin: 'top',
              }}
            >
              <div 
                style={{ 
                  padding: '12px',
                  maxHeight: layoutMode === 'extended' ? '320px' : 'none',
                  overflowY: layoutMode === 'extended' ? 'auto' : 'visible',
                }}
                className={layoutMode === 'extended' ? 'custom-scrollbar' : ''}
              >
                <ParameterList
                  parameters={nodeDefinition.parameters}
                  values={localParams}
                  onChange={handleParameterChange}
                  errors={validationErrors}
                  isCompact={layoutMode === 'compact'}
                  showPriorityOnly={false}
                  containerWidth={nodeSize.width}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 状态指示器 */}
        <NodeStatusIndicator status={data.status} />

        {/* 运行中的进度条 - Requirements: 9.2 */}
        {data.status === 'running' && (
          <motion.div
            className="hw-accelerated progress-bar-animation"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #F59E0B, #D97706)',
              borderRadius: '0 0 6px 6px',
              transformOrigin: 'left center',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* 调整大小手柄 - Requirements: 1.1, 4.1 */}
        {!data.isCollapsed && (
          <ResizeHandle 
            onMouseDown={handleResizeStart}
            isResizing={isResizing}
          />
        )}

        {/* 调整大小时的尺寸指示器 - Requirements: 7.5 */}
        {currentSize && (
          <SizeIndicator
            width={currentSize.width}
            height={currentSize.height}
            isVisible={isResizing}
            position="center"
          />
        )}
        
        {/* 隐藏的节点描述，用于屏幕阅读器 - Requirements: 8.2, 8.3 */}
        <span id={`node-${id}-description`} style={{ display: 'none' }}>
          {data.label}节点，类型：{data.category}，
          {data.isCollapsed ? '已折叠' : '已展开'}，
          包含{parameterCount}个参数，
          状态：{data.status === 'idle' ? '空闲' : data.status === 'running' ? '运行中' : data.status === 'success' ? '成功' : '错误'}
          {hasErrors && '，有未配置的必填参数'}
        </span>
      </motion.div>

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: data.color,
          width: 10,
          height: 10,
          border: '2px solid #0A192F',
        }}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在关键props变化时重新渲染 - Requirements: 9.4
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data.label === nextProps.data.label &&
    prevProps.data.isCollapsed === nextProps.data.isCollapsed &&
    prevProps.data.status === nextProps.data.status &&
    prevProps.data.lastModified === nextProps.data.lastModified &&
    JSON.stringify(prevProps.data.parameters) === JSON.stringify(nextProps.data.parameters) &&
    JSON.stringify(prevProps.data.customSize) === JSON.stringify(nextProps.data.customSize)
  );
});

InlineParameterNode.displayName = 'InlineParameterNode';

/**
 * NodeStatusIndicator Component
 * 节点状态指示器 - 黑白灰主题
 * 
 * Requirements: 5.4
 * 
 * 性能优化 (Requirements: 9.4):
 * - 使用React.memo避免不必要的重渲染
 * - 使用useMemo缓存配置计算
 */
interface NodeStatusIndicatorProps {
  status: NodeStatus;
}

const NodeStatusIndicator: React.FC<NodeStatusIndicatorProps> = React.memo(({ status }) => {
  const statusConfig = useMemo(() => {
    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    
    switch (status) {
      case 'running':
        // 运行状态：灰色动画
        return {
          color: isDark ? '#999999' : '#666666',
          animation: true,
          pulseSpeed: 1.5,
        };
      case 'success':
        // 成功状态：深灰/浅灰
        return {
          color: isDark ? '#CCCCCC' : '#333333',
          animation: false,
          pulseSpeed: 0,
        };
      case 'error':
        // 错误状态：红色（唯一的彩色元素）
        return {
          color: isDark ? '#EF4444' : '#DC2626',
          animation: true,
          pulseSpeed: 2,
        };
      case 'idle':
      default:
        // 空闲状态：中灰色
        return {
          color: isDark ? '#666666' : '#999999',
          animation: false,
          pulseSpeed: 0,
        };
    }
  }, [status]);

  return (
    <div style={{ position: 'relative' }}>
      {/* 外层光晕效果 - Requirements: 5.4, 9.2 */}
      {statusConfig.animation && (
        <motion.div
          className="hw-accelerated status-glow-pulse"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${statusConfig.color}40, transparent)`,
          }}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: statusConfig.pulseSpeed,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
      
      {/* 主状态指示器 - Requirements: 9.2 */}
      <motion.div
        className="hw-accelerated status-pulse"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: statusConfig.color,
          boxShadow: `0 0 8px ${statusConfig.color}`,
        }}
        animate={statusConfig.animation ? {
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        } : {}}
        transition={{
          duration: statusConfig.pulseSpeed,
          repeat: statusConfig.animation ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在状态变化时重新渲染 - Requirements: 9.4
  return prevProps.status === nextProps.status;
});

NodeStatusIndicator.displayName = 'NodeStatusIndicator';

export default InlineParameterNode;
