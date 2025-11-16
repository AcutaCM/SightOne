import { useState, useCallback } from 'react';

interface ReportData {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  status: 'generating' | 'completed' | 'failed';
  size: string;
  format: string;
  content: string;
  analysisResults: any[];
}

export const useReportGenerator = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const generateReport = useCallback(async (config: any, analysisResults: any[]) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // 模拟报告生成过程
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 生成报告内容
      const reportContent = `
# 植株分析报告

## 报告信息
- 报告标题: ${config.title}
- 报告类型: ${config.type}
- 生成时间: ${new Date().toLocaleString()}

## 分析结果摘要
本次分析共检测 ${analysisResults.length} 个植株样本，其中:
- 健康植株: ${analysisResults.filter(r => r.analysis.healthScore >= 80).length} 个
- 亚健康植株: ${analysisResults.filter(r => r.analysis.healthScore >= 60 && r.analysis.healthScore < 80).length} 个
- 不健康植株: ${analysisResults.filter(r => r.analysis.healthScore < 60).length} 个

## 详细分析结果
${analysisResults.map((result, index) => `
### 植株 #${index + 1} (ID: ${result.plantId})
- 健康评分: ${result.analysis.healthScore}/100
- 病害检测: ${result.analysis.diseaseDetected ? '是' : '否'}
${result.analysis.diseaseDetected ? `- 病害类型: ${result.analysis.diseaseType || '未知'}` : ''}
- 置信度: ${(result.analysis.confidence * 100).toFixed(1)}%
- 建议措施:
${result.analysis.recommendations.map((rec: string, i: number) => `  ${i + 1}. ${rec}`).join('\n')}
`).join('\n')}

## 总结建议
1. 定期监测植株健康状况
2. 及时处理检测到病害的植株
3. 优化种植环境条件
4. 根据AI建议调整养护措施
      `.trim();

      const newReport: ReportData = {
        id: Date.now().toString(),
        title: config.title,
        type: config.type,
        createdAt: new Date().toISOString(),
        status: 'completed',
        size: `${Math.floor(Math.random() * 1000) + 500} KB`,
        format: config.format,
        content: reportContent,
        analysisResults
      };
      
      setReports(prev => [newReport, ...prev.slice(0, 9)]); // 保持最多10个报告
      return newReport;
    } catch (error) {
      console.error('Report generation failed:', error);
      
      const errorReport: ReportData = {
        id: Date.now().toString(),
        title: config.title,
        type: config.type,
        createdAt: new Date().toISOString(),
        status: 'failed',
        size: '0 KB',
        format: config.format,
        content: '报告生成失败',
        analysisResults: []
      };
      
      setReports(prev => [errorReport, ...prev.slice(0, 9)]);
      throw error;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, []);

  const exportReport = useCallback((reportId: string, format: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    // 模拟导出过程
    console.log(`Exporting report ${reportId} as ${format}`);
    
    // 在实际应用中，这里会根据format生成相应的文件并下载
    // 例如PDF、Word、Excel等格式
  }, [reports]);

  const deleteReport = useCallback((reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  const clearReports = useCallback(() => {
    setReports([]);
  }, []);

  return {
    reports,
    isGenerating,
    generationProgress,
    generateReport,
    exportReport,
    deleteReport,
    clearReports
  };
};