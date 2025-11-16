// Workflow History and Version Management
// Tracks changes and maintains version history for workflows

import { WorkflowDefinition } from './workflowStorage';

export const WORKFLOW_HISTORY_KEY = 'tello_workflow_history';
export const MAX_HISTORY_ENTRIES = 50;

export interface WorkflowHistoryEntry {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: string;
  changeType: 'created' | 'updated' | 'loaded' | 'exported' | 'imported';
  changeDescription: string;
  snapshot?: WorkflowDefinition;
  nodeCount: number;
  edgeCount: number;
}

export interface WorkflowVersion {
  version: string;
  timestamp: string;
  changes: string[];
  snapshot: WorkflowDefinition;
}

/**
 * Workflow History Manager
 * Tracks workflow changes and maintains version history
 */
export class WorkflowHistoryManager {
  private historyKey: string;

  constructor(historyKey: string = WORKFLOW_HISTORY_KEY) {
    this.historyKey = historyKey;
  }

  /**
   * Add entry to workflow history
   */
  addHistoryEntry(entry: Omit<WorkflowHistoryEntry, 'id' | 'timestamp'>): void {
    try {
      const history = this.getHistory();
      
      const newEntry: WorkflowHistoryEntry = {
        ...entry,
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };

      history.unshift(newEntry);

      // Limit history size
      if (history.length > MAX_HISTORY_ENTRIES) {
        history.splice(MAX_HISTORY_ENTRIES);
      }

      localStorage.setItem(this.historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add history entry:', error);
    }
  }

  /**
   * Get all history entries
   */
  getHistory(workflowId?: string): WorkflowHistoryEntry[] {
    try {
      const data = localStorage.getItem(this.historyKey);
      if (!data) {
        return [];
      }

      const history = JSON.parse(data);
      
      if (workflowId) {
        return history.filter((entry: WorkflowHistoryEntry) => entry.workflowId === workflowId);
      }

      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  /**
   * Get recent history entries
   */
  getRecentHistory(limit: number = 10): WorkflowHistoryEntry[] {
    const history = this.getHistory();
    return history.slice(0, limit);
  }

  /**
   * Clear history for a specific workflow
   */
  clearWorkflowHistory(workflowId: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter(entry => entry.workflowId !== workflowId);
      localStorage.setItem(this.historyKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to clear workflow history:', error);
    }
  }

  /**
   * Clear all history
   */
  clearAllHistory(): void {
    try {
      localStorage.removeItem(this.historyKey);
    } catch (error) {
      console.error('Failed to clear all history:', error);
    }
  }

  /**
   * Get workflow versions (snapshots)
   */
  getWorkflowVersions(workflowId: string): WorkflowVersion[] {
    const history = this.getHistory(workflowId);
    
    return history
      .filter(entry => entry.snapshot && entry.changeType === 'updated')
      .map(entry => ({
        version: entry.snapshot!.metadata.version,
        timestamp: entry.timestamp,
        changes: [entry.changeDescription],
        snapshot: entry.snapshot!
      }));
  }

  /**
   * Restore workflow from history
   */
  restoreFromHistory(historyId: string): WorkflowDefinition | null {
    try {
      const history = this.getHistory();
      const entry = history.find(h => h.id === historyId);
      
      if (!entry || !entry.snapshot) {
        return null;
      }

      return entry.snapshot;
    } catch (error) {
      console.error('Failed to restore from history:', error);
      return null;
    }
  }

  /**
   * Get history statistics
   */
  getHistoryStats(): {
    totalEntries: number;
    uniqueWorkflows: number;
    oldestEntry?: string;
    newestEntry?: string;
  } {
    const history = this.getHistory();
    const uniqueWorkflows = new Set(history.map(h => h.workflowId));

    return {
      totalEntries: history.length,
      uniqueWorkflows: uniqueWorkflows.size,
      oldestEntry: history.length > 0 ? history[history.length - 1].timestamp : undefined,
      newestEntry: history.length > 0 ? history[0].timestamp : undefined
    };
  }
}

// Singleton instance
let historyManager: WorkflowHistoryManager | null = null;

export function getWorkflowHistoryManager(): WorkflowHistoryManager {
  if (!historyManager) {
    historyManager = new WorkflowHistoryManager();
  }
  return historyManager;
}
