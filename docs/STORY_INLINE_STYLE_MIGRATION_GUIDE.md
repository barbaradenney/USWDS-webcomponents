# Story Inline Style Migration Guide

Complete guide for removing inline styles from Storybook stories and replacing them with USWDS utility classes and components.

## Table of Contents

- [Overview](#overview)
- [Why Remove Inline Styles?](#why-remove-inline-styles)
- [Validation System](#validation-system)
- [USWDS Utility Classes Reference](#uswds-utility-classes-reference)
- [Common Migration Patterns](#common-migration-patterns)
- [Component Replacements](#component-replacements)
- [Step-by-Step Migration Process](#step-by-step-migration-process)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

All Storybook stories must use **USWDS utility classes** and **library components** instead of inline styles. This ensures consistency, maintainability, and proper adherence to the USWDS design system.

### ✅ Compliant Story
```typescript
export const Example: Story = {
  render: () => html`
    <usa-alert variant="info" slim class="margin-bottom-2">
      <h3 class="usa-alert__heading">Example Heading</h3>
      <p class="margin-0">Content using USWDS utility classes.</p>
    </usa-alert>
  `,
};
```

### ❌ Non-Compliant Story
```typescript
export const Example: Story = {
  render: () => html`
    <div style="margin-bottom: 1rem; padding: 1rem; background: #e3f2fd;">
      <h3 style="margin: 0;">Example Heading</h3>
      <p style="margin: 0;">Content with inline styles.</p>
    </div>
  `,
};
```

---

## Why Remove Inline Styles?

1. **Consistency**: USWDS provides a consistent design language
2. **Maintainability**: Utility classes are easier to update globally
3. **Documentation**: Stories serve as examples for developers
4. **Accessibility**: USWDS components have built-in a11y features
5. **Theme Support**: USWDS utilities support theming and customization

---

## Validation System

### Automated Validation

The validation script runs automatically:
- **Pre-commit**: Validates modified component stories
- **Manual**: Run `npm run validate:story-styles`
- **CI/CD**: Integrated into build pipeline

### What It Detects

1. **Inline Style Attributes** (ERROR - blocking)
   ```typescript
   // ❌ BLOCKED
   <div style="margin: 1rem;">Content</div>
   ```

2. **Custom Alert HTML** (WARNING - non-blocking)
   ```typescript
   // ⚠️ WARNING
   <div class="usa-alert usa-alert--info">...</div>
   // ✅ USE INSTEAD
   <usa-alert variant="info">...</usa-alert>
   ```

3. **Custom Badge/Tag HTML** (WARNING - non-blocking)
   ```typescript
   // ⚠️ WARNING
   <span class="custom-badge">Badge</span>
   // ✅ USE INSTEAD
   <usa-tag text="Badge"></usa-tag>
   ```

### Running Validation

```bash
# Validate all stories
npm run validate:story-styles

# Validate specific components
node scripts/validate/validate-story-styles.js card alert button-group

# Check modified components only (in pre-commit)
MODIFIED_COMPONENTS="card\nalert" npm run validate:story-styles
```

---

## USWDS Utility Classes Reference

### Spacing

#### Margins
```typescript
// Margin all sides
margin-0       // 0
margin-05      // 0.25rem (4px)
margin-1       // 0.5rem (8px)
margin-2       // 1rem (16px)
margin-3       // 1.5rem (24px)
margin-4       // 2rem (32px)
margin-5       // 2.5rem (40px)

// Directional margins
margin-top-1, margin-bottom-2, margin-left-3, margin-right-4
margin-x-2     // horizontal (left + right)
margin-y-3     // vertical (top + bottom)
```

#### Padding
```typescript
padding-0, padding-05, padding-1, padding-2, padding-3, padding-4, padding-5
padding-top-1, padding-bottom-2, padding-left-3, padding-right-4
padding-x-2    // horizontal
padding-y-3    // vertical
```

### Layout

#### Display
```typescript
display-none
display-block
display-inline
display-inline-block
display-flex
display-inline-flex
```

#### Flexbox
```typescript
// Direction
flex-row, flex-column
flex-row-reverse, flex-column-reverse

// Justify content
flex-justify           // justify-content: space-between
flex-justify-start
flex-justify-end
flex-justify-center

// Align items
flex-align-start
flex-align-end
flex-align-center
flex-align-stretch

// Wrap
flex-wrap
flex-no-wrap

// Gap (spacing between flex items)
gap-05, gap-1, gap-2, gap-3, gap-4, gap-5
```

### Sizing

#### Width
```typescript
width-full       // 100%
width-auto
maxw-mobile      // 320px
maxw-mobile-lg   // 480px
maxw-tablet      // 640px
maxw-tablet-lg   // 880px
maxw-desktop     // 1024px
maxw-desktop-lg  // 1200px
maxw-widescreen  // 1400px
minw-card        // 10rem
```

#### Height
```typescript
height-full      // 100%
height-auto
height-viewport  // 100vh
```

### Typography

#### Font Size
```typescript
font-body-3xs    // 0.81rem
font-body-2xs    // 0.87rem
font-body-xs     // 0.93rem
font-body-sm     // 0.93rem
font-body-md     // 1rem (default)
font-body-lg     // 1.06rem
font-body-xl     // 1.31rem
font-body-2xl    // 1.95rem
font-body-3xl    // 2.44rem
```

#### Font Weight
```typescript
text-light       // 300
text-normal      // 400
text-bold        // 700
text-semibold    // 600
```

#### Text Alignment
```typescript
text-left
text-center
text-right
text-justify
```

#### Text Color
```typescript
text-base-darkest
text-base-darker
text-base-dark
text-base
text-base-light
text-primary      // Primary blue
text-secondary    // Secondary red
text-success      // Green
text-warning      // Yellow/orange
text-error        // Red
text-white
```

### Borders

```typescript
// Border width
border-0
border-1px
border-2px
border-05      // 0.25rem
border-1       // 0.5rem

// Border style
border-solid
border-dashed
border-dotted

// Border color
border-base-lightest
border-base-lighter
border-base-light
border-base
border-primary
border-secondary
```

### Background Colors

```typescript
bg-transparent
bg-white
bg-base-lightest   // Very light gray
bg-base-lighter    // Light gray
bg-base-light      // Gray
bg-base            // Dark gray
bg-primary         // Primary blue
bg-primary-lighter // Light blue
bg-secondary       // Secondary red
bg-accent-warm     // Warm accent
bg-accent-cool     // Cool accent
bg-success         // Green
bg-warning         // Yellow/orange
bg-error           // Red
```

### Radius (Border Radius)

```typescript
radius-0       // 0
radius-sm      // 2px
radius-md      // 0.25rem (4px)
radius-lg      // 0.5rem (8px)
radius-pill    // 99rem (fully rounded)
```

---

## Common Migration Patterns

### 1. Inline Margins → Utility Classes

**Before:**
```typescript
<div style="margin-bottom: 1rem; margin-top: 2rem;">
```

**After:**
```typescript
<div class="margin-bottom-2 margin-top-4">
```

### 2. Inline Padding → Utility Classes

**Before:**
```typescript
<div style="padding: 1rem;">
```

**After:**
```typescript
<div class="padding-2">
```

### 3. Flexbox Layout → Utility Classes

**Before:**
```typescript
<div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
```

**After:**
```typescript
<div class="display-flex flex-justify flex-align-center gap-1">
```

### 4. Background Colors → Utility Classes

**Before:**
```typescript
<div style="background: #e3f2fd; padding: 1rem; border-radius: 4px;">
```

**After:**
```typescript
<usa-alert variant="info" slim class="padding-2">
```

Or if not using alert:
```typescript
<div class="bg-primary-lighter padding-2 radius-md">
```

### 5. Custom Info Boxes → usa-alert

**Before:**
```typescript
<div style="margin-top: 1rem; padding: 1rem; background: #f0f8ff; border-radius: 4px;">
  <p><strong>Note:</strong> This is important information.</p>
</div>
```

**After:**
```typescript
<usa-alert variant="info" slim class="margin-top-2">
  <p class="margin-0"><strong>Note:</strong> This is important information.</p>
</usa-alert>
```

### 6. Custom Badges → usa-tag

**Before:**
```typescript
<span style="background: #00a91c; color: white; padding: 0.25rem 0.5rem; border-radius: 2px; font-size: 0.875rem;">
  APPROVED
</span>
```

**After:**
```typescript
<usa-tag text="APPROVED" class="bg-success text-white"></usa-tag>
```

### 7. Form Elements → USWDS Form Classes

**Before:**
```typescript
<form style="padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
  <label for="name" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Name:</label>
  <input id="name" type="text" style="padding: 0.5rem; border: 1px solid #ccc; width: 100%;" />
</form>
```

**After:**
```typescript
<form class="usa-form padding-2 border-1px border-base-lighter radius-md">
  <label class="usa-label text-bold" for="name">Name:</label>
  <input class="usa-input" id="name" type="text" />
</form>
```

### 8. Grid Layouts → Flexbox or Grid Utilities

**Before:**
```typescript
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
```

**After (using flexbox):**
```typescript
<div class="display-flex flex-wrap gap-2">
  <div class="flex-1">...</div>
  <div class="flex-1">...</div>
</div>
```

**After (using grid - if USWDS supports):**
```typescript
<div class="grid-row gap-2">
  <div class="grid-col-6">...</div>
  <div class="grid-col-6">...</div>
</div>
```

---

## Component Replacements

### Replace Custom Alerts with `<usa-alert>`

**Before:**
```typescript
<div class="usa-alert usa-alert--info usa-alert--slim">
  <div class="usa-alert__body">
    <p class="usa-alert__text">Information message</p>
  </div>
</div>
```

**After:**
```typescript
<usa-alert variant="info" slim>
  <p class="margin-0">Information message</p>
</usa-alert>
```

### Replace Custom Tags/Badges with `<usa-tag>`

**Before:**
```typescript
<span class="custom-badge success">Approved</span>
```

**After:**
```typescript
<usa-tag text="Approved" class="bg-success text-white"></usa-tag>
```

---

## Step-by-Step Migration Process

### 1. Identify Violations

Run validation to find all inline styles:

```bash
npm run validate:story-styles
```

### 2. Review Output

The script will show:
- Component name
- Line numbers with violations
- Context of each violation

Example output:
```
❌ FAILED (1):

  accordion (10 error(s), 0 warning(s))
    ❌ Line 304: Inline style attribute found
      <table class="usa-table usa-table--borderless" style="width: 100%;">
```

### 3. Open Component Story File

```bash
code src/components/accordion/usa-accordion.stories.ts
```

### 4. Replace Inline Styles

For each violation, replace with USWDS utility classes:

**Before (Line 304):**
```typescript
<table class="usa-table usa-table--borderless" style="width: 100%;">
```

**After:**
```typescript
<table class="usa-table usa-table--borderless width-full">
```

### 5. Replace Custom Components

Look for custom alert/badge HTML and replace:

**Before:**
```typescript
<div style="padding: 1rem; background: #f0f0f0; border-radius: 4px;">
  <p><strong>Note:</strong> Important info</p>
</div>
```

**After:**
```typescript
<usa-alert variant="info" slim>
  <p class="margin-0"><strong>Note:</strong> Important info</p>
</usa-alert>
```

### 6. Verify in Storybook

Start Storybook and verify the story looks correct:

```bash
npm run storybook
```

Navigate to: `http://localhost:6006/?path=/story/components-accordion--your-story`

### 7. Re-run Validation

```bash
npm run validate:story-styles
```

Should show:
```
✅ PASSED (1):
  accordion
```

### 8. Commit Changes

```bash
git add src/components/accordion/usa-accordion.stories.ts
git commit -m "fix(accordion): remove inline styles from stories"
```

The pre-commit hook will validate automatically.

---

## Examples

### Example 1: Button Group Segmented Story

**Before:**
```typescript
export const Segmented: Story = {
  render: (args) => html`
    <div>
      <div style="margin-bottom: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 4px;">
        <h3 style="margin: 0 0 0.5rem 0;">Interactive Segmented Button Group</h3>
        <p style="margin: 0; font-size: 0.9rem;">
          Click buttons to switch between modes.
        </p>
      </div>

      <usa-button-group .type=${args.type} .buttons=${args.buttons}></usa-button-group>

      <div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 4px;">
        <h4 style="margin: 0 0 0.5rem 0;">How It Works:</h4>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.9rem;">
          <li>Click any button to activate it</li>
          <li>Active button displays in filled style</li>
        </ul>
      </div>
    </div>
  `,
};
```

**After:**
```typescript
export const Segmented: Story = {
  render: (args) => html`
    <div>
      <usa-alert variant="info" slim class="margin-bottom-2">
        <h3 class="usa-alert__heading margin-top-0 margin-bottom-1">Interactive Segmented Button Group</h3>
        <p class="margin-0 font-body-xs">
          Click buttons to switch between modes.
        </p>
      </usa-alert>

      <usa-button-group .type=${args.type} .buttons=${args.buttons}></usa-button-group>

      <usa-alert variant="info" slim class="margin-top-3">
        <h4 class="usa-alert__heading margin-top-0 margin-bottom-1">How It Works:</h4>
        <ul class="usa-list margin-y-1 padding-left-3 font-body-xs">
          <li>Click any button to activate it</li>
          <li>Active button displays in filled style</li>
        </ul>
      </usa-alert>
    </div>
  `,
};
```

### Example 2: Form Actions Story

**Before:**
```typescript
export const FormActions: Story = {
  render: (args) => html`
    <form style="padding: 1rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 1rem;">
      <h3 style="margin-top: 0;">Sample Form</h3>
      <div style="margin-bottom: 1rem;">
        <label for="name" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Name:</label>
        <input id="name" type="text" style="padding: 0.5rem; border: 1px solid #ccc; width: 100%;" />
      </div>

      <usa-button-group .buttons=${args.buttons}></usa-button-group>
    </form>

    <div style="padding: 1rem; background: #f0f8ff; border-radius: 4px;">
      <p><strong>Form Integration:</strong> Example of button groups in forms.</p>
    </div>
  `,
};
```

**After:**
```typescript
export const FormActions: Story = {
  render: (args) => html`
    <form class="usa-form padding-2 border-1px border-base-lighter radius-md margin-bottom-2">
      <h3 class="margin-top-0">Sample Form</h3>
      <div class="margin-bottom-2">
        <label class="usa-label text-bold" for="name">Name:</label>
        <input class="usa-input" id="name" type="text" />
      </div>

      <usa-button-group .buttons=${args.buttons}></usa-button-group>
    </form>

    <usa-alert variant="info" slim>
      <p class="margin-0"><strong>Form Integration:</strong> Example of button groups in forms.</p>
    </usa-alert>
  `,
};
```

### Example 3: Mobile Simulation Story

**Before:**
```typescript
export const MobileFriendly: Story = {
  render: (args) => html`
    <div style="max-width: 320px; margin: 0 auto; border: 2px dashed #ccc; padding: 1rem;">
      <h4 style="text-align: center; margin-top: 0;">Mobile Device Simulation</h4>
      <p style="font-size: 0.9rem; color: #666; text-align: center;">
        Button groups adapt to mobile layouts
      </p>

      <usa-button-group .buttons=${args.buttons}></usa-button-group>

      <div style="margin-top: 1rem; padding: 0.75rem; background: #f8f9fa; font-size: 0.85rem;">
        <p style="margin: 0;"><strong>Mobile Considerations:</strong></p>
        <ul style="margin: 0.5rem 0; padding-left: 1.25rem;">
          <li>Touch-friendly button sizes</li>
          <li>Adequate spacing for finger taps</li>
        </ul>
      </div>
    </div>
  `,
};
```

**After:**
```typescript
export const MobileFriendly: Story = {
  render: (args) => html`
    <div class="maxw-mobile margin-x-auto border-2px border-dashed border-base-light padding-2">
      <h4 class="text-center margin-top-0">Mobile Device Simulation</h4>
      <p class="font-body-xs text-base-dark text-center">
        Button groups adapt to mobile layouts
      </p>

      <usa-button-group .buttons=${args.buttons}></usa-button-group>

      <usa-alert variant="info" slim class="margin-top-2 font-body-2xs">
        <p class="margin-0"><strong>Mobile Considerations:</strong></p>
        <ul class="usa-list margin-y-1 padding-left-205">
          <li>Touch-friendly button sizes</li>
          <li>Adequate spacing for finger taps</li>
        </ul>
      </usa-alert>
    </div>
  `,
};
```

---

## Troubleshooting

### Issue: "No matching USWDS utility class"

**Problem:** Need specific styling not available in USWDS utilities.

**Solution:**
1. Check USWDS documentation for available utilities
2. Consider if the styling is necessary (most cases it's not)
3. Use closest USWDS utility class
4. If absolutely necessary, create a CSS class in component styles (not inline)

### Issue: "Alert looks different with `<usa-alert>`"

**Problem:** Replacing custom HTML with `<usa-alert>` changes appearance.

**Solution:**
1. Use the correct `variant`: `info`, `success`, `warning`, `error`, `emergency`
2. Add `slim` attribute for compact alerts
3. Use USWDS utility classes for additional spacing/sizing
4. Accept that USWDS styling is the standard (embrace consistency)

### Issue: "Grid layout not working with flexbox"

**Problem:** Converting `display: grid` to flexbox utilities.

**Solution:**
1. Use USWDS grid system: `grid-row` and `grid-col-*` classes
2. Or use flexbox with `flex-1`, `flex-2`, etc. for flex-grow
3. Consider if the complex grid is necessary in a story

### Issue: "Validation still failing after fixes"

**Problem:** Made changes but validation shows errors.

**Solution:**
1. Ensure all `style="..."` attributes removed
2. Check for hidden inline styles in nested elements
3. Run validation with verbose output: `npm run validate:story-styles`
4. Check line numbers match your fixes (file may have shifted)

### Issue: "Custom component needs specific styles"

**Problem:** Component behavior requires specific styling not available in USWDS.

**Solution:**
1. Add styles to component's CSS file, not inline
2. Use CSS custom properties for dynamic values
3. Apply USWDS-compatible CSS classes
4. Document why custom styling is needed

---

## Resources

- **USWDS Documentation**: https://designsystem.digital.gov/
- **USWDS Utilities**: https://designsystem.digital.gov/utilities/
- **Validation Script**: `scripts/validate/validate-story-styles.js`
- **Package Commands**: `npm run validate:story-styles`
- **Pre-commit Hook**: `.husky/pre-commit`

---

## Summary Checklist

Before committing story changes:

- [ ] No `style="..."` attributes in story HTML
- [ ] Custom alert HTML replaced with `<usa-alert>`
- [ ] Custom badge/tag HTML replaced with `<usa-tag>`
- [ ] All spacing uses USWDS utility classes
- [ ] All colors use USWDS utility classes
- [ ] All layout uses USWDS flexbox/grid utilities
- [ ] Story renders correctly in Storybook
- [ ] Validation passes: `npm run validate:story-styles`
- [ ] Pre-commit hook passes

---

**Last Updated:** 2025-10-09
**Validation Version:** 1.0.0
