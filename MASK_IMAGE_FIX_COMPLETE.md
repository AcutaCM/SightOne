# 遮罩图显示问题 - 完整修复方案

## 问题分析

遮罩图无法在AI Analysis Report中正常显示的可能原因：

1. **后端未生成遮罩图** - unipixel服务未被调用
2. **数据格式问题** - base64数据缺少data URL前缀
3. **数据传输问题** - DiagnosisReport序列化或WebSocket传输时数据丢失
4. **前端渲染问题** - React组件未正确处理mask_image数据

## 已实施的修复

### 修复1: 在diagnose方法中添加data URL前缀检查

**文件**: `python/ai_diagnosis_service.py`

**位置**: `diagnose`方法中，创建DiagnosisReport之前

```python
# 确保遮罩图有正确的data URL前缀
if mask_base64:
    logger.info(f"📊 遮罩图数据检查:")
    logger.info(f"   存在: True")
    logger.info(f"   长度: {len(mask_base64)}")
    logger.info(f"   前50字符: {mask_base64[:50]}")
    
    if not mask_base64.startswith('data:image/'):
        mask_base64 = f"data:image/png;base64,{mask_base64}"
        logger.info(f"✅ 已为遮罩图添加data URL前缀")
    else:
        logger.info(f"✅ 遮罩图已有data URL前缀")
else:
    logger.warning(f"⚠️  遮罩图数据为空")
```

**作用**:
- 检查mask_base64是否存在
- 如果存在但缺少data URL前缀，自动添加
- 记录详细的调试日志

### 修复2: 前端已有自动添加前缀的逻辑

**文件**: `components/AIAnalysisReport.tsx`

**代码**:
```typescript
<img
  src={displayReport.mask_image.startsWith('data:') 
    ? displayReport.mask_image 
    : `data:image/png;base64,${displayReport.mask_image}`}
  alt="遮罩图"
  className="w-full h-auto"
  onError={(e) => {
    console.error('遮罩图加载失败:', displayReport.mask_image?.substring(0, 100));
    (e.target as HTMLImageElement).style.display = 'none';
  }}
/>
```

**作用**:
- 双重保险：即使后端没有添加前缀，前端也会添加
- 错误处理：加载失败时隐藏图片并记录日志

## 验证步骤

### 步骤1: 重启Python后端

```bash
# 停止当前运行的后端
# 然后重新启动
python drone-analyzer-nextjs/python/drone_backend.py
```

### 步骤2: 触发诊断流程

1. 打开前端应用
2. 打开浏览器开发者工具（F12）
3. 切换到Console标签
4. 启动AI诊断工作流

### 步骤3: 检查后端日志

在Python后端控制台中，查找以下日志：

```
🔍 阶段1: AI生成遮罩提示词...
✅ 遮罩提示词生成成功 (耗时: X.XX秒)
   提示词: [遮罩提示词内容]

🔍 阶段2: Unipixel生成遮罩图...
✅ 遮罩图生成成功，长度: [数字]

🔍 阶段3: AI生成诊断报告...
📊 遮罩图数据检查:
   存在: True
   长度: [数字]
   前50字符: data:image/png;base64,iVBORw0KGgoAAAANSUhEU...
✅ 遮罩图已有data URL前缀
```

**关键检查点**:
- ✅ 遮罩提示词生成成功
- ✅ 遮罩图生成成功
- ✅ 遮罩图数据存在且有正确前缀

### 步骤4: 检查前端控制台

在浏览器控制台中，查找以下信息：

```javascript
AIAnalysisReport收到诊断报告: {
  id: "diag_1_...",
  plant_id: 1,
  mask_image: "data:image/png;base64,...",
  mask_prompt: "...",
  ...
}
```

**关键检查点**:
- ✅ mask_image字段存在
- ✅ mask_image以"data:image/"开头
- ✅ mask_image长度大于100（不是空字符串）

### 步骤5: 检查DOM元素

1. 在浏览器开发者工具中切换到Elements标签
2. 找到遮罩图的img元素
3. 检查src属性

**预期结果**:
```html
<img 
  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEU..." 
  alt="遮罩图" 
  class="w-full h-auto"
>
```

## 故障排除

### 问题1: 后端日志显示"遮罩图数据为空"

**原因**: unipixel服务未被调用或调用失败

**解决方案**:
1. 检查是否有完整的诊断工作流代码
2. 确认unipixel_client是否正确初始化
3. 查看是否有unipixel API调用的错误日志

**需要检查的文件**:
- 查找调用`generate_mask`的代码
- 确认unipixel_client的配置

### 问题2: 前端控制台显示mask_image为null或undefined

**原因**: DiagnosisReport序列化问题或数据传输问题

**解决方案**:
1. 检查DiagnosisReport是否正确序列化
2. 确认WebSocket或HTTP响应中包含mask_image字段
3. 添加序列化日志：

