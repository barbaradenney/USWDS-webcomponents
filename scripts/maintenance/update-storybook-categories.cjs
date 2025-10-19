#!/usr/bin/env node

/**
 * Update Storybook Categories
 *
 * Updates all component story files to use the new category-based organization
 * instead of the flat "Components/*" structure.
 */

const fs = require('fs');
const path = require('path');

// Category mapping based on COMPONENTS.md
const CATEGORY_MAP = {
  'Forms': ['text-input', 'textarea', 'checkbox', 'radio', 'select', 'file-input', 'date-picker', 'date-range-picker', 'time-picker', 'memorable-date', 'combo-box', 'range-slider', 'character-count', 'validation', 'input-prefix-suffix'],
  'Navigation': ['header', 'footer', 'breadcrumb', 'pagination', 'side-navigation', 'in-page-navigation', 'skip-link', 'language-selector'],
  'Data Display': ['table', 'collection', 'card', 'list', 'icon-list', 'summary-box', 'tag', 'icon'],
  'Feedback': ['alert', 'site-alert', 'modal', 'tooltip', 'banner'],
  'Actions': ['button', 'button-group', 'link', 'search'],
  'Layout': ['prose', 'process-list', 'step-indicator', 'identifier'],
  'Structure': ['accordion']
};

// Create reverse mapping: component name -> category
const componentToCategory = {};
for (const [category, components] of Object.entries(CATEGORY_MAP)) {
  for (const component of components) {
    componentToCategory[component] = category;
  }
}

// Component name normalization (handle different naming conventions)
const normalizeComponentName = (name) => {
  // Handle "Button Group" -> "button-group"
  return name.toLowerCase().replace(/\s+/g, '-');
};

const componentsDir = path.join(__dirname, '../src/components');
const components = fs.readdirSync(componentsDir);

let updatedCount = 0;
let errors = [];

console.log('🎨 Updating Storybook Categories\n');

for (const component of components) {
  const storyFile = path.join(componentsDir, component, `usa-${component}.stories.ts`);

  if (!fs.existsSync(storyFile)) {
    continue;
  }

  // Find the category for this component
  const category = componentToCategory[component];

  if (!category) {
    errors.push(`❌ No category found for: ${component}`);
    continue;
  }

  // Read the story file
  let content = fs.readFileSync(storyFile, 'utf-8');

  // Get the component display name (with proper capitalization)
  const componentNameMatch = content.match(/title:\s*'Components\/([^']+)'/);

  if (!componentNameMatch) {
    errors.push(`⚠️  Could not find title in: ${component}`);
    continue;
  }

  const displayName = componentNameMatch[1];

  // Update the title
  const newTitle = `${category}/${displayName}`;
  const updated = content.replace(
    /title:\s*'Components\/[^']+'/,
    `title: '${newTitle}'`
  );

  if (updated !== content) {
    fs.writeFileSync(storyFile, updated, 'utf-8');
    console.log(`✓ ${component}: Components/${displayName} → ${newTitle}`);
    updatedCount++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Updated: ${updatedCount} story files`);

if (errors.length > 0) {
  console.log(`\n⚠️  Warnings:`);
  errors.forEach(err => console.log(`   ${err}`));
}

console.log(`\n✅ Storybook categories updated!`);
console.log(`\nℹ️  Categories:`);
Object.keys(CATEGORY_MAP).forEach(cat => {
  const count = CATEGORY_MAP[cat].length;
  console.log(`   ${cat} (${count} components)`);
});
