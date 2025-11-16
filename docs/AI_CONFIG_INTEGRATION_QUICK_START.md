# AI配置集成快速入门

## 快速测试

### 1. 运行集成测试

```bash
cd drone-analyzer-nextjs/python
python test_ai_config_integration.py
```

### 2. 启动后端服务

```bash
python tello_agent_backend.py --host localhost --port 3004
```

## 前端集成示例

### 发送AI配置

```typescript
// 连接WebSocket
const ws = new WebSocket('ws://localhost:3004');

ws.onopen = () => {
  // 发送AI配置
  const config = {
    type: 'set_ai_config',
    data: {
      provider: 'openai',
      model: 'gpt-4o',
      api_key: 'your-api-key',
      api_base: 'https://api.openai.com/v1',
      max_tokens: 2000,
      temperature: 0.7
    }
  };
  
  ws.send(JSON.stringify(config));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'set_ai_config_response') {
    if (message.success) {
      console.log('✅ AI配置成功:', message.data);
    } else {
      console.error('❌ AI配置失败:', message.error);
    }
  }
  
  if (message.type === 'ai_config_updated') {
    console.log('🔄 AI配置已更新:', message.data);
  }
};
```

## 配置示例

### OpenAI

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "api_key": "sk-...",
  "api_base": "https://api.openai.com/v1"
}
```

### Anthropic

```json
{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet",
  "api_key": "sk-ant-...",
  "temperature": 0.5
}
```

### Google

```json
{
  "provider": "google",
  "model": "gemini-1.5-pro",
  "api_key": "AIza..."
}
```

## 常见错误

### 1. 缺少必需字段

```json
{
  "success": false,
  "error": "缺少必需字段: api_key"
}
```

**解决方案**：确保包含provider, model, api_key

### 2. 不支持的提供商

```json
{
  "success": false,
  "error": "配置验证失败: 不支持的AI提供商: xxx"
}
```

**解决方案**：使用支持的提供商（openai, anthropic, google）

### 3. 缺少AI库

```json
{
  "success": false,
  "error": "创建AI客户端失败，缺少必需的库: 请安装 anthropic 库"
}
```

**解决方案**：安装相应的库
```bash
pip install openai anthropic google-generativeai
```

## 验证配置

### 检查配置状态

```python
# 在Python代码中
if agent.ai_config_manager.is_configured():
    config = agent.ai_config_manager.get_config()
    print(f"当前配置: {config.provider}/{config.model}")
    print(f"视觉支持: {config.supports_vision}")
```

### 通过WebSocket查询

```typescript
ws.send(JSON.stringify({
  type: 'get_status'
}));
```

## 下一步

- Task 3: 实现AI配置WebSocket消息处理 ✅ 已完成
- Task 4: 更新命令解析引擎 ⏳ 待实现
- Task 5: 扩展aiConfigSync.ts ⏳ 待实现

## 相关文档

- [完整集成文档](./AI_CONFIG_MANAGER_INTEGRATION.md)
- [AI配置管理器API](../python/ai_config_manager.py)
- [测试文件](../python/test_ai_config_integration.py)
