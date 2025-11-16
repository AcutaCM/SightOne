# Tello 智能代理 TypeScript 重写

## 概述

这是 Tello 智能代理的 TypeScript 重写版本，主要特点：

1. **使用 chatbotchat 的 AI 配置**：直接复用 chatbotchat 的 AI 提供商配置
2. **前端分析**：在浏览器中使用 AI 分析自然语言命令
3. **命令序列展示**：向用户展示生成的命令序列
4. **后端执行**：将命令发送给 `drone_backend.py` 执行

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                     前端 (TypeScript)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TelloIntelligentAgentPanel (UI Component)           │  │
│  │  - 用户输入自然语言命令                                │
│  │  - 显示 AI 配置（来自 chatbotchat）                   │
│  │  - 展示生成的命令序列                                  │
│  │  - 显示执行结果                                        │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useTelloIntelligentAgent (React Hook)               │  │
│  │  - 管理状态                                            │
│  │  - 协调分析和执行                                      │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TelloIntelligentAgent (Service Class)               │  │
│  │  - 调用 AI API 分析命令                               │
│  │  - 解析 AI 响应                                        │
│  │  - 发送命令到后端                                      │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP POST
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  后端 (Python - drone_backend.py)            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/drone/command                                   │  │
│  │  - 接收命令                                            │
│  │  - 执行无人机控制                                      │
│  │  - 返回执行结果                                        │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tello 无人机                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 主要文件

### 1. `lib/services/telloIntelligentAgent.ts`

核心服务类，负责：
- AI 命令分析
- 图像分析（可选）
- 命令执行协调
- 与 drone_backend 通信

**主要方法：**

```typescript
class TelloIntelligentAgent {
  // 分析自然语言命令
  async analyzeCommand(command: string): Promise<AIAnalysisResult>
  
  // 分析图像
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult>
  
  // 执行命令序列
  async executeCommands(commands: DroneCommand[]): Promise<CommandExecutionResult[]>
  
  // 更新 AI 配置
  updateConfig(config: Partial<ChatbotAIConfig>): void
}
```

### 2. `hooks/useTelloIntelligentAgent.ts`

React Hook，提供：
- 状态管理
- 命令分析
- 命令执行
- 错误处理

**使用示例：**

```typescript
const {
  isAnalyzing,
  isExecuting,
  lastAnalysis,
  lastExecution,
  error,
  analyzeCommand,
  executeCommands,
  analyzeAndExecute
} = useTelloIntelligentAgent({
  config: chatbotAIConfig,
  droneBackendUrl: 'http://localhost:8000',
  autoExecute: false
});
```

### 3. `components/TelloIntelligentAgentPanel.tsx`

UI 组件，包含：
- 命令输入框
- AI 配置面板
- 命令序列展示
- 执行结果显示
- 图像上传和分析

### 4. `app/tello-agent/page.tsx`

完整的页面，展示：
- 智能代理面板
- 命令历史
- 执行结果
- 使用说明

## AI 配置集成

### 从 chatbotchat 获取配置

```typescript
// 从 localStorage 读取 chatbotchat 的配置
const storedConfig = localStorage.getItem('chatbot_ai_config');
if (storedConfig) {
  const parsed = JSON.parse(storedConfig);
  const aiConfig: ChatbotAIConfig = {
    provider: parsed.provider || 'openai',
    model: parsed.model || 'gpt-4',
    apiKey: parsed.apiKey || '',
    baseUrl: parsed.baseUrl || '',
    temperature: parsed.temperature || 0.1,
    maxTokens: parsed.maxTokens || 1000
  };
}
```

### 支持的 AI 提供商

- **OpenAI**: GPT-4, GPT-3.5
- **Azure OpenAI**: 企业级部署
- **Ollama**: 本地模型（Llama, Mistral 等）
- **Qwen**: 阿里云通义千问
- **DeepSeek**: DeepSeek AI
- **Groq**: 高速推理
- **Mistral**: Mistral AI
- **OpenRouter**: 多模型路由
- **Dify**: Dify 平台

## 使用流程

### 1. 配置 AI

在 chatbotchat 中配置 AI 提供商，或在智能代理面板中手动配置：

```typescript
const config: ChatbotAIConfig = {
  provider: 'openai',
  model: 'gpt-4',
  apiKey: 'your-api-key',
  baseUrl: 'https://api.openai.com/v1',
  temperature: 0.1,
  maxTokens: 1000
};
```

### 2. 输入自然语言命令

```
起飞，向前飞50厘米，顺时针旋转90度，然后降落
```

### 3. AI 分析

系统会调用 AI API 分析命令，生成结构化的命令序列：

```json
{
  "commands": [
    {
      "action": "takeoff",
      "parameters": {},
      "description": "起飞"
    },
    {
      "action": "move_forward",
      "parameters": { "distance": 50 },
      "description": "向前移动50厘米"
    },
    {
      "action": "rotate_clockwise",
      "parameters": { "degrees": 90 },
      "description": "顺时针旋转90度"
    },
    {
      "action": "land",
      "parameters": {},
      "description": "降落"
    }
  ],
  "reasoning": "按照用户指令顺序执行：起飞 -> 前进 -> 旋转 -> 降落"
}
```

