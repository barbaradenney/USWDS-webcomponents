#!/usr/bin/env node

/**
 * Visual Regression Testing for USWDS Component Transformations
 *
 * This script captures screenshots of component transformations and compares
 * them with baseline images to detect visual regressions.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VisualRegressionTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baselineDir = path.join(process.cwd(), '__tests__', 'visual-baselines');
    this.currentDir = path.join(process.cwd(), '__tests__', 'visual-current');
    this.diffDir = path.join(process.cwd(), '__tests__', 'visual-diffs');
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
    this.mode = 'validate'; // 'baseline' or 'validate'
  }

  async setup(mode = 'validate') {
    this.mode = mode;
    console.log(`🎨 Starting visual regression testing (${mode} mode)...\n`);

    // Create directories
    [this.baselineDir, this.currentDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1200, height: 800 }
    });
    this.page = await this.browser.newPage();
  }

  async captureComponentTransformation(componentName, testConfig) {
    console.log(`📸 Capturing ${componentName} transformation...`);

    try {
      // Set up test HTML
      await this.page.setContent(testConfig.html);
      await this.page.waitForDelay(3000); // Wait for transformation

      // Wait for specific transformation indicator
      if (testConfig.waitForSelector) {
        await this.page.waitForSelector(testConfig.waitForSelector, { timeout: 5000 })
          .catch(() => console.log(`⚠️ Timeout waiting for ${testConfig.waitForSelector}`));
      }

      // Additional wait for visual stability
      await this.page.waitForDelay(1000);

      // Capture screenshots at different states
      const screenshots = {};

      // 1. Initial state
      screenshots.initial = await this.page.screenshot({
        clip: { x: 0, y: 0, width: 800, height: 600 },
        type: 'png'
      });

      // 2. Focused state (if applicable)
      if (testConfig.focusSelector) {
        await this.page.focus(testConfig.focusSelector);
        await this.page.waitForDelay(200);
        screenshots.focused = await this.page.screenshot({
          clip: { x: 0, y: 0, width: 800, height: 600 },
          type: 'png'
        });
      }

      // 3. Interaction state (if applicable)
      if (testConfig.interactionSteps) {
        for (const step of testConfig.interactionSteps) {
          await this.executeInteractionStep(step);
        }
        await this.page.waitForDelay(500);
        screenshots.interaction = await this.page.screenshot({
          clip: { x: 0, y: 0, width: 800, height: 600 },
          type: 'png'
        });
      }

      // Save screenshots
      for (const [state, screenshot] of Object.entries(screenshots)) {
        const filename = `${componentName}-${state}.png`;

        if (this.mode === 'baseline') {
          // Save as baseline
          fs.writeFileSync(path.join(this.baselineDir, filename), screenshot);
          console.log(`  ✅ Baseline saved: ${filename}`);
        } else {
          // Save current and compare
          const currentPath = path.join(this.currentDir, filename);
          fs.writeFileSync(currentPath, screenshot);

          const baselinePath = path.join(this.baselineDir, filename);
          if (fs.existsSync(baselinePath)) {
            const isMatch = await this.compareImages(baselinePath, currentPath, filename);
            if (isMatch) {
              console.log(`  ✅ Visual match: ${filename}`);
              this.passed++;
            } else {
              console.log(`  ❌ Visual difference: ${filename}`);
              this.failed++;
              this.errors.push(`Visual regression detected in ${componentName} (${state} state)`);
            }
          } else {
            console.log(`  ⚠️ No baseline: ${filename} (run with --baseline first)`);
          }
        }
      }

      return true;

    } catch (error) {
      console.log(`  ❌ Error capturing ${componentName}:`, error.message);
      this.failed++;
      this.errors.push(`Screenshot capture failed for ${componentName}: ${error.message}`);
      return false;
    }
  }

  async executeInteractionStep(step) {
    switch (step.action) {
      case 'click':
        await this.page.click(step.selector);
        break;
      case 'type':
        await this.page.type(step.selector, step.text);
        break;
      case 'hover':
        await this.page.hover(step.selector);
        break;
      case 'wait':
        await this.page.waitForDelay(step.duration);
        break;
    }
  }

  async compareImages(baselinePath, currentPath, filename) {
    // Simple binary comparison for now
    // In production, you'd use a library like pixelmatch
    try {
      const baseline = fs.readFileSync(baselinePath);
      const current = fs.readFileSync(currentPath);

      const isIdentical = baseline.equals(current);

      if (!isIdentical) {
        // Create a simple diff indicator file
        const diffPath = path.join(this.diffDir, filename);
        fs.writeFileSync(diffPath, current); // Copy current as diff for manual review
      }

      return isIdentical;
    } catch (error) {
      console.log(`  ⚠️ Error comparing images: ${error.message}`);
      return false;
    }
  }

  async testComboBoxVisuals() {
    return await this.captureComponentTransformation('combo-box', {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <base href="http://localhost:5173/">
          <script type="module">import './src/components/combo-box/index.ts';</script>
        </head>
        <body>
          <div style="padding: 20px;">
            <usa-combo-box label="Visual Test Combo" placeholder="Select option" name="test"></usa-combo-box>
          </div>
          <script>
            const combo = document.querySelector('usa-combo-box');
            combo.options = [
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
              { value: 'cherry', label: 'Cherry' }
            ];
          </script>
        </body>
        </html>
      `,
      waitForSelector: '.usa-combo-box__input',
      focusSelector: '.usa-combo-box__input',
      interactionSteps: [
        { action: 'click', selector: '.usa-combo-box__toggle-list' },
        { action: 'wait', duration: 300 }
      ]
    });
  }

  async testTimePickerVisuals() {
    return await this.captureComponentTransformation('time-picker', {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <base href="http://localhost:5173/">
          <script type="module">import './src/components/time-picker/index.ts';</script>
        </head>
        <body>
          <div style="padding: 20px;">
            <usa-time-picker label="Visual Test Time" name="test-time"></usa-time-picker>
          </div>
        </body>
        </html>
      `,
      waitForSelector: '.usa-combo-box__input',
      focusSelector: '.usa-combo-box__input',
      interactionSteps: [
        { action: 'type', selector: '.usa-combo-box__input', text: '2:30' },
        { action: 'wait', duration: 300 }
      ]
    });
  }

  async testDatePickerVisuals() {
    return await this.captureComponentTransformation('date-picker', {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <base href="http://localhost:5173/">
          <script type="module">import './src/components/date-picker/index.ts';</script>
        </head>
        <body>
          <div style="padding: 20px;">
            <usa-date-picker label="Visual Test Date" name="test-date"></usa-date-picker>
          </div>
        </body>
        </html>
      `,
      waitForSelector: '.usa-date-picker__button',
      focusSelector: 'input',
      interactionSteps: [
        { action: 'click', selector: '.usa-date-picker__button' },
        { action: 'wait', duration: 500 }
      ]
    });
  }

  async testFileInputVisuals() {
    return await this.captureComponentTransformation('file-input', {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <base href="http://localhost:5173/">
          <script type="module">import './src/components/file-input/index.ts';</script>
        </head>
        <body>
          <div style="padding: 20px;">
            <usa-file-input label="Visual Test File" name="test-file"></usa-file-input>
          </div>
        </body>
        </html>
      `,
      waitForSelector: '.usa-file-input__box',
      focusSelector: 'input[type="file"]'
    });
  }

  async testModalVisuals() {
    return await this.captureComponentTransformation('modal', {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <base href="http://localhost:5173/">
          <script type="module">import './src/components/modal/index.ts';</script>
        </head>
        <body>
          <div style="padding: 20px;">
            <button id="open-modal">Open Modal</button>
            <usa-modal modal-id="test-modal" heading="Visual Test Modal">
              <p>This is a test modal for visual regression testing.</p>
            </usa-modal>
          </div>
          <script>
            document.getElementById('open-modal').onclick = () => {
              document.querySelector('usa-modal').open();
            };
          </script>
        </body>
        </html>
      `,
      waitForSelector: 'usa-modal',
      interactionSteps: [
        { action: 'click', selector: '#open-modal' },
        { action: 'wait', duration: 500 }
      ]
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🎨 Visual Regression Test Results');
    console.log('='.repeat(50));

    if (this.mode === 'baseline') {
      console.log('📋 Baseline screenshots captured successfully!');
      console.log('   Use --validate mode to check for regressions');
    } else {
      console.log(`✅ Passed: ${this.passed}`);
      console.log(`❌ Failed: ${this.failed}`);

      if (this.errors.length > 0) {
        console.log('\n🚨 Visual Regressions Detected:');
        this.errors.forEach(error => console.log(`   ${error}`));
        console.log(`\n📁 Check diff images in: ${this.diffDir}`);
      }

      if (this.failed === 0) {
        console.log('\n🎉 No visual regressions detected!');
        return 0;
      } else {
        console.log('\n💔 Visual regressions found!');
        return 1;
      }
    }
    return 0;
  }
}

// Run visual tests
async function runVisualTests() {
  const args = process.argv.slice(2);
  const mode = args.includes('--baseline') ? 'baseline' : 'validate';

  const tester = new VisualRegressionTester();

  try {
    await tester.setup(mode);

    // Test critical components with visual transformations
    await tester.testComboBoxVisuals();
    await tester.testTimePickerVisuals();
    await tester.testDatePickerVisuals();
    await tester.testFileInputVisuals();
    await tester.testModalVisuals();

  } catch (error) {
    console.error('❌ Visual test runner failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
    const exitCode = tester.printResults();
    process.exit(exitCode);
  }
}

// CLI usage
if (process.argv.includes('--help')) {
  console.log(`
Visual Regression Testing for USWDS Components

Usage:
  node scripts/visual-regression-testing.js [options]

Options:
  --baseline    Create baseline screenshots
  --validate    Compare against baseline (default)
  --help        Show this help

Examples:
  # Create baseline screenshots
  node scripts/visual-regression-testing.js --baseline

  # Check for visual regressions
  node scripts/visual-regression-testing.js --validate
`);
  process.exit(0);
}

// Check if we're being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runVisualTests();
}