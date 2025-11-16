# AI配置错误处理系统

## 概述

AI配置错误处理系统为Tello智能代理提供全面的错误检测、分类和恢复建议功能。该系统能够识别各种配置错误，并为用户提供清晰的错误信息和可操作的恢复步骤。

## 支持的AI提供商

系统支持以下AI提供商：

| 提供商 | 标识符 | 支持的模型示例 | API端点 |
|--------|--------|---------------|---------|
| OpenAI | `openai` | gpt-4o, gpt-4-turbo | https://api.openai.com/v1 |
| Anthropic | `anthropic` | claude-3-5-sonnet | https://api.anthropic.com |
| Google | `google` | gemini-1.5-pro | https://generativelanguage.googleapis.com |
| 千问/通义千问 | `qwen` | qwen-vl-plus, qwen2-vl-72b-instruct | https://dashscope.aliyuncs.com/compatible-mode/v1 |
| DashScope | `dashscope` | qwen-vl-max | https://dashscope.aliyuncs.com/api/v1 |
| Ollama | `ollama` | 本地模型 | http://localhost:11434 |

### 千问模型支持

千问（Qwen）系列模型由阿里云提供，支持两种接入方式：

1. **OpenAI兼容接口** (`provider: 'qwen'`)
   - 使用OpenAI SDK
   - 兼容性好，易于集成
   - 推荐用于大多数场景

2. **DashScope SDK** (`provider: 'dashscope'`)
   - 使用阿里云官方SDK
   - 支持更多高级功能
   - 适合需要完整功能的场景

#### 千问模型配置示例

```json
{
  "provider": "qwen",
  "model": "qwen-vl-plus",
  "api_key": "sk-your-dashscope-api-key",
  "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "temperature": 0.7,
  "max_tokens": 2000
}
```

## 功能特性

### 1. 错误类型分类

系统定义了以下错误类型：

#### 配置缺失错误
- `MISSING_PROVIDER`: 缺少AI提供商
- `MISSING_MODEL`: 缺少模型名称
- `MISSING_API_KEY`: 缺少API密钥
- `MISSING_REQUIRED_FIELD`: 缺少其他必需字段

#### 配置无效错误
- `INVALID_PROVIDER`: 不支持的AI提供商
- `INVALID_MODEL`: 无效的模型名称
- `INVALID_API_KEY_FORMAT`: API密钥格式错误
- `INVALID_API_BASE`: 无效的API端点
- `INVALID_TEMPERATURE`: 无效的temperature参数
- `INVALID_MAX_TOKENS`: 无效的max_tokens参数

#### API密钥验证错误
- `API_KEY_UNAUTHORIZED`: API密钥未授权
- `API_KEY_EXPIRED`: API密钥已过期
- `API_KEY_QUOTA_EXCEEDED`: API配额已超限
- `API_KEY_INVALID`: API密钥无效

#### 库依赖错误
- `LIBRARY_NOT_INSTALLED`: 缺少必需的Python库
- `LIBRARY_VERSION_INCOMPATIBLE`: 库版本不兼容

#### 网络错误
- `NETWORK_CONNECTION_ERROR`: 网络连接失败
- `NETWORK_TIMEOUT`: 网络超时
- `API_ENDPOINT_UNREACHABLE`: API端点无法访问

#### 模型能力错误
- `MODEL_NOT_SUPPORT_VISION`: 模型不支持视觉功能
- `MODEL_DEPRECATED`: 模型已弃用
- `MODEL_NOT_FOUND`: 模型不存在

### 2. API密钥格式验证

系统对不同AI提供商的API密钥进行格式验证：

#### OpenAI
- 前缀: `sk-`
- 最小长度: 20字符
- 示例: `sk-1234567890abcdefghij`

#### Anthropic
- 前缀: `sk-ant-`
- 最小长度: 20字符
- 示例: `sk-ant-1234567890abcdefghij`

#### Google
- 最小长度: 20字符
- 无特定前缀要求

