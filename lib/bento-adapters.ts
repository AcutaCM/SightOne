import React from 'react';
import { BentoItem } from '@/components/ui/bento-grid';
import { 
  Bot, 
  Code, 
  PenTool, 
  BarChart3, 
  Languages, 
  Lightbulb,
  Brain,
  Zap,
  Globe,
  Building,
  Cpu,
  MessageSquare,
  Sparkles,
  Target,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

// 助理数据类型
interface AssistantData {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  prompt?: string;
  tags?: string[];
  status?: string;
  author?: string;
}

// 图标映射 - 根据助理标题或标签选择合适的图标
const getAssistantIcon = (assistant: AssistantData) => {
  const title = assistant.title.toLowerCase();
  const tags = (assistant.tags || []).map(t => t.toLowerCase());
  
  // 根据标题关键词匹配图标
  if (title.includes('代码') || title.includes('code') || tags.includes('code')) {
    return React.createElement(Code, { className: "w-4 h-4 text-green-500" });
  }
  if (title.includes('写作') || title.includes('writing') || tags.includes('writing')) {
    return React.createElement(PenTool, { className: "w-4 h-4 text-purple-500" });
  }
  if (title.includes('数据') || title.includes('分析') || title.includes('data') || tags.includes('data')) {
    return React.createElement(BarChart3, { className: "w-4 h-4 text-orange-500" });
  }
  if (title.includes('翻译') || title.includes('translator') || tags.includes('translator')) {
    return React.createElement(Languages, { className: "w-4 h-4 text-red-500" });
  }
  if (title.includes('创意') || title.includes('creative') || tags.includes('creative')) {
    return React.createElement(Lightbulb, { className: "w-4 h-4 text-yellow-500" });
  }
  if (title.includes('tello') || title.includes('智能代理') || tags.includes('agent')) {
    return React.createElement(Zap, { className: "w-4 h-4 text-blue-500" });
  }
  if (title.includes('海龟汤') || title.includes('游戏') || tags.includes('game')) {
    return React.createElement(Target, { className: "w-4 h-4 text-pink-500" });
  }
  if (title.includes('图像') || title.includes('image') || title.includes('视觉') || tags.includes('vision')) {
    return React.createElement(ImageIcon, { className: "w-4 h-4 text-indigo-500" });
  }
  if (title.includes('文档') || title.includes('document') || tags.includes('document')) {
    return React.createElement(FileText, { className: "w-4 h-4 text-gray-500" });
  }
  
  // 默认图标
  return React.createElement(Bot, { className: "w-4 h-4 text-blue-500" });
};

// 获取助理状态显示文本
const getAssistantStatus = (assistant: AssistantData) => {
  if (assistant.status === 'published') return '已发布';
  if (assistant.status === 'draft') return '草稿';
  if (assistant.status === 'pending') return '待审核';
  if (assistant.status === 'rejected') return '已拒绝';
  return '可用';
};

// 获取助理标签
const getAssistantTags = (assistant: AssistantData) => {
  if (assistant.tags && assistant.tags.length > 0) {
    return assistant.tags.slice(0, 3); // 最多显示3个标签
  }
  
  // 根据标题自动生成标签
  const title = assistant.title.toLowerCase();
  const autoTags: string[] = [];
  
  if (title.includes('代码') || title.includes('code')) autoTags.push('编程');
  if (title.includes('写作') || title.includes('writing')) autoTags.push('写作');
  if (title.includes('翻译') || title.includes('translator')) autoTags.push('翻译');
  if (title.includes('数据') || title.includes('分析')) autoTags.push('数据');
  if (title.includes('创意') || title.includes('creative')) autoTags.push('创意');
  if (title.includes('智能') || title.includes('ai')) autoTags.push('AI');
  
  return autoTags.length > 0 ? autoTags : ['助手'];
};

// 将助理数据转换为 Bento Grid 项目
export const assistantsToBentoItems = (
  assistants: AssistantData[],
  onSelect?: (assistant: AssistantData) => void
): BentoItem[] => {
  return assistants.map((assistant, index) => ({
    title: assistant.title,
    description: assistant.desc || '暂无描述',
    icon: getAssistantIcon(assistant),
    status: getAssistantStatus(assistant),
    tags: getAssistantTags(assistant),
    meta: assistant.author || '',
    cta: '使用 →',
    colSpan: index === 0 ? 2 : 1, // 第一个助理占两列
    hasPersistentHover: index === 0, // 高亮第一个助理
    onClick: () => onSelect?.(assistant),
  }));
};

// 模型数据类型
interface ModelData {
  key: string;
  name: string;
  desc: string;
  emoji: string;
}

// 获取模型图标
const getModelIcon = (model: ModelData) => {
  const name = model.name.toLowerCase();
  
  if (name.includes('gpt-4')) return React.createElement(Brain, { className: "w-4 h-4 text-green-500" });
  if (name.includes('gpt-3')) return React.createElement(Bot, { className: "w-4 h-4 text-blue-500" });
  if (name.includes('claude')) return React.createElement(MessageSquare, { className: "w-4 h-4 text-purple-500" });
  if (name.includes('gemini')) return React.createElement(Sparkles, { className: "w-4 h-4 text-orange-500" });
  if (name.includes('llama')) return React.createElement(Bot, { className: "w-4 h-4 text-red-500" });
  if (name.includes('mistral')) return React.createElement(Cpu, { className: "w-4 h-4 text-indigo-500" });
  if (name.includes('qwen')) return React.createElement(Globe, { className: "w-4 h-4 text-red-600" });
  if (name.includes('deepseek')) return React.createElement(Brain, { className: "w-4 h-4 text-purple-600" });
  
  return React.createElement(Bot, { className: "w-4 h-4 text-gray-500" });
};

// 获取模型标签
const getModelTags = (model: ModelData) => {
  const name = model.name.toLowerCase();
  const tags: string[] = [];
  
  if (name.includes('gpt-4')) tags.push('高级', '推理');
  else if (name.includes('gpt-3')) tags.push('快速', '经济');
  if (name.includes('turbo')) tags.push('快速');
  if (name.includes('vision')) tags.push('视觉');
  if (name.includes('mini')) tags.push('轻量');
  
  return tags.length > 0 ? tags : ['AI', '模型'];
};

// 将模型数据转换为 Bento Grid 项目
export const modelsToBentoItems = (
  models: ModelData[],
  onSelect?: (model: ModelData) => void
): BentoItem[] => {
  return models.map((model, index) => ({
    title: model.name,
    description: model.desc || '暂无描述',
    icon: getModelIcon(model),
    status: '可用',
    tags: getModelTags(model),
    meta: model.key,
    cta: '选择 →',
    colSpan: 1,
    hasPersistentHover: false,
    onClick: () => onSelect?.(model),
  }));
};

// 服务商数据类型
interface ProviderData {
  key: string;
  name: string;
  desc: string;
  emoji: string;
}

// 获取服务商图标
const getProviderIcon = (provider: ProviderData) => {
  const key = provider.key.toLowerCase();
  
  if (key.includes('openai')) return React.createElement(Brain, { className: "w-4 h-4 text-green-500" });
  if (key.includes('anthropic')) return React.createElement(MessageSquare, { className: "w-4 h-4 text-purple-500" });
  if (key.includes('google') || key.includes('gemini')) return React.createElement(Globe, { className: "w-4 h-4 text-blue-500" });
  if (key.includes('azure')) return React.createElement(Building, { className: "w-4 h-4 text-blue-600" });
  if (key.includes('mistral')) return React.createElement(Zap, { className: "w-4 h-4 text-orange-500" });
  if (key.includes('ollama')) return React.createElement(Cpu, { className: "w-4 h-4 text-gray-600" });
  if (key.includes('qwen') || key.includes('阿里')) return React.createElement(Globe, { className: "w-4 h-4 text-red-600" });
  if (key.includes('deepseek')) return React.createElement(Brain, { className: "w-4 h-4 text-purple-600" });
  
  return React.createElement(Building, { className: "w-4 h-4 text-gray-500" });
};

// 获取服务商标签
const getProviderTags = (provider: ProviderData) => {
  const key = provider.key.toLowerCase();
  const tags: string[] = [];
  
  if (key.includes('openai')) tags.push('领先', 'GPT');
  if (key.includes('anthropic')) tags.push('安全', 'Claude');
  if (key.includes('google')) tags.push('搜索', '企业');
  if (key.includes('azure')) tags.push('企业', '云服务');
  if (key.includes('ollama')) tags.push('本地', '开源');
  if (key.includes('qwen')) tags.push('中文', '阿里');
  if (key.includes('deepseek')) tags.push('推理', '性价比');
  
  return tags.length > 0 ? tags : ['AI', '服务商'];
};

// 将服务商数据转换为 Bento Grid 项目
export const providersToBentoItems = (
  providers: ProviderData[],
  onSelect?: (provider: ProviderData) => void
): BentoItem[] => {
  return providers.map((provider) => ({
    title: provider.name,
    description: provider.desc || '暂无描述',
    icon: getProviderIcon(provider),
    status: '活跃',
    tags: getProviderTags(provider),
    meta: provider.key,
    cta: '连接 →',
    colSpan: 1,
    hasPersistentHover: false,
    onClick: () => onSelect?.(provider),
  }));
};

// 插件数据类型
interface PluginData {
  key: string;
  title: string;
  desc: string;
  emoji: string;
}

// 获取插件图标
const getPluginIcon = (plugin: PluginData) => {
  const title = plugin.title.toLowerCase();
  
  if (title.includes('code') || title.includes('代码')) return React.createElement(Code, { className: "w-4 h-4 text-green-500" });
  if (title.includes('image') || title.includes('图像')) return React.createElement(ImageIcon, { className: "w-4 h-4 text-purple-500" });
  if (title.includes('data') || title.includes('数据')) return React.createElement(BarChart3, { className: "w-4 h-4 text-orange-500" });
  if (title.includes('translate') || title.includes('翻译')) return React.createElement(Languages, { className: "w-4 h-4 text-red-500" });
  
  return React.createElement(Zap, { className: "w-4 h-4 text-blue-500" });
};

// 将插件数据转换为 Bento Grid 项目
export const pluginsToBentoItems = (
  plugins: PluginData[],
  onInstall?: (plugin: PluginData) => void
): BentoItem[] => {
  return plugins.map((plugin) => ({
    title: plugin.title,
    description: plugin.desc || '暂无描述',
    icon: getPluginIcon(plugin),
    status: '可安装',
    tags: ['插件'],
    meta: plugin.key,
    cta: '安装 →',
    colSpan: 1,
    hasPersistentHover: false,
    onClick: () => onInstall?.(plugin),
  }));
};
