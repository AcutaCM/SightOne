# Tello AI 解析器使用指南

## 概述

Tello AI 解析器是一个强大的工具,可以将自然语言指令转换为 Tello 无人机控制命令。它支持多种 AI 提供商,包括 OpenAI、Anthropic、Google、Ollama、Qwen、DeepSeek 等。

## 特性

- ✅ **多 AI 提供商支持**: OpenAI, Anthropic, Google, Ollama, Qwen, DeepSeek, Azure, Groq, Mistral, OpenRouter
- ✅ **智能命令解析**: 将自然语言转换为结构化命令
- ✅ **命令验证**: 自动验证命令参数的有效性
- ✅ **安全检查**: 生成安全检查清单
- ✅ **时间估算**: 自动估算命令执行时间
- ✅ **电量估算**: 自动估算所需电池电量
- ✅ **错误处理**: 完善的错误处理和重试机制

## 安装

解析器已经内置在项目中,无需额外安装。

## 基本使用

### 1. 使用 Hook (推荐)

```typescript
import { useTelloAIParser } from '@/hooks/useTelloAIParser';

function MyComponent() {
  const { parse, isLoading, error, lastResult } = useTelloAIParser({
    aiConfig: {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      temperature: 0.1,
      maxTokens: 1000
    },
    onSuccess: (data) => {
      console.log('解析成功:', data);
    },
    onError: (error) => {
      console.error('解析失败:', error);
    }
  });

  const handleParse = async () => {
    const result = await parse('起飞然后向前飞2米');
    
    if (result.success) {
      console.log('命令:', result.data.commands);
      console.log('安全检查:', result.data.safety_checks);
      console.log('预计时间:', result.data.estimated_time, '秒');
      console.log('所需电量:', result.data.battery_required, '%');
    }
  };

  return (
    <div>
      <button onClick={handleParse} disabled={isLoading}>
        {isLoading ? '解析中...' : '解析指令'}
      </button>
      {error && <div>错误: {error}</div>}
    </div>
  );
}
```

### 2. 直接使用类

```typescript
import { createTelloAIParser } from '@/lib/services/telloAIParser';

const parser = createTelloAIParser({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: 'your-api-key'
});

const result = await parser.parse('起飞然后向前飞2米');

if (result.success) {
  console.log('命令:', result.data.commands);
}
```

## AI 提供商配置

### OpenAI

```typescript
{
  provider: 'openai',
  model: 'gpt-4',
  apiKey: 'sk-...',
  temperature: 0.1,
  maxTokens: 1000
}
```

### Anthropic (Claude)

```typescript
{
  provider: 'anthropic',
  model: 'claude-3-opus-20240229',
  apiKey: 'sk-ant-...',
  temperature: 0.1,
  maxTokens: 1000
}
```

### Google (Gemini)

```typescript
{
  provider: 'google',
  model: 'gemini-pro',
  apiKey: 'AIza...',
  temperature: 0.1,
  maxTokens: 1000
}
```

### Ollama (本地)

```typescript
{
  provider: 'ollama',
  model: 'llama2',
  baseURL: 'http://localhost:11434',
  temperature: 0.1
}
```

### Azure OpenAI

```typescript
{
  provider: 'azure',
  model: 'gpt-4',
  apiKey: 'your-key',
  endpoint: 'https://your-resource.openai.azure.com',
  deployment: 'your-deployment-name',
  temperature: 0.1,
  maxTokens: 1000
}
```

### Qwen (通义千问)

```typescript
{
  provider: 'qwen',
  model: 'qwen-turbo',
  apiKey: 'sk-...',
  baseURL: 'https://dashscope.aliyuncs.com/api/v1',
  temperature: 0.1,
  maxTokens: 1000
}
```

### DeepSeek

```typescript
{
  provider: 'deepseek',
  model: 'deepseek-chat',
  apiKey: 'sk-...',
  temperature: 0.1,
  maxTokens: 1000
}
```

## 支持的命令

解析器支持以下 Tello 无人机命令:

| 命令 | 参数 | 说明 |
|------|------|------|
| `takeoff` | - | 起飞 |
| `land` | - | 降落 |
| `emergency` | - | 紧急停止 |
| `up` | `distance` (cm) | 向上移动 |
| `down` | `distance` (cm) | 向下移动 |
| `left` | `distance` (cm) | 向左移动 |
| `right` | `distance` (cm) | 向右移动 |
| `forward` | `distance` (cm) | 向前移动 |
| `back` | `distance` (cm) | 向后移动 |
| `cw` | `degrees` (度) | 顺时针旋转 |
| `ccw` | `degrees` (度) | 逆时针旋转 |
| `flip` | `direction` (l/r/f/b) | 翻滚 |
| `photo` | - | 拍照 |
| `video_start` | - | 开始录像 |
| `video_stop` | - | 停止录像 |

