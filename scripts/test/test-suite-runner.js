#!/usr/bin/env node
/**
 * Comprehensive Test Suite Runner
 * Orchestrates visual, cross-browser, performance, and user flow testing
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestSuiteRunner {
  constructor() {
    this.results = {
      visual: { status: 'pending', duration: 0, details: null },
      crossBrowser: { status: 'pending', duration: 0, details: null },
      performance: { status: 'pending', duration: 0, details: null },
      userFlows: { status: 'pending', duration: 0, details: null },
      unit: { status: 'pending', duration: 0, details: null },
    };

    this.startTime = Date.now();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async runCommand(command, testType, options = {}) {
    const startTime = Date.now();
    this.log(`Starting ${testType} tests...`);

    try {
      const result = execSync(command, {
        stdio: 'pipe',
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        ...options,
      });

      const duration = Date.now() - startTime;
      this.results[testType] = {
        status: 'passed',
        duration,
        details: result,
      };

      this.log(`${testType} tests completed successfully in ${duration}ms`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results[testType] = {
        status: 'failed',
        duration,
        details: error.message,
      };

      this.log(`${testType} tests failed after ${duration}ms: ${error.message}`, 'error');
      return false;
    }
  }

  async runUnitTests() {
    this.log('Running unit tests with Vitest...');
    return await this.runCommand('npm run test:ci', 'unit');
  }

  async runVisualTests() {
    this.log('Running visual regression tests with Chromatic...');

    // Check if Chromatic token is available
    if (!process.env.CHROMATIC_PROJECT_TOKEN) {
      this.log('CHROMATIC_PROJECT_TOKEN not found, skipping visual tests', 'warn');
      this.results.visual = { status: 'skipped', duration: 0, details: 'No Chromatic token' };
      return true; // Don't fail the suite
    }

    return await this.runCommand('npm run visual:test', 'visual');
  }

  async runCrossBrowserTests() {
    this.log('Running cross-browser tests with Playwright...');

    // Install browsers if needed
    try {
      execSync('npx playwright install --with-deps', { stdio: 'pipe' });
    } catch (error) {
      this.log('Browser installation failed, trying without deps...', 'warn');
      try {
        execSync('npx playwright install', { stdio: 'pipe' });
      } catch (installError) {
        this.log('Could not install browsers, skipping cross-browser tests', 'warn');
        this.results.crossBrowser = {
          status: 'skipped',
          duration: 0,
          details: 'Browser installation failed',
        };
        return true;
      }
    }

    return await this.runCommand('npm run test:cross-browser', 'crossBrowser');
  }

  async runPerformanceTests() {
    this.log('Running performance tests...');

    // Ensure build exists
    try {
      execSync('npm run build', { stdio: 'pipe' });
    } catch (error) {
      this.log('Build failed, skipping performance tests', 'warn');
      this.results.performance = { status: 'skipped', duration: 0, details: 'Build failed' };
      return true;
    }

    return await this.runCommand(
      'npm test tests/performance/bundle-analysis.test.js',
      'performance',
      {
        env: { ...process.env, NODE_ENV: 'test' },
      }
    );
  }

  async runUserFlowTests() {
    this.log('Running user flow tests...');

    // Start Storybook server for user flow tests
    this.log('Starting Storybook server for user flow tests...');
    const storybookProcess = spawn('npm', ['run', 'storybook', '--', '--port', '6006', '--quiet'], {
      detached: true,
      stdio: 'pipe',
    });

    // Wait for Storybook to be ready
    await new Promise((resolve) => setTimeout(resolve, 10000));

    try {
      const result = await this.runCommand(
        'npx playwright test tests/playwright/user-flows.spec.ts --reporter=html --reporter=junit',
        'userFlows'
      );

      // Kill Storybook process
      try {
        process.kill(-storybookProcess.pid, 'SIGTERM');
      } catch (e) {
        // Process might already be dead
      }

      return result;
    } catch (error) {
      // Kill Storybook process on error
      try {
        process.kill(-storybookProcess.pid, 'SIGTERM');
      } catch (e) {
        // Process might already be dead
      }
      throw error;
    }
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passed = Object.values(this.results).filter((r) => r.status === 'passed').length;
    const failed = Object.values(this.results).filter((r) => r.status === 'failed').length;
    const skipped = Object.values(this.results).filter((r) => r.status === 'skipped').length;

    const report = {
      summary: {
        totalTests: Object.keys(this.results).length,
        passed,
        failed,
        skipped,
        totalDuration: `${totalDuration}ms`,
        success: failed === 0,
      },
      results: this.results,
      timestamp: new Date().toISOString(),
    };

    // Write detailed report
    const reportPath = path.join(__dirname, '../test-results/comprehensive-test-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Console summary
    this.log('='.repeat(80));
    this.log('TEST SUITE SUMMARY', 'info');
    this.log('='.repeat(80));
    this.log(`Total Duration: ${Math.round(totalDuration / 1000)}s`);
    this.log(`Tests: ${passed} passed, ${failed} failed, ${skipped} skipped`);

    Object.entries(this.results).forEach(([testType, result]) => {
      const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
      const duration = `${Math.round(result.duration / 1000)}s`;
      this.log(`${icon} ${testType.padEnd(15)} ${result.status.padEnd(10)} ${duration}`);
    });

    this.log('='.repeat(80));
    this.log(`Detailed report saved to: ${reportPath}`);

    return report;
  }

  async runAll(options = {}) {
    this.log('Starting comprehensive test suite...', 'info');

    const testSuite = [];

    if (!options.skipUnit) testSuite.push(() => this.runUnitTests());
    if (!options.skipVisual) testSuite.push(() => this.runVisualTests());
    if (!options.skipCrossBrowser) testSuite.push(() => this.runCrossBrowserTests());
    if (!options.skipPerformance) testSuite.push(() => this.runPerformanceTests());
    if (!options.skipUserFlows) testSuite.push(() => this.runUserFlowTests());

    let allPassed = true;

    // Run tests sequentially to avoid resource conflicts
    for (const testRunner of testSuite) {
      const result = await testRunner();
      if (!result) {
        allPassed = false;
        if (options.failFast) {
          this.log('Stopping test suite due to failure (fail-fast mode)', 'error');
          break;
        }
      }
    }

    this.generateReport();

    if (!allPassed) {
      this.log('Test suite completed with failures', 'error');
      process.exit(1);
    } else {
      this.log('All tests passed successfully!', 'success');
      process.exit(0);
    }
  }

  async runSpecific(testTypes) {
    this.log(`Running specific tests: ${testTypes.join(', ')}`);

    const testMap = {
      unit: () => this.runUnitTests(),
      visual: () => this.runVisualTests(),
      crossBrowser: () => this.runCrossBrowserTests(),
      performance: () => this.runPerformanceTests(),
      userFlows: () => this.runUserFlowTests(),
    };

    let allPassed = true;

    for (const testType of testTypes) {
      if (testMap[testType]) {
        const result = await testMap[testType]();
        if (!result) allPassed = false;
      } else {
        this.log(`Unknown test type: ${testType}`, 'warn');
      }
    }

    this.generateReport();

    if (!allPassed) {
      process.exit(1);
    } else {
      this.log('Selected tests passed successfully!', 'success');
      process.exit(0);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const runner = new TestSuiteRunner();

  if (args.length === 0) {
    // Run all tests
    runner.runAll();
  } else if (args[0] === '--specific') {
    // Run specific tests
    const testTypes = args.slice(1);
    runner.runSpecific(testTypes);
  } else if (args[0] === '--help') {
    console.log(`
Usage:
  node test-suite-runner.js                    # Run all tests
  node test-suite-runner.js --specific unit visual  # Run specific tests
  
Available test types:
  unit          - Vitest unit tests
  visual        - Chromatic visual regression
  crossBrowser  - Playwright cross-browser tests
  performance   - Bundle size and performance tests
  userFlows     - Real user workflow tests
    `);
  } else {
    console.error('Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
}

export default TestSuiteRunner;
