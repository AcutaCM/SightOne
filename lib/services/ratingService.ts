/**
 * Rating Service
 * 
 * Service for managing assistant ratings and feedback.
 * Handles rating submission, retrieval, and average calculation.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import Database from 'better-sqlite3';
import path from 'path';
import { logger } from '@/lib/logger/logger';

/**
 * Rating interface
 */
export interface Rating {
  id: number;
  userId: string;
  assistantId: string;
  rating: number;
  feedback?: string;
  createdAt: string;
}

/**
 * Rating statistics interface
 */
export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Rating submission data
 */
export interface RatingSubmission {
  userId: string;
  assistantId: string;
  rating: number;
  feedback?: string;
}

/**
 * Service error types
 */
export class RatingServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RatingServiceError';
  }
}

/**
 * Rating Service Class
 */
export class RatingService {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const dataDir = path.join(process.cwd(), 'data');
    const defaultPath = path.join(dataDir, 'assistants.db');
    this.db = new Database(dbPath || defaultPath);
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
  }

  /**
   * Submit or update a rating
   * If user has already rated, updates the existing rating
   */
  submitRating(submission: RatingSubmission): Rating {
    try {
      // Validate rating value
      if (submission.rating < 1 || submission.rating > 5) {
        throw new RatingServiceError(
          'Rating must be between 1 and 5',
          'INVALID_RATING',
          { rating: submission.rating }
        );
      }

      logger.info('Submitting rating', {
        userId: submission.userId,
        assistantId: submission.assistantId,
        rating: submission.rating
      }, 'RatingService');

      const now = new Date().toISOString();

      // Check if rating already exists
      const existing = this.db.prepare(`
        SELECT id FROM ratings
        WHERE user_id = ? AND assistant_id = ?
      `).get(submission.userId, submission.assistantId) as { id: number } | undefined;

      let ratingId: number;

      if (existing) {
        // Update existing rating
        this.db.prepare(`
          UPDATE ratings
          SET rating = ?, feedback = ?, created_at = ?
          WHERE id = ?
        `).run(
          submission.rating,
          submission.feedback || null,
          now,
          existing.id
        );
        ratingId = existing.id;
        
        logger.info('Rating updated', { ratingId }, 'RatingService');
      } else {
        // Insert new rating
        const result = this.db.prepare(`
          INSERT INTO ratings (user_id, assistant_id, rating, feedback, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          submission.userId,
          submission.assistantId,
          submission.rating,
          submission.feedback || null,
          now
        );
        ratingId = result.lastInsertRowid as number;
        
        logger.info('Rating created', { ratingId }, 'RatingService');
      }

      // Update assistant's average rating
      this.updateAssistantRating(submission.assistantId);

      // Retrieve and return the rating
      const rating = this.db.prepare(`
        SELECT * FROM ratings WHERE id = ?
      `).get(ratingId) as any;

      return this.mapRating(rating);
    } catch (error) {
      logger.error('Failed to submit rating', {
        submission,
        error
      }, 'RatingService');
      
      if (error instanceof RatingServiceError) {
        throw error;
      }
      
      throw new RatingServiceError(
        'Failed to submit rating',
        'SUBMIT_RATING_ERROR',
        error
      );
    }
  }

  /**
   * Get all ratings for an assistant
   */
  getRatings(assistantId: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'recent' | 'highest' | 'lowest';
  }): Rating[] {
    try {
      const limit = options?.limit || 50;
      const offset = options?.offset || 0;
      const sortBy = options?.sortBy || 'recent';

      let orderBy = 'created_at DESC';
      if (sortBy === 'highest') {
        orderBy = 'rating DESC, created_at DESC';
      } else if (sortBy === 'lowest') {
        orderBy = 'rating ASC, created_at DESC';
      }

      const ratings = this.db.prepare(`
        SELECT * FROM ratings
        WHERE assistant_id = ?
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `).all(assistantId, limit, offset) as any[];

      return ratings.map(r => this.mapRating(r));
    } catch (error) {
      logger.error('Failed to get ratings', {
        assistantId,
        error
      }, 'RatingService');
      
      throw new RatingServiceError(
        'Failed to get ratings',
        'GET_RATINGS_ERROR',
        error
      );
    }
  }

  /**
   * Get a user's rating for an assistant
   */
  getUserRating(userId: string, assistantId: string): Rating | null {
    try {
      const rating = this.db.prepare(`
        SELECT * FROM ratings
        WHERE user_id = ? AND assistant_id = ?
      `).get(userId, assistantId) as any;

      return rating ? this.mapRating(rating) : null;
    } catch (error) {
      logger.error('Failed to get user rating', {
        userId,
        assistantId,
        error
      }, 'RatingService');
      
      throw new RatingServiceError(
        'Failed to get user rating',
        'GET_USER_RATING_ERROR',
        error
      );
    }
  }

  /**
   * Get rating statistics for an assistant
   */
  getRatingStats(assistantId: string): RatingStats {
    try {
      // Get average rating and total count
      const stats = this.db.prepare(`
        SELECT 
          AVG(rating) as average_rating,
          COUNT(*) as total_ratings
        FROM ratings
        WHERE assistant_id = ?
      `).get(assistantId) as any;

      // Get rating distribution
      const distribution = this.db.prepare(`
        SELECT rating, COUNT(*) as count
        FROM ratings
        WHERE assistant_id = ?
        GROUP BY rating
      `).all(assistantId) as any[];

      const ratingDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      distribution.forEach(d => {
        ratingDistribution[d.rating as keyof typeof ratingDistribution] = d.count;
      });

      return {
        averageRating: stats.average_rating || 0,
        totalRatings: stats.total_ratings || 0,
        ratingDistribution,
      };
    } catch (error) {
      logger.error('Failed to get rating stats', {
        assistantId,
        error
      }, 'RatingService');
      
      throw new RatingServiceError(
        'Failed to get rating stats',
        'GET_RATING_STATS_ERROR',
        error
      );
    }
  }

  /**
   * Delete a rating
   */
  deleteRating(userId: string, assistantId: string): boolean {
    try {
      const result = this.db.prepare(`
        DELETE FROM ratings
        WHERE user_id = ? AND assistant_id = ?
      `).run(userId, assistantId);

      if (result.changes > 0) {
        // Update assistant's average rating
        this.updateAssistantRating(assistantId);
        logger.info('Rating deleted', { userId, assistantId }, 'RatingService');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete rating', {
        userId,
        assistantId,
        error
      }, 'RatingService');
      
      throw new RatingServiceError(
        'Failed to delete rating',
        'DELETE_RATING_ERROR',
        error
      );
    }
  }

  /**
   * Update assistant's average rating in the assistants table
   */
  private updateAssistantRating(assistantId: string): void {
    try {
      const stats = this.getRatingStats(assistantId);
      
      this.db.prepare(`
        UPDATE assistants
        SET rating = ?
        WHERE id = ?
      `).run(stats.averageRating, assistantId);

      logger.debug('Assistant rating updated', {
        assistantId,
        averageRating: stats.averageRating
      }, 'RatingService');
    } catch (error) {
      logger.error('Failed to update assistant rating', {
        assistantId,
        error
      }, 'RatingService');
      // Don't throw - this is a secondary operation
    }
  }

  /**
   * Map database row to Rating interface
   */
  private mapRating(row: any): Rating {
    return {
      id: row.id,
      userId: row.user_id,
      assistantId: row.assistant_id,
      rating: row.rating,
      feedback: row.feedback || undefined,
      createdAt: row.created_at,
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

/**
 * Singleton instance
 */
let defaultService: RatingService | null = null;

/**
 * Get the default service instance
 */
export function getDefaultRatingService(): RatingService {
  if (!defaultService) {
    defaultService = new RatingService();
  }
  return defaultService;
}

/**
 * Reset the default service instance (useful for testing)
 */
export function resetDefaultRatingService(): void {
  if (defaultService) {
    defaultService.close();
    defaultService = null;
  }
}
