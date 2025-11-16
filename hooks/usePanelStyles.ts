import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { getCardPanelStyle, getModalPanelStyle, getPanelBackgroundStyle, PanelStyleOptions } from '@/lib/panel-styles';

/**
 * Hook to get panel styles that respond to theme changes
 */
export function usePanelStyles() {
  const { theme, resolvedTheme } = useTheme();
  
  // Determine the current theme (dark or light)
  const currentTheme = (resolvedTheme || theme || 'dark') as 'light' | 'dark';
  
  return useMemo(() => ({
    // Get card panel style with current theme
    cardStyle: getCardPanelStyle(currentTheme),
    
    // Get modal panel style with current theme
    modalStyle: getModalPanelStyle(currentTheme),
    
    // Get custom panel style with current theme
    getPanelStyle: (options: Omit<PanelStyleOptions, 'theme'>) => 
      getPanelBackgroundStyle({ ...options, theme: currentTheme }),
    
    // Current theme value
    theme: currentTheme,
  }), [currentTheme]);
}
