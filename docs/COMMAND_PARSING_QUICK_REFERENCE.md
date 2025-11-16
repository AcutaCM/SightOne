# 命令解析引擎 - 快速参考

## 快速开始

### 1. 配置AI（前端）

```typescript
// 发送AI配置到后端
ws.send(JSON.stringify({
  type: 'set_ai_config',
  data: {
    provider: 'openai',      // 或 'anthropic', 'google'
    model: 'gpt-4o',
    api_key: 'your-api-key',
    temperature: 0.7,
    max_tokens: 2000
  }
}));
```

### 2. 发送命令

```typescript
// 发送自然语言命令
ws.send(JSON.stringify({
  type: 'natural_language_command',
  data: {
    command: '起飞后向前飞50厘米'
  }
}));
```

### 3. 接收响应

```typescript
ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  
  if (response.type === 'natural_language_command_response') {
    if (response.success) {
      console.log('命令执行成功');
      console.log('AI分析:', response.ai_analysis);
      console.log('执行结果:', response.execution_results);
    } else {
      console.error('命令执行失败:', response.error);
    }
  }
};
```

## 支持的命令

### 基础飞行
- `起飞` → takeoff
- `降落` → land
- `紧急停止` → emergency

### 移动
- `向前飞X厘米` → move_forward (distance: X)
- `向后飞X厘米` → move_back (distance: X)
- `向左飞X厘米` → move_left (distance: X)
- `向右飞X厘米` → move_right (distance: X)
- `上升X厘米` → move_up (distance: X)
- `下降X厘米` → move_down (distance: X)

### 旋转
- `顺时针旋转X度` → rotate_clockwise (degrees: X)
- `逆时针旋转X度` → rotate_counter_clockwise (degrees: X)

### 翻滚
- `向前翻滚` → flip_forward
- `向后翻滚` → flip_back
- `向左翻滚` → flip_left
- `向右翻滚` → flip_right

### 状态查询
- `查询电量` → get_battery
- `查询温度` → get_temperature
- `查询高度` → get_height

## 支持的AI提供商

| 提供商 | 推荐模型 | API端点 |
|--------|---------|---------|
| OpenAI | gpt-4o, gpt-4-turbo | https://api.openai.com/v1 |
| Anthropic | claude-3-5-sonnet | https://api.anthropic.com |
| Google | gemini-1.5-pro | https://generativelanguage.googleapis.com |

## 常见错误

### AI未配置
```json
{
  "success": false,
  "error": "AI未配置，请先通过WebSocket发送AI配置"
}
```
**解决方案**: 先发送 `set_ai_config` 消息

### API密钥无效
```json
{
  "success": false,
  "error": "OpenAI解析失败: Invalid API key"
}
```
**解决方案**: 检查API密钥是否正确

### 不支持的提供商
```json
{
  "success": false,
  "error": "不支持的AI提供商: xxx"
}
```
**解决方案**: 使用支持的提供商（openai, anthropic, google）

## 测试命令

```bash
# 运行测试
python drone-analyzer-nextjs/python/test_command_parsing.py
```

## 调试技巧

### 1. 查看日志
```python
# 后端日志会显示详细的解析过程
2025-11-10 22:18:24,824 - tello_agent_backend.TelloAgent - INFO - 使用AI模型解析命令: openai/gpt-4o
2025-11-10 22:18:24,825 - tello_agent_backend.TelloAgent - INFO - OpenAI响应: [...]
2025-11-10 22:18:24,825 - tello_agent_backend.TelloAgent - INFO - 成功提取2个命令
```

### 2. 检查AI响应
```python
# 在响应中查看AI的原始分析
response.ai_analysis.analysis  # AI的完整响应文本
```

### 3. 验证命令格式
```python
# 确保命令包含必需字段
{
  "action": "takeoff",        # 必需
  "parameters": {},           # 必需（可以为空）
  "description": "起飞"       # 可选
}
```

## 性能提示

1. **复用连接**: 保持WebSocket连接打开，避免频繁重连
2. **批量命令**: 一次发送多个命令可以提高效率
3. **缓存配置**: AI配置只需发送一次，除非切换模型
4. **异步处理**: 使用异步方式处理响应，避免阻塞

## 安全建议

1. **API密钥保护**: 不要在前端代码中硬编码API密钥
2. **命令验证**: 后端会验证所有命令的安全性
3. **参数限制**: 距离和角度参数有合理的范围限制
4. **错误处理**: 始终检查响应的success字段

## 示例代码

### 完整的前端集成示例
```typescript
class TelloCommandParser {
  private ws: WebSocket;
  
  constructor(wsUrl: string) {
    this.ws = new WebSocket(wsUrl);
    this.setupHandlers();
  }
  
  setupHandlers() {
    this.ws.onopen = () => {
      console.log('连接成功');
      this.configureAI();
    };
    
    this.ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      this.handleResponse(response);
    };
  }
  
  configureAI() {
    this.ws.send(JSON.stringify({
      type: 'set_ai_config',
      data: {
        provider: 'openai',
        model: 'gpt-4o',
        api_key: process.env.OPENAI_API_KEY
      }
    }));
  }
  
  sendCommand(command: string) {
    this.ws.send(JSON.stringify({
      type: 'natural_language_command',
      data: { command }
    }));
  }
  
  handleResponse(response: any) {
    if (response.type === 'ai_config_updated') {
      console.log('AI配置成功:', response.data);
    } else if (response.type === 'natural_language_command_response') {
      if (response.success) {
        console.log('命令执行成功');
        response.execution_results.forEach((result: any) => {
          console.log(`- ${result.action}: ${result.message}`);
        });
      } else {
        console.error('命令执行失败:', response.error);
      }
    }
  }
}

// 使用
const parser = new TelloCommandParser('ws://localhost:3004');
parser.sendCommand('起飞后向前飞50厘米');
```

## 相关文档

- [完整实现文档](./COMMAND_PARSING_ENGINE_UPDATE.md)
- [设计文档](../.kiro/specs/tello-agent-bridge/design.md)
- [需求文档](../.kiro/specs/tello-agent-bridge/requirements.md)
- [任务列表](../.kiro/specs/tello-agent-bridge/tasks.md)

## 获取帮助

如果遇到问题：
1. 查看后端日志了解详细错误信息
2. 运行测试文件验证基础功能
3. 检查AI配置是否正确
4. 确认API密钥有效且有足够的配额
