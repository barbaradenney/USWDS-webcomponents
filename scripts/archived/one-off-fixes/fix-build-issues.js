#!/usr/bin/env node

/**
 * Fix Build Issues Script
 *
 * Fixes common build issues introduced by the JavaScript validation integration:
 * 1. Remove unused USWDS variables
 * 2. Fix duplicate import statements
 * 3. Add process global to compliance files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Starting build issues fix...');

// Fix 1: Remove unused USWDS variables in component files
function fixUnusedUSWDSVariables() {
  console.log('📝 Fixing unused USWDS variables...');

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

    // Pattern 1: const USWDS = (window as any).USWDS; (unused)
    const unusedUSWDSPattern = /^(\s*)const USWDS = \(window as any\)\.USWDS;\s*$/gm;
    if (content.match(unusedUSWDSPattern)) {
      content = content.replace(unusedUSWDSPattern, '$1// USWDS variable removed (unused)');
      modified = true;
      console.log(`  ✅ Fixed unused USWDS variable in ${componentDir}`);
    }

    // Pattern 2: Empty blocks with just USWDS assignment
    const emptyUSWDSBlockPattern = /(\s*)if \(typeof \(window as any\)\.USWDS !== 'undefined'\) \{\s*const USWDS = \(window as any\)\.USWDS;\s*\}/gm;
    if (content.match(emptyUSWDSBlockPattern)) {
      content = content.replace(emptyUSWDSBlockPattern, '$1// USWDS integration placeholder (removed unused variable)');
      modified = true;
      console.log(`  ✅ Fixed empty USWDS block in ${componentDir}`);
    }

    if (modified) {
      fs.writeFileSync(tsFile, content);
      fixedCount++;
    }
  });

  console.log(`📊 Fixed unused USWDS variables in ${fixedCount} components`);
}

// Fix 2: Fix duplicate import statements in test files
function fixDuplicateImports() {
  console.log('📝 Fixing duplicate import statements...');

  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentDirs = fs.readdirSync(componentsDir);

  let fixedCount = 0;

  componentDirs.forEach(componentDir => {
    const componentPath = path.join(componentsDir, componentDir);
    if (!fs.statSync(componentPath).isDirectory()) return;

    const testFile = path.join(componentPath, `usa-${componentDir}.test.ts`);
    if (!fs.existsSync(testFile)) return;

    let content = fs.readFileSync(testFile, 'utf8');
    let modified = false;

    // Fix duplicate import lines that cause parsing errors
    const lines = content.split('\n');
    const fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for duplicate import pattern
      if (line.includes('import { validateComponentJavaScript }') &&
          lines[i-1] && lines[i-1].includes('import {')) {
        // This is a duplicate, merge with previous import
        const prevLine = fixedLines[fixedLines.length - 1];
        if (prevLine.includes('import {') && !prevLine.includes('validateComponentJavaScript')) {
          // Merge imports
          const merged = prevLine.replace('} from', ', validateComponentJavaScript } from');
          fixedLines[fixedLines.length - 1] = merged;
          modified = true;
          continue;
        }
      }

      fixedLines.push(line);
    }

    if (modified) {
      fs.writeFileSync(testFile, fixedLines.join('\n'));
      fixedCount++;
      console.log(`  ✅ Fixed duplicate imports in ${componentDir} test file`);
    }
  });

  console.log(`📊 Fixed duplicate imports in ${fixedCount} test files`);
}

// Fix 3: Add process global to compliance files
function fixProcessGlobal() {
  console.log('📝 Adding process global to compliance files...');

  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentDirs = fs.readdirSync(componentsDir);

  let fixedCount = 0;

  componentDirs.forEach(componentDir => {
    const componentPath = path.join(componentsDir, componentDir);
    if (!fs.statSync(componentPath).isDirectory()) return;

    const complianceFile = path.join(componentPath, `usa-${componentDir}.compliance.js`);
    if (!fs.existsSync(complianceFile)) return;

    let content = fs.readFileSync(complianceFile, 'utf8');

    // Add process global at the top if not present
    if (!content.includes('/* global process */')) {
      content = '/* global process */\n' + content;
      fs.writeFileSync(complianceFile, content);
      fixedCount++;
      console.log(`  ✅ Added process global to ${componentDir} compliance file`);
    }
  });

  console.log(`📊 Added process global to ${fixedCount} compliance files`);
}

// Fix 4: Remove unused function declarations
function fixUnusedFunctions() {
  console.log('📝 Fixing unused function declarations...');

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

    // Pattern: unused initializeUSWDS function declarations
    const unusedFunctionPattern = /(\s*)private async initializeUSWDS\w+\(\)[^{]*\{\s*\/\/ Note:[^}]*\}\s*/gm;
    if (content.match(unusedFunctionPattern)) {
      // Comment out unused functions instead of removing them
      content = content.replace(unusedFunctionPattern, (match) => {
        return match.split('\n').map(line => line ? '  // ' + line : line).join('\n');
      });
      modified = true;
      console.log(`  ✅ Commented out unused function in ${componentDir}`);
    }

    if (modified) {
      fs.writeFileSync(tsFile, content);
      fixedCount++;
    }
  });

  console.log(`📊 Fixed unused functions in ${fixedCount} components`);
}

// Main execution
async function main() {
  try {
    console.log('🚀 Running comprehensive build fixes...\n');

    fixUnusedUSWDSVariables();
    console.log('');

    fixDuplicateImports();
    console.log('');

    fixProcessGlobal();
    console.log('');

    fixUnusedFunctions();
    console.log('');

    console.log('✅ Build issues fix completed!');
    console.log('🔍 Run npm run lint and npm run typecheck to verify fixes');

  } catch (error) {
    console.error('❌ Error fixing build issues:', error);
    process.exit(1);
  }
}

main();