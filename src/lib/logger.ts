// Logger utility for controlled console output
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true' || this.isDevelopment;
  private isVerbose = process.env.NEXT_PUBLIC_VERBOSE === 'true';

  private shouldLog(level: LogLevel): boolean {
    if (level === 'error') return true; // Always log errors
    if (level === 'warn') return this.isDevelopment || this.isVerbose;
    if (level === 'info') return this.isDevelopment || this.isVerbose;
    if (level === 'debug') return this.isDebug;
    return false;
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`✅ ${message}`, ...args);
    }
  }
}

export const logger = new Logger(); 