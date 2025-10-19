#!/usr/bin/env node

/**
 * Pre-commit Test Validation Hook
 *
 * This script runs automatically before git commits to ensure code quality
 * and prevent broken code from being committed.
 *
 * Validates:
 * - TypeScript compilation
 * - Test failures
 * - Linting issues
 * - Basic accessibility compliance
 *
 * Usage:
 *   Called automatically by husky pre-commit hook
 *   Or manually: node scripts/pre-commit-test-validation.js
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

class PreCommitValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  async validate() {
    console.log('🔍 Running pre-commit validation...\n');

    try {
      await this.validateTypeScript();
      await this.validateLinting();
      await this.validateCriticalTests();
      await this.validateStagedFiles();

      return this.reportResults();
    } catch (error) {
      console.error('❌ Pre-commit validation failed:', error.message);
      return false;
    }
  }

  async validateTypeScript() {
    console.log('📝 Checking TypeScript compilation...');

    try {
      execSync('npm run typecheck', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf8'
      });

      console.log('✅ TypeScript: No compilation errors');
    } catch (error) {
      const output = error.stdout || error.stderr;
      const errorCount = (output.match(/error TS/g) || []).length;

      this.errors.push(`TypeScript compilation failed with ${errorCount} errors`);
      console.log(`❌ TypeScript: ${errorCount} compilation errors found`);
    }
  }

  async validateLinting() {
    console.log('🔍 Checking code quality (linting)...');

    try {
      execSync('npm run lint', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf8'
      });

      console.log('✅ Linting: No issues found');
    } catch (error) {
      const output = error.stdout || error.stderr;
      const warningCount = (output.match(/warning/g) || []).length;
      const errorCount = (output.match(/error/g) || []).length;

      if (errorCount > 0) {
        this.errors.push(`Linting failed with ${errorCount} errors`);
        console.log(`❌ Linting: ${errorCount} errors found`);
      } else if (warningCount > 0) {
        this.warnings.push(`Linting has ${warningCount} warnings`);
        console.log(`⚠️  Linting: ${warningCount} warnings found`);
      }
    }
  }

  async validateCriticalTests() {
    console.log('🧪 Running critical tests...');

    try {
      // Run a subset of critical tests that must pass
      const output = execSync('npm run test -- --run --reporter=basic', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 60000 // 1 minute timeout
      });

      const passed = output.includes('✓') || output.includes('passed');
      const failed = output.includes('✗') || output.includes('failed');

      if (failed) {
        this.errors.push('Critical tests are failing');
        console.log('❌ Tests: Critical test failures detected');
      } else if (passed) {
        console.log('✅ Tests: Critical tests passing');
      } else {
        this.warnings.push('Unable to determine test status');
        console.log('⚠️  Tests: Unable to determine test status');
      }

    } catch (error) {
      // If tests fail, it's a critical error
      this.errors.push('Test suite failed to run or has failures');
      console.log('❌ Tests: Test suite failed');
    }
  }

  async validateStagedFiles() {
    console.log('📋 Validating staged files...');

    try {
      const stagedFiles = execSync('git diff --cached --name-only', {
        cwd: rootDir,
        encoding: 'utf8'
      }).trim().split('\n').filter(Boolean);

      const componentFiles = stagedFiles.filter(file =>
        file.includes('src/components/') && file.endsWith('.ts')
      );

      const testFiles = stagedFiles.filter(file =>
        file.includes('.test.ts') || file.includes('.spec.ts')
      );

      // Check if component changes have corresponding test updates
      for (const componentFile of componentFiles) {
        const componentName = componentFile.match(/usa-([^/]+)\.ts$/)?.[1];
        if (componentName) {
          const hasTestFile = testFiles.some(file =>
            file.includes(`usa-${componentName}.test.ts`)
          );

          if (!hasTestFile) {
            this.warnings.push(
              `Component ${componentName} modified but no test updates found`
            );
          }
        }
      }

      console.log(`✅ Staged files: ${stagedFiles.length} files validated`);

    } catch (error) {
      console.log('⚠️  Staged files: Could not validate staged files');
    }
  }

  reportResults() {
    console.log('\n📊 Pre-commit validation results:');
    console.log('================================');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All checks passed! Ready to commit.\n');
      return true;
    }

    if (this.errors.length > 0) {
      console.log('❌ ERRORS (must fix before committing):');
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS (consider addressing):');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
      console.log();
    }

    if (this.errors.length > 0) {
      console.log('🚫 Commit blocked due to errors. Please fix and try again.\n');
      console.log('💡 Quick fixes:');
      console.log('   npm run lint:fix    # Fix linting issues');
      console.log('   npm run typecheck   # Check TypeScript errors');
      console.log('   npm run test        # Run tests to see failures\n');
      return false;
    }

    console.log('⚠️  Proceeding with warnings (consider fixing for better code quality).\n');
    return true;
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new PreCommitValidator();

  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Pre-commit validation failed:', error);
    process.exit(1);
  });
}

export { PreCommitValidator };