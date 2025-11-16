# Context 集成快速开始

## 🚀 3 步完成集成

### 步骤 1: 在根布局添加 Provider

在 `app/layout.tsx` 中：

```tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 步骤 2: 在市场页面使用

在 `components/ChatbotChat/index.tsx` 中：

```tsx
import { useAssistants } from '@/contexts/AssistantContext';

const PureChat: React.FC = () => {
  // 替换原来的 assistantList 状态
  const { publishedAssistants, updateAssistantStatus, deleteAssistant } = useAssistants();
  
  // 在市场显示已发布的助理
  {marketTab === 'assistants' && (
    <Row gutter={[12, 12]}>
      {publishedAssistants.map((assistant) => (
        <Col key={assistant.id} xs={24} sm={12} md={12} lg={8} xl={6}>
          {/* 助理卡片 */}
        </Col>
      ))}
    </Row>
  )}
};
```

### 步骤 3: 测试

1. 打开审核页面：`http://localhost:3000/admin/review`
2. 审核通过一个助理
3. 打开市场页面，查看助理是否立即显示
4. ✅ 完成！

## 🎯 核心 API

```typescript
// 获取已发布的助理（市场显示）
const { publishedAssistants } = useAssistants();

// 获取待审核的助理（审核页面）
const { pendingAssistants } = useAssistants();

// 审核通过
const { updateAssistantStatus } = useAssistants();
updateAssistantStatus('id', 'published');

// 添加助理
const { addAssistant } = useAssistants();
addAssistant(newAssistant);

// 删除助理
const { deleteAssistant } = useAssistants();
deleteAssistant('id');
```

## 📊 数据流

```
审核页面: 通过审核
    ↓
updateAssistantStatus(id, 'published')
    ↓
Context 更新状态
    ↓
市场页面: publishedAssistants 自动更新
    ↓
✅ 助理立即显示在市场！
```

## 🎉 完成！

现在审核页面和市场页面已经实时联通了！

---

**详细文档**: `ASSISTANT_CONTEXT_INTEGRATION_GUIDE.md`
