# 开发者文档

## 📖 文档概述

本文档为 Tello 无人机工作流系统的开发者提供完整的技术文档，包括 API 接口说明、扩展节点方法和系统架构说明。

---

## 🏗️ 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     前端 (Next.js + React)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 工作流编辑器  │  │  节点库管理   │  │  执行引擎    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  UI 组件库   │  │  状态管理    │  │  性能监控    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket / HTTP
┌─────────────────────────────────────────────────────────────┐
│                    后端 (Python + FastAPI)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 无人机控制   │  │  图像处理    │  │  AI 服务     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ YOLO 检测    │  │  QR 识别     │  │  诊断服务    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ UDP / SDK
┌─────────────────────────────────────────────────────────────┐
│                      Tello 无人机硬件                         │
└─────────────────────────────────────────────────────────────┘
```

### 核心模块

#### 1. 工作流引擎 (`lib/workflowEngine.ts`)
- 节点执行调度
- 数据流管理
- 错误处理
- 并行执行支持

#### 2. 节点注册系统 (`lib/workflow/nodeRegistry.ts`)
- 节点类型定义
- 节点注册与查询
- 节点验证
- 动态加载

#### 3. 无人机后端 (`python/drone_backend.py`)
- WebSocket 通信
- 无人机控制
- 视频流处理
- 状态同步

---

## 🔌 API 接口文档

### 前端 API

#### 工作流 API

##### 1. 生成工作流
```typescript
POST /api/workflow/generate

Request:
{
  "description": string,  // 工作流描述
  "requirements": string[] // 需求列表
}

Response:
{
  "workflow": {
    "nodes": Node[],
    "edges": Edge[]
  },
  "suggestions": string[]
}
```

##### 2. 保存工作流
```typescript
// 使用 workflowStorage.ts
import { saveWorkflow } from '@/lib/workflow/workflowStorage';

await saveWorkflow(workflowId, {
  nodes,
  edges,
  metadata: {
    name: string,
    description: string,
    tags: string[]
  }
});
```

##### 3. 加载工作流
```typescript
import { loadWorkflow } from '@/lib/workflow/workflowStorage';

const workflow = await loadWorkflow(workflowId);
```

#### 无人机控制 API

##### 1. 连接无人机
```typescript
POST /api/drone/connect

Response:
{
  "success": boolean,
  "message": string,
  "battery": number
}
```

##### 2. 起飞
```typescript
POST /api/drone/takeoff

Response:
{
  "success": boolean,
  "message": string
}
```

##### 3. 降落
```typescript
POST /api/drone/land

Response:
{
  "success": boolean,
  "message": string
}
```

##### 4. 移动控制
```typescript
POST /api/drone/move

Request:
{
  "command": "forward" | "back" | "left" | "right" | "up" | "down" | "cw" | "ccw",
  "distance": number  // 20-500 cm
}

Response:
{
  "success": boolean,
  "message": string
}
```

#### 检测服务 API

##### 1. 启动 YOLO 检测
```typescript
POST /api/detection/start

Request:
{
  "model": string,  // 模型名称
  "confidence": number  // 0-1
}

Response:
{
  "success": boolean,
  "message": string
}
```

##### 2. 停止检测
```typescript
POST /api/detection/stop

Response:
{
  "success": boolean
}
```

##### 3. 切换模型
```typescript
POST /api/models/hot-swap

Request:
{
  "modelName": string
}

Response:
{
  "success": boolean,
  "message": string
}
```

#### AI 服务 API

##### 1. PureChat 对话
```typescript
POST /api/ai/chat

Request:
{
  "message": string,
  "assistantId": string,
  "context": any
}

Response:
{
  "response": string,
  "usage": {
    "tokens": number
  }
}
```

##### 2. 图像分析
```typescript
POST /api/vision/analyze

Request:
{
  "image": string,  // base64
  "prompt": string
}

