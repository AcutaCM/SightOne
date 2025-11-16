# ⏱️ QR扫描冷却功能

## ✅ 已实现的功能

实现了完整的QR扫描冷却系统，防止重复扫描同一植株ID的二维码，并支持用户自定义配置。

---

## 🎯 核心功能

### 1. 扫描冷却机制
- ✅ 每个植株ID独立的冷却时间
- ✅ 冷却期内自动过滤重复扫描
- ✅ 冷却结束后自动允许重新扫描
- ✅ 实时显示剩余冷却时间

### 2. 用户可配置
- ✅ 设置冷却时间（秒）
- ✅ 快捷预设值（10/30/60/120/300秒）
- ✅ 清空所有冷却记录
- ✅ 查询冷却状态

### 3. 视觉反馈
- ✅ 冷却中的QR码显示灰色边框
- ✅ 可扫描的QR码显示绿色边框
- ✅ 显示剩余冷却时间
- ✅ Toast通知提示

---

## 📝 新增文件

### 1. **enhanced_qr_detector.py** (后端)
增强版QR检测器，支持扫描冷却功能

**核心类**: `EnhancedQRDetector`

**主要方法**:
```python
# 初始化（默认60秒冷却）
detector = EnhancedQRDetector(cooldown_seconds=60)

# 设置冷却时间
detector.set_cooldown(30)

# 检查是否在冷却期
is_cooling = detector.is_in_cooldown(plant_id)

# 获取剩余冷却时间
remaining = detector.get_remaining_cooldown(plant_id)

# 清空所有冷却
detector.clear_cooldowns()

# 获取冷却状态
status = detector.get_cooldown_status()
```

**冷却跟踪**:
```python
# 冷却记录: plant_id -> 冷却结束时间戳
cooldown_tracker: Dict[int, float] = {}

# 统计信息
total_detections: int  # 总检测次数
blocked_detections: int  # 被冷却阻止的次数
```

---

### 2. **QRCooldownSettings.tsx** (前端组件)
QR扫描冷却设置面板

**Props**:
```typescript
interface QRCooldownSettingsProps {
  onSetCooldown: (seconds: number) => void;
  onClearCooldowns: () => void;
  currentCooldown?: number;
}
```

**功能**:
- 输入框设置冷却时间
- 快捷按钮（10/30/60/120/300秒）
- 应用设置按钮
- 清空冷却按钮
- 当前设置显示
- 使用说明

---

## 🔄 修改的文件

### 1. **drone_backend.py** (后端)

#### 1.1 导入增强版QR检测器
```python
from enhanced_qr_detector import EnhancedQRDetector as QRDetector
```

#### 1.2 初始化时设置默认冷却
```python
self.qr_detector = QRDetector(cooldown_seconds=60)
```

#### 1.3 新增WebSocket消息处理器

**设置冷却时间**:
```python
async def handle_set_qr_cooldown(self, websocket, data):
    cooldown_seconds = data.get('cooldown_seconds')
    self.qr_detector.set_cooldown(cooldown_seconds)
    await self.broadcast_message('qr_cooldown_updated', {
        'cooldown_seconds': cooldown_seconds,
        'message': f'QR扫描冷却时间已设置为 {cooldown_seconds} 秒'
    })
```

**获取冷却状态**:
```python
async def handle_get_qr_cooldown_status(self, websocket, data):
    status = self.qr_detector.get_cooldown_status()
    await websocket.send(json.dumps({
        'type': 'qr_cooldown_status',
        'data': status
    }))
```

**清空冷却记录**:
```python
async def handle_clear_qr_cooldowns(self, websocket, data):
    self.qr_detector.clear_cooldowns()
    await self.broadcast_message('qr_cooldowns_cleared', {
        'message': '所有QR扫描冷却记录已清空'
    })
```

---

### 2. **useDroneControl.ts** (前端Hook)

#### 2.1 新增函数

**设置冷却时间**:
```typescript
const setQRCooldown = useCallback((cooldownSeconds: number) => {
  if (sendMessage('set_qr_cooldown', { cooldown_seconds: cooldownSeconds })) {
    addLog('info', `设置QR扫描冷却时间: ${cooldownSeconds}秒`);
    return true;
  }
  return false;
}, [sendMessage, addLog]);
```

