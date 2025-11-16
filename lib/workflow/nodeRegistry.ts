// Node Registry - Central registry for all workflow nodes
import { WorkflowNodeDefinition, NodeCategory } from './nodeDefinitions';
import { flowNodes } from './nodes/flowNodes';
import { basicNodes } from './nodes/basicNodes';
import { movementNodes } from './nodes/movementNodes';
import { aiNodes } from './nodes/aiNodes';
import { detectionNodes } from './nodes/detectionNodes';
import { challengeNodes } from './nodes/challengeNodes';
import { logicNodes } from './nodes/logicNodes';
import { dataNodes } from './nodes/dataNodes';
import {
  Workflow,
  Circle,
  Plane,
  ArrowUp,
  RotateCw,
  Zap,
  Eye,
  Settings,
  Camera,
  Brain,
  GitBranch,
  Database,
  Network,
  CheckCircle
} from 'lucide-react';

// Combine all node definitions
export const allNodes: WorkflowNodeDefinition[] = [
  ...flowNodes,
  ...basicNodes,
  ...movementNodes,
  ...aiNodes,
  ...detectionNodes,
  ...challengeNodes,
  ...logicNodes,
  ...dataNodes
];

// Node categories with icons and colors
export const nodeCategories = [
  { key: 'all', label: '全部', icon: Workflow, color: '#94a3b8' },
  { key: 'flow', label: '流程控制', icon: Circle, color: '#4ade80' },
  { key: 'basic', label: '基础控制', icon: Plane, color: '#60a5fa' },
  { key: 'movement', label: '移动控制', icon: ArrowUp, color: '#a78bfa' },
  { key: 'rotation', label: '旋转控制', icon: RotateCw, color: '#fbbf24' },
  { key: 'challenge', label: '挑战任务', icon: Zap, color: '#f97316' },
  { key: 'detection', label: '检测任务', icon: Eye, color: '#f59e0b' },
  { key: 'ai', label: 'AI分析', icon: Brain, color: '#8b5cf6' },
  { key: 'logic', label: '逻辑判断', icon: GitBranch, color: '#ec4899' },
  { key: 'data', label: '数据处理', icon: Database, color: '#6366f1' },
  { key: 'imaging', label: '图像采集', icon: Camera, color: '#10b981' },
];

// Node Registry Class
export class NodeRegistry {
  private static instance: NodeRegistry;
  private nodes: Map<string, WorkflowNodeDefinition>;

  private constructor() {
    this.nodes = new Map();
    this.registerNodes(allNodes);
  }

  static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }

  private registerNodes(nodes: WorkflowNodeDefinition[]): void {
    nodes.forEach(node => {
      this.nodes.set(node.type, node);
    });
  }

  getNode(type: string): WorkflowNodeDefinition | undefined {
    return this.nodes.get(type);
  }

  getAllNodes(): WorkflowNodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  getNodesByCategory(category: NodeCategory | 'all'): WorkflowNodeDefinition[] {
    if (category === 'all') {
      return this.getAllNodes();
    }
    return this.getAllNodes().filter(node => node.category === category);
  }

  getNodeTypes(): string[] {
    return Array.from(this.nodes.keys());
  }

  hasNode(type: string): boolean {
    return this.nodes.has(type);
  }

  // Validate node parameters
  validateNodeParameters(type: string, parameters: Record<string, any>): {
    valid: boolean;
    errors: Record<string, string>;
  } {
    const node = this.getNode(type);
    if (!node) {
      return { valid: false, errors: { _general: `未知的节点类型: ${type}` } };
    }

    const errors: Record<string, string> = {};

    node.parameters.forEach(param => {
      const value = parameters[param.name];

      // Check required parameters
      if (param.required && (value === undefined || value === null || value === '')) {
        errors[param.name] = `${param.label}是必填项`;
        return;
      }

      // Run custom validation if provided
      if (param.validation && value !== undefined && value !== null) {
        const validationResult = param.validation(value);
        if (validationResult !== true) {
          errors[param.name] = typeof validationResult === 'string' 
            ? validationResult 
            : `${param.label}验证失败`;
        }
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get default parameters for a node type
  getDefaultParameters(type: string): Record<string, any> {
    const node = this.getNode(type);
    if (!node) {
      return {};
    }

    const defaults: Record<string, any> = {};
    node.parameters.forEach(param => {
      defaults[param.name] = param.defaultValue;
    });

    return defaults;
  }
}

// Export singleton instance
export const nodeRegistry = NodeRegistry.getInstance();
