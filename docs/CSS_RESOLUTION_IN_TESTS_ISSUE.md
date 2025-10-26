# CSS Resolution in Tests - Known Issue

**Status:** Work in Progress
**Priority:** Medium (blocks some component tests)
**Date:** October 26, 2025

## Problem Statement

Component packages cannot run tests due to CSS import resolution issues. When tests attempt to import components that have CSS imports (e.g., `import '@uswds-wc/core/styles.css'`), the following error occurs:

```
Error: Failed to resolve import "@uswds-wc/core/styles.css" from "src/components/[component]/usa-[component].ts"
```

Even after implementing a Vite plugin to stub CSS imports, PostCSS attempts to process the CSS file and fails due to missing cssnano dependency.

## Root Cause

The issue stems from multiple layers of CSS processing in the Vite/Vitest stack:

1. **Vite's built-in CSS handling**: Vite has a `vite:css` plugin that automatically processes CSS imports
2. **PostCSS configuration**: Project has `postcss.config.cjs` that requires cssnano for production builds
3. **Plugin execution order**: Custom CSS stub plugin runs, but `vite:css` still attempts to process CSS afterward
4. **Virtual module limitations**: Even with virtual module pattern (`\0` prefix), PostCSS is invoked

## Current State

### ✅ Working
- Core package tests: 9/9 passing
- Build process: All packages build successfully
- Development mode: CSS imports work correctly in dev and production builds

### ❌ Not Working
- Component package tests with CSS imports
- Vitest CSS stubbing via alias
- Vitest CSS stubbing via custom plugin

## Attempted Solutions

### 1. Alias-based CSS Mocking (Failed)
```typescript
// vitest.config.ts
resolve: {
  alias: {
    '@uswds-wc/core/styles.css': resolve(__dirname, '../../__mocks__/styleMock.js'),
  },
}
```
**Result:** Vite doesn't recognize the alias for CSS imports

### 2. CSS Configuration Options (Failed)
```typescript
// vitest.config.ts
test: {
  css: false, // or css: true
}
```
**Result:** Setting doesn't affect Vite's module resolution phase

### 3. Custom Vite Plugin with `enforce: 'pre'` (Partial)
```typescript
const cssStubPlugin = (): Plugin => ({
  name: 'css-stub',
  enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('.css')) {
      return '\0' + id; // Virtual module
    }
  },
  load(id) {
    if (id.startsWith('\0') && id.endsWith('.css')) {
      return 'export default {}';
    }
  },
});
```
**Result:** Plugin runs but `vite:css` still attempts PostCSS processing

## Potential Solutions

### Option 1: Disable PostCSS in Test Mode (Recommended)
Create a conditional PostCSS config that skips processing in test environment:

```javascript
// postcss.config.cjs
module.exports = {
  plugins: process.env.VITEST
    ? [] // No PostCSS plugins in test mode
    : [
        require('autoprefixer'),
        require('cssnano')({ preset: 'default' })
      ]
};
```

**Pros:**
- Simple configuration change
- No plugin complexity
- PostCSS won't be invoked

**Cons:**
- Need to set `VITEST=true` environment variable
- May affect CSS processing in edge cases

### Option 2: Override Vite's CSS Plugin
Replace or disable the built-in `vite:css` plugin entirely in test mode:

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [
    {
      name: 'ignore-css',
      enforce: 'pre',
      async transform(code, id) {
        if (id.endsWith('.css')) {
          return {
            code: 'export default {}',
            map: null
          };
        }
      }
    }
  ]
});
```

**Pros:**
- Intercepts at transform phase
- Complete control over CSS handling

**Cons:**
- May interfere with other Vite functionality
- More complex to maintain

### Option 3: Remove CSS Imports from Components
Remove the CSS import statements from component files and handle CSS loading at the application level:

```typescript
// Before
import '@uswds-wc/core/styles.css';

// After (remove CSS import, load in app)
// App level: import '@uswds-wc/core/styles.css'
```

**Pros:**
- Tests work immediately
- Simpler test setup

**Cons:**
- Changes component architecture
- Requires users to manually import CSS
- Less self-contained components

### Option 4: Install Missing PostCSS Dependencies
Install cssnano and other PostCSS dependencies in all packages:

```bash
pnpm add -D cssnano autoprefixer
```

**Pros:**
- Simplest immediate fix
- PostCSS can run successfully

**Cons:**
- Adds unnecessary build dependencies to test environment
- PostCSS processing overhead in tests
- Doesn't address root cause

### Option 5: Use @vitejs/plugin-legacy or Custom CSS Handler
Use a dedicated plugin designed for CSS handling in tests:

```bash
pnpm add -D vite-plugin-css-stub
```

**Pros:**
- Purpose-built solution
- Community-tested

**Cons:**
- External dependency
- May not exist (need to verify)

## Recommended Approach

**Short-term (Quick Fix):**
1. Use Option 4: Install cssnano in component packages
2. This unblocks tests immediately while we investigate better solutions

**Long-term (Proper Solution):**
1. Implement Option 1: Conditional PostCSS config
2. Set `VITEST=true` in package.json test scripts
3. Potentially combine with Option 2 if CSS processing still occurs

## Implementation Plan

### Phase 1: Immediate Unblocking (15 minutes)
```bash
# Install PostCSS dependencies
pnpm add -D -w cssnano autoprefixer postcss-cli

# Test if this resolves the issue
pnpm turbo test
```

### Phase 2: Proper Solution (30 minutes)
1. Update `postcss.config.cjs` to check for `VITEST` env var
2. Update all package.json test scripts to set `VITEST=true`
3. Test comprehensive solution
4. Remove cssnano if no longer needed

### Phase 3: Documentation (15 minutes)
1. Document CSS import patterns for components
2. Update TESTING_GUIDE.md with CSS considerations
3. Add troubleshooting section for CSS issues

## Testing Checklist

After implementing solution:
- [ ] Core package tests still pass (9/9)
- [ ] Structure package tests run (expected: 5 test files)
- [ ] Actions package tests run
- [ ] Forms package tests run
- [ ] Navigation package tests run
- [ ] Data-display package tests run
- [ ] Feedback package tests run
- [ ] Layout package tests run
- [ ] `pnpm turbo test` completes without CSS errors
- [ ] Build process unaffected
- [ ] Development mode unaffected

## References

- [Vitest CSS Handling](https://vitest.dev/guide/features.html#css)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [PostCSS Configuration](https://github.com/postcss/postcss#usage)
- [Vite CSS in Tests Issue](https://github.com/vitest-dev/vitest/issues/2834)

## Related Files

- `packages/*/vitest.config.ts` - Test configurations
- `postcss.config.cjs` - PostCSS configuration
- `__mocks__/styleMock.js` - CSS mock file
- All component files with `import '@uswds-wc/core/styles.css'`

## Impact

**Blocked:**
- Component-level unit tests for packages with CSS imports
- Full test suite completion (`pnpm turbo test`)

**Not Blocked:**
- Core utility tests (working)
- Build process (working)
- Development workflow (working)
- Integration tests (can be run separately)

**Business Impact:** Medium
- Tests can be run per-package or manually
- CI/CD can skip affected tests temporarily
- Does not block development or releases
- Should be resolved before 1.0 release

---

**Next Steps:**
1. Implement Phase 1 (install cssnano)
2. Test if this resolves the immediate issue
3. If successful, plan Phase 2 for proper long-term solution
4. Update this document with results
