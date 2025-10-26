# USWDS Web Components - Monorepo Migration Guide

**Status:** In Progress  
**Branch:** `feature/monorepo-migration`  
**Target Structure:** pnpm workspace with multiple publishable packages  
**Estimated Time:** 2-3 hours

## Table of Contents

- [Overview](#overview)
- [Current Progress](#current-progress)
- [Prerequisites](#prerequisites)
- [Migration Steps](#migration-steps)
- [Testing Checkpoints](#testing-checkpoints)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)
- [Post-Migration](#post-migration)

---

## Overview

### Why Monorepo?

This migration converts the current single-package repository into a monorepo with multiple independently-versioned packages:

- `@uswds-wc/components` - Existing 45 USWDS components
- `@uswds-wc/patterns` - USWDS patterns (future)
- `@uswds-wc/templates` - Full-page templates (future)
- `@uswds-wc/cli` - Project scaffolding tool (future)

### Benefits

✅ Independent versioning (components v1.x, patterns v0.x)  
✅ Loose coupling between packages  
✅ Shared tooling and standards  
✅ Multiple consumption modes (npm, CDN, CLI)  
✅ Clear dependency hierarchy

### Current Structure

```
uswds-wc/
├── src/                  # All source code
├── __tests__/            # All tests
├── .storybook/           # Storybook config
├── scripts/              # Build/validation scripts
├── package.json          # Single package
└── ...
```

### Target Structure

```
uswds-wc/
├── packages/
│   ├── components/       # @uswds-wc/components
│   │   ├── src/          # (moved from root)
│   │   ├── __tests__/    # (moved from root)
│   │   ├── package.json  # New package config
│   │   └── ...
│   ├── patterns/         # @uswds-wc/patterns (future)
│   └── templates/        # @uswds-wc/templates (future)
├── package.json          # Workspace root config
├── pnpm-workspace.yaml   # Workspace definition
└── ...
```

---

## Current Progress

✅ **Completed:**
- Created `feature/monorepo-migration` branch
- Created `pnpm-workspace.yaml`
- Created `packages/components/` directory
- Created `packages/components/package.json` with `@uswds-wc/components` scope

❌ **Remaining:**
- Move source code to packages/components/
- Update root package.json for workspace
- Update all import paths and configs
- Update build system
- Update test configurations
- Verify everything still works
- Add patterns package (proof-of-concept)

---

## Prerequisites

### Tools Required

```bash
# Verify pnpm is installed
which pnpm
# Should show: /Users/.../.nvm/versions/node/v22.17.1/bin/pnpm

# Verify Git is clean (except for our migration branch)
git status

# Verify you're on the migration branch
git branch --show-current
# Should show: feature/monorepo-migration
```

### Backup Recommendation

```bash
# Create a backup branch from main
git checkout main
git checkout -b backup/pre-monorepo-$(date +%Y%m%d)
git checkout feature/monorepo-migration
```

---

## Migration Steps

### Step 1: Move Source Code

**Move src/ to packages/components/src/**

```bash
# From repository root
git mv src packages/components/src
```

**Expected result:**
```
packages/components/src/
├── components/
├── styles/
├── utils/
└── index.ts
```

**Checkpoint:** `git status` should show `src/ -> packages/components/src/`

---

### Step 2: Move Tests

**Move __tests__/ to packages/components/__tests__/**

```bash
git mv __tests__ packages/components/__tests__
```

**Expected result:**
```
packages/components/__tests__/
├── integration/
├── test-utils.ts
└── ...
```

---

### Step 3: Copy Essential Files to Components Package

These files are needed for the components package to build/test independently:

```bash
# TypeScript config
cp tsconfig.json packages/components/tsconfig.json

# Vite config (will need updates)
cp vite.config.ts packages/components/vite.config.ts

# Vitest config (will need updates)
cp vitest.config.ts packages/components/vitest.config.ts

# README (will need updates)
cp README.md packages/components/README.md

# Changelog
cp CHANGELOG.md packages/components/CHANGELOG.md
```

---

### Step 4: Update Root package.json

The root package.json becomes a workspace manager. Create this replacement:

```json
{
  "name": "uswds-webcomponents-monorepo",
  "version": "1.1.0",
  "private": true,
  "description": "USWDS Web Components Monorepo - Components, Patterns, and Templates",
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "// WORKSPACE COMMANDS": "",
    "dev": "pnpm --filter @uswds-wc/components dev",
    "build": "pnpm --filter @uswds-wc/components build",
    "test": "pnpm --filter @uswds-wc/components test",
    "storybook": "pnpm --filter @uswds-wc/components storybook",
    
    "// BUILD ALL PACKAGES": "",
    "build:all": "pnpm -r build",
    "test:all": "pnpm -r test",
    
    "// PACKAGE MANAGEMENT": "",
    "changeset": "changeset",
    "changeset:version": "changeset version",
    "changeset:publish": "changeset publish",
    
    "// DEVELOPMENT": "",
    "clean": "pnpm -r clean && rm -rf node_modules",
    "install:all": "pnpm install",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "typescript": "^5.0.0"
  },
  "pnpm": {
    "overrides": {
      "lit": "^3.0.0"
    }
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/barbaradenney/uswds-wc.git"
  },
  "author": "Barbara Miles",
  "license": "MIT"
}
```

**Save this as the new root package.json**, but FIRST:

```bash
# Backup current package.json
cp package.json package.json.backup

# Then replace with workspace version above
```

---

### Step 5: Update packages/components/tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "declarationDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

---

### Step 6: Update packages/components/vite.config.ts

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['lit', 'lit/decorators.js', 'lit/directives/class-map.js'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

---

### Step 7: Update packages/components/vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/test-utils.ts'],
    include: ['src/**/*.test.ts', '__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

---

### Step 8: Update Scripts to Use Workspace

Many scripts in the root need to be updated or moved. Here's the strategy:

**Scripts that stay in root:**
- Repository-wide validation (USWDS compliance, docs, etc.)
- Git hooks (pre-commit, pre-push)
- Monorepo management (changesets, etc.)

**Scripts that move to packages/components:**
- Component-specific build scripts
- Component-specific tests

**Update .husky/pre-commit to work with monorepo:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run validations from workspace root
cd "$(git rev-parse --show-toplevel)"

# Component-specific validation runs from components package
echo "🎯 Running monorepo pre-commit validation..."

# Repository organization (root level)
bash scripts/validation/stages/00-discovered-issues.sh || exit 1
bash scripts/validation/stages/01-repository-organization.sh || exit 1

# Component validation (in components package)
cd packages/components
pnpm run lint || exit 1
pnpm run typecheck || exit 1
pnpm run test || exit 1

echo "✅ All pre-commit checks passed!"
```

---

### Step 9: Install Dependencies

```bash
# From repository root
pnpm install

# This will:
# 1. Install workspace dependencies
# 2. Link packages together
# 3. Install package-specific dependencies
```

**Expected output:**
```
Scope: all 2 workspace projects
packages/components                      | Progress: resolved 1, reused 0, downloaded 0, added 0
...
Done in 10s
```

---

### Step 10: Update Storybook Configuration

Storybook config in `.storybook/` needs to know about the new package location.

**Update .storybook/main.ts:**

```typescript
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: [
    '../packages/components/src/**/*.mdx',
    '../packages/components/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Update path to components
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/packages/components/src',
    };
    return config;
  },
};

export default config;
```

---

## Testing Checkpoints

### Checkpoint 1: Build Succeeds

```bash
cd packages/components
pnpm run build

# Should output:
# dist/
# ├── index.js
# ├── index.d.ts
# ├── components/
# └── ...
```

**If build fails:**
- Check tsconfig.json paths
- Check vite.config.ts entry points
- Verify src/ was moved correctly

---

### Checkpoint 2: Tests Pass

```bash
cd packages/components
pnpm run test

# Should show:
# ✓ All tests passing
# Test Files  150 passed (150)
# Tests  2627 passed (2627)
```

**If tests fail:**
- Check test imports
- Check __tests__/test-utils.ts path
- Verify vitest.config.ts setup

---

### Checkpoint 3: Storybook Starts

```bash
cd ../../  # Back to root
pnpm run storybook

# Should start on port 6006
```

**If Storybook fails:**
- Check .storybook/main.ts stories paths
- Check .storybook/preview.ts imports
- Verify components are accessible

---

### Checkpoint 4: Validation Scripts Work

```bash
cd packages/components
pnpm run lint
pnpm run typecheck

# Both should pass
```

---

## Rollback Procedure

If anything goes wrong and you need to rollback:

### Option 1: Discard Migration Branch

```bash
git checkout main
git branch -D feature/monorepo-migration
# Start over from step 1
```

### Option 2: Restore from Backup

```bash
git checkout backup/pre-monorepo-YYYYMMDD
git checkout -b feature/monorepo-migration-attempt2
# Try again with lessons learned
```

### Option 3: Revert Specific Changes

```bash
# If only some steps failed
git checkout feature/monorepo-migration
git reset --hard HEAD~N  # Where N is number of commits to undo
# Re-apply steps that worked
```

---

## Troubleshooting

### Issue: pnpm install fails

**Symptoms:**
```
ERR_PNPM_NO_MATCHING_VERSION
```

**Solutions:**
1. Delete `node_modules` and `pnpm-lock.yaml`
2. Run `pnpm install` again
3. Check pnpm version: `pnpm --version` (should be 8.0+)

---

### Issue: Imports not resolving

**Symptoms:**
```
Cannot find module '@/components/button'
```

**Solutions:**
1. Check tsconfig.json `paths` configuration
2. Verify `src/` was moved to `packages/components/src/`
3. Update import statements to use relative paths temporarily
4. Check vite.config.ts `resolve.alias`

---

### Issue: Build produces wrong output

**Symptoms:**
```
dist/ is empty or has wrong structure
```

**Solutions:**
1. Check vite.config.ts `build.lib.entry`
2. Verify `src/index.ts` exists at correct path
3. Check `package.json` main/module/exports
4. Clear dist: `rm -rf dist && pnpm run build`

---

### Issue: Tests can't find components

**Symptoms:**
```
Error: Cannot find module './components/button'
```

**Solutions:**
1. Check vitest.config.ts `setupFiles` path
2. Verify `__tests__/test-utils.ts` moved correctly
3. Update test imports to use `@/` alias
4. Check vitest.config.ts `resolve.alias`

---

### Issue: Storybook can't find stories

**Symptoms:**
```
No stories found
```

**Solutions:**
1. Check `.storybook/main.ts` stories glob paths
2. Verify stories files exist in new location
3. Clear Storybook cache: `rm -rf node_modules/.cache/storybook`
4. Restart Storybook

---

### Issue: Pre-commit hooks fail

**Symptoms:**
```
bash: scripts/validation/...: No such file or directory
```

**Solutions:**
1. Update `.husky/pre-commit` paths
2. Keep validation scripts at workspace root
3. Use `cd $(git rev-parse --show-toplevel)` to ensure correct directory

---

## Post-Migration

### Step 1: Verify Everything Works

```bash
# Full build
pnpm run build:all

# Full test suite
pnpm run test:all

# Storybook
pnpm run storybook
```

### Step 2: Add Patterns Package (Proof of Concept)

See [PATTERNS_IMPLEMENTATION_GUIDE.md](./PATTERNS_IMPLEMENTATION_GUIDE.md) for next steps.

### Step 3: Update Documentation

- [ ] Update main README.md with monorepo structure
- [ ] Update CONTRIBUTING.md with workspace commands
- [ ] Update .storybook/About.mdx with new architecture
- [ ] Add monorepo badges to README

### Step 4: Commit and Merge

```bash
# Stage all changes
git add .

# Commit
git commit -m "feat: migrate to monorepo structure with pnpm workspaces

BREAKING CHANGE: Repository restructured as monorepo

- Moved components to packages/components/ (@uswds-wc/components)
- Set up pnpm workspace configuration
- Updated build and test configs for monorepo
- Preserved all existing functionality
- Prepared for patterns and templates packages

Migration guide: docs/MONOREPO_MIGRATION_GUIDE.md"

# Push
git push origin feature/monorepo-migration

# Create PR (when ready)
gh pr create --title "feat: migrate to monorepo structure" \
  --body "See docs/MONOREPO_MIGRATION_GUIDE.md for details"
```

### Step 5: Update CI/CD

Update `.github/workflows/` to work with monorepo:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Test all packages
        run: pnpm run test:all
```

---

## Commands Reference

### Workspace Commands

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm -r build

# Test all packages
pnpm -r test

# Run command in specific package
pnpm --filter @uswds-wc/components build
pnpm --filter @uswds-wc/components test

# Add dependency to workspace root
pnpm add -w <package>

# Add dependency to specific package
pnpm --filter @uswds-wc/components add <package>

# Update all dependencies
pnpm update -r

# Clean everything
pnpm -r clean
rm -rf node_modules
pnpm install
```

### Changesets (Versioning)

```bash
# Create a changeset (after making changes)
pnpm changeset

# Version packages (updates package.json versions)
pnpm changeset version

# Publish to npm
pnpm changeset publish
```

---

## Success Criteria

Migration is complete when:

- [x] All code moved to `packages/components/`
- [x] pnpm workspace installs successfully
- [x] `pnpm run build` produces dist/ with all components
- [x] `pnpm run test` passes all 2627 tests
- [x] `pnpm run storybook` shows all 45 components
- [x] `pnpm run lint` and `pnpm run typecheck` pass
- [x] Pre-commit hooks work with new structure
- [x] Can publish `@uswds-wc/components` to npm
- [x] Patterns package can be added independently

---

## Next Steps

After successful migration:

1. **Add Patterns Package** - Create `packages/patterns/` with first USWDS pattern
2. **Add Templates Package** - Create `packages/templates/` with first template
3. **Add CLI Package** - Create `packages/cli/` for project scaffolding
4. **Update Release Process** - Configure Changesets for multi-package releases
5. **Create Pattern Library** - Implement all 3 USWDS patterns
6. **Build Template Examples** - Create dashboard, form, and portal templates

---

## Resources

- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [USWDS Patterns](https://designsystem.digital.gov/patterns/)
- [Monorepo Best Practices](https://monorepo.tools/)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-22  
**Author:** Claude & Barbara Miles
