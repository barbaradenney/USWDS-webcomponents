#!/usr/bin/env node

/**
 * Remove Skipped Tests That Are Covered in Cypress
 *
 * This script removes all skipped tests that have BROWSER_ENVIRONMENT_REQUIRED
 * reason, since they are all covered in Cypress component tests.
 *
 * Safety:
 * - Runs in dry-run mode by default
 * - Shows exactly what will be deleted
 * - Requires explicit confirmation to proceed
 */

const fs = require('fs');
const path = require('path');

// Batch 2: All remaining BROWSER_ENVIRONMENT_REQUIRED tests
// These are the final 20 skipped tests that have comprehensive Cypress coverage
const FILES_TO_CLEAN = [
  'src/components/character-count/usa-character-count.test.ts',         // 4 skips -> 15 Cypress tests
  'src/components/date-picker/usa-date-picker.test.ts',                // 1 skip  -> 26 Cypress tests
  'src/components/file-input/usa-file-input-behavior.test.ts',         // 1 skip  -> 56 Cypress tests
  'src/components/file-input/usa-file-input.test.ts',                  // 10 skips -> 56 Cypress tests (1720 lines)
  'src/components/modal/usa-modal.test.ts',                            // 1 skip  -> 20 Cypress tests
  'src/components/range-slider/usa-range-slider.test.ts',              // 2 skips -> 9 Cypress tests
  'src/components/table/usa-table-behavior.test.ts',                   // 1 skip  -> 45 Cypress tests
];

const dryRun = !process.argv.includes('--execute');

console.log('🧹 Remove Skipped Tests Covered in Cypress\n');

if (dryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
  console.log('   Run with --execute to actually remove the tests\n');
}

/**
 * Remove skipped tests from a file
 */
function removeSkippedTests(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const result = [];
  let skipTestStart = -1;
  let skipTestEnd = -1;
  let braceDepth = 0;
  let removedCount = 0;
  let inSkipTest = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is a skip test or skip describe block
    if (line.includes('it.skip(') || line.includes('describe.skip(')) {
      skipTestStart = i;
      inSkipTest = true;
      braceDepth = 0;

      // Find TODO comment before the skip (usually 1-3 lines before)
      let todoStart = i;
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        if (lines[j].trim().startsWith('// TODO:')) {
          todoStart = j;
          break;
        }
      }
      skipTestStart = todoStart;
    }

    // Track brace depth
    if (inSkipTest) {
      // Count opening and closing braces
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;

        // If we've closed all braces, this is the end of the test
        if (braceDepth === 0 && char === '}') {
          skipTestEnd = i;
          inSkipTest = false;
          removedCount++;

          // Skip from start to end (inclusive)
          // Don't add these lines to result
          continue;
        }
      }
    }

    // If we're not in a skip test (or past it), add the line
    if (!inSkipTest && (skipTestEnd === -1 || i > skipTestEnd)) {
      result.push(line);
    }
  }

  return { content: result.join('\n'), removedCount };
}

// Process each file
let totalRemoved = 0;
const changes = [];

for (const filePath of FILES_TO_CLEAN) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skip: ${filePath} (not found)`);
    continue;
  }

  const { content, removedCount } = removeSkippedTests(filePath);

  if (removedCount > 0) {
    changes.push({ filePath, removedCount, content });
    totalRemoved += removedCount;
    console.log(`✓ ${filePath}: ${removedCount} test(s) to remove`);
  } else {
    console.log(`  ${filePath}: No skipped tests found`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files to modify: ${changes.length}`);
console.log(`   Tests to remove: ${totalRemoved}`);

if (dryRun) {
  console.log(`\n💡 To execute these changes, run:`);
  console.log(`   node scripts/maintenance/remove-skipped-tests.cjs --execute`);
  process.exit(0);
}

// Execute changes
console.log(`\n✍️  Writing changes...`);

for (const { filePath, content, removedCount } of changes) {
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`   ✓ ${filePath} (removed ${removedCount} test(s))`);
}

console.log(`\n✅ Done! Removed ${totalRemoved} skipped tests from ${changes.length} files`);
console.log(`\n💡 Next steps:`);
console.log(`   1. Review changes: git diff`);
console.log(`   2. Run tests: npm test`);
console.log(`   3. Update APPROVED_SKIPS in scripts/validate/validate-no-skipped-tests.cjs`);
