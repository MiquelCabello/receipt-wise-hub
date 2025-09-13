type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private requestId = this.generateRequestId();

  private generateRequestId(): string {
    return `req_${Math.random().toString(36).substring(2, 15)}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      requestId: this.requestId,
      ...context,
    };

    if (this.isDev) {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}] ${message}`, context || '');
    }

    // In production, you could send logs to a service like LogRocket, Sentry, etc.
    if (!this.isDev && level === 'error') {
      // Example: Send to external logging service
      // sendToLoggingService(logEntry);
    }

    return logEntry;
  }

  debug(message: string, context?: LogContext) {
    return this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    return this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    return this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    };
    return this.log('error', message, errorContext);
  }

  // Performance monitoring
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }
}

export const logger = new Logger();

// Performance monitoring hook
export function usePerformanceMonitor(action: string) {
  return logger.time(action);
}