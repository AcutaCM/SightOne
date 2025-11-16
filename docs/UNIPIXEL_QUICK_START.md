# UniPixel工作流模块 - 快速开始指南

## 🚀 快速开始

### 1. 在工作流中使用UniPixel节点

#### 从节点库拖拽
1. 打开工作流编辑器
2. 在节点库中找到 **AI分析** 分类
3. 拖拽 **UniPixel分割** 节点到画布
4. 双击节点配置参数

#### 节点参数配置

```typescript
{
  imageSource: 'camera',      // 图像来源: camera/upload/variable
  query: '草莓病害区域',       // 分割查询描述
  confidence: 0.7,            // 置信度阈值 (0.1-1.0)
  sampleFrames: 1,            // 采样帧数 (1-10)
  visualize: true,            // 是否可视化结果
  outputVariable: 'seg_result' // 输出变量名
}
```

### 2. 后端集成

#### 在drone_backend.py中添加处理器

```python
from segmentation_fallback_service import SegmentationFallbackManager

# 初始化降级管理器
fallback_manager = SegmentationFallbackManager(
    unipixel_endpoint="http://localhost:8000/infer_unipixel_base64",
    enable_fallback=True
)

# WebSocket消息处理
async def handle_unipixel_segment(websocket, data):
    """处理UniPixel分割请求"""
    
    def send_progress(progress: int):
        """发送进度更新"""
        asyncio.create_task(websocket.send(json.dumps({
            'type': 'unipixel_progress',
            'data': {'progress': progress}
        })))
    
    def send_status(status: str):
        """发送状态更新"""
        asyncio.create_task(websocket.send(json.dumps({
            'type': 'unipixel_progress',
            'data': {'status': status}
        })))
    
    # 执行分割（自动降级）
    result = await fallback_manager.segment_with_fallback(
        image_base64=data['image_base64'],
        query=data['query'],
        sample_frames=data.get('sample_frames', 16),
        progress_callback=send_progress,
        status_callback=send_status
    )
    
    # 发送结果
    await websocket.send(json.dumps({
        'type': 'unipixel_result',
        'data': result
    }))

# 在消息路由中添加
if msg_type == 'unipixel_segment':
    await handle_unipixel_segment(websocket, data)
```

### 3. 工作流引擎集成

#### 在WorkflowEngine中添加执行逻辑

```typescript
import { getUniPixelClient } from '@/lib/workflow/uniPixelClient';

// 在executeNode方法中添加
case 'unipixel_segmentation': {
  const uniPixelClient = getUniPixelClient();
  
  // 获取图像数据
  let imageData: string;
  if (node.data.parameters.imageSource === 'camera') {
    imageData = await this.getCameraImage();
  } else if (node.data.parameters.imageSource === 'variable') {
    imageData = this.context.getVariable(node.data.parameters.imageVariable);
  } else {
    imageData = node.data.parameters.uploadedImage;
  }
  
  // 更新节点状态
  this.updateNodeStatus(node.id, 'running');
  
  // 执行分割
  const result = await uniPixelClient.segment(
    {
      imageSource: node.data.parameters.imageSource,
      imageData: imageData,
      query: node.data.parameters.query,
      confidence: node.data.parameters.confidence,
      sampleFrames: node.data.parameters.sampleFrames,
      visualize: node.data.parameters.visualize
    },
    (progress) => {
      // 更新进度
      this.updateNodeProgress(node.id, progress.progress);
      this.log('info', node.id, progress.status);
    }
  );
  
  // 存储结果
  this.context.setVariable(
    node.data.parameters.outputVariable,
    result
  );
  
  // 更新节点状态
  if (result.success) {
    this.updateNodeStatus(node.id, 'success', result);
  } else {
    this.updateNodeStatus(node.id, 'error', result.error);
  }
  
  break;
}
```

---

## 📊 服务状态检查

### 检查UniPixel服务可用性

```typescript
import { getUniPixelClient } from '@/lib/workflow/uniPixelClient';

const client = getUniPixelClient();
const status = await client.checkAvailability();

console.log('UniPixel可用:', status.unipixel_available);
console.log('降级启用:', status.fallback_enabled);
console.log('本地服务可用:', status.local_service_available);
```

### Python后端检查

