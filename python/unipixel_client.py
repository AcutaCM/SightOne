#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Unipixel客户端
负责调用Unipixel FastAPI服务生成遮罩图
支持工作流调用、批量处理和进度回调
"""

import aiohttp
import asyncio
import logging
from dataclasses import dataclass
from typing import Optional, Callable, List, Dict, Any
from queue import Queue
from threading import Lock
import time

logger = logging.getLogger(__name__)


@dataclass
class UnipixelResult:
    """Unipixel生成结果"""
    mask_base64: str  # 遮罩图base64
    description: str  # 病害描述
    success: bool
    error: Optional[str] = None
    processing_time: float = 0.0
    metadata: Optional[Dict[str, Any]] = None  # 额外元数据


@dataclass
class BatchSegmentationTask:
    """批量分割任务"""
    task_id: str
    image_base64: str
    query: str
    sample_frames: int = 16
    callback: Optional[Callable] = None


@dataclass
class BatchSegmentationResult:
    """批量分割结果"""
    task_id: str
    result: UnipixelResult
    index: int


class UnipixelClient:
    """Unipixel FastAPI客户端 - 支持工作流调用和批量处理"""
    
    def __init__(
        self,
        endpoint: str = "http://localhost:8000/infer_unipixel_base64",
        timeout: int = 30,
        max_retries: int = 3,
        max_concurrent: int = 3
    ):
        """
        初始化Unipixel客户端
        
        Args:
            endpoint: Unipixel API端点
            timeout: 请求超时时间（秒）
            max_retries: 最大重试次数
            max_concurrent: 最大并发请求数
        """
        self.endpoint = endpoint
        self.timeout = timeout
        self.max_retries = max_retries
        self.max_concurrent = max_concurrent
        self._availability_cache: Optional[bool] = None
        self._cache_timestamp: float = 0
        self._cache_ttl: int = 300  # 缓存5分钟
        self._task_queue: Queue = Queue()
        self._processing_lock: Lock = Lock()
        self._active_tasks: int = 0
    
    async def generate_mask(
        self,
        image_base64: str,
        query: str = "病害区域",
        sample_frames: int = 16,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> UnipixelResult:
        """
        生成遮罩图
        
        Args:
            image_base64: 图像base64编码（包含data:image/...前缀）
            query: 查询提示词（描述要标注的区域）
            sample_frames: 采样帧数
            progress_callback: 进度回调函数，接收进度百分比(0-100)
        
        Returns:
            UnipixelResult对象
        """
        start_time = time.time()
        
        # 初始进度
        if progress_callback:
            progress_callback(0)
        
        # 构建请求payload
        payload = {
            "imageBase64": image_base64,
            "query": query,
            "sample_frames": sample_frames
        }
        
        # 重试机制
        last_error = None
        for attempt in range(self.max_retries):
            try:
                logger.info(f"🔍 调用Unipixel生成遮罩图 (尝试 {attempt + 1}/{self.max_retries})")
                logger.info(f"   查询: {query}")
                
                # 更新进度: 开始处理
                if progress_callback:
                    progress_callback(20)
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        self.endpoint,
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=self.timeout)
                    ) as response:
                        
                        # 更新进度: 等待响应
                        if progress_callback:
                            progress_callback(60)
                        
                        if response.status == 200:
                            result_data = await response.json()
                            processing_time = time.time() - start_time
                            
                            # 更新进度: 解析结果
                            if progress_callback:
                                progress_callback(90)
                            
                            # 解析响应
                            mask_base64 = result_data.get('mask', '')
                            description = result_data.get('description', '未提供描述')
                            
                            logger.info(f"✅ Unipixel生成成功 (耗时: {processing_time:.2f}秒)")
                            
                            # 完成进度
                            if progress_callback:
                                progress_callback(100)
                            
                            return UnipixelResult(
                                mask_base64=mask_base64,
                                description=description,
                                success=True,
                                processing_time=processing_time,
                                metadata={
                                    'query': query,
                                    'sample_frames': sample_frames,
                                    'attempt': attempt + 1
                                }
                            )
                        else:
                            error_text = await response.text()
                            last_error = f"HTTP {response.status}: {error_text}"
                            logger.warning(f"⚠️ Unipixel返回错误: {last_error}")
                            
            except asyncio.TimeoutError:
                last_error = f"请求超时（{self.timeout}秒）"
                logger.warning(f"⚠️ Unipixel超时: {last_error}")
                
            except aiohttp.ClientError as e:
                last_error = f"网络错误: {str(e)}"
                logger.warning(f"⚠️ Unipixel网络错误: {last_error}")
                
            except Exception as e:
                last_error = f"未知错误: {str(e)}"
                logger.error(f"❌ Unipixel异常: {last_error}")
            
            # 如果不是最后一次尝试，等待后重试
            if attempt < self.max_retries - 1:
                wait_time = 2 ** attempt  # 指数退避
                logger.info(f"   等待 {wait_time} 秒后重试...")
                await asyncio.sleep(wait_time)
        
        # 所有重试都失败
        processing_time = time.time() - start_time
        logger.error(f"❌ Unipixel生成失败（所有重试均失败）: {last_error}")
        
        return UnipixelResult(
            mask_base64="",
            description="",
            success=False,
            error=last_error,
            processing_time=processing_time
        )

    
    async def is_available(self) -> bool:
        """
        检查Unipixel服务是否可用
        使用缓存避免频繁检查
        
        Returns:
            服务是否可用
        """
        current_time = time.time()
        
        # 检查缓存
        if self._availability_cache is not None:
            if current_time - self._cache_timestamp < self._cache_ttl:
                return self._availability_cache
        
        # 执行健康检查
        try:
            # 首先尝试health端点
            health_endpoint = self.endpoint.replace('/infer_unipixel_base64', '/health')
            
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(
                        health_endpoint,
                        timeout=aiohttp.ClientTimeout(total=5)
                    ) as response:
                        if response.status == 200:
                            # 更新缓存
                            self._availability_cache = True
                            self._cache_timestamp = current_time
                            logger.info("✅ Unipixel服务可用 (health端点)")
                            return True
                except aiohttp.ClientError:
                    pass  # health端点不存在，尝试主端点
                
                # 如果health端点不可用，尝试主端点（使用HEAD请求）
                try:
                    # 提取基础URL（去掉路径）
                    base_url = self.endpoint.rsplit('/', 1)[0]
                    
                    async with session.get(
                        base_url,
                        timeout=aiohttp.ClientTimeout(total=5)
                    ) as response:
                        # 只要服务器响应（即使是404），就认为服务可用
                        # 因为404说明服务器在运行，只是路径不对
                        available = response.status in [200, 404, 405]
                        
                        # 更新缓存
                        self._availability_cache = available
                        self._cache_timestamp = current_time
                        
                        if available:
                            logger.info(f"✅ Unipixel服务可用 (HTTP {response.status})")
                        else:
                            logger.warning(f"⚠️ Unipixel服务不可用 (HTTP {response.status})")
                        
                        return available
                except aiohttp.ClientError as e:
                    logger.warning(f"⚠️ Unipixel服务不可用: {str(e)}")
                    
                    # 更新缓存
                    self._availability_cache = False
                    self._cache_timestamp = current_time
                    
                    return False
                    
        except Exception as e:
            logger.warning(f"⚠️ Unipixel服务检查失败: {str(e)}")
            
            # 更新缓存
            self._availability_cache = False
            self._cache_timestamp = current_time
            
            return False
    
    def clear_cache(self):
        """清除可用性缓存"""
        self._availability_cache = None
        self._cache_timestamp = 0
        logger.info("🧹 清除Unipixel可用性缓存")
    
    def get_endpoint(self) -> str:
        """获取当前端点"""
        return self.endpoint
    
    def set_endpoint(self, endpoint: str):
        """
        设置新的端点
        
        Args:
            endpoint: 新的API端点
        """
        self.endpoint = endpoint
        self.clear_cache()
        logger.info(f"🔄 更新Unipixel端点: {endpoint}")
    
    def set_timeout(self, timeout: int):
        """
        设置超时时间
        
        Args:
            timeout: 超时时间（秒）
        """
        self.timeout = timeout
        logger.info(f"⏱️ 更新Unipixel超时: {timeout}秒")
    
    async def batch_generate_masks(
        self,
        tasks: List[BatchSegmentationTask],
        progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> List[BatchSegmentationResult]:
        """
        批量生成遮罩图
        
        Args:
            tasks: 批量任务列表
            progress_callback: 进度回调函数，接收(已完成数, 总数)
        
        Returns:
            批量结果列表
        """
        logger.info(f"📦 开始批量处理 {len(tasks)} 个分割任务")
        
        results: List[BatchSegmentationResult] = []
        completed = 0
        
        # 使用信号量限制并发数
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def process_task(task: BatchSegmentationTask, index: int):
            nonlocal completed
            
            async with semaphore:
                logger.info(f"   处理任务 {index + 1}/{len(tasks)}: {task.task_id}")
                
                # 执行分割
                result = await self.generate_mask(
                    image_base64=task.image_base64,
                    query=task.query,
                    sample_frames=task.sample_frames,
                    progress_callback=task.callback
                )
                
                # 更新完成计数
                completed += 1
                if progress_callback:
                    progress_callback(completed, len(tasks))
                
                return BatchSegmentationResult(
                    task_id=task.task_id,
                    result=result,
                    index=index
                )
        
        # 并发执行所有任务
        tasks_coroutines = [
            process_task(task, i) for i, task in enumerate(tasks)
        ]
        
        results = await asyncio.gather(*tasks_coroutines, return_exceptions=True)
        
        # 处理异常
        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ 任务 {i} 失败: {str(result)}")
                final_results.append(BatchSegmentationResult(
                    task_id=tasks[i].task_id,
                    result=UnipixelResult(
                        mask_base64="",
                        description="",
                        success=False,
                        error=str(result)
                    ),
                    index=i
                ))
            else:
                final_results.append(result)
        
        logger.info(f"✅ 批量处理完成: {completed}/{len(tasks)} 成功")
        return final_results
    
    async def generate_mask_for_workflow(
        self,
        image_base64: str,
        query: str,
        sample_frames: int = 16,
        confidence: float = 0.7,
        status_callback: Optional[Callable[[str, int], None]] = None
    ) -> Dict[str, Any]:
        """
        为工作流生成遮罩图（带状态回调）
        
        Args:
            image_base64: 图像base64编码
            query: 查询提示词
            sample_frames: 采样帧数
            confidence: 置信度阈值（保留用于未来扩展）
            status_callback: 状态回调函数，接收(状态消息, 进度百分比)
        
        Returns:
            包含结果和元数据的字典
        """
        def progress_wrapper(progress: int):
            if status_callback:
                if progress < 30:
                    status_callback("准备图像数据...", progress)
                elif progress < 70:
                    status_callback("执行语义分割...", progress)
                elif progress < 95:
                    status_callback("处理分割结果...", progress)
                else:
                    status_callback("完成", progress)
        
        result = await self.generate_mask(
            image_base64=image_base64,
            query=query,
            sample_frames=sample_frames,
            progress_callback=progress_wrapper
        )
        
        return {
            'success': result.success,
            'mask_base64': result.mask_base64,
            'description': result.description,
            'error': result.error,
            'processing_time': result.processing_time,
            'metadata': {
                'query': query,
                'sample_frames': sample_frames,
                'confidence': confidence,
                **(result.metadata or {})
            }
        }


# 使用示例
async def main():
    """测试示例"""
    # 配置日志
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 创建客户端
    client = UnipixelClient(
        endpoint="http://localhost:8000/infer_unipixel_base64",
        timeout=30
    )
    
    # 检查服务可用性
    print("\n检查Unipixel服务...")
    available = await client.is_available()
    print(f"服务可用: {available}")
    
    if available:
        # 测试生成遮罩图（需要真实的图像base64）
        print("\n测试生成遮罩图...")
        
        # 这里需要一个真实的图像base64
        # test_image = "data:image/png;base64,..."
        
        # result = await client.generate_mask(
        #     image_base64=test_image,
        #     query="叶片上的黄褐色斑点区域"
        # )
        
        # if result.success:
        #     print(f"✅ 生成成功")
        #     print(f"   描述: {result.description}")
        #     print(f"   处理时间: {result.processing_time:.2f}秒")
        # else:
        #     print(f"❌ 生成失败: {result.error}")
    else:
        print("⚠️ Unipixel服务不可用，跳过测试")


if __name__ == "__main__":
    asyncio.run(main())
