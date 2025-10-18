import { NextRequest } from 'next/server';
import { RequestMetadata } from '@/lib/types';

/**
 * API request logging utilities
 */

/**
 * Log levels for different types of events
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log entry interface
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: RequestMetadata;
  error?: Error;
  timestamp: string;
  requestId: string;
}

/**
 * Simple in-memory logger - In production, use a proper logging service
 */
class ApiLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a log entry
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, you would send logs to your logging service here
    this.outputToConsole(entry);
  }

  /**
   * Output log to console with formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const logMessage = `[${timestamp}] [${entry.level}] [${entry.requestId}] ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.metadata);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry.metadata, entry.error);
        break;
    }
  }

  /**
   * Extract metadata from request
   */
  extractRequestMetadata(request: NextRequest): RequestMetadata {
    const url = new URL(request.url);
    return {
      method: request.method,
      url: url.pathname + url.search,
      userAgent: request.headers.get('user-agent') || undefined,
      ip:
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Log an API request start
   */
  logRequest(request: NextRequest, section?: string, action?: string): string {
    const requestId = this.generateRequestId();
    const metadata = this.extractRequestMetadata(request);

    if (section) metadata.section = section;
    if (action) metadata.action = action;

    this.addLog({
      level: LogLevel.INFO,
      message: `API Request: ${request.method} ${metadata.url}`,
      metadata,
      timestamp: new Date().toISOString(),
      requestId,
    });

    return requestId;
  }

  /**
   * Log an API request completion
   */
  logResponse(requestId: string, statusCode: number, duration: number, message?: string): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;

    this.addLog({
      level,
      message: message || `API Response: ${statusCode} (${duration}ms)`,
      metadata: { duration } as RequestMetadata,
      timestamp: new Date().toISOString(),
      requestId,
    });
  }

  /**
   * Log an error
   */
  logError(requestId: string, error: Error, context?: Record<string, any>): void {
    this.addLog({
      level: LogLevel.ERROR,
      message: `API Error: ${error.message}`,
      metadata: context as RequestMetadata,
      error,
      timestamp: new Date().toISOString(),
      requestId,
    });
  }

  /**
   * Log a warning
   */
  logWarning(requestId: string, message: string, context?: Record<string, any>): void {
    this.addLog({
      level: LogLevel.WARN,
      message: `API Warning: ${message}`,
      metadata: context as RequestMetadata,
      timestamp: new Date().toISOString(),
      requestId,
    });
  }

  /**
   * Log debug information
   */
  logDebug(requestId: string, message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      this.addLog({
        level: LogLevel.DEBUG,
        message: `API Debug: ${message}`,
        metadata: context as RequestMetadata,
        timestamp: new Date().toISOString(),
        requestId,
      });
    }
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(limit = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs by request ID
   */
  getLogsByRequestId(requestId: string): LogEntry[] {
    return this.logs.filter((log) => log.requestId === requestId);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const apiLogger = new ApiLogger();

/**
 * Performance monitoring decorator for API handlers
 */
export function withPerformanceLogging<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      console.debug(`Performance: ${operation} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`Performance: ${operation} failed after ${duration}ms`, error);
      throw error;
    }
  };
}
