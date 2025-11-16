# 桥接系统综合错误处理指南

## 概述

桥接系统综合错误处理模块提供了完整的错误分类、处理、恢复和监控功能，确保系统在遇到各种错误情况时能够优雅地处理并提供用户友好的反馈。

## 核心组件

### 1. BridgeErrorHandler（错误处理器）

负责错误的创建、分类、处理和统计。

**主要功能：**
- 错误分类和标准化
- 错误历史记录
- 错误统计分析
- 错误回调机制

### 2. ErrorRecoveryManager（恢复管理器）

负责错误的自动恢复和重试策略。

**主要功能：**
- 恢复策略注册
- 自动恢复尝试
- 恢复次数限制
- 恢复状态跟踪

### 3. BridgeError（错误数据类）

标准化的错误数据结构。

**字段：**
- `code`: 错误代码（ErrorCode枚举）
- `category`: 错误类别（ErrorCategory枚举）
- `severity`: 严重程度（ErrorSeverity枚举）
- `message`: 错误消息
- `details`: 详细信息
- `context`: 上下文数据
- `recovery_suggestions`: 恢复建议列表
- `recoverable`: 是否可恢复
- `timestamp`: 时间戳

## 错误分类

### 错误类别（ErrorCategory）

| 类别 | 说明 | 示例 |
|------|------|------|
| AI_CONFIG | AI配置错误 | AI未配置、配置无效 |
| CONNECTION | 连接错误 | 无人机未连接、桥接断开 |
| COMMAND_EXECUTION | 命令执行错误 | 命令无效、执行失败 |
| BRIDGE_COMMUNICATION | 桥接通信错误 | 请求失败、响应无效 |
| DRONE_HARDWARE | 无人机硬件错误 | 电量低、传感器故障 |
| VALIDATION | 验证错误 | 参数无效、格式错误 |
| TIMEOUT | 超时错误 | 连接超时、命令超时 |
| NETWORK | 网络错误 | 网络不可达、DNS失败 |
| SYSTEM | 系统错误 | 库缺失、资源耗尽 |
| UNKNOWN | 未知错误 | 其他未分类错误 |

### 错误严重程度（ErrorSeverity）

| 级别 | 说明 | 影响 |
|------|------|------|
| LOW | 低 | 不影响核心功能 |
| MEDIUM | 中 | 影响部分功能 |
| HIGH | 高 | 影响核心功能 |
| CRITICAL | 严重 | 系统无法运行 |

### 错误代码（ErrorCode）

错误代码按类别分组，范围如下：

- **1000-1099**: AI配置错误
- **1100-1199**: 连接错误
- **1200-1299**: 命令执行错误
- **1300-1399**: 桥接通信错误
- **1400-1499**: 无人机硬件错误
- **1500-1599**: 验证错误
- **1600-1699**: 网络错误
- **1700-1799**: 系统错误
- **1800-1899**: 未知错误

## 使用方法

### 1. 基本错误处理

```python
from bridge_error_handler import get_error_handler, BridgeError, ErrorCode, ErrorCategory, ErrorSeverity

# 获取全局错误处理器
handler = get_error_handler()

# 创建错误
error = BridgeError(
    code=ErrorCode.AI_NOT_CONFIGURED,
    category=ErrorCategory.AI_CONFIG,
    severity=ErrorSeverity.HIGH,
    message="AI未配置",
    details="请先通过WebSocket发送AI配置",
    recovery_suggestions=[
        "在前端选择一个AI助理",
        "确保AI助理包含完整配置",
        "通过WebSocket发送AI配置到3004端口"
    ],
    recoverable=True
)

# 处理错误
response = handler.handle_error(error)
# 返回: {"success": False, "error": {...}, "user_message": "..."}
```

### 2. 异常分类

```python
try:
    # 可能抛出异常的代码
    await some_operation()
except Exception as e:
    # 自动分类异常
    error = handler.classify_exception(e, context={"operation": "some_operation"})
    response = handler.handle_error(error)
    return response
```

### 3. 快捷错误创建

