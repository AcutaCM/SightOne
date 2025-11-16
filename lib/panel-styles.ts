import { PanelDesignTokens } from './design-tokens-panels';

export interface PanelStyleOptions {
  type: 'card' | 'modal' | 'dropdown' | 'tooltip';
  withBorder?: boolean;
  withShadow?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * 获取浮动面板的统一背景样式 - 使用纯色背景
 */
export function getPanelBackgroundStyle(options: PanelStyleOptions): React.CSSProperties {
  const {
    type = 'card',
    withBorder = true,
    withShadow = true,
    theme = 'dark'
  } = options;

  // 根据主题选择纯色背景
  const useLight = theme === 'light';
  const backgroundSource = useLight ? PanelDesignTokens.backgroundLight : PanelDesignTokens.background;
  
  const backgroundColor = backgroundSource[type];

  return {
    backgroundColor,
    // 不再使用 backdrop-filter
    ...(withBorder && {
      border: `${PanelDesignTokens.border.width} solid ${PanelDesignTokens.border.color}`,
    }),
    ...(withShadow && {
      boxShadow: PanelDesignTokens.shadow.default,
    }),
    borderRadius: type === 'card' || type === 'dropdown' || type === 'tooltip'
      ? PanelDesignTokens.borderRadius.card 
      : PanelDesignTokens.borderRadius.modal,
  };
}

/**
 * 获取Card类型面板的样式 - 纯色背景
 */
export function getCardPanelStyle(theme: 'light' | 'dark' = 'dark'): React.CSSProperties {
  return getPanelBackgroundStyle({
    type: 'card',
    withBorder: true,
    withShadow: true,
    theme
  });
}

/**
 * 获取Modal类型面板的样式 - 纯色背景
 */
export function getModalPanelStyle(theme: 'light' | 'dark' = 'dark'): React.CSSProperties {
  return getPanelBackgroundStyle({
    type: 'modal',
    withBorder: false,
    withShadow: false,
    theme
  });
}

/**
 * 获取Tailwind CSS类名（用于不支持inline style的场景）- 不包含backdrop blur
 */
export function getPanelTailwindClasses(type: 'card' | 'modal'): string {
  const borderClasses = type === 'card' ? 'border border-divider' : '';
  const shadowClasses = type === 'card' ? 'shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]' : '';
  const radiusClasses = type === 'card' ? 'rounded-[16px]' : 'rounded-[14px]';
  
  return `${borderClasses} ${shadowClasses} ${radiusClasses}`.trim();
}
