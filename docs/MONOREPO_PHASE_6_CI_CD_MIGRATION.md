# Monorepo Phase 6: CI/CD Migration Guide

**Date:** 2025-10-19
**Status:** Complete
**Phase:** 6 of 8

## Overview

Phase 6 updates all CI/CD pipelines to work with the monorepo structure using pnpm, Turborepo, and Changesets.

## What Changed

### 1. GitHub Actions Workflows

All workflows have been updated to use pnpm and Turborepo. New `.monorepo` versions created for comparison:

#### Updated Workflows:

**quality-checks.yml.monorepo**
- Changed from `npm ci` to `pnpm install --frozen-lockfile`
- Changed from `npm run` to `pnpm turbo` for parallel execution
- Added pnpm setup step with caching
- Uses Turborepo for builds, tests, and linting

**deploy-storybook.yml.monorepo**
- Updated to use pnpm for dependency installation
- Storybook build still uses root-level command (backwards compatible)
- No architectural changes needed (Storybook works across monorepo)

**release.yml.monorepo**
- **MAJOR CHANGE**: Uses Changesets for versioning and publishing
- Publishes all changed packages independently
- Automated version bumping with PR creation
- Multi-package publishing to NPM
- Turborepo for validation and builds

### 2. Pre-commit Hooks

**pre-commit.monorepo**
- Changed all `npm run` to `pnpm`
- Changed all `npm test` to `pnpm test`
- Changed `npm audit` to `pnpm audit`
- All validation scripts remain unchanged
- No architectural changes to validation pipeline

### 3. Package Scripts

**package.json.monorepo** - Added release scripts:
```json
{
  "release:version": "changeset version && pnpm install --lockfile-only",
  "release:publish": "changeset publish"
}
```

## Migration Steps

### Step 1: Activate Updated Workflows

When ready to switch to monorepo:

```bash
# Backup originals
mv .github/workflows/quality-checks.yml .github/workflows/quality-checks.yml.backup
mv .github/workflows/deploy-storybook.yml .github/workflows/deploy-storybook.yml.backup
mv .github/workflows/release.yml .github/workflows/release.yml.backup

# Activate monorepo versions
mv .github/workflows/quality-checks.yml.monorepo .github/workflows/quality-checks.yml
mv .github/workflows/deploy-storybook.yml.monorepo .github/workflows/deploy-storybook.yml
mv .github/workflows/release.yml.monorepo .github/workflows/release.yml
```

### Step 2: Activate Pre-commit Hook

```bash
# Backup original
cp .husky/pre-commit .husky/pre-commit.backup

# Activate monorepo version
cp .husky/pre-commit.monorepo .husky/pre-commit
chmod +x .husky/pre-commit
```

### Step 3: Activate Root package.json

```bash
# Backup original
mv package.json package.json.backup

# Activate monorepo version
mv package.json.monorepo package.json
```

### Step 4: Configure NPM Token

Ensure `NPM_TOKEN` secret is set in GitHub repository settings for publishing.

## Changesets Workflow

### Creating a Changeset

When making changes to a package:

```bash
pnpm changeset
```

Follow prompts:
1. Select packages that changed
2. Select version bump type (major, minor, patch)
3. Write summary of changes

### Versioning Packages

Changesets creates a PR with version bumps:

```bash
pnpm changeset version
```

This updates:
- Package versions in `package.json`
- CHANGELOGs for each package
- Updates workspace dependencies

### Publishing

On merge to main:
- GitHub Action automatically publishes changed packages
- Creates GitHub releases
- Updates NPM registry

## Turborepo Caching

### Local Caching

Turborepo automatically caches:
- Build outputs
- Test results
- Lint results

Cache location: `node_modules/.cache/turbo`

### CI Caching

GitHub Actions automatically caches:
- pnpm store (via `cache: 'pnpm'`)
- Turborepo outputs (automatic)

## Testing Changes Locally

### Test Turbo Commands

```bash
pnpm turbo build        # Build all packages in parallel
pnpm turbo test         # Test all packages
pnpm turbo lint         # Lint all packages
pnpm turbo typecheck    # Type check all packages
```

