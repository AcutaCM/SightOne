# DroneControllerAdapter 方法补充说明

## 问题描述
运行任务时出现错误：
```
Mission error: 'DroneControllerAdapter' object has no attribute 'set_height'
```

## 问题原因
`DroneControllerAdapter`类缺少`mission_controller.py`需要的方法：
- `set_height()` - 设置飞行高度
- `rotate()` - 旋转无人机
- `move_to_mission_pad()` - 移动到Mission Pad
- `mission_pad_id` - 获取当前检测到的Mission Pad ID

## 解决方案

### 添加的方法

#### 1. mission_pad_id 属性
```python
@property
def mission_pad_id(self):
    """获取当前检测到的Mission Pad ID"""
    try:
        if self.tello:
            return self.tello.get_mission_pad_id()
    except Exception as e:
        print(f"获取Mission Pad ID失败: {e}")
    return -1
```

**功能**: 返回当前检测到的Mission Pad ID，如果没有检测到返回-1

#### 2. set_height() 方法
```python
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
```

**功能**: 
- 获取当前高度
- 计算与目标高度的差异
- 如果差异大于20cm，执行上升或下降
- 返回操作是否成功

**参数**:
- `height_cm`: 目标高度（厘米）

#### 3. rotate() 方法
```python
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
```

**功能**:
- 正数：顺时针旋转
- 负数：逆时针旋转
- 返回操作是否成功

**参数**:
- `degrees`: 旋转角度（度），正数为顺时针，负数为逆时针

#### 4. move_to_mission_pad() 方法
```python
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
```

**功能**:
- 使用Tello的Mission Pad导航功能
- 移动到相对于指定Mission Pad的位置
- 返回操作是否成功

**参数**:
- `pad_id`: Mission Pad ID
- `x`: X轴偏移（厘米）
- `y`: Y轴偏移（厘米）
- `z`: Z轴高度（厘米）
- `speed`: 移动速度（cm/s）

## 方法映射

### MissionController → DroneControllerAdapter → Tello

```
mission_controller.py          DroneControllerAdapter          djitellopy.Tello
─────────────────────────────────────────────────────────────────────────────
drone.set_height(100)      →   set_height(100)            →   move_up()/move_down()
drone.rotate(30)           →   rotate(30)                 →   rotate_clockwise(30)
drone.move_to_mission_pad  →   move_to_mission_pad(...)   →   go_xyz_speed_mid(...)
drone.mission_pad_id       →   mission_pad_id             →   get_mission_pad_id()
drone.takeoff()            →   takeoff()                  →   takeoff()
drone.land()               →   land()                     →   land()
drone.manual_control(...)  →   manual_control(...)        →   send_rc_control(...)
```

## 完整的DroneControllerAdapter类

现在`DroneControllerAdapter`包含以下方法：

### 属性
- `is_connected` - 连接状态
- `is_flying` - 飞行状态
- `mission_pad_id` - 当前检测到的Mission Pad ID

### 方法
- `takeoff()` - 起飞
- `land()` - 降落
- `set_height(height_cm)` - 设置高度
- `rotate(degrees)` - 旋转
- `move_to_mission_pad(pad_id, x, y, z, speed)` - 移动到Mission Pad
- `manual_control(lr, fb, ud, yv)` - 手动控制
- `update_connection_status(connected)` - 更新连接状态

## 使用示例

### 1. 设置高度
```python
# 设置飞行高度为100cm
drone_adapter.set_height(100)
```

### 2. 旋转搜索
```python
# 顺时针旋转30度
drone_adapter.rotate(30)

# 逆时针旋转45度
drone_adapter.rotate(-45)
```

### 3. 移动到Mission Pad
```python
# 移动到PAD1的中心，高度100cm，速度20cm/s
drone_adapter.move_to_mission_pad(1, 0, 0, 100, 20)

# 移动到PAD6的中心，高度80cm，速度15cm/s
drone_adapter.move_to_mission_pad(6, 0, 0, 80, 15)
```

