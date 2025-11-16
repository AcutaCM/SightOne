'use client';

import React from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { Assistant } from '@/types/assistant';
import { Sparkles, MessageSquare, Zap } from 'lucide-react';

interface WelcomeMessageProps {
  assistant: Assistant;
  onExampleClick?: (example: string) => void;
}

/**
 * Welcome Message Component
 * 
 * Displays a welcome message when an assistant is activated, including:
 * - Assistant introduction
 * - Quick start tips
 * - Common commands or examples
 * 
 * Requirements: 7.4, 7.5
 */
export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  assistant,
  onExampleClick,
}) => {
  // Get welcome message from assistant description or use default
  const welcomeMessage = getWelcomeMessage(assistant);
  
  // Get example commands for this assistant
  const examples = getExampleCommands(assistant);

  return (
    <Card className="mb-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardBody className="gap-4">
        {/* Header with emoji and title */}
        <div className="flex items-center gap-3">
          <div className="text-4xl">{assistant.emoji}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {assistant.title}
              <Sparkles className="w-5 h-5 text-primary" />
            </h3>
            <p className="text-sm text-default-500">已激活并准备就绪</p>
          </div>
        </div>

        {/* Welcome message */}
        <div className="flex items-start gap-2">
          <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-default-700 leading-relaxed">
            {welcomeMessage}
          </p>
        </div>

        {/* Quick start tips */}
        {examples.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-default-600">
              <Zap className="w-4 h-4" />
              <span>快速开始</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <Chip
                  key={index}
                  variant="flat"
                  color="primary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => onExampleClick?.(example)}
                >
                  {example}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Additional tips */}
        <div className="text-xs text-default-400 border-t border-divider pt-3">
          💡 提示：你可以随时在市场中切换到其他助理
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * Get welcome message for an assistant
 */
function getWelcomeMessage(assistant: Assistant): string {
  // Check if assistant has a custom welcome message in tags
  const tags = typeof assistant.tags === 'string' 
    ? JSON.parse(assistant.tags || '[]')
    : assistant.tags || [];
  
  const welcomeTag = tags.find((tag: string) => tag.startsWith('welcome:'));
  if (welcomeTag) {
    return welcomeTag.replace('welcome:', '');
  }

  // Use description as welcome message
  if (assistant.desc) {
    return assistant.desc;
  }

  // Default welcome message
  return `你好！我是 ${assistant.title}，很高兴为你服务。请告诉我你需要什么帮助。`;
}

/**
 * Get example commands for an assistant
 */
function getExampleCommands(assistant: Assistant): string[] {
  // Predefined examples for known assistants
  const exampleMap: Record<string, string[]> = {
    'tello-intelligent-agent': [
      '起飞',
      '向前飞行 50 厘米',
      '顺时针旋转 90 度',
      '开始视频流',
    ],
    'agriculture-diagnosis-expert': [
      '这是什么病害？',
      '如何防治白粉病？',
      '草莓叶片发黄怎么办？',
    ],
    'image-analysis-assistant': [
      '分析这张图片',
      '检测图中的物体',
      '识别图片中的文字',
    ],
    'data-analyst': [
      '分析这组数据',
      '生成数据报告',
      '创建可视化图表',
    ],
    'coding-assistant': [
      '帮我写一个函数',
      '审查这段代码',
      '解释这个错误',
    ],
    'writing-assistant': [
      '帮我润色这段文字',
      '写一篇文章',
      '改进这个标题',
    ],
    'translation-assistant': [
      '翻译成英文',
      '翻译成中文',
      '解释这个词的含义',
    ],
    'education-tutor': [
      '解释这个概念',
      '帮我解答这道题',
      '总结这个知识点',
    ],
    'customer-service': [
      '我有一个问题',
      '如何使用这个功能？',
      '遇到了问题需要帮助',
    ],
    'creative-designer': [
      '给我一些设计灵感',
      '如何改进这个设计？',
      '推荐配色方案',
    ],
  };

  // Return predefined examples if available
  if (exampleMap[assistant.id]) {
    return exampleMap[assistant.id];
  }

  // Try to extract examples from tags
  const tags = typeof assistant.tags === 'string' 
    ? JSON.parse(assistant.tags || '[]')
    : assistant.tags || [];
  
  const exampleTags = tags
    .filter((tag: string) => tag.startsWith('example:'))
    .map((tag: string) => tag.replace('example:', ''));
  
  if (exampleTags.length > 0) {
    return exampleTags.slice(0, 4);
  }

  // Default examples based on category
  const category = typeof assistant.category === 'string'
    ? JSON.parse(assistant.category || '[]')
    : assistant.category || [];

  if (category.includes('specialized')) {
    return ['开始使用', '查看功能', '获取帮助'];
  }

  if (category.includes('creative')) {
    return ['给我灵感', '创建内容', '优化设计'];
  }

  if (category.includes('development')) {
    return ['编写代码', '调试问题', '优化性能'];
  }

  // Generic examples
  return ['你好', '帮我...', '我想...'];
}
