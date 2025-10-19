#!/usr/bin/env node

/**
 * Validate Double Initialization Prevention
 *
 * This script validates that all interactive USWDS components have proper
 * double initialization prevention to avoid issues like duplicate "On this page"
 * navigation elements.
 *
 * Run as part of CI/CD or pre-commit hooks.
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Interactive components that MUST have double initialization protection
const INTERACTIVE_COMPONENTS = [
  'accordion',
  'modal',
  'combo-box',
  'file-input',
  'tooltip',
  'in-page-navigation',
  'date-picker',
];

// Validation results
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

console.log('🔍 Validating Double Initialization Prevention...\n');

/**
 * Validate component has proper protection
 */
function validateComponent(componentName) {
  const componentPath = path.join(
    projectRoot,
    `src/components/${componentName}/usa-${componentName}.ts`
  );

  if (!existsSync(componentPath)) {
    results.failed.push({
      component: componentName,
      issue: 'Component file not found',
      path: componentPath,
    });
    return false;
  }

  const componentSource = readFileSync(componentPath, 'utf8');

  // Check for data-web-component-managed protection
  const hasProtectionAttribute = componentSource.includes('data-web-component-managed') &&
    (componentSource.includes('"true"') || componentSource.includes("'true'"));

  if (!hasProtectionAttribute) {
    results.failed.push({
      component: componentName,
      issue: 'Missing data-web-component-managed="true" protection',
      fix: 'Add this.setAttribute("data-web-component-managed", "true"); in connectedCallback()',
    });
    return false;
  }

  // Check it's in connectedCallback - use a more robust approach for nested braces
  const callbackStart = componentSource.indexOf('connectedCallback()');
  if (callbackStart === -1) {
    results.failed.push({
      component: componentName,
      issue: 'Missing connectedCallback() method',
      fix: 'Add connectedCallback() method with protection attribute',
    });
    return false;
  }

  // Find the opening brace and extract the full method content
  const openBraceIndex = componentSource.indexOf('{', callbackStart);
  if (openBraceIndex === -1) {
    results.failed.push({
      component: componentName,
      issue: 'Invalid connectedCallback() syntax',
      fix: 'Fix connectedCallback() method syntax',
    });
    return false;
  }

  // Extract method content by matching braces
  let braceCount = 0;
  let endIndex = openBraceIndex;
  for (let i = openBraceIndex; i < componentSource.length; i++) {
    if (componentSource[i] === '{') braceCount++;
    if (componentSource[i] === '}') braceCount--;
    if (braceCount === 0) {
      endIndex = i;
      break;
    }
  }

  const callbackContent = componentSource.slice(callbackStart, endIndex + 1);
  if (!callbackContent.includes('data-web-component-managed')) {
    results.failed.push({
      component: componentName,
      issue: 'data-web-component-managed not set in connectedCallback()',
      fix: 'Move attribute setting to connectedCallback() method',
    });
    return false;
  }

  results.passed.push({
    component: componentName,
    message: 'Properly protected against double initialization',
  });

  return true;
}

/**
 * Validate story files use proper patterns
 */
async function validateStoryPatterns() {
  const storyFiles = await glob('src/**/*.stories.ts', { cwd: projectRoot });
  let storyIssues = 0;

  for (const storyFile of storyFiles) {
    const fullPath = path.join(projectRoot, storyFile);
    const storyContent = readFileSync(fullPath, 'utf8');

    // Check for problematic document.createElement pattern
    if (storyContent.includes('document.createElement(')) {
      results.failed.push({
        component: path.basename(storyFile, '.stories.ts'),
        issue: 'Story uses document.createElement() which bypasses component initialization',
        path: storyFile,
        fix: 'Convert to args-based render pattern: render: (args) => html`<component ...args></component>`',
      });
      storyIssues++;
    }
  }

  if (storyIssues === 0) {
    results.passed.push({
      component: 'Story Patterns',
      message: 'All stories use proper args-based patterns',
    });
  }

  return storyIssues === 0;
}

/**
 * Main validation
 */
async function main() {
  let allPassed = true;

  // Validate interactive components
  console.log('📋 Validating Interactive Components:');
  for (const componentName of INTERACTIVE_COMPONENTS) {
    const passed = validateComponent(componentName);
    console.log(`  ${passed ? '✅' : '❌'} ${componentName}`);
    if (!passed) allPassed = false;
  }

  console.log('\n📝 Validating Story Patterns:');
  const storiesPass = await validateStoryPatterns();
  console.log(`  ${storiesPass ? '✅' : '❌'} Story file patterns`);
  if (!storiesPass) allPassed = false;

  // Results summary
  console.log('\n📊 Validation Results:');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n🚨 Issues Found:');
    results.failed.forEach((failure, index) => {
      console.log(`\n${index + 1}. ${failure.component}:`);
      console.log(`   Issue: ${failure.issue}`);
      if (failure.fix) {
        console.log(`   Fix: ${failure.fix}`);
      }
      if (failure.path) {
        console.log(`   Path: ${failure.path}`);
      }
    });

    console.log('\n💡 These issues prevent double initialization problems like:');
    console.log('   - Duplicate "On this page" navigation elements');
    console.log('   - Multiple USWDS instances conflicting');
    console.log('   - Storybook stories that bypass component lifecycle');
  }

  if (allPassed) {
    console.log('\n🎉 All validations passed! Double initialization prevention is properly implemented.');
  } else {
    console.log('\n💥 Validation failed. Please fix the issues above before committing.');
    process.exit(1);
  }
}

// Run validation
main().catch((error) => {
  console.error('Validation script error:', error);
  process.exit(1);
});