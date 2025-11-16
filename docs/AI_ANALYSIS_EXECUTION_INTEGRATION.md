# AI分析结果执行集成文档

## 概述

本文档描述了3002端口（drone_backend.py）监听3004端口（tello_intelligent_agent.py）的AI分析结果并执行的完整流程。

## 架构设计

### 端口分配
- **3004端口**: Tello智能代理服务（tello_intelligent_agent.py）
  - 负责接收自然语言命令
  - 使用AI模型（OpenAI/Azure/Ollama）解析命令
  - 生成结构化的无人机控制命令序列
  - 将AI分析结果发送到3002端口

- **3002端口**: 无人机后端服务（drone_backend.py）
  - 负责实际的无人机控制
  - 接收来自3004的AI分析结果
  - 执行无人机命令序列
  - 广播执行状态和结果

## 工作流程

### 1. AI分析阶段（3004端口）

#### 1.1 接收自然语言命令
```python
# 用户通过WebSocket发送自然语言命令
{
    "type": "natural_language_command",
    "data": {
        "command": "起飞后向前飞30厘米"
    }
}
```

#### 1.2 AI解析命令
```python
async def process_natural_language_command(self, command: str):
    # 使用AI分析命令
    ai_analysis = await self._analyze_command_with_ai(command)
    
    # AI返回结构化命令
    # {
    #     "commands": [
    #         {"action": "takeoff", "parameters": {}, "description": "起飞"},
    #         {"action": "move_forward", "parameters": {"distance": 30}, "description": "向前移动30厘米"}
    #     ]
    # }
```

#### 1.3 发送分析结果到3002
```python
async def _send_analysis_to_3002(self, analysis: Dict[str, Any]):
    # 连接到3002端口
    if not self.backend_3002_connected:
        await self._connect_to_3002()
    
    # 发送AI分析结果
    message = {
        'type': 'ai_analysis_result',
        'data': {
            'timestamp': datetime.now().isoformat(),
            'analysis': analysis,
            'source': 'tello_intelligent_agent_3004'
        }
    }
    
    await self.backend_3002_client.send(json.dumps(message))
```

### 2. 命令执行阶段（3002端口）

#### 2.1 接收AI分析结果
```python
async def handle_websocket_message(self, websocket, message):
    data = json.loads(message)
    msg_type = data.get('type')
    
    # 路由到对应的处理器
    if msg_type == 'ai_analysis_result':
        await self.handle_ai_analysis_result(websocket, data.get('data', {}))
```

#### 2.2 执行命令序列
```python
async def handle_ai_analysis_result(self, websocket, data):
    analysis = data.get('analysis', {})
    commands = analysis.get('commands', [])
    
    # 检查无人机连接状态
    if not self.drone or not self.drone_state.get('connected', False):
        # 发送错误消息
        return
    
    # 串行执行命令
    execution_results = []
    for i, cmd in enumerate(commands):
        action = cmd.get('action')
        parameters = cmd.get('parameters', {})
        
        # 广播执行状态
        await self.broadcast_message('command_executing', {
            'index': i + 1,
            'total': len(commands),
            'action': action
        })
        
        # 执行命令
        result = await self._execute_drone_command_from_ai(action, parameters)
        execution_results.append(result)
        
        # 失败则停止
        if not result.get('success', False):
            break
        
        # 命令间延迟
        await asyncio.sleep(2.0)
    
    # 广播执行完成
    await self.broadcast_message('ai_commands_executed', {
        'total_commands': len(commands),
        'executed_commands': len(execution_results),
        'success': all(r.get('success', False) for r in execution_results)
    })
```

#### 2.3 执行单个命令
```python
async def _execute_drone_command_from_ai(self, action: str, parameters: Dict[str, Any]):
    # 命令映射
    command_map = {
        'takeoff': lambda: self.drone.takeoff(),
        'land': lambda: self.drone.land(),
        'move_forward': lambda: self.drone.move_forward(parameters.get('distance', 30)),
        'move_back': lambda: self.drone.move_back(parameters.get('distance', 30)),
        'move_left': lambda: self.drone.move_left(parameters.get('distance', 30)),
        'move_right': lambda: self.drone.move_right(parameters.get('distance', 30)),
        'move_up': lambda: self.drone.move_up(parameters.get('distance', 30)),
        'move_down': lambda: self.drone.move_down(parameters.get('distance', 30)),
        'rotate_clockwise': lambda: self.drone.rotate_clockwise(parameters.get('degrees', 90)),
        'rotate_counter_clockwise': lambda: self.drone.rotate_counter_clockwise(parameters.get('degrees', 90)),
        'hover': lambda: None
    }
    
    # 执行命令
    command_map[action]()
    
    # 更新状态
    if action == 'takeoff':
        self.drone_state['flying'] = True
    elif action == 'land':
        self.drone_state['flying'] = False
    
    return {'success': True, 'action': action, 'message': f'命令 {action} 执行成功'}
```

## 消息格式

