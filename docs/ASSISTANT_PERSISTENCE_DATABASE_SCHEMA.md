# 助理市场数据持久化系统 - 数据库Schema文档

## 概述

本文档详细描述助理市场数据持久化系统的SQLite数据库结构,包括所有表、字段、索引、约束和关系。

## 数据库信息

- **数据库类型**: SQLite 3
- **文件位置**: `./data/assistants.db`
- **字符编码**: UTF-8
- **版本**: 1.0

---

## 表结构

### 1. assistants 表

存储所有助理的核心数据。

**表名**: `assistants`

**字段定义**:

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| id | TEXT | PRIMARY KEY | - | 助理唯一标识符 |
| title | TEXT | NOT NULL | - | 助理标题 |
| desc | TEXT | NOT NULL | - | 助理描述 |
| emoji | TEXT | NOT NULL | '🤖' | 助理图标(emoji) |
| prompt | TEXT | NOT NULL | - | 系统提示词 |
| tags | TEXT | NULL | - | 标签数组(JSON格式) |
| is_public | INTEGER | NOT NULL | 0 | 是否公开(0=否,1=是) |
| status | TEXT | NOT NULL | 'draft' | 状态(draft/pending/published/rejected) |
| author | TEXT | NOT NULL | - | 作者标识 |
| created_at | TEXT | NOT NULL | - | 创建时间(ISO 8601) |
| updated_at | TEXT | NULL | - | 更新时间(ISO 8601) |
| reviewed_at | TEXT | NULL | - | 审核时间(ISO 8601) |
| published_at | TEXT | NULL | - | 发布时间(ISO 8601) |
| review_note | TEXT | NULL | - | 审核备注 |
| version | INTEGER | NOT NULL | 1 | 版本号(用于乐观锁) |

**约束**:

```sql
CONSTRAINT status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected'))
```

**索引**:

```sql
CREATE INDEX idx_assistants_status ON assistants(status);
CREATE INDEX idx_assistants_author ON assistants(author);
CREATE INDEX idx_assistants_created_at ON assistants(created_at DESC);
CREATE INDEX idx_assistants_published_at ON assistants(published_at DESC);
```

**完整DDL**:

```sql
CREATE TABLE assistants (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  desc TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🤖',
  prompt TEXT NOT NULL,
  tags TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  author TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  reviewed_at TEXT,
  published_at TEXT,
  review_note TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected'))
);

CREATE INDEX idx_assistants_status ON assistants(status);
CREATE INDEX idx_assistants_author ON assistants(author);
CREATE INDEX idx_assistants_created_at ON assistants(created_at DESC);
CREATE INDEX idx_assistants_published_at ON assistants(published_at DESC);
```

**示例数据**:

```sql
INSERT INTO assistants (
  id, title, desc, emoji, prompt, tags, is_public, status, author, created_at, version
) VALUES (
  'ast_1234567890',
  '代码审查助手',
  '帮助审查代码质量和最佳实践',
  '🔍',
  '你是一个专业的代码审查助手...',
  '["代码", "审查", "质量"]',
  1,
  'published',
  'user123',
  '2024-01-15T10:30:00.000Z',
  1
);
```

---

### 2. migrations 表

记录数据库schema迁移历史。

**表名**: `migrations`

**字段定义**:

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | - | 迁移记录ID |
| version | TEXT | NOT NULL, UNIQUE | - | 迁移版本号 |
| applied_at | TEXT | NOT NULL | - | 应用时间(ISO 8601) |
| description | TEXT | NULL | - | 迁移描述 |

**完整DDL**:

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL,
  description TEXT
);
```

**示例数据**:

```sql
INSERT INTO migrations (version, applied_at, description) VALUES
  ('1.0.0', '2024-01-15T00:00:00.000Z', 'Initial schema'),
  ('1.0.1', '2024-01-16T00:00:00.000Z', 'Add review_note field');
