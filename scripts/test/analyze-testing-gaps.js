#!/usr/bin/env node

/**
 * @fileoverview Advanced Testing Gap Analysis for Click Events
 *
 * This script identifies specific types of click-related bugs that could
 * still slip through even with comprehensive behavioral testing.
 *
 * Analyzes:
 * - Event propagation issues (preventDefault, stopPropagation)
 * - Disabled state handling
 * - Form integration and submission
 * - Cross-browser compatibility concerns
 * - Edge cases and race conditions
 * - Accessibility gaps in click handling
 * - Mobile/touch interaction gaps
 * - Performance issues with repeated clicks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '../../src/components');

// Patterns for potential click-related issues
const CLICK_ISSUE_PATTERNS = {
  eventPropagation: [
    /preventDefault\(\)/g,
    /stopPropagation\(\)/g,
    /stopImmediatePropagation\(\)/g,
  ],
  disabledStates: [/disabled.*click/g, /aria-disabled.*click/g, /if.*disabled.*return/g],
  formIntegration: [/form/gi, /submit/gi, /button.*type.*submit/g],
  asyncOperations: [/async.*click/g, /await.*click/g, /setTimeout.*click/g, /Promise.*click/g],
  eventListeners: [/addEventListener.*click/g, /removeEventListener.*click/g, /once.*click/g],
  focusManagement: [/focus\(\)/g, /blur\(\)/g, /tabindex/g, /activeElement/g],
};

class TestingGapAnalyzer {
  constructor() {
    this.gaps = {
      eventPropagationGaps: [],
      disabledStateGaps: [],
      formIntegrationGaps: [],
      asyncOperationGaps: [],
      accessibilityGaps: [],
      edgeCaseGaps: [],
      crossBrowserGaps: [],
    };
    this.recommendations = [];
  }

  /**
   * Analyze all components for testing gaps
   */
  async analyzeGaps() {
    console.log('🔍 Advanced Testing Gap Analysis');
    console.log('================================\\n');

    const components = this.getComponentDirectories();

    for (const component of components) {
      await this.analyzeComponent(component);
    }

    this.generateGapReport();
    this.generateRecommendations();

    return this.gaps;
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
   * Analyze a single component for testing gaps
   */
  async analyzeComponent(componentName) {
    const componentDir = path.join(COMPONENTS_DIR, componentName);
    const componentFile = path.join(componentDir, `usa-${componentName}.ts`);

    if (!fs.existsSync(componentFile)) {
      return;
    }

    const analysis = {
      name: componentName,
      sourceCode: '',
      testFiles: [],
      hasClickEvents: false,
      potentialIssues: {},
      testingGaps: [],
    };

    // Read component source
    analysis.sourceCode = fs.readFileSync(componentFile, 'utf8');

    // Find test files
    analysis.testFiles = this.findTestFiles(componentDir, componentName);

    // Check for click events
    analysis.hasClickEvents = /click/i.test(analysis.sourceCode);

    if (!analysis.hasClickEvents) {
      return; // Skip non-interactive components
    }

    // Analyze potential issues
    analysis.potentialIssues = this.analyzePotentialIssues(analysis.sourceCode);

    // Analyze testing gaps
    analysis.testingGaps = this.analyzeTestingGaps(analysis);

    // Store gaps by category
    this.categorizeGaps(analysis);

    console.log(`📊 ${componentName}: ${analysis.testingGaps.length} potential gaps identified`);
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
          content: fs.readFileSync(testPath, 'utf8'),
        });
      }
    });

    return testFiles;
  }

  /**
   * Analyze potential issues in component source code
   */
  analyzePotentialIssues(sourceCode) {
    const issues = {};

    Object.entries(CLICK_ISSUE_PATTERNS).forEach(([category, patterns]) => {
      issues[category] = [];
      patterns.forEach((pattern) => {
        const matches = sourceCode.match(pattern) || [];
        issues[category].push(...matches);
      });
    });

    return issues;
  }

  /**
   * Analyze testing gaps for a component
   */
  analyzeTestingGaps(analysis) {
    const gaps = [];
    const allTestContent = analysis.testFiles.map((f) => f.content).join('\\n');

    // Check for disabled state testing
    if (analysis.potentialIssues.disabledStates.length > 0) {
      if (!this.hasTestPattern(allTestContent, /disabled.*click|click.*disabled/i)) {
        gaps.push({
          type: 'disabledState',
          severity: 'high',
          description: 'Component has disabled state logic but lacks disabled click testing',
          recommendation: 'Add tests for click behavior when component is disabled',
        });
      }
    }

    // Check for event propagation testing
    if (analysis.potentialIssues.eventPropagation.length > 0) {
      if (!this.hasTestPattern(allTestContent, /preventDefault|stopPropagation/i)) {
        gaps.push({
          type: 'eventPropagation',
          severity: 'high',
          description: 'Component uses event propagation control but lacks testing',
          recommendation: 'Add tests for preventDefault and stopPropagation behavior',
        });
      }
    }

    // Check for form integration testing
    if (analysis.potentialIssues.formIntegration.length > 0) {
      if (!this.hasTestPattern(allTestContent, /form.*submit|submit.*form/i)) {
        gaps.push({
          type: 'formIntegration',
          severity: 'medium',
          description: 'Component may integrate with forms but lacks form testing',
          recommendation: 'Add tests for form submission and validation behavior',
        });
      }
    }

    // Check for async operation testing
    if (analysis.potentialIssues.asyncOperations.length > 0) {
      if (!this.hasTestPattern(allTestContent, /rapid.*click|successive.*click|async.*click/i)) {
        gaps.push({
          type: 'asyncOperation',
          severity: 'medium',
          description: 'Component has async operations but may lack rapid click testing',
          recommendation: 'Add tests for rapid successive clicks and async state management',
        });
      }
    }

    // Check for accessibility testing
    if (!this.hasTestPattern(allTestContent, /axe|checkAccessibility|a11y|aria/i)) {
      gaps.push({
        type: 'accessibility',
        severity: 'high',
        description: 'Component lacks accessibility testing for click interactions',
        recommendation: 'Add cy.checkAccessibility() and ARIA attribute testing',
      });
    }

    // Check for edge case testing
    const edgeCasePatterns = [
      /double.*click|rapid.*click/i,
      /mobile|touch/i,
      /keyboard.*click|enter.*space/i,
      /modifier.*key|ctrl.*click|shift.*click/i,
    ];

    if (!edgeCasePatterns.some((pattern) => this.hasTestPattern(allTestContent, pattern))) {
      gaps.push({
        type: 'edgeCase',
        severity: 'medium',
        description: 'Component may lack edge case testing for various click scenarios',
        recommendation: 'Add tests for keyboard activation, mobile touches, and modifier keys',
      });
    }

    return gaps;
  }

  /**
   * Check if test content has a specific pattern
   */
  hasTestPattern(testContent, pattern) {
    return pattern.test(testContent);
  }

  /**
   * Categorize gaps by type
   */
  categorizeGaps(analysis) {
    analysis.testingGaps.forEach((gap) => {
      const category = gap.type + 'Gaps';
      if (this.gaps[category]) {
        this.gaps[category].push({
          component: analysis.name,
          ...gap,
        });
      }
    });
  }

  /**
   * Generate comprehensive gap report
   */
  generateGapReport() {
    console.log('\\n📋 Testing Gap Analysis Report');
    console.log('==============================\\n');

    let totalGaps = 0;
    let highSeverityGaps = 0;

    Object.entries(this.gaps).forEach(([category, gaps]) => {
      if (gaps.length === 0) return;

      totalGaps += gaps.length;
      highSeverityGaps += gaps.filter((g) => g.severity === 'high').length;

      console.log(`\\n🔴 ${category.replace('Gaps', '').toUpperCase()} GAPS (${gaps.length}):`);
      gaps.forEach((gap) => {
        const icon = gap.severity === 'high' ? '🚨' : gap.severity === 'medium' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} ${gap.component}: ${gap.description}`);
      });
    });

    console.log(`\\n📊 Summary:`);
    console.log(`- Total Gaps: ${totalGaps}`);
    console.log(`- High Severity: ${highSeverityGaps}`);
    console.log(`- Medium/Low Severity: ${totalGaps - highSeverityGaps}`);

    if (totalGaps === 0) {
      console.log('\\n🎉 No significant testing gaps detected!');
    }
  }

  /**
   * Generate specific recommendations
   */
  generateRecommendations() {
    console.log('\\n💡 Specific Testing Recommendations');
    console.log('===================================\\n');

    // Priority recommendations based on gaps found
    const priorityRecommendations = [
      {
        category: 'Event Propagation Testing',
        description: 'Add comprehensive event propagation tests',
        tests: [
          'Test preventDefault() behavior in forms',
          'Test stopPropagation() in nested components',
          'Test event bubbling vs capturing',
          'Test click event delegation',
        ],
      },
      {
        category: 'Disabled State Robustness',
        description: 'Ensure disabled components truly prevent all interactions',
        tests: [
          'Test clicks on disabled elements do nothing',
          'Test keyboard activation on disabled elements',
          'Test form submission with disabled controls',
          'Test screen reader announcements for disabled state',
        ],
      },
      {
        category: 'Rapid Click Protection',
        description: 'Prevent issues from rapid or duplicate clicks',
        tests: [
          'Test double-click prevention mechanisms',
          'Test click debouncing/throttling',
          'Test async operation conflict prevention',
          'Test click during loading states',
        ],
      },
      {
        category: 'Cross-Platform Compatibility',
        description: 'Ensure consistent behavior across devices',
        tests: [
          'Test touch events vs mouse events',
          'Test mobile device interactions',
          'Test different browser implementations',
          'Test assistive technology compatibility',
        ],
      },
      {
        category: 'Form Integration Robustness',
        description: 'Ensure proper form behavior',
        tests: [
          'Test form submission prevention when appropriate',
          'Test form validation integration',
          'Test multiple submit button behavior',
          'Test form data persistence during errors',
        ],
      },
    ];

    priorityRecommendations.forEach((rec) => {
      console.log(`🎯 ${rec.category}:`);
      console.log(`   ${rec.description}\\n`);
      rec.tests.forEach((test) => {
        console.log(`   ✓ ${test}`);
      });
      console.log('');
    });

    console.log('🔧 Implementation Patterns:\\n');
    console.log('1. **Disabled State Pattern**:');
    console.log('   ```typescript');
    console.log('   it("should not respond to clicks when disabled", () => {');
    console.log('     cy.mount(html`<usa-component disabled></usa-component>`);');
    console.log('     cy.get("usa-component").click({ force: true });');
    console.log('     // Verify no action taken');
    console.log('   });');
    console.log('   ```\\n');

    console.log('2. **Event Propagation Pattern**:');
    console.log('   ```typescript');
    console.log('   it("should prevent event bubbling appropriately", () => {');
    console.log('     let parentClicked = false;');
    console.log('     cy.mount(html`<div @click="\\${() => parentClicked = true}">');
    console.log('       <usa-component></usa-component>');
    console.log('     </div>`);');
    console.log('     cy.get("usa-component").click();');
    console.log('     // Verify parent not clicked if propagation stopped');
    console.log('   });');
    console.log('   ```\\n');

    console.log('3. **Rapid Click Pattern**:');
    console.log('   ```typescript');
    console.log('   it("should handle rapid successive clicks", () => {');
    console.log('     cy.mount(html`<usa-component></usa-component>`);');
    console.log('     cy.get("usa-component").click().click().click();');
    console.log('     // Verify only one action or proper debouncing');
    console.log('   });');
    console.log('   ```\\n');

    console.log('4. **Mobile Touch Pattern**:');
    console.log('   ```typescript');
    console.log('   it("should handle touch events on mobile", () => {');
    console.log('     cy.viewport("iphone-6");');
    console.log('     cy.mount(html`<usa-component></usa-component>`);');
    console.log('     cy.get("usa-component").trigger("touchstart").trigger("touchend");');
    console.log('     // Verify touch interaction works');
    console.log('   });');
    console.log('   ```\\n');
  }
}

// Main execution
async function main() {
  const analyzer = new TestingGapAnalyzer();
  const gaps = await analyzer.analyzeGaps();

  // Calculate overall risk score
  const totalGaps = Object.values(gaps).reduce((sum, gapArray) => sum + gapArray.length, 0);
  const highSeverityGaps = Object.values(gaps)
    .flat()
    .filter((gap) => gap.severity === 'high').length;

  console.log(`\\n📈 Risk Assessment:`);
  console.log(
    `- Overall Risk: ${totalGaps === 0 ? 'LOW' : highSeverityGaps > 5 ? 'HIGH' : 'MEDIUM'}`
  );
  console.log(`- Critical Gaps: ${highSeverityGaps}`);
  console.log(`- Total Concerns: ${totalGaps}`);

  if (totalGaps > 0) {
    console.log(`\\n🚨 Recommended Actions:`);
    console.log(`1. Address high-severity gaps immediately`);
    console.log(`2. Implement enhanced test patterns`);
    console.log(`3. Add cross-browser and mobile testing`);
    console.log(`4. Establish click event testing standards`);
    console.log(`5. Consider automated testing of edge cases`);
  }

  return totalGaps;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then((gaps) => {
      process.exit(gaps > 10 ? 1 : 0); // Exit with error if too many gaps
    })
    .catch(console.error);
}

export { TestingGapAnalyzer };
