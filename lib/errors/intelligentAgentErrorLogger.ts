/**
 * Intelligent Agent Error Logger
 * 
 * Handles logging of errors with context, user commands, and stack traces.
 * 
 * Requirement: 8.4
 */

import { logger } from '@/lib/logger/logger';
import { IntelligentAgentError, IntelligentAgentErrorType } from './intelligentAgentErrors';

/**
 * Error log entry structure
 */
export interface ErrorLogEntry {
  timestamp: string;
  errorType: IntelligentAgentErrorType;
  severity: string;
  userMessage: string;
  technicalMessage: string;
  userCommand?: string;
  context?: Record<string, any>;
  stack?: string;
  sessionId?: string;
  userId?: string;
}

/**
 * Error statistics for monitoring
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: ErrorLogEntry[];
  consecutiveErrors: number;
  lastErrorTime?: Date;
}

/**
 * Intelligent Agent Error Logger
 */
export class IntelligentAgentErrorLogger {
  private errorStats: ErrorStatistics = {
    totalErrors: 0,
    errorsByType: {},
    errorsBySeverity: {},
    recentErrors: [],
    consecutiveErrors: 0,
  };

  private readonly MAX_RECENT_ERRORS = 50;
  private readonly CONSECUTIVE_ERROR_THRESHOLD = 3;
  private readonly ERROR_RESET_TIMEOUT = 60000; // 1 minute

  private errorResetTimer?: NodeJS.Timeout;

  /**
   * Log an error with full context
   */
  logError(
    error: IntelligentAgentError,
    userCommand?: string,
    additionalContext?: Record<string, any>
  ): void {
    // Create log entry
    const logEntry: ErrorLogEntry = {
      timestamp: error.timestamp.toISOString(),
      errorType: error.type,
      severity: error.severity,
      userMessage: error.userMessage,
      technicalMessage: error.technicalMessage,
      userCommand,
      context: {
        ...error.context,
        ...additionalContext,
      },
      stack: error.stack,
    };

    // Log to console with appropriate level
    this.logToConsole(logEntry);

    // Log to file system via logger
    this.logToFile(logEntry);

    // Update statistics
    this.updateStatistics(logEntry);

    // Check for consecutive errors
    this.checkConsecutiveErrors();
  }

  /**
   * Log to console with color coding
   */
  private logToConsole(entry: ErrorLogEntry): void {
    const severityColors: Record<string, string> = {
      low: '\x1b[36m',      // Cyan
      medium: '\x1b[33m',   // Yellow
      high: '\x1b[31m',     // Red
      critical: '\x1b[35m', // Magenta
    };

    const color = severityColors[entry.severity] || '\x1b[37m';
    const reset = '\x1b[0m';

    console.error(
      `${color}[IntelligentAgent Error]${reset} ${entry.errorType}`,
      `\n  User Message: ${entry.userMessage}`,
      `\n  Technical: ${entry.technicalMessage}`,
      entry.userCommand ? `\n  User Command: "${entry.userCommand}"` : '',
      entry.context ? `\n  Context: ${JSON.stringify(entry.context, null, 2)}` : ''
    );

    if (entry.stack) {
      console.error(`  Stack Trace:\n${entry.stack}`);
    }
  }

  /**
   * Log to file system
   */
  private logToFile(entry: ErrorLogEntry): void {
    logger.error(
      `Intelligent Agent Error: ${entry.errorType}`,
      {
        errorType: entry.errorType,
        severity: entry.severity,
        userMessage: entry.userMessage,
        technicalMessage: entry.technicalMessage,
        userCommand: entry.userCommand,
        context: entry.context,
        stack: entry.stack,
      },
      'IntelligentAgentErrorLogger'
    );
  }