### 4. 用户确认

用户可以查看生成的命令序列，确认无误后执行。

### 5. 发送到后端

点击"执行"按钮后，命令会逐个发送到 `drone_backend.py`：

```typescript
// 发送单个命令
const response = await fetch('http://localhost:8000/api/drone/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'move_forward',
    parameters: { distance: 50 }
  })
});
```

### 6. 查看结果

执行结果会实时显示在界面上：

```json
{
  "success": true,
  "action": "move_forward",
  "message": "向前移动 50 厘米",
  "data": { "battery": 85, "height": 120 }
}
```

## 可用命令

### 基础控制

- `takeoff` - 起飞
- `land` - 降落
- `emergency` - 紧急停止
- `hover` - 悬停

### 移动命令

- `move_forward` - 向前移动（参数：distance 厘米）
- `move_back` - 向后移动（参数：distance 厘米）
- `move_left` - 向左移动（参数：distance 厘米）
- `move_right` - 向右移动（参数：distance 厘米）
- `move_up` - 向上移动（参数：distance 厘米）
- `move_down` - 向下移动（参数：distance 厘米）

### 旋转命令

- `rotate_clockwise` - 顺时针旋转（参数：degrees 度数）
- `rotate_counter_clockwise` - 逆时针旋转（参数：degrees 度数）

### 状态查询

- `get_battery` - 获取电池电量
- `get_status` - 获取无人机状态

## 图像分析（可选）

支持上传图像进行分析，AI 会：
1. 描述图像内容
2. 识别障碍物和兴趣点
3. 建议适当的无人机动作

```typescript
const result = await analyzeImage(
  imageBase64,
  "分析这张图片，建议无人机应该如何移动"
);
```

## 错误处理

### AI 分析错误

- API 密钥无效
- 模型不可用
- 响应格式错误
- 网络超时

### 命令执行错误

- 无人机未连接
- 电量不足
- 命令参数无效
- 执行超时

所有错误都会在界面上清晰显示，并提供错误信息。

## 与 Python 版本的区别

| 特性 | Python 版本 | TypeScript 版本 |
|------|------------|----------------|
| 运行位置 | 后端服务器 | 前端浏览器 |
| AI 配置 | 环境变量 | chatbotchat 配置 |
| 命令展示 | WebSocket 推送 | 直接显示 |
| 执行方式 | 直接控制无人机 | 通过 HTTP 调用后端 |
| 用户交互 | 命令行/WebSocket | React UI 组件 |

## 部署

### 前端

```bash
cd drone-analyzer-nextjs
npm install
npm run dev
```

访问：`http://localhost:3000/tello-agent`

### 后端

确保 `drone_backend.py` 运行在 `http://localhost:8000`：

```bash
cd drone-analyzer-nextjs/python
python drone_backend.py
```

## 配置示例

### OpenAI

```typescript
{
  provider: 'openai',
  model: 'gpt-4',
  apiKey: 'sk-...',
  baseUrl: 'https://api.openai.com/v1'
}
```

### Ollama (本地)

```typescript
{
  provider: 'ollama',
  model: 'llama3.1:8b',
  baseUrl: 'http://localhost:11434/v1'
}
```

### Qwen

```typescript
{
  provider: 'qwen',
  model: 'qwen-turbo',
  apiKey: 'sk-...',
  baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
}
```

## 安全注意事项

1. **API 密钥保护**：不要在前端代码中硬编码 API 密钥
2. **命令验证**：后端应验证所有命令的合法性
3. **速率限制**：防止 API 滥用
4. **无人机安全**：确保命令参数在安全范围内

## 未来改进

- [ ] 支持批量命令模板
- [ ] 命令历史记录和重放
- [ ] 实时视频流分析
- [ ] 多无人机协同控制
- [ ] 语音命令输入
- [ ] 3D 轨迹可视化

## 故障排除

### AI 分析失败

1. 检查 API 密钥是否正确
2. 确认网络连接
3. 查看浏览器控制台错误
4. 尝试不同的 AI 提供商

### 命令执行失败

1. 确认 drone_backend 正在运行
2. 检查无人机连接状态
3. 验证命令参数范围
4. 查看后端日志

### 配置问题

1. 清除浏览器缓存
2. 重新配置 AI 提供商
3. 检查 localStorage 数据
4. 使用默认配置测试

## 总结

这个 TypeScript 重写版本提供了：

✅ 完全在前端运行的 AI 分析  
✅ 与 chatbotchat 无缝集成  
✅ 清晰的命令序列展示  
✅ 可靠的后端执行机制  
✅ 友好的用户界面  
✅ 完善的错误处理  

适合需要在浏览器中进行 AI 分析，然后通过 HTTP API 控制无人机的场景。
