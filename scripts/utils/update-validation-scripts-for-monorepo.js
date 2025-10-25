#!/usr/bin/env node

/**
 * Bulk update validation scripts for monorepo structure
 *
 * This script:
 * 1. Fixes glob imports to use CommonJS pattern: import pkg from 'glob'; const { glob } = pkg;
 * 2. Updates src/components paths to packages/STAR/src/components
 * 3. Adds find-components.js imports where needed
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const validateDir = join(__dirname, '..', 'validate');

const scriptsToFix = [
  'compliance-checker.js',
  'detect-initialization-issues.js',
  'scan-custom-uswds-classes.js',
  'validate-architecture.js',
  'validate-component-registrations.js',
  'validate-docs.js'
];

function fixGlobImport(content) {
  // Fix: import { glob } from 'glob';
  // To:   import pkg from 'glob'; const { glob } = pkg;
  if (content.includes("import { glob } from 'glob';")) {
    content = content.replace(
      "import { glob } from 'glob';",
      "import pkg from 'glob';\nconst { glob } = pkg;"
    );
    console.log('  ✓ Fixed glob import');
  }

  // Fix: import { globSync } from 'glob';
  // To:   import pkg from 'glob'; const { sync: globSync } = pkg;
  if (content.includes("import { globSync } from 'glob';")) {
    content = content.replace(
      "import { globSync } from 'glob';",
      "import pkg from 'glob';\nconst { sync: globSync } = pkg;"
    );
    console.log('  ✓ Fixed globSync import');
  }

  return content;
}

function updateComponentPaths(content) {
  let updated = false;

  // Update glob patterns from src/components to packages/*/src/components
  if (content.includes("'src/components/")) {
    content = content.replace(/'src\/components\//g, "'packages/*/src/components/");
    updated = true;
  }

  if (content.includes('"src/components/')) {
    content = content.replace(/"src\/components\//g, '"packages/*/src/components/');
    updated = true;
  }

  // Update backtick patterns
  if (content.includes('`src/components/')) {
    content = content.replace(/`src\/components\//g, '`packages/*/src/components/');
    updated = true;
  }

  if (updated) {
    console.log('  ✓ Updated component paths');
  }

  return content;
}

function ensureFindComponentsImport(content, filename) {
  // Check if script uses component discovery
  const needsImport = (
    content.includes('getAllComponentPaths') ||
    content.includes('getAllComponentNames') ||
    content.includes('getComponentPath') ||
    content.includes('isMonorepo')
  );

  if (needsImport && !content.includes("from '../utils/find-components.js'")) {
    // Find the last import statement
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
    if (importLines.length > 0) {
      const lastImport = importLines[importLines.length - 1];
      const lastImportIndex = content.indexOf(lastImport) + lastImport.length;

      const importStatement = "\nimport { getAllComponentPaths, getAllComponentNames, getComponentPath, isMonorepo } from '../utils/find-components.js';";
      content = content.slice(0, lastImportIndex) + importStatement + content.slice(lastImportIndex);
      console.log('  ✓ Added find-components.js import');
    }
  }

  return content;
}

function updateScript(filename) {
  const filepath = join(validateDir, filename);
  console.log(`\n📝 Updating ${filename}...`);

  let content = readFileSync(filepath, 'utf-8');
  const original = content;

  // Apply fixes
  content = fixGlobImport(content);
  content = updateComponentPaths(content);
  content = ensureFindComponentsImport(content, filename);

  // Write back if changed
  if (content !== original) {
    writeFileSync(filepath, content);
    console.log(`✅ Updated ${filename}`);
    return true;
  } else {
    console.log(`  ℹ️  No changes needed`);
    return false;
  }
}

function main() {
  console.log('🔧 Bulk updating validation scripts for monorepo structure...\n');

  let updatedCount = 0;

  for (const script of scriptsToFix) {
    if (updateScript(script)) {
      updatedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updatedCount}/${scriptsToFix.length} scripts`);
  console.log(`   Skipped: ${scriptsToFix.length - updatedCount} scripts (no changes needed)`);

  console.log('\n✅ Bulk update complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Test updated scripts manually');
  console.log('   2. Run validation: npm run validate');
  console.log('   3. Commit changes');
}

main();
