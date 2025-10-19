#!/usr/bin/env node

/**
 * Add missing usingUSWDSEnhancement properties to components
 */

import fs from 'fs';

// Components that need the property added (from TypeScript errors)
const componentsNeedingProperty = [
  'combo-box', 'header', 'language-selector', 'pagination',
  'search', 'select', 'skip-link', 'step-indicator', 'table', 'tooltip'
];

class PropertyAdder {
  constructor() {
    this.filesFixed = 0;
  }

  log(message, color = 'reset') {
    const colors = {
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async addMissingProperties() {
    this.log('\n🔧 Adding Missing usingUSWDSEnhancement Properties', 'cyan');

    for (const componentName of componentsNeedingProperty) {
      const filePath = `src/components/${componentName}/usa-${componentName}.ts`;
      if (fs.existsSync(filePath)) {
        await this.processComponent(filePath, componentName);
      }
    }

    this.log(`\n✅ Added properties to ${this.filesFixed} components`, 'green');
  }

  async processComponent(filePath, componentName) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check if already has the property
      if (content.includes('usingUSWDSEnhancement')) {
        this.log(`✅ ${componentName} - Already has property`, 'green');
        return;
      }

      // Find a good place to add the property (after other private properties)
      const lines = content.split('\n');
      let insertIndex = -1;

      // Look for existing private properties to insert after
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('private ') && (line.includes('=') || line.includes(':'))) {
          insertIndex = i + 1;
        }
        // Stop searching after we hit the first method
        if (line.includes('(') && line.includes('){')) {
          break;
        }
      }

      // If no private properties found, insert after class declaration
      if (insertIndex === -1) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('class ') && lines[i].includes('{')) {
            insertIndex = i + 1;
            break;
          }
        }
      }

      if (insertIndex !== -1) {
        lines.splice(insertIndex, 0, '  private usingUSWDSEnhancement = false;');
        const newContent = lines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        this.filesFixed++;
        this.log(`✅ ${componentName} - Added property`, 'green');
      } else {
        this.log(`⚠️ ${componentName} - Could not find insertion point`, 'yellow');
      }

    } catch (error) {
      this.log(`❌ Error processing ${componentName}: ${error.message}`, 'red');
    }
  }
}

// Self-executing fix
const adder = new PropertyAdder();
adder.addMissingProperties().catch(error => {
  console.error('Property addition failed:', error);
  process.exit(1);
});

export default PropertyAdder;