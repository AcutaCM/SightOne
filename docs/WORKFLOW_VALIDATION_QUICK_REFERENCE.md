# 工作流验证系统 - 快速参考卡

## 一行代码验证

```typescript
import { validateWorkflow } from '@/lib/workflow/workflowValidator';
const result = validateWorkflow(nodes, edges);
```

## 验证内容

| 检查项 | 说明 | 错误类型 |
|--------|------|----------|
| ✅ 起始节点 | 必须有且仅有一个 | `missing_start` |
| ✅ 结束节点 | 必须至少有一个 | `missing_end` |
| ✅ 循环依赖 | 检测循环路径 | `circular_dependency` |
| ✅ 节点参数 | 验证必填和类型 | `invalid_parameter` |
| ✅ 连接有效性 | 验证源和目标节点 | `invalid_connection` |
| ⚠️ 孤立节点 | 没有任何连接 | `unreachable_node` |
| ⚠️ 不可达节点 | 无法从起始节点到达 | `unreachable_node` |
| ❌ 重复ID | 节点ID重复 | `duplicate_node_id` |

## 快速集成

### 1. 添加验证按钮

```tsx
import WorkflowValidationButton from '@/components/workflow/WorkflowValidationButton';

<WorkflowValidationButton nodes={nodes} edges={edges} />
```

### 2. 执行前检查

```typescript
import { canExecuteWorkflow } from '@/lib/workflow/workflowValidator';

const { canExecute, reason } = canExecuteWorkflow(nodes, edges);
if (!canExecute) alert(reason);
```

### 3. 显示验证面板

```tsx
import WorkflowValidationPanel from '@/components/workflow/WorkflowValidationPanel';

<WorkflowValidationPanel 
  nodes={nodes} 
  edges={edges}
  onNodeSelect={(id) => console.log(id)}
/>
```

## 验证结果

```typescript
interface ValidationResult {
  valid: boolean;              // 是否通过验证
  errors: ValidationError[];   // 错误列表
  warnings: ValidationWarning[]; // 警告列表
  suggestions: ValidationSuggestion[]; // 修复建议
}
```

## 常见错误修复

| 错误 | 修复方法 |
|------|----------|
| 缺少起始节点 | 添加"开始"节点 |
| 缺少结束节点 | 添加"结束"节点 |
| 循环依赖 | 删除循环中的某个连接 |
| 参数错误 | 双击节点填写必填参数 |
| 孤立节点 | 连接节点或删除 |

## API速查

```typescript
// 完整验证
validateWorkflow(nodes, edges): ValidationResult

// 执行前检查
canExecuteWorkflow(nodes, edges): { canExecute, reason }

// 节点状态
validator.getNodeValidationStatus(nodeId)

// 生成报告
validator.generateReport(): string
```

## 状态指示

- 🟢 **绿色**: 验证通过
- 🔴 **红色**: 有错误
- 🟡 **黄色**: 仅有警告
- ⚪ **灰色**: 未验证

## 文档链接

- 📖 [完整文档](./WORKFLOW_VALIDATION_SYSTEM.md)
- 🚀 [快速开始](./WORKFLOW_VALIDATION_QUICK_START.md)
- ✅ [验证清单](./WORKFLOW_VALIDATION_VERIFICATION.md)
- 📝 [实施总结](./TASK_12_IMPLEMENTATION_SUMMARY.md)
