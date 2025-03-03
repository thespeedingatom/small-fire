/**
 * Cache service for storing and retrieving data with TTL (Time To Live)
 */

// Default TTL in milliseconds (24 hours)
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.enabled = true;
    this.defaultTtl = DEFAULT_TTL;
  }

  /**
   * Set cache configuration
   * @param {Object} config - Cache configuration
   * @param {boolean} config.enabled - Whether caching is enabled
   * @param {number} config.ttl - Default TTL in milliseconds
   */
  configure(config = {}) {
    if (typeof config.enabled === 'boolean') {
      this.enabled = config.enabled;
    }
    
    if (typeof config.ttl === 'number' && config.ttl > 0) {
      this.defaultTtl = config.ttl;
    }
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = this.defaultTtl) {
    if (!this.enabled) return;
    
    this.cache.set(key, value);
    this.timestamps.set(key, {
      created: Date.now(),
      ttl
    });
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found or expired
   */
  get(key) {
    if (!this.enabled || !this.cache.has(key)) {
      return null;
    }
    
    const timestamp = this.timestamps.get(key);
    if (!timestamp) {
      return null;
    }
    
    const now = Date.now();
    const expiresAt = timestamp.created + timestamp.ttl;
    
    // Check if the cache entry has expired
    if (now > expiresAt) {
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Clear all values from the cache
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Get the number of items in the cache
   * @returns {number} - Number of items in the cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache
   * @returns {Array} - Array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} - Whether the key exists and is not expired
   */
  has(key) {
    if (!this.enabled || !this.cache.has(key)) {
      return false;
    }
    
    const timestamp = this.timestamps.get(key);
    if (!timestamp) {
      return false;
    }
    
    const now = Date.now();
    const expiresAt = timestamp.created + timestamp.ttl;
    
    return now <= expiresAt;
  }

  /**
   * Get the remaining TTL for a cache entry in milliseconds
   * @param {string} key - Cache key
   * @returns {number} - Remaining TTL in milliseconds, or -1 if expired/not found
   */
  ttl(key) {
    if (!this.enabled || !this.cache.has(key)) {
      return -1;
    }
    
    const timestamp = this.timestamps.get(key);
    if (!timestamp) {
      return -1;
    }
    
    const now = Date.now();
    const expiresAt = timestamp.created + timestamp.ttl;
    const remaining = expiresAt - now;
    
    return remaining > 0 ? remaining : -1;
  }
}

// Create a singleton instance
const cacheService = new CacheService();

export default cacheService;
