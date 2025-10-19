#!/usr/bin/env node

/**
 * Selective Component Compliance Check
 *
 * Runs component-specific compliance checks only for components
 * that have changed files in the current commit.
 *
 * This provides faster pre-commit validation by targeting
 * only the components that are actually being modified.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const COMPONENTS_DIR = 'src/components';

/**
 * Get the list of changed files from git
 */
function getChangedFiles() {
  try {
    // Get staged files for commit
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim() !== '');

    // Also check unstaged changes to catch working directory modifications
    const unstagedFiles = execSync('git diff --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim() !== '');

    // Combine and deduplicate
    const allFiles = [...new Set([...stagedFiles, ...unstagedFiles])];

    console.log(`📁 Checking ${allFiles.length} changed files for component updates...`);
    return allFiles;
  } catch (error) {
    // If git commands fail, run all compliance checks as fallback
    console.warn('⚠️  Could not determine changed files, running full compliance check');
    return null;
  }
}

/**
 * Extract component names from changed file paths
 */
function getChangedComponents(changedFiles) {
  const components = new Set();

  changedFiles.forEach(file => {
    // Check if file is in a component directory but exclude test files
    const componentMatch = file.match(/^src\/components\/([^\/]+)\//);
    if (componentMatch && !file.match(/\.(test|spec)\.ts$/)) {
      // Only trigger compliance for actual component files, not test files
      const isComponentFile = file.match(/usa-[^\/]+\.ts$/) || file.match(/index\.ts$/);
      if (isComponentFile) {
        components.add(componentMatch[1]);
      }
    }
  });

  return Array.from(components);
}

/**
 * Get list of all available components
 */
function getAllComponents() {
  try {
    return fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => {
        // Check if component has a compliance script
        const complianceScript = path.join(COMPONENTS_DIR, name, `usa-${name}.compliance.js`);
        return fs.existsSync(complianceScript);
      });
  } catch (error) {
    console.error('❌ Could not read components directory:', error.message);
    return [];
  }
}

/**
 * Run compliance check for a specific component
 */
function runComponentCompliance(componentName) {
  const complianceScript = path.join(COMPONENTS_DIR, componentName, `usa-${componentName}.compliance.js`);

  if (!fs.existsSync(complianceScript)) {
    console.log(`⚠️  No compliance script found for ${componentName}`);
    return { success: true, skipped: true };
  }

  try {
    console.log(`🔍 Running compliance check for ${componentName}...`);

    // Run the component's compliance script
    execSync(`node ${complianceScript}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log(`✅ ${componentName} compliance check passed`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`❌ ${componentName} compliance check failed`);
    return { success: false, skipped: false, error };
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('🛡️  Starting selective component compliance validation...\n');

  const changedFiles = getChangedFiles();

  // If we can't determine changed files, run basic validation
  if (!changedFiles) {
    console.log('🔄 Running basic compliance validation as fallback...');
    try {
      execSync('npm run validate:uswds-compliance', { stdio: 'inherit' });
      console.log('✅ Basic compliance validation passed');
      return;
    } catch (error) {
      console.error('❌ Basic compliance validation failed');
      process.exit(1);
    }
  }

  const changedComponents = getChangedComponents(changedFiles);

  if (changedComponents.length === 0) {
    console.log('✅ No component files changed, skipping component compliance checks');
    return;
  }

  console.log(`🎯 Found changes in components: ${changedComponents.join(', ')}\n`);

  const results = {
    total: changedComponents.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    failures: []
  };

  // Run compliance checks for each changed component
  for (const component of changedComponents) {
    const result = runComponentCompliance(component);

    if (result.skipped) {
      results.skipped++;
    } else if (result.success) {
      results.passed++;
    } else {
      results.failed++;
      results.failures.push(component);
    }
  }

  // Print summary
  console.log('\n📊 Selective Compliance Summary:');
  console.log(`   Components checked: ${results.total}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⚠️  Skipped: ${results.skipped}`);

  if (results.failed > 0) {
    console.log('\n❌ Component compliance issues detected!');
    console.log('\nFailed components:');
    results.failures.forEach(component => {
      console.log(`   • ${component}`);
    });

    console.log('\nTo fix:');
    console.log('   1. Run individual compliance checks:');
    results.failures.forEach(component => {
      console.log(`      npm run compliance:${component}`);
    });
    console.log('   2. Review compliance reports in src/compliance/reports/');
    console.log('   3. Fix issues and re-run compliance checks');
    console.log('\nOr use "git commit --no-verify" to skip this check (not recommended)');

    process.exit(1);
  }

  console.log('\n✅ All component compliance checks passed!');
}

// Handle command line options
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Selective Component Compliance Check

Usage:
  node scripts/selective-component-compliance.js [options]

Options:
  --help, -h          Show this help message
  --all               Run compliance for all components (ignore git changes)
  --components=LIST   Run compliance for specific components (comma-separated)

Examples:
  # Run for changed components only (default)
  node scripts/selective-component-compliance.js

  # Run for all components
  node scripts/selective-component-compliance.js --all

  # Run for specific components
  node scripts/selective-component-compliance.js --components=tooltip,modal,button
`);
  process.exit(0);
}

if (args.includes('--all')) {
  console.log('🔄 Running compliance for all components...');
  const allComponents = getAllComponents();

  const results = { total: allComponents.length, passed: 0, failed: 0, skipped: 0, failures: [] };

  for (const component of allComponents) {
    const result = runComponentCompliance(component);
    if (result.skipped) results.skipped++;
    else if (result.success) results.passed++;
    else { results.failed++; results.failures.push(component); }
  }

  console.log(`\n📊 All Components Summary: ${results.passed}/${results.total} passed`);
  if (results.failed > 0) {
    console.log(`❌ Failed: ${results.failures.join(', ')}`);
    process.exit(1);
  }
} else if (args.find(arg => arg.startsWith('--components='))) {
  const componentsArg = args.find(arg => arg.startsWith('--components='));
  const specificComponents = componentsArg.split('=')[1].split(',').map(c => c.trim());

  console.log(`🎯 Running compliance for specific components: ${specificComponents.join(', ')}`);

  const results = { total: specificComponents.length, passed: 0, failed: 0, skipped: 0, failures: [] };

  for (const component of specificComponents) {
    const result = runComponentCompliance(component);
    if (result.skipped) results.skipped++;
    else if (result.success) results.passed++;
    else { results.failed++; results.failures.push(component); }
  }

  console.log(`\n📊 Specific Components Summary: ${results.passed}/${results.total} passed`);
  if (results.failed > 0) {
    console.log(`❌ Failed: ${results.failures.join(', ')}`);
    process.exit(1);
  }
} else {
  // Default: run for changed components only
  main();
}