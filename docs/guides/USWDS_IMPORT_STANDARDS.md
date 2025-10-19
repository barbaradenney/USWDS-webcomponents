# USWDS Import Standards

**⚠️ CRITICAL: This document defines the ONLY acceptable way to import USWDS JavaScript modules.**

## Overview

We have a recurring issue where developers try different methods to import USWDS modules, causing breaks in functionality. This document establishes the mandatory standard that ALL components must follow.

## The Problem

USWDS modules are CommonJS, but we use ES modules. Different import approaches have been tried:

❌ **These approaches FAIL:**
- Direct package imports: `import from '@uswds/uswds/packages/usa-accordion/src/index.js'`
- Bundle imports: `import from '@uswds/uswds/dist/js/uswds.js'`
- Manual path resolution: Various custom path constructions
- Window object detection and fallbacks

## The Solution: Standardized Utility

**✅ MANDATORY: Use the standardized USWDS loader utility**

All components MUST use `src/utils/uswds-loader.ts` for ALL USWDS imports.

### Standard Pattern

```typescript
// ✅ CORRECT - Use this exact pattern in ALL components
import { initializeUSWDSComponent, cleanupUSWDSComponent } from '../../utils/uswds-loader.js';

export class USAMyComponent extends USWDSBaseComponent {
  private uswdsModule: any = null;
  private uswdsInitialized = false;

  private async initializeUSWDS() {
    if (this.uswdsInitialized) return;

    try {
      // Use standardized loader - this handles Vite pre-bundling automatically
      this.uswdsModule = await initializeUSWDSComponent(this, 'my-component');
      if (this.uswdsModule) {
        this.uswdsInitialized = true;
      }
    } catch (error) {
      console.warn('USWDS module not available:', error);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  private async cleanupUSWDS() {
    const { cleanupUSWDSComponent } = await import('../../utils/uswds-loader.js');
    cleanupUSWDSComponent(this, this.uswdsModule);
    this.uswdsModule = null;
    this.uswdsInitialized = false;
  }
}
```

### Why This Works

1. **Vite Pre-bundling**: The utility uses paths that Vite can resolve via `@uswds/uswds` package.json exports
2. **Automatic CommonJS→ESM**: Vite handles the conversion automatically when modules are in `optimizeDeps.include`
3. **Consistent Error Handling**: Standardized error handling and fallback behavior
4. **Type Safety**: TypeScript interfaces ensure correct usage

## Vite Configuration

Each USWDS module MUST be added to `vite.config.ts`:

```typescript
optimizeDeps: {
  include: [
    '@uswds/uswds/js/usa-accordion',     // ✅ Add new modules here
    '@uswds/uswds/js/usa-modal',
    '@uswds/uswds/js/usa-date-picker',
    // ... etc
  ],
}
```

## Enforcement

### 1. Code Review Checklist

❌ **Block these patterns in PR reviews:**
- Any direct `import('@uswds/uswds/...)` calls outside of `uswds-loader.ts`
- Manual path construction for USWDS imports
- Window object detection patterns for USWDS
- Alternative import approaches

✅ **Require this pattern:**
- Import from `uswds-loader.ts` utility only
- Use `initializeUSWDSComponent()` and `cleanupUSWDSComponent()`
- Module name in `SUPPORTED_USWDS_MODULES` list

### 2. Automated Checks

Add ESLint rules to prevent direct USWDS imports:

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@uswds/uswds/js/*", "@uswds/uswds/packages/*", "@uswds/uswds/dist/*"],
            "message": "Use src/utils/uswds-loader.ts instead of direct USWDS imports"
          }
        ]
      }
    ]
  }
}
```

## Migration Guide

To migrate existing components:

1. **Replace direct imports** with `initializeUSWDSComponent()`
2. **Replace cleanup logic** with `cleanupUSWDSComponent()`
3. **Add module to Vite config** if not already present
4. **Test functionality** to ensure USWDS behavior works
5. **Remove custom import logic** and window object detection

## Emergency Protocol

If USWDS imports are broken:

1. **DO NOT** try alternative import methods
2. **DO NOT** modify individual components
3. **Check Vite configuration** first
4. **Update `uswds-loader.ts`** if needed
5. **Test with a single component** before rolling out changes

## Examples

### Adding New USWDS Component

1. Add to supported modules list:
```typescript
// In uswds-loader.ts
export const SUPPORTED_USWDS_MODULES = [
  'accordion',
  'date-picker',
  'my-new-component',  // ✅ Add here
] as const;
```

2. Add to Vite config:
```typescript
// In vite.config.ts
optimizeDeps: {
  include: [
    '@uswds/uswds/js/usa-my-new-component',  // ✅ Add here
  ],
}
```

3. Use standard pattern in component:
```typescript
this.uswdsModule = await initializeUSWDSComponent(this, 'my-new-component');
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Add to `vite.config.ts` optimizeDeps.include |
| Import errors | Restart dev server after Vite config changes |
| Module undefined | Check USWDS module name spelling |
| Cleanup errors | Ensure component uses `cleanupUSWDSComponent()` |

---

**Remember: The goal is to NEVER have this import issue again. Following this standard prevents hours of debugging and ensures consistent functionality across all components.**