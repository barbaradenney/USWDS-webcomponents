# Cypress CI Failures - Comprehensive Fix Plan

**Status:** 🔴 CI Blocked
**Created:** 2025-11-19
**CI Run:** 19509786946
**Total Failures:** ~40 Cypress component tests

## Overview

Cypress component tests are failing in CI with exit code 40. These tests run against Storybook at `http://localhost:6006` to verify component behavior in a real browser environment.

Based on CI artifacts analysis (screenshots and logs), there are **10 failing test files** with **approximately 40 total failing tests**.

## Failing Test Files Summary

| Test File | Failures | Primary Error Pattern | Priority |
|-----------|----------|----------------------|----------|
| `character-count-accessibility.cy.ts` | 1 | CSS class assertion timeout | Medium |
| `date-picker-calendar.cy.ts` | 4 | TypeError: `.should is not a function` | **HIGH** |
| `date-picker-month-navigation.cy.ts` | 4 | TypeError: `.should is not a function` | **HIGH** |
| `in-page-navigation-scroll.cy.ts` | 4 | Multiple (scroll, element not found, invalid attribute) | High |
| `in-page-navigation-sticky-active.cy.ts` | 12 | TBD (need log analysis) | **HIGH** |
| `modal-focus-management.cy.ts` | 3 | TBD (need log analysis) | Medium |
| `storybook-navigation-test.cy.ts` | 2 | TBD (need log analysis) | Low |
| `summary-box-content.cy.ts` | 4 | TBD (need log analysis) | Medium |
| `time-picker-interactions.cy.ts` | 6 | TBD (need log analysis) | Medium |
| `tooltip.cy.ts` | TBD | TBD (need log analysis) | Medium |

**Estimated Total:** ~40 failing tests (matches CI exit code)

---

## Detailed Error Analysis

### 1. Date Picker Tests - TypeError: `.should is not a function` (8 failures)

**Affected Files:**
- `cypress/e2e/date-picker-calendar.cy.ts` (4 failures)
- `cypress/e2e/date-picker-month-navigation.cy.ts` (4 failures)

**Error Pattern:**
```
TypeError: {(intermediate value)}.should is not a function
  at Context.eval (webpack://uswds-webcomponents-monorepo/./cypress/e2e/date-picker-calendar.cy.ts:114:64)
```

**Root Cause:**
Test code is calling `.should()` on a non-Cypress-wrapped object (likely using jQuery `.find()` or direct DOM methods instead of staying in the Cypress chain).

**Example of Incorrect Pattern:**
```typescript
// ❌ WRONG - calling .should() on jQuery/DOM result
cy.get('.some-element').then(($el) => {
  $el.find('.child').should('have.class', 'active') // TypeError!
})
```

**Correct Pattern:**
```typescript
// ✅ CORRECT - stay in Cypress chain
cy.get('.some-element')
  .find('.child')
  .should('have.class', 'active')
```

**Fix Strategy:**
1. Examine test code at line ~114 in `date-picker-calendar.cy.ts`
2. Examine test code at line ~38 in `date-picker-month-navigation.cy.ts`
3. Identify where `.find()` or other DOM methods are breaking the Cypress chain
4. Refactor to use Cypress API methods: `.find()`, `.children()`, `.parent()`, etc.
5. Ensure all assertions use Cypress-wrapped elements

**Priority:** **HIGH** - Affects 8 tests, simple fix pattern applies to both files

---

### 2. In-Page Navigation - Sticky/Active State Tests (12 failures)

**Affected Files:**
- `cypress/e2e/in-page-navigation-sticky-active.cy.ts` (12 failures)

**Error Pattern:** TBD (need detailed log analysis)

**Potential Root Causes:**
- Stickiness behavior not working in Cypress viewport
- Active state not updating during scroll
- Timing issues with scroll events
- Element visibility assertions failing

**Fix Strategy:**
1. Download screenshot artifacts for this test
2. Analyze error messages from CI logs
3. Check if component's sticky positioning works in Cypress
4. Verify scroll event handlers fire correctly
5. May need to add explicit waits for scroll completion

**Priority:** **HIGH** - Most failures in a single file (12)

---

### 3. In-Page Navigation - Scroll Tests (4 failures)

**Affected Files:**
- `cypress/e2e/in-page-navigation-scroll.cy.ts` (4 failures)

**Error Patterns:**

**3a. Default Not Prevented:**
```
AssertionError: expected false to be true
```
Likely checking if `event.defaultPrevented === true` but it's `false`.

**3b. Element Not Found:**
```
AssertionError: Timed out retrying after 4000ms: expected undefined to exist
AssertionError: Timed out retrying after 4000ms: Expected to find element: `usa-in-page-navigation`, but never found it.
```

**3c. Invalid Attribute:**
```
Error: In-page navigation: data-heading-elements attribute defined with an invalid heading type: "h2,".
```
Trailing comma in `data-heading-elements="h2,"` attribute.

**Root Causes:**
1. Test expects `preventDefault()` to be called but component isn't calling it
2. Component not rendering or Storybook story not loading
3. Test has malformed attribute value (trailing comma)

**Fix Strategy:**
1. **Invalid Attribute:** Fix test to use `data-heading-elements="h2"` (remove trailing comma)
2. **Element Not Found:**
   - Check if Storybook story exists and loads correctly
   - Add `cy.visit()` to correct story URL
   - Add `cy.waitForSelector('usa-in-page-navigation')`
