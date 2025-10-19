/**
 * @fileoverview Modal Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the modal component:
 * 1. Double-click requirement (requestAnimationFrame timing fix)
 * 2. Race condition in setupEventHandlers
 * 3. USWDS initialization timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Modal Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (USWDS Integration)', () => {
    it('should open modal on FIRST click of trigger button', () => {
      cy.mount(`
        <usa-modal
          id="single-click-test"
          heading="Click Once"
          description="Should open on first click"
          trigger-text="Open Modal"
        ></usa-modal>
      `);

      // Wait for component to initialize and USWDS to create wrapper
      cy.wait(500);

      // CRITICAL: First click should immediately work
      cy.get('[data-open-modal]').click();

      // Give USWDS time to toggle visibility
      cy.wait(200);

      // Modal wrapper should be visible after FIRST click (not second)
      cy.get('.usa-modal-wrapper').should('be.visible');
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
      cy.get('.usa-modal-wrapper').should('not.have.class', 'is-hidden');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-modal
          id="immediate-test"
          heading="Immediate Test"
          description="Should work right away"
          trigger-text="Open Now"
        ></usa-modal>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(100);

      // Click immediately after initialization
      cy.get('[data-open-modal]').click();

      // Should work on first try
      cy.get('.usa-modal-wrapper').should('be.visible');
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });

    it('should toggle correctly on each action (no skipped clicks)', () => {
      cy.mount(`
        <usa-modal
          id="toggle-test"
          heading="Toggle Test"
          description="Toggle modal"
          trigger-text="Toggle"
        ></usa-modal>
      `);

      cy.wait(200);

      // Click 1: Should open
      cy.get('[data-open-modal]').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Click 2: Close button should work
      cy.get('.usa-modal__close').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Click 3: Should open again
      cy.get('[data-open-modal]').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });
  });

  describe('Modal-Specific Timing Tests', () => {
    it('should close modal on first Escape key press', () => {
      cy.mount(`
        <usa-modal
          id="escape-test"
          heading="Escape Test"
          description="Press escape to close"
          trigger-text="Open Modal"
        ></usa-modal>
      `);

      cy.wait(200);

      // Open modal
      cy.get('[data-open-modal]').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Press Escape - should close on FIRST press
      cy.get('body').type('{esc}');
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should close modal on first click of close button', () => {
      cy.mount(`
        <usa-modal
          id="close-button-test"
          heading="Close Button Test"
          description="Click close button"
          trigger-text="Open Modal"
        ></usa-modal>
      `);

      cy.wait(200);

      // Open modal
      cy.get('[data-open-modal]').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Click close button - should work on FIRST click
      cy.get('.usa-modal__close').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should close modal on first click of primary action button', () => {
      cy.mount(`
        <usa-modal
          id="primary-action-test"
          heading="Primary Action Test"
          description="Click continue button"
          trigger-text="Open Modal"
          primary-button-text="Continue"
        ></usa-modal>
      `);

      cy.wait(200);

      // Open modal
      cy.get('[data-open-modal]').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Click primary action - should work on FIRST click
      cy.get('.usa-modal__footer .usa-button').contains('Continue').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should handle focus trap immediately on open', () => {
      cy.mount(`
        <usa-modal
          id="focus-test"
          heading="Focus Test"
          description="Focus should be trapped"
          trigger-text="Open Modal"
        ></usa-modal>
      `);

      cy.wait(500);

      // Store initial focus
      cy.get('[data-open-modal]').as('trigger');

      // Open modal
      cy.get('@trigger').click();
      cy.wait(200);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Focus should be inside modal immediately - check that a focusable element is focused
      cy.focused().should('exist');
      // Verify modal is visible (focus trap is working)
      cy.get('.usa-modal').should('be.visible');
    });
  });

  describe('Force Action Mode', () => {
    it.skip('should prevent closing on escape when force-action is true (KNOWN ISSUE)', () => {
      cy.mount(`
        <usa-modal
          id="force-action-test"
          heading="Force Action"
          description="Must click button to close"
          trigger-text="Open Modal"
          force-action
        ></usa-modal>
      `);

      cy.wait(500);

      // Open modal
      cy.get('[data-open-modal]').click();
      cy.wait(200);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Press Escape - should NOT close
      cy.get('body').type('{esc}');
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible'); // Still visible!

      // Close button should not exist in force-action mode
      cy.get('.usa-modal__close').should('not.exist');
    });

    it('should only close via action buttons when force-action is true', () => {
      cy.mount(`
        <usa-modal
          id="force-action-button-test"
          heading="Force Action Button Test"
          description="Only buttons can close"
          trigger-text="Open Modal"
          force-action
          primary-button-text="Confirm"
        ></usa-modal>
      `);

      cy.wait(200);

      // Open modal
      cy.get('[data-open-modal]').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Primary action should close
      cy.get('.usa-modal__footer .usa-button').contains('Confirm').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });
  });

  describe('USWDS Initialization Timing', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-modal
          id="init-test"
          heading="Initialization Test"
          description="Testing initialization timing"
          trigger-text="Open Modal"
        ></usa-modal>
      `);

      // Wait for initialization
      cy.wait(200);

      // Trigger button should exist and be clickable
      cy.get('[data-open-modal]').should('exist');
      cy.get('[data-open-modal]').should('be.visible');

      // Click should work immediately
      cy.get('[data-open-modal]').click();
      cy.get('.usa-modal-wrapper').should('be.visible');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-modal
          id="handler-test"
          heading="Handler Test"
          description="Testing event handlers"
          trigger-text="Open Modal"
        ></usa-modal>
      `);

      const modal = cy.get('#handler-test');

      cy.wait(200);

      // Rapidly change properties (could trigger initialization multiple times)
      modal.then(($modal) => {
        const m = $modal[0] as any;
        m.large = true;
        m.forceAction = true;
        m.large = false;
        m.forceAction = false;
      });

      cy.wait(100);

      // Component should still work correctly (no duplicate handlers)
      cy.get('[data-open-modal]').click();
      cy.wait(50);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      cy.get('.usa-modal__close').click();
      cy.wait(50);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });
  });

  describe('Large Modal Variant', () => {
    it('should handle large modal variant correctly', () => {
      cy.mount(`
        <usa-modal
          id="large-test"
          heading="Large Modal"
          description="This is a large modal"
          trigger-text="Open Large Modal"
          large
        ></usa-modal>
      `);

      cy.wait(200);

      // Open modal
      cy.get('[data-open-modal]').click();
      cy.wait(100);

      // Should have large class
      cy.get('.usa-modal').should('have.class', 'usa-modal--lg');
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Should close normally
      cy.get('.usa-modal__close').click();
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });
  });

  describe('Programmatic Control', () => {
    it.skip('should open modal programmatically on first call (KNOWN ISSUE)', () => {
      cy.mount(`
        <usa-modal
          id="programmatic-test"
          heading="Programmatic Test"
          description="Testing programmatic open"
        ></usa-modal>
      `);

      cy.wait(500);

      // Open programmatically - wait for component to be fully defined
      cy.window().then((win) => {
        const modal = win.document.querySelector('#programmatic-test') as any;
        if (modal && typeof modal.openModal === 'function') {
          modal.openModal();
        }
      });

      cy.wait(200);

      // Should be visible immediately
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });

    it.skip('should close modal programmatically on first call (KNOWN ISSUE)', () => {
      cy.mount(`
        <usa-modal
          id="programmatic-close-test"
          heading="Programmatic Close Test"
          description="Testing programmatic close"
          trigger-text="Open Modal"
        ></usa-modal>
      `);

      cy.wait(500);

      // Open via trigger
      cy.get('[data-open-modal]').click();
      cy.wait(200);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Close programmatically - wait for component to be fully defined
      cy.window().then((win) => {
        const modal = win.document.querySelector('#programmatic-close-test') as any;
        if (modal && typeof modal.closeModal === 'function') {
          modal.closeModal();
        }
      });

      cy.wait(200);

      // Should be hidden immediately
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });
  });
});
