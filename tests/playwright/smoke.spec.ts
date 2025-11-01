import { test, expect } from '@playwright/test';

/**
 * Basic smoke tests to verify Storybook and components are accessible
 * These tests run quickly and verify critical functionality
 */

test.describe('Smoke Tests @smoke @critical', () => {
  test('Storybook should be accessible', async ({ page }) => {
    // Navigate to Storybook
    await page.goto('/');

    // Wait for Storybook to load
    await page.waitForSelector(
      '[data-test-id="storybook-root"], #storybook-root, #storybook-preview-wrapper',
      {
        timeout: 30000,
      }
    );

    // Check that Storybook loaded
    const title = await page.title();
    expect(title).toContain('Storybook');
  });

  test('Component sidebar should be visible', async ({ page }) => {
    await page.goto('/');

    // Wait for sidebar to load
    await page.waitForSelector(
      '[role="navigation"], #storybook-explorer-tree, .sidebar-container',
      {
        timeout: 30000,
      }
    );

    // Check that components are listed
    const hasComponents = await page.locator('text=/Components/i').count();
    expect(hasComponents).toBeGreaterThan(0);
  });

  test('Should load a basic component story', async ({ page }) => {
    // Navigate directly to a button story (common component)
    await page.goto('/?path=/story/actions-button--default');

    // Wait for the story to load
    await page.waitForSelector('iframe#storybook-preview-iframe, [data-test-id="story-root"]', {
      timeout: 30000,
    });

    // If there's an iframe, we need to access it
    const iframe = page.frameLocator('#storybook-preview-iframe').first();
    const button = iframe.locator('usa-button, button').first();

    // Check that the button exists
    const buttonCount = await button.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('Critical components should be available', async ({ page }) => {
    await page.goto('/');

    // Wait for navigation
    await page.waitForSelector('[role="navigation"], #storybook-explorer-tree', {
      timeout: 30000,
    });

    // Check for critical components in the sidebar
    const criticalComponents = ['Button', 'Alert', 'Modal', 'Accordion'];

    for (const component of criticalComponents) {
      const componentExists = await page.locator(`text=/${component}/i`).count();
      expect(componentExists).toBeGreaterThan(0);
    }
  });

  test('Should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];

    // Listen for console errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for any delayed errors

    // Filter out known acceptable warnings
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('DevTools') &&
        !error.includes('favicon') &&
        !error.includes('Source map') &&
        !error.includes('ResizeObserver')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
