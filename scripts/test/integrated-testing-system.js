#!/usr/bin/env node

/**
 * Integrated Testing System
 *
 * Combines USWDS compliance validation with behavioral testing to ensure
 * components work properly from both compliance and functional perspectives.
 *
 * This addresses the user's request:
 * "I'd like to see the testing and USWDS validation working together
 *  to make sure all the components are working as they should"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntegratedTestingSystem {
  constructor() {
    this.browser = null;
    this.page = null;
    this.storybookUrl = 'http://localhost:6007';
    this.results = {
      timestamp: new Date().toISOString(),
      components: [],
      summary: {
        total: 0,
        passing: 0,
        warnings: 0,
        failing: 0,
        compliance: { passed: 0, failed: 0 },
        behavioral: { passed: 0, failed: 0 }
      }
    };
  }

  async initialize() {
    console.log('🔄 INTEGRATED TESTING SYSTEM');
    console.log('=' * 60);
    console.log('Combining USWDS compliance validation with behavioral testing');
    console.log('');

    try {
      this.browser = await chromium.launch({
        headless: true,
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
      console.log('💡 Make sure Storybook is running on port 6007');
      throw error;
    }
  }

  async testComponent(componentName, tests) {
    console.log(`🧪 TESTING ${componentName.toUpperCase()}`);
    console.log('=' * 50);

    const componentResult = {
      component: componentName,
      compliance: {},
      behavioral: {},
      overall: { status: 'passing', issues: [], recommendations: [] }
    };

    // Step 1: Run USWDS Compliance Testing
    console.log('📋 Step 1: USWDS Compliance Validation');
    componentResult.compliance = await this.runComplianceTests(componentName);

    // Step 2: Run Behavioral Testing
    console.log('🎯 Step 2: Behavioral Functionality Testing');
    componentResult.behavioral = await this.runBehavioralTests(componentName, tests);

    // Step 3: Combine Results
    console.log('🔍 Step 3: Integrated Analysis');
    this.combineResults(componentResult);

    this.results.components.push(componentResult);
    this.updateSummary(componentResult);

    console.log(`📊 ${componentName} Results:`);
    console.log(`   Compliance: ${componentResult.compliance.status || 'unknown'}`);
    console.log(`   Behavioral: ${componentResult.behavioral.status || 'unknown'}`);
    console.log(`   Overall: ${componentResult.overall.status}`);
    console.log('');

    return componentResult;
  }

  async runComplianceTests(componentName) {
    try {
      // Simple compliance check - verify component structure
      const storyUrl = `${this.storybookUrl}/?path=/story/components-${componentName}--default`;
      await this.page.goto(storyUrl, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      await this.page.waitForSelector('#storybook-preview-iframe', { timeout: 5000 });
      const iframe = await this.page.frameLocator('#storybook-preview-iframe');

      // Basic structural compliance checks
      const componentSelector = `usa-${componentName}`;
      const componentExists = await iframe.locator(componentSelector).count() > 0;

      if (!componentExists) {
        return {
          status: 'failing',
          error: `Component ${componentSelector} not found`,
          criticalIssues: 1,
          recommendations: [`Ensure ${componentSelector} element is present in story`]
        };
      }

      // Check for basic USWDS classes
      const hasUSWDSClasses = await iframe.locator(`[class*="usa-${componentName}"]`).count() > 0;

      if (!hasUSWDSClasses) {
        return {
          status: 'warning',
          criticalIssues: 0,
          recommendations: [`Consider adding USWDS CSS classes for ${componentName}`]
        };
      }

      return {
        status: 'passing',
        criticalIssues: 0,
        recommendations: ['Component meets basic USWDS structural requirements']
      };

    } catch (error) {
      console.warn(`⚠️ Compliance testing failed for ${componentName}:`, error.message);
      return {
        status: 'error',
        error: error.message,
        criticalIssues: 1
      };
    }
  }

  async runBehavioralTests(componentName, tests) {
    const results = {
      status: 'passing',
      scenarios: [],
      issues: [],
      workingFeatures: []
    };

    try {
      for (const test of tests) {
        console.log(`   🔍 Testing: ${test.name}`);

        const storyUrl = `${this.storybookUrl}/?path=/story/components-${componentName}--${test.story || 'default'}`;
        await this.page.goto(storyUrl, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        await this.page.waitForSelector('#storybook-preview-iframe', { timeout: 5000 });
        const iframe = await this.page.frameLocator('#storybook-preview-iframe');

        const scenarioResult = {
          scenario: test.name,
          issues: [],
          workingFeatures: []
        };

        if (test.test) {
          const testResult = await test.test(iframe, this.page);
          scenarioResult.issues = testResult.issues || [];
          scenarioResult.workingFeatures = testResult.workingFeatures || [];
        }

        results.scenarios.push(scenarioResult);
        results.issues.push(...scenarioResult.issues);
        results.workingFeatures.push(...scenarioResult.workingFeatures);

        // Log immediate results
        if (scenarioResult.issues.length > 0) {
          console.log(`     ❌ Issues: ${scenarioResult.issues.length}`);
        }
        if (scenarioResult.workingFeatures.length > 0) {
          console.log(`     ✅ Working: ${scenarioResult.workingFeatures.length}`);
        }
      }

      results.status = results.issues.length === 0 ? 'passing' : 'failing';

    } catch (error) {
      console.warn(`⚠️ Behavioral testing failed for ${componentName}:`, error.message);
      results.status = 'error';
      results.error = error.message;
    }

    return results;
  }

  combineResults(componentResult) {
    const { compliance, behavioral } = componentResult;

    // Determine overall status
    let overallStatus = 'passing';
    const allIssues = [];
    const recommendations = [];

    // Check compliance status
    if (compliance.status === 'failing' || compliance.status === 'error') {
      overallStatus = 'failing';
      allIssues.push(`Compliance: ${compliance.status}`);
    } else if (compliance.status === 'warning') {
      if (overallStatus === 'passing') overallStatus = 'warning';
      recommendations.push('Address compliance warnings');
    }

    // Check behavioral status
    if (behavioral.status === 'failing' || behavioral.status === 'error') {
      overallStatus = 'failing';
      allIssues.push(`Behavioral: ${behavioral.status}`);
    }

    // Combine behavioral issues
    if (behavioral.issues && behavioral.issues.length > 0) {
      allIssues.push(...behavioral.issues);
    }

    // Check for consistency between compliance and behavioral results
    const compliancePassing = compliance.status === 'passing';
    const behavioralPassing = behavioral.status === 'passing';

    if (compliancePassing && !behavioralPassing) {
      allIssues.push('⚠️ Compliance passes but behavioral tests fail - component may have functional issues despite structural compliance');
    } else if (!compliancePassing && behavioralPassing) {
      allIssues.push('⚠️ Behavioral tests pass but compliance fails - component works but may not meet USWDS standards');
    } else if (compliancePassing && behavioralPassing) {
      recommendations.push('Component passes both compliance and behavioral validation ✅');
    }

    componentResult.overall = {
      status: overallStatus,
      issues: allIssues,
      recommendations: [...(compliance.recommendations || []), ...recommendations]
    };
  }

  updateSummary(componentResult) {
    this.results.summary.total++;

    switch (componentResult.overall.status) {
      case 'passing':
        this.results.summary.passing++;
        break;
      case 'warning':
        this.results.summary.warnings++;
        break;
      case 'failing':
        this.results.summary.failing++;
        break;
    }

    // Update compliance/behavioral counters
    if (componentResult.compliance.status === 'passing') {
      this.results.summary.compliance.passed++;
    } else {
      this.results.summary.compliance.failed++;
    }

    if (componentResult.behavioral.status === 'passing') {
      this.results.summary.behavioral.passed++;
    } else {
      this.results.summary.behavioral.failed++;
    }
  }

  async runIntegratedTests() {
    console.log('🎯 RUNNING INTEGRATED COMPONENT TESTS\n');

    // Test key components that should have both compliance and behavior
    const components = [
      {
        name: 'modal',
        tests: [
          {
            name: 'Modal trigger and functionality',
            story: 'default',
            test: async (iframe, page) => {
              const issues = [];
              const workingFeatures = [];

              try {
                // Find trigger button
                const trigger = iframe.locator('.usa-button').first();
                if (await trigger.count() === 0) {
                  issues.push('Modal trigger button not found');
                  return { issues, workingFeatures };
                }
                workingFeatures.push('Modal trigger button found');

                // Test modal opening
                await trigger.click();
                await page.waitForDelay(300);

                const modalOverlay = iframe.locator('.usa-modal-overlay');
                const overlayVisible = await modalOverlay.isVisible();

                if (overlayVisible) {
                  workingFeatures.push('Modal opens on trigger click');

                  // Test escape key functionality
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

              } catch (error) {
                issues.push(`Modal test error: ${error.message}`);
              }

              return { issues, workingFeatures };
            }
          }
        ]
      },
      {
        name: 'accordion',
        tests: [
          {
            name: 'Accordion expand/collapse behavior',
            story: 'default',
            test: async (iframe, page) => {
              const issues = [];
              const workingFeatures = [];

              try {
                const buttons = iframe.locator('.usa-accordion__button');
                const buttonCount = await buttons.count();

                if (buttonCount === 0) {
                  issues.push('No accordion buttons found');
                  return { issues, workingFeatures };
                }
                workingFeatures.push(`Found ${buttonCount} accordion buttons`);

                // Test first button
                const firstButton = buttons.first();
                const initialExpanded = await firstButton.getAttribute('aria-expanded');

                await firstButton.click();
                await page.waitForDelay(200);

                const afterClickExpanded = await firstButton.getAttribute('aria-expanded');

                if (initialExpanded !== afterClickExpanded) {
                  workingFeatures.push('Click toggles aria-expanded state');
                } else {
                  issues.push('Click does not change aria-expanded state');
                }

                // Test content visibility
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

              } catch (error) {
                issues.push(`Accordion test error: ${error.message}`);
              }

              return { issues, workingFeatures };
            }
          }
        ]
      },
      {
        name: 'combo-box',
        tests: [
          {
            name: 'Combo box filtering and interaction',
            story: 'default',
            test: async (iframe, page) => {
              const issues = [];
              const workingFeatures = [];

              try {
                const input = iframe.locator('.usa-combo-box input').first();
                if (await input.count() === 0) {
                  issues.push('Combo box input not found');
                  return { issues, workingFeatures };
                }
                workingFeatures.push('Combo box input found');

                // Test dropdown functionality
                const dropdown = iframe.locator('.usa-combo-box__list');
                await input.type('a');
                await page.waitForDelay(300);

                const afterTypingVisible = await dropdown.isVisible();
                const optionCount = await iframe.locator('.usa-combo-box__list-option').count();

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

              } catch (error) {
                issues.push(`Combo box test error: ${error.message}`);
              }

              return { issues, workingFeatures };
            }
          }
        ]
      },
      {
        name: 'date-picker',
        tests: [
          {
            name: 'Date picker input and calendar functionality',
            story: 'default',
            test: async (iframe, page) => {
              const issues = [];
              const workingFeatures = [];

              try {
                // Test basic input
                const input = iframe.locator('.usa-date-picker input').first();
                if (await input.count() === 0) {
                  issues.push('Date input not found');
                  return { issues, workingFeatures };
                }

                const inputVisible = await input.isVisible();
                if (inputVisible) {
                  workingFeatures.push('Date input is visible');

                  // Test typing
                  await input.clear();
                  await input.type('12/25/2024');
                  await page.waitForDelay(200);

                  const value = await input.inputValue();
                  if (value.includes('12/25/2024') || value.includes('12252024')) {
                    workingFeatures.push('Input accepts typed dates');
                  } else {
                    issues.push(`Input value unexpected: "${value}"`);
                  }

                  // Test calendar button
                  const button = iframe.locator('.usa-date-picker__button').first();
                  if (await button.isVisible()) {
                    workingFeatures.push('Calendar button is visible and clickable');
                    await button.click();
                  } else {
                    issues.push('Calendar button is not visible');
                  }
                } else {
                  issues.push('Date input is not visible');
                }

              } catch (error) {
                issues.push(`Date picker test error: ${error.message}`);
              }

              return { issues, workingFeatures };
            }
          }
        ]
      }
    ];

    // Run tests for each component
    for (const component of components) {
      await this.testComponent(component.name, component.tests);
    }

    await this.generateIntegratedReport();
  }

  generateIntegratedReport() {
    console.log('\n🎯 INTEGRATED TESTING RESULTS');
    console.log('=' * 60);

    // Overall summary
    console.log('\n📊 OVERALL SUMMARY');
    console.log(`   Total Components: ${this.results.summary.total}`);
    console.log(`   Passing: ${this.results.summary.passing}`);
    console.log(`   Warnings: ${this.results.summary.warnings}`);
    console.log(`   Failing: ${this.results.summary.failing}`);
    console.log('');
    console.log(`   Compliance Tests: ${this.results.summary.compliance.passed}/${this.results.summary.total} passed`);
    console.log(`   Behavioral Tests: ${this.results.summary.behavioral.passed}/${this.results.summary.total} passed`);

    // Component details
    console.log('\n🔍 COMPONENT DETAILS');
    for (const component of this.results.components) {
      console.log(`\n${component.component.toUpperCase()}`);
      console.log(`   Overall Status: ${component.overall.status}`);
      console.log(`   Compliance: ${component.compliance.status || 'unknown'}`);
      console.log(`   Behavioral: ${component.behavioral.status || 'unknown'}`);

      if (component.overall.issues.length > 0) {
        console.log(`   ❌ Issues (${component.overall.issues.length}):`);
        component.overall.issues.forEach(issue => {
          console.log(`      • ${issue}`);
        });
      }

      if (component.overall.recommendations.length > 0) {
        console.log(`   💡 Recommendations:`);
        component.overall.recommendations.forEach(rec => {
          console.log(`      • ${rec}`);
        });
      }
    }

    // Integration insights
    console.log('\n🔗 INTEGRATION INSIGHTS');
    const complianceVsBehavioral = this.analyzeComplianceVsBehavioral();
    console.log(complianceVsBehavioral);

    // Success metrics
    const successRate = Math.round((this.results.summary.passing / this.results.summary.total) * 100);
    console.log(`\n✅ SUCCESS RATE: ${successRate}%`);

    if (successRate === 100) {
      console.log('🎉 PERFECT SCORE! All components pass both compliance and behavioral validation.');
    } else if (successRate >= 80) {
      console.log('🟢 EXCELLENT! Most components are working well.');
    } else if (successRate >= 60) {
      console.log('🟡 GOOD! Some components need attention.');
    } else {
      console.log('🔴 NEEDS WORK! Multiple components have issues.');
    }

    // Save detailed report
    const reportPath = path.join(__dirname, '../compliance/integrated-testing-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    return this.results;
  }

  analyzeComplianceVsBehavioral() {
    const bothPassing = this.results.components.filter(c =>
      c.compliance.status === 'passing' && c.behavioral.status === 'passing'
    ).length;

    const complianceOnlyPassing = this.results.components.filter(c =>
      c.compliance.status === 'passing' && c.behavioral.status !== 'passing'
    ).length;

    const behavioralOnlyPassing = this.results.components.filter(c =>
      c.compliance.status !== 'passing' && c.behavioral.status === 'passing'
    ).length;

    const neitherPassing = this.results.components.filter(c =>
      c.compliance.status !== 'passing' && c.behavioral.status !== 'passing'
    ).length;

    let analysis = '';

    if (bothPassing === this.results.summary.total) {
      analysis = '🎯 PERFECT ALIGNMENT: All components pass both compliance and behavioral validation.';
    } else if (complianceOnlyPassing > 0) {
      analysis += `⚠️ ${complianceOnlyPassing} component(s) pass compliance but fail behavioral tests.\n`;
      analysis += '   This suggests structural compliance without proper functionality.\n';
    }

    if (behavioralOnlyPassing > 0) {
      analysis += `⚠️ ${behavioralOnlyPassing} component(s) work functionally but fail compliance.\n`;
      analysis += '   This suggests good UX but non-standard implementation.\n';
    }

    if (bothPassing > 0) {
      analysis += `✅ ${bothPassing} component(s) achieve both compliance and functionality goals.\n`;
    }

    return analysis || '📊 Mixed results - see component details above for specific issues.';
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const system = new IntegratedTestingSystem();

  system.initialize()
    .then(() => system.runIntegratedTests())
    .then(() => system.cleanup())
    .catch(async (error) => {
      console.error('💥 Integrated testing failed:', error);
      await system.cleanup();
      process.exit(1);
    });
}

export default IntegratedTestingSystem;