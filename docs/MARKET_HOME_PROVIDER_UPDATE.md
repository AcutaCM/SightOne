# 应用市场主页更新 - 推荐助理和推荐提供商

## 更新概述

修改了 PureChat 组件的应用市场主页,参考提供的设计图,从助理数据库获取数据,并分为两个推荐分类:
- **推荐助理** (Recommended Assistants)
- **推荐提供商** (Recommended Providers)

## 修改内容

### 1. 数据获取逻辑

**文件**: `drone-analyzer-nextjs/components/ChatbotChat/MarketHome.tsx`

#### 状态管理
添加了新的状态来存储推荐提供商:
```typescript
const [recommendedProviders, setRecommendedProviders] = useState<Assistant[]>([]);
```

#### 数据加载
修改了 `useEffect` 中的数据加载逻辑:

```typescript
// Get recommended assistants (top 8 by usage and rating)
const recommended = await presetService.getRecommendedAssistants(8);
setRecommendedAssistants(recommended);

// Get recommended providers (assistants with high usage count, top 4)
const allPublished = await presetService.getAllPublishedAssistants({ pageSize: 100 });
const providers = allPublished.data
  .filter(a => (a.usageCount || 0) > 100) // Filter providers with high usage
  .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
  .slice(0, 4);
setRecommendedProviders(providers);
```

**推荐算法**:
- **推荐助理**: 使用 `getRecommendedAssistants(8)` 获取前 8 个助理,基于 `usageCount × rating` 的推荐分数
- **推荐提供商**: 筛选使用次数超过 100 的助理,按使用次数降序排序,取前 4 个

### 2. UI 布局更新

#### 推荐助理部分
```typescript
<div>
  <SectionTitle>{language === 'zh' ? '推荐助手' : 'Recommended Assistants'}</SectionTitle>
  <RecommendedSection
    assistants={recommendedAssistants}
    onSelect={handleSelectAssistant}
    loading={loading}
    language={language}
  />
</div>
```

#### 推荐提供商部分
新增了独立的推荐提供商展示区域:
```typescript
{recommendedProviders.length > 0 && (
  <div>
    <SectionTitle>{language === 'zh' ? '推荐提供商' : 'Recommended Providers'}</SectionTitle>
    <AssistantsGrid>
      {recommendedProviders.map(provider => (
        <AssistantCard key={provider.id}>
          {/* Provider card content */}
        </AssistantCard>
      ))}
    </AssistantsGrid>
  </div>
)}
```

### 3. 提供商卡片特性

推荐提供商卡片包含以下元素:
- **Emoji 图标**: 提供商的表情符号
- **标题和描述**: 提供商名称和简介
- **标签**: 最多显示 3 个标签
- **统计信息**:
  - 评分 (Rating)
  - 使用次数 (Usage Count)
  - "热门提供商" 标识
- **操作按钮**: "使用该助理聊天" 按钮

## 数据来源

所有数据均从助理数据库获取:
- 使用 `PresetAssistantsService` 服务
- 通过 `AssistantRepository` 访问 SQLite 数据库
- 数据包括: `id`, `title`, `desc`, `emoji`, `tags`, `usageCount`, `rating` 等字段

## 显示逻辑

推荐部分仅在以下条件下显示:
```typescript
const showRecommended = !selectedCategory && !debouncedSearchQuery;
```

即:
- 没有选择分类
- 没有搜索关键词

当用户进行筛选或搜索时,推荐部分会隐藏,只显示筛选结果。

## 响应式设计

使用现有的 `AssistantsGrid` 组件,自动适配不同屏幕尺寸:
- **桌面 (≥1280px)**: 4 列
- **桌面 (1025-1279px)**: 3 列
- **平板 (768-1024px)**: 2 列
- **移动 (<768px)**: 1 列

## 多语言支持

支持中英文双语:
- 中文: "推荐助手" / "推荐提供商" / "热门提供商"
- 英文: "Recommended Assistants" / "Recommended Providers" / "Top Provider"

## 性能优化

- 使用 `useMemo` 缓存服务实例
- 推荐数据在组件加载时一次性获取
- 利用 `PresetAssistantsService` 的缓存机制 (TTL: 10分钟)

## 测试建议

1. **数据加载测试**:
   - 验证推荐助理和推荐提供商是否正确加载
   - 检查加载状态和错误处理

2. **筛选测试**:
   - 选择分类后,推荐部分应隐藏
   - 搜索时,推荐部分应隐藏
   - 清除筛选后,推荐部分应重新显示

3. **交互测试**:
   - 点击提供商卡片的按钮,应正确激活助理
   - 验证助理激活后的聊天界面切换

4. **响应式测试**:
   - 在不同屏幕尺寸下测试布局
   - 验证卡片网格的列数变化

5. **多语言测试**:
   - 切换语言,验证文本显示正确

## 未来改进建议

1. **提供商筛选条件优化**:
   - 当前使用 `usageCount > 100` 作为提供商标准
   - 可以考虑添加更多维度,如评分、活跃度等

2. **提供商详情页**:
   - 为提供商创建专门的详情页
   - 展示提供商的所有助理和统计信息

3. **提供商认证**:
   - 添加提供商认证标识
   - 区分官方提供商和社区提供商

4. **动态推荐算法**:
   - 基于用户历史使用记录个性化推荐
   - 考虑时间因素,推荐最近热门的助理

## 相关文件

- `drone-analyzer-nextjs/components/ChatbotChat/MarketHome.tsx` - 主要修改文件
- `drone-analyzer-nextjs/lib/services/presetAssistantsService.ts` - 数据服务
- `drone-analyzer-nextjs/lib/db/assistantRepository.ts` - 数据访问层
- `drone-analyzer-nextjs/types/assistant.ts` - 类型定义

## 更新日期

2025-06-17
