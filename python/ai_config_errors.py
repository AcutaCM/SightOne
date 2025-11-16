#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI配置错误处理模块
定义AI配置相关的错误类型、验证逻辑和恢复建议
"""

from enum import Enum
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


class AIConfigErrorType(Enum):
    """AI配置错误类型"""
    # 配置缺失错误
    MISSING_PROVIDER = "missing_provider"
    MISSING_MODEL = "missing_model"
    MISSING_API_KEY = "missing_api_key"
    MISSING_REQUIRED_FIELD = "missing_required_field"
    
    # 配置无效错误
    INVALID_PROVIDER = "invalid_provider"
    INVALID_MODEL = "invalid_model"
    INVALID_API_KEY_FORMAT = "invalid_api_key_format"
    INVALID_API_BASE = "invalid_api_base"
    INVALID_TEMPERATURE = "invalid_temperature"
    INVALID_MAX_TOKENS = "invalid_max_tokens"
    
    # API密钥验证错误
    API_KEY_UNAUTHORIZED = "api_key_unauthorized"
    API_KEY_EXPIRED = "api_key_expired"
    API_KEY_QUOTA_EXCEEDED = "api_key_quota_exceeded"
    API_KEY_INVALID = "api_key_invalid"
    
    # 库依赖错误
    LIBRARY_NOT_INSTALLED = "library_not_installed"
    LIBRARY_VERSION_INCOMPATIBLE = "library_version_incompatible"
    
    # 网络错误
    NETWORK_CONNECTION_ERROR = "network_connection_error"
    NETWORK_TIMEOUT = "network_timeout"
    API_ENDPOINT_UNREACHABLE = "api_endpoint_unreachable"
    
    # 模型能力错误
    MODEL_NOT_SUPPORT_VISION = "model_not_support_vision"
    MODEL_DEPRECATED = "model_deprecated"
    MODEL_NOT_FOUND = "model_not_found"
    
    # 其他错误
    UNKNOWN_ERROR = "unknown_error"
    CONFIGURATION_CONFLICT = "configuration_conflict"


@dataclass
class AIConfigError:
    """AI配置错误数据类"""
    error_type: AIConfigErrorType
    message: str
    details: Optional[str] = None
    field: Optional[str] = None
    recovery_suggestions: List[str] = None
    recoverable: bool = True
    
    def __post_init__(self):
        if self.recovery_suggestions is None:
            self.recovery_suggestions = []
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "error_type": self.error_type.value,
            "message": self.message,
            "details": self.details,
            "field": self.field,
            "recovery_suggestions": self.recovery_suggestions,
            "recoverable": self.recoverable
        }


class AIConfigErrorHandler:
    """AI配置错误处理器"""
    
    # 支持的AI提供商
    SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'google', 'ollama', 'qwen', 'dashscope']
    
    # API密钥格式验证规则
    API_KEY_PATTERNS = {
        'openai': {
            'prefix': 'sk-',
            'min_length': 20,
            'description': 'OpenAI API密钥应以sk-开头'
        },
        'anthropic': {
            'prefix': 'sk-ant-',
            'min_length': 20,
            'description': 'Anthropic API密钥应以sk-ant-开头'
        },
        'google': {
            'min_length': 20,
            'description': 'Google API密钥应为有效的字符串'
        },
        'ollama': {
            'optional': True,
            'description': 'Ollama本地部署可能不需要API密钥'
        },
        'qwen': {
            'prefix': 'sk-',
            'min_length': 20,
            'description': '千问API密钥应以sk-开头'
        },
        'dashscope': {
            'prefix': 'sk-',
            'min_length': 20,
            'description': 'DashScope API密钥应以sk-开头'
        }
    }
    
    # 必需的Python库
    REQUIRED_LIBRARIES = {
        'openai': 'openai',
        'anthropic': 'anthropic',
        'google': 'google-generativeai',
        'qwen': 'dashscope',
        'dashscope': 'dashscope'
    }
    
    @staticmethod
    def validate_config(config_data: Dict[str, Any]) -> Optional[AIConfigError]:
        """
        验证AI配置数据
        
        Args:
            config_data: 配置数据字典
        
        Returns:
            如果有错误返回AIConfigError，否则返回None
        """
        # 1. 检查必需字段
        required_fields = ['provider', 'model', 'api_key']
        for field in required_fields:
            if field not in config_data or not config_data[field]:
                return AIConfigError(
                    error_type=AIConfigErrorType.MISSING_REQUIRED_FIELD,
                    message=f"缺少必需字段: {field}",
                    field=field,
                    recovery_suggestions=[
                        f"请在AI配置中提供{field}字段",
                        "检查前端AssistantContext是否正确配置",
                        "确保选择的AI助理包含完整配置信息"
                    ],
                    recoverable=True
                )
        
        # 2. 验证提供商
        provider = config_data['provider'].lower()
        if provider not in AIConfigErrorHandler.SUPPORTED_PROVIDERS:
            return AIConfigError(
                error_type=AIConfigErrorType.INVALID_PROVIDER,
                message=f"不支持的AI提供商: {provider}",
                field='provider',
                details=f"支持的提供商: {', '.join(AIConfigErrorHandler.SUPPORTED_PROVIDERS)}",
                recovery_suggestions=[
                    f"请使用支持的AI提供商: {', '.join(AIConfigErrorHandler.SUPPORTED_PROVIDERS)}",
                    "检查前端AI助理配置中的provider字段",
                    "确保provider字段拼写正确（小写）"
                ],
                recoverable=True
            )
        
        # 3. 验证API密钥格式
        api_key = config_data['api_key']
        api_key_error = AIConfigErrorHandler.validate_api_key_format(provider, api_key)
        if api_key_error:
            return api_key_error
        
        # 4. 验证可选参数
        if 'temperature' in config_data:
            temp = config_data['temperature']
            if not isinstance(temp, (int, float)) or temp < 0 or temp > 2:
                return AIConfigError(
                    error_type=AIConfigErrorType.INVALID_TEMPERATURE,
                    message=f"无效的temperature参数: {temp}",
                    field='temperature',
                    details="temperature应在0到2之间",
                    recovery_suggestions=[
                        "将temperature设置为0到2之间的数值",
                        "推荐值: 0.7（平衡）, 0.3（保守）, 1.0（创造性）",
                        "如果不确定，可以省略此参数使用默认值0.7"
                    ],
                    recoverable=True
                )
        
        if 'max_tokens' in config_data:
            max_tokens = config_data['max_tokens']
            if not isinstance(max_tokens, int) or max_tokens < 1 or max_tokens > 100000:
                return AIConfigError(
                    error_type=AIConfigErrorType.INVALID_MAX_TOKENS,
                    message=f"无效的max_tokens参数: {max_tokens}",
                    field='max_tokens',
                    details="max_tokens应在1到100000之间",
                    recovery_suggestions=[
                        "将max_tokens设置为合理范围（如1000-4000）",
                        "对于命令解析任务，推荐值: 2000",
                        "如果不确定，可以省略此参数使用默认值"
                    ],
                    recoverable=True
                )
        
        # 5. 验证API端点（如果提供）
        if 'api_base' in config_data and config_data['api_base']:
            api_base = config_data['api_base']
            if not api_base.startswith(('http://', 'https://')):
                return AIConfigError(
                    error_type=AIConfigErrorType.INVALID_API_BASE,
                    message=f"无效的API端点: {api_base}",
                    field='api_base',
                    details="API端点应以http://或https://开头",
                    recovery_suggestions=[
                        "确保API端点URL格式正确",
                        "示例: https://api.openai.com/v1",
                        "如果使用默认端点，可以省略此参数"
                    ],
                    recoverable=True
                )
        
        # 所有验证通过
        return None
    
    @staticmethod
    def validate_api_key_format(provider: str, api_key: str) -> Optional[AIConfigError]:
        """
        验证API密钥格式
        
        Args:
            provider: AI提供商
            api_key: API密钥
        
        Returns:
            如果有错误返回AIConfigError，否则返回None
        """
        if provider not in AIConfigErrorHandler.API_KEY_PATTERNS:
            return None  # 未知提供商，跳过格式验证
        
        pattern = AIConfigErrorHandler.API_KEY_PATTERNS[provider]
        
        # 检查是否为可选
        if pattern.get('optional') and not api_key:
            return None
        
        # 检查长度
        min_length = pattern.get('min_length', 0)
        if len(api_key) < min_length:
            return AIConfigError(
                error_type=AIConfigErrorType.INVALID_API_KEY_FORMAT,
                message=f"API密钥长度不足: {len(api_key)} < {min_length}",
                field='api_key',
                details=pattern.get('description', ''),
                recovery_suggestions=[
                    f"请检查{provider}的API密钥是否完整",
                    "确保复制API密钥时没有遗漏字符",
                    f"访问{provider}官网重新生成API密钥"
                ],
                recoverable=True
            )
        
        # 检查前缀
        if 'prefix' in pattern:
            prefix = pattern['prefix']
            if not api_key.startswith(prefix):
                return AIConfigError(
                    error_type=AIConfigErrorType.INVALID_API_KEY_FORMAT,
                    message=f"API密钥格式错误: 应以{prefix}开头",
                    field='api_key',
                    details=pattern.get('description', ''),
                    recovery_suggestions=[
                        f"请检查{provider}的API密钥格式",
                        f"正确的API密钥应以{prefix}开头",
                        f"访问{provider}官网确认API密钥格式"
                    ],
                    recoverable=True
                )
        
        return None
    
    @staticmethod
    def check_library_availability(provider: str) -> Optional[AIConfigError]:
        """
        检查必需的Python库是否已安装
        
        Args:
            provider: AI提供商
        
        Returns:
            如果有错误返回AIConfigError，否则返回None
        """
        if provider not in AIConfigErrorHandler.REQUIRED_LIBRARIES:
            return None  # 不需要特定库
        
        library_name = AIConfigErrorHandler.REQUIRED_LIBRARIES[provider]
        
        try:
            __import__(library_name)
            return None  # 库已安装
        except ImportError:
            return AIConfigError(
                error_type=AIConfigErrorType.LIBRARY_NOT_INSTALLED,
                message=f"缺少必需的Python库: {library_name}",
                details=f"使用{provider}提供商需要安装{library_name}库",
                recovery_suggestions=[
                    f"运行命令安装: pip install {library_name}",
                    f"或安装完整依赖: pip install -r requirements.txt",
                    f"确保Python环境中已安装{library_name}",
                    "重启后端服务以加载新安装的库"
                ],
                recoverable=True
            )
    
    @staticmethod
    def handle_api_error(error: Exception, provider: str) -> AIConfigError:
        """
        处理API调用错误
        
        Args:
            error: 异常对象
            provider: AI提供商
        
        Returns:
            AIConfigError对象
        """
        error_str = str(error).lower()
        
        # 401 Unauthorized - API密钥无效
        if '401' in error_str or 'unauthorized' in error_str or 'invalid api key' in error_str:
            return AIConfigError(
                error_type=AIConfigErrorType.API_KEY_UNAUTHORIZED,
                message="API密钥验证失败",
                details=str(error),
                recovery_suggestions=[
                    f"检查{provider}的API密钥是否正确",
                    "确保API密钥没有过期",
                    f"访问{provider}官网验证API密钥状态",
                    "尝试重新生成API密钥",
                    "检查API密钥是否有正确的权限"
                ],
                recoverable=True
            )
        
        # 403 Forbidden - 配额超限或权限不足
        if '403' in error_str or 'quota' in error_str or 'rate limit' in error_str:
            return AIConfigError(
                error_type=AIConfigErrorType.API_KEY_QUOTA_EXCEEDED,
                message="API配额已超限或权限不足",
                details=str(error),
                recovery_suggestions=[
                    f"检查{provider}账户的API配额使用情况",
                    "等待配额重置或升级账户套餐",
                    "检查API密钥是否有足够的权限",
                    "考虑使用其他AI提供商作为备选"
                ],
                recoverable=True
            )
        
        # 404 Not Found - 模型不存在
        if '404' in error_str or 'not found' in error_str or 'model not found' in error_str:
            return AIConfigError(
                error_type=AIConfigErrorType.MODEL_NOT_FOUND,
                message="指定的模型不存在",
                details=str(error),
                recovery_suggestions=[
                    "检查模型名称是否正确",
                    f"访问{provider}官网查看可用模型列表",
                    "确保模型名称拼写正确（区分大小写）",
                    "某些模型可能需要特定的API权限"
                ],
                recoverable=True
            )
        
        # 网络连接错误
        if 'connection' in error_str or 'timeout' in error_str or 'network' in error_str:
            return AIConfigError(
                error_type=AIConfigErrorType.NETWORK_CONNECTION_ERROR,
                message="网络连接失败",
                details=str(error),
                recovery_suggestions=[
                    "检查网络连接是否正常",
                    "确认API端点URL是否正确",
                    "检查防火墙或代理设置",
                    "尝试使用VPN或更换网络环境",
                    "稍后重试"
                ],
                recoverable=True
            )
        
        # 其他未知错误
        return AIConfigError(
            error_type=AIConfigErrorType.UNKNOWN_ERROR,
            message="AI配置错误",
            details=str(error),
            recovery_suggestions=[
                "检查所有配置参数是否正确",
                "查看详细错误信息以获取更多线索",
                "尝试使用其他AI提供商",
                "联系技术支持获取帮助"
            ],
            recoverable=True
        )
    
    @staticmethod
    def get_recovery_guide(error: AIConfigError) -> Dict[str, Any]:
        """
        获取详细的恢复指南
        
        Args:
            error: AI配置错误对象
        
        Returns:
            恢复指南字典
        """
        guide = {
            "error_summary": error.message,
            "error_type": error.error_type.value,
            "severity": "high" if not error.recoverable else "medium",
            "immediate_actions": error.recovery_suggestions[:2] if error.recovery_suggestions else [],
            "detailed_steps": error.recovery_suggestions,
            "additional_resources": []
        }
        
        # 根据错误类型添加额外资源
        if error.error_type in [AIConfigErrorType.MISSING_PROVIDER, AIConfigErrorType.INVALID_PROVIDER]:
            guide["additional_resources"] = [
                "支持的AI提供商文档",
                "AI助理配置指南",
                "前端AssistantContext使用说明"
            ]
        
        elif error.error_type in [AIConfigErrorType.API_KEY_UNAUTHORIZED, AIConfigErrorType.API_KEY_INVALID]:
            guide["additional_resources"] = [
                "OpenAI API密钥获取: https://platform.openai.com/api-keys",
                "Anthropic API密钥获取: https://console.anthropic.com/",
                "Google AI Studio: https://makersuite.google.com/app/apikey"
            ]
        
        elif error.error_type == AIConfigErrorType.LIBRARY_NOT_INSTALLED:
            guide["additional_resources"] = [
                "Python包安装指南",
                "requirements.txt文件说明",
                "虚拟环境配置教程"
            ]
        
        return guide


# 使用示例
if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 测试1: 缺少必需字段
    print("=== 测试1: 缺少必需字段 ===")
    config1 = {'provider': 'openai'}
    error1 = AIConfigErrorHandler.validate_config(config1)
    if error1:
        print(f"错误: {error1.message}")
        print(f"恢复建议: {error1.recovery_suggestions}")
        print()
    
    # 测试2: 无效的提供商
    print("=== 测试2: 无效的提供商 ===")
    config2 = {'provider': 'invalid_provider', 'model': 'test', 'api_key': 'test'}
    error2 = AIConfigErrorHandler.validate_config(config2)
    if error2:
        print(f"错误: {error2.message}")
        print(f"详情: {error2.details}")
        print(f"恢复建议: {error2.recovery_suggestions}")
        print()
    
    # 测试3: API密钥格式错误
    print("=== 测试3: API密钥格式错误 ===")
    config3 = {'provider': 'openai', 'model': 'gpt-4', 'api_key': 'invalid_key'}
    error3 = AIConfigErrorHandler.validate_config(config3)
    if error3:
        print(f"错误: {error3.message}")
        print(f"详情: {error3.details}")
        print(f"恢复建议: {error3.recovery_suggestions}")
        print()
    
    # 测试4: 检查库可用性
    print("=== 测试4: 检查库可用性 ===")
    error4 = AIConfigErrorHandler.check_library_availability('openai')
    if error4:
        print(f"错误: {error4.message}")
        print(f"恢复建议: {error4.recovery_suggestions}")
    else:
        print("✅ 库已安装")
    print()
    
    # 测试5: 获取恢复指南
    print("=== 测试5: 获取恢复指南 ===")
    if error2:
        guide = AIConfigErrorHandler.get_recovery_guide(error2)
        print(f"错误摘要: {guide['error_summary']}")
        print(f"严重程度: {guide['severity']}")
        print(f"立即行动: {guide['immediate_actions']}")
        print(f"详细步骤: {guide['detailed_steps']}")
        print(f"额外资源: {guide['additional_resources']}")
