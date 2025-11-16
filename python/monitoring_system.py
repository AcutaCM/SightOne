#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
监控系统 (Monitoring System)
实现性能指标收集、健康检查、结构化日志记录和AI配置状态监控
"""

import time
import asyncio
import logging
import json
import traceback
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
from collections import deque, defaultdict
import statistics


logger = logging.getLogger(__name__)


class HealthStatus(Enum):
    """健康状态枚举"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class MetricType(Enum):
    """指标类型"""
    COUNTER = "counter"  # 计数器
    GAUGE = "gauge"  # 仪表
    HISTOGRAM = "histogram"  # 直方图
    TIMER = "timer"  # 计时器


@dataclass
class PerformanceMetric:
    """性能指标"""
    name: str
    value: float
    metric_type: MetricType
    timestamp: float = field(default_factory=time.time)
    tags: Dict[str, str] = field(default_factory=dict)
    unit: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "name": self.name,
            "value": self.value,
            "type": self.metric_type.value,
            "timestamp": datetime.fromtimestamp(self.timestamp).isoformat(),
            "tags": self.tags,
            "unit": self.unit
        }


@dataclass
class HealthCheckResult:
    """健康检查结果"""
    component: str
    status: HealthStatus
    message: str = ""
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    response_time_ms: float = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "component": self.component,
            "status": self.status.value,
            "message": self.message,
            "details": self.details,
            "timestamp": datetime.fromtimestamp(self.timestamp).isoformat(),
            "response_time_ms": self.response_time_ms
        }


