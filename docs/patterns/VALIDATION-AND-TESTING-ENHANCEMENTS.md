# Validation and Testing Enhancements for USWDS HTML Structure

**Date**: 2025-11-04
**Status**: ✅ Complete

## Overview

This document describes the comprehensive validation and testing system added to automatically detect and prevent USWDS HTML structure issues.

## Problem Statement

During USWDS HTML structure alignment work, we discovered that our existing validation wasn't catching critical HTML structure issues:
- Missing combo-box wrappers on select elements
- Missing compact mode on form components in patterns
- Incorrect width modifiers (e.g., ZIP code fields)
- Form-group wrappers appearing in pattern templates

These issues went undetected until manual inspection, indicating a gap in automated validation.

## Solution: Multi-Layer Validation System

We implemented a comprehensive validation system with multiple layers:

### 1. Static Code Validation Script

**File**: `scripts/validate/validate-uswds-html-structure.cjs`

**Purpose**: Analyzes source code to validate USWDS HTML structure compliance

**Validations Performed**:
- ✅ Form components have compact mode property
- ✅ Form components have conditional form-group rendering
- ✅ Select component has usa-combo-box wrapper
- ✅ Patterns use compact mode on all form components
- ✅ Width modifiers are correctly applied (e.g., ZIP has width="medium")
- ✅ No form-group wrappers in pattern templates
- ✅ Documentation exists

**Usage**:
```bash
pnpm run validate:uswds-html-structure
```

**Exit Codes**:
- `0` - All validations passed
- `1` - Validation failures detected

**Example Output**:
```
🔍 USWDS HTML Structure Validation

📋 Validating Compact Mode Implementation
✅ usa-text-input: Has compact property
✅ usa-text-input: Has conditional rendering
✅ usa-select: Has compact property
✅ usa-select: Has conditional rendering

📋 Validating Combo-Box Wrapper
✅ usa-select: Has usa-combo-box wrapper

📋 Validating Patterns Use Compact Mode
✅ address: All 5 usa-text-input have compact
✅ address: All 1 usa-select have compact

✅ All USWDS HTML structure validations passed!
```

### 2. Automated Unit Tests

Created comprehensive test suites to validate HTML structure at runtime:

#### **Compact Mode Tests**
**File**: `packages/uswds-wc-forms/src/components/text-input/usa-text-input-compact.test.ts`

Tests:
- ✅ Form-group wrapper present by default
- ✅ No form-group wrapper when compact=true
- ✅ Label rendered directly without wrapper in compact mode
- ✅ Input rendered directly without wrapper in compact mode
- ✅ All functionality maintained in compact mode
- ✅ Required indicator renders in compact mode
- ✅ Hint renders in compact mode
- ✅ Error renders in compact mode
- ✅ Matches exact USWDS HTML structure

Example test:
```typescript
it('should match USWDS HTML structure in compact mode', async () => {
  const el = await fixture(html`
    <usa-text-input label="Street address" name="street" required compact></usa-text-input>
  `);

  const label = el.querySelector('label.usa-label');
  const input = el.querySelector('input.usa-input');
  const abbr = el.querySelector('abbr.usa-hint--required');
  const formGroup = el.querySelector('.usa-form-group');

  expect(label).to.exist;
  expect(input).to.exist;
  expect(abbr).to.exist;
  expect(formGroup).to.not.exist;

  // Label and input should be direct children
  expect(label?.parentElement).to.equal(el);
  expect(input?.parentElement).to.equal(el);
});
```

#### **Combo-Box Wrapper Tests**
**File**: `packages/uswds-wc-forms/src/components/select/usa-select-structure.test.ts`

Tests:
- ✅ Select wrapped in usa-combo-box div
- ✅ Select is direct child of combo-box
- ✅ Matches official USWDS select structure
- ✅ Combo-box wrapper in compact mode
- ✅ Combo-box wrapper in standard mode
- ✅ Select functionality maintained with wrapper
- ✅ ARIA attributes properly applied
- ✅ No intermediate wrappers between combo-box and select

Example test:
```typescript
it('should match official USWDS select structure', async () => {
  const el = await fixture(html`
    <usa-select label="State" name="state" required></usa-select>
  `);

  // Expected structure:
  // <label class="usa-label">State <abbr>*</abbr></label>
  // <div class="usa-combo-box">
  //   <select class="usa-select" required>...</select>
  // </div>

  const label = el.querySelector('label.usa-label');
  const comboBox = el.querySelector('.usa-combo-box');
  const select = el.querySelector('select.usa-select');

  expect(label).to.exist;
  expect(comboBox).to.exist;
  expect(select).to.exist;
  expect(select?.parentElement?.classList.contains('usa-combo-box')).to.be.true;
});
```

