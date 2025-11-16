# API Fetch Error 故障排除

## 错误信息

```
Error: Failed to fetch
[ERROR] [AssistantApiClient] Unexpected error fetching assistants
```

## 问题原因

API调用`/api/assistants`失败,可能的原因:

1. **数据库未初始化** - `data/assistants.db`文件不存在
2. **API路由错误** - Next.js API路由没有正确启动
3. **网络问题** - 本地服务器连接问题

## 快速修复

### 方案1: 初始化数据库

在项目根目录运行:

```bash
cd drone-analyzer-nextjs
node -e "const { initDatabase } = require('./lib/db/initDatabase.ts'); initDatabase();"
```

或者使用提供的脚本:

```bash
cd drone-analyzer-nextjs
node scripts/db-init.ts
```

### 方案2: 手动创建数据库文件

```bash
cd drone-analyzer-nextjs
mkdir -p data
touch data/assistants.db
```

然后重启开发服务器。

### 方案3: 检查API路由

在浏览器中直接访问:
```
http://localhost:3000/api/assistants
```

应该返回JSON响应。如果返回404,说明API路由没有正确配置。

### 方案4: 临时禁用API调用

修改`contexts/AssistantContext.tsx`,在API调用失败时使用空数组:

```typescript
try {
  const assistants = await assistantApiClient.getAll({ useCache: true });
  setAssistantList(assistants);
} catch (apiError) {
  console.warn('[AssistantContext] API not available, using empty list:', apiError);
  setAssistantList([]); // 使用空数组而不是抛出错误
}
```

这个修改已经在代码中实现了,所以页面应该能正常加载,只是没有数据。

## 验证步骤

### 1. 检查数据库文件

```bash
cd drone-analyzer-nextjs
dir data\assistants.db
```

如果文件不存在,运行初始化脚本。

### 2. 检查API响应

打开浏览器开发者工具 > Network标签,刷新页面,查看`/api/assistants`请求:

- **Status 200**: API正常,但可能返回空数据
- **Status 404**: API路由未找到
- **Status 500**: 服务器内部错误
- **Failed**: 网络连接失败

### 3. 检查Console日志

查看浏览器Console,应该看到:

```
[AssistantContext] API not available, using empty list: Error: Failed to fetch
```

这是正常的降级行为,页面应该能正常显示,只是助理列表为空。

## 完整解决方案

### 步骤1: 停止开发服务器

按`Ctrl+C`停止当前运行的服务器。

### 步骤2: 初始化数据库

```bash
cd drone-analyzer-nextjs
node scripts/db-init.ts
```

### 步骤3: 验证数据库

```bash
node -e "const Database = require('better-sqlite3'); const db = new Database('./data/assistants.db'); console.log('Tables:', db.prepare('SELECT name FROM sqlite_master WHERE type=\"table\"').all());"
```

应该看到`assistants`表。

### 步骤4: 重启开发服务器

```bash
npm run dev
```

### 步骤5: 测试API

在浏览器中访问:
```
http://localhost:3000/api/assistants
```

应该返回:
```json
{
  "success": true,
  "data": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

### 步骤6: 创建测试数据

在管理页面(`/admin`)创建一个测试助理,然后在审核页面(`/admin/review`)通过审核。

### 步骤7: 验证市场显示

打开ChatbotChat,切换到市场 > 助理标签,应该能看到刚才创建的助理。

## 预防措施

### 1. 添加数据库初始化检查

在`lib/db/assistantRepository.ts`中添加自动初始化:

```typescript
import { initDatabase } from './initDatabase';

export function getDefaultRepository() {
  // 确保数据库已初始化
  try {
    initDatabase();
  } catch (error) {
    console.warn('Database already initialized or init failed:', error);
  }
  
  return new AssistantRepository();
}
```

### 2. 添加健康检查端点

创建`app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getDefaultRepository } from '@/lib/db/assistantRepository';

export async function GET() {
  try {
    const repository = getDefaultRepository();
    const count = repository.findAll({ pageSize: 1 }).total;
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      assistants: count
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    }, { status: 500 });
  }
}
```

然后可以访问`http://localhost:3000/api/health`检查系统状态。

### 3. 改进错误提示

在ChatbotChat中添加更友好的错误提示:

```typescript
{publishedAssistants.length === 0 && (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
    <div style={{ fontSize: 16, marginBottom: 8 }}>暂无已发布的助理</div>
    <div style={{ fontSize: 14, color: 'hsl(var(--heroui-foreground) / 0.6)' }}>
      {assistantList.length === 0 
        ? '数据库可能未初始化,请运行 npm run db:init'
        : '创建助理后,通过审核即可在此显示'
      }
    </div>
  </div>
)}
```

## 常见问题

### Q: 为什么API调用失败但页面还能加载?

A: AssistantContext已经实现了优雅降级,API失败时使用空数组,不会阻塞页面加载。

### Q: 数据库文件在哪里?

A: `drone-analyzer-nextjs/data/assistants.db`

### Q: 如何重置数据库?

A: 删除`data/assistants.db`文件,然后重新运行初始化脚本。

### Q: API返回空数组是正常的吗?

A: 是的,如果数据库中没有助理数据,API会返回空数组。需要先创建并审核助理。

## 总结

当前的错误是API调用失败,但由于已经实现了错误处理,页面仍然可以正常显示。要解决这个问题:

1. 确保数据库已初始化
2. 确保API路由正常工作
3. 创建测试数据
4. 验证市场显示

如果按照上述步骤操作后仍然有问题,请检查:
- Node.js版本是否兼容
- better-sqlite3是否正确安装
- 文件权限是否正确
