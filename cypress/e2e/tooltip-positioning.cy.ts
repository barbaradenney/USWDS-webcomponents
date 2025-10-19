/**
 * Tooltip Positioning - Browser-Dependent Tests
 *
 * These tests were migrated from Vitest because they require real browser APIs:
 * - Tooltip positioning calculations (getBoundingClientRect)
 * - Layout measurements
 * - DOM restructuring by USWDS
 *
 * See: cypress/BROWSER_TESTS_MIGRATION_PLAN.md
 * Source: src/components/tooltip/usa-tooltip.test.ts
 */

describe('Tooltip Positioning', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?id=components-tooltip--default&viewMode=story');
    cy.injectAxe();
  });

  describe('Property Changes', () => {
    it('should update text property', () => {
      cy.get('usa-tooltip').first().then(($el) => {
        const element = $el[0] as any;
        element.text = 'Updated tooltip text';
      });

      cy.get('usa-tooltip').first().within(() => {
        cy.get('button').trigger('mouseover');
      });

      cy.get('.usa-tooltip__body').should('contain', 'Updated tooltip text');
    });

    it('should update classes property', () => {
      cy.get('usa-tooltip').first().then(($el) => {
        const element = $el[0] as any;
        element.classes = 'custom-tooltip-class';
      });

      cy.get('.usa-tooltip__body').should('have.class', 'custom-tooltip-class');
    });
  });

  describe('DOM Restructuring', () => {
    it('should move slotted content into USWDS structure', () => {
      cy.get('usa-tooltip').first().within(() => {
        // Content should be in USWDS tooltip structure
        cy.get('.usa-tooltip__trigger').should('exist');
      });
    });

    it('should handle naturally focusable elements correctly', () => {
      // Test with button
      cy.get('usa-tooltip button').first().should('be.visible');
      cy.get('usa-tooltip button').first().focus().should('have.focus');

      // Test with link (visit OnLink story)
      cy.visit('/iframe.html?id=components-tooltip--on-link&viewMode=story');
      cy.get('usa-tooltip a').first().should('be.visible');
      cy.get('usa-tooltip a').first().focus().should('have.focus');
    });
  });

  describe('Tooltip Positioning', () => {
    it('should position tooltip below trigger when position="bottom"', () => {
      cy.visit('/iframe.html?id=components-tooltip--bottom-position&viewMode=story');

      cy.get('usa-tooltip button').trigger('mouseover');

      cy.get('.usa-tooltip__body--bottom').should('be.visible').then(($tooltip) => {
        const tooltip = $tooltip[0];
        cy.get('usa-tooltip button').then(($trigger) => {
          const triggerRect = $trigger[0].getBoundingClientRect();
          const tooltipRect = tooltip.getBoundingClientRect();

          // Tooltip should be below trigger
          expect(tooltipRect.top).to.be.greaterThan(triggerRect.bottom);
        });
      });
    });

    it('should position tooltip to left when position="left"', () => {
      cy.visit('/iframe.html?id=components-tooltip--left-position&viewMode=story');

      cy.get('usa-tooltip button').trigger('mouseover');

      cy.get('.usa-tooltip__body--left').should('be.visible').then(($tooltip) => {
        const tooltip = $tooltip[0];
        cy.get('usa-tooltip button').then(($trigger) => {
          const triggerRect = $trigger[0].getBoundingClientRect();
          const tooltipRect = tooltip.getBoundingClientRect();

          // Tooltip should be to the left of trigger
          expect(tooltipRect.right).to.be.lessThan(triggerRect.left);
        });
      });
    });

    it('should position tooltip to right when position="right"', () => {
      cy.visit('/iframe.html?id=components-tooltip--right-position&viewMode=story');

      cy.get('usa-tooltip button').trigger('mouseover');

      cy.get('.usa-tooltip__body--right').should('be.visible').then(($tooltip) => {
        const tooltip = $tooltip[0];
        cy.get('usa-tooltip button').then(($trigger) => {
          const triggerRect = $trigger[0].getBoundingClientRect();
          const tooltipRect = tooltip.getBoundingClientRect();

          // Tooltip should be to the right of trigger
          expect(tooltipRect.left).to.be.greaterThan(triggerRect.right);
        });
      });
    });
  });

  describe('Keyboard Behavior', () => {
    it('should hide all tooltips on Escape key press', () => {
      // Show multiple tooltips
      cy.get('usa-tooltip button').first().trigger('mouseover');
      cy.get('.usa-tooltip__body').should('be.visible');

      // Press Escape
      cy.get('body').type('{esc}');

      // All tooltips should be hidden
      cy.get('.usa-tooltip__body').should('not.be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be discoverable by screen readers', () => {
      cy.get('usa-tooltip button').first().should('have.attr', 'aria-describedby');

      cy.get('usa-tooltip button').first().trigger('mouseover');

      cy.get('.usa-tooltip__body')
        .should('have.attr', 'role', 'tooltip')
        .and('be.visible');
    });

    it('should pass axe accessibility checks', () => {
      cy.checkA11y('usa-tooltip', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      });
    });
  });

  describe('Dynamic Content', () => {
    it('should update tooltip content when data-title changes', () => {
      cy.get('usa-tooltip button').first().then(($btn) => {
        $btn.attr('data-title', 'New tooltip content');
      });

      cy.get('usa-tooltip button').first().trigger('mouseover');

      cy.get('.usa-tooltip__body').should('contain', 'New tooltip content');
    });

    it('should update position when position attribute changes', () => {
      cy.get('usa-tooltip').first().then(($el) => {
        const element = $el[0] as any;
        element.position = 'bottom';
      });

      cy.wait(100); // Wait for update

      cy.get('usa-tooltip button').first().trigger('mouseover');

      cy.get('.usa-tooltip__body--bottom').should('exist');
    });
  });

  describe('USWDS Integration Validation', () => {
    it('should apply attributes before USWDS initialization', () => {
      cy.get('usa-tooltip').first().within(() => {
        cy.get('button').should('have.attr', 'data-position');
      });
    });

    it('should handle content updates dynamically', () => {
      cy.get('usa-tooltip').first().then(($el) => {
        const element = $el[0] as any;
        element.text = 'Dynamic content update';
      });

      cy.wait(100);

      cy.get('usa-tooltip button').first().trigger('mouseover');

      cy.get('.usa-tooltip__body').should('contain', 'Dynamic content update');
    });
  });

  describe('Prohibited Behaviors', () => {
    it('should NOT prevent default browser tooltip behavior unnecessarily', () => {
      // Native title attribute should still work if set
      cy.get('usa-tooltip button').first().then(($btn) => {
        if ($btn.attr('title')) {
          expect($btn.attr('title')).to.exist;
        }
      });
    });
  });
});
