#!/usr/bin/env node

/**
 * Fix Duplicate Component Registrations
 *
 * Removes all manual customElements.define() calls for components
 * that already have @customElement decorators.
 */

import fs from 'fs';

const componentsToFix = [
  'usa-validation',
  'usa-tag',
  'usa-summary-box',
  'usa-site-alert',
  'usa-side-navigation',
  'usa-section',
  'usa-range-slider',
  'usa-radio',
  'usa-prose',
  'usa-process-list',
  'usa-memorable-date',
  'usa-link',
  'usa-input-prefix-suffix',
  'usa-identifier',
  'usa-icon',
  'usa-combo-box',
  'usa-collection',
  'usa-checkbox',
  'usa-card',
  'usa-button-group',
  'usa-button',
  'usa-breadcrumb',
  'usa-banner'
];

class RegistrationFixer {
  constructor() {
    this.fixesApplied = 0;
  }

  log(message, color = 'reset') {
    const colors = {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m',
      bold: '\x1b[1m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async fixDuplicateRegistrations() {
    this.log('\n🔧 FIXING DUPLICATE COMPONENT REGISTRATIONS', 'cyan');
    this.log('=' * 60);

    const indexPath = 'src/index.ts';

    if (!fs.existsSync(indexPath)) {
      this.log(`❌ Error: ${indexPath} not found`, 'red');
      return;
    }

    let content = fs.readFileSync(indexPath, 'utf8');
    const originalContent = content;

    this.log(`📁 Processing: ${indexPath}`, 'blue');
    this.log(`🎯 Components to fix: ${componentsToFix.length}`, 'blue');

    // Remove manual registrations for each component
    for (const componentName of componentsToFix) {
      const componentVar = this.getComponentVariableName(componentName);

      // Pattern to match the entire registration block
      const registrationPattern = new RegExp(
        `\\s*import\\('.\/components\/[^']+\'\\)\\.then\\(\\(\\{\\s*${componentVar}\\s*\\}\\)\\s*=>\\s*\\{[\\s\\S]*?if\\s*\\(!customElements\\.get\\('${componentName}'\\)\\)\\s*\\{[\\s\\S]*?customElements\\.define\\('${componentName}',\\s*${componentVar}\\);[\\s\\S]*?\\}[\\s\\S]*?\\}\\);\\s*`,
        'g'
      );

      const match = content.match(registrationPattern);
      if (match) {
        content = content.replace(registrationPattern, '');
        this.fixesApplied++;
        this.log(`  ✅ Removed manual registration for ${componentName}`, 'green');
      } else {
        this.log(`  ⚠️  Manual registration not found for ${componentName}`, 'yellow');
      }
    }

    // Clean up extra empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    // Write the updated content
    if (content !== originalContent) {
      fs.writeFileSync(indexPath, content, 'utf8');
      this.log(`\n✅ Updated ${indexPath}`, 'green');
      this.log(`📊 Total fixes applied: ${this.fixesApplied}`, 'green');
    } else {
      this.log(`\n⚠️  No changes made to ${indexPath}`, 'yellow');
    }

    this.log('\n🎉 Duplicate registration fix complete!', 'green');
    this.log('🔍 Run `npm run validate:registrations` to verify the fixes', 'cyan');
  }

  getComponentVariableName(componentName) {
    // Convert usa-component-name to USAComponentName
    return componentName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}

// Run the fixer
const fixer = new RegistrationFixer();
fixer.fixDuplicateRegistrations().catch(error => {
  console.error('Fix failed:', error);
  process.exit(1);
});

export default RegistrationFixer;