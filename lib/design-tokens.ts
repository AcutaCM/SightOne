/**
 * Design Tokens for Login Page Redesign
 * Based on Artificium AI Content Creation App UI Kit
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main brand blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic Colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.5rem',  // 56px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
} as const;

export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
} as const;

export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

/**
 * Z-Index层级系统
 * 定义应用程序的z-index层级结构，确保正确的元素堆叠顺序
 * 
 * 层级结构:
 * - 层级 0: 页面内容 (z-index: 0)
 * - 层级 1: Modal遮罩层 (z-index: 900) - 只覆盖主内容区域
 * - 层级 2: Modal内容 (z-index: 950) - 在遮罩层之上
 * - 层级 3: 嵌套Modal (z-index: 980) - 在主Modal之上
 * - 层级 4: 侧边栏 (z-index: 9999) - 最顶层，始终可见
 */
export const Z_INDEX = {
  // 基础层级
  base: 0,
  background: 0,
  
  // Modal系统
  modalOverlay: 900,      // 遮罩层，只覆盖主内容区域
  modalContent: 950,      // Modal内容，在遮罩层之上
  modalNested: 980,       // 嵌套Modal（如草稿恢复提示、未保存更改警告）
  
  // 导航和侧边栏 - 最顶层
  sidebar: 9999,          // 侧边栏在最顶层，不被任何元素遮挡
  navbar: 9999,           // 导航栏同样在最顶层
  
  // 其他组件
  dropdown: 1050,
  tooltip: 1300,
  notification: 1400,
  popover: 1500,
} as const;

// 保持向后兼容的别名
export const zIndex = Z_INDEX;

// Animation presets
export const animations = {
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  inputFocus: {
    scale: 1.01,
    transition: { duration: 0.2 }
  },
  
  buttonHover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  
  spinner: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  },
} as const;

// Validation patterns
export const validation = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址',
  },
  password: {
    minLength: 6,
    message: '密码至少需要6个字符',
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: '邮箱或密码不正确',
  NETWORK_ERROR: '网络连接失败，请稍后重试',
  SERVER_ERROR: '服务器错误，请稍后重试',
  VALIDATION_EMAIL: '请输入有效的邮箱地址',
  VALIDATION_PASSWORD: '密码至少需要6个字符',
  REQUIRED_FIELD: '此字段为必填项',
  GENERIC_ERROR: '登录失败，请检查您的凭据',
} as const;

// Export type helpers
export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type BorderRadiusToken = typeof borderRadius;
export type ShadowToken = typeof shadows;
export type BreakpointToken = typeof breakpoints;
export type ZIndexToken = typeof Z_INDEX;

// Z-Index配置接口
export interface ZIndexConfig {
  base: number;
  background: number;
  modalOverlay: number;
  modalContent: number;
  modalNested: number;
  sidebar: number;
  navbar: number;
  dropdown: number;
  tooltip: number;
  notification: number;
  popover: number;
}
