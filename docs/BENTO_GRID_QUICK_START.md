# Bento Grid 快速开始指南

## 5分钟快速集成

### 1. 导入组件 (1分钟)

```tsx
import { AssistantsBentoGrid } from './AssistantsBentoGrid';
```

### 2. 替换现有列表 (2分钟)

**之前 (传统卡片):**

```tsx
{publishedAssistants.map((assistant) => (
  <Card key={assistant.id} onClick={() => handleSelect(assistant)}>
    <div>{assistant.emoji}</div>
    <h3>{assistant.title}</h3>
    <p>{assistant.desc}</p>
  </Card>
))}
```

**之后 (Bento Grid):**

```tsx
<AssistantsBentoGrid
  assistants={publishedAssistants}
  onAssistantSelect={(assistant) => {
    setCurrentAssistant(assistant);
    setShowMarketplace(false);
    onNewChat();
  }}
/>
```

### 3. 完成! (2分钟测试)

刷新页面,查看新的 Bento Grid 布局。

## 一行代码集成其他列表

### 模型列表

```tsx
<BentoGrid items={modelsToBentoItems(modelsList, setSelectedModel)} />
```

### 服务商列表

```tsx
<BentoGrid items={providersToBentoItems(providers, setSelectedProvider)} />
```

### 插件列表

```tsx
<BentoGrid items={pluginsToBentoItems(plugins, installPlugin)} />
```

## 常用定制

### 修改列数

```tsx
// 在 bento-grid.tsx 中
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

### 修改间距

```tsx
className="... gap-4 ..." // 改为 gap-4 或 gap-6
```

### 自定义图标

```tsx
// 在 bento-adapters.ts 的 getAssistantIcon() 中添加
if (title.includes('你的关键词')) {
  return <YourIcon className="w-4 h-4 text-blue-500" />;
}
```

## 完整示例

```tsx
import { AssistantsBentoGrid } from './AssistantsBentoGrid';

function MarketPage() {
  const { publishedAssistants } = useAssistants();
  
  return (
    <div>
      <AssistantsBentoGrid
        assistants={publishedAssistants}
        onAssistantSelect={(assistant) => {
          console.log('选中助理:', assistant.title);
          // 你的处理逻辑
        }}
      />
    </div>
  );
}
```

## 效果预览

- ✨ 现代化卡片设计
- 🎨 自动图标匹配
- 🏷️ 智能标签生成
- 📱 响应式布局
- 🌓 主题自适应
- ⚡ 流畅动画效果

## 需要帮助?

查看完整文档: `docs/CHATBOT_BENTO_GRID_INTEGRATION.md`
