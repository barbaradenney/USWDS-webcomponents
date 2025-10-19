#!/usr/bin/env node

/**
 * Pre-commit Validation: Layout Forcing Pattern
 *
 * CRITICAL: Prevents removal of layout forcing fixes that solve the
 * zero BoundingClientRect issue after Storybook navigation.
 *
 * This validation runs automatically before every commit to ensure:
 * 1. Storybook decorator has forceLayoutRecalculation()
 * 2. Components with show/hide behavior use void offsetHeight pattern
 *
 * @see docs/guides/STORYBOOK_GUIDE.md#layout-forcing-pattern
 * @see docs/DEBUGGING_GUIDE.md - "Storybook Navigation: Zero BoundingClientRect Issue"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

// Exit codes
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

/**
 * Validation results tracker
 */
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Add passing validation
 */
function pass(message) {
  results.passed.push(message);
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

/**
 * Add failing validation
 */
function fail(message) {
  results.failed.push(message);
  console.error(`${colors.red}✗${colors.reset} ${message}`);
}

/**
 * Add warning
 */
function warn(message) {
  results.warnings.push(message);
  console.warn(`${colors.yellow}⚠${colors.reset} ${message}`);
}

/**
 * Print section header
 */
function section(title) {
  console.log(`\n${colors.bold}${colors.blue}${title}${colors.reset}`);
}

/**
 * Validate Storybook decorator has forceLayoutRecalculation
 */
function validateStorybookDecorator() {
  section('Validating Storybook Decorator (.storybook/preview.ts)');

  const previewPath = path.join(rootDir, '.storybook', 'preview.ts');

  if (!fs.existsSync(previewPath)) {
    fail('Storybook preview.ts not found');
    return false;
  }

  const content = fs.readFileSync(previewPath, 'utf-8');

  // Check for forceLayoutRecalculation function
  if (!content.includes('forceLayoutRecalculation')) {
    fail('forceLayoutRecalculation() function missing from .storybook/preview.ts');
    fail('This function is CRITICAL for fixing zero BoundingClientRect after navigation');
    return false;
  }

  pass('forceLayoutRecalculation() function exists');

  // Check function implementation
  if (!content.includes('void storybookRoot.offsetHeight')) {
    fail('forceLayoutRecalculation() missing "void storybookRoot.offsetHeight" pattern');
    fail('Layout forcing requires reading offsetHeight to trigger reflow');
    return false;
  }

  pass('forceLayoutRecalculation() has correct offsetHeight pattern');

  // Check decorator calls forceLayoutRecalculation
  if (!content.includes('forceLayoutRecalculation()')) {
    fail('Decorator does not call forceLayoutRecalculation()');
    fail('Layout forcing must be called in decorator for every story render');
    return false;
  }

  pass('Decorator calls forceLayoutRecalculation()');

  return true;
}

/**
 * Validate component behavior files have layout forcing
 */
function validateComponentBehaviors() {
  section('Validating Component Behavior Files');

  // Components that MUST have layout forcing
  const componentsWithShowHide = [
    'accordion', // ✅ Implemented and validated
    // Future components to validate when implemented:
    // 'modal',
    // 'combo-box',
    // 'date-picker',
    // 'tooltip',
  ];

  let allValid = true;

  for (const component of componentsWithShowHide) {
    const behaviorPath = path.join(
      rootDir,
      'src',
      'components',
      component,
      `usa-${component}-behavior.ts`
    );

    if (!fs.existsSync(behaviorPath)) {
      warn(`${component}: behavior file not found (may not be implemented yet)`);
      continue;
    }

    const content = fs.readFileSync(behaviorPath, 'utf-8');

    // Check for void offsetHeight pattern
    if (!content.includes('void') || !content.includes('offsetHeight')) {
      fail(`${component}: Missing "void element.offsetHeight" layout forcing pattern`);
      fail(`  File: ${behaviorPath}`);
      fail(`  Required pattern: void controls.offsetHeight; // Force reflow`);
      allValid = false;
      continue;
    }

    pass(`${component}: Has layout forcing pattern (void offsetHeight)`);
  }

  return allValid;
}

/**
 * Validate documentation exists
 */
function validateDocumentation() {
  section('Validating Documentation');

  const docs = [
    {
      path: 'docs/guides/STORYBOOK_GUIDE.md#layout-forcing-pattern',
      description: 'Layout forcing pattern documentation',
    },
    {
      path: 'docs/DEBUGGING_GUIDE.md',
      description: 'Debugging guide (should include Storybook navigation section)',
      contentCheck: 'Zero BoundingClientRect',
    },
  ];

  let allValid = true;

  for (const doc of docs) {
    // Strip anchor from path for file existence check
    const pathWithoutAnchor = doc.path.split('#')[0];
    const fullPath = path.join(rootDir, pathWithoutAnchor);

    if (!fs.existsSync(fullPath)) {
      fail(`Documentation missing: ${doc.description}`);
      fail(`  Expected: ${doc.path}`);
      allValid = false;
      continue;
    }

    if (doc.contentCheck) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (!content.includes(doc.contentCheck)) {
        warn(`${doc.description} may be incomplete (missing "${doc.contentCheck}")`);
      }
    }

    pass(`Documentation exists: ${doc.description}`);
  }

  return allValid;
}

