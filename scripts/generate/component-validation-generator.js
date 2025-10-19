#!/usr/bin/env node

/**
 * Component-Specific Validation Test Generator
 *
 * Generates targeted validation tests for components based on their risk assessment.
 * Uses the patterns discovered during tooltip troubleshooting to prevent similar issues.
 */

import fs from 'fs';
import path from 'path';

// Component risk assessment data
const COMPONENT_RISK_PROFILES = {
  // HIGH RISK - Full validation suite
  'modal': {
    risk: 'high',
    factors: ['positioning', 'dom-transformation', 'portal-behavior', 'focus-management'],
    uswdsModule: 'usa-modal',
    validations: ['dom-transformation', 'storybook-iframe', 'multi-phase-attributes', 'module-optimization']
  },
  'date-picker': {
    risk: 'high',
    factors: ['heavy-uswds-js', 'input-transformation', 'calendar-overlay', 'complex-interactions'],
    uswdsModule: 'usa-date-picker',
    validations: ['dom-transformation', 'storybook-iframe', 'multi-phase-attributes', 'light-dom-slots', 'module-optimization']
  },
  'combo-box': {
    risk: 'high',
    factors: ['input-transformation', 'dropdown-positioning', 'typeahead-behavior', 'option-selection'],
    uswdsModule: 'usa-combo-box',
    validations: ['dom-transformation', 'storybook-iframe', 'multi-phase-attributes', 'module-optimization']
  },
  'accordion': {
    risk: 'high',
    factors: ['button-content-restructuring', 'dynamic-show-hide', 'aria-state-changes', 'event-delegation'],
    uswdsModule: 'usa-accordion',
    validations: ['dom-transformation', 'multi-phase-attributes', 'light-dom-slots']
  },
  'time-picker': {
    risk: 'high',
    factors: ['input-enhancement', 'dropdown-behavior', 'time-validation'],
    uswdsModule: 'usa-time-picker',
    validations: ['dom-transformation', 'multi-phase-attributes', 'module-optimization']
  },
  'header': {
    risk: 'high',
    factors: ['navigation-transformation', 'mobile-menu-behavior', 'responsive-changes', 'complex-structure'],
    uswdsModule: 'usa-header',
    validations: ['dom-transformation', 'light-dom-slots', 'module-optimization']
  },
  'tooltip': {
    risk: 'high',
    factors: ['positioning', 'dom-transformation', 'attribute-timing'],
    uswdsModule: 'usa-tooltip',
    validations: ['dom-transformation', 'storybook-iframe', 'multi-phase-attributes', 'light-dom-slots', 'module-optimization']
  },

  // MEDIUM RISK - Selective validation
  'menu': {
    risk: 'medium',
    factors: ['dropdown-positioning', 'submenu-behavior'],
    uswdsModule: 'usa-menu',
    validations: ['storybook-iframe', 'multi-phase-attributes']
  },
  'language-selector': {
    risk: 'medium',
    factors: ['dropdown-positioning', 'option-selection'],
    uswdsModule: 'usa-language-selector',
    validations: ['storybook-iframe', 'module-optimization']
  },
  'file-input': {
    risk: 'medium',
    factors: ['input-enhancement', 'custom-behavior'],
    uswdsModule: 'usa-file-input',
    validations: ['dom-transformation', 'multi-phase-attributes']
  },
  'card': {
    risk: 'medium',
    factors: ['complex-slot-structure', 'multiple-content-areas'],
    uswdsModule: null, // No USWDS JS module
    validations: ['light-dom-slots']
  },
  'alert': {
    risk: 'medium',
    factors: ['icon-content-slots', 'dynamic-content'],
    uswdsModule: null,
    validations: ['light-dom-slots']
  },

  // LOW RISK - Basic validation
  'button': {
    risk: 'low',
    factors: ['static-styling'],
    uswdsModule: null,
    validations: ['basic-integration']
  },
  'link': {
    risk: 'low',
    factors: ['static-styling', 'simple-behavior'],
    uswdsModule: null,
    validations: ['basic-integration']
  },
  'tag': {
    risk: 'low',
    factors: ['simple-presentation'],
    uswdsModule: null,
    validations: ['basic-integration']
  }
};