```python
from segmentation_fallback_service import SegmentationFallbackManager

manager = SegmentationFallbackManager()
status = manager.get_service_status()

print(f"UniPixel可用: {status['unipixel_available']}")
print(f"降级启用: {status['fallback_enabled']}")
```

---

## 🎯 使用场景

### 场景1: 草莓病害检测

```typescript
{
  imageSource: 'camera',
  query: '草莓叶片上的黄褐色病害斑点',
  confidence: 0.75,
  sampleFrames: 1,
  visualize: true,
  outputVariable: 'disease_mask'
}
```

### 场景2: 果实成熟度分割

```typescript
{
  imageSource: 'camera',
  query: '红色成熟草莓',
  confidence: 0.8,
  sampleFrames: 3,
  visualize: true,
  outputVariable: 'ripe_strawberry_mask'
}
```

### 场景3: 批量图像处理

```python
from unipixel_client import UnipixelClient, BatchSegmentationTask

client = UnipixelClient()

tasks = [
    BatchSegmentationTask(
        task_id=f"task_{i}",
        image_base64=images[i],
        query="草莓",
        sample_frames=1
    )
    for i in range(10)
]

results = await client.batch_generate_masks(
    tasks,
    progress_callback=lambda done, total: print(f"{done}/{total}")
)
```

---

## 🔧 配置选项

### UniPixel客户端配置

```python
from unipixel_client import UnipixelClient

client = UnipixelClient(
    endpoint="http://localhost:8000/infer_unipixel_base64",
    timeout=30,           # 超时时间（秒）
    max_retries=3,        # 最大重试次数
    max_concurrent=3      # 最大并发数
)
```

### 降级管理器配置

```python
from segmentation_fallback_service import SegmentationFallbackManager

manager = SegmentationFallbackManager(
    unipixel_endpoint="http://localhost:8000/infer_unipixel_base64",
    check_interval=60,    # 健康检查间隔（秒）
    enable_fallback=True  # 是否启用降级
)
```

---

## 🐛 故障排查

### 问题1: UniPixel服务连接失败

**症状**: 节点显示错误，提示连接失败

**解决方案**:
1. 检查UniPixel服务是否运行
2. 验证端点配置是否正确
3. 检查网络连接
4. 查看后端日志

### 问题2: 降级服务不工作

**症状**: UniPixel不可用时没有自动降级

**解决方案**:
1. 确认 `enable_fallback=True`
2. 检查OpenCV是否正确安装
3. 查看Python日志

### 问题3: 分割结果不准确

**症状**: 分割掩码质量差

**解决方案**:
1. 调整 `confidence` 参数
2. 优化 `query` 描述（更具体）
3. 增加 `sampleFrames`（如果是视频）
4. 检查图像质量

---

## 📝 日志示例

### 成功执行（使用UniPixel）

```
🔍 调用Unipixel生成遮罩图 (尝试 1/3)
   查询: 草莓病害区域
✅ Unipixel生成成功 (耗时: 2.34秒)
```

### 降级执行（使用本地服务）

```
⚠️ UniPixel服务不可用
   将使用本地分割降级方案
🔧 使用本地分割服务处理: 草莓
✅ 本地分割完成
```

---

## 🎨 UI状态说明

| 状态 | 颜色 | 说明 |
|------|------|------|
| idle | 紫色 | 节点空闲，等待执行 |
| running | 橙色 | 正在执行分割 |
| success | 绿色 | 分割成功完成 |
| error | 红色 | 分割失败 |

---

## 📚 相关文档

- [完整实现报告](./UNIPIXEL_WORKFLOW_INTEGRATION_COMPLETE.md)
- [UniPixel客户端架构](./python/unipixel_client_architecture.html)
- [工作流节点系统](./WORKFLOW_NODE_SYSTEM_COMPLETE.md)

---

## 💡 最佳实践

1. **查询描述要具体**: "红色成熟草莓" 比 "草莓" 效果更好
2. **合理设置置信度**: 0.7-0.8 通常是好的起点
3. **启用降级**: 确保系统在UniPixel不可用时仍能工作
4. **监控性能**: 使用进度回调跟踪处理时间
5. **批量处理**: 对多个图像使用批量API提高效率

---

**更新日期**: 2025-10-20
