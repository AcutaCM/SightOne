#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI配置处理器
集成AI配置管理器和错误处理器，提供统一的配置处理接口
"""

import logging
import traceback
from typing import Dict, Any, Optional

# 导入AI配置管理器
try:
    from ai_config_manager import AIConfigManager, AIConfig
    AI_CONFIG_MANAGER_AVAILABLE = True
except ImportError:
    AI_CONFIG_MANAGER_AVAILABLE = False

# 导入AI配置错误处理
try:
    from ai_config_errors import AIConfigErrorHandler, AIConfigError, AIConfigErrorType
    AI_ERROR_HANDLER_AVAILABLE = True
except ImportError:
    AI_ERROR_HANDLER_AVAILABLE = False

logger = logging.getLogger(__name__)


class AIConfigHandler:
    """
    AI配置处理器
    整合配置管理和错误处理功能
    """
    
    def __init__(self):
        """初始化AI配置处理器"""
        self.ai_config_manager = None
        self.ai_client = None
        
        if AI_CONFIG_MANAGER_AVAILABLE:
            self.ai_config_manager = AIConfigManager()
            logger.info("✅ AI配置管理器已初始化")
        else:
            logger.error("❌ AI配置管理器不可用")
        
        if not AI_ERROR_HANDLER_AVAILABLE:
            logger.warning("⚠️ AI配置错误处理器不可用，将使用基本错误处理")
    
    async def handle_ai_config(self, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        处理前端发送的AI配置 - 增强错误处理
        
        Args:
            config_data: 前端传递的AI配置字典
        
        Returns:
            配置结果字典，包含详细的错误信息和恢复建议
        """
        try:
            # 检查配置管理器可用性
            if not AI_CONFIG_MANAGER_AVAILABLE or not self.ai_config_manager:
                return {
                    "success": False,
                    "error": "AI配置管理器不可用",
                    "error_type": "system_error",
                    "recovery_suggestions": [
                        "检查ai_config_manager.py文件是否存在",
                        "确保Python环境正确配置",
                        "重启后端服务"
                    ],
                    "recoverable": False
                }
            
            # 使用错误处理器进行预验证
            if AI_ERROR_HANDLER_AVAILABLE:
                validation_error = AIConfigErrorHandler.validate_config(config_data)
                if validation_error:
                    logger.error(f"❌ 配置验证失败: {validation_error.message}")
                    
                    # 记录恢复建议到日志
                    for suggestion in validation_error.recovery_suggestions:
                        logger.info(f"💡 恢复建议: {suggestion}")
                    
                    # 获取详细的恢复指南
                    recovery_guide = AIConfigErrorHandler.get_recovery_guide(validation_error)
                    
                    # 返回详细错误信息
                    return {
                        "success": False,
                        "error": validation_error.message,
                        "error_type": validation_error.error_type.value,
                        "error_details": validation_error.details,
                        "field": validation_error.field,
                        "recovery_suggestions": validation_error.recovery_suggestions,
                        "recovery_guide": recovery_guide,
                        "recoverable": validation_error.recoverable
                    }
            
            # 加载配置
            provider = config_data.get('provider', 'unknown')
            model = config_data.get('model', 'unknown')
            logger.info(f"正在加载AI配置: {provider}/{model}")
            
            config = self.ai_config_manager.load_config_from_frontend(config_data)
            
            # 验证视觉支持
            if config.supports_vision:
                logger.info(f"✅ 模型支持视觉功能: {config.model}")
            else:
                logger.warning(f"⚠️ 模型不支持视觉功能: {config.model}")
            
            # 创建AI客户端
            try:
                self.ai_client = self.ai_config_manager.get_client()
                logger.info(f"✅ AI客户端创建成功: {config.provider}/{config.model}")
            except ImportError as e:
                # 处理库导入错误
                if AI_ERROR_HANDLER_AVAILABLE:
                    library_error = AIConfigErrorHandler.check_library_availability(config.provider)
                    if library_error:
                        recovery_guide = AIConfigErrorHandler.get_recovery_guide(library_error)
                        return {
                            "success": False,
                            "error": library_error.message,
                            "error_type": library_error.error_type.value,
                            "error_details": library_error.details,
                            "recovery_suggestions": library_error.recovery_suggestions,
                            "recovery_guide": recovery_guide,
                            "recoverable": library_error.recoverable
                        }
                
                return {
                    "success": False,
                    "error": f"创建AI客户端失败，缺少必需的库: {str(e)}",
                    "error_type": "library_not_installed",
                    "recovery_suggestions": [
                        f"运行命令安装: pip install {config.provider}",
                        "或安装完整依赖: pip install -r requirements.txt",
                        "重启后端服务以加载新安装的库"
                    ],
                    "recoverable": True
                }
            
            # 测试API连接（可选）
            try:
                await self._test_api_connection(config)
                logger.info(f"✅ API连接测试成功")
            except Exception as test_error:
                logger.warning(f"⚠️ API连接测试失败: {test_error}")
                # 不阻止配置加载，只是警告
                # 可以选择返回警告信息
            
            # 返回成功响应
            return {
                "success": True,
                "message": "AI配置加载成功",
                "data": {
                    "provider": config.provider,
                    "model": config.model,
                    "supports_vision": config.supports_vision,
                    "api_base": config.api_base,
                    "temperature": config.temperature,
                    "max_tokens": config.max_tokens
                }
            }
            
        except ValueError as e:
            logger.error(f"❌ AI配置验证失败: {e}")
            return {
                "success": False,
                "error": f"配置验证失败: {str(e)}",
                "error_type": "validation_error",
                "recovery_suggestions": [
                    "检查所有配置参数是否正确",
                    "确保provider、model、api_key字段都已提供",
                    "参考文档确认配置格式"
                ],
                "recoverable": True
            }
        except ImportError as e:
            logger.error(f"❌ 库导入失败: {e}")
            return {
                "success": False,
                "error": f"缺少必需的Python库: {str(e)}",
                "error_type": "library_not_installed",
                "recovery_suggestions": [
                    "运行: pip install -r requirements.txt",
                    "确保所有AI提供商的库都已安装",
                    "重启后端服务"
                ],
                "recoverable": True
            }
        except Exception as e:
            logger.error(f"❌ AI配置加载失败: {e}")
            logger.error(traceback.format_exc())
            
            # 使用错误处理器分析异常
            if AI_ERROR_HANDLER_AVAILABLE:
                provider = config_data.get('provider', 'unknown')
                api_error = AIConfigErrorHandler.handle_api_error(e, provider)
                recovery_guide = AIConfigErrorHandler.get_recovery_guide(api_error)
                return {
                    "success": False,
                    "error": api_error.message,
                    "error_type": api_error.error_type.value,
                    "error_details": api_error.details,
                    "recovery_suggestions": api_error.recovery_suggestions,
                    "recovery_guide": recovery_guide,
                    "recoverable": api_error.recoverable
                }
            
            return {
                "success": False,
                "error": f"配置加载失败: {str(e)}",
                "error_type": "unknown_error",
                "recovery_suggestions": [
                    "检查所有配置参数",
                    "查看详细日志获取更多信息",
                    "尝试使用其他AI提供商"
                ],
                "recoverable": True
            }
    
    async def _test_api_connection(self, config: AIConfig):
        """
        测试API连接（简单验证）
        
        Args:
            config: AI配置对象
        
        Raises:
            Exception: 连接测试失败时抛出
        """
        # 这里可以添加简单的API连接测试
        # 例如：发送一个最小的测试请求
        # 注意：不要在这里做复杂的操作，只是验证连接
        pass
    
    def get_config(self) -> Optional[AIConfig]:
        """
        获取当前AI配置
        
        Returns:
            当前配置对象，如果未配置则返回None
        """
        if self.ai_config_manager:
            return self.ai_config_manager.get_config()
        return None
    
    def get_client(self):
        """
        获取AI客户端
        
        Returns:
            AI客户端实例
        """
        return self.ai_client
    
    def is_configured(self) -> bool:
        """
        检查是否已配置
        
        Returns:
            是否已配置
        """
        if self.ai_config_manager:
            return self.ai_config_manager.is_configured()
        return False
    
    def clear_config(self):
        """清除当前配置"""
        if self.ai_config_manager:
            self.ai_config_manager.clear_config()
        self.ai_client = None
        logger.info("🧹 AI配置已清除")


