# 监控和日志系统指南

## 概述

监控和日志系统为Tello智能代理桥接系统提供全面的性能监控、健康检查、结构化日志记录和AI配置状态监控功能。

## 核心组件

### 1. 性能监控器 (PerformanceMonitor)

性能监控器收集和管理系统性能指标。

#### 支持的指标类型

- **计数器 (Counter)**: 累计计数，如请求总数、错误总数
- **仪表 (Gauge)**: 瞬时值，如CPU使用率、内存使用量
- **计时器 (Timer)**: 持续时间测量，如命令执行时间、API响应时间

#### 使用示例

```python
from monitoring_system import PerformanceMonitor

# 创建性能监控器
monitor = PerformanceMonitor(history_size=1000)

# 增加计数器
monitor.increment_counter("api_requests", 1, tags={"endpoint": "/api/drone/status"})

# 设置仪表值
monitor.set_gauge("cpu_usage", 45.5, unit="%")
monitor.set_gauge("memory_usage", 512.3, unit="MB")

# 记录计时器
monitor.record_timer("command_execution", 125.3, tags={"command": "takeoff"})

# 获取指标
counter_value = monitor.get_counter("api_requests")
gauge_value = monitor.get_gauge("cpu_usage")
timer_stats = monitor.get_timer_stats("command_execution")

# 获取所有指标
all_metrics = monitor.get_all_metrics()
```

#### 计时器统计信息

计时器自动计算以下统计信息：
- `count`: 记录次数
- `min`: 最小值
- `max`: 最大值
- `mean`: 平均值
- `median`: 中位数
- `p95`: 95百分位数
- `p99`: 99百分位数

### 2. 健康检查器 (HealthChecker)

健康检查器执行系统组件的健康检查。

#### 健康状态

- `HEALTHY`: 健康
- `DEGRADED`: 降级（部分功能受影响）
- `UNHEALTHY`: 不健康
- `UNKNOWN`: 未知

#### 使用示例

```python
from monitoring_system import HealthChecker, HealthCheckResult, HealthStatus

# 创建健康检查器
checker = HealthChecker()

# 注册健康检查函数
async def check_bridge_connection():
    """检查桥接连接"""
    # 执行检查逻辑
    is_connected = await bridge_client.health_check()
    
    return HealthCheckResult(
        component="bridge_connection",
        status=HealthStatus.HEALTHY if is_connected else HealthStatus.UNHEALTHY,
        message="桥接连接正常" if is_connected else "桥接连接失败",
        details={"host": "localhost", "port": 3002}
    )

checker.register_check("bridge_connection", check_bridge_connection)

# 执行单个检查
result = await checker.check_component("bridge_connection")

# 执行所有检查
results = await checker.check_all()

# 获取整体状态
overall_status = checker.get_overall_status()

# 获取健康报告
report = checker.get_health_report()
```

#### 健康检查函数格式

健康检查函数可以返回以下格式：

1. **HealthCheckResult对象**（推荐）
```python
return HealthCheckResult(
    component="component_name",
    status=HealthStatus.HEALTHY,
    message="检查通过",
    details={"key": "value"}
)
```

2. **字典格式**
```python
return {
    "status": "healthy",
    "message": "检查通过",
    "details": {"key": "value"}
}
```

3. **布尔值**
```python
return True  # 健康
return False  # 不健康
```

### 3. 结构化日志记录器 (StructuredLogger)

结构化日志记录器提供JSON格式的结构化日志。

#### 使用示例

```python
from monitoring_system import StructuredLogger

# 创建日志记录器
logger = StructuredLogger("my_logger", log_file="app.log")

# 记录不同级别的日志
logger.debug("调试信息", module="test", function="test_function")
logger.info("信息日志", event="user_login", user_id="12345")
logger.warning("警告信息", warning_type="low_battery", battery_level=25)
logger.error("错误信息", error_code="E001", error_message="连接失败")
logger.critical("严重错误", error_code="C001", system="database")
```

#### 日志格式

所有日志以JSON格式输出：

```json
{
  "timestamp": "2024-01-15T10:30:45.123456",
  "level": "INFO",
  "message": "用户登录",
  "event": "user_login",
  "user_id": "12345"
}
```

### 4. AI配置监控器 (AIConfigMonitor)

AI配置监控器监控AI配置的状态和性能。

#### 使用示例

```python
from monitoring_system import AIConfigMonitor

# 创建AI配置监控器
monitor = AIConfigMonitor()

# 记录配置更新
monitor.record_config_update({
    "provider": "openai",
    "model": "gpt-4o",
    "supports_vision": True
})

# 记录解析结果
monitor.record_parsing_result(success=True, duration_ms=145.2)

# 获取配置状态
status = monitor.get_config_status()

# 获取配置历史
history = monitor.get_config_history(limit=10)
```

#### 配置状态信息

