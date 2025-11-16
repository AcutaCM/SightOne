/**
 * Dark Mode Theme Configuration Types
 * 
 * This module defines TypeScript interfaces and types for the dark mode theme system.
 * These types ensure type safety when working with theme values programmatically.
 * 
 * @module dark-mode-theme-types
 */

/**
 * Complete dark mode theme configuration
 */
export interface DarkModeTheme {
  colors: {
    background: BackgroundColors;
    text: TextColors;
    button: ButtonColors;
    border: BorderColors;
    state: StateColors;
    navigation: NavigationColors;
    workflow: WorkflowColors;
  };
  opacity: OpacityScale;
  transitions: TransitionConfig;
}

/**
 * Background color definitions
 * All backgrounds use white transparency over pure black
 */
export interface BackgroundColors {
  /** Pure black background (#000000) */
  primary: string;
  /** Panel backgrounds (8% white opacity) */
  panel: string;
  /** Modal overlay backgrounds (12% white opacity) */
  modal: string;
  /** Dropdown menu backgrounds (10% white opacity) */
  dropdown: string;
  /** Tooltip backgrounds (15% white opacity) */
  tooltip: string;
  /** Default input field backgrounds (5% white opacity) */
  input: string;
  /** Focused input field backgrounds (10% white opacity) */
  inputFocus: string;
  /** Disabled input field backgrounds (3% white opacity) */
  inputDisabled: string;
}

/**
 * Text color definitions
 * Text uses white at varying opacity levels for hierarchy
 */
export interface TextColors {
  /** Primary text - headings and important content (100% white opacity) */
  primary: string;
  /** Secondary text - body content and labels (70% white opacity) */
  secondary: string;
  /** Tertiary text - supporting content (40% white opacity) */
  tertiary: string;
  /** Placeholder text (30% white opacity) */
  placeholder: string;
  /** Disabled text (40% white opacity) */
  disabled: string;
}

/**
 * Button color definitions
 * Buttons use three-tier opacity system
 */
export interface ButtonColors {
  /** Primary button background (100% white opacity) */
  primary: string;
  /** Primary button hover state (100% white opacity) */
  primaryHover: string;
  /** Secondary button background (20% white opacity) */
  secondary: string;
  /** Secondary button hover state (30% white opacity) */
  secondaryHover: string;
  /** Tertiary button background (10% white opacity) */
  tertiary: string;
  /** Tertiary button hover state (20% white opacity) */
  tertiaryHover: string;
}

/**
 * Border and divider color definitions
 * Borders use minimal white transparency
 */
export interface BorderColors {
  /** Default border color (10% white opacity) */
  default: string;
  /** Subtle divider color (8% white opacity) */
  subtle: string;
  /** Focus ring color (40% white opacity) */
  focus: string;
  /** Error border color (60% white opacity) */
  error: string;
}

/**
 * State indicator color definitions
 * States use varying opacity to indicate importance
 */
export interface StateColors {
  /** Success state (100% white opacity) */
  success: string;
  /** Warning state (80% white opacity) */
  warning: string;
  /** Error state (90% white opacity) */
  error: string;
  /** Loading state (60% white opacity) */
  loading: string;
}

/**
 * Navigation color definitions
 * Navigation uses opacity to show active/inactive states
 */
export interface NavigationColors {
  /** Navigation bar background (8% white opacity) */
  background: string;
  /** Active navigation item (100% white opacity) */
  active: string;
  /** Inactive navigation item (60% white opacity) */
  inactive: string;
  /** Navigation item hover state (80% white opacity) */
  hover: string;
}

/**
 * Workflow-specific color definitions
 * Workflow components use transparency for depth
 */
export interface WorkflowColors {
  /** Workflow canvas background (pure black) */
  canvas: string;
  /** Workflow node background (8% white opacity) */
  node: string;
  /** Workflow node border (10% white opacity) */
  nodeBorder: string;
  /** Workflow edge/connection (30% white opacity) */
  edge: string;
}

