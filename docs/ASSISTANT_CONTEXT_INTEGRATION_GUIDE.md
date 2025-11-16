# 助理 Context 集成指南

## 🎯 问题解决

之前审核页面和市场页面的数据是独立的，审核通过后市场不会实时更新。现在通过创建共享的 Context，两个页面可以实时同步数据。

## 📦 新增文件

### 1. Context 文件
**文件**: `contexts/AssistantContext.tsx`

**功能**:
- 提供全局的助理列表状态
- 提供操作助理的方法（增删改查）
- 自动持久化到 localStorage
- 提供已发布和待审核的助理列表

### 2. Providers 文件
**文件**: `app/providers.tsx`

**功能**:
- 包装 AssistantProvider
- 在根布局中使用

## 🔗 集成步骤

### 步骤 1: 更新根布局

在 `app/layout.tsx` 中添加 Providers：

```tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

### 步骤 2: 在市场页面使用 Context

在 `components/ChatbotChat/index.tsx` 中：

```tsx
import { useAssistants } from '@/contexts/AssistantContext';

const PureChat: React.FC = () => {
  // 使用共享的助理列表
  const { publishedAssistants } = useAssistants();
  
  // 在市场页面显示已发布的助理
  return (
    // ...
    {marketTab === 'assistants' && (
      <Row gutter={[12, 12]}>
        {publishedAssistants.map((assistant) => (
          <Col key={assistant.id} xs={24} sm={12} md={12} lg={8} xl={6}>
            {/* 助理卡片 */}
          </Col>
        ))}
      </Row>
    )}
    // ...
  );
};
```

### 步骤 3: 在审核页面使用 Context

审核页面已经更新为使用 Context（`app/admin/review/page.tsx`）：

```tsx
import { useAssistants } from '@/contexts/AssistantContext';

const AdminReviewPage: React.FC = () => {
  const { assistantList, updateAssistantStatus } = useAssistants();
  
  // 审核通过
  const handleApprove = (record: Assistant) => {
    updateAssistantStatus(record.id, 'published');
    message.success('已通过审核并上架到商城！');
  };
};
```

## 🎨 Context API

### 状态

```typescript
interface AssistantContextType {
  // 所有助理列表
  assistantList: Assistant[];
  
  // 设置助理列表
  setAssistantList: React.Dispatch<React.SetStateAction<Assistant[]>>;
  
  // 已发布的助理（用于市场显示）
  publishedAssistants: Assistant[];
  
  // 待审核的助理（用于审核页面）
  pendingAssistants: Assistant[];
  
  // 更新助理状态
  updateAssistantStatus: (id: string, status: Assistant['status']) => void;
  
  // 添加助理
  addAssistant: (assistant: Assistant) => void;
  
  // 更新助理
  updateAssistant: (id: string, updates: Partial<Assistant>) => void;
  
  // 删除助理
  deleteAssistant: (id: string) => void;
}
```

### 使用方法

```typescript
// 1. 获取已发布的助理（市场页面）
const { publishedAssistants } = useAssistants();

// 2. 获取待审核的助理（审核页面）
const { pendingAssistants } = useAssistants();

// 3. 审核通过
const { updateAssistantStatus } = useAssistants();
updateAssistantStatus('assistant-id', 'published');

// 4. 添加新助理
const { addAssistant } = useAssistants();
addAssistant({
  id: 'new-id',
  title: '新助理',
  // ... 其他字段
});

// 5. 更新助理
const { updateAssistant } = useAssistants();
updateAssistant('assistant-id', {
  title: '更新后的标题',
  desc: '更新后的描述',
});

// 6. 删除助理
const { deleteAssistant } = useAssistants();
deleteAssistant('assistant-id');
```

## 🔄 数据流程

### 审核流程

```
1. 用户在市场创建助理
   ↓
2. addAssistant({ status: 'draft', ... })
   ↓
3. 用户提交审核
   ↓
4. updateAssistantStatus(id, 'pending')
   ↓
5. 管理员在审核页面看到（pendingAssistants）
   ↓
6. 管理员审核通过
   ↓
7. updateAssistantStatus(id, 'published')
   ↓
8. 助理立即出现在市场（publishedAssistants）
   ✅ 实时同步！
```

### 数据持久化

```
Context 状态
   ↓
localStorage.setItem('assistantList', JSON.stringify(assistantList))
   ↓
页面刷新
   ↓
localStorage.getItem('assistantList')
   ↓
