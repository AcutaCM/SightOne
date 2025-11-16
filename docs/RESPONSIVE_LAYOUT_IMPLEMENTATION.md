# 响应式布局实现文档

## 概述

本文档描述了工作流编辑器的响应式布局实现,包括移动端、平板和桌面布局的适配,以及触摸手势支持。

## 实现的功能

### 1. 移动端布局 (<768px)

#### 特性
- **抽屉式侧边栏**: 侧边栏以抽屉形式从屏幕边缘滑入/滑出
- **全屏画布**: 画布占据整个屏幕空间
- **浮动按钮**: 折叠/展开按钮显示为浮动按钮
- **遮罩层**: 打开侧边栏时显示半透明遮罩
- **自动折叠**: 切换到移动模式时自动折叠侧边栏

#### 技术实现
```typescript
// 检测移动端模式
const isDrawerMode = layoutMode === 'mobile';

// 抽屉动画
const nodeLibraryDrawer = useDrawerAnimation(
  !layoutState.isNodeLibraryCollapsed && isDrawerMode,
  300
);
```

#### CSS 样式
```css
/* 固定定位的抽屉 */
.layout[data-layout-mode="mobile"] .sidebar {
  position: fixed;
  width: min(85vw, 320px);
  transform: translateX(0);
  transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
}

/* 折叠状态 */
.layout[data-layout-mode="mobile"] .nodeLibrary.collapsed {
  transform: translateX(-100%);
}
```

### 2. 平板布局 (768px - 1024px)

#### 特性
- **优化的侧边栏宽度**: 
  - 节点库: 最大 240px (25vw)
  - 控制面板: 最大 300px (30vw)
- **调整的间距**: 使用中等间距 (12px)
- **触摸友好**: 按钮最小尺寸 40x40px
- **可调整大小**: 保留拖拽调整功能

#### 技术实现
```typescript
// 计算平板优化宽度
const actualNodeLibraryWidth = layoutMode === 'tablet'
  ? Math.min(240, responsiveLayout.screenWidth * 0.25)
  : layoutState.nodeLibraryWidth;
```

#### CSS 样式
```css
.layout[data-layout-mode="tablet"] .nodeLibrary:not(.collapsed) {
  width: min(240px, 25vw) !important;
}

.layout[data-layout-mode="tablet"] .controlPanel:not(.collapsed) {
  width: min(300px, 30vw) !important;
}
```

### 3. 桌面布局 (>1024px)

#### 特性
- **标准三栏布局**: 左中右三栏结构
- **自定义宽度**: 用户可拖拽调整侧边栏宽度
- **大屏优化**: 
  - 1440px+: 侧边栏最大宽度增加
  - 1920px+: 更大的间距和宽度
- **增强的调整手柄**: 悬停时显示视觉指示器

#### 技术实现
```typescript
// 桌面模式使用用户自定义宽度
const actualNodeLibraryWidth = layoutMode === 'desktop'
  ? layoutState.nodeLibraryWidth
  : optimizedWidth;
```

#### CSS 样式
```css
/* 标准桌面 */
.layout[data-layout-mode="desktop"] .nodeLibrary:not(.collapsed) {
  min-width: 240px;
  max-width: 400px;
}

/* 大屏优化 (>1440px) */
@media (min-width: 1440px) {
  .layout[data-layout-mode="desktop"] .nodeLibrary:not(.collapsed) {
    max-width: 450px;
  }
}

/* 超宽屏优化 (>1920px) */
@media (min-width: 1920px) {
  .layout[data-layout-mode="desktop"] .nodeLibrary:not(.collapsed) {
    max-width: 500px;
  }
}
```

### 4. 触摸手势支持

#### 特性
- **双指缩放**: 捏合手势缩放画布 (0.5x - 2x)
- **单指拖动**: 平移画布
- **双击重置**: 双击恢复默认视图
- **触摸目标优化**: 最小 44x44px 点击区域
- **手势提示**: 首次触摸时显示操作提示

#### 技术实现

##### useTouchGestures Hook
```typescript
export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  handlers: TouchGestureHandlers,
  enabled: boolean = true
) {
  // 处理触摸开始
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // 双指触摸 - 准备缩放
      pinchStartDistanceRef.current = getTouchDistance(e.touches);
    }
  };
  
  // 处理触摸移动
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && handlers.onPinchZoom) {
      // 计算缩放比例
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / pinchStartDistanceRef.current;
      handlers.onPinchZoom(scale);
    }
  };
}
```

##### TouchGestureCanvas 组件
```typescript
<TouchGestureCanvas
  enabled={shouldUseTouchGestures}
  onPinchZoom={(scale, centerX, centerY) => {
    // 处理缩放
    setZoom(scale);
  }}
  onPan={(deltaX, deltaY) => {
    // 处理平移
    setPan({ x: deltaX, y: deltaY });
  }}
  onDoubleTap={() => {
    // 重置视图
    resetView();
  }}
  minZoom={0.5}
  maxZoom={2.0}
>
  {/* 画布内容 */}
</TouchGestureCanvas>
```

## 响应式断点

```typescript
const breakpoints = {
  mobile: 768,   // < 768px
  tablet: 1024,  // 768px - 1024px
  desktop: 1024, // > 1024px
};
```

## 使用示例

### 基础使用

```typescript
import { WorkflowEditorLayout } from '@/components/workflow/WorkflowEditorLayout';
import { CollapsibleNodeLibrary } from '@/components/workflow/CollapsibleNodeLibrary';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { CollapsibleControlPanel } from '@/components/workflow/CollapsibleControlPanel';

function WorkflowEditor() {
  return (
    <WorkflowEditorLayout
      nodeLibrary={<CollapsibleNodeLibrary />}
      canvas={<WorkflowCanvas />}
      controlPanel={<CollapsibleControlPanel />}
      persistLayout={true}
    />
  );
}
```

