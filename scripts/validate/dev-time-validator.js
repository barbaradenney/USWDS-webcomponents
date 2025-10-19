#!/usr/bin/env node

/**
 * 🚀 Development-Time Validator
 *
 * Catches issues BEFORE they reach pre-commit hooks or CI/CD
 * Runs continuous validation during development to prevent integration problems
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class DevTimeValidator {
  constructor() {
    this.isValidating = false;
    this.lastValidation = null;
    this.validationQueue = new Set();
    this.issueCount = {
      typescript: 0,
      eslint: 0,
      uswds: 0,
      tests: 0,
      accessibility: 0
    };

    // Debounce validation to avoid excessive runs
    this.debounceTimer = null;
    this.debounceDelay = 2000; // 2 seconds
  }

  async start() {
    console.log('🚀 Starting Development-Time Validator...');
    console.log('📊 This will catch issues BEFORE pre-commit hooks\n');

    // Initial validation
    await this.runFullValidation();

    // Set up file watchers
    this.setupFileWatchers();

    // Set up periodic comprehensive checks
    this.setupPeriodicChecks();

    console.log('✅ Development-Time Validator is now active');
    console.log('💡 Issues will be detected in real-time as you code\n');
  }

  setupFileWatchers() {
    // Watch TypeScript files
    const tsWatcher = chokidar.watch('src/**/*.ts', {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    tsWatcher.on('change', (filepath) => {
      this.queueValidation('typescript', filepath);
      this.queueValidation('uswds', filepath);
    });

    // Watch test files
    const testWatcher = chokidar.watch([
      'src/**/*.test.ts',
      '__tests__/**/*.test.ts'
    ]);

    testWatcher.on('change', (filepath) => {
      this.queueValidation('tests', filepath);
    });

    // Watch component files for USWDS compliance
    // Regex pattern for ignoring test and story files
    const testPattern = new RegExp('\\.(test|stories)\\.ts$');
    const componentWatcher = chokidar.watch('src/components/**/*.ts', {
      ignored: testPattern
    });

    componentWatcher.on('change', (filepath) => {
      this.queueValidation('uswds', filepath);
      this.queueValidation('accessibility', filepath);
    });

    console.log('👀 File watchers set up for real-time validation');
  }

  setupPeriodicChecks() {
    // Run comprehensive validation every 10 minutes
    setInterval(() => {
      console.log('\n⏰ Running periodic comprehensive validation...');
      this.runFullValidation();
    }, 10 * 60 * 1000);

    // Run AI analysis every 30 minutes
    setInterval(() => {
      console.log('\n🤖 Running AI-powered issue detection...');
      this.runAIAnalysis();
    }, 30 * 60 * 1000);
  }

  queueValidation(type, filepath) {
    this.validationQueue.add({ type, filepath });

    // Debounce validation
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.processValidationQueue();
    }, this.debounceDelay);
  }

  async processValidationQueue() {
    if (this.isValidating || this.validationQueue.size === 0) return;

    this.isValidating = true;
    const validations = Array.from(this.validationQueue);
    this.validationQueue.clear();

    console.log(`\n🔍 Processing ${validations.length} validation(s)...`);

    for (const { type, filepath } of validations) {
      await this.runValidation(type, filepath);
    }

    this.displayIssuesSummary();
    this.isValidating = false;
  }

  async runValidation(type, filepath) {
    const timestamp = new Date().toLocaleTimeString();

    try {
      switch (type) {
        case 'typescript':
          await this.validateTypeScript(filepath);
          break;
        case 'eslint':
          await this.validateESLint(filepath);
          break;
        case 'uswds':
          await this.validateUSWDSCompliance(filepath);
          break;
        case 'tests':
          await this.validateTests(filepath);
          break;
        case 'accessibility':
          await this.validateAccessibility(filepath);
          break;
      }
    } catch (error) {
      console.log(`❌ [${timestamp}] ${type} validation failed for ${filepath}`);
      console.log(`   Error: ${error.message}`);
      this.issueCount[type]++;
    }
  }

  async validateTypeScript(filepath) {
    try {
      execSync('npm run typecheck', {
        stdio: 'pipe',
        timeout: 30000
      });

      if (this.issueCount.typescript > 0) {
        console.log(`✅ TypeScript issues resolved for ${path.basename(filepath)}`);
        this.issueCount.typescript = 0;
      }
    } catch (error) {
      this.issueCount.typescript++;
      console.log(`❌ TypeScript error in ${path.basename(filepath)}`);

      // Extract specific error for this file
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const fileErrors = output.split('\n')
        .filter(line => line.includes(filepath))
        .slice(0, 3); // Show first 3 errors max

      if (fileErrors.length > 0) {
        fileErrors.forEach(error => console.log(`   ${error.trim()}`));
      }
    }
  }

  async validateESLint(filepath) {
    try {
      execSync(`npx eslint ${filepath}`, {
        stdio: 'pipe',
        timeout: 15000
      });

      if (this.issueCount.eslint > 0) {
        console.log(`✅ ESLint issues resolved for ${path.basename(filepath)}`);
        this.issueCount.eslint = 0;
      }
    } catch (error) {
      this.issueCount.eslint++;
      console.log(`❌ ESLint error in ${path.basename(filepath)}`);

      const output = error.stdout?.toString() || '';
      const errors = output.split('\n').filter(line => line.trim()).slice(0, 2);
      errors.forEach(error => console.log(`   ${error.trim()}`));
    }
  }

  async validateUSWDSCompliance(filepath) {
    try {
      execSync('npm run uswds:compliance:static', {
        stdio: 'pipe',
        timeout: 20000
      });

      if (this.issueCount.uswds > 0) {
        console.log(`✅ USWDS compliance issues resolved for ${path.basename(filepath)}`);
        this.issueCount.uswds = 0;
      }
    } catch (error) {
      this.issueCount.uswds++;
      console.log(`❌ USWDS compliance issue in ${path.basename(filepath)}`);
      console.log(`   💡 Run: npm run uswds:compliance for details`);
    }
  }

  async validateTests(filepath) {
    try {
      execSync(`npm test ${filepath}`, {
        stdio: 'pipe',
        timeout: 30000
      });

      if (this.issueCount.tests > 0) {
        console.log(`✅ Test issues resolved for ${path.basename(filepath)}`);
        this.issueCount.tests = 0;
      }
    } catch (error) {
      this.issueCount.tests++;
      console.log(`❌ Test failure in ${path.basename(filepath)}`);
    }
  }

  async validateAccessibility(filepath) {
    // Skip accessibility validation for non-component files
    if (!filepath.includes('/components/') || filepath.includes('.test.') || filepath.includes('.stories.')) {
      return;
    }

    try {
      // Extract component name from filepath
      const parts = filepath.split('/');
      const componentsIndex = parts.indexOf('components');
      if (componentsIndex === -1 || componentsIndex === parts.length - 1) return;
      const componentName = parts[componentsIndex + 1];
      if (!componentName) return;

      const testFile = `src/components/${componentName}/usa-${componentName}.test.ts`;

      if (fs.existsSync(testFile)) {
        // Run accessibility tests specifically
        execSync(`npm test ${testFile} -- --grep "accessibility"`, {
          stdio: 'pipe',
          timeout: 20000
        });
      }

      if (this.issueCount.accessibility > 0) {
        console.log(`✅ Accessibility issues resolved for ${componentName}`);
        this.issueCount.accessibility = 0;
      }
    } catch (error) {
      this.issueCount.accessibility++;
      console.log(`❌ Accessibility issue in ${path.basename(filepath)}`);
    }
  }

  async runFullValidation() {
    console.log('🔍 Running full validation suite...');
    console.log(`📂 Project root: ${rootDir}`);

    const validations = [
      { name: 'TypeScript', command: 'npm run typecheck' },
      { name: 'ESLint', command: 'npm run lint' },
      { name: 'USWDS Compliance', command: 'npm run uswds:compliance:static' },
      { name: 'Critical Tests', command: 'npm run test:critical' },
      { name: 'Layout Tests', command: 'npm run test:layout:ci' }
    ];

    for (const { name, command } of validations) {
      try {
        execSync(command, { stdio: 'pipe', timeout: 60000 });
        console.log(`✅ ${name}: Passed`);
      } catch (error) {
        console.log(`❌ ${name}: Failed`);
        this.issueCount[name.toLowerCase().replace(/\s+/g, '')] = 1;
      }
    }
  }

  async runAIAnalysis() {
    try {
      console.log('🤖 Running AI-powered test analysis...');

      execSync('npm run ai:analyze', { stdio: 'pipe', timeout: 120000 });
      console.log('✅ AI analysis completed - check test-reports/ai-analysis/');

      // Run smart recommendations for high-priority issues
      execSync('npm run test:recommend:high', { stdio: 'pipe', timeout: 60000 });
      console.log('💡 Smart test recommendations generated');

    } catch (error) {
      console.log('⚠️  AI analysis failed - this is optional');
    }
  }

  displayIssuesSummary() {
    const totalIssues = Object.values(this.issueCount).reduce((a, b) => a + b, 0);

    if (totalIssues === 0) {
      console.log('✅ No issues detected - code is clean!');
      return;
    }

    console.log(`\n📊 Current Issues Summary (${totalIssues} total):`);

    Object.entries(this.issueCount).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   ${count > 0 ? '❌' : '✅'} ${type}: ${count} issue(s)`);
      }
    });

    console.log('\n💡 Fix these issues now to avoid pre-commit hook failures');
  }
}

// Start the validator if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DevTimeValidator();
  validator.start().catch(console.error);
}

export default DevTimeValidator;