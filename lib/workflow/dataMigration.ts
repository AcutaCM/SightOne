/**
 * Data Migration Utilities
 * 
 * 提供工作流数据迁移功能，确保向后兼容
 * 
 * Requirements: 4.1
 */

import { nodeRegistry } from './nodeRegistry';
import { NodeStatus } from './designSystem';

/**
 * 工作流数据接口
 */
export interface WorkflowData {
  nodes: any[];
  edges: any[];
  metadata?: {
    version?: string;
    createdAt?: number;
    updatedAt?: number;
  };
}

/**
 * 节点数据接口（旧版）
 */
interface LegacyNodeData {
  label: string;
  status?: NodeStatus;
  [key: string]: any;
}

/**
 * 节点数据接口（新版）
 */
interface ModernNodeData {
  id: string;
  type: string;
  label: string;
  category: string;
  icon?: any;
  color: string;
  status: NodeStatus;
  parameters: Record<string, any>;
  isCollapsed: boolean;
  priorityParams?: string[];
  customSize?: { width: number; height: number };
  lastModified?: number;
}

/**
 * 数据版本
 */
export const DATA_VERSION = '2.0.0';

/**
 * 迁移工作流数据
 * 
 * 将旧版工作流数据迁移到新版格式
 * 
 * @param workflow 工作流数据
 * @returns 迁移后的工作流数据
 */
export function migrateWorkflowData(workflow: WorkflowData): WorkflowData {
  // 检查是否需要迁移
  const currentVersion = workflow.metadata?.version || '1.0.0';
  
  if (currentVersion === DATA_VERSION) {
    // 已经是最新版本，无需迁移
    return workflow;
  }

  console.log(`Migrating workflow data from version ${currentVersion} to ${DATA_VERSION}`);

  // 迁移节点数据
  const migratedNodes = workflow.nodes.map(node => migrateNode(node));

  // 返回迁移后的数据
  return {
    ...workflow,
    nodes: migratedNodes,
    metadata: {
      ...workflow.metadata,
      version: DATA_VERSION,
      updatedAt: Date.now(),
    },
  };
}

/**
 * 迁移单个节点
 * 
 * @param node 节点数据
 * @returns 迁移后的节点数据
 */
function migrateNode(node: any): any {
  // 如果节点已经是新格式，直接返回（添加缺失的字段）
  if (node.type === 'inlineParameterNode' && node.data.parameters !== undefined) {
    return {
      ...node,
      data: {
        ...node.data,
        isCollapsed: node.data.isCollapsed ?? false,
        customSize: node.data.customSize ?? undefined,
        priorityParams: node.data.priorityParams ?? [],
        lastModified: node.data.lastModified ?? Date.now(),
      },
    };
  }

  // 旧版节点（statusNode）迁移到新版
  if (node.type === 'statusNode') {
    const legacyData = node.data as LegacyNodeData;
    
    // 尝试从label推断节点类型
    const nodeType = inferNodeTypeFromLabel(legacyData.label);
    const nodeDefinition = nodeRegistry.getNode(nodeType);
    
    if (nodeDefinition) {
      // 获取默认参数
      const defaultParameters = nodeRegistry.getDefaultParameters(nodeType);
      
      // 创建新格式的节点数据
      const modernData: ModernNodeData = {
        id: node.id,
        type: nodeType,
        label: legacyData.label,
        category: nodeDefinition.category,
        icon: nodeDefinition.icon,
        color: nodeDefinition.color,
        status: legacyData.status || 'idle',
        parameters: defaultParameters,
        isCollapsed: false,
        priorityParams: nodeDefinition.parameters
          .filter(p => p.priority && p.priority >= 8)
          .map(p => p.name),
        customSize: undefined,
        lastModified: Date.now(),
      };

      return {
        ...node,
        type: 'inlineParameterNode',
        data: modernData,
      };
    }
  }

  // 无法迁移的节点，保持原样
  console.warn(`Unable to migrate node: ${node.id}, keeping original format`);
  return node;
}

/**
 * 从节点标签推断节点类型
 * 
 * 这是一个启发式方法，尝试从旧版节点的label推断其类型
 * 
 * @param label 节点标签
 * @returns 推断的节点类型
 */
