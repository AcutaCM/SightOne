import cv2
import torch
import numpy as np
import os
from typing import Any, Dict, Optional

# Corrected import path for ultralytics Results object
try:
    from ultralytics import YOLO
    from ultralytics.engine.results import Results
except ImportError:
    print("⚠️ ultralytics library not found. The 'Results' type hint will be 'Any'.")
    Results = Any
    YOLO = None

class StrawberryMaturityAnalyzer:
    def __init__(self, model_path: Optional[str] = None):
        if model_path is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.abspath(os.path.join(current_dir, '..', '..', 'release', 'drone-analyzer-nextjs', 'models', 'best.pt'))

        print(f"🍓 正在从以下路径加载草莓检测模型: {model_path}")
        model_path = model_path.replace('\\', '/')

        self.model: Any = None
        self.conf = 0.45
        self.iou = 0.50
        
        # Custom color mapping for maturity levels (BGR format for OpenCV)
        self.color_map = {
            'unripe': (0, 255, 0),          # Green
            'partially_ripe': (0, 255, 255), # Yellow
            'ripe': (0, 0, 255),            # Red
            'overripe': (0, 0, 139)         # Dark red
        }
        
        try:
            if YOLO is None:
                raise ImportError("ultralytics library is not installed.")

            if not os.path.exists(model_path):
                raise FileNotFoundError(f"模型文件不存在: {model_path}")

            self.model = YOLO(model_path)
            self.classes = self.model.names
            self.color_keys = ['unripe', 'partially_ripe', 'ripe', 'overripe']
            print("✅ 草莓检测模型加载成功。")
            print(f"📋 模型类别: {self.classes}")
            print(f"🎨 颜色映射: {self.color_map}")
        except Exception as e:
            self.model = None
            print(f"❌ 加载草莓检测模型失败: {e}")

    def get_maturity_summary(self, results: Results) -> Dict[str, int]:
        """从YOLO结果对象中提取成熟度统计信息。"""
        summary = {k: 0 for k in self.color_keys}
        summary['total'] = 0
        
        if not results or not results[0]:
            return summary

        names = results[0].names
        if results[0].boxes is None:
             return summary
        
        classes_tensor = results[0].boxes.cls
        if classes_tensor is None:
            return summary
            
        detected_classes = classes_tensor.tolist()
        summary['total'] = len(detected_classes)
        
        for cls_index in detected_classes:
            try:
                name = names[int(cls_index)]
                if name in summary:
                    summary[name] += 1
            except (IndexError, KeyError):
                print(f"⚠️ 未知的类别索引: {cls_index}")
        return summary

    def detect_and_draw(self, frame: np.ndarray) -> (np.ndarray, Dict[str, int]):
        """
        执行检测并使用自定义颜色绘制标注。
        返回标注后的帧和统计摘要。
        
        IMPORTANT: Input frame is in BGR (OpenCV default).
        YOLO needs RGB for inference, but we return BGR for display.
        """
        if not self.model:
            return frame, {}

        # 转换BGR到RGB用于YOLO推理
        # YOLO模型需要RGB色域才能正确检测
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # 在RGB帧上运行YOLOv8推断
        results = self.model(frame_rgb, conf=self.conf, iou=self.iou)

        # 在绘图前获取摘要
        summary = self.get_maturity_summary(results)

        # 手动绘制带有自定义颜色的边界框
        annotated_frame = frame.copy()  # Keep in BGR
        
        if results and results[0].boxes is not None and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            names = results[0].names
            
            print(f"🎨 绘制 {len(boxes)} 个检测框")
            
            for i, box in enumerate(boxes):
                try:
                    # 获取边界框坐标
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    
                    # 获取类别和置信度
                    cls_id = int(box.cls[0].cpu().numpy())
                    conf = float(box.conf[0].cpu().numpy())
                    class_name = names[cls_id]
                    
                    # 使用蓝色边界框（更清晰可见）
                    box_color = (255, 0, 0)  # 蓝色 BGR
                    
                    print(f"  框 {i+1}: {class_name} @ ({x1},{y1})-({x2},{y2}), 置信度={conf:.2f}")
                    
                    # 绘制边界框 - 使用蓝色粗线条
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color, 3)
                    
                    # 准备标签文本
                    label = f"{class_name}: {conf:.2f}"
                    
                    # 获取文本大小以绘制背景
                    (text_w, text_h), baseline = cv2.getTextSize(
                        label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2
                    )
                    
                    # 确保标签不会超出图像边界
                    label_y1 = max(y1 - text_h - 10, 0)
                    label_y2 = max(y1, text_h + 10)
                    
                    # 绘制标签背景（蓝色）
                    cv2.rectangle(
                        annotated_frame,
                        (x1, label_y1),
                        (x1 + text_w + 10, label_y2),
                        box_color,
                        -1  # Filled rectangle
                    )
                    
                    # 绘制标签文本（白色文字）
                    cv2.putText(
                        annotated_frame,
                        label,
                        (x1 + 5, label_y2 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        (255, 255, 255),  # White text in BGR
                        2,
                        cv2.LINE_AA
                    )
                except Exception as e:
                    print(f"  ❌ 绘制框 {i+1} 时出错: {e}")
                    continue

        print(f"✅ 检测完成: 总计 {summary.get('total', 0)} 个草莓")
        return annotated_frame, summary