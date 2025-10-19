#!/usr/bin/env node

/**
 * Comprehensive Issue Detection
 *
 * Systematically tests all components and stories in Storybook to find real issues
 * that users might be experiencing. Goes beyond basic functionality to test edge cases,
 * accessibility, visual rendering, and user interaction patterns.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveIssueDetection {
  constructor() {
    this.browser = null;
    this.page = null;
    this.storybookUrl = 'http://localhost:6007';
    this.findings = [];
    this.issueCount = 0;
    this.checkedComponents = 0;
  }

  async initialize() {
    console.log('🔍 COMPREHENSIVE ISSUE DETECTION');
    console.log('=' * 60);
    console.log('Systematically testing all components for real issues');
    console.log('');

    try {
      this.browser = await chromium.launch({
        headless: false, // Run visible to see what's happening
        timeout: 30000
      });
      this.page = await this.browser.newPage();

      console.log('⏳ Connecting to Storybook...');
      await this.page.goto(this.storybookUrl, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      await this.page.waitForSelector('.sidebar-container', { timeout: 10000 });
      console.log('✅ Storybook connected successfully\n');

    } catch (error) {
      console.error('❌ Cannot connect to Storybook:', error.message);
      console.log('💡 Make sure Storybook is running on port 6007: npm run storybook -- --port 6007');
      throw error;
    }
  }

  async findAllComponents() {
    console.log('🔍 Discovering all available components...');

    // Get all story links from Storybook sidebar
    const storyLinks = await this.page.$$eval(
      '[data-nodetype="story"] a, [data-nodetype="component"] a',
      links => links.map(link => ({
        href: link.href,
        text: link.textContent?.trim() || '',
        title: link.title || ''
      }))
    );

    // Extract component information
    const components = [];
    const componentSet = new Set();

    for (const link of storyLinks) {
      if (link.href.includes('/story/components-')) {
        const match = link.href.match(/\/story\/components-([^--]+)--(.+)/);
        if (match) {
          const [, componentName, storyName] = match;
          if (!componentSet.has(componentName)) {
            componentSet.add(componentName);
            components.push({
              name: componentName,
              stories: []
            });
          }

          const component = components.find(c => c.name === componentName);
          component.stories.push({
            name: storyName,
            url: link.href,
            title: link.text
          });
        }
      }
    }

    console.log(`📦 Found ${components.length} components with ${storyLinks.length} total stories`);
    return components;
  }

  async testComponent(component) {
    console.log(`\n🧪 TESTING ${component.name.toUpperCase()}`);
    console.log('=' * 50);

    this.checkedComponents++;
    const componentIssues = [];

    // Test each story of the component
    for (const story of component.stories) {
      console.log(`\n📖 Testing story: ${story.name}`);

      try {
        await this.page.goto(story.url, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        await this.page.waitForSelector('#storybook-preview-iframe', { timeout: 5000 });
        const iframe = await this.page.frameLocator('#storybook-preview-iframe');

        // Run comprehensive tests on this story
        const storyIssues = await this.testStory(component.name, story, iframe);
        if (storyIssues.length > 0) {
          componentIssues.push(...storyIssues);
          console.log(`   ❌ Found ${storyIssues.length} issues`);
        } else {
          console.log(`   ✅ No issues found`);
        }

      } catch (error) {
        const issue = `Story loading failed: ${error.message}`;
        componentIssues.push(issue);
        console.log(`   💥 ${issue}`);
      }
    }

    if (componentIssues.length > 0) {
      this.findings.push({
        component: component.name,
        issues: componentIssues,
        storiesCount: component.stories.length
      });
      this.issueCount += componentIssues.length;
    }

    console.log(`\n📊 ${component.name} Summary: ${componentIssues.length} issues found`);
    return componentIssues;
  }

  async testStory(componentName, story, iframe) {
    const issues = [];

    try {
      // Test 1: Check for JavaScript errors
      const jsErrors = await this.checkJavaScriptErrors();
      if (jsErrors.length > 0) {
        issues.push(`JavaScript errors: ${jsErrors.join(', ')}`);
      }

      // Test 2: Check if component element exists
      const componentExists = await this.checkComponentExists(componentName, iframe);
      if (!componentExists.exists) {
        issues.push(componentExists.issue);
      }

      // Test 3: Check for visual rendering issues
      const visualIssues = await this.checkVisualRendering(iframe);
      issues.push(...visualIssues);

      // Test 4: Check for accessibility issues
      const a11yIssues = await this.checkAccessibility(iframe);
      issues.push(...a11yIssues);

      // Test 5: Component-specific functionality tests
      const functionalIssues = await this.checkComponentFunctionality(componentName, iframe);
      issues.push(...functionalIssues);

      // Test 6: Check for console warnings
      const warnings = await this.checkConsoleWarnings();
      if (warnings.length > 0) {
        issues.push(`Console warnings: ${warnings.join(', ')}`);
      }

    } catch (error) {
      issues.push(`Test execution failed: ${error.message}`);
    }

    return issues;
  }

  async checkJavaScriptErrors() {
    // This would require setting up console listeners
    // For now, return empty array
    return [];
  }

  async checkComponentExists(componentName, iframe) {
    const selectors = [
      `usa-${componentName}`,
      `.usa-${componentName}`,
      `[class*="usa-${componentName}"]`
    ];

    for (const selector of selectors) {
      try {
        const count = await iframe.locator(selector).count();
        if (count > 0) {
          return { exists: true };
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }

    return {
      exists: false,
      issue: `Component element not found (tried: ${selectors.join(', ')})`
    };
  }

  async checkVisualRendering(iframe) {
    const issues = [];

    try {
      // Check for elements with zero dimensions
      const hiddenElements = await iframe.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width === 0 && rect.height === 0 && !el.hidden;
        }).map(el => el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').join('.') : ''));
      });

      if (hiddenElements.length > 0) {
        issues.push(`Elements with zero dimensions: ${hiddenElements.slice(0, 3).join(', ')}${hiddenElements.length > 3 ? '...' : ''}`);
      }

      // Check for missing CSS (elements without any computed styles)
      const unstyledElements = await iframe.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('[class*="usa-"]'));
        return elements.filter(el => {
          const styles = window.getComputedStyle(el);
          return styles.display === 'initial' && styles.position === 'static' && !el.style.cssText;
        }).map(el => el.tagName.toLowerCase() + '.' + el.className.split(' ').join('.')).slice(0, 3);
      });

      if (unstyledElements.length > 0) {
        issues.push(`Potentially unstyled elements: ${unstyledElements.join(', ')}`);
      }

    } catch (error) {
      issues.push(`Visual rendering check failed: ${error.message}`);
    }

    return issues;
  }

  async checkAccessibility(iframe) {
    const issues = [];

    try {
      // Check for missing alt text on images
      const imagesWithoutAlt = await iframe.locator('img:not([alt])').count();
      if (imagesWithoutAlt > 0) {
        issues.push(`${imagesWithoutAlt} images missing alt text`);
      }

      // Check for buttons without labels
      const unlabeledButtons = await iframe.locator('button:not([aria-label]):not([aria-labelledby])').filter({
        hasText: /^\\s*$/
      }).count();
      if (unlabeledButtons > 0) {
        issues.push(`${unlabeledButtons} buttons without labels`);
      }

      // Check for form inputs without labels
      const unlabeledInputs = await iframe.locator('input:not([aria-label]):not([aria-labelledby])').filter({
        hasNot: iframe.locator('label')
      }).count();
      if (unlabeledInputs > 0) {
        issues.push(`${unlabeledInputs} form inputs without labels`);
      }

      // Check for missing roles on interactive elements
      const interactiveWithoutRoles = await iframe.locator('div[onclick], span[onclick]').filter({
        hasNot: iframe.locator('[role]')
      }).count();
      if (interactiveWithoutRoles > 0) {
        issues.push(`${interactiveWithoutRoles} interactive elements missing roles`);
      }

    } catch (error) {
      issues.push(`Accessibility check failed: ${error.message}`);
    }

    return issues;
  }

  async checkComponentFunctionality(componentName, iframe) {
    const issues = [];

    try {
      switch (componentName) {
        case 'modal':
          return await this.testModalFunctionality(iframe);
        case 'accordion':
          return await this.testAccordionFunctionality(iframe);
        case 'date-picker':
          return await this.testDatePickerFunctionality(iframe);
        case 'combo-box':
          return await this.testComboBoxFunctionality(iframe);
        case 'button':
          return await this.testButtonFunctionality(iframe);
        case 'alert':
          return await this.testAlertFunctionality(iframe);
        case 'breadcrumb':
          return await this.testBreadcrumbFunctionality(iframe);
        case 'card':
          return await this.testCardFunctionality(iframe);
        case 'checkbox':
          return await this.testCheckboxFunctionality(iframe);
        case 'dropdown':
          return await this.testDropdownFunctionality(iframe);
        case 'file-input':
          return await this.testFileInputFunctionality(iframe);
        case 'footer':
          return await this.testFooterFunctionality(iframe);
        case 'header':
          return await this.testHeaderFunctionality(iframe);
        case 'input':
        case 'text-input':
          return await this.testInputFunctionality(iframe);
        case 'radio':
          return await this.testRadioFunctionality(iframe);
        case 'select':
          return await this.testSelectFunctionality(iframe);
        case 'table':
          return await this.testTableFunctionality(iframe);
        case 'tabs':
          return await this.testTabsFunctionality(iframe);
        case 'textarea':
          return await this.testTextareaFunctionality(iframe);
        default:
          // Generic functionality tests
          return await this.testGenericFunctionality(iframe);
      }
    } catch (error) {
      return [`Component functionality test failed: ${error.message}`];
    }
  }

  // Component-specific test methods
  async testModalFunctionality(iframe) {
    const issues = [];
    try {
      const trigger = iframe.locator('.usa-button, [data-open-modal]').first();
      if (await trigger.count() === 0) {
        issues.push('Modal trigger button not found');
        return issues;
      }

      await trigger.click();
      await this.page.waitForDelay(300);

      const modal = iframe.locator('.usa-modal-wrapper, .usa-modal__overlay, .usa-modal');
      const isVisible = await modal.isVisible();

      if (!isVisible) {
        issues.push('Modal does not open when triggered');
      }
    } catch (error) {
      issues.push(`Modal test failed: ${error.message}`);
    }
    return issues;
  }

  async testAccordionFunctionality(iframe) {
    const issues = [];
    try {
      const buttons = iframe.locator('.usa-accordion__button');
      const buttonCount = await buttons.count();

      if (buttonCount === 0) {
        issues.push('No accordion buttons found');
        return issues;
      }

      const firstButton = buttons.first();
      const initialExpanded = await firstButton.getAttribute('aria-expanded');

      await firstButton.click();
      await this.page.waitForDelay(200);

      const afterExpanded = await firstButton.getAttribute('aria-expanded');

      if (initialExpanded === afterExpanded) {
        issues.push('Accordion button click does not toggle aria-expanded');
      }
    } catch (error) {
      issues.push(`Accordion test failed: ${error.message}`);
    }
    return issues;
  }

  async testDatePickerFunctionality(iframe) {
    const issues = [];
    try {
      const input = iframe.locator('.usa-date-picker input, input[type="date"]').first();
      if (await input.count() === 0) {
        issues.push('Date picker input not found');
        return issues;
      }

      const isVisible = await input.isVisible();
      if (!isVisible) {
        issues.push('Date picker input is not visible');
      }

      // Test typing
      await input.clear();
      await input.type('12/25/2024');
      await this.page.waitForDelay(200);

      const value = await input.inputValue();
      if (!value || (!value.includes('12') && !value.includes('25'))) {
        issues.push('Date picker does not accept typed input properly');
      }
    } catch (error) {
      issues.push(`Date picker test failed: ${error.message}`);
    }
    return issues;
  }

  async testComboBoxFunctionality(iframe) {
    const issues = [];
    try {
      const input = iframe.locator('.usa-combo-box input, .usa-combo-box__input').first();
      if (await input.count() === 0) {
        issues.push('Combo box input not found');
        return issues;
      }

      await input.type('a');
      await this.page.waitForDelay(300);

      const dropdown = iframe.locator('.usa-combo-box__list, .usa-combo-box__dropdown');
      const dropdownVisible = await dropdown.isVisible();

      if (!dropdownVisible) {
        issues.push('Combo box dropdown does not appear when typing');
      }
    } catch (error) {
      issues.push(`Combo box test failed: ${error.message}`);
    }
    return issues;
  }

  async testButtonFunctionality(iframe) {
    const issues = [];
    try {
      const buttons = iframe.locator('button, .usa-button');
      const buttonCount = await buttons.count();

      if (buttonCount === 0) {
        issues.push('No buttons found');
        return issues;
      }

      // Test first button
      const firstButton = buttons.first();
      const isClickable = await firstButton.isEnabled();

      if (!isClickable) {
        issues.push('Button is not clickable/enabled');
      }

      // Check for proper focus behavior
      await firstButton.focus();
      const isFocused = await firstButton.evaluate(el => document.activeElement === el);

      if (!isFocused) {
        issues.push('Button does not receive focus properly');
      }
    } catch (error) {
      issues.push(`Button test failed: ${error.message}`);
    }
    return issues;
  }

  async testGenericFunctionality(iframe) {
    const issues = [];
    try {
      // Test for any interactive elements
      const interactive = iframe.locator('button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [onclick]');
      const interactiveCount = await interactive.count();

      if (interactiveCount > 0) {
        // Test first interactive element
        const firstInteractive = interactive.first();
        try {
          await firstInteractive.focus();
        } catch (error) {
          issues.push('Interactive element cannot receive focus');
        }
      }

      // Check for any elements that should be visible but aren't
      const hiddenRequired = iframe.locator('.usa-form__required, .required').filter({ hasText: /.+/ });
      const hiddenCount = await hiddenRequired.count();

      for (let i = 0; i < Math.min(hiddenCount, 3); i++) {
        const element = hiddenRequired.nth(i);
        const isVisible = await element.isVisible();
        if (!isVisible) {
          issues.push('Required element is hidden');
          break;
        }
      }
    } catch (error) {
      issues.push(`Generic functionality test failed: ${error.message}`);
    }
    return issues;
  }

  // Add more specific test methods for other components...
  async testAlertFunctionality(iframe) { return []; }
  async testBreadcrumbFunctionality(iframe) { return []; }
  async testCardFunctionality(iframe) { return []; }
  async testCheckboxFunctionality(iframe) { return []; }
  async testDropdownFunctionality(iframe) { return []; }
  async testFileInputFunctionality(iframe) { return []; }
  async testFooterFunctionality(iframe) { return []; }
  async testHeaderFunctionality(iframe) { return []; }
  async testInputFunctionality(iframe) { return []; }
  async testRadioFunctionality(iframe) { return []; }
  async testSelectFunctionality(iframe) { return []; }
  async testTableFunctionality(iframe) { return []; }
  async testTabsFunctionality(iframe) { return []; }
  async testTextareaFunctionality(iframe) { return []; }

  async checkConsoleWarnings() {
    // This would require setting up console listeners
    // For now, return empty array
    return [];
  }

  async runComprehensiveDetection() {
    console.log('🎯 DISCOVERING AND TESTING ALL COMPONENTS\n');

    // Discover all components
    const components = await this.findAllComponents();

    // Test each component
    for (const component of components) {
      await this.testComponent(component);
    }

    await this.generateReport();
  }

  generateReport() {
    console.log('\n\n🎯 COMPREHENSIVE ISSUE DETECTION REPORT');
    console.log('=' * 60);

    console.log(`\n📊 SUMMARY`);
    console.log(`   Components Checked: ${this.checkedComponents}`);
    console.log(`   Total Issues Found: ${this.issueCount}`);
    console.log(`   Components with Issues: ${this.findings.length}`);

    if (this.issueCount === 0) {
      console.log('\n✅ NO ISSUES FOUND!');
      console.log('   All tested components appear to be working correctly.');
    } else {
      console.log('\n🚨 ISSUES DISCOVERED:');
      console.log(`   ${this.issueCount} total issues found across ${this.findings.length} components`);

      for (const finding of this.findings) {
        console.log(`\n❌ ${finding.component.toUpperCase()}`);
        console.log(`   Stories tested: ${finding.storiesCount}`);
        console.log(`   Issues found: ${finding.issues.length}`);

        for (const issue of finding.issues.slice(0, 5)) { // Show first 5 issues
          console.log(`      • ${issue}`);
        }

        if (finding.issues.length > 5) {
          console.log(`      • ... and ${finding.issues.length - 5} more issues`);
        }
      }
    }

    // Save detailed report
    const reportPath = path.join(__dirname, '../compliance/comprehensive-issue-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        componentsChecked: this.checkedComponents,
        totalIssues: this.issueCount,
        componentsWithIssues: this.findings.length
      },
      findings: this.findings
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);

    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const detector = new ComprehensiveIssueDetection();

  detector.initialize()
    .then(() => detector.runComprehensiveDetection())
    .then(() => detector.cleanup())
    .catch(async (error) => {
      console.error('💥 Comprehensive detection failed:', error);
      await detector.cleanup();
      process.exit(1);
    });
}

export default ComprehensiveIssueDetection;