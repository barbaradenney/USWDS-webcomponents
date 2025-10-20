#!/usr/bin/env bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 0: Discovered Issues Check
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Purpose: Ensures discovered issues from previous --no-verify commits
#          are fixed before allowing new commits
#
# Exit codes:
#   0 - No discovered issues or all fixed
#   1 - Discovered issues exist and must be fixed
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🚨 0/11 Discovered issues check..."
node scripts/validate/check-discovered-issues.cjs || exit 1
echo "   ✅ Pass"
