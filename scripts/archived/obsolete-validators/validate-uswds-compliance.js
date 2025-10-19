#!/usr/bin/env node

/**
 * USWDS Compliance Validator
 *
 * Validates that web components maintain proper USWDS alignment
 * Compares implementation against official USWDS JavaScript patterns
 * Includes JavaScript behavior validation from uswds-javascript-validation.js
 */

import fs from 'fs';
import { validateUSWDSJavaScript } from './uswds-javascript-validation.js';

// USWDS Date Picker Compliance Rules
const DATE_PICKER_COMPLIANCE_RULES = {
  // Required CSS classes that must be present
  requiredClasses: [
    'usa-date-picker',
    'usa-date-picker__button',
    'usa-date-picker__calendar',
    'usa-date-picker__calendar__table',
    'usa-date-picker__calendar__date',
    'usa-date-picker__calendar__header',
    'usa-date-picker__calendar__previous-month',
    'usa-date-picker__calendar__next-month',
  ],

  // Required keyboard event handlers (should match USWDS patterns)
  requiredKeyboardHandlers: [
    'ArrowDown', // Opens calendar (USWDS standard)
    'F4', // Opens calendar (Windows accessibility standard)
    'Enter', // Activates button
    'Space', // Activates button
    'Escape', // Closes calendar/returns focus
  ],

  // ARIA attributes that must be present for accessibility
  requiredAriaAttributes: [
    'aria-label',
    'aria-haspopup',
    'aria-controls',
    'role="dialog"',
    'aria-modal="true"',
  ],

  // Progressive enhancement patterns
  progressiveEnhancement: [
    'USWDS.datePicker.on', // Should attempt USWDS enhancement
    'USWDS.datePicker.off', // Should clean up USWDS enhancement
    'createRenderRoot', // Should use light DOM for USWDS compatibility
  ],

  // Form integration requirements
  formIntegration: [
    'name=', // Must support form submission
    'value', // Must have reactive value property
    'required', // Must support required validation
    'disabled', // Must support disabled state
    'date-change', // Must dispatch date-change events
  ],

  // Forbidden patterns (things that break USWDS compliance)
  forbiddenPatterns: [
    /createShadowRoot/, // Shadow DOM breaks USWDS
    /attachShadow/, // Shadow DOM breaks USWDS
    /custom-.*-style/, // Custom styles break USWDS consistency
    /\.style\.[a-zA-Z]/, // Direct style manipulation
    /background-color\s*:/, // Custom background colors
    /color\s*:\s*(?!inherit)/, // Custom text colors (except inherit)
  ],
};

/**
 * Validates a TypeScript file against USWDS compliance rules
 */
