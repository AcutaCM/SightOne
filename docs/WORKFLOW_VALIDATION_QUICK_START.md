# 工作流验证系统 - 快速开始

## 5分钟快速上手

### 1. 基础验证

```typescript
import { validateWorkflow } from '@/lib/workflow/workflowValidator';

// 验证工作流
const result = validateWorkflow(nodes, edges);

console.log(result.valid);        // true/false
console.log(result.errors);       // 错误列表
console.log(result.warnings);     // 警告列表
console.log(result.suggestions);  // 修复建议
```

### 2. 添加验证按钮

```tsx
import WorkflowValidationButton from '@/components/workflow/WorkflowValidationButton';

<WorkflowValidationButton
  nodes={nodes}
  edges={edges}
  onNodeSelect={(nodeId) => {
    // 定位到有问题的节点
  }}
/>
```

### 3. 执行前检查

```typescript
import { canExecuteWorkflow } from '@/lib/workflow/workflowValidator';

const { canExecute, reason } = canExecuteWorkflow(nodes, edges);

if (!canExecute) {
  alert(`无法执行: ${reason}`);
  return;
}

// 执行工作流
await workflowEngine.execute();
```

### 4. 显示验证面板

```tsx
import WorkflowValidationPanel from '@/components/workflow/WorkflowValidationPanel';

<WorkflowValidationPanel
  nodes={nodes}
  edges={edges}
  onClose={() => setShowPanel(false)}
  onNodeSelect={handleNodeSelect}
/>
```

## 验证内容

### ✅ 自动检查

1. **起始节点**: 必须有且仅有一个
2. **结束节点**: 必须至少有一个
3. **循环依赖**: 检测并报告循环路径
4. **节点参数**: 验证所有必填参数和类型
5. **连接有效性**: 确保所有连接有效
6. **孤立节点**: 检测没有连接的节点
7. **不可达节点**: 检测无法从起始节点到达的节点

### 💡 智能建议

- 添加缺失的起始/结束节点
- 修复参数错误
- 移除孤立节点
- 解决循环依赖

## 常见问题

### Q: 如何修复"缺少起始节点"错误？

A: 从节点库拖拽"开始"节点到画布

### Q: 如何修复循环依赖？

A: 删除循环路径中的某个连接

### Q: 如何修复参数错误？

A: 双击节点，在配置对话框中填写必填参数

### Q: 验证会影响性能吗？

A: 不会，验证使用防抖和缓存优化，对大型工作流也很快

## 示例

### 完整的工作流编辑器集成

```tsx
'use client';

import { useState } from 'react';
import ReactFlow from 'reactflow';
import WorkflowValidationButton from '@/components/workflow/WorkflowValidationButton';
import { WorkflowExecutionGuard } from '@/components/workflow/WorkflowValidationButton';
import { canExecuteWorkflow } from '@/lib/workflow/workflowValidator';

export default function WorkflowEditor() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showGuard, setShowGuard] = useState(false);

  const handleExecute = () => {
    const { canExecute } = canExecuteWorkflow(nodes, edges);
    
    if (!canExecute) {
      setShowGuard(true);
      return;
    }
    
    // 执行工作流
    executeWorkflow();
  };

  return (
    <div className="workflow-editor">
      {/* 工具栏 */}
      <div className="toolbar">
        <WorkflowValidationButton
          nodes={nodes}
          edges={edges}
          onNodeSelect={(nodeId) => {
            // 定位到节点
          }}
        />
        <button onClick={handleExecute}>执行</button>
      </div>

      {/* 画布 */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
      />

      {/* 执行守卫 */}
      {showGuard && (
        <WorkflowExecutionGuard
          nodes={nodes}
          edges={edges}
          onProceed={() => {
            setShowGuard(false);
            executeWorkflow();
          }}
          onCancel={() => setShowGuard(false)}
        />
      )}
    </div>
  );
}
```

## 下一步

- 查看 [完整文档](./WORKFLOW_VALIDATION_SYSTEM.md)
- 查看 [工作流系统文档](./WORKFLOW_NODE_SYSTEM_COMPLETE.md)
- 查看 [AI生成器文档](./AI_WORKFLOW_GENERATOR_COMPLETE.md)

## 需要帮助？

如果遇到问题，请检查：
1. 节点和边的数据格式是否正确
2. 是否正确导入了验证函数
3. 查看浏览器控制台的错误信息
