# NodeHeader Stories 快速开始 ⚡

## 🚀 5 分钟快速开始

### 步骤 1: 安装 Storybook

```bash
npx storybook@latest init
```

等待安装完成（约 2-3 分钟）。

### 步骤 2: 启动 Storybook

```bash
npm run storybook
```

Storybook 将在 `http://localhost:6006` 启动。

### 步骤 3: 查看 NodeHeader 故事

1. 在浏览器中打开 http://localhost:6006
2. 在左侧导航栏找到 **Workflow > NodeHeader**
3. 点击任意故事查看效果

## 🎯 推荐查看顺序

### 初次使用（5 分钟）

1. **Default** - 了解基本结构
2. **Interactive** - 体验交互效果
3. **ThemeComparison** - 查看主题切换

### 深入了解（10 分钟）

4. **AllStates** - 查看所有状态
5. **DifferentIcons** - 查看不同节点类型
6. **Accessibility** - 了解可访问性

### 完整探索（20 分钟）

7. 查看所有 12 个故事
8. 使用 Controls 面板调整属性
9. 测试键盘导航

## 💡 快速技巧

### 使用 Controls 面板

1. 打开任意故事
2. 在底部找到 **Controls** 标签
3. 修改属性值，实时查看变化

**可调整的属性**:
- `label`: 节点标题
- `isCollapsed`: 折叠状态
- `parameterCount`: 参数数量
- `hasErrors`: 错误状态

### 切换主题

1. 点击工具栏的 **Theme** 按钮（圆圈图标）
2. 选择 `light` 或 `dark`
3. 查看组件在不同主题下的表现

### 切换背景

1. 点击工具栏的背景图标
2. 选择不同的背景颜色
3. 测试组件对比度

## 🎨 最佳故事推荐

### 🏆 最实用: Interactive

**为什么**: 完全交互式，可以实时切换状态

**如何使用**:
1. 打开 Interactive 故事
2. 使用控制面板切换折叠/错误状态
3. 观察组件变化

### 🎭 最全面: AllStates

**为什么**: 展示所有 4 种状态组合

**如何使用**:
1. 打开 AllStates 故事
2. 对比不同状态的视觉效果
3. 验证设计一致性

### 🌓 最直观: ThemeComparison

**为什么**: 并排对比浅色和深色主题

**如何使用**:
1. 打开 ThemeComparison 故事
2. 查看两种主题的差异
3. 验证对比度和可读性

### ♿ 最重要: Accessibility

**为什么**: 展示完整的可访问性支持

**如何使用**:
1. 打开 Accessibility 故事
2. 使用 Tab 键导航
3. 测试键盘操作

## 🔍 常见问题

### Q: Storybook 无法启动？

```bash
# 清除缓存
rm -rf node_modules/.cache

# 重新安装
npm install

# 重新启动
npm run storybook
```

### Q: 样式不正确？

确保在 `.storybook/preview.ts` 中导入了全局样式：

```typescript
import '../styles/globals.css';
```

### Q: 主题切换不工作？

检查 CSS 变量是否在 `globals.css` 中正确定义。

### Q: 如何添加新故事？

在 `NodeHeader.stories.tsx` 中添加：

```typescript
export const MyNewStory: Story = {
  args: {
    icon: YourIcon,
    label: "Your Label",
    // ... 其他属性
  },
};
```

## 📚 更多资源

### 详细文档

- [完整指南](./NODEHEADER_STORYBOOK_GUIDE.md) - 详细的设置和使用说明
- [快速参考](./NODEHEADER_STORIES_QUICK_REFERENCE.md) - 速查表和命令
- [视觉指南](./NODEHEADER_STORIES_VISUAL_GUIDE.md) - ASCII 艺术图示

### 组件文档

- [NodeHeader 组件](./NODEHEADER_QUICK_REFERENCE.md)
- [工作流主题](./WORKFLOW_THEME_REDESIGN_PREVIEW.md)
- [可访问性](./WORKFLOW_ACCESSIBILITY_GUIDE.md)

## 🎯 下一步

### 开发者

1. 查看所有故事
2. 阅读组件文档
3. 开始使用 NodeHeader 组件

### 设计师

1. 查看 ThemeComparison 故事
2. 验证设计规范
3. 提供反馈

### 测试人员

1. 查看 AllStates 故事
2. 测试 Accessibility 故事
3. 验证所有交互

## ⚡ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `S` | 显示/隐藏侧边栏 |
| `A` | 显示/隐藏 Addons 面板 |
| `D` | 切换深色模式 |
| `F` | 全屏模式 |
| `/` | 搜索故事 |

## 🎉 开始探索！

现在你已经准备好了！打开 Storybook，开始探索 NodeHeader 的 12 个精彩故事吧！

```bash
npm run storybook
```

然后访问: http://localhost:6006

---

**需要帮助？** 查看 [完整指南](./NODEHEADER_STORYBOOK_GUIDE.md) 或 [快速参考](./NODEHEADER_STORIES_QUICK_REFERENCE.md)
