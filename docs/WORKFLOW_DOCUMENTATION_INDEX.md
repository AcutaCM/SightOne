# Workflow组件文档索引

## 📚 文档导航

快速找到您需要的文档。

---

## 🚀 快速开始

### 新用户

1. 📖 [主题使用指南](./WORKFLOW_THEME_USAGE_GUIDE.md) - **从这里开始**
2. 📋 [组件API文档](./WORKFLOW_COMPONENT_API.md) - 查看所有组件API
3. 💡 [快速参考](./NODEHEADER_QUICK_REFERENCE.md) - 常用代码片段

### 现有用户（升级）

1. 🔄 [迁移指南](./WORKFLOW_THEME_MIGRATION_GUIDE.md) - **必读**
2. ⚠️ [破坏性变更](./WORKFLOW_THEME_MIGRATION_GUIDE.md#破坏性变更) - 了解变更内容
3. 🛠️ [迁移脚本](../scripts/migrate-workflow-theme.js) - 自动迁移工具

---

## 📖 核心文档

### 主题系统

| 文档 | 描述 | 适合人群 |
|------|------|----------|
| [主题使用指南](./WORKFLOW_THEME_USAGE_GUIDE.md) | 完整的主题系统说明 | 所有用户 |
| [主题切换指南](./THEME_SWITCHING_GUIDE.md) | 浅色/深色主题切换 | 开发者 |
| [颜色对比度优化](./COLOR_CONTRAST_OPTIMIZATION.md) | 可访问性颜色指南 | 设计师 |

### 组件文档

| 文档 | 描述 | 适合人群 |
|------|------|----------|
| [组件API文档](./WORKFLOW_COMPONENT_API.md) | 所有组件的完整API | 开发者 |
| [NodeHeader文档](./NODE_HEADER_IMPLEMENTATION.md) | NodeHeader详细说明 | 开发者 |
| [InlineParameterNode文档](./INLINE_PARAMETER_NODE_IMPLEMENTATION.md) | 节点组件详细说明 | 开发者 |
| [ParameterItem文档](./PARAMETER_ITEM_IMPLEMENTATION.md) | 参数项详细说明 | 开发者 |

### 迁移文档

| 文档 | 描述 | 适合人群 |
|------|------|----------|
| [迁移指南](./WORKFLOW_THEME_MIGRATION_GUIDE.md) | 完整的迁移步骤 | 现有用户 |
| [迁移脚本](../scripts/migrate-workflow-theme.js) | 自动迁移工具 | 开发者 |

---

## 🎯 按任务查找

### 我想了解主题系统

- [主题使用指南](./WORKFLOW_THEME_USAGE_GUIDE.md) - 完整指南
- [CSS变量列表](./WORKFLOW_THEME_USAGE_GUIDE.md#css变量) - 所有变量
- [自定义主题](./WORKFLOW_THEME_USAGE_GUIDE.md#自定义主题) - 自定义方法

### 我想使用组件

- [组件API文档](./WORKFLOW_COMPONENT_API.md) - 完整API
- [使用示例](./WORKFLOW_THEME_USAGE_GUIDE.md#组件使用) - 代码示例
- [快速参考](./NODEHEADER_QUICK_REFERENCE.md) - 常用代码

### 我想迁移到新版本

- [迁移指南](./WORKFLOW_THEME_MIGRATION_GUIDE.md) - 完整步骤
- [破坏性变更](./WORKFLOW_THEME_MIGRATION_GUIDE.md#破坏性变更) - 变更列表
- [迁移脚本](../scripts/migrate-workflow-theme.js) - 自动工具

### 我遇到了问题

- [故障排除](./WORKFLOW_THEME_USAGE_GUIDE.md#故障排除) - 常见问题
- [常见问题](./WORKFLOW_THEME_MIGRATION_GUIDE.md#常见问题) - 迁移问题
- [调试指南](./WORKFLOW_COMPONENT_STATUS.md) - 组件状态

---

## 📋 完整文档列表

### 使用指南

- [主题使用指南](./WORKFLOW_THEME_USAGE_GUIDE.md)
- [组件API文档](./WORKFLOW_COMPONENT_API.md)
- [迁移指南](./WORKFLOW_THEME_MIGRATION_GUIDE.md)

### 实现文档

- [NodeHeader实现](./NODE_HEADER_IMPLEMENTATION.md)
- [InlineParameterNode实现](./INLINE_PARAMETER_NODE_IMPLEMENTATION.md)
- [ParameterItem实现](./PARAMETER_ITEM_IMPLEMENTATION.md)
- [ParameterList实现](./PARAMETER_LIST_IMPLEMENTATION.md)
- [参数编辑器实现](./PARAMETER_EDITORS_IMPLEMENTATION.md)

### 快速参考

- [NodeHeader快速参考](./NODEHEADER_QUICK_REFERENCE.md)
- [InlineParameterNode快速参考](./INLINEPARAMETERNODE_THEME_QUICK_REFERENCE.md)
- [ParameterItem快速参考](./PARAMETERITEM_QUICK_REFERENCE.md)
- [主题切换快速参考](./THEME_SWITCHING_QUICK_REFERENCE.md)

### 视觉指南

- [NodeHeader视觉指南](./NODEHEADER_REDESIGN_VISUAL_GUIDE.md)
- [主题切换视觉指南](./THEME_SWITCHING_VISUAL_GUIDE.md)
- [可访问性视觉指南](./ACCESSIBILITY_VISUAL_GUIDE.md)
- [动画视觉指南](./ANIMATION_VISUAL_GUIDE.md)

### 任务完成文档

- [Task 2: NodeHeader重设计](./TASK_2_NODEHEADER_REDESIGN_COMPLETE.md)
- [Task 3: InlineParameterNode重设计](./TASK_3_INLINEPARAMETERNODE_REDESIGN_COMPLETE.md)
- [Task 5: ParameterItem重设计](./TASK_5_COMPLETE_SUMMARY.md)
- [Task 6: 参数编辑器重设计](./TASK_6_PARAMETER_EDITORS_REDESIGN_COMPLETE.md)
- [Task 7: 主题切换支持](./TASK_7_THEME_SWITCHING_COMPLETE.md)
- [Task 8: 可访问性增强](./TASK_8_ACCESSIBILITY_COMPLETE.md)
- [Task 9: 性能优化](./TASK_9_PERFORMANCE_OPTIMIZATION_COMPLETE.md)
- [Task 10: ResizeHandle更新](./TASK_10_RESIZE_HANDLE_COMPLETE.md)
- [Task 11: AnimatedEdge更新](./TASK_11_ANIMATED_EDGE_COMPLETE.md)
- [Task 12: Storybook故事](./TASK_12_1_NODEHEADER_STORIES_COMPLETE.md)
- [Task 14: 文档更新](./TASK_14_DOCUMENTATION_COMPLETE.md)

### 测试文档

- [主题切换测试](../__tests__/workflow/theme-switching.test.tsx)
- [可访问性测试](../__tests__/workflow/accessibility.test.tsx)
- [颜色对比度测试](../__tests__/workflow/color-contrast.test.ts)
- [性能优化测试](../__tests__/workflow/performance-optimization.test.ts)

### 规范文档

- [需求文档](../.kiro/specs/workflow-theme-redesign/requirements.md)
- [设计文档](../.kiro/specs/workflow-theme-redesign/design.md)
- [任务列表](../.kiro/specs/workflow-theme-redesign/tasks.md)

---

## 🛠️ 工具和脚本

### 迁移工具

```bash
# 自动迁移脚本
node scripts/migrate-workflow-theme.js

# 检查模式（不修改文件）
node scripts/migrate-workflow-theme.js --dry-run

# 指定目录
node scripts/migrate-workflow-theme.js --dir=./components
```

### 验证工具

```bash
# 运行测试
npm test

# 类型检查
npm run type-check

# 代码审计
node scripts/audit-components.js
```

---

## 💡 学习路径

### 初学者路径

1. 阅读 [主题使用指南](./WORKFLOW_THEME_USAGE_GUIDE.md)
2. 查看 [快速参考](./NODEHEADER_QUICK_REFERENCE.md)
3. 尝试 [使用示例](./WORKFLOW_THEME_USAGE_GUIDE.md#代码示例)
4. 参考 [组件API文档](./WORKFLOW_COMPONENT_API.md)

### 进阶路径

1. 深入 [设计文档](../.kiro/specs/workflow-theme-redesign/design.md)
2. 学习 [实现文档](./NODE_HEADER_IMPLEMENTATION.md)
3. 研究 [性能优化](./TASK_9_PERFORMANCE_OPTIMIZATION_COMPLETE.md)
4. 了解 [可访问性](./TASK_8_ACCESSIBILITY_COMPLETE.md)

### 迁移路径

1. 阅读 [迁移指南](./WORKFLOW_THEME_MIGRATION_GUIDE.md)
2. 查看 [破坏性变更](./WORKFLOW_THEME_MIGRATION_GUIDE.md#破坏性变更)
3. 运行 [迁移脚本](../scripts/migrate-workflow-theme.js)
4. 使用 [检查清单](./WORKFLOW_THEME_MIGRATION_GUIDE.md#迁移检查清单)

---

## 🔍 搜索提示

### 按关键词搜索

- **主题**: 主题使用指南、主题切换指南
- **组件**: 组件API文档、实现文档
- **迁移**: 迁移指南、迁移脚本
- **样式**: CSS变量、颜色系统
- **性能**: 性能优化、虚拟化
- **可访问性**: 可访问性增强、ARIA标签

### 按文件类型搜索

- **指南**: `*_GUIDE.md`
- **参考**: `*_REFERENCE.md`
- **实现**: `*_IMPLEMENTATION.md`
- **完成**: `*_COMPLETE.md`
- **测试**: `*.test.tsx`, `*.test.ts`

---

## 📞 获取帮助

### 文档问题

- 查看 [故障排除](./WORKFLOW_THEME_USAGE_GUIDE.md#故障排除)
- 查看 [常见问题](./WORKFLOW_THEME_MIGRATION_GUIDE.md#常见问题)

### 技术支持

- 提交Issue到GitHub
- 联系开发团队
- 查看相关文档

---

## 📝 文档贡献

如果您发现文档问题或想要改进文档：

1. 提交Issue说明问题
2. 提交Pull Request
3. 联系文档维护者

---

## 🔄 文档更新

- **最后更新**: 2024-10-24
- **版本**: v2.0.0
- **维护者**: 开发团队

---

## 📊 文档统计

- **总文档数**: 40+
- **代码示例**: 100+
- **API说明**: 50+
- **测试用例**: 20+

---

**提示**: 建议将此文档加入书签，方便快速查找所需文档。
