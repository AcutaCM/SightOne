# 工作流执行引擎快速开始指南

## 概述

本指南帮助你快速开始使用增强后的工作流执行引擎。

## 基本使用

### 1. 创建工作流引擎实例

```typescript
import { WorkflowEngine } from '@/lib/workflowEngine';

// 定义节点和边
const nodes = [
  {
    id: 'start_1',
    type: 'start',
    data: { label: '开始', nodeType: 'start', parameters: {} },
    position: { x: 0, y: 0 }
  },
  {
    id: 'purechat_1',
    type: 'purechat_chat',
    data: {
      label: 'AI对话',
      nodeType: 'purechat_chat',
      parameters: {
        assistantId: 'assistant_123',
        prompt: '分析无人机状态',
        temperature: 0.7,
        maxTokens: 1000,
        outputVariable: 'ai_response'
      }
    },
    position: { x: 200, y: 0 }
  },
  {
    id: 'end_1',
    type: 'end',
    data: { label: '结束', nodeType: 'end', parameters: {} },
    position: { x: 400, y: 0 }
  }
];

const edges = [
  { id: 'e1', source: 'start_1', target: 'purechat_1' },
  { id: 'e2', source: 'purechat_1', target: 'end_1' }
];

// 创建引擎实例
const engine = new WorkflowEngine(
  nodes,
  edges,
  (log) => console.log(log),           // 日志回调
  (context) => console.log(context),   // 状态更新回调
  sendCommandToBackend,                // 命令发送器
  true                                 // 启用并行执行
);
```

### 2. 执行工作流

```typescript
// 执行工作流
await engine.execute();

// 获取执行结果
const context = engine.getContext();
console.log('执行结果:', context.results);
console.log('变量:', context.variables);
```

### 3. 停止工作流

```typescript
// 停止正在执行的工作流
engine.stop();
```

## 新节点类型使用

### PureChat AI对话节点

```typescript
{
  id: 'purechat_chat_1',
  type: 'purechat_chat',
  data: {
    label: 'AI对话',
    nodeType: 'purechat_chat',
    parameters: {
      assistantId: 'assistant_id',      // 助理ID
      prompt: '你好，请帮我分析',       // 提示词
      temperature: 0.7,                 // 温度参数 (0-1)
      maxTokens: 1000,                  // 最大token数
      outputVariable: 'chat_result'     // 输出变量名
    }
  },
  position: { x: 0, y: 0 }
}
```

### PureChat图像分析节点

```typescript
{
  id: 'purechat_image_1',
  type: 'purechat_image_analysis',
  data: {
    label: 'AI图像分析',
    nodeType: 'purechat_image_analysis',
    parameters: {
      assistantId: 'vision_assistant',
      prompt: '分析图片中的内容',
      imageSource: 'camera',            // 'camera' | 'variable' | 'upload'
      imageVariable: 'current_image',   // 当imageSource='variable'时使用
      outputVariable: 'analysis_result'
    }
  },
  position: { x: 0, y: 0 }
}
```

### UniPixel分割节点

```typescript
{
  id: 'unipixel_1',
  type: 'unipixel_segmentation',
  data: {
    label: 'UniPixel分割',
    nodeType: 'unipixel_segmentation',
    parameters: {
      imageSource: 'camera',
      query: '草莓',                    // 分割查询描述
      confidence: 0.5,                  // 置信度阈值
      sampleFrames: 1,                  // 采样帧数
      visualize: true,                  // 是否可视化
      outputVariable: 'segmentation'
    }
  },
  position: { x: 0, y: 0 }
}
```

### YOLO检测节点

```typescript
{
  id: 'yolo_1',
  type: 'yolo_detection',
  data: {
    label: 'YOLO检测',
    nodeType: 'yolo_detection',
    parameters: {
      modelSource: 'builtin',           // 'builtin' | 'upload' | 'url'
      modelPath: 'yolov8n',             // 模型ID或路径
      imageSource: 'camera',
      confidence: 0.5,                  // 置信度阈值
      iouThreshold: 0.45,               // NMS IOU阈值
      classes: 'person,car',            // 类别过滤（逗号分隔）
      drawResults: true,                // 是否绘制结果
      outputVariable: 'detections'
    }
  },
  position: { x: 0, y: 0 }
}
```

