/**
 * Parameter Optimizer for Workflow Nodes
 * 
 * This module provides intelligent parameter optimization for workflow nodes,
 * including validation, default value assignment, and optimization suggestions.
 */

import { Node } from 'reactflow';

export interface ParameterValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OptimizationSuggestion {
  nodeId: string;
  parameter: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WorkflowOptimizationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: OptimizationSuggestion[];
}

/**
 * Parameter constraints and validation rules
 */
const PARAMETER_CONSTRAINTS: Record<string, Record<string, any>> = {
  takeoff: {
    height: { min: 20, max: 500, default: 100, unit: 'cm' },
  },
  land: {
    speed: { min: 10, max: 100, default: 50, unit: '%' },
  },
  move_forward: {
    distance: { min: 20, max: 500, default: 50, unit: 'cm' },
    speed: { min: 10, max: 100, default: 50, unit: '%' },
  },
  move_backward: {
    distance: { min: 20, max: 500, default: 50, unit: 'cm' },
    speed: { min: 10, max: 100, default: 50, unit: '%' },
  },
  move_left: {
    distance: { min: 20, max: 500, default: 50, unit: 'cm' },
    speed: { min: 10, max: 100, default: 50, unit: '%' },
  },
  move_right: {
    distance: { min: 20, max: 500, default: 50, unit: 'cm' },
    speed: { min: 10, max: 100, default: 50, unit: '%' },
  },
  move_up: {
    distance: { min: 20, max: 500, default: 50, unit: 'cm' },
    speed: { min: 10, max: 100, default: 30, unit: '%' },
  },
  move_down: {
    distance: { min: 20, max: 500, default: 50, unit: 'cm' },
    speed: { min: 10, max: 100, default: 30, unit: '%' },
  },
  rotate_cw: {
    angle: { min: 1, max: 360, default: 90, unit: '°' },
    speed: { min: 10, max: 100, default: 60, unit: '%' },
  },
  rotate_ccw: {
    angle: { min: 1, max: 360, default: 90, unit: '°' },
    speed: { min: 10, max: 100, default: 60, unit: '%' },
  },
  hover: {
    duration: { min: 0.5, max: 60, default: 3, unit: 's' },
  },
  wait: {
    duration: { min: 0.1, max: 60, default: 1, unit: 's' },
  },
  qr_scan: {
    timeout: { min: 1, max: 60, default: 10, unit: 's' },
  },
  strawberry_detection: {
    confidence: { min: 0.1, max: 1.0, default: 0.7, unit: '' },
    timeout: { min: 1, max: 60, default: 15, unit: 's' },
  },
  yolo_detection: {
    confidence: { min: 0.1, max: 1.0, default: 0.5, unit: '' },
    iouThreshold: { min: 0.1, max: 1.0, default: 0.45, unit: '' },
  },
  unipixel_segmentation: {
    confidence: { min: 0.1, max: 1.0, default: 0.7, unit: '' },
  },
  challenge_8_flight: {
    radius: { min: 50, max: 300, default: 100, unit: 'cm' },
    speed: { min: 10, max: 100, default: 50, unit: '%' },
    loops: { min: 1, max: 10, default: 1, unit: '' },
  },
  challenge_precision_land: {
    precision: { min: 1, max: 50, default: 10, unit: 'cm' },
  },
  loop: {
    iterations: { min: 1, max: 100, default: 3, unit: '' },
  },
};

/**
 * Validate node parameters
 */
