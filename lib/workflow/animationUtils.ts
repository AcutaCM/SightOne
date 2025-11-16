/**
 * Animation Utilities for Workflow UI
 * Provides reusable animation functions and configurations
 */

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const ANIMATION_EASINGS = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Sidebar collapse/expand animation
 */
export const sidebarAnimation = {
  collapsed: {
    width: 48,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.default,
    },
  },
  expanded: (width: number) => ({
    width,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.default,
    },
  }),
};

/**
 * Node drag animation
 */
export const nodeDragAnimation = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  dragging: {
    scale: 1.05,
    opacity: 0.8,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: ANIMATION_EASINGS.out,
    },
  },
  dropped: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.bounce,
    },
  },
};

/**
 * Button hover and click animations
 */
export const buttonAnimation = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: ANIMATION_EASINGS.out,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: ANIMATION_EASINGS.in,
    },
  },
};

/**
 * List item enter animation with stagger
 */
export const listItemAnimation = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.out,
      delay: index * 0.05, // 50ms stagger
    },
  }),
};

/**
 * Modal/Panel slide in animation
 */
export const slideInAnimation = {
  left: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.default,
    },
  },
  right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.default,
    },
  },
  top: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.default,
    },
  },
  bottom: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: {
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.default,
    },
  },
};

/**
 * Fade animation
 */
export const fadeAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: ANIMATION_DURATIONS.normal,
    ease: ANIMATION_EASINGS.default,
  },
};

/**
 * Scale animation
 */
export const scaleAnimation = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: {
    duration: ANIMATION_DURATIONS.normal,
    ease: ANIMATION_EASINGS.default,
  },
};

/**
 * Bounce in animation
 */
export const bounceInAnimation = {
  initial: { scale: 0.3, opacity: 0 },
  animate: {
    scale: [0.3, 1.05, 0.9, 1],
    opacity: [0, 1, 1, 1],
    transition: {
      duration: ANIMATION_DURATIONS.slow,
      ease: ANIMATION_EASINGS.bounce,
      times: [0, 0.5, 0.7, 1],
    },
  },
};

/**
 * Pulse animation for status indicators
 */
export const pulseAnimation = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2000,
      ease: ANIMATION_EASINGS.default,
      repeat: Infinity,
    },
  },
};

/**
 * Glow pulse animation for selected nodes
 */
export const glowPulseAnimation = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(59, 130, 246, 0.3)',
      '0 0 30px rgba(59, 130, 246, 0.5)',
      '0 0 20px rgba(59, 130, 246, 0.3)',
    ],
    transition: {
      duration: 2000,
      ease: ANIMATION_EASINGS.default,
      repeat: Infinity,
    },
  },
};

/**
 * Shake animation for errors
 */
export const shakeAnimation = {
  animate: {
    x: [0, -4, 4, -4, 4, 0],
    transition: {
      duration: ANIMATION_DURATIONS.slow,
      ease: ANIMATION_EASINGS.default,
    },
  },
};

/**
 * Float animation for floating elements
 */
export const floatAnimation = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3000,
      ease: ANIMATION_EASINGS.default,
      repeat: Infinity,
    },
  },
};

/**
 * Shimmer animation for loading states
 */
export const shimmerAnimation = {
  animate: {
    backgroundPosition: ['-1000px 0', '1000px 0'],
    transition: {
      duration: 2000,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * Progress bar animation
 */
export const progressAnimation = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1500,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * Apply animation to element with CSS
 */
export function applyAnimation(
  element: HTMLElement,
  animationName: string,
  config: AnimationConfig = {
    duration: ANIMATION_DURATIONS.normal,
    easing: ANIMATION_EASINGS.default,
  }
): void {
  element.style.animation = `${animationName} ${config.duration}ms ${config.easing}`;
  
  if (config.delay) {
    element.style.animationDelay = `${config.delay}ms`;
  }
}

/**
 * Remove animation from element
 */
export function removeAnimation(element: HTMLElement): void {
  element.style.animation = '';
  element.style.animationDelay = '';
}

/**
 * Wait for animation to complete
 */
export function waitForAnimation(
  element: HTMLElement,
  animationName: string
): Promise<void> {
  return new Promise((resolve) => {
    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === animationName) {
        element.removeEventListener('animationend', handleAnimationEnd);
        resolve();
      }
    };
    
    element.addEventListener('animationend', handleAnimationEnd);
  });
}

/**
 * Stagger animation for multiple elements
 */
export function staggerAnimation(
  elements: HTMLElement[],
  animationName: string,
  staggerDelay: number = 50,
  config: AnimationConfig = {
    duration: ANIMATION_DURATIONS.normal,
    easing: ANIMATION_EASINGS.default,
  }
): void {
  elements.forEach((element, index) => {
    applyAnimation(element, animationName, {
      ...config,
      delay: index * staggerDelay,
    });
  });
}

/**
 * Animate element with requestAnimationFrame
 */
export function animateWithRAF(
  callback: (progress: number) => void,
  duration: number = ANIMATION_DURATIONS.normal,
  easing: (t: number) => number = (t) => t
): void {
  const startTime = performance.now();
  
  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    
    callback(easedProgress);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

/**
 * Easing functions
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
};

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation config respecting user preferences
 */
export function getAnimationConfig(
  config: AnimationConfig
): AnimationConfig {
  if (prefersReducedMotion()) {
    return {
      ...config,
      duration: 1, // Almost instant
    };
  }
  return config;
}

/**
 * Create spring animation config
 */
export function createSpringConfig(
  stiffness: number = 300,
  damping: number = 30,
  mass: number = 1
) {
  return {
    type: 'spring',
    stiffness,
    damping,
    mass,
  };
}

/**
 * Create tween animation config
 */
export function createTweenConfig(
  duration: number = ANIMATION_DURATIONS.normal,
  easing: string = ANIMATION_EASINGS.default,
  delay: number = 0
) {
  return {
    type: 'tween',
    duration,
    ease: easing,
    delay,
  };
}
