# NodeHeader组件实现文档

## 概述

NodeHeader组件是工作流节点的头部组件，提供节点标识、状态显示和操作控制功能。

## 功能特性

### 1. 节点标识
- **图标显示**：使用Lucide图标库显示节点类型图标
- **标题显示**：显示节点名称，支持文本截断
- **颜色主题**：根据节点类别使用不同的颜色主题

### 2. 折叠/展开功能
- **折叠按钮**：点击切换参数区域的显示/隐藏
- **动画效果**：使用framer-motion提供流畅的过渡动画
- **状态持久化**：折叠状态保存在节点数据中
- **参数徽章**：折叠时显示参数数量

### 3. 高级设置
- **设置按钮**：点击打开EnhancedNodeConfigModal
- **完整配置**：提供所有参数的详细配置界面
- **预设模板**：支持应用预设参数模板
- **文档查看**：查看节点使用说明

### 4. 错误提示
- **警告图标**：有未配置必填参数时显示
- **视觉反馈**：使用红色图标提醒用户
- **动画效果**：图标出现时有弹性动画

## 组件接口

```typescript
interface NodeHeaderProps {
  /** 节点图标组件 */
  icon: LucideIcon;
  /** 节点标题 */
  label: string;
  /** 节点颜色（用于图标和边框） */
  color: string;
  /** 是否折叠参数区域 */
  isCollapsed: boolean;
  /** 折叠/展开切换回调 */
  onToggleCollapse: () => void;
  /** 打开高级设置回调 */
  onOpenAdvanced: () => void;
  /** 参数数量（折叠时显示） */
  parameterCount: number;
  /** 是否有验证错误（未配置必填参数） */
  hasErrors: boolean;
}
```

## 使用示例

### 基础使用

```tsx
import NodeHeader from '@/components/workflow/NodeHeader';
import { Plane } from 'lucide-react';

function MyNode() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <NodeHeader
      icon={Plane}
      label="起飞"
      color="#64FFDA"
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      onOpenAdvanced={() => console.log('Open advanced settings')}
      parameterCount={3}
      hasErrors={false}
    />
  );
}
```

### 集成到InlineParameterNode

```tsx
import NodeHeader from '@/components/workflow/NodeHeader';
import { useNodeCollapse } from '@/hooks/useNodeCollapse';
import { ParameterValidationService } from '@/lib/workflow/parameterValidation';

function InlineParameterNode({ id, data }) {
  const { toggleCollapse } = useNodeCollapse();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 检查是否有错误
  const hasErrors = !ParameterValidationService.hasAllRequiredParameters(
    data.type,
    data.parameters
  );
  
  // 计算参数数量
  const parameterCount = Object.keys(data.parameters).length;
  
  return (
    <div className="inline-parameter-node">
      <NodeHeader
        icon={data.icon}
        label={data.label}
        color={data.color}
        isCollapsed={data.isCollapsed || false}
        onToggleCollapse={() => toggleCollapse(id)}
        onOpenAdvanced={() => setIsModalOpen(true)}
        parameterCount={parameterCount}
        hasErrors={hasErrors}
      />
      
      {!data.isCollapsed && (
        <ParameterList parameters={data.parameters} />
      )}
      
      <EnhancedNodeConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nodeConfig={data}
        onSave={handleSave}
      />
    </div>
  );
}
```

## 样式定制

### 颜色主题

NodeHeader使用节点的颜色主题：

```typescript
// 不同节点类别的颜色
const colors = {
  basic: '#64FFDA',    // 青色
  movement: '#F59E0B', // 橙色
  detection: '#8B5CF6', // 紫色
  ai: '#EC4899',       // 粉色
  logic: '#10B981',    // 绿色
};
```

### 自定义样式

可以通过CSS覆盖默认样式：

```css
.node-header {
  /* 自定义头部样式 */
}

.icon-button {
  /* 自定义按钮样式 */
}
```

## 动画效果

### 折叠/展开动画

```typescript
// 头部圆角动画
animate={{
  borderRadius: isCollapsed ? '8px' : '8px 8px 0 0',
}}
transition={{ duration: 0.3, ease: 'easeInOut' }}
```