```python
{
    "configured": True,
    "current_config": {
        "provider": "openai",
        "model": "gpt-4o",
        "supports_vision": True,
        "configured_at": "2024-01-15T10:30:45"
    },
    "statistics": {
        "config_changes": 5,
        "parsing_success_count": 45,
        "parsing_failure_count": 5,
        "parsing_success_rate": 0.9,
        "avg_parsing_time_ms": 135.5,
        "max_parsing_time_ms": 250.0,
        "min_parsing_time_ms": 95.0
    }
}
```

### 5. 监控系统 (MonitoringSystem)

监控系统集成所有监控组件，提供统一的监控接口。

#### 使用示例

```python
from monitoring_system import MonitoringSystem

# 创建监控系统
monitoring = MonitoringSystem(log_file="monitoring.log")

# 注册健康检查
async def check_websocket():
    # 检查逻辑
    return HealthCheckResult(...)

monitoring.health_checker.register_check("websocket_server", check_websocket)

# 记录性能指标
monitoring.performance_monitor.increment_counter("commands_executed")
monitoring.performance_monitor.set_gauge("active_connections", 5)
monitoring.performance_monitor.record_timer("command_latency", 125.5)

# 记录AI配置
monitoring.ai_config_monitor.record_config_update({
    "provider": "openai",
    "model": "gpt-4o"
})

# 记录结构化日志
monitoring.structured_logger.info("系统启动", version="1.0.0")

# 启动定期监控
await monitoring.start_monitoring(interval=30.0)

# 获取完整状态
status = monitoring.get_full_status()

# 停止监控
await monitoring.stop_monitoring()
```

## 集成到Tello智能代理

### 1. 在tello_agent_backend.py中集成

```python
from monitoring_system import MonitoringSystem, HealthCheckResult, HealthStatus

class TelloIntelligentAgent:
    def __init__(self, config: TelloAgentConfig):
        # ... 现有初始化代码 ...
        
        # 初始化监控系统
        self.monitoring = MonitoringSystem(log_file="tello_agent_monitoring.log")
        
        # 注册健康检查
        self._register_health_checks()
        
        # 启动监控
        asyncio.create_task(self.monitoring.start_monitoring(interval=30.0))
    
    def _register_health_checks(self):
        """注册健康检查"""
        
        # WebSocket服务器健康检查
        async def check_websocket():
            return HealthCheckResult(
                component="websocket_server",
                status=HealthStatus.HEALTHY if self.websocket_clients else HealthStatus.DEGRADED,
                message=f"WebSocket连接数: {len(self.websocket_clients)}",
                details={"connections": len(self.websocket_clients)}
            )
        
        # 桥接客户端健康检查
        async def check_bridge():
            if not self.bridge_enabled:
                return HealthCheckResult(
                    component="bridge_client",
                    status=HealthStatus.UNKNOWN,
                    message="桥接模式未启用"
                )
            
            is_healthy = await self.bridge_client.health_check()
            return HealthCheckResult(
                component="bridge_client",
                status=HealthStatus.HEALTHY if is_healthy else HealthStatus.UNHEALTHY,
                message="桥接连接正常" if is_healthy else "桥接连接失败"
            )
        
        # AI配置健康检查
        async def check_ai_config():
            is_configured = self.ai_config_manager and self.ai_config_manager.is_configured()
            return HealthCheckResult(
                component="ai_config",
                status=HealthStatus.HEALTHY if is_configured else HealthStatus.UNHEALTHY,
                message="AI已配置" if is_configured else "AI未配置"
            )
        
        self.monitoring.health_checker.register_check("websocket_server", check_websocket)
        self.monitoring.health_checker.register_check("bridge_client", check_bridge)
        self.monitoring.health_checker.register_check("ai_config", check_ai_config)
    
    async def handle_websocket_message(self, websocket, message_data: Dict[str, Any]):
        """处理WebSocket消息（添加监控）"""
        start_time = time.time()
        message_type = message_data.get("type", "")
        
        try:
            # 增加请求计数
            self.monitoring.performance_monitor.increment_counter(
                "websocket_messages",
                tags={"type": message_type}
            )
            
            # ... 现有消息处理逻辑 ...
            
            # 记录处理时间
            duration_ms = (time.time() - start_time) * 1000
            self.monitoring.performance_monitor.record_timer(
                "message_processing_time",
                duration_ms,
                tags={"type": message_type}
            )
            
            # 记录结构化日志
            self.monitoring.structured_logger.info(
                "WebSocket消息处理",
                message_type=message_type,
                duration_ms=duration_ms,
                success=True
            )
            
        except Exception as e:
            # 记录错误
            self.monitoring.performance_monitor.increment_counter(
                "websocket_errors",
                tags={"type": message_type}
            )
            
            self.monitoring.structured_logger.error(
                "WebSocket消息处理失败",
                message_type=message_type,
                error=str(e)
            )
            raise
    
    async def handle_ai_config(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """处理AI配置（添加监控）"""
        start_time = time.time()
        
        try:
            # ... 现有配置处理逻辑 ...
            result = # ... 配置结果 ...
            
            if result["success"]:
                # 记录配置更新
                self.monitoring.ai_config_monitor.record_config_update(config_data)
                
                # 记录结构化日志
                self.monitoring.structured_logger.info(
                    "AI配置更新成功",
                    provider=config_data.get("provider"),
                    model=config_data.get("model")
                )
            
            return result
            
        except Exception as e:
            self.monitoring.structured_logger.error(
                "AI配置更新失败",
                error=str(e)
            )
            raise
    
    async def process_natural_language_command(self, command: str) -> Dict[str, Any]:
        """处理自然语言命令（添加监控）"""
        start_time = time.time()
        
        try:
            # ... 现有命令处理逻辑 ...
            result = # ... 解析结果 ...
            
            # 记录解析时间
            duration_ms = (time.time() - start_time) * 1000
            
            # 记录解析结果
            self.monitoring.ai_config_monitor.record_parsing_result(
                success=result.get("success", False),
                duration_ms=duration_ms
            )
            
            # 记录性能指标
            self.monitoring.performance_monitor.record_timer(
                "ai_parsing_time",
                duration_ms
            )
            
            return result
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            self.monitoring.ai_config_monitor.record_parsing_result(
                success=False,
                duration_ms=duration_ms
            )
            raise
```

