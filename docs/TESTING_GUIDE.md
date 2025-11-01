# Testing Guide

Complete testing documentation for USWDS Web Components monorepo.

## 🏗️ Monorepo Testing Architecture

The USWDS Web Components library uses a **monorepo with 11 packages**, each with independent tests that run in parallel via **Turborepo**.

### Package Structure

```
packages/
├── uswds-wc-core/              # Core utilities (9 tests)
├── uswds-wc-actions/           # Button, Link, Search (150+ tests)
├── uswds-wc-forms/             # Form components (650+ tests)
├── uswds-wc-navigation/        # Navigation components (550+ tests)
├── uswds-wc-data-display/      # Cards, Tables, Lists (400+ tests)
├── uswds-wc-feedback/          # Alerts, Modals (250+ tests)
├── uswds-wc-layout/            # Layout utilities (282 tests)
├── uswds-wc-structure/         # Accordion (60+ tests)
├── uswds-wc-test-utils/        # Shared test utilities
├── components/                 # Legacy meta-package
└── uswds-wc/                   # All components bundle
```

**Total:** 2301/2301 tests passing across all packages

### Monorepo Test Commands

```bash
# Run all tests across all packages (parallel via Turborepo)
pnpm test

# Test specific package
pnpm --filter @uswds-wc/forms test
pnpm --filter @uswds-wc/actions test

# Test multiple packages
pnpm --filter "@uswds-wc/forms" --filter "@uswds-wc/actions" test

# Test with Turborepo (explicit)
pnpm turbo test

# Force rebuild and test (no cache)
pnpm turbo test --force
```

### Performance Benefits

**Turborepo Parallel Execution:**
- ✅ **All 11 packages test simultaneously**
- ✅ **Smart caching** - Skip unchanged packages
- ✅ **Remote caching** - Share test results across team
- ✅ **Faster feedback** - Failures surface immediately

**Typical Performance:**
```bash
# Without Turborepo (sequential)
Time: ~5-7 minutes for all tests

# With Turborepo (parallel)
Time: ~1-2 minutes for all tests

# With remote cache (unchanged code)
Time: ~5-10 seconds (skip all tests!)
```

## Quick Start

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:ui

# Run browser tests
pnpm run test:browser

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

## Consolidated Test Orchestrator ⭐ RECOMMENDED

Single unified testing system with flag-based commands:

```bash
# Default test orchestrator
pnpm run test:run

# Specific test types
pnpm run test:run -- --unit              # Unit tests only
pnpm run test:run -- --browser           # Browser-required tests
pnpm run test:run -- --e2e               # E2E tests
pnpm run test:run -- --all               # All tests (unit + browser + e2e)

# Component-specific testing
pnpm run test:run -- --component=<name>  # Test specific component

# Test modes
pnpm run test:run -- --watch             # Watch mode
pnpm run test:run -- --coverage          # With coverage

# Advanced testing
pnpm run test:run -- --flaky             # Flaky test detection
pnpm run test:run -- --smoke             # Production smoke tests
pnpm run test:run -- --contracts         # Contract testing
pnpm run test:run -- --performance       # Performance regression
pnpm run test:run -- --mutation          # Mutation testing
```

## Consolidated Validation System

Single unified compliance and validation system:

```bash
# Run all validations
pnpm run validate

# Component-specific
pnpm run validate -- --component=<name>

# Validation types
pnpm run validate -- --uswds             # USWDS HTML/CSS compliance
pnpm run validate -- --structure         # Component file structure
pnpm run validate -- --css               # CSS compliance (no custom styles)
pnpm run validate -- --javascript        # JavaScript integration
pnpm run validate -- --accessibility     # Accessibility compliance
pnpm run validate -- --architecture      # Architecture patterns
pnpm run validate -- --storybook         # Storybook story validation

# Options
pnpm run validate -- --fix               # Auto-fix issues
pnpm run validate -- --strict            # Strict mode (warnings as errors)
pnpm run validate -- --report=json       # JSON report output
```

## Testing Infrastructure

### 1. Unit Tests (Vitest)

Fast tests in jsdom environment for component logic:

```bash
pnpm test                    # Run unit tests
pnpm run test:ui            # Interactive UI
pnpm run test:coverage      # With coverage report
```

**Example test:**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-button.ts'; // From same package directory
import type { USAButton } from './usa-button.js';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '@uswds-wc/test-utils';

