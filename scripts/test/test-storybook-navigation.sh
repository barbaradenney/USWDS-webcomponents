#!/bin/bash

# Storybook Navigation Test Runner
# Tests that components work correctly after navigating between stories

set -e

echo "🧪 Storybook Navigation Test Suite"
echo "=================================="
echo ""

# Check if Storybook is running
echo "📋 Checking if Storybook is running..."
if ! curl -s http://localhost:6006 > /dev/null 2>&1; then
  echo "❌ Storybook is not running on port 6006"
  echo "   Please start Storybook first: npm run storybook"
  exit 1
fi

echo "✅ Storybook is running"
echo ""

# Run Cypress tests
echo "🚀 Running Cypress navigation tests..."
echo ""

npx cypress run --spec "cypress/e2e/storybook-navigation-test.cy.ts" --browser chrome --headless

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ All navigation tests passed!"
  echo ""
  echo "📊 Summary: All components work correctly after navigation"
  echo "   No refactoring needed at this time."
else
  echo ""
  echo "❌ Some navigation tests failed"
  echo ""
  echo "📊 Summary: Check Cypress output above for failing components"
  echo "   Components that fail need vanilla JS refactoring."
  echo ""
  echo "   See docs/JAVASCRIPT_INTEGRATION_STRATEGY.md for refactoring process"
fi
