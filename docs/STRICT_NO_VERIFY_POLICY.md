# Strict --no-verify Policy

## Overview

**POLICY**: ANY use of `--no-verify` MUST be tracked and addressed, even if the reason is legitimate.

This ensures nothing slips through the cracks and maintains the highest code quality standards.

## Why Strict Mode?

Previously, if you documented `--no-verify` in the commit message as legitimate (e.g., "AI quality false positive"), it would create a tracker but then immediately clear when validations passed. This allowed issues to be overlooked.

**New behavior**: Even legitimate `--no-verify` usage creates a discovered issues tracker that persists until explicitly addressed through proper validation and fixing.

## How It Works

### 1. Automatic Detection (Post-Commit)

The post-commit hook automatically detects `--no-verify` usage through multiple methods:

**Detection Methods:**
- ✅ **Explicit**: Commit message mentions `--no-verify`
- ✅ **Forensic**: Validation metrics missing or stale
- ✅ **Forensic**: Hook markers absent (e.g., ESLint cache not updated)

**Script**: `scripts/validate/detect-no-verify-usage.cjs`

### 2. Issue Tracking

When `--no-verify` is detected, the system:

1. **Creates tracker**: `.git/DISCOVERED_ISSUES.json` with details
2. **Blocks future commits**: Pre-commit hook enforces fixing issues first
3. **Shows actionable info**: Exactly what validations were skipped
4. **Provides commands**: How to check and fix issues

### 3. Resolution Process

You **MUST** address discovered issues before starting new work:

```bash
# 1. Check what needs fixing
pnpm run fix:discovered

# 2. Fix the issues (could be legitimate or actual problems)
# - Run full validation: pnpm run validate
# - Fix any actual issues found
# - If issues were legitimate (false positives), document in next commit

# 3. Commit fixes
git commit -m "fix: address discovered issues from --no-verify commit"

# 4. Tracker auto-clears when all validations pass
```

## Valid Reasons for --no-verify

### ✅ Legitimate Use Cases

1. **AI Code Quality False Positives**
   - AI validator flags pre-existing code patterns
   - Event listeners have cleanup but validator doesn't detect it
   - **Action**: Document in commit, add issue tracker, verify manually

2. **Pre-commit Hook Bugs**
   - Hook itself has a bug causing false failures
   - **Action**: File bug report, use `--no-verify`, create tracker

3. **Emergency Hotfix**
   - Critical production issue needs immediate fix
   - Full validation would delay deployment
   - **Action**: Deploy, then fix properly with tracker

4. **Hook-Generated Commits**
   - Post-commit automation (changelogs, docs)
   - Already validated in original commit
   - **Action**: These skip hooks intentionally

### ❌ Invalid Use Cases

1. **Skipping Tests Because They're Slow**
   - Not a valid reason - fix test performance instead
   - **Action**: Optimize tests, never skip

2. **"I'll Fix It Later"**
   - Defeats the purpose of validation
   - **Action**: Fix now or don't commit

3. **Legitimate Test Failures**
   - Tests catching real issues
   - **Action**: Fix the issues, don't bypass

## Detection Examples

### Example 1: Explicit Documentation

```bash
git commit --no-verify -m "fix: update component

Note: Used --no-verify due to AI quality false positive.
Event listeners ARE cleaned up in disconnectedCallback."
```

**Detection**: ✅ High confidence (commit message mentions --no-verify)
**Action**: Tracker created, manual verification required

### Example 2: Forensic Detection

```bash
# Developer uses --no-verify but doesn't document it
git commit --no-verify -m "fix: update component"
```

**Detection**: ✅ Medium confidence (validation metrics missing/stale)
**Action**: Tracker created, all skipped validations listed

### Example 3: Normal Commit

```bash
# Normal commit with all hooks running
git commit -m "fix: update component"
```

**Detection**: ❌ No --no-verify detected
**Action**: No tracker created, normal workflow

## Implementation Details

