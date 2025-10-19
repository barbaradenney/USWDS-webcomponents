#!/usr/bin/env node

/**
 * USWDS Import Optimization Script
 *
 * Optimizes USWDS imports by trying specific module imports before falling back to full bundle.
 * This improves tree-shaking and reduces bundle size while maintaining functionality.
 */

import fs from 'fs';
import path from 'path';

const components = [
  { name: 'header', file: 'src/components/header/usa-header.ts', module: 'usa-header' },
  { name: 'language-selector', file: 'src/components/language-selector/usa-language-selector.ts', module: 'usa-language-selector' },
  { name: 'pagination', file: 'src/components/pagination/usa-pagination.ts', module: 'usa-pagination' },
  { name: 'search', file: 'src/components/search/usa-search.ts', module: 'usa-search' },
  { name: 'select', file: 'src/components/select/usa-select.ts', module: 'usa-select' },
  { name: 'step-indicator', file: 'src/components/step-indicator/usa-step-indicator.ts', module: 'usa-step-indicator' }
];

function optimizeImport(content, componentName, moduleName) {
  // Pattern to match the old import
  const oldPattern = /(\s+)(\/\/ Tree-shaking: Import only the specific USWDS.*?\n\s+const module = await import\('@uswds\/uswds'\);)/gs;

  const newImport = `$1// First try specific module import for better tree-shaking
$1let module;
$1try {
$1  module = await import('@uswds/uswds/packages/${moduleName}/src/index.js');
$1  console.log(\`🌲 ${componentName}: Using optimized tree-shaking import\`);
$1} catch (specificError) {
$1  console.log(\`📦 ${componentName}: Specific module not available, falling back to full bundle\`);
$1  module = await import('@uswds/uswds');
$1}`;

  return content.replace(oldPattern, newImport);
}

console.log('🌲 Optimizing USWDS imports for better tree-shaking...\n');

let optimizedCount = 0;

for (const component of components) {
  try {
    const filePath = component.file;
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if it needs optimization
    if (content.includes("import('@uswds/uswds')") && !content.includes('packages/usa-')) {
      const optimizedContent = optimizeImport(content, component.name, component.module);

      if (optimizedContent !== content) {
        fs.writeFileSync(filePath, optimizedContent);
        console.log(`✅ Optimized ${component.name} (${filePath})`);
        optimizedCount++;
      } else {
        console.log(`⚪ ${component.name} already optimized or no changes needed`);
      }
    } else {
      console.log(`⚪ ${component.name} already optimized or doesn't need optimization`);
    }
  } catch (error) {
    console.error(`❌ Error optimizing ${component.name}:`, error.message);
  }
}

console.log(`\n🎯 Summary: Optimized ${optimizedCount} out of ${components.length} components`);
console.log('📦 Components will now try specific module imports before falling back to full bundle');