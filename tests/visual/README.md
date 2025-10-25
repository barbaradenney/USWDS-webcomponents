# Visual Regression Tests

**Playwright-based visual regression tests for USWDS Web Components**

## Directory Structure

```
tests/visual/
├── components/                    # Component-specific visual tests
│   ├── icon-visual.spec.ts       # Icon rendering & sprite validation (9 tests)
│   └── character-count-visual.spec.ts # Character count USWDS compliance (13 tests)
├── uswds-compliance.spec.ts       # Cross-component USWDS structure validation (21 tests)
├── component-variants.spec.ts     # Variant testing (existing)
├── responsive-theme.spec.ts       # Responsive & theme testing (existing)
└── README.md                      # This file
```

## Quick Start

### Prerequisites

```bash
# Install Playwright browsers
npx playwright install --with-deps
```

### Run Tests

```bash
# Terminal 1: Start Storybook
pnpm run storybook

# Terminal 2: Run visual tests
pnpm run test:visual
```

### View Results

```bash
# Open HTML report with visual diffs
npx playwright show-report
```

## Test Coverage

### Component Visual Tests (22 tests)

**Icon Component** (`components/icon-visual.spec.ts`):
- ✅ Sprite-first architecture validation
- ✅ Icon size variations (3-9)
- ✅ Common icons rendering
- ✅ Accessibility attributes
- ✅ **REGRESSION**: Sprite defaults prevention
- ✅ **REGRESSION**: Icon gallery completeness
- ✅ Cross-browser consistency

**Character Count Component** (`components/character-count-visual.spec.ts`):
- ✅ **REGRESSION**: Message element aria-live removal (USWDS spec line 189)
- ✅ SR status element validation
- ✅ Error state visual appearance
- ✅ Message formatting (singular/plural)
- ✅ Screen reader announcements
- ✅ Cross-browser consistency
- ✅ Accessibility (focus indicators, contrast)

### USWDS Compliance Tests (21 tests)

**Components Tested** (`uswds-compliance.spec.ts`):
- ✅ Character Count - Complete USWDS structure
- ✅ Icon - Sprite architecture + accessibility
- ✅ Accordion - ARIA attributes
- ✅ Alert - Structure and roles
- ✅ Button - Keyboard accessibility
- ✅ Table - Sortable compliance
- ✅ Cross-component patterns (labels, focus, errors)

## What These Tests Catch

### Real Bugs Prevented

1. **Icon Sprite Regression** (Oct 22, 2025)
   - Bug: Icons reverted from sprite to inline SVG during monorepo migration
   - Caught by: `icon-visual.spec.ts` sprite validation tests

2. **Character Count USWDS Structure** (Oct 23, 2025)
   - Bug: Message element had `aria-live` when USWDS spec line 189 removes it
   - Caught by: `character-count-visual.spec.ts` and `uswds-compliance.spec.ts`

3. **Table Sorting Visual Feedback** (Oct 18, 2025)
   - Bug: Required double-click to sort
   - Caught by: Existing behavior tests (fixed before visual tests added)

### Visual Regression Categories

- **Rendering**: Sprite vs inline, icon display, component appearance
- **USWDS Compliance**: CSS classes, HTML structure, ARIA attributes
- **Styling**: Layout, spacing, colors, fonts
- **Accessibility**: Focus indicators, screen reader attributes, contrast
- **Cross-browser**: Rendering consistency across browsers

## Writing New Visual Tests

### Basic Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/category-component--default');
    await page.waitForLoadState('networkidle');
  });

  test('should render correctly', async ({ page }) => {
    const component = page.locator('usa-component').first();
    await expect(component).toBeVisible();
    await expect(component).toHaveScreenshot('component-default.png');
  });
});
```

### USWDS Compliance Template

```typescript
test('should follow USWDS structure', async ({ page }) => {
  const component = page.locator('usa-component').first();

  // Validate required elements
  const container = component.locator('.usa-component');
  await expect(container).toBeVisible();
  await expect(container).toHaveClass(/usa-component/);

  // Check ARIA attributes
  const button = component.locator('button');
  await expect(button).toHaveAttribute('aria-label');
});
```

### Regression Test Pattern

```typescript
test('REGRESSION: prevents specific bug', async ({ page }) => {
  // Document what regression this prevents
  // Reference: USWDS spec line XXX or commit hash

  const component = page.locator('usa-component').first();

  // FAIL CONDITIONS (what the bug looked like):
  // expect(wrongBehavior).toBe(false);

  // PASS CONDITIONS (correct behavior):
  // expect(correctBehavior).toBe(true);
});
```

## Running Specific Tests

### By Component

```bash
# Test specific component
node scripts/test/run-visual-regression.js --component=icon
node scripts/test/run-visual-regression.js --component=character-count

