#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
桥接客户端 (Bridge Client)
实现3004端口智能代理后端与3002端口无人机控制后端之间的通信
"""

import asyncio
import aiohttp
import json
import logging
import time
import traceback
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass
from enum import Enum


# 配置日志
logger = logging.getLogger(__name__)


class ConnectionState(Enum):
    """连接状态枚举"""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    RECONNECTING = "reconnecting"
    ERROR = "error"


@dataclass
class BridgeConfig:
    """桥接配置"""
    drone_backend_host: str = "localhost"
    drone_backend_port: int = 3002
    
    # 连接重试配置
    max_reconnect_attempts: int = 5
    reconnect_delay: float = 2.0  # 初始重试延迟（秒）
    reconnect_backoff: float = 1.5  # 指数退避因子
    max_reconnect_delay: float = 30.0  # 最大重试延迟
    
    # 超时配置
    connection_timeout: float = 10.0  # 连接超时
    request_timeout: float = 30.0  # 请求超时
    health_check_interval: float = 30.0  # 健康检查间隔
    
    # WebSocket配置
    ws_heartbeat_interval: float = 30.0  # WebSocket心跳间隔


class BridgeClient:
    """
    桥接客户端类
    负责与3002端口无人机控制后端通信
    """
    
    def __init__(self, config: Optional[BridgeConfig] = None):
        """
        初始化桥接客户端
        
        Args:
            config: 桥接配置，如果为None则使用默认配置
        """
        self.config = config or BridgeConfig()
        self.state = ConnectionState.DISCONNECTED
        
        # HTTP会话
        self.session: Optional[aiohttp.ClientSession] = None
        
        # WebSocket连接
        self.ws: Optional[aiohttp.ClientWebSocketResponse] = None
        self.ws_task: Optional[asyncio.Task] = None
        
        # 健康检查任务
        self.health_check_task: Optional[asyncio.Task] = None
        
        # 状态回调
        self.status_callback: Optional[Callable] = None
        
        # 连接统计
        self.connection_attempts = 0
        self.last_connection_time: Optional[float] = None
        self.last_health_check_time: Optional[float] = None
        
        # 构建基础URL
        self.base_url = f"http://{self.config.drone_backend_host}:{self.config.drone_backend_port}"
        self.ws_url = f"ws://{self.config.drone_backend_host}:{self.config.drone_backend_port}/ws"
        
        logger.info(f"桥接客户端已初始化: {self.base_url}")
    
    async def __aenter__(self):
        """异步上下文管理器入口"""
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口"""
        await self.disconnect()
    
    async def connect(self) -> bool:
        """
        连接到无人机控制后端
        
        Returns:
            bool: 连接是否成功
        """
        if self.state == ConnectionState.CONNECTED:
            logger.warning("已经连接到无人机控制后端")
            return True
        
        self.state = ConnectionState.CONNECTING
        logger.info("正在连接到无人机控制后端...")
        
        try:
            # 创建HTTP会话
            timeout = aiohttp.ClientTimeout(
                total=self.config.connection_timeout,
                connect=self.config.connection_timeout
            )
            self.session = aiohttp.ClientSession(timeout=timeout)
            
            # 执行健康检查以验证连接
            health_ok = await self.health_check()
            
            if health_ok:
                self.state = ConnectionState.CONNECTED
                self.last_connection_time = time.time()
                self.connection_attempts = 0
                
                # 启动健康检查任务
                self.health_check_task = asyncio.create_task(self._health_check_loop())
                
                logger.info("✅ 成功连接到无人机控制后端")
                return True
            else:
                self.state = ConnectionState.ERROR
                logger.error("❌ 无人机控制后端健康检查失败")
                await self._cleanup_session()
                return False
                
        except Exception as e:
            self.state = ConnectionState.ERROR
            logger.error(f"❌ 连接到无人机控制后端失败: {e}")
            await self._cleanup_session()
            return False
    
    async def disconnect(self):
        """断开与无人机控制后端的连接"""
        logger.info("正在断开与无人机控制后端的连接...")
        
        # 取消健康检查任务
        if self.health_check_task and not self.health_check_task.done():
            self.health_check_task.cancel()
            try:
                await self.health_check_task
            except asyncio.CancelledError:
                pass
        
        # 关闭WebSocket连接
        await self._close_websocket()
        
        # 关闭HTTP会话
        await self._cleanup_session()
        
        self.state = ConnectionState.DISCONNECTED
        logger.info("已断开与无人机控制后端的连接")
    
    async def _cleanup_session(self):
        """清理HTTP会话"""
        if self.session and not self.session.closed:
            await self.session.close()
            self.session = None
    
    async def _close_websocket(self):
        """关闭WebSocket连接"""
        if self.ws_task and not self.ws_task.done():
            self.ws_task.cancel()
            try:
                await self.ws_task
            except asyncio.CancelledError:
                pass
        
        if self.ws and not self.ws.closed:
            await self.ws.close()
            self.ws = None
    
    async def reconnect(self) -> bool:
        """
        重新连接到无人机控制后端（带指数退避）
        
        Returns:
            bool: 重连是否成功
        """
        self.state = ConnectionState.RECONNECTING
        logger.info("开始重新连接...")
        
        for attempt in range(self.config.max_reconnect_attempts):
            self.connection_attempts = attempt + 1
            
            # 计算退避延迟
            delay = min(
                self.config.reconnect_delay * (self.config.reconnect_backoff ** attempt),
                self.config.max_reconnect_delay
            )
            
            logger.info(f"重连尝试 {attempt + 1}/{self.config.max_reconnect_attempts}，等待 {delay:.1f}秒...")
            await asyncio.sleep(delay)
            
            # 尝试连接
            if await self.connect():
                logger.info(f"✅ 重连成功（尝试 {attempt + 1}次）")
                return True
            
            logger.warning(f"❌ 重连失败（尝试 {attempt + 1}次）")
        
        logger.error(f"❌ 重连失败，已达到最大尝试次数 ({self.config.max_reconnect_attempts})")
        self.state = ConnectionState.ERROR
        return False
    
    async def health_check(self) -> bool:
        """
        执行健康检查
        
        Returns:
            bool: 后端是否健康
        """
        try:
            if not self.session:
                return False
            
            # 尝试获取无人机状态作为健康检查
            async with self.session.get(
                f"{self.base_url}/api/drone/status",
                timeout=aiohttp.ClientTimeout(total=5.0)
            ) as response:
                if response.status == 200:
                    self.last_health_check_time = time.time()
                    logger.debug("✅ 健康检查通过")
                    return True
                else:
                    logger.warning(f"⚠️ 健康检查失败: HTTP {response.status}")
                    return False
                    
        except asyncio.TimeoutError:
            logger.warning("⚠️ 健康检查超时")
            return False
        except Exception as e:
            logger.warning(f"⚠️ 健康检查失败: {e}")
            return False
    
    async def _health_check_loop(self):
        """健康检查循环"""
        try:
            while self.state == ConnectionState.CONNECTED:
                await asyncio.sleep(self.config.health_check_interval)
                
                if not await self.health_check():
                    logger.error("健康检查失败，尝试重新连接...")
                    await self.reconnect()
                    
        except asyncio.CancelledError:
            logger.debug("健康检查循环已取消")
        except Exception as e:
            logger.error(f"健康检查循环错误: {e}")
    
    async def execute_command(self, command_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        发送命令到无人机控制后端执行
        
        Args:
            command_data: 命令数据，包含action和parameters
        
        Returns:
            执行结果字典
        """
        if self.state != ConnectionState.CONNECTED:
            return {
                "success": False,
                "error": "未连接到无人机控制后端"
            }
        
        try:
            if not self.session:
                return {
                    "success": False,
                    "error": "HTTP会话未初始化"
                }
            
            logger.info(f"发送命令到无人机控制后端: {command_data.get('action')}")
            
            async with self.session.post(
                f"{self.base_url}/api/drone/execute",
                json=command_data,
                timeout=aiohttp.ClientTimeout(total=self.config.request_timeout)
            ) as response:
                result = await response.json()
                
                if response.status == 200:
                    logger.info(f"✅ 命令执行成功: {command_data.get('action')}")
                    return result
                else:
                    logger.error(f"❌ 命令执行失败: HTTP {response.status}")
                    return {
                        "success": False,
                        "error": f"HTTP {response.status}: {result.get('error', 'Unknown error')}"
                    }
                    
        except asyncio.TimeoutError:
            logger.error(f"❌ 命令执行超时: {command_data.get('action')}")
            return {
                "success": False,
                "error": "命令执行超时"
            }
        except Exception as e:
            logger.error(f"❌ 命令执行失败: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_drone_status(self) -> Dict[str, Any]:
        """
        获取无人机状态
        
        Returns:
            状态字典
        """
        if self.state != ConnectionState.CONNECTED:
            return {
                "success": False,
                "error": "未连接到无人机控制后端",
                "connected": False
            }
        
        try:
            if not self.session:
                return {
                    "success": False,
                    "error": "HTTP会话未初始化",
                    "connected": False
                }
            
            async with self.session.get(
                f"{self.base_url}/api/drone/status",
                timeout=aiohttp.ClientTimeout(total=5.0)
            ) as response:
                if response.status == 200:
                    status = await response.json()
                    logger.debug("✅ 获取无人机状态成功")
                    return {
                        "success": True,
                        **status
                    }
                else:
                    logger.error(f"❌ 获取无人机状态失败: HTTP {response.status}")
                    return {
                        "success": False,
                        "error": f"HTTP {response.status}",
                        "connected": False
                    }
                    
        except asyncio.TimeoutError:
            logger.error("❌ 获取无人机状态超时")
            return {
                "success": False,
                "error": "获取状态超时",
                "connected": False
            }
        except Exception as e:
            logger.error(f"❌ 获取无人机状态失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "connected": False
            }
    
    async def subscribe_status_updates(self, callback: Callable[[Dict[str, Any]], None]):
        """
        订阅无人机状态更新（通过WebSocket）
        
        Args:
            callback: 状态更新回调函数
        """
        if self.state != ConnectionState.CONNECTED:
            logger.error("未连接到无人机控制后端，无法订阅状态更新")
            return
        
        self.status_callback = callback
        
        # 启动WebSocket连接任务
        self.ws_task = asyncio.create_task(self._websocket_status_loop())
        logger.info("已启动WebSocket状态订阅")
    
    async def _websocket_status_loop(self):
        """
        WebSocket状态订阅循环
        支持自动重连和消息验证
        """
        reconnect_attempts = 0
        max_reconnect_attempts = self.config.max_reconnect_attempts
        
        while reconnect_attempts < max_reconnect_attempts:
            try:
                if not self.session:
                    logger.error("HTTP会话未初始化，无法建立WebSocket连接")
                    return
                
                logger.info(f"正在连接到WebSocket: {self.ws_url} (尝试 {reconnect_attempts + 1}/{max_reconnect_attempts})")
                
                async with self.session.ws_connect(
                    self.ws_url,
                    heartbeat=self.config.ws_heartbeat_interval,
                    timeout=aiohttp.ClientTimeout(total=self.config.connection_timeout)
                ) as ws:
                    self.ws = ws
                    logger.info("✅ WebSocket连接已建立")
                    
                    # 重置重连计数
                    reconnect_attempts = 0
                    
                    # 发送订阅消息
                    await ws.send_json({
                        "type": "subscribe",
                        "channel": "status_updates"
                    })
                    logger.info("已发送状态订阅请求")
                    
                    # 心跳任务
                    async def send_heartbeat():
                        """发送心跳保持连接活跃"""
                        try:
                            while not ws.closed:
                                await asyncio.sleep(self.config.ws_heartbeat_interval)
                                if not ws.closed:
                                    await ws.send_json({
                                        "type": "ping",
                                        "timestamp": time.time()
                                    })
                                    logger.debug("发送WebSocket心跳")
                        except asyncio.CancelledError:
                            logger.debug("心跳任务已取消")
                        except Exception as e:
                            logger.error(f"WebSocket心跳错误: {e}")
                    
                    heartbeat_task = asyncio.create_task(send_heartbeat())
                    
                    try:
                        # 接收消息循环
                        async for msg in ws:
                            if msg.type == aiohttp.WSMsgType.TEXT:
                                try:
                                    # 解析消息
                                    data = json.loads(msg.data)
                                    
                                    # 验证消息格式
                                    if not self._validate_status_message(data):
                                        logger.warning(f"收到无效的状态消息: {data}")
                                        continue
                                    
                                    # 处理不同类型的消息
                                    msg_type = data.get("type")
                                    
                                    if msg_type == "status_update":
                                        # 状态更新消息
                                        status_data = data.get("data", {})
                                        logger.debug(f"收到状态更新: {status_data}")
                                        
                                        # 调用状态回调
                                        if self.status_callback:
                                            if asyncio.iscoroutinefunction(self.status_callback):
                                                await self.status_callback(status_data)
                                            else:
                                                self.status_callback(status_data)
                                    
                                    elif msg_type == "pong":
                                        # 心跳响应
                                        logger.debug("收到心跳响应")
                                    
                                    elif msg_type == "error":
                                        # 错误消息
                                        error_msg = data.get("message", "Unknown error")
                                        logger.error(f"WebSocket错误消息: {error_msg}")
                                    
                                    elif msg_type == "connection_established":
                                        # 连接确认
                                        logger.info("WebSocket连接已确认")
                                    
                                    else:
                                        logger.debug(f"收到未知消息类型: {msg_type}")
                                        
                                except json.JSONDecodeError as e:
                                    logger.error(f"WebSocket消息JSON解析失败: {e}")
                                    logger.error(f"原始消息: {msg.data}")
                                except Exception as e:
                                    logger.error(f"处理WebSocket消息失败: {e}")
                                    
                            elif msg.type == aiohttp.WSMsgType.BINARY:
                                logger.warning("收到二进制消息，跳过")
                                
                            elif msg.type == aiohttp.WSMsgType.ERROR:
                                logger.error(f"WebSocket错误: {ws.exception()}")
                                break
                            
                            elif msg.type == aiohttp.WSMsgType.CLOSED:
                                logger.info("WebSocket连接已关闭")
                                break
                            
                            elif msg.type == aiohttp.WSMsgType.CLOSING:
                                logger.info("WebSocket连接正在关闭")
                                break
                                
                    finally:
                        # 取消心跳任务
                        heartbeat_task.cancel()
                        try:
                            await heartbeat_task
                        except asyncio.CancelledError:
                            pass
                        
                        logger.info("WebSocket消息循环已结束")
                        
            except asyncio.CancelledError:
                logger.info("WebSocket状态订阅已取消")
                break
            
            except aiohttp.ClientError as e:
                logger.error(f"WebSocket连接错误: {e}")
                reconnect_attempts += 1
                
                if reconnect_attempts < max_reconnect_attempts:
                    # 计算退避延迟
                    delay = min(
                        self.config.reconnect_delay * (self.config.reconnect_backoff ** reconnect_attempts),
                        self.config.max_reconnect_delay
                    )
                    logger.info(f"将在 {delay:.1f}秒 后重新连接WebSocket...")
                    await asyncio.sleep(delay)
                else:
                    logger.error(f"WebSocket重连失败，已达到最大尝试次数 ({max_reconnect_attempts})")
                    break
            
            except Exception as e:
                logger.error(f"WebSocket状态订阅错误: {e}")
                logger.error(f"错误详情: {traceback.format_exc()}")
                reconnect_attempts += 1
                
                if reconnect_attempts < max_reconnect_attempts:
                    delay = min(
                        self.config.reconnect_delay * (self.config.reconnect_backoff ** reconnect_attempts),
                        self.config.max_reconnect_delay
                    )
                    logger.info(f"将在 {delay:.1f}秒 后重新连接WebSocket...")
                    await asyncio.sleep(delay)
                else:
                    logger.error(f"WebSocket重连失败，已达到最大尝试次数 ({max_reconnect_attempts})")
                    break
        
        # 清理
        self.ws = None
        logger.info("WebSocket连接已完全关闭")
    
    def _validate_status_message(self, data: Dict[str, Any]) -> bool:
        """
        验证状态消息格式
        
        Args:
            data: 消息数据
        
        Returns:
            bool: 消息是否有效
        """
        try:
            # 检查必需字段
            if not isinstance(data, dict):
                logger.warning("消息不是字典类型")
                return False
            
            if "type" not in data:
                logger.warning("消息缺少type字段")
                return False
            
            msg_type = data.get("type")
            
            # 验证不同类型消息的格式
            if msg_type == "status_update":
                # 状态更新消息必须有data字段
                if "data" not in data:
                    logger.warning("status_update消息缺少data字段")
                    return False
                
                status_data = data.get("data")
                if not isinstance(status_data, dict):
                    logger.warning("status_update的data字段不是字典类型")
                    return False
            
            elif msg_type == "error":
                # 错误消息应该有message字段
                if "message" not in data:
                    logger.warning("error消息缺少message字段")
                    return False
            
            # 其他消息类型默认有效
            return True
            
        except Exception as e:
            logger.error(f"验证消息格式时出错: {e}")
            return False
    
    def get_connection_info(self) -> Dict[str, Any]:
        """
        获取连接信息
        
        Returns:
            连接信息字典
        """
        return {
            "state": self.state.value,
            "base_url": self.base_url,
            "ws_url": self.ws_url,
            "connected": self.state == ConnectionState.CONNECTED,
            "connection_attempts": self.connection_attempts,
            "last_connection_time": self.last_connection_time,
            "last_health_check_time": self.last_health_check_time,
            "session_active": self.session is not None and not self.session.closed,
            "websocket_active": self.ws is not None and not self.ws.closed
        }


# 使用示例
async def main():
    """测试桥接客户端"""
    # 创建配置
    config = BridgeConfig(
        drone_backend_host="localhost",
        drone_backend_port=3002,
        max_reconnect_attempts=3,
        reconnect_delay=2.0
    )
    
    # 创建桥接客户端
    async with BridgeClient(config) as bridge:
        # 获取无人机状态
        status = await bridge.get_drone_status()
        print(f"无人机状态: {status}")
        
        # 执行命令
        result = await bridge.execute_command({
            "action": "get_battery",
            "parameters": {}
        })
        print(f"命令执行结果: {result}")
        
        # 订阅状态更新
        async def status_callback(status_data):
            print(f"状态更新: {status_data}")
        
        await bridge.subscribe_status_updates(status_callback)
        
        # 保持运行一段时间
        await asyncio.sleep(60)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    asyncio.run(main())
