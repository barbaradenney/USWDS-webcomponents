/// <reference types="vitest/config" />
import { defineConfig, UserConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Base Vitest configuration for USWDS Web Components packages
 *
 * This config is extended by individual packages to ensure consistent test settings.
 */
export function createTestConfig(packageDir: string): UserConfig {
  // Resolve workspace root (go up 2 levels from package directory)
  const workspaceRoot = resolve(packageDir, '../..');

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
        // Workspace package aliases for monorepo imports
        '@uswds-wc/core/styles.css': resolve(workspaceRoot, 'packages/uswds-wc-core/src/styles/styles.css'),
        '@uswds-wc/core': resolve(workspaceRoot, 'packages/uswds-wc-core/src'),
        '@uswds-wc/test-utils': resolve(workspaceRoot, 'packages/uswds-wc-test-utils/src'),
        '@uswds-wc/forms': resolve(workspaceRoot, 'packages/uswds-wc-forms/src'),
        '@uswds-wc/navigation': resolve(workspaceRoot, 'packages/uswds-wc-navigation/src'),
        '@uswds-wc/data-display': resolve(workspaceRoot, 'packages/uswds-wc-data-display/src'),
        '@uswds-wc/feedback': resolve(workspaceRoot, 'packages/uswds-wc-feedback/src'),
        '@uswds-wc/actions': resolve(workspaceRoot, 'packages/uswds-wc-actions/src'),
        '@uswds-wc/layout': resolve(workspaceRoot, 'packages/uswds-wc-layout/src'),
        '@uswds-wc/structure': resolve(workspaceRoot, 'packages/uswds-wc-structure/src'),
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
