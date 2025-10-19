#!/usr/bin/env node
/**
 * Unified Test Orchestrator
 *
 * Consolidates 50+ test scripts into a single flag-based orchestration system.
 * Replaces: test:unit, test:browser, test:e2e, test:component, test:all variants
 *
 * Usage:
 *   npm run test:orchestrator -- --unit              # Run unit tests
 *   npm run test:orchestrator -- --browser           # Run browser tests
 *   npm run test:orchestrator -- --e2e               # Run E2E tests
 *   npm run test:orchestrator -- --component=modal   # Test specific component
 *   npm run test:orchestrator -- --all               # Run all tests
 *   npm run test:orchestrator -- --watch             # Watch mode
 *   npm run test:orchestrator -- --coverage          # With coverage
 *
 * Advanced:
 *   npm run test:orchestrator -- --flaky             # Flaky test detection
 *   npm run test:orchestrator -- --smoke             # Production smoke tests
 *   npm run test:orchestrator -- --contracts         # Contract testing
 *   npm run test:orchestrator -- --performance       # Performance regression
 *   npm run test:orchestrator -- --mutation          # Mutation testing
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  unit: args.includes('--unit'),
  browser: args.includes('--browser'),
  e2e: args.includes('--e2e'),
  all: args.includes('--all'),
  watch: args.includes('--watch'),
  coverage: args.includes('--coverage'),
  flaky: args.includes('--flaky'),
  smoke: args.includes('--smoke'),
  contracts: args.includes('--contracts'),
  performance: args.includes('--performance'),
  mutation: args.includes('--mutation'),
  component: args.find(arg => arg.startsWith('--component='))?.split('=')[1],
  verbose: args.includes('--verbose'),
};

// Color utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

// Run command with output streaming
async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    log(`▶ Running: ${command} ${args.join(' ')}`, 'blue');

    const proc = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        log(`✅ Success: ${command}`, 'green');
        resolve(code);
      } else {
        log(`❌ Failed: ${command} (exit code: ${code})`, 'red');
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', (error) => {
      log(`❌ Error: ${error.message}`, 'red');
      reject(error);
    });
  });
}

// Test execution functions
async function runUnitTests() {
  section('Running Unit Tests (Vitest)');

  const vitestArgs = ['run'];

  if (flags.watch) vitestArgs.push('--watch');
  if (flags.coverage) vitestArgs.push('--coverage');
  if (flags.component) {
    vitestArgs.push(`src/components/${flags.component}/usa-${flags.component}.test.ts`);
  }

  await runCommand('npx', ['vitest', ...vitestArgs]);
}

async function runBrowserTests() {
  section('Running Browser-Required Tests (Playwright)');

  const playwrightArgs = ['test', 'tests/browser-required'];

  if (flags.component) {
    playwrightArgs.push(`tests/browser-required/${flags.component}.test.ts`);
  }

  await runCommand('npx', ['playwright', ...playwrightArgs]);
}

async function runE2ETests() {
  section('Running E2E Tests (Cypress)');

  const cypressArgs = ['run'];

  if (flags.component) {
    cypressArgs.push('--spec', `cypress/e2e/${flags.component}.e2e.cy.ts`);
  }

  await runCommand('npx', ['cypress', ...cypressArgs]);
}

async function runFlakyDetection() {
  section('Running Flaky Test Detection');

  const flakyArgs = [join(rootDir, 'scripts/test/flaky-test-detector.js')];

  if (flags.verbose) flakyArgs.push('--verbose');
  if (flags.component) flakyArgs.push(`--component=${flags.component}`);

  await runCommand('node', flakyArgs);
}

async function runSmokeTests() {
  section('Running Production Smoke Tests');

  const smokeArgs = [join(rootDir, 'scripts/test/production-smoke-tests.js')];

  if (flags.verbose) smokeArgs.push('--verbose');

  await runCommand('node', smokeArgs);
}

async function runContractTests() {
  section('Running Contract Testing');

  const contractArgs = [join(rootDir, 'scripts/test/contract-testing.js')];

  if (flags.verbose) contractArgs.push('--verbose');
  if (flags.component) contractArgs.push(`--component=${flags.component}`);

  await runCommand('node', contractArgs);
}

async function runPerformanceTests() {
  section('Running Performance Regression Tests');

  const perfArgs = [join(rootDir, 'scripts/test/performance-regression-tracker.js')];

  if (flags.verbose) perfArgs.push('--verbose');

  await runCommand('node', perfArgs);
}

async function runMutationTests() {
  section('Running Mutation Testing (Stryker)');

  await runCommand('npx', ['stryker', 'run']);
}

// Main orchestration
async function main() {
  const startTime = Date.now();

  try {
    log('🚀 USWDS Web Components Test Orchestrator', 'bright');
    log('==========================================\n', 'bright');

    // Determine which tests to run
    const testsToRun = [];

    if (flags.all) {
      testsToRun.push(
        runUnitTests,
        runBrowserTests,
        runE2ETests,
      );
    } else {
      if (flags.unit) testsToRun.push(runUnitTests);
      if (flags.browser) testsToRun.push(runBrowserTests);
      if (flags.e2e) testsToRun.push(runE2ETests);
      if (flags.flaky) testsToRun.push(runFlakyDetection);
      if (flags.smoke) testsToRun.push(runSmokeTests);
      if (flags.contracts) testsToRun.push(runContractTests);
      if (flags.performance) testsToRun.push(runPerformanceTests);
      if (flags.mutation) testsToRun.push(runMutationTests);
    }

    // Default to unit tests if no flags specified
    if (testsToRun.length === 0) {
      testsToRun.push(runUnitTests);
    }

    // Run tests sequentially
    for (const testFn of testsToRun) {
      await testFn();
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    section('Test Summary');
    log(`✅ All tests completed successfully!`, 'green');
    log(`⏱  Total time: ${duration}s`, 'blue');

    process.exit(0);

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    section('Test Summary');
    log(`❌ Tests failed!`, 'red');
    log(`⏱  Total time: ${duration}s`, 'blue');
    log(`\nError: ${error.message}`, 'red');

    process.exit(1);
  }
}

main();
