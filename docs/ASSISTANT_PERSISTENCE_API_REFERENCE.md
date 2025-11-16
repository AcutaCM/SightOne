# 助理市场数据持久化系统 - API参考文档

## 概述

本文档提供助理市场数据持久化系统的完整API参考,包括所有RESTful端点、请求/响应格式、错误代码和使用示例。

## 基础信息

- **Base URL**: `/api/assistants`
- **Content-Type**: `application/json`
- **认证**: 暂不需要(未来可添加)

## API端点

### 1. 获取助理列表

获取所有助理的分页列表,支持过滤和搜索。

**端点**: `GET /api/assistants`

**查询参数**:

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码(从1开始) |
| pageSize | number | 否 | 20 | 每页数量(最大100) |
| status | string | 否 | - | 状态过滤: draft, pending, published, rejected |
| author | string | 否 | - | 作者过滤 |
| search | string | 否 | - | 搜索关键词(标题和描述) |

**请求示例**:
```http
GET /api/assistants?page=1&pageSize=20&status=published
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "ast_1234567890",
        "title": "代码审查助手",
        "desc": "帮助审查代码质量和最佳实践",
        "emoji": "🔍",
        "prompt": "你是一个专业的代码审查助手...",
        "tags": ["代码", "审查", "质量"],
        "isPublic": true,
        "status": "published",
        "author": "user123",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-16T14:20:00.000Z",
        "publishedAt": "2024-01-16T14:20:00.000Z",
        "version": 3
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 20
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid page size. Must be between 1 and 100."
  }
}
```

---

### 2. 获取单个助理

根据ID获取助理详情。

**端点**: `GET /api/assistants/:id`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 助理ID |

**请求示例**:
```http
GET /api/assistants/ast_1234567890
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "ast_1234567890",
    "title": "代码审查助手",
    "desc": "帮助审查代码质量和最佳实践",
    "emoji": "🔍",
    "prompt": "你是一个专业的代码审查助手...",
    "tags": ["代码", "审查", "质量"],
    "isPublic": true,
    "status": "published",
    "author": "user123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z",
    "publishedAt": "2024-01-16T14:20:00.000Z",
    "version": 3
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Assistant not found"
  }
}
```

---

### 3. 创建助理

创建新的助理。

**端点**: `POST /api/assistants`

**请求体**:
```json
{
  "title": "代码审查助手",
  "desc": "帮助审查代码质量和最佳实践",
  "emoji": "🔍",
  "prompt": "你是一个专业的代码审查助手...",
  "tags": ["代码", "审查", "质量"],
  "isPublic": true
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 限制 | 描述 |
|------|------|------|------|------|
| title | string | 是 | 1-100字符 | 助理标题 |
| desc | string | 是 | 1-200字符 | 助理描述 |
| emoji | string | 是 | 单个emoji | 助理图标 |
| prompt | string | 是 | 1-2000字符 | 系统提示词 |
| tags | string[] | 否 | 最多10个 | 标签数组 |
| isPublic | boolean | 是 | - | 是否公开 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "ast_1234567890",
    "title": "代码审查助手",
    "desc": "帮助审查代码质量和最佳实践",
    "emoji": "🔍",
    "prompt": "你是一个专业的代码审查助手...",
    "tags": ["代码", "审查", "质量"],
    "isPublic": true,
    "status": "draft",
    "author": "user123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "version": 1
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": "Title is required",
      "prompt": "Prompt must be between 1 and 2000 characters"
    }
  }
}
```

---

### 4. 更新助理

更新现有助理(需要版本号进行乐观锁控制)。

**端点**: `PUT /api/assistants/:id`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 助理ID |

**请求体**:
```json
{
  "title": "高级代码审查助手",
  "desc": "提供深度代码审查和优化建议",
  "version": 3
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| version | number | 是 | 当前版本号(用于乐观锁) |
| title | string | 否 | 新标题 |
| desc | string | 否 | 新描述 |
| emoji | string | 否 | 新图标 |
| prompt | string | 否 | 新提示词 |
| tags | string[] | 否 | 新标签 |
| isPublic | boolean | 否 | 是否公开 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "ast_1234567890",
    "title": "高级代码审查助手",
    "desc": "提供深度代码审查和优化建议",
    "emoji": "🔍",
    "prompt": "你是一个专业的代码审查助手...",
    "tags": ["代码", "审查", "质量"],
    "isPublic": true,
    "status": "draft",
    "author": "user123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-17T09:15:00.000Z",
    "version": 4
  }
}
```

**版本冲突错误**:
```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Version conflict: data has been modified by another user",
    "details": {
      "currentVersion": 5,
      "requestedVersion": 3
    }
  }
}
```

---

### 5. 删除助理