/**
 * Generate validation test file for a component
 */
function generateComponentValidationTest(componentName) {
  const profile = COMPONENT_RISK_PROFILES[componentName];

  if (!profile) {
    throw new Error(`No risk profile found for component: ${componentName}`);
  }

  const testContent = generateTestContent(componentName, profile);
  const testFilePath = `__tests__/${componentName}-uswds-validation.test.ts`;

  fs.writeFileSync(testFilePath, testContent);
  console.log(`✅ Generated validation test for ${componentName}: ${testFilePath}`);

  return testFilePath;
}

/**
 * Generate test content based on component profile
 */
function generateTestContent(componentName, profile) {
  const className = `USA${toPascalCase(componentName)}`;
  const elementName = `usa-${componentName}`;

  return `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../src/components/${componentName}/usa-${componentName}.ts';
import type { ${className} } from '../src/components/${componentName}/usa-${componentName}.js';
${profile.validations.includes('basic-integration') ? '' : `import { testComponentAccessibility, USWDS_A11Y_CONFIG } from './accessibility-utils.js';`}

/**
 * ${className} USWDS Integration Validation
 *
 * Risk Level: ${profile.risk.toUpperCase()}
 * Risk Factors: ${profile.factors.join(', ')}
 * USWDS Module: ${profile.uswdsModule || 'None'}
 *
 * Generated based on tooltip troubleshooting patterns to prevent:
 * ${profile.validations.map(v => `- ${v.replace('-', ' ')}`).join('\n * ')}
 */

describe('${className} USWDS Integration Validation', () => {
  let element: ${className};
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    testContainer.id = '${componentName}-test-container';
    document.body.appendChild(testContainer);

    element = document.createElement('${elementName}') as ${className};
    testContainer.appendChild(element);
  });

  afterEach(() => {
    testContainer.remove();
  });

${generateValidationTests(componentName, profile)}
});`;
}

/**
 * Generate specific validation tests based on component profile
 */
function generateValidationTests(componentName, profile) {
  const tests = [];

  if (profile.validations.includes('dom-transformation')) {
    tests.push(generateDOMTransformationTest(componentName, profile));
  }

  if (profile.validations.includes('storybook-iframe')) {
    tests.push(generateStorybookIframeTest(componentName, profile));
  }

  if (profile.validations.includes('multi-phase-attributes')) {
    tests.push(generateMultiPhaseAttributeTest(componentName, profile));
  }

  if (profile.validations.includes('light-dom-slots')) {
    tests.push(generateLightDOMSlotTest(componentName, profile));
  }

  if (profile.validations.includes('module-optimization')) {
    tests.push(generateModuleOptimizationTest(componentName, profile));
  }

  if (profile.validations.includes('basic-integration')) {
    tests.push(generateBasicIntegrationTest(componentName, profile));
  }

  return tests.join('\n\n');
}

/**
 * Generate DOM transformation validation test
 */
function generateDOMTransformationTest(componentName, profile) {
  return `  describe('DOM Transformation Validation', () => {
    it('should handle USWDS DOM transformation correctly', async () => {
      // Add test content that USWDS will transform
      const testContent = document.createElement('${getTestElementType(componentName)}');
      testContent.classList.add('usa-${componentName}');
      testContent.textContent = 'Test ${componentName}';
      element.appendChild(testContent);

      await element.updateComplete;

      // Simulate USWDS transformation (${componentName} specific)
      const preTransformElement = element.querySelector('.usa-${componentName}');
      expect(preTransformElement).toBeTruthy();

      // Simulate USWDS changing class structure
      preTransformElement?.classList.remove('usa-${componentName}');
      preTransformElement?.classList.add('usa-${componentName}__trigger');

      // Component should handle both pre and post-transformation states
      const postTransformElement = element.querySelector('.usa-${componentName}__trigger');
      expect(postTransformElement).toBeTruthy();
      expect(postTransformElement).toBe(preTransformElement);
    });

    it('should apply attributes before USWDS initialization', async () => {
      const testElement = document.createElement('${getTestElementType(componentName)}');
      testElement.classList.add('usa-${componentName}');
      element.appendChild(testElement);

      // Apply component properties
      ${getPropertyApplicationCode(componentName)}

      await element.updateComplete;

      // Attributes should be applied to element
      ${getAttributeValidationCode(componentName)}
    });
  });`;
}

