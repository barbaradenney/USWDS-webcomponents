#!/usr/bin/env node

/**
 * Fix duplicate initialization guard checks that were accidentally added
 */

import fs from 'fs';

const componentsToFix = [
  'combo-box', 'header', 'language-selector', 'pagination', 'search', 'select'
];

class DuplicateGuardFixer {
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

  async fixDuplicateGuards() {
    this.log('\n🔧 Fixing duplicate initialization guards', 'cyan');

    for (const componentName of componentsToFix) {
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

      // Pattern to match duplicate guard blocks
      const duplicateGuardPattern = /(\s*\/\/ Prevent multiple initializations\s*if \(this\.usingUSWDSEnhancement\) \{\s*console\.log\([^}]+\}[^}]+\}\s*){2,}/gs;

      if (duplicateGuardPattern.test(content)) {
        // Replace multiple instances with single instance
        const fixedContent = content.replace(duplicateGuardPattern, (match) => {
          // Extract just the first guard block
          const singleGuard = match.match(/\s*\/\/ Prevent multiple initializations\s*if \(this\.usingUSWDSEnhancement\) \{\s*console\.log\([^}]+\}[^}]+\}/s);
          return singleGuard ? singleGuard[0] : match;
        });

        // Also fix duplicate flag assignments
        const flagPattern = /(this\.usingUSWDSEnhancement = true;\s*){2,}/g;
        const finalContent = fixedContent.replace(flagPattern, 'this.usingUSWDSEnhancement = true;');

        if (finalContent !== content) {
          fs.writeFileSync(filePath, finalContent, 'utf8');
          this.filesFixed++;
          this.log(`✅ ${componentName} - Fixed duplicate guards`, 'green');
          modified = true;
        }
      }

      if (!modified) {
        this.log(`✅ ${componentName} - No duplicates found`, 'green');
      }

    } catch (error) {
      this.log(`❌ Error processing ${componentName}: ${error.message}`, 'red');
    }
  }
}

// Self-executing fix
const fixer = new DuplicateGuardFixer();
fixer.fixDuplicateGuards().catch(error => {
  console.error('Fix failed:', error);
  process.exit(1);
});

export default DuplicateGuardFixer;