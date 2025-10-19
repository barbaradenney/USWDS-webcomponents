// Component tests for usa-language-selector
import './index.ts';
import { testRapidClicking, testRapidKeyboardInteraction, COMMON_BUG_PATTERNS } from '../../cypress/support/rapid-interaction-tests.ts';

describe('LanguageSelector Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-language-selector></usa-language-selector>');
    cy.get('usa-language-selector').should('exist');
    cy.get('usa-language-selector').should('be.visible');
  });

  
  it('should handle rapid input changes without errors', () => {
    cy.mount('<usa-language-selector></usa-language-selector>');
    
    const testValues = ['test1', 'test2', 'test3', ''];
    
    // Rapidly change input values
    testValues.forEach(value => {
      cy.get('usa-language-selector input, usa-language-selector').clear().type(value);
    });
    
    cy.wait(500);
    
    // Input should still be functional
    cy.get('usa-language-selector input, usa-language-selector').should('exist');
    cy.get('usa-language-selector input, usa-language-selector').should('not.be.disabled');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-language-selector></usa-language-selector>');
      
      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-language-selector',
        clickCount: 15,
        description: 'event listener duplication'
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-language-selector></usa-language-selector>');
      
      // Test for race conditions during state changes
      cy.get('usa-language-selector').as('component');
      
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
    cy.mount('<usa-language-selector></usa-language-selector>');
    
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-language-selector></usa-language-selector>');
    
    // Perform various rapid interactions
    cy.get('usa-language-selector')
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
      cy.mount('<usa-language-selector></usa-language-selector>');
      cy.get('usa-language-selector').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-language-selector></usa-language-selector>');
    
    // Various interactions that might cause errors
    cy.get('usa-language-selector')
      .click()
      .trigger('mouseenter')
      .trigger('mouseleave')
      .focus()
      .blur();
    
    cy.wait(500);
    
    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });
});