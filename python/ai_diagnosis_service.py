#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI诊断服务
负责调用AI模型生成遮罩提示词和诊断报告
"""

import time
import logging
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime
from ai_config_manager import AIConfigManager

logger = logging.getLogger(__name__)


@dataclass
class DiagnosisReport:
    """诊断报告数据类"""
    id: str
    plant_id: int
    timestamp: str
    
    # 图像数据
    original_image: str  # base64
    mask_image: Optional[str]  # base64
    mask_prompt: Optional[str]  # AI生成的遮罩提示词
    
    # AI诊断结果
    markdown_report: str  # Markdown格式报告
    summary: str
    severity: str  # low, medium, high
    diseases: List[str]
    recommendations: List[str]
    
    # 元数据
    ai_model: str
    confidence: float
    processing_time: float


# 提示词模板
MASK_PROMPT_GENERATION = """你是一位专业的植物病理学家。请仔细观察这张植株图像，识别图像中可能存在的病害或异常区域。

你的任务是生成一个简洁、精确的描述，用于指导图像分割系统标注病害区域。

要求：
1. 只描述病害或异常的具体部位和特征
2. 使用简洁的中文短语（10-20字）
3. 聚焦于视觉特征（颜色、形状、位置）
4. 不要包含诊断结论或建议

示例输出：
- "叶片上的黄褐色斑点区域"
- "茎部的深褐色腐烂部分"
- "果实表面的灰白色霉变组织"
- "叶缘的枯黄卷曲部位"

请直接输出描述，不要包含其他内容。"""


DIAGNOSIS_PROMPT_TEMPLATE = """你是一位专业的植物病理学家。请基于提供的信息分析这张植株图像并提供详细的诊断报告。

植株ID: {plant_id}

{mask_info}

可用信息：
- 原始植株图像
{mask_details}

请按以下格式提供诊断报告（使用Markdown格式）：

## 诊断摘要
[简要总结植株健康状况，2-3句话]

## 病害识别
[列出识别到的病害名称，如果有多个请分点列出]

## 严重程度
- 等级: [低/中/高]
- 置信度: [百分比]
- 影响范围: [描述受影响的部位和程度]

## 详细分析
### 病害特征
[详细描述观察到的病害特征]

### 可能原因
[分析导致病害的可能原因]

### 发展趋势
[预测病害可能的发展情况]

## 建议措施
### 立即措施
1. [需要立即采取的措施]
2. [第二项紧急措施]

### 后续处理
1. [后续需要的处理步骤]
2. [长期管理建议]

## 预防措施
[预防类似问题再次发生的建议]

