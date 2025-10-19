# Test Skip Policy

**Last Updated:** 2025-10-18
**Status:** ACTIVE POLICY - Phase 2 COMPLETE ✅

## Core Principle

**Tests should NEVER be skipped without explicit architectural justification and alternative coverage.**

## Strict Rules

### ✅ ALLOWED: Environment-Specific Test Separation

**Pattern:** Different test files for different environments (NOT `.skip()`)

```typescript
// ✅ GOOD: Separate browser test file
// usa-component.browser.test.ts
describe('Component (Browser Only)', () => {
  it('should test browser-specific feature', () => {
    // Tests run in browser test environment only
  });
});

// ❌ BAD: Skipping tests in main file
// usa-component.test.ts
describe('Component', () => {
  it.skip('should test browser-specific feature', () => {
    // This hides the test from CI
  });
});
```

**Valid Reasons:**
- Browser-only APIs (DataTransfer, IntersectionObserver, etc.)
- USWDS DOM transformation requiring real browser
- Timing-dependent behavior requiring real event loop

**Requirements:**
- Create separate `.browser.test.ts` or Cypress test file
- Document in component TESTING.md
- Verify coverage exists with script

---

### ❌ NEVER ALLOWED: Skipping Due to Flaky/Failing Tests

**If a test fails:**
1. **Fix the test** - Update assertions to match correct behavior
2. **Fix the code** - If test revealed a bug
3. **Refactor the test** - If test design is flawed
4. **Delete the test** - If testing wrong thing (rare)

**NEVER:** Add `.skip()` to make CI pass

---

### ❌ NEVER ALLOWED: Skipping Due to Timing Issues

**If a test has timing issues:**
1. Use `waitFor()` utilities
2. Add proper async/await
3. Move to Cypress if needs real browser timing
4. Fix the race condition in code

**NEVER:** Skip because "it's flaky"

---

### ⚠️ CONDITIONAL: Architecture-Driven Skips

**Only with:**
1. **Explicit architectural decision documented**
2. **Alternative test coverage verified**
3. **Approved in code review**
4. **Clear comment explaining why**

**Example:**
```typescript
// ✅ Acceptable: Documented architectural deviation
it.skip('should separate identifier from footer (ARCHITECTURAL DECISION)', () => {
  // DECISION: We intentionally combine footer + identifier for DX
  // DOCUMENTED: docs/ARCHITECTURE_DECISIONS.md#footer-identifier-integration
  // ALTERNATIVE COVERAGE: Integration tests verify combined behavior
  // APPROVED: 2024-12-15 by team
});
```

---

## Enforcement

### Pre-commit Hook

Add validation that fails commit if:
- `.skip()` or `.skipIf()` found without approved justification
- Comment doesn't reference architectural decision doc
- No alternative coverage documented

### Monthly Audit

- Review all skipped tests
- Verify alternative coverage still exists
- Re-evaluate architectural decisions

### CI Failure

Test suite fails if:
- Total skipped tests > previous commit
- New skips without documentation

---

## Current Audit

**Total Skipped Tests:** 6 (97% reduction from 206+)

**Breakdown:**
- ✅ **1 test** - Architectural decision (footer)
- ✅ **5 tests** - Cypress timing limitations (date-picker: 2, modal: 3)

**Phase 2 Results (2025-10-18):**
- Deleted 8 entire test files (~150 tests) with 100% Cypress coverage
- Removed 6 individual skipped tests with Cypress coverage
- Verified all deleted tests have comprehensive Cypress equivalents
- Updated validation baseline

**Action Items:**
1. ✅ Create pre-commit hook to prevent new skips (COMPLETE)
2. ✅ Document all current skips with architectural decisions (COMPLETE)
3. Set up monthly review process
4. ✅ Add CI check for skip count regression (COMPLETE)

---

## Migration Plan for Existing Skips

### Phase 1: Categorize (COMPLETE ✅)
- [x] Identify all 206+ skipped tests
- [x] Document reason for each skip
- [x] Verify alternative coverage

### Phase 2: Reduce Skips (COMPLETE ✅)
- [x] Delete 8 behavior contract test files (~150 tests)
- [x] Delete DOM validation test files with Cypress coverage
- [x] Remove ARIA/accessibility tests with Cypress coverage
- [x] Remove browser API tests with Cypress coverage
- [x] Update validation baseline to 6 remaining skips

### Phase 3: Prevent New Skips (COMPLETE ✅)
- [x] Create pre-commit hook
- [x] Add CI validation
- [x] Document policy in TEST_SKIP_POLICY.md
- [x] Add automated skip count enforcement

---

## Decision Matrix

```
Test failing? → Why?
├─ Code bug → FIX THE CODE
├─ Wrong assertion → FIX THE TEST
├─ Flaky timing → ADD PROPER WAITS or MOVE TO CYPRESS
├─ Needs browser API → CREATE .browser.test.ts FILE
├─ Architectural reason → DOCUMENT + GET APPROVAL + VERIFY ALT COVERAGE
└─ Testing wrong thing → DELETE THE TEST
```

**NEVER: Add `.skip()` to make CI green**

---

## Examples

### ❌ BAD: Hiding a failing test
```typescript
it.skip('should update text property', () => {
  // Skipped because it fails - THIS IS WRONG
});
```

### ✅ GOOD: Fixing the test
```typescript
it('should update text property', async () => {
  element.text = 'new text';
  await element.updateComplete; // Added await
  expect(element.text).toBe('new text');
});
```

### ✅ GOOD: Moving to appropriate environment
```typescript
// usa-tooltip.test.ts - Unit tests only
describe('Tooltip Unit Tests', () => {
  it('should set properties', () => { /* ... */ });
});

// usa-tooltip.browser.test.ts - Browser-specific tests
describe('Tooltip Browser Tests', () => {
  it('should show on hover', () => { /* Needs real browser */ });
});
```

---

## Consequences of Violating Policy

1. **PR rejected** - Cannot merge with new `.skip()` without justification
2. **CI fails** - Pre-commit hook blocks commit
3. **Code review comment** - Must explain and get approval
4. **Technical debt tracking** - Skipped test added to backlog

---

## Questions to Ask Before Skipping

1. **Can I fix this test instead?** (90% of the time: YES)
2. **Can I move this to a browser test file?** (If browser API needed)
3. **Is this testing the right thing?** (Maybe delete instead)
4. **Is there alternative coverage?** (Required if skip)
5. **Have I documented the architectural decision?** (Required if skip)
6. **Will future me understand why this is skipped?** (Comment test)

---

## Success Metrics

- **Skipped test count:** Decreasing over time
- **Test failures:** Addressed within 24 hours
- **New skips:** < 1 per month (with justification)
- **Unskipped tests:** > 2 per month

---

**Remember:** A skipped test is a **broken promise** to future developers and users.
