#!/bin/bash

# Script to clean up duplicate @state() decorators

echo "🔧 Cleaning up duplicate @state() decorators..."

find src/components -name "*.ts" -type f | while read -r file; do
  if grep -q "@state().*@state()" "$file"; then
    echo "  📝 Fixing: $file"

    # Remove duplicate @state() decorators
    sed -i '' 's/@state().*@state()/@state()/g' "$file"

    echo "    ✅ Fixed duplicate decorators"
  fi
done

echo ""
echo "✨ Cleanup complete!"