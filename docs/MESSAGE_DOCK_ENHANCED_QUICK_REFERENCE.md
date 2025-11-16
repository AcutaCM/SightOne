# MessageDock 增强功能快速参考

## 快速开始

### 用户操作

| 操作 | 触发方式 | 效果 |
|------|---------|------|
| 收起 Dock | 点击最左边的星星图标（✨） | Dock 收起，只显示浮动星星按钮 |
| 展开 Dock | 点击浮动星星按钮 | Dock 重新展开 |
| 打开助理选择器 | 点击最右边的列表图标（☰） | 打开模态窗口选择助理 |
| 选择助理 | 在选择器中勾选复选框 | 该助理显示在 Dock 上 |
| 取消选择助理 | 在选择器中取消勾选 | 该助理从 Dock 上移除 |
| 全选助理 | 点击"全选"按钮 | 选择前 5 个助理 |
| 取消全选 | 点击"取消全选"按钮 | 只保留第一个助理 |

### 图标说明

```
┌─────────────────────────────────────────────────┐
│  ✨  │  🤖  🦄  🐵  │  ☰                        │
│ 收起 │   助理列表   │ 选择器                     │
└─────────────────────────────────────────────────┘
```

- **✨ 星星图标**：点击收起/展开 Dock
- **🤖 助理图标**：点击选择助理并发送消息
- **☰ 列表图标**：点击打开助理选择器

### 限制

- ✅ 最多显示 5 个助理
- ✅ 至少保留 1 个助理
- ✅ 选择会自动保存到 localStorage

## 代码示例

### 基础使用

```tsx
import { AssistantMessageDock } from "@/components/AssistantMessageDock";

function MyPage() {
  const handleOpenChat = (assistantId: string, message: string) => {
    console.log('Opening chat:', assistantId, message);
  };

  return (
    <div>
      <AssistantMessageDock 
        onOpenChat={handleOpenChat}
        className="z-50"
      />
    </div>
  );
}
```

### 收起状态检测

```tsx
// 在 AssistantMessageDock 内部
const [isDockCollapsed, setIsDockCollapsed] = useState(false);

// 收起时只显示星星按钮
if (isDockCollapsed) {
  return (
    <div onClick={() => setIsDockCollapsed(false)}>
      <span>✨</span>
    </div>
  );
}
```

### 助理选择管理

```tsx
// 选中的助理 ID 列表
const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([]);

// 切换助理选择
const handleToggleAssistant = (assistantId: string) => {
  setSelectedAssistantIds(prev => {
    if (prev.includes(assistantId)) {
      if (prev.length === 1) return prev; // 至少保留 1 个
      return prev.filter(id => id !== assistantId);
    } else {
      if (prev.length >= 5) return prev; // 最多 5 个
      return [...prev, assistantId];
    }
  });
};
```

### localStorage 持久化

```tsx
// 加载保存的选择
useEffect(() => {
  const saved = localStorage.getItem("messageDock.selectedAssistants");
  if (saved) {
    setSelectedAssistantIds(JSON.parse(saved));
  }
}, []);

// 保存选择
useEffect(() => {
  localStorage.setItem(
    "messageDock.selectedAssistants",
    JSON.stringify(selectedAssistantIds)
  );
}, [selectedAssistantIds]);
```

## 常见问题

### Q: 如何清除保存的选择？

```javascript
localStorage.removeItem("messageDock.selectedAssistants");
// 刷新页面后会恢复默认选择
```

### Q: 如何禁用收起功能？

修改 `handleCharacterSelect` 函数，移除收起逻辑：

```typescript
const handleCharacterSelect = (character: Character, characterIndex: number) => {
  // 移除这部分代码
  // if (characterIndex === 0) {
  //   setIsDockCollapsed(!isDockCollapsed);
  //   return;
  // }
  
  console.log("Character selected:", character.name);
};
```

### Q: 如何修改最大助理数量？

在 `handleToggleAssistant` 函数中修改限制：

```typescript
if (prev.length >= 10) return prev; // 改为 10 个
```

同时更新 `handleSelectAll` 函数：

```typescript
setSelectedAssistantIds(publishedAssistants.slice(0, 10).map(a => a.id));
```

### Q: 如何自定义选择器样式？

修改 Modal 组件的样式：

```tsx
<Modal
  isOpen={showAssistantSelector}
  onClose={() => setShowAssistantSelector(false)}
  size="3xl" // 修改大小: sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full
  classNames={{
    base: "bg-content1 custom-modal", // 自定义基础样式
    header: "border-b border-divider",
    body: "py-6",
    footer: "border-t border-divider",
  }}
>
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Tab` | 在助理之间导航 |
| `Enter` | 选择助理或发送消息 |
| `Escape` | 关闭选择器或收起输入框 |
| `Space` | 切换复选框状态 |

## 浏览器兼容性

| 浏览器 | 版本 | 支持 |
|--------|------|------|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |

## 性能优化

- 使用 `useMemo` 缓存助理列表转换
- 使用 `useEffect` 避免不必要的 localStorage 操作
- 使用 `AnimatePresence` 优化动画性能

## 相关文档

- [MESSAGE_DOCK_ENHANCED_FEATURES.md](./MESSAGE_DOCK_ENHANCED_FEATURES.md) - 详细功能文档
- [MESSAGE_DOCK_USAGE_GUIDE.md](./MESSAGE_DOCK_USAGE_GUIDE.md) - 基础使用指南
