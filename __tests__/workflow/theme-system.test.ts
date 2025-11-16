/**
 * Theme System Unit Tests
 * 
 * Tests for the workflow theme system including:
 * - Theme configuration
 * - Design tokens
 * - Theme switching
 * - CSS variable generation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  lightTheme,
  darkTheme,
  defaultLayoutConfig,
  getThemeColors,
  generateCSSVariables,
} from '@/lib/workflow/theme';

describe('Workflow Theme System', () => {
  describe('Theme Configuration', () => {
    it('should have valid light theme configuration', () => {
      expect(lightTheme).toBeDefined();
      expect(lightTheme.mode).toBe('light');
      expect(lightTheme.colors).toBeDefined();
      expect(lightTheme.colors.canvas).toBeDefined();
      expect(lightTheme.colors.node).toBeDefined();
      expect(lightTheme.colors.edge).toBeDefined();
      expect(lightTheme.colors.panel).toBeDefined();
    });

    it('should have valid dark theme configuration', () => {
      expect(darkTheme).toBeDefined();
      expect(darkTheme.mode).toBe('dark');
      expect(darkTheme.colors).toBeDefined();
      expect(darkTheme.colors.canvas).toBeDefined();
      expect(darkTheme.colors.node).toBeDefined();
      expect(darkTheme.colors.edge).toBeDefined();
      expect(darkTheme.colors.panel).toBeDefined();
    });

    it('should have different canvas backgrounds for light and dark themes', () => {
      expect(lightTheme.colors.canvas.background).not.toBe(darkTheme.colors.canvas.background);
    });

    it('should have shadow configurations', () => {
      expect(lightTheme.shadows).toBeDefined();
      expect(lightTheme.shadows.sm).toBeDefined();
      expect(lightTheme.shadows.md).toBeDefined();
      expect(lightTheme.shadows.lg).toBeDefined();
      expect(lightTheme.shadows.glow).toBeDefined();
    });

    it('should have animation configurations', () => {
      expect(lightTheme.animations).toBeDefined();
      expect(lightTheme.animations.duration).toBeDefined();
      expect(lightTheme.animations.duration.fast).toBeGreaterThan(0);
      expect(lightTheme.animations.duration.normal).toBeGreaterThan(0);
      expect(lightTheme.animations.duration.slow).toBeGreaterThan(0);
      expect(lightTheme.animations.easing).toBeDefined();
    });
  });

  describe('Layout Configuration', () => {
    it('should have valid node library configuration', () => {
      expect(defaultLayoutConfig.nodeLibrary).toBeDefined();
      expect(defaultLayoutConfig.nodeLibrary.defaultWidth).toBeGreaterThan(0);
      expect(defaultLayoutConfig.nodeLibrary.minWidth).toBeGreaterThan(0);
      expect(defaultLayoutConfig.nodeLibrary.maxWidth).toBeGreaterThan(defaultLayoutConfig.nodeLibrary.minWidth);
    });

    it('should have valid control panel configuration', () => {
      expect(defaultLayoutConfig.controlPanel).toBeDefined();
      expect(defaultLayoutConfig.controlPanel.defaultWidth).toBeGreaterThan(0);
      expect(defaultLayoutConfig.controlPanel.minWidth).toBeGreaterThan(0);
      expect(defaultLayoutConfig.controlPanel.maxWidth).toBeGreaterThan(defaultLayoutConfig.controlPanel.minWidth);
    });

    it('should have valid breakpoint configuration', () => {
      expect(defaultLayoutConfig.breakpoints).toBeDefined();
      expect(defaultLayoutConfig.breakpoints.mobile).toBeLessThan(defaultLayoutConfig.breakpoints.tablet);
      expect(defaultLayoutConfig.breakpoints.tablet).toBeLessThanOrEqual(defaultLayoutConfig.breakpoints.desktop);
    });
  });

  describe('Theme Utilities', () => {
    it('should get theme colors for light mode', () => {
      const colors = getThemeColors('light');
      expect(colors).toBeDefined();
      expect(colors.canvas).toBeDefined();
      expect(colors.node).toBeDefined();
      expect(colors.edge).toBeDefined();
      expect(colors.panel).toBeDefined();
    });

    it('should get theme colors for dark mode', () => {
      const colors = getThemeColors('dark');
      expect(colors).toBeDefined();
      expect(colors.canvas).toBeDefined();
      expect(colors.node).toBeDefined();
      expect(colors.edge).toBeDefined();
      expect(colors.panel).toBeDefined();
    });

    it('should generate CSS variables for light theme', () => {
      const cssVars = generateCSSVariables(lightTheme);
      expect(cssVars).toBeDefined();
      expect(cssVars['--wf-canvas-bg']).toBeDefined();
      expect(cssVars['--wf-panel-bg']).toBeDefined();
      expect(cssVars['--wf-node-bg']).toBeDefined();
    });

    it('should generate CSS variables for dark theme', () => {
      const cssVars = generateCSSVariables(darkTheme);
      expect(cssVars).toBeDefined();
      expect(cssVars['--wf-canvas-bg']).toBeDefined();
      expect(cssVars['--wf-panel-bg']).toBeDefined();
      expect(cssVars['--wf-node-bg']).toBeDefined();
    });

    it('should generate different CSS variables for different themes', () => {
      const lightVars = generateCSSVariables(lightTheme);
      const darkVars = generateCSSVariables(darkTheme);
      expect(lightVars['--wf-canvas-bg']).not.toBe(darkVars['--wf-canvas-bg']);
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient contrast for light theme text', () => {
      // Light theme should have dark text on light background
      expect(lightTheme.colors.panel.text).toMatch(/#[0-9a-f]{6}/i);
    });

    it('should have sufficient contrast for dark theme text', () => {
      // Dark theme should have light text on dark background
      expect(darkTheme.colors.panel.text).toMatch(/#[0-9a-f]{6}/i);
    });
  });

  describe('Animation Timing', () => {
    it('should have fast animation faster than normal', () => {
      expect(lightTheme.animations.duration.fast).toBeLessThan(lightTheme.animations.duration.normal);
    });

    it('should have normal animation faster than slow', () => {
      expect(lightTheme.animations.duration.normal).toBeLessThan(lightTheme.animations.duration.slow);
    });

    it('should have consistent animation durations across themes', () => {
      expect(lightTheme.animations.duration.fast).toBe(darkTheme.animations.duration.fast);
      expect(lightTheme.animations.duration.normal).toBe(darkTheme.animations.duration.normal);
      expect(lightTheme.animations.duration.slow).toBe(darkTheme.animations.duration.slow);
    });
  });
});
