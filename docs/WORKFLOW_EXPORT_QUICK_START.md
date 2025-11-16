# 工作流导出 - 快速开始

## 🚀 快速导出

### 方法 1: 导出全部节点

1. 点击画布右上角的 **导出按钮** (下载图标)
2. 选择 **PNG 图片** 或 **SVG 矢量图**
3. 文件自动下载 ✅

### 方法 2: 导出选中节点

1. 在画布上 **选中节点** (单击或框选)
2. 点击 **导出按钮**
3. 选择 **PNG 图片 (选中)** 或 **SVG 矢量图 (选中)**
4. 文件自动下载 ✅

## 📋 导出选项

| 选项 | 说明 | 适用场景 |
|------|------|----------|
| PNG 图片 | 位图格式,高分辨率 | 文档、演示、分享 |
| SVG 矢量图 | 矢量格式,可缩放 | 打印、编辑、高质量展示 |
| 全部节点 | 导出整个工作流 | 完整工作流导出 |
| 选中节点 | 仅导出选中部分 | 导出特定模块 |

## 🎨 导出效果

### PNG 导出
- ✅ 高分辨率 (2x pixel ratio)
- ✅ 透明背景或主题背景
- ✅ 适合分享和文档

### SVG 导出
- ✅ 矢量格式,无限缩放
- ✅ 文件体积小
- ✅ 适合打印和编辑

## ⚙️ 导出设置

```typescript
// 自动配置
{
  backgroundColor: theme === 'light' ? '#f8fafc' : '#0a0f1e',
  padding: 40,           // 节点周围空白
  quality: 1,            // 最高质量
  pixelRatio: 2,         // 高分辨率
}
```

## 🔧 使用示例

### 在代码中使用

```typescript
import { exportWorkflow } from '@/lib/workflow/workflowExporter';
import { useReactFlow } from 'reactflow';

function MyComponent() {
  const { getNodes } = useReactFlow();
  
  const handleExport = async () => {
    const nodes = getNodes();
    
    // 导出为 PNG
    await exportWorkflow(nodes, 'png', {
      backgroundColor: '#f8fafc',
      padding: 40,
      filename: 'my-workflow',
    });
  };
  
  return <button onClick={handleExport}>导出</button>;
}
```

### 使用导出按钮组件

```tsx
import ExportButton from '@/components/workflow/ExportButton';

// 工具栏中使用
<ExportButton iconOnly position="toolbar" />

// 独立使用
<ExportButton position="standalone" />
```

## ❗ 常见问题

### Q: 导出的图片是空白的?
**A:** 等待页面完全加载后再导出,或刷新页面重试。

### Q: 如何导出高质量图片?
**A:** 使用 SVG 格式,或确保浏览器缩放为 100%。

### Q: 导出速度慢?
**A:** 使用 "仅导出选中" 功能,或分批导出大型工作流。

### Q: 导出失败?
**A:** 检查是否有节点,查看浏览器控制台错误信息。

## 📦 文件命名

导出文件自动命名:
```
workflow-{timestamp}.png
workflow-{timestamp}.svg
```

例如: `workflow-1730172000000.png`

## 🎯 最佳实践

1. **导出前准备**
   - 使用 "适应视图" 优化布局
   - 确保所有节点可见

2. **选择合适格式**
   - 文档/分享 → PNG
   - 打印/编辑 → SVG

3. **导出部分工作流**
   - 选中特定节点
   - 使用 "仅导出选中"

4. **文件管理**
   - 导出后重命名文件
   - 按项目组织文件

## 🌐 浏览器支持

- ✅ Chrome/Edge ≥ 90
- ✅ Firefox ≥ 88
- ✅ Safari ≥ 14
- ❌ Internet Explorer

## 📚 相关文档

- [完整导出指南](./WORKFLOW_EXPORT_GUIDE.md)
- [工作流编辑器](./WORKFLOW_QUICK_START.md)
- [主题系统](./WORKFLOW_THEME_SYSTEM_IMPLEMENTATION.md)

## 🎉 开始使用

现在就试试导出你的工作流吧!

1. 打开工作流编辑器
2. 创建或加载工作流
3. 点击导出按钮
4. 选择格式和范围
5. 下载完成! 🎊
