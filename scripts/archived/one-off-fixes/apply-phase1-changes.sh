#!/bin/bash

# Apply all Phase 1 changes to complete monorepo optimization
# This script makes all necessary changes that were defined in Phase 1

set -e

echo "🔄 Applying Phase 1 monorepo optimization changes..."
echo ""

# 1. Add packageManager field to root package.json
echo "📝 Adding packageManager field to root package.json..."
if ! grep -q '"packageManager"' package.json; then
  # Use jq to add packageManager field after engines
  tmp=$(mktemp)
  jq '. + {"packageManager": "pnpm@10.15.0"}' package.json > "$tmp" && mv "$tmp" package.json
  echo "✓ Added packageManager field"
else
  echo "  Already exists"
fi

# 2. Add monorepo management scripts
echo "📝 Adding monorepo management scripts to package.json..."
tmp=$(mktemp)
jq '.scripts += {
  "monorepo:validate": "node scripts/validate/validate-monorepo.js",
  "monorepo:check": "manypkg check",
  "monorepo:fix": "manypkg fix",
  "deps:check": "syncpack list-mismatches",
  "deps:fix": "syncpack fix-mismatches",
  "deps:list": "syncpack list",
  "deps:format": "syncpack format"
}' package.json > "$tmp" && mv "$tmp" package.json
echo "✓ Added monorepo scripts"

# 3. Update build scripts to use turbo
echo "📝 Updating build scripts to use turbo..."
sed -i '' 's/"build": "pnpm -r build"/"build": "turbo run build"/g' package.json
echo "✓ Updated build scripts"

# 4. Add syncpack and manypkg dependencies
echo "📝 Adding syncpack and manypkg to devDependencies..."
if command -v jq &> /dev/null; then
  tmp=$(mktemp)
  jq '.devDependencies += {
    "syncpack": "^13.0.4",
    "@manypkg/cli": "^0.25.1"
  }' package.json > "$tmp" && mv "$tmp" package.json
  echo "✓ Added dependencies"
else
  echo "⚠️  jq not found, skipping dependency addition (will be added by pnpm install)"
fi

# 5. Fix peer dependencies in all packages
echo ""
echo "📝 Fixing peer dependencies in all packages..."
for pkg in packages/*/package.json; do
  if [ -f "$pkg" ]; then
    sed -i '' \
      -e 's/"lit": "exact"/"lit": "^3.0.0"/g' \
      -e 's/"vitest": "exact"/"vitest": "^3.0.0"/g' \
      -e 's/"@vitest\/expect": "exact"/"@vitest\/expect": "^3.0.0"/g' \
      "$pkg"
    basename $(dirname "$pkg")
  fi
done
echo "✓ Fixed peer dependencies in all packages"

# 6. Migrate workflows to pnpm
echo ""
echo "📝 Migrating GitHub Actions workflows to pnpm..."

for workflow in .github/workflows/*.yml; do
  if [ -f "$workflow" ]; then
    # Add pnpm setup before Node.js setup
    awk '
    /- name: Setup Node.js/ {
      if (prev !~ /Setup pnpm/ && prev2 !~ /Setup pnpm/ && prev3 !~ /Setup pnpm/) {
        print "      - name: Setup pnpm"
        print "        uses: pnpm/action-setup@v4"
        print "        with:"
        print "          version: 10"
        print ""
      }
    }
    {print}
    {prev3 = prev2; prev2 = prev; prev = $0}
    ' "$workflow" > "$workflow.tmp" && mv "$workflow.tmp" "$workflow"

    # Update npm commands to pnpm
    sed -i '' \
      -e "s/cache: 'npm'/cache: 'pnpm'/g" \
      -e "s/cache: \"npm\"/cache: 'pnpm'/g" \
      -e 's/npm ci/pnpm install --frozen-lockfile/g' \
      -e 's/npm install/pnpm install/g' \
      -e 's/npm run /pnpm run /g' \
      -e 's/npm test/pnpm test/g' \
      -e 's/npm audit/pnpm audit/g' \
      -e 's/npm outdated/pnpm outdated/g' \
      -e 's/npm pack /pnpm pack /g' \
      -e 's/npm publish/pnpm publish/g' \
      -e 's/npm version /pnpm version /g' \
      -e 's/npm info /pnpm view /g' \
      -e 's/npm list /pnpm list /g' \
      -e 's/npm view /pnpm view /g' \
      -e 's/npm update /pnpm update /g' \
      -e 's/ppnpm/pnpm/g' \
      "$workflow"
  fi
done

echo "✓ Migrated all workflows to pnpm"

# 7. Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile 2>&1 | tail -10

echo ""
echo "✅ Phase 1 changes applied successfully!"
echo ""
echo "📋 Summary:"
echo "  - Added packageManager field"
echo "  - Added monorepo management scripts"
echo "  - Updated build scripts to use turbo"
echo "  - Fixed peer dependencies in all packages"
echo "  - Migrated all workflows to pnpm"
echo "  - Installed dependencies"
echo ""
echo "🔍 Validating changes..."
node scripts/validate/validate-monorepo.js