# Or use npm script
pnpm run test:visual:components
```

### By Browser

```bash
# Single browser
pnpm run test:cross-browser:chromium
pnpm run test:cross-browser:firefox
pnpm run test:cross-browser:webkit

# Mobile
pnpm run test:cross-browser:mobile
```

### Interactive Mode

```bash
# UI mode (best for development)
pnpm run test:visual:ui

# Headed mode (see browser)
pnpm run test:visual:headed

# Debug mode (step through tests)
pnpm run test:visual:debug
```

## Updating Baselines

### When to Update

Update baselines when:
- ✅ Intentional design changes
- ✅ USWDS version updates
- ✅ Component enhancements
- ✅ Bug fixes that change appearance

**DO NOT update for:**
- ❌ Regressions
- ❌ Unintended changes
- ❌ Broken functionality

### How to Update

```bash
# Update all baselines
pnpm run test:visual:baseline

# Update specific component
node scripts/test/run-visual-regression.js --component=icon --update

# Review changes first
pnpm run test:visual
npx playwright show-report
# If correct, then update:
pnpm run test:visual:baseline
```

## Debugging Test Failures

### Step 1: View Visual Diff

```bash
# Run tests to generate report
pnpm run test:visual

# Open HTML report with side-by-side comparison
npx playwright show-report
```

### Step 2: Run in Headed Mode

```bash
# See what the browser is doing
pnpm run test:visual:headed
```

### Step 3: Debug Mode

```bash
# Step through tests
pnpm run test:visual:debug
```

### Step 4: Check Storybook

```bash
# Verify component works in Storybook
pnpm run storybook
# Navigate to component story manually
```

## Configuration

### Playwright Config

**File**: `visual.config.ts` (project root)

**Projects**:
- `visual-chrome` - Chrome desktop
- `visual-firefox` - Firefox desktop
- `visual-webkit` - Safari desktop
- `visual-mobile` - Mobile devices

### Chromatic Config

**File**: `.github/workflows/visual-testing.yml`

**Setup**: See `docs/CHROMATIC_SETUP_GUIDE.md`

## CI/CD Integration

Visual tests run automatically in GitHub Actions:

### Workflows

1. **`.github/workflows/visual-regression.yml`**
   - Runs on: Pull requests, scheduled weekly
   - Tests: Playwright visual tests

2. **`.github/workflows/visual-testing.yml`**
   - Runs on: Pull requests, main branch
   - Tests: Chromatic visual diff

### Results

- Playwright: HTML report uploaded as artifact
- Chromatic: Visual diff review posted to PR

## Documentation

- **Complete Guide**: `docs/VISUAL_TESTING_GUIDE.md`
- **Chromatic Setup**: `docs/CHROMATIC_SETUP_GUIDE.md`
- **Test Improvements**: `TEST_IMPROVEMENT_SUMMARY.md`
- **Infrastructure**: `TESTING_INFRASTRUCTURE_INTEGRATION_SUMMARY.md`
- **Main Testing Guide**: `docs/TESTING_GUIDE.md`

## Common Issues

### Storybook Not Running

**Error**: `Error: connect ECONNREFUSED`

**Solution**:
```bash
# Start Storybook first
pnpm run storybook
```

### Playwright Not Installed

**Error**: `Executable doesn't exist`

**Solution**:
```bash
npx playwright install --with-deps
```

### Baselines Differ Between Environments

**Solution**: Generate baselines in CI environment (Linux) or accept CI screenshots

---

**Total Tests**: 43 visual regression tests
**Coverage**: Icon, Character Count, 5 additional components, cross-component patterns
**Last Updated**: 2025-10-23
