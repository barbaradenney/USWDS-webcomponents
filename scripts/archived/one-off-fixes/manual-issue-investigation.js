#!/usr/bin/env node

/**
 * Manual Issue Investigation
 *
 * Direct investigation of specific component issues that automated testing might miss.
 * Focuses on real user interactions and edge cases.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManualIssueInvestigator {
  constructor() {
    this.findings = [];
    this.browser = null;
    this.page = null;
    this.storybookUrl = 'http://localhost:6007'; // Updated port
  }

  async initialize() {
    console.log('🔍 Starting manual issue investigation...\n');
    console.log('This will manually explore components to find real issues.\n');

    try {
      this.browser = await chromium.launch({
        headless: false, // Run visible so we can see what's happening
        timeout: 30000
      });
      this.page = await this.browser.newPage();

      // Wait a moment for Storybook to start
      console.log('⏳ Waiting for Storybook to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('🔍 Connecting to Storybook...');

      await this.page.goto(this.storybookUrl, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      await this.page.waitForSelector('.sidebar-container', { timeout: 10000 });
      console.log('✅ Storybook connected successfully\n');

    } catch (error) {
      console.error('❌ Cannot connect to Storybook:', error.message);
      console.log('💡 Make sure Storybook is running on port 6007');
      throw error;
    }
  }

  async investigateComponent(component, scenarios = []) {
    console.log(`🔍 INVESTIGATING ${component.toUpperCase()}`);
    console.log('=' * 50);

    const findings = {
      component,
      scenarios: [],
      issues: [],
      workingFeatures: []
    };

    for (const scenario of scenarios) {
      console.log(`\n📋 Scenario: ${scenario.name}`);

      try {
        const result = await this.runScenario(component, scenario);
        findings.scenarios.push(result);

        if (result.issues.length > 0) {
          console.log(`❌ Issues found:`);
          for (const issue of result.issues) {
            console.log(`   • ${issue}`);
            findings.issues.push(`${scenario.name}: ${issue}`);
          }
        }

        if (result.workingFeatures.length > 0) {
          console.log(`✅ Working features:`);
          for (const feature of result.workingFeatures) {
            console.log(`   • ${feature}`);
            findings.workingFeatures.push(`${scenario.name}: ${feature}`);
          }
        }

      } catch (error) {
        console.log(`💥 Scenario failed: ${error.message}`);
        findings.issues.push(`${scenario.name}: Test execution failed - ${error.message}`);
      }
    }

    this.findings.push(findings);
    console.log(`\n📊 Summary for ${component}:`);
    console.log(`   Issues: ${findings.issues.length}`);
    console.log(`   Working: ${findings.workingFeatures.length}`);
    console.log('');

    return findings;
  }

  async runScenario(component, scenario) {
    const storyUrl = `${this.storybookUrl}/?path=/story/components-${component}--${scenario.story || 'default'}`;

    console.log(`   📖 Loading: ${storyUrl}`);

    await this.page.goto(storyUrl, {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // Wait for story to render
    await this.page.waitForSelector('#storybook-preview-iframe', { timeout: 5000 });
    const iframe = await this.page.frameLocator('#storybook-preview-iframe');

    const result = {
      scenario: scenario.name,
      issues: [],
      workingFeatures: []
    };

    // Run the scenario's test function
    if (scenario.test) {
      const testResult = await scenario.test(iframe, this.page);
      result.issues = testResult.issues || [];
      result.workingFeatures = testResult.workingFeatures || [];
    }

    return result;
  }

  async investigateAllKnownIssues() {
    console.log('🎯 INVESTIGATING KNOWN COMPONENT ISSUES\n');

    // Date Picker Investigation
    await this.investigateComponent('date-picker', [
      {
        name: 'Basic date input',
        story: 'default',
        test: async (iframe, page) => {
          const issues = [];
          const workingFeatures = [];

          try {
            // Check if input exists and is visible
            const input = iframe.locator('.usa-date-picker input').first();
            const inputVisible = await input.isVisible();

            if (!inputVisible) {
              issues.push('Date input is not visible');
            } else {
              workingFeatures.push('Date input is visible');

              // Test typing
              await input.clear();
              await input.type('12/25/2024');
              await page.waitForDelay(300);

              const value = await input.inputValue();
              console.log(`     🔍 Input value after typing: "${value}"`);

              if (value.includes('12/25/2024') || value.includes('12252024')) {
                workingFeatures.push('Input accepts typed dates');
              } else {
                issues.push(`Input value unexpected: "${value}"`);
              }

              // Test calendar button
              const button = iframe.locator('.usa-date-picker__button').first();
              const buttonVisible = await button.isVisible();

              if (buttonVisible) {
                workingFeatures.push('Calendar button is visible');
                await button.click();
                workingFeatures.push('Calendar button is clickable');
              } else {
                issues.push('Calendar button is not visible');
              }
            }

          } catch (error) {
            issues.push(`Date picker test error: ${error.message}`);
          }

          return { issues, workingFeatures };
        }
      },
      {
        name: 'Date picker with prefilled value',
        story: 'with-prefilled-value',
        test: async (iframe, page) => {
          const issues = [];
          const workingFeatures = [];

          try {
            const input = iframe.locator('.usa-date-picker input').first();
            const value = await input.inputValue();

            console.log(`     🔍 Prefilled value: "${value}"`);

            if (value && value.length > 0) {
              workingFeatures.push(`Prefilled value present: "${value}"`);
            } else {
              issues.push('Prefilled value story has no value');
            }

          } catch (error) {
            issues.push(`Prefilled test error: ${error.message}`);
          }

          return { issues, workingFeatures };
        }
      }
    ]);

    // Accordion Investigation
    await this.investigateComponent('accordion', [
      {
        name: 'Accordion expand/collapse',
        story: 'default',
        test: async (iframe, page) => {
          const issues = [];
          const workingFeatures = [];

          try {
            const buttons = iframe.locator('.usa-accordion__button');
            const buttonCount = await buttons.count();

            if (buttonCount === 0) {
              issues.push('No accordion buttons found');
            } else {
              workingFeatures.push(`Found ${buttonCount} accordion buttons`);

              // Test first button
              const firstButton = buttons.first();
              const initialExpanded = await firstButton.getAttribute('aria-expanded');

              console.log(`     🔍 Initial aria-expanded: "${initialExpanded}"`);

              await firstButton.click();
              await page.waitForDelay(300);

              const afterClickExpanded = await firstButton.getAttribute('aria-expanded');
              console.log(`     🔍 After click aria-expanded: "${afterClickExpanded}"`);

              if (initialExpanded !== afterClickExpanded) {
                workingFeatures.push('Click toggles aria-expanded state');
              } else {
                issues.push('Click does not change aria-expanded state');
              }

              // Check if content becomes visible
              const contentId = await firstButton.getAttribute('aria-controls');
              if (contentId) {
                const content = iframe.locator(`#${contentId}`);
                const contentVisible = await content.isVisible();

                if (afterClickExpanded === 'true' && contentVisible) {
                  workingFeatures.push('Content becomes visible when expanded');
                } else if (afterClickExpanded === 'true' && !contentVisible) {
                  issues.push('Content not visible despite aria-expanded="true"');
                }
              }
            }

          } catch (error) {
            issues.push(`Accordion test error: ${error.message}`);
          }

          return { issues, workingFeatures };
        }
      }
    ]);

    // Modal Investigation
    await this.investigateComponent('modal', [
      {
        name: 'Modal trigger and open behavior',
        story: 'default',
        test: async (iframe, page) => {
          const issues = [];
          const workingFeatures = [];

          try {
            // Look for trigger button
            const trigger = iframe.locator('.usa-button').first();
            const triggerExists = await trigger.count() > 0;

            if (!triggerExists) {
              issues.push('Modal trigger button not found');
            } else {
              workingFeatures.push('Modal trigger button found');

              console.log(`     🔍 Clicking modal trigger...`);
              await trigger.click();
              await page.waitForDelay(500);

              // Check if modal opens
              const modalOverlay = iframe.locator('.usa-modal-overlay');
              const overlayVisible = await modalOverlay.isVisible();

              console.log(`     🔍 Modal overlay visible: ${overlayVisible}`);

              if (overlayVisible) {
                workingFeatures.push('Modal opens on trigger click');

                // Test escape key
                await page.keyboard.press('Escape');
                await page.waitForDelay(300);

                const overlayStillVisible = await modalOverlay.isVisible();

                if (!overlayStillVisible) {
                  workingFeatures.push('Modal closes on Escape key');
                } else {
                  issues.push('Modal does not close on Escape key');
                }

              } else {
                issues.push('Modal does not open when trigger is clicked');
              }
            }

          } catch (error) {
            issues.push(`Modal test error: ${error.message}`);
          }

          return { issues, workingFeatures };
        }
      }
    ]);

    // Combo Box Investigation
    await this.investigateComponent('combo-box', [
      {
        name: 'Combo box filtering and dropdown',
        story: 'default',
        test: async (iframe, page) => {
          const issues = [];
          const workingFeatures = [];

          try {
            const input = iframe.locator('.usa-combo-box input').first();
            const inputExists = await input.count() > 0;

            if (!inputExists) {
              issues.push('Combo box input not found');
            } else {
              workingFeatures.push('Combo box input found');

              // Check initial dropdown state
              const dropdown = iframe.locator('.usa-combo-box__list');
              const initiallyVisible = await dropdown.isVisible();

              console.log(`     🔍 Dropdown initially visible: ${initiallyVisible}`);

              // Type to trigger dropdown
              await input.type('a');
              await page.waitForDelay(500);

              const afterTypingVisible = await dropdown.isVisible();
              const optionCount = await iframe.locator('.usa-combo-box__list-option').count();

              console.log(`     🔍 After typing - dropdown visible: ${afterTypingVisible}, options: ${optionCount}`);

              if (afterTypingVisible) {
                workingFeatures.push('Dropdown opens when typing');
              } else {
                issues.push('Dropdown does not open when typing');
              }

              if (optionCount > 0) {
                workingFeatures.push(`Filtering works (${optionCount} options found)`);
              } else {
                issues.push('No options appear when filtering');
              }
            }

          } catch (error) {
            issues.push(`Combo box test error: ${error.message}`);
          }

          return { issues, workingFeatures };
        }
      }
    ]);

    await this.generateInvestigationReport();
  }

  generateInvestigationReport() {
    console.log('\n🎯 MANUAL INVESTIGATION REPORT');
    console.log('=' * 60);

    let totalIssues = 0;
    let totalWorkingFeatures = 0;

    for (const finding of this.findings) {
      console.log(`\n🔍 ${finding.component.toUpperCase()}`);
      console.log(`   Issues Found: ${finding.issues.length}`);
      console.log(`   Working Features: ${finding.workingFeatures.length}`);

      if (finding.issues.length > 0) {
        console.log(`   ❌ Issues:`);
        for (const issue of finding.issues) {
          console.log(`      • ${issue}`);
        }
      }

      if (finding.workingFeatures.length > 0) {
        console.log(`   ✅ Working:`);
        for (const feature of finding.workingFeatures.slice(0, 3)) { // Show first 3
          console.log(`      • ${feature}`);
        }
        if (finding.workingFeatures.length > 3) {
          console.log(`      • ... and ${finding.workingFeatures.length - 3} more`);
        }
      }

      totalIssues += finding.issues.length;
      totalWorkingFeatures += finding.workingFeatures.length;
    }

    console.log(`\n📊 OVERALL SUMMARY`);
    console.log(`   Total Issues: ${totalIssues}`);
    console.log(`   Total Working Features: ${totalWorkingFeatures}`);

    if (totalIssues === 0) {
      console.log(`\n✅ NO ISSUES FOUND!`);
      console.log(`   This suggests either:`);
      console.log(`   • Components are actually working correctly`);
      console.log(`   • We need to test different scenarios`);
      console.log(`   • Issues occur in specific edge cases or integrations`);
    } else {
      console.log(`\n🚨 REAL ISSUES DISCOVERED!`);
      console.log(`   These are the actual problems affecting users.`);
    }

    // Save detailed report
    const reportPath = path.join(__dirname, '../compliance/manual-investigation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      investigationMethod: 'manual-real-user-interaction',
      findings: this.findings,
      summary: {
        totalIssues,
        totalWorkingFeatures,
        componentsInvestigated: this.findings.length
      }
    }, null, 2));

    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const investigator = new ManualIssueInvestigator();

  investigator.initialize()
    .then(() => investigator.investigateAllKnownIssues())
    .then(() => investigator.cleanup())
    .catch(async (error) => {
      console.error('💥 Investigation failed:', error);
      await investigator.cleanup();
      process.exit(1);
    });
}

export default ManualIssueInvestigator;