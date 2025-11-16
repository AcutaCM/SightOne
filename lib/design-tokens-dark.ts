/**
 * Dark Mode Design Tokens
 * 
 * Central source of truth for all dark mode opacity values and color definitions.
 * This module provides TypeScript constants for programmatic access to theme values.
 * 
 * @module design-tokens-dark
 */

export const DarkModeTokens = {
  colors: {
    background: {
      primary: '#000000',
      panel: 'rgba(255, 255, 255, 0.08)',
      modal: 'rgba(255, 255, 255, 0.12)',
      dropdown: 'rgba(255, 255, 255, 0.10)',
      tooltip: 'rgba(255, 255, 255, 0.15)',
      input: 'rgba(255, 255, 255, 0.05)',
      inputFocus: 'rgba(255, 255, 255, 0.10)',
      inputDisabled: 'rgba(255, 255, 255, 0.03)',
    },
    text: {
      primary: 'rgba(255, 255, 255, 1.0)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.4)',
      placeholder: 'rgba(255, 255, 255, 0.3)',
      disabled: 'rgba(255, 255, 255, 0.4)',
    },
    button: {
      primary: 'rgba(255, 255, 255, 1.0)',
      primaryHover: 'rgba(255, 255, 255, 1.0)',
      secondary: 'rgba(255, 255, 255, 0.2)',
      secondaryHover: 'rgba(255, 255, 255, 0.3)',
      tertiary: 'rgba(255, 255, 255, 0.1)',
      tertiaryHover: 'rgba(255, 255, 255, 0.2)',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      subtle: 'rgba(255, 255, 255, 0.08)',
      focus: 'rgba(255, 255, 255, 0.4)',
      error: 'rgba(255, 255, 255, 0.6)',
    },
    state: {
      success: 'rgba(255, 255, 255, 1.0)',
      warning: 'rgba(255, 255, 255, 0.8)',
      error: 'rgba(255, 255, 255, 0.9)',
      loading: 'rgba(255, 255, 255, 0.6)',
    },
    navigation: {
      background: 'rgba(255, 255, 255, 0.08)',
      active: 'rgba(255, 255, 255, 1.0)',
      inactive: 'rgba(255, 255, 255, 0.6)',
      hover: 'rgba(255, 255, 255, 0.8)',
    },
    workflow: {
      canvas: '#000000',
      node: 'rgba(255, 255, 255, 0.08)',
      nodeBorder: 'rgba(255, 255, 255, 0.1)',
      edge: 'rgba(255, 255, 255, 0.3)',
    },
  },
  opacity: {
    full: 1.0,
    high: 0.9,
    mediumHigh: 0.8,
    medium: 0.7,
    mediumLow: 0.6,
    low: 0.4,
    veryLow: 0.3,
    minimal: 0.2,
    subtle: 0.1,
    verySubtle: 0.08,
    ultraSubtle: 0.05,
    disabled: 0.03,
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
      sharp: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
} as const;

/**
 * Opacity scale documentation
 * 
 * 100% (1.0)  - Primary content, active states
 * 90%  (0.9)  - High emphasis content
 * 80%  (0.8)  - Medium-high emphasis
 * 70%  (0.7)  - Secondary content
 * 60%  (0.6)  - Medium emphasis
 * 40%  (0.4)  - Tertiary content, disabled states
 * 30%  (0.3)  - Placeholder text, subtle elements
 * 20%  (0.2)  - Secondary buttons, hover states
 * 15%  (0.15) - Tooltips, high-contrast overlays
 * 12%  (0.12) - Modal backgrounds
 * 10%  (0.1)  - Borders, tertiary buttons
 * 8%   (0.08) - Panel backgrounds, dividers
 * 5%   (0.05) - Input field backgrounds
 * 3%   (0.03) - Disabled input backgrounds
 */

// Type exports for TypeScript consumers
export type DarkModeTheme = typeof DarkModeTokens;
export type BackgroundColors = typeof DarkModeTokens.colors.background;
export type TextColors = typeof DarkModeTokens.colors.text;
export type ButtonColors = typeof DarkModeTokens.colors.button;
export type BorderColors = typeof DarkModeTokens.colors.border;
export type StateColors = typeof DarkModeTokens.colors.state;
export type NavigationColors = typeof DarkModeTokens.colors.navigation;
export type WorkflowColors = typeof DarkModeTokens.colors.workflow;
export type OpacityScale = typeof DarkModeTokens.opacity;
export type TransitionConfig = typeof DarkModeTokens.transitions;
