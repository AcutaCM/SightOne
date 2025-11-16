#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIGHT ONE 后端服务 (瞰析 ONE Backend Service)
V4 - 单循环简化版
"""

import sys
import os

# ASCII Art Banner
BANNER = """
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   ███████╗██╗ ██████╗ ██╗  ██╗████████╗     ██████╗ ███╗   ██╗███████╗║
║   ██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝    ██╔═══██╗████╗  ██║██╔════╝║
║   ███████╗██║██║  ███╗███████║   ██║       ██║   ██║██╔██╗ ██║█████╗  ║
║   ╚════██║██║██║   ██║██╔══██║   ██║       ██║   ██║██║╚██╗██║██╔══╝  ║
║   ███████║██║╚██████╔╝██║  ██║   ██║       ╚██████╔╝██║ ╚████║███████╗║
║   ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝        ╚═════╝ ╚═╝  ╚═══╝╚══════╝║
║                                                                       ║
║                    瞰析 ONE - 智能视觉分析平台                         ║
║                  Intelligent Vision Analysis Platform                 ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
"""

def print_banner():
    """打印启动横幅"""
    print("\033[96m" + BANNER + "\033[0m")  # 青色
    print("\033[93m" + "=" * 75 + "\033[0m")  # 黄色分隔线
    print("\033[92m TTtalentDev\033[0m")  # 绿色
    print("\033[92m 正在启动 SIGHT ONE 后端服务...\033[0m")  # 绿色
    print("\033[93m" + "=" * 75 + "\033[0m")
    print()

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# 打印启动横幅
print_banner()

import json
from typing import Any, Dict, cast, Optional, Set
import asyncio
import threading
import time
import argparse
from datetime import datetime
import traceback
import base64
import numpy as np

# 预定义可选依赖名称
cv2 = cast(Any, None)
Tello = cast(Any, None)
StrawberryMaturityAnalyzer = cast(Any, None)

# 依赖库导入
TELLO_AVAILABLE = False
try:
    from djitellopy import Tello
    TELLO_AVAILABLE = True
    print("✓ djitellopy库加载成功")
except ImportError as e:
    print(f"✗ djitellopy库导入失败: {e}")

try:
    import cv2
    print("✓ OpenCV库加载成功")
except ImportError:
    cv2 = None
    print("✗ OpenCV库未安装！")

STRAWBERRY_ANALYZER_AVAILABLE = False
try:
    from strawberry_maturity_analyzer import StrawberryMaturityAnalyzer
    STRAWBERRY_ANALYZER_AVAILABLE = True
    print("✓ 草莓检测器模块加载成功")
except (ImportError, ModuleNotFoundError) as e:
    StrawberryMaturityAnalyzer = cast(Any, None)
    print(f"✗ 草莓检测器模块导入失败: {e}")

QR_DETECTOR_AVAILABLE = False
QRDetector = cast(Any, None)
try:
    from enhanced_qr_detector import EnhancedQRDetector as QRDetector
    QR_DETECTOR_AVAILABLE = True
    print("✓ 增强版QR检测器模块加载成功")
except (ImportError, ModuleNotFoundError) as e:
    print(f"✗ 增强版QR检测器模块导入失败: {e}")
    try:
        from qr_detector import QRDetector
        QR_DETECTOR_AVAILABLE = True
        print("✓ 标准QR检测器模块加载成功（回退）")
    except (ImportError, ModuleNotFoundError) as e2:
        print(f"✗ QR检测器模块导入失败: {e2}")

DIAGNOSIS_MANAGER_AVAILABLE = False
DiagnosisWorkflowManager = cast(Any, None)
try:
    from diagnosis_workflow_manager import DiagnosisWorkflowManager
    DIAGNOSIS_MANAGER_AVAILABLE = True
    print("✓ 诊断工作流管理器模块加载成功")
except (ImportError, ModuleNotFoundError) as e:
    print(f"✗ 诊断工作流管理器模块导入失败: {e}")

YOLO_MODEL_MANAGER_AVAILABLE = False
YOLOModelManager = cast(Any, None)
try:
    from yolo_model_manager import YOLOModelManager
    YOLO_MODEL_MANAGER_AVAILABLE = True
    print("✓ YOLO模型管理器模块加载成功")
except (ImportError, ModuleNotFoundError) as e:
    print(f"✗ YOLO模型管理器模块导入失败: {e}")

MISSION_CONTROLLER_AVAILABLE = False
MissionController = cast(Any, None)
try:
    from mission_controller import MissionController
    MISSION_CONTROLLER_AVAILABLE = True
    print("✓ 任务控制器模块加载成功")
except (ImportError, ModuleNotFoundError) as e:
    print(f"✗ 任务控制器模块导入失败: {e}")

websockets = None
try:
    import websockets
except ImportError:
    print("⚠️ websockets库未安装，WebSocket功能将不可用")


class DroneControllerAdapter:
    def __init__(self, tello_drone: 'Tello'):
        self.tello = tello_drone
        self._is_connected = False
        self._is_flying = False
    
    @property
    def is_connected(self): return self._is_connected and self.tello is not None
    @property
    def is_flying(self): return self._is_flying
    @property
    def mission_pad_id(self):
        """获取当前检测到的Mission Pad ID"""
        try:
            if self.tello:
                return self.tello.get_mission_pad_id()
        except Exception as e:
            print(f"获取Mission Pad ID失败: {e}")
        return -1
        
    def takeoff(self):
        try:
            if self.tello:
                # 检查实际飞行状态，而不只是内部标志
                try:
                    # 尝试获取高度来判断是否在飞行
                    height = self.tello.get_height()
                    if height > 10:  # 如果高度大于10cm，认为已经在飞行
                        print(f"⚠️ 无人机已在飞行中 (高度: {height}cm)")
                        self._is_flying = True
                        return False
                except:
                    pass  # 如果获取高度失败，继续尝试起飞
                
                print("📤 执行起飞命令...")
                self.tello.takeoff()
                self._is_flying = True
                print("✅ 起飞命令已发送")
                return True
        except Exception as e: 
            print(f"❌ 起飞失败: {e}")
            self._is_flying = False  # 起飞失败时重置状态
        return False
        
    def land(self):
        try:
            if self.tello:
                print("📥 执行降落命令...")
                self.tello.land()
                self._is_flying = False
                print("✅ 降落命令已发送")
                return True
        except Exception as e: 
            print(f"❌ 降落失败: {e}")
        return False
    
    def set_height(self, height_cm):
        """设置飞行高度（厘米）"""
        try:
            if self.tello and self._is_flying:
                current_height = self.tello.get_height()
                diff = height_cm - current_height
                if abs(diff) > 20:  # 只有差异大于20cm才调整
                    if diff > 0:
                        self.tello.move_up(int(abs(diff)))
                    else:
                        self.tello.move_down(int(abs(diff)))
                    return True
        except Exception as e:
            print(f"设置高度失败: {e}")
        return False
    
    def rotate(self, degrees):
        """旋转指定角度（度）"""
        try:
            if self.tello:
                if degrees > 0:
                    self.tello.rotate_clockwise(int(degrees))
                else:
                    self.tello.rotate_counter_clockwise(int(abs(degrees)))
                return True
        except Exception as e:
            print(f"旋转失败: {e}")
        return False
    
    def move_to_mission_pad(self, pad_id, x, y, z, speed):
        """移动到指定Mission Pad的位置"""
        try:
            if self.tello:
                # 使用Tello的go_xyz_speed_mid命令
                self.tello.go_xyz_speed_mid(int(x), int(y), int(z), int(speed), pad_id)
                return True
        except Exception as e:
            print(f"移动到Mission Pad失败: {e}")
        return False
        
    def manual_control(self, lr, fb, ud, yv):
        try:
            if self.tello: 
                self.tello.send_rc_control(int(lr), int(fb), int(ud), int(yv))
                return True
        except Exception as e: 
            print(f"手动控制失败: {e}")
        return False

    def update_connection_status(self, connected: bool): 
        self._is_connected = connected


class DroneBackendService:
    """无人机后端服务 (V4 - 单循环简化版)"""

    def __init__(self, ws_port=3002):
        self.ws_port = ws_port
        self.drone: Optional['Tello'] = None
        self.drone_adapter: Optional[DroneControllerAdapter] = None
        self.strawberry_analyzer: Optional['StrawberryMaturityAnalyzer'] = None
        self.qr_detector: Optional['QRDetector'] = None
        self.diagnosis_manager: Optional['DiagnosisWorkflowManager'] = None
        self.yolo_model_manager: Optional['YOLOModelManager'] = None
        self.mission_controller: Optional[Any] = None  # MissionController实例
        
        self.is_running = True
        self.connected_clients: Set[Any] = set()
        self.main_loop: Optional[asyncio.AbstractEventLoop] = None

        self.drone_state = {'flying': False, 'battery': 0, 'connected': False, 'challenge_cruise_active': False}

        self.video_streaming = False
        self.video_thread: Optional[threading.Thread] = None
        self.strawberry_detection_enabled = False
        self.qr_detection_enabled = False
        self.last_qr_results: List[Dict] = []
        
        self._initialize_detectors()

    def _initialize_detectors(self):
        # 初始化草莓检测器
        if STRAWBERRY_ANALYZER_AVAILABLE and StrawberryMaturityAnalyzer:
            try:
                # 构建模型的绝对路径
                current_dir = os.path.dirname(os.path.abspath(__file__))
                model_path = os.path.abspath(os.path.join(current_dir, 'models', 'best.pt'))
                
                # 确保模型文件存在
                if not os.path.exists(model_path):
                    print(f"❌ 模型文件未找到: {model_path}")
                    # 尝试备用路径
                    alt_model_path = os.path.abspath(os.path.join(current_dir, '..', '..', 'release', 'drone-analyzer-nextjs', 'models', 'best.pt'))
                    if os.path.exists(alt_model_path):
                        model_path = alt_model_path
                        print(f"✅ 在备用路径中找到模型: {model_path}")
                    else:
                        print(f"❌ 在备用路径中也未找到模型: {alt_model_path}")
                        self.strawberry_analyzer = None
                        return

                self.strawberry_analyzer = StrawberryMaturityAnalyzer(model_path=model_path)
                if not (self.strawberry_analyzer and self.strawberry_analyzer.model):
                    self.strawberry_analyzer = None
                    print("❌ 尽管路径存在，草莓检测器模型未能加载")
                else:
                    print("✅ 草莓检测器初始化成功")
            except Exception as e:
                print(f"❌ 草莓检测器初始化失败: {e}")
                self.strawberry_analyzer = None
        
        # 初始化QR检测器
        if QR_DETECTOR_AVAILABLE and QRDetector:
            try:
                self.qr_detector = QRDetector(cooldown_seconds=60)  # 默认60秒冷却
                print("✅ QR检测器初始化成功（冷却时间: 60秒）")
            except Exception as e:
                print(f"❌ QR检测器初始化失败: {e}")
                self.qr_detector = None
        
        # 初始化诊断工作流管理器
        if DIAGNOSIS_MANAGER_AVAILABLE and DiagnosisWorkflowManager:
            try:
                self.diagnosis_manager = DiagnosisWorkflowManager(cooldown_seconds=30)
                print("✅ 诊断工作流管理器初始化成功")
            except Exception as e:
                print(f"❌ 诊断工作流管理器初始化失败: {e}")
                self.diagnosis_manager = None
        
        # 初始化YOLO模型管理器
        if YOLO_MODEL_MANAGER_AVAILABLE and YOLOModelManager:
            try:
                self.yolo_model_manager = YOLOModelManager()
                print("✅ YOLO模型管理器初始化成功")
            except Exception as e:
                print(f"❌ YOLO模型管理器初始化失败: {e}")
                self.yolo_model_manager = None

    def video_stream_worker(self):
        """单循环视频流处理器 - 带检测pipeline和BGR色域保持"""
        print("📹 单循环视频流处理器已启动")
        frame_read = None
        last_summary_broadcast_time = 0

        while self.video_streaming and self.drone:
            try:
                if not self.drone_state.get('connected', False): 
                    break
                
                if frame_read is None:
                    frame_read = self.drone.get_frame_read()
                    if frame_read is None: 
                        time.sleep(0.5)
                        continue

                # 1. 获取帧（BGR色域 - OpenCV默认）
                frame = frame_read.frame
                if frame is None or not cv2: 
                    time.sleep(0.05)
                    continue

                # 色域处理流程：
                # - 输入: BGR (OpenCV)
                # - 检测: 内部转换BGR→RGB用于YOLO推理
                # - 绘制: 在BGR帧上绘制标注
                # - 输出: 转换BGR→RGB用于前端显示
                annotated_frame = frame.copy()  # BGR格式
                current_time = time.time()

                # 2. 应用草莓检测（如果启用）
                if self.strawberry_detection_enabled and self.strawberry_analyzer:
                    try:
                        # 检测器接收BGR帧，内部转换为RGB进行YOLO推理，返回BGR标注帧
                        annotated_frame, summary = self.strawberry_analyzer.detect_and_draw(annotated_frame)
                        
                        # 调试：打印检测结果
                        if summary.get('total', 0) > 0:
                            print(f"🍓 检测到 {summary['total']} 个草莓: {summary}")
                        
                        # 定期广播摘要
                        if summary.get('total', 0) > 0 and (current_time - last_summary_broadcast_time > 2):
                            if self.main_loop and not self.main_loop.is_closed():
                                asyncio.run_coroutine_threadsafe(
                                    self.broadcast_message('strawberry_summary', summary), 
                                    self.main_loop
                                )
                            last_summary_broadcast_time = current_time
                    except Exception as e:
                        print(f"❌ 草莓检测错误: {e}")
                        import traceback
                        traceback.print_exc()
                        # 继续处理，不让一个检测器的错误影响整个流

                # 3. 应用QR检测（如果启用）
                qr_results = []
                if self.qr_detection_enabled and self.qr_detector:
                    try:
                        # QR检测器在BGR色域工作，返回BGR帧
                        annotated_frame, qr_results = self.qr_detector.detect(
                            annotated_frame, draw_annotations=True
                        )
                        self.last_qr_results = qr_results
                        
                        # 广播QR检测结果
                        if qr_results:
                            if self.main_loop and not self.main_loop.is_closed():
                                # 准备QR结果数据（包含base64图像）
                                qr_data_list = []
                                for qr in qr_results:
                                    qr_data = {
                                        'plant_id': qr.get('plant_id'),
                                        'data': qr.get('data'),
                                        'timestamp': qr.get('timestamp')
                                    }
                                    
                                    # 裁剪QR码区域并编码为base64
                                    if 'bbox' in qr and qr['bbox']:
                                        try:
                                            x, y, w, h = qr['bbox']
                                            # 添加一些边距
                                            margin = 10
                                            x1 = max(0, x - margin)
                                            y1 = max(0, y - margin)
                                            x2 = min(annotated_frame.shape[1], x + w + margin)
                                            y2 = min(annotated_frame.shape[0], y + h + margin)
                                            
                                            # 裁剪QR码区域
                                            qr_crop = annotated_frame[y1:y2, x1:x2]
                                            
                                            # 转换为RGB用于显示
                                            qr_crop_rgb = cv2.cvtColor(qr_crop, cv2.COLOR_BGR2RGB)
                                            
                                            # 编码为JPEG
                                            _, qr_buffer = cv2.imencode('.jpg', qr_crop_rgb, [cv2.IMWRITE_JPEG_QUALITY, 90])
                                            qr_image_b64 = base64.b64encode(qr_buffer.tobytes()).decode('utf-8')
                                            qr_data['qr_image'] = qr_image_b64
                                            qr_data['size'] = f"{w}x{h}"
                                        except Exception as e:
                                            print(f"⚠️ QR码图像裁剪失败: {e}")
                                    
                                    qr_data_list.append(qr_data)
                                
                                asyncio.run_coroutine_threadsafe(
                                    self.broadcast_message('qr_detected', {
                                        'results': qr_data_list,
                                        'count': len(qr_results)
                                    }),
                                    self.main_loop
                                )
                    except Exception as e:
                        print(f"❌ QR检测错误: {e}")
                        # 继续处理

                # 4. 检查诊断触发
                if qr_results and self.diagnosis_manager and self.diagnosis_manager.enabled:
                    try:
                        for qr in qr_results:
                            plant_id = qr.get('plant_id')
                            if plant_id:
                                # 发送QR检测成功通知
                                if self.main_loop and not self.main_loop.is_closed():
                                    asyncio.run_coroutine_threadsafe(
                                        self.broadcast_message('qr_plant_detected', {
                                            'plant_id': plant_id,
                                            'timestamp': qr.get('timestamp'),
                                            'message': f'检测到植株 {plant_id}'
                                        }),
                                        self.main_loop
                                    )
                                
                                # 检查是否应该触发诊断
                                should_trigger = self.diagnosis_manager.should_trigger_diagnosis(plant_id)
                                
                                if not should_trigger:
                                    # 在冷却期，发送冷却通知
                                    remaining = self.diagnosis_manager.get_cooldown_remaining(plant_id)
                                    if remaining > 0:
                                        if self.main_loop and not self.main_loop.is_closed():
                                            asyncio.run_coroutine_threadsafe(
                                                self.broadcast_message('diagnosis_cooldown', {
                                                    'plant_id': plant_id,
                                                    'remaining_seconds': remaining,
                                                    'message': f'植株 {plant_id} 在冷却期，剩余 {remaining} 秒'
                                                }),
                                                self.main_loop
                                            )
                                    continue
                                
                                # 检查AI模型配置
                                model_config_valid, config_error = self._check_ai_model_config()
                                
                                if not model_config_valid:
                                    # 发送模型配置错误通知
                                    if self.main_loop and not self.main_loop.is_closed():
                                        asyncio.run_coroutine_threadsafe(
                                            self.broadcast_message('diagnosis_config_error', {
                                                'plant_id': plant_id,
                                                'error_type': config_error['type'],
                                                'message': config_error['message']
                                            }),
                                            self.main_loop
                                        )
                                    print(f"⚠️ 植株 {plant_id} 诊断跳过: {config_error['message']}")
                                    continue
                                
                                # 触发完整的三阶段诊断流程
                                print(f"🔍 触发植株 {plant_id} 的诊断流程")
                                
                                # 发送诊断开始消息
                                diagnosis_id = f"diag_{plant_id}_{int(time.time())}"
                                if self.main_loop and not self.main_loop.is_closed():
                                    asyncio.run_coroutine_threadsafe(
                                        self.broadcast_message('diagnosis_started', {
                                            'plant_id': plant_id,
                                            'diagnosis_id': diagnosis_id,
                                            'cooldown_seconds': self.diagnosis_manager.cooldown_seconds
                                        }),
                                        self.main_loop
                                    )
                                
                                # 异步执行完整诊断流程
                                asyncio.run_coroutine_threadsafe(
                                    self._execute_diagnosis_async(plant_id, frame.copy()),
                                    self.main_loop
                                )
                    except Exception as e:
                        print(f"❌ 诊断触发错误: {e}")
                        traceback.print_exc()

                # 5. 转换BGR到RGB用于前端显示
                # 前端浏览器期望RGB色域
                annotated_frame_rgb = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
                
                # 6. 编码并广播帧
                _, buffer = cv2.imencode('.jpg', annotated_frame_rgb, [cv2.IMWRITE_JPEG_QUALITY, 80])
                frame_b64 = base64.b64encode(buffer.tobytes()).decode('utf-8')
                
                if self.main_loop and not self.main_loop.is_closed():
                    asyncio.run_coroutine_threadsafe(
                        self.broadcast_message('video_frame', {
                            'frame': f'data:image/jpeg;base64,{frame_b64}'
                        }),
                        self.main_loop
                    )
                
                time.sleep(1/30)  # 30 FPS

            except Exception as e:
                print(f"❌ 视频流错误: {e}")
                traceback.print_exc()
                time.sleep(0.5)
        
        print("📹 视频流处理器已停止")

    async def start_websocket_server(self):
        print(f"🚀 启动WebSocket服务器，端口: {self.ws_port}")
        self.main_loop = asyncio.get_event_loop()

        async def handle_client(websocket, path=None):
            print(f"🔌 客户端连接: {websocket.remote_address}")
            self.connected_clients.add(websocket)
            try:
                await websocket.send(json.dumps({'type': 'connection_established'}))
                async for message in websocket:
                    await self.handle_websocket_message(websocket, message)
            except (websockets.exceptions.ConnectionClosed, websockets.exceptions.ConnectionClosedError):
                print(f"📴 客户端断开连接: {websocket.remote_address}")
            finally:
                self.connected_clients.discard(websocket)

        if websockets:
            server = await websockets.serve(handle_client, "localhost", self.ws_port)
            print(f"✅ WebSocket服务器已启动: ws://localhost:{self.ws_port}")
            return server
        return None

    async def handle_websocket_message(self, websocket, message):
        try:
            data = json.loads(message)
            msg_type = data.get('type')
            msg_data = data.get('data', {})
            print(f"收到消息: {msg_type}")

            handler = getattr(self, f"handle_{msg_type}", None)
            if handler and asyncio.iscoroutinefunction(handler):
                await handler(websocket, msg_data)
        except Exception as e: print(f"处理WebSocket消息失败: {e}")

    def start_streaming_thread(self):
        self.stop_streaming_thread()
        self.video_streaming = True
        self.video_thread = threading.Thread(target=self.video_stream_worker, daemon=True)
        self.video_thread.start()
        print("✅ 视频流处理线程已启动")

    def stop_streaming_thread(self):
        self.video_streaming = False
        if self.video_thread and self.video_thread.is_alive():
            try: self.video_thread.join(timeout=0.5)
            except: pass
        self.video_thread = None

    async def handle_drone_connect(self, websocket, data):
        if not TELLO_AVAILABLE: return await self.send_error(websocket, "djitellopy库未安装")
        if self.drone: return await self.send_error(websocket, "无人机已连接")
        try:
            await self.broadcast_message('status_update', '🔗 正在连接无人机...')
            self.drone = Tello()
            self.drone.connect()
            battery = self.drone.get_battery()
            self.drone_state.update({'connected': True, 'battery': battery})
            self.drone_adapter = DroneControllerAdapter(self.drone)
            self.drone_adapter.update_connection_status(True)
            
            # 初始化任务控制器
            if MISSION_CONTROLLER_AVAILABLE and MissionController:
                try:
                    # 创建状态回调函数
                    def status_callback(message):
                        if self.main_loop and not self.main_loop.is_closed():
                            asyncio.run_coroutine_threadsafe(
                                self.broadcast_message('mission_status', {
                                    'type': 'progress_update',
                                    'message': message
                                }),
                                self.main_loop
                            )
                    
                    # 创建位置回调函数
                    def position_callback(position_data):
                        if self.main_loop and not self.main_loop.is_closed():
                            asyncio.run_coroutine_threadsafe(
                                self.broadcast_message('mission_position', position_data),
                                self.main_loop
                            )
                    
                    self.mission_controller = MissionController(
                        self.drone_adapter,
                        status_callback=status_callback,
                        position_callback=position_callback
                    )
                    
                    # 设置任务完成回调
                    def mission_complete_callback():
                        self.drone_state['challenge_cruise_active'] = False
                        if self.main_loop and not self.main_loop.is_closed():
                            asyncio.run_coroutine_threadsafe(
                                self.broadcast_message('mission_status', {
                                    'status': 'challenge_cruise_stopped'
                                }),
                                self.main_loop
                            )
                    
                    self.mission_controller.mission_complete_callback = mission_complete_callback
                    print("✅ 任务控制器初始化成功")
                except Exception as e:
                    print(f"❌ 任务控制器初始化失败: {e}")
                    self.mission_controller = None
            
            self.drone.streamon()
            self.start_streaming_thread()
            print(f"✅ 无人机连接成功，电量: {battery}%")
            await self.broadcast_drone_status()
        except Exception as e:
            self.drone = None
            await self.send_error(websocket, f"连接失败: {e}")

    async def handle_drone_disconnect(self, websocket, data):
        if self.drone:
            self.stop_streaming_thread()
            try: self.drone.streamoff(); self.drone.end()
            except Exception: pass
            self.drone = None
            self.drone_adapter = None
            self.drone_state.update({'connected': False, 'flying': False, 'battery': 0})
            await self.broadcast_message('status_update', '📴 无人机已断开连接')
            await self.broadcast_drone_status()

    async def handle_drone_takeoff(self, websocket, data):
        if self.drone_adapter and self.drone_adapter.takeoff():
            self.drone_state['flying'] = True; await self.broadcast_drone_status()
        else: await self.send_error(websocket, "起飞失败")

    async def handle_drone_land(self, websocket, data):
        if self.drone_adapter and self.drone_adapter.land():
            self.drone_state['flying'] = False; await self.broadcast_drone_status()
        else: await self.send_error(websocket, "降落失败")

    async def handle_start_strawberry_detection(self, websocket, data):
        self.strawberry_detection_enabled = True
        await self.broadcast_message('status_update', '🍓 草莓检测已启动')
        await self.broadcast_detection_status()

    async def handle_stop_strawberry_detection(self, websocket, data):
        self.strawberry_detection_enabled = False
        await self.broadcast_message('status_update', '🍓 草莓检测已停止')
        await self.broadcast_detection_status()
    
    async def handle_start_qr_detection(self, websocket, data):
        """启用QR码检测"""
        self.qr_detection_enabled = True
        await self.broadcast_message('status_update', '🔍 QR检测已启动')
        await self.broadcast_detection_status()
    
    async def handle_stop_qr_detection(self, websocket, data):
        """禁用QR码检测"""
        self.qr_detection_enabled = False
        await self.broadcast_message('status_update', '🔍 QR检测已停止')
        await self.broadcast_detection_status()
    
    async def handle_start_diagnosis_workflow(self, websocket, data):
        """启用诊断工作流（仅启用QR检测，不启用草莓检测）"""
        if self.diagnosis_manager:
            self.diagnosis_manager.enabled = True
            
            # 仅自动启用QR检测（诊断工作流的必需依赖）
            if not self.qr_detection_enabled:
                self.qr_detection_enabled = True
                await self.broadcast_message('status_update', '🔍 QR检测已自动启动')
            
            # 不自动启用草莓检测，由用户手动控制
            
            await self.broadcast_message('status_update', '🏥 诊断工作流已启用')
            await self.broadcast_detection_status()
        else:
            await self.send_error(websocket, "诊断工作流管理器未初始化")
    
    async def handle_stop_diagnosis_workflow(self, websocket, data):
        """禁用诊断工作流（保持其他检测状态不变）"""
        if self.diagnosis_manager:
            self.diagnosis_manager.enabled = False
            await self.broadcast_message('status_update', '🏥 诊断工作流已禁用')
            await self.broadcast_detection_status()
        else:
            await self.send_error(websocket, "诊断工作流管理器未初始化")
    
    async def handle_set_qr_cooldown(self, websocket, data):
        """设置QR扫描冷却时间"""
        if not self.qr_detector:
            await self.send_error(websocket, "QR检测器未初始化")
            return
        
        try:
            cooldown_seconds = data.get('cooldown_seconds')
            if cooldown_seconds is None:
                await self.send_error(websocket, "缺少cooldown_seconds参数")
                return
            
            cooldown_seconds = int(cooldown_seconds)
            if cooldown_seconds < 0:
                await self.send_error(websocket, "冷却时间不能为负数")
                return
            
            # 设置冷却时间
            if hasattr(self.qr_detector, 'set_cooldown'):
                self.qr_detector.set_cooldown(cooldown_seconds)
                await self.broadcast_message('qr_cooldown_updated', {
                    'cooldown_seconds': cooldown_seconds,
                    'message': f'QR扫描冷却时间已设置为 {cooldown_seconds} 秒'
                })
                print(f"✅ QR扫描冷却时间已设置为 {cooldown_seconds} 秒")
            else:
                await self.send_error(websocket, "当前QR检测器不支持冷却设置")
        except ValueError:
            await self.send_error(websocket, "cooldown_seconds必须是整数")
        except Exception as e:
            await self.send_error(websocket, f"设置冷却时间失败: {e}")
    
    async def handle_get_qr_cooldown_status(self, websocket, data):
        """获取QR扫描冷却状态"""
        if not self.qr_detector:
            await self.send_error(websocket, "QR检测器未初始化")
            return
        
        try:
            if hasattr(self.qr_detector, 'get_cooldown_status'):
                status = self.qr_detector.get_cooldown_status()
                await websocket.send(json.dumps({
                    'type': 'qr_cooldown_status',
                    'data': status
                }))
            else:
                await self.send_error(websocket, "当前QR检测器不支持冷却状态查询")
        except Exception as e:
            await self.send_error(websocket, f"获取冷却状态失败: {e}")
    
    async def handle_clear_qr_cooldowns(self, websocket, data):
        """清空所有QR扫描冷却记录"""
        if not self.qr_detector:
            await self.send_error(websocket, "QR检测器未初始化")
            return
        
        try:
            if hasattr(self.qr_detector, 'clear_cooldowns'):
                self.qr_detector.clear_cooldowns()
                await self.broadcast_message('qr_cooldowns_cleared', {
                    'message': '所有QR扫描冷却记录已清空'
                })
                print("✅ 所有QR扫描冷却记录已清空")
            else:
                await self.send_error(websocket, "当前QR检测器不支持清空冷却")
        except Exception as e:
            await self.send_error(websocket, f"清空冷却记录失败: {e}")
    
    async def handle_set_ai_config(self, websocket, data):
        """
        设置AI配置（从前端传递）
        
        消息格式:
        {
            "type": "set_ai_config",
            "data": {
                "provider": "openai",
                "model": "gpt-4-vision-preview",
                "api_key": "sk-...",
                "api_base": "https://api.openai.com/v1",
                "max_tokens": 2000,
                "temperature": 0.7
            }
        }
        """
        if not self.diagnosis_manager:
            await self.send_error(websocket, "诊断工作流管理器未初始化")
            return
        
        try:
            # 验证必需字段
            required_fields = ['provider', 'model', 'api_key']
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                await self.send_error(websocket, f"缺少必需字段: {', '.join(missing_fields)}")
                return
            
            # 设置AI配置
            self.diagnosis_manager.set_ai_config(data)
            
            # 广播配置成功消息
            await self.broadcast_message('ai_config_updated', {
                'provider': data.get('provider'),
                'model': data.get('model'),
                'message': f"AI配置已更新: {data.get('provider')}/{data.get('model')}"
            })
            
            print(f"✅ AI配置已更新: {data.get('provider')}/{data.get('model')}")
            
        except ValueError as e:
            await self.send_error(websocket, f"配置验证失败: {str(e)}")
        except Exception as e:
            await self.send_error(websocket, f"设置AI配置失败: {str(e)}")
            import traceback
            traceback.print_exc()
    
    async def handle_get_ai_config_status(self, websocket, data):
        """
        获取AI配置状态
        
        返回当前AI配置的状态信息
        """
        if not self.diagnosis_manager:
            await self.send_error(websocket, "诊断工作流管理器未初始化")
            return
        
        try:
            status = self.diagnosis_manager.get_service_status()
            
            await websocket.send(json.dumps({
                'type': 'ai_config_status',
                'data': status
            }))
            
        except Exception as e:
            await self.send_error(websocket, f"获取AI配置状态失败: {str(e)}")
    
    async def broadcast_detection_status(self):
        """广播当前检测状态到前端"""
        status = {
            'qr_enabled': self.qr_detection_enabled,
            'strawberry_enabled': self.strawberry_detection_enabled,
            'diagnosis_workflow_enabled': self.diagnosis_manager.enabled if self.diagnosis_manager else False
        }
        await self.broadcast_message('detection_status', status)

    async def handle_manual_control(self, websocket, data):
        if self.drone_adapter and self.drone_state['flying']:
            self.drone_adapter.manual_control(data.get('left_right',0), data.get('forward_backward',0), data.get('up_down',0), data.get('yaw',0))

    async def handle_challenge_cruise_start(self, websocket, data):
        """
        启动挑战卡巡航任务（使用MissionController）
        
        消息格式:
        {
            "type": "challenge_cruise_start",
            "data": {
                "rounds": 3,
                "height": 100,
                "stayDuration": 5
            }
        }
        """
        if not self.mission_controller:
            await self.send_error(websocket, "任务控制器未初始化")
            return
        
        if not self.drone:
            await self.send_error(websocket, "无人机未连接")
            return
        
        if not self.drone_state.get('connected', False):
            await self.send_error(websocket, "无人机未连接")
            return
        
        if self.mission_controller.is_mission_running:
            await self.send_error(websocket, "任务已在运行中")
            return
        
        try:
            # 获取参数
            rounds = data.get('rounds', 3)
            height = data.get('height', 100)
            stay_duration = data.get('stayDuration', 5)
            
            print(f"🚁 启动挑战卡巡航任务: 轮次={rounds}, 高度={height}cm, 停留={stay_duration}s")
            
            # 设置任务参数
            self.mission_controller.set_mission_rounds(rounds)
            self.mission_controller.set_mission_height(height)
            self.mission_controller.set_stay_duration(stay_duration)
            
            # 更新任务状态
            self.drone_state['challenge_cruise_active'] = True
            await self.broadcast_message('mission_status', {
                'status': 'challenge_cruise_started',
                'rounds': rounds,
                'height': height,
                'stay_duration': stay_duration
            })
            
            # 启动任务（在单独的线程中执行）
            success = self.mission_controller.start_mission()
            
            if not success:
                self.drone_state['challenge_cruise_active'] = False
                await self.send_error(websocket, "任务启动失败")
                await self.broadcast_message('mission_status', {
                    'status': 'challenge_cruise_stopped'
                })
            
        except Exception as e:
            print(f"❌ 挑战卡巡航任务失败: {e}")
            traceback.print_exc()
            self.drone_state['challenge_cruise_active'] = False
            await self.broadcast_message('mission_status', {
                'status': 'challenge_cruise_stopped',
                'error': str(e)
            })
            await self.send_error(websocket, f"任务执行失败: {e}")

    async def handle_challenge_cruise_stop(self, websocket, data):
        """停止挑战卡巡航任务"""
        if not self.mission_controller:
            await self.send_error(websocket, "任务控制器未初始化")
            return
        
        print("🛑 停止挑战卡巡航任务")
        
        # 停止任务
        self.mission_controller.stop_mission_execution()
        
        # 更新状态
        self.drone_state['challenge_cruise_active'] = False
        await self.broadcast_message('mission_status', {
            'status': 'challenge_cruise_stopped'
        })

    async def handle_drone_command(self, websocket, data):
        """
        处理来自Tello智能代理的无人机命令
        
        消息格式:
        {
            "type": "drone_command",
            "data": {
                "action": "takeoff",
                "parameters": {}
            }
        }
        """
        if not self.drone:
            await self.send_error(websocket, "无人机未连接")
            return
        
        if not self.drone_state.get('connected', False):
            await self.send_error(websocket, "无人机未连接")
            return
        
        action = data.get('action')
        parameters = data.get('parameters', {})
        
        if not action:
            await self.send_error(websocket, "缺少action参数")
            return
        
        print(f"🎮 执行无人机命令: {action}, 参数: {parameters}")
        
        try:
            result = {'success': False, 'action': action}
            
            # 基础飞行命令
            if action == 'takeoff':
                # 立即发送响应，不等待命令完成
                result['success'] = True
                result['message'] = '起飞命令已发送'
                print("📤 起飞命令已发送")
                
                # 异步执行起飞命令
                async def do_takeoff():
                    try:
                        if self.drone_adapter and self.drone_adapter.takeoff():
                            self.drone_state['flying'] = True
                            print("✅ 起飞命令已完成")
                            await self.broadcast_drone_status()
                    except Exception as e:
                        print(f"❌ 起飞执行失败: {e}")
                
                asyncio.create_task(do_takeoff())
            
            elif action == 'land':
                # 立即发送响应，不等待命令完成
                result['success'] = True
                result['message'] = '降落命令已发送'
                print("📤 降落命令已发送")
                
                # 异步执行降落命令
                async def do_land():
                    try:
                        if self.drone_adapter and self.drone_adapter.land():
                            self.drone_state['flying'] = False
                            print("✅ 降落命令已完成")
                            await self.broadcast_drone_status()
                    except Exception as e:
                        print(f"❌ 降落执行失败: {e}")
                
                asyncio.create_task(do_land())
            
            elif action == 'emergency':
                if self.drone:
                    self.drone.emergency()
                    self.drone_state['flying'] = False
                    result['success'] = True
                    result['message'] = '紧急停止'
                    await self.broadcast_drone_status()
            
            elif action == 'get_battery':
                if self.drone:
                    battery = self.drone.get_battery()
                    self.drone_state['battery'] = battery
                    result['success'] = True
                    result['message'] = f'电量: {battery}%'
                    result['battery'] = battery
                    await self.broadcast_drone_status()
            
            # 移动命令
            elif action in ['move_forward', 'move_back', 'move_left', 'move_right', 'move_up', 'move_down']:
                if not self.drone_state.get('flying', False):
                    result['message'] = '无人机未在飞行状态'
                else:
                    distance = parameters.get('distance', 30)
                    # 立即发送响应
                    result['success'] = True
                    result['message'] = f'{action} {distance}cm 命令已发送'
                    print(f"📤 {action} {distance}cm 命令已发送")
                    
                    # 异步执行移动命令
                    async def do_move():
                        try:
                            if self.drone:
                                if action == 'move_forward':
                                    self.drone.move_forward(int(distance))
                                elif action == 'move_back':
                                    self.drone.move_back(int(distance))
                                elif action == 'move_left':
                                    self.drone.move_left(int(distance))
                                elif action == 'move_right':
                                    self.drone.move_right(int(distance))
                                elif action == 'move_up':
                                    self.drone.move_up(int(distance))
                                elif action == 'move_down':
                                    self.drone.move_down(int(distance))
                                print(f"✅ {action} {distance}cm 执行完成")
                        except Exception as e:
                            print(f"❌ {action} 执行失败: {e}")
                    
                    asyncio.create_task(do_move())
            
            # 旋转命令
            elif action in ['rotate_clockwise', 'rotate_counter_clockwise']:
                if not self.drone_state.get('flying', False):
                    result['message'] = '无人机未在飞行状态'
                else:
                    degrees = parameters.get('degrees', 90)
                    # 立即发送响应
                    result['success'] = True
                    result['message'] = f'{action} {degrees}度 命令已发送'
                    print(f"📤 {action} {degrees}度 命令已发送")
                    
                    # 异步执行旋转命令
                    async def do_rotate():
                        try:
                            if self.drone:
                                if action == 'rotate_clockwise':
                                    self.drone.rotate_clockwise(int(degrees))
                                else:
                                    self.drone.rotate_counter_clockwise(int(degrees))
                                print(f"✅ {action} {degrees}度 执行完成")
                        except Exception as e:
                            print(f"❌ {action} 执行失败: {e}")
                    
                    asyncio.create_task(do_rotate())
            
            else:
                result['message'] = f'未知命令: {action}'
            
            # 发送响应
            await websocket.send(json.dumps({
                'type': 'drone_command_response',
                'data': result
            }))
            
            if result['success']:
                print(f"✅ 命令执行成功: {action}")
            else:
                print(f"❌ 命令执行失败: {action} - {result.get('message', '')}")
        
        except Exception as e:
            print(f"❌ 执行命令异常: {action} - {e}")
            traceback.print_exc()
            await websocket.send(json.dumps({
                'type': 'drone_command_response',
                'data': {
                    'success': False,
                    'action': action,
                    'message': f'命令执行异常: {str(e)}'
                }
            }))

    async def _execute_diagnosis_async(self, plant_id: int, frame: np.ndarray):
        """
        异步执行完整的三阶段诊断流程
        
        Args:
            plant_id: 植株ID
            frame: 图像帧（BGR格式）
        """
        try:
            # 设置进度回调
            def progress_callback(pid, stage, message, progress):
                """进度回调函数，广播进度消息"""
                if self.main_loop and not self.main_loop.is_closed():
                    asyncio.run_coroutine_threadsafe(
                        self.broadcast_message('diagnosis_progress', {
                            'plant_id': pid,
                            'stage': stage,
                            'message': message,
                            'progress': progress
                        }),
                        self.main_loop
                    )
            
            # 设置回调
            self.diagnosis_manager.set_progress_callback(progress_callback)
            
            # 执行诊断
            report = await self.diagnosis_manager.execute_diagnosis(plant_id, frame)
            
            if report:
                # 清理markdown中的图片引用（避免渲染问题）
                clean_markdown = self._remove_images_from_markdown(report.markdown_report)
                
                # 诊断成功，广播完整报告
                await self.broadcast_message('diagnosis_complete', {
                    'plant_id': report.plant_id,
                    'diagnosis_id': report.id,
                    'report': {
                        'id': report.id,
                        'plant_id': report.plant_id,
                        'timestamp': report.timestamp,
                        'original_image': report.original_image,
                        'mask_image': report.mask_image,
                        'mask_prompt': report.mask_prompt,
                        'markdown_report': clean_markdown,
                        'summary': report.summary,
                        'severity': report.severity,
                        'diseases': report.diseases,
                        'recommendations': report.recommendations,
                        'ai_model': report.ai_model,
                        'confidence': report.confidence,
                        'processing_time': report.processing_time
                    }
                })
                print(f"✅ 植株 {plant_id} 诊断完成")
            else:
                # 诊断失败
                await self.broadcast_message('diagnosis_error', {
                    'plant_id': plant_id,
                    'error_type': 'diagnosis_failed',
                    'message': '诊断流程执行失败'
                })
                print(f"❌ 植株 {plant_id} 诊断失败")
                
        except Exception as e:
            # 发送错误消息
            await self.broadcast_message('diagnosis_error', {
                'plant_id': plant_id,
                'error_type': 'exception',
                'message': f'诊断异常: {str(e)}'
            })
            print(f"❌ 植株 {plant_id} 诊断异常: {e}")
            traceback.print_exc()
    
    def _remove_images_from_markdown(self, markdown_text: str) -> str:
        """
        从Markdown文本中移除图片引用
        
        Args:
            markdown_text: 原始Markdown文本
            
        Returns:
            清理后的Markdown文本（不包含图片）
        """
        import re
        
        # 移除Markdown图片语法: ![alt](url)
        markdown_text = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', '', markdown_text)
        
        # 移除HTML img标签: <img src="..." />
        markdown_text = re.sub(r'<img[^>]+>', '', markdown_text)
        
        # 移除base64图片数据URL引用
        markdown_text = re.sub(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+', '', markdown_text)
        
        # 清理多余的空行（连续3个以上换行符替换为2个）
        markdown_text = re.sub(r'\n{3,}', '\n\n', markdown_text)
        
        return markdown_text.strip()
    
    def _check_ai_model_config(self):
        """
        检查AI模型配置是否有效
        
        Returns:
            tuple: (is_valid: bool, error_info: dict)
        """
        if not self.diagnosis_manager:
            return False, {
                'type': 'no_diagnosis_manager',
                'message': '诊断工作流管理器未初始化'
            }
        
        # 检查是否配置了AI模型
        if not self.diagnosis_manager.is_configured():
            return False, {
                'type': 'no_model',
                'message': '未配置AI模型，请先配置AI模型'
            }
        
        # 检查模型是否支持视觉
        try:
            if not self.diagnosis_manager.ai_config_manager.validate_vision_support():
                return False, {
                    'type': 'no_vision',
                    'message': '当前模型不支持视觉功能，请配置支持视觉的模型'
                }
        except Exception as e:
            return False, {
                'type': 'config_error',
                'message': f'配置验证失败: {str(e)}'
            }
        
        # 配置有效
        return True, None

    async def broadcast_message(self, msg_type, data=None):
        if not self.connected_clients: return
        payload = {'type': msg_type, 'data': data}
        if msg_type not in ['drone_status', 'video_frame']:
            payload['timestamp'] = datetime.now().isoformat()
        message = json.dumps(payload, ensure_ascii=False)
        tasks = [client.send(message) for client in self.connected_clients]
        await asyncio.gather(*tasks, return_exceptions=True)

    async def send_error(self, websocket, error_message):
        await websocket.send(json.dumps({'type': 'error', 'data': {'message': error_message}}))

    async def broadcast_drone_status(self):
        if self.drone and self.drone_state['connected']:
            try: self.drone_state['battery'] = self.drone.get_battery()
            except: pass
        await self.broadcast_message('drone_status', self.drone_state)

    def cleanup(self):
        print("🧹 清理资源...")
        self.is_running = False
        self.stop_streaming_thread()
        if self.drone:
            try: self.drone.end()
            except: pass
        print("👋 服务已停止")

async def main():
    parser = argparse.ArgumentParser(description='无人机后端服务 (V4)')
    parser.add_argument('--ws-port', type=int, default=3002, help='WebSocket服务端口')
    args = parser.parse_args()
    backend = DroneBackendService(ws_port=args.ws_port)
    try:
        server = await backend.start_websocket_server()
        if server: await server.wait_closed()
    except KeyboardInterrupt: print("\n⏹️ 收到停止信号...")
    finally: backend.cleanup()

if __name__ == "__main__":
    try: asyncio.run(main())
    except KeyboardInterrupt: print("\n服务被用户中断")