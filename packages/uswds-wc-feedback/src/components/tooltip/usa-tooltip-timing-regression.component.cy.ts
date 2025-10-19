/**
 * @fileoverview Tooltip Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the tooltip component:
 * 1. Hover/focus timing (critical for tooltips)
 * 2. Show/hide timing
 * 3. USWDS initialization timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Tooltip Timing and Initialization Regression Tests', () => {
  describe('Hover/Focus Timing (Critical for Tooltips)', () => {
    it('should show tooltip on FIRST hover', () => {
      cy.mount(`
        <usa-tooltip
          id="hover-test"
          label="Hover me"
          title="Tooltip content"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Hover over trigger - tooltip should show on FIRST hover
      cy.get('.usa-tooltip__trigger').trigger('mouseover');
      cy.wait(100);

      // Tooltip body should be visible
      cy.get('.usa-tooltip__body').should('have.class', 'is-set');
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
    });

    it('should show tooltip on FIRST focus', () => {
      cy.mount(`
        <usa-tooltip
          id="focus-test"
          label="Focus me"
          title="Tooltip on focus"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Focus trigger - tooltip should show on FIRST focus
      cy.get('.usa-tooltip__trigger').focus();
      cy.wait(100);

      // Tooltip body should be visible
      cy.get('.usa-tooltip__body').should('have.class', 'is-set');
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-tooltip
          id="immediate-test"
          label="Immediate test"
          title="Quick tooltip"
        ></usa-tooltip>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(300);

      // Tooltip structure should exist
      cy.get('.usa-tooltip').should('exist');
      cy.get('.usa-tooltip__trigger').should('exist');
      cy.get('.usa-tooltip__body').should('exist');
    });
  });

  describe('Tooltip Show/Hide Timing', () => {
    it('should hide tooltip on mouseleave', () => {
      cy.mount(`
        <usa-tooltip
          id="hide-test"
          label="Hover to show"
          title="Will hide on mouseleave"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Show tooltip
      cy.get('.usa-tooltip__trigger').trigger('mouseover');
      cy.wait(100);
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');

      // USWDS listens on wrapper's mouseleave, not trigger's mouseout
      cy.get('.usa-tooltip').trigger('mouseleave');
      cy.wait(100);

      // Tooltip should be hidden
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');
    });

    it('should hide tooltip on blur', () => {
      cy.mount(`
        <usa-tooltip
          id="blur-test"
          label="Focus to show"
          title="Will hide on blur"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Show tooltip via focus
      cy.get('.usa-tooltip__trigger').focus();
      cy.wait(100);
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');

      // Hide tooltip on blur
      cy.get('.usa-tooltip__trigger').blur();
      cy.wait(100);

      // Tooltip should be hidden
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');
    });

    it('should toggle tooltip on repeated hover', () => {
      cy.mount(`
        <usa-tooltip
          id="toggle-test"
          label="Toggle me"
          title="Toggle tooltip"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // First hover - show
      cy.get('.usa-tooltip__trigger').trigger('mouseover');
      cy.wait(100);
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');

      // Mouseleave on wrapper - hide
      cy.get('.usa-tooltip').trigger('mouseleave');
      cy.wait(100);
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');

      // Second hover - show again (no double-hover bug)
      cy.get('.usa-tooltip__trigger').trigger('mouseover');
      cy.wait(100);
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
    });
  });

  describe('Tooltip Positioning', () => {
    it('should have data-position attribute set to top by default', () => {
      cy.mount(`
        <usa-tooltip
          id="position-test"
          label="Positioned tooltip"
          title="Top positioned"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Trigger should have data-position="top"
      cy.get('.usa-tooltip__trigger').should('have.attr', 'data-position', 'top');

      // Note: USWDS dynamically positions based on viewport space
      // Actual position class may differ from data-position in test environment
    });

    it('should respect position attribute on trigger', () => {
      cy.mount(`
        <usa-tooltip
          id="bottom-test"
          label="Bottom tooltip"
          title="Bottom positioned"
          position="bottom"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Trigger should have data-position="bottom"
      cy.get('.usa-tooltip__trigger').should('have.attr', 'data-position', 'bottom');

      // Note: USWDS dynamically adjusts position based on available viewport space
      // Test environment may position differently than production
    });
  });

  describe('USWDS Initialization Timing', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-tooltip
          id="init-test"
          label="Init test"
          title="Initialization test"
        ></usa-tooltip>
      `);

      // Wait for initialization
      cy.wait(500);

      // USWDS-created elements should exist and be functional
      cy.get('.usa-tooltip').should('exist');
      cy.get('.usa-tooltip__trigger').should('exist');
      cy.get('.usa-tooltip__body').should('exist');

      // Trigger should have proper attributes
      cy.get('.usa-tooltip__trigger').should('have.attr', 'data-position');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-tooltip
          id="handler-test"
          label="Handler test"
          title="Event handler test"
        ></usa-tooltip>
      `);

      const tooltip = cy.get('#handler-test');

      cy.wait(500);

      // Verify trigger exists before property changes
      cy.get('.usa-tooltip__trigger').should('exist');

      // Rapidly change properties (could trigger initialization multiple times)
      // Note: Changing 'text' or 'label' property, not 'title' which could cause re-render
      tooltip.then(($tooltip) => {
        const tooltipEl = $tooltip[0] as any;
        tooltipEl.text = 'Changed 1';
        tooltipEl.text = 'Changed 2';
        tooltipEl.text = 'Changed 3';
      });

      cy.wait(200);

      // Component should still work correctly (no duplicate handlers)
      cy.get('.usa-tooltip__trigger').trigger('mouseover');
      cy.wait(100);
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
    });
  });

  describe('Multiple Tooltips', () => {
    it('should handle multiple tooltips independently', () => {
      cy.mount(`
        <div>
          <usa-tooltip
            id="tooltip-1"
            label="First tooltip"
            title="First content"
          ></usa-tooltip>
          <usa-tooltip
            id="tooltip-2"
            label="Second tooltip"
            title="Second content"
          ></usa-tooltip>
        </div>
      `);

      cy.wait(500);

      // Show first tooltip
      cy.get('#tooltip-1 .usa-tooltip__trigger').trigger('mouseover');
      cy.wait(100);

      // First should be visible, second should be hidden
      cy.get('#tooltip-1 .usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
      cy.get('#tooltip-2 .usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');

      // Show second tooltip
      cy.get('#tooltip-2 .usa-tooltip__trigger').trigger('mouseover');
      cy.wait(100);

      // Second should be visible
      cy.get('#tooltip-2 .usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
    });
  });

  describe('Keyboard Interaction', () => {
    it('should hide tooltip on Escape key', () => {
      cy.mount(`
        <usa-tooltip
          id="escape-test"
          label="Escape test"
          title="Press Escape to hide"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Show tooltip
      cy.get('.usa-tooltip__trigger').focus();
      cy.wait(100);
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');

      // Press Escape
      cy.get('body').type('{esc}');
      cy.wait(100);

      // Tooltip should be hidden
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');
    });
  });

  describe('Accessibility Features', () => {
    it('should have correct ARIA attributes', () => {
      cy.mount(`
        <usa-tooltip
          id="aria-test"
          label="ARIA test"
          title="Accessibility test"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Trigger should have aria-describedby
      cy.get('.usa-tooltip__trigger').should('have.attr', 'aria-describedby');

      // Body should have role="tooltip"
      cy.get('.usa-tooltip__body').should('have.attr', 'role', 'tooltip');

      // Body should start as aria-hidden="true"
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');
    });

    it('should update ARIA attributes when shown', () => {
      cy.mount(`
        <usa-tooltip
          id="aria-update-test"
          label="ARIA update"
          title="ARIA state test"
        ></usa-tooltip>
      `);

      cy.wait(500);

      // Initial state
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');

      // Show tooltip
      cy.get('.usa-tooltip__trigger').trigger('mouseover');
      cy.wait(100);

      // Should update aria-hidden
      cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
    });
  });
});
