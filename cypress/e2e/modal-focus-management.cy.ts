/**
 * Modal Focus Management - Browser-Dependent Tests
 *
 * These tests were migrated from Vitest because they require real browser APIs:
 * - Focus trap implementation
 * - ARIA relationship validation
 * - Responsive/reflow testing
 * - Real browser focus management
 *
 * See: cypress/BROWSER_TESTS_MIGRATION_PLAN.md
 * Source: src/components/modal/usa-modal.test.ts
 */

describe('Modal Focus Management', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?id=feedback-modal--default&viewMode=story');
    // Note: injectAxe moved to individual test that needs it to avoid race conditions
  });

  describe('Component Lifecycle Stability', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;

        // Make multiple property changes
        element.heading = 'Updated Heading';
        element.description = 'Updated description';
        element.open = true;

        // Element should still be connected to DOM
        expect(element.isConnected).to.be.true;
        expect(document.body.contains(element)).to.be.true;
      });
    });

    it('should handle rapid property updates without breaking', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;

        // Rapid updates
        for (let i = 0; i < 10; i++) {
          element.heading = `Heading ${i}`;
          element.open = i % 2 === 0;
        }

        // Should still be functional
        expect(element.isConnected).to.be.true;
      });
    });
  });

  describe('Focus Management (WCAG 2.4)', () => {
    it('should maintain visible focus indicators on all interactive elements (WCAG 2.4.7)', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
      });

      cy.wait(200); // Wait for modal to open

      // Tab through interactive elements
      cy.get('.usa-modal').within(() => {
        cy.get('button, a, [tabindex="0"]').each(($el) => {
          cy.wrap($el).focus();

          // Should have visible focus indicator
          cy.focused()
            .should('have.css', 'outline-width')
            .and('not.equal', '0px');
        });
      });
    });

    it('should trap focus within modal when open', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
      });

      cy.wait(200);

      // Focus should move to modal
      cy.get('.usa-modal').should('be.visible');

      // Get all focusable elements and verify focus stays in modal
      cy.get('.usa-modal').find('button, a, [tabindex]:not([tabindex="-1"])').then($focusable => {
        expect($focusable.length).to.be.at.least(2);

        const $first = $focusable.first();
        const $last = $focusable.last();

        // Focus the first element
        cy.wrap($first).focus();
        cy.wait(100);

        // Tab a few times
        cy.focused().tab();
        cy.wait(100);

        // Should still be within modal
        cy.focused().then($current => {
          const isInModal = $current.closest('.usa-modal').length > 0;
          expect(isInModal).to.be.true;
        });
      });
    });

    it('should return focus to trigger element when closed', () => {
      // Open modal
      cy.get('button').contains('Open Modal').as('trigger').click();

      cy.get('.usa-modal').should('be.visible');

      // Close modal
      cy.get('.usa-modal__close').click();

      // Focus should return to trigger
      cy.get('@trigger').should('have.focus');
    });
  });

  describe('ARIA/Screen Reader Accessibility (WCAG 4.1)', () => {
    it('should have correct ARIA labelledby relationship (WCAG 4.1.2)', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
      });

      cy.wait(200);

      cy.get('.usa-modal').then(($modal) => {
        const labelledBy = $modal.attr('aria-labelledby');

        // Check that attribute exists and has a value
        expect(labelledBy).to.be.a('string');
        expect(labelledBy).to.have.length.greaterThan(0);

        // Verify the referenced element exists
        if (labelledBy) {
          cy.get(`#${labelledBy}`).should('exist');
        }
      });
    });

    it('should have correct ARIA describedby relationship (WCAG 4.1.2)', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
        element.description = 'Modal description text';
      });

      cy.wait(200);

      cy.get('.usa-modal').then(($modal) => {
        const describedBy = $modal.attr('aria-describedby');

        if (describedBy) {
          // Verify the referenced element exists
          cy.get(`#${describedBy}`).should('exist');
        }
      });
    });

    it('should have role="dialog" and proper ARIA attributes', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
      });

      cy.wait(200);

      cy.get('.usa-modal')
        .should('have.attr', 'role', 'dialog')
        .and('have.attr', 'aria-modal', 'true');
    });
  });

  describe('Responsive/Reflow Accessibility (WCAG 1.4)', () => {
    it('should resize text properly up to 200% (WCAG 1.4.4)', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
      });

      cy.wait(200);

      // Get original font size
      cy.get('.usa-modal__heading').then(($heading) => {
        const originalSize = parseFloat(window.getComputedStyle($heading[0]).fontSize);

        // Simulate 200% zoom by increasing font size
        cy.get('.usa-modal').invoke('css', 'font-size', `${originalSize * 2}px`);

        // Modal should still be usable
        cy.get('.usa-modal__heading').should('be.visible');
        cy.get('.usa-modal__close').should('be.visible');
      });
    });

    it('should reflow content at 320px width (WCAG 1.4.10)', () => {
      cy.viewport(320, 568); // Small mobile viewport

      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
      });

      cy.wait(200);

      // Modal should be visible and usable
      cy.get('.usa-modal').should('be.visible');
      cy.get('.usa-modal__heading').should('be.visible');
      cy.get('.usa-modal__close').should('be.visible');

      // No horizontal scrolling should be required
      cy.window().then((win) => {
        expect(win.document.documentElement.scrollWidth).to.be.lte(win.innerWidth);
      });
    });

    it('should be accessible on mobile devices (comprehensive)', () => {
      // Test various mobile viewports
      const viewports = [
        { width: 375, height: 667, name: 'iPhone' },
        { width: 414, height: 896, name: 'iPhone Plus' },
        { width: 360, height: 640, name: 'Android' }
      ];

      viewports.forEach((vp) => {
        cy.viewport(vp.width, vp.height);

        cy.get('usa-modal').then(($el) => {
          const element = $el[0] as any;
          element.open = true;
        });

        cy.wait(200);

        // Modal should be fully visible
        cy.get('.usa-modal').should('be.visible');

        // All interactive elements should be accessible
        cy.get('.usa-modal__close').should('be.visible').and('not.be.disabled');

        // Close for next iteration
        cy.get('usa-modal').then(($el) => {
          const element = $el[0] as any;
          element.open = false;
        });

        cy.wait(100);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
      });

      cy.wait(200);

      cy.get('body').type('{esc}');

      cy.get('.usa-modal').should('not.be.visible');
    });

    it('should not close on Escape when forceAction is true', () => {
      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
        element.forceAction = true;
      });

      cy.wait(200);

      cy.get('body').type('{esc}');

      // Modal should still be visible
      cy.get('.usa-modal').should('be.visible');
    });
  });

  describe('Accessibility Validation', () => {
    it('should pass axe accessibility checks', () => {
      // Inject axe here to avoid race conditions with other tests
      cy.injectAxe();

      cy.get('usa-modal').then(($el) => {
        const element = $el[0] as any;
        element.open = true;
      });

      cy.wait(500); // Wait longer for axe to be ready and modal to stabilize

      cy.checkA11y('.usa-modal', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
        }
      });
    });
  });
});
