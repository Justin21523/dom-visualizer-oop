import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./tests/setup.js'],

    // File patterns
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'dist/**',
        '**/*.config.js',
        '**/*.config.ts',
        'src/types/**',
        'src/constants/**',
        '**/*.d.ts'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },

    // Test execution
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode
    watch: false,

    // Reporters
    reporter: ['verbose'],

    // UI configuration
    ui: true,

    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    }
  },

  // Path resolution (same as Vite)
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@types': resolve(__dirname, 'src/types'),
      '@tests': resolve(__dirname, 'tests')
    }
  },

  // Environment variables for tests
  define: {
    __TEST__: true,
    __APP_VERSION__: JSON.stringify('test'),
    __BUILD_TIME__: JSON.stringify('test-time')
  }
});