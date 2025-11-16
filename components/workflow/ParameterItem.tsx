'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeParameter } from '@/lib/workflow/nodeDefinitions';
import ParameterEditor from './editors/ParameterEditor';
import ParameterDisplay from './ParameterDisplay';
import { Tooltip } from '@heroui/react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import styles from '@/styles/ParameterItem.module.css';

interface ParameterItemProps {
  parameter: NodeParameter;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isCompact?: boolean;
}

/**
 * ParameterItem Component
 * 单个参数的显示和编辑组件
 * 
 * 功能:
 * - 点击进入编辑模式
 * - 失焦自动保存参数
 * - 悬停显示参数描述
 * - 集成参数编辑器
 * - 显示错误提示
 * - 编辑光晕效果
 * - 保存状态指示器
 * - 验证错误动画
 * 
 * 性能优化 (Requirements: 9.4):
 * - 使用React.memo避免不必要的重渲染
 * - 使用useCallback缓存事件处理函数
 */
const ParameterItem: React.FC<ParameterItemProps> = React.memo(({
  parameter,
  value,
  onChange,
  error,
  isCompact = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  // 进入编辑模式
  const handleClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
      setLocalValue(value);
    }
  }, [isEditing, value]);

  // 处理值变化
  const handleChange = useCallback((newValue: any) => {
    setLocalValue(newValue);
  }, []);

  // 失焦保存
  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // 只有当值真正改变时才触发onChange
    if (localValue !== value) {
      setIsSaving(true);
      onChange(localValue);
      // 显示保存成功动画
      setTimeout(() => {
        setIsSaving(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 600);
      }, 100);
    }
  }, [localValue, value, onChange]);

  // 监听外部值变化
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // 监听错误状态变化 - 触发错误抖动动画
  useEffect(() => {
    if (error) {
      setShowError(true);
      setErrorShake(true);
      // 错误抖动动画持续500ms
      const shakeTimer = setTimeout(() => setErrorShake(false), 500);
      // 错误提示显示2秒后淡出
      const errorTimer = setTimeout(() => setShowError(false), 2000);
      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(errorTimer);
      };
    } else {
      setShowError(false);
      setErrorShake(false);
    }
  }, [error]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter键保存（除非是多行文本）
      if (parameter.type !== 'textarea') {
        e.preventDefault();
        handleBlur();
      }
    } else if (e.key === 'Escape') {
      // Escape键取消编辑
      e.preventDefault();
      setLocalValue(value);
      setIsEditing(false);
    }
  }, [parameter.type, value, handleBlur]);

  // 构建CSS类名
  const itemClassName = [
    styles.parameterItem,
    isEditing ? styles.editing : '',
    error ? styles.error : '',
    isCompact ? styles.compact : '',
    showSaveSuccess ? styles.saveSuccess : '',
    errorShake ? styles.errorShake : '',
    isSaving ? styles.saving : ''
  ].filter(Boolean).join(' ');

  // 参数项内容
  const parameterContent = (
    <motion.div 
      className={itemClassName}
      onClick={handleClick}
      onKeyDown={(e) => {
        // 增强键盘导航 - Requirements: 8.1, 8.2
        if (e.key === 'Enter' || e.key === ' ') {
          if (!isEditing) {
            e.preventDefault();
            handleClick();
          }
        } else if (e.key === 'Escape') {
          if (isEditing) {
            e.preventDefault();
            setLocalValue(value);
            setIsEditing(false);
          }
        } else if (e.key === 'Tab') {
          // Tab键在编辑模式下保存并移动到下一个参数
          if (isEditing) {
            handleBlur();
          }
        }
        // 传递给子组件的键盘事件
        handleKeyDown(e);
      }}
      role="group"
      aria-label={`${parameter.label}参数${parameter.required ? '（必填）' : ''}`}
      aria-invalid={!!error}
      aria-describedby={error ? `param-error-${parameter.name}` : parameter.description ? `param-desc-${parameter.name}` : undefined}
      tabIndex={0}
      initial={false}
      animate={
        errorShake ? {
          x: [0, -8, 8, -8, 8, 0],
          transition: { duration: 0.5, ease: 'easeInOut' }
        } : showSaveSuccess ? {
          scale: [1, 1.02, 1],
          borderColor: ['var(--param-border)', 'var(--success-color)', 'var(--param-border)'],
          transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
        } : {}
      }
    >
      {/* 参数标签 */}
      <div className={styles.parameterLabel}>
        <span className={styles.labelText}>{parameter.label}</span>
        {parameter.required && (
          <span className={styles.required} title="必填项">*</span>
        )}
        
        {/* 保存状态指示器 */}
        <AnimatePresence mode="wait">
          {isSaving && (
            <motion.div
              className={styles.statusIndicator}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 size={14} className={styles.spinningIcon} />
            </motion.div>
          )}
          {showSaveSuccess && !isSaving && (
            <motion.div
              className={styles.statusIndicator}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Check size={14} className={styles.successIcon} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 参数值 */}
      <div className={styles.parameterValue}>
        {isEditing ? (
          <ParameterEditor
            parameter={parameter}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus={true}
          />
        ) : (
          <ParameterDisplay
            parameter={parameter}
            value={value}
          />
        )}
      </div>

      {/* 错误提示 - 带动画 */}
      <AnimatePresence>
        {error && showError && (
          <motion.div 
            id={`param-error-${parameter.name}`}
            className={styles.parameterError}
            role="alert"
            aria-live="polite"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <AlertCircle size={12} className={styles.errorIcon} aria-hidden="true" />
            <span className={styles.errorText}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 隐藏的参数描述，用于屏幕阅读器 */}
      {parameter.description && (
        <span id={`param-desc-${parameter.name}`} style={{ display: 'none' }}>
          {parameter.description}
        </span>
      )}
    </motion.div>
  );

  // 如果有描述，使用Tooltip包裹 - Requirements: 8.5
  if (parameter.description && !isEditing) {
    return (
      <Tooltip
        content={
          <div style={{ padding: '4px 8px', maxWidth: '300px' }}>
            {/* 参数名称 */}
            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '13px' }}>
              {parameter.label}
              {parameter.required && (
                <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
              )}
            </div>
            
            {/* 参数描述 */}
            <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.5', marginBottom: '6px' }}>
              {parameter.description}
            </div>
            
            {/* 参数类型和默认值 */}
            <div style={{ fontSize: '11px', opacity: 0.7, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '6px' }}>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ opacity: 0.6 }}>类型: </span>
                <span style={{ fontFamily: 'monospace' }}>{parameter.type}</span>
              </div>
              {parameter.defaultValue !== undefined && (
                <div style={{ marginBottom: '2px' }}>
                  <span style={{ opacity: 0.6 }}>默认值: </span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {typeof parameter.defaultValue === 'object' 
                      ? JSON.stringify(parameter.defaultValue) 
                      : String(parameter.defaultValue)}
                  </span>
                </div>
              )}
              {parameter.required && (
                <div style={{ color: '#EF4444', marginTop: '4px' }}>
                  ⚠ 此参数为必填项
                </div>
              )}
            </div>
            
            {/* 操作提示 */}
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '8px', fontStyle: 'italic' }}>
              点击编辑 • Enter保存 • Esc取消
            </div>
          </div>
        }
        placement="top"
        delay={500}
        closeDelay={0}
        classNames={{
          base: 'max-w-md',
          content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
        }}
      >
        {parameterContent}
      </Tooltip>
    );
  }

  return parameterContent;
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在关键props变化时重新渲染 - Requirements: 9.4
  return (
    prevProps.parameter.name === nextProps.parameter.name &&
    prevProps.value === nextProps.value &&
    prevProps.error === nextProps.error &&
    prevProps.isCompact === nextProps.isCompact &&
    prevProps.parameter.type === nextProps.parameter.type &&
    prevProps.parameter.required === nextProps.parameter.required
  );
});

ParameterItem.displayName = 'ParameterItem';

export default ParameterItem;
