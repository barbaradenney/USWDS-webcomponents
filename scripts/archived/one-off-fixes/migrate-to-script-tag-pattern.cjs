#!/usr/bin/env node
/**
 * Migration Script: Component-Level Init → Script Tag Pattern
 *
 * This script migrates components from component-level USWDS initialization
 * to the simpler script tag pattern where USWDS is loaded globally.
 *
 * See: docs/ARCHITECTURE_DECISION_SCRIPT_TAG_VS_COMPONENT_INIT.md
 */

const fs = require('fs');
const path = require('path');

// Components that need USWDS JavaScript
const JS_COMPONENTS = [
  'accordion',
  'date-picker',
  'in-page-navigation',
  'modal', // Already migrated
  'header',
  'combo-box',
  'time-picker',
  'search',
  'tooltip',
  'file-input',
  'character-count',
  'footer',
  'skip-link',
  'date-range-picker',
  'language-selector',
  'menu',
  'step-indicator',
  'table',
  'pagination',
];

// Components that are CSS-only (should NOT have USWDS JavaScript)
const CSS_ONLY_COMPONENTS = [
  'button',
  'card',
  'checkbox',
  'radio',
  'select',
  'button-group',
  'collection',
  'memorable-date',
  'alert',
  'breadcrumb',
  'tag',
  'link',
];

/**
 * Remove initializeUSWDS() method and its calls from a component
 */
function removeUSWDSInitialization(filePath, componentName) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if already migrated
  if (!content.includes('initializeUSWDS')) {
    console.log(`  ✓ Already migrated (no initializeUSWDS found)`);
    return false;
  }

  let modified = content;

  // Remove private async initializeUSWDS() method (handles various patterns)
  const methodPatterns = [
    // Pattern 1: Full method with try-catch
    /private async initializeUSWDS\(\)[^}]*\{[\s\S]*?try[\s\S]*?\}[\s\S]*?catch[\s\S]*?\}[\s\S]*?\}/g,
    // Pattern 2: Simple method
    /private async initializeUSWDS\(\)[^}]*\{[\s\S]*?\}/g,
    // Pattern 3: Method without async
    /private initializeUSWDS\(\)[^}]*\{[\s\S]*?\}/g,
  ];

  for (const pattern of methodPatterns) {
    if (modified.match(pattern)) {
      modified = modified.replace(pattern, '');
      console.log(`  ✓ Removed initializeUSWDS() method`);
      break;
    }
  }

  // Remove calls to this.initializeUSWDS()
  const callPatterns = [
    /\s*this\.initializeUSWDS\(\);?\s*/g,
    /\s*await this\.initializeUSWDS\(\);?\s*/g,
  ];

  for (const pattern of callPatterns) {
    if (modified.match(pattern)) {
      modified = modified.replace(pattern, '\n');
      console.log(`  ✓ Removed initializeUSWDS() calls`);
    }
  }

  // Add comment explaining new pattern (if in firstUpdated or connectedCallback)
  if (modified.includes('override firstUpdated') || modified.includes('override connectedCallback')) {
    // Add architecture comment if not present
    if (!modified.includes('ARCHITECTURE: Script Tag Pattern')) {
      const architectureComment = `\n    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS\n`;

      // Add after firstUpdated declaration
      if (modified.includes('override firstUpdated')) {
        modified = modified.replace(
          /(override firstUpdated\([^)]*\)[^{]*\{)/,
          `$1${architectureComment}`
        );
        console.log(`  ✓ Added architecture comment to firstUpdated()`);
      }
    }
  }

  // Clean up multiple blank lines
  modified = modified.replace(/\n\n\n+/g, '\n\n');

  // Write back
  fs.writeFileSync(filePath, modified, 'utf8');
  console.log(`  ✓ Migrated ${componentName}`);
  return true;
}

/**
 * Main migration function
 */
function migrateComponents() {
  console.log('🚀 Starting component migration to Script Tag Pattern\n');

  let cssOnlyFixed = 0;
  let jsComponentsSimplified = 0;
  let alreadyMigrated = 0;
  let errors = 0;

  // Phase 1: Remove USWDS init from CSS-only components
  console.log('📋 Phase 1: CSS-Only Components (removing unnecessary USWDS init)');
  console.log('─'.repeat(70));

  for (const component of CSS_ONLY_COMPONENTS) {
    const filePath = path.join(__dirname, '../../src/components', component, `usa-${component}.ts`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${component}: File not found`);
      continue;
    }

    console.log(`\n🔧 ${component}:`);
    try {
      const changed = removeUSWDSInitialization(filePath, component);
      if (changed) {
        cssOnlyFixed++;
      } else {
        alreadyMigrated++;
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errors++;
    }
  }

  // Phase 2: Simplify JavaScript components
  console.log('\n\n📋 Phase 2: JavaScript Components (simplifying to use global USWDS)');
  console.log('─'.repeat(70));

  for (const component of JS_COMPONENTS) {
    const filePath = path.join(__dirname, '../../src/components', component, `usa-${component}.ts`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${component}: File not found`);
      continue;
    }

    console.log(`\n🔧 ${component}:`);
    try {
      const changed = removeUSWDSInitialization(filePath, component);
      if (changed) {
        jsComponentsSimplified++;
      } else {
        alreadyMigrated++;
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errors++;
    }
  }

  // Summary
  console.log('\n\n' + '═'.repeat(70));
  console.log('📊 Migration Summary');
  console.log('═'.repeat(70));
  console.log(`✅ CSS-only components fixed: ${cssOnlyFixed}`);
  console.log(`✅ JavaScript components simplified: ${jsComponentsSimplified}`);
  console.log(`ℹ️  Already migrated: ${alreadyMigrated}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('═'.repeat(70));

  if (cssOnlyFixed + jsComponentsSimplified > 0) {
    console.log('\n📝 Next Steps:');
    console.log('  1. Review changes: git diff src/components');
    console.log('  2. Test components in Storybook: npm run storybook');
    console.log('  3. Run tests: npm test');
    console.log('  4. Commit changes: git add . && git commit');
  }

  return errors === 0;
}

// Run migration
const success = migrateComponents();
process.exit(success ? 0 : 1);
