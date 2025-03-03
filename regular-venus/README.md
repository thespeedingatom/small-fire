# Launch Sphere

A modern, responsive web application that fetches RSS feeds and uses AI to summarize article content. Built with Astro.js and DaisyUI for optimal performance and a sleek user interface.

## Features

- **RSS Feed Integration**: Automatically fetches and parses RSS feeds
- **AI-Powered Summaries**: Uses Anthropic's Claude Haiku to generate concise summaries of article content
- **Responsive Design**: Optimized for all device sizes (mobile, tablet, desktop)
- **DaisyUI Components**: Modern UI components with consistent design language
- **Theme System**: Light and dark themes with seamless transitions
- **Performance Optimized**: Implements caching and batch processing for efficient API usage
- **Error Handling**: Graceful fallbacks for network or API failures

## Technical Implementation

### RSS Feed Processing

The RSS feed processing has been optimized with the following features:

1. **Caching System**: 
   - Implements a TTL (Time To Live) based caching system
   - Avoids redundant API calls for previously summarized content
   - Configurable cache duration

2. **Batch Processing**:
   - Processes RSS items in configurable batches
   - Prevents rate limiting issues with API providers
   - Adds controlled delays between batches

3. **Error Handling**:
   - Graceful fallbacks when API calls fail
   - Provides truncated content as fallback summaries
   - Comprehensive logging for debugging

4. **Configuration Management**:
   - Centralized configuration system
   - Environment variable support
   - Default fallback values

### UI/UX Improvements

1. **DaisyUI Integration**:
   - Component-based UI library for Tailwind CSS
   - Consistent design language across the application
   - Pre-built components with customizable themes
   - Reduced CSS footprint with utility-first approach

2. **Modern Design**:
   - Clean, minimalist interface
   - Card-based layout for content
   - Subtle animations and transitions
   - Enhanced visual hierarchy

3. **Responsive Layout**:
   - Mobile-first approach
   - Adapts to different screen sizes
   - Optimized typography and spacing
   - Improved navigation on mobile devices

4. **Theme System**:
   - Light and dark themes with seamless transitions
   - System preference detection
   - Manual toggle with DaisyUI's swap component
   - Persistent user preference with localStorage

5. **Accessibility**:
   - Semantic HTML structure
   - Proper ARIA attributes
   - Keyboard navigation support
   - Improved color contrast ratios

## Project Structure

```
regular-venus/
├── src/
│   ├── components/
│   │   ├── ErrorMessage.astro
│   │   ├── FeaturedNewsCard.astro
│   │   ├── InfiniteScroll.astro
│   │   ├── LoadingSpinner.astro
│   │   ├── NavBar.astro
│   │   ├── NewsCard.astro
│   │   ├── ThemeToggle.astro
│   │   └── Welcome.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/
│   │       └── news.ts
│   ├── services/
│   │   ├── rssService.js
│   │   └── cacheService.js
│   ├── styles/
│   │   └── app.css
│   └── utils/
│       ├── config.js
│       ├── logger.js
│       └── utils.js
├── public/
│   └── favicon.svg
├── tailwind.config.mjs
├── package.json
└── astro.config.mjs
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `RSS_FEED_URL` (optional): Custom RSS feed URL
4. Run the development server: `npm run dev`
5. Build for production: `npm run build`

## DaisyUI Theming

The application uses DaisyUI for component styling and theming. The themes are configured in `tailwind.config.mjs`:

```javascript
daisyui: {
  themes: [
    {
      light: {
        "primary": "#3b82f6",
        "secondary": "#6b7280",
        "accent": "#f59e0b",
        "neutral": "#191D24",
        "base-100": "#ffffff",
        "base-200": "#f3f4f6",
        "base-300": "#e5e7eb",
        // ... other color variables
      },
    },
    {
      dark: {
        "primary": "#3b82f6",
        "secondary": "#9ca3af",
        "accent": "#f59e0b",
        "neutral": "#191D24",
        "base-100": "#1f2937",
        "base-200": "#111827",
        "base-300": "#0f172a",
        // ... other color variables
      },
    },
  ],
  darkTheme: "dark",
  base: true,
  styled: true,
  utils: true,
  logs: false,
}
```

To customize the themes:

1. Modify the color values in the `tailwind.config.mjs` file
2. Use DaisyUI's theme variables in your components (e.g., `bg-base-100`, `text-primary`)
3. Add additional themes by adding new objects to the `themes` array

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key for summarization | (Required) |
| `ANTHROPIC_MODEL` | Anthropic model to use | claude-3-haiku-20240307 |
| `RSS_FEED_URL` | URL of the RSS feed to fetch | https://rss.app/feeds/8hfuhHaJJ8XpWp8p.xml |
| `RSS_ITEM_LIMIT` | Maximum number of items to display | 10 |

## Performance Considerations

- **API Usage**: The application implements caching to minimize API calls
- **Batch Processing**: Items are processed in batches to avoid rate limiting
- **Incremental Loading**: Only processes new content when available
- **Fallback Mechanisms**: Provides graceful degradation when services are unavailable
