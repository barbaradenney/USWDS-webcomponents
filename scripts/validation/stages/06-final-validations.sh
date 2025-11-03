#!/usr/bin/env bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stage 6: Final Validations
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Purpose: Final USWDS and documentation validations
#          Includes:
#          - USWDS transformation validation (9/10)
#          - Component JavaScript integration (10/11)
#          - Documentation synchronization (11/11)
#          - Documentation hygiene (11a/11)
#          - Documentation placeholders (11b/11)
#          - Storybook MDX validation (11c/11)
#
# Exit codes:
#   0 - All final validations passed
#   1 - Final validation failures detected
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Stage 9/10: USWDS transformation validation
echo "🏛️  9/10 USWDS transformation validation..."
.husky/pre-commit-uswds > /dev/null 2>&1 || {
  echo "❌ USWDS validation failed! See .husky/pre-commit-uswds"
  exit 1
}
echo "   ✅ Pass"

# Stage 10/11: Component JavaScript integration
echo "🔧 10/11 Component JavaScript integration..."
node scripts/validate/validate-component-javascript.js > /dev/null 2>&1 || {
  echo "❌ JavaScript integration failed! Run: npm run validate:component-javascript"
  echo "   This validates USWDS.componentName.on(this) is called properly"
  exit 1
}
echo "   ✅ Pass"

# Stage 11/11: Documentation synchronization
echo "📚 11/11 Documentation synchronization..."
node scripts/validate/validate-documentation-sync.cjs || {
  echo ""
  echo "❌ Documentation validation issues detected!"
  echo "   Review warnings and errors above"
  exit 1
}
echo "   ✅ Pass"

# Stage 11a/11: Documentation hygiene
echo "🧹 11a/11 Documentation hygiene..."
node scripts/validate/validate-documentation-hygiene.cjs || {
  echo ""
  echo "❌ Documentation policy violations detected!"
  echo "   Review errors above and categorize new documentation"
  exit 1
}

# Stage 11b/11: Documentation placeholders
echo "📝 11b/11 Documentation placeholders..."
node scripts/validate/validate-documentation-placeholders.cjs > /dev/null 2>&1 || {
  echo ""
  node scripts/validate/validate-documentation-placeholders.cjs
  echo ""
  exit 1
}
echo "   ✅ Pass"

# Stage 11c/11: Storybook MDX validation
echo "📖 11c/11 Storybook MDX files..."
node scripts/validate/validate-storybook-mdx.js > /dev/null 2>&1 || {
  echo ""
  echo "❌ Storybook MDX validation failed!"
  node scripts/validate/validate-storybook-mdx.js
  echo "   Run: npm run docs:validate:mdx for details"
  exit 1
}
echo "   ✅ Pass"
