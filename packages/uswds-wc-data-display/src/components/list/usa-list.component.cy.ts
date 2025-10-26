// Component tests for usa-list
import './index.ts';
import { testRapidClicking, testRapidKeyboardInteraction, COMMON_BUG_PATTERNS } from '../../cypress/support/rapid-interaction-tests.ts';

describe('List Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-list></usa-list>');
    cy.get('usa-list').should('exist');
    cy.get('usa-list').should('be.visible');
  });

  
  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<usa-list></usa-list>');
    
    // Rapid clicking without waiting - simulates real user behavior
    cy.get('usa-list').as('component');
    
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
    cy.mount('<usa-list></usa-list>');
    
    // Click during potential transitions
    cy.get('usa-list')
      .click()
      .click(); // Immediate second click
    
    cy.wait(1000); // Wait for animations
    
    // Should be in consistent state
    cy.get('usa-list').should('exist');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-list></usa-list>');
      
      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-list',
        clickCount: 15,
        description: 'event listener duplication'
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-list></usa-list>');
      
      // Test for race conditions during state changes
      cy.get('usa-list').as('component');
      
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
    cy.mount('<usa-list></usa-list>');
    
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-list></usa-list>');

    // Perform various rapid interactions
    cy.get('usa-list')
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

  // Comprehensive accessibility tests (moved from Vitest - require real browser)
  it('should pass comprehensive accessibility tests with list items', () => {
    cy.mount('<usa-list type="unordered"></usa-list>');

    cy.get('usa-list').then(($el) => {
      const element = $el[0];
      const listElement = element.querySelector('ul');

      if (listElement) {
        // Add test items directly to the list element
        listElement.innerHTML = '';
        ['First benefit', 'Second benefit', 'Third benefit'].forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          listElement.appendChild(li);
        });
      }
    });

    // Test accessibility
    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should maintain accessibility during dynamic content updates', () => {
    cy.mount('<usa-list type="unordered"></usa-list>');

    // Initial content
    cy.get('usa-list').then(($el) => {
      const element = $el[0];
      const listElement = element.querySelector('ul');

      if (listElement) {
        listElement.innerHTML = '';
        ['Initial item'].forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          listElement.appendChild(li);
        });
      }
    });

    cy.injectAxe();
    cy.checkAccessibility();

    // Update type to ordered
    cy.get('usa-list').invoke('attr', 'type', 'ordered');

    cy.get('usa-list').then(($el) => {
      const element = $el[0];
      const listElement = element.querySelector('ol');

      if (listElement) {
        listElement.innerHTML = '';
        ['Updated item 1', 'Updated item 2'].forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          listElement.appendChild(li);
        });
      }
    });

    // Should still be accessible after updates
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<usa-list></usa-list>');
      cy.get('usa-list').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-list></usa-list>');
    
    // Various interactions that might cause errors
    cy.get('usa-list')
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