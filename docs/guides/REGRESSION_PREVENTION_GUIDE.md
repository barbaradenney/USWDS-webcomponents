# USWDS Regression Prevention Guide

This guide documents the comprehensive regression prevention system implemented to prevent USWDS compliance issues from recurring.

## Overview

After fixing critical compliance issues across multiple components (combo-box, date-picker, modal, tooltip), we implemented a multi-layered validation system to ensure these issues never happen again.

## Validation Layers

### 1. Pre-commit Hooks (`.husky/pre-commit`)

**Purpose**: Block commits with compliance violations
**When**: Every git commit
**Coverage**: Modified components only (fast validation)

```bash
# Automatic validation on commit
git commit -m "Your changes"

# Skip validation (not recommended)
git commit --no-verify -m "Emergency commit"
```

**Checks**:
- Light DOM implementation (`createRenderRoot() { return this; }`)
- ARIA attributes in critical components (date-picker, modal, combo-box)
- Keyboard handlers in interactive components
- Component registration conflicts
- Slot rendering patterns
- USWDS integration validation

### 2. CI/CD Pipeline (`.github/workflows/uswds-compliance.yml`)

**Purpose**: Comprehensive validation on all pull requests
**When**: Every PR and push to main
**Coverage**: Full codebase validation

**Workflow Steps**:
1. **Accessibility Gate**: Validates ARIA patterns and keyboard navigation
2. **Component Structure**: Ensures proper USWDS structure compliance
3. **Module Optimization**: Validates Storybook USWDS module configuration
4. **Performance Monitoring**: Checks bundle sizes and optimization
5. **Regression Tests**: Runs comprehensive regression test suite

### 3. Automated Testing (`__tests__/regression-prevention.test.ts`)

**Purpose**: Catch specific regressions we fixed
**When**: Every `npm test` run
**Coverage**: Critical compliance patterns

```bash
# Run regression tests
npm run validate:regression

# Run specific regression categories
npm test -- regression-prevention
```

**Test Categories**:
- **Critical Component Compliance**: Date picker >90%, light DOM, keyboard handlers
- **USWDS Structure Requirements**: ARIA attributes, Shadow DOM prevention
- **Module Optimization**: Storybook configuration integrity
- **Test Infrastructure**: Accessibility testing patterns
- **Performance Gates**: Bundle size limits
- **Documentation Consistency**: README and compliance docs

### 4. Monitoring Scripts

#### Accessibility Gate (`scripts/accessibility-gate.js`)

**Purpose**: Prevent accessibility regressions
**Usage**:
```bash
npm run validate:accessibility-gate
```

**Features**:
- Component-specific thresholds (critical components: 0 violations)
- ARIA pattern validation
- Keyboard navigation verification
- Modified component focus (git-aware)

#### USWDS Module Optimization Monitor (`scripts/monitor-uswds-optimization.js`)

**Purpose**: Ensure Storybook USWDS integration stays optimized
**Usage**:
```bash
npm run validate:uswds-optimization
```

**Validates**:
- `optimizeDeps` configuration in `.storybook/main.ts`
- All required USWDS modules included
- `force: true` setting for cache busting
- CommonJS options for USWDS compatibility

## Validation Commands

### Quick Validation
```bash
# Run all regression prevention checks
npm run validate:compliance-regression

# Run individual checks
npm run validate:regression
npm run validate:accessibility-gate
npm run validate:uswds-optimization
```

### Development Workflow
```bash
# Before committing changes
npm run test                    # Unit tests
npm run typecheck              # TypeScript validation
npm run lint                   # Code quality
npm run validate:regression    # Regression prevention

# Pre-commit hooks run automatically
git commit -m "Fix component issues"
```

### CI/CD Integration
```bash
# Automatically runs on PR
# - Accessibility gate
# - Component structure validation
# - Module optimization monitoring
# - Performance checks
# - Full regression test suite
```

## Common Issues and Fixes

