# 千问模型集成指南

## 概述

本指南介绍如何在Tello智能代理系统中集成和使用阿里云千问（Qwen）系列模型。千问模型支持强大的自然语言理解和视觉识别能力，非常适合无人机命令解析任务。

## 支持的千问模型

### 文本模型
- `qwen-turbo`: 快速响应，适合实时交互
- `qwen-plus`: 平衡性能和成本
- `qwen-max`: 最强性能，适合复杂任务

### 视觉模型（支持图像理解）
- `qwen-vl-plus`: 视觉理解增强版
- `qwen-vl-max`: 最强视觉理解能力
- `qwen2-vl-7b-instruct`: 开源视觉模型
- `qwen2-vl-72b-instruct`: 大规模视觉模型

## 快速开始

### 1. 获取API密钥

1. 访问阿里云DashScope控制台: https://dashscope.console.aliyun.com/
2. 注册/登录阿里云账号
3. 进入API密钥管理页面: https://dashscope.console.aliyun.com/apiKey
4. 创建新的API密钥
5. 复制API密钥（格式：`sk-xxxxxxxxxxxxxxxx`）

### 2. 安装依赖

#### 方式1: 使用OpenAI兼容接口（推荐）

```bash
pip install openai
```

#### 方式2: 使用DashScope SDK

```bash
pip install dashscope
```

### 3. 配置千问模型

#### 前端配置（AssistantContext）

```typescript
// 在前端AI助理配置中添加千问模型
const qwenAssistant = {
  id: 'qwen-assistant',
  name: '千问助手',
  provider: 'qwen',  // 使用OpenAI兼容接口
  model: 'qwen-vl-plus',
  apiKey: 'sk-your-dashscope-api-key',
  apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  temperature: 0.7,
  maxTokens: 2000
};
```

#### 后端配置

后端会自动处理千问模型的配置，无需额外设置。

### 4. 发送AI配置到后端

```typescript
// 通过WebSocket发送AI配置
const configMessage = {
  type: 'set_ai_config',
  data: {
    provider: 'qwen',
    model: 'qwen-vl-plus',
    api_key: 'sk-your-dashscope-api-key',
    api_base: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    temperature: 0.7,
    max_tokens: 2000
  }
};

websocket.send(JSON.stringify(configMessage));
```

### 5. 使用千问解析命令

配置完成后，可以直接发送自然语言命令：

```typescript
const commandMessage = {
  type: 'natural_language_command',
  data: {
    command: '起飞后向前飞行100厘米，然后顺时针旋转90度'
  }
};

websocket.send(JSON.stringify(commandMessage));
```

## 两种接入方式对比

### OpenAI兼容接口（推荐）

**优点：**
- 使用标准OpenAI SDK，代码兼容性好
- 易于从OpenAI迁移
- 支持流式输出
- 文档完善

**缺点：**
- 功能相对基础
- 部分高级功能不支持

**配置示例：**
```json
{
  "provider": "qwen",
  "model": "qwen-vl-plus",
  "api_key": "sk-xxx",
  "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1"
}
```

### DashScope SDK

**优点：**
- 官方SDK，功能完整
- 支持更多高级功能
- 性能优化更好
- 支持批量调用

**缺点：**
- 需要额外安装SDK
- API接口与OpenAI不同
- 学习成本稍高

**配置示例：**
```json
{
  "provider": "dashscope",
  "model": "qwen-vl-max",
  "api_key": "sk-xxx",
  "api_base": "https://dashscope.aliyuncs.com/api/v1"
}
```

## 模型选择建议

### 实时命令解析
推荐使用 `qwen-turbo` 或 `qwen-plus`
- 响应速度快
- 成本较低
- 满足基本命令解析需求

### 复杂场景理解
推荐使用 `qwen-max`
- 理解能力强
- 支持复杂指令
- 适合多步骤任务规划

### 视觉辅助控制
推荐使用 `qwen-vl-plus` 或 `qwen-vl-max`
- 支持图像理解
- 可以结合无人机视频流
- 实现视觉引导的命令解析

## 配置参数说明

### 必需参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| provider | string | AI提供商标识 | `"qwen"` 或 `"dashscope"` |
| model | string | 模型名称 | `"qwen-vl-plus"` |
| api_key | string | DashScope API密钥 | `"sk-xxx"` |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| api_base | string | 自动设置 | API端点URL |
| temperature | float | 0.7 | 温度参数（0-2） |
| max_tokens | int | 2000 | 最大输出token数 |

### temperature参数建议

- **0.3-0.5**: 保守模式，适合精确命令解析
- **0.7**: 平衡模式（推荐），适合大多数场景
- **1.0-1.5**: 创造性模式，适合需要灵活理解的场景

## 错误处理

### 常见错误及解决方案

#### 1. API密钥无效

**错误信息**: "API密钥验证失败"

**解决方案**:
1. 检查API密钥是否正确复制
2. 确认API密钥未过期
3. 验证API密钥是否有足够的配额
4. 访问DashScope控制台确认密钥状态

#### 2. 模型不存在

**错误信息**: "指定的模型不存在"

