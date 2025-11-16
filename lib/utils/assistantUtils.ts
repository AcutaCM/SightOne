/**
 * Assistant Utility Functions
 * 
 * Provides normalization and transformation utilities for Assistant data.
 * Ensures consistent data handling across API responses, cache, and UI rendering.
 */

import { normalizeDate } from './dateUtils';
import type { Assistant } from '@/types/assistant';

/**
 * Normalizes an assistant object to ensure all date fields are Date objects
 * 
 * This function is critical for preventing hydration errors and ensuring
 * consistent date handling across server-side rendering and client-side rendering.
 * 
 * @param assistant - Raw assistant data that may have string dates
 * @returns Assistant object with all dates normalized to Date objects
 * 
 * @example
 * // From API response with string dates
 * const rawAssistant = {
 *   id: '123',
 *   title: 'My Assistant',
 *   createdAt: '2024-01-01T00:00:00.000Z',
 *   updatedAt: '2024-01-02T00:00:00.000Z'
 * };
 * const normalized = normalizeAssistant(rawAssistant);
 * // normalized.createdAt is now a Date object
 * 
 * @remarks
 * - Handles both required dates (createdAt) and optional dates (updatedAt, publishedAt, reviewedAt)
 * - Uses normalizeDate utility which handles undefined/null values gracefully
 * - Preserves all other assistant properties unchanged
 */
export function normalizeAssistant(assistant: any): Assistant {
  return {
    ...assistant,
    // Normalize required date field
    createdAt: normalizeDate(assistant.createdAt),
    
    // Normalize optional date fields
    updatedAt: assistant.updatedAt ? normalizeDate(assistant.updatedAt) : undefined,
    publishedAt: assistant.publishedAt ? normalizeDate(assistant.publishedAt) : undefined,
    reviewedAt: assistant.reviewedAt ? normalizeDate(assistant.reviewedAt) : undefined,
  };
}

/**
 * Normalizes an array of assistants
 * 
 * @param assistants - Array of raw assistant data
 * @returns Array of normalized assistants with Date objects
 * 
 * @example
 * const rawAssistants = await fetchAssistants();
 * const normalized = normalizeAssistants(rawAssistants);
 */
export function normalizeAssistants(assistants: any[]): Assistant[] {
  return assistants.map(normalizeAssistant);
}

/**
 * Checks if an assistant object has valid date fields
 * 
 * @param assistant - Assistant object to validate
 * @returns true if all date fields are valid Date objects
 * 
 * @example
 * if (hasValidDates(assistant)) {
 *   console.log('All dates are valid');
 * }
 */
export function hasValidDates(assistant: any): boolean {
  // Check required date
  if (!(assistant.createdAt instanceof Date)) {
    return false;
  }
  
  // Check optional dates if they exist
  if (assistant.updatedAt && !(assistant.updatedAt instanceof Date)) {
    return false;
  }
  
  if (assistant.publishedAt && !(assistant.publishedAt instanceof Date)) {
    return false;
  }
  
  if (assistant.reviewedAt && !(assistant.reviewedAt instanceof Date)) {
    return false;
  }
  
  return true;
}

/**
 * Safely extracts date fields from an assistant for serialization
 * 
 * Converts Date objects to ISO strings for JSON serialization
 * 
 * @param assistant - Assistant object with Date fields
 * @returns Object with date fields as ISO strings
 * 
 * @example
 * const serializable = serializeAssistantDates(assistant);
 * const json = JSON.stringify(serializable);
 */
export function serializeAssistantDates(assistant: Assistant): any {
  return {
    ...assistant,
    createdAt: assistant.createdAt.toISOString(),
    updatedAt: assistant.updatedAt?.toISOString(),
    publishedAt: assistant.publishedAt?.toISOString(),
    reviewedAt: assistant.reviewedAt?.toISOString(),
  };
}
