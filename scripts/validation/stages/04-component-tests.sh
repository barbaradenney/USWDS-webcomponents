#!/usr/bin/env bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 4: Component Tests
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Purpose: Validates component-specific functionality
#          Includes:
#          - Component-specific validations (7/9)
#          - Component unit tests (7a/9)
#          - Component Cypress tests (7b/9)
#
# Required environment variables:
#   MODIFIED_COMPONENT_COUNT - Number of modified components
#   MODIFIED_COMPONENTS - List of modified component names
#   SKIP_TESTS - Skip tests for docs-only commits
#
# Performance tracking:
#   Uses start_stage/end_stage if available (provided by orchestrator)
#
# Exit codes:
#   0 - All component tests passed
#   1 - Component test failures detected
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Stage 7/9: Component-specific validations
if [ "$MODIFIED_COMPONENT_COUNT" -gt 0 ]; then
  echo "🎯 7/9 Component-specific validations..."

  # Attribute mapping (component-specific)
  npm run validate:attribute-mapping > /dev/null 2>&1 || {
    echo "❌ Attribute mapping issues! Run: npm run validate:attribute-mapping"
    exit 1
  }

  # Component registration (component-specific)
  npm run validate:registrations > /dev/null 2>&1 || {
    echo "❌ Component registration conflicts! Run: npm run validate:registrations"
    exit 1
  }

  # Slot rendering (component-specific)
  MODIFIED_COMPONENTS="$MODIFIED_COMPONENTS" node scripts/validate/validate-slot-rendering.js > /dev/null 2>&1 || {
    echo "❌ Slot rendering issues! Run: npm run validate:slots"
    exit 1
  }

  # Story styles validation (component-specific)
  MODIFIED_COMPONENTS="$MODIFIED_COMPONENTS" node scripts/validate/validate-story-styles.js > /dev/null 2>&1 || {
    echo "❌ Story inline styles detected! Run: npm run validate:story-styles"
    echo "   Use USWDS utility classes and <usa-alert>/<usa-tag> components"
    exit 1
  }

  # Image link validation (component-specific story files)
  npm run validate:image-links:strict > /dev/null 2>&1 || {
    echo "❌ Broken image links detected! Run: npm run validate:image-links"
    echo "   Ensure all image paths exist in public/img/ or external URLs are valid"
    exit 1
  }

  echo "   ✅ Pass (5 component-specific checks)"
else
  echo "🎯 7/9 Component-specific validations..."
  echo "   ⏭️  Skipped (no components modified)"
fi

# Stage 7a/9: Component unit tests
if [ "$MODIFIED_COMPONENT_COUNT" -gt 0 ] && [ "$SKIP_TESTS" = false ]; then
  echo "🧪 7a/9 Component unit tests..."
  if type start_stage >/dev/null 2>&1; then
    start_stage "unit_tests" "Component unit tests"
  fi

  UNIT_TESTS_RUN=0

  echo "$MODIFIED_COMPONENTS" | while read comp; do
    if [ -n "$comp" ]; then
      TEST_FILE="src/components/$comp/usa-$comp.test.ts"
      if [ -f "$TEST_FILE" ]; then
        echo "   → Testing $comp..."
        if npm test -- "$TEST_FILE" --run > /dev/null 2>&1; then
          echo "   ✅ $comp: unit tests passed"
          UNIT_TESTS_RUN=$((UNIT_TESTS_RUN + 1))
        else
          echo "   ❌ $comp: unit tests failed!"
          echo ""
          npm test -- "$TEST_FILE" --run
          exit 1
        fi
      fi
    fi
  done

  if [ "$UNIT_TESTS_RUN" -eq 0 ]; then
    echo "   ⏭️  Skipped (no unit tests for modified components)"
  fi

  if type end_stage >/dev/null 2>&1; then
    end_stage "unit_tests"
  fi
elif [ "$SKIP_TESTS" = true ]; then
  echo "🧪 7a/9 Component unit tests..."
  echo "   ⏭️  Skipped (docs-only commit)"
else
  echo "🧪 7a/9 Component unit tests..."
  echo "   ⏭️  Skipped (no components modified)"
fi

# Stage 7b/9: Component Cypress tests
if [ "$MODIFIED_COMPONENT_COUNT" -gt 0 ] && [ "$SKIP_TESTS" = false ]; then
  echo "🎭 7b/9 Component Cypress tests..."
  if type start_stage >/dev/null 2>&1; then
    start_stage "cypress" "Cypress tests"
  fi

  # Collect all Cypress test files
  CYPRESS_SPECS=""
  COMPONENT_WITH_TESTS=""

  echo "$MODIFIED_COMPONENTS" | while read comp; do
    if [ -n "$comp" ]; then
      TEST_FILE="src/components/$comp/usa-$comp.component.cy.ts"
      if [ -f "$TEST_FILE" ]; then
        if [ -z "$CYPRESS_SPECS" ]; then
          CYPRESS_SPECS="$TEST_FILE"
          COMPONENT_WITH_TESTS="$comp"
        else
          CYPRESS_SPECS="$CYPRESS_SPECS,$TEST_FILE"
          COMPONENT_WITH_TESTS="$COMPONENT_WITH_TESTS,$comp"
        fi
      fi
    fi
  done

  if [ -n "$CYPRESS_SPECS" ]; then
    COMPONENT_COUNT=$(echo "$CYPRESS_SPECS" | tr ',' '\n' | wc -l | tr -d ' ')

    if [ "$COMPONENT_COUNT" -eq 1 ]; then
      echo "   → Running Cypress tests for $COMPONENT_WITH_TESTS..."
    else
      echo "   → Running Cypress tests for $COMPONENT_COUNT components in parallel..."
    fi

    if npx cypress run --component --spec "$CYPRESS_SPECS" --quiet > /tmp/cypress-all.log 2>&1; then
      echo "   ✅ Pass ($COMPONENT_COUNT component(s) tested)"
    else
      echo "   ❌ Cypress tests failed!"
      echo ""
      echo "   📋 Error log:"
      tail -30 /tmp/cypress-all.log
      echo ""
      echo "   💡 Debug with: npx cypress open --component --spec $CYPRESS_SPECS"
      exit 1
    fi
    rm -f /tmp/cypress-all.log
  else
    echo "   ⏭️  Skipped (modified components have no Cypress tests)"
  fi

  if type end_stage >/dev/null 2>&1; then
    end_stage "cypress"
  fi
elif [ "$SKIP_TESTS" = true ]; then
  echo "🎭 7b/9 Component Cypress tests..."
  echo "   ⏭️  Skipped (docs-only commit)"
else
  echo "🎭 7b/9 Component Cypress tests..."
  echo "   ⏭️  Skipped (no components modified)"
fi
