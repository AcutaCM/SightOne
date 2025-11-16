# 桥接客户端快速参考

## 快速开始

### 安装依赖

```bash
pip install aiohttp
```

### 基本使用

```python
from bridge_client import BridgeClient, BridgeConfig

# 创建并连接
async with BridgeClient() as bridge:
    # 获取状态
    status = await bridge.get_drone_status()
    
    # 执行命令
    result = await bridge.execute_command({
        "action": "takeoff",
        "parameters": {}
    })
```

## 常用操作

### 连接管理

```python
# 连接
await bridge.connect()

# 断开
await bridge.disconnect()

# 重连
await bridge.reconnect()

# 健康检查
is_healthy = await bridge.health_check()
```

### 命令执行

```python
# 起飞
await bridge.execute_command({"action": "takeoff"})

# 降落
await bridge.execute_command({"action": "land"})

# 移动
await bridge.execute_command({
    "action": "move_forward",
    "parameters": {"distance": 50}
})

# 获取电池
await bridge.execute_command({"action": "get_battery"})
```

### 状态查询

```python
# 获取完整状态
status = await bridge.get_drone_status()

# 访问状态字段
battery = status.get("battery", 0)
connected = status.get("connected", False)
flying = status.get("flying", False)
```

### 状态订阅

```python
# 定义回调
async def on_status(data):
    print(f"电池: {data.get('battery')}%")

# 订阅
await bridge.subscribe_status_updates(on_status)
```

## 配置选项

```python
config = BridgeConfig(
    # 后端地址
    drone_backend_host="localhost",
    drone_backend_port=3002,
    
    # 重连配置
    max_reconnect_attempts=5,
    reconnect_delay=2.0,
    reconnect_backoff=1.5,
    max_reconnect_delay=30.0,
    
    # 超时配置
    connection_timeout=10.0,
    request_timeout=30.0,
    health_check_interval=30.0,
    
    # WebSocket配置
    ws_heartbeat_interval=30.0
)
```

## 错误处理

```python
# 检查连接结果
if not await bridge.connect():
    print("连接失败")

# 检查命令结果
result = await bridge.execute_command({...})
if not result.get("success"):
    print(f"错误: {result.get('error')}")

# 异常处理
try:
    await bridge.execute_command({...})
except Exception as e:
    print(f"异常: {e}")
```

## 连接状态

```python
from bridge_client import ConnectionState

# 检查状态
if bridge.state == ConnectionState.CONNECTED:
    print("已连接")
elif bridge.state == ConnectionState.RECONNECTING:
    print("重连中")
elif bridge.state == ConnectionState.ERROR:
    print("错误状态")
```

## 连接信息

```python
info = bridge.get_connection_info()

# 可用字段
info["state"]                    # 连接状态
info["connected"]                # 是否已连接
info["base_url"]                 # HTTP URL
info["ws_url"]                   # WebSocket URL
info["connection_attempts"]      # 连接尝试次数
info["last_connection_time"]     # 最后连接时间
info["last_health_check_time"]   # 最后健康检查时间
info["session_active"]           # HTTP会话是否活跃
info["websocket_active"]         # WebSocket是否活跃
```

## 日志配置

```python
import logging

# 基本配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 调试模式
logging.basicConfig(level=logging.DEBUG)
```

## 完整示例

```python
import asyncio
import logging
from bridge_client import BridgeClient, BridgeConfig

async def main():
    # 配置日志
    logging.basicConfig(level=logging.INFO)
    
    # 创建配置
    config = BridgeConfig(
        drone_backend_host="localhost",
        drone_backend_port=3002,
        max_reconnect_attempts=3
    )
    
    # 使用桥接客户端
    async with BridgeClient(config) as bridge:
        # 获取状态
        status = await bridge.get_drone_status()
        print(f"无人机状态: {status}")
        
        # 执行命令
        if status.get("connected"):
            result = await bridge.execute_command({
                "action": "get_battery",
                "parameters": {}
            })
            print(f"电池电量: {result}")
        
        # 订阅状态更新
        async def on_status_update(data):
            print(f"状态更新: 电池={data.get('battery')}%")
        
        await bridge.subscribe_status_updates(on_status_update)
        
        # 保持运行
        await asyncio.sleep(30)

if __name__ == "__main__":
    asyncio.run(main())
```

## 常见问题

### Q: 如何处理连接失败？

```python
if not await bridge.connect():
    # 尝试重连
    if not await bridge.reconnect():
        print("无法连接到后端")
        return
```

### Q: 如何设置超时时间？

```python
config = BridgeConfig(
    connection_timeout=20.0,  # 连接超时20秒
    request_timeout=60.0      # 请求超时60秒
)
```

### Q: 如何调试连接问题？

```python
# 启用调试日志
logging.basicConfig(level=logging.DEBUG)

# 检查连接信息
info = bridge.get_connection_info()
print(f"状态: {info['state']}")
print(f"URL: {info['base_url']}")
print(f"会话活跃: {info['session_active']}")
```

### Q: 如何处理WebSocket断开？

```python
# 桥接客户端会自动重连
# 可以通过配置调整重连策略
config = BridgeConfig(
    max_reconnect_attempts=10,
    reconnect_delay=1.0
)
```

## API端点

### HTTP端点

- `GET /api/drone/status` - 获取无人机状态
- `POST /api/drone/execute` - 执行命令

### WebSocket端点

- `WS /ws` - 状态订阅

## 支持的命令

### 基础命令

- `takeoff` - 起飞
- `land` - 降落
- `emergency` - 紧急停止

### 移动命令

- `move_up` - 上升
- `move_down` - 下降
- `move_left` - 左移
- `move_right` - 右移
- `move_forward` - 前进
- `move_back` - 后退

### 旋转命令

- `rotate_clockwise` - 顺时针旋转
- `rotate_counter_clockwise` - 逆时针旋转

### 状态查询

- `get_battery` - 获取电池电量
- `get_temperature` - 获取温度
- `get_height` - 获取高度

## 性能提示

1. **使用上下文管理器**: 自动管理连接生命周期
2. **复用客户端实例**: 避免频繁创建和销毁
3. **合理设置超时**: 根据网络环境调整
4. **启用健康检查**: 及时发现连接问题
5. **使用异步操作**: 提高并发性能

## 相关文档

- [完整实现文档](./BRIDGE_CLIENT_IMPLEMENTATION.md)
- [设计文档](./.kiro/specs/tello-agent-bridge/design.md)
- [需求文档](./.kiro/specs/tello-agent-bridge/requirements.md)
