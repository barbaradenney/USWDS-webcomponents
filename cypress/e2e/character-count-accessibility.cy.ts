/**
 * Character Count - Accessibility Tests
 *
 * These tests cover browser-specific character count behavior that requires:
 * - Real textarea measurement and interaction
 * - ARIA live region announcements
 * - Dynamic content updates with proper accessibility
 *
 * Migrated from: src/components/character-count/usa-character-count.test.ts
 * - 2 tests that were skipped due to browser-specific ARIA and layout requirements
 */

describe('Character Count - Accessibility', () => {
  beforeEach(() => {
    // Handle expected ChildPart errors from USWDS JavaScript conflicts
    // The character-count component uses Pure Lit Implementation to avoid this,
    // but USWDS JavaScript may still attempt to manipulate the DOM in Storybook
    cy.on('uncaught:exception', (err) => {
      // Ignore ChildPart errors - these are expected when USWDS tries to manipulate Lit's DOM
      if (err.message.includes('ChildPart') && err.message.includes('parentNode')) {
        return false; // Prevent Cypress from failing the test
      }
      // Let other errors fail the test
      return true;
    });

    // Visit the character count Storybook story
    cy.visit('/iframe.html?id=components-character-count--default&viewMode=story');

    // Wait for component to render (NOT waiting for USWDS - this component doesn't use it)
    cy.wait(500);

    // Get the component
    cy.get('usa-character-count').as('characterCount');

    // Inject axe for accessibility testing
    cy.injectAxe();
  });

  describe('Comprehensive Accessibility Tests (WCAG)', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', () => {
      cy.get('@characterCount').should('be.visible');

      // Run axe accessibility audit
      cy.checkA11y('usa-character-count', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
        },
        rules: {
          // Character count specific rules
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'label': { enabled: true }
        }
      });

      // Verify specific ARIA attributes (following USWDS structure)
      cy.get('@characterCount').within(() => {
        // USWDS creates two status messages:
        // 1. .usa-character-count__status with aria-hidden (visual)
        // 2. .usa-character-count__sr-status with aria-live (screen reader)

        // Screen reader status should have aria-live
        cy.get('.usa-character-count__sr-status')
          .should('have.attr', 'aria-live', 'polite')
          .and('have.class', 'usa-sr-only');

        // Visual status should be hidden from screen readers
        cy.get('.usa-character-count__status')
          .should('have.attr', 'aria-hidden', 'true')
          .and('have.class', 'usa-hint');

        // Input/textarea should have aria-describedby pointing to message
        cy.get('textarea, input').then($input => {
          const describedby = $input.attr('aria-describedby');
          expect(describedby).to.exist;
          // Should include the info/message ID
          expect(describedby).to.include('-info');
        });
      });
    });

    it('should have proper label association', () => {
      cy.get('@characterCount').within(() => {
        // Label should exist and be associated
        cy.get('label').then($label => {
          const forAttr = $label.attr('for');
          expect(forAttr).to.exist;

          // Input/textarea should have matching ID
          cy.get('textarea, input').should('have.attr', 'id', forAttr);
        });
      });
    });

    it('should have accessible character count message', () => {
      cy.get('@characterCount').within(() => {
        // Character count message should be accessible
        cy.get('.usa-character-count__status')
          .should('exist')
          .and('be.visible')
          .and('not.be.empty');

        // Message should update dynamically
        cy.get('textarea, input').type('Test');

        // Wait for USWDS to update character count
        cy.wait(100);

        // Status message should reflect character count
        cy.get('.usa-character-count__status')
          .should('contain.text', 'character');
      });
    });

    it('should support keyboard navigation', () => {
      cy.get('@characterCount').within(() => {
        // Tab to input
        cy.get('textarea, input')
          .focus()
          .should('have.focus');

        // Input should be keyboard accessible
        cy.focused().type('Testing keyboard input');

        // Wait for USWDS to update character count
        cy.wait(100);

        // Character count should update
        cy.get('.usa-character-count__status')
          .should('contain.text', 'character');
      });
    });

    it('should have visible focus indicators (WCAG 2.4.7)', () => {
      cy.get('@characterCount').within(() => {
        cy.get('textarea, input').focus();

        // Focused element should have visible outline
        cy.focused()
          .should('have.css', 'outline-width')
          .and('not.equal', '0px');
      });
    });

    it('should support screen reader announcements for limit', () => {
      cy.get('@characterCount').within(() => {
        // Type until near limit
        const textarea = cy.get('textarea, input');

        // Get max length
        textarea.invoke('attr', 'maxlength').then(maxLength => {
          if (maxLength) {
            const nearLimit = 'a'.repeat(parseInt(maxLength) - 5);
            textarea.clear().type(nearLimit);

            // Wait for USWDS to update status
            cy.wait(100);

            // Status should show remaining characters
            cy.get('.usa-character-count__status')
              .should('contain.text', 'character');
          }
        });
      });
    });

    it('should warn when approaching character limit', () => {
      cy.get('@characterCount').within(() => {
        const textarea = cy.get('textarea, input');

        // Type text approaching limit
        textarea.invoke('attr', 'maxlength').then(maxLength => {
          if (maxLength) {
            // Type to within 10 characters of limit
            const text = 'a'.repeat(parseInt(maxLength) - 10);
            textarea.clear().type(text);

            // Wait for USWDS to update status
            cy.wait(100);

            // Status should indicate approaching limit
            cy.get('.usa-character-count__status')
              .should('exist')
              .and('be.visible');

            // Screen reader status should have aria-live for announcements
            cy.get('.usa-character-count__sr-status')
              .should('have.attr', 'aria-live', 'polite');
          }
        });
      });
    });

    it('should indicate error state when limit exceeded', () => {
      // Visit error state story
      cy.visit('/iframe.html?id=components-character-count--error&viewMode=story');
      cy.wait(500);

      cy.get('usa-character-count').within(() => {
        const textarea = cy.get('textarea, input');

        // Get max length and exceed it
        textarea.invoke('attr', 'maxlength').then(maxLength => {
          if (!maxLength) {
            // If no maxlength, set one programmatically for testing
            textarea.invoke('attr', 'maxlength', '50');
          }
        });

        // Type beyond limit (browser may prevent, but status should show)
        textarea.clear().type('a'.repeat(60), { force: true });

        // Wait for USWDS to update error state
        cy.wait(150);

        // Status should show error state
        cy.get('.usa-character-count__status')
          .should('have.class', 'usa-character-count__status--error');
      });
    });
  });

  describe('Dynamic Content Updates with ARIA', () => {
    it('should maintain accessibility during dynamic content updates', () => {
      cy.get('@characterCount').should('be.visible');

      // Initial state - verify ARIA (USWDS uses __sr-status for screen readers)
      cy.get('@characterCount').within(() => {
        cy.get('.usa-character-count__sr-status')
          .should('have.attr', 'aria-live', 'polite')
          .and('have.class', 'usa-sr-only');
      });

      // Type content
      cy.get('@characterCount').within(() => {
        cy.get('textarea, input').type('First update');
      });

      // Wait for update
      cy.wait(100);

      // Verify ARIA attributes persist
      cy.get('@characterCount').within(() => {
        cy.get('.usa-character-count__sr-status')
          .should('have.attr', 'aria-live', 'polite')
          .and('have.class', 'usa-sr-only');
      });

      // Clear and type new content
      cy.get('@characterCount').within(() => {
        cy.get('textarea, input').clear().type('Second update with more text');
      });

      // Wait for update
      cy.wait(100);

      // Verify ARIA attributes still persist
      cy.get('@characterCount').within(() => {
        cy.get('.usa-character-count__sr-status')
          .should('have.attr', 'aria-live', 'polite')
          .and('have.class', 'usa-sr-only');

        // Visual status should have updated content
        cy.get('.usa-character-count__status')
          .should('contain.text', 'character');
      });

      // Run accessibility audit after updates
      cy.checkA11y('usa-character-count', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });
    });

    it('should announce changes to screen readers', () => {
      cy.get('@characterCount').within(() => {
        // Screen reader status should be a live region (USWDS uses __sr-status)
        cy.get('.usa-character-count__sr-status')
          .should('have.attr', 'aria-live', 'polite');

        // Type content to trigger announcement
        cy.get('textarea, input').type('Testing announcements');

        // Wait for USWDS to update status
        cy.wait(100);

        // Status should update (screen reader would announce)
        cy.get('.usa-character-count__status')
          .should('be.visible')
          .and('not.be.empty');
      });
    });

    it('should maintain aria-describedby relationship during updates', () => {
      cy.get('@characterCount').within(() => {
        // Get initial relationship
        cy.get('textarea, input').invoke('attr', 'aria-describedby').as('describedbyId');

        // Type content
        cy.get('textarea, input').type('Update content');

        // Wait for update
        cy.wait(100);

        // Relationship should persist
        cy.get('textarea, input').then($input => {
          cy.get('@describedbyId').then((initialId: any) => {
            expect($input.attr('aria-describedby')).to.equal(initialId);
          });
        });

        // Clear and type more
        cy.get('textarea, input').clear().type('More updates');
        cy.wait(100);

        // Relationship should still persist
        cy.get('textarea, input').then($input => {
          cy.get('@describedbyId').then((initialId: any) => {
            expect($input.attr('aria-describedby')).to.equal(initialId);
          });
        });
      });
    });

    it('should handle rapid content changes accessibly', () => {
      cy.get('@characterCount').within(() => {
        const textarea = cy.get('textarea, input');

        // Rapid updates
        textarea.type('A');
        cy.wait(50);
        textarea.type('B');
        cy.wait(50);
        textarea.type('C');
        cy.wait(50);

        // ARIA attributes should remain stable on screen reader status
        cy.get('.usa-character-count__sr-status')
          .should('have.attr', 'aria-live', 'polite')
          .and('have.class', 'usa-sr-only');
      });

      // Should still pass accessibility audit
      cy.checkA11y('usa-character-count');
    });

    it('should support textarea variant accessibility', () => {
      // Visit textarea variant
      cy.visit('/iframe.html?id=components-character-count--textarea&viewMode=story');
      cy.wait(500);

      cy.get('usa-character-count').within(() => {
        // Should have textarea
        cy.get('textarea').should('exist');

        // Textarea should have proper ARIA
        cy.get('textarea')
          .should('have.attr', 'aria-describedby')
          .and('have.attr', 'id');

        // Visual status should be visible, SR status should have aria-live
        cy.get('.usa-character-count__status').should('be.visible');
        cy.get('.usa-character-count__sr-status')
          .should('have.attr', 'aria-live', 'polite');
      });

      // Accessibility audit
      cy.checkA11y('usa-character-count');
    });

    it('should support input variant accessibility', () => {
      // Visit input variant
      cy.visit('/iframe.html?id=components-character-count--input&viewMode=story');
      cy.wait(1000);

      cy.get('usa-character-count').within(() => {
        // Should have input
        cy.get('input[type="text"]').should('exist');

        // Input should have proper ARIA
        cy.get('input')
          .should('have.attr', 'aria-describedby')
          .and('have.attr', 'id');

        // Visual status should be visible, SR status should have aria-live
        cy.get('.usa-character-count__status').should('be.visible');
        cy.get('.usa-character-count__sr-status')
          .should('have.attr', 'aria-live', 'polite');
      });

      // Accessibility audit
      cy.checkA11y('usa-character-count');
    });
  });

  describe('WCAG 2.1 Compliance', () => {
    it('should pass WCAG 2.1 Level AA', () => {
      cy.checkA11y('usa-character-count', {
        runOnly: {
          type: 'tag',
          values: ['wcag21aa']
        }
      });
    });

    it('should support reflow at 320px width (WCAG 1.4.10)', () => {
      // Set viewport to 320px
      cy.viewport(320, 568);

      cy.get('@characterCount').should('be.visible');

      // Component should reflow without horizontal scroll
      cy.get('usa-character-count').then($el => {
        expect($el[0].scrollWidth).to.be.lte($el[0].clientWidth + 1);
      });

      // Should still be accessible at narrow width
      cy.checkA11y('usa-character-count');
    });

    it('should support text spacing adjustments (WCAG 1.4.12)', () => {
      // Apply text spacing CSS
      cy.get('@characterCount').invoke('css', {
        'line-height': '1.5',
        'letter-spacing': '0.12em',
        'word-spacing': '0.16em'
      });

      // Should remain readable
      cy.get('@characterCount').within(() => {
        cy.get('textarea, input').should('be.visible');
        cy.get('.usa-character-count__status').should('be.visible');
      });

      // Should still pass accessibility
      cy.checkA11y('usa-character-count');
    });
  });
});
