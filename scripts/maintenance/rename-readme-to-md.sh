#!/bin/bash

# Rename README.mdx to README.md and remove YAML front matter
# Since these files won't be included in Storybook, they should be .md files

echo "🔄 Renaming README.mdx files to README.md..."
echo ""

count=0
find src/components -name "README.mdx" -type f | while read file; do
  newfile="${file%.mdx}.md"

  # Read the file, remove the first 6 lines (YAML front matter), and write to new file
  tail -n +7 "$file" > "$newfile"

  # Remove the old file
  rm "$file"

  count=$((count + 1))
  echo "✅ Renamed: $(basename $(dirname $file))/README.mdx → README.md"
done

echo ""
echo "✨ Complete! Renamed all README.mdx files to README.md"
echo "   (Removed unused YAML front matter)"
