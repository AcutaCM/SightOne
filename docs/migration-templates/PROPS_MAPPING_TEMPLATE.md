# Props 映射文档

**组件名称**: [组件名称]  
**原 UI 库**: [NextUI / Ant Design / Material-UI / 自定义]  
**目标 UI 库**: HeroUI  
**更新日期**: [日期]

## 📋 Props 映射表

### 基础 Props

| 原 Props | 类型 | HeroUI Props | 类型 | 转换说明 | 示例 |
|---------|------|-------------|------|---------|------|
| disabled | boolean | isDisabled | boolean | 直接映射 | `disabled={true}` → `isDisabled={true}` |
| loading | boolean | isLoading | boolean | 直接映射 | `loading={true}` → `isLoading={true}` |
| onChange | function | onValueChange | function | 参数可能不同 | 见下方详细说明 |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

### 样式 Props

| 原 Props | 类型 | HeroUI Props | 类型 | 转换说明 | 示例 |
|---------|------|-------------|------|---------|------|
| className | string | className | string | 需更新样式类 | 见样式映射 |
| style | object | style | object | 尽量避免使用 | 使用 className 替代 |
| variant | string | variant | string | 值可能不同 | 见变体映射 |
| size | string | size | string | 值可能不同 | 见尺寸映射 |
| color | string | color | string | 值可能不同 | 见颜色映射 |
|  |  |  |  |  |  |

### 特殊 Props

| 原 Props | 类型 | HeroUI Props | 类型 | 转换说明 | 示例 |
|---------|------|-------------|------|---------|------|
|  |  |  |  |  |  |
|  |  |  |  |  |  |

## 🎨 变体映射

### Variant 值映射

| 原值 | HeroUI 值 | 说明 |
|-----|----------|------|
| outlined | bordered | 边框样式 |
| filled | solid | 填充样式 |
| text | light | 轻量样式 |
|  |  |  |

### Size 值映射

| 原值 | HeroUI 值 | 说明 |
|-----|----------|------|
| small | sm | 小尺寸 |
| medium | md | 中尺寸 |
| large | lg | 大尺寸 |
|  |  |  |

### Color 值映射

| 原值 | HeroUI 值 | 说明 |
|-----|----------|------|
| primary | primary | 主色 |
| secondary | secondary | 次色 |
| error | danger | 危险/错误 |
| warning | warning | 警告 |
| success | success | 成功 |
| info | primary | 信息（使用主色） |
|  |  |  |

## 🔄 事件处理映射

### onChange 事件

**原实现**:
```typescript
onChange={(event) => {
  const value = event.target.value
  handleChange(value)
}}
```

**HeroUI 实现**:
```typescript
onValueChange={(value) => {
  handleChange(value)
}}
```

### onClick 事件

**原实现**:
```typescript
onClick={(event) => {
  handleClick(event)
}}
```

**HeroUI 实现**:
```typescript
onPress={() => {
  handleClick()
}}
```

## 💅 样式类映射

### 背景色

| 原样式 | HeroUI 样式 | 说明 |
|-------|------------|------|
| bg-white | bg-content1 | 主要内容背景 |
| bg-gray-100 | bg-content2 | 次要内容背景 |
| bg-gray-200 | bg-content3 | 三级内容背景 |
| bg-black | bg-content1 | 深色模式自动处理 |
|  |  |  |

### 文本色

| 原样式 | HeroUI 样式 | 说明 |
|-------|------------|------|
| text-black | text-foreground | 主要文本 |
| text-gray-600 | text-foreground/60 | 60% 透明度文本 |
| text-gray-400 | text-foreground/40 | 40% 透明度文本 |
| text-white | text-foreground | 深色模式自动处理 |
|  |  |  |

### 边框

| 原样式 | HeroUI 样式 | 说明 |
|-------|------------|------|
| border-gray-200 | border-divider | 分隔线颜色 |
| border-gray-300 | border-divider | 分隔线颜色 |
|  |  |  |

## 📝 代码示例

### 迁移前

```typescript
import { Button } from 'antd'

<Button
  type="primary"
  size="large"
  loading={isLoading}
  disabled={isDisabled}
  onClick={handleClick}
  className="bg-blue-500 text-white"
>
  点击我
</Button>
```

### 迁移后

```typescript
import { Button } from '@heroui/button'

<Button
  color="primary"
  size="lg"
  isLoading={isLoading}
  isDisabled={isDisabled}
  onPress={handleClick}
  className="bg-primary text-primary-foreground"
>
  点击我
</Button>
```

## ⚠️ 注意事项

### 1. 事件处理差异

- NextUI/Ant Design 通常使用 `onClick`
- HeroUI 使用 `onPress`
- 事件参数可能不同

### 2. 布尔 Props 命名

- 旧库: `disabled`, `loading`, `checked`
- HeroUI: `isDisabled`, `isLoading`, `isSelected`

### 3. 样式 Props

- 优先使用 HeroUI 的 `variant` 和 `color` props
- 避免使用内联 `style`
- 使用主题变量而非硬编码颜色

### 4. 子组件结构

某些组件的子组件结构可能不同，需要重新组织。

## 🔗 参考资源

- [HeroUI 组件文档](https://heroui.com/docs/components)
- [HeroUI 主题定制](https://heroui.com/docs/customization/theme)
- [迁移指南](../MIGRATION_GUIDE.md)

## ✅ 验证清单

- [ ] 所有 Props 已映射
- [ ] 事件处理已更新
- [ ] 样式类已更新
- [ ] 代码示例已验证
- [ ] 文档已审查

---

**文档状态**: [ ] 草稿 / [ ] 审查中 / [ ] 已完成  
**最后更新**: [日期]  
**维护人**: [姓名]
