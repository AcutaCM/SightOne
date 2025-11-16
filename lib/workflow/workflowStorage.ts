// Workflow Storage Service
// Handles workflow persistence, versioning, and validation

export const WORKFLOW_STORAGE_KEY = 'tello_workflows';
export const WORKFLOW_VERSION = '1.0.0';

export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
  estimatedDuration?: number;
}

export interface WorkflowNodeData {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: string;
    parameters: Record<string, any>;
    status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
    result?: any;
  };
}

export interface WorkflowEdgeData {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'conditional';
  condition?: string;
  label?: string;
}

export interface WorkflowDefinition {
  metadata: WorkflowMetadata;
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  variables: Record<string, any>;
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Workflow Storage Manager
 * Manages workflow persistence with localStorage
 */
export class WorkflowStorageManager {
  private storageKey: string;

  constructor(storageKey: string = WORKFLOW_STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  /**
   * Save a workflow to localStorage
   */
  saveWorkflow(workflow: WorkflowDefinition): boolean {
    try {
      // Validate workflow before saving
      const validation = this.validateWorkflow(workflow);
      if (!validation.valid) {
        console.error('Workflow validation failed:', validation.errors);
        return false;
      }

      // Update metadata
      workflow.metadata.updatedAt = new Date().toISOString();
      workflow.metadata.version = WORKFLOW_VERSION;

      // Get existing workflows
      const workflows = this.getAllWorkflows();

      // Check if workflow exists (update) or new (create)
      const existingIndex = workflows.findIndex(w => w.metadata.id === workflow.metadata.id);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow;
      } else {
        workflows.push(workflow);
      }

      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(workflows));
      
      return true;
    } catch (error) {
      console.error('Failed to save workflow:', error);
      return false;
    }
  }

  /**
   * Load a workflow by ID
   */
  loadWorkflow(id: string): WorkflowDefinition | null {
    try {
      const workflows = this.getAllWorkflows();
      const workflow = workflows.find(w => w.metadata.id === id);
      
      if (!workflow) {
        return null;
      }

      // Validate and migrate if needed
      return this.migrateWorkflow(workflow);
    } catch (error) {
      console.error('Failed to load workflow:', error);
      return null;
    }
  }

  /**
   * Get all workflows from localStorage
   */
  getAllWorkflows(): WorkflowDefinition[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }

      const workflows = JSON.parse(data);
      return Array.isArray(workflows) ? workflows : [];
    } catch (error) {
      console.error('Failed to get workflows:', error);
      return [];
    }
  }

  /**
   * Delete a workflow by ID
   */
  deleteWorkflow(id: string): boolean {
    try {
      const workflows = this.getAllWorkflows();
      const filtered = workflows.filter(w => w.metadata.id !== id);
      
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      return false;
    }
  }

  /**
   * Duplicate a workflow
   */
  duplicateWorkflow(id: string, newName?: string): WorkflowDefinition | null {
    try {
      const original = this.loadWorkflow(id);
      if (!original) {
        return null;
      }

      const duplicate: WorkflowDefinition = {
        ...original,
        metadata: {
          ...original.metadata,
          id: this.generateId(),
          name: newName || `${original.metadata.name} (副本)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      };

      this.saveWorkflow(duplicate);
      return duplicate;
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
      return null;
    }
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow: WorkflowDefinition): WorkflowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check metadata
    if (!workflow.metadata) {
      errors.push('缺少工作流元数据');
    } else {
      if (!workflow.metadata.id) errors.push('缺少工作流ID');
      if (!workflow.metadata.name) errors.push('缺少工作流名称');
      if (!workflow.metadata.version) warnings.push('缺少版本信息');
    }

    // Check nodes
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('节点数据无效');
    } else {
      if (workflow.nodes.length === 0) {
        warnings.push('工作流没有节点');
      }

      // Check for start and end nodes
      const hasStart = workflow.nodes.some(n => 
        n.type === 'start' || n.data?.nodeType === 'start'
      );
      const hasEnd = workflow.nodes.some(n => 
        n.type === 'end' || n.data?.nodeType === 'end'
      );

      if (!hasStart) warnings.push('缺少开始节点');
      if (!hasEnd) warnings.push('缺少结束节点');

      // Check for duplicate IDs
      const nodeIds = workflow.nodes.map(n => n.id);
      const uniqueIds = new Set(nodeIds);
      if (nodeIds.length !== uniqueIds.size) {
        errors.push('存在重复的节点ID');
      }
    }

    // Check edges
    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      errors.push('连接数据无效');
    } else {
      // Validate edge references
      const nodeIds = new Set(workflow.nodes.map(n => n.id));
      workflow.edges.forEach((edge, index) => {
        if (!nodeIds.has(edge.source)) {
          errors.push(`连接 ${index} 的源节点不存在: ${edge.source}`);
        }
        if (!nodeIds.has(edge.target)) {
          errors.push(`连接 ${index} 的目标节点不存在: ${edge.target}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Migrate workflow to current version
   */
  private migrateWorkflow(workflow: any): WorkflowDefinition {
    // Handle legacy format (from old TelloWorkflowPanel)
    if (!workflow.metadata && workflow.id) {
      return {
        metadata: {
          id: workflow.id,
          name: workflow.name || 'Untitled Workflow',
          description: workflow.description || '',
          version: WORKFLOW_VERSION,
          author: 'Unknown',
          tags: [],
          createdAt: workflow.timestamp || new Date().toISOString(),
          updatedAt: workflow.timestamp || new Date().toISOString(),
          nodeCount: workflow.nodeCount || workflow.nodes?.length || 0,
          edgeCount: workflow.edgeCount || workflow.edges?.length || 0,
        },
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        variables: {}
      };
    }

    return workflow;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export workflow to JSON file
   */
  exportWorkflow(workflow: WorkflowDefinition): void {
    try {
      const dataStr = JSON.stringify(workflow, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflow.metadata.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export workflow:', error);
      throw error;
    }
  }

  /**
   * Import workflow from JSON file
   */
  async importWorkflow(file: File): Promise<WorkflowDefinition> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target?.result as string);
          
          // Validate imported workflow
          const validation = this.validateWorkflow(workflow);
          if (!validation.valid) {
            reject(new Error(`工作流验证失败: ${validation.errors.join(', ')}`));
            return;
          }

          // Assign new ID to avoid conflicts
          workflow.metadata.id = this.generateId();
          workflow.metadata.createdAt = new Date().toISOString();
          workflow.metadata.updatedAt = new Date().toISOString();

          resolve(workflow);
        } catch (error) {
          reject(new Error('无效的工作流文件格式'));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Clear all workflows (with confirmation)
   */
  clearAllWorkflows(): boolean {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear workflows:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalWorkflows: number;
    totalSize: number;
    averageNodeCount: number;
    averageEdgeCount: number;
  } {
    const workflows = this.getAllWorkflows();
    const totalSize = new Blob([JSON.stringify(workflows)]).size;
    
    return {
      totalWorkflows: workflows.length,
      totalSize,
      averageNodeCount: workflows.length > 0 
        ? workflows.reduce((sum, w) => sum + w.metadata.nodeCount, 0) / workflows.length 
        : 0,
      averageEdgeCount: workflows.length > 0
        ? workflows.reduce((sum, w) => sum + w.metadata.edgeCount, 0) / workflows.length
        : 0
    };
  }
}

// Singleton instance
let storageManager: WorkflowStorageManager | null = null;

export function getWorkflowStorageManager(): WorkflowStorageManager {
  if (!storageManager) {
    storageManager = new WorkflowStorageManager();
  }
  return storageManager;
}
