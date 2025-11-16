#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
农作物诊断工作流模块
整合QR码检测、图像采集和AI诊断的完整流程
"""

import asyncio
import base64
import json
import os
import sys

# 修正sys.path以支持作为脚本运行
_workflow_dir = os.path.dirname(os.path.abspath(__file__))
if _workflow_dir not in sys.path:
    sys.path.insert(0, _workflow_dir)
import cv2
import numpy as np
import httpx
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Tuple, Callable, Any
from dataclasses import dataclass, asdict

try:
    from .qr_detector import EnhancedQRDetector
except (ImportError, ModuleNotFoundError):
    from qr_detector import EnhancedQRDetector # pyright: ignore [reportImplicitRelativeImport]


@dataclass
class DiagnosisReport:
    """诊断报告数据类"""
    plant_id: int
    timestamp: str
    image_path: str
    diagnosis_result: Dict[str, Any]
    qr_location: List[int]  # [x, y]
    segmentation_mask: Optional[str] = None  # Base64编码的病害切割遮罩
    disease_description: Optional[str] = None  # 病害描述（用于切割）
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return asdict(self)
    
    def to_json(self) -> str:
        """转换为JSON字符串"""
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2)


class CropDiagnosisWorkflow:
    """农作物诊断工作流"""
    
    def __init__(self, 
                 chat_proxy_url: str = "http://localhost:3000/api/chat-proxy",
                 unipixel_endpoint: str = "http://localhost:8000/infer_unipixel_base64",
                 save_dir: Optional[str] = None):
        """
        初始化诊断工作流
        
        Args:
            chat_proxy_url: ChatProxy API URL（用于VLM诊断）
            unipixel_endpoint: UniPixel-3B 切割服务端点
            save_dir: 诊断图片和报告保存目录
        """
        self.chat_proxy_url = chat_proxy_url
        self.unipixel_endpoint = unipixel_endpoint
        
        # QR码检测器
        self.qr_detector = EnhancedQRDetector()
        
        # 保存目录
        if save_dir:
            self.save_dir = Path(save_dir)
        else:
            self.save_dir = Path(__file__).parent / 'diagnosis_data'
        self.save_dir.mkdir(parents=True, exist_ok=True)
        
        # 图片和报告子目录
        self.images_dir = self.save_dir / 'images'
        self.reports_dir = self.save_dir / 'reports'
        self.images_dir.mkdir(exist_ok=True)
        self.reports_dir.mkdir(exist_ok=True)
        
        # 诊断历史
        self.diagnosis_history: List[DiagnosisReport] = []
        
        # 状态回调
        self.status_callback: Optional[Callable[[str], None]] = None
        self.report_callback: Optional[Callable[[Dict[str, Any]], None]] = None
        
        # 工作流状态
        self.is_active = False
        self.current_plant_id: Optional[int] = None
        
        # AI 配置（从前端传入）
        self.ai_config: Dict[str, Any] = {}
    
    def set_status_callback(self, callback: Callable[[str], None]):
        """设置状态回调函数"""
        self.status_callback = callback
    
    def set_report_callback(self, callback: Callable[[Dict[str, Any]], None]):
        """设置报告回调函数"""
        self.report_callback = callback
    
    def set_ai_config(self, config: Dict[str, Any]):
        """
        设置AI配置
        
        Args:
            config: AI配置字典，包含provider, api_key, model等
        """
        self.ai_config = config
    
    def _emit_status(self, message: str):
        """发送状态更新"""
        print(f"📊 状态: {message}")
        if self.status_callback:
            self.status_callback(message)
    
    def _emit_report(self, report: DiagnosisReport):
        """发送诊断报告"""
        print(f"📋 报告生成: 植株ID={report.plant_id}")
        if self.report_callback:
            self.report_callback(report.to_dict())
    
    async def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Optional[DiagnosisReport]]:
        """
        处理单帧图像：检测QR码并触发诊断
        
        Args:
            frame: 输入图像帧
            
        Returns:
            (标注后的图像, 诊断报告或None)
        """
        if not self.is_active:
            return frame, None
        
        # 检测QR码
        annotated_frame, qr_results = self.qr_detector.detect(frame, draw_annotations=True)
        
        # 如果检测到植株ID
        if qr_results:
            for qr_result in qr_results:
                plant_id = qr_result.get('plant_id')
                if plant_id is not None:
                    # 避免重复诊断同一植株
                    if plant_id != self.current_plant_id:
                        self.current_plant_id = plant_id
                        self._emit_status(f"检测到植株ID: {plant_id}")
                        
                        # 触发诊断
                        report = await self.diagnose_plant(
                            plant_id=plant_id,
                            image=frame,
                            qr_location=qr_result['center']
                        )
                        
                        if report:
                            self._emit_report(report)
                            return annotated_frame, report
        
        return annotated_frame, None
    
    async def diagnose_plant(self, 
                            plant_id: int, 
                            image: np.ndarray,
                            qr_location: List[int]) -> Optional[DiagnosisReport]:
        """
        诊断单个植株
        
        Args:
            plant_id: 植株ID
            image: 植株图像
            qr_location: QR码中心位置 [x, y]
            
        Returns:
            诊断报告
        """
        try:
            self._emit_status(f"正在为植株 {plant_id} 拍照...")
            
            # 保存图像
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            image_filename = f"plant_{plant_id}_{timestamp}.jpg"
            image_path = self.images_dir / image_filename
            cv2.imwrite(str(image_path), image)
            self._emit_status(f"图像已保存: {image_filename}")
            
            # 转换图像为base64
            self._emit_status(f"正在上传图像到AI进行诊断...")
            _, buffer = cv2.imencode('.jpg', image)
            image_base64 = base64.b64encode(buffer.tobytes()).decode('utf-8')
            
            # 调用AI诊断
            diagnosis_result = await self._call_vlm_api(image_base64, plant_id)
            
            if diagnosis_result:
                self._emit_status(f"诊断完成: 植株 {plant_id}")
                
                # 提取病害描述用于切割
                disease_description = self._extract_disease_description(diagnosis_result)
                
                # 如果检测到病害，调用 UniPixel-3B 进行切割
                segmentation_mask = None
                if disease_description:
                    self._emit_status(f"正在对病害区域进行切割分析...")
                    segmentation_mask = await self._call_unipixel_segmentation(
                        image_base64, 
                        disease_description
                    )
                    if segmentation_mask:
                        self._emit_status(f"病害区域切割完成")
                        # 保存遮罩图
                        self._save_mask(segmentation_mask, plant_id, timestamp)
                
                # 创建报告
                report = DiagnosisReport(
                    plant_id=plant_id,
                    timestamp=timestamp,
                    image_path=str(image_path),
                    diagnosis_result=diagnosis_result,
                    qr_location=qr_location,
                    segmentation_mask=segmentation_mask,
                    disease_description=disease_description
                )
                
                # 保存报告
                self._save_report(report)
                
                # 添加到历史
                self.diagnosis_history.append(report)
                
                return report
            else:
                self._emit_status(f"诊断失败: 植株 {plant_id}")
                return None
                
        except Exception as e:
            self._emit_status(f"诊断错误: {str(e)}")
            print(f"❌ 诊断错误: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    async def _call_vlm_api(self, image_base64: str, plant_id: int) -> Optional[Dict[str, Any]]:
        """
        调用VLM API进行图像诊断
        
        Args:
            image_base64: Base64编码的图像
            plant_id: 植株ID
            
        Returns:
            诊断结果JSON
        """
        try:
            # 构建诊断提示词
            prompt = self._build_diagnosis_prompt(plant_id)
            
            # 构建图像 Markdown 嵌入格式（chat-proxy 支持的格式）
            image_data_url = f"data:image/jpeg;base64,{image_base64}"
            content_with_image = f"{prompt}\n\n![植株图像]({image_data_url})"
            
            # 构建请求（符合 chat-proxy API 格式）
            request_data = {
                "provider": self.ai_config.get("provider", "openai"),
                "model": self.ai_config.get("model", "gpt-4-vision-preview"),
                "messages": [
                    {
                        "role": "user",
                        "content": content_with_image
                    }
                ],
                "temperature": self.ai_config.get("temperature", 0.7),
                "maxTokens": self.ai_config.get("maxTokens", self.ai_config.get("max_tokens", 2048)),
                "apiKey": self.ai_config.get("apiKey", self.ai_config.get("api_key", "")),
                "baseUrl": self.ai_config.get("baseUrl", self.ai_config.get("base_url", ""))
            }
            
            # 移除空值
            request_data = {k: v for k, v in request_data.items() if v}
            
            print(f"🔍 發送診斷請求: provider={request_data.get('provider')}, model={request_data.get('model')}")
            
            # 发送请求
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.chat_proxy_url,
                    json=request_data
                )
                
                # 打印調試信息
                print(f"📡 響應狀態碼: {response.status_code}")
                
                if response.status_code != 200:
                    error_text = response.text
                    print(f"❌ API 錯誤 ({response.status_code}): {error_text}")
                    return None
                
                result = response.json()
                
                # 提取诊断内容（chat-proxy 返回格式）
                content = result.get('content', '')
                
                if not content:
                    print(f"⚠️ API 返回空內容: {result}")
                    return None
                
                # 解析JSON响应
                try:
                    diagnosis = json.loads(content)
                    return diagnosis
                except json.JSONDecodeError as je:
                    print(f"⚠️ JSON 解析失敗: {je}")
                    # 如果返回不是JSON，包装为JSON
                    return {
                        "plant_id": plant_id,
                        "diagnosis": content,
                        "raw_response": True
                    }
                
                return None
                
        except httpx.HTTPError as e:
            print(f"❌ HTTP错误: {e}")
            return None
        except Exception as e:
            print(f"❌ API调用错误: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _build_diagnosis_prompt(self, plant_id: int) -> str:
        """
        构建诊断提示词
        
        Args:
            plant_id: 植株ID
            
        Returns:
            提示词文本
        """
        return f"""你是一位专业的农作物病害诊断专家。请仔细分析这张植株图像（植株ID: {plant_id}），并提供详细的诊断报告。

