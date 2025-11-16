# 生产环境部署检查清单

## 部署前检查

### 1. 系统要求

- [ ] Node.js v18.0.0 或更高版本已安装
- [ ] npm v9.0.0 或更高版本已安装
- [ ] Docker 和 Docker Compose 已安装(如使用Docker部署)
- [ ] 服务器有足够的磁盘空间(至少20GB可用)
- [ ] 服务器有足够的内存(至少4GB RAM)
- [ ] 服务器CPU满足要求(至少2核心)

### 2. 环境配置

- [ ] 复制 `.env.production.example` 为 `.env.production`
- [ ] 配置数据库路径 `DATABASE_PATH`
- [ ] 配置备份目录 `DATABASE_BACKUP_DIR`
- [ ] 配置日志路径 `LOG_FILE_PATH`
- [ ] 设置正确的 `API_BASE_URL`
- [ ] 配置日志级别为 `WARN` 或 `ERROR`
- [ ] 启用自动备份 `AUTO_BACKUP_ENABLED=true`
- [ ] 配置备份保留天数 `BACKUP_RETENTION_DAYS`
- [ ] 启用CSRF保护 `ENABLE_CSRF_PROTECTION=true`
- [ ] 启用速率限制 `ENABLE_RATE_LIMITING=true`
- [ ] 配置CORS允许的源 `CORS_ALLOWED_ORIGINS`

### 3. 安全配置

- [ ] 更改所有默认密码和密钥
- [ ] 配置SSL/TLS证书
- [ ] 设置防火墙规则
- [ ] 配置安全头(CSP, HSTS等)
- [ ] 启用请求日志 `ENABLE_REQUEST_LOGGING=true`
- [ ] 配置错误追踪服务(如Sentry)
- [ ] 设置文件权限(数据库文件600,目录700)

### 4. 数据库准备

- [ ] 创建数据目录 `mkdir -p data data/backups logs`
- [ ] 设置目录权限 `chmod 700 data`
- [ ] 运行数据库初始化 `npm run db:init`
- [ ] 验证数据库文件已创建
- [ ] 检查数据库完整性
- [ ] 如有旧数据,执行数据迁移

### 5. 依赖安装

- [ ] 运行 `npm ci --only=production`
- [ ] 验证所有依赖已正确安装
- [ ] 检查是否有安全漏洞 `npm audit`
- [ ] 修复已知漏洞 `npm audit fix`

### 6. 构建应用

- [ ] 运行 `npm run build`
- [ ] 验证构建成功
- [ ] 检查构建输出大小
- [ ] 测试构建后的应用

### 7. 备份策略

- [ ] 配置自动备份时间
- [ ] 测试手动备份 `npm run backup:export`
- [ ] 验证备份文件已创建
- [ ] 测试备份恢复 `npm run backup:import`
- [ ] 配置备份文件存储位置
- [ ] 设置备份文件权限

---

## 部署步骤

### 方式1: 直接部署

1. [ ] 上传代码到服务器
2. [ ] 安装依赖 `npm ci --only=production`
3. [ ] 配置环境变量
4. [ ] 初始化数据库 `npm run db:init`
5. [ ] 构建应用 `npm run build`
6. [ ] 启动应用 `npm run start`
7. [ ] 验证服务运行

### 方式2: PM2部署

1. [ ] 安装PM2 `npm install -g pm2`
2. [ ] 配置 `ecosystem.config.js`
3. [ ] 启动应用 `pm2 start ecosystem.config.js`
4. [ ] 保存配置 `pm2 save`
5. [ ] 设置开机自启 `pm2 startup`
6. [ ] 验证服务运行 `pm2 status`

### 方式3: Docker部署

1. [ ] 配置 `docker-compose.prod.yml`
2. [ ] 配置 `Dockerfile.prod`
3. [ ] 构建镜像 `docker-compose -f docker-compose.prod.yml build`
4. [ ] 启动容器 `docker-compose -f docker-compose.prod.yml up -d`
5. [ ] 验证容器运行 `docker ps`
6. [ ] 检查日志 `docker-compose logs -f`

### 使用部署脚本

1. [ ] 赋予执行权限 `chmod +x scripts/production-deploy.sh`
2. [ ] 运行部署脚本 `./scripts/production-deploy.sh`
3. [ ] 等待部署完成
4. [ ] 验证部署结果

---

## 部署后验证

### 1. 服务健康检查

- [ ] 访问健康检查端点 `curl http://localhost:3000/api/health`
- [ ] 运行健康检查脚本 `npm run health`
- [ ] 检查所有检查项都通过
- [ ] 验证响应时间正常

### 2. 功能测试

- [ ] 访问应用首页
- [ ] 测试助理列表加载
- [ ] 测试创建助理
- [ ] 测试编辑助理
- [ ] 测试删除助理
- [ ] 测试搜索功能
- [ ] 测试分页功能
- [ ] 测试管理后台

