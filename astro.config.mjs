import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://evrrdy.com',
  base: '/',
  output: 'static',
  adapter: undefined, // Static output, no adapter needed
  integrations: [sitemap()],
  build: {
    assets: 'assets'
  },
  vite: {
    publicDir: 'public'
  }
});
