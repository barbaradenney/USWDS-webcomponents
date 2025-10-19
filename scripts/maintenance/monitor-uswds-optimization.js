#!/usr/bin/env node

/**
 * USWDS Module Optimization Monitor
 *
 * Monitors and validates USWDS module optimization to prevent the configuration
 * regressions we fixed. Ensures Storybook configuration stays optimized.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REQUIRED_USWDS_MODULES = [
  '@uswds/uswds/js/usa-tooltip',
  '@uswds/uswds/js/usa-modal',
  '@uswds/uswds/js/usa-accordion',
  '@uswds/uswds/js/usa-date-picker',
  '@uswds/uswds/js/usa-combo-box',
  '@uswds/uswds/js/usa-time-picker',
  '@uswds/uswds/js/usa-header'
];

class USWDSOptimizationMonitor {
  constructor() {
    this.issues = [];
    this.storybookConfig = null;
    this.packageJson = null;
  }

  async run() {
    console.log('⚙️ Monitoring USWDS Module Optimization...');

    try {
      await this.validateStorybookConfiguration();
      await this.validatePackageDependencies();
      await this.validateViteConfiguration();
      await this.validateModuleImports();
      await this.testModuleLoading();

      this.generateReport();
      this.enforceOptimization();

    } catch (error) {
      console.error('❌ USWDS optimization monitoring failed:', error.message);
      process.exit(1);
    }
  }

  async validateStorybookConfiguration() {
    console.log('🎭 Validating Storybook configuration...');

    const storybookMainPath = '.storybook/main.ts';

    if (!fs.existsSync(storybookMainPath)) {
      this.issues.push({
        type: 'missing-config',
        severity: 'critical',
        message: 'Storybook main.ts configuration not found'
      });
      return;
    }

    const content = fs.readFileSync(storybookMainPath, 'utf8');
    this.storybookConfig = content;

    // Check for optimizeDeps configuration
    if (!content.includes('optimizeDeps')) {
      this.issues.push({
        type: 'missing-optimizeDeps',
        severity: 'critical',
        message: 'Missing optimizeDeps configuration in Storybook'
      });
    }

    // Check for include array
    if (!content.includes('include')) {
      this.issues.push({
        type: 'missing-include',
        severity: 'critical',
        message: 'Missing include array in optimizeDeps'
      });
    }

    // Check for force: true
    if (!content.match(/(force:\s*true|\.force\s*=\s*true)/)) {
      this.issues.push({
        type: 'missing-force',
        severity: 'warning',
        message: 'Missing force: true in optimizeDeps (may cause caching issues)'
      });
    }

    // Check for CommonJS options
    if (!content.includes('commonjsOptions')) {
      this.issues.push({
        type: 'missing-commonjs',
        severity: 'critical',
        message: 'Missing commonjsOptions for USWDS module handling'
      });
    }

    // Check for USWDS pattern in CommonJS
    if (!content.includes('/@uswds\\/uswds/')) {
      this.issues.push({
        type: 'missing-uswds-pattern',
        severity: 'critical',
        message: 'Missing USWDS pattern in commonjsOptions'
      });
    }

    // Check for all required USWDS modules
    const missingModules = REQUIRED_USWDS_MODULES.filter(module => !content.includes(module));
    if (missingModules.length > 0) {
      this.issues.push({
        type: 'missing-modules',
        severity: 'critical',
        message: `Missing USWDS modules in optimization: ${missingModules.join(', ')}`
      });
    }
  }

  async validatePackageDependencies() {
    console.log('📦 Validating package dependencies...');

    const packageJsonPath = 'package.json';

    if (!fs.existsSync(packageJsonPath)) {
      this.issues.push({
        type: 'missing-package-json',
        severity: 'critical',
        message: 'package.json not found'
      });
      return;
    }

    const content = fs.readFileSync(packageJsonPath, 'utf8');
    this.packageJson = JSON.parse(content);

    const dependencies = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies };

    // Check for USWDS
    if (!dependencies['@uswds/uswds']) {
      this.issues.push({
        type: 'missing-uswds-dependency',
        severity: 'critical',
        message: '@uswds/uswds dependency not found'
      });
    }

    // Check for Lit
    if (!dependencies['lit']) {
      this.issues.push({
        type: 'missing-lit-dependency',
        severity: 'critical',
        message: 'lit dependency not found'
      });
    }

    // Check for Vite
    if (!dependencies['vite'] && !dependencies['@vitejs/plugin-lit']) {
      this.issues.push({
        type: 'missing-vite-dependency',
        severity: 'warning',
        message: 'Vite or Vite Lit plugin not found'
      });
    }
  }

  async validateViteConfiguration() {
    console.log('⚡ Validating Vite configuration patterns...');

    // Check if there are any separate Vite configs that might conflict
    const viteConfigs = ['vite.config.ts', 'vite.config.js', 'vitest.config.ts'];

    for (const configFile of viteConfigs) {
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf8');

        // Check for conflicting USWDS module configurations
        if (content.includes('@uswds/uswds/js/') &&
            !content.includes('// From Storybook config')) {
          this.issues.push({
            type: 'conflicting-vite-config',
            severity: 'warning',
            message: `${configFile} may have conflicting USWDS configuration`,
            file: configFile
          });
        }
      }
    }
  }

  async validateModuleImports() {
    console.log('🔍 Validating component module imports...');

    const componentFiles = this.findComponentFiles();

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for dynamic imports
      const dynamicImportPattern = /import\(['"`]@uswds\/uswds\/js\/([^'"`]+)['"`]\)/g;
      let match;

      while ((match = dynamicImportPattern.exec(content)) !== null) {
        const moduleName = `@uswds/uswds/js/${match[1]}`;

        // Check if this module is optimized in Storybook
        if (this.storybookConfig && !this.storybookConfig.includes(moduleName)) {
          this.issues.push({
            type: 'unoptimized-module',
            severity: 'warning',
            message: `Component ${file} imports ${moduleName} which is not optimized in Storybook`,
            file,
            module: moduleName
          });
        }
      }

      // Check for problematic window.USWDS usage
      if (content.includes('window.USWDS')) {
        this.issues.push({
          type: 'window-uswds-usage',
          severity: 'critical',
          message: `Component ${file} uses window.USWDS instead of proper imports`,
          file
        });
      }
    }
  }

  async testModuleLoading() {
    console.log('🧪 Testing module loading performance...');

    try {
      // Run a quick Storybook build test to check optimization
      const buildOutput = execSync('npm run build-storybook -- --quiet', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000
      });

      // Check for optimization warnings in build output
      if (buildOutput.includes('optimization') || buildOutput.includes('large chunk')) {
        this.issues.push({
          type: 'build-optimization-warning',
          severity: 'warning',
          message: 'Storybook build shows optimization warnings'
        });
      }

    } catch (error) {
      this.issues.push({
        type: 'build-test-failed',
        severity: 'warning',
        message: 'Could not test Storybook build optimization'
      });
    }
  }

  findComponentFiles() {
    try {
      const output = execSync('find src/components -name "usa-*.ts" -type f', {
        encoding: 'utf8'
      });
      return output.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  generateReport() {
    console.log('\n📊 USWDS OPTIMIZATION MONITORING REPORT');
    console.log('==========================================');

    const critical = this.issues.filter(i => i.severity === 'critical');
    const warnings = this.issues.filter(i => i.severity === 'warning');

    console.log(`🚨 Critical issues: ${critical.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`📋 Total issues: ${this.issues.length}`);

    if (critical.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      critical.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.type}: ${issue.message}`);
        if (issue.file) {
          console.log(`     File: ${issue.file}`);
        }
        if (issue.module) {
          console.log(`     Module: ${issue.module}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.type}: ${warning.message}`);
        if (warning.file) {
          console.log(`     File: ${warning.file}`);
        }
      });
    }

    // Optimization status
    console.log('\n⚙️ OPTIMIZATION STATUS:');
    console.log(`✅ Storybook config found: ${this.storybookConfig ? 'Yes' : 'No'}`);
    console.log(`✅ Required modules optimized: ${this.countOptimizedModules()}/${REQUIRED_USWDS_MODULES.length}`);

    if (this.packageJson) {
      const deps = { ...this.packageJson.dependencies, ...this.packageJson.devDependencies };
      console.log(`✅ USWDS dependency: ${deps['@uswds/uswds'] || 'Missing'}`);
      console.log(`✅ Lit dependency: ${deps['lit'] || 'Missing'}`);
    }
  }

  countOptimizedModules() {
    if (!this.storybookConfig) return 0;

    return REQUIRED_USWDS_MODULES.filter(module =>
      this.storybookConfig.includes(module)
    ).length;
  }

  enforceOptimization() {
    const critical = this.issues.filter(i => i.severity === 'critical');

    if (critical.length > 0) {
      console.log('\n❌ USWDS OPTIMIZATION MONITORING FAILED');
      console.log(`${critical.length} critical optimization issues detected.`);
      console.log('\nTo fix:');
      console.log('  1. Check .storybook/main.ts configuration');
      console.log('  2. Ensure all USWDS modules are in optimizeDeps.include');
      console.log('  3. Add force: true to optimizeDeps');
      console.log('  4. Include USWDS pattern in commonjsOptions');
      console.log('  5. Run: npm run test -- uswds-module-optimization');

      process.exit(1);
    }

    const optimizedCount = this.countOptimizedModules();
    const optimizationPercentage = (optimizedCount / REQUIRED_USWDS_MODULES.length) * 100;

    if (optimizationPercentage < 90) {
      console.log('\n⚠️  OPTIMIZATION WARNING');
      console.log(`Only ${optimizationPercentage.toFixed(1)}% of USWDS modules are optimized.`);
      console.log('Consider adding missing modules to Storybook optimizeDeps configuration.');
    }

    console.log('\n✅ USWDS OPTIMIZATION MONITORING PASSED');
    console.log(`${optimizedCount}/${REQUIRED_USWDS_MODULES.length} modules optimized.`);
  }
}

// Run the monitor if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new USWDSOptimizationMonitor();
  monitor.run().catch(console.error);
}

export default USWDSOptimizationMonitor;