# Task 4 集成快速指南

## 快速集成步骤

### 1. 导入必要的模块

在 `components/ChatbotChat/index.tsx` 文件顶部添加：

```typescript
import { useUserAssistantListUpdates, getAssistantCardClassName } from './UserAssistantListUpdates';
import '@/styles/AssistantActivation.module.css';
```

### 2. 在组件中使用 Hook

在 `ChatbotChat` 组件内部，添加 Hook 调用：

```typescript
const ChatbotChat: React.FC = () => {
  // 现有代码...
  
  // 添加用户助手列表更新 Hook
  const {
    localUserAssistants,
    highlightedId,
    listContainerRef,
    loadUserAssistants,
    scrollToAssistant,
  } = useUserAssistantListUpdates();
  
  // 现有代码...
};
```

### 3. 更新侧边栏渲染

找到侧边栏中渲染用户助手列表的部分，替换为：

```typescript
<div 
  ref={listContainerRef}
  className="assistant-list-scroll"
  style={{ 
    flex: 1, 
    overflowY: 'auto',
    padding: '8px'
  }}
>
  {localUserAssistants.length === 0 ? (
    <AssistantListEmptyState />
  ) : (
    localUserAssistants
      .filter(assistant => {
        // 搜索过滤
        if (!sidebarSearchTerm.trim()) return true;
        const searchLower = sidebarSearchTerm.toLowerCase();
        return (
          assistant.title.toLowerCase().includes(searchLower) ||
          assistant.desc.toLowerCase().includes(searchLower) ||
          assistant.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      })
      .map(assistant => (
        <SidebarCard
          key={assistant.id}
          id={`user-assistant-${assistant.id}`}
          className={getAssistantCardClassName(assistant.id, highlightedId)}
          onClick={() => {
            setCurrentAssistant(assistant);
            ensureOpeningForAssistant(assistant.title);
            // 更新最后使用时间
            userAssistantService.updateLastUsed(assistant.id).catch(console.error);
          }}
        >
          <div style={{ fontSize: 24 }}>{assistant.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {assistant.customName || assistant.title}
            </div>
            <div style={{
              fontSize: 12,
              color: 'hsl(var(--heroui-foreground) / 0.5)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {assistant.desc}
            </div>
          </div>
        </SidebarCard>
      ))
  )}
</div>
```

### 4. 更新 handleActivateAssistant 函数

确保 `handleActivateAssistant` 函数正确处理助手激活：

```typescript
const handleActivateAssistant = async (assistantId: string) => {
  console.log('[ChatbotChat] Activating assistant:', assistantId);

  // 从 localUserAssistants 中查找助理
  const assistant = localUserAssistants.find(a => a.id === assistantId);
  if (!assistant) {
    console.error('[ChatbotChat] Assistant not found:', assistantId);
    message.error('助理不存在');
    return;
  }

  // 设置为当前助理
  setCurrentAssistant(assistant);

  // 关闭市场界面，切换到聊天界面
  setShowMarketplace(false);
  setShowAppDetail(false);
  setShowKBPage(false);

  // 确保有开场消息
  ensureOpeningForAssistant(assistant.title);

  // 更新最后使用时间
  try {
    await userAssistantService.updateLastUsed(assistantId);
  } catch (error) {
    console.error('[ChatbotChat] Failed to update last used:', error);
  }

  // 显示成功消息
  message.success(`已激活助理：${assistant.title}`);

  console.log('[ChatbotChat] Assistant activated successfully');
};
```

### 5. 添加 switchToAssistant 事件监听

在组件中添加事件监听器：

```typescript
useEffect(() => {
  const handleSwitchToAssistant = (event: Event) => {
    const customEvent = event as CustomEvent<{ assistantId: string }>;
    const { assistantId } = customEvent.detail;
    
    console.log('[ChatbotChat] Received switchToAssistant event:', assistantId);
    handleActivateAssistant(assistantId);
  };

  window.addEventListener('switchToAssistant', handleSwitchToAssistant as EventListener);
  
  return () => {
    window.removeEventListener('switchToAssistant', handleSwitchToAssistant as EventListener);
  };
}, [localUserAssistants]); // 依赖 localUserAssistants
```

## 测试清单

完成集成后，请测试以下功能：

### 基本功能
- [ ] 页面加载时显示用户助手列表
- [ ] 列表为空时显示空状态组件
- [ ] 点击助手卡片可以切换到该助手

### 添加助手
- [ ] 从市场添加助手后，列表立即更新
- [ ] 新添加的助手显示在列表顶部
- [ ] 新添加的助手显示高亮动画（3次脉冲）
- [ ] 列表自动滚动到新添加的助手
- [ ] 高亮动画3秒后自动消失

