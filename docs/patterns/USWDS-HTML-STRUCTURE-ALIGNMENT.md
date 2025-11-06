# USWDS HTML Structure Alignment

**Date**: 2025-11-04
**Status**: ✅ Complete
**Validation**: All tests passing (75/75 pattern contracts, 7/7 pattern standards)

## Overview

This document records the work completed to ensure our web components render HTML that exactly matches the official USWDS pattern documentation structure.

## Background

During pattern implementation, we identified that our form components were not rendering HTML that matched the official USWDS patterns. Specifically:

1. **Excessive vertical spacing** - Form components always wrapped content in `usa-form-group` divs with `margin-top: 1.5rem`
2. **Missing combo-box wrapper** - Select elements lacked the required `<div class="usa-combo-box">` wrapper
3. **Incorrect width modifiers** - ZIP code field wasn't using the proper `usa-input--medium` class

## Issues Identified

### Issue 1: Form-Group Wrappers in Patterns

**Problem**: Form components always rendered:
```html
<div class="usa-form-group">
  <label class="usa-label">Label</label>
  <input class="usa-input" />
</div>
```

**Official USWDS Pattern** (inside fieldsets):
```html
<label class="usa-label">Label</label>
<input class="usa-input" />
```

**Impact**: Excessive vertical spacing in patterns due to `margin-top: 1.5rem` from form-group class.

### Issue 2: Missing Combo-Box Wrapper

**Problem**: Our select component rendered:
```html
<select class="usa-select">
  <option>...</option>
</select>
```

**Official USWDS**:
```html
<div class="usa-combo-box">
  <select class="usa-select">
    <option>...</option>
  </select>
</div>
```

**Impact**: Missing combo-box enhancement capability and incorrect DOM structure.

### Issue 3: Width Modifiers

**Problem**: ZIP code field not using width modifier, rendering generic `usa-input`.

**Official USWDS**: ZIP should use `usa-input--medium` class.

**Impact**: Incorrect visual width for ZIP code field.

## Solutions Implemented

### Solution 1: Compact Mode for Form Components

Added `compact` boolean property to all form components that skips the form-group wrapper when used inside patterns.

**Modified Files**:
- `packages/uswds-wc-forms/src/components/text-input/usa-text-input.ts`
- `packages/uswds-wc-forms/src/components/select/usa-select.ts`
- `packages/uswds-wc-forms/src/components/textarea/usa-textarea.ts`

**Implementation**:
```typescript
@property({ type: Boolean })
compact = false;

override render() {
  const inputTemplate = html`
    ${this.renderLabel(inputId)}
    ${this.renderHint(inputId)}
    ${this.renderError(inputId)}
    <input class="${this.getInputClasses()}" ... />
  `;

  // Compact mode: no form-group wrapper (for use inside fieldsets/patterns)
  if (this.compact) {
    return inputTemplate;
  }

  // Standard mode: wrap in form-group
  return html`<div class="${this.getFormGroupClasses()}">${inputTemplate}</div>`;
}
```

**Usage in Patterns**:
```html
<usa-text-input
  label="Street address"
  compact
></usa-text-input>
```

### Solution 2: Combo-Box Wrapper for Select

Modified `usa-select` component to always wrap the select element in the required combo-box div.

**File**: `packages/uswds-wc-forms/src/components/select/usa-select.ts`

**Implementation**:
```typescript
const selectTemplate = html`
  ${this.renderLabel(selectId)}
  ${this.renderHint(selectId)}
  ${this.renderError(selectId)}
  ${this.renderSuccess(selectId)}

  <div class="usa-combo-box">
    <select
      class="usa-select"
      id="${selectId}"
      name="${this.name}"
      aria-describedby="${ifDefined(
        describedByIds.length > 0 ? describedByIds.join(' ') : undefined
      )}"
      ?disabled=${this.disabled}
      ?required=${this.required}
      .value="${this.value}"
      @change=${this.handleChange}
    >
      ${this.renderDefaultOption()}
      ${this.options.map((option) => this.renderOption(option))}
      <slot></slot>
    </select>
  </div>
`;
```

### Solution 3: Width Modifiers

Updated address pattern to specify `width="medium"` for ZIP code field.

**File**: `packages/uswds-wc-patterns/src/patterns/address/usa-address-pattern.ts`

