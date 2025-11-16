# WorkflowEditorLayout Component

## 概述

`WorkflowEditorLayout` 是工作流编辑器的主布局组件,提供了一个现代化的三栏布局结构,类似于 Dify 的设计风格。

## 功能特性

### ✅ 已实现的功能

1. **三栏布局结构**
   - 左侧：可折叠的节点库面板
   - 中间：工作流画布区域
   - 右侧：可折叠的控制面板

2. **侧边栏折叠/展开**
   - 平滑的动画过渡 (300ms)
   - 折叠按钮带悬停效果
   - 支持键盘访问 (Tab + Enter)

3. **侧边栏宽度调整**
   - 拖拽调整宽度
   - 最小/最大宽度限制
   - 实时视觉反馈

4. **布局状态持久化**
   - 自动保存到 localStorage
   - 页面刷新后恢复状态
   - 可配置存储键名

5. **响应式设计**
   - 桌面端 (>1024px): 标准三栏布局
   - 平板端 (768px-1024px): 缩小侧边栏宽度
   - 移动端 (<768px): 抽屉式侧边栏

6. **主题支持**
   - 自动适配明暗主题
   - 使用设计令牌系统
   - 平滑主题切换过渡

7. **无障碍访问**
   - ARIA 标签和角色
   - 键盘导航支持
   - 高对比度模式支持
   - 减少动画选项支持

## 使用方法

### 基础用法

```tsx
import WorkflowEditorLayout from '@/components/workflow/WorkflowEditorLayout';

function MyWorkflowEditor() {
  return (
    <WorkflowEditorLayout
      nodeLibrary={<NodeLibrary />}
      canvas={<WorkflowCanvas />}
      controlPanel={<ControlPanel />}
    />
  );
}
```

### 带初始状态

```tsx
<WorkflowEditorLayout
  nodeLibrary={<NodeLibrary />}
  canvas={<WorkflowCanvas />}
  controlPanel={<ControlPanel />}
  initialState={{
    isNodeLibraryCollapsed: false,
    isControlPanelCollapsed: false,
    nodeLibraryWidth: 320,
    controlPanelWidth: 400,
  }}
/>
```

### 监听布局变化

```tsx
<WorkflowEditorLayout
  nodeLibrary={<NodeLibrary />}
  canvas={<WorkflowCanvas />}
  controlPanel={<ControlPanel />}
  onLayoutChange={(state) => {
    console.log('Layout changed:', state);
    // 可以在这里保存到服务器或执行其他操作
  }}
/>
```

### 自定义存储键

```tsx
<WorkflowEditorLayout
  nodeLibrary={<NodeLibrary />}
  canvas={<WorkflowCanvas />}
  controlPanel={<ControlPanel />}
  persistLayout={true}
  storageKey="my-custom-workflow-layout"
/>
```

## Props API

### WorkflowEditorLayoutProps

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `nodeLibrary` | `React.ReactNode` | - | 节点库内容 |
| `canvas` | `React.ReactNode` | **必需** | 画布内容 |
| `controlPanel` | `React.ReactNode` | - | 控制面板内容 |
| `initialState` | `Partial<LayoutState>` | - | 初始布局状态 |
| `onLayoutChange` | `(state: LayoutState) => void` | - | 布局状态变化回调 |
| `persistLayout` | `boolean` | `true` | 是否持久化布局状态 |
| `storageKey` | `string` | `'workflow-layout-state'` | localStorage 键名 |

### LayoutState

```typescript
interface LayoutState {
  isNodeLibraryCollapsed: boolean;
  isControlPanelCollapsed: boolean;
  nodeLibraryWidth: number;
  controlPanelWidth: number;
}
```

## 布局配置

默认布局配置定义在 `lib/workflow/theme.ts`:

```typescript
{
  nodeLibrary: {
    defaultWidth: 280,
    minWidth: 200,
    maxWidth: 400,
    collapsedWidth: 48,
  },
  controlPanel: {
    defaultWidth: 360,
    minWidth: 280,
    maxWidth: 500,
    collapsedWidth: 48,
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
}
```