```

---

### 3. backups 表

记录备份文件的元数据。

**表名**: `backups`

**字段定义**:

| 字段名 | 类型 | 约束 | 默认值 | 描述 |
|--------|------|------|--------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | - | 备份记录ID |
| filename | TEXT | NOT NULL | - | 备份文件名 |
| created_at | TEXT | NOT NULL | - | 创建时间(ISO 8601) |
| record_count | INTEGER | NOT NULL | - | 备份的记录数 |
| file_size | INTEGER | NOT NULL | - | 文件大小(字节) |
| is_auto | INTEGER | NOT NULL | 0 | 是否自动备份(0=手动,1=自动) |

**完整DDL**:

```sql
CREATE TABLE backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  created_at TEXT NOT NULL,
  record_count INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  is_auto INTEGER NOT NULL DEFAULT 0
);
```

**示例数据**:

```sql
INSERT INTO backups (filename, created_at, record_count, file_size, is_auto) VALUES
  ('assistants_backup_20240117_020000.json', '2024-01-17T02:00:00.000Z', 45, 125840, 1);
```

---

## 数据类型说明

### TEXT 类型

SQLite中的TEXT类型用于存储字符串数据:

- **id**: 使用前缀 `ast_` + 时间戳生成唯一ID
- **dates**: 使用ISO 8601格式 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **tags**: 存储JSON数组字符串,如 `["tag1", "tag2"]`
- **status**: 枚举值,通过CHECK约束限制

### INTEGER 类型

SQLite中的INTEGER类型用于存储整数:

- **is_public**: 布尔值,0=false, 1=true
- **is_auto**: 布尔值,0=false, 1=true
- **version**: 版本号,从1开始递增
- **record_count**: 记录数量
- **file_size**: 文件大小(字节)

---

## 索引策略

### 1. 状态索引

```sql
CREATE INDEX idx_assistants_status ON assistants(status);
```

**用途**: 加速按状态过滤的查询
**查询示例**:
```sql
SELECT * FROM assistants WHERE status = 'published';
```

### 2. 作者索引

```sql
CREATE INDEX idx_assistants_author ON assistants(author);
```

**用途**: 加速按作者过滤的查询
**查询示例**:
```sql
SELECT * FROM assistants WHERE author = 'user123';
```

### 3. 创建时间索引

```sql
CREATE INDEX idx_assistants_created_at ON assistants(created_at DESC);
```

**用途**: 加速按创建时间排序的查询
**查询示例**:
```sql
SELECT * FROM assistants ORDER BY created_at DESC LIMIT 20;
```

### 4. 发布时间索引

```sql
CREATE INDEX idx_assistants_published_at ON assistants(published_at DESC);
```

**用途**: 加速按发布时间排序的查询
**查询示例**:
```sql
SELECT * FROM assistants WHERE status = 'published' ORDER BY published_at DESC;
```

---

## 常用查询

### 1. 分页查询

```sql
SELECT * FROM assistants
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### 2. 按状态过滤

```sql
SELECT * FROM assistants
WHERE status = 'published'
ORDER BY published_at DESC;
```

### 3. 搜索查询

```sql
SELECT * FROM assistants
WHERE title LIKE '%关键词%' OR desc LIKE '%关键词%'
ORDER BY created_at DESC;
```

### 4. 统计查询

```sql
-- 按状态统计
SELECT status, COUNT(*) as count
FROM assistants
GROUP BY status;

-- 按作者统计
SELECT author, COUNT(*) as count
FROM assistants
GROUP BY author
ORDER BY count DESC;
```

### 5. 复合查询

```sql
SELECT * FROM assistants
WHERE status = 'published'
  AND author = 'user123'
  AND (title LIKE '%代码%' OR desc LIKE '%代码%')
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

---

## 数据迁移

### 版本1.0.0 → 1.0.1

**变更**: 添加 `review_note` 字段

```sql
-- 检查字段是否存在
PRAGMA table_info(assistants);

-- 添加新字段
ALTER TABLE assistants ADD COLUMN review_note TEXT;

-- 记录迁移
INSERT INTO migrations (version, applied_at, description)
VALUES ('1.0.1', datetime('now'), 'Add review_note field');
```

### 迁移脚本模板

```sql
-- migrations/001_add_field.sql
BEGIN TRANSACTION;

-- 执行变更
ALTER TABLE assistants ADD COLUMN new_field TEXT;

