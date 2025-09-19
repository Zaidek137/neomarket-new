import { logger } from './logger';

interface ErrorDetails {
  code?: string | number;
  message: string;
  context: string;
  timestamp: string;
  stack?: string;
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private errors: ErrorDetails[] = [];
  private maxErrors: number = 100;

  trackError(error: Error | unknown, context: string, metadata?: Record<string, any>) {
    const errorDetails: ErrorDetails = {
      message: error instanceof Error ? error.message : String(error),
      context,
      timestamp: new Date().toISOString(),
      metadata
    };

    if (error instanceof Error) {
      errorDetails.stack = error.stack;
      if ('code' in error) {
        errorDetails.code = (error as any).code;
      }
    }

    this.errors.push(errorDetails);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log the error
    logger.error(
      context as any,
      errorDetails.message,
      error instanceof Error ? error : new Error(errorDetails.message),
      metadata
    );

    return errorDetails;
  }

  getRecentErrors(count: number = 10): ErrorDetails[] {
    return this.errors.slice(-count);
  }

  getErrorsByContext(context: string): ErrorDetails[] {
    return this.errors.filter(error => error.context === context);
  }

  clearErrors() {
    this.errors = [];
  }

  hasRecentError(context: string, timeWindowMs: number = 5000): boolean {
    const now = Date.now();
    return this.errors.some(error => 
      error.context === context && 
      (now - new Date(error.timestamp).getTime()) < timeWindowMs
    );
  }
}

export const errorTracker = new ErrorTracker();