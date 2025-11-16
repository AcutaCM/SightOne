'use client';

import React, { useState, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Progress } from "@heroui/progress";
import { Card, CardBody } from "@heroui/card";
import { useTheme } from "next-themes";
import { Sparkles, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { getModalPanelStyle } from '@/lib/panel-styles';

interface AIWorkflowGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (nodes: Node[], edges: Edge[]) => void;
}

type GenerationStage = 'input' | 'generating' | 'preview' | 'error';

interface GenerationProgress {
  stage: string;
  progress: number;
  message: string;
}

const AIWorkflowGeneratorModal: React.FC<AIWorkflowGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [userInput, setUserInput] = useState('');
  const [stage, setStage] = useState<GenerationStage>('input');
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: '',
    progress: 0,
    message: '',
  });
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // 示例提示
  const examplePrompts = [
    '让无人机起飞，前进100cm，拍照，然后降落',
    '执行8字飞行，然后进行草莓检测',
    '起飞后悬停3秒，扫描QR码，如果检测到则降落，否则继续前进',
  ];

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      return;
    }

    setStage('generating');
    setProgress({ stage: '理解需求', progress: 20, message: '正在分析您的描述...' });

    try {
      // 调用AI生成服务
      const response = await fetch('/api/workflow/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`生成失败: ${response.statusText}`);
      }

      setProgress({ stage: '生成节点', progress: 50, message: '正在创建工作流节点...' });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '生成失败');
      }

      setProgress({ stage: '优化布局', progress: 80, message: '正在优化节点布局...' });

      // 模拟布局优化延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress({ stage: '完成', progress: 100, message: '工作流生成完成！' });

      // 设置生成的节点和边
      setGeneratedNodes(data.nodes || []);
      setGeneratedEdges(data.edges || []);

      // 切换到预览阶段
      setTimeout(() => {
        setStage('preview');
      }, 500);

    } catch (error: any) {
      console.error('工作流生成失败:', error);
      setErrorMessage(error.message || '生成失败，请重试');
      setStage('error');
    }
  };

  const handleApply = () => {
    onGenerate(generatedNodes, generatedEdges);
    handleClose();
  };

  const handleRegenerate = () => {
    setStage('input');
    setProgress({ stage: '', progress: 0, message: '' });
    setGeneratedNodes([]);
    setGeneratedEdges([]);
    setErrorMessage('');
  };

  const handleClose = () => {
    setUserInput('');
    setStage('input');
    setProgress({ stage: '', progress: 0, message: '' });
    setGeneratedNodes([]);
    setGeneratedEdges([]);
    setErrorMessage('');
    onClose();
  };

  const handleExampleClick = (example: string) => {
    setUserInput(example);
  };

  const modalStyle = useMemo(() => {
    const currentTheme = (theme || resolvedTheme) as 'light' | 'dark' | undefined;
    return getModalPanelStyle(currentTheme === 'light' ? 'light' : 'dark');
  }, [theme, resolvedTheme]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        header: "border-b border-divider",
        body: "py-6",
        footer: "border-t border-divider",
      }}
    >
      <ModalContent style={modalStyle}>
        <ModalHeader className="flex items-center gap-2">
          <Sparkles className="text-primary" size={24} />
          <span>AI工作流生成器</span>
        </ModalHeader>

        <ModalBody>
          {/* 输入阶段 */}
          {stage === 'input' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground-600 mb-2">
                  用自然语言描述您想要的无人机任务流程，AI将自动为您生成工作流。
                </p>
              </div>

              <Textarea
                label="任务描述"
                placeholder="例如：让无人机起飞，前进100cm，拍照，然后降落"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                minRows={4}
                maxRows={8}
                classNames={{
                  input: "text-base",
                }}
              />

              {/* 示例提示 */}
              <div>
                <p className="text-xs text-foreground-500 mb-2">示例：</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => handleExampleClick(example)}
                      className="text-xs"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 提示信息 */}
              <Card className="bg-primary/10 border border-primary/20">
                <CardBody className="py-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-foreground-700">
                      <p className="font-medium mb-1">提示：</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>描述要清晰具体，包含动作和参数</li>
                        <li>可以使用条件判断，如"如果...则..."</li>
                        <li>支持循环操作，如"重复3次"</li>
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* 生成中阶段 */}
          {stage === 'generating' && (
            <div className="space-y-6 py-8">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="text-primary animate-spin mb-4" size={48} />
                <h3 className="text-lg font-medium mb-2">{progress.stage}</h3>
                <p className="text-sm text-foreground-600 mb-4">{progress.message}</p>
              </div>

              <Progress
                value={progress.progress}
                color="primary"
                className="max-w-md mx-auto"
                size="sm"
              />

              <div className="text-center">
                <p className="text-xs text-foreground-500">
                  正在使用AI分析您的需求并生成工作流...
                </p>
              </div>
            </div>
          )}

          {/* 预览阶段 */}
          {stage === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle size={20} />
                <span className="font-medium">工作流生成成功！</span>
              </div>

              <Card className="bg-content2">
                <CardBody className="p-2">
                  <div className="h-[400px] bg-background rounded-lg overflow-hidden">
                    <ReactFlow
                      nodes={generatedNodes}
                      edges={generatedEdges}
                      fitView
                      attributionPosition="bottom-left"
                      proOptions={{ hideAttribution: true }}
                      nodesDraggable={false}
                      nodesConnectable={false}
                      elementsSelectable={false}
                    />
                  </div>
                </CardBody>
              </Card>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-content2 rounded-lg p-3">
                  <p className="text-foreground-600 mb-1">节点数量</p>
                  <p className="text-2xl font-bold text-primary">{generatedNodes.length}</p>
                </div>
                <div className="bg-content2 rounded-lg p-3">
                  <p className="text-foreground-600 mb-1">连接数量</p>
                  <p className="text-2xl font-bold text-primary">{generatedEdges.length}</p>
                </div>
              </div>

              <Card className="bg-warning/10 border border-warning/20">
                <CardBody className="py-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground-700">
                      生成的工作流已经过优化，您可以在应用后继续编辑和调整节点参数。
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* 错误阶段 */}
          {stage === 'error' && (
            <div className="space-y-4 py-8">
              <div className="flex flex-col items-center justify-center">
                <XCircle className="text-danger mb-4" size={48} />
                <h3 className="text-lg font-medium mb-2">生成失败</h3>
                <p className="text-sm text-foreground-600 text-center max-w-md">
                  {errorMessage}
                </p>
              </div>

              <Card className="bg-danger/10 border border-danger/20">
                <CardBody className="py-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-danger mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-foreground-700">
                      <p className="font-medium mb-1">可能的原因：</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>描述不够清晰或包含不支持的操作</li>
                        <li>AI服务暂时不可用</li>
                        <li>网络连接问题</li>
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {stage === 'input' && (
            <>
              <Button variant="light" onPress={handleClose}>
                取消
              </Button>
              <Button
                color="primary"
                onPress={handleGenerate}
                isDisabled={!userInput.trim()}
                startContent={<Sparkles size={16} />}
              >
                生成工作流
              </Button>
            </>
          )}

          {stage === 'generating' && (
            <Button variant="light" onPress={handleClose}>
              取消
            </Button>
          )}

          {stage === 'preview' && (
            <>
              <Button variant="light" onPress={handleRegenerate}>
                重新生成
              </Button>
              <Button color="primary" onPress={handleApply}>
                应用到画布
              </Button>
            </>
          )}

          {stage === 'error' && (
            <>
              <Button variant="light" onPress={handleClose}>
                关闭
              </Button>
              <Button color="primary" onPress={handleRegenerate}>
                重试
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AIWorkflowGeneratorModal;
