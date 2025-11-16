# NodeHeader组件快速开始

## 5分钟快速上手

### 1. 导入组件

```tsx
import NodeHeader from '@/components/workflow/NodeHeader';
import { useNodeCollapse } from '@/hooks/useNodeCollapse';
import { Plane } from 'lucide-react';
```

### 2. 基础使用

```tsx
function MyNode({ id, data }) {
  const { toggleCollapse } = useNodeCollapse();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <NodeHeader
        icon={Plane}
        label="起飞"
        color="#64FFDA"
        isCollapsed={data.isCollapsed || false}
        onToggleCollapse={() => toggleCollapse(id)}
        onOpenAdvanced={() => setIsModalOpen(true)}
        parameterCount={3}
        hasErrors={false}
      />
    </div>
  );
}
```

### 3. 完整示例

```tsx
import React, { useState } from 'react';
import NodeHeader from '@/components/workflow/NodeHeader';
import { useNodeCollapse } from '@/hooks/useNodeCollapse';
import { ParameterValidationService } from '@/lib/workflow/parameterValidation';
import EnhancedNodeConfigModal from '@/components/EnhancedNodeConfigModal';
import { Plane } from 'lucide-react';

function TakeoffNode({ id, data }) {
  const { toggleCollapse } = useNodeCollapse();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 检查是否有错误
  const hasErrors = !ParameterValidationService.hasAllRequiredParameters(
    data.type,
    data.parameters
  );
  
  // 计算参数数量
  const parameterCount = Object.keys(data.parameters).length;
  
  const handleSave = (config) => {
    // 保存配置逻辑
  };
  
  return (
    <div className="workflow-node">
      {/* 节点头部 */}
      <NodeHeader
        icon={Plane}
        label={data.label}
        color="#64FFDA"
        isCollapsed={data.isCollapsed || false}
        onToggleCollapse={() => toggleCollapse(id)}
        onOpenAdvanced={() => setIsModalOpen(true)}
        parameterCount={parameterCount}
        hasErrors={hasErrors}
      />
      
      {/* 参数区域（折叠时隐藏） */}
      {!data.isCollapsed && (
        <div className="parameters">
          <div>高度: {data.parameters.height} cm</div>
          <div>速度: {data.parameters.speed} cm/s</div>
        </div>
      )}
      
      {/* 高级设置模态框 */}
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

## 常见场景

### 场景1: 显示错误警告

```tsx
// 检查必填参数
const hasErrors = !ParameterValidationService.hasAllRequiredParameters(
  data.type,
  data.parameters
);

<NodeHeader hasErrors={hasErrors} />
```

### 场景2: 自定义颜色

```tsx
// 不同节点类别使用不同颜色
const colors = {
  basic: '#64FFDA',
  movement: '#F59E0B',
  detection: '#8B5CF6',
  ai: '#EC4899',
};

<NodeHeader color={colors[data.category]} />
```

### 场景3: 动态参数数量

```tsx
// 自动计算参数数量
const parameterCount = useMemo(
  () => Object.keys(data.parameters).length,
  [data.parameters]
);

<NodeHeader parameterCount={parameterCount} />
```

## Props说明

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| icon | LucideIcon | ✅ | 节点图标 |
| label | string | ✅ | 节点标题 |
| color | string | ✅ | 节点颜色 |
| isCollapsed | boolean | ✅ | 是否折叠 |
| onToggleCollapse | () => void | ✅ | 折叠切换回调 |
| onOpenAdvanced | () => void | ✅ | 打开高级设置回调 |
| parameterCount | number | ✅ | 参数数量 |
| hasErrors | boolean | ✅ | 是否有错误 |

## 常见问题

### Q: 折叠状态不保存？
A: 确保使用`useNodeCollapse` hook或手动更新节点数据

```tsx
const { toggleCollapse } = useNodeCollapse();
<NodeHeader onToggleCollapse={() => toggleCollapse(id)} />
```

### Q: 高级设置模态框不显示？
A: 检查模态框状态管理

```tsx
const [isModalOpen, setIsModalOpen] = useState(false);
<NodeHeader onOpenAdvanced={() => setIsModalOpen(true)} />
<EnhancedNodeConfigModal isOpen={isModalOpen} />
```

### Q: 如何自定义样式？
A: 使用CSS覆盖或传入style props

```tsx
<div style={{ width: '300px' }}>
  <NodeHeader {...props} />
</div>
```

## 下一步

- 查看[完整文档](./NODE_HEADER_IMPLEMENTATION.md)
- 查看[示例代码](../components/workflow/NodeHeaderExample.tsx)
- 继续实现[Task 6: InlineParameterNode](../../.kiro/specs/workflow-inline-parameters/tasks.md)
