#!/usr/bin/env node

/**
 * Component Interaction Validation for Pre-commit Hooks
 *
 * This script validates that components don't have accordion-like issues
 * and runs fast interaction checks suitable for pre-commit hooks.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Quick validation checks that can run in pre-commit (fast)
async function validateComponentInteractions() {
  console.log('🎯 Component Interaction Validation');
  console.log('==================================');

  let hasErrors = false;
  const errors = [];
  const warnings = [];

  // 1. Check for known problematic patterns
  console.log('🔍 Checking for accordion-like event handler conflicts...');
  const conflictResults = await checkEventHandlerConflicts();
  if (conflictResults.errors.length > 0) {
    hasErrors = true;
    errors.push(...conflictResults.errors);
  }
  warnings.push(...conflictResults.warnings);

  // 2. Validate USWDS integration patterns
  console.log('🔧 Validating USWDS integration patterns...');
  const integrationResults = await validateUSWDSIntegrationPatterns();
  if (integrationResults.errors.length > 0) {
    hasErrors = true;
    errors.push(...integrationResults.errors);
  }
  warnings.push(...integrationResults.warnings);

  // 3. Check for missing interaction tests
  console.log('🧪 Checking interaction test coverage...');
  const testResults = await checkInteractionTestCoverage();
  warnings.push(...testResults.warnings);

  // 4. Quick unit test validation for interaction tests
  console.log('⚡ Running quick interaction test validation...');
  const quickTestResults = await runQuickInteractionTests();
  if (quickTestResults.errors.length > 0) {
    hasErrors = true;
    errors.push(...quickTestResults.errors);
  }

  // Report results
  console.log('\\n📊 Validation Results');
  console.log('=====================');

  if (errors.length > 0) {
    console.log(`❌ Errors: ${errors.length}`);
    errors.forEach(error => console.log(`   • ${error}`));
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Warnings: ${warnings.length}`);
    warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  if (!hasErrors && warnings.length === 0) {
    console.log('✅ All interaction validations passed!');
  } else if (!hasErrors) {
    console.log('✅ No critical errors found (warnings can be addressed later)');
  }

  return hasErrors ? 1 : 0;
}

async function checkEventHandlerConflicts() {
  const errors = [];
  const warnings = [];
  const componentsDir = path.join(projectRoot, 'src/components');

  // Components that are known to be problematic and should block commits
  const criticalComponents = ['accordion', 'modal', 'date-picker', 'combo-box'];

  // Components that are interactive but can be addressed gradually
  const interactiveComponents = [
    'file-input', 'header', 'language-selector', 'menu', 'pagination',
    'search', 'time-picker', 'tooltip'
  ];

  // Get all component files
  const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const componentName of componentDirs) {
    const componentFile = path.join(componentsDir, componentName, `usa-${componentName}.ts`);
    if (!fs.existsSync(componentFile)) continue;

    const content = fs.readFileSync(componentFile, 'utf8');

    // Check for the specific pattern that caused accordion issues
    const hasClickHandlers = content.includes('@click');
    const hasUSWDSImport = content.includes('@uswds/uswds/js/') || content.includes('uswds-loader');
    const hasPreloadedCheck = content.includes('__USWDS_MODULES__');
    const hasStandardizedLoader = content.includes('initializeUSWDSComponent');

    // Critical blocking errors for components we know cause serious issues
    if (hasClickHandlers && hasUSWDSImport && !hasPreloadedCheck && !hasStandardizedLoader) {
      if (criticalComponents.includes(componentName)) {
        errors.push(`${componentName}: CRITICAL - Event handler conflict blocks functionality (accordion-like issue)`);
      } else if (interactiveComponents.includes(componentName)) {
        warnings.push(`${componentName}: Event handler conflict risk - should migrate to standardized pattern`);
      } else {
        warnings.push(`${componentName}: Should use standardized USWDS loader pattern`);
      }
    }

    // High-risk patterns that definitely need fixing
    if (content.includes('@click') && content.includes('toggleButton') && !hasStandardizedLoader) {
      if (criticalComponents.includes(componentName)) {
        errors.push(`${componentName}: CRITICAL - Toggle pattern conflict blocks functionality`);
      } else {
        warnings.push(`${componentName}: High conflict risk - toggle pattern without USWDS integration`);
      }
    }

    // Check for missing USWDS integration on interactive components
    if (interactiveComponents.includes(componentName) && !hasUSWDSImport) {
      warnings.push(`${componentName}: Missing USWDS JavaScript integration - should use loadUSWDSModule()`);
    }
  }

  return { errors, warnings };
}

async function validateUSWDSIntegrationPatterns() {
  const errors = [];
  const warnings = [];

  // Check that critical USWDS configuration files are properly maintained
  const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
  const storybookConfigPath = path.join(projectRoot, '.storybook/main.ts');
  const previewHeadPath = path.join(projectRoot, '.storybook/preview-head.html');

  // Validate vite.config.ts has USWDS modules
  if (!fs.existsSync(viteConfigPath)) {
    errors.push('Missing vite.config.ts file');
  } else {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    if (!viteConfig.includes('@uswds/uswds/js/usa-accordion')) {
      errors.push('vite.config.ts missing USWDS accordion module in optimizeDeps');
    }
  }

  // Validate Storybook configuration
  if (!fs.existsSync(storybookConfigPath)) {
    errors.push('Missing .storybook/main.ts file');
  } else {
    const storybookConfig = fs.readFileSync(storybookConfigPath, 'utf8');
    if (!storybookConfig.includes('optimizeDeps.include.push')) {
      errors.push('Storybook main.ts missing USWDS optimizeDeps configuration');
    }
  }

  // Validate preview-head.html
  if (!fs.existsSync(previewHeadPath)) {
    errors.push('Missing .storybook/preview-head.html file');
  } else {
    const previewHead = fs.readFileSync(previewHeadPath, 'utf8');
    if (!previewHead.includes('__USWDS_MODULES__')) {
      errors.push('Storybook preview-head.html missing USWDS module pre-loading');
    }
  }

  return { errors, warnings };
}

async function checkInteractionTestCoverage() {
  const warnings = [];
  const componentsDir = path.join(projectRoot, 'src/components');
  const testsDir = path.join(projectRoot, '__tests__');

  // Interactive components that should have interaction tests
  const interactiveComponents = [
    'accordion', 'banner', 'combo-box', 'date-picker', 'date-range-picker',
    'file-input', 'footer', 'header', 'in-page-navigation', 'language-selector',
    'menu', 'modal', 'pagination', 'search', 'step-indicator', 'table',
    'time-picker', 'tooltip', 'character-count'
  ];

  for (const componentName of interactiveComponents) {
    const interactionTestFile = path.join(testsDir, `${componentName}-interaction.test.ts`);
    if (!fs.existsSync(interactionTestFile)) {
      warnings.push(`${componentName}: Missing interaction tests - run 'npm run migrate:component -- --component=${componentName} --generate-tests'`);
    }
  }

  return { warnings };
}

async function runQuickInteractionTests() {
  const errors = [];

  try {
    // Only run the accordion interaction test as a quick validation
    // (other tests would take too long for pre-commit)
    const { execSync } = await import('child_process');

    console.log('   ⚡ Running accordion interaction test...');
    execSync('npm run test:accordion:interaction -- --run', {
      stdio: 'pipe',
      cwd: projectRoot
    });

    console.log('   ✅ Accordion interaction test passed');
  } catch (error) {
    errors.push('Accordion interaction test failed - this indicates a regression in interaction functionality');
  }

  return { errors };
}

async function main() {
  const exitCode = await validateComponentInteractions();

  if (exitCode !== 0) {
    console.log('\\n🚨 Component interaction validation failed!');
    console.log('This prevents commits that could introduce accordion-like issues.');
    console.log('Fix the errors above, or use --no-verify to skip (not recommended).');
  }

  process.exit(exitCode);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

export { validateComponentInteractions };