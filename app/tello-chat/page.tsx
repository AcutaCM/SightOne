'use client';

/**
 * Tello智能代理聊天页面
 * 使用ChatBot的AI配置进行自然语言解析
 */

import React, { useState, useEffect } from 'react';
import { Card, Select, SelectItem, Input, Button, Divider } from '@heroui/react';
import TelloIntelligentAgentChat from '@/components/ChatbotChat/TelloIntelligentAgentChat';
import { Settings } from 'lucide-react';

export default function TelloChatPage() {
  // AI配置状态
  const [aiProvider, setAiProvider] = useState('openai');
  const [aiModel, setAiModel] = useState('gpt-4');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiBaseUrl, setAiBaseUrl] = useState('');
  const [aiEndpoint, setAiEndpoint] = useState('');
  const [aiDeployment, setAiDeployment] = useState('');
  const [temperature, setTemperature] = useState(0.1);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [droneBackendUrl, setDroneBackendUrl] = useState('http://localhost:8765');
  
  const [showSettings, setShowSettings] = useState(false);

  // 从localStorage加载配置
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('tello-chat-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setAiProvider(config.aiProvider || 'openai');
        setAiModel(config.aiModel || 'gpt-4');
        setAiApiKey(config.aiApiKey || '');
        setAiBaseUrl(config.aiBaseUrl || '');
        setAiEndpoint(config.aiEndpoint || '');
        setAiDeployment(config.aiDeployment || '');
        setTemperature(config.temperature || 0.1);
        setMaxTokens(config.maxTokens || 1000);
        setDroneBackendUrl(config.droneBackendUrl || 'http://localhost:8765');
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  }, []);

  // 保存配置到localStorage
  const saveConfig = () => {
    try {
      const config = {
        aiProvider,
        aiModel,
        aiApiKey,
        aiBaseUrl,
        aiEndpoint,
        aiDeployment,
        temperature,
        maxTokens,
        droneBackendUrl
      };
      localStorage.setItem('tello-chat-config', JSON.stringify(config));
      setShowSettings(false);
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-heroui-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Tello智能代理</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              使用自然语言控制无人机
            </p>
          </div>
          <Button
            variant="flat"
            startContent={<Settings size={18} />}
            onPress={() => setShowSettings(!showSettings)}
          >
            设置
          </Button>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <Card className="p-4 mb-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">AI配置</h2>

              <Select
                label="AI提供商"
                selectedKeys={[aiProvider]}
                onChange={(e) => setAiProvider(e.target.value)}
              >
                <SelectItem key="openai" value="openai">OpenAI</SelectItem>
                <SelectItem key="azure" value="azure">Azure OpenAI</SelectItem>
                <SelectItem key="ollama" value="ollama">Ollama</SelectItem>
                <SelectItem key="qwen" value="qwen">Qwen</SelectItem>
                <SelectItem key="deepseek" value="deepseek">DeepSeek</SelectItem>
                <SelectItem key="groq" value="groq">Groq</SelectItem>
                <SelectItem key="mistral" value="mistral">Mistral</SelectItem>
                <SelectItem key="openrouter" value="openrouter">OpenRouter</SelectItem>
              </Select>

              <Input
                label="模型"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                placeholder="例如: gpt-4, llama3.1:8b"
              />

              {aiProvider !== 'ollama' && (
                <Input
                  label="API Key"
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder="输入你的API密钥"
                />
              )}

              {aiProvider === 'azure' ? (
                <>
                  <Input
                    label="Azure Endpoint"
                    value={aiEndpoint}
                    onChange={(e) => setAiEndpoint(e.target.value)}
                    placeholder="https://your-resource.openai.azure.com"
                  />
                  <Input
                    label="Deployment Name"
                    value={aiDeployment}
                    onChange={(e) => setAiDeployment(e.target.value)}
                    placeholder="your-deployment-name"
                  />
                </>
              ) : (
                <Input
                  label="Base URL (可选)"
                  value={aiBaseUrl}
                  onChange={(e) => setAiBaseUrl(e.target.value)}
                  placeholder="自定义API端点"
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Temperature"
                  type="number"
                  value={String(temperature)}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  min="0"
                  max="2"
                  step="0.1"
                />
                <Input
                  label="Max Tokens"
                  type="number"
                  value={String(maxTokens)}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  min="100"
                  max="4000"
                  step="100"
                />
              </div>

              <Divider />

              <h2 className="text-lg font-semibold">无人机配置</h2>

              <Input
                label="无人机后端地址"
                value={droneBackendUrl}
                onChange={(e) => setDroneBackendUrl(e.target.value)}
                placeholder="http://localhost:8765"
              />

              <div className="flex gap-2">
                <Button color="primary" onPress={saveConfig} className="flex-1">
                  保存配置
                </Button>
                <Button variant="flat" onPress={() => setShowSettings(false)}>
                  取消
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 聊天界面 */}
        <Card className="h-[calc(100vh-200px)]">
          <TelloIntelligentAgentChat
            aiProvider={aiProvider}
            aiModel={aiModel}
            aiApiKey={aiApiKey}
            aiBaseUrl={aiBaseUrl}
            aiEndpoint={aiEndpoint}
            aiDeployment={aiDeployment}
            temperature={temperature}
            maxTokens={maxTokens}
            droneBackendUrl={droneBackendUrl}
            onCommandsGenerated={(commands) => {
              console.log('生成的指令:', commands);
            }}
            onExecutionComplete={(results) => {
              console.log('执行结果:', results);
            }}
          />
        </Card>

        {/* 使用说明 */}
        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-2">使用说明</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 在上方配置你的AI提供商和API密钥</li>
            <li>• 在聊天框中输入自然语言指令,例如: "起飞、向前50厘米、顺时针旋转90度"</li>
            <li>• AI会解析你的指令并生成无人机命令序列</li>
            <li>• 确认指令无误后,点击"执行指令"按钮</li>
            <li>• 系统会将指令发送给无人机后端执行</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
