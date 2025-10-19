# Release Process Guide

Complete guide for releasing new versions of the USWDS Web Components library.

## 📋 Table of Contents

- [Overview](#overview)
- [Automated Release Workflow](#automated-release-workflow-recommended)
- [Manual Release Process](#manual-release-process)
- [Pre-Release Checklist](#pre-release-checklist)
- [Version Bump Process](#version-bump-process)
- [Release Notes Generation](#release-notes-generation)
- [Publishing to NPM](#publishing-to-npm)
- [GitHub Release](#github-release)
- [Post-Release Tasks](#post-release-tasks)
- [Hotfix Releases](#hotfix-releases)
- [Rollback Procedure](#rollback-procedure)

---

## Overview

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** (x.0.0) - Breaking changes
- **MINOR** (0.x.0) - New features, backward compatible
- **PATCH** (0.0.x) - Bug fixes, backward compatible

**Current automation:**
- ✅ Service Worker version auto-syncs with package.json
- ✅ Bundle metrics auto-update during build
- ✅ Documentation timestamps auto-update
- ✅ Pre-commit validation enforces quality
- ✅ **GitHub Actions automated release workflow (recommended)**

---

## Automated Release Workflow (Recommended)

### Overview

The **automated release workflow** handles the entire release process through GitHub Actions. You trigger it manually, and automation does the rest.

### Prerequisites

Before using the automated workflow, ensure:

1. **NPM Token configured** - Add `NPM_TOKEN` to GitHub repository secrets
   - Go to: Repository Settings → Secrets and variables → Actions
   - Create secret: `NPM_TOKEN` with your NPM publish token
   - Get token from: https://www.npmjs.com/settings/YOUR_USERNAME/tokens

2. **Repository permissions** - Workflow has write access (default for Actions)

3. **CHANGELOG.md updated** - Manually update before triggering workflow

### How to Use

**Step 1: Update CHANGELOG.md**

Before triggering the workflow, update `CHANGELOG.md`:

```markdown
## [Unreleased]

### Added
- New feature A
- New feature B

### Fixed
- Bug fix X
```

Commit and push the changelog:

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for upcoming release"
git push origin main
```

**Step 2: Trigger Workflow**

Go to: **Actions → Release → Run workflow**

**Options:**
- **Version type:** `patch`, `minor`, `major`, or `prerelease`
- **Pre-release tag:** (Optional) `beta`, `rc`, `alpha` - only for prerelease
- **Dry run:** (Optional) Test without publishing

**Step 3: Monitor Progress**

The workflow automatically:
1. ✅ Runs all tests and validations
2. ✅ Bumps version in package.json
3. ✅ Syncs service worker version
4. ✅ Builds production bundle
5. ✅ Generates release notes with bundle metrics
6. ✅ Creates version commit and git tag
7. ✅ Publishes to NPM
8. ✅ Creates GitHub release
9. ✅ Uploads artifacts

**Step 4: Verify Release**

After workflow completes:
- ✅ Check NPM: https://www.npmjs.com/package/uswds-webcomponents
- ✅ Check GitHub release: https://github.com/YOUR_ORG/uswds-webcomponents/releases
- ✅ Test installation: `npm install uswds-webcomponents@VERSION`

### Workflow Examples

**Patch Release (1.0.0 → 1.0.1)**
```
Version type: patch
Dry run: false
```

**Minor Release (1.0.0 → 1.1.0)**
```
Version type: minor
Dry run: false
```

**Major Release (1.0.0 → 2.0.0)**
```
Version type: major
Dry run: false
```

**Beta Pre-release (1.0.0 → 1.1.0-beta.0)**
```
Version type: prerelease
Pre-release tag: beta
Dry run: false
```

**Dry Run (Test without publishing)**
```
Version type: minor
Dry run: true
```

### What Gets Automated

| Task | Manual Process | Automated Workflow |
|------|---------------|-------------------|
| Run tests | `npm test` | ✅ Automatic |
| Validate code quality | `npm run lint` | ✅ Automatic |
| Bump version | `npm version` | ✅ Automatic |
| Sync service worker | `npm run sw:sync` | ✅ Automatic |
| Build production | `npm run build` | ✅ Automatic |
| Generate release notes | Manual writing | ✅ Auto-generated |
| Publish to NPM | `npm publish` | ✅ Automatic |
| Create GitHub release | Web UI / gh CLI | ✅ Automatic |
| Upload artifacts | Manual | ✅ Automatic |

### Advantages of Automated Workflow

**Consistency:**
- ✅ Same process every time
- ✅ No missed steps
- ✅ Reproducible releases

**Speed:**
- ✅ ~5 minutes total release time
- ✅ No context switching
- ✅ Parallel validation

**Safety:**
- ✅ All tests must pass before publishing
- ✅ Dry run option for testing
- ✅ Automatic rollback on failure

**Traceability:**
- ✅ Full audit log in GitHub Actions
- ✅ Build artifacts preserved
- ✅ Metrics automatically included

### Troubleshooting Automated Workflow

**Workflow fails with "NPM_TOKEN not found"**

```bash
# Add NPM token to repository secrets
# 1. Create token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
# 2. Go to: Repository Settings → Secrets → New repository secret
# 3. Name: NPM_TOKEN
# 4. Value: Your token
```

**Tests fail during workflow**

```bash
# Run tests locally first
npm test
npm run lint
npm run typecheck

# Fix issues and push
git add .
git commit -m "fix: resolve test failures"
git push origin main

# Retry workflow
```

**Version bump failed**

```bash
# Ensure working directory is clean
git status

# Pull latest changes
git pull origin main

# Retry workflow
```

### When to Use Manual Process

Use the manual process instead when:
- 🔴 First-time setup (testing release process)
- 🔴 NPM token not available
- 🔴 Need custom release notes
- 🔴 Debugging release issues
- 🔴 Network/CI issues

---

## Manual Release Process

For situations where the automated workflow isn't appropriate, follow the manual process below.

---

## Pre-Release Checklist

### 1. Code Quality Verification

Run the complete quality check:

```bash
# Full validation suite
npm run validate:all

# Complete test suite
npm test
npm run test:browser-required
npm run test:storybook:ci

# TypeScript compilation
npm run typecheck

# Code quality
npm run lint
npm run detect:over-engineering
```

**All checks must pass before proceeding.**

### 2. Build Verification

Test the production build:

```bash
# Production build
npm run build

# Verify bundle metrics are updated
cat test-reports/optimization-summary.json

# Verify service worker version synced
cat test-reports/service-worker-version.json

# Check bundle size
npm run validate:bundle-size
```

**Expected outputs:**
- Clean build with no errors
- Bundle size within acceptable limits
- Service worker version matches package.json
- All optimization metrics generated

### 3. Documentation Review

Update and verify documentation:

```bash
# Update root CHANGELOG.md
# - Move [Unreleased] changes to new version section
# - Add version number and date
# - Create new empty [Unreleased] section

# Verify component changelogs are current
find src/components -name "CHANGELOG.mdx" -exec head -20 {} \;

# Update README.md if needed
# - Version badges
# - Installation instructions
# - Breaking changes section

# Review Storybook documentation
npm run storybook
# Visit http://localhost:6006 and verify all component docs
```

### 4. Breaking Changes Assessment

If this is a MAJOR release:

1. **Document breaking changes** in CHANGELOG.md
2. **Create migration guide** section
3. **Update component READMEs** with migration notes
4. **Test upgrade path** from previous version
5. **Prepare announcement** with migration timeline

### 5. Security Audit

```bash
# Check for vulnerabilities
npm audit

# Update dependencies if needed
npm update

# Re-run tests after updates
npm test
```

---

## Version Bump Process

### Step 1: Determine Version Type

**Patch (0.0.x) - Bug fixes only**
```bash
npm version patch
```

**Minor (0.x.0) - New features, backward compatible**
```bash
npm version minor
```

**Major (x.0.0) - Breaking changes**
```bash
npm version major
```

### Step 2: Pre-version Checks

Before running `npm version`, ensure:
- ✅ All changes committed
- ✅ Working directory clean
- ✅ On main branch
- ✅ Synced with remote

```bash
# Verify clean state
git status

# Verify on main branch
git branch --show-current

# Pull latest changes
git pull origin main
```

### Step 3: Run Version Command

```bash
# Example: Minor release (1.0.0 → 1.1.0)
npm version minor -m "chore: release v%s"

# This automatically:
# 1. Updates package.json version
# 2. Updates package-lock.json
# 3. Creates git commit
# 4. Creates git tag (v1.1.0)
```

**What happens automatically:**
- ✅ Service worker version syncs (on next build)
- ✅ Git tag created (v{version})
- ✅ Version commit created

### Step 4: Update CHANGELOG.md

Manually update the root CHANGELOG.md:

```markdown
## [Unreleased]

<!-- Empty for next release -->

## [1.1.0] - 2025-10-18

### Added
- New feature A
- New feature B

### Changed
- Updated component X
- Improved performance Y

### Fixed
- Resolved bug Z
```

Commit the changelog:

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for v1.1.0 release"
```

### Step 5: Final Build

Run final production build:

```bash
# Build with all optimizations
npm run build

# This triggers:
# - Service worker version sync (automatically)
# - Bundle metrics update (automatically)
# - Optimization docs update (automatically)
```

### Step 6: Push Tags

```bash
# Push commits and tags
git push origin main --follow-tags
```

---

## Release Notes Generation

### Step 1: Extract Changes from CHANGELOG

Copy the relevant section from CHANGELOG.md for the new version.

### Step 2: Create Release Notes Template

Create `release-notes-v{version}.md`:

```markdown
# USWDS Web Components v1.1.0

Released: 2025-10-18

## 🎉 Highlights

[Brief summary of major features/changes]

## ✨ New Features

- Feature A: [Description]
- Feature B: [Description]

## 🔧 Improvements

- Improvement X
- Improvement Y

## 🐛 Bug Fixes

- Fix Z
- Fix W

## 📊 Bundle Metrics

- Total Bundle: 475 KB (87 KB gzipped)
- Average CSS per component: 15.4 KB (94.9% reduction)
- Service Worker: v1.1.0
- Cache invalidation: Automatic on upgrade

## 🔄 Migration Guide

[If breaking changes, provide migration steps]

## 📦 Installation

```bash
npm install uswds-webcomponents@1.1.0
```

## 🔗 Resources

- [Documentation](https://your-storybook-url.com)
- [Changelog](https://github.com/your-org/uswds-webcomponents/blob/main/CHANGELOG.md)
- [Migration Guide](link-if-applicable)
```

### Step 3: Component-Level Highlights

Extract notable component changes:

```bash
# Review component changelogs
find src/components -name "CHANGELOG.mdx" -exec grep -l "### Added" {} \;
```

Add to release notes:

```markdown
## 📦 Component Updates

### Button Component
- Added new `size` variants
- Improved accessibility

### Alert Component
- Fixed icon alignment
- Enhanced color contrast

[See component changelogs for complete details]
```

---

## Publishing to NPM

### Step 1: Verify NPM Login

```bash
# Check if logged in
npm whoami

# If not logged in
npm login
```

### Step 2: Verify Package Configuration

Check `package.json`:

```json
{
  "name": "uswds-webcomponents",
  "version": "1.1.0",  // ✅ Updated
  "files": [
    "dist",
    "src"
  ],
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

### Step 3: Dry Run

Test the package before publishing:

```bash
# Create tarball
npm pack

# Inspect contents
tar -tzf uswds-webcomponents-1.1.0.tgz

# Verify files included:
# ✅ dist/ directory
# ✅ src/ directory (for source maps)
# ✅ package.json
# ✅ README.md
# ✅ LICENSE
# ❌ NOT node_modules
# ❌ NOT test files
# ❌ NOT .storybook
```

### Step 4: Publish to NPM

**For regular releases:**

```bash
# Publish to NPM registry
npm publish

# Tag as latest
npm dist-tag add uswds-webcomponents@1.1.0 latest
```

**For pre-releases (beta, rc):**

```bash
# Beta release
npm version prerelease --preid=beta
npm publish --tag beta

# Release candidate
npm version prerelease --preid=rc
npm publish --tag next
```

### Step 5: Verify Published Package

```bash
# Check package info
npm info uswds-webcomponents

# Test installation
mkdir /tmp/test-install
cd /tmp/test-install
npm init -y
npm install uswds-webcomponents
```

**Verify:**
- ✅ Correct version shows in npm info
- ✅ Package installs without errors
- ✅ dist/ directory present
- ✅ TypeScript types available

---

## GitHub Release

### Step 1: Create GitHub Release

Go to: `https://github.com/your-org/uswds-webcomponents/releases/new`

**Or use GitHub CLI:**

```bash
# Install gh CLI if needed
brew install gh

# Create release
gh release create v1.1.0 \
  --title "v1.1.0 - Release Title" \
  --notes-file release-notes-v1.1.0.md
```

### Step 2: Release Configuration

**Tag:** `v1.1.0` (should already exist from npm version)

**Title:** `v1.1.0 - [Brief Description]`

Examples:
- `v1.1.0 - New Component Features`
- `v1.0.1 - Bug Fixes and Performance`
- `v2.0.0 - Major API Changes`

**Description:** Paste content from `release-notes-v1.1.0.md`

### Step 3: Attach Build Artifacts (Optional)

Consider attaching:
- `uswds-webcomponents-1.1.0.tgz` - NPM package tarball
- `bundle-report.html` - Bundle size visualization
- `optimization-summary.json` - Performance metrics

```bash
# Generate bundle visualization
npm run build
npx vite-bundle-visualizer --open

# Attach to release
gh release upload v1.1.0 \
  uswds-webcomponents-1.1.0.tgz \
  test-reports/optimization-summary.json
```

### Step 4: Mark as Latest Release

- ✅ Check "Set as the latest release"
- 🔄 For pre-releases, check "This is a pre-release"

---

## Post-Release Tasks

### 1. Verify NPM Package

```bash
# Test installation from NPM
npx create-vite@latest test-app -- --template vanilla-ts
cd test-app
npm install uswds-webcomponents
npm run dev
```

Create test file:

```typescript
// src/main.ts
import 'uswds-webcomponents';

document.querySelector('#app')!.innerHTML = `
  <usa-button>Test Button</usa-button>
  <usa-alert heading="Success">Package works!</usa-alert>
`;
```

### 2. Update Documentation Sites

**Storybook:**
```bash
# Build and deploy Storybook
npm run build-storybook

# Deploy to hosting (GitHub Pages, Netlify, etc.)
# Follow your deployment process
```

**Update URLs in:**
- README.md
- GitHub repository description
- NPM package description

### 3. Announce Release

**GitHub Discussions:**
Create announcement post with:
- Release highlights
- Breaking changes (if any)
- Migration guide link
- Link to full changelog

**Social Media / Blog (if applicable):**
- Tweet about release
- Blog post for major versions
- Update project website

### 4. Monitor for Issues

**First 24 hours:**
- Watch GitHub issues
- Monitor NPM download stats
- Check for reported bugs
- Review installation feedback

**Quick response checklist:**
- Critical bugs → Hotfix release (see below)
- Documentation issues → Update docs
- Questions → Create FAQ or improve docs

### 5. Update Internal Documentation

```bash
# Update component status
# Update version references in CLAUDE.md if needed
# Update any internal wikis or documentation
```

---

## Hotfix Releases

For critical bugs in production:

### Step 1: Create Hotfix Branch

```bash
# Create hotfix branch from tag
git checkout -b hotfix-1.1.1 v1.1.0
```

### Step 2: Fix the Bug

```bash
# Make minimal changes to fix bug
# Add test to prevent regression
npm test

# Commit fix
git add .
git commit -m "fix: critical bug description"
```

### Step 3: Version and Release

```bash
# Bump patch version
npm version patch -m "chore: release v%s (hotfix)"

# Push hotfix
git push origin hotfix-1.1.1 --follow-tags
```

### Step 4: Merge Back to Main

```bash
# Merge hotfix to main
git checkout main
git merge hotfix-1.1.1
git push origin main
```

### Step 5: Publish Hotfix

```bash
# Build and publish
npm run build
npm publish

# Create GitHub release
gh release create v1.1.1 \
  --title "v1.1.1 - Hotfix: [Bug Description]" \
  --notes "Critical bug fix for [issue]. See CHANGELOG.md for details."
```

---

## Rollback Procedure

If a release has critical issues:

### Step 1: Deprecate Bad Version

```bash
# Deprecate on NPM (doesn't unpublish)
npm deprecate uswds-webcomponents@1.1.0 "Critical bug, use 1.0.0 instead"
```

### Step 2: Publish Rollback Release

```bash
# Create rollback commit
git revert <commit-hash> --no-commit
git commit -m "revert: rollback to v1.0.0 behavior"

# Bump version
npm version patch -m "chore: release v1.1.1 (rollback)"

# Build and publish
npm run build
npm publish
```

### Step 3: Communicate Issue

- Update GitHub release with deprecation notice
- Post issue to GitHub Discussions
- Update README.md with version warning
- Send notification to users if possible

---

## Release Checklist Template

Copy this checklist for each release:

### Pre-Release
- [ ] All tests passing (`npm test`, `npm run test:browser-required`)
- [ ] No lint errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Bundle size acceptable (`npm run validate:bundle-size`)
- [ ] CHANGELOG.md updated
- [ ] Breaking changes documented (if MAJOR)
- [ ] Migration guide created (if MAJOR)
- [ ] Security audit passed (`npm audit`)
- [ ] Documentation reviewed
- [ ] Working directory clean

### Version Bump
- [ ] Correct version type selected (major/minor/patch)
- [ ] `npm version` command executed
- [ ] Git tag created
- [ ] CHANGELOG.md finalized
- [ ] Production build successful (`npm run build`)
- [ ] Service worker version synced (automatic)
- [ ] Bundle metrics updated (automatic)

### Publishing
- [ ] NPM login verified (`npm whoami`)
- [ ] Dry run successful (`npm pack`)
- [ ] Published to NPM (`npm publish`)
- [ ] Package verified on NPM registry
- [ ] Test installation successful

### GitHub Release
- [ ] GitHub release created
- [ ] Release notes complete
- [ ] Build artifacts attached (optional)
- [ ] Marked as latest release

### Post-Release
- [ ] NPM package installation tested
- [ ] Storybook deployed (if applicable)
- [ ] Announcement posted
- [ ] Documentation sites updated
- [ ] Monitoring for issues

---

## Quick Reference

### Common Commands

```bash
# Version bump and tag
npm version [major|minor|patch]

# Build for release
npm run build

# Publish to NPM
npm publish

# Create GitHub release
gh release create v1.1.0 --title "..." --notes "..."

# Verify package
npm info uswds-webcomponents
```

### File Locations

- **Root Changelog:** `CHANGELOG.md`
- **Component Changelogs:** `src/components/*/CHANGELOG.mdx`
- **Package Info:** `package.json`
- **Bundle Metrics:** `test-reports/optimization-summary.json`
- **Service Worker Version:** `test-reports/service-worker-version.json`
- **Release Notes:** `release-notes-v{version}.md` (create as needed)

### Semantic Versioning Quick Guide

| Change Type | Version | Example |
|------------|---------|---------|
| Breaking API changes | MAJOR | 1.0.0 → 2.0.0 |
| New features (backward compatible) | MINOR | 1.0.0 → 1.1.0 |
| Bug fixes (backward compatible) | PATCH | 1.0.0 → 1.0.1 |
| Pre-release | PRERELEASE | 1.0.0 → 1.1.0-beta.0 |

---

## Troubleshooting

### "npm publish" fails with 403

**Problem:** Authentication issue

**Solution:**
```bash
npm logout
npm login
npm publish
```

### Git tag already exists

**Problem:** Tag wasn't deleted after failed release

**Solution:**
```bash
# Delete local tag
git tag -d v1.1.0

# Delete remote tag (careful!)
git push origin :refs/tags/v1.1.0

# Recreate
npm version minor
```

### Service Worker version not syncing

**Problem:** Build not running version sync

**Solution:**
```bash
# Manual sync
npm run sw:sync

# Then rebuild
npm run build
```

### Bundle size exceeds limit

**Problem:** Build too large

**Solution:**
```bash
# Analyze bundle
npx vite-bundle-visualizer

# Check for large dependencies
npm run validate:bundle-size -- --strict

# Review and optimize before release
```

---

## Resources

- **Semantic Versioning:** https://semver.org/
- **Keep a Changelog:** https://keepachangelog.com/
- **NPM Publishing:** https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- **GitHub Releases:** https://docs.github.com/en/repositories/releasing-projects-on-github

---

**Last Updated:** 2025-10-18

_This release process is designed to ensure high-quality, reliable releases of the USWDS Web Components library._
