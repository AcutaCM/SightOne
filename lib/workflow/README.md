# Tello Workflow Node System

## 概述

这是一个增强的工作流节点系统,支持PureChat AI、UniPixel分割、YOLO检测、挑战卡任务等多种节点类型。

## 架构

```
lib/workflow/
├── nodeDefinitions.ts      # 节点类型定义和参数验证器
├── nodeRegistry.ts         # 节点注册中心
├── nodes/
│   ├── index.ts           # 导出所有节点
│   ├── flowNodes.ts       # 流程控制节点
│   ├── basicNodes.ts      # 基础控制节点
│   ├── movementNodes.ts   # 移动控制节点
│   ├── aiNodes.ts         # AI分析节点(PureChat, UniPixel)
│   ├── detectionNodes.ts  # 检测节点(YOLO, QR, 草莓)
│   ├── challengeNodes.ts  # 挑战卡任务节点
│   ├── logicNodes.ts      # 逻辑判断节点
│   └── dataNodes.ts       # 数据处理节点
└── README.md              # 本文档
```

## 节点类型

### 1. 流程控制 (Flow)
- **start**: 开始节点
- **end**: 结束节点

### 2. 基础控制 (Basic)
- **takeoff**: 起飞
- **land**: 降落
- **emergency_stop**: 紧急停止
- **wait**: 等待
- **hover**: 悬停

### 3. 移动控制 (Movement)
- **move_forward/backward/left/right/up/down**: 六向移动
- **rotate_cw/ccw**: 顺时针/逆时针旋转

### 4. AI分析 (AI)
- **purechat_chat**: PureChat对话节点
- **purechat_image_analysis**: AI图像分析
- **unipixel_segmentation**: UniPixel语义分割

### 5. 检测任务 (Detection)
- **yolo_detection**: YOLO目标检测
- **qr_scan**: QR码扫描
- **strawberry_detection**: 草莓检测
- **object_tracking**: 目标跟踪

### 6. 挑战任务 (Challenge)
- **challenge_8_flight**: 8字飞行
- **challenge_obstacle**: 穿越障碍
- **challenge_precision_land**: 精准降落
- **flip_forward/backward/left/right**: 四向翻转

### 7. 逻辑判断 (Logic)
- **condition_branch**: 条件分支
- **if_else**: IF-ELSE判断
- **loop**: 循环

### 8. 数据处理 (Data)
- **variable_set/get**: 变量设置/获取
- **data_transform**: 数据转换
- **data_filter**: 数据过滤
- **take_photo**: 拍照
- **start_video/stop_video**: 录像控制

## 使用方法

### 1. 获取节点注册中心

```typescript
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';

// 获取所有节点
const allNodes = nodeRegistry.getAllNodes();

// 按类别获取节点
const aiNodes = nodeRegistry.getNodesByCategory('ai');

// 获取特定节点
const pureChatNode = nodeRegistry.getNode('purechat_chat');
```

### 2. 验证节点参数

```typescript
const validation = nodeRegistry.validateNodeParameters('purechat_chat', {
  assistantId: 'assistant-123',
  prompt: 'Hello AI',
  temperature: 0.7,
  maxTokens: 1000,
  outputVariable: 'response'
});

if (!validation.valid) {
  console.error('参数验证失败:', validation.errors);
}
```

### 3. 获取默认参数

```typescript
const defaults = nodeRegistry.getDefaultParameters('yolo_detection');
// Returns: { modelSource: 'builtin', confidence: 0.5, ... }
```

### 4. 使用增强节点库组件

```typescript
import EnhancedNodeLibrary from '@/components/workflow/EnhancedNodeLibrary';

<EnhancedNodeLibrary
  onNodeDragStart={(event, node) => {
    console.log('拖拽节点:', node.label);
  }}
/>
```

## 参数类型

- **string**: 字符串输入
- **number**: 数字输入
- **boolean**: 布尔开关
- **select**: 下拉选择
- **slider**: 滑块输入
- **textarea**: 多行文本
- **assistant**: AI助理选择器
- **image**: 图像选择器
- **json**: JSON编辑器
- **file**: 文件上传

