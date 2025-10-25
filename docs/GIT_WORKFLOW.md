# Git Workflow Guide

Comprehensive branching strategy and development workflow for USWDS Web Components.

## Table of Contents

- [Overview](#overview)
- [Branching Strategy](#branching-strategy)
- [Branch Types](#branch-types)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Hotfix Process](#hotfix-process)
- [Branch Protection Rules](#branch-protection-rules)
- [Common Scenarios](#common-scenarios)
- [Best Practices](#best-practices)

## Overview

This project uses **GitHub Flow** - a simplified branching strategy that works well for continuous delivery.

### Key Principles

1. **`main` is always deployable** - Production-ready code only
2. **Feature branches for all changes** - No direct commits to `main`
3. **Pull requests for code review** - All changes reviewed before merge
4. **Automated CI/CD** - Tests run on every PR
5. **Fast-forward merges** - Linear commit history

### Why GitHub Flow?

- **Simplicity**: Easy to understand and follow
- **Speed**: Fast iteration without complex branching
- **Safety**: Automated testing catches issues early
- **Transparency**: All changes visible in PRs
- **Perfect for libraries**: Continuous releases with semantic versioning

## Branching Strategy

```
main (protected)
  ├── feature/add-table-component
  ├── fix/modal-keyboard-trap
  ├── docs/update-architecture-guide
  └── hotfix/security-vulnerability
```

### Primary Branch

**`main`** - The single source of truth
- Always in deployable state
- Protected (no direct pushes)
- All changes via pull requests
- Triggers deployment on merge
- Tagged for releases

### Working Branches

All development happens in feature branches:
- Created from `main`
- Merged back to `main` via PR
- Deleted after merge
- Named with descriptive prefixes

## Branch Types

### Feature Branches (`feature/*`)

**Purpose**: New features and enhancements

**Naming**:
```bash
feature/<issue-number>-<short-description>
feature/123-add-pagination-component
feature/456-improve-accessibility
```

**Lifecycle**:
```bash
# Create from main
git checkout main
git pull origin main
git checkout -b feature/123-add-pagination

# Work on feature
git add .
git commit -m "feat(pagination): add basic pagination component"

# Push and create PR
git push -u origin feature/123-add-pagination
gh pr create --base main
```

**Merge**: Squash and merge into `main`

### Bug Fix Branches (`fix/*`)

**Purpose**: Bug fixes for existing features

**Naming**:
```bash
fix/<issue-number>-<short-description>
fix/789-modal-focus-trap
fix/012-button-aria-label
```

**Lifecycle**: Same as feature branches

**Merge**: Squash and merge into `main`

### Documentation Branches (`docs/*`)

**Purpose**: Documentation-only changes

**Naming**:
```bash
docs/<description>
docs/update-contributing-guide
docs/add-architecture-diagrams
```

**Special**: May skip some CI checks (via smart commit detection)

**Merge**: Squash and merge into `main`

### Refactor Branches (`refactor/*`)

**Purpose**: Code refactoring without changing behavior

**Naming**:
```bash
refactor/<description>
refactor/simplify-form-validation
refactor/extract-common-utilities
```

**Merge**: Squash and merge into `main`

### Test Branches (`test/*`)

**Purpose**: Test additions or improvements

**Naming**:
```bash
test/<description>
test/add-visual-regression-tests
test/improve-accessibility-coverage
```

**Merge**: Squash and merge into `main`

### Chore Branches (`chore/*`)

**Purpose**: Maintenance tasks, dependency updates

**Naming**:
```bash
chore/<description>
chore/update-dependencies
chore/configure-prettier
```

**Merge**: Squash and merge into `main`

### Hotfix Branches (`hotfix/*`)

**Purpose**: Urgent production fixes

**Naming**:
```bash
hotfix/<issue-number>-<critical-description>
hotfix/999-security-xss-vulnerability
hotfix/888-data-loss-on-save
```

**Priority**: Highest - skip ahead of other PRs

**Merge**: Squash and merge into `main` immediately after approval

## Development Workflow

### Standard Workflow

#### 1. Start New Work

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/123-my-feature

# Verify branch
git branch --show-current
```

#### 2. Develop Feature

```bash
# Make changes
# ... edit files ...

# Stage changes
git add packages/uswds-wc-actions/src/components/button/

# Commit with conventional commit message
git commit -m "feat(button): add size variants

- Add small, medium, large size options
- Update Storybook stories
- Add comprehensive tests

Closes #123"

# Pre-commit hook runs automatically:
# - Repository organization
# - USWDS compliance validation
# - Linting and TypeScript
# - Component tests
# - Test expectations
```

#### 3. Push and Create PR

```bash
# Push branch
git push -u origin feature/123-my-feature

# Create PR (using gh CLI)
gh pr create --base main --title "feat(button): add size variants" --body "$(cat <<'EOF'
## Summary
Add size variants (small, medium, large) to button component

## Changes
- Add `size` property to USAButton
- Implement USWDS size classes
- Add tests for all sizes
- Update Storybook with size controls

## Testing
- ✅ Unit tests passing
- ✅ Visual regression tests updated
- ✅ Accessibility tests passing

Closes #123
EOF
)"
```

#### 4. Address Review Feedback

```bash
# Make requested changes
# ... edit files ...

# Commit changes
git add .
git commit -m "fix(button): address review feedback"

# Push updates
git push origin feature/123-my-feature

# PR automatically updates
```

#### 5. Merge PR

**Once approved**:
- PR maintainer clicks "Squash and merge"
- All commits squashed into one clean commit
- Feature branch automatically deleted
- CI/CD runs on `main`

#### 6. Clean Up Local Branch

```bash
# Return to main
git checkout main
git pull origin main

# Delete local feature branch
git branch -d feature/123-my-feature
```

### Keeping Branch Updated

If your branch gets behind `main`:

```bash
# Option 1: Rebase (preferred for clean history)
git checkout feature/123-my-feature
git fetch origin
git rebase origin/main

# Resolve any conflicts
# ... edit conflicting files ...
git add .
git rebase --continue

# Force push (rebase rewrites history)
git push --force-with-lease origin feature/123-my-feature

# Option 2: Merge (if you prefer merge commits)
git checkout feature/123-my-feature
git merge origin/main
git push origin feature/123-my-feature
```

## Pull Request Process

### Creating a PR

**Via GitHub CLI** (recommended):
```bash
gh pr create --base main
```

**Via GitHub Web UI**:
1. Push branch to GitHub
2. Navigate to repository
3. Click "Compare & pull request"
4. Fill in PR template
5. Click "Create pull request"

### PR Template

The PR should include:

```markdown
## Summary
Brief description of changes

## Changes
- Bullet list of specific changes
- Technical details
- Breaking changes (if any)

## Testing
- [ ] Unit tests added/updated
- [ ] Visual tests updated (if UI changes)
- [ ] Cypress tests added (if interactive)
- [ ] Manual testing completed

## Screenshots/Videos
(If applicable)

## Checklist
- [ ] Code follows style guide
- [ ] Tests passing locally
- [ ] Documentation updated
- [ ] Changeset added (if needed)

Closes #<issue-number>
```

### PR Review Process

**Automated Checks** (must pass):
- ✅ Linting (ESLint + Prettier)
- ✅ TypeScript type checking
- ✅ Unit tests (Vitest)
- ✅ Visual regression tests (Chromatic)
- ✅ Build validation
- ✅ Bundle size check

**Code Review** (1+ approvals):
- Architecture alignment
- Code quality
- Test coverage
- Documentation completeness

**Approval**:
- Maintainer reviews changes
- Requests changes if needed
- Approves when ready
- Merges via "Squash and merge"

### PR Size Guidelines

**Ideal PR size**: 200-400 lines changed

**Why**:
- Easier to review
- Faster feedback
- Lower risk of bugs
- Better git history

**If PR gets large**:
- Split into smaller PRs
- Create stacked PRs (PR #1 → PR #2 → main)
- Use feature branches for coordination

## Release Process

This project uses **automated releases** with Changesets.

### Adding a Changeset

When your PR affects the public API:

```bash
# Interactive mode (recommended)
pnpm changeset

# Follow prompts:
# 1. Select packages affected: @uswds-wc/actions, @uswds-wc/core
# 2. Version bump: major/minor/patch
# 3. Summary: "Add size variants to button component"
```

**This creates**: `.changeset/random-name.md`

```markdown
---
"@uswds-wc/actions": minor
---

Add size variants to button component
```

### Version Bump Types

**Major (1.0.0 → 2.0.0)**: Breaking changes
- Removed properties
- Changed behavior
- Incompatible API changes

**Minor (1.0.0 → 1.1.0)**: New features
- New components
- New properties (backwards-compatible)
- New functionality

**Patch (1.0.0 → 1.0.1)**: Bug fixes
- Bug fixes
- Performance improvements
- Documentation updates

### Automated Release Flow

1. **PR merged to `main`** with changeset
2. **Changesets bot** creates "Version Packages" PR
3. **Accumulates changesets** from multiple PRs
4. **Updates versions** in package.json files
5. **Generates CHANGELOG.md** entries
6. **When Version PR merges**:
   - Publishes to npm
   - Creates GitHub release
   - Tags commit with version

### Manual Release (Maintainers Only)

**Emergency release**:
```bash
# Ensure main is clean
git checkout main
git pull origin main

# Version packages
pnpm changeset version

# Review changes
git diff

# Commit version bump
git add .
git commit -m "chore: release packages"

# Publish to npm
pnpm changeset publish

# Push with tags
git push origin main --follow-tags
```

## Hotfix Process

**Critical production issues** require immediate fixes.

### Hotfix Workflow

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/999-critical-security-fix

# 2. Make fix
# ... edit files ...
git add .
git commit -m "fix(security): patch XSS vulnerability

CRITICAL: Fixes XSS vulnerability in user input sanitization

Closes #999"

# 3. Push and create PR with HIGH PRIORITY label
git push -u origin hotfix/999-critical-security-fix
gh pr create --base main --label "priority:critical"

# 4. Get immediate review and merge
# Skip normal review queue - get maintainer approval ASAP

# 5. After merge, create emergency release
pnpm changeset
# Select: patch
# Summary: "Security fix for XSS vulnerability"

# 6. Merge Version PR immediately
# Publishes to npm within minutes
```

## Branch Protection Rules

### Recommended Settings (GitHub)

**Branch**: `main`

**Protections**:
- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - `lint`
  - `typecheck`
  - `test`
  - `build`
  - `visual-tests`
- ✅ Require conversation resolution before merging
- ✅ Require linear history (enforce squash merge)
- ✅ Do not allow bypassing settings (except for administrators)
- ✅ Restrict who can push to matching branches
- ✅ Allow force pushes: No
- ✅ Allow deletions: No

### Setting Up Branch Protection

```bash
# Via GitHub CLI
gh api repos/barbaradenney/USWDS-webcomponents/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","typecheck","test","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  --field restrictions=null
```

**Or via GitHub Web UI**:
1. Repository Settings → Branches
2. Add rule for `main`
3. Configure protections as listed above

## Common Scenarios

### Scenario 1: Simple Bug Fix

```bash
# 1. Create branch
git checkout -b fix/456-button-color

# 2. Fix bug
# ... edit files ...
git commit -m "fix(button): correct primary button color"

# 3. Push and PR
git push -u origin fix/456-button-color
gh pr create --base main

# 4. After merge, clean up
git checkout main && git pull origin main
git branch -d fix/456-button-color
```

### Scenario 2: Large Feature with Multiple PRs

```bash
# 1. Create feature branch for coordination
git checkout -b feature/pagination-system

# 2. Create sub-feature branches
git checkout -b feature/pagination-component

# Work on component...
# Create PR: feature/pagination-component → feature/pagination-system

# 3. Create another sub-feature
git checkout feature/pagination-system
git checkout -b feature/pagination-accessibility

# Work on accessibility...
# Create PR: feature/pagination-accessibility → feature/pagination-system

# 4. After all sub-features merged
# Create final PR: feature/pagination-system → main
```

### Scenario 3: Urgent Hotfix

```bash
# 1. Create hotfix immediately
git checkout main && git pull
git checkout -b hotfix/critical-data-loss

# 2. Fix issue
# ... critical fix ...
git commit -m "fix(data): prevent data loss on save"

# 3. Emergency PR
git push -u origin hotfix/critical-data-loss
gh pr create --base main --label "priority:critical"

# 4. Fast-track review and merge
# Get maintainer approval within minutes

# 5. Emergency release
pnpm changeset  # patch version
# Merge Version PR immediately
```

### Scenario 4: Stale Branch

If your branch is behind `main` by many commits:

```bash
# 1. Fetch latest
git fetch origin

# 2. Check how far behind
git log HEAD..origin/main --oneline

# 3. Rebase onto main (preferred)
git rebase origin/main

# 4. Resolve conflicts if any
# ... fix conflicts ...
git add .
git rebase --continue

# 5. Force push (safe with --force-with-lease)
git push --force-with-lease origin feature/my-branch
```

### Scenario 5: Accidental Commit to Main

**If you accidentally committed to `main`** (before pushing):

```bash
# 1. Create branch from current state
git branch feature/accidental-work

# 2. Reset main to match origin
git checkout main
git reset --hard origin/main

# 3. Continue work in feature branch
git checkout feature/accidental-work
git push -u origin feature/accidental-work
```

## Best Practices

### Commit Messages

**Follow Conventional Commits**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Examples**:
```
feat(button): add size variants
fix(modal): correct focus trap behavior
docs(contributing): update branching strategy
refactor(utils): simplify validation logic
test(accordion): add accessibility tests
```

### Branch Management

**DO**:
- ✅ Create branch from up-to-date `main`
- ✅ Use descriptive branch names
- ✅ Keep branches short-lived (< 1 week)
- ✅ Rebase frequently to stay current
- ✅ Delete branches after merge
- ✅ Use PR templates consistently
- ✅ Request reviews promptly
- ✅ Keep PRs focused and small

**DON'T**:
- ❌ Commit directly to `main`
- ❌ Force push to `main`
- ❌ Keep stale branches for weeks
- ❌ Create giant PRs (500+ lines)
- ❌ Merge without CI passing
- ❌ Merge without review approval
- ❌ Use vague branch names (`fix-stuff`)
- ❌ Include unrelated changes in PR

### Code Review

**As Author**:
- Keep PRs small and focused
- Add clear description and screenshots
- Respond to feedback promptly
- Request re-review after changes
- Be open to suggestions

**As Reviewer**:
- Review within 24 hours
- Be constructive and specific
- Approve when ready, request changes when needed
- Check both code and tests
- Verify CI passes before approving

### Git Commands Reference

**Common tasks**:
```bash
# Update main
git checkout main && git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Stage all changes
git add .

# Commit with message
git commit -m "feat(component): add feature"

# Push new branch
git push -u origin feature/my-feature

# Push updates
git push

# Create PR
gh pr create --base main

# Check PR status
gh pr status

# View PR in browser
gh pr view --web

# Merge PR
gh pr merge --squash

# Delete local branch
git branch -d feature/my-feature

# Clean up merged branches
git fetch --prune && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d
```

## Quick Reference

| Task | Command |
|------|---------|
| Start new feature | `git checkout -b feature/123-name` |
| Create PR | `gh pr create --base main` |
| Update branch from main | `git rebase origin/main` |
| Force push safely | `git push --force-with-lease` |
| Clean merged branches | `git fetch --prune` |
| View PR status | `gh pr status` |
| Merge PR | `gh pr merge --squash` |
| Create hotfix | `git checkout -b hotfix/critical-fix` |

## Additional Resources

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full contribution guidelines
- [CI_CD_WORKFLOWS.md](CI_CD_WORKFLOWS.md) - GitHub Actions workflows
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing strategies
- [CLAUDE.md](../CLAUDE.md) - Development standards

## Questions?

- Check [GitHub Discussions](https://github.com/barbaradenney/USWDS-webcomponents/discussions)
- Review closed PRs for examples
- Ask maintainers for clarification

---

**Remember**: `main` is sacred. Always use pull requests. Never force push to `main`.
