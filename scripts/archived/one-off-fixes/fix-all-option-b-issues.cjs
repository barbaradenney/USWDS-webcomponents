#!/usr/bin/env node

/**
 * Complete Option B Compliance Fixer
 *
 * Fixes ALL remaining Option B violations:
 * 1. Adds createRenderRoot for light DOM
 * 2. Changes base class to USWDSBaseComponent
 * 3. Adds shouldUpdate protection
 * 4. Adds syncStateToUSWDS method
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_TO_FIX = [
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

function fixComponent(componentName) {
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

  log(`\n📝 Fixing ${componentName}...`, colors.cyan);

  let content = fs.readFileSync(componentPath, 'utf-8');
  let modified = false;

  // Fix 1: Change LitElement to USWDSBaseComponent
  if (content.includes('extends LitElement')) {
    // Add import if missing
    if (!content.includes("from '../../utils/base-component.js'")) {
      const litImport = content.match(/import.*from 'lit';/);
      if (litImport) {
        const insertion = `${litImport[0]}\nimport { USWDSBaseComponent } from '../../utils/base-component.js';`;
        content = content.replace(litImport[0], insertion);
        log('  ✓ Added USWDSBaseComponent import', colors.green);
      }
    }

    // Change extends clause
    content = content.replace(/extends LitElement/g, 'extends USWDSBaseComponent');
    modified = true;
    log('  ✓ Changed to extend USWDSBaseComponent', colors.green);
  }

  // Fix 2: Add createRenderRoot if missing (light DOM)
  if (!content.includes('createRenderRoot()')) {
    const classMatch = content.match(/(export class \w+ extends \w+ \{[\s\S]*?)(static override styles)/);
    if (classMatch) {
      const insertion = `${classMatch[1]}// CRITICAL: Light DOM implementation for USWDS compatibility
  protected override createRenderRoot() {
    return this;
  }

  ${classMatch[2]}`;
      content = content.replace(classMatch[0], insertion);
      modified = true;
      log('  ✓ Added createRenderRoot (light DOM)', colors.green);
    }
  }

  // Fix 3: Add shouldUpdate protection if missing
  if (!content.includes('shouldUpdate(')) {
    const updatedMatch = content.match(/(override updated\([\s\S]*?\n  \})/);
    if (updatedMatch) {
      const shouldUpdateMethod = `
  override shouldUpdate(changedProperties: Map<string, any>): boolean {
    // Protect USWDS transformations from re-rendering after enhancement
    const componentElement = this.querySelector('.usa-${componentName}');
    const hasEnhancedElements = componentElement?.querySelector('.usa-${componentName}__button') ||
                               componentElement?.querySelector('.usa-${componentName}__wrapper') ||
                               componentElement?.querySelector('.usa-${componentName}__list');

    if (hasEnhancedElements) {
      // Only allow critical property updates that need DOM changes
      const criticalProps = ['disabled', 'required', 'readonly', 'value', 'error', 'placeholder'];
      const hasCriticalChange = Array.from(changedProperties.keys()).some(prop =>
        criticalProps.includes(prop as string)
      );

      if (!hasCriticalChange) {
        return false; // Preserve USWDS transformation
      }
    }

    return super.shouldUpdate(changedProperties);
  }

  ${updatedMatch[0]}`;
      content = content.replace(updatedMatch[0], shouldUpdateMethod);
      modified = true;
      log('  ✓ Added shouldUpdate protection', colors.green);
    }
  }

  // Fix 4: Add syncStateToUSWDS if missing
  if (!content.includes('syncStateToUSWDS')) {
    // Find the updated method and modify it
    const updatedMatch = content.match(/override updated\(changedProperties: Map<string, any>\) \{[\s\S]*?super\.updated\(changedProperties\);/);
    if (updatedMatch) {
      const updatedWithSync = `${updatedMatch[0]}

    // Sync properties to USWDS-enhanced elements when critical properties change
    const criticalProps = ['disabled', 'required', 'readonly', 'value'];
    const hasCriticalChange = Array.from(changedProperties.keys()).some(prop =>
      criticalProps.includes(prop as string)
    );
    if (hasCriticalChange) {
      this.syncStateToUSWDS();
    }`;
      content = content.replace(updatedMatch[0], updatedWithSync);

      // Add the syncStateToUSWDS method before render()
      const renderMatch = content.match(/(  override render\(\)|  render\(\))/);
      if (renderMatch) {
        const syncMethod = `
  private syncStateToUSWDS() {
    // Sync component properties to USWDS-enhanced elements
    setTimeout(() => {
      const input = this.querySelector('.usa-input, input, select, textarea') as HTMLInputElement;
      if (input) {
        // Sync value
        if (this.value !== undefined && this.value !== input.value) {
          input.value = String(this.value);
        }

        // Sync disabled state
        if (this.disabled !== undefined && this.disabled !== input.disabled) {
          input.disabled = this.disabled;
        }

        // Sync required state
        if (this.required !== undefined && this.required !== input.required) {
          input.required = this.required;
        }

        // Sync readonly state
        if (this.readonly !== undefined && this.readonly !== input.readOnly) {
          input.readOnly = this.readonly;
        }
      }
    }, 10);
  }

  ${renderMatch[0]}`;
        content = content.replace(renderMatch[0], syncMethod);
        modified = true;
        log('  ✓ Added syncStateToUSWDS method', colors.green);
      }
    }
  }

  if (modified) {
    // Create backup
    const backupPath = `${componentPath}.backup2`;
    fs.copyFileSync(componentPath, backupPath);

    // Write updated file
    fs.writeFileSync(componentPath, content);
    log(`  ✅ Successfully fixed ${componentName}`, colors.green);
    log(`  📦 Backup saved: ${backupPath}`, colors.blue);
    return true;
  } else {
    log(`  ℹ️  No additional fixes needed for ${componentName}`, colors.blue);
    return false;
  }
}

function main() {
  log('\n🚀 Fixing all Option B compliance issues...', colors.cyan);
  log('═'.repeat(60), colors.cyan);

  let fixed = 0;
  let skipped = 0;

  COMPONENTS_TO_FIX.forEach((component) => {
    if (fixComponent(component)) {
      fixed++;
    } else {
      skipped++;
    }
  });

  log('\n' + '═'.repeat(60), colors.cyan);
  log(`✅ Fix complete!`, colors.green);
  log(`  Fixed: ${fixed}`, colors.green);
  log(`  Skipped: ${skipped}`, colors.blue);
  log('\n📝 Running validation...', colors.cyan);

  // Run validator
  const { execSync } = require('child_process');
  try {
    execSync('npm run validate:option-b', { stdio: 'inherit' });
  } catch (error) {
    log('\n⚠️  Some issues remain - check output above', colors.yellow);
  }
}

main();
