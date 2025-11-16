# SIGHT ONE AI诊断功能使用指南

## 📖 概述

SIGHT ONE AI诊断功能是一个智能植株健康诊断系统，通过AI视觉分析和Unipixel图像分割技术，为植株提供专业的健康诊断报告。

---

## 🚀 快速开始

### 1. 配置AI模型

在使用AI诊断功能之前，需要先配置AI模型：

1. 打开PureChat配置界面
2. 选择支持视觉功能的AI模型：
   - **OpenAI**: gpt-4-vision-preview, gpt-4o, gpt-4o-mini
   - **Anthropic**: claude-3-opus, claude-3-sonnet, claude-3-5-sonnet
   - **Google**: gemini-pro-vision, gemini-1.5-pro
3. 输入API密钥和端点
4. 保存配置

### 2. 启动诊断工作流

1. 连接无人机
2. 在检测控制面板中，点击"启动诊断工作流"
3. 系统会自动启用QR检测（诊断的必需依赖）

### 3. 扫描植株QR码

1. 确保植株上有QR码标签（格式：`plant_123` 或 `植株ID:123`）
2. 无人机飞行时会自动检测QR码
3. 检测到植株ID后，系统会自动触发诊断流程

### 4. 查看诊断报告

1. 诊断完成后，会在AI分析管理器中显示报告
2. 点击报告卡片查看详细内容
3. 可以导出为PDF或HTML格式

---

## 🔧 功能详解

### AI诊断流程

诊断流程分为三个阶段：

#### 阶段1: AI生成遮罩提示词 (33%)
- AI分析植株图像，识别病害或异常区域
- 生成精确的描述，用于指导图像分割
- 示例输出："叶片上的黄褐色斑点区域"

#### 阶段2: Unipixel生成遮罩图 (66%)
- 使用AI生成的提示词调用Unipixel服务
- 生成病害区域的遮罩图
- 如果Unipixel不可用，会跳过此步骤继续诊断

#### 阶段3: AI生成最终诊断报告 (100%)
- AI基于原图、遮罩图和所有上下文生成完整报告
- 报告包含：
  - 诊断摘要
  - 病害识别
  - 严重程度评估
  - 详细分析
  - 建议措施
  - 预防措施

### 诊断报告内容

每份诊断报告包含：

- **基本信息**
  - 植株ID
  - 诊断时间
  - 严重程度（低/中/高）

- **图像数据**
  - 原始植株图像
  - 病害遮罩图（如果生成）
  - AI识别的病害部位描述

- **诊断结果**
  - Markdown格式的详细报告
  - 病害列表
  - 建议措施列表

- **元数据**
  - 使用的AI模型
  - 诊断置信度
  - 处理时间

### 冷却机制

为避免重复诊断，系统实现了冷却机制：

- **默认冷却时间**: 30秒
- **作用**: 同一植株ID在冷却期内不会重复触发诊断
- **提示**: 冷却期内检测到QR码会显示剩余时间

---

## 📊 报告管理

### 查看报告

1. 打开AI分析管理器
2. 报告按时间倒序排列
3. 点击报告卡片查看详情

### 导出报告

#### 导出单个报告
1. 在报告卡片上点击"PDF"或"HTML"按钮
2. 文件会自动下载

#### 批量导出
1. 点击顶部的"导出PDF"或"导出HTML"按钮
2. 所有报告会合并为一个文件

### 删除报告

- **删除单个**: 点击报告卡片上的"删除"按钮
- **清空全部**: 点击顶部的"清空全部"按钮

---

## ⚙️ 配置选项

### AI模型配置

通过WebSocket消息发送配置：

```typescript
sendAIConfig({
  provider: 'openai',
  model: 'gpt-4-vision-preview',
  api_key: 'sk-...',
  api_base: 'https://api.openai.com/v1',
  max_tokens: 2000,
  temperature: 0.7
});
```

### Unipixel配置

