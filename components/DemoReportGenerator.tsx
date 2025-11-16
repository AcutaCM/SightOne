'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Image } from '@heroui/image';
import toast from 'react-hot-toast';

interface DemoReportGeneratorProps {
  onReportGenerated?: (report: any) => void;
}

export default function DemoReportGenerator({ onReportGenerated }: DemoReportGeneratorProps) {
  const [plantId, setPlantId] = useState('1');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const originalInputRef = useRef<HTMLInputElement>(null);
  const maskInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (type: 'original' | 'mask', file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'original') {
        setOriginalImage(result);
        toast.success('✅ 原始图片已上传');
      } else {
        setMaskImage(result);
        toast.success('✅ 遮罩图片已上传');
      }
    };
    reader.readAsDataURL(file);
  };

  const generateDemoReport = () => {
    setIsGenerating(true);
    
    // 模拟生成延迟
    setTimeout(() => {
      const report = {
        id: `demo_${plantId}_${Date.now()}`,
        plant_id: parseInt(plantId),
        timestamp: new Date().toISOString(),
        original_image: originalImage || generateDemoImage('original'),
        mask_image: maskImage || generateDemoImage('mask'),
        mask_prompt: getSampleMaskPrompt(severity),
        markdown_report: generateMarkdownReport(plantId, severity),
        summary: getSampleSummary(severity),
        severity: severity,
        diseases: getSampleDiseases(severity),
        recommendations: getSampleRecommendations(severity),
        ai_model: 'gpt-4-vision-preview (演示)',
        confidence: getConfidence(severity),
        processing_time: Math.random() * 10 + 5
      };

      if (onReportGenerated) {
        onReportGenerated(report);
      }

      // 保存到localStorage
      const savedReports = localStorage.getItem('diagnosis_reports');
      const reports = savedReports ? JSON.parse(savedReports) : [];
      reports.unshift(report);
      localStorage.setItem('diagnosis_reports', JSON.stringify(reports));

      toast.success(`✅ 已生成植株 ${plantId} 的演示报告！`, {
        duration: 3000,
        icon: '🎉'
      });

      setIsGenerating(false);
    }, 1500);
  };

  const generateDemoImage = (type: 'original' | 'mask') => {
    // 生成演示用的SVG图像
    const width = 400;
    const height = 300;
    
    // 使用encodeURIComponent代替btoa来处理中文字符
    const encodeSvg = (svgContent: string) => {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    };
    
    if (type === 'original') {
      const svgContent = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad1)"/>
          <circle cx="200" cy="150" r="80" fill="#16a34a" opacity="0.7"/>
          <circle cx="150" cy="120" r="40" fill="#15803d" opacity="0.6"/>
          <circle cx="250" cy="180" r="50" fill="#166534" opacity="0.6"/>
          <text x="200" y="150" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">
            植株 ${plantId}
          </text>
          <text x="200" y="280" font-family="Arial" font-size="14" fill="white" text-anchor="middle" opacity="0.8">
            演示图像
          </text>
        </svg>
      `;
      return encodeSvg(svgContent);
    } else {
      const maskColor = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#10b981';
      const svgContent = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${width}" height="${height}" fill="#1f2937"/>
          <ellipse cx="200" cy="150" rx="120" ry="80" fill="${maskColor}" opacity="0.8"/>
          <text x="200" y="150" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">
            病害区域
          </text>
          <text x="200" y="280" font-family="Arial" font-size="14" fill="white" text-anchor="middle" opacity="0.8">
            遮罩图
          </text>
        </svg>
      `;
      return encodeSvg(svgContent);
    }
  };

  const getSampleMaskPrompt = (severity: string) => {
    const prompts = {
      low: '叶片边缘的轻微黄化区域',
      medium: '叶片上的黄褐色斑点区域',
      high: '茎部的深褐色腐烂部分'
    };
    return prompts[severity as keyof typeof prompts];
  };

  const getSampleSummary = (severity: string) => {
    const summaries = {
      low: '检测到轻微的叶片黄化现象，整体健康状况良好，建议加强日常养护。',
      medium: '发现中度叶斑病症状，需要及时处理以防止病情扩散。',
      high: '检测到严重的茎腐病，需要立即采取紧急措施，隔离病株并进行治疗。'
    };
    return summaries[severity as keyof typeof summaries];
  };

  const getSampleDiseases = (severity: string) => {
    const diseases = {
      low: ['轻微叶片黄化'],
      medium: ['叶斑病', '营养不良'],
      high: ['茎腐病', '根腐病', '真菌感染']
    };
    return diseases[severity as keyof typeof diseases];
  };

  const getSampleRecommendations = (severity: string) => {
    const recommendations = {
      low: [
        '增加光照时间',
        '适当补充氮肥',
        '保持适宜的土壤湿度',
        '定期检查叶片状况'
      ],
      medium: [
        '立即移除病叶',
        '喷洒杀菌剂',
        '减少浇水频率',
        '增加通风',
        '隔离观察7-10天'
      ],
      high: [
        '立即隔离病株',
        '切除腐烂部位',
        '使用广谱杀菌剂',
        '更换土壤',
        '加强消毒措施',
        '密切监控其他植株'
      ]
    };
    return recommendations[severity as keyof typeof recommendations];
  };

  const getConfidence = (severity: string) => {
    const confidence = {
      low: 0.75 + Math.random() * 0.15,
      medium: 0.80 + Math.random() * 0.15,
      high: 0.85 + Math.random() * 0.10
    };
    return confidence[severity as keyof typeof confidence];
  };

  const generateMarkdownReport = (plantId: string, severity: string) => {
    const severityText = { low: '低', medium: '中', high: '高' }[severity];
    const diseases = getSampleDiseases(severity);
    const recommendations = getSampleRecommendations(severity);

    return `## 诊断摘要

植株 ${plantId} 经过AI视觉分析，${getSampleSummary(severity)}

## 病害识别

${diseases.map(d => `- ${d}`).join('\n')}

## 严重程度

- **等级**: ${severityText}
- **置信度**: ${(getConfidence(severity) * 100).toFixed(1)}%
- **影响范围**: ${severity === 'high' ? '大面积受损，需紧急处理' : severity === 'medium' ? '局部区域受影响' : '轻微影响，可控范围'}

## 详细分析

### 病害特征

${severity === 'high' 
  ? '观察到明显的组织坏死和腐烂现象，病害已深入茎部组织。病变区域呈深褐色，质地软化，有明显的病原菌侵染迹象。周围组织也开始出现变色，表明病害正在快速扩散。'
  : severity === 'medium'
  ? '叶片表面出现多处黄褐色斑点，斑点边缘清晰，中心部位颜色较深。部分斑点已开始融合，形成较大的病斑区域。叶片整体活力下降，光合作用受到一定影响。'
  : '叶片边缘出现轻微的黄化现象，颜色从正常的深绿色逐渐过渡到淡黄色。叶脉仍保持绿色，表明这可能是营养缺乏或环境应激的早期表现。'
}

### 可能原因

${severity === 'high'
  ? '1. 病原真菌或细菌感染\n2. 土壤过度潮湿导致根系缺氧\n3. 伤口感染未及时处理\n4. 环境湿度过高利于病原菌繁殖'
  : severity === 'medium'
  ? '1. 真菌性病害感染\n2. 通风不良导致湿度过高\n3. 浇水过多或排水不良\n4. 营养元素失衡'
  : '1. 氮素营养轻微不足\n2. 光照不足影响叶绿素合成\n3. 土壤pH值偏离最适范围\n4. 短期环境应激反应'
}

### 发展趋势

${severity === 'high'
  ? '如不立即采取措施，病害将在2-3天内迅速扩散至整株植物，导致植株死亡。同时存在传染给邻近植株的高风险。'
  : severity === 'medium'
  ? '若不及时处理，病害可能在5-7天内进一步扩散，影响植株的生长和产量。及时干预可有效控制病情。'
  : '在适当的养护条件下，症状有望在1-2周内自然改善。但需要持续观察，防止症状加重。'
}

## 建议措施

### 立即措施

${recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n')}

### 后续处理

${recommendations.slice(3).map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 预防措施

1. 定期检查植株健康状况，做到早发现早处理
2. 保持适宜的环境条件（温度、湿度、光照）
3. 合理施肥，避免营养失衡
4. 加强通风，降低病害发生风险
5. 定期消毒工具和环境，减少病原菌传播
6. 建立植株健康档案，追踪生长状况

---

*注意：本诊断基于AI图像分析生成的演示报告，实际应用中建议结合实地观察和专业检测确认。*`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-col gap-2 pb-4">
        <h2 className="text-2xl font-bold">🎭 演示报告生成器</h2>
        <p className="text-sm text-default-500">快速生成诊断报告用于演示，支持自定义图片</p>
      </CardHeader>
      <CardBody className="gap-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="植株ID"
            placeholder="输入植株ID"
            value={plantId}
            onValueChange={setPlantId}
            type="number"
            min="1"
            description="演示用的植株编号"
            size="lg"
          />

          <Select
            label="严重程度"
            placeholder="选择严重程度"
            selectedKeys={[severity]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as 'low' | 'medium' | 'high';
              setSeverity(selected);
            }}
            description="选择不同的严重程度会生成不同的报告内容"
            size="lg"
          >
            <SelectItem key="low">
              🟢 低 - 轻微症状
            </SelectItem>
            <SelectItem key="medium">
              🟡 中 - 中度病害
            </SelectItem>
            <SelectItem key="high">
              🔴 高 - 严重病害
            </SelectItem>
          </Select>
        </div>

        {/* 图片上传区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 原始图片 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">📷 原始图片</h3>
              {originalImage && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => setOriginalImage(null)}
                >
                  清除
                </Button>
              )}
            </div>
            <div
              className="relative border-2 border-dashed border-default-300 rounded-lg overflow-hidden bg-default-50 hover:border-primary transition-colors cursor-pointer"
              style={{ aspectRatio: '4/3' }}
              onClick={() => originalInputRef.current?.click()}
            >
              {originalImage ? (
                <Image
                  src={originalImage}
                  alt="原始图片"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-default-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">点击上传原始图片</p>
                  <p className="text-xs">或使用默认演示图</p>
                </div>
              )}
            </div>
            <input
              ref={originalInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload('original', file);
              }}
            />
          </div>

          {/* 遮罩图片 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">🎯 遮罩图片</h3>
              {maskImage && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => setMaskImage(null)}
                >
                  清除
                </Button>
              )}
            </div>
            <div
              className="relative border-2 border-dashed border-default-300 rounded-lg overflow-hidden bg-default-50 hover:border-primary transition-colors cursor-pointer"
              style={{ aspectRatio: '4/3' }}
              onClick={() => maskInputRef.current?.click()}
            >
              {maskImage ? (
                <Image
                  src={maskImage}
                  alt="遮罩图片"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-default-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">点击上传遮罩图片</p>
                  <p className="text-xs">或使用默认演示图</p>
                </div>
              )}
            </div>
            <input
              ref={maskInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload('mask', file);
              }}
            />
          </div>
        </div>

        {/* 报告预览 */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>📋</span>
            <span>报告预览</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white/50 dark:bg-black/20 rounded p-2">
              <p className="text-xs text-default-500">植株ID</p>
              <p className="font-semibold">{plantId}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded p-2">
              <p className="text-xs text-default-500">严重程度</p>
              <p className="font-semibold">
                {severity === 'low' ? '🟢 低' : severity === 'medium' ? '🟡 中' : '🔴 高'}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded p-2">
              <p className="text-xs text-default-500">图片状态</p>
              <p className="font-semibold">
                {originalImage && maskImage ? '✅ 已自定义' : originalImage || maskImage ? '⚠️ 部分自定义' : '🎨 使用默认'}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded p-2 col-span-2 md:col-span-3">
              <p className="text-xs text-default-500 mb-1">识别病害</p>
              <p className="font-semibold">{getSampleDiseases(severity).join('、')}</p>
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <Button
          color="primary"
          size="lg"
          className="w-full font-semibold"
          onPress={generateDemoReport}
          isLoading={isGenerating}
          startContent={!isGenerating && <span className="text-xl">🎨</span>}
        >
          {isGenerating ? '正在生成报告...' : '生成演示报告'}
        </Button>

        <div className="text-xs text-default-400 text-center space-y-1">
          <p>💡 提示：生成的报告会自动保存到localStorage，可在AI分析管理器中查看</p>
          <p>📸 支持上传自定义图片，未上传时将使用默认演示图</p>
        </div>
      </CardBody>
    </Card>
  );
}
