# 基础组件库使用指南

## 概述

基础组件库提供了一套统一的、基于 HeroUI 的可复用组件，用于构建一致的用户界面。

## BasePanel 组件

### 简介

`BasePanel` 是一个统一的面板基础组件，基于 HeroUI Card 构建，提供标准化的面板布局。

### 特性

- ✅ 基于 HeroUI Card
- ✅ 支持标题和图标
- ✅ 支持操作按钮区域
- ✅ 支持折叠/展开功能
- ✅ 完全响应主题切换
- ✅ 灵活的样式定制
- ✅ TypeScript 类型支持

### 基本用法

```typescript
import { BasePanel } from '@/components/base';
import { Settings } from 'lucide-react';

<BasePanel
  title="设置面板"
  icon={<Settings className="w-5 h-5" />}
>
  <p>面板内容</p>
</BasePanel>
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | 必填 | 面板标题 |
| icon | ReactNode | - | 标题图标 |
| actions | ReactNode | - | 操作按钮区域 |
| children | ReactNode | 必填 | 面板内容 |
| collapsible | boolean | false | 是否可折叠 |
| defaultCollapsed | boolean | false | 默认是否折叠 |
| className | string | '' | 自定义类名 |
| headerClassName | string | '' | 头部自定义类名 |
| bodyClassName | string | '' | 内容区自定义类名 |
| showDivider | boolean | true | 是否显示分隔线 |
| variant | 'flat' \| 'bordered' \| 'shadow' | 'bordered' | 卡片变体 |
| fullHeight | boolean | false | 是否全高度 |

### 使用示例

#### 1. 基础面板

```typescript
<BasePanel title="基础面板">
  <p>这是一个基础面板</p>
</BasePanel>
```

#### 2. 带图标的面板

```typescript
import { Database } from 'lucide-react';

<BasePanel
  title="数据面板"
  icon={<Database className="w-5 h-5 text-primary" />}
>
  <p>数据内容</p>
</BasePanel>
```

#### 3. 带操作按钮的面板

```typescript
import { Button } from '@heroui/button';
import { RefreshCw } from 'lucide-react';

<BasePanel
  title="可刷新面板"
  actions={
    <Button
      size="sm"
      variant="light"
      startContent={<RefreshCw className="w-4 h-4" />}
      onPress={handleRefresh}
    >
      刷新
    </Button>
  }
>
  <p>内容</p>
</BasePanel>
```

#### 4. 可折叠面板

```typescript
<BasePanel
  title="可折叠面板"
  collapsible
  defaultCollapsed={false}
>
  <p>可以折叠的内容</p>
</BasePanel>
```

#### 5. 全高度面板

```typescript
<BasePanel
  title="全高度面板"
  fullHeight
  className="min-h-screen"
>
  <p>占满容器高度的内容</p>
</BasePanel>
```

#### 6. 自定义样式

```typescript
<BasePanel
  title="自定义样式"
  variant="shadow"
  className="max-w-2xl mx-auto"
  headerClassName="bg-primary/10"
  bodyClassName="p-6"
>
  <p>自定义样式的内容</p>
</BasePanel>
```

#### 7. 复杂示例

```typescript
import { BasePanel } from '@/components/base';
import { Button } from '@heroui/button';
import { Settings, Download, RefreshCw } from 'lucide-react';

<BasePanel
  title="系统日志"
  icon={<Settings className="w-5 h-5 text-primary" />}
  collapsible
  actions={
    <>
      <Button
        size="sm"
        variant="light"
        isIconOnly
        onPress={handleRefresh}
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="light"
        isIconOnly
        onPress={handleDownload}
      >
        <Download className="w-4 h-4" />
      </Button>
    </>
  }
  fullHeight
>
  <div className="space-y-2">
    {logs.map(log => (
      <div key={log.id} className="p-2 rounded bg-content2">
        {log.message}
      </div>
    ))}
  </div>
</BasePanel>
```

### 主题响应

BasePanel 完全响应 HeroUI 主题系统：

- **浅色模式**: 使用 `bg-content1`, `text-foreground` 等主题变量
- **深色模式**: 自动切换到深色主题颜色
- **自定义主题**: 支持自定义主题配置

### 最佳实践

#### 1. 使用语义化图标

```typescript
// ✅ 好的做法
<BasePanel
  title="用户设置"
  icon={<User className="w-5 h-5" />}
