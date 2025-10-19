# Documentation Lifecycle Management

**Problem Solved**: Prevents documentation accumulation by automatically categorizing, validating, and archiving obsolete session reports while keeping permanent guides active.

## Overview

This project implements automated documentation hygiene to prevent the accumulation of one-off session reports, analysis docs, and obsolete summaries that clutter the docs/ directory.

**Results**: Reduced from 254 total doc files to managed set of ~67 active docs (41 permanent, 22 temporary, 4 status)

## Documentation Categories

### 1. PERMANENT Docs (Never Archived)
Core guides and references that developers actively use:
- Architecture & patterns guides
- Development guides (TESTING_GUIDE.md, DEBUGGING_GUIDE.md, etc.)
- Process documentation (RELEASE_PROCESS.md, TEST_SKIP_POLICY.md)
- Optimization guides
- Component-specific strategies
- Current issue tracking

**Count**: 41 files

### 2. TEMPORARY Docs (Archived After 7 Days)
Session reports and one-off analysis:
- *_SESSION*.md - Session work logs
- *_IMPROVEMENTS.md - Improvement summaries
- *_SUMMARY.md - Work summaries
- *_ANALYSIS.md - One-time analysis
- *_INVESTIGATION.md - Investigation reports
- *_FINDINGS.md - Finding reports
- *_RESULTS.md - Result summaries
- POST_MORTEM_*.md - Post-mortem analysis
- *_AUDIT.md - Audit reports
- *_PLAN.md - Planning documents
- PATH_TO_*.md - Progress tracking
- *_CHECKLIST.md - Checklists

**Count**: 22 files (will be archived automatically after 7 days)

### 3. STATUS Docs (Archived After 60 Days)
Status reports that should be archived when work is complete:
- *_STATUS.md - Status reports
- *_COMPLETE*.md - Completion summaries
- *_KNOWN_ISSUES.md - Known issue tracking

**Count**: 4 files

## Automated Processes

### 1. Pre-Commit Validation (Enforcement)
**Hook**: `.husky/pre-commit` → Stage 11a/11

Validates documentation hygiene before each commit:
```bash
echo "🧹 11a/11 Documentation hygiene..."
node scripts/validate/validate-documentation-hygiene.cjs
```

**Checks**:
- ✅ Total doc count (warns if > 50 active docs)
- ✅ Archivable docs (warns if > 10 ready for archive)
- ❌ Uncategorized docs (fails if adding new uncategorized docs)
- ⚠️  Doc naming conventions (warns on non-SCREAMING_SNAKE_CASE)

**Action**: Blocks commit if new docs are uncategorized

### 2. Post-Commit Cleanup (Automated)
**Hook**: `.husky/post-commit`

Automatically archives obsolete docs after each commit:
```bash
# Runs after every commit
# Archives docs if > 5 docs ready for archive
```

**Behavior**:
- Checks archivable doc count after each commit
- **Threshold**: Runs only if > 5 docs ready for archive
- **Auto-commits**: Creates automatic cleanup commit
- **Disable**: `SKIP_DOC_CLEANUP=1 git commit`

**Example Output**:
```bash
🧹 Post-commit: Found 6 docs ready for archive
   Running automated cleanup...
📦 Staging archived documentation...
✅ Documentation cleanup completed and committed
```

**Low Count**: If 1-5 docs ready, suggests manual cleanup:
```bash
🔄 Post-commit: Found 3 doc(s) ready for archive (threshold: 5)
   Run manually: npm run docs:cleanup
```

### 3. Weekly GitHub Actions (Scheduled)
**Workflow**: `.github/workflows/docs-maintenance.yml` → `automated-cleanup` job

Runs weekly documentation cleanup via GitHub Actions:

**Schedule**: Every Monday at 9 AM UTC
**Trigger**: Also available via manual workflow dispatch

**Behavior**:
- Analyzes documentation state
- Archives obsolete docs if any found
- Auto-commits and pushes changes
- Creates workflow summary

**Benefits**:
- Backup cleanup if post-commit doesn't run
- Works for repos without frequent commits
- Provides audit trail in GitHub Actions

### Manual Cleanup Commands (Override)

```bash
# Analyze current documentation state (dry-run)
npm run docs:analyze

# Run cleanup with preview
npm run docs:cleanup:dry-run

# Actually archive obsolete docs
npm run docs:cleanup

# Aggressive cleanup (archive docs > 3 days old)
node scripts/maintenance/cleanup-documentation.cjs --dry-run
# Edit ARCHIVE_AGE_DAYS in script, then:
node scripts/maintenance/cleanup-documentation.cjs
```

### Archival Policy

**Temporary Docs**: Archived after 7 days
- Reasoning: Session reports become obsolete quickly
- Impact: Work summaries archived weekly
- Override: Adjust ARCHIVE_AGE_DAYS in cleanup-documentation.cjs

**Status Docs**: Archived after 60 days
- Reasoning: Status reports remain relevant longer
- Impact: Known issues tracked for 2 months
- Override: Move to PERMANENT_DOCS if should be kept

**Permanent Docs**: Never archived
- Defined in `scripts/maintenance/cleanup-documentation.cjs`
- Add new permanent docs to PERMANENT_DOCS array

## Workflow Examples

### Creating New Documentation

