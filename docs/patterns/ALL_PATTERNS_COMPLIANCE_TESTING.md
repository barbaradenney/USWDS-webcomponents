# All Patterns Compliance Testing System

**Automated USWDS compliance testing for all pattern components**

## Overview

This system automatically runs generic USWDS compliance tests against **all patterns** in the library, ensuring consistent HTML structure and catching regressions immediately.

## What Was Created

### 1. **Reusable Test Utilities** (`packages/uswds-wc-patterns/src/test-utils/`)

Generic validation functions that can be used across all patterns:

- `validateFieldsetStructure()` - Fieldset/legend validation
- `validateCompactMode()` - Compact mode usage
- `validateNoFormGroups()` - No form-group wrappers
- `validateNoGridWrappers()` - No grid layout
- `validateComboBoxWrapper()` - Combo-box structure
- `validateFieldLabels()` - Label text validation
- `validateFieldOrder()` - Field sequence validation
- `runGenericPatternCompliance()` - Batch runner

### 2. **All-Patterns Test Suite** (`packages/uswds-wc-patterns/src/all-patterns-compliance.test.ts`)

Automatically tests ALL patterns in the library with a single test file.

### 3. **Documentation** (`packages/uswds-wc-patterns/src/test-utils/README.md`)

Complete usage guide and examples.

## How It Works

### Pattern Configuration

Add patterns to the `PATTERNS` array:

```typescript
const PATTERNS: PatternTestConfig[] = [
  {
    tagName: 'usa-address-pattern',
    displayName: 'Address Pattern',
    hasSelects: true,
  },
  {
    tagName: 'usa-name-pattern',
    displayName: 'Name Pattern',
    hasSelects: true,
  },
  // Add new patterns here...
];
```

### Automatic Test Generation

For each pattern, the system automatically tests:

1. **Fieldset Structure**
   - Correct USWDS fieldset/legend structure
   - Only USWDS classes used

2. **Compact Mode**
   - All form components use compact attribute
   - No form-group wrappers present
   - Compact rendering works correctly

3. **Layout Structure**
   - No grid-row wrappers
   - No grid-col wrappers
   - Fields are direct children of fieldset

4. **Combo-Box Wrapper** (if pattern has selects)
   - All selects wrapped in usa-combo-box
   - Select is direct child of combo-box

5. **Light DOM Pattern**
   - No Shadow DOM
   - USWDS styles cascade properly

6. **USWDS Class Usage**
   - Only official USWDS classes

### Cross-Pattern Consistency Tests

Validates consistency across **all patterns**:

- All use Light DOM
- All have fieldset/legend structure
- All use compact mode
- All avoid grid wrappers
- All use consistent USWDS class naming

## Running the Tests

### Run All Patterns Compliance

```bash
# Run compliance tests for all patterns
pnpm test packages/uswds-wc-patterns/src/all-patterns-compliance.test.ts

# Run with watch mode
pnpm test packages/uswds-wc-patterns/src/all-patterns-compliance.test.ts --watch
```

### Run Individual Pattern Tests

```bash
# Run tests for a specific pattern
pnpm test packages/uswds-wc-patterns/src/patterns/address/usa-address-pattern-uswds-compliance.test.ts
```

### Run All Pattern Tests

```bash
# Run all pattern tests (individual + all-patterns suite)
pnpm test packages/uswds-wc-patterns
```

## Test Coverage

### Current Coverage (5 Patterns)

| Pattern | Generic Tests | Status |
|---------|--------------|--------|
| Address | 11 tests | ✅ Passing |
| Name | 11 tests | ✅ Passing |
| Phone Number | 11 tests | ✅ Passing |
| Contact Preferences | 9 tests | ⚠️ 1 Failure (no form components) |
| Language Selector | 11 tests | ⚠️ 2 Failures (non-standard structure) |

**Total: 53 generic compliance tests** across all patterns

### Additional Tests

- **Cross-pattern consistency**: 5 tests
- **Coverage report**: 1 test
- **Pattern-specific tests**: Varies per pattern (30+ for address)

## Adding New Patterns

### Step 1: Add to PATTERNS Array

```typescript
const PATTERNS: PatternTestConfig[] = [
  // ... existing patterns ...
  {
    tagName: 'usa-new-pattern',
    displayName: 'New Pattern',
    hasSelects: false, // or true if pattern has select elements
  },
];
```

### Step 2: Import the Pattern

```typescript
import './patterns/new-pattern/usa-new-pattern.js';
```

### Step 3: Run Tests

```bash
pnpm test packages/uswds-wc-patterns/src/all-patterns-compliance.test.ts
```

**That's it!** Your new pattern automatically gets 9-11 generic compliance tests.

### Step 4: Add Pattern-Specific Tests (Optional)

Create pattern-specific test file for unique behaviors:

