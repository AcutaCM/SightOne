# 助理详情页面快速参考

## 快速开始

### 1. 显示助理详情

```tsx
import { AssistantDetail } from '@/components/ChatbotChat/AssistantDetail';

<AssistantDetail
  assistant={assistant}
  onBack={() => setShowDetail(false)}
  onUse={(assistant) => activateAssistant(assistant)}
  onFavorite={(id, favorited) => toggleFavorite(id, favorited)}
  isFavorited={false}
/>
```

### 2. 显示评分面板

```tsx
import { RatingPanel } from '@/components/ChatbotChat/RatingPanel';

<RatingPanel
  assistantId="tello-intelligent-agent"
  userId="user123"
  userRating={userRating}
  ratings={ratings}
  stats={stats}
  onSubmitRating={async (rating, feedback) => {
    await submitRating(rating, feedback);
  }}
  onLoadMore={() => loadMoreRatings()}
  hasMore={true}
/>
```

### 3. 使用评分服务

```typescript
import { getDefaultRatingService } from '@/lib/services/ratingService';

const service = getDefaultRatingService();

// 提交评分
service.submitRating({
  userId: 'user123',
  assistantId: 'assistant-id',
  rating: 5,
  feedback: '很好用！'
});

// 获取评分
const ratings = service.getRatings('assistant-id');

// 获取统计
const stats = service.getRatingStats('assistant-id');
```

## 组件属性

### AssistantDetail Props

| 属性 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `assistant` | `Assistant` | ✅ | 助理对象 |
| `onBack` | `() => void` | ❌ | 返回按钮回调 |
| `onUse` | `(assistant: Assistant) => void` | ❌ | 使用按钮回调 |
| `onFavorite` | `(id: string, favorited: boolean) => void` | ❌ | 收藏按钮回调 |
| `isFavorited` | `boolean` | ❌ | 是否已收藏 |
| `className` | `string` | ❌ | 自定义样式类 |

### RatingPanel Props

| 属性 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `assistantId` | `string` | ✅ | 助理ID |
| `userId` | `string` | ✅ | 用户ID |
| `userRating` | `Rating \| null` | ❌ | 用户的评分 |
| `ratings` | `Rating[]` | ❌ | 评分列表 |
| `stats` | `RatingStats` | ❌ | 评分统计 |
| `onSubmitRating` | `(rating: number, feedback?: string) => Promise<void>` | ❌ | 提交评分回调 |
| `onLoadMore` | `() => void` | ❌ | 加载更多回调 |
| `hasMore` | `boolean` | ❌ | 是否有更多 |
| `isLoading` | `boolean` | ❌ | 加载状态 |

## 服务方法

### RatingService

```typescript
class RatingService {
  // 提交评分
  submitRating(submission: RatingSubmission): Rating
  
  // 获取评分列表
  getRatings(assistantId: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'recent' | 'highest' | 'lowest';
  }): Rating[]
  
  // 获取用户评分
  getUserRating(userId: string, assistantId: string): Rating | null
  
  // 获取评分统计
  getRatingStats(assistantId: string): RatingStats
  
  // 删除评分
  deleteRating(userId: string, assistantId: string): boolean
}
```

## 数据类型

### Rating

```typescript
interface Rating {
  id: number;
  userId: string;
  assistantId: string;
  rating: number;        // 1-5
  feedback?: string;
  createdAt: string;
}
```

### RatingStats

```typescript
interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
```

### RatingSubmission

```typescript
interface RatingSubmission {
  userId: string;
  assistantId: string;
  rating: number;        // 1-5
  feedback?: string;
}
```

## 常见用例

### 1. 完整的详情页面

