# Header Navigation Test Failures - Root Cause Analysis

## Problem Summary

**Test File**: `cypress/e2e/header-navigation.cy.ts`
**Current Status**: 3/15 passing (20% - CRITICAL)
**Failures**: 12 tests failing

## Root Cause Identified ✅

Tests visit the **Default story** but expect **dropdown navigation** features that only exist in the **Extended story**.

### Story Comparison

**Default Story** (`--default`):
- Uses `basicNavItems` - simple navigation links only
- NO dropdown menus
- NO submenu elements
- NO nav control buttons

**Extended Story** (`--extended`):
- Uses `complexNavItems` - includes dropdown menus
- Has `.usa-nav__primary-item > button` elements
- Has `.usa-nav__submenu` elements
- Has dropdown toggle behavior
- Supports keyboard navigation (Escape, arrow keys)

## Failed Tests Analysis

### Tests Requiring Extended Story (7 tests)

**Dropdown Navigation** (4 tests):
1. ✗ "should have nav control buttons for dropdowns" - expects `.usa-nav__primary-item > button`
2. ✗ "should toggle dropdown when clicking nav control" - expects dropdown behavior
3. ✗ "should close dropdown when clicking outside" - expects dropdowns
4. ✗ "should close dropdown when focus leaves nav" - expects dropdowns

**Keyboard Behavior** (3 tests):
5. ✗ "should close dropdown on Escape key" - expects dropdowns to exist
6. ✗ "should focus nav control button after closing with Escape" - expects dropdown buttons
7. ✗ "should navigate dropdown items with arrow keys" - expects dropdown menus

### Tests with AbortError (1 test)

**Body Padding Compensation**:
8. ✗ "should remove padding when closing mobile nav" - AbortError (similar to tooltip Escape key issue)

### Tests That May Need Extended Story (3 tests)

**Mobile Navigation**:
9. ✗ "should close mobile menu when clicking close button" - selector issue
10. ✗ "should trap focus within mobile menu when open" - may need Extended

**Accessibility**:
11. ✗ "should have proper ARIA attributes on nav controls" - needs dropdown buttons
12. ✗ "should pass axe accessibility checks" - selector issue (`usa-header`)

## Solution

### Primary Fix: Update Story References

Change test file to use appropriate stories:

```typescript
describe('Header Navigation', () => {
  // Tests for basic navigation - can use Default story
  describe('Basic Navigation', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=components-header--default&viewMode=story');
    });
    // Mobile navigation, basic accessibility tests
  });

  // Tests for dropdown navigation - MUST use Extended story
  describe('Dropdown Navigation', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=components-header--extended&viewMode=story');
    });
    // All dropdown and keyboard navigation tests
  });
});
```

### Secondary Fixes Needed

1. **AbortError on mobile nav close** - investigate event handler cleanup (similar to tooltip Escape key)
2. **Axe selector** - change from `'usa-header'` to `.usa-header` or appropriate selector
3. **Mobile menu trap focus** - may need to adjust test expectations

## Expected Impact

**After fixing story references**:
- Expected improvement: 7+ tests passing (from 3 to 10+)
- Pass rate improvement: 20% → 67%+
- Similar to tooltip test fix which improved 40% → 60%

## Priority: HIGH

This is the same type of issue fixed for tooltip tests - incorrect story references. The fix is straightforward and will have immediate, significant impact on test coverage.

## Related Issues

- Similar pattern to tooltip-positioning test failures (fixed in Session 9)
- AbortError pattern similar to tooltip Escape key issue (reverted in Session 9)
- Part of systematic Cypress E2E test improvement effort
