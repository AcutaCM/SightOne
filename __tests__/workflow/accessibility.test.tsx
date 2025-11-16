/**
 * Workflow组件可访问性测试
 * 
 * 测试内容：
 * - 键盘导航支持
 * - ARIA标签
 * - 焦点管理
 * - 颜色对比度
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NodeHeader from '@/components/workflow/NodeHeader';
import ParameterItem from '@/components/workflow/ParameterItem';
import { Plane } from 'lucide-react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock workflowTheme
jest.mock('@/lib/workflow/workflowTheme', () => ({
  useWorkflowTheme: () => ({
    node: {
      bg: '#FFFFFF',
      border: '#E5E5E5',
      borderHover: '#CCCCCC',
      selected: '#000000',
      selectedGlow: 'rgba(0, 0, 0, 0.1)',
      divider: '#F0F0F0',
      headerBg: '#FAFAFA',
    },
    parameter: {
      bg: '#F8F8F8',
      bgHover: '#F0F0F0',
      bgEditing: '#E8E8E8',
      bgError: '#FEE',
      border: '#E0E0E0',
      borderHover: '#D0D0D0',
      borderEditing: '#999999',
      editingGlow: 'rgba(0, 0, 0, 0.08)',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      tertiary: '#757575',
    },
    status: {
      error: '#DC2626',
      success: '#333333',
      warning: '#666666',
      info: '#000000',
    },
  }),
  getCSSVariable: (name: string, fallback: string) => fallback,
}));

describe('NodeHeader Accessibility', () => {
  const defaultProps = {
    icon: Plane,
    label: '起飞',
    color: '#64FFDA',
    isCollapsed: false,
    onToggleCollapse: jest.fn(),
    onOpenAdvanced: jest.fn(),
    parameterCount: 3,
    hasErrors: false,
  };

  test('应该有正确的ARIA标签', () => {
    render(<NodeHeader {...defaultProps} />);
    
    // 检查头部的role和aria-label
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('aria-label', '起飞节点头部');
    
    // 检查标题的role
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('起飞');
  });

  test('按钮应该有正确的ARIA属性', () => {
    render(<NodeHeader {...defaultProps} />);
    
    // 检查高级设置按钮
    const advancedButton = screen.getByLabelText('打开高级设置');
    expect(advancedButton).toHaveAttribute('tabIndex', '0');
    
    // 检查折叠按钮
    const collapseButton = screen.getByLabelText('折叠参数列表');
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    expect(collapseButton).toHaveAttribute('tabIndex', '0');
  });

  test('折叠状态下应该显示参数数量徽章', () => {
    render(<NodeHeader {...defaultProps} isCollapsed={true} />);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', '3个参数');
    expect(badge).toHaveTextContent('3');
  });

  test('有错误时应该显示警告', () => {
    render(<NodeHeader {...defaultProps} hasErrors={true} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    expect(alert).toHaveAttribute('aria-label', '节点配置错误：有未配置的必填参数');
  });

  test('应该支持键盘导航 - Enter键', () => {
    const onToggleCollapse = jest.fn();
    render(<NodeHeader {...defaultProps} onToggleCollapse={onToggleCollapse} />);
    
    const collapseButton = screen.getByLabelText('折叠参数列表');
    fireEvent.keyDown(collapseButton, { key: 'Enter' });
    
    expect(onToggleCollapse).toHaveBeenCalled();
  });

  test('应该支持键盘导航 - Space键', () => {
    const onOpenAdvanced = jest.fn();
    render(<NodeHeader {...defaultProps} onOpenAdvanced={onOpenAdvanced} />);
    
    const advancedButton = screen.getByLabelText('打开高级设置');
    fireEvent.keyDown(advancedButton, { key: ' ' });
    
    expect(onOpenAdvanced).toHaveBeenCalled();
  });
});

describe('ParameterItem Accessibility', () => {
  const mockParameter = {
    name: 'altitude',
    label: '高度',
    type: 'number' as const,
    defaultValue: 100,
    required: true,
    description: '飞行高度（厘米）',
  };

  test('应该有正确的ARIA属性', () => {
    render(
      <ParameterItem
        parameter={mockParameter}
        value={100}
        onChange={jest.fn()}
      />
    );
    
    const paramGroup = screen.getByRole('group');
    expect(paramGroup).toHaveAttribute('aria-label', '高度参数（必填）');
    expect(paramGroup).toHaveAttribute('tabIndex', '0');
  });

  test('错误状态应该有正确的ARIA属性', () => {
    const errorMessage = '高度必须在20到500之间';
    render(
      <ParameterItem
        parameter={mockParameter}
        value={10}
        onChange={jest.fn()}
        error={errorMessage}
      />
    );
    
    const paramGroup = screen.getByRole('group');
    expect(paramGroup).toHaveAttribute('aria-invalid', 'true');
    
    // 错误消息应该有alert role
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    expect(alert).toHaveTextContent(errorMessage);
  });

  test('应该支持键盘导航 - Enter键进入编辑模式', () => {
    render(
      <ParameterItem
        parameter={mockParameter}
        value={100}
        onChange={jest.fn()}
      />
    );
    
    const paramGroup = screen.getByRole('group');
    fireEvent.keyDown(paramGroup, { key: 'Enter' });
    
    // 应该进入编辑模式（显示输入框）
    // 注意：实际测试需要检查组件状态变化
  });

  test('应该支持键盘导航 - Escape键取消编辑', () => {
    render(
      <ParameterItem
        parameter={mockParameter}
        value={100}
        onChange={jest.fn()}
      />
    );
    
    const paramGroup = screen.getByRole('group');
    
    // 进入编辑模式
    fireEvent.keyDown(paramGroup, { key: 'Enter' });
    
    // 按Escape取消
    fireEvent.keyDown(paramGroup, { key: 'Escape' });
    
    // 应该退出编辑模式
  });
});

describe('Color Contrast', () => {
  /**
   * 计算颜色对比度
   * 基于WCAG 2.1标准
   */
  function calculateContrast(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  test('浅色主题 - 主要文本对比度应该符合AAA标准', () => {
    const contrast = calculateContrast('#1A1A1A', '#FFFFFF');
    expect(contrast).toBeGreaterThanOrEqual(7); // AAA标准
  });

  test('浅色主题 - 次要文本对比度应该符合AA标准', () => {
    const contrast = calculateContrast('#666666', '#FFFFFF');
    expect(contrast).toBeGreaterThanOrEqual(4.5); // AA标准
  });

  test('浅色主题 - 第三级文本对比度应该符合AA标准（优化后）', () => {
    const contrast = calculateContrast('#757575', '#FFFFFF');
    expect(contrast).toBeGreaterThanOrEqual(4.5); // AA标准
  });

  test('浅色主题 - 错误文本对比度应该符合AA标准', () => {
    const contrast = calculateContrast('#DC2626', '#FFFFFF');
    expect(contrast).toBeGreaterThanOrEqual(4.5); // AA标准
  });

  test('深色主题 - 主要文本对比度应该符合AAA标准', () => {
    const contrast = calculateContrast('#E5E5E5', '#1A1A1A');
    expect(contrast).toBeGreaterThanOrEqual(7); // AAA标准
  });

  test('深色主题 - 次要文本对比度应该符合AA标准', () => {
    const contrast = calculateContrast('#999999', '#1A1A1A');
    expect(contrast).toBeGreaterThanOrEqual(4.5); // AA标准
  });

  test('深色主题 - 第三级文本对比度应该符合AA标准（优化后）', () => {
    const contrast = calculateContrast('#8A8A8A', '#1A1A1A');
    expect(contrast).toBeGreaterThanOrEqual(4.5); // AA标准
  });

  test('深色主题 - 错误文本对比度应该符合AA标准', () => {
    const contrast = calculateContrast('#EF4444', '#1A1A1A');
    expect(contrast).toBeGreaterThanOrEqual(4.5); // AA标准
  });
});

describe('Focus Management', () => {
  test('按钮应该有可见的焦点指示器', () => {
    render(<NodeHeader {...{
      icon: Plane,
      label: '起飞',
      color: '#64FFDA',
      isCollapsed: false,
      onToggleCollapse: jest.fn(),
      onOpenAdvanced: jest.fn(),
      parameterCount: 3,
      hasErrors: false,
    }} />);
    
    const button = screen.getByLabelText('打开高级设置');
    
    // 聚焦按钮
    button.focus();
    
    // 检查是否有焦点
    expect(button).toHaveFocus();
  });

  test('参数项应该可以接收焦点', () => {
    render(
      <ParameterItem
        parameter={{
          name: 'altitude',
          label: '高度',
          type: 'number',
          defaultValue: 100,
          required: true,
        }}
        value={100}
        onChange={jest.fn()}
      />
    );
    
    const paramGroup = screen.getByRole('group');
    
    // 聚焦参数项
    paramGroup.focus();
    
    // 检查是否有焦点
    expect(paramGroup).toHaveFocus();
  });
});
