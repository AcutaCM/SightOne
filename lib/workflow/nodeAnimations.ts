/**
 * Node Animation Variants
 * 
 * 工作流节点动画配置
 * 使用framer-motion提供流畅的动画效果
 * 
 * Requirements: 5.2, 5.3, 6.1, 6.2
 */

import { Variants } from 'framer-motion';

/**
 * 节点主体动画变体
 */
export const nodeVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    y: -2,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  selected: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 参数列表折叠/展开动画变体
 */
export const parameterListVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 参数项动画变体
 * Requirements: 7.1 - 添加参数项淡入动画
 */
export const parameterItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: -8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    x: 2,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  saveSuccess: {
    scale: [1, 1.02, 1],
    borderColor: ['var(--param-border)', 'var(--success-color)', 'var(--param-border)'],
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 参数组动画变体
 * Requirements: 7.1 - 实现列表展开/折叠效果
 */
export const parameterGroupVariants: Variants = {
  initial: {
    opacity: 0,
    y: -8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 状态指示器动画变体
 */
export const statusIndicatorVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 1,
  },
  running: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  success: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  error: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      repeat: 3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 状态指示器光晕动画变体
 */
export const statusGlowVariants: Variants = {
  running: {
    scale: [1, 1.8, 1],
    opacity: [0.6, 0, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
};

/**
 * 进度条动画变体
 */
export const progressBarVariants: Variants = {
  running: {
    scaleX: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * 错误提示动画变体
 */
export const errorMessageVariants: Variants = {
  initial: {
    opacity: 0,
    y: -4,
    height: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    height: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 徽章动画变体
 */
export const badgeVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 按钮动画变体
 */
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.1,
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 图标旋转动画变体
 */
export const iconRotateVariants: Variants = {
  collapsed: {
    rotate: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  expanded: {
    rotate: 180,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 警告图标弹出动画变体
 */
export const warningIconVariants: Variants = {
  initial: {
    scale: 0,
  },
  animate: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15,
    },
  },
  exit: {
    scale: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * 动画缓动函数
 */
export const easings = {
  // 标准缓动
  standard: [0.4, 0, 0.2, 1],
  // 加速
  accelerate: [0.4, 0, 1, 1],
  // 减速
  decelerate: [0, 0, 0.2, 1],
  // 弹性
  spring: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
  // 柔和弹性
  softSpring: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
  },
} as const;

/**
 * 动画持续时间
 */
export const durations = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  verySlow: 0.6,
} as const;

/**
 * 交错动画配置
 * Requirements: 7.1 - 优化参数列表动画交错效果
 * Requirements: 9.1 - 优化滚动性能
 */
export const staggerConfig = {
  // 参数列表交错显示 - 优化后的配置
  parameterList: {
    staggerChildren: 0.03, // 减少延迟以提升性能
    delayChildren: 0.05,
  },
  // 参数组交错显示
  parameterGroup: {
    staggerChildren: 0.05,
    delayChildren: 0.1,
  },
  // 快速交错 - 用于大量参数
  fast: {
    staggerChildren: 0.02,
    delayChildren: 0.03,
  },
  // 标准交错
  normal: {
    staggerChildren: 0.05,
    delayChildren: 0.1,
  },
  // 慢速交错 - 用于重要动画
  slow: {
    staggerChildren: 0.1,
    delayChildren: 0.2,
  },
} as const;
