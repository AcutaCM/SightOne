// Conditional imports for Node.js modules (server-side only)
let fs: any;
let path: any;

// Only import on server-side
if (typeof window === 'undefined') {
  fs = require('fs');
  path = require('path');
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
  module?: string;
}

export interface LoggerConfig {
  logLevel: LogLevel;
  logFilePath?: string;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  enableConsole?: boolean;
  enableFile?: boolean;
}

const DEFAULT_CONFIG: LoggerConfig = {
  logLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  logFilePath: process.env.LOG_FILE_PATH || './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  enableConsole: true,
  enableFile: process.env.NODE_ENV === 'production',
};

export class Logger {
  private config: LoggerConfig;
  private currentLogFile: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentLogFile = this.config.logFilePath || DEFAULT_CONFIG.logFilePath!;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!this.config.enableFile) return;

    try {
      const logDir = path.dirname(this.currentLogFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, meta, module } = entry;
    const moduleStr = module ? `[${module}]` : '';
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${moduleStr} ${message}${metaStr}`;
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const formatted = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.config.enableFile || typeof window !== 'undefined') return;

    try {
      // Check if log rotation is needed
      this.rotateLogsIfNeeded();

      const formatted = this.formatLogEntry(entry) + '\n';
      fs.appendFileSync(this.currentLogFile, formatted, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateLogsIfNeeded(): void {
    try {
      if (!fs.existsSync(this.currentLogFile)) return;

      const stats = fs.statSync(this.currentLogFile);
      if (stats.size < this.config.maxFileSize!) return;

      // Rotate logs
      const logDir = path.dirname(this.currentLogFile);
      const logBaseName = path.basename(this.currentLogFile, '.log');
      
      // Delete oldest log if max files reached
      const oldestLog = path.join(logDir, `${logBaseName}.${this.config.maxFiles}.log`);
      if (fs.existsSync(oldestLog)) {
        fs.unlinkSync(oldestLog);
      }

      // Shift existing logs
      for (let i = this.config.maxFiles! - 1; i >= 1; i--) {
        const oldPath = path.join(logDir, `${logBaseName}.${i}.log`);
        const newPath = path.join(logDir, `${logBaseName}.${i + 1}.log`);
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
        }
      }

      // Rename current log to .1.log
      const firstRotatedLog = path.join(logDir, `${logBaseName}.1.log`);
      fs.renameSync(this.currentLogFile, firstRotatedLog);
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  log(level: LogLevel, message: string, meta?: any, module?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      module,
    };

    this.writeToConsole(entry);
    this.writeToFile(entry);
  }

  debug(message: string, meta?: any, module?: string): void {
    this.log(LogLevel.DEBUG, message, meta, module);
  }

  info(message: string, meta?: any, module?: string): void {
    this.log(LogLevel.INFO, message, meta, module);
  }

  warn(message: string, meta?: any, module?: string): void {
    this.log(LogLevel.WARN, message, meta, module);
  }

  error(message: string, meta?: any, module?: string): void {
    this.log(LogLevel.ERROR, message, meta, module);
  }

  // Create a child logger with a specific module name
  child(module: string): ModuleLogger {
    return new ModuleLogger(this, module);
  }
}

// Module-specific logger that automatically includes module name
export class ModuleLogger {
  constructor(private logger: Logger, private module: string) {}

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta, this.module);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta, this.module);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta, this.module);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta, this.module);
  }
}

// Global logger instance
export const logger = new Logger();
