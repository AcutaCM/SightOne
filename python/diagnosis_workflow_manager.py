#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
诊断工作流管理器
管理植株诊断工作流的触发、冷却和状态跟踪
集成AI配置、Unipixel和AI诊断服务
"""

import time
import base64
import logging
from typing import Dict, List, Optional, Callable
from datetime import datetime
import numpy as np
import cv2

from ai_config_manager import AIConfigManager
from unipixel_client import UnipixelClient
from ai_diagnosis_service import AIDiagnosisService, DiagnosisReport

logger = logging.getLogger(__name__)


class DiagnosisWorkflowManager:
    """诊断工作流管理器"""
    
    def __init__(self, cooldown_seconds: int = 30):
        """
        初始化诊断工作流管理器
        
        Args:
            cooldown_seconds: 同一植株ID的诊断冷却时间（秒）
        """
        self.enabled: bool = False
        self.cooldown_seconds: int = cooldown_seconds
        
        # 活跃诊断：plant_id -> 冷却结束时间戳
        self.active_diagnoses: Dict[int, float] = {}
        
        # 诊断历史
        self.diagnosis_history: List[Dict] = []
        self.max_history: int = 100
        
        # 新增：服务依赖
        self.ai_config_manager: Optional[AIConfigManager] = None
        self.unipixel_client: Optional[UnipixelClient] = None
        self.ai_diagnosis_service: Optional[AIDiagnosisService] = None
        
        # 进度回调函数
        self.progress_callback: Optional[Callable] = None
        
        # 初始化服务
        self._initialize_services()
    
    def _initialize_services(self):
        """初始化AI和Unipixel服务"""
        try:
            # 初始化AI配置管理器
            self.ai_config_manager = AIConfigManager()
            logger.info("✅ AI配置管理器初始化成功")
            
            # 初始化Unipixel客户端
            self.unipixel_client = UnipixelClient()
            logger.info("✅ Unipixel客户端初始化成功")
            
            # AI诊断服务将在配置AI后创建
            logger.info("ℹ️ AI诊断服务将在配置AI后创建")
            
        except Exception as e:
            logger.error(f"❌ 服务初始化失败: {e}")
    
    def set_ai_config(self, config_data: Dict):
        """
        设置AI配置（从前端传递）
        
        Args:
            config_data: AI配置数据
        """
        try:
            if not self.ai_config_manager:
                self.ai_config_manager = AIConfigManager()
            
            self.ai_config_manager.load_config_from_frontend(config_data)
            
            # 创建AI诊断服务
            self.ai_diagnosis_service = AIDiagnosisService(self.ai_config_manager)
            
            logger.info(f"✅ AI配置已更新: {config_data.get('provider')}/{config_data.get('model')}")
            
        except Exception as e:
            logger.error(f"❌ 设置AI配置失败: {e}")
            raise
    
    def set_progress_callback(self, callback: Callable):
        """
        设置进度回调函数
        
        Args:
            callback: 回调函数，接收 (plant_id, stage, message, progress) 参数
        """
        self.progress_callback = callback
    
    def _send_progress(self, plant_id: int, stage: str, message: str, progress: int):
        """发送进度更新"""
        if self.progress_callback:
            try:
                self.progress_callback(plant_id, stage, message, progress)
            except Exception as e:
                logger.error(f"❌ 发送进度更新失败: {e}")
    
    def should_trigger_diagnosis(self, plant_id: int) -> bool:
        """
        检查是否应该为该植株ID触发诊断
        
        Args:
            plant_id: 植株ID
            
        Returns:
            是否应该触发诊断
        """
        # 检查是否启用
        if not self.enabled:
            return False
        
        # 检查是否在冷却期
        current_time = time.time()
        if plant_id in self.active_diagnoses:
            cooldown_end = self.active_diagnoses[plant_id]
            if current_time < cooldown_end:
                # 仍在冷却期
                return False
        
        return True
    
    async def execute_diagnosis(
        self,
        plant_id: int,
        frame: np.ndarray
    ) -> Optional[DiagnosisReport]:
        """
        执行完整的三阶段诊断流程
        
        Args:
            plant_id: 植株ID
            frame: 当前帧图像（OpenCV格式）
            
        Returns:
            DiagnosisReport对象，如果失败则返回None
        """
        start_time = time.time()
        diagnosis_id = f"diag_{plant_id}_{int(start_time)}"
        
        logger.info(f"🔍 开始诊断植株 {plant_id}，诊断ID: {diagnosis_id}")
        
        # 标记为活跃诊断
        current_time = time.time()
        cooldown_end = current_time + self.cooldown_seconds
        self.active_diagnoses[plant_id] = cooldown_end
        
        try:
            # 检查AI配置
            if not self.ai_diagnosis_service:
                error_msg = "AI模型未配置，请先配置AI模型"
                logger.error(f"❌ {error_msg}")
                self._send_progress(plant_id, "error", error_msg, 0)
                return None
            
            if not self.ai_config_manager.validate_vision_support():
                error_msg = "当前模型不支持视觉功能"
                logger.error(f"❌ {error_msg}")
                self._send_progress(plant_id, "error", error_msg, 0)
                return None
            
            # 将图像转换为base64
            image_base64 = self._frame_to_base64(frame)
            
            # 阶段1: AI生成遮罩提示词 (33%)
            self._send_progress(plant_id, "generating_mask_prompt", "AI正在分析病害部位...", 10)
            
            mask_prompt = None
            try:
                mask_prompt = await self.ai_diagnosis_service.generate_mask_prompt(image_base64)
                logger.info(f"✅ 遮罩提示词: {mask_prompt}")
                self._send_progress(plant_id, "generating_mask_prompt", f"识别到: {mask_prompt}", 33)
            except Exception as e:
                logger.warning(f"⚠️ AI生成遮罩提示词失败: {e}")
                mask_prompt = "病害区域"  # 使用默认提示词
                self._send_progress(plant_id, "generating_mask_prompt", "使用默认提示词", 33)
            
            # 阶段2: Unipixel生成遮罩图 (66%)
            self._send_progress(plant_id, "generating_mask", "Unipixel正在生成遮罩图...", 40)
            
            mask_base64 = None
            mask_description = None
            
            if self.unipixel_client:
                try:
                    # 检查Unipixel服务可用性
                    if await self.unipixel_client.is_available():
                        mask_result = await self.unipixel_client.generate_mask(
                            image_base64=image_base64,
                            query=mask_prompt
                        )
                        
                        if mask_result.success:
                            mask_base64 = mask_result.mask_base64
                            mask_description = mask_result.description
                            logger.info(f"✅ Unipixel生成遮罩图成功")
                            self._send_progress(plant_id, "generating_mask", "遮罩图生成成功", 66)
                        else:
                            logger.warning(f"⚠️ Unipixel生成失败: {mask_result.error}")
                            self._send_progress(plant_id, "generating_mask", "遮罩图生成失败，继续诊断", 66)
                    else:
                        logger.warning("⚠️ Unipixel服务不可用")
                        self._send_progress(plant_id, "generating_mask", "Unipixel不可用，跳过遮罩图", 66)
                        
                except Exception as e:
                    logger.warning(f"⚠️ Unipixel调用失败: {e}")
                    self._send_progress(plant_id, "generating_mask", "遮罩图生成失败，继续诊断", 66)
            else:
                logger.warning("⚠️ Unipixel客户端未初始化")
                self._send_progress(plant_id, "generating_mask", "Unipixel未配置，跳过遮罩图", 66)
            
            # 阶段3: AI生成最终诊断报告 (100%)
            self._send_progress(plant_id, "generating_report", "AI正在生成诊断报告...", 70)
            
            report = await self.ai_diagnosis_service.diagnose(
                plant_id=plant_id,
                image_base64=image_base64,
                mask_base64=mask_base64,
                mask_description=mask_description,
                mask_prompt=mask_prompt
            )
            
            # 更新处理时间
            report.processing_time = time.time() - start_time
            
            # 保存到历史
            self.complete_diagnosis(plant_id, report.__dict__)
            
            logger.info(f"✅ 诊断完成 (耗时: {report.processing_time:.2f}秒)")
            self._send_progress(plant_id, "complete", "诊断完成", 100)
            
            return report
            
        except Exception as e:
            logger.error(f"❌ 诊断失败: {e}")
            self._send_progress(plant_id, "error", f"诊断失败: {str(e)}", 0)
            return None
    
    def _frame_to_base64(self, frame: np.ndarray) -> str:
        """
        将OpenCV图像转换为base64编码
        
        Args:
            frame: OpenCV图像（BGR格式）
            
        Returns:
            base64编码的图像字符串（包含data:image/png;base64,前缀）
        """
        # 将BGR转换为RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # 编码为PNG
        success, buffer = cv2.imencode('.png', frame_rgb)
        if not success:
            raise ValueError("图像编码失败")
        
        # 转换为base64
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/png;base64,{image_base64}"
    
    def start_diagnosis(self, plant_id: int, frame: np.ndarray) -> str:
        """
        开始对植株进行诊断（旧方法，保留兼容性）
        
        Args:
            plant_id: 植株ID
            frame: 当前帧图像
            
        Returns:
            诊断ID
        """
        current_time = time.time()
        cooldown_end = current_time + self.cooldown_seconds
        
        # 标记为活跃诊断
        self.active_diagnoses[plant_id] = cooldown_end
        
        # 生成诊断ID
        diagnosis_id = f"diag_{plant_id}_{int(current_time)}"
        
        # 记录到历史
        diagnosis_record = {
            'diagnosis_id': diagnosis_id,
            'plant_id': plant_id,
            'start_time': datetime.now().isoformat(),
            'status': 'in_progress',
            'cooldown_end': cooldown_end
        }
        
        self._add_to_history(diagnosis_record)
        
        logger.info(f"✅ 开始诊断植株 {plant_id}，诊断ID: {diagnosis_id}")
        
        return diagnosis_id
    
    def complete_diagnosis(self, plant_id: int, results: Dict):
        """
        标记诊断完成并存储结果
        
        Args:
            plant_id: 植株ID
            results: 诊断结果
        """
        # 更新历史记录
        for record in reversed(self.diagnosis_history):
            if record['plant_id'] == plant_id and record.get('status') == 'in_progress':
                record['status'] = 'completed'
                record['end_time'] = datetime.now().isoformat()
                record['results'] = results
                break
        
        logger.info(f"✅ 植株 {plant_id} 诊断完成")
    
    def get_cooldown_remaining(self, plant_id: int) -> int:
        """
        获取剩余冷却时间（秒）
        
        Args:
            plant_id: 植株ID
            
        Returns:
            剩余冷却时间（秒），如果不在冷却期则返回0
        """
        if plant_id not in self.active_diagnoses:
            return 0
        
        current_time = time.time()
        cooldown_end = self.active_diagnoses[plant_id]
        
        if current_time >= cooldown_end:
            # 冷却已结束，清理
            del self.active_diagnoses[plant_id]
            return 0
        
        return int(cooldown_end - current_time)
    
    def _add_to_history(self, record: Dict):
        """添加记录到历史"""
        self.diagnosis_history.append(record)
        
        # 限制历史记录大小
        if len(self.diagnosis_history) > self.max_history:
            self.diagnosis_history = self.diagnosis_history[-self.max_history:]
    
    def get_diagnosis_history(self, limit: int = 10) -> List[Dict]:
        """
        获取诊断历史
        
        Args:
            limit: 返回的最大记录数
            
        Returns:
            诊断历史列表
        """
        return self.diagnosis_history[-limit:]
    
    def clear_history(self):
        """清空诊断历史"""
        self.diagnosis_history.clear()
        self.active_diagnoses.clear()
    
    def cleanup_expired_cooldowns(self):
        """清理已过期的冷却记录"""
        current_time = time.time()
        expired_ids = [
            plant_id for plant_id, cooldown_end in self.active_diagnoses.items()
            if current_time >= cooldown_end
        ]
        
        for plant_id in expired_ids:
            del self.active_diagnoses[plant_id]
        
        if expired_ids:
            logger.info(f"🧹 清理了 {len(expired_ids)} 个过期的冷却记录")
    
    def is_configured(self) -> bool:
        """
        检查是否已配置AI服务
        
        Returns:
            是否已配置
        """
        return (
            self.ai_config_manager is not None and
            self.ai_config_manager.is_configured() and
            self.ai_diagnosis_service is not None
        )
    
    def get_service_status(self) -> Dict:
        """
        获取服务状态
        
        Returns:
            服务状态字典
        """
        status = {
            'ai_configured': False,
            'ai_provider': None,
            'ai_model': None,
            'ai_supports_vision': False,
            'unipixel_available': False,
            'diagnosis_enabled': self.enabled
        }
        
        # AI配置状态
        if self.ai_config_manager and self.ai_config_manager.is_configured():
            config = self.ai_config_manager.get_config()
            status['ai_configured'] = True
            status['ai_provider'] = config.provider
            status['ai_model'] = config.model
            status['ai_supports_vision'] = config.supports_vision
        
        # Unipixel状态（需要异步检查，这里只返回客户端是否存在）
        status['unipixel_client_initialized'] = self.unipixel_client is not None
        
        return status
