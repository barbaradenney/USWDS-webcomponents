#!/usr/bin/env bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 1: Repository Organization
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Purpose: Ensures repository structure follows organizational standards
#          Includes:
#          - Repository organization cleanup (1/9)
#          - Script organization validation (1a/9)
#
# Exit codes:
#   0 - Repository properly organized
#   1 - Organization issues detected
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Stage 1/9: Repository organization cleanup
echo "🧹 1/9 Repository organization..."
node scripts/ci/cleanup-validator.cjs > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "   ⚠️  Files need organization - running auto-cleanup..."
  node scripts/maintenance/auto-cleanup.cjs
  # Re-validate after cleanup
  node scripts/ci/cleanup-validator.cjs || {
    echo "❌ Repository organization issues remain after auto-cleanup!"
    echo "💡 Manual intervention needed"
    exit 1
  }
  # Stage cleaned up files
  git add -u
  echo "   ✅ Auto-cleanup complete and staged"
else
  echo "   ✅ Pass"
fi

# Stage 1a/9: Script organization
echo "🧹 1a/9 Script organization..."
node scripts/validate/validate-script-organization.js > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ One-off scripts detected in active directories!"
  echo "💡 Run: node scripts/validate/validate-script-organization.js"
  echo "   Review and move completed scripts to scripts/archived/one-off-fixes/"
  exit 1
fi
echo "   ✅ Pass"
