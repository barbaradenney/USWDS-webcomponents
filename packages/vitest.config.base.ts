/// <reference types="vitest/config" />
import { defineConfig, UserConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Base Vitest configuration for USWDS Web Components packages
 *
 * This config is extended by individual packages to ensure consistent test settings.
 */
export function createTestConfig(packageDir: string): UserConfig {
  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [resolve(packageDir, 'vitest.setup.ts')],
      include: ['src/**/*.test.ts'],
      exclude: [
        'src/**/*.stories.ts',
        'src/**/*.browser.test.ts',
        'src/**/*.visual.test.ts',
        'src/**/*.component.cy.ts',
        'node_modules'
      ],
      reporters: ['default'],
      logHeapUsage: true,
      testTimeout: 60000,
      hookTimeout: 30000,
      // Use forks for isolation
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
          isolate: false,
        },
      },
      isolate: false,
      teardownTimeout: 5000,
      // Sequential execution to prevent web component registration conflicts
      fileParallelism: false,
      maxConcurrency: 1,
    },
    resolve: {
      alias: {
        '@': resolve(packageDir, 'src'),
      },
    },
    optimizeDeps: {
      include: [
        'lit',
        'lit/decorators.js',
        '@lit/reactive-element',
        'vitest',
        '@vitest/expect'
      ],
    },
    cacheDir: resolve(packageDir, 'node_modules/.vitest'),
  };
}

export default defineConfig({});
