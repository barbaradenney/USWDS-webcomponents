#!/bin/bash

# Rename TESTING.mdx to TESTING.md and remove Meta tags
# Since these files won't be included in Storybook, they should be .md files

echo "🔄 Renaming TESTING.mdx files to TESTING.md..."
echo ""

count=0
find src/components -name "TESTING.mdx" -type f | while read file; do
  newfile="${file%.mdx}.md"

  # Read the file, remove the first 3 lines (import and Meta tag), and write to new file
  tail -n +4 "$file" > "$newfile"

  # Remove the old file
  rm "$file"

  count=$((count + 1))
  echo "✅ Renamed: $(basename $(dirname $file))/TESTING.mdx → TESTING.md"
done

echo ""
echo "✨ Complete! Renamed all TESTING.mdx files to TESTING.md"
echo "   (Removed unused Meta tags and Storybook imports)"
