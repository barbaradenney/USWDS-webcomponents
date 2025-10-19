# Tooltip Component - Remaining Test Failures Analysis

## Session Progress Summary

**Completed**: Fixed 3 tooltip test failures (+50% improvement: 6→9 passing tests)
- ✅ Fixed story references (--positions → position-specific stories)
- ✅ Fixed naturally focusable elements test (now visits OnLink story for links)
- ✅ Fixed bottom and right positioning tests

**Status**: 9/15 passing (60%), 6 remaining failures

## Remaining Failures Analysis

### 1. Classes Property Not Applying to Tooltip Body
**Test**: `should update classes property`
**Error**: `.usa-tooltip__body` doesn't have class `custom-tooltip-class`
**Root Cause**: USWDS applies `data-classes` to the wrapper (`.usa-tooltip`), not the body
**Location**: `usa-tooltip-behavior.ts:376-379`
**Expected Behavior**: Classes should propagate to body element
**Fix Required**: Modify component's `updated()` method to apply classes to body element as well

### 2. Left Position Not Working
**Test**: `should position tooltip to left when position="left"`
**Error**: Cannot find `.usa-tooltip__body--left`
**Root Cause**: USWDS repositions tooltips if they don't fit in viewport (see `findBestPosition()`)
**Location**: `usa-tooltip-behavior.ts:243-271`
**Impact**: Left position may be repositioned to top/bottom/right if clipped
**Fix Options**:
  - Option A: Adjust test to accept alternate positions when left doesn't fit
  - Option B: Use larger viewport or positioned story to ensure left fits
  - Option C: Mock `isElementInViewport` to always return true for left

### 3. Escape Key Not Hiding Tooltips
**Test**: `should hide all tooltips on Escape key press`
**Error**: Tooltip still visible after pressing Escape
**Root Cause**: Event listener scope issue - attached to `rootEl` not document
**Location**: `usa-tooltip-behavior.ts:461-468`
**Code**:
```typescript
const handleKeydown = keymap({ Escape: handleEscape });
rootEl.addEventListener('keydown', handleKeydown);  // Only listens on rootEl
```
**Fix Required**: Attach Escape listener to document.body for global coverage

### 4. Axe Accessibility Check Failing
**Test**: `should pass axe accessibility checks`
**Error**: `No elements found for include in page Context`
**Root Cause**: Selector `'usa-tooltip'` returns no elements after USWDS transformation
**Impact**: USWDS wraps content in `.usa-tooltip` class on wrapper span
**Fix Required**: Update test selector to find transformed elements

### 5. Dynamic Content Not Updating
**Test**: `should update tooltip content when data-title changes`
**Error**: Tooltip body doesn't contain 'New tooltip content'
**Root Cause**: Component doesn't watch for `data-title` attribute changes on trigger
**Location**: `usa-tooltip.ts:229-251` (updated() method)
**Current Behavior**: Only updates when `text` or `title` properties change
**Fix Required**: Add MutationObserver or attribute change detection for slotted elements

### 6. Dynamic Position Changes Not Working
**Test**: `should update position when position attribute changes`
**Error**: Cannot find `.usa-tooltip__body--bottom` after changing position
**Root Cause**: Position update doesn't re-run USWDS positioning logic
**Location**: `usa-tooltip.ts:253-263` (updated() method for position changes)
**Current Code**: Only updates `data-position` attribute, doesn't reposition
**Fix Required**: Call `showToolTip()` to re-run positioning when position changes

## Recommended Approach

### High Priority (Component Bugs)
1. **Escape Key Handler** - Critical accessibility issue
2. **Dynamic Position Changes** - Core functionality
3. **Dynamic Content Updates** - Core functionality

### Medium Priority (Test Adjustments)
4. **Left Position** - Viewport-dependent, consider test adjustment
5. **Classes Property** - Enhancement, not critical

### Low Priority (Test Fix)
6. **Axe Check Selector** - Simple test fix

## Implementation Notes

**Escape Key Fix**:
```typescript
// In usa-tooltip-behavior.ts, line 464
// BEFORE:
const rootEl = root === document ? document.body : (root as HTMLElement);
rootEl.addEventListener('keydown', handleKeydown);

// AFTER:
const rootEl = root === document ? document.body : (root as HTMLElement);
const keydownTarget = document.body; // Always use document.body for Escape
keydownTarget.addEventListener('keydown', handleKeydown);
```

**Dynamic Position Fix**:
```typescript
// In usa-tooltip.ts updated() method, after line 262
if (changedProperties.has('position')) {
  const wrapper = this.querySelector('.usa-tooltip');
  const trigger = this.querySelector('.usa-tooltip__trigger');
  const body = this.querySelector('.usa-tooltip__body');

  if (trigger && body) {
    (trigger as HTMLElement).setAttribute('data-position', this.position);
    // Re-run positioning if tooltip is currently visible
    if (body.classList.contains('is-visible')) {
      showToolTip(body, trigger as HTMLElement, this.position);
    }
  }
}
```

**Dynamic Content Fix**:
```typescript
// Add to usa-tooltip.ts connectedCallback()
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-title') {
      const newTitle = (mutation.target as HTMLElement).getAttribute('data-title');
      const body = this.querySelector('.usa-tooltip__body');
      if (body && newTitle) {
        body.textContent = newTitle;
      }
    }
  });
});

// Observe slotted elements for data-title changes
const slottedElements = this.querySelectorAll('*');
slottedElements.forEach((el) => {
  observer.observe(el, { attributes: true, attributeFilter: ['data-title'] });
});
```

## Session Achievements

✅ Tooltip tests: 40% → 60% (+50% improvement)
✅ Character-count: Fixed Lit ChildPart conflicts (+37.5% tests)
✅ Fixed component-issues-report.json generation path
✅ Committed 3 fixes across 5 commits

**Remaining Work**: 6 tooltip component behavior issues requiring deeper fixes
