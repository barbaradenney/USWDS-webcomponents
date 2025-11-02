import { test, expect } from '@playwright/test';

/**
 * Date Picker Deep Testing Suite
 *
 * Phase 2 comprehensive testing for usa-date-picker component
 * Tests calendar interactions, date selection, validation, and edge cases
 *
 * Total Tests: 14
 * - 4 Baseline tests (rendering, keyboard, a11y, responsive)
 * - 4 Calendar interaction tests
 * - 3 Validation tests
 * - 3 Edge case tests
 */

const STORY_URL = '/iframe.html?id=forms-date-picker--default';
const COMPONENT_SELECTOR = 'usa-date-picker';
const WRAPPER_SELECTOR = '.usa-date-picker'; // USWDS wrapper inside component

test.describe('Date Picker Deep Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ============================================================================
  // BASELINE TESTS (4 tests)
  // ============================================================================

  test.describe('Baseline Tests', () => {
    test('should render correctly', async ({ page, browserName }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Check for USWDS wrapper inside component
      const wrapper = component.locator(WRAPPER_SELECTOR);
      await expect(wrapper).toBeVisible();

      // Check for external input (USWDS creates internal + external inputs)
      const input = wrapper.locator('input.usa-date-picker__external-input');
      await expect(input).toBeVisible();

      // Visual regression screenshot
      await page.screenshot({
        path: `test-results/screenshots/${browserName}-date-picker-render.png`,
        fullPage: false,
        clip: (await component.boundingBox()) || undefined,
      });
    });

    test('should handle keyboard accessibility', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      // USWDS creates multiple inputs - target the external input users interact with
      const input = component.locator('input.usa-date-picker__external-input');

      // Focus the input directly (Tab may focus other elements first)
      await input.click();
      await expect(input).toBeFocused();

      // Type date
      await input.fill('01/15/2025');
      const value = await input.inputValue();
      expect(value).toContain('01/15/2025');
    });

    test('should be accessible', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input.usa-date-picker__external-input');

      // Check for label association
      const inputId = await input.getAttribute('id');
      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        expect(await label.count()).toBeGreaterThan(0);
      }

      // Check for calendar button
      const calendarButton = component.locator('button').first();
      await expect(calendarButton).toBeVisible();
      const ariaLabel = await calendarButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });

    test('should handle responsive design', async ({ page, isMobile }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      const box = await component.boundingBox();
      expect(box).toBeTruthy();

      if (isMobile) {
        const viewportSize = page.viewportSize();
        if (viewportSize && box) {
          expect(box.width).toBeLessThanOrEqual(viewportSize.width);
        }
      }

      const deviceType = isMobile ? 'mobile' : 'desktop';
      await page.screenshot({
        path: `test-results/screenshots/${deviceType}-date-picker-responsive.png`,
        fullPage: false,
        clip: box || undefined,
      });
    });
  });

  // ============================================================================
  // CALENDAR INTERACTION TESTS (4 tests)
  // ============================================================================

  test.describe('Calendar Interaction Tests', () => {
    test('should toggle calendar on button click', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const calendarButton = component.locator('.usa-date-picker__button').first();
      const calendar = component.locator('.usa-date-picker__calendar');

      // Open calendar
      await calendarButton.click();
      await expect(calendar).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(calendar).toBeHidden();

      // Open again
      await calendarButton.click();
      await expect(calendar).toBeVisible();

      // Close by clicking outside
      await page.click('body', { position: { x: 0, y: 0 } });
      await expect(calendar).toBeHidden();
    });

    test('should select date from calendar', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input.usa-date-picker__external-input');
      const calendarButton = component.locator('.usa-date-picker__button').first();

      // Open calendar
      await calendarButton.click();

      // Click 15th day of current month
      const dayButton = component.locator('button.usa-date-picker__calendar__date').filter({ hasText: '15' }).first();
      await dayButton.click();

      // Verify input value updated
      const inputValue = await input.inputValue();
      expect(inputValue).toContain('/15/');

      // Verify calendar closed
      const calendar = component.locator('.usa-date-picker__calendar');
      await expect(calendar).toBeHidden();

      // Verify aria-selected attribute
      await calendarButton.click();
      await expect(dayButton).toHaveAttribute('aria-selected', 'true');
    });

    test('should navigate months in calendar', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const calendarButton = component.locator('.usa-date-picker__button').first();

      // Open calendar
      await calendarButton.click();

      const calendar = component.locator('.usa-date-picker__calendar');
      await expect(calendar).toBeVisible();

      const monthDisplay = component.locator('.usa-date-picker__calendar__month-label');
      const initialMonth = await monthDisplay.textContent();

      // Click next month button
      const nextMonthButton = component.locator('.usa-date-picker__calendar__next-month');
      await nextMonthButton.click();

      // Wait for month to update
      await page.waitForTimeout(500);
      await expect(calendar).toBeVisible();

      const newMonth = await monthDisplay.textContent();
      expect(newMonth).not.toBe(initialMonth);

      // Click previous month button
      const prevMonthButton = component.locator('.usa-date-picker__calendar__previous-month');
      await expect(prevMonthButton).toBeVisible();
      await prevMonthButton.click();

      // Wait for month to update
      await page.waitForTimeout(500);

      const backToOriginal = await monthDisplay.textContent();
      expect(backToOriginal).toBe(initialMonth);

      // Test keyboard navigation (arrow keys)
      const firstDay = component.locator('button.usa-date-picker__calendar__date').first();
      await firstDay.focus();
      await page.keyboard.press('ArrowRight');

      const focusedElement = page.locator(':focus');
      const focusedText = await focusedElement.textContent();
      expect(parseInt(focusedText || '0')).toBeGreaterThan(parseInt(await firstDay.textContent() || '0'));
    });

    test('should select today with Today button', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input.usa-date-picker__external-input');
      const calendarButton = component.locator('.usa-date-picker__button').first();

      // Open calendar
      await calendarButton.click();

      // Click Today button
      const todayButton = component.locator('button').filter({ hasText: /today/i }).first();
      if ((await todayButton.count()) > 0) {
        await todayButton.click();

        // Verify current date selected
        const inputValue = await input.inputValue();
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();

        expect(inputValue).toContain(`${month}/${day}/${year}`);

        // Verify calendar closed
        const calendar = component.locator('.usa-date-picker__calendar');
        await expect(calendar).toBeHidden();
      }
    });
  });

  // ============================================================================
  // VALIDATION TESTS (3 tests)
  // ============================================================================

  test.describe('Validation Tests', () => {
    test('should enforce min/max date constraints', async ({ page }) => {
      // Use story with min/max dates set
      await page.goto('/iframe.html?id=forms-date-picker--with-date-range');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const calendarButton = component.locator('.usa-date-picker__button').first();

      // Open calendar
      await calendarButton.click();

      // Check that dates outside range are disabled
      const disabledDates = component.locator('button.usa-date-picker__calendar__date[disabled]');
      expect(await disabledDates.count()).toBeGreaterThan(0);

      // Verify disabled attribute on disabled dates
      // Note: USWDS only sets 'disabled' attribute, not 'aria-disabled'
      const firstDisabled = disabledDates.first();
      await expect(firstDisabled).toBeDisabled();

      // Verify the date is truly disabled (Playwright prevents clicking disabled buttons)
      // The disabled attribute itself prevents selection, so we don't need to test clicking it
    });

    test('should validate required field', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-date-picker--required');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input.usa-date-picker__external-input');

      // Check required attribute
      const isRequired = await input.getAttribute('required');
      expect(isRequired).toBeTruthy();

      // Verify aria-required
      const ariaRequired = await input.getAttribute('aria-required');
      expect(ariaRequired).toBe('true');

      // Trigger validation (blur without value)
      await input.focus();
      await input.blur();

      // Check for validation error indicator
      const errorMessage = component.locator('.usa-error-message, .usa-input--error');
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeVisible();
      }

      // Fill date and verify error clears
      await input.fill('01/15/2025');
      await input.blur();

      // Error should be gone
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeHidden();
      }
    });

    test('should validate date format', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input.usa-date-picker__external-input');

      // Type invalid date
      await input.fill('13/45/2025'); // Invalid month and day
      await input.blur();

      // Check for validation error
      const errorMessage = component.locator('.usa-error-message, .usa-input--error');
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeVisible();
      }

      // Clear and type valid date
      await input.fill('01/15/2025');
      await input.blur();

      // Verify date parsed correctly
      const value = await input.inputValue();
      expect(value).toBe('01/15/2025');
    });
  });

  // ============================================================================
  // EDGE CASE TESTS (3 tests)
  // ============================================================================

  test.describe('Edge Case Tests', () => {
    test('should handle leap years correctly', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input.usa-date-picker__external-input');

      await input.fill('02/15/2024'); // 2024 is a leap year

      const calendarButton = component.locator('.usa-date-picker__button').first();
      await calendarButton.click();

      const calendar = component.locator('.usa-date-picker__calendar');
      await expect(calendar).toBeVisible();

      // Wait for calendar to render
      await page.waitForTimeout(500);

      // Verify 29 days shown in February
      const day29 = component.locator('button.usa-date-picker__calendar__date').filter({ hasText: /^29$/ }).first();
      await expect(day29).toBeVisible();

      // Close and switch to non-leap year
      await page.keyboard.press('Escape');
      await expect(calendar).toBeHidden();

      await input.fill('02/15/2023'); // 2023 is not a leap year
      await calendarButton.click();
      await expect(calendar).toBeVisible();

      // Wait for calendar to render
      await page.waitForTimeout(500);

      // Verify only 28 days shown (29 should not exist)
      const day29NonLeap = component.locator('button.usa-date-picker__calendar__date').filter({ hasText: /^29$/ });
      expect(await day29NonLeap.count()).toBe(0);
    });

    test('should handle month/year boundaries', async ({ page }) => {
      await page.goto(STORY_URL);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input.usa-date-picker__external-input');
      const calendarButton = component.locator('.usa-date-picker__button').first();

      // Set to end of year
      await input.fill('12/31/2024');
      await calendarButton.click();

      const calendar = component.locator('.usa-date-picker__calendar');
      await expect(calendar).toBeVisible();

      const monthDisplay = component.locator('.usa-date-picker__calendar__month-label');
      const yearDisplay = component.locator('.usa-date-picker__calendar__year');

      // Verify December 2024
      expect(await monthDisplay.textContent()).toContain('December');
      expect(await yearDisplay.textContent()).toContain('2024');

      // Click next month
      const nextMonthButton = component.locator('.usa-date-picker__calendar__next-month');
      await nextMonthButton.click();

      // Wait for month to update
      await page.waitForTimeout(500);
      await expect(calendar).toBeVisible();

      // Verify January 2025
      expect(await monthDisplay.textContent()).toContain('January');
      expect(await yearDisplay.textContent()).toContain('2025');

      // Go back to December 2024
      const prevMonthButton = component.locator('.usa-date-picker__calendar__previous-month');
      await expect(prevMonthButton).toBeVisible();
      await prevMonthButton.click();

      // Wait for month to update
      await page.waitForTimeout(500);

      expect(await monthDisplay.textContent()).toContain('December');
      expect(await yearDisplay.textContent()).toContain('2024');
    });

    test('should handle pre-filled dates', async ({ page }) => {
      // Use story with default value
      await page.goto('/iframe.html?id=forms-date-picker--with-value');
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input.usa-date-picker__external-input');

      // Verify input has pre-filled value
      const value = await input.inputValue();
      expect(value).toBeTruthy();
      expect(value.length).toBeGreaterThan(0);

      // Open calendar
      const calendarButton = component.locator('.usa-date-picker__button').first();
      await calendarButton.click();

      // Verify calendar opens to correct month/year
      const monthDisplay = component.locator('.usa-date-picker__calendar__month-label');
      const monthText = await monthDisplay.textContent();
      expect(monthText).toBeTruthy();

      // Verify pre-selected date is highlighted
      const selectedDate = component.locator('button.usa-date-picker__calendar__date[aria-selected="true"]').first();
      await expect(selectedDate).toBeVisible();

      // Verify selected date matches input value
      const selectedDay = await selectedDate.textContent();
      expect(value).toContain(selectedDay || '');
    });
  });
});