function inferNodeTypeFromLabel(label: string): string {
  const labelLower = label.toLowerCase();

  // 基础控制
  if (labelLower.includes('起飞') || labelLower.includes('takeoff')) {
    return 'takeoff';
  }
  if (labelLower.includes('降落') || labelLower.includes('land')) {
    return 'land';
  }
  if (labelLower.includes('悬停') || labelLower.includes('hover')) {
    return 'hover';
  }

  // 移动控制
  if (labelLower.includes('前进') || labelLower.includes('forward')) {
    return 'move_forward';
  }
  if (labelLower.includes('后退') || labelLower.includes('backward')) {
    return 'move_backward';
  }
  if (labelLower.includes('左移') || labelLower.includes('left')) {
    return 'move_left';
  }
  if (labelLower.includes('右移') || labelLower.includes('right')) {
    return 'move_right';
  }
  if (labelLower.includes('上升') || labelLower.includes('up')) {
    return 'move_up';
  }
  if (labelLower.includes('下降') || labelLower.includes('down')) {
    return 'move_down';
  }

  // 旋转控制
  if (labelLower.includes('顺时针') || labelLower.includes('clockwise')) {
    return 'rotate_clockwise';
  }
  if (labelLower.includes('逆时针') || labelLower.includes('counterclockwise')) {
    return 'rotate_counterclockwise';
  }

  // 流程控制
  if (labelLower.includes('等待') || labelLower.includes('wait')) {
    return 'wait';
  }
  if (labelLower.includes('循环') || labelLower.includes('loop')) {
    return 'loop';
  }

  // AI分析
  if (labelLower.includes('purechat') || labelLower.includes('对话')) {
    return 'purechat_chat';
  }
  if (labelLower.includes('图像分析') || labelLower.includes('image analysis')) {
    return 'purechat_image_analysis';
  }

  // 检测任务
  if (labelLower.includes('yolo') || labelLower.includes('目标检测')) {
    return 'yolo_detection';
  }
  if (labelLower.includes('unipixel') || labelLower.includes('分割')) {
    return 'unipixel_segmentation';
  }
  if (labelLower.includes('二维码') || labelLower.includes('qr')) {
    return 'qr_scan';
  }

  // 挑战任务
  if (labelLower.includes('8字飞行') || labelLower.includes('figure 8')) {
    return 'challenge_8_flight';
  }
  if (labelLower.includes('障碍穿越') || labelLower.includes('obstacle')) {
    return 'challenge_obstacle';
  }
  if (labelLower.includes('精准降落') || labelLower.includes('precision land')) {
    return 'challenge_precision_land';
  }

  // 默认返回基础节点类型
  return 'takeoff';
}

/**
 * 验证工作流数据
 * 
 * 检查工作流数据是否有效
 * 
 * @param workflow 工作流数据
 * @returns 验证结果
 */
export function validateWorkflowData(workflow: WorkflowData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查基本结构
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    errors.push('工作流缺少nodes数组');
  }

  if (!workflow.edges || !Array.isArray(workflow.edges)) {
    errors.push('工作流缺少edges数组');
  }

  // 检查节点
  if (workflow.nodes) {
    workflow.nodes.forEach((node, index) => {
      if (!node.id) {
        errors.push(`节点${index}缺少id`);
      }
      if (!node.type) {
        errors.push(`节点${index}缺少type`);
      }
      if (!node.data) {
        errors.push(`节点${index}缺少data`);
      }
    });
  }

  // 检查边
  if (workflow.edges) {
    workflow.edges.forEach((edge, index) => {
      if (!edge.id) {
        errors.push(`边${index}缺少id`);
      }
      if (!edge.source) {
        errors.push(`边${index}缺少source`);
      }
      if (!edge.target) {
        errors.push(`边${index}缺少target`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 导出工作流数据
 * 
 * 将工作流数据转换为可导出的格式
 * 
 * @param workflow 工作流数据
 * @returns 可导出的工作流数据
 */
export function exportWorkflowData(workflow: WorkflowData): string {
  // 确保数据是最新版本
  const migratedWorkflow = migrateWorkflowData(workflow);

  // 添加导出时间戳
  const exportData = {
    ...migratedWorkflow,
    metadata: {
      ...migratedWorkflow.metadata,
      exportedAt: Date.now(),
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 导入工作流数据
 * 
 * 从JSON字符串导入工作流数据
 * 
 * @param jsonString JSON字符串
 * @returns 工作流数据
 */
export function importWorkflowData(jsonString: string): WorkflowData {
  try {
    const workflow = JSON.parse(jsonString) as WorkflowData;

    // 验证数据
    const validation = validateWorkflowData(workflow);
    if (!validation.valid) {
      throw new Error(`工作流数据无效: ${validation.errors.join(', ')}`);
    }

    // 迁移数据
    return migrateWorkflowData(workflow);
  } catch (error) {
    throw new Error(`导入工作流失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 获取数据版本
 * 
 * @param workflow 工作流数据
 * @returns 数据版本
 */
export function getDataVersion(workflow: WorkflowData): string {
  return workflow.metadata?.version || '1.0.0';
}

/**
 * 检查是否需要迁移
 * 
 * @param workflow 工作流数据
 * @returns 是否需要迁移
 */
export function needsMigration(workflow: WorkflowData): boolean {
  const currentVersion = getDataVersion(workflow);
  return currentVersion !== DATA_VERSION;
}
