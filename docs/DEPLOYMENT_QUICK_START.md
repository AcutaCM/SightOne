# 部署快速开始指南

## 5分钟快速部署

### 开发环境

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local.example .env.local

# 3. 初始化数据库
npm run db:init

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
# http://localhost:3000
```

### 生产环境(Docker)

```bash
# 1. 配置环境变量
cp .env.production.example .env.production
# 编辑 .env.production 文件

# 2. 运行部署脚本
chmod +x scripts/production-deploy.sh
./scripts/production-deploy.sh

# 3. 访问应用
# http://localhost:3000
```

---

## 常用命令

### 数据库

```bash
npm run db:init          # 初始化数据库
npm run db:check         # 检查数据库健康
```

### 备份

```bash
npm run backup:export    # 导出备份
npm run backup:list      # 列出备份
npm run backup:import -- <file>  # 导入备份
npm run backup:clean -- 30       # 清理30天前的备份
```

### 监控

```bash
npm run health           # 健康检查
npm run diagnose         # 详细诊断
```

### Docker

```bash
# 启动
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 停止
docker-compose -f docker-compose.prod.yml down
```

### PM2

```bash
pm2 start ecosystem.config.js    # 启动
pm2 status                        # 查看状态
pm2 logs                          # 查看日志
pm2 restart assistant-market      # 重启
pm2 stop assistant-market         # 停止
```

---

## 故障排除

### 问题: 端口被占用

```bash
# 查找占用进程
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 更改端口
PORT=3001 npm run start
```

### 问题: 数据库锁定

```bash
# 启用WAL模式
npm run db:enable-wal

# 重启应用
pm2 restart assistant-market
```

### 问题: 备份失败

```bash
# 检查磁盘空间
df -h

# 检查目录权限
ls -la data/backups

# 手动运行备份
npm run backup:export
```

---

## 文档索引

- **API参考**: `docs/ASSISTANT_PERSISTENCE_API_REFERENCE.md`
- **数据库Schema**: `docs/ASSISTANT_PERSISTENCE_DATABASE_SCHEMA.md`
- **部署指南**: `docs/ASSISTANT_PERSISTENCE_DEPLOYMENT_GUIDE.md`
- **故障排除**: `docs/ASSISTANT_PERSISTENCE_TROUBLESHOOTING.md`
- **部署检查清单**: `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md`

---

## 获取帮助

1. 查看文档
2. 运行诊断: `npm run diagnose`
3. 查看日志: `tail -f logs/app.log`
4. 联系技术支持
