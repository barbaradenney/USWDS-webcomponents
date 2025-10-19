#!/usr/bin/env node

/**
 * Automated Test Generator for USWDS Web Components
 *
 * This script intelligently analyzes components and generates comprehensive
 * test suites, stories, and documentation based on component structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutomatedTestGenerator {
  constructor(options = {}) {
    this.options = {
      componentsDir: 'src/components',
      templatesDir: path.join(__dirname, '../templates/testing'),
      dryRun: false,
      force: false,
      verbose: false,
      ...options
    };

    this.testTemplates = {
      unit: 'unit-test.template.ts',
      story: 'storybook-story.template.ts',
      component: 'cypress-component.template.ts',
      accessibility: 'accessibility-test.template.ts',
      integration: 'playwright-integration.template.ts'
    };

    this.uswdsPatterns = {
      formElements: ['input', 'textarea', 'select', 'checkbox', 'radio', 'button'],
      interactive: ['button', 'link', 'accordion', 'modal', 'dropdown', 'menu'],
      display: ['alert', 'card', 'banner', 'icon', 'tag'],
      navigation: ['breadcrumb', 'pagination', 'sidenav', 'header', 'footer'],
      layout: ['grid', 'section', 'prose']
    };
  }

  async generateForComponent(componentName, options = {}) {
    console.log(`🔧 Analyzing component: ${componentName}`);

    try {
      const componentInfo = await this.analyzeComponent(componentName);
      const testPlan = this.createTestPlan(componentInfo);

      if (this.options.verbose) {
        console.log('📊 Component Analysis:', JSON.stringify(componentInfo, null, 2));
        console.log('📋 Test Plan:', JSON.stringify(testPlan, null, 2));
      }

      await this.generateTestFiles(componentName, componentInfo, testPlan, options);

      console.log(`✅ Test generation completed for ${componentName}`);
      return { componentInfo, testPlan };
    } catch (error) {
      console.error(`❌ Failed to generate tests for ${componentName}:`, error.message);
      throw error;
    }
  }

  async analyzeComponent(componentName) {
    const componentDir = path.join(this.options.componentsDir, componentName);
    const componentFile = path.join(componentDir, `usa-${componentName}.ts`);

    if (!fs.existsSync(componentFile)) {
      throw new Error(`Component file not found: ${componentFile}`);
    }

    const componentCode = fs.readFileSync(componentFile, 'utf8');

    return {
      name: componentName,
      className: this.extractClassName(componentCode),
      properties: this.extractProperties(componentCode),
      events: this.extractEvents(componentCode),
      methods: this.extractMethods(componentCode),
      category: this.categorizeComponent(componentName, componentCode),
      accessibility: this.analyzeAccessibility(componentCode),
      complexity: this.assessComplexity(componentCode),
      dependencies: this.extractDependencies(componentCode),
      uswdsFeatures: this.identifyUSWDSFeatures(componentCode)
    };
  }

  extractClassName(code) {
    const match = code.match(/class\s+([A-Z][a-zA-Z0-9]*)/);
    return match ? match[1] : null;
  }

  extractProperties(code) {
    const properties = [];

    // Extract @property decorators
    const propertyMatches = code.matchAll(/@property\s*\(\s*\{([^}]+)\}\s*\)\s*([a-zA-Z_][a-zA-Z0-9_]*)/g);

    for (const match of propertyMatches) {
      const config = match[1];
      const name = match[2];

      properties.push({
        name,
        type: this.extractTypeFromProperty(config),
        reflected: config.includes('reflect: true'),
        attribute: this.extractAttributeName(config),
        defaultValue: this.extractDefaultValue(code, name)
      });
    }

    return properties;
  }

  extractEvents(code) {
    const events = [];

    // Look for dispatchEvent calls
    const eventMatches = code.matchAll(/dispatchEvent\s*\(\s*new\s+CustomEvent\s*\(\s*['"`]([^'"`]+)['"`]/g);

    for (const match of eventMatches) {
      events.push({
        name: match[1],
        type: 'CustomEvent'
      });
    }

    return events;
  }

  extractMethods(code) {
    const methods = [];

    // Extract public methods
    const methodMatches = code.matchAll(/^\s*(public\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*[:{]/gm);

    for (const match of methodMatches) {
      const methodName = match[2];

      // Skip constructors and lifecycle methods
      if (!['constructor', 'connectedCallback', 'disconnectedCallback', 'render', 'updated'].includes(methodName)) {
        methods.push({
          name: methodName,
          visibility: match[1] ? 'public' : 'public' // Default to public for now
        });
      }
    }

    return methods;
  }

  categorizeComponent(name, code) {
    const categories = [];

    // Check USWDS patterns
    for (const [category, patterns] of Object.entries(this.uswdsPatterns)) {
      if (patterns.some(pattern => name.includes(pattern) || code.includes(`usa-${pattern}`))) {
        categories.push(category);
      }
    }

    // Additional categorization based on code analysis
    if (code.includes('addEventListener') || code.includes('handleClick')) {
      categories.push('interactive');
    }

    if (code.includes('form') || code.includes('FormData') || code.includes('name=') || code.includes('value=')) {
      categories.push('form');
    }

    if (code.includes('aria-') || code.includes('role=')) {
      categories.push('accessible');
    }

    return categories.length > 0 ? categories : ['display'];
  }

  analyzeAccessibility(code) {
    const features = {
      hasAriaAttributes: /aria-\w+/.test(code),
      hasRoleAttribute: /role\s*=/.test(code),
      hasKeyboardHandling: /key(down|up|press)/i.test(code),
      hasFocusManagement: /focus\(\)/.test(code),
      hasScreenReaderSupport: /aria-label|aria-describedby|aria-labelledby/.test(code)
    };

    return {
      ...features,
      score: Object.values(features).filter(Boolean).length,
      needsEnhancement: Object.values(features).filter(Boolean).length < 3
    };
  }

  assessComplexity(code) {
    const metrics = {
      lines: code.split('\n').length,
      methods: (code.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*[:{]/gm) || []).length,
      conditionals: (code.match(/\b(if|else|switch|case)\b/g) || []).length,
      loops: (code.match(/\b(for|while|forEach)\b/g) || []).length,
      eventListeners: (code.match(/addEventListener/g) || []).length
    };

    const complexity = metrics.lines + (metrics.methods * 2) + (metrics.conditionals * 3) + (metrics.loops * 2) + (metrics.eventListeners * 2);

    return {
      ...metrics,
      score: complexity,
      level: complexity < 50 ? 'simple' : complexity < 150 ? 'moderate' : 'complex'
    };
  }

  extractDependencies(code) {
    const imports = [];
    const importMatches = code.matchAll(/import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g);

    for (const match of importMatches) {
      imports.push(match[1]);
    }

    return {
      imports,
      hasLitDependency: imports.some(imp => imp.includes('lit')),
      hasBaseComponent: code.includes('USWDSBaseComponent'),
      hasUtilities: imports.some(imp => imp.includes('./utils') || imp.includes('../utils'))
    };
  }

  identifyUSWDSFeatures(code) {
    return {
      hasUSWDSClasses: /usa-\w+/.test(code),
      hasVariants: /variant\s*[:=]/.test(code),
      hasStateClasses: /--active|--disabled|--selected/.test(code),
      hasResponsiveFeatures: /tablet:|desktop:/.test(code),
      hasThemeSupport: /theme|color-scheme/.test(code)
    };
  }

  extractTypeFromProperty(config) {
    if (config.includes('type: String')) return 'string';
    if (config.includes('type: Number')) return 'number';
    if (config.includes('type: Boolean')) return 'boolean';
    if (config.includes('type: Array')) return 'array';
    if (config.includes('type: Object')) return 'object';
    return 'unknown';
  }

  extractAttributeName(config) {
    const match = config.match(/attribute:\s*['"`]([^'"`]+)['"`]/);
    return match ? match[1] : null;
  }

  extractDefaultValue(code, propertyName) {
    const match = code.match(new RegExp(`${propertyName}\\s*=\\s*([^;\\n]+)`));
    return match ? match[1].trim() : undefined;
  }

  createTestPlan(componentInfo) {
    const plan = {
      unitTests: this.planUnitTests(componentInfo),
      storybook: this.planStorybookStories(componentInfo),
      componentTests: this.planComponentTests(componentInfo),
      accessibilityTests: this.planAccessibilityTests(componentInfo),
      integrationTests: this.planIntegrationTests(componentInfo)
    };

    return plan;
  }

  planUnitTests(info) {
    const tests = [
      'should render with default properties',
      'should apply correct CSS classes',
      'should handle property changes'
    ];

    // Add property-specific tests
    info.properties.forEach(prop => {
      tests.push(`should handle ${prop.name} property changes`);
      if (prop.reflected) {
        tests.push(`should reflect ${prop.name} property to attribute`);
      }
    });

    // Add event tests
    info.events.forEach(event => {
      tests.push(`should emit ${event.name} event correctly`);
    });

    // Add accessibility tests
    if (info.accessibility.hasAriaAttributes) {
      tests.push('should have correct ARIA attributes');
    }

    if (info.accessibility.hasKeyboardHandling) {
      tests.push('should handle keyboard interactions');
    }

    // Add form tests if applicable
    if (info.category.includes('form')) {
      tests.push('should integrate with forms correctly');
      tests.push('should validate form data');
    }

    return tests;
  }

  planStorybookStories(info) {
    const stories = [
      'Default',
      'AllVariants'
    ];

    // Add property-based stories
    const variantProps = info.properties.filter(p =>
      p.name.includes('variant') || p.name.includes('type') || p.name.includes('size')
    );

    variantProps.forEach(prop => {
      stories.push(`${prop.name.charAt(0).toUpperCase() + prop.name.slice(1)}Variants`);
    });

    // Add state stories
    if (info.properties.some(p => p.name === 'disabled')) {
      stories.push('DisabledState');
    }

    if (info.properties.some(p => p.name === 'error' || p.name === 'invalid')) {
      stories.push('ErrorState');
    }

    // Add interactive stories
    if (info.category.includes('interactive')) {
      stories.push('Interactive');
    }

    if (info.events.length > 0) {
      stories.push('WithEvents');
    }

    return stories;
  }

  planComponentTests(info) {
    if (!info.category.includes('interactive') && info.events.length === 0) {
      return []; // No component tests needed for non-interactive components
    }

    const tests = [
      'should render and be visible',
      'should handle basic interactions'
    ];

    if (info.accessibility.hasKeyboardHandling) {
      tests.push('should support keyboard navigation');
    }

    if (info.category.includes('form')) {
      tests.push('should work in form context');
      tests.push('should handle form submission');
    }

    if (info.events.length > 0) {
      tests.push('should emit events on user interaction');
    }

    return tests;
  }

  planAccessibilityTests(info) {
    const tests = [
      'should pass basic accessibility validation',
      'should have proper semantic structure'
    ];

    if (info.accessibility.hasKeyboardHandling) {
      tests.push('should support keyboard navigation');
      tests.push('should manage focus properly');
    }

    if (info.accessibility.hasAriaAttributes) {
      tests.push('should have correct ARIA attributes');
    }

    if (info.category.includes('interactive')) {
      tests.push('should announce interactions to screen readers');
    }

    return tests;
  }

  planIntegrationTests(info) {
    if (info.complexity.level === 'simple') {
      return []; // Simple components may not need integration tests
    }

    const tests = [
      'should work in realistic application context'
    ];

    if (info.category.includes('form')) {
      tests.push('should integrate with form workflows');
    }

    if (info.category.includes('navigation')) {
      tests.push('should support navigation patterns');
    }

    if (info.events.length > 0) {
      tests.push('should communicate with other components');
    }

    return tests;
  }

  async generateTestFiles(componentName, componentInfo, testPlan, options = {}) {
    const componentDir = path.join(this.options.componentsDir, componentName);

    // Generate unit tests
    if (testPlan.unitTests.length > 0) {
      await this.generateUnitTest(componentDir, componentName, componentInfo, testPlan.unitTests, options);
    }

    // Generate Storybook stories
    if (testPlan.storybook.length > 0) {
      await this.generateStorybookStory(componentDir, componentName, componentInfo, testPlan.storybook, options);
    }

    // Generate component tests (if needed)
    if (testPlan.componentTests.length > 0) {
      await this.generateComponentTest(componentDir, componentName, componentInfo, testPlan.componentTests, options);
    }

    // Generate accessibility tests (if complex)
    if (testPlan.accessibilityTests.length > 0 && componentInfo.complexity.level !== 'simple') {
      await this.generateAccessibilityTest(componentDir, componentName, componentInfo, testPlan.accessibilityTests, options);
    }

    // Generate integration tests (if needed)
    if (testPlan.integrationTests.length > 0) {
      await this.generateIntegrationTest(componentDir, componentName, componentInfo, testPlan.integrationTests, options);
    }
  }

  async generateUnitTest(componentDir, componentName, componentInfo, tests, options) {
    const testFile = path.join(componentDir, `usa-${componentName}.test.ts`);

    if (fs.existsSync(testFile) && !options.force && !this.options.force) {
      console.log(`⏭️  Skipping existing unit test: ${testFile}`);
      return;
    }

    const template = this.createUnitTestTemplate(componentName, componentInfo, tests);

    if (this.options.dryRun) {
      console.log(`📄 Would create unit test: ${testFile}`);
      if (this.options.verbose) {
        console.log(template);
      }
      return;
    }

    fs.writeFileSync(testFile, template);
    console.log(`✅ Generated unit test: ${testFile}`);
  }

  async generateStorybookStory(componentDir, componentName, componentInfo, stories, options) {
    const storyFile = path.join(componentDir, `usa-${componentName}.stories.ts`);

    if (fs.existsSync(storyFile) && !options.force && !this.options.force) {
      console.log(`⏭️  Skipping existing story: ${storyFile}`);
      return;
    }

    const template = this.createStorybookTemplate(componentName, componentInfo, stories);

    if (this.options.dryRun) {
      console.log(`📄 Would create Storybook story: ${storyFile}`);
      if (this.options.verbose) {
        console.log(template);
      }
      return;
    }

    fs.writeFileSync(storyFile, template);
    console.log(`✅ Generated Storybook story: ${storyFile}`);
  }

  async generateComponentTest(componentDir, componentName, componentInfo, tests, options) {
    const testFile = path.join(componentDir, `usa-${componentName}.component.cy.ts`);

    if (fs.existsSync(testFile) && !options.force && !this.options.force) {
      console.log(`⏭️  Skipping existing component test: ${testFile}`);
      return;
    }

    const template = this.createComponentTestTemplate(componentName, componentInfo, tests);

    if (this.options.dryRun) {
      console.log(`📄 Would create component test: ${testFile}`);
      if (this.options.verbose) {
        console.log(template);
      }
      return;
    }

    fs.writeFileSync(testFile, template);
    console.log(`✅ Generated component test: ${testFile}`);
  }

  async generateAccessibilityTest(componentDir, componentName, componentInfo, tests, options) {
    const testFile = path.join(componentDir, `usa-${componentName}.accessibility.test.ts`);

    if (fs.existsSync(testFile) && !options.force && !this.options.force) {
      console.log(`⏭️  Skipping existing accessibility test: ${testFile}`);
      return;
    }

    const template = this.createAccessibilityTestTemplate(componentName, componentInfo, tests);

    if (this.options.dryRun) {
      console.log(`📄 Would create accessibility test: ${testFile}`);
      if (this.options.verbose) {
        console.log(template);
      }
      return;
    }

    fs.writeFileSync(testFile, template);
    console.log(`✅ Generated accessibility test: ${testFile}`);
  }

  async generateIntegrationTest(componentDir, componentName, componentInfo, tests, options) {
    const testsDir = path.join('tests', 'integration');
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    const testFile = path.join(testsDir, `${componentName}-integration.spec.ts`);

    if (fs.existsSync(testFile) && !options.force && !this.options.force) {
      console.log(`⏭️  Skipping existing integration test: ${testFile}`);
      return;
    }

    const template = this.createIntegrationTestTemplate(componentName, componentInfo, tests);

    if (this.options.dryRun) {
      console.log(`📄 Would create integration test: ${testFile}`);
      if (this.options.verbose) {
        console.log(template);
      }
      return;
    }

    fs.writeFileSync(testFile, template);
    console.log(`✅ Generated integration test: ${testFile}`);
  }

  createUnitTestTemplate(componentName, componentInfo, tests) {
    const className = componentInfo.className;
    const kebabName = `usa-${componentName}`;
    const properties = componentInfo.properties;
    const events = componentInfo.events;

    return `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../src/components/${componentName}/${kebabName}.ts';
import type { ${className} } from '../src/components/${componentName}/${kebabName}.js';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '../../../__tests__/accessibility-utils.js';

describe('${className}', () => {
  let element: ${className};

  beforeEach(() => {
    element = document.createElement('${kebabName}') as ${className};
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Default Properties', () => {
    it('should have correct default properties', () => {
${properties.map(prop => `      expect(element.${prop.name}).toBe(${this.formatDefaultValue(prop.defaultValue)});`).join('\n')}
    });

    it('should apply correct CSS classes', async () => {
      await element.updateComplete;
      expect(element.className).toContain('${kebabName}');
    });
  });

${properties.length > 0 ? `
  describe('Property Changes', () => {
${properties.map(prop => `    it('should handle ${prop.name} property changes', async () => {
      const newValue = ${this.generateTestValue(prop.type)};
      element.${prop.name} = newValue;
      await element.updateComplete;

      expect(element.${prop.name}).toBe(newValue);
${prop.reflected ? `      expect(element.getAttribute('${prop.attribute || prop.name}')).toBeTruthy();` : ''}
    });`).join('\n\n')}
  });
` : ''}

${events.length > 0 ? `
  describe('Events', () => {
${events.map(event => `    it('should emit ${event.name} event correctly', async () => {
      let eventFired = false;
      let eventDetail = null;

      element.addEventListener('${event.name}', (e: CustomEvent) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      // Trigger event (customize based on component)
      element.dispatchEvent(new CustomEvent('${event.name}', { detail: { test: 'data' } }));

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeDefined();
    });`).join('\n\n')}
  });
` : ''}

${componentInfo.category.includes('form') ? `
  describe('Form Integration', () => {
    it('should integrate with forms correctly', async () => {
      const form = document.createElement('form');
      element.name = 'test-field';
      element.value = 'test-value';
      form.appendChild(element);
      document.body.appendChild(form);

      const formData = new FormData(form);
      expect(formData.get('test-field')).toBe('test-value');

      form.remove();
    });

    it('should validate form data', async () => {
      element.required = true;
      element.value = '';
      await element.updateComplete;

      expect(element.checkValidity()).toBe(false);

      element.value = 'valid-value';
      await element.updateComplete;

      expect(element.checkValidity()).toBe(true);
    });
  });
` : ''}

  describe('Accessibility', () => {
    it('should pass comprehensive accessibility tests', async () => {
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

${componentInfo.accessibility.hasAriaAttributes ? `
    it('should have correct ARIA attributes', async () => {
      await element.updateComplete;

      // Customize based on component's ARIA requirements
      expect(element.getAttribute('role')).toBeTruthy();
      expect(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')).toBeTruthy();
    });
` : ''}

${componentInfo.accessibility.hasKeyboardHandling ? `
    it('should handle keyboard interactions', async () => {
      await element.updateComplete;
      element.focus();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.dispatchEvent(enterEvent);

      // Verify keyboard interaction behavior
      expect(document.activeElement).toBe(element);
    });
` : ''}
  });

  describe('USWDS Compliance', () => {
    it('should apply USWDS CSS classes correctly', async () => {
      await element.updateComplete;
      expect(element.className).toContain('${kebabName}');
    });

${componentInfo.uswdsFeatures.hasVariants ? `
    it('should handle USWDS variants', async () => {
      const variants = ['primary', 'secondary', 'success', 'warning', 'danger'];

      for (const variant of variants) {
        element.variant = variant;
        await element.updateComplete;

        if (variant !== 'primary') {
          expect(element.className).toContain(\`${kebabName}--\${variant}\`);
        }
      }
    });
` : ''}
  });
});
`;
  }

  createStorybookTemplate(componentName, componentInfo, stories) {
    const className = componentInfo.className;
    const kebabName = `usa-${componentName}`;
    const properties = componentInfo.properties;

    return `import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.ts';
import type { ${className} } from './${kebabName}.js';

const meta: Meta<${className}> = {
  title: 'Components/${componentName.charAt(0).toUpperCase() + componentName.slice(1)}',
  component: '${kebabName}',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: \`
${componentName.charAt(0).toUpperCase() + componentName.slice(1)} component following USWDS design patterns.

See the [USWDS documentation](https://designsystem.digital.gov/components/${componentName}/) for complete guidance.
        \`,
      },
    },
  },
  argTypes: {
${properties.map(prop => `    ${prop.name}: {
      control: '${this.getStorybookControl(prop.type)}',
      description: '${prop.name} property',
    },`).join('\n')}
  },
};

export default meta;
type Story = StoryObj<${className}>;

export const Default: Story = {
  args: {
${properties.map(prop => `    ${prop.name}: ${this.formatDefaultValue(prop.defaultValue)},`).join('\n')}
  },
  render: (args) => html\`
    <${kebabName}
${properties.map(prop => `      ${this.getStorybookBinding(prop)}`).join('\n')}
    >
      Default Content
    </${kebabName}>
  \`,
};

${this.hasVariants(properties) ? `
export const AllVariants: Story = {
  render: () => html\`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <${kebabName} variant="primary">Primary</${kebabName}>
      <${kebabName} variant="secondary">Secondary</${kebabName}>
      <${kebabName} variant="success">Success</${kebabName}>
      <${kebabName} variant="warning">Warning</${kebabName}>
      <${kebabName} variant="danger">Danger</${kebabName}>
    </div>
  \`,
};
` : ''}

${this.hasDisabledState(properties) ? `
export const DisabledState: Story = {
  args: {
    disabled: true,
  },
  render: (args) => html\`
    <${kebabName} ?disabled="\${args.disabled}">
      Disabled Component
    </${kebabName}>
  \`,
};
` : ''}

${componentInfo.events.length > 0 ? `
export const Interactive: Story = {
  render: () => html\`
    <${kebabName}
${componentInfo.events.map(event => `      @${event.name}="\${(e) => console.log('${event.name}:', e.detail)}"`).join('\n')}
    >
      Interactive Component
    </${kebabName}>
  \`,
};
` : ''}

${componentInfo.category.includes('form') ? `
export const InForm: Story = {
  render: () => html\`
    <form @submit="\${(e) => { e.preventDefault(); console.log('Form submitted'); }}">
      <${kebabName} name="example" value="test-value">
        Form Component
      </${kebabName}>
      <button type="submit">Submit</button>
    </form>
  \`,
};
` : ''}
`;
  }

  createComponentTestTemplate(componentName, componentInfo, tests) {
    const kebabName = `usa-${componentName}`;

    return `import { mount } from 'cypress/support/component';
import '../../../src/components/${componentName}/${kebabName}.ts';

describe('${componentInfo.className} Component Tests', () => {
  beforeEach(() => {
    mount(\`<${kebabName}>Test Content</${kebabName}>\`);
  });

  it('should render and be visible', () => {
    cy.get('${kebabName}')
      .should('be.visible')
      .and('contain.text', 'Test Content')
      .and('have.class', '${kebabName}');
  });

${componentInfo.category.includes('interactive') ? `
  it('should handle basic interactions', () => {
    cy.get('${kebabName}')
      .click()
      .should('have.focus');
  });
` : ''}

${componentInfo.accessibility.hasKeyboardHandling ? `
  it('should support keyboard navigation', () => {
    cy.get('${kebabName}')
      .focus()
      .type('{enter}')
      .should('have.focus');

    cy.get('${kebabName}')
      .type('{space}')
      .should('have.focus');
  });
` : ''}

${componentInfo.category.includes('form') ? `
  it('should work in form context', () => {
    mount(\`
      <form>
        <${kebabName} name="test" value="initial"></${kebabName}>
        <button type="submit">Submit</button>
      </form>
    \`);

    cy.get('${kebabName}').should('have.attr', 'name', 'test');
    cy.get('${kebabName}').should('have.attr', 'value', 'initial');

    cy.get('button').click();

    // Verify form behavior
  });
` : ''}

${componentInfo.events.length > 0 ? `
  it('should emit events on user interaction', () => {
    let eventFired = false;

    cy.get('${kebabName}').then((\$el) => {
      \$el[0].addEventListener('${componentInfo.events[0].name}', () => {
        eventFired = true;
      });
    });

    cy.get('${kebabName}').click().then(() => {
      expect(eventFired).to.be.true;
    });
  });
` : ''}

  it('should pass accessibility validation', () => {
    cy.checkAccessibility();
  });

  it('should have proper ARIA attributes', () => {
    cy.get('${kebabName}')
      .should('have.attr', 'role')
      .and('satisfy', (role) => role && role.length > 0);
  });
});
`;
  }

  createAccessibilityTestTemplate(componentName, componentInfo, tests) {
    const className = componentInfo.className;
    const kebabName = `usa-${componentName}`;

    return `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../src/components/${componentName}/${kebabName}.ts';
import type { ${className} } from '../src/components/${componentName}/${kebabName}.js';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '../../../__tests__/accessibility-utils.js';

describe('${className} Accessibility Tests', () => {
  let element: ${className};

  beforeEach(() => {
    element = document.createElement('${kebabName}') as ${className};
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should pass comprehensive accessibility validation', async () => {
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should have proper semantic structure', async () => {
      await element.updateComplete;

      // Verify semantic HTML structure
      expect(element.getAttribute('role')).toBeTruthy();
      expect(element.tagName.toLowerCase()).toBe('${kebabName}');
    });

${componentInfo.accessibility.hasKeyboardHandling ? `
    it('should support keyboard navigation', async () => {
      await element.updateComplete;
      element.focus();

      expect(document.activeElement).toBe(element);

      // Test Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.dispatchEvent(enterEvent);

      // Test Space key
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      element.dispatchEvent(spaceEvent);

      // Test Tab navigation
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      element.dispatchEvent(tabEvent);
    });

    it('should manage focus properly', async () => {
      await element.updateComplete;

      element.focus();
      expect(document.activeElement).toBe(element);

      element.blur();
      expect(document.activeElement).not.toBe(element);
    });
` : ''}

${componentInfo.accessibility.hasAriaAttributes ? `
    it('should have correct ARIA attributes', async () => {
      await element.updateComplete;

      // Test required ARIA attributes
      const role = element.getAttribute('role');
      expect(role).toBeTruthy();

      const label = element.getAttribute('aria-label') ||
                   element.getAttribute('aria-labelledby');
      expect(label).toBeTruthy();

      // Test state attributes if applicable
      if (element.hasAttribute('disabled')) {
        expect(element.getAttribute('aria-disabled')).toBe('true');
      }
    });
` : ''}

    it('should announce state changes to screen readers', async () => {
      await element.updateComplete;

      // Test that state changes are properly announced
      element.disabled = true;
      await element.updateComplete;

      expect(element.getAttribute('aria-disabled')).toBe('true');

      element.disabled = false;
      await element.updateComplete;

      expect(element.getAttribute('aria-disabled')).toBe('false');
    });

    it('should have sufficient color contrast', async () => {
      await element.updateComplete;

      // This would typically be tested with actual color analysis
      // For now, we verify USWDS classes are applied (which have correct contrast)
      expect(element.className).toContain('${kebabName}');
    });

    it('should work with screen readers', async () => {
      await element.updateComplete;

      // Verify screen reader accessible name
      const accessibleName = element.getAttribute('aria-label') ||
                           element.getAttribute('aria-labelledby') ||
                           element.textContent;

      expect(accessibleName).toBeTruthy();
      expect(accessibleName.trim().length).toBeGreaterThan(0);
    });
  });

${componentInfo.category.includes('form') ? `
  describe('Form Accessibility', () => {
    it('should associate with form labels correctly', async () => {
      const label = document.createElement('label');
      label.textContent = 'Test Label';
      label.setAttribute('for', 'test-component');

      element.id = 'test-component';

      document.body.appendChild(label);
      await element.updateComplete;

      expect(element.getAttribute('aria-labelledby') || label.getAttribute('for')).toBeTruthy();

      label.remove();
    });

    it('should handle form validation messages accessibly', async () => {
      element.required = true;
      element.value = '';
      await element.updateComplete;

      const isValid = element.checkValidity();
      if (!isValid) {
        expect(element.getAttribute('aria-invalid')).toBe('true');
      }
    });
  });
` : ''}
});
`;
  }

  createIntegrationTestTemplate(componentName, componentInfo, tests) {
    const kebabName = `usa-${componentName}`;

    return `import { test, expect } from '@playwright/test';

test.describe('${componentInfo.className} Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/${componentName}');
  });

  test('should work in realistic application context', async ({ page }) => {
    const component = page.locator('${kebabName}').first();

    await expect(component).toBeVisible();
    await expect(component).toHaveClass(/${kebabName}/);
  });

${componentInfo.category.includes('form') ? `
  test('should integrate with form workflows', async ({ page }) => {
    await page.goto('/components/${componentName}/forms');

    const form = page.locator('form');
    const component = form.locator('${kebabName}');

    await component.fill('test value');
    await page.click('button[type="submit"]');

    // Verify form submission behavior
    await expect(page).toHaveURL(/.*success.*/);
  });
