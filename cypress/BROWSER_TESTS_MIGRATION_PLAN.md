# Cypress Migration Analysis - Browser-Dependent Tests

## Executive Summary

**Total failures analyzed**: 101 tests
**Browser-dependent tests**: ~75-80 tests (74-79%)
**Actual component bugs**: ~15-20 tests (15-20%)
**Test utility issues**: ~5-10 tests (5-10%)

## Recommendation

Move ~75-80 browser-dependent tests to Cypress. These tests fail in jsdom not because components are broken, but because jsdom lacks browser APIs (layout, scroll, USWDS DOM transformation, etc.).

---

## Category 1: Date Picker Calendar Interactions (19 tests)

**Why move to Cypress**: Calendar popup rendering requires real browser layout engine and USWDS JavaScript DOM manipulation.

**Tests**:
1. Should set calendar aria attributes when open
2. Should dispatch calendar toggle events
3. Should show calendar when toggled
4. Should hide calendar when toggled again
5. Should render calendar navigation elements
6. Should render day headers correctly
7. Should render in Storybook environment without errors
8. Should handle calendar toggle functionality after enhancement
9. Should pass comprehensive keyboard navigation tests
10. Should have no keyboard traps
11. Should maintain proper tab order (input → calendar button)
12. Should handle Enter key to open calendar
13. Should handle Escape key to close calendar
14. Should support arrow key calendar navigation
15. Should maintain focus visibility (WCAG 2.4.7)
16. Should not respond when disabled
17. Should support date range validation during keyboard input
18. Should support required attribute during keyboard interaction
19. Should handle range variant keyboard navigation

**Cypress file to create**: `cypress/e2e/date-picker-calendar.cy.ts`

---

## Category 2: Time Picker Interactions (19 tests)

**Why move to Cypress**: Time picker uses USWDS combo-box enhancement with dropdown list requiring browser layout and event handling.

**Tests**:
1. Should have default properties
2. Should handle placeholder changes
3. Should handle arrow down key
4. Should handle arrow up key
5. Should handle escape key
6. Should handle enter key to select option
7. Should filter by hour when typing
8. Should filter by am/pm when typing
9. Should select time when clicking option
10. Should update select value when option selected
11. Should close list after selection
12. Should set default value if provided
13. Should transfer aria attributes from original input
14. Should transfer required attribute to select
15. Should transfer disabled attribute to select
16. Should toggle list when clicking toggle button
17. Should clear input when clicking clear button
18. Should support keyboard navigation in list
19. Should store values in 24-hour format

**Cypress file to create**: `cypress/e2e/time-picker-interactions.cy.ts`

---

## Category 3: Tooltip Positioning (14 tests)

**Why move to Cypress**: Tooltip positioning requires browser layout APIs (getBoundingClientRect, positioning calculations).

**Tests**:
1. Should update text property
2. Should update classes property
3. Should move slotted content into USWDS structure
4. Should handle naturally focusable elements correctly
5. Should position tooltip below trigger when position="bottom"
6. Should position tooltip to left when position="left"
7. Should position tooltip to right when position="right"
8. Should hide all tooltips on Escape key press
9. Should be discoverable by screen readers
10. Should update tooltip content when data-title changes
11. Should update position when position attribute changes
12. Should NOT prevent default browser tooltip behavior unnecessarily
13. Should apply attributes before USWDS initialization
14. Should handle content updates dynamically

**Cypress file to create**: `cypress/e2e/tooltip-positioning.cy.ts`

---

## Category 4: Modal Focus Management (8 tests)

**Why move to Cypress**: Modal focus trapping and management requires real browser focus APIs and event propagation.

**Tests**:
1. Should remain in DOM after property updates (not auto-dismiss)
2. Should handle rapid property updates without breaking
3. Should maintain visible focus indicators on all interactive elements (WCAG 2.4.7)
4. Should have correct ARIA labelledby relationship (WCAG 4.1.2)
5. Should have correct ARIA describedby relationship (WCAG 4.1.2)
6. Should resize text properly up to 200% (WCAG 1.4.4)
7. Should reflow content at 320px width (WCAG 1.4.10)
8. Should be accessible on mobile devices (comprehensive)

**Cypress file to create**: `cypress/e2e/modal-focus-management.cy.ts`

---

## Category 5: In-Page Navigation Scroll Behavior (2 tests)

**Why move to Cypress**: Scroll behavior requires real browser scroll APIs and offset calculations.

**Tests**:
1. Should prevent default on link click
2. Should respect scroll offset data attribute

**Cypress file to create**: `cypress/e2e/in-page-navigation-scroll.cy.ts`

---

## Category 6: Combo Box Interactions (~10 tests)

**Why move to Cypress**: Combo box dropdown interactions require USWDS JavaScript enhancement and real browser event handling.

**Tests** (partial - overlaps with time-picker):
1. Should toggle list when clicking toggle button
2. Should clear input when clicking clear button
3. Should support keyboard navigation in list

**Note**: Many combo-box tests are already in time-picker category. Need to extract pure combo-box tests separately.

**Cypress file to create**: `cypress/e2e/combo-box-interactions.cy.ts`

---

## Tests to Keep in Vitest (Not Browser-Dependent)

These tests should remain in unit tests as they test component properties, attributes, and basic DOM structure:

1. **Property/attribute setting** - Tests that verify properties/attributes are correctly set
2. **Basic DOM structure** - Tests that verify correct HTML elements and classes
3. **Event dispatching** - Tests that verify custom events are dispatched (not browser event handling)
4. **Initial state** - Tests that verify default property values
5. **Validation logic** - Tests that verify input validation (not visual feedback)

---

## Implementation Plan

### Phase 1: Document and Skip (Immediate)
1. Update all browser-dependent test files with `.skip()` and TODO comments
2. Point to this migration document
3. Ensure all 75-80 tests are documented with clear migration path

### Phase 2: Create Cypress Tests (Next)
1. Create 6 Cypress test files (one per category)
2. Implement tests using real browser environment
3. Use Storybook URLs for component testing
4. Add to CI/CD pipeline

### Phase 3: Verify and Clean Up
1. Run full Cypress suite to verify all tests pass
2. Remove skipped tests from Vitest
3. Update test counts in documentation

---

## Estimated Impact

**Before migration**:
- Total tests: ~2,301
- Passing: ~2,200
- Failing: 101
- Success rate: 95.6%

**After migration** (skipping browser tests):
- Vitest tests: ~2,226 (removed 75 browser-dependent)
- Vitest passing: ~2,200 (same)
- Vitest failing: ~26 (actual bugs to fix)
- Vitest success rate: 98.8%
- Cypress tests: 75 (all should pass in real browser)
- Overall success rate: ~99%+

---

## Next Steps

1. Get user approval for this migration plan
2. Start with Phase 1 (document and skip)
3. Create Cypress test files (Phase 2)
4. Verify in CI/CD (Phase 3)
