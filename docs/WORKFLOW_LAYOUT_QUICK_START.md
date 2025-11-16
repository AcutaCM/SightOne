# WorkflowEditorLayout 快速开始

## 5 分钟快速上手

### 1. 最简单的使用

```tsx
import WorkflowEditorLayout from '@/components/workflow/WorkflowEditorLayout';

export default function MyPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorkflowEditorLayout
        canvas={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%' 
          }}>
            <h1>我的工作流画布</h1>
          </div>
        }
      />
    </div>
  );
}
```

### 2. 添加侧边栏

```tsx
<WorkflowEditorLayout
  nodeLibrary={
    <div style={{ padding: '16px' }}>
      <h3>节点库</h3>
      <p>拖拽节点到画布</p>
    </div>
  }
  canvas={
    <div>画布内容</div>
  }
  controlPanel={
    <div style={{ padding: '16px' }}>
      <h3>控制面板</h3>
      <button>运行</button>
    </div>
  }
/>
```

### 3. 监听布局变化

```tsx
function MyPage() {
  const handleLayoutChange = (state) => {
    console.log('布局状态:', state);
    // state.isNodeLibraryCollapsed
    // state.isControlPanelCollapsed
    // state.nodeLibraryWidth
    // state.controlPanelWidth
  };

  return (
    <WorkflowEditorLayout
      canvas={<div>画布</div>}
      onLayoutChange={handleLayoutChange}
    />
  );
}
```

### 4. 设置初始状态

```tsx
<WorkflowEditorLayout
  canvas={<div>画布</div>}
  initialState={{
    isNodeLibraryCollapsed: true,  // 初始折叠节点库
    isControlPanelCollapsed: false,
    nodeLibraryWidth: 320,
    controlPanelWidth: 400,
  }}
/>
```

### 5. 查看完整示例

```tsx
import { WorkflowEditorLayoutExample } from '@/components/workflow/WorkflowEditorLayoutExample';

export default function TestPage() {
  return <WorkflowEditorLayoutExample />;
}
```

## 常用配置

### 禁用持久化

```tsx
<WorkflowEditorLayout
  canvas={<div>画布</div>}
  persistLayout={false}  // 不保存到 localStorage
/>
```

### 自定义存储键

```tsx
<WorkflowEditorLayout
  canvas={<div>画布</div>}
  storageKey="my-custom-key"  // 自定义 localStorage 键名
/>
```

### 只显示画布和一个侧边栏

```tsx
// 只显示画布和控制面板
<WorkflowEditorLayout
  canvas={<div>画布</div>}
  controlPanel={<div>控制面板</div>}
  // 不传 nodeLibrary
/>
```

## 响应式行为

布局会自动适配屏幕尺寸:

- **桌面端 (>1024px)**: 三栏布局,可拖拽调整宽度
- **平板端 (768-1024px)**: 三栏布局,侧边栏宽度缩小
- **移动端 (<768px)**: 抽屉式侧边栏,显示遮罩层

## 主题支持

布局自动适配系统主题 (明亮/暗黑):

```tsx
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';

function MyPage() {
  const { theme, toggleTheme } = useWorkflowTheme();
  
  return (
    <>
      <button onClick={toggleTheme}>
        切换主题 (当前: {theme})
      </button>
      <WorkflowEditorLayout
        canvas={<div>画布</div>}
      />
    </>
  );
}
```

## 键盘快捷键

- `Tab`: 在可交互元素间导航
- `Enter/Space`: 激活折叠按钮
- `Escape`: 关闭移动端抽屉 (待实现)

## 样式定制

### 使用 CSS 变量

```css
/* 在你的 CSS 文件中 */
:root {
  --wf-panel-bg: #your-color;
  --wf-panel-border: #your-color;
  --wf-panel-text: #your-color;
}
```

### 覆盖组件样式

```tsx
<div className="my-custom-layout">
  <WorkflowEditorLayout
    canvas={<div>画布</div>}
  />
</div>
```

```css
/* 在你的 CSS 文件中 */
.my-custom-layout :global(.sidebar) {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
```

## 常见问题

### Q: 为什么侧边栏不显示?

A: 确保父容器有明确的高度:

```tsx
<div style={{ height: '100vh' }}>
  <WorkflowEditorLayout ... />
</div>
```

### Q: 如何在移动端触发侧边栏?

A: 通过状态控制:

```tsx
const [state, setState] = useState({
  isNodeLibraryCollapsed: true,
  isControlPanelCollapsed: true,
  nodeLibraryWidth: 280,
  controlPanelWidth: 360,
});

// 在按钮点击时
<button onClick={() => setState(prev => ({
  ...prev,
  isNodeLibraryCollapsed: false
}))}>
  打开节点库
</button>

<WorkflowEditorLayout
  initialState={state}
  onLayoutChange={setState}
  ...
/>
```

### Q: 如何禁用拖拽调整?

A: 目前拖拽调整只在桌面端启用,平板和移动端自动禁用。

## 下一步

- 📖 阅读 [完整文档](../components/workflow/WORKFLOW_EDITOR_LAYOUT_README.md)
- 🔧 查看 [集成指南](./WORKFLOW_EDITOR_LAYOUT_INTEGRATION.md)
- 📝 查看 [完成报告](./TASK_2_THREE_COLUMN_LAYOUT_COMPLETE.md)

## 获取帮助

如有问题,请查看:
1. [README 文档](../components/workflow/WORKFLOW_EDITOR_LAYOUT_README.md)
2. [示例代码](../components/workflow/WorkflowEditorLayoutExample.tsx)
3. [设计文档](../.kiro/specs/workflow-ui-redesign/design.md)
