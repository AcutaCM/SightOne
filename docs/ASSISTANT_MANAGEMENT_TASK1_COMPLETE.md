# 任务 1 完成：设置数据模型和类型定义

## 完成时间
2025-01-19

## 任务描述
在 ChatbotChat 组件中扩展 Assistant 接口，添加管理所需的字段，并定义相关类型。

## 实现内容

### 1. 新增类型定义

#### AssistantStatus 类型
```typescript
type AssistantStatus = 'draft' | 'pending' | 'published' | 'rejected';
```

定义了助理的四种状态：
- `draft`: 草稿状态
- `pending`: 等待审核
- `published`: 已发布
- `rejected`: 审核拒绝

#### 完整的 Assistant 接口
```typescript
interface Assistant {
  id: string;                    // 唯一标识符
  title: string;                 // 助理名称
  desc: string;                  // 助理描述（最多200字符）
  emoji: string;                 // 助理图标
  prompt: string;                // 系统提示词（最多2000字符）
  tags?: string[];               // 标签数组
  isPublic: boolean;             // 是否公开
  status: AssistantStatus;       // 助理状态
  author: string;                // 创建者
  createdAt: Date;               // 创建时间
  updatedAt?: Date;              // 更新时间
  reviewedAt?: Date;             // 审核时间
  publishedAt?: Date;            // 发布时间
  reviewNote?: string;           // 审核备注
}
```

#### AssistantPreview 接口
```typescript
interface AssistantPreview {
  title: string;
  desc: string;
  emoji: string;
  prompt?: string;
}
```

用于卡片显示的简化版本，避免在所有地方都需要完整的 Assistant 对象。

#### AssistantFormValues 接口
```typescript
interface AssistantFormValues {
  title: string;
  emoji: string;
  desc: string;
  prompt: string;
  tags: string[];
  isPublic: boolean;
}
```

用于表单提交的值类型。

### 2. 辅助函数

#### previewToAssistant 函数
```typescript
const previewToAssistant = (preview: AssistantPreview): Assistant => ({
  id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: preview.title,
  desc: preview.desc,
  emoji: preview.emoji,
  prompt: preview.prompt || "",
  isPublic: true,
  status: 'published',
  author: 'system',
  createdAt: new Date()
});
```

将简化的 AssistantPreview 转换为完整的 Assistant 对象，用于从市场添加助理到列表时。

### 3. 更新现有代码

#### 更新 defaultAssistant
```typescript
const defaultAssistant: Assistant = { 
  id: 'default-just-chat',
  title: "Just Chat", 
  desc: "Default List", 
  emoji: "🦄",
  prompt: "你是一个通用的AI助手，可以帮助用户解答问题、提供建议和进行对话。",
  isPublic: true,
  status: 'published',
  author: 'system',
  createdAt: new Date('2024-01-01')
};
```

#### 更新 onCreateAssistant 函数
创建草稿助理时包含所有必需字段：
```typescript
const draft: Assistant = { 
  id: `draft-${Date.now()}`,
  title, 
  desc: "", 
  emoji: "🤖",
  prompt: "",
  isPublic: false,
  status: 'draft',
  author: 'admin',
  createdAt: new Date()
};
```

#### 更新助手设置保存逻辑
在保存助手时创建完整的 Assistant 对象：
```typescript
const newAssistant: Assistant = { 
  id: currentAssistant?.id || `assistant-${Date.now()}`,
  title: name, 
  desc, 
  emoji, 
  prompt,
  isPublic: currentAssistant?.isPublic || false,
  status: currentAssistant?.status || 'draft',
  author: currentAssistant?.author || 'admin',
  createdAt: currentAssistant?.createdAt || new Date(),
  updatedAt: new Date()
};
```

#### 更新 createAssistant 函数
修改参数类型并使用转换函数：
```typescript
const createAssistant = async (app: AssistantPreview | null) => {
  // ...
  const fullAssistant = previewToAssistant(app);
  if (!assistantList.some(a => a.title === app.title)) {
    setAssistantList(prev => [...prev, fullAssistant]);
  }
  setCurrentAssistant(fullAssistant);
  // ...
};
```

#### 更新 selectedApp 类型
```typescript
const [selectedApp, setSelectedApp] = useState<AssistantPreview | null>(null);
```

### 4. 修复的类型错误

修复了以下位置的类型错误：
1. ✅ defaultAssistant 定义（第 520 行）
2. ✅ onCreateAssistant 中的 draft 对象（第 985 行）
3. ✅ 使用 selectedApp 的地方（第 1851, 2528, 2753, 3957 行）
4. ✅ createAssistant 函数参数类型
5. ✅ 助手设置保存逻辑中的 newAssistant 对象

## 验证结果

运行 TypeScript 诊断检查：
```
✅ No diagnostics found
```

所有类型错误已修复，代码通过 TypeScript 类型检查。

## 设计决策

### 为什么创建 AssistantPreview 类型？

1. **向后兼容**: 现有代码中有很多地方使用简化的助理对象（只有 title, desc, emoji），不需要完整的管理字段。
2. **关注点分离**: 显示卡片时不需要知道助理的状态、作者等管理信息。
3. **灵活性**: 可以在需要时通过 `previewToAssistant` 函数转换为完整对象。

### ID 生成策略

使用时间戳 + 随机字符串的组合：
```typescript
`assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

这确保了：
- 唯一性（时间戳 + 随机数）
- 可读性（包含 "assistant" 前缀）
- 简单性（不需要外部 UUID 库）

### 默认值策略

创建新助理时的默认值：
- `status`: 'draft' （草稿状态，需要管理员发布）
- `isPublic`: false （默认私有）
- `author`: 'admin' （当前用户角色）
- `createdAt`: new Date() （当前时间）

## 下一步

任务 1 已完成，可以继续执行任务 2：添加状态管理。

任务 2 将添加：
- `creatingAssistant` 状态
- `editingAssistant` 状态
- `reviewingAssistant` 和 `showReviewModal` 状态
- `userRole` 状态
- `assistantForm` 表单实例
- 更新 `assistantList` 初始数据
