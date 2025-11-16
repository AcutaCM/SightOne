# WorkflowEditorLayout 集成指南

## 概述

本文档说明如何将新的 `WorkflowEditorLayout` 组件集成到现有的工作流编辑器中。

## 当前状态

### 现有组件结构

```
WorkflowEditor (components/WorkflowEditor.tsx)
├── TaskNodeLibrary
├── WorkflowCanvas
└── ControlStatusPanel
```

### 新的布局结构

```
WorkflowEditorLayout (components/workflow/WorkflowEditorLayout.tsx)
├── nodeLibrary (slot)
├── canvas (slot)
└── controlPanel (slot)
```

## 集成步骤

### 步骤 1: 更新 WorkflowEditor 组件

修改 `components/WorkflowEditor.tsx`:

```tsx
import WorkflowEditorLayout from './workflow/WorkflowEditorLayout';

const WorkflowEditor = () => {
  // ... 现有的状态和逻辑 ...

  return (
    <WorkflowEditorLayout
      nodeLibrary={
        <TaskNodeLibrary 
          className={isNodeLibraryVisible ? styles.visible : ''} 
        />
      }
      canvas={
        <div className={styles.workflowWrapper} onDrop={onDrop} onDragOver={onDragOver}>
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />
          
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <button 
              className={`${styles.toolbarButton} ${isNodeLibraryVisible ? styles.active : ''}`}
              onClick={toggleNodeLibrary}
              title="切换节点库"
            >
              {/* ... toolbar content ... */}
            </button>
          </div>
        </div>
      }
      controlPanel={
        <ControlStatusPanel 
          onRun={handleRun} 
          onStop={handleStop} 
          onClear={handleClear} 
          logs={logs} 
          results={results} 
        />
      }
      onLayoutChange={(state) => {
        console.log('Layout state changed:', state);
        // 可以在这里同步 isNodeLibraryVisible 状态
        setIsNodeLibraryVisible(!state.isNodeLibraryCollapsed);
      }}
    />
  );
};
```

### 步骤 2: 移除旧的布局样式

从 `styles/WorkflowEditor.module.css` 中移除以下样式:

```css
/* 可以移除的样式 */
.editorContainer {
  /* 布局相关的样式 */
}

.workflowWrapper {
  /* 如果只是布局相关的样式 */
}
```

保留以下样式:

```css
/* 保留的样式 */
.toolbar {
  /* 工具栏特定样式 */
}

.toolbarButton {
  /* 按钮特定样式 */
}
```

### 步骤 3: 更新 TaskNodeLibrary

修改 `TaskNodeLibrary` 组件以适配新布局:

```tsx
// 移除 className prop,因为布局由 WorkflowEditorLayout 管理
const TaskNodeLibrary = () => {
  return (
    <div className={styles.nodeLibrary}>
      {/* 节点库内容 */}
    </div>
  );
};
```

### 步骤 4: 更新 ControlStatusPanel

修改 `ControlStatusPanel` 组件以适配新布局:

```tsx
const ControlStatusPanel = ({ onRun, onStop, onClear, logs, results }) => {
  return (
    <div className={styles.controlPanel}>
      {/* 控制面板内容 */}
    </div>
  );
};
```

## 渐进式迁移

如果不想一次性完全迁移,可以采用渐进式方法:

### 方案 A: 创建新的编辑器页面

1. 创建 `app/workflow-v2/page.tsx`
2. 使用新的 `WorkflowEditorLayout`
3. 逐步迁移功能
4. 测试完成后替换旧页面

```tsx
// app/workflow-v2/page.tsx
'use client';

import WorkflowEditorLayout from '@/components/workflow/WorkflowEditorLayout';
import { WorkflowEditorLayoutExample } from '@/components/workflow/WorkflowEditorLayoutExample';

export default function WorkflowV2Page() {
  return <WorkflowEditorLayoutExample />;
}
```

### 方案 B: 使用特性开关

