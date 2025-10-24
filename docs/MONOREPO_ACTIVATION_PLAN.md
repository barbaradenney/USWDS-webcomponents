# Monorepo Activation Plan

**Date:** 2025-10-19
**Status:** Ready for Activation
**Estimated Time:** 2-3 hours

## Overview

This document provides the complete activation plan for the monorepo migration. Follow these steps in order to safely transition from the single-package structure to the monorepo architecture.

## Prerequisites

Before activation, ensure:

- [ ] All 8 phases complete (100%)
- [ ] All tests passing in packages/ (2301/2301)
- [ ] All builds successful (`pnpm turbo build`)
- [ ] Documentation reviewed and approved
- [ ] NPM organization `@uswds-wc` created
- [ ] NPM publishing token configured
- [ ] GitHub repository settings reviewed

## Pre-Activation Checklist

### 1. Verify Package Builds

```bash
# Build all packages
pnpm turbo build

# Expected output:
# ✓ @uswds-wc/core:build
# ✓ @uswds-wc/forms:build
# ✓ @uswds-wc/navigation:build
# ✓ @uswds-wc/data-display:build
# ✓ @uswds-wc/feedback:build
# ✓ @uswds-wc/actions:build
# ✓ @uswds-wc/layout:build
# ✓ @uswds-wc/structure:build
# ✓ @uswds-wc:build
```

### 2. Verify All Tests Pass

```bash
# Run all tests
pnpm turbo test --filter='!@uswds-wc/test-utils'

# Expected: All packages passing
# Structure: 123/123 tests passing
# (Similar for all other packages)
```

### 3. Verify Changesets

```bash
# Check changeset exists
ls .changeset/*.md

# Expected: monorepo-migration-v2.md
```

### 4. Verify NPM Organization

```bash
# Login to npm
npm login

# Verify organization access
npm org ls @uswds-wc

# Expected: Your npm username with developer/owner access
```

## Activation Steps

### Phase 1: Activate Package Configuration (10 minutes)

**Goal:** Switch to monorepo package.json and pnpm lockfile

```bash
# 1. Backup current package.json
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup

# 2. Activate monorepo package.json
cp package.json.monorepo package.json

# 3. Remove npm lockfile (switching to pnpm)
rm package-lock.json

# 4. Generate pnpm lockfile
pnpm install

# 5. Verify all workspaces recognized
pnpm list -r --depth -1

# Expected: All 10 workspaces listed
# Root + 9 packages + test-utils
```

### Phase 2: Activate CI/CD Workflows (5 minutes)

**Goal:** Enable monorepo CI/CD pipelines

```bash
# Navigate to workflows directory
cd .github/workflows

# 1. Backup current workflows
mkdir -p backups
cp quality-checks.yml backups/quality-checks.yml.v1
cp deploy-storybook.yml backups/deploy-storybook.yml.v1
cp release.yml backups/release.yml.v1

# 2. Activate monorepo workflows
mv quality-checks.yml.monorepo quality-checks.yml
mv deploy-storybook.yml.monorepo deploy-storybook.yml
mv release.yml.monorepo release.yml

# Back to root
cd ../..
```

### Phase 3: Activate Pre-commit Hooks (2 minutes)

**Goal:** Enable pnpm-based validation

```bash
# 1. Backup current pre-commit
cp .husky/pre-commit .husky/pre-commit.backup

# 2. Activate monorepo pre-commit
cp .husky/pre-commit.monorepo .husky/pre-commit

# 3. Ensure executable
chmod +x .husky/pre-commit
```

### Phase 4: Activate Documentation (5 minutes)

**Goal:** Update user-facing documentation

```bash
# 1. Backup current README
cp README.md README.md.backup

# 2. Activate monorepo README
cp README.md.monorepo README.md

# 3. Verify documentation files exist
ls docs/MONOREPO_MIGRATION_SUMMARY.md

# Expected: File present
```

### Phase 5: Initial Commit (5 minutes)

**Goal:** Commit all activation changes

```bash
# 1. Stage all changes
git add -A

# 2. Commit with detailed message
git commit -m "feat: activate monorepo structure (v2.0.0)

BREAKING CHANGE: Migrated to monorepo architecture with category-based packages

## Changes

- Activated monorepo package.json with pnpm workspaces
- Updated CI/CD workflows for Turborepo and Changesets
- Activated pnpm-based pre-commit hooks
- Updated README with monorepo documentation

## New Packages

- @uswds-wc/core - Base utilities and USWDS integration
- @uswds-wc/forms - 15 form components
- @uswds-wc/navigation - 8 navigation components
- @uswds-wc/data-display - 8 data display components
- @uswds-wc/feedback - 5 feedback components
- @uswds-wc/actions - 4 action components
- @uswds-wc/layout - 4 layout components
- @uswds-wc/structure - 1 structural component
- @uswds-wc - Meta package (all components)

## Documentation

Complete documentation available in docs/ directory.

## Testing

All 2301 tests passing across 9 packages.
"

# 3. Verify commit
git show --stat
```

