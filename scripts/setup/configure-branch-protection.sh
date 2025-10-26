#!/usr/bin/env bash
# Configure GitHub branch protection rules for main branch

set -e

echo "🔒 Configuring branch protection for 'main' branch..."
echo ""

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
echo ""

# Confirm before proceeding
read -p "⚠️  This will configure branch protection for 'main'. Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "⚙️  Applying branch protection rules..."
echo ""

# Apply branch protection using GitHub API
# Note: Using --input to send complete JSON payload
cat <<'EOF' | gh api repos/$REPO/branches/main/protection --method PUT --input -
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Chromatic Visual Regression",
      "Visual Regression Tests",
      "Unit Tests",
      "Linting & Formatting",
      "TypeScript Type Checking"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF

echo ""
echo "✅ Branch protection configured successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "   ✅ No approval required (solo developer repository)"
echo "   ✅ Require status checks before merging:"
echo "      - Chromatic Visual Regression"
echo "      - Visual Regression Tests"
echo "      - Unit Tests"
echo "      - Linting & Formatting"
echo "      - TypeScript Type Checking"
echo "   ✅ Require linear history (squash merge enforced)"
echo "   ✅ No force pushes allowed"
echo "   ✅ No branch deletion allowed"
echo "   ✅ Require conversation resolution before merging"
echo "   ⚠️  Admin bypass available (enforce_admins: false)"
echo ""
echo "💡 Workflow:"
echo "   1. Claude creates feature branch and PR"
echo "   2. CI checks run automatically"
echo "   3. Merge when all checks pass (admin override available if needed)"
echo ""
echo "🔗 View settings: https://github.com/$REPO/settings/branches"
echo ""
echo "💡 Tip: Test protection with:"
echo "   git checkout -b test/branch-protection"
echo "   # Make a change, push, create PR"
