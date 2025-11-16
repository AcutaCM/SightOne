# 立即修复：Tello工作流面板显示问题

## 🎯 问题

组件选择器中选择 "Tello工作流面板" 后，面板不显示在主页面。

## ⚡ 快速修复步骤

### 步骤 1: 在主页面添加布局Hook

在 `app/page.tsx` 的 `export default function Home()` 函数开始处添加：

```tsx
// 在 useAuth() 之后添加
const { 
  visibleComponents, 
  toggleComponentVisibility,
  showComponentSelector,
  setShowComponentSelector 
} = useLayout();
```

### 步骤 2: 添加组件选择处理函数

在状态声明之后添加：

```tsx
// 处理组件选择
const handleSelectComponent = (componentId: string) => {
  toggleComponentVisibility(componentId);
};
```

### 步骤 3: 在JSX中添加组件选择器

在 `return` 语句的 JSX 中，找到合适位置（建议在最外层 div 的末尾）添加：

```tsx
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
  size="lg"
  className="fixed bottom-6 right-6 z-50 shadow-2xl"
  onPress={() => setShowComponentSelector(true)}
>
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
</Button>
```

### 步骤 4: 确认导入

确保文件顶部有这些导入：

```tsx
import { useLayout } from "@/contexts/LayoutContext";
import ComponentSelector from "@/components/ComponentSelector";
```

## 📝 完整代码示例

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDroneControl } from "@/hooks/useDroneControl";
import { useAIConfig } from "@/hooks/useAIConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useLayout } from "@/contexts/LayoutContext";  // ← 添加这行
import ComponentSelector from "@/components/ComponentSelector";  // ← 添加这行
// ... 其他导入 ...

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // ← 添加布局Hook
  const { 
    visibleComponents, 
    toggleComponentVisibility,
    showComponentSelector,
    setShowComponentSelector 
  } = useLayout();
  
  // ... 其他hooks和状态 ...
  
  // ← 添加处理函数
  const handleSelectComponent = (componentId: string) => {
    toggleComponentVisibility(componentId);
  };
  
  // ... 其他代码 ...
  
  return (
    <DroneProvider>
      <LayoutProvider>
        <DropZonesProvider>
          {/* 现有内容 */}
          
          {/* ← 在这里添加组件选择器 */}
          <ComponentSelector
            isVisible={showComponentSelector}
            onSelectComponent={handleSelectComponent}
            onClose={() => setShowComponentSelector(false)}
            selectedComponents={visibleComponents}
          />
          
          {/* ← 添加打开按钮 */}
          <Button
            isIconOnly
            color="primary"
            size="lg"
            className="fixed bottom-6 right-6 z-50 shadow-2xl"
            onPress={() => setShowComponentSelector(true)}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </DropZonesProvider>
      </LayoutProvider>
    </DroneProvider>
  );
}
```

## ✅ 验证步骤

1. **保存文件** - 保存 `app/page.tsx`
2. **刷新浏览器** - 页面应该自动重新加载
3. **查找按钮** - 右下角应该出现一个蓝色的 "+" 按钮
4. **点击按钮** - 组件选择器弹窗应该出现
5. **选择工作流面板** - 点击 "Tello工作流面板"
6. **验证显示** - 面板应该出现在页面上

## 🐛 如果还是不显示

### 检查 1: 确认组件ID匹配

组件选择器中的ID应该是 `'tello-workflow-panel'`（带连字符）

### 检查 2: 查看控制台

打开浏览器开发者工具，查看是否有错误信息

### 检查 3: 验证布局系统

在浏览器控制台运行：
```javascript
console.log(localStorage.getItem('drone-analyzer-visible-components'));
```

应该看到包含 `'tello-workflow-panel'` 的数组

### 检查 4: 清除缓存

如果上述都不行，清除localStorage：
```javascript
localStorage.clear();
location.reload();
```

## 📚 相关文档

- [详细修复指南](./WORKFLOW_PANEL_QUICK_FIX.md)
- [完整集成文档](./TELLO_WORKFLOW_PANEL_INTEGRATION_FIX.md)

---

**修复时间:** 5-10 分钟  
**难度:** 简单  
**最后更新:** 2025-10-21
