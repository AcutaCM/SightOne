/**
 * AI Configuration Validation Demo Page
 * 
 * Task 7: Demo page showcasing the AI Configuration Validation Panel
 * Demonstrates all validation features and provider information
 */

'use client';

import React from 'react';
import AIConfigValidationPanel from '@/components/AIConfigValidationPanel';
import AIConfigSyncStatusDisplay from '@/components/AIConfigSyncStatusDisplay';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AIConfigValidationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            返回首页
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI 配置验证
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            验证和测试智能代理的 AI 配置状态
          </p>
        </div>

        {/* Status Display (Compact) */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            快速状态
          </h2>
          <AIConfigSyncStatusDisplay showDetails={true} />
        </div>

        {/* Main Validation Panel */}
        <AIConfigValidationPanel
          showProviderDetails={true}
          enableTesting={true}
        />

        {/* Usage Instructions */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            使用说明
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>1. 配置 AI 助理：</strong>
              在 ChatbotChat 中选择或创建一个 AI 助理，系统会自动同步配置到智能代理后端。
            </p>
            <p>
              <strong>2. 验证配置：</strong>
              查看上方的配置状态，确认 AI 提供商和模型已正确配置。
            </p>
            <p>
              <strong>3. 测试连接：</strong>
              点击"测试配置"按钮，验证 AI 模型是否能正常响应。
            </p>
            <p>
              <strong>4. 查看支持的提供商：</strong>
              展开下方的提供商列表，查看所有支持的 AI 模型和功能。
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            技术细节
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong className="text-gray-900 dark:text-white">后端地址：</strong>
              <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                ws://localhost:3004
              </code>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">配置来源：</strong>
              <span className="ml-2">AssistantContext (ChatbotChat)</span>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">同步方式：</strong>
              <span className="ml-2">WebSocket 自动同步</span>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">支持的提供商：</strong>
              <span className="ml-2">OpenAI, Anthropic, Google, Ollama</span>
            </div>
          </div>
        </div>

        {/* Integration Example */}
        <div className="mt-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            集成示例
          </h2>
          <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto">
            <code className="text-gray-800 dark:text-gray-200">
{`import AIConfigValidationPanel from '@/components/AIConfigValidationPanel';

// 基础使用
<AIConfigValidationPanel />

// 完整配置
<AIConfigValidationPanel
  showProviderDetails={true}
  enableTesting={true}
  className="custom-class"
/>`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
