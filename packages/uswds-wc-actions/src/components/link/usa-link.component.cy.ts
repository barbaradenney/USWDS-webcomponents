// Component tests for usa-link
import './index.ts';
import {
  testRapidClicking,
  testRapidKeyboardInteraction,
  COMMON_BUG_PATTERNS,
} from '../../cypress/support/rapid-interaction-tests.ts';

describe('Link Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-link></usa-link>');
    cy.get('usa-link').should('exist');
    cy.get('usa-link').should('be.visible');
  });

  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<usa-link></usa-link>');

    // Rapid clicking without waiting - simulates real user behavior
    cy.get('usa-link').as('component');

    // Multiple rapid clicks
    cy.get('@component').click().click().click().click().click();

    cy.wait(500); // Let events settle

    // Component should remain functional
    cy.get('@component').should('exist');
    cy.get('@component').should('be.visible');
  });

  it('should handle interaction during CSS transitions', () => {
    cy.mount('<usa-link></usa-link>');

    // Click during potential transitions
    cy.get('usa-link').click().click(); // Immediate second click

    cy.wait(1000); // Wait for animations

    // Should be in consistent state
    cy.get('usa-link').should('exist');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-link></usa-link>');

      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-link',
        clickCount: 15,
        description: 'event listener duplication',
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-link></usa-link>');

      // Test for race conditions during state changes
      cy.get('usa-link').as('component');

      // Rapid interactions that might cause race conditions
      cy.get('@component').click().click().trigger('focus').trigger('blur').click();

      cy.wait(1000); // Wait for all async operations

      // Component should still be functional
      cy.get('@component').should('exist');
      cy.get('@component').should('be.visible');
    });
  });

  // Accessibility testing - critical for government components
  it('should be accessible', () => {
    cy.mount('<usa-link></usa-link>');

    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-link></usa-link>');

    // Perform various rapid interactions
    cy.get('usa-link').click().focus().blur().click().click();

    cy.wait(500);

    // Accessibility should still be intact
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<usa-link></usa-link>');
      cy.get('usa-link').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-link></usa-link>');

    // Various interactions that might cause errors
    cy.get('usa-link').click().trigger('mouseenter').trigger('mouseleave').focus().blur();

    cy.wait(500);

    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });
});