3. **Default Not Prevented:**
   - Check component code to ensure it calls `event.preventDefault()` on navigation clicks
   - Or update test expectation if component intentionally doesn't prevent default

**Priority:** High - Multiple diverse issues, may indicate component or test setup problems

---

### 4. Character Count - Accessibility (1 failure)

**Affected Files:**
- `cypress/e2e/character-count-accessibility.cy.ts` (1 failure)

**Error Pattern:**
```
AssertionError: Timed out retrying after 15000ms: expected '<span#over-limit-status.usa-character-count__status.usa-hint>' to have class 'usa-character-count__status--error'
```

**Root Cause:**
Component is not applying the `usa-character-count__status--error` CSS class when character count exceeds limit.

**Possible Issues:**
1. Component logic not detecting over-limit state
2. Class not being added to DOM
3. Timing issue - class added after 15s timeout
4. Component not initialized correctly in Storybook

**Fix Strategy:**
1. Check component implementation: Does it add `--error` class when over limit?
2. Check USWDS source for expected behavior
3. Verify test triggers over-limit state correctly (types enough characters)
4. Add debugging: Check actual classes applied during test
5. May need to trigger character count update explicitly

**Priority:** Medium - Single failure, isolated to one test

---

### 5. Remaining Tests (15 failures across 5 files)

**Affected Files:**
- `modal-focus-management.cy.ts` (3 failures)
- `summary-box-content.cy.ts` (4 failures)
- `time-picker-interactions.cy.ts` (6 failures)
- `tooltip.cy.ts` (TBD failures)
- `storybook-navigation-test.cy.ts` (2 failures)

**Status:** Need detailed error analysis

**Next Steps:**
1. Extract specific error messages from CI logs
2. Download screenshot artifacts for visual inspection
3. Categorize errors by pattern (API misuse, timing, component bugs, test bugs)
4. Create specific fix strategies for each

**Priority:** Medium - Need more data first

---

## Fix Implementation Order

### Phase 1: Quick Wins (Est. 30-60 min)
1. **Fix invalid attribute** in `in-page-navigation-scroll.cy.ts` (1 test)
   - Remove trailing comma from `data-heading-elements="h2,"`
   - **Impact:** Immediate fix for 1 of 4 failures

2. **Fix Cypress API misuse** in date-picker tests (8 tests)
   - Refactor `.find()` chains to stay in Cypress API
   - **Impact:** Fixes 8 failures with same pattern

### Phase 2: Component/Test Investigation (Est. 1-2 hours)
3. **Analyze in-page-navigation-sticky-active.cy.ts** (12 tests)
   - Get detailed error messages
   - Check screenshot artifacts
   - May be component issue vs test issue

4. **Fix character-count accessibility** (1 test)
   - Verify component adds error class correctly
   - May need component fix

5. **Analyze remaining 5 test files** (15 tests)
   - Get error details
   - Categorize by issue type
   - Create specific fix plans

### Phase 3: Testing & Verification (Est. 30 min)
6. **Run tests locally**
   - `pnpm run storybook` (start Storybook)
   - `pnpm run cypress:run` (run all e2e tests)
   - Verify all 40 tests pass

7. **Push to CI and verify**
   - Commit fixes
   - Push to develop
   - Monitor CI run for green status

---

## Commands for Investigation

### Get Detailed Errors
```bash
# Download full CI logs
gh run view 19509786946 --log > /tmp/cypress-ci-full-log.txt

# Extract specific test errors
grep -A 20 "modal-focus-management.cy.ts" /tmp/cypress-ci-full-log.txt
grep -A 20 "summary-box-content.cy.ts" /tmp/cypress-ci-full-log.txt
grep -A 20 "time-picker-interactions.cy.ts" /tmp/cypress-ci-full-log.txt
grep -A 20 "tooltip.cy.ts" /tmp/cypress-ci-full-log.txt
grep -A 20 "storybook-navigation-test.cy.ts" /tmp/cypress-ci-full-log.txt
grep -A 20 "in-page-navigation-sticky-active.cy.ts" /tmp/cypress-ci-full-log.txt
```

### Download Screenshots
```bash
# Already downloaded to /tmp/cypress-screenshots/
ls -la /tmp/cypress-screenshots/cypress-screenshots/
```

### Run Tests Locally
```bash
# Start Storybook (required for Cypress e2e tests)
pnpm run storybook

# In another terminal: Run all Cypress tests
pnpm run cypress:run

# Or run specific test file
npx cypress run --spec "cypress/e2e/date-picker-calendar.cy.ts"
```

---

## Success Criteria

- [ ] All 40 Cypress component tests pass
- [ ] CI run completes with exit code 0
- [ ] No test skips or retries (all tests run once and pass)
- [ ] Screenshots show expected component behavior

---

## Notes

**Key Discovery:** The issue isn't with comprehensive tests (169 failures in `playwright.comprehensive.config.ts`) - those are NOT part of CI. The actual CI blocker is these 40 Cypress component test failures.

**Test Type:** These are **Cypress component tests** running against **Storybook**, not Playwright visual regression tests. They test interactive component behavior in a real browser.

**Environment:**
- CI runs: `pnpm run storybook` + `pnpm run cypress:run`
- Tests connect to `http://localhost:6006` (Storybook)
- Browser: Electron (headless) in CI

**Next Session:** Start with Phase 1 quick wins, then investigate Phase 2 issues with detailed error analysis.