#### **Width Modifier Tests**
**File**: `packages/uswds-wc-forms/src/components/text-input/usa-text-input-modifiers.test.ts`

Tests:
- ✅ usa-input--small applied when width="small"
- ✅ usa-input--medium applied when width="medium"
- ✅ usa-input--2xs applied when width="2xs"
- ✅ No width class when width not specified
- ✅ Matches USWDS ZIP code structure with medium width
- ✅ usa-input--error applied when error exists
- ✅ usa-input--success applied when success exists
- ✅ Width and state modifiers combined correctly
- ✅ Only official USWDS width classes used

Example test:
```typescript
it('should match USWDS ZIP code structure with medium width', async () => {
  const el = await fixture(html`
    <usa-text-input
      label="ZIP code"
      name="zipCode"
      width="medium"
      pattern="[0-9]{5}(-[0-9]{4})?"
      maxlength="10"
      compact
    ></usa-text-input>
  `);

  const input = el.querySelector('input') as HTMLInputElement;

  expect(input?.classList.contains('usa-input')).to.be.true;
  expect(input?.classList.contains('usa-input--medium')).to.be.true;
  expect(input?.pattern).to.equal('[0-9]{5}(-[0-9]{4})?');
  expect(input?.maxLength).to.equal(10);
});
```

### 3. Pre-Commit Hook Integration

**File**: `scripts/validation/stages/02-uswds-validation.sh`

Added as stage 4e/9 in the pre-commit validation pipeline:

```bash
# Stage 4e/9: USWDS HTML structure validation
echo "🏛️  4e/9 USWDS HTML structure validation..."
node scripts/validate/validate-uswds-html-structure.cjs > /dev/null 2>&1
VALIDATION_EXIT_CODE=$?
if [ $VALIDATION_EXIT_CODE -ne 0 ]; then
  echo "❌ USWDS HTML structure validation failed!"
  echo ""
  node scripts/validate/validate-uswds-html-structure.cjs
  echo ""
  echo "See: docs/patterns/USWDS-HTML-STRUCTURE-ALIGNMENT.md"
  exit 1
fi
echo "   ✅ Pass"
```

**Benefits**:
- Runs automatically before every commit
- Catches structure issues immediately
- Provides clear error messages with documentation links
- Prevents broken HTML structure from being committed

## Coverage

### Components Validated

**Form Components** (3):
- usa-text-input
- usa-select
- usa-textarea

**Patterns** (4):
- address pattern (6 fields)
- phone-number pattern (3 fields)
- name pattern (6 fields)
- contact-preferences pattern (1 field)

### Validation Rules

1. **Compact Mode Implementation** (3 components)
   - Property exists: `@property({ type: Boolean }) compact = false`
   - Conditional rendering: `if (this.compact) { return inputTemplate; }`

2. **Combo-Box Wrapper** (1 component)
   - usa-select has `<div class="usa-combo-box">` wrapper
   - Select element is direct child of combo-box

3. **Pattern Compliance** (4 patterns, 16 total fields)
   - All usa-text-input have `compact` attribute
   - All usa-select have `compact` attribute
   - All usa-textarea have `compact` attribute

4. **Width Modifiers**
   - ZIP code has `width="medium"` (renders usa-input--medium)
   - All valid USWDS width classes supported (2xs, xs, small, medium)

5. **No Form-Groups in Patterns**
   - Pattern templates don't contain usa-form-group class
   - Form components handle wrapper via compact mode

6. **Documentation**
   - USWDS-HTML-STRUCTURE-ALIGNMENT.md exists

## Test Statistics

### Unit Test Coverage

- **Compact Mode**: 9 tests
- **Combo-Box Wrapper**: 8 tests
- **Width Modifiers**: 9 tests
- **Total**: 26 new tests

All tests passing ✅

### Validation Coverage

- **Components**: 3/3 form components validated
- **Patterns**: 4/4 patterns validated
- **Fields**: 16/16 pattern fields validated
- **Documentation**: 1/1 required docs validated

## Integration

### NPM Scripts

