'use client';

import React, { useMemo } from 'react';
import { NodeParameter } from '@/lib/workflow/nodeDefinitions';
import ParameterItem from './ParameterItem';
import styles from '@/styles/ParameterList.module.css';

interface VirtualizedParameterListProps {
  parameters: NodeParameter[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
  isCompact?: boolean;
  showPriorityOnly?: boolean;
  height?: number;
  itemHeight?: number;
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
 * VirtualizedParameterList Component
 * 优化的参数列表组件
 * 
 * 功能:
 * - 对于参数数量超过10个的节点使用优化渲染
 * - 使用CSS优化和懒加载提升性能
 * - 支持所有ParameterList的功能
 * 
 * 注意: 使用CSS优化而非虚拟滚动，因为参数项需要交互
 */
const VirtualizedParameterList: React.FC<VirtualizedParameterListProps> = ({
  parameters,
  values,
  onChange,
  errors = {},
  isCompact = false,
  showPriorityOnly = false,
  height = 400,
  itemHeight = 60
}) => {
  // 过滤和排序参数
  const filteredParameters = useMemo(() => {
    let filtered = [...parameters];

    // 如果只显示优先级参数，过滤掉非优先级参数
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

  // 渲染单个参数项
  const renderParameterItem = (param: NodeParameter) => {
    // 检查条件显示
    const showWhen = (param as any).showWhen;
    if (showWhen && typeof showWhen === 'function') {
      if (!showWhen(values)) {
        return null;
      }
    }

    return (
      <ParameterItem
        key={param.name}
        parameter={param}
        value={values[param.name] ?? param.defaultValue}
        onChange={(value) => onChange(param.name, value)}
        error={errors[param.name]}
        isCompact={isCompact}
      />
    );
  };

  // 如果没有参数，显示提示
  if (filteredParameters.length === 0) {
    return (
      <div className={styles.emptyState}>
        {showPriorityOnly ? '无优先级参数' : '无参数'}
      </div>
    );
  }

  return (
    <div 
      className={`${styles.parameterList} ${styles.virtualized} ${isCompact ? styles.compact : ''}`}
      style={{ 
        maxHeight: height,
        overflowY: 'auto',
        // 使用 will-change 提示浏览器优化滚动性能
        willChange: 'scroll-position',
        // 使用 contain 优化渲染性能
        contain: 'layout style paint'
      }}
    >
      {filteredParameters.map(renderParameterItem)}
    </div>
  );
};

export default VirtualizedParameterList;
