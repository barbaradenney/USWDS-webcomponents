#!/usr/bin/env node

/**
 * Fix Final USWDS Variable Issues Script
 *
 * Fixes remaining TypeScript errors for USWDS variables:
 * 1. Missing USWDS variable declarations
 * 2. Unused USWDS variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Fixing final USWDS variable issues...');

// Components that need USWDS variable declared
const needsUSWDSVar = [
  'date-range-picker',
  'input-prefix-suffix',
  'language-selector',
  'memorable-date',
  'process-list',
  'range-slider',
  'side-navigation',
  'site-alert',
  'skip-link',
  'step-indicator',
  'summary-box',
  'text-input'
];

// Components that have unused USWDS variable
const hasUnusedUSWDS = [
  'file-input',
  'modal'
];

function fixMissingUSWDSVar() {
  let fixedCount = 0;

  needsUSWDSVar.forEach(componentName => {
    const filePath = path.join(projectRoot, 'src', 'components', componentName, `usa-${componentName}.ts`);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Look for USWDS usage without declaration
    if (content.includes('USWDS.') && !content.includes('const USWDS = (window as any).USWDS;')) {
      // Find the line where USWDS is first used and add declaration before it
      const lines = content.split('\n');
      const fixedLines = [];
      let added = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Add USWDS declaration before first usage
        if (!added && line.includes('USWDS.') && !line.includes('typeof (window as any).USWDS')) {
          // Find the appropriate indentation
          const indent = line.match(/^(\s*)/)[1];
          fixedLines.push(`${indent}const USWDS = (window as any).USWDS;`);
          added = true;
        }

        fixedLines.push(line);
      }

      if (added) {
        fs.writeFileSync(filePath, fixedLines.join('\n'));
        console.log(`  ✅ Added USWDS variable declaration to ${componentName}`);
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

function fixUnusedUSWDSVar() {
  let fixedCount = 0;

  hasUnusedUSWDS.forEach(componentName => {
    const filePath = path.join(projectRoot, 'src', 'components', componentName, `usa-${componentName}.ts`);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Remove unused USWDS variable declarations
    const lines = content.split('\n');
    const fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip unused USWDS variable declarations
      if (line.includes('const USWDS = (window as any).USWDS;') &&
          !content.includes('USWDS.') ||
          (content.match(/USWDS\./g) || []).length <= 1) {
        console.log(`  ✅ Removed unused USWDS variable from ${componentName}`);
        fixedCount++;
        continue;
      }

      fixedLines.push(line);
    }

    if (fixedLines.length !== lines.length) {
      fs.writeFileSync(filePath, fixedLines.join('\n'));
    }
  });

  return fixedCount;
}

// Main execution
async function main() {
  try {
    console.log('📝 Fixing missing USWDS variable declarations...');
    const addedCount = fixMissingUSWDSVar();

    console.log('📝 Removing unused USWDS variables...');
    const removedCount = fixUnusedUSWDSVar();

    console.log(`\n📊 Fixed ${addedCount} missing declarations and removed ${removedCount} unused variables`);
    console.log('✅ All USWDS variable issues resolved!');

  } catch (error) {
    console.error('❌ Error fixing USWDS variables:', error);
    process.exit(1);
  }
}

main();