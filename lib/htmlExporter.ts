/**
 * HTML导出器
 * 生成独立的HTML文件，包含所有样式和图像
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
  let html = markdown;
  
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // 列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  
  // 包装连续的列表项
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('<li>')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(line);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }
  
  if (inList) {
    result.push('</ul>');
  }
  
  html = result.join('\n');
  
  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 段落
  html = html.split('\n\n').map(para => {
    if (para.trim() && !para.trim().startsWith('<')) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('\n');
  
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
    low: { bg: '#d4edda', text: '#155724' },
    medium: { bg: '#fff3cd', text: '#856404' },
    high: { bg: '#f8d7da', text: '#721c24' }
  };

  const colors = severityColors[report.severity];

  return `
    <div class="report">
      <div class="report-header">
        <div class="header-content">
          <h2>植株 ${report.plant_id} 诊断报告</h2>
          <span class="badge" style="background: ${colors.bg}; color: ${colors.text};">
            严重程度: ${severityLabels[report.severity]}
          </span>
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
        <h3>元数据</h3>
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
            <span class="value" title="${report.id}">${report.id.substring(0, 20)}...</span>
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
    background: #f5f5f5;
    padding: 20px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .page-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
  }

  .page-header h1 {
    font-size: 32px;
    color: #1a1a1a;
    margin-bottom: 10px;
  }

  .page-meta {
    color: #666;
    font-size: 14px;
  }

  .page-meta span {
    margin: 0 10px;
  }

  .report {
    margin-bottom: 60px;
    padding-bottom: 40px;
    border-bottom: 2px solid #e0e0e0;
  }

  .report:last-child {
    border-bottom: none;
  }

  .report-header {
    margin-bottom: 30px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .report-header h2 {
    font-size: 24px;
    color: #1a1a1a;
  }

  .badge {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
  }

  .timestamp {
    color: #666;
    font-size: 14px;
  }

  .image-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
    padding: 12px 16px;
    font-size: 16px;
    border-bottom: 1px solid #ddd;
    color: #333;
  }

  .mask-prompt {
    padding: 10px 16px;
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
    color: #1a1a1a;
  }

  .markdown-content em {
    font-style: italic;
  }

  .report-footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
  }

  .report-footer h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
  }

  .metadata {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

  .footer-note {
    margin-top: 40px;
    padding: 20px;
    background: #f9f9f9;
    border-left: 4px solid #4CAF50;
    border-radius: 4px;
    font-size: 14px;
    color: #666;
  }

  .footer-note strong {
    color: #333;
  }

  @media print {
    body {
      background: white;
      padding: 0;
    }

    .container {
      box-shadow: none;
      padding: 20px;
    }

    .report {
      page-break-after: always;
    }

    .report:last-child {
      page-break-after: auto;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 20px;
    }

    .image-section {
      grid-template-columns: 1fr;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .metadata {
      grid-template-columns: 1fr;
    }
  }
`;

/**
 * 生成HTML文件
 */
export async function generateHTML(reports: DiagnosisReport[]): Promise<Blob> {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>植株诊断报告汇总</title>
  <style>${CSS_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="page-header">
      <h1>植株诊断报告汇总</h1>
      <div class="page-meta">
        <span>生成时间: ${new Date().toLocaleString('zh-CN')}</span>
        <span>|</span>
        <span>报告数量: ${reports.length}</span>
      </div>
    </div>

    ${reports.map(report => renderReportHTML(report)).join('\n')}

    <div class="footer-note">
      <strong>注意:</strong> 本诊断基于图像分析，建议结合实地观察和专业检测确认。
    </div>
  </div>
</body>
</html>
  `;

  return new Blob([html], { type: 'text/html;charset=utf-8' });
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
