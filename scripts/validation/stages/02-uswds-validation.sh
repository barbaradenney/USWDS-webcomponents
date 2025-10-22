#!/usr/bin/env bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 2-4: USWDS Validation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Purpose: Validates USWDS integration and compliance
#          Includes:
#          - USWDS script tag presence (2/9)
#          - Layout forcing pattern (2a/9)
#          - Component issue detection (3/9)
#          - USWDS compliance (4/9)
#          - Custom USWDS class validation (4a/9)
#          - Custom CSS validation (4b/9)
#          - Icon name validation (4c/9)
#
# Required environment variables:
#   MODIFIED_COMPONENT_COUNT - Number of modified components
#   MODIFIED_COMPONENTS - List of modified component names
#
# Exit codes:
#   0 - All USWDS validations passed
#   1 - USWDS validation failures detected
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Stage 2/9: USWDS script tag presence
echo "🏗️  2/9 USWDS script tag presence..."
bash scripts/validate/validate-uswds-script-tag.sh > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ USWDS script tag validation failed!"
  echo "See docs/DEBUGGING_GUIDE.md - 'USWDS Script Tag Loading Issue'"
  exit 1
fi
echo "   ✅ Pass"

# Stage 2a/9: Layout forcing pattern
echo "🎨 2a/9 Layout forcing pattern..."
npm run validate:layout-forcing > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Layout forcing pattern validation failed!"
  echo "CRITICAL: This fixes zero BoundingClientRect after Storybook navigation"
  echo "See docs/STORYBOOK_LAYOUT_FORCING_PATTERN.md"
  echo "Run: npm run validate:layout-forcing (for details)"
  exit 1
fi
echo "   ✅ Pass"

# Stage 3/9: Component issue detection
echo "🤖 3/9 Component issue detection..."
if [ "$MODIFIED_COMPONENT_COUNT" -gt 0 ]; then
  # Component-specific detection
  if node scripts/validate/auto-detect-component-issues.js --quiet --components="$(echo $MODIFIED_COMPONENTS | tr '\n' ',')" > /dev/null 2>&1; then
    echo "   ✅ Pass (checked $MODIFIED_COMPONENT_COUNT components)"
  else
    echo "⚠️  Component issues detected - run 'npm run detect:issues' for details"
  fi
else
  # Global detection for core changes
  if node scripts/validate/auto-detect-component-issues.js --quiet > /dev/null 2>&1; then
    echo "   ✅ Pass"
  else
    echo "⚠️  Component issues detected - run 'npm run detect:issues' for details"
  fi
fi

# Stage 4/9: USWDS compliance
echo "🛡️  4/9 USWDS compliance..."
npm run validate:uswds-compliance > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ USWDS compliance failed! Run: npm run validate:uswds-compliance"
  exit 1
fi
echo "   ✅ Pass"

# Auto-clear discovered issues tracker if all validations passed
if [ -f ".git/DISCOVERED_ISSUES.json" ]; then
  echo "   🗑️  All validations passed - clearing discovered issues tracker"
  rm .git/DISCOVERED_ISSUES.json
fi

# Stage 4a/9: Custom USWDS class validation
echo "🎨 4a/9 Custom USWDS class validation..."
if [ "$MODIFIED_COMPONENT_COUNT" -gt 0 ]; then
  node scripts/validate/validate-no-custom-uswds-classes.js > /dev/null 2>&1
  VALIDATION_EXIT_CODE=$?
  if [ $VALIDATION_EXIT_CODE -ne 0 ]; then
    echo "❌ Custom USWDS classes detected!"
    echo ""
    # Run again without redirection to show detailed output
    node scripts/validate/validate-no-custom-uswds-classes.js
    exit 1
  fi
  echo "   ✅ Pass (checked $MODIFIED_COMPONENT_COUNT components)"
else
  echo "   ⏭️  Skipped (no components modified)"
fi

# Stage 4b/9: Custom CSS validation
echo "🎨 4b/9 Custom CSS validation..."
if [ "$MODIFIED_COMPONENT_COUNT" -gt 0 ]; then
  node scripts/validate/validate-no-custom-css.js > /dev/null 2>&1
  VALIDATION_EXIT_CODE=$?
  if [ $VALIDATION_EXIT_CODE -ne 0 ]; then
    echo "❌ Custom CSS detected!"
    echo ""
    # Run again without redirection to show detailed output
    node scripts/validate/validate-no-custom-css.js
    exit 1
  fi
  echo "   ✅ Pass (checked $MODIFIED_COMPONENT_COUNT components)"
else
  echo "   ⏭️  Skipped (no components modified)"
fi

# Stage 4c/9: Icon name validation
echo "🎨 4c/9 Icon name validation..."
node scripts/validate/validate-icon-names.cjs > /dev/null 2>&1
VALIDATION_EXIT_CODE=$?
if [ $VALIDATION_EXIT_CODE -ne 0 ]; then
  echo "❌ Invalid icon names detected!"
  echo ""
  # Run again without redirection to show detailed output
  node scripts/validate/validate-icon-names.cjs
  exit 1
fi
echo "   ✅ Pass"
