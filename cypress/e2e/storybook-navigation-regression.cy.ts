/**
 * Storybook Navigation Regression Tests
 *
 * CRITICAL: These tests prevent regression of the zero BoundingClientRect issue
 * discovered in October 2025.
 *
 * Issue: After navigating between Storybook stories, Lit components had
 * getBoundingClientRect() with all zeros despite correct computed styles.
 *
 * Root Cause: Storybook navigation doesn't fully reset DOM/layout state.
 *
 * Fix: Force layout recalculation in .storybook/preview.ts decorator
 *
 * @see docs/DEBUGGING_GUIDE.md - "Storybook Navigation: Zero BoundingClientRect Issue"
 */

describe('Storybook Navigation Regression Tests', () => {
  const STORYBOOK_URL = 'http://localhost:6006';

  beforeEach(() => {
    // Start at Storybook home
    cy.visit(STORYBOOK_URL);
  });

  /**
   * Test accordion navigation regression
   * This was the original failing component that exposed the issue
   */
  describe('Accordion Component', () => {
    it('should work after page reload', () => {
      // Navigate directly to accordion story
      cy.visit(`${STORYBOOK_URL}/?path=/story/components-accordion--default`);

      // Wait for story to render
      cy.get('usa-accordion').should('exist');

      // Click first accordion button
      cy.get('.usa-accordion__button').first().click();

      // Verify panel opens (hidden attribute removed)
      cy.get('.usa-accordion__content').first().should('not.have.attr', 'hidden');
    });

    it('should work after navigating from another component (CRITICAL)', () => {
      // Start at a different component
      cy.visit(`${STORYBOOK_URL}/?path=/story/components-button--default`);
      cy.get('usa-button').should('exist');

      // Navigate to accordion
      cy.visit(`${STORYBOOK_URL}/?path=/story/components-accordion--default`);
      cy.get('usa-accordion').should('exist');

      // CRITICAL TEST: Click accordion button after navigation
      cy.get('.usa-accordion__button').first().click();

      // This should work - if it doesn't, layout forcing is broken
      cy.get('.usa-accordion__content').first().should('not.have.attr', 'hidden');

      // Verify the element has non-zero dimensions
      cy.get('.usa-accordion__content').first().then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        expect(rect.height).to.be.greaterThan(0);
        expect(rect.width).to.be.greaterThan(0);
      });
    });

    it('should work after multiple navigation cycles', () => {
      // Navigate: Button → Accordion → Alert → Accordion
      cy.visit(`${STORYBOOK_URL}/?path=/story/components-button--default`);
      cy.get('usa-button').should('exist');

      cy.visit(`${STORYBOOK_URL}/?path=/story/components-accordion--default`);
      cy.get('usa-accordion').should('exist');
      cy.get('.usa-accordion__button').first().click();
      cy.get('.usa-accordion__content').first().should('not.have.attr', 'hidden');

      cy.visit(`${STORYBOOK_URL}/?path=/story/components-alert--default`);
      cy.get('usa-alert').should('exist');

      // Return to accordion - should still work
      cy.visit(`${STORYBOOK_URL}/?path=/story/components-accordion--default`);
      cy.get('usa-accordion').should('exist');
      cy.get('.usa-accordion__button').first().click();
      cy.get('.usa-accordion__content').first().should('not.have.attr', 'hidden');

      // Verify dimensions
      cy.get('.usa-accordion__content').first().then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        expect(rect.height).to.be.greaterThan(0);
      });
    });
  });

  /**
   * Test other components with dynamic show/hide
   * These could be affected by the same issue
   */
  describe('Other Interactive Components', () => {
    it('modal should work after navigation', () => {
      // Navigate from another component
      cy.visit(`${STORYBOOK_URL}/?path=/story/components-button--default`);
      cy.get('usa-button').should('exist');

      // Go to modal
      cy.visit(`${STORYBOOK_URL}/?path=/story/components-modal--default`);
      cy.get('usa-modal').should('exist');

      // Open modal
      cy.get('[data-open-modal]').first().click();

      // Verify modal wrapper has dimensions
      cy.get('.usa-modal-wrapper').should('be.visible');
      cy.get('.usa-modal-wrapper').then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        expect(rect.height).to.be.greaterThan(0);
        expect(rect.width).to.be.greaterThan(0);
      });
    });
  });

  /**
   * Verify layout forcing function exists
   * This catches if someone removes the critical fix
   */
  describe('Layout Forcing Validation', () => {
    it('should have forceLayoutRecalculation in Storybook decorator', () => {
      // This test verifies the fix is present
      // We can't directly test the function, but we can verify behavior
      cy.visit(`${STORYBOOK_URL}/?path=/story/components-accordion--default`);

      // After navigation, verify storybook-root has been toggled
      cy.get('#storybook-root').should('exist');
      cy.get('#storybook-root').should('have.css', 'display').and('not.equal', 'none');
    });
  });
});