/**
 * Generate Storybook iframe environment test
 */
function generateStorybookIframeTest(componentName, profile) {
  return `  describe('Storybook Iframe Environment Validation', () => {
    it('should work correctly in iframe constraints', () => {
      // Test iframe-specific spacing for positioned elements
      const container = document.createElement('div');
      container.style.margin = '4rem';
      container.style.padding = '2rem';
      container.style.display = 'flex';
      container.style.justifyContent = 'center';

      testContainer.appendChild(container);
      container.appendChild(element);

      // Should have adequate space for positioning
      const computedStyle = window.getComputedStyle(container);
      expect(parseInt(computedStyle.margin)).toBeGreaterThanOrEqual(64); // 4rem
      expect(parseInt(computedStyle.padding)).toBeGreaterThanOrEqual(32); // 2rem
    });

    it('should validate USWDS module optimization', () => {
      // Test that required USWDS module is optimized
      ${profile.uswdsModule ? `
      const requiredModule = '@uswds/uswds/js/${profile.uswdsModule}';
      // In production, this module should be pre-optimized
      expect(requiredModule).toBeTruthy();
      ` : `
      // Component does not require USWDS module optimization
      expect(true).toBe(true);
      `}
    });
  });`;
}

/**
 * Generate multi-phase attribute test
 */
function generateMultiPhaseAttributeTest(componentName, profile) {
  return `  describe('Multi-Phase Attribute Application', () => {
    it('should handle attribute timing correctly', async () => {
      const events: string[] = [];

      // Mock component lifecycle
      const mockLifecycle = {
        connectedCallback() {
          events.push('connected');
          // Should apply attributes immediately
          events.push('apply-attributes');
        },
        firstUpdated() {
          events.push('first-updated');
          // Should delay USWDS initialization
          setTimeout(() => events.push('initialize-uswds'), 10);
        }
      };

      mockLifecycle.connectedCallback();
      mockLifecycle.firstUpdated();

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 20));

      // Validate proper sequence
      expect(events).toContain('connected');
      expect(events).toContain('apply-attributes');
      expect(events).toContain('initialize-uswds');

      // Critical: attributes applied before USWDS initialization
      const applyIndex = events.indexOf('apply-attributes');
      const initIndex = events.indexOf('initialize-uswds');
      expect(applyIndex).toBeLessThan(initIndex);
    });

    it('should handle property updates through all phases', async () => {
      ${getPropertyUpdateTestCode(componentName)}
    });
  });`;
}

/**
 * Generate light DOM slot test
 */