**解决方案**:
1. 检查模型名称拼写
2. 确认模型在您的区域可用
3. 参考官方文档确认模型名称
4. 尝试使用其他可用模型

#### 3. 配额超限

**错误信息**: "API配额已超限"

**解决方案**:
1. 检查DashScope控制台的配额使用情况
2. 等待配额重置（通常每月重置）
3. 升级账户套餐
4. 优化调用频率

#### 4. 网络连接失败

**错误信息**: "网络连接失败"

**解决方案**:
1. 检查网络连接
2. 确认防火墙设置
3. 验证API端点URL
4. 尝试使用代理

## 性能优化

### 1. 选择合适的模型

- 简单任务使用 `qwen-turbo`
- 复杂任务使用 `qwen-max`
- 根据实际需求平衡性能和成本

### 2. 优化提示词

- 使用清晰、具体的指令
- 提供足够的上下文信息
- 避免过于复杂的嵌套逻辑

### 3. 控制输出长度

- 设置合理的 `max_tokens` 值
- 对于命令解析，2000 tokens通常足够

### 4. 缓存常用结果

- 对于重复的命令模式，可以缓存解析结果
- 减少API调用次数

## 成本估算

千问模型采用按token计费：

| 模型 | 输入价格 | 输出价格 | 适用场景 |
|------|---------|---------|---------|
| qwen-turbo | 较低 | 较低 | 实时交互 |
| qwen-plus | 中等 | 中等 | 日常使用 |
| qwen-max | 较高 | 较高 | 复杂任务 |
| qwen-vl-plus | 中等 | 中等 | 视觉理解 |
| qwen-vl-max | 较高 | 较高 | 高级视觉 |

**成本优化建议**:
1. 优先使用 `qwen-turbo` 或 `qwen-plus`
2. 控制 `max_tokens` 参数
3. 实现请求缓存机制
4. 批量处理相似请求

## 测试验证

### 1. 测试API连接

```python
from ai_config_handler import AIConfigHandler
import asyncio

async def test_qwen():
    handler = AIConfigHandler()
    
    config = {
        'provider': 'qwen',
        'model': 'qwen-vl-plus',
        'api_key': 'sk-your-api-key',
        'temperature': 0.7,
        'max_tokens': 2000
    }
    
    result = await handler.handle_ai_config(config)
    print(result)

asyncio.run(test_qwen())
```

### 2. 测试命令解析

```python
from qwen_command_parser import QwenCommandParser

# 测试命令提取
test_response = """
```json
[
  {
    "action": "takeoff",
    "parameters": {},
    "description": "起飞"
  }
]
```
"""

commands = QwenCommandParser.extract_commands_from_response(test_response)
print(f"提取的命令: {commands}")
```

## 最佳实践

### 1. 安全性

- 不要在代码中硬编码API密钥
- 使用环境变量或配置文件
- 定期轮换API密钥
- 限制API密钥的权限范围

### 2. 可靠性

- 实现重试机制
- 添加超时控制
- 处理所有可能的错误
- 提供降级方案

### 3. 可维护性

- 记录详细的日志
- 监控API调用情况
- 定期检查配额使用
- 保持SDK版本更新

### 4. 用户体验

- 提供清晰的错误提示
- 显示配置状态
- 支持配置热更新
- 提供配置验证

## 故障排查

### 检查清单

- [ ] API密钥是否正确
- [ ] 网络连接是否正常
- [ ] 模型名称是否正确
- [ ] 配额是否充足
- [ ] SDK版本是否最新
- [ ] 配置参数是否有效
- [ ] 日志中是否有错误信息

### 调试技巧

1. **启用详细日志**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

2. **测试API连接**
```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-turbo","messages":[{"role":"user","content":"你好"}]}'
```

3. **检查配置**
```python
# 打印当前配置
config = handler.get_config()
print(f"Provider: {config.provider}")
print(f"Model: {config.model}")
print(f"API Base: {config.api_base}")
```

## 相关资源

### 官方文档
- DashScope官网: https://dashscope.aliyun.com/
- API文档: https://help.aliyun.com/zh/dashscope/
- 模型列表: https://help.aliyun.com/zh/dashscope/developer-reference/model-square
- 价格说明: https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-metering-and-billing

### 社区支持
- 钉钉群: 搜索"DashScope"
- GitHub: https://github.com/aliyun/alibabacloud-dashscope-sdk
- 论坛: https://developer.aliyun.com/ask/

### 示例代码
- OpenAI兼容示例: 参考 `qwen_command_parser.py`
- DashScope SDK示例: 参考官方文档
- 完整集成示例: 参考 `ai_config_handler.py`

## 更新日志

### v1.0.0 (2024-11-11)
- ✅ 添加千问模型支持
- ✅ 实现OpenAI兼容接口
- ✅ 实现DashScope SDK支持
- ✅ 添加错误处理和恢复建议
- ✅ 完善文档和示例

## 反馈与支持

如有问题或建议，请：
1. 查看本文档的故障排查部分
2. 检查系统日志获取详细信息
3. 参考官方文档
4. 联系技术支持

---

**注意**: 千问模型由阿里云提供，使用前请确保已阅读并同意相关服务条款。
