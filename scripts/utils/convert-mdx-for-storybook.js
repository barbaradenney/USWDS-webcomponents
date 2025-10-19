#!/usr/bin/env node

/**
 * Convert MDX files to Storybook-compatible format
 *
 * Converts YAML front matter format to Storybook Meta component format:
 *
 * FROM:
 * ---
 * meta:
 *   title: ComponentName
 *   component: usa-component
 * ---
 *
 * TO:
 * import { Meta } from '@storybook/blocks';
 *
 * <Meta title="Components/ComponentName/Documentation" />
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

const COMPONENTS_DIR = 'src/components';

/**
 * Convert component name to title case
 */
function toTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract component name from directory path
 */
function getComponentName(componentPath) {
  const parts = componentPath.split('/');
  return parts[parts.length - 1];
}

/**
 * Convert MDX file to Storybook format
 */
async function convertMDXFile(filePath, componentName, fileType) {
  const content = await readFile(filePath, 'utf-8');

  // Check if already converted
  if (content.includes('import { Meta } from')) {
    console.log(`  ✓ ${fileType} already converted`);
    return false;
  }

  // Remove YAML front matter if present
  const withoutFrontMatter = content.replace(/^---\n[\s\S]*?\n---\n\n?/, '');

  // Determine the title based on file type
  const titleCaseName = toTitleCase(componentName);
  let title;

  if (fileType === 'README') {
    title = `Components/${titleCaseName}/Documentation`;
  } else if (fileType === 'CHANGELOG') {
    title = `Components/${titleCaseName}/Changelog`;
  } else if (fileType === 'TESTING') {
    title = `Components/${titleCaseName}/Testing`;
  } else {
    title = `Components/${titleCaseName}/${fileType}`;
  }

  // Create new content with Meta component
  const newContent = `import { Meta } from '@storybook/blocks';

<Meta title="${title}" />

${withoutFrontMatter.trimStart()}`;

  await writeFile(filePath, newContent, 'utf-8');
  console.log(`  ✅ Converted ${fileType}`);
  return true;
}

/**
 * Process a single component directory
 */
async function processComponent(componentName, componentPath) {
  console.log(`\n📦 ${componentName}:`);

  const mdxFiles = [
    { name: 'README.md', type: 'README' },
    { name: 'CHANGELOG.mdx', type: 'CHANGELOG' },
    { name: 'TESTING.md', type: 'TESTING' },
  ];

  let converted = 0;

  for (const { name, type } of mdxFiles) {
    const filePath = join(componentPath, name);

    try {
      const wasConverted = await convertMDXFile(filePath, componentName, type);
      if (wasConverted) converted++;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`  ⚠️  Error converting ${name}:`, error.message);
      }
      // File doesn't exist - skip silently
    }
  }

  return converted;
}

/**
 * Main conversion function
 */
async function convertAllMDXFiles() {
  console.log('🔄 Converting MDX files to Storybook format...\n');

  const componentDirs = await readdir(COMPONENTS_DIR);
  let totalConverted = 0;

  for (const componentName of componentDirs) {
    const componentPath = join(COMPONENTS_DIR, componentName);
    const converted = await processComponent(componentName, componentPath);
    totalConverted += converted;
  }

  console.log(`\n✅ Conversion complete! Converted ${totalConverted} MDX files.`);
  console.log('\n💡 Next steps:');
  console.log('   1. Start Storybook: npm run storybook');
  console.log('   2. Check that documentation pages appear under each component');
  console.log('   3. Verify that tables and formatting render correctly\n');
}

// Run conversion
convertAllMDXFiles()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  });