```python
# AI配置错误
ai_error = handler.create_ai_config_error(
    "AI配置无效",
    "缺少API密钥"
)

# 无人机错误
drone_error = handler.create_drone_error(
    "无人机电量过低",
    "当前电量: 15%",
    ErrorCode.DRONE_LOW_BATTERY
)

# 桥接错误
bridge_error = handler.create_bridge_error(
    "桥接连接失败",
    "无法连接到3002端口"
)

# 命令错误
command_error = handler.create_command_error(
    "命令执行失败",
    "参数无效",
    command="takeoff"
)
```

### 4. 错误恢复

```python
from bridge_error_handler import get_recovery_manager

# 获取恢复管理器
recovery_manager = get_recovery_manager()

# 注册恢复策略
async def reconnect_strategy(error: BridgeError, context: dict) -> bool:
    """重连恢复策略"""
    # 执行重连逻辑
    success = await reconnect_to_bridge()
    return success

recovery_manager.register_strategy(
    ErrorCode.CONNECTION_LOST,
    reconnect_strategy
)

# 尝试恢复
success = await recovery_manager.attempt_recovery(error, context={})
if success:
    print("错误已恢复")
else:
    print("恢复失败")
```

### 5. 错误回调

```python
# 注册错误回调
def on_error(error: BridgeError):
    """错误回调函数"""
    if error.severity == ErrorSeverity.CRITICAL:
        # 处理严重错误
        trigger_emergency_procedure()
    
    # 记录到日志
    logger.error(f"错误: {error.message}")

handler.register_callback(on_error)
```

### 6. 错误统计

```python
# 获取错误统计
stats = handler.get_error_statistics()
print(f"总错误数: {stats['total_errors']}")
print(f"按类别统计: {stats['by_category']}")
print(f"最常见类别: {stats['most_common_category']}")

# 获取最近错误
recent_errors = handler.get_recent_errors(limit=10)
for error in recent_errors:
    print(f"[{error['category']}] {error['message']}")

# 清空历史
handler.clear_history()
```

## 集成到TelloIntelligentAgent

### 初始化

```python
class TelloIntelligentAgent:
    def __init__(self, config: TelloAgentConfig):
        # 初始化错误处理器
        if BRIDGE_ERROR_HANDLER_AVAILABLE:
            self.error_handler = get_error_handler()
            self.recovery_manager = get_recovery_manager()
            
            # 注册错误回调
            self.error_handler.register_callback(self._on_error_callback)
            
            # 注册恢复策略
            self._register_recovery_strategies()
```

### 错误处理

```python
async def handle_ai_config(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        # 验证配置
        if not config_data.get('api_key'):
            error = BridgeError(
                code=ErrorCode.DATA_VALIDATION_FAILED,
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.MEDIUM,
                message="缺少API密钥",
                recovery_suggestions=["提供有效的API密钥"],
                recoverable=True
            )
            return self.error_handler.handle_error(error)
        
        # 处理配置...
        
    except Exception as e:
        return self._handle_exception(e, {"operation": "handle_ai_config"})
```

### 异常处理辅助方法

```python
def _handle_exception(self, exception: Exception, context: Dict[str, Any] = None) -> Dict[str, Any]:
    """处理异常并返回错误响应"""
    if self.error_handler:
        error = self.error_handler.classify_exception(exception, context)
        return self.error_handler.handle_error(error)
    else:
        # 降级处理
        return {
            "success": False,
            "error": str(exception),
            "user_message": f"操作失败: {str(exception)}"
        }
```

## WebSocket消息类型

### 获取错误统计

```json
{
  "type": "get_error_statistics"
}
```

**响应：**
```json
{
  "type": "get_error_statistics_response",
  "success": true,
  "data": {
    "total_errors": 10,
    "by_category": {
      "ai_config": 3,
      "connection": 2,
      "command_execution": 5
    },
    "recent_errors": 10,
    "most_common_category": "command_execution"
  }
}
```

### 获取最近错误

```json
{
  "type": "get_recent_errors",
  "data": {
    "limit": 10
  }
}
```

**响应：**
```json
{
  "type": "get_recent_errors_response",
  "success": true,
  "data": [
    {
      "code": 1000,
      "category": "ai_config",
      "severity": "high",
      "message": "AI未配置",
      "details": "...",
      "recovery_suggestions": ["..."],
      "timestamp": "2025-11-11T10:00:00"
    }
  ]
}
```

### 清空错误历史

```json
{
  "type": "clear_error_history"
}
```

