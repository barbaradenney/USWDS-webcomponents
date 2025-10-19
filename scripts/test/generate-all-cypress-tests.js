#!/usr/bin/env node
/**
 * Batch Cypress Test Generator
 *
 * Generates Cypress component tests for all components missing comprehensive coverage.
 * Follows the expansion plan in docs/CYPRESS_TESTING_EXPANSION_PLAN.md
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Component classification from expansion plan
const COMPONENT_GROUPS = {
  'high-priority-interactive': [
    'modal',
    'combo-box',
    'date-picker',
    'header',
    'table',
  ],
  'medium-priority-forms': [
    'checkbox',
    'text-input',
    'textarea',
    'select',
    'file-input',
  ],
  'medium-priority-presentational': [
    'alert',
    'banner',
    'site-alert',
    'card',
    'summary-box',
    'breadcrumb',
    'link',
    'icon',
    'tag',
  ],
  'low-priority-layout': [
    'step-indicator',
    'process-list',
    'collection',
    'list',
    'section',
    'prose',
  ],
};

// Components that already have comprehensive Cypress tests
const COMPONENTS_WITH_TESTS = [
  'accordion',
  'alert',
  'card',
  'character-count',
  'collection',
  'date-range-picker',
  'footer',
  'in-page-navigation',
  'language-selector',
  'pagination',
  'radio',
  'range-slider',
  'section',
  'skip-link',
  'time-picker',
  'tooltip',
];

/**
 * Check if component has comprehensive Cypress test
 */
function hasComprehensiveTest(componentName) {
  const testPath = join(
    PROJECT_ROOT,
    'src',
    'components',
    componentName,
    `usa-${componentName}.component.cy.ts`
  );
  return existsSync(testPath);
}

/**
 * Generate test for a single component
 */
function generateTest(componentName) {
  console.log(`\n📝 Generating Cypress test for: ${componentName}`);

  try {
    const scriptPath = join(PROJECT_ROOT, 'scripts', 'generate-cypress-test.sh');
    execSync(`bash ${scriptPath} ${componentName}`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate test for ${componentName}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const phase = args[0]; // 'interactive', 'forms', 'presentational', 'layout', or 'all'

  console.log('🧪 Cypress Test Generator - Batch Mode\n');

  let componentsToGenerate = [];

  if (phase === 'interactive' || phase === '1') {
    console.log('📋 Phase 1: High-Priority Interactive Components\n');
    componentsToGenerate = COMPONENT_GROUPS['high-priority-interactive'];
  } else if (phase === 'forms' || phase === '2') {
    console.log('📋 Phase 2: Medium-Priority Form Components\n');
    componentsToGenerate = COMPONENT_GROUPS['medium-priority-forms'];
  } else if (phase === 'presentational' || phase === '3') {
    console.log('📋 Phase 3: Medium-Priority Presentational Components\n');
    componentsToGenerate = COMPONENT_GROUPS['medium-priority-presentational'];
  } else if (phase === 'layout' || phase === '4') {
    console.log('📋 Phase 4: Low-Priority Layout Components\n');
    componentsToGenerate = COMPONENT_GROUPS['low-priority-layout'];
  } else if (phase === 'all') {
    console.log('📋 Generating tests for ALL components\n');
    componentsToGenerate = Object.values(COMPONENT_GROUPS).flat();
  } else {
    console.log(`
Usage: node scripts/generate-all-cypress-tests.js <phase>

Phases:
  interactive (1)     - High-priority interactive components (5 components)
  forms (2)          - Medium-priority form components (5 components)
  presentational (3) - Medium-priority presentational components (9 components)
  layout (4)         - Low-priority layout components (6 components)
  all                - Generate tests for all missing components

Examples:
  npm run cypress:test:all interactive
  npm run cypress:test:all forms
  npm run cypress:test:all all
`);
    process.exit(0);
  }

  // Filter out components that already have tests
  const missingTests = componentsToGenerate.filter(
    comp => !hasComprehensiveTest(comp) && !COMPONENTS_WITH_TESTS.includes(comp)
  );

  if (missingTests.length === 0) {
    console.log('✅ All selected components already have Cypress tests!');
    process.exit(0);
  }

  console.log(`Components to generate tests for: ${missingTests.length}`);
  console.log(`Components: ${missingTests.join(', ')}\n`);

  let generated = 0;
  let failed = 0;

  for (const component of missingTests) {
    if (generateTest(component)) {
      generated++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Generation Summary');
  console.log('='.repeat(60));
  console.log(`✅ Successfully generated: ${generated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${generated + failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed to generate. Review errors above.');
    process.exit(1);
  }

  console.log('\n✅ All tests generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Review generated test files');
  console.log('2. Replace TODO comments with component-specific tests');
  console.log('3. Run tests: npm run cypress:component:open');
  console.log('4. Verify all tests pass\n');
}

main();
