# Browser-Required Tests

This directory contains Playwright tests for functionality that requires a real browser environment.

## Overview

These tests cover the **44 tests** that were previously skipped in jsdom with the `[BROWSER TEST REQUIRED]` marker. They validate:

- USWDS JavaScript enhancements (dynamic DOM creation)
- Event dispatching and handling
- Real browser interactions (click, hover, focus)
- ARIA associations created dynamically
- Lit re-rendering issues that only occur in jsdom

## Test Files

### `time-picker.spec.ts` (8 tests)
Tests USWDS combo-box enhancement functionality:
- Dropdown toggle button creation
- Time list generation
- ARIA attributes on enhanced elements
- Disabled state handling
- Dropdown interactions

### `tooltip.spec.ts` (9 tests)
Tests USWDS tooltip body and trigger creation:
- Tooltip body element creation
- Trigger wrapper generation
- Position classes (top, bottom, left, right)
- ARIA attributes
- Show/hide on hover and focus

### `modal.spec.ts` (3 tests)
Tests modal event dispatching and ARIA:
- Primary action event dispatch
- Secondary action event dispatch
- Heading and description ARIA associations

### `comprehensive.spec.ts` (24 tests)
Tests remaining browser-dependent functionality:
- **Date Picker** (2 tests): Dynamic property changes, JavaScript compliance
- **Footer** (3 tests): Link click events, component stability
- **In-Page Navigation** (3 tests): USWDS structure generation, dynamic updates
- **Storybook Rendering** (2 tests): Lit re-rendering, args/controls reactivity

## Running Tests

### Run all browser-required tests:
```bash
pnpm run test:browser-required
```

### Run specific component tests:
```bash
pnpm run test:browser-required:time-picker
pnpm run test:browser-required:tooltip
pnpm run test:browser-required:modal
pnpm run test:browser-required:comprehensive
```

### Debug mode (opens browser):
```bash
pnpm run test:browser-required:debug
```

### Headed mode (visible browser):
```bash
pnpm run test:browser-required:headed
```

### Production-ready test suite:
```bash
pnpm run test:production-ready
# Runs: unit tests + browser-required + storybook
```

## CI Integration

These tests run automatically in the CI pipeline:

1. **Pre-commit**: Fast jsdom tests only
2. **CI Pipeline**: Full test suite including browser-required tests
3. **Production Deploy**: Requires all tests passing

## Why Browser Tests?

### jsdom Limitations

jsdom is a JavaScript-based DOM implementation that lacks:
- Full browser APIs (layout engine, event system)
- USWDS JavaScript enhancement capabilities
- Real browser rendering and interactions

### Examples

**Time Picker**:
```typescript
// ❌ Doesn't work in jsdom
const toggleButton = element.querySelector('.usa-combo-box__toggle-list');
// USWDS creates this button via JavaScript in browser

// ✅ Works in Playwright browser
const toggleButton = page.locator('.usa-combo-box__toggle-list');
await toggleButton.click(); // Real browser interaction
```

**Tooltip**:
```typescript
// ❌ Doesn't work in jsdom
const tooltipBody = element.querySelector('.usa-tooltip__body');
// USWDS creates tooltip body dynamically

// ✅ Works in Playwright browser
await trigger.hover(); // Real hover event
await expect(tooltipBody).toBeVisible(); // Actual visibility check
```

## Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| Time Picker | 8 | ✅ |
| Tooltip | 9 | ✅ |
| Modal | 3 | ✅ |
| Date Picker | 2 | ✅ |
| Footer | 3 | ✅ |
| In-Page Navigation | 3 | ✅ |
| Storybook Rendering | 2 | ✅ |
| **Total** | **44** | **✅** |

## Migration from jsdom

Tests were migrated from:
- `__tests__/time-picker-dom-validation.test.ts`
- `__tests__/tooltip-dom-validation.test.ts`
- `__tests__/date-picker-interaction.test.ts`
- `__tests__/in-page-navigation-interaction.test.ts`
- `src/components/modal/usa-modal.regression.test.ts`
- `src/components/footer/usa-footer.test.ts`
- `__tests__/storybook-story-rendering.test.ts`

Original tests remain with `it.skip()` and `[BROWSER TEST REQUIRED]` markers for documentation.

## Maintenance

When adding new components:

1. Write jsdom-compatible tests for unit testing
2. If USWDS enhancement is needed, add browser tests here
3. Mark jsdom tests with `[BROWSER TEST REQUIRED]` if they require browser
4. Add corresponding Playwright test in this directory

## Related Documentation

- `docs/DEBUGGING_GUIDE.md` - Testing troubleshooting
- `.github/workflows/ci.yml` - CI test configuration
- `playwright.config.ts` - Playwright configuration
