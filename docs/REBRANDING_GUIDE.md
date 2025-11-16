# SIGHT ONE (瞰析 ONE) 品牌升级指南

## 快速开始

### 方式1: 使用自动化脚本（推荐）

#### Windows PowerShell

```powershell
# 1. 先预览将要更改的内容（DRY RUN模式）
.\rebranding.ps1 -DryRun

# 2. 确认无误后，执行实际替换
.\rebranding.ps1

# 3. 检查更改
git diff

# 4. 测试功能
npm run dev
cd python && python drone_backend.py

# 5. 如果一切正常，提交更改
git add .
git commit -m "品牌升级: 更新为 SIGHT ONE (瞰析 ONE)"
git push
```

#### 如果需要跳过Git备份

```powershell
.\rebranding.ps1 -SkipBackup
```

---

### 方式2: 手动替换

如果您想更精确地控制替换过程，可以手动进行：

#### 1. 创建备份

```bash
git checkout -b backup-before-rebranding
git push origin backup-before-rebranding
git checkout main
```

#### 2. 使用编辑器的查找替换功能

在VS Code中：
1. 按 `Ctrl+Shift+H` 打开全局查找替换
2. 按照以下顺序替换：

**第一轮：中文名称**
- 查找: `无人机分析器`
- 替换为: `瞰析 ONE`
- 点击"全部替换"

**第二轮：英文名称**
- 查找: `Drone Analyzer`
- 替换为: `SIGHT ONE`
- 点击"全部替换"

**第三轮：后端服务**
- 查找: `无人机后端服务`
- 替换为: `SIGHT ONE 后端服务`
- 点击"全部替换"

**第四轮：连接消息**
- 查找: `无人机连接`
- 替换为: `设备连接`
- 点击"全部替换"

**第五轮：状态消息**
- 查找: `无人机状态`
- 替换为: `设备状态`
- 点击"全部替换"

---

## 替换规则详解

### 核心替换

| 旧文本 | 新文本 | 说明 |
|--------|--------|------|
| 无人机分析器 | 瞰析 ONE | 中文项目名称 |
| Drone Analyzer | SIGHT ONE | 英文项目名称 |
| 无人机后端服务 | SIGHT ONE 后端服务 | 后端服务名称 |
| Drone Backend | SIGHT ONE Backend | 英文后端名称 |
| 无人机连接 | 设备连接 | 连接相关消息 |
| 无人机状态 | 设备状态 | 状态相关消息 |

### 保留不变的内容

**代码标识符**（不要更改）:
- ✅ `droneStatus` (变量名)
- ✅ `useDroneControl` (Hook名)
- ✅ `drone_backend.py` (文件名)
- ✅ `DroneBackendService` (类名)
- ✅ `/api/drone/*` (API端点)

**原因**: 更改这些会导致代码破坏，需要大量重构

---

## 测试清单

### 启动测试

```bash
# 1. 启动前端
npm run dev
# 访问 http://localhost:3000
# 检查页面标题是否显示 "SIGHT ONE" 或 "瞰析 ONE"

# 2. 启动后端
cd python
python drone_backend.py
# 检查启动日志是否显示 "SIGHT ONE 后端服务"
```

### 功能测试

- [ ] 前端页面正常加载
- [ ] 页面标题显示正确
- [ ] WebSocket连接正常
- [ ] 无人机控制功能正常
- [ ] QR检测功能正常
- [ ] 草莓检测功能正常
- [ ] AI诊断功能正常
- [ ] 所有Toast通知文本正确
- [ ] 日志消息文本正确

### UI文本检查

检查以下位置的文本是否已更新：

- [ ] 浏览器标签页标题
- [ ] 页面主标题
- [ ] 导航菜单
- [ ] 连接状态提示
- [ ] 错误消息
- [ ] Toast通知
- [ ] 控制台日志

---

## 常见问题

### Q: 脚本执行失败怎么办？

**A**: 检查以下几点：
1. 确保在项目根目录执行
2. 确保有文件写入权限
3. 检查PowerShell执行策略：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Q: 如何回滚更改？

**A**: 使用Git回滚：
```bash
# 方式1: 回滚到上一次提交
git reset --hard HEAD

# 方式2: 切换到备份分支
git checkout backup-before-rebranding

# 方式3: 撤销特定文件
git checkout HEAD -- <文件路径>
```

### Q: 某些文件没有被替换？

**A**: 可能的原因：
1. 文件在 `node_modules` 或 `.next` 目录（这些会被跳过）
2. 文件编码不是UTF-8
3. 文件被Git忽略

手动检查并替换这些文件。

### Q: 替换后功能异常？

**A**: 检查步骤：
1. 查看浏览器控制台是否有错误
2. 查看后端日志是否有错误
3. 检查是否意外替换了代码标识符
4. 运行 `npm install` 重新安装依赖
5. 清除缓存：`rm -rf .next` 和 `npm run build`

---

## 品牌使用规范

### 正确用法 ✅

**完整名称**:
- "SIGHT ONE (瞰析 ONE)"
- "瞰析 ONE (SIGHT ONE)"

**单独使用**:
- 中文环境: "瞰析 ONE"
- 英文环境: "SIGHT ONE"
- 技术文档: "SIGHT ONE"

**组合使用**:
- "SIGHT ONE 后端服务"
- "瞰析 ONE 智能分析平台"
- "SIGHT ONE Backend Service"

### 错误用法 ❌

- ❌ "SightOne" (驼峰式)
- ❌ "sight one" (全小写)
- ❌ "瞰析ONE" (无空格)
- ❌ "SIGHT-ONE" (连字符)
- ❌ "Sight One" (首字母大写)

---

## 文件更新优先级

### 高优先级（用户可见）

1. **前端UI文件**
   - `app/layout.tsx` (页面标题)
   - `components/*.tsx` (UI组件)
   - `hooks/*.ts` (Toast消息)

2. **后端消息文件**
   - `python/drone_backend.py` (日志消息)
   - `python/diagnosis_workflow_manager.py` (用户消息)

3. **主要文档**
   - `README.md`
   - `package.json` (description)

### 中优先级（文档）

4. **技术文档**
   - 所有 `.md` 文件
   - API文档
   - 用户指南

### 低优先级（可选）

5. **配置文件**
   - `.env.example` (注释)
   - `next.config.js` (注释)

---

## 提交建议

### 提交消息模板

```bash
# 简单版本
git commit -m "品牌升级: 更新为 SIGHT ONE (瞰析 ONE)"

# 详细版本
git commit -m "品牌升级: 更新为 SIGHT ONE (瞰析 ONE)

- 更新所有用户界面文本
- 更新文档和注释
- 保持代码标识符不变
- 测试所有功能正常

BREAKING CHANGE: 项目名称从'无人机分析器'更新为'SIGHT ONE (瞰析 ONE)'"
```

---

## 后续工作

### 可选的额外更新

1. **Logo和图标**
   - 更新 favicon
   - 更新 logo 图片
   - 更新 splash screen

2. **SEO优化**
   - 更新 meta 标签
   - 更新 Open Graph 标签
   - 更新 sitemap

3. **文档完善**
   - 创建品牌指南
   - 更新用户手册
   - 更新API文档

4. **营销材料**
   - 更新宣传文案
   - 更新截图
   - 更新演示视频

---

## 支持

如果遇到问题：

1. 查看 `REBRANDING_PLAN.md` 了解详细计划
2. 检查Git历史：`git log --oneline`
3. 查看更改：`git diff`
4. 回滚更改：`git reset --hard HEAD`

---

**创建日期**: 2025-10-11  
**版本**: 1.0.0  
**状态**: ✅ 就绪
