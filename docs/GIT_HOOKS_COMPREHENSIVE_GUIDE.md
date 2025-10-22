# Git Hooks Comprehensive Guide

## Overview

Optimizing the development workflow with strategic Git hooks.

## Currently Active Hooks ✅

### 1. `pre-commit` ✅

**When:** Before commit is created

**Purpose:** Validate code quality

**What it does:**

- Linting, TypeScript, tests
- USWDS compliance validation
- Component-specific validations
- Documentation validation

**Time:** ~26-36 seconds

### 2. `commit-msg` ✅

**When:** After commit message entered

**Purpose:** Validate commit message format

**What it does:**

- Enforces conventional commits format
- Validates: `type(scope): description`
- Allowed types: feat, fix, docs, style, refactor, test, chore

**Time:** <1 second

### 3. `post-commit` ✅

**When:** After commit is created

**Purpose:** Update documentation and cleanup

**What it does:**

- Component changelog updates
- README updates
- Testing documentation
- AI code quality feedback

**Time:** ~15 seconds (non-blocking)

---

## Recommended Additional Hooks 🎯

### 4. `pre-push` ⭐ **HIGH PRIORITY**

**When:** Before pushing to remote
**Purpose:** Final safety check before code goes to shared repository

**Why you need it:**
- Pre-commit can be bypassed with `--no-verify`
- Catches issues before they reach CI/CD
- Saves CI/CD credits
- Prevents breaking main/develop branches

**What it should do:**
```bash
#!/usr/bin/env sh
# .husky/pre-push

echo "🚀 Pre-push validation..."

# 1. Check we're not pushing to protected branches with --force
BRANCH=$(git branch --show-current)
PROTECTED_BRANCHES="main|master|develop"

if echo "$BRANCH" | grep -qE "^($PROTECTED_BRANCHES)$"; then
  if git push --dry-run --porcelain 2>&1 | grep -q '\+'; then
    echo "❌ Force push to protected branch detected!"
    echo "   Branch: $BRANCH"
    echo "   This could overwrite team members' work."
    read -p "Are you SURE you want to force push? (yes/NO): " confirm
    if [ "$confirm" != "yes" ]; then
      echo "❌ Push cancelled"
      exit 1
    fi
  fi
fi

# 2. Run full test suite (faster than waiting for CI to fail)
echo "🧪 Running full test suite..."
npm test -- --run --silent || {
  echo "❌ Tests failed! Fix before pushing."
  echo "   Or use: git push --no-verify (not recommended)"
  exit 1
}

# 3. Check bundle size hasn't exploded
echo "📦 Checking bundle size..."
npm run validate:bundle-size || {
  echo "⚠️  Bundle size increased significantly"
  read -p "Continue anyway? (yes/NO): " confirm
  if [ "$confirm" != "yes" ]; then
    exit 1
  fi
}

# 4. Verify TypeScript compiles
echo "📘 Verifying TypeScript..."
npm run typecheck || {
  echo "❌ TypeScript errors detected"
  exit 1
}

echo "✅ Pre-push checks passed!"
```

**Benefits:**
- ✅ Prevents broken code reaching CI/CD
- ✅ Saves ~5-10 minutes waiting for CI to fail
- ✅ Protects team from broken builds
- ✅ Catches issues missed by pre-commit bypasses

**Time:** ~30-60 seconds (worth it to avoid CI failures)

**Skip if needed:** `git push --no-verify`

---

### 5. `post-merge` ⭐ **MEDIUM PRIORITY**

**When:** After `git merge` or `git pull` completes
**Purpose:** Ensure environment is up-to-date after pulling changes

**Why you need it:**
- Dependencies might have changed (package.json)
- Database migrations might be needed
- Environment variables might have changed
- USWDS version might have updated

