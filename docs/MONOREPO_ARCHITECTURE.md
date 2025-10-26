# USWDS Web Components - Monorepo Architecture

**Status:** Production Ready ✅
**Last Updated:** 2025-10-23
**Version:** 1.0.0

## Overview

This project uses a **monorepo architecture** with pnpm workspaces and Turborepo to organize USWDS web components into category-based packages, similar to Material-UI's structure.

### Key Benefits

✅ **Category-Based Imports** - Import only the components you need
✅ **Optimized Bundle Sizes** - Tree-shaking at the category level
✅ **Independent Package Development** - Work on forms without affecting navigation
✅ **Shared Core Infrastructure** - Base classes, utilities, and USWDS CSS in one place
✅ **Parallel Builds** - Turborepo builds packages concurrently
✅ **Type Safety** - TypeScript project references ensure proper dependencies

---

## Package Structure

### 9 Packages Total

```
packages/
├── uswds-wc-core/          # @uswds-wc/core - Shared foundation
├── uswds-wc-actions/       # @uswds-wc/actions - User actions (4 components)
├── uswds-wc-forms/         # @uswds-wc/forms - Form controls (15 components)
├── uswds-wc-navigation/    # @uswds-wc/navigation - Site navigation (8 components)
├── uswds-wc-data-display/  # @uswds-wc/data-display - Data presentation (8 components)
├── uswds-wc-feedback/      # @uswds-wc/feedback - User notifications (5 components)
├── uswds-wc-layout/        # @uswds-wc/layout - Content structure (4 components)
├── uswds-wc-structure/     # @uswds-wc/structure - Page sections (1 component)
└── uswds-wc/               # uswds-webcomponents - Meta package (re-exports all)
```

---

## Package Details

### 1. @uswds-wc/core (Foundation Package)

**Purpose:** Shared utilities, base classes, and compiled USWDS CSS

**Contents:**
```
packages/uswds-wc-core/
├── src/
│   ├── components/
│   │   └── base-component.ts      # USWDSBaseComponent (Light DOM)
│   ├── utils/                     # 23 shared utilities
│   │   ├── class-utils.ts
│   │   ├── form-utils.ts
│   │   ├── aria-utils.ts
│   │   └── ...
│   ├── styles.css                 # Compiled USWDS CSS (from gulpfile)
│   └── index.ts                   # Barrel export
└── package.json
```

**Key Exports:**
- `USWDSBaseComponent` - Base class for all components
- 23 utility functions for ARIA, classes, forms, etc.
- USWDS CSS (`@uswds-wc/core/styles.css`)

**Dependencies:**
- `lit` - Web components framework
- No other USWDS packages (foundation layer)

---

### 2. @uswds-wc/actions (4 Components)

**Purpose:** User action components

**Components:**
| Component | Tag | Description |
|-----------|-----|-------------|
| USAButton | `<usa-button>` | USWDS button with variants |
| USALink | `<usa-link>` | USWDS styled link |
| USASearch | `<usa-search>` | Search input with button |
| USAButtonGroup | `<usa-button-group>` | Button grouping layout |

**Bundle Size:** ~12 KB (minified + gzipped)

**Dependencies:**
- `@uswds-wc/core` - Base classes and utilities
- `lit`

**Import Examples:**
```typescript
// Import all actions
import '@uswds-wc/actions';

// Import specific component
import { USAButton } from '@uswds-wc/actions';

// Import from specific path
import '@uswds-wc/actions/button';
```

---

### 3. @uswds-wc/forms (15 Components)

**Purpose:** Form input controls and validation

