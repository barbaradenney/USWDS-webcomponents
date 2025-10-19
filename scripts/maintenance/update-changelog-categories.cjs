#!/usr/bin/env node

/**
 * Update CHANGELOG.mdx files to use new category-based structure
 */

const fs = require('fs');
const path = require('path');

// Same category mapping as story files
const CATEGORY_MAP = {
  'Forms': ['text-input', 'textarea', 'checkbox', 'radio', 'select', 'file-input', 'date-picker', 'date-range-picker', 'time-picker', 'memorable-date', 'combo-box', 'range-slider', 'character-count', 'validation', 'input-prefix-suffix'],
  'Navigation': ['header', 'footer', 'breadcrumb', 'pagination', 'side-navigation', 'in-page-navigation', 'skip-link', 'language-selector'],
  'Data Display': ['table', 'collection', 'card', 'list', 'icon-list', 'summary-box', 'tag', 'icon'],
  'Feedback': ['alert', 'site-alert', 'modal', 'tooltip', 'banner'],
  'Actions': ['button', 'button-group', 'link', 'search'],
  'Layout': ['prose', 'process-list', 'step-indicator', 'identifier'],
  'Structure': ['accordion']
};

// Build reverse mapping: component name -> category
const componentToCategory = {};
Object.entries(CATEGORY_MAP).forEach(([category, components]) => {
  components.forEach(comp => {
    componentToCategory[comp] = category;
  });
});

// Find all CHANGELOG.mdx files
const componentsDir = path.join(__dirname, '../../src/components');
const components = fs.readdirSync(componentsDir).filter(name => {
  const componentPath = path.join(componentsDir, name);
  return fs.statSync(componentPath).isDirectory();
});

let updatedCount = 0;

components.forEach(component => {
  const changelogPath = path.join(componentsDir, component, 'CHANGELOG.mdx');

  if (!fs.existsSync(changelogPath)) {
    console.log(`⚠️  No CHANGELOG.mdx found for ${component}`);
    return;
  }

  const category = componentToCategory[component];
  if (!category) {
    console.log(`⚠️  No category mapping found for ${component}`);
    return;
  }

  // Read the file
  let content = fs.readFileSync(changelogPath, 'utf8');

  // Convert component name to proper case (e.g., "button-group" -> "Button Group")
  const componentProperCase = component
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Update the Meta title from "Components/Name/Changelog" to "Category/Name/Changelog"
  const oldPattern = /<Meta title="Components\/(.*?)\/Changelog" \/>/;
  const newTitle = `<Meta title="${category}/${componentProperCase}/Changelog" />`;

  if (content.match(oldPattern)) {
    content = content.replace(oldPattern, newTitle);
    fs.writeFileSync(changelogPath, content, 'utf8');
    console.log(`✅ Updated ${component}: ${category}/${componentProperCase}/Changelog`);
    updatedCount++;
  } else {
    console.log(`⏭️  Skipped ${component}: already has correct format or unexpected format`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Updated: ${updatedCount} CHANGELOG files`);
console.log(`   Total components: ${components.length}`);
