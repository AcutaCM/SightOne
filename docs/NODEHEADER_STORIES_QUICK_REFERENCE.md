# NodeHeader Stories 快速参考

## 🎯 快速导航

| 故事名称 | 用途 | 关键特性 |
|---------|------|---------|
| [Default](#default) | 基础展示 | 默认展开状态 |
| [Collapsed](#collapsed) | 折叠测试 | 参数徽章显示 |
| [WithErrors](#witherrors) | 错误提示 | 红色脉冲动画 |
| [CollapsedWithErrors](#collapsedwitherrors) | 复合状态 | 徽章 + 错误 |
| [NoParameters](#noparameters) | 边界情况 | 无参数节点 |
| [LongTitle](#longtitle) | 文本溢出 | 省略号 + 工具提示 |
| [ManyParameters](#manyparameters) | 大数字 | 等宽字体 |
| [Interactive](#interactive) | 实际操作 | 完全交互式 |
| [DifferentIcons](#differenticons) | 图标展示 | 9 种节点类型 |
| [ThemeComparison](#themecomparison) | 主题对比 | 浅色 vs 深色 |
| [AllStates](#allstates) | 全面测试 | 4 种状态组合 |
| [Accessibility](#accessibility) | 可访问性 | 键盘导航 + ARIA |

## 📋 故事详情

### Default
```typescript
// 默认展开状态
icon: Plane
label: "起飞"
isCollapsed: false
parameterCount: 3
hasErrors: false
```

### Collapsed
```typescript
// 折叠状态，显示参数徽章
icon: Camera
label: "拍照"
isCollapsed: true
parameterCount: 5
hasErrors: false
```

### WithErrors
```typescript
// 错误状态，显示红色指示器
icon: Zap
label: "条件判断"
isCollapsed: false
parameterCount: 4
hasErrors: true  // ⚠️ 关键
```

### CollapsedWithErrors
```typescript
// 折叠 + 错误
icon: ImageIcon
label: "YOLO检测"
isCollapsed: true
parameterCount: 6
hasErrors: true
```

### NoParameters
```typescript
// 无参数节点
icon: Plane
label: "起飞"
isCollapsed: true
parameterCount: 0  // ⚠️ 关键
hasErrors: false
```

### LongTitle
```typescript
// 长标题测试
icon: MessageSquare
label: "PureChat图像分析 - 使用AI模型进行智能图像识别和分析"
isCollapsed: false
parameterCount: 8
hasErrors: false
```

### ManyParameters
```typescript
// 多参数节点
icon: SettingsIcon
label: "高级配置"
isCollapsed: true
parameterCount: 15  // ⚠️ 关键
hasErrors: false
```

### Interactive
```typescript
// 交互式示例
// 包含控制面板，可切换状态
icon: GitBranch
label: "条件分支"
parameterCount: 4
// 可动态切换 isCollapsed 和 hasErrors
```

### DifferentIcons
```typescript
// 展示 9 种不同节点类型
[
  { icon: Plane, label: "起飞", params: 0 },
  { icon: Camera, label: "拍照", params: 3 },
  { icon: Zap, label: "条件判断", params: 4 },
  { icon: ImageIcon, label: "YOLO检测", params: 6 },
  { icon: MessageSquare, label: "AI对话", params: 5 },
  { icon: GitBranch, label: "分支", params: 2 },
  { icon: Repeat, label: "循环", params: 3 },
  { icon: Clock, label: "延时", params: 1 },
  { icon: Database, label: "数据存储", params: 4 },
]
```

### ThemeComparison
```typescript
// 并排显示浅色和深色主题
// 相同的组件配置，不同的主题样式
icon: Camera
label: "拍照"
isCollapsed: false
parameterCount: 5
hasErrors: false
```

### AllStates
```typescript
// 4 种状态组合
[
  { collapsed: false, errors: false },  // 展开 - 正常
  { collapsed: false, errors: true },   // 展开 - 错误
  { collapsed: true, errors: false },   // 折叠 - 正常
  { collapsed: true, errors: true },    // 折叠 - 错误
]
```

### Accessibility
```typescript
// 可访问性演示
icon: SettingsIcon
label: "高级配置"
parameterCount: 8
hasErrors: true
// 包含键盘导航说明和 ARIA 标签展示
```

## 🎨 视觉效果速查

### 状态指示器

| 状态 | 视觉效果 | 颜色 |
|-----|---------|------|
| 正常 | 无特殊指示 | - |
| 错误 | 红色脉冲圆点 | `#DC2626` / `#EF4444` |
| 折叠 | 参数数量徽章 | 灰色背景 |

### 动画效果

| 元素 | 动画 | 时长 |
|-----|------|------|
| 图标悬停 | scale(1.1) + rotate(5deg) | 200ms |
| 按钮悬停 | scale(1.05) | 200ms |
| 按钮点击 | scale(0.95) | 100ms |
| 折叠按钮 | rotate(180deg) | 250ms |
| 徽章出现 | 弹簧动画 | spring |
| 错误指示 | 脉冲动画 | 2s 循环 |

### 颜色系统

**浅色主题**:
```css
--node-bg: #FFFFFF
--node-border: #E5E5E5
--node-header-bg: #FAFAFA
--text-primary: #1A1A1A
--text-secondary: #666666
--param-bg: #F8F8F8
--param-bg-hover: #F0F0F0
```

**深色主题**:
```css
--node-bg: #1A1A1A
--node-border: #333333
--node-header-bg: #222222
--text-primary: #E5E5E5
--text-secondary: #999999
--param-bg: #242424
--param-bg-hover: #2E2E2E
```

## 🔧 常用操作

### 启动 Storybook
```bash
npm run storybook
```

### 构建 Storybook
```bash
npm run build-storybook
```

### 查看特定故事
```
http://localhost:6006/?path=/story/workflow-nodeheader--default
http://localhost:6006/?path=/story/workflow-nodeheader--interactive
http://localhost:6006/?path=/story/workflow-nodeheader--accessibility
```

## 🧪 测试检查清单

### 视觉测试
- [ ] 默认状态正确显示
- [ ] 折叠状态正确显示
- [ ] 错误指示器正确显示
- [ ] 参数徽章正确显示
- [ ] 长标题正确省略
- [ ] 浅色主题正确
- [ ] 深色主题正确

### 交互测试
- [ ] 折叠按钮可点击
- [ ] 高级设置按钮可点击
- [ ] 图标悬停动画正常
- [ ] 按钮悬停效果正常
- [ ] 工具提示正确显示

### 可访问性测试
- [ ] Tab 键导航正常
- [ ] Enter/Space 键激活按钮
- [ ] 焦点指示器清晰
- [ ] ARIA 标签正确
- [ ] 屏幕阅读器兼容

### 性能测试
- [ ] 组件渲染流畅
- [ ] 动画不卡顿
- [ ] 主题切换平滑
- [ ] 无内存泄漏

## 📊 Props 速查表

| Prop | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `icon` | `LucideIcon` | ✅ | - | 节点图标 |
| `label` | `string` | ✅ | - | 节点标题 |
| `color` | `string` | ✅ | - | 节点颜色 |
| `isCollapsed` | `boolean` | ✅ | - | 折叠状态 |
| `onToggleCollapse` | `() => void` | ✅ | - | 折叠回调 |
| `onOpenAdvanced` | `() => void` | ✅ | - | 高级设置回调 |
| `parameterCount` | `number` | ✅ | - | 参数数量 |
| `hasErrors` | `boolean` | ✅ | - | 错误状态 |

## 🎯 使用场景

### 开发新功能
使用 **Interactive** 故事进行快速迭代

### 修复 Bug
使用 **AllStates** 故事验证所有状态

### 主题调整
使用 **ThemeComparison** 故事对比效果

### 可访问性改进
使用 **Accessibility** 故事测试

### 视觉回归测试
使用所有故事进行截图对比

## 💡 最佳实践

### 1. 开发时
- 保持 Storybook 运行
- 使用 Interactive 故事测试
- 频繁切换主题验证

### 2. 测试时
- 检查所有故事
- 使用 Controls 面板
- 测试键盘导航

### 3. 文档时
- 更新故事描述
- 添加代码示例
- 说明使用场景

## 🔗 相关链接

- [完整指南](./NODEHEADER_STORYBOOK_GUIDE.md)
- [组件文档](./NODEHEADER_QUICK_REFERENCE.md)
- [设计规范](./WORKFLOW_THEME_REDESIGN_PREVIEW.md)
- [可访问性指南](./WORKFLOW_ACCESSIBILITY_GUIDE.md)

## 📝 快速命令

```bash
# 启动开发环境
npm run dev & npm run storybook

# 运行测试
npm test

# 构建生产版本
npm run build && npm run build-storybook

# 清除缓存
rm -rf node_modules/.cache && npm run storybook
```

## ⚡ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `S` | 显示/隐藏侧边栏 |
| `A` | 显示/隐藏 Addons 面板 |
| `D` | 切换深色模式 |
| `F` | 全屏模式 |
| `/` | 搜索故事 |

---

**提示**: 这是一个快速参考文档。详细信息请查看 [完整指南](./NODEHEADER_STORYBOOK_GUIDE.md)。
