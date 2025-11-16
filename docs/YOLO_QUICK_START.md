# YOLO检测模块快速开始指南

## 🚀 快速开始

### 1. 安装依赖

#### Python依赖
```bash
cd drone-analyzer-nextjs/python
pip install ultralytics opencv-python numpy requests
```

#### 验证安装
```bash
python yolo_model_manager.py
python yolo_detection_service.py
```

### 2. 启动服务

#### 启动后端服务
```bash
cd drone-analyzer-nextjs/python
python drone_backend.py
```

后端服务将在 `ws://localhost:3002` 启动。

#### 启动前端服务
```bash
cd drone-analyzer-nextjs
npm run dev
```

前端服务将在 `http://localhost:3000` 启动。

### 3. 创建第一个YOLO检测工作流

#### 步骤1: 打开工作流编辑器
1. 访问 `http://localhost:3000`
2. 导航到"工作流"面板

#### 步骤2: 添加节点
从节点库拖拽以下节点到画布：
1. **开始** 节点
2. **起飞** 节点
3. **YOLO检测** 节点
4. **降落** 节点
5. **结束** 节点

#### 步骤3: 连接节点
按顺序连接节点：
```
开始 → 起飞 → YOLO检测 → 降落 → 结束
```

#### 步骤4: 配置YOLO检测节点
双击YOLO检测节点，配置参数：
- **模型来源**: 内置模型
- **图像来源**: 无人机摄像头
- **置信度阈值**: 0.5
- **IOU阈值**: 0.45
- **检测类别**: (留空，检测所有类别)
- **绘制结果**: ✓ 启用
- **输出变量名**: `yolo_detections`

#### 步骤5: 保存工作流
点击"保存工作流"按钮，输入名称：`我的第一个YOLO检测`

#### 步骤6: 执行工作流
1. 确保无人机已连接
2. 点击"运行"按钮
3. 观察节点状态变化
4. 查看控制面板中的日志和结果

### 4. 查看检测结果

#### 在控制面板中
- **日志标签页**: 查看执行日志
- **结果标签页**: 查看检测结果详情

#### 检测结果格式
```json
{
  "detections": [
    {
      "bbox": [100, 150, 300, 400],
      "class_id": 0,
      "class": "person",
      "confidence": 0.95
    }
  ],
  "count": 1,
  "model_id": "yolov8n",
  "annotated_image": "data:image/jpeg;base64,..."
}
```

## 📚 常见用例

### 用例1: 人员检测
```
配置:
- 模型: yolov8n
- 检测类别: person
- 置信度: 0.6
```

### 用例2: 车辆检测
```
配置:
- 模型: yolov8s
- 检测类别: car,truck,bus
- 置信度: 0.7
```

### 用例3: 多目标检测
```
配置:
- 模型: yolov8m
- 检测类别: (留空)
- 置信度: 0.5
```

## 🔧 高级配置

### 使用自定义模型

#### 1. 准备模型文件
确保模型文件格式为 `.pt`, `.pth`, 或 `.onnx`

#### 2. 上传模型
```python
from yolo_model_manager import YOLOModelManager

manager = YOLOModelManager()
success, msg, model_id = manager.upload_model(
    source_path='/path/to/your/model.pt',
    model_name='我的自定义模型',
    description='专门用于检测特定物体',
    tags=['custom', 'specialized']
)

print(f"模型ID: {model_id}")
```

#### 3. 在工作流中使用
配置YOLO检测节点：
- **模型来源**: 上传模型
- **模型路径**: 使用上面返回的 `model_id`

### 过滤特定类别

#### 方法1: 在节点配置中
```
检测类别: person,car,dog
```

#### 方法2: 在代码中
```typescript
const params = {
  modelId: 'yolov8n',
  classes: 'person,car,dog',
  confidence: 0.6
};
```

### 调整检测精度

