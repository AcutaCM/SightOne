'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { assistantApiClient } from '@/lib/api/assistantApiClient';
import { Assistant } from '@/types/assistant';
import { PRESET_ASSISTANTS } from '@/lib/constants/presetAssistants';
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AssistantFormData, formDataToAssistant } from '@/lib/utils/assistantFormValidation';
import { recentAssistantsService } from '@/lib/services/recentAssistantsService';

// Helper functions for preset protection
const isSystemPreset = (assistant: Assistant | null | undefined): boolean => {
  if (!assistant) return false;
  return assistant.author === 'system';
};

const canDeleteAssistant = (assistant: Assistant | null | undefined, isAdmin: boolean = false) => {
  if (!assistant) return { allowed: false, reason: '助理不存在' };
  if (isSystemPreset(assistant) && !isAdmin) {
    return { allowed: false, reason: '系统预设助理不能被删除' };
  }
  return { allowed: true };
};

const canModifyAssistant = (assistant: Assistant | null | undefined, isAdmin: boolean = false) => {
  if (!assistant) return { allowed: false, reason: '助理不存在' };
  if (isSystemPreset(assistant) && !isAdmin) {
    return { allowed: false, reason: '系统预设助理不能被修改' };
  }
  return { allowed: true };
};

const getProtectionMessage = (assistant: Assistant | null | undefined): string | null => {
  if (!assistant) return null;
  if (isSystemPreset(assistant)) {
    return '🔒 系统预设助理 - 受保护不可删除或修改';
  }
  return null;
};

