#!/usr/bin/env node

/**
 * Accessibility Gate Script
 *
 * Prevents accessibility regressions by validating components before commits.
 * This script catches the accessibility issues we fixed in combo-box and date-picker.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Glob } from 'glob';

const ACCESSIBILITY_THRESHOLDS = {
  // Components that must maintain perfect accessibility
  critical: ['date-picker', 'modal', 'combo-box'],
  // Maximum violations allowed per component type
  maxViolations: {
    critical: 0,    // Critical components: zero violations
    standard: 2,    // Standard components: max 2 minor violations
    experimental: 5 // Experimental components: max 5 violations
  }
};

class AccessibilityGate {
  constructor() {
    this.violations = [];
    this.componentStats = new Map();
  }

  async run() {
    console.log('🔒 Running Accessibility Gate...');

    try {
      await this.validateModifiedComponents();
      await this.runComprehensiveAccessibilityTests();
      await this.validateARIAPatterns();
      await this.validateKeyboardNavigation();

      this.generateReport();
      this.enforceGate();

    } catch (error) {
      console.error('❌ Accessibility gate failed:', error.message);
      process.exit(1);
    }
  }

  async validateModifiedComponents() {
    console.log('🔍 Validating modified components...');

    // Get modified component files
    const modifiedFiles = this.getModifiedComponents();

    if (modifiedFiles.length === 0) {
      console.log('📝 No modified components found, skipping component-specific validation');
      return;
    }

    for (const file of modifiedFiles) {
      const componentName = this.extractComponentName(file);
      console.log(`  Checking ${componentName}...`);

      const violations = await this.runComponentAccessibilityTest(file);
      this.componentStats.set(componentName, {
        file,
        violations,
        isCritical: ACCESSIBILITY_THRESHOLDS.critical.includes(componentName)
      });
    }
  }

  async runComprehensiveAccessibilityTests() {
    console.log('🧪 Running comprehensive accessibility tests...');

    try {
      // Run accessibility tests and capture output
      const testOutput = execSync('npm run test -- accessibility --reporter=json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const testResults = this.parseTestResults(testOutput);
      this.analyzeTestResults(testResults);

    } catch (error) {
      // If tests fail, capture the violations
      const errorOutput = error.stdout || error.stderr || '';
      this.parseAccessibilityViolations(errorOutput);
    }
  }

  async validateARIAPatterns() {
    console.log('🏷️ Validating ARIA patterns...');

    const glob = new Glob('src/components/**/usa-*.ts');
    const componentFiles = await glob.walk();

    const ariaValidation = {
      required: {
        'date-picker': ['aria-haspopup', 'aria-controls', 'aria-modal'],
        'modal': ['aria-modal', 'role'],
        'combo-box': ['aria-expanded', 'aria-controls', 'aria-labelledby'],
        'tooltip': ['aria-describedby', 'role']
      }
    };

    for (const file of componentFiles) {
      const componentName = this.extractComponentName(file);
      const requiredAria = ariaValidation.required[componentName];

      if (requiredAria) {
        const content = fs.readFileSync(file, 'utf8');
        const missingAria = requiredAria.filter(attr => !content.includes(attr));

        if (missingAria.length > 0) {
          this.violations.push({
            type: 'missing-aria',
            component: componentName,
            file,
            missing: missingAria,
            severity: 'critical'
          });
        }
      }
    }
  }

  async validateKeyboardNavigation() {
    console.log('⌨️ Validating keyboard navigation...');

    const keyboardComponents = ['date-picker', 'modal', 'tooltip', 'combo-box'];
    const requiredKeys = ['ArrowDown', 'Escape', 'Enter', 'Space'];

    const glob = new Glob('src/components/**/usa-*.ts');
    const componentFiles = await glob.walk();

    for (const file of componentFiles) {
      const componentName = this.extractComponentName(file);

      if (keyboardComponents.includes(componentName)) {
        const content = fs.readFileSync(file, 'utf8');

        // Check for keyboard event handlers
        if (!content.includes('keydown') && !content.includes('keyup')) {
          this.violations.push({
            type: 'missing-keyboard',
            component: componentName,
            file,
            message: 'Missing keyboard event handlers',
            severity: 'critical'
          });
          continue;
        }

        // Check for specific key handlers
        const missingKeys = requiredKeys.filter(key => !content.includes(key));
        if (missingKeys.length > 0) {
          this.violations.push({
            type: 'incomplete-keyboard',
            component: componentName,
            file,
            missing: missingKeys,
            severity: 'warning'
          });
        }
      }
    }
  }

  getModifiedComponents() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return output.split('\n')
        .filter(file => file.match(/src\/components\/.*\/usa-.*\.ts$/))
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  extractComponentName(filePath) {
    const fileName = path.basename(filePath, '.ts');
    return fileName.replace('usa-', '');
  }

  async runComponentAccessibilityTest(filePath) {
    const componentName = this.extractComponentName(filePath);

    try {
      // Run component-specific accessibility test
      const output = execSync(`npm run test -- ${componentName} --reporter=json`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return this.parseAccessibilityViolationsFromTest(output);
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || '';
      return this.parseAccessibilityViolationsFromTest(errorOutput);
    }
  }

  parseTestResults(output) {
    try {
      // Try to parse JSON output
      const jsonStart = output.indexOf('{');
      const jsonEnd = output.lastIndexOf('}') + 1;

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        return JSON.parse(output.slice(jsonStart, jsonEnd));
      }
    } catch (error) {
      console.warn('Could not parse test results as JSON');
    }

    return { testResults: [] };
  }

  parseAccessibilityViolations(output) {
    // Parse accessibility violations from test output
    const violationPattern = /ACCESSIBILITY VIOLATIONS FOUND \((\d+) violations?\)/g;
    let match;

    while ((match = violationPattern.exec(output)) !== null) {
      const violationCount = parseInt(match[1]);
      this.violations.push({
        type: 'accessibility-violation',
        count: violationCount,
        severity: violationCount > 0 ? 'critical' : 'info'
      });
    }
  }

  parseAccessibilityViolationsFromTest(output) {
    const violations = [];
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.includes('ACCESSIBILITY VIOLATIONS')) {
        const match = line.match(/(\d+) violations?/);
        if (match) {
          violations.push({
            count: parseInt(match[1]),
            line: line.trim()
          });
        }
      }
    }

    return violations;
  }

  analyzeTestResults(results) {
    // Analyze test results for accessibility patterns
    if (results.testResults) {
      for (const testResult of results.testResults) {
        if (testResult.status === 'failed' &&
            testResult.message &&
            testResult.message.includes('accessibility')) {
          this.violations.push({
            type: 'test-failure',
            test: testResult.ancestorTitles?.join(' > ') || 'Unknown test',
            message: testResult.message,
            severity: 'critical'
          });
        }
      }
    }
  }

  generateReport() {
    console.log('\n📊 ACCESSIBILITY GATE REPORT');
    console.log('================================');

    const criticalViolations = this.violations.filter(v => v.severity === 'critical');
    const warnings = this.violations.filter(v => v.severity === 'warning');

    console.log(`🚨 Critical violations: ${criticalViolations.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`📋 Total issues: ${this.violations.length}`);

    if (criticalViolations.length > 0) {
      console.log('\n🚨 CRITICAL VIOLATIONS:');
      criticalViolations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation.type}: ${violation.component || 'Global'}`);
        if (violation.missing) {
          console.log(`     Missing: ${violation.missing.join(', ')}`);
        }
        if (violation.message) {
          console.log(`     ${violation.message}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.type}: ${warning.component || 'Global'}`);
        if (warning.missing) {
          console.log(`     Missing: ${warning.missing.join(', ')}`);
        }
      });
    }

    // Component-specific stats
    if (this.componentStats.size > 0) {
      console.log('\n📋 COMPONENT STATUS:');
      for (const [component, stats] of this.componentStats) {
        const status = stats.violations.length === 0 ? '✅' : '❌';
        const criticalFlag = stats.isCritical ? ' (CRITICAL)' : '';
        console.log(`  ${status} ${component}${criticalFlag}: ${stats.violations.length} violations`);
      }
    }
  }

  enforceGate() {
    const criticalViolations = this.violations.filter(v => v.severity === 'critical');

    if (criticalViolations.length > 0) {
      console.log('\n❌ ACCESSIBILITY GATE FAILED');
      console.log(`${criticalViolations.length} critical accessibility violations detected.`);
      console.log('\nTo fix:');
      console.log('  1. Run: npm run test -- accessibility');
      console.log('  2. Fix all ACCESSIBILITY VIOLATIONS FOUND');
      console.log('  3. Ensure ARIA attributes are properly implemented');
      console.log('  4. Add keyboard navigation handlers');
      console.log('\nOr use --no-verify to skip (not recommended)');

      process.exit(1);
    }

    // Check component-specific thresholds
    for (const [component, stats] of this.componentStats) {
      const threshold = stats.isCritical
        ? ACCESSIBILITY_THRESHOLDS.maxViolations.critical
        : ACCESSIBILITY_THRESHOLDS.maxViolations.standard;

      if (stats.violations.length > threshold) {
        console.log(`\n❌ ACCESSIBILITY GATE FAILED FOR ${component.toUpperCase()}`);
        console.log(`Component exceeds violation threshold: ${stats.violations.length} > ${threshold}`);
        process.exit(1);
      }
    }

    console.log('\n✅ ACCESSIBILITY GATE PASSED');
    console.log('All components meet accessibility requirements.');
  }
}

// Run the accessibility gate if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const gate = new AccessibilityGate();
  gate.run().catch(console.error);
}

export default AccessibilityGate;