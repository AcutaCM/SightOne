# 3002-3004端口集成快速开始指南

## 🚀 快速开始

### 1. 启动服务

#### 步骤1: 启动3002后端服务（必须先启动）
```bash
cd drone-analyzer-nextjs/python
python drone_backend.py
```

**预期输出:**
```
╔═══════════════════════════════════════════════════════════════════════╗
║                    瞰析 ONE - 智能视觉分析平台                         ║
╚═══════════════════════════════════════════════════════════════════════╝
✓ djitellopy库加载成功
✓ OpenCV库加载成功
✓ 草莓检测器模块加载成功
✓ QR检测器模块加载成功
✓ 诊断工作流管理器模块加载成功
🚀 启动WebSocket服务器，端口: 3002
✅ WebSocket服务器已启动: ws://localhost:3002
```

#### 步骤2: 启动3004智能代理服务
```bash
cd drone-analyzer-nextjs/python
python tello_intelligent_agent.py
```

**预期输出:**
```
INFO - 启动Tello智能代理服务器: localhost:3004
INFO - Ollama客户端初始化成功 - 端点: http://localhost:11434/v1, 模型: llama3.1:8b
INFO - Tello智能代理服务器启动成功
INFO - 正在连接到3002后端: ws://localhost:3002
INFO - 成功连接到3002后端
```

### 2. 连接无人机

通过3002端口连接Tello无人机：

```python
import websockets
import json
import asyncio

async def connect_drone():
    uri = "ws://localhost:3002"
    async with websockets.connect(uri) as websocket:
        # 发送连接命令
        await websocket.send(json.dumps({
            "type": "drone_connect",
            "data": {}
        }))
        
        # 接收响应
        response = await websocket.recv()
        print(json.loads(response))

asyncio.run(connect_drone())
```

### 3. 发送自然语言命令

通过3004端口发送自然语言命令：

```python
import websockets
import json
import asyncio

async def send_command():
    uri = "ws://localhost:3004"
    async with websockets.connect(uri) as websocket:
        # 发送自然语言命令
        await websocket.send(json.dumps({
            "type": "natural_language_command",
            "data": {
                "command": "起飞后向前飞30厘米，然后降落"
            }
        }))
        
        # 接收AI分析结果
        response = await websocket.recv()
        result = json.loads(response)
        
        print("AI分析结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))

asyncio.run(send_command())
```

### 4. 监听执行状态

通过3002端口监听命令执行状态：

```python
import websockets
import json
import asyncio

async def monitor_execution():
    uri = "ws://localhost:3002"
    async with websockets.connect(uri) as websocket:
        # 监听消息
        async for message in websocket:
            data = json.loads(message)
            msg_type = data.get('type')
            
            if msg_type == 'command_executing':
                # 命令正在执行
                cmd_data = data.get('data', {})
                print(f"正在执行: {cmd_data.get('action')} ({cmd_data.get('index')}/{cmd_data.get('total')})")
            
            elif msg_type == 'ai_commands_executed':
                # 命令执行完成
                cmd_data = data.get('data', {})
                print(f"执行完成: {cmd_data.get('executed_commands')}/{cmd_data.get('total_commands')}")
                print(f"成功: {cmd_data.get('success')}")
                break

asyncio.run(monitor_execution())
```

## 🧪 运行测试

我们提供了一个完整的测试脚本：

```bash
cd drone-analyzer-nextjs/python
python test_3002_3004_integration.py
```

**测试内容:**
1. 连接到3004端口
2. 发送自然语言命令
3. 接收AI分析结果
4. 验证命令格式
5. 确认3002收到并处理

## 📊 完整示例

### 示例1: 简单飞行

