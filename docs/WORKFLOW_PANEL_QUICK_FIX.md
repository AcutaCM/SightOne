# Tello 工作流面板快速修复指南

## 🎯 问题

点击组件选择器中的 "Tello工作流面板" 后，主页面没有出现该面板。

## ✅ 已完成的修复

1. ✅ 组件选择器主题适配
2. ✅ 工作流组件在选择器中显示
3. ✅ 布局系统中添加了工作流面板的默认布局

## 🔧 需要的修复

### 问题根源

组件选择器的 `onSelectComponent` 回调需要将选中的组件添加到布局系统的 `visibleComponents` 列表中。

### 解决方案

在主页面 (`app/page.tsx`) 中，需要连接组件选择器和布局系统：

```tsx
// app/page.tsx

import { useLayout } from "@/contexts/LayoutContext";

export default function Home() {
  // 使用布局上下文
  const { 
    visibleComponents, 
    toggleComponentVisibility,
    showComponentSelector,
    setShowComponentSelector 
  } = useLayout();
  
  // 处理组件选择
  const handleSelectComponent = (componentId: string) => {
    // 切换组件可见性
    toggleComponentVisibility(componentId);
  };
  
  return (
    <DroneProvider>
      <LayoutProvider>
        <DropZonesProvider>
          {/* 主要内容 */}
          
          {/* 组件选择器 */}
          <ComponentSelector
            isVisible={showComponentSelector}
            onSelectComponent={handleSelectComponent}
            onClose={() => setShowComponentSelector(false)}
            selectedComponents={visibleComponents}
          />
          
          {/* 打开组件选择器的按钮 */}
          <Button
            isIconOnly
            color="primary"
            className="fixed bottom-4 right-4 z-50"
            onPress={() => setShowComponentSelector(true)}
          >
            +
          </Button>
        </DropZonesProvider>
      </LayoutProvider>
    </DroneProvider>
  );
}
```

## 📝 详细步骤

### 步骤 1: 导入布局 Hook

在 `app/page.tsx` 的顶部添加：

```tsx
import { useLayout } from "@/contexts/LayoutContext";
```

### 步骤 2: 使用布局上下文

在组件内部添加：

```tsx
const { 
  visibleComponents, 
  toggleComponentVisibility,
  showComponentSelector,
  setShowComponentSelector 
} = useLayout();
```

### 步骤 3: 创建处理函数

```tsx
const handleSelectComponent = (componentId: string) => {
  toggleComponentVisibility(componentId);
};
```

### 步骤 4: 连接组件选择器

找到 `ComponentSelector` 的使用位置，更新为：

```tsx
<ComponentSelector
  isVisible={showComponentSelector}
  onSelectComponent={handleSelectComponent}
  onClose={() => setShowComponentSelector(false)}
  selectedComponents={visibleComponents}
/>
```

### 步骤 5: 添加打开按钮

如果还没有打开组件选择器的按钮，添加：

```tsx
<Button
  isIconOnly
  color="primary"
  className="fixed bottom-4 right-4 z-50 shadow-lg"
  onPress={() => setShowComponentSelector(true)}
>
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
</Button>
```

## 🧪 测试步骤

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **打开组件选择器**
   - 点击右下角的 "+" 按钮

3. **选择工作流面板**
   - 在组件选择器中找到 "Tello工作流面板"
   - 点击选择

4. **验证结果**
   - ✅ 工作流面板应该出现在页面上
   - ✅ 面板应该可以拖拽
   - ✅ 再次点击可以隐藏面板

## 🎨 工作流面板默认位置

已在 `LayoutContext.tsx` 中配置：

```tsx
'tello-workflow-panel': {
  id: 'tello-workflow-panel',
  position: { x: 300, y: 150 },  // 中央位置
  size: { width: 900, height: 600 },  // 较大尺寸
}
```

## 🔍 故障排除

### 问题 1: 组件选择器不显示

**检查:**
- 确认 `showComponentSelector` 状态正确
- 确认按钮的 `onPress` 事件正确绑定

**解决:**
```tsx
console.log('showComponentSelector:', showComponentSelector);
```

### 问题 2: 选择后没有反应

**检查:**
- 确认 `handleSelectComponent` 被正确调用
- 确认 `toggleComponentVisibility` 正常工作

**解决:**
```tsx
const handleSelectComponent = (componentId: string) => {
  console.log('Selecting component:', componentId);
  toggleComponentVisibility(componentId);
  console.log('Visible components:', visibleComponents);
};
```

### 问题 3: 面板不显示

**检查:**
- 确认组件ID匹配: `'tello-workflow-panel'`
- 确认组件在 `visibleComponents` 列表中
- 确认主页面有渲染逻辑

**解决:**
检查主页面是否有类似这样的代码：

```tsx
{visibleComponents.includes('tello-workflow-panel') && (
  <DraggableContainer id="tello-workflow-panel">
    <TelloWorkflowPanel isConnected={droneStatus.connected} />
  </DraggableContainer>
)}
```

## 📊 完整的组件渲染示例

如果主页面还没有组件渲染逻辑，需要添加：

```tsx
// 组件映射表
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  'tello-workflow-panel': TelloWorkflowPanel,
  'connection-control': ConnectionControlPanel,
  'mission-panel': MissionPadPanel,
  // ... 其他组件
};

// 渲染可见组件
const renderVisibleComponents = () => {
  return visibleComponents.map(componentId => {
    const Component = COMPONENT_MAP[componentId];
    if (!Component) return null;
    
    const layout = layouts[componentId];
    if (!layout) return null;
    
    return (
      <DraggableContainer
        key={componentId}
        id={componentId}
        initialPosition={layout.position}
      >
        <Component isConnected={droneStatus.connected} />
      </DraggableContainer>
    );
  });
};

// 在 JSX 中使用
return (
  <div>
    {renderVisibleComponents()}
  </div>
);
```

## ✨ 预期效果

1. **点击 "+" 按钮** → 组件选择器弹出
2. **选择 "Tello工作流面板"** → 面板添加到页面
3. **面板出现** → 在中央位置 (300, 150)
4. **可以拖拽** → 移动到任意位置
5. **再次点击** → 面板隐藏
6. **位置保存** → 刷新页面后位置保持

## 📚 相关文件

- ✅ `contexts/LayoutContext.tsx` - 已添加工作流面板布局
- ⚠️ `app/page.tsx` - 需要连接组件选择器
- ✅ `components/ComponentSelector.tsx` - 已修复主题
- ✅ `components/TelloWorkflowPanel.tsx` - 工作流面板组件

## 🎯 下一步

1. 在 `app/page.tsx` 中实现上述修复
2. 测试组件选择和显示功能
3. 确认拖拽和位置保存正常工作

---

**状态:** 🟡 部分完成  
**剩余工作:** 连接组件选择器到布局系统  
**预计时间:** 15-30 分钟  
**最后更新:** 2025-10-21
