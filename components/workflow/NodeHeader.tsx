'use client';

import React from 'react';
import { LucideIcon, ChevronDown, Settings, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';
import { Tooltip } from '@heroui/react';

/**
 * NodeHeader组件属性接口
 */
export interface NodeHeaderProps {
  /** 节点图标组件 */
  icon: LucideIcon;
  /** 节点标题 */
  label: string;
  /** 节点颜色（用于图标和边框） */
  color: string;
  /** 是否折叠参数区域 */
  isCollapsed: boolean;
  /** 折叠/展开切换回调 */
  onToggleCollapse: () => void;
  /** 打开高级设置回调 */
  onOpenAdvanced: () => void;
  /** 参数数量（折叠时显示） */
  parameterCount: number;
  /** 是否有验证错误（未配置必填参数） */
  hasErrors: boolean;
}

/**
 * NodeHeader组件
 * 
 * 节点头部组件，包含：
 * - 节点图标和标题
 * - 折叠/展开按钮（带动画）
 * - 高级设置按钮
 * - 参数数量徽章（折叠时显示）
 * - 错误警告图标（有未配置必填参数时显示）
 * 
 * 折叠/展开功能：
 * - 点击折叠按钮切换参数区域显示
 * - 折叠时显示参数数量徽章
 * - 展开时隐藏徽章，显示完整参数列表
 * - 使用framer-motion提供流畅的动画效果
 * 
 * 性能优化 (Requirements: 9.4):
 * - 使用React.memo避免不必要的重渲染
 * - 使用useMemo缓存样式计算
 * - 使用useCallback缓存事件处理函数
 * 
 * @example
 * ```tsx
 * <NodeHeader
 *   icon={Plane}
 *   label="起飞"
 *   color="#64FFDA"
 *   isCollapsed={false}
 *   onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
 *   onOpenAdvanced={() => setShowModal(true)}
 *   parameterCount={3}
 *   hasErrors={false}
 * />
 * ```
 */
const NodeHeader: React.FC<NodeHeaderProps> = React.memo(({
  icon: Icon,
  label,
  color,
  isCollapsed,
  onToggleCollapse,
  onOpenAdvanced,
  parameterCount,
  hasErrors
}) => {
  const theme = useWorkflowTheme();
  
  // Validate that Icon is a valid component
  if (!Icon || typeof Icon !== 'function') {
    console.error('NodeHeader: Invalid icon prop received:', Icon);
    return null;
  }

  // 缓存容器样式 - Requirements: 9.4
  const containerStyle = React.useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: isCollapsed ? 'none' : `1px solid ${theme.node.divider}`,
    background: theme.node.headerBg,
    transition: 'all 0.2s ease',
  }), [isCollapsed, theme.node.divider, theme.node.headerBg]);

  // 缓存左侧区域样式 - Requirements: 9.4
  const leftSectionStyle = React.useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  }), []);

  // 缓存右侧区域样式 - Requirements: 9.4
  const rightSectionStyle = React.useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }), []);

  // 缓存图标样式 - Requirements: 9.4
  const iconStyle = React.useMemo(() => ({
    color: theme.text.primary,
    flexShrink: 0,
    strokeWidth: 2,
  }), [theme.text.primary]);

  // 缓存标题样式 - Requirements: 9.4
  const titleStyle = React.useMemo(() => ({
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    letterSpacing: '-0.01em',
  }), [theme.text.primary]);

  // 缓存徽章样式 - Requirements: 9.4
  const badgeStyle = React.useMemo(() => ({
    padding: '4px 10px',
    borderRadius: '12px',
    background: theme.parameter.bg,
    border: `1px solid ${theme.node.border}`,
    fontSize: '12px',
    fontWeight: 600,
    color: theme.text.primary,
    fontVariantNumeric: 'tabular-nums' as const,
    minWidth: '28px',
    textAlign: 'center' as const,
  }), [theme.parameter.bg, theme.node.border, theme.text.primary]);

  // 缓存事件处理函数 - Requirements: 9.4
  const handleToggleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCollapse();
  }, [onToggleCollapse]);

  const handleAdvancedClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenAdvanced();
  }, [onOpenAdvanced]);

  const handleToggleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onToggleCollapse();
    }
  }, [onToggleCollapse]);

  const handleAdvancedKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onOpenAdvanced();
    }
  }, [onOpenAdvanced]);

  return (
    <motion.div 
      className="node-header"
      role="banner"
      aria-label={`${label}节点头部`}
      initial={false}
      animate={{
        borderRadius: isCollapsed ? '8px' : '8px 8px 0 0',
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={containerStyle}
    >
      {/* 左侧：图标、标题和错误指示器 */}
      <div style={leftSectionStyle}>
        {/* 节点图标 */}
        <Tooltip
          content={
            <div style={{ padding: '4px 8px' }}>
              <div style={{ fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                点击节点查看详细信息
              </div>
            </div>
          }
          placement="top"
          delay={800}
          closeDelay={0}
          classNames={{
            base: 'max-w-xs',
            content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon 
              size={24} 
              style={iconStyle}
            />
          </motion.div>
        </Tooltip>

        {/* 节点标题 */}
        <span
          id={`node-title-${label.replace(/\s+/g, '-').toLowerCase()}`}
          role="heading"
          aria-level={2}
          style={titleStyle}
        >
          {label}
        </span>

        {/* 错误警告图标 */}
        {hasErrors && (
          <Tooltip
            content={
              <div style={{ padding: '4px 8px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', color: '#EF4444' }}>
                  配置错误
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  有必填参数未配置
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  请展开参数列表并填写所有必填项
                </div>
              </div>
            }
            placement="top"
            delay={300}
            closeDelay={0}
            classNames={{
              base: 'max-w-xs',
              content: 'bg-red-900 dark:bg-red-100 text-white dark:text-red-900 px-3 py-2 rounded-lg shadow-lg'
            }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              role="alert"
              aria-live="polite"
              aria-label="节点配置错误：有未配置的必填参数"
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <AlertCircle 
                size={18} 
                aria-hidden="true"
                style={{ 
                  color: theme.status.error,
                  flexShrink: 0,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </motion.div>
          </Tooltip>
        )}
      </div>

      {/* 右侧：参数徽章和操作按钮 */}
      <div style={rightSectionStyle}>
        {/* 参数数量徽章（仅在折叠时显示） */}
        {isCollapsed && parameterCount > 0 && (
          <Tooltip
            content={
              <div style={{ padding: '4px 8px' }}>
                <div style={{ fontWeight: 600 }}>
                  {parameterCount} 个参数
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                  点击展开按钮查看所有参数
                </div>
              </div>
            }
            placement="bottom"
            delay={500}
            closeDelay={0}
            classNames={{
              base: 'max-w-xs',
              content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
            }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              role="status"
              aria-label={`${parameterCount}个参数`}
              style={badgeStyle}
            >
              {parameterCount}
            </motion.div>
          </Tooltip>
        )}

        {/* 高级设置按钮 */}
        <Tooltip
          content={
            <div style={{ padding: '4px 8px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>高级设置</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                配置节点的详细参数和选项
              </div>
            </div>
          }
          placement="bottom"
          delay={500}
          closeDelay={0}
          classNames={{
            base: 'max-w-xs',
            content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
          }}
        >
          <motion.button
            onClick={handleAdvancedClick}
            onKeyDown={handleAdvancedKeyDown}
            whileHover={{ 
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="打开高级设置"
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.parameter.bgHover;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.text.secondary;
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.parameter.borderEditing}`;
              e.currentTarget.style.background = theme.parameter.bgHover;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Settings 
              size={16} 
              style={{ 
                color: theme.text.secondary,
                strokeWidth: 2,
                transition: 'color 0.2s ease',
              }}
            />
          </motion.button>
        </Tooltip>

        {/* 折叠/展开按钮 */}
        <Tooltip
          content={
            <div style={{ padding: '4px 8px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {isCollapsed ? '展开参数' : '折叠参数'}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {isCollapsed 
                  ? `显示 ${parameterCount} 个参数的详细配置` 
                  : '隐藏参数列表以节省空间'}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
                快捷键: 空格键
              </div>
            </div>
          }
          placement="bottom"
          delay={500}
          closeDelay={0}
          classNames={{
            base: 'max-w-xs',
            content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
          }}
        >
          <motion.button
            onClick={handleToggleClick}
            onKeyDown={handleToggleKeyDown}
            whileHover={{ 
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            aria-label={isCollapsed ? '展开参数列表' : '折叠参数列表'}
            aria-expanded={!isCollapsed}
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.parameter.bgHover;
              e.currentTarget.style.color = theme.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.text.secondary;
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.parameter.borderEditing}`;
              e.currentTarget.style.background = theme.parameter.bgHover;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <ChevronDown 
                size={16} 
                style={{ 
                  color: theme.text.secondary,
                  strokeWidth: 2,
                  transition: 'color 0.2s ease',
                }}
              />
            </motion.div>
          </motion.button>
        </Tooltip>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在关键props变化时重新渲染 - Requirements: 9.4
  return (
    prevProps.label === nextProps.label &&
    prevProps.isCollapsed === nextProps.isCollapsed &&
    prevProps.parameterCount === nextProps.parameterCount &&
    prevProps.hasErrors === nextProps.hasErrors &&
    prevProps.color === nextProps.color &&
    prevProps.icon === nextProps.icon
  );
});

NodeHeader.displayName = 'NodeHeader';

export default NodeHeader;
