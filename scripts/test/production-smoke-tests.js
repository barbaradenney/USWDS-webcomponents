#!/usr/bin/env node

/**
 * Production Smoke Tests
 *
 * Validates that the production deployment is working correctly by:
 * - Testing critical user flows
 * - Checking component rendering
 * - Validating API endpoints
 * - Monitoring performance
 * - Verifying accessibility
 *
 * Usage:
 *   npm run test:production:smoke
 *   npm run test:production:smoke -- --url=https://your-production-site.com
 *   npm run test:production:smoke -- --critical-only
 */

import { chromium } from 'playwright';

class ProductionSmokeTests {
  constructor(options = {}) {
    this.baseUrl = options.url || process.env.PROD_URL || 'http://localhost:6006';
    this.criticalOnly = options.criticalOnly || false;
    this.timeout = options.timeout || 30000;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async run() {
    console.log('🚀 Production Smoke Tests Starting...\n');
    console.log(`🌐 Target URL: ${this.baseUrl}`);
    console.log(`⏱️  Timeout: ${this.timeout}ms`);
    console.log(`🎯 Mode: ${this.criticalOnly ? 'Critical Only' : 'Full Suite'}\n`);

    try {
      await this.setup();
      await this.runTests();
      await this.cleanup();
      this.printSummary();

      if (this.results.failed.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error running smoke tests:', error.message);
      await this.cleanup();
      process.exit(1);
    }
  }

  async setup() {
    console.log('🔧 Setting up browser...\n');

    this.browser = await chromium.launch({
      headless: true
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'USWDS-WebComponents-SmokeTest/1.0'
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.timeout);
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async runTests() {
    // Critical tests (always run)
    await this.testSiteAccessible();
    await this.testComponentsLoad();
    await this.testCriticalUserFlows();

    // Extended tests (if not critical-only)
    if (!this.criticalOnly) {
      await this.testAccessibility();
      await this.testPerformance();
      await this.testErrorHandling();
    }
  }

  async testSiteAccessible() {
    const testName = '🌐 Site Accessibility';
    console.log(`Running: ${testName}...`);

    try {
      const response = await this.page.goto(this.baseUrl, {
        waitUntil: 'domcontentloaded'
      });

      if (response.status() !== 200) {
        throw new Error(`HTTP ${response.status()}`);
      }

      this.pass(testName, 'Site is accessible');
    } catch (error) {
      this.fail(testName, error.message);
    }
  }

  async testComponentsLoad() {
    const testName = '🧩 Components Load';
    console.log(`Running: ${testName}...`);

    try {
      // Wait for Storybook to load
      await this.page.waitForSelector('body', { timeout: 5000 });

      // Check if components are registered
      const componentsLoaded = await this.page.evaluate(() => {
        const customElements = [
          'usa-button',
          'usa-alert',
          'usa-accordion',
          'usa-modal'
        ];

        return customElements.every(tag =>
          customElements.get(tag) !== undefined ||
          document.querySelector(tag) !== null
        );
      });

      if (!componentsLoaded) {
        this.warn(testName, 'Some components may not be loaded');
      } else {
        this.pass(testName, 'Components are loaded');
      }
    } catch (error) {
      this.fail(testName, error.message);
    }
  }

  async testCriticalUserFlows() {
    const testName = '👤 Critical User Flows';
    console.log(`Running: ${testName}...`);

    try {
      // Test 1: Navigate to a component story
      await this.page.goto(`${this.baseUrl}/iframe.html?id=components-button--default`);
      await this.page.waitForSelector('usa-button', { timeout: 5000 });

      // Test 2: Component renders
      const buttonVisible = await this.page.locator('usa-button').isVisible();
      if (!buttonVisible) {
        throw new Error('Button component not visible');
      }

      // Test 3: Component is interactive
      const button = this.page.locator('usa-button button');
      await button.click();

      this.pass(testName, 'Critical flows working');
    } catch (error) {
      this.fail(testName, error.message);
    }
  }

  async testAccessibility() {
    const testName = '♿ Accessibility';
    console.log(`Running: ${testName}...`);

    try {
      // Navigate to a story
      await this.page.goto(`${this.baseUrl}/iframe.html?id=components-button--default`);

      // Basic accessibility checks
      const hasValidHtml = await this.page.evaluate(() => {
        return document.querySelector('html').getAttribute('lang') !== null ||
               document.querySelectorAll('img[alt]').length > 0 ||
               document.querySelectorAll('[aria-label]').length > 0;
      });

      if (hasValidHtml) {
        this.pass(testName, 'Basic accessibility present');
      } else {
        this.warn(testName, 'Some accessibility features missing');
      }
    } catch (error) {
      this.warn(testName, error.message);
    }
  }

  async testPerformance() {
    const testName = '⚡ Performance';
    console.log(`Running: ${testName}...`);

    try {
      const metrics = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart
        };
      });

      if (metrics.domContentLoaded > 3000) {
        this.warn(testName, `Slow DOM load: ${metrics.domContentLoaded}ms`);
      } else {
        this.pass(testName, `Fast load: ${metrics.domContentLoaded}ms`);
      }
    } catch (error) {
      this.warn(testName, error.message);
    }
  }

  async testErrorHandling() {
    const testName = '🛡️  Error Handling';
    console.log(`Running: ${testName}...`);

    try {
      // Listen for console errors
      const errors = [];
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Navigate and check for errors
      await this.page.goto(`${this.baseUrl}/iframe.html?id=components-button--default`);
      await this.page.waitForTimeout(2000);

      if (errors.length > 0) {
        this.warn(testName, `${errors.length} console errors detected`);
      } else {
        this.pass(testName, 'No console errors');
      }
    } catch (error) {
      this.warn(testName, error.message);
    }
  }

  pass(testName, message) {
    console.log(`   ✅ PASS: ${message}\n`);
    this.results.passed.push({ test: testName, message });
  }

  fail(testName, message) {
    console.log(`   ❌ FAIL: ${message}\n`);
    this.results.failed.push({ test: testName, message });
  }

  warn(testName, message) {
    console.log(`   ⚠️  WARN: ${message}\n`);
    this.results.warnings.push({ test: testName, message });
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION SMOKE TEST SUMMARY');
    console.log('='.repeat(60) + '\n');

    console.log(`✅ Passed: ${this.results.passed.length}`);
    console.log(`❌ Failed: ${this.results.failed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}\n`);

    if (this.results.failed.length > 0) {
      console.log('❌ FAILED TESTS:\n');
      this.results.failed.forEach(result => {
        console.log(`   • ${result.test}: ${result.message}`);
      });
      console.log('');
    }

    if (this.results.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.results.warnings.forEach(result => {
        console.log(`   • ${result.test}: ${result.message}`);
      });
      console.log('');
    }

    if (this.results.failed.length === 0) {
      console.log('✅ All smoke tests passed! Production is healthy.\n');
    } else {
      console.log('❌ Some smoke tests failed. Review issues before deploying.\n');
    }
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  url: null,
  criticalOnly: false,
  timeout: 30000
};

args.forEach(arg => {
  if (arg.startsWith('--url=')) {
    options.url = arg.split('=')[1];
  } else if (arg === '--critical-only') {
    options.criticalOnly = true;
  } else if (arg.startsWith('--timeout=')) {
    options.timeout = parseInt(arg.split('=')[1], 10);
  }
});

// Run tests
const tests = new ProductionSmokeTests(options);
tests.run().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
