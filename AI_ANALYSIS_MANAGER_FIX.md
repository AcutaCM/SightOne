# AI分析管理器报告显示修复

## 问题描述

诊断完成后，报告没有显示在AI分析管理器面板中，导出HTML和PDF功能也无法使用。

## 根本原因

1. **报告未传递**: `diagnosis_complete` WebSocket消息被接收，但报告没有传递给AIAnalysisManager组件
2. **组件未监听**: AIAnalysisManager组件没有监听诊断完成事件
3. **导出功能存在**: PDF和HTML导出器已实现，但因为没有报告数据而无法使用

## 修复方案

### 1. 添加全局事件监听

在AIAnalysisManager组件中添加对 `diagnosis_complete` 事件的监听：

**文件**: `components/AIAnalysisManager.tsx`

```typescript
// 监听诊断完成事件
useEffect(() => {
  const handleDiagnosisComplete = (event: CustomEvent<DiagnosisReport>) => {
    console.log('收到诊断报告:', event.detail);
    addReport(event.detail);
  };

  window.addEventListener('diagnosis_complete' as any, handleDiagnosisComplete as EventListener);

  return () => {
    window.removeEventListener('diagnosis_complete' as any, handleDiagnosisComplete as EventListener);
  };
}, []);
```

### 2. 触发全局事件

在useDroneControl hook中，当收到 `diagnosis_complete` 消息时触发全局事件：

**文件**: `hooks/useDroneControl.ts`

```typescript
case 'diagnosis_complete': {
  const payload = data.data;
  if (payload?.plant_id && payload?.report) {
    // ... 显示通知 ...
    
    // 触发全局事件，通知AI分析管理器
    const event = new CustomEvent('diagnosis_complete', {
      detail: report
    });
    window.dispatchEvent(event);
    console.log('已触发diagnosis_complete事件，报告:', report);
  }
  break;
}
```

### 3. 添加报告接收提示

在 `addReport` 函数中添加toast通知：

```typescript
const addReport = (report: DiagnosisReport) => {
  setReports(prev => [report, ...prev]);
  toast.success(`新增诊断报告：植株 ${report.plant_id}`, {
    duration: 3000,
    position: 'top-right'
  });
  if (onReportReceived) {
    onReportReceived(report);
  }
};
```

## 工作流程

```
1. 后端完成诊断
   ↓
2. 发送 diagnosis_complete WebSocket消息
   ↓
3. useDroneControl接收消息
   ↓
4. 显示诊断完成通知
   ↓
5. 触发全局 diagnosis_complete 事件
   ↓
6. AIAnalysisManager监听到事件
   ↓
7. 调用 addReport 添加报告
   ↓
8. 报告显示在列表中 ✅
   ↓
9. 保存到localStorage
   ↓
10. 导出功能可用 ✅
```

## 报告数据结构

```typescript
interface DiagnosisReport {
  id: string;                    // 诊断ID
  plant_id: number;              // 植株ID
  timestamp: string;             // 时间戳
  original_image: string;        // 原始图像(base64)
  mask_image?: string;           // 遮罩图(base64)
  mask_prompt?: string;          // AI生成的遮罩提示词
  markdown_report: string;       // Markdown格式报告
  summary: string;               // 摘要
  severity: 'low'|'medium'|'high'; // 严重程度
  diseases: string[];            // 病害列表
  recommendations: string[];     // 建议列表
  ai_model: string;              // AI模型名称
  confidence: number;            // 置信度
  processing_time: number;       // 处理时间
}
```

## 导出功能

### PDF导出

**文件**: `lib/pdfExporter.ts`

- 使用浏览器打印API生成PDF
- 支持Markdown渲染
- 包含图像和遮罩图
- 自动下载文件

**使用**:
```typescript
const { generatePDF } = await import('../lib/pdfExporter');
const pdfBlob = await generatePDF(reports);
// 下载文件...
```

### HTML导出

**文件**: `lib/htmlExporter.ts`

- 生成独立的HTML文件
- 包含CSS样式
- 嵌入base64图像
- 支持打印和分享

