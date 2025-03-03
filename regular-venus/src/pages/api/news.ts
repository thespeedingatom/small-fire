import type { APIRoute } from 'astro';
import { getSummarizedNews } from '../../services/rssService.js';
import { normalizeNewsItem, isValidArray } from '../../utils/utils.js';

// Define types for the API
interface NewsItem {
  title?: string;
  description?: string;
  content?: string;
  link?: string;
  pubDate?: string;
  summary?: string;
  [key: string]: any;
}

interface NormalizedNewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  url: string;
}

interface NewsResult {
  items: NewsItem[];
  hasMore: boolean;
  total: number;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '5');
    
    // Parse filter parameters
    const search = url.searchParams.get('search') || '';
    const sortOrder = url.searchParams.get('sortOrder') || 'newest';
    const categories = url.searchParams.get('categories')?.split(',') || [];
    const sources = url.searchParams.get('sources')?.split(',') || [];
    
    // Validate parameters
    if (isNaN(offset) || isNaN(limit) || offset < 0 || limit <= 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid parameters. Offset and limit must be positive numbers.'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Fetch news items with pagination
    const newsResult = await getSummarizedNews(undefined, limit, offset) as NewsResult;
    
    // Check if we have valid results
    if (!isValidArray(newsResult.items)) {
      return new Response(
        JSON.stringify({
          items: [],
          hasMore: false,
          total: 0
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Normalize the news items
    let normalizedItems = newsResult.items.map((item: NewsItem) => normalizeNewsItem(item) as NormalizedNewsItem);
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      normalizedItems = normalizedItems.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.summary.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (sortOrder === 'oldest') {
      normalizedItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortOrder === 'newest') {
      normalizedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Apply pagination after filtering
    const totalFilteredItems = normalizedItems.length;
    normalizedItems = normalizedItems.slice(offset, offset + limit);
    
    // Return the response
    return new Response(
      JSON.stringify({
        items: normalizedItems,
        hasMore: offset + limit < totalFilteredItems,
        total: totalFilteredItems
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred while fetching news.'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