export function validateNodeParameters(node: Node): ParameterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const nodeType = node.data?.nodeType || node.type;
  const parameters = node.data?.parameters || {};
  const constraints = PARAMETER_CONSTRAINTS[nodeType];

  if (!constraints) {
    // No constraints defined for this node type
    return { valid: true, errors, warnings };
  }

  // Validate each parameter
  Object.entries(constraints).forEach(([paramName, constraint]: [string, any]) => {
    const value = parameters[paramName];

    // Check if required parameter is missing
    if (value === undefined || value === null || value === '') {
      warnings.push(`节点 "${node.data?.label}" 缺少参数 "${paramName}"`);
      return;
    }

    // Validate numeric constraints
    if (typeof constraint.min === 'number' && value < constraint.min) {
      errors.push(
        `节点 "${node.data?.label}" 的参数 "${paramName}" (${value}) 小于最小值 ${constraint.min}${constraint.unit}`
      );
    }

    if (typeof constraint.max === 'number' && value > constraint.max) {
      errors.push(
        `节点 "${node.data?.label}" 的参数 "${paramName}" (${value}) 大于最大值 ${constraint.max}${constraint.unit}`
      );
    }

    // Warn if value is at extremes
    if (typeof constraint.min === 'number' && value === constraint.min) {
      warnings.push(
        `节点 "${node.data?.label}" 的参数 "${paramName}" 设置为最小值，可能影响性能`
      );
    }

    if (typeof constraint.max === 'number' && value === constraint.max) {
      warnings.push(
        `节点 "${node.data?.label}" 的参数 "${paramName}" 设置为最大值，可能存在风险`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Optimize workflow parameters
 */
export function optimizeWorkflowParameters(nodes: Node[]): WorkflowOptimizationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: OptimizationSuggestion[] = [];

  // Validate each node
  nodes.forEach((node) => {
    const validation = validateNodeParameters(node);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
  });

  // Generate optimization suggestions
  nodes.forEach((node) => {
    const nodeSuggestions = generateNodeSuggestions(node, nodes);
    suggestions.push(...nodeSuggestions);
  });

  // Check workflow-level optimizations
  const workflowSuggestions = generateWorkflowSuggestions(nodes);
  suggestions.push(...workflowSuggestions);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Generate optimization suggestions for a single node
 */
function generateNodeSuggestions(node: Node, allNodes: Node[]): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  const nodeType = node.data?.nodeType || node.type;
  const parameters = node.data?.parameters || {};

  // Movement optimization
  if (nodeType.startsWith('move_')) {
    const distance = parameters.distance;
    const speed = parameters.speed;

    // Suggest reducing speed for long distances
    if (distance > 200 && speed > 70) {
      suggestions.push({
        nodeId: node.id,
        parameter: 'speed',
        currentValue: speed,
        suggestedValue: 60,
        reason: '长距离移动建议降低速度以提高稳定性',
        priority: 'medium',
      });
    }

    // Suggest increasing speed for short distances
    if (distance < 50 && speed < 40) {
      suggestions.push({
        nodeId: node.id,
        parameter: 'speed',
        currentValue: speed,
        suggestedValue: 50,
        reason: '短距离移动可以适当提高速度',
        priority: 'low',
      });
    }
  }

  // Detection optimization
  if (nodeType.includes('detection')) {
    const confidence = parameters.confidence;

    if (confidence < 0.5) {
      suggestions.push({
        nodeId: node.id,
        parameter: 'confidence',
        currentValue: confidence,
        suggestedValue: 0.6,
        reason: '置信度过低可能导致误检，建议提高到0.6以上',
        priority: 'high',
      });
    }

    if (confidence > 0.9) {
      suggestions.push({
        nodeId: node.id,
        parameter: 'confidence',
        currentValue: confidence,
        suggestedValue: 0.75,
        reason: '置信度过高可能导致漏检，建议降低到0.75左右',
        priority: 'medium',
      });
    }
  }

  // Timeout optimization
  if (parameters.timeout !== undefined) {
    const timeout = parameters.timeout;

    if (timeout < 3) {
      suggestions.push({
        nodeId: node.id,
        parameter: 'timeout',
        currentValue: timeout,
        suggestedValue: 5,
        reason: '超时时间过短可能导致任务失败，建议至少5秒',
        priority: 'high',
      });
    }

    if (timeout > 30) {
      suggestions.push({
        nodeId: node.id,
        parameter: 'timeout',
        currentValue: timeout,
        suggestedValue: 20,
        reason: '超时时间过长会影响工作流效率',
        priority: 'low',
      });
    }
  }

  return suggestions;
}

/**
 * Generate workflow-level optimization suggestions
 */
function generateWorkflowSuggestions(nodes: Node[]): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Check for missing hover after takeoff
  const takeoffNodes = nodes.filter((n) => n.data?.nodeType === 'takeoff');
  takeoffNodes.forEach((takeoffNode) => {
    // Find next node (simplified check)
    const nextNode = nodes.find((n) => n.position.y > takeoffNode.position.y);
    if (nextNode && nextNode.data?.nodeType !== 'hover' && nextNode.data?.nodeType !== 'wait') {
      suggestions.push({
        nodeId: takeoffNode.id,
        parameter: 'workflow',
        currentValue: null,
        suggestedValue: 'add_hover',
        reason: '建议在起飞后添加悬停节点，让无人机稳定',
        priority: 'medium',
      });
    }
  });

  // Check for excessive movement nodes
  const movementNodes = nodes.filter((n) =>
    n.data?.nodeType?.startsWith('move_') || n.data?.nodeType?.startsWith('rotate_')
  );
  if (movementNodes.length > 10) {
    suggestions.push({
      nodeId: 'workflow',
      parameter: 'complexity',
      currentValue: movementNodes.length,
      suggestedValue: 10,
      reason: '工作流包含过多移动节点，建议简化或分解为多个子工作流',
      priority: 'low',
    });
  }

  // Check for missing end node
  const hasEndNode = nodes.some((n) => n.data?.nodeType === 'end');
  if (!hasEndNode) {
    suggestions.push({
      nodeId: 'workflow',
      parameter: 'structure',
      currentValue: null,
      suggestedValue: 'add_end',
      reason: '工作流缺少结束节点，建议添加',
      priority: 'high',
    });
  }

  return suggestions;
}

/**
 * Apply optimization suggestions to nodes
 */
export function applyOptimizations(
  nodes: Node[],
  suggestions: OptimizationSuggestion[]
): Node[] {
  const optimizedNodes = [...nodes];

  suggestions.forEach((suggestion) => {
    if (suggestion.priority === 'high' || suggestion.priority === 'medium') {
      const nodeIndex = optimizedNodes.findIndex((n) => n.id === suggestion.nodeId);
      if (nodeIndex !== -1) {
        const node = optimizedNodes[nodeIndex];
        optimizedNodes[nodeIndex] = {
          ...node,
          data: {
            ...node.data,
            parameters: {
              ...node.data.parameters,
              [suggestion.parameter]: suggestion.suggestedValue,
            },
          },
        };
      }
    }
  });

  return optimizedNodes;
}

/**
 * Get parameter recommendations for a node type
 */
export function getParameterRecommendations(nodeType: string): Record<string, any> {
  const constraints = PARAMETER_CONSTRAINTS[nodeType];
  if (!constraints) {
    return {};
  }

  const recommendations: Record<string, any> = {};
  Object.entries(constraints).forEach(([paramName, constraint]: [string, any]) => {
    recommendations[paramName] = {
      default: constraint.default,
      min: constraint.min,
      max: constraint.max,
      unit: constraint.unit,
      description: getParameterDescription(nodeType, paramName),
    };
  });

  return recommendations;
}

/**
 * Get parameter description
 */
function getParameterDescription(nodeType: string, paramName: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    takeoff: {
      height: '起飞高度，建议100-150cm',
    },
    move_forward: {
      distance: '前进距离，单位厘米',
      speed: '移动速度，百分比值',
    },
    hover: {
      duration: '悬停时间，单位秒',
    },
    qr_scan: {
      timeout: 'QR码扫描超时时间',
    },
    strawberry_detection: {
      confidence: '检测置信度阈值，0.6-0.8为佳',
      timeout: '检测超时时间',
    },
  };

  return descriptions[nodeType]?.[paramName] || '';
}