```tsx
const WorkflowEditor = () => {
  const useNewLayout = process.env.NEXT_PUBLIC_USE_NEW_LAYOUT === 'true';
  
  if (useNewLayout) {
    return (
      <WorkflowEditorLayout
        nodeLibrary={<TaskNodeLibrary />}
        canvas={<WorkflowCanvas />}
        controlPanel={<ControlStatusPanel />}
      />
    );
  }
  
  // 旧的布局
  return (
    <div className={styles.editorContainer}>
      {/* ... */}
    </div>
  );
};
```

## 状态管理

### 同步折叠状态

如果需要在外部控制侧边栏折叠状态:

```tsx
const WorkflowEditor = () => {
  const [layoutState, setLayoutState] = useState<LayoutState>({
    isNodeLibraryCollapsed: false,
    isControlPanelCollapsed: false,
    nodeLibraryWidth: 280,
    controlPanelWidth: 360,
  });
  
  return (
    <WorkflowEditorLayout
      nodeLibrary={<TaskNodeLibrary />}
      canvas={<WorkflowCanvas />}
      controlPanel={<ControlStatusPanel />}
      initialState={layoutState}
      onLayoutChange={setLayoutState}
    />
  );
};
```

### 响应式工具栏

工具栏按钮可以根据布局状态调整:

```tsx
const [layoutState, setLayoutState] = useState<LayoutState>();

// 在工具栏中
<button 
  onClick={() => {
    // 切换节点库
    setLayoutState(prev => ({
      ...prev!,
      isNodeLibraryCollapsed: !prev!.isNodeLibraryCollapsed,
    }));
  }}
>
  {layoutState?.isNodeLibraryCollapsed ? '显示节点库' : '隐藏节点库'}
</button>
```

## 样式迁移

### 主题变量映射

旧样式 → 新样式:

```css
/* 旧 */
background-color: #193059;
color: #E6F1FF;
border: 1px solid #64FFDA;

/* 新 */
background-color: var(--wf-panel-bg);
color: var(--wf-panel-text);
border: 1px solid var(--wf-panel-border);
```

### 间距标准化

```css
/* 旧 */
padding: 10px;
margin: 15px;

/* 新 */
padding: var(--wf-spacing-md); /* 12px */
margin: var(--wf-spacing-lg);  /* 16px */
```

## 测试清单

- [ ] 布局在桌面端正常显示
- [ ] 布局在平板端正常显示
- [ ] 布局在移动端正常显示
- [ ] 侧边栏折叠/展开动画流畅
- [ ] 侧边栏宽度可以拖拽调整
- [ ] 布局状态正确保存到 localStorage
- [ ] 页面刷新后布局状态恢复
- [ ] 主题切换时布局正常
- [ ] 节点拖拽功能正常
- [ ] 工作流执行功能正常
- [ ] 日志和结果显示正常
- [ ] 键盘导航正常
- [ ] 屏幕阅读器兼容

## 常见问题

### Q: 如何隐藏某个侧边栏?

A: 不传递对应的 prop 即可:

```tsx
<WorkflowEditorLayout
  canvas={<WorkflowCanvas />}
  controlPanel={<ControlPanel />}
  // 不传递 nodeLibrary,左侧栏将不显示
/>
```

### Q: 如何禁用布局持久化?

A: 设置 `persistLayout={false}`:

```tsx
<WorkflowEditorLayout
  persistLayout={false}
  // ...
/>
```

### Q: 如何自定义侧边栏宽度范围?

A: 目前宽度范围在 `lib/workflow/theme.ts` 中定义。如需自定义,可以修改 `defaultLayoutConfig`。

### Q: 移动端如何触发侧边栏?

A: 需要在工具栏或其他位置添加按钮,通过 `initialState` 和 `onLayoutChange` 控制。

## 下一步

完成集成后,可以继续实现:

1. **Task 3**: 重新设计节点库组件
2. **Task 4**: 重新设计工作流画布
3. **Task 6**: 重新设计控制面板

## 参考资源

- [WorkflowEditorLayout README](../components/workflow/WORKFLOW_EDITOR_LAYOUT_README.md)
- [设计文档](../.kiro/specs/workflow-ui-redesign/design.md)
- [需求文档](../.kiro/specs/workflow-ui-redesign/requirements.md)
