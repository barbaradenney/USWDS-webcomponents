import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for cross-browser testing
 * Tests component functionality across different browsers
 */
export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/playwright-results.xml' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet browsers
    {
      name: 'tablet-chrome',
      use: { ...devices['Galaxy Tab S4'] },
    },
    {
      name: 'tablet-safari',
      use: { ...devices['iPad Pro'] },
    },

    // High DPI displays
    {
      name: 'high-dpi-chrome',
      use: {
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 2,
      },
    },

    // Accessibility testing browser
    {
      name: 'accessibility-chrome',
      use: {
        ...devices['Desktop Chrome'],
        // Enable accessibility testing features
        contextOptions: {
          reducedMotion: 'reduce',
          colorScheme: 'light',
        },
      },
    },

    // Dark mode testing
    {
      name: 'dark-mode-chrome',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          colorScheme: 'dark',
        },
      },
    },

    // Print media testing
    {
      name: 'print-chrome',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          mediaType: 'print',
        },
      },
    },

    // Slow network simulation
    {
      name: 'slow-network-chrome',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          offline: false,
        },
        launchOptions: {
          args: [
            '--simulate-network-throttling',
            '--throttling.cpu=6',
            '--throttling.download=1.5',
            '--throttling.upload=0.75',
          ],
        },
      },
    },
  ],

  webServer: {
    command: 'npm run storybook -- --port 6006 --quiet',
    port: 6006,
    // Always reuse existing server to avoid port conflicts in CI
    // (CI workflow starts Storybook manually before Playwright tests)
    reuseExistingServer: true,
    timeout: 120000,
  },
});
