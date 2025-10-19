#!/bin/bash

# Script to add proper TypeScript property declarations for initialization flags

echo "🔧 Adding TypeScript property declarations for initialization flags..."

# Components that need the initialized flag declaration
components=(
  "language-selector"
  "pagination"
  "skip-link"
  "tooltip"
  "accordion"
  "search"
  "table"
  "combo-box"
  "select"
  "header"
  "step-indicator"
)

for component in "${components[@]}"; do
  component_file="src/components/${component}/usa-${component}.ts"

  if [ -f "$component_file" ]; then
    echo "  📝 Checking: $component_file"

    # Check if file needs the initialized property and doesn't already have it
    if grep -q "this\.initialized" "$component_file" && ! grep -q "@state.*initialized" "$component_file" && ! grep -q "@property.*initialized" "$component_file"; then

      echo "    🎯 Adding initialized property declaration"

      # Create backup
      cp "$component_file" "$component_file.bak"

      # Find the last @state or @property declaration line
      last_prop_line=$(grep -n "@state\|@property" "$component_file" | tail -1 | cut -d: -f1)

      if [ ! -z "$last_prop_line" ]; then
        # Add the initialized property after the last property
        sed -i '' "${last_prop_line}a\\
\\  @state()\\
\\  private initialized = false;\\
" "$component_file"

        echo "    ✅ Added initialized property for $component"
      else
        echo "    ⚠️  No property declarations found in $component"
      fi

      # Clean up backup if no changes were made
      if cmp -s "$component_file" "$component_file.bak"; then
        rm "$component_file.bak"
      else
        rm "$component_file.bak"
      fi
    else
      echo "    ✅ $component already has initialized property or doesn't need it"
    fi
  else
    echo "    ❌ File not found: $component_file"
  fi
done

echo ""
echo "✨ Property declarations complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run: npm run typecheck"
echo "  2. Run: npm run lint"