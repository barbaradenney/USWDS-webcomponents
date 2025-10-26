# Monorepo Developer Guide

**Complete developer reference for working with the USWDS Web Components monorepo**

**Date Created:** October 26, 2025
**Architecture:** pnpm workspaces + Turborepo
**Performance:** 111x faster builds with remote caching

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Monorepo Architecture](#monorepo-architecture)
3. [Development Commands](#development-commands)
4. [Package Management](#package-management)
5. [Testing](#testing)
6. [Building & Deploying](#building--deploying)
7. [Turborepo Remote Caching](#turborepo-remote-caching)
8. [Adding New Components](#adding-new-components)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

```bash
# Install pnpm globally (required)
npm install -g pnpm

# Verify installation
pnpm --version  # Should be 8.x or higher
```

### Clone and Setup

```bash
# Clone repository
git clone https://github.com/barbaradenney/USWDS-webcomponents.git
cd USWDS-webcomponents

# Install all dependencies (uses pnpm workspaces)
pnpm install

# Build all packages (uses Turborepo)
pnpm run build

# Run all tests
pnpm test

# Start Storybook
pnpm run storybook
```

### Setup Turborepo Remote Caching (Optional but Recommended)

```bash
# One-time setup for 111x faster builds
pnpm dlx turbo login
pnpm dlx turbo link

# Now all builds use remote cache automatically!
pnpm run build  # 0.35s with cache vs 39s without
```

---

## Monorepo Architecture

### Package Structure

The repository is organized into **11 independent packages**:

```
packages/
├── uswds-wc-core/              # @uswds-wc/core
│   ├── src/
│   │   ├── styles/             # Compiled USWDS CSS
│   │   ├── utils/              # Shared utilities
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── uswds-wc-actions/           # @uswds-wc/actions (4 components)
├── uswds-wc-forms/             # @uswds-wc/forms (15 components)
├── uswds-wc-navigation/        # @uswds-wc/navigation (8 components)
├── uswds-wc-data-display/      # @uswds-wc/data-display (8 components)
├── uswds-wc-feedback/          # @uswds-wc/feedback (5 components)
├── uswds-wc-layout/            # @uswds-wc/layout (4 components)
├── uswds-wc-structure/         # @uswds-wc/structure (1 component)
├── uswds-wc-test-utils/        # @uswds-wc/test-utils (shared)
├── components/                 # Legacy meta-package
└── uswds-wc/                   # @uswds-wc (all components)
```

### Component Package Structure

Each component package follows this structure:

```
packages/uswds-wc-actions/
├── src/
│   ├── components/
│   │   ├── button/
│   │   │   ├── usa-button.ts           # Component implementation
│   │   │   ├── usa-button.test.ts      # Unit tests
│   │   │   ├── usa-button.stories.ts   # Storybook stories
│   │   │   ├── README.mdx              # Component documentation
│   │   │   └── index.ts                # Export
│   │   ├── link/
│   │   └── search/
│   └── index.ts                         # Package exports
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── vite.config.ts
```

### Workspace Dependencies

Packages can depend on each other using the `workspace:*` protocol:

```json
{
  "name": "@uswds-wc/actions",
  "dependencies": {
    "@uswds-wc/core": "workspace:*"
  },
  "devDependencies": {
    "@uswds-wc/test-utils": "workspace:*"
  }
}
```

---

## Development Commands

### Root Commands (All Packages)

```bash
# Build all packages in parallel
pnpm run build

# Test all packages
pnpm test

# Type check all packages
pnpm run typecheck

# Lint all packages
pnpm run lint

# Start Storybook
pnpm run storybook

# Clean all build outputs
pnpm run clean
```

### Package-Specific Commands

```bash
# Build specific package
pnpm --filter @uswds-wc/forms build

# Test specific package
pnpm --filter @uswds-wc/actions test

# Run multiple packages
pnpm --filter "@uswds-wc/forms" --filter "@uswds-wc/actions" build

# Run command in all packages matching pattern
pnpm --filter "@uswds-wc/*" build
```

### Turborepo Commands

```bash
# Build with Turborepo (parallel + caching)
pnpm turbo build

# Force rebuild (bypass cache)
pnpm turbo build --force

# Run tests with cache
pnpm turbo test

# Filter specific packages
pnpm turbo build --filter=@uswds-wc/forms
pnpm turbo test --filter=@uswds-wc/actions...

# Run with summary
pnpm turbo build --summarize
```

---

## Package Management

### Adding Dependencies

```bash
# Add to root (affects all packages)
pnpm add -D typescript -w

# Add to specific package
pnpm --filter @uswds-wc/forms add lit

# Add workspace dependency
pnpm --filter @uswds-wc/forms add @uswds-wc/core -D
```

### Removing Dependencies

```bash
# Remove from specific package
pnpm --filter @uswds-wc/forms remove some-package

# Remove from root
pnpm remove -w some-package
```

### Updating Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update lit

# Update workspace dependencies
pnpm update --filter "@uswds-wc/*"
```

---

## Testing

### Test Architecture

**Total:** 2301/2301 tests passing across all packages

**Distribution:**
- `@uswds-wc/core`: 9 tests
- `@uswds-wc/actions`: 150+ tests
- `@uswds-wc/forms`: 650+ tests
- `@uswds-wc/navigation`: 550+ tests
- `@uswds-wc/data-display`: 400+ tests
- `@uswds-wc/feedback`: 250+ tests
- `@uswds-wc/layout`: 282 tests
- `@uswds-wc/structure`: 60+ tests

### Running Tests

```bash
# Run all tests (parallel across packages)
pnpm test

# Run tests for specific package
pnpm --filter @uswds-wc/forms test

# Watch mode
pnpm --filter @uswds-wc/forms test:watch

# With coverage
pnpm run test:coverage

# Run tests with Turborepo (explicit)
pnpm turbo test
```

### Test Performance

**Without Turborepo (sequential):**
```bash
Time: ~5-7 minutes for all 2301 tests
```

**With Turborepo (parallel):**
```bash
Time: ~1-2 minutes for all 2301 tests
```

**With remote cache (unchanged code):**
```bash
Time: ~5-10 seconds (all tests skipped!)
```

---

## Building & Deploying

### Build Commands

```bash
# Build all packages (parallel)
pnpm run build

# Build specific package
pnpm --filter @uswds-wc/forms build

# Build with Turborepo
pnpm turbo build

# Clean and rebuild
pnpm run clean && pnpm run build
```

### Build Performance

| Environment | Without Cache | With Remote Cache | Speedup |
|-------------|---------------|-------------------|---------|
| **Local** | 39s | 0.35s | **111x** |
| **CI/CD** | ~5min | ~30s | **10x** |

### Build Outputs

Each package generates:
```
packages/uswds-wc-actions/
├── dist/
│   ├── index.js              # ESM bundle
│   ├── index.d.ts            # TypeScript declarations
│   ├── components/           # Individual component bundles
│   └── styles.css            # Package-specific styles (if any)
```

### Publishing

```bash
# Create changeset (describe changes)
pnpm changeset

# Version packages based on changesets
pnpm run release:version

# Publish to npm
pnpm run release:publish
```

---

## Turborepo Remote Caching

### What is Remote Caching?

Turborepo can cache build outputs remotely and share them across:
- Your team members
- CI/CD pipelines
- Different machines

**Result:** 111x faster builds!

### Setup

**Local Setup (One-time):**
```bash
# Login to Vercel (free for personal projects)
pnpm dlx turbo login

# Link to your team
pnpm dlx turbo link

# Verify setup
pnpm run build  # Should see "Remote caching enabled"
```

**Environment Variables:**
```bash
# .env (gitignored)
TURBO_TOKEN=your_token_here
TURBO_TEAM=your_team_name
```

### How It Works

1. **Task Hashing** - Turborepo creates unique hash based on:
   - Input files
   - Dependencies
   - Configuration
   - Environment variables

2. **Cache Check** - Before running task:
   - Check remote cache for matching hash
   - If found, restore outputs and skip execution
   - If not found, run task and upload outputs

3. **Cache Sharing** - Cache is shared:
   - Across your local machines
   - With your team members
   - In CI/CD pipelines

### Performance Example

```bash
# First developer builds
$ pnpm run build
✓ Built in 39s
✓ Cached to remote

# Second developer builds (same code)
$ pnpm run build
✓ Restored from cache in 0.35s
>>> FULL TURBO (111x faster!)
```

---

## Adding New Components

### Using the Component Generator

```bash
# Interactive mode (recommended)
pnpm run generate:component -- --interactive

# Specify name and package
pnpm run generate:component -- --name=my-component --package=forms
```

### Manual Creation

1. **Choose the correct package:**
   - Forms → `packages/uswds-wc-forms/`
   - Actions → `packages/uswds-wc-actions/`
   - Navigation → `packages/uswds-wc-navigation/`
   - etc.

2. **Create component directory:**
```bash
cd packages/uswds-wc-forms/src/components
mkdir my-component
```

3. **Create component files:**
```bash
touch usa-my-component.ts
touch usa-my-component.test.ts
touch usa-my-component.stories.ts
touch README.mdx
touch index.ts
```

4. **Export from package:**
```typescript
// packages/uswds-wc-forms/src/index.ts
export { USAMyComponent } from './components/my-component';
```

5. **Build and test:**
```bash
pnpm --filter @uswds-wc/forms build
pnpm --filter @uswds-wc/forms test
```

---

## Best Practices

### 1. Use Workspace Dependencies

```json
// ✅ Good - Use workspace protocol
{
  "dependencies": {
    "@uswds-wc/core": "workspace:*"
  }
}

// ❌ Bad - Don't use version numbers
{
  "dependencies": {
    "@uswds-wc/core": "^1.0.0"
  }
}
```

### 2. Filter Commands for Speed

```bash
# ✅ Good - Only build what you need
pnpm --filter @uswds-wc/forms build

# ❌ Less efficient - Builds everything
pnpm run build
```

### 3. Leverage Turborepo Caching

```bash
# Let Turborepo handle caching
pnpm turbo build

# Turborepo will:
# - Skip unchanged packages
# - Run changed packages in parallel
# - Use remote cache when available
```

### 4. Keep Packages Focused

- Each package should have a clear purpose
- Avoid circular dependencies
- Share code through @uswds-wc/core or @uswds-wc/test-utils

### 5. Co-locate Tests and Stories

```
component/
├── usa-component.ts        # Component
├── usa-component.test.ts   # Tests (same directory)
├── usa-component.stories.ts # Stories (same directory)
└── README.mdx              # Docs (same directory)
```

---

## Troubleshooting

### Issue: "Cannot find module '@uswds-wc/core'"

**Solution:** Install dependencies
```bash
pnpm install
```

### Issue: Build fails with "Type error"

**Solution:** Ensure all packages are built
```bash
# Build core first (other packages depend on it)
pnpm --filter @uswds-wc/core build

# Then build all
pnpm run build
```

### Issue: Tests fail after changes

**Solution:** Clear caches and rebuild
```bash
pnpm run clean
pnpm install
pnpm run build
pnpm test
```

### Issue: Turborepo cache not working

**Solution:** Check environment variables
```bash
# Verify .env file exists
cat .env

# Should contain:
# TURBO_TOKEN=...
# TURBO_TEAM=...

# Or login again
pnpm dlx turbo login
pnpm dlx turbo link
```

### Issue: Storybook not loading components

**Solution:** Build packages first
```bash
pnpm run build
pnpm run storybook
```

### Issue: Package not found in workspace

**Solution:** Verify package.json name matches
```bash
# Check package name
cat packages/uswds-wc-forms/package.json | grep '"name"'

# Should be: "@uswds-wc/forms"
```

---

## Additional Resources

### Documentation
- [Monorepo Migration Final Status](./MONOREPO_MIGRATION_FINAL_STATUS.md) - Complete migration details
- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing documentation
- [Turborepo Remote Cache Setup](./TURBOREPO_REMOTE_CACHE_SETUP.md) - Cache configuration guide
- [CLAUDE.md](../CLAUDE.md) - Development guidelines

### External Resources
- [pnpm Workspaces](https://pnpm.io/workspaces) - pnpm documentation
- [Turborepo Documentation](https://turbo.build/repo/docs) - Turborepo guides
- [USWDS Documentation](https://designsystem.digital.gov/) - Official USWDS

---

**Last Updated:** October 26, 2025
**Monorepo Version:** 2.0.0
**Status:** Production Ready ✅
