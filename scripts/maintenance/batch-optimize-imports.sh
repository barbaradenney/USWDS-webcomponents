#!/bin/bash

# Batch optimize USWDS imports for better tree-shaking

echo "🌲 Optimizing USWDS imports for better tree-shaking..."

# Define component mappings
declare -A components=(
  ["language-selector"]="usa-language-selector"
  ["pagination"]="usa-pagination"
  ["search"]="usa-search"
  ["select"]="usa-select"
  ["step-indicator"]="usa-step-indicator"
)

for component in "${!components[@]}"; do
  file="src/components/${component}/usa-${component}.ts"
  module="${components[$component]}"

  if [ -f "$file" ]; then
    echo "Optimizing $component..."

    # Create a backup
    cp "$file" "${file}.backup"

    # Use sed to replace the import pattern
    sed -i '' \
      -e '/Tree-shaking: Import only the specific USWDS component module/{
        n
        s/const module = await import('\''@uswds\/uswds'\'');/let module;\
      try {\
        module = await import('\''@uswds\/uswds\/packages\/'${module}'\/src\/index.js'\'');\
        console.log(`🌲 '${component}': Using optimized tree-shaking import`);\
      } catch (specificError) {\
        console.log(`📦 '${component}': Specific module not available, falling back to full bundle`);\
        module = await import('\''@uswds\/uswds'\'');\
      }/
      }' "$file"

    # Check if changes were made
    if ! cmp -s "$file" "${file}.backup"; then
      echo "✅ Optimized $component"
      rm "${file}.backup"
    else
      echo "⚪ No changes needed for $component"
      mv "${file}.backup" "$file"
    fi
  else
    echo "❌ File not found: $file"
  fi
done

echo "🎯 Import optimization complete!"