### 1. Missing Light DOM Implementation

**Error**: "Component may be missing light DOM implementation"

**Fix**:
```typescript
// Add to component class
protected override createRenderRoot() {
  return this;
}
```

### 2. Missing ARIA Attributes

**Error**: "Critical component missing ARIA attributes"

**Fix for date-picker**:
```typescript
// Add required ARIA attributes
setAttribute('aria-haspopup', 'dialog');
setAttribute('aria-controls', 'date-picker-dialog');
setAttribute('aria-modal', 'true');
```

**Fix for combo-box**:
```typescript
// Add required ARIA attributes
setAttribute('aria-expanded', 'false');
setAttribute('aria-controls', 'combo-box-list');
setAttribute('aria-labelledby', 'combo-box-label');
```

### 3. Missing Keyboard Handlers

**Error**: "Interactive component missing keyboard handlers"

**Fix**:
```typescript
private handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
    case 'F4':
      // Handle dropdown opening
      break;
    case 'Escape':
      // Handle closing/canceling
      break;
    case 'Enter':
    case ' ':
      // Handle selection
      break;
  }
}
```

### 4. USWDS Module Optimization Issues

**Error**: "Missing USWDS modules in optimization"

**Fix**: Update `.storybook/main.ts`:
```typescript
export default {
  // ...
  viteFinal: async (config) => {
    config.optimizeDeps = {
      include: [
        '@uswds/uswds/js/usa-tooltip',
        '@uswds/uswds/js/usa-modal',
        '@uswds/uswds/js/usa-accordion',
        '@uswds/uswds/js/usa-date-picker',
        '@uswds/uswds/js/usa-combo-box',
        // Add missing modules
      ],
      force: true,
    };
    return config;
  },
};
```

## Component-Specific Requirements

### Critical Components (Zero Violations Allowed)
- **date-picker**: Must maintain >90% compliance, light DOM, ARIA attributes, keyboard navigation
- **modal**: ARIA modal patterns, focus management
- **combo-box**: ARIA expanded/controls/labelledby, proper role="combobox"

### Standard Components (Max 2 Minor Violations)
- All other interactive components
- Must have basic accessibility attributes
- Should follow USWDS structural patterns

### Experimental Components (Max 5 Violations)
- New or in-development components
- Higher tolerance while under active development

## Bypassing Validation (Emergency Only)

### Skip Pre-commit Hooks
```bash
git commit --no-verify -m "Emergency commit"
```

### Skip CI Validation
- Add `[skip ci]` to commit message
- Only use for documentation changes

**⚠️ Warning**: Bypassing validation can introduce regressions. Always run validation manually before merging.

## Monitoring and Reports

### Health Dashboards
- **CI/CD Pipeline**: View validation status on GitHub Actions
- **Test Coverage**: Coverage reports include regression test results
- **Component Status**: Each component's compliance tracked over time

### Alerting
- **Failed Commits**: Pre-commit hooks prevent bad commits
- **CI Failures**: Email notifications for pipeline failures
- **Weekly Reports**: Automated compliance status summaries

## Best Practices

### 1. Component Development
- Always extend `USWDSBaseComponent` or `LitElement`
- Use light DOM for USWDS compatibility
- Add ARIA attributes during development, not as afterthought
- Include keyboard navigation for interactive components

### 2. Testing
- Write regression tests for critical compliance patterns
- Include accessibility tests in component test suites
- Test keyboard navigation in Cypress component tests

### 3. Documentation
- Update component READMEs with compliance requirements
- Document any compliance exceptions with justification
- Keep USWDS links current and accessible

## Troubleshooting

### Validation Failures
1. **Read the error message carefully** - it usually indicates exactly what's missing
2. **Check component README** - contains component-specific requirements
3. **Run individual validation scripts** - isolate the failing check
4. **Review git diff** - see what changed to cause the failure

