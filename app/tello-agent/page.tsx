'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Divider } from '@heroui/react';
import TelloIntelligentAgentPanel from '@/components/TelloIntelligentAgentPanel';
import { ChatbotAIConfig } from '@/lib/services/telloIntelligentAgent';
import { FiCpu, FiCommand, FiCheckCircle } from 'react-icons/fi';

export default function TelloAgentPage() {
  const [aiConfig, setAIConfig] = useState<ChatbotAIConfig | null>(null);
  const [generatedCommands, setGeneratedCommands] = useState<any[]>([]);
  const [executionResults, setExecutionResults] = useState<any[]>([]);

  // Load AI config from chatbotchat settings
  useEffect(() => {
    const loadAIConfig = async () => {
      try {
        // Try to get config from localStorage (chatbotchat stores it there)
        const storedConfig = localStorage.getItem('chatbot_ai_config');
        if (storedConfig) {
          const parsed = JSON.parse(storedConfig);
          setAIConfig({
            provider: parsed.provider || 'openai',
            model: parsed.model || 'gpt-4',
            apiKey: parsed.apiKey || '',
            baseUrl: parsed.baseUrl || '',
            endpoint: parsed.endpoint || '',
            deployment: parsed.deployment || '',
            temperature: parsed.temperature || 0.1,
            maxTokens: parsed.maxTokens || 1000
          });
        }
      } catch (error) {
        console.error('Failed to load AI config:', error);
      }
    };

    loadAIConfig();
  }, []);

  const handleCommandsGenerated = (commands: any[]) => {
    setGeneratedCommands(commands);
    console.log('Generated commands:', commands);
  };

  const handleExecutionComplete = (results: any[]) => {
    setExecutionResults(results);
    console.log('Execution results:', results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tello 智能代理
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            使用 AI 分析自然语言命令，生成无人机控制序列
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FiCpu className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">AI 分析</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  前端 AI 解析命令
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FiCommand className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">命令序列</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  显示生成的命令
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FiCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">后端执行</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  发送给 drone_backend
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Agent Panel */}
        <TelloIntelligentAgentPanel
          droneBackendUrl="http://localhost:8000"
          chatbotAIConfig={aiConfig || undefined}
          onCommandsGenerated={handleCommandsGenerated}
          onExecutionComplete={handleExecutionComplete}
        />

        {/* Command History */}
        {generatedCommands.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">命令历史</h3>
            <Divider className="mb-3" />
            <div className="space-y-2">
              {generatedCommands.map((cmd, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {cmd.action}
                    </span>
                    {cmd.parameters && Object.keys(cmd.parameters).length > 0 && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {JSON.stringify(cmd.parameters)}
                      </span>
                    )}
                  </div>
                  {cmd.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {cmd.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Execution Results */}
        {executionResults.length > 0 && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">执行结果</h3>
            <Divider className="mb-3" />
            <div className="space-y-2">
              {executionResults.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 border ${
                    result.success
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <FiCheckCircle className="text-green-600" />
                    ) : (
                      <FiCommand className="text-red-600" />
                    )}
                    <span className="font-mono text-sm font-semibold">
                      {result.action}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    result.success
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.message || result.error}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Usage Guide */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">使用说明</h3>
          <Divider className="mb-3" />
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. 配置 AI 提供商和模型（使用 chatbotchat 的配置）</p>
            <p>2. 输入自然语言命令，例如："起飞，向前飞50厘米，然后降落"</p>
            <p>3. 点击"分析"查看生成的命令序列</p>
            <p>4. 确认命令后，点击"执行"发送给 drone_backend</p>
            <p>5. 查看执行结果和无人机状态</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
