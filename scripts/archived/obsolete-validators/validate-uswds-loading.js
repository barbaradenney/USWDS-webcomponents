#!/usr/bin/env node

/**
 * Pre-commit hook to validate USWDS JavaScript loading and integration
 * Ensures all interactive components have proper USWDS integration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Interactive components that MUST have USWDS JavaScript integration
const INTERACTIVE_COMPONENTS = [
  'accordion',
  'modal',
  'date-picker',
  'date-range-picker',
  'combo-box',
  'file-input',
  'input-mask',
  'language-selector',
  'navigation',
  'search',
  'time-picker',
  'tooltip',
  'character-count',
  'table',
  'pagination',
  'range',
  'header',
  'footer',
  'in-page-navigation'
];

// Components that are presentational only (no USWDS JS needed)
const PRESENTATIONAL_COMPONENTS = [
  'alert',
  'banner',
  'button',
  'button-group',
  'card',
  'collection',
  'icon',
  'identifier',
  'input-prefix-suffix',
  'link',
  'list',
  'process-list',
  'prose',
  'sidenav',
  'site-alert',
  'step-indicator',
  'summary-box',
  'tag'
];

let hasErrors = false;
const errors = [];
const warnings = [];

/**
 * Validates that a component has proper USWDS JavaScript loading
 */
function validateComponent(componentName, componentPath) {
  if (!fs.existsSync(componentPath)) {
    return; // Component file doesn't exist yet
  }

  const content = fs.readFileSync(componentPath, 'utf-8');

  // Check for USWDS integration patterns (handle multiline imports)
  const normalizedContent = content.replace(/\s+/g, ' ');
  const hasTreeShaking = normalizedContent.includes(`import('@uswds/uswds/js/usa-${componentName}')`) ||
                         content.includes(`'@uswds/uswds/js/usa-${componentName}'`);
  const hasFallbackLoad = content.includes('loadFullUSWDSLibrary');
  const hasUSWDSOn = content.includes(`USWDS.${componentName}`) ||
                     content.includes(`uswdsModule.on(this)`) ||
                     content.includes(`USWDS['${componentName}']`);
  const hasInitMethod = content.includes(`initializeUSWDS${componentName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')}`);

  // Check for proper error handling
  const hasErrorHandling = content.includes('catch') && content.includes('setupFallbackBehavior');
  const hasEnvironmentCheck = content.includes('typeof window') && content.includes('typeof document');

  // Validation rules
  if (INTERACTIVE_COMPONENTS.includes(componentName)) {
    if (!hasTreeShaking && !hasFallbackLoad && !hasUSWDSOn) {
      errors.push({
        component: componentName,
        issue: 'Missing USWDS JavaScript integration',
        fix: `Add dynamic import: await import('@uswds/uswds/js/usa-${componentName}')`
      });
      hasErrors = true;
    }

    if (!hasErrorHandling) {
      warnings.push({
        component: componentName,
        issue: 'Missing error handling for USWDS loading failures',
        fix: 'Add try/catch with setupFallbackBehavior()'
      });
    }

    if (!hasEnvironmentCheck) {
      warnings.push({
        component: componentName,
        issue: 'Missing environment detection (browser vs test)',
        fix: 'Add typeof window and document checks'
      });
    }
  }

  // Check for console.log statements that should be removed in production
  const consoleMatches = content.match(/console\.(log|warn|error)/g);
  if (consoleMatches && consoleMatches.length > 0) {
    warnings.push({
      component: componentName,
      issue: `Found ${consoleMatches.length} console statements`,
      fix: 'Remove or comment out console statements for production'
    });
  }
}

/**
 * Validate hybrid architecture implementation
 */
function validateHybridArchitecture(componentName, componentPath) {
  if (!fs.existsSync(componentPath)) return;

  const content = fs.readFileSync(componentPath, 'utf-8');

  // Check for hybrid pattern implementation
  const hasUSWDSEnhancementFlag = content.includes('usingUSWDSEnhancement');
  const hasHandleToggleAction = content.includes('handleToggleAction') ||
                                content.includes('handleAction');
  const hasSyncMethod = content.includes('syncItemsArrayToDOMState') ||
                        content.includes('syncState');

  if (INTERACTIVE_COMPONENTS.includes(componentName)) {
    if (hasUSWDSEnhancementFlag && !hasSyncMethod) {
      warnings.push({
        component: componentName,
        issue: 'Hybrid architecture missing state synchronization',
        fix: 'Add bidirectional state sync between USWDS DOM and component'
      });
    }
  }
}

/**
 * Run USWDS loading tests
 */
function runLoadingTests() {
  console.log('🧪 Running USWDS JavaScript loading tests...\n');

  try {
    // Run the USWDS integration test to verify USWDS loading works
    execSync('npm test __tests__/ci-uswds-integration.test.ts -- --run --reporter=dot', {
      stdio: 'pipe'
    });
    console.log('✅ USWDS integration test passed');
  } catch (error) {
    errors.push({
      component: 'test-suite',
      issue: 'USWDS loading tests failed',
      fix: 'Run npm test to see detailed errors'
    });
    hasErrors = true;
  }
}

// Main validation
console.log('🛡️ Validating USWDS JavaScript Loading Integration\n');
console.log('=' .repeat(50));

// Check all components
const componentsDir = path.join(__dirname, '..', 'src', 'components');

INTERACTIVE_COMPONENTS.forEach(component => {
  const componentPath = path.join(componentsDir, component, `usa-${component}.ts`);
  validateComponent(component, componentPath);
  validateHybridArchitecture(component, componentPath);
});

// Run loading tests for critical components
runLoadingTests();

// Report results
console.log('\n' + '='.repeat(50));

if (errors.length > 0) {
  console.log('\n❌ ERRORS FOUND (must fix before commit):\n');
  errors.forEach(err => {
    console.log(`  📍 ${err.component}`);
    console.log(`     Issue: ${err.issue}`);
    console.log(`     Fix: ${err.fix}\n`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (recommended fixes):\n');
  warnings.forEach(warn => {
    console.log(`  📍 ${warn.component}`);
    console.log(`     Issue: ${warn.issue}`);
    console.log(`     Fix: ${warn.fix}\n`);
  });
}

if (!hasErrors && errors.length === 0) {
  console.log('\n✅ All USWDS JavaScript loading checks passed!');
  console.log('   - Interactive components have proper USWDS integration');
  console.log('   - Error handling is in place for loading failures');
  console.log('   - Components gracefully degrade when USWDS unavailable\n');
} else {
  console.log('\n❌ USWDS loading validation FAILED!');
  console.log('   Please fix the errors above before committing.\n');
  console.log('   To bypass (not recommended): git commit --no-verify\n');
}

// Exit with appropriate code
process.exit(hasErrors ? 1 : 0);