```typescript
// packages/uswds-wc-patterns/src/patterns/new-pattern/usa-new-pattern-uswds-compliance.test.ts

import { describe, it } from 'vitest';
import {
  validateFieldLabels,
  validateFieldOrder
} from '../../test-utils/pattern-compliance-tests.js';

describe('New Pattern - Specific Tests', () => {
  it('should have correct labels', () => {
    validateFieldLabels(pattern, {
      field1: 'Label 1',
      field2: 'Label 2',
    });
  });

  it('should handle custom dropdown options', () => {
    // Pattern-specific validation
  });
});
```

## Benefits

### 1. **Automatic Coverage** ✅
- New patterns get compliance tests automatically
- No need to write repetitive test code
- Consistent testing across all patterns

### 2. **Immediate Regression Detection** 🔍
- Any pattern that breaks USWDS compliance fails tests
- Catches issues before they reach production
- Clear indication of which pattern has issues

### 3. **Zero Maintenance** 🚀
- Add pattern to array, get full test suite
- Fix validator once, all patterns benefit
- Centralized validation logic

### 4. **Documentation Through Tests** 📚
- Tests serve as executable documentation
- Clear examples of USWDS requirements
- Easy to understand what's expected

### 5. **Cross-Pattern Consistency** 🎯
- Validates all patterns follow same standards
- Ensures consistency across entire library
- Catches architectural drift

## Test Output

### Success Output

```
✅ Address Pattern - Generic USWDS Compliance (11/11 passed)
✅ Name Pattern - Generic USWDS Compliance (11/11 passed)
✅ Phone Number Pattern - Generic USWDS Compliance (11/11 passed)

📊 Pattern Compliance Test Coverage Report:

Total Patterns: 5

Patterns Tested:
  1. Address Pattern (usa-address-pattern)
     Features: Combo-box
  2. Name Pattern (usa-name-pattern)
     Features: Combo-box
  3. Phone Number Pattern (usa-phone-number-pattern)
     Features: Combo-box
  4. Contact Preferences Pattern (usa-contact-preferences-pattern)
  5. Language Selector Pattern (usa-language-selector-pattern)
     Features: Combo-box

✅ All patterns validated for generic USWDS compliance
```

### Failure Output

```
❌ Contact Preferences Pattern - Generic USWDS Compliance (8/9 passed)
   FAIL: should allow USWDS styles to cascade properly
   → expected to have form components, but none found

❌ Language Selector Pattern - Generic USWDS Compliance (9/11 passed)
   FAIL: should have correct USWDS fieldset/legend structure
   → fieldset element not found

   FAIL: should use only USWDS classes
   → expected 'usa-fieldset' but got 'custom-fieldset'
```

## Pattern-Specific vs Generic Tests

### Generic Tests (70% - Reusable)

These run automatically for **all patterns**:
- Fieldset/legend structure ✅
- Compact mode usage ✅
- No form-group wrappers ✅
- No grid layout ✅
- Combo-box wrappers ✅
- Light DOM usage ✅
- USWDS class usage ✅

### Pattern-Specific Tests (30% - Custom)

These must be written per pattern:
- Dropdown option lists (e.g., state options)
- Custom field interactions
- Pattern-specific validation rules
- Conditional field visibility
- Computed values

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:patterns": "pnpm test packages/uswds-wc-patterns",
    "test:patterns:compliance": "pnpm test packages/uswds-wc-patterns/src/all-patterns-compliance.test.ts",
    "test:patterns:watch": "pnpm test packages/uswds-wc-patterns --watch"
  }
}
```

## CI/CD Integration

The all-patterns test suite runs automatically in:

1. **Pre-commit hooks** - Validates patterns before commit
2. **CI/CD pipelines** - Runs on every push
3. **PR checks** - Ensures new patterns are compliant

## Troubleshooting

### Pattern Not Showing in Tests

**Problem**: Added pattern to array but tests don't run

**Solution**: Make sure you imported the pattern at the top:
```typescript
import './patterns/my-pattern/usa-my-pattern.js';
```

### Tests Failing for Existing Pattern

**Problem**: Pattern was working, now tests fail

**Solution**:
1. Check if pattern still follows USWDS structure
2. Run individual pattern tests to see specific failure
3. Fix pattern to match USWDS requirements

### Pattern Doesn't Use Standard Structure

**Problem**: Pattern has non-standard structure (e.g., no fieldset)

**Solution**:
1. Add `skipTests` configuration:
```typescript
{
  tagName: 'usa-special-pattern',
  displayName: 'Special Pattern',
  skipTests: ['fieldset', 'compact'],
}
```
2. Or refactor pattern to follow USWDS standards

## Future Enhancements

Potential additions to the compliance testing system:

- [ ] Accessibility compliance tests (ARIA, roles)
- [ ] Performance benchmarks
- [ ] Visual regression testing integration
- [ ] Automatic validation script generation
- [ ] IDE integration for real-time validation

## Summary

The All Patterns Compliance Testing System provides:

✅ **Automatic coverage** for all patterns
✅ **Immediate regression detection**
✅ **Zero maintenance overhead**
✅ **Consistent USWDS compliance**
✅ **Clear test failure reporting**

**Result**: Add a pattern to one array, get full USWDS compliance testing automatically!
