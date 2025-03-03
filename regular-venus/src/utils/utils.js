import logger from './logger.js';

/**
 * Formats a date string into a readable format (e.g., "Mar 3, 2025")
 * @param {string|Date} dateInput - The date string or Date object to format
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string} - Formatted date or fallback
 */
export function formatDate(dateInput, fallback = '') {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    logger.warn(`Failed to format date: ${dateInput}`, error.message);
    return fallback;
  }
}

/**
 * Generates a unique ID from a string using a hash function
 * @param {string} input - The input string to hash
 * @returns {number} - A unique positive integer ID
 */
export function generateId(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    logger.warn('Invalid input for ID generation, using random ID');
    return Math.floor(Math.random() * 1000000); // Fallback to random ID
  }

  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Validates and normalizes a news item object
 * @param {Object} item - Raw news item from RSS feed
 * @param {Object} defaults - Default values for missing properties
 * @returns {Object} - Normalized news item
 */
export function normalizeNewsItem(item, defaults = {}) {
  const {
    title = 'AI Product Launch',
    summary = 'No summary available',
    link = '#',
    pubDate = '',
  } = { ...defaults, ...item };

  const normalized = {
    id: generateId(link),
    title: typeof title === 'string' && title.trim() ? title.trim() : 'AI Product Launch',
    summary: typeof summary === 'string' && summary.trim() ? summary.trim() : 'No summary available',
    url: typeof link === 'string' && link.trim() ? link.trim() : '#',
    date: formatDate(pubDate),
  };

  logger.debug('Normalized news item', normalized);
  return normalized;
}

/**
 * Checks if an array is valid and non-empty
 * @param {Array} arr - The array to check
 * @returns {boolean} - True if valid and non-empty, false otherwise
 */
export function isValidArray(arr) {
  const isValid = Array.isArray(arr) && arr.length > 0;
  if (!isValid) {
    logger.debug('Array validation failed', { arr });
  }
  return isValid;
}

/**
 * Extracts error message from an error object or provides a default
 * @param {Error|string} error - The error object or string
 * @param {string} defaultMessage - Default message if error is invalid
 * @returns {string} - Formatted error message
 */
export function getErrorMessage(error, defaultMessage = 'An unexpected error occurred') {
  if (error instanceof Error) {
    logger.error('Error encountered', { message: error.message, stack: error.stack });
    return error.message || defaultMessage;
  }
  if (typeof error === 'string') {
    logger.error('Error string encountered', { error });
    return error;
  }
  logger.error('Unknown error type', { error });
  return defaultMessage;
}