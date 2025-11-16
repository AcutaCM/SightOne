# 助理市场数据持久化系统 - 部署指南

## 概述

本文档提供助理市场数据持久化系统的完整部署指南,包括环境准备、安装步骤、配置说明和部署验证。

---

## 系统要求

### 硬件要求

- **CPU**: 2核心或以上
- **内存**: 4GB RAM或以上
- **存储**: 至少10GB可用空间
- **网络**: 稳定的网络连接

### 软件要求

- **Node.js**: v18.0.0或以上
- **npm**: v9.0.0或以上
- **操作系统**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## 部署前准备

### 1. 检查Node.js版本

```bash
node --version  # 应显示 v18.0.0 或更高
npm --version   # 应显示 v9.0.0 或更高
```

如果版本不符合要求,请从 [nodejs.org](https://nodejs.org/) 下载安装最新LTS版本。

### 2. 克隆或下载项目

```bash
# 如果使用Git
git clone <repository-url>
cd drone-analyzer-nextjs

# 或解压下载的项目包
unzip drone-analyzer-nextjs.zip
cd drone-analyzer-nextjs
```

### 3. 安装依赖

```bash
npm install
```

---

## 环境配置

### 1. 创建环境变量文件

复制示例配置文件:

```bash
cp .env.local.example .env.local
```

### 2. 配置环境变量

编辑 `.env.local` 文件:

```env
# 数据库配置
DATABASE_PATH=./data/assistants.db
DATABASE_BACKUP_DIR=./data/backups

# 缓存配置
CACHE_TTL_DAYS=7
CACHE_MAX_SIZE_MB=100

# 备份配置
AUTO_BACKUP_ENABLED=true
AUTO_BACKUP_TIME=02:00
BACKUP_RETENTION_DAYS=30
BACKUP_MAX_COUNT=30

# 日志配置
LOG_LEVEL=INFO
LOG_FILE_PATH=./logs/app.log
LOG_MAX_SIZE_MB=10
LOG_MAX_FILES=5

# 性能配置
DB_CONNECTION_TIMEOUT=5000
API_REQUEST_TIMEOUT=30000
MAX_PAGE_SIZE=100

# 安全配置
ENABLE_CSRF_PROTECTION=true
ENABLE_RATE_LIMITING=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# 应用配置
NODE_ENV=production
PORT=3000
```

### 3. 配置说明

#### 数据库配置

- `DATABASE_PATH`: SQLite数据库文件路径
  - 开发环境: `./data/assistants.db`
  - 生产环境: 建议使用绝对路径,如 `/var/app/data/assistants.db`

- `DATABASE_BACKUP_DIR`: 备份文件存储目录
  - 确保目录有足够的存储空间
  - 建议定期清理旧备份

#### 缓存配置

- `CACHE_TTL_DAYS`: IndexedDB缓存过期时间(天)
  - 默认: 7天
  - 范围: 1-30天

- `CACHE_MAX_SIZE_MB`: 缓存最大大小(MB)
  - 默认: 100MB
  - 根据用户设备调整

#### 备份配置

- `AUTO_BACKUP_ENABLED`: 是否启用自动备份
  - `true`: 启用
  - `false`: 禁用

- `AUTO_BACKUP_TIME`: 自动备份时间(24小时制)
  - 格式: `HH:mm`
  - 示例: `02:00` (凌晨2点)

- `BACKUP_RETENTION_DAYS`: 备份保留天数
  - 默认: 30天
  - 超过此天数的备份将被自动删除

#### 日志配置

- `LOG_LEVEL`: 日志级别
  - `DEBUG`: 调试信息(仅开发环境)
  - `INFO`: 一般信息
  - `WARN`: 警告信息
  - `ERROR`: 错误信息

- `LOG_FILE_PATH`: 日志文件路径
  - 确保目录存在且有写权限

---

## 部署步骤

### 开发环境部署

#### 1. 初始化数据库

```bash
npm run db:init
```

这将:
- 创建数据目录
- 初始化SQLite数据库
- 创建所有表和索引
- 运行初始迁移

#### 2. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

#### 3. 验证部署

访问以下URL验证功能:

- 助理市场: `http://localhost:3000/market`
- API健康检查: `http://localhost:3000/api/health`
- 管理后台: `http://localhost:3000/admin/review`

---

### 生产环境部署

#### 1. 构建生产版本

```bash
npm run build
```

这将:
- 编译TypeScript代码
- 优化资源文件
- 生成生产构建

#### 2. 初始化生产数据库

```bash
NODE_ENV=production npm run db:init
```

#### 3. 启动生产服务器

```bash
npm run start
```

或使用PM2进程管理器:

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "assistant-market" -- start

# 设置开机自启
pm2 startup
pm2 save
```

#### 4. 配置反向代理(可选)

使用Nginx作为反向代理:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Docker部署

### 1. 创建Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 创建数据目录
RUN mkdir -p /app/data /app/data/backups /app/logs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

### 2. 创建docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/assistants.db
      - DATABASE_BACKUP_DIR=/app/data/backups
      - LOG_FILE_PATH=/app/logs/app.log
    restart: unless-stopped
```

### 3. 启动容器

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 数据迁移

### 从localStorage迁移

系统首次启动时会自动检测localStorage中的数据并提示迁移。

**手动触发迁移**:

```bash
npm run migrate:localStorage
```

### 从旧版本升级

```bash
# 备份当前数据库
npm run db:backup

# 运行迁移脚本
npm run db:migrate

# 验证迁移结果
npm run db:verify
```

---

## 备份和恢复

### 手动备份

```bash
# 导出JSON备份
npm run backup:export

# 备份数据库文件
npm run backup:db
```

备份文件将保存在 `./data/backups/` 目录。

### 恢复数据

```bash
# 从JSON文件恢复
npm run backup:import -- --file=./data/backups/backup.json

# 从数据库文件恢复
npm run backup:restore -- --file=./data/backups/assistants_20240117.db
```

### 自动备份

自动备份在配置的时间自动运行(默认凌晨2点)。

**验证自动备份**:

```bash
# 查看备份列表
npm run backup:list

# 查看备份日志
tail -f ./logs/backup.log
```

---

## 监控和维护

### 1. 健康检查

```bash
# 检查API健康状态
curl http://localhost:3000/api/health

# 检查数据库连接
npm run db:check
```

### 2. 性能监控

访问监控仪表板:

```
http://localhost:3000/admin/monitoring
```

监控指标包括:
- API响应时间
- 数据库查询性能
- 缓存命中率
- 错误率统计

### 3. 日志查看

```bash
# 查看应用日志
tail -f ./logs/app.log

# 查看错误日志
grep ERROR ./logs/app.log

# 查看备份日志
tail -f ./logs/backup.log
```

### 4. 数据库维护

```bash
# 分析数据库
npm run db:analyze

# 清理碎片
npm run db:vacuum

# 重建索引
npm run db:reindex
```

---

## 故障排除

### 问题1: 数据库文件无法创建

**症状**: 启动时报错 "Failed to create database"

**解决方案**:

```bash
# 检查目录权限
ls -la ./data

# 创建目录并设置权限
mkdir -p ./data ./data/backups ./logs
chmod 755 ./data ./data/backups ./logs

# 重新初始化
npm run db:init
```

### 问题2: 端口被占用

**症状**: 启动时报错 "Port 3000 is already in use"

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 终止进程或更改端口
PORT=3001 npm run start
```

### 问题3: 数据库锁定

**症状**: 操作时报错 "database is locked"

**解决方案**:

```bash
# 检查是否有其他进程访问数据库
lsof ./data/assistants.db

# 重启应用
pm2 restart assistant-market

# 如果问题持续,启用WAL模式
npm run db:enable-wal
```

### 问题4: 内存不足

**症状**: 应用崩溃或响应缓慢

**解决方案**:

```bash
# 增加Node.js内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run start

# 或在PM2配置中设置
pm2 start npm --name "assistant-market" -- start --node-args="--max-old-space-size=4096"
```

### 问题5: 备份失败

**症状**: 自动备份未生成文件

**解决方案**:

```bash
# 检查备份目录权限
ls -la ./data/backups

# 检查磁盘空间
df -h

# 手动运行备份测试
npm run backup:export

# 查看备份日志
tail -f ./logs/backup.log
```

---

## 安全建议

### 1. 文件权限

```bash
# 设置数据目录权限
chmod 700 ./data
chmod 600 ./data/assistants.db

# 设置日志目录权限
chmod 755 ./logs
chmod 644 ./logs/*.log
```

### 2. 防火墙配置

```bash
# 仅允许必要的端口
ufw allow 3000/tcp  # 应用端口
ufw allow 22/tcp    # SSH
ufw enable
```

### 3. HTTPS配置

使用Let's Encrypt获取免费SSL证书:

```bash
# 安装certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com

# 配置Nginx使用证书
# 参考上面的Nginx配置,添加SSL部分
```

### 4. 定期更新

```bash
# 更新依赖
npm update

# 检查安全漏洞
npm audit

# 修复漏洞
npm audit fix
```

---

## 性能优化

### 1. 数据库优化

```bash
# 定期运行维护脚本
npm run db:maintain

# 启用WAL模式(提高并发性能)
npm run db:enable-wal
```

### 2. 缓存优化

在 `.env.local` 中调整缓存配置:

```env
CACHE_TTL_DAYS=7
CACHE_MAX_SIZE_MB=200
```

### 3. 应用优化

```bash
# 使用生产模式
NODE_ENV=production npm run start

# 启用压缩
ENABLE_COMPRESSION=true npm run start
```

---

## 扩展部署

### 负载均衡

使用Nginx进行负载均衡:

```nginx
upstream assistant_market {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://assistant_market;
    }
}
```

### 数据库复制

对于高可用性,考虑使用PostgreSQL替代SQLite:

```env
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/assistants
```

---

## 部署检查清单

部署前检查:

- [ ] Node.js版本符合要求
- [ ] 所有依赖已安装
- [ ] 环境变量已配置
- [ ] 数据目录已创建
- [ ] 数据库已初始化
- [ ] 备份策略已配置
- [ ] 日志系统正常工作
- [ ] 防火墙规则已设置
- [ ] SSL证书已配置(生产环境)
- [ ] 监控系统已启用

部署后验证:

- [ ] 应用可以正常访问
- [ ] API端点响应正常
- [ ] 数据库读写正常
- [ ] 缓存功能正常
- [ ] 备份任务正常运行
- [ ] 日志正常记录
- [ ] 性能指标正常
- [ ] 错误处理正常

---

## 联系支持

如遇到部署问题,请:

1. 查看日志文件: `./logs/app.log`
2. 运行诊断脚本: `npm run diagnose`
3. 查看故障排除文档
4. 联系技术支持团队

---

## 版本历史

- **v1.0** (2024-01): 初始部署指南
  - 基础部署流程
  - Docker支持
  - 监控和维护指南
