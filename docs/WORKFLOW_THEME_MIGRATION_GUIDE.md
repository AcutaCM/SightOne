# Workflow主题迁移指南

## 概述

本指南帮助您从旧版Workflow组件迁移到新的黑白灰主题系统（v2.0.0）。新版本带来了全新的设计语言、改进的性能和更好的可访问性。

## 目录

- [版本对比](#版本对比)
- [破坏性变更](#破坏性变更)
- [迁移步骤](#迁移步骤)
- [代码更新](#代码更新)
- [样式迁移](#样式迁移)
- [常见问题](#常见问题)
- [回滚方案](#回滚方案)

---

## 版本对比

### v1.x (旧版)

- 🎨 蓝色主题系统
- 📦 基础组件功能
- ⚡ 标准性能
- ♿ 基础可访问性

### v2.0 (新版)

- 🎨 **黑白灰极简主题**
- 📦 **增强的组件功能**
- ⚡ **优化的性能**
- ♿ **完整的可访问性支持**
- 🌓 **完善的深色模式**
- ✨ **流畅的动画效果**

---

## 破坏性变更

### 1. CSS变量重命名

旧版本使用蓝色主题变量，新版本使用黑白灰变量。

#### 颜色变量变更

| 旧变量 | 新变量 | 说明 |
|--------|--------|------|
| `--primary-blue` | `--node-selected` | 主色调改为黑/白 |
| `--secondary-blue` | `--node-border-hover` | 次要色调 |
| `--bg-blue-light` | `--node-header-bg` | 背景色 |
| `--text-blue` | `--text-primary` | 文本颜色 |

#### 阴影变量变更

| 旧变量 | 新变量 |
|--------|--------|
| `--shadow-sm` | `--node-shadow` |
| `--shadow-md` | `--node-shadow-hover` |
| `--shadow-lg` | `--node-shadow-selected` |

### 2. 组件Props变更

#### NodeHeader

**移除的Props：**
- `color` - 不再支持自定义颜色
- `variant` - 统一使用新主题样式

**新增的Props：**
- `isRunning` - 运行状态指示
- `hasErrors` - 错误状态指示

**变更示例：**

```tsx
// ❌ 旧版本
<NodeHeader
  title="节点"
  color="blue"
  variant="filled"
/>

// ✅ 新版本
<NodeHeader
  title="节点"
  icon={<Icon />}
  isCollapsed={false}
  onToggleCollapse={() => {}}
  hasErrors={false}
  isRunning={false}
/>
```

#### InlineParameterNode

**移除的Props：**
- `theme` - 自动使用全局主题
- `colorScheme` - 统一使用黑白灰

**新增的Props：**
- `status` - 节点状态（idle/running/success/error）

**变更示例：**

```tsx
// ❌ 旧版本
<InlineParameterNode
  id="node-1"
  data={data}
  theme="blue"
  colorScheme="light"
/>

// ✅ 新版本
<InlineParameterNode
  id="node-1"
  data={{
    ...data,
    status: 'idle'
  }}
  selected={false}
/>
```

### 3. 样式类名变更

| 旧类名 | 新类名 |
|--------|--------|
| `.workflow-node-blue` | `.workflow-node` |
| `.param-item-blue` | `.param-item` |
| `.node-header-blue` | `.node-header` |

### 4. 主题Hook变更

```tsx
// ❌ 旧版本
import { useTheme } from '@/lib/theme';
const { colors } = useTheme();

// ✅ 新版本
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';
const theme = useWorkflowTheme();
```

---

## 迁移步骤

### 步骤1: 备份现有代码

```bash
# 创建备份分支
git checkout -b backup-v1-workflow
git commit -am "Backup before workflow theme migration"

# 切回主分支
git checkout main
```

### 步骤2: 更新依赖

```bash
# 清除缓存
rm -rf .next
rm -rf node_modules

# 重新安装
npm install
```

### 步骤3: 更新全局样式

在 `styles/globals.css` 中添加新的CSS变量：

```css
/* 添加到 globals.css */

/* 浅色主题 */
:root {
  /* 节点颜色 */
  --node-bg: #FFFFFF;
  --node-border: #E5E5E5;
  --node-border-hover: #CCCCCC;
  --node-selected: #000000;
  --node-selected-glow: rgba(0, 0, 0, 0.1);
  --node-divider: #F0F0F0;
  --node-header-bg: #FAFAFA;
  
  /* 参数颜色 */
  --param-bg: #F8F8F8;
  --param-bg-hover: #F0F0F0;
  --param-bg-editing: #E8E8E8;
  --param-border: #E0E0E0;
  --param-border-editing: #999999;
  
  /* 文本颜色 */
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  
  /* 阴影 */
  --node-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --node-shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.15);
  --node-shadow-selected: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* 深色主题 */
.dark {
  --node-bg: #1A1A1A;
  --node-border: #333333;
  --node-border-hover: #4D4D4D;
  --node-selected: #FFFFFF;
  --node-selected-glow: rgba(255, 255, 255, 0.1);
  --node-divider: #2A2A2A;
  --node-header-bg: #222222;
  
  --param-bg: #242424;
  --param-bg-hover: #2E2E2E;
  --param-bg-editing: #383838;
  --param-border: #3A3A3A;
  --param-border-editing: #666666;
  
  --text-primary: #E5E5E5;
  --text-secondary: #999999;
  --text-tertiary: #666666;
}
```

### 步骤4: 更新组件导入

```tsx
// ❌ 旧版本导入
import { NodeHeader } from '@/components/workflow/NodeHeaderOld';
import { ParameterItem } from '@/components/workflow/ParameterItemOld';

// ✅ 新版本导入
import { NodeHeader } from '@/components/workflow/NodeHeader';
import { ParameterItem } from '@/components/workflow/ParameterItem';
```

### 步骤5: 运行迁移脚本

我们提供了自动迁移脚本来帮助更新代码：

```bash
# 运行迁移脚本
node scripts/migrate-workflow-theme.js

# 检查迁移结果
git diff
```

### 步骤6: 手动更新自定义代码

对于自定义的Workflow组件，需要手动更新：

1. 更新CSS变量引用
2. 更新组件Props
3. 移除颜色相关的自定义样式
4. 测试功能

### 步骤7: 测试

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 检查类型
npm run type-check
```

---

## 代码更新

### 更新NodeHeader使用

```tsx
// ❌ 旧版本
<NodeHeader
  title="拍照节点"
  color="blue"
  variant="filled"
  showBadge={true}
  badgeCount={3}
/>

// ✅ 新版本
<NodeHeader
  icon={<CameraIcon />}
  title="拍照节点"
  isCollapsed={false}
  parameterCount={3}
  hasErrors={false}
  onToggleCollapse={() => setCollapsed(!collapsed)}
/>
```

### 更新InlineParameterNode使用

```tsx
// ❌ 旧版本
<InlineParameterNode
  id="node-1"
  data={{
    label: "拍照",
    params: [...]
  }}
  theme="blue"
/>

// ✅ 新版本
<InlineParameterNode
  id="node-1"
  data={{
    label: "拍照",
    icon: <CameraIcon />,
    parameters: [...],
    status: 'idle'
  }}
  selected={false}
  onParameterChange={(name, value) => {}}
/>
```

### 更新ParameterItem使用

```tsx
// ❌ 旧版本
<ParameterItem
  name="altitude"
  label="高度"
  value={100}
  onChange={handleChange}
  color="blue"
/>

// ✅ 新版本
<ParameterItem
  parameter={{
    name: "altitude",
    label: "高度",
    type: "number",
    value: 100,
    min: 20,
    max: 500,
    unit: "cm"
  }}
  value={100}
  onChange={handleChange}
  error={errors.altitude}
/>
```

### 更新主题Hook使用

```tsx
// ❌ 旧版本
import { useTheme } from '@/lib/theme';

function MyComponent() {
  const { colors } = useTheme();
  
  return (
    <div style={{ background: colors.primary }}>
      内容
    </div>
  );
}

// ✅ 新版本
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

function MyComponent() {
  const theme = useWorkflowTheme();
  
  return (
    <div style={{ background: theme.node.bg }}>
      内容
    </div>
  );
}
```

---

## 样式迁移

### 更新自定义样式

#### 1. 颜色引用

```css
/* ❌ 旧版本 */
.my-node {
  background: var(--primary-blue);
  border: 1px solid var(--secondary-blue);
  color: var(--text-blue);
}

/* ✅ 新版本 */
.my-node {
  background: var(--node-bg);
  border: 1px solid var(--node-border);
  color: var(--text-primary);
}
```

#### 2. 阴影效果

```css
/* ❌ 旧版本 */
.my-node {
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

/* ✅ 新版本 */
.my-node {
  box-shadow: var(--node-shadow);
}

.my-node:hover {
  box-shadow: var(--node-shadow-hover);
}
```

#### 3. 状态样式

```css
/* ❌ 旧版本 */
.my-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* ✅ 新版本 */
.my-node.selected {
  border-color: var(--node-selected);
  box-shadow: 0 0 0 3px var(--node-selected-glow);
}
```

### 移除蓝色主题相关样式

需要移除所有硬编码的蓝色值：

```css
/* ❌ 需要移除 */
.workflow-node {
  background: #eff6ff;
  border-color: #3b82f6;
}

.param-item {
  background: #dbeafe;
}

/* ✅ 使用CSS变量 */
.workflow-node {
  background: var(--node-bg);
  border-color: var(--node-border);
}

.param-item {
  background: var(--param-bg);
}
```

---

## 常见问题

### Q1: 迁移后颜色显示不正确

**问题：** 组件仍然显示蓝色或颜色混乱

**解决方案：**
1. 清除浏览器缓存
2. 删除`.next`文件夹并重新构建
3. 检查是否有硬编码的颜色值
4. 确认`globals.css`已正确导入

```bash
rm -rf .next
npm run dev
```

### Q2: 深色模式不工作

**问题：** 切换到深色模式后颜色没有变化

**解决方案：**
确保在`globals.css`中定义了`.dark`类的CSS变量：

```css
.dark {
  --node-bg: #1A1A1A;
  --node-border: #333333;
  /* ... 其他变量 */
}
```

### Q3: 自定义组件样式丢失

**问题：** 自定义的Workflow组件样式不见了

**解决方案：**
更新自定义组件以使用新的CSS变量：

```tsx
// 更新前
<div className="my-custom-node" style={{ background: '#eff6ff' }}>

// 更新后
<div className="my-custom-node" style={{ background: 'var(--node-bg)' }}>
```

### Q4: TypeScript类型错误

**问题：** 出现类型错误

**解决方案：**
更新组件Props类型：

```typescript
// 旧类型
interface NodeProps {
  color?: string;
  variant?: 'filled' | 'outlined';
}

// 新类型
interface NodeProps {
  icon: React.ReactNode;
  status?: 'idle' | 'running' | 'success' | 'error';
}
```

### Q5: 性能问题

**问题：** 迁移后界面卡顿

**解决方案：**
1. 启用虚拟化（大量参数时）
2. 使用React.memo优化组件
3. 检查是否有不必要的重渲染

```tsx
// 启用虚拟化
<ParameterList
  parameters={largeArray}
  virtualized={true}
  maxHeight={400}
/>
```

---

## 回滚方案

如果迁移遇到问题，可以临时回滚到旧版本：

### 方案1: Git回滚

```bash
# 回滚到迁移前的提交
git checkout backup-v1-workflow

# 或者重置到特定提交
git reset --hard <commit-hash>
```

### 方案2: 使用兼容模式

在`next.config.js`中启用兼容模式：

```javascript
module.exports = {
  // ... 其他配置
  env: {
    WORKFLOW_LEGACY_MODE: 'true'
  }
}
```

### 方案3: 保留旧组件

保留旧版本组件作为备份：

```tsx
// 使用旧组件
import { NodeHeader as NodeHeaderOld } from '@/components/workflow/legacy/NodeHeader';

// 或使用新组件
import { NodeHeader } from '@/components/workflow/NodeHeader';
```

---

## 迁移脚本

我们提供了自动迁移脚本来帮助更新代码。

### 使用方法

```bash
# 运行迁移脚本
node scripts/migrate-workflow-theme.js

# 查看帮助
node scripts/migrate-workflow-theme.js --help

# 仅检查不修改
node scripts/migrate-workflow-theme.js --dry-run

# 指定目录
node scripts/migrate-workflow-theme.js --dir ./components
```

### 脚本功能

脚本会自动：

1. ✅ 更新CSS变量引用
2. ✅ 更新组件Props
3. ✅ 移除废弃的Props
4. ✅ 更新导入语句
5. ✅ 生成迁移报告

### 脚本内容

创建 `scripts/migrate-workflow-theme.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// CSS变量映射
const cssVariableMap = {
  '--primary-blue': '--node-selected',
  '--secondary-blue': '--node-border-hover',
  '--bg-blue-light': '--node-header-bg',
  '--text-blue': '--text-primary',
  '--shadow-sm': '--node-shadow',
  '--shadow-md': '--node-shadow-hover',
  '--shadow-lg': '--node-shadow-selected',
};

// Props映射
const propsMap = {
  'color': null, // 移除
  'variant': null, // 移除
  'theme': null, // 移除
  'colorScheme': null, // 移除
};

function migrateFile(filePath, dryRun = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 替换CSS变量
  Object.entries(cssVariableMap).forEach(([oldVar, newVar]) => {
    const regex = new RegExp(oldVar, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, newVar);
      modified = true;
    }
  });
  
  // 移除废弃的Props
  Object.entries(propsMap).forEach(([prop, replacement]) => {
    const regex = new RegExp(`\\s+${prop}=\\{[^}]+\\}`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, '');
      modified = true;
    }
  });
  
  if (modified && !dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已更新: ${filePath}`);
  } else if (modified) {
    console.log(`🔍 需要更新: ${filePath}`);
  }
  
  return modified;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const dir = args.find(arg => arg.startsWith('--dir='))?.split('=')[1] || './';
  
  console.log('🚀 开始迁移Workflow主题...\n');
  
  // 查找所有相关文件
  const files = glob.sync(`${dir}/**/*.{tsx,ts,css,scss}`, {
    ignore: ['**/node_modules/**', '**/.next/**']
  });
  
  let modifiedCount = 0;
  
  files.forEach(file => {
    if (migrateFile(file, dryRun)) {
      modifiedCount++;
    }
  });
  
  console.log(`\n✨ 迁移完成!`);
  console.log(`📊 共检查 ${files.length} 个文件`);
  console.log(`📝 ${dryRun ? '需要' : '已'}更新 ${modifiedCount} 个文件`);
  
  if (dryRun) {
    console.log('\n💡 运行 node scripts/migrate-workflow-theme.js 来应用更改');
  }
}

main();
```

---

## 迁移检查清单

完成迁移后，使用此清单验证：

### 代码更新

- [ ] 更新了所有CSS变量引用
- [ ] 更新了所有组件Props
- [ ] 移除了废弃的Props
- [ ] 更新了导入语句
- [ ] 更新了TypeScript类型

### 样式更新

- [ ] 移除了硬编码的蓝色值
- [ ] 使用了新的CSS变量
- [ ] 更新了阴影样式
- [ ] 更新了状态样式

### 功能测试

- [ ] 节点显示正常
- [ ] 参数编辑正常
- [ ] 主题切换正常
- [ ] 动画效果正常
- [ ] 错误状态显示正常

### 性能测试

- [ ] 大量节点渲染流畅
- [ ] 参数编辑响应快速
- [ ] 主题切换平滑
- [ ] 无内存泄漏

### 可访问性测试

- [ ] 键盘导航正常
- [ ] 屏幕阅读器兼容
- [ ] 颜色对比度符合标准
- [ ] 焦点指示器清晰

---

## 获取帮助

如果在迁移过程中遇到问题：

1. 📖 查看[主题使用指南](./WORKFLOW_THEME_USAGE_GUIDE.md)
2. 📖 查看[组件API文档](./WORKFLOW_COMPONENT_API.md)
3. 🐛 提交Issue到GitHub
4. 💬 联系开发团队

---

## 相关资源

- [主题使用指南](./WORKFLOW_THEME_USAGE_GUIDE.md)
- [组件API文档](./WORKFLOW_COMPONENT_API.md)
- [设计文档](../.kiro/specs/workflow-theme-redesign/design.md)
- [需求文档](../.kiro/specs/workflow-theme-redesign/requirements.md)

---

最后更新: 2024-10-24
