import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://evrrdy.com',
  base: '/',
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    publicDir: 'public'
  }
});
