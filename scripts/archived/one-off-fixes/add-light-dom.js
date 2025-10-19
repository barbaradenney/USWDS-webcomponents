#!/usr/bin/env node

/**
 * Add Light DOM Support to Components
 *
 * Adds createRenderRoot() method to components that don't have it
 * for maximum USWDS compatibility
 */

import { readFileSync, writeFileSync } from 'fs';

// Color helpers
const colors = {
  bold: text => `\x1b[1m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`
};

const componentsToFix = [
  'src/components/language-selector/usa-language-selector.ts',
  'src/components/footer/usa-footer.ts',
  'src/components/skip-link/usa-skip-link.ts',
  'src/components/tooltip/usa-tooltip.ts',
  'src/components/date-range-picker/usa-date-range-picker.ts',
  'src/components/time-picker/usa-time-picker.ts',
  'src/components/in-page-navigation/usa-in-page-navigation.ts',
  'src/components/accordion/usa-accordion.ts',
  'src/components/character-count/usa-character-count.ts',
  'src/components/file-input/usa-file-input.ts',
  'src/components/search/usa-search.ts',
  'src/components/textarea/usa-textarea.ts',
  'src/components/link/usa-link.ts',
  'src/components/table/usa-table.ts',
  'src/components/list/usa-list.ts',
  'src/components/menu/usa-menu.ts',
  'src/components/combo-box/usa-combo-box.ts',
  'src/components/modal/usa-modal.ts',
  'src/components/text-input/usa-text-input.ts'
];

function addLightDOM(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');

    // Skip if already has createRenderRoot
    if (content.includes('createRenderRoot')) {
      return { success: false, reason: 'Already has createRenderRoot' };
    }

    // Find the render method
    const renderMatch = content.match(/(.*)(override render\(\)|render\(\))/);
    if (!renderMatch) {
      return { success: false, reason: 'No render method found' };
    }

    // Insert light DOM method before render
    const lightDOMMethod = `
  // Use light DOM for USWDS compatibility
  protected createRenderRoot(): HTMLElement {
    return this as any;
  }

  `;

    const insertPosition = renderMatch.index;
    const newContent = content.slice(0, insertPosition) + lightDOMMethod + content.slice(insertPosition);

    writeFileSync(filePath, newContent, 'utf-8');
    return { success: true, reason: 'Light DOM added successfully' };

  } catch (error) {
    return { success: false, reason: error.message };
  }
}

console.log(colors.bold(colors.cyan('\n🔧 Adding Light DOM Support to Components\n')));
console.log('='.repeat(60));

let successCount = 0;
let failCount = 0;

componentsToFix.forEach(filePath => {
  const componentName = filePath.split('/').pop().replace('.ts', '');
  const result = addLightDOM(filePath);

  if (result.success) {
    console.log(colors.green(`  ✅ ${componentName}: ${result.reason}`));
    successCount++;
  } else {
    console.log(colors.yellow(`  ⚠️  ${componentName}: ${result.reason}`));
    failCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(colors.bold(colors.cyan('\n📊 Light DOM Addition Summary\n')));
console.log(colors.green(`  Successfully added: ${successCount}`));
console.log(colors.yellow(`  Skipped/Failed: ${failCount}`));
console.log(colors.cyan('\n💡 Next step: Run validation to see compliance improvements!'));
console.log('='.repeat(60));