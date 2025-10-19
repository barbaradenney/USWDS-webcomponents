#!/usr/bin/env node

/**
 * Pre-commit Validation: No Custom USWDS Classes
 *
 * Fast validator to detect custom USWDS-style classes in modified components.
 * This runs during pre-commit to catch issues like usa-card__container--actionable
 * before they reach the codebase.
 *
 * Optimized for speed:
 * - Only scans modified components (not all 46)
 * - Uses pattern matching (not full SCSS parsing)
 * - Filters known false positives
 * - Exits fast on success
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const componentsDir = join(rootDir, 'src/components');

// Known false positive patterns to ignore
const FALSE_POSITIVE_PATTERNS = [
  // Behavior file imports (not CSS classes)
  /-behavior$/,

  // Template literal fragments (incomplete class names)
  /\$\{/,
  /--$/,  // Ends with --
  /\[$/,  // Ends with [
  /__$/,  // Ends with __

  // Known legitimate USWDS modifiers
  /^usa-alert--(slim|no-icon|validation|info|warning|error|success)$/,
  /^usa-button--(outline|secondary|base|unstyled|big|accent-cool|accent-warm|inverse)$/,
  /^usa-button-group--segmented$/,
  /^usa-card--(flag|header-first|media-right)$/,
  /^usa-card__media--(inset|exdent)$/,
  /^usa-banner__header--expanded$/,
  /^usa-breadcrumb--wrap$/,
  /^usa-form-group--(error|success)$/,
  /^usa-hint--required$/,
  /^usa-input--(error|success)$/,
  /^usa-icon-list__content--\w+$/,
  /^usa-table--(borderless|compact|stacked|striped)$/,
  /^usa-step-indicator--(counters|counters-sm|no-counters|no-labels|center)$/,
  /^usa-step-indicator__segment--(current|complete)$/,
  /^usa-footer--(big|medium|slim)$/,
  /^usa-header--basic$/,
  /^usa-header--extended$/,
  /^usa-identifier--(primary|secondary)$/,
  /^usa-link--(external|nav)$/,
  /^usa-list--(unstyled|disc|square)$/,
  /^usa-nav__(primary|secondary)$/,
  /^usa-nav__link--current$/,
  /^usa-prose--\w+$/,
  /^usa-section--(light|dark)$/,
  /^usa-sidenav__(item|sublist)$/,
  /^usa-summary-box--(text|content)$/,
  /^usa-tag--(big)$/,
];

// Patterns that definitely indicate custom classes
const REAL_ISSUE_PATTERNS = [
  // Custom container modifiers (like the card issue)
  /__container--\w+/,

  // Custom wrapper/content modifiers that look suspicious
  /__wrapper--(?!sm|md|lg|xl)\w+/,  // Allow size variants
  /__content--(?!sm|md|lg|xl)\w+/,

  // Custom suffixes
  /-custom$/,
  /-new$/,
  /-modified$/,
  /-temp$/,
  /-v\d+$/,
  /-alt$/,
];

/**
 * Get list of modified component files from git
 */
