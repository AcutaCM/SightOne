# 全局阴影样式统一更新

## 更新日期
2024年

## 更新内容
为所有全局可拖动组件和面板组件统一应用了标准阴影样式。

## 阴影参数
```css
box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.1);
```

Tailwind CSS 类名:
```
shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]
```

## 已更新的组件列表

### Panel 组件
- ✅ `components/ToolsPanel.tsx` - 工具面板
- ✅ `components/MemoryPanel.tsx` - 记忆管理面板
- ✅ `components/SimulationPanel.tsx` - 模拟面板
- ✅ `components/SystemLogPanel.tsx` - 系统日志面板
- ✅ `components/StatusInfoPanel.tsx` - 状态信息面板
- ✅ `components/ReportPanel.tsx` - 报告面板
- ✅ `components/QRScanPanel.tsx` - 二维码扫描面板
- ✅ `components/MissionPadPanel.tsx` - 任务垫面板
- ✅ `components/VirtualPositionView.tsx` - 虚拟位置视图
- ✅ `components/WorkflowPanel.tsx` - 工作流面板

### 导航和菜单组件
- ✅ `components/TopNavbar.tsx` - 顶部导航栏
- ✅ `components/ui/message-dock.tsx` - 消息 Dock 栏

### 其他组件
- ⏭️ `components/HelpPanel.tsx` - 帮助面板 (已有自定义样式)
- ⏭️ `components/ManualControlPanel.tsx` - 手动控制面板 (无需更新)
- ⏭️ `components/TelloWorkflowPanel.tsx` - Tello 工作流面板 (无需更新)
- ⏭️ `components/UserMenu.tsx` - 用户菜单 (无需更新)
- ⏭️ `components/SettingsModal.tsx` - 设置模态框 (无需更新)
- ⏭️ `components/base/BaseModal.tsx` - 基础模态框 (无需更新)
- ⏭️ `components/base/BasePanel.tsx` - 基础面板 (无需更新)

## 更新方法

### 自动化脚本
使用了自动化脚本 `scripts/apply-global-shadow.js` 来批量更新组件。

脚本功能：
1. 自动识别 Card 组件并添加阴影类
2. 识别带 border 和 rounded 的 div 容器
3. 识别带特定 style 的 Panel 容器
4. 避免重复添加阴影

### 手动更新方法
如果需要手动为新组件添加阴影，请在组件的最外层容器的 `className` 中添加：

```tsx
<Card className="... shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]">
  {/* 内容 */}
</Card>
```

或者对于 div 容器：

```tsx
<div className="... shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]">
  {/* 内容 */}
</div>
```

## 视觉效果
- 阴影颜色：黑色，透明度 10%
- 阴影偏移：垂直向下 10px
- 阴影模糊：50px
- 阴影扩散：0px

这个阴影参数提供了：
- 柔和的视觉层次感
- 适度的深度效果
- 不会过于突兀的阴影
- 适合浅色和深色主题

## 注意事项
1. 某些组件（如 HelpPanel）有自定义的视觉效果，不需要应用标准阴影
2. 模态框组件通常由 UI 库自带阴影，无需额外添加
3. 内嵌组件（非顶层容器）不应添加此阴影
4. 保持阴影参数的一致性，避免使用其他阴影值

## 后续维护
- 新增的 Panel 组件应该应用相同的阴影样式
- 可以重新运行 `scripts/apply-global-shadow.js` 来更新新组件
- 如果需要调整阴影参数，应该全局统一修改

## 相关文件
- 更新脚本：`scripts/apply-global-shadow.js`
- 设计规范：参考 UI 设计系统文档