interface AssistantContextType {
  assistantList: Assistant[];
  setAssistantList: React.Dispatch<React.SetStateAction<Assistant[]>>;
  publishedAssistants: Assistant[];
  pendingAssistants: Assistant[];
  updateAssistantStatus: (id: string, status: Assistant['status'], reviewNote?: string) => Promise<void>;
  // Enhanced to support both AssistantFormData and legacy format (Requirements: 2.1, 2.2, 9.1, 10.1, 10.2)
  addAssistant: (assistant: Omit<Assistant, 'id' | 'createdAt' | 'version'> | AssistantFormData) => Promise<Assistant>;
  updateAssistant: (id: string, updates: Partial<Assistant>) => Promise<void>;
  deleteAssistant: (id: string) => Promise<void>;
  refreshAssistants: () => Promise<void>;
  clearCache: () => Promise<void>;
  getAssistantById: (id: string) => Assistant | undefined;
  activateAssistant: (id: string, options?: { switchToChat?: boolean; showWelcome?: boolean }) => Promise<{ success: boolean; assistant?: Assistant; error?: string }>;
  activeAssistantId: string | null;
  activeAssistant: Assistant | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  hasVersionConflict: (error: Error) => boolean;
  // Preset protection methods
  isSystemPreset: (assistant: Assistant | null | undefined) => boolean;
  canDeleteAssistant: (assistant: Assistant | null | undefined, isAdmin?: boolean) => { allowed: boolean; reason?: string };
  canModifyAssistant: (assistant: Assistant | null | undefined, isAdmin?: boolean) => { allowed: boolean; reason?: string };
  getProtectionMessage: (assistant: Assistant | null | undefined) => string | null;
  // Sidebar control methods (Requirements: 1.4, 2.4, 2.5, 5.2)
  openCreateSidebar: () => void;
  openEditSidebar: (assistantId: string) => void;
  sidebarState: {
    visible: boolean;
    mode: 'create' | 'edit';
    assistant: Assistant | null;
  };
  closeSidebar: () => void;
  // User assistant management (Requirements: 2.2, 2.3, 2.4)
  userAssistants: Assistant[];
  marketAssistants: Assistant[];
  addUserAssistant: (assistant: Assistant) => Promise<void>;
  removeUserAssistant: (assistantId: string) => Promise<void>;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assistantList, setAssistantList] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationChecked, setMigrationChecked] = useState(false);
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null);
  
  // User assistant management state (Requirements: 2.2, 2.3, 2.4)
  const [userAssistants, setUserAssistants] = useState<Assistant[]>([]);
  
  // Get current user for permission checks (Requirement 7.1, 7.2, 7.3, 7.4)
  const currentUser = useCurrentUser();
  
  // Sidebar state (Requirements: 1.4, 2.4, 2.5, 5.2)
  const [sidebarState, setSidebarState] = useState<{
    visible: boolean;
    mode: 'create' | 'edit';
    assistant: Assistant | null;
  }>({
    visible: false,
    mode: 'create',
    assistant: null,
  });

  // Load user assistants from localStorage (Requirement 2.4)
  const loadUserAssistants = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('userAssistants');
      if (stored) {
        const assistantIds: string[] = JSON.parse(stored);
        console.log(`[AssistantContext] Loaded ${assistantIds.length} user assistant IDs from localStorage`);
        
        // Filter assistantList to get only user-added assistants
        const userAssistantsList = assistantList.filter(a => assistantIds.includes(a.id));
        setUserAssistants(userAssistantsList);
        console.log(`[AssistantContext] Resolved ${userAssistantsList.length} user assistants from assistant list`);
      } else {
        console.log('[AssistantContext] No user assistants found in localStorage');
        setUserAssistants([]);
      }
    } catch (err) {
      console.error('[AssistantContext] Failed to load user assistants from localStorage:', err);
      setUserAssistants([]);
    }
  }, [assistantList]);

  // Save user assistants to localStorage (Requirement 2.4)
  const saveUserAssistants = useCallback((assistants: Assistant[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      const assistantIds = assistants.map(a => a.id);
      localStorage.setItem('userAssistants', JSON.stringify(assistantIds));
      console.log(`[AssistantContext] Saved ${assistantIds.length} user assistant IDs to localStorage`);
    } catch (err) {
      console.error('[AssistantContext] Failed to save user assistants to localStorage:', err);
    }
  }, []);

  // 初始化：检查迁移并加载数据
  useEffect(() => {
    const initializeData = async () => {
      if (typeof window === 'undefined') return;

      try {
        setIsLoading(true);
        setError(null);

        // Migration has been completed - no longer needed
        if (!migrationChecked) {
          setMigrationChecked(true);
        }

        // 从服务器加载数据（会优先使用 IndexedDB 缓存）
        // Gracefully handle API failures - don't block the UI
        try {
          console.log('[AssistantContext] Initializing assistant list...');
          const assistants = await assistantApiClient.getAll({ useCache: true });
          console.log(`[AssistantContext] Loaded ${assistants.length} assistants`);
          setAssistantList(assistants);
          
          // 如果获取失败但没有抛出错误（返回空数组），尝试清除缓存重试
          if (assistants.length === 0) {
            console.log('[AssistantContext] No assistants loaded, trying without cache...');
            try {
              const freshAssistants = await assistantApiClient.getAll({ useCache: false });
              console.log(`[AssistantContext] Loaded ${freshAssistants.length} assistants from server`);
              setAssistantList(freshAssistants);
            } catch (retryError) {
              console.warn('[AssistantContext] Retry without cache also failed:', retryError);
            }
          }
        } catch (apiError) {
          // API failure is non-fatal - just log and continue with empty list
          console.error('[AssistantContext] API error during initialization:', apiError);
          setError('无法加载助理列表，请检查网络连接');
          setAssistantList([]);
        }
      } catch (err) {
        // Only critical initialization errors reach here
        console.error('[AssistantContext] Critical initialization error:', err);
        setError('初始化失败，请刷新页面重试');
        setAssistantList([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [migrationChecked]);

  // Load user assistants when assistantList changes (Requirement 2.4)
  useEffect(() => {
    if (assistantList.length > 0) {
      loadUserAssistants();
    }
  }, [assistantList, loadUserAssistants]);

  // 获取已发布的助理
  const publishedAssistants = assistantList.filter(a => a.status === 'published');

  // 获取待审核的助理
  const pendingAssistants = assistantList.filter(a => a.status === 'pending');

  // Market assistants are all published assistants (Requirement 2.1)
  // Include both user-created and system preset assistants
  const marketAssistants = publishedAssistants;

  // 刷新助理列表
  // 添加 useCache 参数控制是否使用缓存（需求 2.1, 3.2）
  const refreshAssistants = useCallback(async (useCache = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (useCache) {
        console.log('[AssistantContext] Refreshing assistants (using cache if available)');
      } else {
        console.log('[AssistantContext] Refreshing assistants from server (bypassing cache)');
      }
      
      // 根据参数决定是否使用缓存
      // useCache = false: 强制从服务器获取最新数据（删除失败等场景）
      // useCache = true: 允许使用缓存（常规刷新场景）
      const assistants = await assistantApiClient.getAll({ useCache });
      
      setAssistantList(assistants);
      console.log(`[AssistantContext] Refresh complete: ${assistants.length} assistants loaded`);
      
      // 如果刷新后仍然是空列表，可能是缓存问题，尝试清除缓存重试
      if (assistants.length === 0 && useCache) {
        console.log('[AssistantContext] Empty result with cache, retrying without cache...');
        const freshAssistants = await assistantApiClient.getAll({ useCache: false });
        setAssistantList(freshAssistants);
        console.log(`[AssistantContext] Retry complete: ${freshAssistants.length} assistants loaded`);
      }
    } catch (err) {
      console.error('[AssistantContext] Failed to refresh assistants:', err);
      const errorMessage = err instanceof Error ? err.message : '刷新助理列表失败';
      setError(errorMessage);
      
      // 如果刷新失败，尝试使用缓存数据作为后备
      if (!useCache) {
        console.log('[AssistantContext] Server refresh failed, trying cache as fallback...');
        try {
          const cachedAssistants = await assistantApiClient.getAll({ useCache: true });
          if (cachedAssistants.length > 0) {
            setAssistantList(cachedAssistants);
            console.log(`[AssistantContext] Loaded ${cachedAssistants.length} assistants from cache`);
            setError('使用缓存数据，部分功能可能不可用');
          }
        } catch (cacheErr) {
          console.error('[AssistantContext] Cache fallback also failed:', cacheErr);
        }
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 更新助理状态
  const updateAssistantStatus = useCallback(async (
    id: string, 
    status: Assistant['status'],
    reviewNote?: string
  ) => {
    try {
      setError(null);
      
      // 找到当前助理获取版本号
      const current = assistantList.find(a => a.id === id);
      if (!current) {
        throw new Error('助理不存在');
      }

      // 乐观更新：立即更新本地状态
      setAssistantList(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status,
            reviewedAt: new Date(),
            publishedAt: status === 'published' ? new Date() : item.publishedAt,
            reviewNote,
          };
        }
        return item;
      }));

      // 后台同步到服务器
      const updated = await assistantApiClient.updateStatus(id, {
        status,
        reviewNote,
        version: current.version,
      });

      // 更新为服务器返回的最新数据（包括缓存）
      // 这确保了其他页面刷新时能看到最新状态
      setAssistantList(prev => prev.map(item => item.id === id ? updated : item));
      
      console.log(`[AssistantContext] Status updated successfully for ${id}, status: ${status}`);
    } catch (err) {
      console.error('Failed to update assistant status:', err);
      
      // 如果是版本冲突，刷新数据
      if (err instanceof Error && err.message.includes('Version conflict')) {
        setError('数据已被其他用户修改，正在刷新...');
        // 版本冲突时强制从服务器刷新（不使用缓存）
        await refreshAssistants(false);
      } else {
        setError(err instanceof Error ? err.message : '更新助理状态失败');
        // 回滚乐观更新，强制从服务器刷新
        await refreshAssistants(false);
      }
      
      throw err;
    }
  }, [assistantList, refreshAssistants]);

  // 添加助理 (Requirements: 1.4, 2.1, 2.2, 5.2, 7.1, 9.1, 10.1, 10.2)
  // Enhanced to support both AssistantFormData and legacy Assistant format
  const addAssistant = useCallback(async (
    assistantData: Omit<Assistant, 'id' | 'createdAt' | 'version'> | AssistantFormData
  ): Promise<Assistant> => {
    try {
      setError(null);
      
      // Check if user can create assistants (Requirement 7.1)
      const createCheck = assistantPermissionService.canCreate(currentUser);
      if (!createCheck.allowed) {
        const errorMsg = createCheck.reason || '无权创建助理';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Detect if input is AssistantFormData or legacy Assistant format
      // AssistantFormData has 'name' field, Assistant has 'title' field
      const isFormData = 'name' in assistantData;
      
      let assistantToCreate: Omit<Assistant, 'id' | 'createdAt' | 'version'>;
      
      if (isFormData) {
        // Convert AssistantFormData to Assistant format (Requirements: 10.1, 10.2)
        console.log('[AssistantContext] Converting AssistantFormData to Assistant format');
        assistantToCreate = formDataToAssistant(assistantData as AssistantFormData);
      } else {
        // Use legacy format directly (backward compatibility - Requirement 10.1)
        assistantToCreate = assistantData as Omit<Assistant, 'id' | 'createdAt' | 'version'>;
      }
      
      console.log('[AssistantContext] Creating new assistant:', assistantToCreate.title);
      
      // Create assistant via API (Requirements: 2.1, 2.2, 9.1)
      const created = await assistantApiClient.create({
        title: assistantToCreate.title,
        desc: assistantToCreate.desc,
        emoji: assistantToCreate.emoji,
        prompt: assistantToCreate.prompt,
        tags: assistantToCreate.tags,
        isPublic: assistantToCreate.isPublic,
      });

      // 更新本地状态 - 触发 UI 刷新
      setAssistantList(prev => {
        const updated = [...prev, created];
        console.log(`[AssistantContext] Assistant created successfully, total: ${updated.length}`);
        return updated;
      });
      
      return created;
    } catch (err) {
      console.error('[AssistantContext] Failed to add assistant:', err);
      setError(err instanceof Error ? err.message : '添加助理失败');
      throw err;
    }
  }, [currentUser]);

  // 更新助理 (Requirements: 2.4, 2.5, 5.2, 7.2)
  const updateAssistant = useCallback(async (
    id: string, 
    updates: Partial<Assistant>
  ) => {
    try {
      setError(null);
      console.log(`[AssistantContext] Updating assistant ${id}`);
      
      // 找到当前助理获取版本号
      const current = assistantList.find(a => a.id === id);
      if (!current) {
        throw new Error('助理不存在');
      }

      // Check if user can modify this assistant (Requirement 7.2)
      const editCheck = assistantPermissionService.canEdit(currentUser, current);
      if (!editCheck.allowed) {
        const errorMsg = editCheck.reason || '无权修改此助理';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // 乐观更新：立即更新本地状态 - 触发 UI 刷新
      setAssistantList(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      ));

      // 后台同步到服务器
      const updated = await assistantApiClient.update(id, {
        ...updates,
        version: current.version,
      });

      // 更新为服务器返回的最新数据 - 确保 UI 显示最新状态
      setAssistantList(prev => {
        const result = prev.map(item => item.id === id ? updated : item);
        console.log(`[AssistantContext] Assistant ${id} updated successfully`);
        return result;
      });
    } catch (err) {
      console.error('[AssistantContext] Failed to update assistant:', err);
      
      // 如果是版本冲突，刷新数据
      if (err instanceof Error && err.message.includes('Version conflict')) {
        setError('数据已被其他用户修改，正在刷新...');
        // 版本冲突时强制从服务器刷新（不使用缓存）
        await refreshAssistants(false);
      } else {
        setError(err instanceof Error ? err.message : '更新助理失败');
        // 回滚乐观更新，强制从服务器刷新
        await refreshAssistants(false);
      }
      
      throw err;
    }
  }, [assistantList, refreshAssistants, currentUser]);

  // 删除助理 (Requirements: 7.3)
  const deleteAssistant = useCallback(async (id: string) => {
    // 保存删除前的状态用于回滚（需求 3.1）
    const previousList = assistantList;
    
    try {
      setError(null);
      console.log(`[AssistantContext] Deleting assistant ${id}`);
      
      // Find the assistant to check permissions
      const assistant = assistantList.find(a => a.id === id);
      if (!assistant) {
        throw new Error('助理不存在');
      }

      // Check if user can delete this assistant (Requirement 7.3)
      const deleteCheck = assistantPermissionService.canDelete(currentUser, assistant);
      if (!deleteCheck.allowed) {
        const errorMsg = deleteCheck.reason || '无权删除此助理';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // 乐观更新：立即从本地状态移除
      setAssistantList(prev => prev.filter(item => item.id !== id));

      // 等待删除操作完全完成（需求 3.1）
      // assistantApiClient.delete() 会：
      // 1. 删除服务器数据
      // 2. 等待缓存删除完成
      // 3. 如果缓存删除失败，触发后台同步
      await assistantApiClient.delete(id);
      
      console.log(`[AssistantContext] Successfully deleted assistant ${id}`);
    } catch (err) {
      console.error('[AssistantContext] Failed to delete assistant:', err);
      setError(err instanceof Error ? err.message : '删除助理失败');
      
      // 删除失败时正确回滚状态（需求 3.2, 3.3）
      console.log(`[AssistantContext] Rolling back delete for ${id}`);
      setAssistantList(previousList);
      
      // 删除失败时强制从服务器刷新（需求 2.1, 3.2）
      // 传入 false 确保不使用缓存，获取最新的服务器状态
      try {
        console.log(`[AssistantContext] Refreshing from server after delete failure`);
        await refreshAssistants(false);
      } catch (refreshErr) {
        console.error('[AssistantContext] Failed to refresh after delete error:', refreshErr);
        // 即使刷新失败，也已经回滚了状态
        // 不再抛出刷新错误，只抛出原始删除错误
      }
      
      throw err;
    }
  }, [assistantList, refreshAssistants, currentUser]);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 清除缓存并重新加载
  const clearCache = useCallback(async () => {
    try {
      console.log('[AssistantContext] Clearing cache and reloading...');
      await assistantApiClient.clearCache();
      await refreshAssistants(false);
      console.log('[AssistantContext] Cache cleared and data reloaded');
    } catch (err) {
      console.error('[AssistantContext] Failed to clear cache:', err);
      setError('清除缓存失败');
      throw err;
    }
  }, [refreshAssistants]);

  // 根据 ID 获取助理
  const getAssistantById = useCallback((id: string) => {
    return assistantList.find(a => a.id === id);
  }, [assistantList]);

  // 检查是否为版本冲突错误
  const hasVersionConflict = useCallback((error: Error) => {
    return error.message.includes('Version conflict') || 
           error.message.includes('版本冲突') ||
           error.message.includes('data has been modified');
  }, []);

  // 激活助理（需求 7.1, 7.2, 7.3, 7.4, 7.5）
  const activateAssistant = useCallback(async (
    id: string,
    options: { switchToChat?: boolean; showWelcome?: boolean } = {}
  ) => {
    try {
      setError(null);
      console.log(`[AssistantContext] Activating assistant ${id}`);
      
      // 查找助理
      const assistant = assistantList.find(a => a.id === id);
      if (!assistant) {
        const errorMsg = '助理不存在';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // 设置为当前活动助理
      setActiveAssistantId(id);
      
      // 保存到 localStorage 以便页面刷新后恢复
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeAssistantId', id);
        
        // 保存激活选项
        if (options.showWelcome !== undefined) {
          localStorage.setItem('showWelcomeMessage', String(options.showWelcome));
        }
      }
      
      // 记录到最近使用列表（需求 7.5）
      recentAssistantsService.recordUsage(
        assistant.id,
        assistant.title,
        assistant.emoji
      );
      
      // 更新使用次数（需求 7.3）
      // Note: Usage count is updated optimistically in local state
      // The actual database update will be handled by the usage stats service
      // This avoids version conflicts and keeps the activation flow fast
      setAssistantList(prev => prev.map(item => 
        item.id === id 
          ? { ...item, usageCount: (item.usageCount || 0) + 1 }
          : item
      ));
      
      console.log(`[AssistantContext] Successfully activated assistant ${id}: ${assistant.title}`);
      
      // 如果需要切换到聊天界面（需求 7.2）
      if (options.switchToChat && typeof window !== 'undefined') {
        // 触发自定义事件通知聊天界面切换
        window.dispatchEvent(new CustomEvent('assistant-activated', {
          detail: { assistant, showWelcome: options.showWelcome }
        }));
      }
      
      return { 
        success: true, 
        assistant 
      };
    } catch (err) {
      console.error('[AssistantContext] Failed to activate assistant:', err);
      const errorMsg = err instanceof Error ? err.message : '激活助理失败';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [assistantList]);

  // 从 localStorage 恢复活动助理
  useEffect(() => {
    if (typeof window !== 'undefined' && assistantList.length > 0 && !activeAssistantId) {
      const savedId = localStorage.getItem('activeAssistantId');
      if (savedId && assistantList.find(a => a.id === savedId)) {
        setActiveAssistantId(savedId);
        console.log(`[AssistantContext] Restored active assistant: ${savedId}`);
      }
    }
  }, [assistantList, activeAssistantId]);

  // 计算当前活动助理对象
  const activeAssistant = activeAssistantId 
    ? assistantList.find(a => a.id === activeAssistantId) || null
    : null;

  // 打开创建侧边栏 (Requirements: 1.1, 1.4, 7.1)
  const openCreateSidebar = useCallback(() => {
    // Check if user can create assistants (Requirement 7.1)
    const createCheck = assistantPermissionService.canCreate(currentUser);
    if (!createCheck.allowed) {
      const errorMsg = createCheck.reason || '无权创建助理';
      setError(errorMsg);
      console.error('[AssistantContext] Cannot open create sidebar:', errorMsg);
      return;
    }
    
    console.log('[AssistantContext] Opening create sidebar');
    setSidebarState({
      visible: true,
      mode: 'create',
      assistant: null,
    });
  }, [currentUser]);

  // 打开编辑侧边栏 (Requirements: 2.4, 2.5, 7.2)
  const openEditSidebar = useCallback((assistantId: string) => {
    console.log(`[AssistantContext] Opening edit sidebar for assistant ${assistantId}`);
    const assistant = assistantList.find(a => a.id === assistantId);
    
    if (!assistant) {
      console.error(`[AssistantContext] Assistant ${assistantId} not found`);
      setError('助理不存在');
      return;
    }
    
    // Check if user can edit this assistant (Requirement 7.2)
    const editCheck = assistantPermissionService.canEdit(currentUser, assistant);
    if (!editCheck.allowed) {
      const errorMsg = editCheck.reason || '无权编辑此助理';
      setError(errorMsg);
      console.error('[AssistantContext] Cannot open edit sidebar:', errorMsg);
      return;
    }
    
    setSidebarState({
      visible: true,
      mode: 'edit',
      assistant,
    });
  }, [assistantList, currentUser]);

  // 关闭侧边栏 (Requirements: 1.5, 5.2)
  const closeSidebar = useCallback(() => {
    console.log('[AssistantContext] Closing sidebar');
    setSidebarState({
      visible: false,
      mode: 'create',
      assistant: null,
    });
  }, []);

  // Add assistant to user collection (Requirement 2.2)
  const addUserAssistant = useCallback(async (assistant: Assistant) => {
    try {
      console.log(`[AssistantContext] Adding assistant ${assistant.id} to user collection`);
      
      // Check if assistant is already in user collection
      if (userAssistants.some(a => a.id === assistant.id)) {
        console.log(`[AssistantContext] Assistant ${assistant.id} already in user collection`);
        return;
      }
      
      // Add to user assistants
      const updatedUserAssistants = [...userAssistants, assistant];
      setUserAssistants(updatedUserAssistants);
      
      // Persist to localStorage
      saveUserAssistants(updatedUserAssistants);
      
      console.log(`[AssistantContext] Successfully added assistant ${assistant.id} to user collection`);
    } catch (err) {
      console.error('[AssistantContext] Failed to add user assistant:', err);
      setError(err instanceof Error ? err.message : '添加助理失败');
      throw err;
    }
  }, [userAssistants, saveUserAssistants]);

  // Remove assistant from user collection (Requirement 2.3)
  const removeUserAssistant = useCallback(async (assistantId: string) => {
    try {
      console.log(`[AssistantContext] Removing assistant ${assistantId} from user collection`);
      
      // Remove from user assistants
      const updatedUserAssistants = userAssistants.filter(a => a.id !== assistantId);
      setUserAssistants(updatedUserAssistants);
      
      // Persist to localStorage
      saveUserAssistants(updatedUserAssistants);
      
      console.log(`[AssistantContext] Successfully removed assistant ${assistantId} from user collection`);
    } catch (err) {
      console.error('[AssistantContext] Failed to remove user assistant:', err);
      setError(err instanceof Error ? err.message : '移除助理失败');
      throw err;
    }
  }, [userAssistants, saveUserAssistants]);

  return (
    <AssistantContext.Provider
      value={{
        assistantList,
        setAssistantList,
        publishedAssistants,
        pendingAssistants,
        updateAssistantStatus,
        addAssistant,
        updateAssistant,
        deleteAssistant,
        refreshAssistants,
        clearCache,
        getAssistantById,
        activateAssistant,
        activeAssistantId,
        activeAssistant,
        isLoading,
        error,
        clearError,
        hasVersionConflict,
        // Preset protection methods
        isSystemPreset,
        canDeleteAssistant,
        canModifyAssistant,
        getProtectionMessage,
        // Sidebar control methods
        openCreateSidebar,
        openEditSidebar,
        sidebarState,
        closeSidebar,
        // User assistant management
        userAssistants,
        marketAssistants,
        addUserAssistant,
        removeUserAssistant,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

// 自定义 Hook
export const useAssistants = () => {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistants must be used within an AssistantProvider');
  }
  return context;
};

// 导出 Assistant 类型以便其他组件使用
export type { Assistant };
