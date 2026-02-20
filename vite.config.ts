import { defineConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    include: ['src/**/*.test.ts'],
  },
});
