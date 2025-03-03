/**
 * Configuration utility for managing environment variables and settings
 */

// Default configuration values
const defaultConfig = {
  // RSS feed settings
  rssFeed: {
    url: 'RSS_FEED_URL',
    itemLimit: 10,
    refreshInterval: 3600000, // 1 hour in milliseconds
  },
  
  // AI summarization settings
  summarization: {
    model: 'claude-3-haiku-20240307',
    maxTokens: 100,
    temperature: 0.5,
    batchSize: 3,
    batchDelay: 1000, // 1 second delay between batches
    minLengthForSummarization: 150,
    fallbackSummaryLength: 200,
  },
  
  // Cache settings
  cache: {
    enabled: true,
    ttl: 86400000, // 24 hours in milliseconds
  }
};

/**
 * Get configuration with environment variable overrides
 * @returns {Object} - Configuration object
 */
export function getConfig() {
  return {
    ...defaultConfig,
    
    // Override with environment variables if available
    rssFeed: {
      ...defaultConfig.rssFeed,
      url: import.meta.env.RSS_FEED_URL || defaultConfig.rssFeed.url,
      itemLimit: parseInt(import.meta.env.RSS_ITEM_LIMIT) || defaultConfig.rssFeed.itemLimit,
    },
    
    summarization: {
      ...defaultConfig.summarization,
      model: import.meta.env.ANTHROPIC_MODEL || defaultConfig.summarization.model,
    },
    
    // API keys
    apiKeys: {
      anthropic: import.meta.env.ANTHROPIC_API_KEY || '',
    }
  };
}

/**
 * Validate that required configuration is present
 * @returns {Object} - Object with isValid flag and any error messages
 */
export function validateConfig() {
  const config = getConfig();
  const errors = [];
  
  // Check for required API keys
  if (!config.apiKeys.anthropic) {
    errors.push('Anthropic API key is missing. Please set the ANTHROPIC_API_KEY environment variable.');
  }
  
  // Check for RSS feed URL
  if (!config.rssFeed.url) {
    errors.push('RSS feed URL is missing. Please set the RSS_FEED_URL environment variable or update the default config.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
