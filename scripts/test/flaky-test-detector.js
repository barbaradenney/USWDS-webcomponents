#!/usr/bin/env node

/**
 * Flaky Test Detector
 *
 * Automatically detects tests that pass/fail inconsistently by running
 * the test suite multiple times and tracking results.
 *
 * Features:
 * - Runs tests multiple times (default: 10)
 * - Tracks pass/fail patterns
 * - Identifies flaky tests (inconsistent results)
 * - Generates reports with statistics
 * - Quarantine flaky tests automatically
 *
 * Usage:
 *   npm run test:flaky-detection
 *   npm run test:flaky-detection -- --runs=20
 *   npm run test:flaky-detection -- --quarantine
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const FLAKY_TEST_REPORT = 'test-reports/flaky-tests.json';
const QUARANTINE_FILE = '__tests__/quarantine.json';

class FlakyTestDetector {
  constructor(options = {}) {
    this.runs = options.runs || 10;
    this.quarantine = options.quarantine || false;
    this.verbose = options.verbose || false;
    this.testPattern = options.pattern || '';
    this.results = new Map();
    this.flakyTests = [];
  }

  async detect() {
    console.log('🔍 Flaky Test Detection Starting...\n');
    console.log(`📊 Configuration:`);
    console.log(`   • Runs: ${this.runs}`);
    console.log(`   • Auto-quarantine: ${this.quarantine ? 'Yes' : 'No'}`);
    console.log(`   • Pattern: ${this.testPattern || 'All tests'}\n`);

    // Run tests multiple times
    for (let run = 1; run <= this.runs; run++) {
      console.log(`\n🏃 Run ${run}/${this.runs}...`);
      await this.runTests(run);
    }

    // Analyze results
    this.analyzeResults();

    // Generate report
    this.generateReport();

    // Quarantine if requested
    if (this.quarantine && this.flakyTests.length > 0) {
      this.quarantineFlakyTests();
    }

    // Summary
    this.printSummary();

    // Exit with error if flaky tests found
    if (this.flakyTests.length > 0) {
      process.exit(1);
    }
  }

  runTests(runNumber) {
    try {
      const command = `npm test ${this.testPattern} -- --reporter=json --outputFile=test-reports/run-${runNumber}.json`;

      if (this.verbose) {
        console.log(`   Command: ${command}`);
      }

      execSync(command, {
        stdio: this.verbose ? 'inherit' : 'pipe',
        encoding: 'utf-8'
      });

      console.log(`   ✅ All tests passed`);
      this.recordResults(runNumber, true);
    } catch (error) {
      console.log(`   ❌ Some tests failed`);
      this.recordResults(runNumber, false);
    }
  }

  recordResults(runNumber, allPassed) {
    try {
      const reportPath = `test-reports/run-${runNumber}.json`;

      if (!fs.existsSync(reportPath)) {
        console.warn(`   ⚠️  Report file not found: ${reportPath}`);
        return;
      }

      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

      // Parse test results
      this.parseTestResults(report, runNumber);
    } catch (error) {
      console.warn(`   ⚠️  Error reading results: ${error.message}`);
    }
  }

  parseTestResults(report, runNumber) {
    // Handle different report formats
    const tests = this.extractTests(report);

    tests.forEach(test => {
      const testId = `${test.file}::${test.name}`;

      if (!this.results.has(testId)) {
        this.results.set(testId, {
          name: test.name,
          file: test.file,
          runs: [],
          passCount: 0,
          failCount: 0
        });
      }

      const result = this.results.get(testId);
      const passed = test.status === 'passed';

      result.runs.push({
        run: runNumber,
        passed,
        duration: test.duration
      });

      if (passed) {
        result.passCount++;
      } else {
        result.failCount++;
      }
    });
  }

  extractTests(report) {
    const tests = [];

    // Handle vitest JSON format
    if (report.testResults) {
      report.testResults.forEach(file => {
        file.assertionResults?.forEach(test => {
          tests.push({
            file: file.name,
            name: test.title,
            status: test.status,
            duration: test.duration
          });
        });
      });
    }

    return tests;
  }

  analyzeResults() {
    console.log('\n\n📈 Analyzing Results...\n');

    for (const [testId, data] of this.results.entries()) {
      const passRate = (data.passCount / this.runs) * 100;
      const isFlaky = data.passCount > 0 && data.failCount > 0;

      if (isFlaky) {
        this.flakyTests.push({
          id: testId,
          name: data.name,
          file: data.file,
          passCount: data.passCount,
          failCount: data.failCount,
          passRate: passRate.toFixed(1),
          runs: data.runs
        });
      }
    }

    // Sort by flakiness (closer to 50% = more flaky)
    this.flakyTests.sort((a, b) => {
      const aDistance = Math.abs(50 - parseFloat(a.passRate));
      const bDistance = Math.abs(50 - parseFloat(b.passRate));
      return aDistance - bDistance;
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      runs: this.runs,
      totalTests: this.results.size,
      flakyTests: this.flakyTests.length,
      tests: this.flakyTests
    };

    // Ensure directory exists
    const dir = path.dirname(FLAKY_TEST_REPORT);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
      FLAKY_TEST_REPORT,
      JSON.stringify(report, null, 2)
    );

    console.log(`\n📄 Report saved: ${FLAKY_TEST_REPORT}`);
  }

  quarantineFlakyTests() {
    console.log('\n🚧 Quarantining flaky tests...\n');

    const quarantine = {
      timestamp: new Date().toISOString(),
      reason: 'Automatically quarantined by flaky test detector',
      tests: this.flakyTests.map(test => ({
        file: test.file,
        name: test.name,
        passRate: test.passRate
      }))
    };

    fs.writeFileSync(
      QUARANTINE_FILE,
      JSON.stringify(quarantine, null, 2)
    );

    console.log(`✅ Quarantine file created: ${QUARANTINE_FILE}`);
    console.log(`   ${this.flakyTests.length} test(s) quarantined`);
  }

  printSummary() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 FLAKY TEST DETECTION SUMMARY');
    console.log('='.repeat(60) + '\n');

    console.log(`Total test runs: ${this.runs}`);
    console.log(`Total unique tests: ${this.results.size}`);
    console.log(`Flaky tests found: ${this.flakyTests.length}\n`);

    if (this.flakyTests.length === 0) {
      console.log('✅ No flaky tests detected! All tests are stable.\n');
      return;
    }

    console.log('⚠️  FLAKY TESTS DETECTED:\n');

    this.flakyTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name}`);
      console.log(`   File: ${test.file}`);
      console.log(`   Pass Rate: ${test.passRate}% (${test.passCount}/${this.runs})`);
      console.log(`   Fail Rate: ${(100 - parseFloat(test.passRate)).toFixed(1)}% (${test.failCount}/${this.runs})`);

      // Show pattern
      const pattern = test.runs.map(r => r.passed ? '✓' : '✗').join('');
      console.log(`   Pattern: ${pattern}`);
      console.log('');
    });

    console.log('🔧 Recommendations:');
    console.log('   1. Review flaky tests for timing issues');
    console.log('   2. Check for race conditions');
    console.log('   3. Add proper waits/assertions');
    console.log('   4. Consider quarantining until fixed');
    console.log('');
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  runs: 10,
  quarantine: false,
  verbose: false,
  pattern: ''
};

args.forEach(arg => {
  if (arg.startsWith('--runs=')) {
    options.runs = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--quarantine') {
    options.quarantine = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg.startsWith('--pattern=')) {
    options.pattern = arg.split('=')[1];
  }
});

// Run detector
const detector = new FlakyTestDetector(options);
detector.detect().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
