#!/usr/bin/env node

/**
 * Visual Regression Test Runner
 *
 * Runs Playwright visual regression tests for USWDS Web Components.
 * Coordinates Storybook server, test execution, and result reporting.
 *
 * Usage:
 *   node scripts/test/run-visual-regression.js [options]
 *
 * Options:
 *   --component=<name>  Run tests for specific component
 *   --update            Update visual baselines
 *   --ui                Run in UI mode
 *   --headed            Run in headed mode (show browser)
 *   --debug             Run in debug mode
 *   --browser=<name>    Run in specific browser (chromium, firefox, webkit)
 *   --report            Generate HTML report
 *
 * Examples:
 *   pnpm run test:visual              # Run all visual tests
 *   pnpm run test:visual:baseline     # Update baselines
 *   node scripts/test/run-visual-regression.js --component=icon
 *   node scripts/test/run-visual-regression.js --ui
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  component: null,
  update: false,
  ui: false,
  headed: false,
  debug: false,
  browser: null,
  report: false,
};

// Parse arguments
args.forEach((arg) => {
  if (arg.startsWith('--component=')) {
    options.component = arg.split('=')[1];
  } else if (arg === '--update') {
    options.update = true;
  } else if (arg === '--ui') {
    options.ui = true;
  } else if (arg === '--headed') {
    options.headed = true;
  } else if (arg === '--debug') {
    options.debug = true;
  } else if (arg.startsWith('--browser=')) {
    options.browser = arg.split('=')[1];
  } else if (arg === '--report') {
    options.report = true;
  }
});

// Build Playwright command
const playwrightArgs = ['test'];

// Test path
if (options.component) {
  playwrightArgs.push(`tests/visual/components/${options.component}-visual.spec.ts`);
} else {
  playwrightArgs.push('tests/visual/');
}

// Config
playwrightArgs.push('--config', 'visual.config.ts');

// Options
if (options.update) {
  playwrightArgs.push('--update-snapshots');
}
if (options.ui) {
  playwrightArgs.push('--ui');
}
if (options.headed) {
  playwrightArgs.push('--headed');
}
if (options.debug) {
  playwrightArgs.push('--debug');
}
if (options.browser) {
  playwrightArgs.push('--project', options.browser);
}
if (options.report) {
  playwrightArgs.push('--reporter=html');
}

console.log('\n🎭 Visual Regression Test Runner\n');
console.log('Configuration:');
console.log(`  Component: ${options.component || 'all'}`);
console.log(`  Update baselines: ${options.update ? 'yes' : 'no'}`);
console.log(`  Mode: ${options.ui ? 'UI' : options.debug ? 'debug' : options.headed ? 'headed' : 'headless'}`);
console.log(`  Browser: ${options.browser || 'all'}`);
console.log(`  Report: ${options.report ? 'yes' : 'no'}`);
console.log('');

// Check if Storybook is running
const checkStorybook = () => {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.get('http://localhost:6006', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

// Run tests
const runTests = async () => {
  console.log('🔍 Checking if Storybook is running...');

  const storybookRunning = await checkStorybook();

  if (!storybookRunning) {
    console.log('⚠️  Storybook is not running on localhost:6006');
    console.log('📝 Start Storybook first with: pnpm run storybook');
    console.log('');
    process.exit(1);
  }

  console.log('✅ Storybook is running');
  console.log('');
  console.log('🎭 Running Playwright visual tests...');
  console.log(`Command: npx playwright ${playwrightArgs.join(' ')}`);
  console.log('');

  const playwright = spawn('npx', ['playwright', ...playwrightArgs], {
    stdio: 'inherit',
    shell: true,
  });

  playwright.on('close', (code) => {
    console.log('');
    if (code === 0) {
      console.log('✅ Visual regression tests passed!');
      if (options.update) {
        console.log('📸 Visual baselines updated');
      }
      if (options.report) {
        console.log('📊 HTML report generated: playwright-report/index.html');
        console.log('   View with: npx playwright show-report');
      }
    } else {
      console.log('❌ Visual regression tests failed');
      console.log('');
      console.log('Next steps:');
      console.log('  1. Review failures in test output');
      console.log('  2. Check visual diffs: npx playwright show-report');
      console.log('  3. Update baselines if changes are intentional:');
      console.log('     pnpm run test:visual:baseline');
    }
    console.log('');
    process.exit(code);
  });
};

runTests().catch((error) => {
  console.error('❌ Error running visual tests:', error);
  process.exit(1);
});
