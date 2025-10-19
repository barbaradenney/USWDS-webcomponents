#!/usr/bin/env node

/**
 * Add JavaScript Validation to Component Tests
 *
 * This script systematically adds JavaScript validation tests to all component
 * test files to ensure continuous USWDS compliance monitoring.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Find all component test files
function findComponentTestFiles() {
  const testFiles = [];
  const componentsDir = path.join(rootDir, 'src', 'components');

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.test.ts')) {
        const componentName = path.basename(path.dirname(fullPath));
        const componentPath = path.join(path.dirname(fullPath), `usa-${componentName}.ts`);

        // Only process if the component file exists
        if (fs.existsSync(componentPath)) {
          testFiles.push({
            testFile: fullPath,
            componentFile: componentPath,
            componentName: componentName,
            componentType: componentName.replace('usa-', '')
          });
        }
      }
    }
  }

  scanDirectory(componentsDir);
  return testFiles;
}

// Check if test file already has JavaScript validation
function hasJavaScriptValidation(testFilePath) {
  const content = fs.readFileSync(testFilePath, 'utf8');
  return content.includes('validateComponentJavaScript') ||
         content.includes('JavaScript implementation validation');
}

// Add JavaScript validation import to test file
function addValidationImport(testFilePath) {
  const content = fs.readFileSync(testFilePath, 'utf8');

  // Check if validateComponentJavaScript import already exists
  if (content.includes('validateComponentJavaScript')) {
    return false; // Already has import
  }

  // Find the test-utils import line and add validateComponentJavaScript
  const testUtilsImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]*test-utils\.js['"];?/;
  const match = content.match(testUtilsImportRegex);

  if (match) {
    const existingImports = match[1];
    const newImports = existingImports.trim() + ',\n  validateComponentJavaScript';
    const newImportStatement = content.replace(testUtilsImportRegex,
      `import {\n  ${existingImports.trim()},\n  validateComponentJavaScript,\n} from '../../../__tests__/test-utils.js';`);

    fs.writeFileSync(testFilePath, newImportStatement);
    return true;
  } else {
    // Look for other imports to add after
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    if (importLines.length > 0) {
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]) + importLines[importLines.length - 1].length;
      const beforeImports = content.substring(0, lastImportIndex);
      const afterImports = content.substring(lastImportIndex);

      const newContent = beforeImports +
        '\nimport { validateComponentJavaScript } from \'../../../__tests__/test-utils.js\';' +
        afterImports;

      fs.writeFileSync(testFilePath, newContent);
      return true;
    }
  }

  return false;
}

// Add JavaScript validation test to component
function addValidationTest(testInfo) {
  const { testFile, componentFile, componentName, componentType } = testInfo;
  const content = fs.readFileSync(testFile, 'utf8');

  // Check if validation test already exists
  if (content.includes('JavaScript implementation validation')) {
    return false; // Already has validation test
  }

  // Find the end of the last describe block
  const lines = content.split('\n');
  let lastClosingBraceIndex = -1;
  let braceCount = 0;
  let inDescribeBlock = false;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();

    if (line === '});' && inDescribeBlock) {
      lastClosingBraceIndex = i;
      break;
    }

    if (line.includes('describe(')) {
      inDescribeBlock = true;
    }

    if (line === '}') {
      braceCount++;
    } else if (line === '{') {
      braceCount--;
    }
  }

  if (lastClosingBraceIndex === -1) {
    // Find the very end of the file before the last });
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '});') {
        lastClosingBraceIndex = i;
        break;
      }
    }
  }

  if (lastClosingBraceIndex === -1) {
    console.warn(`Could not find insertion point for ${testFile}`);
    return false;
  }

  // Create the validation test
  const validationTest = `
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = '${componentFile}';
      const validation = validateComponentJavaScript(componentPath, '${componentType}');

      if (!validation.isValid) {
        console.warn('JavaScript validation issues:', validation.issues);
      }

      // JavaScript validation should pass for critical integration patterns
      expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

      // Critical USWDS integration should be present
      const criticalIssues = validation.issues.filter(issue =>
        issue.includes('Missing USWDS JavaScript integration')
      );
      expect(criticalIssues.length).toBe(0);
    });
  });`;

  // Insert the test before the last closing brace
  const beforeInsertion = lines.slice(0, lastClosingBraceIndex).join('\n');
  const afterInsertion = lines.slice(lastClosingBraceIndex).join('\n');

  const newContent = beforeInsertion + validationTest + '\n' + afterInsertion;

  fs.writeFileSync(testFile, newContent);
  return true;
}

// Main execution
async function main() {
  console.log('🔍 Finding component test files...');

  const testFiles = findComponentTestFiles();
  console.log(`Found ${testFiles.length} component test files`);

  let processed = 0;
  let skipped = 0;
  let importAdded = 0;
  let testAdded = 0;

  for (const testInfo of testFiles) {
    console.log(`\n📝 Processing ${testInfo.componentName}...`);

    if (hasJavaScriptValidation(testInfo.testFile)) {
      console.log(`   ⏭️  Already has JavaScript validation - skipping`);
      skipped++;
      continue;
    }

    try {
      // Add import if needed
      const importWasAdded = addValidationImport(testInfo.testFile);
      if (importWasAdded) {
        console.log(`   ✅ Added validateComponentJavaScript import`);
        importAdded++;
      }

      // Add validation test
      const testWasAdded = addValidationTest(testInfo);
      if (testWasAdded) {
        console.log(`   ✅ Added JavaScript validation test`);
        testAdded++;
      }

      processed++;

    } catch (error) {
      console.error(`   ❌ Error processing ${testInfo.componentName}:`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Total files found: ${testFiles.length}`);
  console.log(`   Files processed: ${processed}`);
  console.log(`   Files skipped: ${skipped}`);
  console.log(`   Imports added: ${importAdded}`);
  console.log(`   Tests added: ${testAdded}`);

  if (testAdded > 0) {
    console.log('\n🎉 JavaScript validation has been added to component tests!');
    console.log('   Run "npm test" to verify the validations work correctly.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}