恢复状态
```

## 📝 完整示例

### 市场页面集成

```tsx
'use client';

import { useAssistants } from '@/contexts/AssistantContext';

const MarketPage: React.FC = () => {
  const { publishedAssistants } = useAssistants();
  
  return (
    <div>
      <h2>助理市场</h2>
      <div className="assistant-grid">
        {publishedAssistants.map(assistant => (
          <AssistantCard key={assistant.id} assistant={assistant} />
        ))}
      </div>
    </div>
  );
};
```

### 审核页面集成

```tsx
'use client';

import { useAssistants } from '@/contexts/AssistantContext';

const AdminReviewPage: React.FC = () => {
  const { pendingAssistants, updateAssistantStatus } = useAssistants();
  
  const handleApprove = (id: string) => {
    updateAssistantStatus(id, 'published');
    message.success('审核通过！助理已上架到市场');
  };
  
  return (
    <div>
      <h2>待审核助理</h2>
      <Table
        dataSource={pendingAssistants}
        columns={[
          // ... 列定义
          {
            title: '操作',
            render: (_, record) => (
              <Button onClick={() => handleApprove(record.id)}>
                通过
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
};
```

### 创建助理表单

```tsx
'use client';

import { useAssistants } from '@/contexts/AssistantContext';

const CreateAssistantForm: React.FC = () => {
  const { addAssistant } = useAssistants();
  
  const handleSubmit = (values: any) => {
    const newAssistant = {
      id: `assistant-${Date.now()}`,
      ...values,
      status: 'draft' as const,
      author: '当前用户',
      createdAt: new Date(),
    };
    
    addAssistant(newAssistant);
    message.success('助理创建成功！');
  };
  
  return (
    <Form onFinish={handleSubmit}>
      {/* 表单字段 */}
    </Form>
  );
};
```

## 🎯 优势

### 1. 实时同步 ✅
- 审核页面通过审核 → 市场立即显示
- 市场创建助理 → 审核页面立即看到
- 任何页面的修改都会实时反映到其他页面

### 2. 数据持久化 ✅
- 自动保存到 localStorage
- 页面刷新后数据不丢失
- 无需手动管理存储

### 3. 类型安全 ✅
- 完整的 TypeScript 类型定义
- IDE 自动补全
- 编译时错误检查

### 4. 易于使用 ✅
- 简单的 Hook API
- 清晰的方法命名
- 完整的文档

### 5. 可扩展 ✅
- 易于添加新功能
- 支持更多操作方法
- 可以集成后端 API

## 🔧 后续优化

### 1. 添加后端集成

```typescript
// 在 Context 中添加 API 调用
const updateAssistantStatus = async (id: string, status: Assistant['status']) => {
  // 先更新本地状态（乐观更新）
  setAssistantList(prev => prev.map(item =>
    item.id === id ? { ...item, status, reviewedAt: new Date() } : item
  ));
  
  try {
    // 调用后端 API
    await fetch(`/api/assistants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    // 如果失败，回滚状态
    message.error('更新失败，请重试');
    // 回滚逻辑...
  }
};
```

### 2. 添加加载状态

```typescript
const [loading, setLoading] = useState(false);

const updateAssistantStatus = async (id: string, status: Assistant['status']) => {
  setLoading(true);
  try {
    // ... 更新逻辑
  } finally {
    setLoading(false);
  }
};
```

### 3. 添加错误处理

```typescript
const [error, setError] = useState<string | null>(null);

const updateAssistantStatus = async (id: string, status: Assistant['status']) => {
  try {
    // ... 更新逻辑
    setError(null);
  } catch (err) {
    setError(err.message);
  }
};
```

## 📚 相关文档

- **审核页面指南**: `ADMIN_REVIEW_PAGE_GUIDE.md`
- **任务 4 和 5 完成文档**: `ASSISTANT_MANAGEMENT_TASK4_5_COMPLETE.md`

## 🎉 总结

通过创建共享的 AssistantContext，我们实现了：

✅ **审核页面和市场页面的实时同步**
- 审核通过 → 立即上架
- 数据一致性保证

✅ **数据持久化**
- 自动保存到 localStorage
- 页面刷新不丢失

✅ **简单易用的 API**
- 清晰的方法命名
- 完整的类型定义

✅ **可扩展的架构**
- 易于添加新功能
- 支持后端集成

现在审核页面和市场页面已经完全联通，审核通过的助理会立即出现在市场中！🚀
