# 助理数据调试指南

## 🔍 问题：审核通过的助理没有在市场显示

### 可能的原因

1. **localStorage 数据问题**
   - localStorage 中可能有旧数据
   - 数据格式不正确
   - 状态字段不正确

2. **状态过滤问题**
   - `publishedAssistants` 过滤逻辑
   - 助理状态不是 'published'

3. **React 状态更新问题**
   - Context 状态没有正确更新
   - 组件没有重新渲染

---

## 🛠️ 调试步骤

### 步骤 1: 检查 localStorage 数据

在浏览器控制台运行：

```javascript
// 查看 localStorage 中的助理数据
const data = localStorage.getItem('assistantList');
console.log('Raw data:', data);

// 解析并查看
const parsed = JSON.parse(data);
console.log('Parsed data:', parsed);

// 查看每个助理的状态
parsed.forEach(a => {
  console.log(`${a.title}: status=${a.status}`);
});

// 查看已发布的助理
const published = parsed.filter(a => a.status === 'published');
console.log('Published assistants:', published);
```

### 步骤 2: 清除 localStorage 并重新加载

如果数据有问题，清除并重新开始：

```javascript
// 清除助理数据
localStorage.removeItem('assistantList');

// 刷新页面
location.reload();
```

### 步骤 3: 手动添加测试数据

```javascript
// 创建一个测试助理
const testAssistant = {
  id: 'test-' + Date.now(),
  title: '测试助理',
  desc: '这是一个测试助理',
  emoji: '🧪',
  prompt: '你是一个测试助理',
  tags: ['测试'],
  isPublic: true,
  status: 'published',
  author: '测试',
  createdAt: new Date().toISOString(),
  publishedAt: new Date().toISOString()
};

// 获取现有数据
const existing = JSON.parse(localStorage.getItem('assistantList') || '[]');

// 添加测试助理
existing.push(testAssistant);

// 保存回 localStorage
localStorage.setItem('assistantList', JSON.stringify(existing));

// 刷新页面
location.reload();
```

### 步骤 4: 检查 Context 状态

在组件中添加调试输出：

```tsx
// 在 PureChat 组件中
useEffect(() => {
  console.log('assistantList:', assistantList);
  console.log('publishedAssistants:', publishedAssistants);
  console.log('publishedAssistants.length:', publishedAssistants.length);
}, [assistantList, publishedAssistants]);
```

---

## ✅ 修复方案

### 修复 1: 确保初始助理始终存在

已在 `AssistantContext.tsx` 中实现：

```tsx
// 合并初始助理和存储的助理，确保系统助理始终存在
const systemAssistantIds = initialAssistants.map(a => a.id);
const userAssistants = withDates.filter((a: Assistant) => !systemAssistantIds.includes(a.id));
const mergedList = [...initialAssistants, ...userAssistants];

setAssistantList(mergedList);
```

### 修复 2: 添加空状态提示

已在市场页面添加：

```tsx
{publishedAssistants.length === 0 && (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
    <div style={{ fontSize: 16, marginBottom: 8 }}>暂无已发布的助理</div>
    <div style={{ fontSize: 14 }}>
      创建助理后，通过审核即可在此显示
    </div>
    <div style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>
      当前助理总数: {assistantList.length} | 已发布: {publishedAssistants.length}
    </div>
  </div>
)}
```

---

## 🎯 测试流程

### 完整测试步骤

1. **清除旧数据**
   ```javascript
   localStorage.removeItem('assistantList');
   location.reload();
   ```

2. **验证初始助理**
   - 打开市场页面
   - 切换到 "Assistants" 标签
   - ✅ 应该看到 4 个系统助理：
     - 🚁 Tello智能代理
     - 🐢 海龟汤主持人
     - 🍿 美食评论员
     - 📘 学术写作助手

3. **创建新助理**
   - 点击"创建助理"
   - 填写信息并提交
   - ✅ 应该显示："助理创建成功并已提交审核！"

4. **审核助理**
   - 打开 `http://localhost:3000/admin/review`
   - 找到新创建的助理
   - 点击"通过"按钮
   - ✅ 应该显示："助理已通过审核并上架到商城！"

5. **验证市场显示**
   - 回到主页面
   - 切换到市场的 "Assistants" 标签
   - ✅ 应该看到新审核通过的助理

---

## 🐛 常见问题

### 问题 1: 市场页面是空的

**原因**: localStorage 中的数据覆盖了初始助理

**解决方案**:
```javascript
localStorage.removeItem('assistantList');
location.reload();
```

### 问题 2: 审核通过后助理没有显示

**检查点**:
1. 助理的 `status` 是否为 `'published'`
2. `publishedAssistants` 是否包含该助理
3. 是否在正确的标签页（Assistants）

**调试代码**:
```javascript
const data = JSON.parse(localStorage.getItem('assistantList'));
const assistant = data.find(a => a.title === '你的助理名称');
console.log('Assistant status:', assistant?.status);
```

### 问题 3: 数据不同步

**原因**: Context 状态没有正确更新

**解决方案**:
1. 确认使用了 `useAssistants()` Hook
2. 确认使用了 Context 提供的方法（`addAssistant`, `updateAssistantStatus` 等）
3. 不要直接修改 `assistantList`

---

## 📊 数据结构

### 正确的助理数据格式

```typescript
{
  id: string;                    // 唯一标识符
  title: string;                 // 助理名称
  desc: string;                  // 助理描述
  emoji: string;                 // 助理图标
  prompt: string;                // 系统提示词
  tags?: string[];               // 标签数组
  isPublic: boolean;             // 是否公开
  status: 'draft' | 'pending' | 'published' | 'rejected';  // 状态
  author: string;                // 创建者
  createdAt: Date;               // 创建时间
  updatedAt?: Date;              // 更新时间
  reviewedAt?: Date;             // 审核时间
  publishedAt?: Date;            // 发布时间
}
```

### 状态说明

- `draft`: 草稿（未提交审核）
- `pending`: 待审核（已提交，等待管理员审核）
- `published`: 已发布（审核通过，在市场显示）
- `rejected`: 已拒绝（审核未通过）

---

## 🔧 快速修复命令

### 重置所有数据

```javascript
// 清除 localStorage
localStorage.clear();

// 刷新页面
location.reload();
```

### 查看当前状态

```javascript
// 查看所有助理
const all = JSON.parse(localStorage.getItem('assistantList') || '[]');
console.table(all.map(a => ({
  title: a.title,
  status: a.status,
  author: a.author
})));

// 查看已发布的助理
const published = all.filter(a => a.status === 'published');
console.log('Published count:', published.length);
console.table(published.map(a => ({ title: a.title, emoji: a.emoji })));
```

### 强制发布一个助理

```javascript
// 获取数据
const data = JSON.parse(localStorage.getItem('assistantList') || '[]');

// 找到要发布的助理（替换为你的助理名称）
const assistantName = '测试助理';
const index = data.findIndex(a => a.title === assistantName);

if (index !== -1) {
  // 更新状态
  data[index].status = 'published';
  data[index].publishedAt = new Date().toISOString();
  data[index].reviewedAt = new Date().toISOString();
  
  // 保存
  localStorage.setItem('assistantList', JSON.stringify(data));
  
  console.log('✅ 助理已发布');
  location.reload();
} else {
  console.log('❌ 未找到助理');
}
```

---

**最后更新**: 2025-10-20  
**状态**: 已修复 - 确保初始助理始终存在
