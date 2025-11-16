# 迁移文档模板使用指南

## 📋 概述

本指南说明如何使用迁移文档模板来规范化组件迁移过程。

## 📁 模板文件

### 1. 组件迁移检查清单

**文件**: `migration-templates/COMPONENT_MIGRATION_CHECKLIST.md`

**用途**: 跟踪单个组件的完整迁移过程

**使用时机**: 开始迁移任何组件之前

**如何使用**:
1. 复制模板到 `docs/migrations/[ComponentName]_CHECKLIST.md`
2. 填写组件基本信息
3. 按照检查清单逐项完成
4. 记录遇到的问题和解决方案
5. 完成后归档

**示例**:
```bash
# 复制模板
cp docs/migration-templates/COMPONENT_MIGRATION_CHECKLIST.md \
   docs/migrations/ReportPanel_CHECKLIST.md

# 编辑并填写
# 完成迁移后保存
```

### 2. Props 映射文档

**文件**: `migration-templates/PROPS_MAPPING_TEMPLATE.md`

**用途**: 记录组件 Props 从旧 UI 库到 HeroUI 的映射关系

**使用时机**: 迁移使用其他 UI 库的组件时

**如何使用**:
1. 复制模板到 `docs/props-mappings/[UILibrary]_to_HeroUI.md`
2. 填写 Props 映射表
3. 添加代码示例
4. 记录注意事项
5. 作为参考文档保存

**示例**:
```bash
# 为 Ant Design 组件创建映射文档
cp docs/migration-templates/PROPS_MAPPING_TEMPLATE.md \
   docs/props-mappings/AntD_Button_to_HeroUI.md
```

### 3. 测试用例模板

**文件**: `migration-templates/TEST_CASE_TEMPLATE.md`

**用途**: 指导编写组件测试用例

**使用时机**: 为迁移后的组件编写测试时

**如何使用**:
1. 参考模板中的测试场景
2. 在 `__tests__/components/` 创建测试文件
3. 按照模板编写测试用例
4. 确保覆盖率达标

**示例**:
```typescript
// __tests__/components/ReportPanel.test.tsx
import { render, screen } from '../utils/test-utils'
import ReportPanel from '@/components/ReportPanel'

describe('ReportPanel', () => {
  // 参考模板编写测试
})
```

## 🔄 完整迁移流程

### 阶段 1: 准备

1. **创建迁移检查清单**
   ```bash
   cp docs/migration-templates/COMPONENT_MIGRATION_CHECKLIST.md \
      docs/migrations/[ComponentName]_CHECKLIST.md
   ```

2. **分析组件**
   - 填写"迁移前检查"部分
   - 识别使用的 UI 库
   - 评估组件复杂度

3. **创建 Props 映射文档**（如需要）
   ```bash
   cp docs/migration-templates/PROPS_MAPPING_TEMPLATE.md \
      docs/props-mappings/[ComponentName]_PROPS.md
   ```

### 阶段 2: 迁移

1. **创建新分支**
   ```bash
   git checkout -b feat/migrate-[component-name]
   ```

2. **执行迁移**
   - 按照检查清单逐项完成
   - 更新代码
   - 测试功能

3. **记录问题**
   - 在检查清单中记录遇到的问题
   - 记录解决方案

### 阶段 3: 测试

1. **创建测试文件**
   ```bash
   touch __tests__/components/[ComponentName].test.tsx
   ```

2. **编写测试**
   - 参考测试用例模板
   - 覆盖所有关键功能
   - 确保覆盖率达标

3. **运行测试**
   ```bash
   npm test [ComponentName]
   npm run test:coverage
   ```

### 阶段 4: 审查

1. **自我审查**
   - 检查所有检查清单项
   - 运行 lint 和类型检查
   - 测试主题切换

2. **代码审查**
   - 提交 Pull Request
   - 附上迁移检查清单
   - 等待审查反馈

3. **合并**
   - 解决审查意见
   - 合并到主分支
   - 归档文档

## 📊 文档组织

```
docs/
├── migration-templates/          # 模板文件
│   ├── COMPONENT_MIGRATION_CHECKLIST.md
│   ├── PROPS_MAPPING_TEMPLATE.md
│   └── TEST_CASE_TEMPLATE.md
├── migrations/                   # 完成的迁移记录
│   ├── ReportPanel_CHECKLIST.md
│   ├── SimulationPanel_CHECKLIST.md
│   └── ...
├── props-mappings/              # Props 映射文档
│   ├── AntD_to_HeroUI.md
│   ├── NextUI_to_HeroUI.md
│   └── ...
└── MIGRATION_TEMPLATES_GUIDE.md # 本文档
```

## 💡 最佳实践

### 1. 及时更新文档

在迁移过程中实时更新检查清单，不要等到最后。

### 2. 详细记录问题

遇到的每个问题都要记录，包括：
- 问题描述
- 尝试的解决方案
- 最终的解决方案
- 参考资源

### 3. 保持一致性

所有组件迁移都应遵循相同的流程和标准。

### 4. 共享知识

完成的迁移文档应该归档并分享给团队，作为参考。

### 5. 持续改进

根据实际经验不断改进模板和流程。

## 🎯 质量标准

每个迁移完成后应满足：

- ✅ 检查清单 100% 完成
- ✅ 测试覆盖率 > 80%
- ✅ 无 lint 错误
- ✅ 无类型错误
- ✅ 主题切换正常
- ✅ 功能完全正常
- ✅ 文档已更新

## 📚 参考示例

### 示例 1: 简单组件迁移

**组件**: UserMenu (已完成)

**特点**:
- 已使用 HeroUI
- 无需迁移
- 可作为参考

**文件位置**: `components/UserMenu.tsx`

### 示例 2: 复杂组件迁移

**组件**: ReportPanel (待迁移)

**特点**:
- 混合使用多个 UI 库
- 需要完整迁移流程
- 需要详细的 Props 映射

**预计工时**: 11 小时

## 🔗 相关资源

- [HeroUI 文档](https://heroui.com)
- [组件审计报告](../COMPONENT_AUDIT_REPORT.md)
- [测试指南](../TESTING_GUIDE.md)
- [迁移设计文档](../.kiro/specs/heroui-migration/design.md)

## ❓ 常见问题

### Q: 是否每个组件都需要创建完整的文档？

A: 简单组件可以简化流程，但建议至少填写检查清单。复杂组件应该创建完整文档。

### Q: Props 映射文档是否需要为每个组件创建？

A: 不需要。可以按 UI 库创建通用的映射文档，多个组件共享。

### Q: 测试用例模板是否必须完全遵循？

A: 不是。模板提供指导，实际测试应根据组件特点调整。

### Q: 迁移文档是否需要长期保存？

A: 建议保存至少一个版本周期，作为参考和审计用途。

## ✅ 快速开始

1. **选择要迁移的组件**
   - 查看组件审计报告
   - 选择高优先级组件

2. **复制检查清单模板**
   ```bash
   cp docs/migration-templates/COMPONENT_MIGRATION_CHECKLIST.md \
      docs/migrations/[ComponentName]_CHECKLIST.md
   ```

3. **开始迁移**
   - 填写基本信息
   - 按照检查清单执行
   - 记录过程和问题

4. **完成并归档**
   - 确保所有检查项完成
   - 保存文档
   - 分享经验

---

**文档版本**: 1.0  
**最后更新**: 2025年10月18日  
**维护人**: HeroUI 迁移团队
