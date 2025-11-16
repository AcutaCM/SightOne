# AssistantContext 删除处理 - 快速参考

## 核心改进

### 1. deleteAssistant 方法

```typescript
// 使用方式
const { deleteAssistant } = useAssistants();

try {
  await deleteAssistant(assistantId);
  // 删除成功
} catch (error) {
  // 删除失败，状态已自动回滚
  console.error('Delete failed:', error);
}
```

**特性：**
- ✅ 乐观更新：立即从 UI 移除
- ✅ 等待完成：等待服务器和缓存删除
- ✅ 自动回滚：失败时恢复之前的状态
- ✅ 强制刷新：失败后从服务器获取最新数据

### 2. refreshAssistants 方法

```typescript
// 使用方式
const { refreshAssistants } = useAssistants();

// 强制从服务器刷新（默认）
await refreshAssistants();
// 或
await refreshAssistants(false);

// 允许使用缓存
await refreshAssistants(true);
```

**参数：**
- `useCache` (boolean, 默认: false)
  - `false`: 强制从服务器获取最新数据
  - `true`: 允许使用缓存（如果可用）

**使用场景：**
- 删除失败后：`refreshAssistants(false)` - 强制刷新
- 版本冲突后：`refreshAssistants(false)` - 强制刷新
- 常规刷新：`refreshAssistants(true)` - 可使用缓存

## 错误处理流程

```
用户删除助理
    ↓
保存当前状态 (previousList)
    ↓
乐观更新 UI (移除助理)
    ↓
调用 API 删除
    ↓
    ├─ 成功 → 完成
    │
    └─ 失败 → 回滚状态 (恢复 previousList)
              ↓
              强制从服务器刷新 (useCache: false)
              ↓
              抛出错误给调用者
```

## 关键代码片段

### 状态保存和回滚

```typescript
// 保存状态
const previousList = assistantList;

// 删除失败时回滚
setAssistantList(previousList);
```

### 强制刷新

```typescript
// 删除失败后强制刷新
try {
  await refreshAssistants(false); // 不使用缓存
} catch (refreshErr) {
  // 即使刷新失败，状态也已回滚
}
```

## 日志输出

### 正常删除

```
[AssistantContext] Deleting assistant abc123
[AssistantApiClient] Server delete successful for abc123, removing from cache
[AssistantApiClient] Successfully removed abc123 from cache
[AssistantContext] Successfully deleted assistant abc123
```

### 删除失败

```
[AssistantContext] Deleting assistant abc123
[AssistantContext] Failed to delete assistant: Error message
[AssistantContext] Rolling back delete for abc123
[AssistantContext] Refreshing from server after delete failure
[AssistantContext] Refreshing assistants from server (bypassing cache)
[AssistantContext] Refresh complete: 5 assistants loaded
```

## 测试检查清单

- [ ] 删除成功后，助理从 UI 移除
- [ ] 刷新页面后，已删除的助理不再显示
- [ ] 删除失败时，显示错误提示
- [ ] 删除失败时，助理仍在列表中（状态已回滚）
- [ ] 网络错误时，状态正确回滚
- [ ] 缓存删除失败时，触发后台同步
- [ ] 版本冲突时，从服务器刷新数据

## 常见问题

### Q: 删除后刷新页面，助理又出现了？
A: 这个问题已修复。现在删除操作会：
1. 等待缓存删除完成
2. 如果缓存删除失败，触发后台同步
3. 确保缓存与服务器状态一致

### Q: 删除失败后，UI 状态不对？
A: 现在删除失败会自动回滚状态，并从服务器刷新最新数据。

### Q: 如何强制从服务器刷新？
A: 调用 `refreshAssistants(false)` 或 `refreshAssistants()`（默认就是 false）

### Q: 什么时候使用缓存刷新？
A: 只在常规刷新场景下使用 `refreshAssistants(true)`，错误场景应该强制从服务器刷新。

## 相关需求

- 需求 2.1: 后台同步优化
- 需求 3.1: 删除操作错误处理 - 服务器删除失败
- 需求 3.2: 删除操作错误处理 - 回滚本地状态
- 需求 3.3: 删除操作错误处理 - 不从缓存移除数据

## 更新日期

2024-11-03