/**
 * Opacity scale values
 * Standardized opacity levels for consistent hierarchy
 */
export interface OpacityScale {
  /** 100% - Primary content, active states */
  full: number;
  /** 90% - High emphasis content */
  high: number;
  /** 80% - Medium-high emphasis */
  mediumHigh: number;
  /** 70% - Secondary content */
  medium: number;
  /** 60% - Medium emphasis */
  mediumLow: number;
  /** 40% - Tertiary content, disabled states */
  low: number;
  /** 30% - Placeholder text, subtle elements */
  veryLow: number;
  /** 20% - Secondary buttons, hover states */
  minimal: number;
  /** 10% - Borders, tertiary buttons */
  subtle: number;
  /** 8% - Panel backgrounds, dividers */
  verySubtle: number;
  /** 5% - Input field backgrounds */
  ultraSubtle: number;
  /** 3% - Disabled input backgrounds */
  disabled: number;
}

/**
 * Transition configuration
 * Defines animation durations and easing functions
 */
export interface TransitionConfig {
  duration: {
    /** Fast transitions (150ms) - for immediate feedback */
    fast: string;
    /** Normal transitions (250ms) - for most interactions */
    normal: string;
    /** Slow transitions (350ms) - for emphasis */
    slow: string;
  };
  easing: {
    /** Default easing - balanced acceleration/deceleration */
    default: string;
    /** Smooth easing - gentle transitions */
    smooth: string;
    /** Sharp easing - quick start, slow end */
    sharp: string;
  };
}

/**
 * Validation utilities
 */

/**
 * Validates that an opacity value is within the valid range (0-1)
 * @param value - The opacity value to validate
 * @returns The clamped opacity value
 */
export function validateOpacity(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Validates that a color string is in a valid format
 * @param color - The color string to validate
 * @returns True if the color is valid, false otherwise
 */
export function validateColor(color: string): boolean {
  // Check for hex format (#RRGGBB)
  const hexPattern = /^#[0-9A-F]{6}$/i;
  // Check for rgba format (rgba(r, g, b, a))
  const rgbaPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i;
  
  return hexPattern.test(color) || rgbaPattern.test(color);
}

/**
 * Type guard to check if a value is a valid DarkModeTheme
 * @param value - The value to check
 * @returns True if the value is a valid DarkModeTheme
 */
export function isDarkModeTheme(value: unknown): value is DarkModeTheme {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const theme = value as DarkModeTheme;
  
  return (
    typeof theme.colors === 'object' &&
    typeof theme.opacity === 'object' &&
    typeof theme.transitions === 'object' &&
    typeof theme.colors.background === 'object' &&
    typeof theme.colors.text === 'object' &&
    typeof theme.colors.button === 'object' &&
    typeof theme.colors.border === 'object' &&
    typeof theme.colors.state === 'object'
  );
}

/**
 * Helper type for CSS custom property names
 */
export type CSSCustomProperty = 
  | `--bg-${string}`
  | `--text-${string}`
  | `--btn-${string}`
  | `--border-${string}`
  | `--state-${string}`
  | `--nav-${string}`
  | `--workflow-${string}`
  | `--opacity-${string}`
  | `--transition-${string}`
  | `--easing-${string}`;

/**
 * Helper function to get CSS custom property value
 * @param property - The CSS custom property name
 * @param element - The element to get the property from (defaults to document.documentElement)
 * @returns The computed value of the CSS custom property
 */
export function getCSSCustomProperty(
  property: CSSCustomProperty,
  element: HTMLElement = document.documentElement
): string {
  return getComputedStyle(element).getPropertyValue(property).trim();
}

/**
 * Helper function to set CSS custom property value
 * @param property - The CSS custom property name
 * @param value - The value to set
 * @param element - The element to set the property on (defaults to document.documentElement)
 */
export function setCSSCustomProperty(
  property: CSSCustomProperty,
  value: string,
  element: HTMLElement = document.documentElement
): void {
  element.style.setProperty(property, value);
}
