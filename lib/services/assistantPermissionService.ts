/**
 * Assistant Permission Service
 * 
 * Provides permission checking for assistant operations based on user roles.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { Assistant } from '@/types/assistant';

/**
 * User interface for permission checks
 */
export interface User {
  email: string;
  role: 'admin' | 'normal';
  isAuthenticated: boolean;
}

/**
 * Permission check result
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Assistant Permission Service
 * 
 * Handles all permission checks for assistant operations.
 */
export class AssistantPermissionService {
  /**
   * Check if user can create assistants
   * 
   * Requirement 7.1: All authenticated users can create private assistants
   * 
   * @param user - The user to check permissions for
   * @returns Permission result
   */
  canCreate(user: User | null): PermissionResult {
    if (!user || !user.isAuthenticated) {
      return {
        allowed: false,
        reason: '请先登录以创建助理'
      };
    }

    // All authenticated users can create assistants
    return {
      allowed: true
    };
  }

  /**
   * Check if user can edit an assistant
   * 
   * Requirement 7.2: Users can edit their own assistants, admins can edit all
   * 
   * @param user - The user to check permissions for
   * @param assistant - The assistant to edit
   * @returns Permission result
   */
  canEdit(user: User | null, assistant: Assistant | null | undefined): PermissionResult {
    if (!user || !user.isAuthenticated) {
      return {
        allowed: false,
        reason: '请先登录以编辑助理'
      };
    }

    if (!assistant) {
      return {
        allowed: false,
        reason: '助理不存在'
      };
    }

    // System presets cannot be edited by anyone
    if (assistant.author === 'system') {
      return {
        allowed: false,
        reason: '系统预设助理不可编辑'
      };
    }

    // Admins can edit all assistants
    if (user.role === 'admin') {
      return {
        allowed: true
      };
    }

    // Users can only edit their own assistants
    if (user.email === assistant.author) {
      return {
        allowed: true
      };
    }

    return {
      allowed: false,
      reason: '您只能编辑自己创建的助理'
    };
  }

  /**
   * Check if user can delete an assistant
   * 
   * Requirement 7.3: Users can delete their own assistants, admins can delete all
   * 
   * @param user - The user to check permissions for
   * @param assistant - The assistant to delete
   * @returns Permission result
   */
  canDelete(user: User | null, assistant: Assistant | null | undefined): PermissionResult {
    if (!user || !user.isAuthenticated) {
      return {
        allowed: false,
        reason: '请先登录以删除助理'
      };
    }

    if (!assistant) {
      return {
        allowed: false,
        reason: '助理不存在'
      };
    }

    // Admins can delete all assistants (including system presets)
    if (user.role === 'admin') {
      return {
        allowed: true
      };
    }

    // System presets cannot be deleted by non-admin users
    if (assistant.author === 'system') {
      return {
        allowed: false,
        reason: '系统预设助理不可删除'
      };
    }

    // Users can only delete their own assistants
    if (user.email === assistant.author) {
      return {
        allowed: true
      };
    }

    return {
      allowed: false,
      reason: '您只能删除自己创建的助理'
    };
  }

  /**
   * Check if user can publish an assistant (make it public)
   * 
   * Requirement 7.4: Only admins can publish assistants
   * 
   * @param user - The user to check permissions for
   * @param assistant - The assistant to publish (optional, for future use)
   * @returns Permission result
   */
  canPublish(user: User | null, assistant?: Assistant | null): PermissionResult {
    if (!user || !user.isAuthenticated) {
      return {
        allowed: false,
        reason: '请先登录'
      };
    }

    // Only admins can publish assistants
    if (user.role === 'admin') {
      return {
        allowed: true
      };
    }

    return {
      allowed: false,
      reason: '只有管理员可以发布公开助理'
    };
  }

  /**
   * Check if user can view the create button
   * 
   * Requirement 7.1: All authenticated users can see the create button
   * 
   * @param user - The user to check permissions for
   * @returns Permission result
   */
  canViewCreateButton(user: User | null): PermissionResult {
    return this.canCreate(user);
  }

  /**
   * Check if user can toggle public/private status
   * 
   * Requirement 7.4: Only admins can toggle public status
   * 
   * @param user - The user to check permissions for
   * @returns Permission result
   */
  canTogglePublic(user: User | null): PermissionResult {
    return this.canPublish(user);
  }

  /**
   * Get user-friendly permission error message
   * 
   * @param result - The permission result
   * @returns User-friendly error message
   */
  getErrorMessage(result: PermissionResult): string {
    if (result.allowed) {
      return '';
    }
    return result.reason || '权限不足';
  }
}

// Export singleton instance
export const assistantPermissionService = new AssistantPermissionService();

// Export default for convenience
export default assistantPermissionService;
