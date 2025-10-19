# Behavior Test Strategy - Analysis & Recommendations

## Current Situation

We have **18 behavior test files** (`*-behavior.test.ts`) that test USWDS-mirrored behavior implementations. Many are failing due to **async timing issues** between component initialization and test execution.

### Failure Analysis

**High-failure behavior tests:**
- `tooltip-behavior.test.ts`: 28/28 failures (100%)
- `footer-behavior.test.ts`: 24/27 failures (89%)
- `language-selector-behavior.test.ts`: 23/28 failures (82%)
- `search-behavior.test.ts`: 20/21 failures (95%)
- `table-behavior.test.ts`: 20/32 failures (63%)
- `file-input-behavior.test.ts`: 17/37 failures (46%)
- `header-behavior.test.ts`: 16/36 failures (44%)
- `time-picker-behavior.test.ts`: 13/35 failures (37%)
- `accordion-behavior.test.ts`: 12/22 failures (55%)

**Root Cause:** Component `firstUpdated()` uses `requestAnimationFrame` for async initialization, but tests use `await element.updateComplete` which doesn't wait for RAF completion.

## Three Strategic Options

### Option 1: Fix Timing in Vitest (RECOMMENDED for critical tests)

**Approach:** Add a helper utility that properly waits for behavior initialization.

**Pros:**
- ✅ Keeps behavior tests in fast unit test suite
- ✅ Tests run in ~200ms instead of Cypress ~3-5s
- ✅ Can test internal behavior methods directly
- ✅ Better for CI/CD performance
- ✅ Easier to debug in isolation

**Cons:**
- ⚠️ Requires adding wait utility to test-utils
- ⚠️ Tests become slightly slower (add ~16ms RAF wait)
- ⚠️ May need to wait multiple frames for complex behaviors

**Implementation:**

```javascript
// __tests__/test-utils.js
/**
 * Wait for component behavior initialization
 * Components use requestAnimationFrame in firstUpdated()
 * This ensures behavior is fully initialized before tests proceed
 *
 * @param {LitElement} element - The element to wait for
 * @param {number} frames - Number of animation frames to wait (default 2)
 * @returns {Promise<void>}
 */
export async function waitForBehaviorInit(element, frames = 2) {
  // Wait for Lit updateComplete
  if (element && typeof element.updateComplete?.then === 'function') {
    await element.updateComplete;
  }

  // Wait for animation frames (behavior initialization)
  for (let i = 0; i < frames; i++) {
    await new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  // Additional microtask wait
  await new Promise(resolve => setTimeout(resolve, 0));
}
```

**Test Pattern:**
```javascript
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';

it('should toggle aria-expanded on button click', async () => {
  await waitForBehaviorInit(element); // Instead of element.updateComplete

  const button = element.querySelector('.usa-accordion__button');
  button.click();
  await waitForBehaviorInit(element);

  expect(button.getAttribute('aria-expanded')).toBe('true');
});
```

**Effort:** Medium (2-4 hours)
- Add utility function
- Update ~18 behavior test files
- Verify all tests pass

---

### Option 2: Move to Cypress Component Tests

**Approach:** Convert behavior tests to Cypress component tests where real browser behavior is available.

**Pros:**
- ✅ Tests run in real browser environment
- ✅ No timing hacks needed
- ✅ Better represents actual user interaction
- ✅ Can test visual feedback
- ✅ Already have Cypress setup

**Cons:**
- ❌ Much slower (~3-5s per test vs ~200ms)
- ❌ Harder to debug
- ❌ More complex CI setup
- ❌ Can't test internal methods directly
- ❌ Behavior tests would be separate from unit tests

**Implementation:**
```javascript
// cypress/component/accordion-behavior.cy.ts
describe('Accordion Behavior', () => {
  it('should toggle on button click', () => {
    cy.mount('<usa-accordion></usa-accordion>');
    cy.get('.usa-accordion__button').first().click();
    cy.get('.usa-accordion__button').first()
      .should('have.attr', 'aria-expanded', 'true');
  });
});
```

**Effort:** High (8-12 hours)
- Convert 18 behavior test files to Cypress format
- Setup Cypress component test infrastructure for each
- Update CI configuration
- Document new testing patterns

---

### Option 3: Hybrid Approach (RECOMMENDED)

**Approach:** Fix timing for critical contract tests, move complex interaction tests to Cypress.

**Why This Makes Sense:**
- ✅ **Contract tests** (USWDS behavior parity) stay fast in Vitest
- ✅ **Complex interactions** (drag, resize, real keyboard nav) go to Cypress
- ✅ Best of both worlds - speed + accuracy
- ✅ Maintains existing test structure
- ✅ Clear separation of concerns

**Implementation Strategy:**

**Keep in Vitest (with timing fix):**
- Core USWDS behavior contracts (toggle, show/hide, initialization)
- Property reactivity
- ARIA attribute management
- Event dispatching
- Mode switching (single/multi-select)

**Move to Cypress:**
- Complex keyboard navigation sequences
- Focus trap behavior under real conditions
- Visual feedback validation
- Timing-sensitive interactions (auto-close, debounce)
- Cross-component interactions

