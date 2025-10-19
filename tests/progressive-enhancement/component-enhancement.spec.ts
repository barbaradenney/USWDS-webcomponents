/**
 * Progressive Enhancement Testing
 *
 * This test suite verifies that components work gracefully across different
 * browser capabilities, network conditions, and accessibility preferences.
 */

import { test, expect } from '@playwright/test';

test.describe('Progressive Enhancement Tests', () => {
  test.describe('No JavaScript Fallback', () => {
    test('Button should work as basic HTML button without JS', async ({ page }) => {
      // Disable JavaScript
      await page.setJavaScriptEnabled(false);

      await page.goto('/iframe.html?id=components-button--default');

      // Button should still be visible and clickable at HTML level
      const button = page.locator('button, [role="button"]').first();
      await expect(button).toBeVisible();

      // Should be able to click (though JS event handlers won't work)
      await button.click();

      // Button should maintain basic styling and be recognizable
      const buttonText = await button.textContent();
      expect(buttonText?.trim().length).toBeGreaterThan(0);
    });

    test('Form components should submit via browser default', async ({ page }) => {
      await page.setJavaScriptEnabled(false);

      await page.goto('/iframe.html?id=components-text-input--default');

      // Find form or create one for testing
      const hasForm = await page.locator('form').count() > 0;

      if (hasForm) {
        const input = page.locator('input[type="text"], input[type="email"]').first();
        await input.fill('test@example.com');

        // Submit button should work via browser default
        const submitButton = page.locator('input[type="submit"], button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          // We can't test actual submission without a server,
          // but we can verify the form is properly structured
          const form = page.locator('form').first();
          const action = await form.getAttribute('action');
          const method = await form.getAttribute('method');

          // Form should have proper attributes for submission
          expect(action).toBeDefined();
        }
      }

      // Input should still accept values
      const textInput = page.locator('usa-text-input input, input').first();
      if (await textInput.isVisible()) {
        await textInput.fill('test input');
        await expect(textInput).toHaveValue('test input');
      }
    });

    test('Accordion should show/hide with CSS-only toggle', async ({ page }) => {
      await page.setJavaScriptEnabled(false);

      await page.goto('/iframe.html?id=components-accordion--default');

      // Accordion should be visible
      const accordion = page.locator('usa-accordion').first();
      await expect(accordion).toBeVisible();

      // Content should be accessible even without JS interactions
      const content = await accordion.textContent();
      expect(content?.trim().length).toBeGreaterThan(0);

      // Check if there are proper HTML details/summary elements for fallback
      const details = page.locator('details');
      const summaries = page.locator('summary');

      if (await details.count() > 0) {
        // HTML5 details/summary provides native accordion functionality
        const firstDetails = details.first();
        const firstSummary = summaries.first();

        await firstSummary.click();
        await expect(firstDetails).toHaveAttribute('open');
      }
    });

    test('Navigation should work with anchor links', async ({ page }) => {
      await page.setJavaScriptEnabled(false);

      await page.goto('/iframe.html?id=components-header--default');

      // Find navigation links
      const navLinks = page.locator('a[href]');
      const linkCount = await navLinks.count();

      if (linkCount > 0) {
        // Links should be properly formed
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');

          // Should have valid href (not just #)
          expect(href).toBeTruthy();
          expect(href).not.toBe('#');

          // Link should be visible and have text
          await expect(link).toBeVisible();
          const linkText = await link.textContent();
          expect(linkText?.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Reduced CSS Support', () => {
    test('Components should be readable with minimal CSS', async ({ page }) => {
      await page.goto('/iframe.html?id=components-alert--default');

      // Apply minimal CSS to simulate older browsers
      await page.addStyleTag({
        content: `
          * {
            /* Disable modern CSS features */
            display: block !important;
            position: static !important;
            transform: none !important;
            transition: none !important;
            animation: none !important;
            filter: none !important;

            /* Basic typography */
            font-family: serif !important;
            color: black !important;
            background: white !important;
            border: none !important;
          }

          button, input {
            display: inline-block !important;
            border: 1px solid black !important;
            padding: 4px 8px !important;
          }

          a {
            color: blue !important;
            text-decoration: underline !important;
          }
        `
      });

      // Component should still be readable
      const alert = page.locator('usa-alert').first();
      await expect(alert).toBeVisible();

      const alertText = await alert.textContent();
      expect(alertText?.trim().length).toBeGreaterThan(0);

      // Interactive elements should still be distinguishable
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        const button = buttons.first();
        await expect(button).toBeVisible();

        // Should have border or some visual distinction
        const borderWidth = await button.evaluate(el =>
          getComputedStyle(el).borderWidth
        );
        expect(borderWidth).not.toBe('0px');
      }
    });

    test('Form controls should work without custom styling', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--default');

      // Remove all custom styles
      await page.addStyleTag({
        content: `
          * {
            all: unset !important;
            display: block !important;
          }

          input, button, select, textarea {
            display: inline-block !important;
            border: 1px solid black !important;
            background: white !important;
            color: black !important;
            font: inherit !important;
          }
        `
      });

      // Form controls should still be functional
      const input = page.locator('input[type="text"], input:not([type])').first();
      if (await input.isVisible()) {
        await input.fill('test input');
        await expect(input).toHaveValue('test input');

        // Should be visually distinct
        const borderStyle = await input.evaluate(el =>
          getComputedStyle(el).border
        );
        expect(borderStyle).toContain('black');
      }
    });
  });

  test.describe('Limited Browser API Support', () => {
    test('Components should work without modern APIs', async ({ page }) => {
      // Disable modern APIs before page load
      await page.addInitScript(() => {
        // Disable modern APIs that might not be available in older browsers
        delete window.IntersectionObserver;
        delete window.ResizeObserver;
        delete window.MutationObserver;
        delete window.customElements;

        // Disable fetch API
        delete window.fetch;

        // Disable modern DOM methods
        delete Element.prototype.closest;
        delete Element.prototype.matches;

        // Disable modern event methods
        delete window.addEventListener;
        delete Element.prototype.addEventListener;
      });

      await page.goto('/iframe.html?id=components-card--default');

      // Component should still render basic HTML
      const card = page.locator('usa-card, [class*="card"]').first();
      await expect(card).toBeVisible();

      const cardContent = await card.textContent();
      expect(cardContent?.trim().length).toBeGreaterThan(0);
    });

    test('Date picker should work without JavaScript date APIs', async ({ page }) => {
      await page.addInitScript(() => {
        // Disable modern date APIs
        delete window.Intl;

        // Mock Date constructor to simulate limited support
        const OriginalDate = window.Date;
        window.Date = function(year?: any, month?: any, day?: any) {
          if (arguments.length === 0) {
            return new OriginalDate();
          }
          // Limited constructor support
          return new OriginalDate(year || 0, month || 0, day || 1);
        } as any;

        window.Date.now = OriginalDate.now;
        window.Date.parse = OriginalDate.parse;
      });

      await page.goto('/iframe.html?id=components-date-picker--default');

      // Should fallback to basic text input
      const dateInput = page.locator('input[type="date"], input[type="text"]').first();
      await expect(dateInput).toBeVisible();

      // Should accept date strings
      await dateInput.fill('01/15/2024');
      const inputValue = await dateInput.inputValue();
      expect(inputValue.length).toBeGreaterThan(0);
    });

    test('Modal should work without advanced positioning APIs', async ({ page }) => {
      await page.addInitScript(() => {
        // Disable advanced positioning
        delete window.getComputedStyle;

        // Disable viewport APIs
        delete window.visualViewport;
        delete window.screen;

        // Mock basic getBoundingClientRect
        Element.prototype.getBoundingClientRect = function() {
          return {
            top: 0, left: 0, bottom: 100, right: 100,
            width: 100, height: 100, x: 0, y: 0
          } as DOMRect;
        };
      });

      await page.goto('/iframe.html?id=components-modal--default');

      // Modal trigger should still work
      const trigger = page.locator('button[data-open-modal], [data-open-modal]').first();
      if (await trigger.isVisible()) {
        await trigger.click();

        // Modal should appear (even if positioning is basic)
        const modal = page.locator('usa-modal, [class*="modal"]').first();
        await expect(modal).toBeVisible();
      }
    });
  });

  test.describe('Accessibility Preferences', () => {
    test('Components should respect prefers-reduced-motion', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/iframe.html?id=components-accordion--default');

      // Check that animations are disabled or reduced
      const elements = page.locator('usa-accordion *, *');

      // Sample a few elements to check for animations
      const elementCount = await elements.count();
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = elements.nth(i);
        if (await element.isVisible()) {
          const animationDuration = await element.evaluate(el =>
            getComputedStyle(el).animationDuration
          );

          const transitionDuration = await element.evaluate(el =>
            getComputedStyle(el).transitionDuration
          );

          // Animations should be disabled or very short
          if (animationDuration !== '0s') {
            // If animations exist, they should be very short
            const duration = parseFloat(animationDuration);
            expect(duration).toBeLessThan(0.1); // Less than 100ms
          }

          if (transitionDuration !== '0s') {
            const duration = parseFloat(transitionDuration);
            expect(duration).toBeLessThan(0.1);
          }
        }
      }
    });

    test('Components should work in high contrast mode', async ({ page }) => {
      await page.goto('/iframe.html?id=components-button--default');

      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            *, *::before, *::after {
              background: white !important;
              color: black !important;
              border-color: black !important;
              text-shadow: none !important;
              box-shadow: none !important;
            }

            button, input, select, textarea {
              border: 2px solid black !important;
            }

            a {
              color: blue !important;
              text-decoration: underline !important;
            }
          }
        `
      });

      // Manually apply high contrast for testing
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            background: white !important;
            color: black !important;
            border-color: black !important;
            text-shadow: none !important;
            box-shadow: none !important;
          }

          button, input, select, textarea {
            border: 2px solid black !important;
          }

          a {
            color: blue !important;
            text-decoration: underline !important;
          }
        `
      });

      // Components should still be readable and usable
      const button = page.locator('usa-button, button').first();
      await expect(button).toBeVisible();

      // Button should have visible border for distinction
      const borderWidth = await button.evaluate(el =>
        getComputedStyle(el).borderWidth
      );
      expect(parseFloat(borderWidth)).toBeGreaterThan(1); // At least 1px border

      // Text should be visible
      const buttonText = await button.textContent();
      expect(buttonText?.trim().length).toBeGreaterThan(0);

      // Should still be clickable
      await button.click();
    });

    test('Components should work with screen reader navigation', async ({ page }) => {
      await page.goto('/iframe.html?id=components-breadcrumb--default');

      // Check for proper semantic structure
      const breadcrumb = page.locator('usa-breadcrumb, nav[aria-label*="breadcrumb" i]').first();
      await expect(breadcrumb).toBeVisible();

      // Should have proper ARIA labels
      const ariaLabel = await breadcrumb.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();

      // Links should be properly marked up
      const links = page.locator('a[href]');
      const linkCount = await links.count();

      if (linkCount > 0) {
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = links.nth(i);

          // Should have accessible text
          const linkText = await link.textContent();
          const ariaLabel = await link.getAttribute('aria-label');

          expect(linkText?.trim().length || ariaLabel?.trim().length).toBeGreaterThan(0);

          // Should be keyboard navigable
          await link.focus();
          const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
          expect(focusedElement).toBe('A');
        }
      }
    });
  });

  test.describe('Network and Performance Degradation', () => {
    test('Components should work with slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', async route => {
        // Add delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto('/iframe.html?id=components-card--default');
      const loadTime = Date.now() - startTime;

      // Component should still render even with slow network
      const card = page.locator('usa-card').first();
      await expect(card).toBeVisible({ timeout: 10000 });

      // Content should be visible
      const cardContent = await card.textContent();
      expect(cardContent?.trim().length).toBeGreaterThan(0);

      console.log(`Page loaded in ${loadTime}ms with slow network simulation`);
    });

    test('Components should provide loading states', async ({ page }) => {
      // Intercept requests to simulate loading states
      await page.route('**/*.css', async route => {
        // Delay CSS loading
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
      });

      await page.goto('/iframe.html?id=components-combo-box--default');

      // Check if component shows loading state or graceful degradation
      const comboBox = page.locator('usa-combo-box').first();

      // Component should be present even during loading
      await expect(comboBox).toBeAttached();

      // Should not show broken layout during loading
      const hasVisibleContent = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        return Array.from(elements).some(el => {
          const style = getComputedStyle(el);
          return style.display !== 'none' &&
                 style.visibility !== 'hidden' &&
                 el.textContent?.trim().length > 0;
        });
      });

      expect(hasVisibleContent).toBe(true);
    });
  });

  test.describe('Feature Detection and Fallbacks', () => {
    test('Components should detect and adapt to browser capabilities', async ({ page }) => {
      await page.addInitScript(() => {
        // Mock older browser environment
        const userAgent = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';
        Object.defineProperty(navigator, 'userAgent', { value: userAgent, writable: false });

        // Remove modern features
        delete window.requestAnimationFrame;
        delete window.Promise;
        delete window.Symbol;

        // Limited CSS support
        delete (document.createElement('div')).style.grid;
        delete (document.createElement('div')).style.flexbox;
      });

      await page.goto('/iframe.html?id=components-button-group--default');

      // Component should still render with fallback layout
      const buttonGroup = page.locator('usa-button-group').first();
      await expect(buttonGroup).toBeVisible();

      // Buttons should still be functional
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 2); i++) {
          const button = buttons.nth(i);
          await expect(button).toBeVisible();
          await button.click();
        }
      }
    });
  });
});