---
*注意：本诊断基于图像分析，建议结合实地观察和专业检测确认。*"""


class AIDiagnosisService:
    """AI诊断服务"""
    
    def __init__(self, config_manager: AIConfigManager):
        """
        初始化AI诊断服务
        
        Args:
            config_manager: AI配置管理器
        """
        self.config_manager = config_manager
        self.client = None

    
    async def generate_mask_prompt(self, image_base64: str) -> str:
        """
        阶段1：AI分析图像，生成描述遮罩部位的专属提示词
        
        Args:
            image_base64: 图像base64编码
        
        Returns:
            专门用于Unipixel的遮罩提示词
        
        Raises:
            RuntimeError: AI未配置或调用失败
        """
        if not self.config_manager.is_configured():
            raise RuntimeError("AI模型未配置")
        
        if not self.config_manager.validate_vision_support():
            raise RuntimeError("当前模型不支持视觉功能")
        
        logger.info("🔍 阶段1: AI生成遮罩提示词...")
        start_time = time.time()
        
        try:
            # 获取AI客户端
            if not self.client:
                self.client = self.config_manager.get_client()
            
            config = self.config_manager.get_config()
            provider = config.provider
            
            # 根据不同提供商调用API
            if provider == 'openai':
                mask_prompt = await self._generate_mask_prompt_openai(image_base64)
            elif provider == 'anthropic':
                mask_prompt = await self._generate_mask_prompt_anthropic(image_base64)
            elif provider == 'google':
                mask_prompt = await self._generate_mask_prompt_google(image_base64)
            elif provider in ['qwen', 'dashscope']:
                # qwen和dashscope需要特殊的图像格式处理
                mask_prompt = await self._generate_mask_prompt_qwen(image_base64)
            else:
                raise ValueError(f"不支持的提供商: {provider}")
            
            processing_time = time.time() - start_time
            logger.info(f"✅ 遮罩提示词生成成功 (耗时: {processing_time:.2f}秒)")
            logger.info(f"   提示词: {mask_prompt}")
            
            return mask_prompt.strip()
            
        except Exception as e:
            logger.error(f"❌ 生成遮罩提示词失败: {e}")
            raise
    
    async def _generate_mask_prompt_openai(self, image_base64: str) -> str:
        """使用OpenAI生成遮罩提示词"""
        config = self.config_manager.get_config()
        
        try:
            logger.info(f"📡 调用API: {config.provider}/{config.model}")
            logger.info(f"   端点: {config.api_base}")
            logger.info(f"   API密钥: {'已设置' if config.api_key else '未设置'}")
            
            response = await self.client.chat.completions.create(
                model=config.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": MASK_PROMPT_GENERATION},
                            {
                                "type": "image_url",
                                "image_url": {"url": image_base64}
                            }
                        ]
                    }
                ],
                max_tokens=100,
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"❌ API调用失败: {type(e).__name__}: {str(e)}")
            logger.error(f"   提供商: {config.provider}")
            logger.error(f"   模型: {config.model}")
            logger.error(f"   端点: {config.api_base}")
            
            # 提供更具体的错误信息
            if "Connection" in str(e) or "connection" in str(e).lower():
                logger.error("   💡 建议: 检查网络连接和API端点是否正确")
            elif "401" in str(e) or "Unauthorized" in str(e):
                logger.error("   💡 建议: 检查API密钥是否有效")
            elif "404" in str(e) or "Not Found" in str(e):
                logger.error("   💡 建议: 检查API端点和模型名称是否正确")
            elif "timeout" in str(e).lower():
                logger.error("   💡 建议: API响应超时，请稍后重试")
            
            raise
    
    async def _generate_mask_prompt_qwen(self, image_base64: str) -> str:
        """使用Qwen生成遮罩提示词（使用requests直接HTTP调用）"""
        import requests
        import json
        
        config = self.config_manager.get_config()
        
        try:
            logger.info(f"📡 调用Qwen API (HTTP): {config.model}")
            logger.info(f"   端点: {config.api_base}")
            
            # Qwen需要完整的data URL格式
            if not image_base64.startswith('data:image/'):
                image_base64 = f"data:image/png;base64,{image_base64}"
            
            logger.info(f"   图像格式: {image_base64[:50]}...")
            
            # 构建endpoint
            endpoint = config.api_base.rstrip('/')
            if not endpoint.endswith('/chat/completions'):
                endpoint = f"{endpoint}/chat/completions"
            
            # 构建请求
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {config.api_key}'
            }
            
            payload = {
                'model': config.model,
                'messages': [
                    {
                        'role': 'user',
                        'content': [
                            {'type': 'text', 'text': MASK_PROMPT_GENERATION},
                            {
                                'type': 'image_url',
                                'image_url': {'url': image_base64}
                            }
                        ]
                    }
                ],
                'max_tokens': 100,
                'temperature': 0.3
            }
            
            logger.info(f"   发送请求到: {endpoint}")
            
            # 发送请求 (禁用代理)
            response = requests.post(
                endpoint,
                headers=headers,
                json=payload,
                timeout=60,
                proxies={'http': None, 'https': None}  # 禁用代理
            )
            
            logger.info(f"   响应状态: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"   响应内容: {response.text}")
                response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            logger.info(f"✅ Qwen API调用成功")
            return content
            
        except requests.exceptions.ConnectionError as e:
            logger.error(f"❌ Qwen连接错误: {str(e)}")
            logger.error(f"   💡 建议: 检查网络连接和API端点 {config.api_base}")
            raise
        except requests.exceptions.Timeout as e:
            logger.error(f"❌ Qwen请求超时: {str(e)}")
            logger.error(f"   💡 建议: 增加超时时间或稍后重试")
            raise
        except requests.exceptions.HTTPError as e:
            logger.error(f"❌ Qwen HTTP错误: {str(e)}")
            logger.error(f"   💡 响应: {response.text if 'response' in locals() else 'N/A'}")
            raise
        except Exception as e:
            logger.error(f"❌ Qwen API调用失败: {type(e).__name__}: {str(e)}")
            raise
    
    async def _generate_mask_prompt_anthropic(self, image_base64: str) -> str:
        """使用Anthropic生成遮罩提示词"""
        config = self.config_manager.get_config()
        
        # 提取base64数据（移除data:image/...前缀）
        if ',' in image_base64:
            media_type = image_base64.split(';')[0].split(':')[1]
            base64_data = image_base64.split(',')[1]
        else:
            media_type = "image/png"
            base64_data = image_base64
        
        response = await self.client.messages.create(
            model=config.model,
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": base64_data
                            }
                        },
                        {
                            "type": "text",
                            "text": MASK_PROMPT_GENERATION
                        }
                    ]
                }
            ]
        )
        
        return response.content[0].text
    
    async def _generate_mask_prompt_google(self, image_base64: str) -> str:
        """使用Google生成遮罩提示词"""
        import google.generativeai as genai
        from PIL import Image
        import io
        import base64
        
        config = self.config_manager.get_config()
        model = genai.GenerativeModel(config.model)
        
        # 解码base64图像
        if ',' in image_base64:
            base64_data = image_base64.split(',')[1]
        else:
            base64_data = image_base64
        
        image_data = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_data))
        
        response = await model.generate_content_async(
            [MASK_PROMPT_GENERATION, image],
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=100,
                temperature=0.3
            )
        )
        
        return response.text

    
    async def diagnose(
        self,
        plant_id: int,
        image_base64: str,
        mask_base64: Optional[str] = None,
        mask_description: Optional[str] = None,
        mask_prompt: Optional[str] = None
    ) -> DiagnosisReport:
        """
        阶段3：生成最终诊断报告
        
        Args:
            plant_id: 植株ID
            image_base64: 原始图像base64
            mask_base64: 遮罩图base64（可选）
            mask_description: 遮罩区域描述（可选）
            mask_prompt: AI生成的遮罩提示词（可选）
        
        Returns:
            DiagnosisReport对象
        
        Raises:
            RuntimeError: AI未配置或调用失败
        """
        if not self.config_manager.is_configured():
            raise RuntimeError("AI模型未配置")
        
        if not self.config_manager.validate_vision_support():
            raise RuntimeError("当前模型不支持视觉功能")
        
        logger.info(f"🔍 阶段3: AI生成诊断报告 (植株ID: {plant_id})...")
        start_time = time.time()
        
        try:
            # 获取AI客户端
            if not self.client:
                self.client = self.config_manager.get_client()
            
            config = self.config_manager.get_config()
            provider = config.provider
            
            # 构建提示词
            prompt = self._build_diagnosis_prompt(
                plant_id, mask_description, mask_prompt
            )
            
            # 根据不同提供商调用API
            if provider == 'openai':
                markdown_report = await self._diagnose_openai(
                    prompt, image_base64, mask_base64
                )
            elif provider == 'anthropic':
                markdown_report = await self._diagnose_anthropic(
                    prompt, image_base64, mask_base64
                )
            elif provider == 'google':
                markdown_report = await self._diagnose_google(
                    prompt, image_base64, mask_base64
                )
            elif provider in ['qwen', 'dashscope']:
                # qwen和dashscope需要特殊的图像格式处理
                markdown_report = await self._diagnose_qwen(
                    prompt, image_base64, mask_base64
                )
            else:
                raise ValueError(f"不支持的提供商: {provider}")
            
            processing_time = time.time() - start_time
            
            # 解析报告提取关键信息
            summary, severity, diseases, recommendations, confidence = \
                self._parse_report(markdown_report)
            
            # 确保遮罩图有正确的data URL前缀
            if mask_base64:
                logger.info(f"📊 遮罩图数据检查:")
                logger.info(f"   存在: True")
                logger.info(f"   长度: {len(mask_base64)}")
                logger.info(f"   前50字符: {mask_base64[:50]}")
                
                if not mask_base64.startswith('data:image/'):
                    mask_base64 = f"data:image/png;base64,{mask_base64}"
                    logger.info(f"✅ 已为遮罩图添加data URL前缀")
                else:
                    logger.info(f"✅ 遮罩图已有data URL前缀")
            else:
                logger.warning(f"⚠️  遮罩图数据为空")
            
            # 生成报告ID
            report_id = f"diag_{plant_id}_{int(time.time())}"
            
            # 创建报告对象
            report = DiagnosisReport(
                id=report_id,
                plant_id=plant_id,
                timestamp=datetime.now().isoformat(),
                original_image=image_base64,
                mask_image=mask_base64,
                mask_prompt=mask_prompt,
                markdown_report=markdown_report,
                summary=summary,
                severity=severity,
                diseases=diseases,
                recommendations=recommendations,
                ai_model=config.model,
                confidence=confidence,
                processing_time=processing_time
            )
            
            logger.info(f"✅ 诊断报告生成成功 (耗时: {processing_time:.2f}秒)")
            logger.info(f"   严重程度: {severity}")
            logger.info(f"   置信度: {confidence:.1%}")
            
            return report
            
        except Exception as e:
            logger.error(f"❌ 生成诊断报告失败: {e}")
            raise
    
    def _build_diagnosis_prompt(
        self,
        plant_id: int,
        mask_description: Optional[str],
        mask_prompt: Optional[str]
    ) -> str:
        """构建诊断提示词"""
        
        # 构建遮罩信息部分
        if mask_description and mask_prompt:
            mask_info = "**重点关注区域**：图像中已标注病害可疑区域"
            mask_details = f"""- 病害区域遮罩图：已生成
