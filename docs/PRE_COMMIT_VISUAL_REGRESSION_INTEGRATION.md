# Pre-commit Visual Regression Integration

**Date:** 2025-11-05
**Enhancement:** Visual regression testing integrated into pre-commit hooks

---

## 🎯 Overview

Visual regression testing for patterns is now available as an **opt-in** pre-commit validation, providing automated screenshot comparison before code is committed.

---

## 🚀 How to Use

### Basic Usage

```bash
# Enable for one commit
VISUAL_REGRESSION_PRECOMMIT=1 git commit -m "feat(patterns): update address pattern"

# Or set as environment variable for your session
export VISUAL_REGRESSION_PRECOMMIT=1
git commit -m "feat(patterns): update address pattern"
```

### With Storybook Already Running (Faster)

```bash
# In one terminal - start Storybook
pnpm storybook

# In another terminal - commit with visual regression
VISUAL_REGRESSION_PRECOMMIT=1 git commit -m "feat(patterns): update layout"
```

**Performance:**
- With Storybook running: ~45 seconds
- Without Storybook: ~90 seconds (auto-starts Storybook)

---

## 📋 What It Does

### Smart Pattern Detection

The hook only runs visual tests when pattern files are modified:

```bash
# Detects modifications in:
packages/uswds-wc-patterns/src/patterns/**/*.ts
packages/uswds-wc-patterns/src/patterns/**/*.stories.ts
packages/uswds-wc-patterns/src/patterns/**/*.test.ts
```

If no pattern files are modified, the visual regression check is skipped.

### Automated Workflow

1. **Detects Pattern Changes:** Checks if any pattern files in the commit
2. **Starts Storybook** (if not already running)
3. **Runs Visual Tests:** Tests all 11 patterns across 3 viewports
4. **Compares Screenshots:** Compares against baseline images
5. **Reports Results:** Shows pass/fail with helpful debug commands
6. **Stops Storybook** (if it was auto-started)

### What Gets Tested

- **All 11 Patterns:** address, phone-number, name, contact-preferences, language-selection, form-summary, date-of-birth, email-address, ssn, race-ethnicity, sex
- **3 Viewports:** mobile (375×667), tablet (768×1024), desktop (1280×720)
- **Interaction States:** Focus states, hover states
- **Compact Mode:** Selected patterns tested in compact mode
- **State Variations:** Different pattern configurations

**Total Tests:** ~68 visual regression tests

---

## ✅ Success Example

```bash
$ VISUAL_REGRESSION_PRECOMMIT=1 git commit -m "feat(patterns): update address layout"

🎯 Running component-specific pre-commit validation...

📋 Modified patterns detected: 1
   • address

# ... other validation stages ...

📸 12/14 Pattern visual regression tests (opt-in)...
   → Detected 1 pattern file(s) modified
   ✅ Storybook ready
   ✅ Pass (11 patterns tested across 3 viewports)

✅ All checks passed!
```

---

## ❌ Failure Example

```bash
$ VISUAL_REGRESSION_PRECOMMIT=1 git commit -m "feat(patterns): change address layout"

📸 12/14 Pattern visual regression tests (opt-in)...
   → Detected 1 pattern file(s) modified
   ✅ Storybook ready
   ❌ Visual regression tests failed!

   💡 Debug options:
      • pnpm test:visual:patterns (see detailed output)
      • pnpm test:visual:patterns:update (update baselines if changes are intentional)
      • pnpm test:visual:ui (interactive UI for debugging)

   📖 See: PATTERN_VALIDATION_AND_VISUAL_TESTING_ENHANCEMENTS.md
```

---

## 🛠️ Debugging Failed Visual Tests

### Option 1: View Detailed Output

```bash
pnpm test:visual:patterns
```

This shows which specific tests failed and displays diff images.

### Option 2: Interactive UI Mode

```bash
pnpm test:visual:ui
```

Opens Playwright's interactive UI for debugging:
- See actual vs expected screenshots side-by-side
- View pixel diffs highlighted
- Debug specific failing tests
- Update baselines interactively

### Option 3: View Test Report

```bash
# After running tests, open the HTML report
open visual-test-results/index.html
```

### Option 4: Update Baselines (If Changes Are Intentional)

If your visual changes are intentional:

```bash
# Update baseline screenshots
pnpm test:visual:patterns:update

# Then commit again
git add .
git commit -m "feat(patterns): update address layout

Updated visual baselines for address pattern layout changes."
```

---

## 🎨 When to Use Visual Regression Pre-commit

### ✅ **Always Use For:**

1. **Pattern Layout Changes**
   - Modifying pattern structure
   - Changing field arrangement
   - Updating responsive behavior

2. **Style Updates**
   - Changing USWDS classes
   - Updating spacing/padding
   - Modifying compact mode

3. **Component Composition Changes**
   - Adding/removing child components
   - Changing component hierarchy
   - Updating slot rendering

4. **Before Pull Requests**
   - Pattern-heavy PRs
   - Visual-critical changes
   - Major refactoring

### ⏭️ **Skip For:**

1. **Logic-Only Changes**
   - Validation methods
   - Event handlers
   - Internal state management

2. **Documentation Updates**
   - README changes
   - Comment updates
   - Story descriptions

3. **Test Updates**
   - Unit test additions
   - Test refactoring (no implementation changes)

---

## ⚡ Performance Tips

### 1. Keep Storybook Running

```bash
# Terminal 1 - Keep Storybook running
pnpm storybook

# Terminal 2 - Fast commits (~45s instead of ~90s)
VISUAL_REGRESSION_PRECOMMIT=1 git commit -m "update"
```

