# 🎭 演示报告生成器使用指南

## 📅 创建时间
**2025-10-13**

---

## 🎯 功能说明

演示报告生成器是一个用于快速生成诊断报告的工具，专门用于功能演示和测试。

### 特点

- ✅ 快速生成完整的诊断报告
- ✅ 支持三种严重程度（低/中/高）
- ✅ 自动生成演示图像（SVG）
- ✅ 包含完整的Markdown报告
- ✅ 自动保存到localStorage
- ✅ 支持HTML/PDF导出
- ✅ 使用HeroUI组件

---

## 🚀 使用方法

### 方法1: 访问演示页面

1. 启动前端应用
   ```bash
   cd drone-analyzer-nextjs
   npm run dev
   ```

2. 在浏览器中访问
   ```
   http://localhost:3000/demo-report
   ```

3. 使用演示报告生成器
   - 输入植株ID（例如：1, 2, 3）
   - 选择严重程度（低/中/高）
   - 点击"生成演示报告"按钮

### 方法2: 在其他页面中使用

```typescript
import DemoReportGenerator from '@/components/DemoReportGenerator';

function MyPage() {
  const handleReportGenerated = (report) => {
    console.log('新报告:', report);
    // 处理生成的报告
  };

  return (
    <DemoReportGenerator onReportGenerated={handleReportGenerated} />
  );
}
```

---

## 📊 生成的报告内容

### 报告结构

```typescript
{
  id: string;                    // 唯一ID
  plant_id: number;              // 植株ID
  timestamp: string;             // 时间戳
  original_image: string;        // 原始图像（SVG base64）
  mask_image: string;            // 遮罩图（SVG base64）
  mask_prompt: string;           // 遮罩提示词
  markdown_report: string;       // Markdown格式报告
  summary: string;               // 诊断摘要
  severity: 'low'|'medium'|'high'; // 严重程度
  diseases: string[];            // 病害列表
  recommendations: string[];     // 建议措施
  ai_model: string;              // AI模型名称
  confidence: number;            // 置信度（0-1）
  processing_time: number;       // 处理时间（秒）
}
```

### 不同严重程度的内容

#### 🟢 低严重度
- **病害**: 轻微叶片黄化
- **摘要**: 轻微症状，整体健康良好
- **建议**: 4条基础养护建议
- **置信度**: 75-90%

#### 🟡 中严重度
- **病害**: 叶斑病、营养不良
- **摘要**: 中度病害，需及时处理
- **建议**: 5条治疗和预防建议
- **置信度**: 80-95%

#### 🔴 高严重度
- **病害**: 茎腐病、根腐病、真菌感染
- **摘要**: 严重病害，需紧急处理
- **建议**: 6条紧急措施和隔离建议
- **置信度**: 85-95%

---

## 🎨 演示图像

### 原始图像
- 绿色渐变背景
- 显示植株ID
- 模拟植株形态（圆形）

### 遮罩图
- 深色背景
- 彩色遮罩区域
  - 低严重度：绿色
  - 中严重度：橙色
  - 高严重度：红色

---

## 📝 Markdown报告内容

生成的报告包含以下章节：

1. **诊断摘要** - 简要总结
2. **病害识别** - 识别到的病害列表
3. **严重程度** - 等级、置信度、影响范围
4. **详细分析**
   - 病害特征
   - 可能原因
   - 发展趋势
5. **建议措施**
   - 立即措施
   - 后续处理
6. **预防措施** - 6条预防建议

---

## 💾 数据存储

### localStorage

生成的报告自动保存到localStorage：

```javascript
// 键名
'diagnosis_reports'

// 数据格式
[
  { id: 'demo_1_1234567890', plant_id: 1, ... },
  { id: 'demo_2_1234567891', plant_id: 2, ... },
  ...
]
```

### 查看已保存的报告

在AI分析管理器中可以查看所有保存的报告，包括演示报告。

---

## 📤 导出功能

### HTML导出

