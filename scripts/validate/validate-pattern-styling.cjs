#!/usr/bin/env node

/**
 * USWDS Pattern Styling Validator
 *
 * Validates that pattern components use correct USWDS styling classes
 * to match official USWDS pattern specifications.
 *
 * Checks:
 * - Patterns use usa-legend--large for headers
 * - Patterns use usa-fieldset wrappers
 * - Pattern legends are not styled as labels
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PATTERNS_DIR = path.join(__dirname, '../../packages/uswds-wc-patterns/src/patterns');

/**
 * Required USWDS styling patterns for patterns
 */
const STYLING_REQUIREMENTS = {
  'usa-legend--large': {
    description: 'Pattern headers must use usa-legend--large for proper visual hierarchy',
    pattern: /<legend\s+class=["']usa-legend usa-legend--large["']/,
    errorMessage: 'Pattern legend should use both "usa-legend usa-legend--large" classes',
  },
  'usa-fieldset': {
    description: 'Patterns must use usa-fieldset wrapper',
    pattern: /<fieldset\s+class=["']usa-fieldset["']/,
    errorMessage: 'Pattern must wrap content in fieldset with class="usa-fieldset"',
  },
};

/**
 * Anti-patterns to detect (things that indicate wrong styling)
 */
const ANTI_PATTERNS = {
  'legend-without-large': {
    description: 'Legend without --large modifier (looks like label instead of header)',
    pattern: /<legend\s+class=["']usa-legend["'](?![\s\S]*usa-legend--large)/,
    errorMessage: 'Found legend with only "usa-legend" class - missing "usa-legend--large" modifier',
  },
};

/**
 * Get all pattern TypeScript files
 */
function getPatternFiles() {
  const pattern = path.join(PATTERNS_DIR, '**', 'usa-*-pattern.ts');
  return glob.sync(pattern, {
    ignore: ['**/*.test.ts', '**/*.stories.ts', '**/*.cy.ts'],
  });
}

/**
 * Validate a single pattern file
 */
function validatePatternFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const errors = [];
  const warnings = [];

  // Skip if file doesn't have a fieldset (might be a wrapper pattern)
  if (!content.includes('<fieldset')) {
    return { errors, warnings, skipped: true };
  }

  // Check for required styling patterns
  for (const [key, requirement] of Object.entries(STYLING_REQUIREMENTS)) {
    if (!requirement.pattern.test(content)) {
      errors.push({
        file: fileName,
        rule: key,
        message: requirement.errorMessage,
        description: requirement.description,
      });
    }
  }

  // Check for anti-patterns
  for (const [key, antiPattern] of Object.entries(ANTI_PATTERNS)) {
    if (antiPattern.pattern.test(content)) {
      warnings.push({
        file: fileName,
        rule: key,
        message: antiPattern.errorMessage,
        description: antiPattern.description,
      });
    }
  }

  return { errors, warnings, skipped: false };
}

/**
 * Main validation function
 */
function validatePatternStyling() {
  console.log('🎨 Validating USWDS Pattern Styling...\n');

  const patternFiles = getPatternFiles();
  console.log(`Found ${patternFiles.length} pattern files to validate\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let skippedFiles = 0;

  const results = patternFiles.map((filePath) => {
    const result = validatePatternFile(filePath);
    if (result.skipped) {
      skippedFiles++;
    }
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    return { filePath, ...result };
  });

  // Print errors
  const filesWithErrors = results.filter((r) => r.errors.length > 0);
  if (filesWithErrors.length > 0) {
    console.log('❌ ERRORS:\n');
    filesWithErrors.forEach(({ filePath, errors }) => {
      console.log(`  ${path.basename(filePath)}:`);
      errors.forEach((error) => {
        console.log(`    ❌ ${error.rule}: ${error.message}`);
        console.log(`       ${error.description}`);
      });
      console.log('');
    });
  }

  // Print warnings
  const filesWithWarnings = results.filter((r) => r.warnings.length > 0);
  if (filesWithWarnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    filesWithWarnings.forEach(({ filePath, warnings }) => {
      console.log(`  ${path.basename(filePath)}:`);
      warnings.forEach((warning) => {
        console.log(`    ⚠️  ${warning.rule}: ${warning.message}`);
        console.log(`       ${warning.description}`);
      });
      console.log('');
    });
  }

  // Print summary
  console.log('═══════════════════════════════════════════════');
  console.log('SUMMARY:');
  console.log(`  Total files checked: ${patternFiles.length}`);
  console.log(`  Skipped (no fieldset): ${skippedFiles}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Warnings: ${totalWarnings}`);
  console.log('═══════════════════════════════════════════════\n');

  if (totalErrors > 0) {
    console.log('❌ Pattern styling validation FAILED');
    console.log('\nTo fix:');
    console.log('  1. Add "usa-legend--large" to pattern legend classes');
    console.log('  2. Example: <legend class="usa-legend usa-legend--large">${this.label}</legend>');
    console.log('  3. This ensures pattern headers appear as headers, not labels\n');
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log('⚠️  Pattern styling validation completed with warnings');
    console.log('   (Warnings do not fail the build)\n');
  } else {
    console.log('✅ All patterns use correct USWDS styling!\n');
  }

  process.exit(0);
}

// Run validation
if (require.main === module) {
  validatePatternStyling();
}

module.exports = { validatePatternStyling };