## 响应式行为

### 桌面端 (>1024px)
- 显示完整的三栏布局
- 侧边栏可拖拽调整宽度
- 折叠按钮显示在侧边栏边缘

### 平板端 (768px-1024px)
- 显示三栏布局,但侧边栏宽度缩小
- 节点库最大宽度: 240px
- 控制面板最大宽度: 320px
- 不支持拖拽调整宽度

### 移动端 (<768px)
- 侧边栏变为固定定位的抽屉
- 打开时显示遮罩层
- 点击遮罩层关闭抽屉
- 侧边栏宽度固定为 280px

## 样式定制

### CSS 变量

组件使用以下 CSS 变量,可以通过主题系统自定义:

```css
/* 画布颜色 */
--wf-canvas-bg
--wf-canvas-grid
--wf-canvas-grid-dot

/* 面板颜色 */
--wf-panel-bg
--wf-panel-border
--wf-panel-text
--wf-panel-text-secondary
--wf-panel-hover

/* 间距 */
--wf-spacing-xs
--wf-spacing-sm
--wf-spacing-md
--wf-spacing-lg

/* 圆角 */
--wf-radius-sm
--wf-radius-md
--wf-radius-lg

/* 阴影 */
--wf-shadow-sm
--wf-shadow-md
--wf-shadow-lg
--wf-shadow-xl

/* 动画 */
--wf-duration-fast
--wf-duration-normal
--wf-easing-default
```

### 自定义样式

可以通过覆盖 CSS 模块类来自定义样式:

```css
/* 自定义折叠按钮样式 */
.layout :global(.collapseButton) {
  background-color: #custom-color;
}

/* 自定义侧边栏样式 */
.layout :global(.sidebar) {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
```

## 性能优化

1. **防抖拖拽**: 拖拽调整宽度时使用最小拖拽距离 (5px) 避免频繁更新
2. **条件渲染**: 折叠状态下隐藏侧边栏内容,减少 DOM 节点
3. **CSS 动画**: 使用 CSS transition 而非 JavaScript 动画
4. **事件清理**: 正确清理事件监听器和定时器

## 无障碍访问

### 键盘导航
- `Tab`: 在可交互元素间导航
- `Enter/Space`: 激活折叠按钮
- `Escape`: 关闭移动端抽屉 (待实现)

### 屏幕阅读器
- 所有按钮都有 `aria-label`
- 拖拽手柄有 `role="separator"`
- 遮罩层有描述性标签

### 视觉辅助
- 焦点指示器清晰可见
- 高对比度模式支持
- 减少动画选项支持

## 浏览器兼容性

- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- 不支持 IE

## 已知限制

1. 移动端不支持拖拽调整宽度
2. 打印时自动隐藏侧边栏
3. 需要父容器有明确的高度

## 示例

查看 `WorkflowEditorLayoutExample.tsx` 获取完整的使用示例。

## 相关文件

- `components/workflow/WorkflowEditorLayout.tsx` - 主组件
- `styles/WorkflowEditorLayout.module.css` - 样式文件
- `lib/workflow/theme.ts` - 主题配置
- `lib/workflow/designTokens.ts` - 设计令牌
- `hooks/useWorkflowTheme.ts` - 主题 Hook

## 下一步

- [ ] 实现节点库组件 (Task 3)
- [ ] 实现工作流画布组件 (Task 4)
- [ ] 实现控制面板组件 (Task 6)
- [ ] 集成到主应用 (Task 12)

## 更新日志

### v1.0.0 (2025-01-25)
- ✅ 初始实现
- ✅ 三栏布局结构
- ✅ 侧边栏折叠/展开动画
- ✅ 侧边栏宽度拖拽调整
- ✅ 布局状态持久化
- ✅ 响应式设计
- ✅ 主题支持
- ✅ 无障碍访问
