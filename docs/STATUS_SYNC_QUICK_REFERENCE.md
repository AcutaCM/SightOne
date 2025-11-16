# 状态同步快速参考

## 快速开始

### 1. 导入状态管理器

```python
from status_manager import StatusManager, DroneStatusData, BridgeStatusData
```

### 2. 创建状态管理器

```python
status_manager = StatusManager(
    sync_interval=1.0,  # 1秒同步一次
    change_threshold={
        'battery': 5,
        'temperature': 2,
        'height': 10,
        'position': 5
    }
)
```

### 3. 更新状态

```python
# 更新无人机状态
status_data = {
    'connected': True,
    'flying': False,
    'battery': 85,
    'temperature': 25,
    'height': 0
}
has_changes = status_manager.update_drone_status(status_data)

# 更新桥接状态
status_manager.update_bridge_status(
    connected_to_drone_backend=True,
    sync_count=10
)

# 更新AI配置状态
status_manager.update_ai_status(True)
```

### 4. 订阅状态更新

```python
async def status_callback(status):
    print(f"状态更新: {status}")

status_manager.subscribe(status_callback)
```

### 5. 启动定时同步

```python
async def status_source():
    # 从3002端口查询状态
    return await bridge_client.get_drone_status()

await status_manager.start_sync(status_source)
```

### 6. 停止同步

```python
await status_manager.stop_sync()
```

## 常用API

### 状态查询

```python
# 获取完整状态
full_status = status_manager.get_current_status()

# 获取无人机状态
drone_status = status_manager.get_drone_status()

# 获取桥接状态
bridge_status = status_manager.get_bridge_status()

# 获取统计信息
statistics = status_manager.get_statistics()
```

### 状态广播

```python
# 自动广播（有变化时）
await status_manager.broadcast_status()

# 强制广播（忽略变化检测）
await status_manager.broadcast_status(force=True)
```

## WebSocket消息

### 获取状态

```javascript
// 发送请求
ws.send(JSON.stringify({
  type: 'get_status',
  data: {}
}));

// 接收响应
{
  "type": "get_status_response",
  "success": true,
  "data": {
    "drone_status": { ... },
    "bridge_status": { ... },
    "statistics": { ... }
  }
}
```

### 接收状态更新

```javascript
// 自动接收（当状态变化时）
{
  "type": "status_update",
  "data": {
    "drone_status": { ... },
    "bridge_status": { ... }
  }
}
```

### 获取统计信息

```javascript
// 发送请求
ws.send(JSON.stringify({
  type: 'get_statistics',
  data: {}
}));

// 接收响应
{
  "type": "get_statistics_response",
  "success": true,
  "data": {
    "total_updates": 150,
    "total_changes": 45,
    "change_rate": 0.3,
    "sync_count": 150,
    "error_count": 2
  }
}
```

## 配置参数

### 同步间隔

```python
# 实时性要求高
sync_interval=0.5  # 500ms

# 一般应用
sync_interval=1.0  # 1秒（默认）

# 低频监控
sync_interval=5.0  # 5秒
```

### 变化阈值

```python
change_threshold={
    'battery': 5,      # 电池变化超过5%才通知
    'temperature': 2,  # 温度变化超过2度才通知
    'height': 10,      # 高度变化超过10cm才通知
    'position': 5,     # 位置变化超过5cm才通知
}
```

## 状态数据结构

### 无人机状态

```python
{
  "connected": bool,
  "flying": bool,
  "battery": int,        # 0-100
  "temperature": int,    # 摄氏度
  "height": int,         # 厘米
  "speed": {
    "x": float,
    "y": float,
    "z": float
  },
  "position": {
    "x": float,
    "y": float,
    "z": float
  },
  "wifi_signal": int,    # 0-100
  "flight_time": int,    # 秒
  "timestamp": str       # ISO格式
}
```

### 桥接状态

```python
{
  "connected_to_drone_backend": bool,
  "ai_configured": bool,
  "last_sync": str,      # ISO格式或null
  "sync_count": int,
  "error_count": int,
  "last_error": str      # 或null
}
```

### 统计信息

```python
{
  "total_updates": int,
  "total_changes": int,
  "change_rate": float,  # 0.0-1.0
  "sync_count": int,
  "error_count": int,
  "last_sync": str,      # ISO格式或null
  "last_error": str,     # 或null
  "subscribers_count": int,
  "is_syncing": bool
}
```

## 测试命令

```bash
# 运行完整测试
python drone-analyzer-nextjs/python/test_status_sync.py

# 测试状态管理器
python -c "from status_manager import StatusManager; import asyncio; asyncio.run(StatusManager().get_current_status())"
```

## 常见问题

### Q: 如何调整同步频率？

A: 修改`sync_interval`参数：
```python
status_manager = StatusManager(sync_interval=0.5)  # 500ms
```

### Q: 如何禁用变化检测？

A: 使用`force=True`强制广播：
```python
await status_manager.broadcast_status(force=True)
```

### Q: 如何获取变化的字段？

A: 调用`_get_changed_fields()`方法（内部使用）：
```python
changes = status_manager._get_changed_fields()
```

### Q: 如何处理同步错误？

A: 检查统计信息中的错误计数和最后错误：
```python
stats = status_manager.get_statistics()
if stats['error_count'] > 0:
    print(f"最后错误: {stats['last_error']}")
```

## 性能提示

1. **合理设置阈值**: 避免过于敏感导致频繁广播
2. **监控变化率**: 保持在20-40%为最佳
3. **定期检查错误**: 及时发现和处理同步问题
4. **清理订阅者**: 移除不再需要的订阅者

## 调试技巧

### 启用详细日志

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 打印状态变化

```python
async def debug_callback(status):
    print(f"状态更新: {json.dumps(status, indent=2)}")

status_manager.subscribe(debug_callback)
```

### 监控同步统计

```python
# 定期打印统计信息
async def print_stats():
    while True:
        stats = status_manager.get_statistics()
        print(f"同步: {stats['sync_count']}, 变化: {stats['total_changes']}, 错误: {stats['error_count']}")
        await asyncio.sleep(10)
```

## 相关链接

- [完整文档](./STATUS_SYNC_IMPLEMENTATION.md)
- [桥接客户端](./BRIDGE_CLIENT_IMPLEMENTATION.md)
- [测试脚本](../python/test_status_sync.py)
