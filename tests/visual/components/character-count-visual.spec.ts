import { test, expect } from '@playwright/test';

/**
 * Character Count Visual Regression Tests
 *
 * These Playwright tests catch visual and structural regressions:
 * 1. USWDS message element structure (caught aria-live bug)
 * 2. Screen reader announcements
 * 3. Error state visual appearance
 * 4. Character count display accuracy
 *
 * CRITICAL: These prevent USWDS compliance regressions
 */

test.describe('Character Count Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Character Count component in Storybook
    await page.goto('http://localhost:6006/?path=/story/forms-character-count--default');
    await page.waitForLoadState('networkidle');
  });

  test('REGRESSION: message element should NOT have aria-live', async ({ page }) => {
    // This regression was caught: message element had aria-live when USWDS spec removes it
    // USWDS spec line 189: Removes aria-live from message element

    const characterCount = page.locator('usa-character-count').first();

    // Get message element
    const message = characterCount.locator('.usa-character-count__message');
    await expect(message).toBeVisible();

    // CRITICAL: Message should NOT have aria-live (per USWDS spec line 189)
    const ariaLive = await message.getAttribute('aria-live');
    expect(ariaLive).toBeNull();

    // Message should have usa-sr-only class
    await expect(message).toHaveClass(/usa-sr-only/);
  });

  test('should have SR status element with aria-live', async ({ page }) => {
    const characterCount = page.locator('usa-character-count').first();

    // SR status element should exist
    const srStatus = characterCount.locator('.usa-character-count__sr-status');
    await expect(srStatus).toBeVisible();

    // USWDS spec: SR status should have aria-live="polite"
    await expect(srStatus).toHaveAttribute('aria-live', 'polite');

    // Should be screen-reader only
    await expect(srStatus).toHaveClass(/usa-sr-only/);
  });

  test('should display character count status correctly', async ({ page }) => {
    const characterCount = page.locator('usa-character-count').first();

    // Status element should exist
    const status = characterCount.locator('.usa-character-count__status');
    await expect(status).toBeVisible();

    // Should have usa-hint class per USWDS spec
    await expect(status).toHaveClass(/usa-hint/);

    // Should be hidden from screen readers (visual only)
    await expect(status).toHaveAttribute('aria-hidden', 'true');

    // Take visual snapshot
    await expect(status).toHaveScreenshot('character-count-status.png');
  });

  test('should show error state visually when over limit', async ({ page }) => {
    const characterCount = page.locator('usa-character-count').first();

    // Get textarea
    const textarea = characterCount.locator('.usa-character-count__field');

    // Type text exceeding limit (assume 100 char limit)
    const longText = 'a'.repeat(110);
    await textarea.fill(longText);
    await page.waitForTimeout(300); // Wait for update

    // Form group should have error class
    const formGroup = characterCount.locator('.usa-form-group');
    await expect(formGroup).toHaveClass(/usa-form-group--error/);

    // Field should have error class
    await expect(textarea).toHaveClass(/usa-input--error/);

    // Status should have invalid class
    const status = characterCount.locator('.usa-character-count__status');
    await expect(status).toHaveClass(/usa-character-count__status--invalid/);

    // Status should show "characters over limit"
    await expect(status).toContainText('over limit');

    // Take visual snapshot of error state
    await expect(characterCount).toHaveScreenshot('character-count-error-state.png');
  });

  test('should show correct status message formats', async ({ page }) => {
    const characterCount = page.locator('usa-character-count').first();
    const textarea = characterCount.locator('.usa-character-count__field');
    const status = characterCount.locator('.usa-character-count__status');

    // Empty field (100 characters allowed)
    await textarea.clear();
    await page.waitForTimeout(200);
    await expect(status).toContainText('100 characters allowed');

    // 1 character remaining (singular)
    await textarea.fill('a'.repeat(99));
    await page.waitForTimeout(200);
    await expect(status).toContainText('1 character left');

    // Multiple characters remaining (plural)
    await textarea.fill('a'.repeat(95));
    await page.waitForTimeout(200);
    await expect(status).toContainText('5 characters left');

    // Exactly at limit
    await textarea.fill('a'.repeat(100));
    await page.waitForTimeout(200);
    await expect(status).toContainText('Character limit reached');

    // 1 character over (singular)
    await textarea.fill('a'.repeat(101));
    await page.waitForTimeout(200);
    await expect(status).toContainText('1 character over limit');

    // Multiple characters over (plural)
    await textarea.fill('a'.repeat(105));
    await page.waitForTimeout(200);
    await expect(status).toContainText('5 characters over limit');
  });

  test('should announce count changes to screen readers', async ({ page }) => {
    const characterCount = page.locator('usa-character-count').first();
    const textarea = characterCount.locator('.usa-character-count__field');
    const srStatus = characterCount.locator('.usa-character-count__sr-status');

    // Type some text
    await textarea.fill('Test');
    await page.waitForTimeout(200);

    // SR status should update
    const srText = await srStatus.textContent();
    expect(srText).toMatch(/\d+ characters? left/);

    // SR status should have aria-live
    await expect(srStatus).toHaveAttribute('aria-live', 'polite');
  });

  test('should maintain USWDS structure on dynamic updates', async ({ page }) => {
    const characterCount = page.locator('usa-character-count').first();
    const textarea = characterCount.locator('.usa-character-count__field');

    // Type to trigger updates
    await textarea.fill('Testing dynamic updates');
    await page.waitForTimeout(200);

    // Message element should STILL not have aria-live after updates
    const message = characterCount.locator('.usa-character-count__message');
    const ariaLive = await message.getAttribute('aria-live');
    expect(ariaLive).toBeNull();

    // SR status should STILL have aria-live
    const srStatus = characterCount.locator('.usa-character-count__sr-status');
    await expect(srStatus).toHaveAttribute('aria-live', 'polite');
  });

  test('should have correct visual hierarchy', async ({ page }) => {
    const characterCount = page.locator('usa-character-count').first();

    // All required elements should exist
    const label = characterCount.locator('.usa-label');
    const textarea = characterCount.locator('.usa-character-count__field');
    const message = characterCount.locator('.usa-character-count__message');
    const status = characterCount.locator('.usa-character-count__status');
    const srStatus = characterCount.locator('.usa-character-count__sr-status');

    await expect(label).toBeVisible();
    await expect(textarea).toBeVisible();
    await expect(message).toBeVisible();
    await expect(status).toBeVisible();
    await expect(srStatus).toBeVisible();

    // Take full component snapshot
    await expect(characterCount).toHaveScreenshot('character-count-structure.png');
  });

  test('REGRESSION: validates complete USWDS structure', async ({ page }) => {
    const characterCount = page.locator('usa-character-count').first();

    // Container should have correct class
    const container = characterCount.locator('.usa-character-count');
    await expect(container).toBeVisible();

    // Form group
    const formGroup = characterCount.locator('.usa-form-group');
    await expect(formGroup).toBeVisible();

    // Label
    const label = characterCount.locator('.usa-label');
    await expect(label).toBeVisible();

    // Field
    const field = characterCount.locator('.usa-character-count__field');
    await expect(field).toBeVisible();

    // Message (sr-only)
    const message = characterCount.locator('.usa-character-count__message');
    await expect(message).toHaveClass(/usa-sr-only/);

    // Status (usa-hint)
    const status = characterCount.locator('.usa-character-count__status');
    await expect(status).toHaveClass(/usa-hint/);

    // SR Status (sr-only with aria-live)
    const srStatus = characterCount.locator('.usa-character-count__sr-status');
    await expect(srStatus).toHaveClass(/usa-sr-only/);
    await expect(srStatus).toHaveAttribute('aria-live', 'polite');
  });
});

