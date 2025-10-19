#!/usr/bin/env node

/**
 * Component Interaction Testing Script
 *
 * This script automatically tests component interactions in a headless browser
 * to catch JavaScript issues like the accordion button problem we fixed.
 *
 * Usage:
 *   npm run test:interactions
 *   npm run test:interactions -- --component=accordion
 *   npm run test:interactions -- --verbose
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const STORYBOOK_URL = 'http://localhost:6007';
const DEV_SERVER_URL = 'http://localhost:5173';

// Component interaction test configurations
const INTERACTION_TESTS = {
  accordion: {
    storybookStory: 'components-accordion--default',
    devPagePath: '/debug-accordion-fix.html',
    tests: [
      {
        name: 'Button Click Response',
        action: async (page) => {
          const button = await page.$('.usa-accordion__button[aria-expanded="false"]');
          if (!button) throw new Error('No collapsed accordion button found');

          const initialExpanded = await button.getAttribute('aria-expanded');
          await button.click();
          await page.waitForDelay(200);

          const finalExpanded = await button.getAttribute('aria-expanded');
          if (initialExpanded === finalExpanded) {
            throw new Error(`Button not responding to clicks: ${initialExpanded} -> ${finalExpanded}`);
          }

          return { success: true, details: `${initialExpanded} -> ${finalExpanded}` };
        }
      },
      {
        name: 'Keyboard Interaction',
        action: async (page) => {
          const button = await page.$('.usa-accordion__button[aria-expanded="false"]');
          if (!button) throw new Error('No collapsed accordion button found');

          await button.focus();
          const initialExpanded = await button.getAttribute('aria-expanded');

          await page.keyboard.press('Enter');
          await page.waitForDelay(200);

          const finalExpanded = await button.getAttribute('aria-expanded');
          if (initialExpanded === finalExpanded) {
            throw new Error(`Keyboard not working: ${initialExpanded} -> ${finalExpanded}`);
          }

          return { success: true, details: `Keyboard: ${initialExpanded} -> ${finalExpanded}` };
        }
      },
      {
        name: 'USWDS Integration Detection',
        action: async (page) => {
          // Monitor console for USWDS messages
          const consoleLogs = [];
          page.on('console', msg => {
            consoleLogs.push(msg.text());
          });

          // Wait for component initialization
          await page.waitForDelay(500);

          const hasUSWDSMessage = consoleLogs.some(log =>
            log.includes('✅ USWDS accordion') ||
            log.includes('✅ Using pre-loaded USWDS') ||
            log.includes('✅ Pre-loaded USWDS accordion module')
          );

          return {
            success: true,
            details: hasUSWDSMessage ? 'USWDS integration detected' : 'USWDS integration not detected',
            uswdsDetected: hasUSWDSMessage,
            consoleLogs: consoleLogs.filter(log => log.includes('USWDS'))
          };
        }
      },
      {
        name: 'Event Dispatching',
        action: async (page) => {
          // Set up event listener
          await page.evaluate(() => {
            window.testEventCaught = false;
            const accordion = document.querySelector('usa-accordion');
            if (accordion) {
              accordion.addEventListener('accordion-toggle', () => {
                window.testEventCaught = true;
              });
            }
          });

          const button = await page.$('.usa-accordion__button');
          await button.click();
          await page.waitForDelay(200);

          const eventCaught = await page.evaluate(() => window.testEventCaught);

          return {
            success: eventCaught,
            details: eventCaught ? 'Events dispatched' : 'No events dispatched'
          };
        }
      }
    ]
  },
  // Add more components here
  modal: {
    storybookStory: 'components-modal--default',
    devPagePath: '/debug-modal.html',
    tests: [
      {
        name: 'Modal Open/Close',
        action: async (page) => {
          const trigger = await page.$('[data-open-modal]');
          if (!trigger) throw new Error('No modal trigger found');

          await trigger.click();
          await page.waitForDelay(200);

          const modal = await page.$('.usa-modal[aria-hidden="false"]');
          if (!modal) throw new Error('Modal did not open');

          return { success: true, details: 'Modal opens correctly' };
        }
      }
    ]
  }
};

async function testComponentInteraction(browser, componentName, environment) {
  const config = INTERACTION_TESTS[componentName];
  if (!config) {
    throw new Error(`No test configuration found for component: ${componentName}`);
  }

  const page = await browser.newPage();
  const results = [];

  try {
    // Navigate to test environment
    if (environment === 'storybook') {
      const url = `${STORYBOOK_URL}/iframe.html?args=&id=${config.storybookStory}&viewMode=story`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    } else {
      const url = `${DEV_SERVER_URL}${config.devPagePath}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    }

    console.log(`  📍 Testing in ${environment}: ${componentName}`);

    // Run each test
    for (const test of config.tests) {
      try {
        console.log(`    🧪 Running: ${test.name}`);
        const result = await test.action(page);

        results.push({
          testName: test.name,
          success: result.success,
          details: result.details,
          environment,
          component: componentName,
          ...result
        });

        console.log(`    ✅ ${test.name}: ${result.details}`);
      } catch (error) {
        results.push({
          testName: test.name,
          success: false,
          details: error.message,
          environment,
          component: componentName,
          error: error.message
        });

        console.log(`    ❌ ${test.name}: ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`    🚨 Navigation failed: ${error.message}`);
    results.push({
      testName: 'Navigation',
      success: false,
      details: error.message,
      environment,
      component: componentName,
      error: error.message
    });
  } finally {
    await page.close();
  }

  return results;
}

async function checkServerAvailability(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const componentFilter = args.find(arg => arg.startsWith('--component='))?.split('=')[1];

  console.log('🧪 Component Interaction Testing');
  console.log('==================================');

  // Check server availability
  const storybookAvailable = await checkServerAvailability(STORYBOOK_URL);
  const devServerAvailable = await checkServerAvailability(DEV_SERVER_URL);

  console.log(`📍 Storybook (${STORYBOOK_URL}): ${storybookAvailable ? '✅ Available' : '❌ Not available'}`);
  console.log(`📍 Dev Server (${DEV_SERVER_URL}): ${devServerAvailable ? '✅ Available' : '❌ Not available'}`);

  if (!storybookAvailable && !devServerAvailable) {
    console.error('❌ No servers available for testing');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const allResults = [];
  const componentsToTest = componentFilter
    ? [componentFilter]
    : Object.keys(INTERACTION_TESTS);

  try {
    for (const componentName of componentsToTest) {
      console.log(`\\n🔧 Testing Component: ${componentName.toUpperCase()}`);

      // Test in both environments if available
      if (storybookAvailable) {
        const storybookResults = await testComponentInteraction(browser, componentName, 'storybook');
        allResults.push(...storybookResults);
      }

      if (devServerAvailable) {
        const devResults = await testComponentInteraction(browser, componentName, 'dev');
        allResults.push(...devResults);
      }
    }

    // Generate report
    console.log('\\n📊 Test Results Summary');
    console.log('========================');

    const passed = allResults.filter(r => r.success);
    const failed = allResults.filter(r => !r.success);

    console.log(`✅ Passed: ${passed.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📊 Total: ${allResults.length}`);

    if (failed.length > 0) {
      console.log('\\n🚨 Failed Tests:');
      failed.forEach(result => {
        console.log(`  • ${result.component}/${result.environment}/${result.testName}: ${result.details}`);
      });
    }

    if (verbose) {
      console.log('\\n📝 Detailed Results:');
      console.log(JSON.stringify(allResults, null, 2));
    }

    // Save results
    const fs = await import('fs');
    const resultsPath = join(projectRoot, 'interaction-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { passed: passed.length, failed: failed.length, total: allResults.length },
      results: allResults
    }, null, 2));

    console.log(`\\n💾 Results saved to: ${resultsPath}`);

    // Exit with error code if tests failed
    process.exit(failed.length > 0 ? 1 : 0);

  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
}

export { main as testComponentInteractions };