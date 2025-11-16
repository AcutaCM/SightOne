# 工作流画布快速参考

## 快速开始

### 基础使用

```typescript
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import { useNodesState, useEdgesState } from 'reactflow';

function MyWorkflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <WorkflowCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  );
}
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` + 拖拽 | 平移画布 |
| `滚轮` | 缩放画布 |
| `Ctrl` + 点击 | 多选节点 |
| `Delete` | 删除选中节点 |
| `Ctrl` + `A` | 全选节点 |

## 工具栏功能

### 画布工具栏（右上角）

```
🔍- 缩小
📊 100% 缩放比例
🔍+ 放大
---
📐 适应视图
🔄 重置视图
```

### 对齐工具栏（顶部中央，选中2+节点时显示）

```
对齐:
├─ 左对齐
├─ 水平居中
├─ 右对齐
├─ 顶部对齐
├─ 垂直居中
└─ 底部对齐

分布: (选中3+节点时显示)
├─ 水平分布
└─ 垂直分布
```

## 组件 Props

### WorkflowCanvas

```typescript
interface WorkflowCanvasProps {
  // 必需
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  // 可选
  nodeTypes?: any;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  className?: string;
}
```

### CanvasToolbar

```typescript
interface CanvasToolbarProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showZoomLevel?: boolean;      // 默认: true
  showResetButton?: boolean;    // 默认: true
  showFitViewButton?: boolean;  // 默认: true
  showZoomControls?: boolean;   // 默认: true
}
```

### AlignmentToolbar

```typescript
interface AlignmentToolbarProps {
  className?: string;
  position?: 'top-left' | 'top-center' | 'top-right';
}
```

## 主题系统

### 使用主题

```typescript
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';

function MyComponent() {
  const { theme, tokens, toggleTheme } = useWorkflowTheme();
  
  return (
    <div style={{ 
      background: tokens.colors.canvas.background,
      color: tokens.colors.panel.text 
    }}>
      <button onClick={toggleTheme}>
        切换主题
      </button>
    </div>
  );
}
```

### 主题令牌

```typescript
// 颜色
tokens.colors.canvas.background
tokens.colors.canvas.grid
tokens.colors.node.background
tokens.colors.node.selectedBorder
tokens.colors.edge.default
tokens.colors.panel.background

// 间距
tokens.spacing.xs    // 4px
tokens.spacing.sm    // 8px
tokens.spacing.md    // 12px
tokens.spacing.lg    // 16px

// 圆角
tokens.radius.sm     // 8px
tokens.radius.md     // 12px
tokens.radius.lg     // 16px

// 阴影
tokens.shadows.sm
tokens.shadows.md
tokens.shadows.lg
```

## 对齐辅助

### 使用对齐函数

```typescript
import { 
  alignNodes, 
  distributeNodes,
  snapToGrid 
} from '@/lib/workflow/alignmentHelper';

// 对齐节点
const aligned = alignNodes(selectedNodes, 'left');

// 分布节点
const distributed = distributeNodes(selectedNodes, 'horizontal');

// 吸附到网格
const snapped = snapToGrid({ x: 123, y: 456 }, 20);
```

## 画布配置

### 缩放设置

```typescript
const canvasSettings = {
  minZoom: 0.5,    // 最小缩放 50%
  maxZoom: 2.0,    // 最大缩放 200%
  gridSize: 20,    // 网格大小 20px
  snapToGrid: true // 启用网格吸附
};
```

### 交互设置

```typescript
const interactionSettings = {
  zoomOnScroll: true,      // 滚轮缩放
  panOnDrag: true,         // 拖拽平移
  selectionOnDrag: true,   // 框选节点
  multiSelectionKeyCode: 'Control' // 多选按键
};
```

## CSS 变量

### 画布变量

```css
/* 背景 */
--wf-canvas-bg
--wf-canvas-grid
--wf-canvas-grid-dot

/* 节点 */
--wf-node-bg
--wf-node-border
--wf-node-selected-border
--wf-node-selected-glow

/* 边 */
--wf-edge-default
--wf-edge-selected
--wf-edge-animated

/* 面板 */
--wf-panel-bg
--wf-panel-border
--wf-panel-text
--wf-panel-hover
```

## 响应式断点

```typescript
const breakpoints = {
  mobile: 768,    // < 768px
  tablet: 1024,   // 768px - 1024px
  desktop: 1280   // > 1024px
};
```

### 移动端适配

```css
@media (max-width: 768px) {
  /* 工具栏简化 */
  /* 小地图隐藏 */
  /* 触摸优化 */
}
```

## 性能优化

### 大规模节点

```typescript
// 使用虚拟化（50+ 节点时）
const shouldVirtualize = nodes.length > 50;

// 使用 React.memo
const MemoizedNode = React.memo(CustomNode);

// 使用 useMemo 缓存
const memoizedNodes = useMemo(() => 
  nodes.map(transformNode), 
  [nodes]
);
```

### 动画优化

```typescript
// 使用 CSS transform
transform: translateX(10px);

// 使用 will-change
will-change: transform;

// 使用 requestAnimationFrame
requestAnimationFrame(() => {
  // 动画逻辑
});
```

## 常见问题

### Q: 如何自定义网格大小？

A: 修改 `snapGrid` 属性：

```typescript
<ReactFlow
  snapGrid={[30, 30]}  // 30px 网格
  snapToGrid={true}
/>
```

### Q: 如何禁用小地图？

A: 移除 MiniMap 组件或添加条件渲染：

```typescript
{showMiniMap && <MiniMap />}
```

### Q: 如何自定义工具栏位置？

A: 使用 `position` 属性：

```typescript
<CanvasToolbar position="bottom-left" />
```

### Q: 如何添加自定义节点类型？

A: 传递 `nodeTypes` 属性：

```typescript
const nodeTypes = {
  custom: CustomNode,
  special: SpecialNode,
};

<WorkflowCanvas nodeTypes={nodeTypes} />
```

## 调试技巧

### 查看当前缩放级别

```typescript
const { getZoom } = useReactFlow();
console.log('Current zoom:', getZoom());
```

### 查看选中节点

```typescript
const { getNodes } = useReactFlow();
const selected = getNodes().filter(n => n.selected);
console.log('Selected nodes:', selected);
```

### 查看画布边界

```typescript
const { getViewport } = useReactFlow();
console.log('Viewport:', getViewport());
```

## 相关文档

- [完整实现文档](./TASK_4_WORKFLOW_CANVAS_REDESIGN_COMPLETE.md)
- [主题系统文档](./WORKFLOW_THEME_SYSTEM_IMPLEMENTATION.md)
- [设计规范](../.kiro/specs/workflow-ui-redesign/design.md)
- [需求文档](../.kiro/specs/workflow-ui-redesign/requirements.md)

---

**最后更新:** 2025-01-XX
