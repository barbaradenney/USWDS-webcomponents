# Monorepo Phase 8: Publishing & Release

**Date:** 2025-10-19
**Status:** Complete - Ready for Activation
**Phase:** 8 of 8 (Final Phase)

## Overview

Phase 8 prepares the monorepo for publishing to npm with Changesets-based versioning and automated release workflows. This is the final phase of the monorepo migration.

## What Was Accomplished

### 1. Changesets Configuration

**Updated: `.changeset/config.json`**

**Changes:**
- Changed `access` from `"restricted"` to `"public"` for npm publishing
- Added `@uswds-wc/test-utils` to `ignore` list (internal package)

**Final Configuration:**
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@uswds-wc/test-utils"]
}
```

### 2. Initial Changeset Created

**Created: `.changeset/monorepo-migration-v2.md`**

**Purpose:** Documents the v2.0.0 initial release

**Covers:**
- All 9 packages marked for major version bump (v2.0.0)
- Comprehensive release notes
- Feature documentation
- Usage instructions
- Bundle size benefits
- Statistics (9 packages, 45 components, 2301 tests)

**Packages Included:**
- @uswds-wc/core
- @uswds-wc/forms
- @uswds-wc/navigation
- @uswds-wc/data-display
- @uswds-wc/feedback
- @uswds-wc/actions
- @uswds-wc/layout
- @uswds-wc/structure
- @uswds-wc (meta package)

### 3. Activation Plan Created

**Created: `docs/MONOREPO_ACTIVATION_PLAN.md`**

**Comprehensive 13-phase activation plan:**

1. **Phase 1:** Activate Package Configuration
2. **Phase 2:** Activate CI/CD Workflows
3. **Phase 3:** Activate Pre-commit Hooks
4. **Phase 4:** Activate Documentation
5. **Phase 5:** Initial Commit
6. **Phase 6:** Version Packages
7. **Phase 7:** Build All Packages
8. **Phase 8:** Test Publishing (Dry Run)
9. **Phase 9:** Publish to NPM
10. **Phase 10:** Push to GitHub
11. **Phase 11:** Create GitHub Releases
12. **Phase 12:** Verify Deployment
13. **Phase 13:** Update Storybook Deployment

**Includes:**
- Pre-activation checklist
- Step-by-step instructions
- Verification commands
- Rollback plan
- Post-activation checklist
- Monitoring guidelines
- Timeline (2-3 hours total)

### 4. Publishing Workflow

**Automated via Changesets:**

**Creating a changeset (future changes):**
```bash
pnpm changeset
# Select packages that changed
# Select version bump type (major/minor/patch)
# Write summary
```

**Versioning packages:**
```bash
pnpm changeset version
# Updates package.json versions
# Generates/updates CHANGELOGs
# Updates internal dependencies
```

**Publishing:**
```bash
pnpm changeset publish
# Builds all packages
# Publishes to npm
# Creates git tags
```

**GitHub Action** (`.github/workflows/release.yml.monorepo`):
- Runs on push to main
- Creates version PR automatically
- Publishes when PR merged
- Creates GitHub releases

## Files Created

```
.changeset/
└── monorepo-migration-v2.md          # v2.0.0 changeset

docs/
├── MONOREPO_ACTIVATION_PLAN.md       # 13-phase activation guide
└── MONOREPO_PHASE_8_PUBLISHING.md    # This file
```

## Files Modified

```
.changeset/config.json                # access: public, ignore test-utils
```

## Benefits

### Automated Version Management

**Before (Single Package):**
- Manual version bumping
- Manual CHANGELOG updates
- Single version for all components
- Manual npm publishing

**After (Monorepo):**
- Automated version bumping via Changesets
- Automated CHANGELOG generation
- Independent package versions
- Automated publishing via GitHub Actions

### Independent Package Versioning

**Example:**
```
@uswds-wc/forms@2.1.0      (bug fix in text input)
@uswds-wc/navigation@2.0.0 (no changes)
@uswds-wc/actions@2.2.0    (new button variant)
```

Users can update only what changed:
```bash
pnpm add @uswds-wc/forms@latest  # Only updates forms
```

### Release Workflow

**Current (Manual):**
1. Update version in package.json
2. Write CHANGELOG
3. Create git tag
4. npm publish
5. Create GitHub release
6. Announce release

**With Changesets (Automated):**
1. Developer creates changeset: `pnpm changeset`
2. Changesets bot creates PR with versions
3. Merge PR → automatic publish to npm
4. GitHub releases created automatically

## Testing the Workflow

### Test Changeset Creation

```bash
# Create a test changeset
pnpm changeset

# Answer prompts:
# - Select packages: @uswds-wc/forms
# - Version: patch
# - Summary: "Test changeset"

# Result: Creates .changeset/test-changeset-*.md
```

### Test Version Bumping

```bash
# Apply changesets (dry run)
pnpm changeset version

