#!/usr/bin/env node

/**
 * Fix missing cleanup flag resets in USWDS components
 * Adds 'this.usingUSWDSEnhancement = false;' to cleanup methods that are missing it
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Components that need cleanup flag reset (from detection script)
const componentsNeedingFix = [
  'tooltip', 'table', 'step-indicator', 'skip-link', 'select',
  'search', 'pagination', 'language-selector', 'header', 'combo-box'
];

class CleanupFlagFixer {
  constructor() {
    this.filesFixed = 0;
    this.errors = [];
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

  async fixCleanupFlags() {
    this.log('\n🔧 USWDS Cleanup Flag Fixer', 'cyan');

    for (const componentName of componentsNeedingFix) {
      const filePath = `src/components/${componentName}/usa-${componentName}.ts`;
      if (fs.existsSync(filePath)) {
        await this.processComponent(filePath, componentName);
      }
    }

    this.generateReport();
  }

  async processComponent(filePath, componentName) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check if already has the flag reset
      if (content.includes('this.usingUSWDSEnhancement = false')) {
        this.log(`✅ ${componentName} - Already has cleanup flag reset`, 'green');
        return;
      }

      // Find cleanup method pattern
      const cleanupRegex = /(private\s+cleanup\w*\([^)]*\)\s*{[^}]*)(}\s*$)/gm;
      let matches = [...content.matchAll(cleanupRegex)];

      if (matches.length === 0) {
        // Try alternative cleanup pattern
        const altCleanupRegex = /(disconnectedCallback\(\)[^}]*)(}\s*$)/gm;
        matches = [...content.matchAll(altCleanupRegex)];
      }

      if (matches.length === 0) {
        this.log(`⚠️ ${componentName} - No cleanup method found`, 'yellow');
        return;
      }

      let newContent = content;
      let fixed = false;

      for (const match of matches) {
        const methodBody = match[1];
        const closing = match[2];

        // Add flag reset before the closing brace
        const flagReset = '\n    // Reset enhancement flag to allow reinitialization\n    this.usingUSWDSEnhancement = false;';
        const newMethod = methodBody + flagReset + '\n  ' + closing;

        newContent = newContent.replace(match[0], newMethod);
        fixed = true;
      }

      if (fixed) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        this.filesFixed++;
        this.log(`✅ ${componentName} - Added cleanup flag reset`, 'green');
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this.log(`❌ Error processing ${filePath}: ${error.message}`, 'red');
    }
  }

  generateReport() {
    this.log('\n📊 CLEANUP FLAG FIX REPORT', 'cyan');
    this.log(`\nFiles processed: ${this.filesFixed}`, this.filesFixed > 0 ? 'green' : 'blue');

    if (this.errors.length > 0) {
      this.log(`\n❌ Errors encountered: ${this.errors.length}`, 'red');
      this.errors.forEach(({ file, error }) => {
        this.log(`   ${path.basename(file)}: ${error}`, 'red');
      });
    }

    if (this.filesFixed > 0) {
      this.log('\n✅ CLEANUP FLAGS FIXED', 'green');
      this.log('\nNext steps:', 'blue');
      this.log('1. Run: npm run typecheck', 'yellow');
      this.log('2. Run: npm run detect:initialization-issues', 'yellow');
    } else {
      this.log('\n🎉 No components needed cleanup flag fixes!', 'green');
    }
  }
}

// Self-executing fix
const fixer = new CleanupFlagFixer();
fixer.fixCleanupFlags().catch(error => {
  console.error('Fix process failed:', error);
  process.exit(1);
});

export default CleanupFlagFixer;