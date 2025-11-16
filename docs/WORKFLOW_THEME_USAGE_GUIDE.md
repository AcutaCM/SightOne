# Workflow组件主题使用指南

## 概述

本指南详细说明如何使用重新设计的Workflow组件主题系统。新主题采用极简的黑白灰配色方案，提供专业、现代的视觉效果，并完全支持浅色/深色主题切换。

## 目录

- [快速开始](#快速开始)
- [主题系统](#主题系统)
- [CSS变量](#css变量)
- [组件使用](#组件使用)
- [自定义主题](#自定义主题)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

---

## 快速开始

### 基本使用

所有Workflow组件已经自动应用新主题，无需额外配置：

```tsx
import { WorkflowEditor } from '@/components/WorkflowEditor';

export default function MyWorkflowPage() {
  return (
    <div className="workflow-container">
      <WorkflowEditor />
    </div>
  );
}
```

### 使用主题Hook

如果需要在自定义组件中访问主题变量：

```tsx
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

export function MyCustomNode() {
  const theme = useWorkflowTheme();
  
  return (
    <div style={{
      background: theme.node.bg,
      border: `2px solid ${theme.node.border}`,
      color: theme.text.primary
    }}>
      自定义节点内容
    </div>
  );
}
```

---

## 主题系统

### 设计理念

新主题系统基于以下核心原则：

1. **极简黑白灰配色**：专业、现代、易读
2. **语义化变量**：清晰的命名，易于理解和维护
3. **响应式主题**：自动适配浅色/深色模式
4. **一致性**：所有组件使用统一的设计语言

### 颜色系统

#### 浅色主题

```css
/* 节点颜色 */
--node-bg: #FFFFFF;              /* 节点背景 */
--node-border: #E5E5E5;          /* 节点边框 */
--node-border-hover: #CCCCCC;    /* 悬停边框 */
--node-selected: #000000;        /* 选中边框 */
--node-header-bg: #FAFAFA;       /* 头部背景 */

/* 参数颜色 */
--param-bg: #F8F8F8;             /* 参数背景 */
--param-bg-hover: #F0F0F0;       /* 悬停背景 */
--param-bg-editing: #E8E8E8;     /* 编辑背景 */
--param-border-editing: #999999; /* 编辑边框 */

/* 文本颜色 */
--text-primary: #1A1A1A;         /* 主要文本 */
--text-secondary: #666666;       /* 次要文本 */
--text-tertiary: #999999;        /* 第三级文本 */
```

#### 深色主题

```css
/* 节点颜色 */
--node-bg: #1A1A1A;              /* 节点背景 */
--node-border: #333333;          /* 节点边框 */
--node-border-hover: #4D4D4D;    /* 悬停边框 */
--node-selected: #FFFFFF;        /* 选中边框 */
--node-header-bg: #222222;       /* 头部背景 */

/* 参数颜色 */
--param-bg: #242424;             /* 参数背景 */
--param-bg-hover: #2E2E2E;       /* 悬停背景 */
--param-bg-editing: #383838;     /* 编辑背景 */
--param-border-editing: #666666; /* 编辑边框 */

/* 文本颜色 */
--text-primary: #E5E5E5;         /* 主要文本 */
--text-secondary: #999999;       /* 次要文本 */
--text-tertiary: #666666;        /* 第三级文本 */
```

---

## CSS变量

### 完整变量列表

#### 节点相关

| 变量名 | 用途 | 浅色值 | 深色值 |
|--------|------|--------|--------|
| `--node-bg` | 节点背景色 | #FFFFFF | #1A1A1A |
| `--node-border` | 节点边框色 | #E5E5E5 | #333333 |
| `--node-border-hover` | 悬停边框色 | #CCCCCC | #4D4D4D |
| `--node-selected` | 选中边框色 | #000000 | #FFFFFF |
| `--node-selected-glow` | 选中光晕 | rgba(0,0,0,0.1) | rgba(255,255,255,0.1) |
| `--node-divider` | 分隔线颜色 | #F0F0F0 | #2A2A2A |
| `--node-header-bg` | 头部背景色 | #FAFAFA | #222222 |

#### 阴影相关

| 变量名 | 用途 | 值 |
|--------|------|-----|
| `--node-shadow` | 基础阴影 | 0 2px 8px rgba(0,0,0,0.1) |
| `--node-shadow-hover` | 悬停阴影 | 0 4px 16px rgba(0,0,0,0.15) |
| `--node-shadow-selected` | 选中阴影 | 0 8px 24px rgba(0,0,0,0.2) |

#### 参数相关

| 变量名 | 用途 | 浅色值 | 深色值 |
|--------|------|--------|--------|
| `--param-bg` | 参数背景 | #F8F8F8 | #242424 |
| `--param-bg-hover` | 悬停背景 | #F0F0F0 | #2E2E2E |
| `--param-bg-editing` | 编辑背景 | #E8E8E8 | #383838 |
| `--param-bg-error` | 错误背景 | #FEE | rgba(220,38,38,0.1) |
| `--param-border` | 参数边框 | #E0E0E0 | #3A3A3A |
| `--param-border-hover` | 悬停边框 | #D0D0D0 | #4A4A4A |
| `--param-border-editing` | 编辑边框 | #999999 | #666666 |
| `--param-editing-glow` | 编辑光晕 | rgba(0,0,0,0.08) | rgba(255,255,255,0.08) |

#### 文本相关

| 变量名 | 用途 | 浅色值 | 深色值 |
|--------|------|--------|--------|
| `--text-primary` | 主要文本 | #1A1A1A | #E5E5E5 |
| `--text-secondary` | 次要文本 | #666666 | #999999 |
| `--text-tertiary` | 第三级文本 | #999999 | #666666 |

#### 状态相关

| 变量名 | 用途 | 浅色值 | 深色值 |
|--------|------|--------|--------|
| `--error-color` | 错误颜色 | #DC2626 | #EF4444 |
| `--success-color` | 成功颜色 | #333333 | #CCCCCC |
| `--warning-color` | 警告颜色 | #666666 | #999999 |
| `--info-color` | 信息颜色 | #000000 | #FFFFFF |

### 使用CSS变量

#### 在CSS中使用

```css
.my-custom-node {
  background: var(--node-bg);
  border: 2px solid var(--node-border);
  color: var(--text-primary);
  box-shadow: var(--node-shadow);
}

.my-custom-node:hover {
  border-color: var(--node-border-hover);
  box-shadow: var(--node-shadow-hover);
}
```

#### 在JavaScript中使用

```typescript
import { getCSSVariable } from '@/lib/workflow/workflowTheme';

const nodeBg = getCSSVariable('--node-bg', '#FFFFFF');
const textPrimary = getCSSVariable('--text-primary', '#1A1A1A');
```

---

## 组件使用

### NodeHeader

节点头部组件，显示节点图标、标题和控制按钮。

```tsx
import { NodeHeader } from '@/components/workflow/NodeHeader';

<NodeHeader
  icon={<CameraIcon />}
  title="拍照节点"
  isCollapsed={false}
  parameterCount={3}
  hasErrors={false}
  onToggleCollapse={() => {}}
  onAdvancedSettings={() => {}}
/>
```

**Props说明：**

- `icon`: 节点图标（ReactNode）
- `title`: 节点标题
- `isCollapsed`: 是否折叠
- `parameterCount`: 参数数量（折叠时显示）
- `hasErrors`: 是否有错误
- `onToggleCollapse`: 折叠/展开回调
- `onAdvancedSettings`: 高级设置回调（可选）

### InlineParameterNode

内联参数编辑节点，支持直接在节点上编辑参数。

```tsx
import { InlineParameterNode } from '@/components/workflow/InlineParameterNode';

<InlineParameterNode
  id="node-1"
  data={{
    label: "拍照节点",
    icon: <CameraIcon />,
    parameters: [
      {
        name: "quality",
        label: "图片质量",
        type: "slider",
        value: 80,
        min: 0,
        max: 100
      }
    ]
  }}
  selected={false}
/>
```

### ParameterItem

参数编辑项，支持多种编辑器类型。

```tsx
import { ParameterItem } from '@/components/workflow/ParameterItem';

<ParameterItem
  parameter={{
    name: "altitude",
    label: "飞行高度",
    type: "number",
    value: 100,
    min: 20,
    max: 500,
    unit: "cm",
    description: "无人机飞行高度，范围20-500厘米"
  }}
  value={100}
  onChange={(value) => console.log('新值:', value)}
  isEditing={false}
  error={null}
/>
```

**支持的编辑器类型：**

- `text`: 文本输入
- `number`: 数字输入
- `slider`: 滑块
- `select`: 下拉选择
- `boolean`: 开关

### ParameterList

参数列表容器，支持虚拟化和动画。

```tsx
import { ParameterList } from '@/components/workflow/ParameterList';

<ParameterList
  parameters={[
    { name: "param1", label: "参数1", type: "text", value: "" },
    { name: "param2", label: "参数2", type: "number", value: 0 }
  ]}
  values={{ param1: "值1", param2: 100 }}
  onChange={(name, value) => console.log(name, value)}
  maxHeight={400}
/>
```

---

## 自定义主题

### 覆盖CSS变量

如果需要自定义主题颜色，可以在全局CSS中覆盖变量：

```css
/* styles/custom-workflow-theme.css */

:root {
  /* 自定义节点颜色 */
  --node-bg: #F5F5F5;
  --node-border: #D0D0D0;
  --node-selected: #2563EB;
  
  /* 自定义文本颜色 */
  --text-primary: #111111;
}

.dark {
  /* 深色主题自定义 */
  --node-bg: #0F0F0F;
  --node-border: #2A2A2A;
}
```

### 创建自定义主题配置

```typescript
// lib/workflow/customTheme.ts

import { WorkflowTheme } from '@/lib/workflow/workflowTheme';

export const customTheme: WorkflowTheme = {
  node: {
    bg: '#F5F5F5',
    border: '#D0D0D0',
    borderHover: '#B0B0B0',
    selected: '#2563EB',
    selectedGlow: 'rgba(37, 99, 235, 0.2)',
    divider: '#E0E0E0',
    headerBg: '#EFEFEF',
  },
  // ... 其他配置
};
```

### 应用自定义主题

```tsx
import { WorkflowThemeProvider } from '@/lib/workflow/workflowTheme';
import { customTheme } from '@/lib/workflow/customTheme';

export default function CustomWorkflowPage() {
  return (
    <WorkflowThemeProvider theme={customTheme}>
      <WorkflowEditor />
    </WorkflowThemeProvider>
  );
}
```

---

## 最佳实践

### 1. 使用语义化变量

❌ **不推荐：**
```css
.my-node {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
}
```

✅ **推荐：**
```css
.my-node {
  background: var(--node-bg);
  border: 1px solid var(--node-border);
}
```

### 2. 提供Fallback值

```typescript
const nodeBg = getCSSVariable('--node-bg', '#FFFFFF');
```

### 3. 使用主题Hook

```tsx
const theme = useWorkflowTheme();
// 而不是直接访问CSS变量
```

### 4. 保持一致性

使用相同的间距、圆角、阴影值：

```css
.my-component {
  padding: 12px;           /* 标准间距 */
  border-radius: 8px;      /* 标准圆角 */
  box-shadow: var(--node-shadow);
}
```

### 5. 响应主题变化

```tsx
useEffect(() => {
  const handleThemeChange = () => {
    // 主题变化时的处理逻辑
  };
  
  window.addEventListener('themechange', handleThemeChange);
  return () => window.removeEventListener('themechange', handleThemeChange);
}, []);
```

### 6. 性能优化

```tsx
// 使用React.memo避免不必要的重渲染
const MyNode = React.memo(({ data }) => {
  const theme = useWorkflowTheme();
  
  // 使用useMemo缓存样式计算
  const nodeStyle = useMemo(() => ({
    background: theme.node.bg,
    border: `2px solid ${theme.node.border}`,
  }), [theme]);
  
  return <div style={nodeStyle}>{data.label}</div>;
});
```

---

## 故障排除

### 问题1: CSS变量未生效

**症状：** 组件显示默认颜色，CSS变量未应用

**解决方案：**
1. 确认`globals.css`已正确导入
2. 检查CSS变量是否在`:root`或`.dark`中定义
3. 清除浏览器缓存并重新加载

```bash
# 清除Next.js缓存
rm -rf .next
npm run dev
```

### 问题2: 主题切换不平滑

**症状：** 切换主题时颜色突变，没有过渡效果

**解决方案：**
添加CSS过渡：

```css
* {
  transition: background-color 0.2s ease,
              border-color 0.2s ease,
              color 0.2s ease;
}
```

### 问题3: 深色主题颜色对比度不足

**症状：** 深色主题下文本难以阅读

**解决方案：**
调整文本颜色变量：

```css
.dark {
  --text-primary: #F5F5F5;  /* 更亮的文本 */
  --text-secondary: #B0B0B0;
}
```

### 问题4: 自定义组件不响应主题

**症状：** 自定义组件在主题切换时不更新

**解决方案：**
使用`useWorkflowTheme` Hook：

```tsx
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

function MyComponent() {
  const theme = useWorkflowTheme();
  
  return (
    <div style={{ background: theme.node.bg }}>
      内容
    </div>
  );
}
```

### 问题5: 性能问题

**症状：** 大量节点时界面卡顿

**解决方案：**
1. 使用虚拟化列表
2. 使用React.memo优化组件
3. 使用CSS transform而非position进行动画

```tsx
import { VirtualizedParameterList } from '@/components/workflow/VirtualizedParameterList';

<VirtualizedParameterList
  parameters={largeParameterArray}
  itemHeight={60}
  maxHeight={400}
/>
```

---

## 代码示例

### 完整的自定义节点示例

```tsx
import React, { useMemo } from 'react';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';
import { NodeHeader } from '@/components/workflow/NodeHeader';
import { ParameterList } from '@/components/workflow/ParameterList';

interface CustomNodeProps {
  id: string;
  data: {
    label: string;
    icon: React.ReactNode;
    parameters: any[];
  };
  selected: boolean;
}

export const CustomNode: React.FC<CustomNodeProps> = React.memo(({ 
  id, 
  data, 
  selected 
}) => {
  const theme = useWorkflowTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [values, setValues] = React.useState({});

  const containerStyle = useMemo(() => ({
    background: theme.node.bg,
    border: `2px solid ${selected ? theme.node.selected : theme.node.border}`,
    borderRadius: '8px',
    boxShadow: selected ? theme.shadow.selected : theme.shadow.base,
    transition: 'all 0.2s ease',
  }), [theme, selected]);

  return (
    <div style={containerStyle}>
      <NodeHeader
        icon={data.icon}
        title={data.label}
        isCollapsed={isCollapsed}
        parameterCount={data.parameters.length}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      {!isCollapsed && (
        <ParameterList
          parameters={data.parameters}
          values={values}
          onChange={(name, value) => {
            setValues(prev => ({ ...prev, [name]: value }));
          }}
        />
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
```

### 主题切换示例

```tsx
import { useState } from 'react';
import { Button } from '@heroui/react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    
    // 触发主题变化事件
    window.dispatchEvent(new Event('themechange'));
  };

  return (
    <Button onClick={toggleTheme}>
      {isDark ? '🌞 浅色' : '🌙 深色'}
    </Button>
  );
}
```

---

## 相关资源

- [组件API文档](./WORKFLOW_COMPONENT_API.md)
- [迁移指南](./WORKFLOW_THEME_MIGRATION_GUIDE.md)
- [设计文档](../.kiro/specs/workflow-theme-redesign/design.md)
- [需求文档](../.kiro/specs/workflow-theme-redesign/requirements.md)

---

## 更新日志

### v2.0.0 (2024-10-24)
- ✨ 全新黑白灰主题系统
- ✨ 完整的浅色/深色主题支持
- ✨ 改进的动画和交互效果
- ✨ 增强的可访问性
- 🔧 性能优化

---

## 支持

如有问题或建议，请联系开发团队或提交Issue。