### 3004 → 3002: AI分析结果
```json
{
    "type": "ai_analysis_result",
    "data": {
        "timestamp": "2024-01-01T12:00:00",
        "analysis": {
            "commands": [
                {
                    "action": "takeoff",
                    "parameters": {},
                    "description": "起飞"
                },
                {
                    "action": "move_forward",
                    "parameters": {"distance": 30},
                    "description": "向前移动30厘米"
                }
            ]
        },
        "source": "tello_intelligent_agent_3004"
    }
}
```

### 3002 → 客户端: 命令执行状态
```json
{
    "type": "command_executing",
    "data": {
        "index": 1,
        "total": 2,
        "action": "takeoff",
        "description": "起飞"
    }
}
```

### 3002 → 客户端: 执行完成
```json
{
    "type": "ai_commands_executed",
    "data": {
        "total_commands": 2,
        "executed_commands": 2,
        "success": true
    }
}
```

## 连接管理

### 3004端连接到3002
```python
async def _connect_to_3002(self):
    """连接到3002后端"""
    if self.backend_3002_connected:
        return
    
    logger.info(f"正在连接到3002后端: {self.backend_3002_url}")
    self.backend_3002_client = await websockets.connect(
        self.backend_3002_url,
        ping_interval=20,
        ping_timeout=10
    )
    self.backend_3002_connected = True
    logger.info("成功连接到3002后端")
```

### 监听3002的响应
```python
async def _listen_to_3002(self):
    """监听3002后端的响应消息"""
    try:
        if not self.backend_3002_client:
            return
        
        async for message in self.backend_3002_client:
            try:
                data = json.loads(message)
                message_type = data.get('type')
                
                # 处理执行状态更新
                if message_type == 'command_executing':
                    # 转发给前端客户端
                    await self._broadcast_event('command_executing', data.get('data', {}))
                
                elif message_type == 'ai_commands_executed':
                    # 转发执行完成消息
                    await self._broadcast_event('ai_commands_executed', data.get('data', {}))
                
            except json.JSONDecodeError:
                logger.error("无法解析来自3002的消息")
    
    except websockets.exceptions.ConnectionClosed:
        logger.info("与3002后端的连接已关闭")
        self.backend_3002_connected = False
        self.backend_3002_client = None
```

## 错误处理

### 1. 无人机未连接
```python
if not self.drone or not self.drone_state.get('connected', False):
    await websocket.send(json.dumps({
        'type': 'execution_error',
        'data': {'error': '无人机未连接'}
    }))
    return
```

### 2. 命令执行失败
```python
if not result.get('success', False):
    print(f"❌ 命令执行失败: {action}")
    break  # 停止后续命令
```

### 3. 连接失败
```python
except Exception as e:
    logger.error(f"连接到3002后端失败: {e}")
    self.backend_3002_connected = False
    self.backend_3002_client = None
```

## 配置

### 环境变量
```bash
# 3002后端URL（在3004端配置）
BACKEND_3002_URL=ws://localhost:3002

# AI提供商配置（在3004端配置）
AI_PROVIDER=ollama  # 或 openai, azure
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.1:8b

# 或使用OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# 或使用Azure
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

## 使用示例

### 1. 启动服务
```bash
# 启动3002后端服务
cd drone-analyzer-nextjs/python
python drone_backend.py

# 启动3004智能代理服务
python tello_intelligent_agent.py
```

### 2. 发送自然语言命令
```javascript
// 前端代码
const ws = new WebSocket('ws://localhost:3004');

ws.send(JSON.dumps({
    type: 'natural_language_command',
    data: {
        command: '起飞后向前飞30厘米，然后降落'
    }
}));
```

### 3. 监听执行状态
```javascript
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'command_executing') {
        console.log(`正在执行: ${data.data.action} (${data.data.index}/${data.data.total})`);
    }
    
    if (data.type === 'ai_commands_executed') {
        console.log(`执行完成: ${data.data.executed_commands}/${data.data.total_commands}`);
        console.log(`成功: ${data.data.success}`);
    }
};
```

## 优势

1. **解耦设计**: AI分析和命令执行分离，便于维护和扩展
2. **实时反馈**: 通过WebSocket实时广播执行状态
3. **错误处理**: 完善的错误处理和状态管理
4. **灵活性**: 支持多种AI提供商（OpenAI、Azure、Ollama）
5. **安全性**: 命令验证和状态检查

## 注意事项

1. 确保3002端口先启动，3004端口才能成功连接
2. 无人机必须先连接才能执行命令
3. 命令执行是串行的，失败会停止后续命令
4. 命令间有2秒延迟，确保无人机稳定
5. 连接断开会自动重置状态

## 故障排查

### 问题1: 3004无法连接到3002
**解决方案**:
- 检查3002服务是否已启动
- 检查BACKEND_3002_URL配置是否正确
- 检查防火墙设置

### 问题2: 命令不执行
**解决方案**:
- 检查无人机是否已连接
- 检查AI分析结果格式是否正确
- 查看3002端口的日志输出

### 问题3: AI解析失败
**解决方案**:
- 检查AI提供商配置（API Key、端点等）
- 检查AI模型是否可用
- 查看3004端口的日志输出

## 更新日志

### 2024-01-01
- 初始版本
- 实现3004到3002的AI分析结果传递
- 实现3002端的命令执行逻辑
- 添加完整的错误处理和状态管理
