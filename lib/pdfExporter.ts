/**
 * PDF导出器
 * 使用浏览器打印API生成PDF
 */

interface DiagnosisReport {
  id: string;
  plant_id: number;
  timestamp: string;
  original_image: string;
  mask_image?: string;
  mask_prompt?: string;
  markdown_report: string;
  summary: string;
  severity: 'low' | 'medium' | 'high';
  diseases: string[];
  recommendations: string[];
  ai_model: string;
  confidence: number;
  processing_time: number;
}

/**
 * 将Markdown转换为HTML
 */
function markdownToHTML(markdown: string): string {
  // 简单的Markdown转HTML实现
  let html = markdown;
  
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // 列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 段落
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  return html;
}

/**
 * 生成单个报告的HTML
 */
function renderReportHTML(report: DiagnosisReport): string {
  const severityLabels = {
    low: '低',
    medium: '中',
    high: '高'
  };

  const severityColors = {
    low: '#d4edda',
    medium: '#fff3cd',
    high: '#f8d7da'
  };

  return `
    <div class="report" style="page-break-after: always;">
      <div class="report-header">
        <h1>植株 ${report.plant_id} 诊断报告</h1>
        <div class="severity-badge" style="background-color: ${severityColors[report.severity]};">
          严重程度: ${severityLabels[report.severity]}
        </div>
        <p class="timestamp">${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
      </div>

      <div class="image-section">
        <div class="image-item">
          <h3>原始图像</h3>
          <img src="${report.original_image}" alt="原图" />
        </div>
        ${report.mask_image ? `
        <div class="image-item">
          <h3>病害遮罩图</h3>
          ${report.mask_prompt ? `<p class="mask-prompt">识别部位: ${report.mask_prompt}</p>` : ''}
          <img src="${report.mask_image}" alt="遮罩图" />
        </div>
        ` : ''}
      </div>

      <div class="markdown-content">
        ${markdownToHTML(report.markdown_report)}
      </div>

      <div class="report-footer">
        <div class="metadata">
          <div class="metadata-item">
            <span class="label">AI模型:</span>
            <span class="value">${report.ai_model}</span>
          </div>
          <div class="metadata-item">
            <span class="label">置信度:</span>
            <span class="value">${(report.confidence * 100).toFixed(1)}%</span>
          </div>
          <div class="metadata-item">
            <span class="label">处理时间:</span>
            <span class="value">${report.processing_time.toFixed(2)}秒</span>
          </div>
          <div class="metadata-item">
            <span class="label">报告ID:</span>
            <span class="value">${report.id}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * CSS样式
 */
const CSS_STYLES = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
    line-height: 1.6;
    color: #333;
    background: white;
    padding: 20px;
  }

  .report {
    margin-bottom: 40px;
    padding-bottom: 40px;
  }

  .report-header {
    margin-bottom: 30px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 20px;
  }

  .report-header h1 {
    font-size: 28px;
    color: #1a1a1a;
    margin-bottom: 10px;
  }

  .severity-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .timestamp {
    color: #666;
    font-size: 14px;
  }

  .image-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .image-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }

  .image-item h3 {
    background: #f5f5f5;
    padding: 10px 15px;
    font-size: 16px;
    border-bottom: 1px solid #ddd;
  }

  .mask-prompt {
    padding: 10px 15px;
    background: #f9f9f9;
    font-size: 14px;
    color: #666;
    border-bottom: 1px solid #ddd;
  }

  .image-item img {
    width: 100%;
    height: auto;
    display: block;
  }

  .markdown-content {
    margin-bottom: 30px;
  }

  .markdown-content h1 {
    font-size: 24px;
    margin-top: 24px;
    margin-bottom: 12px;
    color: #1a1a1a;
  }

  .markdown-content h2 {
    font-size: 20px;
    margin-top: 20px;
    margin-bottom: 10px;
    color: #333;
  }

  .markdown-content h3 {
    font-size: 18px;
    margin-top: 16px;
    margin-bottom: 8px;
    color: #444;
  }

  .markdown-content p {
    margin-bottom: 12px;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin-left: 24px;
    margin-bottom: 16px;
  }

  .markdown-content li {
    margin-bottom: 8px;
  }

  .markdown-content strong {
    font-weight: 600;
  }

  .report-footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
  }

  .metadata {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .metadata-item {
    font-size: 14px;
  }

  .metadata-item .label {
    color: #666;
    display: block;
    margin-bottom: 4px;
  }

  .metadata-item .value {
    color: #333;
    font-weight: 500;
  }

  @media print {
    body {
      padding: 0;
    }
    
    .report {
      page-break-after: always;
    }
    
    .report:last-child {
      page-break-after: auto;
    }
  }
`;

/**
 * 生成PDF（使用浏览器打印）
 */
export async function generatePDF(reports: DiagnosisReport[]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 创建HTML内容
      const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>植株诊断报告</title>
  <style>${CSS_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="text-align: center; margin-bottom: 10px;">植株诊断报告汇总</h1>
      <div style="text-align: center; color: #666; margin-bottom: 30px;">
        <span>生成时间: ${new Date().toLocaleString('zh-CN')}</span>
        <span style="margin-left: 20px;">报告数量: ${reports.length}</span>
      </div>
    </div>
    ${reports.map(report => renderReportHTML(report)).join('\n')}
  </div>
</body>
</html>
      `;

      // 创建Blob
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      
      // 注意：这实际上返回的是HTML Blob，用户需要在浏览器中打开并使用打印功能保存为PDF
      // 真正的PDF生成需要jsPDF库
      resolve(blob);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 下载文件
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
