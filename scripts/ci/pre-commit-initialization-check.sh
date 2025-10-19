#!/bin/bash

# Pre-commit hook to prevent duplicate initialization issues
# This runs automatically before commits to catch problems early

echo "🔍 Checking for duplicate initialization patterns..."

# Check for USWDS initialization without guards
echo "  📋 Scanning for unguarded USWDS initialization..."

unguarded_found=false

# Find files with USWDS initialization patterns
files_with_uswds=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ts$' | xargs grep -l '\.on(this)' 2>/dev/null || true)

for file in $files_with_uswds; do
  if [ -f "$file" ]; then
    echo "    🔍 Checking: $file"

    # Check if file has USWDS initialization without proper guard
    if grep -q '\.on(this)' "$file"; then
      # Look for guard patterns in the same method
      if ! grep -B 10 -A 2 '\.on(this)' "$file" | grep -q 'if.*\(initialized\|usingUSWDSEnhancement\)'; then
        echo "    ❌ FOUND: Unguarded USWDS initialization in $file"
        echo "       Add initialization guard: if (this.initialized) { return; }"
        unguarded_found=true
      fi
    fi
  fi
done

# Check for missing cleanup flag resets
echo "  📋 Scanning for missing cleanup flag resets..."

missing_cleanup=false

for file in $files_with_uswds; do
  if [ -f "$file" ]; then
    # If file has initialization flag and cleanup method, check for reset
    if grep -q 'initialized\|usingUSWDSEnhancement' "$file" && grep -q 'disconnectedCallback\|cleanup.*USWDS' "$file"; then
      if ! grep -A 20 'disconnectedCallback\|cleanup.*USWDS' "$file" | grep -q '\(initialized\|usingUSWDSEnhancement\).*=.*false'; then
        echo "    ❌ FOUND: Missing flag reset in cleanup in $file"
        echo "       Add to cleanup: this.initialized = false;"
        missing_cleanup=true
      fi
    fi
  fi
done

# Check for new components without initialization patterns
echo "  📋 Scanning for new components with missing initialization patterns..."

new_components=$(git diff --cached --name-only --diff-filter=A | grep 'src/components/.*\.ts$' | grep -v '\.test\.ts$' | grep -v '\.stories\.ts$')

for file in $new_components; do
  if [ -f "$file" ]; then
    if grep -q 'USWDS\|uswds' "$file" && grep -q 'customElement' "$file"; then
      echo "    🔍 New component: $file"

      # Check if it follows the initialization pattern
      if grep -q '\.on(this)' "$file" && ! grep -q 'initialized\|usingUSWDSEnhancement' "$file"; then
        echo "    ❌ FOUND: New component missing initialization flag in $file"
        echo "       Add property: @state() private initialized = false;"
        missing_cleanup=true
      fi
    fi
  fi
done

# Summary and exit code
echo ""
if [ "$unguarded_found" = true ] || [ "$missing_cleanup" = true ]; then
  echo "❌ COMMIT BLOCKED: Duplicate initialization issues found!"
  echo ""
  echo "🔧 Quick fixes:"
  echo "  1. Add initialization guards: if (this.initialized) { return; }"
  echo "  2. Add cleanup resets: this.initialized = false;"
  echo "  3. Run: npm run lint:fix to auto-fix some issues"
  echo ""
  echo "📚 See: docs/PREVENTING_DUPLICATE_INITIALIZATION.md"
  exit 1
else
  echo "✅ No duplicate initialization issues found!"
  exit 0
fi