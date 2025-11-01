# Tooltip Troubleshooting Prevention System

## Overview

Based on the comprehensive tooltip troubleshooting work, this document outlines the systematic validation tests and patterns created to prevent similar issues in future components.

## 🎯 **Key Issues Discovered & Solutions**

### 1. **USWDS DOM Transformation Pattern**

- **Issue**: USWDS JavaScript changes `.usa-tooltip` → `.usa-tooltip__trigger` during initialization
- **Issue**: Components must apply attributes BEFORE USWDS reads them
- **Solution**: Multi-phase attribute application with timing controls

### 2. **Storybook Iframe Environment**

- **Issue**: Tooltips worked outside Storybook but failed inside iframe
- **Issue**: Missing USWDS module optimization caused positioning failures
- **Solution**: USWDS module inclusion in Vite `optimizeDeps`

### 3. **Light DOM Slot Behavior**

- **Issue**: Light DOM slot access patterns differ from Shadow DOM
- **Issue**: Components using `slot.assignedElements()` fail in light DOM
- **Solution**: Direct DOM traversal for light DOM components

### 4. **Multi-Phase Attribute Application**

- **Issue**: Attributes applied after USWDS initialization are ignored
- **Issue**: Components need to handle both pre and post-transformation states
- **Solution**: Comprehensive element discovery strategies

## 🧪 **Validation Test Suites**

### 1. USWDS DOM Transformation Validation

**File**: `__tests__/uswds-dom-transformation-validation.test.ts`

```bash
npm run test:dom-transformation
```

**Validates**:

- Multi-strategy element detection (pre/post USWDS initialization)
- Proper attribute application timing
- Light DOM slot content access
- USWDS module integration timing
- Component state consistency through DOM transformations
- Error prevention patterns for positioning
- MutationObserver cleanup patterns

**Key Tests**:

```typescript
// Component Discovery Pattern
it('should detect components in both pre and post-USWDS initialization states');
it('should validate multi-phase attribute application timing');

// Light DOM Slot Detection
it('should properly detect slot content in light DOM components');
it('should validate slot content access timing in light DOM');

// USWDS Module Integration Timing
it('should validate proper initialization sequence');
it('should validate USWDS module error handling');
```

### 2. Storybook Iframe Environment Validation

**File**: `__tests__/storybook-iframe-environment-validation.test.ts`

```bash
npm run test:storybook-iframe
```

**Validates**:

- Storybook main.ts includes required USWDS modules
- Vite configuration patterns for USWDS modules
- Iframe positioning constraints and spacing
- Story parameters for iframe compatibility
- Component positioning calculations in constrained space
- Environment-specific configurations
- Hot Module Replacement compatibility

**Key Tests**:

```typescript
// USWDS Module Optimization Detection
it('should validate Storybook main.ts includes required USWDS modules');
it('should validate critical Vite configuration patterns');

// Iframe Positioning Constraints
it('should validate adequate spacing for absolutely positioned elements');
it('should validate story parameters for iframe compatibility');

// Component Positioning in Iframe Context
it('should validate tooltip positioning calculations in constrained space');
it('should validate modal positioning in iframe environment');
```

### 3. Multi-Phase Attribute Validation

**File**: `__tests__/multi-phase-attribute-validation.test.ts`

```bash
npm run test:multi-phase-attributes
```

**Validates**:

- Immediate attribute application in `connectedCallback`
- Property updates before USWDS initialization
- Delayed USWDS initialization timing
- DOM transformation handling after USWDS initialization
- Property change propagation through all phases
- Comprehensive element discovery strategies
- Error recovery and resilience patterns

**Key Tests**:

```typescript
// Pre-USWDS Initialization Phase
it('should apply attributes immediately in connectedCallback');
it('should handle property updates before USWDS initialization');

// USWDS Initialization Timing
it('should delay USWDS initialization until after attribute application');
it('should validate timeout-based USWDS initialization delay');

// Post-USWDS Initialization Phase
it('should handle DOM transformation after USWDS initialization');
it('should apply updates to both pre and post-initialization elements');
```

### 4. Light DOM Slot Behavior Validation

**File**: `__tests__/light-dom-slot-behavior-validation.test.ts`

```bash
npm run test:light-dom-slots
```

**Validates**:

- Light DOM vs Shadow DOM content access patterns
- Direct content access patterns
- Slot element access in light DOM
- Content discovery strategies for light DOM
- Component integration patterns (tooltip, modal, accordion)
- Dynamic content updates and removal
- Event handling in light DOM context
- Performance considerations for queries

**Key Tests**:

```typescript
// Light DOM vs Shadow DOM Content Access
it('should validate light DOM direct content access patterns');
it('should validate slot element access in light DOM');
it('should demonstrate Shadow DOM pattern differences');

// Content Discovery Strategies for Light DOM
it('should validate comprehensive content discovery pattern');
it('should handle empty content gracefully');
it('should handle mixed content types');
```

### 5. USWDS Module Optimization Validation

**File**: `__tests__/uswds-module-optimization-validation.test.ts`

```bash
npm run test:module-optimization
```

**Validates**:

