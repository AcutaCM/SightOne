#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
状态缓存优化模块 (Status Cache Optimization)
实现状态缓存、差异检测、广播优化和历史记录功能
"""

import time
import logging
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from collections import deque
from enum import Enum
import json


logger = logging.getLogger(__name__)


class CacheStrategy(Enum):
    """缓存策略"""
    ALWAYS_CACHE = "always_cache"  # 总是缓存
    CACHE_ON_CHANGE = "cache_on_change"  # 仅在变化时缓存
    TIME_BASED = "time_based"  # 基于时间的缓存


@dataclass
class StatusCacheEntry:
    """状态缓存条目"""
    timestamp: float
    status_data: Dict[str, Any]
    hash_value: str  # 状态数据的哈希值，用于快速比较
    change_detected: bool = False
    change_fields: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'timestamp': datetime.fromtimestamp(self.timestamp).isoformat(),
            'status_data': self.status_data,
            'hash_value': self.hash_value,
            'change_detected': self.change_detected,
            'change_fields': self.change_fields
        }


@dataclass
class BroadcastMetrics:
    """广播指标"""
    total_broadcasts: int = 0
    suppressed_broadcasts: int = 0  # 被抑制的广播次数
    last_broadcast_time: float = 0
    average_broadcast_interval: float = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'total_broadcasts': self.total_broadcasts,
            'suppressed_broadcasts': self.suppressed_broadcasts,
            'suppression_rate': self.suppressed_broadcasts / max(self.total_broadcasts + self.suppressed_broadcasts, 1),
            'last_broadcast_time': datetime.fromtimestamp(self.last_broadcast_time).isoformat() if self.last_broadcast_time > 0 else None,
            'average_broadcast_interval': self.average_broadcast_interval
        }


class StatusCache:
    """
    状态缓存类
    提供高效的状态缓存、差异检测和历史记录功能
    """
    
    def __init__(
        self,
        max_history_size: int = 100,
        cache_ttl: float = 60.0,
        min_broadcast_interval: float = 0.1,
        cache_strategy: CacheStrategy = CacheStrategy.CACHE_ON_CHANGE
    ):
        """
        初始化状态缓存
        
        Args:
            max_history_size: 最大历史记录数量
            cache_ttl: 缓存生存时间（秒）
            min_broadcast_interval: 最小广播间隔（秒），用于限流
            cache_strategy: 缓存策略
        """
        self.max_history_size = max_history_size
        self.cache_ttl = cache_ttl
        self.min_broadcast_interval = min_broadcast_interval
        self.cache_strategy = cache_strategy
        
        # 当前缓存的状态
        self.current_cache: Optional[StatusCacheEntry] = None
        
        # 状态历史记录（使用deque实现固定大小的环形缓冲区）
        self.history: deque = deque(maxlen=max_history_size)
        
        # 广播指标
        self.broadcast_metrics = BroadcastMetrics()
        
        # 差异检测配置
        self.diff_threshold = {
            'battery': 1,  # 电池变化1%就记录
            'temperature': 1,  # 温度变化1度就记录
            'height': 5,  # 高度变化5cm就记录
            'position': 2,  # 位置变化2cm就记录
        }
        
        logger.info(f"状态缓存已初始化: max_history={max_history_size}, ttl={cache_ttl}s, strategy={cache_strategy.value}")
    
    def _compute_hash(self, status_data: Dict[str, Any]) -> str:
        """
        计算状态数据的哈希值
        
        Args:
            status_data: 状态数据
        
        Returns:
            哈希值字符串
        """
        try:
            # 将状态数据转换为规范化的JSON字符串
            # 排序键以确保一致性
            json_str = json.dumps(status_data, sort_keys=True)
            
            # 使用简单的哈希函数
            import hashlib
            return hashlib.md5(json_str.encode()).hexdigest()
        except Exception as e:
            logger.error(f"计算哈希值失败: {e}")
            return str(time.time())
    
    def _detect_differences(
        self,
        old_status: Dict[str, Any],
        new_status: Dict[str, Any]
    ) -> Tuple[bool, List[str]]:
        """
        检测两个状态之间的差异
        
        Args:
            old_status: 旧状态
            new_status: 新状态
        
        Returns:
            (是否有显著差异, 变化的字段列表)
        """
        changed_fields = []
        has_significant_change = False
        
        # 检查所有字段
        all_keys = set(old_status.keys()) | set(new_status.keys())
        
        for key in all_keys:
            old_value = old_status.get(key)
            new_value = new_status.get(key)
            
            # 如果值不同
            if old_value != new_value:
                changed_fields.append(key)
                
                # 检查是否是显著变化
                if key in self.diff_threshold:
                    # 数值类型的阈值检查
                    if isinstance(old_value, (int, float)) and isinstance(new_value, (int, float)):
                        if abs(new_value - old_value) >= self.diff_threshold[key]:
                            has_significant_change = True
                    else:
                        has_significant_change = True
                elif key in ['connected', 'flying', 'state']:
                    # 关键状态字段总是显著变化
                    has_significant_change = True
                elif isinstance(old_value, dict) and isinstance(new_value, dict):
                    # 递归检查嵌套字典
                    nested_change, _ = self._detect_differences(old_value, new_value)
                    if nested_change:
                        has_significant_change = True
        
        return has_significant_change, changed_fields
    
    def update(self, status_data: Dict[str, Any]) -> Tuple[bool, bool]:
        """
        更新缓存状态
        
        Args:
            status_data: 新的状态数据
        
        Returns:
            (是否应该广播, 是否检测到变化)
        """
        try:
            current_time = time.time()
            
            # 计算新状态的哈希值
            new_hash = self._compute_hash(status_data)
            
            # 如果没有当前缓存，直接缓存并广播
            if self.current_cache is None:
                self.current_cache = StatusCacheEntry(
                    timestamp=current_time,
                    status_data=status_data.copy(),
                    hash_value=new_hash,
                    change_detected=True,
                    change_fields=list(status_data.keys())
                )
                self._add_to_history(self.current_cache)
                logger.debug("首次缓存状态")
                return True, True
            
            # 检查缓存是否过期
            cache_age = current_time - self.current_cache.timestamp
            cache_expired = cache_age > self.cache_ttl
            
            # 快速哈希比较
            if new_hash == self.current_cache.hash_value and not cache_expired:
                # 状态完全相同且缓存未过期，不需要更新
                logger.debug("状态未变化，使用缓存")
                return False, False
            
            # 详细差异检测
            has_significant_change, changed_fields = self._detect_differences(
                self.current_cache.status_data,
                status_data
            )
            
            # 根据缓存策略决定是否缓存
            should_cache = False
            if self.cache_strategy == CacheStrategy.ALWAYS_CACHE:
                should_cache = True
            elif self.cache_strategy == CacheStrategy.CACHE_ON_CHANGE:
                should_cache = has_significant_change or cache_expired
            elif self.cache_strategy == CacheStrategy.TIME_BASED:
                should_cache = cache_expired
            
            # 更新缓存
            if should_cache:
                self.current_cache = StatusCacheEntry(
                    timestamp=current_time,
                    status_data=status_data.copy(),
                    hash_value=new_hash,
                    change_detected=has_significant_change,
                    change_fields=changed_fields
                )
                self._add_to_history(self.current_cache)
                logger.debug(f"缓存已更新，变化字段: {changed_fields}")
            
            # 决定是否广播
            should_broadcast = self._should_broadcast(has_significant_change, cache_expired)
            
            return should_broadcast, has_significant_change
            
        except Exception as e:
            logger.error(f"更新缓存失败: {e}")
            return True, True  # 出错时默认广播
    
    def _should_broadcast(self, has_change: bool, cache_expired: bool) -> bool:
        """
        决定是否应该广播状态更新
        
        Args:
            has_change: 是否有显著变化
            cache_expired: 缓存是否过期
        
        Returns:
            是否应该广播
        """
        current_time = time.time()
        
        # 如果有显著变化，总是广播
        if has_change:
            # 但要检查广播频率限制
            time_since_last_broadcast = current_time - self.broadcast_metrics.last_broadcast_time
            
            if time_since_last_broadcast < self.min_broadcast_interval:
                # 广播太频繁，抑制此次广播
                self.broadcast_metrics.suppressed_broadcasts += 1
                logger.debug(f"广播被抑制（频率限制）: {time_since_last_broadcast:.3f}s < {self.min_broadcast_interval}s")
                return False
            
            # 更新广播指标
            self.broadcast_metrics.total_broadcasts += 1
            self.broadcast_metrics.last_broadcast_time = current_time
            
            # 更新平均广播间隔
            if self.broadcast_metrics.total_broadcasts > 1:
                self.broadcast_metrics.average_broadcast_interval = (
                    self.broadcast_metrics.average_broadcast_interval * 0.9 +
                    time_since_last_broadcast * 0.1
                )
            
            return True
        
        # 如果缓存过期，也广播（但频率较低）
        if cache_expired:
            time_since_last_broadcast = current_time - self.broadcast_metrics.last_broadcast_time
            
            # 对于过期缓存，使用更宽松的频率限制
            if time_since_last_broadcast < self.min_broadcast_interval * 2:
                self.broadcast_metrics.suppressed_broadcasts += 1
                logger.debug(f"广播被抑制（缓存过期但频率限制）")
                return False
            
            self.broadcast_metrics.total_broadcasts += 1
            self.broadcast_metrics.last_broadcast_time = current_time
            return True
        
        # 其他情况不广播
        return False
    
    def _add_to_history(self, cache_entry: StatusCacheEntry):
        """
        添加缓存条目到历史记录
        
        Args:
            cache_entry: 缓存条目
        """
        self.history.append(cache_entry)
        logger.debug(f"历史记录已更新，当前大小: {len(self.history)}/{self.max_history_size}")
    
    def get_current(self) -> Optional[Dict[str, Any]]:
        """
        获取当前缓存的状态
        
        Returns:
            当前状态数据，如果没有缓存则返回None
        """
        if self.current_cache is None:
            return None
        
        return self.current_cache.status_data.copy()
    
    def get_history(
        self,
        limit: Optional[int] = None,
        since: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        获取状态历史记录
        
        Args:
            limit: 限制返回的记录数量
            since: 只返回此时间戳之后的记录
        
        Returns:
            历史记录列表
        """
        history_list = list(self.history)
        
        # 时间过滤
        if since is not None:
            history_list = [
                entry for entry in history_list
                if entry.timestamp >= since
            ]
        
        # 数量限制
        if limit is not None and limit > 0:
            history_list = history_list[-limit:]
        
        return [entry.to_dict() for entry in history_list]
    
    def get_changes_since(self, timestamp: float) -> List[Dict[str, Any]]:
        """
        获取指定时间戳之后的所有变化
        
        Args:
            timestamp: 起始时间戳
        
        Returns:
            变化记录列表
        """
        changes = []
        
        for entry in self.history:
            if entry.timestamp > timestamp and entry.change_detected:
                changes.append({
                    'timestamp': datetime.fromtimestamp(entry.timestamp).isoformat(),
                    'changed_fields': entry.change_fields,
                    'status_data': entry.status_data
                })
        
        return changes
    
    def get_field_history(
        self,
        field_name: str,
        limit: Optional[int] = None
    ) -> List[Tuple[float, Any]]:
        """
        获取特定字段的历史值
        
        Args:
            field_name: 字段名称
            limit: 限制返回的记录数量
        
        Returns:
            (时间戳, 值) 元组列表
        """
        field_history = []
        
        for entry in self.history:
            if field_name in entry.status_data:
                field_history.append((
                    entry.timestamp,
                    entry.status_data[field_name]
                ))
        
        # 数量限制
        if limit is not None and limit > 0:
            field_history = field_history[-limit:]
        
        return field_history
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        获取缓存统计信息
        
        Returns:
            统计信息字典
        """
        current_time = time.time()
        
        # 计算历史记录的时间跨度
        if len(self.history) > 0:
            oldest_entry = self.history[0]
            newest_entry = self.history[-1]
            time_span = newest_entry.timestamp - oldest_entry.timestamp
        else:
            time_span = 0
        
        # 计算变化率
        total_entries = len(self.history)
        changed_entries = sum(1 for entry in self.history if entry.change_detected)
        change_rate = changed_entries / max(total_entries, 1)
        
        return {
            'cache_strategy': self.cache_strategy.value,
            'max_history_size': self.max_history_size,
            'current_history_size': len(self.history),
            'cache_ttl': self.cache_ttl,
            'min_broadcast_interval': self.min_broadcast_interval,
            'time_span_seconds': time_span,
            'total_entries': total_entries,
            'changed_entries': changed_entries,
            'change_rate': change_rate,
            'broadcast_metrics': self.broadcast_metrics.to_dict(),
            'current_cache_age': current_time - self.current_cache.timestamp if self.current_cache else None,
            'cache_expired': (current_time - self.current_cache.timestamp > self.cache_ttl) if self.current_cache else None
        }
    
    def clear_history(self):
        """清空历史记录"""
        self.history.clear()
        logger.info("历史记录已清空")
    
    def clear_all(self):
        """清空所有缓存和历史记录"""
        self.current_cache = None
        self.history.clear()
        self.broadcast_metrics = BroadcastMetrics()
        logger.info("所有缓存已清空")
    
    def set_diff_threshold(self, field: str, threshold: float):
        """
        设置字段的差异阈值
        
        Args:
            field: 字段名称
            threshold: 阈值
        """
        self.diff_threshold[field] = threshold
        logger.info(f"差异阈值已更新: {field} = {threshold}")
    
    def export_history(self, filepath: str):
        """
        导出历史记录到文件
        
        Args:
            filepath: 文件路径
        """
        try:
            history_data = {
                'export_time': datetime.now().isoformat(),
                'statistics': self.get_statistics(),
                'history': self.get_history()
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(history_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"历史记录已导出到: {filepath}")
            
        except Exception as e:
            logger.error(f"导出历史记录失败: {e}")


# 使用示例
async def main():
    """测试状态缓存"""
    import asyncio
    import random
    
    # 创建状态缓存
    cache = StatusCache(
        max_history_size=50,
        cache_ttl=10.0,
        min_broadcast_interval=0.5,
        cache_strategy=CacheStrategy.CACHE_ON_CHANGE
    )
    
    # 模拟状态更新
    for i in range(100):
        # 生成模拟状态
        status = {
            'connected': True,
            'flying': random.choice([True, False]),
            'battery': max(0, 100 - i),
            'temperature': 25 + random.randint(-2, 2),
            'height': random.randint(0, 200),
            'position': {
                'x': random.randint(0, 100),
                'y': random.randint(0, 100),
                'z': random.randint(0, 50)
            }
        }
        
        # 更新缓存
        should_broadcast, has_change = cache.update(status)
        
        print(f"更新 {i+1}: 广播={should_broadcast}, 变化={has_change}")
        
        # 模拟更新间隔
        await asyncio.sleep(0.1)
    
    # 打印统计信息
    print("\n=== 缓存统计 ===")
    stats = cache.get_statistics()
    for key, value in stats.items():
        print(f"{key}: {value}")
    
    # 获取电池历史
    print("\n=== 电池历史 ===")
    battery_history = cache.get_field_history('battery', limit=10)
    for timestamp, value in battery_history:
        print(f"{datetime.fromtimestamp(timestamp).strftime('%H:%M:%S')}: {value}%")
    
    # 导出历史记录
    cache.export_history('status_history.json')


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    import asyncio
    asyncio.run(main())
