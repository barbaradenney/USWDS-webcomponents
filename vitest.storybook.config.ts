import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['.storybook/vitest.setup.ts'],
    include: ['**/*.stories.test.ts', '**/*.story.test.ts'],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // Run headless for CI, headed for development
      headless: !!process.env.CI,
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.config.js',
        'storybook-static/',
        '.storybook/',
      ],
    },
  },
});