### Phase 6: Version Packages (10 minutes)

**Goal:** Apply v2.0.0 versions to all packages

```bash
# 1. Apply changesets (this updates package.json versions)
pnpm changeset version

# Expected output:
# 🦋  All files have been updated. Review them and commit at your leisure

# 2. Review version changes
git diff packages/*/package.json

# Expected: All packages at version 2.0.0

# 3. Update pnpm lockfile with new versions
pnpm install

# 4. Commit version changes
git add -A
git commit -m "chore: version packages for v2.0.0 release"
```

### Phase 7: Build All Packages (15 minutes)

**Goal:** Create production builds for publishing

```bash
# 1. Clean all previous builds
pnpm turbo clean

# 2. Build all packages
pnpm turbo build

# 3. Verify build outputs
ls packages/uswds-wc-core/dist/
ls packages/uswds-wc-forms/dist/
ls packages/uswds-wc-navigation/dist/
ls packages/uswds-wc-data-display/dist/
ls packages/uswds-wc-feedback/dist/
ls packages/uswds-wc-actions/dist/
ls packages/uswds-wc-layout/dist/
ls packages/uswds-wc-structure/dist/
ls packages/uswds-wc/dist/

# Expected: All dist/ directories present with built files
```

### Phase 8: Test Publishing (Dry Run) (10 minutes)

**Goal:** Verify publishing workflow without actually publishing

```bash
# 1. Dry run publishing
pnpm changeset publish --dry-run

# Expected output:
# 🦋  info This is a dry run, packages will not be published
# 🦋  info The following packages would be published:
#     @uswds-wc/core@2.0.0
#     @uswds-wc/forms@2.0.0
#     ... (all 9 packages)

# 2. Verify package contents
pnpm pack --pack-destination=/tmp/npm-pack-test --filter @uswds-wc/core

# 3. Inspect package
tar -tzf /tmp/npm-pack-test/uswds-wc-core-2.0.0.tgz | head -20

# Expected: dist/, package.json, README, etc.
```

### Phase 9: Publish to NPM (20 minutes)

**Goal:** Publish all packages to npm registry

**⚠️ CRITICAL: This step publishes to npm. Cannot be undone. Ensure all previous steps passed.**

```bash
# 1. Final verification
echo "Publishing 9 packages to npm. Press Ctrl+C to cancel, Enter to continue."
read

# 2. Publish all packages
pnpm changeset publish

# Expected output:
# 🦋  info npm info @uswds-wc/core
# 🦋  info npm info @uswds-wc/forms
# ... (checking all packages)
# 🦋  success packages published successfully:
#     @uswds-wc/core@2.0.0
#     @uswds-wc/forms@2.0.0
#     ... (all 9 packages)

# 3. Verify on npm
npm view @uswds-wc/core
npm view @uswds-wc/forms
npm view @uswds-wc

# Expected: All packages visible with version 2.0.0
```

### Phase 10: Push to GitHub (5 minutes)

**Goal:** Push activation changes and tags to GitHub

```bash
# 1. Create git tags for each package
git tag @uswds-wc/core@2.0.0
git tag @uswds-wc/forms@2.0.0
git tag @uswds-wc/navigation@2.0.0
git tag @uswds-wc/data-display@2.0.0
git tag @uswds-wc/feedback@2.0.0
git tag @uswds-wc/actions@2.0.0
git tag @uswds-wc/layout@2.0.0
git tag @uswds-wc/structure@2.0.0
git tag @uswds-wc@2.0.0

# 2. Push commits
git push origin main

# 3. Push all tags
git push origin --tags

# Expected: All commits and tags pushed successfully
```

### Phase 11: Create GitHub Releases (15 minutes)

**Goal:** Create releases for each package on GitHub

```bash
# Using GitHub CLI (gh)
gh release create @uswds-wc/core@2.0.0 \
  --title "@uswds-wc/core v2.0.0" \
  --notes-file .changeset/monorepo-migration-v2.md

# Repeat for each package...
# Or use GitHub's release page to create manually
```

### Phase 12: Verify Deployment (10 minutes)

**Goal:** Verify everything is working

```bash
# 1. Test installing from npm
mkdir /tmp/test-install
cd /tmp/test-install

# 2. Test meta package
npm init -y
npm install @uswds-wc lit

# 3. Test category packages
npm install @uswds-wc/forms @uswds-wc/actions

# 4. Verify imports work
node -e "const pkg = require('@uswds-wc/forms'); console.log('Import successful:', Object.keys(pkg).length, 'exports')"

# Expected: "Import successful: X exports"

# 5. Clean up
cd -
rm -rf /tmp/test-install
```

