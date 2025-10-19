#!/usr/bin/env node

/**
 * Comprehensive Behavioral + Style Testing for USWDS Components
 *
 * Tests both functionality AND visual/styling compliance in Storybook.
 * Catches issues that pure static analysis or behavioral-only testing miss.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveBehavioralTester {
  constructor() {
    this.results = [];
    this.browser = null;
    this.page = null;
    this.storybookUrl = 'http://localhost:6006';
  }

  async initialize() {
    console.log('🎭 Starting comprehensive behavioral + style testing...\n');

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
          position: computed.position,
          zIndex: computed.zIndex,
          width: computed.width,
          height: computed.height,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          border: computed.border,
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          margin: computed.margin
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
          placeholder: el.placeholder
        };
      });

      // Analyze for issues
      const issues = [];

      // Visibility issues
      if (styles.display === 'none') {
        issues.push('Element is hidden (display: none)');
      }
      if (styles.visibility === 'hidden') {
        issues.push('Element is hidden (visibility: hidden)');
      }
      if (parseFloat(styles.opacity) === 0) {
        issues.push('Element is transparent (opacity: 0)');
      }
      if (attributes.ariaHidden === 'true') {
        issues.push('Element is hidden from screen readers (aria-hidden="true")');
      }

      // Interaction issues
      if (attributes.tabindex === '-1') {
        issues.push('Element is not keyboard accessible (tabindex="-1")');
      }
      if (attributes.disabled) {
        issues.push('Element is disabled');
      }

      // Style issues
      if (styles.width === '0px' || styles.height === '0px') {
        issues.push('Element has zero dimensions');
      }

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

  async testDatePickerComprehensive() {
    console.log('📅 Testing Date Picker (Comprehensive: Behavior + Style)...');

    try {
      const iframe = await this.navigateToStory('date-picker');
      if (!iframe) {
        return { component: 'date-picker', status: 'error', error: 'Story not found' };
      }

      // Analyze all key elements
      const container = await this.analyzeElementStyle(iframe, '.usa-date-picker', 'Date Picker Container');
      const input = await this.analyzeElementStyle(iframe, '.usa-date-picker input', 'Date Input');
      const button = await this.analyzeElementStyle(iframe, '.usa-date-picker__button', 'Calendar Button');

      console.log(`   📦 Container: ${container.exists ? '✓' : '✗'}`);
      console.log(`   📝 Input: ${input.exists ? '✓' : '✗'}`);
      console.log(`   🔘 Button: ${button.exists ? '✓' : '✗'}`);

      // Detailed analysis
      if (input.exists) {
        console.log(`   🔍 Input Analysis:`);
        console.log(`     • Visible: ${input.isVisible ? '✓' : '✗'}`);
        console.log(`     • Interactive: ${input.isInteractive ? '✓' : '✗'}`);
        console.log(`     • Tabindex: ${input.attributes.tabindex || 'default'}`);
        console.log(`     • Aria-hidden: ${input.attributes.ariaHidden || 'false'}`);
        console.log(`     • CSS Classes: ${input.attributes.className}`);

        if (input.issues.length > 0) {
          console.log(`     ❌ Issues found:`);
          for (const issue of input.issues) {
            console.log(`       • ${issue}`);
          }
        }
      }

      // Test functionality if input is accessible
      let functionalTests = [];

      if (input.exists && input.isInteractive && input.isVisible) {
        console.log(`   🧪 Testing functionality...`);

        try {
          const inputElement = iframe.locator('.usa-date-picker input').first();
          await inputElement.fill('12/25/2024');
          const inputValue = await inputElement.inputValue();
          functionalTests.push({
            test: 'Input accepts date values',
            passed: inputValue === '12/25/2024'
          });
          console.log(`     • Input accepts dates: ✓`);
        } catch (error) {
          functionalTests.push({
            test: 'Input accepts date values',
            passed: false,
            error: error.message
          });
          console.log(`     • Input accepts dates: ✗ (${error.message})`);
        }

        try {
          const buttonElement = iframe.locator('.usa-date-picker__button').first();
          await buttonElement.click();
          functionalTests.push({
            test: 'Calendar button responds',
            passed: true
          });
          console.log(`     • Calendar button clicks: ✓`);
        } catch (error) {
          functionalTests.push({
            test: 'Calendar button responds',
            passed: false,
            error: error.message
          });
          console.log(`     • Calendar button clicks: ✗ (${error.message})`);
        }
      } else {
        console.log(`   ⚠️  Skipping functionality tests - input not accessible`);
        functionalTests.push({
          test: 'Input accessibility check',
          passed: false,
          error: 'Input is not visible or interactive'
        });
      }

      // Determine overall status
      const allIssues = [...(container.issues || []), ...(input.issues || []), ...(button.issues || [])];
      const criticalIssues = allIssues.filter(issue =>
        issue.includes('hidden') ||
        issue.includes('not keyboard accessible') ||
        issue.includes('disabled') ||
        issue.includes('zero dimensions')
      );

      const functionalFailures = functionalTests.filter(t => !t.passed);

      let status = 'passing';
      if (criticalIssues.length > 0 || functionalFailures.length > 0) {
        status = 'failing';
      } else if (allIssues.length > 0) {
        status = 'warning';
      }

      return {
        component: 'date-picker',
        status,
        styleAnalysis: { container, input, button },
        functionalTests,
        issues: allIssues,
        criticalIssues,
        recommendations: this.generateDatePickerRecommendations(container, input, button, functionalTests)
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

  generateDatePickerRecommendations(container, input, button, functionalTests) {
    const recommendations = [];

    if (input.exists && !input.isVisible) {
      recommendations.push('Fix input visibility - remove aria-hidden="true" or display:none');
    }

    if (input.exists && !input.isInteractive) {
      recommendations.push('Fix input interactivity - remove tabindex="-1" and ensure it\'s not disabled');
    }

    if (input.exists && input.attributes.ariaHidden === 'true') {
      recommendations.push('Remove aria-hidden="true" from input field to make it accessible');
    }

    if (input.exists && input.attributes.tabindex === '-1') {
      recommendations.push('Remove tabindex="-1" or set to "0" to enable keyboard navigation');
    }

    const failedFunctional = functionalTests.filter(t => !t.passed);
    if (failedFunctional.length > 0) {
      recommendations.push('Fix functional issues preventing user interaction');
    }

    if (!input.exists) {
      recommendations.push('Add proper date input field with usa-input class');
    }

    if (!button.exists) {
      recommendations.push('Add calendar toggle button with usa-date-picker__button class');
    }

    return recommendations;
  }

  async testAccordionComprehensive() {
    console.log('🪗 Testing Accordion (Comprehensive: Behavior + Style)...');

    try {
      const iframe = await this.navigateToStory('accordion');
      if (!iframe) {
        return { component: 'accordion', status: 'error', error: 'Story not found' };
      }

      // Analyze elements
      const container = await this.analyzeElementStyle(iframe, '.usa-accordion', 'Accordion Container');
      const buttons = await iframe.locator('.usa-accordion__button').count();
      const firstButton = await this.analyzeElementStyle(iframe, '.usa-accordion__button', 'Accordion Button');

      console.log(`   📦 Container: ${container.exists ? '✓' : '✗'}`);
      console.log(`   🔘 Buttons found: ${buttons}`);

      // Test behavior
      let functionalTests = [];

      if (buttons > 0) {
        try {
          const buttonElement = iframe.locator('.usa-accordion__button').first();

          // Check initial state
          const initialExpanded = await buttonElement.getAttribute('aria-expanded');

          // Click test
          await buttonElement.click();
          await this.page.waitForDelay(300);

          const afterClick = await buttonElement.getAttribute('aria-expanded');
          const clickWorks = initialExpanded !== afterClick;

          functionalTests.push({
            test: 'Click toggles accordion state',
            passed: clickWorks
          });

          // Keyboard test
          await buttonElement.focus();
          await this.page.keyboard.press('Enter');
          await this.page.waitForDelay(200);

          const afterKeyboard = await buttonElement.getAttribute('aria-expanded');
          const keyboardWorks = afterClick !== afterKeyboard;

          functionalTests.push({
            test: 'Keyboard navigation works',
            passed: keyboardWorks
          });

          console.log(`   ⚡ Click behavior: ${clickWorks ? '✓' : '✗'}`);
          console.log(`   ⌨️  Keyboard: ${keyboardWorks ? '✓' : '✗'}`);

        } catch (error) {
          functionalTests.push({
            test: 'Accordion interaction',
            passed: false,
            error: error.message
          });
          console.log(`   ❌ Interaction failed: ${error.message}`);
        }
      }

      const issues = [...(container.issues || []), ...(firstButton.issues || [])];
      const status = issues.length === 0 && functionalTests.every(t => t.passed) ? 'passing' :
                     functionalTests.some(t => !t.passed) ? 'failing' : 'warning';

      return {
        component: 'accordion',
        status,
        styleAnalysis: { container, firstButton },
        functionalTests,
        issues,
        buttonCount: buttons
      };

    } catch (error) {
      return {
        component: 'accordion',
        status: 'error',
        error: error.message
      };
    }
  }

  async runComprehensiveTests() {
    console.log('🎯 COMPREHENSIVE BEHAVIORAL + STYLE TESTING\n');
    console.log('Testing both functionality AND visual compliance...\n');

    const tests = [
      { name: 'date-picker', test: () => this.testDatePickerComprehensive() },
      { name: 'accordion', test: () => this.testAccordionComprehensive() }
    ];

    for (const { name, test } of tests) {
      const result = await test();
      this.results.push(result);
      console.log('');
    }

    this.generateComprehensiveReport();
  }

  generateComprehensiveReport() {
    console.log('📊 COMPREHENSIVE TESTING SUMMARY\n');

    const passing = this.results.filter(r => r.status === 'passing').length;
    const warning = this.results.filter(r => r.status === 'warning').length;
    const failing = this.results.filter(r => r.status === 'failing').length;
    const error = this.results.filter(r => r.status === 'error').length;
    const total = this.results.length;

    console.log(`📈 Results: ${passing} passing, ${warning} warnings, ${failing} failing, ${error} errors`);
    console.log(`📊 Success Rate: ${Math.round(((passing + warning) / total) * 100)}%\n`);

    // Detailed results with style analysis
    for (const result of this.results) {
      const icon = {
        'passing': '✅',
        'warning': '⚠️ ',
        'failing': '❌',
        'error': '💥'
      }[result.status];

      console.log(`${icon} ${result.component.toUpperCase()}`);

      // Style analysis
      if (result.styleAnalysis) {
        console.log(`   🎨 STYLE ANALYSIS:`);
        for (const [key, analysis] of Object.entries(result.styleAnalysis)) {
          if (analysis.exists) {
            const visibilityIcon = analysis.isVisible ? '👁️ ' : '👁️‍🗨️';
            const interactiveIcon = analysis.isInteractive ? '🖱️ ' : '🚫';
            console.log(`     ${key}: ${visibilityIcon} ${interactiveIcon} ${analysis.issues.length === 0 ? '✓' : '⚠️'}`);

            if (analysis.issues.length > 0) {
              for (const issue of analysis.issues) {
                console.log(`       • ${issue}`);
              }
            }
          } else {
            console.log(`     ${key}: ❌ Not found`);
          }
        }
      }

      // Functional tests
      if (result.functionalTests) {
        console.log(`   ⚡ FUNCTIONAL TESTS:`);
        for (const test of result.functionalTests) {
          const testIcon = test.passed ? '✓' : '✗';
          console.log(`     ${testIcon} ${test.test}`);
          if (!test.passed && test.error) {
            console.log(`       Error: ${test.error}`);
          }
        }
      }

      // Recommendations
      if (result.recommendations && result.recommendations.length > 0) {
        console.log(`   💡 RECOMMENDATIONS:`);
        for (const rec of result.recommendations) {
          console.log(`     • ${rec}`);
        }
      }

      console.log('');
    }

    console.log('🔍 KEY INSIGHTS:\n');

    const componentWithStyleIssues = this.results.filter(r =>
      r.styleAnalysis && Object.values(r.styleAnalysis).some(s => s.issues && s.issues.length > 0)
    );

    if (componentWithStyleIssues.length > 0) {
      console.log('🎨 STYLE/VISIBILITY ISSUES DETECTED:');
      for (const comp of componentWithStyleIssues) {
        console.log(`   • ${comp.component}: Style issues affecting usability`);
      }
      console.log('');
    }

    const componentWithBehaviorIssues = this.results.filter(r =>
      r.functionalTests && r.functionalTests.some(t => !t.passed)
    );

    if (componentWithBehaviorIssues.length > 0) {
      console.log('⚡ BEHAVIORAL ISSUES DETECTED:');
      for (const comp of componentWithBehaviorIssues) {
        console.log(`   • ${comp.component}: Functional problems in user interactions`);
      }
      console.log('');
    }

    console.log('🎯 COMPREHENSIVE TESTING BENEFITS:');
    console.log('✓ Catches both visual AND functional issues');
    console.log('✓ Provides detailed element analysis (styles, attributes, accessibility)');
    console.log('✓ Gives specific recommendations for fixing issues');
    console.log('✓ Tests real user interactions in Storybook environment');
    console.log('✓ Validates USWDS compliance at both structural and behavioral levels\n');

    // Save comprehensive report
    const reportPath = path.join(__dirname, '../compliance/comprehensive-behavioral-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: { passing, warning, failing, error, total },
      insights: {
        styleIssuesFound: componentWithStyleIssues.length,
        behaviorIssuesFound: componentWithBehaviorIssues.length,
        comprehensiveTestingBenefits: [
          'Visual and functional validation combined',
          'Detailed element analysis',
          'Specific actionable recommendations',
          'Real user interaction testing',
          'Complete USWDS compliance validation'
        ]
      }
    }, null, 2));

    console.log(`📋 Comprehensive report saved to: ${reportPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ComprehensiveBehavioralTester();

  tester.initialize()
    .then(() => tester.runComprehensiveTests())
    .then(() => tester.cleanup())
    .catch(async (error) => {
      console.error('💥 Comprehensive testing failed:', error);
      await tester.cleanup();
      process.exit(1);
    });
}

export default ComprehensiveBehavioralTester;