/**
 * AI Workflow Generator
 * 
 * This module provides AI-powered workflow generation capabilities.
 * It uses PureChat AI to understand user intent and generate workflow definitions.
 */

import { Node, Edge } from 'reactflow';
import { getPureChatClient } from './pureChatClient';
import { applyCompleteLayout } from './autoLayout';
import { optimizeWorkflowParameters, applyOptimizations } from './parameterOptimizer';

export interface WorkflowGenerationRequest {
  userInput: string;
  context?: Record<string, any>;
}

export interface WorkflowGenerationResult {
  success: boolean;
  nodes?: Node[];
  edges?: Edge[];
  description?: string;
  error?: string;
}

/**
 * AI Prompt template for workflow generation
 */
const WORKFLOW_GENERATION_PROMPT = `你是一个专业的无人机工作流设计助手。用户会用自然语言描述他们想要完成的任务，你需要将其转换为结构化的工作流定义。

可用的节点类型：

**流程控制**
- start: 开始节点
- end: 结束节点

**基础控制**
- takeoff: 起飞 (参数: height=100)
- land: 降落 (参数: safetyCheck=true)
- hover: 悬停 (参数: duration=3)
- wait: 等待 (参数: duration=1)
- emergency_stop: 紧急停止

**移动控制**
- move_forward: 前进 (参数: distance=50, speed=50)
- move_backward: 后退 (参数: distance=50, speed=50)
- move_left: 左移 (参数: distance=50, speed=50)
- move_right: 右移 (参数: distance=50, speed=50)
- move_up: 上升 (参数: distance=50, speed=30)
- move_down: 下降 (参数: distance=50, speed=30)

**旋转控制**
- rotate_cw: 顺时针旋转 (参数: angle=90, speed=60)
- rotate_ccw: 逆时针旋转 (参数: angle=90, speed=60)

**特技动作**
- flip_forward: 前翻
- flip_backward: 后翻
- flip_left: 左翻
- flip_right: 右翻

**检测任务**
- qr_scan: QR码扫描 (参数: timeout=10, continueOnFail=false)
- strawberry_detection: 草莓检测 (参数: confidence=0.7, timeout=15)
- yolo_detection: YOLO检测 (参数: modelSource='builtin', confidence=0.5)

**AI分析**
- purechat_chat: PureChat对话 (参数: assistantId, prompt)
- purechat_image_analysis: AI图像分析 (参数: assistantId, prompt)
- unipixel_segmentation: UniPixel分割 (参数: query, confidence=0.7)

**逻辑判断**
- condition_branch: 条件分支 (参数: variable, operator, value)
- if_else: IF-ELSE判断 (参数: condition)
- loop: 循环 (参数: iterations=3)

**挑战任务**
- challenge_8_flight: 8字飞行 (参数: radius=100, speed=50, loops=1)
- challenge_obstacle: 穿越障碍 (参数: obstaclePositions)
- challenge_precision_land: 精准降落 (参数: targetPosition, precision=10)

**图像采集**
- take_photo: 拍照 (参数: resolution='high', saveLocal=true)
- start_video: 开始录像
- stop_video: 停止录像

**数据处理**
- variable_set: 设置变量 (参数: variableName, value)
- variable_get: 获取变量 (参数: variableName)
- data_transform: 数据转换
- data_filter: 数据过滤

请根据用户描述生成工作流，返回JSON格式：
{
  "description": "工作流说明",
  "nodes": [
    {
      "id": "node_1",
      "type": "statusNode",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "开始",
        "nodeType": "start",
        "status": "idle",
        "parameters": {}
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2",
      "type": "default"
    }
  ]
}

重要规则：
1. 必须包含start和end节点
2. 节点ID必须唯一，使用node_1, node_2格式
3. 边ID必须唯一，使用edge_1, edge_2格式
4. 所有节点type必须是"statusNode"
5. data.nodeType指定实际的节点类型
6. 参数要合理，符合实际使用场景
7. 位置坐标暂时设为0，后续会自动布局
8. 只返回JSON，不要其他说明文字

用户描述: {userInput}`;

/**
 * AI Workflow Generator Class
 */
export class AIWorkflowGenerator {
  private pureChatClient = getPureChatClient();

  /**
   * Generate workflow from natural language description
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResult> {
    try {
      // Prepare prompt
      const prompt = WORKFLOW_GENERATION_PROMPT.replace('{userInput}', request.userInput);

      // Call PureChat AI
      const response = await this.pureChatClient.chat({
        assistantId: 'workflow-generator',
        prompt,
        temperature: 0.3, // Lower temperature for more consistent output
        maxTokens: 2000,
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'AI调用失败',
        };
      }

      // Parse AI response
      const workflowData = this.parseAIResponse(response.data);

      if (!workflowData) {
        return {
          success: false,
          error: 'AI返回的格式无法解析',
        };
      }

      // Validate workflow
      const validationResult = this.validateWorkflow(workflowData);
      if (!validationResult.valid) {
        return {
          success: false,
          error: `工作流验证失败: ${validationResult.errors.join(', ')}`,
        };
      }

      // Set default parameters
      let nodes = this.setDefaultParameters(workflowData.nodes);

      // Optimize parameters
      const optimization = optimizeWorkflowParameters(nodes);
      if (optimization.suggestions.length > 0) {
        // Apply high and medium priority optimizations
        nodes = applyOptimizations(nodes, optimization.suggestions);
      }

      // Apply auto layout
      nodes = applyCompleteLayout(nodes, workflowData.edges, {
        direction: 'TB',
        nodeWidth: 180,
        nodeHeight: 60,
        rankSep: 100,
        nodeSep: 80,
      });

      return {
        success: true,
        nodes,
        edges: workflowData.edges,
        description: workflowData.description,
      };
    } catch (error: any) {
      console.error('Workflow generation error:', error);
      return {
        success: false,
        error: error.message || '生成失败',
      };
    }
  }

  /**
   * Parse AI response to extract workflow definition
   */
  private parseAIResponse(response: string): any | null {
    try {
      // Try to extract JSON from response
      // AI might return JSON wrapped in markdown code blocks
      let jsonStr = response.trim();

      // Remove markdown code blocks if present
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }

      // Parse JSON
      const data = JSON.parse(jsonStr);

      // Ensure required fields exist
      if (!data.nodes || !Array.isArray(data.nodes)) {
        console.error('Invalid workflow data: missing nodes array');
        return null;
      }

      if (!data.edges || !Array.isArray(data.edges)) {
        console.error('Invalid workflow data: missing edges array');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response:', response);
      return null;
    }
  }