  /**
   * Update error statistics
   */
  private updateStatistics(entry: ErrorLogEntry): void {
    // Increment total
    this.errorStats.totalErrors++;

    // Count by type
    this.errorStats.errorsByType[entry.errorType] = 
      (this.errorStats.errorsByType[entry.errorType] || 0) + 1;

    // Count by severity
    this.errorStats.errorsBySeverity[entry.severity] = 
      (this.errorStats.errorsBySeverity[entry.severity] || 0) + 1;

    // Add to recent errors
    this.errorStats.recentErrors.unshift(entry);
    if (this.errorStats.recentErrors.length > this.MAX_RECENT_ERRORS) {
      this.errorStats.recentErrors.pop();
    }

    // Track consecutive errors
    const now = new Date();
    const lastErrorTime = this.errorStats.lastErrorTime;
    
    if (lastErrorTime && (now.getTime() - lastErrorTime.getTime()) < this.ERROR_RESET_TIMEOUT) {
      this.errorStats.consecutiveErrors++;
    } else {
      this.errorStats.consecutiveErrors = 1;
    }

    this.errorStats.lastErrorTime = now;

    // Reset consecutive counter after timeout
    if (this.errorResetTimer) {
      clearTimeout(this.errorResetTimer);
    }
    this.errorResetTimer = setTimeout(() => {
      this.errorStats.consecutiveErrors = 0;
    }, this.ERROR_RESET_TIMEOUT);
  }

  /**
   * Check for consecutive errors and warn user
   */
  private checkConsecutiveErrors(): void {
    if (this.errorStats.consecutiveErrors >= this.CONSECUTIVE_ERROR_THRESHOLD) {
      console.warn(
        `\x1b[33m[IntelligentAgent Warning]\x1b[0m ` +
        `检测到连续 ${this.errorStats.consecutiveErrors} 个错误。` +
        `建议检查配置或查看文档。`
      );

      logger.warn(
        `Consecutive errors detected: ${this.errorStats.consecutiveErrors}`,
        {
          consecutiveErrors: this.errorStats.consecutiveErrors,
          recentErrors: this.errorStats.recentErrors.slice(0, 5),
        },
        'IntelligentAgentErrorLogger'
      );
    }
  }

  /**
   * Get error statistics
   */
  getStatistics(): ErrorStatistics {
    return { ...this.errorStats };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.errorStats.recentErrors.slice(0, count);
  }

  /**
   * Check if consecutive error threshold is exceeded
   */
  hasExceededErrorThreshold(): boolean {
    return this.errorStats.consecutiveErrors >= this.CONSECUTIVE_ERROR_THRESHOLD;
  }

  /**
   * Reset error statistics
   */
  resetStatistics(): void {
    this.errorStats = {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: [],
      consecutiveErrors: 0,
    };

    if (this.errorResetTimer) {
      clearTimeout(this.errorResetTimer);
    }

    logger.info('Error statistics reset', {}, 'IntelligentAgentErrorLogger');
  }

  /**
   * Export error logs for debugging
   */
  exportErrorLogs(): string {
    const logs = this.errorStats.recentErrors.map(entry => {
      return [
        `[${entry.timestamp}] ${entry.errorType} (${entry.severity})`,
        `User Message: ${entry.userMessage}`,
        `Technical: ${entry.technicalMessage}`,
        entry.userCommand ? `Command: "${entry.userCommand}"` : '',
        entry.context ? `Context: ${JSON.stringify(entry.context)}` : '',
        entry.stack ? `Stack:\n${entry.stack}` : '',
        '---',
      ].filter(Boolean).join('\n');
    }).join('\n\n');

    return `Intelligent Agent Error Logs\n` +
           `Generated: ${new Date().toISOString()}\n` +
           `Total Errors: ${this.errorStats.totalErrors}\n` +
           `Consecutive Errors: ${this.errorStats.consecutiveErrors}\n` +
           `\n${'='.repeat(80)}\n\n` +
           logs;
  }
}

// Singleton instance
export const intelligentAgentErrorLogger = new IntelligentAgentErrorLogger();
