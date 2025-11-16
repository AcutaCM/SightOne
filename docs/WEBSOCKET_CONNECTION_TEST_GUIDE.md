# WebSocket持久连接测试指南

## 快速测试

### 1. 启动服务器

```bash
cd drone-analyzer-nextjs/python
python tello_intelligent_agent.py
```

预期输出：
```
启动Tello智能代理服务器: localhost:3004
Tello智能代理服务器启动成功 - 持久连接模式
配置: ping_interval=20s, ping_timeout=60s
```

### 2. 使用浏览器控制台测试

打开浏览器控制台（F12），运行以下代码：

```javascript
// 创建WebSocket连接
const ws = new WebSocket('ws://localhost:3004');

// 监听连接打开
ws.onopen = () => {
  console.log('✅ WebSocket连接已建立');
};

// 监听消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 收到消息:', data);
};

// 监听错误
ws.onerror = (error) => {
  console.error('❌ WebSocket错误:', error);
};

// 监听关闭
ws.onclose = (event) => {
  console.log('🔌 WebSocket连接已关闭', event.code, event.reason);
};

// 发送测试命令的函数
function sendCommand(command) {
  if (ws.readyState === WebSocket.OPEN) {
    console.log('📤 发送命令:', command);
    ws.send(JSON.stringify({
      type: 'natural_language_command',
      data: { command }
    }));
  } else {
    console.error('❌ WebSocket未连接');
  }
}
```

### 3. 测试连续命令

```javascript
// 测试1：发送第一条命令
sendCommand('起飞');

// 等待3秒后发送第二条命令
setTimeout(() => {
  sendCommand('向前飞30厘米');
}, 3000);

// 等待6秒后发送第三条命令
setTimeout(() => {
  sendCommand('降落');
}, 6000);
```

### 4. 验证连接保持打开

在发送命令后，检查：

```javascript
// 检查连接状态
console.log('连接状态:', ws.readyState);
// 0 = CONNECTING
// 1 = OPEN (期望值)
// 2 = CLOSING
// 3 = CLOSED
```

## 预期行为

### 服务器日志

```
新的WebSocket连接建立: ('127.0.0.1', 49152)
收到消息类型: natural_language_command
处理自然语言命令: 起飞
AI分析结果: {...}
成功发送响应: natural_language_command
消息处理完成，连接保持打开: natural_language_command

收到消息类型: natural_language_command
处理自然语言命令: 向前飞30厘米
AI分析结果: {...}
成功发送响应: natural_language_command
消息处理完成，连接保持打开: natural_language_command

收到消息类型: natural_language_command
处理自然语言命令: 降落
AI分析结果: {...}
成功发送响应: natural_language_command
消息处理完成，连接保持打开: natural_language_command
```

### 客户端控制台

```
✅ WebSocket连接已建立
📨 收到消息: {type: 'connection_established', success: true, message: '连接已建立，等待命令...'}
📤 发送命令: 起飞
📨 收到消息: {type: 'natural_language_command_response', success: true, ...}
📤 发送命令: 向前飞30厘米
📨 收到消息: {type: 'natural_language_command_response', success: true, ...}
📤 发送命令: 降落
📨 收到消息: {type: 'natural_language_command_response', success: true, ...}
```

## 高级测试

### 测试长时间连接

```javascript
// 每5秒发送一条命令，持续1分钟
let commandCount = 0;
const testInterval = setInterval(() => {
  commandCount++;
  sendCommand(`测试命令 ${commandCount}`);
  
  if (commandCount >= 12) {
    clearInterval(testInterval);
    console.log('✅ 长时间连接测试完成');
  }
}, 5000);
```

### 测试并发命令

```javascript
// 快速连续发送多条命令
['起飞', '向前飞', '向左飞', '旋转90度', '降落'].forEach((cmd, index) => {
  setTimeout(() => sendCommand(cmd), index * 1000);
});
```

### 测试AI配置更新

```javascript
// 更新AI设置
ws.send(JSON.stringify({
  type: 'update_ai_settings',
  data: {
    provider: 'ollama',
    base_url: 'http://localhost:11434/v1',
    model: 'llama3.1:8b'
  }
}));

// 获取当前AI设置
ws.send(JSON.stringify({
  type: 'get_ai_settings',
  data: {}
}));
```

## 故障排查

### 问题1：连接立即关闭

**症状：**
```
🔌 WebSocket连接已关闭 1006
```

**可能原因：**
- 服务器未启动
- 端口被占用
- 防火墙阻止连接

**解决方法：**
```bash
# 检查服务器是否运行
netstat -an | findstr 3004

# 检查Python进程
tasklist | findstr python

# 重启服务器
python tello_intelligent_agent.py
```

### 问题2：发送命令后无响应

**症状：**
```
📤 发送命令: 起飞
(没有收到响应)
```

**可能原因：**
- AI服务未配置
- 命令格式错误
- 服务器处理异常

**解决方法：**
```javascript
// 检查连接状态
console.log('WebSocket状态:', ws.readyState);

// 查看服务器日志
// 检查是否有错误信息
```

### 问题3：连接在命令执行中断开

**症状：**
```
📤 发送命令: 起飞
🔌 WebSocket连接已关闭 1000
```

**可能原因：**
- 命令执行时间过长
- 服务器主动关闭
- 网络中断

**解决方法：**
- 检查服务器日志中的错误信息
- 确认AI服务响应时间
- 验证网络稳定性

## Python测试脚本

创建 `test_websocket.py`：

```python
import asyncio
import websockets
import json

async def test_persistent_connection():
    uri = "ws://localhost:3004"
    
    async with websockets.connect(uri) as websocket:
        print("✅ 连接已建立")
        
        # 接收连接确认
        response = await websocket.recv()
        print(f"📨 {response}")
        
        # 发送多条命令
        commands = ['起飞', '向前飞30厘米', '旋转90度', '降落']
        
        for cmd in commands:
            print(f"\n📤 发送命令: {cmd}")
            await websocket.send(json.dumps({
                'type': 'natural_language_command',
                'data': {'command': cmd}
            }))
            
            # 接收响应
            response = await websocket.recv()
            data = json.loads(response)
            print(f"📨 响应: {data.get('message', data)}")
            
            # 等待3秒
            await asyncio.sleep(3)
        
        print("\n✅ 所有命令发送完成，连接仍然打开")
        print(f"连接状态: {websocket.open}")

if __name__ == "__main__":
    asyncio.run(test_persistent_connection())
```

运行测试：

```bash
python test_websocket.py
```

## 性能监控

### 监控连接数

```javascript
// 在服务器端添加监控
setInterval(() => {
  console.log(`当前连接数: ${agent.websocket_clients.size}`);
}, 10000);
```

### 监控消息处理时间

```javascript
// 客户端计时
const startTime = Date.now();
sendCommand('起飞');

ws.onmessage = (event) => {
  const endTime = Date.now();
  console.log(`响应时间: ${endTime - startTime}ms`);
};
```

## 总结

✅ **连接应该保持打开** - 除非客户端主动关闭或发生错误  
✅ **可以连续发送命令** - 不需要每次都重新连接  
✅ **响应时间正常** - AI分析通常在5-15秒内完成  
✅ **日志清晰** - 可以看到每条消息的处理状态  

如果测试失败，请检查：
1. 服务器是否正常启动
2. AI服务配置是否正确
3. 网络连接是否稳定
4. 客户端代码是否正确
