# Tello工作流节点系统 - 快速开始

## 5分钟快速上手

### 1. 导入节点库

```typescript
import { nodeRegistry, nodeCategories } from '@/lib/workflow';
import EnhancedNodeLibrary from '@/components/workflow/EnhancedNodeLibrary';
```

### 2. 使用节点库组件

```tsx
<EnhancedNodeLibrary
  onNodeDragStart={(event, node) => {
    console.log('拖拽节点:', node.label);
  }}
/>
```

### 3. 获取节点信息

```typescript
// 获取所有AI节点
const aiNodes = nodeRegistry.getNodesByCategory('ai');

// 获取特定节点
const pureChatNode = nodeRegistry.getNode('purechat_chat');

// 获取默认参数
const defaults = nodeRegistry.getDefaultParameters('yolo_detection');
```

### 4. 验证节点参数

```typescript
const validation = nodeRegistry.validateNodeParameters('purechat_chat', {
  assistantId: 'assistant-123',
  prompt: '分析图片',
  temperature: 0.7,
  maxTokens: 1000,
  outputVariable: 'result'
});

if (!validation.valid) {
  console.error('验证失败:', validation.errors);
}
```

## 新增节点一览

### PureChat AI节点

#### 1. PureChat对话 (`purechat_chat`)
```typescript
{
  assistantId: 'assistant-id',      // 必填: AI助理ID
  prompt: '你的提示词',              // 必填: 提示词
  temperature: 0.7,                 // 可选: 0-2
  maxTokens: 1000,                  // 可选: 100-4000
  outputVariable: 'ai_response'     // 必填: 输出变量名
}
```

#### 2. AI图像分析 (`purechat_image_analysis`)
```typescript
{
  assistantId: 'assistant-id',      // 必填: AI助理ID
  imageSource: 'camera',            // 必填: camera/upload/variable
  prompt: '分析这张图片',            // 必填: 分析提示
  outputVariable: 'image_analysis'  // 必填: 输出变量名
}
```

### UniPixel分割节点

#### 3. UniPixel分割 (`unipixel_segmentation`)
```typescript
{
  imageSource: 'camera',            // 必填: camera/upload/variable
  query: '草莓',                    // 必填: 分割对象描述
  confidence: 0.7,                  // 可选: 0.1-1.0
  sampleFrames: 1,                  // 可选: 1-10
  visualize: true,                  // 可选: 是否可视化
  outputVariable: 'segmentation'    // 必填: 输出变量名
}
```

### YOLO检测节点

#### 4. YOLO检测 (`yolo_detection`)
```typescript
{
  modelSource: 'builtin',           // 必填: builtin/upload/url
  modelPath: '',                    // 可选: 自定义模型路径
  imageSource: 'camera',            // 必填: camera/upload/variable
  confidence: 0.5,                  // 可选: 0.1-1.0
  iouThreshold: 0.45,               // 可选: 0.1-1.0
  classes: '',                      // 可选: 逗号分隔的类别
  drawResults: true,                // 可选: 是否绘制结果
  outputVariable: 'detections'      // 必填: 输出变量名
}
```

### 挑战卡任务节点

#### 5. 8字飞行 (`challenge_8_flight`)
```typescript
{
  radius: 100,                      // 必填: 50-300cm
  speed: 50,                        // 可选: 10-100%
  loops: 1,                         // 可选: 1-5次
  timeout: 60,                      // 可选: 10-300秒
  scoreOutput: 'flight_8_score'     // 可选: 评分变量名
}
```

#### 6. 穿越障碍 (`challenge_obstacle`)
```typescript
{
  obstaclePositions: '[{"x":100,"y":0,"z":100}]',  // 必填: JSON数组
  speed: 40,                        // 可选: 10-100%
  safetyMargin: 20,                 // 可选: 10-50cm
  timeout: 120,                     // 可选: 30-300秒
  scoreOutput: 'obstacle_score'     // 可选: 评分变量名
}
```

