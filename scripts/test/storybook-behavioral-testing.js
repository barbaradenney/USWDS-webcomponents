#!/usr/bin/env node

/**
 * Storybook Behavioral Testing for USWDS Components
 *
 * Tests components directly in Storybook environment to catch functional issues
 * that static analysis misses.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StorybookBehavioralTester {
  constructor() {
    this.results = [];
    this.browser = null;
    this.page = null;
    this.storybookUrl = 'http://localhost:6006';
  }

  async initialize() {
    console.log('🎭 Starting Storybook behavioral testing...\n');

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

  async testAccordion() {
    console.log('🪗 Testing Accordion in Storybook...');

    try {
      const iframe = await this.navigateToStory('accordion');
      if (!iframe) {
        return { component: 'accordion', status: 'error', error: 'Story not found' };
      }

      // Test 1: Check if accordion exists
      const hasAccordion = await iframe.locator('.usa-accordion').count() > 0;
      console.log(`   Structure: ${hasAccordion ? '✓' : '✗'}`);

      if (!hasAccordion) {
        return {
          component: 'accordion',
          status: 'failing',
          tests: [{ test: 'Has accordion structure', passed: false }],
          issues: ['No accordion found in story']
        };
      }

      // Test 2: Check if buttons exist
      const buttons = iframe.locator('.usa-accordion__button');
      const buttonCount = await buttons.count();
      console.log(`   Buttons found: ${buttonCount}`);

      if (buttonCount === 0) {
        return {
          component: 'accordion',
          status: 'failing',
          tests: [
            { test: 'Has accordion structure', passed: true },
            { test: 'Has accordion buttons', passed: false }
          ],
          issues: ['No accordion buttons found']
        };
      }

      // Test 3: Test click functionality
      const firstButton = buttons.first();

      // Get initial state
      const initialExpanded = await firstButton.getAttribute('aria-expanded');
      console.log(`   Initial state: aria-expanded="${initialExpanded}"`);

      // Click the button
      await firstButton.click();

      // Wait for potential state change
      await this.page.waitForDelay(500);

      // Check new state
      const newExpanded = await firstButton.getAttribute('aria-expanded');
      console.log(`   After click: aria-expanded="${newExpanded}"`);

      const clickWorks = initialExpanded !== newExpanded;
      console.log(`   Click behavior: ${clickWorks ? '✓' : '✗'}`);

      // Test 4: Test keyboard navigation
      await firstButton.focus();
      await this.page.keyboard.press('Enter');
      await this.page.waitForDelay(300);

      const afterKeyboard = await firstButton.getAttribute('aria-expanded');
      const keyboardWorks = newExpanded !== afterKeyboard;
      console.log(`   Keyboard: ${keyboardWorks ? '✓' : '✗'}`);

      const result = {
        component: 'accordion',
        tests: [
          { test: 'Has accordion structure', passed: hasAccordion },
          { test: 'Has accordion buttons', passed: buttonCount > 0 },
          { test: 'Click toggles state', passed: clickWorks },
          { test: 'Keyboard navigation works', passed: keyboardWorks }
        ],
        status: hasAccordion && buttonCount > 0 && clickWorks && keyboardWorks ? 'passing' : 'failing',
        issues: []
      };

      if (!clickWorks) {
        result.issues.push('Click does not toggle accordion state');
      }
      if (!keyboardWorks) {
        result.issues.push('Keyboard navigation does not work');
      }

      return result;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'accordion',
        status: 'error',
        error: error.message,
        tests: []
      };
    }
  }

  async testDatePicker() {
    console.log('📅 Testing Date Picker in Storybook...');

    try {
      const iframe = await this.navigateToStory('date-picker');
      if (!iframe) {
        return { component: 'date-picker', status: 'error', error: 'Story not found' };
      }

      // Test 1: Check if date picker exists
      const hasDatePicker = await iframe.locator('.usa-date-picker').count() > 0;
      console.log(`   Structure: ${hasDatePicker ? '✓' : '✗'}`);

      // Test 2: Check for input field
      const inputExists = await iframe.locator('.usa-date-picker input[type="text"]').count() > 0;
      console.log(`   Input field: ${inputExists ? '✓' : '✗'}`);

      // Test 3: Check for calendar button
      const buttonExists = await iframe.locator('.usa-date-picker__button').count() > 0;
      console.log(`   Calendar button: ${buttonExists ? '✓' : '✗'}`);

      if (!hasDatePicker || !inputExists || !buttonExists) {
        return {
          component: 'date-picker',
          status: 'failing',
          tests: [
            { test: 'Has date picker structure', passed: hasDatePicker },
            { test: 'Has input field', passed: inputExists },
            { test: 'Has calendar button', passed: buttonExists }
          ],
          issues: ['Missing required date picker elements']
        };
      }

      // Test 4: Test input functionality
      const input = iframe.locator('.usa-date-picker input').first();
      await input.fill('12/25/2024');
      const inputValue = await input.inputValue();
      const inputWorks = inputValue === '12/25/2024';
      console.log(`   Input accepts dates: ${inputWorks ? '✓' : '✗'}`);

      // Test 5: Test button click
      const button = iframe.locator('.usa-date-picker__button').first();

      let buttonClicked = false;
      try {
        await button.click();
        buttonClicked = true;
        console.log(`   Button responds to click: ✓`);
      } catch (error) {
        console.log(`   Button responds to click: ✗`);
      }

      const result = {
        component: 'date-picker',
        tests: [
          { test: 'Has date picker structure', passed: hasDatePicker },
          { test: 'Has input field', passed: inputExists },
          { test: 'Has calendar button', passed: buttonExists },
          { test: 'Input accepts dates', passed: inputWorks },
          { test: 'Button responds to click', passed: buttonClicked }
        ],
        status: hasDatePicker && inputExists && buttonExists && inputWorks && buttonClicked ? 'passing' : 'warning',
        issues: []
      };

      if (!inputWorks) {
        result.issues.push('Input field does not accept date values properly');
      }
      if (!buttonClicked) {
        result.issues.push('Calendar button does not respond to clicks');
      }

      return result;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'date-picker',
        status: 'error',
        error: error.message,
        tests: []
      };
    }
  }

  async testInPageNavigation() {
    console.log('📋 Testing In-Page Navigation in Storybook...');

    try {
      const iframe = await this.navigateToStory('in-page-navigation');
      if (!iframe) {
        return { component: 'in-page-navigation', status: 'error', error: 'Story not found' };
      }

      // Test 1: Check if in-page nav exists
      const hasInPageNav = await iframe.locator('.usa-in-page-nav').count() > 0;
      console.log(`   Structure: ${hasInPageNav ? '✓' : '✗'}`);

      // Test 2: Check for navigation links
      const links = iframe.locator('.usa-in-page-nav__link');
      const linkCount = await links.count();
      console.log(`   Navigation links: ${linkCount}`);

      if (!hasInPageNav || linkCount === 0) {
        return {
          component: 'in-page-navigation',
          status: 'failing',
          tests: [
            { test: 'Has in-page nav structure', passed: hasInPageNav },
            { test: 'Has navigation links', passed: linkCount > 0 }
          ],
          issues: ['Missing required in-page navigation elements']
        };
      }

      // Test 3: Test link clicks
      const firstLink = links.first();

      let linkClicked = false;
      try {
        await firstLink.click();
        linkClicked = true;
        console.log(`   Links respond to click: ✓`);
      } catch (error) {
        console.log(`   Links respond to click: ✗`);
      }

      // Test 4: Check for scroll targets (if any)
      const href = await firstLink.getAttribute('href');
      const hasTargets = href && href.startsWith('#');
      console.log(`   Has scroll targets: ${hasTargets ? '✓' : '✗'}`);

      const result = {
        component: 'in-page-navigation',
        tests: [
          { test: 'Has in-page nav structure', passed: hasInPageNav },
          { test: 'Has navigation links', passed: linkCount > 0 },
          { test: 'Links respond to click', passed: linkClicked },
          { test: 'Has scroll targets', passed: hasTargets }
        ],
        status: hasInPageNav && linkCount > 0 && linkClicked ? 'warning' : 'failing',
        issues: []
      };

      if (!linkClicked) {
        result.issues.push('Navigation links do not respond to clicks');
      }
      if (!hasTargets) {
        result.issues.push('Links do not have scroll targets');
      }

      // Note: Scroll tracking would require JavaScript enhancement
      result.issues.push('Scroll tracking functionality requires JavaScript enhancement');

      return result;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return {
        component: 'in-page-navigation',
        status: 'error',
        error: error.message,
        tests: []
      };
    }
  }

  async runAllTests() {
    console.log('🎯 STORYBOOK BEHAVIORAL TESTING\n');
    console.log('Testing components in their Storybook environment...\n');

    const tests = [
      { name: 'accordion', test: () => this.testAccordion() },
      { name: 'date-picker', test: () => this.testDatePicker() },
      { name: 'in-page-navigation', test: () => this.testInPageNavigation() }
    ];

    for (const { name, test } of tests) {
      const result = await test();
      this.results.push(result);
      console.log('');
    }

    this.generateReport();
  }

  generateReport() {
    console.log('📊 STORYBOOK BEHAVIORAL TESTING SUMMARY\n');

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

      if (result.issues && result.issues.length > 0) {
        console.log(`    Issues:`);
        for (const issue of result.issues) {
          console.log(`      • ${issue}`);
        }
      }

      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }

      console.log('');
    }

    console.log('💡 KEY FINDINGS:\n');

    const criticalIssues = this.results.filter(r => r.status === 'failing' || r.status === 'error');

    if (criticalIssues.length > 0) {
      console.log('🚨 BEHAVIORAL ISSUES DETECTED:');
      console.log('   • Components in Storybook have functional problems');
      console.log('   • User interactions (click, keyboard) may not work as expected');
      console.log('   • This confirms the gap between static compliance and actual functionality\n');

      console.log('🔍 SPECIFIC PROBLEMS FOUND:');
      for (const issue of criticalIssues) {
        console.log(`   • ${issue.component}: ${issue.issues?.join(', ') || issue.error || 'Functional issues detected'}`);
      }
      console.log('');
    }

    const warningComponents = this.results.filter(r => r.status === 'warning');
    if (warningComponents.length > 0) {
      console.log('⚠️  ENHANCEMENT NEEDED:');
      console.log('   • Components have basic functionality but missing advanced features');
      console.log('   • JavaScript enhancement needed for complete USWDS behavior\n');
    }

    console.log('🎯 ACTIONABLE RECOMMENDATIONS:');
    console.log('1. Fix failing components before users encounter broken functionality');
    console.log('2. Add JavaScript enhancement for components with warnings');
    console.log('3. Use this behavioral testing to supplement static compliance checks');
    console.log('4. Test all component interactions, not just CSS class presence\n');

    if (criticalIssues.length === 0) {
      console.log('✅ All tested components show basic functional behavior!');
      console.log('   This suggests the USWDS integration fixes have improved functionality.\n');
    }

    // Save results
    const reportPath = path.join(__dirname, '../compliance/storybook-behavioral-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: { passing, warning, failing, error, total },
      findings: {
        criticalIssues: criticalIssues.length,
        functionalProblems: criticalIssues.map(r => ({
          component: r.component,
          issues: r.issues || [r.error]
        }))
      }
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
  const tester = new StorybookBehavioralTester();

  tester.initialize()
    .then(() => tester.runAllTests())
    .then(() => tester.cleanup())
    .catch(async (error) => {
      console.error('💥 Storybook behavioral testing failed:', error);
      await tester.cleanup();
      process.exit(1);
    });
}

export default StorybookBehavioralTester;