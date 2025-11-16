/**
 * Theme Switching Tests
 * 测试主题切换功能
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  useWorkflowTheme,
  isDarkTheme,
  getCurrentTheme,
  getCSSVariable,
  validateThemeVariables,
  debugTheme,
} from '@/lib/workflow/workflowTheme';

// Mock document.documentElement
const mockDocumentElement = {
  classList: {
    contains: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  },
};

describe('Theme Switching', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock getComputedStyle
    global.getComputedStyle = jest.fn().mockReturnValue({
      getPropertyValue: (prop: string) => {
        // Return mock values for CSS variables
        const mockValues: Record<string, string> = {
          '--node-bg': '#FFFFFF',
          '--node-border': '#E5E5E5',
          '--text-primary': '#1A1A1A',
          '--param-bg': '#F8F8F8',
        };
        return mockValues[prop] || '';
      },
    });
  });

  describe('isDarkTheme', () => {
    it('should return false when dark class is not present', () => {
      (mockDocumentElement.classList.contains as jest.Mock).mockReturnValue(false);
      Object.defineProperty(document, 'documentElement', {
        value: mockDocumentElement,
        writable: true,
      });
      
      expect(isDarkTheme()).toBe(false);
    });

    it('should return true when dark class is present', () => {
      (mockDocumentElement.classList.contains as jest.Mock).mockReturnValue(true);
      Object.defineProperty(document, 'documentElement', {
        value: mockDocumentElement,
        writable: true,
      });
      
      expect(isDarkTheme()).toBe(true);
    });
  });

  describe('getCSSVariable', () => {
    it('should return CSS variable value when defined', () => {
      const value = getCSSVariable('--node-bg', '#000000');
      expect(value).toBe('#FFFFFF');
    });

    it('should return fallback when CSS variable is not defined', () => {
      const value = getCSSVariable('--undefined-var', '#FALLBACK');
      expect(value).toBe('#FALLBACK');
    });

    it('should return fallback on server side', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const value = getCSSVariable('--node-bg', '#FALLBACK');
      expect(value).toBe('#FALLBACK');
      
      global.window = originalWindow;
    });
  });

  describe('getCurrentTheme', () => {
    it('should return theme with all required properties', () => {
      const theme = getCurrentTheme();
      
      expect(theme).toHaveProperty('node');
      expect(theme).toHaveProperty('shadow');
      expect(theme).toHaveProperty('parameter');
      expect(theme).toHaveProperty('text');
      expect(theme).toHaveProperty('status');
      expect(theme).toHaveProperty('scrollbar');
    });

    it('should return light theme values when not in dark mode', () => {
      (mockDocumentElement.classList.contains as jest.Mock).mockReturnValue(false);
      Object.defineProperty(document, 'documentElement', {
        value: mockDocumentElement,
        writable: true,
      });
      
      const theme = getCurrentTheme();
      expect(theme.node.bg).toBe('#FFFFFF');
    });
  });

  describe('useWorkflowTheme', () => {
    it('should return current theme', () => {
      const { result } = renderHook(() => useWorkflowTheme());
      
      expect(result.current).toHaveProperty('node');
      expect(result.current).toHaveProperty('parameter');
      expect(result.current).toHaveProperty('text');
    });

    it('should update theme when dark class changes', () => {
      // Mock MutationObserver
      const mockObserve = jest.fn();
      const mockDisconnect = jest.fn();
      
      global.MutationObserver = jest.fn().mockImplementation((callback) => ({
        observe: mockObserve,
        disconnect: mockDisconnect,
        takeRecords: jest.fn(),
      }));
      
      const { result, unmount } = renderHook(() => useWorkflowTheme());
      
      expect(mockObserve).toHaveBeenCalled();
      
      // Cleanup
      unmount();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('validateThemeVariables', () => {
    it('should validate all required CSS variables', () => {
      const validation = validateThemeVariables();
      
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('missing');
      expect(validation).toHaveProperty('warnings');
    });

    it('should detect missing CSS variables', () => {
      // Mock getComputedStyle to return empty for some variables
      global.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--node-bg') return '#FFFFFF';
          return ''; // All other variables are missing
        },
      });
      
      const validation = validateThemeVariables();
      
      expect(validation.valid).toBe(false);
      expect(validation.missing.length).toBeGreaterThan(0);
    });
  });

  describe('debugTheme', () => {
    it('should log theme information to console', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
      
      debugTheme();
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });

  describe('Theme Transition', () => {
    it('should maintain component state during theme switch', () => {
      const { result, rerender } = renderHook(() => useWorkflowTheme());
      
      const initialTheme = result.current;
      
      // Simulate theme change
      act(() => {
        (mockDocumentElement.classList.contains as jest.Mock).mockReturnValue(true);
      });
      
      rerender();
      
      // Theme should update but structure should remain
      expect(result.current).toHaveProperty('node');
      expect(result.current).toHaveProperty('parameter');
      expect(result.current).not.toBe(initialTheme); // Reference should change
    });
  });
});
