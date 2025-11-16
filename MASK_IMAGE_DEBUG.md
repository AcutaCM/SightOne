# 遮罩图显示问题调试指南

## 问题描述
AI Analysis Report中的遮罩图无法正常显示

## 可能的原因

### 1. 遮罩图数据未生成
- 检查后端是否调用了unipixel生成遮罩图
- 检查unipixel_client是否正常工作

### 2. 遮罩图数据格式问题
- unipixel返回的是纯base64字符串
- 需要添加`data:image/png;base64,`前缀
- 前端代码已经有自动添加前缀的逻辑

### 3. 遮罩图数据传递问题
- DiagnosisReport中mask_image字段可能为None
- 数据序列化时可能丢失
- WebSocket传输时可能被截断

## 调试步骤

### 步骤1: 检查后端日志
查看Python后端日志中是否有：
```
✅ 遮罩图生成成功，长度: [数字]
```

如果没有这条日志，说明遮罩图根本没有生成。

### 步骤2: 检查DiagnosisReport对象
在`ai_diagnosis_service.py`的`diagnose`方法中，添加调试日志：

```python
logger.info(f"📊 DiagnosisReport创建:")
logger.info(f"   mask_image存在: {mask_base64 is not None}")
logger.info(f"   mask_image长度: {len(mask_base64) if mask_base64 else 0}")
logger.info(f"   mask_image前缀: {mask_base64[:50] if mask_base64 else 'None'}")
```

### 步骤3: 检查前端接收的数据
在浏览器控制台中，查看`diagnosis_complete`事件的数据：

```javascript
window.addEventListener('diagnosis_complete', (event) => {
  console.log('诊断报告数据:', event.detail);
  console.log('mask_image存在:', !!event.detail.mask_image);
  console.log('mask_image长度:', event.detail.mask_image?.length);
  console.log('mask_image前50字符:', event.detail.mask_image?.substring(0, 50));
});
```

### 步骤4: 检查img标签
在浏览器开发者工具中：
1. 找到遮罩图的img元素
2. 查看src属性的值
3. 查看是否有错误信息

## 快速修复方案

### 方案1: 确保遮罩图有data URL前缀

在`ai_diagnosis_service.py`的`diagnose`方法中，在创建DiagnosisReport之前添加：

```python
# 确保遮罩图有正确的data URL前缀
if mask_base64 and not mask_base64.startswith('data:image/'):
    mask_base64 = f"data:image/png;base64,{mask_base64}"
    logger.info(f"✅ 已为遮罩图添加data URL前缀")
```

### 方案2: 在unipixel_client中直接返回完整的data URL

修改`unipixel_client.py`的`generate_mask`方法：

```python
# 返回完整的data URL
base64_str = base64.b64encode(response.content).decode('utf-8')
return f"data:image/png;base64,{base64_str}"
```

### 方案3: 检查DiagnosisReport序列化

确保DiagnosisReport正确序列化为JSON。在发送给前端之前：

```python
from dataclasses import asdict

report_dict = asdict(report)
logger.info(f"📤 发送报告数据:")
logger.info(f"   mask_image存在: {'mask_image' in report_dict and report_dict['mask_image'] is not None}")
```

## 测试方法

### 创建测试脚本

```python
# test_mask_image.py
import base64

# 模拟unipixel返回的纯base64
mock_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# 测试1: 纯base64
print("纯base64:", mock_base64[:50])

# 测试2: 添加data URL前缀
data_url = f"data:image/png;base64,{mock_base64}"
print("Data URL:", data_url[:80])

# 测试3: 检查是否以data:开头
print("以data:开头:", data_url.startswith('data:'))
```

### 在浏览器中测试

```javascript
// 在浏览器控制台中运行
const testBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const dataUrl = `data:image/png;base64,${testBase64}`;

const img = document.createElement('img');
img.src = dataUrl;
img.onload = () => console.log('✅ 图像加载成功');
img.onerror = () => console.log('❌ 图像加载失败');
document.body.appendChild(img);
```

## 预期结果

正确配置后，应该看到：
1. 后端日志显示遮罩图生成成功
2. 前端控制台显示mask_image数据存在
3. 浏览器中遮罩图正常显示
4. 没有图像加载错误

## 常见错误

### 错误1: mask_image为null
**原因**: 遮罩图没有生成或生成失败
**解决**: 检查unipixel_client的调用和返回值

### 错误2: 图像加载失败
**原因**: base64数据格式不正确
**解决**: 确保有正确的data URL前缀

### 错误3: 图像显示为空白
**原因**: base64数据被截断或损坏
**解决**: 检查数据传输过程，确保完整性

### 错误4: 控制台显示"遮罩图加载失败"
**原因**: img标签的src属性值不正确
**解决**: 检查前端代码中的data URL拼接逻辑