## 参数限制

- **距离**: 20-500 厘米
- **角度**: 1-360 度
- **翻滚方向**: l (左), r (右), f (前), b (后)

## 示例

### 示例 1: 简单起飞降落

```typescript
const result = await parser.parse('起飞然后降落');

// 输出:
{
  success: true,
  data: {
    commands: [
      { action: 'takeoff', params: {}, description: '起飞' },
      { action: 'land', params: {}, description: '降落' }
    ],
    safety_checks: [
      '确认电池电量充足(>20%)',
      '确认周围环境安全'
    ],
    estimated_time: 10,
    battery_required: 20
  }
}
```

### 示例 2: 复杂飞行路径

```typescript
const result = await parser.parse('起飞,向前飞100厘米,顺时针旋转90度,然后降落');

// 输出:
{
  success: true,
  data: {
    commands: [
      { action: 'takeoff', params: {}, description: '起飞' },
      { action: 'forward', params: { distance: 100 }, description: '向前飞行100厘米' },
      { action: 'cw', params: { degrees: 90 }, description: '顺时针旋转90度' },
      { action: 'land', params: {}, description: '降落' }
    ],
    safety_checks: [
      '确认电池电量充足(>25%)',
      '确认前方100厘米范围内无障碍物',
      '确认旋转空间足够'
    ],
    estimated_time: 20,
    battery_required: 30
  }
}
```

### 示例 3: 8字飞行

```typescript
const result = await parser.parse('执行8字飞行');

// 输出:
{
  success: true,
  data: {
    commands: [
      { action: 'takeoff', params: {}, description: '起飞' },
      { action: 'forward', params: { distance: 50 }, description: '向前飞行' },
      { action: 'cw', params: { degrees: 360 }, description: '顺时针旋转一圈' },
      { action: 'forward', params: { distance: 50 }, description: '向前飞行' },
      { action: 'ccw', params: { degrees: 360 }, description: '逆时针旋转一圈' },
      { action: 'land', params: {}, description: '降落' }
    ],
    safety_checks: [
      '确认电池电量充足(>40%)',
      '确认飞行空间足够(至少3x3米)',
      '确认无障碍物'
    ],
    estimated_time: 45,
    battery_required: 45
  }
}
```

## 错误处理

```typescript
const result = await parser.parse('做一些不安全的事情');

if (!result.success) {
  console.error('解析失败:', result.error);
  // 输出: "解析失败: 指令不安全或不清楚"
}
```

## 最佳实践

1. **使用 Hook**: 在 React 组件中使用 `useTelloAIParser` Hook
2. **错误处理**: 始终检查 `result.success` 并处理错误
3. **安全检查**: 在执行命令前检查 `safety_checks`
4. **电量检查**: 确保无人机电量满足 `battery_required`
5. **时间估算**: 使用 `estimated_time` 告知用户预计执行时间
6. **配置缓存**: 避免频繁创建新的解析器实例

## 性能优化

1. **请求缓存**: 相同的指令会返回缓存结果
2. **超时设置**: 设置合理的 API 超时时间
3. **提示词优化**: 使用精简的系统提示词
4. **批量处理**: 一次解析多个指令

## 故障排除

### 问题 1: API 调用失败

**原因**: API Key 无效或网络问题

**解决方案**:
- 检查 API Key 是否正确
- 检查网络连接
- 检查 API 配额

### 问题 2: 解析结果不准确

**原因**: AI 模型理解错误

**解决方案**:
- 使用更强大的模型 (如 GPT-4)
- 降低 temperature 参数
- 提供更清晰的指令

### 问题 3: 命令验证失败

**原因**: 参数超出范围

**解决方案**:
- 检查距离参数 (20-500cm)
- 检查角度参数 (1-360度)
- 使用更合理的参数值

## 相关文档

- [Tello PureChat 集成指南](./TELLO_PURECHAT_INTEGRATION_GUIDE.md)
- [Intelligent Agent Preset 文档](./INTELLIGENT_AGENT_PRESET_SERVICE.md)
- [WebSocket 通信指南](./WEBSOCKET_COMMUNICATION_GUIDE.md)

## 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 初始版本
- ✅ 支持多 AI 提供商
- ✅ 命令验证和安全检查
- ✅ 时间和电量估算