```python
import websockets
import json
import asyncio

async def simple_flight():
    # 连接到3004（AI分析）
    uri_3004 = "ws://localhost:3004"
    
    async with websockets.connect(uri_3004) as ws:
        # 发送命令
        await ws.send(json.dumps({
            "type": "natural_language_command",
            "data": {
                "command": "起飞，向前飞50厘米，然后降落"
            }
        }))
        
        # 接收结果
        response = await ws.recv()
        result = json.loads(response)
        
        if result.get('success'):
            print("✅ 命令已发送到3002执行")
            commands = result.get('ai_analysis', {}).get('commands', [])
            print(f"生成了 {len(commands)} 条命令:")
            for cmd in commands:
                print(f"  - {cmd.get('action')}: {cmd.get('description')}")
        else:
            print(f"❌ 失败: {result.get('error')}")

asyncio.run(simple_flight())
```

### 示例2: 复杂飞行路径

```python
async def complex_flight():
    uri_3004 = "ws://localhost:3004"
    
    async with websockets.connect(uri_3004) as ws:
        # 发送复杂命令
        await ws.send(json.dumps({
            "type": "natural_language_command",
            "data": {
                "command": "起飞，向前飞30厘米，顺时针旋转90度，向右飞20厘米，然后降落"
            }
        }))
        
        response = await ws.recv()
        result = json.loads(response)
        
        if result.get('success'):
            print("✅ 复杂飞行路径已规划")
            commands = result.get('ai_analysis', {}).get('commands', [])
            for i, cmd in enumerate(commands, 1):
                print(f"{i}. {cmd.get('action')}")
                if cmd.get('parameters'):
                    print(f"   参数: {cmd.get('parameters')}")

asyncio.run(complex_flight())
```

## 🔧 配置AI模型

### 使用Ollama（本地）

```bash
# .env文件
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.1:8b
```

### 使用OpenAI

```bash
# .env文件
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4
```

### 使用Azure OpenAI

```bash
# .env文件
AI_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

## 📝 支持的自然语言命令示例

| 命令 | 生成的动作 |
|------|-----------|
| "起飞" | takeoff |
| "降落" | land |
| "向前飞30厘米" | move_forward(30) |
| "向后退20厘米" | move_back(20) |
| "向左移动50厘米" | move_left(50) |
| "向右移动40厘米" | move_right(40) |
| "上升30厘米" | move_up(30) |
| "下降20厘米" | move_down(20) |
| "顺时针旋转90度" | rotate_clockwise(90) |
| "逆时针旋转45度" | rotate_counter_clockwise(45) |
| "悬停" | hover |

## ⚠️ 注意事项

1. **启动顺序**: 必须先启动3002，再启动3004
2. **无人机连接**: 命令执行前必须先连接无人机
3. **命令延迟**: 命令之间有2秒延迟，确保稳定
4. **错误处理**: 命令失败会自动停止后续命令
5. **AI配置**: 确保AI模型配置正确且可用

## 🐛 故障排查

### 问题1: 3004无法连接到3002
```
ERROR - 连接到3002后端失败: Connection refused
```

**解决方案:**
- 确保3002服务已启动
- 检查端口是否被占用
- 检查防火墙设置

### 问题2: AI分析失败
```
ERROR - AI命令分析失败: ...
```

**解决方案:**
- 检查AI提供商配置（API Key、端点等）
- 确认AI模型可用
- 查看详细错误日志

### 问题3: 命令不执行
```
⚠️ 无人机未连接，无法执行命令
```

**解决方案:**
- 先通过3002连接无人机
- 确认无人机电量充足
- 检查无人机WiFi连接

## 📚 更多文档

- [完整集成文档](./AI_ANALYSIS_EXECUTION_INTEGRATION.md)
- [集成总结](./3002_3004_INTEGRATION_SUMMARY.md)

## 🎯 下一步

1. 尝试运行测试脚本
2. 连接真实的Tello无人机
3. 发送自然语言命令
4. 观察命令执行过程
5. 根据需要调整AI模型配置

## 💡 提示

- 使用Ollama可以完全本地运行，无需API Key
- 建议先在模拟环境测试，再连接真实无人机
- 查看两个服务的日志输出以了解详细过程
- 可以同时连接多个客户端监听执行状态

---

**祝你使用愉快！** 🚁✨
