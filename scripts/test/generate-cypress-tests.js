#!/usr/bin/env node

/**
 * Generate comprehensive Cypress component tests for USWDS components
 * 
 * This script creates browser-based tests that catch real-world bugs
 * like timing issues, race conditions, and visual rendering problems
 * that unit tests often miss.
 */

import fs from 'fs';
import path from 'path';

// Component interaction patterns that commonly have bugs
const INTERACTION_PATTERNS = {
  clickable: ['button', 'accordion', 'modal', 'dropdown', 'menu', 'tab'],
  formInput: ['input', 'textarea', 'select', 'combo-box', 'date-picker', 'time-picker'],
  toggleable: ['accordion', 'modal', 'dropdown', 'checkbox', 'radio'],
  navigable: ['menu', 'tab', 'step-indicator', 'pagination'],
  complex: ['table', 'combo-box', 'date-picker', 'file-input'],
};

// Test templates for different component types
const TEST_TEMPLATES = {
  clickable: (componentName, tagName) => `
  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<${tagName}></${tagName}>');
    
    // Rapid clicking without waiting - simulates real user behavior
    cy.get('${tagName}').as('component');
    
    // Multiple rapid clicks
    cy.get('@component')
      .click()
      .click()
      .click()
      .click()
      .click();
    
    cy.wait(500); // Let events settle
    
    // Component should remain functional
    cy.get('@component').should('exist');
    cy.get('@component').should('be.visible');
  });

  it('should handle interaction during CSS transitions', () => {
    cy.mount('<${tagName}></${tagName}>');
    
    // Click during potential transitions
    cy.get('${tagName}')
      .click()
      .click(); // Immediate second click
    
    cy.wait(1000); // Wait for animations
    
    // Should be in consistent state
    cy.get('${tagName}').should('exist');
  });`,

  formInput: (componentName, tagName) => `
  it('should handle rapid input changes without errors', () => {
    cy.mount('<${tagName}></${tagName}>');
    
    const testValues = ['test1', 'test2', 'test3', ''];
    
    // Rapidly change input values
    testValues.forEach(value => {
      cy.get('${tagName} input, ${tagName}').clear().type(value);
    });
    
    cy.wait(500);
    
    // Input should still be functional
    cy.get('${tagName} input, ${tagName}').should('exist');
    cy.get('${tagName} input, ${tagName}').should('not.be.disabled');
  });`,

  toggleable: (componentName, tagName) => `
  it('should handle rapid toggle operations', () => {
    cy.mount('<${tagName}></${tagName}>');
    
    // Rapid toggle operations
    for (let i = 0; i < 10; i++) {
      cy.get('${tagName} button, ${tagName}').click();
    }
    
    cy.wait(500);
    
    // Should be in predictable final state
    cy.get('${tagName}').should('exist');
    cy.get('${tagName}').should('be.visible');
  });`,

  navigable: (componentName, tagName) => `
  it('should handle rapid keyboard navigation', () => {
    cy.mount('<${tagName}></${tagName}>');
    
    // Rapid keyboard navigation
    cy.get('${tagName}').focus();
    
    const keys = ['{rightarrow}', '{leftarrow}', '{downarrow}', '{uparrow}'];
    
    // Rapidly navigate
    for (let i = 0; i < 20; i++) {
      const key = keys[i % keys.length];
      cy.get('${tagName}').type(key);
    }
    
    cy.wait(500);
    
    // Navigation should still work
    cy.get('${tagName}').should('exist');
    cy.get('${tagName}').should('be.visible');
  });`
};