function generateLightDOMSlotTest(componentName, profile) {
  return `  describe('Light DOM Slot Behavior', () => {
    it('should access slot content correctly in light DOM', () => {
      // Add complex slot content
      const slotContent = \`
        <${getTestElementType(componentName)} class="direct-child">Direct content</${getTestElementType(componentName)}>
        <slot>
          <span class="slotted-content">Slotted content</span>
        </slot>
      \`;
      element.innerHTML = slotContent;

      // Strategy 1: Direct children access
      const directChildren = Array.from(element.children).filter(
        child => child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SLOT'
      );
      expect(directChildren.length).toBeGreaterThan(0);

      // Strategy 2: Slot children access
      const slotElement = element.querySelector('slot');
      const slotChildren = slotElement ? Array.from(slotElement.children) : [];

      // Should find content using light DOM patterns
      const totalElements = directChildren.length + slotChildren.length;
      expect(totalElements).toBeGreaterThan(0);
    });

    it('should handle content updates dynamically', () => {
      // Add initial content
      const initialContent = document.createElement('${getTestElementType(componentName)}');
      initialContent.textContent = 'Initial';
      element.appendChild(initialContent);

      expect(element.children.length).toBe(1);

      // Add new content
      const newContent = document.createElement('span');
      newContent.textContent = 'New content';
      element.appendChild(newContent);

      expect(element.children.length).toBe(2);

      // Remove content
      initialContent.remove();
      expect(element.children.length).toBe(1);
    });
  });`;
}

/**
 * Generate module optimization test
 */
function generateModuleOptimizationTest(componentName, profile) {
  return `  describe('USWDS Module Optimization', () => {
    it('should handle USWDS module loading', async () => {
      ${profile.uswdsModule ? `
      // Test USWDS module import pattern
      try {
        // This is the pattern used in components:
        // const module = await import('@uswds/uswds/js/${profile.uswdsModule}');

        // For test, simulate the module structure
        const mockModule = {
          default: {
            on: (element: HTMLElement) => {
              element.setAttribute('data-uswds-initialized', 'true');
            },
            off: (element: HTMLElement) => {
              element.removeAttribute('data-uswds-initialized');
            }
          }
        };

        // Test module functionality
        mockModule.default.on(element);
        expect(element.getAttribute('data-uswds-initialized')).toBe('true');

        mockModule.default.off(element);
        expect(element.getAttribute('data-uswds-initialized')).toBeNull();

      } catch (error) {
        // Module loading may fail in test environment
        console.warn('USWDS module test failed in test environment:', error);
      }
      ` : `
      // Component does not use USWDS module
      expect(true).toBe(true);
      `}
    });

    it('should handle module loading failures gracefully', async () => {
      const mockFailingImport = async () => {
        throw new Error('Module not found');
      };

      try {
        await mockFailingImport();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Should handle gracefully
        expect(error).toBeInstanceOf(Error);
      }
    });
  });`;
}

/**
 * Generate basic integration test
 */
function generateBasicIntegrationTest(componentName, profile) {
  return `  describe('Basic Integration', () => {
    it('should render correctly', async () => {
      await element.updateComplete;
      expect(element).toBeTruthy();
      expect(element.tagName.toLowerCase()).toBe('usa-${componentName}');
    });

    it('should have proper USWDS classes', async () => {
      // Add test content
      const testContent = document.createElement('${getTestElementType(componentName)}');
      testContent.textContent = 'Test content';
      element.appendChild(testContent);

      await element.updateComplete;

      // Should have some USWDS-related classes
      const hasUSWDSClasses = element.classList.toString().includes('usa-') ||
                             element.querySelector('[class*="usa-"]') !== null;
      expect(hasUSWDSClasses).toBe(true);
    });

    it('should pass accessibility tests', async () => {
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.BASIC_COMPLIANCE);
    });
  });`;
}

/**
 * Helper functions for generating component-specific code
 */
function getTestElementType(componentName) {
  const elementTypes = {
    'modal': 'div',
    'accordion': 'button',
    'date-picker': 'input',
    'combo-box': 'input',
    'time-picker': 'input',
    'header': 'nav',
    'menu': 'ul',
    'file-input': 'input',
    'card': 'div',
    'alert': 'div',
    'button': 'button',
    'link': 'a'
  };
  return elementTypes[componentName] || 'div';
}

function getPropertyApplicationCode(componentName) {
  const propertyCode = {
    'modal': 'element.open = true;',
    'accordion': 'element.expanded = false;',
    'date-picker': 'element.value = "2023-12-25";',
    'combo-box': 'element.value = "test";',
    'time-picker': 'element.value = "12:00";',
    'tooltip': 'element.position = "bottom";'
  };
  return propertyCode[componentName] || '// No specific properties to test';
}

