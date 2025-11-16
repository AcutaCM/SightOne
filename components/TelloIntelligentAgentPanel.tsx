/**
 * Tello Intelligent Agent Panel Component
 * 
 * UI for AI-powered drone command analysis and execution
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Textarea, Select, SelectItem, Chip, Divider } from '@heroui/react';
import { useTelloIntelligentAgent, ChatbotAIConfig } from '@/hooks/useTelloIntelligentAgent';
import { FiSend, FiImage, FiSettings, FiCheck, FiX, FiLoader } from 'react-icons/fi';

interface TelloIntelligentAgentPanelProps {
  droneBackendUrl?: string;
  onCommandsGenerated?: (commands: any[]) => void;
  onExecutionComplete?: (results: any[]) => void;
  // Get AI config from chatbotchat context
  chatbotAIConfig?: ChatbotAIConfig;
}

export default function TelloIntelligentAgentPanel({
  droneBackendUrl = 'http://localhost:8000',
  onCommandsGenerated,
  onExecutionComplete,
  chatbotAIConfig
}: TelloIntelligentAgentPanelProps) {
  // Use chatbotchat AI configuration or fallback to default
  const [config, setConfig] = useState<ChatbotAIConfig>(
    chatbotAIConfig || {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      baseUrl: '',
      temperature: 0.1,
      maxTokens: 1000
    }
  );

  // Update config when chatbotAIConfig changes
  useEffect(() => {
    if (chatbotAIConfig) {
      setConfig(chatbotAIConfig);
    }
  }, [chatbotAIConfig]);

  const [showSettings, setShowSettings] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use intelligent agent hook
  const {
    isAnalyzing,
    isExecuting,
    lastAnalysis,
    lastExecution,
    error,
    analyzeCommand,
    analyzeImage,
    executeCommands,
    analyzeAndExecute,
    updateConfig,
    clearError
  } = useTelloIntelligentAgent({
    config,
    droneBackendUrl,
    autoExecute: false // Manual execution for better control
  });

  /**
   * Handle command analysis
   */
  const handleAnalyzeCommand = async () => {
    if (!commandInput.trim()) return;

    const result = await analyzeCommand(commandInput);
    
    if (result.success && onCommandsGenerated) {
      onCommandsGenerated(result.commands);
    }
  };

  /**
   * Handle command analysis and execution
   */
  const handleAnalyzeAndExecute = async () => {
    if (!commandInput.trim()) return;

    const { analysis, execution } = await analyzeAndExecute(commandInput);
    
    if (analysis.success && onCommandsGenerated) {
      onCommandsGenerated(analysis.commands);
    }
    
    if (execution.length > 0 && onExecutionComplete) {
      onExecutionComplete(execution);
    }
  };

  /**
   * Handle image upload and analysis
   */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      
      const result = await analyzeImage(imageData, imagePrompt || undefined);
      
      if (result.success && result.suggestedCommands && onCommandsGenerated) {
        onCommandsGenerated(result.suggestedCommands);
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle manual command execution
   */
  const handleExecuteCommands = async () => {
    if (!lastAnalysis || !lastAnalysis.commands.length) return;

    const results = await executeCommands(lastAnalysis.commands);
    
    if (onExecutionComplete) {
      onExecutionComplete(results);
    }
  };

  /**
   * Update AI configuration (synced with chatbotchat)
   */
  const handleConfigUpdate = (key: keyof ChatbotAIConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    updateConfig(newConfig);
  };

  return (
    <div className="space-y-4">
      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Configuration</h3>
              <Button
                size="sm"
                variant="light"
                onPress={() => setShowSettings(false)}
              >
                Close
              </Button>
            </div>

            <Select
              label="AI Provider"
              selectedKeys={[config.provider]}
              onChange={(e) => handleConfigUpdate('provider', e.target.value)}
            >
              <SelectItem key="openai" value="openai">OpenAI</SelectItem>
              <SelectItem key="azure" value="azure">Azure OpenAI</SelectItem>
              <SelectItem key="ollama" value="ollama">Ollama</SelectItem>
              <SelectItem key="qwen" value="qwen">Qwen</SelectItem>
              <SelectItem key="deepseek" value="deepseek">DeepSeek</SelectItem>
              <SelectItem key="groq" value="groq">Groq</SelectItem>
              <SelectItem key="mistral" value="mistral">Mistral</SelectItem>
              <SelectItem key="openrouter" value="openrouter">OpenRouter</SelectItem>
              <SelectItem key="dify" value="dify">Dify</SelectItem>
            </Select>

            <Input
              label="Model"
              value={config.model}
              onChange={(e) => handleConfigUpdate('model', e.target.value)}
              placeholder="e.g., gpt-4, llama3.1:8b"
            />

            {config.provider !== 'ollama' && (
              <Input
                label="API Key"
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => handleConfigUpdate('apiKey', e.target.value)}
                placeholder="Enter your API key"
              />
            )}

            <Input
              label="Temperature"
              type="number"
              value={String(config.temperature || 0.1)}
              onChange={(e) => handleConfigUpdate('temperature', parseFloat(e.target.value))}
              placeholder="0.1"
              min="0"
              max="2"
              step="0.1"
            />

            <Input
              label="Max Tokens"
              type="number"
              value={String(config.maxTokens || 1000)}
              onChange={(e) => handleConfigUpdate('maxTokens', parseInt(e.target.value))}
              placeholder="1000"
              min="100"
              max="4000"
              step="100"
            />

            <Input
              label="Base URL (Optional)"
              value={config.baseUrl || ''}
              onChange={(e) => handleConfigUpdate('baseUrl', e.target.value)}
              placeholder="Custom API endpoint"
            />
          </div>
        </Card>
      )}

      {/* Main Panel */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Intelligent Agent</h2>
            <Button
              size="sm"
              variant="flat"
              startContent={<FiSettings />}
              onPress={() => setShowSettings(!showSettings)}
            >
              Settings
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <FiX className="text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onPress={clearError}
                >
                  <FiX />
                </Button>
              </div>
            </div>
          )}

          {/* Command Input */}
          <div className="space-y-2">
            <Textarea
              label="Natural Language Command"
              placeholder="e.g., Take off, move forward 50cm, rotate 90 degrees clockwise, then land"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              minRows={3}
              disabled={isAnalyzing || isExecuting}
            />

            <div className="flex gap-2">
              <Button
                color="primary"
                startContent={<FiSend />}
                onPress={handleAnalyzeCommand}
                isLoading={isAnalyzing}
                isDisabled={!commandInput.trim() || isExecuting}
              >
                Analyze
              </Button>

              <Button
                color="success"
                startContent={<FiSend />}
                onPress={handleAnalyzeAndExecute}
                isLoading={isAnalyzing || isExecuting}
                isDisabled={!commandInput.trim()}
              >
                Analyze & Execute
              </Button>
            </div>
          </div>

          <Divider />

          {/* Image Analysis */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Image Analysis</h3>
            
            <Input
              label="Analysis Prompt (Optional)"
              placeholder="What should I look for in the image?"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              disabled={isAnalyzing}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              variant="flat"
              startContent={<FiImage />}
              onPress={() => fileInputRef.current?.click()}
              isLoading={isAnalyzing}
              isDisabled={isExecuting}
            >
              Upload & Analyze Image
            </Button>
          </div>

          {/* Analysis Results */}
          {lastAnalysis && lastAnalysis.success && (
            <>
              <Divider />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Generated Commands</h3>
                  <Button
                    size="sm"
                    color="primary"
                    startContent={<FiCheck />}
                    onPress={handleExecuteCommands}
                    isLoading={isExecuting}
                    isDisabled={isAnalyzing}
                  >
                    Execute All
                  </Button>
                </div>

                {lastAnalysis.reasoning && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Reasoning:</strong> {lastAnalysis.reasoning}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {lastAnalysis.commands.map((cmd, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Chip size="sm" color="primary">
                          {index + 1}
                        </Chip>
                        <span className="font-mono text-sm font-semibold">
                          {cmd.action}
                        </span>
                      </div>
                      
                      {cmd.parameters && Object.keys(cmd.parameters).length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 ml-8">
                          Parameters: {JSON.stringify(cmd.parameters)}
                        </div>
                      )}
                      
                      {cmd.description && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 ml-8">
                          {cmd.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Execution Results */}
          {lastExecution && lastExecution.length > 0 && (
            <>
              <Divider />
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Execution Results</h3>

                <div className="space-y-2">
                  {lastExecution.map((result, index) => (
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
                          <FiCheck className="text-green-600" />
                        ) : (
                          <FiX className="text-red-600" />
                        )}
                        <span className="font-mono text-sm font-semibold">
                          {result.action}
                        </span>
                      </div>
                      
                      <div className={`text-sm mt-1 ml-6 ${
                        result.success
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {result.message || result.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Loading State */}
          {(isAnalyzing || isExecuting) && (
            <div className="flex items-center justify-center gap-2 py-4">
              <FiLoader className="animate-spin" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isAnalyzing ? 'Analyzing...' : 'Executing commands...'}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
