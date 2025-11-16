/**
 * Workflow Theme System - 黑白灰极简主题
 * 提供统一的主题颜色和工具函数
 */

import React from 'react';

/**
 * 工作流主题接口
 */
export interface WorkflowTheme {
  // 节点颜色
  node: {
    bg: string;
    border: string;
    borderHover: string;
    selected: string;
    selectedGlow: string;
    divider: string;
    headerBg: string;
  };

  // 节点阴影
  shadow: {
    base: string;
    hover: string;
    selected: string;
  };

  // 参数颜色
  parameter: {
    bg: string;
    bgHover: string;
    bgEditing: string;
    bgError: string;
    border: string;
    borderHover: string;
    borderEditing: string;
    editingGlow: string;
  };

  // 文本颜色
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };

  // 状态颜色
  status: {
    error: string;
    success: string;
    warning: string;
    info: string;
  };

  // 滚动条颜色
  scrollbar: {
    track: string;
    thumb: string;
    thumbHover: string;
  };
}


/**
 * 获取CSS变量值
 * @param name CSS变量名 (如 --node-bg)
 * @param fallback 备用值
 * Requirements: 10.5
 */
export function getCSSVariable(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();

    // 确保返回有效值，如果CSS变量未定义或为空，使用fallback
    if (!value || value === '') {
      console.warn(`CSS variable ${name} is not defined, using fallback: ${fallback}`);
      return fallback;
    }

    return value;
  } catch (error) {
    console.warn(`Failed to get CSS variable ${name}:`, error);
    return fallback;
  }
}

/**
 * 批量获取CSS变量
 * @param variables 变量名和fallback的映射
 * Requirements: 10.5
 */
export function getCSSVariables(variables: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  Object.entries(variables).forEach(([key, fallback]) => {
    result[key] = getCSSVariable(key, fallback);
  });

  return result;
}

/**
 * 浅色主题默认值 - 黑白灰极简主题
 */
const lightTheme: WorkflowTheme = {
  node: {
    bg: '#FFFFFF',
    border: '#E5E5E5',
    borderHover: '#CCCCCC',
    selected: '#000000',
    selectedGlow: 'rgba(0, 0, 0, 0.1)',
    divider: '#F0F0F0',
    headerBg: '#FAFAFA',
  },
  shadow: {
    base: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    hover: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
    selected: '0 8px 24px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.1)',
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
    tertiary: '#707070',
  },
  status: {
    error: '#DC2626',
    success: '#333333',
    warning: '#666666',
    info: '#000000',
  },
  scrollbar: {
    track: '#F5F5F5',
    thumb: '#CCCCCC',
    thumbHover: '#999999',
  },
};

/**
 * 深色主题默认值 - 黑白灰极简主题
 */
const darkTheme: WorkflowTheme = {
  node: {
    bg: '#1A1A1A',
    border: '#333333',
    borderHover: '#4D4D4D',
    selected: '#FFFFFF',
    selectedGlow: 'rgba(255, 255, 255, 0.1)',
    divider: '#2A2A2A',
    headerBg: '#222222',
  },
  shadow: {
    base: '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
    hover: '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
    selected: '0 12px 32px rgba(0, 0, 0, 0.5), 0 6px 16px rgba(0, 0, 0, 0.4)',
  },
  parameter: {
    bg: '#242424',
    bgHover: '#2E2E2E',
    bgEditing: '#383838',
    bgError: 'rgba(220, 38, 38, 0.1)',
    border: '#3A3A3A',
    borderHover: '#4A4A4A',
    borderEditing: '#666666',
    editingGlow: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    primary: '#E5E5E5',
    secondary: '#999999',
    tertiary: '#8F8F8F',
  },
  status: {
    error: '#EF4444',
    success: '#CCCCCC',
    warning: '#999999',
    info: '#FFFFFF',
  },
  scrollbar: {
    track: '#2A2A2A',
    thumb: '#4A4A4A',
    thumbHover: '#666666',
  },
};

/**
 * 检测当前是否为深色主题
 */
export function isDarkTheme(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return document.documentElement.classList.contains('dark');
  } catch {
    return false;
  }
}

/**
 * 获取当前主题
 * 从CSS变量读取，如果未定义则使用默认主题
 * Requirements: 10.5
 */