**获取冷却状态**:
```typescript
const getQRCooldownStatus = useCallback(() => {
  return sendMessage('get_qr_cooldown_status');
}, [sendMessage]);
```

**清空冷却记录**:
```typescript
const clearQRCooldowns = useCallback(() => {
  if (sendMessage('clear_qr_cooldowns')) {
    addLog('info', '清空所有QR扫描冷却记录');
    return true;
  }
  return false;
}, [sendMessage, addLog]);
```

#### 2.2 新增消息处理

**冷却更新通知**:
```typescript
case 'qr_cooldown_updated': {
  toast.success(payload.message, {
    duration: 3000,
    icon: '⏱️'
  });
  break;
}
```

**冷却清空通知**:
```typescript
case 'qr_cooldowns_cleared': {
  toast.success(payload.message, {
    duration: 3000,
    icon: '🧹'
  });
  // 清空前端的冷却记录
  setQrScan(prev => ({
    ...prev,
    cooldowns: {}
  }));
  break;
}
```

---

## 🎨 视觉效果

### 检测框颜色

| 状态 | 颜色 | 说明 |
|------|------|------|
| 可扫描 | 🟢 绿色 | 可以扫描，不在冷却期 |
| 冷却中 | ⚪ 灰色 | 在冷却期，暂时不可扫描 |

### 标注信息

**可扫描**:
```
┌─────────────────┐
│ 🟢 植株ID: 2    │
│                 │
│   [QR CODE]     │
│                 │
└─────────────────┘
```

**冷却中**:
```
┌─────────────────────────┐
│ ⚪ 植株ID: 2 (冷却:45s) │
│                         │
│      [QR CODE]          │
│                         │
└─────────────────────────┘
```

---

## 🔄 完整工作流程

```
用户扫描QR码
    ↓
检测到植株ID: 2
    ↓
检查冷却状态
    ↓
┌───────┴───────┐
│               │
不在冷却      在冷却中
│               │
↓               ↓
✅ 允许扫描    ❌ 阻止扫描
│               │
↓               ↓
发送qr_detected  显示灰色边框
消息            显示剩余时间
│               │
↓               ↓
启动60秒冷却    继续冷却
│
↓
Toast通知:
"🏷️ 检测到植株 2"
│
↓
60秒后冷却结束
│
↓
可以再次扫描
```

---

## 📊 冷却状态数据结构

### 后端返回的冷却状态
```python
{
    'cooldown_seconds': 60,  # 冷却时间设置
    'active_cooldowns': {    # 活跃的冷却记录
        2: 45,  # 植株ID: 2, 剩余45秒
        5: 30,  # 植株ID: 5, 剩余30秒
    },
    'total_detections': 150,      # 总检测次数
    'blocked_detections': 45      # 被阻止的次数
}
```

### 前端qrScan状态
```typescript
{
  lastScan: {
    id: "2-1234567890",
    plantId: "2",
    timestamp: "19:30:22",
    qrImage: "base64...",
    size: "200x200",
    cooldownTime: 1234567890000
  },
  scanHistory: [...],
  cooldowns: {
    "2": 1234567890000,  // 植株ID: 冷却结束时间戳
    "5": 1234567920000
  }
}
```

---

## 🎯 使用场景

### 场景1: 正常扫描
```
1. 扫描植株2的QR码
   → ✅ "检测到植株 2"
   → 启动60秒冷却

2. 60秒内再次扫描植株2
   → ⏸️ "植株 2 在冷却期，剩余 45 秒"
   → 显示灰色边框

3. 60秒后再次扫描植株2
   → ✅ "检测到植株 2"
   → 重新启动60秒冷却
```

### 场景2: 调整冷却时间
```
1. 打开QR冷却设置面板
2. 选择30秒或输入自定义时间
3. 点击"应用设置"
   → ⏱️ "QR扫描冷却时间已设置为 30 秒"
4. 新的扫描使用30秒冷却
```

### 场景3: 清空冷却
```
1. 点击"清空冷却"按钮
   → 🧹 "所有QR扫描冷却记录已清空"
2. 所有植株ID立即可以重新扫描
```