### Performance Issues
- Regression tests run on every `npm test` - consider running separately for large codebases
- CI pipeline can be optimized by running validation in parallel
- Pre-commit hooks focus on modified files only for speed

### False Positives
- Update validation patterns if USWDS changes
- Adjust thresholds for experimental components
- Document exceptions in component-specific configs

## Future Enhancements

### Planned Improvements
- **Visual Regression Testing**: Automated screenshot comparison
- **Performance Budgets**: Enforce bundle size limits
- **Automated Fixes**: Scripts to automatically fix common violations
- **Compliance Scoring**: Track compliance trends over time

### Integration Opportunities
- **IDE Extensions**: Real-time validation in VS Code
- **Storybook Addons**: Compliance validation in Storybook
- **GitHub Bots**: Automated PR comments with compliance status

---

## ✨ **NEW: Automated Prevention Tools (2025)**

### Auto-Fix Common Issues
```bash
# Fix all components automatically
npm run fix:common-issues

# Fix specific component
npm run fix:common-issues:component -- component-name
```

**Automatically Fixes**:
- Missing `initializeUSWDS()` methods
- Unsafe `innerHTML` manipulation
- TypeScript `firstUpdated()` signatures
- `forEach` typing issues
- Missing light DOM implementation
- Missing PropertyValues imports

### Component Generator with Built-in Compliance
```bash
# Generate presentational component
npm run generate:component -- --name=my-component

# Generate interactive component with USWDS JavaScript
npm run generate:component:interactive -- --name=my-component
```

**Includes Out-of-the-Box**:
- ✅ Proper USWDS JavaScript integration
- ✅ Light DOM rendering
- ✅ Comprehensive test coverage
- ✅ Accessibility validation
- ✅ TypeScript typing
- ✅ Storybook stories
- ✅ Complete documentation

### Enhanced Infrastructure Tests
```bash
# Complete regression prevention validation
npm run validate:regression-prevention

# Individual infrastructure tests
npm run test __tests__/infrastructure/browser-testing-validation.test.ts
npm run test __tests__/infrastructure/uswds-pattern-validation.test.ts
npm run test __tests__/infrastructure/build-environment-validation.test.ts
npm run test __tests__/infrastructure/component-architecture-validation.test.ts
npm run test __tests__/infrastructure/test-success-rate-monitor.test.ts
```

## Regression Testing Framework

### Comprehensive Test Suite

The library includes comprehensive regression prevention tests designed to catch structural and visibility issues.

#### 1. Component Structure Regression Tests

**Purpose**: Prevents specific regressions like the date picker issue where only the label was visible.

**Key Tests**:
- ✅ Validates both label AND input field are present
- ✅ Ensures correct USWDS HTML structure pattern
- ✅ Prevents incorrect nested wrapper structure
- ✅ Checks visual element presence and functionality
- ✅ Validates accessibility attributes
- ✅ Tests specific bug scenario prevention

**Example - Date Picker Structure**:

```typescript
// BAD: This structure breaks the component
<div class="usa-date-picker__wrapper">
  <div class="usa-date-picker">
    <input />
  </div>
</div>

// GOOD: Correct USWDS structure
<div class="usa-date-picker">
  <input />
</div>
```

**Running Tests**:
```bash
# Date picker specific regression tests
npm test __tests__/date-picker-structure-regression.test.ts

# Full structural regression check
npm run test:regression:structural

# Watch mode for development
npm run test:regression:structural:watch
```

#### 2. USWDS Dynamic Structure Validation

**Purpose**: Validates components follow correct patterns for USWDS JavaScript enhancement.

**Validates**:
- ✅ Initial structure requirements for USWDS enhancement
- ✅ Prevention of pre-rendered dynamic elements (avoids conflicts)
- ✅ Correct nesting patterns validation
- ✅ Form group structure requirements
- ✅ USWDS JavaScript compatibility checks
- ✅ Accessibility structure validation

**Component Coverage**: Tests accordion, date-picker, modal, combo-box, file-input, and character-count components.

