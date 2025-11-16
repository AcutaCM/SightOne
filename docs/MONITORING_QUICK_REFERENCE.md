# 监控系统快速参考

## 快速开始

### 1. 创建监控系统

```python
from monitoring_system import MonitoringSystem

monitoring = MonitoringSystem(log_file="app.log")
```

### 2. 注册健康检查

```python
async def check_component():
    return HealthCheckResult(
        component="my_component",
        status=HealthStatus.HEALTHY,
        message="组件正常"
    )

monitoring.health_checker.register_check("my_component", check_component)
```

### 3. 记录性能指标

```python
# 计数器
monitoring.performance_monitor.increment_counter("requests")

# 仪表
monitoring.performance_monitor.set_gauge("cpu_usage", 45.5, unit="%")

# 计时器
monitoring.performance_monitor.record_timer("response_time", 125.3)
```

### 4. 记录AI配置

```python
monitoring.ai_config_monitor.record_config_update({
    "provider": "openai",
    "model": "gpt-4o"
})

monitoring.ai_config_monitor.record_parsing_result(True, 145.2)
```

### 5. 记录结构化日志

```python
monitoring.structured_logger.info("事件发生", key="value")
monitoring.structured_logger.error("错误发生", error_code="E001")
```

### 6. 启动监控

```python
await monitoring.start_monitoring(interval=30.0)
```

### 7. 获取状态

```python
# 完整状态
status = monitoring.get_full_status()

# 健康报告
health = monitoring.health_checker.get_health_report()

# 性能指标
metrics = monitoring.performance_monitor.get_all_metrics()

# AI配置状态
ai_status = monitoring.ai_config_monitor.get_config_status()
```

## 常用API

### 性能监控器

```python
# 计数器
monitor.increment_counter(name, value=1, tags={})
monitor.get_counter(name)

# 仪表
monitor.set_gauge(name, value, tags={}, unit="")
monitor.get_gauge(name)

# 计时器
monitor.record_timer(name, duration_ms, tags={})
monitor.get_timer_stats(name)

# 获取所有指标
monitor.get_all_metrics()

# 重置指标
monitor.reset_metrics()
```

### 健康检查器

```python
# 注册检查
checker.register_check(component, check_func)

# 执行检查
result = await checker.check_component(component)
results = await checker.check_all()

# 获取状态
overall = checker.get_overall_status()
report = checker.get_health_report()
```

### 结构化日志

```python
logger.debug(message, **kwargs)
logger.info(message, **kwargs)
logger.warning(message, **kwargs)
logger.error(message, **kwargs)
logger.critical(message, **kwargs)
```

### AI配置监控

```python
# 记录配置
monitor.record_config_update(config)

# 记录解析结果
monitor.record_parsing_result(success, duration_ms)

# 获取状态
status = monitor.get_config_status()
history = monitor.get_config_history(limit=10)
```

## WebSocket消息类型

### 获取监控状态

```json
{
  "type": "get_monitoring_status"
}
```

响应：
```json
{
  "type": "monitoring_status_response",
  "success": true,
  "data": {
    "health": {...},
    "performance": {...},
    "ai_config": {...}
  }
}
```

### 获取健康检查

```json
{
  "type": "get_health_check"
}
```

### 获取性能指标

```json
{
  "type": "get_performance_metrics"
}
```

### 获取AI配置状态

```json
{
  "type": "get_ai_config_status"
}
```

## 健康状态

- `HEALTHY`: 健康
- `DEGRADED`: 降级
- `UNHEALTHY`: 不健康
- `UNKNOWN`: 未知

## 指标类型

- `COUNTER`: 计数器（累计值）
- `GAUGE`: 仪表（瞬时值）
- `TIMER`: 计时器（持续时间）

## 计时器统计

```python
{
  "count": 100,
  "min": 50.0,
  "max": 250.0,
  "mean": 125.5,
  "median": 120.0,
  "p95": 200.0,
  "p99": 230.0
}
```

