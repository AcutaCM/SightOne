'use client';

import React from 'react';
import { NodeParameter } from '@/lib/workflow/nodeDefinitions';
import styles from '@/styles/ParameterItem.module.css';

interface ParameterDisplayProps {
  parameter: NodeParameter;
  value: any;
}

/**
 * ParameterDisplay Component
 * 参数值显示组件
 * 
 * 功能:
 * - 根据参数类型格式化显示值
 * - 区分默认值和自定义值的显示样式
 * - 添加单位显示
 */
const ParameterDisplay: React.FC<ParameterDisplayProps> = ({
  parameter,
  value
}) => {
  // 检查是否为默认值
  const isDefaultValue = value === parameter.defaultValue || 
                         (value === undefined && parameter.defaultValue === undefined) ||
                         (value === null && parameter.defaultValue === null);

  // 格式化显示值
  const formatValue = (): string => {
    // 处理空值
    if (value === undefined || value === null || value === '') {
      return parameter.defaultValue !== undefined 
        ? formatValueByType(parameter.defaultValue)
        : '未设置';
    }

    return formatValueByType(value);
  };

  // 根据类型格式化值
  const formatValueByType = (val: any): string => {
    switch (parameter.type) {
      case 'number':
      case 'slider':
        return formatNumber(val);

      case 'boolean':
        return val ? '开启' : '关闭';

      case 'select':
        return formatSelectValue(val);

      case 'textarea':
        return formatTextarea(val);

      case 'string':
        return val?.toString() || '';

      case 'assistant':
        return formatAssistant(val);

      case 'json':
        return formatJSON(val);

      case 'file':
      case 'image':
        return formatFile(val);

      default:
        return val?.toString() || '';
    }
  };

  // 格式化数字
  const formatNumber = (val: any): string => {
    const num = Number(val);
    if (isNaN(num)) return val?.toString() || '';

    // 如果有单位，添加单位
    const unit = (parameter as any).unit;
    const formattedNum = num.toLocaleString('zh-CN', {
      maximumFractionDigits: 2
    });

    return unit ? `${formattedNum} ${unit}` : formattedNum;
  };

  // 格式化选择值
  const formatSelectValue = (val: any): string => {
    if (!parameter.options) return val?.toString() || '';

    const option = parameter.options.find(opt => opt.value === val);
    return option ? option.label : val?.toString() || '';
  };

  // 格式化多行文本
  const formatTextarea = (val: any): string => {
    const text = val?.toString() || '';
    // 如果文本太长，截断并添加省略号
    const maxLength = 50;
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    // 将换行符替换为空格以便单行显示
    return text.replace(/\n/g, ' ');
  };

  // 格式化助手值
  const formatAssistant = (val: any): string => {
    if (!val) return '未选择助手';
    // 如果值是对象，尝试获取名称
    if (typeof val === 'object' && val.name) {
      return val.name;
    }
    return val.toString();
  };

  // 格式化JSON
  const formatJSON = (val: any): string => {
    try {
      const jsonStr = typeof val === 'string' ? val : JSON.stringify(val);
      // 截断长JSON
      const maxLength = 50;
      if (jsonStr.length > maxLength) {
        return jsonStr.substring(0, maxLength) + '...';
      }
      return jsonStr;
    } catch {
      return val?.toString() || '';
    }
  };

  // 格式化文件路径
  const formatFile = (val: any): string => {
    if (!val) return '未选择文件';
    const path = val.toString();
    // 只显示文件名
    const fileName = path.split(/[/\\]/).pop() || path;
    return fileName;
  };

  // 获取显示文本
  const displayText = formatValue();

  // 构建CSS类名
  const displayClassName = [
    styles.displayValue,
    isDefaultValue ? styles.defaultValue : styles.customValue
  ].filter(Boolean).join(' ');

  return (
    <div className={displayClassName}>
      <span className={styles.displayText}>{displayText}</span>
    </div>
  );
};

export default ParameterDisplay;
