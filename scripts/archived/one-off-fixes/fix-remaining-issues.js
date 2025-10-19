#!/usr/bin/env node

/**
 * Fix Remaining TypeScript Issues Script
 *
 * Fixes remaining TypeScript issues after the initial cleanup:
 * 1. Add USWDS variable declarations where they're referenced but missing
 * 2. Remove unused function declarations
 * 3. Fix missing function calls in card component
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Fixing remaining TypeScript issues...');

// Fix 1: Add USWDS variable declarations where referenced but removed
function fixMissingUSWDSVariables() {
  console.log('📝 Adding missing USWDS variable declarations...');

  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentDirs = fs.readdirSync(componentsDir);

  let fixedCount = 0;

  componentDirs.forEach(componentDir => {
    const componentPath = path.join(componentsDir, componentDir);
    if (!fs.statSync(componentPath).isDirectory()) return;

    const tsFile = path.join(componentPath, `usa-${componentDir}.ts`);
    if (!fs.existsSync(tsFile)) return;

    let content = fs.readFileSync(tsFile, 'utf8');
    let modified = false;

    // Pattern: References to USWDS.something after "USWDS variable removed" comment
    const lines = content.split('\n');
    const fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      fixedLines.push(line);

      // If we see "USWDS variable removed" comment, check if next lines reference USWDS
      if (line.includes('// USWDS variable removed (unused)')) {
        // Look ahead to see if there are USWDS references
        let hasUSWDSReferences = false;
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          if (lines[j].includes('USWDS.') && !lines[j].includes('//')) {
            hasUSWDSReferences = true;
            break;
          }
        }

        if (hasUSWDSReferences) {
          // Add the USWDS variable declaration after the comment
          const indentation = line.match(/^(\s*)/)[1];
          fixedLines.push(`${indentation}const USWDS = (window as any).USWDS;`);
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(tsFile, fixedLines.join('\n'));
      fixedCount++;
      console.log(`  ✅ Added missing USWDS variables in ${componentDir}`);
    }
  });

  console.log(`📊 Fixed missing USWDS variables in ${fixedCount} components`);
}

// Fix 2: Remove unused function declarations
function removeUnusedFunctions() {
  console.log('📝 Removing unused function declarations...');

  const files = [
    'src/components/link/usa-link.ts',
    'src/components/list/usa-list.ts',
    'src/components/tooltip/usa-tooltip.ts'
  ];

  let fixedCount = 0;

  files.forEach(relativePath => {
    const filePath = path.join(projectRoot, relativePath);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove unused function declarations
    const unusedFunctions = [
      'initializeUSWDSLink',
      'initializeUSWDSList',
      'initializeUSWDSTooltip'
    ];

    unusedFunctions.forEach(funcName => {
      const funcPattern = new RegExp(`\\s*private async ${funcName}\\(\\)[^{]*\\{[^}]*\\}\\s*`, 'g');
      if (content.match(funcPattern)) {
        content = content.replace(funcPattern, '');
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(`  ✅ Removed unused functions in ${relativePath}`);
    }
  });

  console.log(`📊 Removed unused functions in ${fixedCount} files`);
}

// Fix 3: Fix card component missing function call
function fixCardComponent() {
  console.log('📝 Fixing card component...');

  const cardFile = path.join(projectRoot, 'src/components/card/usa-card.ts');
  if (!fs.existsSync(cardFile)) return;

  let content = fs.readFileSync(cardFile, 'utf8');

  // Remove the call to initializeUSWDSCard since the function is commented out
  const lines = content.split('\n');
  const fixedLines = lines.filter(line =>
    !line.includes('this.initializeUSWDSCard()')
  );

  const newContent = fixedLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(cardFile, newContent);
    console.log('  ✅ Fixed card component missing function call');
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Running remaining issue fixes...\n');

    fixMissingUSWDSVariables();
    console.log('');

    removeUnusedFunctions();
    console.log('');

    fixCardComponent();
    console.log('');

    console.log('✅ Remaining issues fix completed!');
    console.log('🔍 Run npm run typecheck to verify fixes');

  } catch (error) {
    console.error('❌ Error fixing remaining issues:', error);
    process.exit(1);
  }
}

main();