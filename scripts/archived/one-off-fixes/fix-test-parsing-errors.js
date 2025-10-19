#!/usr/bin/env node

/**
 * Fix Test File Parsing Errors Script
 *
 * Fixes specific parsing errors in test files:
 * - Double commas in import statements
 * - Other identifier parsing issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Fixing test file parsing errors...');

function fixTestFiles() {
  let fixedCount = 0;

  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentDirs = fs.readdirSync(componentsDir);

  componentDirs.forEach((componentDir) => {
    const componentPath = path.join(componentsDir, componentDir);
    if (!fs.statSync(componentPath).isDirectory()) return;

    const testFile = path.join(componentPath, `usa-${componentDir}.test.ts`);
    if (fs.existsSync(testFile)) {
      let content = fs.readFileSync(testFile, 'utf8');
      let modified = false;

      // Fix double commas in imports
      if (content.includes(',,')) {
        content = content.replace(/,,+/g, ',');
        modified = true;
      }

      // Fix trailing commas in imports
      content = content.replace(/,\s*}/g, '\n}');

      // Fix other common parsing issues
      const lines = content.split('\n');
      const fixedLines = lines.map((line) => {
        let fixedLine = line;

        // Fix import statement issues
        if (line.includes('import') && line.includes(',')) {
          // Remove any double commas
          fixedLine = fixedLine.replace(/,,+/g, ',');

          // Fix trailing comma before closing brace
          fixedLine = fixedLine.replace(/,\s*}/, ' }');

          if (fixedLine !== line) {
            modified = true;
          }
        }

        return fixedLine;
      });

      if (modified) {
        fs.writeFileSync(testFile, fixedLines.join('\n'));
        console.log(`  ✅ Fixed parsing errors in ${componentDir} test file`);
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

// Main execution
async function main() {
  try {
    console.log('📝 Processing test files...');
    const fixedCount = fixTestFiles();

    console.log(`\n📊 Fixed parsing errors in ${fixedCount} test files`);
    console.log('✅ Test file parsing fixes completed!');
  } catch (error) {
    console.error('❌ Error fixing test files:', error);
    process.exit(1);
  }
}

main();
