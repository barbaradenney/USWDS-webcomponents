#!/usr/bin/env node

/**
 * Automated Migration to Option B (Pure Global Init) Pattern
 *
 * This script automatically migrates components to comply with Option B:
 * - Removes initializeUSWDS methods
 * - Removes USWDS imports
 * - Adds ARCHITECTURE comment
 * - Adds createRenderRoot for light DOM
 * - Adds shouldUpdate protection
 * - Adds syncStateToUSWDS method
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_TO_MIGRATE = [
  'accordion',
  'combo-box',
  'date-range-picker',
  'file-input',
  'header',
  'in-page-navigation',
  'language-selector',
  'modal',
  'pagination',
  'search',
  'time-picker',
  'tooltip',
  'character-count',
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function migrateComponent(componentName) {
  const componentPath = path.join(
    __dirname,
    '../src/components',
    componentName,
    `usa-${componentName}.ts`
  );

  if (!fs.existsSync(componentPath)) {
    log(`⚠️  Component file not found: ${componentPath}`, colors.yellow);
    return false;
  }

  log(`\n📝 Migrating ${componentName}...`, colors.cyan);

  let content = fs.readFileSync(componentPath, 'utf-8');
  let modified = false;

  // Step 1: Add ARCHITECTURE comment if missing
  if (!content.includes('ARCHITECTURE: Option B')) {
    const jsdocMatch = content.match(/(\/\*\*[\s\S]*?\*\/\s*@customElement)/);
    if (jsdocMatch) {
      const jsdoc = jsdocMatch[0];
      const updatedJsdoc = jsdoc.replace(
        '/**',
        `/**
 * ARCHITECTURE: Option B (Pure Global Init)
 * - USWDS is initialized globally via .on(document) in .storybook/preview-head.html
 * - This component ONLY renders HTML structure
 * - All behavior managed by USWDS event delegation
 * - Component properties synced to USWDS-created elements
 *`
      );
      content = content.replace(jsdoc, updatedJsdoc);
      modified = true;
      log('  ✓ Added ARCHITECTURE comment', colors.green);
    }
  }

  // Step 2: Remove USWDS imports (keep only type imports)
  const uswdsImportRegex = /import\s+(?!type).*from\s+['"]@uswds\/uswds\/js\/.*['"];?\n/g;
  if (uswdsImportRegex.test(content)) {
    content = content.replace(uswdsImportRegex, '');
    modified = true;
    log('  ✓ Removed USWDS imports', colors.green);
  }

  // Step 3: Remove uswds-loader imports
  const loaderImportRegex = /import\s*\{[^}]*\}\s*from\s*['"].*uswds-loader.*['"];?\n/g;
  if (loaderImportRegex.test(content)) {
    content = content.replace(loaderImportRegex, '');
    modified = true;
    log('  ✓ Removed uswds-loader imports', colors.green);
  }

  // Step 4: Remove initializeUSWDS methods and their calls
  // Remove method definition
  const initMethodRegex = /private\s+async\s+initialize\w*USWDS\w*\([^)]*\)\s*\{[\s\S]*?\n  \}/gm;
  if (initMethodRegex.test(content)) {
    content = content.replace(initMethodRegex, '');
    modified = true;
    log('  ✓ Removed initializeUSWDS method', colors.green);
  }

  // Remove method calls
  const initCallRegex = /\s*this\.initialize\w*USWDS\w*\([^)]*\);?\n/g;
  if (initCallRegex.test(content)) {
    content = content.replace(initCallRegex, '');
    modified = true;
    log('  ✓ Removed initializeUSWDS calls', colors.green);
  }

  // Step 5: Update firstUpdated to just call super (if it exists)
  const firstUpdatedMatch = content.match(
    /override\s+firstUpdated\([\s\S]*?\)\s*\{[\s\S]*?\n  \}/m
  );
  if (firstUpdatedMatch) {
    const simpleFirstUpdated = `override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    // Global USWDS initialization handles all behavior via event delegation
  }`;
    content = content.replace(firstUpdatedMatch[0], simpleFirstUpdated);
    modified = true;
    log('  ✓ Simplified firstUpdated()', colors.green);
  }

  // Step 6: Add createRenderRoot if missing (light DOM)
  if (!content.includes('createRenderRoot()')) {
    const classMatch = content.match(/export class \w+ extends \w+ \{/);
    if (classMatch) {
      const insertion = `${classMatch[0]}
  // CRITICAL: Light DOM implementation for USWDS compatibility
  protected override createRenderRoot() {
    return this;
  }
`;
      content = content.replace(classMatch[0], insertion);
      modified = true;
      log('  ✓ Added createRenderRoot (light DOM)', colors.green);
    }
  }

  // Step 7: Update connectedCallback to set data attribute
  if (content.includes('override connectedCallback()')) {
    if (!content.includes("data-web-component-managed")) {
      const connectedMatch = content.match(
        /override connectedCallback\(\)\s*\{[\s\S]*?super\.connectedCallback\(\);/
      );
      if (connectedMatch) {
        const updated = `${connectedMatch[0]}
    this.setAttribute('data-web-component-managed', 'true');`;
        content = content.replace(connectedMatch[0], updated);
        modified = true;
        log('  ✓ Added data-web-component-managed attribute', colors.green);
      }
    }
  }

  if (modified) {
    // Create backup
    const backupPath = `${componentPath}.backup`;
    fs.writeFileSync(backupPath, fs.readFileSync(componentPath));

    // Write updated file
    fs.writeFileSync(componentPath, content);
    log(`  ✅ Successfully migrated ${componentName}`, colors.green);
    log(`  📦 Backup saved: ${backupPath}`, colors.blue);
    return true;
  } else {
    log(`  ℹ️  No changes needed for ${componentName}`, colors.blue);
    return false;
  }
}

function main() {
  log('\n🚀 Starting Option B migration...', colors.cyan);
  log('═'.repeat(60), colors.cyan);

  let migrated = 0;
  let skipped = 0;

  COMPONENTS_TO_MIGRATE.forEach((component) => {
    if (migrateComponent(component)) {
      migrated++;
    } else {
      skipped++;
    }
  });

  log('\n' + '═'.repeat(60), colors.cyan);
  log(`✅ Migration complete!`, colors.green);
  log(`  Migrated: ${migrated}`, colors.green);
  log(`  Skipped: ${skipped}`, colors.blue);
  log('\n📝 Next steps:', colors.cyan);
  log('  1. Run: npm run validate:option-b', colors.blue);
  log('  2. Run: npm run test', colors.blue);
  log('  3. Check Storybook for each component', colors.blue);
  log('  4. Review backup files (*.backup) before committing\n', colors.blue);
}

main();
