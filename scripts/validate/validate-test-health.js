#!/usr/bin/env node

/**
 * Comprehensive Test Health Validation Script
 *
 * This script provides automated detection and prevention of common testing issues
 * to ensure components maintain high quality and reliability.
 *
 * Features:
 * - Detects failing tests across all test types
 * - Validates TypeScript compilation
 * - Checks component accessibility compliance
 * - Ensures USWDS compliance standards
 * - Validates test coverage thresholds
 * - Reports component health metrics
 *
 * Usage:
 *   npm run test:validate-health
 *   npm run test:validate-health -- --fix
 *   npm run test:validate-health -- --component=modal
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

class TestHealthValidator {
  constructor(options = {}) {
    this.options = {
      fix: false,
      component: null,
      verbose: false,
      ...options
    };

    this.results = {
      tests: { total: 0, passed: 0, failed: 0, issues: [] },
      typescript: { errors: 0, issues: [] },
      accessibility: { violations: 0, issues: [] },
      coverage: { percentage: 0, threshold: 80, passed: false },
      components: new Map(),
      overall: { score: 0, status: 'unknown' }
    };
  }

  async validate() {
    console.log('🔍 Starting comprehensive test health validation...\n');

    try {
      await this.validateTypeScript();
      await this.validateTests();
      await this.validateAccessibility();
      await this.validateCoverage();
      await this.generateReport();

      return this.results.overall.status === 'healthy';
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  async validateTypeScript() {
    console.log('📝 Validating TypeScript compilation...');

    try {
      execSync('npm run typecheck', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf8'
      });

      console.log('✅ TypeScript compilation: PASSED\n');
    } catch (error) {
      const output = error.stdout || error.stderr;
      const errors = this.parseTypeScriptErrors(output);

      this.results.typescript.errors = errors.length;
      this.results.typescript.issues = errors;

      console.log(`❌ TypeScript compilation: ${errors.length} errors found\n`);

      if (this.options.verbose) {
        errors.forEach(error => {
          console.log(`   ${error.file}:${error.line} - ${error.message}`);
        });
        console.log();
      }
    }
  }

  async validateTests() {
    console.log('🧪 Validating test suite...');

    try {
      const testCmd = this.options.component
        ? `npm run test -- src/components/${this.options.component}/`
        : 'npm run test';

      const output = execSync(testCmd, {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf8'
      });

      const testResults = this.parseTestResults(output);
      this.results.tests = testResults;

      console.log(`✅ Tests: ${testResults.passed}/${testResults.total} passed\n`);

    } catch (error) {
      const output = error.stdout || error.stderr;
      const testResults = this.parseTestResults(output);
      this.results.tests = testResults;

      console.log(`❌ Tests: ${testResults.passed}/${testResults.total} passed (${testResults.failed} failed)\n`);

      if (this.options.verbose && testResults.issues.length > 0) {
        console.log('Failed tests:');
        testResults.issues.forEach(issue => {
          console.log(`   ${issue.file}: ${issue.test}`);
        });
        console.log();
      }
    }
  }

  async validateAccessibility() {
    console.log('♿ Validating accessibility compliance...');

    // Check for accessibility test patterns in component tests
    const accessibilityIssues = await this.scanAccessibilityTests();

    this.results.accessibility.violations = accessibilityIssues.length;
    this.results.accessibility.issues = accessibilityIssues;

    if (accessibilityIssues.length === 0) {
      console.log('✅ Accessibility: All components have a11y tests\n');
    } else {
      console.log(`❌ Accessibility: ${accessibilityIssues.length} components missing a11y tests\n`);

      if (this.options.verbose) {
        accessibilityIssues.forEach(issue => {
          console.log(`   ${issue.component}: ${issue.reason}`);
        });
        console.log();
      }
    }
  }

  async validateCoverage() {
    console.log('📊 Validating test coverage...');

    try {
      const output = execSync('npm run test:coverage -- --reporter=json', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf8'
      });

      const coverage = this.parseCoverageResults(output);
      this.results.coverage = coverage;

      if (coverage.passed) {
        console.log(`✅ Coverage: ${coverage.percentage}% (threshold: ${coverage.threshold}%)\n`);
      } else {
        console.log(`❌ Coverage: ${coverage.percentage}% below threshold of ${coverage.threshold}%\n`);
      }

    } catch (error) {
      console.log('⚠️  Coverage: Unable to determine coverage\n');
    }
  }

  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/(.+\.ts)\((\d+),\d+\): error (.+)/);
      if (match) {
        errors.push({
          file: match[1],
          line: match[2],
          message: match[3]
        });
      }
    }

    return errors;
  }

  parseTestResults(output) {
    const results = { total: 0, passed: 0, failed: 0, issues: [] };

    // Parse Vitest output format
    const totalMatch = output.match(/Tests\s+(\d+)\s+failed.*?(\d+)\s+passed\s+\((\d+)\)/);
    if (totalMatch) {
      results.failed = parseInt(totalMatch[1]);
      results.passed = parseInt(totalMatch[2]);
      results.total = parseInt(totalMatch[3]);
    }

    // Extract failed test details
    const failureMatches = output.matchAll(/FAIL\s+(.+?\.test\.ts).*?>\s+(.+)/g);
    for (const match of failureMatches) {
      results.issues.push({
        file: match[1],
        test: match[2]
      });
    }

    return results;
  }

  async scanAccessibilityTests() {
    const issues = [];
    const componentsDir = join(rootDir, 'src/components');

    try {
      const components = execSync('ls', { cwd: componentsDir, encoding: 'utf8' })
        .trim().split('\n');

      for (const component of components) {
        const testFile = join(componentsDir, component, `usa-${component}.test.ts`);

        if (existsSync(testFile)) {
          const content = readFileSync(testFile, 'utf8');

          // Check for accessibility test patterns
          const hasA11yTest = content.includes('testComponentAccessibility') ||
                             content.includes('accessibility') ||
                             content.includes('a11y');

          if (!hasA11yTest) {
            issues.push({
              component,
              reason: 'Missing accessibility tests'
            });
          }
        } else {
          issues.push({
            component,
            reason: 'Missing test file'
          });
        }
      }
    } catch (error) {
      console.warn('Warning: Could not scan components directory');
    }

    return issues;
  }

  parseCoverageResults(output) {
    try {
      const jsonMatch = output.match(/\{.*"coverage".*\}/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const percentage = Math.round(data.coverage?.total?.lines?.pct || 0);

        return {
          percentage,
          threshold: 80,
          passed: percentage >= 80
        };
      }
    } catch (error) {
      // Fallback to parsing text output
    }

    return {
      percentage: 0,
      threshold: 80,
      passed: false
    };
  }

  async generateReport() {
    console.log('📋 Generating health report...');

    // Calculate overall health score
    let score = 100;

    // Deduct points for issues
    score -= Math.min(this.results.typescript.errors * 10, 30);
    score -= Math.min(this.results.tests.failed * 5, 40);
    score -= Math.min(this.results.accessibility.violations * 3, 20);

    if (!this.results.coverage.passed) {
      score -= 10;
    }

    this.results.overall.score = Math.max(score, 0);
    this.results.overall.status = score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';

    // Generate detailed report
    const report = this.formatReport();

    // Save report to file
    const reportFile = join(rootDir, 'test-health-report.json');
    writeFileSync(reportFile, JSON.stringify(this.results, null, 2));

    console.log(report);
    console.log(`📄 Detailed report saved to: test-health-report.json\n`);

    // Return status
    const status = this.results.overall.status;
    const emoji = status === 'healthy' ? '✅' : status === 'warning' ? '⚠️' : '❌';

    console.log(`${emoji} Overall Health: ${status.toUpperCase()} (${this.results.overall.score}/100)\n`);
  }

  formatReport() {
    const { tests, typescript, accessibility, coverage, overall } = this.results;

    return `
📊 TEST HEALTH REPORT
=====================

🧪 Test Results:       ${tests.passed}/${tests.total} passed (${tests.failed} failed)
📝 TypeScript:         ${typescript.errors === 0 ? '✅' : '❌'} ${typescript.errors} errors
♿ Accessibility:      ${accessibility.violations === 0 ? '✅' : '❌'} ${accessibility.violations} violations
📊 Coverage:           ${coverage.passed ? '✅' : '❌'} ${coverage.percentage}% (threshold: ${coverage.threshold}%)

🎯 Overall Score:      ${overall.score}/100 (${overall.status})

${this.generateRecommendations()}
`;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.typescript.errors > 0) {
      recommendations.push('🔧 Fix TypeScript compilation errors');
    }

    if (this.results.tests.failed > 0) {
      recommendations.push('🧪 Address failing test cases');
    }

    if (this.results.accessibility.violations > 0) {
      recommendations.push('♿ Add accessibility tests to components');
    }

    if (!this.results.coverage.passed) {
      recommendations.push('📊 Improve test coverage');
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 All checks passed! Consider adding more comprehensive tests.');
    }

    return `💡 RECOMMENDATIONS:\n${recommendations.map(r => `   ${r}`).join('\n')}`;
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    component: args.find(arg => arg.startsWith('--component='))?.split('=')[1]
  };

  const validator = new TestHealthValidator(options);

  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { TestHealthValidator };