/**
 * Assistant Data Validation Utilities
 * 
 * Provides validation and sanitization for assistant data to ensure
 * data integrity and handle incomplete or malformed data gracefully.
 * 
 * Requirements: 8.1, 8.2
 */

import { Assistant } from '@/types/assistant';

/**
 * Required fields for an assistant
 */
const REQUIRED_FIELDS = ['id', 'title'] as const;

/**
 * Default values for optional fields
 */
const DEFAULT_VALUES = {
  desc: '',
  emoji: '🤖',
  prompt: '',
  tags: [] as string[],
  createdAt: new Date(),
  isPublic: false,
  status: 'draft' as const,
  creatorName: 'Unknown',
  version: 1,
  usageCount: 0,
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: Assistant;
}

/**
 * Validate assistant data
 * 
 * @param data - The assistant data to validate
 * @returns Validation result with errors, warnings, and sanitized data
 */
export function validateAssistantData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Assistant data is null or not an object'],
      warnings: [],
    };
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // If required fields are missing, return early
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  // Validate field types and values
  if (typeof data.id !== 'string' || data.id.trim() === '') {
    errors.push('Field "id" must be a non-empty string');
  }

  if (typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push('Field "title" must be a non-empty string');
  }

  // Check optional fields and add warnings for missing ones
  if (!data.desc) {
    warnings.push('Field "desc" is missing, using default empty string');
  }

  if (!data.emoji) {
    warnings.push('Field "emoji" is missing, using default emoji');
  }

  if (!data.prompt) {
    warnings.push('Field "prompt" is missing, using default empty string');
  }

  if (!data.tags || !Array.isArray(data.tags)) {
    warnings.push('Field "tags" is missing or invalid, using default empty array');
  } else {
    // Validate array elements are strings
    const invalidTags = data.tags.filter((t: any) => typeof t !== 'string');
    if (invalidTags.length > 0) {
      warnings.push(`Found ${invalidTags.length} non-string tag(s), filtering them out`);
    }
  }

  if (!data.createdAt) {
    warnings.push('Field "createdAt" is missing, using current date');
  }

  // Create sanitized data with defaults
  const sanitizedData: Assistant = {
    id: String(data.id).trim(),
    title: String(data.title).trim(),
    desc: data.desc ? String(data.desc) : DEFAULT_VALUES.desc,
    emoji: data.emoji ? String(data.emoji) : DEFAULT_VALUES.emoji,
    prompt: data.prompt ? String(data.prompt) : DEFAULT_VALUES.prompt,
    tags: Array.isArray(data.tags) ? data.tags.filter((t: any) => typeof t === 'string') : DEFAULT_VALUES.tags,
    category: Array.isArray(data.category) ? data.category.filter((c: any) => typeof c === 'string') : undefined,
    createdAt: data.createdAt ? new Date(data.createdAt) : DEFAULT_VALUES.createdAt,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    isPublic: typeof data.isPublic === 'boolean' ? data.isPublic : DEFAULT_VALUES.isPublic,
    status: data.status || DEFAULT_VALUES.status,
    author: data.author || DEFAULT_VALUES.creatorName,
    version: typeof data.version === 'number' ? data.version : 1,
    usageCount: typeof data.usageCount === 'number' ? data.usageCount : 0,
    rating: typeof data.rating === 'number' ? data.rating : undefined,
  };

  // Add optional fields if present
  if (data.reviewedAt) {
    sanitizedData.reviewedAt = new Date(data.reviewedAt);
  }

  if (data.publishedAt) {
    sanitizedData.publishedAt = new Date(data.publishedAt);
  }

  if (data.reviewNote) {
    sanitizedData.reviewNote = data.reviewNote;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData,
  };
}

/**
 * Sanitize assistant data with logging
 * 
 * @param data - The assistant data to sanitize
 * @param logWarnings - Whether to log warnings to console
 * @returns Sanitized assistant data or null if validation fails
 */
export function sanitizeAssistantData(
  data: any,
  logWarnings: boolean = true
): Assistant | null {
  const result = validateAssistantData(data);

  if (!result.isValid) {
    console.error('[AssistantValidation] Validation failed:', result.errors);
    return null;
  }

  if (logWarnings && result.warnings.length > 0) {
    console.warn('[AssistantValidation] Validation warnings:', result.warnings);
  }

  return result.sanitizedData!;
}

/**
 * Validate an array of assistants
 * 
 * @param dataArray - Array of assistant data to validate
 * @param logWarnings - Whether to log warnings to console
 * @returns Array of valid assistants (invalid ones are filtered out)
 */
export function validateAssistantArray(
  dataArray: any[],
  logWarnings: boolean = true
): Assistant[] {
  if (!Array.isArray(dataArray)) {
    console.error('[AssistantValidation] Input is not an array');
    return [];
  }

  const validAssistants: Assistant[] = [];
  let invalidCount = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const sanitized = sanitizeAssistantData(dataArray[i], logWarnings);
    
    if (sanitized) {
      validAssistants.push(sanitized);
    } else {
      invalidCount++;
      console.error(`[AssistantValidation] Invalid assistant at index ${i}`);
    }
  }

  if (invalidCount > 0) {
    console.warn(
      `[AssistantValidation] Filtered out ${invalidCount} invalid assistant(s) from array`
    );
  }

  return validAssistants;
}

/**
 * Check if assistant has all required fields
 * 
 * @param data - The assistant data to check
 * @returns True if all required fields are present
 */
export function hasRequiredFields(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return REQUIRED_FIELDS.every(field => {
    const value = data[field];
    return value !== null && value !== undefined && value !== '';
  });
}

/**
 * Get missing required fields
 * 
 * @param data - The assistant data to check
 * @returns Array of missing field names
 */
export function getMissingFields(data: any): string[] {
  if (!data || typeof data !== 'object') {
    return [...REQUIRED_FIELDS];
  }

  return REQUIRED_FIELDS.filter(field => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });
}

/**
 * Merge assistant data with defaults
 * 
 * @param data - Partial assistant data
 * @returns Complete assistant data with defaults filled in
 */
export function mergeWithDefaults(data: Partial<Assistant>): Assistant {
  return {
    ...DEFAULT_VALUES,
    ...data,
    id: data.id || '',
    title: data.title || '',
  } as Assistant;
}