**What it should do:**
```bash
#!/usr/bin/env sh
# .husky/post-merge

echo "🔄 Post-merge checks..."

# 1. Check if package.json changed
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q 'package.json'; then
  echo "📦 package.json changed - dependencies may be outdated"
  echo "   Run: npm install"

  # Auto-install if flag is set
  if [ "$AUTO_INSTALL_DEPS" = "1" ]; then
    echo "🔧 Auto-installing dependencies..."
    npm install
  else
    read -p "Install now? (Y/n): " install
    if [ "$install" != "n" ]; then
      npm install
    fi
  fi
fi

# 2. Check if USWDS version changed
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q 'package.json'; then
  USWDS_CHANGED=$(git diff ORIG_HEAD HEAD -- package.json | grep '@uswds/uswds')
  if [ -n "$USWDS_CHANGED" ]; then
    echo "⚠️  USWDS version changed!"
    echo "   Run: npm run uswds:sync"
  fi
fi

# 3. Check if .env.example changed
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q '.env.example'; then
  echo "⚠️  .env.example changed - check your .env file"
  echo "   New variables may be required"
fi

# 4. Check if database migrations needed
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q 'migrations/'; then
  echo "⚠️  Database migrations detected"
  echo "   Run: npm run db:migrate"
fi

# 5. Suggest rebuilding if major changes
CHANGED_FILES=$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | wc -l)
if [ "$CHANGED_FILES" -gt 20 ]; then
  echo "📦 Many files changed ($CHANGED_FILES)"
  echo "   Consider: npm run build"
fi

echo "✅ Post-merge checks complete"
```

**Benefits:**
- ✅ Never forget to run `npm install`
- ✅ Catches environment setup issues early
- ✅ Smooth team collaboration

**Time:** <2 seconds (just checks, installs optional)

---

### 6. `post-checkout` ⭐ **LOW PRIORITY**

**When:** After `git checkout` switches branches
**Purpose:** Set up environment for the checked-out branch

**Why you need it:**
- Different branches may have different dependencies
- Storybook cache may be stale
- Node modules may be incompatible

**What it should do:**
```bash
#!/usr/bin/env sh
# .husky/post-checkout

PREV_HEAD=$1
NEW_HEAD=$2
BRANCH_CHECKOUT=$3

# Only run on branch checkouts (not file checkouts)
if [ "$BRANCH_CHECKOUT" = "1" ]; then
  echo "🔀 Switched branches..."

  # Check if package.json differs
  if ! git diff --quiet $PREV_HEAD $NEW_HEAD -- package.json; then
    echo "⚠️  package.json differs between branches"
    echo "   You may need to: npm install"
  fi

  # Clear Storybook cache if .storybook/ changed
  if ! git diff --quiet $PREV_HEAD $NEW_HEAD -- .storybook/; then
    echo "📚 Storybook configuration changed"
    echo "   Clearing cache..."
    rm -rf node_modules/.cache/storybook
  fi
fi
```

**Benefits:**
- ✅ Smooth branch switching
- ✅ Prevents "works on my branch" issues

**Time:** <1 second

---

### 7. `prepare-commit-msg` ⭐ **MEDIUM PRIORITY**

**When:** Before commit message editor opens
**Purpose:** Auto-populate commit message with helpful context

**Why you need it:**
- Saves time typing repetitive info
- Ensures consistency
- Can auto-detect issue numbers from branch names

**What it should do:**
```bash
#!/usr/bin/env sh
# .husky/prepare-commit-msg

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Only run for regular commits (not merges, amends, etc.)
if [ "$COMMIT_SOURCE" = "" ]; then
  BRANCH_NAME=$(git branch --show-current)

  # Extract issue number from branch name (e.g., "feat/123-add-modal")
  ISSUE_NUMBER=$(echo "$BRANCH_NAME" | grep -oE '[0-9]+' | head -1)

  # Extract component from branch (e.g., "feat/modal-redesign" -> "modal")
  COMPONENT=$(echo "$BRANCH_NAME" | sed -E 's/^[^/]+\/?([a-z-]+).*/\1/')

  # Detect type from branch name
  if echo "$BRANCH_NAME" | grep -q "^feat/"; then
    TYPE="feat"
  elif echo "$BRANCH_NAME" | grep -q "^fix/"; then
    TYPE="fix"
  elif echo "$BRANCH_NAME" | grep -q "^docs/"; then
    TYPE="docs"
  else
    TYPE="chore"
  fi

  # Pre-fill commit message
  if [ -n "$COMPONENT" ] && [ "$COMPONENT" != "$BRANCH_NAME" ]; then
    echo "$TYPE($COMPONENT): " > "$COMMIT_MSG_FILE"
  else
    echo "$TYPE: " > "$COMMIT_MSG_FILE"
  fi

  # Add issue reference if found
  if [ -n "$ISSUE_NUMBER" ]; then
    echo "" >> "$COMMIT_MSG_FILE"
    echo "Closes #$ISSUE_NUMBER" >> "$COMMIT_MSG_FILE"
  fi

  # Add template
  echo "" >> "$COMMIT_MSG_FILE"
  echo "# What changed:" >> "$COMMIT_MSG_FILE"
  echo "# - " >> "$COMMIT_MSG_FILE"
  echo "#" >> "$COMMIT_MSG_FILE"
  echo "# Why:" >> "$COMMIT_MSG_FILE"
  echo "# - " >> "$COMMIT_MSG_FILE"
fi
```

