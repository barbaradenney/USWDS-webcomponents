#!/usr/bin/env node

/**
 * Comprehensive USWDS Variable Fix Script
 *
 * Fixes all USWDS variable issues by:
 * 1. Adding const USWDS declarations where needed
 * 2. Removing unused USWDS variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Comprehensive USWDS variable fixes...');

function fixComponentUSWDSVariables() {
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

    // Check if component uses USWDS but doesn't declare it
    const usesUSWDS = content.includes('USWDS.') || content.includes("USWDS['");
    const hasUSWDSDeclaration = content.includes('const USWDS = (window as any).USWDS;');

    if (usesUSWDS && !hasUSWDSDeclaration) {
      // Find first USWDS usage and add declaration before it
      const lines = content.split('\n');
      const fixedLines = [];
      let addedDeclaration = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Add USWDS declaration before first usage
        if (!addedDeclaration && (line.includes('USWDS.') || line.includes("USWDS['")) &&
            !line.includes('typeof (window as any).USWDS')) {

          // Find appropriate indentation
          const indent = line.match(/^(\s*)/)[1];
          fixedLines.push(`${indent}const USWDS = (window as any).USWDS;`);
          addedDeclaration = true;
          modified = true;
        }

        fixedLines.push(line);
      }

      if (modified) {
        content = fixedLines.join('\n');
        console.log(`  ✅ Added USWDS declaration to ${componentDir}`);
        fixedCount++;
      }
    }

    // Check for unused USWDS variables
    if (hasUSWDSDeclaration && !usesUSWDS) {
      const lines = content.split('\n');
      const fixedLines = lines.filter(line =>
        !line.includes('const USWDS = (window as any).USWDS;') ||
        line.includes('// USWDS variable removed')
      );

      if (fixedLines.length !== lines.length) {
        content = fixedLines.join('\n');
        console.log(`  ✅ Removed unused USWDS variable from ${componentDir}`);
        fixedCount++;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(tsFile, content);
    }
  });

  return fixedCount;
}

// Main execution
async function main() {
  try {
    console.log('📝 Fixing USWDS variable issues across all components...');
    const fixedCount = fixComponentUSWDSVariables();

    console.log(`\n📊 Fixed USWDS variable issues in ${fixedCount} components`);
    console.log('✅ All USWDS variable issues resolved!');
    console.log('🔍 Run npm run typecheck to verify fixes');

  } catch (error) {
    console.error('❌ Error fixing USWDS variables:', error);
    process.exit(1);
  }
}

main();