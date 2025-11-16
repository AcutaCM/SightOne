# 桥接客户端实现文档

## 概述

桥接客户端（BridgeClient）是连接3004端口智能代理后端与3002端口无人机控制后端的核心组件。它提供了可靠的HTTP API通信、自动重连机制和健康检查功能。

## 文件位置

```
drone-analyzer-nextjs/python/bridge_client.py
```

## 核心功能

### 1. HTTP API通信

桥接客户端使用`aiohttp`库实现异步HTTP通信：

```python
# 执行命令
result = await bridge.execute_command({
    "action": "takeoff",
    "parameters": {}
})

# 获取无人机状态
status = await bridge.get_drone_status()
```

### 2. 连接重试机制

实现了指数退避算法的自动重连：

- **最大重试次数**: 5次（可配置）
- **初始延迟**: 2秒
- **退避因子**: 1.5
- **最大延迟**: 30秒

```python
# 配置重试参数
config = BridgeConfig(
    max_reconnect_attempts=5,
    reconnect_delay=2.0,
    reconnect_backoff=1.5,
    max_reconnect_delay=30.0
)
```

### 3. 健康检查

定期执行健康检查以确保连接稳定：

- **检查间隔**: 30秒（可配置）
- **检查方法**: 调用`/api/drone/status`端点
- **自动恢复**: 检查失败时自动触发重连

### 4. WebSocket状态订阅

支持通过WebSocket实时接收无人机状态更新：

```python
async def status_callback(status_data):
    print(f"状态更新: {status_data}")

await bridge.subscribe_status_updates(status_callback)
```

## 类和接口

### BridgeConfig

桥接配置数据类：

```python
@dataclass
class BridgeConfig:
    # 后端地址
    drone_backend_host: str = "localhost"
    drone_backend_port: int = 3002
    
    # 重连配置
    max_reconnect_attempts: int = 5
    reconnect_delay: float = 2.0
    reconnect_backoff: float = 1.5
    max_reconnect_delay: float = 30.0
    
    # 超时配置
    connection_timeout: float = 10.0
    request_timeout: float = 30.0
    health_check_interval: float = 30.0
    
    # WebSocket配置
    ws_heartbeat_interval: float = 30.0
```

### ConnectionState

连接状态枚举：

```python
class ConnectionState(Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    RECONNECTING = "reconnecting"
    ERROR = "error"
```

### BridgeClient

主要的桥接客户端类：

#### 初始化

```python
bridge = BridgeClient(config)
```

#### 连接管理

```python
# 连接
await bridge.connect()

# 断开连接
await bridge.disconnect()

# 重新连接
await bridge.reconnect()
```

#### 命令执行

```python
# 执行命令
result = await bridge.execute_command({
    "action": "takeoff",
    "parameters": {}
})

# 返回格式
{
    "success": True,
    "message": "起飞成功",
    "data": {...}
}
```

#### 状态查询

```python
# 获取无人机状态
status = await bridge.get_drone_status()

# 返回格式
{
    "success": True,
    "connected": True,
    "battery": 85,
    "flying": False,
    ...
}
```

#### 健康检查

```python
# 手动执行健康检查
is_healthy = await bridge.health_check()
```

#### 状态订阅

```python
# 订阅状态更新
async def on_status_update(status_data):
    print(f"电池: {status_data.get('battery')}%")

await bridge.subscribe_status_updates(on_status_update)
```

#### 连接信息

```python
# 获取连接信息
info = bridge.get_connection_info()

# 返回格式
{
    "state": "connected",
    "base_url": "http://localhost:3002",
    "ws_url": "ws://localhost:3002/ws",
    "connected": True,
    "connection_attempts": 0,
    "last_connection_time": 1699123456.789,
    "last_health_check_time": 1699123456.789,
    "session_active": True,
    "websocket_active": True
}
```

## 使用示例

### 基本使用

