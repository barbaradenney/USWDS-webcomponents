# Branch Protection Rules

This document outlines the recommended branch protection rules for the USWDS Web Components repository to ensure code quality and maintain production readiness.

## Main Branch Protection

Apply these settings to the `main` branch in GitHub Settings → Branches:

### ✅ Required Settings

1. **Require a pull request before merging**
   - ✅ Require approvals: 1 minimum
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from CODEOWNERS (if configured)

2. **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging
   - Required status checks:
     - `Code Quality`
     - `Build Verification`
     - `Unit Tests`
     - `Security Audit`

3. **Require conversation resolution before merging**
   - ✅ All conversations must be resolved

4. **Require linear history**
   - ✅ Prevent merge commits (use squash and merge)

5. **Include administrators**
   - ⚠️ Optional but recommended for consistency

6. **Restrict who can push to matching branches**
   - Limit to maintainers and CI service accounts

### 🔒 Additional Security

1. **Require signed commits** (optional but recommended)
   - Ensures commit authenticity

2. **Lock branch** (only for archived/deprecated branches)
   - Prevents any changes

## Development Branch Protection

For `develop` or feature branches:

1. **Require pull request reviews**
   - Minimum 1 approval
   - Can be less strict than main

2. **Require status checks**
   - At minimum: `Code Quality` and `Build Verification`

3. **Allow force pushes**
   - ⚠️ Only for feature branches, never for main/develop

## Setting Up Branch Protection

### Via GitHub UI

1. Navigate to Settings → Branches
2. Click "Add rule" or edit existing rule
3. Enter branch name pattern (e.g., `main`)
4. Configure settings as outlined above
5. Click "Create" or "Save changes"

### Via GitHub API

```bash
# Example using GitHub CLI
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Code Quality","Build Verification","Unit Tests"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## CI/CD Integration

The branch protection rules work with our GitHub Actions workflow:

- **Automated checks** run on every PR
- **Status badges** show current build status
- **Merge is blocked** until all checks pass

## Emergency Procedures

### Bypassing Protection (Emergency Only)

1. Repository admins can bypass protection if needed
2. Document the reason in the commit message
3. Create an issue to track the bypass
4. Review in next team meeting

### Temporarily Disabling Protection

```bash
# Via GitHub CLI (admin only)
gh api repos/:owner/:repo/branches/main/protection \
  --method DELETE

# Remember to re-enable after emergency
```

## Best Practices

1. **Never disable protection** for convenience
2. **Fix failing tests** rather than bypassing
3. **Keep CI fast** to avoid bottlenecks
4. **Review protection rules** quarterly
5. **Document any exceptions** clearly

## Pull Request Workflow

With branch protection enabled:

1. Create feature branch from `main`
2. Make changes and push to feature branch
3. Open PR against `main`
4. CI runs automatically
5. Address any failing checks
6. Request review from team
7. Resolve any review comments
8. Merge when all checks pass

## Monitoring

Track protection effectiveness:

- Review bypass events monthly
- Monitor CI failure rates
- Track time from PR to merge
- Identify bottlenecks in the process

## Troubleshooting

### Common Issues

**"Required status checks have not passed"**

- Check Actions tab for failing jobs
- Run tests locally: `npm run test`
- Verify TypeScript: `npm run typecheck`

**"This branch is out-of-date with the base branch"**

- Merge or rebase latest main into your branch
- Resolve any conflicts
- Push updated branch

**"Review required"**

- Request review from team member
- Address any feedback
- Get approval before merging

## Team Agreements

- All team members understand these rules
- Exceptions require team discussion
- Rules apply equally to all contributors
- Regular reviews ensure rules remain relevant

---

Last Updated: September 2024
Next Review: December 2024