-- 记录迁移
INSERT INTO migrations (version, applied_at, description)
VALUES ('1.0.x', datetime('now'), 'Description of change');

COMMIT;
```

---

## 数据完整性

### 1. 主键约束

- `assistants.id`: 确保每个助理有唯一标识
- `migrations.id`: 自动递增的迁移记录ID
- `backups.id`: 自动递增的备份记录ID

### 2. 非空约束

关键字段必须有值:
- `title`, `desc`, `emoji`, `prompt`: 助理核心信息
- `status`, `author`: 状态和作者信息
- `created_at`: 创建时间

### 3. 检查约束

```sql
CONSTRAINT status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected'))
```

确保状态值在允许的范围内。

### 4. 唯一约束

```sql
version TEXT NOT NULL UNIQUE  -- migrations表
```

确保迁移版本号不重复。

---

## 性能优化

### 1. 使用预编译语句

```typescript
// 好的做法
const stmt = db.prepare('SELECT * FROM assistants WHERE id = ?');
const result = stmt.get(id);

// 避免
const result = db.prepare(`SELECT * FROM assistants WHERE id = '${id}'`).get();
```

### 2. 批量操作使用事务

```typescript
const insertMany = db.transaction((assistants) => {
  const stmt = db.prepare('INSERT INTO assistants (...) VALUES (...)');
  for (const assistant of assistants) {
    stmt.run(...);
  }
});

insertMany(assistantList);
```

### 3. 定期分析和优化

```sql
-- 分析表统计信息
ANALYZE assistants;

-- 重建索引
REINDEX assistants;

-- 清理碎片
VACUUM;
```

---

## 备份和恢复

### 1. 数据库文件备份

```bash
# 复制数据库文件
cp ./data/assistants.db ./data/backups/assistants_$(date +%Y%m%d_%H%M%S).db

# 使用SQLite备份命令
sqlite3 ./data/assistants.db ".backup ./data/backups/backup.db"
```

### 2. JSON导出

```sql
-- 导出为JSON(通过应用层)
SELECT json_group_array(
  json_object(
    'id', id,
    'title', title,
    'desc', desc,
    'emoji', emoji,
    'prompt', prompt,
    'tags', json(tags),
    'isPublic', is_public,
    'status', status,
    'author', author,
    'createdAt', created_at,
    'updatedAt', updated_at,
    'version', version
  )
) FROM assistants;
```

### 3. 恢复数据

```sql
-- 从备份文件恢复
sqlite3 ./data/assistants.db < backup.sql

-- 或复制备份文件
cp ./data/backups/backup.db ./data/assistants.db
```

---

## 维护建议

### 1. 定期维护

- **每周**: 运行 `ANALYZE` 更新统计信息
- **每月**: 运行 `VACUUM` 清理碎片
- **每天**: 自动备份数据库文件

### 2. 监控指标

- 数据库文件大小
- 查询响应时间
- 索引使用率
- 表记录数

### 3. 容量规划

- 预估每个助理约1-2KB
- 1000个助理约2MB
- 建议定期归档旧数据

---

## 故障排除

### 1. 数据库锁定

**问题**: `database is locked` 错误

**解决**:
```typescript
// 设置超时
const db = new Database('assistants.db', { timeout: 5000 });

// 使用WAL模式
db.pragma('journal_mode = WAL');
```

### 2. 数据库损坏

**问题**: 数据库文件损坏

**解决**:
```bash
# 检查完整性
sqlite3 assistants.db "PRAGMA integrity_check;"

# 从备份恢复
cp ./data/backups/latest.db ./data/assistants.db
```

### 3. 性能问题

**问题**: 查询缓慢

**解决**:
```sql
-- 检查查询计划
EXPLAIN QUERY PLAN SELECT * FROM assistants WHERE status = 'published';

-- 添加缺失的索引
CREATE INDEX IF NOT EXISTS idx_name ON table(column);
```

---

## 版本历史

- **v1.0.0** (2024-01-15): 初始schema
  - assistants表
  - migrations表
  - backups表
  - 基础索引

- **v1.0.1** (2024-01-16): 添加审核功能
  - 添加review_note字段
