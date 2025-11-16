# AnimatedEdge 快速参考

## 基本用法

```typescript
import AnimatedEdge from '@/components/workflow/AnimatedEdge';

// 默认边
<AnimatedEdge
  id="edge-1"
  sourceX={100}
  sourceY={100}
  targetX={300}
  targetY={200}
  sourcePosition={Position.Right}
  targetPosition={Position.Left}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | 必需 | 边的唯一标识符 |
| sourceX | number | 必需 | 起点X坐标 |
| sourceY | number | 必需 | 起点Y坐标 |
| targetX | number | 必需 | 终点X坐标 |
| targetY | number | 必需 | 终点Y坐标 |
| sourcePosition | Position | 必需 | 起点位置 |
| targetPosition | Position | 必需 | 终点位置 |
| selected | boolean | false | 是否选中 |
| data.isActive | boolean | false | 是否活动（显示流动粒子） |
| data.isConditional | boolean | false | 是否条件边（虚线） |
| data.label | string | undefined | 边的标签文本 |
| style | CSSProperties | {} | 自定义样式 |
| markerEnd | string | undefined | 箭头标记 |

## 状态样式

### 默认状态
- 颜色: 主题边框色
- 宽度: 2px
- 样式: 实线

### 选中状态
- 颜色: 主题选中色（黑/白）
- 宽度: 3px
- 样式: 实线

### 活动状态
- 颜色: 主题警告色（灰色）
- 宽度: 2.5px
- 样式: 实线 + 流动粒子

### 条件状态
- 颜色: 主题次要文本色
- 宽度: 2px
- 样式: 虚线 (5px 5px)

### 悬停状态
- 不透明度: 增加到100%
- 宽度: 增加0.5px
- 效果: 添加模糊光晕

## 使用场景

### 1. 普通连接
```typescript
<AnimatedEdge
  id="normal-edge"
  // ... 坐标props
/>
```

### 2. 执行中的连接
```typescript
<AnimatedEdge
  id="active-edge"
  data={{ isActive: true }}
  // ... 坐标props
/>
```

### 3. 条件分支
```typescript
<AnimatedEdge
  id="conditional-edge"
  data={{ 
    isConditional: true,
    label: "条件: x > 0"
  }}
  // ... 坐标props
/>
```

### 4. 选中的连接
```typescript
<AnimatedEdge
  id="selected-edge"
  selected={true}
  // ... 坐标props
/>
```

## 主题颜色

### 浅色主题
- 默认: #E5E5E5 (浅灰)
- 选中: #000000 (黑色)
- 活动: #666666 (中灰)
- 条件: #666666 (中灰)

### 深色主题
- 默认: #333333 (深灰)
- 选中: #FFFFFF (白色)
- 活动: #999999 (浅灰)
- 条件: #999999 (浅灰)

## 动画效果

### 初始动画
- 路径绘制: 0.5秒
- 淡入: 0.3秒

### 流动粒子（活动状态）
- 数量: 3个
- 速度: 1.5秒/周期
- 延迟: 0s, 0.5s, 1s

### 悬停动画
- 宽度变化: 0.2秒
- 不透明度: 0.2秒
- 光晕淡入: 0.2秒

### 标签动画
- 出现: 0.3秒延迟
- 悬停缩放: 1.05倍

## 性能优化

### GPU加速
```typescript
style={{
  willChange: 'offset-distance, opacity',
  transform: 'translateZ(0)',
}}
```

### 条件渲染
- 仅在活动时渲染粒子
- 仅在悬停时渲染光晕
- 仅在有标签时渲染标签

## 常见问题

### Q: 如何自定义边的颜色？
A: 使用style prop覆盖：
```typescript
<AnimatedEdge
  style={{ stroke: '#custom-color' }}
  // ...
/>
```

### Q: 如何禁用动画？
A: 目前不支持，建议使用标准ReactFlow Edge组件

### Q: 粒子动画卡顿怎么办？
A: 检查是否有太多活动边，建议限制在50条以内

### Q: 如何更改粒子数量？
A: 需要修改组件源码，添加或删除motion.circle元素

## 调试技巧

### 查看主题颜色
```typescript
import { debugTheme } from '@/lib/workflow/workflowTheme';

// 在控制台打印主题信息
debugTheme();
```

### 检查边的状态
```typescript
console.log({
  selected,
  isActive: data?.isActive,
  isConditional: data?.isConditional,
  edgeColor: getEdgeColor(),
});
```

## 相关组件

- `WorkflowEditor` - 工作流编辑器
- `InlineParameterNode` - 内联参数节点
- `NodeHeader` - 节点头部

## 相关文档

- [完整实现文档](./TASK_11_ANIMATED_EDGE_COMPLETE.md)
- [主题系统文档](./THEME_SWITCHING_GUIDE.md)
- [工作流设计系统](./WORKFLOW_THEME_REDESIGN_PREVIEW.md)