### Detection Script

**Location**: `scripts/validate/detect-no-verify-usage.cjs`

**Checks**:
1. Commit message grep for "no-verify" patterns
2. Validation metrics file timestamp comparison
3. ESLint cache timestamp analysis
4. Hook marker presence check

**Exit Codes**:
- `0` = --no-verify WAS used (hooks bypassed)
- `1` = --no-verify was NOT used (normal commit)

### Post-Commit Integration

**Location**: `.husky/post-commit` (lines 194-237)

**Behavior**:
```bash
if node scripts/validate/detect-no-verify-usage.cjs "$COMMIT_HASH"; then
  # --no-verify detected
  node scripts/validate/generate-discovered-issues.cjs
  # Shows strict policy warning
fi
```

### Pre-Commit Enforcement

**Location**: `.husky/pre-commit` (stage 00)

**Behavior**:
```bash
if [ -f ".git/DISCOVERED_ISSUES.json" ]; then
  echo "❌ Discovered issues must be fixed first"
  echo "Run: pnpm run fix:discovered"
  exit 1
fi
```

## NPM Scripts

```bash
# Check if last commit used --no-verify
pnpm run check:no-verify

# View discovered issues (if any)
pnpm run fix:discovered

# Run all validations manually
pnpm run validate
```

## Workflow Example

### Scenario: AI Quality False Positive

```bash
# 1. Try to commit - AI validator flags pre-existing code
git commit -m "fix(button): update click handler"
# ❌ Pre-commit fails: Event listeners without cleanup

# 2. Verify the flagged code is actually fine
# Check disconnectedCallback() - cleanup IS there

# 3. Use --no-verify with documentation
git commit --no-verify -m "fix(button): update click handler

Note: Used --no-verify due to AI quality false positive.
Event listeners ARE properly cleaned up in disconnectedCallback().
Will verify manually and address in tracker."

# ✅ Commit succeeds
# 🤖 Post-commit creates: .git/DISCOVERED_ISSUES.json

# 4. Next commit is blocked
git commit -m "feat(card): add new variant"
# ❌ pre-commit blocked: "Fix discovered issues first"

# 5. Check what needs addressing
pnpm run fix:discovered
# Shows: Event listener cleanup validation was skipped

# 6. Run manual validation
pnpm run validate
# ✅ All validations pass

# 7. Document resolution
git commit -m "chore: verify event listener cleanup

Manually verified that event listeners in button component
have proper cleanup in disconnectedCallback().

Original commit: 511ae354c
Issue: AI quality false positive"

# ✅ Commit succeeds
# 🗑️  Auto-deletes: .git/DISCOVERED_ISSUES.json

# 8. Now free to continue
git commit -m "feat(card): add new variant"
# ✅ Allowed
```

## Benefits

1. **Nothing Gets Missed**: Every `--no-verify` is tracked
2. **Accountability**: Clear audit trail of validation bypasses
3. **Quality Assurance**: Forces manual verification of skipped checks
4. **Prevents Debt**: Can't accumulate ignored validation failures
5. **Transparency**: Team sees when and why hooks were bypassed

## Monitoring

Check for pattern of `--no-verify` usage:

```bash
# Count --no-verify commits in last 30 days
git log --since="30 days ago" --grep="no-verify" --oneline | wc -l

# See full history
git log --grep="no-verify" --oneline

# Check for forensically detected usage
git log --since="30 days ago" --all --format="%H %s" | while read hash msg; do
  if node scripts/validate/detect-no-verify-usage.cjs "$hash" 2>/dev/null; then
    echo "$hash: $msg"
  fi
done
```

## See Also

- [CLAUDE.md](../CLAUDE.md) - Complete development guidelines
- [Discovered Issues Policy](../CLAUDE.md#discovered-issues-policy) - Original policy
- [Git Hooks Guide](GIT_HOOKS_COMPREHENSIVE_GUIDE.md) - All Git hooks documentation
