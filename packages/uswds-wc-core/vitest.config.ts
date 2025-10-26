/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@uswds-wc/core': resolve(__dirname, '../uswds-wc-core/src'),
      '@uswds-wc/test-utils': resolve(__dirname, '../uswds-wc-test-utils/src'),
      '@uswds-wc/core/styles.css': resolve(__dirname, '../../__mocks__/styleMock.js'),
    },
  },
});