**Running Tests**:
```bash
# USWDS structure validation
npm test __tests__/uswds-dynamic-structure-validation.test.ts
```

#### 3. Visual Regression Prevention

**Purpose**: Catches when components become invisible or poorly rendered.

**Features**:
- ✅ Component visibility detection (prevents "label-only" issues)
- ✅ Layout integrity validation
- ✅ Critical element presence validation
- ✅ Storybook rendering verification
- ✅ Property update handling without visual loss

**Visibility Tests**: Validates components have visible elements with actual dimensions, not just DOM presence.

**Running Tests**:
```bash
# Visual regression prevention
npm test __tests__/visual-regression-prevention.test.ts
```

### Test Results and Coverage

**Date Picker Structure Regression Test**:
- **14 tests** covering all aspects of date picker structure
- **100% pass rate** on corrected implementation
- **Specific regression scenario** tested and prevented

**USWDS Dynamic Structure Validation**:
- **9 tests** validating USWDS JavaScript integration patterns
- **6 components** covered (interactive USWDS components)
- **Multi-layer validation** from initial structure to enhancement compatibility

**Visual Regression Prevention**:
- **8 tests** ensuring components remain visible and functional
- **DOM + Visual validation** (not just DOM presence)
- **Storybook compatibility** testing

---

## Timing Regression Testing

### Overview

Comprehensive Cypress component tests specifically targeting timing and initialization issues across all interactive USWDS components.

**Purpose**: Prevent double-click bugs, race conditions, and USWDS initialization failures

### Coverage

**170 timing regression tests** across **11 components** in 3 phases:

#### Phase 1: Critical Priority (93% success)
- Modal, Combo Box, Time Picker, File Input, Date Picker
- 70/75 tests passing, 5 skipped
- Focus: Complex DOM transformations, multi-step initialization

#### Phase 2: High Priority (14% → 100%)
- Tooltip, Table, Character Count
- 6/44 → ~44/44 tests after fixes
- Focus: Missing `.init()` calls, incorrect USWDS method usage

#### Phase 3: Medium Priority (Expected ~100%)
- Header, Search, Banner
- 51 tests with preemptive fixes
- Focus: Standard toggle/accordion patterns

### What These Tests Check

1. **First Interaction Timing** - Component responds on FIRST click/hover/focus (no double-click bugs)
2. **Race Condition Prevention** - Rapid property changes don't break component
3. **USWDS DOM Creation** - Required elements created correctly (triggers, buttons, status messages)
4. **Accessibility Compliance** - ARIA attributes set and update properly
5. **Keyboard Navigation** - Works on first interaction
6. **Event Handler Duplication** - No duplicate handlers on re-initialization

### Test Files

Located alongside components:
```
src/components/[component]/usa-[component]-timing-regression.component.cy.ts
```

Examples:
- `src/components/modal/usa-modal-timing-regression.component.cy.ts`
- `src/components/tooltip/usa-tooltip-timing-regression.component.cy.ts`
- `src/components/header/usa-header-timing-regression.component.cy.ts`

### Running Timing Tests

```bash
# Run all Cypress component tests (includes timing regression)
npm run cypress:run

# Run specific component timing test
npx cypress run --component --spec "src/components/modal/usa-modal-timing-regression.component.cy.ts"

# Interactive mode for debugging
npm run cypress:open
```

### Common Timing Patterns Fixed

All components now follow this proven initialization pattern:

```typescript
private initializationInProgress = false;

private async initializeUSWDSComponent() {
  if (this.initializationInProgress || this.initialized) return;
  this.initializationInProgress = true;

  try {
    await this.updateComplete;
    // CRITICAL: Wait for DOM stability
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
    await initializeUSWDSComponent(element, 'component-name');
    this.initialized = true;
  } catch (error) {
    console.warn('Initialization failed:', error);
  } finally {
    this.initializationInProgress = false;
  }
}
```

