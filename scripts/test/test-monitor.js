#!/usr/bin/env node

/**
 * Test Monitor - Maintains 100% Test Pass Rate
 *
 * This script monitors test health across all components and provides
 * detailed reporting to prevent regressions.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CRITICAL_COMPONENTS = [
  'date-picker',
  'list',
  'date-range-picker',
  'text-input',
  'table',
  'memorable-date',
  'icon',
];

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
};

class TestMonitor {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      components: {},
    };
  }

  log(message, color = COLORS.RESET) {
    console.log(`${color}${message}${COLORS.RESET}`);
  }

  async runComponentTests() {
    this.log('\n🔍 USWDS Web Components - Test Monitor', COLORS.BOLD + COLORS.BLUE);
    this.log('='.repeat(60), COLORS.BLUE);

    for (const component of CRITICAL_COMPONENTS) {
      await this.testComponent(component);
    }

    this.generateReport();
  }

  async testComponent(component) {
    const testFile = `src/components/${component}/usa-${component}.test.ts`;

    if (!fs.existsSync(testFile)) {
      this.log(`❌ ${component}: Test file not found`, COLORS.RED);
      this.results.components[component] = { status: 'missing', tests: 0, passed: 0 };
      return;
    }

    try {
      this.log(`🧪 Testing ${component}...`, COLORS.YELLOW);

      // Run test and capture output
      const output = execSync(`npm test "${testFile}" --run`, {
        encoding: 'utf8',
        timeout: 30000,
      });

      // Parse the regular output format from vitest
      // Look for lines like: "Tests  40 passed (40)" or "✓ file.test.ts (40 tests)"
      const lines = output.split('\n');
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;

      // Look for test summary lines
      for (const line of lines) {
        // Format: "Tests  40 passed (40)" or "Tests  35 passed | 5 failed (40)"
        const summaryMatch = line.match(
          /Tests\s+(\d+)\s+passed(?:\s+\|\s+(\d+)\s+failed)?\s+\((\d+)\)/
        );
        if (summaryMatch) {
          passedTests = parseInt(summaryMatch[1]);
          failedTests = summaryMatch[2] ? parseInt(summaryMatch[2]) : 0;
          totalTests = parseInt(summaryMatch[3]);
          break;
        }

        // Alternative format: "✓ file.test.ts (40 tests)"
        const fileMatch = line.match(/✓.*\((\d+) tests?\)/);
        if (fileMatch) {
          totalTests = parseInt(fileMatch[1]);
          passedTests = totalTests; // If ✓, all passed
          failedTests = 0;
          break;
        }
      }

      // If we found test counts, use them
      if (totalTests > 0) {
        this.results.components[component] = {
          status: failedTests === 0 ? 'passed' : 'failed',
          tests: totalTests,
          passed: passedTests,
          failed: failedTests,
        };

        this.results.total += totalTests;
        this.results.passed += passedTests;
        this.results.failed += failedTests;

        if (failedTests === 0) {
          this.log(`✅ ${component}: ${totalTests}/${totalTests} tests passed`, COLORS.GREEN);
        } else {
          this.log(
            `❌ ${component}: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`,
            COLORS.RED
          );
        }
      } else {
        // Fallback: assume success if we can't parse but no error occurred
        this.log(`✅ ${component}: Tests passed (parsing failed)`, COLORS.GREEN);
        this.results.components[component] = {
          status: 'passed',
          tests: 'unknown',
          passed: 'unknown',
        };
      }
    } catch (error) {
      // If execSync throws, tests failed
      const errorOutput = error.stdout || error.message;
      let failedTests = 0;
      let totalTests = 0;

      // Try to parse failure information from error output
      const lines = errorOutput.split('\n');
      for (const line of lines) {
        const summaryMatch = line.match(/Tests\s+(\d+)\s+passed\s+\|\s+(\d+)\s+failed\s+\((\d+)\)/);
        if (summaryMatch) {
          const passed = parseInt(summaryMatch[1]);
          failedTests = parseInt(summaryMatch[2]);
          totalTests = parseInt(summaryMatch[3]);

          this.results.components[component] = {
            status: 'failed',
            tests: totalTests,
            passed: passed,
            failed: failedTests,
          };

          this.results.total += totalTests;
          this.results.passed += passed;
          this.results.failed += failedTests;

          this.log(
            `❌ ${component}: ${passed}/${totalTests} tests passed (${failedTests} failed)`,
            COLORS.RED
          );
          return;
        }
      }

      // If we can't parse, just mark as failed
      this.log(`❌ ${component}: Tests failed (${error.message})`, COLORS.RED);
      this.results.components[component] = {
        status: 'failed',
        tests: 0,
        passed: 0,
        error: error.message,
      };
      this.results.failed++;
    }
  }

  generateReport() {
    this.log('\n📊 TEST RESULTS SUMMARY', COLORS.BOLD + COLORS.BLUE);
    this.log('='.repeat(60), COLORS.BLUE);

    const passRate =
      this.results.total > 0 ? ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;

    if (this.results.failed === 0) {
      this.log(
        `🏆 PERFECT SCORE: ${this.results.passed}/${this.results.total} tests passing (${passRate}%)`,
        COLORS.GREEN + COLORS.BOLD
      );
    } else {
      this.log(
        `⚠️  FAILURES DETECTED: ${this.results.passed}/${this.results.total} tests passing (${passRate}%)`,
        COLORS.RED + COLORS.BOLD
      );
    }

    this.log('\n📋 Component Breakdown:', COLORS.BOLD);

    for (const [component, result] of Object.entries(this.results.components)) {
      const status = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
      const color = result.status === 'passed' ? COLORS.GREEN : COLORS.RED;

      if (typeof result.tests === 'number') {
        this.log(`  ${status} ${component}: ${result.passed}/${result.tests} tests`, color);
      } else {
        this.log(`  ${status} ${component}: ${result.status}`, color);
      }
    }

    // Write detailed report to file
    this.writeDetailedReport();

    // Exit with error code if any tests failed
    if (this.results.failed > 0) {
      this.log('\n💡 To fix failures, run individual component tests:', COLORS.YELLOW);
      for (const [component, result] of Object.entries(this.results.components)) {
        if (result.status === 'failed') {
          this.log(
            `   npm test src/components/${component}/usa-${component}.test.ts`,
            COLORS.YELLOW
          );
        }
      }

      this.log(
        '\n❌ Test monitoring detected failures. Please fix before committing.',
        COLORS.RED + COLORS.BOLD
      );
      process.exit(1);
    }

    this.log('\n✅ All tests passing! Component health is excellent.', COLORS.GREEN + COLORS.BOLD);
  }

  writeDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.total,
        passedTests: this.results.passed,
        failedTests: this.results.failed,
        passRate:
          this.results.total > 0
            ? ((this.results.passed / this.results.total) * 100).toFixed(1) + '%'
            : '0%',
      },
      components: this.results.components,
    };

    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Write detailed JSON report
    fs.writeFileSync(
      path.join(reportsDir, 'test-monitor-latest.json'),
      JSON.stringify(report, null, 2)
    );

    // Write human-readable report
    const humanReport = `# Test Monitor Report
Generated: ${report.timestamp}

## Summary
- Total Tests: ${report.summary.totalTests}
- Passed: ${report.summary.passedTests} 
- Failed: ${report.summary.failedTests}
- Pass Rate: ${report.summary.passRate}

## Component Results
${Object.entries(report.components)
  .map(
    ([component, result]) =>
      `- **${component}**: ${result.status} (${result.passed}/${result.tests} tests)`
  )
  .join('\n')}

${
  report.summary.failedTests === 0
    ? '🏆 **Perfect Score Achieved!** All components maintain 100% test pass rate.'
    : '⚠️ **Action Required:** Some tests are failing. Please fix before committing.'
}
`;

    fs.writeFileSync(path.join(reportsDir, 'test-monitor-latest.md'), humanReport);

    this.log(`\n📄 Detailed reports written to reports/test-monitor-latest.*`, COLORS.BLUE);
  }
}

// Run the monitor
const monitor = new TestMonitor();
monitor.runComponentTests().catch((error) => {
  console.error('❌ Test monitor failed:', error);
  process.exit(1);
});
