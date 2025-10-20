#!/usr/bin/env bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 7: Optional Validations (Opt-in)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Purpose: Optional validation checks that can be enabled per-commit
#          Includes:
#          - Cypress component tests (CYPRESS_PRECOMMIT=1)
#          - Bundle size validation (BUNDLE_SIZE_PRECOMMIT=1)
#          - Smoke tests (SMOKE_TESTS_PRECOMMIT=1)
#
# Usage:
#   CYPRESS_PRECOMMIT=1 git commit
#   BUNDLE_SIZE_PRECOMMIT=1 git commit
#   SMOKE_TESTS_PRECOMMIT=1 git commit
#
# Exit codes:
#   0 - Optional validations passed or skipped
#   1 - Optional validation failures detected
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Optional: Cypress component tests
if [ "$CYPRESS_PRECOMMIT" = "1" ]; then
  echo ""
  echo "🧪 12/13 Cypress component tests (opt-in)..."
  npm run cypress:component > /dev/null 2>&1 || {
    echo "❌ Cypress component tests failed!"
    echo "   Run: npm run cypress:component:open (to debug)"
    echo ""
    exit 1
  }
  echo "   ✅ Pass"
fi

# Optional: Bundle size check
if [ "$BUNDLE_SIZE_PRECOMMIT" = "1" ]; then
  echo ""
  echo "📦 13/14 Bundle size validation (opt-in)..."

  # Check if dist directory exists
  if [ ! -d "dist" ]; then
    echo "⚠️  No dist/ directory found - building first..."
    NODE_ENV=production npm run build > /dev/null 2>&1 || {
      echo "❌ Build failed! Cannot validate bundle size."
      exit 1
    }
  fi

  npm run validate:bundle-size > /dev/null 2>&1 || {
    echo "❌ Bundle size validation failed!"
    echo ""
    npm run validate:bundle-size
    echo ""
    echo "💡 Actions to take:"
    echo "   • Review bundle composition: npm run build:analyze:visual"
    echo "   • Check for large dependencies or unused imports"
    echo "   • See docs/BUNDLE_SIZE_OPTIMIZATION_GUIDE.md"
    echo ""
    exit 1
  }
  echo "   ✅ Pass"
fi

# Optional: Smoke tests
if [ "$SMOKE_TESTS_PRECOMMIT" = "1" ]; then
  echo ""
  echo "🔥 14/14 Smoke tests - critical interaction validation (opt-in)..."
  echo "   → Testing: accordion, combo-box, date-picker, modal, time-picker, character-count, file-input, search"

  # Check if Storybook is already running
  if ! curl -s http://localhost:6006 > /dev/null 2>&1; then
    echo "   ⚠️  Storybook not running - starting server..."
    echo "   💡 Tip: Run 'npm run storybook' in another terminal to speed up future commits"

    # Start Storybook in background
    npm run storybook > /dev/null 2>&1 &
    STORYBOOK_PID=$!

    # Wait for Storybook to be ready (max 60 seconds)
    WAIT_TIME=0
    while ! curl -s http://localhost:6006 > /dev/null 2>&1; do
      sleep 2
      WAIT_TIME=$((WAIT_TIME + 2))
      if [ $WAIT_TIME -ge 60 ]; then
        echo "   ❌ Storybook failed to start within 60 seconds"
        kill $STORYBOOK_PID 2>/dev/null
        exit 1
      fi
    done
    echo "   ✅ Storybook ready"

    # Run smoke tests
    npm run cypress:smoke > /dev/null 2>&1
    SMOKE_EXIT_CODE=$?

    # Kill Storybook after tests
    kill $STORYBOOK_PID 2>/dev/null

    if [ $SMOKE_EXIT_CODE -ne 0 ]; then
      echo "   ❌ Smoke tests failed!"
      echo ""
      echo "   💡 Debug with: npm run cypress:smoke:headed"
      echo "   📖 See: docs/POST_MORTEM_TIME_PICKER_DROPDOWN_ISSUE.md"
      exit 1
    fi
  else
    # Storybook already running - just run tests
    npm run cypress:smoke > /dev/null 2>&1 || {
      echo "   ❌ Smoke tests failed!"
      echo ""
      echo "   💡 Debug with: npm run cypress:smoke:headed"
      echo "   📖 See: docs/POST_MORTEM_TIME_PICKER_DROPDOWN_ISSUE.md"
      exit 1
    }
  fi

  echo "   ✅ Pass (8 interactive components tested)"
fi
