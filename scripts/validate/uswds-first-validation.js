#!/usr/bin/env node

/**
 * USWDS-First Development Validation Script
 *
 * This script enforces the USWDS-First methodology by:
 * 1. Detecting component modifications in git changes
 * 2. Validating that USWDS investigation was performed before changes
 * 3. Ensuring USWDS compliance for modified components
 * 4. Providing guidance when validation fails
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
// import { analyzeComponent } from './enforce-minimal-wrapper.js'; // Unused - keeping for potential future use

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`🔍 ${message}`, 'bold');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Get modified component files from git diff
 */
function getModifiedComponents() {
  try {
    // Get staged files for pre-commit hook
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter((file) => file.trim());

    // Get modified files for general validation
    const modifiedFiles = execSync('git diff HEAD --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter((file) => file.trim());

    const allFiles = [...new Set([...stagedFiles, ...modifiedFiles])];

    // Extract component names from file paths
    const componentFiles = allFiles.filter(
      (file) => file.startsWith('src/components/') && (file.endsWith('.ts') || file.endsWith('.js'))
    );

    const components = componentFiles
      .map((file) => {
        const match = file.match(/src\/components\/([^/]+)\//);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    return [...new Set(components)];
  } catch (error) {
    // No git changes or not in a git repo
    return [];
  }
}

/**
 * Check if USWDS investigation evidence exists for a component
 */
function hasUSWDSInvestigationEvidence(componentName) {
  const evidenceChecks = [
    // 1. Check if there are USWDS reference comments in the component
    () => {
      const componentPath = join(
        rootDir,
        `src/components/${componentName}/usa-${componentName}.ts`
      );
      if (!existsSync(componentPath)) return false;

      const content = readFileSync(componentPath, 'utf8');
      return (
        content.includes('@uswds-js-reference') ||
        content.includes('USWDS') ||
        content.includes('uswds')
      );
    },

    // 2. Check if investigation script was run recently (git log)
    () => {
      try {
        const commitMessages = execSync(
          `git log --since="1 week ago" --grep="uswds\\|USWDS\\|${componentName}" --oneline`,
          { encoding: 'utf8' }
        );
        return commitMessages.includes(componentName) || commitMessages.includes('uswds');
      } catch {
        return false;
      }
    },

    // 3. Check if component has proper USWDS data attributes
    () => {
      const componentPath = join(
        rootDir,
        `src/components/${componentName}/usa-${componentName}.ts`
      );
      if (!existsSync(componentPath)) return false;

      const content = readFileSync(componentPath, 'utf8');
      return content.includes('data-') && content.includes('uswds');
    },
  ];

  return evidenceChecks.some((check) => check());
}

/**
 * Validate USWDS compliance for a component
 */
function validateUSWDSCompliance(componentName) {
  try {
    // Run our existing compliance validation
    execSync(
      `node scripts/validate-uswds-compliance.js src/components/${componentName}/usa-${componentName}.ts`,
      {
        cwd: rootDir,
        stdio: 'pipe',
      }
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate investigation command for a component
 */
function getInvestigationCommand(componentName) {
  return `npm run uswds:investigate ${componentName}`;
}

/**
 * Main validation function
 */
function validateUSWDSFirst(options = {}) {
  const { strict = false, skipInvestigation = false } = options;

  logHeader('USWDS-First Development Validation');

  const modifiedComponents = getModifiedComponents();

  if (modifiedComponents.length === 0) {
    logInfo('No component modifications detected.');
    return true;
  }

  log(`\nDetected modifications in components: ${modifiedComponents.join(', ')}`, 'cyan');

  let allValid = true;
  const warnings = [];
  const errors = [];

  for (const component of modifiedComponents) {
    log(`\n🔍 Validating ${component}...`, 'blue');

    // Check 1: USWDS investigation evidence
    if (!skipInvestigation) {
      const hasEvidence = hasUSWDSInvestigationEvidence(component);

      if (!hasEvidence) {
        const message = `No USWDS investigation evidence found for ${component}`;
        if (strict) {
          errors.push({
            component,
            issue: message,
            remedy: `Run: ${getInvestigationCommand(component)}`,
          });
          allValid = false;
        } else {
          warnings.push({
            component,
            issue: message,
            remedy: `Recommended: ${getInvestigationCommand(component)}`,
          });
        }
      } else {
        logSuccess(`USWDS investigation evidence found for ${component}`);
      }
    }

    // Check 2: USWDS compliance validation
    const isCompliant = validateUSWDSCompliance(component);

    if (!isCompliant) {
      const message = `USWDS compliance validation failed for ${component}`;
      errors.push({
        component,
        issue: message,
        remedy: `Fix compliance issues and re-run validation`,
      });
      allValid = false;
    } else {
      logSuccess(`USWDS compliance validated for ${component}`);
    }
  }

  // Report results
  if (warnings.length > 0) {
    log('\n⚠️  WARNINGS:', 'yellow');
    warnings.forEach((warning) => {
      logWarning(`${warning.issue}`);
      log(`   💡 ${warning.remedy}`, 'cyan');
    });
  }

  if (errors.length > 0) {
    log('\n❌ ERRORS:', 'red');
    errors.forEach((error) => {
      logError(`${error.issue}`);
      log(`   🔧 ${error.remedy}`, 'cyan');
    });
  }

  if (allValid && warnings.length === 0) {
    logSuccess('\n🎉 All USWDS-First validation checks passed!');
  } else if (allValid) {
    logWarning('\n✅ Validation passed with warnings. Consider addressing them.');
  } else {
    logError('\n💥 USWDS-First validation failed. Please address the errors above.');

    log('\n📚 USWDS-First Methodology Guide:', 'cyan');
    log('   1. Always run USWDS investigation before modifying components');
    log('   2. Reference official USWDS source code and documentation');
    log('   3. Ensure component changes align with USWDS standards');
    log('   4. Validate compliance before committing');
    log('\n📖 See: docs/USWDS_FIRST_METHODOLOGY.md for complete guidelines');
  }

  return allValid;
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  if (args.includes('--strict')) {
    options.strict = true;
  }

  if (args.includes('--skip-investigation')) {
    options.skipInvestigation = true;
  }

  if (args.includes('--help')) {
    console.log(`
USWDS-First Development Validation

Usage: node scripts/uswds-first-validation.js [options]

Options:
  --strict              Fail on missing investigation evidence (default: warn)
  --skip-investigation  Skip USWDS investigation evidence checks
  --help               Show this help message

Examples:
  node scripts/uswds-first-validation.js                    # Basic validation
  node scripts/uswds-first-validation.js --strict           # Strict mode
  node scripts/uswds-first-validation.js --skip-investigation # Skip investigation checks

Integration:
  # Add to pre-commit hook
  node scripts/uswds-first-validation.js --strict

  # Add to CI/CD pipeline
  npm run validate:uswds-first

  # Manual validation
  npm run uswds:validate-changes
`);
    process.exit(0);
  }

  const isValid = validateUSWDSFirst(options);
  process.exit(isValid ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateUSWDSFirst, getModifiedComponents, hasUSWDSInvestigationEvidence };
