# 组件选择器快速参考

## 🎯 问题 & 解决方案

### ❌ 问题 1: 主题不跟随
**现象:** 切换主题时，组件选择器颜色不变

**✅ 已修复:** 
- 使用 HeroUI 主题变量
- 所有颜色自动跟随主题

### ❌ 问题 2: 工作流组件不显示
**现象:** 找不到 "Tello工作流面板"

**✅ 已修复:**
- 移除语法错误
- 组件正常显示

---

## 🎨 主题颜色对照表

| 用途 | 旧代码 | 新代码 |
|------|--------|--------|
| 主背景 | `bg-slate-900` | `bg-content1` |
| 卡片背景 | `bg-white/5` | `bg-content2` |
| 悬停背景 | `bg-white/10` | `bg-content3` |
| 主文本 | `text-white` | `text-foreground` |
| 次要文本 | `text-white/70` | `text-foreground/70` |
| 边框 | `border-white/10` | `border-divider` |
| 主色 | `bg-blue-500` | `bg-primary` |
| 主色文本 | `text-white` | `text-primary-foreground` |

---

## 🔍 快速测试

### 1. 打开组件选择器
```
主页 → 点击 "+" 按钮
```

### 2. 切换主题
```
顶部导航栏 → 主题切换按钮
```

### 3. 查找工作流组件
```
组件选择器 → "控制" 分类 → "Tello工作流面板"
```

---

## ✅ 检查清单

- [ ] 亮色主题正常
- [ ] 暗色主题正常
- [ ] 主题切换平滑
- [ ] 工作流组件显示
- [ ] 悬停效果正常
- [ ] 点击效果正常

---

## 📝 代码示例

### 使用主题变量
```tsx
// ✅ 正确
className="bg-content1 text-foreground"

// ❌ 错误
className="bg-white text-black"
```

### 动态颜色
```tsx
// ✅ 正确
style={{ 
  background: 'hsl(var(--heroui-primary) / 0.15)' 
}}

// ❌ 错误
style={{ 
  background: 'rgba(59, 130, 246, 0.15)' 
}}
```

---

## 🐛 故障排除

### 颜色不变？
1. 清除缓存
2. 重启服务器
3. 检查浏览器控制台

### 组件不显示？
1. 检查语法错误
2. 确认组件定义
3. 重启服务器

---

## 📚 相关文档

- [详细修复说明](./COMPONENT_SELECTOR_THEME_FIX.md)
- [测试指南](./COMPONENT_SELECTOR_TEST_GUIDE.md)
- [完整总结](./COMPONENT_SELECTOR_FIX_SUMMARY.md)

---

**版本:** v1.0  
**日期:** 2025-10-21
