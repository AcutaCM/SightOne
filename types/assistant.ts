/**
 * Assistant Data Persistence System - Type Definitions
 * 
 * This file contains all TypeScript type definitions for the assistant
 * data persistence system including entities, API requests/responses,
 * and database row types.
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Assistant status enumeration
 */
export type AssistantStatus = 'draft' | 'pending' | 'published' | 'rejected';

/**
 * Main Assistant entity (camelCase for application use)
 */
export interface Assistant {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  prompt: string;
  tags?: string[];
  category?: string[];
  isPublic: boolean;
  status: AssistantStatus;
  author: string;
  createdAt: Date;
  updatedAt?: Date;
  reviewedAt?: Date;
  publishedAt?: Date;
  reviewNote?: string;
  version: number;
  usageCount?: number;
  rating?: number;
}

// ============================================================================
// Database Row Types (snake_case for SQLite)
// ============================================================================

/**
 * Database row representation (snake_case)
 */
export interface AssistantRow {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  prompt: string;
  tags: string | null;  // JSON string
  category: string | null;  // JSON string
  is_public: number;    // SQLite boolean (0 or 1)
  status: string;
  author: string;
  created_at: string;   // ISO 8601 string
  updated_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  review_note: string | null;
  version: number;
  usage_count: number;
  rating: number;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Request body for creating a new assistant
 */
export interface CreateAssistantRequest {
  title: string;
  desc: string;
  emoji: string;
  prompt: string;
  tags?: string[];
  category?: string[];
  isPublic: boolean;
}

/**
 * Request body for updating an existing assistant
 */
export interface UpdateAssistantRequest extends Partial<CreateAssistantRequest> {
  version: number;  // Required for optimistic locking
}

/**
 * Request body for updating assistant status
 */
export interface UpdateStatusRequest {
  status: AssistantStatus;
  reviewNote?: string;
  version: number;  // Required for optimistic locking
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated list response
 */
export interface AssistantListResponse {
  data: Assistant[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  traceId?: string;
}

// ============================================================================
// Query Filter Types
// ============================================================================

/**
 * Query filters for listing assistants
 */
export interface AssistantQueryFilters {
  status?: AssistantStatus;
  author?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Cached assistant with metadata
 */
export interface CachedAssistant extends Assistant {
  cachedAt: number;  // Timestamp
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number;  // Time to live in milliseconds
  maxSize?: number;  // Maximum cache size
}

// ============================================================================
// Migration Types
// ============================================================================

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  count: number;
  errors: string[];
}

/**
 * Database migration record
 */
export interface MigrationRecord {
  id: number;
  version: string;
  appliedAt: Date;
  description?: string;
}

// ============================================================================
// Backup Types
// ============================================================================

/**
 * Backup metadata
 */
export interface BackupMetadata {
  id: number;
  filename: string;
  createdAt: Date;
  recordCount: number;
  fileSize: number;
  isAuto: boolean;
}

/**
 * Backup export data
 */
export interface BackupData {
  version: string;
  timestamp: string;
  assistants: Assistant[];
  metadata: {
    count: number;
    exportedBy?: string;
  };
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// Favorites Types
// ============================================================================

/**
 * Assistant favorite entity
 */
export interface AssistantFavorite {
  id: number;
  userId: string;
  assistantId: string;
  createdAt: Date;
}

/**
 * Favorite database row
 */
export interface FavoriteRow {
  id: number;
  user_id: string;
  assistant_id: string;
  created_at: string;
}

// ============================================================================
// Ratings Types
// ============================================================================

/**
 * Assistant rating entity
 */
export interface AssistantRating {
  id: number;
  userId: string;
  assistantId: string;
  rating: number;
  feedback?: string;
  createdAt: Date;
}

/**
 * Rating database row
 */
export interface RatingRow {
  id: number;
  user_id: string;
  assistant_id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
}

// ============================================================================
// Usage Logs Types
// ============================================================================

/**
 * Usage log entity
 */
export interface UsageLog {
  id: number;
  userId: string;
  assistantId: string;
  duration?: number;
  createdAt: Date;
}

/**
 * Usage log database row
 */
export interface UsageLogRow {
  id: number;
  user_id: string;
  assistant_id: string;
  duration: number | null;
  created_at: string;
}

/**
 * Assistant statistics
 */
export interface AssistantStats {
  assistantId: string;
  totalUses: number;
  averageRating: number;
  totalRatings: number;
  favoriteCount: number;
  averageDuration?: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Database configuration
 */
export interface DatabaseConfig {
  path: string;
  backupDir: string;
  connectionPoolSize: number;
  timeout: number;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  dir: string;
  maxSize: number;
}

/**
 * System configuration
 */
export interface SystemConfig {
  database: DatabaseConfig;
  logging: LoggingConfig;
  cache: CacheConfig;
  backup: {
    enabled: boolean;
    time: string;
    retentionDays: number;
  };
  security: {
    enableCsrf: boolean;
    enableRateLimit: boolean;
    rateLimitMaxRequests: number;
    rateLimitWindowMs: number;
  };
}

// ============================================================================
// User Assistant Types (for activation from market)
// ============================================================================

/**
 * User Assistant entity - extends Assistant with user-specific metadata
 */
export interface UserAssistant extends Assistant {
  addedAt: Date;           // 添加到列表的时间
  lastUsedAt?: Date;       // 最后使用时间
  usageCount?: number;     // 使用次数
  isFavorite?: boolean;    // 是否收藏
  customName?: string;     // 用户自定义名称
}

/**
 * Assistant activation state for UI
 */
export interface AssistantActivationState {
  isAdding: boolean;       // 是否正在添加
  isAdded: boolean;        // 是否已添加
  error: string | null;    // 错误信息
}
