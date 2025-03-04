// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), icon(), sitemap()],
  site: 'https://launchsphere.com',
  base: '/',
  trailingSlash: 'never',

  build: {
    format: 'file'
  },

  vite: {
    plugins: [tailwindcss()]
  },
  output: 'server',
  adapter: cloudflare()
});