请按以下JSON格式返回诊断结果：

{{
  "plant_id": {plant_id},
  "health_status": "健康/亚健康/患病",
  "confidence": 0.0-1.0,
  "diseases": [
    {{
      "name": "病害名称",
      "severity": "轻度/中度/重度",
      "affected_parts": ["叶片", "茎秆", "果实"],
      "confidence": 0.0-1.0,
      "description": "病害的详细诊断描述"
    }}
  ],
  "pests": [
    {{
      "name": "虫害名称",
      "severity": "轻度/中度/重度",
      "confidence": 0.0-1.0
    }}
  ],
  "nutrient_deficiency": [
    {{
      "element": "营养元素（如氮、磷、钾）",
      "severity": "轻度/中度/重度"
    }}
  ],
  "recommendations": [
    "具体的防治建议1",
    "具体的防治建议2",
    "具体的防治建议3"
  ],
  "overall_assessment": "整体评估和分析",
  "urgency": "低/中/高",
  "segmentation_keywords": "用于图像分割的精确关键词描述，例如：'腐烂的叶子'、'褐色斑点区域'、'枯萎的叶片边缘'"
}}

**重要说明**：
1. 如果检测到病害，必须在 "segmentation_keywords" 字段中提供简洁、精确的视觉特征关键词
2. 关键词应该描述病害的**视觉外观**，而非病害名称（例如：用 "褐色圆形斑点" 而非 "叶斑病"）
3. 关键词格式：直接描述视觉特征，如 "腐烂的叶子"、"黄色斑块"、"枯萎区域"
4. 这些关键词将直接用于 UniPixel-3B 模型进行精确的病害区域分割
5. 如果未检测到病害，segmentation_keywords 设为空字符串