### 挑战卡任务节点

#### 8字飞行

```typescript
{
  id: 'challenge_8_1',
  type: 'challenge_8_flight',
  data: {
    label: '8字飞行',
    nodeType: 'challenge_8_flight',
    parameters: {
      radius: 100,                      // 半径(cm)
      speed: 50,                        // 速度(%)
      loops: 1,                         // 循环次数
      timeout: 60,                      // 超时时间(s)
      scoreOutput: 'flight_score'       // 评分输出变量
    }
  },
  position: { x: 0, y: 0 }
}
```

#### 穿越障碍

```typescript
{
  id: 'challenge_obstacle_1',
  type: 'challenge_obstacle',
  data: {
    label: '穿越障碍',
    nodeType: 'challenge_obstacle',
    parameters: {
      obstaclePositions: '[{"x": 100, "y": 0, "z": 100}]',  // JSON字符串或数组
      speed: 40,
      safetyMargin: 20,                 // 安全边距(cm)
      timeout: 120,
      scoreOutput: 'obstacle_score'
    }
  },
  position: { x: 0, y: 0 }
}
```

#### 精准降落

```typescript
{
  id: 'challenge_land_1',
  type: 'challenge_precision_land',
  data: {
    label: '精准降落',
    nodeType: 'challenge_precision_land',
    parameters: {
      targetPosition: '{"x": 0, "y": 0}',  // JSON字符串或对象
      precision: 10,                    // 精度要求(cm)
      maxAttempts: 3,                   // 最大尝试次数
      timeout: 60,
      scoreOutput: 'landing_score'
    }
  },
  position: { x: 0, y: 0 }
}
```

## 并行执行

### 启用并行执行

```typescript
// 在构造函数中启用
const engine = new WorkflowEngine(nodes, edges, onLog, onStateChange, sendCommand, true);

// 或者动态启用/禁用
engine.setParallelExecution(true);
```

### 获取执行统计

```typescript
const stats = engine.getExecutionStats();
console.log('统计信息:', {
  totalNodes: stats.totalNodes,           // 总节点数
  maxParallelism: stats.maxParallelism,   // 最大并行度
  levels: stats.levels,                   // 执行层级数
  criticalPathLength: stats.criticalPathLength,  // 关键路径长度
  averageNodesPerLevel: stats.averageNodesPerLevel  // 平均每层节点数
});
```

### 检查依赖关系

```typescript
// 检查循环依赖
if (engine.hasCircularDependencies()) {
  console.error('工作流包含循环依赖！');
}

// 获取节点依赖信息
const deps = engine.getNodeDependencies('node_id');
console.log('依赖的节点:', deps.dependencies);
console.log('被依赖的节点:', deps.dependents);
```

## 错误处理

### 获取错误统计

```typescript
// 执行完成后获取错误统计
const errorStats = engine.getErrorStats();
console.log('错误统计:', {
  totalErrors: errorStats.totalErrors,
  errorsByType: errorStats.errorsByType,
  errorsByNode: errorStats.errorsByNode,
  averageRetries: errorStats.averageRetries
});
```

### 获取错误历史

```typescript
const errorHistory = engine.getErrorHistory();
errorHistory.forEach(err => {
  console.log(`[${err.timestamp}] 节点 ${err.nodeId} (${err.nodeType}) 失败:`);
  console.log(`  错误: ${err.error.message}`);
  console.log(`  重试次数: ${err.retryCount}`);
});
```

### 清除错误历史

```typescript
engine.clearErrorHistory();
```

## 访问执行上下文

### 获取变量

```typescript
const context = engine.getContext();

// 访问特定变量
const aiResponse = context.variables['ai_response'];
const detections = context.variables['yolo_detections'];
```

### 更新变量

```typescript
engine.updateVariable('custom_var', { value: 123 });
```

### 获取节点结果