## 配置示例

### 监控间隔

```python
# 开发环境
await monitoring.start_monitoring(interval=10.0)

# 生产环境
await monitoring.start_monitoring(interval=60.0)
```

### 历史记录大小

```python
monitor = PerformanceMonitor(history_size=1000)
```

### 日志文件

```python
monitoring = MonitoringSystem(log_file="monitoring.log")
logger = StructuredLogger("app", log_file="app.log")
```

## 常见模式

### 测量函数执行时间

```python
import time

start_time = time.time()
try:
    # 执行操作
    result = await some_operation()
    
    # 记录成功
    duration_ms = (time.time() - start_time) * 1000
    monitoring.performance_monitor.record_timer("operation_time", duration_ms)
    monitoring.performance_monitor.increment_counter("operation_success")
    
except Exception as e:
    # 记录失败
    duration_ms = (time.time() - start_time) * 1000
    monitoring.performance_monitor.record_timer("operation_time", duration_ms)
    monitoring.performance_monitor.increment_counter("operation_failure")
    raise
```

### 健康检查模板

```python
async def check_service():
    try:
        # 执行检查
        is_healthy = await service.ping()
        
        return HealthCheckResult(
            component="service_name",
            status=HealthStatus.HEALTHY if is_healthy else HealthStatus.UNHEALTHY,
            message="服务正常" if is_healthy else "服务异常",
            details={"endpoint": "http://localhost:3002"}
        )
    except Exception as e:
        return HealthCheckResult(
            component="service_name",
            status=HealthStatus.UNHEALTHY,
            message=f"检查失败: {str(e)}"
        )
```

### 结构化日志模板

```python
# 操作开始
monitoring.structured_logger.info(
    "操作开始",
    operation="command_execution",
    command="takeoff",
    user_id="12345"
)

# 操作成功
monitoring.structured_logger.info(
    "操作成功",
    operation="command_execution",
    command="takeoff",
    duration_ms=125.5,
    result="success"
)

# 操作失败
monitoring.structured_logger.error(
    "操作失败",
    operation="command_execution",
    command="takeoff",
    error_code="E001",
    error_message="连接超时"
)
```

## 性能优化建议

1. **使用标签而不是创建多个指标**
   ```python
   # 好
   monitor.increment_counter("api_requests", tags={"endpoint": "/status"})
   
   # 不好
   monitor.increment_counter("api_requests_status")
   ```

2. **限制历史记录大小**
   ```python
   monitor = PerformanceMonitor(history_size=100)  # 而不是1000
   ```

3. **增加监控间隔**
   ```python
   await monitoring.start_monitoring(interval=60.0)  # 而不是10.0
   ```

4. **使用采样**
   ```python
   import random
   if random.random() < 0.1:  # 10%采样率
       monitor.record_timer("operation", duration)
   ```

## 故障排除

### 监控系统未启动

```python
# 检查是否启动
if not monitoring.is_monitoring:
    await monitoring.start_monitoring()
```

### 健康检查超时

```python
# 添加超时保护
async def check_with_timeout():
    try:
        return await asyncio.wait_for(check_function(), timeout=5.0)
    except asyncio.TimeoutError:
        return HealthCheckResult(
            component="component",
            status=HealthStatus.UNHEALTHY,
            message="检查超时"
        )
```

### 日志文件过大

```python
# 使用日志轮转
import logging.handlers

handler = logging.handlers.RotatingFileHandler(
    "app.log",
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
```

## 测试命令

```bash
# 运行测试
python test_monitoring_system.py

# 查看日志
cat monitoring.log
cat test_monitoring.log

# 清理日志
rm *.log
```

## 相关文档

- [完整指南](./MONITORING_SYSTEM_GUIDE.md)
- [桥接系统文档](./BRIDGE_CLIENT_IMPLEMENTATION.md)
- [错误处理指南](./BRIDGE_ERROR_HANDLING_GUIDE.md)