请确保返回的是有效的JSON格式。"""
    
    def _extract_disease_description(self, diagnosis_result: Dict[str, Any]) -> Optional[str]:
        """
        从诊断结果中提取病害切割关键词
        
        Args:
            diagnosis_result: 诊断结果
            
        Returns:
            UniPixel 切割关键词，如果没有病害则返回None
        """
        try:
            # 🔥 优先使用专门的切割关键词
            segmentation_keywords = diagnosis_result.get('segmentation_keywords', '').strip()
            if segmentation_keywords:
                print(f"✅ 提取到 UniPixel 切割关键词: {segmentation_keywords}")
                return segmentation_keywords
            
            # 如果没有专门的关键词，尝试从病害信息中提取
            diseases = diagnosis_result.get('diseases', [])
            if not diseases:
                print("ℹ️ 未检测到病害，无需切割")
                return None
            
            # 使用第一个病害的描述
            first_disease = diseases[0]
            description = first_disease.get('description', '')
            
            # 如果没有描述，构建基本关键词
            if not description:
                name = first_disease.get('name', '未知病害')
                parts = first_disease.get('affected_parts', [])
                if parts:
                    # 构建视觉描述关键词
                    description = f"病害区域在{','.join(parts)}"
                else:
                    description = "病害区域"
                print(f"⚠️ 使用备用切割关键词: {description}")
            else:
                print(f"✅ 使用病害描述作为切割关键词: {description}")
            
            return description
        except Exception as e:
            print(f"❌ 提取切割关键词失败: {e}")
            return None
    
    async def _call_unipixel_segmentation(self, image_base64: str, description: str) -> Optional[str]:
        """
        调用 UniPixel-3B 进行病害区域切割
        
        Args:
            image_base64: Base64编码的图像
            description: 病害描述
            
        Returns:
            Base64编码的遮罩图像
        """
        try:
            # 构建请求数据
            request_data = {
                "imageBase64": f"data:image/jpeg;base64,{image_base64}" if not image_base64.startswith('data:') else image_base64,
                "query": description,
                "sample_frames": 16
            }
            
            # 发送请求到 UniPixel 服务
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.unipixel_endpoint,
                    json=request_data
                )
                response.raise_for_status()
                
                result = response.json()
                
                # 提取遮罩
                mask = result.get('mask')
                if mask:
                    return mask
                else:
                    print(f"⚠️ UniPixel 未返回遮罩")
                    return None
                    
        except httpx.HTTPError as e:
            print(f"❌ UniPixel HTTP错误: {e}")
            return None
        except Exception as e:
            print(f"❌ UniPixel 调用错误: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _save_mask(self, mask_base64: str, plant_id: int, timestamp: str):
        """
        保存病害切割遮罩
        
        Args:
            mask_base64: Base64编码的遮罩
            plant_id: 植株ID
            timestamp: 时间戳
        """
        try:
            # 创建遮罩保存目录
            masks_dir = self.save_dir / 'masks'
            masks_dir.mkdir(exist_ok=True)
            
            # 解码base64
            if mask_base64.startswith('data:'):
                mask_base64 = mask_base64.split(',')[1]
            
            mask_data = base64.b64decode(mask_base64)
            
            # 保存遮罩文件
            mask_filename = f"mask_plant_{plant_id}_{timestamp}.png"
            mask_path = masks_dir / mask_filename
            
            with open(mask_path, 'wb') as f:
                f.write(mask_data)
            
            print(f"✅ 遮罩已保存: {mask_filename}")
        except Exception as e:
            print(f"⚠️ 保存遮罩失败: {e}")
    
    def _save_report(self, report: DiagnosisReport):
        """保存诊断报告到文件"""
        try:
            report_filename = f"plant_{report.plant_id}_{report.timestamp}.json"
            report_path = self.reports_dir / report_filename
            
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write(report.to_json())
            
            print(f"✅ 报告已保存: {report_filename}")
        except Exception as e:
            print(f"⚠️ 保存报告失败: {e}")
    
    def start_workflow(self):
        """启动诊断工作流"""
        self.is_active = True
        self.current_plant_id = None
        self._emit_status("农作物诊断工作流已启动")
    
    def stop_workflow(self):
        """停止诊断工作流"""
        self.is_active = False
        self.current_plant_id = None
        self._emit_status("农作物诊断工作流已停止")
    
    def get_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取诊断历史
        
        Args:
            limit: 返回的最大记录数
            
        Returns:
            诊断历史列表
        """
        return [report.to_dict() for report in self.diagnosis_history[-limit:]]
    
    def export_report(self, plant_id: int, format: str = 'json') -> Optional[str]:
        """
        导出特定植株的诊断报告
        
        Args:
            plant_id: 植株ID
            format: 导出格式 ('json', 'html', 'pdf')
            
        Returns:
            导出文件路径
        """
        # 查找报告
        reports = [r for r in self.diagnosis_history if r.plant_id == plant_id]
        
        if not reports:
            print(f"未找到植株 {plant_id} 的报告")
            return None
        
        # 使用最新的报告
        report = reports[-1]
        
        if format == 'json':
            return str(self.reports_dir / f"plant_{plant_id}_{report.timestamp}.json")
        elif format == 'html':
            return self._export_html(report)
        elif format == 'pdf':
            # TODO: 实现PDF导出
            print("⚠️ PDF导出功能待实现")
            return None
        else:
            print(f"不支持的格式: {format}")
            return None
    
    def _export_html(self, report: DiagnosisReport) -> str:
        """导出HTML格式报告"""
        html_filename = f"plant_{report.plant_id}_{report.timestamp}.html"
        html_path = self.reports_dir / html_filename
        
        # 病害切割遮罩部分
        mask_section = ""
        if report.segmentation_mask:
            mask_filename = f"mask_plant_{report.plant_id}_{report.timestamp}.png"
            mask_section = f"""
            <div class="section">
                <h2>病害区域切割</h2>
                <p><strong>病害描述:</strong> {report.disease_description or '无'}</p>
                <img src="../masks/{mask_filename}" class="image" alt="病害切割遮罩">
            </div>
            """
        
        # 生成HTML
        html_content = f"""
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>植株 {report.plant_id} 诊断报告</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
                h2 {{ color: #34495e; }}
                .section {{ margin: 20px 0; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .image {{ max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #ddd; }}
                .metadata {{ color: #7f8c8d; font-size: 0.9em; }}
                .diagnosis {{ white-space: pre-wrap; background: #f8f9fa; padding: 10px; border-radius: 4px; border-left: 4px solid #3498db; }}
                .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; border-radius: 4px; }}
            </style>
        </head>
        <body>
            <h1>🌱 农作物诊断报告</h1>
            <div class="section">
                <h2>📋 基本信息</h2>
                <p><strong>植株ID:</strong> {report.plant_id}</p>
                <p><strong>诊断时间:</strong> {report.timestamp}</p>
                <p><strong>图像位置:</strong> {report.image_path}</p>
            </div>
            <div class="section">
                <h2>📸 植株图像</h2>
                <img src="../images/{os.path.basename(report.image_path)}" class="image" alt="植株图像">
            </div>
            {mask_section}
            <div class="section">
                <h2>🔬 诊断结果</h2>
                <pre class="diagnosis">{json.dumps(report.diagnosis_result, ensure_ascii=False, indent=2)}</pre>
            </div>
        </body>
        </html>
        """
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ HTML报告已导出: {html_filename}")
        return str(html_path)


