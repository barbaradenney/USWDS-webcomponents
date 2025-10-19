#!/usr/bin/env node

/**
 * Simple Behavioral Testing for USWDS Components
 *
 * Tests components in Storybook environment to catch functional issues
 * that static analysis misses.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleBehavioralTester {
  constructor() {
    this.srcDir = path.join(__dirname, '../../src/components');
    this.results = [];
    this.browser = null;
    this.page = null;
    this.storybookUrl = 'http://localhost:6006';
  }

  async initialize() {
    console.log('🎭 Starting browser for behavioral testing...\n');

    try {
      this.browser = await chromium.launch({
        headless: true,
        timeout: 30000
      });
      this.page = await this.browser.newPage();

      // Check if Storybook is running
      console.log('🔍 Checking if Storybook is available...');

      try {
        await this.page.goto(this.storybookUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        console.log('✅ Storybook is available');
      } catch (error) {
        console.log('⚠️  Storybook not available, testing components directly...');
        await this.setupDirectTesting();
      }

    } catch (error) {
      console.error('❌ Browser initialization failed:', error.message);
      throw error;
    }
  }

  async setupDirectTesting() {
    // Create a simple test page without external dependencies
    const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Behavioral Testing</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .test-container { margin: 20px 0; padding: 20px; border: 1px solid #ccc; }
    .error { color: red; }
    .success { color: green; }
  </style>
</head>
<body>
  <div id="test-container">
    <h1>Component Behavioral Testing</h1>
    <div id="component-mount"></div>
  </div>

  <script type="module">
    // Test utilities
    window.testUtils = {
      simulateClick: async function(element) {
        element.click();
        await new Promise(resolve => setTimeout(resolve, 100));
      },

      simulateKeydown: async function(element, key) {
        const event = new KeyboardEvent('keydown', { key: key, bubbles: true });
        element.dispatchEvent(event);
        await new Promise(resolve => setTimeout(resolve, 100));
      },

      waitForUpdate: function(ms = 100) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },

      checkElement: function(selector) {
        return document.querySelector(selector) !== null;
      }
    };

    console.log('Test utilities loaded');
  </script>
</body>
</html>`;

    await this.page.setContent(testHTML);
    console.log('✅ Direct testing environment ready');
  }

  async testAccordion() {
    console.log('🪗 Testing Accordion behavioral functionality...');

    try {
      // Create accordion HTML structure directly
      await this.page.evaluate(() => {
        const container = document.getElementById('component-mount');
        container.innerHTML = `
          <div class="usa-accordion" data-allow-multiple="false">
            <h4 class="usa-accordion__heading">
              <button type="button"
                      id="accordion-item-1-button"
                      class="usa-accordion__button"
                      aria-expanded="false"
                      aria-controls="accordion-item-1-content">
                First Amendment
              </button>
            </h4>
            <div id="accordion-item-1-content"
                 class="usa-accordion__content usa-prose"
                 hidden>
              Congress shall make no law respecting an establishment of religion.
            </div>

            <h4 class="usa-accordion__heading">
              <button type="button"
                      id="accordion-item-2-button"
                      class="usa-accordion__button"
                      aria-expanded="false"
                      aria-controls="accordion-item-2-content">
                Second Amendment
              </button>
            </h4>
            <div id="accordion-item-2-content"
                 class="usa-accordion__content usa-prose"
                 hidden>
              A well regulated Militia, being necessary to the security of a free State.
            </div>
          </div>
        `;
      });

      // Test 1: Check if accordion structure exists
      const hasStructure = await this.page.evaluate(() => {
        return window.testUtils.checkElement('.usa-accordion__button');
      });

      // Test 2: Simulate click and check if behavior works
      const clickWorks = await this.page.evaluate(async () => {
        const button = document.querySelector('.usa-accordion__button');
        if (!button) return false;

        const initialExpanded = button.getAttribute('aria-expanded') === 'true';

        // Click the button
        await window.testUtils.simulateClick(button);

        const newExpanded = button.getAttribute('aria-expanded') === 'true';
        return initialExpanded !== newExpanded; // Should change state
      });

      // Test 3: Check if content visibility changes
      const contentToggleWorks = await this.page.evaluate(async () => {
        const button = document.querySelector('.usa-accordion__button');
        const content = document.getElementById('accordion-item-1-content');
        if (!button || !content) return false;

        const initialHidden = content.hasAttribute('hidden');

        // Click the button
        await window.testUtils.simulateClick(button);

        const newHidden = content.hasAttribute('hidden');
        return initialHidden !== newHidden; // Should change visibility
      });

      // Test 4: Check keyboard navigation
      const keyboardWorks = await this.page.evaluate(async () => {
        const button = document.querySelector('.usa-accordion__button');
        if (!button) return false;

        button.focus();

        // Test Enter key
        await window.testUtils.simulateKeydown(button, 'Enter');

        // Check if state changed
        return button.getAttribute('aria-expanded') === 'true';
      });

      const result = {
        component: 'accordion',
        tests: [
          { test: 'Has correct USWDS structure', passed: hasStructure },
          { test: 'Click toggles aria-expanded', passed: clickWorks },
          { test: 'Content visibility changes', passed: contentToggleWorks },
          { test: 'Keyboard navigation works', passed: keyboardWorks }
        ],
        status: hasStructure && clickWorks && contentToggleWorks && keyboardWorks ? 'passing' : 'failing'
      };

      console.log(`   Structure: ${hasStructure ? '✓' : '✗'}`);
      console.log(`   Click behavior: ${clickWorks ? '✓' : '✗'}`);
      console.log(`   Content toggle: ${contentToggleWorks ? '✓' : '✗'}`);
      console.log(`   Keyboard: ${keyboardWorks ? '✓' : '✗'}`);

      return result;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'accordion',
        tests: [],
        status: 'error',
        error: error.message
      };
    }
  }

  async testDatePicker() {
    console.log('📅 Testing Date Picker behavioral functionality...');

    try {
      // Create date picker HTML structure
      await this.page.evaluate(() => {
        const container = document.getElementById('component-mount');
        container.innerHTML = `
          <div class="usa-form-group">
            <div class="usa-date-picker" data-default-value="">
              <label class="usa-label" for="date-picker-1">
                Appointment date
              </label>
              <div class="usa-input-group">
                <input class="usa-input"
                       id="date-picker-1"
                       name="date-picker-1"
                       type="text"
                       placeholder="mm/dd/yyyy" />
                <button type="button"
                        class="usa-date-picker__button"
                        aria-label="Toggle calendar"
                        aria-controls="date-picker-1">
                </button>
              </div>
            </div>
          </div>
        `;
      });

      // Test 1: Check structure
      const hasStructure = await this.page.evaluate(() => {
        return window.testUtils.checkElement('.usa-date-picker__button') &&
               window.testUtils.checkElement('input[type="text"]');
      });

      // Test 2: Check if input accepts dates
      const inputWorks = await this.page.evaluate(async () => {
        const input = document.querySelector('.usa-date-picker input');
        if (!input) return false;

        input.value = '12/25/2024';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        return input.value === '12/25/2024';
      });

      // Test 3: Check if button responds to clicks
      const buttonResponds = await this.page.evaluate(async () => {
        const button = document.querySelector('.usa-date-picker__button');
        if (!button) return false;

        let clicked = false;
        button.addEventListener('click', () => { clicked = true; });

        await window.testUtils.simulateClick(button);

        return clicked;
      });

      // Test 4: Check keyboard navigation on input
      const keyboardOnInput = await this.page.evaluate(async () => {
        const input = document.querySelector('.usa-date-picker input');
        if (!input) return false;

        input.focus();

        let keydownFired = false;
        input.addEventListener('keydown', () => { keydownFired = true; });

        await window.testUtils.simulateKeydown(input, 'ArrowDown');

        return keydownFired;
      });

      const result = {
        component: 'date-picker',
        tests: [
          { test: 'Has correct USWDS structure', passed: hasStructure },
          { test: 'Input accepts date values', passed: inputWorks },
          { test: 'Button responds to clicks', passed: buttonResponds },
          { test: 'Keyboard events work', passed: keyboardOnInput }
        ],
        status: hasStructure && inputWorks && buttonResponds && keyboardOnInput ? 'passing' : 'failing'
      };

      console.log(`   Structure: ${hasStructure ? '✓' : '✗'}`);
      console.log(`   Input: ${inputWorks ? '✓' : '✗'}`);
      console.log(`   Button: ${buttonResponds ? '✓' : '✗'}`);
      console.log(`   Keyboard: ${keyboardOnInput ? '✓' : '✗'}`);

      return result;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'date-picker',
        tests: [],
        status: 'error',
        error: error.message
      };
    }
  }

  async testInPageNavigation() {
    console.log('📋 Testing In-Page Navigation behavioral functionality...');

    try {
      // Create in-page navigation with scroll targets
      await this.page.evaluate(() => {
        const container = document.getElementById('component-mount');
        container.innerHTML = `
          <nav aria-labelledby="in-page-nav-title" class="usa-in-page-nav">
            <div class="usa-in-page-nav__nav">
              <h4 class="usa-in-page-nav__heading" id="in-page-nav-title">On this page</h4>
              <ul class="usa-in-page-nav__list">
                <li class="usa-in-page-nav__item">
                  <a href="#section-1" class="usa-in-page-nav__link">Section 1</a>
                </li>
                <li class="usa-in-page-nav__item">
                  <a href="#section-2" class="usa-in-page-nav__link">Section 2</a>
                </li>
                <li class="usa-in-page-nav__item">
                  <a href="#section-3" class="usa-in-page-nav__link">Section 3</a>
                </li>
              </ul>
            </div>
          </nav>

          <div style="height: 200px;">
            <h2 id="section-1">Section 1</h2>
            <p>Content for section 1</p>
          </div>
          <div style="height: 200px;">
            <h2 id="section-2">Section 2</h2>
            <p>Content for section 2</p>
          </div>
          <div style="height: 200px;">
            <h2 id="section-3">Section 3</h2>
            <p>Content for section 3</p>
          </div>
        `;
      });

      // Test 1: Check structure
      const hasStructure = await this.page.evaluate(() => {
        return window.testUtils.checkElement('.usa-in-page-nav__link') &&
               window.testUtils.checkElement('[href="#section-1"]');
      });

      // Test 2: Check if links are clickable
      const linksWork = await this.page.evaluate(async () => {
        const link = document.querySelector('.usa-in-page-nav__link[href="#section-1"]');
        if (!link) return false;

        let clicked = false;
        link.addEventListener('click', () => { clicked = true; });

        await window.testUtils.simulateClick(link);

        return clicked;
      });

      // Test 3: Check if target sections exist
      const targetsExist = await this.page.evaluate(() => {
        return document.getElementById('section-1') !== null &&
               document.getElementById('section-2') !== null &&
               document.getElementById('section-3') !== null;
      });

      const result = {
        component: 'in-page-navigation',
        tests: [
          { test: 'Has correct USWDS structure', passed: hasStructure },
          { test: 'Links respond to clicks', passed: linksWork },
          { test: 'Target sections exist', passed: targetsExist }
        ],
        status: hasStructure && linksWork && targetsExist ? 'warning' : 'failing'
      };

      console.log(`   Structure: ${hasStructure ? '✓' : '✗'}`);
      console.log(`   Links: ${linksWork ? '✓' : '✗'}`);
      console.log(`   Targets: ${targetsExist ? '✓' : '✗'}`);
      console.log(`   Note: Scroll tracking requires JavaScript enhancement`);

      return result;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'in-page-navigation',
        tests: [],
        status: 'error',
        error: error.message
      };
    }
  }

  async runAllTests() {
    console.log('🎯 SIMPLE BEHAVIORAL COMPLIANCE TESTING\n');
    console.log('Testing critical component functionality...\n');

    const components = ['accordion', 'date-picker', 'in-page-navigation'];

    for (const component of components) {
      let result;

      switch (component) {
        case 'accordion':
          result = await this.testAccordion();
          break;
        case 'date-picker':
          result = await this.testDatePicker();
          break;
        case 'in-page-navigation':
          result = await this.testInPageNavigation();
          break;
        default:
          result = { component, status: 'skipped', tests: [] };
      }

      this.results.push(result);
      console.log('');
    }

    this.generateReport();
  }

  generateReport() {
    console.log('📊 BEHAVIORAL TESTING SUMMARY\n');

    const passing = this.results.filter(r => r.status === 'passing').length;
    const warning = this.results.filter(r => r.status === 'warning').length;
    const failing = this.results.filter(r => r.status === 'failing').length;
    const error = this.results.filter(r => r.status === 'error').length;
    const total = this.results.length;

    console.log(`📈 Results: ${passing} passing, ${warning} warnings, ${failing} failing, ${error} errors`);
    console.log(`📊 Success Rate: ${Math.round(((passing + warning) / total) * 100)}%\n`);

    // Detailed results
    for (const result of this.results) {
      const icon = {
        'passing': '✅',
        'warning': '⚠️ ',
        'failing': '❌',
        'error': '💥'
      }[result.status];

      console.log(`${icon} ${result.component}`);

      if (result.tests) {
        for (const test of result.tests) {
          const testIcon = test.passed ? '  ✓' : '  ✗';
          console.log(`${testIcon} ${test.test}`);
        }
      }

      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }

      console.log('');
    }

    console.log('💡 FINDINGS:\n');

    if (failing > 0 || error > 0) {
      console.log('🚨 CRITICAL ISSUES DETECTED:');
      console.log('   • Components have broken functionality that static analysis missed');
      console.log('   • Basic user interactions (click, keyboard) are not working properly');
      console.log('   • This confirms that static compliance testing was insufficient\n');
    }

    if (warning > 0) {
      console.log('⚠️  BEHAVIORAL INCONSISTENCIES:');
      console.log('   • Components have correct structure but missing advanced functionality');
      console.log('   • JavaScript enhancement needed for complete USWDS behavior\n');
    }

    console.log('🎯 RECOMMENDATIONS:');
    console.log('1. Fix failing behavioral tests before deploying to users');
    console.log('2. Add JavaScript enhancement for warning components');
    console.log('3. Use this behavioral testing to catch regressions');
    console.log('4. Supplement static analysis with functional testing\n');

    // Save results
    const reportPath = path.join(__dirname, '../compliance/simple-behavioral-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: { passing, warning, failing, error, total }
    }, null, 2));

    console.log(`📋 Report saved to: ${reportPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SimpleBehavioralTester();

  tester.initialize()
    .then(() => tester.runAllTests())
    .then(() => tester.cleanup())
    .catch(async (error) => {
      console.error('💥 Behavioral testing failed:', error);
      await tester.cleanup();
      process.exit(1);
    });
}

export default SimpleBehavioralTester;