- Storybook configuration includes USWDS modules
- Vite configuration patterns for USWDS modules
- Dynamic USWDS module imports
- Module loading timing and error handling
- Package.json dependencies
- TypeScript configuration for module resolution
- Runtime module loading in different environments
- Performance impact and bundle size analysis

**Key Tests**:

```typescript
// Storybook Configuration Validation
it('should validate Storybook main.ts includes required USWDS modules');
it('should validate Vite configuration patterns for USWDS modules');

// USWDS Module Import Validation
it('should validate dynamic USWDS module imports');
it('should validate module loading error handling');

// Performance Impact Validation
it('should validate bundle size impact of USWDS modules');
it('should validate loading performance in different scenarios');
```

## 🚀 **Combined Test Suite**

Run all tooltip prevention tests:

```bash
npm run test:tooltip-prevention
```

This runs all 5 validation suites in sequence to ensure comprehensive coverage.

## 📋 **Integration with Development Workflow**

### Pre-commit Integration

The validation tests can be integrated into pre-commit hooks:

```bash
# Add to .husky/pre-commit
echo "🧪 Running tooltip troubleshooting prevention tests..."
npm run test:tooltip-prevention

if [ $? -ne 0 ]; then
  echo "❌ Tooltip prevention tests failed!"
  echo "Run 'npm run test:tooltip-prevention' to see issues"
  exit 1
fi
```

### Quality Check Integration

Add to existing quality checks:

```bash
# Update package.json quality:check script
"quality:check": "... && npm run test:tooltip-prevention && ..."
```

### Component Development Guidelines

When creating new USWDS components:

1. **Run DOM transformation validation** - Ensure proper multi-phase attribute handling
2. **Test in Storybook** - Verify iframe environment compatibility
3. **Validate light DOM patterns** - Test slot content access patterns
4. **Check module optimization** - Ensure USWDS modules are optimized
5. **Test attribute timing** - Verify USWDS initialization sequence

## 🎯 **Prevention Patterns Summary**

### ✅ **Component Architecture Pattern**

```typescript
export class USAComponent extends USWDSBaseComponent {
  connectedCallback() {
    super.connectedCallback();
    // CRITICAL: Apply attributes immediately
    this.applyComponentAttributes();
  }

  firstUpdated() {
    super.firstUpdated();
    // CRITICAL: Delay USWDS initialization
    setTimeout(() => this.initializeUSWDS(), 10);
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    // Handle both pre and post-initialization states
    this.applyComponentAttributes();
  }

  private applyComponentAttributes() {
    // Strategy 1: Post-initialization elements
    const transformedElements = this.querySelectorAll('.usa-component__trigger');

    // Strategy 2: Pre-initialization elements
    const preInitElements = this.querySelectorAll('.usa-component');

    // Strategy 3: Direct children (light DOM)
    const directChildren = Array.from(this.children).filter(
      (child) => child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SLOT'
    );

    // Apply attributes to all discovered elements
    [...transformedElements, ...preInitElements, ...directChildren].forEach((el) =>
      this.applyElementAttributes(el)
    );
  }
}
```

### ✅ **Storybook Configuration Pattern**

```typescript
// .storybook/main.ts
config.optimizeDeps.include.push(
  '@uswds/uswds/js/usa-tooltip',
  '@uswds/uswds/js/usa-modal',
  '@uswds/uswds/js/usa-accordion'
  // Add ALL USWDS modules used
);

// Story parameters
export default {
  parameters: {
    layout: 'padded',
    viewport: { defaultViewport: 'large' },
  },
};

// Story render with adequate spacing
render: (args) => html`
  <div style="margin: 4rem; padding: 2rem; display: flex; justify-content: center;">
    <usa-component>${content}</usa-component>
  </div>
`;
```

### ✅ **Light DOM Content Access Pattern**

```typescript
// CORRECT: Light DOM pattern
const directChildren = Array.from(this.children).filter(
  (child) => child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SLOT'
);

const slotChildren = this.querySelector('slot')?.children
  ? Array.from(this.querySelector('slot')!.children)
  : [];

// INCORRECT: Shadow DOM pattern (doesn't work in light DOM)
const assignedElements = slotElement.assignedElements(); // ❌ Returns empty in light DOM
```

## 📊 **Success Metrics**

These validation tests help achieve:

- **🚫 Zero DOM transformation issues** - Components handle USWDS transformations correctly
- **🚫 Zero Storybook positioning failures** - Components work identically in iframe and standalone
- **🚫 Zero light DOM slot access errors** - Components use proper content discovery patterns
- **🚫 Zero module optimization failures** - USWDS modules load correctly in all environments
- **🚫 Zero attribute timing issues** - Attributes are applied before USWDS reads them

## 🔄 **Continuous Improvement**

These validation patterns should be:

1. **Reviewed** during component development
2. **Extended** when new USWDS integration patterns emerge
3. **Updated** when USWDS releases change transformation behavior
4. **Referenced** during troubleshooting similar issues

By systematically testing these patterns, we prevent the class of issues that required deep debugging for the tooltip component and ensure consistent, reliable USWDS integration across all components.
