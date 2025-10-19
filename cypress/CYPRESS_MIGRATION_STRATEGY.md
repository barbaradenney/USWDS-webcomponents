# Cypress Migration Strategy

**Date:** 2025-10-15
**Status:** 🟢 In Progress
**Goal:** Migrate 60+ browser-dependent Vitest tests to Cypress

## Executive Summary

We have **83 unapproved skipped tests** in Vitest that require real browser environments. This document outlines the strategy to migrate them to Cypress where they can run with full browser APIs and USWDS JavaScript.

## Existing Cypress Coverage

### ✅ Already Covered (Do NOT Duplicate)

| Component | Cypress File | Coverage |
|-----------|--------------|----------|
| Date Picker | `date-picker-calendar.cy.ts` | Calendar UI, dropdown, date selection |
| Modal | `modal-focus-management.cy.ts` | Focus trap, keyboard navigation |
| Modal | `modal-storybook-test.cy.ts` | Storybook integration |
| Header | `header-navigation.cy.ts` | Navigation, mobile menu |
| In-Page Nav | `in-page-navigation-scroll.cy.ts` | Scroll behavior, active states |
| In-Page Nav | `in-page-navigation-sticky-active.cy.ts` | Sticky positioning |
| Time Picker | `time-picker-interactions.cy.ts` | Combo-box interactions |
| Tooltip | `tooltip-positioning.cy.ts` | Positioning, hover behavior |
| Tooltip | `tooltip.cy.ts` | Basic tooltip tests |
| Accordion | `accordion-click-behavior.cy.ts` | Click interactions |
| Footer | `footer-rapid-clicks.cy.ts` | Rapid interaction tests |
| Range Slider | `range-slider-storybook-test.cy.ts` | Slider interactions |
| Validation | `validation-live-regions.cy.ts` | ARIA live regions |

**Estimated Coverage:** ~35-40 of the 83 skipped tests may already be covered by Cypress.

## Migration Priority

### Phase 1: High-Value Tests (Week 1)

**File Input - Drag & Drop (17 tests)**
- **New File:** `cypress/e2e/file-input-drag-drop.cy.ts`
- **Why:** Requires `DataTransfer` API not available in jsdom
- **Tests:**
  - File selection via drag & drop
  - Multiple file handling
  - File preview generation
  - ARIA label updates
  - Instructions hiding/showing
  - Preview count display

**Alert - Screen Reader Announcements (3 tests)**
- **New File:** `cypress/e2e/alert-announcements.cy.ts`
- **Why:** Requires ARIA live region announcements
- **Tests:**
  - Live region functionality
  - Error message announcements
  - All variant announcements

### Phase 2: Medium-Value Tests (Week 2)

**Character Count - Textarea (2 tests)**
- **New File:** `cypress/e2e/character-count-accessibility.cy.ts`
- **Why:** Requires real textarea measurement and ARIA
- **Tests:**
  - Comprehensive accessibility (WCAG)
  - Dynamic content updates with ARIA

**Summary Box - Content Transitions (2 tests)**
- **New File:** `cypress/e2e/summary-box-content.cy.ts`
- **Why:** Requires real slot change detection
- **Tests:**
  - Mixed slot/property transitions
  - Memory leak detection

**Button Group - Accessibility (1 test)**
- **New File:** `cypress/e2e/button-group-accessibility.cy.ts`
- **Why:** Requires real layout measurement
- **Tests:**
  - Segmented button layout

### Phase 3: Verify & Document (Week 3-4)

**Already Covered - Just Document**

Review existing Cypress tests and map them to skipped Vitest tests:

1. **Date Picker** (25 skips):
   - Check `date-picker-calendar.cy.ts` coverage
   - Document which Vitest skips are covered
   - Add any missing tests

2. **Modal** (8 skips):
   - Check `modal-focus-management.cy.ts` coverage
   - Check `modal-storybook-test.cy.ts` coverage
   - Document coverage

3. **Time Picker** (6 skips):
   - Check `time-picker-interactions.cy.ts` coverage
   - Document coverage

4. **Tooltip** (6 skips):
   - Check `tooltip-positioning.cy.ts` coverage
   - Check `tooltip.cy.ts` coverage
   - Document coverage

