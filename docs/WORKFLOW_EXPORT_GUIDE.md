# 工作流导出功能指南

## 概述

工作流导出功能允许用户将工作流图表导出为 PNG 或 SVG 格式的图片文件。此功能集成在画布工具栏中,提供了灵活的导出选项。

## 功能特性

### 支持的导出格式

1. **PNG 图片**
   - 位图格式,适合分享和文档
   - 高分辨率输出 (2x pixel ratio)
   - 支持透明背景或主题背景色

2. **SVG 矢量图**
   - 矢量格式,可无限缩放
   - 适合打印和高质量展示
   - 文件体积小

### 导出选项

1. **导出全部节点**
   - 导出工作流中的所有节点和连接
   - 自动计算最佳边界和布局

2. **仅导出选中节点**
   - 只导出当前选中的节点
   - 适合导出工作流的特定部分
   - 需要先选中至少一个节点

### 导出设置

- **背景颜色**: 自动根据当前主题设置
  - 明亮主题: `#f8fafc`
  - 暗黑主题: `#0a0f1e`
- **内边距**: 40px (节点周围的空白区域)
- **图片质量**: 最高质量 (PNG quality = 1)
- **分辨率**: 2x pixel ratio (高清输出)

## 使用方法

### 1. 从工具栏导出

1. 在工作流画布右上角找到导出按钮 (下载图标)
2. 点击按钮打开导出菜单
3. 选择导出格式和范围:
   - PNG 图片 (全部)
   - SVG 矢量图 (全部)
   - PNG 图片 (选中)
   - SVG 矢量图 (选中)
4. 文件将自动下载到浏览器默认下载位置

### 2. 导出选中节点

1. 在画布上选中要导出的节点
   - 单击节点选中单个
   - Ctrl+点击多选
   - 框选多个节点
2. 点击导出按钮
3. 选择 "仅导出选中节点" 选项
4. 选择导出格式

### 3. 文件命名

导出的文件自动命名为:
```
workflow-{timestamp}.png
workflow-{timestamp}.svg
```

例如: `workflow-1730172000000.png`

## 技术实现

### 核心组件

1. **workflowExporter.ts**
   - 导出逻辑实现
   - 使用 `html-to-image` 库
   - 支持 PNG 和 SVG 格式

2. **ExportButton.tsx**
   - 导出按钮组件
   - 下拉菜单界面
   - 错误处理和状态管理

3. **CanvasToolbar.tsx**
   - 集成导出按钮
   - 工具栏布局

### 导出流程

```typescript
// 1. 获取工作流节点
const nodes = getNodes();

// 2. 过滤节点 (如果只导出选中)
const nodesToExport = selectedOnly 
  ? nodes.filter(n => n.selected) 
  : nodes;

// 3. 计算导出边界
const bounds = calculateExportBounds(nodesToExport, padding);

// 4. 获取视口元素
const viewport = document.querySelector('.react-flow__viewport');

// 5. 导出为图片
const dataUrl = await toPng(viewport, {
  backgroundColor,
  width: bounds.width,
  height: bounds.height,
  quality: 1,
  pixelRatio: 2,
});

// 6. 下载文件
downloadImage(dataUrl, filename, 'png');
```

### 边界计算

```typescript
function calculateExportBounds(nodes, padding) {
  // 使用 React Flow 的 getRectOfNodes 获取节点边界
  const nodesBounds = getRectOfNodes(nodes);
  
  // 添加内边距
  return {
    x: nodesBounds.x - padding,
    y: nodesBounds.y - padding,
    width: nodesBounds.width + padding * 2,
    height: nodesBounds.height + padding * 2,
  };
}
```

## API 参考

### exportWorkflow()

导出工作流为指定格式。

```typescript
async function exportWorkflow(
  nodes: Node[],
  format: 'png' | 'svg',
  options?: ExportOptions
): Promise<void>
```

**参数:**
- `nodes`: 工作流节点数组
- `format`: 导出格式 ('png' 或 'svg')
- `options`: 导出选项 (可选)

**选项:**
```typescript
interface ExportOptions {
  backgroundColor?: string;  // 背景颜色
  width?: number;           // 图片宽度
  height?: number;          // 图片高度
  padding?: number;         // 内边距 (默认: 20)
  quality?: number;         // PNG 质量 (0-1, 默认: 1)
  selectedOnly?: boolean;   // 仅导出选中 (默认: false)
  filename?: string;        // 文件名 (默认: 'workflow')
}
```

### exportWorkflowAsPNG()

导出工作流为 PNG 图片。

```typescript
async function exportWorkflowAsPNG(
  nodes: Node[],
  options?: ExportOptions
): Promise<void>
```

### exportWorkflowAsSVG()

导出工作流为 SVG 矢量图。

```typescript
async function exportWorkflowAsSVG(
  nodes: Node[],
  options?: ExportOptions
): Promise<void>
```

### isExportSupported()

检查当前浏览器是否支持导出功能。

```typescript
function isExportSupported(): boolean
```

## 组件使用

