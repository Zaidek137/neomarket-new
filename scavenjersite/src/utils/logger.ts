import { DEBUG } from '../config/constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = 'network' | 'contract' | 'wallet' | 'general';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private createLogEntry(
    level: LogLevel,
    context: LogContext,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
      error
    };
  }

  private log(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with styling
    const styles = {
      debug: 'color: #666',
      info: 'color: #2DD4BF',
      warn: 'color: #F59E0B',
      error: 'color: #EF4444; font-weight: bold'
    };

    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const prefix = `%c[${timestamp}][${entry.context.toUpperCase()}][${entry.level.toUpperCase()}]`;

    if (entry.error) {
      console.group(prefix, styles[entry.level]);
      console.log(entry.message);
      console.error(entry.error);
      if (entry.data) console.log('Additional data:', entry.data);
      console.groupEnd();
    } else {
      console.log(prefix, styles[entry.level], entry.message, entry.data || '');
    }
  }

  debug(context: LogContext, message: string, data?: any) {
    if (DEBUG.logNetworkCalls || context !== 'network') {
      this.log(this.createLogEntry('debug', context, message, data));
    }
  }

  info(context: LogContext, message: string, data?: any) {
    this.log(this.createLogEntry('info', context, message, data));
  }

  warn(context: LogContext, message: string, data?: any) {
    this.log(this.createLogEntry('warn', context, message, data));
  }

  error(context: LogContext, message: string, error?: Error, data?: any) {
    this.log(this.createLogEntry('error', context, message, data, error));
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  getLogsByContext(context: LogContext): LogEntry[] {
    return this.logs.filter(log => log.context === context);
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();