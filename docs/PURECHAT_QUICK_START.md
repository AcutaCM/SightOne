# PureChat Integration Quick Start

## 快速开始指南

### 1. 在工作流中添加 PureChat 节点

#### 步骤 1: 注册节点类型

在你的 ReactFlow 组件中导入节点类型：

```typescript
import { nodeTypes } from '@/components/workflow/nodes';

<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  // ... other props
/>
```

#### 步骤 2: 创建节点实例

```typescript
const pureChatNode = {
  id: 'node_1',
  type: 'purechat_chat',
  position: { x: 100, y: 100 },
  data: {
    label: 'AI对话',
    parameters: {
      assistantId: 'tello-agent',
      prompt: '分析草莓成熟度',
      temperature: 0.7,
      maxTokens: 1000,
      outputVariable: 'ai_response'
    },
    status: 'idle'
  }
};
```

---

### 2. 使用 PureChat API 客户端

#### 基础用法

```typescript
import { getPureChatClient } from '@/lib/workflow/pureChatClient';

// 获取客户端实例
const client = getPureChatClient();

// 文本对话
const response = await client.chat({
  assistantId: 'tello-agent',
  prompt: '你好，请帮我分析这个任务',
  temperature: 0.7,
  maxTokens: 1000,
});

if (response.success) {
  console.log('AI响应:', response.data);
} else {
  console.error('错误:', response.error);
}
```

#### 图像分析

```typescript
// 图像分析
const imageResponse = await client.analyzeImage({
  assistantId: 'tello-agent',
  imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
  prompt: '这张图片中有多少个草莓？它们的成熟度如何？',
  imageSource: 'camera'
});

if (imageResponse.success) {
  console.log('分析结果:', imageResponse.data);
}
```

#### 自定义配置

```typescript
const client = getPureChatClient({
  baseUrl: 'https://your-api.com/v1',
  apiKey: 'your-api-key',
  model: 'qwen2.5-7b-instruct',
  enableCache: true,
  cacheTimeout: 10 * 60 * 1000, // 10 minutes
  maxRetries: 5,
  retryDelay: 2000,
});
```

---

### 3. 在节点配置中使用助理选择器

```typescript
import AssistantSelector from '@/components/workflow/AssistantSelector';

function MyNodeConfig() {
  const [assistantId, setAssistantId] = useState('');

  return (
    <AssistantSelector
      value={assistantId}
      onChange={setAssistantId}
      label="选择AI助理"
      description="选择用于分析的助理"
      isRequired={true}
    />
  );
}
```

---

### 4. 节点状态管理

#### 更新节点状态

```typescript
// 开始执行
setNodes((nds) =>
  nds.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          data: {
            ...node.data,
            status: 'running',
          },
        }
      : node
  )
);

// 执行成功
setNodes((nds) =>
  nds.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          data: {
            ...node.data,
            status: 'success',
            result: aiResponse,
          },
        }
      : node
  )
);

// 执行失败
setNodes((nds) =>
  nds.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          data: {
            ...node.data,
            status: 'error',
            error: errorMessage,
          },
        }
      : node
  )
);
```

#### 更新进度（仅图像分析节点）

```typescript
setNodes((nds) =>
  nds.map((node) =>
    node.id === nodeId
      ? {
          ...node,
          data: {
            ...node.data,
            status: 'running',
            progress: 45, // 0-100
          },
        }
      : node
  )
);
```

---

### 5. 完整示例：执行 PureChat 节点

