#!/usr/bin/env node

/**
 * USWDS Component Initialization Guard Auto-Fix Script
 *
 * Automatically adds initialization guards to components with USWDS .on(this) calls
 * to prevent duplicate initialization issues that cause component failures.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class InitializationGuardFixer {
  constructor() {
    this.filesFixed = 0;
    this.errors = [];
    this.dryRun = process.argv.includes('--dry-run');
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

  async fixAllComponents() {
    this.log('\n🔧 USWDS Initialization Guard Auto-Fixer', 'cyan');

    if (this.dryRun) {
      this.log('🧪 DRY RUN MODE - No files will be modified', 'yellow');
    }

    // Find all component files that need USWDS initialization
    const componentFiles = glob.sync('src/components/**/*.ts', {
      ignore: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/*.stories.ts',
        '**/index.ts'
      ]
    });

    this.log(`\nScanning ${componentFiles.length} component files...`, 'blue');

    for (const filePath of componentFiles) {
      await this.processComponent(filePath);
    }

    this.generateReport();
  }

  async processComponent(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;

      // Check if component has USWDS initialization
      const hasUSWDSInit = content.includes('.on(this)');
      if (!hasUSWDSInit) {
        return; // Skip components without USWDS initialization
      }

      // Check if already has guard
      const hasGuard = content.includes('usingUSWDSEnhancement') ||
                      content.includes('initialized') ||
                      content.includes('Already initialized');

      if (hasGuard) {
        this.log(`✅ ${path.basename(filePath)} - Already has initialization guard`, 'green');
        return;
      }

      this.log(`🔨 ${path.basename(filePath)} - Adding initialization guard...`, 'yellow');

      // Apply fixes
      content = this.addInitializationGuard(content, filePath);
      content = this.addGuardProperty(content, filePath);
      content = this.addCleanupFlagReset(content, filePath);

      // Write changes if not dry run
      if (!this.dryRun && content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.filesFixed++;
        this.log(`✅ ${path.basename(filePath)} - Fixed!`, 'green');
      } else if (this.dryRun && content !== originalContent) {
        this.log(`📋 ${path.basename(filePath)} - Would be fixed`, 'blue');
        this.filesFixed++;
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this.log(`❌ Error processing ${filePath}: ${error.message}`, 'red');
    }
  }

  addGuardProperty(content, filePath) {
    // Add the guard property after other private properties
    const privatePropertyRegex = /(\s+private\s+[^=]+?[;}]\s*)/g;
    const matches = [...content.matchAll(privatePropertyRegex)];

    if (matches.length > 0) {
      // Insert after the last private property
      const lastMatch = matches[matches.length - 1];
      const insertIndex = lastMatch.index + lastMatch[0].length;

      const guardProperty = '  private usingUSWDSEnhancement = false;\n\n';

      return content.slice(0, insertIndex) + guardProperty + content.slice(insertIndex);
    }

    // Fallback: insert after class declaration
    const classMatch = content.match(/class\s+\w+[^{]*{\s*/);
    if (classMatch) {
      const insertIndex = classMatch.index + classMatch[0].length;
      const guardProperty = '  private usingUSWDSEnhancement = false;\n\n';

      return content.slice(0, insertIndex) + guardProperty + content.slice(insertIndex);
    }

    return content;
  }

  addInitializationGuard(content, filePath) {
    // Find initialization methods that call .on(this)
    const initMethodRegex = /(private\s+async\s+initialize\w*\([^)]*\)\s*{\s*)/g;

    return content.replace(initMethodRegex, (match, methodStart) => {
      const guardCode = `    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(\`⚠️ \${this.constructor.name}: Already initialized, skipping duplicate initialization\`);
      return;
    }

`;
      return methodStart + '\n' + guardCode;
    });
  }

  addCleanupFlagReset(content, filePath) {
    // Find cleanup methods and add flag reset
    const cleanupMethodRegex = /(private\s+cleanup\w*\([^)]*\)\s*{[^}]*)(}\s*)$/gm;

    return content.replace(cleanupMethodRegex, (match, methodBody, closing) => {
      if (methodBody.includes('usingUSWDSEnhancement = false')) {
        return match; // Already has flag reset
      }

      const flagReset = '\n    // Reset enhancement flag to allow reinitialization\n    this.usingUSWDSEnhancement = false;\n  ';
      return methodBody + flagReset + closing;
    });
  }

  generateReport() {
    this.log('\n📊 INITIALIZATION GUARD FIX REPORT', 'cyan');

    this.log(`\nFiles processed: ${this.filesFixed}`, this.filesFixed > 0 ? 'green' : 'blue');

    if (this.errors.length > 0) {
      this.log(`\n❌ Errors encountered: ${this.errors.length}`, 'red');
      this.errors.forEach(({ file, error }) => {
        this.log(`   ${path.basename(file)}: ${error}`, 'red');
      });
    }

    if (this.filesFixed > 0) {
      if (this.dryRun) {
        this.log('\n🧪 DRY RUN COMPLETE - Run without --dry-run to apply fixes', 'yellow');
      } else {
        this.log('\n✅ FIXES APPLIED SUCCESSFULLY', 'green');
        this.log('\nNext steps:', 'blue');
        this.log('1. Run: npm run typecheck', 'yellow');
        this.log('2. Run: npm run test', 'yellow');
        this.log('3. Test components in Storybook', 'yellow');
      }
    } else {
      this.log('\n🎉 No components needed fixing!', 'green');
    }
  }
}

// Self-executing fix
const fixer = new InitializationGuardFixer();
fixer.fixAllComponents().catch(error => {
  console.error('Fix process failed:', error);
  process.exit(1);
});

export default InitializationGuardFixer;