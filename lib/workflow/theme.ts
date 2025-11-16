/**
 * Theme Configuration for Workflow UI Redesign
 * 
 * This file defines the theme configuration and provides utilities
 * for managing theme state and transitions.
 */

import { DesignTokens, getDesignTokens, tokensToCSS } from './designTokens';

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  tokens: DesignTokens;
  cssVariables: Record<string, string>;
}

export interface LayoutConfig {
  nodeLibrary: {
    defaultWidth: number;
    minWidth: number;
    maxWidth: number;
    collapsedWidth: number;
  };
  controlPanel: {
    defaultWidth: number;
    minWidth: number;
    maxWidth: number;
    collapsedWidth: number;
  };
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * Default layout configuration
 */
export const defaultLayoutConfig: LayoutConfig = {
  nodeLibrary: {
    defaultWidth: 280,
    minWidth: 200,
    maxWidth: 400,
    collapsedWidth: 48,
  },
  controlPanel: {
    defaultWidth: 360,
    minWidth: 280,
    maxWidth: 500,
    collapsedWidth: 48,
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
};

/**
 * Create theme configuration for a specific mode
 */
export function createThemeConfig(mode: ThemeMode): ThemeConfig {
  const tokens = getDesignTokens(mode);
  const cssVariables = tokensToCSS(tokens);
  
  return {
    mode,
    tokens,
    cssVariables,
  };
}

/**
 * Apply theme CSS variables to an element
 */
export function applyThemeVariables(
  element: HTMLElement,
  theme: ThemeConfig
): void {
  Object.entries(theme.cssVariables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

/**
 * Remove theme CSS variables from an element
 */
export function removeThemeVariables(
  element: HTMLElement,
  theme: ThemeConfig
): void {
  Object.keys(theme.cssVariables).forEach((key) => {
    element.style.removeProperty(key);
  });
}

/**
 * Detect system theme preference
 */
export function detectSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Watch for system theme changes
 */
export function watchSystemTheme(
  callback: (theme: ThemeMode) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  
  // Legacy browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

/**
 * Get theme from localStorage
 */
export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const stored = localStorage.getItem('workflow-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  return null;
}

/**
 * Save theme to localStorage
 */
export function setStoredTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('workflow-theme', theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
}

/**
 * Clear stored theme
 */
export function clearStoredTheme(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem('workflow-theme');
  } catch (error) {
    console.warn('Failed to clear theme from localStorage:', error);
  }
}

/**
 * Get responsive layout mode based on window width
 */
export function getLayoutMode(width: number): 'mobile' | 'tablet' | 'desktop' {
  const { mobile, tablet } = defaultLayoutConfig.breakpoints;
  
  if (width < mobile) {
    return 'mobile';
  } else if (width < tablet) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Check if current layout is mobile
 */
export function isMobileLayout(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.innerWidth < defaultLayoutConfig.breakpoints.mobile;
}

/**
 * Check if current layout is tablet
 */
export function isTabletLayout(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const width = window.innerWidth;
  const { mobile, tablet } = defaultLayoutConfig.breakpoints;
  
  return width >= mobile && width < tablet;
}

/**
 * Check if current layout is desktop
 */
export function isDesktopLayout(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  
  return window.innerWidth >= defaultLayoutConfig.breakpoints.desktop;
}

/**
 * Calculate sidebar width based on layout mode
 */
export function calculateSidebarWidth(
  layoutMode: 'mobile' | 'tablet' | 'desktop',
  isCollapsed: boolean,
  config: LayoutConfig['nodeLibrary'] | LayoutConfig['controlPanel']
): number {
  if (isCollapsed) {
    return config.collapsedWidth;
  }
  
  switch (layoutMode) {
    case 'mobile':
      return 0; // Hidden on mobile, shown as drawer
    case 'tablet':
      return Math.min(config.defaultWidth * 0.8, config.maxWidth);
    case 'desktop':
    default:
      return config.defaultWidth;
  }
}

/**
 * Theme transition configuration
 */
export const themeTransition = {
  duration: 300, // ms
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  properties: [
    'background-color',
    'color',
    'border-color',
    'box-shadow',
  ],
};

/**
 * Apply smooth theme transition
 */
export function applyThemeTransition(element: HTMLElement): void {
  const transition = themeTransition.properties
    .map(prop => `${prop} ${themeTransition.duration}ms ${themeTransition.easing}`)
    .join(', ');
  
  element.style.transition = transition;
}

/**
 * Remove theme transition
 */
export function removeThemeTransition(element: HTMLElement): void {
  element.style.transition = '';
}
