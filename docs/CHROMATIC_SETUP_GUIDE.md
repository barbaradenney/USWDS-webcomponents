# Chromatic Visual Testing Setup Guide

## Overview

Chromatic is a cloud-based visual regression testing service that integrates with Storybook to catch visual bugs automatically. This guide walks through setting up Chromatic for the USWDS Web Components project.

## Why Chromatic?

**Problems It Solves:**
- ✅ Catches visual regressions (like the icon sprite bug we encountered)
- ✅ Reviews UI changes across browsers and viewports
- ✅ Automated visual testing in CI/CD pipeline
- ✅ Collaborative UI review process

**What It Tests:**
- Component visual appearance
- Cross-browser rendering
- Responsive design
- CSS styling changes
- Icon rendering (sprite vs inline)
- Typography and spacing

---

## Prerequisites

Before setting up Chromatic, ensure you have:

1. **Storybook configured** (✅ Already done)
2. **GitHub repository** (✅ Already done)
3. **Component stories** (✅ Already done - 46 components)

---

## Setup Steps

### Step 1: Create Chromatic Account

1. Visit [chromatic.com](https://www.chromatic.com/)
2. Sign up using your GitHub account
3. Authorize Chromatic to access your GitHub repositories

### Step 2: Create Chromatic Project

1. Click "Add project" in Chromatic dashboard
2. Select your GitHub repository: `uswds-wc`
3. Chromatic will generate a **project token**
4. **Copy this token** - you'll need it in the next step

**Example token format:**
```
chpt_1234567890abcdef1234567890abcdef12345678
```

### Step 3: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add secret:
   - **Name**: `CHROMATIC_PROJECT_TOKEN`
   - **Value**: (paste the token from Step 2)
5. Click **"Add secret"**

**Verification:**
- Secret should appear in the list
- CI workflows will now have access to `${{ secrets.CHROMATIC_PROJECT_TOKEN }}`

### Step 4: Verify CI Integration

Chromatic is already configured in 3 workflow files:

1. **`.github/workflows/visual-testing.yml`**
   - Runs on: Pull requests, main branch pushes
   - Action: Full visual regression test

2. **`.github/workflows/visual-regression.yml`**
   - Runs on: Scheduled (weekly)
   - Action: Comprehensive visual testing

3. **`.github/workflows/comprehensive-testing.yml`**
   - Runs on: Scheduled (daily)
   - Action: Full test suite including visual tests

**No code changes needed** - workflows are already configured!

---

## Using Chromatic

### Local Development

Run visual tests locally:

```bash
# Run Chromatic with token
pnpm run chromatic

# Or with environment variable
CHROMATIC_PROJECT_TOKEN=your_token_here pnpm run chromatic

# Build Storybook first, then run Chromatic
pnpm run chromatic:build
```

**Note**: Local runs will upload to Chromatic cloud and use your snapshot quota.

### CI/CD Integration

Chromatic runs automatically in CI:

1. **On Pull Requests**:
   - Chromatic runs visual tests
   - Detects UI changes
   - Posts review link to PR

2. **On Main Branch**:
   - Accepts changes as new baseline
   - Updates snapshot library

3. **Scheduled Runs**:
   - Weekly comprehensive visual testing
   - Catches drift over time

### Reviewing Visual Changes

When Chromatic detects changes:

1. **Check PR Comments**:
   - Chromatic bot posts a comment
   - Includes link to visual diff review

2. **Review in Chromatic UI**:
   - Click the review link
   - Compare before/after screenshots
   - Approve or reject changes

3. **Approval Workflow**:
   - ✅ **Accept**: Changes become new baseline
   - ❌ **Reject**: Fix the code and re-run
   - 🔍 **Discuss**: Comment and collaborate

---

## NPM Scripts Reference

All Chromatic scripts are now available:

```bash
# Basic Chromatic run
pnpm run chromatic

# CI mode (doesn't fail on changes)
pnpm run chromatic:ci

# Build Storybook and run Chromatic
pnpm run chromatic:build

# Local development mode
pnpm run chromatic:local
```

---

## Configuration

Chromatic is configured via `.github/workflows/` files:

### Visual Testing Workflow
**File**: `.github/workflows/visual-testing.yml`

```yaml
- name: Run Chromatic Visual Tests
  uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    # Auto-accept changes on main branch
    autoAcceptChanges: main
    # Don't fail build on UI changes
    exitZeroOnChanges: true
```

### Options Explained

- **`projectToken`**: Your Chromatic project token (from GitHub secrets)
- **`autoAcceptChanges`**: Auto-accept on specified branches (usually `main`)
- **`exitZeroOnChanges`**: Don't fail CI if visual changes detected
- **`buildScriptName`**: Custom build script (default: `build-storybook`)
- **`storybookBuildDir`**: Pre-built Storybook directory (default: `storybook-static`)

---

## What Chromatic Tests

Based on our Storybook configuration, Chromatic tests:

### **46 Components**
All USWDS components with stories:
- Accordion, Alert, Banner, Breadcrumb, Button
- Card, Character Count, Checkbox, Collection, Combo Box
- Date Picker, Date Range Picker, File Input, Footer
- Header, Icon, Identifier, In-Page Navigation
- Language Selector, Link, List, Memorable Date, Modal
- Pagination, Process List, Prose, Radio, Range Slider
- Search, Select, Side Navigation, Site Alert, Skip Link
- Step Indicator, Summary Box, Table, Tag, Text Input
- Textarea, Time Picker, Tooltip, Validation

### **Visual Aspects Tested**
- ✅ Component rendering (sprites vs inline SVG)
- ✅ USWDS styling compliance
- ✅ Responsive layouts
- ✅ Interactive states (hover, focus, disabled)
- ✅ Typography and spacing
- ✅ Icon display (would catch our sprite bug!)
- ✅ Error states
- ✅ Accessibility features (visible focus indicators)

### **Cross-Browser Testing**
Chromatic tests across:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Troubleshooting

### "Chromatic token not found"

**Error**: `Error: Chromatic project token not found`

**Solution**:
1. Verify secret exists: GitHub → Settings → Secrets → Actions
2. Check secret name is exactly: `CHROMATIC_PROJECT_TOKEN`
3. Re-run workflow

### "Build failed to upload"

**Error**: `Error uploading build to Chromatic`

**Solution**:
1. Check Storybook builds successfully: `pnpm run build-storybook`
2. Verify Storybook output in `storybook-static/`
3. Check network connectivity
4. Verify Chromatic service status

### "Too many snapshots"

**Error**: `Snapshot quota exceeded`

**Solution**:
1. Review Chromatic plan limits
2. Upgrade Chromatic plan if needed
3. Use `exitZeroOnChanges` to prevent quota exhaustion
4. Limit Chromatic runs to critical workflows

### Local run fails

**Error**: `Token required but not found`

**Solution**:
```bash
# Set token as environment variable
export CHROMATIC_PROJECT_TOKEN=your_token_here
pnpm run chromatic

# Or pass inline
CHROMATIC_PROJECT_TOKEN=your_token_here pnpm run chromatic
```

---

## Best Practices

### 1. **Review Every Change**
- Don't auto-accept all changes
- Review visual diffs carefully
- Question unexpected changes

### 2. **Use Baselines Wisely**
- Keep main branch baseline clean
- Update baselines deliberately
- Document major visual changes

### 3. **Limit Snapshot Noise**
- Avoid animations in Storybook stories
- Use consistent test data
- Disable dynamic timestamps

### 4. **Optimize for Speed**
- Use `exitZeroOnChanges` in CI
- Run full tests on schedule, not every commit
- Build Storybook once, use multiple times

### 5. **Collaborate on Reviews**
- Use Chromatic comments for discussion
- Tag designers for UI reviews
- Link to Chromatic builds in PRs

---

## How Chromatic Would Have Caught Our Bugs

### Bug 1: Icon Sprite Regression

**What happened**: Icons reverted from sprite mode to inline SVG

**How Chromatic catches it**:
1. Baseline: Icons render from sprite file
2. Change: Icons switch to inline SVG
3. **Chromatic detects**: Visual diff in icon rendering
4. **Review shows**: Different SVG structure
5. **Result**: Bug caught before merge ✅

### Bug 2: Character Count USWDS Structure

**What happened**: Message element had `aria-live` when it shouldn't

**How Chromatic catches it** (indirectly):
1. Baseline: Correct USWDS structure
2. Change: Aria structure changes
3. **Chromatic detects**: No visual diff
4. **BUT**: DOM structure tests (Phase 3) catch it ✅
5. **Result**: Need both visual + structure tests

**Key Insight**: Chromatic catches **visual** bugs. Pair with **USWDS compliance tests** (Phase 3) for complete coverage.

---

## Next Steps

After Chromatic setup:

1. **✅ Phase 1 Complete**: Scripts added, Chromatic configured
2. **→ Phase 2 Next**: Integrate visual regression tests
3. **→ Phase 3 Next**: Add USWDS structure validation
4. **→ Phase 4**: Enable Chromatic in all PR workflows
5. **→ Phase 5**: Create visual testing guide

---

## Resources

- **Chromatic Docs**: [chromatic.com/docs](https://www.chromatic.com/docs)
- **Storybook Integration**: [storybook.js.org/addons/@chromatic-com/storybook](https://storybook.js.org/addons/@chromatic-com/storybook)
- **GitHub Action**: [github.com/chromaui/action](https://github.com/chromaui/action)
- **Our Workflows**: `.github/workflows/visual-*.yml`

---

## Support

- **Chromatic Issues**: [github.com/chromaui/chromatic-cli/issues](https://github.com/chromaui/chromatic-cli/issues)
- **Our Issues**: Report in this repository's issue tracker
- **Questions**: Tag `@chromatic-support` in Chromatic dashboard

---

*Last Updated: 2025-10-23*
*Status: ✅ Chromatic configured, awaiting token setup*
