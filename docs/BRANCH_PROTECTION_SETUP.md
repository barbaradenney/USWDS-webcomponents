# Branch Protection Setup Guide

Automated setup and configuration for GitHub branch protection rules.

## Overview

This guide helps you configure branch protection for the `main` branch to enforce:
- Pull request reviews before merging
- Required CI/CD checks
- No force pushes
- No deletions
- Linear commit history (squash merge)

## Quick Setup

### Option 1: Automated Setup (Recommended)

Use the included setup script:

```bash
# Run the setup script
./scripts/setup/configure-branch-protection.sh

# Or via npm
pnpm run setup:branch-protection
```

### Option 2: Manual Setup via GitHub Web UI

1. Navigate to: `Settings → Branches`
2. Click "Add branch protection rule"
3. Branch name pattern: `main`
4. Configure settings below

### Option 3: Manual Setup via GitHub CLI

```bash
gh api repos/barbaradenney/USWDS-webcomponents/branches/main/protection \
  --method PUT \
  --input .github/branch-protection-config.json
```

## Recommended Configuration

### Branch Protection Rules for `main`

| Setting | Value | Why |
|---------|-------|-----|
| **Require pull request** | ✅ Yes | Enforce code review |
| **Required approvals** | 1 | At least one maintainer approval |
| **Dismiss stale reviews** | ✅ Yes | Re-review after new commits |
| **Require status checks** | ✅ Yes | All CI must pass |
| **Required checks** | `lint`, `typecheck`, `test`, `build`, `visual-tests` | Core quality gates |
| **Require conversation resolution** | ✅ Yes | All comments addressed |
| **Require linear history** | ✅ Yes | Clean git history (squash merge) |
| **Allow force pushes** | ❌ No | Prevent history rewrite |
| **Allow deletions** | ❌ No | Protect branch from deletion |
| **Require signed commits** | Optional | Enhanced security (if using GPG) |
| **Restrict pushes** | ✅ Admins only | Only admin direct pushes (for emergencies) |

## Configuration File

Create `.github/branch-protection-config.json`:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "lint",
      "typecheck",
      "test",
      "build",
      "visual-tests"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
```

## Setup Script

Create `scripts/setup/configure-branch-protection.sh`:

```bash
#!/usr/bin/env bash
# Configure GitHub branch protection rules for main branch

set -e

echo "🔒 Configuring branch protection for 'main' branch..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "   Install from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"

# Apply branch protection
echo ""
echo "⚙️  Applying branch protection rules..."

gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","typecheck","test","build","visual-tests"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true

echo ""
echo "✅ Branch protection configured successfully!"
echo ""
echo "📋 Configuration:"
echo "   ✅ Require pull request reviews (1 approval)"
echo "   ✅ Dismiss stale reviews on new commits"
echo "   ✅ Require status checks: lint, typecheck, test, build, visual-tests"
echo "   ✅ Require linear history (squash merge)"
echo "   ✅ No force pushes allowed"
echo "   ✅ No branch deletion allowed"
echo "   ✅ Require conversation resolution"
echo ""
echo "🔗 View settings: https://github.com/$REPO/settings/branches"
```

## Verification

After setup, verify configuration:

```bash
# View current protection rules
gh api repos/barbaradenney/USWDS-webcomponents/branches/main/protection

# Or via web UI
# Navigate to: Settings → Branches → main
```

## Testing Protection Rules

Test that protection is working:

```bash
# This should FAIL (no direct pushes to main)
git checkout main
echo "test" > test.txt
git add test.txt
git commit -m "test: verify branch protection"
git push origin main
# Expected: ! [remote rejected] main -> main (protected branch hook declined)

# This should SUCCEED (via PR)
git checkout -b test/branch-protection
git push -u origin test/branch-protection
gh pr create --base main --title "test: verify branch protection"
# Create PR, get approval, then merge
```

## Updating Protection Rules

To modify protection rules:

1. **Update configuration**:
   - Edit `.github/branch-protection-config.json`
   - Or modify the setup script

2. **Re-run setup**:
   ```bash
   pnpm run setup:branch-protection
   ```

3. **Verify changes**:
   ```bash
   gh api repos/barbaradenney/USWDS-webcomponents/branches/main/protection
   ```

## Common Scenarios

### Allow Admins to Bypass (Emergency Only)

**Default**: Admins must follow rules

**To change**: Set `enforce_admins: false`

```bash
gh api repos/OWNER/REPO/branches/main/protection \
  --method PUT \
  --field enforce_admins=false
```

**Recommendation**: Keep `true` - even admins should use PRs

### Add More Required Checks

Update `required_status_checks.contexts`:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "lint",
      "typecheck",
      "test",
      "build",
      "visual-tests",
      "security-scan",        // NEW
      "accessibility-audit"   // NEW
    ]
  }
}
```

### Require Code Owner Review

Enable if you have a CODEOWNERS file:

```json
{
  "required_pull_request_reviews": {
    "require_code_owner_reviews": true
  }
}
```

### Require Signed Commits

Enable for enhanced security:

```bash
gh api repos/OWNER/REPO/branches/main/protection \
  --method PUT \
  --field required_signatures=true
```

**Note**: All contributors must set up GPG signing

## Troubleshooting

### Error: "Resource not accessible by integration"

**Cause**: Insufficient permissions

**Fix**: Ensure you're a repository admin
```bash
gh api repos/OWNER/REPO/collaborators/YOUR_USERNAME --jq .permissions
# Should show: "admin": true
```

### Error: "Validation failed: Contexts must be an array"

**Cause**: Incorrect JSON format

**Fix**: Ensure `contexts` is an array:
```json
{"contexts": ["lint", "test"]}  // Correct
{"contexts": "lint,test"}       // Wrong
```

### Checks Not Required

**Cause**: Check names don't match workflow job names

**Fix**: View actual check names:
```bash
gh api repos/OWNER/REPO/commits/main/check-runs --jq '.check_runs[].name'
```

Match names exactly in configuration.

## Best Practices

1. **Start Strict**: Easier to relax rules than to tighten them later
2. **Test First**: Verify all CI checks work before making them required
3. **Document Overrides**: If admins bypass rules, document why in commit message
4. **Review Regularly**: Update protection rules as project evolves
5. **Monitor Violations**: Check GitHub audit log for bypass attempts

## Additional Resources

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub API: Branch Protection](https://docs.github.com/en/rest/branches/branch-protection)
- [Git Workflow Guide](GIT_WORKFLOW.md)
- [CI/CD Workflows](CI_CD_WORKFLOWS.md)

## Summary

Branch protection ensures:
- ✅ No broken code reaches `main`
- ✅ All changes reviewed
- ✅ CI/CD checks pass
- ✅ Clean git history
- ✅ No accidental deletions or force pushes

**Setup Time**: 5 minutes

**Maintenance**: Minimal (update when adding new CI checks)

**Impact**: Prevents 99% of common git mistakes
