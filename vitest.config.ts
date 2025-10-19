/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Main vitest configuration for unit tests
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest.setup.ts'],
    include: ['src/**/*.test.ts', '__tests__/**/*.test.ts', 'tests/**/*.test.js'],
    exclude: [
      'src/**/*.stories.ts',
      'src/**/*.browser.test.ts',
      'src/**/*.visual.test.ts',
      'node_modules'
    ],
    // Progress reporting
    reporters: process.env.VITEST_VERBOSE ? ['verbose', 'basic'] : process.env.VITEST_DEBUG_HANGING ? ['default', 'hanging-process'] : ['default'],
    // Show test names as they start (not just when they finish)
    logHeapUsage: true,
    // Increased timeouts for large test suite (187 test files)
    testTimeout: 60000, // 60s per test (increased for comprehensive validation)
    hookTimeout: 30000, // 30s for setup/teardown hooks
    // Process management to prevent memory leaks and ensure clean exit
    // Using 'forks' with isolate false to share web component registry
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Run in single process for cleaner exit
        isolate: false, // Share the same context to avoid re-registration
      },
    },
    // Isolation and cleanup
    // IMPORTANT: isolate: false allows web components to register once and be reused
    // This prevents "NotSupportedError: This name has already been registered" errors
    isolate: false, // Share context to avoid web component re-registration errors
    teardownTimeout: 5000, // Allow 5s for cleanup after tests complete
    // Prevent runaway tests
    bail: 5, // Stop after 5 failures for faster feedback
    // Optimize for large test suites (304 test files)
    slowTestThreshold: 5000, // Report tests slower than 5s
    // Run tests sequentially to prevent web component registration conflicts
    // Web components can only be registered once per context
    fileParallelism: false, // Run test files one at a time
    maxConcurrency: 1, // Only 1 test running at a time
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
    },
  },
  // Optimize dependencies for testing
  optimizeDeps: {
    include: [
      'lit',
      'lit/decorators.js',
      '@lit/reactive-element',
      'vitest',
      '@vitest/expect'
    ],
  },
  // Cache for better performance
  cacheDir: 'node_modules/.vitest',
});
