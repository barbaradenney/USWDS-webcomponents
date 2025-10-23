/// <reference types="vitest/config" />
import { defineConfig, Plugin } from 'vitest/config';
import { resolve } from 'path';

// Plugin to stub CSS imports in tests
function cssStubPlugin(): Plugin {
  return {
    name: 'css-stub',
    resolveId(id) {
      if (id.endsWith('.css')) {
        return '\0' + id;
      }
    },
    load(id) {
      if (id.startsWith('\0') && id.endsWith('.css')) {
        return 'export default {};';
      }
    },
  };
}

// Main vitest configuration for unit tests
export default defineConfig({
  plugins: [cssStubPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest.setup.ts'],
    include: ['packages/**/src/**/*.test.ts', '__tests__/**/*.test.ts', 'tests/**/*.test.js'],
    exclude: [
      'packages/**/src/**/*.stories.ts',
      'packages/**/src/**/*.browser.test.ts',
      'packages/**/src/**/*.visual.test.ts',
      'node_modules',
      // Skip behavior/interaction tests in CI - they're flaky in jsdom, covered by Cypress
      ...(process.env.CI ? [
        'packages/**/src/**/*-behavior*.test.ts',
        'packages/**/src/**/*-interaction.test.ts'
      ] : [])
    ],
    // CSS handling in tests
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
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
      // Package aliases for tests
      '@uswds-wc/core': resolve(__dirname, 'packages/uswds-wc-core/src'),
      '@uswds-wc/actions': resolve(__dirname, 'packages/uswds-wc-actions/src'),
      '@uswds-wc/forms': resolve(__dirname, 'packages/uswds-wc-forms/src'),
      '@uswds-wc/navigation': resolve(__dirname, 'packages/uswds-wc-navigation/src'),
      '@uswds-wc/data-display': resolve(__dirname, 'packages/uswds-wc-data-display/src'),
      '@uswds-wc/feedback': resolve(__dirname, 'packages/uswds-wc-feedback/src'),
      '@uswds-wc/layout': resolve(__dirname, 'packages/uswds-wc-layout/src'),
      '@uswds-wc/structure': resolve(__dirname, 'packages/uswds-wc-structure/src'),
      '@uswds-wc/test-utils': resolve(__dirname, 'packages/uswds-wc-test-utils/src'),
      // Mock CSS imports (not needed in unit tests)
      '\\.css$': resolve(__dirname, '__mocks__/styleMock.js'),
      '@uswds-wc/core/styles.css': resolve(__dirname, '__mocks__/styleMock.js'),
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
