# 组件选择器测试指南

## ✅ 修复完成

Tello 工作流面板的组件选择器集成已完成并可以正常使用。

## 🚀 快速测试

### 1. 启动应用

```bash
cd drone-analyzer-nextjs
npm run dev
```

### 2. 打开浏览器

访问: `http://localhost:3000`

### 3. 查找组件选择器按钮

在页面右下角应该看到一个**蓝色的圆形 "+" 按钮**

### 4. 打开组件选择器

点击右下角的 "+" 按钮,应该会弹出组件选择器弹窗

### 5. 选择工作流面板

1. 在组件选择器中,点击**"控制"**分类
2. 找到**"Tello工作流面板"**选项
3. 点击选择

### 6. 验证功能

- ✅ 工作流面板应该出现在页面中央
- ✅ 面板应该可以拖拽移动
- ✅ 再次点击可以隐藏面板
- ✅ 刷新页面后位置保持

## 🎯 预期结果

### 组件选择器
- 弹窗正常显示
- 主题跟随系统(亮色/暗色)
- 分类筛选正常工作
- 选中状态实时更新

### 工作流面板
- 默认位置: 中央偏左 (x:300, y:150)
- 默认大小: 900x600
- 可拖拽移动
- 位置自动保存到 localStorage

## 🐛 如果遇到问题

### 问题1: 看不到 "+" 按钮
**解决方案:** 检查浏览器控制台是否有错误,确保应用正常编译

### 问题2: 点击按钮没反应
**解决方案:** 
1. 打开浏览器开发者工具
2. 检查 Console 是否有错误
3. 确认 `LayoutProvider` 正确包裹了组件

### 问题3: 选择组件后没有显示
**解决方案:**
1. 检查 `LayoutContext.tsx` 中是否配置了该组件
2. 确认组件ID匹配: `'tello-workflow-panel'`

## 📝 技术细节

### 组件层级结构
```
Home (不使用 useLayout)
  └─ DroneProvider
      └─ LayoutProvider
          └─ DropZonesProvider
              └─ MainContent (使用 useLayout)
                  ├─ ComponentSelector
                  ├─ 打开按钮
                  └─ 各种可见组件
```

### 数据流
```
用户点击 "+" 按钮
  ↓
setShowComponentSelector(true)
  ↓
ComponentSelector 显示
  ↓
用户选择组件
  ↓
handleSelectComponent(componentId)
  ↓
toggleComponentVisibility(componentId)
  ↓
更新 visibleComponents
  ↓
保存到 localStorage
  ↓
组件显示/隐藏
```

## ✨ 额外功能

### 支持的组件
- Tello工作流面板
- Tello控制面板
- Tello智能代理
- 视频流面板
- 连接控制面板
- 任务面板
- 检测控制面板
- 帮助面板
- ...以及更多

### 快捷操作
- 点击组件选择器中的组件 → 切换显示/隐藏
- 拖拽面板 → 自动保存位置
- 刷新页面 → 恢复上次的布局

---

**测试完成时间:** 2025-10-22  
**状态:** ✅ 可以开始测试