### 3. API测试

- [ ] 测试 GET /api/assistants
- [ ] 测试 GET /api/assistants/:id
- [ ] 测试 POST /api/assistants
- [ ] 测试 PUT /api/assistants/:id
- [ ] 测试 DELETE /api/assistants/:id
- [ ] 测试 PATCH /api/assistants/:id/status
- [ ] 验证错误处理
- [ ] 验证版本冲突处理

### 4. 性能测试

- [ ] 测试API响应时间(<500ms)
- [ ] 测试页面加载时间(<2s)
- [ ] 测试并发请求处理
- [ ] 测试大数据量场景
- [ ] 监控内存使用
- [ ] 监控CPU使用

### 5. 安全测试

- [ ] 测试HTTPS重定向
- [ ] 验证SSL证书有效
- [ ] 测试CSRF保护
- [ ] 测试速率限制
- [ ] 测试SQL注入防护
- [ ] 测试XSS防护
- [ ] 验证安全头设置

### 6. 备份测试

- [ ] 触发手动备份
- [ ] 验证备份文件生成
- [ ] 测试备份恢复
- [ ] 验证自动备份配置
- [ ] 检查备份清理功能

### 7. 日志检查

- [ ] 检查应用日志 `tail -f logs/app.log`
- [ ] 检查错误日志 `grep ERROR logs/app.log`
- [ ] 检查备份日志
- [ ] 验证日志轮转
- [ ] 检查日志级别正确

### 8. 监控设置

- [ ] 配置性能监控
- [ ] 配置错误追踪
- [ ] 配置告警规则
- [ ] 测试告警通知
- [ ] 设置监控仪表板

---

## 监控和维护

### 日常监控

- [ ] 每天检查应用日志
- [ ] 每天检查错误率
- [ ] 每天检查性能指标
- [ ] 每周检查磁盘空间
- [ ] 每周检查备份状态
- [ ] 每月检查安全更新

### 定期维护

- [ ] 每周运行 `npm run db:analyze`
- [ ] 每月运行 `npm run db:vacuum`
- [ ] 每月清理旧日志
- [ ] 每月检查备份完整性
- [ ] 每季度更新依赖
- [ ] 每季度进行安全审计

### 告警配置

- [ ] 磁盘空间不足告警
- [ ] 内存使用过高告警
- [ ] CPU使用过高告警
- [ ] 错误率过高告警
- [ ] 服务不可用告警
- [ ] 备份失败告警

---

## 回滚计划

### 准备

- [ ] 保留上一个版本的代码
- [ ] 保留上一个版本的数据库备份
- [ ] 记录当前版本号
- [ ] 准备回滚脚本

### 回滚步骤

1. [ ] 停止当前服务
2. [ ] 恢复代码到上一版本
3. [ ] 恢复数据库备份
4. [ ] 重启服务
5. [ ] 验证服务正常
6. [ ] 通知相关人员

### 回滚验证

- [ ] 验证服务可访问
- [ ] 验证数据完整性
- [ ] 验证功能正常
- [ ] 检查日志无错误

---

## 故障处理

### 常见问题

1. **服务无法启动**
   - [ ] 检查端口是否被占用
   - [ ] 检查环境变量配置
   - [ ] 检查数据库文件权限
   - [ ] 查看错误日志

2. **数据库连接失败**
   - [ ] 检查数据库文件是否存在
   - [ ] 检查文件权限
   - [ ] 检查磁盘空间
   - [ ] 尝试重建数据库

3. **性能问题**
   - [ ] 检查数据库索引
   - [ ] 运行数据库优化
   - [ ] 检查内存使用
   - [ ] 检查慢查询日志

4. **备份失败**
   - [ ] 检查备份目录权限
   - [ ] 检查磁盘空间
   - [ ] 查看备份日志
   - [ ] 手动运行备份测试

---

## 文档和支持

### 相关文档

- [ ] API参考文档: `docs/ASSISTANT_PERSISTENCE_API_REFERENCE.md`
- [ ] 数据库Schema文档: `docs/ASSISTANT_PERSISTENCE_DATABASE_SCHEMA.md`
- [ ] 部署指南: `docs/ASSISTANT_PERSISTENCE_DEPLOYMENT_GUIDE.md`
- [ ] 故障排除指南: `docs/ASSISTANT_PERSISTENCE_TROUBLESHOOTING.md`

### 支持联系

- [ ] 记录技术支持联系方式
- [ ] 记录紧急联系人
- [ ] 准备问题报告模板
- [ ] 建立问题追踪系统

---

## 签署确认

部署负责人: ________________  日期: ________

技术审核人: ________________  日期: ________

运维负责人: ________________  日期: ________

---

## 备注

记录部署过程中的特殊情况、问题和解决方案:

```
[在此记录部署备注]
```
