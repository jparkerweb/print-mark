import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
  test: {
    // Test environment
    environment: 'node',
    globals: false,

    // Test file patterns
    include: ['tests/**/*.test.ts'],
    exclude: mode === 'all' || mode === 'slow' ? [] : ['tests/slow/**'],

    // Test timeout
    testTimeout: 10000,

    // Setup files
    setupFiles: ['tests/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts', 'src/types/**'],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },
  },

  // Path aliases
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
}))
