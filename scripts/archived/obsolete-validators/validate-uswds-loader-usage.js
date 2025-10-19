#!/usr/bin/env node

/**
 * USWDS Loader Usage Validation Script
 *
 * This script ensures all components use the standardized USWDS loader utility
 * instead of direct imports. It prevents regression issues like the combo-box
 * problem where direct imports were used instead of the Vite-compatible loader.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../../src/components');
const USWDS_LOADER_PATH = '../../utils/uswds-loader.js';

// Patterns to detect direct USWDS imports (these should NOT exist)
const FORBIDDEN_PATTERNS = [
  /import.*['"]@uswds\/uswds\/js\/usa-[^'"]*['"]/g,
  /import.*['"]@uswds\/uswds\/dist\/js\/[^'"]*['"]/g,
  /await import\(['"`]@uswds\/uswds\/js\/usa-[^'"`]*['"`]\)/g,
  /await import\(['"`]@uswds\/uswds\/dist\/js\/[^'"`]*['"`]\)/g,
];

// Required patterns for proper USWDS loader usage
const REQUIRED_PATTERNS = {
  loaderImport: /import.*['"]\.\.\/\.\.\/utils\/uswds-loader\.js['"]/,
  initializeFunction: /initializeUSWDSComponent/,
  cleanupFunction: /cleanupUSWDSComponent/,
  webComponentManaged: /data-web-component-managed/,
};

// Components that require USWDS JavaScript integration
const USWDS_JS_COMPONENTS = [
  'accordion',
  'combo-box',
  'date-picker',
  'footer',
  'header',
  'modal',
  'time-picker',
  'tooltip',
  'file-input',
  'character-count',
  'search',
];

// Components that are CSS-only (don't need JavaScript validation)
const CSS_ONLY_COMPONENTS = [
  'alert',
  'button',
  'card',
  'breadcrumb',
  'tag',
  'link',
  'prose',
  'section',
  'summary-box',
  'select',
  'pagination',
  'checkbox',
  'radio',
  'range-slider',
];

function getAllComponentFiles() {
  const components = [];
  const componentDirs = fs.readdirSync(COMPONENTS_DIR);

  for (const dir of componentDirs) {
    const componentPath = path.join(COMPONENTS_DIR, dir);
    const stat = fs.statSync(componentPath);

    if (stat.isDirectory()) {
      const tsFile = path.join(componentPath, `usa-${dir}.ts`);
      if (fs.existsSync(tsFile)) {
        components.push({
          name: dir,
          filePath: tsFile,
          content: fs.readFileSync(tsFile, 'utf8'),
        });
      }
    }
  }

  return components;
}

function validateComponent(component) {
  const { name, filePath, content } = component;
  const issues = [];
  const isUSWDSComponent = USWDS_JS_COMPONENTS.includes(name);
  const isCSSOnly = CSS_ONLY_COMPONENTS.includes(name);

  console.log(`\n🔍 Validating ${name}...`);

  // Check for forbidden direct USWDS imports
  for (const pattern of FORBIDDEN_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        severity: 'ERROR',
        type: 'FORBIDDEN_DIRECT_IMPORT',
        message: `Found direct USWDS import: ${matches.join(', ')}`,
        fix: 'Replace with USWDS loader utility import'
      });
    }
  }

  // For USWDS JavaScript components, validate proper loader usage
  if (isUSWDSComponent) {
    // Check for required loader import
    if (!REQUIRED_PATTERNS.loaderImport.test(content)) {
      issues.push({
        severity: 'ERROR',
        type: 'MISSING_LOADER_IMPORT',
        message: 'Missing USWDS loader utility import',
        fix: `Add: import { initializeUSWDSComponent, cleanupUSWDSComponent } from '${USWDS_LOADER_PATH}';`
      });
    }

    // Check for proper initialization function usage
    if (!REQUIRED_PATTERNS.initializeFunction.test(content)) {
      issues.push({
        severity: 'ERROR',
        type: 'MISSING_INITIALIZE_FUNCTION',
        message: 'Missing initializeUSWDSComponent usage',
        fix: 'Use: await initializeUSWDSComponent(element, moduleName);'
      });
    }

    // Check for proper cleanup function usage
    if (!REQUIRED_PATTERNS.cleanupFunction.test(content)) {
      issues.push({
        severity: 'WARNING',
        type: 'MISSING_CLEANUP_FUNCTION',
        message: 'Missing cleanupUSWDSComponent usage',
        fix: 'Use: cleanupUSWDSComponent(this, this.uswdsModule);'
      });
    }

    // Check for web component managed flag
    if (!REQUIRED_PATTERNS.webComponentManaged.test(content)) {
      issues.push({
        severity: 'WARNING',
        type: 'MISSING_WEB_COMPONENT_FLAG',
        message: 'Missing data-web-component-managed attribute',
        fix: "Add: this.setAttribute('data-web-component-managed', 'true');"
      });
    }

    // Check for shouldUpdate protection (recommended for combo-box-like components)
    if (['combo-box', 'time-picker', 'date-picker'].includes(name)) {
      const hasShouldUpdate = content.includes('shouldUpdate');
      const hasElementDetection = content.includes('hasEnhancedElements');
      const hasClassDetection = content.includes('usa-combo-box') && content.includes('classList.contains');

      if (!hasShouldUpdate || (!hasElementDetection && !hasClassDetection)) {
        issues.push({
          severity: 'WARNING',
          type: 'MISSING_SHOULD_UPDATE_PROTECTION',
          message: 'Missing shouldUpdate protection for USWDS transformation',
          fix: 'Add shouldUpdate method to prevent re-rendering after USWDS transformation'
        });
      }
    }

    console.log(`  ✅ USWDS JavaScript component - full validation applied`);
  } else if (isCSSOnly) {
    console.log(`  ℹ️  CSS-only component - limited validation applied`);
  } else {
    console.log(`  ⚠️  Unknown component type - applying basic validation`);
  }

  return {
    component: name,
    filePath,
    isUSWDSComponent,
    isCSSOnly,
    issues
  };
}

function printValidationReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 USWDS Loader Usage Validation Report');
  console.log('='.repeat(80));

  let totalErrors = 0;
  let totalWarnings = 0;
  let componentsWithIssues = 0;

  for (const result of results) {
    const errors = result.issues.filter(issue => issue.severity === 'ERROR');
    const warnings = result.issues.filter(issue => issue.severity === 'WARNING');

    if (result.issues.length > 0) {
      componentsWithIssues++;
      console.log(`\n❌ ${result.component} (${result.issues.length} issues)`);
      console.log(`   📁 ${path.relative(process.cwd(), result.filePath)}`);

      for (const issue of result.issues) {
        const icon = issue.severity === 'ERROR' ? '🚫' : '⚠️';
        console.log(`   ${icon} ${issue.type}: ${issue.message}`);
        console.log(`      💡 Fix: ${issue.fix}`);
      }

      totalErrors += errors.length;
      totalWarnings += warnings.length;
    } else {
      console.log(`✅ ${result.component} - No issues found`);
    }
  }

  console.log('\n' + '-'.repeat(80));
  console.log('📊 Summary:');
  console.log(`   Total components: ${results.length}`);
  console.log(`   Components with issues: ${componentsWithIssues}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n🚫 VALIDATION FAILED - Fix errors before proceeding');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  VALIDATION PASSED WITH WARNINGS - Consider addressing warnings');
    process.exit(0);
  } else {
    console.log('\n✅ VALIDATION PASSED - All components use proper USWDS loader patterns');
    process.exit(0);
  }
}

function generateFixSuggestions(results) {
  const issuesWithFixes = results
    .filter(result => result.issues.length > 0)
    .map(result => ({
      component: result.component,
      filePath: result.filePath,
      fixes: result.issues.map(issue => issue.fix)
    }));

  if (issuesWithFixes.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🔧 Automated Fix Suggestions');
    console.log('='.repeat(80));

    for (const item of issuesWithFixes) {
      console.log(`\n📝 ${item.component}:`);
      for (const fix of item.fixes) {
        console.log(`   • ${fix}`);
      }
    }
  }
}

// Main execution
function main() {
  console.log('🔍 Starting USWDS Loader Usage Validation...');
  console.log(`📂 Scanning components in: ${COMPONENTS_DIR}`);

  const components = getAllComponentFiles();
  console.log(`📋 Found ${components.length} components to validate`);

  const results = components.map(validateComponent);

  printValidationReport(results);
  generateFixSuggestions(results);
}

main();