```python
from dataclasses import asdict
report_dict = asdict(report)
logger.info(f"📤 报告数据: {list(report_dict.keys())}")
logger.info(f"   mask_image存在: {'mask_image' in report_dict}")
```

### 问题3: 图像显示为损坏的图标

**原因**: base64数据损坏或格式不正确

**解决方案**:
1. 检查base64数据是否完整
2. 验证base64数据是否是有效的PNG图像
3. 测试base64数据：

```python
import base64
from PIL import Image
import io

# 提取纯base64数据
if mask_base64.startswith('data:image/'):
    pure_base64 = mask_base64.split(',')[1]
else:
    pure_base64 = mask_base64

# 尝试解码
try:
    image_data = base64.b64decode(pure_base64)
    image = Image.open(io.BytesIO(image_data))
    logger.info(f"✅ 遮罩图验证成功: {image.size}, {image.format}")
except Exception as e:
    logger.error(f"❌ 遮罩图验证失败: {e}")
```

### 问题4: 控制台显示"遮罩图加载失败"

**原因**: img标签的src属性值不正确

**解决方案**:
1. 在浏览器控制台中手动测试：

```javascript
// 获取mask_image数据
const maskImage = displayReport.mask_image;
console.log('mask_image长度:', maskImage?.length);
console.log('mask_image前100字符:', maskImage?.substring(0, 100));

// 创建测试图片
const testImg = document.createElement('img');
testImg.src = maskImage;
testImg.onload = () => console.log('✅ 测试图片加载成功');
testImg.onerror = (e) => console.error('❌ 测试图片加载失败', e);
document.body.appendChild(testImg);
```

## 完整的诊断工作流检查清单

### 后端检查
- [ ] unipixel_client已正确初始化
- [ ] generate_mask方法被调用
- [ ] generate_mask返回有效的base64数据
- [ ] diagnose方法接收到mask_base64参数
- [ ] mask_base64添加了data URL前缀
- [ ] DiagnosisReport正确创建
- [ ] DiagnosisReport正确序列化为JSON
- [ ] 数据通过WebSocket/HTTP发送给前端

### 前端检查
- [ ] diagnosis_complete事件被触发
- [ ] 事件数据包含mask_image字段
- [ ] mask_image不为null/undefined
- [ ] mask_image有正确的data URL前缀
- [ ] img标签的src属性设置正确
- [ ] 没有图像加载错误

## 测试用例

### 测试1: 最小可行测试

创建一个1x1像素的测试图像：

```python
# 在Python中
import base64

# 1x1像素的PNG图像（红色）
test_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
test_data_url = f"data:image/png;base64,{test_png}"

# 创建测试报告
test_report = DiagnosisReport(
    id="test_001",
    plant_id=999,
    timestamp=datetime.now().isoformat(),
    original_image=test_data_url,
    mask_image=test_data_url,  # 使用相同的测试图像
    mask_prompt="测试遮罩",
    markdown_report="# 测试报告",
    summary="测试摘要",
    severity="low",
    diseases=["测试病害"],
    recommendations=["测试建议"],
    ai_model="test-model",
    confidence=0.99,
    processing_time=0.1
)

logger.info(f"✅ 测试报告创建成功")
logger.info(f"   mask_image: {test_report.mask_image[:80]}")
```

### 测试2: 前端独立测试

在浏览器控制台中：

```javascript
// 创建测试报告
const testReport = {
  id: 'test_001',
  plant_id: 999,
  timestamp: new Date().toISOString(),
  original_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  mask_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  mask_prompt: '测试遮罩',
  markdown_report: '# 测试报告',
  summary: '测试摘要',
  severity: 'low',
  diseases: ['测试病害'],
  recommendations: ['测试建议'],
  ai_model: 'test-model',
  confidence: 0.99,
  processing_time: 0.1
};

// 触发事件
const event = new CustomEvent('diagnosis_complete', { detail: testReport });
window.dispatchEvent(event);

console.log('✅ 测试事件已触发');
```

## 预期结果

修复完成后，应该看到：

1. **后端日志**:
   ```
   ✅ 遮罩提示词生成成功
   ✅ 遮罩图生成成功
   ✅ 遮罩图已有data URL前缀
   ✅ 诊断报告生成成功
   ```

2. **前端控制台**:
   ```
   AIAnalysisReport收到诊断报告: {...}
   mask_image存在: true
   ```

3. **浏览器显示**:
   - 原始图像正常显示
   - 遮罩图正常显示
   - 没有图像加载错误

## 下一步

如果遮罩图仍然无法显示，请提供：

1. 后端完整日志（特别是遮罩图相关的部分）
2. 前端控制台的完整输出
3. 浏览器Network标签中的相关请求
4. DiagnosisReport对象的完整JSON数据

这将帮助我们进一步诊断问题。
