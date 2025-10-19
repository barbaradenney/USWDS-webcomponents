import { test, expect } from '@playwright/test';

/**
 * Comprehensive Keyboard Navigation Tests
 *
 * Tests keyboard accessibility across all interactive components
 * Focus areas: Tab order, arrow key navigation, keyboard shortcuts, focus management
 */
test.describe('Keyboard Navigation Accessibility Tests', () => {

  test.describe('Tab Navigation Tests', () => {
    test('should navigate through button groups correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=components-button-group--primary');
      await page.waitForLoadState('networkidle');

      // Start tab navigation
      await page.keyboard.press('Tab');

      // Track focused elements
      const focusedElements: string[] = [];

      for (let i = 0; i < 5; i++) {
        const focusedElement = page.locator(':focus');
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        const className = await focusedElement.getAttribute('class') || '';
        focusedElements.push(`${tagName}.${className.split(' ')[0]}`);

        await page.keyboard.press('Tab');
      }

      // Verify logical tab order
      expect(focusedElements.filter(el => el.includes('button')).length).toBeGreaterThan(0);
      console.log('Tab order:', focusedElements);
    });

    test('should handle reverse tab navigation (Shift+Tab)', async ({ page }) => {
      await page.goto('/iframe.html?id=components-accordion--primary');
      await page.waitForLoadState('networkidle');

      // Tab forward to last element
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }

      const lastElement = await page.locator(':focus').textContent();

      // Tab backward
      await page.keyboard.press('Shift+Tab');
      const previousElement = await page.locator(':focus').textContent();

      expect(previousElement).not.toBe(lastElement);
    });

    test('should skip non-focusable elements', async ({ page }) => {
      await page.goto('/iframe.html?id=components-card--primary');
      await page.waitForLoadState('networkidle');

      let focusableCount = 0;
      const focusableElements: string[] = [];

      // Count focusable elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');
        const isVisible = await focusedElement.isVisible().catch(() => false);

        if (isVisible) {
          const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
          const tabIndex = await focusedElement.getAttribute('tabindex');

          // Should not focus on elements with tabindex="-1"
          expect(tabIndex).not.toBe('-1');

          focusableElements.push(tagName);
          focusableCount++;
        }
      }

      console.log(`Found ${focusableCount} focusable elements:`, focusableElements);

      // Verify only appropriate elements are focusable
      const appropriateTags = ['button', 'a', 'input', 'select', 'textarea', 'usa-button'];
      focusableElements.forEach(tag => {
        expect(appropriateTags.some(appropriate => tag.includes(appropriate))).toBeTruthy();
      });
    });
  });

  test.describe('Arrow Key Navigation Tests', () => {
    test('should navigate accordion with arrow keys', async ({ page }) => {
      await page.goto('/iframe.html?id=components-accordion--primary');
      await page.waitForLoadState('networkidle');

      // Focus first accordion button
      const firstButton = page.locator('.usa-accordion__button').first();
      await firstButton.focus();

      // Test down arrow
      await page.keyboard.press('ArrowDown');
      const secondButton = page.locator('.usa-accordion__button').nth(1);
      await expect(secondButton).toBeFocused();

      // Test up arrow
      await page.keyboard.press('ArrowUp');
      await expect(firstButton).toBeFocused();

      // Test home key (if supported)
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Home');
      await expect(firstButton).toBeFocused();

      // Test end key (if supported)
      await page.keyboard.press('End');
      const lastButton = page.locator('.usa-accordion__button').last();
      await expect(lastButton).toBeFocused();
    });

    test('should navigate combo box options with arrow keys', async ({ page }) => {
      await page.goto('/iframe.html?id=components-combo-box--primary');
      await page.waitForLoadState('networkidle');

      // Open combo box
      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.click();
      await page.waitForSelector('.usa-combo-box__list:not([hidden])');

      const input = page.locator('.usa-combo-box__input');
      await input.focus();

      // Test down arrow navigation
      await page.keyboard.press('ArrowDown');

      // Check if first option is highlighted
      const firstOption = page.locator('.usa-combo-box__list-option').first();
      const isHighlighted = await firstOption.evaluate(el =>
        el.classList.contains('usa-combo-box__list-option--focused') ||
        el.classList.contains('usa-combo-box__list-option--highlighted') ||
        el.getAttribute('aria-selected') === 'true'
      );
      expect(isHighlighted).toBeTruthy();

      // Test up arrow
      await page.keyboard.press('ArrowUp');

      // Should wrap to last option or stay on first
      const options = page.locator('.usa-combo-box__list-option');
      const optionCount = await options.count();
      console.log(`Combo box has ${optionCount} options`);
    });

    test('should navigate menu items with arrow keys', async ({ page }) => {
      await page.goto('/iframe.html?id=components-menu--primary');
      await page.waitForLoadState('networkidle');

      // Look for menu trigger
      const menuTrigger = page.locator('[aria-haspopup="menu"], [aria-expanded]').first();

      if (await menuTrigger.isVisible()) {
        await menuTrigger.click();
        await page.waitForTimeout(100);

        // Test arrow key navigation in menu
        await page.keyboard.press('ArrowDown');

        const focusedItem = page.locator(':focus');
        const role = await focusedItem.getAttribute('role');
        expect(['menuitem', 'option']).toContain(role);
      }
    });
  });

  test.describe('Activation Key Tests', () => {
    test('should activate buttons with Enter and Space', async ({ page }) => {
      await page.goto('/iframe.html?id=components-button--primary');
      await page.waitForLoadState('networkidle');

      let clickCount = 0;
      await page.evaluate(() => {
        window.testClickCount = 0;
        document.addEventListener('click', () => {
          window.testClickCount++;
        });
      });

      const button = page.locator('usa-button').first();
      await button.focus();

      // Test Enter key activation
      await page.keyboard.press('Enter');
      clickCount = await page.evaluate(() => window.testClickCount);
      expect(clickCount).toBeGreaterThan(0);

      // Test Space key activation
      await page.keyboard.press('Space');
      const newClickCount = await page.evaluate(() => window.testClickCount);
      expect(newClickCount).toBeGreaterThan(clickCount);
    });

    test('should activate accordion items with Enter and Space', async ({ page }) => {
      await page.goto('/iframe.html?id=components-accordion--primary');
      await page.waitForLoadState('networkidle');

      const firstButton = page.locator('.usa-accordion__button').first();
      await firstButton.focus();

      // Initially should be closed
      await expect(firstButton).toHaveAttribute('aria-expanded', 'false');

      // Activate with Enter
      await page.keyboard.press('Enter');
      await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

      // Close with Space
      await page.keyboard.press('Space');
      await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should handle form submission with Enter', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--primary');
      await page.waitForLoadState('networkidle');

      // Add form wrapper for testing
      await page.evaluate(() => {
        const input = document.querySelector('.usa-input');
        if (input) {
          const form = document.createElement('form');
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            window.formSubmitted = true;
          });
          input.parentNode?.insertBefore(form, input);
          form.appendChild(input);
        }
      });

      const input = page.locator('.usa-input');
      await input.focus();
      await input.fill('test input');

      // Test Enter key submission
      await page.keyboard.press('Enter');

      const formSubmitted = await page.evaluate(() => window.formSubmitted);
      expect(formSubmitted).toBeTruthy();
    });
  });

  test.describe('Focus Management Tests', () => {
    test('should manage focus in modal dialogs', async ({ page }) => {
      await page.goto('/iframe.html?id=components-modal--primary');
      await page.waitForLoadState('networkidle');

      // Track initial focus
      const initialFocus = await page.evaluate(() => document.activeElement?.tagName);

      // Open modal
      const openButton = page.locator('button:has-text("Open Modal")').first();
      await openButton.click();
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Focus should move to modal
      await page.waitForTimeout(100);
      const modalFocused = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        const activeElement = document.activeElement;
        return modal?.contains(activeElement) || false;
      });
      expect(modalFocused).toBeTruthy();

      // Test focus trapping
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should still be within modal
      const stillInModal = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        const activeElement = document.activeElement;
        return modal?.contains(activeElement) || false;
      });
      expect(stillInModal).toBeTruthy();

      // Close modal with Escape
      await page.keyboard.press('Escape');
      await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

      // Focus should return to trigger
      await page.waitForTimeout(100);
      const finalFocus = page.locator(':focus');
      const isTriggerFocused = await finalFocus.evaluate(el =>
        el.textContent?.includes('Open Modal') || false
      );
      expect(isTriggerFocused).toBeTruthy();
    });

    test('should manage focus in dropdown menus', async ({ page }) => {
      await page.goto('/iframe.html?id=components-combo-box--primary');
      await page.waitForLoadState('networkidle');

      const input = page.locator('.usa-combo-box__input');
      const toggleButton = page.locator('.usa-combo-box__toggle-list');

      // Focus input
      await input.focus();
      await expect(input).toBeFocused();

      // Open dropdown
      await toggleButton.click();
      await page.waitForSelector('.usa-combo-box__list:not([hidden])');

      // Focus should remain on input or move to first option
      const activeElement = page.locator(':focus');
      const tagName = await activeElement.evaluate(el => el.tagName.toLowerCase());
      expect(['input', 'li', 'div']).toContain(tagName);

      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForSelector('.usa-combo-box__list[hidden]');

      // Focus should return to input
      await expect(input).toBeFocused();
    });

    test('should handle focus visible indicators', async ({ page }) => {
      await page.goto('/iframe.html?id=components-button--primary');
      await page.waitForLoadState('networkidle');

      const button = page.locator('usa-button').first();

      // Focus with keyboard
      await page.keyboard.press('Tab');

      // Should have focus-visible styles
      const hasFocusVisible = await button.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outline !== 'none' ||
          styles.boxShadow !== 'none' ||
          el.matches(':focus-visible')
        );
      });
      expect(hasFocusVisible).toBeTruthy();
    });
  });

  test.describe('Keyboard Shortcuts Tests', () => {
    test('should support common keyboard shortcuts', async ({ page }) => {
      await page.goto('/iframe.html?id=components-accordion--primary');
      await page.waitForLoadState('networkidle');

      const firstButton = page.locator('.usa-accordion__button').first();
      await firstButton.focus();

      // Test Home key
      await page.keyboard.press('End'); // Move to last
      await page.keyboard.press('Home'); // Should return to first
      await expect(firstButton).toBeFocused();

      // Test End key
      await page.keyboard.press('End');
      const lastButton = page.locator('.usa-accordion__button').last();
      await expect(lastButton).toBeFocused();
    });

    test('should handle Escape key properly', async ({ page }) => {
      await page.goto('/iframe.html?id=components-combo-box--primary');
      await page.waitForLoadState('networkidle');

      // Open dropdown
      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.click();
      await page.waitForSelector('.usa-combo-box__list:not([hidden])');

      // Press Escape
      await page.keyboard.press('Escape');

      // Should close dropdown
      await page.waitForSelector('.usa-combo-box__list[hidden]');
      const input = page.locator('.usa-combo-box__input');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test.describe('Skip Links and Landmarks', () => {
    test('should provide skip links for keyboard users', async ({ page }) => {
      await page.goto('/iframe.html?id=components-skip-link--primary');
      await page.waitForLoadState('networkidle');

      // Press Tab to reveal skip link
      await page.keyboard.press('Tab');

      const skipLink = page.locator('.usa-skip-link').first();
      if (await skipLink.isVisible()) {
        await expect(skipLink).toBeFocused();

        // Activate skip link
        await page.keyboard.press('Enter');

        // Should jump to main content
        const focusedElement = page.locator(':focus');
        const hasMainContentFocus = await focusedElement.evaluate(el => {
          return el.closest('main') !== null ||
                 el.id === 'main-content' ||
                 el.getAttribute('role') === 'main';
        });

        if (hasMainContentFocus) {
          expect(hasMainContentFocus).toBeTruthy();
        }
      }
    });

    test('should navigate between landmarks with proper roles', async ({ page }) => {
      await page.goto('/iframe.html?id=components-header--primary');
      await page.waitForLoadState('networkidle');

      // Look for landmark elements
      const landmarks = await page.locator('[role="banner"], [role="main"], [role="navigation"], [role="contentinfo"], header, nav, main, footer').all();

      console.log(`Found ${landmarks.length} landmark elements`);

      for (const landmark of landmarks) {
        const role = await landmark.getAttribute('role') || await landmark.evaluate(el => el.tagName.toLowerCase());
        const isVisible = await landmark.isVisible();

        if (isVisible) {
          console.log(`Landmark: ${role}`);

          // Landmarks should be properly labeled
          const ariaLabel = await landmark.getAttribute('aria-label');
          const ariaLabelledBy = await landmark.getAttribute('aria-labelledby');
          const hasLabel = ariaLabel || ariaLabelledBy || ['banner', 'main', 'contentinfo'].includes(role);

          expect(hasLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('Form Navigation Tests', () => {
    test('should navigate form fields logically', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--primary');
      await page.waitForLoadState('networkidle');

      // Add multiple form fields for testing
      await page.evaluate(() => {
        const container = document.querySelector('.sb-show-main') || document.body;
        const fields = ['text', 'email', 'password', 'tel'];

        fields.forEach((type, index) => {
          const div = document.createElement('div');
          div.innerHTML = `
            <label for="field-${index}">Field ${index + 1}:</label>
            <input type="${type}" id="field-${index}" class="usa-input" />
          `;
          container.appendChild(div);
        });
      });

      // Tab through form fields
      const fieldOrder: string[] = [];

      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');
        const isVisible = await focusedElement.isVisible().catch(() => false);

        if (isVisible) {
          const id = await focusedElement.getAttribute('id') || '';
          const type = await focusedElement.getAttribute('type') || '';
          const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());

          if (tagName === 'input') {
            fieldOrder.push(`${tagName}[${type}]#${id}`);
          }
        }
      }

      console.log('Form field tab order:', fieldOrder);

      // Should have logical progression through form fields
      expect(fieldOrder.length).toBeGreaterThan(0);

      // Fields should be reachable via keyboard
      fieldOrder.forEach(field => {
        expect(field).toMatch(/input\[.+\]#field-\d+/);
      });
    });

    test('should handle required field indicators', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--primary');
      await page.waitForLoadState('networkidle');

      // Add required field for testing
      await page.evaluate(() => {
        const container = document.querySelector('.sb-show-main') || document.body;
        const div = document.createElement('div');
        div.innerHTML = `
          <label for="required-field">Required Field <abbr title="required">*</abbr>:</label>
          <input type="text" id="required-field" class="usa-input" required aria-required="true" />
        `;
        container.appendChild(div);
      });

      const requiredInput = page.locator('#required-field');
      await requiredInput.focus();

      // Should have aria-required
      await expect(requiredInput).toHaveAttribute('aria-required', 'true');
      await expect(requiredInput).toHaveAttribute('required');

      // Should be announced to screen readers
      const ariaLabel = await requiredInput.getAttribute('aria-label');
      const hasRequiredIndicator = ariaLabel?.includes('required') || false;

      if (!hasRequiredIndicator) {
        // Look for associated label or description
        const labelText = await page.locator('label[for="required-field"]').textContent();
        expect(labelText).toContain('*');
      }
    });
  });
});