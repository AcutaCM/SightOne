# WebSocket持久连接修复

## 问题描述

WebSocket连接在处理自然语言命令后立即关闭，导致以下错误：

```
2025-11-12 13:29:53,819 - __main__ - WARNING - WebSocket连接已关闭，无法发送响应: natural_language_command
2025-11-12 13:29:53,820 - __main__ - INFO - WebSocket客户端已移除: ('127.0.0.1', 49152)
2025-11-12 13:29:53,820 - websockets.server - INFO - connection closed
```

## 根本原因

虽然WebSocket服务器代码本身是正确的（使用`async for message in websocket:`循环保持连接），但存在以下问题：

1. **日志不够详细** - 无法清楚看到连接状态变化
2. **超时配置不当** - `ping_timeout=10`秒对于长时间AI分析和命令执行来说太短
3. **缺少连接确认** - 客户端不知道连接是否成功建立

## 解决方案

### 1. 增强连接处理

在`websocket_handler`方法中添加：

- **连接确认消息** - 连接建立时立即发送确认
- **详细日志** - 记录每个消息的处理状态
- **连接保持说明** - 明确日志显示连接保持打开

```python
async def websocket_handler(self, websocket: WebSocketServerProtocol, path: str):
    """WebSocket连接处理器 - 保持持久连接"""
    self.websocket_clients.add(websocket)
    logger.info(f"新的WebSocket连接建立: {websocket.remote_address}")
    
    try:
        # 发送连接确认消息
        await websocket.send(json.dumps({
            'type': 'connection_established',
            'success': True,
            'message': '连接已建立，等待命令...'
        }))
        
        # 持续监听消息，保持连接
        async for message in websocket:
            try:
                data = json.loads(message)
                logger.info(f"收到消息类型: {data.get('type')}")
                await self.handle_websocket_message(websocket, data)
                # 消息处理完成后，连接继续保持打开状态
                logger.info(f"消息处理完成，连接保持打开: {data.get('type')}")
            except Exception as e:
                # 错误处理...
```

### 2. 优化服务器配置

增加超时时间以适应长时间命令执行：

```python
async def start_server(self, host: str = 'localhost', port: int = 3004):
    """启动WebSocket服务器 - 配置持久连接"""
    server = await websockets.serve(
        self.websocket_handler,
        host,
        port,
        ping_interval=20,      # 每20秒发送ping保持连接
        ping_timeout=60,       # 60秒超时（从10秒增加）
        close_timeout=10,      # 关闭超时
        max_size=10 * 1024 * 1024,  # 最大消息大小10MB
        compression=None       # 禁用压缩以提高性能
    )
```

### 3. 改进响应发送日志

添加成功发送的日志确认：

```python
if websocket.open:
    try:
        await websocket.send(json.dumps(response))
        logger.info(f"成功发送响应: {message_type}")
    except websockets.exceptions.ConnectionClosed:
        logger.warning(f"尝试发送响应时连接已关闭: {message_type}")
        return
```

## 工作原理

### WebSocket持久连接流程

```
客户端连接 → 服务器接受连接 → 发送连接确认
                                    ↓
                            进入消息监听循环
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            收到消息 → 处理消息 → 发送响应 → 继续监听
                    ↑                               ↓
                    └───────────────────────────────┘
                            (循环持续)
                                    ↓
                        客户端主动关闭或超时
                                    ↓
                            清理连接资源
```

### 关键点

1. **`async for message in websocket:`** - 这个循环会一直运行，直到：
   - 客户端主动关闭连接
   - 发生网络错误
   - 超过ping_timeout时间没有收到pong响应

2. **消息处理不会关闭连接** - 每次处理完消息后，循环会继续等待下一条消息

3. **Ping/Pong机制** - 服务器每20秒发送ping，如果60秒内没有收到pong，才会关闭连接

## 测试验证

### 1. 启动服务器

```bash
cd drone-analyzer-nextjs/python
python tello_intelligent_agent.py
```

### 2. 观察日志

正常情况下应该看到：

```
新的WebSocket连接建立: ('127.0.0.1', 49152)
收到消息类型: natural_language_command
成功发送响应: natural_language_command
消息处理完成，连接保持打开: natural_language_command
```

### 3. 发送多条命令

连接应该保持打开，可以连续发送多条命令：

```javascript
// 第一条命令
ws.send(JSON.stringify({
  type: 'natural_language_command',
  data: { command: '起飞' }
}));

// 等待响应后，发送第二条命令
ws.send(JSON.stringify({
  type: 'natural_language_command',
  data: { command: '向前飞30厘米' }
}));

// 连接保持打开，可以继续发送更多命令
```

## 客户端注意事项

### 正确的客户端实现

```javascript
const ws = new WebSocket('ws://localhost:3004');

ws.onopen = () => {
  console.log('WebSocket连接已建立');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'connection_established') {
    console.log('服务器确认连接');
  } else if (data.type === 'natural_language_command_response') {
    console.log('收到命令响应:', data);
    // 处理响应，但不要关闭连接
  }
};

ws.onerror = (error) => {
  console.error('WebSocket错误:', error);
};

ws.onclose = () => {
  console.log('WebSocket连接已关闭');
};

// 发送命令
function sendCommand(command) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'natural_language_command',
      data: { command }
    }));
  }
}
```

### 常见错误

❌ **错误做法** - 每次命令都创建新连接：

```javascript
// 不要这样做！
function sendCommand(command) {
  const ws = new WebSocket('ws://localhost:3004');
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'natural_language_command', data: { command } }));
    ws.close(); // 立即关闭
  };
}
```

✅ **正确做法** - 复用同一个连接：

```javascript
// 创建一次连接
const ws = new WebSocket('ws://localhost:3004');

// 多次发送命令
sendCommand('起飞');
setTimeout(() => sendCommand('向前飞'), 3000);
setTimeout(() => sendCommand('降落'), 6000);
```

## 性能优化

### 配置说明

| 参数 | 值 | 说明 |
|------|-----|------|
| `ping_interval` | 20秒 | 保持连接活跃的心跳间隔 |
| `ping_timeout` | 60秒 | 等待pong响应的超时时间（适应长时间AI分析） |
| `close_timeout` | 10秒 | 关闭握手的超时时间 |
| `max_size` | 10MB | 最大消息大小（支持大型AI响应） |
| `compression` | None | 禁用压缩以提高实时性 |

### 为什么增加ping_timeout？

AI命令分析和无人机命令执行可能需要较长时间：

- AI分析：5-15秒（取决于模型和复杂度）
- 命令执行：每条命令2-5秒
- 多条命令串行执行：可能超过30秒

原来的10秒超时太短，会导致长时间操作时连接被误判为超时。

## 故障排查

### 问题：连接仍然关闭

1. **检查客户端代码** - 确保客户端没有主动关闭连接
2. **检查网络** - 防火墙或代理可能中断长连接
3. **查看完整日志** - 确认是哪一方关闭的连接

### 问题：响应延迟

1. **检查AI服务** - Ollama/OpenAI响应时间
2. **检查无人机连接** - 无人机命令执行时间
3. **增加超时时间** - 如果需要更长时间，可以进一步增加`ping_timeout`

## 总结

修复后的WebSocket服务器：

✅ 保持持久连接，不会在处理命令后关闭  
✅ 支持连续发送多条命令  
✅ 适应长时间AI分析和命令执行  
✅ 提供详细的连接状态日志  
✅ 自动心跳保持连接活跃  

客户端只需建立一次连接，就可以持续发送命令，直到主动关闭或发生错误。
