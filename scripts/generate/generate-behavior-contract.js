#!/usr/bin/env node

/**
 * Generate USWDS Behavior Contract Documentation
 *
 * Creates standardized behavior contract documentation for components
 * with vanilla JS implementations that mirror USWDS source.
 *
 * Usage:
 *   node scripts/generate-behavior-contract.js --component=modal
 *   npm run generate:behavior-contract -- --component=modal
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Component metadata
const COMPONENT_METADATA = {
  modal: {
    name: 'Modal',
    uswdsPackage: 'usa-modal',
    complexity: 'high',
    keyBehaviors: [
      'Modal open/close toggle',
      'Focus trap management',
      'Escape key handling',
      'Overlay click handling',
      'Force action variant (no close)',
    ],
  },
  'date-picker': {
    name: 'Date Picker',
    uswdsPackage: 'usa-date-picker',
    complexity: 'high',
    keyBehaviors: [
      'Calendar rendering',
      'Date selection',
      'Keyboard navigation',
      'Min/max date validation',
      'Input formatting',
    ],
  },
  'time-picker': {
    name: 'Time Picker',
    uswdsPackage: 'usa-time-picker',
    complexity: 'high',
    keyBehaviors: [
      'Combo box transformation',
      'Time filtering',
      'Step increment validation',
      'Input formatting',
    ],
  },
  tooltip: {
    name: 'Tooltip',
    uswdsPackage: 'usa-tooltip',
    complexity: 'high',
    keyBehaviors: [
      'Tooltip positioning',
      'Hover/focus events',
      'Wrapper element creation',
      'Position adjustment',
    ],
  },
  header: {
    name: 'Header',
    uswdsPackage: 'usa-header',
    complexity: 'high',
    keyBehaviors: [
      'Navigation menu toggle',
      'Focus trap management',
      'Resize event handling',
      'Menu collapse/expand',
    ],
  },
  'file-input': {
    name: 'File Input',
    uswdsPackage: 'usa-file-input',
    complexity: 'medium',
    keyBehaviors: [
      'Drag and drop handling',
      'File preview generation',
      'Multiple file support',
      'File validation',
    ],
  },
  table: {
    name: 'Table',
    uswdsPackage: 'usa-table',
    complexity: 'medium',
    keyBehaviors: [
      'Sortable header clicks',
      'Sort direction toggle',
      'ARIA sort attributes',
      'Row reordering',
    ],
  },
  footer: {
    name: 'Footer',
    uswdsPackage: 'usa-footer',
    complexity: 'medium',
    keyBehaviors: [
      'Navigation collapse toggle',
      'Accordion behavior',
      'Button expanded state',
    ],
  },
  search: {
    name: 'Search',
    uswdsPackage: 'usa-search',
    complexity: 'medium',
    keyBehaviors: [
      'Search button toggle',
      'Big/small variant handling',
      'Input visibility toggle',
    ],
  },
  'in-page-navigation': {
    name: 'In-Page Navigation',
    uswdsPackage: 'usa-in-page-navigation',
    complexity: 'medium',
    keyBehaviors: [
      'Scroll spy functionality',
      'Active section tracking',
      'Smooth scrolling',
      'Threshold detection',
    ],
  },
  banner: {
    name: 'Banner',
    uswdsPackage: 'usa-banner',
    complexity: 'low',
    keyBehaviors: [
      'Button toggle',
      'Content expand/collapse',
      'ARIA expanded state',
    ],
  },
  'language-selector': {
    name: 'Language Selector',
    uswdsPackage: 'usa-language-selector',
    complexity: 'low',
    keyBehaviors: [
      'Dropdown toggle',
      'Language selection',
      'Button state management',
    ],
  },
  'character-count': {
    name: 'Character Count',
    uswdsPackage: 'usa-character-count',
    complexity: 'medium',
    keyBehaviors: [
      'Character counting',
      'Status message updates',
      'Validation state changes',
      'Max length enforcement',
    ],
  },
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const component = args
    .find(arg => arg.startsWith('--component='))
    ?.split('=')[1];

  if (!component) {
    console.error('❌ Error: --component argument is required');
    console.log('\nUsage:');
    console.log('  node scripts/generate-behavior-contract.js --component=modal');
    console.log('\nAvailable components:');
    Object.keys(COMPONENT_METADATA).forEach(name => {
      console.log(`  - ${name}`);
    });
    process.exit(1);
  }

  if (!COMPONENT_METADATA[component]) {
    console.error(`❌ Error: Unknown component "${component}"`);
    console.log('\nAvailable components:');
    Object.keys(COMPONENT_METADATA).forEach(name => {
      console.log(`  - ${name}`);
    });
    process.exit(1);
  }

  return { component };
}

/**
 * Read USWDS source file
 */
