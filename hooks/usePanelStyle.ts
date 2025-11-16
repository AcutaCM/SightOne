import { useTheme } from 'next-themes';
import { useMemo, useEffect } from 'react';
import { getPanelBackgroundStyle, PanelStyleOptions } from '@/lib/panel-styles';
import { PanelType } from '@/lib/design-tokens-panels';

/**
 * Hook to get theme-aware panel styles
 */
export function usePanelStyle(options: Omit<PanelStyleOptions, 'theme'>) {
  const { theme } = useTheme();
  
  return useMemo(() => {
    return getPanelBackgroundStyle({
      ...options,
      theme: (theme as 'light' | 'dark') || 'dark'
    });
  }, [theme, options]);
}

/**
 * 监听主题变化并更新面板样式
 */
export function usePanelThemeSync(panelRef: React.RefObject<HTMLElement>, type: PanelType) {
  const { theme } = useTheme();
  
  useEffect(() => {
    if (!panelRef.current) return;
    
    const style = getPanelBackgroundStyle({
      type: type === PanelType.CARD ? 'card' : 'modal',
      theme: (theme as 'light' | 'dark') || 'dark'
    });
    
    Object.assign(panelRef.current.style, style);
  }, [theme, type, panelRef]);
}
