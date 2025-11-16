/**
 * Design Tokens for Workflow UI Redesign
 * 
 * This file defines all design tokens including colors, spacing, border radius,
 * shadows, and animations for the workflow editor interface.
 */

export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  animations: AnimationTokens;
  typography: TypographyTokens;
}

export interface ColorTokens {
  canvas: {
    background: string;
    grid: string;
    gridDot: string;
  };
  node: {
    background: string;
    border: string;
    text: string;
    shadow: string;
    selectedBorder: string;
    selectedGlow: string;
  };
  edge: {
    default: string;
    selected: string;
    animated: string;
  };
  panel: {
    background: string;
    border: string;
    text: string;
    textSecondary: string;
    hover: string;
  };
  status: {
    idle: string;
    running: string;
    success: string;
    error: string;
    warning: string;
  };
  category: {
    basic: string;
    movement: string;
    detection: string;
    ai: string;
    logic: string;
    data: string;
    challenge: string;
  };
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glow: string;
  glowPrimary: string;
  glowSuccess: string;
  glowError: string;
}

export interface AnimationTokens {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    default: string;
    in: string;
    out: string;
    inOut: string;
  };
}

export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

/**
 * Light theme design tokens
 */
export const lightTokens: DesignTokens = {
  colors: {
    canvas: {
      background: '#f8fafc',
      grid: '#e2e8f0',
      gridDot: '#cbd5e1',
    },
    node: {
      background: '#ffffff',
      border: '#e2e8f0',
      text: '#0f172a',
      shadow: 'rgba(0, 0, 0, 0.03)',
      selectedBorder: '#3b82f6',
      selectedGlow: 'rgba(59, 130, 246, 0.15)',
    },
    edge: {
      default: '#94a3b8',
      selected: '#3b82f6',
      animated: '#10b981',
    },
    panel: {
      background: '#ffffff',
      border: '#e2e8f0',
      text: '#0f172a',
      textSecondary: '#64748b',
      hover: '#f1f5f9',
    },
    status: {
      idle: '#94a3b8',
      running: '#3b82f6',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
    },
    category: {
      basic: '#8b5cf6',
      movement: '#3b82f6',
      detection: '#10b981',
      ai: '#f59e0b',
      logic: '#ec4899',
      data: '#06b6d4',
      challenge: '#ef4444',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    sm: 'none',
    md: '0 1px 3px rgba(0, 0, 0, 0.05)',
    lg: '0 2px 6px rgba(0, 0, 0, 0.06)',
    xl: '0 4px 12px rgba(0, 0, 0, 0.08)',
    glow: 'none',
    glowPrimary: '0 0 0 1px rgba(59, 130, 246, 0.2)',
    glowSuccess: '0 0 0 1px rgba(16, 185, 129, 0.2)',
    glowError: '0 0 0 1px rgba(239, 68, 68, 0.2)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
};

/**
 * Dark theme design tokens
 */
export const darkTokens: DesignTokens = {
  colors: {
    canvas: {
      background: '#0a0f1e',
      grid: '#1e293b',
      gridDot: '#334155',
    },
    node: {
      background: '#111827',
      border: '#1f2937',
      text: '#f1f5f9',
      shadow: 'rgba(0, 0, 0, 0.1)',
      selectedBorder: '#3b82f6',
      selectedGlow: 'rgba(59, 130, 246, 0.2)',
    },
    edge: {
      default: '#64748b',
      selected: '#3b82f6',
      animated: '#10b981',
    },
    panel: {
      background: '#111827',
      border: '#1f2937',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      hover: '#1f2937',
    },
    status: {
      idle: '#64748b',
      running: '#3b82f6',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
    },
    category: {
      basic: '#a78bfa',
      movement: '#60a5fa',
      detection: '#34d399',
      ai: '#fbbf24',
      logic: '#f472b6',
      data: '#22d3ee',
      challenge: '#f87171',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    sm: 'none',
    md: '0 1px 3px rgba(0, 0, 0, 0.15)',
    lg: '0 2px 6px rgba(0, 0, 0, 0.18)',
    xl: '0 4px 12px rgba(0, 0, 0, 0.22)',
    glow: 'none',
    glowPrimary: '0 0 0 1px rgba(59, 130, 246, 0.3)',
    glowSuccess: '0 0 0 1px rgba(16, 185, 129, 0.3)',
    glowError: '0 0 0 1px rgba(239, 68, 68, 0.3)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
};

/**
 * Get design tokens for a specific theme
 */
export function getDesignTokens(theme: 'light' | 'dark'): DesignTokens {
  return theme === 'light' ? lightTokens : darkTokens;
}

/**
 * Convert design tokens to CSS variables
 */
export function tokensToCSS(tokens: DesignTokens): Record<string, string> {
  return {
    // Canvas colors
    '--wf-canvas-bg': tokens.colors.canvas.background,
    '--wf-canvas-grid': tokens.colors.canvas.grid,
    '--wf-canvas-grid-dot': tokens.colors.canvas.gridDot,
    
    // Node colors
    '--wf-node-bg': tokens.colors.node.background,
    '--wf-node-border': tokens.colors.node.border,
    '--wf-node-text': tokens.colors.node.text,
    '--wf-node-shadow': tokens.colors.node.shadow,
    '--wf-node-selected-border': tokens.colors.node.selectedBorder,
    '--wf-node-selected-glow': tokens.colors.node.selectedGlow,
    
    // Edge colors
    '--wf-edge-default': tokens.colors.edge.default,
    '--wf-edge-selected': tokens.colors.edge.selected,
    '--wf-edge-animated': tokens.colors.edge.animated,
    
    // Panel colors
    '--wf-panel-bg': tokens.colors.panel.background,
    '--wf-panel-border': tokens.colors.panel.border,
    '--wf-panel-text': tokens.colors.panel.text,
    '--wf-panel-text-secondary': tokens.colors.panel.textSecondary,
    '--wf-panel-hover': tokens.colors.panel.hover,
    
    // Status colors
    '--wf-status-idle': tokens.colors.status.idle,
    '--wf-status-running': tokens.colors.status.running,
    '--wf-status-success': tokens.colors.status.success,
    '--wf-status-error': tokens.colors.status.error,
    '--wf-status-warning': tokens.colors.status.warning,
    
    // Category colors
    '--wf-category-basic': tokens.colors.category.basic,
    '--wf-category-movement': tokens.colors.category.movement,
    '--wf-category-detection': tokens.colors.category.detection,
    '--wf-category-ai': tokens.colors.category.ai,
    '--wf-category-logic': tokens.colors.category.logic,
    '--wf-category-data': tokens.colors.category.data,
    '--wf-category-challenge': tokens.colors.category.challenge,
    
    // Spacing
    '--wf-spacing-xs': tokens.spacing.xs,
    '--wf-spacing-sm': tokens.spacing.sm,
    '--wf-spacing-md': tokens.spacing.md,
    '--wf-spacing-lg': tokens.spacing.lg,
    '--wf-spacing-xl': tokens.spacing.xl,
    '--wf-spacing-2xl': tokens.spacing['2xl'],
    '--wf-spacing-3xl': tokens.spacing['3xl'],
    
    // Radius
    '--wf-radius-sm': tokens.radius.sm,
    '--wf-radius-md': tokens.radius.md,
    '--wf-radius-lg': tokens.radius.lg,
    '--wf-radius-xl': tokens.radius.xl,
    '--wf-radius-full': tokens.radius.full,
    
    // Shadows
    '--wf-shadow-sm': tokens.shadows.sm,
    '--wf-shadow-md': tokens.shadows.md,
    '--wf-shadow-lg': tokens.shadows.lg,
    '--wf-shadow-xl': tokens.shadows.xl,
    '--wf-shadow-glow': tokens.shadows.glow,
    '--wf-shadow-glow-primary': tokens.shadows.glowPrimary,
    '--wf-shadow-glow-success': tokens.shadows.glowSuccess,
    '--wf-shadow-glow-error': tokens.shadows.glowError,
    
    // Animations
    '--wf-duration-fast': tokens.animations.duration.fast,
    '--wf-duration-normal': tokens.animations.duration.normal,
    '--wf-duration-slow': tokens.animations.duration.slow,
    '--wf-easing-default': tokens.animations.easing.default,
    '--wf-easing-in': tokens.animations.easing.in,
    '--wf-easing-out': tokens.animations.easing.out,
    '--wf-easing-in-out': tokens.animations.easing.inOut,
    
    // Typography
    '--wf-font-sans': tokens.typography.fontFamily.sans,
    '--wf-font-mono': tokens.typography.fontFamily.mono,
    '--wf-text-xs': tokens.typography.fontSize.xs,
    '--wf-text-sm': tokens.typography.fontSize.sm,
    '--wf-text-base': tokens.typography.fontSize.base,
    '--wf-text-lg': tokens.typography.fontSize.lg,
    '--wf-text-xl': tokens.typography.fontSize.xl,
    '--wf-text-2xl': tokens.typography.fontSize['2xl'],
    '--wf-font-normal': tokens.typography.fontWeight.normal,
    '--wf-font-medium': tokens.typography.fontWeight.medium,
    '--wf-font-semibold': tokens.typography.fontWeight.semibold,
    '--wf-font-bold': tokens.typography.fontWeight.bold,
    '--wf-leading-tight': tokens.typography.lineHeight.tight,
    '--wf-leading-normal': tokens.typography.lineHeight.normal,
    '--wf-leading-relaxed': tokens.typography.lineHeight.relaxed,
  };
}
