#!/usr/bin/env node

/**
 * Pre-commit Validation: No Custom CSS in Component Styles
 *
 * Ensures components ONLY use :host styles for web component functionality.
 * All USWDS styling must come from official USWDS CSS, not custom CSS.
 *
 * Allowed:
 * - :host { display: block; }
 * - :host([hidden]) { display: none; }
 * - :host([attribute]) { ... } for attribute-based styling
 *
 * Forbidden:
 * - .usa-* selectors (use USWDS CSS)
 * - Descendant selectors (use USWDS CSS)
 * - Custom utility classes (use USWDS CSS)
 * - !important overrides (indicates CSS conflict)
 * - Padding/margin/colors (should come from USWDS)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const componentsDir = join(rootDir, 'src/components');

// Allowed CSS properties in :host styles
const ALLOWED_HOST_PROPERTIES = new Set([
  'display',
  'visibility',
  'pointer-events',
  'user-select',
  'position', // For positioning context
]);

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
 * Extract styles block from component
 */
function extractStylesBlock(content) {
  const match = content.match(/static override styles = css`([^`]+)`/s);
  return match ? match[1] : '';
}

/**
 * Parse CSS to find selectors and their properties
 */
function parseCSSRules(css) {
  const rules = [];

  // Match CSS rules: selector { properties }
  const rulePattern = /([^{]+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = rulePattern.exec(css)) !== null) {
    const selector = match[1].trim();
    const propertiesBlock = match[2].trim();

    // Extract properties
    const properties = [];
    const propertyPattern = /([\w-]+)\s*:\s*([^;]+);/g;
    let propMatch;

    while ((propMatch = propertyPattern.exec(propertiesBlock)) !== null) {
      properties.push({
        name: propMatch[1].trim(),
        value: propMatch[2].trim(),
      });
    }

    rules.push({ selector, properties });
  }

  return rules;
}

/**
 * Validate a CSS rule
 */
function validateRule(rule) {
  const issues = [];
  const { selector, properties } = rule;

  // Check if selector is allowed
  if (!selector.startsWith(':host')) {
    issues.push({
      selector,
      issue: 'Non-:host selector detected',
      description: 'Only :host selectors are allowed. Use USWDS CSS classes instead.',
      severity: 'error',
    });
    return issues; // Don't check properties if selector is wrong
  }

  // Check for :has() in :host selectors (advanced selector that might indicate overreach)
  if (selector.includes(':has(')) {
    issues.push({
      selector,
      issue: ':has() selector detected',
      description: 'Complex :has() selectors suggest custom CSS. Use USWDS CSS instead.',
      severity: 'error',
    });
  }

  // Check for descendant selectors after :host (e.g., :host .usa-button)
  if (/:\host.*\s+[\w.-]/.test(selector)) {
    issues.push({
      selector,
      issue: 'Descendant selector after :host',
      description: 'Do not target children from :host. Use USWDS CSS classes instead.',
      severity: 'error',
    });
  }

  // Check each property
  for (const prop of properties) {
    // Check for !important
    if (prop.value.includes('!important')) {
      issues.push({
        selector,
        issue: `!important used on ${prop.name}`,
        description: '!important indicates CSS specificity conflict. Remove custom CSS.',
        severity: 'error',
      });
    }

    // Check for USWDS-specific properties that shouldn't be in :host
    const cosmeticProperties = ['color', 'background', 'background-color', 'border', 'padding', 'margin', 'font-size', 'font-family', 'font-weight'];
    if (cosmeticProperties.some(cp => prop.name.startsWith(cp))) {
      issues.push({
        selector,
        issue: `Cosmetic property ${prop.name} in :host`,
        description: 'Cosmetic styling should come from USWDS CSS, not :host styles.',
        severity: 'warning',
      });
    }

    // Only allow specific properties in :host
    const baseProp = prop.name.split('-')[0]; // Get base property (e.g., 'display' from 'display-block')
    if (!ALLOWED_HOST_PROPERTIES.has(baseProp) && !ALLOWED_HOST_PROPERTIES.has(prop.name)) {
      // Skip warning for visibility-related properties
      if (!prop.name.includes('display') && !prop.name.includes('visibility')) {
        issues.push({
          selector,
          issue: `Unexpected property ${prop.name} in :host`,
          description: ':host should only contain display/visibility properties.',
          severity: 'warning',
        });
      }
    }
  }

  return issues;
}

/**
 * Validate a component's styles
 */
function validateComponent(componentName) {
  const componentFile = join(componentsDir, componentName, `usa-${componentName}.ts`);

  if (!existsSync(componentFile)) {
    return { component: componentName, issues: [] };
  }

  const content = readFileSync(componentFile, 'utf8');
  const stylesBlock = extractStylesBlock(content);

  if (!stylesBlock) {
    // No styles block is fine
    return { component: componentName, issues: [] };
  }

  const rules = parseCSSRules(stylesBlock);
  const issues = [];

  for (const rule of rules) {
    const ruleIssues = validateRule(rule);
    issues.push(...ruleIssues);
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
    console.log('✅ No components modified - custom CSS validation skipped');
    process.exit(0);
  }

  console.log(`🎨 Validating ${modifiedComponents.length} component(s) for custom CSS...`);

  let hasErrors = false;
  let hasWarnings = false;
  const allIssues = [];

  for (const componentName of modifiedComponents) {
    const result = validateComponent(componentName);

    if (result.issues.length > 0) {
      allIssues.push(result);

      const errors = result.issues.filter(i => i.severity === 'error');
      const warnings = result.issues.filter(i => i.severity === 'warning');

      if (errors.length > 0) hasErrors = true;
      if (warnings.length > 0) hasWarnings = true;
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
        console.log(`${color}${icon} ${issue.issue}\x1b[0m`);
        console.log(`\x1b[90m     Selector: ${issue.selector}\x1b[0m`);
        console.log(`\x1b[90m     └─ ${issue.description}\x1b[0m`);
      }
      console.log('');
    }

    if (hasErrors) {
      console.log('\x1b[31m❌ Custom CSS detected in component styles!\x1b[0m');
      console.log('\x1b[90m💡 Components should ONLY use :host for web component functionality.\x1b[0m');
      console.log('\x1b[90m   All USWDS styling must come from official USWDS CSS.\x1b[0m');
      console.log('');
      console.log('\x1b[90m✅ Allowed: :host { display: block; }\x1b[0m');
      console.log('\x1b[90m✅ Allowed: :host([hidden]) { display: none; }\x1b[0m');
      console.log('\x1b[90m❌ Forbidden: .usa-* selectors\x1b[0m');
      console.log('\x1b[90m❌ Forbidden: Descendant selectors\x1b[0m');
      console.log('\x1b[90m❌ Forbidden: !important overrides\x1b[0m');
      console.log('');
      process.exit(1);
    }

    if (hasWarnings) {
      console.log('\x1b[33m⚠️  Suspicious CSS properties detected\x1b[0m');
      console.log('\x1b[90m💡 Consider if these properties should come from USWDS CSS instead.\x1b[0m');
      console.log('');
      // Warnings don't fail the build
      process.exit(0);
    }
  }

  console.log(`\x1b[32m✅ No custom CSS found in ${modifiedComponents.length} component(s)\x1b[0m`);
  process.exit(0);
}

main();