**响应：**
```json
{
  "type": "clear_error_history_response",
  "success": true,
  "message": "错误历史记录已清空"
}
```

### 错误广播

当发生错误时，系统会自动广播到所有连接的WebSocket客户端：

```json
{
  "type": "error",
  "data": {
    "code": 1000,
    "category": "ai_config",
    "severity": "high",
    "message": "AI未配置",
    "details": "请先通过WebSocket发送AI配置",
    "context": {},
    "recovery_suggestions": [
      "在前端选择一个AI助理",
      "确保AI助理包含完整配置",
      "通过WebSocket发送AI配置到3004端口"
    ],
    "recoverable": true,
    "timestamp": "2025-11-11T10:00:00"
  }
}
```

## 最佳实践

### 1. 错误创建

- 使用明确的错误代码和类别
- 提供详细的错误消息和上下文
- 包含实用的恢复建议
- 正确设置严重程度

### 2. 异常处理

- 优先使用`classify_exception`自动分类
- 提供有意义的上下文信息
- 记录完整的错误堆栈
- 使用`_handle_exception`辅助方法

### 3. 错误恢复

- 为常见错误注册恢复策略
- 限制恢复尝试次数
- 记录恢复过程
- 在恢复失败时通知用户

### 4. 用户体验

- 使用用户友好的错误消息
- 提供清晰的恢复步骤
- 避免技术术语
- 及时反馈错误状态

### 5. 监控和调试

- 定期检查错误统计
- 分析错误趋势
- 识别常见问题
- 优化恢复策略

## 常见错误场景

### AI配置错误

```python
# 场景：AI未配置
error = BridgeError(
    code=ErrorCode.AI_NOT_CONFIGURED,
    category=ErrorCategory.AI_CONFIG,
    severity=ErrorSeverity.HIGH,
    message="AI未配置",
    recovery_suggestions=[
        "选择AI助理",
        "发送AI配置"
    ]
)
```

### 连接错误

```python
# 场景：桥接连接丢失
error = BridgeError(
    code=ErrorCode.CONNECTION_LOST,
    category=ErrorCategory.CONNECTION,
    severity=ErrorSeverity.HIGH,
    message="桥接连接丢失",
    recovery_suggestions=[
        "检查3002端口服务",
        "尝试重新连接"
    ]
)
```

### 命令超时

```python
# 场景：命令执行超时
error = BridgeError(
    code=ErrorCode.COMMAND_TIMEOUT,
    category=ErrorCategory.TIMEOUT,
    severity=ErrorSeverity.MEDIUM,
    message="命令执行超时",
    context={"command": "takeoff", "timeout": 30},
    recovery_suggestions=[
        "增加超时时间",
        "检查网络延迟",
        "重试命令"
    ]
)
```

### 无人机硬件错误

```python
# 场景：电量过低
error = BridgeError(
    code=ErrorCode.DRONE_LOW_BATTERY,
    category=ErrorCategory.DRONE_HARDWARE,
    severity=ErrorSeverity.HIGH,
    message="无人机电量过低",
    details="当前电量: 15%",
    recovery_suggestions=[
        "立即降落",
        "更换电池"
    ]
)
```

## 故障排除

### 问题：错误处理器不可用

**原因：** `bridge_error_handler.py`未正确导入

**解决方案：**
1. 检查文件是否存在
2. 确认Python路径配置
3. 查看导入错误日志

### 问题：恢复策略不执行

**原因：** 恢复策略未注册或错误代码不匹配

**解决方案：**
1. 确认策略已注册
2. 检查错误代码是否正确
3. 验证错误可恢复标志

### 问题：错误统计不准确

**原因：** 错误未通过`handle_error`处理

**解决方案：**
1. 确保所有错误都调用`handle_error`
2. 检查错误处理流程
3. 清空历史后重新统计

## 总结

桥接系统综合错误处理模块提供了：

✅ **完整的错误分类体系** - 10个错误类别，4个严重级别，100+错误代码

✅ **自动异常分类** - 智能识别常见异常类型

✅ **错误恢复机制** - 可注册自定义恢复策略

✅ **用户友好消息** - 清晰的错误描述和恢复建议

✅ **错误统计分析** - 实时监控错误趋势

✅ **WebSocket集成** - 实时错误广播和查询

通过使用这个错误处理系统，可以显著提高系统的健壮性和用户体验。
