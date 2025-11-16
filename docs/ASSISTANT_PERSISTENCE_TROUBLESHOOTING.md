# 助理市场数据持久化系统 - 故障排除指南

## 概述

本文档提供助理市场数据持久化系统常见问题的诊断和解决方案,帮助快速定位和修复问题。

---

## 快速诊断

### 运行诊断脚本

```bash
npm run diagnose
```

诊断脚本将检查:
- Node.js版本
- 依赖完整性
- 数据库连接
- 文件权限
- 磁盘空间
- 端口可用性

---

## 数据库问题

### 问题1: 数据库文件无法创建

**症状**:
```
Error: Failed to create database file
EACCES: permission denied, open './data/assistants.db'
```

**原因**:
- 目录不存在
- 权限不足
- 磁盘空间不足

**解决方案**:

```bash
# 1. 创建必要的目录
mkdir -p ./data ./data/backups ./logs

# 2. 设置正确的权限
chmod 755 ./data ./data/backups ./logs

# 3. 检查磁盘空间
df -h

# 4. 重新初始化数据库
npm run db:init

# 5. 验证数据库文件
ls -la ./data/assistants.db
```

**Windows系统**:
```cmd
mkdir data\backups logs
npm run db:init
```

---

### 问题2: 数据库锁定

**症状**:
```
Error: SQLITE_BUSY: database is locked
```

**原因**:
- 多个进程同时访问数据库
- 长时间运行的事务
- 未正确关闭的连接

**解决方案**:

```bash
# 1. 检查是否有其他进程访问数据库
# macOS/Linux
lsof ./data/assistants.db

# Windows
handle ./data/assistants.db

# 2. 终止占用进程
kill -9 <PID>

# 3. 启用WAL模式(提高并发性能)
npm run db:enable-wal

# 4. 增加超时时间
# 在 .env.local 中设置
DB_CONNECTION_TIMEOUT=10000

# 5. 重启应用
pm2 restart assistant-market
```

**代码层面解决**:

```typescript
// lib/db/assistantRepository.ts
constructor(dbPath: string) {
  this.db = new Database(dbPath, {
    timeout: 10000,  // 增加超时时间
    verbose: console.log  // 启用详细日志
  });
  
  // 启用WAL模式
  this.db.pragma('journal_mode = WAL');
  this.db.pragma('busy_timeout = 10000');
}
```

---

### 问题3: 数据库损坏

**症状**:
```
Error: database disk image is malformed
SQLITE_CORRUPT: database disk image is malformed
```

**原因**:
- 异常关闭
- 磁盘错误
- 文件系统问题

**解决方案**:

```bash
# 1. 检查数据库完整性
sqlite3 ./data/assistants.db "PRAGMA integrity_check;"

# 2. 尝试修复
sqlite3 ./data/assistants.db "PRAGMA integrity_check;" > check.txt
sqlite3 ./data/assistants.db ".recover" | sqlite3 recovered.db

# 3. 从备份恢复
npm run backup:list
npm run backup:restore -- --file=./data/backups/latest.db

# 4. 如果没有备份,尝试导出可恢复的数据
sqlite3 ./data/assistants.db ".dump" > dump.sql
sqlite3 ./data/assistants_new.db < dump.sql

# 5. 替换损坏的数据库
mv ./data/assistants.db ./data/assistants_corrupt.db
mv ./data/assistants_new.db ./data/assistants.db
```

---

### 问题4: 查询性能慢

**症状**:
- API响应时间超过1秒
- 数据库查询超时

**诊断**:

```bash
# 1. 检查查询计划
npm run db:explain

# 2. 查看慢查询日志
grep "SLOW QUERY" ./logs/app.log

# 3. 检查索引使用情况
npm run db:analyze-indexes
```

**解决方案**:

```bash
# 1. 更新统计信息
npm run db:analyze

# 2. 重建索引
npm run db:reindex

# 3. 清理碎片
npm run db:vacuum

# 4. 检查是否缺少索引
# 查看 lib/db/schema.ts 确认所有必要的索引都已创建
```

