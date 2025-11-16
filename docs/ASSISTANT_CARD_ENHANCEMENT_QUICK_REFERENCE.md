# 助理卡片增强 - 快速参考

## 快速开始

### 1. 使用 AssistantCard 组件

```tsx
import { AssistantCard } from '@/components/ChatbotChat/AssistantCard';

function MyComponent() {
  const handleSelect = (assistant: Assistant) => {
    console.log('Selected:', assistant.title);
  };

  const handleFavorite = (assistantId: string, isFavorited: boolean) => {
    console.log('Favorite toggled:', assistantId, isFavorited);
  };

  return (
    <AssistantCard
      assistant={assistant}
      onSelect={handleSelect}
      onFavorite={handleFavorite}
      isFavorited={false}
      showStats={true}
    />
  );
}
```

### 2. 使用 FavoriteService

```typescript
import { favoriteService } from '@/lib/services/favoriteService';

// 切换收藏状态
const isFavorited = await favoriteService.toggleFavorite(userEmail, assistantId);

// 获取用户的收藏列表
const favorites = await favoriteService.getFavorites(userEmail);

// 检查是否已收藏
const favorited = await favoriteService.isFavorited(userEmail, assistantId);

// 获取收藏的助理完整数据
const assistants = await favoriteService.getFavoritedAssistants(userEmail);
```

### 3. 使用 FavoriteList 组件

```tsx
import { FavoriteList, CompactFavoriteList } from '@/components/ChatbotChat/FavoriteList';

// 完整版收藏列表
<FavoriteList
  onSelectAssistant={(assistant) => console.log('Selected:', assistant)}
  onSwitchToChat={() => console.log('Switch to chat')}
/>

// 紧凑版收藏列表（适用于侧边栏）
<CompactFavoriteList
  onSelectAssistant={(assistant) => console.log('Selected:', assistant)}
  onSwitchToChat={() => console.log('Switch to chat')}
  className="w-full"
/>
```

## 组件 Props

### AssistantCard

| Prop | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `assistant` | `Assistant` | ✅ | - | 助理对象 |
| `onSelect` | `(assistant: Assistant) => void` | ❌ | - | 选择助理的回调 |
| `onFavorite` | `(id: string, favorited: boolean) => void` | ❌ | - | 收藏切换的回调 |
| `isFavorited` | `boolean` | ❌ | `false` | 是否已收藏 |
| `showStats` | `boolean` | ❌ | `true` | 是否显示统计信息 |
| `className` | `string` | ❌ | `''` | 自定义CSS类 |

### FavoriteList / CompactFavoriteList

| Prop | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `onSelectAssistant` | `(assistant: Assistant) => void` | ❌ | - | 选择助理的回调 |
| `onSwitchToChat` | `() => void` | ❌ | - | 切换到聊天界面的回调 |
| `className` | `string` | ❌ | `''` | 自定义CSS类 |

## FavoriteService API

### 方法列表

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `toggleFavorite` | `userId: string, assistantId: string` | `Promise<boolean>` | 切换收藏状态，返回新状态 |
| `getFavorites` | `userId: string` | `Promise<AssistantFavorite[]>` | 获取用户的收藏列表 |
| `getFavoriteIds` | `userId: string` | `Promise<Set<string>>` | 获取收藏的助理ID集合 |
| `isFavorited` | `userId: string, assistantId: string` | `Promise<boolean>` | 检查是否已收藏 |
| `getFavoriteCount` | `assistantId: string` | `Promise<number>` | 获取助理的收藏数量 |
| `getFavoritedAssistants` | `userId: string` | `Promise<any[]>` | 获取收藏的助理完整数据 |
| `removeFavoritesForAssistant` | `assistantId: string` | `Promise<void>` | 删除助理的所有收藏 |

## 数据库表结构

### favorites 表

```sql
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  assistant_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, assistant_id),
  FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
);
```

### 索引

```sql
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_assistant ON favorites(assistant_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);
```

## 常见用例

### 1. 在市场首页显示助理卡片

```tsx
import { AssistantCard } from '@/components/ChatbotChat/AssistantCard';
import { favoriteService } from '@/lib/services/favoriteService';
import { useCurrentUser } from '@/hooks/useCurrentUser';

function MarketHome() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const currentUser = useCurrentUser();

  useEffect(() => {
    loadAssistants();
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (currentUser?.email) {
      const ids = await favoriteService.getFavoriteIds(currentUser.email);
      setFavoriteIds(ids);
    }
  };

  const handleFavorite = async (assistantId: string, isFavorited: boolean) => {
    if (currentUser?.email) {
      await favoriteService.toggleFavorite(currentUser.email, assistantId);
      loadFavorites(); // 重新加载收藏状态
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assistants.map(assistant => (
        <AssistantCard
          key={assistant.id}
          assistant={assistant}
          isFavorited={favoriteIds.has(assistant.id)}
          onFavorite={handleFavorite}
        />
      ))}
    </div>
  );
}
```

### 2. 显示收藏列表