**使用**:
```typescript
const { generateHTML } = await import('../lib/htmlExporter');
const htmlBlob = await generateHTML(reports);
// 下载文件...
```

## 测试步骤

### 1. 测试报告接收

1. 连接无人机
2. 启动诊断工作流
3. 扫描植株QR码
4. 等待诊断完成
5. 检查控制台日志：
   ```
   已触发diagnosis_complete事件，报告: {...}
   收到诊断报告: {...}
   ```
6. 检查AI分析管理器面板
7. 应该看到新的报告卡片

### 2. 测试PDF导出

1. 确保有至少一个报告
2. 点击"导出PDF"按钮
3. 应该看到"正在生成PDF..."提示
4. PDF文件自动下载
5. 打开PDF验证内容

### 3. 测试HTML导出

1. 确保有至少一个报告
2. 点击"导出HTML"按钮
3. 应该看到"正在生成HTML..."提示
4. HTML文件自动下载
5. 在浏览器中打开验证

## 预期效果

### 诊断完成后

**控制台日志**:
```
已触发diagnosis_complete事件，报告: {
  id: "diag_3_1731654321",
  plant_id: 3,
  summary: "检测到轻微叶斑病",
  ...
}
收到诊断报告: {...}
```

**Toast通知**:
```
🟢 植株 3 诊断完成
检测到轻微叶斑病

新增诊断报告：植株 3
```

**AI分析管理器**:
- 显示报告卡片
- 包含植株ID、时间、严重程度
- 可以点击查看详情
- 导出按钮可用

### 导出功能

**PDF导出**:
- 文件名: `diagnosis-reports-2025-11-15.pdf`
- 包含所有报告
- Markdown正确渲染
- 图像正确显示

**HTML导出**:
- 文件名: `diagnosis-reports-2025-11-15.html`
- 独立HTML文件
- 包含CSS样式
- 可以在浏览器中打开

## 数据持久化

报告会自动保存到localStorage：

```javascript
// 保存
localStorage.setItem('diagnosis_reports', JSON.stringify(reports));

// 加载
const savedReports = localStorage.getItem('diagnosis_reports');
const reports = JSON.parse(savedReports);
```

**清空报告**:
```javascript
localStorage.removeItem('diagnosis_reports');
```

## 故障排除

### 问题1: 报告没有显示

**检查**:
1. 打开浏览器控制台（F12）
2. 查找 "已触发diagnosis_complete事件" 日志
3. 查找 "收到诊断报告" 日志

**如果没有日志**:
- 检查WebSocket连接是否正常
- 检查后端是否发送了 `diagnosis_complete` 消息

**如果有日志但没有显示**:
- 检查AIAnalysisManager组件是否已挂载
- 检查localStorage是否有权限

### 问题2: 导出失败

**检查**:
1. 打开控制台查看错误信息
2. 确认有报告数据
3. 检查导出器文件是否存在

**常见错误**:
- "没有可导出的报告" - 确保reports数组不为空
- "PDF导出失败" - 检查pdfExporter.ts是否正确
- "HTML导出失败" - 检查htmlExporter.ts是否正确

### 问题3: 报告数据不完整

**检查**:
1. 查看后端日志中的报告数据
2. 确认所有字段都存在
3. 检查图像base64是否完整

## 相关文件

- `components/AIAnalysisManager.tsx` - AI分析管理器组件
- `hooks/useDroneControl.ts` - 无人机控制Hook
- `lib/pdfExporter.ts` - PDF导出器
- `lib/htmlExporter.ts` - HTML导出器

## 修复日期

2025-11-15

## 修复状态

✅ 已完成
- ✅ 添加全局事件监听
- ✅ 触发诊断完成事件
- ✅ 报告自动添加到列表
- ✅ 导出功能可用
- ✅ 数据持久化

## 注意事项

1. 报告保存在localStorage中，清除浏览器数据会丢失
2. 导出功能需要浏览器支持Blob和下载
3. PDF导出使用浏览器打印API，不同浏览器效果可能不同
4. 大量报告可能影响性能，建议定期清理
