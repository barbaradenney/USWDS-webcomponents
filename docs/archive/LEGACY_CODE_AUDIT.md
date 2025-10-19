# Legacy Code Audit Report
**Date:** 2025-10-09
**Follow-up to:** CSS Files Cleanup (4.9MB removed)

## Executive Summary

After removing 4.9MB of unused CSS files, conducted a comprehensive audit for other legacy code. Found **456KB of backup files** safe to delete and identified maintenance opportunities.

---

## 1. Backup Files (SAFE TO DELETE) ✅

### Story Backup Files (.backup)

**Found:** 33 backup files
**Total Size:** 456KB
**Location:** `src/components/*/usa-*.stories.ts.backup`

**What They Are:**
- Backup files created by `scripts/validate/auto-fix-story-styles.js`
- Automatic backups before inline style fixes
- Created during previous cleanup session

**Examples:**
```
./src/components/alert/usa-alert.stories.ts.backup
./src/components/button/usa-button.stories.ts.backup
./src/components/card/usa-card.stories.ts.backup
... (30 more)
```

**Recommendation:** **DELETE ALL** ✅

**Justification:**
- Changes already committed to git
- Git history preserves original versions
- No need for manual backups with version control
- Clutters repository

**Command to delete:**
```bash
find . -name "*.backup" -type f -delete
```

**Verification:**
```bash
# Original files are in git history
git log --all --full-history -- "src/components/alert/usa-alert.stories.ts"
```

---

## 2. Test File Conventions (NO ACTION NEEDED) ✅

### .spec.ts vs .test.ts

**Found:** 24 `.spec.ts` files

**Analysis:**
- `.spec.ts` - Used for specialized tests (Playwright, integration, E2E)
- `.test.ts` - Used for component unit tests (Vitest)

**Distribution:**
```
Playwright tests:        7 files (cross-browser, smoke, accessibility)
Integration tests:       3 files (form, component interaction)
Performance tests:       2 files
Accessibility tests:     2 files
Security tests:          1 file
Visual regression:       2 files
API contracts:           1 file
Error recovery:          1 file
Progressive enhancement: 1 file
Browser-required:        4 files
```

**Recommendation:** **NO ACTION** ✅

**Justification:**
- Intentional naming convention
- `.spec.ts` = specialized/integration tests
- `.test.ts` = component unit tests
- Clear separation of concerns

---

## 3. Coverage Temporary Files (ALREADY IGNORED) ✅

**Found:** `./coverage/.tmp/` directory
**Contents:** 22 coverage JSON files
**Status:** Already in `.gitignore`

**Recommendation:** **NO ACTION** ✅

These are automatically generated test coverage files, properly ignored by git.

---

## 4. TODO/FIXME Comments (MAINTENANCE OPPORTUNITY)

**Found:** 25 TODO/FIXME comments in source code

**Analysis Needed:**
Let me check where these are and if they're actionable:

```bash
grep -r "TODO\|FIXME" src/ --include="*.ts" -n
```

**Recommendation:** **REVIEW** ⚠️

**Potential Actions:**
1. Convert to GitHub issues for tracking
2. Remove completed TODOs
3. Update outdated FIXMEs
4. Document why certain items are deferred

---

## 5. Archived Scripts (KEEP FOR NOW) ✅

**Found:** 83 archived scripts
**Size:** 820KB
**Location:** `scripts/archived/`

**What They Are:**
- Historical one-off fixes and migrations
- Documentation of past issues and solutions
- Reference for similar future problems

**Recommendation:** **KEEP** ✅

**Justification:**
- Already organized in `archived/` directory
- Provides historical context
- Useful reference material
- Small size (820KB)
- Not loaded or executed

**Alternative:** Could move to separate `docs/archived-scripts/` if desired.

---

## 6. Potential Unused Exports (ADVANCED ANALYSIS)

**Status:** Would require advanced tooling

**Tools Available:**
- `ts-unused-exports` - Find unused TypeScript exports
- `depcheck` - Find unused dependencies
- `knip` - Find unused files, dependencies, and exports

**Recommendation:** **OPTIONAL** ⚙️

This would be a more advanced cleanup requiring:
1. Installing analysis tools
2. Reviewing results carefully
3. Ensuring exports aren't used by external consumers
4. Testing after removal

---

## Cleanup Actions Summary

### Immediate (Safe to Delete)

