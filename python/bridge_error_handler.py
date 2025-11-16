#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
桥接系统综合错误处理模块
定义错误类型、错误分类、用户友好消息和错误恢复机制
"""

from enum import Enum
from typing import Dict, Any, Optional, List, Callable
from dataclasses import dataclass, field
import logging
import traceback
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)


class ErrorCategory(Enum):
    """错误类别"""
    AI_CONFIG = "ai_config"  # AI配置错误
    CONNECTION = "connection"  # 连接错误
    COMMAND_EXECUTION = "command_execution"  # 命令执行错误
    BRIDGE_COMMUNICATION = "bridge_communication"  # 桥接通信错误
    DRONE_HARDWARE = "drone_hardware"  # 无人机硬件错误
    VALIDATION = "validation"  # 验证错误
    TIMEOUT = "timeout"  # 超时错误
    NETWORK = "network"  # 网络错误
    SYSTEM = "system"  # 系统错误
    UNKNOWN = "unknown"  # 未知错误


class ErrorSeverity(Enum):
    """错误严重程度"""
    LOW = "low"  # 低 - 不影响核心功能
    MEDIUM = "medium"  # 中 - 影响部分功能
    HIGH = "high"  # 高 - 影响核心功能
    CRITICAL = "critical"  # 严重 - 系统无法运行


class ErrorCode(Enum):
    """错误代码"""
    # AI配置错误 (1000-1099)
    AI_NOT_CONFIGURED = 1000
    AI_CONFIG_INVALID = 1001
    AI_CLIENT_INIT_FAILED = 1002
    AI_PARSING_FAILED = 1003
    AI_API_ERROR = 1004
    
    # 连接错误 (1100-1199)
    DRONE_NOT_CONNECTED = 1100
    BRIDGE_NOT_CONNECTED = 1101
    WEBSOCKET_CONNECTION_FAILED = 1102
    CONNECTION_LOST = 1103
    CONNECTION_TIMEOUT = 1104
    
    # 命令执行错误 (1200-1299)
    COMMAND_INVALID = 1200
    COMMAND_EXECUTION_FAILED = 1201
    COMMAND_TIMEOUT = 1202
    COMMAND_REJECTED = 1203
    BATCH_EXECUTION_FAILED = 1204
    
    # 桥接通信错误 (1300-1399)
    BRIDGE_REQUEST_FAILED = 1300
    BRIDGE_RESPONSE_INVALID = 1301
    BRIDGE_TIMEOUT = 1302
    BRIDGE_UNAVAILABLE = 1303
    
    # 无人机硬件错误 (1400-1499)
    DRONE_LOW_BATTERY = 1400
    DRONE_SENSOR_ERROR = 1401
    DRONE_MOTOR_ERROR = 1402
    DRONE_EMERGENCY = 1403
    DRONE_HARDWARE_FAILURE = 1404
    
    # 验证错误 (1500-1599)
    PARAMETER_INVALID = 1500
    MESSAGE_FORMAT_INVALID = 1501
    DATA_VALIDATION_FAILED = 1502
    
    # 网络错误 (1600-1699)
    NETWORK_UNREACHABLE = 1600
    DNS_RESOLUTION_FAILED = 1601
    SSL_ERROR = 1602
    
    # 系统错误 (1700-1799)
    LIBRARY_NOT_AVAILABLE = 1700
    RESOURCE_EXHAUSTED = 1701
    INTERNAL_ERROR = 1702
    
    # 未知错误 (1800-1899)
    UNKNOWN_ERROR = 1800


@dataclass
class BridgeError:
    """桥接系统错误数据类"""
    code: ErrorCode
    category: ErrorCategory
    severity: ErrorSeverity
    message: str
    details: Optional[str] = None
    context: Dict[str, Any] = field(default_factory=dict)
    recovery_suggestions: List[str] = field(default_factory=list)
    recoverable: bool = True
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "code": self.code.value,
            "category": self.category.value,
            "severity": self.severity.value,
            "message": self.message,
            "details": self.details,
            "context": self.context,
            "recovery_suggestions": self.recovery_suggestions,
            "recoverable": self.recoverable,
            "timestamp": self.timestamp
        }
    
    def to_user_message(self) -> str:
        """生成用户友好的错误消息"""
        base_message = f"[{self.category.value.upper()}] {self.message}"
        
        if self.recovery_suggestions:
            suggestions = "\n建议: " + "; ".join(self.recovery_suggestions[:2])
            return base_message + suggestions
        
        return base_message


class BridgeErrorHandler:
    """桥接系统错误处理器"""
    
    def __init__(self):
        """初始化错误处理器"""
        self.error_history: List[BridgeError] = []
        self.max_history_size = 100
        self.error_callbacks: List[Callable] = []
        
        # 错误统计
        self.error_counts: Dict[ErrorCategory, int] = {
            category: 0 for category in ErrorCategory
        }
        
        logger.info("桥接错误处理器已初始化")
    
    def register_callback(self, callback: Callable[[BridgeError], None]):
        """
        注册错误回调函数
        
        Args:
            callback: 错误回调函数
        """
        self.error_callbacks.append(callback)
        logger.info(f"已注册错误回调: {callback.__name__}")
    
    def handle_error(self, error: BridgeError) -> Dict[str, Any]:
        """
        处理错误
        
        Args:
            error: 桥接错误对象
        
        Returns:
            错误响应字典
        """
        # 记录错误
        logger.error(f"[{error.code.name}] {error.message}")
        if error.details:
            logger.error(f"详情: {error.details}")
        
        # 添加到历史记录
        self.error_history.append(error)
        if len(self.error_history) > self.max_history_size:
            self.error_history.pop(0)
        
        # 更新统计
        self.error_counts[error.category] += 1
        
        # 调用回调函数
        for callback in self.error_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    asyncio.create_task(callback(error))
                else:
                    callback(error)
            except Exception as e:
                logger.error(f"错误回调执行失败: {e}")
        
        # 返回错误响应
        return {
            "success": False,
            "error": error.to_dict(),
            "user_message": error.to_user_message()
        }
    
    def classify_exception(self, exception: Exception, context: Dict[str, Any] = None) -> BridgeError:
        """
        分类异常并创建BridgeError对象
        
        Args:
            exception: 异常对象
            context: 上下文信息
        
        Returns:
            BridgeError对象
        """
        context = context or {}
        error_str = str(exception).lower()
        exception_type = type(exception).__name__
        
        # 连接错误
        if "connection" in error_str or "connect" in error_str:
            if "timeout" in error_str:
                return BridgeError(
                    code=ErrorCode.CONNECTION_TIMEOUT,
                    category=ErrorCategory.CONNECTION,
                    severity=ErrorSeverity.HIGH,
                    message="连接超时",
                    details=str(exception),
                    context=context,
                    recovery_suggestions=[
                        "检查网络连接是否正常",
                        "确认目标服务是否运行",
                        "增加连接超时时间",
                        "稍后重试"
                    ],
                    recoverable=True
                )
            else:
                return BridgeError(
                    code=ErrorCode.CONNECTION_LOST,
                    category=ErrorCategory.CONNECTION,
                    severity=ErrorSeverity.HIGH,
                    message="连接失败或丢失",
                    details=str(exception),
                    context=context,
                    recovery_suggestions=[
                        "检查网络连接",
                        "确认服务器地址和端口正确",
                        "检查防火墙设置",
                        "尝试重新连接"
                    ],
                    recoverable=True
                )
        
        # 超时错误
        if "timeout" in error_str or exception_type == "TimeoutError":
            return BridgeError(
                code=ErrorCode.COMMAND_TIMEOUT,
                category=ErrorCategory.TIMEOUT,
                severity=ErrorSeverity.MEDIUM,
                message="操作超时",
                details=str(exception),
                context=context,
                recovery_suggestions=[
                    "增加超时时间设置",
                    "检查网络延迟",
                    "确认目标服务响应正常",
                    "重试操作"
                ],
                recoverable=True
            )
        
        # JSON解析错误
        if "json" in error_str or exception_type == "JSONDecodeError":
            return BridgeError(
                code=ErrorCode.MESSAGE_FORMAT_INVALID,
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.MEDIUM,
                message="消息格式无效",
                details=str(exception),
                context=context,
                recovery_suggestions=[
                    "检查消息格式是否为有效JSON",
                    "确认消息编码正确",
                    "查看详细错误信息"
                ],
                recoverable=True
            )
        
        # 值错误
        if exception_type == "ValueError":
            return BridgeError(
                code=ErrorCode.PARAMETER_INVALID,
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.LOW,
                message="参数值无效",
                details=str(exception),
                context=context,
                recovery_suggestions=[
                    "检查参数值是否在有效范围内",
                    "确认参数类型正确",
                    "查看参数要求文档"
                ],
                recoverable=True
            )
        
        # 导入错误
        if exception_type == "ImportError" or exception_type == "ModuleNotFoundError":
            return BridgeError(
                code=ErrorCode.LIBRARY_NOT_AVAILABLE,
                category=ErrorCategory.SYSTEM,
                severity=ErrorSeverity.CRITICAL,
                message="缺少必需的库",
                details=str(exception),
                context=context,
                recovery_suggestions=[
                    "安装缺少的Python库",
                    "运行: pip install -r requirements.txt",
                    "检查虚拟环境是否激活",
                    "重启服务"
                ],
                recoverable=False
            )
        
        # 键错误
        if exception_type == "KeyError":
            return BridgeError(
                code=ErrorCode.DATA_VALIDATION_FAILED,
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.MEDIUM,
                message="数据字段缺失",
                details=str(exception),
                context=context,
                recovery_suggestions=[
                    "检查数据结构是否完整",
                    "确认必需字段已提供",
                    "查看API文档"
                ],
                recoverable=True
            )
        
        # 未知错误
        return BridgeError(
            code=ErrorCode.UNKNOWN_ERROR,
            category=ErrorCategory.UNKNOWN,
            severity=ErrorSeverity.MEDIUM,
            message=f"未知错误: {exception_type}",
            details=str(exception),
            context=context,
            recovery_suggestions=[
                "查看详细错误信息",
                "检查日志文件",
                "联系技术支持",
                "尝试重启服务"
            ],
            recoverable=True
        )
    
    def create_ai_config_error(self, message: str, details: str = None) -> BridgeError:
        """创建AI配置错误"""
        return BridgeError(
            code=ErrorCode.AI_CONFIG_INVALID,
            category=ErrorCategory.AI_CONFIG,
            severity=ErrorSeverity.HIGH,
            message=message,
            details=details,
            recovery_suggestions=[
                "检查AI配置是否完整",
                "确认API密钥有效",
                "验证模型名称正确",
                "重新发送AI配置"
            ],
            recoverable=True
        )
    
    def create_drone_error(self, message: str, details: str = None, code: ErrorCode = None) -> BridgeError:
        """创建无人机错误"""
        return BridgeError(
            code=code or ErrorCode.DRONE_HARDWARE_FAILURE,
            category=ErrorCategory.DRONE_HARDWARE,
            severity=ErrorSeverity.HIGH,
            message=message,
            details=details,
            recovery_suggestions=[
                "检查无人机连接状态",
                "确认无人机电量充足",
                "检查无人机硬件状态",
                "尝试重新连接无人机"
            ],
            recoverable=True
        )
    
    def create_bridge_error(self, message: str, details: str = None) -> BridgeError:
        """创建桥接通信错误"""
        return BridgeError(
            code=ErrorCode.BRIDGE_REQUEST_FAILED,
            category=ErrorCategory.BRIDGE_COMMUNICATION,
            severity=ErrorSeverity.HIGH,
            message=message,
            details=details,
            recovery_suggestions=[
                "检查3002端口服务是否运行",
                "确认桥接配置正确",
                "查看桥接连接状态",
                "尝试重新连接桥接"
            ],
            recoverable=True
        )
    
    def create_command_error(self, message: str, details: str = None, command: str = None) -> BridgeError:
        """创建命令执行错误"""
        context = {"command": command} if command else {}
        return BridgeError(
            code=ErrorCode.COMMAND_EXECUTION_FAILED,
            category=ErrorCategory.COMMAND_EXECUTION,
            severity=ErrorSeverity.MEDIUM,
            message=message,
            details=details,
            context=context,
            recovery_suggestions=[
                "检查命令格式是否正确",
                "确认命令参数有效",
                "验证无人机状态允许执行该命令",
                "重试命令"
            ],
            recoverable=True
        )
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """
        获取错误统计信息
        
        Returns:
            统计信息字典
        """
        total_errors = sum(self.error_counts.values())
        
        return {
            "total_errors": total_errors,
            "by_category": {
                category.value: count 
                for category, count in self.error_counts.items()
            },
            "recent_errors": len(self.error_history),
            "most_common_category": max(
                self.error_counts.items(), 
                key=lambda x: x[1]
            )[0].value if total_errors > 0 else None
        }
    
    def get_recent_errors(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取最近的错误记录
        
        Args:
            limit: 返回的错误数量限制
        
        Returns:
            错误记录列表
        """
        return [error.to_dict() for error in self.error_history[-limit:]]
    
    def clear_history(self):
        """清空错误历史记录"""
        self.error_history.clear()
        logger.info("错误历史记录已清空")


