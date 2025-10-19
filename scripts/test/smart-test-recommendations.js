#!/usr/bin/env node

/**
 * 💡 Smart Test Recommendations Engine
 *
 * AI-powered analysis and recommendations for test improvements, gap analysis,
 * and better testing practices.
 *
 * Features:
 * - Intelligent test gap analysis
 * - Code coverage enhancement suggestions
 * - Test quality scoring and recommendations
 * - Best practices validation
 * - Component testing completeness analysis
 * - Performance testing recommendations
 *
 * Part of Phase 5: Advanced Testing Optimization
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class SmartTestRecommendationsEngine {
  constructor(options = {}) {
    this.options = {
      analysisDepth: options.analysisDepth || 'comprehensive', // basic, standard, comprehensive
      includePerformance: options.includePerformance !== false,
      includeAccessibility: options.includeAccessibility !== false,
      generateFixes: options.generateFixes !== false,
      priorityFilter: options.priorityFilter || 'all', // high, medium, low, all
      componentFilter: options.componentFilter || [], // Specific components to analyze
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      outputFormat: options.outputFormat || 'console', // console, json, markdown
      ...options
    };

    this.components = [];
    this.testFiles = [];
    this.coverageData = null;
    this.recommendations = [];
    this.analysisResults = {
      totalComponents: 0,
      totalTests: 0,
      coveragePercentage: 0,
      qualityScore: 0,
      gapsFound: 0,
      recommendationsGenerated: 0
    };
  }

  /**
   * Main entry point for smart test recommendations
   */
  async generateRecommendations() {
    console.log('💡 Smart Test Recommendations Engine');
    console.log('====================================\n');

    try {
      // Step 1: Analyze codebase structure
      await this.analyzeCodebaseStructure();

      // Step 2: Analyze test coverage
      await this.analyzeCoverage();

      // Step 3: Perform gap analysis
      await this.performGapAnalysis();

      // Step 4: Generate quality recommendations
      await this.generateQualityRecommendations();

      // Step 5: Generate accessibility recommendations
      if (this.options.includeAccessibility) {
        await this.generateAccessibilityRecommendations();
      }

      // Step 6: Generate performance recommendations
      if (this.options.includePerformance) {
        await this.generatePerformanceRecommendations();
      }

      // Step 7: Output recommendations
      await this.outputRecommendations();

    } catch (error) {
      console.error('❌ Error generating recommendations:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Analyze codebase structure and discover components
   */
  async analyzeCodebaseStructure() {
    console.log('🔍 Analyzing Codebase Structure...');

    // Find all component files
    this.components = await this.discoverComponents();

    // Find all test files
    this.testFiles = await this.discoverTestFiles();

    // Analyze component complexity
    for (const component of this.components) {
      component.complexity = await this.analyzeComponentComplexity(component);
      component.testCoverage = await this.analyzeComponentTestCoverage(component);
    }

    this.analysisResults.totalComponents = this.components.length;
    this.analysisResults.totalTests = this.testFiles.length;

    console.log(`   Found ${this.components.length} components`);
    console.log(`   Found ${this.testFiles.length} test files`);

    if (this.options.verbose) {
      console.log('\n   Component Analysis:');
      this.components.slice(0, 5).forEach(comp => {
        console.log(`     - ${comp.name}: complexity ${comp.complexity.score}, ${comp.testCoverage.tests} tests`);
      });
    }
  }

  /**
   * Analyze test coverage data
   */
  async analyzeCoverage() {
    console.log('\n📊 Analyzing Test Coverage...');

    try {
      // Try to get coverage data from previous runs
      const coverageFile = path.join(rootDir, 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coverageFile)) {
        this.coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

        const total = this.coverageData.total;
        if (total) {
          this.analysisResults.coveragePercentage = total.lines?.pct || 0;
          console.log(`   Overall Coverage: ${this.analysisResults.coveragePercentage}%`);
          console.log(`   Lines: ${total.lines?.covered}/${total.lines?.total}`);
          console.log(`   Functions: ${total.functions?.covered}/${total.functions?.total}`);
          console.log(`   Branches: ${total.branches?.covered}/${total.branches?.total}`);
        }
      } else {
        console.log('   No coverage data found - running coverage analysis...');
        await this.runCoverageAnalysis();
      }
    } catch (error) {
      console.log('   Coverage analysis failed, using component-level analysis');
      this.coverageData = null;
    }
  }

  /**
   * Perform comprehensive gap analysis
   */
  async performGapAnalysis() {
    console.log('\n🔍 Performing Gap Analysis...');

    const gaps = [];

    // Component without tests
    const untestedComponents = this.components.filter(comp => comp.testCoverage.tests === 0);
    if (untestedComponents.length > 0) {
      gaps.push({
        type: 'missing-tests',
        severity: 'high',
        count: untestedComponents.length,
        components: untestedComponents.map(c => c.name),
        description: 'Components without any test coverage'
      });
    }

    // Complex components with insufficient tests
    const undertestedComponents = this.components.filter(comp =>
      comp.complexity.score > 50 && comp.testCoverage.tests < 3
    );
    if (undertestedComponents.length > 0) {
      gaps.push({
        type: 'insufficient-tests',
        severity: 'medium',
        count: undertestedComponents.length,
        components: undertestedComponents.map(c => c.name),
        description: 'Complex components with insufficient test coverage'
      });
    }

    // Interactive components without accessibility tests
    const accessibilityGaps = this.components.filter(comp =>
      comp.complexity.isInteractive && !comp.testCoverage.hasAccessibilityTests
    );
    if (accessibilityGaps.length > 0) {
      gaps.push({
        type: 'missing-accessibility-tests',
        severity: 'high',
        count: accessibilityGaps.length,
        components: accessibilityGaps.map(c => c.name),
        description: 'Interactive components without accessibility tests'
      });
    }

    // Form components without validation tests
    const validationGaps = this.components.filter(comp =>
      comp.complexity.isFormComponent && !comp.testCoverage.hasValidationTests
    );
    if (validationGaps.length > 0) {
      gaps.push({
        type: 'missing-validation-tests',
        severity: 'high',
        count: validationGaps.length,
        components: validationGaps.map(c => c.name),
        description: 'Form components without validation tests'
      });
    }

    // Components without error handling tests
    const errorHandlingGaps = this.components.filter(comp =>
      comp.complexity.score > 30 && !comp.testCoverage.hasErrorTests
    );
    if (errorHandlingGaps.length > 0) {
      gaps.push({
        type: 'missing-error-tests',
        severity: 'medium',
        count: errorHandlingGaps.length,
        components: errorHandlingGaps.map(c => c.name),
        description: 'Components without error handling tests'
      });
    }

    this.analysisResults.gapsFound = gaps.length;

    console.log(`   Found ${gaps.length} testing gaps:`);
    gaps.forEach(gap => {
      const severity = gap.severity.toUpperCase().padEnd(6);
      console.log(`     ${severity} ${gap.description} (${gap.count} components)`);
    });

    return gaps;
  }

  /**
   * Generate quality-focused recommendations
   */
  async generateQualityRecommendations() {
    console.log('\n⭐ Generating Quality Recommendations...');

    const recommendations = [];

    // Test structure recommendations
    const structureIssues = await this.analyzeTestStructure();
    structureIssues.forEach(issue => {
      recommendations.push({
        category: 'structure',
        priority: issue.severity,
        title: issue.title,
        description: issue.description,
        impact: issue.impact,
        effort: issue.effort,
        autoFixable: issue.autoFixable || false
      });
    });

    // Coverage improvement recommendations
    const coverageIssues = await this.analyzeCoverageGaps();
    coverageIssues.forEach(issue => {
      recommendations.push({
        category: 'coverage',
        priority: issue.severity,
        title: issue.title,
        description: issue.description,
        impact: issue.impact,
        effort: issue.effort,
        autoFixable: false
      });
    });

    // Best practices recommendations
    const practiceIssues = await this.analyzeBestPractices();
    practiceIssues.forEach(issue => {
      recommendations.push({
        category: 'best-practices',
        priority: issue.severity,
        title: issue.title,
        description: issue.description,
        impact: issue.impact,
        effort: issue.effort,
        autoFixable: issue.autoFixable || false
      });
    });

    this.recommendations.push(...recommendations);

    console.log(`   Generated ${recommendations.length} quality recommendations`);
  }

  /**
   * Generate accessibility-specific recommendations
   */
  async generateAccessibilityRecommendations() {
    console.log('\n♿ Generating Accessibility Recommendations...');

    const a11yRecommendations = [];

    // Find components missing accessibility tests
    const missingA11yTests = this.components.filter(comp =>
      comp.complexity.isInteractive && !comp.testCoverage.hasAccessibilityTests
    );

    missingA11yTests.forEach(comp => {
      a11yRecommendations.push({
        category: 'accessibility',
        priority: 'high',
        title: `Add accessibility tests for ${comp.name}`,
        description: `Interactive component ${comp.name} should have comprehensive accessibility tests including ARIA attributes, keyboard navigation, and screen reader compatibility.`,
        impact: 'High - Ensures compliance with WCAG guidelines',
        effort: 'Medium',
        component: comp.name,
        autoFixable: false,
        suggestions: [
          'Add axe-core accessibility testing',
          'Test keyboard navigation patterns',
          'Verify ARIA labels and roles',
          'Test with screen readers',
          'Validate focus management'
        ]
      });
    });

    // Check for ARIA testing gaps
    const ariaGaps = this.components.filter(comp =>
      (comp.complexity.hasAriaAttributes && !comp.testCoverage.hasAriaTests) ||
      (comp.complexity.isInteractive && !comp.testCoverage.hasKeyboardTests)
    );

    ariaGaps.forEach(comp => {
      a11yRecommendations.push({
        category: 'accessibility',
        priority: 'high',
        title: `Enhance ARIA testing for ${comp.name}`,
        description: `Component ${comp.name} uses ARIA attributes but lacks comprehensive ARIA testing.`,
        impact: 'High - Critical for screen reader users',
        effort: 'Low',
        component: comp.name,
        autoFixable: true,
        suggestions: [
          'Test ARIA attribute values',
          'Verify dynamic ARIA updates',
          'Test role assignments',
          'Validate describedby relationships'
        ]
      });
    });

    this.recommendations.push(...a11yRecommendations);

    console.log(`   Generated ${a11yRecommendations.length} accessibility recommendations`);
  }

  /**
   * Generate performance-specific recommendations
   */
  async generatePerformanceRecommendations() {
    console.log('\n⚡ Generating Performance Recommendations...');

    const perfRecommendations = [];

    // Find complex components without performance tests
    const missingPerfTests = this.components.filter(comp =>
      comp.complexity.score > 70 && !comp.testCoverage.hasPerformanceTests
    );

    missingPerfTests.forEach(comp => {
      perfRecommendations.push({
        category: 'performance',
        priority: 'medium',
        title: `Add performance tests for ${comp.name}`,
        description: `High-complexity component ${comp.name} should have performance tests to ensure it meets performance budgets.`,
        impact: 'Medium - Prevents performance regressions',
        effort: 'Medium',
        component: comp.name,
        autoFixable: false,
        suggestions: [
          'Add render performance tests',
          'Test update cycle efficiency',
          'Measure memory usage',
          'Test with large datasets',
          'Benchmark critical user paths'
        ]
      });
    });

    // Check for components with many event listeners
    const eventHeavyComponents = this.components.filter(comp =>
      comp.complexity.eventListenerCount > 5 && !comp.testCoverage.hasEventTests
    );

    eventHeavyComponents.forEach(comp => {
      perfRecommendations.push({
        category: 'performance',
        priority: 'medium',
        title: `Test event handling efficiency for ${comp.name}`,
        description: `Component ${comp.name} has multiple event listeners and should be tested for event handling efficiency.`,
        impact: 'Medium - Prevents event-related performance issues',
        effort: 'Low',
        component: comp.name,
        autoFixable: true,
        suggestions: [
          'Test event debouncing',
          'Verify event listener cleanup',
          'Test rapid event sequences',
          'Measure event processing time'
        ]
      });
    });

    this.recommendations.push(...perfRecommendations);

    console.log(`   Generated ${perfRecommendations.length} performance recommendations`);
  }

  /**
   * Output recommendations in the specified format
   */
  async outputRecommendations() {
    console.log('\n📋 Test Recommendations Summary');
    console.log('===============================');

    // Filter by priority if specified
    let filteredRecommendations = this.recommendations;
    if (this.options.priorityFilter !== 'all') {
      filteredRecommendations = this.recommendations.filter(rec =>
        rec.priority === this.options.priorityFilter
      );
    }

    // Sort by priority and impact
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    filteredRecommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impact.localeCompare(a.impact);
    });

    this.analysisResults.recommendationsGenerated = filteredRecommendations.length;

    // Calculate quality score
    this.analysisResults.qualityScore = this.calculateQualityScore();

    // Display summary
    console.log(`   Quality Score: ${this.analysisResults.qualityScore}/100`);
    console.log(`   Total Recommendations: ${this.analysisResults.recommendationsGenerated}`);
    console.log(`   Coverage: ${this.analysisResults.coveragePercentage}%`);
    console.log(`   Gaps Found: ${this.analysisResults.gapsFound}`);

    // Display top recommendations
    console.log('\n   🔥 Top Priority Recommendations:');
    filteredRecommendations.slice(0, 10).forEach((rec, index) => {
      const priority = rec.priority.toUpperCase().padEnd(6);
      const category = rec.category.padEnd(12);
      console.log(`   ${(index + 1).toString().padStart(2)}. [${priority}] [${category}] ${rec.title}`);
      if (this.options.verbose) {
        console.log(`       ${rec.description}`);
        console.log(`       Impact: ${rec.impact} | Effort: ${rec.effort}`);
        if (rec.autoFixable) {
          console.log(`       ✨ Auto-fixable`);
        }
      }
    });

    // Group by category
    const byCategory = filteredRecommendations.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n   📊 Recommendations by Category:');
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`     ${category}: ${count} recommendations`);
    });

    // Save detailed report if requested
    if (this.options.outputFormat === 'json' || this.options.outputFormat === 'markdown') {
      await this.saveDetailedReport(filteredRecommendations);
    }

    return {
      summary: this.analysisResults,
      recommendations: filteredRecommendations
    };
  }

  // Helper methods

  async discoverComponents() {
    try {
      const output = execSync('find src/components -name "*.ts" ! -name "*.test.ts" ! -name "*.stories.ts" ! -name "*.cy.ts"', {
        encoding: 'utf8',
        cwd: rootDir
      });

      return output.trim().split('\n').filter(Boolean).map(file => ({
        path: file,
        name: path.basename(file, '.ts'),
        directory: path.dirname(file)
      }));
    } catch (error) {
      return [];
    }
  }

  async discoverTestFiles() {
    try {
      const output = execSync('find . -name "*.test.ts" -o -name "*.spec.ts" -o -name "*.cy.ts" | grep -v node_modules', {
        encoding: 'utf8',
        cwd: rootDir
      });

      return output.trim().split('\n').filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  async analyzeComponentComplexity(component) {
    try {
      const content = fs.readFileSync(path.join(rootDir, component.path), 'utf8');

      const complexity = {
        score: 0,
        linesOfCode: content.split('\n').length,
        isInteractive: this.isInteractiveComponent(content),
        isFormComponent: this.isFormComponent(content),
        hasAriaAttributes: /aria-|role=/.test(content),
        eventListenerCount: (content.match(/addEventListener|@\w+=/g) || []).length,
        stateProperties: (content.match(/@property|@state/g) || []).length,
        methodCount: (content.match(/^\s*(?:private |protected |public )?[a-zA-Z_][a-zA-Z0-9_]*\s*\(/gm) || []).length
      };

      // Calculate complexity score
      complexity.score = Math.min(100,
        (complexity.linesOfCode / 10) +
        (complexity.eventListenerCount * 5) +
        (complexity.stateProperties * 3) +
        (complexity.methodCount * 2) +
        (complexity.isInteractive ? 20 : 0) +
        (complexity.isFormComponent ? 15 : 0)
      );

      return complexity;
    } catch (error) {
      return { score: 0, isInteractive: false, isFormComponent: false };
    }
  }

  async analyzeComponentTestCoverage(component) {
    const testFilePatterns = [
      component.path.replace('.ts', '.test.ts'),
      component.path.replace('.ts', '.spec.ts'),
      component.path.replace('.ts', '.cy.ts'),
      component.path.replace('.ts', '.component.cy.ts')
    ];

    const coverage = {
      tests: 0,
      hasAccessibilityTests: false,
      hasValidationTests: false,
      hasErrorTests: false,
      hasPerformanceTests: false,
      hasAriaTests: false,
      hasKeyboardTests: false,
      hasEventTests: false
    };

    for (const testPattern of testFilePatterns) {
      const testPath = path.join(rootDir, testPattern);
      if (fs.existsSync(testPath)) {
        coverage.tests++;

        try {
          const testContent = fs.readFileSync(testPath, 'utf8');

          coverage.hasAccessibilityTests = /accessibility|a11y|axe|screen.reader/i.test(testContent);
          coverage.hasValidationTests = /validation|validate|invalid|error/i.test(testContent);
          coverage.hasErrorTests = /error|exception|throw|catch/i.test(testContent);
          coverage.hasPerformanceTests = /performance|benchmark|timing|memory/i.test(testContent);
          coverage.hasAriaTests = /aria|role/i.test(testContent);
          coverage.hasKeyboardTests = /keyboard|keydown|keyup|focus|blur/i.test(testContent);
          coverage.hasEventTests = /event|click|change|input/i.test(testContent);
        } catch (error) {
          // Ignore file read errors
        }
      }
    }

    return coverage;
  }

  isInteractiveComponent(content) {
    const interactivePatterns = [
      /addEventListener/, /@click/, /@change/, /@input/,
      /button|input|select|textarea/i,
      /interactive|clickable|focusable/i
    ];
    return interactivePatterns.some(pattern => pattern.test(content));
  }

  isFormComponent(content) {
    const formPatterns = [
      /form|input|select|textarea|checkbox|radio/i,
      /validation|validate|required|pattern/i,
      /FormData|form-data/i
    ];
    return formPatterns.some(pattern => pattern.test(content));
  }

  async runCoverageAnalysis() {
    try {
      execSync('npm run test:coverage', { cwd: rootDir, stdio: 'pipe' });
      return this.analyzeCoverage();
    } catch (error) {
      console.log('   Failed to run coverage analysis');
      return null;
    }
  }

  async analyzeTestStructure() {
    // Analyze test file structure and patterns
    return [
      {
        severity: 'medium',
        title: 'Standardize test file organization',
        description: 'Some test files do not follow the standard naming convention',
        impact: 'Improves maintainability and discoverability',
        effort: 'Low',
        autoFixable: true
      }
    ];
  }

  async analyzeCoverageGaps() {
    // Analyze coverage gaps
    const gaps = [];

    if (this.analysisResults.coveragePercentage < 80) {
      gaps.push({
        severity: 'high',
        title: 'Increase overall test coverage',
        description: `Current coverage is ${this.analysisResults.coveragePercentage}%. Target is 80%+`,
        impact: 'High - Reduces risk of undetected bugs',
        effort: 'High'
      });
    }

    return gaps;
  }

  async analyzeBestPractices() {
    // Analyze adherence to testing best practices
    return [
      {
        severity: 'medium',
        title: 'Implement test data factories',
        description: 'Use consistent test data generation patterns',
        impact: 'Improves test reliability and maintenance',
        effort: 'Medium',
        autoFixable: false
      }
    ];
  }

  calculateQualityScore() {
    let score = 0;

    // Coverage contribution (40%)
    score += (this.analysisResults.coveragePercentage / 100) * 40;

    // Test completeness contribution (30%)
    const testedComponents = this.components.filter(c => c.testCoverage.tests > 0).length;
    const completeness = this.components.length > 0 ? (testedComponents / this.components.length) : 1;
    score += completeness * 30;

    // Accessibility testing contribution (20%)
    const a11yTested = this.components.filter(c => c.testCoverage.hasAccessibilityTests).length;
    const a11yCompleteness = this.components.length > 0 ? (a11yTested / this.components.length) : 1;
    score += a11yCompleteness * 20;

    // Best practices contribution (10%)
    const practicesScore = Math.max(0, 100 - (this.analysisResults.gapsFound * 10));
    score += (practicesScore / 100) * 10;

    return Math.round(score);
  }

  async saveDetailedReport(recommendations) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.analysisResults,
      components: this.components.map(c => ({
        name: c.name,
        complexity: c.complexity.score,
        testCount: c.testCoverage.tests,
        hasA11yTests: c.testCoverage.hasAccessibilityTests
      })),
      recommendations: recommendations,
      metadata: {
        analysisDepth: this.options.analysisDepth,
        totalRecommendations: recommendations.length,
        categories: [...new Set(recommendations.map(r => r.category))]
      }
    };

    if (this.options.outputFormat === 'json') {
      const reportPath = path.join(rootDir, 'test-recommendations-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n   💾 Detailed JSON report saved to: ${reportPath}`);
    }

    if (this.options.outputFormat === 'markdown') {
      const markdownReport = this.generateMarkdownReport(report);
      const reportPath = path.join(rootDir, 'TEST_RECOMMENDATIONS.md');
      fs.writeFileSync(reportPath, markdownReport);
      console.log(`   📄 Markdown report saved to: ${reportPath}`);
    }
  }

  generateMarkdownReport(report) {
    return `# Test Recommendations Report

**Generated:** ${report.timestamp}
**Quality Score:** ${report.summary.qualityScore}/100

## Summary

- **Components Analyzed:** ${report.summary.totalComponents}
- **Test Files:** ${report.summary.totalTests}
- **Coverage:** ${report.summary.coveragePercentage}%
- **Recommendations:** ${report.summary.recommendationsGenerated}

## Recommendations

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title}

- **Priority:** ${rec.priority.toUpperCase()}
- **Category:** ${rec.category}
- **Impact:** ${rec.impact}
- **Effort:** ${rec.effort}
${rec.autoFixable ? '- **Auto-fixable:** ✅' : ''}

${rec.description}

${rec.suggestions ? rec.suggestions.map(s => `- ${s}`).join('\n') : ''}
`).join('\n')}

## Component Analysis

${report.components.slice(0, 20).map(comp => `
- **${comp.name}**: Complexity ${comp.complexity}, ${comp.testCount} tests${comp.hasA11yTests ? ' ♿' : ''}
`).join('')}
`;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--analysis-depth') {
      options.analysisDepth = args[++i];
    } else if (arg === '--priority') {
      options.priorityFilter = args[++i];
    } else if (arg === '--output') {
      options.outputFormat = args[++i];
    } else if (arg === '--no-performance') {
      options.includePerformance = false;
    } else if (arg === '--no-accessibility') {
      options.includeAccessibility = false;
    } else if (arg === '--generate-fixes') {
      options.generateFixes = true;
    } else if (arg === '--component') {
      options.componentFilter = args[++i].split(',');
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
💡 Smart Test Recommendations Engine

Usage: node smart-test-recommendations.js [options]

Options:
  --dry-run                      Analyze only, don't generate files
  --verbose, -v                  Verbose output
  --analysis-depth <level>       Analysis depth (basic|standard|comprehensive)
  --priority <level>             Filter by priority (high|medium|low|all)
  --output <format>              Output format (console|json|markdown)
  --component <names>            Analyze specific components (comma-separated)
  --no-performance               Skip performance recommendations
  --no-accessibility             Skip accessibility recommendations
  --generate-fixes               Generate automated fixes where possible
  --help, -h                     Show this help

Examples:
  node smart-test-recommendations.js --verbose
  node smart-test-recommendations.js --priority high --output markdown
  node smart-test-recommendations.js --component button,modal --analysis-depth comprehensive
      `);
      process.exit(0);
    }
  }

  const engine = new SmartTestRecommendationsEngine(options);
  await engine.generateRecommendations();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { SmartTestRecommendationsEngine };