# Check what changed
git diff packages/*/package.json

# Rollback test
git reset --hard HEAD
```

### Test Publishing (Dry Run)

```bash
# Build all packages
pnpm turbo build

# Dry run publish
pnpm changeset publish --dry-run

# Expected: Shows what would be published
# Does NOT actually publish
```

## Deployment Strategy

### Option 1: Manual Activation (Recommended)

**Pros:**
- Full control over timing
- Can test each step
- Easy rollback before publishing
- Recommended for first v2.0.0 release

**Process:**
Follow `MONOREPO_ACTIVATION_PLAN.md` step by step

### Option 2: Automated via CI/CD

**Pros:**
- Fully automated
- Good for future releases
- Consistent process

**Process:**
- Push to main
- GitHub Action runs automatically
- Creates version PR
- Merge PR → automatic publish

**Note:** Use Option 1 for initial v2.0.0 release

## NPM Organization Setup

### Before Publishing

**Create npm organization:**
1. Go to https://www.npmjs.com/
2. Click "Create Organization"
3. Name: `uswds-wc`
4. Type: Free (or paid as needed)

**Add collaborators:**
```bash
npm org set uswds-wc developer <username>
```

**Verify access:**
```bash
npm org ls uswds-wc
```

### Package Scoping

All packages use `@uswds-wc` scope:
- @uswds-wc/core
- @uswds-wc/forms
- @uswds-wc/navigation
- etc.

This requires npm organization ownership.

## Security Considerations

### NPM Token

**Setup:**
1. Generate token: https://www.npmjs.com/settings/[username]/tokens
2. Type: Automation token
3. Add to GitHub Secrets: `NPM_TOKEN`

**Never commit:**
- NPM tokens
- Publishing credentials
- Personal access tokens

### Package Access

**Configuration:**
- `"access": "public"` in .changeset/config.json
- All packages publicly available
- Free to download and use

## Monitoring

### After Publishing

**Check package health:**
```bash
# View on npm
npm view @uswds-wc
npm view @uswds-wc/forms

# Check downloads (after 24h)
npm info @uswds-wc downloads
```

**Monitor:**
- npm package pages for correct metadata
- GitHub releases created correctly
- CI/CD workflows passing
- User issues on GitHub

## Rollback Plan

### Before Publishing (Phases 1-8)

**Full rollback possible:**
```bash
# Restore all backup files
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json
# ... (see MONOREPO_ACTIVATION_PLAN.md)

# Reset git
git reset --hard HEAD~1
```

### After Publishing (Phase 9+)

**Limited rollback options:**

1. **Deprecate version** (recommended):
   ```bash
   npm deprecate @uswds-wc@2.0.0 "Use v2.0.1 - fixes issue"
   ```

2. **Publish patch version** (fix forward):
   ```bash
   # Fix issue
   # Create changeset for patch
   # Publish v2.0.1
   ```

3. **Within 72 hours** (npm policy):
   - Contact npm support for unpublish
   - Only for critical security issues
   - Highly discouraged

**Recommendation:** Always fix forward with patches

## Success Criteria

### Technical Success

- [ ] All 9 packages published to npm
- [ ] All packages at version 2.0.0
- [ ] npm pages show correct information
- [ ] Installation works (npm/pnpm/yarn)
- [ ] Imports work (meta and category packages)
- [ ] Tests passing (2301/2301)

### Process Success

- [ ] Changesets workflow functional
- [ ] Version PR creation automated
- [ ] Publishing via CI/CD working
- [ ] GitHub releases automated
- [ ] CHANGELOG generation working

### User Success

- [ ] Installation instructions clear
- [ ] Bundle sizes optimized (verified)
- [ ] Documentation comprehensive
- [ ] Support responsive

## Timeline

**Phase 8 Completion:** Ready for activation
**Activation Time:** 2-3 hours
**Post-Activation Monitoring:** 1 week

**Recommended Schedule:**

**Day 1 (Preparation):**
- Review all phase documentation
- Verify prerequisites
- Run pre-activation checks
- Create npm organization

**Day 2 (Activation Phases 1-8):**
- Activate configuration files
- Commit changes
- Version packages
- Build and test (dry run)
- **STOP before publishing**

**Day 3 (Publishing Phases 9-13):**
- Final review
- Publish to npm
- Push to GitHub
- Create releases
- Monitor deployment

## Documentation Links

### For Activation

- **Activation Plan:** `docs/MONOREPO_ACTIVATION_PLAN.md`
- **Phase Summary:** `docs/MONOREPO_MIGRATION_SUMMARY.md`
- **CI/CD Changes:** `docs/MONOREPO_PHASE_6_CI_CD_MIGRATION.md`

### For Users

- **README:** `README.md.monorepo`
- **Component Catalog:** All 45 components documented

### For Maintainers

- **All Phase Docs:** `docs/MONOREPO_PHASE_*.md`
- **Status Tracking:** `docs/MONOREPO_STATUS.md`

## Next Steps

### Immediate (Ready Now)

1. Review activation plan
2. Set up npm organization
3. Configure NPM_TOKEN in GitHub
4. Schedule activation date

### During Activation

1. Follow activation plan phases 1-13
2. Test at each step
3. Monitor for issues
4. Verify success criteria

### Post-Activation

1. Monitor npm downloads
2. Respond to user feedback
3. Update external docs
4. Create announcement
5. Plan future improvements

## Conclusion

Phase 8 completes the monorepo migration by:

- ✅ Configuring Changesets for publishing
- ✅ Creating initial v2.0.0 changeset
- ✅ Providing comprehensive activation plan
- ✅ Documenting publishing workflow
- ✅ Establishing monitoring procedures

**The monorepo migration is now 100% complete and ready for activation.**

All infrastructure, code, tests, documentation, and publishing workflows are in place. The library can be activated and published following the activation plan.

---

**Files Created:**
- `.changeset/monorepo-migration-v2.md` (v2.0.0 changeset)
- `docs/MONOREPO_ACTIVATION_PLAN.md` (activation guide)
- `docs/MONOREPO_PHASE_8_PUBLISHING.md` (this file)

**Files Modified:**
- `.changeset/config.json` (public access, ignore test-utils)

**Phase 8 Status:** ✅ Complete
**Overall Migration:** ✅ 100% Complete (8/8 phases)
**Ready for Activation:** ✅ Yes

**Next Action:** Follow `MONOREPO_ACTIVATION_PLAN.md` to activate and publish
