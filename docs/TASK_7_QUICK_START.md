# Task 7: 添加样式和动画 - 快速开始

## 🚀 5分钟快速上手

### 1. 导入 CSS 模块

```typescript
import styles from '@/styles/AssistantActivation.module.css';
```

### 2. 使用高亮动画

```tsx
// 新添加的助手自动高亮 3 秒
<div className={isNew ? styles.highlighted : ''}>
  {/* 助手卡片内容 */}
</div>
```

### 3. 使用激活按钮

```tsx
<button 
  className={`
    ${styles['activation-button']}
    ${isAdded && styles['activation-button-added']}
    ${isLoading && styles['activation-button-loading']}
  `}
>
  {isAdded ? '已添加' : '使用该助手进行聊天'}
</button>
```

### 4. 使用淡入动画

```tsx
<div className={styles['user-assistant-card-new']}>
  {/* 新助手内容 */}
</div>
```

---

## 📦 可用的 CSS 类

| 类名 | 用途 | 效果 |
|-----|------|------|
| `.highlighted` | 高亮新助手 | 脉冲发光 × 3 |
| `.activation-button` | 激活按钮 | 涟漪效果 |
| `.activation-button-added` | 已添加状态 | 绿色背景 |
| `.activation-button-loading` | 加载状态 | 禁用 + 旋转图标 |
| `.activation-button-success` | 成功状态 | 弹跳动画 |
| `.activation-button-error` | 错误状态 | 抖动动画 |
| `.user-assistant-card` | 助手卡片 | 悬停提升 |
| `.user-assistant-card-new` | 新助手卡片 | 淡入滑动 |

---

## 🎬 动画时长

- 高亮脉冲: **1s × 3次 = 3s**
- 涟漪效果: **0.6s**
- 悬停提升: **0.2s**
- 淡入滑动: **0.4s**
- 成功弹跳: **0.3s**
- 错误抖动: **0.3s**

---

## 💡 常见用法

### 场景 1: 添加新助手

```tsx
const [isNew, setIsNew] = useState(true);

useEffect(() => {
  if (isNew) {
    const timer = setTimeout(() => setIsNew(false), 3000);
    return () => clearTimeout(timer);
  }
}, [isNew]);

return (
  <div className={isNew ? styles.highlighted : ''}>
    <AssistantCard assistant={assistant} />
  </div>
);
```

### 场景 2: 按钮状态管理

```tsx
const [status, setStatus] = useState<'idle' | 'loading' | 'added'>('idle');

const buttonClass = [
  styles['activation-button'],
  status === 'added' && styles['activation-button-added'],
  status === 'loading' && styles['activation-button-loading']
].filter(Boolean).join(' ');

return <button className={buttonClass}>...</button>;
```

### 场景 3: 列表动画

```tsx
{assistants.map((assistant, index) => (
  <div 
    key={assistant.id}
    className={`
      ${styles['user-assistant-card']}
      ${index === 0 ? styles['user-assistant-card-new'] : ''}
    `}
  >
    <AssistantCard assistant={assistant} />
  </div>
))}
```

---

## ⚡ 性能提示

1. **GPU 加速**: 所有动画自动使用 GPU 加速
2. **减少动画**: 自动支持系统"减少动画"设置
3. **响应式**: 移动端自动优化动画效果

---

## 🐛 故障排除

### 问题: 动画不显示

**解决方案**:
```tsx
// ✅ 正确 - 使用 CSS 模块
import styles from '@/styles/AssistantActivation.module.css';
<div className={styles.highlighted}>

// ❌ 错误 - 直接使用类名
<div className="highlighted">
```

### 问题: 动画卡顿

**解决方案**:
- 检查是否有大量 DOM 元素
- 使用 Chrome DevTools Performance 面板分析
- 确保 GPU 加速已启用

### 问题: 暗色模式下动画不明显

**解决方案**:
- 暗色模式有独立的动画定义
- 检查 `.dark` 选择器是否正确应用

---

## 📚 更多资源

- [完整实现报告](./TASK_7_STYLES_AND_ANIMATIONS_COMPLETE.md)
- [快速参考指南](./ASSISTANT_ACTIVATION_ANIMATIONS_QUICK_REFERENCE.md)
- [视觉指南](./ASSISTANT_ACTIVATION_ANIMATIONS_VISUAL_GUIDE.md)
- [实现总结](./TASK_7_IMPLEMENTATION_SUMMARY.md)

---

## ✅ 检查清单

在使用动画前，确保：

- [ ] 已导入 CSS 模块
- [ ] 正确使用 CSS 类名
- [ ] 测试了暗色模式
- [ ] 测试了移动端显示
- [ ] 验证了动画性能

---

**快速开始完成！** 🎉

现在你可以在项目中使用这些动画效果了。如有问题，请查看详细文档。