function readUSWDSSource(packageName) {
  const sourcePath = join(
    rootDir,
    'node_modules/@uswds/uswds/packages',
    packageName,
    'src/index.js'
  );

  if (!existsSync(sourcePath)) {
    console.warn(`⚠️  USWDS source not found: ${sourcePath}`);
    return null;
  }

  return readFileSync(sourcePath, 'utf8');
}

/**
 * Extract key functions from USWDS source
 */
function extractKeyFunctions(source) {
  if (!source) return [];

  const functions = [];
  const lines = source.split('\n');

  // Look for function declarations and exports
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Match various function patterns
    const patterns = [
      /^(?:export\s+)?(?:const|function)\s+(\w+)\s*[=(]/,
      /^const\s+(\w+)\s*=\s*\(/,
      /^\s*(\w+):\s*function/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        functions.push({
          name: match[1],
          lineNum,
          line: line.trim(),
        });
        break;
      }
    }
  });

  return functions;
}

/**
 * Generate behavior contract documentation
 */
function generateContract(component) {
  const metadata = COMPONENT_METADATA[component];
  const uswdsSource = readUSWDSSource(metadata.uswdsPackage);
  const functions = extractKeyFunctions(uswdsSource);

  const today = new Date().toISOString().split('T')[0];
  const packageJsonPath = join(rootDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const uswdsVersion = packageJson.dependencies['@uswds/uswds']?.replace('^', '') || '3.x';

  // Generate behavior sections
  const behaviorSections = metadata.keyBehaviors
    .map((behavior, index) => {
      const num = index + 1;
      return `### ${num}. ${behavior}

**USWDS Source**: Lines [TBD] in \`index.js\`

**Required Behavior**:
- ✅ [Describe expected behavior based on USWDS source]
- ✅ [Additional behavior requirement]
- ✅ [Additional behavior requirement]

**Validation Test**:
\`\`\`typescript
it('should ${behavior.toLowerCase()}', async () => {
  // TODO: Implement test based on USWDS behavior
  const element = document.createElement('usa-${component}');
  document.body.appendChild(element);
  await element.updateComplete;

  // Test implementation here
  expect(true).toBe(true);
});
\`\`\`
`;
    })
    .join('\n---\n\n');

  // Generate function reference section
  const functionReference =
    functions.length > 0
      ? `
## USWDS Source Functions

Key functions from USWDS source (for reference during implementation):

${functions
  .slice(0, 10)
  .map(
    fn => `- **\`${fn.name}()\`** - Line ${fn.lineNum}
  \`\`\`javascript
  ${fn.line}
  \`\`\``
  )
  .join('\n\n')}

${functions.length > 10 ? `\n*...and ${functions.length - 10} more functions*\n` : ''}
`
      : '';

  const contract = `# USWDS ${metadata.name} Behavior Contract

**Purpose**: This document defines the exact behavioral contract that our ${component} component MUST match with USWDS.

