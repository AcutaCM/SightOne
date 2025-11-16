'use client';

import React, { useEffect } from 'react';
import { Switch } from "@heroui/switch";
import { Tooltip } from '@heroui/react';

interface BooleanEditorProps {
  value: boolean;
  onChange: (value: boolean) => void;
  onBlur?: () => void;
  label?: string;
  description?: string;
  autoFocus?: boolean;
}

/**
 * BooleanEditor Component
 * 
 * 布尔值参数编辑器，使用开关组件
 * 
 * Requirements: 8.5 - 为参数添加工具提示
 */
const BooleanEditor: React.FC<BooleanEditorProps> = ({
  value,
  onChange,
  onBlur,
  label,
  description,
  autoFocus = false
}) => {
  useEffect(() => {
    // For boolean editor, we don't need to focus the element
    // but we can trigger onBlur after a short delay if autoFocus is true
    if (autoFocus && onBlur) {
      const timer = setTimeout(() => {
        onBlur();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, onBlur]);

  const handleValueChange = (checked: boolean) => {
    onChange(checked);
    // Automatically blur after change for inline editing
    if (onBlur) {
      setTimeout(() => {
        onBlur();
      }, 100);
    }
  };

  const switchContent = (
    <div className="boolean-editor flex items-center gap-2">
      <Switch
        isSelected={value}
        onValueChange={handleValueChange}
        size="sm"
        classNames={{
          wrapper: "group-data-[selected=true]:bg-[#64FFDA]",
          thumb: "group-data-[selected=true]:bg-white"
        }}
        aria-label={label || '布尔开关'}
      >
        {label && <span className="text-white text-sm">{label}</span>}
      </Switch>
      {description && (
        <p className="text-xs text-gray-400 ml-2">{description}</p>
      )}
      <div className="flex items-center gap-2 ml-2">
        <span className={`text-xs font-medium ${value ? 'text-[#64FFDA]' : 'text-gray-400'}`}>
          {value ? '开' : '关'}
        </span>
      </div>
    </div>
  );

  // 如果有描述，使用Tooltip包裹 - Requirements: 8.5
  if (description) {
    return (
      <Tooltip
        content={
          <div style={{ padding: '4px 8px', maxWidth: '280px' }}>
            {/* 参数说明 */}
            <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.5', marginBottom: '6px' }}>
              {description}
            </div>
            
            {/* 当前状态 */}
            <div style={{ fontSize: '11px', opacity: 0.7, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '6px' }}>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ opacity: 0.6 }}>当前状态: </span>
                <span style={{ fontWeight: 600, color: value ? '#64FFDA' : '#999' }}>
                  {value ? '开启' : '关闭'}
                </span>
              </div>
            </div>
            
            {/* 操作提示 */}
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '8px', fontStyle: 'italic' }}>
              点击开关切换状态
            </div>
          </div>
        }
        placement="top"
        delay={500}
        closeDelay={0}
        classNames={{
          base: 'max-w-sm',
          content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
        }}
      >
        {switchContent}
      </Tooltip>
    );
  }

  return switchContent;
};

export default BooleanEditor;
