// 工作流验证系统
// Workflow Validation System

import { WorkflowNode, WorkflowEdge } from '../workflowEngine';
import { nodeRegistry } from './nodeRegistry';
import { ParameterValidator } from './nodeDefinitions';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  type: 'missing_start' | 'missing_end' | 'circular_dependency' | 'invalid_parameter' | 'disconnected_node' | 'invalid_connection' | 'duplicate_node_id';
  severity: 'error' | 'warning';
  nodeId?: string;
  message: string;
  details?: any;
}

export interface ValidationWarning {
  type: 'unreachable_node' | 'unused_variable' | 'missing_optional_param' | 'performance_concern';
  nodeId?: string;
  message: string;
  details?: any;
}

export interface ValidationSuggestion {
  type: 'add_node' | 'fix_parameter' | 'remove_node' | 'add_connection' | 'remove_connection';
  message: string;
  action?: () => void;
  autoFixable: boolean;
  details?: any;
}

export class WorkflowValidator {
  private nodes: WorkflowNode[];
  private edges: WorkflowEdge[];
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];
  private suggestions: ValidationSuggestion[] = [];

  constructor(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * 执行完整的工作流验证
   */
  validate(): ValidationResult {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];

    // 1. 检查工作流完整性
    this.validateCompleteness();

    // 2. 检测循环依赖
    this.detectCircularDependencies();

    // 3. 验证节点参数
    this.validateNodeParameters();

    // 4. 检查连接有效性
    this.validateConnections();

    // 5. 检查孤立节点
    this.detectDisconnectedNodes();

    // 6. 检查不可达节点
    this.detectUnreachableNodes();

    // 7. 检查重复节点ID
    this.detectDuplicateNodeIds();

    // 8. 生成修复建议
    this.generateSuggestions();

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions
    };
  }

  /**
   * 1. 检查工作流完整性（起始和结束节点）
   */
  private validateCompleteness(): void {
    const startNodes = this.nodes.filter(node => 
      node.type === 'start' || node.data?.nodeType === 'start'
    );

    const endNodes = this.nodes.filter(node => 
      node.type === 'end' || node.data?.nodeType === 'end'
    );

    if (startNodes.length === 0) {
      this.errors.push({
        type: 'missing_start',
        severity: 'error',
        message: '工作流缺少起始节点',
        details: { required: true }
      });
    }

    if (startNodes.length > 1) {
      this.warnings.push({
        type: 'unreachable_node',
        message: `工作流包含多个起始节点 (${startNodes.length}个)，只有第一个会被执行`,
        details: { nodeIds: startNodes.map(n => n.id) }
      });
    }

    if (endNodes.length === 0) {
      this.errors.push({
        type: 'missing_end',
        severity: 'error',
        message: '工作流缺少结束节点',
        details: { required: true }
      });
    }

    // 检查是否有节点
    if (this.nodes.length === 0) {
      this.errors.push({
        type: 'missing_start',
        severity: 'error',
        message: '工作流为空，请添加节点',
        details: {}
      });
    }
  }

  /**
   * 2. 检测循环依赖和死锁
   */
  private detectCircularDependencies(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (nodeId: string, path: string[]): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      // 获取所有出边
      const outgoingEdges = this.edges.filter(edge => edge.source === nodeId);

      for (const edge of outgoingEdges) {
        const targetId = edge.target;

        if (!visited.has(targetId)) {
          if (dfs(targetId, [...path])) {
            return true;
          }
        } else if (recursionStack.has(targetId)) {
          // 发现循环
          const cycleStart = path.indexOf(targetId);
          const cycle = path.slice(cycleStart);
          cycle.push(targetId);
          cycles.push(cycle);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    // 从每个节点开始DFS
    for (const node of this.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    }

    // 报告循环依赖
    if (cycles.length > 0) {
      for (const cycle of cycles) {
        const cycleNodes = cycle.map(id => {
          const node = this.nodes.find(n => n.id === id);
          return node?.data?.label || id;
        });

        this.errors.push({
          type: 'circular_dependency',
          severity: 'error',
          message: `检测到循环依赖: ${cycleNodes.join(' → ')}`,
          details: { cycle, nodeIds: cycle }
        });
      }
    }
  }

  /**
   * 3. 验证节点参数有效性
   */
  private validateNodeParameters(): void {
    for (const node of this.nodes) {
      const nodeType = node.data?.nodeType || node.type;
      const parameters = node.data?.parameters || {};

      // 从节点注册表获取节点定义
      const nodeDefinition = nodeRegistry.getNode(nodeType);

      if (!nodeDefinition) {
        this.warnings.push({
          type: 'unreachable_node',
          nodeId: node.id,
          message: `未知的节点类型: ${nodeType}`,
          details: { nodeType }
        });
        continue;
      }

      // 验证每个参数
      for (const paramDef of nodeDefinition.parameters) {
        const paramValue = parameters[paramDef.name];

        // 检查必填参数
        if (paramDef.required && (paramValue === undefined || paramValue === null || paramValue === '')) {
          this.errors.push({
            type: 'invalid_parameter',
            severity: 'error',
            nodeId: node.id,
            message: `节点 "${node.data.label}" 缺少必填参数: ${paramDef.label}`,
            details: {
              parameter: paramDef.name,
              parameterLabel: paramDef.label
            }
          });
          continue;
        }

        // 如果参数为空且非必填，跳过验证
        if (paramValue === undefined || paramValue === null || paramValue === '') {
          continue;
        }

        // 使用参数定义中的验证函数
        if (paramDef.validation) {
          const validationResult = paramDef.validation(paramValue);
          if (validationResult !== true) {
            this.errors.push({
              type: 'invalid_parameter',
              severity: 'error',
              nodeId: node.id,
              message: `节点 "${node.data.label}" 参数 "${paramDef.label}" 验证失败: ${validationResult}`,
              details: {
                parameter: paramDef.name,
                parameterLabel: paramDef.label,
                value: paramValue,
                validationError: validationResult
              }
            });
          }
        }

        // 基于类型的验证
        const typeValidation = this.validateParameterType(paramValue, paramDef);
        if (typeValidation !== true) {
          this.errors.push({
            type: 'invalid_parameter',
            severity: 'error',
            nodeId: node.id,
            message: `节点 "${node.data.label}" 参数 "${paramDef.label}": ${typeValidation}`,
            details: {
              parameter: paramDef.name,
              parameterLabel: paramDef.label,
              value: paramValue,
              expectedType: paramDef.type
            }
          });
        }
      }
    }
  }

  /**
   * 验证参数类型
   */
  private validateParameterType(value: any, paramDef: any): boolean | string {
    switch (paramDef.type) {
      case 'number':
      case 'slider':
        return ParameterValidator.validateNumber(value, paramDef.min, paramDef.max);
      
      case 'string':
      case 'textarea':
        return ParameterValidator.validateString(value);
      
      case 'boolean':
        return ParameterValidator.validateBoolean(value);
      
      case 'select':
        if (paramDef.options) {
          return ParameterValidator.validateSelect(value, paramDef.options);
        }
        return true;
      
      case 'json':
        return ParameterValidator.validateJSON(value);
      
      default:
        return true;
    }
  }

  /**
   * 4. 检查连接有效性
   */
  private validateConnections(): void {
    for (const edge of this.edges) {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const targetNode = this.nodes.find(n => n.id === edge.target);

      if (!sourceNode) {
        this.errors.push({
          type: 'invalid_connection',
          severity: 'error',
          message: `连接的源节点不存在: ${edge.source}`,
          details: { edgeId: edge.id, sourceId: edge.source }
        });
      }

      if (!targetNode) {
        this.errors.push({
          type: 'invalid_connection',
          severity: 'error',
          message: `连接的目标节点不存在: ${edge.target}`,
          details: { edgeId: edge.id, targetId: edge.target }
        });
      }

      // 检查自连接
      if (edge.source === edge.target) {
        this.errors.push({
          type: 'invalid_connection',
          severity: 'error',
          message: `节点不能连接到自身`,
          details: { edgeId: edge.id, nodeId: edge.source }
        });
      }
    }
  }

  /**
   * 5. 检查孤立节点（没有任何连接的节点）
   */
  private detectDisconnectedNodes(): void {
    for (const node of this.nodes) {
      const nodeType = node.data?.nodeType || node.type;
      
      // 起始节点和结束节点可以没有入边或出边
      if (nodeType === 'start' || nodeType === 'end') {
        continue;
      }

      const hasIncoming = this.edges.some(edge => edge.target === node.id);
      const hasOutgoing = this.edges.some(edge => edge.source === node.id);

      if (!hasIncoming && !hasOutgoing) {
        this.warnings.push({
          type: 'unreachable_node',
          nodeId: node.id,
          message: `节点 "${node.data.label}" 是孤立的，没有任何连接`,
          details: { isolated: true }
        });
      }
    }
  }

  /**
   * 6. 检查不可达节点（从起始节点无法到达的节点）
   */
  private detectUnreachableNodes(): void {
    const startNodes = this.nodes.filter(node => 
      node.type === 'start' || node.data?.nodeType === 'start'
    );

    if (startNodes.length === 0) {
      return; // 已经在完整性检查中报告
    }

    const reachable = new Set<string>();
    const queue: string[] = [startNodes[0].id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      reachable.add(currentId);

      // 找到所有出边
      const outgoingEdges = this.edges.filter(edge => edge.source === currentId);
      for (const edge of outgoingEdges) {
        if (!reachable.has(edge.target)) {
          queue.push(edge.target);
        }
      }
    }

    // 检查不可达节点
    for (const node of this.nodes) {
      if (!reachable.has(node.id)) {
        const nodeType = node.data?.nodeType || node.type;
        
        // 起始节点本身不需要检查
        if (nodeType === 'start') {
          continue;
        }

        this.warnings.push({
          type: 'unreachable_node',
          nodeId: node.id,
          message: `节点 "${node.data.label}" 不可达，无法从起始节点到达`,
          details: { unreachable: true }
        });
      }
    }
  }

  /**
   * 7. 检查重复节点ID
   */
  private detectDuplicateNodeIds(): void {
    const idCount = new Map<string, number>();

    for (const node of this.nodes) {
      const count = idCount.get(node.id) || 0;
      idCount.set(node.id, count + 1);
    }

    idCount.forEach((count, id) => {
      if (count > 1) {
        this.errors.push({
          type: 'duplicate_node_id',
          severity: 'error',
          nodeId: id,
          message: `检测到重复的节点ID: ${id} (出现${count}次)`,
          details: { count }
        });
      }
    });
  }

  /**
   * 8. 生成修复建议
   */
  private generateSuggestions(): void {
    // 建议添加起始节点
    const hasStart = this.nodes.some(node => 
      node.type === 'start' || node.data?.nodeType === 'start'
    );
    if (!hasStart) {
      this.suggestions.push({
        type: 'add_node',
        message: '添加起始节点以开始工作流',
        autoFixable: true,
        details: { nodeType: 'start' }
      });
    }

    // 建议添加结束节点
    const hasEnd = this.nodes.some(node => 
      node.type === 'end' || node.data?.nodeType === 'end'
    );
    if (!hasEnd) {
      this.suggestions.push({
        type: 'add_node',
        message: '添加结束节点以完成工作流',
        autoFixable: true,
        details: { nodeType: 'end' }
      });
    }

    // 建议修复参数错误
    const paramErrors = this.errors.filter(e => e.type === 'invalid_parameter');
    for (const error of paramErrors) {
      this.suggestions.push({
        type: 'fix_parameter',
        message: `修复节点参数: ${error.message}`,
        autoFixable: false,
        details: error.details
      });
    }

    // 建议移除孤立节点
    const isolatedWarnings = this.warnings.filter(w => 
      w.type === 'unreachable_node' && w.details?.isolated
    );
    for (const warning of isolatedWarnings) {
      this.suggestions.push({
        type: 'remove_node',
        message: `移除孤立节点或为其添加连接`,
        autoFixable: false,
        details: { nodeId: warning.nodeId }
      });
    }

    // 建议修复循环依赖
    const circularErrors = this.errors.filter(e => e.type === 'circular_dependency');
    for (const error of circularErrors) {
      this.suggestions.push({
        type: 'remove_connection',
        message: `移除循环依赖中的某个连接`,
        autoFixable: false,
        details: error.details
      });
    }
  }

  /**
   * 获取节点的验证状态
   */
  getNodeValidationStatus(nodeId: string): {
    hasErrors: boolean;
    hasWarnings: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const nodeErrors = this.errors.filter(e => e.nodeId === nodeId);
    const nodeWarnings = this.warnings.filter(w => w.nodeId === nodeId);

    return {
      hasErrors: nodeErrors.length > 0,
      hasWarnings: nodeWarnings.length > 0,
      errors: nodeErrors,
      warnings: nodeWarnings
    };
  }

  /**
   * 生成验证报告
   */
  generateReport(): string {
    let report = '# 工作流验证报告\n\n';

    if (this.errors.length === 0 && this.warnings.length === 0) {
      report += '✅ 工作流验证通过，没有发现问题。\n';
      return report;
    }

    if (this.errors.length > 0) {
      report += `## ❌ 错误 (${this.errors.length})\n\n`;
      for (const error of this.errors) {
        report += `- **${error.message}**\n`;
        if (error.nodeId) {
          report += `  - 节点ID: ${error.nodeId}\n`;
        }
        if (error.details) {
          report += `  - 详情: ${JSON.stringify(error.details, null, 2)}\n`;
        }
        report += '\n';
      }
    }

    if (this.warnings.length > 0) {
      report += `## ⚠️ 警告 (${this.warnings.length})\n\n`;
      for (const warning of this.warnings) {
        report += `- ${warning.message}\n`;
        if (warning.nodeId) {
          report += `  - 节点ID: ${warning.nodeId}\n`;
        }
        report += '\n';
      }
    }

    if (this.suggestions.length > 0) {
      report += `## 💡 修复建议 (${this.suggestions.length})\n\n`;
      for (const suggestion of this.suggestions) {
        const autoFix = suggestion.autoFixable ? ' [可自动修复]' : '';
        report += `- ${suggestion.message}${autoFix}\n`;
        report += '\n';
      }
    }

    return report;
  }
}

/**
 * 快速验证工作流
 */
export function validateWorkflow(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): ValidationResult {
  const validator = new WorkflowValidator(nodes, edges);
  return validator.validate();
}

/**
 * 检查工作流是否可以执行
 */
export function canExecuteWorkflow(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): { canExecute: boolean; reason?: string } {
  const result = validateWorkflow(nodes, edges);

  if (!result.valid) {
    const criticalErrors = result.errors.filter(e => 
      e.type === 'missing_start' || 
      e.type === 'missing_end' || 
      e.type === 'circular_dependency'
    );

    if (criticalErrors.length > 0) {
      return {
        canExecute: false,
        reason: criticalErrors[0].message
      };
    }
  }

  return { canExecute: true };
}
