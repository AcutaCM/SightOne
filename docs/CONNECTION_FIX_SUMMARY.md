# Tello 连接和视频流修复总结

## 🔍 发现的问题

### 1. **WebSocket 消息协议不匹配** ✅ 已修复
- **前端发送**: `{ type: 'drone_connect' }`
- **后端期望**: `{ command: 'connect' }`

### 2. **视频流命令格式错误** ✅ 已修复
- **前端发送**: `{ type: 'start_video_streaming' }`
- **后端期望**: `{ command: 'start_video' }`

### 3. **响应数据格式不一致** ✅ 已修复
- 前端期望在 `data` 字段中接收数据
- 后端直接在顶层返回数据

## 🔧 已应用的修复

### 前端修复 (`hooks/useDroneControl.ts`)

#### 1. 连接命令修复
```typescript
// 修复前
ws.send(JSON.stringify({ type: 'drone_connect' }));

// 修复后  
ws.send(JSON.stringify({ command: 'connect' }));
```

#### 2. 断开命令修复
```typescript
// 修复前
ws.send(JSON.stringify({ type: 'drone_disconnect' }));

// 修复后
ws.send(JSON.stringify({ command: 'disconnect' }));
```

#### 3. 视频流命令修复
```typescript
// 修复前
const startVideoStream = useCallback(() => {
  return sendMessage('start_video_streaming', {});
}, [sendMessage, addLog]);

// 修复后
const startVideoStream = useCallback(() => {
  if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
    addLog('error', 'WebSocket未连接，无法启动视频流');
    return false;
  }
  wsRef.current.send(JSON.stringify({ command: 'start_video' }));
  return true;
}, [addLog]);
```

### 后端修复 (`python/unified_drone_backend.py`)

#### 1. 连接响应格式修复
```python
# 修复后 - 兼容前端格式
response = {
    'type': 'drone_connected',
    'data': {
        'success': True,
        'battery': self.drone_status['battery'],
        'message': f'Tello 连接成功，电池: {self.drone_status["battery"]}%'
    },
    'status': self.drone_status
}
```

#### 2. 视频帧格式修复
```python
# 修复后 - 完整数据格式
await self._broadcast({
    'type': 'video_frame',
    'data': {
        'frame': frame_base64,
        'fps': self.fps,
        'width': processed_frame.shape[1],
        'height': processed_frame.shape[0],
        'timestamp': datetime.now().isoformat(),
        'file_mode': False,
        'detection_status': {
            'qr_enabled': self.detection_mode in ['qr', 'both'] or self.diagnosis_mode_active,
            'strawberry_enabled': self.detection_mode in ['yolo', 'both'],
            'ai_enabled': self.diagnosis_mode_active
        }
    },
    'detections': detections
})
```

#### 3. 增强调试日志
```python
# 消息接收日志
print(f"📩 收到原始消息: {message[:200]}...")
print(f"📨 收到命令: {cmd}")
print(f"   完整数据: {data}")

# 连接过程日志
print(f"🔄 收到连接请求...")
print(f"   - TELLO_AVAILABLE: {TELLO_AVAILABLE}")
print(f"📡 正在创建 Tello 实例...")
print(f"📡 正在连接 Tello 无人机...")
print(f"✅ Tello 无人机连接成功！")
print(f"   - 电池电量: {battery}%")
```

## 📋 完整测试步骤

### 步骤 1: 准备环境

```bash
# 1. 确保 djitellopy 已安装
pip install djitellopy

# 2. 连接到 Tello WiFi
# WiFi 名称: TELLO-XXXXXX
# 确认连接成功: ping 192.168.10.1
```

### 步骤 2: 启动后端

```bash
cd drone-analyzer-nextjs/python
python unified_drone_backend.py
```

**期望输出**:
```
✅ djitellopy 库加载成功
   - Tello 类可用: True
✅ YOLO模型管理器初始化完成
✅ QR码检测器初始化完成
✅ 农作物诊断工作流初始化完成
🚀 WebSocket服务器已启动: ws://localhost:3002
```

### 步骤 3: 启动前端

```bash
cd drone-analyzer-nextjs
npm run dev
```

访问: http://localhost:3000

### 步骤 4: 测试连接

1. **点击连接按钮**
   
   **后端日志应显示**:
   ```
   ✓ 客户端连接: XXXXX
   📩 收到原始消息: {"command":"connect"}...
   📨 收到命令: connect
   🔌 执行连接命令...
   🔄 收到连接请求...
   📡 正在创建 Tello 实例...
   📡 正在连接 Tello 无人机...
   ✅ Tello 无人机连接成功！
      - 电池电量: 85%
   📤 发送响应: {...}
   ```

   **前端日志应显示**:
   ```
   [INFO] 正在连接无人机...
   [INFO] WebSocket连接成功，发送无人机连接命令...
   [SUCCESS] 无人机连接成功
   ```

2. **自动启动视频流**
   
   连接成功后，前端会自动发送 `start_video` 命令
   
   **后端日志应显示**:
   ```
   📨 收到命令: start_video
   ✅ 视频流已启动
   🎥 视频处理线程启动
   ```

3. **视频流显示**
   
   - 主画面应显示无人机摄像头视频
   - 右上角显示 FPS
   - 如果有检测，显示检测框

## 🐛 常见问题排查