#### 提高精度（减少误检）
```
置信度阈值: 0.7-0.9
IOU阈值: 0.5-0.7
```

#### 提高召回率（检测更多目标）
```
置信度阈值: 0.3-0.5
IOU阈值: 0.3-0.4
```

## 🐛 故障排除

### 问题1: 模型加载失败
**症状**: 日志显示"模型加载失败"

**解决方案**:
1. 检查模型文件是否存在
2. 验证模型格式是否正确
3. 确保ultralytics库已安装
```bash
pip install --upgrade ultralytics
```

### 问题2: 检测无结果
**症状**: 检测完成但没有发现目标

**解决方案**:
1. 降低置信度阈值（如0.3）
2. 检查图像质量
3. 确认检测类别设置正确
4. 尝试使用更大的模型（如yolov8m）

### 问题3: 检测速度慢
**症状**: 检测耗时过长

**解决方案**:
1. 使用更小的模型（yolov8n）
2. 减少图像分辨率
3. 启用GPU加速（如果可用）
4. 限制检测类别

### 问题4: WebSocket连接失败
**症状**: 前端无法连接到后端

**解决方案**:
1. 确认后端服务正在运行
2. 检查端口3002是否被占用
3. 查看防火墙设置
4. 检查WebSocket URL配置

## 📊 性能优化

### 模型选择建议

| 模型 | 速度 | 精度 | 内存 | 适用场景 |
|------|------|------|------|----------|
| yolov8n | ⚡⚡⚡ | ⭐⭐ | 6MB | 实时检测、资源受限 |
| yolov8s | ⚡⚡ | ⭐⭐⭐ | 22MB | 平衡性能 |
| yolov8m | ⚡ | ⭐⭐⭐⭐ | 52MB | 高精度需求 |

### 参数调优

#### 实时检测（优先速度）
```
模型: yolov8n
置信度: 0.5
IOU阈值: 0.45
图像分辨率: 640x480
```

#### 高精度检测（优先准确性）
```
模型: yolov8m
置信度: 0.7
IOU阈值: 0.5
图像分辨率: 1280x720
```

## 🎯 最佳实践

### 1. 工作流设计
- ✅ 在检测前添加悬停节点，确保图像稳定
- ✅ 使用条件分支根据检测结果执行不同操作
- ✅ 保存检测结果到变量供后续使用
- ✅ 添加错误处理节点

### 2. 参数设置
- ✅ 根据场景选择合适的模型
- ✅ 根据需求调整置信度阈值
- ✅ 使用类别过滤减少误检
- ✅ 启用结果绘制便于调试

### 3. 性能优化
- ✅ 预加载常用模型
- ✅ 复用已加载的模型
- ✅ 批量处理多张图像
- ✅ 定期清理不用的模型

### 4. 错误处理
- ✅ 设置合理的超时时间
- ✅ 添加重试机制
- ✅ 记录详细的错误日志
- ✅ 提供降级方案

## 📖 更多资源

### 文档
- [完整实现文档](./YOLO_DETECTION_MODULE_COMPLETE.md)
- [需求文档](../.kiro/specs/tello-workflow-enhancement/requirements.md)
- [设计文档](../.kiro/specs/tello-workflow-enhancement/design.md)

### 代码示例
- [模型管理器](./python/yolo_model_manager.py)
- [检测服务](./python/yolo_detection_service.py)
- [前端客户端](./lib/workflow/yoloClient.ts)
- [节点组件](./components/workflow/nodes/YOLODetectionNode.tsx)

### 外部资源
- [Ultralytics YOLO文档](https://docs.ultralytics.com/)
- [YOLO v8模型](https://github.com/ultralytics/ultralytics)
- [COCO数据集类别](https://cocodataset.org/#explore)

## 🤝 获取帮助

如果遇到问题：
1. 查看日志文件
2. 检查错误消息
3. 参考故障排除部分
4. 查看完整文档

---

**祝你使用愉快！** 🎉
