#!/usr/bin/env node

/**
 * Fix unused usingUSWDSEnhancement variables by either:
 * 1. Adding proper initialization guard logic if component has USWDS.on() calls
 * 2. Removing the variable if it's truly unused
 */

import fs from 'fs';

const componentsWithUnusedVariables = [
  'combo-box', 'header', 'language-selector', 'pagination', 'search', 'select',
  'skip-link', 'step-indicator', 'table', 'tooltip'
];

class UnusedVariableFixer {
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

  async fixUnusedVariables() {
    this.log('\n🔧 Fixing unused usingUSWDSEnhancement variables', 'cyan');

    for (const componentName of componentsWithUnusedVariables) {
      const filePath = `src/components/${componentName}/usa-${componentName}.ts`;
      if (fs.existsSync(filePath)) {
        await this.processComponent(filePath, componentName);
      }
    }

    this.log(`\n✅ Fixed ${this.filesFixed} components`, 'green');
  }

  async processComponent(filePath, componentName) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Check if component actually uses USWDS initialization
      const hasUSWDSInit = content.includes('.on(this)') || content.includes('USWDS.');

      if (hasUSWDSInit) {
        // Component needs the variable - add proper initialization guard
        modified = this.addInitializationGuard(content, componentName, filePath);
      } else {
        // Component doesn't use USWDS - remove the unused variable
        modified = this.removeUnusedVariable(content, componentName, filePath);
      }

    } catch (error) {
      this.log(`❌ Error processing ${componentName}: ${error.message}`, 'red');
    }
  }

  addInitializationGuard(content, componentName, filePath) {
    // Find the initialization method and add guard logic
    const initMethodPattern = new RegExp(`(private async initialize.*?${componentName.replace('-', '')}.*?\\(\\)[^{]*{)`, 'i');
    const match = content.match(initMethodPattern);

    if (match) {
      const guardCode = `
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(\`⚠️ \${this.constructor.name}: Already initialized, skipping duplicate initialization\`);
      return;
    }`;

      const modifiedContent = content.replace(initMethodPattern, match[1] + guardCode);

      // Also add flag setting after successful initialization
      const successPattern = /console\.log\(['`]✅.*?initialized.*?['`]\);/;
      const modifiedContent2 = modifiedContent.replace(successPattern, (match) => {
        return match + '\n        this.usingUSWDSEnhancement = true;';
      });

      fs.writeFileSync(filePath, modifiedContent2, 'utf8');
      this.filesFixed++;
      this.log(`✅ ${componentName} - Added initialization guard logic`, 'green');
      return true;
    } else {
      this.log(`⚠️ ${componentName} - No initialization method found, keeping variable`, 'yellow');
      return false;
    }
  }

  removeUnusedVariable(content, componentName, filePath) {
    // Remove the unused private property declaration
    const variablePattern = /^\s*private usingUSWDSEnhancement = false;\s*$/m;

    if (variablePattern.test(content)) {
      const modifiedContent = content.replace(variablePattern, '');
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      this.filesFixed++;
      this.log(`✅ ${componentName} - Removed unused variable`, 'green');
      return true;
    } else {
      this.log(`⚠️ ${componentName} - Variable declaration not found`, 'yellow');
      return false;
    }
  }
}

// Self-executing fix
const fixer = new UnusedVariableFixer();
fixer.fixUnusedVariables().catch(error => {
  console.error('Fix failed:', error);
  process.exit(1);
});

export default UnusedVariableFixer;