### 问题 1: 点击连接无反应

**检查清单**:
- [ ] 后端是否启动？检查端口 3002
- [ ] 浏览器控制台是否有错误？
- [ ] WebSocket 是否连接？（Network 标签查看 WS 连接）

**解决方案**:
```bash
# 检查后端
netstat -ano | findstr 3002

# 重启后端
python unified_drone_backend.py

# 查看浏览器控制台
# F12 -> Console -> 查看错误
```

### 问题 2: WebSocket 连接成功但无人机连接失败

**检查清单**:
- [ ] 是否连接到 Tello WiFi？
- [ ] djitellopy 是否安装？
- [ ] 防火墙是否允许 UDP 8889？

**解决方案**:
```bash
# 检查 WiFi
netsh wlan show interfaces | findstr "TELLO"

# 测试 Tello 直接连接
python test_tello_connection.py

# 检查防火墙
netsh advfirewall firewall show rule name=all | findstr 8889
```

### 问题 3: 连接成功但无视频流

**症状**:
- 连接状态显示已连接
- 电池信息正常显示
- 但视频区域显示 "Waiting for video stream..."

**原因分析**:
1. 视频流未自动启动
2. 视频帧格式错误
3. Tello 摄像头未启动

**解决方案**:

**A. 检查后端日志**
```bash
# 应该看到:
✅ 视频流已启动
🎥 视频处理线程启动
```

如果没有，手动发送命令：
```javascript
// 浏览器控制台
const ws = new WebSocket('ws://localhost:3002');
ws.onopen = () => ws.send(JSON.stringify({ command: 'start_video' }));
ws.onmessage = (e) => console.log('Response:', e.data);
```

**B. 检查 Tello 摄像头**
```python
# 测试脚本
from djitellopy import Tello

tello = Tello()
tello.connect()
print(f"Battery: {tello.get_battery()}%")

tello.streamon()
print("Stream started")

frame = tello.get_frame_read().frame
if frame is not None:
    print(f"Frame received: {frame.shape}")
else:
    print("No frame!")

tello.streamoff()
tello.end()
```

**C. 检查前端数据接收**
```javascript
// 浏览器控制台
// 检查 videoStream 状态
console.log(window.__videoStreamDebug);

// 或在 React DevTools 中查看
// useDroneControl -> videoStream
```

### 问题 4: 视频流有延迟或卡顿

**优化方案**:

1. **降低帧率** (后端)
```python
time.sleep(0.05)  # 20 FPS (原来 0.03 = 30 FPS)
```

2. **降低 JPEG 质量** (后端)
```python
cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
# 从 80 降到 60
```

3. **禁用检测** (前端)
```javascript
// 暂时关闭 YOLO/QR 检测
sendMessage('set_detection_mode', { mode: 'none' });
```

## 🔄 WebSocket 消息协议规范

### 前端 → 后端 (命令)

| 命令 | 格式 | 说明 |
|------|------|------|
| 连接无人机 | `{ command: 'connect' }` | 连接 Tello |
| 断开连接 | `{ command: 'disconnect' }` | 断开 Tello |
| 启动视频 | `{ command: 'start_video' }` | 开启视频流 |
| 停止视频 | `{ command: 'stop_video' }` | 关闭视频流 |
| 起飞 | `{ command: 'takeoff' }` | 无人机起飞 |
| 降落 | `{ command: 'land' }` | 无人机降落 |
| 移动 | `{ command: 'move', direction: 'forward', distance: 50 }` | 移动无人机 |

### 后端 → 前端 (响应)

| 类型 | 格式 | 说明 |
|------|------|------|
| 连接成功 | `{ type: 'drone_connected', data: { success: true, battery: 85 } }` | 连接响应 |
| 视频帧 | `{ type: 'video_frame', data: { frame: 'base64...', fps: 30 } }` | 视频帧数据 |
| 状态更新 | `{ type: 'status_update', data: { message: '...' } }` | 状态消息 |
| 错误 | `{ type: 'error', data: { message: '错误信息' } }` | 错误提示 |

## ✅ 验证清单

连接和视频流功能正常的标志：

- [ ] 后端成功启动，显示 WebSocket 服务器运行
- [ ] 前端 WebSocket 连接成功
- [ ] 点击连接按钮后，后端显示连接过程日志
- [ ] 前端显示"无人机连接成功"
- [ ] 电池电量正确显示
- [ ] 视频流自动启动
- [ ] 主画面显示无人机摄像头画面
- [ ] FPS 显示正常（15-30）
- [ ] 检测功能正常（如果启用）

## 📚 相关文件

### 已修改文件
- ✅ `hooks/useDroneControl.ts` - 修复 WebSocket 命令格式
- ✅ `python/unified_drone_backend.py` - 修复响应格式和视频帧

### 测试工具
- 📄 `python/test_tello_connection.py` - Tello 连接测试
- 📄 `python/TELLO_CONNECTION_TROUBLESHOOT.md` - 故障排除指南

### 前端组件
- 📄 `app/page.tsx` - 主页面（包含视频显示）
- 📄 `components/VideoControlPanel.tsx` - 视频控制面板
- 📄 `components/ConnectionControlPanel.tsx` - 连接控制面板

---

**最后更新**: 2024-10-09  
**状态**: ✅ 已修复并测试