### ExportButton 组件

```tsx
import ExportButton from '@/components/workflow/ExportButton';

// 工具栏中使用 (图标模式)
<ExportButton iconOnly position="toolbar" />

// 独立使用 (带文字)
<ExportButton position="standalone" />
```

**Props:**
```typescript
interface ExportButtonProps {
  className?: string;
  iconOnly?: boolean;        // 仅显示图标 (默认: false)
  position?: 'toolbar' | 'standalone';  // 位置样式
}
```

### 在 CanvasToolbar 中启用

```tsx
<CanvasToolbar 
  showExportButton={true}  // 显示导出按钮
  showZoomControls={true}
  showFitViewButton={true}
  showResetButton={true}
/>
```

## 错误处理

### 常见错误

1. **"工作流中没有节点"**
   - 原因: 画布上没有任何节点
   - 解决: 添加至少一个节点后再导出

2. **"请先选择要导出的节点"**
   - 原因: 选择了 "仅导出选中" 但没有选中节点
   - 解决: 先选中要导出的节点

3. **"Workflow viewport not found"**
   - 原因: React Flow 视口元素未找到
   - 解决: 确保在 React Flow 组件加载完成后使用导出功能

4. **"Failed to export workflow"**
   - 原因: 导出过程中发生错误
   - 解决: 检查浏览器控制台获取详细错误信息

### 错误提示

导出失败时,会在屏幕右下角显示错误提示:
- 红色背景
- 错误图标
- 错误消息
- 3秒后自动消失

## 浏览器兼容性

### 支持的浏览器

- ✅ Chrome/Edge ≥ 90
- ✅ Firefox ≥ 88
- ✅ Safari ≥ 14
- ❌ Internet Explorer (不支持)

### 功能检测

导出按钮会自动检测浏览器支持:
```typescript
const exportSupported = isExportSupported();
// 如果不支持,按钮不会显示
```

## 性能优化

### 大型工作流

对于包含大量节点的工作流:
1. 导出可能需要几秒钟时间
2. 显示加载动画指示进度
3. 使用 2x pixel ratio 确保高质量

### 内存管理

- 导出完成后自动清理临时数据
- 使用 Blob URL 避免内存泄漏
- 下载完成后释放资源

## 样式定制

### 主题适配

导出的图片自动适配当前主题:
```typescript
const backgroundColor = theme === 'light' 
  ? tokens.colors.canvas.background  // #f8fafc
  : tokens.colors.canvas.background; // #0a0f1e
```

### 自定义样式

可以通过 CSS 模块自定义导出按钮样式:
```css
/* ExportButton.module.css */
.button {
  /* 自定义按钮样式 */
}

.menu {
  /* 自定义菜单样式 */
}
```

## 最佳实践

### 1. 导出前准备

- 调整画布视图,确保所有节点可见
- 使用 "适应视图" 功能优化布局
- 检查节点连接是否正确

### 2. 选择合适的格式

- **PNG**: 用于文档、演示、分享
- **SVG**: 用于打印、编辑、高质量展示

### 3. 导出部分工作流

- 使用 "仅导出选中" 功能
- 适合导出工作流的特定模块
- 减小文件大小

### 4. 文件管理

- 导出后重命名文件为有意义的名称
- 按项目或日期组织导出的文件
- 定期清理不需要的导出文件

## 快捷键

目前导出功能没有专用快捷键,但可以通过以下方式快速访问:
1. 点击工具栏导出按钮
2. 使用键盘 Tab 导航到导出按钮
3. 按 Enter 打开菜单
4. 使用方向键选择选项

## 故障排除

### 导出的图片是空白的

**可能原因:**
- 节点未完全渲染
- CSS 样式未加载

**解决方法:**
- 等待页面完全加载后再导出
- 刷新页面重试

### 导出的图片质量不佳

**可能原因:**
- 浏览器缩放设置
- 显示器分辨率

**解决方法:**
- 将浏览器缩放设置为 100%
- 使用 SVG 格式获得最佳质量

### 导出速度慢

**可能原因:**
- 工作流节点过多
- 浏览器性能限制

**解决方法:**
- 使用 "仅导出选中" 功能
- 分批导出大型工作流
- 关闭其他浏览器标签页

## 更新日志

### v1.0.0 (2024-10-29)
- ✨ 初始版本
- ✅ 支持 PNG 和 SVG 导出
- ✅ 支持全部/选中节点导出
- ✅ 主题自适应
- ✅ 错误处理和提示
- ✅ 高分辨率输出

## 相关文档

- [工作流编辑器指南](./WORKFLOW_QUICK_START.md)
- [工作流主题系统](./WORKFLOW_THEME_SYSTEM_IMPLEMENTATION.md)
- [React Flow 文档](https://reactflow.dev/)
- [html-to-image 文档](https://github.com/bubkoo/html-to-image)

## 反馈和支持

如有问题或建议,请:
1. 查看本文档的故障排除部分
2. 检查浏览器控制台错误信息
3. 联系开发团队获取支持