describe('USAButton', () => {
  let element: USAButton;

  beforeEach(() => {
    element = document.createElement('usa-button') as USAButton;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have default properties', () => {
    expect(element.variant).toBe('primary');
  });

  it('should pass accessibility tests', async () => {
    await element.updateComplete;
    await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
  });
});
```

### 2. Browser Tests (Vitest + Playwright)

Tests requiring real browser environment:

```bash
pnpm run test:browser          # Run browser tests
pnpm run test:browser:watch    # Watch mode
pnpm run test:browser:coverage # With coverage
```

### 3. Component Tests (Cypress)

Interactive component testing in isolation:

```bash
pnpm run cypress:open          # Interactive mode
pnpm run cypress:run           # Headless mode
pnpm run cypress:component     # Component tests only
```

**Example Cypress test:**
```typescript
describe('usa-button', () => {
  it('should render and be clickable', () => {
    cy.mount('<usa-button variant="primary">Click me</usa-button>');
    cy.get('usa-button').should('be.visible');
    cy.get('usa-button button').click();
  });

  it('should pass accessibility tests', () => {
    cy.mount('<usa-button>Accessible button</usa-button>');
    cy.checkAccessibility();
  });
});
```

### 4. E2E Tests (Cypress)

Full application testing:

```bash
pnpm run e2e                   # Run E2E tests
pnpm run e2e:open              # Interactive E2E testing
```

### 5. Storybook Tests

Automated testing of all Storybook stories:

```bash
pnpm run test:storybook        # Run story tests
pnpm run test:storybook:ci     # CI mode
```

### 6. Visual Regression Testing ⭐ NEW

Automated visual testing to catch appearance bugs and USWDS compliance issues:

```bash
# Playwright Visual Tests
pnpm run test:visual                # Run all visual tests
pnpm run test:visual:baseline       # Update visual baselines
pnpm run test:visual:ui             # Interactive UI mode
pnpm run test:visual:components     # Component-specific tests
pnpm run test:visual:headed         # Run with visible browser

# Cross-Browser Testing
pnpm run test:cross-browser         # All browsers
pnpm run test:cross-browser:chromium # Chrome only
pnpm run test:cross-browser:firefox  # Firefox only
pnpm run test:cross-browser:webkit   # Safari only
pnpm run test:cross-browser:mobile   # Mobile browsers

