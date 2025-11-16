#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI配置管理器
负责管理AI模型配置、验证视觉支持能力、创建AI客户端
"""

import os
from dataclasses import dataclass
from typing import Optional, Dict, Any
import logging

# 导入错误处理模块
try:
    from ai_config_errors import AIConfigErrorHandler, AIConfigError, AIConfigErrorType
    ERROR_HANDLER_AVAILABLE = True
except ImportError:
    ERROR_HANDLER_AVAILABLE = False
    logger.warning("⚠️ AI配置错误处理模块不可用")

logger = logging.getLogger(__name__)


@dataclass
class AIConfig:
    """AI配置数据类"""
    provider: str  # openai, anthropic, google, etc.
    model: str
    api_key: str
    api_base: str
    supports_vision: bool
    max_tokens: int = 2000
    temperature: float = 0.7
    
    # 云端提示词服务配置
    cloud_prompt_service: Optional[str] = None
    cloud_api_key: Optional[str] = None


class AIConfigManager:
    """AI配置管理器"""
    
    # 支持视觉的模型列表
    VISION_MODELS = {
        'openai': [
            'gpt-4-vision-preview',
            'gpt-4-turbo',
            'gpt-4o',
            'gpt-4o-mini'
        ],
        'anthropic': [
            'claude-3-opus',
            'claude-3-sonnet',
            'claude-3-haiku',
            'claude-3-5-sonnet'
        ],
        'google': [
            'gemini-pro-vision',
            'gemini-1.5-pro',
            'gemini-1.5-flash'
        ],
        'qwen': [
            'qwen-vl-plus',
            'qwen-vl-max',
            'qwen-vl-chat',
            'qwen2-vl-7b-instruct',
            'qwen2-vl-72b-instruct',
            'qwen2-vl-2b-instruct',
            'qwen3-vl',
            'qwen3-vl-plus',
            'qwen3-vl-max'
        ],
        'dashscope': [
            'qwen-vl-plus',
            'qwen-vl-max',
            'qwen-vl-chat',
            'qwen2-vl-7b-instruct',
            'qwen2-vl-72b-instruct',
            'qwen2-vl-2b-instruct',
            'qwen3-vl',
            'qwen3-vl-plus',
            'qwen3-vl-max'
        ]
    }
    
    # 默认API端点
    DEFAULT_API_BASES = {
        'openai': 'https://api.openai.com/v1',
        'anthropic': 'https://api.anthropic.com',
        'google': 'https://generativelanguage.googleapis.com',
        'qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        'dashscope': 'https://dashscope.aliyuncs.com/api/v1'
    }
    
    def __init__(self):
        """初始化AI配置管理器"""
        self.config: Optional[AIConfig] = None
        self._load_env_config()
    
    def _load_env_config(self):
        """从环境变量加载默认配置（作为后备）"""
        provider = os.getenv('DEFAULT_AI_PROVIDER')
        model = os.getenv('DEFAULT_AI_MODEL')
        
        if provider and model:
            api_key = os.getenv(f'{provider.upper()}_API_KEY')
            api_base = os.getenv(f'{provider.upper()}_API_BASE')
            
            if api_key:
                logger.info(f"从环境变量加载默认AI配置: {provider}/{model}")
                self.config = AIConfig(
                    provider=provider,
                    model=model,
                    api_key=api_key,
                    api_base=api_base or self.DEFAULT_API_BASES.get(provider, ''),
                    supports_vision=self._check_vision_support(provider, model)
                )

    
    def load_config_from_frontend(self, config_data: Dict[str, Any]) -> AIConfig:
        """
        从前端传递的配置加载AI配置
        
        Args:
            config_data: 前端传递的配置字典，包含:
                - provider: AI提供商 (openai, anthropic, google)
                - model: 模型名称
                - api_key: API密钥
                - api_base: API端点 (可选)
                - max_tokens: 最大token数 (可选)
                - temperature: 温度参数 (可选)
                - cloud_prompt_service: 云端提示词服务URL (可选)
                - cloud_api_key: 云端服务API密钥 (可选)
        
        Returns:
            AIConfig对象
        
        Raises:
            ValueError: 配置无效时抛出
        """
        # 使用错误处理器验证配置
        if ERROR_HANDLER_AVAILABLE:
            validation_error = AIConfigErrorHandler.validate_config(config_data)
            if validation_error:
                logger.error(f"❌ 配置验证失败: {validation_error.message}")
                # 记录恢复建议
                for suggestion in validation_error.recovery_suggestions:
                    logger.info(f"💡 建议: {suggestion}")
                raise ValueError(validation_error.message)
        else:
            # 回退到基本验证
            required_fields = ['provider', 'model', 'api_key']
            for field in required_fields:
                if field not in config_data:
                    raise ValueError(f"缺少必需字段: {field}")
        
        provider = config_data['provider'].lower()
        model = config_data['model']
        api_key = config_data['api_key']
        
        # 验证提供商
        if provider not in self.VISION_MODELS:
            raise ValueError(f"不支持的AI提供商: {provider}")
        
        # 检查库可用性
        if ERROR_HANDLER_AVAILABLE:
            library_error = AIConfigErrorHandler.check_library_availability(provider)
            if library_error:
                logger.error(f"❌ 库检查失败: {library_error.message}")
                for suggestion in library_error.recovery_suggestions:
                    logger.info(f"💡 建议: {suggestion}")
                raise ImportError(library_error.message)
        
        # 获取或使用默认API端点
        api_base = config_data.get('api_base') or self.DEFAULT_API_BASES.get(provider, '')
        
        # 检查视觉支持
        supports_vision = self._check_vision_support(provider, model)
        
        # 创建配置对象
        self.config = AIConfig(
            provider=provider,
            model=model,
            api_key=api_key,
            api_base=api_base,
            supports_vision=supports_vision,
            max_tokens=config_data.get('max_tokens', 2000),
            temperature=config_data.get('temperature', 0.7),
            cloud_prompt_service=config_data.get('cloud_prompt_service'),
            cloud_api_key=config_data.get('cloud_api_key')
        )
        
        logger.info(f"✅ 加载AI配置: {provider}/{model}, 视觉支持: {supports_vision}")
        
        return self.config
    
    def _check_vision_support(self, provider: str, model: str) -> bool:
        """
        检查模型是否支持视觉功能
        
        Args:
            provider: AI提供商
            model: 模型名称
        
        Returns:
            是否支持视觉
        """
        if provider not in self.VISION_MODELS:
            return False
        
        # 转换为小写进行比较
        model_lower = model.lower()
        
        # 检查模型名称是否在支持列表中
        supported_models = self.VISION_MODELS[provider]
        
        # 精确匹配
        if model in supported_models:
            return True
        
        # 模糊匹配（处理版本号等）
        for supported_model in supported_models:
            if supported_model in model or model in supported_model:
                return True
        
        # 智能检测：检查模型名称中是否包含视觉相关关键词
        vision_keywords = [
            'vision', 'vl', 'visual', 'multimodal', 
            'image', 'video', 'see', 'view'
        ]
        
        # 对于qwen/dashscope提供商，特别检查vl关键词
        if provider in ['qwen', 'dashscope']:
            # qwen-vl, qwen2-vl, qwen3-vl 等都应该被识别
            if 'vl' in model_lower or 'vision' in model_lower:
                logger.info(f"✅ 通过关键词检测识别视觉模型: {model}")
                return True
        
        # 对于其他提供商，检查是否包含vision关键词
        for keyword in vision_keywords:
            if keyword in model_lower:
                logger.info(f"✅ 通过关键词检测识别视觉模型: {model} (关键词: {keyword})")
                return True
        
        # 如果都不匹配，记录警告但不直接拒绝
        logger.warning(f"⚠️ 模型 {model} 未在已知视觉模型列表中，但可能支持视觉功能")
        logger.warning(f"   如果该模型确实支持视觉，请将其添加到 VISION_MODELS 列表中")
        
        return False
    
    def validate_vision_support(self) -> bool:
        """
        验证当前配置的模型是否支持视觉功能
        
        Returns:
            是否支持视觉
        
        Raises:
            RuntimeError: 未配置AI模型时抛出
        """
        if not self.config:
            raise RuntimeError("未配置AI模型")
        
        if not self.config.supports_vision:
            logger.error(f"❌ 模型 {self.config.model} 不支持视觉功能")
            return False
        
        logger.info(f"✅ 模型 {self.config.model} 支持视觉功能")
        return True

    
    def get_client(self):
        """
        获取配置好的AI客户端
        
        Returns:
            AI客户端实例
        
        Raises:
            RuntimeError: 未配置AI模型时抛出
            ImportError: 缺少必需的库时抛出
        """
        if not self.config:
            raise RuntimeError("未配置AI模型，请先调用 load_config_from_frontend()")
        
        provider = self.config.provider
        
        if provider == 'openai':
            return self._create_openai_client()
        elif provider == 'anthropic':
            return self._create_anthropic_client()
        elif provider == 'google':
            return self._create_google_client()
        elif provider in ['qwen', 'dashscope']:
            # 千问可以使用OpenAI兼容接口或DashScope SDK
            if provider == 'qwen':
                return self._create_qwen_client()
            else:
                return self._create_dashscope_client()
        else:
            raise ValueError(f"不支持的AI提供商: {provider}")
    
    def _create_openai_client(self):
        """创建OpenAI客户端"""
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise ImportError("请安装 openai 库: pip install openai")
        
        client = AsyncOpenAI(
            api_key=self.config.api_key,
            base_url=self.config.api_base
        )
        
        logger.info(f"✅ 创建OpenAI客户端: {self.config.model}")
        return client
    
    def _create_anthropic_client(self):
        """创建Anthropic客户端"""
        try:
            from anthropic import AsyncAnthropic
        except ImportError:
            raise ImportError("请安装 anthropic 库: pip install anthropic")
        
        client = AsyncAnthropic(
            api_key=self.config.api_key,
            base_url=self.config.api_base if self.config.api_base else None
        )
        
        logger.info(f"✅ 创建Anthropic客户端: {self.config.model}")
        return client
    
    def _create_google_client(self):
        """创建Google客户端"""
        try:
            import google.generativeai as genai
        except ImportError:
            raise ImportError("请安装 google-generativeai 库: pip install google-generativeai")
        
        genai.configure(api_key=self.config.api_key)
        
        logger.info(f"✅ 创建Google客户端: {self.config.model}")
        return genai
    
    def _create_qwen_client(self):
        """创建千问客户端（使用OpenAI兼容接口）"""
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise ImportError("请安装 openai 库: pip install openai")
        
        # 千问使用OpenAI兼容的API接口
        client = AsyncOpenAI(
            api_key=self.config.api_key,
            base_url=self.config.api_base or self.DEFAULT_API_BASES['qwen']
        )
        
        logger.info(f"✅ 创建千问客户端: {self.config.model}")
        return client
    
    def _create_dashscope_client(self):
        """创建DashScope客户端（阿里云灵积）"""
        try:
            import dashscope
        except ImportError:
            raise ImportError("请安装 dashscope 库: pip install dashscope")
        
        # 配置DashScope API密钥
        dashscope.api_key = self.config.api_key
        
        logger.info(f"✅ 创建DashScope客户端: {self.config.model}")
        return dashscope
    
    def get_config(self) -> Optional[AIConfig]:
        """
        获取当前配置
        
        Returns:
            当前AI配置，如果未配置则返回None
        """
        return self.config
    
    def is_configured(self) -> bool:
        """
        检查是否已配置AI模型
        
        Returns:
            是否已配置
        """
        return self.config is not None
    
    def clear_config(self):
        """清除当前配置"""
        self.config = None
        logger.info("🧹 清除AI配置")
    
    def get_supported_models(self, provider: str) -> list:
        """
        获取指定提供商支持的视觉模型列表
        
        Args:
            provider: AI提供商
        
        Returns:
            支持的模型列表
        """
        return self.VISION_MODELS.get(provider.lower(), [])
    
    def get_supported_providers(self) -> list:
        """
        获取所有支持的AI提供商列表
        
        Returns:
            提供商列表
        """
        return list(self.VISION_MODELS.keys())


# 使用示例
if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 创建配置管理器
    manager = AIConfigManager()
    
    # 示例1: 从前端配置加载
    config_data = {
        'provider': 'openai',
        'model': 'gpt-4-vision-preview',
        'api_key': 'sk-test-key',
        'api_base': 'https://api.openai.com/v1',
        'max_tokens': 2000,
        'temperature': 0.7
    }
    
    try:
        config = manager.load_config_from_frontend(config_data)
        print(f"配置加载成功: {config}")
        
        # 验证视觉支持
        if manager.validate_vision_support():
            print("✅ 模型支持视觉功能")
        
        # 获取客户端（需要安装相应的库）
        # client = manager.get_client()
        
    except Exception as e:
        print(f"❌ 错误: {e}")
    
    # 示例2: 查询支持的模型
    print("\n支持的提供商:", manager.get_supported_providers())
    print("OpenAI支持的模型:", manager.get_supported_models('openai'))
    print("Anthropic支持的模型:", manager.get_supported_models('anthropic'))
    print("Google支持的模型:", manager.get_supported_models('google'))