**Scenario 1**: Creating a permanent guide
```bash
# Create doc with SCREAMING_SNAKE_CASE name
vim docs/NEW_FEATURE_GUIDE.md

# Add to PERMANENT_DOCS in cleanup-documentation.cjs
# Commit - pre-commit validation will fail if not categorized

git add docs/NEW_FEATURE_GUIDE.md
git add scripts/maintenance/cleanup-documentation.cjs
git commit -m "docs: add new feature guide"
```

**Scenario 2**: Creating a session report
```bash
# Use recognized naming pattern (e.g., *_SUMMARY.md, *_ANALYSIS.md)
vim docs/BUG_FIX_INVESTIGATION.md

# No need to update cleanup script - automatically categorized as TEMPORARY
git add docs/BUG_FIX_INVESTIGATION.md
git commit -m "docs: add bug fix investigation"

# Will be automatically archived after 7 days
```

### Running Weekly Cleanup

```bash
# Check what will be archived
npm run docs:analyze

# Review the list, then archive
npm run docs:cleanup

# Commit archived docs
git add docs/
git commit -m "chore: archive obsolete documentation"
```

### Handling Documentation Warnings

**Warning**: "Total doc count > 50"
```bash
npm run docs:cleanup
```

**Warning**: "> 10 docs ready for archive"
```bash
npm run docs:cleanup
```

**Error**: "New documentation must be categorized"
```bash
# Option 1: Use recognized naming pattern
mv docs/my-doc.md docs/MY_ANALYSIS.md

# Option 2: Add to PERMANENT_DOCS
# Edit scripts/maintenance/cleanup-documentation.cjs
# Add 'MY_DOC.md' to PERMANENT_DOCS array

git add scripts/maintenance/cleanup-documentation.cjs docs/MY_DOC.md
git commit -m "docs: add my doc to permanent docs"
```

## File Organization

### Active Documentation
```
docs/
├── PERMANENT docs (41 files)
│   ├── ARCHITECTURE_PATTERNS.md
│   ├── TESTING_GUIDE.md
│   ├── DEBUGGING_GUIDE.md
│   └── ...
├── TEMPORARY docs (22 files)
│   ├── *_SUMMARY.md
│   ├── *_ANALYSIS.md
│   ├── *_INVESTIGATION.md
│   └── ...
└── STATUS docs (4 files)
    ├── *_STATUS.md
    ├── *_KNOWN_ISSUES.md
    └── ...
```

### Archived Documentation
```
docs/archive/
├── README.md (archive index)
├── OBSOLETE_SUMMARY.md
├── OLD_ANALYSIS.md
└── ...
```

## Customization

### Adjust Archival Thresholds

Edit `scripts/maintenance/cleanup-documentation.cjs`:
```javascript
const ARCHIVE_AGE_DAYS = 7; // Change to desired days
```

### Add Permanent Documentation

Edit `scripts/maintenance/cleanup-documentation.cjs`:
```javascript
const PERMANENT_DOCS = [
  // ... existing docs ...
  'YOUR_NEW_GUIDE.md',  // Add here
];
```

### Add Temporary Patterns

Edit `scripts/maintenance/cleanup-documentation.cjs`:
```javascript
const TEMPORARY_PATTERNS = [
  // ... existing patterns ...
  /YOUR_PATTERN/i,  // Add here
];
```

## Monitoring

### Check Documentation Health
```bash
# View current status
npm run docs:analyze

# Output example:
# Total files: 67
#   ✅ Permanent: 41
#   ⏱️  Temporary: 22
#   📊 Status: 4
#   ❓ Uncategorized: 0
#   📦 Archivable: 0
```

### Archive Statistics
```bash
# View archive history
cat docs/archive/README.md

# Shows:
# - Archive dates
# - Reasons for archival
# - Categories
# - Age at archival
```

## Benefits

1. **Fully Automated**: Post-commit hook + weekly GitHub Actions = zero manual work
2. **Enforces Organization**: Pre-commit validation blocks uncategorized docs
3. **Prevents Accumulation**: Automatic archival after 7 days (temporary) / 60 days (status)
4. **Maintains Clarity**: Only relevant docs in active directory
5. **Preserves History**: Archived docs remain accessible in archive/
6. **Configurable**: Disable via `SKIP_DOC_CLEANUP=1` or adjust thresholds
7. **Audit Trail**: GitHub Actions provides cleanup history

## Troubleshooting

**Issue**: Too many docs being archived
- Increase ARCHIVE_AGE_DAYS threshold
- Move important docs to PERMANENT_DOCS

**Issue**: Docs not being archived
- Check doc matches TEMPORARY_PATTERNS
- Verify doc age with `npm run docs:analyze`
- Run cleanup manually: `npm run docs:cleanup`

**Issue**: Pre-commit fails on new doc
- Use recognized naming pattern (e.g., *_ANALYSIS.md)
- OR add to PERMANENT_DOCS if should be kept
- OR add custom pattern to TEMPORARY_PATTERNS

## Scripts Reference

- `scripts/maintenance/cleanup-documentation.cjs` - Main cleanup script
- `scripts/validate/validate-documentation-hygiene.cjs` - Pre-commit validation
- `.husky/pre-commit` - Git hook integration

## Related Documentation

- [Testing Guide](TESTING_GUIDE.md) - Example of permanent doc
- [Test Pollution Known Issues](TEST_POLLUTION_KNOWN_ISSUES.md) - Example of current issue tracking
- Archive README: `docs/archive/README.md` - History of archived docs
