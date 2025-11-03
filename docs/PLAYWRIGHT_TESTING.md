# Playwright Testing Guide

## Overview

This guide documents the Playwright testing infrastructure for USWDS Web Components, including configuration, best practices, and common patterns.

## Test Files

- **tests/playwright/smoke.spec.ts** - Basic smoke tests verifying Storybook and component accessibility
- **tests/playwright/user-flows.spec.ts** - Real user workflow simulations across multiple components
- **tests/playwright/cross-browser-compatibility.spec.ts** - Cross-browser compatibility tests for USWDS components
- **tests/playwright/accordion-cross-browser.spec.ts** - Accordion-specific cross-browser tests
- **tests/playwright/combo-box-cross-browser.spec.ts** - Combo box-specific cross-browser tests

## Timeout Configuration

Playwright has multiple timeout levels that work together:

### Global Configuration (playwright.config.ts)

```typescript
{
  timeout: 30000,        // Test timeout: 30s (overall test execution)

  use: {
    actionTimeout: 10000,      // Action timeout: 10s (clicks, fills, etc.)
    navigationTimeout: 15000,  // Navigation timeout: 15s (page.goto)
  },

  expect: {
    timeout: process.env.CI ? 15000 : 5000,  // Expect timeout: 15s in CI, 5s locally
  }
}
```

### Timeout Hierarchy

1. **Test Timeout (30s)** - Maximum time for entire test to complete
2. **Navigation Timeout (15s)** - Time allowed for page.goto() operations
3. **Action Timeout (10s)** - Time allowed for user actions (click, fill, type)
4. **Expect Timeout (15s in CI)** - Time allowed for expect() assertions to pass

### CI-Specific Configuration

The expect timeout is extended to 15s in CI environments to account for:
- Slower CI runner performance
- Network latency
- Resource contention
- Component initialization delays

**Commit:** dc2f02410 - Extended expect timeout to 15s in CI

## Best Practices

### ✅ DO: Use State-Based Waits

Playwright provides built-in waiting in most actions and assertions:

```typescript
// ✅ GOOD: expect() waits automatically
await expect(element).toBeVisible();
await expect(element).toHaveAttribute('aria-expanded', 'true');

// ✅ GOOD: waitForLoadState waits for specific state
await page.waitForLoadState('networkidle');
await page.waitForLoadState('load');

// ✅ GOOD: waitForSelector waits for element
await page.waitForSelector('#storybook-root usa-accordion');
```

### ❌ DON'T: Use Arbitrary Time Delays

```typescript
// ❌ BAD: waitForTimeout is an anti-pattern
await page.waitForTimeout(1000);  // What are we waiting for?
await page.waitForTimeout(500);   // Will it always take this long?

// ✅ GOOD: Wait for actual state changes
await expect(dropdown).toBeVisible();
```

### Common Patterns

#### Pattern 1: Wait for Component to Load

```typescript
// After navigation
await page.goto('/iframe.html?id=actions-button--default');
await page.waitForLoadState('networkidle');

// Component is ready to interact with
const button = page.locator('usa-button').first();
await expect(button).toBeVisible();
```

#### Pattern 2: Wait for User Action Results

```typescript
// Click action
await toggleButton.click();

// Wait for state change
await expect(dropdown).toBeVisible();
await expect(input).toHaveAttribute('aria-expanded', 'true');
```

#### Pattern 3: Keyboard Navigation

```typescript
// Keyboard actions are synchronous - no wait needed
await input.press('ArrowDown');
await input.press('Enter');

// Wait for resulting state change
await expect(dropdown).toHaveAttribute('hidden');
```

#### Pattern 4: Viewport Changes

```typescript
// Viewport changes are synchronous
await page.setViewportSize({ width: 768, height: 1024 });

// Component reflow is immediate
const component = page.locator('usa-header');
await expect(component).toBeVisible();
```

## Anti-Patterns Removed

### Commit: fe1760f3b - Removed All Brittle waitForTimeout Patterns

We systematically removed 16 instances of `waitForTimeout()` across all test files:

#### cross-browser-compatibility.spec.ts (4 fixes)

```typescript
// ❌ BEFORE: Unnecessary wait after networkidle
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000); // Allow for animations

// ✅ AFTER: networkidle is sufficient
await page.waitForLoadState('networkidle');
```

```typescript
// ❌ BEFORE: Wait after keyboard actions
await focusedElement.press('Enter');
await page.waitForTimeout(500);

// ✅ AFTER: Keyboard actions are synchronous
await focusedElement.press('Enter');
```

