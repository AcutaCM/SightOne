# 命令转发机制 - 快速参考

## 快速开始

### 1. 启动服务

```bash
# 终端1: 启动无人机控制后端（3002端口）
cd drone-analyzer-nextjs/python
python drone_backend.py --port 3002

# 终端2: 启动智能代理后端（3004端口）
python tello_agent_backend.py --port 3004
```

### 2. 测试命令转发

```bash
# 运行测试脚本
python test_command_forwarding.py
```

## 核心API

### 命令转发
```python
# 转发单个命令
result = await agent.forward_command_to_bridge(
    action="takeoff",
    parameters={}
)

# 批量执行命令
results = await agent.execute_command_batch([
    {"action": "takeoff", "parameters": {}, "description": "起飞"},
    {"action": "move_forward", "parameters": {"distance": 50}, "description": "前进"}
])
```

### 命令格式转换
```python
# 转换命令格式
converted = agent._convert_command_format(
    action="takeoff",
    parameters={}
)

# 转换结果格式
result = agent._convert_result_format(bridge_result)
```

### 桥接客户端
```python
# 创建桥接客户端
from bridge_client import BridgeClient, BridgeConfig

config = BridgeConfig(
    drone_backend_host="localhost",
    drone_backend_port=3002
)

async with BridgeClient(config) as bridge:
    # 执行命令
    result = await bridge.execute_command({
        "action": "get_battery",
        "parameters": {}
    })
    
    # 获取状态
    status = await bridge.get_drone_status()
    
    # 订阅状态更新
    await bridge.subscribe_status_updates(callback)
```

## 配置选项

### 智能代理配置
```python
config = TelloAgentConfig(
    ws_host="localhost",
    ws_port=3004,
    
    # 桥接配置
    enable_bridge=True,              # 启用桥接模式
    drone_backend_host="localhost",  # 3002端口主机
    drone_backend_port=3002,         # 3002端口号
    command_timeout=30.0             # 命令超时（秒）
)
```

### 桥接客户端配置
```python
bridge_config = BridgeConfig(
    drone_backend_host="localhost",
    drone_backend_port=3002,
    max_reconnect_attempts=5,        # 最大重连次数
    reconnect_delay=2.0,             # 重连延迟（秒）
    request_timeout=30.0,            # 请求超时（秒）
    health_check_interval=30.0       # 健康检查间隔（秒）
)
```

## WebSocket消息格式

### 发送自然语言命令
```json
{
    "type": "natural_language_command",
    "data": {
        "command": "起飞后向前飞50厘米"
    }
}
```

### 接收执行结果
```json
{
    "type": "natural_language_command_response",
    "success": true,
    "ai_analysis": {
        "commands": [...],
        "analysis": "..."
    },
    "execution_results": [
        {
            "success": true,
            "action": "takeoff",
            "message": "起飞成功",
            "description": "起飞",
            "command_index": 0
        }
    ],
    "summary": {
        "total": 2,
        "successful": 2,
        "failed": 0
    }
}
```

### 获取状态
```json
{
    "type": "get_status"
}
```

### 状态响应
```json
{
    "type": "get_status_response",
    "success": true,
    "data": {
        "state": "connected",
        "drone_status": {
            "connected": true,
            "flying": false,
            "battery": 85,
            "temperature": 25,
            "height": 0
        },
        "bridge_status": {
            "state": "connected",
            "connected": true,
            "last_health_check_time": 1234567890.0
        },
        "bridge_enabled": true
    }
}
```

## 命令映射表

| 3004命令 | 3002命令 | 说明 |
|---------|---------|------|
| takeoff | drone_takeoff | 起飞 |
| land | drone_land | 降落 |
| emergency | drone_emergency | 紧急停止 |
| move_forward | drone_move_forward | 前进 |
| move_back | drone_move_back | 后退 |
| move_left | drone_move_left | 左移 |
| move_right | drone_move_right | 右移 |
| move_up | drone_move_up | 上升 |
| move_down | drone_move_down | 下降 |
| rotate_clockwise | drone_rotate_clockwise | 顺时针旋转 |
| rotate_counter_clockwise | drone_rotate_counter_clockwise | 逆时针旋转 |

## 错误处理

### 桥接未启用
```python
{
    "success": False,
    "error": "桥接模式未启用或桥接客户端不可用"
}
```

### 命令执行超时
```python
{
    "success": False,
    "error": "命令执行超时（30秒）",
    "action": "takeoff",
    "timeout": True
}
```

### 连接失败
```python
{
    "success": False,
    "error": "未连接到无人机控制后端"
}
```

## 日志级别

```python
import logging

# 设置日志级别
logging.basicConfig(level=logging.INFO)  # INFO, DEBUG, WARNING, ERROR
```

## 常用命令

### 查看日志
```bash
# 实时查看日志
tail -f tello_agent.log

# 搜索特定内容
grep "命令转发" tello_agent.log
grep "ERROR" tello_agent.log
```

### 测试连接
```bash
# 测试3002端口是否运行
curl http://localhost:3002/api/drone/status

# 测试WebSocket连接
wscat -c ws://localhost:3004
```

## 性能指标

| 指标 | 目标值 | 说明 |
|-----|-------|------|
| 命令转发延迟 | < 100ms | 从3004到3002的转发时间 |
| 命令执行超时 | 30s | 可配置 |
| 状态同步频率 | 1Hz | 每秒更新一次 |
| 健康检查间隔 | 30s | 定期检查连接状态 |
| 重连延迟 | 2s | 首次重连延迟 |
| 最大重连次数 | 5次 | 失败后放弃 |

## 故障排查清单

- [ ] 3002端口是否运行？
- [ ] 网络连接是否正常？
- [ ] 配置文件是否正确？
- [ ] 日志中是否有错误信息？
- [ ] 超时时间是否合理？
- [ ] 命令格式是否正确？
- [ ] 桥接模式是否启用？

## 相关文档

- [完整实现文档](./COMMAND_FORWARDING_MECHANISM.md)
- [桥接客户端](./BRIDGE_CLIENT_IMPLEMENTATION.md)
- [设计文档](../.kiro/specs/tello-agent-bridge/design.md)
- [需求文档](../.kiro/specs/tello-agent-bridge/requirements.md)
