/**
 * useWorkflowTheme Hook
 * 
 * Custom React hook for managing workflow theme state and transitions.
 * Provides theme configuration, switching capabilities, and automatic
 * system theme detection.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ThemeMode,
  ThemeConfig,
  createThemeConfig,
  detectSystemTheme,
  watchSystemTheme,
  getStoredTheme,
  setStoredTheme,
  applyThemeVariables,
  removeThemeVariables,
  applyThemeTransition,
  removeThemeTransition,
} from '@/lib/workflow/theme';

export interface UseWorkflowThemeOptions {
  /**
   * Initial theme mode. If not provided, will use stored theme or system preference.
   */
  initialTheme?: ThemeMode;
  
  /**
   * Whether to automatically sync with system theme changes.
   * @default true
   */
  syncWithSystem?: boolean;
  
  /**
   * Whether to persist theme preference to localStorage.
   * @default true
   */
  persistTheme?: boolean;
  
  /**
   * Whether to apply smooth transitions when theme changes.
   * @default true
   */
  enableTransitions?: boolean;
  
  /**
   * Target element to apply theme variables to.
   * If not provided, will use document.documentElement.
   */
  targetElement?: HTMLElement | null;
}

export interface UseWorkflowThemeReturn {
  /**
   * Current theme mode
   */
  theme: ThemeMode;
  
  /**
   * Current theme configuration
   */
  themeConfig: ThemeConfig;
  
  /**
   * Design tokens for the current theme
   */
  tokens: ThemeConfig['tokens'];
  
  /**
   * Whether the theme is currently transitioning
   */
  isTransitioning: boolean;
  
  /**
   * Set theme mode
   */
  setTheme: (theme: ThemeMode) => void;
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme: () => void;
  
  /**
   * Reset to system theme
   */
  resetToSystemTheme: () => void;
  
  /**
   * Whether current theme matches system preference
   */
  isSystemTheme: boolean;
}

/**
 * Hook for managing workflow theme
 */
export function useWorkflowTheme(
  options: UseWorkflowThemeOptions = {}
): UseWorkflowThemeReturn {
  const {
    initialTheme,
    syncWithSystem = true,
    persistTheme = true,
    enableTransitions = true,
    targetElement,
  } = options;
  
  // Determine initial theme
  const getInitialTheme = useCallback((): ThemeMode => {
    if (initialTheme) {
      return initialTheme;
    }
    
    if (persistTheme) {
      const stored = getStoredTheme();
      if (stored) {
        return stored;
      }
    }
    
    return detectSystemTheme();
  }, [initialTheme, persistTheme]);
  
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() =>
    createThemeConfig(getInitialTheme())
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(detectSystemTheme);
  
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Get target element
  useEffect(() => {
    if (targetElement !== undefined) {
      elementRef.current = targetElement;
    } else if (typeof document !== 'undefined') {
      elementRef.current = document.documentElement;
    }
  }, [targetElement]);
  
  // Watch system theme changes
  useEffect(() => {
    if (!syncWithSystem) {
      return;
    }
    
    const unwatch = watchSystemTheme((newSystemTheme) => {
      setSystemTheme(newSystemTheme);
      
      // Only auto-switch if user hasn't manually set a theme
      if (!persistTheme || !getStoredTheme()) {
        setThemeState(newSystemTheme);
      }
    });
    
    return unwatch;
  }, [syncWithSystem, persistTheme]);
  
  // Apply theme changes
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }
    
    const newConfig = createThemeConfig(theme);
    
    // Apply transition if enabled
    if (enableTransitions) {
      setIsTransitioning(true);
      applyThemeTransition(element);
      
      // Clear previous timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // Remove transition after it completes
      transitionTimeoutRef.current = setTimeout(() => {
        removeThemeTransition(element);
        setIsTransitioning(false);
      }, 300);
    }
    
    // Apply theme variables
    applyThemeVariables(element, newConfig);
    setThemeConfig(newConfig);
    
    // Update data attribute for CSS selectors
    element.setAttribute('data-workflow-theme', theme);
    
    // Cleanup
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [theme, enableTransitions]);
  
  // Set theme
  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      
      if (persistTheme) {
        setStoredTheme(newTheme);
      }
    },
    [persistTheme]
  );
  
  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);
  
  // Reset to system theme
  const resetToSystemTheme = useCallback(() => {
    setTheme(systemTheme);
  }, [systemTheme, setTheme]);
  
  // Check if current theme matches system
  const isSystemTheme = theme === systemTheme;
  
  return {
    theme,
    themeConfig,
    tokens: themeConfig.tokens,
    isTransitioning,
    setTheme,
    toggleTheme,
    resetToSystemTheme,
    isSystemTheme,
  };
}

/**
 * Hook for accessing workflow theme tokens
 * 
 * This is a lightweight hook that only provides access to the current
 * theme tokens without managing theme state.
 */
export function useWorkflowThemeTokens() {
  const { themeConfig } = useWorkflowTheme();
  return themeConfig.tokens;
}

/**
 * Hook for accessing workflow theme CSS variables
 * 
 * Returns the CSS variables object for the current theme.
 */
export function useWorkflowThemeVariables() {
  const { themeConfig } = useWorkflowTheme();
  return themeConfig.cssVariables;
}