if __name__ == '__main__':
    # 测试代码
    import sys
    
    async def test_workflow():
        workflow = CropDiagnosisWorkflow()
        
        # 设置AI配置（测试用）
        workflow.set_ai_config({
            "provider": "openai",
            "model": "gpt-4-vision-preview",
            "max_tokens": 1000
        })
        
        # 设置回调
        def status_cb(msg):
            print(f"[STATUS] {msg}")
        
        def report_cb(report):
            print(f"[REPORT] {json.dumps(report, ensure_ascii=False, indent=2)}")
        
        workflow.set_status_callback(status_cb)
        workflow.set_report_callback(report_cb)
        
        # 启动工作流
        workflow.start_workflow()
        
        # 测试图像
        if len(sys.argv) > 1:
            image_path = sys.argv[1]
            if os.path.exists(image_path):
                frame = cv2.imread(image_path)
                if frame is None:
                    print(f"错误: 无法读取图片 {image_path}")
                    return
                annotated, report = await workflow.process_frame(frame)
                
                if report:
                    print("✅ 诊断成功")
                    # 导出报告
                    html_path = workflow.export_report(report.plant_id, format='html')
                    print(f"HTML报告: {html_path}")
                else:
                    print("⚠️ 未检测到QR码或诊断失败")
                
                cv2.imshow('Result', annotated)
                cv2.waitKey(0)
                cv2.destroyAllWindows()
            else:
                print(f"文件不存在: {image_path}")
        else:
            print("用法: python crop_diagnosis_workflow.py <图像路径>")
        
        workflow.stop_workflow()
    
    # 运行测试
    asyncio.run(test_workflow())




