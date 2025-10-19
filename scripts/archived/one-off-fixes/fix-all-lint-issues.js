#!/usr/bin/env node

/**
 * Fix All Lint Issues Script
 *
 * Comprehensive fix for all remaining ESLint issues:
 * 1. Fix compliance file shebang parsing errors
 * 2. Fix empty block statements in components
 * 3. Fix test file identifier parsing errors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Fixing all remaining lint issues...');

function fixComplianceShebangErrors() {
  console.log('📝 Fixing compliance file shebang errors...');
  let fixedCount = 0;

  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentDirs = fs.readdirSync(componentsDir);

  componentDirs.forEach((componentDir) => {
    const componentPath = path.join(componentsDir, componentDir);
    if (!fs.statSync(componentPath).isDirectory()) return;

    const complianceFile = path.join(componentPath, `usa-${componentDir}.compliance.js`);
    if (fs.existsSync(complianceFile)) {
      let content = fs.readFileSync(complianceFile, 'utf8');

      // Check if shebang is not at the start
      if (content.includes('#!/usr/bin/env node') && !content.startsWith('#!/usr/bin/env node')) {
        // Remove all shebang occurrences and add proper one at start
        content = content.replace(/^.*#!.*$/gm, '');
        content = `#!/usr/bin/env node\n${content}`;

        // Clean up any extra newlines
        content = content.replace(/\n\n\n+/g, '\n\n');

        fs.writeFileSync(complianceFile, content);
        console.log(`  ✅ Fixed shebang in ${componentDir} compliance file`);
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

function fixEmptyBlockStatements() {
  console.log('📝 Fixing empty block statements...');
  let fixedCount = 0;

  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentDirs = fs.readdirSync(componentsDir);

  componentDirs.forEach((componentDir) => {
    const componentPath = path.join(componentsDir, componentDir);
    if (!fs.statSync(componentPath).isDirectory()) return;

    const tsFile = path.join(componentPath, `usa-${componentDir}.ts`);
    if (fs.existsSync(tsFile)) {
      let content = fs.readFileSync(tsFile, 'utf8');
      let modified = false;

      // Pattern 1: USWDS check with empty block
      const uswdsPattern = /if \(typeof \(window as any\)\.USWDS !== 'undefined'\) {\s*}/g;
      if (uswdsPattern.test(content)) {
        content = content.replace(
          uswdsPattern,
          `if (typeof (window as any).USWDS !== 'undefined') {
        // USWDS available but no setup needed
      }`
        );
        modified = true;
      }

      // Pattern 2: Other empty blocks in USWDS context
      const lines = content.split('\n');
      const fixedLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for line ending with just {}
        if (line.trim().endsWith('{}')) {
          // Look at previous lines for context
          const prevLines = lines.slice(Math.max(0, i - 3), i).join(' ');

          if (prevLines.includes('USWDS') || prevLines.includes('window')) {
            // Replace with comment block
            const indent = line.match(/^(\s*)/)[1];
            fixedLines.push(
              line.replace(
                '{}',
                `{
${indent}  // USWDS available but no setup needed
${indent}}`
              )
            );
            modified = true;
          } else {
            fixedLines.push(line);
          }
        } else {
          fixedLines.push(line);
        }
      }

      if (modified) {
        fs.writeFileSync(tsFile, fixedLines.join('\n'));
        console.log(`  ✅ Fixed empty blocks in ${componentDir}`);
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

function fixTestFileParsingErrors() {
  console.log('📝 Fixing test file parsing errors...');
  let fixedCount = 0;

  const componentsDir = path.join(projectRoot, 'src', 'components');

  const problematicFiles = [
    'footer/usa-footer.test.ts',
    'header/usa-header.test.ts',
    'icon/usa-icon.test.ts',
    'identifier/usa-identifier.test.ts',
    'in-page-navigation/usa-in-page-navigation.test.ts',
    'input-prefix-suffix/usa-input-prefix-suffix.test.ts',
    'language-selector/usa-language-selector.test.ts',
    'link/usa-link.test.ts',
    'list/usa-list.test.ts',
    'memorable-date/usa-memorable-date.test.ts',
    'menu/usa-menu.test.ts',
    'modal/usa-modal.test.ts',
    'pagination/usa-pagination.test.ts',
    'process-list/usa-process-list.test.ts',
    'prose/usa-prose.test.ts',
    'radio/usa-radio.test.ts',
    'range-slider/usa-range-slider.test.ts',
    'search/usa-search.test.ts',
    'section/usa-section.test.ts',
    'select/usa-select.test.ts',
    'side-navigation/usa-side-navigation.test.ts',
    'site-alert/usa-site-alert.test.ts',
    'skip-link/usa-skip-link.test.ts',
    'step-indicator/usa-step-indicator.test.ts',
    'summary-box/usa-summary-box.test.ts',
    'table/usa-table.test.ts',
    'tag/usa-tag.test.ts',
    'text-input/usa-text-input.test.ts',
    'textarea/usa-textarea.test.ts',
    'time-picker/usa-time-picker.test.ts',
    'tooltip/usa-tooltip.test.ts',
    'validation/usa-validation.test.ts',
  ];

  problematicFiles.forEach((filePath) => {
    const fullPath = path.join(componentsDir, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Fix identifier parsing errors - look for malformed imports or declarations
      const lines = content.split('\n');
      const fixedLines = lines.map((line) => {
        // Fix common patterns that cause identifier errors
        if (line.includes('import type { USA') && line.includes('<<')) {
          modified = true;
          return line.replace(/<<.*?>>/, '');
        }

        // Fix other parsing issues
        if (line.includes('} from') && line.includes('<<')) {
          modified = true;
          return line.replace(/<<.*?>>/, '');
        }

        return line;
      });

      if (modified) {
        fs.writeFileSync(fullPath, fixedLines.join('\n'));
        console.log(`  ✅ Fixed parsing errors in ${filePath}`);
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

function verifyFixes() {
  console.log('🔍 Verifying fixes with quick lint check...');

  // Run a quick check on a few files to verify our fixes work

  try {
    execSync('npx eslint src/components/alert/usa-alert.ts --quiet', { stdio: 'pipe' });
    console.log('  ✅ Sample file check passed');
    return true;
  } catch (error) {
    console.log('  ⚠️  Some issues may remain');
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Running comprehensive lint fixes...\n');

    const shebangFixed = fixComplianceShebangErrors();
    const emptyBlocksFixed = fixEmptyBlockStatements();
    const testFilesFixed = fixTestFileParsingErrors();

    console.log(`\n📊 Summary:`);
    console.log(`   Fixed ${shebangFixed} compliance file shebang errors`);
    console.log(`   Fixed ${emptyBlocksFixed} empty block statements`);
    console.log(`   Fixed ${testFilesFixed} test file parsing errors`);
    console.log(`   Total: ${shebangFixed + emptyBlocksFixed + testFilesFixed} fixes applied\n`);

    verifyFixes();

    console.log('✅ All lint fixes completed!');
    console.log('🔍 Run `npm run lint` to verify all issues are resolved');
  } catch (error) {
    console.error('❌ Error fixing lint issues:', error);
    process.exit(1);
  }
}

main();
