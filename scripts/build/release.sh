#!/bin/bash
# Atomic release script - prevents version sync issues
# Usage: ./scripts/release.sh [patch|minor|major]

set -e  # Exit on any error

VERSION_TYPE=${1:-patch}
CURRENT_BRANCH=$(git branch --show-current)

echo "🚀 Starting atomic release process..."
echo "   Version type: $VERSION_TYPE"
echo "   Current branch: $CURRENT_BRANCH"

# 1. Ensure we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ Error: Must be on main branch for releases"
  exit 1
fi

# 2. Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Error: Working directory must be clean"
  exit 1
fi

# 3. Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# 4. Bump version in all packages
echo "⬆️  Bumping version ($VERSION_TYPE)..."
pnpm changeset version || {
  echo "⚠️  Changeset failed, using manual version bump..."
  # Fallback to manual bump if changeset fails
  NEW_VERSION=$(node -p "require('./package.json').version.split('.').map((n,i)=>i==={patch:2,minor:1,major:0}['$VERSION_TYPE']?+n+1:i>['major','minor','patch'].indexOf('$VERSION_TYPE')?0:n).join('.')")

  for pkg in uswds-wc-actions uswds-wc-data-display uswds-wc-feedback uswds-wc-forms uswds-wc-layout uswds-wc-navigation uswds-wc-structure uswds-wc-core uswds-wc; do
    sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "packages/$pkg/package.json"
  done
}

# Get the new version
NEW_VERSION=$(node -p "require('./packages/uswds-wc-core/package.json').version")
echo "📦 New version: $NEW_VERSION"

# 5. Build all packages
echo "🔨 Building packages..."
pnpm turbo build

# 6. Run tests
echo "🧪 Running tests..."
pnpm test || {
  echo "❌ Tests failed! Aborting release."
  exit 1
}

# 7. Commit version bump
echo "💾 Committing version bump..."
git add -A
git commit --no-verify -m "chore(release): bump version to $NEW_VERSION"

# 8. Create git tag
echo "🏷️  Creating git tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# 9. Publish to npm
echo "📤 Publishing to npm..."
pnpm -r publish --access public --no-git-checks || {
  echo "❌ npm publish failed! Reverting..."
  git tag -d "v$NEW_VERSION"
  git reset --hard HEAD~1
  exit 1
}

# 10. Push to GitHub (only after npm publish succeeds)
echo "⬆️  Pushing to GitHub..."
git push origin main --no-verify
git push origin "v$NEW_VERSION" --no-verify

# 11. Create GitHub release
echo "🎉 Creating GitHub release..."
gh release create "v$NEW_VERSION" \
  --title "v$NEW_VERSION" \
  --notes-file CHANGELOG.md \
  --latest

# 12. Merge to develop
echo "🔄 Merging to develop..."
git checkout develop
git pull origin develop
git merge main --no-ff -m "Merge v$NEW_VERSION release from main" --no-verify
git push origin develop --no-verify
git checkout main

echo "✅ Release v$NEW_VERSION completed successfully!"
echo "   - npm: https://www.npmjs.com/org/uswds-wc"
echo "   - GitHub: https://github.com/barbaradenney/uswds-wc/releases/tag/v$NEW_VERSION"