### 2. 添加监控API端点

在WebSocket消息处理中添加监控查询端点：

```python
async def handle_websocket_message(self, websocket, message_data: Dict[str, Any]):
    message_type = message_data.get("type", "")
    
    # ... 现有消息类型处理 ...
    
    if message_type == "get_monitoring_status":
        # 获取完整监控状态
        response = {
            "type": "monitoring_status_response",
            "success": True,
            "data": self.monitoring.get_full_status()
        }
        await websocket.send(json.dumps(response))
    
    elif message_type == "get_health_check":
        # 执行健康检查
        await self.monitoring.health_checker.check_all()
        response = {
            "type": "health_check_response",
            "success": True,
            "data": self.monitoring.health_checker.get_health_report()
        }
        await websocket.send(json.dumps(response))
    
    elif message_type == "get_performance_metrics":
        # 获取性能指标
        response = {
            "type": "performance_metrics_response",
            "success": True,
            "data": self.monitoring.performance_monitor.get_all_metrics()
        }
        await websocket.send(json.dumps(response))
    
    elif message_type == "get_ai_config_status":
        # 获取AI配置状态
        response = {
            "type": "ai_config_status_response",
            "success": True,
            "data": self.monitoring.ai_config_monitor.get_config_status()
        }
        await websocket.send(json.dumps(response))
```

## 测试

运行测试脚本：

```bash
python test_monitoring_system.py
```

测试包括：
- 性能监控器测试
- 健康检查器测试
- 结构化日志记录器测试
- AI配置监控器测试
- 完整监控系统测试

## 最佳实践

### 1. 性能指标命名

使用清晰、一致的命名约定：
- 使用小写字母和下划线
- 包含单位信息（如 `_ms`, `_bytes`, `_percent`）
- 使用有意义的前缀（如 `api_`, `db_`, `cache_`）

示例：
```python
monitor.increment_counter("api_requests_total")
monitor.set_gauge("memory_usage_bytes", 1024 * 1024 * 512)
monitor.record_timer("db_query_duration_ms", 45.3)
```

### 2. 健康检查设计

- 保持检查函数简单快速（< 100ms）
- 返回详细的错误信息
- 包含有用的上下文信息
- 避免在检查中执行重操作

### 3. 结构化日志

- 使用一致的字段名称
- 包含足够的上下文信息
- 避免记录敏感信息（如密码、API密钥）
- 使用适当的日志级别

### 4. 监控间隔

根据系统负载选择合适的监控间隔：
- 高负载系统：60秒或更长
- 中等负载：30秒
- 低负载或开发环境：10-15秒

## 故障排除

### 问题：监控系统占用过多资源

**解决方案**：
1. 增加监控间隔
2. 减少历史记录大小
3. 禁用不必要的健康检查
4. 使用采样而不是记录所有事件

### 问题：日志文件过大

**解决方案**：
1. 实现日志轮转
2. 使用日志级别过滤
3. 定期清理旧日志
4. 考虑使用外部日志服务

### 问题：健康检查超时

**解决方案**：
1. 优化检查函数性能
2. 增加超时时间
3. 使用异步检查
4. 实现检查缓存

## 参考资料

- [Python logging文档](https://docs.python.org/3/library/logging.html)
- [asyncio文档](https://docs.python.org/3/library/asyncio.html)
- [Prometheus监控最佳实践](https://prometheus.io/docs/practices/)
- [结构化日志最佳实践](https://www.structlog.org/)
