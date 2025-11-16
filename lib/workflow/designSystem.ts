/**
 * Workflow Design System
 * 统一的工作流设计系统 - 颜色、样式、动画
 */

// 节点类别颜色方案
export const nodeColors = {
  flow: '#64FFDA',       // 青色 - 流程控制
  basic: '#4A90E2',      // 蓝色 - 基础控制
  movement: '#10B981',   // 绿色 - 移动控制
  rotation: '#8B5CF6',   // 紫色 - 旋转控制
  tricks: '#F59E0B',     // 橙色 - 特技动作
  detection: '#EC4899',  // 粉色 - 检测任务
  control: '#06B6D4',    // 青蓝色 - 时间控制
  imaging: '#F97316',    // 橙红色 - 图像采集
  ai: '#A855F7',         // 紫罗兰 - AI分析
  logic: '#EF4444',      // 红色 - 逻辑判断
  data: '#3B82F6',       // 蓝色 - 数据处理
  network: '#14B8A6',    // 青绿色 - 网络通信
  result: '#22C55E',     // 绿色 - 结果处理
  challenge: '#F59E0B',  // 橙色 - 挑战任务
} as const;

// 节点状态颜色
export const nodeStatusColors = {
  idle: '#6B7280',       // 灰色 - 空闲
  running: '#F59E0B',    // 橙色 - 运行中
  success: '#10B981',    // 绿色 - 成功
  error: '#EF4444',      // 红色 - 错误
  skipped: '#8B5CF6',    // 紫色 - 跳过
  waiting: '#06B6D4',    // 青色 - 等待
} as const;

// 节点样式配置
export const nodeStyles = {
  default: {
    width: 180,
    minHeight: 60,
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
    fontSize: 14,
    fontWeight: 500,
  },
  compact: {
    width: 140,
    minHeight: 50,
    borderRadius: 6,
    borderWidth: 2,
    padding: 8,
    fontSize: 12,
    fontWeight: 500,
  },
  large: {
    width: 220,
    minHeight: 80,
    borderRadius: 10,
    borderWidth: 2,
    padding: 16,
    fontSize: 16,
    fontWeight: 600,
  },
} as const;

// 阴影样式
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  glow: (color: string) => `0 0 20px ${color}40`,
  glowStrong: (color: string) => `0 0 30px ${color}60`,
} as const;

// 动画配置
export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// 获取节点样式
export function getNodeStyle(
  category: keyof typeof nodeColors,
  status: keyof typeof nodeStatusColors = 'idle',
  size: keyof typeof nodeStyles = 'default'
) {
  const baseStyle = nodeStyles[size];
  const categoryColor = nodeColors[category];
  const statusColor = nodeStatusColors[status];

  return {
    ...baseStyle,
    borderColor: status === 'idle' ? categoryColor : statusColor,
    backgroundColor: '#1E3A5F',
    boxShadow: status === 'running' 
      ? shadows.glowStrong(statusColor)
      : shadows.md,
  };
}

// 获取节点类别样式
export function getCategoryStyle(category: keyof typeof nodeColors) {
  return {
    color: nodeColors[category],
    borderColor: nodeColors[category],
    backgroundColor: `${nodeColors[category]}15`,
  };
}

// 获取状态指示器样式
export function getStatusIndicatorStyle(status: keyof typeof nodeStatusColors) {
  return {
    backgroundColor: nodeStatusColors[status],
    boxShadow: `0 0 10px ${nodeStatusColors[status]}80`,
  };
}

// 连接线样式
export const edgeStyles = {
  default: {
    stroke: '#64FFDA',
    strokeWidth: 2,
    strokeDasharray: '0',
  },
  active: {
    stroke: '#F59E0B',
    strokeWidth: 3,
    strokeDasharray: '5',
    animation: 'flow 0.5s linear infinite',
  },
  conditional: {
    stroke: '#8B5CF6',
    strokeWidth: 2,
    strokeDasharray: '5 5',
  },
  error: {
    stroke: '#EF4444',
    strokeWidth: 2,
    strokeDasharray: '0',
  },
} as const;

// 响应式断点
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

// 间距系统
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// 字体大小
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
} as const;

// Z-index 层级
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// 导出类型
export type NodeCategory = keyof typeof nodeColors;
export type NodeStatus = keyof typeof nodeStatusColors;
export type NodeSize = keyof typeof nodeStyles;
export type EdgeStyle = keyof typeof edgeStyles;
