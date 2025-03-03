import RSSParser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import { getConfig, validateConfig } from '../utils/config.js';
import cacheService from './cacheService.js';
import logger from '../utils/logger.js';

// Create a singleton RSS parser instance
const parser = new RSSParser();

// Get configuration
const config = getConfig();

// Configure cache service
cacheService.configure({
  enabled: config.cache.enabled,
  ttl: config.cache.ttl
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: config.apiKeys.anthropic,
});


// Validate configuration on initialization
const { isValid, errors } = validateConfig();
if (!isValid) {
  logger.error('Configuration validation failed:', errors.join(', '));
}

// Cache keys
const CACHE_KEYS = {
  RSS_FEED: 'rss_feed',
  SUMMARY: 'summary_'
};

/**
 * Fetches RSS feed and returns parsed items
 * @param {string} feedUrl - The URL of the RSS feed
 * @param {number} limit - Maximum number of items to return
 * @param {number} offset - Number of items to skip (for pagination)
 * @returns {Promise<Array>} - Array of RSS items
 */
export async function fetchRssFeed(feedUrl, limit = config.rssFeed.itemLimit, offset = 0) {
  // Generate a cache key for this feed URL
  const cacheKey = `${CACHE_KEYS.RSS_FEED}_${feedUrl}`;
  
  try {
    // Check cache first for all items
    let items = [];
    const cachedFeed = cacheService.get(cacheKey);
    
    if (cachedFeed) {
      logger.info('Using cached RSS feed data');
      items = cachedFeed;
    } else {
      logger.info('Fetching fresh RSS feed data');
      const response = await fetch(feedUrl, { 
        headers: { 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
      }
      
      const feedString = await response.text();
      const feed = await parser.parseString(feedString);
      items = feed.items;
      
      // Cache the feed items
      cacheService.set(cacheKey, items, config.rssFeed.refreshInterval);
    }
    
    // Apply pagination
    const paginatedItems = items.slice(offset, offset + limit);
    logger.info(`Returning ${paginatedItems.length} items (offset: ${offset}, limit: ${limit})`);
    
    return {
      items: paginatedItems,
      hasMore: offset + limit < items.length,
      total: items.length
    };
  } catch (error) {
    logger.error('Error fetching RSS feed:', error);
    return {
      items: [],
      hasMore: false,
      total: 0
    };
  }
}

/**
 * Summarizes text using Anthropic's Claude Haiku API
 * @param {string} text - Text to summarize
 * @param {number} maxTokens - Maximum tokens for the summary
 * @returns {Promise<string>} - Summarized text
 */
export async function summarizeWithAI(text, maxTokens = config.summarization.maxTokens) {
  // If text is too short, return it as is
  if (text.length < config.summarization.minLengthForSummarization) return text;
  
  // Generate a cache key based on the first 100 chars of the text
  const cacheKey = `${CACHE_KEYS.SUMMARY}${text.substring(0, 100)}`;
  
  // Check cache first
  const cachedSummary = cacheService.get(cacheKey);
  if (cachedSummary) {
    return cachedSummary;
  }
  
  // If not in cache or expired, perform summarization
  const summary = await performSummarization(text, maxTokens);
  
  // Cache the result
  cacheService.set(cacheKey, summary);
  
  return summary;
}

/**
 * Helper function to perform the actual summarization API call
 * @param {string} text - Text to summarize
 * @param {number} maxTokens - Maximum tokens for the summary
 * @returns {Promise<string>} - Summarized text
 */
async function performSummarization(text, maxTokens) {
  try {
    const response = await anthropic.messages.create({
      model: config.summarization.model,
      system: "You are a technological writer working to create a concise summary of a given text. You are looking to write news articles and summarizes content related to the business of launch-sphere (A tech blog writing articles and news about new and upcoming AI tech products/services).",
      messages: [
        {
          role: "user",
          content: `Return a CLEAN summary of the following text. Do not include any extra information or explanations. Summarize this in a few sentences: ${text}`
        }
      ],
      max_tokens: maxTokens,
      temperature: config.summarization.temperature,
    });
    
    return response.content[0].text.trim();
  } catch (error) {
    logger.error('Error summarizing text with AI:', error);
    // Return a truncated version of the original text as fallback
    return text.length > config.summarization.fallbackSummaryLength 
      ? text.substring(0, config.summarization.fallbackSummaryLength) + '...' 
      : text;
  }
}

/**
 * Processes RSS items in batches to avoid rate limiting
 * @param {Array} items - RSS items to process
 * @param {number} batchSize - Number of items to process in parallel
 * @returns {Promise<Array>} - Processed items with summaries
 */
export async function processFeedItemsInBatches(items, batchSize = config.summarization.batchSize) {
  const results = [];
  const totalBatches = Math.ceil(items.length / batchSize);
  
  logger.info(`Processing ${items.length} items in ${totalBatches} batches of ${batchSize}`);
  
  // Process items in batches to avoid rate limiting
  for (let i = 0; i < items.length; i += batchSize) {
    const batchNumber = Math.floor(i / batchSize) + 1;
    const batch = items.slice(i, i + batchSize);
    
    logger.info(`Processing batch ${batchNumber}/${totalBatches} with ${batch.length} items`);
    const batchStartTime = Date.now();
    
    const batchPromises = batch.map(async (item) => {
      try {
        const text = item.description || item.content || '';
        const summary = text ? await summarizeWithAI(text) : 'No summary available';
        return { ...item, summary };
      } catch (error) {
        logger.error(`Error processing item "${item.title}":`, error);
        return { 
          ...item, 
          summary: 'Summary unavailable at this time.' 
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    const batchEndTime = Date.now();
    const batchProcessingTime = (batchEndTime - batchStartTime) / 1000;
    logger.info(`Completed batch ${batchNumber}/${totalBatches} in ${batchProcessingTime.toFixed(2)} seconds`);
    
    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      logger.debug(`Waiting ${config.summarization.batchDelay}ms before next batch`);
      await new Promise(resolve => setTimeout(resolve, config.summarization.batchDelay));
    }
  }
  
  logger.info(`Completed processing all ${totalBatches} batches with ${results.length} total items`);
  return results;
}

/**
 * Main function to get and summarize news
 * @param {string} feedUrl - The URL of the RSS feed (optional, uses config if not provided)
 * @param {number} limit - Maximum number of items to return (optional, uses config if not provided)
 * @param {number} offset - Number of items to skip (for pagination)
 * @returns {Promise<Object>} - Object containing news items with summaries and pagination info
 */
export async function getSummarizedNews(feedUrl = config.rssFeed.url, limit = config.rssFeed.itemLimit, offset = 0) {
  logger.info(`Getting summarized news from ${feedUrl} with limit ${limit} and offset ${offset}`);
  
  const startTime = Date.now();
  const feedResult = await fetchRssFeed(feedUrl, limit, offset);
  
  if (feedResult.items.length === 0) {
    logger.warn('No news items found');
    return {
      items: [],
      hasMore: false,
      total: 0
    };
  }
  
  logger.info(`Processing ${feedResult.items.length} news items for summarization`);
  const results = await processFeedItemsInBatches(feedResult.items);
  
  const endTime = Date.now();
  const processingTime = (endTime - startTime) / 1000;
  logger.info(`Completed news processing in ${processingTime.toFixed(2)} seconds`);
  
  return {
    items: results,
    hasMore: feedResult.hasMore,
    total: feedResult.total
  };
}

/**
 * Clears the summary cache
 */
export function clearSummaryCache() {
  cacheService.clear();
}