>

// ❌ 不好的做法
<BasePanel
  title="用户设置"
  icon={<div>👤</div>}
>
```

#### 2. 合理使用折叠功能

```typescript
// ✅ 适合折叠：次要信息
<BasePanel
  title="高级设置"
  collapsible
  defaultCollapsed={true}
>

// ❌ 不适合折叠：主要内容
<BasePanel
  title="主要内容"
  collapsible={false}
>
```

#### 3. 统一操作按钮样式

```typescript
// ✅ 统一使用 HeroUI Button
<BasePanel
  actions={
    <Button size="sm" variant="light">
      操作
    </Button>
  }
>

// ❌ 避免使用原生按钮
<BasePanel
  actions={<button>操作</button>}
>
```

#### 4. 使用主题变量

```typescript
// ✅ 使用主题变量
<BasePanel bodyClassName="bg-content2 p-4">

// ❌ 硬编码颜色
<BasePanel bodyClassName="bg-gray-100 p-4">
```

### 迁移指南

#### 从自定义 Card 迁移

**迁移前**:
```typescript
<div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold">标题</h3>
    <button>操作</button>
  </div>
  <div>内容</div>
</div>
```

**迁移后**:
```typescript
<BasePanel
  title="标题"
  actions={<Button size="sm">操作</Button>}
>
  <div>内容</div>
</BasePanel>
```

#### 从 HeroUI Card 迁移

**迁移前**:
```typescript
<Card>
  <CardHeader>
    <h3>标题</h3>
  </CardHeader>
  <Divider />
  <CardBody>
    <p>内容</p>
  </CardBody>
</Card>
```

**迁移后**:
```typescript
<BasePanel title="标题">
  <p>内容</p>
</BasePanel>
```

### 常见问题

#### Q: 如何隐藏分隔线？

A: 设置 `showDivider={false}`

```typescript
<BasePanel title="无分隔线" showDivider={false}>
  内容
</BasePanel>
```

#### Q: 如何自定义折叠图标？

A: 目前使用固定的 ChevronUp/ChevronDown 图标。如需自定义，可以扩展组件。

#### Q: 如何处理长标题？

A: 标题会自动换行，或者可以使用 `headerClassName` 自定义样式：

```typescript
<BasePanel
  title="这是一个很长很长的标题"
  headerClassName="flex-wrap"
>
```

#### Q: 可以嵌套使用吗？

A: 可以，但建议避免过深的嵌套：

```typescript
<BasePanel title="外层">
  <BasePanel title="内层" variant="flat">
    内容
  </BasePanel>
</BasePanel>
```

### 性能优化

1. **避免不必要的重渲染**
   ```typescript
   const actions = useMemo(() => (
     <Button onPress={handleAction}>操作</Button>
   ), [handleAction]);
   
   <BasePanel title="优化" actions={actions}>
   ```

2. **使用 React.memo**
   ```typescript
   const MemoizedPanel = React.memo(BasePanel);
   ```

### 可访问性

BasePanel 内置了可访问性支持：

- ✅ 折叠按钮有 `aria-label`
- ✅ 支持键盘导航
- ✅ 语义化 HTML 结构

### 相关组件

- `BaseModal` - 统一的模态框组件（待创建）
- `BaseTable` - 统一的表格组件（待创建）
- `BaseForm` - 统一的表单组件（待创建）

### 参考资源

- [HeroUI Card 文档](https://heroui.com/docs/components/card)
- [HeroUI Button 文档](https://heroui.com/docs/components/button)
- [Lucide Icons](https://lucide.dev/)

---

**版本**: 1.0.0  
**最后更新**: 2025年10月18日  
**维护人**: HeroUI 迁移团队


---

## BaseModal 组件

### 简介

`BaseModal` 是一个统一的模态框基础组件，基于 HeroUI Modal 构建，提供标准化的模态框布局。

### 特性

- ✅ 基于 HeroUI Modal
- ✅ 标准的 Header/Body/Footer 布局
- ✅ 支持确认/取消按钮
- ✅ 支持自定义页脚
- ✅ 支持加载状态
- ✅ 完全响应主题切换
- ✅ 灵活的尺寸和滚动行为
- ✅ TypeScript 类型支持

### 基本用法

```typescript
import { BaseModal } from '@/components/base';
import { useDisclosure } from '@heroui/react';

