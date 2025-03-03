/**
 * Logger utility for consistent logging across the application
 */

// Log levels
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Default configuration
const defaultConfig = {
  level: LogLevel.INFO, // Default log level
  enableTimestamps: true, // Include timestamps in logs
  enableConsole: true, // Log to console
};

// Current configuration
let config = { ...defaultConfig };

/**
 * Configure the logger
 * @param {Object} options - Logger configuration options
 */
export function configure(options = {}) {
  config = { ...defaultConfig, ...options };
}

/**
 * Format a log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {string} - Formatted log message
 */
function formatMessage(level, message, data) {
  const parts = [];
  
  // Add timestamp if enabled
  if (config.enableTimestamps) {
    parts.push(`[${new Date().toISOString()}]`);
  }
  
  // Add log level
  parts.push(`[${level.toUpperCase()}]`);
  
  // Add message
  parts.push(message);
  
  // Add data if provided
  if (data) {
    try {
      if (typeof data === 'string') {
        parts.push(data);
      } else {
        parts.push(JSON.stringify(data));
      }
    } catch (error) {
      parts.push('[Error serializing data]');
    }
  }
  
  return parts.join(' ');
}

/**
 * Check if a log level should be logged
 * @param {string} level - Log level to check
 * @returns {boolean} - Whether the log level should be logged
 */
function shouldLog(level) {
  const levels = Object.values(LogLevel);
  const configLevelIndex = levels.indexOf(config.level);
  const logLevelIndex = levels.indexOf(level);
  
  return logLevelIndex >= configLevelIndex;
}

/**
 * Log a message at the debug level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
export function debug(message, data) {
  if (!shouldLog(LogLevel.DEBUG)) return;
  
  const formattedMessage = formatMessage(LogLevel.DEBUG, message, data);
  
  if (config.enableConsole) {
    console.debug(formattedMessage);
  }
}

/**
 * Log a message at the info level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
export function info(message, data) {
  if (!shouldLog(LogLevel.INFO)) return;
  
  const formattedMessage = formatMessage(LogLevel.INFO, message, data);
  
  if (config.enableConsole) {
    console.info(formattedMessage);
  }
}

/**
 * Log a message at the warn level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
export function warn(message, data) {
  if (!shouldLog(LogLevel.WARN)) return;
  
  const formattedMessage = formatMessage(LogLevel.WARN, message, data);
  
  if (config.enableConsole) {
    console.warn(formattedMessage);
  }
}

/**
 * Log a message at the error level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
export function error(message, data) {
  if (!shouldLog(LogLevel.ERROR)) return;
  
  const formattedMessage = formatMessage(LogLevel.ERROR, message, data);
  
  if (config.enableConsole) {
    console.error(formattedMessage);
  }
}

// Create a default export with all methods
const logger = {
  configure,
  debug,
  info,
  warn,
  error,
  LogLevel
};

export default logger;