```typescript
const context = engine.getContext();
const nodeResult = context.results['node_id'];
```

## 完整示例

```typescript
import { WorkflowEngine } from '@/lib/workflowEngine';

async function runWorkflow() {
  // 定义工作流
  const nodes = [
    {
      id: 'start',
      type: 'start',
      data: { label: '开始', nodeType: 'start', parameters: {} },
      position: { x: 0, y: 0 }
    },
    {
      id: 'takeoff',
      type: 'takeoff',
      data: {
        label: '起飞',
        nodeType: 'takeoff',
        parameters: { height: 100 }
      },
      position: { x: 200, y: 0 }
    },
    {
      id: 'yolo',
      type: 'yolo_detection',
      data: {
        label: 'YOLO检测',
        nodeType: 'yolo_detection',
        parameters: {
          modelSource: 'builtin',
          modelPath: 'yolov8n',
          imageSource: 'camera',
          confidence: 0.5,
          outputVariable: 'detections'
        }
      },
      position: { x: 400, y: 0 }
    },
    {
      id: 'land',
      type: 'land',
      data: { label: '降落', nodeType: 'land', parameters: {} },
      position: { x: 600, y: 0 }
    },
    {
      id: 'end',
      type: 'end',
      data: { label: '结束', nodeType: 'end', parameters: {} },
      position: { x: 800, y: 0 }
    }
  ];

  const edges = [
    { id: 'e1', source: 'start', target: 'takeoff' },
    { id: 'e2', source: 'takeoff', target: 'yolo' },
    { id: 'e3', source: 'yolo', target: 'land' },
    { id: 'e4', source: 'land', target: 'end' }
  ];

  // 创建引擎
  const engine = new WorkflowEngine(
    nodes,
    edges,
    (log) => console.log(`[LOG] ${log}`),
    (context) => {
      console.log(`[STATE] 当前节点: ${context.currentNode}`);
      console.log(`[STATE] 运行中: ${context.isRunning}`);
    },
    async (type, data) => {
      // 发送命令到后端
      console.log(`[CMD] ${type}`, data);
      return { success: true };
    },
    true  // 启用并行执行
  );

  try {
    // 执行工作流
    console.log('开始执行工作流...');
    await engine.execute();

    // 获取结果
    const context = engine.getContext();
    console.log('执行完成！');
    console.log('检测结果:', context.variables['detections']);

    // 获取统计
    const stats = engine.getExecutionStats();
    console.log('执行统计:', stats);

    const errorStats = engine.getErrorStats();
    console.log('错误统计:', errorStats);

  } catch (error) {
    console.error('工作流执行失败:', error);
    
    // 查看错误历史
    const errorHistory = engine.getErrorHistory();
    console.log('错误历史:', errorHistory);
  }
}

// 运行
runWorkflow();
```

## 注意事项

1. **节点ID唯一性**: 确保每个节点的ID在工作流中是唯一的
2. **边的有效性**: 确保边的source和target指向存在的节点
3. **参数验证**: 节点参数应符合预期的类型和格式
4. **循环依赖**: 避免创建循环依赖的工作流
5. **错误处理**: 关键节点（如takeoff、land）失败会中止工作流
6. **并行执行**: 只有独立的节点才会并行执行

## 调试技巧

1. **启用详细日志**: 在onLog回调中记录所有日志
2. **监控状态变化**: 在onStateChange回调中追踪执行状态
3. **检查错误历史**: 使用getErrorHistory()查看所有错误
4. **分析执行统计**: 使用getExecutionStats()优化工作流结构
5. **测试依赖关系**: 使用hasCircularDependencies()验证工作流

## 更多资源

- [完整实现报告](./WORKFLOW_ENGINE_ENHANCEMENT_COMPLETE.md)
- [需求文档](./.kiro/specs/tello-workflow-enhancement/requirements.md)
- [设计文档](./.kiro/specs/tello-workflow-enhancement/design.md)
- [任务列表](./.kiro/specs/tello-workflow-enhancement/tasks.md)

---

**最后更新**: 2025-10-21