```python
import asyncio
from bridge_client import BridgeClient, BridgeConfig

async def main():
    # 创建配置
    config = BridgeConfig(
        drone_backend_host="localhost",
        drone_backend_port=3002
    )
    
    # 创建桥接客户端
    bridge = BridgeClient(config)
    
    try:
        # 连接
        if await bridge.connect():
            print("✅ 连接成功")
            
            # 获取状态
            status = await bridge.get_drone_status()
            print(f"无人机状态: {status}")
            
            # 执行命令
            result = await bridge.execute_command({
                "action": "get_battery",
                "parameters": {}
            })
            print(f"电池电量: {result}")
            
    finally:
        # 断开连接
        await bridge.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

### 使用上下文管理器

```python
async def main():
    config = BridgeConfig()
    
    # 使用async with自动管理连接
    async with BridgeClient(config) as bridge:
        # 执行操作
        status = await bridge.get_drone_status()
        print(status)
        
        # 连接会在退出时自动关闭
```

### 状态订阅示例

```python
async def main():
    config = BridgeConfig()
    
    async with BridgeClient(config) as bridge:
        # 定义状态回调
        async def on_status_update(status_data):
            battery = status_data.get('battery', 0)
            flying = status_data.get('flying', False)
            print(f"电池: {battery}%, 飞行中: {flying}")
        
        # 订阅状态更新
        await bridge.subscribe_status_updates(on_status_update)
        
        # 保持运行
        await asyncio.sleep(60)
```

### 错误处理示例

```python
async def main():
    config = BridgeConfig(
        max_reconnect_attempts=3,
        reconnect_delay=2.0
    )
    
    bridge = BridgeClient(config)
    
    try:
        # 尝试连接
        if not await bridge.connect():
            print("❌ 初始连接失败")
            
            # 尝试重连
            if await bridge.reconnect():
                print("✅ 重连成功")
            else:
                print("❌ 重连失败")
                return
        
        # 执行命令
        result = await bridge.execute_command({
            "action": "takeoff",
            "parameters": {}
        })
        
        if result.get("success"):
            print("✅ 命令执行成功")
        else:
            print(f"❌ 命令执行失败: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ 发生错误: {e}")
        
    finally:
        await bridge.disconnect()
```

## API端点

桥接客户端与以下3002端口的API端点通信：

### HTTP端点

1. **获取无人机状态**
   - 端点: `GET /api/drone/status`
   - 用途: 健康检查和状态查询

2. **执行命令**
   - 端点: `POST /api/drone/execute`
   - 请求体: `{"action": "...", "parameters": {...}}`
   - 用途: 执行无人机控制命令

### WebSocket端点

1. **状态订阅**
   - 端点: `WS /ws`
   - 用途: 实时接收无人机状态更新

## 错误处理

### 连接错误

```python
# 连接失败时返回False
if not await bridge.connect():
    print("连接失败")
```

### 命令执行错误

```python
result = await bridge.execute_command({...})

if not result.get("success"):
    error = result.get("error", "未知错误")
    print(f"命令执行失败: {error}")
```

### 超时错误

```python
# 配置超时时间
config = BridgeConfig(
    connection_timeout=10.0,  # 连接超时
    request_timeout=30.0      # 请求超时
)
```

### 自动重连

桥接客户端会在以下情况自动触发重连：

1. 健康检查失败
2. WebSocket连接断开
3. HTTP请求失败

## 性能优化

### 连接池

使用`aiohttp.ClientSession`实现连接池，提高性能：

```python
# 会话会在整个生命周期中复用
self.session = aiohttp.ClientSession(timeout=timeout)
```

### 异步操作

所有网络操作都是异步的，不会阻塞主线程：

```python
# 并发执行多个操作
status, battery = await asyncio.gather(
    bridge.get_drone_status(),
    bridge.execute_command({"action": "get_battery"})
)
```

### 心跳机制

WebSocket连接使用心跳保持活跃：

```python
# 配置心跳间隔
config = BridgeConfig(
    ws_heartbeat_interval=30.0  # 30秒
)
```

## 日志记录

桥接客户端使用Python标准日志库：

```python
import logging

# 配置日志级别
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 日志示例
# INFO - 正在连接到无人机控制后端...
# INFO - ✅ 成功连接到无人机控制后端
# INFO - 发送命令到无人机控制后端: takeoff
# INFO - ✅ 命令执行成功: takeoff
```

## 测试

### 单元测试

```python
import pytest
from bridge_client import BridgeClient, BridgeConfig

