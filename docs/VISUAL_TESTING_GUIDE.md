# Visual Testing Guide

**Complete guide to visual regression testing for USWDS Web Components**

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Testing Tools](#testing-tools)
4. [Writing Visual Tests](#writing-visual-tests)
5. [Running Tests](#running-tests)
6. [Updating Baselines](#updating-baselines)
7. [Debugging Failures](#debugging-failures)
8. [Best Practices](#best-practices)
9. [Integration with CI/CD](#integration-with-cicd)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Visual regression testing catches bugs that unit tests miss:
- ✅ Icon rendering (sprite vs inline)
- ✅ CSS styling changes
- ✅ Layout shifts
- ✅ Component appearance
- ✅ USWDS compliance

### Why Visual Testing?

**Problems It Solves:**
- Catches visual bugs before production
- Validates USWDS structure compliance
- Ensures cross-browser consistency
- Documents component appearance changes

**Real Bugs Caught:**
1. **Icon sprite regression** - Icons reverted from sprite to inline SVG
2. **Character count structure** - aria-live placed on wrong element
3. **Table sorting visual feedback** - Missing visual indicators

---

## Quick Start

### 1. Install Dependencies

```bash
# Install Playwright browsers
npx playwright install --with-deps
```

### 2. Start Storybook

```bash
# Terminal 1: Start Storybook
pnpm run storybook
```

### 3. Run Visual Tests

```bash
# Terminal 2: Run visual tests
pnpm run test:visual
```

### 4. View Results

```bash
# Open HTML report
npx playwright show-report
```

---

## Testing Tools

### Playwright

**What it does**: Cross-browser visual regression testing

**Configuration**: `visual.config.ts`

**Features**:
- Screenshot comparison
- Cross-browser testing (Chrome, Firefox, Safari)
- Responsive testing (desktop, mobile, tablet)
- Accessibility testing integration

### Chromatic

**What it does**: Cloud-based visual regression for Storybook

**Setup**: See `docs/CHROMATIC_SETUP_GUIDE.md`

**Features**:
- Automated visual diff review
- Collaborative UI reviews
- Build comparison history
- Cross-browser snapshots

---

## Writing Visual Tests

### Test Structure

All visual tests are in `tests/visual/`:

```
tests/visual/
├── components/               # Component-specific visual tests
│   ├── icon-visual.spec.ts
│   └── character-count-visual.spec.ts
├── uswds-compliance.spec.ts  # USWDS structure validation
├── component-variants.spec.ts # Existing variant tests
└── responsive-theme.spec.ts   # Responsive tests
```

### Basic Visual Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Storybook story
    await page.goto('http://localhost:6006/?path=/story/category-component--default');
    await page.waitForLoadState('networkidle');
  });

  test('should render correctly', async ({ page }) => {
    const component = page.locator('usa-component').first();

    // Wait for component to be visible
    await expect(component).toBeVisible();

    // Take visual snapshot
    await expect(component).toHaveScreenshot('component-default.png');
  });
});
```

### USWDS Compliance Test

```typescript
test('should follow USWDS structure', async ({ page }) => {
  const component = page.locator('usa-component').first();

  // Validate required USWDS elements
  const container = component.locator('.usa-component');
  await expect(container).toBeVisible();

  // Check USWDS CSS classes
  await expect(container).toHaveClass(/usa-component/);

  // Validate ARIA attributes
  const button = component.locator('.usa-button');
  await expect(button).toHaveAttribute('role', 'button');
});
```

### Regression Test Pattern

```typescript
test('REGRESSION: prevents specific bug from recurring', async ({ page }) => {
  // Document what regression this prevents
  // Example: Monorepo migration reverted sprite-first defaults

  const component = page.locator('usa-icon').first();

  // FAIL CONDITIONS (what the bug looked like):
  const pathElements = await component.locator('path').count();
  expect(pathElements).toBe(0); // Icons should NOT have inline paths

  // PASS CONDITIONS (correct behavior):
  const useElement = component.locator('use');
  await expect(useElement).toBeVisible(); // Should use sprite reference
});
```

### Cross-Browser Test

```typescript
test('should render consistently across browsers', async ({ page, browserName }) => {
  const component = page.locator('usa-component').first();

  // Take browser-specific snapshot
  await expect(component).toHaveScreenshot(`component-${browserName}.png`);
});
```

---

## Running Tests

### All Visual Tests

```bash
# Run all visual tests
pnpm run test:visual

# Run in UI mode (interactive)
pnpm run test:visual:ui

# Run in headed mode (see browser)
pnpm run test:visual:headed
```

### Specific Component

```bash
# Test specific component
node scripts/test/run-visual-regression.js --component=icon

# Or use npm script
pnpm run test:visual:components
```

### Specific Browser

```bash
# Test in Chrome only
pnpm run test:cross-browser:chromium

# Test in Firefox only
pnpm run test:cross-browser:firefox

# Test in Safari only
pnpm run test:cross-browser:webkit
```

### Mobile Testing

```bash
# Test mobile devices
pnpm run test:cross-browser:mobile
```

### Debug Mode

```bash
# Run in debug mode (step through tests)
pnpm run test:visual:debug

# Or use runner script
node scripts/test/run-visual-regression.js --debug
```

---

## Updating Baselines

### When to Update Baselines

Update baselines when:
- ✅ Intentional design changes
- ✅ USWDS version update
- ✅ Component enhancement
- ✅ Bug fix that changes appearance

**DO NOT update baselines for:**
- ❌ Regressions
- ❌ Unintended changes
- ❌ Broken functionality

### How to Update Baselines

```bash
# Update all baselines
pnpm run test:visual:baseline

# Update specific component
node scripts/test/run-visual-regression.js --component=icon --update

# Update for specific browser
npx playwright test tests/visual/ --project=chromium --update-snapshots
```

### Review Changes Before Updating

```bash
# Run tests to see failures
pnpm run test:visual

# View diff in HTML report
npx playwright show-report

# If changes are correct, update baselines
pnpm run test:visual:baseline
```

---

## Debugging Failures

### Step 1: View HTML Report

```bash
# Generate and open HTML report
npx playwright show-report
```

**What to look for:**
- Visual diff (before/after comparison)
- Error messages
- Console logs
- Network requests

### Step 2: Run in Headed Mode

```bash
# See what the browser is doing
pnpm run test:visual:headed
```

### Step 3: Use Debug Mode

```bash
# Step through tests line-by-line
pnpm run test:visual:debug
```

**Debug mode features:**
- Set breakpoints
- Inspect elements
- View network activity
- Step through code

### Step 4: Check Storybook

```bash
# Verify component works in Storybook
pnpm run storybook

# Navigate to component story
# Manually inspect appearance
```

### Common Failure Causes

1. **Storybook not running**
   ```bash
   # Start Storybook first
   pnpm run storybook
   ```

2. **Component not loading**
   - Check Storybook URL in test
   - Verify story path exists
   - Check browser console for errors

3. **Timing issues**
   ```typescript
   // Add wait for stability
   await page.waitForLoadState('networkidle');
   await page.waitForTimeout(300);
   ```

4. **Font rendering differences**
   ```typescript
   // Increase tolerance for font rendering
   await expect(component).toHaveScreenshot({
     maxDiffPixels: 100
   });
   ```

---

## Best Practices

### 1. Isolate Component State

```typescript
test('should render error state', async ({ page }) => {
  // Navigate directly to error state story
  await page.goto('http://localhost:6006/?path=/story/component--error-state');

  // Don't rely on user interaction to trigger state
  const component = page.locator('usa-component').first();
  await expect(component).toHaveScreenshot('component-error.png');
});
```

### 2. Use Descriptive Snapshot Names

```typescript
// Good ✅
await expect(icon).toHaveScreenshot('icon-sprite-search-size-5.png');

// Bad ❌
await expect(icon).toHaveScreenshot('test1.png');
```

### 3. Group Related Tests

```typescript
test.describe('Icon Sizes', () => {
  for (const size of ['3', '4', '5', '6', '7', '8', '9']) {
    test(`should render size ${size}`, async ({ page }) => {
      // Test implementation
    });
  }
});
```

### 4. Document Regressions

```typescript
test('REGRESSION: prevents aria-live on message element', async ({ page }) => {
  // Document what bug this prevents
  // Reference: USWDS spec line 189
  // Caught: Oct 23, 2025 - Monorepo migration

  const message = component.locator('.usa-character-count__message');
  const ariaLive = await message.getAttribute('aria-live');
  expect(ariaLive).toBeNull();
});
```

### 5. Wait for Stability

```typescript
test('should handle animations', async ({ page }) => {
  await page.goto('...');
  await page.waitForLoadState('networkidle');

  // Wait for animations to complete
  await page.waitForTimeout(500);

  await expect(component).toHaveScreenshot();
});
```

### 6. Test Both States

```typescript
test.describe('Button States', () => {
  test('default state', async ({ page }) => {
    // Test default appearance
  });

  test('hover state', async ({ page }) => {
    const button = page.locator('button');
    await button.hover();
    await expect(button).toHaveScreenshot('button-hover.png');
  });

  test('focus state', async ({ page }) => {
    const button = page.locator('button');
    await button.focus();
    await expect(button).toHaveScreenshot('button-focus.png');
  });

  test('disabled state', async ({ page }) => {
    await page.goto('...?path=/story/button--disabled');
    // Test disabled appearance
  });
});
```

---

## Integration with CI/CD

### GitHub Actions Workflow

Visual tests run automatically in CI:

**Workflow**: `.github/workflows/visual-regression.yml`

**Triggers**:
- Pull requests
- Pushes to main branch
- Scheduled weekly runs

**What it does**:
1. Builds Storybook
2. Runs Playwright visual tests
3. Uploads test results
4. Posts results to PR

### Chromatic Integration

**Workflow**: `.github/workflows/visual-testing.yml`

**Triggers**:
- Pull requests
- Pushes to main branch

**What it does**:
1. Builds Storybook
2. Uploads to Chromatic
3. Runs visual diff analysis
4. Posts review link to PR

### Local Pre-commit

Add to `.husky/pre-commit`:

```bash
# Run visual tests on changed components
CHANGED_COMPONENTS=$(git diff --staged --name-only | grep 'src/components/' | cut -d'/' -f3 | sort -u)

if [ -n "$CHANGED_COMPONENTS" ]; then
  echo "Running visual tests for changed components..."
  for component in $CHANGED_COMPONENTS; do
    node scripts/test/run-visual-regression.js --component=$component
  done
fi
```

---

## Troubleshooting

### Storybook Not Running

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6006`

**Solution**:
```bash
# Start Storybook first
pnpm run storybook

# Wait for it to fully load
# Then run visual tests in another terminal
pnpm run test:visual
```

### Playwright Not Installed

**Error**: `Executable doesn't exist at ...`

**Solution**:
```bash
# Install Playwright browsers
npx playwright install --with-deps
```

### Snapshots Failing on CI

**Error**: Screenshots don't match on CI but pass locally

**Solution**:
```bash
# Update baselines using CI environment
# Option 1: Update locally with same OS as CI (Linux)
docker run -v $(pwd):/work -w /work mcr.microsoft.com/playwright:latest \
  npx playwright test --update-snapshots

# Option 2: Accept CI screenshots as baseline
# Download CI artifacts and commit
```

### Font Rendering Differences

**Error**: Small pixel differences in text

**Solution**:
```typescript
// Increase diff tolerance
await expect(component).toHaveScreenshot({
  maxDiffPixelRatio: 0.01, // Allow 1% difference
  threshold: 0.2 // Adjust threshold
});
```

### Flaky Tests

**Error**: Tests pass sometimes, fail other times

**Solution**:
```typescript
// Add stabilization waits
await page.waitForLoadState('networkidle');
await page.waitForTimeout(300);

// Disable animations
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
  `
});
```

### Chromatic Upload Fails

**Error**: `Error uploading build to Chromatic`

**Solution**:
```bash
# Check token is set
echo $CHROMATIC_PROJECT_TOKEN

# Verify Storybook builds
pnpm run build-storybook

# Check output exists
ls -la storybook-static/

# Manual upload
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
```

---

## Advanced Topics

### Custom Viewport Testing

```typescript
test('should render in mobile viewport', async ({ page }) => {
  // Set custom viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('...');
  await expect(component).toHaveScreenshot('component-mobile.png');
});
```

### Testing Dark Mode

```typescript
test('should render in dark mode', async ({ page }) => {
  // Enable dark mode
  await page.emulateMedia({ colorScheme: 'dark' });

  await page.goto('...');
  await expect(component).toHaveScreenshot('component-dark.png');
});
```

### Testing High DPI Displays

```typescript
test('should render on high DPI display', async ({ page }) => {
  // Set device scale factor
  await page.setViewportSize({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2
  });

  await page.goto('...');
  await expect(component).toHaveScreenshot('component-hidpi.png');
});
```

### Testing Animations

```typescript
test('should capture animation states', async ({ page }) => {
  await page.goto('...');

  // Capture initial state
  await expect(component).toHaveScreenshot('component-initial.png');

  // Trigger animation
  await component.click();

  // Wait for animation to complete
  await page.waitForTimeout(500);

  // Capture final state
  await expect(component).toHaveScreenshot('component-animated.png');
});
```

---

## Quick Reference

### Common Commands

```bash
# Run all visual tests
pnpm run test:visual

# Update baselines
pnpm run test:visual:baseline

# Run in UI mode
pnpm run test:visual:ui

# Test specific component
node scripts/test/run-visual-regression.js --component=icon

# View results
npx playwright show-report

# Run Chromatic
pnpm run chromatic
```

### Test File Locations

- Component visual tests: `tests/visual/components/`
- USWDS compliance tests: `tests/visual/uswds-compliance.spec.ts`
- Test runner: `scripts/test/run-visual-regression.js`
- Playwright config: `visual.config.ts`

### Documentation

- Chromatic setup: `docs/CHROMATIC_SETUP_GUIDE.md`
- Testing guide: `docs/TESTING_GUIDE.md`
- Test improvements: `TEST_IMPROVEMENT_SUMMARY.md`
- Infrastructure summary: `TESTING_INFRASTRUCTURE_INTEGRATION_SUMMARY.md`

---

## Resources

- **Playwright Docs**: https://playwright.dev/docs/test-snapshots
- **Chromatic Docs**: https://www.chromatic.com/docs
- **USWDS Components**: https://designsystem.digital.gov/components/
- **Visual Regression Testing Guide**: https://playwright.dev/docs/test-snapshots

---

*Last Updated: 2025-10-23*
*Status: ✅ Visual testing fully integrated*