function validateUSWDSCompliance(filePath, componentName = 'date-picker') {
  const results = {
    file: filePath,
    component: componentName,
    passed: 0,
    failed: 0,
    warningCount: 0,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  if (!fs.existsSync(filePath)) {
    results.errors.push(`File not found: ${filePath}`);
    results.failed++;
    return results;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const rules = DATE_PICKER_COMPLIANCE_RULES;

  // Check for required CSS classes
  console.log(`\n🎨 Checking CSS class compliance...`);
  rules.requiredClasses.forEach((className) => {
    // Check for class in quotes, template literals, or class attribute assignments
    const patterns = [
      `"${className}"`,
      `'${className}'`,
      `\`${className}\``,
      `class="${className}`,
      `class='${className}`,
      `classList.add("${className}")`,
      `classList.add('${className}')`,
    ];

    const found = patterns.some((pattern) => content.includes(pattern));

    if (found) {
      console.log(`  ✅ Found required class: ${className}`);
      results.passed++;
    } else {
      console.log(`  ❌ Missing required class: ${className}`);
      results.errors.push(`Missing required USWDS class: ${className}`);
      results.failed++;
    }
  });

  // Check for keyboard event handlers
  console.log(`\n⌨️  Checking keyboard navigation compliance...`);
  rules.requiredKeyboardHandlers.forEach((key) => {
    if (
      content.includes(`'${key}'`) ||
      content.includes(`"${key}"`) ||
      content.includes(`case '${key}':`)
    ) {
      console.log(`  ✅ Found keyboard handler: ${key}`);
      results.passed++;
    } else {
      console.log(`  ⚠️  Missing keyboard handler: ${key}`);
      results.warnings.push(`Consider adding keyboard handler for: ${key} (USWDS standard)`);
      results.warningCount++;
    }
  });

  // Check for ARIA attributes
  console.log(`\n♿ Checking accessibility compliance...`);
  rules.requiredAriaAttributes.forEach((attr) => {
    if (content.includes(attr)) {
      console.log(`  ✅ Found ARIA attribute: ${attr}`);
      results.passed++;
    } else {
      console.log(`  ❌ Missing ARIA attribute: ${attr}`);
      results.errors.push(`Missing required ARIA attribute: ${attr}`);
      results.failed++;
    }
  });

  // Check progressive enhancement patterns
  console.log(`\n🔄 Checking progressive enhancement compliance...`);
  rules.progressiveEnhancement.forEach((pattern) => {
    if (content.includes(pattern)) {
      console.log(`  ✅ Found progressive enhancement: ${pattern}`);
      results.passed++;
    } else {
      console.log(`  ⚠️  Missing progressive enhancement: ${pattern}`);
      results.warnings.push(`Consider implementing: ${pattern}`);
      results.warningCount++;
    }
  });

  // Check form integration
  console.log(`\n📝 Checking form integration compliance...`);
  rules.formIntegration.forEach((pattern) => {
    if (content.includes(pattern)) {
      console.log(`  ✅ Found form integration: ${pattern}`);
      results.passed++;
    } else {
      console.log(`  ❌ Missing form integration: ${pattern}`);
      results.errors.push(`Missing form integration: ${pattern}`);
      results.failed++;
    }
  });

  // Check for forbidden patterns
  console.log(`\n🚫 Checking for anti-patterns...`);
  rules.forbiddenPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  ❌ Found forbidden pattern: ${matches[0]}`);
      results.errors.push(`Forbidden pattern breaks USWDS compliance: ${matches[0]}`);
      results.failed++;
    } else {
      console.log(`  ✅ No anti-patterns found (check ${index + 1})`);
      results.passed++;
    }
  });

  // Additional USWDS-specific validations
  console.log(`\n🏛️  Checking USWDS-specific requirements...`);

  // Must import USWDS styles
  if (
    content.includes("'../../styles/styles.css'") ||
    content.includes('"../../styles/styles.css"')
  ) {
    console.log(`  ✅ Imports USWDS compiled styles`);
    results.passed++;
  } else {
    console.log(`  ❌ Missing USWDS styles import`);
    results.errors.push(`Must import '../../styles/styles.css' for USWDS compliance`);
    results.failed++;
  }

  // Must use light DOM
  if (content.includes('createRenderRoot') && content.includes('return this as any')) {
    console.log(`  ✅ Uses light DOM for USWDS compatibility`);
    results.passed++;
  } else {
    console.log(`  ❌ Missing light DOM implementation`);
    results.errors.push(
      `Must use light DOM (createRenderRoot returning this) for USWDS compatibility`
    );
    results.failed++;
  }

  // Should dispatch USWDS-style events
  if (content.includes('date-change') && content.includes('CustomEvent')) {
    console.log(`  ✅ Dispatches USWDS-style events`);
    results.passed++;
  } else {
    console.log(`  ⚠️  Missing USWDS-style event dispatching`);
    results.warnings.push(`Consider dispatching 'date-change' events for USWDS consistency`);
    results.warnings++;
  }

  // Run JavaScript behavior validation
  console.log(`\n🔧 Running JavaScript behavior validation...`);
  // Initialize the structure that validateUSWDSJavaScript expects
  const jsResults = {
    tests: { behavior: [] },
    issues: [],
    warnings: []
  };
  const jsValidation = validateUSWDSJavaScript(content, componentName, jsResults);

  if (jsValidation.hasErrors) {
    console.log(`  ❌ JavaScript validation failed with ${jsValidation.issues.length} issue(s)`);
    results.failed += jsValidation.issues.length;
    results.errors.push(...jsValidation.issues);
  } else {
    console.log(`  ✅ JavaScript validation passed (${jsValidation.score}% compliance)`);
    results.passed += jsValidation.tests.filter(t => t.status === 'pass').length;
  }

  // Add JavaScript warnings to main results
  if (jsValidation.warnings.length > 0) {
    results.warnings.push(...jsValidation.warnings);
    results.warningCount += jsValidation.warnings.length;
  }

  return results;
}

/**
 * Generate compliance report
 */
function generateComplianceReport(results) {
  const totalChecks = results.passed + results.failed + results.warningCount;
  const passRate = totalChecks > 0 ? Math.round((results.passed / totalChecks) * 100) : 0;

  console.log(`\n📊 USWDS Compliance Report`);
  console.log(`==========================`);
  console.log(`File: ${results.file}`);
  console.log(`Component: ${results.component}`);
  console.log(`Pass Rate: ${passRate}% (${results.passed}/${totalChecks})`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warningCount}`);

  if (results.errors.length > 0) {
    console.log(`\n❌ Critical Issues:`);
    results.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (results.warnings.length > 0) {
    console.log(`\n⚠️  Recommendations:`);
    results.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (results.suggestions.length > 0) {
    console.log(`\n💡 Suggestions:`);
    results.suggestions.forEach((suggestion) => console.log(`  - ${suggestion}`));
  }

  // Compliance level determination
  let complianceLevel = 'Unknown';
  if (passRate >= 95) complianceLevel = '🏆 Excellent';
  else if (passRate >= 85) complianceLevel = '✅ Good';
  else if (passRate >= 70) complianceLevel = '⚠️  Needs Improvement';
  else complianceLevel = '❌ Poor';

  console.log(`\n🎯 Compliance Level: ${complianceLevel}`);

  return passRate >= 85; // Return true if compliance is acceptable
}

// Main execution
const args = process.argv.slice(2);
const filePath = args[0] || 'src/components/date-picker/usa-date-picker.ts';
// Extract component name from file path
const extractedComponentName = filePath.match(/src\/components\/([^/]+)\//)?.[1] || 'date-picker';
// Only run when called directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  const componentName = args[1] || extractedComponentName;

  console.log(`🔍 USWDS Compliance Validator`);
  console.log(`Checking: ${filePath}`);

  // Only validate date-picker components with this script
  // Other components use the general USWDS compliance checker
  if (componentName !== 'date-picker') {
    console.log(`📝 Skipping detailed validation for ${componentName} component`);
    console.log(`✅ Non-date-picker components use general USWDS compliance validation`);
    process.exit(0);
  }

  const results = validateUSWDSCompliance(filePath, componentName);
  const isCompliant = generateComplianceReport(results);

  // Exit with error code if compliance is poor
  if (!isCompliant) {
    console.log(`\n💥 USWDS compliance validation failed!`);
    console.log(`Please address the issues above before committing changes.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 USWDS compliance validation passed!`);
    process.exit(0);
  }
}

export { validateUSWDSCompliance, generateComplianceReport };
