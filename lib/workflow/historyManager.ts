/**
 * History Manager
 * 
 * Manages undo/redo history for workflow operations.
 * Provides a robust history stack with configurable limits.
 * 
 * Features:
 * - Undo/Redo operations
 * - History limit (default 50)
 * - State snapshots
 * - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
 * 
 * Requirements: 10.4
 */

import { Node, Edge } from 'reactflow';

export interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

export interface HistoryManagerOptions {
  maxHistorySize?: number;
  onStateChange?: (state: WorkflowState) => void;
}

/**
 * HistoryManager Class
 * 
 * Manages workflow history with undo/redo capabilities.
 * Implements requirement 10.4 for undo/redo functionality.
 */
export class HistoryManager {
  private history: WorkflowState[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number;
  private onStateChange?: (state: WorkflowState) => void;
  private isApplyingHistory: boolean = false;

  constructor(options: HistoryManagerOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || 50;
    this.onStateChange = options.onStateChange;
  }

  /**
   * Push a new state to the history stack
   */
  pushState(nodes: Node[], edges: Edge[]): void {
    // Don't record if we're applying history
    if (this.isApplyingHistory) {
      return;
    }

    const state: WorkflowState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now(),
    };

    // Remove any states after current index (when undoing then making new changes)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push(state);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Undo to previous state
   */
  undo(): WorkflowState | null {
    if (!this.canUndo()) {
      return null;
    }

    this.currentIndex--;
    const state = this.history[this.currentIndex];
    
    this.isApplyingHistory = true;
    this.onStateChange?.(state);
    this.isApplyingHistory = false;

    return state;
  }

  /**
   * Redo to next state
   */
  redo(): WorkflowState | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    const state = this.history[this.currentIndex];
    
    this.isApplyingHistory = true;
    this.onStateChange?.(state);
    this.isApplyingHistory = false;

    return state;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrentState(): WorkflowState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Get history size
   */
  getHistorySize(): number {
    return this.history.length;
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history stats
   */
  getStats(): {
    size: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      size: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }
}

/**
 * Create a history manager instance
 */
export function createHistoryManager(
  options?: HistoryManagerOptions
): HistoryManager {
  return new HistoryManager(options);
}

/**
 * Hook for using history manager in React components
 */
export function useHistoryManager(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  options?: HistoryManagerOptions
) {
  const [historyManager] = React.useState(() => 
    createHistoryManager({
      ...options,
      onStateChange: (state) => {
        setNodes(state.nodes);
        setEdges(state.edges);
        options?.onStateChange?.(state);
      },
    })
  );

  // Record state changes
  React.useEffect(() => {
    historyManager.pushState(nodes, edges);
  }, [nodes, edges, historyManager]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        historyManager.undo();
      }
      // Ctrl+Y or Cmd+Shift+Z for redo
      else if (
        ((event.ctrlKey || event.metaKey) && event.key === 'y') ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')
      ) {
        event.preventDefault();
        historyManager.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyManager]);

  return historyManager;
}

// Import React for the hook
import React from 'react';
