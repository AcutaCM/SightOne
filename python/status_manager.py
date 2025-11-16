#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
状态管理器 (Status Manager)
负责管理和同步无人机状态，支持状态变化检测和定时同步
集成状态缓存优化功能
"""

import asyncio
import time
import logging
from typing import Dict, Any, Optional, Set, Callable, List
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum

# 导入状态缓存模块
try:
    from status_cache import StatusCache, CacheStrategy
    STATUS_CACHE_AVAILABLE = True
except ImportError:
    STATUS_CACHE_AVAILABLE = False
    StatusCache = None
    CacheStrategy = None


logger = logging.getLogger(__name__)


class StatusChangeType(Enum):
    """状态变化类型"""
    CONNECTION = "connection"
    BATTERY = "battery"
    FLYING = "flying"
    POSITION = "position"
    TEMPERATURE = "temperature"
    HEIGHT = "height"
    WIFI_SIGNAL = "wifi_signal"


@dataclass
class DroneStatusData:
    """无人机状态数据"""
    connected: bool = False
    flying: bool = False
    battery: int = 0
    temperature: int = 0
    height: int = 0
    speed: Dict[str, float] = field(default_factory=lambda: {"x": 0, "y": 0, "z": 0})
    position: Dict[str, float] = field(default_factory=lambda: {"x": 0, "y": 0, "z": 0})
    wifi_signal: int = 0
    flight_time: int = 0
    timestamp: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = asdict(self)
        data['timestamp'] = datetime.fromtimestamp(self.timestamp).isoformat()
        return data
    
    def __eq__(self, other) -> bool:
        """比较两个状态是否相等（忽略timestamp）"""
        if not isinstance(other, DroneStatusData):
            return False
        
        return (
            self.connected == other.connected and
            self.flying == other.flying and
            self.battery == other.battery and
            self.temperature == other.temperature and
            self.height == other.height and
            self.speed == other.speed and
            self.position == other.position and
            self.wifi_signal == other.wifi_signal and
            self.flight_time == other.flight_time
        )


@dataclass
class BridgeStatusData:
    """桥接状态数据"""
    connected_to_drone_backend: bool = False
    ai_configured: bool = False
    last_sync: float = 0
    sync_count: int = 0
    error_count: int = 0
    last_error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = asdict(self)
        data['last_sync'] = datetime.fromtimestamp(self.last_sync).isoformat() if self.last_sync > 0 else None
        return data


class StatusManager:
    """
    状态管理器
    负责管理无人机状态、桥接状态，并提供状态同步和变化检测功能
    """
    
    def __init__(
        self,
        sync_interval: float = 1.0,
        change_threshold: Dict[str, Any] = None,
        enable_cache: bool = True,
        cache_config: Optional[Dict[str, Any]] = None
    ):
        """
        初始化状态管理器
        
        Args:
            sync_interval: 状态同步间隔（秒）
            change_threshold: 状态变化阈值配置
            enable_cache: 是否启用状态缓存优化
            cache_config: 缓存配置字典
        """
        self.sync_interval = sync_interval
        
        # 状态变化阈值
        self.change_threshold = change_threshold or {
            'battery': 5,  # 电池变化超过5%才通知
            'temperature': 2,  # 温度变化超过2度才通知
            'height': 10,  # 高度变化超过10cm才通知
            'position': 5,  # 位置变化超过5cm才通知
        }
        
        # 当前状态
        self.current_drone_status = DroneStatusData()
        self.current_bridge_status = BridgeStatusData()
        
        # 上一次状态（用于变化检测）
        self.previous_drone_status = DroneStatusData()
        
        # 状态订阅者
        self.subscribers: Set[Callable] = set()
        
        # 同步任务
        self.sync_task: Optional[asyncio.Task] = None
        self.is_syncing = False
        
        # 统计信息
        self.total_updates = 0
        self.total_changes = 0
        
        # 状态缓存（新增）
        self.cache_enabled = enable_cache and STATUS_CACHE_AVAILABLE
        self.status_cache: Optional[StatusCache] = None
        
        if self.cache_enabled:
            # 解析缓存配置
            cache_config = cache_config or {}
            self.status_cache = StatusCache(
                max_history_size=cache_config.get('max_history_size', 100),
                cache_ttl=cache_config.get('cache_ttl', 60.0),
                min_broadcast_interval=cache_config.get('min_broadcast_interval', 0.1),
                cache_strategy=cache_config.get('cache_strategy', CacheStrategy.CACHE_ON_CHANGE)
            )
            
            # 同步差异阈值到缓存
            for field, threshold in self.change_threshold.items():
                self.status_cache.set_diff_threshold(field, threshold)
            
            logger.info(f"✅ 状态缓存已启用")
        else:
            if enable_cache and not STATUS_CACHE_AVAILABLE:
                logger.warning("⚠️ 状态缓存模块不可用")
            else:
                logger.info("ℹ️ 状态缓存未启用")
        
        logger.info(f"状态管理器已初始化，同步间隔: {sync_interval}秒")
    
    def update_drone_status(self, status_data: Dict[str, Any]) -> bool:
        """
        更新无人机状态
        
        Args:
            status_data: 状态数据字典
        
        Returns:
            bool: 状态是否发生变化
        """
        try:
            # 保存旧状态
            self.previous_drone_status = DroneStatusData(**asdict(self.current_drone_status))
            
            # 更新状态
            for key, value in status_data.items():
                if hasattr(self.current_drone_status, key):
                    setattr(self.current_drone_status, key, value)
            
            # 更新时间戳
            self.current_drone_status.timestamp = time.time()
            
            # 检测变化
            has_changes = self._detect_changes()
            
            self.total_updates += 1
            if has_changes:
                self.total_changes += 1
                logger.debug(f"无人机状态已更新（有变化）: {self._get_changed_fields()}")
            else:
                logger.debug("无人机状态已更新（无显著变化）")
            
            return has_changes
            
        except Exception as e:
            logger.error(f"更新无人机状态失败: {e}")
            return False
    
    def update_bridge_status(self, **kwargs) -> None:
        """
        更新桥接状态
        
        Args:
            **kwargs: 状态字段和值
        """
        try:
            for key, value in kwargs.items():
                if hasattr(self.current_bridge_status, key):
                    setattr(self.current_bridge_status, key, value)
            
            logger.debug(f"桥接状态已更新: {kwargs}")
            
        except Exception as e:
            logger.error(f"更新桥接状态失败: {e}")
    
    def update_ai_status(self, configured: bool) -> None:
        """
        更新AI配置状态
        
        Args:
            configured: AI是否已配置
        """
        self.current_bridge_status.ai_configured = configured
        logger.info(f"AI配置状态已更新: {configured}")
    
    def _detect_changes(self) -> bool:
        """
        检测状态变化
        
        Returns:
            bool: 是否有显著变化
        """
        current = self.current_drone_status
        previous = self.previous_drone_status
        
        # 连接状态变化
        if current.connected != previous.connected:
            return True
        
        # 飞行状态变化
        if current.flying != previous.flying:
            return True
        
        # 电池变化超过阈值
        if abs(current.battery - previous.battery) >= self.change_threshold['battery']:
            return True
        
        # 温度变化超过阈值
        if abs(current.temperature - previous.temperature) >= self.change_threshold['temperature']:
            return True
        
        # 高度变化超过阈值
        if abs(current.height - previous.height) >= self.change_threshold['height']:
            return True
        
        # 位置变化超过阈值
        pos_change = sum([
            abs(current.position.get(axis, 0) - previous.position.get(axis, 0))
            for axis in ['x', 'y', 'z']
        ])
        if pos_change >= self.change_threshold['position']:
            return True
        
        return False
    
    def _get_changed_fields(self) -> Dict[str, Any]:
        """
        获取发生变化的字段
        
        Returns:
            变化字段的字典
        """
        changes = {}
        current = self.current_drone_status
        previous = self.previous_drone_status
        
        if current.connected != previous.connected:
            changes['connected'] = {'old': previous.connected, 'new': current.connected}
        
        if current.flying != previous.flying:
            changes['flying'] = {'old': previous.flying, 'new': current.flying}
        
        if abs(current.battery - previous.battery) >= self.change_threshold['battery']:
            changes['battery'] = {'old': previous.battery, 'new': current.battery}
        
        if abs(current.temperature - previous.temperature) >= self.change_threshold['temperature']:
            changes['temperature'] = {'old': previous.temperature, 'new': current.temperature}
        
        if abs(current.height - previous.height) >= self.change_threshold['height']:
            changes['height'] = {'old': previous.height, 'new': current.height}
        
        return changes
    
    def get_current_status(self) -> Dict[str, Any]:
        """
        获取当前完整状态
        
        Returns:
            包含无人机状态和桥接状态的字典
        """
        return {
            'drone_status': self.current_drone_status.to_dict(),
            'bridge_status': self.current_bridge_status.to_dict(),
            'statistics': {
                'total_updates': self.total_updates,
                'total_changes': self.total_changes,
                'change_rate': self.total_changes / max(self.total_updates, 1)
            }
        }
    
    def get_drone_status(self) -> Dict[str, Any]:
        """
        获取无人机状态
        
        Returns:
            无人机状态字典
        """
        return self.current_drone_status.to_dict()
    
    def get_bridge_status(self) -> Dict[str, Any]:
        """
        获取桥接状态
        
        Returns:
            桥接状态字典
        """
        return self.current_bridge_status.to_dict()
    
    def subscribe(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """
        订阅状态更新
        
        Args:
            callback: 状态更新回调函数
        """
        self.subscribers.add(callback)
        logger.info(f"新增状态订阅者，当前订阅者数量: {len(self.subscribers)}")
    
    def unsubscribe(self, callback: Callable) -> None:
        """
        取消订阅状态更新
        
        Args:
            callback: 要取消的回调函数
        """
        self.subscribers.discard(callback)
        logger.info(f"移除状态订阅者，当前订阅者数量: {len(self.subscribers)}")
    
    async def broadcast_status(self, force: bool = False) -> None:
        """
        广播状态给所有订阅者（集成缓存优化）
        
        Args:
            force: 是否强制广播（忽略变化检测和缓存）
        """
        if not self.subscribers:
            return
        
        status = self.get_current_status()
        
        # 如果启用了缓存，使用缓存的广播决策
        if self.cache_enabled and self.status_cache and not force:
            should_broadcast, has_change = self.status_cache.update(status)
            
            if not should_broadcast:
                logger.debug("广播被缓存优化抑制")
                return
            
            logger.debug(f"缓存决策：广播（变化={has_change}）")
        elif not force:
            # 如果没有缓存，使用传统的变化检测
            if not self._detect_changes():
                return
        
        # 调用所有订阅者
        failed_subscribers = set()
        for subscriber in self.subscribers:
            try:
                if asyncio.iscoroutinefunction(subscriber):
                    await subscriber(status)
                else:
                    subscriber(status)
            except Exception as e:
                logger.error(f"广播状态到订阅者失败: {e}")
                failed_subscribers.add(subscriber)
        
        # 移除失败的订阅者
        self.subscribers -= failed_subscribers
    
    async def start_sync(self, status_source: Callable) -> None:
        """
        启动定时状态同步
        
        Args:
            status_source: 状态源函数，返回状态数据字典
        """
        if self.is_syncing:
            logger.warning("状态同步已在运行")
            return
        
        self.is_syncing = True
        self.sync_task = asyncio.create_task(self._sync_loop(status_source))
        logger.info("状态同步已启动")
    
    async def stop_sync(self) -> None:
        """停止定时状态同步"""
        self.is_syncing = False
        
        if self.sync_task and not self.sync_task.done():
            self.sync_task.cancel()
            try:
                await self.sync_task
            except asyncio.CancelledError:
                pass
        
        logger.info("状态同步已停止")
    
    async def _sync_loop(self, status_source: Callable) -> None:
        """
        状态同步循环
        
        Args:
            status_source: 状态源函数
        """
        try:
            while self.is_syncing:
                try:
                    # 获取最新状态
                    if asyncio.iscoroutinefunction(status_source):
                        status_data = await status_source()
                    else:
                        status_data = status_source()
                    
                    if status_data and status_data.get('success'):
                        # 更新状态
                        has_changes = self.update_drone_status(status_data)
                        
                        # 更新桥接同步时间
                        self.current_bridge_status.last_sync = time.time()
                        self.current_bridge_status.sync_count += 1
                        
                        # 如果有变化，广播状态
                        if has_changes:
                            await self.broadcast_status()
                    else:
                        # 同步失败
                        error_msg = status_data.get('error', 'Unknown error') if status_data else 'No response'
                        self.current_bridge_status.error_count += 1
                        self.current_bridge_status.last_error = error_msg
                        logger.warning(f"状态同步失败: {error_msg}")
                    
                except Exception as e:
                    logger.error(f"状态同步错误: {e}")
                    self.current_bridge_status.error_count += 1
                    self.current_bridge_status.last_error = str(e)
                
                # 等待下一次同步
                await asyncio.sleep(self.sync_interval)
                
        except asyncio.CancelledError:
            logger.info("状态同步循环已取消")
        except Exception as e:
            logger.error(f"状态同步循环错误: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        获取统计信息（包含缓存统计）
        
        Returns:
            统计信息字典
        """
        stats = {
            'total_updates': self.total_updates,
            'total_changes': self.total_changes,
            'change_rate': self.total_changes / max(self.total_updates, 1),
            'sync_count': self.current_bridge_status.sync_count,
            'error_count': self.current_bridge_status.error_count,
            'last_sync': datetime.fromtimestamp(self.current_bridge_status.last_sync).isoformat() 
                        if self.current_bridge_status.last_sync > 0 else None,
            'last_error': self.current_bridge_status.last_error,
            'subscribers_count': len(self.subscribers),
            'is_syncing': self.is_syncing,
            'cache_enabled': self.cache_enabled
        }
        
        # 添加缓存统计信息
        if self.cache_enabled and self.status_cache:
            stats['cache_statistics'] = self.status_cache.get_statistics()
        
        return stats
    
    def get_status_history(
        self,
        limit: Optional[int] = None,
        since: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        获取状态历史记录（需要启用缓存）
        
        Args:
            limit: 限制返回的记录数量
            since: 只返回此时间戳之后的记录
        
        Returns:
            历史记录列表
        """
        if not self.cache_enabled or not self.status_cache:
            logger.warning("状态缓存未启用，无法获取历史记录")
            return []
        
        return self.status_cache.get_history(limit=limit, since=since)
    
    def get_field_history(
        self,
        field_name: str,
        limit: Optional[int] = None
    ) -> List[tuple]:
        """
        获取特定字段的历史值（需要启用缓存）
        
        Args:
            field_name: 字段名称（支持嵌套，如 'drone_status.battery'）
            limit: 限制返回的记录数量
        
        Returns:
            (时间戳, 值) 元组列表
        """
        if not self.cache_enabled or not self.status_cache:
            logger.warning("状态缓存未启用，无法获取字段历史")
            return []
        
        return self.status_cache.get_field_history(field_name, limit=limit)
    
    def get_changes_since(self, timestamp: float) -> List[Dict[str, Any]]:
        """
        获取指定时间戳之后的所有变化（需要启用缓存）
        
        Args:
            timestamp: 起始时间戳
        
        Returns:
            变化记录列表
        """
        if not self.cache_enabled or not self.status_cache:
            logger.warning("状态缓存未启用，无法获取变化记录")
            return []
        
        return self.status_cache.get_changes_since(timestamp)
    
    def export_history(self, filepath: str) -> bool:
        """
        导出状态历史到文件（需要启用缓存）
        
        Args:
            filepath: 文件路径
        
        Returns:
            是否成功
        """
        if not self.cache_enabled or not self.status_cache:
            logger.warning("状态缓存未启用，无法导出历史记录")
            return False
        
        try:
            self.status_cache.export_history(filepath)
            return True
        except Exception as e:
            logger.error(f"导出历史记录失败: {e}")
            return False
    
    def clear_cache(self):
        """清空缓存和历史记录"""
        if self.cache_enabled and self.status_cache:
            self.status_cache.clear_all()
            logger.info("缓存已清空")
        else:
            logger.warning("状态缓存未启用")


# 使用示例
async def main():
    """测试状态管理器"""
    # 创建状态管理器
    status_manager = StatusManager(sync_interval=1.0)
    
    # 模拟状态源
    async def mock_status_source():
        """模拟状态源"""
        import random
        return {
            'success': True,
            'connected': True,
            'flying': random.choice([True, False]),
            'battery': random.randint(20, 100),
            'temperature': random.randint(20, 40),
            'height': random.randint(0, 200)
        }
    
    # 订阅状态更新
    async def status_callback(status):
        print(f"状态更新: {status}")
    
    status_manager.subscribe(status_callback)
    
    # 启动同步
    await status_manager.start_sync(mock_status_source)
    
    # 运行一段时间
    await asyncio.sleep(10)
    
    # 停止同步
    await status_manager.stop_sync()
    
    # 打印统计信息
    print(f"统计信息: {status_manager.get_statistics()}")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    asyncio.run(main())