```typescript
async function executePureChatNode(node: any) {
  const { parameters } = node.data;
  const client = getPureChatClient();

  try {
    // 更新状态为运行中
    updateNodeStatus(node.id, 'running');

    // 调用 API
    const response = await client.chat({
      assistantId: parameters.assistantId,
      prompt: parameters.prompt,
      temperature: parameters.temperature,
      maxTokens: parameters.maxTokens,
    });

    if (response.success) {
      // 成功：更新状态和结果
      updateNodeStatus(node.id, 'success', {
        result: response.data,
        cached: response.cached,
      });

      // 将结果存储到工作流变量
      setWorkflowVariable(parameters.outputVariable, response.data);

      return response.data;
    } else {
      // 失败：更新错误状态
      updateNodeStatus(node.id, 'error', {
        error: response.error,
      });

      throw new Error(response.error);
    }
  } catch (error: any) {
    updateNodeStatus(node.id, 'error', {
      error: error.message,
    });
    throw error;
  }
}

function updateNodeStatus(nodeId: string, status: string, extra?: any) {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            data: {
              ...node.data,
              status,
              ...extra,
            },
          }
        : node
    )
  );
}
```

---

### 6. 环境变量配置

创建 `.env.local` 文件：

```bash
# PureChat API
NEXT_PUBLIC_PURECHAT_BASE_URL=/api/ai-chat
NEXT_PUBLIC_PURECHAT_API_KEY=your-api-key
NEXT_PUBLIC_PURECHAT_MODEL=qwen2.5-7b-instruct

# DashScope (用于视觉分析)
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=sk-your-dashscope-key
```

---

### 7. 常见问题

#### Q: 如何清除缓存？

```typescript
const client = getPureChatClient();
client.clearCache();
```

#### Q: 如何禁用缓存？

```typescript
const client = getPureChatClient({
  enableCache: false,
});
```

#### Q: 如何处理超时？

```typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('请求超时')), 30000)
);

const response = await Promise.race([
  client.chat(request),
  timeoutPromise,
]);
```

#### Q: 如何获取助理的系统提示词？

```typescript
import { useAssistants } from '@/contexts/AssistantContext';

const { publishedAssistants } = useAssistants();
const assistant = publishedAssistants.find(a => a.id === assistantId);
const systemPrompt = assistant?.prompt;
```

---

### 8. 调试技巧

#### 启用详细日志

```typescript
const client = getPureChatClient();

// 在调用前添加日志
console.log('发送请求:', request);

const response = await client.chat(request);

console.log('收到响应:', response);
console.log('是否缓存:', response.cached);
```

#### 检查节点状态

```typescript
console.log('节点状态:', node.data.status);
console.log('节点参数:', node.data.parameters);
console.log('节点结果:', node.data.result);
console.log('节点错误:', node.data.error);
```

---

### 9. 性能优化

#### 使用缓存

```typescript
// 相同的请求会从缓存返回
const response1 = await client.chat(request);
const response2 = await client.chat(request); // 从缓存返回
```

#### 批量请求

```typescript
const requests = [request1, request2, request3];
const responses = await Promise.all(
  requests.map(req => client.chat(req))
);
```

---

### 10. 测试

#### 单元测试示例

```typescript
import { getPureChatClient, resetPureChatClient } from '@/lib/workflow/pureChatClient';

describe('PureChatClient', () => {
  beforeEach(() => {
    resetPureChatClient();
  });

  it('should cache results', async () => {
    const client = getPureChatClient();
    const request = {
      assistantId: 'test',
      prompt: 'Hello',
    };

    const response1 = await client.chat(request);
    const response2 = await client.chat(request);

    expect(response1.cached).toBe(false);
    expect(response2.cached).toBe(true);
  });
});
```

---

## 下一步

1. 查看 [PURECHAT_INTEGRATION_COMPLETE.md](./PURECHAT_INTEGRATION_COMPLETE.md) 了解完整实现细节
2. 查看 [lib/workflow/README.md](./lib/workflow/README.md) 了解节点系统架构
3. 开始创建你的第一个 PureChat 工作流！

---

**提示**: 如果遇到问题，请检查：
1. 环境变量是否正确配置
2. AssistantContext 中是否有已发布的助理
3. API 端点是否可访问
4. 浏览器控制台是否有错误信息