const { isOpen, onOpen, onOpenChange } = useDisclosure();

<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="确认操作"
  onConfirm={handleConfirm}
>
  <p>确定要执行此操作吗？</p>
</BaseModal>
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| isOpen | boolean | 必填 | 是否打开 |
| onOpenChange | (isOpen: boolean) => void | 必填 | 打开状态变化回调 |
| title | string | 必填 | 模态框标题 |
| children | ReactNode | 必填 | 模态框内容 |
| confirmText | string | '确认' | 确认按钮文本 |
| cancelText | string | '取消' | 取消按钮文本 |
| onConfirm | () => void \| Promise<void> | - | 确认按钮回调 |
| onCancel | () => void | - | 取消按钮回调 |
| showCancel | boolean | true | 是否显示取消按钮 |
| showConfirm | boolean | true | 是否显示确认按钮 |
| confirmColor | string | 'primary' | 确认按钮颜色 |
| confirmVariant | string | 'solid' | 确认按钮变体 |
| isLoading | boolean | false | 是否加载中 |
| size | string | 'md' | 模态框尺寸 |
| scrollBehavior | string | 'inside' | 滚动行为 |
| isDismissable | boolean | true | 是否可关闭 |
| isKeyboardDismissDisabled | boolean | false | 是否禁用键盘关闭 |
| className | string | '' | 自定义类名 |
| footer | ReactNode | - | 自定义页脚 |
| hideCloseButton | boolean | false | 是否隐藏关闭按钮 |

### 使用示例

#### 1. 确认对话框

```typescript
import { BaseModal } from '@/components/base';
import { useDisclosure } from '@heroui/react';

const { isOpen, onOpen, onOpenChange } = useDisclosure();

<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="删除确认"
  confirmText="删除"
  confirmColor="danger"
  onConfirm={handleDelete}
>
  <p>确定要删除这个项目吗？此操作无法撤销。</p>
</BaseModal>
```

#### 2. 表单模态框

```typescript
<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="添加用户"
  confirmText="保存"
  onConfirm={handleSave}
  isLoading={isSaving}
>
  <form className="space-y-4">
    <Input label="用户名" />
    <Input label="邮箱" type="email" />
    <Select label="角色">
      <SelectItem key="user">用户</SelectItem>
      <SelectItem key="admin">管理员</SelectItem>
    </Select>
  </form>
</BaseModal>
```

#### 3. 信息展示模态框

```typescript
<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="详细信息"
  showConfirm={false}
  cancelText="关闭"
>
  <div className="space-y-2">
    <p><strong>名称:</strong> {item.name}</p>
    <p><strong>描述:</strong> {item.description}</p>
    <p><strong>创建时间:</strong> {item.createdAt}</p>
  </div>
</BaseModal>
```

#### 4. 大尺寸模态框

```typescript
<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="数据详情"
  size="2xl"
  scrollBehavior="inside"
>
  <div className="space-y-4">
    {/* 大量内容 */}
  </div>
</BaseModal>
```

#### 5. 自定义页脚

```typescript
<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="高级设置"
  footer={
    <>
      <Button variant="light" onPress={handleReset}>
        重置
      </Button>
      <Button variant="light" onPress={onClose}>
        取消
      </Button>
      <Button color="primary" onPress={handleSave}>
        保存
      </Button>
    </>
  }
>
  <div>设置内容</div>
</BaseModal>
```

#### 6. 异步操作

```typescript
const handleConfirm = async () => {
  try {
    await api.deleteItem(itemId);
    toast.success('删除成功');
    onOpenChange(false);
  } catch (error) {
    toast.error('删除失败');
  }
};

<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="删除确认"
  confirmText="删除"
  confirmColor="danger"
  onConfirm={handleConfirm}
  isLoading={isDeleting}
>
  <p>确定要删除吗？</p>
</BaseModal>
```

### 与 useDisclosure 配合使用

HeroUI 提供了 `useDisclosure` hook 来管理模态框状态：