### Phase 13: Update Storybook Deployment (5 minutes)

**Goal:** Ensure Storybook reflects new structure

```bash
# 1. Build Storybook
pnpm run build-storybook

# 2. Deploy will happen automatically via GitHub Actions
# Monitor: https://github.com/barbaramiles/USWDS-webcomponents/actions

# 3. Verify deployment
# Visit: https://barbaradenney.github.io/USWDS-webcomponents/

# Expected: Storybook loads successfully
```

## Post-Activation Checklist

### Immediate (Within 1 Hour)

- [ ] All packages published to npm
- [ ] GitHub releases created
- [ ] Storybook deployed successfully
- [ ] README visible on GitHub
- [ ] npm package pages show correct information
- [ ] Tests passing in CI/CD

### Within 24 Hours

- [ ] Monitor npm download stats
- [ ] Monitor GitHub issues for problems
- [ ] Check CI/CD runs on pull requests
- [ ] Verify Changesets PR creation works
- [ ] Test creating a new changeset

### Within 1 Week

- [ ] Create announcement (blog post, social media)
- [ ] Update external documentation
- [ ] Notify users via GitHub discussions
- [ ] Monitor migration feedback
- [ ] Update any integration examples

## Rollback Plan

If critical issues arise during activation:

### Before Publishing (Phases 1-8)

```bash
# Restore original files
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json
cp .github/workflows/backups/* .github/workflows/
cp .husky/pre-commit.backup .husky/pre-commit
cp README.md.backup README.md

# Reinstall with npm
npm install

# Reset git if needed
git reset --hard HEAD~1
```

### After Publishing (Phases 9+)

**⚠️ Cannot unpublish from npm within 72 hours**

Options:
1. **Deprecate and fix forward**:
   ```bash
   npm deprecate @uswds-wc@2.0.0 "Use v2.0.1 instead - fixes critical issue"
   # Then publish v2.0.1 with fix
   ```

2. **If within 72 hours** (npm policy):
   ```bash
   # Contact npm support to unpublish
   # This is rare and discouraged
   ```

3. **Recommended**: Fix forward with patch version

## Monitoring

### NPM Package Health

```bash
# Check package status
npm view @uswds-wc
npm view @uswds-wc/forms
npm view @uswds-wc/core

# Check download stats (after 24 hours)
npm info @uswds-wc downloads
```

### GitHub Actions

Monitor at: https://github.com/barbaramiles/USWDS-webcomponents/actions

Check for:
- [ ] quality-checks workflow passing
- [ ] deploy-storybook workflow passing
- [ ] release workflow configuration valid

### User Feedback

Monitor:
- GitHub Issues: https://github.com/barbaramiles/USWDS-webcomponents/issues
- npm package page comments
- Social media mentions

## Success Metrics

### Technical

- [ ] All 9 packages published successfully
- [ ] All package versions at 2.0.0
- [ ] All tests passing (2301/2301)
- [ ] CI/CD pipelines green
- [ ] Storybook deployed
- [ ] Documentation live

### User Experience

- [ ] Installation works (npm/pnpm/yarn)
- [ ] Imports work (meta package)
- [ ] Imports work (category packages)
- [ ] Bundle sizes reduced (50-80%)
- [ ] No breaking API changes

### Process

- [ ] Changesets workflow functional
- [ ] Version bumping automated
- [ ] Publishing automated
- [ ] CHANGELOG generation working

## Support

If issues arise:

1. **Check this document** for troubleshooting
2. **Review phase documentation** (MONOREPO_PHASE_*.md)
3. **Check GitHub issues** for similar problems
4. **Create new issue** with:
   - Step where problem occurred
   - Error messages
   - System information
   - Attempted solutions

## Timeline

**Estimated Total Time:** 2-3 hours

- Pre-activation checks: 30 minutes
- Activation (Phases 1-7): 45 minutes
- Testing and dry run (Phase 8): 15 minutes
- Publishing (Phase 9): 20 minutes
- GitHub and deployment (Phases 10-13): 30 minutes
- Post-activation verification: 20 minutes

**Recommended Schedule:**

```
Day 1: Pre-activation checks
Day 2: Activation (Phases 1-8), stop before publishing
Day 3: Final review, publish (Phases 9-13)
```

## Next Steps After Activation

1. **Create announcement**
   - Blog post about v2.0.0
   - Social media announcement
   - GitHub discussions post

2. **Monitor and respond**
   - Watch for issues
   - Respond to questions
   - Update docs based on feedback

3. **Future improvements**
   - Independent package versioning
   - Per-package changelogs
   - Category-specific features

---

**Last Updated:** 2025-10-19
**Status:** Ready for Activation
**Approval Required:** Yes (before Phase 9: Publishing)

**Activation Lead:** [Your Name]
**Backup Contact:** [Backup Name]
**Emergency Rollback Authority:** [Authority Name]