**Benefits:**
- ✅ Faster commits (pre-filled template)
- ✅ Consistent format
- ✅ Auto-links to issues

**Time:** <1 second

---

### 8. `pre-rebase` ⭐ **LOW PRIORITY**

**When:** Before `git rebase` starts
**Purpose:** Prevent dangerous rebases

**Why you need it:**
- Rebasing published commits can cause issues
- Rebasing with uncommitted changes is risky

**What it should do:**
```bash
#!/usr/bin/env sh
# .husky/pre-rebase

BRANCH=$1

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ Uncommitted changes detected"
  echo "   Commit or stash before rebasing"
  exit 1
fi

# Warn about rebasing main/master
if echo "$BRANCH" | grep -qE "^(main|master)$"; then
  echo "⚠️  WARNING: Rebasing $BRANCH"
  echo "   This is usually not recommended"
  read -p "Continue? (yes/NO): " confirm
  if [ "$confirm" != "yes" ]; then
    exit 1
  fi
fi
```

**Benefits:**
- ✅ Prevents data loss
- ✅ Prevents rewriting shared history

**Time:** <1 second

---

## Summary Recommendation

### Implement Immediately ⭐⭐⭐

1. **`pre-push`** - Essential safety net before code reaches team
   - Prevents broken builds
   - Catches pre-commit bypasses
   - Worth the 30-60 second wait

### Implement Soon ⭐⭐

2. **`post-merge`** - Keeps environment in sync
   - Saves "forgot to npm install" issues
   - Smooth team collaboration

3. **`prepare-commit-msg`** - Improves commit workflow
   - Saves typing time
   - Better consistency

### Consider Later ⭐

4. **`post-checkout`** - Nice to have for branch switching
5. **`pre-rebase`** - Safety for advanced Git users

---

## Implementation Priority

```
Priority 1 (This Week):
  ✅ pre-push

Priority 2 (Next Sprint):
  ✅ post-merge
  ✅ prepare-commit-msg

Priority 3 (When Needed):
  ⏸️  post-checkout
  ⏸️  pre-rebase
```

---

## Configuration

### Enable/Disable Hooks

```bash
# Skip pre-push for emergency fixes
git push --no-verify

# Skip all hooks for a commit
git commit --no-verify

# Disable a hook temporarily
chmod -x .husky/pre-push

# Re-enable
chmod +x .husky/pre-push
```

### Environment Variables

```bash
# Auto-install dependencies after merge
AUTO_INSTALL_DEPS=1 git pull

# Skip post-commit documentation updates
SKIP_POST_COMMIT_DOCS=1 git commit
```

---

## Testing Hooks

```bash
# Test pre-push without actually pushing
.husky/pre-push

# Test post-merge
.husky/post-merge

# Test with verbose output
DEBUG=1 .husky/pre-push
```

---

## Best Practices

### DO ✅
- Keep hooks fast (users will bypass slow hooks)
- Provide clear error messages
- Allow bypassing with `--no-verify` for emergencies
- Log what the hook is doing
- Make hooks idempotent (safe to run multiple times)

### DON'T ❌
- Don't modify the working directory in pre-* hooks
- Don't run hooks that take >2 minutes
- Don't make hooks mandatory for development
- Don't surprise developers with unexpected behavior

---

## Monitoring Hook Performance

Track hook execution time:

```bash
# Add to each hook
START_TIME=$(date +%s)
# ... hook logic ...
END_TIME=$(date +%s)
echo "⏱️  Hook completed in $((END_TIME - START_TIME))s"
```

---

## Related

- Current hooks: `.husky/`
- Hook documentation: Git official docs
- Pre-commit optimization: `docs/PRE_POST_COMMIT_OPTIMIZATION_PROPOSAL.md`

---

## Conclusion

The **pre-push** hook is the most valuable addition:
- Prevents broken code reaching CI/CD
- Catches issues pre-commit might have missed
- Saves team time and CI/CD credits
- Only runs when pushing (not every commit)

**Recommendation: Implement `pre-push` first, then `post-merge`** ✅
