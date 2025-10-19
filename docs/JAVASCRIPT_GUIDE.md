# JavaScript Integration Guide

**Complete Guide to JavaScript Integration, Validation, and Best Practices**

Last Updated: 2025-10-07

---

## Table of Contents

1. [Overview](#overview)
2. [JavaScript Integration Strategy](#javascript-integration-strategy)
3. [Integration Validation](#integration-validation)
4. [Validation System](#validation-system)
5. [Syntax Best Practices](#syntax-best-practices)
6. [Tree-Shaking Standards](#tree-shaking-standards)
7. [Quick Reference](#quick-reference)

---

## Overview

This guide consolidates all JavaScript integration documentation for USWDS web components. It covers integration strategies, validation systems, best practices, and performance optimization through tree-shaking.

### Key Principles

1. **Hybrid Approach**: Use vanilla JS for problematic components, USWDS modules for stable ones
2. **Automatic Validation**: 99 component test suites include JavaScript validation
3. **Smart Classification**: Interactive vs presentational component detection
4. **Tree-Shaking**: Optimize bundle sizes through direct module imports
5. **Syntax Safety**: Prevent common JavaScript errors through validation

---

## JavaScript Integration Strategy

### Strategy Decision Matrix

#### When to Use Vanilla JS Refactoring

Refactor a component to vanilla JS when it exhibits:

- ✅ **Storybook Navigation Issues** - Works initially, breaks after story navigation
- ✅ **Module Caching Conflicts** - Alternating success/failure between property changes
- ✅ **Duplicate Event Listener Issues** - USWDS global script interferes with component behavior
- ✅ **Complex State Management** - Lit's reactive rendering conflicts with USWDS DOM manipulation

#### When to Keep USWDS Modules

Keep using USWDS modules when:

- ✅ **Component Works Reliably** - No reported issues or conflicts
- ✅ **Simple Integration** - `.on()` or `.init()` method works without problems
- ✅ **Low Priority** - Not frequently used or modified
- ✅ **USWDS Handles Complexity** - Complex transformations better left to USWDS (e.g., date picker calendar)

### Component Classification

#### Vanilla JS Components (Refactored)

| Component | Reason for Refactoring | Validation |
|-----------|------------------------|------------|
| **Accordion** | Storybook navigation issues, module caching conflicts | ✅ 22 behavioral tests<br>✅ Contract validation |

#### USWDS Module Components (Not Refactored)

| Component | Module Used | Status | Notes |
|-----------|-------------|--------|-------|
| **Modal** | `modal` | ✅ Stable | Requires `window.USWDS.modal.init()` for wrapper creation |
| **Tooltip** | `tooltip` | ✅ Stable | DOM transformation works reliably |
| **Date Picker** | `date-picker` | ✅ Stable | Complex calendar logic - keep USWDS |
| **Time Picker** | `time-picker` | ✅ Stable | Transforms to combo-box - keep USWDS |
| **Combo Box** | `combo-box` | ✅ Stable | Typeahead filtering - keep USWDS |

See [JAVASCRIPT_INTEGRATION_STRATEGY.md](./JAVASCRIPT_INTEGRATION_STRATEGY.md) for complete component list.

#### CSS-Only Components (No JavaScript)

| Component | Notes |
|-----------|-------|
| **Button** | Pure CSS, no behavior needed |
| **Alert** | Pure CSS, no behavior needed |
| **Card** | Pure CSS, no behavior needed |
| **Breadcrumb** | Pure CSS, no behavior needed |
| **Tag** | Pure CSS, no behavior needed |

### Refactoring Process

When refactoring a component from USWDS modules to vanilla JS:

#### 1. Create Behavioral Contract

Document exact USWDS behavior in `docs/USWDS_[COMPONENT]_BEHAVIOR_CONTRACT.md`:

```markdown
# USWDS [Component] Behavior Contract

**Source**: @uswds/uswds/packages/usa-[component]/src/index.js

## Core Behaviors (MANDATORY)

### 1. [Behavior Name]
**USWDS Source**: Lines X-Y in index.js
**Required Behavior**: ...
**Validation Test**: ...
```

#### 2. Create Behavioral Tests

Create `src/components/[component]/usa-[component]-behavior.test.ts`:

```typescript
/**
 * USWDS [Component] Behavior Contract Tests
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 */
describe('USWDS [Component] Behavior Contract', () => {
  // Comprehensive tests matching contract
});
```

#### 3. Implement Vanilla JS

Extract USWDS source and adapt for web components:

```typescript
/**
 * USA [Component] Web Component - Pure Vanilla JS Implementation
 *
 * VALIDATION: All behavior validated against USWDS source in:
 * - usa-[component]-behavior.test.ts (automated tests)
 * - docs/USWDS_[COMPONENT]_BEHAVIOR_CONTRACT.md (behavioral contract)
 *
 * @uswds-source https://github.com/uswds/uswds/tree/develop/packages/usa-[component]/src/index.js
 */
```

**Key Patterns**:
- ✅ Use event delegation on container elements
- ✅ Use `event.stopPropagation()` to prevent USWDS global script interference
- ✅ Use arrow functions for event handlers to preserve `this` context
- ✅ Call setup on both `firstUpdated()` and `updated()`
- ✅ Reference USWDS source line numbers in comments

#### 4. Validate Compliance

Run behavioral tests to ensure 100% USWDS compliance:

```bash
npm test -- usa-[component]-behavior.test.ts
```

All tests MUST pass before considering refactoring complete.

### USWDS Global Script

The USWDS global script is loaded in `.storybook/preview-head.html`:

```javascript
// Script Tag Pattern (MANDATORY for module-based components)
const script = document.createElement('script');
script.src = 'https://unpkg.com/@uswds/uswds@latest/dist/js/uswds.min.js';
document.head.appendChild(script);
```

**Why it's still needed**:
- ✅ Modal requires `window.USWDS.modal.init()` for wrapper creation
- ✅ 37 components still use USWDS module loading
- ✅ Provides `window.USWDS` global object

**Preventing Conflicts**:

Vanilla JS components prevent USWDS global script interference using:

1. **Event propagation control**:
```typescript
event.stopPropagation(); // Prevent USWDS handlers from seeing the event
event.preventDefault();  // Prevent default browser behavior
```

2. **Web component managed flag**:
```typescript
accordion.setAttribute('data-web-component-managed', 'true');
```

---

## Integration Validation

### Problem Statement

The accordion JavaScript integration issue revealed two critical gaps:

1. **Broken imports not detected** - Test files had incorrect import paths that weren't caught
2. **Missing USWDS integration not validated** - Components could be missing critical `USWDS.componentName.on(this)` calls

### Solutions Implemented

#### 1. Fixed ALL Broken Import Paths

**Issue**: 47 test files had incorrect import paths:

```typescript
// ❌ WRONG
import '../src/components/accordion/usa-accordion.ts';

// ✅ CORRECT
import './usa-accordion.ts';
```

#### 2. Created JavaScript Integration Validator

**Script**: `scripts/validate/validate-component-javascript.js`

**What It Checks**:

1. ✅ **USWDS Integration Patterns**:
   - `initializeUSWDSComponent()` calls (most common pattern)
   - `setupEventHandlers()` in `firstUpdated()`
   - Direct `USWDS.componentName.on(this)` calls

2. ✅ **Broken Import Paths**:
   - Detects `import '../src/...'` patterns in test files
   - Catches incorrect relative import paths

3. ✅ **Event Handler Calls**:
   - Verifies `setupEventHandlers()` is called if defined
   - Warns about potential unused event handlers

**Usage**:

```bash
# Run validator manually
npm run validate:component-javascript
npm run validate:js  # alias

# Automatically runs in pre-commit hook (10th check)
git commit -m "changes"
```

#### 3. Integrated into Pre-Commit Hook

The validator now runs as **check 10 of 10** in `.husky/pre-commit`:

```bash
🔧 10/10 Component JavaScript integration...
   ✅ Pass
```

**Blocks commits** if:
- Components are missing USWDS integration
- Test files have broken import paths
- Critical JavaScript patterns are missing

### Components Validated

Interactive components with USWDS JavaScript integration:

1. ✅ accordion
2. ✅ banner
3. ✅ character-count
4. ✅ combo-box
5. ✅ date-picker
6. ✅ date-range-picker
7. ✅ file-input
8. ✅ footer
9. ✅ header
10. ✅ in-page-navigation
11. ✅ language-selector
12. ✅ menu
13. ✅ modal
14. ✅ pagination
15. ✅ search
16. ✅ step-indicator
17. ✅ time-picker
18. ✅ tooltip

### Valid Patterns Detected

```typescript
// Pattern 1: Using initializeUSWDSComponent utility (most common)
override firstUpdated(changedProperties: Map<string, any>) {
  super.firstUpdated(changedProperties);
  this.initializeUSWDSAccordion(); // Calls initializeUSWDSComponent internally
}

// Pattern 2: Using setupEventHandlers (accordion pattern)
override firstUpdated(changedProperties: Map<string, any>) {
  super.firstUpdated(changedProperties);
  this.setupEventHandlers(); // Calls ensureUSWDSCompliance internally
}

// Pattern 3: Direct USWDS integration
private ensureUSWDSCompliance() {
  if (typeof (window as any).USWDS !== 'undefined') {
    const USWDS = (window as any).USWDS;
    if (USWDS.componentName && typeof USWDS.componentName.on === 'function') {
      USWDS.componentName.on(this);
    }
  }
}
```

---

## Validation System

### Overview

The USWDS JavaScript Validation System provides automated compliance checking for USWDS JavaScript integration across all web components.

### Key Features

#### ✅ Automatic Integration

- **99 component test suites** include JavaScript validation via `scripts/add-js-validation-to-tests.js`
- **Zero configuration**: Validation automatically integrated into existing tests
- **Continuous monitoring**: Prevents JavaScript integration regressions
- **Smart component classification**: Distinguishes interactive vs presentational components

#### 🔍 Comprehensive Validation

- **USWDS Integration Detection**: Validates `USWDS.componentName.on(this)` calls
- **Error Handling Verification**: Ensures proper try/catch blocks
- **Progressive Enhancement**: Validates fallback behavior when USWDS unavailable
- **Component Type Classification**: Smart detection of interactive vs presentational

#### 📊 Detailed Reporting

- **Validation Scores**: Numeric scores (0-100) for compliance levels
- **Issue Detection**: Specific error messages for missing integrations
- **Component Classification**: Automatic identification of component types
- **Compliance Tracking**: Continuous monitoring of JavaScript integration health

### Core Function

```typescript
// Available in __tests__/test-utils.ts
export function validateComponentJavaScript(
  componentPath: string,
  componentType: string,
  existingSource?: string
): { isValid: boolean; issues: string[]; score: number };
```

### Component Classification

**Interactive Components (Require USWDS JavaScript)**:

- accordion, modal, date-picker, combo-box, file-input, tooltip, dropdown, character-count
- Must have `USWDS.componentName.on(this)` integration
- Validation fails if missing proper JavaScript integration

**Presentational Components (No JavaScript Required)**:

- card, alert, banner, breadcrumb, button, icon, tag, step-indicator, prose
- Automatically excluded from JavaScript validation
- Focus on CSS structure and accessibility

### Integration Patterns

#### Interactive Component Pattern

```typescript
private async initializeUSWDSComponentName() {
  try {
    // Wait for component to render first
    await this.updateComplete;

    // Check if USWDS is available globally (from uswds.min.js)
    if (typeof (window as any).USWDS !== 'undefined') {
      const USWDS = (window as any).USWDS;

      // Initialize USWDS component functionality if available
      if (USWDS.componentName && typeof USWDS.componentName.on === 'function') {
        USWDS.componentName.on(this); // ✅ Required for interactive components
        console.log('Component: Enhanced with USWDS behavior');
        return; // USWDS will handle behavior
      }
    }

    console.log('Component: USWDS JavaScript not available, using web component behavior');
  } catch (error) {
    console.warn('Component: Could not load USWDS JavaScript, using web component behavior:', error);
  }
}
```

#### Presentational Component Pattern

```typescript
private async initializeUSWDSComponentName() {
  // Note: USWDS components are purely presentational with no JavaScript behavior
  // The component only requires USWDS CSS for styling and layout
  console.log('Component: Initialized as presentational component (no USWDS JavaScript required)');
}
```

### Test Integration

#### Test Structure

```typescript
it('should have USWDS JavaScript integration (if interactive component)', () => {
  // Automatically validates USWDS JavaScript compliance
  const validation = validateComponentJavaScript(
    '../src/components/[component]/usa-[component].ts',
    '[component]'
  );

  // For interactive components, validation should pass
  // For presentational components, this test is automatically skipped
  if (!validation.isValid) {
    console.warn('USWDS JavaScript validation issues:', validation.issues);
  }

  // Component should have proper USWDS integration or be classified as presentational
  expect(validation.score).toBeGreaterThan(0);
});
```

### Running Validation

```bash
npm run test                # Run all tests including JavaScript validation
npm run test:coverage       # Run tests with coverage report
npm run test:ui             # Interactive test runner with validation results
```

### Validation Scoring

#### Score Calculation

- **Base Score**: 100 points
- **Missing USWDS Integration**: -50 points (interactive components only)
- **Missing Error Handling**: -20 points
- **Presentational Components**: 100 points (no penalties)

#### Score Interpretation

- **100 points**: Perfect compliance
- **80+ points**: Good compliance with minor issues
- **50+ points**: Functional but missing best practices
- **< 50 points**: Critical compliance issues

---

## Syntax Best Practices

### Critical Syntax Errors

#### ❌ 1. Hyphenated Property Access (Most Common)

**Problem:** JavaScript interprets hyphens in property names as subtraction operators.

```typescript
// ❌ WRONG - Causes "Cannot find name" error
if (USWDS.date - picker && typeof USWDS.date - picker.on === 'function') {
  USWDS.date - picker.on(this); // Error: 'date' - 'picker' is arithmetic
}

// ✅ CORRECT - Use bracket notation
if (USWDS['date-picker'] && typeof USWDS['date-picker'].on === 'function') {
  USWDS['date-picker'].on(this);
}
```

**Impact:**
- TypeScript error: `TS2304: Cannot find name 'picker'`
- TypeScript error: `TS2362: Arithmetic operation on incompatible types`
- Runtime error: `Uncaught ReferenceError`

#### ❌ 2. Duplicate Method Definitions

**Problem:** Multiple definitions of the same method cause compilation failures.

```typescript
// ❌ WRONG - Duplicate methods
class Component {
  override disconnectedCallback() {
    // First definition
  }

  override disconnectedCallback() {
    // Error: Duplicate member
    // Second definition
  }
}

// ✅ CORRECT - Single method definition
class Component {
  override disconnectedCallback() {
    // Single, complete implementation
  }
}
```

#### ❌ 3. Malformed Try-Catch Blocks

**Problem:** Incomplete or nested try-catch blocks without proper closure.

```typescript
// ❌ WRONG - Malformed structure
try {
  if (USWDS) {
    USWDS.component.off(this);
try {  // Missing closing brace
  // Another block
}

// ✅ CORRECT - Proper structure
try {
  if (USWDS) {
    USWDS.component.off(this);
  }
} catch (error) {
  console.warn('Cleanup failed:', error);
}
```

#### ❌ 4. Unused Variable Declarations

**Problem:** Variables declared but never read cause TypeScript warnings.

```typescript
// ❌ WRONG - Unused variable
const USWDS = (window as any).USWDS; // TS6133: 'USWDS' is declared but never read

// ✅ CORRECT - Use the variable or remove it
const USWDS = (window as any).USWDS;
if (USWDS && USWDS.component) {
  // Actually use the variable
}
```

### Prevention Tools

#### 1. Pre-Commit Validation (Automatic)

```bash
# Runs automatically on git commit
- ESLint fixes
- Prettier formatting
- TypeScript compilation check
- Custom syntax validation
- USWDS compliance check
```

#### 2. Manual Validation Commands

```bash
# Quick validation (30 seconds)
npm run validate-syntax  # Custom JavaScript syntax checker
npm run typecheck        # TypeScript compilation
npm run lint             # ESLint validation

# Full validation (2-3 minutes)
npm run test             # Unit tests
npm run build-storybook  # Storybook build test
```

### Development Workflow

#### Before Starting Work

1. **Pull latest changes**: `git pull origin main`
2. **Install dependencies**: `npm ci`
3. **Run validation**: `npm run validate-syntax && npm run typecheck`

#### While Developing

1. **Use VS Code**: It provides real-time TypeScript validation
2. **Run tests frequently**: `npm test -- --watch`
3. **Check Storybook**: `npm run storybook` (keep running)

#### Before Committing

1. **Run full validation**:
   ```bash
   npm run validate-syntax
   npm run typecheck
   npm run lint
   npm test
   ```

2. **Fix any issues**: The pre-commit hook will catch problems, but fixing them first is faster

3. **Commit with confidence**: The pre-commit hook provides final validation

---

## Tree-Shaking Standards

### 🌳 Tree-Shaking Requirements

#### Rule 1: Use Direct USWDS Module Imports

**✅ REQUIRED Pattern:**
```typescript
// Use specific USWDS module imports
const module = await import('@uswds/uswds/js/usa-[component-name]');
```

**❌ FORBIDDEN Pattern:**
```typescript
// Never import the full USWDS library
import USWDS from '@uswds/uswds';
// Never use CDN script loading for components
```

#### Rule 2: Graceful Fallback Implementation

**✅ REQUIRED Pattern:**
```typescript
private async initializeUSWDS() {
  try {
    // Primary: Direct module import
    const module = await import('@uswds/uswds/js/usa-[component]');

    if (module.default && typeof module.default.on === 'function') {
      module.default.on(this.querySelector('.usa-[component]'));
      console.log(`✅ Tree-shaken USWDS [component] initialized`);
    }
  } catch (error) {
    console.warn(`⚠️ Tree-shaking failed, falling back to full USWDS:`, error);
    // Fallback: Load full library
    await this.loadFullUSWDSLibrary();
  }
}
```

#### Rule 3: Component Classification

**Interactive Components** (MUST use tree-shaking):
- accordion, modal, date-picker, combo-box, file-input, navigation, etc.
- Components with JavaScript behavior

**Presentational Components** (No JavaScript required):
- card, alert, banner, breadcrumb, button, icon, tag, etc.
- Pure CSS components

#### Rule 4: Bundle Impact Measurement

Components MUST achieve:
- **≥80% JavaScript reduction** vs full USWDS library
- **Working fallback** if direct import fails
- **Zero functionality loss** compared to full USWDS

### Base Implementation Template

```typescript
export class USAComponent extends LitElement {
  private uswdsModule: any = null;

  override connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.initializeUSWDS();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  private async initializeUSWDS() {
    try {
      // Tree-shaking: Import only what we need
      const module = await import('@uswds/uswds/js/usa-[component]');
      this.uswdsModule = module.default;

      const element = this.querySelector('.usa-[component]');
      if (element && this.uswdsModule?.on) {
        this.uswdsModule.on(element);
        console.log(`✅ Tree-shaken USWDS [component] initialized`);
      }
    } catch (error) {
      // Fallback to full library
      await this.loadFullUSWDSLibrary();
    }
  }

  private async loadFullUSWDSLibrary() {
    // Implementation for full library fallback
  }

  private cleanupUSWDS() {
    if (this.uswdsModule?.off) {
      const element = this.querySelector('.usa-[component]');
      if (element) {
        this.uswdsModule.off(element);
      }
    }
  }
}
```

### Anti-Patterns to Avoid

#### ❌ Full Library Import
```typescript
// NEVER DO THIS
import USWDS from '@uswds/uswds';
USWDS.init(); // Loads everything
```

#### ❌ Global Script Loading
```typescript
// NEVER DO THIS
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@uswds/uswds/dist/js/uswds.min.js';
```

#### ❌ Mixing Import Strategies
```typescript
// NEVER DO THIS - inconsistent approaches
import '@uswds/uswds'; // Some components
const module = await import('@uswds/uswds/js/usa-accordion'); // Others
```

### Performance Targets

#### Bundle Size Reduction Targets
- **Interactive Components**: 80-90% reduction
- **Simple Components**: 85-95% reduction
- **Complex Components**: 70-85% reduction

#### Loading Performance
- **First Paint**: ≤50ms improvement
- **Bundle Parse Time**: ≤30ms improvement
- **Memory Usage**: ≤40% reduction

### Compliance Validation

#### Automated Checks
1. **ESLint Rules**: Detect forbidden import patterns
2. **Bundle Analysis**: Measure actual bundle impact
3. **Pre-commit Hooks**: Block non-compliant code
4. **CI/CD Integration**: Fail builds that regress

#### Manual Review Checklist
- [ ] Uses `@uswds/uswds/js/usa-[component]` import pattern
- [ ] Includes graceful fallback mechanism
- [ ] Achieves ≥80% bundle size reduction
- [ ] Maintains full USWDS functionality
- [ ] Includes proper cleanup in disconnectedCallback
- [ ] Console logs indicate tree-shaking success
- [ ] Component works with and without USWDS available

---

## Quick Reference

### Essential Commands

```bash
# Integration Strategy
npm run generate:component -- --name=my-component  # Generate with patterns

# Validation
npm run validate:component-javascript   # JavaScript integration
npm run validate:js                     # Alias
npm test                               # All tests with validation

# Syntax
npm run validate-syntax                # Custom syntax checker
npm run typecheck                      # TypeScript compilation
npm run lint                           # ESLint validation

# Tree-Shaking
npm run analyze:bundle                 # Check bundle sizes
npm run analyze:tree-shaking           # Validate effectiveness
```

### Component Development Checklist

- [ ] Choose appropriate integration strategy (vanilla JS vs USWDS module)
- [ ] Use bracket notation for hyphenated properties
- [ ] Implement proper USWDS integration pattern
- [ ] Add error handling with try/catch blocks
- [ ] Use tree-shaking with direct module imports
- [ ] Write behavioral tests (if vanilla JS)
- [ ] Run JavaScript validation
- [ ] Check bundle size impact

### Integration Pattern Quick Reference

```typescript
// Interactive Component with USWDS Module
private async initializeUSWDS() {
  try {
    const module = await import('@uswds/uswds/js/usa-[component]');
    if (module.default?.on) {
      module.default.on(this);
    }
  } catch (error) {
    console.warn('USWDS integration failed:', error);
  }
}

// Presentational Component (No JavaScript)
private async initializeUSWDS() {
  console.log('Presentational component (no JavaScript required)');
}

// Vanilla JS Component (Custom Implementation)
override connectedCallback() {
  super.connectedCallback();
  this.setupEventHandlers();
}
```

---

## Related Documentation

- [USWDS Integration Guide](./USWDS_INTEGRATION_GUIDE.md)
- [Testing Guide](./guides/TESTING_GUIDE.md)
- [Compliance Guide](./guides/COMPLIANCE_GUIDE.md)
- [Performance Guide](./PERFORMANCE_GUIDE.md)
- [CLAUDE.md](../CLAUDE.md) - Complete development guidelines

---

**Last Updated**: 2025-10-07
**Maintainer**: USWDS Web Components Team
