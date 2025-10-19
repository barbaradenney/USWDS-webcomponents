#!/usr/bin/env node

/**
 * @fileoverview Click Event Validation Framework
 *
 * This script analyzes all components to identify those with click events
 * and validates that they have appropriate behavioral tests.
 *
 * Features:
 * - Scans all component TypeScript files for click events
 * - Identifies components with interactive behavior
 * - Validates presence of behavioral/component tests
 * - Generates coverage report for click event testing
 * - Provides recommendations for missing tests
 *
 * Usage:
 *   node scripts/validate-click-event-coverage.js
 *   npm run validate:click-events
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Component directory path
const COMPONENTS_DIR = path.join(__dirname, '../../src/components');

// Patterns to identify click events and interactive behavior
const CLICK_PATTERNS = [
  /addEventListener\(['"]click['"]/g,
  /@click=/g,
  /onClick=/g,
  /\.click\(/g,
  /handleClick/g,
  /onClickHandler/g,
  /clickHandler/g,
];

// Patterns to identify other interactive events
const INTERACTION_PATTERNS = [
  /addEventListener\(['"]keydown['"]/g,
  /addEventListener\(['"]keyup['"]/g,
  /addEventListener\(['"]focus['"]/g,
  /addEventListener\(['"]blur['"]/g,
  /addEventListener\(['"]submit['"]/g,
  /@keydown=/g,
  /@keyup=/g,
  /@focus=/g,
  /@blur=/g,
  /@submit=/g,
  /handleKeyDown/g,
  /handleKeyUp/g,
  /handleFocus/g,
  /handleBlur/g,
  /handleSubmit/g,
];

// Components that are known to be presentational (no behavioral tests needed)
const PRESENTATIONAL_COMPONENTS = [
  'alert',
  'banner',
  'breadcrumb',
  'button', // Basic button is presentational, interactive behavior is in parent
  'card',
  'icon',
  'link',
  'list',
  'prose',
  'section',
  'site-alert',
  'skip-link',
  'summary-box',
  'tag',
  'validation',
];

// Components with complex interactive behavior requiring behavioral tests
const INTERACTIVE_COMPONENTS = [
  'accordion',
  'combo-box',
  'date-picker',
  'date-range-picker',
  'file-input',
  'modal',
  'menu',
  'pagination',
  'search',
  'side-navigation',
  'in-page-navigation',
  'time-picker',
  'tooltip',
];

class ClickEventValidator {
  constructor() {
    this.results = {
      interactive: [],
      presentational: [],
      needsBehavioralTests: [],
      hasBehavioralTests: [],
      coverage: {
        total: 0,
        tested: 0,
        percentage: 0,
      },
    };
  }

  /**
   * Scan all components and validate click event coverage
   */
  async validateCoverage() {
    console.log('🔍 Click Event Validation Framework');
    console.log('=====================================\\n');

    const components = this.getComponentDirectories();

    for (const component of components) {
      await this.analyzeComponent(component);
    }

    this.generateReport();
    this.generateRecommendations();

    return this.results;
  }

  /**
   * Get all component directories
   */
  getComponentDirectories() {
    return fs
      .readdirSync(COMPONENTS_DIR)
      .filter((item) => {
        const fullPath = path.join(COMPONENTS_DIR, item);
        return fs.statSync(fullPath).isDirectory();
      })
      .sort();
  }

  /**
   * Analyze a single component for click events and test coverage
   */
  async analyzeComponent(componentName) {
    const componentDir = path.join(COMPONENTS_DIR, componentName);
    const componentFile = path.join(componentDir, `usa-${componentName}.ts`);

    if (!fs.existsSync(componentFile)) {
      console.warn(`⚠️  Component file not found: ${componentFile}`);
      return;
    }

    const analysis = {
      name: componentName,
      hasClickEvents: false,
      hasInteractiveEvents: false,
      clickEventCount: 0,
      interactiveEventCount: 0,
      hasBehavioralTests: false,
      hasComponentTests: false,
      testFiles: [],
      isInteractive: false,
      isPresentational: false,
      needsBehavioralTests: false,
    };

    // Read component source code
    const sourceCode = fs.readFileSync(componentFile, 'utf8');

    // Analyze click events
    analysis.hasClickEvents = this.hasClickEvents(sourceCode);
    analysis.clickEventCount = this.countClickEvents(sourceCode);

    // Analyze other interactive events
    analysis.hasInteractiveEvents = this.hasInteractiveEvents(sourceCode);
    analysis.interactiveEventCount = this.countInteractiveEvents(sourceCode);

    // Check for test files
    analysis.testFiles = this.findTestFiles(componentDir, componentName);
    analysis.hasBehavioralTests = this.hasBehavioralTestFile(analysis.testFiles);
    analysis.hasComponentTests = this.hasComponentTestFile(analysis.testFiles);

    // Classify component
    analysis.isPresentational = PRESENTATIONAL_COMPONENTS.includes(componentName);
    analysis.isInteractive =
      INTERACTIVE_COMPONENTS.includes(componentName) ||
      analysis.hasClickEvents ||
      analysis.hasInteractiveEvents;

    // Determine if behavioral tests are needed
    analysis.needsBehavioralTests =
      analysis.isInteractive && !analysis.isPresentational && !analysis.hasBehavioralTests;

    // Store results
    if (analysis.isPresentational) {
      this.results.presentational.push(analysis);
    } else if (analysis.isInteractive) {
      this.results.interactive.push(analysis);

      if (analysis.hasBehavioralTests) {
        this.results.hasBehavioralTests.push(analysis);
      } else {
        this.results.needsBehavioralTests.push(analysis);
      }
    }

    // Log component analysis
    this.logComponentAnalysis(analysis);
  }

  /**
   * Check if component has click events
   */
  hasClickEvents(sourceCode) {
    return CLICK_PATTERNS.some((pattern) => pattern.test(sourceCode));
  }

  /**
   * Count click events in component
   */
  countClickEvents(sourceCode) {
    let total = 0;
    CLICK_PATTERNS.forEach((pattern) => {
      const matches = sourceCode.match(pattern) || [];
      total += matches.length;
    });
    return total;
  }

  /**
   * Check if component has interactive events
   */
  hasInteractiveEvents(sourceCode) {
    return INTERACTION_PATTERNS.some((pattern) => pattern.test(sourceCode));
  }

  /**
   * Count interactive events in component
   */
  countInteractiveEvents(sourceCode) {
    let total = 0;
    INTERACTION_PATTERNS.forEach((pattern) => {
      const matches = sourceCode.match(pattern) || [];
      total += matches.length;
    });
    return total;
  }

  /**
   * Find test files for a component
   */
  findTestFiles(componentDir, componentName) {
    const testFiles = [];
    const possibleTestFiles = [
      `usa-${componentName}.test.ts`,
      `usa-${componentName}.component.cy.ts`,
      `usa-${componentName}.behavioral.cy.ts`,
      `usa-${componentName}.e2e.cy.ts`,
    ];

    possibleTestFiles.forEach((filename) => {
      const testPath = path.join(componentDir, filename);
      if (fs.existsSync(testPath)) {
        testFiles.push({
          name: filename,
          path: testPath,
          type: this.getTestType(filename),
        });
      }
    });

    return testFiles;
  }

  /**
   * Determine test file type
   */
  getTestType(filename) {
    if (filename.includes('.component.cy.ts') || filename.includes('.behavioral.cy.ts')) {
      return 'behavioral';
    } else if (filename.includes('.e2e.cy.ts')) {
      return 'e2e';
    } else if (filename.includes('.test.ts')) {
      return 'unit';
    }
    return 'unknown';
  }

  /**
   * Check if component has behavioral test files
   */
  hasBehavioralTestFile(testFiles) {
    return testFiles.some((file) => file.type === 'behavioral');
  }

  /**
   * Check if component has component test files
   */
  hasComponentTestFile(testFiles) {
    return testFiles.some((file) => file.type === 'behavioral' || file.type === 'e2e');
  }

  /**
   * Log individual component analysis
   */
  logComponentAnalysis(analysis) {
    const status = analysis.isPresentational
      ? '📄'
      : analysis.hasBehavioralTests
        ? '✅'
        : analysis.needsBehavioralTests
          ? '❌'
          : '⚪';

    const details = [];
    if (analysis.clickEventCount > 0) {
      details.push(`${analysis.clickEventCount} click events`);
    }
    if (analysis.interactiveEventCount > 0) {
      details.push(`${analysis.interactiveEventCount} interactive events`);
    }
    if (analysis.testFiles.length > 0) {
      details.push(`${analysis.testFiles.length} test files`);
    }

    console.log(`${status} ${analysis.name.padEnd(20)} ${details.join(', ')}`);
  }

  /**
   * Generate comprehensive coverage report
   */
  generateReport() {
    console.log('\\n📊 Click Event Coverage Report');
    console.log('===============================\\n');

    const totalInteractive = this.results.interactive.length;
    const tested = this.results.hasBehavioralTests.length;
    const coverage = totalInteractive > 0 ? (tested / totalInteractive) * 100 : 100;

    this.results.coverage = {
      total: totalInteractive,
      tested: tested,
      percentage: coverage,
    };

    console.log(`Total Interactive Components: ${totalInteractive}`);
    console.log(`Components with Behavioral Tests: ${tested}`);
    console.log(`Components Needing Tests: ${this.results.needsBehavioralTests.length}`);
    console.log(`Presentational Components: ${this.results.presentational.length}`);
    console.log(`Coverage Percentage: ${coverage.toFixed(1)}%\\n`);

    // Detailed breakdown
    console.log('📋 Interactive Components with Tests:');
    this.results.hasBehavioralTests.forEach((comp) => {
      const testTypes = comp.testFiles.map((f) => f.type).join(', ');
      console.log(`  ✅ ${comp.name} (${testTypes})`);
    });

    if (this.results.needsBehavioralTests.length > 0) {
      console.log('\\n⚠️  Interactive Components Missing Behavioral Tests:');
      this.results.needsBehavioralTests.forEach((comp) => {
        const events = [];
        if (comp.clickEventCount > 0) events.push(`${comp.clickEventCount} click`);
        if (comp.interactiveEventCount > 0)
          events.push(`${comp.interactiveEventCount} interactive`);
        console.log(`  ❌ ${comp.name} (${events.join(', ')} events)`);
      });
    }

    console.log('\\n📄 Presentational Components (No Tests Needed):');
    this.results.presentational.forEach((comp) => {
      console.log(`  📄 ${comp.name}`);
    });
  }

  /**
   * Generate recommendations for improving test coverage
   */
  generateRecommendations() {
    console.log('\\n💡 Recommendations');
    console.log('==================\\n');

    if (this.results.needsBehavioralTests.length === 0) {
      console.log('🎉 Excellent! All interactive components have behavioral tests.');
      console.log('\\n🔧 Suggested Next Steps:');
      console.log('- Review existing tests for completeness');
      console.log('- Add edge case testing');
      console.log('- Ensure accessibility validation in all tests');
      console.log('- Consider performance testing for complex interactions');
      return;
    }

    console.log('🎯 Priority Components for Behavioral Testing:\\n');

    this.results.needsBehavioralTests
      .sort(
        (a, b) =>
          b.clickEventCount +
          b.interactiveEventCount -
          (a.clickEventCount + a.interactiveEventCount)
      )
      .forEach((comp, index) => {
        const priority = index < 3 ? '🔴 HIGH' : index < 6 ? '🟡 MEDIUM' : '🟢 LOW';
        console.log(`${priority} Priority: ${comp.name}`);
        console.log(
          `   - ${comp.clickEventCount} click events, ${comp.interactiveEventCount} interactive events`
        );
        console.log(`   - Suggested test file: usa-${comp.name}.component.cy.ts`);
        console.log(`   - Focus areas: Click handlers, keyboard navigation, state changes\\n`);
      });

    console.log('🛠️  Implementation Guidelines:\\n');
    console.log('1. Create component.cy.ts files for missing behavioral tests');
    console.log('2. Follow the pattern established in existing behavioral tests');
    console.log('3. Test actual user interactions, not just API calls');
    console.log('4. Include accessibility validation with cy.checkAccessibility()');
    console.log('5. Test keyboard navigation and focus management');
    console.log('6. Verify visual feedback and state changes');
    console.log('7. Test error states and edge cases\\n');

    // Generate template recommendation
    if (this.results.needsBehavioralTests.length > 0) {
      const firstComponent = this.results.needsBehavioralTests[0];
      console.log(`📝 Example Test Template for ${firstComponent.name}:\\n`);
      console.log(this.generateTestTemplate(firstComponent.name));
    }
  }

  /**
   * Generate a test template for a component
   */
  generateTestTemplate(componentName) {
    return `// Component behavioral tests for usa-${componentName}
import { html } from 'lit';
import './index.ts';

describe('USA ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} - Behavioral Testing', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      if (!win.customElements.get('usa-${componentName}')) {
        return import('./usa-${componentName}.ts');
      }
    });
  });

  describe('Click Event Behavior', () => {
    it('should handle click events properly', () => {
      cy.mount(html\`
        <usa-${componentName} id="test-${componentName}"></usa-${componentName}>
      \`);

      // Test click behavior
      cy.get('#test-${componentName}').click();

      // Verify expected behavior
      // Add assertions based on component functionality
    });

    it('should emit proper events on interaction', () => {
      let eventDetails: any = null;

      cy.mount(html\`
        <usa-${componentName}
          @component-event="\${(e: CustomEvent) => eventDetails = e.detail}"
        ></usa-${componentName}>
      \`);

      cy.get('usa-${componentName}').click().then(() => {
        expect(eventDetails).to.not.be.null;
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard interaction', () => {
      cy.mount(html\`
        <usa-${componentName}></usa-${componentName}>
      \`);

      cy.get('usa-${componentName}').focus().type('{enter}');
      // Add keyboard behavior assertions
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      cy.mount(html\`
        <usa-${componentName}></usa-${componentName}>
      \`);

      cy.injectAxe();
      cy.checkAccessibility();
    });
  });
});`;
  }
}

// Main execution
async function main() {
  const validator = new ClickEventValidator();
  const results = await validator.validateCoverage();

  // Exit with error code if coverage is below threshold
  const threshold = 80; // 80% coverage threshold
  if (results.coverage.percentage < threshold) {
    console.log(
      `\\n❌ Coverage ${results.coverage.percentage.toFixed(1)}% is below threshold ${threshold}%`
    );
    process.exit(1);
  } else {
    console.log(
      `\\n✅ Coverage ${results.coverage.percentage.toFixed(1)}% meets threshold ${threshold}%`
    );
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ClickEventValidator };
