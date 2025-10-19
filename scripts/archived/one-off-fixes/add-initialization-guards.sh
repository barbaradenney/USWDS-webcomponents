#!/bin/bash

# Script to add initialization guards to all USWDS components
# This prevents duplicate JavaScript initialization issues

echo "🔧 Adding initialization guards to USWDS components..."

# Components that have USWDS initialization patterns
components=(
  "language-selector"
  "pagination"
  "skip-link"
  "tooltip"
  "collection"
  "radio"
  "accordion"
  "checkbox"
  "search"
  "button"
  "table"
  "combo-box"
  "select"
  "header"
  "step-indicator"
  "banner"
)

for component in "${components[@]}"; do
  component_file="src/components/${component}/usa-${component}.ts"

  if [ -f "$component_file" ]; then
    echo "  📝 Checking: $component_file"

    # Check if the file has USWDS initialization but no guard
    if grep -q "\.on(this)" "$component_file" && ! grep -q "Already initialized" "$component_file"; then

      # Create backup
      cp "$component_file" "$component_file.bak"

      # Find the USWDS initialization method
      init_method=$(grep -n "private.*initializeUSWDS" "$component_file" | head -1 | cut -d: -f1)

      if [ ! -z "$init_method" ]; then
        # Look for a flag that indicates initialization status
        flag_name=""
        if grep -q "usingUSWDSEnhancement" "$component_file"; then
          flag_name="usingUSWDSEnhancement"
        elif grep -q "usingUSWDS" "$component_file"; then
          flag_name="usingUSWDS"
        elif grep -q "isInitialized" "$component_file"; then
          flag_name="isInitialized"
        elif grep -q "initialized" "$component_file"; then
          flag_name="initialized"
        fi

        if [ ! -z "$flag_name" ]; then
          echo "    🎯 Adding guard using flag: $flag_name"

          # Add initialization guard after the method declaration
          sed -i '' "${init_method}a\\
\\    // Prevent multiple initializations\\
\\    if (this.$flag_name) {\\
\\      console.log(\`⚠️ $component: Already initialized, skipping duplicate initialization\`);\\
\\      return;\\
\\    }\\
" "$component_file"

          # Find cleanup method and add flag reset
          cleanup_method=$(grep -n "private.*cleanup.*USWDS\|disconnectedCallback" "$component_file" | head -1 | cut -d: -f1)
          if [ ! -z "$cleanup_method" ]; then
            # Add flag reset in cleanup if not already present
            if ! grep -q "this.$flag_name = false" "$component_file"; then
              echo "    🧹 Adding flag reset in cleanup"
              sed -i '' "${cleanup_method}a\\
\\    // Reset enhancement flag to allow reinitialization\\
\\    this.$flag_name = false;\\
" "$component_file"
            fi
          fi

          echo "    ✅ Added initialization guard for $component"
        else
          echo "    ⚠️  No suitable flag found for $component"
        fi
      else
        echo "    ⚠️  No initialization method found for $component"
      fi

      # Clean up backup if no changes were made
      if cmp -s "$component_file" "$component_file.bak"; then
        rm "$component_file.bak"
        echo "    📄 No changes needed for $component"
      else
        rm "$component_file.bak"
      fi
    else
      echo "    ✅ $component already has guard or no USWDS initialization"
    fi
  else
    echo "    ❌ File not found: $component_file"
  fi
done

echo ""
echo "✨ Initialization guard additions complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run: npm run typecheck"
echo "  2. Run: npm run lint"
echo "  3. Test components in Storybook"