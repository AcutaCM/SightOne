# 千问模型快速参考

## 快速配置

### 前端配置示例

```typescript
// OpenAI兼容接口（推荐）
const qwenConfig = {
  provider: 'qwen',
  model: 'qwen-vl-plus',
  apiKey: 'sk-your-dashscope-api-key',
  apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  temperature: 0.7,
  maxTokens: 2000
};

// DashScope SDK
const dashscopeConfig = {
  provider: 'dashscope',
  model: 'qwen-vl-max',
  apiKey: 'sk-your-dashscope-api-key',
  apiBase: 'https://dashscope.aliyuncs.com/api/v1',
  temperature: 0.7,
  maxTokens: 2000
};
```

### 后端配置示例

```python
# 使用AI配置处理器
from ai_config_handler import AIConfigHandler

handler = AIConfigHandler()

config = {
    'provider': 'qwen',
    'model': 'qwen-vl-plus',
    'api_key': 'sk-your-api-key',
    'temperature': 0.7,
    'max_tokens': 2000
}

result = await handler.handle_ai_config(config)
```

## 支持的模型

| 模型名称 | 视觉支持 | 适用场景 | 推荐度 |
|---------|---------|---------|--------|
| qwen-turbo | ❌ | 实时交互 | ⭐⭐⭐ |
| qwen-plus | ❌ | 日常使用 | ⭐⭐⭐⭐ |
| qwen-max | ❌ | 复杂任务 | ⭐⭐⭐⭐⭐ |
| qwen-vl-plus | ✅ | 视觉理解 | ⭐⭐⭐⭐ |
| qwen-vl-max | ✅ | 高级视觉 | ⭐⭐⭐⭐⭐ |
| qwen2-vl-7b-instruct | ✅ | 开源视觉 | ⭐⭐⭐ |
| qwen2-vl-72b-instruct | ✅ | 大规模视觉 | ⭐⭐⭐⭐⭐ |

## API密钥获取

1. 访问: https://dashscope.console.aliyun.com/apiKey
2. 登录阿里云账号
3. 创建API密钥
4. 复制密钥（格式：`sk-xxxxxxxx`）

## 常用命令

### 安装依赖

```bash
# OpenAI兼容接口
pip install openai

# DashScope SDK
pip install dashscope
```

### 测试配置

```bash
# 运行千问集成测试
python test_qwen_integration.py

# 运行完整错误处理测试
python test_ai_config_error_handling.py
```

### 验证API连接

```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-turbo","messages":[{"role":"user","content":"你好"}]}'
```

## 参数建议

### temperature（温度）

- **0.3-0.5**: 精确命令解析
- **0.7**: 平衡模式（推荐）
- **1.0-1.5**: 灵活理解

### max_tokens（最大输出）

- **1000**: 简单命令
- **2000**: 标准命令（推荐）
- **4000**: 复杂任务

## 错误代码

| 错误类型 | 说明 | 解决方案 |
|---------|------|---------|
| `invalid_provider` | 提供商无效 | 使用 `qwen` 或 `dashscope` |
| `invalid_api_key_format` | API密钥格式错误 | 确保以 `sk-` 开头且长度≥20 |
| `library_not_installed` | 库未安装 | 运行 `pip install openai` 或 `pip install dashscope` |
| `api_key_unauthorized` | API密钥未授权 | 检查密钥是否正确和有效 |
| `api_key_quota_exceeded` | 配额超限 | 检查配额或升级套餐 |

## 性能优化

### 模型选择

```python
# 实时交互 - 使用 qwen-turbo
config = {'provider': 'qwen', 'model': 'qwen-turbo'}

# 复杂任务 - 使用 qwen-max
config = {'provider': 'qwen', 'model': 'qwen-max'}

# 视觉任务 - 使用 qwen-vl-plus
config = {'provider': 'qwen', 'model': 'qwen-vl-plus'}
```

### 参数调优

```python
# 快速响应
config = {
    'temperature': 0.5,
    'max_tokens': 1000
}

# 高质量输出
config = {
    'temperature': 0.7,
    'max_tokens': 2000
}
```

## 常见问题

### Q: 如何选择 qwen 还是 dashscope？

**A**: 推荐使用 `qwen`（OpenAI兼容接口）
- 更简单易用
- 代码兼容性好
- 适合大多数场景

### Q: API密钥在哪里获取？

**A**: https://dashscope.console.aliyun.com/apiKey

### Q: 支持哪些视觉模型？

**A**: 
- qwen-vl-plus
- qwen-vl-max
- qwen2-vl-7b-instruct
- qwen2-vl-72b-instruct

### Q: 如何测试配置是否正确？

**A**: 运行测试脚本
```bash
python test_qwen_integration.py
```

### Q: 配额不足怎么办？

**A**: 
1. 检查配额使用情况
2. 等待配额重置
3. 升级账户套餐
4. 优化调用频率

## 相关链接

- **官方文档**: https://help.aliyun.com/zh/dashscope/
- **API密钥**: https://dashscope.console.aliyun.com/apiKey
- **模型列表**: https://help.aliyun.com/zh/dashscope/developer-reference/model-square
- **价格说明**: https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-metering-and-billing
- **详细指南**: [QWEN_INTEGRATION_GUIDE.md](./QWEN_INTEGRATION_GUIDE.md)
- **错误处理**: [AI_CONFIG_ERROR_HANDLING.md](./AI_CONFIG_ERROR_HANDLING.md)

## 示例代码

### 完整配置流程

```python
import asyncio
from ai_config_handler import AIConfigHandler

async def setup_qwen():
    # 创建处理器
    handler = AIConfigHandler()
    
    # 配置千问
    config = {
        'provider': 'qwen',
        'model': 'qwen-vl-plus',
        'api_key': 'sk-your-api-key',
        'temperature': 0.7,
        'max_tokens': 2000
    }
    
    # 加载配置
    result = await handler.handle_ai_config(config)
    
    if result['success']:
        print("✅ 配置成功")
        print(f"模型: {result['data']['model']}")
        print(f"视觉支持: {result['data']['supports_vision']}")
    else:
        print(f"❌ 配置失败: {result['error']}")
        print("恢复建议:")
        for suggestion in result.get('recovery_suggestions', []):
            print(f"  - {suggestion}")

asyncio.run(setup_qwen())
```

### 命令解析示例

```python
from qwen_command_parser import QwenCommandParser

# 提取命令
response = """
```json
[
  {"action": "takeoff", "parameters": {}, "description": "起飞"},
  {"action": "move_forward", "parameters": {"distance": 100}, "description": "前进"}
]
```
"""

commands = QwenCommandParser.extract_commands_from_response(response)
print(f"提取了 {len(commands)} 个命令")
```

---

**更新时间**: 2024-11-11  
**版本**: v1.0.0
