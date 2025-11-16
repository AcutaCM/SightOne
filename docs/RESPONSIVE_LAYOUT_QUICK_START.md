# 响应式布局快速入门

## 5分钟快速上手

### 1. 基础使用

```typescript
import { WorkflowEditorLayout } from '@/components/workflow/WorkflowEditorLayout';

function MyWorkflow() {
  return (
    <WorkflowEditorLayout
      nodeLibrary={<YourNodeLibrary />}
      canvas={<YourCanvas />}
      controlPanel={<YourControlPanel />}
    />
  );
}
```

### 2. 检测布局模式

```typescript
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

function MyComponent() {
  const { layoutMode, isDrawerMode } = useResponsiveLayout();
  
  return (
    <div>
      {layoutMode === 'mobile' && <MobileView />}
      {layoutMode === 'tablet' && <TabletView />}
      {layoutMode === 'desktop' && <DesktopView />}
    </div>
  );
}
```

### 3. 添加触摸手势

```typescript
import { TouchGestureCanvas } from '@/components/workflow/TouchGestureCanvas';

function MyCanvas() {
  const [zoom, setZoom] = useState(1);
  
  return (
    <TouchGestureCanvas
      zoom={zoom}
      onZoomChange={setZoom}
      onDoubleTap={() => setZoom(1)}
    >
      <YourCanvasContent />
    </TouchGestureCanvas>
  );
}
```

## 响应式断点

| 设备类型 | 屏幕宽度 | 布局模式 |
|---------|---------|---------|
| 移动端 | < 768px | 抽屉式 |
| 平板 | 768px - 1024px | 优化三栏 |
| 桌面 | > 1024px | 标准三栏 |

## 关键特性

### 移动端 (<768px)
- ✅ 抽屉式侧边栏
- ✅ 全屏画布
- ✅ 浮动按钮
- ✅ 触摸手势

### 平板 (768px - 1024px)
- ✅ 优化宽度 (25% / 30%)
- ✅ 触摸友好按钮 (40px)
- ✅ 可调整大小

### 桌面 (>1024px)
- ✅ 自定义宽度
- ✅ 大屏优化
- ✅ 增强调整手柄

## 常用 API

### useResponsiveLayout

```typescript
const {
  layoutMode,              // 'mobile' | 'tablet' | 'desktop'
  isDrawerMode,           // boolean
  shouldUseTouchGestures, // boolean
  screenWidth,            // number
  screenHeight,           // number
  isTouchDevice,          // boolean
  getOptimizedSidebarWidth,  // (width: number) => number
  getOptimizedButtonSize,    // (size: number) => number
} = useResponsiveLayout();
```

### TouchGestureCanvas Props

```typescript
interface TouchGestureCanvasProps {
  enabled?: boolean;           // 默认: true
  onPinchZoom?: (scale) => void;
  onPan?: (dx, dy) => void;
  onDoubleTap?: () => void;
  minZoom?: number;           // 默认: 0.5
  maxZoom?: number;           // 默认: 2.0
  zoom?: number;
  onZoomChange?: (zoom) => void;
}
```

## 最佳实践

### 1. 优化触摸目标

```typescript
// ✅ 好的做法
const buttonSize = responsiveLayout.getOptimizedButtonSize(36);

// ❌ 避免
const buttonSize = 36; // 移动端可能太小
```

### 2. 条件渲染

```typescript
// ✅ 好的做法
{!isDrawerMode && <DesktopOnlyFeature />}

// ❌ 避免
<DesktopOnlyFeature style={{ display: isDrawerMode ? 'none' : 'block' }} />
```

### 3. 触摸手势

```typescript
// ✅ 好的做法
<TouchGestureCanvas enabled={shouldUseTouchGestures}>

// ❌ 避免
<TouchGestureCanvas enabled={true}> // 桌面也启用
```

## 测试清单

### 移动端
- [ ] 侧边栏抽屉正常打开/关闭
- [ ] 遮罩层点击关闭
- [ ] 触摸手势工作正常
- [ ] 按钮尺寸 ≥ 44px

### 平板
- [ ] 侧边栏宽度适配
- [ ] 可拖拽调整
- [ ] 按钮尺寸 ≥ 40px

### 桌面
- [ ] 三栏布局正常
- [ ] 自定义宽度保存
- [ ] 大屏优化生效

## 故障排除

### 问题: 布局模式不正确
```typescript
// 检查断点配置
const { layoutMode } = useResponsiveLayout({
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1024,
  }
});
```

### 问题: 触摸手势不工作
```css
/* 确保设置了 touch-action */
.canvas {
  touch-action: none;
}
```

### 问题: 抽屉动画卡顿
```css
/* 使用 will-change 优化 */
.sidebar {
  will-change: transform;
}
```

## 下一步

- 📖 阅读 [完整文档](./RESPONSIVE_LAYOUT_IMPLEMENTATION.md)
- 🎨 查看 [设计规范](.kiro/specs/workflow-ui-redesign/design.md)
- ✅ 查看 [需求文档](.kiro/specs/workflow-ui-redesign/requirements.md)

## 示例代码

完整示例请查看:
- `components/workflow/WorkflowEditorLayout.tsx`
- `hooks/useResponsiveLayout.ts`
- `components/workflow/TouchGestureCanvas.tsx`
