#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
QR码检测模块
专门用于Tello无人机的QR码识别，支持植株ID识别
"""

import cv2
import numpy as np
from typing import Optional, Tuple, List, Dict
from datetime import datetime
import re

try:
    from pyzbar import pyzbar
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False
    print("⚠️ pyzbar未安装，QR码检测不可用")
    print("请运行: pip install pyzbar")


class QRDetector:
    """QR码检测器"""
    
    def __init__(self):
        """初始化QR码检测器"""
        self.last_detected_qr = None
        self.last_detection_time = None
        self.detection_cooldown = 2.0  # 秒，防止重复检测
        
        # 植株ID模式匹配
        self.plant_id_pattern = re.compile(r'(plant|植株|ID)[-_:]?(\d+)', re.IGNORECASE)
        
        # 检测历史
        self.detection_history: List[Dict] = []
        self.max_history = 100
    
    def detect(self, frame: np.ndarray, draw_annotations: bool = True) -> Tuple[np.ndarray, List[Dict]]:
        """
        检测图像中的QR码
        
        Args:
            frame: 输入图像帧
            draw_annotations: 是否在图像上绘制检测框和信息
            
        Returns:
            (标注后的图像, QR码检测结果列表)
        """
        if not PYZBAR_AVAILABLE:
            return frame, []
        
        annotated_frame = frame.copy() if draw_annotations else frame
        qr_results = []
        
        try:
            # 解码QR码
            decoded_objects = pyzbar.decode(frame)
            
            for obj in decoded_objects:
                # 获取QR码数据
                qr_data = obj.data.decode('utf-8', errors='ignore')
                qr_type = obj.type
                
                # 获取边界框坐标
                points = obj.polygon
                if len(points) == 4:
                    pts = [(point.x, point.y) for point in points]
                    x_coords = [p[0] for p in pts]
                    y_coords = [p[1] for p in pts]
                    x1, y1 = min(x_coords), min(y_coords)
                    x2, y2 = max(x_coords), max(y_coords)
                    center_x = int((x1 + x2) / 2)
                    center_y = int((y1 + y2) / 2)
                else:
                    rect = obj.rect
                    x1, y1 = rect.left, rect.top
                    x2, y2 = x1 + rect.width, y1 + rect.height
                    center_x = int(x1 + rect.width / 2)
                    center_y = int(y1 + rect.height / 2)
                
                # 解析植株ID
                plant_id = self._extract_plant_id(qr_data)
                
                # 构建结果
                result = {
                    'data': qr_data,
                    'type': qr_type,
                    'bbox': [x1, y1, x2, y2],
                    'center': [center_x, center_y],
                    'plant_id': plant_id,
                    'timestamp': datetime.now().isoformat()
                }
                
                qr_results.append(result)
                
                # 记录到历史
                self._add_to_history(result)
                
                # 绘制标注
                if draw_annotations:
                    # 绘制边界框
                    if len(points) == 4:
                        pts_array = np.array(pts, dtype=np.int32)
                        cv2.polylines(annotated_frame, [pts_array], True, (0, 255, 0), 3)
                    else:
                        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 3)
                    
                    # 绘制中心点
                    cv2.circle(annotated_frame, (center_x, center_y), 5, (0, 0, 255), -1)
                    
                    # 绘制信息文本
                    if plant_id:
                        label = f"植株ID: {plant_id}"
                        color = (0, 255, 0)
                    else:
                        label = f"QR: {qr_data[:20]}"
                        color = (255, 255, 0)
                    
                    # 背景框
                    (text_w, text_h), baseline = cv2.getTextSize(
                        label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2
                    )
                    cv2.rectangle(annotated_frame, 
                                (x1, y1 - text_h - 15), 
                                (x1 + text_w + 10, y1), 
                                color, -1)
                    
                    # 文本
                    cv2.putText(annotated_frame, label, 
                              (x1 + 5, y1 - 8),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, 
                              (0, 0, 0), 2)
            
            return annotated_frame, qr_results
            
        except Exception as e:
            print(f"❌ QR码检测错误: {e}")
            return frame, []
    
    def _extract_plant_id(self, qr_data: str) -> Optional[int]:
        """
        从QR码数据中提取植株ID
        
        支持格式:
        - "plant_123"
        - "植株ID:123"
        - "PLANT-456"
        - "123" (纯数字)
        
        Args:
            qr_data: QR码数据
            
        Returns:
            植株ID（整数），如果无法识别则返回None
        """
        # 首先尝试匹配带前缀的格式
        match = self.plant_id_pattern.search(qr_data)
        if match:
            try:
                return int(match.group(2))
            except (ValueError, IndexError):
                pass
        
        # 如果是纯数字，直接返回
        if qr_data.isdigit():
            return int(qr_data)
        
        return None
    
    def _add_to_history(self, result: Dict):
        """添加检测结果到历史记录"""
        self.detection_history.append(result)
        
        # 限制历史记录大小
        if len(self.detection_history) > self.max_history:
            self.detection_history = self.detection_history[-self.max_history:]
    
    def get_last_plant_id(self) -> Optional[int]:
        """获取最后检测到的植株ID"""
        for result in reversed(self.detection_history):
            if result.get('plant_id') is not None:
                return result['plant_id']
        return None
    
    def get_detection_history(self, limit: int = 10) -> List[Dict]:
        """
        获取检测历史
        
        Args:
            limit: 返回的最大记录数
            
        Returns:
            检测历史列表
        """
        return self.detection_history[-limit:]
    
    def clear_history(self):
        """清空检测历史"""
        self.detection_history.clear()
        self.last_detected_qr = None
        self.last_detection_time = None
    
    def is_valid_plant_id(self, qr_data: str) -> bool:
        """
        检查QR码数据是否包含有效的植株ID
        
        Args:
            qr_data: QR码数据
            
        Returns:
            是否包含有效植株ID
        """
        return self._extract_plant_id(qr_data) is not None


# 增强的QR码检测器，支持图像预处理
class EnhancedQRDetector(QRDetector):
    """增强型QR码检测器，包含图像预处理功能"""
    
    def __init__(self):
        super().__init__()
        self.use_preprocessing = True
    
    def detect(self, frame: np.ndarray, draw_annotations: bool = True) -> Tuple[np.ndarray, List[Dict]]:
        """
        检测QR码，如果直接检测失败则使用预处理后的图像
        
        Args:
            frame: 输入图像帧
            draw_annotations: 是否绘制标注
            
        Returns:
            (标注后的图像, QR码检测结果列表)
        """
        # 先尝试直接检测
        annotated_frame, results = super().detect(frame, draw_annotations=False)
        
        # 如果没有检测到且启用了预处理，尝试预处理后检测
        if not results and self.use_preprocessing:
            preprocessed = self._preprocess_image(frame)
            _, results = super().detect(preprocessed, draw_annotations=False)
        
        # 如果需要绘制标注
        if results and draw_annotations:
            annotated_frame, results = super().detect(frame, draw_annotations=True)
        
        return annotated_frame, results
    
    def _preprocess_image(self, frame: np.ndarray) -> np.ndarray:
        """
        图像预处理以提高QR码检测成功率
        
        Args:
            frame: 原始图像
            
        Returns:
            预处理后的图像
        """
        # 转换为灰度图
        if len(frame.shape) == 3:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray = frame
        
        # 直方图均衡化
        equalized = cv2.equalizeHist(gray)
        
        # 自适应阈值
        adaptive = cv2.adaptiveThreshold(
            equalized, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # 去噪
        denoised = cv2.medianBlur(adaptive, 3)
        
        return denoised


if __name__ == '__main__':
    # 测试代码
    import sys
    
    if len(sys.argv) > 1:
        # 从文件测试
        img_path = sys.argv[1]
        if os.path.exists(img_path):
            frame = cv2.imread(img_path)
            detector = EnhancedQRDetector()
            annotated, results = detector.detect(frame)
            
            print(f"检测到 {len(results)} 个QR码:")
            for r in results:
                print(f"  数据: {r['data']}")
                print(f"  植株ID: {r.get('plant_id', 'N/A')}")
                print(f"  位置: {r['center']}")
            
            cv2.imshow('QR Detection', annotated)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        else:
            print(f"文件不存在: {img_path}")
    else:
        # 摄像头测试
        if not PYZBAR_AVAILABLE:
            print("pyzbar未安装，无法测试")
            sys.exit(1)
        
        detector = EnhancedQRDetector()
        cap = cv2.VideoCapture(0)
        
        print("打开摄像头测试QR码检测...")
        print("按 'q' 退出")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            annotated, results = detector.detect(frame)
            
            if results:
                for r in results:
                    print(f"检测到植株ID: {r.get('plant_id', 'N/A')}")
            
            cv2.imshow('QR Detection Test', annotated)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()










