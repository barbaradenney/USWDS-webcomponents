#!/usr/bin/env bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 3: Linting and Code Quality
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Purpose: Validates code quality and style standards
#          Includes:
#          - Linting (5/9)
#          - TypeScript compilation (6/9)
#          - Code quality review (6a/9)
#
# Performance tracking:
#   Uses start_stage/end_stage if available (provided by orchestrator)
#
# Exit codes:
#   0 - All quality checks passed
#   1 - Quality issues detected
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Stage 5/9: Linting
echo "🔍 5/9 Linting..."
if type start_stage >/dev/null 2>&1; then
  start_stage "lint" "Linting"
fi

npm run lint > /dev/null 2>&1 || {
  echo "❌ Linting failed! Run: npm run lint"
  exit 1
}

if type end_stage >/dev/null 2>&1; then
  end_stage "lint"
fi
echo "   ✅ Pass"

# Stage 6/9: TypeScript compilation
echo "📘 6/9 TypeScript compilation..."
if type start_stage >/dev/null 2>&1; then
  start_stage "typescript" "TypeScript"
fi

npm run typecheck > /dev/null 2>&1 || {
  echo "❌ TypeScript errors! Run: npm run typecheck"
  exit 1
}

if type end_stage >/dev/null 2>&1; then
  end_stage "typescript"
fi
echo "   ✅ Pass"

# Stage 6a/9: Code quality review
echo "✨ 6a/9 Code quality review..."
node scripts/validate/code-quality-review.cjs > /dev/null 2>&1 || {
  echo "❌ Code quality issues detected!"
  echo "   Run: npm run validate:code-quality (for detailed report)"
  exit 1
}
echo "   ✅ Pass"