```tsx
import { FavoriteList } from '@/components/ChatbotChat/FavoriteList';
import { useAssistants } from '@/contexts/AssistantContext';

function MyFavoritesPage() {
  const { activateAssistant } = useAssistants();

  const handleSelectAssistant = async (assistant: Assistant) => {
    await activateAssistant(assistant.id);
  };

  const handleSwitchToChat = () => {
    // 切换到聊天界面的逻辑
    router.push('/chat');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">我的收藏</h1>
      <FavoriteList
        onSelectAssistant={handleSelectAssistant}
        onSwitchToChat={handleSwitchToChat}
      />
    </div>
  );
}
```

### 3. 侧边栏显示紧凑收藏列表

```tsx
import { CompactFavoriteList } from '@/components/ChatbotChat/FavoriteList';

function Sidebar() {
  return (
    <div className="w-64 bg-background border-r">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3">快速访问</h3>
        <CompactFavoriteList
          onSelectAssistant={(assistant) => {
            console.log('Quick launch:', assistant.title);
          }}
        />
      </div>
    </div>
  );
}
```

## 样式定制

### 自定义卡片样式

```tsx
<AssistantCard
  assistant={assistant}
  className="border-2 border-primary hover:shadow-2xl"
/>
```

### 自定义收藏列表样式

```tsx
<FavoriteList
  className="max-w-4xl mx-auto"
/>
```

## 错误处理

### 处理收藏失败

```typescript
try {
  const isFavorited = await favoriteService.toggleFavorite(userId, assistantId);
  console.log('Success:', isFavorited);
} catch (error) {
  console.error('Failed to toggle favorite:', error);
  // 显示错误提示
  showNotification({
    type: 'error',
    message: '收藏操作失败，请稍后重试'
  });
}
```

### 处理加载失败

```typescript
try {
  const favorites = await favoriteService.getFavorites(userId);
  setFavorites(favorites);
} catch (error) {
  console.error('Failed to load favorites:', error);
  setError('加载收藏列表失败');
}
```

## 性能优化

### 1. 使用 Set 进行快速查找

```typescript
// 不推荐：O(n) 查找
const isFavorited = favorites.some(f => f.assistantId === assistantId);

// 推荐：O(1) 查找
const favoriteIds = await favoriteService.getFavoriteIds(userId);
const isFavorited = favoriteIds.has(assistantId);
```

### 2. 批量加载收藏状态

```typescript
// 一次性加载所有收藏ID
const favoriteIds = await favoriteService.getFavoriteIds(userId);

// 在渲染时使用
assistants.map(assistant => (
  <AssistantCard
    key={assistant.id}
    assistant={assistant}
    isFavorited={favoriteIds.has(assistant.id)}
  />
))
```

### 3. 本地状态管理

```typescript
// 使用本地状态避免频繁数据库查询
const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

const handleFavorite = async (assistantId: string, isFavorited: boolean) => {
  // 立即更新UI
  setFavoriteIds(prev => {
    const newSet = new Set(prev);
    if (isFavorited) {
      newSet.add(assistantId);
    } else {
      newSet.delete(assistantId);
    }
    return newSet;
  });

  // 异步更新数据库
  try {
    await favoriteService.toggleFavorite(userId, assistantId);
  } catch (error) {
    // 失败时回滚
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.delete(assistantId);
      } else {
        newSet.add(assistantId);
      }
      return newSet;
    });
  }
};
```

## 调试技巧

### 1. 查看收藏状态

```typescript
// 在浏览器控制台
import { favoriteService } from '@/lib/services/favoriteService';

// 查看用户的所有收藏
const favorites = await favoriteService.getFavorites('user@example.com');
console.table(favorites);

// 查看助理的收藏数量
const count = await favoriteService.getFavoriteCount('assistant-id');
console.log('Favorite count:', count);
```

### 2. 数据库查询

```sql
-- 查看所有收藏
SELECT * FROM favorites;

-- 查看特定用户的收藏
SELECT * FROM favorites WHERE user_id = 'user@example.com';

-- 查看特定助理的收藏数量
SELECT COUNT(*) FROM favorites WHERE assistant_id = 'assistant-id';
```

## 故障排除

### 问题：收藏按钮不工作

**解决方案**：
1. 检查用户是否已登录
2. 检查 `onFavorite` 回调是否正确传递
3. 检查数据库连接是否正常
4. 查看浏览器控制台的错误信息

### 问题：收藏列表为空

**解决方案**：
1. 确认用户已登录
2. 检查数据库中是否有收藏记录
3. 确认 `user_id` 匹配正确
4. 检查数据库查询是否成功

### 问题：收藏状态不同步

**解决方案**：
1. 确保在收藏操作后重新加载状态
2. 检查是否有多个组件同时修改状态
3. 使用全局状态管理（如 Context）
4. 添加刷新按钮手动同步

## 相关文档

- [Task 4 完成报告](./TASK_4_ASSISTANT_CARD_ENHANCEMENT_COMPLETE.md)
- [Assistant 类型定义](../types/assistant.ts)
- [数据库 Schema](../lib/db/schema.ts)
- [预设助理扩展规范](.kiro/specs/preset-assistants-expansion/)
