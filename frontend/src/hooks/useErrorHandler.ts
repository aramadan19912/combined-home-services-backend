import { useState, useEffect, useCallback } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  error: Error;
  errorInfo?: string;
  userAgent: string;
  url: string;
  userId?: string;
  componentStack?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorLog: ErrorLogEntry[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error, errorInfo?: string, additionalData?: any): void {
    const entry: ErrorLogEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      error,
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: additionalData?.userId,
      componentStack: errorInfo,
    };

    this.errorLog.unshift(entry);
    
    // Keep only recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', entry);
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(entry);
    }
  }

  private async sendToErrorService(entry: ErrorLogEntry): Promise<void> {
    try {
      // Mock implementation - replace with actual error reporting service
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: entry.error.message,
          stack: entry.error.stack,
          timestamp: entry.timestamp,
          url: entry.url,
          userAgent: entry.userAgent,
          userId: entry.userId,
          componentStack: entry.componentStack,
        }),
      });
    } catch (error) {
      console.error('Failed to send error to service:', error);
    }
  }

  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getErrorStats(): { total: number; last24h: number; mostCommon: string } {
    const now = new Date();
    const last24h = this.errorLog.filter(
      entry => now.getTime() - entry.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    const errorMessages = this.errorLog.map(entry => entry.error.message);
    const mostCommon = errorMessages.reduce((acc, msg) => {
      acc[msg] = (acc[msg] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonError = Object.entries(mostCommon)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      total: this.errorLog.length,
      last24h,
      mostCommon: mostCommonError,
    };
  }
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  const logger = ErrorLogger.getInstance();

  const handleError = useCallback((error: Error, errorInfo?: string) => {
    setErrorState({
      hasError: true,
      error,
      errorInfo: errorInfo || null,
    });

    logger.logError(error, errorInfo);
  }, [logger]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }, []);

  const logError = useCallback((error: Error, context?: string, additionalData?: any) => {
    logger.logError(error, context, additionalData);
  }, [logger]);

  // Global error handler
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        'Unhandled Promise Rejection'
      );
    };

    const handleGlobalError = (event: ErrorEvent) => {
      logError(
        new Error(event.message),
        `Global Error at ${event.filename}:${event.lineno}:${event.colno}`
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [logError]);

  return {
    ...errorState,
    handleError,
    clearError,
    logError,
    getErrorLog: () => logger.getErrorLog(),
    getErrorStats: () => logger.getErrorStats(),
    clearErrorLog: () => logger.clearErrorLog(),
  };
};
