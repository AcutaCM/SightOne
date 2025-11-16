'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardFooter, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { useAssistants } from '@/contexts/AssistantContext';
import { INTELLIGENT_AGENT_ID } from '@/lib/constants/intelligentAgentPreset';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Rocket, Zap, Shield, Globe } from 'lucide-react';

interface IntelligentAgentCardProps {
  onUseAssistant?: (assistantId: string) => void;
  onSwitchToChat?: () => void;
  showDetailButton?: boolean;
  // Add button functionality (Requirement 2.2)
  showAddButton?: boolean;
  isAdded?: boolean;
  onAdd?: () => void;
}

export const IntelligentAgentCard: React.FC<IntelligentAgentCardProps> = ({ 
  onUseAssistant,
  onSwitchToChat,
  showDetailButton = true,
  showAddButton = false,
  isAdded = false,
  onAdd
}) => {
  const { getAssistantById, activateAssistant, userAssistants, addUserAssistant } = useAssistants();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activating, setActivating] = useState(false);
  const [adding, setAdding] = useState(false);
  const agent = getAssistantById(INTELLIGENT_AGENT_ID);

  if (!agent) return null;

  const handleUseAssistant = async () => {
    try {
      setActivating(true);
      
      // 1. 先添加到用户助理列表（如果还没添加）
      const isAlreadyAdded = userAssistants.some(a => a.id === agent.id);
      
      if (!isAlreadyAdded) {
        console.log('[IntelligentAgentCard] Adding assistant to user list');
        await addUserAssistant(agent);
      } else {
        console.log('[IntelligentAgentCard] Assistant already in user list');
      }
      
      // 2. 激活助理
      const result = await activateAssistant(agent.id);
      
      if (result.success) {
        console.log('[IntelligentAgentCard] Assistant activated successfully');
        
        // 调用外部回调（如果提供）
        if (onUseAssistant) {
          onUseAssistant(agent.id);
        }
        
        // 切换到聊天界面
        if (onSwitchToChat) {
          onSwitchToChat();
        }
      } else {
        console.error('[IntelligentAgentCard] Failed to activate assistant:', result.error);
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('[IntelligentAgentCard] Error activating assistant:', error);
    } finally {
      setActivating(false);
    }
  };

  const handleShowDetail = () => {
    setShowDetailModal(true);
  };

  // Handle add to my assistants (Requirement 2.2)
  const handleAddClick = async () => {
    if (isAdded || adding || !onAdd) return;
    
    try {
      setAdding(true);
      await onAdd();
    } catch (error) {
      console.error('[IntelligentAgentCard] Failed to add assistant:', error);
    } finally {
      setAdding(false);
    }
  };

  // 提取简短描述（前100个字符）
  const shortDesc = agent.desc.split('\n').find(line => line.trim() && !line.startsWith('#')) || 
                    '专业的无人机自然语言控制助手';

  return (
    <>
      <Card 
        className="w-full hover:scale-[1.02] transition-transform duration-200"
        shadow="md"
      >
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            {/* Emoji Icon */}
            <div className="text-5xl flex-shrink-0">
              {agent.emoji}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title with Badge */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold truncate">
                  {agent.title}
                </h3>
                <Chip 
                  size="sm" 
                  color="primary" 
                  variant="flat"
                  startContent={<Rocket className="w-3 h-3" />}
                >
                  系统预设
                </Chip>
              </div>
              
              {/* Description */}
              <p className="text-sm text-default-600 mb-3 line-clamp-2">
                {shortDesc}
              </p>
              
              {/* Feature Highlights */}
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-default-500">
                  <Zap className="w-3 h-3 text-warning" />
                  <span>自然语言控制</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-default-500">
                  <Shield className="w-3 h-3 text-success" />
                  <span>安全保障</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-default-500">
                  <Globe className="w-3 h-3 text-primary" />
                  <span>中英双语</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {agent.tags?.slice(0, 4).map((tag) => (
                  <Chip 
                    key={tag} 
                    size="sm" 
                    variant="flat"
                    color="default"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
        
        <CardFooter className="gap-2 p-4 pt-0">
          {showAddButton ? (
            // Show "Add to My Assistants" button in market view (Requirement 2.2)
            <Button
              color={isAdded ? "default" : "primary"}
              variant={isAdded ? "bordered" : "solid"}
              fullWidth
              onPress={handleAddClick}
              isLoading={adding}
              isDisabled={isAdded || adding}
              startContent={!adding && !isAdded && <Rocket className="w-4 h-4" />}
            >
              {isAdded ? '已添加' : adding ? '添加中...' : '添加到我的助理'}
            </Button>
          ) : (
            <Button
              color="primary"
              variant="solid"
              fullWidth
              onPress={handleUseAssistant}
              isLoading={activating}
              isDisabled={activating}
              startContent={!activating && <Rocket className="w-4 h-4" />}
            >
              {activating ? '正在激活...' : '使用此助理'}
            </Button>
          )}
          {showDetailButton && (
            <Button
              color="default"
              variant="bordered"
              fullWidth
              onPress={handleShowDetail}
              isDisabled={activating || adding}
            >
              查看详情
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Detail Modal */}
      <Modal 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "py-6"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 pb-4 border-b border-divider">
            <span className="text-4xl">{agent.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{agent.title}</h2>
                <Chip 
                  size="sm" 
                  color="primary" 
                  variant="flat"
                  startContent={<Rocket className="w-3 h-3" />}
                >
                  系统预设
                </Chip>
              </div>
              <p className="text-sm text-default-500 font-normal mt-1">
                专业的无人机自然语言控制助手
              </p>
            </div>
          </ModalHeader>
          <ModalBody>
            {/* Full Description with Markdown */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-foreground" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 text-default-700 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-default-700" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-default-700" {...props} />,
                  li: ({node, ...props}) => <li className="text-default-700" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-default-100 text-primary text-sm font-mono" {...props} />
                    ) : (
                      <code className="block p-3 rounded-lg bg-default-100 text-sm font-mono overflow-x-auto" {...props} />
                    ),
                  pre: ({node, ...props}) => <pre className="mb-4 rounded-lg overflow-hidden" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-default-600 my-4" {...props} />
                  ),
                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                }}
              >
                {agent.desc}
              </ReactMarkdown>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">准备好开始了吗？</h4>
                  <p className="text-sm text-default-600 mb-3">
                    点击下方按钮立即启用智能代理，开始用自然语言控制您的Tello无人机。
                  </p>
                  <Button 
                    color="primary" 
                    size="sm"
                    onPress={() => {
                      setShowDetailModal(false);
                      handleUseAssistant();
                    }}
                    startContent={<Rocket className="w-4 h-4" />}
                  >
                    立即使用
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-divider pt-4">
            <Button 
              color="default" 
              variant="light" 
              onPress={() => setShowDetailModal(false)}
            >
              关闭
            </Button>
            <Button 
              color="primary" 
              onPress={() => {
                setShowDetailModal(false);
                handleUseAssistant();
              }}
              startContent={<Rocket className="w-4 h-4" />}
            >
              使用此助理
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
