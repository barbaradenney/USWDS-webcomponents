# Documentation Link Validation Guide

**Automated system to prevent 404 errors in documentation.**

## Overview

The link validation system automatically checks all documentation links to prevent broken references. This ensures documentation stays accurate and up-to-date as files are moved, renamed, or archived.

## Features

✅ **Validates all link types:**
- Relative file links: `[Text](docs/FILE.md)`
- Anchor links: `[Text](#section)`
- Combined: `[Text](docs/FILE.md#section)`
- External URLs: `[Text](https://example.com)`
- Bare URLs: `https://example.com`

✅ **Smart validation:**
- Checks local files exist
- Validates anchors exist in target files
- Checks external URLs return HTTP 200
- Caches results to avoid rate limiting
- Skips placeholder URLs (example.com, localhost)
- Skips trusted domains unless `--external` flag is used

✅ **Helpful reporting:**
- Lists all broken links with file locations
- Provides suggestions for similar files
- Shows available anchors when anchor not found
- Color-coded output for easy scanning

## Usage

### Basic Validation

```bash
# Check all documentation links (skips external URLs)
npm run validate:doc-links

# Also check external URLs
npm run validate:doc-links:external

# Strict mode (fail on any broken link)
npm run validate:doc-links:strict

# Check everything with strict validation
npm run validate:doc-links:all
```

### Direct Script Usage

```bash
# Basic check
node scripts/validate/validate-documentation-links.cjs

# Check external URLs too
node scripts/validate/validate-documentation-links.cjs --external

# Strict mode
node scripts/validate/validate-documentation-links.cjs --strict

# All flags
node scripts/validate/validate-documentation-links.cjs --external --strict
```

## Understanding the Output

### Valid Links
```
✓ Line 42: docs/TESTING_GUIDE.md
✓ Line 43: #component-architecture
✓ Line 44: https://github.com/uswds/uswds (200)
```

### Skipped Links
```
⊘ Line 10: http://localhost:6006 (placeholder - skipped)
⚠ Line 20: https://github.com/... (trusted - skipped)
```

### Broken Links
```
✗ Line 50: ./MISSING_FILE.md - File not found
  💡 Did you mean: docs/archived/MISSING_FILE.md?

✗ Line 60: #wrong-anchor - Anchor not found
  💡 Available anchors: overview, setup, usage, examples

✗ Line 70: https://example.com/404 - HTTP 404 Not Found
```

## Common Issues and Fixes

### 1. File Moved to Archive

**Issue:**
```
✗ File not found: ./TESTING_INFRASTRUCTURE_ENHANCEMENT.md
  💡 Did you mean: docs/archived/TESTING_INFRASTRUCTURE_ENHANCEMENT.md?
```

**Fix:**
Update the link to point to the archived location:
```markdown
- Before: [Link](./TESTING_INFRASTRUCTURE_ENHANCEMENT.md)
- After: [Link](./archived/TESTING_INFRASTRUCTURE_ENHANCEMENT.md)
```

### 2. Anchor Renamed

**Issue:**
```
✗ Anchor #automated-release-workflow-recommended not found
  💡 Available anchors: automated-release-workflow-required, ...
```

**Fix:**
Update the anchor to match the current section heading:
```markdown
- Before: [Link](#automated-release-workflow-recommended)
- After: [Link](#automated-release-workflow-required)
```

### 3. External URL 404

**Issue:**
```
✗ https://storybook.js.org/docs/configure/integration/vite - HTTP 404 Not Found
```

**Fix:**
Find the updated URL and replace:
```markdown
- Before: [Link](https://storybook.js.org/docs/configure/integration/vite)
- After: [Link](https://storybook.js.org/docs/8.0/configure/integration/vite)
```

### 4. Trailing Characters in URL

**Issue:**
```
✗ https://storybook.js.org/docs) - HTTP 404 Not Found
```

**Fix:**
Remove the trailing character:
```markdown
- Before: [Link](https://storybook.js.org/docs)
- After: [Link](https://storybook.js.org/docs)
```

## Integration

### Pre-commit Hook (Optional)

To run link validation before every commit (may slow down commits):

