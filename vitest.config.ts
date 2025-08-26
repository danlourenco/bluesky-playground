import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/server/bluesky/**/*.ts'],
      exclude: ['src/lib/server/bluesky/__tests__/**/*']
    }
  }
});