- AI识别的病害部位：{mask_prompt}
- 遮罩区域描述：{mask_description}"""
        elif mask_prompt:
            mask_info = "**重点关注区域**：AI已识别病害可疑部位"
            mask_details = f"- AI识别的病害部位：{mask_prompt}"
        else:
            mask_info = ""
            mask_details = "- 注意：本次诊断未生成遮罩图，请基于整体图像进行分析。"
        
        # 填充模板
        prompt = DIAGNOSIS_PROMPT_TEMPLATE.format(
            plant_id=plant_id,
            mask_info=mask_info,
            mask_details=mask_details
        )
        
        return prompt
    
    async def _diagnose_openai(
        self,
        prompt: str,
        image_base64: str,
        mask_base64: Optional[str]
    ) -> str:
        """使用OpenAI生成诊断报告"""
        config = self.config_manager.get_config()
        
        try:
            logger.info(f"📡 调用诊断API: {config.provider}/{config.model}")
            logger.info(f"   端点: {config.api_base}")
            logger.info(f"   包含遮罩图: {'是' if mask_base64 else '否'}")
            
            # 构建消息内容
            content = [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_base64}}
            ]
            
            # 如果有遮罩图，也添加进去
            if mask_base64:
                content.append({
                    "type": "image_url",
                    "image_url": {"url": mask_base64}
                })
            
            response = await self.client.chat.completions.create(
                model=config.model,
                messages=[{"role": "user", "content": content}],
                max_tokens=config.max_tokens,
                temperature=config.temperature
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"❌ 诊断API调用失败: {type(e).__name__}: {str(e)}")
            logger.error(f"   提供商: {config.provider}")
            logger.error(f"   模型: {config.model}")
            logger.error(f"   端点: {config.api_base}")
            logger.error(f"   max_tokens: {config.max_tokens}")
            
            # 提供更具体的错误信息
            error_str = str(e).lower()
            if "connection" in error_str:
                logger.error("   💡 建议: 检查网络连接和API端点")
                logger.error("   💡 测试命令: curl -I " + config.api_base)
            elif "401" in str(e) or "unauthorized" in error_str:
                logger.error("   💡 建议: API密钥无效或已过期")
                logger.error("   💡 请在PureChat中重新配置API密钥")
            elif "404" in str(e) or "not found" in error_str:
                logger.error("   💡 建议: API端点或模型名称错误")
                logger.error(f"   💡 当前端点: {config.api_base}")
                logger.error(f"   💡 当前模型: {config.model}")
            elif "timeout" in error_str:
                logger.error("   💡 建议: API响应超时，请稍后重试或增加超时时间")
            elif "rate" in error_str or "quota" in error_str:
                logger.error("   💡 建议: API配额不足或达到速率限制")
            
            raise
    
    async def _diagnose_anthropic(
        self,
        prompt: str,
        image_base64: str,
        mask_base64: Optional[str]
    ) -> str:
        """使用Anthropic生成诊断报告"""
        config = self.config_manager.get_config()
        
        # 提取base64数据
        def extract_base64(data_url: str):
            if ',' in data_url:
                media_type = data_url.split(';')[0].split(':')[1]
                base64_data = data_url.split(',')[1]
            else:
                media_type = "image/png"
                base64_data = data_url
            return media_type, base64_data
        
        # 构建消息内容
        content = []
        
        # 添加原始图像
        media_type, base64_data = extract_base64(image_base64)
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": base64_data
            }
        })
        
        # 如果有遮罩图，也添加
        if mask_base64:
            media_type, base64_data = extract_base64(mask_base64)
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": base64_data
                }
            })
        
        # 添加提示词
        content.append({"type": "text", "text": prompt})
        
        response = await self.client.messages.create(
            model=config.model,
            max_tokens=config.max_tokens,
            messages=[{"role": "user", "content": content}]
        )
        
        return response.content[0].text
    
    async def _diagnose_qwen(
        self,
        prompt: str,
        image_base64: str,
        mask_base64: Optional[str]
    ) -> str:
        """使用Qwen生成诊断报告（使用requests直接HTTP调用）"""
        import requests
        import json
        
        config = self.config_manager.get_config()
        
        try:
            logger.info(f"📡 调用Qwen诊断API (HTTP): {config.model}")
            logger.info(f"   端点: {config.api_base}")
            logger.info(f"   包含遮罩图: {'是' if mask_base64 else '否'}")
            
            # 确保图像URL格式正确
            if not image_base64.startswith('data:image/'):
                image_base64 = f"data:image/png;base64,{image_base64}"
            
            if mask_base64 and not mask_base64.startswith('data:image/'):
                mask_base64 = f"data:image/png;base64,{mask_base64}"
            
            # 构建消息内容
            content = [
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": image_base64}
                }
            ]
            
            # 如果有遮罩图，也添加进去
            if mask_base64:
                content.append({
                    "type": "image_url",
                    "image_url": {"url": mask_base64}
                })
            
            # 构建endpoint
            endpoint = config.api_base.rstrip('/')
            if not endpoint.endswith('/chat/completions'):
                endpoint = f"{endpoint}/chat/completions"
            
            # 构建请求
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {config.api_key}'
            }
            
            payload = {
                'model': config.model,
                'messages': [{'role': 'user', 'content': content}],
                'max_tokens': config.max_tokens,
                'temperature': config.temperature
            }
            
            logger.info(f"   发送请求到: {endpoint}")
            
            # 发送请求 (禁用代理)
            response = requests.post(
                endpoint,
                headers=headers,
                json=payload,
                timeout=120,  # 诊断可能需要更长时间
                proxies={'http': None, 'https': None}  # 禁用代理
            )
            
            logger.info(f"   响应状态: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"   响应内容: {response.text}")
                response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            logger.info(f"✅ Qwen诊断API调用成功")
            return content
            
        except requests.exceptions.ConnectionError as e:
            logger.error(f"❌ Qwen诊断连接错误: {str(e)}")
            logger.error(f"   💡 建议: 检查网络连接和API端点 {config.api_base}")
            raise
        except requests.exceptions.Timeout as e:
            logger.error(f"❌ Qwen诊断请求超时: {str(e)}")
            logger.error(f"   💡 建议: 增加超时时间或稍后重试")
            raise
        except requests.exceptions.HTTPError as e:
            logger.error(f"❌ Qwen诊断HTTP错误: {str(e)}")
            logger.error(f"   💡 响应: {response.text if 'response' in locals() else 'N/A'}")
            raise
        except Exception as e:
            logger.error(f"❌ Qwen诊断API调用失败: {type(e).__name__}: {str(e)}")
            raise
    
    async def _diagnose_google(
        self,
        prompt: str,
        image_base64: str,
        mask_base64: Optional[str]
    ) -> str:
        """使用Google生成诊断报告"""
        import google.generativeai as genai
        from PIL import Image
        import io
        import base64
        
        config = self.config_manager.get_config()
        model = genai.GenerativeModel(config.model)
        
        # 解码图像
        def decode_image(data_url: str):
            if ',' in data_url:
                base64_data = data_url.split(',')[1]
            else:
                base64_data = data_url
            image_data = base64.b64decode(base64_data)
            return Image.open(io.BytesIO(image_data))
        
        # 构建内容
        content = [prompt, decode_image(image_base64)]
        
        # 如果有遮罩图，也添加
        if mask_base64:
            content.append(decode_image(mask_base64))
        
        response = await model.generate_content_async(
            content,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=config.max_tokens,
                temperature=config.temperature
            )
        )
        
        return response.text

    
    def _parse_report(self, markdown_report: str) -> tuple:
        """
        解析Markdown报告，提取关键信息
        
        Args:
            markdown_report: Markdown格式的诊断报告
        
        Returns:
            (summary, severity, diseases, recommendations, confidence)
        """
        import re
        
        # 提取诊断摘要
        summary_match = re.search(r'## 诊断摘要\s*\n(.+?)(?=\n##|\Z)', markdown_report, re.DOTALL)
        summary = summary_match.group(1).strip() if summary_match else "未提供摘要"
        
        # 提取严重程度
        severity = "medium"  # 默认值
        severity_match = re.search(r'等级:\s*\[?(低|中|高)\]?', markdown_report)
        if severity_match:
            severity_text = severity_match.group(1)
            severity_map = {"低": "low", "中": "medium", "高": "high"}
            severity = severity_map.get(severity_text, "medium")
        
        # 提取病害列表
        diseases = []
        diseases_section = re.search(r'## 病害识别\s*\n(.+?)(?=\n##|\Z)', markdown_report, re.DOTALL)
        if diseases_section:
            diseases_text = diseases_section.group(1)
            # 提取列表项或逗号分隔的病害名称
            disease_items = re.findall(r'[-*]\s*(.+?)(?=\n|$)', diseases_text)
            if disease_items:
                diseases = [d.strip() for d in disease_items]
            else:
                # 尝试提取逗号分隔的病害
                diseases = [d.strip() for d in diseases_text.split(',') if d.strip()]
        
        # 提取建议措施
        recommendations = []
        recommendations_section = re.search(r'## 建议措施\s*\n(.+?)(?=\n##|\Z)', markdown_report, re.DOTALL)
        if recommendations_section:
            rec_text = recommendations_section.group(1)
            # 提取编号列表项
            rec_items = re.findall(r'\d+\.\s*(.+?)(?=\n|$)', rec_text)
            recommendations = [r.strip() for r in rec_items if r.strip()]
        
        # 提取置信度
        confidence = 0.75  # 默认值
        confidence_match = re.search(r'置信度:\s*\[?(\d+(?:\.\d+)?)\s*%?\]?', markdown_report)
        if confidence_match:
            confidence_value = float(confidence_match.group(1))
            # 如果是百分比形式，转换为小数
            if confidence_value > 1:
                confidence = confidence_value / 100
            else:
                confidence = confidence_value
        
        return summary, severity, diseases, recommendations, confidence


# 使用示例
async def main():
    """测试示例"""
    import logging
    from ai_config_manager import AIConfigManager
    
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 创建配置管理器
    config_manager = AIConfigManager()
    
    # 加载配置（示例）
    config_data = {
        'provider': 'openai',
        'model': 'gpt-4-vision-preview',
        'api_key': 'sk-test-key',
        'api_base': 'https://api.openai.com/v1'
    }
    
    try:
        config_manager.load_config_from_frontend(config_data)
        
        # 创建诊断服务
        service = AIDiagnosisService(config_manager)
        
        print("✅ AI诊断服务创建成功")
        print(f"   提供商: {config_manager.get_config().provider}")
        print(f"   模型: {config_manager.get_config().model}")
        
        # 实际使用时需要真实的图像和API密钥
        # mask_prompt = await service.generate_mask_prompt(image_base64)
        # report = await service.diagnose(plant_id=1, image_base64=image_base64)
        
    except Exception as e:
        print(f"❌ 错误: {e}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
