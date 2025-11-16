# 如何使用AI分析管理器

## 已完成的修复

✅ AIAnalysisManager已添加到组件选择器中

## 使用方法

### 方法1: 通过组件选择器（推荐）

1. 打开Tello控制页面
2. 点击右上角的组件选择器按钮（四个方块图标）
3. 在弹出的组件列表中找到"AI分析管理器"
4. 点击选择，组件会自动添加到页面上
5. 可以拖拽和调整大小

### 方法2: 直接导入使用

如果你想在特定页面直接使用AIAnalysisManager，可以这样导入：

```typescript
import AIAnalysisManager from '@/components/AIAnalysisManager';

// 在你的组件中使用
<AIAnalysisManager />
```

## 组件功能

### 1. 自动接收诊断报告

AIAnalysisManager会自动监听诊断完成事件并接收报告：

```typescript
// 监听全局事件
window.addEventListener('diagnosis_complete', (event) => {
  // 自动添加报告到列表
});
```

### 2. 报告列表

- 显示所有诊断报告
- 按时间倒序排列
- 显示植株ID、时间、严重程度
- 点击查看详情

### 3. 导出功能

**导出PDF**:
- 点击"导出PDF"按钮
- 自动生成包含所有报告的PDF文件
- 文件名: `diagnosis-reports-YYYY-MM-DD.pdf`

**导出HTML**:
- 点击"导出HTML"按钮
- 自动生成独立的HTML文件
- 文件名: `diagnosis-reports-YYYY-MM-DD.html`

### 4. 报告管理

- 查看报告详情
- 删除单个报告
- 清空所有报告
- 数据自动保存到localStorage

## 工作流程

```
1. 启动诊断工作流
   ↓
2. 扫描植株QR码
   ↓
3. 诊断完成
   ↓
4. 报告自动显示在AI分析管理器中 ✅
   ↓
5. 可以查看、导出、管理报告
```

## 组件选择器中的位置

**类别**: AI
**名称**: AI分析管理器
**描述**: 管理和导出诊断报告
**图标**: 📄 文档图标

## 数据持久化

报告会自动保存到浏览器的localStorage中：

```javascript
// 数据键名
localStorage.getItem('diagnosis_reports')

// 数据格式
[
  {
    id: "diag_3_1731654321",
    plant_id: 3,
    timestamp: "2025-11-15T10:30:00Z",
    markdown_report: "## 诊断摘要\n...",
    summary: "检测到轻微叶斑病",
    severity: "low",
    diseases: ["叶斑病"],
    recommendations: ["增加通风", "减少浇水"],
    ai_model: "qwen-vl-plus",
    confidence: 0.85,
    processing_time: 12.5,
    original_image: "data:image/png;base64,...",
    mask_image: "data:image/png;base64,...",
    mask_prompt: "叶片上的黄褐色斑点区域"
  }
]
```

## 清除数据

如果需要清除所有报告：

1. 在AI分析管理器中点击"清空"按钮
2. 或在浏览器控制台运行：
   ```javascript
   localStorage.removeItem('diagnosis_reports');
   location.reload();
   ```

## 故障排除

### 问题1: 组件选择器中找不到AI分析管理器

**解决**:
1. 刷新页面
2. 检查ComponentSelector.tsx是否包含ai-analysis-manager
3. 清除浏览器缓存

### 问题2: 报告没有自动显示

**解决**:
1. 打开浏览器控制台（F12）
2. 查找"收到诊断报告"日志
3. 确认AIAnalysisManager组件已挂载
4. 检查localStorage权限

### 问题3: 导出功能不工作

**解决**:
1. 确认有报告数据
2. 检查浏览器是否支持Blob下载
3. 查看控制台错误信息
4. 确认pdfExporter.ts和htmlExporter.ts文件存在

## 相关文件

- `components/AIAnalysisManager.tsx` - 主组件
- `components/ComponentSelector.tsx` - 组件选择器
- `lib/pdfExporter.ts` - PDF导出器
- `lib/htmlExporter.ts` - HTML导出器
- `hooks/useDroneControl.ts` - 事件触发

## 更新日期

2025-11-15

## 状态

✅ 已添加到组件选择器
✅ 自动接收诊断报告
✅ 导出功能可用
✅ 数据持久化
