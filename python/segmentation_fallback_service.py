#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
分割服务降级管理器
检测UniPixel服务可用性，并在不可用时提供本地分割降级方案
"""

import asyncio
import logging
import base64
import io
from typing import Optional, Dict, Any, Callable
from PIL import Image
import numpy as np
import cv2

from unipixel_client import UnipixelClient, UnipixelResult

logger = logging.getLogger(__name__)


class LocalSegmentationService:
    """本地分割服务（降级方案）"""
    
    def __init__(self):
        """初始化本地分割服务"""
        self.available = True
        logger.info("🔧 初始化本地分割服务")
    
    async def segment(
        self,
        image_base64: str,
        query: str,
        sample_frames: int = 16,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> UnipixelResult:
        """
        执行本地分割（简单的颜色阈值分割）
        
        Args:
            image_base64: 图像base64编码
            query: 查询提示词（用于生成描述）
            sample_frames: 采样帧数（本地实现忽略此参数）
            progress_callback: 进度回调
        
        Returns:
            UnipixelResult对象
        """
        try:
            logger.info(f"🔧 使用本地分割服务处理: {query}")
            
            if progress_callback:
                progress_callback(10)
            
            # 解码base64图像
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            if progress_callback:
                progress_callback(30)
            
            # 转换为numpy数组
            img_array = np.array(image)
            
            # 转换为HSV色彩空间
            if len(img_array.shape) == 3 and img_array.shape[2] == 3:
                hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
            else:
                # 灰度图像
                hsv = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
                hsv = cv2.cvtColor(hsv, cv2.COLOR_RGB2HSV)
            
            if progress_callback:
                progress_callback(50)
            
            # 根据查询词选择颜色范围（简单的关键词匹配）
            mask = self._create_mask_by_query(hsv, query)
            
            if progress_callback:
                progress_callback(70)
            
            # 形态学操作优化mask
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            if progress_callback:
                progress_callback(90)
            
            # 将mask转换为base64
            mask_image = Image.fromarray(mask)
            buffer = io.BytesIO()
            mask_image.save(buffer, format='PNG')
            mask_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            mask_base64 = f"data:image/png;base64,{mask_base64}"
            
            if progress_callback:
                progress_callback(100)
            
            logger.info("✅ 本地分割完成")
            
            return UnipixelResult(
                mask_base64=mask_base64,
                description=f"本地分割结果: {query}",
                success=True,
                processing_time=0.0,
                metadata={'method': 'local_fallback', 'query': query}
            )
            
        except Exception as e:
            logger.error(f"❌ 本地分割失败: {str(e)}")
            return UnipixelResult(
                mask_base64="",
                description="",
                success=False,
                error=f"本地分割失败: {str(e)}"
            )
    
    def _create_mask_by_query(self, hsv_image: np.ndarray, query: str) -> np.ndarray:
        """
        根据查询词创建mask
        
        Args:
            hsv_image: HSV色彩空间的图像
            query: 查询提示词
        
        Returns:
            二值mask
        """
        query_lower = query.lower()
        
        # 预定义的颜色范围
        color_ranges = {
            '红': [(0, 100, 100), (10, 255, 255), (160, 100, 100), (180, 255, 255)],
            '绿': [(40, 40, 40), (80, 255, 255)],
            '蓝': [(100, 100, 100), (130, 255, 255)],
            '黄': [(20, 100, 100), (40, 255, 255)],
            '白': [(0, 0, 200), (180, 30, 255)],
            '黑': [(0, 0, 0), (180, 255, 50)],
        }
        
        # 特定对象的颜色映射
        object_colors = {
            '草莓': '红',
            '叶片': '绿',
            '叶子': '绿',
            '病害': '黄',
            '斑点': '黄',
            '果实': '红',
        }
        
        # 尝试匹配对象到颜色
        target_color = None
        for obj, color in object_colors.items():
            if obj in query_lower:
                target_color = color
                break
        
        # 如果没有匹配，尝试直接匹配颜色
        if not target_color:
            for color in color_ranges.keys():
                if color in query_lower:
                    target_color = color
                    break
        
        # 创建mask
        if target_color and target_color in color_ranges:
            ranges = color_ranges[target_color]
            if len(ranges) == 4:  # 红色有两个范围
                lower1 = np.array(ranges[0])
                upper1 = np.array(ranges[1])
                lower2 = np.array(ranges[2])
                upper2 = np.array(ranges[3])
                mask1 = cv2.inRange(hsv_image, lower1, upper1)
                mask2 = cv2.inRange(hsv_image, lower2, upper2)
                mask = cv2.bitwise_or(mask1, mask2)
            else:
                lower = np.array(ranges[0])
                upper = np.array(ranges[1])
                mask = cv2.inRange(hsv_image, lower, upper)
        else:
            # 默认：检测所有非背景区域
            logger.warning(f"⚠️ 未识别查询词'{query}'，使用默认分割")
            mask = cv2.inRange(hsv_image, np.array([0, 30, 30]), np.array([180, 255, 255]))
        
        return mask


class SegmentationFallbackManager:
    """分割服务降级管理器"""
    
    def __init__(
        self,
        unipixel_endpoint: str = "http://localhost:8000/infer_unipixel_base64",
        check_interval: int = 60,
        enable_fallback: bool = True
    ):
        """
        初始化降级管理器
        
        Args:
            unipixel_endpoint: UniPixel服务端点
            check_interval: 健康检查间隔（秒）
            enable_fallback: 是否启用降级
        """
        self.unipixel_client = UnipixelClient(endpoint=unipixel_endpoint)
        self.local_service = LocalSegmentationService()
        self.check_interval = check_interval
        self.enable_fallback = enable_fallback
        self._last_check_time = 0
        self._service_available = None
        
        logger.info("🔄 初始化分割服务降级管理器")
        logger.info(f"   UniPixel端点: {unipixel_endpoint}")
        logger.info(f"   降级功能: {'启用' if enable_fallback else '禁用'}")
    
    async def check_service_availability(self, force: bool = False) -> bool:
        """
        检查UniPixel服务可用性
        
        Args:
            force: 是否强制检查（忽略缓存）
        
        Returns:
            服务是否可用
        """
        import time
        current_time = time.time()
        
        # 如果不强制检查且在检查间隔内，返回缓存结果
        if not force and self._service_available is not None:
            if current_time - self._last_check_time < self.check_interval:
                return self._service_available
        
        # 执行健康检查
        available = await self.unipixel_client.is_available()
        
        self._service_available = available
        self._last_check_time = current_time
        
        if available:
            logger.info("✅ UniPixel服务可用")
        else:
            logger.warning("⚠️ UniPixel服务不可用")
            if self.enable_fallback:
                logger.info("   将使用本地分割降级方案")
        
        return available
    
    async def segment_with_fallback(
        self,
        image_base64: str,
        query: str,
        sample_frames: int = 16,
        progress_callback: Optional[Callable[[int], None]] = None,
        status_callback: Optional[Callable[[str], None]] = None
    ) -> Dict[str, Any]:
        """
        执行分割（带降级处理）
        
        Args:
            image_base64: 图像base64编码
            query: 查询提示词
            sample_frames: 采样帧数
            progress_callback: 进度回调
            status_callback: 状态回调
        
        Returns:
            分割结果字典
        """
        # 检查服务可用性
        service_available = await self.check_service_availability()
        
        result = None
        used_fallback = False
        
        if service_available:
            # 尝试使用UniPixel服务
            try:
                if status_callback:
                    status_callback("使用UniPixel服务进行分割...")
                
                result = await self.unipixel_client.generate_mask(
                    image_base64=image_base64,
                    query=query,
                    sample_frames=sample_frames,
                    progress_callback=progress_callback
                )
                
                if not result.success:
                    raise Exception(result.error or "UniPixel分割失败")
                
            except Exception as e:
                logger.warning(f"⚠️ UniPixel服务调用失败: {str(e)}")
                
                if self.enable_fallback:
                    logger.info("🔄 切换到本地分割服务")
                    if status_callback:
                        status_callback("UniPixel不可用，使用本地分割...")
                    
                    result = await self.local_service.segment(
                        image_base64=image_base64,
                        query=query,
                        sample_frames=sample_frames,
                        progress_callback=progress_callback
                    )
                    used_fallback = True
                else:
                    # 不启用降级，直接返回错误
                    result = UnipixelResult(
                        mask_base64="",
                        description="",
                        success=False,
                        error=str(e)
                    )
        else:
            # UniPixel服务不可用
            if self.enable_fallback:
                logger.info("🔧 UniPixel服务不可用，使用本地分割")
                if status_callback:
                    status_callback("使用本地分割服务...")
                
                result = await self.local_service.segment(
                    image_base64=image_base64,
                    query=query,
                    sample_frames=sample_frames,
                    progress_callback=progress_callback
                )
                used_fallback = True
            else:
                result = UnipixelResult(
                    mask_base64="",
                    description="",
                    success=False,
                    error="UniPixel服务不可用且降级功能已禁用"
                )
        
        # 构建返回结果
        return {
            'success': result.success,
            'mask_base64': result.mask_base64,
            'description': result.description,
            'error': result.error,
            'processing_time': result.processing_time,
            'used_fallback': used_fallback,
            'service_available': service_available,
            'metadata': result.metadata or {}
        }
    
    def get_service_status(self) -> Dict[str, Any]:
        """
        获取服务状态
        
        Returns:
            服务状态字典
        """
        return {
            'unipixel_available': self._service_available,
            'fallback_enabled': self.enable_fallback,
            'local_service_available': self.local_service.available,
            'last_check_time': self._last_check_time
        }


# 使用示例
async def main():
    """测试示例"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 创建降级管理器
    manager = SegmentationFallbackManager(
        unipixel_endpoint="http://localhost:8000/infer_unipixel_base64",
        enable_fallback=True
    )
    
    # 检查服务状态
    print("\n检查服务状态...")
    status = manager.get_service_status()
    print(f"服务状态: {status}")
    
    # 测试分割（需要真实图像）
    # test_image = "data:image/png;base64,..."
    # result = await manager.segment_with_fallback(
    #     image_base64=test_image,
    #     query="草莓",
    #     progress_callback=lambda p: print(f"进度: {p}%"),
    #     status_callback=lambda s: print(f"状态: {s}")
    # )
    # print(f"分割结果: {result}")


if __name__ == "__main__":
    asyncio.run(main())
