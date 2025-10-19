#!/usr/bin/env node

/**
 * Browser-Based USWDS Transformation Test
 *
 * This script uses Puppeteer to test combo box transformation in a real browser
 * environment where USWDS JavaScript actually runs.
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BrowserTransformationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
  }

  async setup() {
    console.log('🚀 Starting browser-based transformation tests...\n');

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();

    // Listen for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Error:', msg.text());
        this.errors.push(msg.text());
      }
    });

    // Listen for page errors
    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
      this.errors.push(error.message);
    });
  }

  async testComboBoxTransformation() {
    console.log('🧪 Testing Combo Box Transformation...');

    try {
      // Create test HTML content
      const testHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Combo Box Test</title>
          <base href="http://localhost:5173/">
          <script type="module">
            import './src/components/combo-box/index.ts';
          </script>
        </head>
        <body>
          <usa-combo-box
            label="Test Fruit"
            placeholder="Select fruit"
            name="fruit"
            input-id="test-combo"
          ></usa-combo-box>

          <script>
            // Set up test data
            const comboBox = document.querySelector('usa-combo-box');
            comboBox.options = [
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
              { value: 'orange', label: 'Orange' }
            ];
          </script>
        </body>
        </html>
      `;

      await this.page.setContent(testHTML);

      // Wait for component to load and initialize
      await this.page.waitForDelay(3000);

      // Test 1: Check initial structure
      const hasComboBox = await this.page.evaluate(() => {
        const comboBox = document.querySelector('usa-combo-box');
        const container = comboBox?.querySelector('.usa-combo-box');
        const select = container?.querySelector('select');
        return { hasComboBox: !!comboBox, hasContainer: !!container, hasSelect: !!select };
      });

      if (hasComboBox.hasComboBox && hasComboBox.hasContainer && hasComboBox.hasSelect) {
        console.log('  ✅ Initial structure rendered correctly');
        this.passed++;
      } else {
        console.log('  ❌ Initial structure missing');
        this.failed++;
        return false;
      }

      // Test 2: Wait for USWDS transformation
      await this.page.waitForFunction(() => {
        const comboBox = document.querySelector('usa-combo-box');
        const input = comboBox?.querySelector('.usa-combo-box__input');
        return input !== null;
      }, { timeout: 5000 }).catch(() => null);

      // Test 3: Check transformation results
      const transformationResults = await this.page.evaluate(() => {
        const comboBox = document.querySelector('usa-combo-box');
        const container = comboBox?.querySelector('.usa-combo-box');
        const originalSelect = container?.querySelector('select');
        const transformedInput = container?.querySelector('.usa-combo-box__input');
        const toggleButton = container?.querySelector('.usa-combo-box__toggle-list');
        const list = container?.querySelector('.usa-combo-box__list');

        return {
          hasTransformedInput: !!transformedInput,
          hasToggleButton: !!toggleButton,
          hasList: !!list,
          selectHidden: originalSelect ? getComputedStyle(originalSelect).display === 'none' : false,
          inputType: transformedInput?.tagName,
          inputReadyForInput: !!(transformedInput && !transformedInput.disabled),
          containerHTML: container?.innerHTML.substring(0, 200) + '...'
        };
      });

      // Validate transformation
      if (transformationResults.hasTransformedInput && transformationResults.hasToggleButton) {
        console.log('  ✅ USWDS transformation completed successfully');
        console.log(`    • Input element created: ${transformationResults.hasTransformedInput}`);
        console.log(`    • Toggle button created: ${transformationResults.hasToggleButton}`);
        console.log(`    • List element created: ${transformationResults.hasList}`);
        console.log(`    • Original select hidden: ${transformationResults.selectHidden}`);
        this.passed++;
      } else {
        console.log('  ❌ USWDS transformation failed');
        console.log(`    • Input element: ${transformationResults.hasTransformedInput}`);
        console.log(`    • Toggle button: ${transformationResults.hasToggleButton}`);
        console.log(`    • Container HTML: ${transformationResults.containerHTML}`);
        this.failed++;
        return false;
      }

      // Test 4: Test interaction
      try {
        await this.page.click('.usa-combo-box__input');
        await this.page.type('.usa-combo-box__input', 'app');

        // Check if filtering works
        const filteringWorks = await this.page.evaluate(() => {
          const list = document.querySelector('.usa-combo-box__list');
          const visibleItems = list?.querySelectorAll('li:not([aria-hidden="true"])');
          return visibleItems ? visibleItems.length > 0 : false;
        });

        if (filteringWorks) {
          console.log('  ✅ Typing and filtering functionality works');
          this.passed++;
        } else {
          console.log('  ⚠️ Filtering functionality may not be working');
          // Don't fail for this - it's a bonus test
        }
      } catch (error) {
        console.log('  ⚠️ Could not test interaction:', error.message);
      }

      return true;

    } catch (error) {
      console.log('  ❌ Test failed with error:', error.message);
      this.failed++;
      return false;
    }
  }

  async testTimePickerTransformation() {
    console.log('\n🧪 Testing Time Picker Transformation (HIGH RISK - Combo Box Architecture)...');

    try {
      const testHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Time Picker Test</title>
          <base href="http://localhost:5173/">
          <script type="module">
            import './src/components/time-picker/index.ts';
          </script>
        </head>
        <body>
          <usa-time-picker
            label="Test Time"
            placeholder="Select time"
            name="time"
            input-id="test-time"
          ></usa-time-picker>
        </body>
        </html>
      `;

      await this.page.setContent(testHTML);
      await this.page.waitForDelay(3000);

      // Test 1: Check initial structure
      const hasInitialStructure = await this.page.evaluate(() => {
        const timePicker = document.querySelector('usa-time-picker');
        const container = timePicker?.querySelector('.usa-time-picker');
        const input = container?.querySelector('input');
        return { hasTimePicker: !!timePicker, hasContainer: !!container, hasInput: !!input };
      });

      if (hasInitialStructure.hasTimePicker && hasInitialStructure.hasContainer && hasInitialStructure.hasInput) {
        console.log('  ✅ Initial structure rendered correctly');
        this.passed++;
      } else {
        console.log('  ❌ Initial structure missing');
        this.failed++;
        return false;
      }

      // Test 2: Wait for USWDS transformation (time-picker → combo-box)
      await this.page.waitForFunction(() => {
        const timePicker = document.querySelector('usa-time-picker');
        const input = timePicker?.querySelector('.usa-combo-box__input');
        return input !== null;
      }, { timeout: 5000 }).catch(() => null);

      // Test 3: Check transformation results
      const transformationResults = await this.page.evaluate(() => {
        const timePicker = document.querySelector('usa-time-picker');
        const container = timePicker?.querySelector('.usa-time-picker');
        const comboBoxInput = container?.querySelector('.usa-combo-box__input');
        const toggleButton = container?.querySelector('.usa-combo-box__toggle-list');
        const list = container?.querySelector('.usa-combo-box__list');

        return {
          hasComboBoxInput: !!comboBoxInput,
          hasToggleButton: !!toggleButton,
          hasList: !!list,
          hasComboBoxClass: container?.classList.contains('usa-combo-box'),
          containerClasses: container?.className,
          inputType: comboBoxInput?.tagName
        };
      });

      // Validate transformation (time-picker becomes combo-box)
      if (transformationResults.hasComboBoxInput && transformationResults.hasToggleButton && transformationResults.hasComboBoxClass) {
        console.log('  ✅ USWDS time-picker transformation completed successfully');
        console.log(`    • Combo box input created: ${transformationResults.hasComboBoxInput}`);
        console.log(`    • Toggle button created: ${transformationResults.hasToggleButton}`);
        console.log(`    • List element created: ${transformationResults.hasList}`);
        console.log(`    • Combo box class applied: ${transformationResults.hasComboBoxClass}`);
        this.passed++;
      } else {
        console.log('  ❌ USWDS time-picker transformation failed');
        console.log(`    • Combo box input: ${transformationResults.hasComboBoxInput}`);
        console.log(`    • Toggle button: ${transformationResults.hasToggleButton}`);
        console.log(`    • Combo box class: ${transformationResults.hasComboBoxClass}`);
        console.log(`    • Container classes: ${transformationResults.containerClasses}`);
        this.failed++;
        return false;
      }

      // Test 4: Test time selection interaction
      try {
        await this.page.click('.usa-combo-box__input');
        await this.page.type('.usa-combo-box__input', '2:30');

        const timeInteractionWorks = await this.page.evaluate(() => {
          const input = document.querySelector('.usa-combo-box__input');
          return input && input.value.includes('2:30');
        });

        if (timeInteractionWorks) {
          console.log('  ✅ Time input functionality works');
          this.passed++;
        } else {
          console.log('  ⚠️ Time input functionality may not be working');
        }
      } catch (error) {
        console.log('  ⚠️ Could not test time interaction:', error.message);
      }

      return true;

    } catch (error) {
      console.log('  ❌ Time picker test failed with error:', error.message);
      this.failed++;
      return false;
    }
  }

  async testDatePickerTransformation() {
    console.log('\n🧪 Testing Date Picker Transformation (HIGH RISK - Complex Multi-Element)...');

    try {
      const testHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Date Picker Test</title>
          <base href="http://localhost:5173/">
          <script type="module">
            import './src/components/date-picker/index.ts';
          </script>
        </head>
        <body>
          <usa-date-picker
            label="Test Date"
            name="date"
            input-id="test-date"
          ></usa-date-picker>
        </body>
        </html>
      `;

      await this.page.setContent(testHTML);
      await this.page.waitForDelay(3000);

      // Test 1: Check initial structure
      const hasInitialStructure = await this.page.evaluate(() => {
        const datePicker = document.querySelector('usa-date-picker');
        const container = datePicker?.querySelector('.usa-date-picker');
        const input = container?.querySelector('input');
        return { hasDatePicker: !!datePicker, hasContainer: !!container, hasInput: !!input };
      });

      if (hasInitialStructure.hasDatePicker && hasInitialStructure.hasContainer && hasInitialStructure.hasInput) {
        console.log('  ✅ Initial structure rendered correctly');
        this.passed++;
      } else {
        console.log('  ❌ Initial structure missing');
        this.failed++;
        return false;
      }

      // Test 2: Wait for USWDS transformation (adds calendar button)
      await this.page.waitForFunction(() => {
        const datePicker = document.querySelector('usa-date-picker');
        const button = datePicker?.querySelector('.usa-date-picker__button');
        return button !== null;
      }, { timeout: 5000 }).catch(() => null);

      // Test 3: Check transformation results
      const transformationResults = await this.page.evaluate(() => {
        const datePicker = document.querySelector('usa-date-picker');
        const container = datePicker?.querySelector('.usa-date-picker');
        const input = container?.querySelector('input');
        const calendarButton = container?.querySelector('.usa-date-picker__button');
        const wrapper = container?.querySelector('.usa-date-picker__wrapper');

        return {
          hasInput: !!input,
          hasCalendarButton: !!calendarButton,
          hasWrapper: !!wrapper,
          containerClasses: container?.className,
          inputReadyForInput: !!(input && !input.disabled)
        };
      });

      // Validate transformation
      if (transformationResults.hasInput && transformationResults.hasCalendarButton) {
        console.log('  ✅ USWDS date-picker transformation completed successfully');
        console.log(`    • Input element preserved: ${transformationResults.hasInput}`);
        console.log(`    • Calendar button created: ${transformationResults.hasCalendarButton}`);
        console.log(`    • Wrapper created: ${transformationResults.hasWrapper}`);
        console.log(`    • Input ready for input: ${transformationResults.inputReadyForInput}`);
        this.passed++;
      } else {
        console.log('  ❌ USWDS date-picker transformation failed');
        console.log(`    • Input element: ${transformationResults.hasInput}`);
        console.log(`    • Calendar button: ${transformationResults.hasCalendarButton}`);
        console.log(`    • Container classes: ${transformationResults.containerClasses}`);
        this.failed++;
        return false;
      }

      // Test 4: Test calendar button interaction
      try {
        await this.page.click('.usa-date-picker__button');
        await this.page.waitForDelay(500);

        const calendarOpens = await this.page.evaluate(() => {
          const calendar = document.querySelector('.usa-date-picker__calendar');
          return !!calendar;
        });

        if (calendarOpens) {
          console.log('  ✅ Calendar popup functionality works');
          this.passed++;
        } else {
          console.log('  ⚠️ Calendar popup may not be working');
        }
      } catch (error) {
        console.log('  ⚠️ Could not test calendar interaction:', error.message);
      }

      return true;

    } catch (error) {
      console.log('  ❌ Date picker test failed with error:', error.message);
      this.failed++;
      return false;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 Browser Transformation Test Results');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);

    if (this.errors.length > 0) {
      console.log('\n🚨 Browser Errors:');
      this.errors.forEach(error => console.log(`   ${error}`));
    }

    if (this.failed === 0) {
      console.log('\n🎉 All transformation tests passed!');
      return 0;
    } else {
      console.log('\n💔 Some transformation tests failed!');
      return 1;
    }
  }
}

// Run tests
async function runTests() {
  const tester = new BrowserTransformationTester();

  try {
    await tester.setup();

    // Critical transformation tests
    await tester.testComboBoxTransformation();
    await tester.testTimePickerTransformation();
    await tester.testDatePickerTransformation();

  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
    const exitCode = tester.printResults();
    process.exit(exitCode);
  }
}

// Check if we're being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}