#!/bin/bash

# Run DOM Structure Validation Tests
# This script runs all DOM validation tests to catch visual/structural issues

set -e

echo "🔍 Running DOM Structure Validation Tests..."
echo ""

# Run all DOM validation tests
npm test -- dom-validation --run

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ All DOM validation tests passed!"
  exit 0
else
  echo ""
  echo "❌ DOM validation tests failed!"
  echo ""
  echo "These tests catch visual/structural issues like:"
  echo "  - Combo-box rendering as plain text input"
  echo "  - Modal force-action showing close button"
  echo "  - Missing USWDS elements"
  echo "  - Incorrect CSS classes"
  echo ""
  echo "Fix the failing tests before committing."
  exit 1
fi