Response:
{
  "analysis": string,
  "confidence": number
}
```

### 后端 WebSocket API

#### 连接
```python
ws://localhost:8000/ws
```

#### 消息格式

##### 1. 无人机状态更新
```json
{
  "type": "drone_status",
  "data": {
    "battery": number,
    "height": number,
    "temperature": number,
    "attitude": {
      "pitch": number,
      "roll": number,
      "yaw": number
    }
  }
}
```

##### 2. 检测结果
```json
{
  "type": "detection_result",
  "data": {
    "detections": [
      {
        "class": string,
        "confidence": number,
        "bbox": [x, y, w, h]
      }
    ],
    "image": string  // base64
  }
}
```

##### 3. 视频帧
```json
{
  "type": "video_frame",
  "data": {
    "frame": string,  // base64
    "timestamp": number
  }
}
```

---

## 🧩 扩展节点开发指南

### 节点类型定义

#### 1. 基础节点接口
```typescript
interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    config?: any;
    [key: string]: any;
  };
  position: { x: number; y: number };
}
```

#### 2. 节点定义
```typescript
interface NodeDefinition {
  type: string;
  category: 'basic' | 'movement' | 'detection' | 'ai' | 'logic' | 'data';
  label: string;
  description: string;
  icon: string;
  color: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  config: ConfigField[];
  execute: (node: WorkflowNode, context: ExecutionContext) => Promise<any>;
}
```

### 创建自定义节点

#### 步骤 1: 定义节点
```typescript
// lib/workflow/nodes/customNodes.ts

import { NodeDefinition } from '../nodeDefinitions';

export const customNode: NodeDefinition = {
  type: 'custom_action',
  category: 'basic',
  label: '自定义动作',
  description: '执行自定义操作',
  icon: '⚡',
  color: '#10b981',
  
  inputs: [
    {
      id: 'trigger',
      label: '触发',
      type: 'trigger'
    },
    {
      id: 'param1',
      label: '参数1',
      type: 'string'
    }
  ],
  
  outputs: [
    {
      id: 'success',
      label: '成功',
      type: 'trigger'
    },
    {
      id: 'result',
      label: '结果',
      type: 'any'
    }
  ],
  
  config: [
    {
      key: 'timeout',
      label: '超时时间',
      type: 'number',
      default: 5000,
      required: false
    }
  ],
  
  execute: async (node, context) => {
    const { param1 } = context.inputs;
    const { timeout } = node.data.config || {};
    
    try {
      // 执行自定义逻辑
      const result = await performCustomAction(param1, timeout);
      
      return {
        success: true,
        result: result
      };
    } catch (error) {
      throw new Error(`自定义动作失败: ${error.message}`);
    }
  }
};
```

#### 步骤 2: 注册节点
```typescript
// lib/workflow/nodeRegistry.ts

import { customNode } from './nodes/customNodes';

export function registerCustomNodes() {
  registerNode(customNode);
}
```

#### 步骤 3: 创建 UI 组件（可选）
```typescript
// components/workflow/nodes/CustomActionNode.tsx

import React from 'react';
import { Handle, Position } from 'reactflow';

export const CustomActionNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Left} id="trigger" />
      
      <div className="node-header">
        <span className="node-icon">{data.icon}</span>
        <span className="node-label">{data.label}</span>
      </div>
      
      <div className="node-body">
        {/* 自定义 UI */}
      </div>
      
      <Handle type="source" position={Position.Right} id="success" />
      <Handle type="source" position={Position.Right} id="result" />
    </div>
  );
};
```

### 节点执行上下文

```typescript
interface ExecutionContext {
  // 输入数据
  inputs: Record<string, any>;
  
  // 全局状态
  globalState: Map<string, any>;
  
  // 工作流实例
  workflow: {
    nodes: WorkflowNode[];
    edges: Edge[];
  };
  
  // 工具函数
  utils: {
    log: (message: string) => void;
    emit: (event: string, data: any) => void;
    wait: (ms: number) => Promise<void>;
  };
  
  // 无人机控制
  drone?: {
    move: (command: string, distance: number) => Promise<void>;
    getStatus: () => Promise<DroneStatus>;
  };
}
```

### 节点类别

#### 1. 基础节点 (basic)
- Start - 开始节点
- End - 结束节点
- Delay - 延迟节点

#### 2. 运动节点 (movement)
- Move - 移动控制
- Takeoff - 起飞
- Land - 降落
- Hover - 悬停

#### 3. 检测节点 (detection)
- YOLO Detection - 目标检测
- QR Scan - 二维码识别
- UniPixel Segmentation - 图像分割

#### 4. AI 节点 (ai)
- PureChat - AI 对话
- Image Analysis - 图像分析
- Decision Making - 决策制定

#### 5. 逻辑节点 (logic)
- Condition - 条件判断
- Loop - 循环
- Switch - 分支

#### 6. 数据节点 (data)
- Variable - 变量存储
- Transform - 数据转换
- Aggregate - 数据聚合

---

## 🎨 UI 组件开发

### 设计系统

#### 颜色规范
```typescript
// lib/workflow/designSystem.ts