**Components:**
| Component | Tag | Description |
|-----------|-----|-------------|
| USATextInput | `<usa-text-input>` | Text input field |
| USATextarea | `<usa-textarea>` | Multi-line text input |
| USASelect | `<usa-select>` | Dropdown select |
| USACheckbox | `<usa-checkbox>` | Checkbox input |
| USARadio | `<usa-radio>` | Radio button |
| USADatePicker | `<usa-date-picker>` | Date selection |
| USATimePicker | `<usa-time-picker>` | Time selection |
| USADateRangePicker | `<usa-date-range-picker>` | Date range |
| USAComboBox | `<usa-combo-box>` | Autocomplete dropdown |
| USAFileInput | `<usa-file-input>` | File upload |
| USACharacterCount | `<usa-character-count>` | Character counter |
| USAInputPrefixSuffix | `<usa-input-prefix-suffix>` | Input addons |
| USAMemorableDate | `<usa-memorable-date>` | MM/DD/YYYY input |
| USARangeSlider | `<usa-range-slider>` | Range input |
| USAValidation | `<usa-validation>` | Form validation |

**Bundle Size:** ~120 KB (largest package due to date pickers)

**Dependencies:**
- `@uswds-wc/core`
- `lit`

---

### 4. @uswds-wc/navigation (8 Components)

**Purpose:** Site navigation and menus

**Components:**
| Component | Tag | Description |
|-----------|-----|-------------|
| USAHeader | `<usa-header>` | Site header with nav |
| USAFooter | `<usa-footer>` | Site footer |
| USABreadcrumb | `<usa-breadcrumb>` | Breadcrumb navigation |
| USASideNavigation | `<usa-side-navigation>` | Sidebar menu |
| USAInPageNavigation | `<usa-in-page-navigation>` | Page section nav |
| USAPagination | `<usa-pagination>` | Page navigation |
| USASkipLink | `<usa-skip-link>` | Accessibility skip link |
| USALanguageSelector | `<usa-language-selector>` | Language switcher |

**Bundle Size:** ~35 KB

**Dependencies:**
- `@uswds-wc/core`
- `lit`

---

### 5. @uswds-wc/data-display (8 Components)

**Purpose:** Display structured data

**Components:**
| Component | Tag | Description |
|-----------|-----|-------------|
| USATable | `<usa-table>` | Data table |
| USACard | `<usa-card>` | Content card |
| USAIcon | `<usa-icon>` | USWDS icons |
| USATag | `<usa-tag>` | Label tag |
| USAList | `<usa-list>` | Styled list |
| USAIconList | `<usa-icon-list>` | Icon + text list |
| USACollection | `<usa-collection>` | Collection container |
| USASummaryBox | `<usa-summary-box>` | Summary display |

**Bundle Size:** ~28 KB

**Dependencies:**
- `@uswds-wc/core`
- `lit`

---

### 6. @uswds-wc/feedback (5 Components)

**Purpose:** User feedback and notifications

**Components:**
| Component | Tag | Description |
|-----------|-----|-------------|
| USAAlert | `<usa-alert>` | Alert notification |
| USAModal | `<usa-modal>` | Modal dialog |
| USATooltip | `<usa-tooltip>` | Tooltip popup |
| USABanner | `<usa-banner>` | Government banner |
| USASiteAlert | `<usa-site-alert>` | Site-wide alert |

**Bundle Size:** ~45 KB (Modal is large)

**Dependencies:**
- `@uswds-wc/core`
- `lit`

---

### 7. @uswds-wc/layout (4 Components)

**Purpose:** Page layout and structure

**Components:**
| Component | Tag | Description |
|-----------|-----|-------------|
| USAProse | `<usa-prose>` | Typography container |
| USAStepIndicator | `<usa-step-indicator>` | Step progress |
| USAProcessList | `<usa-process-list>` | Process steps |
| USAIdentifier | `<usa-identifier>` | Agency identifier |

**Bundle Size:** ~18 KB

**Dependencies:**
- `@uswds-wc/core`
- `lit`

---

### 8. @uswds-wc/structure (1 Component)

**Purpose:** Page sectioning components

**Components:**
| Component | Tag | Description |
|-----------|-----|-------------|
| USAAccordion | `<usa-accordion>` | Expandable sections |

**Bundle Size:** ~8 KB

**Dependencies:**
- `@uswds-wc/core`
- `lit`

