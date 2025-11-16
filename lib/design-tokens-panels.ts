/**
 * 浮动面板设计令牌
 * 定义所有浮动面板的统一视觉标准 - 使用纯色背景
 */
export const PanelDesignTokens = {
  // 深色模式背景（纯色）
  background: {
    card: '#1a1a1a',           // Card类型面板 - 深色模式 (~10% white on black)
    modal: '#0d0d0d',          // Modal类型面板 - 深色模式 (~5% white on black)
    dropdown: '#262626',       // Dropdown菜单 - 深色模式 (~15% white on black)
    tooltip: '#333333',        // Tooltip - 深色模式 (~20% white on black)
    hover: '#262626',          // 悬停状态 - 深色模式
  },
  
  // 浅色模式背景（纯色）
  backgroundLight: {
    card: '#ffffff',           // Card类型面板 - 浅色模式 (纯白色)
    modal: '#ffffff',          // Modal类型面板 - 浅色模式 (纯白色)
    dropdown: '#ffffff',       // Dropdown菜单 - 浅色模式 (纯白色)
    tooltip: '#ffffff',        // Tooltip - 浅色模式 (纯白色)
    hover: '#f5f5f5',          // 悬停状态 - 浅色模式 (浅灰色)
  },
  
  // 边框
  border: {
    color: 'rgba(255, 255, 255, 0.14)',     // 边框颜色
    width: '1px',                            // 边框宽度
  },
  
  // 阴影
  shadow: {
    default: '0px 10px 50px 0px rgba(0,0,0,0.1)',  // 默认阴影
    elevated: '0px 20px 60px 0px rgba(0,0,0,0.15)', // 提升阴影
  },
  
  // 圆角
  borderRadius: {
    card: '16px',                            // Card圆角
    modal: '14px',                           // Modal圆角
  }
} as const;

/**
 * 主题相关配置
 */
export const ThemeAdjustments = {
  light: {
    useSolidBackground: true,                // 浅色主题使用纯色背景
  },
  dark: {
    useSolidBackground: true,                // 深色主题使用纯色背景
  }
} as const;

/**
 * 面板组件分类
 */
export enum PanelType {
  CARD = 'card',           // Card类型：HelpPanel, MemoryPanel等
  MODAL = 'modal',         // Modal类型：SettingsModal, WorkflowManagerModal等
  CUSTOM = 'custom'        // 自定义类型：特殊需求的面板
}

/**
 * 面板样式配置
 */
export interface PanelStyleConfig {
  type: PanelType;
  withBackdrop: boolean;
  withBorder: boolean;
  withShadow: boolean;
  customStyles?: React.CSSProperties;
}

/**
 * 需要更新的组件清单
 */
export const PANEL_COMPONENTS = {
  card: [
    // 原有组件
    'HelpPanel',
    'MemoryPanel',
    'ManualControlPanel',
    'PlantQRGeneratorPanel',
    'BatteryStatusPanel',
    'VirtualPositionView',
    'WorkflowPanel',
    'WorkflowValidationPanel',
    // 新发现的Card类型面板
    'AppInfoPanel',
    'ChallengeCruisePanel',
    'ConnectionControlPanel',
    'DetectionControlPanel',
    'DroneControlPanel',
    'DronePositionPanel',
    'MissionPadPanel',
    'QRScanPanel',
    'SystemLogPanel',
  ],
  modal: [
    'SettingsModal',
    'WorkflowManagerModal',
    'EnhancedNodeConfigModal',
    'NodeConfigModal',
    'AIWorkflowGeneratorModal',
  ],
  base: [
    'BasePanel',
    'BaseModal',
  ],
  custom: [
    'ComponentSelector',
    'QrGenerator',
    'ControlStatusPanel',
  ]
} as const;
