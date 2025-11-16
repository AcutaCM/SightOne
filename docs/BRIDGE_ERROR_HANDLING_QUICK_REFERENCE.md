# 桥接错误处理快速参考

## 快速开始

### 导入

```python
from bridge_error_handler import (
    get_error_handler, get_recovery_manager,
    BridgeError, ErrorCode, ErrorCategory, ErrorSeverity
)
```

### 基本使用

```python
# 获取处理器
handler = get_error_handler()

# 创建错误
error = handler.create_ai_config_error("AI未配置")

# 处理错误
response = handler.handle_error(error)
```

## 错误代码速查

| 代码 | 名称 | 类别 | 说明 |
|------|------|------|------|
| 1000 | AI_NOT_CONFIGURED | AI配置 | AI未配置 |
| 1001 | AI_CONFIG_INVALID | AI配置 | AI配置无效 |
| 1100 | DRONE_NOT_CONNECTED | 连接 | 无人机未连接 |
| 1101 | BRIDGE_NOT_CONNECTED | 连接 | 桥接未连接 |
| 1103 | CONNECTION_LOST | 连接 | 连接丢失 |
| 1104 | CONNECTION_TIMEOUT | 连接 | 连接超时 |
| 1201 | COMMAND_EXECUTION_FAILED | 命令执行 | 命令执行失败 |
| 1202 | COMMAND_TIMEOUT | 命令执行 | 命令超时 |
| 1300 | BRIDGE_REQUEST_FAILED | 桥接通信 | 桥接请求失败 |
| 1302 | BRIDGE_TIMEOUT | 桥接通信 | 桥接超时 |
| 1400 | DRONE_LOW_BATTERY | 无人机硬件 | 电量过低 |
| 1500 | PARAMETER_INVALID | 验证 | 参数无效 |
| 1501 | MESSAGE_FORMAT_INVALID | 验证 | 消息格式无效 |
| 1700 | LIBRARY_NOT_AVAILABLE | 系统 | 库不可用 |

## 快捷方法

### 创建错误

```python
# AI配置错误
handler.create_ai_config_error(message, details)

# 无人机错误
handler.create_drone_error(message, details, code)

# 桥接错误
handler.create_bridge_error(message, details)

# 命令错误
handler.create_command_error(message, details, command)
```

### 异常分类

```python
try:
    # 代码
except Exception as e:
    error = handler.classify_exception(e, context)
    response = handler.handle_error(error)
```

### 错误恢复

```python
recovery_manager = get_recovery_manager()

# 注册策略
async def strategy(error, context):
    # 恢复逻辑
    return True  # 成功

recovery_manager.register_strategy(ErrorCode.CONNECTION_LOST, strategy)

# 尝试恢复
success = await recovery_manager.attempt_recovery(error)
```

## WebSocket消息

### 获取错误统计

```json
{"type": "get_error_statistics"}
```

### 获取最近错误

```json
{"type": "get_recent_errors", "data": {"limit": 10}}
```

### 清空历史

```json
{"type": "clear_error_history"}
```

## 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": 1000,
    "category": "ai_config",
    "severity": "high",
    "message": "AI未配置",
    "details": "...",
    "context": {},
    "recovery_suggestions": ["..."],
    "recoverable": true,
    "timestamp": "2025-11-11T10:00:00"
  },
  "user_message": "[AI_CONFIG] AI未配置\n建议: ..."
}
```

## 常用模式

### 模式1: 简单错误处理

```python
if not self.ai_configured:
    error = handler.create_ai_config_error("AI未配置")
    return handler.handle_error(error)
```

### 模式2: 异常捕获

```python
try:
    result = await operation()
except Exception as e:
    return self._handle_exception(e, {"op": "operation"})
```

### 模式3: 带恢复的错误处理

```python
try:
    result = await operation()
except Exception as e:
    error = handler.classify_exception(e)
    
    # 尝试恢复
    if await recovery_manager.attempt_recovery(error):
        # 重试
        result = await operation()
    else:
        return handler.handle_error(error)
```

### 模式4: 错误回调

```python
def on_error(error):
    if error.severity == ErrorSeverity.CRITICAL:
        trigger_emergency()

handler.register_callback(on_error)
```

## 严重程度指南

| 级别 | 使用场景 | 示例 |
|------|----------|------|
| LOW | 不影响功能 | 参数警告 |
| MEDIUM | 部分功能受影响 | 命令失败 |
| HIGH | 核心功能受影响 | 连接丢失 |
| CRITICAL | 系统无法运行 | 库缺失 |

## 恢复建议模板

```python
recovery_suggestions=[
    "立即行动：...",      # 第一步
    "检查配置：...",      # 第二步
    "联系支持：...",      # 最后手段
]
```

## 调试技巧

### 查看错误统计

```python
stats = handler.get_error_statistics()
print(f"总错误: {stats['total_errors']}")
print(f"最常见: {stats['most_common_category']}")
```

### 查看最近错误

```python
errors = handler.get_recent_errors(5)
for e in errors:
    print(f"[{e['category']}] {e['message']}")
```

### 清空历史

```python
handler.clear_history()
```

## 性能优化

- 限制错误历史大小（默认100）
- 使用异步恢复策略
- 避免在回调中执行耗时操作
- 定期清理错误历史

## 常见问题

**Q: 如何自定义错误代码？**
A: 在ErrorCode枚举中添加新代码

**Q: 如何禁用错误恢复？**
A: 设置`recoverable=False`

**Q: 如何获取错误详情？**
A: 使用`error.to_dict()`

**Q: 如何生成用户消息？**
A: 使用`error.to_user_message()`

## 相关文档

- [完整指南](./BRIDGE_ERROR_HANDLING_GUIDE.md)
- [API参考](./BRIDGE_ERROR_HANDLING_API.md)
- [测试示例](../python/test_bridge_error_handler.py)