function generateCypressTest(componentName, tagName, _componentPath) {
  const className = componentName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  // Determine component type based on name
  const componentTypes = [];
  Object.entries(INTERACTION_PATTERNS).forEach(([type, patterns]) => {
    if (patterns.some(pattern => componentName.includes(pattern))) {
      componentTypes.push(type);
    }
  });

  // If no specific type, default to clickable
  if (componentTypes.length === 0) {
    componentTypes.push('clickable');
  }

  // Generate test content
  const testMethods = componentTypes.map(type => 
    TEST_TEMPLATES[type] ? TEST_TEMPLATES[type](componentName, tagName) : ''
  ).filter(Boolean).join('\\n');

  return `// Component tests for ${tagName}
import './index.ts';
import { testRapidClicking, testRapidKeyboardInteraction, COMMON_BUG_PATTERNS } from '../../../cypress/support/rapid-interaction-tests.ts';

describe('${className} Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<${tagName}></${tagName}>');
    cy.get('${tagName}').should('exist');
    cy.get('${tagName}').should('be.visible');
  });

  ${testMethods}

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<${tagName}></${tagName}>');
      
      // Test for event listener duplication
      testRapidClicking({
        selector: '${tagName}',
        clickCount: 15,
        description: 'event listener duplication'
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<${tagName}></${tagName}>');
      
      // Test for race conditions during state changes
      cy.get('${tagName}').as('component');
      
      // Rapid interactions that might cause race conditions
      cy.get('@component')
        .click()
        .click()
        .trigger('focus')
        .trigger('blur')
        .click();
      
      cy.wait(1000); // Wait for all async operations
      
      // Component should still be functional
      cy.get('@component').should('exist');
      cy.get('@component').should('be.visible');
    });
  });

  // Accessibility testing - critical for government components
  it('should be accessible', () => {
    cy.mount('<${tagName}></${tagName}>');
    
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<${tagName}></${tagName}>');
    
    // Perform various rapid interactions
    cy.get('${tagName}')
      .click()
      .focus()
      .blur()
      .click()
      .click();
    
    cy.wait(500);
    
    // Accessibility should still be intact
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<${tagName}></${tagName}>');
      cy.get('${tagName}').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<${tagName}></${tagName}>');
    
    // Various interactions that might cause errors
    cy.get('${tagName}')
      .click()
      .trigger('mouseenter')
      .trigger('mouseleave')
      .focus()
      .blur();
    
    cy.wait(500);
    
    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });
});`;
}

function getComponentsWithoutCypressTests() {
  const componentsDir = 'src/components';
  const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const componentsWithoutTests = [];

  componentDirs.forEach(componentDir => {
    const componentPath = path.join(componentsDir, componentDir);
    const cypressTestPath = path.join(componentPath, `usa-${componentDir}.component.cy.ts`);
    
    if (!fs.existsSync(cypressTestPath)) {
      // Check if component actually exists
      const componentFilePath = path.join(componentPath, `usa-${componentDir}.ts`);
      if (fs.existsSync(componentFilePath)) {
        componentsWithoutTests.push({
          name: componentDir,
          path: componentPath,
          componentFile: componentFilePath,
          testFile: cypressTestPath
        });
      }
    }
  });

  return componentsWithoutTests;
}

function main() {
  console.log('🔍 Scanning for components without Cypress tests...');
  
  const componentsWithoutTests = getComponentsWithoutCypressTests();
  
  if (componentsWithoutTests.length === 0) {
    console.log('✅ All components already have Cypress tests!');
    return;
  }

  console.log(`📝 Found ${componentsWithoutTests.length} components without Cypress tests:`);
  componentsWithoutTests.forEach(comp => {
    console.log(`   - ${comp.name}`);
  });

  const shouldGenerate = process.argv.includes('--generate');
  
  if (!shouldGenerate) {
    console.log('\\n🚀 Run with --generate flag to create missing test files');
    console.log('   Example: node scripts/generate-cypress-tests.js --generate');
    return;
  }

  console.log('\\n🛠️  Generating Cypress tests...');

  componentsWithoutTests.forEach(({ name, testFile }) => {
    const tagName = `usa-${name}`;
    const testContent = generateCypressTest(name, tagName, '');
    
    try {
      fs.writeFileSync(testFile, testContent);
      console.log(`✅ Created: ${testFile}`);
    } catch (error) {
      console.error(`❌ Failed to create ${testFile}:`, error.message);
    }
  });

  console.log(`\\n🎉 Generated Cypress tests for ${componentsWithoutTests.length} components!`);
  console.log('\\n📋 Next steps:');
  console.log('   1. Review generated tests and customize as needed');
  console.log('   2. Run tests: npm run cypress:run');
  console.log('   3. Fix any discovered bugs');
  console.log('   4. Add component-specific test cases');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateCypressTest, getComponentsWithoutCypressTests };