import { test, expect } from '@playwright/test';

/**
 * Cross-browser compatibility tests for USWDS components
 * Tests core functionality across different browsers and devices
 */

// Test data for common components
const testComponents = [
  { name: 'Button', story: 'actions-button--default' },
  { name: 'Accordion', story: 'structure-accordion--default' },
  { name: 'Alert', story: 'feedback-alert--default' },
  { name: 'Table', story: 'data-display-table--default' },
  { name: 'Modal', story: 'feedback-modal--default' },
];

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Set up common test environment
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  testComponents.forEach(({ name, story }) => {
    test.describe(`${name} Component`, () => {
      test(`should render correctly in ${name}`, async ({ page, browserName }) => {
        // Navigate to component story
        await page.goto(`/iframe.html?id=${story}`);

        // Wait for component to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Allow for animations

        // Find the component element
        await page.locator(`usa-${name.toLowerCase()}`).first();
        await expect(component).toBeVisible();

        // Verify component has expected USWDS classes
        const componentClasses = (await component.getAttribute('class')) || '';
        expect(componentClasses).toContain(`usa-${name.toLowerCase()}`);

        // Take screenshot for visual comparison
        await page.screenshot({
          path: `test-results/screenshots/${browserName}-${name.toLowerCase()}-render.png`,
          fullPage: false,
          clip: (await component.boundingBox()) || undefined,
        });
      });

      test(`should handle keyboard interactions in ${name}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${story}`);
        await page.waitForLoadState('networkidle');

        await page.locator(`usa-${name.toLowerCase()}`).first();

        // Test Tab navigation
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');

        if (['Button', 'Modal', 'Accordion'].includes(name)) {
          // These components should be focusable
          await expect(focusedElement).toBeVisible();
        }

        // Test Enter/Space activation for interactive components
        if (['Button', 'Accordion'].includes(name)) {
          await focusedElement.press('Enter');
          await page.waitForTimeout(500); // Allow for any state changes

          await focusedElement.press('Space');
          await page.waitForTimeout(500);
        }
      });

      test(`should be accessible in ${name}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${story}`);
        await page.waitForLoadState('networkidle');

        // Check for essential accessibility attributes
        await page.locator(`usa-${name.toLowerCase()}`).first();

        // Verify ARIA attributes exist where expected
        if (['Button'].includes(name)) {
          // Buttons should have accessible names
          const accessibleName =
            (await component.getAttribute('aria-label')) ||
            (await component.textContent()) ||
            (await component.getAttribute('title'));
          expect(accessibleName).toBeTruthy();
        }

        if (['Accordion'].includes(name)) {
          // Accordions should have proper ARIA structure
          const triggers = component.locator('[role="button"]');
          const panels = component.locator('[role="region"]');

          const triggerCount = await triggers.count();
          const panelCount = await panels.count();
          expect(triggerCount).toBeGreaterThan(0);
          expect(panelCount).toBeGreaterThan(0);
        }

        if (['Alert'].includes(name)) {
          // Alerts should have appropriate roles
          const alertRole = await component.getAttribute('role');
          expect(['alert', 'alertdialog', 'status']).toContain(alertRole);
        }
      });

      test(`should handle responsive design in ${name}`, async ({ page, isMobile }) => {
        await page.goto(`/iframe.html?id=${story}`);
        await page.waitForLoadState('networkidle');

        await page.locator(`usa-${name.toLowerCase()}`).first();
        await expect(component).toBeVisible();

        // Get component dimensions
        const box = await component.boundingBox();
        expect(box).toBeTruthy();

        if (isMobile) {
          // On mobile, component should not overflow viewport
          const viewportSize = page.viewportSize();
          if (viewportSize && box) {
            expect(box.width).toBeLessThanOrEqual(viewportSize.width);
          }
        }

        // Take responsive screenshot
        const deviceType = isMobile ? 'mobile' : 'desktop';
        await page.screenshot({
          path: `test-results/screenshots/${deviceType}-${name.toLowerCase()}-responsive.png`,
          fullPage: false,
          clip: box || undefined,
        });
      });
    });
  });

  test.describe('Performance Tests', () => {
    test('should load components within performance budget', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/iframe.html?id=data-display-table--large-dataset');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Components should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Check if virtual scrolling is working for large datasets
      const tableRows = page.locator('usa-table tbody tr');
      const rowCount = await tableRows.count();

      // With virtual scrolling, we should see far fewer DOM rows than data rows
      if (rowCount > 0) {
        expect(rowCount).toBeLessThan(100); // Virtual scrolling should limit DOM rows
      }
    });

    test('should handle rapid interactions without performance degradation', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--multiselectable');
      await page.waitForLoadState('networkidle');

      const accordionButtons = page.locator('usa-accordion button');
      const buttonCount = await accordionButtons.count();

      if (buttonCount > 0) {
        const startTime = Date.now();

        // Rapidly click accordion buttons
        for (let i = 0; i < Math.min(buttonCount, 10); i++) {
          await accordionButtons.nth(i).click();
          await page.waitForTimeout(50); // Small delay between clicks
        }

        const interactionTime = Date.now() - startTime;

        // All interactions should complete within 2 seconds
        expect(interactionTime).toBeLessThan(2000);
      }
    });
  });

  test.describe('Form Integration Tests', () => {
    test('should integrate properly with native forms', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-text-input--default');
      await page.waitForLoadState('networkidle');

      const textInput = page.locator('usa-text-input input').first();
      const form = page.locator('form').first();

      if ((await textInput.count()) > 0) {
        // Fill out the input
        await textInput.fill('test@example.com');

        // Verify form data
        const inputValue = await textInput.inputValue();
        expect(inputValue).toBe('test@example.com');

        // Test form validation
        await textInput.fill('invalid-email');

        if ((await form.count()) > 0) {
          // Check if validation occurs
          await textInput.evaluate((input: HTMLInputElement) => input.checkValidity());
          // Note: This may vary based on input type and validation rules
        }
      }
    });
  });

  test.describe('Network Conditions', () => {
    test('should handle slow network conditions', async ({ page, context }) => {
      // Simulate slow 3G network
      await context.route('**/*', async (route) => {
        // Use Promise delay for network simulation (auto-resolves, no clearTimeout needed)
        await page.waitForTimeout(100);
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should still load within reasonable time even with slow network
      expect(loadTime).toBeLessThan(10000); // 10 seconds max

      // Component should still be functional
      const button = page.locator('usa-button').first();
      await expect(button).toBeVisible();
    });

    test('should handle offline mode gracefully', async ({ page, context }) => {
      await page.goto('/iframe.html?id=feedback-alert--default');
      await page.waitForLoadState('networkidle');

      // Go offline
      await context.setOffline(true);

      // Component should still be interactive
      const alert = page.locator('usa-alert').first();
      await expect(alert).toBeVisible();

      // Test any close buttons or interactive elements
      const closeButton = alert.locator('button').first();
      if ((await closeButton.count()) > 0) {
        await closeButton.click();
        // Should work even offline since it's client-side
      }
    });
  });

  test.describe('Color Scheme Tests', () => {
    test('should handle dark mode', async ({ page, context }) => {
      // Set dark color scheme
      await context.emulateMedia({ colorScheme: 'dark' });

      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      const button = page.locator('usa-button').first();
      await expect(button).toBeVisible();

      // Take screenshot in dark mode
      await page.screenshot({
        path: 'test-results/screenshots/dark-mode-button.png',
        fullPage: false,
        clip: (await button.boundingBox()) || undefined,
      });
    });

    test('should handle high contrast mode', async ({ page, context }) => {
      // Simulate high contrast preferences
      await context.emulateMedia({
        colorScheme: 'light',
        reducedMotion: 'reduce',
      });

      await page.goto('/iframe.html?id=feedback-alert--error');
      await page.waitForLoadState('networkidle');

      const alert = page.locator('usa-alert').first();
      await expect(alert).toBeVisible();

      // Check that contrast is maintained
      const alertStyles = await alert.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderColor: styles.borderColor,
        };
      });

      // Styles should exist (exact values depend on USWDS implementation)
      expect(alertStyles.backgroundColor).toBeTruthy();
      expect(alertStyles.color).toBeTruthy();
    });
  });

  test.describe('Print Media Tests', () => {
    test('should render correctly in print media', async ({ page, context }) => {
      await context.emulateMedia({ media: 'print' });

      await page.goto('/iframe.html?id=data-display-table--default');
      await page.waitForLoadState('networkidle');

      const table = page.locator('usa-table').first();
      await expect(table).toBeVisible();

      // Take screenshot of print layout
      await page.screenshot({
        path: 'test-results/screenshots/print-table.png',
        fullPage: true,
      });

      // Verify print-specific styles are applied
      const tableStyles = await table.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
        };
      });

      expect(tableStyles.display).not.toBe('none');
    });
  });
});
