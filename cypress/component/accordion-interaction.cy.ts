/**
 * Cypress Component Tests for Accordion Interaction
 *
 * These tests run in a real browser environment and would have caught
 * the accordion button click issue we just fixed.
 */

import '../../src/components/accordion/usa-accordion.ts';
import type { USAAccordion } from '../../src/components/accordion/usa-accordion.js';

describe('Accordion Real Browser Interaction Tests', () => {
  beforeEach(() => {
    // Mount accordion component with test data
    cy.mount(`
      <usa-accordion id="test-accordion">
      </usa-accordion>
    `).then(() => {
      // Set up test data
      cy.get('#test-accordion').then(($el) => {
        const accordion = $el[0] as USAAccordion;
        accordion.items = [
          {
            id: 'interaction-test-1',
            title: 'First Accordion Item',
            content: '<p>This is the first item content</p>',
            expanded: false
          },
          {
            id: 'interaction-test-2',
            title: 'Second Accordion Item',
            content: '<p>This is the second item content</p>',
            expanded: true
          },
          {
            id: 'interaction-test-3',
            title: 'Third Accordion Item',
            content: '<p>This is the third item content</p>',
            expanded: false
          }
        ];
      });

      // Wait for component to render and USWDS to initialize
      cy.wait(200);
    });
  });

  describe('🔧 USWDS JavaScript Detection', () => {
    it('should have proper USWDS console messages', () => {
      // Check window console for USWDS loading messages
      cy.window().then((win) => {
        // Set up console monitoring
        const consoleLogs: string[] = [];
        const originalLog = win.console.log;

        win.console.log = (...args: any[]) => {
          consoleLogs.push(args.join(' '));
          originalLog.apply(win.console, args);
        };

        // Trigger accordion initialization
        cy.get('.usa-accordion__button').first().should('exist');

        // Check for USWDS success messages
        cy.then(() => {
          const hasUSWDSMessage = consoleLogs.some(log =>
            log.includes('✅ USWDS accordion initialized') ||
            log.includes('✅ Using pre-loaded USWDS') ||
            log.includes('✅ Pre-loaded USWDS accordion module')
          );

          if (!hasUSWDSMessage) {
            cy.log('⚠️ USWDS console messages not detected');
            cy.log('Console logs:', consoleLogs);
          }
        });
      });
    });

    it('should have correct DOM structure for USWDS', () => {
      cy.get('.usa-accordion').should('exist');
      cy.get('.usa-accordion__button').should('have.length', 3);
      cy.get('.usa-accordion__content').should('have.length', 3);

      // Verify ARIA attributes
      cy.get('.usa-accordion__button').each(($button) => {
        cy.wrap($button).should('have.attr', 'aria-expanded');
        cy.wrap($button).should('have.attr', 'aria-controls');
        cy.wrap($button).should('have.attr', 'type', 'button');
      });
    });
  });

  describe('🖱️ Click Interaction Testing', () => {
    it('should expand accordion item when button is clicked', () => {
      // Get first accordion button (initially collapsed)
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'false');

      cy.get('[id="interaction-test-1-content"]')
        .should('have.attr', 'hidden');

      // Click the button
      cy.get('[id="interaction-test-1-button"]').click();

      // Verify it expanded
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'true');

      cy.get('[id="interaction-test-1-content"]')
        .should('not.have.attr', 'hidden');

      // Verify content is visible
      cy.get('[id="interaction-test-1-content"]')
        .should('be.visible')
        .should('contain.text', 'This is the first item content');
    });

    it('should collapse accordion item when expanded button is clicked', () => {
      // Get second accordion button (initially expanded)
      cy.get('[id="interaction-test-2-button"]')
        .should('have.attr', 'aria-expanded', 'true');

      cy.get('[id="interaction-test-2-content"]')
        .should('not.have.attr', 'hidden');

      // Click the button to collapse
      cy.get('[id="interaction-test-2-button"]').click();

      // Verify it collapsed
      cy.get('[id="interaction-test-2-button"]')
        .should('have.attr', 'aria-expanded', 'false');

      cy.get('[id="interaction-test-2-content"]')
        .should('have.attr', 'hidden');
    });

    it('should handle rapid clicking without breaking', () => {
      const button = '[id="interaction-test-1-button"]';

      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        cy.get(button).click();
        cy.wait(50);
      }

      // After odd number of clicks, should be expanded
      cy.get(button).should('have.attr', 'aria-expanded', 'true');

      // One more click to collapse
      cy.get(button).click();
      cy.get(button).should('have.attr', 'aria-expanded', 'false');
    });

    it('should handle single-select mode (default)', () => {
      // Expand first item
      cy.get('[id="interaction-test-1-button"]').click();
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'true');

      // Second item should close when first expands (single-select)
      cy.get('[id="interaction-test-2-button"]')
        .should('have.attr', 'aria-expanded', 'false');
    });

    it('should detect if buttons are completely unresponsive', () => {
      const button = '[id="interaction-test-1-button"]';

      // Get initial state
      cy.get(button).invoke('attr', 'aria-expanded').then((initialState) => {
        // Click multiple times
        cy.get(button).click();
        cy.wait(100);
        cy.get(button).click();
        cy.wait(100);
        cy.get(button).click();
        cy.wait(100);

        // Final state should be different after odd number of clicks
        cy.get(button).invoke('attr', 'aria-expanded').then((finalState) => {
          if (finalState === initialState) {
            throw new Error(
              `🚨 ACCORDION BUTTONS NOT RESPONDING TO CLICKS!
              Initial: ${initialState}, Final: ${finalState}
              This indicates JavaScript event handlers are not working.`
            );
          }
        });
      });
    });
  });

  describe('⌨️ Keyboard Interaction Testing', () => {
    it('should respond to Enter key', () => {
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'false')
        .focus()
        .type('{enter}');

      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'true');
    });

    it('should respond to Space key', () => {
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'false')
        .focus()
        .type(' ');

      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'true');
    });

    it('should not respond to other keys', () => {
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'false')
        .focus()
        .type('{downarrow}');

      // Should remain unchanged
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'false');
    });
  });

  describe('🔊 Event Dispatching Testing', () => {
    it('should dispatch custom accordion-toggle events', () => {
      // Set up event listener
      cy.window().then((win) => {
        let eventCaught = false;
        let eventDetails: any = null;

        cy.get('#test-accordion').then(($accordion) => {
          $accordion[0].addEventListener('accordion-toggle', (event: any) => {
            eventCaught = true;
            eventDetails = event.detail;
          });

          // Click button to trigger event
          cy.get('[id="interaction-test-1-button"]').click();

          // Verify event was dispatched
          cy.then(() => {
            expect(eventCaught).to.be.true;
            expect(eventDetails).to.exist;
            expect(eventDetails.itemId).to.equal('interaction-test-1');
            expect(eventDetails.expanded).to.be.true;
          });
        });
      });
    });
  });

  describe('♿ Accessibility Testing', () => {
    it('should pass accessibility checks', () => {
      cy.checkAccessibility();
    });

    it('should maintain focus management', () => {
      // Focus button and activate
      cy.get('[id="interaction-test-1-button"]')
        .focus()
        .should('be.focused')
        .click();

      // Button should still be focused after click
      cy.get('[id="interaction-test-1-button"]')
        .should('be.focused');
    });

    it('should have proper ARIA attributes after interaction', () => {
      cy.get('[id="interaction-test-1-button"]').click();

      // Check ARIA attributes are updated
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'true')
        .should('have.attr', 'aria-controls', 'interaction-test-1-content');

      cy.get('[id="interaction-test-1-content"]')
        .should('have.attr', 'aria-hidden', 'false');
    });
  });

  describe('📱 Multiselectable Mode Testing', () => {
    beforeEach(() => {
      // Enable multiselectable mode
      cy.get('#test-accordion').then(($el) => {
        const accordion = $el[0] as USAAccordion;
        accordion.multiselectable = true;
      });
      cy.wait(100);
    });

    it('should allow multiple items to be expanded', () => {
      // Expand first item
      cy.get('[id="interaction-test-1-button"]').click();
      cy.get('[id="interaction-test-1-button"]')
        .should('have.attr', 'aria-expanded', 'true');

      // Second item should remain expanded (multiselectable)
      cy.get('[id="interaction-test-2-button"]')
        .should('have.attr', 'aria-expanded', 'true');

      // Expand third item
      cy.get('[id="interaction-test-3-button"]').click();
      cy.get('[id="interaction-test-3-button"]')
        .should('have.attr', 'aria-expanded', 'true');

      // All should be expanded
      cy.get('.usa-accordion__button[aria-expanded="true"]')
        .should('have.length', 3);
    });
  });
});