**Why Separate Package?**
Accordion doesn't fit other categories and may expand to include panels, dividers, etc. in the future.

---

### 9. uswds-webcomponents (Meta Package)

**Purpose:** Convenience package that re-exports all components

**Package Name:** `uswds-webcomponents` (matches original)

**Implementation:**
```typescript
// packages/uswds-wc/src/index.ts
export * from '@uswds-wc/actions';
export * from '@uswds-wc/forms';
export * from '@uswds-wc/navigation';
export * from '@uswds-wc/data-display';
export * from '@uswds-wc/feedback';
export * from '@uswds-wc/layout';
export * from '@uswds-wc/structure';
```

**Usage:**
```typescript
// Import everything (not recommended for production)
import 'uswds-webcomponents';

// Or import specific categories through meta package
import 'uswds-webcomponents/actions';
import 'uswds-webcomponents/forms';
```

**Dependencies:**
- All 7 category packages
- Transitively includes `@uswds-wc/core`

**Bundle Size:** ~266 KB (all components)

---

## Architecture Decisions

### Why pnpm Workspaces?

- **Fast installations** - Content-addressable storage
- **Strict dependency resolution** - Prevents phantom dependencies
- **Workspace protocol** - `workspace:*` for local package references
- **Filter commands** - Build/test specific packages

**Example:**
```bash
pnpm --filter @uswds-wc/forms build
pnpm --filter @uswds-wc/actions test
```

### Why Turborepo?

- **Incremental builds** - Only rebuild changed packages
- **Parallel execution** - Build packages concurrently
- **Remote caching** - Share build artifacts (future)
- **Pipeline configuration** - Define build dependencies

**turbo.json:**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]    // Test after build
    }
  }
}
```

### Why Category-Based Organization?

**Inspired by Material-UI:**
- `@mui/material` - All components
- `@mui/lab` - Experimental components
- `@mui/icons-material` - Icons

**USWDS Equivalent:**
- `uswds-webcomponents` - All components (meta package)
- `@uswds-wc/forms` - Form components
- `@uswds-wc/data-display` - Data components

**Benefits:**
1. **Clear mental model** - "I need form components" → `@uswds-wc/forms`
2. **Tree-shaking friendly** - Import category, tree-shake unused components
3. **Logical grouping** - Components grouped by purpose, not alphabetically
4. **Independent versioning** - Forms can update without affecting navigation

---

## Dependency Graph

```
         ┌─────────────────────────────┐
         │   uswds-webcomponents       │
         │   (meta package)            │
         └──────────────┬──────────────┘
                        │ (re-exports)
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐               ┌───────────────┐
│ @uswds-wc/    │               │ @uswds-wc/    │
│ actions       │               │ forms         │
└───────┬───────┘               └───────┬───────┘
        │                               │
        │        ┌───────────────┐      │
        └────────►  @uswds-wc/  ◄──────┘
                 │   core       │
                 └───────────────┘
                         │
                    (provides)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
  Base Classes     Utilities        USWDS CSS
  USWDSBase...    23 helpers      styles.css
```

**Key Points:**
- **All packages depend on core** - Shared foundation
- **No cross-package dependencies** - Forms doesn't depend on navigation
- **Meta package sits on top** - Convenience layer

---

## Build System

### Turborepo Pipeline

**Build Order:**
1. `@uswds-wc/core` (no dependencies)
2. All category packages in parallel (depend on core)
3. `uswds-webcomponents` meta package (depends on all)

**Commands:**
```bash
# Build everything (parallel where possible)
pnpm run build

# Build specific package
pnpm --filter @uswds-wc/forms build

# Build package and its dependencies
pnpm --filter @uswds-wc/forms... build
```

### TypeScript Project References

**Root tsconfig.json:**
```json
{
  "files": [],
  "references": [
    { "path": "./packages/uswds-wc-core" },
    { "path": "./packages/uswds-wc-actions" },
    { "path": "./packages/uswds-wc-forms" },
    // ... all packages
  ]
}
```

**Package tsconfig.json:**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,  // Enable project references
    "outDir": "./dist"
  },
  "references": [
    { "path": "../uswds-wc-core" }  // Only core dependency
  ]
}
```