#### 7. 精准降落 (`challenge_precision_land`)
```typescript
{
  targetPosition: '{"x":0,"y":0}',  // 必填: JSON对象
  precision: 10,                    // 必填: 5-50cm
  maxAttempts: 3,                   // 可选: 1-5次
  timeout: 60,                      // 可选: 10-180秒
  scoreOutput: 'landing_score'      // 可选: 评分变量名
}
```

## 常用代码片段

### 创建工作流节点

```typescript
const createWorkflowNode = (type: string, position: {x: number, y: number}) => {
  const nodeDefinition = nodeRegistry.getNode(type);
  const defaultParams = nodeRegistry.getDefaultParameters(type);
  
  return {
    id: `node_${Date.now()}`,
    type: 'statusNode',
    position,
    data: {
      label: nodeDefinition?.label || type,
      nodeType: type,
      parameters: defaultParams,
      status: 'idle'
    }
  };
};
```

### 验证工作流

```typescript
const validateWorkflow = (nodes: any[]) => {
  const errors: string[] = [];
  
  nodes.forEach(node => {
    const validation = nodeRegistry.validateNodeParameters(
      node.data.nodeType,
      node.data.parameters
    );
    
    if (!validation.valid) {
      errors.push(`节点 ${node.id}: ${Object.values(validation.errors).join(', ')}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};
```

### 搜索节点

```typescript
const searchNodes = (query: string) => {
  const allNodes = nodeRegistry.getAllNodes();
  const lowerQuery = query.toLowerCase();
  
  return allNodes.filter(node =>
    node.label.toLowerCase().includes(lowerQuery) ||
    node.description.toLowerCase().includes(lowerQuery) ||
    node.type.toLowerCase().includes(lowerQuery)
  );
};
```

## 节点分类速查

| 分类 | 英文 | 颜色 | 主要节点 |
|------|------|------|---------|
| 流程控制 | flow | 绿色 | start, end |
| 基础控制 | basic | 蓝色 | takeoff, land, hover |
| 移动控制 | movement | 紫色 | move_*, rotate_* |
| AI分析 | ai | 深紫 | purechat_*, unipixel_* |
| 检测任务 | detection | 橙色 | yolo_*, qr_scan |
| 挑战任务 | challenge | 深橙 | challenge_*, flip_* |
| 逻辑判断 | logic | 粉色 | if_else, loop |
| 数据处理 | data | 靛蓝 | variable_*, data_* |

## 参数类型速查

| 类型 | 说明 | 示例 |
|------|------|------|
| string | 字符串 | "hello" |
| number | 数字 | 100 |
| boolean | 布尔值 | true |
| select | 下拉选择 | "option1" |
| slider | 滑块 | 0.7 |
| textarea | 多行文本 | "长文本..." |
| assistant | AI助理 | "assistant-123" |
| json | JSON对象 | '{"x":0}' |

## 常见问题

### Q: 如何添加自定义节点?
A: 在 `lib/workflow/nodes/` 下创建新文件,定义节点,然后在 `nodeRegistry.ts` 中注册。

### Q: 参数验证失败怎么办?
A: 检查参数类型、必填项和范围限制,使用 `validateNodeParameters` 查看具体错误。

### Q: 如何获取AI助理列表?
A: 使用 `AssistantContext` 获取可用助理列表。

### Q: 节点图标如何自定义?
A: 在节点定义中指定 `icon` 属性,使用 lucide-react 图标。

## 下一步

- 查看完整文档: `lib/workflow/README.md`
- 实现节点执行逻辑: 任务2-5
- 集成到工作流编辑器
- 添加节点配置UI

## 支持

遇到问题? 查看:
1. `lib/workflow/README.md` - 完整文档
2. `WORKFLOW_NODE_SYSTEM_COMPLETE.md` - 实施总结
3. 节点定义文件 - 参数详情
