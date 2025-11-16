/**
 * Assistant Data Persistence System - Constants
 * 
 * This file contains all constant values used throughout the assistant
 * data persistence system.
 */

// ============================================================================
// Database Constants
// ============================================================================

export const DB_CONSTANTS = {
  // Table names
  TABLES: {
    ASSISTANTS: 'assistants',
    MIGRATIONS: 'migrations',
    BACKUPS: 'backups',
  },

  // Index names
  INDEXES: {
    STATUS: 'idx_assistants_status',
    AUTHOR: 'idx_assistants_author',
    CREATED_AT: 'idx_assistants_created_at',
    PUBLISHED_AT: 'idx_assistants_published_at',
  },

  // Default values
  DEFAULTS: {
    EMOJI: '🤖',
    STATUS: 'draft',
    VERSION: 1,
    IS_PUBLIC: 0,
  },
} as const;

// ============================================================================
// API Constants
// ============================================================================

export const API_CONSTANTS = {
  // Base paths
  BASE_PATH: '/api/assistants',

  // Endpoints
  ENDPOINTS: {
    LIST: '',
    DETAIL: '/:id',
    CREATE: '',
    UPDATE: '/:id',
    DELETE: '/:id',
    UPDATE_STATUS: '/:id/status',
    EXPORT_BACKUP: '/backup/export',
    IMPORT_BACKUP: '/backup/import',
    LIST_BACKUPS: '/backup/list',
  },

  // HTTP methods
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
  },

  // Status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Error codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    VERSION_CONFLICT: 'VERSION_CONFLICT',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  },
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION_CONSTANTS = {
  // Field length limits
  TITLE_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 1,
  DESC_MAX_LENGTH: 200,
  DESC_MIN_LENGTH: 1,
  PROMPT_MAX_LENGTH: 2000,
  PROMPT_MIN_LENGTH: 1,
  EMOJI_MAX_LENGTH: 10,
  REVIEW_NOTE_MAX_LENGTH: 500,
  AUTHOR_MAX_LENGTH: 100,

  // Array limits
  TAGS_MAX_COUNT: 10,
  TAG_MAX_LENGTH: 50,

  // Status values
  VALID_STATUSES: ['draft', 'pending', 'published', 'rejected'] as const,

  // Validation messages
  MESSAGES: {
    REQUIRED: 'This field is required',
    TOO_LONG: 'This field is too long',
    TOO_SHORT: 'This field is too short',
    INVALID_FORMAT: 'Invalid format',
    INVALID_STATUS: 'Invalid status value',
    INVALID_VERSION: 'Invalid version number',
  },
} as const;

// ============================================================================
// Cache Constants
// ============================================================================

export const CACHE_CONSTANTS = {
  // IndexedDB configuration
  DB_NAME: 'AssistantMarketDB',
  DB_VERSION: 1,
  STORE_NAME: 'assistants',

  // Index names
  INDEXES: {
    STATUS: 'status',
    AUTHOR: 'author',
    CREATED_AT: 'createdAt',
    CACHED_AT: 'cachedAt',
  },

  // TTL (Time To Live)
  DEFAULT_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

  // Cache keys
  KEYS: {
    LAST_SYNC: 'assistant_last_sync',
    CACHE_VERSION: 'assistant_cache_version',
  },
} as const;

// ============================================================================
// Pagination Constants
// ============================================================================

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

// ============================================================================
// Backup Constants
// ============================================================================

export const BACKUP_CONSTANTS = {
  // File naming
  FILENAME_PREFIX: 'assistants_backup_',
  FILENAME_EXTENSION: '.json',
  FILENAME_DATE_FORMAT: 'YYYYMMDD_HHmmss',

  // Backup version
  BACKUP_VERSION: '1.0.0',

  // Retention
  DEFAULT_RETENTION_DAYS: 30,

  // File size limits
  MAX_BACKUP_SIZE: 100 * 1024 * 1024, // 100MB
} as const;

// ============================================================================
// Migration Constants
// ============================================================================

export const MIGRATION_CONSTANTS = {
  // Migration versions
  CURRENT_VERSION: '1.0.0',
  INITIAL_VERSION: '0.0.0',

  // Migration sources
  SOURCES: {
    LOCAL_STORAGE: 'localStorage',
    DATABASE: 'database',
  },

  // LocalStorage keys
  LOCAL_STORAGE_KEYS: {
    ASSISTANT_LIST: 'assistantList',
    MIGRATION_STATUS: 'migration_status',
  },
} as const;

// ============================================================================
// Logging Constants
// ============================================================================

export const LOGGING_CONSTANTS = {
  // Log levels
  LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  },

  // Log file names
  FILES: {
    APP: 'app.log',
    ERROR: 'error.log',
  },

  // Default configuration
  DEFAULT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DEFAULT_MAX_FILES: 5,

  // Module names
  MODULES: {
    REPOSITORY: 'AssistantRepository',
    API: 'AssistantAPI',
    CACHE: 'IndexedDBCache',
    MIGRATION: 'MigrationService',
    BACKUP: 'BackupService',
  },
} as const;

// ============================================================================
// Performance Constants
// ============================================================================

export const PERFORMANCE_CONSTANTS = {
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  DB_TIMEOUT: 5000, // 5 seconds
  CACHE_TIMEOUT: 1000, // 1 second

  // Thresholds
  SLOW_QUERY_THRESHOLD: 200, // milliseconds
  CACHE_HIT_TARGET: 0.8, // 80%

  // Limits
  MAX_CONCURRENT_REQUESTS: 10,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
} as const;

// ============================================================================
// Security Constants
// ============================================================================

export const SECURITY_CONSTANTS = {
  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000, // 1 minute
  },

  // CSRF
  CSRF_TOKEN_LENGTH: 32,

  // Headers
  HEADERS: {
    CSRF_TOKEN: 'X-CSRF-Token',
    TRACE_ID: 'X-Trace-Id',
    API_VERSION: 'X-API-Version',
  },

  // API version
  API_VERSION: '1.0.0',
} as const;

// ============================================================================
// Export all constants
// ============================================================================

export const CONSTANTS = {
  DB: DB_CONSTANTS,
  API: API_CONSTANTS,
  VALIDATION: VALIDATION_CONSTANTS,
  CACHE: CACHE_CONSTANTS,
  PAGINATION: PAGINATION_CONSTANTS,
  BACKUP: BACKUP_CONSTANTS,
  MIGRATION: MIGRATION_CONSTANTS,
  LOGGING: LOGGING_CONSTANTS,
  PERFORMANCE: PERFORMANCE_CONSTANTS,
  SECURITY: SECURITY_CONSTANTS,
} as const;

// Type exports for constant values
export type AssistantStatus = typeof VALIDATION_CONSTANTS.VALID_STATUSES[number];
export type LogLevel = typeof LOGGING_CONSTANTS.LEVELS[keyof typeof LOGGING_CONSTANTS.LEVELS];
export type ErrorCode = typeof API_CONSTANTS.ERROR_CODES[keyof typeof API_CONSTANTS.ERROR_CODES];
