import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for cross-browser testing
 * Tests component functionality across different browsers
 */
export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retries help handle occasional timing issues in cross-browser testing
  retries: process.env.CI ? 2 : 0,
  // Increase workers in CI for faster parallel execution
  workers: process.env.CI ? 4 : undefined,
  // Set timeout for each test (30s default)
  timeout: 30000,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/playwright-results.xml' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['line'], // Add line reporter for better CI output
  ],
  use: {
    baseURL: 'http://localhost:6006',
    // Reduce timeouts for faster failures
    actionTimeout: 10000,
    navigationTimeout: 15000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: process.env.CI
    ? [
        // CI: Only test essential browsers for speed
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
        // Accessibility testing (critical for USWDS compliance)
        {
          name: 'accessibility-chrome',
          use: {
            ...devices['Desktop Chrome'],
            contextOptions: {
              reducedMotion: 'reduce',
              colorScheme: 'light',
            },
          },
        },
      ]
    : [
        // Local: Full browser matrix for comprehensive testing
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