test.describe('Character Count Cross-Browser Visual Tests', () => {
  test('should render error state consistently across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:6006/?path=/story/forms-character-count--error-state');
    await page.waitForLoadState('networkidle');

    const characterCount = page.locator('usa-character-count').first();

    // Take browser-specific snapshot
    await expect(characterCount).toHaveScreenshot(`character-count-error-${browserName}.png`);
  });

  test('should maintain visual consistency across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:6006/?path=/story/forms-character-count--default');
    await page.waitForLoadState('networkidle');

    const characterCount = page.locator('usa-character-count').first();

    // Take browser-specific snapshot
    await expect(characterCount).toHaveScreenshot(`character-count-${browserName}.png`);
  });
});

test.describe('Character Count Accessibility Visual Tests', () => {
  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/forms-character-count--default');
    await page.waitForLoadState('networkidle');

    const characterCount = page.locator('usa-character-count').first();
    const textarea = characterCount.locator('.usa-character-count__field');

    // Focus the textarea
    await textarea.focus();

    // Should have visible focus state
    await expect(textarea).toBeFocused();

    // Take snapshot of focus state
    await expect(characterCount).toHaveScreenshot('character-count-focus.png');
  });

  test('should show error state with sufficient color contrast', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/forms-character-count--error-state');
    await page.waitForLoadState('networkidle');

    const characterCount = page.locator('usa-character-count').first();
    const status = characterCount.locator('.usa-character-count__status');

    // Error status should be visible
    await expect(status).toBeVisible();
    await expect(status).toHaveClass(/usa-character-count__status--invalid/);

    // Take snapshot for contrast validation
    await expect(characterCount).toHaveScreenshot('character-count-error-contrast.png');
  });
});
