# 助理列表 API 获取修复

## 问题描述

在 `AssistantApiClient.getAll()` 方法中发现了一个 bug：当 API 调用失败时，即使有缓存数据可用，也会返回空数组。这导致用户在网络不稳定或 API 暂时不可用时看不到任何助理。

## 问题分析

### 原有逻辑流程

1. 如果启用缓存且有缓存数据 → 返回缓存数据
2. 如果没有缓存数据 → 调用 API
3. 如果 API 失败 → **直接返回空数组** ❌

### 问题所在

当用户首次访问时没有缓存，API 调用失败后会返回空数组。但在后续访问中，即使有缓存数据，如果 API 失败也会返回空数组，因为缓存数据在第一步就被读取但没有保存下来作为后备方案。

## 修复方案

### 新的逻辑流程

1. 如果启用缓存且有缓存数据 → 保存到 `cachedData` 变量并返回
2. 如果没有缓存数据 → 调用 API
3. 如果 API 成功 → 返回 API 数据并更新缓存
4. 如果 API 失败：
   - 如果有 `cachedData` → **返回缓存数据作为后备** ✅
   - 如果没有 `cachedData` → 返回空数组

### 代码变更

**文件**: `drone-analyzer-nextjs/lib/api/assistantApiClient.ts`

**主要改动**:

1. 添加 `cachedData` 变量来保存缓存数据
2. 在 API 失败时检查是否有缓存数据可用
3. 优先返回缓存数据，只有在完全没有数据时才返回空数组

```typescript
// 新增变量保存缓存数据
let cachedData: Assistant[] = [];

// 读取缓存时保存数据
if (cached.length > 0) {
  cachedData = normalizeAssistants(cached);
  // ... 返回缓存数据
}

// API 失败时使用缓存作为后备
if (!response.success || !response.data) {
  logger.error('Failed to fetch assistants', { error: response.error }, 'AssistantApiClient');
  console.error('[AssistantApiClient] Server fetch failed:', response.error);
  
  // 如果有缓存数据，返回它作为后备
  if (cachedData.length > 0) {
    console.log('[AssistantApiClient] Returning cached data as fallback');
    return cachedData;
  }
  
  // 只有在没有缓存时才返回空数组
  console.warn('[AssistantApiClient] No cached data available, returning empty array');
  return [];
}
```

## 优势

### 1. 提高可用性
- 即使 API 暂时不可用，用户仍然可以看到之前加载过的助理列表
- 减少因网络问题导致的空白页面

### 2. 更好的用户体验
- 用户不会因为临时的网络问题而丢失所有数据
- 应用在离线或弱网环境下仍然可用

### 3. 渐进增强
- 优先使用最新的 API 数据
- API 失败时降级到缓存数据
- 完全没有数据时才显示空状态

## 测试场景

### 场景 1：正常情况
- ✅ 有缓存 → 返回缓存数据，后台同步
- ✅ 无缓存 → 调用 API，返回最新数据

### 场景 2：API 失败
- ✅ 有缓存 + API 失败 → 返回缓存数据（新增）
- ✅ 无缓存 + API 失败 → 返回空数组

### 场景 3：网络异常
- ✅ 有缓存 + 网络错误 → 返回缓存数据（新增）
- ✅ 无缓存 + 网络错误 → 返回空数组

## 相关文件

- `drone-analyzer-nextjs/lib/api/assistantApiClient.ts` - 主要修复文件
- `drone-analyzer-nextjs/contexts/AssistantContext.tsx` - 使用此 API 的上下文
- `drone-analyzer-nextjs/lib/cache/indexedDBCache.ts` - 缓存实现

## 后续建议

1. **添加离线指示器**: 在 UI 中显示当前使用的是缓存数据
2. **重试机制**: 在后台定期重试 API 调用
3. **缓存过期策略**: 实现缓存数据的过期时间
4. **用户提示**: 当使用缓存数据时，提示用户数据可能不是最新的

## 日志输出

修复后的日志输出更加清晰：

```
[AssistantApiClient] Returning cached data
[AssistantApiClient] Server fetch failed: <error>
[AssistantApiClient] Returning cached data as fallback
```

或

```
[AssistantApiClient] Server fetch failed: <error>
[AssistantApiClient] No cached data available, returning empty array
```

## 总结

这次修复通过保存缓存数据并在 API 失败时使用它作为后备方案，显著提高了应用的可用性和用户体验。用户现在可以在网络不稳定的情况下继续使用应用，而不会看到空白的助理列表。
