#!/usr/bin/env node

/**
 * @fileoverview Fix Missing validateComponentJavaScript Imports
 *
 * This script adds the missing import for validateComponentJavaScript
 * to all test files that use this function but don't import it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');

// Files that use validateComponentJavaScript but might be missing the import
const testFiles = [
  'src/components/button-group/usa-button-group.test.ts',
  'src/components/button/usa-button.test.ts',
  'src/components/alert/usa-alert.test.ts',
  'src/components/validation/usa-validation.test.ts',
  'src/components/text-input/usa-text-input.test.ts',
  'src/components/banner/usa-banner.test.ts',
  'src/components/step-indicator/usa-step-indicator.test.ts',
  'src/components/header/usa-header.test.ts',
  'src/components/tag/usa-tag.test.ts',
  'src/components/process-list/usa-process-list.test.ts',
  'src/components/modal/usa-modal.test.ts',
  'src/components/prose/usa-prose.test.ts',
  'src/components/side-navigation/usa-side-navigation.test.ts',
  'src/components/icon/usa-icon.test.ts',
  'src/components/breadcrumb/usa-breadcrumb.test.ts',
  'src/components/select/usa-select.test.ts',
  'src/components/combo-box/usa-combo-box.test.ts',
  'src/components/menu/usa-menu.test.ts',
  'src/components/list/usa-list.test.ts',
  'src/components/site-alert/usa-site-alert.test.ts',
  'src/components/table/usa-table.test.ts',
  'src/components/date-picker/usa-date-picker.test.ts',
  'src/components/link/usa-link.test.ts',
  'src/components/identifier/usa-identifier.test.ts',
  'src/components/textarea/usa-textarea.test.ts',
  'src/components/memorable-date/usa-memorable-date.test.ts',
  'src/components/search/usa-search.test.ts',
  'src/components/file-input/usa-file-input.test.ts',
  'src/components/summary-box/usa-summary-box.test.ts',
  'src/components/input-prefix-suffix/usa-input-prefix-suffix.test.ts',
  'src/components/checkbox/usa-checkbox.test.ts',
  'src/components/character-count/usa-character-count.test.ts',
  'src/components/accordion/usa-accordion.test.ts',
  'src/components/in-page-navigation/usa-in-page-navigation.test.ts',
  'src/components/range-slider/usa-range-slider.test.ts',
  'src/components/time-picker/usa-time-picker.test.ts',
  'src/components/date-range-picker/usa-date-range-picker.test.ts',
  'src/components/card/usa-card.test.ts',
  'src/components/radio/usa-radio.test.ts',
  'src/components/section/usa-section.test.ts',
  'src/components/collection/usa-collection.test.ts',
  'src/components/tooltip/usa-tooltip.test.ts',
  'src/components/skip-link/usa-skip-link.test.ts',
  'src/components/footer/usa-footer.test.ts',
  'src/components/pagination/usa-pagination.test.ts',
  'src/components/language-selector/usa-language-selector.test.ts',
];

function fixImportsInFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');

  // Check if file uses validateComponentJavaScript
  if (!content.includes('validateComponentJavaScript')) {
    console.log(`⏭️  Skipping ${filePath} - doesn't use validateComponentJavaScript`);
    return false;
  }

  // Check if import already exists
  if (content.includes('validateComponentJavaScript') && content.includes('__tests__/test-utils')) {
    console.log(`⏭️  Skipping ${filePath} - import already exists`);
    return false;
  }

  // Find the existing import section
  const lines = content.split('\n');
  let importSectionEnd = -1;
  let testUtilsImportIndex = -1;

  // Find where imports end and look for existing test-utils import
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('__tests__/test-utils')) {
      testUtilsImportIndex = i;
    }

    if (line.startsWith('import ') || line.startsWith('} from')) {
      importSectionEnd = i;
    } else if (importSectionEnd > -1 && line.trim() === '') {
      // Found end of imports section
      break;
    }
  }

  let newContent;

  if (testUtilsImportIndex > -1) {
    // Modify existing test-utils import
    const existingImport = lines[testUtilsImportIndex];

    if (existingImport.includes('validateComponentJavaScript')) {
      console.log(`⏭️  Skipping ${filePath} - validateComponentJavaScript already imported`);
      return false;
    }

    // Add validateComponentJavaScript to existing import
    const newImport = existingImport
      .replace(/} from/, ', validateComponentJavaScript } from')
      .replace(/(\w+),(\s*}) from/, '$1, validateComponentJavaScript$2 from');

    lines[testUtilsImportIndex] = newImport;
    newContent = lines.join('\n');
  } else {
    // Add new import line after existing imports
    const insertIndex = importSectionEnd + 1;

    // Calculate relative path from component test file to test-utils
    const componentDepth = filePath.split('/').length - 2; // subtract src and filename
    const relativePath = '../'.repeat(componentDepth) + '__tests__/test-utils.js';

    const newImportLine = `import { validateComponentJavaScript } from '${relativePath}';`;

    lines.splice(insertIndex, 0, newImportLine);
    newContent = lines.join('\n');
  }

  // Write the updated content
  fs.writeFileSync(fullPath, newContent);
  console.log(`✅ Fixed imports in ${filePath}`);
  return true;
}

function main() {
  console.log('🔧 Fixing missing validateComponentJavaScript imports...\n');

  let fixedCount = 0;

  for (const filePath of testFiles) {
    if (fixImportsInFile(filePath)) {
      fixedCount++;
    }
  }

  console.log(`\n✨ Fixed imports in ${fixedCount} files`);

  if (fixedCount > 0) {
    console.log('\n🎯 Next steps:');
    console.log('1. Run tests to verify fixes: npm run test');
    console.log('2. Commit the changes if all tests pass');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
