/**
 * Centralized Logging System
 * 
 * Provides structured logging with different severity levels
 * Can be extended to send logs to external services
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
}

const LogLevelNames = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARN',
  3: 'ERROR',
  4: 'CRITICAL'
}

// Default log level based on environment
const DEFAULT_LOG_LEVEL =
  process.env.LOG_LEVEL === 'debug'
    ? LogLevel.DEBUG
    : process.env.LOG_LEVEL === 'info'
      ? LogLevel.INFO
      : process.env.NODE_ENV === 'production'
        ? LogLevel.WARN
        : LogLevel.DEBUG

let currentLogLevel = DEFAULT_LOG_LEVEL

/**
 * Format timestamp
 */
function formatTimestamp() {
  return new Date().toISOString()
}

/**
 * Format log output
 */
function formatLog(level, category, message, context = {}) {
  return {
    timestamp: formatTimestamp(),
    level: LogLevelNames[level],
    category,
    message,
    context: Object.keys(context).length > 0 ? context : undefined,
    env: process.env.NODE_ENV,
    pid: process.pid
  }
}

/**
 * Output log to console (can be replaced with external service)
 */
function outputLog(logObject) {
  const logString = JSON.stringify(logObject)

  switch (logObject.level) {
    case 'DEBUG':
      console.debug(logString)
      break
    case 'INFO':
      console.info(logString)
      break
    case 'WARN':
      console.warn(logString)
      break
    case 'ERROR':
      console.error(logString)
      break
    case 'CRITICAL':
      console.error(logString)
      // In production, alert on critical errors
      if (process.env.NODE_ENV === 'production') {
        sendCriticalAlert(logObject)
      }
      break
    default:
      console.log(logString)
  }
}

/**
 * Send critical alert (integrate with monitoring service)
 */
async function sendCriticalAlert(logObject) {
  // TODO: Integrate with Sentry, PagerDuty, Slack, etc.
  // Example:
  // await fetch(process.env.ALERT_WEBHOOK_URL, {
  //   method: 'POST',
  //   body: JSON.stringify(logObject)
  // })
}

/**
 * Logger class for structured logging
 */
class Logger {
  constructor(category = 'app') {
    this.category = category
  }

  debug(message, context = {}) {
    if (currentLogLevel <= LogLevel.DEBUG) {
      const log = formatLog(LogLevel.DEBUG, this.category, message, context)
      outputLog(log)
    }
  }

  info(message, context = {}) {
    if (currentLogLevel <= LogLevel.INFO) {
      const log = formatLog(LogLevel.INFO, this.category, message, context)
      outputLog(log)
    }
  }

  warn(message, context = {}) {
    if (currentLogLevel <= LogLevel.WARN) {
      const log = formatLog(LogLevel.WARN, this.category, message, context)
      outputLog(log)
    }
  }

  error(message, error = null, context = {}) {
    if (currentLogLevel <= LogLevel.ERROR) {
      const errorContext = {
        ...context,
        ...(error instanceof Error && {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
      }
      const log = formatLog(LogLevel.ERROR, this.category, message, errorContext)
      outputLog(log)
    }
  }

  critical(message, error = null, context = {}) {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
    const log = formatLog(LogLevel.CRITICAL, this.category, message, errorContext)
    outputLog(log)
  }

  /**
   * Log API request
   */
  logRequest(method, url, status, duration, context = {}) {
    const message = `${method} ${url} - ${status}`
    const logContext = {
      method,
      url,
      status,
      duration: `${duration}ms`,
      ...context
    }

    if (status >= 400) {
      this.warn(message, logContext)
    } else {
      this.info(message, logContext)
    }
  }

  /**
   * Log database operation
   */
  logDatabase(operation, collection, duration, context = {}) {
    this.debug(`DB: ${operation} on ${collection}`, {
      duration: `${duration}ms`,
      ...context
    })
  }

  /**
   * Log blockchain operation
   */
  logBlockchain(operation, result, duration, context = {}) {
    this.info(`Blockchain: ${operation}`, {
      duration: `${duration}ms`,
      result: result?.substring(0, 50) + '...',
      ...context
    })
  }

  /**
   * Log authentication event
   */
  logAuth(event, user, context = {}) {
    this.info(`Auth: ${event}`, {
      user: user?.email || user?.id || 'unknown',
      ...context
    })
  }

  /**
   * Log security event
   */
  logSecurity(event, context = {}) {
    this.warn(`Security: ${event}`, context)
  }
}

/**
 * Create logger instance for a module
 */
export function createLogger(category = 'app') {
  return new Logger(category)
}

/**
 * Set global log level
 */
export function setLogLevel(level) {
  if (typeof level === 'string') {
    currentLogLevel = LogLevel[level.toUpperCase()] || LogLevel.INFO
  } else {
    currentLogLevel = level
  }
}

/**
 * Get current log level
 */
export function getLogLevel() {
  return currentLogLevel
}

// Export for convenience
export { LogLevel, Logger }

// Create default logger
export const logger = new Logger('app')
