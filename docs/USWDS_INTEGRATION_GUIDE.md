# USWDS Integration Guide

**Complete Guide to USWDS Integration with Web Components**

Last Updated: 2025-10-08

**Related Specialized Guides:**
- [USWDS Icon Guidelines](./guides/USWDS_ICON_GUIDELINES.md) - Icon implementation standards
- [USWDS Import Standards](./guides/USWDS_IMPORT_STANDARDS.md) - Critical JavaScript import rules

---

## Table of Contents

1. [Overview](#overview)
2. [USWDS JavaScript Debugging Protocol](#uswds-javascript-debugging-protocol)
3. [USWDS JavaScript References](#uswds-javascript-references)
4. [USWDS Class Automation](#uswds-class-automation)
5. [USWDS Compliance Automation](#uswds-compliance-automation)
6. [USWDS Compliance Methodology](#uswds-compliance-methodology)
7. [Initial Value Pattern](#initial-value-pattern)
8. [Sync Validation](#sync-validation)
9. [Update Checklist](#update-checklist)

---

## Overview

This guide consolidates all USWDS integration documentation into a single comprehensive resource. It covers debugging, compliance, automation, and best practices for maintaining 100% USWDS alignment.

### Key Principles

1. **USWDS First**: Always consult USWDS source code before implementing fixes
2. **Automation**: Automated compliance checking prevents regressions
3. **Validation**: Multiple validation layers ensure continuous compliance
4. **Documentation**: All patterns documented with USWDS source references

---

## USWDS JavaScript Debugging Protocol

### 🚨 MANDATORY: Always Check USWDS Source Code First

When debugging component issues, **ALWAYS** consult the official USWDS JavaScript implementation before attempting fixes.

### Why This Matters

**Problem Example**: The date picker calendar button wasn't working in Storybook.

- ❌ **Wrong Approach**: Guessing how to toggle visibility with inline styles and custom logic
- ✅ **Right Approach**: Checking USWDS source code revealed it uses `renderCalendar()` function and `usa-date-picker--active` class

**Result**: By following USWDS's actual implementation, we fixed the issue correctly in 5 minutes instead of guessing for hours.

### Debugging Protocol (MANDATORY STEPS)

#### Step 1: Locate USWDS Source Code

Every component has a `@uswds-js-reference` JSDoc tag linking to the official source:

```typescript
/**
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-date-picker/src/index.js
 */
```

**Local Path**: `node_modules/@uswds/uswds/packages/usa-[component]/src/index.js`

#### Step 2: Identify Key Functions and Patterns

Search the USWDS source for:

```bash
# Find event handlers
grep -n "addEventListener\|CLICK\|keydown" node_modules/@uswds/uswds/packages/usa-[component]/src/index.js

# Find toggle/show/hide functions
grep -n "toggle\|show\|hide\|open\|close" node_modules/@uswds/uswds/packages/usa-[component]/src/index.js

# Find class names and patterns
grep -n "CLASS\|classList" node_modules/@uswds/uswds/packages/usa-[component]/src/index.js

# Find exported functions
grep -n "module.exports\|exports" node_modules/@uswds/uswds/packages/usa-[component]/src/index.js
```

#### Step 3: Understand USWDS's Pattern

Look for these common patterns:

1. **CSS Class Toggles**: USWDS often uses classes like `usa-[component]--active` for state
2. **Hidden Attribute**: Many components use `hidden` attribute, not `display: none`
3. **Exported Functions**: Check what functions are exported (e.g., `renderCalendar`, `updateCalendar`)
4. **Event Delegation**: USWDS uses the `behavior()` pattern for event delegation

#### Step 4: View the Exact Implementation

Read the actual function implementation:

```bash
# Example: View toggleCalendar function
sed -n '1340,1370p' node_modules/@uswds/uswds/packages/usa-date-picker/src/index.js
```

#### Step 5: Document Your Findings

Add comments referencing the USWDS source:

```typescript
/**
 * Following USWDS source code (packages/usa-date-picker/src/index.js):
 * - Line 1200: datePickerEl.classList.add(DATE_PICKER_ACTIVE_CLASS)
 * - Line 1313: datePickerEl.classList.remove(DATE_PICKER_ACTIVE_CLASS)
 * - Line 1314: calendarEl.hidden = true
 */
```

### Common USWDS Patterns to Look For

#### Pattern 1: Active/Inactive States

```javascript
// USWDS typically uses classes for state management
const COMPONENT_ACTIVE_CLASS = `${PREFIX}-component--active`;
componentEl.classList.add(COMPONENT_ACTIVE_CLASS);  // Show
componentEl.classList.remove(COMPONENT_ACTIVE_CLASS);  // Hide
```

#### Pattern 2: Hidden Attribute

```javascript
// Not display: none, but the hidden attribute
element.hidden = true;  // Hide
element.hidden = false; // Show
```

#### Pattern 3: Event Delegation with behavior()

```javascript
// USWDS uses receptor/behavior for event delegation
const componentEvents = {
  click: {
    [BUTTON_SELECTOR]: handleClick,
  },
};

const component = behavior(componentEvents, {
  init(root) { /* ... */ }
});
```

#### Pattern 4: Exported Functions

```javascript
// Check what functions are available
module.exports = component;

// Often includes:
// - init(root)
// - toggle(el)
// - show(el) / hide(el)
// - enable(el) / disable(el)
// - render functions
```

### Pre-Implementation Checklist

Before implementing any component fix:

- [ ] Located USWDS source code file
- [ ] Identified relevant functions (toggle, show, hide, etc.)
- [ ] Read the actual implementation (not just guessed)
- [ ] Checked what CSS classes are used
- [ ] Checked what attributes are modified
- [ ] Verified what functions are exported
- [ ] Documented USWDS source references in code comments
- [ ] Tested that implementation matches USWDS behavior
- [ ] **Ran USWDS compliance validation** - `npm run uswds:validate-alignment [component-file]`
- [ ] **Verified JavaScript integration** - `npm run uswds:validate-javascript`

### Quick Commands for Analysis

```bash
# Find component source
ls node_modules/@uswds/uswds/packages/usa-*/src/index.js

# View component's main functions
grep -n "^const.*=.*(" node_modules/@uswds/uswds/packages/usa-[component]/src/index.js

# View module exports
tail -50 node_modules/@uswds/uswds/packages/usa-[component]/src/index.js

# Find class name constants
grep "CLASS = " node_modules/@uswds/uswds/packages/usa-[component]/src/index.js

# Find event handlers
grep -A5 "click:\|keydown:\|focus:" node_modules/@uswds/uswds/packages/usa-[component]/src/index.js
```

### Remember

> **"When in doubt, read the USWDS source. When not in doubt, read it anyway."**

Every component issue can be understood by reading the USWDS JavaScript implementation.

**This is not optional - it's the required first step for all component debugging.**

---

## USWDS JavaScript References

### Why Reference USWDS JavaScript?

1. **Battle-tested patterns**: USWDS JavaScript is used by thousands of government websites
2. **Accessibility compliance**: Ensures proper ARIA attributes, keyboard navigation, and screen reader support
3. **Consistency**: Maintains identical behavior to official USWDS implementations
4. **Future-proofing**: Easier to sync with USWDS updates when following their patterns
5. **Debugging**: Clear reference point when troubleshooting component behavior

### Required JSDoc Tags

All interactive components should include these documentation references:

```typescript
/**
 * Component Name Web Component
 *
 * Brief description of the component functionality.
 *
 * @element usa-component-name
 * @fires event-name - Description of custom events
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-component/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-component/src/styles/_usa-component.scss
 * @uswds-docs https://designsystem.digital.gov/components/component/
 * @uswds-guidance https://designsystem.digital.gov/components/component/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/component/#accessibility
 */
```

### Component Mapping

| Component | USWDS JS Reference | USWDS CSS Reference |
|-----------|-------------------|---------------------|
| Accordion | https://github.com/uswds/uswds/tree/develop/packages/usa-accordion/src/index.js | https://github.com/uswds/uswds/tree/develop/packages/usa-accordion/src/styles/_usa-accordion.scss |
| Modal | https://github.com/uswds/uswds/tree/develop/packages/usa-modal/src/index.js | https://github.com/uswds/uswds/tree/develop/packages/usa-modal/src/styles/_usa-modal.scss |
| Date Picker | https://github.com/uswds/uswds/tree/develop/packages/usa-date-picker/src/index.js | https://github.com/uswds/uswds/tree/develop/packages/usa-date-picker/src/styles/_usa-date-picker.scss |
| Combo Box | https://github.com/uswds/uswds/tree/develop/packages/usa-combo-box/src/index.js | https://github.com/uswds/uswds/tree/develop/packages/usa-combo-box/src/styles/_usa-combo-box.scss |

See [USWDS_JAVASCRIPT_REFERENCES.md](./archived/USWDS_JAVASCRIPT_REFERENCES.md) for complete component mapping.

---

## USWDS Class Automation

### Overview

The compliance checker relies on a comprehensive list of official USWDS CSS classes to validate components. This automation ensures the class list stays current as USWDS evolves, preventing false positive compliance errors.

### Architecture

#### Core Components

1. **Class Extraction Script** (`scripts/extract-complete-uswds-classes.js`)
   - Scans USWDS SCSS and JavaScript source files
   - Extracts all official CSS classes using advanced regex patterns
   - Generates comprehensive class database

2. **Automation Script** (`scripts/auto-update-uswds-classes.js`)
   - Detects USWDS version changes
   - Automatically triggers class extraction when needed
   - Validates extracted classes and provides change reports

3. **Post-Install Hook** (`scripts/postinstall-uswds-check.js`)
   - Runs automatically after `npm install`
   - Silent operation in CI environments
   - Detects when USWDS package is updated

#### Data Storage

- **Production Database**: `/tmp/uswds_classes.txt` (594+ classes)
- **Version Tracking**: `.uswds-version` (current processed version)
- **Backups**: `/tmp/uswds_classes_backup.txt` (before updates)

### Usage

#### Manual Commands

```bash
# Check if class list needs updating
npm run uswds:update-classes:check

# Update class list (automatic detection)
npm run uswds:update-classes

# Force update regardless of version
npm run uswds:update-classes:force

# Extract classes without automation
npm run uswds:extract-classes

# Full USWDS sync (includes class update)
npm run uswds:sync
```

#### Automatic Triggers

1. **After Package Installation**
   ```bash
   npm install  # Automatically checks for USWDS updates
   ```

2. **During USWDS Sync Workflow**
   ```bash
   npm run uswds:sync  # Includes automated class update
   ```

3. **CI/CD Integration**
   - Skips automatic updates in CI environments
   - Can be explicitly triggered with `--force` flag

### How It Works

1. **Version Detection**: Tracks USWDS version and compares to last processed version
2. **Class Extraction**: Scans SCSS (762 files) and JavaScript (225 files) for class definitions
3. **Validation**: Ensures minimum class count (500+), format validation, compliance testing
4. **Deployment**: Updates production database, saves version marker, generates change summary

### Performance

- **Extraction Time**: ~2-3 seconds for full scan
- **Class Count**: 594 classes (vs 513 previously)
- **Coverage**: 100% of official USWDS classes
- **Update Frequency**: Only when USWDS version changes

---

## USWDS Compliance Automation

### 🎯 Automated Validation System

#### 1. Git Hook Integration (✅ Active)

Every commit automatically validates USWDS compliance:

```bash
# Runs automatically on git commit
🏛️  Validating USWDS alignment for modified components...
🔍 Checking USWDS alignment: src/components/date-picker/usa-date-picker.ts
✅ USWDS alignment validation passed!
```

**What it checks:**
- Modified date picker, combo box, accordion, modal, time picker files
- CSS class compliance (all official USWDS classes)
- **JavaScript behavior compliance** (checks USWDS integration patterns)
- Keyboard navigation patterns (ArrowDown, F4, Enter, Space, Escape)
- Accessibility attributes (ARIA labels, roles)
- Progressive enhancement patterns
- Form integration requirements
- Anti-patterns (Shadow DOM, custom styles, hyphenated property access)

#### 2. Manual Validation Commands

```bash
# Validate specific component
npm run uswds:validate-datepicker

# Validate any component file
npm run uswds:validate-alignment src/components/combo-box/usa-combo-box.ts

# Validate all critical components
npm run uswds:validate-critical

# Direct script execution
node scripts/validate-uswds-compliance.js src/components/date-picker/usa-date-picker.ts
```

### 📋 USWDS Compliance Checklist

#### Required CSS Classes ✅

```typescript
// ✅ REQUIRED: Official USWDS classes only
'usa-date-picker'
'usa-date-picker__button'
'usa-date-picker__calendar'

// ❌ FORBIDDEN: Custom CSS classes
'my-custom-date-picker'
'date-picker-custom-style'
```

#### Keyboard Navigation ⌨️

```typescript
// ✅ REQUIRED: USWDS keyboard patterns
ArrowDown  // Opens calendar (standard)
F4         // Opens calendar (Windows accessibility)
Enter      // Activates button
Space      // Activates button
Escape     // Closes calendar/returns focus
```

#### Accessibility Requirements ♿

```typescript
// ✅ REQUIRED: ARIA attributes
aria-label="Toggle calendar"
aria-haspopup="true"
aria-controls="date-picker-input"
role="dialog"
aria-modal="true"
```

#### Progressive Enhancement 🔄

```typescript
// ✅ REQUIRED: USWDS enhancement pattern
// 1. Start as basic HTML input + button
// 2. Enhance with USWDS JavaScript when available
USWDS.datePicker.on(this);   // Enhancement
USWDS.datePicker.off(this);  // Cleanup

// 3. Fall back to web component behavior
createRenderRoot() { return this as any; } // Light DOM
```

### 🚫 Anti-Patterns (Auto-Detected)

```typescript
// ❌ FORBIDDEN: Shadow DOM breaks USWDS
createShadowRoot()
attachShadow()

// ❌ FORBIDDEN: Custom styling breaks USWDS consistency
.style.backgroundColor = '#custom'

// ❌ FORBIDDEN: Hyphenated property access (JavaScript error)
USWDS.date-picker  // Causes: USWDS.date - picker (subtraction)
USWDS['date-picker']  // ✅ Correct

// ❌ FORBIDDEN: innerHTML usage (security risk)
element.innerHTML = '<div>content</div>'  // Use Lit html templates instead
```

### 🎯 Compliance Scoring

| Score | Level | Description |
|-------|-------|-------------|
| 95-100% | 🏆 Excellent | Perfect USWDS alignment |
| 85-94% | ✅ Good | Minor improvements needed |
| 70-84% | ⚠️ Needs Improvement | Several issues to address |
| <70% | ❌ Poor | Major compliance problems |

**Target:** All critical components must maintain **95%+ compliance** (including JavaScript behavior)

---

## USWDS Compliance Methodology

### 🎯 Core Principles

#### 1. Structural Fidelity

- Components must match official USWDS DOM structure exactly
- CSS classes should use only official USWDS classes
- No custom CSS beyond essential `:host` display styles

#### 2. Update Resilience

- Automated validation catches compliance regressions
- Standardized patterns prevent structural drift
- Clear upgrade path for USWDS version updates

#### 3. Preventive Validation

- Pre-commit hooks validate compliance
- Comprehensive test coverage for all patterns
- **Automated USWDS class list maintenance**
- Real-time USWDS version detection and updates

### 🔧 Established Patterns

#### Form Component Standard Structure

```html
<div class="usa-form-group ${error ? 'usa-form-group--error' : ''}">
  <label class="usa-label ${error ? 'usa-label--error' : ''}" for="input-id">
    Label Text ${required ? html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>` : ''}
  </label>
  <span class="usa-hint" id="input-id-hint">Hint text</span>
  <span class="usa-error-message" id="input-id-error" role="alert">
    <span class="usa-sr-only">Error:</span> Error message
  </span>
  <input class="usa-input ${error ? 'usa-input--error' : ''}" id="input-id" />
</div>
```

#### Key Requirements

1. **Form Group Wrapper**: All form components must have `.usa-form-group` wrapper
2. **Error State Classes**:
   - `.usa-form-group--error` on wrapper
   - `.usa-label--error` on label
   - `.usa-input--error` on input element
3. **Required Field Indicators**: Use `.usa-hint--required` class, not `.usa-label--required`
4. **Element Types**: Use `<span>` for hint and error messages, not `<div>`
5. **ARIA Attributes**: Proper `aria-describedby` and `aria-invalid` support

### ✅ Validation System

#### Automated Compliance Checks

1. **USWDS Class List Automation**: Automatically detects USWDS version changes and updates the class database (592 classes)
2. **Pre-commit Hooks**: `🎯 Validating USWDS compliance...`
3. **Post-Install Detection**: Runs after `npm install` to catch USWDS updates
4. **Component Specs**: Defined in `__tests__/uswds-compliance-utils.ts`
5. **Layout Tests**: Validate DOM structure and CSS classes
6. **Update Monitoring**: `npm run uswds:check-updates`

#### Testing Requirements

Each component must include:

```typescript
// Basic compliance test
import { quickUSWDSComplianceTest } from '../../../__tests__/uswds-compliance-utils.js';

it('should pass USWDS compliance validation', async () => {
  quickUSWDSComplianceTest(element, 'usa-text-input');
});

// Layout structure test
it('should have correct USWDS structure', async () => {
  await element.updateComplete;

  const formGroup = element.querySelector('.usa-form-group');
  const label = element.querySelector('.usa-label');
  const input = element.querySelector('.usa-input');

  expect(formGroup).toBeTruthy();
  expect(label).toBeTruthy();
  expect(input).toBeTruthy();
});
```

### 🔄 Update Management

#### USWDS Version Updates

When new USWDS versions are released:

1. **Check Updates**: `npm run uswds:check-updates`
2. **Validate Compliance**: `npm run uswds:compliance`
3. **Run Full Sync**: `npm run uswds:sync`
4. **Test All Components**: `npm run test:comprehensive`

---

## Initial Value Pattern

### MANDATORY Pattern for Components with Initial Values

All components that accept initial values (date-picker, combo-box, text-input, etc.) **MUST** use the `data-default-value` pattern. This is the **ONLY** approved pattern - do not explore alternatives.

### Pattern Implementation

```typescript
// 1. Store initial value on mount
connectedCallback() {
  super.connectedCallback();

  // MANDATORY: Store original value for USWDS restoration
  if (!this.hasAttribute('data-default-value')) {
    this.setAttribute('data-default-value', this.value || '');
  }
}

// 2. USWDS uses this attribute for restoration
// The date-picker component reads data-default-value to restore values
// DO NOT create custom restoration logic
```

### Why This Pattern?

1. **USWDS-Native**: USWDS components use `data-default-value` internally
2. **No Custom Logic**: Avoids complex restoration implementations
3. **Consistent**: Same pattern across all components
4. **Reliable**: Proven pattern used by USWDS

### Components Requiring This Pattern

- date-picker
- combo-box
- text-input
- textarea
- select
- time-picker
- Any component accepting user input values

### Validation

The compliance system automatically validates this pattern:

```bash
npm run uswds:validate-alignment src/components/date-picker/usa-date-picker.ts
```

---

## Sync Validation

### Purpose

Ensure USWDS-mirrored behavior files stay 100% aligned with official USWDS source code.

### Automated Validation System

#### Pre-commit Hook

Runs automatically before every commit:

- Checks all `*-behavior.ts` files for required metadata
- Validates USWDS source links are accessible
- Warns if `@last-synced` date is >90 days old
- **Blocks commits** if critical validations fail

#### Required Metadata (BLOCKING)

```typescript
/**
 * USWDS [Component] Behavior
 *
 * @uswds-source https://github.com/uswds/uswds/blob/develop/packages/usa-[component]/src/index.js
 * @uswds-version 3.8.0
 * @last-synced 2025-10-05
 * @sync-status ✅ UP TO DATE
 */
```

Every exported function must include:

```typescript
/**
 * [Function name]
 *
 * SOURCE: [USWDS file path] (Lines X-Y)
 */
```

### Manual Sync Checker

```bash
npm run uswds:check-behavior-sync
```

**What it does**:
1. Fetches latest USWDS source from GitHub for each behavior file
2. Compares function signatures and logic
3. Generates diff report showing any USWDS changes
4. Creates `/tmp/uswds-sync-report.md` with update details

### Sync Update Process

When USWDS source changes detected:

1. **Review diff report**: Check `/tmp/uswds-sync-report.md`
2. **Read USWDS changes**: Understand what changed and why
3. **Update behavior file**: Apply changes line-by-line from USWDS source
4. **Update metadata**:
   - Update `@uswds-version` if USWDS upgraded
   - Update `@last-synced` to current date
   - Update `SOURCE:` line numbers if needed
5. **Run tests**: `npm test -- [component].test.ts`
6. **Verify Cypress**: `npm run cypress:run -- --spec "cypress/e2e/[component]-*.cy.ts"`
7. **Update sync status**: Change `@sync-status` to `✅ UP TO DATE`

### Strict Enforcement Rules

**NEVER**:
- ❌ Skip pre-commit hooks with `--no-verify`
- ❌ Add custom logic to behavior files
- ❌ Remove or modify `@uswds-source` metadata
- ❌ Update behavior without checking USWDS source
- ❌ Merge PRs with failing USWDS sync validation

**ALWAYS**:
- ✅ Update `@last-synced` when modifying behavior files
- ✅ Check USWDS source before making changes
- ✅ Run full test suite after USWDS sync updates
- ✅ Document any intentional deviations (there should be ZERO)
- ✅ Keep behavior files in perfect parity with USWDS source

---

## Update Checklist

### When USWDS Releases a New Version

#### Phase 1: Preparation

- [ ] **Check for Updates**: `npm run uswds:check-updates`
- [ ] **Review USWDS Changelog**: Check for breaking changes
- [ ] **Update Dependencies**: `npm install @uswds/uswds@latest`
- [ ] **Update Class Database**: `npm run uswds:update-classes`

#### Phase 2: Validation

- [ ] **Run Compliance Check**: `npm run uswds:compliance`
- [ ] **Check Behavior Sync**: `npm run uswds:check-behavior-sync`
- [ ] **Validate JavaScript**: `npm run uswds:validate-javascript`
- [ ] **Run Full Test Suite**: `npm test`

#### Phase 3: Component Review

- [ ] **Review Critical Components**: date-picker, modal, combo-box, accordion
- [ ] **Check Component Structure**: Verify DOM patterns match USWDS
- [ ] **Validate Accessibility**: Run axe-core tests
- [ ] **Test Interactive Behavior**: Manual testing in Storybook

#### Phase 4: Update Behavior Files

- [ ] **Review Sync Report**: Check `/tmp/uswds-sync-report.md`
- [ ] **Update Changed Functions**: Apply USWDS source changes
- [ ] **Update Metadata**: Version, sync date, line numbers
- [ ] **Run Behavioral Tests**: Verify 100% pass rate

#### Phase 5: Final Validation

- [ ] **Run Comprehensive Tests**: `npm run test:comprehensive`
- [ ] **Run Cypress Tests**: `npm run cypress:run`
- [ ] **Check Bundle Size**: Ensure no significant increase
- [ ] **Test in Storybook**: Verify all stories work correctly

#### Phase 6: Documentation

- [ ] **Update CHANGELOG**: Document USWDS version bump
- [ ] **Update Component READMEs**: Note any behavioral changes
- [ ] **Update Integration Guide**: Document new patterns
- [ ] **Create Migration Guide**: If breaking changes exist

### Quick Validation Commands

```bash
# Complete USWDS sync workflow
npm run uswds:sync

# Individual validation steps
npm run uswds:check-updates
npm run uswds:update-classes
npm run uswds:compliance
npm run uswds:check-behavior-sync
npm run uswds:validate-javascript
```

---

## Related Documentation

- [JavaScript Integration Strategy](./JAVASCRIPT_INTEGRATION_STRATEGY.md)
- [Testing Guide](./guides/TESTING_GUIDE.md)
- [Compliance Guide](./guides/COMPLIANCE_GUIDE.md)
- [Debugging Guide](./DEBUGGING_GUIDE.md)
- [CLAUDE.md](../CLAUDE.md) - Complete development guidelines

---

## Quick Reference

### Essential Commands

```bash
# Debugging
npm run uswds:validate-alignment [component-file]
npm run uswds:validate-javascript

# Class Automation
npm run uswds:update-classes
npm run uswds:extract-classes

# Compliance
npm run uswds:compliance
npm run uswds:validate-critical

# Sync Validation
npm run uswds:check-behavior-sync

# Complete Workflow
npm run uswds:sync
```

### Component Development Checklist

- [ ] Read USWDS source code first
- [ ] Follow USWDS patterns exactly
- [ ] Use data-default-value for initial values
- [ ] Implement required ARIA attributes
- [ ] Add keyboard navigation handlers
- [ ] Document USWDS source references
- [ ] Run compliance validation
- [ ] Write comprehensive tests

---

**Last Updated**: 2025-10-07
**Maintainer**: USWDS Web Components Team
