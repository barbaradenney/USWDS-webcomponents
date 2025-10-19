# Preventing Duplicate USWDS Initialization

This document outlines the **systematic prevention strategy** for duplicate USWDS initialization issues, ensuring this problem never recurs.

## 🚨 The Problem

Duplicate USWDS JavaScript initialization causes:
- **Double widgets** (e.g., two date pickers showing)
- **Conflicting event handlers** causing unpredictable behavior
- **Memory leaks** from unreleased USWDS modules
- **Performance degradation** from redundant initialization
- **Debugging nightmares** when widgets interfere with each other

## 🛡️ Prevention Strategy (4 Layers)

### **Layer 1: Development-Time Prevention**

#### ESLint Rule (Automatic)
Custom ESLint rule catches initialization issues during development:

```bash
# Automatically detects:
# - Missing initialization guards
# - Missing initialization flags
# - Missing cleanup flag resets
# - Unsafe USWDS method calls

npm run lint  # Will catch and auto-fix many issues
```

#### Component Template (Mandatory)
All new components must use the standardized template:

```typescript
// REQUIRED PATTERN for all USWDS components
@state()
private initialized = false;

private async initializeUSWDS() {
  // CRITICAL: Always check first
  if (this.initialized) {
    console.log(`⚠️ Already initialized, skipping duplicate initialization`);
    return;
  }

  // ... initialization code ...
  this.initialized = true; // Set after success
}

private cleanup() {
  // ... cleanup code ...

  // CRITICAL: Always reset
  this.initialized = false;
}
```

### **Layer 2: Commit-Time Prevention**

#### Pre-commit Hook (Automatic)
Blocks commits with initialization issues:

```bash
# Run automatically before every commit
./scripts/pre-commit-initialization-check.sh

# Manual check:
npm run check:initialization
```

**Blocked patterns:**
- ✋ USWDS `.on(this)` calls without guards
- ✋ Components with USWDS but no initialization flag
- ✋ Cleanup methods without flag reset

### **Layer 3: Testing Prevention**

#### Automated Tests
Every component test includes initialization validation:

```typescript
// Automatically included in all component tests
it('should prevent duplicate initialization', async () => {
  element.initializeUSWDS();
  element.initializeUSWDS(); // Second call should be blocked

  expect(consoleLogSpy).toHaveBeenCalledWith(
    expect.stringContaining('Already initialized, skipping')
  );
});
```

#### Storybook Smoke Tests
Automatic detection of duplicate widget rendering:

```bash
npm run test:storybook:duplicates  # Catches double widgets
```

### **Layer 4: Runtime Prevention**

#### Global Initialization Registry (Optional)
For complex applications with many component instances:

```typescript
import { initializeUSWDSComponent } from '../../utils/uswds-initialization-registry.js';

// Prevents duplicates across entire application
await initializeUSWDSComponent('date-picker', this, () => {
  return USWDS.datePicker.on(this);
});
```

## 📋 Developer Checklist

### **Before Creating New Components**

- [ ] Use the standardized component template (`templates/uswds-component-template.ts`)
- [ ] Include `@state() private initialized = false`
- [ ] Add initialization guard: `if (this.initialized) { return; }`
- [ ] Set flag after success: `this.initialized = true`
- [ ] Reset flag in cleanup: `this.initialized = false`

### **Before Modifying Existing Components**

- [ ] Check if component has USWDS initialization
- [ ] Verify initialization guard exists
- [ ] Verify cleanup flag reset exists
- [ ] Run: `npm run lint` to catch issues
- [ ] Run: `npm run check:initialization`

### **Before Committing**

- [ ] All tests pass: `npm test`
- [ ] Lint passes: `npm run lint`
- [ ] Initialization check passes: `npm run check:initialization`
- [ ] Manual Storybook test (no double widgets)

## 🔧 Common Patterns to Avoid

### ❌ **Dangerous Pattern 1: No Guard**
```typescript
private async initializeUSWDS() {
  // DANGEROUS: No guard - can initialize multiple times
  USWDS.component.on(this);
}
```

### ❌ **Dangerous Pattern 2: No Flag Reset**
```typescript
private cleanup() {
  USWDS.component.off(this);
  // DANGEROUS: Flag not reset - can't reinitialize
}
```

### ❌ **Dangerous Pattern 3: No Flag Declaration**
```typescript
// DANGEROUS: No initialization flag property
export class USAComponent extends LitElement {
  // Missing: @state() private initialized = false;
}
```

## ✅ Safe Pattern (Always Use This)

```typescript
@customElement('usa-safe-component')
export class USASafeComponent extends USWDSBaseComponent {
  // REQUIRED: Initialization flag
  @state()
  private initialized = false;

  private uswdsModule: any = null;

  override connectedCallback() {
    super.connectedCallback();
    this.initializeUSWDSComponent();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  private async initializeUSWDSComponent() {
    // CRITICAL: Always check first
    if (this.initialized) {
      console.log(`⚠️ Component: Already initialized, skipping duplicate initialization`);
      return;
    }

    try {
      const module = await import('@uswds/uswds');
      this.uswdsModule = module.default;

      if (this.uswdsModule?.component?.on) {
        this.uswdsModule.component.on(this);
        this.initialized = true; // CRITICAL: Set after success
        console.log(`✅ Component: USWDS initialized successfully`);
      }
    } catch (error) {
      console.warn(`⚠️ Component: USWDS initialization failed:`, error);
    }
  }

  private cleanupUSWDS() {
    try {
      if (this.uswdsModule?.component?.off) {
        this.uswdsModule.component.off(this);
        console.log(`✅ Component: USWDS cleaned up`);
      }
    } catch (error) {
      console.warn(`⚠️ Component: Cleanup failed:`, error);
    }

    this.uswdsModule = null;

    // CRITICAL: Always reset flag
    this.initialized = false;
  }
}
```

## 🎯 Quick Commands Reference

```bash
# Check for initialization issues
npm run check:initialization

# Auto-fix common issues
npm run lint:fix

# Test initialization patterns
npm test -- initialization

# Manual component check
npm run validate:component <component-name>

# Storybook duplicate widget check
npm run test:storybook:duplicates
```

## 📚 Related Documentation

- [Component Development Pattern](../CLAUDE.md#component-development-pattern)
- [USWDS Integration Best Practices](./USWDS_INTEGRATION_BEST_PRACTICES.md)
- [Component Template Usage](../templates/README.md)
- [ESLint Rule Configuration](./.eslintrc.js)

## 🏆 Success Metrics

This prevention strategy should achieve:

- **Zero duplicate initialization bugs** in production
- **100% component compliance** with initialization patterns
- **Automatic detection** during development
- **Prevention at commit time** through hooks
- **Developer confidence** when creating/modifying components

---

**Remember: An ounce of prevention is worth a pound of debugging! 🛡️**