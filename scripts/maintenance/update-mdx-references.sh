#!/bin/bash

# Update all script references from README.mdx/TESTING.mdx to README.md/TESTING.md
# Since we renamed the files, we need to update all references in scripts

echo "🔄 Updating script references from .mdx to .md..."
echo ""

files=(
  "scripts/validate/compliance-checker.js"
  "scripts/validate/code-quality-review.cjs"
  "scripts/validate/validate-documentation-sync.cjs"
  "scripts/test/manage-testing-docs.js"
  "scripts/ci/generate-pr-comment.js"
  "scripts/utils/generate-pr-comment.js"
  "scripts/utils/convert-mdx-for-storybook.js"
  "scripts/generate/component-generator.js"
  "scripts/maintenance/manage-readmes.js"
)

count=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace README.mdx with README.md
    sed -i '' 's/README\.mdx/README.md/g' "$file"
    # Replace TESTING.mdx with TESTING.md
    sed -i '' 's/TESTING\.mdx/TESTING.md/g' "$file"

    echo "✅ Updated: $file"
    count=$((count + 1))
  fi
done

echo ""
echo "✨ Complete! Updated $count script files"
echo "   • README.mdx → README.md"
echo "   • TESTING.mdx → TESTING.md"