@pytest.mark.asyncio
async def test_connection():
    config = BridgeConfig()
    bridge = BridgeClient(config)
    
    # 测试连接
    assert await bridge.connect()
    assert bridge.state == ConnectionState.CONNECTED
    
    # 清理
    await bridge.disconnect()

@pytest.mark.asyncio
async def test_health_check():
    async with BridgeClient() as bridge:
        # 测试健康检查
        assert await bridge.health_check()
```

### 集成测试

```python
@pytest.mark.asyncio
async def test_command_execution():
    async with BridgeClient() as bridge:
        # 测试命令执行
        result = await bridge.execute_command({
            "action": "get_battery",
            "parameters": {}
        })
        
        assert result.get("success") == True
        assert "battery" in result.get("data", {})
```

## 故障排除

### 连接失败

**问题**: 无法连接到3002端口

**解决方案**:
1. 确认无人机控制后端正在运行
2. 检查端口是否正确
3. 检查防火墙设置

```python
# 检查连接信息
info = bridge.get_connection_info()
print(f"连接状态: {info['state']}")
print(f"目标URL: {info['base_url']}")
```

### 健康检查失败

**问题**: 健康检查持续失败

**解决方案**:
1. 检查网络连接
2. 增加超时时间
3. 检查后端API是否正常

```python
# 增加超时时间
config = BridgeConfig(
    connection_timeout=20.0,
    request_timeout=60.0
)
```

### WebSocket断开

**问题**: WebSocket连接频繁断开

**解决方案**:
1. 调整心跳间隔
2. 检查网络稳定性
3. 增加重连尝试次数

```python
# 调整配置
config = BridgeConfig(
    ws_heartbeat_interval=15.0,  # 更频繁的心跳
    max_reconnect_attempts=10    # 更多重试次数
)
```

## 最佳实践

### 1. 使用上下文管理器

```python
# 推荐：自动管理连接生命周期
async with BridgeClient(config) as bridge:
    await bridge.execute_command({...})
```

### 2. 错误处理

```python
# 始终检查返回结果
result = await bridge.execute_command({...})
if not result.get("success"):
    logger.error(f"命令失败: {result.get('error')}")
```

### 3. 配置优化

```python
# 根据网络环境调整配置
config = BridgeConfig(
    connection_timeout=10.0,      # 局域网可以更短
    request_timeout=30.0,         # 根据命令复杂度调整
    health_check_interval=30.0,   # 稳定网络可以更长
    max_reconnect_attempts=5      # 根据可靠性需求调整
)
```

### 4. 日志记录

```python
# 配置适当的日志级别
logging.basicConfig(
    level=logging.INFO,  # 生产环境使用INFO
    # level=logging.DEBUG,  # 开发环境使用DEBUG
)
```

## 未来扩展

### 计划功能

1. **命令队列**: 支持命令排队和批量执行
2. **缓存机制**: 缓存频繁查询的状态数据
3. **指标收集**: 收集性能指标和统计数据
4. **负载均衡**: 支持多个后端实例
5. **断路器模式**: 防止级联故障

### 扩展示例

```python
# 未来可能的扩展
class EnhancedBridgeClient(BridgeClient):
    def __init__(self, config):
        super().__init__(config)
        self.command_queue = asyncio.Queue()
        self.metrics = MetricsCollector()
    
    async def execute_command_with_retry(self, command_data, max_retries=3):
        """带重试的命令执行"""
        for attempt in range(max_retries):
            result = await self.execute_command(command_data)
            if result.get("success"):
                return result
            await asyncio.sleep(1)
        return {"success": False, "error": "Max retries exceeded"}
```

## 相关文档

- [Tello智能代理桥接系统设计文档](./TELLO_AGENT_BRIDGE_DESIGN.md)
- [Tello智能代理桥接系统需求规范](./TELLO_AGENT_BRIDGE_REQUIREMENTS.md)
- [AI配置管理器文档](./AI_CONFIG_MANAGER.md)

## 版本历史

- **v1.0.0** (2024-11): 初始实现
  - HTTP API通信
  - 连接重试机制
  - 健康检查功能
  - WebSocket状态订阅

## 贡献

欢迎提交问题和改进建议！

## 许可证

MIT License
