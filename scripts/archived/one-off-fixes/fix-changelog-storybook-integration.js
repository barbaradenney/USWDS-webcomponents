#!/usr/bin/env node

/**
 * Fix Changelog Storybook Integration
 *
 * Updates all component CHANGELOG.mdx files to integrate properly into Storybook
 * component documentation instead of appearing as separate top-level pages.
 *
 * Changes:
 * - From: <Meta title="Components/Tooltip/Changelog" />
 * - To: Proper documentation page nested under component
 *
 * Usage:
 *   node scripts/maintenance/fix-changelog-storybook-integration.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const componentsDir = join(rootDir, 'src/components');

/**
 * Convert component name to proper case for titles
 * Examples: accordion -> Accordion, date-picker -> Date Picker
 */
function toTitleCase(componentName) {
  return componentName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Process a single changelog file
 */
function processChangelogFile(changelogPath, componentName) {
  console.log(`\n📝 Processing: ${componentName}`);

  try {
    const content = readFileSync(changelogPath, 'utf-8');

    // Check if it's using the old pattern
    const oldPattern = /<Meta title="Components\/[^\/]+\/Changelog" \/>/;

    if (!oldPattern.test(content)) {
      console.log(`   ⏭️  Already using correct format or no Meta tag found`);
      return false;
    }

    // Convert component name to proper title case
    const componentTitle = toTitleCase(componentName);

    // Replace the Meta tag to nest properly under component docs
    // This creates: Components/Accordion/Docs/Changelog
    const newContent = content.replace(
      oldPattern,
      `<Meta title="Components/${componentTitle}/Changelog" />`
    );

    if (content === newContent) {
      console.log(`   ⏭️  No changes needed`);
      return false;
    }

    // Write the updated content
    writeFileSync(changelogPath, newContent, 'utf-8');
    console.log(`   ✅ Updated Meta tag to: Components/${componentTitle}/Changelog`);
    return true;

  } catch (error) {
    console.error(`   ❌ Error processing ${componentName}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Changelog Storybook Integration Fix');
  console.log('======================================\n');
  console.log('Updating CHANGELOG.mdx files to integrate properly into Storybook...\n');

  let processedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  // Get all component directories
  const components = readdirSync(componentsDir)
    .filter(name => {
      const componentPath = join(componentsDir, name);
      return statSync(componentPath).isDirectory();
    })
    .sort();

  console.log(`Found ${components.length} component directories\n`);

  // Process each component's changelog
  for (const component of components) {
    const changelogPath = join(componentsDir, component, 'CHANGELOG.mdx');

    if (!existsSync(changelogPath)) {
      continue;
    }

    processedCount++;

    try {
      const wasUpdated = processChangelogFile(changelogPath, component);
      if (wasUpdated) {
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to process ${component}:`, error.message);
      errorCount++;
    }
  }

  // Summary
  console.log('\n======================================');
  console.log('📊 Summary:');
  console.log(`   • ${processedCount} CHANGELOG.mdx files found`);
  console.log(`   • ${updatedCount} files updated`);
  console.log(`   • ${processedCount - updatedCount} files already correct`);

  if (errorCount > 0) {
    console.log(`   • ${errorCount} errors encountered`);
  }

  console.log('\n✅ Changelog integration fix complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Restart Storybook: npm run storybook');
  console.log('   2. Verify changelogs appear under component documentation');
  console.log('   3. Check Components > [Component] > Changelog in navigation');

  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