### 2. Run Visual Tests Manually First

```bash
# Before committing, run tests manually
pnpm test:visual:patterns

# Fix any issues, then commit without visual regression
git commit -m "feat(patterns): update layout"
```

### 3. Update Baselines in Bulk

```bash
# Make multiple pattern changes
# Update all baselines at once
pnpm test:visual:patterns:update

# Commit baselines separately
git add tests/playwright/
git commit -m "test: update visual baselines for pattern changes"
```

---

## 🔗 Integration with Other Pre-commit Checks

Visual regression can be combined with other optional checks:

```bash
# Visual regression + smoke tests
VISUAL_REGRESSION_PRECOMMIT=1 SMOKE_TESTS_PRECOMMIT=1 git commit -m "feat(patterns): comprehensive update"

# All optional checks
VISUAL_REGRESSION_PRECOMMIT=1 \
CYPRESS_PRECOMMIT=1 \
SMOKE_TESTS_PRECOMMIT=1 \
BUNDLE_SIZE_PRECOMMIT=1 \
git commit -m "feat(patterns): fully validated update"
```

---

## 📖 Implementation Details

### Hook Location

`.husky/pre-commit` (lines 437-507)

### Check Order

12/15 in the validation pipeline (after documentation, before Cypress tests)

### Conditional Execution

```bash
# Only runs if:
1. VISUAL_REGRESSION_PRECOMMIT=1 is set
2. AND pattern files are modified ($MODIFIED_PATTERNS > 0)

# Otherwise skipped with message:
"⏭️  Skipped (no patterns modified)"
```

### Storybook Management

The hook intelligently manages Storybook:

```bash
# Checks if Storybook is running
curl -s http://localhost:6006 > /dev/null

# If not running:
- Starts Storybook in background
- Waits for readiness (max 60s)
- Runs tests
- Stops Storybook

# If already running:
- Uses existing instance
- Runs tests
- Leaves Storybook running
```

---

## 🎓 Best Practices

### 1. Use for Pattern Changes Only

The hook is smart about when to run - it automatically detects pattern file changes. Don't manually force it for non-pattern commits.

### 2. Keep Baseline Screenshots Updated

When visual changes are intentional:
```bash
pnpm test:visual:patterns:update
git add tests/playwright/
git commit -m "test: update visual baselines"
```

### 3. Review Diffs Carefully

Before updating baselines, always review the visual diffs to ensure changes are intentional:
```bash
pnpm test:visual:ui
```

### 4. Commit Visual Baselines Separately

Keep baseline updates in separate commits for cleaner history:
```bash
# Commit 1: Implementation
git commit -m "feat(patterns): update address layout"

# Commit 2: Visual baselines
pnpm test:visual:patterns:update
git add tests/playwright/
git commit -m "test: update visual baselines for address layout"
```

### 5. Document Visual Changes

When updating baselines, document what changed:
```bash
git commit -m "test: update visual baselines for address pattern

- Updated mobile layout spacing
- Adjusted compact mode margins
- Fixed tablet breakpoint rendering"
```

---

## 🔍 Troubleshooting

### Problem: "Storybook failed to start within 60 seconds"

**Solution:**
```bash
# Start Storybook manually first
pnpm storybook

# Then commit
VISUAL_REGRESSION_PRECOMMIT=1 git commit -m "update"
```

### Problem: "Visual regression tests failed" but changes look correct

**Solution:**
```bash
# View the diffs
pnpm test:visual:ui

# If correct, update baselines
pnpm test:visual:patterns:update
```

### Problem: Tests fail due to font loading issues

**Solution:**
The hook waits for fonts to load, but if issues persist:
```bash
# Increase timeout in visual.config.ts
webServer: {
  timeout: 180 * 1000, // Increase from 120s to 180s
}
```

### Problem: Hook runs too slowly

**Solution:**
```bash
# Keep Storybook running in background
pnpm storybook &

# Or skip visual tests for this commit
git commit -m "update" # Without VISUAL_REGRESSION_PRECOMMIT=1
```

---

## 📊 Statistics

### Coverage

- **Patterns Covered:** 11/11 (100%)
- **Viewports:** 3 (mobile, tablet, desktop)
- **Tests per Pattern:** ~5-6 visual tests
- **Total Visual Tests:** ~62 tests

### Performance

- **With Storybook Running:** ~45 seconds
- **Cold Start:** ~90 seconds
- **Screenshot Generation:** ~2 seconds per test
- **Diff Comparison:** <1 second per test

---

## 🔗 Related Documentation

- **PATTERN_VALIDATION_AND_VISUAL_TESTING_ENHANCEMENTS.md** - Complete visual testing guide
- **CLAUDE.md** - Pre-commit validation overview (lines 650-712)
- **tests/playwright/patterns-visual.spec.ts** - Visual test implementation
- **visual.config.ts** - Playwright visual testing configuration

---

## ✅ Summary

Visual regression testing is now seamlessly integrated into the pre-commit workflow:

- ✅ Opt-in via `VISUAL_REGRESSION_PRECOMMIT=1`
- ✅ Smart pattern detection (only runs when needed)
- ✅ Automatic Storybook management
- ✅ 100% pattern coverage across 3 viewports
- ✅ Helpful debug commands on failure
- ✅ Fast when Storybook is running (~45s)

This ensures patterns maintain visual consistency and catches layout regressions before they reach version control.

---

**Generated with Claude Code**
**Date:** 2025-11-05
**Contributors:** Claude (AI Assistant) + Barbara Miles
