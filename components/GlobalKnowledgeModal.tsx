'use client';

import React from 'react';
import { Plus, X, Bot } from 'lucide-react';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { useTheme } from 'next-themes';

interface QuickKnowledgeForm {
  title: string;
  category: string;
  tags: string;
  content: string;
}

interface GlobalKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickKnowledgeForm: QuickKnowledgeForm;
  setQuickKnowledgeForm: React.Dispatch<React.SetStateAction<QuickKnowledgeForm>>;
  onSubmit: () => void;
}

const GlobalKnowledgeModalCore: React.FC<GlobalKnowledgeModalProps> = ({
  isOpen,
  onClose,
  quickKnowledgeForm,
  setQuickKnowledgeForm,
  onSubmit
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 overflow-y-auto">
      <div className={`border rounded-xl w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl my-4 ${
        isDark 
          ? 'bg-gray-900/95 border-white/20' 
          : 'bg-white/95 border-gray-300'
      }`}>
        {/* 弹窗头部 - 固定不滚动 */}
        <div className={`flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b shrink-0 ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-400" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>快速添加知识</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-white/10 text-white/70' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="关闭添加知识窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 弹窗内容 - 可滚动区域 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pt-2 sm:pt-3 lg:pt-4 min-h-0">
          <div className="space-y-3 sm:space-y-4">
            {/* 标题输入 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                📚 知识标题 *
              </label>
              <input
                type="text"
                value={quickKnowledgeForm.title}
                onChange={(e) => setQuickKnowledgeForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入知识标题，例如：无人机连接问题解决方案"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/50' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            
            {/* 分类选择 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                📁 知识分类
              </label>
              <select
                value={quickKnowledgeForm.category}
                onChange={(e) => setQuickKnowledgeForm(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="general">通用知识</option>
                <option value="technical">技术文档</option>
                <option value="troubleshooting">故障排除</option>
                <option value="maintenance">维护保养</option>
                <option value="safety">安全规范</option>
                <option value="operation">操作指南</option>
              </select>
            </div>
            
            {/* 标签输入 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                🏷️ 标签 (可选)
              </label>
              <input
                type="text"
                value={quickKnowledgeForm.tags}
                onChange={(e) => setQuickKnowledgeForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="用逗号分隔多个标签，例如：无人机,电池,维护"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/50' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            
            {/* 内容输入 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                📝 知识内容 *
              </label>
              <textarea
                value={quickKnowledgeForm.content}
                onChange={(e) => setQuickKnowledgeForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="请详细描述知识内容，支持Markdown格式。例如：&#10;&#10;1. 检查设备连接状态&#10;2. 确认网络配置&#10;3. 重启相关服务&#10;&#10;**注意事项**：请确保操作安全。"
                rows={6}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical text-sm sm:text-base ${
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/50' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 sm:py-3 rounded-lg border transition-colors text-sm sm:text-base font-medium ${
                  isDark 
                    ? 'border-white/20 text-white/80 hover:bg-white/10' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                取消
              </button>
              <button
                onClick={onSubmit}
                disabled={!quickKnowledgeForm.title.trim() || !quickKnowledgeForm.content.trim()}
                className={`flex-1 px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base font-medium ${
                  !quickKnowledgeForm.title.trim() || !quickKnowledgeForm.content.trim()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                添加知识
              </button>
            </div>
            
            {/* AI集成提示 */}
            <div className={`p-3 sm:p-4 rounded-lg border text-xs sm:text-sm ${
              isDark 
                ? 'bg-blue-600/20 border-blue-600/40' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-2">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className={`text-xs sm:text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                  <div className="font-medium mb-1">🤖 AI集成提示</div>
                  <div>添加的知识将自动集成到AI问答系统中，帮助AI提供更准确的专业答案。请确保知识内容的准确性和完整性。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component that connects to GlobalModalContext
const GlobalKnowledgeModal: React.FC = () => {
  const { 
    showQuickAddKnowledge,
    setShowQuickAddKnowledge,
    quickKnowledgeForm,
    setQuickKnowledgeForm,
    handleQuickAddKnowledge
  } = useGlobalModal();

  return (
    <GlobalKnowledgeModalCore
      isOpen={showQuickAddKnowledge}
      onClose={() => setShowQuickAddKnowledge(false)}
      quickKnowledgeForm={quickKnowledgeForm}
      setQuickKnowledgeForm={setQuickKnowledgeForm}
      onSubmit={handleQuickAddKnowledge}
    />
  );
};

export default GlobalKnowledgeModal;