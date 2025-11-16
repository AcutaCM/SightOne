# WebSocket客户端主动关闭问题分析

## 问题现象

服务器日志显示：

```
2025-11-12 13:32:35,737 - __main__ - INFO - AI设置更新成功 -> provider: ollama, model: llama3.1:8b
2025-11-12 13:32:35,737 - __main__ - INFO - 成功发送响应: update_ai_settings
2025-11-12 13:32:35,738 - __main__ - INFO - 消息处理完成，连接保持打开: update_ai_settings
2025-11-12 13:32:35,894 - __main__ - INFO - WebSocket客户端已移除: ('127.0.0.1', 63822)
2025-11-12 13:32:35,894 - websockets.server - INFO - connection closed
```

## 根本原因

**服务器端代码是正确的** - 连接在处理完消息后保持打开状态。

**问题在客户端** - 客户端在收到响应后主动关闭了连接。

## 架构分析

### 当前架构

```
前端 (浏览器)
    ↓ WebSocket (ws://localhost:3002)
3002后端 (drone_backend.py)
    ↓ ??? (需要确认)
3004智能代理 (tello_intelligent_agent.py)
```

### 问题点

1. **前端连接到3002** - `useDroneControl.ts`中：
   ```typescript
   const ws = new WebSocket('ws://localhost:3002');
   ```

2. **3002如何与3004通信？** - 需要确认3002后端是否：
   - 为每个前端请求创建新的3004连接（错误）
   - 维护一个持久的3004连接池（正确）
   - 根本不连接3004（需要添加）

## 解决方案

### 方案1：前端直接连接3004（推荐）

如果前端需要使用智能代理功能，应该直接连接到3004：

```typescript
// 创建两个WebSocket连接
const droneWs = new WebSocket('ws://localhost:3002'); // 无人机控制
const agentWs = new WebSocket('ws://localhost:3004'); // 智能代理

// 或者根据功能选择连接
const ws = useIntelligentAgent 
  ? new WebSocket('ws://localhost:3004')
  : new WebSocket('ws://localhost:3002');
```

### 方案2：3002作为代理（当前架构）

如果3002需要作为代理转发到3004，需要确保：

1. **3002维护持久连接到3004**：

```python
class DroneBackend:
    def __init__(self):
        self.agent_ws = None  # 到3004的持久连接
        self.agent_connected = False
    
    async def connect_to_agent(self):
        """连接到智能代理服务"""
        if self.agent_connected:
            return
        
        try:
            self.agent_ws = await websockets.connect('ws://localhost:3004')
            self.agent_connected = True
            # 启动消息监听
            asyncio.create_task(self.listen_to_agent())
        except Exception as e:
            logger.error(f"连接智能代理失败: {e}")
    
    async def listen_to_agent(self):
        """持续监听智能代理的消息"""
        try:
            async for message in self.agent_ws:
                data = json.loads(message)
                # 转发给所有前端客户端
                await self.broadcast_to_clients(data)
        except Exception as e:
            logger.error(f"智能代理连接断开: {e}")
            self.agent_connected = False
    
    async def forward_to_agent(self, message):
        """转发消息到智能代理"""
        if not self.agent_connected:
            await self.connect_to_agent()
        
        if self.agent_ws:
            await self.agent_ws.send(json.dumps(message))
```

2. **前端保持连接打开**：

```typescript
// 确保不要在收到响应后关闭连接
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // 处理响应
  handleResponse(data);
  
  // ❌ 不要这样做：
  // ws.close();
  
  // ✅ 连接保持打开，可以继续发送消息
};
```

## 诊断步骤

### 1. 确认客户端代码

检查前端代码中是否有主动关闭连接的逻辑：

```bash
# 搜索可能关闭连接的代码
grep -r "ws.close()" drone-analyzer-nextjs/
grep -r "websocket.close()" drone-analyzer-nextjs/
```

### 2. 检查3002后端

查看`drone_backend.py`中是否有与3004通信的代码：

```bash
# 搜索智能代理相关代码
grep -r "3004" drone-analyzer-nextjs/python/
grep -r "intelligent_agent" drone-analyzer-nextjs/python/
grep -r "tello_agent" drone-analyzer-nextjs/python/
```

### 3. 网络抓包

使用浏览器开发者工具查看WebSocket连接：

1. 打开浏览器开发者工具（F12）
2. 切换到"网络"标签
3. 筛选"WS"（WebSocket）
4. 观察连接的打开和关闭时机