#### Ollama
- API密钥可选（本地部署）

#### 千问/Qwen
- 前缀: `sk-`
- 最小长度: 20字符
- 示例: `sk-1234567890abcdefghij`
- 获取地址: https://dashscope.console.aliyun.com/apiKey

#### DashScope
- 前缀: `sk-`
- 最小长度: 20字符
- 与千问使用相同的API密钥

### 3. 库依赖检查

系统自动检查必需的Python库是否已安装：

| AI提供商 | 必需库 | 安装命令 |
|---------|--------|---------|
| OpenAI | `openai` | `pip install openai` |
| Anthropic | `anthropic` | `pip install anthropic` |
| Google | `google-generativeai` | `pip install google-generativeai` |
| 千问/Qwen | `openai` (兼容模式) | `pip install openai` |
| DashScope | `dashscope` | `pip install dashscope` |

### 4. 恢复建议系统

每个错误都附带详细的恢复建议，包括：

- **立即行动**: 最重要的2个恢复步骤
- **详细步骤**: 完整的恢复指南
- **额外资源**: 相关文档和链接
- **严重程度**: 错误的严重程度（high/medium/low）

## 使用方法

### 基本用法

```python
from ai_config_handler import AIConfigHandler

# 创建配置处理器
handler = AIConfigHandler()

# 处理AI配置
config_data = {
    'provider': 'openai',
    'model': 'gpt-4o',
    'api_key': 'sk-your-api-key',
    'temperature': 0.7,
    'max_tokens': 2000
}

result = await handler.handle_ai_config(config_data)

if result['success']:
    print(f"✅ 配置成功: {result['message']}")
else:
    print(f"❌ 配置失败: {result['error']}")
    print(f"错误类型: {result['error_type']}")
    print("恢复建议:")
    for suggestion in result['recovery_suggestions']:
        print(f"  - {suggestion}")
```

### 错误响应格式

成功响应：
```json
{
  "success": true,
  "message": "AI配置加载成功",
  "data": {
    "provider": "openai",
    "model": "gpt-4o",
    "supports_vision": true,
    "api_base": "https://api.openai.com/v1",
    "temperature": 0.7,
    "max_tokens": 2000
  }
}
```

错误响应：
```json
{
  "success": false,
  "error": "API密钥格式错误: 应以sk-开头",
  "error_type": "invalid_api_key_format",
  "error_details": "OpenAI API密钥应以sk-开头",
  "field": "api_key",
  "recovery_suggestions": [
    "请检查openai的API密钥格式",
    "正确的API密钥应以sk-开头",
    "访问openai官网确认API密钥格式"
  ],
  "recovery_guide": {
    "error_summary": "API密钥格式错误: 应以sk-开头",
    "error_type": "invalid_api_key_format",
    "severity": "medium",
    "immediate_actions": [
      "请检查openai的API密钥格式",
      "正确的API密钥应以sk-开头"
    ],
    "detailed_steps": [...],
    "additional_resources": [
      "OpenAI API密钥获取: https://platform.openai.com/api-keys"
    ]
  },
  "recoverable": true
}
```

## 常见错误场景

### 场景1: 缺少必需字段

**错误信息**: "缺少必需字段: api_key"

**恢复建议**:
1. 请在AI配置中提供api_key字段
2. 检查前端AssistantContext是否正确配置
3. 确保选择的AI助理包含完整配置信息

### 场景2: 不支持的AI提供商

**错误信息**: "不支持的AI提供商: azure"

**恢复建议**:
1. 请使用支持的AI提供商: openai, anthropic, google, ollama
2. 检查前端AI助理配置中的provider字段
3. 确保provider字段拼写正确（小写）

### 场景3: API密钥格式错误

**错误信息**: "API密钥格式错误: 应以sk-开头"

**恢复建议**:
1. 请检查openai的API密钥格式
2. 正确的API密钥应以sk-开头
3. 访问openai官网确认API密钥格式

### 场景4: 缺少必需的Python库

