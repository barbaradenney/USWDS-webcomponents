#!/usr/bin/env node

/**
 * Cross-Browser USWDS Component Transformation Validation
 *
 * Tests component transformations across Chrome, Firefox, Safari, and Edge
 * to ensure consistent behavior across browser environments.
 */

import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class CrossBrowserValidator {
  constructor() {
    this.results = {
      chrome: { passed: 0, failed: 0, errors: [] },
      firefox: { passed: 0, failed: 0, errors: [] },
      edge: { passed: 0, failed: 0, errors: [] },
      safari: { passed: 0, failed: 0, errors: [] }
    };
    this.supportedBrowsers = this.detectAvailableBrowsers();
  }

  detectAvailableBrowsers() {
    const browsers = [];

    // Chrome (via Puppeteer)
    browsers.push('chrome');

    // Firefox (check if available)
    try {
      execSync('which firefox', { stdio: 'ignore' });
      browsers.push('firefox');
    } catch (e) {
      console.log('ℹ️ Firefox not available for testing');
    }

    // Edge (check if available)
    try {
      execSync('which microsoft-edge', { stdio: 'ignore' });
      browsers.push('edge');
    } catch (e) {
      try {
        execSync('which msedge', { stdio: 'ignore' });
        browsers.push('edge');
      } catch (e2) {
        console.log('ℹ️ Edge not available for testing');
      }
    }

    // Safari (macOS only)
    if (process.platform === 'darwin') {
      try {
        execSync('which /Applications/Safari.app/Contents/MacOS/Safari', { stdio: 'ignore' });
        browsers.push('safari');
      } catch (e) {
        console.log('ℹ️ Safari not available for testing');
      }
    }

    return browsers;
  }

  async launchBrowser(browserName) {
    const options = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1200, height: 800 }
    };

    switch (browserName) {
      case 'chrome':
        return await puppeteer.launch(options);

      case 'firefox':
        return await puppeteer.launch({
          ...options,
          product: 'firefox',
          executablePath: '/usr/bin/firefox'
        });

      case 'edge':
        return await puppeteer.launch({
          ...options,
          executablePath: process.platform === 'win32'
            ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
            : '/usr/bin/microsoft-edge'
        });

      case 'safari':
        // Safari requires different approach - using WebKit via Playwright
        console.log('⚠️ Safari testing requires WebKit - skipping for now');
        return null;

      default:
        throw new Error(`Unsupported browser: ${browserName}`);
    }
  }

  async testComponentInBrowser(browserName, componentName, testConfig) {
    console.log(`🧪 Testing ${componentName} in ${browserName}...`);

    let browser = null;
    let page = null;

    try {
      browser = await this.launchBrowser(browserName);
      if (!browser) {
        console.log(`  ⚠️ ${browserName} not available, skipping`);
        return { skipped: true };
      }

      page = await browser.newPage();

      // Set up error logging
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      // Load test page - check if dev server is available
      const devServerUrl = 'http://localhost:5173';
      let useDevServer = false;

      try {
        const response = await page.goto(devServerUrl, { timeout: 2000 });
        useDevServer = response && response.ok();
      } catch (error) {
        console.log(`  ℹ️ Dev server not available, using inline test page`);
      }

      if (useDevServer) {
        // Use dev server with proper module loading
        await page.goto(`${devServerUrl}/debug-${componentName}.html`, {
          waitUntil: 'networkidle0',
          timeout: 10000
        }).catch(() => {
          // Fallback to inline content if debug page doesn't exist
          return page.setContent(testConfig.html);
        });
      } else {
        // Use inline content for environments without dev server
        await page.setContent(testConfig.html);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Wait for transformation
      if (testConfig.waitForSelector) {
        await page.waitForSelector(testConfig.waitForSelector, { timeout: 5000 })
          .catch(() => null);
      }

      // Run component-specific validation
      const validationResult = await page.evaluate(testConfig.validation);

      // Check for transformation success
      if (validationResult.success) {
        console.log(`  ✅ ${browserName}: ${componentName} transformation successful`);
        this.results[browserName].passed++;

        // Additional checks
        if (validationResult.details) {
          console.log(`    📋 ${JSON.stringify(validationResult.details)}`);
        }
      } else {
        console.log(`  ❌ ${browserName}: ${componentName} transformation failed`);
        console.log(`    💭 ${validationResult.reason}`);
        this.results[browserName].failed++;
        this.results[browserName].errors.push(`${componentName}: ${validationResult.reason}`);
      }

      // Check for JavaScript errors
      if (errors.length > 0) {
        console.log(`  ⚠️ ${browserName}: JavaScript errors detected:`);
        errors.forEach(error => console.log(`    - ${error}`));
        this.results[browserName].errors.push(`${componentName}: JavaScript errors - ${errors.join(', ')}`);
      }

      return { success: validationResult.success, errors };

    } catch (error) {
      console.log(`  ❌ ${browserName}: Test failed - ${error.message}`);
      this.results[browserName].failed++;
      this.results[browserName].errors.push(`${componentName}: Test execution failed - ${error.message}`);
      return { success: false, error: error.message };

    } finally {
      if (page) await page.close();
      if (browser) await browser.close();
    }
  }

  async runCrossBrowserTests() {
    console.log('🌐 Starting Cross-Browser Validation...\n');
    console.log(`📋 Available browsers: ${this.supportedBrowsers.join(', ')}\n`);

    const testConfigs = {
      'combo-box': {
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <base href="http://localhost:5173/">
            <script type="module">import './src/components/combo-box/index.ts';</script>
          </head>
          <body>
            <usa-combo-box label="Test Combo" name="test"></usa-combo-box>
            <script>
              const combo = document.querySelector('usa-combo-box');
              combo.options = [
                { value: 'apple', label: 'Apple' },
                { value: 'banana', label: 'Banana' }
              ];
            </script>
          </body>
          </html>
        `,
        waitForSelector: '.usa-combo-box__input',
        validation: () => {
          const combo = document.querySelector('usa-combo-box');
          const container = combo?.querySelector('.usa-combo-box');
          const input = container?.querySelector('.usa-combo-box__input');
          const toggle = container?.querySelector('.usa-combo-box__toggle-list');
          const select = container?.querySelector('select');

          const success = !!(input && toggle && select);
          return {
            success,
            reason: success ? 'All elements present' : 'Missing transformed elements',
            details: {
              hasInput: !!input,
              hasToggle: !!toggle,
              hasSelect: !!select,
              selectHidden: select ? getComputedStyle(select).display === 'none' : false
            }
          };
        }
      },

      'time-picker': {
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <base href="http://localhost:5173/">
            <script type="module">import './src/components/time-picker/index.ts';</script>
          </head>
          <body>
            <usa-time-picker label="Test Time" name="test-time"></usa-time-picker>
          </body>
          </html>
        `,
        waitForSelector: '.usa-combo-box__input',
        validation: () => {
          const timePicker = document.querySelector('usa-time-picker');
          const container = timePicker?.querySelector('.usa-time-picker');
          const input = container?.querySelector('.usa-combo-box__input');
          const hasComboBoxClass = container?.classList.contains('usa-combo-box');

          const success = !!(input && hasComboBoxClass);
          return {
            success,
            reason: success ? 'Time picker transformed to combo-box' : 'Time picker transformation failed',
            details: {
              hasInput: !!input,
              hasComboBoxClass,
              containerClasses: container?.className
            }
          };
        }
      },

      'date-picker': {
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <base href="http://localhost:5173/">
            <script type="module">import './src/components/date-picker/index.ts';</script>
          </head>
          <body>
            <usa-date-picker label="Test Date" name="test-date"></usa-date-picker>
          </body>
          </html>
        `,
        waitForSelector: '.usa-date-picker__button',
        validation: () => {
          const datePicker = document.querySelector('usa-date-picker');
          const container = datePicker?.querySelector('.usa-date-picker');
          const input = container?.querySelector('input');
          const button = container?.querySelector('.usa-date-picker__button');

          const success = !!(input && button);
          return {
            success,
            reason: success ? 'Date picker enhanced with calendar button' : 'Date picker enhancement failed',
            details: {
              hasInput: !!input,
              hasButton: !!button,
              inputType: input?.type
            }
          };
        }
      }
    };

    // Test each component in each browser
    for (const [componentName, config] of Object.entries(testConfigs)) {
      console.log(`\n📦 Testing ${componentName} across browsers...`);

      for (const browserName of this.supportedBrowsers) {
        if (this.results[browserName]) {
          await this.testComponentInBrowser(browserName, componentName, config);
        }
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🌐 Cross-Browser Validation Report');
    console.log('='.repeat(60));

    let allPassed = true;
    let totalTests = 0;
    let totalPassed = 0;

    for (const [browser, results] of Object.entries(this.results)) {
      if (this.supportedBrowsers.includes(browser)) {
        const total = results.passed + results.failed;
        totalTests += total;
        totalPassed += results.passed;

        console.log(`\n🔍 ${browser.toUpperCase()}`);
        console.log(`   ✅ Passed: ${results.passed}`);
        console.log(`   ❌ Failed: ${results.failed}`);

        if (results.errors.length > 0) {
          console.log(`   🚨 Errors:`);
          results.errors.forEach(error => console.log(`     - ${error}`));
          allPassed = false;
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Total Passed: ${totalPassed}`);
    console.log(`   Success Rate: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`);

    if (allPassed && totalTests > 0) {
      console.log('\n🎉 All cross-browser tests passed!');
      return 0;
    } else if (totalTests === 0) {
      console.log('\n⚠️ No tests were executed');
      return 1;
    } else {
      console.log('\n💔 Some cross-browser tests failed!');
      return 1;
    }
  }

  async run() {
    try {
      await this.runCrossBrowserTests();
      return this.generateReport();
    } catch (error) {
      console.error('❌ Cross-browser validation failed:', error);
      return 1;
    }
  }
}

// Run cross-browser validation
async function runCrossBrowserValidation() {
  const validator = new CrossBrowserValidator();
  const exitCode = await validator.run();
  process.exit(exitCode);
}

// CLI handling
if (process.argv.includes('--help')) {
  console.log(`
Cross-Browser USWDS Component Validation

Usage:
  node scripts/cross-browser-validation.js

Tests component transformations across available browsers:
- Chrome (via Puppeteer)
- Firefox (if installed)
- Edge (if installed)
- Safari (macOS only, if available)

The script automatically detects available browsers and runs tests accordingly.
`);
  process.exit(0);
}

// Check if we're being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCrossBrowserValidation();
}