#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
增强版QR码检测模块
支持扫描冷却功能，防止重复扫描同一ID的二维码
"""

import cv2
import numpy as np
from typing import Optional, Tuple, List, Dict
from datetime import datetime
import time
import re

try:
    from pyzbar import pyzbar
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False
    print("⚠️ pyzbar未安装，QR码检测不可用")
    print("请运行: pip install pyzbar")


class EnhancedQRDetector:
    """增强版QR码检测器，支持扫描冷却"""
    
    def __init__(self, cooldown_seconds: int = 60):
        """
        初始化增强版QR码检测器
        
        Args:
            cooldown_seconds: 扫描冷却时间（秒），默认60秒
        """
        self.cooldown_seconds = cooldown_seconds
        
        # 植株ID冷却记录: plant_id -> 冷却结束时间戳
        self.cooldown_tracker: Dict[int, float] = {}
        
        # 植株ID模式匹配
        self.plant_id_pattern = re.compile(r'(plant|植株|ID)[-_:]?(\d+)', re.IGNORECASE)
        
        # 检测历史
        self.detection_history: List[Dict] = []
        self.max_history = 100
        
        # 统计信息
        self.total_detections = 0
        self.blocked_detections = 0  # 被冷却阻止的检测次数
    
    def set_cooldown(self, seconds: int):
        """
        设置扫描冷却时间
        
        Args:
            seconds: 冷却时间（秒）
        """
        if seconds < 0:
            raise ValueError("冷却时间不能为负数")
        self.cooldown_seconds = seconds
        print(f"✅ QR扫描冷却时间已设置为 {seconds} 秒")
    
    def get_cooldown(self) -> int:
        """获取当前冷却时间设置"""
        return self.cooldown_seconds
    
    def is_in_cooldown(self, plant_id: int) -> bool:
        """
        检查植株ID是否在冷却期
        
        Args:
            plant_id: 植株ID
            
        Returns:
            是否在冷却期
        """
        if plant_id not in self.cooldown_tracker:
            return False
        
        current_time = time.time()
        cooldown_end = self.cooldown_tracker[plant_id]
        
        if current_time >= cooldown_end:
            # 冷却已结束，清理记录
            del self.cooldown_tracker[plant_id]
            return False
        
        return True
    
    def get_remaining_cooldown(self, plant_id: int) -> int:
        """
        获取植株ID的剩余冷却时间
        
        Args:
            plant_id: 植株ID
            
        Returns:
            剩余冷却时间（秒），如果不在冷却期则返回0
        """
        if plant_id not in self.cooldown_tracker:
            return 0
        
        current_time = time.time()
        cooldown_end = self.cooldown_tracker[plant_id]
        
        if current_time >= cooldown_end:
            del self.cooldown_tracker[plant_id]
            return 0
        
        return int(cooldown_end - current_time)
    
    def start_cooldown(self, plant_id: int):
        """
        为植株ID启动冷却
        
        Args:
            plant_id: 植株ID
        """
        current_time = time.time()
        cooldown_end = current_time + self.cooldown_seconds
        self.cooldown_tracker[plant_id] = cooldown_end
        print(f"⏱️ 植株 {plant_id} 进入冷却期，{self.cooldown_seconds}秒后可再次扫描")
    
    def detect(
        self, 
        frame: np.ndarray, 
        draw_annotations: bool = True,
        scan_region: Optional[Dict] = None,
        multi_detection: bool = False,
        max_detections: int = 5,
        validation_rules: Optional[Dict] = None
    ) -> Tuple[np.ndarray, List[Dict]]:
        """
        检测图像中的QR码，支持冷却过滤、区域扫描和内容验证
        
        Args:
            frame: 输入图像帧
            draw_annotations: 是否在图像上绘制检测框和信息
            scan_region: 扫描区域配置 {'type': 'full'|'center'|'top'|'bottom'|'custom', 'x': int, 'y': int, 'width': int, 'height': int}
            multi_detection: 是否检测多个QR码
            max_detections: 最大检测数量
            validation_rules: 验证规则 {'pattern': str, 'required_prefix': str, 'min_length': int, 'max_length': int}
            
        Returns:
            (标注后的图像, QR码检测结果列表)
        """
        if not PYZBAR_AVAILABLE:
            return frame, []
        
        annotated_frame = frame.copy() if draw_annotations else frame
        qr_results = []
        
        try:
            # 应用扫描区域
            scan_frame = self._apply_scan_region(frame, scan_region)
            region_offset = self._get_region_offset(frame, scan_region)
            
            # 解码QR码
            decoded_objects = pyzbar.decode(scan_frame)
            
            # 限制检测数量
            if not multi_detection and len(decoded_objects) > 0:
                decoded_objects = [decoded_objects[0]]
            elif multi_detection and len(decoded_objects) > max_detections:
                decoded_objects = decoded_objects[:max_detections]
            
            for obj in decoded_objects:
                self.total_detections += 1
                
                # 获取QR码数据
                qr_data = obj.data.decode('utf-8', errors='ignore')
                qr_type = obj.type
                
                # 获取边界框坐标（调整区域偏移）
                points = obj.polygon
                if len(points) == 4:
                    pts = [(point.x + region_offset[0], point.y + region_offset[1]) for point in points]
                    x_coords = [p[0] for p in pts]
                    y_coords = [p[1] for p in pts]
                    x1, y1 = min(x_coords), min(y_coords)
                    x2, y2 = max(x_coords), max(y_coords)
                    center_x = int((x1 + x2) / 2)
                    center_y = int((y1 + y2) / 2)
                    w = x2 - x1
                    h = y2 - y1
                else:
                    rect = obj.rect
                    x1, y1 = rect.left + region_offset[0], rect.top + region_offset[1]
                    w, h = rect.width, rect.height
                    x2, y2 = x1 + w, y1 + h
                    center_x = int(x1 + w / 2)
                    center_y = int(y1 + h / 2)
                
                # 验证QR码内容
                is_valid, validation_errors = self._validate_qr_content(qr_data, validation_rules)
                
                # 解析植株ID
                plant_id = self._extract_plant_id(qr_data)
                
                # 检查冷却状态
                in_cooldown = False
                remaining_cooldown = 0
                if plant_id is not None:
                    in_cooldown = self.is_in_cooldown(plant_id)
                    if in_cooldown:
                        remaining_cooldown = self.get_remaining_cooldown(plant_id)
                        self.blocked_detections += 1
                        print(f"⏸️ 植株 {plant_id} 在冷却期，剩余 {remaining_cooldown} 秒")
                
                # 构建结果
                result = {
                    'data': qr_data,
                    'type': qr_type,
                    'bbox': [x1, y1, w, h],
                    'center': [center_x, center_y],
                    'plant_id': plant_id,
                    'timestamp': datetime.now().strftime('%H:%M:%S'),
                    'in_cooldown': in_cooldown,
                    'remaining_cooldown': remaining_cooldown,
                    'valid': is_valid,
                    'validation_errors': validation_errors if not is_valid else []
                }
                
                # 只有不在冷却期且验证通过的QR码才添加到结果中
                if not in_cooldown and is_valid:
                    qr_results.append(result)
                    
                    # 如果有植株ID，启动冷却
                    if plant_id is not None:
                        self.start_cooldown(plant_id)
                    
                    # 记录到历史
                    self._add_to_history(result)
                elif not is_valid:
                    print(f"⚠️ QR码验证失败: {', '.join(validation_errors)}")
                
                # 绘制标注
                if draw_annotations:
                    # 根据状态选择颜色
                    if not is_valid:
                        box_color = (0, 0, 255)  # 红色表示验证失败
                        text_bg_color = (0, 0, 255)
                    elif in_cooldown:
                        box_color = (128, 128, 128)  # 灰色表示冷却中
                        text_bg_color = (128, 128, 128)
                    else:
                        box_color = (0, 255, 0)  # 绿色表示可扫描
                        text_bg_color = (0, 255, 0)
                    
                    # 绘制边界框
                    if len(points) == 4:
                        pts_array = np.array(pts, dtype=np.int32)
                        cv2.polylines(annotated_frame, [pts_array], True, box_color, 3)
                    else:
                        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color, 3)
                    
                    # 绘制中心点
                    cv2.circle(annotated_frame, (center_x, center_y), 5, (0, 0, 255), -1)
                    
                    # 绘制信息文本
                    if not is_valid:
                        label = f"QR: 验证失败"
                    elif plant_id:
                        if in_cooldown:
                            label = f"植株ID: {plant_id} (冷却:{remaining_cooldown}s)"
                        else:
                            label = f"植株ID: {plant_id}"
                    else:
                        label = f"QR: {qr_data[:20]}"
                    
                    # 背景框
                    (text_w, text_h), baseline = cv2.getTextSize(
                        label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2
                    )
                    cv2.rectangle(annotated_frame, 
                                (x1, y1 - text_h - 15), 
                                (x1 + text_w + 10, y1), 
                                text_bg_color, -1)
                    
                    # 文本
                    cv2.putText(annotated_frame, label, 
                              (x1 + 5, y1 - 8),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, 
                              (0, 0, 0), 2)
            
            return annotated_frame, qr_results
            
        except Exception as e:
            print(f"❌ QR码检测错误: {e}")
            import traceback
            traceback.print_exc()
            return frame, []
    
    def _extract_plant_id(self, qr_data: str) -> Optional[int]:
        """
        从QR码数据中提取植株ID
        
        支持格式:
        - "plant_123"
        - "植株ID:123"
        - "PLANT-456"
        - "challenge-code://user-2/quiz-2/solution-plant_123"
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
    
    def clear_cooldowns(self):
        """清空所有冷却记录"""
        self.cooldown_tracker.clear()
        print("✅ 已清空所有QR扫描冷却记录")
    
    def get_cooldown_status(self) -> Dict:
        """
        获取冷却状态信息
        
        Returns:
            冷却状态字典
        """
        current_time = time.time()
        active_cooldowns = {}
        
        for plant_id, cooldown_end in list(self.cooldown_tracker.items()):
            remaining = int(cooldown_end - current_time)
            if remaining > 0:
                active_cooldowns[plant_id] = remaining
            else:
                del self.cooldown_tracker[plant_id]
        
        return {
            'cooldown_seconds': self.cooldown_seconds,
            'active_cooldowns': active_cooldowns,
            'total_detections': self.total_detections,
            'blocked_detections': self.blocked_detections
        }
    
    def get_statistics(self) -> Dict:
        """
        获取检测统计信息
        
        Returns:
            统计信息字典
        """
        return {
            'total_detections': self.total_detections,
            'blocked_detections': self.blocked_detections,
            'successful_detections': self.total_detections - self.blocked_detections,
            'history_count': len(self.detection_history),
            'active_cooldowns': len(self.cooldown_tracker),
            'cooldown_seconds': self.cooldown_seconds
        }
    
    def _apply_scan_region(self, frame: np.ndarray, scan_region: Optional[Dict]) -> np.ndarray:
        """
        应用扫描区域裁剪
        
        Args:
            frame: 输入图像
            scan_region: 扫描区域配置
            
        Returns:
            裁剪后的图像
        """
        if not scan_region or scan_region.get('type') == 'full':
            return frame
        
        h, w = frame.shape[:2]
        region_type = scan_region.get('type', 'full')
        
        if region_type == 'center':
            # 中心50%区域
            x1, y1 = int(w * 0.25), int(h * 0.25)
            x2, y2 = int(w * 0.75), int(h * 0.75)
            return frame[y1:y2, x1:x2]
        
        elif region_type == 'top':
            # 上半部分
            return frame[:h//2, :]
        
        elif region_type == 'bottom':
            # 下半部分
            return frame[h//2:, :]
        
        elif region_type == 'custom':
            # 自定义区域
            x = scan_region.get('x', 0)
            y = scan_region.get('y', 0)
            width = scan_region.get('width', w)
            height = scan_region.get('height', h)
            
            # 确保坐标在有效范围内
            x1 = max(0, min(x, w))
            y1 = max(0, min(y, h))
            x2 = max(0, min(x + width, w))
            y2 = max(0, min(y + height, h))
            
            return frame[y1:y2, x1:x2]
        
        return frame
    
    def _get_region_offset(self, frame: np.ndarray, scan_region: Optional[Dict]) -> Tuple[int, int]:
        """
        获取扫描区域的偏移量
        
        Args:
            frame: 输入图像
            scan_region: 扫描区域配置
            
        Returns:
            (x_offset, y_offset)
        """
        if not scan_region or scan_region.get('type') == 'full':
            return (0, 0)
        
        h, w = frame.shape[:2]
        region_type = scan_region.get('type', 'full')
        
        if region_type == 'center':
            return (int(w * 0.25), int(h * 0.25))
        
        elif region_type == 'top':
            return (0, 0)
        
        elif region_type == 'bottom':
            return (0, h//2)
        
        elif region_type == 'custom':
            x = scan_region.get('x', 0)
            y = scan_region.get('y', 0)
            return (max(0, x), max(0, y))
        
        return (0, 0)
    
    def _validate_qr_content(self, qr_data: str, validation_rules: Optional[Dict]) -> Tuple[bool, List[str]]:
        """
        验证QR码内容
        
        Args:
            qr_data: QR码数据
            validation_rules: 验证规则
            
        Returns:
            (是否有效, 错误信息列表)
        """
        if not validation_rules:
            return (True, [])
        
        errors = []
        
        # 正则表达式验证
        pattern = validation_rules.get('pattern')
        if pattern:
            try:
                if not re.match(pattern, qr_data):
                    errors.append(f"内容不匹配模式: {pattern}")
            except re.error as e:
                errors.append(f"无效的正则表达式: {e}")
        
        # 前缀验证
        required_prefix = validation_rules.get('required_prefix')
        if required_prefix and not qr_data.startswith(required_prefix):
            errors.append(f"内容必须以 '{required_prefix}' 开头")
        
        # 长度验证
        min_length = validation_rules.get('min_length', 0)
        if min_length > 0 and len(qr_data) < min_length:
            errors.append(f"内容太短 (最小: {min_length})")
        
        max_length = validation_rules.get('max_length', 0)
        if max_length > 0 and len(qr_data) > max_length:
            errors.append(f"内容太长 (最大: {max_length})")
        
        return (len(errors) == 0, errors)
