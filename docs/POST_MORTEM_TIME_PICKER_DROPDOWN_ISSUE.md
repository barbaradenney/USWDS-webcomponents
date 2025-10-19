# Post-Mortem: Time-Picker Dropdown Click Issue

## Issue Summary

**Date Discovered**: 2025-10-17
**Severity**: CRITICAL
**Component**: time-picker
**User Impact**: 100% - Complete loss of dropdown functionality

### The Bug
When users clicked on the time-picker input or toggle button, the dropdown did not appear. The component rendered correctly but had no click event handlers attached.

### Root Cause
The `initializeTimePicker()` function in `usa-time-picker-behavior.ts` was calling `transformTimePicker()` (which creates the DOM structure) but **never called `initializeComboBox()`** (which attaches the event listeners for clicks, keyboard navigation, etc.).

```typescript
// BEFORE (broken):
export function initializeTimePicker(root: HTMLElement | Document = document): () => void {
  selectOrMatches(TIME_PICKER, root).forEach((timePickerEl) => {
    transformTimePicker(timePickerEl as HTMLElement);
  });
  // ❌ Missing: initializeComboBox(root)
  return () => {}; // No cleanup
}

// AFTER (fixed):
export function initializeTimePicker(root: HTMLElement | Document = document): () => void {
  selectOrMatches(TIME_PICKER, root).forEach((timePickerEl) => {
    transformTimePicker(timePickerEl as HTMLElement);
  });
  // ✅ Added: Combo box initialization with event listeners
  const comboBoxCleanup = initializeComboBox(root);
  return () => { comboBoxCleanup(); };
}
```

---

## Why Our Tests Didn't Catch This

### Test Coverage Analysis

| Test Type | Coverage Status | Why It Missed The Bug |
|-----------|----------------|----------------------|
| **Vitest Unit Tests** | ✅ Exist | Only check DOM structure, not real browser interactions |
| **Cypress E2E Tests** | ✅ Exist & Test Clicks | **NOT RUN in CI/pre-commit** - Manual only |
| **Layout Tests** | ✅ Exist | Only check CSS selectors, not event handlers |
| **USWDS Validation** | ✅ Exist | Only check class names and structure |

### The Critical Gap

**Cypress tests WOULD HAVE caught this bug:**

```typescript
// From: cypress/e2e/time-picker-interactions.cy.ts:196-211
it('should toggle list when clicking toggle button', () => {
  cy.get('usa-time-picker').within(() => {
    const button = cy.get('.usa-combo-box__toggle-list');

    // List should be hidden initially
    cy.get('.usa-combo-box__list').should('not.be.visible');

    // Click to open  ← THIS WOULD FAIL
    button.click();
    cy.get('.usa-combo-box__list').should('be.visible');  // ❌ FAIL
  });
});
```

**But Cypress tests are not run automatically:**
- Not in `npm test` (only runs Vitest)
- Not in pre-commit hooks
- Not in CI pipeline
- Manual only: `npm run cypress`

---

## What We Need to Fix

### 1. Add Smoke Tests to Pre-Commit (CRITICAL)

Create fast, essential Cypress tests that run on EVERY commit:

```typescript
// cypress/e2e/smoke-tests.cy.ts
describe('Smoke Tests - Critical Functionality', () => {
  const COMPONENTS_TO_TEST = [
    'accordion',
    'combo-box',
    'date-picker',
    'time-picker',
    'modal',
    // ... all interactive components
  ];

  COMPONENTS_TO_TEST.forEach((component) => {
    it(`${component}: should respond to basic interactions`, () => {
      cy.visit(`/iframe.html?id=components-${component}--default`);

      // Test basic click/interaction
      cy.get(`usa-${component}`).click();

      // Verify something happened (dropdown, modal, etc.)
      cy.get(`usa-${component}`).should('have.class', /focused|open|expanded/);
    });
  });
});
```

**Add to `.husky/pre-commit`:**
```bash
# Run smoke tests before allowing commit
if [ "$SMOKE_TESTS_PRECOMMIT" = "1" ]; then
  echo "🔥 Running smoke tests..."
  npm run cypress:smoke || exit 1
fi
```

---

### 2. Add Event Listener Validation (MEDIUM)

Create a validation script that checks if event listeners are attached:

```typescript
// scripts/validate/check-event-listeners.ts
/**
 * Validates that interactive components have event listeners attached
 */
export function validateEventListeners(component: HTMLElement): ValidationResult {
  const issues: string[] = [];

  // Check for click handlers on buttons
  const buttons = component.querySelectorAll('button, [role="button"]');
  buttons.forEach((btn) => {
    const listeners = getEventListeners(btn); // Chrome DevTools API
    if (!listeners.click || listeners.click.length === 0) {
      issues.push(`Button has no click listener: ${btn.className}`);
    }
  });

  // Check for keyboard handlers on inputs
  const inputs = component.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const listeners = getEventListeners(input);
    if (!listeners.keydown && !listeners.keyup) {
      issues.push(`Input has no keyboard listeners: ${input.className}`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues
  };
}
```

---

### 3. Enhance Vitest Tests with Real DOM Events (LOW)

While Vitest can't fully replicate browser behavior, we can test basic event dispatch:

```typescript
// src/components/time-picker/usa-time-picker.interaction.test.ts
describe('Time Picker - Event Handler Tests', () => {
  it('should have click handler on toggle button after transformation', async () => {
    const element = document.createElement('usa-time-picker');
    document.body.appendChild(element);
    await element.updateComplete;

    // Wait for USWDS transformation
    await new Promise(r => setTimeout(r, 100));

    const toggleButton = element.querySelector('.usa-combo-box__toggle-list');
    expect(toggleButton).toBeTruthy();

    // Get event listeners (if available in test environment)
    const hasClickListener = toggleButton.onclick !== null ||
                            getEventListeners?.(toggleButton)?.click?.length > 0;

    expect(hasClickListener, 'Toggle button should have click handler').toBe(true);
  });
});
```

---

### 4. Document Required Tests for Components (MEDIUM)

Update component templates to require both Vitest AND Cypress tests:

```typescript
// docs/COMPONENT_TEMPLATES.md - Add required tests section:

## Required Tests for Interactive Components

All components with user interaction MUST have:

### 1. Vitest Unit Tests (usa-{component}.test.ts)
- Property changes
- DOM structure
- Event emission
- Accessibility attributes

### 2. Cypress Interaction Tests (cypress/e2e/{component}-interactions.cy.ts)
- **CRITICAL**: Click events work
- Keyboard navigation works
- Visual feedback appears
- Dropdowns/modals open/close
- Form submission works

### 3. Smoke Test Entry
Add component to `cypress/e2e/smoke-tests.cy.ts` COMPONENTS_TO_TEST array
```

---

### 5. CI Pipeline Enhancement (HIGH)

Update GitHub Actions to run Cypress tests:

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test

  smoke-tests:  # NEW
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          start: npm run storybook
          wait-on: 'http://localhost:6006'
          spec: cypress/e2e/smoke-tests.cy.ts

  e2e-tests:  # Run full Cypress on main branch only
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          start: npm run storybook
          wait-on: 'http://localhost:6006'
```

---

## Implementation Priority

1. **IMMEDIATE** (Do today):
   - Create `cypress/e2e/smoke-tests.cy.ts` with critical component clicks
   - Add time-picker, combo-box, date-picker, accordion, modal to smoke tests

2. **THIS WEEK**:
   - Add `SMOKE_TESTS_PRECOMMIT` environment variable support
   - Document in README how to enable: `SMOKE_TESTS_PRECOMMIT=1 git commit`
   - Update CI to run smoke tests on every PR

3. **THIS SPRINT**:
   - Create event listener validation script
   - Add to pre-commit as optional check
   - Update component templates with required test types

4. **NEXT SPRINT**:
   - Add full Cypress suite to CI (main branch only)
   - Create test coverage dashboard
   - Audit all 46 components for interaction test coverage

---

## Lessons Learned

1. **DOM structure ≠ Functionality**: Tests that only check if elements exist miss the critical part - do they DO anything?

2. **Cypress tests are valuable but expensive**: Running full E2E on every commit is slow. Smoke tests are the middle ground.

3. **Event listener attachment is invisible**: You can't see if a handler is attached by looking at HTML. Need runtime validation.

4. **Progressive enhancement can hide bugs**: Component rendered fine, USWDS classes were correct, but behavior was broken.

5. **Test what users do**: Users don't care if `.usa-combo-box__toggle-list` exists. They care if clicking it opens the dropdown.

---

## Success Metrics

This fix is successful when:
- ✅ Smoke tests catch interaction bugs before commit
- ✅ CI runs smoke tests on every PR
- ✅ All interactive components have Cypress coverage
- ✅ Event listener validation catches missing handlers
- ✅ Documentation guides developers to write both test types

---

## References

- Issue discovery: User report "popup doesn't show"
- Fix commit: `0fa6bfdb` - Added initializeComboBox() call
- Existing Cypress test that would have caught it: `cypress/e2e/time-picker-interactions.cy.ts:196-211`
- Current test command: `npm test` (Vitest only)
- Cypress command: `npm run cypress` (manual only)