**错误信息**: "缺少必需的Python库: openai"

**恢复建议**:
1. 运行命令安装: `pip install openai`
2. 或安装完整依赖: `pip install -r requirements.txt`
3. 确保Python环境中已安装openai
4. 重启后端服务以加载新安装的库

### 场景5: API密钥未授权

**错误信息**: "API密钥验证失败"

**恢复建议**:
1. 检查openai的API密钥是否正确
2. 确保API密钥没有过期
3. 访问openai官网验证API密钥状态
4. 尝试重新生成API密钥
5. 检查API密钥是否有正确的权限

### 场景6: API配额已超限

**错误信息**: "API配额已超限或权限不足"

**恢复建议**:
1. 检查openai账户的API配额使用情况
2. 等待配额重置或升级账户套餐
3. 检查API密钥是否有足够的权限
4. 考虑使用其他AI提供商作为备选

## 测试

运行测试套件：

```bash
python test_ai_config_error_handling.py
```

测试覆盖：
- ✅ 缺少必需字段
- ✅ 无效的提供商
- ✅ API密钥格式错误
- ✅ 无效的temperature参数
- ✅ 无效的max_tokens参数
- ✅ 无效的API端点
- ✅ 库可用性检查
- ✅ 正确的配置

## 集成到WebSocket服务器

在`tello_agent_backend.py`中集成错误处理：

```python
from ai_config_handler import AIConfigHandler

class TelloIntelligentAgent:
    def __init__(self, config):
        # 使用配置处理器
        self.ai_config_handler = AIConfigHandler()
    
    async def handle_websocket_message(self, websocket, message_data):
        if message_type == "set_ai_config":
            # 使用增强的错误处理
            result = await self.ai_config_handler.handle_ai_config(data)
            
            # 发送响应（包含详细错误信息）
            await websocket.send(json.dumps({
                "type": "ai_config_response",
                **result
            }))
```

## 前端集成

前端可以根据错误类型和恢复建议提供更好的用户体验：

```typescript
// 处理AI配置响应
const handleAIConfigResponse = (response) => {
  if (response.success) {
    showSuccess(response.message);
  } else {
    // 显示错误信息
    showError(response.error);
    
    // 显示恢复建议
    if (response.recovery_suggestions) {
      showRecoverySuggestions(response.recovery_suggestions);
    }
    
    // 根据错误类型采取不同的UI行动
    switch (response.error_type) {
      case 'missing_required_field':
        highlightField(response.field);
        break;
      case 'invalid_api_key_format':
        showAPIKeyFormatHelp(response.error_details);
        break;
      case 'library_not_installed':
        showLibraryInstallationGuide(response.recovery_guide);
        break;
    }
  }
};
```

## 最佳实践

1. **始终验证配置**: 在加载配置前进行完整验证
2. **提供清晰的错误信息**: 使用用户友好的语言描述错误
3. **给出可操作的建议**: 每个错误都应附带具体的恢复步骤
4. **记录详细日志**: 在服务器端记录完整的错误信息
5. **优雅降级**: 在某些错误情况下提供备选方案
6. **测试所有场景**: 确保所有错误类型都有适当的处理

## 扩展性

系统设计为可扩展的，可以轻松添加：

1. **新的错误类型**: 在`AIConfigErrorType`枚举中添加
2. **新的AI提供商**: 在验证规则中添加相应的配置
3. **自定义恢复建议**: 根据具体场景定制建议
4. **错误统计**: 收集和分析常见错误模式

## 相关文档

- [AI配置管理器文档](./AI_CONFIG_MANAGER_INTEGRATION.md)
- [Tello智能代理桥接系统](./TELLO_AGENT_BRIDGE.md)
- [WebSocket通信协议](./WEBSOCKET_PROTOCOL.md)

## 支持

如有问题或建议，请：
1. 查看详细日志获取更多信息
2. 运行测试套件验证系统状态
3. 参考恢复建议解决常见问题
4. 联系技术支持获取帮助
