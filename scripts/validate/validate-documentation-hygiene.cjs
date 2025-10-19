#!/usr/bin/env node

/**
 * Documentation Hygiene Validation
 *
 * Pre-commit validation that warns about documentation accumulation
 * and enforces documentation maintenance policies.
 *
 * Checks:
 * 1. Total doc count (warn if > 50 permanent + temporary docs)
 * 2. Archivable docs (warn if > 10 docs ready for archive)
 * 3. Uncategorized docs (fail if adding new uncategorized docs)
 * 4. Doc naming conventions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { analyzeDocumentation, categorizeDoc } = require('../maintenance/cleanup-documentation.cjs');

const DOCS_DIR = path.join(process.cwd(), 'docs');
const MAX_ACTIVE_DOCS = 50;  // Warn if > 50 active docs
const MAX_ARCHIVABLE = 10;    // Warn if > 10 docs ready for archive

/**
 * Get staged documentation files
 */
function getStagedDocs() {
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    return staged
      .split('\n')
      .filter(f => f.startsWith('docs/') && f.endsWith('.md') && !f.includes('archive/'))
      .map(f => path.basename(f));
  } catch (e) {
    return [];
  }
}

/**
 * Check if doc follows naming conventions
 */
function checkNamingConvention(filename) {
  // Good: SCREAMING_SNAKE_CASE.md
  // Bad: mixedCase.md, lowercase.md
  const pattern = /^[A-Z][A-Z0-9_]*\.md$/;

  if (!pattern.test(filename)) {
    return {
      valid: false,
      message: `Should use SCREAMING_SNAKE_CASE (e.g., MY_GUIDE.md)`
    };
  }

  return { valid: true };
}

/**
 * Main validation
 */
function main() {
  console.log('📚 Validating Documentation Hygiene...\n');

  const analysis = analyzeDocumentation();
  const stagedDocs = getStagedDocs();
  const warnings = [];
  const errors = [];

  // Check 1: Total doc count
  const activeDocs = analysis.permanent + analysis.temporary + analysis.status;
  if (activeDocs > MAX_ACTIVE_DOCS) {
    warnings.push({
      type: 'DOC_ACCUMULATION',
      message: `${activeDocs} active docs (threshold: ${MAX_ACTIVE_DOCS})`,
      suggestion: 'Run: node scripts/maintenance/cleanup-documentation.cjs'
    });
  }

  // Check 2: Archivable docs
  if (analysis.archivable.length > MAX_ARCHIVABLE) {
    warnings.push({
      type: 'ARCHIVABLE_DOCS',
      message: `${analysis.archivable.length} docs ready for archive (threshold: ${MAX_ARCHIVABLE})`,
      suggestion: 'Run: node scripts/maintenance/cleanup-documentation.cjs'
    });
  }

  // Check 3: Uncategorized docs
  if (analysis.uncategorized > 0) {
    const uncategorized = analysis.byCategory.UNCATEGORIZED || [];

    // Check if any staged docs are uncategorized
    const stagedUncategorized = stagedDocs.filter(doc =>
      uncategorized.some(u => u.filename === doc)
    );

    if (stagedUncategorized.length > 0) {
      errors.push({
        type: 'UNCATEGORIZED_DOC',
        files: stagedUncategorized,
        message: 'New documentation files must be categorized',
        suggestion: 'Add to PERMANENT_DOCS or use recognized naming pattern (e.g., *_ANALYSIS.md, *_SUMMARY.md)'
      });
    }

    // Warn about existing uncategorized
    if (uncategorized.length > stagedUncategorized.length) {
      warnings.push({
        type: 'EXISTING_UNCATEGORIZED',
        message: `${uncategorized.length - stagedUncategorized.length} existing uncategorized docs`,
        suggestion: 'Consider categorizing or archiving'
      });
    }
  }

  // Check 4: Naming conventions for staged docs
  stagedDocs.forEach(doc => {
    const check = checkNamingConvention(doc);
    if (!check.valid) {
      warnings.push({
        type: 'NAMING_CONVENTION',
        file: doc,
        message: check.message,
        suggestion: 'Rename to follow SCREAMING_SNAKE_CASE'
      });
    }
  });

  // Report results
  console.log(`📊 Documentation Status:`);
  console.log(`   Total files: ${analysis.total}`);
  console.log(`   Active: ${activeDocs} (${analysis.permanent} permanent, ${analysis.temporary} temporary, ${analysis.status} status)`);
  console.log(`   Archivable: ${analysis.archivable.length}`);
  console.log(`   Uncategorized: ${analysis.uncategorized}`);
  console.log();

  // Report warnings
  if (warnings.length > 0) {
    console.log('⚠️  Documentation Warnings:\n');
    warnings.forEach(warning => {
      console.log(`   ${warning.type}: ${warning.message}`);
      if (warning.file) {
        console.log(`   File: ${warning.file}`);
      }
      if (warning.files) {
        warning.files.forEach(f => console.log(`   File: ${f}`));
      }
      if (warning.suggestion) {
        console.log(`   💡 ${warning.suggestion}`);
      }
      console.log();
    });
  }

  // Report errors
  if (errors.length > 0) {
    console.log('❌ Documentation Policy Violations:\n');
    errors.forEach(error => {
      console.log(`   ${error.type}: ${error.message}`);
      if (error.files) {
        error.files.forEach(f => console.log(`      ${f}`));
      }
      if (error.suggestion) {
        console.log(`   💡 ${error.suggestion}`);
      }
      console.log();
    });

    console.log('📖 Documentation Policy:');
    console.log('   - New docs must be categorized (permanent or temporary)');
    console.log('   - Use SCREAMING_SNAKE_CASE for doc names');
    console.log('   - Run cleanup regularly: npm run docs:cleanup');
    console.log();

    return 1;
  }

  if (warnings.length === 0) {
    console.log('✅ Documentation hygiene is good\n');
  } else {
    console.log(`⚠️  ${warnings.length} warning(s) - consider running cleanup\n`);
    console.log('💡 Run: npm run docs:cleanup --dry-run\n');
  }

  return 0;
}

// Run if called directly
if (require.main === module) {
  try {
    process.exit(main());
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { getStagedDocs, checkNamingConvention };