# Chromatic Visual Testing
pnpm run chromatic                  # Run Chromatic
pnpm run chromatic:ci               # CI mode
pnpm run chromatic:build            # Build and run
```

**What Visual Tests Catch:**
- ✅ Icon rendering (sprite vs inline SVG)
- ✅ USWDS structure compliance (aria-live placement, CSS classes)
- ✅ Component appearance changes
- ✅ Cross-browser visual consistency
- ✅ Layout shifts and CSS regressions
- ✅ Accessibility visual indicators

**Real Bugs Caught:**
1. Icon sprite regression - Icons reverted to inline SVG (Oct 22, 2025)
2. Character count aria-live bug - Wrong element had aria-live (Oct 23, 2025)
3. Table sorting visual feedback - Missing indicators

**Visual Test Types:**

**Component Visual Tests** (`tests/visual/components/`):
```typescript
// Example: Icon visual regression test
test('should render icons from sprite file', async ({ page }) => {
  await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');

  const icon = page.locator('usa-icon').first();
  const useElement = icon.locator('use');

  // Validate sprite-first architecture
  await expect(useElement).toBeVisible();
  const href = await useElement.getAttribute('href');
  expect(href).toMatch(/^\/img\/sprite\.svg#/);

  // Take visual snapshot
  await expect(icon).toHaveScreenshot('icon-default.png');
});
```

**USWDS Compliance Tests** (`tests/visual/uswds-compliance.spec.ts`):
```typescript
// Example: Character count USWDS structure validation
test('CRITICAL: message element structure per USWDS spec', async ({ page }) => {
  const message = component.locator('.usa-character-count__message');

  // FAIL CONDITION: Message should NOT have aria-live
  const ariaLive = await message.getAttribute('aria-live');
  expect(ariaLive).toBeNull();

  // PASS CONDITION: Should have usa-sr-only class
  await expect(message).toHaveClass(/usa-sr-only/);
});
```

**Documentation:**
- **Visual Testing Guide**: `docs/VISUAL_TESTING_GUIDE.md` - Complete guide
- **Chromatic Setup**: `docs/CHROMATIC_SETUP_GUIDE.md` - Cloud visual testing
- **Test Improvements**: `TEST_IMPROVEMENT_SUMMARY.md` - Bug analysis
- **Infrastructure Integration**: `TESTING_INFRASTRUCTURE_INTEGRATION_SUMMARY.md`

### 7. Cross-Browser Testing (Playwright) ⭐ OPTIMIZED

Automated cross-browser testing with parallel job execution for optimal CI performance:

```bash
# Local Development (Full Browser Matrix)
pnpm run test:cross-browser              # All 12 browsers
pnpm run test:cross-browser:chromium     # Chromium only
pnpm run test:cross-browser:firefox      # Firefox only
pnpm run test:cross-browser:webkit       # Safari/Webkit only
pnpm run test:cross-browser:mobile       # Mobile browsers
pnpm run test:cross-browser:accessibility # A11y-specific testing
```

**CI/CD Optimization - Split Parallel Jobs:**

To prevent timeout issues with large test suites (252+ test executions), cross-browser tests are split into 2 parallel CI jobs:

1. **Cross-Browser Testing (Desktop)**
   - Browsers: Chromium + Firefox
   - ~126 test executions (63 tests × 2 browsers)
   - Timeout: 25 minutes
   - Typical completion: 15-18 minutes

2. **Cross-Browser Testing (Webkit + A11y)**
   - Browsers: Webkit + Accessibility-Chrome
   - ~126 test executions (63 tests × 2 browsers)
   - Timeout: 25 minutes
   - Typical completion: 15-18 minutes

**Performance Benefits:**
- ⚡ **Parallel execution** - Both jobs run simultaneously (half total time)
- ✅ **No timeouts** - Each job completes well under 25-minute limit
- 🎯 **Optimized browser installation** - Only installs needed browsers per job
- 🐛 **Better debugging** - Separate artifacts for desktop vs webkit/a11y

**Configuration:**
- Local: Full 12-browser matrix (`playwright.config.ts`)
- CI: Optimized 4-browser split (`.github/workflows/ci.yml`)

**Why This Approach:**
- Original single job: 252 executions × ~7.5s/test = 31+ minutes → timeout
- Split jobs: 126 executions × ~7.5s/test = 15-16 minutes → success

**Example Playwright Test:**
```typescript
// tests/playwright/accordion-cross-browser.spec.ts
test('should expand and collapse consistently across browsers', async ({ page, browserName }) => {
  // Webkit needs longer timeouts for element visibility
  const timeout = browserName === 'webkit' ? 10000 : 5000;

  const firstButton = page.locator('.usa-accordion__button').first();
  await expect(firstButton).toBeVisible({ timeout });

  // Initially collapsed
  await expect(firstButton).toHaveAttribute('aria-expanded', 'false', { timeout });

  // Click to expand
  await firstButton.click();
  await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

  // Content visible
  const firstContent = page.locator('.usa-accordion__content').first();
  await expect(firstContent).toBeVisible();
});
```

## Comprehensive Testing Infrastructure

Complete test suite with consolidated reporting:

```bash
# Full test suite
pnpm run test:comprehensive

# Targeted suites
pnpm run test:comprehensive:fast          # Fast critical tests
pnpm run test:comprehensive:critical      # Critical path only
pnpm run test:comprehensive:full          # Everything
pnpm run test:comprehensive:ci            # CI optimized

# Specialized testing
pnpm run test:comprehensive:security      # Security tests
pnpm run test:comprehensive:accessibility # A11y tests
pnpm run test:comprehensive:performance   # Performance tests
pnpm run test:comprehensive:error-recovery # Error handling
pnpm run test:comprehensive:contracts     # Contract tests

# Reporting
pnpm run test:comprehensive:report        # Generate report
```

## Test Health Validation

Automated testing infrastructure to prevent component issues:

```bash
# Health checks
pnpm run test:validate-health             # Comprehensive health check
pnpm run test:validate-health:verbose     # Detailed analysis
pnpm run test:health-report               # Generate report

# Component-specific
pnpm run test:validate-health:component=modal  # Specific component
```

## Regression Testing

Prevent component behavior degradation:

```bash
pnpm run test:regression:baseline         # Create baseline snapshots
pnpm run test:regression:validate         # Check for regressions
pnpm run test:regression:update           # Update baselines after changes
```

## Testing Best Practices

### 1. Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
it('should update value when property changes', async () => {
  // Arrange
  const element = document.createElement('usa-input') as USAInput;
  document.body.appendChild(element);

  // Act
  element.value = 'new value';
  await element.updateComplete;

  // Assert
  expect(element.value).toBe('new value');

  // Cleanup
  element.remove();
});
```

### 2. Async Testing

Always await `updateComplete` for Lit components:

```typescript
it('should render updated content', async () => {
  element.content = 'Updated content';
  await element.updateComplete;  // REQUIRED

  const content = element.querySelector('.content');
  expect(content?.textContent).toBe('Updated content');
});
```

### 3. Cleanup

Remove test elements in `afterEach`:

```typescript
afterEach(() => {
  element.remove();
});
```

### 4. Accessibility Testing

Add axe-core tests to catch issues early:

```typescript
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '../__tests__/accessibility-utils.js';

it('should pass comprehensive accessibility tests', async () => {
  await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
});
```

### 5. JavaScript Integration Validation

Automated USWDS compliance checking (included automatically):

```typescript
import { validateComponentJavaScript } from '../__tests__/test-utils.js';

// Automatic validation in component tests
it('should have proper USWDS JavaScript integration', () => {
  validateComponentJavaScript(element);
});
```

## Test Configuration

### Vitest Configuration

- **vitest.config.ts**: Main configuration for unit tests (jsdom)
- **vitest.storybook.config.ts**: Storybook-specific tests (browser)

### Separate Configurations

Ensures:
- Unit tests run independently without browser overhead
- Storybook tests have proper browser context
- No configuration conflicts
- Optimal performance for each scenario

## Pre-commit Testing

Tests run automatically before commits:

```bash
# Pre-commit hook runs:
# 1. Repository organization cleanup
# 2. USWDS script tag validation
# 3. Layout forcing pattern
# 4. Component issue detection
# 5. USWDS compliance
# 6. Linting
# 7. TypeScript compilation
# 8. Code quality review
# 9. Component-specific validations
# 10. Test expectations
# 11. USWDS transformation validation
# 12. Component JavaScript integration
# 13. Documentation synchronization
```

## Test Failure Policy

**Do not commit if:**
- ❌ Any tests fail
- ❌ TypeScript errors exist
- ❌ Linting errors present
- ❌ Accessibility violations found
- ❌ USWDS compliance issues detected

## Layout and Visual Regression Testing

Prevent CSS and layout issues with comprehensive validation:

### Testing Strategies

1. **DOM Structure Validation** - Verify exact USWDS HTML structure
2. **CSS Display Properties** - Check computed styles match USWDS
3. **Visual Rendering Tests** - Ensure components render correctly in browser
4. **Component Composition** - Validate use of web components vs inline HTML
5. **USWDS Reference Comparison** - Compare against official USWDS patterns

### Example Tests

See comprehensive testing examples:
- [TESTING_LAYOUT_VISUAL_REGRESSIONS.md](./TESTING_LAYOUT_VISUAL_REGRESSIONS.md) - Complete methodology
- [docs/examples/header-layout-tests.example.ts](./examples/header-layout-tests.example.ts) - Working test examples

### Key Test Patterns

```typescript
// DOM Structure Validation
it('should match USWDS structure exactly', async () => {
  const search = element.querySelector('usa-search');
  const parent = search?.parentElement;

  // Verify correct parent element
  expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);

  // Ensure NOT in wrong structure
  expect(search?.closest('ul')).toBeNull();
});

// CSS Display Properties
it('should have correct display style', async () => {
  const search = element.querySelector('usa-search') as HTMLElement;
  const styles = window.getComputedStyle(search);

  expect(styles.display).toBe('inline-block');
  expect(styles.width).toBe('100%');
});

// Component Composition
it('should use web components not inline HTML', async () => {
  const searchComponent = element.querySelector('usa-search');
  expect(searchComponent?.tagName.toLowerCase()).toBe('usa-search');

  // Should NOT duplicate HTML inline
  const inlineSearch = element.querySelectorAll('form.usa-search');
  expect(inlineSearch.length).toBe(0);
});
```

### Visual Testing Checklist

Before committing layout-heavy components:

- [ ] DOM structure exactly matches USWDS reference
- [ ] CSS display properties verified
- [ ] No extra wrapper elements present
- [ ] Component composition validated (uses web components)
- [ ] Visual rendering confirmed (not cut off or hidden)
- [ ] Responsive layout tested
- [ ] Storybook visual regression (Chromatic) passes

## Further Reading

- [TESTING_LAYOUT_VISUAL_REGRESSIONS.md](./TESTING_LAYOUT_VISUAL_REGRESSIONS.md) - Layout testing methodology
- [TESTING_INFRASTRUCTURE_ENHANCEMENT.md](docs/archived/TESTING_INFRASTRUCTURE_ENHANCEMENT.md) - Enhanced testing features
- [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) - Troubleshooting test failures
- [Component README files](../packages/*/src/components/) - Component-specific testing notes in each package
