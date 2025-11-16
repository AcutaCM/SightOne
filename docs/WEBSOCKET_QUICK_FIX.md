# WebSocket连接快速修复指南

## 问题

WebSocket连接在处理消息后立即关闭，导致无法连续发送命令。

## 快速诊断

### 1. 检查连接状态

在浏览器控制台运行：

```javascript
// 查找所有WebSocket连接
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('ws://'))
  .forEach(r => console.log(r.name, r.duration));
```

### 2. 监控连接生命周期

```javascript
// 包装WebSocket以监控所有事件
const originalWebSocket = window.WebSocket;
window.WebSocket = function(url, protocols) {
  console.log('🔌 创建WebSocket连接:', url);
  const ws = new originalWebSocket(url, protocols);
  
  const originalClose = ws.close.bind(ws);
  ws.close = function(...args) {
    console.log('❌ 主动关闭连接:', url, new Error().stack);
    return originalClose(...args);
  };
  
  ws.addEventListener('open', () => console.log('✅ 连接打开:', url));
  ws.addEventListener('close', (e) => console.log('🔌 连接关闭:', url, e.code, e.reason));
  ws.addEventListener('error', (e) => console.log('❌ 连接错误:', url, e));
  
  return ws;
};
```

## 快速修复

### 修复1：移除自动关闭逻辑

如果你的代码中有类似这样的逻辑：

```typescript
// ❌ 错误做法
ws.onmessage = (event) => {
  handleMessage(event.data);
  ws.close(); // 不要这样做！
};

// ❌ 错误做法
async function sendCommand(command) {
  const ws = new WebSocket('ws://localhost:3004');
  await new Promise(resolve => {
    ws.onopen = () => {
      ws.send(command);
      ws.close(); // 不要这样做！
      resolve();
    };
  });
}
```

修改为：

```typescript
// ✅ 正确做法
ws.onmessage = (event) => {
  handleMessage(event.data);
  // 连接保持打开
};

// ✅ 正确做法 - 复用连接
let ws = null;

async function sendCommand(command) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    ws = new WebSocket('ws://localhost:3004');
    await new Promise(resolve => {
      ws.onopen = resolve;
    });
  }
  
  ws.send(command);
  // 连接保持打开，可以继续发送命令
}
```

### 修复2：使用React Hook正确管理连接

```typescript
import { useEffect, useRef, useState } from 'react';

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // 创建连接
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ WebSocket连接已建立');
      setIsConnected(true);
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket连接已关闭');
      setIsConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket错误:', error);
    };
    
    // 清理函数：只在组件卸载时关闭
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url]); // 只在URL变化时重新连接
  
  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };
  
  return { ws: wsRef.current, isConnected, sendMessage };
}

// 使用
function MyComponent() {
  const { isConnected, sendMessage } = useWebSocket('ws://localhost:3004');
  
  const handleSendCommand = () => {
    sendMessage({
      type: 'natural_language_command',
      data: { command: '起飞' }
    });
    
    // 连接保持打开，可以继续发送
    setTimeout(() => {
      sendMessage({
        type: 'natural_language_command',
        data: { command: '降落' }
      });
    }, 5000);
  };
  
  return (
    <div>
      <p>连接状态: {isConnected ? '已连接' : '未连接'}</p>
      <button onClick={handleSendCommand}>发送命令</button>
    </div>
  );
}
```

### 修复3：检查第三方库

如果使用了WebSocket库（如`socket.io-client`），检查配置：

```typescript
// ❌ 错误配置
const socket = io('http://localhost:3004', {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: false, // 不要禁用重连
  forceNew: true // 不要每次都创建新连接
});

// ✅ 正确配置
const socket = io('http://localhost:3004', {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true, // 启用自动重连
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

## 验证修复

### 测试脚本

创建`test_persistent_connection.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket持久连接测试</title>
</head>
<body>
  <h1>WebSocket持久连接测试</h1>
  <div id="status">未连接</div>
  <button onclick="connect()">连接</button>
  <button onclick="sendCommand('起飞')">起飞</button>
  <button onclick="sendCommand('降落')">降落</button>
  <button onclick="disconnect()">断开</button>
  <div id="log"></div>
  
  <script>
    let ws = null;
    
    function log(message) {
      const logDiv = document.getElementById('log');
      const time = new Date().toLocaleTimeString();
      logDiv.innerHTML = `[${time}] ${message}<br>` + logDiv.innerHTML;
    }
    
    function updateStatus(status) {
      document.getElementById('status').textContent = status;
    }
    
    function connect() {
      if (ws && ws.readyState === WebSocket.OPEN) {
        log('⚠️ 已经连接');
        return;
      }
      
      ws = new WebSocket('ws://localhost:3004');
      
      ws.onopen = () => {
        log('✅ 连接已建立');
        updateStatus('已连接');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        log(`📨 收到消息: ${data.type}`);
        console.log('完整消息:', data);
      };
      
      ws.onclose = (event) => {
        log(`🔌 连接已关闭 (代码: ${event.code})`);
        updateStatus('未连接');
      };
      
      ws.onerror = (error) => {
        log('❌ 连接错误');
        console.error(error);
      };
    }
    
    function sendCommand(command) {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        log('❌ 未连接，无法发送命令');
        return;
      }
      
      log(`📤 发送命令: ${command}`);
      ws.send(JSON.stringify({
        type: 'natural_language_command',
        data: { command }
      }));
      
      // 检查连接状态
      setTimeout(() => {
        const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
        log(`🔍 连接状态: ${states[ws.readyState]}`);
      }, 1000);
    }
    
    function disconnect() {
      if (ws) {
        ws.close();
        ws = null;
        log('👋 主动断开连接');
      }
    }
    
    // 自动连接
    connect();
  </script>
