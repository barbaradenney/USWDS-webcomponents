#!/bin/bash

# Script to fix quoted boolean Lit directives across the codebase
# This prevents the `currentDirective._$initialize is not a function` error

echo "🔧 Fixing quoted boolean Lit directives..."

# Find and fix all quoted boolean directives
# Pattern: ?attribute="${expression}" → ?attribute=${expression}

find src/components -name "*.ts" -type f | while read -r file; do
  # Check if file has the problematic pattern
  if grep -q '\?[a-zA-Z-]*="\${' "$file"; then
    echo "  📝 Fixing: $file"

    # Create backup
    cp "$file" "$file.bak"

    # Fix the pattern: Remove quotes around boolean directive expressions
    # This handles patterns like: ?disabled="${this.disabled}" → ?disabled=${this.disabled}
    sed -i '' 's/\(\?[a-zA-Z-]*\)="\(\${[^}]*}\)"/\1=\2/g' "$file"

    # Count changes
    CHANGES=$(diff "$file.bak" "$file" | grep "^<" | wc -l)

    if [ "$CHANGES" -gt 0 ]; then
      echo "    ✅ Fixed $CHANGES quoted boolean directive(s)"
      rm "$file.bak"
    else
      echo "    ⚠️  No changes needed"
      rm "$file.bak"
    fi
  fi
done

echo ""
echo "🎯 Running validation to verify fixes..."
npm test -- --testNamePattern="Lit Template Validation.*should not have quoted boolean" --reporter=verbose 2>/dev/null | grep -E "(✓|×|PASS|FAIL)" | tail -5

echo ""
echo "✨ Directive fixes complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run: npm test -- lit-template-validation"
echo "  2. Run: npm run typecheck"
echo "  3. Run: npm run lint"
echo "  4. Restart Storybook to verify no runtime errors"