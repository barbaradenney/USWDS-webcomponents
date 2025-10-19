#!/usr/bin/env node

/**
 * Option B (Pure Global Init) Compliance Validator
 *
 * This script validates that all USWDS components follow the mandatory
 * Option B pattern for USWDS JavaScript integration.
 *
 * Run: node scripts/validate-option-b-compliance.js
 * Or: npm run validate:option-b
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Components that use USWDS JavaScript behavior
const USWDS_JS_COMPONENTS = [
  'accordion',
  'combo-box',
  'date-picker',
  'date-range-picker',
  'file-input',
  'header',
  'in-page-navigation',
  'language-selector',
  'modal',
  'pagination',
  'search',
  'time-picker',
  'tooltip',
  'character-count',
];

// Validation results
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

/**
 * Check if component file contains forbidden patterns
 */
function validateComponentFile(componentName) {
  const componentPath = path.join(
    __dirname,
    '../src/components',
    componentName,
    `usa-${componentName}.ts`
  );

  if (!fs.existsSync(componentPath)) {
    results.warnings.push(`⚠️  Component file not found: ${componentPath}`);
    return;
  }

  const content = fs.readFileSync(componentPath, 'utf-8');
  const violations = [];

  // Check 1: No component-level USWDS imports (except types)
  const uswdsImportRegex = /import\s+(?!type).*from\s+['"]@uswds\/uswds\/js\//g;
  if (uswdsImportRegex.test(content)) {
    violations.push('❌ Component imports USWDS JavaScript (should use global init)');
  }

  // Check 2: No .init() calls in component code
  const initCallRegex = /\.init\(|module\.default\.init\(/g;
  if (initCallRegex.test(content)) {
    violations.push('❌ Component calls .init() (should rely on global init)');
  }

  // Check 3: No initializeUSWDS() method
  const initMethodRegex = /initializeUSWDS|async\s+initializeUSWDS/g;
  if (initMethodRegex.test(content)) {
    violations.push('❌ Component has initializeUSWDS() method (should be removed)');
  }

  // Check 4: Should extend USWDSBaseComponent (directly or via mixin)
  const extendsRegex = /extends\s+(?:IframeEventDelegationMixin\()?USWDSBaseComponent/;
  if (!extendsRegex.test(content)) {
    violations.push('⚠️  Component should extend USWDSBaseComponent');
  }

  // Check 5: Should have createRenderRoot returning this (light DOM)
  const lightDOMRegex = /createRenderRoot\(\)[\s\S]*?return\s+this(?:\s+as\s+any)?;/;
  if (!lightDOMRegex.test(content)) {
    violations.push('⚠️  Component should use light DOM (createRenderRoot returning this)');
  }

  // Check 6: Should have shouldUpdate protection
  const shouldUpdateRegex = /shouldUpdate\(/;
  if (!shouldUpdateRegex.test(content)) {
    results.warnings.push(
      `⚠️  ${componentName}: Missing shouldUpdate() protection for USWDS transformations`
    );
  }

  // Check 7: Should have syncStateToUSWDS for property syncing
  const syncRegex = /syncStateToUSWDS/;
  if (!syncRegex.test(content)) {
    results.warnings.push(
      `⚠️  ${componentName}: Missing syncStateToUSWDS() for property syncing`
    );
  }

  // Check 8: Should have ARCHITECTURE comment
  const architectureRegex = /ARCHITECTURE:\s*Option\s+B\s*\(Pure\s+Global\s+Init\)/i;
  if (!architectureRegex.test(content)) {
    violations.push('⚠️  Missing ARCHITECTURE: Option B comment in JSDoc');
  }

  if (violations.length > 0) {
    results.failed.push({
      component: componentName,
      violations,
    });
  } else {
    results.passed.push(componentName);
  }
}

/**
 * Check global initialization in Storybook
 */
function validateStorybookGlobalInit() {
  const previewHeadPath = path.join(__dirname, '../.storybook/preview-head.html');

  if (!fs.existsSync(previewHeadPath)) {
    results.failed.push({
      component: 'Storybook (preview-head.html)',
      violations: ['❌ File not found'],
    });
    return;
  }

  const content = fs.readFileSync(previewHeadPath, 'utf-8');
  const violations = [];

  // Check 1: Has module mapping
  if (!content.includes('window.__USWDS_MODULES__')) {
    violations.push('❌ Missing window.__USWDS_MODULES__ initialization');
  }

  // Check 2: Has ready flag
  if (!content.includes('window.__USWDS_READY__')) {
    violations.push('❌ Missing window.__USWDS_READY__ flag');
  }

  // Check 3: Uses .on() not .init()
  USWDS_JS_COMPONENTS.forEach((component) => {
    const componentKey = component.replace('-', '-'); // keep as-is
    const onCallRegex = new RegExp(`__USWDS_MODULES__\\['${componentKey}'\\]\\?\\.on\\(`, 'g');
    const initCallRegex = new RegExp(`__USWDS_MODULES__\\['${componentKey}'\\]\\?\\.init\\(`, 'g');

    if (initCallRegex.test(content) && !onCallRegex.test(content)) {
      violations.push(`❌ ${component}: Uses .init() instead of .on() for event delegation`);
    }
  });

  // Check 4: Has module pre-loading
  if (!content.includes('moduleMapping')) {
    violations.push('❌ Missing moduleMapping for Vite pre-bundled modules');
  }

  if (violations.length > 0) {
    results.failed.push({
      component: 'Storybook (preview-head.html)',
      violations,
    });
  } else {
    results.passed.push('Storybook global init');
  }
}

/**
 * Check decorator implementation
 */
function validateStorybookDecorator() {
  const previewPath = path.join(__dirname, '../.storybook/preview.ts');

  if (!fs.existsSync(previewPath)) {
    results.warnings.push('⚠️  .storybook/preview.ts not found');
    return;
  }

  const content = fs.readFileSync(previewPath, 'utf-8');
  const violations = [];

  // Check 1: Decorator waits for __USWDS_READY__
  if (!content.includes('__USWDS_READY__')) {
    violations.push('❌ Decorator should check window.__USWDS_READY__ flag');
  }

  // Check 2: Has retry logic
  if (!content.includes('setTimeout(initializeComponents')) {
    violations.push('⚠️  Decorator should retry if USWDS not ready');
  }

  if (violations.length > 0) {
    results.failed.push({
      component: 'Storybook (preview.ts decorator)',
      violations,
    });
  } else {
    results.passed.push('Storybook decorator');
  }
}

/**
 * Generate compliance report
 */
function generateReport() {
  console.log('\n' + colors.cyan + '═'.repeat(80) + colors.reset);
  console.log(
    colors.cyan +
      '  Option B (Pure Global Init) Compliance Validation' +
      colors.reset
  );
  console.log(colors.cyan + '═'.repeat(80) + colors.reset + '\n');

  // Passed components
  if (results.passed.length > 0) {
    console.log(colors.green + '✅ PASSED (' + results.passed.length + '):' + colors.reset);
    results.passed.forEach((component) => {
      console.log(`   ${colors.green}✓${colors.reset} ${component}`);
    });
    console.log('');
  }

  // Failed components
  if (results.failed.length > 0) {
    console.log(colors.red + '❌ FAILED (' + results.failed.length + '):' + colors.reset);
    results.failed.forEach(({ component, violations }) => {
      console.log(`\n   ${colors.red}✗ ${component}${colors.reset}`);
      violations.forEach((violation) => {
        console.log(`     ${violation}`);
      });
    });
    console.log('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(colors.yellow + '⚠️  WARNINGS (' + results.warnings.length + '):' + colors.reset);
    results.warnings.forEach((warning) => {
      console.log(`   ${warning}`);
    });
    console.log('');
  }

  // Summary
  console.log(colors.cyan + '─'.repeat(80) + colors.reset);
  console.log(colors.cyan + 'SUMMARY:' + colors.reset);
  console.log(`  ${colors.green}Passed:${colors.reset} ${results.passed.length}`);
  console.log(`  ${colors.red}Failed:${colors.reset} ${results.failed.length}`);
  console.log(`  ${colors.yellow}Warnings:${colors.reset} ${results.warnings.length}`);
  console.log(colors.cyan + '─'.repeat(80) + colors.reset + '\n');

  // Exit code
  if (results.failed.length > 0) {
    console.log(
      colors.red +
        '❌ Compliance validation FAILED. Fix violations before committing.' +
        colors.reset + '\n'
    );
    console.log(
      colors.blue +
        '📖 See docs/OPTION_B_PURE_GLOBAL_INIT.md for pattern requirements' +
        colors.reset + '\n'
    );
    process.exit(1);
  } else {
    console.log(
      colors.green +
        '✅ All components comply with Option B (Pure Global Init) pattern!' +
        colors.reset + '\n'
    );
    process.exit(0);
  }
}

/**
 * Main execution
 */
function main() {
  console.log(colors.blue + '\n🔍 Validating Option B compliance...\n' + colors.reset);

  // Validate Storybook global init
  validateStorybookGlobalInit();
  validateStorybookDecorator();

  // Validate each component
  USWDS_JS_COMPONENTS.forEach((componentName) => {
    validateComponentFile(componentName);
  });

  // Generate report
  generateReport();
}

// Run validation
main();
