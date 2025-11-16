# MessageDock 增强功能文档

## 概述

MessageDock 组件现在支持以下增强功能：

1. **收起/展开功能**：点击最左边的星星按钮可以收起整个 dock
2. **助理选择器**：点击最右边的列表按钮可以选择哪些助理显示在 dock 上
3. **持久化存储**：用户的选择会保存到 localStorage

## 功能详解

### 1. 收起/展开 Dock

**触发方式**：点击最左边的星星图标（✨）

**行为**：
- 点击星星图标后，整个 dock 会收起，只显示一个浮动的星星按钮
- 再次点击星星按钮，dock 会重新展开
- 收起状态下，dock 不会占用屏幕空间

**实现细节**：
```typescript
// 状态管理
const [isDockCollapsed, setIsDockCollapsed] = useState(false);

// 点击星星按钮切换状态
const handleCharacterSelect = (character: Character, characterIndex: number) => {
  if (characterIndex === 0) {
    setIsDockCollapsed(!isDockCollapsed);
    return;
  }
  // ...
};

// 收起状态下的渲染
if (isDockCollapsed) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 cursor-pointer"
         onClick={() => setIsDockCollapsed(false)}>
      <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg">
        <span className="text-2xl">✨</span>
      </div>
    </div>
  );
}
```

### 2. 助理选择器

**触发方式**：点击最右边的列表图标（三条横线）

**功能**：
- 打开一个模态窗口，显示所有可用的助理
- 用户可以勾选/取消勾选助理，控制哪些助理显示在 dock 上
- 最多可选择 5 个助理
- 至少保留 1 个助理（不能全部取消）

**界面元素**：
- **助理列表**：显示所有已发布的助理，包括图标、名称和描述
- **复选框**：勾选表示该助理会显示在 dock 上
- **全选按钮**：一键选择前 5 个助理
- **取消全选按钮**：取消所有选择（保留第一个）
- **完成按钮**：关闭选择器并应用更改

**实现细节**：
```typescript
// 状态管理
const [showAssistantSelector, setShowAssistantSelector] = useState(false);
const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([]);

// 打开选择器
const handleMenuClick = () => {
  setShowAssistantSelector(true);
};

// 切换助理选择
const handleToggleAssistant = (assistantId: string) => {
  setSelectedAssistantIds(prev => {
    if (prev.includes(assistantId)) {
      // 不允许取消最后一个
      if (prev.length === 1) return prev;
      return prev.filter(id => id !== assistantId);
    } else {
      // 不允许超过 5 个
      if (prev.length >= 5) return prev;
      return [...prev, assistantId];
    }
  });
};
```

### 3. 持久化存储

**存储位置**：`localStorage.messageDock.selectedAssistants`

**存储内容**：选中的助理 ID 数组

**行为**：
- 用户选择的助理会自动保存到 localStorage
- 页面刷新后，会自动恢复用户的选择
- 如果没有保存的选择，默认显示所有助理（最多 5 个）

**实现细节**：
```typescript
// 加载保存的选择
useEffect(() => {
  try {
    const saved = localStorage.getItem("messageDock.selectedAssistants");
    if (saved) {
      setSelectedAssistantIds(JSON.parse(saved));
    } else {
      // 默认显示所有助理
      setSelectedAssistantIds(publishedAssistants.map(a => a.id));
    }
  } catch (error) {
    console.error("Failed to load selected assistants:", error);
    setSelectedAssistantIds(publishedAssistants.map(a => a.id));
  }
}, []);

// 保存选择
useEffect(() => {
  try {
    localStorage.setItem(
      "messageDock.selectedAssistants",
      JSON.stringify(selectedAssistantIds)
    );
  } catch (error) {
    console.error("Failed to save selected assistants:", error);
  }
}, [selectedAssistantIds]);
```

## 用户交互流程

### 收起 Dock
1. 用户点击最左边的星星图标（✨）
2. Dock 收起，只显示一个浮动的星星按钮
3. 用户可以点击星星按钮重新展开 Dock

### 选择显示的助理
1. 用户点击最右边的列表图标（三条横线）
2. 打开助理选择器模态窗口
3. 用户勾选/取消勾选想要显示的助理
4. 用户可以使用"全选"或"取消全选"快速操作
5. 点击"完成"按钮关闭选择器
6. Dock 立即更新，只显示选中的助理
7. 选择会自动保存，下次打开页面时恢复

## 限制和约束

1. **最多 5 个助理**：为了保持 UI 简洁，最多只能选择 5 个助理显示在 dock 上
2. **至少 1 个助理**：不能取消所有助理，至少保留 1 个
3. **助理来源**：只显示已发布的助理（`publishedAssistants`）
4. **存储限制**：依赖 localStorage，如果浏览器禁用了 localStorage，选择不会被保存

## 技术实现

### 组件结构

```
AssistantMessageDock
├── MessageDock (基础 UI 组件)
│   ├── 星星按钮 (收起/展开)
│   ├── 助理按钮列表
│   └── 列表按钮 (打开选择器)
└── Modal (助理选择器)
    ├── 助理列表
    ├── 复选框
    └── 操作按钮
```

### 状态管理

```typescript
// Dock 收起状态
const [isDockCollapsed, setIsDockCollapsed] = useState(false);

// 选择器显示状态
const [showAssistantSelector, setShowAssistantSelector] = useState(false);

// 选中的助理 ID 列表
const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([]);
```

### 数据流

```
publishedAssistants (from AssistantContext)
    ↓
selectedAssistantIds (filtered by user selection)
    ↓
filteredAssistants
    ↓
characters (mapped to MessageDock format)
    ↓
MessageDock (rendered)
```

## 样式和主题

- **收起按钮**：白色圆形按钮，带阴影，支持深色模式
- **选择器模态窗口**：使用 HeroUI Modal 组件，支持主题切换
- **助理列表项**：悬停时高亮，支持深色模式
- **HeroUI 主题变量**：使用 `bg-content1`、`bg-content2`、`text-foreground` 等主题变量

## 可访问性

- 所有按钮都有 `aria-label` 属性
- 键盘导航支持（Tab、Enter、Escape）
- 屏幕阅读器友好

## 未来改进

1. **拖拽排序**：允许用户拖拽调整助理在 dock 上的顺序
2. **分组功能**：支持将助理分组管理
3. **搜索功能**：在选择器中添加搜索框，快速查找助理
4. **快捷键**：添加键盘快捷键快速收起/展开 dock

## 测试建议

1. **功能测试**：
   - 测试收起/展开功能
   - 测试助理选择器的所有操作
   - 测试持久化存储

2. **边界测试**：
   - 测试没有助理时的行为
   - 测试只有 1 个助理时的行为
   - 测试超过 5 个助理时的行为

3. **兼容性测试**：
   - 测试不同浏览器的 localStorage 支持
   - 测试深色/浅色主题切换
   - 测试移动端响应式布局

## 相关文档

- [MESSAGE_DOCK_USAGE_GUIDE.md](./MESSAGE_DOCK_USAGE_GUIDE.md) - 基础使用指南
- [MESSAGE_DOCK_API_REFERENCE.md](./MESSAGE_DOCK_API_REFERENCE.md) - API 参考
- [ASSISTANT_CONTEXT_INTEGRATION_GUIDE.md](./ASSISTANT_CONTEXT_INTEGRATION_GUIDE.md) - 助理上下文集成指南