```tsx
function AssistantDetailPage({ assistantId }: { assistantId: string }) {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  
  useEffect(() => {
    loadAssistant();
    loadRatings();
  }, [assistantId]);
  
  const loadAssistant = async () => {
    const service = getDefaultPresetAssistantsService();
    const data = await service.getAssistantById(assistantId);
    setAssistant(data);
  };
  
  const loadRatings = async () => {
    const service = getDefaultRatingService();
    const ratingsData = service.getRatings(assistantId, { limit: 10 });
    const statsData = service.getRatingStats(assistantId);
    const userRatingData = service.getUserRating(userId, assistantId);
    
    setRatings(ratingsData);
    setStats(statsData);
    setUserRating(userRatingData);
  };
  
  const handleSubmitRating = async (rating: number, feedback?: string) => {
    const service = getDefaultRatingService();
    service.submitRating({
      userId,
      assistantId,
      rating,
      feedback
    });
    
    await loadRatings();
  };
  
  return (
    <div className="space-y-6">
      {assistant && (
        <AssistantDetail
          assistant={assistant}
          onBack={() => router.back()}
          onUse={handleUseAssistant}
          onFavorite={handleFavorite}
        />
      )}
      
      <RatingPanel
        assistantId={assistantId}
        userId={userId}
        userRating={userRating}
        ratings={ratings}
        stats={stats}
        onSubmitRating={handleSubmitRating}
      />
    </div>
  );
}
```

### 2. 在市场首页集成

```tsx
function MarketHome() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  
  const handleSelectAssistant = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setView('detail');
  };
  
  const handleBack = () => {
    setView('list');
    setSelectedAssistant(null);
  };
  
  if (view === 'detail' && selectedAssistant) {
    return (
      <AssistantDetailPage
        assistantId={selectedAssistant.id}
        onBack={handleBack}
      />
    );
  }
  
  return (
    <AssistantGrid
      assistants={assistants}
      onSelect={handleSelectAssistant}
    />
  );
}
```

### 3. API路由实现

```typescript
// app/api/assistants/[id]/ratings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultRatingService } from '@/lib/services/ratingService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, rating, feedback } = await request.json();
  const service = getDefaultRatingService();
  
  const result = service.submitRating({
    userId,
    assistantId: params.id,
    rating,
    feedback
  });
  
  return NextResponse.json(result);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const service = getDefaultRatingService();
  const ratings = service.getRatings(params.id, { limit, offset });
  const stats = service.getRatingStats(params.id);
  
  return NextResponse.json({ ratings, stats });
}
```

## 样式定制

### 自定义助理详情样式

```tsx
<AssistantDetail
  assistant={assistant}
  className="max-w-6xl mx-auto p-6"
  // ... other props
/>
```

### 自定义评分面板样式

```tsx
<RatingPanel
  assistantId={assistantId}
  userId={userId}
  className="bg-gray-50 rounded-lg p-4"
  // ... other props
/>
```

## 错误处理

```typescript
try {
  const service = getDefaultRatingService();
  service.submitRating({
    userId: 'user123',
    assistantId: 'assistant-id',
    rating: 5
  });
} catch (error) {
  if (error instanceof RatingServiceError) {
    console.error('Rating error:', error.code, error.message);
    // 显示用户友好的错误消息
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 性能优化提示

1. **使用数据缓存**
   ```typescript
   import useSWR from 'swr';
   
   const { data, mutate } = useSWR(
     `/api/assistants/${assistantId}/ratings`,
     fetcher
   );
   ```

2. **虚拟滚动长列表**
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual';
   ```

3. **防抖评分提交**
   ```typescript
   import { useDebouncedCallback } from 'use-debounce';
   
   const debouncedSubmit = useDebouncedCallback(
     (rating, feedback) => submitRating(rating, feedback),
     500
   );
   ```

## 相关文档

- [完整实现文档](./ASSISTANT_DETAIL_PAGE_COMPLETE.md)
- [预设助理服务](./PRESET_ASSISTANTS_SERVICE_GUIDE.md)
- [市场首页文档](./MARKET_HOME_QUICK_REFERENCE.md)