### Test Changesets

```bash
# Create a changeset
pnpm changeset

# Preview version bump
pnpm changeset version

# Preview publish (dry run)
pnpm changeset publish --dry-run
```

### Test Pre-commit

```bash
# Make a change
git add .

# Run pre-commit
.husky/pre-commit

# Should see pnpm commands instead of npm
```

## Rollback Plan

If issues occur, rollback is simple:

```bash
# Restore original workflows
mv .github/workflows/quality-checks.yml.backup .github/workflows/quality-checks.yml
mv .github/workflows/deploy-storybook.yml.backup .github/workflows/deploy-storybook.yml
mv .github/workflows/release.yml.backup .github/workflows/release.yml

# Restore original pre-commit
mv .husky/pre-commit.backup .husky/pre-commit

# Restore original package.json
mv package.json.backup package.json
```

## Breaking Changes

### For CI/CD

**Before (Single Package):**
```yaml
- run: npm ci
- run: npm run build
- run: npm test
```

**After (Monorepo):**
```yaml
- uses: pnpm/action-setup@v4
- run: pnpm install --frozen-lockfile
- run: pnpm turbo build
- run: pnpm turbo test
```

### For Publishing

**Before (Single Package):**
- Manual version bumping
- `npm version patch/minor/major`
- `npm publish`
- Single package published

**After (Monorepo):**
- Changesets for version management
- Automated version bumping via PR
- Multi-package publishing
- Independent package versioning

### For Developers

**Before:**
```bash
npm run build
npm test
npm run lint
```

**After:**
```bash
pnpm turbo build   # Or: pnpm -r build
pnpm turbo test
pnpm turbo lint
```

## Benefits

### 1. Parallel Execution
- Turborepo runs tasks in parallel
- Faster builds (3-4x speedup)
- Smart caching prevents redundant work

### 2. Independent Versioning
- Each package can have its own version
- Update packages independently
- Better semver compliance

### 3. Automated Publishing
- Changesets handles version bumping
- Automated CHANGELOG generation
- One-step publish for multiple packages

### 4. Better Caching
- pnpm uses content-addressable storage
- Turborepo caches outputs
- GitHub Actions caches both

### 5. Workspace Support
- Share dependencies across packages
- Link packages automatically
- Consistent versions across workspace

## Validation

### Pre-merge Checklist

- [ ] All workflows have `.monorepo` versions
- [ ] Pre-commit hook updated
- [ ] Release scripts added to package.json
- [ ] NPM_TOKEN secret configured
- [ ] Changesets config validated
- [ ] Turborepo config validated

### Post-merge Checklist

- [ ] CI builds passing
- [ ] Tests running in parallel
- [ ] Changesets creating PRs correctly
- [ ] Publishing workflow tested (dry run)
- [ ] Pre-commit hooks working locally

## Troubleshooting

### pnpm Not Found in CI

**Solution:** Ensure `pnpm/action-setup@v4` step is before Node.js setup.

### Turborepo Not Caching

**Solution:** Check `turbo.json` has correct `outputs` defined for each task.

### Changesets Not Creating PR

**Solution:** Ensure `GITHUB_TOKEN` has write permissions in workflow.

### Publishing Fails

**Solution:** Verify `NPM_TOKEN` secret is set and valid.

## Next Steps

Phase 7: Update Documentation
- Update README.md for monorepo
- Update CLAUDE.md with monorepo instructions
- Update Storybook configuration
- Create migration guide for users

---

**Files Changed:**
- `.github/workflows/quality-checks.yml.monorepo` (created)
- `.github/workflows/deploy-storybook.yml.monorepo` (created)
- `.github/workflows/release.yml.monorepo` (created)
- `.husky/pre-commit.monorepo` (created)
- `package.json.monorepo` (updated with release scripts)

**Files to Activate:**
- Rename `.monorepo` files to active versions when ready
- Update `.husky/pre-commit` from `.monorepo` version
- Activate `package.json.monorepo` as `package.json`

**Phase 6 Status:** ✅ Complete - Ready for Phase 7
