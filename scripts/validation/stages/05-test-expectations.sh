#!/usr/bin/env bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 5: Test Expectations
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Purpose: Validates test quality and patterns
#          Includes:
#          - Test expectations (8/9)
#          - Test skip policy enforcement (8b/9)
#          - Cypress test pattern validation (8c/9)
#          - Component regression tests (8a/9)
#
# Required environment variables:
#   MODIFIED_COMPONENT_COUNT - Number of modified components
#   MODIFIED_COMPONENTS - List of modified component names
#
# Exit codes:
#   0 - All test expectations met
#   1 - Test expectation violations detected
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Stage 8/9: Test expectations
echo "🧪 8/9 Test expectations..."
npm run validate:test-expectations > /dev/null 2>&1 || {
  echo "❌ Test expectation violations! Run: npm run validate:test-expectations"
  exit 1
}
echo "   ✅ Pass"

# Stage 8b/9: Test skip policy enforcement
echo "🚫 8b/9 Test skip policy..."
node scripts/validate/validate-no-skipped-tests.cjs > /dev/null 2>&1 || {
  echo "❌ Test skip policy violations detected!"
  echo ""
  node scripts/validate/validate-no-skipped-tests.cjs
  echo ""
  echo "📖 Policy: docs/TEST_SKIP_POLICY.md"
  echo "💡 Fix the test instead of skipping it"
  exit 1
}
echo "   ✅ Pass"

# Stage 8c/9: Cypress test pattern validation
CYPRESS_FILES_MODIFIED=$(git diff --cached --name-only | grep "cypress/" | wc -l | tr -d ' ')
if [ "$CYPRESS_FILES_MODIFIED" -gt 0 ]; then
  echo "🎭 8c/9 Cypress test patterns..."
  node scripts/validate/validate-cypress-patterns.cjs > /dev/null 2>&1 || {
    echo "❌ Cypress pattern issues detected!"
    echo ""
    node scripts/validate/validate-cypress-patterns.cjs
    echo ""
    exit 1
  }
  echo "   ✅ Pass ($CYPRESS_FILES_MODIFIED Cypress files checked)"
else
  echo "🎭 8c/9 Cypress test patterns..."
  echo "   ⏭️  Skipped (no Cypress files modified)"
fi

# Stage 8a/9: Component regression tests
if [ "$MODIFIED_COMPONENT_COUNT" -gt 0 ]; then
  echo "🔄 8a/9 Component regression tests..."

  REGRESSION_TESTS_RUN=0
  REGRESSION_TESTS_FAILED=0

  # Check each modified component for regression tests
  echo "$MODIFIED_COMPONENTS" | while read comp; do
    if [ -n "$comp" ]; then
      # Check if component has regression tests
      if [ "$comp" = "range-slider" ]; then
        echo "   → Running range-slider regression tests..."
        if npm run test:regression:range-slider > /dev/null 2>&1; then
          echo "   ✅ range-slider: 3 regression tests passed"
        else
          echo "   ❌ range-slider: regression tests failed!"
          exit 1
        fi
        REGRESSION_TESTS_RUN=$((REGRESSION_TESTS_RUN + 1))
      elif [ "$comp" = "in-page-navigation" ]; then
        echo "   → Running in-page-navigation regression tests..."
        if npm run test:regression:in-page-nav > /dev/null 2>&1; then
          echo "   ✅ in-page-navigation: 6 regression tests passed"
        else
          echo "   ❌ in-page-navigation: regression tests failed!"
          exit 1
        fi
        REGRESSION_TESTS_RUN=$((REGRESSION_TESTS_RUN + 1))
      fi
    fi
  done

  if [ "$REGRESSION_TESTS_RUN" -eq 0 ]; then
    echo "   ⏭️  Skipped (modified components have no regression tests)"
  fi
else
  echo "🔄 8a/9 Component regression tests..."
  echo "   ⏭️  Skipped (no components modified)"
fi