---

## 🔧 配置建议

### 推荐冷却时间

| 场景 | 推荐时间 | 说明 |
|------|---------|------|
| 快速测试 | 10秒 | 开发调试时使用 |
| 正常巡检 | 60秒 | 标准巡检场景 |
| 密集扫描 | 30秒 | 需要频繁扫描时 |
| 长期监控 | 120-300秒 | 避免过度扫描 |
| 禁用冷却 | 0秒 | 特殊需求（不推荐） |

### 性能考虑
- ✅ 冷却记录自动清理过期项
- ✅ 内存占用极小（每个ID约8字节）
- ✅ 检查速度O(1)
- ✅ 不影响检测性能

---

## 🐛 故障排除

### 问题1: 冷却不生效
**检查**:
- 确认使用的是EnhancedQRDetector
- 检查冷却时间是否设置为0
- 查看后端日志是否有错误

**解决**:
```bash
# 检查后端日志
✅ 增强版QR检测器模块加载成功
✅ QR检测器初始化成功（冷却时间: 60秒）
```

### 问题2: 设置冷却时间无效
**检查**:
- WebSocket连接是否正常
- 消息是否正确发送
- 后端是否收到消息

**解决**:
```typescript
// 检查返回值
const success = setQRCooldown(30);
if (!success) {
  console.error('设置冷却时间失败');
}
```

### 问题3: 冷却时间不准确
**检查**:
- 系统时间是否正确
- 时区设置是否正确
- 是否有时间同步问题

**解决**:
```python
# 使用time.time()确保时间戳准确
current_time = time.time()
cooldown_end = current_time + self.cooldown_seconds
```

---

## 📈 统计信息

### 可用的统计数据
```python
statistics = detector.get_statistics()
# {
#     'total_detections': 150,        # 总检测次数
#     'blocked_detections': 45,       # 被阻止次数
#     'successful_detections': 105,   # 成功检测次数
#     'history_count': 100,           # 历史记录数
#     'active_cooldowns': 3,          # 活跃冷却数
#     'cooldown_seconds': 60          # 当前冷却设置
# }
```

### 效率指标
- **阻止率** = blocked_detections / total_detections
- **成功率** = successful_detections / total_detections
- **平均冷却数** = active_cooldowns

---

## 🚀 未来扩展

### 短期计划
1. **冷却历史记录**
   - 记录每次冷却的开始和结束时间
   - 导出冷却历史数据

2. **智能冷却**
   - 根据扫描频率自动调整冷却时间
   - 不同植株ID使用不同冷却时间

3. **冷却提醒**
   - 冷却即将结束时提醒
   - 批量冷却结束通知

### 长期计划
1. **冷却策略**
   - 指数退避策略
   - 时间窗口限制
   - 频率限制

2. **数据分析**
   - 扫描热力图
   - 冷却效率分析
   - 优化建议

3. **高级功能**
   - 冷却白名单
   - 紧急扫描模式
   - 冷却优先级

---

## ✅ 验证清单

- [x] EnhancedQRDetector类实现
- [x] 冷却跟踪机制
- [x] 设置冷却时间功能
- [x] 获取冷却状态功能
- [x] 清空冷却记录功能
- [x] WebSocket消息处理
- [x] 前端Hook函数
- [x] Toast通知
- [x] 视觉反馈（颜色区分）
- [x] QRCooldownSettings组件
- [x] 无Python错误
- [x] 无TypeScript错误

---

## 🎉 总结

QR扫描冷却功能现在已完全实现！

**核心特性**:
- ⏱️ 每个植株ID独立冷却
- 🎛️ 用户可配置冷却时间
- 🎨 视觉反馈（绿色/灰色）
- 🔔 Toast通知
- 📊 统计信息
- 🧹 清空冷却功能

**用户体验**:
- 防止重复扫描
- 灵活的配置选项
- 清晰的视觉提示
- 实时冷却倒计时

**性能优化**:
- O(1)冷却检查
- 自动清理过期记录
- 极小内存占用
- 不影响检测速度

---

**更新日期**: 2025-10-11  
**版本**: 1.0.0  
**状态**: ✅ 完成
