# Script Organization Guide

This document outlines the script organization standards for this repository.

## Directory Structure

```
scripts/
├── archived/               # Completed one-off scripts (preserved for reference)
│   ├── one-off-fixes/     # One-time fix/migration scripts
│   └── obsolete-validators/ # Replaced/outdated validators
├── ci/                    # CI/CD scripts
├── generate/              # Code generation tools
├── maintenance/           # Ongoing maintenance scripts
├── test/                  # Test utilities and runners
└── validate/              # Validation and compliance scripts
```

## Active vs Archived Scripts

### Active Directories

Scripts in these directories should be **actively used** in development workflows:

- **`scripts/validate/`** - Validators that run in pre-commit hooks or CI
- **`scripts/maintenance/`** - Ongoing maintenance tools
- **`scripts/test/`** - Test orchestration and utilities
- **`scripts/ci/`** - CI/CD pipeline scripts
- **`scripts/generate/`** - Code generation tools

### Archived Directory

Scripts should be **moved to `scripts/archived/`** when:

1. **One-time fixes are completed**
   - Migration scripts (e.g., `migrate-to-option-b.cjs`)
   - Component fixes (e.g., `fix-modal-initialization.js`)
   - Bulk updates (e.g., `apply-uswds-fixes.sh`)

2. **Validators are superseded**
   - Replaced by more comprehensive validators
   - No longer part of validation pipeline
   - Outdated patterns/approaches

3. **Analysis/audits are completed**
   - One-time component audits
   - Investigation/diagnostic scripts
   - Temporary debugging tools

## Naming Conventions

Scripts are automatically flagged for archival if they match these patterns:

### One-off Script Patterns (should be archived after completion)

- `fix-*` - One-time fixes
- `apply-*` - Application/migration tasks
- `add-*` - Setup/addition tasks (unless generators)
- `cleanup-*` - One-time cleanup tasks
- `migrate-*` - Migration scripts
- `audit-*` - One-time audit scripts
- `analyze-*` - One-time analysis scripts
- `investigate-*` - Investigation/debugging scripts
- `diagnose-*` - Diagnostic scripts
- `manual-*` - Manual intervention scripts

### Active Script Patterns (can stay in active directories)

- `validate-*` - Validators used in pre-commit/CI
- `generate-*` - Code generation tools
- `monitor-*` - Ongoing monitoring tools
- `test-*` - Test utilities (unless `test-*-fix.js`)

## Pre-commit Validation

The **script organization validator** runs automatically on every commit:

```bash
# Runs as part of pre-commit hook
node scripts/validate/validate-script-organization.js
```

**What it checks:**
1. Scans active directories for scripts matching one-off patterns
2. Checks script content for one-time use indicators
3. Fails commit if unarchived one-off scripts are detected

**Manual run:**
```bash
npm run validate:script-organization
```

## Exceptions

Some scripts are **explicitly allowed** in active directories despite matching patterns:

- `cleanup-validator.cjs` - Active pre-commit validator
- `cleanup-test-processes.js` - Active test cleanup utility
- `validate-script-organization.js` - This validator itself
- `analyze-testing-gaps.js` - Ongoing analysis tool

To add exceptions, update `ONE_OFF_PATTERNS.exceptions` in `validate-script-organization.js`.

## Moving Scripts to Archive

### Step 1: Verify script is completed
```bash
# Check if script is still referenced in package.json
grep "script-name" package.json

# Check if script is used in .husky/ hooks
grep -r "script-name" .husky/
```

### Step 2: Move to archive
```bash
# For one-off fixes
git mv scripts/validate/fix-something.js scripts/archived/one-off-fixes/

# For obsolete validators
git mv scripts/validate/validate-old-pattern.js scripts/archived/obsolete-validators/
```

### Step 3: Update package.json
```json
// Replace:
"old:command": "node scripts/validate/old-script.js",

// With helpful message:
"old:command": "echo 'Archived - use npm run new:command instead'",

// Or remove entirely if no replacement exists
```

### Step 4: Verify and commit
```bash
# Run validator to confirm
npm run validate:script-organization

# Commit changes
git add -A
git commit -m "chore: archive completed one-off script"
```

## Benefits

### Repository Cleanliness
- Active directories contain only relevant scripts
- Easy to identify which scripts are currently used
- Reduces cognitive load when navigating scripts/

### Preserved History
- Archived scripts remain accessible for reference
- Git history preserved for all scripts
- Documentation of past fixes/migrations

### Automated Enforcement
- Pre-commit hook prevents script accumulation
- Catches new one-off scripts before they're committed
- Maintains organization without manual oversight

## Script Consolidation History

**October 2025**: Major script consolidation
- Reduced total scripts from 224 → 152 (32% reduction)
- Validation scripts: 69 → 44 (36% reduction)
- Maintenance scripts: 54 → 22 (59% reduction)
- Archived: 55 completed one-off scripts

See commit `edd3288d` for full consolidation details.

## Best Practices

1. **Name scripts clearly** - Use descriptive names indicating purpose
2. **Document one-off scripts** - Include "one-time" or completion criteria in header
3. **Move promptly** - Archive scripts immediately after completion
4. **Update references** - Always update package.json when archiving
5. **Preserve history** - Use `git mv` to maintain file history

## Troubleshooting

### Pre-commit fails with "One-off scripts detected"

**Run the validator to see which scripts:**
```bash
node scripts/validate/validate-script-organization.js
```

**Output shows:**
- Which scripts are flagged
- Why they're flagged (name pattern or content)
- Suggested action (archive or review)

**Fix:**
1. Review each flagged script
2. If completed, move to `scripts/archived/one-off-fixes/`
3. Update package.json if referenced
4. Re-run validator to confirm

### False positive - script should stay active

**Add to exceptions list:**
```javascript
// In scripts/validate/validate-script-organization.js
exceptions: [
  'your-script-name.js',  // Brief reason why it should stay
],
```

Commit the exception with justification in commit message.

## Related Documentation

- `docs/DEBUGGING_GUIDE.md` - Debugging workflows
- `.husky/pre-commit` - Pre-commit hook implementation
- `scripts/ci/cleanup-validator.cjs` - File organization validator