**Implementation**:
```html
<usa-text-input
  id="zipCode"
  name="zipCode"
  label="ZIP code"
  type="text"
  width="medium"
  pattern="[0-9]{5}(-[0-9]{4})?"
  maxlength="10"
  ?required="${this.required}"
  compact
  @input="${(e: Event) =>
    this.handleFieldChange('zipCode', (e.target as HTMLInputElement).value)}"
></usa-text-input>
```

## Patterns Updated

All 4 patterns updated to use `compact` mode on form components:

1. **Address Pattern** (`usa-address-pattern`)
   - 6 form fields using compact mode
   - ZIP field using `width="medium"`

2. **Phone Number Pattern** (`usa-phone-number-pattern`)
   - 3 form fields using compact mode

3. **Name Pattern** (`usa-name-pattern`)
   - 6 form fields using compact mode

4. **Contact Preferences Pattern** (`usa-contact-preferences-pattern`)
   - 1 textarea field using compact mode

## Validation Results

### Pattern Contract Tests
```
✅ 75/75 tests passing
```

### Pattern Standards Validation
```
✅ 7/7 patterns passing validation
```

### Build
```
✅ Build successful (21.0s)
✅ TypeScript compilation successful
```

## HTML Structure Comparison

### Before (Incorrect)
```html
<fieldset class="usa-fieldset">
  <legend class="usa-legend">Address</legend>

  <div class="usa-form-group">
    <label class="usa-label">Street address</label>
    <input class="usa-input" />
  </div>

  <div class="usa-form-group">
    <label class="usa-label">State</label>
    <select class="usa-select">
      <option>...</option>
    </select>
  </div>

  <div class="usa-form-group">
    <label class="usa-label">ZIP code</label>
    <input class="usa-input" />
  </div>
</fieldset>
```

### After (Correct - Matches Official USWDS)
```html
<fieldset class="usa-fieldset">
  <legend class="usa-legend">Address</legend>

  <label class="usa-label">Street address
    <abbr title="required" class="usa-hint usa-hint--required">*</abbr>
  </label>
  <input class="usa-input" />

  <label class="usa-label">State
    <abbr title="required" class="usa-hint usa-hint--required">*</abbr>
  </label>
  <div class="usa-combo-box">
    <select class="usa-select">
      <option>...</option>
    </select>
  </div>

  <label class="usa-label">ZIP code</label>
  <input class="usa-input usa-input--medium" />
</fieldset>
```

## Key Structural Requirements

Our components now meet all official USWDS structural requirements:

1. ✅ Labels use `class="usa-label"`
2. ✅ Required fields have inline `<abbr>` with `usa-hint--required`
3. ✅ Inputs use `class="usa-input"` with proper modifiers (e.g., `usa-input--medium`)
4. ✅ Selects wrapped in `<div class="usa-combo-box">`
5. ✅ NO form-group wrappers in compact mode (direct label + input)
6. ✅ Fieldset contains all fields without intermediate divs

## Reference Documentation

- **USWDS Address Pattern**: https://designsystem.digital.gov/patterns/create-a-user-profile/address/
- **USWDS Phone Number Pattern**: https://designsystem.digital.gov/patterns/create-a-user-profile/phone-number/
- **USWDS Name Pattern**: https://designsystem.digital.gov/patterns/create-a-user-profile/name/
- **USWDS Select Component**: https://designsystem.digital.gov/components/select/

## Testing

To verify the HTML structure alignment:

1. **Start Storybook**:
   ```bash
   pnpm storybook
   ```

2. **Navigate to pattern stories** (e.g., Patterns → Address Pattern)

3. **Inspect HTML** using browser DevTools and verify:
   - No form-group wrappers inside fieldsets
   - Select elements have combo-box wrapper div
   - ZIP field has `usa-input--medium` class
   - Visual spacing matches official USWDS patterns

4. **Run validation**:
   ```bash
   pnpm validate:pattern-standards
   ```

## Conclusion

All form components and patterns now render HTML that exactly matches the official USWDS pattern documentation structure. This ensures:

- **Visual consistency** with official USWDS designs
- **Proper USWDS enhancement capability** (combo-box, etc.)
- **Accessibility compliance** through correct ARIA structure
- **Semantic HTML** matching government design standards

The `compact` mode provides flexibility: components can be used standalone (with form-group wrapper) or inside patterns (without wrapper), while always maintaining USWDS compliance.
