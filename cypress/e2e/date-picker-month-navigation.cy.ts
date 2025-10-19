/**
 * Date Picker Month Navigation - E2E Test
 *
 * Tests USWDS event delegation functionality that doesn't work in Cypress component tests.
 * These tests run against the full Storybook environment where USWDS JavaScript
 * event delegation via behavior().on() works correctly.
 *
 * Source: src/components/date-picker/usa-date-picker-timing-regression.component.cy.ts
 * Skipped tests:
 * - Line 155: should navigate months immediately (USWDS event delegation)
 * - Line 322: should handle min date constraint (USWDS event delegation)
 *
 * Coverage:
 * ✅ Month navigation (previous/next month buttons)
 * ✅ Min date constraints (disabled dates before minimum)
 * ✅ Max date constraints (disabled dates after maximum)
 * ✅ Calendar rendering with constraints
 * ✅ Date selection within valid range
 */

describe('Date Picker - Month Navigation and Constraints', () => {
  beforeEach(() => {
    // Visit the date picker Storybook story
    cy.visit('/iframe.html?id=components-date-picker--default&viewMode=story');
    cy.wait(1000); // Wait for USWDS initialization
  });

  describe('Month Navigation', () => {
    it('should navigate to next month on first click', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .find('.usa-date-picker__button')
        .click();

      cy.wait(200);

      // Calendar should be visible
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Get current month
      cy.get('.usa-date-picker__calendar__month-label')
        .invoke('text')
        .then((initialMonth) => {
          // Click next month button
          cy.get('.usa-date-picker__calendar__next-month').click();

          cy.wait(300);

          // Month should have changed
          cy.get('.usa-date-picker__calendar__month-label')
            .invoke('text')
            .should('not.equal', initialMonth);
        });
    });

    it('should navigate to previous month on first click', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .find('.usa-date-picker__button')
        .click();

      cy.wait(200);

      // Get current month
      cy.get('.usa-date-picker__calendar__month-label')
        .invoke('text')
        .then((initialMonth) => {
          // Click previous month button
          cy.get('.usa-date-picker__calendar__previous-month').click();

          cy.wait(300);

          // Month should have changed
          cy.get('.usa-date-picker__calendar__month-label')
            .invoke('text')
            .should('not.equal', initialMonth);
        });
    });

    it('should navigate multiple months in sequence', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .find('.usa-date-picker__button')
        .click();

      cy.wait(400); // Increased wait for calendar to fully open

      // Navigate forward 3 months - verify calendar visible before each click
      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(400);

      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(400);

      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(400);

      // Navigate backward 2 months
      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__previous-month').click();
      cy.wait(400);

      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__previous-month').click();
      cy.wait(400);

      // Calendar should still be functional
      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__month-label').should('be.visible');
    });

    it('should navigate to year selection', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .find('.usa-date-picker__button')
        .click();

      cy.wait(400); // Increased wait for calendar stability

      // Verify calendar is visible before interaction
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Click year-selection button to open year picker
      cy.get('.usa-date-picker__calendar__year-selection').click();

      cy.wait(400); // Increased wait for year picker to appear

      // Year picker table should be visible
      cy.get('.usa-date-picker__calendar__year-picker').should('be.visible');

      // Should have year options
      cy.get('.usa-date-picker__calendar__year').should('have.length.greaterThan', 0);
    });

    it('should return to date view from year selection', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .find('.usa-date-picker__button')
        .click();

      cy.wait(400);

      // Verify calendar visible before opening year selection
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Open year selection
      cy.get('.usa-date-picker__calendar__year-selection').click();
      cy.wait(400);

      // Verify year picker is visible
      cy.get('.usa-date-picker__calendar__year-picker').should('be.visible');

      // Select a year
      cy.get('.usa-date-picker__calendar__year').first().click();
      cy.wait(400); // Increased wait for transition back to date view

      // Should return to date view
      cy.get('.usa-date-picker__calendar__date-picker').should('be.visible');
      cy.get('.usa-date-picker__calendar__year-picker').should('not.exist');
    });
  });

  describe('Min Date Constraints', () => {
    beforeEach(() => {
      // Visit story with min date constraint
      cy.visit('/iframe.html?id=components-date-picker--with-date-range&viewMode=story');
      cy.wait(1000);
    });

    it('should disable dates before min date', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(300);

      // Calendar should be visible
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Should have disabled dates
      cy.get('.usa-date-picker__calendar__date[disabled]').should('exist');
    });

    it('should prevent selection of dates before min date', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(300);

      // Try to click a disabled date (if any exist)
      cy.get('.usa-date-picker__calendar__date[disabled]').then(($disabled) => {
        if ($disabled.length > 0) {
          // Click disabled date
          cy.wrap($disabled).first().click({ force: true });
          cy.wait(100);

          // Input should remain empty or unchanged
          cy.get('usa-date-picker')
            .first()
            .find('.usa-date-picker__external-input')
            .should('have.value', '');
        }
      });
    });

    it('should allow selection of dates after min date', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(300);

      // Click an enabled date
      cy.get('.usa-date-picker__calendar__date')
        .not('[disabled]')
        .first()
        .click();

      cy.wait(200);

      // Calendar should close
      cy.get('.usa-date-picker__calendar').should('not.be.visible');

      // Input should have value
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__external-input')
        .invoke('val')
        .should('not.be.empty');
    });

    it('should navigate to months with valid dates only', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(400);

      // Verify calendar is visible
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Navigate backward to ensure we're not at max date boundary
      cy.get('.usa-date-picker__calendar__previous-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(400);
          // Verify calendar still visible after navigation
          cy.get('.usa-date-picker__calendar').should('be.visible');
        }
      });

      // Navigate forward a month
      cy.get('.usa-date-picker__calendar__next-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(400);
          // Verify calendar still visible after navigation
          cy.get('.usa-date-picker__calendar').should('be.visible');
        }
      });

      // Should still have valid dates available
      cy.get('.usa-date-picker__calendar__date')
        .not('[disabled]')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Max Date Constraints', () => {
    beforeEach(() => {
      // Visit story with max date constraint
      cy.visit('/iframe.html?id=components-date-picker--with-date-range&viewMode=story');
      cy.wait(1000);
    });

    it('should disable dates after max date', () => {
      // Open calendar (has both min and max date)
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(400);

      // Verify calendar is visible
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Navigate backward first to ensure we can navigate forward
      cy.get('.usa-date-picker__calendar__previous-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(400);
          cy.get('.usa-date-picker__calendar').should('be.visible');

          cy.get('.usa-date-picker__calendar__previous-month').then(($btn2) => {
            if (!$btn2.is(':disabled')) {
              cy.wrap($btn2).click();
              cy.wait(400);
              cy.get('.usa-date-picker__calendar').should('be.visible');
            }
          });
        }
      });

      // Navigate forward to approach max date boundary
      cy.get('.usa-date-picker__calendar__next-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(400);
          cy.get('.usa-date-picker__calendar').should('be.visible');
        }
      });

      cy.get('.usa-date-picker__calendar__next-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(400);
          cy.get('.usa-date-picker__calendar').should('be.visible');
        }
      });

      // Should have some disabled dates (dates after max)
      cy.get('.usa-date-picker__calendar__date[disabled]').should('exist');
    });

    it('should prevent selection of dates after max date', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(400);

      // Verify calendar is visible
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Navigate backward first to give us room to navigate forward
      cy.get('.usa-date-picker__calendar__previous-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(400);
          cy.get('.usa-date-picker__calendar').should('be.visible');
        }
      });

      // Navigate forward to a month with disabled dates (approaching max date)
      cy.get('.usa-date-picker__calendar__next-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(400);
          cy.get('.usa-date-picker__calendar').should('be.visible');
        }
      });

      // Try to click a disabled date if any exist
      cy.get('.usa-date-picker__calendar__date[disabled]').then(($disabled) => {
        if ($disabled.length > 0) {
          cy.wrap($disabled).first().click({ force: true });
          cy.wait(100);

          // Input should remain empty
          cy.get('usa-date-picker')
            .first()
            .find('.usa-date-picker__external-input')
            .should('have.value', '');
        }
      });
    });

    it('should allow selection of dates before max date', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(300);

      // Click an enabled date (should be available in current month)
      cy.get('.usa-date-picker__calendar__date')
        .not('[disabled]')
        .first()
        .click();

      cy.wait(200);

      // Calendar should close
      cy.get('.usa-date-picker__calendar').should('not.be.visible');

      // Input should have value
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__external-input')
        .invoke('val')
        .should('not.be.empty');
    });
  });

  describe('Combined Min/Max Constraints', () => {
    beforeEach(() => {
      // Visit story with both min and max dates
      cy.visit('/iframe.html?id=components-date-picker--with-date-range&viewMode=story');
      cy.wait(1000);
    });

    it('should enforce range with both min and max dates', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(300);

      // Should have calendar with date constraints
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Should have both enabled and disabled dates
      cy.get('.usa-date-picker__calendar__date').should('have.length.greaterThan', 0);
      cy.get('.usa-date-picker__calendar__date[disabled]').should('exist');
      cy.get('.usa-date-picker__calendar__date')
        .not('[disabled]')
        .should('have.length.greaterThan', 0);
    });

    it('should only allow selection within valid range', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(300);

      // Select a valid date
      cy.get('.usa-date-picker__calendar__date')
        .not('[disabled]')
        .eq(5) // Pick a date in the middle
        .click();

      cy.wait(200);

      // Should close and have value
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__external-input')
        .invoke('val')
        .should('not.be.empty');
    });

    it('should maintain constraints while navigating months', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .first()
        .find('.usa-date-picker__button')
        .click();

      cy.wait(300);

      // Navigate forward and backward - check if buttons are enabled first
      cy.get('.usa-date-picker__calendar__next-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(300);
        }
      });

      cy.get('.usa-date-picker__calendar__previous-month').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click();
          cy.wait(300);
        }
      });

      // Constraints should still be enforced
      cy.get('.usa-date-picker__calendar__date').should('exist');
      cy.get('.usa-date-picker__calendar__date')
        .not('[disabled]')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Calendar Interaction Stability', () => {
    it('should handle rapid month navigation', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .find('.usa-date-picker__button')
        .click();

      cy.wait(400);

      // Verify calendar visible before rapid navigation
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Rapid navigation - verify visible before each click for stability
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(300); // Increased from 150ms for stability

      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(300);

      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(300);

      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(300);

      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(300);

      // Calendar should still be functional
      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__month-label').should('be.visible');

      // Should be able to select a date
      cy.get('.usa-date-picker__calendar__date')
        .not('[disabled]')
        .first()
        .click();

      cy.wait(200);
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
    });

    it('should maintain state after year selection and month navigation', () => {
      // Open calendar
      cy.get('usa-date-picker')
        .find('.usa-date-picker__button')
        .click();

      cy.wait(400);

      // Verify calendar visible
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Open year picker
      cy.get('.usa-date-picker__calendar__year-selection').click();
      cy.wait(400);

      // Verify year picker visible
      cy.get('.usa-date-picker__calendar__year-picker').should('be.visible');

      // Select a year
      cy.get('.usa-date-picker__calendar__year').eq(2).click();
      cy.wait(500); // Increased wait for transition back to date view

      // Verify back to date view
      cy.get('.usa-date-picker__calendar__date-picker').should('be.visible');
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Navigate months - verify visible before click
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.wait(400);

      // Verify calendar still visible after navigation
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Select a date
      cy.get('.usa-date-picker__calendar__date')
        .not('[disabled]')
        .first()
        .click();

      cy.wait(200);

      // Should have value
      cy.get('usa-date-picker')
        .find('.usa-date-picker__external-input')
        .invoke('val')
        .should('not.be.empty');
    });
  });
});
