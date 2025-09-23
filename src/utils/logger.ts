type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

class DevLogger implements Logger {
  debug(message: string, ...args: any[]) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }

  info(message: string, ...args: any[]) {
    console.info(`[INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

class ProductionLogger implements Logger {
  debug() {}
  info() {}
  warn() {}
  error(message: string, ...args: any[]) {
    // Only log errors in production to external service if needed
    console.error(message, ...args);
  }
}

export const logger: Logger = import.meta.env.PROD 
  ? new ProductionLogger() 
  : new DevLogger();