## 测试方案

### 测试1：直接连接3004

在浏览器控制台测试：

```javascript
// 创建到3004的直接连接
const agentWs = new WebSocket('ws://localhost:3004');

agentWs.onopen = () => {
  console.log('✅ 连接到智能代理');
};

agentWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 收到消息:', data);
  // 不关闭连接
};

// 发送AI配置
agentWs.send(JSON.stringify({
  type: 'update_ai_settings',
  data: {
    provider: 'ollama',
    model: 'llama3.1:8b',
    base_url: 'http://localhost:11434/v1'
  }
}));

// 等待几秒后发送另一条消息
setTimeout(() => {
  agentWs.send(JSON.stringify({
    type: 'get_ai_settings',
    data: {}
  }));
}, 3000);

// 检查连接状态
setTimeout(() => {
  console.log('连接状态:', agentWs.readyState);
  // 1 = OPEN (期望值)
}, 5000);
```

### 测试2：检查3002转发

如果使用3002作为代理：

```javascript
// 连接到3002
const droneWs = new WebSocket('ws://localhost:3002');

droneWs.onopen = () => {
  console.log('✅ 连接到后端');
  
  // 发送AI配置（如果3002支持转发）
  droneWs.send(JSON.stringify({
    type: 'update_ai_settings',
    data: {
      provider: 'ollama',
      model: 'llama3.1:8b'
    }
  }));
};

droneWs.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 收到消息:', data);
};

// 检查连接是否保持打开
setTimeout(() => {
  console.log('连接状态:', droneWs.readyState);
}, 5000);
```

## 推荐方案

### 短期方案：修复客户端代码

1. 检查并移除任何主动关闭连接的代码
2. 确保WebSocket连接在组件生命周期内保持打开
3. 只在组件卸载时关闭连接

```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3004');
  
  ws.onopen = () => {
    console.log('连接已建立');
  };
  
  ws.onmessage = (event) => {
    // 处理消息，但不关闭连接
    handleMessage(JSON.parse(event.data));
  };
  
  // 清理函数：只在组件卸载时关闭
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}, []); // 空依赖数组，只在挂载时创建连接
```

### 长期方案：统一WebSocket管理

创建一个WebSocket管理器：

```typescript
class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  
  connect(url: string, handlers: {
    onOpen?: () => void;
    onMessage?: (data: any) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
  }): WebSocket {
    // 如果已存在连接，复用
    if (this.connections.has(url)) {
      const existing = this.connections.get(url)!;
      if (existing.readyState === WebSocket.OPEN) {
        return existing;
      }
    }
    
    // 创建新连接
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log(`✅ 连接已建立: ${url}`);
      handlers.onOpen?.();
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handlers.onMessage?.(data);
    };
    
    ws.onerror = (error) => {
      console.error(`❌ 连接错误: ${url}`, error);
      handlers.onError?.(error);
    };
    
    ws.onclose = () => {
      console.log(`🔌 连接关闭: ${url}`);
      this.connections.delete(url);
      handlers.onClose?.();
    };
    
    this.connections.set(url, ws);
    return ws;
  }
  
  send(url: string, message: any): boolean {
    const ws = this.connections.get(url);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
  
  disconnect(url: string) {
    const ws = this.connections.get(url);
    if (ws) {
      ws.close();
      this.connections.delete(url);
    }
  }
  
  disconnectAll() {
    this.connections.forEach(ws => ws.close());
    this.connections.clear();
  }
}

// 全局实例
export const wsManager = new WebSocketManager();
```

使用方式：

```typescript
// 连接到智能代理
wsManager.connect('ws://localhost:3004', {
  onOpen: () => console.log('智能代理已连接'),
  onMessage: (data) => handleAgentMessage(data)
});

// 发送消息
wsManager.send('ws://localhost:3004', {
  type: 'update_ai_settings',
  data: { provider: 'ollama', model: 'llama3.1:8b' }
});

// 连接会一直保持打开，直到显式断开
// wsManager.disconnect('ws://localhost:3004');
```

## 总结

问题的根源是**客户端在收到响应后主动关闭了连接**，而不是服务器端的问题。

解决方案：
1. ✅ 服务器端已经正确实现持久连接
2. ❌ 需要修复客户端代码，确保连接保持打开
3. 🔍 需要确认3002后端的架构和转发逻辑

下一步：
1. 检查前端代码中的WebSocket连接管理
2. 确认是否需要3002作为代理
3. 实现统一的WebSocket管理器