```typescript
// ❌ BEFORE: Wait between rapid clicks
for (let i = 0; i < buttonCount; i++) {
  await accordionButtons.nth(i).click();
  await page.waitForTimeout(50);
}

// ✅ AFTER: Clicks are synchronous
for (let i = 0; i < buttonCount; i++) {
  await accordionButtons.nth(i).click();
}
```

**Exception:** One `waitForTimeout(100)` was intentionally kept for network simulation testing:

```typescript
// Network route handler for slow 3G simulation
await context.route('**/*', async (route) => {
  await page.waitForTimeout(100); // Intentional network delay
  await route.continue();
});
```

#### smoke.spec.ts (1 fix)

```typescript
// ❌ BEFORE: Wait for delayed errors
await page.goto('/');
await page.waitForTimeout(2000);

// ✅ AFTER: Wait for proper load states
await page.goto('/');
await page.waitForLoadState('networkidle');
await page.waitForLoadState('load');
```

#### user-flows.spec.ts (5 fixes)

```typescript
// ❌ BEFORE: Wait for form events
await textInput.press('Enter');
await page.waitForTimeout(100);

// ✅ AFTER: Events propagate immediately
await textInput.press('Enter');
```

```typescript
// ❌ BEFORE: Wait for component navigation
await page.click('text=Button');
await page.waitForTimeout(500);

// ✅ AFTER: Navigation is synchronous
await page.click('text=Button');
```

```typescript
// ❌ BEFORE: Wait for accordion state
await page.keyboard.press('Enter');
await page.waitForTimeout(300);

// ✅ AFTER: State changes are synchronous
await page.keyboard.press('Enter');
```

```typescript
// ❌ BEFORE: Wait for viewport reflow
await page.setViewportSize(viewport);
await page.waitForTimeout(500);

// ✅ AFTER: Reflow is synchronous
await page.setViewportSize(viewport);
```

```typescript
// ❌ BEFORE: Wait for scroll actions
await page.wheel(0, 500);
await page.waitForTimeout(100);

// ✅ AFTER: Scroll is synchronous
await page.wheel(0, 500);
```

#### accordion-cross-browser.spec.ts (2 fixes - commit d991fea4e)

```typescript
// ❌ BEFORE: Wait after navigation
await page.goto('/iframe.html?id=structure-accordion--default');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);

// ✅ AFTER: networkidle is sufficient
await page.goto('/iframe.html?id=structure-accordion--default');
await page.waitForLoadState('networkidle');
```

#### combo-box-cross-browser.spec.ts (4 fixes - commit d991fea4e)

Similar patterns to accordion - removed unnecessary waits after networkidle and keyboard actions.

## Results

**Total Fixes:** 16 brittle `waitForTimeout()` patterns removed (94%)
**Remaining:** 1 intentional delay for network simulation (6%)

**Benefits:**
- Tests wait for actual state changes instead of arbitrary time
- Faster test execution (~3.5s total wait time removed)
- More reliable across different CI environments
- Follows Playwright best practices

## Running Tests

```bash
# Run all Playwright tests
pnpm run test:visual

# Run in headed mode (see browser)
pnpm run test:visual -- --headed

# Run specific test file
pnpm run test:visual -- smoke.spec.ts

# Run tests in debug mode
pnpm run test:visual -- --debug
```

## CI Integration

Playwright tests run automatically in CI on:
- All pull requests
- Pushes to main/develop branches
- Manual workflow dispatch

CI configuration includes:
- Extended expect timeout (15s)
- Multiple browser projects (Chromium, Firefox, WebKit)
- Parallel test execution
- Automatic retry on flaky tests

## Troubleshooting

### Test Timeouts

If tests are timing out:

1. **Check expect timeout** - May need adjustment for slower environments
2. **Verify waitForLoadState usage** - Ensure networkidle is used after navigation
3. **Check for missing waits** - Ensure expect() assertions are used for state changes
4. **Avoid waitForTimeout** - Use state-based waits instead

### Flaky Tests

If tests are flaky:

1. **Remove arbitrary delays** - Replace waitForTimeout with expect() assertions
2. **Wait for visibility** - Use `expect().toBeVisible()` before interactions
3. **Wait for stability** - Use `waitForLoadState('networkidle')` after navigation
4. **Check for race conditions** - Ensure proper sequencing of async operations

### Performance Issues

If tests are slow:

1. **Review timeout values** - Ensure timeouts aren't unnecessarily long
2. **Remove unnecessary waits** - Synchronous operations don't need waits
3. **Use parallel execution** - Playwright runs tests in parallel by default
4. **Optimize selectors** - Use data-testid or role-based selectors

## See Also

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Overall testing strategy
- [playwright.config.ts](/Users/barbaramiles/Documents/Github/USWDS-webcomponents/playwright.config.ts) - Playwright configuration