5. **In-Page Navigation** (4 skips):
   - Check `in-page-navigation-scroll.cy.ts` coverage
   - Document coverage

## Migration Template

### Cypress Test Structure

```typescript
describe('ComponentName - Browser-Specific Behavior', () => {
  beforeEach(() => {
    // Visit Storybook story
    cy.visit('http://localhost:6006/?path=/story/components-component--default');
    cy.wait(1000); // Wait for USWDS initialization
  });

  it('should test browser-specific feature', () => {
    // 1. Get component
    cy.get('usa-component').as('component');

    // 2. Perform interaction
    cy.get('@component').find('button').click();

    // 3. Assert browser-specific behavior
    cy.get('@component').should('have.attr', 'aria-expanded', 'true');
  });
});
```

### Best Practices

1. **Wait for USWDS Initialization**
   ```typescript
   cy.wait(1000); // USWDS needs time to enhance components
   ```

2. **Use Storybook Stories**
   ```typescript
   cy.visit('http://localhost:6006/?path=/story/components-modal--default');
   ```

3. **Test Real Browser APIs**
   ```typescript
   // DataTransfer for file input
   cy.get('input[type="file"]').selectFile('test-file.pdf');

   // Real focus management
   cy.focused().should('have.class', 'usa-button');

   // Real layout calculations
   cy.get('.usa-tooltip').should('be.visible');
   ```

4. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     cy.get('body').then($body => {
       if ($body.find('usa-modal[open]').length) {
         cy.get('usa-modal').invoke('attr', 'open', false);
       }
     });
   });
   ```

## Implementation Checklist

### For Each Migration:

- [ ] Create new Cypress test file
- [ ] Identify all related skipped Vitest tests
- [ ] Write comprehensive Cypress tests covering all scenarios
- [ ] Verify tests pass in Cypress
- [ ] Document which Vitest tests are now covered
- [ ] Add skip comments referencing Cypress coverage
- [ ] Add Vitest skips to approved list

### Skip Comment Template:

```typescript
// SKIP: Browser-dependent test - covered in Cypress
// See: cypress/e2e/component-behavior.cy.ts
// TODO: Remove this skip once we confirm Cypress covers all scenarios
it.skip('should test browser-specific behavior', async () => {
  // Original test code remains for reference
});
```

## Success Metrics

### Week 1 Targets
- [ ] Create 2 new Cypress test files (file-input, alert)
- [ ] Cover 20 skipped Vitest tests
- [ ] Document coverage mapping

### Week 2 Targets
- [ ] Create 3 new Cypress test files (character-count, summary-box, button-group)
- [ ] Cover 5 more skipped tests
- [ ] Review existing Cypress coverage

### Week 3-4 Targets
- [ ] Document all existing Cypress coverage
- [ ] Map 100% of skipped tests to Cypress or approved list
- [ ] Achieve 0 unapproved skips

### Final Target
- ✅ 0 unapproved skipped tests in Vitest
- ✅ ~60 tests migrated to Cypress
- ✅ ~20 tests in approved skip list with documentation
- ✅ 100% test coverage across Vitest + Cypress

## Risk Mitigation

### Risk: Cypress tests are slower
**Mitigation:** Focus on browser-specific behavior only. Keep unit tests in Vitest.

### Risk: Existing Cypress tests might not cover all scenarios
**Mitigation:** Review and enhance existing tests before removing Vitest skips.

### Risk: Storybook dependency for Cypress
**Mitigation:** Ensure Storybook stories exist for all components being tested.

## Next Steps

1. **Immediate (Today)**
   - [x] Create this strategy document
   - [ ] Create file-input drag-drop Cypress test
   - [ ] Create alert announcements Cypress test

2. **This Week**
   - [ ] Complete Phase 1 migrations (file-input, alert)
   - [ ] Review date-picker Cypress coverage
   - [ ] Update skip documentation

3. **This Month**
   - [ ] Complete all phases
   - [ ] Achieve 0 unapproved skips
   - [ ] Update TEST_SKIP_COMPREHENSIVE_PLAN.md with completion status

---

**Owner:** Development Team
**Status:** 🟢 Active Migration
**Next Review:** End of Week 1
**Success Criteria:** 0 unapproved skips, 100% browser test coverage