class ErrorRecoveryManager:
    """错误恢复管理器"""
    
    def __init__(self):
        """初始化恢复管理器"""
        self.recovery_strategies: Dict[ErrorCode, Callable] = {}
        self.recovery_attempts: Dict[ErrorCode, int] = {}
        self.max_recovery_attempts = 3
        
        logger.info("错误恢复管理器已初始化")
    
    def register_strategy(self, error_code: ErrorCode, strategy: Callable):
        """
        注册恢复策略
        
        Args:
            error_code: 错误代码
            strategy: 恢复策略函数
        """
        self.recovery_strategies[error_code] = strategy
        logger.info(f"已注册恢复策略: {error_code.name}")
    
    async def attempt_recovery(self, error: BridgeError, context: Dict[str, Any] = None) -> bool:
        """
        尝试错误恢复
        
        Args:
            error: 桥接错误对象
            context: 恢复上下文
        
        Returns:
            bool: 恢复是否成功
        """
        if not error.recoverable:
            logger.warning(f"错误不可恢复: {error.code.name}")
            return False
        
        # 检查恢复尝试次数
        attempts = self.recovery_attempts.get(error.code, 0)
        if attempts >= self.max_recovery_attempts:
            logger.error(f"已达到最大恢复尝试次数: {error.code.name}")
            return False
        
        # 获取恢复策略
        strategy = self.recovery_strategies.get(error.code)
        if not strategy:
            logger.warning(f"没有注册恢复策略: {error.code.name}")
            return False
        
        # 执行恢复策略
        try:
            logger.info(f"尝试恢复错误: {error.code.name} (尝试 {attempts + 1}/{self.max_recovery_attempts})")
            
            if asyncio.iscoroutinefunction(strategy):
                success = await strategy(error, context or {})
            else:
                success = strategy(error, context or {})
            
            # 更新尝试次数
            self.recovery_attempts[error.code] = attempts + 1
            
            if success:
                logger.info(f"✅ 错误恢复成功: {error.code.name}")
                # 重置尝试次数
                self.recovery_attempts[error.code] = 0
                return True
            else:
                logger.warning(f"❌ 错误恢复失败: {error.code.name}")
                return False
                
        except Exception as e:
            logger.error(f"执行恢复策略时出错: {e}")
            logger.error(traceback.format_exc())
            return False
    
    def reset_attempts(self, error_code: ErrorCode = None):
        """
        重置恢复尝试次数
        
        Args:
            error_code: 错误代码，如果为None则重置所有
        """
        if error_code:
            self.recovery_attempts[error_code] = 0
            logger.info(f"已重置恢复尝试次数: {error_code.name}")
        else:
            self.recovery_attempts.clear()
            logger.info("已重置所有恢复尝试次数")


