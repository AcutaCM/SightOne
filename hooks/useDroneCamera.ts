import { useState, useCallback } from 'react';

interface PlantAnalysisResult {
  id: string;
  plantId: string;
  timestamp: string;
  imageUrl: string;
  analysis: {
    healthScore: number;
    diseaseDetected: boolean;
    diseaseType?: string;
    recommendations: string[];
    confidence: number;
  };
  qrData?: string;
}

export const useDroneCamera = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<PlantAnalysisResult[]>([]);

  const captureAndAnalyze = useCallback(async (plantId: string, qrData?: string) => {
    setIsAnalyzing(true);
    
    try {
      // 模拟拍照过程
      console.log(`Capturing image for plant: ${plantId}`);
      
      // 模拟上传和分析过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟分析结果
      const mockResult: PlantAnalysisResult = {
        id: Date.now().toString(),
        plantId,
        timestamp: new Date().toISOString(),
        imageUrl: '', // 实际应用中这里应该是图片URL
        analysis: {
          healthScore: Math.floor(Math.random() * 40) + 60, // 60-100的随机分数
          diseaseDetected: Math.random() > 0.7,
          diseaseType: Math.random() > 0.7 ? '叶斑病' : undefined,
          recommendations: [
            '建议增加光照时间',
            '注意通风条件',
            '定期检查叶片健康状况'
          ],
          confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0的置信度
        },
        qrData
      };
      
      setAnalysisResults(prev => [mockResult, ...prev.slice(0, 9)]); // 保持最多10个结果
      
      return mockResult;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysisResults = useCallback(() => {
    setAnalysisResults([]);
  }, []);

  return {
    isAnalyzing,
    analysisResults,
    captureAndAnalyze,
    clearAnalysisResults
  };
};