### 使用响应式布局 Hook

```typescript
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

function MyComponent() {
  const {
    layoutMode,
    isDrawerMode,
    shouldUseTouchGestures,
    getOptimizedSidebarWidth,
    getOptimizedButtonSize,
  } = useResponsiveLayout();
  
  const sidebarWidth = getOptimizedSidebarWidth(280);
  const buttonSize = getOptimizedButtonSize(36);
  
  return (
    <div>
      <p>当前布局模式: {layoutMode}</p>
      <p>侧边栏宽度: {sidebarWidth}px</p>
      <p>按钮尺寸: {buttonSize}px</p>
    </div>
  );
}
```

### 添加触摸手势

```typescript
import { TouchGestureCanvas } from '@/components/workflow/TouchGestureCanvas';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

function MyCanvas() {
  const { shouldUseTouchGestures } = useResponsiveLayout();
  const [zoom, setZoom] = useState(1);
  
  return (
    <TouchGestureCanvas
      enabled={shouldUseTouchGestures}
      zoom={zoom}
      onZoomChange={setZoom}
      onPinchZoom={(scale) => {
        console.log('Pinch zoom:', scale);
      }}
      onPan={(dx, dy) => {
        console.log('Pan:', dx, dy);
      }}
      onDoubleTap={() => {
        console.log('Double tap - reset view');
        setZoom(1);
      }}
    >
      {/* 画布内容 */}
    </TouchGestureCanvas>
  );
}
```

## 性能优化

### 1. 防抖和节流
```typescript
// 窗口大小调整使用防抖 (100ms)
const handleResize = debounce(() => {
  updateLayout();
}, 100);
```

### 2. CSS 优化
```css
/* 使用 will-change 提示浏览器 */
.sidebar {
  will-change: transform;
}

/* 使用 transform 代替 position */
.nodeLibrary.collapsed {
  transform: translateX(-100%);
}
```

### 3. 动画优化
```typescript
// 使用 useDrawerAnimation 管理动画状态
const { isAnimating, shouldRender } = useDrawerAnimation(isOpen, 300);

// 只在需要时渲染
{shouldRender && <Drawer />}
```

## 可访问性

### 1. 键盘导航
- 所有交互元素可通过 Tab 键访问
- 提供清晰的焦点指示器
- 支持 Escape 键关闭抽屉

### 2. 屏幕阅读器
```typescript
<button
  aria-label={isCollapsed ? '展开节点库' : '折叠节点库'}
  aria-expanded={!isCollapsed}
>
  {/* 按钮内容 */}
</button>
```

### 3. 触摸目标
- 最小点击区域: 44x44px (移动端)
- 最小点击区域: 40x40px (平板)
- 按钮间距: ≥ 8px

### 4. 减少动画
```css
@media (prefers-reduced-motion: reduce) {
  .sidebar {
    transition: none !important;
    animation: none !important;
  }
}
```

## 浏览器兼容性

### 支持的浏览器
- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14 (iOS ≥ 14)
- Samsung Internet ≥ 14

### 触摸事件支持
```typescript
// 检测触摸设备
function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}
```

## 测试

### 手动测试清单

#### 移动端 (<768px)
- [ ] 侧边栏以抽屉形式打开/关闭
- [ ] 显示遮罩层
- [ ] 点击遮罩层关闭抽屉
- [ ] 浮动按钮正确显示
- [ ] 触摸手势正常工作

#### 平板 (768px - 1024px)
- [ ] 侧边栏宽度适配
- [ ] 按钮尺寸适当
- [ ] 可拖拽调整宽度
- [ ] 触摸目标足够大

#### 桌面 (>1024px)
- [ ] 标准三栏布局
- [ ] 可自定义侧边栏宽度
- [ ] 大屏优化生效
- [ ] 调整手柄正常工作

#### 触摸手势
- [ ] 双指缩放正常
- [ ] 单指拖动正常
- [ ] 双击重置正常
- [ ] 手势提示显示

### 自动化测试

```typescript
describe('Responsive Layout', () => {
  it('should switch to mobile mode when width < 768px', () => {
    // 测试代码
  });
  
  it('should show drawer on mobile', () => {
    // 测试代码
  });
  
  it('should handle touch gestures', () => {
    // 测试代码
  });
});
```

## 故障排除

### 问题: 移动端抽屉不显示
**解决方案**: 检查 `data-layout-mode` 属性是否正确设置

### 问题: 触摸手势不工作
**解决方案**: 
1. 确认 `touch-action: none` 已设置
2. 检查事件监听器是否正确添加
3. 验证 `enabled` 属性为 true

### 问题: 平板布局宽度不正确
**解决方案**: 检查 CSS 媒体查询和 viewport 宽度计算

## 未来改进

1. **手势录制**: 记录用户手势习惯,优化体验
2. **自适应布局**: 根据内容自动调整布局
3. **多点触控**: 支持更多手势 (三指、四指)
4. **手势自定义**: 允许用户自定义手势映射
5. **性能监控**: 添加性能指标收集

## 参考资源

- [MDN - Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Web.dev - Responsive Design](https://web.dev/responsive-web-design-basics/)
- [WCAG 2.1 - Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [React Flow - Touch Support](https://reactflow.dev/docs/guides/touch-devices/)

## 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 实现移动端抽屉式布局
- ✅ 实现平板优化布局
- ✅ 实现桌面大屏优化
- ✅ 实现触摸手势支持
- ✅ 添加响应式布局 Hook
- ✅ 优化触摸目标尺寸
- ✅ 添加可访问性支持
