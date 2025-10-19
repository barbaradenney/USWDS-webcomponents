#!/usr/bin/env node

/**
 * Validates that all interactive USWDS components are properly initializing USWDS JavaScript
 *
 * This script checks for the presence of:
 * 1. firstUpdated() method
 * 2. initializeUSWDS*() method call
 * 3. Proper use of initializeUSWDSComponent loader utility
 */

const fs = require('fs');
const path = require('path');

// Interactive components that REQUIRE USWDS JavaScript initialization
const INTERACTIVE_COMPONENTS = [
  'accordion',
  'character-count',
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
  'tooltip'
];

// Components that DON'T need USWDS JavaScript (presentational only)
const PRESENTATIONAL_COMPONENTS = [
  'alert',
  'breadcrumb',
  'button',
  'button-group',
  'card',
  'collection',
  'footer',
  'form',
  'icon',
  'identifier',
  'process-list',
  'select',
  'side-navigation',
  'skip-link',
  'step-indicator',
  'summary-box',
  'table',
  'tag',
  'text-input',
  'textarea'
];

function checkComponentInitialization(componentName) {
  const componentPath = path.join(__dirname, '..', 'src', 'components', componentName, `usa-${componentName}.ts`);

  if (!fs.existsSync(componentPath)) {
    return {
      name: componentName,
      exists: false,
      hasFirstUpdated: false,
      hasInitMethod: false,
      usesLoader: false,
      callsInitInFirstUpdated: false,
      issues: ['Component file not found']
    };
  }

  const content = fs.readFileSync(componentPath, 'utf-8');

  // Check for firstUpdated method
  const hasFirstUpdated = /override\s+firstUpdated\s*\([^)]*\)/.test(content);

  // Check for initializeUSWDS* method
  const initMethodMatch = content.match(/private\s+async\s+initializeUSWDS\w+\s*\(/);
  const hasInitMethod = !!initMethodMatch;

  // Check for using the loader utility
  const usesLoader = content.includes('initializeUSWDSComponent') &&
                     content.includes("import('../../utils/uswds-loader.js')");

  // Check if firstUpdated calls the init method
  const firstUpdatedBlock = content.match(/override\s+firstUpdated\s*\([^)]*\)\s*\{[^}]*\}/s);
  const callsInitInFirstUpdated = firstUpdatedBlock ?
    /this\.initializeUSWDS\w+\s*\(/.test(firstUpdatedBlock[0]) : false;

  // Identify issues
  const issues = [];
  if (!hasFirstUpdated) {
    issues.push('Missing firstUpdated() method');
  }
  if (!hasInitMethod) {
    issues.push('Missing initializeUSWDS*() method');
  }
  if (!usesLoader) {
    issues.push('Not using standardized uswds-loader utility');
  }
  if (hasFirstUpdated && !callsInitInFirstUpdated) {
    issues.push('firstUpdated() does not call initialization method');
  }

  return {
    name: componentName,
    exists: true,
    hasFirstUpdated,
    hasInitMethod,
    usesLoader,
    callsInitInFirstUpdated,
    issues: issues.length > 0 ? issues : ['All checks passed']
  };
}

console.log('🔍 USWDS Initialization Validation Report\n');
console.log('=' .repeat(80));
console.log('\n📊 Checking Interactive Components (MUST have USWDS initialization):\n');

const results = [];
let passCount = 0;
let failCount = 0;

INTERACTIVE_COMPONENTS.forEach(componentName => {
  const result = checkComponentInitialization(componentName);
  results.push(result);

  const allChecksPassed = result.exists &&
                          result.hasFirstUpdated &&
                          result.hasInitMethod &&
                          result.usesLoader &&
                          result.callsInitInFirstUpdated;

  if (allChecksPassed) {
    passCount++;
    console.log(`✅ ${componentName.padEnd(25)} - PASS`);
  } else {
    failCount++;
    console.log(`❌ ${componentName.padEnd(25)} - FAIL`);
    result.issues.forEach(issue => {
      console.log(`   └─ ${issue}`);
    });
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n📈 Summary:\n');
console.log(`Total Interactive Components: ${INTERACTIVE_COMPONENTS.length}`);
console.log(`✅ Properly Initialized: ${passCount}`);
console.log(`❌ Missing/Incorrect Init: ${failCount}`);
console.log(`📊 Success Rate: ${Math.round((passCount / INTERACTIVE_COMPONENTS.length) * 100)}%`);

if (failCount > 0) {
  console.log('\n⚠️  Components with issues need to be fixed to ensure proper USWDS JavaScript functionality.');
  console.log('\n📋 Required pattern for interactive components:');
  console.log(`
  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.initializeUSWDS[ComponentName]();
  }

  private async initializeUSWDS[ComponentName]() {
    try {
      const { initializeUSWDSComponent } = await import('../../utils/uswds-loader.js');
      await this.updateComplete;

      const element = this.querySelector('.usa-[component-class]');
      if (!element) return;

      this.uswdsModule = await initializeUSWDSComponent(element, '[component-name]');
    } catch (error) {
      console.warn('USWDS integration failed:', error);
    }
  }
  `);
}

console.log('\n' + '='.repeat(80));
console.log('\n📝 Presentational Components (No USWDS JS required):\n');
console.log(PRESENTATIONAL_COMPONENTS.join(', '));

console.log('\n' + '='.repeat(80));

// Exit with error code if any components failed
process.exit(failCount > 0 ? 1 : 0);