```bash
# Add to .husky/pre-commit
echo "node scripts/validate/validate-documentation-links.cjs --strict" >> .husky/pre-commit
```

**Note:** This is optional as it can significantly slow down commits for large documentation sets.

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Validate Documentation Links
  run: npm run validate:doc-links:strict
```

### Monthly Link Check

Set up a scheduled GitHub Action to check links monthly:

```yaml
name: Monthly Link Check

on:
  schedule:
    - cron: '0 0 1 * *'  # First day of every month
  workflow_dispatch:  # Allow manual trigger

jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run validate:doc-links:all
```

## Configuration

### Trusted Domains

External URLs from these domains are skipped unless `--external` flag is used (to avoid rate limiting):

- `github.com`
- `designsystem.digital.gov`
- `claude.com`
- `anthropic.com`
- `npmjs.com`
- `unpkg.com`
- `jsdelivr.net`

### Placeholder Patterns

URLs matching these patterns are always skipped:

- `example.com`
- `your-org`
- `your-domain`
- `localhost`
- `127.0.0.1`

### File Patterns

The validator checks these files:

- `docs/**/*.md`
- `src/components/**/*.md`
- `src/components/**/*.mdx`
- `.storybook/**/*.md`
- `.storybook/**/*.mdx`
- `CLAUDE.md`
- `README.md`

## Best Practices

### 1. Use Relative Paths

✅ **Good:**
```markdown
[Testing Guide](./TESTING_GUIDE.md)
[Archived Doc](./archived/OLD_DOC.md)
```

❌ **Bad:**
```markdown
[Testing Guide](/docs/TESTING_GUIDE.md)  # Absolute path breaks portability
```

### 2. Include .md Extension

✅ **Good:**
```markdown
[Guide](./TESTING_GUIDE.md)
```

❌ **Bad:**
```markdown
[Guide](./TESTING_GUIDE)  # May not be found
```

### 3. Use Anchor Links for Long Documents

✅ **Good:**
```markdown
See [Architecture Overview](#architecture-overview) for details.
```

### 4. Keep External URLs Updated

- Check external URLs periodically with `npm run validate:doc-links:external`
- Prefer linking to versioned documentation (e.g., `docs/v8.0/` instead of `docs/latest/`)
- Use archive.org links for deprecated external resources

### 5. Document Moved Files

When moving files to archives:

```bash
# 1. Move the file
mv docs/OLD_DOC.md docs/archived/OLD_DOC.md

# 2. Find all references
npm run validate:doc-links

# 3. Update all links
# The validator will suggest the new location
```

## Troubleshooting

### Validation Too Slow

If validation takes too long:

1. **Skip external URLs** (default behavior)
   ```bash
   npm run validate:doc-links  # Fast
   ```

2. **Use external validation only when needed**
   ```bash
   npm run validate:doc-links:external  # Slower
   ```

3. **Check specific directories**
   ```bash
   # Edit the script to limit FILE_PATTERNS
   ```

### False Positives

If the validator reports valid links as broken:

1. **Check for trailing characters**
   - URLs like `https://example.com)` will fail
   - Fix: Remove the trailing `)`

2. **Check for URL encoding issues**
   - Spaces and special characters may need encoding

3. **External URL temporarily down**
   - Re-run validation later
   - Add to trusted domains if persistent

## Maintenance

### Weekly Review

```bash
# Check for new broken links
npm run validate:doc-links
```

### Monthly Deep Check

```bash
# Check everything including external URLs
npm run validate:doc-links:all
```

### After Major Refactoring

```bash
# Validate in strict mode
npm run validate:doc-links:strict
```

## Related Scripts

- `npm run validate:image-links` - Validate image links in stories
- `npm run docs:cleanup` - Clean up old documentation files
- `npm run docs:analyze` - Analyze documentation health

## Summary

The link validation system ensures documentation stays accurate by:

✅ Automatically detecting broken links
✅ Providing helpful suggestions for fixes
✅ Supporting all link types (local, external, anchors)
✅ Preventing 404 errors before they reach users
✅ Making documentation maintenance easier

**Run it regularly to keep documentation healthy!**
