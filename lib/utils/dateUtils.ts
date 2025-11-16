/**
 * Date Utility Functions
 * 
 * Provides type-safe date handling and formatting utilities for the application.
 * Ensures consistent date handling across server and client rendering.
 */

/**
 * Normalizes various date input types to a Date object
 * 
 * @param date - Date input that can be a Date object, ISO string, or undefined
 * @returns A valid Date object
 * 
 * @example
 * normalizeDate(new Date()) // Returns the Date object
 * normalizeDate("2024-01-01") // Returns new Date("2024-01-01")
 * normalizeDate(undefined) // Returns new Date() (current date)
 */
export function normalizeDate(date: Date | string | undefined): Date {
  // Handle undefined or null - return current date
  if (!date) {
    return new Date();
  }
  
  // If already a Date object, return as-is
  if (date instanceof Date) {
    return date;
  }
  
  // Convert string to Date
  return new Date(date);
}

/**
 * Formats a date for display using locale-specific formatting
 * 
 * @param date - Date input that can be a Date object, ISO string, or undefined
 * @param locale - Optional locale string (defaults to user's locale)
 * @param options - Optional Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string
 * 
 * @example
 * formatDate(new Date("2024-01-01")) // Returns "1/1/2024" (US locale)
 * formatDate("2024-01-01", "zh-CN") // Returns "2024/1/1" (Chinese locale)
 * formatDate(undefined) // Returns current date formatted
 */
export function formatDate(
  date: Date | string | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const normalized = normalizeDate(date);
  
  // Default options for consistent formatting
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    ...options
  };
  
  return normalized.toLocaleDateString(locale, defaultOptions);
}

/**
 * Formats a date with time for detailed display
 * 
 * @param date - Date input that can be a Date object, ISO string, or undefined
 * @param locale - Optional locale string (defaults to user's locale)
 * @returns Formatted date and time string
 * 
 * @example
 * formatDateTime(new Date("2024-01-01T12:30:00")) // Returns "1/1/2024, 12:30:00 PM"
 */
export function formatDateTime(
  date: Date | string | undefined,
  locale?: string
): string {
  const normalized = normalizeDate(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  
  return normalized.toLocaleString(locale, options);
}

/**
 * Formats a date in ISO format (YYYY-MM-DD)
 * 
 * @param date - Date input that can be a Date object, ISO string, or undefined
 * @returns ISO formatted date string
 * 
 * @example
 * formatISODate(new Date("2024-01-01")) // Returns "2024-01-01"
 */
export function formatISODate(date: Date | string | undefined): string {
  const normalized = normalizeDate(date);
  return normalized.toISOString().split('T')[0];
}

/**
 * Checks if a date is valid
 * 
 * @param date - Date input to validate
 * @returns true if the date is valid, false otherwise
 * 
 * @example
 * isValidDate(new Date()) // Returns true
 * isValidDate("invalid") // Returns false
 * isValidDate(undefined) // Returns false
 */
export function isValidDate(date: Date | string | undefined): boolean {
  if (!date) {
    return false;
  }
  
  const normalized = date instanceof Date ? date : new Date(date);
  return !isNaN(normalized.getTime());
}
