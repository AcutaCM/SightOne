#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YOLO Detection Service
提供YOLO检测功能和模型管理API
"""

import os
import base64
import numpy as np
import cv2
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path


class YOLODetectionService:
    """YOLO检测服务"""
    
    def __init__(self, model_manager=None):
        """
        初始化YOLO检测服务
        
        Args:
            model_manager: YOLOModelManager实例
        """
        self.model_manager = model_manager
        self.loaded_models: Dict[str, Any] = {}  # 缓存已加载的模型
        
        print("✅ YOLO检测服务初始化成功")
    
    def load_model(self, model_id: str) -> Tuple[bool, str, Optional[Any]]:
        """
        加载YOLO模型
        
        Args:
            model_id: 模型ID
            
        Returns:
            (是否成功, 消息, 模型对象)
        """
        # 检查模型是否已加载
        if model_id in self.loaded_models:
            return True, "模型已加载", self.loaded_models[model_id]
        
        # 获取模型路径
        if not self.model_manager:
            return False, "模型管理器未初始化", None
        
        model_path = self.model_manager.get_model_path(model_id)
        if not model_path:
            return False, f"模型 '{model_id}' 不存在或未下载", None
        
        # 加载模型
        try:
            from ultralytics import YOLO
            model = YOLO(model_path)
            self.loaded_models[model_id] = model
            print(f"✅ 模型 '{model_id}' 加载成功")
            return True, "模型加载成功", model
        except Exception as e:
            return False, f"模型加载失败: {e}", None
    
    def unload_model(self, model_id: str) -> Tuple[bool, str]:
        """
        卸载模型以释放内存
        
        Args:
            model_id: 模型ID
            
        Returns:
            (是否成功, 消息)
        """
        if model_id in self.loaded_models:
            del self.loaded_models[model_id]
            return True, f"模型 '{model_id}' 已卸载"
        return False, "模型未加载"
    
    def detect(
        self,
        image: np.ndarray,
        model_id: str = 'yolov8n',
        confidence: float = 0.5,
        iou_threshold: float = 0.45,
        classes: Optional[List[int]] = None,
        draw_results: bool = True
    ) -> Tuple[bool, str, Optional[Dict]]:
        """
        执行YOLO检测
        
        Args:
            image: 输入图像（BGR格式）
            model_id: 模型ID
            confidence: 置信度阈值
            iou_threshold: IOU阈值
            classes: 要检测的类别ID列表，None表示检测所有类别
            draw_results: 是否绘制检测结果
            
        Returns:
            (是否成功, 消息, 检测结果)
        """
        # 加载模型
        success, msg, model = self.load_model(model_id)
        if not success:
            return False, msg, None
        
        try:
            # 转换BGR到RGB用于YOLO推理
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # 执行检测
            results = model(
                image_rgb,
                conf=confidence,
                iou=iou_threshold,
                classes=classes,
                verbose=False
            )
            
            # 解析检测结果
            detections = []
            annotated_image = image.copy() if draw_results else None
            
            if results and len(results) > 0:
                result = results[0]
                
                if result.boxes is not None and len(result.boxes) > 0:
                    boxes = result.boxes
                    names = result.names
                    
                    for i, box in enumerate(boxes):
                        # 获取边界框坐标
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                        
                        # 获取类别和置信度
                        cls_id = int(box.cls[0].cpu().numpy())
                        conf = float(box.conf[0].cpu().numpy())
                        class_name = names[cls_id]
                        
                        # 添加到检测结果
                        detections.append({
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'class_id': cls_id,
                            'class': class_name,
                            'confidence': conf
                        })
                        
                        # 绘制检测框
                        if draw_results and annotated_image is not None:
                            # 使用蓝色边界框
                            color = (255, 0, 0)  # BGR格式
                            
                            # 绘制边界框
                            cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
                            
                            # 准备标签
                            label = f"{class_name}: {conf:.2f}"
                            
                            # 获取文本大小
                            (text_w, text_h), baseline = cv2.getTextSize(
                                label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
                            )
                            
                            # 绘制标签背景
                            cv2.rectangle(
                                annotated_image,
                                (x1, y1 - text_h - 10),
                                (x1 + text_w + 10, y1),
                                color,
                                -1
                            )
                            
                            # 绘制标签文本
                            cv2.putText(
                                annotated_image,
                                label,
                                (x1 + 5, y1 - 5),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.6,
                                (255, 255, 255),
                                2,
                                cv2.LINE_AA
                            )
            
            # 准备返回结果
            result_data = {
                'detections': detections,
                'count': len(detections),
                'model_id': model_id,
                'confidence_threshold': confidence,
                'iou_threshold': iou_threshold
            }
            
            # 如果绘制了结果，添加标注图像
            if draw_results and annotated_image is not None:
                # 转换BGR到RGB用于前端显示
                annotated_image_rgb = cv2.cvtColor(annotated_image, cv2.COLOR_BGR2RGB)
                _, buffer = cv2.imencode('.jpg', annotated_image_rgb, [cv2.IMWRITE_JPEG_QUALITY, 90])
                image_b64 = base64.b64encode(buffer.tobytes()).decode('utf-8')
                result_data['annotated_image'] = f'data:image/jpeg;base64,{image_b64}'
            
            return True, f"检测完成，发现 {len(detections)} 个目标", result_data
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return False, f"检测失败: {e}", None
    
    def detect_from_base64(
        self,
        image_b64: str,
        model_id: str = 'yolov8n',
        confidence: float = 0.5,
        iou_threshold: float = 0.45,
        classes: Optional[List[int]] = None,
        draw_results: bool = True
    ) -> Tuple[bool, str, Optional[Dict]]:
        """
        从base64编码的图像执行检测
        
        Args:
            image_b64: base64编码的图像
            其他参数同detect方法
            
        Returns:
            (是否成功, 消息, 检测结果)
        """
        try:
            # 解码base64图像
            if image_b64.startswith('data:image'):
                image_b64 = image_b64.split(',')[1]
            
            image_bytes = base64.b64decode(image_b64)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return False, "图像解码失败", None
            
            # 执行检测
            return self.detect(
                image,
                model_id=model_id,
                confidence=confidence,
                iou_threshold=iou_threshold,
                classes=classes,
                draw_results=draw_results
            )
            
        except Exception as e:
            return False, f"图像处理失败: {e}", None
    
    def get_model_classes(self, model_id: str) -> Tuple[bool, str, Optional[Dict[int, str]]]:
        """
        获取模型的类别信息
        
        Args:
            model_id: 模型ID
            
        Returns:
            (是否成功, 消息, 类别字典)
        """
        success, msg, model = self.load_model(model_id)
        if not success:
            return False, msg, None
        
        try:
            classes = model.names
            return True, "获取类别成功", classes
        except Exception as e:
            return False, f"获取类别失败: {e}", None


# 测试代码
if __name__ == '__main__':
    from yolo_model_manager import YOLOModelManager
    
    # 初始化管理器和服务
    manager = YOLOModelManager()
    service = YOLODetectionService(manager)
    
    print("\n📋 测试YOLO检测服务")
    
    # 测试加载模型
    print("\n1. 测试加载模型...")
    success, msg, model = service.load_model('yolov8n')
    print(f"   {msg}")
    
    if success:
        # 测试获取类别
        print("\n2. 测试获取类别...")
        success, msg, classes = service.get_model_classes('yolov8n')
        if success:
            print(f"   模型有 {len(classes)} 个类别")
            print(f"   前5个类别: {list(classes.values())[:5]}")
    
    print("\n测试完成！")