**Benefits:**
- Incremental TypeScript builds
- Proper type checking across packages
- IDE navigation between packages

---

## Testing Strategy

### Per-Package Testing

Each package has its own tests co-located with components:

```
packages/uswds-wc-forms/src/components/text-input/
├── usa-text-input.ts
├── usa-text-input.test.ts           # Unit tests
├── usa-text-input.layout.test.ts    # Layout/structure
├── usa-text-input.stories.ts        # Storybook
└── README.mdx
```

**Test Commands:**
```bash
# Test all packages
pnpm test

# Test specific package
pnpm --filter @uswds-wc/forms test

# Visual regression (all components)
pnpm run test:visual
```

### Test Types

1. **Unit Tests** - Vitest (component logic)
2. **Layout Tests** - DOM structure validation
3. **Visual Tests** - Playwright snapshots
4. **USWDS Compliance** - Automated validation
5. **Accessibility** - axe-core integration

---

## Import Patterns

### For Users

**Option 1: Meta Package (Easiest)**
```typescript
import 'uswds-webcomponents';  // All components (~266 KB)
```

**Option 2: Category Imports (Recommended)**
```typescript
import 'uswds-webcomponents/forms';        // All forms (~120 KB)
import 'uswds-webcomponents/actions';      // Buttons, links (~12 KB)
import 'uswds-webcomponents/navigation';   // Headers, footers (~35 KB)
```

**Option 3: Named Imports (Best Tree-Shaking)**
```typescript
import { USAButton } from 'uswds-webcomponents/actions';
import { USATextInput } from 'uswds-webcomponents/forms';
```

**Option 4: Direct Package Imports (Advanced)**
```typescript
import '@uswds-wc/actions';
import { USAButton } from '@uswds-wc/actions';
```

### For Developers

**Importing Core Utilities:**
```typescript
import { USWDSBaseComponent } from '@uswds-wc/core';
import '@uswds-wc/core/styles.css';
import { updateClasses, setAriaLabel } from '@uswds-wc/core';
```

**Cross-Package Imports (Avoid):**
```typescript
// ❌ Don't do this
import { USAButton } from '@uswds-wc/actions';  // From forms package

// ✅ Use composition instead
import '../../../uswds-wc-actions/src/components/button/index.js';
```

---

## Development Workflow

### Adding a New Component

**1. Choose Package:**
- Forms? → `packages/uswds-wc-forms`
- Navigation? → `packages/uswds-wc-navigation`
- etc.

**2. Create Component:**
```bash
cd packages/uswds-wc-forms/src/components
mkdir my-input
cd my-input
touch usa-my-input.ts
touch usa-my-input.test.ts
touch usa-my-input.stories.ts
touch usa-my-input.layout.test.ts
touch README.mdx
touch index.ts
```

**3. Export from Package:**
```typescript
// packages/uswds-wc-forms/src/index.ts
export * from './components/my-input/index.js';
```

**4. Build and Test:**
```bash
pnpm --filter @uswds-wc/forms build
pnpm --filter @uswds-wc/forms test
```

### Working on Multiple Packages

**Terminal 1: Watch Core**
```bash
pnpm --filter @uswds-wc/core dev
```

**Terminal 2: Watch Forms**
```bash
pnpm --filter @uswds-wc/forms dev
```

**Terminal 3: Storybook**
```bash
pnpm run storybook  # Shows all packages
```

---

## Publishing Strategy

### Individual Package Publishing

Each package is independently versioned and published:

```bash
# Publish core first
cd packages/uswds-wc-core
npm publish

# Then category packages
cd packages/uswds-wc-forms
npm publish

# Finally meta package
cd packages/uswds-wc
npm publish
```

