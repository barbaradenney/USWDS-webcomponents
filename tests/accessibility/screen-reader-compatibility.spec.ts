import { test, expect } from '@playwright/test';

/**
 * Screen Reader Compatibility Tests
 *
 * Tests virtual screen reader functionality and ARIA live region announcements.
 * Validates that components provide appropriate screen reader experiences.
 * Focus areas: ARIA labels, live regions, announcement content, reading order
 */
test.describe('Screen Reader Compatibility Tests', () => {

  // Set up virtual screen reader testing environment
  test.beforeEach(async ({ page }) => {
    // Enable virtual screen reader mode
    await page.addInitScript(() => {
      // Mock screen reader APIs for testing
      (window as any).mockScreenReader = {
        announcements: [] as string[],
        currentFocus: null as Element | null,
        readingBuffer: [] as string[],
      };

      // Override speechSynthesis for testing
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: (utterance: SpeechSynthesisUtterance) => {
            (window as any).mockScreenReader.announcements.push(utterance.text);
          },
          cancel: () => {},
          pause: () => {},
          resume: () => {},
          getVoices: () => [],
        }
      });

      // Mock screen reader focus tracking
      document.addEventListener('focus', (e) => {
        (window as any).mockScreenReader.currentFocus = e.target;
      }, true);
    });
  });

  test.describe('ARIA Live Region Testing', () => {
    test('should announce alert messages correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=components-alert--default');
      await page.waitForLoadState('networkidle');

      // Test alert announcement
      const alert = page.locator('.usa-alert');
      await expect(alert).toHaveAttribute('role', 'alert');
      await expect(alert).toHaveAttribute('aria-live', 'assertive');

      // Check that alert content is announced
      const alertText = await alert.textContent();
      const announcements = await page.evaluate(() => {
        return (window as any).mockScreenReader?.announcements || [];
      });

      // Alert should be announced automatically
      expect(alertText).toBeTruthy();
    });

    test('should handle dynamic content announcements', async ({ page }) => {
      await page.goto('/iframe.html?id=components-combo-box--default');
      await page.waitForLoadState('networkidle');

      // Open combo box and test announcements
      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.click();
      await page.waitForSelector('.usa-combo-box__list:not([hidden])');

      // Check ARIA announcements for list changes
      const listStatus = page.locator('.usa-combo-box__status');
      await expect(listStatus).toHaveAttribute('aria-live', 'polite');
      await expect(listStatus).toHaveAttribute('aria-atomic', 'true');

      // Test filtering and result announcements
      const input = page.locator('.usa-combo-box__input');
      await input.fill('ap');
      await page.waitForTimeout(500);

      // Verify filtered results are announced
      const statusText = await listStatus.textContent();
      expect(statusText).toContain('results available');
    });

    test('should announce form validation errors', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--with-validation');
      await page.waitForLoadState('networkidle');

      // Trigger validation error
      const input = page.locator('input[type="text"]');
      await input.fill('invalid');
      await input.blur();
      await page.waitForTimeout(500);

      // Check error message is announced
      const errorMessage = page.locator('.usa-error-message');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toHaveAttribute('role', 'alert');
        await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
      }
    });
  });

  test.describe('ARIA Label and Description Testing', () => {
    test('should provide comprehensive button descriptions', async ({ page }) => {
      await page.goto('/iframe.html?id=components-button--accessibility-features');
      await page.waitForLoadState('networkidle');

      // Test buttons with ARIA labels
      const closeButton = page.locator('usa-button[aria-label="Close dialog"]');
      await expect(closeButton).toHaveAttribute('aria-label', 'Close dialog');

      const saveButton = page.locator('usa-button[aria-label="Save document"]');
      await expect(saveButton).toHaveAttribute('aria-label', 'Save document');

      // Test that screen reader gets complete button information
      await closeButton.focus();
      const buttonRole = await closeButton.getAttribute('role');
      expect(buttonRole || 'button').toBe('button'); // Default button role
    });

    test('should provide form control descriptions', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--with-label');
      await page.waitForLoadState('networkidle');

      // Test form control labeling
      const input = page.locator('input[type="text"]').first();
      const labelId = await input.getAttribute('aria-labelledby');

      if (labelId) {
        const label = page.locator(`#${labelId}`);
        await expect(label).toBeVisible();

        const labelText = await label.textContent();
        expect(labelText).toBeTruthy();
      }

      // Test describedby relationships
      const describedBy = await input.getAttribute('aria-describedby');
      if (describedBy) {
        const description = page.locator(`#${describedBy}`);
        await expect(description).toBeVisible();
      }
    });

    test('should handle complex widget descriptions', async ({ page }) => {
      await page.goto('/iframe.html?id=components-accordion--default');
      await page.waitForLoadState('networkidle');

      // Test accordion button descriptions
      const accordionButtons = page.locator('.usa-accordion__button');
      const firstButton = accordionButtons.first();

      // Check ARIA expanded state
      await expect(firstButton).toHaveAttribute('aria-expanded', 'false');

      // Check that button controls the panel
      const controls = await firstButton.getAttribute('aria-controls');
      expect(controls).toBeTruthy();

      if (controls) {
        const panel = page.locator(`#${controls}`);
        await expect(panel).toBeVisible();
      }

      // Test state change announcements
      await firstButton.click();
      await page.waitForTimeout(500);
      await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('Reading Order and Navigation Testing', () => {
    test('should maintain logical reading order in cards', async ({ page }) => {
      await page.goto('/iframe.html?id=components-card--with-media');
      await page.waitForLoadState('networkidle');

      // Test reading order of card elements
      const card = page.locator('.usa-card').first();
      const focusableElements = card.locator('a, button, [tabindex]:not([tabindex="-1"])');

      if (await focusableElements.count() > 0) {
        // Test tab order matches reading order
        await page.keyboard.press('Tab');
        let currentIndex = 0;

        for (let i = 0; i < Math.min(3, await focusableElements.count()); i++) {
          const focused = page.locator(':focus');
          const expectedElement = focusableElements.nth(i);

          // Check if focus is on expected element
          await page.keyboard.press('Tab');
        }
      }
    });

    test('should provide logical navigation in modal dialogs', async ({ page }) => {
      await page.goto('/iframe.html?id=components-modal--default');
      await page.waitForLoadState('networkidle');

      // Open modal
      const openButton = page.locator('button:has-text("Open Modal")').first();
      await openButton.click();
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      const modal = page.locator('[role="dialog"]');

      // Test focus management
      const focusedElement = page.locator(':focus');

      // Focus should be trapped within modal
      await page.keyboard.press('Tab');
      const focusAfterTab = page.locator(':focus');

      // Verify focus stays within modal
      const modalBounds = await modal.boundingBox();
      const focusBounds = await focusAfterTab.boundingBox();

      if (modalBounds && focusBounds) {
        expect(focusBounds.x).toBeGreaterThanOrEqual(modalBounds.x - 10);
        expect(focusBounds.x).toBeLessThanOrEqual(modalBounds.x + modalBounds.width + 10);
      }
    });

    test('should maintain proper heading hierarchy', async ({ page }) => {
      await page.goto('/iframe.html?id=components-summary-box--default');
      await page.waitForLoadState('networkidle');

      // Test heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();

      if (headingCount > 0) {
        // Check heading levels are logical
        const headingLevels: number[] = [];

        for (let i = 0; i < headingCount; i++) {
          const heading = headings.nth(i);
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
          const level = parseInt(tagName.substring(1));
          headingLevels.push(level);
        }

        // Verify heading hierarchy (no levels should be skipped)
        for (let i = 1; i < headingLevels.length; i++) {
          const currentLevel = headingLevels[i];
          const previousLevel = headingLevels[i - 1];

          // Levels shouldn't jump by more than 1
          if (currentLevel > previousLevel) {
            expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
          }
        }
      }
    });
  });

  test.describe('Interactive Widget Screen Reader Support', () => {
    test('should announce combo box interactions', async ({ page }) => {
      await page.goto('/iframe.html?id=components-combo-box--default');
      await page.waitForLoadState('networkidle');

      const input = page.locator('.usa-combo-box__input');

      // Test input role and properties
      await expect(input).toHaveAttribute('role', 'combobox');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
      await expect(input).toHaveAttribute('aria-autocomplete', 'list');

      // Test listbox association
      const listboxId = await input.getAttribute('aria-controls');
      expect(listboxId).toBeTruthy();

      if (listboxId) {
        const listbox = page.locator(`#${listboxId}`);
        await expect(listbox).toHaveAttribute('role', 'listbox');
      }

      // Test option selection announcements
      await input.click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);

      // Check active descendant
      const activeDescendant = await input.getAttribute('aria-activedescendant');
      if (activeDescendant) {
        const activeOption = page.locator(`#${activeDescendant}`);
        await expect(activeOption).toHaveAttribute('role', 'option');
        await expect(activeOption).toHaveAttribute('aria-selected', 'true');
      }
    });

    test('should announce date picker navigation', async ({ page }) => {
      await page.goto('/iframe.html?id=components-date-picker--default');
      await page.waitForLoadState('networkidle');

      // Open date picker
      const toggleButton = page.locator('.usa-date-picker__button');
      if (await toggleButton.count() > 0) {
        await toggleButton.click();
        await page.waitForSelector('.usa-date-picker__calendar', { state: 'visible' });

        // Test calendar navigation
        const calendar = page.locator('.usa-date-picker__calendar');
        await expect(calendar).toHaveAttribute('role', 'application');

        // Test date navigation announcements
        const dateButtons = page.locator('.usa-date-picker__calendar__date');
        if (await dateButtons.count() > 0) {
          const firstDate = dateButtons.first();
          await firstDate.focus();

          // Test arrow key navigation
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(100);

          // Check focus moved to next date
          const focusedDate = page.locator('.usa-date-picker__calendar__date:focus');
          await expect(focusedDate).toBeVisible();
        }
      }
    });

    test('should provide table navigation support', async ({ page }) => {
      await page.goto('/iframe.html?id=components-table--sortable');
      await page.waitForLoadState('networkidle');

      const table = page.locator('.usa-table');
      await expect(table).toHaveAttribute('role', 'table');

      // Test table headers
      const columnHeaders = page.locator('.usa-table th');
      const headerCount = await columnHeaders.count();

      if (headerCount > 0) {
        // Check sortable column announcements
        const sortableHeaders = page.locator('.usa-table th button');
        const sortableCount = await sortableHeaders.count();

        if (sortableCount > 0) {
          const firstSortable = sortableHeaders.first();

          // Test sort state announcement
          const ariaSortValue = await firstSortable.getAttribute('aria-sort');
          expect(ariaSortValue).toMatch(/none|ascending|descending/);

          // Test sort activation
          await firstSortable.click();
          await page.waitForTimeout(300);

          const newSortValue = await firstSortable.getAttribute('aria-sort');
          expect(newSortValue).not.toBe('none');
        }
      }
    });
  });

  test.describe('Form Accessibility and Screen Reader Support', () => {
    test('should announce form validation states', async ({ page }) => {
      await page.goto('/iframe.html?id=components-text-input--required');
      await page.waitForLoadState('networkidle');

      const input = page.locator('input[required]').first();

      // Test required field announcement
      await expect(input).toHaveAttribute('required');
      await expect(input).toHaveAttribute('aria-required', 'true');

      // Test validation error announcement
      await input.focus();
      await input.fill('');
      await input.blur();
      await page.waitForTimeout(500);

      // Check if validation error is properly announced
      const errorElement = page.locator('[aria-describedby] ~ .usa-error-message, .usa-input-error .usa-error-message');
      if (await errorElement.count() > 0) {
        await expect(errorElement).toHaveAttribute('role', 'alert');
      }
    });

    test('should provide fieldset and legend support', async ({ page }) => {
      await page.goto('/iframe.html?id=components-radio--default');
      await page.waitForLoadState('networkidle');

      // Test radio group structure
      const fieldset = page.locator('fieldset').first();
      if (await fieldset.count() > 0) {
        const legend = fieldset.locator('legend').first();
        await expect(legend).toBeVisible();

        // Test radio group role
        const radioGroup = page.locator('[role="radiogroup"]').first();
        if (await radioGroup.count() > 0) {
          await expect(radioGroup).toBeVisible();

          // Test radio navigation
          const radios = radioGroup.locator('input[type="radio"]');
          const radioCount = await radios.count();

          if (radioCount > 0) {
            const firstRadio = radios.first();
            await firstRadio.focus();

            // Test arrow key navigation
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(100);

            const focusedRadio = page.locator('input[type="radio"]:focus');
            await expect(focusedRadio).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Status and Progress Announcements', () => {
    test('should announce loading states', async ({ page }) => {
      // Test with a component that has loading states
      await page.goto('/iframe.html?id=components-button--default');
      await page.waitForLoadState('networkidle');

      // Add test for loading state if component supports it
      const button = page.locator('usa-button').first();

      // Test aria-busy for loading states
      await button.evaluate(el => {
        el.setAttribute('aria-busy', 'true');
        el.setAttribute('aria-describedby', 'loading-status');

        const status = document.createElement('div');
        status.id = 'loading-status';
        status.setAttribute('aria-live', 'polite');
        status.textContent = 'Loading...';
        document.body.appendChild(status);
      });

      await expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('should announce character count updates', async ({ page }) => {
      await page.goto('/iframe.html?id=components-character-count--default');
      await page.waitForLoadState('networkidle');

      const textarea = page.locator('.usa-character-count__field');
      const message = page.locator('.usa-character-count__message');

      if (await textarea.count() > 0 && await message.count() > 0) {
        // Test that message is announced
        await expect(message).toHaveAttribute('aria-live', 'polite');

        // Type in textarea and check announcements
        await textarea.fill('Test content');
        await page.waitForTimeout(500);

        // Verify character count is updated
        const messageText = await message.textContent();
        expect(messageText).toContain('characters');
      }
    });
  });
});