/**
 * Validate regression tests exist
 */
function validateRegressionTests() {
  section('Validating Regression Tests');

  const testPath = path.join(rootDir, 'cypress', 'e2e', 'storybook-navigation-regression.cy.ts');

  if (!fs.existsSync(testPath)) {
    fail('Regression test file missing: cypress/e2e/storybook-navigation-regression.cy.ts');
    fail('This test is CRITICAL for preventing layout forcing regression');
    return false;
  }

  pass('Regression test file exists');

  const content = fs.readFileSync(testPath, 'utf-8');

  // Check for critical test case
  if (!content.includes('should work after navigating from another component')) {
    fail('Regression test missing critical navigation test case');
    return false;
  }

  pass('Regression test includes navigation test case');

  // Check for BoundingClientRect validation
  if (!content.includes('getBoundingClientRect')) {
    warn('Regression test may not validate BoundingClientRect dimensions');
  } else {
    pass('Regression test validates BoundingClientRect dimensions');
  }

  return true;
}

/**
 * Main validation
 */
function main() {
  console.log(`${colors.bold}Layout Forcing Pattern Validation${colors.reset}`);
  console.log('Ensuring critical Storybook navigation fixes are present\n');

  const storybookValid = validateStorybookDecorator();
  const behaviorsValid = validateComponentBehaviors();
  const docsValid = validateDocumentation();
  const testsValid = validateRegressionTests();

  // Summary
  section('Validation Summary');
  console.log(`Passed: ${colors.green}${results.passed.length}${colors.reset}`);
  console.log(`Failed: ${colors.red}${results.failed.length}${colors.reset}`);
  console.log(`Warnings: ${colors.yellow}${results.warnings.length}${colors.reset}`);

  if (results.failed.length > 0) {
    console.error(`\n${colors.red}${colors.bold}VALIDATION FAILED${colors.reset}`);
    console.error(`\n${colors.red}Critical layout forcing patterns are missing.${colors.reset}`);
    console.error(
      `${colors.red}This will cause zero BoundingClientRect issues after Storybook navigation.${colors.reset}`
    );
    console.error(`\n${colors.yellow}See documentation:${colors.reset}`);
    console.error(`  - docs/guides/STORYBOOK_GUIDE.md#layout-forcing-pattern`);
    console.error(`  - docs/DEBUGGING_GUIDE.md (Storybook Navigation section)`);
    return EXIT_FAILURE;
  }

  if (results.warnings.length > 0) {
    console.warn(`\n${colors.yellow}Validation passed with warnings.${colors.reset}`);
    console.warn(`${colors.yellow}Review warnings above for potential issues.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}${colors.bold}✓ All validations passed${colors.reset}`);
  }

  return EXIT_SUCCESS;
}

// Run validation
process.exit(main());