**优化查询**:

```typescript
// 不好的做法
const all = repository.findAll();  // 加载所有数据

// 好的做法
const page1 = repository.findAll({ page: 1, pageSize: 20 });  // 分页加载
```

---

## API问题

### 问题5: API返回500错误

**症状**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

**诊断**:

```bash
# 1. 查看错误日志
tail -f ./logs/app.log | grep ERROR

# 2. 检查API健康状态
curl http://localhost:3000/api/health

# 3. 测试数据库连接
npm run db:check
```

**解决方案**:

```bash
# 1. 检查环境变量
cat .env.local

# 2. 验证数据库路径
ls -la ./data/assistants.db

# 3. 重启应用
pm2 restart assistant-market

# 4. 查看详细错误信息
NODE_ENV=development npm run dev
```

---

### 问题6: API返回404错误

**症状**:
```
GET /api/assistants/ast_123 -> 404 Not Found
```

**原因**:
- 资源不存在
- ID格式错误
- 路由配置错误

**解决方案**:

```bash
# 1. 验证资源是否存在
npm run db:query -- "SELECT * FROM assistants WHERE id = 'ast_123'"

# 2. 检查ID格式
# 正确格式: ast_<timestamp>
# 示例: ast_1705478400000

# 3. 测试API端点
curl http://localhost:3000/api/assistants

# 4. 检查路由配置
# 查看 app/api/assistants/[id]/route.ts
```

---

### 问题7: 版本冲突错误

**症状**:
```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Version conflict: data has been modified by another user"
  }
}
```

**原因**:
- 多个用户同时编辑
- 客户端数据过期
- 版本号不匹配

**解决方案**:

```typescript
// 前端处理
try {
  await assistantApiClient.update(id, { ...data, version: currentVersion });
} catch (error) {
  if (error.message.includes('Version conflict')) {
    // 提示用户刷新数据
    const shouldRefresh = confirm(
      '此助理已被其他用户修改,是否刷新查看最新版本?'
    );
    
    if (shouldRefresh) {
      // 重新加载最新数据
      const latest = await assistantApiClient.getById(id, false);
      // 更新表单
      setFormData(latest);
    }
  }
}
```

---

## 缓存问题

### 问题8: 缓存数据不更新

**症状**:
- 修改后数据未更新
- 显示旧数据

**原因**:
- IndexedDB缓存未刷新
- 后台同步失败
- 缓存过期时间过长

**解决方案**:

```bash
# 1. 清除浏览器缓存
# 在浏览器开发者工具中:
# Application -> IndexedDB -> AssistantMarketDB -> 右键删除

# 2. 强制刷新
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (macOS)

# 3. 调整缓存配置
# 在 .env.local 中
CACHE_TTL_DAYS=1  # 减少缓存时间
```

**代码层面解决**:

```typescript
// 强制从服务器加载
const assistants = await assistantApiClient.getAll({ useCache: false });

// 清除特定缓存
await indexedDBCache.delete(id);

// 清除所有缓存
await indexedDBCache.clear();
```

---

### 问题9: IndexedDB存储空间不足

**症状**:
```
QuotaExceededError: The quota has been exceeded
```

**解决方案**:

```typescript
// 1. 清理过期缓存
await indexedDBCache.cleanExpired();

// 2. 减少缓存大小
// 在 .env.local 中
CACHE_MAX_SIZE_MB=50

// 3. 实现LRU缓存策略
// lib/cache/indexedDBCache.ts
async evictOldest(): Promise<void> {
  const items = await this.getAll();
  items.sort((a, b) => a.cachedAt - b.cachedAt);
  
  // 删除最旧的10%
  const toDelete = items.slice(0, Math.floor(items.length * 0.1));
  for (const item of toDelete) {
    await this.delete(item.id);
  }
}
```

---

## 备份问题

### 问题10: 自动备份未运行

**症状**:
- 备份目录为空
- 备份日志无记录

**诊断**:

