/**
 * Input Validation and Sanitization
 * Provides comprehensive validation and sanitization for assistant data
 */

import { CreateAssistantRequest, UpdateAssistantRequest, AssistantStatus } from '@/types/assistant';

// Validation error class
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validation rules
const VALIDATION_RULES = {
  title: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[^<>{}]*$/, // No HTML tags or curly braces
  },
  desc: {
    minLength: 1,
    maxLength: 200,
    pattern: /^[^<>{}]*$/,
  },
  prompt: {
    minLength: 1,
    maxLength: 2000,
  },
  emoji: {
    pattern: /^[\p{Emoji}\p{Emoji_Component}]+$/u,
  },
  author: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  tags: {
    maxItems: 10,
    maxLength: 30,
  },
};

// Allowed assistant statuses
const ALLOWED_STATUSES: AssistantStatus[] = ['draft', 'pending', 'published', 'rejected'];

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string');
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate and sanitize title
 */
export function validateTitle(title: unknown): string {
  if (typeof title !== 'string') {
    throw new ValidationError('Title must be a string', 'title', 'INVALID_TYPE');
  }

  const sanitized = sanitizeString(title);

  if (sanitized.length < VALIDATION_RULES.title.minLength) {
    throw new ValidationError(
      `Title must be at least ${VALIDATION_RULES.title.minLength} character`,
      'title',
      'TOO_SHORT'
    );
  }

  if (sanitized.length > VALIDATION_RULES.title.maxLength) {
    throw new ValidationError(
      `Title must not exceed ${VALIDATION_RULES.title.maxLength} characters`,
      'title',
      'TOO_LONG'
    );
  }

  if (!VALIDATION_RULES.title.pattern.test(sanitized)) {
    throw new ValidationError(
      'Title contains invalid characters',
      'title',
      'INVALID_CHARACTERS'
    );
  }

  return sanitized;
}

/**
 * Validate and sanitize description
 */
export function validateDescription(desc: unknown): string {
  if (typeof desc !== 'string') {
    throw new ValidationError('Description must be a string', 'desc', 'INVALID_TYPE');
  }

  const sanitized = sanitizeString(desc);

  if (sanitized.length < VALIDATION_RULES.desc.minLength) {
    throw new ValidationError(
      `Description must be at least ${VALIDATION_RULES.desc.minLength} character`,
      'desc',
      'TOO_SHORT'
    );
  }

  if (sanitized.length > VALIDATION_RULES.desc.maxLength) {
    throw new ValidationError(
      `Description must not exceed ${VALIDATION_RULES.desc.maxLength} characters`,
      'desc',
      'TOO_LONG'
    );
  }

  if (!VALIDATION_RULES.desc.pattern.test(sanitized)) {
    throw new ValidationError(
      'Description contains invalid characters',
      'desc',
      'INVALID_CHARACTERS'
    );
  }

  return sanitized;
}

/**
 * Validate and sanitize prompt
 */
export function validatePrompt(prompt: unknown): string {
  if (typeof prompt !== 'string') {
    throw new ValidationError('Prompt must be a string', 'prompt', 'INVALID_TYPE');
  }

  const sanitized = prompt.trim();

  if (sanitized.length < VALIDATION_RULES.prompt.minLength) {
    throw new ValidationError(
      `Prompt must be at least ${VALIDATION_RULES.prompt.minLength} character`,
      'prompt',
      'TOO_SHORT'
    );
  }

  if (sanitized.length > VALIDATION_RULES.prompt.maxLength) {
    throw new ValidationError(
      `Prompt must not exceed ${VALIDATION_RULES.prompt.maxLength} characters`,
      'prompt',
      'TOO_LONG'
    );
  }

  return sanitized;
}

/**
 * Validate emoji
 */
export function validateEmoji(emoji: unknown): string {
  if (typeof emoji !== 'string') {
    throw new ValidationError('Emoji must be a string', 'emoji', 'INVALID_TYPE');
  }

  const trimmed = emoji.trim();

  if (!VALIDATION_RULES.emoji.pattern.test(trimmed)) {
    throw new ValidationError('Invalid emoji format', 'emoji', 'INVALID_FORMAT');
  }

  return trimmed;
}

/**
 * Validate author
 */
export function validateAuthor(author: unknown): string {
  if (typeof author !== 'string') {
    throw new ValidationError('Author must be a string', 'author', 'INVALID_TYPE');
  }

  const sanitized = author.trim();

  if (sanitized.length < VALIDATION_RULES.author.minLength) {
    throw new ValidationError(
      `Author must be at least ${VALIDATION_RULES.author.minLength} character`,
      'author',
      'TOO_SHORT'
    );
  }

  if (sanitized.length > VALIDATION_RULES.author.maxLength) {
    throw new ValidationError(
      `Author must not exceed ${VALIDATION_RULES.author.maxLength} characters`,
      'author',
      'TOO_LONG'
    );
  }

  if (!VALIDATION_RULES.author.pattern.test(sanitized)) {
    throw new ValidationError(
      'Author contains invalid characters (only alphanumeric, underscore, and hyphen allowed)',
      'author',
      'INVALID_CHARACTERS'
    );
  }

  return sanitized;
}

/**
 * Validate tags array
 */
