/**
 * 助理表单验证工具
 * 
 * 功能：
 * - 定义各字段的验证规则
 * - 提供实时验证和批量验证方法
 * - 生成中文错误消息
 * - 数据映射工具函数
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 10.1, 10.2, 10.3, 10.4
 */

import { Assistant } from '@/types/assistant';

/**
 * 助理表单数据接口（扩展版）
 */
export interface AssistantFormData {
  // 助手信息
  avatarUrl?: string;
  avatarEmoji?: string;
  avatarBg?: string;
  name: string;
  description: string;
  tags?: string;
  
  // 角色设定
  systemPrompt: string;
  
  // 开场设置
  openingMessage?: string;
  openingQuestions?: string;
  
  // 聊天偏好
  preprocessTemplate?: string;
  autoCreateTopic?: boolean;
  autoCreateTopicThreshold?: number;
  historyLimit?: number;
  attachCount?: number;
  enableAutoSummary?: boolean;
  
  // 模型设置
  stream?: boolean;
  creativity?: number;
  openness?: number;
  divergence?: number;
  vocabulary?: number;
  singleReplyLimitEnabled?: boolean;
  singleReplyLimit?: number;
  reasoningStrengthEnabled?: boolean;
  reasoningStrength?: number;
  
  // UniPixel-3B 配置
  unipixelEnabled?: boolean;
  unipixelMode?: 'local' | 'cloud';
  unipixelEndpoint?: string;
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  field: keyof AssistantFormData;
  message: string;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * 验证规则配置
 */
export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 50,
    message: '助理名称为1-50个字符'
  },
  description: {
    required: false,
    maxLength: 500,
    message: '描述不能超过500个字符'
  },
  systemPrompt: {
    required: false,
    maxLength: Number.MAX_SAFE_INTEGER, // 不限制字符数
    message: '系统提示词无字符限制'
  }
} as const;

/**
 * 验证助理名称
 * Requirements: 6.1, 6.2
 */
export function validateName(value: string): string | null {
  const rules = VALIDATION_RULES.name;
  
  if (rules.required && !value.trim()) {
    return '助理名称不能为空';
  }
  
  if (value.length < rules.minLength) {
    return rules.message;
  }
  
  if (value.length > rules.maxLength) {
    return `助理名称不能超过${rules.maxLength}个字符`;
  }
  
  return null;
}

/**
 * 验证描述
 * Requirements: 6.3
 */
export function validateDescription(value: string): string | null {
  const rules = VALIDATION_RULES.description;
  
  if (!value) {
    return null; // 描述是可选的
  }
  
  if (value.length > rules.maxLength) {
    return `描述不能超过${rules.maxLength}个字符`;
  }
  
  return null;
}

/**
 * 验证系统提示词
 * Requirements: 6.4
 */
export function validateSystemPrompt(value: string): string | null {
  const rules = VALIDATION_RULES.systemPrompt;
  
  if (!value) {
    return null; // 系统提示词是可选的
  }
  
  if (value.length > rules.maxLength) {
    return `系统提示词不能超过${rules.maxLength}个字符`;
  }
  
  return null;
}

/**
 * 验证整个表单
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function validateAssistantForm(formData: AssistantFormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // 验证必填字段
  const nameError = validateName(formData.name);
  if (nameError) {
    errors.name = nameError;
  }
  
  // 验证可选字段
  const descError = validateDescription(formData.description);
  if (descError) {
    errors.description = descError;
  }
  
  const promptError = validateSystemPrompt(formData.systemPrompt);
  if (promptError) {
    errors.systemPrompt = promptError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 获取字段的字符计数信息
 * Requirements: 7.2
 */
export function getCharacterCount(
  field: 'name' | 'description' | 'systemPrompt',
  value: string
): { current: number; max: number } {
  const rules = VALIDATION_RULES[field];
  
  if ('maxLength' in rules && typeof rules.maxLength === 'number') {
    return {
      current: value.length,
      max: rules.maxLength
    };
  }
  
  return { current: value.length, max: 0 };
}

// ============================================================================
// Data Mapping Functions
// ============================================================================

/**
 * 将表单数据转换为 Assistant 对象
 * Requirements: 10.1, 10.2
 */
export function formDataToAssistant(
  formData: AssistantFormData,
  existingAssistant?: Assistant
): Omit<Assistant, 'id' | 'createdAt' | 'version'> {
  return {
    title: formData.name,
    desc: formData.description,
    emoji: formData.avatarEmoji || '🤖',
    prompt: formData.systemPrompt,
    isPublic: existingAssistant?.isPublic || false,
    status: existingAssistant?.status || 'draft',
    author: existingAssistant?.author || 'current-user',
    updatedAt: new Date(),
    
    // 扩展字段 - 将所有配置存储在 tags 中（作为 JSON）
    tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
    
    // 注意：由于当前 Assistant 类型不支持所有扩展字段，
    // 这些字段可能需要在未来的类型扩展中添加
    // 或者通过其他方式存储（如 metadata 字段）
  };
}

