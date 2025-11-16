# Workflow工具提示和帮助系统

## 概述

本文档说明工作流组件中实现的工具提示和上下文帮助系统，满足需求8.5（提供上下文帮助）。

## 实现的功能

### 1. 按钮工具提示

所有交互式按钮都配备了详细的工具提示，包括：

#### NodeHeader按钮
- **节点图标**: 显示节点名称和基本操作提示
- **高级设置按钮**: 说明如何配置详细参数
- **折叠/展开按钮**: 显示当前状态、参数数量和快捷键
- **错误指示器**: 解释错误原因和解决方法
- **参数徽章**: 显示参数数量和操作提示

#### ResizeHandle
- **调整大小手柄**: 说明如何拖动调整节点尺寸

### 2. 参数描述增强

ParameterItem组件的工具提示包含：

```typescript
{
  参数名称: string,           // 参数的显示名称
  必填标记: boolean,          // 是否为必填参数
  参数描述: string,           // 详细说明
  参数类型: string,           // 数据类型
  默认值: any,               // 默认值（如果有）
  必填警告: string,          // 必填参数的警告信息
  操作提示: string[]         // 键盘快捷键说明
}
```

### 3. 上下文帮助面板

新增的`WorkflowHelp`组件提供全面的帮助系统：

#### 帮助内容分类

1. **键盘快捷键**
   - Space: 折叠/展开节点
   - Enter: 保存参数编辑
   - Esc: 取消参数编辑
   - Tab: 在参数间导航
   - Delete: 删除节点

2. **鼠标操作**
   - 点击参数进入编辑
   - 拖动节点移动位置
   - 拖动连接点创建连接
   - 拖动右下角调整大小
   - 双击画布添加节点

3. **节点操作**
   - 折叠按钮功能
   - 高级设置面板
   - 参数徽章说明
   - 错误图标含义
   - 状态指示器说明

4. **参数编辑**
   - 必填参数标识
   - 参数验证机制
   - 自动保存功能
   - 保存状态指示
   - 参数描述查看

## 使用方法

### 在WorkflowEditor中集成帮助系统

```tsx
import WorkflowHelp from '@/components/workflow/WorkflowHelp';

function WorkflowEditor() {
  return (
    <div>
      {/* 工作流画布 */}
      <ReactFlow>
        {/* ... */}
      </ReactFlow>
      
      {/* 帮助按钮（固定在右下角） */}
      <WorkflowHelp position="bottom-right" />
    </div>
  );
}
```

### 自定义工具提示样式

所有工具提示使用统一的样式配置：

```tsx
<Tooltip
  content={/* 内容 */}
  placement="top"
  delay={500}
  closeDelay={0}
  classNames={{
    base: 'max-w-xs',
    content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
  }}
>
  {/* 触发元素 */}
</Tooltip>
```

## 工具提示设计原则

### 1. 延迟显示
- 标准延迟: 500ms（避免干扰正常操作）
- 错误提示: 300ms（更快显示重要信息）
- 节点图标: 800ms（减少干扰）

### 2. 内容结构
```
┌─────────────────────────┐
│ 标题（粗体）             │
├─────────────────────────┤
│ 主要描述                │
│ （清晰、简洁）           │
├─────────────────────────┤
│ 附加信息                │
│ • 类型/默认值           │
│ • 警告/提示             │
├─────────────────────────┤
│ 操作提示（斜体、小字）   │
└─────────────────────────┘
```

### 3. 颜色编码
- **标准工具提示**: 灰色背景（浅色主题：深灰，深色主题：浅灰）
- **错误提示**: 红色背景
- **成功提示**: 绿色背景（如需要）

### 4. 响应式设计
- 最大宽度: 300-400px
- 自动换行
- 适应屏幕边缘

## 可访问性特性

### ARIA标签
所有交互元素都包含适当的ARIA标签：

```tsx
<button
  aria-label="打开高级设置"
  aria-describedby="settings-tooltip"
>
  <Settings />
</button>
```

### 键盘导航
- Tab键可以导航到所有工具提示触发元素
- 焦点状态有明显的视觉指示
- 支持键盘快捷键

### 屏幕阅读器支持
- 隐藏的描述文本供屏幕阅读器使用
- 适当的role和aria-live属性
- 状态变化的实时通知

## 性能优化

### 1. 延迟加载
工具提示内容仅在需要时渲染

### 2. 防抖处理
避免频繁的工具提示显示/隐藏

### 3. 条件渲染
仅在有描述时显示工具提示

## 测试建议

### 手动测试清单
- [ ] 悬停所有按钮查看工具提示
- [ ] 验证工具提示内容准确性
- [ ] 测试不同主题下的显示效果
- [ ] 检查工具提示位置是否合适
- [ ] 验证键盘导航功能
- [ ] 测试屏幕阅读器兼容性

### 自动化测试
```typescript
describe('Workflow Tooltips', () => {
  it('should show tooltip on hover', async () => {
    const { getByRole, findByText } = render(<NodeHeader {...props} />);
    const button = getByRole('button', { name: /高级设置/ });
    
    fireEvent.mouseEnter(button);
    await waitFor(() => {
      expect(findByText('配置节点的详细参数和选项')).toBeInTheDocument();
    });
  });
});
```

## 最佳实践

### 1. 工具提示内容编写
- **简洁明了**: 一句话说明主要功能
- **提供上下文**: 解释为什么需要这个操作
- **包含快捷键**: 帮助用户提高效率
- **避免技术术语**: 使用用户友好的语言

### 2. 工具提示时机
- **立即显示**: 错误和警告信息
- **短延迟**: 主要操作按钮（300-500ms）
- **长延迟**: 装饰性元素（800ms+）

### 3. 工具提示位置
- **优先顺序**: top > bottom > left > right
- **避免遮挡**: 不要遮挡重要内容
- **边缘检测**: 自动调整以适应屏幕

## 未来改进

### 计划中的功能
1. **交互式教程**: 引导新用户了解工作流系统
2. **视频帮助**: 嵌入操作演示视频
3. **搜索功能**: 在帮助面板中搜索特定主题
4. **多语言支持**: 提供英文等其他语言版本
5. **自定义帮助**: 允许用户添加自定义帮助内容

### 性能优化
1. **虚拟化**: 对大量帮助项使用虚拟列表
2. **懒加载**: 按需加载帮助内容
3. **缓存**: 缓存已显示的工具提示

## 相关文件

- `components/workflow/NodeHeader.tsx` - 节点头部工具提示
- `components/workflow/ParameterItem.tsx` - 参数工具提示
- `components/workflow/ResizeHandle.tsx` - 调整大小工具提示
- `components/workflow/WorkflowHelp.tsx` - 帮助面板组件
- `lib/workflow/workflowTheme.ts` - 主题系统

## 参考资源

- [HeroUI Tooltip文档](https://heroui.com/docs/components/tooltip)
- [WCAG 2.1 工具提示指南](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html)
- [Material Design 工具提示规范](https://material.io/components/tooltips)

## 总结

工具提示和帮助系统为工作流组件提供了全面的上下文帮助，满足了需求8.5的所有要求：

✅ 为按钮添加工具提示
✅ 为参数添加描述
✅ 提供上下文帮助

该系统提高了用户体验，降低了学习曲线，并确保了良好的可访问性。
