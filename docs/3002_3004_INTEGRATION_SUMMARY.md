# 3002-3004端口集成总结

## 快速概览

✅ **已完成**: 3002端口（drone_backend.py）监听3004端口（tello_intelligent_agent.py）的AI分析结果并执行

## 核心功能

### 1. AI分析（3004端口）
- 接收自然语言命令
- 使用AI模型（OpenAI/Azure/Ollama）解析
- 生成结构化命令序列
- 发送到3002端口执行

### 2. 命令执行（3002端口）
- 接收AI分析结果
- 验证无人机连接状态
- 串行执行命令序列
- 实时广播执行状态

## 数据流

```
用户输入自然语言
    ↓
3004端口（AI分析）
    ↓
生成命令序列
    ↓
WebSocket发送到3002
    ↓
3002端口（执行命令）
    ↓
控制无人机
    ↓
广播执行状态
```

## 关键代码位置

### 3004端（tello_intelligent_agent.py）
- **AI分析**: `process_natural_language_command()` (第310行)
- **发送结果**: `_send_analysis_to_3002()` (第761行)
- **连接管理**: `_connect_to_3002()` (第789行)
- **初始化**: `__init__()` 中的 `backend_3002_*` 属性 (第106-108行)

### 3002端（drone_backend.py）
- **接收处理**: `handle_ai_analysis_result()` (第491行)
- **执行命令**: `_execute_drone_command_from_ai()` (第574行)
- **消息路由**: `handle_websocket_message()` (第479行)

## 消息格式

### 3004 → 3002
```json
{
    "type": "ai_analysis_result",
    "data": {
        "analysis": {
            "commands": [
                {"action": "takeoff", "parameters": {}, "description": "起飞"},
                {"action": "move_forward", "parameters": {"distance": 30}}
            ]
        }
    }
}
```

### 3002 → 客户端
```json
{
    "type": "command_executing",
    "data": {"index": 1, "total": 2, "action": "takeoff"}
}
```

```json
{
    "type": "ai_commands_executed",
    "data": {"total_commands": 2, "executed_commands": 2, "success": true}
}
```

## 支持的命令

| 命令 | 参数 | 说明 |
|------|------|------|
| takeoff | - | 起飞 |
| land | - | 降落 |
| emergency | - | 紧急停止 |
| move_forward | distance (cm) | 向前移动 |
| move_back | distance (cm) | 向后移动 |
| move_left | distance (cm) | 向左移动 |
| move_right | distance (cm) | 向右移动 |
| move_up | distance (cm) | 向上移动 |
| move_down | distance (cm) | 向下移动 |
| rotate_clockwise | degrees | 顺时针旋转 |
| rotate_counter_clockwise | degrees | 逆时针旋转 |
| hover | - | 悬停 |

## 配置

### 环境变量（.env）
```bash
# 3002后端连接（在3004端配置）
BACKEND_3002_URL=ws://localhost:3002

# AI提供商（在3004端配置）
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.1:8b
```

## 启动顺序

1. **先启动3002**: `python drone_backend.py`
2. **再启动3004**: `python tello_intelligent_agent.py`
3. **连接无人机**: 通过3002端口连接Tello
4. **发送命令**: 通过3004端口发送自然语言命令

## 测试示例

```python
# 连接到3004端口
import websockets
import json
import asyncio

async def test():
    uri = "ws://localhost:3004"
    async with websockets.connect(uri) as websocket:
        # 发送自然语言命令
        await websocket.send(json.dumps({
            "type": "natural_language_command",
            "data": {
                "command": "起飞后向前飞30厘米"
            }
        }))
        
        # 接收响应
        response = await websocket.recv()
        print(json.loads(response))

asyncio.run(test())
```

## 特性

✅ **实时反馈**: WebSocket实时广播执行状态  
✅ **错误处理**: 完善的错误检测和恢复  
✅ **状态管理**: 自动管理连接和飞行状态  
✅ **串行执行**: 命令按顺序执行，失败自动停止  
✅ **多AI支持**: 支持OpenAI、Azure、Ollama  

## 注意事项

⚠️ 必须先连接无人机才能执行命令  
⚠️ 命令执行有2秒间隔，确保稳定性  
⚠️ 连接断开会自动重置状态  
⚠️ 3002必须先启动，3004才能连接  

## 文档

详细文档请参考: [AI_ANALYSIS_EXECUTION_INTEGRATION.md](./AI_ANALYSIS_EXECUTION_INTEGRATION.md)

## 状态

🟢 **已完成并测试**  
📝 **文档已更新**  
✅ **可以直接使用**