Added to `package.json`:
```json
{
  "scripts": {
    "validate:uswds-html-structure": "node scripts/validate/validate-uswds-html-structure.cjs"
  }
}
```

### Pre-Commit Hook

Integrated into modular pre-commit validation system:
- Stage: 4e/9 (USWDS validation)
- Location: `scripts/validation/stages/02-uswds-validation.sh`
- Timing: After component composition validation

### CI/CD

The validation is automatically enforced in:
- Pre-commit hooks (local development)
- CI/CD pipelines (via pre-commit hook simulation)

## Benefits

### 1. Automatic Detection
- Catches HTML structure issues immediately
- No manual inspection required
- Runs on every commit

### 2. Clear Guidance
- Detailed error messages
- Direct links to documentation
- Shows exactly what's wrong and how to fix it

### 3. Prevents Regressions
- Once fixed, issues can't come back
- Tests ensure structure remains correct
- Pre-commit hook enforces compliance

### 4. Developer Experience
- Fast feedback (<2 seconds for validation)
- Clear pass/fail indicators
- Actionable error messages

### 5. Documentation
- Living documentation via tests
- Examples of correct implementation
- Reference for future development

## Usage Examples

### Running Validation Manually

```bash
# Run USWDS HTML structure validation
pnpm run validate:uswds-html-structure

# Run all validations
pnpm run validate

# Run specific test suites
pnpm test -- usa-text-input-compact.test.ts
pnpm test -- usa-select-structure.test.ts
pnpm test -- usa-text-input-modifiers.test.ts
```

### Interpreting Results

**Success**:
```
✅ All USWDS HTML structure validations passed!
```

**Failure Example**:
```
❌ usa-select: Missing usa-combo-box wrapper
ℹ️  Add: <div class="usa-combo-box"><select>...</select></div>

❌ address: 1/5 usa-text-input missing compact
```

## Maintenance

### Adding New Form Components

When creating a new form component:

1. Add compact property:
   ```typescript
   @property({ type: Boolean })
   compact = false;
   ```

2. Add conditional rendering:
   ```typescript
   if (this.compact) {
     return inputTemplate;
   }
   return html`<div class="usa-form-group">${inputTemplate}</div>`;
   ```

3. Add to validation script:
   ```javascript
   const formComponents = [
     'packages/uswds-wc-forms/src/components/text-input/usa-text-input.ts',
     'packages/uswds-wc-forms/src/components/select/usa-select.ts',
     'packages/uswds-wc-forms/src/components/textarea/usa-textarea.ts',
     'packages/uswds-wc-forms/src/components/NEW-COMPONENT/usa-NEW-COMPONENT.ts', // Add here
   ];
   ```

4. Create test file:
   ```
   packages/uswds-wc-forms/src/components/NEW-COMPONENT/usa-NEW-COMPONENT-compact.test.ts
   ```

### Adding New Patterns

When creating a new pattern:

1. Use compact mode on all form components:
   ```html
   <usa-text-input label="Field" name="field" compact></usa-text-input>
   ```

2. Add to validation script:
   ```javascript
   const patterns = [
     'packages/uswds-wc-patterns/src/patterns/address/usa-address-pattern.ts',
     'packages/uswds-wc-patterns/src/patterns/phone-number/usa-phone-number-pattern.ts',
     'packages/uswds-wc-patterns/src/patterns/name/usa-name-pattern.ts',
     'packages/uswds-wc-patterns/src/patterns/contact-preferences/usa-contact-preferences-pattern.ts',
     'packages/uswds-wc-patterns/src/patterns/NEW-PATTERN/usa-NEW-PATTERN-pattern.ts', // Add here
   ];
   ```

## Related Documentation

- [USWDS HTML Structure Alignment](./USWDS-HTML-STRUCTURE-ALIGNMENT.md) - Implementation details
- [Testing Guide](../TESTING_GUIDE.md) - Complete testing documentation
- [Component Templates](../COMPONENT_TEMPLATES.md) - Component generation templates

## Summary

We've implemented a comprehensive validation and testing system that:

1. **Validates HTML structure automatically** via static code analysis
2. **Tests HTML structure at runtime** via unit tests (26 tests)
3. **Enforces compliance** via pre-commit hooks
4. **Provides clear guidance** via detailed error messages and documentation

This ensures that USWDS HTML structure issues are caught immediately and can never be committed to the codebase.

**Result**: Zero tolerance for USWDS HTML structure deviations, with automatic detection and prevention.