```bash
# 1. 检查备份配置
grep BACKUP .env.local

# 2. 查看备份日志
tail -f ./logs/backup.log

# 3. 检查cron任务
# 查看 lib/backup/autoBackupScheduler.ts
```

**解决方案**:

```bash
# 1. 验证配置
# .env.local
AUTO_BACKUP_ENABLED=true
AUTO_BACKUP_TIME=02:00

# 2. 手动触发备份测试
npm run backup:export

# 3. 检查备份目录权限
ls -la ./data/backups
chmod 755 ./data/backups

# 4. 重启应用
pm2 restart assistant-market

# 5. 验证备份任务
npm run backup:list
```

---

### 问题11: 备份文件损坏

**症状**:
```
Error: Invalid backup file format
```

**解决方案**:

```bash
# 1. 验证JSON格式
cat ./data/backups/backup.json | jq .

# 2. 检查文件完整性
ls -lh ./data/backups/backup.json

# 3. 尝试其他备份文件
npm run backup:list
npm run backup:restore -- --file=./data/backups/older_backup.json

# 4. 如果所有备份都损坏,从数据库文件恢复
cp ./data/assistants.db ./data/assistants_backup.db
```

---

## 性能问题

### 问题12: 内存泄漏

**症状**:
- 内存使用持续增长
- 应用变慢或崩溃

**诊断**:

```bash
# 1. 监控内存使用
node --inspect npm run start
# 在Chrome中打开 chrome://inspect

# 2. 生成堆快照
npm run heap-snapshot

# 3. 分析内存使用
npm run analyze-memory
```

**解决方案**:

```typescript
// 1. 确保正确关闭数据库连接
class AssistantRepository {
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// 2. 清理事件监听器
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('event', handler);
  
  return () => {
    window.removeEventListener('event', handler);
  };
}, []);

// 3. 限制缓存大小
// 在 indexedDBCache 中实现最大大小限制
```

---

### 问题13: CPU使用率高

**症状**:
- CPU使用率持续100%
- 应用响应缓慢

**诊断**:

```bash
# 1. 查看进程CPU使用
top -p $(pgrep -f "node.*assistant")

# 2. 生成CPU profile
node --prof npm run start
node --prof-process isolate-*.log > profile.txt

# 3. 查看慢查询
grep "SLOW" ./logs/app.log
```

**解决方案**:

```bash
# 1. 优化数据库查询
npm run db:analyze
npm run db:reindex

# 2. 启用查询缓存
# 在 lib/db/queryOptimizer.ts 中实现

# 3. 使用分页减少数据量
# 确保所有列表查询都使用分页

# 4. 优化前端渲染
# 使用虚拟滚动处理大列表
```

---

## 网络问题

### 问题14: API请求超时

**症状**:
```
Error: Request timeout after 30000ms
```

**解决方案**:

```bash
# 1. 增加超时时间
# .env.local
API_REQUEST_TIMEOUT=60000

# 2. 检查网络连接
ping your-server.com

# 3. 检查服务器负载
top
htop

# 4. 优化API响应
# 启用响应压缩
ENABLE_COMPRESSION=true
```

---

### 问题15: CORS错误

**症状**:
```
Access to fetch at 'http://api.example.com' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**解决方案**:

```typescript
// app/api/assistants/route.ts
export async function GET(request: Request) {
  const response = NextResponse.json(data);
  
  // 添加CORS头
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}
```

---

## 数据迁移问题

### 问题16: localStorage迁移失败

**症状**:
```
Error: Failed to migrate data from localStorage
```

**解决方案**:

```bash
# 1. 检查localStorage数据
# 在浏览器控制台:
localStorage.getItem('assistantList')

# 2. 手动导出localStorage数据
# 在浏览器控制台:
const data = localStorage.getItem('assistantList');
console.log(JSON.parse(data));

# 3. 手动导入数据
npm run migrate:manual -- --data='[...]'

