# UniPixel 切割关键词生成指南

## 🎯 功能概述

VLM（视觉语言模型）在诊断植株病害时，不仅会生成诊断报告，还会自动生成**专门用于 UniPixel-3B 切割的精确关键词**，以便更准确地分割病害区域。

## 🔄 完整工作流

```
1. 📸 拍摄植株照片
   ↓
2. 🤖 VLM AI 诊断
   ├── 生成诊断报告（病害类型、严重程度、建议等）
   └── 🔥 生成切割关键词（"segmentation_keywords"）
   ↓
3. 🎯 UniPixel-3B 切割（使用关键词）
   ├── 接收：图像 + 切割关键词
   ├── 处理：精确分割病害区域
   └── 返回：病害遮罩图（Base64 PNG）
   ↓
4. 📊 生成完整报告
   ├── 诊断结果
   ├── 切割关键词（高亮显示）
   └── 对比图（原图 + 遮罩）
```

## 📋 JSON 格式说明

### VLM 返回格式
```json
{
  "plant_id": 123,
  "health_status": "患病",
  "confidence": 0.85,
  "diseases": [
    {
      "name": "叶斑病",
      "severity": "中度",
      "affected_parts": ["叶片"],
      "confidence": 0.82,
      "description": "叶片上出现褐色圆形斑点，边缘清晰"
    }
  ],
  "recommendations": [
    "移除受感染叶片",
    "喷洒铜基杀菌剂"
  ],
  "overall_assessment": "植株整体健康状况良好，但需及时处理叶斑病",
  "urgency": "中",
  "segmentation_keywords": "褐色圆形斑点"  // 🔥 关键：用于 UniPixel 切割
}
```

### 切割关键词要求

#### ✅ 好的示例
- `"腐烂的叶子"` - 直接描述视觉特征
- `"褐色圆形斑点"` - 具体、精确的外观描述
- `"枯萎的叶片边缘"` - 明确的位置和状态
- `"黄色斑块区域"` - 颜色 + 形状特征
- `"发黑的果实表面"` - 颜色变化 + 部位

#### ❌ 不好的示例
- `"叶斑病"` - 病害名称而非视觉描述
- `"病害"` - 过于笼统
- `"需要治疗的区域"` - 非视觉描述
- `"受影响部分"` - 不够具体

#### 📝 编写原则
1. **视觉优先**：描述你在图像中看到的，而非病害名称
2. **具体明确**：包含颜色、形状、位置等具体特征
3. **简洁精准**：5-15 个字，直击要点
4. **无需上下文**：单独阅读也能理解要切割什么

## 🔧 技术实现

### Python 后端（crop_diagnosis_workflow.py）

#### 1. 诊断提示词更新
```python
def _build_diagnosis_prompt(self, plant_id: int) -> str:
    return f"""你是一位专业的农作物病害诊断专家...

请按以下JSON格式返回诊断结果：
{{
  ...
  "segmentation_keywords": "用于图像分割的精确关键词描述"
}}

**重要说明**：
1. 如果检测到病害，必须在 "segmentation_keywords" 字段中提供关键词
2. 关键词应该描述病害的**视觉外观**，而非病害名称
3. 关键词格式：直接描述视觉特征，如 "腐烂的叶子"、"黄色斑块"
4. 这些关键词将直接用于 UniPixel-3B 模型进行精确切割
5. 如果未检测到病害，segmentation_keywords 设为空字符串
"""
```

#### 2. 关键词提取逻辑
```python
def _extract_disease_description(self, diagnosis_result: Dict) -> Optional[str]:
    # 🔥 优先使用专门的切割关键词
    segmentation_keywords = diagnosis_result.get('segmentation_keywords', '').strip()
    if segmentation_keywords:
        print(f"✅ 提取到 UniPixel 切割关键词: {segmentation_keywords}")
        return segmentation_keywords
    
    # 降级方案：从病害信息中提取
    diseases = diagnosis_result.get('diseases', [])
    if not diseases:
        return None
    
    first_disease = diseases[0]
    description = first_disease.get('description', '')
    
    return description if description else "病害区域"
```

#### 3. UniPixel 调用
```python
async def _call_unipixel_segmentation(
    self, 
    image_base64: str, 
    description: str  # 🔥 使用切割关键词
) -> Optional[str]:
    request_data = {
        "imageBase64": f"data:image/jpeg;base64,{image_base64}",
        "query": description,  # 切割关键词作为查询
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "http://localhost:8000/infer_unipixel_base64",
            json=request_data
        )
        result = response.json()
        return result.get('mask')
```

### 前端组件

#### PlantAnalysisWorkflow.tsx
```typescript
// 显示切割状态
const segKeywords = result.diseaseDescription || '';
const uniPixelStatus = hasUniPixelMask 
  ? `🎯 UniPixel-3B 病害区域切割已完成 (WSL FastAPI)\n   切割关键词: "${segKeywords}"` 
  : '';
```

#### ReportPanel.tsx
```tsx
{latest.segmentationMask && (
  <div>
    <Tag color="purple">🎯 UniPixel-3B 病害切割</Tag>
    {latest.diseaseDescription && (
      <div style={{ 
        color: "#a78bfa",
        backgroundColor: "rgba(167, 139, 250, 0.1)",
        padding: "4px 8px",
        borderRadius: 4
      }}>
        切割关键词: "{latest.diseaseDescription}"
      </div>
    )}
    <div>VLM 诊断自动生成精确关键词 → UniPixel-3B (WSL FastAPI) 切割</div>
    {/* 原图 + 遮罩对比 */}
  </div>
)}
```