### Key Learnings

1. **`.init()` vs `.on()` matters** - Check USWDS source to use correct method
2. **`requestAnimationFrame()` is essential** - DOM must be stable before USWDS init
3. **Race condition flags prevent bugs** - `initializationInProgress` pattern works
4. **Preemptive fixes save time** - Phase 3 avoided Phase 2-style failures
5. **Comprehensive testing catches issues early** - Found critical bugs before production

---

## Flaky Test Detection

### Overview

Automatically detect unreliable tests by running them multiple times.

### Usage

```bash
npm run test:run -- --flaky              # Default (10 runs)
npm run test:run -- --flaky --runs=20    # 20 runs
npm run test:run -- --flaky --verbose    # Detailed output
```

### How it Works

- Runs each test N times
- Tracks pass/fail rate
- Reports tests with <100% pass rate
- Creates GitHub issues for flaky tests

### Benefits

- ✅ Identifies intermittent failures
- ✅ Tracks reliability trends
- ✅ Automated issue creation
- ✅ Helps maintain test suite quality

---

## Quick Reference

```bash
# Structural Regression Prevention
npm run test:regression:structural            # All structural tests
npm test __tests__/date-picker-structure-regression.test.ts
npm test __tests__/uswds-dynamic-structure-validation.test.ts
npm test __tests__/visual-regression-prevention.test.ts

# Timing Regression Testing
npm run cypress:run                           # All timing tests
npx cypress run --component --spec "src/components/modal/usa-modal-timing-regression.component.cy.ts"

# Flaky Test Detection
npm run test:run -- --flaky                   # Detect unreliable tests

# NEW: Prevention and auto-fix tools
npm run fix:common-issues                     # Auto-fix recurring issues
npm run generate:component -- --name=foo      # Generate compliant component
npm run validate:regression-prevention        # Full infrastructure validation

# Original validation commands
npm run validate:compliance-regression        # Run all checks
npm run validate:regression                   # Regression tests only
npm run validate:accessibility-gate           # Accessibility validation
npm run validate:uswds-optimization           # Module optimization check

# Emergency bypasses (use sparingly)
git commit --no-verify                        # Skip pre-commit
# Add [skip ci] to commit message              # Skip CI validation
```

---

## Best Practices for Regression Prevention

### 1. Always Test Structure Changes

When modifying component HTML structure:
```bash
npm run test:regression:structural
```

### 2. Validate USWDS Compliance

Ensure changes don't break USWDS JavaScript enhancement:
```bash
npm run test:uswds:integration
```

### 3. Visual Verification

Check that components remain visible in Storybook after structural changes.

### 4. Follow USWDS Patterns

Reference official USWDS documentation for correct HTML structure patterns.

### 5. Test Timing Critical Components

For interactive components, run timing regression tests:
```bash
npm run cypress:run
```

---

## Success Metrics

✅ **Zero structural regressions** since implementation
✅ **Automated detection** of component visibility issues
✅ **Fast feedback** for developers (< 3 seconds test runtime)
✅ **Comprehensive coverage** of critical interactive components
✅ **Easy debugging** with specific error messages
✅ **170+ timing tests** preventing initialization issues
✅ **Flaky test detection** maintaining test suite reliability

This comprehensive system ensures that the compliance issues we fixed in combo-box, date-picker, modal, tooltip, and button-group components never happen again. **The new automated tools prevent issues before they occur, rather than just detecting them after.**

---

**Last Updated**: Phase 2 Documentation Consolidation (October 2025)

**Replaces**:
- Original `REGRESSION_PREVENTION_GUIDE.md`
- `REGRESSION_PREVENTION_SYSTEM.md`
- `REGRESSION_TESTING_SYSTEM.md`
- `REGRESSION_DETECTION.md`
- `TEST_HEALTH_VALIDATION.md`
- `TIMING_REGRESSION_TESTING.md`
- `FLAKY_TEST_DETECTION.md`