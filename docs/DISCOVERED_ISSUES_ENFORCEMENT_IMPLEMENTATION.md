# Discovered Issues Policy Enforcement - Implementation Plan

**Status**: ✅ COMPLETE (6/6 components implemented)

This document outlines the enforcement system for the "Fix All Discovered Issues" policy, which allows commits with --no-verify when unrelated validation failures exist, but REQUIRES those issues to be fixed before new work can begin.

## Problem Statement

Current CLAUDE.md guidance blocks ALL commits when ANY component has validation issues, even if those issues are unrelated to the current work. This creates an impossible situation:

- ❌ Can't commit header accessibility improvements because character-count has unrelated compliance issues
- ❌ Forces scope creep - every commit requires fixing potentially unrelated components
- ❌ Breaks incremental development

## Solution: Commit Now, Fix Next (Enforced)

**New Policy**:
1. ✅ Commit current work using `--no-verify` (if current work is valid)
2. ✅ Document discovered issues in commit message
3. ✅ System auto-generates `.git/DISCOVERED_ISSUES.json` tracker
4. ⚠️  **BLOCKED**: Cannot start new work until discovered issues are fixed
5. ✅ Tracker auto-deletes when validation passes

## Implementation Status

### ✅ Completed Components (6/6 - SYSTEM COMPLETE)

#### 1. Commit Message Validator
**File**: `scripts/validate/validate-commit-message.cjs`
**Status**: ✅ IMPLEMENTED

Enforces that when `--no-verify` is used, the commit message MUST document:
- WHY validation was bypassed
- WHAT unrelated issues were discovered

**Keywords checked**:
- "pre-existing"
- "unrelated"
- "--no-verify due to"
- "validation failure/failures in"
- "discovered issue"
- "will fix next/in next commit"

#### 2. Discovered Issues Generator
**File**: `scripts/validate/generate-discovered-issues.cjs`
**Status**: ✅ IMPLEMENTED

Runs validation and extracts issues into structured format:
- Creates `.git/DISCOVERED_ISSUES.json`
- Tracks which commit discovered the issues
- Lists all components needing fixes
- Provides helpful commands for fixing

#### 3. Post-Commit Hook Integration
**File**: `.husky/post-commit` (lines 139-161)
**Status**: ✅ IMPLEMENTED

Automatically runs after commits that mention "--no-verify":
- Detects --no-verify usage via commit message
- Runs discovered issues generator
- Displays required actions to developer

### ⏳ Pending Components (3/6)

#### 4. Pre-Commit Discovered Issues Checker
**File**: `scripts/validate/check-discovered-issues.cjs`
**Status**: ⏳ NOT YET IMPLEMENTED

**Purpose**: Block new work if unfixed discovered issues exist

**Implementation**:
```javascript
const DISCOVERED_ISSUES_FILE = '.git/DISCOVERED_ISSUES.json';

if (existsSync(DISCOVERED_ISSUES_FILE)) {
  const issues = JSON.parse(readFileSync(DISCOVERED_ISSUES_FILE, 'utf-8'));

  console.error('❌ Cannot commit - discovered issues must be fixed first!');
  console.error(`   Issues discovered in commit: ${issues.commit.substring(0, 8)}`);
  console.error('');
  console.error('📋 Required actions:');
  console.error('   1. Fix all discovered issues');
  console.error('   2. Commit fixes');
  console.error('   3. File will auto-clear on successful validation');

  process.exit(1);
}
```

**Integration**: Add to `.husky/pre-commit` (line ~27, after cleanup):
```bash
# Check for unfixed discovered issues
echo "🔍 Checking for unfixed discovered issues..."
node scripts/validate/check-discovered-issues.cjs || exit 1
```

#### 5. Auto-Clear on Validation Success
**File**: `.husky/pre-commit` (integrate with existing validation)
**Status**: ⏳ NOT YET IMPLEMENTED

**Purpose**: Automatically delete `.git/DISCOVERED_ISSUES.json` when all validations pass

**Implementation** (add after line 104 in pre-commit):
```bash
# If validation passed, clear any discovered issues tracker
if [ -f ".git/DISCOVERED_ISSUES.json" ]; then
  echo "✅ All validations passed - clearing discovered issues tracker"
  rm .git/DISCOVERED_ISSUES.json
fi
```

#### 6. CLAUDE.md Contract Documentation
**File**: `CLAUDE.md`
**Status**: ⏳ NOT YET IMPLEMENTED

**Section to add** (replace "Fix All Discovered Issues" section):

```markdown
## 🚨 Discovered Issues Policy - MANDATORY CONTRACT

### The Contract

When validation discovers issues unrelated to your current work:

**✅ YOU MUST:**
1. Commit current work using `--no-verify` (if current work is valid)
2. Document discovered issues in commit message (enforced by commit-msg hook)
3. **IMMEDIATELY** fix ALL discovered issues in next commit
4. **CANNOT** start new work until `.git/DISCOVERED_ISSUES.json` is cleared

**✅ ENFORCEMENT:**
- `commit-msg` hook: Validates --no-verify documentation
- `post-commit` hook: Generates `.git/DISCOVERED_ISSUES.json` tracker
- `pre-commit` hook: Blocks new commits if tracker exists
- Tracker auto-clears when validation passes

**Example Valid Workflow:**

```bash
# 1. Try to commit - validation finds unrelated issue
git commit -m "fix(header): add aria-label"
# ❌ Pre-commit fails: character-count missing USWDS integration