### 按钮悬停动画

```typescript
whileHover={{ 
  scale: 1.1, 
  backgroundColor: 'rgba(100, 255, 218, 0.1)' 
}}
whileTap={{ scale: 0.95 }}
```

### 图标旋转动画

```typescript
// 折叠按钮图标旋转
animate={{ rotate: isCollapsed ? 0 : 180 }}
transition={{ duration: 0.3 }}
```

### 错误图标弹出动画

```typescript
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', stiffness: 500, damping: 15 }}
```

## 集成指南

### 1. 安装依赖

```bash
npm install framer-motion lucide-react
```

### 2. 导入组件

```typescript
import NodeHeader from '@/components/workflow/NodeHeader';
import { useNodeCollapse } from '@/hooks/useNodeCollapse';
```

### 3. 配置节点数据

确保节点数据包含以下字段：

```typescript
interface NodeData {
  id: string;
  type: string;
  label: string;
  icon: LucideIcon;
  color: string;
  parameters: Record<string, any>;
  isCollapsed?: boolean; // 折叠状态
}
```

### 4. 实现回调函数

```typescript
// 折叠/展开
const { toggleCollapse } = useNodeCollapse();

// 高级设置
const [isModalOpen, setIsModalOpen] = useState(false);
const handleOpenAdvanced = () => setIsModalOpen(true);

// 错误检查
const hasErrors = !ParameterValidationService.hasAllRequiredParameters(
  nodeType,
  parameters
);
```

## 最佳实践

### 1. 性能优化

- 使用`React.memo`包装NodeHeader避免不必要的重渲染
- 使用`useCallback`缓存回调函数
- 避免在渲染函数中创建新对象

```typescript
const NodeHeaderMemo = React.memo(NodeHeader);

const handleToggle = useCallback(() => {
  toggleCollapse(id);
}, [id, toggleCollapse]);
```

### 2. 错误处理

- 始终验证必填参数
- 提供清晰的错误提示
- 使用视觉反馈引导用户

```typescript
const hasErrors = useMemo(() => {
  return !ParameterValidationService.hasAllRequiredParameters(
    data.type,
    data.parameters
  );
}, [data.type, data.parameters]);
```

### 3. 可访问性

- 为按钮添加title属性
- 使用语义化的HTML元素
- 确保键盘导航支持

```typescript
<button
  title="折叠参数"
  aria-label="折叠参数区域"
  onClick={onToggleCollapse}
>
  <ChevronDown />
</button>
```

## 故障排除

### 问题1：折叠状态不持久化

**原因**：节点数据未正确更新

**解决方案**：
```typescript
// 确保使用useNodeCollapse hook
const { toggleCollapse } = useNodeCollapse();

// 或手动更新节点数据
setNodes((nodes) =>
  nodes.map((node) =>
    node.id === nodeId
      ? { ...node, data: { ...node.data, isCollapsed: !node.data.isCollapsed } }
      : node
  )
);
```

### 问题2：高级设置模态框不显示

**原因**：模态框状态管理错误

**解决方案**：
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);

<NodeHeader
  onOpenAdvanced={() => setIsModalOpen(true)}
/>

<EnhancedNodeConfigModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
/>
```

### 问题3：动画卡顿

**原因**：组件重渲染过于频繁

**解决方案**：
```typescript
// 使用React.memo优化
const NodeHeaderMemo = React.memo(NodeHeader);

// 使用useMemo缓存计算结果
const parameterCount = useMemo(
  () => Object.keys(parameters).length,
  [parameters]
);
```

## 相关文档

- [ParameterList组件](./PARAMETER_LIST_IMPLEMENTATION.md)
- [ParameterItem组件](./PARAMETER_ITEM_IMPLEMENTATION.md)
- [参数验证服务](../lib/workflow/parameterValidation.ts)
- [EnhancedNodeConfigModal](../components/EnhancedNodeConfigModal.tsx)

## 更新日志

### v1.0.0 (2024-10-22)
- ✅ 初始实现
- ✅ 折叠/展开功能
- ✅ 高级设置按钮
- ✅ 错误警告图标
- ✅ 参数数量徽章
- ✅ 动画效果
