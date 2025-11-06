# Release Process

**Purpose**: Prevent GitHub releases and npm packages from getting out of sync

## Problem

Previously, we had issues where:
- GitHub releases were created before npm publish
- Documentation was added after releases
- Versions got out of sync between GitHub tags and npm packages

## Solution: Atomic Release Process

Use the automated release script that performs all steps in the correct order.

## Quick Start

```bash
# Patch release (2.1.1 → 2.1.2)
pnpm run release

# Minor release (2.1.1 → 2.2.0)
pnpm run release:minor

# Major release (2.1.1 → 3.0.0)
pnpm run release:major
```

## What the Script Does

The atomic release script (`scripts/release.sh`) performs these steps **in order**:

1. ✅ **Verify prerequisites**
   - Must be on `main` branch
   - Working directory must be clean
   - Pulls latest changes

2. ⬆️ **Bump version**
   - Updates all package.json files
   - Updates CHANGELOG.md
   - Commits version bump

3. 🔨 **Build packages**
   - Runs `pnpm turbo build`
   - Ensures all packages are built

4. 🧪 **Run tests**
   - Runs full test suite
   - **Aborts release if tests fail**

5. 🏷️ **Create git tag**
   - Creates annotated tag
   - Includes release notes

6. 📤 **Publish to npm**
   - Publishes all packages to npm
   - **Reverts git tag if publish fails**

7. ⬆️ **Push to GitHub**
   - Pushes main branch
   - Pushes git tag
   - **Only happens AFTER npm publish succeeds**

8. 🎉 **Create GitHub release**
   - Uses `gh` CLI
   - Includes changelog
   - Marks as latest

9. 🔄 **Merge to develop**
   - Keeps develop in sync
   - Pushes automatically

## Why This Works

**Atomic Order**: The script enforces the correct order:
```
Version Bump → Build → Test → Tag → npm → GitHub → Develop
```

**Rollback on Failure**: If npm publish fails, the git tag is deleted and commit is reverted.

**Single Source of Truth**: The version in package.json drives everything.

## Manual Release (Not Recommended)

If you must release manually, follow this **exact order**:

```bash
# 1. Bump versions
for pkg in packages/uswds-wc-*/package.json; do
  # Update version in each package.json
done

# 2. Update CHANGELOG.md

# 3. Commit
git add -A
git commit -m "chore(release): bump version to X.Y.Z"

# 4. Create tag
git tag -a vX.Y.Z -m "Release vX.Y.Z"

# 5. Build
pnpm turbo build

# 6. Test
pnpm test

# 7. Publish to npm (MUST happen before GitHub push)
pnpm -r publish --access public --no-git-checks

# 8. Push to GitHub (ONLY after npm succeeds)
git push origin main
git push origin vX.Y.Z

# 9. Create GitHub release
gh release create vX.Y.Z --notes "..."

# 10. Merge to develop
git checkout develop
git merge main
git push origin develop
```

**Never do these out of order!**

## Pre-Release Checklist

Before running the release script:

- [ ] All PRs for this release are merged to `develop`
- [ ] `develop` is merged to `main`
- [ ] All tests passing on `main`
- [ ] CHANGELOG.md has unreleased changes documented
- [ ] You have npm publish permissions
- [ ] You have GitHub release permissions
- [ ] You're on the `main` branch

## Troubleshooting

### "Must be on main branch" error
```bash
git checkout main
git pull origin main
```

### "Working directory must be clean" error
```bash
git status
git stash  # or commit your changes
```

### npm publish fails
The script automatically:
- Deletes the git tag
- Reverts the version bump commit
- You can fix the issue and try again

### GitHub push fails
- The script will stop
- npm packages are already published
- Manually run:
  ```bash
  git push origin main
  git push origin vX.Y.Z
  gh release create vX.Y.Z --notes-file CHANGELOG.md
  ```

## Version Types

- **Patch** (2.1.0 → 2.1.1): Bug fixes, documentation
- **Minor** (2.1.0 → 2.2.0): New features, non-breaking changes
- **Major** (2.1.0 → 3.0.0): Breaking changes

## Post-Release

After successful release:

1. ✅ Verify npm packages: https://www.npmjs.com/org/uswds-wc
2. ✅ Verify GitHub release: https://github.com/barbaradenney/uswds-wc/releases
3. ✅ Test installation:
   ```bash
   npm view @uswds-wc/core version
   ```

## CI/CD Integration

For automated releases via GitHub Actions, see `.github/workflows/release.yml`.

## Best Practices

1. **Always use the script** - Don't release manually unless absolutely necessary
2. **Test thoroughly** - The script runs tests, but test locally first
3. **One release at a time** - Don't run multiple releases simultaneously
4. **Document changes** - Update CHANGELOG.md before releasing
5. **Verify after** - Always check npm and GitHub after releasing

## Emergency Rollback

If you need to unpublish a bad release:

```bash
# Unpublish from npm (within 72 hours)
npm unpublish @uswds-wc/core@X.Y.Z

# Delete GitHub release
gh release delete vX.Y.Z --yes

# Delete git tag
git tag -d vX.Y.Z
git push origin :refs/tags/vX.Y.Z
```

**Note**: npm unpublish has restrictions. See: https://docs.npmjs.com/unpublishing-packages-from-the-registry
