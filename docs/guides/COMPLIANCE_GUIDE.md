# USWDS Compliance Guide

**Complete reference for maintaining 100% USWDS compliance**

This guide consolidates all compliance and USWDS-related documentation.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Compliance Standards](#compliance-standards)
3. [Validation System](#validation-system)
4. [USWDS Integration](#uswds-integration)
5. [JavaScript Compliance](#javascript-compliance)
6. [CSS Compliance](#css-compliance)
7. [Architecture Compliance](#architecture-compliance)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Run Compliance Validation (Recommended)

```bash
# Validate everything
npm run validate

# Validate specific aspect
npm run validate -- --uswds           # USWDS HTML/CSS
npm run validate -- --javascript      # JS integration
npm run validate -- --accessibility   # Accessibility
npm run validate -- --architecture    # Architecture patterns

# Component-specific
npm run validate -- --component=accordion

# Auto-fix issues
npm run validate -- --all --fix
```

###Legacy Commands

```bash
npm run uswds:check-updates     # Check for USWDS updates
npm run uswds:update-classes    # Update USWDS class database
npm run uswds:sync              # Complete update workflow
```

---

## Compliance Standards

### 100% USWDS Compliance Achievement

**Status**: 46 out of 46 components fully compliant ✅

**Standards Maintained**:
1. ✅ **Single CSS Import**: All components use `import '../../styles/styles.css'`
2. ✅ **Official USWDS Classes Only**: No custom CSS classes
3. ✅ **Light DOM Rendering**: Maximum USWDS compatibility
4. ✅ **Minimal Host Styles**: Only essential `:host { display: ... }` properties
5. ✅ **Direct Class Application**: USWDS classes applied via `updateClasses()` method
6. ✅ **Script Tag Pattern**: USWDS loaded globally via script tag
7. ✅ **JavaScript Integration**: Interactive components use USWDS.*.on()

### Compliance Metrics

- **Components Reviewed**: 46/46
- **Custom CSS Removed**: 300+ lines eliminated
- **Tests Passing**: 2301/2301
- **Accessibility Compliance**: 100% (axe-core validation)
- **USWDS Class Alignment**: 592 classes tracked and validated

---

## Validation System

### Unified Compliance Checker

Single consolidated validation system replacing 60+ individual scripts.

**File**: `scripts/validate/compliance-checker.js`

### Validation Categories

#### 1. USWDS HTML/CSS Compliance

Validates official USWDS patterns and classes.

```bash
npm run validate -- --uswds
```

**Checks**:
- ✅ Official USWDS CSS import present
- ✅ No custom CSS beyond `:host` display/contain
- ✅ Light DOM rendering (no Shadow DOM)
- ✅ Uses USWDS CSS classes in templates
- ✅ Proper HTML structure matching USWDS

**Example Passing Component**:
```typescript
import '../../styles/styles.css';  // ✅ Official CSS

static override styles = css`
  :host {
    display: block;  // ✅ Minimal :host styles only
  }
`;

render() {
  return html`
    <button class="usa-button">  // ✅ USWDS class
      <slot></slot>
    </button>
  `;
}
```

#### 2. Component Structure

Validates required files and organization.

```bash
npm run validate -- --structure
```

**Required Files**:
- ✅ `usa-[component].ts` - Implementation
- ✅ `usa-[component].test.ts` - Unit tests
- ✅ `usa-[component].stories.ts` - Storybook stories
- ✅ `README.mdx` - Documentation
- ✅ `index.ts` - Exports

#### 3. JavaScript Integration

Validates USWDS JavaScript integration for interactive components.

```bash
npm run validate -- --javascript
```

**Interactive Components** (require USWDS.*.on()):
- accordion, combo-box, date-picker, date-range-picker
- file-input, modal, time-picker, character-count
- header, banner, search, tooltip, in-page-navigation

**Presentational Components** (no JS needed):
- card, alert, button, tag, badge, icon, etc.

**Example Compliant Integration**:
```typescript
override firstUpdated() {
  super.firstUpdated();

  // ✅ USWDS JavaScript integration
  const element = this.querySelector('.usa-modal');
  if (element && window.USWDS?.modal) {
    window.USWDS.modal.on(element);
  }
}
```

#### 4. CSS Compliance

Validates no custom styling beyond USWDS.

```bash
npm run validate -- --css
```

**Rules**:
- ❌ **NO** custom colors
- ❌ **NO** custom fonts
- ❌ **NO** custom spacing (use USWDS utilities)
- ❌ **NO** recreating USWDS patterns
- ✅ **YES** `:host { display: block; }` (minimal)
- ✅ **YES** `:host { contain: content; }` (performance)

**Violations**:
```typescript
// ❌ WRONG - Custom CSS
static styles = css`
  .custom-class {
    color: red;
    margin: 10px;
  }
`;

// ✅ CORRECT - USWDS classes only
render() {
  return html`
    <div class="text-primary margin-1">
      Content
    </div>
  `;
}
```

#### 5. Accessibility Compliance

Validates WCAG 2.1 AA accessibility standards.

```bash
npm run validate -- --accessibility
```

**Checks**:
- ✅ axe-core tests present in unit tests
- ✅ Proper ARIA attributes
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast compliance

#### 6. Architecture Pattern Compliance

Validates adherence to architecture patterns.

```bash
npm run validate -- --architecture
```

**Checks**:
- ✅ Script Tag Pattern documented
- ✅ Extends USWDSBaseComponent or LitElement
- ✅ @customElement decorator present
- ✅ Light DOM rendering
- ✅ Proper property decorators

#### 7. Storybook Story Validation

Validates Storybook story files.

```bash
npm run validate -- --storybook
```

**Checks**:
- ✅ Story file exists and co-located
- ✅ Proper meta export with TypeScript types
- ✅ Default story present
- ✅ Uses `layout: 'padded'` (recommended)
- ✅ Property controls configured

---

## USWDS Integration

### Script Tag Pattern (MANDATORY)

All components follow the **Script Tag Pattern** architecture.

**Pattern**:
1. USWDS loaded globally via `<script>` tag in `.storybook/preview-head.html`
2. Components render HTML structure only
3. USWDS enhances automatically via `window.USWDS`

**Why This Pattern**:
- ✅ Creates `window.USWDS` global object (required by USWDS)
- ✅ Consistent behavior across all environments
- ✅ Proper USWDS initialization with `.on()` and `.init()` methods
- ✅ Fixes modal visibility issues
- ✅ Validated by pre-commit hooks

**Implementation**:
```typescript
override firstUpdated(changedProperties: Map<string, any>) {
  // ARCHITECTURE: Script Tag Pattern
  // USWDS is loaded globally via script tag in .storybook/preview-head.html
  // Components just render HTML - USWDS enhances automatically via window.USWDS

  super.firstUpdated(changedProperties);
  this.initializeUSWDSComponent();
}
```

### USWDS Class Database

Automated system maintains up-to-date USWDS class database.

**Database**: 592 official USWDS classes tracked

**Auto-Update Triggers**:
- After `npm install` (detects USWDS version changes)
- Manual: `npm run uswds:update-classes`

**Benefits**:
- ✅ Eliminates false positive compliance errors
- ✅ Tracks USWDS class additions/removals
- ✅ Validates component class usage
- ✅ Prevents invalid class usage

### USWDS Update Workflow

```bash
# 1. Check for USWDS updates
npm run uswds:check-updates

# 2. Update USWDS class database
npm run uswds:update-classes

# 3. Validate compliance
npm run validate -- --uswds

# 4. Or use all-in-one
npm run uswds:sync
```

---

## JavaScript Compliance

### USWDS JavaScript Debugging Protocol

**MANDATORY** protocol before attempting component fixes.

**Steps**:
1. **READ** `docs/USWDS_JAVASCRIPT_DEBUGGING_PROTOCOL.md`
2. **CHECK** USWDS source: `node_modules/@uswds/uswds/packages/usa-[component]/src/index.js`
3. **IDENTIFY** USWDS patterns: class toggles, exports, event handlers
4. **FOLLOW** USWDS implementation exactly
5. **DOCUMENT** USWDS source references in code comments

> **"When in doubt, read the USWDS source. When not in doubt, read it anyway."**

### JavaScript Integration Patterns

#### Pattern 1: Simple USWDS.*.on() Integration

For components with straightforward USWDS initialization:

```typescript
private async initializeUSWDSComponent() {
  try {
    await this.updateComplete;
    const element = this.querySelector('.usa-accordion');

    if (!element || !window.USWDS?.accordion) {
      console.warn('USWDS not available');
      return;
    }

    window.USWDS.accordion.on(element);
    console.log('✅ USWDS accordion initialized');
  } catch (error) {
    console.warn('USWDS initialization failed:', error);
  }
}
```

#### Pattern 2: Loader Utility Integration

For consistent initialization across components:

```typescript
private async initializeUSWDSComponent() {
  try {
    const { initializeUSWDSComponent } = await import('../../utils/uswds-loader.js');

    await this.updateComplete;
    const element = this.querySelector('.usa-modal');

    if (!element) return;

    await initializeUSWDSComponent(element, 'modal');
  } catch (error) {
    console.warn('USWDS integration failed:', error);
  }
}
```

### JavaScript Validation

```bash
# Validate all JavaScript integrations
npm run validate -- --javascript

# Component-specific
npm run validate -- --javascript --component=modal

# With verbose output
npm run validate -- --javascript --verbose
```

---

## CSS Compliance

### CSS Standards

**HARD RULE**: Only USWDS classes and minimal `:host` styles allowed.

**Permitted**:
```typescript
// ✅ Minimal :host styles
static override styles = css`
  :host {
    display: block;
    contain: content;
  }
`;
```

**Prohibited**:
```typescript
// ❌ Custom CSS beyond :host
static styles = css`
  .custom-button {
    background: #005ea2;
    color: white;
    padding: 10px;
  }
`;
```

### USWDS Utility Classes

Use USWDS utilities instead of custom CSS:

```html
<!-- ✅ CORRECT: USWDS utilities -->
<div class="display-flex flex-justify margin-2 padding-1 text-primary">
  Content
</div>

<!-- ❌ WRONG: Custom styles -->
<div style="display: flex; margin: 20px; color: #005ea2;">
  Content
</div>
```

### CSS Validation

```bash
# Validate CSS compliance
npm run validate -- --css

# With auto-fix
npm run validate -- --css --fix

# Strict mode (warnings as errors)
npm run validate -- --css --strict
```

---

## Architecture Compliance

### Required Architecture Patterns

1. **Script Tag Pattern**: USWDS loaded globally
2. **Light DOM**: No Shadow DOM
3. **USWDSBaseComponent**: Preferred base class
4. **Official USWDS CSS**: Single import
5. **Minimal Custom Code**: Let USWDS do the work

### Component Template

```typescript
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../../utils/base-component.js';
import '../../styles/styles.css';

@customElement('usa-component')
export class USAComponent extends USWDSBaseComponent {
  static override styles = css`:host { display: block; }`;

  @property({ type: String }) variant = 'default';

  override firstUpdated() {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS loaded via script tag
    super.firstUpdated();
    this.initializeUSWDSComponent();
  }

  override render() {
    return html`
      <div class="usa-component">
        <slot></slot>
      </div>
    `;
  }
}
```

---

## Troubleshooting

### Common Issues

#### Issue: Component not USWDS compliant

**Solution**:
```bash
# Run full validation
npm run validate

# Check specific aspect
npm run validate -- --uswds --component=your-component

# View detailed output
npm run validate -- --uswds --verbose
```

#### Issue: JavaScript integration not working

**Solution**:
1. Check USWDS source: `node_modules/@uswds/uswds/packages/usa-[component]/src/index.js`
2. Verify `window.USWDS` available
3. Check script tag in `.storybook/preview-head.html`
4. Use browser console to debug

#### Issue: Custom CSS detected

**Solution**:
```bash
# Identify custom CSS
npm run validate -- --css

# Remove custom CSS, use USWDS utilities
# See: https://designsystem.digital.gov/utilities/
```

#### Issue: Accessibility failures

**Solution**:
```bash
# Run accessibility validation
npm run validate -- --accessibility

# Check specific component
npm test src/components/[component]/usa-[component].test.ts

# Review axe-core output for specific violations
```

---


## Compliance Automation System

### Pre-commit Hooks

Automated validation runs on every commit to catch issues early.

**File**: `.husky/pre-commit`

**Checks**:
- Light DOM implementation verification
- ARIA attributes in critical components
- Keyboard handlers in interactive components
- Component registration conflicts
- Slot rendering patterns
- USWDS integration validation

**Usage**:
```bash
# Automatic validation on commit
git commit -m "Your changes"

# Skip validation (not recommended)
git commit --no-verify -m "Emergency commit"
```

### CI/CD Pipeline Integration

Comprehensive validation runs on all pull requests.

**Workflow**: `.github/workflows/uswds-compliance.yml`

**Steps**:
1. **Accessibility Gate**: Validates ARIA patterns and keyboard navigation
2. **Component Structure**: Ensures proper USWDS structure compliance
3. **Module Optimization**: Validates Storybook USWDS module configuration
4. **Performance Monitoring**: Checks bundle sizes and optimization
5. **Regression Tests**: Runs comprehensive regression test suite

### Automated Validation System

Continuous monitoring ensures compliance across the codebase.

**Key Features**:
- **Git-aware validation**: Only checks modified components for speed
- **Component-specific thresholds**: Critical components have stricter rules
- **Automated reporting**: Generates detailed compliance reports
- **Issue tracking**: Creates GitHub issues for violations

**Commands**:
```bash
# Run all validation checks
npm run validate:compliance-regression

# Run individual checks
npm run validate:regression
npm run validate:accessibility-gate
npm run validate:uswds-optimization
```

### Accessibility Gate

Prevents accessibility regressions from reaching the codebase.

**Script**: `scripts/accessibility-gate.js`

**Features**:
- Component-specific thresholds (critical components: 0 violations)
- ARIA pattern validation
- Keyboard navigation verification
- Modified component focus (git-aware)
- Detailed violation reports

**Usage**:
```bash
npm run validate:accessibility-gate

# Component-specific
npm run validate:accessibility-gate -- --component=modal
```

**Critical Component Requirements**:
- **Date-picker**: Must maintain >90% compliance
- **Modal**: Zero violations allowed for ARIA modal patterns
- **Combo-box**: Perfect ARIA expanded/controls/labelledby implementation

### USWDS Module Optimization Monitor

Ensures Storybook USWDS integration stays optimized.

**Script**: `scripts/monitor-uswds-optimization.js`

**Validates**:
- `optimizeDeps` configuration in `.storybook/main.ts`
- All required USWDS modules included
- `force: true` setting for cache busting
- CommonJS options for USWDS compatibility

**Usage**:
```bash
npm run validate:uswds-optimization
```

**Monitored Modules**:
- @uswds/uswds/js/usa-tooltip
- @uswds/uswds/js/usa-modal
- @uswds/uswds/js/usa-accordion
- @uswds/uswds/js/usa-date-picker
- @uswds/uswds/js/usa-combo-box
- And 20+ more critical USWDS modules

---

## Validation Hooks System

### Pre-commit Validation

Blocks commits with compliance violations before they reach the repository.

**What it checks**:
- TypeScript compiles without errors
- Critical tests pass
- Code passes linting
- Component changes have corresponding test updates
- USWDS compliance maintained

**Integration**:
```bash
# Automatically runs via Husky
git commit -m "message"

# Emergency bypass (not recommended)
git commit --no-verify -m "emergency"
```

### Pull Request Validation

Comprehensive validation runs on every pull request.

**Automated Checks**:
- Full test suite execution
- Accessibility compliance validation
- USWDS structure verification
- Performance budget checks
- Documentation completeness
- Bundle size analysis

### Early Issue Detection

Catches problems before they become technical debt.

**Detection Strategies**:

1. **Component Scanning**: Automatic detection of missing patterns
2. **Test Coverage**: Identifies untested code paths
3. **Accessibility Audit**: Catches WCAG violations early
4. **Performance Monitoring**: Detects bundle size increases
5. **USWDS Alignment**: Ensures USWDS class usage remains valid

**Benefits**:
- ✅ **Immediate Feedback**: Developers know about issues within seconds
- ✅ **Specific Guidance**: Clear instructions on how to fix problems
- ✅ **Prevents Regressions**: Stops fixed issues from recurring
- ✅ **Maintains Quality**: Enforces consistent standards across codebase

---

## Common Compliance Issues and Fixes

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
setAttribute('aria-haspopup', 'dialog');
setAttribute('aria-controls', 'date-picker-dialog');
setAttribute('aria-modal', 'true');
```

**Fix for combo-box**:
```typescript
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
  viteFinal: async (config) => {
    config.optimizeDeps = {
      include: [
        '@uswds/uswds/js/usa-tooltip',
        '@uswds/uswds/js/usa-modal',
        '@uswds/uswds/js/usa-accordion',
        '@uswds/uswds/js/usa-date-picker',
        '@uswds/uswds/js/usa-combo-box',
      ],
      force: true,
    };
    return config;
  },
};
```

### 5. Security Issues

**Error**: "Security vulnerability detected: innerHTML usage"

**Fix**:
```typescript
// ❌ WRONG - Security vulnerability
element.innerHTML = userContent;

// ✅ CORRECT - Use Lit's html template
render(html`${userContent}`, element);

// ✅ CORRECT - Use textContent for plain text
element.textContent = userContent;
```

---

## Compliance Scoring System

### Component Health Scores

Each component receives a compliance score from 0-100%:

**Score Components**:
- **Structure Compliance**: 30 points (USWDS HTML patterns)
- **CSS Compliance**: 20 points (Official USWDS classes only)
- **JavaScript Integration**: 20 points (Proper USWDS.*.on() usage)
- **Accessibility**: 20 points (WCAG 2.1 AA + Section 508)
- **Performance**: 10 points (Bundle size, optimization)

**Score Interpretation**:
- **90-100%**: Excellent compliance, production ready
- **80-89%**: Good compliance, minor improvements needed
- **70-79%**: Acceptable compliance, should address issues soon
- **Below 70%**: Critical issues, requires immediate attention

### Historical Tracking

Compliance scores are tracked over time to monitor trends:

```bash
# View compliance history
npm run compliance:history

# View specific component history
npm run compliance:history -- --component=modal
```

---

## Automated Fix Tools

### Auto-Fix Common Issues

Automatically fix recurring compliance issues:

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

### Component Generator

Generate compliant components from the start:

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

---

## Best Practices

### Component Development

1. **Always extend USWDSBaseComponent or LitElement**
2. **Use light DOM for USWDS compatibility**
3. **Add ARIA attributes during development**
4. **Include keyboard navigation for interactive components**
5. **Follow USWDS structural patterns exactly**

### Testing

1. **Write regression tests for critical compliance patterns**
2. **Include accessibility tests in component test suites**
3. **Test keyboard navigation in Cypress component tests**
4. **Validate USWDS JavaScript integration**

### Documentation

1. **Update component READMEs with compliance requirements**
2. **Document any compliance exceptions with justification**
3. **Keep USWDS links current and accessible**
4. **Include compliance status in component documentation**

---

## Bypassing Validation (Emergency Only)

### Skip Pre-commit Hooks

```bash
git commit --no-verify -m "Emergency commit"
```

### Skip CI Validation

Add `[skip ci]` to commit message (documentation changes only).

**⚠️ Warning**: Bypassing validation can introduce regressions. Always run validation manually before merging.

---

## Related Documentation

- **USWDS Compliance Methodology**: `docs/USWDS_COMPLIANCE_METHODOLOGY.md`
- **USWDS JavaScript Debugging**: `docs/USWDS_JAVASCRIPT_DEBUGGING_PROTOCOL.md`
- **USWDS Class Automation**: `docs/USWDS_CLASS_AUTOMATION.md`
- **Script Tag Pattern**: `docs/ARCHITECTURE_DECISION_SCRIPT_TAG_VS_COMPONENT_INIT.md`
- **USWDS Integration Guide**: `docs/USWDS_INTEGRATION_GUIDE.md`
- **Regression Prevention**: `docs/guides/REGRESSION_PREVENTION_GUIDE.md`
- **Testing Guide**: `docs/guides/TESTING_GUIDE.md`

---

**Last Updated**: Phase 2 Documentation Consolidation (October 2025)

**Replaces**:
- 27+ individual compliance documentation files
- `COMPONENT_COMPLIANCE_ARCHITECTURE.md`
- `COMPLIANCE_AUTOMATION.md`
- `VALIDATION_HOOKS.md`
- `PRE_COMMIT_VALIDATION.md`
- `AUTOMATED_VALIDATION_SYSTEM.md`
- `EARLY_ISSUE_DETECTION.md`