# 4. 验证迁移结果
npm run db:query -- "SELECT COUNT(*) FROM assistants"
```

---

## 日志问题

### 问题17: 日志文件过大

**症状**:
- 日志文件占用大量磁盘空间
- 日志写入变慢

**解决方案**:

```bash
# 1. 配置日志轮转
# .env.local
LOG_MAX_SIZE_MB=10
LOG_MAX_FILES=5

# 2. 清理旧日志
find ./logs -name "*.log" -mtime +30 -delete

# 3. 压缩旧日志
gzip ./logs/*.log.old

# 4. 调整日志级别
# 生产环境只记录ERROR和WARN
LOG_LEVEL=WARN
```

---

## 权限问题

### 问题18: 文件权限错误

**症状**:
```
EACCES: permission denied
```

**解决方案**:

```bash
# 1. 检查文件所有者
ls -la ./data

# 2. 修改所有者
sudo chown -R $USER:$USER ./data ./logs

# 3. 设置正确的权限
chmod 755 ./data ./data/backups ./logs
chmod 644 ./data/assistants.db
chmod 644 ./logs/*.log

# 4. 在Docker中运行时
# 确保容器用户有正确的权限
docker-compose exec app chown -R node:node /app/data
```

---

## 诊断工具

### 系统诊断脚本

创建 `scripts/diagnose.ts`:

```typescript
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('=== 系统诊断 ===\n');

// 1. Node.js版本
console.log('Node.js版本:', process.version);

// 2. 检查数据库文件
const dbPath = './data/assistants.db';
if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log('数据库文件大小:', (stats.size / 1024).toFixed(2), 'KB');
} else {
  console.log('❌ 数据库文件不存在');
}

// 3. 检查磁盘空间
try {
  const df = execSync('df -h .').toString();
  console.log('\n磁盘空间:\n', df);
} catch (error) {
  console.log('无法检查磁盘空间');
}

// 4. 检查端口
try {
  const port = process.env.PORT || 3000;
  execSync(`lsof -i :${port}`);
  console.log(`❌ 端口 ${port} 已被占用`);
} catch (error) {
  console.log(`✓ 端口 ${port} 可用`);
}

// 5. 检查依赖
console.log('\n检查依赖...');
try {
  execSync('npm ls better-sqlite3');
  console.log('✓ better-sqlite3 已安装');
} catch (error) {
  console.log('❌ better-sqlite3 未安装');
}
```

运行诊断:

```bash
npm run diagnose
```

---

## 获取帮助

如果以上方法都无法解决问题:

1. **收集信息**:
   ```bash
   npm run collect-logs
   ```

2. **生成诊断报告**:
   ```bash
   npm run generate-report
   ```

3. **查看文档**:
   - API参考: `docs/ASSISTANT_PERSISTENCE_API_REFERENCE.md`
   - 部署指南: `docs/ASSISTANT_PERSISTENCE_DEPLOYMENT_GUIDE.md`

4. **联系支持**:
   - 提供诊断报告
   - 描述问题症状
   - 提供错误日志

---

## 常见错误代码

| 错误代码 | 描述 | 解决方案 |
|---------|------|---------|
| SQLITE_BUSY | 数据库锁定 | 启用WAL模式,增加超时 |
| SQLITE_CORRUPT | 数据库损坏 | 从备份恢复 |
| EACCES | 权限不足 | 检查文件权限 |
| ENOSPC | 磁盘空间不足 | 清理磁盘空间 |
| ECONNREFUSED | 连接被拒绝 | 检查服务是否运行 |
| ETIMEDOUT | 请求超时 | 增加超时时间 |
| VERSION_CONFLICT | 版本冲突 | 刷新数据重试 |

---

## 预防措施

1. **定期备份**: 启用自动备份
2. **监控日志**: 定期检查错误日志
3. **性能监控**: 使用监控仪表板
4. **定期维护**: 运行数据库维护脚本
5. **更新依赖**: 定期更新npm包
6. **测试环境**: 在测试环境验证更改

---

## 版本历史

- **v1.0** (2024-01): 初始故障排除指南
  - 数据库问题
  - API问题
  - 缓存问题
  - 备份问题
  - 性能问题