### 切换助手
- [ ] 点击"立即开始聊天"后切换到该助手
- [ ] 切换后显示助手的开场消息
- [ ] 切换后更新助手的最后使用时间

### 搜索功能
- [ ] 搜索框可以过滤助手列表
- [ ] 搜索支持标题、描述和标签
- [ ] 清空搜索后显示完整列表

### 持久化
- [ ] 刷新页面后助手列表保持不变
- [ ] 助手的使用次数正确累加
- [ ] 助手的最后使用时间正确更新

### 样式和动画
- [ ] 高亮动画流畅自然
- [ ] 滚动动画平滑
- [ ] 悬停效果正常
- [ ] 深色模式下样式正常
- [ ] 移动端显示正常

### 错误处理
- [ ] 存储失败时显示错误提示
- [ ] 助手不存在时显示错误提示
- [ ] 网络错误时不影响现有功能

## 常见问题

### Q: 高亮动画不显示？
A: 检查以下几点：
1. 确保导入了 `AssistantActivation.module.css`
2. 确保助手卡片有正确的 `id` 属性
3. 确保使用了 `getAssistantCardClassName` 函数
4. 检查浏览器控制台是否有 CSS 错误

### Q: 自动滚动不工作？
A: 检查以下几点：
1. 确保列表容器有 `ref={listContainerRef}`
2. 确保助手卡片有唯一的 `id` 属性
3. 检查容器是否有 `overflow: auto` 或 `overflow-y: auto`
4. 检查浏览器是否支持 `scrollIntoView`

### Q: 列表不更新？
A: 检查以下几点：
1. 确保使用了 `useUserAssistantListUpdates` Hook
2. 确保渲染的是 `localUserAssistants` 而不是其他状态
3. 检查浏览器控制台是否有事件监听错误
4. 检查 `userAssistantsUpdated` 事件是否正确触发

### Q: 性能问题？
A: 如果助手列表很长（>100个），考虑：
1. 实现虚拟滚动
2. 添加分页功能
3. 优化搜索算法
4. 使用 `React.memo` 优化助手卡片组件

## 调试技巧

### 1. 启用详细日志

在 `useUserAssistantListUpdates` Hook 中添加日志：

```typescript
const loadUserAssistants = useCallback(() => {
  console.log('[UserAssistantList] Loading assistants...');
  const assistants = userAssistantService.getUserAssistants();
  console.log('[UserAssistantList] Loaded assistants:', assistants.length);
  setLocalUserAssistants(assistants);
  // ... 其他代码
}, []);
```

### 2. 检查事件触发

在浏览器控制台中手动触发事件：

```javascript
// 触发列表更新
window.dispatchEvent(new CustomEvent('userAssistantsUpdated'));

// 触发切换助手
window.dispatchEvent(new CustomEvent('switchToAssistant', {
  detail: { assistantId: 'your-assistant-id' }
}));
```

### 3. 检查 localStorage

在浏览器控制台中查看存储的数据：

```javascript
// 查看用户助手列表
console.log(JSON.parse(localStorage.getItem('user_assistants')));

// 清空列表（测试用）
localStorage.removeItem('user_assistants');
```

### 4. 检查高亮状态

在浏览器控制台中查看高亮状态：

```javascript
// 查找高亮的元素
document.querySelector('.highlighted');

// 查看所有助手卡片
document.querySelectorAll('[id^="user-assistant-"]');
```

## 性能优化建议

### 1. 使用 React.memo

```typescript
const AssistantCard = React.memo(({ assistant, isHighlighted, onClick }) => {
  // ... 组件代码
}, (prevProps, nextProps) => {
  return (
    prevProps.assistant.id === nextProps.assistant.id &&
    prevProps.isHighlighted === nextProps.isHighlighted
  );
});
```

### 2. 虚拟滚动

对于大量助手，使用 `react-window` 或 `react-virtualized`：

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={localUserAssistants.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <AssistantCard assistant={localUserAssistants[index]} />
    </div>
  )}
</FixedSizeList>
```

### 3. 防抖搜索

```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
  () => debounce((term: string) => {
    setSidebarSearchTerm(term);
  }, 300),
  []
);
```

## 相关文档

- [完整实现文档](./TASK_4_USER_ASSISTANT_LIST_UPDATES.md)
- [需求文档](../../../.kiro/specs/assistant-activation-from-market/requirements.md)
- [设计文档](../../../.kiro/specs/assistant-activation-from-market/design.md)

---

**提示**: 如果遇到问题，请先查看浏览器控制台的错误信息，然后参考上面的调试技巧。
