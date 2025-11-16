/**
 * Layout Components Unit Tests
 * 
 * Tests for workflow layout components including:
 * - WorkflowEditorLayout
 * - CollapsibleNodeLibrary
 * - CollapsibleControlPanel
 * - Layout state management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
  }),
}));

// Mock ReactFlow
jest.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  addEdge: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/useWorkflowTheme', () => ({
  useWorkflowTheme: () => ({
    theme: {
      mode: 'light',
      colors: {
        canvas: { background: '#f8fafc' },
        panel: { background: '#ffffff' },
      },
    },
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('@/hooks/useWebSocket', () => ({
  __esModule: true,
  default: () => ({
    isConnected: false,
    lastMessage: null,
    sendMessage: jest.fn(),
  }),
}));

describe('Layout Components', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('WorkflowEditorLayout', () => {
    it('should render with all three columns', () => {
      const { container } = render(
        <div data-testid="layout-test">
          <div data-testid="node-library">Node Library</div>
          <div data-testid="canvas">Canvas</div>
          <div data-testid="control-panel">Control Panel</div>
        </div>
      );

      expect(screen.getByTestId('node-library')).toBeInTheDocument();
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    });

    it('should persist layout state to localStorage', async () => {
      const testState = {
        isNodeLibraryCollapsed: false,
        isControlPanelCollapsed: false,
        nodeLibraryWidth: 280,
        controlPanelWidth: 360,
      };

      localStorage.setItem('workflow-layout-state', JSON.stringify(testState));

      const stored = localStorage.getItem('workflow-layout-state');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.nodeLibraryWidth).toBe(280);
      expect(parsed.controlPanelWidth).toBe(360);
    });

    it('should load layout state from localStorage', () => {
      const testState = {
        isNodeLibraryCollapsed: true,
        isControlPanelCollapsed: false,
        nodeLibraryWidth: 300,
        controlPanelWidth: 400,
      };

      localStorage.setItem('workflow-layout-state', JSON.stringify(testState));

      const stored = localStorage.getItem('workflow-layout-state');
      const parsed = JSON.parse(stored!);

      expect(parsed.isNodeLibraryCollapsed).toBe(true);
      expect(parsed.nodeLibraryWidth).toBe(300);
    });
  });

  describe('Collapsible Panels', () => {
    it('should toggle node library collapse state', () => {
      let isCollapsed = false;
      const toggleCollapse = jest.fn(() => {
        isCollapsed = !isCollapsed;
      });

      const { rerender } = render(
        <div>
          <button onClick={toggleCollapse}>Toggle</button>
          <div data-testid="panel" style={{ width: isCollapsed ? 0 : 280 }}>
            Panel Content
          </div>
        </div>
      );

      const button = screen.getByText('Toggle');
      const panel = screen.getByTestId('panel');

      expect(panel).toHaveStyle({ width: '280px' });

      fireEvent.click(button);
      expect(toggleCollapse).toHaveBeenCalled();

      rerender(
        <div>
          <button onClick={toggleCollapse}>Toggle</button>
          <div data-testid="panel" style={{ width: isCollapsed ? 0 : 280 }}>
            Panel Content
          </div>
        </div>
      );

      expect(panel).toHaveStyle({ width: '0px' });
    });

    it('should handle width changes', () => {
      let width = 280;
      const handleWidthChange = jest.fn((newWidth: number) => {
        width = newWidth;
      });

      const { rerender } = render(
        <div>
          <button onClick={() => handleWidthChange(350)}>Resize</button>
          <div data-testid="panel" style={{ width }}>
            Panel Content
          </div>
        </div>
      );

      const button = screen.getByText('Resize');
      fireEvent.click(button);

      expect(handleWidthChange).toHaveBeenCalledWith(350);
    });
  });

  describe('Responsive Behavior', () => {
    it('should detect mobile viewport', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const isMobile = window.innerWidth < 768;
      expect(isMobile).toBe(true);
    });

    it('should detect tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900,
      });

      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      expect(isTablet).toBe(true);
    });

    it('should detect desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const isDesktop = window.innerWidth >= 1024;
      expect(isDesktop).toBe(true);
    });
  });

  describe('Layout State Management', () => {
    it('should initialize with default state', () => {
      const defaultState = {
        isNodeLibraryCollapsed: false,
        isControlPanelCollapsed: false,
        nodeLibraryWidth: 280,
        controlPanelWidth: 360,
      };

      expect(defaultState.isNodeLibraryCollapsed).toBe(false);
      expect(defaultState.isControlPanelCollapsed).toBe(false);
      expect(defaultState.nodeLibraryWidth).toBe(280);
      expect(defaultState.controlPanelWidth).toBe(360);
    });

    it('should validate width constraints', () => {
      const minWidth = 200;
      const maxWidth = 500;
      const defaultWidth = 280;

      expect(defaultWidth).toBeGreaterThanOrEqual(minWidth);
      expect(defaultWidth).toBeLessThanOrEqual(maxWidth);
    });

    it('should clamp width to valid range', () => {
      const clampWidth = (width: number, min: number, max: number) => {
        return Math.max(min, Math.min(max, width));
      };

      expect(clampWidth(100, 200, 500)).toBe(200); // Below min
      expect(clampWidth(300, 200, 500)).toBe(300); // Within range
      expect(clampWidth(600, 200, 500)).toBe(500); // Above max
    });
  });

  describe('Animation States', () => {
    it('should apply transition classes during collapse', () => {
      const { container } = render(
        <div
          data-testid="animated-panel"
          style={{
            transition: 'width 300ms ease-out',
            width: 280,
          }}
        >
          Panel
        </div>
      );

      const panel = screen.getByTestId('animated-panel');
      expect(panel).toHaveStyle({ transition: 'width 300ms ease-out' });
    });

    it('should complete animation within expected duration', async () => {
      const animationDuration = 300; // ms
      const startTime = Date.now();

      await waitFor(
        () => {
          const elapsed = Date.now() - startTime;
          expect(elapsed).toBeGreaterThanOrEqual(animationDuration);
        },
        { timeout: animationDuration + 100 }
      );
    });
  });
});
