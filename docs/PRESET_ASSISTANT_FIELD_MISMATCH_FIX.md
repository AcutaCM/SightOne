# 预设助理系统字段不匹配修复

## 问题描述

预设助理系统在创建时出现数据库字段不匹配的问题：

### 主要问题

1. **category字段缺失**: 数据库schema中定义了`category TEXT`字段，但在创建预设助理时没有传入该字段
2. **字段类型不一致**: TypeScript类型定义中`category?: string[]`（数组），但数据库中是`TEXT`类型（需要JSON字符串）
3. **迁移脚本缺少字段**: `intelligentAgentPresetMigration.ts`中的INSERT语句没有包含`category`字段

## 修复方案

### 1. 更新预设助理常量，添加category字段

在`lib/constants/intelligentAgentPreset.ts`中添加category定义：

```typescript
export const INTELLIGENT_AGENT_METADATA = {
  id: INTELLIGENT_AGENT_ID,
  title: '🚁 Tello智能代理',
  emoji: '🤖',
  author: 'system',
  tags: ['无人机', '智能控制', 'AI', '自然语言', 'Tello'],
  category: ['无人机控制', 'AI助手'], // 新增
  isPublic: true,
  status: 'published' as const,
};
```

### 2. 更新数据库迁移脚本

在`lib/db/migrations/intelligentAgentPresetMigration.ts`中添加category字段：

```typescript
db.prepare(`
  INSERT INTO assistants (
    id,
    title,
    desc,
    emoji,
    prompt,
    tags,
    category,  // 新增
    is_public,
    status,
    author,
    created_at,
    updated_at,
    version
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  INTELLIGENT_AGENT_ID,
  INTELLIGENT_AGENT_METADATA.title,
  INTELLIGENT_AGENT_DESCRIPTION,
  INTELLIGENT_AGENT_METADATA.emoji,
  INTELLIGENT_AGENT_PROMPT,
  JSON.stringify(INTELLIGENT_AGENT_METADATA.tags),
  JSON.stringify(INTELLIGENT_AGENT_METADATA.category), // 新增
  INTELLIGENT_AGENT_METADATA.isPublic ? 1 : 0,
  INTELLIGENT_AGENT_METADATA.status,
  INTELLIGENT_AGENT_METADATA.author,
  now,
  now,
  1
);
```

### 3. 更新Repository的rowToAssistant方法

在`lib/db/assistantRepository.ts`中添加category字段转换：

```typescript
private rowToAssistant(row: AssistantRow): Assistant {
  return {
    id: row.id,
    title: row.title,
    desc: row.desc,
    emoji: row.emoji,
    prompt: row.prompt,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    category: row.category ? JSON.parse(row.category) : undefined, // 新增
    isPublic: row.is_public === 1,
    status: row.status as AssistantStatus,
    author: row.author,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
    publishedAt: row.published_at ? new Date(row.published_at) : undefined,
    reviewNote: row.review_note || undefined,
    version: row.version,
  };
}
```

### 4. 更新Repository的create方法

在`lib/db/assistantRepository.ts`中添加category字段插入：

```typescript
create(assistant: Omit<Assistant, 'version' | 'createdAt' | 'updatedAt' | 'reviewedAt' | 'publishedAt'>): Assistant {
  try {
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO assistants (
        id, title, desc, emoji, prompt, tags, category, is_public, status, author,
        created_at, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    stmt.run(
      assistant.id,
      assistant.title,
      assistant.desc,
      assistant.emoji,
      assistant.prompt,
      assistant.tags ? JSON.stringify(assistant.tags) : null,
      assistant.category ? JSON.stringify(assistant.category) : null, // 新增
      assistant.isPublic ? 1 : 0,
      assistant.status,
      assistant.author,
      now
    );
    // ...
  }
}
```

### 5. 更新Repository的update方法

在`lib/db/assistantRepository.ts`中添加category字段更新：

```typescript
update(
  id: string,
  updates: Partial<Omit<Assistant, 'id' | 'createdAt' | 'version'>>,
  currentVersion: number
): Assistant {
  try {
    // ...
    if (updates.category !== undefined) {
      fields.push('category = ?');
      params.push(JSON.stringify(updates.category));
    }
    // ...
  }
}
```

### 6. 更新预设助理服务

在`lib/services/intelligentAgentPresetService.ts`中添加category字段：

```typescript
async createPreset(): Promise<Assistant> {
  try {
    const presetData: CreateAssistantRequest = {
      title: INTELLIGENT_AGENT_METADATA.title,
      desc: INTELLIGENT_AGENT_DESCRIPTION,
      emoji: INTELLIGENT_AGENT_METADATA.emoji,
      prompt: INTELLIGENT_AGENT_PROMPT,
      tags: INTELLIGENT_AGENT_METADATA.tags,
      category: INTELLIGENT_AGENT_METADATA.category, // 新增
      isPublic: INTELLIGENT_AGENT_METADATA.isPublic,
    };
    // ...
  }
}

async refreshPreset(): Promise<void> {
  try {
    // ...
    await this.updatePreset({
      title: INTELLIGENT_AGENT_METADATA.title,
      desc: INTELLIGENT_AGENT_DESCRIPTION,
      emoji: INTELLIGENT_AGENT_METADATA.emoji,
      prompt: INTELLIGENT_AGENT_PROMPT,
      tags: INTELLIGENT_AGENT_METADATA.tags,
      category: INTELLIGENT_AGENT_METADATA.category, // 新增
      isPublic: INTELLIGENT_AGENT_METADATA.isPublic,
    });
    // ...
  }
}
```

## 修复步骤

1. 更新常量定义（添加category字段）
2. 更新数据库迁移脚本
3. 更新Repository的所有相关方法
4. 更新预设助理服务
5. 重新运行迁移或手动删除旧的预设助理记录

## 验证

修复后，预设助理应该能够正常创建，包含所有必需的字段。

## 注意事项

- 如果数据库中已存在旧的预设助理记录，需要手动删除或更新
- 确保所有使用Assistant类型的地方都正确处理category字段
- category字段在数据库中存储为JSON字符串，在应用层转换为数组
