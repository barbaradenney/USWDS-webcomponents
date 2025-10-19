#!/usr/bin/env node

/**
 * Slot Rendering Validation Script
 *
 * Validates that all components using slots properly handle light DOM slot rendering
 * to prevent content duplication issues.
 *
 * Usage:
 *   node validate-slot-rendering.js              # Validate all components
 *   node validate-slot-rendering.js card modal   # Validate specific components
 *   MODIFIED_COMPONENTS="card\nmodal" node ...   # From pre-commit hook
 *
 * Checks:
 * 1. Components with named slots have CSS to hide direct children with [slot] attribute
 * 2. Components that capture innerHTML clear it to prevent duplication
 * 3. Components don't have both approaches (redundant)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// All components that use slots
const ALL_SLOT_COMPONENTS = [
  'accordion',
  'alert',
  'button-group',
  'card',
  'footer',
  'header',
  'list',
  'modal',
  'process-list',
  'prose',
  'section',
  'select',
  'side-navigation',
  'site-alert',
  'step-indicator',
  'summary-box',
  'table',
  'tag',
  'tooltip'
];

// Determine which components to check
let SLOT_COMPONENTS;

// Check for components passed via environment variable (from pre-commit hook)
if (process.env.MODIFIED_COMPONENTS) {
  const modifiedComponents = process.env.MODIFIED_COMPONENTS.split('\n').filter(Boolean);
  // Only check modified components that use slots
  SLOT_COMPONENTS = modifiedComponents.filter(comp => ALL_SLOT_COMPONENTS.includes(comp));

  if (SLOT_COMPONENTS.length === 0) {
    console.log('✅ No slot-using components modified. Skipping slot validation.\n');
    process.exit(0);
  }
}
// Check for components passed as command-line arguments
else if (process.argv.length > 2) {
  SLOT_COMPONENTS = process.argv.slice(2).filter(comp => ALL_SLOT_COMPONENTS.includes(comp));

  if (SLOT_COMPONENTS.length === 0) {
    console.error('❌ No valid slot components specified.\n');
    console.log('Valid components:', ALL_SLOT_COMPONENTS.join(', '));
    process.exit(1);
  }
}
// Default: check all components
else {
  SLOT_COMPONENTS = ALL_SLOT_COMPONENTS;
}

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function checkComponent(componentName) {
  const componentPath = path.join(projectRoot, 'src', 'components', componentName, `usa-${componentName}.ts`);

  if (!fs.existsSync(componentPath)) {
    results.warnings.push({
      component: componentName,
      issue: 'Component file not found',
      path: componentPath
    });
    return;
  }

  const content = fs.readFileSync(componentPath, 'utf-8');

  // Check for named slots
  const namedSlotRegex = /<slot\s+name=/g;
  const hasNamedSlots = namedSlotRegex.test(content);

  // Check for unnamed/default slots
  const unnamedSlotRegex = /<slot(?:\s*>|\s+[^n])/g;
  const hasUnnamedSlots = unnamedSlotRegex.test(content);

  // Check for CSS hiding slotted children
  const cssHideSlotRegex = /:host\s*>\s*\[slot\]\s*\{[^}]*display:\s*none/;
  const hasCSSHide = cssHideSlotRegex.test(content);

  // Check for innerHTML capture pattern (old approach)
  const capturePatternRegex = /this\.innerHTML\s*=\s*['"]['"];|this\.innerHTML\s*=\s*'';/;
  const hasInnerHTMLCapture = capturePatternRegex.test(content);

  // Check for manual content projection pattern (new approach - like alert)
  const manualProjectionRegex = /childNodes_.*Array\.from\(this\.childNodes\)|appendChild\(node\)/s;
  const hasManualProjection = manualProjectionRegex.test(content);

  // Check for light DOM
  const lightDOMRegex = /createRenderRoot\(\).*return\s+this/s;
  const usesLightDOM = lightDOMRegex.test(content);

  // Validation logic
  const issues = [];
  const info = [];

  if (!usesLightDOM) {
    info.push('Uses Shadow DOM (slot duplication not an issue)');
  } else {
    // Light DOM components need protection against duplication
    const hasProtection = hasCSSHide || hasInnerHTMLCapture || hasManualProjection;

    if (hasNamedSlots && !hasProtection) {
      issues.push('Has named slots but no protection against duplication');
    }

    if (hasUnnamedSlots && !hasProtection) {
      issues.push('Has unnamed slot but no manual content handling');
    }

    if ((hasCSSHide ? 1 : 0) + (hasInnerHTMLCapture ? 1 : 0) + (hasManualProjection ? 1 : 0) > 1) {
      issues.push('Has multiple approaches (redundant - choose one)');
    }

    // Track what protection is in place
    if (hasCSSHide) {
      info.push('✓ Uses CSS to hide slotted children');
    }
    if (hasInnerHTMLCapture) {
      info.push('✓ Captures and clears innerHTML');
    }
    if (hasManualProjection) {
      info.push('✓ Uses manual content projection (like alert)');
    }
  }

  const result = {
    component: componentName,
    hasNamedSlots,
    hasUnnamedSlots,
    usesLightDOM,
    hasCSSHide,
    hasInnerHTMLCapture,
    hasManualProjection,
    info,
    issues
  };

  if (issues.length > 0) {
    results.failed.push(result);
  } else {
    results.passed.push(result);
  }
}

// Run validation
const isFiltered = process.env.MODIFIED_COMPONENTS || process.argv.length > 2;
if (isFiltered) {
  console.log('🔍 Validating Slot Rendering for Modified Components\n');
  console.log(`Checking ${SLOT_COMPONENTS.length} modified component(s) that use slots...\n`);
} else {
  console.log('🔍 Validating Slot Rendering for All Components\n');
  console.log(`Checking ${SLOT_COMPONENTS.length} components that use slots...\n`);
}

SLOT_COMPONENTS.forEach(checkComponent);

// Report results
console.log('━'.repeat(80));
console.log('RESULTS');
console.log('━'.repeat(80));

if (results.passed.length > 0) {
  console.log(`\n✅ PASSED (${results.passed.length}):\n`);
  results.passed.forEach(r => {
    console.log(`  ${r.component}`);
    r.info.forEach(i => console.log(`    ${i}`));
  });
}

if (results.failed.length > 0) {
  console.log(`\n❌ FAILED (${results.failed.length}):\n`);
  results.failed.forEach(r => {
    console.log(`  ${r.component}`);
    r.issues.forEach(i => console.log(`    ⚠️  ${i}`));
    if (r.info.length > 0) {
      r.info.forEach(i => console.log(`    ${i}`));
    }
  });
}

if (results.warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${results.warnings.length}):\n`);
  results.warnings.forEach(w => {
    console.log(`  ${w.component}: ${w.issue}`);
  });
}

console.log('\n' + '━'.repeat(80));
console.log(`Summary: ${results.passed.length} passed, ${results.failed.length} failed, ${results.warnings.length} warnings`);
console.log('━'.repeat(80) + '\n');

// Exit with error if any failures
if (results.failed.length > 0) {
  console.error('❌ Slot rendering validation failed. Please fix the issues above.\n');
  process.exit(1);
}

console.log('✅ All components with slots are properly configured!\n');
process.exit(0);
