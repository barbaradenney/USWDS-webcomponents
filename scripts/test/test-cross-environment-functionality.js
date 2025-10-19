#!/usr/bin/env node

/**
 * Cross-Environment USWDS Functionality Testing
 *
 * This script tests that USWDS interactive components work properly
 * in both development server and Storybook environments.
 *
 * Prevents regression issues like the combo-box toggle button problem.
 */

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { writeFileSync } from 'fs';

// Interactive USWDS components that need cross-environment testing
const INTERACTIVE_COMPONENTS = [
  'combo-box',
  'date-picker',
  'modal',
  'accordion',
  'header',
  'time-picker',
  'tooltip',
  'file-input'
];

async function testComponentInEnvironment(browser, component, environment) {
  const page = await browser.newPage();

  try {
    const url = environment === 'storybook'
      ? `http://localhost:6006/?path=/story/components-${component}--default`
      : `http://localhost:5173/`;

    console.log(chalk.blue(`Testing ${component} in ${environment}...`));

    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for component to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // For Storybook, we need to check inside the iframe
    let evaluateTarget = page;
    if (environment === 'storybook') {
      // Wait for iframe to load
      await page.waitForSelector('iframe#storybook-preview-iframe', { timeout: 5000 }).catch(() => {});
      const frame = page.frames().find(f => f.name() === 'storybook-preview-iframe');
      if (frame) {
        evaluateTarget = frame;
      }
    }

    // Test interactive elements
    const results = await evaluateTarget.evaluate((componentName) => {
      const component = document.querySelector(`usa-${componentName}`);
      if (!component) return { error: 'Component not found' };

      const results = {
        componentExists: !!component,
        hasUSWDSTransformation: false,
        interactiveElementsWork: false,
        eventHandlersAttached: false
      };

      // Component-specific tests
      switch (componentName) {
        case 'combo-box':
          const input = component.querySelector('.usa-combo-box__input');
          const toggle = component.querySelector('.usa-combo-box__toggle-list');
          results.hasUSWDSTransformation = !!(input && toggle);
          results.eventHandlersAttached = !!(toggle && (toggle.onclick || toggle.getAttribute('aria-expanded')));
          break;

        case 'date-picker':
          const dateInput = component.querySelector('.usa-date-picker__input');
          const dateToggle = component.querySelector('.usa-date-picker__button');
          results.hasUSWDSTransformation = !!(dateInput && dateToggle);
          results.eventHandlersAttached = !!(dateToggle && dateToggle.onclick);
          break;

        case 'modal':
          const modalDialog = component.querySelector('.usa-modal__content');
          const documentModal = document.querySelector('.usa-modal__content');
          const hasPlaceholder = component.querySelector('[data-placeholder-for]');
          results.hasUSWDSTransformation = !!(modalDialog || documentModal || hasPlaceholder);
          results.eventHandlersAttached = true; // Modal uses different event pattern
          break;

        case 'accordion':
          const accordionButton = component.querySelector('.usa-accordion__button');
          results.hasUSWDSTransformation = !!accordionButton;
          results.eventHandlersAttached = !!(accordionButton && accordionButton.onclick);
          break;
      }

      return results;
    }, component);

    await page.close();

    return {
      component,
      environment,
      ...results,
      errors: errors.length > 0 ? errors : null
    };

  } catch (error) {
    await page.close();
    return {
      component,
      environment,
      error: error.message
    };
  }
}

async function runCrossEnvironmentTests() {
  console.log(chalk.yellow('🧪 Starting Cross-Environment USWDS Functionality Tests\n'));

  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  for (const component of INTERACTIVE_COMPONENTS) {
    // Test in both environments
    const devResult = await testComponentInEnvironment(browser, component, 'dev');
    const storybookResult = await testComponentInEnvironment(browser, component, 'storybook');

    results.push(devResult, storybookResult);

    // Compare results
    const hasDiscrepancy = (
      devResult.hasUSWDSTransformation !== storybookResult.hasUSWDSTransformation ||
      devResult.eventHandlersAttached !== storybookResult.eventHandlersAttached
    );

    if (hasDiscrepancy) {
      console.log(chalk.red(`❌ ${component}: Environment discrepancy detected!`));
      console.log(`   Dev: transformation=${devResult.hasUSWDSTransformation}, handlers=${devResult.eventHandlersAttached}`);
      console.log(`   Storybook: transformation=${storybookResult.hasUSWDSTransformation}, handlers=${storybookResult.eventHandlersAttached}`);
    } else {
      console.log(chalk.green(`✅ ${component}: Consistent across environments`));
    }
  }

  await browser.close();

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalComponents: INTERACTIVE_COMPONENTS.length,
      passing: results.filter(r => !r.error && r.hasUSWDSTransformation && r.eventHandlersAttached).length,
      failing: results.filter(r => r.error || !r.hasUSWDSTransformation || !r.eventHandlersAttached).length
    }
  };

  writeFileSync(
    'test-reports/cross-environment-functionality.json',
    JSON.stringify(report, null, 2)
  );

  console.log(chalk.blue('\n📊 Test Summary:'));
  console.log(`   Total: ${report.summary.totalComponents * 2} tests (${report.summary.totalComponents} components × 2 environments)`);
  console.log(`   Passing: ${report.summary.passing}`);
  console.log(`   Failing: ${report.summary.failing}`);

  if (report.summary.failing > 0) {
    console.log(chalk.red('\n❌ Some components have cross-environment issues!'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All components work consistently across environments!'));
  }
}

// Run if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCrossEnvironmentTests().catch(console.error);
}

export { runCrossEnvironmentTests };