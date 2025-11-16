/**
 * Access Control
 * Provides role-based access control and permission management
 */

import { NextRequest } from 'next/server';
import { logger } from '../logger/logger';

// User roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

// Permissions
export enum Permission {
  CREATE_ASSISTANT = 'create:assistant',
  READ_ASSISTANT = 'read:assistant',
  UPDATE_ASSISTANT = 'update:assistant',
  DELETE_ASSISTANT = 'delete:assistant',
  PUBLISH_ASSISTANT = 'publish:assistant',
  REVIEW_ASSISTANT = 'review:assistant',
  MANAGE_BACKUP = 'manage:backup',
  VIEW_LOGS = 'view:logs',
}

// Role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.CREATE_ASSISTANT,
    Permission.READ_ASSISTANT,
    Permission.UPDATE_ASSISTANT,
    Permission.DELETE_ASSISTANT,
    Permission.PUBLISH_ASSISTANT,
    Permission.REVIEW_ASSISTANT,
    Permission.MANAGE_BACKUP,
    Permission.VIEW_LOGS,
  ],
  [UserRole.USER]: [
    Permission.CREATE_ASSISTANT,
    Permission.READ_ASSISTANT,
    Permission.UPDATE_ASSISTANT,
    Permission.DELETE_ASSISTANT,
  ],
  [UserRole.GUEST]: [Permission.READ_ASSISTANT],
};

/**
 * User context interface
 */
export interface UserContext {
  id: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
}

/**
 * Get user context from request
 * In a real application, this would extract user info from JWT or session
 */
export function getUserContext(req: NextRequest): UserContext | null {
  // For demo purposes, we'll use a header-based approach
  // In production, use proper authentication (JWT, session, etc.)
  const userId = req.headers.get('x-user-id');
  const username = req.headers.get('x-username');
  const roleHeader = req.headers.get('x-user-role');

  if (!userId || !username) {
    return null;
  }

  const role = (roleHeader as UserRole) || UserRole.GUEST;
  const permissions = ROLE_PERMISSIONS[role] || [];

  return {
    id: userId,
    username,
    role,
    permissions,
  };
}

/**
 * Check if user has permission
 */
export function hasPermission(user: UserContext | null, permission: Permission): boolean {
  if (!user) {
    return false;
  }

  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the permissions
 */
export function hasAnyPermission(
  user: UserContext | null,
  permissions: Permission[]
): boolean {
  if (!user) {
    return false;
  }

  return permissions.some((permission) => user.permissions.includes(permission));
}

/**
 * Check if user has all permissions
 */
export function hasAllPermissions(
  user: UserContext | null,
  permissions: Permission[]
): boolean {
  if (!user) {
    return false;
  }

  return permissions.every((permission) => user.permissions.includes(permission));
}

/**
 * Check if user is admin
 */
export function isAdmin(user: UserContext | null): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if user owns the resource
 */
export function isOwner(user: UserContext | null, resourceAuthor: string): boolean {
  if (!user) {
    return false;
  }

  return user.username === resourceAuthor;
}

/**
 * Check if user can modify resource
 * User can modify if they are the owner or an admin
 */
export function canModify(user: UserContext | null, resourceAuthor: string): boolean {
  return isAdmin(user) || isOwner(user, resourceAuthor);
}

/**
 * Authorization error
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Require authentication
 */
export function requireAuth(user: UserContext | null): UserContext {
  if (!user) {
    logger.warn('Authentication required but no user context found');
    throw new AuthorizationError('Authentication required');
  }

  return user;
}

/**
 * Require permission
 */
export function requirePermission(
  user: UserContext | null,
  permission: Permission
): UserContext {
  const authenticatedUser = requireAuth(user);

  if (!hasPermission(authenticatedUser, permission)) {
    logger.warn('Permission denied', {
      userId: authenticatedUser.id,
      username: authenticatedUser.username,
      requiredPermission: permission,
      userPermissions: authenticatedUser.permissions,
    });

    throw new AuthorizationError(`Permission denied: ${permission}`);
  }

  return authenticatedUser;
}

/**
 * Require any permission
 */
export function requireAnyPermission(
  user: UserContext | null,
  permissions: Permission[]
): UserContext {
  const authenticatedUser = requireAuth(user);

  if (!hasAnyPermission(authenticatedUser, permissions)) {
    logger.warn('Permission denied (any)', {
      userId: authenticatedUser.id,
      username: authenticatedUser.username,
      requiredPermissions: permissions,
      userPermissions: authenticatedUser.permissions,
    });

    throw new AuthorizationError(
      `Permission denied: requires one of ${permissions.join(', ')}`
    );
  }

  return authenticatedUser;
}

/**
 * Require all permissions
 */
export function requireAllPermissions(
  user: UserContext | null,
  permissions: Permission[]
): UserContext {
  const authenticatedUser = requireAuth(user);

  if (!hasAllPermissions(authenticatedUser, permissions)) {
    logger.warn('Permission denied (all)', {
      userId: authenticatedUser.id,
      username: authenticatedUser.username,
      requiredPermissions: permissions,
      userPermissions: authenticatedUser.permissions,
    });

    throw new AuthorizationError(
      `Permission denied: requires all of ${permissions.join(', ')}`
    );
  }

  return authenticatedUser;
}

/**
 * Require ownership or admin
 */
export function requireOwnershipOrAdmin(
  user: UserContext | null,
  resourceAuthor: string
): UserContext {
  const authenticatedUser = requireAuth(user);

  if (!canModify(authenticatedUser, resourceAuthor)) {
    logger.warn('Ownership or admin required', {
      userId: authenticatedUser.id,
      username: authenticatedUser.username,
      resourceAuthor,
      isAdmin: isAdmin(authenticatedUser),
      isOwner: isOwner(authenticatedUser, resourceAuthor),
    });

    throw new AuthorizationError('You do not have permission to modify this resource');
  }

  return authenticatedUser;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  timestamp: Date;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  success: boolean;
  details?: any;
}

/**
 * Audit logger
 */
class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 10000;

  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console/file
    logger.info('Audit Log', logEntry);
  }

  getLogs(filter?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] {
    let filtered = this.logs;

    if (filter) {
      if (filter.userId) {
        filtered = filtered.filter((log) => log.userId === filter.userId);
      }

      if (filter.action) {
        filtered = filtered.filter((log) => log.action === filter.action);
      }

      if (filter.resource) {
        filtered = filtered.filter((log) => log.resource === filter.resource);
      }

      if (filter.startDate) {
        filtered = filtered.filter((log) => log.timestamp >= filter.startDate!);
      }

      if (filter.endDate) {
        filtered = filtered.filter((log) => log.timestamp <= filter.endDate!);
      }
    }

    return filtered;
  }

  clear(): void {
    this.logs = [];
  }
}

export const auditLogger = new AuditLogger();

/**
 * Log access attempt
 */
export function logAccess(
  user: UserContext | null,
  action: string,
  resource: string,
  resourceId?: string,
  success: boolean = true,
  details?: any
): void {
  auditLogger.log({
    userId: user?.id || 'anonymous',
    username: user?.username || 'anonymous',
    action,
    resource,
    resourceId,
    success,
    details,
  });
}
