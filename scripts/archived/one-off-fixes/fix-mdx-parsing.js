#!/usr/bin/env node

/**
 * Fix MDX parsing issues by escaping problematic content
 *
 * Issues fixed:
 * 1. Code blocks in property tables with { } [ ] characters
 * 2. Complex default values that MDX tries to parse as JSX
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

const COMPONENTS_DIR = 'src/components';

/**
 * Escape content in markdown table cells that contains JSX-like characters
 */
function escapeTableCells(content) {
  // Find all table rows
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    // Check if this is a table row (contains |)
    if (!line.includes('|') || line.trim().startsWith('|---')) {
      return line;
    }

    // Split by pipes, but be careful with escaped pipes
    const cells = line.split('|').map((cell, index) => {
      // Skip the first and last empty cells
      if (index === 0 || index === line.split('|').length - 1) {
        return cell;
      }

      // If cell contains array or object literals, wrap in backticks if not already
      if ((cell.includes('[') || cell.includes('{')) && !cell.includes('`')) {
        // Check if it looks like a default value column
        return cell.replace(/(\[.*?\]|\{.*?\})/g, '`$1`');
      }

      return cell;
    });

    return cells.join('|');
  });

  return fixedLines.join('\n');
}

/**
 * Fix MDX file
 */
async function fixMDXFile(filePath, componentName, fileType) {
  try {
    const content = await readFile(filePath, 'utf-8');

    // Apply fixes
    let fixed = escapeTableCells(content);

    // Only write if content changed
    if (fixed !== content) {
      await writeFile(filePath, fixed, 'utf-8');
      console.log(`  ✅ Fixed ${fileType}`);
      return true;
    } else {
      console.log(`  ✓ ${fileType} OK`);
      return false;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.log(`  ⚠️  Error fixing ${fileType}:`, error.message);
    }
    return false;
  }
}

/**
 * Process a single component directory
 */
async function processComponent(componentName, componentPath) {
  console.log(`\n📦 ${componentName}:`);

  const mdxFiles = [
    { name: 'README.mdx', type: 'README' },
    { name: 'CHANGELOG.mdx', type: 'CHANGELOG' },
    { name: 'TESTING.mdx', type: 'TESTING' },
  ];

  let fixed = 0;

  for (const { name, type } of mdxFiles) {
    const filePath = join(componentPath, name);
    const wasFixed = await fixMDXFile(filePath, componentName, type);
    if (wasFixed) fixed++;
  }

  return fixed;
}

/**
 * Main fix function
 */
async function fixAllMDXFiles() {
  console.log('🔧 Fixing MDX parsing issues...\n');

  const componentDirs = await readdir(COMPONENTS_DIR);
  let totalFixed = 0;

  for (const componentName of componentDirs) {
    const componentPath = join(COMPONENTS_DIR, componentName);
    const fixed = await processComponent(componentName, componentPath);
    totalFixed += fixed;
  }

  console.log(`\n✅ Fix complete! Fixed ${totalFixed} MDX files.`);

  if (totalFixed > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Restart Storybook: npm run storybook');
    console.log('   2. Check that all documentation pages load without errors\n');
  }
}

// Run fixes
fixAllMDXFiles()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });