import { NextResponse } from 'next/server';

interface PlantDiagnosisRequest {
  imageBase64: string;
  plantId: string;
  qrData?: string;
  prompt?: string;
}

interface PlantDiagnosisResponse {
  healthScore: number;
  diseaseDetected: boolean;
  diseaseType?: string;
  recommendations: string[];
  confidence: number;
  analysisId: string;
  timestamp: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as PlantDiagnosisRequest;
    const { imageBase64, plantId, qrData, prompt } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
    }

    // 模拟AI分析过程
    // 在实际应用中，这里会调用真实的视觉大模型API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 生成模拟分析结果
    const mockResult: PlantDiagnosisResponse = {
      healthScore: Math.floor(Math.random() * 40) + 60, // 60-100的随机分数
      diseaseDetected: Math.random() > 0.7,
      diseaseType: Math.random() > 0.7 ? '叶斑病' : undefined,
      recommendations: [
        '建议增加光照时间',
        '注意通风条件',
        '定期检查叶片健康状况'
      ],
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0的置信度
      analysisId: `analysis_${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Plant diagnosis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}