Unipixel服务默认运行在 `http://localhost:8000`

如需修改端点，可以在配置中指定：

```typescript
{
  unipixel_endpoint: 'http://localhost:8000/infer_unipixel_base64'
}
```

---

## 🐛 故障排除

### 问题1: 未配置AI模型

**症状**: 显示"未配置AI模型"错误

**解决方案**:
1. 打开PureChat配置
2. 配置支持视觉的AI模型
3. 确保API密钥正确

### 问题2: 模型不支持视觉

**症状**: 显示"模型不支持视觉功能"错误

**解决方案**:
1. 检查当前使用的模型
2. 切换到支持视觉的模型（见快速开始部分）

### 问题3: Unipixel服务不可用

**症状**: 诊断报告中没有遮罩图

**解决方案**:
1. 检查Unipixel服务是否运行
2. 确认端点配置正确
3. 注意：即使Unipixel不可用，诊断仍会继续

### 问题4: 诊断超时

**症状**: 显示"诊断超时"错误

**解决方案**:
1. 检查网络连接
2. 确认AI API服务正常
3. 尝试使用更快的模型

### 问题5: QR码检测不到

**症状**: 无法触发诊断

**解决方案**:
1. 确保QR码清晰可见
2. 检查QR码格式是否正确
3. 调整无人机与QR码的距离
4. 确保光线充足

---

## 📝 最佳实践

### 1. 图像质量

- 确保植株图像清晰
- 光线充足，避免阴影
- 尽量包含完整的植株
- 避免背景杂乱

### 2. QR码放置

- QR码应放置在植株附近
- 确保QR码平整、清晰
- 避免QR码被遮挡
- 使用标准格式：`plant_123`

### 3. 诊断频率

- 遵守冷却时间限制
- 避免频繁重复诊断同一植株
- 定期清理旧报告

### 4. 报告管理

- 及时导出重要报告
- 定期备份诊断数据
- 清理不需要的报告

---

## 🔐 隐私和安全

### 数据存储

- 诊断报告存储在浏览器localStorage中
- 图像数据以base64格式存储
- 不会自动上传到云端

### API密钥安全

- API密钥通过WebSocket传输
- 后端代理所有AI API调用
- 前端不直接暴露API密钥

---

## 📚 技术参考

### WebSocket消息

#### 发送AI配置
```json
{
  "type": "set_ai_config",
  "data": {
    "provider": "openai",
    "model": "gpt-4-vision-preview",
    "api_key": "sk-...",
    "api_base": "https://api.openai.com/v1"
  }
}
```

#### 诊断进度消息
```json
{
  "type": "diagnosis_progress",
  "data": {
    "plant_id": 2,
    "stage": "generating_mask_prompt",
    "message": "AI正在分析病害部位...",
    "progress": 33
  }
}
```

#### 诊断完成消息
```json
{
  "type": "diagnosis_complete",
  "data": {
    "plant_id": 2,
    "report": {
      "id": "diag_2_1234567890",
      "plant_id": 2,
      "timestamp": "2025-10-13T10:30:00",
      "original_image": "data:image/png;base64,...",
      "mask_image": "data:image/png;base64,...",
      "mask_prompt": "叶片上的黄褐色斑点区域",
      "markdown_report": "## 诊断摘要\n...",
      "summary": "检测到轻微叶斑病",
      "severity": "low",
      "diseases": ["叶斑病"],
      "recommendations": ["增加通风", "减少浇水"],
      "ai_model": "gpt-4-vision-preview",
      "confidence": 0.85,
      "processing_time": 12.5
    }
  }
}
```

---

## 🆘 获取帮助

如果遇到问题：

1. 查看本指南的故障排除部分
2. 检查浏览器控制台的错误信息
3. 查看后端日志
4. 联系技术支持

---

## 📄 许可证

SIGHT ONE AI诊断功能是SIGHT ONE项目的一部分。

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-13  
**适用版本**: SIGHT ONE v1.0+