## 📊 数据流示例

### 示例 1: 叶斑病

**输入图像**: 草莓叶片，有褐色斑点

**VLM 诊断结果**:
```json
{
  "diseases": [
    {
      "name": "叶斑病",
      "severity": "中度",
      "description": "叶片上出现多个褐色圆形斑点，直径约2-5mm"
    }
  ],
  "segmentation_keywords": "褐色圆形斑点"
}
```

**UniPixel 请求**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "query": "褐色圆形斑点"
}
```

**UniPixel 响应**:
```json
{
  "mask": "iVBORw0KGgoAAAANS...",
  "description": "Segmented brown circular spots"
}
```

### 示例 2: 叶片腐烂

**输入图像**: 番茄叶片，边缘发黑腐烂

**VLM 诊断结果**:
```json
{
  "diseases": [
    {
      "name": "晚疫病",
      "severity": "重度",
      "description": "叶片边缘出现黑褐色水渍状腐烂斑块"
    }
  ],
  "segmentation_keywords": "黑褐色腐烂边缘"
}
```

**UniPixel 请求**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "query": "黑褐色腐烂边缘"
}
```

## 🎯 优化建议

### VLM 模型选择
- **推荐**: GPT-4V, Claude 3 Opus, Gemini Pro Vision
- **原因**: 更好的视觉理解和精确描述能力

### 提示词优化
可以根据作物类型定制提示词：

```python
# 草莓专用
segmentation_prompt = """
常见草莓病害的视觉特征关键词示例：
- 灰霉病：灰白色霉层
- 白粉病：白色粉状物
- 叶斑病：褐色圆形斑点
- 炭疽病：黑色凹陷斑点

请参考以上格式生成关键词...
"""
```

### 关键词后处理
```python
def refine_keywords(keywords: str) -> str:
    """优化切割关键词"""
    # 移除不必要的修饰词
    keywords = keywords.replace('明显的', '').replace('可见的', '')
    
    # 标准化颜色描述
    color_map = {
        '深褐色': '褐色',
        '浅黄色': '黄色',
        # ...
    }
    for old, new in color_map.items():
        keywords = keywords.replace(old, new)
    
    return keywords.strip()
```

## 🐛 故障排除

### 问题 1: VLM 未生成切割关键词
**原因**: 模型未遵循 JSON 格式

**解决方案**:
```python
# 在提示词中强调
"必须包含 segmentation_keywords 字段，即使为空也要返回空字符串"

# 或使用降级方案
if not segmentation_keywords:
    segmentation_keywords = diagnosis_result.get('diseases', [{}])[0].get('description', '')
```

### 问题 2: 切割不准确
**原因**: 关键词不够精确

**解决方案**:
```python
# 在提示词中提供更具体的示例
"示例：
- 好: '叶片边缘的褐色枯萎区域'
- 差: '病害'

请生成类似第一种的精确描述..."
```

### 问题 3: 关键词过长
**原因**: VLM 生成了完整句子

**解决方案**:
```python
# 限制长度
if len(keywords) > 50:
    keywords = keywords[:50]

# 或在提示词中明确
"关键词应简洁（5-15字），直接描述视觉特征"
```

## 📈 效果评估

### 关键指标
1. **切割精度**: IoU (Intersection over Union)
2. **关键词质量**: 人工评分 (1-5)
3. **处理时间**: VLM 诊断 + UniPixel 切割总时长

### 示例评估
```python
# 评估脚本
def evaluate_segmentation_quality(
    ground_truth_mask: np.ndarray,
    predicted_mask: np.ndarray,
    keywords: str
) -> dict:
    iou = calculate_iou(ground_truth_mask, predicted_mask)
    keyword_score = rate_keyword_quality(keywords)  # 1-5
    
    return {
        'iou': iou,
        'keyword_score': keyword_score,
        'keywords': keywords,
        'pass': iou > 0.7 and keyword_score >= 3
    }
```

## 📚 相关文档

- [UniPixel-3B WSL 配置](./UNIPIXEL_WSL_SETUP.md)
- [诊断工作流文档](./DIAGNOSIS_WORKFLOW_WITH_SEGMENTATION.md)
- [VLM 配置指南](./VLM_CONFIGURATION_GUIDE.md)

## ✅ 检查清单

实现切割关键词功能后，请确认：

- [ ] VLM 提示词包含 `segmentation_keywords` 字段说明
- [ ] Python 后端正确提取切割关键词
- [ ] UniPixel 调用使用切割关键词而非病害名称
- [ ] 前端 PlantAnalysisWorkflow 显示切割关键词
- [ ] ReportPanel 高亮显示切割关键词
- [ ] 关键词符合视觉描述原则（非病害名称）
- [ ] 测试多种病害场景的切割效果
- [ ] 记录关键词质量和切割精度

---

**关键词驱动的精确切割！** 🎯

通过 VLM 自动生成精确的视觉描述关键词，UniPixel-3B 可以更准确地分割病害区域，为植株诊断提供更直观的可视化支持。