# 全局错误处理器实例
_global_error_handler: Optional[BridgeErrorHandler] = None
_global_recovery_manager: Optional[ErrorRecoveryManager] = None


def get_error_handler() -> BridgeErrorHandler:
    """获取全局错误处理器实例"""
    global _global_error_handler
    if _global_error_handler is None:
        _global_error_handler = BridgeErrorHandler()
    return _global_error_handler


def get_recovery_manager() -> ErrorRecoveryManager:
    """获取全局恢复管理器实例"""
    global _global_recovery_manager
    if _global_recovery_manager is None:
        _global_recovery_manager = ErrorRecoveryManager()
    return _global_recovery_manager


# 使用示例
if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 创建错误处理器
    handler = BridgeErrorHandler()
    
    # 测试1: 创建AI配置错误
    print("=== 测试1: AI配置错误 ===")
    ai_error = handler.create_ai_config_error(
        "AI未配置",
        "请先通过WebSocket发送AI配置"
    )
    response = handler.handle_error(ai_error)
    print(f"错误响应: {response}")
    print(f"用户消息: {ai_error.to_user_message()}")
    print()
    
    # 测试2: 分类异常
    print("=== 测试2: 异常分类 ===")
    try:
        raise ConnectionError("Connection to 192.168.10.1:8889 failed")
    except Exception as e:
        error = handler.classify_exception(e, {"target": "drone"})
        response = handler.handle_error(error)
        print(f"错误类别: {error.category.value}")
        print(f"错误代码: {error.code.value}")
        print(f"严重程度: {error.severity.value}")
        print(f"恢复建议: {error.recovery_suggestions}")
    print()
    
    # 测试3: 错误统计
    print("=== 测试3: 错误统计 ===")
    stats = handler.get_error_statistics()
    print(f"统计信息: {stats}")
    print()
    
    # 测试4: 恢复管理器
    print("=== 测试4: 错误恢复 ===")
    recovery_manager = ErrorRecoveryManager()
    
    # 注册恢复策略
    async def reconnect_strategy(error: BridgeError, context: Dict[str, Any]) -> bool:
        """重连恢复策略"""
        print(f"执行重连策略: {error.message}")
        await asyncio.sleep(1)  # 模拟重连
        return True
    
    recovery_manager.register_strategy(ErrorCode.CONNECTION_LOST, reconnect_strategy)
    
    # 尝试恢复
    async def test_recovery():
        conn_error = BridgeError(
            code=ErrorCode.CONNECTION_LOST,
            category=ErrorCategory.CONNECTION,
            severity=ErrorSeverity.HIGH,
            message="连接丢失",
            recoverable=True
        )
        success = await recovery_manager.attempt_recovery(conn_error)
        print(f"恢复结果: {'成功' if success else '失败'}")
    
    asyncio.run(test_recovery())
