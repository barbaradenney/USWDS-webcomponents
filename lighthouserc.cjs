/* eslint-env node */
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:6006/'],
      startServerCommand: 'npm run storybook',
      startServerReadyPattern: 'Local:.*http://localhost:6006',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],

        // Performance budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 250000 }], // 250KB JS
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 600000 }], // 600KB CSS
        'resource-summary:total:size': ['warn', { maxNumericValue: 1000000 }], // 1MB total

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],

        // Accessibility requirements
        'color-contrast': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'image-alt': 'error',
        label: 'error',

        // Performance requirements
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'warn',
        'unused-css-rules': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9009,
      storage: '.lighthouseci',
    },
  },
};
