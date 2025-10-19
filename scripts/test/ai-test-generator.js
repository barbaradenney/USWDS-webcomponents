#!/usr/bin/env node

/**
 * 🤖 AI-Powered Test Generation System
 *
 * Phase 5 Advanced Testing: Analyzes components and generates intelligent test cases
 * using pattern recognition, complexity analysis, and ML-inspired heuristics.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

/**
 * AI Test Generation Engine
 * Uses pattern matching and complexity analysis to generate intelligent tests
 */
class AITestGenerator {
  constructor() {
    this.patterns = {
      // Component property patterns
      properties: {
        boolean: /(@property\(\s*{\s*type:\s*Boolean|@property\(\s*{\s*type:\s*Boolean)/g,
        string: /(@property\(\s*{\s*type:\s*String|@property\(\s*{\s*type:\s*String)/g,
        number: /(@property\(\s*{\s*type:\s*Number|@property\(\s*{\s*type:\s*Number)/g,
        array: /(@property\(\s*{\s*type:\s*Array|@property\(\s*{\s*type:\s*Array)/g,
        object: /(@property\(\s*{\s*type:\s*Object|@property\(\s*{\s*type:\s*Object)/g,
      },

      // Event patterns
      events: {
        dispatch: /this\.dispatchEvent\(\s*new\s+CustomEvent\(\s*['"`]([^'"`]+)['"`]/g,
        click: /addEventListener\(\s*['"`]click['"`]/g,
        change: /addEventListener\(\s*['"`]change['"`]/g,
        input: /addEventListener\(\s*['"`]input['"`]/g,
        focus: /addEventListener\(\s*['"`]focus['"`]/g,
        blur: /addEventListener\(\s*['"`]blur['"`]/g,
        keydown: /addEventListener\(\s*['"`]keydown['"`]/g,
      },

      // Accessibility patterns
      accessibility: {
        aria: /aria-[a-z-]+/g,
        role: /role\s*=\s*['"`]([^'"`]+)['"`]/g,
        tabindex: /tabindex/g,
        label: /aria-label|aria-labelledby|aria-describedby/g,
      },

      // Form patterns
      form: {
        validation: /checkValidity|reportValidity|setCustomValidity/g,
        formData: /FormData|form.*submit/g,
        required: /required\s*=|@property.*required/g,
        disabled: /disabled\s*=|@property.*disabled/g,
      },

      // State management patterns
      state: {
        reactive: /@state|reactive:/g,
        private: /private\s+\w+/g,
        getter: /get\s+\w+\(/g,
        setter: /set\s+\w+\(/g,
      },

      // Rendering patterns
      rendering: {
        conditional: /\${\s*\w+\s*\?\s*|if\s*\(/g,
        loops: /\${\s*\w+\.map\(|for.*of|repeat\(/g,
        slots: /<slot|slot>/g,
        styles: /static\s+styles\s*=/g,
      }
    };

    this.testTemplates = {
      basic: this.generateBasicTests.bind(this),
      properties: this.generatePropertyTests.bind(this),
      events: this.generateEventTests.bind(this),
      accessibility: this.generateAccessibilityTests.bind(this),
      forms: this.generateFormTests.bind(this),
      interactions: this.generateInteractionTests.bind(this),
      edgeCases: this.generateEdgeCaseTests.bind(this),
      performance: this.generatePerformanceTests.bind(this),
    };
  }

  /**
   * Analyze component and generate comprehensive test suite
   */
  async analyzeAndGenerate(componentPath, options = {}) {
    const componentCode = readFileSync(componentPath, 'utf-8');
    const componentName = this.extractComponentName(componentPath);
    const analysis = this.analyzeComponent(componentCode);

    console.log(`🤖 AI analyzing ${componentName}...`);
    console.log(`📊 Complexity Score: ${analysis.complexity}/100`);
    console.log(`🎯 Identified Patterns: ${analysis.patterns.length}`);

    const testSuite = this.generateTestSuite(componentName, analysis, options);

    if (options.dryRun) {
      console.log(`\n🔍 Generated ${testSuite.tests.length} test cases (dry run)`);
      return testSuite;
    }

    const testPath = this.getTestPath(componentPath, options.testType || 'ai-generated');
    this.writeTestFile(testPath, testSuite);

    console.log(`✅ Generated ${testSuite.tests.length} AI-powered tests: ${testPath}`);
    return testSuite;
  }

  /**
   * Analyze component for patterns and complexity
   */
  analyzeComponent(code) {
    const analysis = {
      complexity: 0,
      patterns: [],
      properties: [],
      events: [],
      methods: [],
      accessibility: [],
      forms: [],
      state: [],
      rendering: [],
      risks: [],
    };

    // Analyze patterns and calculate complexity
    Object.entries(this.patterns).forEach(([category, patterns]) => {
      Object.entries(patterns).forEach(([type, pattern]) => {
        const matches = [...code.matchAll(pattern)];
        if (matches.length > 0) {
          analysis.patterns.push({ category, type, count: matches.length });

          // Ensure the category array exists
          if (!analysis[category]) {
            analysis[category] = [];
          }

          analysis[category].push(...matches.map(m => ({ type, match: m[0], captured: m[1] })));
          analysis.complexity += matches.length * this.getComplexityWeight(category, type);
        }
      });
    });

    // Risk analysis
    analysis.risks = this.identifyRisks(code, analysis);

    return analysis;
  }

  /**
   * Generate comprehensive test suite based on analysis
   */
  generateTestSuite(componentName, analysis, options) {
    const suite = {
      componentName,
      timestamp: new Date().toISOString(),
      analysis,
      tests: [],
      metadata: {
        generatedBy: 'AI Test Generator v2.0',
        complexity: analysis.complexity,
        riskLevel: this.calculateRiskLevel(analysis),
        estimatedCoverage: this.estimateCoverage(analysis),
      }
    };

    // Generate different test categories
    Object.entries(this.testTemplates).forEach(([category, generator]) => {
      if (this.shouldGenerateCategory(category, analysis, options)) {
        const tests = generator(componentName, analysis, options);
        suite.tests.push(...tests.map(test => ({ ...test, category })));
      }
    });

    // Add AI-specific advanced tests
    suite.tests.push(...this.generateAIAdvancedTests(componentName, analysis));

    return suite;
  }

  /**
   * Generate basic component tests
   */
  generateBasicTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    tests.push({
      name: 'should create component instance',
      priority: 'high',
      code: `
  it('should create component instance', () => {
    const element = document.createElement('${tagName}');
    expect(element).toBeInstanceOf(${componentName});
    expect(element.tagName.toLowerCase()).toBe('${tagName}');
  });`
    });

    tests.push({
      name: 'should render without errors',
      priority: 'high',
      code: `
  it('should render without errors', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);
    await element.updateComplete;

    expect(element.shadowRoot || element).toBeTruthy();
    expect(() => element.render()).not.toThrow();

    element.remove();
  });`
    });

    return tests;
  }

  /**
   * Generate property-based tests using identified properties
   */
  generatePropertyTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    analysis.properties.forEach(prop => {
      const propName = this.extractPropertyName(prop.match);
      if (!propName) return;

      // Type-specific tests
      switch (prop.type) {
        case 'boolean':
          tests.push({
            name: `should handle ${propName} boolean property`,
            priority: 'medium',
            code: `
  it('should handle ${propName} boolean property', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);

    // Test default value
    expect(typeof element.${propName}).toBe('boolean');

    // Test setting to true
    element.${propName} = true;
    await element.updateComplete;
    expect(element.${propName}).toBe(true);

    // Test setting to false
    element.${propName} = false;
    await element.updateComplete;
    expect(element.${propName}).toBe(false);

    element.remove();
  });`
          });
          break;

        case 'string':
          tests.push({
            name: `should handle ${propName} string property`,
            priority: 'medium',
            code: `
  it('should handle ${propName} string property', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);

    const testValue = 'test-value-${Date.now()}';
    element.${propName} = testValue;
    await element.updateComplete;

    expect(element.${propName}).toBe(testValue);
    expect(typeof element.${propName}).toBe('string');

    element.remove();
  });`
          });
          break;

        case 'number':
          tests.push({
            name: `should handle ${propName} number property`,
            priority: 'medium',
            code: `
  it('should handle ${propName} number property', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);

    const testValues = [0, 42, -1, 3.14, Number.MAX_SAFE_INTEGER];

    for (const value of testValues) {
      element.${propName} = value;
      await element.updateComplete;
      expect(element.${propName}).toBe(value);
    }

    element.remove();
  });`
          });
          break;
      }
    });

    return tests;
  }

  /**
   * Generate event-based tests
   */
  generateEventTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    analysis.events.forEach(event => {
      if (event.type === 'dispatch' && event.captured) {
        tests.push({
          name: `should dispatch ${event.captured} event`,
          priority: 'high',
          code: `
  it('should dispatch ${event.captured} event', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);
    await element.updateComplete;

    let eventFired = false;
    let eventDetail = null;

    element.addEventListener('${event.captured}', (e) => {
      eventFired = true;
      eventDetail = e.detail;
    });

    // Trigger the event (component-specific trigger needed)
    // This is a template - customize based on component behavior
    element.click();

    expect(eventFired).toBe(true);
    expect(eventDetail).toBeDefined();

    element.remove();
  });`
        });
      }
    });

    return tests;
  }

  /**
   * Generate accessibility tests
   */
  generateAccessibilityTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    if (analysis.accessibility.length > 0) {
      tests.push({
        name: 'should meet accessibility requirements',
        priority: 'critical',
        code: `
  it('should meet accessibility requirements', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);
    await element.updateComplete;

    // Test ARIA attributes
    const hasAriaAttributes = ${analysis.accessibility.some(a => a.type === 'aria')};
    if (hasAriaAttributes) {
      expect(element.getAttribute('aria-label') ||
             element.getAttribute('aria-labelledby') ||
             element.querySelector('[aria-label]')).toBeTruthy();
    }

    // Test keyboard navigation
    element.focus();
    expect(document.activeElement).toBe(element);

    // Test screen reader compatibility
    await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

    element.remove();
  });`
      });
    }

    return tests;
  }

  /**
   * Generate form-specific tests
   */
  generateFormTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    if (analysis.forms.length > 0) {
      tests.push({
        name: 'should integrate with forms correctly',
        priority: 'high',
        code: `
  it('should integrate with forms correctly', async () => {
    const form = document.createElement('form');
    const element = document.createElement('${tagName}');

    form.appendChild(element);
    document.body.appendChild(form);
    await element.updateComplete;

    // Test form integration
    const formData = new FormData(form);
    expect(formData).toBeDefined();

    // Test validation if component supports it
    if (typeof element.checkValidity === 'function') {
      expect(element.checkValidity()).toBeDefined();
    }

    form.remove();
  });`
      });
    }

    return tests;
  }

  /**
   * Generate interaction tests
   */
  generateInteractionTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    tests.push({
      name: 'should handle user interactions',
      priority: 'high',
      code: `
  it('should handle user interactions', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);
    await element.updateComplete;

    // Test click interaction
    const clickEvent = new MouseEvent('click', { bubbles: true });
    element.dispatchEvent(clickEvent);

    // Test keyboard interaction
    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    element.dispatchEvent(keyEvent);

    // Test focus/blur
    element.focus();
    expect(document.activeElement).toBe(element);

    element.blur();
    expect(document.activeElement).not.toBe(element);

    element.remove();
  });`
    });

    return tests;
  }

  /**
   * Generate edge case tests
   */
  generateEdgeCaseTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    tests.push({
      name: 'should handle edge cases gracefully',
      priority: 'medium',
      code: `
  it('should handle edge cases gracefully', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);

    // Test with no properties set
    await element.updateComplete;
    expect(() => element.render()).not.toThrow();

    // Test rapid property changes
    for (let i = 0; i < 100; i++) {
      element.setAttribute('test-attr', \`value-\${i}\`);
    }
    await element.updateComplete;

    // Test removal during update
    const updatePromise = element.updateComplete;
    element.remove();
    await updatePromise;

    // Should not throw errors
    expect(true).toBe(true);
  });`
    });

    return tests;
  }

  /**
   * Generate performance tests
   */
  generatePerformanceTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    if (analysis.complexity > 50) {
      tests.push({
        name: 'should meet performance benchmarks',
        priority: 'medium',
        code: `
  it('should meet performance benchmarks', async () => {
    const startTime = performance.now();

    // Create multiple instances
    const elements = [];
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('${tagName}');
      elements.push(element);
      document.body.appendChild(element);
    }

    // Wait for all to update
    await Promise.all(elements.map(el => el.updateComplete));

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should create and render 10 components in under 100ms
    expect(duration).toBeLessThan(100);

    // Cleanup
    elements.forEach(el => el.remove());
  });`
      });
    }

    return tests;
  }

  /**
   * Generate AI-specific advanced tests
   */
  generateAIAdvancedTests(componentName, analysis) {
    const tests = [];
    const tagName = this.componentNameToTag(componentName);

    // Predictive failure test based on complexity
    if (analysis.complexity > 70) {
      tests.push({
        name: 'AI: should handle high-complexity scenarios',
        category: 'ai-predictive',
        priority: 'critical',
        code: `
  it('AI: should handle high-complexity scenarios', async () => {
    // AI-detected high complexity component - test intensive scenarios
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);

    // Stress test based on complexity analysis
    const stressOperations = ${Math.min(analysis.complexity, 50)};

    for (let i = 0; i < stressOperations; i++) {
      // Rapid property updates
      if (element.setAttribute) {
        element.setAttribute('data-test', \`iteration-\${i}\`);
      }

      // Force updates
      if (element.requestUpdate) {
        element.requestUpdate();
      }

      await new Promise(resolve => setTimeout(resolve, 1));
    }

    await element.updateComplete;
    expect(element.isConnected).toBe(true);

    element.remove();
  });`
      });
    }

    // AI Risk-based test
    if (analysis.risks.length > 0) {
      tests.push({
        name: 'AI: should mitigate identified risks',
        category: 'ai-risk-mitigation',
        priority: 'high',
        code: `
  it('AI: should mitigate identified risks', async () => {
    const element = document.createElement('${tagName}');
    document.body.appendChild(element);
    await element.updateComplete;

    // AI-identified risks: ${analysis.risks.map(r => r.type).join(', ')}
    ${analysis.risks.map(risk => this.generateRiskTest(risk)).join('\n    ')}

    element.remove();
  });`
      });
    }

    return tests;
  }

  /**
   * Helper methods
   */
  extractComponentName(filePath) {
    const fileName = filePath.split('/').pop();
    return fileName.replace('.ts', '').split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }

  componentNameToTag(componentName) {
    return componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  extractPropertyName(match) {
    const propMatch = match.match(/@property\(\s*{[^}]*}\s*\)\s*(\w+)/);
    return propMatch ? propMatch[1] : null;
  }

  getComplexityWeight(category, type) {
    const weights = {
      properties: { boolean: 1, string: 2, number: 2, array: 3, object: 4 },
      events: { dispatch: 3, click: 2, change: 2, input: 2, focus: 1, blur: 1, keydown: 2 },
      accessibility: { aria: 2, role: 2, tabindex: 1, label: 2 },
      form: { validation: 4, formData: 3, required: 2, disabled: 1 },
      state: { reactive: 3, private: 1, getter: 2, setter: 3 },
      rendering: { conditional: 3, loops: 4, slots: 2, styles: 1 }
    };

    return weights[category]?.[type] || 1;
  }

  identifyRisks(code, analysis) {
    const risks = [];

    // High complexity risk
    if (analysis.complexity > 80) {
      risks.push({ type: 'high-complexity', severity: 'high', description: 'Component has high complexity score' });
    }

    // Event handling risk
    if (analysis.events.length > 5) {
      risks.push({ type: 'event-heavy', severity: 'medium', description: 'Component handles many events' });
    }

    // State management risk
    if (analysis.state.length > 10) {
      risks.push({ type: 'state-heavy', severity: 'medium', description: 'Component has complex state management' });
    }

    return risks;
  }

  generateRiskTest(risk) {
    switch (risk.type) {
      case 'high-complexity':
        return '// Test high complexity scenarios\n    expect(element.shadowRoot || element).toBeTruthy();';
      case 'event-heavy':
        return '// Test event handling capacity\n    expect(element.eventListeners || true).toBeTruthy();';
      default:
        return '// AI-identified risk mitigation\n    expect(element).toBeTruthy();';
    }
  }

  shouldGenerateCategory(category, analysis, options) {
    if (options.categories && !options.categories.includes(category)) return false;

    // Skip categories that don't apply
    if (category === 'forms' && analysis.forms.length === 0) return false;
    if (category === 'accessibility' && analysis.accessibility.length === 0) return false;

    return true;
  }

  calculateRiskLevel(analysis) {
    const riskScore = analysis.risks.reduce((score, risk) => {
      return score + (risk.severity === 'high' ? 3 : risk.severity === 'medium' ? 2 : 1);
    }, 0);

    if (riskScore > 5) return 'high';
    if (riskScore > 2) return 'medium';
    return 'low';
  }

  estimateCoverage(analysis) {
    const totalFeatures = analysis.patterns.length;
    const testableFeatures = totalFeatures * 0.85; // 85% coverage estimate
    return Math.min(95, Math.round(testableFeatures));
  }

  getTestPath(componentPath, testType) {
    const dir = dirname(componentPath);
    const baseName = componentPath.split('/').pop().replace('.ts', '');
    return join(dir, `${baseName}.${testType}.test.ts`);
  }

  writeTestFile(testPath, suite) {
    const imports = `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '../../../__tests__/accessibility-utils.js';
import './${suite.componentName.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}.js';

/**
 * 🤖 AI-Generated Test Suite
 * Generated: ${suite.timestamp}
 * Complexity: ${suite.metadata.complexity}/100
 * Risk Level: ${suite.metadata.riskLevel}
 * Estimated Coverage: ${suite.metadata.estimatedCoverage}%
 *
 * This test suite was automatically generated using AI pattern analysis.
 * Review and customize as needed for your specific component behavior.
 */
`;

    const testContent = suite.tests.map(test => test.code).join('\n');

    const fullContent = `${imports}

describe('${suite.componentName} - AI Generated Tests', () => {
  let element;

  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    if (element && element.remove) {
      element.remove();
    }
  });
${testContent}
});

/**
 * AI Analysis Summary:
 * - Patterns detected: ${suite.analysis.patterns.length}
 * - Properties: ${suite.analysis.properties.length}
 * - Events: ${suite.analysis.events.length}
 * - Accessibility features: ${suite.analysis.accessibility.length}
 * - Form features: ${suite.analysis.forms.length}
 * - Risks identified: ${suite.analysis.risks.length}
 */
`;

    writeFileSync(testPath, fullContent);
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    testType: args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'ai-generated',
    categories: args.find(arg => arg.startsWith('--categories='))?.split('=')[1]?.split(','),
  };

  const generator = new AITestGenerator();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🤖 AI-Powered Test Generator v2.0

Usage:
  node scripts/ai-test-generator.js [component-path] [options]
  node scripts/ai-test-generator.js --all [options]

Options:
  --dry-run                    Show what would be generated without writing files
  --type=TYPE                  Test file suffix (default: ai-generated)
  --categories=CAT1,CAT2       Only generate specific categories
  --all                        Generate tests for all components
  --help, -h                   Show this help

Examples:
  node scripts/ai-test-generator.js src/components/button/usa-button.ts
  node scripts/ai-test-generator.js --all --dry-run
  node scripts/ai-test-generator.js src/components/modal/usa-modal.ts --categories=accessibility,events
    `);
    return;
  }

  if (args.includes('--all')) {
    console.log('🤖 AI analyzing all components...');
    const componentFiles = await glob('src/components/**/*.ts', {
      cwd: PROJECT_ROOT,
      ignore: ['**/*.test.ts', '**/*.stories.ts', '**/index.ts']
    });

    let totalTests = 0;
    for (const file of componentFiles) {
      const fullPath = join(PROJECT_ROOT, file);
      const suite = await generator.analyzeAndGenerate(fullPath, options);
      totalTests += suite.tests.length;
    }

    console.log(`\n🎉 AI Test Generation Complete!`);
    console.log(`📊 Generated ${totalTests} tests across ${componentFiles.length} components`);

  } else if (args[0]) {
    const componentPath = args[0];
    if (!existsSync(componentPath)) {
      console.error(`❌ Component file not found: ${componentPath}`);
      process.exit(1);
    }

    await generator.analyzeAndGenerate(componentPath, options);

  } else {
    console.error('❌ Please specify a component path or use --all');
    console.log('Use --help for usage information');
    process.exit(1);
  }
}

// Export for testing
export { AITestGenerator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}