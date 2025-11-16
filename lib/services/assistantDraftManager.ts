/**
 * 助理草稿管理服务
 * 
 * 功能：
 * - 自动保存表单草稿到 localStorage
 * - 恢复未保存的草稿数据
 * - 自动清理过期草稿（7天）
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
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
  
  // 可见性设置
  isPublic?: boolean;
}

interface DraftData {
  data: AssistantFormData;
  timestamp: string;
}

export interface DraftManager {
  saveDraft(data: AssistantFormData): void;
  loadDraft(): AssistantFormData | null;
  clearDraft(): void;
  hasDraft(): boolean;
  getDraftTimestamp(): Date | null;
  cleanExpiredDrafts(): void;
}

/**
 * 基于 localStorage 的草稿管理器实现
 */
export class LocalStorageDraftManager implements DraftManager {
  private readonly DRAFT_KEY = 'assistant_draft';
  private readonly DRAFT_EXPIRY_DAYS = 7;

  /**
   * 保存草稿到 localStorage
   */
  saveDraft(data: AssistantFormData): void {
    if (typeof window === 'undefined') return;

    try {
      const draft: DraftData = {
        data,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('[DraftManager] Failed to save draft:', error);
    }
  }

  /**
   * 从 localStorage 加载草稿
   * 自动清理过期草稿
   */
  loadDraft(): AssistantFormData | null {
    if (typeof window === 'undefined') return null;

    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) return null;

      const draft: DraftData = JSON.parse(raw);
      const timestamp = new Date(draft.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);

      // 检查是否过期
      if (daysDiff > this.DRAFT_EXPIRY_DAYS) {
        this.clearDraft();
        return null;
      }

      return draft.data;
    } catch (error) {
      console.error('[DraftManager] Failed to load draft:', error);
      return null;
    }
  }

  /**
   * 清除草稿
   */
  clearDraft(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.DRAFT_KEY);
    } catch (error) {
      console.error('[DraftManager] Failed to clear draft:', error);
    }
  }

  /**
   * 检查是否存在有效草稿
   */
  hasDraft(): boolean {
    return this.loadDraft() !== null;
  }

  /**
   * 获取草稿的时间戳
   */
  getDraftTimestamp(): Date | null {
    if (typeof window === 'undefined') return null;

    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) return null;

      const draft: DraftData = JSON.parse(raw);
      return new Date(draft.timestamp);
    } catch (error) {
      console.error('[DraftManager] Failed to get draft timestamp:', error);
      return null;
    }
  }

  /**
   * 清理过期草稿
   * 通过调用 loadDraft 自动触发清理逻辑
   */
  cleanExpiredDrafts(): void {
    this.loadDraft();
  }
}

// 导出单例实例
export const draftManager = new LocalStorageDraftManager();
