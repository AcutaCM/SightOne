# 助理审核管理页面 HeroUI 迁移指南

## 🎯 迁移目标

将 `app/admin/review/page.tsx` 从 Ant Design 迁移到 HeroUI，解决 React 19 兼容性警告，并统一 UI 风格。

## ⚠️ 当前问题

```
Warning: [antd: compatible] antd v5 support React is 16 ~ 18. 
see https://u.ant.design/v5-for-19 for compatible.
```

Ant Design v5 不支持 React 19，需要迁移到 HeroUI。

---

## 📋 组件映射表

### 1. Card → HeroUI Card

**Ant Design:**
```tsx
import { Card } from 'antd';

<Card
  title="助理审核管理"
  extra={<Space>...</Space>}
>
  内容
</Card>
```

**HeroUI:**
```tsx
import { Card, CardHeader, CardBody } from '@heroui/react';

<Card className="w-full">
  <CardHeader className="flex justify-between items-center">
    <h2 className="text-xl font-semibold">助理审核管理</h2>
    <div className="flex gap-2">...</div>
  </CardHeader>
  <CardBody>
    内容
  </CardBody>
</Card>
```

---

### 2. Table → HeroUI Table

**Ant Design:**
```tsx
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

<Table
  rowSelection={rowSelection}
  columns={columns}
  dataSource={data}
  rowKey="id"
  loading={loading}
  pagination={{ pageSize: 10 }}
/>
```

**HeroUI:**
```tsx
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination
} from '@heroui/react';

<Table
  aria-label="助理审核表格"
  selectionMode="multiple"
  selectedKeys={selectedKeys}
  onSelectionChange={setSelectedKeys}
  bottomContent={
    <div className="flex w-full justify-center">
      <Pagination
        total={Math.ceil(data.length / 10)}
        page={page}
        onChange={setPage}
      />
    </div>
  }
>
  <TableHeader>
    <TableColumn>助理</TableColumn>
    <TableColumn>作者</TableColumn>
    <TableColumn>标签</TableColumn>
    <TableColumn>状态</TableColumn>
    <TableColumn>提交时间</TableColumn>
    <TableColumn>操作</TableColumn>
  </TableHeader>
  <TableBody
    items={paginatedData}
    isLoading={loading}
    loadingContent={<Spinner label="加载中..." />}
  >
    {(item) => (
      <TableRow key={item.id}>
        <TableCell>{/* 助理信息 */}</TableCell>
        <TableCell>{item.author}</TableCell>
        <TableCell>{/* 标签 */}</TableCell>
        <TableCell>{/* 状态 */}</TableCell>
        <TableCell>{item.createdAt.toLocaleDateString()}</TableCell>
        <TableCell>{/* 操作按钮 */}</TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>
```

---

### 3. Modal → HeroUI Modal

**Ant Design:**
```tsx
import { Modal } from 'antd';

<Modal
  title="助理详情"
  open={showModal}
  onCancel={() => setShowModal(false)}
  width={800}
  footer={[
    <Button key="cancel" onClick={handleCancel}>取消</Button>,
    <Button key="submit" type="primary" onClick={handleOk}>确认</Button>
  ]}
>
  内容
</Modal>
```

**HeroUI:**
```tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';

<Modal
  isOpen={showModal}
  onOpenChange={setShowModal}
  size="2xl"
  scrollBehavior="inside"
>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader>助理详情</ModalHeader>
        <ModalBody>
          内容
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleOk}>
            确认
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>
```

---

### 4. Input → HeroUI Input

**Ant Design:**
```tsx
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

<Input
  placeholder="搜索..."
  prefix={<SearchOutlined />}
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
  allowClear
/>
```

**HeroUI:**
```tsx
import { Input } from '@heroui/react';
import { Search } from 'lucide-react';

<Input
  placeholder="搜索..."
  startContent={<Search size={18} />}
  value={searchText}
  onValueChange={setSearchText}
  isClearable
  variant="bordered"
/>
```

---

### 5. Select → HeroUI Select

**Ant Design:**
```tsx
import { Select } from 'antd';

<Select
  value={filterStatus}
  onChange={setFilterStatus}
  style={{ width: 120 }}
>
  <Select.Option value="all">全部状态</Select.Option>
  <Select.Option value="pending">待审核</Select.Option>
</Select>
```

**HeroUI:**
```tsx
import { Select, SelectItem } from '@heroui/react';

<Select
  selectedKeys={[filterStatus]}
  onSelectionChange={(keys) => setFilterStatus(Array.from(keys)[0])}
  className="w-32"
  variant="bordered"
>
  <SelectItem key="all">全部状态</SelectItem>
  <SelectItem key="pending">待审核</SelectItem>
  <SelectItem key="published">已发布</SelectItem>
  <SelectItem key="rejected">已拒绝</SelectItem>
</Select>
```