**Source**: \`@uswds/uswds/packages/${metadata.uswdsPackage}/src/index.js\` (USWDS ${uswdsVersion})

**Status**: MANDATORY - All implementations must pass automated validation against this contract.

**Complexity**: ${metadata.complexity.toUpperCase()}

**Last Updated**: ${today}

---

## Overview

The ${metadata.name} component mirrors USWDS JavaScript behavior exactly to maintain 100% behavioral parity.

**Implementation Files**:
- \`src/components/${component}/usa-${component}-behavior.ts\` - USWDS behavior mirror
- \`src/components/${component}/usa-${component}.ts\` - Web component wrapper

**Validation**:
- \`src/components/${component}/usa-${component}-behavior.test.ts\` - Behavioral tests

---

## Core Behaviors (MANDATORY)

${behaviorSections}

---

## Validation Requirements

- ✅ All behavioral tests must pass (100%)
- ✅ Component must match USWDS DOM structure exactly
- ✅ Component must replicate USWDS event handling patterns
- ✅ Component must maintain USWDS accessibility features (ARIA, keyboard)
- ✅ Component must handle edge cases identical to USWDS

---
${functionReference}
---

## USWDS Source References

- **Package**: [@uswds/uswds/packages/${metadata.uswdsPackage}](https://github.com/uswds/uswds/tree/develop/packages/${metadata.uswdsPackage})
- **Main File**: [index.js](https://github.com/uswds/uswds/blob/develop/packages/${metadata.uswdsPackage}/src/index.js)
- **USWDS Version**: ${uswdsVersion}
- **Last Synced**: ${today}

---

## Maintenance Notes

**When to Update**:
- 🔄 USWDS version upgrade
- 🐛 USWDS source code changes
- 🧪 New behavioral requirements discovered

**Update Process**:
1. Review USWDS source changes
2. Update behavior implementation
3. Update this contract document
4. Run all validation tests
5. Update \`Last Synced\` date

**Validation Command**:
\`\`\`bash
npm test -- usa-${component}-behavior.test.ts
\`\`\`

---

## Notes

> **⚠️ CRITICAL**: This component uses vanilla JS behavior mirroring.
> DO NOT add custom logic - ALL changes must come from USWDS source updates.

**Why Vanilla JS?**
- ${metadata.complexity === 'high' ? 'Complex behavior requiring direct USWDS source replication' : 'Component behavior requires USWDS source mirroring'}
- Ensures 100% behavioral parity with USWDS
- Prevents Storybook navigation issues and module caching conflicts

**Related Documentation**:
- [JavaScript Integration Strategy](../../../docs/JAVASCRIPT_INTEGRATION_STRATEGY.md)
- [Component README](./README.mdx)
`;

  return contract;
}

/**
 * Write contract to file
 */
function writeContract(component, contract) {
  const metadata = COMPONENT_METADATA[component];
  const outputPath = join(
    rootDir,
    'src/components',
    component,
    `USWDS_${metadata.name.toUpperCase().replace(/\s+/g, '_')}_BEHAVIOR_CONTRACT.md`
  );

  writeFileSync(outputPath, contract, 'utf8');
  return outputPath;
}

/**
 * Main execution
 */
function main() {
  console.log('🎯 USWDS Behavior Contract Generator\n');

  const { component } = parseArgs();
  const metadata = COMPONENT_METADATA[component];

  console.log(`📋 Generating contract for: ${metadata.name}`);
  console.log(`   Package: ${metadata.uswdsPackage}`);
  console.log(`   Complexity: ${metadata.complexity}`);
  console.log('');

  // Check if contract already exists
  const contractName = `USWDS_${metadata.name.toUpperCase().replace(/\s+/g, '_')}_BEHAVIOR_CONTRACT.md`;
  const existingPath = join(rootDir, 'src/components', component, contractName);

  if (existsSync(existingPath)) {
    console.log(`⚠️  Contract already exists: ${contractName}`);
    console.log('   Overwrite? (Ctrl+C to cancel)\n');
  }

  // Generate contract
  console.log('📖 Reading USWDS source...');
  const contract = generateContract(component);

  console.log('✍️  Generating contract document...');
  const outputPath = writeContract(component, contract);

  console.log('');
  console.log('✅ Behavior contract generated successfully!');
  console.log('');
  console.log(`📄 File: ${outputPath}`);
  console.log('');
  console.log('📝 Next Steps:');
  console.log(`   1. Review generated contract: cat "${outputPath}"`);
  console.log(`   2. Fill in [TBD] placeholders with actual USWDS line numbers`);
  console.log(`   3. Review USWDS source: node_modules/@uswds/uswds/packages/${metadata.uswdsPackage}/src/index.js`);
  console.log(`   4. Implement validation tests in usa-${component}-behavior.test.ts`);
  console.log(`   5. Add contract to git: git add "${outputPath}"`);
  console.log('');
}

main();
