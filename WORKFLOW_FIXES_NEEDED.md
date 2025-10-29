# Workflow Fixes Needed for Monorepo Structure

## Overview

After the monorepo migration (PR #19), several CI workflows have `continue-on-error: true` flags that were added as temporary measures. This document outlines what needs to be fixed for each workflow.

## Current Status

**Files with `continue-on-error: true`:**
- .github/workflows/accessibility-report.yml
- .github/workflows/ci.yml
- .github/workflows/docs-maintenance.yml
- .github/workflows/performance-regression.yml
- .github/workflows/quality-gates.yml
- .github/workflows/security.yml
- .github/workflows/uswds-update-check.yml
- .github/workflows/visual-testing.yml
- .github/workflows/weekly-intensive-testing.yml

**Files already properly configured:**
- .github/workflows/smart-ci.yml (uses Turborepo and pnpm filters correctly)
- .github/workflows/quality-checks.yml (monorepo-specific, already correct)

## General Fix Pattern

All workflows need to:

1. **Remove `continue-on-error: true` and TODO comments**
2. **Ensure pnpm setup** with version '10.15.0'
3. **Use `--frozen-lockfile`** for installs
4. **Update paths** from root-level to `packages/*/`
5. **Use pnpm workspace filters** where applicable:
   - `pnpm --filter "@uswds-wc/forms" test`
   - `pnpm turbo build --filter="...[HEAD^]"`
6. **Update artifact paths** to include `packages/*/dist`

## Workflow-Specific Fixes

### 1. quality-gates.yml
**Current Issues:**
- Has `continue-on-error: true` on multiple jobs
- May need to update test/lint commands for workspace

**Fixes Needed:**
- Remove continue-on-error flags
- Verify pnpm workspace compatibility
- Update any root-level assumptions about src/ paths

### 2. security.yml
**Current Issues:**
- `continue-on-error: true` on dependency-check, snyk-security, license-check
- Tools may not understand workspace structure

**Fixes Needed:**
- Remove continue-on-error flags
- Configure OWASP Dependency Check for workspaces
- Configure Snyk for pnpm workspaces
- Update license-checker to scan all packages

### 3. visual-testing.yml
**Current Issues:**
- `continue-on-error: true` on visual-tests job
- Storybook configuration may need updates

**Fixes Needed:**
- Remove continue-on-error flag
- Verify Storybook works with monorepo
- Update build paths if needed

### 4. uswds-update-check.yml
**Current Issues:**
- `continue-on-error: true` likely on version check
- May be checking wrong paths

**Fixes Needed:**
- Remove continue-on-error flag
- Update to check @uswds/uswds version in root package.json
- Update any path references

### 5. performance-regression.yml
**Current Issues:**
- `continue-on-error: true` on performance tests
- May need to aggregate results from multiple packages

**Fixes Needed:**
- Remove continue-on-error flag
- Update to test each package's build output
- Aggregate performance metrics across packages

### 6. accessibility-report.yml
**Current Issues:**
- `continue-on-error: true` on accessibility tests
- May be looking for wrong output paths

**Fixes Needed:**
- Remove continue-on-error flag
- Update to scan all packages
- Aggregate accessibility reports

### 7. docs-maintenance.yml
**Current Issues:**
- `continue-on-error: true` on docs generation
- Scripts may not find components in new locations

**Fixes Needed:**
- Remove continue-on-error flag
- Update scripts to look in `packages/*/src/components/`
- Verify documentation generation works

### 8. ci.yml
**Current Issues:**
- `continue-on-error: true` on main CI job
- Root-level build/test commands may fail

**Fixes Needed:**
- Remove continue-on-error flag
- Update to use pnpm workspace commands
- Use Turborepo for builds

### 9. weekly-intensive-testing.yml
**Current Issues:**
- `continue-on-error: true` on intensive test jobs
- May be running wrong test commands

**Fixes Needed:**
- Remove continue-on-error flag
- Update to use workspace-aware test commands
- Aggregate test results from all packages

## Testing Strategy

Since we can't test all workflows locally, the approach should be:

1. **Fix one workflow at a time**
2. **Push and monitor CI results**
3. **Iterate based on actual failures**
4. **Document learnings for next workflow**

## Recommended Fix Order

1. **quality-gates.yml** - Most critical, runs on every PR
2. **ci.yml** - Main CI pipeline
3. **visual-testing.yml** - Important for UI changes
4. **security.yml** - Important but less urgent
5. **performance-regression.yml** - Can tolerate some failures
6. **accessibility-report.yml** - Important but runs separately
7. **uswds-update-check.yml** - Less critical, scheduled job
8. **docs-maintenance.yml** - Less critical, scheduled job
9. **weekly-intensive-testing.yml** - Least critical, scheduled job

## Success Criteria

- All `continue-on-error: true` flags removed
- All workflows pass on main branch
- No false positives or unnecessary failures
- Proper error reporting when actual issues exist

## Notes

- **Don't attempt to fix all at once** - this will lead to debugging chaos
- **Monitor each fix in CI** - local testing is limited
- **Keep TODO comments** temporarily if uncertain about a fix
- **Consult smart-ci.yml** as reference for correct patterns

## References

- PR #19: https://github.com/[owner]/[repo]/pull/19 (monorepo migration)
- Turborepo docs: https://turbo.build/repo/docs
- pnpm workspace docs: https://pnpm.io/workspaces