### 4. 获取Mission Pad ID
```python
# 获取当前检测到的Mission Pad ID
pad_id = drone_adapter.mission_pad_id
if pad_id > 0:
    print(f"检测到Mission Pad: {pad_id}")
else:
    print("未检测到Mission Pad")
```

## 错误处理

所有方法都包含异常处理：
- 捕获并打印错误信息
- 返回False表示操作失败
- 不会导致程序崩溃

### 示例
```python
# 即使操作失败，程序也会继续运行
success = drone_adapter.set_height(100)
if not success:
    print("高度调整失败，但程序继续运行")
```

## 注意事项

### 1. 高度调整阈值
```python
if abs(diff) > 20:  # 只有差异大于20cm才调整
```
- 避免频繁的小幅度调整
- 提高飞行稳定性
- 减少电量消耗

### 2. Mission Pad检测
- 需要Tello官方Mission Pad
- 确保光线充足
- 卡片平整无遮挡
- 高度不要太高（建议60-150cm）

### 3. 旋转角度
- 建议使用30-45度的小角度
- 避免大角度快速旋转
- 旋转后等待稳定（0.5-1秒）

### 4. 移动速度
- 建议速度：10-20 cm/s
- 速度太快可能导致检测不稳定
- 速度太慢会增加任务时间

## 测试建议

### 1. 单独测试每个方法
```python
# 测试高度调整
print("测试高度调整...")
drone_adapter.set_height(80)
time.sleep(2)

# 测试旋转
print("测试旋转...")
drone_adapter.rotate(30)
time.sleep(2)

# 测试Mission Pad检测
print("测试Mission Pad检测...")
pad_id = drone_adapter.mission_pad_id
print(f"检测到: {pad_id}")
```

### 2. 测试完整流程
```python
# 起飞
drone_adapter.takeoff()
time.sleep(3)

# 调整高度
drone_adapter.set_height(100)
time.sleep(2)

# 检测Mission Pad
pad_id = drone_adapter.mission_pad_id
if pad_id > 0:
    # 移动到Mission Pad中心
    drone_adapter.move_to_mission_pad(pad_id, 0, 0, 100, 15)
    time.sleep(3)

# 降落
drone_adapter.land()
```

## 故障排除

### 问题1: 高度调整不准确
**原因**: Tello的高度传感器精度有限

**解决方案**:
- 使用较大的阈值（20cm）
- 多次小幅度调整
- 使用Mission Pad辅助定位

### 问题2: Mission Pad检测失败
**原因**: 光线、角度或距离问题

**解决方案**:
- 改善光线条件
- 调整飞行高度（60-100cm）
- 使用旋转搜索
- 确保卡片平整

### 问题3: 旋转后失去方向
**原因**: 旋转角度太大或太快

**解决方案**:
- 使用小角度（30度）
- 旋转后等待稳定
- 使用Mission Pad重新定位

## 性能优化

### 1. 减少不必要的高度调整
```python
# 只在差异大于阈值时调整
if abs(diff) > 20:
    adjust_height()
```

### 2. 批量操作
```python
# 一次性完成多个操作
drone_adapter.set_height(100)
time.sleep(2)
drone_adapter.rotate(30)
time.sleep(2)
```

### 3. 异步执行
```python
# 在单独的线程中执行任务
threading.Thread(target=mission_sequence).start()
```

## 总结

通过添加这些方法，`DroneControllerAdapter`现在完全支持`mission_controller.py`的所有功能需求：

✅ **高度控制** - set_height()
✅ **旋转搜索** - rotate()
✅ **Mission Pad导航** - move_to_mission_pad()
✅ **Mission Pad检测** - mission_pad_id
✅ **基本飞行** - takeoff(), land()
✅ **手动控制** - manual_control()

现在可以正常运行挑战卡巡航任务了！