export function validateTags(tags: unknown): string[] | undefined {
  if (tags === undefined || tags === null) {
    return undefined;
  }

  if (!Array.isArray(tags)) {
    throw new ValidationError('Tags must be an array', 'tags', 'INVALID_TYPE');
  }

  if (tags.length > VALIDATION_RULES.tags.maxItems) {
    throw new ValidationError(
      `Tags must not exceed ${VALIDATION_RULES.tags.maxItems} items`,
      'tags',
      'TOO_MANY_ITEMS'
    );
  }

  const sanitizedTags = tags.map((tag, index) => {
    if (typeof tag !== 'string') {
      throw new ValidationError(
        `Tag at index ${index} must be a string`,
        'tags',
        'INVALID_ITEM_TYPE'
      );
    }

    const sanitized = sanitizeString(tag);

    if (sanitized.length > VALIDATION_RULES.tags.maxLength) {
      throw new ValidationError(
        `Tag at index ${index} must not exceed ${VALIDATION_RULES.tags.maxLength} characters`,
        'tags',
        'ITEM_TOO_LONG'
      );
    }

    return sanitized;
  });

  return sanitizedTags;
}

/**
 * Validate status
 */
export function validateStatus(status: unknown): AssistantStatus {
  if (typeof status !== 'string') {
    throw new ValidationError('Status must be a string', 'status', 'INVALID_TYPE');
  }

  if (!ALLOWED_STATUSES.includes(status as AssistantStatus)) {
    throw new ValidationError(
      `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      'status',
      'INVALID_VALUE'
    );
  }

  return status as AssistantStatus;
}

/**
 * Validate version number
 */
export function validateVersion(version: unknown): number {
  if (typeof version !== 'number') {
    throw new ValidationError('Version must be a number', 'version', 'INVALID_TYPE');
  }

  if (!Number.isInteger(version) || version < 1) {
    throw new ValidationError(
      'Version must be a positive integer',
      'version',
      'INVALID_VALUE'
    );
  }

  return version;
}

/**
 * Validate boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `${fieldName} must be a boolean`,
      fieldName,
      'INVALID_TYPE'
    );
  }

  return value;
}

/**
 * Validate create assistant request
 */
export function validateCreateAssistantRequest(data: unknown): CreateAssistantRequest {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Request body must be an object', undefined, 'INVALID_BODY');
  }

  const request = data as any;

  return {
    title: validateTitle(request.title),
    desc: validateDescription(request.desc),
    emoji: validateEmoji(request.emoji),
    prompt: validatePrompt(request.prompt),
    tags: validateTags(request.tags),
    isPublic: validateBoolean(request.isPublic, 'isPublic'),
  };
}

/**
 * Validate update assistant request
 */
export function validateUpdateAssistantRequest(data: unknown): UpdateAssistantRequest {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Request body must be an object', undefined, 'INVALID_BODY');
  }

  const request = data as any;

  // Version is required for updates
  const version = validateVersion(request.version);

  const updates: UpdateAssistantRequest = { version };

  // Validate optional fields
  if (request.title !== undefined) {
    updates.title = validateTitle(request.title);
  }

  if (request.desc !== undefined) {
    updates.desc = validateDescription(request.desc);
  }

  if (request.emoji !== undefined) {
    updates.emoji = validateEmoji(request.emoji);
  }

  if (request.prompt !== undefined) {
    updates.prompt = validatePrompt(request.prompt);
  }

  if (request.tags !== undefined) {
    updates.tags = validateTags(request.tags);
  }

  if (request.isPublic !== undefined) {
    updates.isPublic = validateBoolean(request.isPublic, 'isPublic');
  }

  return updates;
}

/**
 * Validate ID parameter
 */
export function validateId(id: unknown): string {
  if (typeof id !== 'string') {
    throw new ValidationError('ID must be a string', 'id', 'INVALID_TYPE');
  }

  const sanitized = id.trim();

  if (sanitized.length === 0) {
    throw new ValidationError('ID cannot be empty', 'id', 'EMPTY_VALUE');
  }

  // Prevent path traversal
  if (sanitized.includes('..') || sanitized.includes('/') || sanitized.includes('\\')) {
    throw new ValidationError('ID contains invalid characters', 'id', 'INVALID_CHARACTERS');
  }

  return sanitized;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): void {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/json'];

  if (!file) {
    throw new ValidationError('No file provided', 'file', 'MISSING_FILE');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      'file',
      'FILE_TOO_LARGE'
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError(
      `File type must be one of: ${ALLOWED_TYPES.join(', ')}`,
      'file',
      'INVALID_FILE_TYPE'
    );
  }
}

/**
 * Sanitize SQL input (additional layer of protection)
 * Note: This should be used alongside parameterized queries
 */
export function sanitizeSqlInput(input: string): string {
  // Remove SQL keywords and special characters
  const dangerous = [
    'DROP',
    'DELETE',
    'INSERT',
    'UPDATE',
    'CREATE',
    'ALTER',
    'EXEC',
    'EXECUTE',
    'SCRIPT',
    '--',
    ';',
    'xp_',
    'sp_',
  ];

  let sanitized = input;

  dangerous.forEach((keyword) => {
    // Escape special regex characters
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove SQL comment patterns
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, ''); // /* */ comments
  sanitized = sanitized.replace(/--[^\n]*/g, ''); // -- comments

  return sanitized.trim();
}