---

### 6. Button → HeroUI Button

**Ant Design:**
```tsx
import { Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

<Button
  type="primary"
  icon={<CheckOutlined />}
  onClick={handleApprove}
  loading={loading}
>
  通过
</Button>
```

**HeroUI:**
```tsx
import { Button } from '@heroui/react';
import { Check } from 'lucide-react';

<Button
  color="success"
  startContent={<Check size={18} />}
  onPress={handleApprove}
  isLoading={loading}
>
  通过
</Button>
```

---

### 7. Tag → HeroUI Chip

**Ant Design:**
```tsx
import { Tag } from 'antd';

<Tag color="orange">待审核</Tag>
<Tag color="green">已发布</Tag>
<Tag color="red">已拒绝</Tag>
```

**HeroUI:**
```tsx
import { Chip } from '@heroui/react';

<Chip color="warning" variant="flat">待审核</Chip>
<Chip color="success" variant="flat">已发布</Chip>
<Chip color="danger" variant="flat">已拒绝</Chip>
```

---

### 8. Drawer → HeroUI Modal (side variant)

**Ant Design:**
```tsx
import { Drawer } from 'antd';

<Drawer
  title="编辑助理"
  placement="right"
  open={showDrawer}
  onClose={() => setShowDrawer(false)}
  width={600}
>
  内容
</Drawer>
```

**HeroUI:**
```tsx
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';

<Modal
  isOpen={showDrawer}
  onOpenChange={setShowDrawer}
  placement="right"
  size="lg"
  scrollBehavior="inside"
>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader>编辑助理</ModalHeader>
        <ModalBody>
          内容
        </ModalBody>
      </>
    )}
  </ModalContent>
</Modal>
```

---

### 9. Form → HeroUI Input 组件

**Ant Design:**
```tsx
import { Form, Input } from 'antd';

<Form form={form} layout="vertical">
  <Form.Item
    name="title"
    label="助理名称"
    rules={[{ required: true, message: '请输入助理名称' }]}
  >
    <Input placeholder="输入助理名称" />
  </Form.Item>
</Form>
```

**HeroUI:**
```tsx
import { Input } from '@heroui/react';

<div className="flex flex-col gap-4">
  <Input
    label="助理名称"
    placeholder="输入助理名称"
    value={formData.title}
    onValueChange={(value) => setFormData({ ...formData, title: value })}
    isRequired
    errorMessage={errors.title}
    isInvalid={!!errors.title}
    variant="bordered"
  />
</div>
```

---

### 10. Switch → HeroUI Switch

**Ant Design:**
```tsx
import { Switch } from 'antd';

<Switch
  checked={isPublic}
  onChange={setIsPublic}
  checkedChildren="公开"
  unCheckedChildren="私有"
/>
```

**HeroUI:**
```tsx
import { Switch } from '@heroui/react';

<Switch
  isSelected={isPublic}
  onValueChange={setIsPublic}
  color="success"
>
  {isPublic ? '公开' : '私有'}
</Switch>
```

---

### 11. Space → Flexbox

**Ant Design:**
```tsx
import { Space } from 'antd';

<Space>
  <Button>按钮1</Button>
  <Button>按钮2</Button>
</Space>
```

**HeroUI:**
```tsx
<div className="flex gap-2">
  <Button>按钮1</Button>
  <Button>按钮2</Button>
</div>
```

---

### 12. Avatar → HeroUI Avatar

**Ant Design:**
```tsx
import { Avatar } from 'antd';

<Avatar size={40}>{emoji}</Avatar>
```

**HeroUI:**
```tsx
import { Avatar } from '@heroui/react';

<Avatar
  size="md"
  showFallback
  fallback={<span className="text-2xl">{emoji}</span>}
/>
```

---

## 🎨 颜色映射

### 状态颜色

| Ant Design | HeroUI | 用途 |
|------------|--------|------|
| `color="orange"` | `color="warning"` | 待审核 |
| `color="green"` | `color="success"` | 已发布/通过 |
| `color="red"` | `color="danger"` | 已拒绝/删除 |
| `color="blue"` | `color="primary"` | 标签/主要操作 |
| `color="default"` | `color="default"` | 草稿/默认 |

### 按钮变体

| Ant Design | HeroUI | 用途 |
|------------|--------|------|
| `type="primary"` | `color="primary"` | 主要操作 |
| `type="default"` | `variant="bordered"` | 次要操作 |
| `type="link"` | `variant="light"` | 链接样式 |
| `danger` | `color="danger"` | 危险操作 |

---

## 📦 导入更新

### 移除 Ant Design 导入

```tsx
// ❌ 移除
import { Card, Table, Modal, Input, Select, Button, Tag, Drawer, Form, Switch, Space, Avatar, message } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
```

