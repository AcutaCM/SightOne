/**
 * Unit tests for date utility functions
 */

import {
  normalizeDate,
  formatDate,
  formatDateTime,
  formatISODate,
  isValidDate
} from '@/lib/utils/dateUtils';

describe('dateUtils', () => {
  describe('normalizeDate', () => {
    it('should return the same Date object when passed a Date', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = normalizeDate(date);
      expect(result).toBe(date);
      expect(result instanceof Date).toBe(true);
    });

    it('should convert ISO string to Date object', () => {
      const dateString = '2024-01-15T10:30:00';
      const result = normalizeDate(dateString);
      expect(result instanceof Date).toBe(true);
      expect(result.toISOString()).toBe(new Date(dateString).toISOString());
    });

    it('should return current date when passed undefined', () => {
      const before = new Date();
      const result = normalizeDate(undefined);
      const after = new Date();
      
      expect(result instanceof Date).toBe(true);
      expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('formatDate', () => {
    it('should format Date object to locale string', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/1/);
      expect(result).toMatch(/15/);
    });

    it('should format ISO string to locale string', () => {
      const dateString = '2024-01-15T10:30:00';
      const result = formatDate(dateString);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/2024/);
    });

    it('should handle undefined by formatting current date', () => {
      const result = formatDate(undefined);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should respect custom locale', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date, 'zh-CN');
      expect(typeof result).toBe('string');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object with time', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDateTime(date);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/10/);
      expect(result).toMatch(/30/);
    });
  });

  describe('formatISODate', () => {
    it('should format Date object to ISO date string (YYYY-MM-DD)', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatISODate(date);
      expect(result).toBe('2024-01-15');
    });

    it('should format ISO string to ISO date string', () => {
      const dateString = '2024-01-15T10:30:00';
      const result = formatISODate(dateString);
      expect(result).toBe('2024-01-15');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid Date object', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(isValidDate(date)).toBe(true);
    });

    it('should return true for valid ISO string', () => {
      expect(isValidDate('2024-01-15T10:30:00')).toBe(true);
    });

    it('should return false for invalid date string', () => {
      expect(isValidDate('invalid-date')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidDate('')).toBe(false);
    });
  });
});