# 使用示例
if __name__ == "__main__":
    import asyncio
    
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    async def test_handler():
        """测试配置处理器"""
        handler = AIConfigHandler()
        
        # 测试1: 缺少必需字段
        print("\n=== 测试1: 缺少必需字段 ===")
        result1 = await handler.handle_ai_config({'provider': 'openai'})
        print(f"结果: {result1}")
        
        # 测试2: 无效的提供商
        print("\n=== 测试2: 无效的提供商 ===")
        result2 = await handler.handle_ai_config({
            'provider': 'invalid_provider',
            'model': 'test',
            'api_key': 'test'
        })
        print(f"结果: {result2}")
        
        # 测试3: API密钥格式错误
        print("\n=== 测试3: API密钥格式错误 ===")
        result3 = await handler.handle_ai_config({
            'provider': 'openai',
            'model': 'gpt-4',
            'api_key': 'invalid_key'
        })
        print(f"结果: {result3}")
        
        # 测试4: 正确的配置（需要有效的API密钥）
        print("\n=== 测试4: 正确的配置 ===")
        result4 = await handler.handle_ai_config({
            'provider': 'openai',
            'model': 'gpt-4o',
            'api_key': 'sk-test-key-1234567890abcdefghijklmnopqrstuvwxyz',
            'temperature': 0.7,
            'max_tokens': 2000
        })
        print(f"结果: {result4}")
    
    # 运行测试
    asyncio.run(test_handler())
