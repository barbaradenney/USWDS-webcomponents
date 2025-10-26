# Storybook Guide - USWDS Web Components

**Complete Storybook reference for USWDS Web Components monorepo**

This guide consolidates all Storybook-related documentation including property binding, USWDS integration, critical navigation patterns, and monorepo-specific configuration.

---

## Table of Contents

1. [Monorepo Architecture](#monorepo-architecture) 🏗️ NEW
2. [Best Practices](#best-practices)
3. [Property Binding](#property-binding)
4. [USWDS Integration](#uswds-integration)
5. [Layout Forcing Pattern](#layout-forcing-pattern) ⚠️ CRITICAL
6. [Troubleshooting](#troubleshooting)

---

## Monorepo Architecture

### Package Structure

The USWDS Web Components library uses a **monorepo architecture** with pnpm workspaces and Turborepo:

```
packages/
├── uswds-wc-core/              # Core utilities, USWDS CSS
├── uswds-wc-actions/           # Buttons, links, search (4 components)
├── uswds-wc-forms/             # Form controls (15 components)
├── uswds-wc-navigation/        # Headers, menus (8 components)
├── uswds-wc-data-display/      # Cards, tables (8 components)
├── uswds-wc-feedback/          # Alerts, modals (5 components)
├── uswds-wc-layout/            # Layout utilities (4 components)
├── uswds-wc-structure/         # Accordion (1 component)
├── uswds-wc-test-utils/        # Shared testing utilities
├── components/                 # Legacy meta-package
└── uswds-wc/                   # All components bundle
```

### Story Location

Stories are co-located with components in their respective packages:

```
packages/uswds-wc-actions/
└── src/
    └── components/
        └── button/
            ├── usa-button.ts           # Component
            ├── usa-button.stories.ts   # Stories (co-located)
            ├── usa-button.test.ts      # Tests
            └── README.mdx              # Docs
```

### Storybook Discovery

Storybook automatically discovers stories across all packages:

```typescript
// .storybook/main.ts
stories: [
  '../packages/*/src/**/*.stories.@(ts|mdx)',  // All package stories
  './*.mdx'                                     // Root documentation
]
```

### Component Imports in Stories

Import components from their package location:

```typescript
// ✅ Correct - Import from package
import './index.ts';  // From same package
import type { USAButton } from './usa-button.js';

// ❌ Incorrect - Don't use workspace names in story imports
import '@uswds-wc/actions';  // Causes issues in Storybook
```

### Development Commands

```bash
# Start Storybook (with Turborepo caching)
pnpm run storybook

# Build Storybook for deployment
pnpm run build-storybook

# Clean Storybook cache
pnpm run storybook:clean
```

**Performance**: Storybook automatically benefits from Turborepo's **111x faster builds** with remote caching!

---

## Best Practices

### Story File Structure

Every Storybook story file should follow this structure:

```typescript
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';  // REQUIRED for property binding
import './index.ts';
import type { USAComponent } from './usa-component.js';

const meta: Meta<USAComponent> = {
  title: 'Components/ComponentName',
  component: 'usa-component',
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    // Define controls
  },
};

export default meta;
type Story = StoryObj<USAComponent>;

export const Default: Story = {
  render: (args) => html`
    <usa-component
      label="${args.label}"
      .options=${args.options}
      ?disabled=${args.disabled}
    ></usa-component>
  `,
  args: {
    label: 'Default Label',
    options: [],
    disabled: false,
  },
};
```

---

## Property Binding

### Essential Rules

#### 1. Always Import html from Lit

```typescript
// ✅ REQUIRED
import { html } from 'lit';

// ❌ WRONG - Will cause property binding to fail
// No import
```

#### 2. Property Binding Syntax Reference

| Property Type | Syntax | Example |
|---------------|--------|---------|
| **String** | `attribute="${value}"` | `label="${args.label}"` |
| **Boolean** | `?attribute=${boolean}` | `?disabled=${args.disabled}"` |
| **Object/Array** | `.property=${value}` | `.options=${args.options}` |
| **Number** | `attribute=${number}` | `tabindex=${args.tabindex}` |

#### 3. Common Mistakes and Fixes

**Issue: Empty Dropdown/List Components**

```typescript
// ❌ WRONG: String interpolation for objects
.options="${args.options}"  // Results in "[object Object]"

// ✅ CORRECT: Property binding
.options=${args.options}    // Properly passes array
```

**Issue: Boolean Properties Not Working**

```typescript
// ❌ WRONG: String representation
disabled="${args.disabled}"  // Results in disabled="false" (still disabled!)

// ✅ CORRECT: Boolean binding
?disabled=${args.disabled}   // Properly adds/removes attribute
```

**Issue: Properties Not Updating in Controls**

```typescript
// ❌ WRONG: String template
render: (args) => `<usa-component label="${args.label}"></usa-component>`;

// ✅ CORRECT: Lit html template
render: (args) => html`<usa-component label="${args.label}"></usa-component>`;
```

### Complete Example

```typescript
export const ComplexComponent: Story = {
  render: (args) => html`
    <usa-combo-box
      label="${args.label}"           // String
      name="${args.name}"             // String
      placeholder="${args.placeholder}" // String
      .options=${args.options}        // Array (property binding)
      .data=${args.data}              // Object (property binding)
      ?disabled=${args.disabled}      // Boolean
      ?required=${args.required}      // Boolean
      tabindex=${args.tabindex || 0}  // Number
    ></usa-combo-box>
  `,
  args: {
    label: 'Select an option',
    name: 'selection',
    placeholder: 'Choose...',
    options: [
      { value: 'opt1', label: 'Option 1' },
      { value: 'opt2', label: 'Option 2' },
    ],
    data: { customKey: 'value' },
    disabled: false,
    required: false,
    tabindex: 0,
  },
};
```

---

## USWDS Integration

### Overview

Storybook requires special configuration to load USWDS JavaScript modules because USWDS uses CommonJS format that cannot be resolved directly in the browser.

### Solution Architecture

#### 1. Vite Pre-bundling

**Main Vite Configuration** (`vite.config.ts`):

```typescript
optimizeDeps: {
  include: [
    '@uswds/uswds/js/usa-accordion',
    '@uswds/uswds/js/usa-modal',
    '@uswds/uswds/js/usa-date-picker',
    // ... other USWDS modules
  ],
  force: true,
}
```

**Storybook Vite Configuration** (`.storybook/main.ts`):

```typescript
async viteFinal(config) {
  config.optimizeDeps.include.push(
    '@uswds/uswds/js/usa-accordion',
    '@uswds/uswds/js/usa-modal',
    // ... other modules
  );
  config.define.global = 'globalThis';
  config.build.commonjsOptions.include = [
    /node_modules\/@uswds\/uswds/,
    /node_modules/
  ];
  return config;
}
```

#### 2. Module Pre-loading

**Preview Head Script** (`.storybook/preview-head.html`):

```html
<script type="module">
  window.__USWDS_MODULES__ = {};

  const moduleMapping = {
    'accordion': '/node_modules/.vite/deps/@uswds_uswds_js_usa-accordion.js',
    'modal': '/node_modules/.vite/deps/@uswds_uswds_js_usa-modal.js',
  };

  for (const [moduleName, bundlePath] of Object.entries(moduleMapping)) {
    try {
      const module = await import(bundlePath);
      window.__USWDS_MODULES__[moduleName] = module.default || module;
      console.log(`✅ Pre-loaded USWDS ${moduleName} module`);
    } catch (error) {
      console.warn(`⚠️ Could not pre-load ${moduleName}:`, error);
    }
  }
</script>
```

#### 3. USWDS Loader with Fallback

**Enhanced Loader** (`src/utils/uswds-loader.ts`):

```typescript
export async function loadUSWDSModule(moduleName: string): Promise<USWDSModule | null> {
  // Check for pre-loaded module (Storybook compatibility)
  if (typeof window !== 'undefined' && (window as any).__USWDS_MODULES__) {
    const normalizedName = moduleName.replace('-', '');
    const preloadedModule = (window as any).__USWDS_MODULES__[normalizedName];
    if (preloadedModule) {
      return preloadedModule;
    }
  }

  // Fallback to normal Vite import
  try {
    const module = await import(`@uswds/uswds/js/usa-${moduleName}`);
    return module.default || module;
  } catch (error) {
    console.warn(`USWDS Module '${moduleName}' not available:`, error);
    return null;
  }
}
```

### Adding New USWDS Components

When adding a new USWDS component with JavaScript behavior:

1. **Update `vite.config.ts`** - Add to `optimizeDeps.include`
2. **Update `.storybook/main.ts`** - Add to `optimizeDeps.include`
3. **Update `.storybook/preview-head.html`** - Add to `moduleMapping`
4. **Test in Storybook** - Verify module loads correctly

---

## Layout Forcing Pattern

### ⚠️ CRITICAL - DO NOT REMOVE

This pattern fixes zero `BoundingClientRect` after Storybook navigation - a critical browser layout calculation issue.

### The Problem

**Symptoms**:
- Components work perfectly on page reload
- After navigating between stories, interactive elements stop working
- `getBoundingClientRect()` returns all zeros
- Computed styles are correct, but no layout dimensions

**Root Cause**: Storybook navigation doesn't fully reset browser layout state. The browser's layout engine doesn't recalculate layout for new elements.

### The Solution

**TWO parts - BOTH are mandatory:**

#### Part 1: Storybook Decorator (Global)

**File**: `.storybook/preview.ts`

```typescript
/**
 * Force browser layout recalculation for Storybook root
 * CRITICAL: DO NOT REMOVE - Fixes zero BoundingClientRect after navigation
 */
const forceLayoutRecalculation = (): void => {
  const storybookRoot = document.getElementById('storybook-root');
  if (!storybookRoot) return;

  const originalDisplay = storybookRoot.style.display;
  storybookRoot.style.display = 'none';
  void storybookRoot.offsetHeight; // Force reflow
  storybookRoot.style.display = originalDisplay || '';
  void storybookRoot.offsetHeight; // Force reflow again
};

decorators: [
  (story) => {
    cleanupUSWDSElements();
    forceLayoutRecalculation(); // ← CRITICAL
    return story();
  },
],
```

#### Part 2: Component Behavior (Per Component)

**File**: `src/components/[component]/usa-[component]-behavior.ts`

```typescript
// After removing hidden attribute or showing element
if (shouldExpand) {
  controls.removeAttribute('hidden');

  // CRITICAL: Force immediate layout recalculation
  void controls.offsetHeight; // Force reflow
}
```

### When to Use

**✅ Components That MUST Use This Pattern**:
- Accordion
- Modal
- Dropdown/Combo Box
- Date Picker calendars
- Tooltip
- Tabs
- Any component that toggles `hidden` attribute or `display` style

**❌ Components That DON'T Need This**:
- Button
- Alert
- Card
- Badge
- Tag
- Other static components

### Validation

**Automated Check**: Pre-commit hook validates layout forcing pattern presence:

```bash
npm run validate:layout-forcing
```

**Manual Testing**:
1. Load component story in Storybook
2. Navigate to different story
3. Navigate back
4. Test interactive functionality
5. Verify `element.getBoundingClientRect()` returns non-zero values

### What NOT to Do

❌ **Don't remove `void offsetHeight` calls** - They force critical layout recalculation
❌ **Don't remove Storybook decorator** - Global fix required
❌ **Don't skip this for "simple" toggles** - All show/hide needs this
❌ **Don't use `setTimeout` instead** - Layout forcing must be synchronous

---

## Troubleshooting

### Debug Checklist

1. **Import Check**: Does the file import `{ html }` from 'lit'?
2. **Template Check**: Using `html\`` not just backticks?
3. **Property Binding**: Using `.property=${value}` for objects/arrays?
4. **Boolean Binding**: Using `?attribute=${boolean}` for booleans?
5. **String Binding**: Using `attribute="${string}"` for strings?
6. **USWDS Modules**: Check browser console for pre-load messages
7. **Layout Forcing**: Verify decorator exists in `.storybook/preview.ts`

### Validation Commands

```bash
# Check property binding issues
npm run lint

# Type check all TypeScript
npm run typecheck

# Test Storybook rendering
npm run storybook

# Validate USWDS integration
npm run validate:storybook-uswds

# Validate layout forcing pattern
npm run validate:layout-forcing
```

### Common Issues

**Issue: Component not interactive after navigation**
- **Cause**: Missing layout forcing pattern
- **Fix**: Add `void offsetHeight` after showing elements
- **Reference**: [Layout Forcing Pattern](#layout-forcing-pattern)

**Issue: USWDS module not available**
- **Cause**: Module not pre-loaded in Storybook
- **Fix**: Add to all three configs (vite.config.ts, main.ts, preview-head.html)
- **Reference**: [USWDS Integration](#uswds-integration)

**Issue: Empty dropdown or missing data**
- **Cause**: Incorrect property binding
- **Fix**: Use `.property=${value}` for objects/arrays
- **Reference**: [Property Binding](#property-binding)

**Issue: Boolean properties not working**
- **Cause**: Using string binding instead of boolean binding
- **Fix**: Use `?attribute=${boolean}` syntax
- **Reference**: [Property Binding](#property-binding)

### Getting Help

1. Check this guide first
2. Run the validation tools above
3. Look at existing working examples in the codebase
4. Check browser console for specific error messages
5. Review component README files for component-specific guidance

---

## Additional Resources

- [Lit Template Syntax](https://lit.dev/docs/templates/overview/)
- [Storybook Web Components](https://storybook.js.org/docs/web-components/get-started/introduction)
- [USWDS Documentation](https://designsystem.digital.gov/)
- [Component Development Guide](../COMPONENT_DEVELOPMENT_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

## See Also

- [STORYBOOK_CONFIGURATION.md](../STORYBOOK_CONFIGURATION.md) - Detailed configuration reference
- [MONOREPO_MIGRATION_FINAL_STATUS.md](../MONOREPO_MIGRATION_FINAL_STATUS.md) - Monorepo migration details
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - Testing patterns and commands
- [Component Development Guide](../COMPONENT_DEVELOPMENT_GUIDE.md) - Component creation

---

**Last Updated**: October 26, 2025 (Monorepo Architecture Update)

**Remember**:
- Stories are co-located in package directories under `packages/*/src/components/`
- Import components from package locations, not workspace names
- Storybook benefits from Turborepo's 111x faster caching
- Always use Lit `html` templates for property binding
- Layout forcing pattern is CRITICAL for navigation
- USWDS modules require special Storybook configuration
