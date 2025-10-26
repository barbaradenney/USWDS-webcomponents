/**
 * Modal Variants - E2E Test
 *
 * Tests modal size variants (normal vs large) that require USWDS DOM transformation.
 * These tests moved from Vitest because USWDS moves the modal to document.body,
 * making timing and DOM queries unreliable in jsdom.
 *
 * Source: packages/uswds-wc-feedback/src/components/modal/usa-modal.test.ts
 * Moved tests:
 * - Line 2213: should render both normal and large modals correctly
 * - Line 1987: should maintain state after multiple close button clicks
 *
 * Coverage:
 * ✅ Normal modal rendering (default size)
 * ✅ Large modal rendering (usa-modal--lg class)
 * ✅ Modal variant switching
 * ✅ Close button state persistence
 * ✅ Modal reopening after multiple interactions
 */

describe('Modal - Variants and Size', () => {
  describe('Modal Size Variants', () => {
    it('should render both normal and large modals correctly', () => {
      // Visit default modal story (normal size)
      cy.visit('/iframe.html?id=components-modal--default&viewMode=story');
      cy.wait(1000); // Wait for USWDS initialization

      // Open normal modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Verify normal modal (no --lg class)
      cy.get('.usa-modal-wrapper').should('be.visible');
      cy.get('.usa-modal')
        .should('be.visible')
        .and('not.have.class', 'usa-modal--lg');

      // Close modal
      cy.get('.usa-modal__close').click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Now visit large modal story
      cy.visit('/iframe.html?id=components-modal--large&viewMode=story');
      cy.wait(1000);

      // Open large modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Verify large modal (has --lg class)
      cy.get('.usa-modal-wrapper').should('be.visible');
      cy.get('.usa-modal')
        .should('be.visible')
        .and('have.class', 'usa-modal--lg');
    });

    it('should apply correct classes for large variant', () => {
      // Visit large modal story
      cy.visit('/iframe.html?id=components-modal--large&viewMode=story');
      cy.wait(1000);

      // Open modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Check base class exists
      cy.get('.usa-modal').should('have.class', 'usa-modal');

      // Check large modifier exists
      cy.get('.usa-modal').should('have.class', 'usa-modal--lg');

      // Verify it's actually wider (visual check)
      cy.get('.usa-modal').then(($modal) => {
        const width = $modal.width();
        // Large modals should be wider than 640px (USWDS default)
        expect(width).to.be.greaterThan(640);
      });
    });

    it('should maintain large variant class throughout interaction', () => {
      // Visit large modal story
      cy.visit('/iframe.html?id=components-modal--large&viewMode=story');
      cy.wait(1000);

      // Open modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Verify large class
      cy.get('.usa-modal').should('have.class', 'usa-modal--lg');

      // Close modal
      cy.get('.usa-modal__close').click();
      cy.wait(300);

      // Reopen modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Large class should still be present
      cy.get('.usa-modal').should('have.class', 'usa-modal--lg');
    });
  });

  describe('Modal State Persistence', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=components-modal--default&viewMode=story');
      cy.wait(1000);
    });

    it('should maintain state after multiple close button clicks', () => {
      // First open/close cycle
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      cy.get('.usa-modal__close').click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Second open/close cycle
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      cy.get('.usa-modal__close').click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Third open/close cycle
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      cy.get('.usa-modal__close').click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Final open - should still work correctly
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Verify modal content is still accessible
      cy.get('.usa-modal__heading').should('be.visible');
      cy.get('.usa-modal__close').should('be.visible');
    });

    it('should handle rapid open/close cycles via close button', () => {
      // Cycle 1
      cy.get('[data-open-modal]').first().click();
      cy.wait(200);
      cy.get('.usa-modal__close').click();
      cy.wait(200);

      // Cycle 2
      cy.get('[data-open-modal]').first().click();
      cy.wait(200);
      cy.get('.usa-modal__close').click();
      cy.wait(200);

      // Cycle 3
      cy.get('[data-open-modal]').first().click();
      cy.wait(200);
      cy.get('.usa-modal__close').click();
      cy.wait(200);

      // Final verification - should still work
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });

    it('should maintain DOM structure after multiple interactions', () => {
      // Open and close 3 times
      for (let i = 0; i < 3; i++) {
        cy.get('[data-open-modal]').first().click();
        cy.wait(200);
        cy.get('.usa-modal__close').click();
        cy.wait(200);
      }

      // Open one final time
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Verify DOM structure is intact
      cy.get('.usa-modal-wrapper').should('exist');
      cy.get('.usa-modal').should('exist');
      cy.get('.usa-modal__content').should('exist');
      cy.get('.usa-modal__heading').should('exist');
      cy.get('.usa-modal__close').should('exist');
      cy.get('.usa-modal__footer').should('exist');
    });
  });
});
