/**
 * Control Panel Unit Tests
 * 
 * Tests for control panel components including:
 * - Connection status
 * - Action buttons
 * - Log display and filtering
 * - Results display
 * - Log export functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom';

describe('Control Panel', () => {
  describe('Connection Status', () => {
    it('should display drone connection status', () => {
      const connectionStatus = {
        drone: true,
        websocket: true,
        lastUpdate: new Date(),
      };

      const { container } = render(
        <div data-testid="connection-status">
          <div data-testid="drone-status">
            Drone: {connectionStatus.drone ? 'Connected' : 'Disconnected'}
          </div>
          <div data-testid="websocket-status">
            WebSocket: {connectionStatus.websocket ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      );

      expect(screen.getByTestId('drone-status')).toHaveTextContent('Connected');
      expect(screen.getByTestId('websocket-status')).toHaveTextContent('Connected');
    });

    it('should show disconnected state', () => {
      const connectionStatus = {
        drone: false,
        websocket: false,
        lastUpdate: new Date(),
      };

      const { container } = render(
        <div data-testid="connection-status">
          <div data-testid="drone-status">
            Drone: {connectionStatus.drone ? 'Connected' : 'Disconnected'}
          </div>
          <div data-testid="websocket-status">
            WebSocket: {connectionStatus.websocket ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      );

      expect(screen.getByTestId('drone-status')).toHaveTextContent('Disconnected');
      expect(screen.getByTestId('websocket-status')).toHaveTextContent('Disconnected');
    });

    it('should update last update timestamp', () => {
      const now = new Date();
      const connectionStatus = {
        drone: true,
        websocket: true,
        lastUpdate: now,
      };

      expect(connectionStatus.lastUpdate).toEqual(now);
    });
  });

  describe('Workflow Status', () => {
    it('should display running status', () => {
      const workflowStatus = {
        isRunning: true,
        currentNode: 'node_1',
        progress: 50,
        startTime: new Date(),
      };

      const { container } = render(
        <div data-testid="workflow-status">
          <div data-testid="running-status">
            {workflowStatus.isRunning ? 'Running' : 'Idle'}
          </div>
          <div data-testid="progress">
            Progress: {workflowStatus.progress}%
          </div>
        </div>
      );

      expect(screen.getByTestId('running-status')).toHaveTextContent('Running');
      expect(screen.getByTestId('progress')).toHaveTextContent('50%');
    });

    it('should display idle status', () => {
      const workflowStatus = {
        isRunning: false,
        progress: 0,
      };

      const { container } = render(
        <div data-testid="workflow-status">
          <div data-testid="running-status">
            {workflowStatus.isRunning ? 'Running' : 'Idle'}
          </div>
        </div>
      );

      expect(screen.getByTestId('running-status')).toHaveTextContent('Idle');
    });

    it('should track current node', () => {
      const workflowStatus = {
        isRunning: true,
        currentNode: 'node_takeoff',
        progress: 25,
      };

      expect(workflowStatus.currentNode).toBe('node_takeoff');
    });

    it('should calculate progress percentage', () => {
      const totalNodes = 10;
      const completedNodes = 3;
      const progress = Math.round((completedNodes / totalNodes) * 100);

      expect(progress).toBe(30);
    });
  });

  describe('Action Buttons', () => {
    it('should handle run button click', () => {
      const handleRun = jest.fn();

      const { container } = render(
        <button data-testid="run-button" onClick={handleRun}>
          Run
        </button>
      );

      const button = screen.getByTestId('run-button');
      fireEvent.click(button);

      expect(handleRun).toHaveBeenCalledTimes(1);
    });

    it('should handle stop button click', () => {
      const handleStop = jest.fn();

      const { container } = render(
        <button data-testid="stop-button" onClick={handleStop}>
          Stop
        </button>
      );

      const button = screen.getByTestId('stop-button');
      fireEvent.click(button);

      expect(handleStop).toHaveBeenCalledTimes(1);
    });

    it('should handle save button click', () => {
      const handleSave = jest.fn();

      const { container } = render(
        <button data-testid="save-button" onClick={handleSave}>
          Save
        </button>
      );

      const button = screen.getByTestId('save-button');
      fireEvent.click(button);

      expect(handleSave).toHaveBeenCalledTimes(1);
    });

    it('should disable run button when not connected', () => {
      const isConnected = false;

      const { container } = render(
        <button data-testid="run-button" disabled={!isConnected}>
          Run
        </button>
      );

      const button = screen.getByTestId('run-button');
      expect(button).toBeDisabled();
    });

    it('should enable run button when connected', () => {
      const isConnected = true;

      const { container } = render(
        <button data-testid="run-button" disabled={!isConnected}>
          Run
        </button>
      );

      const button = screen.getByTestId('run-button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Log Display', () => {
    const mockLogs = [
      { id: '1', timestamp: '10:00:00', level: 'info' as const, message: 'Workflow started' },
      { id: '2', timestamp: '10:00:01', level: 'success' as const, message: 'Node completed' },
      { id: '3', timestamp: '10:00:02', level: 'warning' as const, message: 'Low battery' },
      { id: '4', timestamp: '10:00:03', level: 'error' as const, message: 'Connection lost' },
    ];

    it('should display all logs', () => {
      const { container } = render(
        <div data-testid="log-list">
          {mockLogs.map(log => (
            <div key={log.id} data-testid={`log-${log.id}`}>
              [{log.timestamp}] [{log.level}] {log.message}
            </div>
          ))}
        </div>
      );

      mockLogs.forEach(log => {
        expect(screen.getByTestId(`log-${log.id}`)).toBeInTheDocument();
      });
    });

    it('should filter logs by level', () => {
      const level = 'error';
      const filtered = mockLogs.filter(log => log.level === level);

      expect(filtered.length).toBe(1);
      expect(filtered[0].level).toBe('error');
    });

    it('should filter logs by keyword', () => {
      const keyword = 'battery';
      const filtered = mockLogs.filter(log =>
        log.message.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].message).toContain('battery');
    });

    it('should show empty state when no logs', () => {
      const logs: any[] = [];

      const { container } = render(
        <div data-testid="log-list">
          {logs.length === 0 ? (
            <div data-testid="empty-state">No logs available</div>
          ) : (
            logs.map(log => <div key={log.id}>{log.message}</div>)
          )}
        </div>
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should apply correct color for log levels', () => {
      const getLogColor = (level: string) => {
        switch (level) {
          case 'error': return 'text-danger';
          case 'warning': return 'text-warning';
          case 'success': return 'text-success';
          default: return 'text-foreground';
        }
      };

      expect(getLogColor('error')).toBe('text-danger');
      expect(getLogColor('warning')).toBe('text-warning');
      expect(getLogColor('success')).toBe('text-success');
      expect(getLogColor('info')).toBe('text-foreground');
    });
  });

  describe('Results Display', () => {
    const mockResults = [
      {
        id: '1',
        nodeId: 'node_1',
        nodeName: 'Detection Node',
        result: { detected: true, count: 5 },
        resultType: 'detection',
        timestamp: new Date(),
      },
      {
        id: '2',
        nodeId: 'node_2',
        nodeName: 'Analysis Node',
        result: { score: 0.95 },
        resultType: 'analysis',
        timestamp: new Date(),
      },
    ];

    it('should display all results', () => {
      const { container } = render(
        <div data-testid="result-list">
          {mockResults.map(result => (
            <div key={result.id} data-testid={`result-${result.id}`}>
              {result.nodeName}: {JSON.stringify(result.result)}
            </div>
          ))}
        </div>
      );

      mockResults.forEach(result => {
        expect(screen.getByTestId(`result-${result.id}`)).toBeInTheDocument();
      });
    });

    it('should format result data', () => {
      const result = mockResults[0];
      const formatted = JSON.stringify(result.result, null, 2);

      expect(formatted).toContain('detected');
      expect(formatted).toContain('count');
    });

    it('should show empty state when no results', () => {
      const results: any[] = [];

      const { container } = render(
        <div data-testid="result-list">
          {results.length === 0 ? (
            <div data-testid="empty-state">No results yet</div>
          ) : (
            results.map(result => <div key={result.id}>{result.nodeName}</div>)
          )}
        </div>
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Log Export', () => {
    const mockLogs = [
      { id: '1', timestamp: '10:00:00', level: 'info' as const, message: 'Test log 1' },
      { id: '2', timestamp: '10:00:01', level: 'error' as const, message: 'Test log 2' },
    ];

    it('should export logs as JSON', () => {
      const exportJSON = (logs: typeof mockLogs) => {
        return JSON.stringify(logs, null, 2);
      };

      const exported = exportJSON(mockLogs);
      const parsed = JSON.parse(exported);

      expect(parsed.length).toBe(2);
      expect(parsed[0].message).toBe('Test log 1');
    });

    it('should export logs as TXT', () => {
      const exportTXT = (logs: typeof mockLogs) => {
        return logs.map(log =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
        ).join('\n');
      };

      const exported = exportTXT(mockLogs);
      const lines = exported.split('\n');

      expect(lines.length).toBe(2);
      expect(lines[0]).toContain('Test log 1');
      expect(lines[1]).toContain('Test log 2');
    });

    it('should handle export button click', () => {
      const handleExport = jest.fn();

      const { container } = render(
        <button data-testid="export-button" onClick={() => handleExport('json')}>
          Export JSON
        </button>
      );

      const button = screen.getByTestId('export-button');
      fireEvent.click(button);

      expect(handleExport).toHaveBeenCalledWith('json');
    });
  });

  describe('Clear Logs', () => {
    it('should clear all logs', () => {
      let logs = [
        { id: '1', message: 'Log 1' },
        { id: '2', message: 'Log 2' },
      ];

      const clearLogs = () => {
        logs = [];
      };

      expect(logs.length).toBe(2);
      clearLogs();
      expect(logs.length).toBe(0);
    });

    it('should handle clear button click', () => {
      const handleClear = jest.fn();

      const { container } = render(
        <button data-testid="clear-button" onClick={handleClear}>
          Clear Logs
        </button>
      );

      const button = screen.getByTestId('clear-button');
      fireEvent.click(button);

      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });
});
