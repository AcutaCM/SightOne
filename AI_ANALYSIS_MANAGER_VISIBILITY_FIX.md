# AI Analysis Manager 可见性修复

## 问题
在ComponentSelector中选择AI Analysis Manager后,组件在主页面上不可见。

## 原因
虽然在ComponentSelector的AVAILABLE_COMPONENTS数组中添加了`ai-analysis-manager`,但在主页面(`app/page.tsx`)中缺少对应的渲染逻辑。

## 修复内容

### 1. 添加导入语句
在`app/page.tsx`的导入部分添加了AIAnalysisManager组件:

```typescript
import AIAnalysisManager from "@/components/AIAnalysisManager";
```

### 2. 添加渲染逻辑
在主页面的MainContent组件中添加了AI Analysis Manager的条件渲染代码:

```typescript
{/* AI Analysis Manager */}
{isComponentVisible('ai-analysis-manager') && (
  <DraggableContainer
    componentId="ai-analysis-manager"
    initialPosition={{ x: 1600, y: 20 }}
    initialSize={{ width: 400, height: 500 }}
    enableDropZones={true}
    strictDropZones={false}
  >
    <AIAnalysisManager />
  </DraggableContainer>
)}
```

## 测试步骤
1. 刷新页面
2. 点击顶部导航栏的组件选择器按钮
3. 选择"AI Analysis Manager"
4. 组件应该在主页面上显示,位置在(x: 1600, y: 20)
5. 可以拖动和调整大小

## 技术细节
- 组件ID: `ai-analysis-manager`
- 初始位置: x=1600, y=20
- 初始大小: 400x500像素
- 支持拖放区域
- 可拖动和调整大小

## 相关文件
- `drone-analyzer-nextjs/app/page.tsx` - 主页面文件
- `drone-analyzer-nextjs/components/ComponentSelector.tsx` - 组件选择器
- `drone-analyzer-nextjs/components/AIAnalysisManager.tsx` - AI分析管理器组件
