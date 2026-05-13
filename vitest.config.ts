import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Pure-logic test runner. We intentionally don't load
// @vitejs/plugin-react (the v6 build is ESM-only and trips vitest's
// CJS config loader). If/when we add JSX rendering tests, switch
// this file to `.mts` and import the plugin.
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts', 'src/stores/**/*.ts', 'src/hooks/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
  },
});
