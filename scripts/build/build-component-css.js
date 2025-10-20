#!/usr/bin/env node

/**
 * CSS Tree-Shaking Build Script
 *
 * This script creates component-specific CSS files by importing only the
 * necessary USWDS styles for each component, enabling significant bundle
 * size reduction through CSS tree-shaking.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';
import * as sass from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const componentsDir = join(srcDir, 'components');
const stylesDir = join(srcDir, 'styles');

// Component to USWDS module mapping
const componentModuleMap = {
  accordion: 'usa-accordion',
  alert: 'usa-alert',
  banner: 'usa-banner',
  breadcrumb: 'usa-breadcrumb',
  button: 'usa-button',
  'button-group': 'usa-button-group',
  card: 'usa-card',
  'character-count': 'usa-character-count',
  checkbox: 'usa-checkbox',
  collection: 'usa-collection',
  'combo-box': 'usa-combo-box',
  'date-picker': 'usa-date-picker',
  'date-range-picker': 'usa-date-range-picker',
  'file-input': 'usa-file-input',
  footer: 'usa-footer',
  header: 'usa-header',
  icon: 'usa-icon',
  identifier: 'usa-identifier',
  'in-page-navigation': 'usa-in-page-navigation',
  input: 'usa-input',
  link: 'usa-link',
  list: 'usa-list',
  'memorable-date': 'usa-memorable-date',
  menu: 'usa-nav', // Menu uses nav styles
  modal: 'usa-modal',
  pagination: 'usa-pagination',
  'process-list': 'usa-process-list',
  radio: 'usa-radio',
  'range-slider': 'usa-range-slider',
  search: 'usa-search',
  section: 'usa-section',
  select: 'usa-select',
  'skip-link': 'usa-skipnav',
  'step-indicator': 'usa-step-indicator',
  'summary-box': 'usa-summary-box',
  table: 'usa-table',
  tag: 'usa-tag',
  'text-input': 'usa-input',
  textarea: 'usa-textarea',
  'time-picker': 'usa-time-picker',
  tooltip: 'usa-tooltip',
};

/**
 * Creates a SCSS file for a specific component with tree-shaken imports
 */
function createComponentScss(componentName, uswdsModule) {
  return `/*
 * USA ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Component - Tree-Shaken Styles
 *
 * This file imports only the styles needed for the ${componentName} component:
 * - Core USWDS foundation (shared across components)
 * - ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}-specific styles
 */

// All @use rules must come first - import core foundation and component styles
@use "../../styles/core.scss";
@use "@uswds/uswds/packages/${uswdsModule}";
`;
}

/**
 * Creates a TypeScript CSS import file for a specific component
 */
function createComponentCssImport(componentName) {
  return `// Auto-generated CSS import for ${componentName}
// This imports the tree-shaken CSS styles specific to this component
import './${componentName}.css';
`;
}

/**
 * Compiles SCSS to CSS using Dart Sass
 */
async function compileScss(scssPath, outputPath) {
  try {
    const result = sass.compile(scssPath, {
      loadPaths: [join(rootDir, 'node_modules'), stylesDir],
      style: 'expanded',
      sourceMap: true,
    });

    await writeFile(outputPath, result.css);
    await writeFile(outputPath + '.map', JSON.stringify(result.sourceMap));

    return {
      success: true,
      css: result.css,
      size: result.css.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Process a single component directory
 */
async function processComponent(componentName) {
  const componentDir = join(componentsDir, componentName);
  const uswdsModule = componentModuleMap[componentName];

  if (!uswdsModule) {
    console.warn(`⚠️  No USWDS module mapping found for component: ${componentName}`);
    return { success: false, reason: 'No module mapping' };
  }

  try {
    // Create component-specific SCSS file
    const scssContent = createComponentScss(componentName, uswdsModule);
    const scssPath = join(componentDir, `${componentName}.scss`);
    await writeFile(scssPath, scssContent);

    // Compile SCSS to CSS
    const cssPath = join(componentDir, `${componentName}.css`);
    const compileResult = await compileScss(scssPath, cssPath);

    if (!compileResult.success) {
      console.error(`❌ Failed to compile CSS for ${componentName}: ${compileResult.error}`);
      return { success: false, reason: compileResult.error };
    }

    // Create TypeScript CSS import
    const tsImportContent = createComponentCssImport(componentName);
    const tsImportPath = join(componentDir, `${componentName}-styles.ts`);
    await writeFile(tsImportPath, tsImportContent);

    console.log(
      `✅ Created tree-shaken CSS for ${componentName} (${(compileResult.size / 1024).toFixed(1)}KB)`
    );

    return {
      success: true,
      componentName,
      cssSize: compileResult.size,
      files: [scssPath, cssPath, tsImportPath],
    };
  } catch (error) {
    console.error(`❌ Error processing component ${componentName}:`, error.message);
    return { success: false, reason: error.message };
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🌳 Starting CSS Tree-Shaking Build Process...\n');

  try {
    // Ensure core.scss exists
    const coreScssPath = join(stylesDir, 'core.scss');
    try {
      await readFile(coreScssPath);
      console.log('✅ Found core.scss foundation file');
    } catch (error) {
      console.error('❌ core.scss not found. Please ensure it exists in src/styles/');
      process.exit(1);
    }

    // Get all component directories
    const componentDirs = await readdir(componentsDir, { withFileTypes: true });
    const components = componentDirs
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    console.log(`📦 Found ${components.length} components to process\n`);

    // Process components
    const results = [];
    let totalOriginalSize = 0;
    let totalTreeShakenSize = 0;

    for (const component of components) {
      const result = await processComponent(component);
      results.push(result);

      if (result.success) {
        totalTreeShakenSize += result.cssSize;
      }
    }

    // Calculate savings (estimate based on full USWDS CSS size)
    try {
      const fullUswdsCss = await readFile(
        join(rootDir, 'node_modules/@uswds/uswds/dist/css/uswds.css')
      );
      totalOriginalSize = fullUswdsCss.length * components.length; // Worst case: every component imports full CSS

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      const savings = totalOriginalSize - totalTreeShakenSize;
      const savingsPercent = ((savings / totalOriginalSize) * 100).toFixed(1);

      console.log('\n📊 CSS Tree-Shaking Results:');
      console.log('─'.repeat(50));
      console.log(`✅ Successfully processed: ${successCount} components`);
      console.log(`❌ Failed: ${failCount} components`);
      console.log(`📏 Original size estimate: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📦 Tree-shaken size: ${(totalTreeShakenSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(
        `💾 Estimated savings: ${(savings / 1024 / 1024).toFixed(2)}MB (${savingsPercent}%)`
      );

      if (failCount > 0) {
        console.log('\n❌ Failed components:');
        results
          .filter((r) => !r.success)
          .forEach((r) => {
            console.log(`   • ${r.componentName || 'Unknown'}: ${r.reason}`);
          });
      }
    } catch (error) {
      console.error('⚠️  Could not calculate savings:', error.message);
    }

    console.log('\n🎉 CSS Tree-Shaking build complete!');
  } catch (error) {
    console.error('💥 Build failed:', error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processComponent, compileScss, componentModuleMap };
