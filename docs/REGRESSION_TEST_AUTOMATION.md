# Regression Test Automation

## Overview

This document describes the automated regression testing system for preventing known bugs from recurring in the USWDS Web Components library.

## What Are Regression Tests?

Regression tests are specific tests designed to prevent previously fixed bugs from reappearing in the codebase. Each regression test:

1. **Documents the original bug** - Explains what went wrong
2. **Describes the fix** - Shows how it was resolved
3. **Validates the fix remains** - Ensures the bug doesn't come back

## Current Regression Test Coverage

### Range Slider Component

**Location**: `src/components/range-slider/usa-range-slider.test.ts`

**Bug Fixed**: Initial value attribute restoration timing issue

**Tests** (3 tests):
1. `REGRESSION: should properly restore initial value attribute on connectedCallback`
   - **Bug**: Property value was being overwritten by attribute value during component initialization
   - **Fix**: Set property BEFORE calling `super.connectedCallback()` to prevent attribute restoration from overwriting
   - **Validates**: Property value takes precedence over attribute value

2. `REGRESSION: should handle initial value with custom min/max range`
   - **Bug**: Initial value restoration didn't work correctly with non-default ranges
   - **Fix**: Ensure initial value works with any min/max combination
   - **Validates**: Custom ranges don't break value initialization

3. `REGRESSION: should not lose value during property updates`
   - **Bug**: Value could be lost when updating other properties
   - **Fix**: Ensure value persists through various property changes
   - **Validates**: Value remains stable during updates

### In-Page Navigation Component

**Location**: `src/components/in-page-navigation/usa-in-page-navigation.test.ts`

**Bug Fixed**: IntersectionObserver threshold hardcoded, ignoring configured value

**Tests** (6 tests):
1. `REGRESSION: should properly pass threshold property to USWDS behavior`
   - **Bug**: Hardcoded `intersectionRatio >= 1` check ignored configured threshold
   - **Fix**: Modified `setActive()` to accept and use configured threshold value
   - **Validates**: Threshold property is properly passed to behavior layer

2. `REGRESSION: should properly pass rootMargin property to USWDS behavior`
   - **Bug**: Detection zone configuration needed validation
   - **Fix**: Ensure rootMargin is properly passed through to IntersectionObserver
   - **Validates**: RootMargin correctly defines viewport detection zone

3. `REGRESSION: should maintain IntersectionObserver settings through property updates`
   - **Bug**: Observer settings could be reset when changing other properties
   - **Fix**: Ensure settings persist through property changes
   - **Validates**: Threshold and rootMargin remain stable

4. `REGRESSION: should use correct default IntersectionObserver values`
   - **Bug**: Wrong defaults caused incorrect active state tracking
   - **Fix**: Set proper defaults (threshold: '0.5', rootMargin: '0px 0px -50% 0px')
   - **Validates**: Component uses correct default values

5. `REGRESSION: should handle extreme threshold values without breaking`
   - **Bug**: Edge cases with unusual threshold values could break behavior
   - **Fix**: Test minimum (0), maximum (1), and mid-range (0.75) values
   - **Validates**: Component handles all valid threshold values

6. `REGRESSION: should handle various rootMargin formats`
   - **Bug**: Different margin formats could cause parsing issues
   - **Fix**: Ensure different rootMargin formats work correctly
   - **Validates**: All CSS margin syntaxes work properly

## Running Regression Tests

### Individual Components

```bash
# Test range slider regressions
npm run test:regression:range-slider

# Test in-page navigation regressions
npm run test:regression:in-page-nav
```

### All Component Regressions

```bash
# Run all component-specific regression tests
npm run test:regression:components
```

### With Full Test Suite

```bash
# Run all tests (includes regression tests)
npm test
```

## Automation Integration

### 1. Pre-Commit Hooks

Regression tests run automatically as part of pre-commit validation:

**Hook**: `.husky/pre-commit`

**Stages**:
- `8/9 Test expectations` - Validates all test expectations
- `8a/9 Component regression tests` - **Component-specific regression tests** (NEW! ⚡)

**Smart Component Detection**:
The pre-commit hook only runs regression tests for **modified components**:

```bash
# If you modify range-slider component:
git add src/components/range-slider/usa-range-slider.ts
git commit -m "fix: range slider bug"

# Pre-commit hook runs:
# → Only range-slider regression tests (3 tests, ~50ms)
# → Skips in-page-navigation regression tests
# → Skips all other component tests

# If you modify in-page-navigation component:
git add src/components/in-page-navigation/usa-in-page-navigation.ts
git commit -m "fix: in-page nav bug"

# Pre-commit hook runs:
# → Only in-page-navigation regression tests (6 tests, ~60ms)
# → Skips range-slider regression tests
# → Skips all other component tests

# If you modify other components:
git add src/components/button/usa-button.ts
git commit -m "fix: button bug"

# Pre-commit hook:
# → Skips all regression tests (component has no regressions)
# → Shows: "⏭️  Skipped (modified components have no regression tests)"
```

**Benefits**:
- ⚡ **Fast commits** - Only tests what you changed
- 🎯 **Targeted testing** - No unnecessary test execution
- ✅ **Always protected** - Regression tests still run for modified components
- 🚀 **Scalable** - Remains fast as more regression tests are added

### 2. Continuous Integration (CI)

Regression tests run in CI pipeline:

```bash
npm run test:ci
```

### 3. NPM Scripts

The following npm scripts include regression test execution:

- `npm test` - Runs all unit tests (includes regressions)
- `npm run test:ci` - CI test suite (includes regressions)
- `npm run test:all` - Complete test suite (unit + Storybook)
- `npm run test:comprehensive` - Comprehensive testing orchestrator

