# 市场助理显示 - 快速测试指南

## 🎯 测试目标

验证通过审核的助理能够正确显示在ChatbotChat的市场标签页中。

## 📋 测试前准备

1. 确保开发服务器正在运行
2. 清除浏览器缓存(可选,但推荐)
3. 打开浏览器开发者工具的Console标签

## 🧪 测试场景

### 场景1: 新助理审核流程

**步骤:**

1. **创建助理**
   - 打开 `/admin` 页面
   - 点击"创建助理"按钮
   - 填写信息:
     - 名称: "测试助理001"
     - 描述: "这是一个测试助理"
     - 图标: 选择任意emoji
     - 提示词: "你是一个测试助理"
     - 状态: 选择"待审核"
   - 点击保存

2. **审核通过**
   - 打开 `/admin/review` 页面
   - 找到"测试助理001"
   - 点击"通过"按钮
   - 确认审核
   - ✅ 应该看到成功提示: "测试助理001已通过审核并上架到商城!"

3. **验证显示**
   - 打开主页面 `/`
   - 点击右侧的ChatbotChat图标
   - 点击"市场"标签
   - 点击"助理"子标签
   - ✅ **验证点**: "测试助理001"应该显示在列表中

**预期结果:**
- 助理卡片显示正确的名称、描述和图标
- 状态标签显示为"已发布"(绿色)
- 点击卡片可以查看详情

---

### 场景2: 批量审核

**步骤:**

1. **创建多个助理**
   - 创建3个待审核助理:
     - "批量测试001"
     - "批量测试002"
     - "批量测试003"

2. **批量审核**
   - 打开 `/admin/review` 页面
   - 勾选这3个助理
   - 点击"批量通过"按钮
   - 确认操作
   - ✅ 应该看到: "已批量通过 3 个助理的审核!"

3. **验证显示**
   - 打开ChatbotChat市场页面
   - 切换到"助理"标签
   - ✅ **验证点**: 所有3个助理都应该显示

---

### 场景3: 标签页切换刷新

**步骤:**

1. **打开市场页面**
   - 打开ChatbotChat
   - 切换到"市场"标签
   - 切换到"助理"子标签
   - 记录当前显示的助理数量

2. **在另一个标签页审核**
   - 新开一个浏览器标签页
   - 打开 `/admin/review`
   - 审核通过一个新助理

3. **返回并刷新**
   - 返回ChatbotChat标签页
   - 切换到"首页"子标签
   - 再切换回"助理"子标签
   - ✅ **验证点**: 新审核的助理应该显示

**Console日志验证:**
```
[ChatbotChat] Refreshing assistants data...
```

---

## 🔍 调试信息

### 查看Console日志

打开浏览器开发者工具,应该看到:

```javascript
// 切换到助理标签时
[ChatbotChat] Refreshing assistants data...

// Context数据
=== Assistant Context Debug ===
Total assistants: X
Published assistants: Y
```

### 查看Network请求

在Network标签中,应该看到:

```
GET /api/assistants
Status: 200
Response: [{ id: "...", status: "published", ... }]
```

### 查看数据库

如果需要直接检查数据库:

```bash
cd drone-analyzer-nextjs
node -e "const Database = require('better-sqlite3'); const db = new Database('./data/assistants.db'); console.log(db.prepare('SELECT id, title, status FROM assistants WHERE status = \"published\"').all());"
```

---

## ❌ 常见问题

### 问题1: 助理不显示

**症状:** 审核通过后,市场页面仍然是空的

**检查:**
1. Console是否有错误?
2. Network请求是否成功?
3. 数据库中status是否为'published'?

**解决:**
```javascript
// 在Console中手动刷新
window.location.reload();
```

### 问题2: 显示旧数据

**症状:** 显示的助理信息不是最新的

**解决:**
1. 清除IndexedDB缓存:
```javascript
indexedDB.deleteDatabase('assistant-cache');
```

2. 刷新页面

### 问题3: 批量审核部分失败

**症状:** 批量审核时只有部分助理显示

**检查:**
1. Console中是否有错误日志?
2. 哪些助理审核失败了?

**解决:**
- 单独审核失败的助理
- 检查数据库连接

---

## ✅ 成功标准

测试通过的标准:

- [ ] 单个助理审核后立即显示
- [ ] 批量审核的所有助理都显示
- [ ] 标签页切换时自动刷新数据
- [ ] Console无错误日志
- [ ] 助理信息显示正确(名称、描述、图标)
- [ ] 状态标签显示为"已发布"
- [ ] 点击助理卡片可以查看详情

---

## 📊 测试报告模板

```markdown
## 测试结果

**测试日期:** YYYY-MM-DD
**测试人员:** [姓名]
**浏览器:** Chrome/Firefox/Safari [版本]

### 场景1: 新助理审核流程
- [ ] 通过 / [ ] 失败
- 备注: ___________

### 场景2: 批量审核
- [ ] 通过 / [ ] 失败
- 备注: ___________

### 场景3: 标签页切换刷新
- [ ] 通过 / [ ] 失败
- 备注: ___________

### 问题记录
1. ___________
2. ___________

### 总体评价
- [ ] 所有功能正常
- [ ] 部分功能有问题
- [ ] 需要进一步修复
```

---

## 🚀 快速验证命令

```bash
# 1. 启动开发服务器
npm run dev

# 2. 在另一个终端检查数据库
cd drone-analyzer-nextjs
node -e "const Database = require('better-sqlite3'); const db = new Database('./data/assistants.db'); const published = db.prepare('SELECT COUNT(*) as count FROM assistants WHERE status = \"published\"').get(); console.log('已发布助理数量:', published.count);"

# 3. 清除缓存(如果需要)
# 在浏览器Console运行:
# indexedDB.deleteDatabase('assistant-cache'); localStorage.clear(); location.reload();
```

---

## 📞 需要帮助?

如果测试遇到问题:

1. 检查 `docs/MARKET_ASSISTANTS_SYNC_FIX_COMPLETE.md` 了解修复详情
2. 检查 `docs/MARKET_PUBLISHED_ASSISTANTS_FIX.md` 了解诊断步骤
3. 查看Console和Network标签的错误信息
4. 检查数据库中的实际数据

---

**祝测试顺利! 🎉**