### 添加 HeroUI 导入

```tsx
// ✅ 添加
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Button,
  Chip,
  Avatar,
  Spinner,
  Pagination,
  Switch
} from '@heroui/react';

// 图标使用 lucide-react
import {
  Check,
  X,
  Eye,
  Search,
  Filter,
  Edit,
  Trash2
} from 'lucide-react';
```

---

## 🔄 消息提示

Ant Design 的 `message` 需要替换为 toast 库（如 sonner 或 react-hot-toast）

### 安装 sonner

```bash
npm install sonner
```

### 使用 sonner

```tsx
import { toast } from 'sonner';

// ❌ Ant Design
message.success('操作成功！');
message.warning('警告信息');
message.error('错误信息');

// ✅ Sonner
toast.success('操作成功！');
toast.warning('警告信息');
toast.error('错误信息');
```

### 在 layout 中添加 Toaster

```tsx
// app/layout.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

---

## 🎯 迁移步骤

### 步骤 1: 更新导入 (5分钟)
- [ ] 移除所有 Ant Design 导入
- [ ] 添加 HeroUI 组件导入
- [ ] 添加 lucide-react 图标导入
- [ ] 安装并配置 sonner

### 步骤 2: 迁移 Card 容器 (10分钟)
- [ ] 替换主 Card 组件
- [ ] 更新 Card 标题和额外内容布局
- [ ] 调整样式类名

### 步骤 3: 迁移 Table 组件 (30分钟)
- [ ] 替换 Table 结构
- [ ] 迁移列定义到 TableColumn
- [ ] 迁移数据渲染到 TableBody
- [ ] 实现行选择功能
- [ ] 添加分页组件
- [ ] 添加加载状态

### 步骤 4: 迁移 Modal 组件 (20分钟)
- [ ] 替换详情 Modal
- [ ] 更新 Modal 内容布局
- [ ] 迁移 Footer 按钮

### 步骤 5: 迁移编辑 Drawer (20分钟)
- [ ] 替换 Drawer 为 Modal (side placement)
- [ ] 迁移表单输入组件
- [ ] 实现表单验证

### 步骤 6: 迁移输入和选择组件 (15分钟)
- [ ] 替换搜索 Input
- [ ] 替换过滤 Select
- [ ] 替换表单 Input 组件
- [ ] 替换 Switch 组件

### 步骤 7: 迁移按钮和标签 (15分钟)
- [ ] 替换所有 Button 组件
- [ ] 替换所有 Tag 为 Chip
- [ ] 更新图标

### 步骤 8: 迁移消息提示 (10分钟)
- [ ] 替换 message.success
- [ ] 替换 message.warning
- [ ] 替换 message.error

### 步骤 9: 样式调整 (20分钟)
- [ ] 调整布局间距
- [ ] 优化响应式设计
- [ ] 确保主题响应

### 步骤 10: 测试 (30分钟)
- [ ] 测试所有功能
- [ ] 测试主题切换
- [ ] 测试响应式布局
- [ ] 修复发现的问题

---

## 📝 注意事项

### 1. 状态管理
HeroUI 的某些组件使用不同的状态管理方式：
- `open` → `isOpen`
- `visible` → `isOpen`
- `disabled` → `isDisabled`
- `loading` → `isLoading`

### 2. 事件处理
- `onChange` → `onValueChange` (Input, Select)
- `onClick` → `onPress` (Button)
- `onCancel` → `onClose` (Modal)

### 3. 样式类名
使用 Tailwind CSS 类名而不是内联样式：
- `style={{ width: 120 }}` → `className="w-32"`
- `style={{ marginBottom: 16 }}` → `className="mb-4"`

### 4. 表单验证
HeroUI 没有内置的 Form 组件，需要手动实现验证逻辑或使用 react-hook-form。

---

## 🎉 完成后的好处

1. ✅ **React 19 兼容** - 消除警告
2. ✅ **统一 UI 风格** - 与项目其他部分一致
3. ✅ **更好的主题支持** - 完全响应 HeroUI 主题
4. ✅ **更小的包体积** - 移除 Ant Design 依赖
5. ✅ **更好的性能** - HeroUI 针对 React 19 优化
6. ✅ **更好的可访问性** - HeroUI 内置 ARIA 支持

---

## 📚 参考资源

- [HeroUI 文档](https://heroui.com)
- [HeroUI Table 示例](https://heroui.com/docs/components/table)
- [HeroUI Modal 示例](https://heroui.com/docs/components/modal)
- [Lucide React 图标](https://lucide.dev)
- [Sonner Toast](https://sonner.emilkowal.ski)

---

**预计迁移时间**: 2-3 小时  
**难度**: ⭐⭐⭐ (中等)  
**优先级**: 🔥 高 (解决 React 19 兼容性)