  /**
   * Validate workflow structure
   */
  private validateWorkflow(workflow: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for start node
    const hasStartNode = workflow.nodes.some((node: any) =>
      node.data?.nodeType === 'start' || node.type === 'start'
    );
    if (!hasStartNode) {
      errors.push('缺少开始节点');
    }

    // Check for end node
    const hasEndNode = workflow.nodes.some((node: any) =>
      node.data?.nodeType === 'end' || node.type === 'end'
    );
    if (!hasEndNode) {
      errors.push('缺少结束节点');
    }

    // Check for duplicate node IDs
    const nodeIds = new Set<string>();
    for (const node of workflow.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`重复的节点ID: ${node.id}`);
      }
      nodeIds.add(node.id);
    }

    // Check for duplicate edge IDs
    const edgeIds = new Set<string>();
    for (const edge of workflow.edges) {
      if (edgeIds.has(edge.id)) {
        errors.push(`重复的边ID: ${edge.id}`);
      }
      edgeIds.add(edge.id);
    }

    // Check edge references
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`边引用了不存在的源节点: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`边引用了不存在的目标节点: ${edge.target}`);
      }
    }

    // Check for cycles (simple check)
    const hasCycle = this.detectCycle(workflow.nodes, workflow.edges);
    if (hasCycle) {
      errors.push('工作流包含循环依赖');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Detect cycles in workflow graph
   */
  private detectCycle(nodes: any[], edges: any[]): boolean {
    const adjacencyList = new Map<string, string[]>();

    // Build adjacency list
    for (const node of nodes) {
      adjacencyList.set(node.id, []);
    }

    for (const edge of edges) {
      const neighbors = adjacencyList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjacencyList.set(edge.source, neighbors);
    }

    // DFS to detect cycle
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Set default parameters for nodes
   */
  private setDefaultParameters(nodes: Node[]): Node[] {
    const defaultParams: Record<string, any> = {
      takeoff: { height: 100, waitForStable: true },
      land: { safetyCheck: true, speed: 50 },
      move_forward: { distance: 50, speed: 50 },
      move_backward: { distance: 50, speed: 50 },
      move_left: { distance: 50, speed: 50 },
      move_right: { distance: 50, speed: 50 },
      move_up: { distance: 50, speed: 30 },
      move_down: { distance: 50, speed: 30 },
      rotate_cw: { angle: 90, speed: 60 },
      rotate_ccw: { angle: 90, speed: 60 },
      hover: { duration: 3, stabilize: true },
      wait: { duration: 1, description: '' },
      qr_scan: { timeout: 10, saveImage: true, continueOnFail: false },
      strawberry_detection: { confidence: 0.7, timeout: 15, saveResults: true },
      yolo_detection: { modelSource: 'builtin', confidence: 0.5, iouThreshold: 0.45 },
      purechat_chat: { assistantId: '', prompt: '', temperature: 0.7 },
      purechat_image_analysis: { assistantId: '', prompt: '', imageSource: 'camera' },
      unipixel_segmentation: { query: '', confidence: 0.7, visualize: true },
      challenge_8_flight: { radius: 100, speed: 50, loops: 1 },
      challenge_obstacle: { obstaclePositions: '[]', speed: 40 },
      challenge_precision_land: { targetPosition: '{"x": 0, "y": 0}', precision: 10 },
      take_photo: { resolution: 'high', saveLocal: true, format: 'jpg' },
      condition_branch: { variable: 'battery', operator: '>', value: 50 },
      if_else: { condition: '', trueLabel: '是', falseLabel: '否' },
      loop: { iterations: 3, maxIterations: 10 },
    };

    return nodes.map(node => {
      const nodeType = node.data?.nodeType || node.type;
      const defaults = defaultParams[nodeType] || {};

      return {
        ...node,
        data: {
          ...node.data,
          parameters: {
            ...defaults,
            ...(node.data?.parameters || {}),
          },
        },
      };
    });
  }
}

// Singleton instance
let aiWorkflowGeneratorInstance: AIWorkflowGenerator | null = null;

/**
 * Get or create AI workflow generator instance
 */
export function getAIWorkflowGenerator(): AIWorkflowGenerator {
  if (!aiWorkflowGeneratorInstance) {
    aiWorkflowGeneratorInstance = new AIWorkflowGenerator();
  }
  return aiWorkflowGeneratorInstance;
}

/**
 * Reset AI workflow generator instance (useful for testing)
 */
export function resetAIWorkflowGenerator(): void {
  aiWorkflowGeneratorInstance = null;
}