export const workflowColors = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  nodeCategories: {
    basic: '#6366f1',
    movement: '#8b5cf6',
    detection: '#ec4899',
    ai: '#06b6d4',
    logic: '#f59e0b',
    data: '#10b981'
  }
};
```

#### 动画效果
```typescript
// lib/workflow/animations.ts

export const nodeAnimations = {
  executing: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0)',
      '0 0 0 8px rgba(59, 130, 246, 0.3)',
      '0 0 0 0 rgba(59, 130, 246, 0)'
    ],
    transition: {
      duration: 1,
      repeat: Infinity
    }
  }
};
```

### 组件库

#### 1. 节点库面板
```typescript
import { EnhancedNodeLibraryV2 } from '@/components/workflow/EnhancedNodeLibraryV2';

<EnhancedNodeLibraryV2
  onNodeSelect={(nodeType) => {
    // 处理节点选择
  }}
/>
```

#### 2. 控制面板
```typescript
import { EnhancedControlPanel } from '@/components/workflow/EnhancedControlPanel';

<EnhancedControlPanel
  onExecute={() => {}}
  onStop={() => {}}
  onSave={() => {}}
  isExecuting={false}
/>
```

#### 3. 性能监控
```typescript
import { PerformanceMonitor } from '@/components/workflow/PerformanceMonitor';

<PerformanceMonitor
  metrics={{
    fps: 60,
    nodeCount: 50,
    executionTime: 1500
  }}
/>
```

---

## 🔧 性能优化

### 虚拟化渲染

```typescript
// lib/workflow/virtualization.ts

import { useVirtualization } from '@/lib/workflow/virtualization';

const { visibleNodes, updateViewport } = useVirtualization({
  nodes: allNodes,
  viewport: { x, y, zoom },
  containerSize: { width, height }
});
```

### 懒加载节点

```typescript
// lib/workflow/lazyNodeLoader.ts

import { useLazyNodeLoader } from '@/lib/workflow/lazyNodeLoader';

const { loadNode, isLoaded } = useLazyNodeLoader();

// 按需加载节点定义
const nodeDefinition = await loadNode('yolo_detection');
```

### 执行优化

```typescript
// lib/workflow/executionOptimizer.ts

import { optimizeExecution } from '@/lib/workflow/executionOptimizer';

const optimizedPlan = optimizeExecution(workflow, {
  enableParallel: true,
  maxConcurrency: 4,
  cacheResults: true
});
```

---

## 🧪 测试指南

### 单元测试

```typescript
// __tests__/workflow/nodeExecution.test.ts

import { executeNode } from '@/lib/workflowEngine';

describe('Node Execution', () => {
  it('should execute move node correctly', async () => {
    const node = {
      id: '1',
      type: 'move',
      data: {
        config: {
          direction: 'forward',
          distance: 100
        }
      }
    };
    
    const result = await executeNode(node, mockContext);
    
    expect(result.success).toBe(true);
  });
});
```

### 集成测试

```typescript
// __tests__/workflow/workflowExecution.test.ts

import { executeWorkflow } from '@/lib/workflowEngine';

describe('Workflow Execution', () => {
  it('should execute complete workflow', async () => {
    const workflow = {
      nodes: [startNode, moveNode, endNode],
      edges: [edge1, edge2]
    };
    
    const result = await executeWorkflow(workflow);
    
    expect(result.completed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

---

## 📚 相关文档

- [用户使用文档](./USER_GUIDE.md)
- [API 参考](./API_REFERENCE.md)
- [架构设计](../design.md)
- [需求文档](../requirements.md)
- [源代码汇总](../CORE_SOURCE_CODE.md)

---

## 🤝 贡献指南

### 代码规范

1. **TypeScript** - 使用严格模式
2. **命名规范** - 驼峰命名法
3. **注释** - 关键逻辑必须注释
4. **类型定义** - 避免使用 any

### 提交流程

1. Fork 项目
2. 创建特性分支
3. 编写测试
4. 提交 PR
5. 代码审查

---

**最后更新:** 2025-10-21  
**维护者:** Tello Workflow Team
