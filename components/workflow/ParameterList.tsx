'use client';

import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeParameter } from '@/lib/workflow/nodeDefinitions';
import ParameterItem from './ParameterItem';
import VirtualizedParameterList from './VirtualizedParameterList';
import styles from '@/styles/ParameterList.module.css';
import { parameterListVariants, staggerConfig } from '@/lib/workflow/nodeAnimations';
import { optimizeScrollHandler } from '@/lib/workflow/performanceUtils';

// 虚拟化阈值：参数数量超过此值时使用虚拟滚动
const VIRTUALIZATION_THRESHOLD = 10;

interface ParameterListProps {
  parameters: NodeParameter[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
  isCompact?: boolean;
  showPriorityOnly?: boolean;
  containerWidth?: number; // 容器宽度，用于响应式布局
  isExpanded?: boolean; // 是否展开状态，用于动画
}

/**
 * 获取参数的优先级
 */
const getParameterPriority = (param: NodeParameter): number => {
  return (param as any).priority || 0;
};

/**
 * 判断参数是否为优先级参数
 */
const isPriorityParameter = (param: NodeParameter): boolean => {
  return getParameterPriority(param) > 0 || param.required === true;
};

/**
 * ParameterList Component
 * 参数列表容器组件
 * 
 * 功能:
 * - 渲染参数项列表
 * - 支持紧凑模式和标准模式
 * - 支持参数分组
 * - 支持优先级过滤
 * - 紧凑模式下仅显示优先级参数
 * - 标准模式下显示所有参数
 * - 支持淡入动画和展开/折叠动画 Requirements: 7.1
 * - 优化滚动性能 Requirements: 9.1
 * 
 * 性能优化 (Requirements: 9.4):
 * - 使用React.memo避免不必要的重渲染
 * - 使用useMemo缓存计算结果
 * - 使用useCallback缓存事件处理函数
 */
const ParameterList: React.FC<ParameterListProps> = React.memo(({
  parameters,
  values,
  onChange,
  errors = {},
  isCompact = false,
  showPriorityOnly = false,
  containerWidth,
  isExpanded = true
}) => {
  // 使用 ref 优化滚动性能 Requirements: 9.1
  const listRef = useRef<HTMLDivElement>(null);
  
  // 使用 useCallback 缓存滚动处理函数，避免重复创建 - Requirements: 9.4
  const handleScrollCallback = useCallback((event: Event) => {
    // 滚动事件处理（如果需要）
    // 这里可以添加虚拟滚动或懒加载逻辑
    const target = event.target as HTMLDivElement;
    if (target) {
      // 可以在这里添加滚动位置追踪、懒加载等逻辑
      // console.log('Scroll position:', target.scrollTop);
    }
  }, []);

  // 使用节流优化滚动事件 - Requirements: 9.3
  const { handler: handleScroll, cleanup: cleanupScroll } = useMemo(
    () => optimizeScrollHandler(handleScrollCallback, {
      throttleTime: 16, // ~60fps
      useRAF: true,
      passive: true,
    }),
    [handleScrollCallback]
  );

  // 清理滚动事件监听器 - Requirements: 9.3
  useEffect(() => {
    return () => {
      cleanupScroll();
    };
  }, [cleanupScroll]);

  // 缓存onChange处理函数 - Requirements: 9.4
  const handleParameterChange = useCallback((name: string, value: any) => {
    onChange(name, value);
  }, [onChange]);
  // 根据容器宽度决定布局模式
  // Requirements: 8.5
  const layoutMode = useMemo(() => {
    if (!containerWidth) return 'single'; // 默认单列
    
    // 宽度较小时使用单列布局
    if (containerWidth < 350) return 'single';
    
    // 宽度较大时使用双列布局
    if (containerWidth >= 450) return 'double';
    
    // 中等宽度使用单列
    return 'single';
  }, [containerWidth]);
  // 过滤和排序参数
  const filteredParameters = useMemo(() => {
    let filtered = [...parameters];

    // 如果只显示优先级参数，过滤掉非优先级参数
    // 紧凑模式下仅显示优先级参数，标准模式下显示所有参数
    if (showPriorityOnly || isCompact) {
      filtered = filtered.filter(isPriorityParameter);
    }

    // 按优先级排序（优先级高的在前）
    filtered.sort((a, b) => {
      const priorityA = getParameterPriority(a);
      const priorityB = getParameterPriority(b);
      
      // 优先级相同时，必填参数在前
      if (priorityA === priorityB) {
        if (a.required && !b.required) return -1;
        if (!a.required && b.required) return 1;
        return 0;
      }
      
      return priorityB - priorityA;
    });

    return filtered;
  }, [parameters, showPriorityOnly, isCompact]);

  // 按分组组织参数
  const groupedParameters = useMemo(() => {
    const groups: Record<string, NodeParameter[]> = {};
    
    filteredParameters.forEach(param => {
      const group = (param as any).group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(param);
    });

    return groups;
  }, [filteredParameters]);

  // 判断是否有分组
  const hasGroups = Object.keys(groupedParameters).length > 1 || 
                    !groupedParameters['default'];

  // 渲染单个参数项 - 添加淡入动画 Requirements: 7.1, 8.2, 8.3
  // 使用useCallback缓存渲染函数 - Requirements: 9.4
  const renderParameterItem = useCallback((param: NodeParameter, index: number) => {
    // 检查条件显示
    const showWhen = (param as any).showWhen;
    if (showWhen && typeof showWhen === 'function') {
      if (!showWhen(values)) {
        return null;
      }
    }

    return (
      <motion.div
        key={param.name}
        role="listitem"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.2,
          delay: index * 0.03, // 交错动画效果
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <ParameterItem
          parameter={param}
          value={values[param.name] ?? param.defaultValue}
          onChange={(value) => handleParameterChange(param.name, value)}
          error={errors[param.name]}
          isCompact={isCompact}
        />
      </motion.div>
    );
  }, [values, errors, isCompact, handleParameterChange]);

  // 渲染参数组 - 添加组级动画 Requirements: 7.1
  // 使用useCallback缓存渲染函数 - Requirements: 9.4
  const renderParameterGroup = useCallback((groupName: string, params: NodeParameter[], groupIndex: number) => {
    const visibleParams = params.filter(param => {
      const showWhen = (param as any).showWhen;
      if (showWhen && typeof showWhen === 'function') {
        return showWhen(values);
      }
      return true;
    });
    
    if (visibleParams.length === 0) {
      return null;
    }

    // 如果是默认组且没有其他组，不显示组标题
    if (groupName === 'default' && !hasGroups) {
      return (
        <AnimatePresence mode="popLayout" key={groupName}>
          {visibleParams.map((param, index) => renderParameterItem(param, index))}
        </AnimatePresence>
      );
    }

    return (
      <motion.div
        key={groupName}
        className={styles.parameterGroup}
        role="group"
        aria-label={groupName !== 'default' ? `${groupName}参数组` : '参数组'}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.3,
          delay: groupIndex * 0.05, // 组之间的交错延迟
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {groupName !== 'default' && (
          <div className={styles.groupTitle} role="heading" aria-level={3}>
            {groupName}
          </div>
        )}
        <div className={styles.groupItems} role="list">
          <AnimatePresence mode="popLayout">
            {visibleParams.map((param, index) => renderParameterItem(param, index))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }, [hasGroups, renderParameterItem]);

  // 如果没有参数，显示提示
  if (filteredParameters.length === 0) {
    return (
      <div 
        className={styles.emptyState}
        role="status"
        aria-label={showPriorityOnly ? '无优先级参数' : '无参数'}
      >
        {showPriorityOnly ? '无优先级参数' : '无参数'}
      </div>
    );
  }

  // 如果参数数量超过阈值且没有分组，使用虚拟化列表
  if (filteredParameters.length > VIRTUALIZATION_THRESHOLD && !hasGroups) {
    return (
      <VirtualizedParameterList
        parameters={parameters}
        values={values}
        onChange={onChange}
        errors={errors}
        isCompact={isCompact}
        showPriorityOnly={showPriorityOnly}
        height={isCompact ? 300 : 400}
        itemHeight={isCompact ? 50 : 60}
      />
    );
  }

  // 标准渲染（支持分组和响应式布局）- 添加展开/折叠动画 Requirements: 7.1, 8.2, 8.3
  return (
    <motion.div
      ref={listRef}
      className={`${styles.parameterList} ${isCompact ? styles.compact : ''} ${
        layoutMode === 'double' ? styles.doubleColumn : styles.singleColumn
      }`}
      role="list"
      aria-label="节点参数列表"
      aria-live="polite"
      initial={false}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={parameterListVariants}
      onScroll={(e) => handleScroll(e.nativeEvent)}
      style={{
        // 优化滚动性能 Requirements: 9.1
        willChange: 'scroll-position',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <AnimatePresence mode="popLayout">
        {isExpanded && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
              initial: {},
              animate: {
                transition: staggerConfig.parameterList,
              },
              exit: {},
            }}
          >
            {hasGroups ? (
              Object.entries(groupedParameters).map(([groupName, params], index) =>
                renderParameterGroup(groupName, params, index)
              )
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredParameters.map((param, index) => renderParameterItem(param, index))}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在关键props变化时重新渲染 - Requirements: 9.4
  return (
    prevProps.parameters.length === nextProps.parameters.length &&
    prevProps.isCompact === nextProps.isCompact &&
    prevProps.showPriorityOnly === nextProps.showPriorityOnly &&
    prevProps.containerWidth === nextProps.containerWidth &&
    prevProps.isExpanded === nextProps.isExpanded &&
    JSON.stringify(prevProps.values) === JSON.stringify(nextProps.values) &&
    JSON.stringify(prevProps.errors) === JSON.stringify(nextProps.errors)
  );
});

ParameterList.displayName = 'ParameterList';

export default ParameterList;

// Export helper functions for use in other components
export { getParameterPriority, isPriorityParameter };
