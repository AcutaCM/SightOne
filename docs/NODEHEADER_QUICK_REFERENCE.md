# NodeHeader组件 - 快速参考

## 导入
```tsx
import NodeHeader from '@/components/workflow/NodeHeader';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';
```

## Props接口
```typescript
interface NodeHeaderProps {
  icon: LucideIcon;           // 节点图标组件
  label: string;              // 节点标题
  color: string;              // 节点颜色（已废弃，保留兼容性）
  isCollapsed: boolean;       // 是否折叠
  onToggleCollapse: () => void;  // 折叠切换回调
  onOpenAdvanced: () => void;    // 打开高级设置回调
  parameterCount: number;     // 参数数量
  hasErrors: boolean;         // 是否有错误
}
```

## 基础用法
```tsx
import { Plane } from 'lucide-react';

<NodeHeader
  icon={Plane}
  label="起飞"
  color="#64FFDA"
  isCollapsed={false}
  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
  onOpenAdvanced={() => setShowModal(true)}
  parameterCount={3}
  hasErrors={false}
/>
```

## 主题颜色

### 浅色主题
| 元素 | 颜色 | 用途 |
|------|------|------|
| 头部背景 | `#FAFAFA` | 极浅灰背景 |
| 主要文本 | `#1A1A1A` | 标题、徽章文字 |
| 次要文本 | `#666666` | 按钮图标 |
| 边框 | `#E5E5E5` | 分隔线、徽章边框 |
| 错误 | `#DC2626` | 错误指示器 |

### 深色主题
| 元素 | 颜色 | 用途 |
|------|------|------|
| 头部背景 | `#222222` | 深灰背景 |
| 主要文本 | `#E5E5E5` | 标题、徽章文字 |
| 次要文本 | `#999999` | 按钮图标 |
| 边框 | `#333333` | 分隔线、徽章边框 |
| 错误 | `#EF4444` | 错误指示器 |

## 状态示例

### 展开状态
```tsx
<NodeHeader
  icon={Camera}
  label="拍照"
  isCollapsed={false}  // 展开
  parameterCount={5}   // 不显示徽章
  hasErrors={false}
  {...otherProps}
/>
```

### 折叠状态
```tsx
<NodeHeader
  icon={Camera}
  label="拍照"
  isCollapsed={true}   // 折叠
  parameterCount={5}   // 显示徽章 [5]
  hasErrors={false}
  {...otherProps}
/>
```

### 错误状态
```tsx
<NodeHeader
  icon={Navigation}
  label="导航"
  isCollapsed={false}
  parameterCount={2}
  hasErrors={true}     // 显示红色脉冲图标
  {...otherProps}
/>
```

## 动画效果

### 图标悬停
- 放大: `scale(1.1)`
- 旋转: `rotate(5deg)`
- 时长: `200ms`

### 按钮交互
- 悬停: `scale(1.05)` + 背景色变化
- 点击: `scale(0.95)`
- 时长: `150-200ms`

### 徽章动画
- 出现: Spring动画 (stiffness: 500)
- 消失: Spring动画
- 类型: `scale` + `opacity`

### 错误指示器
- 脉冲动画: 2秒循环
- 效果: `opacity` + `scale`

## 自定义主题

### 使用主题Hook
```tsx
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

function MyComponent() {
  const theme = useWorkflowTheme();
  
  return (
    <div style={{ 
      background: theme.node.headerBg,
      color: theme.text.primary 
    }}>
      {/* 内容 */}
    </div>
  );
}
```

### 主题对象结构
```typescript
const theme = {
  node: {
    bg: string;
    border: string;
    borderHover: string;
    selected: string;
    selectedGlow: string;
    divider: string;
    headerBg: string;
  },
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  },
  parameter: {
    bg: string;
    bgHover: string;
    // ...
  },
  status: {
    error: string;
    success: string;
    warning: string;
    info: string;
  }
}
```

## 常见问题

### Q: 如何改变图标颜色？
A: 图标颜色自动使用主题的 `text.primary`，会根据浅色/深色主题自动调整。

### Q: 徽章什么时候显示？
A: 仅在 `isCollapsed={true}` 且 `parameterCount > 0` 时显示。

### Q: 如何自定义按钮样式？
A: 按钮样式由主题系统控制，建议通过修改主题变量来自定义。

### Q: 错误指示器如何触发？
A: 设置 `hasErrors={true}` 即可显示红色脉冲图标。

### Q: 支持哪些图标？
A: 支持所有 `lucide-react` 图标库中的图标。

## 性能提示

1. **避免频繁切换状态**
   ```tsx
   // ❌ 不好
   <NodeHeader isCollapsed={Math.random() > 0.5} />
   
   // ✅ 好
   const [collapsed, setCollapsed] = useState(false);
   <NodeHeader isCollapsed={collapsed} />
   ```

2. **使用稳定的回调**
   ```tsx
   // ❌ 不好
   <NodeHeader onToggleCollapse={() => setCollapsed(!collapsed)} />
   
   // ✅ 好
   const handleToggle = useCallback(() => {
     setCollapsed(prev => !prev);
   }, []);
   <NodeHeader onToggleCollapse={handleToggle} />
   ```

3. **避免内联样式对象**
   ```tsx
   // ❌ 不好
   <div style={{ color: theme.text.primary }}>
   
   // ✅ 好
   const textStyle = useMemo(() => ({ 
     color: theme.text.primary 
   }), [theme]);
   <div style={textStyle}>
   ```

## 调试技巧

### 检查主题值
```tsx
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

function DebugTheme() {
  const theme = useWorkflowTheme();
  console.log('Current theme:', theme);
  return null;
}
```

### 验证图标
```tsx
// 确保图标是有效的组件
if (!Icon || typeof Icon !== 'function') {
  console.error('Invalid icon:', Icon);
}
```

## 相关文档
- [完整实现文档](./TASK_2_NODEHEADER_REDESIGN_COMPLETE.md)
- [视觉设计指南](./NODEHEADER_REDESIGN_VISUAL_GUIDE.md)
- [主题系统文档](../lib/workflow/workflowTheme.ts)

---
**最后更新**: 2025年10月22日  
**版本**: 1.0.0