```typescript
import { useDisclosure } from '@heroui/react';
import { BaseModal } from '@/components/base';

function MyComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  return (
    <>
      <Button onPress={onOpen}>打开模态框</Button>
      
      <BaseModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="我的模态框"
        onConfirm={handleConfirm}
      >
        <p>内容</p>
      </BaseModal>
    </>
  );
}
```

### 主题响应

BaseModal 完全响应 HeroUI 主题系统：

- **浅色模式**: 使用浅色背景和深色文本
- **深色模式**: 自动切换到深色背景和浅色文本
- **自定义主题**: 支持自定义主题配置

### 最佳实践

#### 1. 使用语义化的确认按钮颜色

```typescript
// ✅ 危险操作使用 danger
<BaseModal confirmColor="danger" confirmText="删除">

// ✅ 成功操作使用 success
<BaseModal confirmColor="success" confirmText="提交">

// ✅ 普通操作使用 primary
<BaseModal confirmColor="primary" confirmText="保存">
```

#### 2. 异步操作显示加载状态

```typescript
// ✅ 显示加载状态
<BaseModal
  isLoading={isSubmitting}
  onConfirm={handleSubmit}
>

// ❌ 不显示加载状态
<BaseModal onConfirm={handleSubmit}>
```

#### 3. 合理使用模态框尺寸

```typescript
// ✅ 简单确认使用小尺寸
<BaseModal size="sm" title="确认">

// ✅ 表单使用中等尺寸
<BaseModal size="md" title="编辑">

// ✅ 详细内容使用大尺寸
<BaseModal size="2xl" title="详情">
```

#### 4. 内容较多时使用内部滚动

```typescript
// ✅ 内容多时使用 inside
<BaseModal scrollBehavior="inside">

// ✅ 内容少时使用 normal
<BaseModal scrollBehavior="normal">
```

### 迁移指南

#### 从自定义 Modal 迁移

**迁移前**:
```typescript
<div className="modal">
  <div className="modal-header">
    <h3>标题</h3>
    <button onClick={onClose}>×</button>
  </div>
  <div className="modal-body">
    内容
  </div>
  <div className="modal-footer">
    <button onClick={onClose}>取消</button>
    <button onClick={handleConfirm}>确认</button>
  </div>
</div>
```

**迁移后**:
```typescript
<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="标题"
  onConfirm={handleConfirm}
>
  内容
</BaseModal>
```

#### 从 HeroUI Modal 迁移

**迁移前**:
```typescript
<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader>标题</ModalHeader>
        <ModalBody>内容</ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>取消</Button>
          <Button color="primary" onPress={handleConfirm}>
            确认
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>
```

**迁移后**:
```typescript
<BaseModal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  title="标题"
  onConfirm={handleConfirm}
>
  内容
</BaseModal>
```

### 常见问题

#### Q: 如何禁用点击外部关闭？

A: 设置 `isDismissable={false}`

```typescript
<BaseModal isDismissable={false}>
```

#### Q: 如何隐藏取消按钮？

A: 设置 `showCancel={false}`

```typescript
<BaseModal showCancel={false}>
```

#### Q: 如何只显示内容，不显示按钮？

A: 设置 `showCancel={false}` 和 `showConfirm={false}`

```typescript
<BaseModal showCancel={false} showConfirm={false}>
```

#### Q: 如何处理表单提交？

A: 在 `onConfirm` 中处理表单逻辑

```typescript
const handleConfirm = async () => {
  const isValid = validateForm();
  if (!isValid) return;
  
  await submitForm();
  onOpenChange(false);
};

<BaseModal onConfirm={handleConfirm}>
```

### 性能优化

1. **避免不必要的重渲染**
   ```typescript
   const handleConfirm = useCallback(async () => {
     await saveData();
   }, [saveData]);
   ```

2. **使用 React.memo**
   ```typescript
   const MemoizedModal = React.memo(BaseModal);
   ```

### 可访问性

BaseModal 内置了可访问性支持：

- ✅ 自动焦点管理
- ✅ Escape 键关闭
- ✅ 键盘导航支持
- ✅ ARIA 标签完整

---

**版本**: 1.0.0  
**最后更新**: 2025年10月18日