## 参数验证

每个参数可以定义验证函数:

```typescript
{
  name: 'height',
  label: '高度(cm)',
  type: 'number',
  defaultValue: 100,
  min: 20,
  max: 500,
  required: true,
  validation: (value) => ParameterValidator.validateNumber(value, 20, 500)
}
```

内置验证器:
- `ParameterValidator.validateNumber(value, min?, max?)`
- `ParameterValidator.validateString(value, minLength?, maxLength?)`
- `ParameterValidator.validateBoolean(value)`
- `ParameterValidator.validateSelect(value, options)`
- `ParameterValidator.validateJSON(value)`

## 添加新节点

1. 在对应的节点文件中添加定义:

```typescript
// lib/workflow/nodes/myNodes.ts
export const myNodes: WorkflowNodeDefinition[] = [
  {
    type: 'my_custom_node',
    label: '我的节点',
    icon: MyIcon,
    category: 'ai',
    description: '自定义节点描述',
    color: '#ff6b6b',
    parameters: [
      {
        name: 'param1',
        label: '参数1',
        type: 'string',
        defaultValue: '',
        required: true,
        description: '参数描述'
      }
    ]
  }
];
```

2. 在 `nodes/index.ts` 中导出:

```typescript
export * from './myNodes';
```

3. 在 `nodeRegistry.ts` 中注册:

```typescript
import { myNodes } from './nodes/myNodes';

export const allNodes: WorkflowNodeDefinition[] = [
  // ... existing nodes
  ...myNodes
];
```

## 节点颜色方案

- 流程控制: `#4ade80` (绿色)
- 基础控制: `#60a5fa` (蓝色)
- 移动控制: `#a78bfa` (紫色)
- 旋转控制: `#fbbf24` (黄色)
- AI分析: `#8b5cf6` (深紫色)
- 检测任务: `#f59e0b` (橙色)
- 挑战任务: `#f97316` (深橙色)
- 逻辑判断: `#ec4899` (粉色)
- 数据处理: `#6366f1` (靛蓝色)
- 图像采集: `#10b981` (翠绿色)

## 最佳实践

1. **参数命名**: 使用清晰的驼峰命名
2. **验证**: 为关键参数添加验证函数
3. **描述**: 提供详细的节点和参数描述
4. **默认值**: 设置合理的默认值
5. **必填项**: 明确标记必填参数
6. **范围限制**: 为数值参数设置min/max

## 示例

### 创建PureChat对话节点

```typescript
const chatNode = {
  id: 'node_1',
  type: 'purechat_chat',
  data: {
    label: 'AI对话',
    parameters: {
      assistantId: 'assistant-123',
      prompt: '分析这张图片中的草莓成熟度',
      temperature: 0.7,
      maxTokens: 1000,
      outputVariable: 'ai_analysis'
    }
  },
  position: { x: 100, y: 100 }
};
```

### 创建YOLO检测节点

```typescript
const yoloNode = {
  id: 'node_2',
  type: 'yolo_detection',
  data: {
    label: 'YOLO检测',
    parameters: {
      modelSource: 'builtin',
      imageSource: 'camera',
      confidence: 0.7,
      iouThreshold: 0.45,
      drawResults: true,
      outputVariable: 'detections'
    }
  },
  position: { x: 300, y: 100 }
};
```

## 故障排除

### 节点未显示
- 检查节点是否在 `nodeRegistry.ts` 中注册
- 确认节点定义格式正确
- 查看浏览器控制台错误

### 参数验证失败
- 检查参数类型是否匹配
- 确认必填参数已提供
- 验证参数值在允许范围内

### 拖拽不工作
- 确保 `draggable` 属性设置为 `true`
- 检查 `onDragStart` 事件处理器
- 验证数据传输格式正确

## 更新日志

### v1.0.0 (2025-01-20)
- ✅ 初始版本
- ✅ 支持8大类节点
- ✅ 参数验证系统
- ✅ 节点注册中心
- ✅ 增强节点库组件