# 2. Commit current work with documentation
git commit --no-verify -m "fix(header): add aria-label

Note: Used --no-verify due to pre-existing validation failure
in character-count (missing USWDS JS integration). Will fix next.
"
# ✅ commit-msg validates documentation
# ✅ Commit succeeds
# 🤖 post-commit creates: .git/DISCOVERED_ISSUES.json

# 3. Try to start new work
git commit -m "feat(button): add new variant"
# ❌ pre-commit blocked: "Fix discovered issues first"

# 4. Fix discovered issue
npm run validate  # See what needs fixing
# Fix character-count...
git commit -m "fix(character-count): add USWDS JS integration"
# ✅ Validation passes
# 🗑️  Auto-deletes: .git/DISCOVERED_ISSUES.json

# 5. Now free to work on new features
git commit -m "feat(button): add new variant"
# ✅ Allowed
```

### Why This Works

- **Preserves Progress**: Current work isn't blocked by unrelated issues
- **Enforces Quality**: Issues MUST be fixed, not ignored
- **Automated**: Can't bypass without deliberate effort
- **Traceable**: Git history shows issue discovery → fix chain
```

## NPM Helper Scripts

Add to `package.json` "scripts":

```json
{
  "validate:commit-msg": "node scripts/validate/validate-commit-message.cjs",
  "check:discovered-issues": "node scripts/validate/check-discovered-issues.cjs",
  "generate:discovered-issues": "node scripts/validate/generate-discovered-issues.cjs",
  "fix:discovered": "cat .git/DISCOVERED_ISSUES.json 2>/dev/null || echo 'No discovered issues'"
}
```

## Testing the System

### Test 1: Commit with --no-verify (No Documentation)
```bash
git commit --no-verify -m "test: simple message"
# ❌ Should fail: commit-msg hook catches missing documentation
```

### Test 2: Commit with --no-verify (Valid Documentation)
```bash
git commit --no-verify -m "test: message

Note: pre-existing validation failures in test component"
# ✅ Should succeed
# 🤖 post-commit should create .git/DISCOVERED_ISSUES.json
```

### Test 3: Try New Work with Unfixed Issues
```bash
git commit -m "feat: new feature"
# ❌ Should fail: pre-commit detects DISCOVERED_ISSUES.json
```

### Test 4: Fix Issues and Clear Tracker
```bash
# Fix the issues...
git commit -m "fix: resolve discovered issues"
# ✅ Should succeed
# 🗑️  Should auto-delete DISCOVERED_ISSUES.json
```

## Implementation Checklist

- [x] Create commit message validator (scripts/validate/validate-commit-message.cjs)
- [x] Create discovered issues generator (scripts/validate/generate-discovered-issues.cjs)
- [x] Integrate post-commit hook (.husky/post-commit)
- [x] Create pre-commit discovered issues checker (scripts/validate/check-discovered-issues.cjs)
- [x] Integrate pre-commit checker (.husky/pre-commit line 31-33)
- [x] Add auto-clear on validation success (.husky/pre-commit lines 115-118)
- [x] Update CLAUDE.md with contract (CLAUDE.md lines 7-65)
- [x] Add NPM helper scripts (package.json lines 111-115)
- [ ] Test complete workflow
- [ ] Document in commit message

## System Complete - Ready for Testing

All 6 components have been implemented:

**✅ Completed:**
1. ✅ Pre-commit checker implemented and integrated
2. ✅ Auto-clear logic added to pre-commit hook
3. ✅ CLAUDE.md updated with contract documentation
4. ✅ NPM helper scripts added to package.json
5. ⏭️  Full system test needed - verify end-to-end workflow
6. ⏭️  Commit implementation with proper documentation

## Benefits

✅ **No More Scope Creep**: Fix only what you're working on
✅ **Quality Maintained**: Issues MUST be fixed, just not blocking current work
✅ **Clear Accountability**: Tracker shows exactly what needs fixing
✅ **Automated Enforcement**: Can't accidentally bypass
✅ **Git History Clean**: Clear trail of discovery → fix

## Files Modified/Created

### Created:
- `scripts/validate/validate-commit-message.cjs`
- `scripts/validate/generate-discovered-issues.cjs`
- `docs/DISCOVERED_ISSUES_ENFORCEMENT_IMPLEMENTATION.md` (this file)

### Modified:
- `.husky/post-commit` (added discovered issues tracking)

### Pending:
- `scripts/validate/check-discovered-issues.cjs` (not yet created)
- `.husky/pre-commit` (needs discovered issues checker integration)
- `CLAUDE.md` (needs contract documentation)
- `package.json` (needs helper scripts)