### 4. Component-Specific Validation

When modifying specific components, targeted regression tests run:

```bash
# Pre-commit hook runs component-specific tests
git diff --cached --name-only | grep "range-slider"
# → Triggers range slider regression tests
```

## Adding New Regression Tests

When fixing a bug that should never return:

### 1. Create Regression Test

Add a new test in the component's test file:

```typescript
describe('Regression Tests', () => {
  it('REGRESSION: should [description of what should work]', async () => {
    // Bug: [Describe the original bug]
    //
    // Fix: [Describe how it was fixed]
    //
    // This test ensures [what this test validates]

    // Test implementation
    const element = document.createElement('usa-component') as USAComponent;
    // ... test code

    expect(/* validation */);
  });
});
```

### 2. Add NPM Script (Optional)

For complex bugs, add a dedicated script:

```json
{
  "scripts": {
    "test:regression:my-component": "vitest run src/components/my-component/usa-my-component.test.ts --testNamePattern='REGRESSION'"
  }
}
```

### 3. Document the Regression

Update this file (`docs/REGRESSION_TEST_AUTOMATION.md`) with:

- Component name
- Bug description
- Fix description
- Test count and descriptions

### 4. Add to Pre-Commit Hook (for component-specific testing)

To enable component-specific regression testing in the pre-commit hook, add your component to `.husky/pre-commit`:

```bash
# Edit .husky/pre-commit
# Find the section: "# Check each modified component for regression tests"
# Add your component check:

elif [ "$comp" = "my-component" ]; then
  echo "   → Running my-component regression tests..."
  if npm run test:regression:my-component > /dev/null 2>&1; then
    echo "   ✅ my-component: X regression tests passed"
  else
    echo "   ❌ my-component: regression tests failed!"
    exit 1
  fi
  REGRESSION_TESTS_RUN=$((REGRESSION_TESTS_RUN + 1))
fi
```

### 5. Run and Verify

```bash
# Test your new regression test
npm test -- my-component.test.ts

# Test component-specific script (if added)
npm run test:regression:my-component

# Verify it's included in full suite
npm test

# Test pre-commit integration (optional)
# 1. Make a change to your component
# 2. Stage the change: git add src/components/my-component/
# 3. Attempt commit: git commit -m "test"
# 4. Verify regression tests run automatically
```

## Test Naming Convention

**Pattern**: `REGRESSION: should [expected behavior]`

**Examples**:
- ✅ `REGRESSION: should properly restore initial value attribute on connectedCallback`
- ✅ `REGRESSION: should maintain IntersectionObserver settings through property updates`
- ❌ `should restore initial value` (missing REGRESSION prefix)
- ❌ `REGRESSION: test value restoration` (not descriptive enough)

## Best Practices

### 1. Clear Documentation

Every regression test MUST include inline comments:
- **Bug**: What went wrong
- **Fix**: How it was resolved
- **This test ensures**: What this validates

### 2. Comprehensive Coverage

Test edge cases, not just the happy path:
- Minimum/maximum values
- Property combinations
- State changes
- User interactions

### 3. Keep Tests Isolated

Each regression test should:
- Test one specific bug fix
- Be independent from other tests
- Create its own test element
- Clean up after itself

### 4. Fail Fast

Regression tests should:
- Run quickly (< 1 second each)
- Fail immediately when bug reappears
- Provide clear error messages

## Benefits

### 1. Prevents Regressions

Once a bug is fixed and a regression test is added, that bug cannot return without failing tests.

### 2. Living Documentation

Regression tests document historical bugs and their fixes, serving as a reference for:
- Future developers
- Code reviews
- Architecture decisions

### 3. Confidence in Refactoring

With comprehensive regression coverage, you can refactor confidently knowing tests will catch any broken behavior.

### 4. Fast Feedback

Regression tests run in seconds, providing immediate feedback during development:
- Local development: `npm test`
- Pre-commit: Automatic via git hooks
- CI/CD: Automatic on every push

## Troubleshooting

### Regression Test Failing

If a regression test fails:

1. **DO NOT** modify or skip the test
2. **Investigate** what changed to cause the failure
3. **Fix** the code to pass the test
4. **Verify** the fix doesn't break other functionality

### Adding Test for New Bug

1. **Reproduce** the bug with a test
2. **Verify** the test fails before the fix
3. **Fix** the bug
4. **Verify** the test now passes
5. **Document** the bug, fix, and validation

## Related Documentation

- **Test Expectations**: `scripts/test/regression-test-validator.js`
- **Test Health**: `docs/TESTING_INFRASTRUCTURE_ENHANCEMENT.md`
- **Debugging Guide**: `docs/DEBUGGING_GUIDE.md`
- **CLAUDE.md**: Project development guidelines

## Statistics

**Total Regression Tests**: 9 tests
- Range Slider: 3 tests ✅
- In-Page Navigation: 6 tests ✅

**Test Success Rate**: 100%

**Average Execution Time**: ~150ms total

**Coverage**: 2 components (100% of components with fixed regressions)

## Future Enhancements

### Planned Additions

1. **Automated Regression Test Generation**
   - Use AI to suggest regression tests from bug fix commits
   - Template-based test generation from issue descriptions

2. **Regression Test Metrics**
   - Track which regressions are caught most frequently
   - Identify patterns in regression causes
   - Generate monthly regression prevention reports

3. **Cross-Component Regression Suite**
   - Test interactions between components
   - Validate component composition scenarios
   - Test USWDS integration regressions

---

**Last Updated**: 2025-10-11

**Maintained By**: USWDS Web Components Team
