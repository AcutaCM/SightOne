/**
 * Workflow Animation Utilities
 * 工作流动画工具函数
 */

import { animations } from './designSystem';

// 节点拖拽动画
export const nodeDragAnimation = {
  initial: { scale: 1, opacity: 1 },
  dragging: { scale: 0.95, opacity: 0.7 },
  dropped: { scale: 1, opacity: 1 },
};

// 节点执行动画
export const nodeExecutionAnimation = {
  idle: {
    scale: 1,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  running: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 4px 6px rgba(0, 0, 0, 0.1)',
      '0 0 20px rgba(245, 158, 11, 0.6)',
      '0 4px 6px rgba(0, 0, 0, 0.1)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  success: {
    scale: [1, 1.1, 1],
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  error: {
    scale: [1, 1.05, 0.95, 1],
    boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// 连接线流动动画
export const edgeFlowAnimation = {
  keyframes: `
    @keyframes edgeFlow {
      0% {
        stroke-dashoffset: 20;
      }
      100% {
        stroke-dashoffset: 0;
      }
    }
  `,
  style: {
    strokeDasharray: '5',
    animation: 'edgeFlow 0.5s linear infinite',
  },
};

// 节点悬停动画
export const nodeHoverAnimation = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.05,
    y: -2,
    transition: {
      duration: animations.duration.fast / 1000,
      ease: animations.easing.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
  },
};

// 面板展开/收起动画
export const panelAnimation = {
  hidden: {
    x: -300,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: animations.duration.normal / 1000,
      ease: animations.easing.easeOut,
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: {
      duration: animations.duration.fast / 1000,
      ease: animations.easing.easeIn,
    },
  },
};

// 列表项淡入动画
export const listItemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: animations.duration.normal / 1000,
      ease: animations.easing.easeOut,
    },
  }),
};

// 模态框动画
export const modalAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: animations.duration.normal / 1000,
      ease: animations.easing.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: animations.duration.fast / 1000,
      ease: animations.easing.easeIn,
    },
  },
};

// 按钮点击动画
export const buttonClickAnimation = {
  rest: { scale: 1 },
  tap: { scale: 0.95 },
  hover: {
    scale: 1.02,
    transition: {
      duration: animations.duration.fast / 1000,
    },
  },
};

// 徽章脉冲动画
export const badgePulseAnimation = {
  scale: [1, 1.2, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// 加载动画
export const loadingAnimation = {
  rotate: [0, 360],
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

// 进度条动画
export const progressAnimation = (progress: number) => ({
  width: `${progress}%`,
  transition: {
    duration: animations.duration.normal / 1000,
    ease: animations.easing.easeOut,
  },
});

// 通知淡入淡出动画
export const notificationAnimation = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: animations.duration.normal / 1000,
      ease: animations.easing.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: animations.duration.fast / 1000,
      ease: animations.easing.easeIn,
    },
  },
};

// 工具提示动画
export const tooltipAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: animations.duration.fast / 1000,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: animations.duration.fast / 1000,
    },
  },
};

// 搜索结果高亮动画
export const highlightAnimation = {
  backgroundColor: ['transparent', 'rgba(59, 130, 246, 0.2)', 'transparent'],
  transition: {
    duration: 1,
    ease: 'easeInOut',
  },
};

// 拖拽排序动画
export const dragSortAnimation = {
  layout: true,
  transition: {
    duration: animations.duration.normal / 1000,
    ease: animations.easing.easeInOut,
  },
};

// CSS 动画关键帧
export const cssAnimations = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.05);
    }
  }

  @keyframes flow {
    0% {
      stroke-dashoffset: 20;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px currentColor;
    }
    50% {
      box-shadow: 0 0 20px currentColor;
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(5px);
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

// 应用动画的辅助函数
export function applyAnimation(
  element: HTMLElement,
  animationName: string,
  duration: number = animations.duration.normal
) {
  element.style.animation = `${animationName} ${duration}ms ${animations.easing.easeInOut}`;
  
  return new Promise<void>((resolve) => {
    const handleAnimationEnd = () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      element.style.animation = '';
      resolve();
    };
    element.addEventListener('animationend', handleAnimationEnd);
  });
}

// 创建涟漪效果
export function createRipple(event: React.MouseEvent<HTMLElement>) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
  ripple.style.pointerEvents = 'none';
  ripple.style.animation = 'ripple 0.6s ease-out';

  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}