**1. Backup Files - 456KB**
```bash
find . -name "*.backup" -type f -delete
git add -A
git commit -m "chore: remove story backup files (456KB)

Deleted 33 .backup files created by auto-fix-story-styles script.
Original versions preserved in git history.
"
```

**Impact:** -456KB, cleaner repository

---

### Optional (Maintenance)

**2. Review TODO Comments**
```bash
# Generate list
grep -r "TODO\|FIXME\|XXX\|HACK" src/ --include="*.ts" -n > /tmp/todos.txt

# Convert to GitHub issues or clean up
```

**Impact:** Better issue tracking, cleaner code

---

### Not Recommended

**3. Advanced Unused Export Analysis**
- Requires additional tooling
- Risk of breaking external usage
- Time investment vs. benefit unclear

---

## Size Impact Summary

| Item | Files | Size | Action | Risk |
|------|-------|------|--------|------|
| **Component CSS** | 45 | 4.9 MB | ✅ DELETED | None |
| **Story backups** | 33 | 456 KB | 🔄 DELETE | None |
| **Archived scripts** | 83 | 820 KB | ✅ KEEP | N/A |
| **TODO comments** | 25 | ~1 KB | 📋 REVIEW | None |

**Total Potential Cleanup:** 456KB (additional)
**Already Cleaned:** 4.9MB

---

## Recommended Next Steps

### Priority 1: Delete Backup Files (2 minutes)

```bash
# Delete backups
find . -name "*.backup" -type f -delete

# Verify nothing important deleted
git status

# Commit
git add -A
git commit -m "chore: remove story backup files (456KB)"
```

### Priority 2: Review TODO Comments (30 minutes)

```bash
# Extract TODOs
grep -rn "TODO\|FIXME" src/ --include="*.ts" > docs/TODO_LIST.md

# Review each one:
# - Convert to GitHub issue
# - Complete the task
# - Remove if no longer relevant
```

### Priority 3: Optional Advanced Analysis (2 hours)

Only if you want maximum cleanup:

```bash
# Install analysis tools
npm install -D ts-unused-exports knip

# Run analysis
npx ts-unused-exports tsconfig.json
npx knip

# Carefully review results
# Test after any removals
```

---

## Files to Keep (Justified)

### .spec.ts Test Files ✅
**Reason:** Intentional naming for specialized tests

### Archived Scripts ✅
**Reason:** Historical reference, small size, organized location

### Coverage .tmp Directory ✅
**Reason:** Needed for test coverage, in .gitignore

---

## Comparison to Previous Cleanup

### CSS Files Cleanup (Completed)
- **Deleted:** 45 files, 140,449 lines, 4.9MB
- **Impact:** Eliminated confusion, reduced repo size significantly
- **Risk:** Zero (files not used)

### Backup Files Cleanup (Recommended)
- **Delete:** 33 files, 456KB
- **Impact:** Cleaner repository, less clutter
- **Risk:** Zero (git preserves history)

**Total Cleanup Potential:** ~5.4MB

---

## Anti-Pattern Prevention

### What We're NOT Doing (Good!)

❌ **Deleting working code** - Only removing dead code
❌ **Removing useful archives** - Keeping organized historical scripts
❌ **Breaking conventions** - Respecting .spec.ts vs .test.ts patterns
❌ **Removing tooling files** - Keeping coverage, build artifacts in .gitignore

✅ **Removing dead code** - Unused CSS, backup files
✅ **Following git workflow** - Relying on git history, not manual backups
✅ **Maintaining organization** - Keeping purposeful archived content

---

## Conclusion

### Completed
✅ Removed 4.9MB of unused CSS files

### Recommended
🔄 Remove 456KB of backup files (zero risk)

### Optional
📋 Review 25 TODO comments for issue tracking

### Keep
✅ Archived scripts (historical reference)
✅ .spec.ts files (intentional convention)
✅ Coverage temp files (build artifacts)

**Bottom Line:** One more quick cleanup (backup files) will complete the legacy code elimination. Everything else is either intentional or requires careful review.

---

## Maintenance Best Practices Going Forward

1. **No manual backups** - Use git branches and commits
2. **Clean up TODOs** - Convert to issues or complete tasks
3. **Archive completed scripts** - Move one-off fixes to `scripts/archived/`
4. **Review before committing** - Pre-commit hooks catch most issues
5. **Periodic audits** - Run similar audits quarterly

**Next audit recommended:** January 2026