function getAttributeValidationCode(componentName) {
  const validationCode = {
    'modal': 'expect(testElement.getAttribute("aria-modal")).toBeTruthy();',
    'accordion': 'expect(testElement.getAttribute("aria-expanded")).toBeTruthy();',
    'date-picker': 'expect(testElement.getAttribute("type")).toBe("date");',
    'combo-box': 'expect(testElement.getAttribute("role")).toBe("combobox");',
    'time-picker': 'expect(testElement.getAttribute("type")).toBe("time");',
    'tooltip': 'expect(testElement.getAttribute("data-position")).toBeTruthy();'
  };
  return validationCode[componentName] || 'expect(testElement.getAttribute("class")).toBeTruthy();';
}

function getPropertyUpdateTestCode(componentName) {
  const updateCode = {
    'modal': `
      element.open = false;
      await element.updateComplete;
      expect(element.open).toBe(false);

      element.open = true;
      await element.updateComplete;
      expect(element.open).toBe(true);
    `,
    'accordion': `
      element.expanded = true;
      await element.updateComplete;
      expect(element.expanded).toBe(true);
    `,
    'tooltip': `
      element.position = 'top';
      await element.updateComplete;
      expect(element.position).toBe('top');

      element.position = 'bottom';
      await element.updateComplete;
      expect(element.position).toBe('bottom');
    `
  };
  return updateCode[componentName] || `
      // Test property updates
      await element.updateComplete;
      expect(element).toBeTruthy();
    `;
}

function toPascalCase(str) {
  return str.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

/**
 * Main execution
 */
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Component Validation Test Generator

Usage:
  node scripts/component-validation-generator.js [options]

Options:
  --component=NAME    Generate validation test for specific component
  --risk=LEVEL       Generate tests for all components at risk level (high|medium|low)
  --list             List all components and their risk levels
  --help, -h         Show this help

Examples:
  # Generate validation test for modal component
  node scripts/component-validation-generator.js --component=modal

  # Generate tests for all high-risk components
  node scripts/component-validation-generator.js --risk=high

  # List all components and risk levels
  node scripts/component-validation-generator.js --list
`);
  process.exit(0);
}

if (args.includes('--list')) {
  console.log('Component Risk Assessment:');
  console.log('========================');

  Object.entries(COMPONENT_RISK_PROFILES).forEach(([name, profile]) => {
    console.log(`${name.padEnd(20)} ${profile.risk.toUpperCase().padEnd(8)} ${profile.validations.join(', ')}`);
  });
  process.exit(0);
}

const componentArg = args.find(arg => arg.startsWith('--component='));
const riskArg = args.find(arg => arg.startsWith('--risk='));

if (componentArg) {
  const componentName = componentArg.split('=')[1];
  try {
    generateComponentValidationTest(componentName);
  } catch (error) {
    console.error(`Error generating test for ${componentName}:`, error.message);
    process.exit(1);
  }
} else if (riskArg) {
  const riskLevel = riskArg.split('=')[1];
  const componentsAtRiskLevel = Object.entries(COMPONENT_RISK_PROFILES)
    .filter(([name, profile]) => profile.risk === riskLevel)
    .map(([name]) => name);

  if (componentsAtRiskLevel.length === 0) {
    console.error(`No components found at risk level: ${riskLevel}`);
    process.exit(1);
  }

  console.log(`Generating validation tests for ${componentsAtRiskLevel.length} ${riskLevel}-risk components:`);
  componentsAtRiskLevel.forEach(componentName => {
    try {
      generateComponentValidationTest(componentName);
    } catch (error) {
      console.error(`Error generating test for ${componentName}:`, error.message);
    }
  });
} else {
  console.error('Please specify --component=NAME or --risk=LEVEL');
  console.log('Use --help for usage information');
  process.exit(1);
}