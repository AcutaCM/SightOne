'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Keyboard, Mouse, Zap, Info } from 'lucide-react';
import { Tooltip } from '@heroui/react';

/**
 * WorkflowHelp Component
 * 
 * 提供工作流系统的上下文帮助和快捷键指南
 * 
 * Requirements: 8.5 - 提供上下文帮助
 */

interface HelpSection {
  title: string;
  icon: React.ReactNode;
  items: Array<{
    label: string;
    description: string;
    shortcut?: string;
  }>;
}

const helpSections: HelpSection[] = [
  {
    title: '键盘快捷键',
    icon: <Keyboard size={18} />,
    items: [
      {
        label: '空格键',
        description: '折叠/展开选中的节点',
        shortcut: 'Space'
      },
      {
        label: 'Enter',
        description: '保存参数编辑',
        shortcut: 'Enter'
      },
      {
        label: 'Esc',
        description: '取消参数编辑',
        shortcut: 'Esc'
      },
      {
        label: 'Tab',
        description: '在参数间导航',
        shortcut: 'Tab'
      },
      {
        label: 'Delete',
        description: '删除选中的节点',
        shortcut: 'Del'
      },
    ]
  },
  {
    title: '鼠标操作',
    icon: <Mouse size={18} />,
    items: [
      {
        label: '点击参数',
        description: '进入编辑模式'
      },
      {
        label: '拖动节点',
        description: '移动节点位置'
      },
      {
        label: '拖动连接点',
        description: '创建节点连接'
      },
      {
        label: '拖动右下角',
        description: '调整节点大小'
      },
      {
        label: '双击画布',
        description: '添加新节点'
      },
    ]
  },
  {
    title: '节点操作',
    icon: <Zap size={18} />,
    items: [
      {
        label: '折叠按钮',
        description: '隐藏/显示参数列表'
      },
      {
        label: '高级设置',
        description: '打开详细配置面板'
      },
      {
        label: '参数徽章',
        description: '显示参数数量（折叠时）'
      },
      {
        label: '错误图标',
        description: '指示未配置的必填参数'
      },
      {
        label: '状态指示器',
        description: '显示节点运行状态'
      },
    ]
  },
  {
    title: '参数编辑',
    icon: <Info size={18} />,
    items: [
      {
        label: '必填参数',
        description: '标有红色星号(*)的参数必须填写'
      },
      {
        label: '参数验证',
        description: '输入错误时会显示红色边框和提示'
      },
      {
        label: '自动保存',
        description: '失焦时自动保存参数值'
      },
      {
        label: '保存指示器',
        description: '显示保存状态（加载中/成功）'
      },
      {
        label: '参数描述',
        description: '悬停查看详细说明和类型信息'
      },
    ]
  }
];

interface WorkflowHelpProps {
  /** 是否默认打开 */
  defaultOpen?: boolean;
  /** 自定义位置 */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const WorkflowHelp: React.FC<WorkflowHelpProps> = ({
  defaultOpen = false,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const positionStyles = {
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
  };

  return (
    <>
      {/* 帮助按钮 */}
      <Tooltip
        content={
          <div style={{ padding: '4px 8px' }}>
            <div style={{ fontWeight: 600 }}>帮助</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
              查看快捷键和操作指南
            </div>
          </div>
        }
        placement="left"
        delay={500}
        closeDelay={0}
        classNames={{
          base: 'max-w-xs',
          content: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg'
        }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="打开帮助面板"
          style={{
            position: 'fixed',
            ...positionStyles[position],
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            transition: 'all 0.3s ease',
          }}
        >
          <HelpCircle size={24} color="white" />
        </motion.button>
      </Tooltip>

      {/* 帮助面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              bottom: position.includes('bottom') ? 80 : 'auto',
              top: position.includes('top') ? 80 : 'auto',
              right: position.includes('right') ? 20 : 'auto',
              left: position.includes('left') ? 20 : 'auto',
              width: 420,
              maxHeight: '80vh',
              background: 'var(--node-bg)',
              border: '2px solid var(--node-border)',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              zIndex: 1001,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 头部 */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--node-divider)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--node-header-bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <HelpCircle size={24} color="var(--text-primary)" />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: 18, 
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  工作流帮助
                </h3>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="关闭帮助面板"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--param-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} color="var(--text-secondary)" />
              </motion.button>
            </div>

            {/* 内容区域 */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
              }}
              className="custom-scrollbar"
            >
              {helpSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  style={{
                    marginBottom: 24,
                  }}
                >
                  {/* 分组标题 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 12,
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </div>

                  {/* 帮助项列表 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'var(--param-bg)',
                          border: '1px solid var(--param-border)',
                          borderRadius: 6,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--param-bg-hover)';
                          e.currentTarget.style.borderColor = 'var(--param-border-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--param-bg)';
                          e.currentTarget.style.borderColor = 'var(--param-border)';
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: 'var(--text-primary)',
                              marginBottom: 2,
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--text-secondary)',
                              lineHeight: 1.4,
                            }}
                          >
                            {item.description}
                          </div>
                        </div>
                        {item.shortcut && (
                          <div
                            style={{
                              padding: '4px 8px',
                              background: 'var(--node-bg)',
                              border: '1px solid var(--node-border)',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: 'monospace',
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              marginLeft: 12,
                            }}
                          >
                            {item.shortcut}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* 底部提示 */}
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>提示：</strong>
                将鼠标悬停在任何按钮或参数上，可以查看详细的工具提示说明。
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkflowHelp;