/**
 * 将 Assistant 对象转换为表单数据
 * Requirements: 10.3, 10.4
 */
export function assistantToFormData(
  assistant: Assistant | null
): AssistantFormData {
  if (!assistant) {
    // 返回默认值
    return {
      name: '',
      description: '',
      systemPrompt: '',
      avatarEmoji: '🤖',
      avatarBg: '#3b82f6',
      tags: '',
      
      // 聊天偏好默认值
      autoCreateTopic: false,
      autoCreateTopicThreshold: 20,
      historyLimit: 50,
      attachCount: 20,
      enableAutoSummary: false,
      
      // 模型设置默认值
      stream: true,
      creativity: 0.7,
      openness: 1.0,
      divergence: 1.0,
      vocabulary: 1.0,
      singleReplyLimitEnabled: false,
      singleReplyLimit: 2048,
      reasoningStrengthEnabled: false,
      reasoningStrength: 1,
      
      // UniPixel 配置默认值
      unipixelEnabled: false,
      unipixelMode: 'cloud',
    };
  }
  
  return {
    // 助手信息
    avatarEmoji: assistant.emoji,
    avatarBg: '#3b82f6', // 默认背景色
    name: assistant.title,
    description: assistant.desc,
    tags: assistant.tags?.join(', ') || '',
    
    // 角色设定
    systemPrompt: assistant.prompt,
    
    // 开场设置 - 从扩展字段获取（如果存在）
    openingMessage: undefined,
    openingQuestions: undefined,
    
    // 聊天偏好 - 使用默认值
    preprocessTemplate: undefined,
    autoCreateTopic: false,
    autoCreateTopicThreshold: 20,
    historyLimit: 50,
    attachCount: 20,
    enableAutoSummary: false,
    
    // 模型设置 - 使用默认值
    stream: true,
    creativity: 0.7,
    openness: 1.0,
    divergence: 1.0,
    vocabulary: 1.0,
    singleReplyLimitEnabled: false,
    singleReplyLimit: 2048,
    reasoningStrengthEnabled: false,
    reasoningStrength: 1,
    
    // UniPixel 配置 - 使用默认值
    unipixelEnabled: false,
    unipixelMode: 'cloud',
    unipixelEndpoint: undefined,
  };
}

/**
 * 创建空白表单数据
 * Requirements: 10.4
 */
export function createEmptyFormData(): AssistantFormData {
  return assistantToFormData(null);
}

/**
 * 检查表单是否有任何修改
 */
export function isFormDirty(
  current: AssistantFormData,
  initial: AssistantFormData
): boolean {
  // 比较核心字段
  if (
    current.name !== initial.name ||
    current.description !== initial.description ||
    current.systemPrompt !== initial.systemPrompt ||
    current.avatarEmoji !== initial.avatarEmoji ||
    current.avatarBg !== initial.avatarBg ||
    current.tags !== initial.tags
  ) {
    return true;
  }
  
  // 比较开场设置
  if (
    current.openingMessage !== initial.openingMessage ||
    current.openingQuestions !== initial.openingQuestions
  ) {
    return true;
  }
  
  // 比较聊天偏好
  if (
    current.preprocessTemplate !== initial.preprocessTemplate ||
    current.autoCreateTopic !== initial.autoCreateTopic ||
    current.autoCreateTopicThreshold !== initial.autoCreateTopicThreshold ||
    current.historyLimit !== initial.historyLimit ||
    current.attachCount !== initial.attachCount ||
    current.enableAutoSummary !== initial.enableAutoSummary
  ) {
    return true;
  }
  
  // 比较模型设置
  if (
    current.stream !== initial.stream ||
    current.creativity !== initial.creativity ||
    current.openness !== initial.openness ||
    current.divergence !== initial.divergence ||
    current.vocabulary !== initial.vocabulary ||
    current.singleReplyLimitEnabled !== initial.singleReplyLimitEnabled ||
    current.singleReplyLimit !== initial.singleReplyLimit ||
    current.reasoningStrengthEnabled !== initial.reasoningStrengthEnabled ||
    current.reasoningStrength !== initial.reasoningStrength
  ) {
    return true;
  }
  
  // 比较 UniPixel 配置
  if (
    current.unipixelEnabled !== initial.unipixelEnabled ||
    current.unipixelMode !== initial.unipixelMode ||
    current.unipixelEndpoint !== initial.unipixelEndpoint
  ) {
    return true;
  }
  
  return false;
}
