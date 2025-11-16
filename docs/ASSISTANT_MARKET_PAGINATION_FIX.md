# Assistant市场分页问题修复

## 问题描述

在purechat组件中，当用户点击Assistant市场的分页按钮后，助理列表显示错误，所有助理都变成了"testAssistant 766"等错误数据。

## 问题原因

代码中缺少分页逻辑：
1. 没有定义分页状态（当前页码、每页数量）
2. 直接渲染所有的 `publishedAssistants`，没有根据分页进行数据切片
3. 虽然可能有分页UI组件，但点击时没有正确过滤数据

## 修复方案

### 1. 添加分页状态

```typescript
// 分页状态
const [assistantCurrentPage, setAssistantCurrentPage] = useState<number>(1);
const [assistantPageSize] = useState<number>(12); // 每页显示12个助理
```

### 2. 切换标签页时重置分页

```typescript
useEffect(() => {
  if (marketTab === 'assistants') {
    console.log('[ChatbotChat] Refreshing assistants data...');
    setAssistantCurrentPage(1); // 重置到第一页
    refreshAssistants().catch(err => {
      console.error('[ChatbotChat] Failed to refresh assistants:', err);
    });
  }
}, [marketTab, refreshAssistants]);
```

### 3. 实现分页数据切片

使用IIFE（立即执行函数表达式）来计算当前页的数据：

```typescript
{marketTab === 'assistants' && (() => {
  // 计算分页数据
  const startIndex = (assistantCurrentPage - 1) * assistantPageSize;
  const endIndex = startIndex + assistantPageSize;
  const paginatedAssistants = publishedAssistants.slice(startIndex, endIndex);
  
  return (
    <div>
      {/* 渲染 paginatedAssistants 而不是 publishedAssistants */}
      <Row gutter={[12, 12]}>
        {paginatedAssistants.map((assistant) => (
          // ... 助理卡片
        ))}
      </Row>
    </div>
  );
})()}
```

### 4. 添加分页控件

```typescript
{/* 分页组件 */}
{publishedAssistants.length > assistantPageSize && (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 16
  }}>
    <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      padding: '8px 16px',
      background: 'hsl(var(--heroui-content2))',
      borderRadius: 12,
      border: '1px solid hsl(var(--heroui-divider))'
    }}>
      <Button
        size="small"
        disabled={assistantCurrentPage === 1}
        onClick={() => setAssistantCurrentPage(prev => Math.max(1, prev - 1))}
      >
        上一页
      </Button>
      
      <span>
        第 {assistantCurrentPage} / {Math.ceil(publishedAssistants.length / assistantPageSize)} 页
      </span>
      
      <Button
        size="small"
        disabled={assistantCurrentPage >= Math.ceil(publishedAssistants.length / assistantPageSize)}
        onClick={() => setAssistantCurrentPage(prev => Math.min(Math.ceil(publishedAssistants.length / assistantPageSize), prev + 1))}
      >
        下一页
      </Button>
    </div>
  </div>
)}
```

## 修复效果

1. ✅ 每页正确显示12个助理
2. ✅ 点击"上一页"/"下一页"按钮时，正确切换到对应页面的助理
3. ✅ 切换到Assistant标签页时，自动重置到第一页
4. ✅ 当助理总数少于12个时，不显示分页控件
5. ✅ 第一页时"上一页"按钮禁用，最后一页时"下一页"按钮禁用

## 测试建议

1. 创建超过12个已发布的助理
2. 切换到Assistant市场标签页
3. 验证第一页显示前12个助理
4. 点击"下一页"，验证显示第13-24个助理
5. 点击"上一页"，验证返回第一页
6. 切换到其他标签页再切回，验证重置到第一页

## 相关文件

- `drone-analyzer-nextjs/components/ChatbotChat/index.tsx` - 主要修复文件
- `drone-analyzer-nextjs/contexts/AssistantContext.tsx` - 助理数据管理

## 修复日期

2024-01-XX