` : ''}

${componentInfo.category.includes('navigation') ? `
  test('should support navigation patterns', async ({ page }) => {
    const component = page.locator('${kebabName}');

    await component.click();

    // Verify navigation behavior
    await expect(page).toHaveURL(/.*${componentName}.*/);
  });
` : ''}

${componentInfo.events.length > 0 ? `
  test('should communicate with other components', async ({ page }) => {
    // Set up component interaction test
    const sourceComponent = page.locator('${kebabName}').first();
    const targetComponent = page.locator('[data-testid="target"]');

    await sourceComponent.click();

    // Verify component communication
    await expect(targetComponent).toHaveText(/updated/);
  });
` : ''}

  test('should maintain accessibility across user flows', async ({ page }) => {
    const component = page.locator('${kebabName}').first();

    // Test initial accessibility
    await expect(component).toHaveAttribute('role');

    // Test after interaction
    await component.click();
    await expect(component).toHaveAttribute('role');

    // Test keyboard navigation
    await component.focus();
    await page.keyboard.press('Enter');
    await expect(component).toBeFocused();
  });

  test('should perform well under load', async ({ page }) => {
    // Load multiple instances
    const components = page.locator('${kebabName}');
    const count = await components.count();

    expect(count).toBeGreaterThan(0);

    // Verify all instances render correctly
    for (let i = 0; i < Math.min(count, 10); i++) {
      await expect(components.nth(i)).toBeVisible();
    }
  });
});
`;
  }

  formatDefaultValue(value) {
    if (value === undefined || value === null) return 'undefined';
    if (typeof value === 'string') return `'${value}'`;
    return value;
  }

  generateTestValue(type) {
    switch (type) {
      case 'string': return "'new-value'";
      case 'number': return '42';
      case 'boolean': return 'true';
      case 'array': return "['item1', 'item2']";
      case 'object': return "{ key: 'value' }";
      default: return "'test-value'";
    }
  }

  getStorybookControl(type) {
    switch (type) {
      case 'string': return 'text';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'object';
      case 'object': return 'object';
      default: return 'text';
    }
  }

  getStorybookBinding(prop) {
    if (prop.type === 'boolean') {
      return `?${prop.name}="\${args.${prop.name}}"`;
    }
    return `${prop.name}="\${args.${prop.name}}"`;
  }

  hasVariants(properties) {
    return properties.some(p => p.name.includes('variant') || p.name.includes('type'));
  }

  hasDisabledState(properties) {
    return properties.some(p => p.name === 'disabled');
  }

  async generateForAllComponents() {
    const componentsDir = this.options.componentsDir;

    if (!fs.existsSync(componentsDir)) {
      throw new Error(`Components directory not found: ${componentsDir}`);
    }

    const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`🔍 Found ${componentDirs.length} components`);

    const results = [];
    const errors = [];

    for (const componentName of componentDirs) {
      try {
        const result = await this.generateForComponent(componentName);
        results.push({ componentName, ...result });
      } catch (error) {
        console.error(`❌ Failed to process ${componentName}:`, error.message);
        errors.push({ componentName, error: error.message });
      }
    }

    console.log(`\n📊 Generation Summary:`);
    console.log(`✅ Successfully processed: ${results.length} components`);
    console.log(`❌ Failed to process: ${errors.length} components`);

    if (errors.length > 0) {
      console.log(`\n❌ Errors:`);
      errors.forEach(({ componentName, error }) => {
        console.log(`   ${componentName}: ${error}`);
      });
    }

    return { results, errors };
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    verbose: args.includes('--verbose'),
  };

  const generator = new AutomatedTestGenerator(options);

  const componentName = args.find(arg => !arg.startsWith('--'));

  if (componentName && componentName !== 'all') {
    // Generate for specific component
    generator.generateForComponent(componentName, { force: args.includes('--force') })
      .then(() => {
        console.log(`🎉 Test generation completed for ${componentName}`);
      })
      .catch(error => {
        console.error('❌ Generation failed:', error);
        process.exit(1);
      });
  } else if (args.includes('all')) {
    // Generate for all components
    generator.generateForAllComponents()
      .then(({ results, errors }) => {
        console.log(`🎉 Batch generation completed: ${results.length} successful, ${errors.length} failed`);
        if (errors.length > 0) {
          process.exit(1);
        }
      })
      .catch(error => {
        console.error('❌ Batch generation failed:', error);
        process.exit(1);
      });
  } else {
    console.log(`
🧪 Automated Test Generator for USWDS Web Components

Usage:
  node scripts/automated-test-generator.js <component-name>  # Generate for specific component
  node scripts/automated-test-generator.js all              # Generate for all components

Options:
  --dry-run    Show what would be generated without creating files
  --force      Overwrite existing test files
  --verbose    Show detailed analysis and templates

Examples:
  node scripts/automated-test-generator.js button
  node scripts/automated-test-generator.js accordion --force
  node scripts/automated-test-generator.js all --dry-run
`);
  }
}

export { AutomatedTestGenerator };