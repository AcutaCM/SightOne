# 快速修复: API Fetch Error

## 问题

浏览器Console显示:
```
Error: Failed to fetch
[ERROR] [AssistantApiClient] Unexpected error fetching assistants
```

## 原因

数据库文件`data/assistants.db`不存在或未初始化。

## 解决方案(3步)

### 1. 停止开发服务器

在运行`npm run dev`的终端按`Ctrl+C`

### 2. 初始化数据库

在项目根目录运行:

```bash
cd drone-analyzer-nextjs
npm run db:init
```

或者直接运行:

```bash
node scripts/db-init.ts
```

你应该看到:

```
🚀 开始初始化助理市场数据持久化系统...

📁 创建目录结构...
  ✓ 创建目录: data
  ✓ 创建目录: data/backups
  ✓ 创建目录: logs

💾 初始化数据库...
  ✓ 启用WAL模式
  ✓ 创建assistants表
  ✓ 创建索引
  ✓ 创建migrations表
  ✓ 创建backups表
  ✓ 记录初始迁移

✅ 数据库初始化完成!

🔍 验证设置...
  ✓ 数据库文件: data/assistants.db
  ✓ 表存在: assistants
  ✓ 表存在: migrations
  ✓ 表存在: backups
```

### 3. 重启开发服务器

```bash
npm run dev
```

## 验证

1. 打开浏览器访问: `http://localhost:3000/api/assistants`

   应该看到:
   ```json
   {
     "success": true,
     "data": [],
     "total": 0,
     "page": 1,
     "pageSize": 20
   }
   ```

2. 打开ChatbotChat,切换到市场标签页

   应该不再有错误,只是显示"暂无已发布的助理"

## 创建测试数据

1. 访问 `/admin` 页面
2. 点击"创建助理"
3. 填写信息并保存
4. 访问 `/admin/review` 页面
5. 找到刚创建的助理,点击"通过"
6. 返回ChatbotChat市场页面
7. 切换到"助理"标签
8. ✅ 应该能看到刚才创建的助理!

## 如果还有问题

### 检查数据库文件

```bash
dir data\assistants.db
```

应该看到文件存在。

### 检查数据库内容

```bash
node -e "const Database = require('better-sqlite3'); const db = new Database('./data/assistants.db'); console.log('Assistants:', db.prepare('SELECT * FROM assistants').all());"
```

### 清除浏览器缓存

1. 打开开发者工具(F12)
2. Application标签 > Storage > Clear site data
3. 刷新页面

## 总结

这个错误是因为数据库未初始化导致的。运行`npm run db:init`即可解决。

之后的修复(自动刷新数据)会在数据库正常工作后生效,让审核通过的助理立即显示在市场中。