class PerformanceMonitor:
    """
    性能监控器
    收集和管理性能指标
    """
    
    def __init__(self, history_size: int = 1000):
        """
        初始化性能监控器
        
        Args:
            history_size: 历史记录大小
        """
        self.history_size = history_size
        
        # 指标存储
        self.metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=history_size))
        
        # 计数器
        self.counters: Dict[str, int] = defaultdict(int)
        
        # 仪表
        self.gauges: Dict[str, float] = {}
        
        # 计时器
        self.timers: Dict[str, List[float]] = defaultdict(list)
        
        # 统计信息
        self.start_time = time.time()
        
        logger.info("性能监控器已初始化")
    
    def increment_counter(self, name: str, value: int = 1, tags: Dict[str, str] = None):
        """
        增加计数器
        
        Args:
            name: 计数器名称
            value: 增加值
            tags: 标签
        """
        self.counters[name] += value
        
        metric = PerformanceMetric(
            name=name,
            value=self.counters[name],
            metric_type=MetricType.COUNTER,
            tags=tags or {}
        )
        
        self.metrics[name].append(metric)
        logger.debug(f"计数器 {name} 增加 {value}，当前值: {self.counters[name]}")
    
    def set_gauge(self, name: str, value: float, tags: Dict[str, str] = None, unit: str = ""):
        """
        设置仪表值
        
        Args:
            name: 仪表名称
            value: 值
            tags: 标签
            unit: 单位
        """
        self.gauges[name] = value
        
        metric = PerformanceMetric(
            name=name,
            value=value,
            metric_type=MetricType.GAUGE,
            tags=tags or {},
            unit=unit
        )
        
        self.metrics[name].append(metric)
        logger.debug(f"仪表 {name} 设置为 {value}{unit}")
    
    def record_timer(self, name: str, duration_ms: float, tags: Dict[str, str] = None):
        """
        记录计时器
        
        Args:
            name: 计时器名称
            duration_ms: 持续时间（毫秒）
            tags: 标签
        """
        self.timers[name].append(duration_ms)
        
        # 保持最近1000个记录
        if len(self.timers[name]) > self.history_size:
            self.timers[name] = self.timers[name][-self.history_size:]
        
        metric = PerformanceMetric(
            name=name,
            value=duration_ms,
            metric_type=MetricType.TIMER,
            tags=tags or {},
            unit="ms"
        )
        
        self.metrics[name].append(metric)
        logger.debug(f"计时器 {name} 记录: {duration_ms:.2f}ms")
    
    def get_counter(self, name: str) -> int:
        """获取计数器值"""
        return self.counters.get(name, 0)
    
    def get_gauge(self, name: str) -> Optional[float]:
        """获取仪表值"""
        return self.gauges.get(name)
    
    def get_timer_stats(self, name: str) -> Dict[str, float]:
        """
        获取计时器统计信息
        
        Args:
            name: 计时器名称
        
        Returns:
            统计信息字典
        """
        if name not in self.timers or not self.timers[name]:
            return {}
        
        values = self.timers[name]
        
        return {
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "mean": statistics.mean(values),
            "median": statistics.median(values),
            "p95": statistics.quantiles(values, n=20)[18] if len(values) >= 20 else max(values),
            "p99": statistics.quantiles(values, n=100)[98] if len(values) >= 100 else max(values)
        }
    
    def get_metric_history(self, name: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        获取指标历史
        
        Args:
            name: 指标名称
            limit: 限制数量
        
        Returns:
            指标历史列表
        """
        if name not in self.metrics:
            return []
        
        history = list(self.metrics[name])
        
        if limit:
            history = history[-limit:]
        
        return [metric.to_dict() for metric in history]
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """
        获取所有指标
        
        Returns:
            所有指标的字典
        """
        return {
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "timers": {
                name: self.get_timer_stats(name)
                for name in self.timers.keys()
            },
            "uptime_seconds": time.time() - self.start_time
        }
    
    def reset_metrics(self):
        """重置所有指标"""
        self.metrics.clear()
        self.counters.clear()
        self.gauges.clear()
        self.timers.clear()
        self.start_time = time.time()
        logger.info("所有指标已重置")


class HealthChecker:
    """
    健康检查器
    执行系统健康检查
    """
    
    def __init__(self):
        """初始化健康检查器"""
        self.check_functions: Dict[str, Callable] = {}
        self.last_check_results: Dict[str, HealthCheckResult] = {}
        self.check_interval = 30.0  # 默认30秒检查一次
        
        logger.info("健康检查器已初始化")
    
    def register_check(self, component: str, check_func: Callable):
        """
        注册健康检查函数
        
        Args:
            component: 组件名称
            check_func: 检查函数（异步或同步）
        """
        self.check_functions[component] = check_func
        logger.info(f"已注册健康检查: {component}")
    
    async def check_component(self, component: str) -> HealthCheckResult:
        """
        检查单个组件
        
        Args:
            component: 组件名称
        
        Returns:
            健康检查结果
        """
        if component not in self.check_functions:
            return HealthCheckResult(
                component=component,
                status=HealthStatus.UNKNOWN,
                message="未注册健康检查函数"
            )
        
        start_time = time.time()
        
        try:
            check_func = self.check_functions[component]
            
            # 执行检查函数
            if asyncio.iscoroutinefunction(check_func):
                result = await check_func()
            else:
                result = check_func()
            
            response_time_ms = (time.time() - start_time) * 1000
            
            # 解析结果
            if isinstance(result, HealthCheckResult):
                result.response_time_ms = response_time_ms
                return result
            elif isinstance(result, dict):
                return HealthCheckResult(
                    component=component,
                    status=HealthStatus[result.get("status", "UNKNOWN").upper()],
                    message=result.get("message", ""),
                    details=result.get("details", {}),
                    response_time_ms=response_time_ms
                )
            elif isinstance(result, bool):
                return HealthCheckResult(
                    component=component,
                    status=HealthStatus.HEALTHY if result else HealthStatus.UNHEALTHY,
                    message="检查通过" if result else "检查失败",
                    response_time_ms=response_time_ms
                )
            else:
                return HealthCheckResult(
                    component=component,
                    status=HealthStatus.UNKNOWN,
                    message=f"未知的检查结果类型: {type(result)}",
                    response_time_ms=response_time_ms
                )
                
        except Exception as e:
            response_time_ms = (time.time() - start_time) * 1000
            logger.error(f"健康检查失败 [{component}]: {e}")
            
            return HealthCheckResult(
                component=component,
                status=HealthStatus.UNHEALTHY,
                message=f"检查异常: {str(e)}",
                details={"error": str(e), "traceback": traceback.format_exc()},
                response_time_ms=response_time_ms
            )
    
    async def check_all(self) -> Dict[str, HealthCheckResult]:
        """
        检查所有组件
        
        Returns:
            所有组件的健康检查结果
        """
        results = {}
        
        for component in self.check_functions.keys():
            result = await self.check_component(component)
            results[component] = result
            self.last_check_results[component] = result
        
        return results
    
    def get_overall_status(self) -> HealthStatus:
        """
        获取整体健康状态
        
        Returns:
            整体健康状态
        """
        if not self.last_check_results:
            return HealthStatus.UNKNOWN
        
        statuses = [result.status for result in self.last_check_results.values()]
        
        if any(status == HealthStatus.UNHEALTHY for status in statuses):
            return HealthStatus.UNHEALTHY
        elif any(status == HealthStatus.DEGRADED for status in statuses):
            return HealthStatus.DEGRADED
        elif all(status == HealthStatus.HEALTHY for status in statuses):
            return HealthStatus.HEALTHY
        else:
            return HealthStatus.UNKNOWN
    
    def get_health_report(self) -> Dict[str, Any]:
        """
        获取健康报告
        
        Returns:
            健康报告字典
        """
        return {
            "overall_status": self.get_overall_status().value,
            "components": {
                component: result.to_dict()
                for component, result in self.last_check_results.items()
            },
            "timestamp": datetime.now().isoformat()
        }


class StructuredLogger:
    """
    结构化日志记录器
    提供JSON格式的结构化日志
    """
    
    def __init__(self, name: str, log_file: Optional[str] = None):
        """
        初始化结构化日志记录器
        
        Args:
            name: 日志记录器名称
            log_file: 日志文件路径（可选）
        """
        self.logger = logging.getLogger(name)
        self.log_file = log_file
        
        # 如果指定了日志文件，添加文件处理器
        if log_file:
            file_handler = logging.FileHandler(log_file, encoding='utf-8')
            file_handler.setFormatter(logging.Formatter('%(message)s'))
            self.logger.addHandler(file_handler)
    
    def _log_structured(self, level: str, message: str, **kwargs):
        """
        记录结构化日志
        
        Args:
            level: 日志级别
            message: 日志消息
            **kwargs: 额外的结构化数据
        """
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            **kwargs
        }
        
        log_json = json.dumps(log_entry, ensure_ascii=False)
        
        if level == "DEBUG":
            self.logger.debug(log_json)
        elif level == "INFO":
            self.logger.info(log_json)
        elif level == "WARNING":
            self.logger.warning(log_json)
        elif level == "ERROR":
            self.logger.error(log_json)
        elif level == "CRITICAL":
            self.logger.critical(log_json)
    
    def debug(self, message: str, **kwargs):
        """记录DEBUG级别日志"""
        self._log_structured("DEBUG", message, **kwargs)
    
    def info(self, message: str, **kwargs):
        """记录INFO级别日志"""
        self._log_structured("INFO", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """记录WARNING级别日志"""
        self._log_structured("WARNING", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """记录ERROR级别日志"""
        self._log_structured("ERROR", message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """记录CRITICAL级别日志"""
        self._log_structured("CRITICAL", message, **kwargs)


class AIConfigMonitor:
    """
    AI配置状态监控器
    监控AI配置的状态和性能
    """
    
    def __init__(self):
        """初始化AI配置监控器"""
        self.config_history: deque = deque(maxlen=100)
        self.current_config: Optional[Dict[str, Any]] = None
        self.config_changes = 0
        self.last_config_time: Optional[float] = None
        self.parsing_success_count = 0
        self.parsing_failure_count = 0
        self.parsing_times: deque = deque(maxlen=100)
        
        logger.info("AI配置监控器已初始化")
    
    def record_config_update(self, config: Dict[str, Any]):
        """
        记录配置更新
        
        Args:
            config: 配置字典
        """
        self.current_config = config.copy()
        self.current_config['timestamp'] = time.time()
        self.config_history.append(self.current_config)
        self.config_changes += 1
        self.last_config_time = time.time()
        
        logger.info(f"AI配置已更新: {config.get('provider')}/{config.get('model')}")
    
    def record_parsing_result(self, success: bool, duration_ms: float):
        """
        记录解析结果
        
        Args:
            success: 是否成功
            duration_ms: 解析时间（毫秒）
        """
        if success:
            self.parsing_success_count += 1
        else:
            self.parsing_failure_count += 1
        
        self.parsing_times.append(duration_ms)
        
        logger.debug(f"AI解析记录: 成功={success}, 耗时={duration_ms:.2f}ms")
    
    def get_config_status(self) -> Dict[str, Any]:
        """
        获取配置状态
        
        Returns:
            配置状态字典
        """
        if not self.current_config:
            return {
                "configured": False,
                "message": "AI未配置"
            }
        
        parsing_times = list(self.parsing_times)
        
        return {
            "configured": True,
            "current_config": {
                "provider": self.current_config.get("provider"),
                "model": self.current_config.get("model"),
                "supports_vision": self.current_config.get("supports_vision", False),
                "configured_at": datetime.fromtimestamp(self.current_config.get("timestamp", 0)).isoformat()
            },
            "statistics": {
                "config_changes": self.config_changes,
                "parsing_success_count": self.parsing_success_count,
                "parsing_failure_count": self.parsing_failure_count,
                "parsing_success_rate": (
                    self.parsing_success_count / max(self.parsing_success_count + self.parsing_failure_count, 1)
                ),
                "avg_parsing_time_ms": statistics.mean(parsing_times) if parsing_times else 0,
                "max_parsing_time_ms": max(parsing_times) if parsing_times else 0,
                "min_parsing_time_ms": min(parsing_times) if parsing_times else 0
            },
            "last_config_time": (
                datetime.fromtimestamp(self.last_config_time).isoformat()
                if self.last_config_time else None
            )
        }
    
    def get_config_history(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        获取配置历史
        
        Args:
            limit: 限制数量
        
        Returns:
            配置历史列表
        """
        history = list(self.config_history)
        
        if limit:
            history = history[-limit:]
        
        return [
            {
                "provider": config.get("provider"),
                "model": config.get("model"),
                "timestamp": datetime.fromtimestamp(config.get("timestamp", 0)).isoformat()
            }
            for config in history
        ]


class MonitoringSystem:
    """
    监控系统
    集成性能监控、健康检查、结构化日志和AI配置监控
    """
    
    def __init__(self, log_file: Optional[str] = None):
        """
        初始化监控系统
        
        Args:
            log_file: 日志文件路径
        """
        self.performance_monitor = PerformanceMonitor()
        self.health_checker = HealthChecker()
        self.structured_logger = StructuredLogger("monitoring_system", log_file)
        self.ai_config_monitor = AIConfigMonitor()
        
        # 监控任务
        self.monitoring_task: Optional[asyncio.Task] = None
        self.is_monitoring = False
        
        logger.info("监控系统已初始化")
    
    async def start_monitoring(self, interval: float = 30.0):
        """
        启动监控
        
        Args:
            interval: 监控间隔（秒）
        """
        if self.is_monitoring:
            logger.warning("监控已在运行")
            return
        
        self.is_monitoring = True
        self.health_checker.check_interval = interval
        self.monitoring_task = asyncio.create_task(self._monitoring_loop(interval))
        
        logger.info(f"监控已启动，间隔: {interval}秒")
    
    async def stop_monitoring(self):
        """停止监控"""
        self.is_monitoring = False
        
        if self.monitoring_task and not self.monitoring_task.done():
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                pass
        
        logger.info("监控已停止")
    
    async def _monitoring_loop(self, interval: float):
        """
        监控循环
        
        Args:
            interval: 监控间隔
        """
        try:
            while self.is_monitoring:
                try:
                    # 执行健康检查
                    await self.health_checker.check_all()
                    
                    # 记录监控日志
                    self.structured_logger.info(
                        "定期监控检查",
                        health_status=self.health_checker.get_overall_status().value,
                        metrics=self.performance_monitor.get_all_metrics()
                    )
                    
                except Exception as e:
                    logger.error(f"监控循环错误: {e}")
                
                await asyncio.sleep(interval)
                
        except asyncio.CancelledError:
            logger.info("监控循环已取消")
        except Exception as e:
            logger.error(f"监控循环异常: {e}")
    
    def get_full_status(self) -> Dict[str, Any]:
        """
        获取完整状态
        
        Returns:
            完整状态字典
        """
        return {
            "health": self.health_checker.get_health_report(),
            "performance": self.performance_monitor.get_all_metrics(),
            "ai_config": self.ai_config_monitor.get_config_status(),
            "timestamp": datetime.now().isoformat()
        }


# 使用示例
async def main():
    """测试监控系统"""
    # 创建监控系统
    monitoring = MonitoringSystem(log_file="monitoring.log")
    
    # 注册健康检查
    async def check_database():
        """模拟数据库健康检查"""
        await asyncio.sleep(0.1)
        return HealthCheckResult(
            component="database",
            status=HealthStatus.HEALTHY,
            message="数据库连接正常"
        )
    
    monitoring.health_checker.register_check("database", check_database)
    
    # 记录性能指标
    monitoring.performance_monitor.increment_counter("requests_total")
    monitoring.performance_monitor.set_gauge("memory_usage_mb", 256.5, unit="MB")
    monitoring.performance_monitor.record_timer("request_duration", 125.3)
    
    # 记录AI配置
    monitoring.ai_config_monitor.record_config_update({
        "provider": "openai",
        "model": "gpt-4o",
        "supports_vision": True
    })
    
    # 启动监控
    await monitoring.start_monitoring(interval=5.0)
    
    # 运行一段时间
    await asyncio.sleep(15)
    
    # 获取完整状态
    status = monitoring.get_full_status()
    print(json.dumps(status, indent=2, ensure_ascii=False))
    
    # 停止监控
    await monitoring.stop_monitoring()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    asyncio.run(main())