```typescript
const { generateHTML } = await import('@/lib/htmlExporter');
const htmlBlob = await generateHTML([report]);
// 下载HTML文件
```

### PDF导出

```typescript
const { generatePDF } = await import('@/lib/pdfExporter');
const pdfBlob = await generatePDF([report]);
// 下载PDF文件
```

---

## 🎬 演示场景

### 场景1: 功能演示

1. 生成3个不同严重程度的报告
   - 植株1: 低严重度
   - 植株2: 中严重度
   - 植株3: 高严重度

2. 展示报告列表

3. 点击查看详细报告

4. 演示导出功能

### 场景2: 测试导出功能

1. 生成多个报告

2. 测试单个报告导出
   - 导出HTML
   - 导出PDF

3. 测试批量导出
   - 在AI分析管理器中批量导出

### 场景3: UI测试

1. 测试不同严重程度的视觉效果

2. 测试报告查看器的响应式布局

3. 测试图像显示

---

## 🔧 自定义

### 修改演示图像

编辑 `DemoReportGenerator.tsx` 中的 `generateDemoImage` 函数：

```typescript
const generateDemoImage = (type: 'original' | 'mask') => {
  // 自定义SVG内容
  return `data:image/svg+xml;base64,${btoa(`...`)}`;
};
```

### 修改报告内容

编辑以下函数：
- `getSampleMaskPrompt()` - 遮罩提示词
- `getSampleSummary()` - 诊断摘要
- `getSampleDiseases()` - 病害列表
- `getSampleRecommendations()` - 建议措施
- `generateMarkdownReport()` - 完整报告

---

## 📱 页面布局

### 演示页面 (`/demo-report`)

```
┌─────────────────────────────────────────────┐
│         SIGHT ONE 演示报告生成器             │
├──────────────────┬──────────────────────────┤
│                  │                          │
│  报告生成器       │    报告预览              │
│  - 植株ID输入    │    - 原图/遮罩图         │
│  - 严重程度选择  │    - 诊断摘要            │
│  - 生成按钮      │    - 元数据              │
│                  │    - 导出按钮            │
│  已生成报告列表  │                          │
│  - 报告1         │                          │
│  - 报告2         │                          │
│  - 报告3         │                          │
│                  │                          │
└──────────────────┴──────────────────────────┘
```

---

## 🎯 使用技巧

### 快速生成多个报告

1. 输入植株ID: 1
2. 选择严重程度: 低
3. 点击生成
4. 修改植株ID: 2
5. 选择严重程度: 中
6. 点击生成
7. 修改植株ID: 3
8. 选择严重程度: 高
9. 点击生成

现在你有3个不同的演示报告！

### 演示完整工作流

1. 生成报告
2. 在左侧列表中点击报告
3. 查看右侧预览
4. 点击"查看完整报告"
5. 在模态框中查看详细内容
6. 点击"导出PDF"或"导出HTML"

---

## 🐛 故障排除

### 报告未保存到localStorage

检查浏览器是否允许localStorage：
```javascript
console.log(localStorage.getItem('diagnosis_reports'));
```

### 图像未显示

SVG图像是内联生成的，应该总是可用。如果未显示，检查浏览器控制台错误。

### 导出失败

确保导出器文件存在：
- `lib/htmlExporter.ts`
- `lib/pdfExporter.ts`

---

## 📚 相关文件

- `components/DemoReportGenerator.tsx` - 报告生成器组件
- `app/demo-report/page.tsx` - 演示页面
- `components/DiagnosisReportViewer.tsx` - 报告查看器
- `lib/htmlExporter.ts` - HTML导出器
- `lib/pdfExporter.ts` - PDF导出器

---

## 🎉 总结

演示报告生成器让你可以：

- ✅ 快速生成演示数据
- ✅ 测试报告功能
- ✅ 演示完整工作流
- ✅ 验证导出功能
- ✅ 展示UI效果

**访问 http://localhost:3000/demo-report 开始使用！** 🚀
