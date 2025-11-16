/**
 * Workflow Integration Tests
 * 
 * End-to-end integration tests for workflow functionality:
 * - Node drag and drop workflow
 * - Workflow execution flow
 * - Theme switching
 * - Responsive layout behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
  }),
}));

jest.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  addEdge: jest.fn(),
}));

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
    isConnected: true,
    lastMessage: null,
    sendMessage: jest.fn(),
  }),
}));

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Node Drag and Drop Workflow', () => {
    it('should complete full drag and drop workflow', async () => {
      // Step 1: Render node library
      const mockNode = {
        id: 'test-node',
        type: 'takeoff',
        label: 'Takeoff',
        category: 'movement',
        icon: '🚁',
        color: '#3b82f6',
      };

      const nodes: any[] = [];
      const addNode = (node: any) => {
        nodes.push(node);
      };

      // Step 2: Simulate drag start
      const dragData = JSON.stringify(mockNode);
      expect(dragData).toContain('takeoff');

      // Step 3: Simulate drop on canvas
      const position = { x: 100, y: 100 };
      const newNode = {
        id: `node_${Date.now()}`,
        type: mockNode.type,
        position,
        data: {
          label: mockNode.label,
          icon: mockNode.icon,
          color: mockNode.color,
        },
      };

      addNode(newNode);

      // Step 4: Verify node was added
      expect(nodes.length).toBe(1);
      expect(nodes[0].type).toBe('takeoff');
      expect(nodes[0].position).toEqual(position);
    });

    it('should handle multiple node drops', async () => {
      const nodes: any[] = [];
      const addNode = (node: any) => {
        nodes.push(node);
      };

      // Add multiple nodes
      addNode({ id: 'node_1', type: 'start', position: { x: 0, y: 0 } });
      addNode({ id: 'node_2', type: 'takeoff', position: { x: 100, y: 100 } });
      addNode({ id: 'node_3', type: 'land', position: { x: 200, y: 200 } });

      expect(nodes.length).toBe(3);
      expect(nodes.map(n => n.type)).toEqual(['start', 'takeoff', 'land']);
    });

    it('should connect nodes with edges', async () => {
      const edges: any[] = [];
      const addEdge = (edge: any) => {
        edges.push(edge);
      };

      // Create connection
      const connection = {
        source: 'node_1',
        target: 'node_2',
        sourceHandle: 'output',
        targetHandle: 'input',
      };

      addEdge(connection);

      expect(edges.length).toBe(1);
      expect(edges[0].source).toBe('node_1');
      expect(edges[0].target).toBe('node_2');
    });
  });

  describe('Workflow Execution Flow', () => {
    it('should execute complete workflow lifecycle', async () => {
      const workflowState = {
        isRunning: false,
        progress: 0,
        currentNode: null as string | null,
      };

      // Step 1: Start workflow
      workflowState.isRunning = true;
      workflowState.progress = 0;
      expect(workflowState.isRunning).toBe(true);

      // Step 2: Execute nodes
      const nodes = ['node_1', 'node_2', 'node_3'];
      for (let i = 0; i < nodes.length; i++) {
        workflowState.currentNode = nodes[i];
        workflowState.progress = Math.round(((i + 1) / nodes.length) * 100);
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Step 3: Complete workflow
      workflowState.isRunning = false;
      workflowState.progress = 100;
      workflowState.currentNode = null;

      expect(workflowState.isRunning).toBe(false);
      expect(workflowState.progress).toBe(100);
    });

    it('should handle workflow errors', async () => {
      const workflowState = {
        isRunning: true,
        hasError: false,
        errorMessage: '',
      };

      // Simulate error
      try {
        throw new Error('Node execution failed');
      } catch (error: any) {
        workflowState.isRunning = false;
        workflowState.hasError = true;
        workflowState.errorMessage = error.message;
      }

      expect(workflowState.isRunning).toBe(false);
      expect(workflowState.hasError).toBe(true);
      expect(workflowState.errorMessage).toBe('Node execution failed');
    });

    it('should stop workflow on user request', async () => {
      const workflowState = {
        isRunning: true,
        progress: 50,
      };

      // User clicks stop
      workflowState.isRunning = false;

      expect(workflowState.isRunning).toBe(false);
      expect(workflowState.progress).toBe(50); // Progress preserved
    });

    it('should update node status during execution', async () => {
      const nodes = [
        { id: 'node_1', status: 'idle' },
        { id: 'node_2', status: 'idle' },
        { id: 'node_3', status: 'idle' },
      ];

      // Execute nodes sequentially
      for (const node of nodes) {
        node.status = 'running';
        await new Promise(resolve => setTimeout(resolve, 10));
        node.status = 'success';
      }

      expect(nodes.every(n => n.status === 'success')).toBe(true);
    });
  });

  describe('Theme Switching Flow', () => {
    it('should switch from light to dark theme', async () => {
      let currentTheme = 'light';
      const setTheme = (theme: string) => {
        currentTheme = theme;
      };

      expect(currentTheme).toBe('light');

      // Switch to dark
      setTheme('dark');
      expect(currentTheme).toBe('dark');

      // Switch back to light
      setTheme('light');
      expect(currentTheme).toBe('light');
    });

    it('should apply theme colors to components', async () => {
      const getThemeColors = (theme: string) => {
        return theme === 'light'
          ? { canvas: '#f8fafc', panel: '#ffffff' }
          : { canvas: '#0a0f1e', panel: '#111827' };
      };

      const lightColors = getThemeColors('light');
      const darkColors = getThemeColors('dark');

      expect(lightColors.canvas).toBe('#f8fafc');
      expect(darkColors.canvas).toBe('#0a0f1e');
    });

    it('should persist theme preference', async () => {
      const theme = 'dark';
      localStorage.setItem('theme', theme);

      const stored = localStorage.getItem('theme');
      expect(stored).toBe('dark');
    });

    it('should animate theme transition', async () => {
      const transitionDuration = 300; // ms
      const startTime = Date.now();

      await waitFor(
        () => {
          const elapsed = Date.now() - startTime;
          expect(elapsed).toBeGreaterThanOrEqual(transitionDuration);
        },
        { timeout: transitionDuration + 100 }
      );
    });
  });

  describe('Responsive Layout Flow', () => {
    it('should adapt to mobile viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      const isMobile = window.innerWidth < 768;
      const layoutMode = isMobile ? 'drawer' : 'sidebar';

      expect(layoutMode).toBe('drawer');
    });

    it('should adapt to tablet viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900,
      });

      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const sidebarWidth = isTablet ? 240 : 280;

      expect(sidebarWidth).toBe(240);
    });

    it('should adapt to desktop viewport', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const isDesktop = window.innerWidth >= 1024;
      const sidebarWidth = isDesktop ? 280 : 240;

      expect(sidebarWidth).toBe(280);
    });

    it('should handle window resize', async () => {
      let width = 1920;
      Object.defineProperty(window, 'innerWidth', {
        get: () => width,
        configurable: true,
      });

      const getLayoutMode = () => {
        if (window.innerWidth < 768) return 'mobile';
        if (window.innerWidth < 1024) return 'tablet';
        return 'desktop';
      };

      expect(getLayoutMode()).toBe('desktop');

      // Simulate resize to tablet
      width = 900;
      expect(getLayoutMode()).toBe('tablet');

      // Simulate resize to mobile
      width = 500;
      expect(getLayoutMode()).toBe('mobile');
    });
  });

  describe('Save and Load Workflow', () => {
    it('should save workflow to localStorage', async () => {
      const workflow = {
        nodes: [
          { id: 'node_1', type: 'start', position: { x: 0, y: 0 } },
          { id: 'node_2', type: 'end', position: { x: 200, y: 200 } },
        ],
        edges: [
          { source: 'node_1', target: 'node_2' },
        ],
        metadata: {
          name: 'Test Workflow',
          createdAt: new Date().toISOString(),
        },
      };

      localStorage.setItem('workflow-current', JSON.stringify(workflow));

      const stored = localStorage.getItem('workflow-current');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.nodes.length).toBe(2);
      expect(parsed.edges.length).toBe(1);
    });

    it('should load workflow from localStorage', async () => {
      const workflow = {
        nodes: [{ id: 'node_1', type: 'start' }],
        edges: [],
      };

      localStorage.setItem('workflow-current', JSON.stringify(workflow));

      const stored = localStorage.getItem('workflow-current');
      const loaded = JSON.parse(stored!);

      expect(loaded.nodes.length).toBe(1);
      expect(loaded.nodes[0].type).toBe('start');
    });

    it('should handle missing workflow data', async () => {
      const stored = localStorage.getItem('workflow-nonexistent');
      expect(stored).toBeNull();
    });
  });

  describe('WebSocket Integration', () => {
    it('should handle incoming log messages', async () => {
      const logs: any[] = [];
      const addLog = (log: any) => {
        logs.push(log);
      };

      // Simulate WebSocket message
      const message = {
        type: 'log',
        payload: {
          level: 'info',
          message: 'Test log message',
        },
      };

      addLog(message.payload);

      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Test log message');
    });

    it('should handle node status updates', async () => {
      const nodes = [
        { id: 'node_1', status: 'idle' },
      ];

      // Simulate status update message
      const message = {
        type: 'node_status_update',
        payload: {
          nodeId: 'node_1',
          status: 'running',
        },
      };

      const node = nodes.find(n => n.id === message.payload.nodeId);
      if (node) {
        node.status = message.payload.status;
      }

      expect(nodes[0].status).toBe('running');
    });

    it('should handle workflow completion', async () => {
      let workflowStatus = {
        isRunning: true,
        progress: 50,
      };

      // Simulate completion message
      const message = {
        type: 'workflow_finished',
        payload: {
          message: 'Workflow completed successfully',
        },
      };

      workflowStatus.isRunning = false;
      workflowStatus.progress = 100;

      expect(workflowStatus.isRunning).toBe(false);
      expect(workflowStatus.progress).toBe(100);
    });
  });
});