### Versioning

**Semantic Versioning:**
- `@uswds-wc/core@1.0.0` - Stable
- `@uswds-wc/forms@1.0.0` - Stable
- `uswds-webcomponents@1.0.0` - Meta package version

**Independent Versions:**
- Forms can be `1.2.0` while navigation is `1.1.0`
- Core is foundation, updates carefully
- Meta package version = latest compatible set

---

## Migration from Old Structure

### Old Import Pattern
```typescript
import { USAButton } from 'uswds-webcomponents/components/button';
```

### New Import Pattern
```typescript
import { USAButton } from 'uswds-webcomponents/actions';
// Or
import { USAButton } from '@uswds-wc/actions';
```

### Breaking Changes

- Path changes: `components/button` → `actions` or `actions/button`
- Package names: Single package → 9 packages
- Core utilities: Direct import → `@uswds-wc/core` import

### Migration Guide

See [MONOREPO_MIGRATION_GUIDE.md](./archived/MONOREPO_MIGRATION_GUIDE.md) (archived) for historical migration process.

---

## Turborepo Remote Caching

### Performance Impact

Turborepo's remote caching delivers **dramatic performance improvements** by sharing build artifacts across:
- Your local machines
- Team members
- CI/CD pipelines

**Build Performance:**

| Environment | Without Cache | With Remote Cache | Speedup |
|-------------|---------------|-------------------|---------|
| **Local Development** | 39s | 0.35s | **111x faster** |
| **CI/CD Pipeline** | ~5min | ~30s | **10x faster** |
| **Pull Request Validation** | ~10min | ~1min | **10x faster** |

### How It Works

**1. Task Hashing**
- Turborepo creates unique hash based on:
  - Input files (source code)
  - Dependencies (package.json, pnpm-lock.yaml)
  - Configuration (tsconfig.json, vite.config.ts)
  - Environment variables

**2. Cache Check**
- Before running task, check remote cache for matching hash
- If found: restore outputs, skip execution (**FULL TURBO**)
- If not found: run task, upload outputs to cache

**3. Cache Sharing**
- Cache shared across all developers and CI
- First developer builds → everyone else gets instant results
- Zero duplicate work across team

### Setup Instructions

**One-Time Local Setup:**

```bash
# 1. Login to Vercel (free for personal projects)
pnpm dlx turbo login

# 2. Link to your team
pnpm dlx turbo link

# 3. Verify setup
pnpm run build
# Should see: "Remote caching enabled"
```

**CI/CD Setup (GitHub Actions):**

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      - name: Build with Turborepo cache
        run: pnpm run build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

**Environment Variables:**

```bash
# .env (gitignored - for local development)
TURBO_TOKEN=your_vercel_token_here
TURBO_TEAM=your_team_name

# GitHub repository secrets (for CI/CD)
# Settings → Secrets → Actions
TURBO_TOKEN=<from Vercel>
TURBO_TEAM=<your team name>
```

### Cache Configuration

**turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true  // Enable caching for builds
    },
    "test": {
      "cache": true,  // Cache test results
      "outputs": ["coverage/**"]
    },
    "lint": {
      "cache": true  // Even linting can be cached!
    }
  }
}
```

### Performance Example

**First Developer (Cold Cache):**
```bash
$ pnpm run build
✓ @uswds-wc/core:build      3.2s
✓ @uswds-wc/actions:build   4.1s
✓ @uswds-wc/forms:build    12.5s
✓ @uswds-wc/navigation:build 6.3s
# ... all packages
Total: 39s
>>> Cached to remote
```

**Second Developer (Warm Cache):**
```bash
$ pnpm run build
✓ @uswds-wc/core:build      0.02s (cache)
✓ @uswds-wc/actions:build   0.03s (cache)
✓ @uswds-wc/forms:build     0.08s (cache)
✓ @uswds-wc/navigation:build 0.04s (cache)
# ... all packages
Total: 0.35s
>>> FULL TURBO (111x faster!)
```

### Benefits

**For Developers:**
- ✅ Switch branches instantly (cached builds restored)
- ✅ Clean installs complete in seconds
- ✅ No waiting for builds you've run before
- ✅ Same speed on all your machines

**For Teams:**
- ✅ New developers productive immediately
- ✅ Shared cache reduces duplicate work
- ✅ Consistent build times across team
- ✅ Faster code reviews (instant PR builds)

**For CI/CD:**
- ✅ 10x faster CI pipelines
- ✅ Reduced GitHub Actions minutes (cost savings)
- ✅ Faster deployments
- ✅ Parallel test execution with caching

### Cache Management

**Force Rebuild (Bypass Cache):**
```bash
pnpm turbo build --force
```

**Clear Local Cache:**
```bash
rm -rf node_modules/.cache/turbo
```

**Check Cache Status:**
```bash
pnpm turbo run build --summarize
# Shows cache hits/misses
```

**Cache Storage:**
- **Local**: `node_modules/.cache/turbo/`
- **Remote**: Vercel's free caching service
- **Retention**: 7 days by default (configurable)

### Troubleshooting

**Issue: "Remote caching not enabled"**
```bash
# Solution: Login and link
pnpm dlx turbo login
pnpm dlx turbo link

# Verify environment variables exist
cat .env | grep TURBO
```

**Issue: Cache misses on unchanged code**
```bash
# Check what's changing
pnpm turbo run build --summarize

# Common causes:
# - .env file changes
# - Timestamps in generated files
# - Non-deterministic build outputs
```

**Issue: CI not using cache**
```bash
# Verify secrets are set in GitHub
# Settings → Secrets → Actions
# - TURBO_TOKEN
# - TURBO_TEAM

# Check workflow logs for:
# "Remote caching enabled"
```

### Best Practices

1. **Always Use Cache for Local Development**
   - Run `turbo login` and `turbo link` on setup
   - Speeds up all workflows significantly

2. **Enable Cache in CI/CD**
   - Add TURBO_TOKEN and TURBO_TEAM secrets
   - Massive time savings on PRs and deployments

3. **Cache All Expensive Tasks**
   - Builds (already cached)
   - Tests (already cached)
   - Linting (already cached)
   - Type checking (already cached)

4. **Monitor Cache Performance**
   - Use `--summarize` flag to see cache hits
   - Track build times over time
   - Optimize tasks with frequent cache misses

5. **Keep Builds Deterministic**
   - Avoid timestamps in outputs
   - Use fixed versions, not `latest`
   - Ensure consistent build outputs

---

## Future Enhancements

### Potential New Packages

- `@uswds-wc/patterns` - Common UI patterns
- `@uswds-wc/templates` - Full page templates
- `@uswds-wc/utilities` - CSS utilities as web components
- `@uswds-wc/experimental` - Beta components

### Changesets Integration

Automated changelog and versioning:

```bash
pnpm changeset  # Create changelog entry
pnpm changeset version  # Bump versions
pnpm changeset publish  # Publish to npm
```

---

## Troubleshooting

### Build Fails for One Package

```bash
# Clean and rebuild
pnpm --filter @uswds-wc/forms clean
pnpm --filter @uswds-wc/forms build

# Or rebuild with dependencies
pnpm --filter @uswds-wc/forms... build
```

### Type Errors Across Packages

```bash
# Rebuild TypeScript project references
pnpm run build --force

# Or rebuild specific package
pnpm --filter @uswds-wc/forms build --force
```

### Workspace Dependency Issues

```bash
# Reinstall all dependencies
rm -rf node_modules packages/*/node_modules
pnpm install

# Verify workspace links
ls -la packages/uswds-wc-forms/node_modules/@uswds-wc
```

---

## References

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Material-UI Monorepo](https://github.com/mui/material-ui) - Inspiration

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-23
**Status:** Production Ready ✅

For questions or contributions, see [CONTRIBUTING.md](../CONTRIBUTING.md)
