# 工具提示快速参考指南

## 快速开始

### 添加基本工具提示

```tsx
import { Tooltip } from '@heroui/react';

<Tooltip content="这是一个简单的工具提示">
  <button>悬停我</button>
</Tooltip>
```

### 添加详细工具提示

```tsx
<Tooltip
  content={
    <div style={{ padding: '4px 8px' }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
        标题
      </div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        详细描述内容
      </div>
      <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
        额外提示信息
      </div>
    </div>
  }
  placement="top"
  delay={500}
  closeDelay={0}
  classNames={{
    base: 'max-w-xs',
    content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
  }}
>
  <button>悬停我</button>
</Tooltip>
```

## 标准配置

### 延迟时间
- **标准**: 500ms - 用于大多数按钮和控件
- **快速**: 300ms - 用于错误和警告
- **慢速**: 800ms - 用于装饰性元素

### 位置选项
- `top` - 上方（默认）
- `bottom` - 下方
- `left` - 左侧
- `right` - 右侧

### 样式类名
```tsx
classNames={{
  base: 'max-w-xs',  // 最大宽度
  content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
}}
```

## 常见模式

### 1. 按钮工具提示
```tsx
<Tooltip
  content={
    <div style={{ padding: '4px 8px' }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
        按钮名称
      </div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        按钮功能说明
      </div>
      <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
        快捷键: Ctrl+S
      </div>
    </div>
  }
  placement="bottom"
  delay={500}
>
  <button>保存</button>
</Tooltip>
```

### 2. 参数工具提示
```tsx
<Tooltip
  content={
    <div style={{ padding: '4px 8px', maxWidth: '300px' }}>
      <div style={{ fontWeight: 600, marginBottom: '6px' }}>
        {parameter.label}
        {parameter.required && <span style={{ color: '#EF4444' }}>*</span>}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>
        {parameter.description}
      </div>
      <div style={{ fontSize: '11px', opacity: 0.7, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
        类型: {parameter.type}
      </div>
    </div>
  }
  placement="top"
  delay={500}
>
  <div>{/* 参数内容 */}</div>
</Tooltip>
```

### 3. 错误工具提示
```tsx
<Tooltip
  content={
    <div style={{ padding: '4px 8px' }}>
      <div style={{ fontWeight: 600, marginBottom: '4px', color: '#EF4444' }}>
        错误
      </div>
      <div style={{ fontSize: '12px', opacity: 0.9 }}>
        {errorMessage}
      </div>
      <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
        解决方法提示
      </div>
    </div>
  }
  placement="top"
  delay={300}
  classNames={{
    content: 'bg-red-900 dark:bg-red-100 text-white dark:text-red-900 px-3 py-2 rounded-lg shadow-lg'
  }}
>
  <AlertCircle />
</Tooltip>
```

### 4. 图标工具提示
```tsx
<Tooltip
  content="简短说明"
  placement="top"
  delay={500}
>
  <HelpCircle size={16} />
</Tooltip>
```

## 帮助面板集成

### 添加到页面
```tsx
import WorkflowHelp from '@/components/workflow/WorkflowHelp';

function MyPage() {
  return (
    <div>
      {/* 页面内容 */}
      
      {/* 帮助按钮 */}
      <WorkflowHelp position="bottom-right" />
    </div>
  );
}
```

### 自定义位置
```tsx
<WorkflowHelp position="top-left" />     // 左上角
<WorkflowHelp position="top-right" />    // 右上角
<WorkflowHelp position="bottom-left" />  // 左下角
<WorkflowHelp position="bottom-right" /> // 右下角（默认）
```

### 默认打开
```tsx
<WorkflowHelp defaultOpen={true} />
```

## 可访问性

### ARIA标签
```tsx
<Tooltip content="保存文件">
  <button aria-label="保存文件">
    <Save />
  </button>
</Tooltip>
```

### 键盘导航
确保工具提示触发元素可以通过Tab键访问：
```tsx
<Tooltip content="提示">
  <button tabIndex={0}>
    按钮
  </button>
</Tooltip>
```

## 性能提示

### 1. 条件渲染
只在需要时添加工具提示：
```tsx
{description && (
  <Tooltip content={description}>
    <div>{content}</div>
  </Tooltip>
)}
```

### 2. 避免嵌套
不要在工具提示内嵌套其他工具提示

### 3. 使用适当的延迟
避免工具提示过快显示干扰用户

## 主题适配

工具提示会自动适配浅色/深色主题：
```tsx
classNames={{
  content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
}}
```

## 调试技巧

### 1. 检查工具提示是否显示
```tsx
<Tooltip content="测试" delay={0}>  {/* 设置delay=0立即显示 */}
  <button>测试</button>
</Tooltip>
```

### 2. 检查内容
在浏览器开发工具中查找`.tooltip-content`类

### 3. 检查位置
如果工具提示位置不对，尝试不同的`placement`值

## 常见问题

### Q: 工具提示不显示？
A: 检查：
1. 是否正确导入Tooltip组件
2. 触发元素是否可交互
3. delay设置是否过长

### Q: 工具提示被遮挡？
A: 调整`placement`或增加`zIndex`

### Q: 工具提示样式不对？
A: 检查`classNames`配置和CSS变量

### Q: 工具提示闪烁？
A: 增加`delay`和`closeDelay`的差值

## 示例集合

查看完整示例：
- `components/workflow/NodeHeader.tsx` - 按钮工具提示
- `components/workflow/ParameterItem.tsx` - 参数工具提示
- `components/workflow/ResizeHandle.tsx` - 图标工具提示
- `components/workflow/WorkflowHelp.tsx` - 帮助面板

## 相关文档

- [完整文档](./WORKFLOW_TOOLTIPS_AND_HELP.md)
- [HeroUI Tooltip API](https://heroui.com/docs/components/tooltip)
- [可访问性指南](./WORKFLOW_ACCESSIBILITY_GUIDE.md)