**Example Split:**

```javascript
// vitest: usa-accordion-behavior.test.ts (CORE CONTRACT)
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';

describe('USWDS Accordion Behavior Contract', () => {
  it('should toggle aria-expanded on button click', async () => {
    await waitForBehaviorInit(element);
    const button = element.querySelector('.usa-accordion__button');

    button.click();
    await waitForBehaviorInit(element);

    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('should close others in single-select mode', async () => {
    await waitForBehaviorInit(element);
    // ...core USWDS behavior validation
  });
});

// cypress: accordion-interactions.cy.ts (COMPLEX INTERACTIONS)
describe('Accordion Interactions', () => {
  it('should handle keyboard navigation between items', () => {
    cy.mount('<usa-accordion></usa-accordion>');
    cy.get('.usa-accordion__button').first().focus();
    cy.realPress('ArrowDown'); // cypress-real-events plugin
    cy.focused().should('contain', 'Second Item');
  });

  it('should trap focus within expanded content', () => {
    // Complex focus trap testing that needs real browser
  });
});
```

**Effort:** Medium (4-6 hours)
- Add `waitForBehaviorInit` utility
- Update existing behavior tests to use it
- Identify ~5-10 tests per file to move to Cypress
- Create Cypress component test files for complex interactions

---

## Recommendation Matrix

| Criterion | Option 1: Fix Timing | Option 2: All Cypress | Option 3: Hybrid |
|-----------|---------------------|---------------------|------------------|
| **Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Accuracy** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintainability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Developer Experience** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **CI/CD Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Implementation Effort** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## Final Recommendation

**✅ Implement Option 3: Hybrid Approach**

### Phase 1: Fix Core Contracts (Immediate)
1. Add `waitForBehaviorInit()` to `__tests__/test-utils.js`
2. Update all behavior test files to use it
3. Verify contract tests pass
4. **Time: 2-3 hours**

### Phase 2: Move Complex Tests (Soon)
1. Identify complex interaction tests
2. Create Cypress component test files
3. Move ~30-50 complex tests to Cypress
4. **Time: 4-6 hours**

### Why This Works
- **Fast feedback loop**: Core contracts run in <1 second
- **High confidence**: Complex interactions tested in real browser
- **Maintainable**: Clear separation - contracts in Vitest, interactions in Cypress
- **Pragmatic**: Fixes immediate problems, sets up for long-term quality

## Implementation Details

### Step 1: Add Utility (5 minutes)

Add to `__tests__/test-utils.js`:

```javascript
/**
 * Wait for component behavior initialization
 * Components use requestAnimationFrame in firstUpdated()
 * This ensures behavior is fully initialized before tests proceed
 *
 * @param {LitElement} element - The element to wait for
 * @param {number} frames - Number of animation frames to wait (default 2)
 * @returns {Promise<void>}
 */
export async function waitForBehaviorInit(element, frames = 2) {
  // Wait for Lit updateComplete
  if (element && typeof element.updateComplete?.then === 'function') {
    await element.updateComplete;
  }

  // Wait for animation frames (behavior initialization)
  for (let i = 0; i < frames; i++) {
    await new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  // Additional microtask wait
  await new Promise(resolve => setTimeout(resolve, 0));
}
```

### Step 2: Update Behavior Tests Pattern

**Before:**
```javascript
it('should toggle on click', async () => {
  await element.updateComplete;
  button.click();
  await element.updateComplete;
  expect(button.getAttribute('aria-expanded')).toBe('true');
});
```

**After:**
```javascript
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';

it('should toggle on click', async () => {
  await waitForBehaviorInit(element);
  button.click();
  await waitForBehaviorInit(element);
  expect(button.getAttribute('aria-expanded')).toBe('true');
});
```

### Step 3: Bulk Update Script

```bash
# Find/replace pattern for all behavior tests
find src/components/*/usa-*-behavior.test.ts -type f -exec sed -i '' \
  's/await element\.updateComplete/await waitForBehaviorInit(element)/g' {} \;

# Add import at top of each file
find src/components/*/usa-*-behavior.test.ts -type f -exec sed -i '' \
  "/^import.*from 'vitest'/a\\
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';" {} \;
```

## Success Metrics

After implementation:
- ✅ All behavior contract tests pass (currently ~60% failing)
- ✅ Test suite runs in <30 seconds (currently ~25s)
- ✅ Clear documentation on when to use Vitest vs Cypress
- ✅ Developer confidence in behavior testing

## Next Steps

1. **Get approval** on hybrid approach
2. **Implement Phase 1** (fix timing) - 2-3 hours
3. **Validate** all behavior tests pass
4. **Document** new testing patterns
5. **Plan Phase 2** (identify tests to move to Cypress)

---

## Alternative: Keep Current State?

**Should we just accept some failing tests?**

❌ **No** - Failing tests create:
- False confidence (can't tell real failures from known issues)
- Technical debt (devs ignore test failures)
- Poor developer experience (tests aren't helpful)
- CI instability (flaky builds)

**Better to:** Either fix them properly (Option 3) or remove them and replace with Cypress tests (Option 2).

---

*Document created: 2025-10-18*
*Status: Pending approval*