</body>
</html>
```

使用方法：

1. 保存为HTML文件
2. 在浏览器中打开
3. 点击"起飞"按钮
4. 等待响应
5. 再次点击"降落"按钮
6. 检查连接是否保持打开

### 预期结果

```
[13:32:35] ✅ 连接已建立
[13:32:35] 📨 收到消息: connection_established
[13:32:40] 📤 发送命令: 起飞
[13:32:45] 📨 收到消息: natural_language_command_response
[13:32:46] 🔍 连接状态: OPEN ✅
[13:32:50] 📤 发送命令: 降落
[13:32:55] 📨 收到消息: natural_language_command_response
[13:32:56] 🔍 连接状态: OPEN ✅
```

### 错误结果

```
[13:32:35] ✅ 连接已建立
[13:32:40] 📤 发送命令: 起飞
[13:32:45] 📨 收到消息: natural_language_command_response
[13:32:45] 🔌 连接已关闭 (代码: 1000) ❌
[13:32:46] 🔍 连接状态: CLOSED ❌
[13:32:50] ❌ 未连接，无法发送命令
```

## 常见错误模式

### 错误1：每次请求创建新连接

```typescript
// ❌ 错误
async function sendAIConfig(config) {
  const ws = new WebSocket('ws://localhost:3004');
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'update_ai_settings', data: config }));
    ws.close(); // 立即关闭
  };
}
```

### 错误2：在Promise中关闭连接

```typescript
// ❌ 错误
function sendMessage(message) {
  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:3004');
    ws.onopen = () => {
      ws.send(message);
    };
    ws.onmessage = (event) => {
      resolve(event.data);
      ws.close(); // 收到响应后关闭
    };
  });
}
```

### 错误3：依赖数组导致重连

```typescript
// ❌ 错误
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3004');
  // ...
  return () => ws.close();
}, [someState]); // 每次someState变化都会重新连接
```

## 正确模式

### 模式1：单例连接

```typescript
// 全局单例
let globalWs: WebSocket | null = null;

export function getWebSocket(): Promise<WebSocket> {
  if (globalWs && globalWs.readyState === WebSocket.OPEN) {
    return Promise.resolve(globalWs);
  }
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:3004');
    ws.onopen = () => {
      globalWs = ws;
      resolve(ws);
    };
    ws.onerror = reject;
  });
}

// 使用
const ws = await getWebSocket();
ws.send(JSON.stringify(message));
```

### 模式2：连接池

```typescript
class WebSocketPool {
  private connections = new Map<string, WebSocket>();
  
  async getConnection(url: string): Promise<WebSocket> {
    if (this.connections.has(url)) {
      const ws = this.connections.get(url)!;
      if (ws.readyState === WebSocket.OPEN) {
        return ws;
      }
    }
    
    const ws = await this.createConnection(url);
    this.connections.set(url, ws);
    return ws;
  }
  
  private createConnection(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.onopen = () => resolve(ws);
      ws.onerror = reject;
      ws.onclose = () => this.connections.delete(url);
    });
  }
}

const pool = new WebSocketPool();
const ws = await pool.getConnection('ws://localhost:3004');
```

## 总结

✅ **DO**:
- 创建一次连接，复用多次
- 只在组件卸载时关闭连接
- 使用连接池管理多个连接
- 监控连接状态

❌ **DON'T**:
- 每次请求都创建新连接
- 收到响应后立即关闭
- 在依赖数组中包含频繁变化的状态
- 忽略连接状态检查

🔍 **调试技巧**:
- 使用浏览器开发者工具监控WebSocket
- 添加详细的日志记录
- 使用测试页面验证行为
- 检查服务器日志确认连接状态