export function getCurrentTheme(): WorkflowTheme {
  const isDark = isDarkTheme();
  const defaultTheme = isDark ? darkTheme : lightTheme;

  // 如果在服务器端或CSS变量不可用，直接返回默认主题
  if (typeof window === 'undefined') {
    return defaultTheme;
  }

  try {
    // 尝试从CSS变量读取主题
    return {
      node: {
        bg: getCSSVariable('--node-bg', defaultTheme.node.bg),
        border: getCSSVariable('--node-border', defaultTheme.node.border),
        borderHover: getCSSVariable('--node-border-hover', defaultTheme.node.borderHover),
        selected: getCSSVariable('--node-selected', defaultTheme.node.selected),
        selectedGlow: getCSSVariable('--node-selected-glow', defaultTheme.node.selectedGlow),
        divider: getCSSVariable('--node-divider', defaultTheme.node.divider),
        headerBg: getCSSVariable('--node-header-bg', defaultTheme.node.headerBg),
      },
      shadow: {
        base: getCSSVariable('--node-shadow', defaultTheme.shadow.base),
        hover: getCSSVariable('--node-shadow-hover', defaultTheme.shadow.hover),
        selected: getCSSVariable('--node-shadow-selected', defaultTheme.shadow.selected),
      },
      parameter: {
        bg: getCSSVariable('--param-bg', defaultTheme.parameter.bg),
        bgHover: getCSSVariable('--param-bg-hover', defaultTheme.parameter.bgHover),
        bgEditing: getCSSVariable('--param-bg-editing', defaultTheme.parameter.bgEditing),
        bgError: getCSSVariable('--param-bg-error', defaultTheme.parameter.bgError),
        border: getCSSVariable('--param-border', defaultTheme.parameter.border),
        borderHover: getCSSVariable('--param-border-hover', defaultTheme.parameter.borderHover),
        borderEditing: getCSSVariable('--param-border-editing', defaultTheme.parameter.borderEditing),
        editingGlow: getCSSVariable('--param-editing-glow', defaultTheme.parameter.editingGlow),
      },
      text: {
        primary: getCSSVariable('--text-primary', defaultTheme.text.primary),
        secondary: getCSSVariable('--text-secondary', defaultTheme.text.secondary),
        tertiary: getCSSVariable('--text-tertiary', defaultTheme.text.tertiary),
      },
      status: {
        error: getCSSVariable('--error-color', defaultTheme.status.error),
        success: getCSSVariable('--success-color', defaultTheme.status.success),
        warning: getCSSVariable('--warning-color', defaultTheme.status.warning),
        info: getCSSVariable('--info-color', defaultTheme.status.info),
      },
      scrollbar: {
        track: getCSSVariable('--scrollbar-track', defaultTheme.scrollbar.track),
        thumb: getCSSVariable('--scrollbar-thumb', defaultTheme.scrollbar.thumb),
        thumbHover: getCSSVariable('--scrollbar-thumb-hover', defaultTheme.scrollbar.thumbHover),
      },
    };
  } catch (error) {
    console.error('Failed to get current theme from CSS variables:', error);
    return defaultTheme;
  }
}

/**
 * Hook: 使用工作流主题
 * 支持主题切换监听和颜色过渡动画
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
export function useWorkflowTheme(): WorkflowTheme {
  const [theme, setTheme] = React.useState<WorkflowTheme>(getCurrentTheme());

  React.useEffect(() => {
    // 初始化主题
    setTheme(getCurrentTheme());

    // 创建 MutationObserver 监听 dark 类的变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // 主题切换时更新主题状态
          setTheme(getCurrentTheme());
        }
      });
    });

    // 监听 document.documentElement 的 class 属性变化
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, []);

  return theme;
}

/**
 * 验证所有CSS变量是否已定义
 * 用于测试和调试
 * Requirements: 10.5
 */
export function validateThemeVariables(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const requiredVariables = [
    '--node-bg',
    '--node-border',
    '--node-border-hover',
    '--node-selected',
    '--node-selected-glow',
    '--node-divider',
    '--node-header-bg',
    '--node-shadow',
    '--node-shadow-hover',
    '--node-shadow-selected',
    '--param-bg',
    '--param-bg-hover',
    '--param-bg-editing',
    '--param-bg-error',
    '--param-border',
    '--param-border-hover',
    '--param-border-editing',
    '--param-editing-glow',
    '--text-primary',
    '--text-secondary',
    '--text-tertiary',
    '--error-color',
    '--success-color',
    '--warning-color',
    '--info-color',
    '--scrollbar-track',
    '--scrollbar-thumb',
    '--scrollbar-thumb-hover',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  if (typeof window === 'undefined') {
    return {
      valid: false,
      missing: [],
      warnings: ['Cannot validate theme variables on server side'],
    };
  }

  requiredVariables.forEach((varName) => {
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();

      if (!value || value === '') {
        missing.push(varName);
      }
    } catch (error) {
      warnings.push(`Failed to check ${varName}: ${error}`);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 打印当前主题信息到控制台
 * 用于调试
 */
export function debugTheme(): void {
  if (typeof window === 'undefined') {
    console.log('Theme debugging is only available in browser');
    return;
  }

  console.group('🎨 Workflow Theme Debug Info');
  console.log('Current theme mode:', isDarkTheme() ? 'Dark' : 'Light');
  console.log('Current theme:', getCurrentTheme());

  const validation = validateThemeVariables();
  console.log('Theme validation:', validation);

  if (!validation.valid) {
    console.warn('⚠️ Missing CSS variables:', validation.missing);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:', validation.warnings);
  }

  console.groupEnd();
}
