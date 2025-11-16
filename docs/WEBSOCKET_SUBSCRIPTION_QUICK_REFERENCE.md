# WebSocket状态订阅 - 快速参考

## 快速开始

### 1. 基本使用

```python
from bridge_client import BridgeClient, BridgeConfig

# 创建客户端
config = BridgeConfig(
    drone_backend_host="localhost",
    drone_backend_port=3002
)
bridge = BridgeClient(config)

# 连接
await bridge.connect()

# 订阅状态
async def callback(status):
    print(f"电池: {status.get('battery')}%")

await bridge.subscribe_status_updates(callback)
```

### 2. 运行测试

```bash
# 启动无人机控制后端
python drone_backend.py

# 运行测试
python test_websocket_subscription.py
```

## 核心API

### BridgeClient.subscribe_status_updates()

订阅WebSocket状态更新

```python
await bridge.subscribe_status_updates(callback: Callable)
```

**参数**:
- `callback`: 状态更新回调函数，接收状态字典

**示例**:
```python
async def my_callback(status_data):
    print(f"收到状态: {status_data}")

await bridge.subscribe_status_updates(my_callback)
```

### BridgeClient._validate_status_message()

验证状态消息格式

```python
is_valid = bridge._validate_status_message(data: Dict)
```

**返回**: `bool` - 消息是否有效

## 消息格式

### 状态更新

```json
{
  "type": "status_update",
  "data": {
    "connected": true,
    "battery": 85,
    "temperature": 25,
    "height": 0
  }
}
```

### 心跳

```json
{
  "type": "ping",
  "timestamp": 1699999999.999
}
```

## 配置参数

```python
BridgeConfig(
    ws_heartbeat_interval=30.0,    # 心跳间隔
    max_reconnect_attempts=5,      # 最大重连次数
    reconnect_delay=2.0,           # 重连延迟
    reconnect_backoff=1.5,         # 退避因子
    max_reconnect_delay=30.0       # 最大延迟
)
```

## 常见问题

### Q: 如何检查WebSocket连接状态？

```python
conn_info = bridge.get_connection_info()
is_ws_active = conn_info['websocket_active']
```

### Q: 如何处理连接断开？

自动重连已内置，无需手动处理。可通过配置调整重连策略。

### Q: 如何停止订阅？

```python
await bridge.disconnect()
```

## 调试技巧

### 启用详细日志

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 查看连接信息

```python
info = bridge.get_connection_info()
print(f"WebSocket状态: {info['websocket_active']}")
print(f"连接状态: {info['state']}")
```

### 监控消息接收

```python
async def debug_callback(status):
    print(f"[{datetime.now()}] 收到消息: {status}")
    
await bridge.subscribe_status_updates(debug_callback)
```

## 性能提示

1. **使用异步回调**: 避免阻塞消息接收
2. **批量处理**: 在回调中批量处理多个更新
3. **过滤消息**: 只处理需要的状态字段
4. **调整心跳**: 根据网络情况调整心跳间隔

## 错误代码

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 连接超时 | 无人机控制后端未运行 | 启动3002端口服务 |
| JSON解析失败 | 消息格式错误 | 检查消息格式 |
| 验证失败 | 缺少必需字段 | 更新消息定义 |
| 重连失败 | 网络问题 | 检查网络连接 |

## 相关命令

```bash
# 测试WebSocket订阅
python test_websocket_subscription.py

# 查看日志
tail -f tello_agent.log

# 检查端口
netstat -an | grep 3002
```

## 下一步

- 阅读 [完整文档](./WEBSOCKET_STATUS_SUBSCRIPTION.md)
- 查看 [桥接客户端实现](./BRIDGE_CLIENT_IMPLEMENTATION.md)
- 了解 [状态同步机制](./STATUS_SYNC_IMPLEMENTATION.md)