删除指定助理。

**端点**: `DELETE /api/assistants/:id`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 助理ID |

**请求示例**:
```http
DELETE /api/assistants/ast_1234567890
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "ast_1234567890"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Assistant not found"
  }
}
```

---

### 6. 更新助理状态

更新助理的发布状态(用于审核流程)。

**端点**: `PATCH /api/assistants/:id/status`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 助理ID |

**请求体**:
```json
{
  "status": "published",
  "reviewNote": "审核通过,内容优质",
  "version": 3
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| status | string | 是 | 新状态: draft, pending, published, rejected |
| reviewNote | string | 否 | 审核备注 |
| version | number | 是 | 当前版本号 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "ast_1234567890",
    "title": "代码审查助手",
    "status": "published",
    "reviewNote": "审核通过,内容优质",
    "reviewedAt": "2024-01-17T10:00:00.000Z",
    "publishedAt": "2024-01-17T10:00:00.000Z",
    "version": 4
  }
}
```

---

### 7. 导出备份

导出所有助理数据为JSON文件。

**端点**: `GET /api/assistants/backup/export`

**请求示例**:
```http
GET /api/assistants/backup/export
```

**响应**: JSON文件下载

**文件格式**:
```json
{
  "version": "1.0",
  "exportedAt": "2024-01-17T10:00:00.000Z",
  "count": 45,
  "assistants": [
    {
      "id": "ast_1234567890",
      "title": "代码审查助手",
      ...
    }
  ]
}
```

---

### 8. 导入备份

从JSON文件导入助理数据。

**端点**: `POST /api/assistants/backup/import`

**Content-Type**: `multipart/form-data`

**请求体**:
- `file`: JSON备份文件

**响应示例**:
```json
{
  "success": true,
  "data": {
    "imported": 45,
    "skipped": 2,
    "errors": []
  }
}
```

---

### 9. 获取备份列表

获取所有可用备份的列表。

**端点**: `GET /api/assistants/backup/list`

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "assistants_backup_20240117_020000.json",
      "createdAt": "2024-01-17T02:00:00.000Z",
      "recordCount": 45,
      "fileSize": 125840,
      "isAuto": true
    }
  ]
}
```

---

## 错误代码

| 代码 | HTTP状态 | 描述 |
|------|----------|------|
| VALIDATION_ERROR | 400 | 请求数据验证失败 |
| INVALID_PARAMETER | 400 | 无效的查询参数 |
| NOT_FOUND | 404 | 资源不存在 |
| VERSION_CONFLICT | 409 | 版本冲突(乐观锁) |
| DATABASE_ERROR | 500 | 数据库操作失败 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 使用示例

### JavaScript/TypeScript

```typescript
// 获取助理列表
const response = await fetch('/api/assistants?status=published&page=1');
const result = await response.json();
console.log(result.data.data); // 助理数组

// 创建助理
const newAssistant = {
  title: "测试助手",
  desc: "这是一个测试助手",
  emoji: "🤖",
  prompt: "你是一个测试助手",
  tags: ["测试"],
  isPublic: true
};

const createResponse = await fetch('/api/assistants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newAssistant)
});

const createResult = await createResponse.json();
console.log(createResult.data); // 创建的助理

// 更新助理(带版本控制)
const updateData = {
  title: "更新的标题",
  version: 3 // 必须提供当前版本
};

const updateResponse = await fetch('/api/assistants/ast_123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData)
});

if (updateResponse.status === 409) {
  console.error('版本冲突,请刷新数据');
}
```

### cURL

```bash
# 获取助理列表
curl -X GET "http://localhost:3000/api/assistants?status=published"

# 创建助理
curl -X POST "http://localhost:3000/api/assistants" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试助手",
    "desc": "这是一个测试助手",
    "emoji": "🤖",
    "prompt": "你是一个测试助手",
    "tags": ["测试"],
    "isPublic": true
  }'

# 更新助理
curl -X PUT "http://localhost:3000/api/assistants/ast_123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新的标题",
    "version": 3
  }'

# 删除助理
curl -X DELETE "http://localhost:3000/api/assistants/ast_123"

# 导出备份
curl -X GET "http://localhost:3000/api/assistants/backup/export" \
  -o backup.json
```

---

## 性能建议

1. **分页**: 始终使用分页参数,避免一次加载所有数据
2. **缓存**: 利用IndexedDB缓存减少服务器请求
3. **搜索**: 使用防抖(debounce)优化搜索输入
4. **批量操作**: 考虑实现批量创建/更新API(未来扩展)

---

## 版本历史

- **v1.0** (2024-01): 初始版本
  - 基础CRUD操作
  - 分页和过滤
  - 备份和恢复
  - 乐观锁版本控制
