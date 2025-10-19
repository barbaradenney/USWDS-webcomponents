#!/usr/bin/env node

/**
 * Fix Syntax Errors Script
 *
 * Comprehensive fix for TypeScript syntax errors caused by incomplete function removal.
 * Specifically targets link, list, and tooltip components with orphaned code fragments.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Fixing TypeScript syntax errors...');

// Fix link component
function fixLinkComponent() {
  const linkFile = path.join(projectRoot, 'src/components/link/usa-link.ts');
  if (!fs.existsSync(linkFile)) return;

  let content = fs.readFileSync(linkFile, 'utf8');

  // Remove orphaned code fragments after function removal
  const lines = content.split('\n');
  const fixedLines = [];
  let skipOrphanedCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of orphaned code after "Allow default navigation" comment
    if (line.includes('// Allow default navigation unless prevented') &&
        lines[i + 1] && lines[i + 1].includes('}// Fallback:')) {
      fixedLines.push(line);
      fixedLines.push('  }');
      // Skip the orphaned code
      skipOrphanedCode = true;
      continue;
    }

    // Stop skipping when we reach the next valid method
    if (skipOrphanedCode && line.trim().startsWith('override disconnectedCallback')) {
      skipOrphanedCode = false;
      fixedLines.push('');
      fixedLines.push(line);
      continue;
    }

    // Skip orphaned lines
    if (skipOrphanedCode) {
      continue;
    }

    fixedLines.push(line);
  }

  const newContent = fixedLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(linkFile, newContent);
    console.log('  ✅ Fixed link component syntax errors');
  }
}

// Fix list component
function fixListComponent() {
  const listFile = path.join(projectRoot, 'src/components/list/usa-list.ts');
  if (!fs.existsSync(listFile)) return;

  let content = fs.readFileSync(listFile, 'utf8');

  // Remove orphaned code fragments after function removal
  const lines = content.split('\n');
  const fixedLines = [];
  let skipOrphanedCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect orphaned code patterns - look for disconnected try/catch blocks
    if (line.includes('} catch (error)') && !skipOrphanedCode) {
      // Look back to see if this is part of an orphaned block
      let isOrphaned = true;
      for (let j = Math.max(0, i - 10); j < i; j++) {
        if (lines[j].includes('try {') || lines[j].includes('private async')) {
          isOrphaned = false;
          break;
        }
      }

      if (isOrphaned) {
        skipOrphanedCode = true;
        continue;
      }
    }

    // Stop skipping when we reach the next valid method or end of class
    if (skipOrphanedCode && (line.trim().startsWith('override ') || line.trim() === '}')) {
      skipOrphanedCode = false;
      if (line.trim() !== '}') {
        fixedLines.push('');
      }
      fixedLines.push(line);
      continue;
    }

    // Skip orphaned lines
    if (skipOrphanedCode) {
      continue;
    }

    fixedLines.push(line);
  }

  const newContent = fixedLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(listFile, newContent);
    console.log('  ✅ Fixed list component syntax errors');
  }
}

// Fix tooltip component
function fixTooltipComponent() {
  const tooltipFile = path.join(projectRoot, 'src/components/tooltip/usa-tooltip.ts');
  if (!fs.existsSync(tooltipFile)) return;

  let content = fs.readFileSync(tooltipFile, 'utf8');

  // Remove orphaned code fragments after function removal
  const lines = content.split('\n');
  const fixedLines = [];
  let skipOrphanedCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for orphaned try blocks without proper function context
    if (line.includes('} catch (error)') && !skipOrphanedCode) {
      // Check if this is an orphaned catch block
      let hasMatchingTry = false;
      let functionDepth = 0;

      for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
        if (lines[j].includes('private async ') || lines[j].includes('override ')) {
          break;
        }
        if (lines[j].includes('try {')) {
          hasMatchingTry = true;
          break;
        }
      }

      if (!hasMatchingTry) {
        skipOrphanedCode = true;
        continue;
      }
    }

    // Stop skipping when we reach a valid method or render function
    if (skipOrphanedCode && (
        line.trim().startsWith('override render') ||
        line.trim().startsWith('private ') ||
        line.trim() === '}' // class closing brace
    )) {
      skipOrphanedCode = false;
      if (line.trim() !== '}') {
        fixedLines.push('');
      }
      fixedLines.push(line);
      continue;
    }

    // Skip orphaned lines
    if (skipOrphanedCode) {
      continue;
    }

    fixedLines.push(line);
  }

  const newContent = fixedLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(tooltipFile, newContent);
    console.log('  ✅ Fixed tooltip component syntax errors');
  }
}

// Generic orphaned code cleaner for any remaining issues
function cleanOrphanedCode() {
  console.log('📝 Cleaning up any remaining orphaned code...');

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

    // Clean up any duplicate USWDS variable declarations
    const lines = content.split('\n');
    const cleanedLines = [];
    let lastLine = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip duplicate USWDS variable declarations
      if (line.includes('const USWDS = (window as any).USWDS;') &&
          lastLine.includes('const USWDS = (window as any).USWDS;')) {
        modified = true;
        continue;
      }

      // Remove orphaned comments without context
      if (line.trim() === '// USWDS variable removed (unused)' &&
          (!lines[i + 1] || !lines[i + 1].includes('const USWDS'))) {
        modified = true;
        continue;
      }

      cleanedLines.push(line);
      lastLine = line;
    }

    if (modified) {
      fs.writeFileSync(tsFile, cleanedLines.join('\n'));
      fixedCount++;
      console.log(`  ✅ Cleaned orphaned code in ${componentDir}`);
    }
  });

  if (fixedCount > 0) {
    console.log(`📊 Cleaned orphaned code in ${fixedCount} components`);
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Running comprehensive syntax error fixes...\n');

    console.log('📝 Fixing specific component syntax errors...');
    fixLinkComponent();
    fixListComponent();
    fixTooltipComponent();
    console.log('');

    cleanOrphanedCode();
    console.log('');

    console.log('✅ All syntax errors fixed!');
    console.log('🔍 Run npm run typecheck to verify fixes');

  } catch (error) {
    console.error('❌ Error fixing syntax errors:', error);
    process.exit(1);
  }
}

main();