function getModifiedComponents() {
  try {
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim());

    const componentFiles = stagedFiles.filter(file =>
      file.startsWith('src/components/') &&
      file.match(/usa-[\w-]+\.ts$/) &&
      !file.includes('.test.') &&
      !file.includes('.stories.')
    );

    const components = componentFiles
      .map(file => {
        const match = file.match(/src\/components\/([\w-]+)\//);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    return [...new Set(components)];
  } catch (error) {
    return [];
  }
}

/**
 * Extract USWDS classes from component code
 */
function extractUSWDSClasses(content) {
  const classes = new Set();

  // Match: class="usa-..." or class='usa-...'
  const classPattern = /class=["']([^"']*usa-[\w-]+[^"']*)["']/g;
  const matches = content.matchAll(classPattern);

  for (const match of matches) {
    const classNames = match[1].split(/\s+/).filter(cls => cls.startsWith('usa-'));
    classNames.forEach(cls => {
      // Clean up any template literal artifacts
      const cleaned = cls.replace(/\$\{[^}]*\}/g, '').trim();
      if (cleaned && cleaned !== 'usa-') {
        classes.add(cleaned);
      }
    });
  }

  return Array.from(classes);
}

/**
 * Check if a class name is a false positive
 */
function isFalsePositive(className) {
  return FALSE_POSITIVE_PATTERNS.some(pattern => pattern.test(className));
}

/**
 * Check if a class name matches a real issue pattern
 */
function matchesIssuePattern(className) {
  return REAL_ISSUE_PATTERNS.some(pattern => pattern.test(className));
}

/**
 * Validate a single component
 */
function validateComponent(componentName) {
  const componentFile = join(componentsDir, componentName, `usa-${componentName}.ts`);

  if (!existsSync(componentFile)) {
    return { component: componentName, issues: [] };
  }

  const content = readFileSync(componentFile, 'utf8');
  const classes = extractUSWDSClasses(content);
  const issues = [];

  for (const className of classes) {
    // Skip if it's a known false positive
    if (isFalsePositive(className)) {
      continue;
    }

    // Flag if it matches a real issue pattern
    if (matchesIssuePattern(className)) {
      issues.push({
        className,
        reason: 'Matches custom class pattern',
        severity: 'error',
      });
      continue;
    }

    // Flag BEM modifiers that aren't in our whitelist
    // Pattern: usa-component__element--modifier
    if (/usa-[\w-]+__[\w-]+--[\w-]+/.test(className)) {
      issues.push({
        className,
        reason: 'BEM modifier not in USWDS whitelist',
        severity: 'warning',
      });
    }

    // Flag component modifiers that aren't in our whitelist
    // Pattern: usa-component--modifier (not in FALSE_POSITIVE_PATTERNS)
    if (/^usa-[\w-]+--[\w-]+$/.test(className) && !className.includes('__')) {
      issues.push({
        className,
        reason: 'Component modifier not in USWDS whitelist',
        severity: 'warning',
      });
    }
  }

  return { component: componentName, issues };
}

/**
 * Main validation
 */
function main() {
  const modifiedComponents = getModifiedComponents();

  // If no components modified, pass
  if (modifiedComponents.length === 0) {
    console.log('✅ No components modified - custom class validation skipped');
    process.exit(0);
  }

  console.log(`🔍 Validating ${modifiedComponents.length} modified component(s) for custom USWDS classes...`);

  let hasErrors = false;
  let hasWarnings = false;
  const allIssues = [];

  for (const componentName of modifiedComponents) {
    const result = validateComponent(componentName);

    if (result.issues.length > 0) {
      allIssues.push(result);

      const errors = result.issues.filter(i => i.severity === 'error');
      const warnings = result.issues.filter(i => i.severity === 'warning');

      if (errors.length > 0) {
        hasErrors = true;
      }
      if (warnings.length > 0) {
        hasWarnings = true;
      }
    }
  }

  // Report issues
  if (allIssues.length > 0) {
    console.log('');

    for (const result of allIssues) {
      console.log(`\x1b[31m❌ ${result.component}\x1b[0m`);

      for (const issue of result.issues) {
        const color = issue.severity === 'error' ? '\x1b[31m' : '\x1b[33m';
        const icon = issue.severity === 'error' ? '  ❌' : '  ⚠️';
        console.log(`${color}${icon} ${issue.className}\x1b[0m`);
        console.log(`\x1b[90m     └─ ${issue.reason}\x1b[0m`);
      }
      console.log('');
    }

    if (hasErrors) {
      console.log('\x1b[31m❌ Custom USWDS classes detected!\x1b[0m');
      console.log('\x1b[90m💡 These classes do not exist in official USWDS CSS.\x1b[0m');
      console.log('\x1b[90m   Please verify each class exists at:\x1b[0m');
      console.log('\x1b[90m   node_modules/@uswds/uswds/packages/usa-*/src/styles/*.scss\x1b[0m');
      console.log('');
      console.log('\x1b[90m📚 See: docs/VALIDATION_GAP_ANALYSIS.md\x1b[0m');
      console.log('');
      process.exit(1);
    }

    if (hasWarnings) {
      console.log('\x1b[33m⚠️  Suspicious USWDS modifiers detected\x1b[0m');
      console.log('\x1b[90m💡 Verify these classes exist in official USWDS CSS.\x1b[0m');
      console.log('\x1b[90m   If they\'re legitimate, add to FALSE_POSITIVE_PATTERNS in:\x1b[0m');
      console.log('\x1b[90m   scripts/validate/validate-no-custom-uswds-classes.js\x1b[0m');
      console.log('');
      // Warnings don't fail the build
      process.exit(0);
    }
  }

  console.log(`\x1b[32m✅ No custom USWDS classes found in ${modifiedComponents.length} component(s)\x1b[0m`);
  process.exit(0);
}

main();
