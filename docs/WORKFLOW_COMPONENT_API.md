# Workflow组件API文档

## 概述

本文档详细说明所有Workflow组件的API、Props、事件和使用方法。

## 目录

- [NodeHeader](#nodeheader)
- [InlineParameterNode](#inlineparameternode)
- [ParameterList](#parameterlist)
- [ParameterItem](#parameteritem)
- [参数编辑器](#参数编辑器)
- [ResizeHandle](#resizehandle)
- [AnimatedEdge](#animatededge)
- [主题相关](#主题相关)

---

## NodeHeader

节点头部组件，显示节点图标、标题、状态和控制按钮。

### Props

```typescript
interface NodeHeaderProps {
  // 必需属性
  icon: React.ReactNode;
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  
  // 可选属性
  parameterCount?: number;
  hasErrors?: boolean;
  isRunning?: boolean;
  onAdvancedSettings?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
```

### Props详解

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `icon` | `React.ReactNode` | ✅ | - | 节点图标 |
| `title` | `string` | ✅ | - | 节点标题 |
| `isCollapsed` | `boolean` | ✅ | - | 是否折叠 |
| `onToggleCollapse` | `() => void` | ✅ | - | 折叠/展开回调 |
| `parameterCount` | `number` | ❌ | 0 | 参数数量（折叠时显示徽章） |
| `hasErrors` | `boolean` | ❌ | false | 是否有错误 |
| `isRunning` | `boolean` | ❌ | false | 是否正在运行 |
| `onAdvancedSettings` | `() => void` | ❌ | - | 高级设置回调 |
| `className` | `string` | ❌ | '' | 自定义类名 |
| `style` | `CSSProperties` | ❌ | {} | 自定义样式 |

### 使用示例

```tsx
import { NodeHeader } from '@/components/workflow/NodeHeader';
import { CameraIcon } from '@heroicons/react/24/outline';

<NodeHeader
  icon={<CameraIcon className="w-6 h-6" />}
  title="拍照节点"
  isCollapsed={false}
  parameterCount={3}
  hasErrors={false}
  isRunning={false}
  onToggleCollapse={() => setCollapsed(!collapsed)}
  onAdvancedSettings={() => openSettings()}
/>
```


### 主题相关Props

NodeHeader自动应用主题颜色，支持以下主题变量：

- `--node-header-bg`: 头部背景色
- `--node-border`: 边框颜色
- `--text-primary`: 标题文本颜色
- `--text-secondary`: 图标颜色

### 可访问性

- 支持键盘导航（Tab键）
- 折叠按钮有`aria-label`
- 错误状态有`aria-live`通知

---

## InlineParameterNode

内联参数编辑节点，支持直接在节点上编辑参数。

### Props

```typescript
interface InlineParameterNodeProps {
  // ReactFlow节点属性
  id: string;
  data: NodeData;
  selected?: boolean;
  
  // 自定义属性
  onParameterChange?: (name: string, value: any) => void;
  onDelete?: () => void;
  className?: string;
}

interface NodeData {
  label: string;
  icon: React.ReactNode;
  parameters: Parameter[];
  status?: 'idle' | 'running' | 'success' | 'error';
  errors?: Record<string, string>;
}

interface Parameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'slider' | 'select' | 'boolean';
  value: any;
  description?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: any }>;
  unit?: string;
}
```

### Props详解

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | `string` | ✅ | - | 节点唯一ID |
| `data` | `NodeData` | ✅ | - | 节点数据 |
| `selected` | `boolean` | ❌ | false | 是否选中 |
| `onParameterChange` | `Function` | ❌ | - | 参数变化回调 |
| `onDelete` | `() => void` | ❌ | - | 删除节点回调 |
| `className` | `string` | ❌ | '' | 自定义类名 |

### 使用示例

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
        max: 100,
        description: "JPEG图片质量，0-100"
      },
      {
        name: "format",
        label: "图片格式",
        type: "select",
        value: "jpg",
        options: [
          { label: "JPEG", value: "jpg" },
          { label: "PNG", value: "png" }
        ]
      }
    ],
    status: 'idle'
  }}
  selected={false}
  onParameterChange={(name, value) => {
    console.log(`参数 ${name} 变更为 ${value}`);
  }}
/>
```

### 状态管理

节点支持以下状态：

- `idle`: 空闲状态（默认）
- `running`: 运行中（显示动画）
- `success`: 成功（绿色指示器）
- `error`: 错误（红色指示器）

### 主题相关Props

- `--node-bg`: 节点背景
- `--node-border`: 节点边框
- `--node-selected`: 选中边框
- `--node-shadow`: 节点阴影

---

## ParameterList

参数列表容器，支持虚拟化和动画。

### Props

```typescript
interface ParameterListProps {
  parameters: Parameter[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
  maxHeight?: number;
  virtualized?: boolean;
  animated?: boolean;
  className?: string;
}
```

### Props详解

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `parameters` | `Parameter[]` | ✅ | - | 参数定义数组 |
| `values` | `Record<string, any>` | ✅ | - | 参数值对象 |
| `onChange` | `Function` | ✅ | - | 值变化回调 |
| `errors` | `Record<string, string>` | ❌ | {} | 错误信息对象 |
| `maxHeight` | `number` | ❌ | 400 | 最大高度（px） |
| `virtualized` | `boolean` | ❌ | false | 是否启用虚拟化 |
| `animated` | `boolean` | ❌ | true | 是否启用动画 |
| `className` | `string` | ❌ | '' | 自定义类名 |

### 使用示例

```tsx
import { ParameterList } from '@/components/workflow/ParameterList';

const [values, setValues] = useState({
  altitude: 100,
  speed: 50,
  duration: 10
});

<ParameterList
  parameters={[
    {
      name: "altitude",
      label: "飞行高度",
      type: "number",
      value: 100,
      min: 20,
      max: 500,
      unit: "cm"
    },
    {
      name: "speed",
      label: "飞行速度",
      type: "slider",
      value: 50,
      min: 10,
      max: 100,
      unit: "cm/s"
    }
  ]}
  values={values}
  onChange={(name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }}
  maxHeight={400}
  animated={true}
/>
```

### 虚拟化

当参数数量超过20个时，建议启用虚拟化：

```tsx
<ParameterList
  parameters={largeParameterArray}
  values={values}
  onChange={handleChange}
  virtualized={true}
  maxHeight={400}
/>
```

---

## ParameterItem

单个参数编辑项。

### Props

```typescript
interface ParameterItemProps {
  parameter: Parameter;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  className?: string;
}
```

### Props详解

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `parameter` | `Parameter` | ✅ | - | 参数定义 |
| `value` | `any` | ✅ | - | 当前值 |
| `onChange` | `Function` | ✅ | - | 值变化回调 |
| `error` | `string` | ❌ | - | 错误信息 |
| `isEditing` | `boolean` | ❌ | false | 是否正在编辑 |
| `onEditStart` | `() => void` | ❌ | - | 开始编辑回调 |
| `onEditEnd` | `() => void` | ❌ | - | 结束编辑回调 |
| `className` | `string` | ❌ | '' | 自定义类名 |

### 使用示例

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
    description: "无人机飞行高度",
    required: true
  }}
  value={100}
  onChange={(value) => handleChange('altitude', value)}
  error={errors.altitude}
  isEditing={editingParam === 'altitude'}
  onEditStart={() => setEditingParam('altitude')}
  onEditEnd={() => setEditingParam(null)}
/>
```

### 验证

ParameterItem支持自动验证：

```tsx
const parameter = {
  name: "altitude",
  label: "飞行高度",
  type: "number",
  value: 100,
  min: 20,
  max: 500,
  required: true,
  validate: (value) => {
    if (value < 20) return "高度不能低于20cm";
    if (value > 500) return "高度不能超过500cm";
    return null;
  }
};
```

---

## 参数编辑器

### TextEditor

文本输入编辑器。

```typescript
interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: string;
}
```

**使用示例：**

```tsx
<TextEditor
  value={name}
  onChange={setName}
  placeholder="输入节点名称"
  maxLength={50}
/>
```

### NumberEditor

数字输入编辑器。

```typescript
interface NumberEditorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  error?: string;
}
```

**使用示例：**

```tsx
<NumberEditor
  value={altitude}
  onChange={setAltitude}
  min={20}
  max={500}
  step={10}
  unit="cm"
/>
```

### SliderEditor

滑块编辑器。

```typescript
interface SliderEditorProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  showValue?: boolean;
  disabled?: boolean;
}
```

**使用示例：**

```tsx
<SliderEditor
  value={speed}
  onChange={setSpeed}
  min={10}
  max={100}
  step={5}
  unit="cm/s"
  showValue={true}
/>
```

### SelectEditor

下拉选择编辑器。

```typescript
interface SelectEditorProps {
  value: any;
  onChange: (value: any) => void;
  options: Array<{ label: string; value: any }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}
```

**使用示例：**

```tsx
<SelectEditor
  value={format}
  onChange={setFormat}
  options={[
    { label: "JPEG", value: "jpg" },
    { label: "PNG", value: "png" },
    { label: "BMP", value: "bmp" }
  ]}
  placeholder="选择格式"
/>
```

### BooleanEditor

开关编辑器。

```typescript
interface BooleanEditorProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}
```

**使用示例：**

```tsx
<BooleanEditor
  value={enabled}
  onChange={setEnabled}
  label="启用自动对焦"
/>
```

---

## ResizeHandle

节点调整大小手柄。

### Props

```typescript
interface ResizeHandleProps {
  nodeId: string;
  onResize?: (width: number, height: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  showIndicator?: boolean;
}
```

### 使用示例

```tsx
<ResizeHandle
  nodeId="node-1"
  onResize={(w, h) => console.log(`新尺寸: ${w}x${h}`)}
  minWidth={280}
  minHeight={200}
  maxWidth={600}
  maxHeight={800}
  showIndicator={true}
/>
```

---

## AnimatedEdge

动画连接线。

### Props

```typescript
interface AnimatedEdgeProps {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  selected?: boolean;
  animated?: boolean;
  style?: React.CSSProperties;
}
```

### 使用示例

```tsx
<AnimatedEdge
  id="edge-1"
  source="node-1"
  target="node-2"
  sourceX={100}
  sourceY={50}
  targetX={300}
  targetY={150}
  selected={false}
  animated={true}
/>
```

---

## 主题相关

### useWorkflowTheme Hook

获取当前主题配置。

```typescript
function useWorkflowTheme(): WorkflowTheme;

interface WorkflowTheme {
  node: {
    bg: string;
    border: string;
    borderHover: string;
    selected: string;
    selectedGlow: string;
    divider: string;
    headerBg: string;
  };
  shadow: {
    base: string;
    hover: string;
    selected: string;
  };
  parameter: {
    bg: string;
    bgHover: string;
    bgEditing: string;
    bgError: string;
    border: string;
    borderHover: string;
    borderEditing: string;
    editingGlow: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  status: {
    error: string;
    success: string;
    warning: string;
    info: string;
  };
}
```

**使用示例：**

```tsx
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

function MyComponent() {
  const theme = useWorkflowTheme();
  
  return (
    <div style={{
      background: theme.node.bg,
      border: `2px solid ${theme.node.border}`,
      color: theme.text.primary
    }}>
      内容
    </div>
  );
}
```

### getCSSVariable 函数

获取CSS变量值。

```typescript
function getCSSVariable(name: string, fallback: string): string;
```

**使用示例：**

```typescript
import { getCSSVariable } from '@/lib/workflow/workflowTheme';

const nodeBg = getCSSVariable('--node-bg', '#FFFFFF');
const textPrimary = getCSSVariable('--text-primary', '#1A1A1A');
```

---

## 事件处理

### 参数变化事件

```typescript
type ParameterChangeHandler = (name: string, value: any) => void;

// 使用示例
const handleParameterChange: ParameterChangeHandler = (name, value) => {
  console.log(`参数 ${name} 变更为:`, value);
  
  // 更新状态
  setParameters(prev => ({
    ...prev,
    [name]: value
  }));
  
  // 验证
  const error = validateParameter(name, value);
  if (error) {
    setErrors(prev => ({ ...prev, [name]: error }));
  }
};
```

### 节点选择事件

```typescript
type NodeSelectHandler = (nodeId: string) => void;

const handleNodeSelect: NodeSelectHandler = (nodeId) => {
  setSelectedNode(nodeId);
  // 其他处理逻辑
};
```

### 节点删除事件

```typescript
type NodeDeleteHandler = (nodeId: string) => void;

const handleNodeDelete: NodeDeleteHandler = (nodeId) => {
  setNodes(nodes => nodes.filter(n => n.id !== nodeId));
  setEdges(edges => edges.filter(e => 
    e.source !== nodeId && e.target !== nodeId
  ));
};
```

---

## 类型定义

完整的TypeScript类型定义：

```typescript
// 参数类型
export type ParameterType = 
  | 'text' 
  | 'number' 
  | 'slider' 
  | 'select' 
  | 'boolean';

// 节点状态
export type NodeStatus = 
  | 'idle' 
  | 'running' 
  | 'success' 
  | 'error';

// 参数定义
export interface Parameter {
  name: string;
  label: string;
  type: ParameterType;
  value: any;
  description?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: any }>;
  unit?: string;
  validate?: (value: any) => string | null;
}

// 节点数据
export interface NodeData {
  label: string;
  icon: React.ReactNode;
  parameters: Parameter[];
  status?: NodeStatus;
  errors?: Record<string, string>;
}

// 主题配置
export interface WorkflowTheme {
  node: NodeTheme;
  shadow: ShadowTheme;
  parameter: ParameterTheme;
  text: TextTheme;
  status: StatusTheme;
}
```

---

## 相关文档

- [主题使用指南](./WORKFLOW_THEME_USAGE_GUIDE.md)
- [迁移指南](./WORKFLOW_THEME_MIGRATION_GUIDE.md)
- [设计文档](../.kiro/specs/workflow-theme-redesign/design.md)

---

## 更新日志

### v2.0.0 (2024-10-24)
- ✨ 全新组件API
- ✨ 完整TypeScript类型支持
- ✨ 改进的Props接口
- 📝 完整的API文档

---

最后更新: 2024-10-24
