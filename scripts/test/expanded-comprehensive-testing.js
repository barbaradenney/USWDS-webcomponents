#!/usr/bin/env node

/**
 * Expanded Comprehensive Testing for USWDS Components
 *
 * Tests more components for both behavioral and style issues.
 * Includes detailed debugging for specific issues found.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExpandedComprehensiveTester {
  constructor() {
    this.results = [];
    this.browser = null;
    this.page = null;
    this.storybookUrl = 'http://localhost:6006';
  }

  async initialize() {
    console.log('🎭 Starting expanded comprehensive testing...\n');

    try {
      this.browser = await chromium.launch({
        headless: true,
        timeout: 30000
      });
      this.page = await this.browser.newPage();

      // Check if Storybook is running
      console.log('🔍 Connecting to Storybook...');

      await this.page.goto(this.storybookUrl, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      // Wait for Storybook to fully load
      await this.page.waitForSelector('.sidebar-container', { timeout: 10000 });
      console.log('✅ Storybook loaded successfully\n');

    } catch (error) {
      console.error('❌ Cannot connect to Storybook:', error.message);
      console.log('💡 Make sure Storybook is running: npm run storybook');
      throw error;
    }
  }

  async navigateToStory(component, story = 'Default') {
    try {
      const storyUrl = `${this.storybookUrl}/?path=/story/components-${component}--${story.toLowerCase()}`;

      console.log(`   📖 Loading story: ${component}/${story}`);

      await this.page.goto(storyUrl, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      // Wait for the story to render
      await this.page.waitForSelector('#storybook-preview-iframe', { timeout: 5000 });

      // Switch to iframe content
      const iframe = await this.page.frameLocator('#storybook-preview-iframe');

      return iframe;

    } catch (error) {
      console.log(`   ⚠️  Could not load story ${component}/${story}: ${error.message}`);
      return null;
    }
  }

  async analyzeElementStyle(iframe, selector, elementName) {
    try {
      const element = iframe.locator(selector).first();
      const count = await iframe.locator(selector).count();

      if (count === 0) {
        return {
          name: elementName,
          exists: false,
          issues: [`${elementName} not found`]
        };
      }

      // Get computed styles and attributes
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          width: computed.width,
          height: computed.height,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontSize: computed.fontSize,
          border: computed.border
        };
      });

      const attributes = await element.evaluate((el) => {
        return {
          tabindex: el.getAttribute('tabindex'),
          ariaHidden: el.getAttribute('aria-hidden'),
          ariaDisabled: el.getAttribute('aria-disabled'),
          disabled: el.disabled,
          readonly: el.readOnly,
          className: el.className,
          id: el.id,
          type: el.type,
          placeholder: el.placeholder,
          value: el.value
        };
      });

      // Analyze for issues
      const issues = [];

      // Visibility issues
      if (styles.display === 'none') issues.push('Element is hidden (display: none)');
      if (styles.visibility === 'hidden') issues.push('Element is hidden (visibility: hidden)');
      if (parseFloat(styles.opacity) === 0) issues.push('Element is transparent (opacity: 0)');
      if (attributes.ariaHidden === 'true') issues.push('Element is hidden from screen readers (aria-hidden="true")');

      // Interaction issues
      if (attributes.tabindex === '-1') issues.push('Element is not keyboard accessible (tabindex="-1")');
      if (attributes.disabled) issues.push('Element is disabled');

      // Style issues
      if (styles.width === '0px' || styles.height === '0px') issues.push('Element has zero dimensions');

      // USWDS class validation
      if (!attributes.className || !attributes.className.includes('usa-')) {
        issues.push('Missing USWDS CSS classes');
      }

      return {
        name: elementName,
        exists: true,
        styles,
        attributes,
        issues,
        isVisible: styles.display !== 'none' && styles.visibility !== 'hidden' && parseFloat(styles.opacity) > 0,
        isInteractive: attributes.tabindex !== '-1' && !attributes.disabled && attributes.ariaHidden !== 'true'
      };

    } catch (error) {
      return {
        name: elementName,
        exists: false,
        issues: [`Error analyzing ${elementName}: ${error.message}`]
      };
    }
  }

  async testDatePicker() {
    console.log('📅 Testing Date Picker...');

    try {
      const iframe = await this.navigateToStory('date-picker');
      if (!iframe) {
        return { component: 'date-picker', status: 'error', error: 'Story not found' };
      }

      const container = await this.analyzeElementStyle(iframe, '.usa-date-picker', 'Container');
      const input = await this.analyzeElementStyle(iframe, '.usa-date-picker input', 'Input');
      const button = await this.analyzeElementStyle(iframe, '.usa-date-picker__button', 'Button');

      console.log(`   📦 Container: ${container.exists ? '✓' : '✗'}`);
      console.log(`   📝 Input: ${input.exists ? '✓' : '✗'} (visible: ${input.isVisible ? '✓' : '✗'}, interactive: ${input.isInteractive ? '✓' : '✗'})`);
      console.log(`   🔘 Button: ${button.exists ? '✓' : '✗'}`);

      // Enhanced date picker testing with debugging
      let functionalTests = [];

      if (input.exists && input.isInteractive && input.isVisible) {
        try {
          console.log(`   🔍 Testing date input functionality...`);

          const inputElement = iframe.locator('.usa-date-picker input').first();

          // Clear any existing value first
          await inputElement.clear();

          // Try typing a date
          await inputElement.type('12/25/2024', { delay: 50 });

          // Wait a bit for any event handlers
          await this.page.waitForDelay(300);

          const typedValue = await inputElement.inputValue();
          console.log(`     • Typed value: "${typedValue}"`);

          // Test different input methods
          await inputElement.clear();
          await inputElement.fill('01/01/2025');
          const filledValue = await inputElement.inputValue();
          console.log(`     • Filled value: "${filledValue}"`);

          functionalTests.push({
            test: 'Input accepts typed dates',
            passed: typedValue.includes('12/25/2024') || typedValue.includes('12252024'),
            details: `Typed: "${typedValue}"`
          });

          functionalTests.push({
            test: 'Input accepts filled dates',
            passed: filledValue.includes('01/01/2025') || filledValue.includes('01012025'),
            details: `Filled: "${filledValue}"`
          });

        } catch (error) {
          console.log(`     ❌ Input test error: ${error.message}`);
          functionalTests.push({
            test: 'Date input functionality',
            passed: false,
            error: error.message
          });
        }

        // Test button
        try {
          const buttonElement = iframe.locator('.usa-date-picker__button').first();
          await buttonElement.click();
          functionalTests.push({
            test: 'Calendar button clicks',
            passed: true
          });
          console.log(`     • Button click: ✓`);
        } catch (error) {
          functionalTests.push({
            test: 'Calendar button clicks',
            passed: false,
            error: error.message
          });
          console.log(`     • Button click: ✗ (${error.message})`);
        }
      }

      const allIssues = [...(container.issues || []), ...(input.issues || []), ...(button.issues || [])];
      const functionalFailures = functionalTests.filter(t => !t.passed);

      let status = 'passing';
      if (allIssues.length > 0 || functionalFailures.length > 0) {
        status = functionalFailures.length > 0 ? 'failing' : 'warning';
      }

      return {
        component: 'date-picker',
        status,
        styleAnalysis: { container, input, button },
        functionalTests,
        issues: allIssues
      };

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'date-picker',
        status: 'error',
        error: error.message
      };
    }
  }

  async testComboBox() {
    console.log('📋 Testing Combo Box...');

    try {
      const iframe = await this.navigateToStory('combo-box');
      if (!iframe) {
        return { component: 'combo-box', status: 'error', error: 'Story not found' };
      }

      const container = await this.analyzeElementStyle(iframe, '.usa-combo-box', 'Container');
      const input = await this.analyzeElementStyle(iframe, '.usa-combo-box input', 'Input');
      const list = await this.analyzeElementStyle(iframe, '.usa-combo-box__list', 'Options List');

      console.log(`   📦 Container: ${container.exists ? '✓' : '✗'}`);
      console.log(`   📝 Input: ${input.exists ? '✓' : '✗'}`);
      console.log(`   📋 List: ${list.exists ? '✓' : '✗'}`);

      // Test combo box functionality
      let functionalTests = [];

      if (input.exists && input.isInteractive) {
        try {
          const inputElement = iframe.locator('.usa-combo-box input').first();

          // Test typing to filter options
          await inputElement.type('a', { delay: 100 });
          await this.page.waitForDelay(500);

          // Check if options appear
          const optionCount = await iframe.locator('.usa-combo-box__list-option').count();

          functionalTests.push({
            test: 'Typing filters options',
            passed: optionCount > 0,
            details: `Found ${optionCount} options after typing`
          });

          console.log(`     • Filter works: ${optionCount > 0 ? '✓' : '✗'} (${optionCount} options)`);

        } catch (error) {
          functionalTests.push({
            test: 'Combo box filtering',
            passed: false,
            error: error.message
          });
          console.log(`     • Filter test: ✗ (${error.message})`);
        }
      }

      const allIssues = [...(container.issues || []), ...(input.issues || []), ...(list.issues || [])];
      const functionalFailures = functionalTests.filter(t => !t.passed);

      return {
        component: 'combo-box',
        status: allIssues.length === 0 && functionalFailures.length === 0 ? 'passing' : 'failing',
        styleAnalysis: { container, input, list },
        functionalTests,
        issues: allIssues
      };

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'combo-box',
        status: 'error',
        error: error.message
      };
    }
  }

  async testModal() {
    console.log('🪟 Testing Modal...');

    try {
      const iframe = await this.navigateToStory('modal');
      if (!iframe) {
        return { component: 'modal', status: 'error', error: 'Story not found' };
      }

      const trigger = await this.analyzeElementStyle(iframe, '[data-open-modal]', 'Trigger Button');
      const modal = await this.analyzeElementStyle(iframe, '.usa-modal', 'Modal');
      const overlay = await this.analyzeElementStyle(iframe, '.usa-modal__overlay', 'Overlay');

      console.log(`   🔘 Trigger: ${trigger.exists ? '✓' : '✗'}`);
      console.log(`   🪟 Modal: ${modal.exists ? '✓' : '✗'}`);
      console.log(`   🌫️  Overlay: ${overlay.exists ? '✓' : '✗'}`);

      // Test modal functionality
      let functionalTests = [];

      if (trigger.exists) {
        try {
          const triggerElement = iframe.locator('[data-open-modal]').first();

          // Click to open modal
          await triggerElement.click();
          await this.page.waitForDelay(500);

          // Check if modal becomes visible
          const modalVisible = await iframe.locator('.usa-modal').isVisible();

          functionalTests.push({
            test: 'Modal opens on trigger click',
            passed: modalVisible
          });

          console.log(`     • Modal opens: ${modalVisible ? '✓' : '✗'}`);

          if (modalVisible) {
            // Test escape key
            await this.page.keyboard.press('Escape');
            await this.page.waitForDelay(300);

            const modalStillVisible = await iframe.locator('.usa-modal').isVisible();

            functionalTests.push({
              test: 'Modal closes on Escape key',
              passed: !modalStillVisible
            });

            console.log(`     • Escape closes: ${!modalStillVisible ? '✓' : '✗'}`);
          }

        } catch (error) {
          functionalTests.push({
            test: 'Modal interaction',
            passed: false,
            error: error.message
          });
          console.log(`     • Modal test: ✗ (${error.message})`);
        }
      }

      const allIssues = [...(trigger.issues || []), ...(modal.issues || []), ...(overlay.issues || [])];
      const functionalFailures = functionalTests.filter(t => !t.passed);

      return {
        component: 'modal',
        status: allIssues.length === 0 && functionalFailures.length === 0 ? 'passing' : 'failing',
        styleAnalysis: { trigger, modal, overlay },
        functionalTests,
        issues: allIssues
      };

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'modal',
        status: 'error',
        error: error.message
      };
    }
  }

  async testButton() {
    console.log('🔘 Testing Button...');

    try {
      const iframe = await this.navigateToStory('button');
      if (!iframe) {
        return { component: 'button', status: 'error', error: 'Story not found' };
      }

      const button = await this.analyzeElementStyle(iframe, 'usa-button', 'Button');

      console.log(`   🔘 Button: ${button.exists ? '✓' : '✗'}`);

      // Test button functionality
      let functionalTests = [];

      if (button.exists) {
        try {
          const buttonElement = iframe.locator('usa-button').first();

          // Test click
          let clickCount = 0;
          await this.page.evaluate(() => {
            window.testClickCount = 0;
          });

          await buttonElement.evaluate((btn) => {
            btn.addEventListener('click', () => {
              window.testClickCount = (window.testClickCount || 0) + 1;
            });
          });

          await buttonElement.click();
          await this.page.waitForDelay(100);

          const finalClickCount = await this.page.evaluate(() => window.testClickCount || 0);

          functionalTests.push({
            test: 'Button responds to clicks',
            passed: finalClickCount > 0,
            details: `Click count: ${finalClickCount}`
          });

          console.log(`     • Click works: ${finalClickCount > 0 ? '✓' : '✗'} (${finalClickCount} clicks)`);

          // Test keyboard activation
          await buttonElement.focus();
          await this.page.keyboard.press('Enter');
          await this.page.waitForDelay(100);

          const keyboardClickCount = await this.page.evaluate(() => window.testClickCount || 0);

          functionalTests.push({
            test: 'Button responds to keyboard (Enter)',
            passed: keyboardClickCount > finalClickCount,
            details: `Keyboard click count: ${keyboardClickCount}`
          });

          console.log(`     • Keyboard works: ${keyboardClickCount > finalClickCount ? '✓' : '✗'}`);

        } catch (error) {
          functionalTests.push({
            test: 'Button interaction',
            passed: false,
            error: error.message
          });
          console.log(`     • Button test: ✗ (${error.message})`);
        }
      }

      const functionalFailures = functionalTests.filter(t => !t.passed);

      return {
        component: 'button',
        status: button.issues.length === 0 && functionalFailures.length === 0 ? 'passing' : 'failing',
        styleAnalysis: { button },
        functionalTests,
        issues: button.issues || []
      };

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'button',
        status: 'error',
        error: error.message
      };
    }
  }

  async runExpandedTests() {
    console.log('🎯 EXPANDED COMPREHENSIVE TESTING\n');
    console.log('Testing multiple components for behavioral and style issues...\n');

    const tests = [
      { name: 'date-picker', test: () => this.testDatePicker() },
      { name: 'combo-box', test: () => this.testComboBox() },
      { name: 'modal', test: () => this.testModal() },
      { name: 'button', test: () => this.testButton() }
    ];

    for (const { name, test } of tests) {
      const result = await test();
      this.results.push(result);
      console.log('');
    }

    this.generateExpandedReport();
  }

  generateExpandedReport() {
    console.log('📊 EXPANDED TESTING SUMMARY\n');

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

      console.log(`${icon} ${result.component.toUpperCase()}`);

      // Show functional test results
      if (result.functionalTests && result.functionalTests.length > 0) {
        console.log(`   ⚡ FUNCTIONAL TESTS:`);
        for (const test of result.functionalTests) {
          const testIcon = test.passed ? '✓' : '✗';
          console.log(`     ${testIcon} ${test.test}`);
          if (test.details) {
            console.log(`       Details: ${test.details}`);
          }
          if (!test.passed && test.error) {
            console.log(`       Error: ${test.error}`);
          }
        }
      }

      // Show style issues if any
      if (result.issues && result.issues.length > 0) {
        console.log(`   🎨 STYLE ISSUES:`);
        for (const issue of result.issues) {
          console.log(`     • ${issue}`);
        }
      }

      console.log('');
    }

    // Summary insights
    const componentsWithIssues = this.results.filter(r => r.status === 'failing' || r.status === 'error');

    if (componentsWithIssues.length > 0) {
      console.log('🚨 COMPONENTS NEEDING ATTENTION:\n');

      for (const comp of componentsWithIssues) {
        console.log(`❌ ${comp.component}:`);

        if (comp.functionalTests) {
          const failedTests = comp.functionalTests.filter(t => !t.passed);
          if (failedTests.length > 0) {
            console.log(`   Functional Issues:`);
            for (const test of failedTests) {
              console.log(`   • ${test.test}${test.details ? ` (${test.details})` : ''}`);
            }
          }
        }

        if (comp.issues && comp.issues.length > 0) {
          console.log(`   Style Issues:`);
          for (const issue of comp.issues) {
            console.log(`   • ${issue}`);
          }
        }

        console.log('');
      }
    }

    console.log('🎯 TESTING INSIGHTS:');
    console.log('✓ Multiple components tested simultaneously');
    console.log('✓ Both visual and functional validation');
    console.log('✓ Detailed debugging information provided');
    console.log('✓ Specific test failure details captured');
    console.log('✓ Ready for targeted fixes\n');

    // Save report
    const reportPath = path.join(__dirname, '../compliance/expanded-testing-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: { passing, warning, failing, error, total },
      componentsWithIssues: componentsWithIssues.map(c => ({
        component: c.component,
        status: c.status,
        issueCount: (c.issues || []).length,
        failedTests: c.functionalTests ? c.functionalTests.filter(t => !t.passed).length : 0
      }))
    }, null, 2));

    console.log(`📋 Detailed report saved to: ${reportPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ExpandedComprehensiveTester();

  tester.initialize()
    .then(() => tester.runExpandedTests())
    .then(() => tester.cleanup())
    .catch(async (error) => {
      console.error('💥 Expanded testing failed:', error);
      await tester.cleanup();
      process.exit(1);
    });
}

export default ExpandedComprehensiveTester;