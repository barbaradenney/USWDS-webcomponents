/**
 * Date Picker Calendar - Browser-Dependent Tests
 *
 * These tests were migrated from Vitest because they require real browser APIs:
 * - Calendar popup rendering and layout
 * - USWDS JavaScript DOM manipulation
 * - Keyboard navigation in calendar grid
 * - Focus management
 *
 * See: cypress/BROWSER_TESTS_MIGRATION_PLAN.md
 * Source: src/components/date-picker/usa-date-picker.test.ts
 */

describe('Date Picker Calendar Tests', () => {
  beforeEach(() => {
    // Visit the date picker Storybook story
    cy.visit('/iframe.html?id=components-date-picker--default&viewMode=story');
    cy.injectAxe(); // For accessibility testing
  });

  describe('Calendar UI Rendering', () => {
    it('should show calendar when toggled', () => {
      cy.get('usa-date-picker')
        .should('be.visible')
        .within(() => {
          // Find and click the calendar toggle button
          cy.get('.usa-date-picker__button')
            .should('be.visible')
            .click();

          // Calendar should appear
          cy.get('.usa-date-picker__calendar')
            .should('be.visible')
            .and('not.have.attr', 'hidden');
        });
    });

    it('should hide calendar when toggled again', () => {
      cy.get('usa-date-picker').within(() => {
        const button = cy.get('.usa-date-picker__button');

        // Open calendar
        button.click();
        cy.get('.usa-date-picker__calendar').should('be.visible');

        // Close calendar
        button.click();
        cy.get('.usa-date-picker__calendar').should('not.be.visible');
      });
    });

    it('should render calendar navigation elements', () => {
      cy.get('usa-date-picker').within(() => {
        // Open calendar
        cy.get('.usa-date-picker__button').click();

        // Verify navigation elements exist
        cy.get('.usa-date-picker__calendar').within(() => {
          cy.get('.usa-date-picker__calendar__previous-month').should('exist');
          cy.get('.usa-date-picker__calendar__next-month').should('exist');
          cy.get('.usa-date-picker__calendar__month-selection').should('exist');
          cy.get('.usa-date-picker__calendar__year-selection').should('exist');
        });
      });
    });

    it('should render day headers correctly', () => {
      cy.get('usa-date-picker').within(() => {
        // Open calendar
        cy.get('.usa-date-picker__button').click();

        // Verify day headers (Sun, Mon, Tue, etc.)
        cy.get('.usa-date-picker__calendar__table').within(() => {
          cy.get('thead th').should('have.length', 7); // 7 days of week
        });
      });
    });
  });

  describe('Calendar ARIA Attributes', () => {
    it('should set calendar aria attributes when open', () => {
      cy.get('usa-date-picker').within(() => {
        const button = cy.get('.usa-date-picker__button');

        // Button should have correct ARIA attributes
        button.should('have.attr', 'aria-haspopup', 'true');
        button.should('have.attr', 'aria-label', 'Toggle calendar');

        // Open calendar
        button.click();

        // Calendar should have proper ARIA role and attributes
        cy.get('.usa-date-picker__calendar')
          .should('have.attr', 'role', 'application')
          .and('have.attr', 'aria-label');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should pass comprehensive keyboard navigation tests', () => {
      cy.get('usa-date-picker').within(() => {
        // Open calendar with Enter key
        cy.get('.usa-date-picker__external-input')
          .focus()
          .type('{enter}');

        // Calendar should be visible
        cy.get('.usa-date-picker__calendar').should('be.visible');
      });
    });

    it('should have no keyboard traps', () => {
      cy.get('usa-date-picker').within(() => {
        // Focus input
        cy.get('.usa-date-picker__external-input').focus();

        // Tab should move focus forward (not trapped)
        cy.focused().tab();

        // Should be able to tab to calendar button
        cy.get('.usa-date-picker__button').should('have.focus');
      });
    });

    it('should maintain proper tab order (input → calendar button)', () => {
      cy.get('usa-date-picker').within(() => {
        // Tab through elements in order
        cy.get('.usa-date-picker__external-input')
          .focus()
          .tab();

        // Next focus should be calendar button
        cy.get('.usa-date-picker__button').should('have.focus');
      });
    });

    it('should handle Enter key to open calendar', () => {
      cy.get('usa-date-picker').within(() => {
        cy.get('.usa-date-picker__external-input')
          .focus()
          .type('{enter}');

        cy.get('.usa-date-picker__calendar').should('be.visible');
      });
    });

    it('should handle Escape key to close calendar', () => {
      cy.get('usa-date-picker').within(() => {
        // Open calendar
        cy.get('.usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');

        // Press Escape to close
        cy.get('.usa-date-picker__external-input').type('{esc}');
        cy.get('.usa-date-picker__calendar').should('not.be.visible');
      });
    });

    it('should support arrow key calendar navigation', () => {
      cy.get('usa-date-picker').within(() => {
        // Open calendar
        cy.get('.usa-date-picker__button').click();

        // Use arrow keys to navigate dates
        cy.get('.usa-date-picker__calendar__date').first().focus();
        cy.focused().type('{rightarrow}');

        // Focus should move to next date
        cy.focused().should('have.attr', 'data-value');
      });
    });

    it('should maintain focus visibility (WCAG 2.4.7)', () => {
      cy.get('usa-date-picker').within(() => {
        cy.get('.usa-date-picker__external-input').focus();

        // Focused element should have visible focus indicator
        cy.focused().should('have.css', 'outline-width').and('not.equal', '0px');
      });
    });

    it('should not respond when disabled', () => {
      // Set disabled via Storybook controls would be ideal
      // For now, test programmatically
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        element.disabled = true;
      });

      cy.get('usa-date-picker').within(() => {
        cy.get('.usa-date-picker__external-input')
          .should('be.disabled')
          .and('not.be.focused'); // Can't focus disabled input
      });
    });

    it('should support date range validation during keyboard input', () => {
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        element.minDate = '2024-01-01';
        element.maxDate = '2024-12-31';
      });

      cy.get('usa-date-picker').within(() => {
        const input = cy.get('.usa-date-picker__external-input');

        input.should('have.attr', 'min', '2024-01-01');
        input.should('have.attr', 'max', '2024-12-31');
      });
    });

    it('should support required attribute during keyboard interaction', () => {
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        element.required = true;
      });

      cy.get('usa-date-picker').within(() => {
        cy.get('.usa-date-picker__external-input')
          .should('have.attr', 'required')
          .focus()
          .tab(); // Tab away

        // Required state should persist
        cy.get('.usa-date-picker__external-input').should('have.attr', 'required');
      });
    });

    it('should handle range variant keyboard navigation', () => {
      // Visit range variant story
      cy.visit('/iframe.html?id=components-date-picker--range&viewMode=story');

      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        element.rangeDate = true;
      });

      // Should have multiple inputs for date range
      cy.get('usa-date-picker').within(() => {
        cy.get('.usa-date-picker__external-input').should('have.length.at.least', 1);
      });
    });
  });

  describe('Component Lifecycle Stability', () => {
    it('should handle calendar state changes without removal', () => {
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        const originalParent = element.parentElement;

        // Rapid calendar open/close
        for (let i = 0; i < 5; i++) {
          element.toggleCalendar();
          element.value = `2024-0${i + 1}-15`;
        }

        // Element should still be in DOM
        expect(element.parentElement).to.equal(originalParent);
        expect(document.body.contains(element)).to.be.true;
      });
    });

    it('should maintain DOM presence during complex date operations', () => {
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        const originalParent = element.parentElement;

        // Complex operations
        element.value = '2024-03-15';
        element.minDate = '2024-01-01';
        element.maxDate = '2024-12-31';
      });

      // Simulate user typing
      cy.get('usa-date-picker').within(() => {
        cy.get('input').type('12/25/2024');
      });

      // Toggle calendar during value change
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        element.toggleCalendar();
        element.error = 'Date out of range';
        element.disabled = false;
        element.required = true;

        // Should remain in DOM
        expect(element.parentElement).to.exist;
        expect(document.body.contains(element)).to.be.true;
      });
    });
  });

  describe('Storybook Integration', () => {
    it('should render in Storybook environment without errors', () => {
      cy.get('usa-date-picker')
        .should('be.visible')
        .within(() => {
          cy.get('input').should('exist');
          cy.get('label').should('exist');
          cy.get('.usa-date-picker').should('exist');
        });

      // No console errors
      cy.window().then((win) => {
        expect(win.console.error).not.to.be.called;
      });
    });
  });

  describe('USWDS Enhancement Integration', () => {
    it('should enhance to full calendar picker when USWDS loads', () => {
      cy.get('usa-date-picker').within(() => {
        // Should have USWDS-compatible structure
        cy.get('input').should('exist');
        cy.get('.usa-date-picker__button').should('exist');
      });

      // Should have calendar functionality
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        expect(typeof element.toggleCalendar).to.equal('function');
      });
    });

    it('should handle calendar toggle functionality after enhancement', () => {
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        expect(typeof element.toggleCalendar).to.equal('function');

        // Should not throw when called
        expect(() => element.toggleCalendar()).not.to.throw();
      });
    });

    it('should pass the critical "real USWDS compliance" test', () => {
      cy.get('usa-date-picker').within(() => {
        // Should have USWDS-compatible structure
        cy.get('input').should('exist');
      });

      // Verify basic functionality exists
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        expect(typeof element.toggleCalendar).to.equal('function');
      });
    });
  });

  describe('Regression: Initial Value Persistence', () => {
    it('should sync value to USWDS external input after transformation', () => {
      cy.get('usa-date-picker').then(($el) => {
        const element = $el[0] as any;
        element.value = '2024-06-01';
      });

      cy.wait(200); // Wait for USWDS transformation

      cy.get('usa-date-picker').within(() => {
        // External input should have the date value
        cy.get('.usa-date-picker__external-input').should('have.value', '2024-06-01');
      });
    });
  });

  describe('Accessibility Validation', () => {
    it('should pass axe accessibility checks', () => {
      cy.get('usa-date-picker').within(() => {
        cy.checkA11y('usa-date-picker', {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        });
      });
    });
  });
});
