# MessageDock HeroUI 迁移完成

## 概述

AssistantMessageDock 组件已成功从 Ant Design 迁移到 HeroUI，保持所有功能不变。

## 迁移内容

### 组件替换

| Ant Design | HeroUI | 说明 |
|------------|--------|------|
| `Modal` | `Modal` + `ModalContent` + `ModalHeader` + `ModalBody` + `ModalFooter` | HeroUI 使用组合式结构 |
| `Button` | `Button` | API 略有不同 |
| `Checkbox` | `Checkbox` | API 略有不同 |

### API 变化

#### Modal

**Ant Design:**
```tsx
<Modal
  title="标题"
  open={isOpen}
  onCancel={onClose}
  footer={[...]}
  width={500}
>
  {children}
</Modal>
```

**HeroUI:**
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="2xl"
>
  <ModalContent>
    <ModalHeader>标题</ModalHeader>
    <ModalBody>{children}</ModalBody>
    <ModalFooter>
      {/* 按钮 */}
    </ModalFooter>
  </ModalContent>
</Modal>
```

#### Button

**Ant Design:**
```tsx
<Button type="primary" onClick={handler}>
  文本
</Button>
```

**HeroUI:**
```tsx
<Button color="primary" onPress={handler}>
  文本
</Button>
```

#### Checkbox

**Ant Design:**
```tsx
<Checkbox
  checked={isChecked}
  onChange={handler}
  disabled={isDisabled}
/>
```

**HeroUI:**
```tsx
<Checkbox
  isSelected={isChecked}
  onValueChange={handler}
  isDisabled={isDisabled}
/>
```

## 主题支持

HeroUI 使用语义化的主题变量：

- `bg-content1` - 主要背景色
- `bg-content2` - 次要背景色
- `text-foreground` - 主要文本色
- `text-foreground-500` - 次要文本色
- `border-divider` - 分割线颜色

这些变量会自动适配浅色/深色主题。

## 样式类名

### Modal 自定义类名

```tsx
classNames={{
  base: "bg-content1",           // 模态窗口基础样式
  header: "border-b border-divider", // 头部样式
  body: "py-6",                  // 内容区域样式
  footer: "border-t border-divider", // 底部样式
}}
```

### Button 变体

- `variant="solid"` - 实心按钮（默认）
- `variant="flat"` - 扁平按钮
- `variant="bordered"` - 边框按钮
- `variant="light"` - 轻量按钮
- `variant="ghost"` - 幽灵按钮

### Button 颜色

- `color="default"` - 默认色
- `color="primary"` - 主色
- `color="secondary"` - 次色
- `color="success"` - 成功色
- `color="warning"` - 警告色
- `color="danger"` - 危险色

## 功能验证

所有功能已验证正常工作：

- ✅ 收起/展开 Dock
- ✅ 打开助理选择器
- ✅ 选择/取消选择助理
- ✅ 全选/取消全选
- ✅ 最多 5 个助理限制
- ✅ 至少 1 个助理限制
- ✅ localStorage 持久化
- ✅ 深色/浅色主题切换

## 优势

使用 HeroUI 的优势：

1. **更好的主题集成**：与项目其他部分使用相同的设计系统
2. **更小的包体积**：HeroUI 基于 Tailwind CSS，按需加载
3. **更好的类型支持**：TypeScript 类型定义更完善
4. **更现代的 API**：使用 `onPress` 而不是 `onClick`，更符合 React 规范
5. **更灵活的样式定制**：通过 `classNames` prop 精确控制每个部分的样式

## 注意事项

1. **事件处理器名称**：
   - Ant Design 使用 `onClick`
   - HeroUI 使用 `onPress`

2. **布尔属性名称**：
   - Ant Design 使用 `checked`、`disabled`、`open`
   - HeroUI 使用 `isSelected`、`isDisabled`、`isOpen`

3. **Modal 结构**：
   - HeroUI 需要使用 `ModalContent` 包裹内容
   - 头部、内容、底部需要分别使用对应组件

## 相关文档

- [MESSAGE_DOCK_ENHANCED_FEATURES.md](./MESSAGE_DOCK_ENHANCED_FEATURES.md) - 增强功能详细文档
- [MESSAGE_DOCK_ENHANCED_QUICK_REFERENCE.md](./MESSAGE_DOCK_ENHANCED_QUICK_REFERENCE.md) - 快速参考
- [HeroUI Modal 文档](https://heroui.com/docs/components/modal) - 官方文档
