# Skipped Vitest Tests - Cypress Migration TODO

These tests are skipped in Vitest due to jsdom/Light DOM limitations but should be implemented in Cypress where they will pass in a real browser environment.

## Background

When using Lit with Light DOM (`createRenderRoot(): HTMLElement { return this; }`), external DOM manipulation (like USWDS calling `.append()`) can eject Lit's ChildPart markers. This causes "ChildPart has no parentNode" errors in jsdom/Vitest when components re-render.

**This is NOT a component bug** - components work correctly in browsers. It's a test environment limitation.

## Tests to Migrate to Cypress

### 1. Character Count Accessibility Tests

**File to create**: `cypress/e2e/character-count-accessibility.cy.ts`

**Tests needed**:
1. Should pass comprehensive accessibility tests with dynamic property changes
   - Test textarea configuration
   - Test input configuration
   - Test with hint text
   - Test required state
   - Test disabled state
   - Test readonly state
   - Test over character limit (error state)

2. Should maintain accessibility during dynamic content updates
   - Update maxlength dynamically
   - Switch between textarea and input types
   - Test required state changes

**What to test**: Run axe-core accessibility checks after rapid property changes that would trigger ChildPart errors in jsdom.

**Source**: `src/components/character-count/usa-character-count.test.ts:946` and `:1002`

---

### 2. Button Group Form Accessibility

**File to create**: `cypress/e2e/button-group-accessibility.cy.ts`

**Test needed**:
1. Should be accessible in form contexts
   - Create form with fieldset and legend
   - Add button-group with multiple button configurations
   - Run accessibility checks on the entire form structure

**What to test**: Accessibility compliance when button-group is nested in complex form structures with rapid property updates.

**Source**: `src/components/button-group/usa-button-group.test.ts:933`

---

### 3. Summary Box Content Transitions

**File to create**: `cypress/e2e/summary-box-content.cy.ts`

**Tests needed**:
1. Should handle mixed slot and property content transitions
   - Start with slot content
   - Switch to property content
   - Switch back to slot content
   - Verify content displays correctly at each step

2. Should not create memory leaks with content changes
   - Change content 10+ times
   - Verify DOM element count doesn't grow excessively
   - Test that old content is properly cleaned up

**What to test**: Dynamic content switching and memory management in real browser environment.

**Source**: `src/components/summary-box/usa-summary-box.test.ts:330` and `:426`

---

## Implementation Notes

### Cypress Test Pattern

```typescript
describe('Character Count Accessibility', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?id=components-charactercount--default');
  });

  it('should pass accessibility after dynamic property changes', () => {
    cy.get('usa-character-count')
      .should('be.visible')
      .then(($el) => {
        const element = $el[0] as any;

        // Make property changes
        element.label = 'Updated label';
        element.maxlength = 100;
        element.value = 'Test content';
      });

    // Wait for updates
    cy.wait(100);

    // Run accessibility checks
    cy.injectAxe();
    cy.checkA11y('usa-character-count', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    });
  });
});
```

### Why Cypress Will Pass

1. **Real Browser**: Cypress runs in Chrome/Firefox with actual browser APIs
2. **Lit Reconciliation**: Light DOM markers are properly maintained in real browsers
3. **USWDS Behavior**: USWDS JavaScript runs correctly with full browser support
4. **No jsdom Limitations**: All DOM operations work as expected

## Status

- [ ] Create `character-count-accessibility.cy.ts` (2 tests)
- [ ] Create `button-group-accessibility.cy.ts` (1 test)
- [ ] Create `summary-box-content.cy.ts` (2 tests)

**Total**: 5 tests to migrate

## Related Documentation

- `cypress/BROWSER_TESTS_MIGRATION_PLAN.md` - **Complete migration plan for all 75-80 browser-dependent tests**
- `/docs/TESTING_GUIDE.md` - Complete testing documentation
- `/docs/LIT_USWDS_INTEGRATION_PATTERNS.md` - Light DOM patterns and limitations
- Test source files have TODO comments pointing to this document

---

**Note**: This document covers only the 5 ChildPart-specific tests. See `cypress/BROWSER_TESTS_MIGRATION_PLAN.md` for the comprehensive plan covering all browser-dependent tests (date-picker calendar, time-picker dropdowns, tooltip positioning, modal focus, header navigation, etc.)
