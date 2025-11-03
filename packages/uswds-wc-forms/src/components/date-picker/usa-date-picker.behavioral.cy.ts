// Comprehensive Behavioral Tests for usa-date-picker
// Focus on visual rendering, computed styles, positioning, and actual user-visible behavior
import './index.ts';

describe('USA Date Picker - Comprehensive Behavioral Tests', () => {
  beforeEach(() => {
    // Ignore script errors from USWDS JavaScript attempts
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Script error')) {
        return false;
      }
    });
  });

  describe('Visual Rendering and Display Verification', () => {
    it('should have calendar popup that is actually visible when opened', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Verify initial state - calendar should not be visible
      cy.get('.usa-date-picker__calendar').should('not.exist');

      // Click button to open calendar
      cy.get('.usa-date-picker__button').click();

      // Calendar should exist and be visually rendered
      cy.get('.usa-date-picker__calendar').should('exist').and('be.visible');

      // Verify calendar has actual content rendered
      cy.get('.usa-date-picker__calendar__table').should('be.visible');
      cy.get('.usa-date-picker__calendar__date').should('have.length.greaterThan', 0);
      cy.get('.usa-date-picker__calendar__date').first().should('be.visible');

      // Verify calendar has clickable date elements
      cy.get('.usa-date-picker__calendar__date')
        .first()
        .should('not.have.css', 'pointer-events', 'none');
    });

    it('should verify calendar popup has correct visual dimensions and is not collapsed', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Verify calendar has reasonable dimensions (not collapsed to 0)
      cy.get('.usa-date-picker__calendar').then(($calendar) => {
        const rect = $calendar[0].getBoundingClientRect();
        expect(rect.width).to.be.greaterThan(200); // Calendar should have reasonable width
        expect(rect.height).to.be.greaterThan(200); // Calendar should have reasonable height
      });

      // Verify calendar table has reasonable dimensions
      cy.get('.usa-date-picker__calendar__table').then(($table) => {
        const rect = $table[0].getBoundingClientRect();
        expect(rect.width).to.be.greaterThan(150);
        expect(rect.height).to.be.greaterThan(150);
      });
    });

    it('should verify calendar dates are properly rendered and clickable', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Check that date buttons have text content
      cy.get('.usa-date-picker__calendar__date').each(($date) => {
        cy.wrap($date).should('contain.text', /\d+/); // Should contain numbers
        cy.wrap($date).should('have.css', 'cursor', 'pointer'); // Should be clickable
      });

      // Verify dates have proper dimensions (not collapsed)
      cy.get('.usa-date-picker__calendar__date')
        .first()
        .then(($date) => {
          const rect = $date[0].getBoundingClientRect();
          expect(rect.width).to.be.greaterThan(20);
          expect(rect.height).to.be.greaterThan(20);
        });
    });

    it('should verify calendar navigation elements are visible and functional', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Previous/next month buttons should be visible and clickable
      cy.get('.usa-date-picker__calendar__previous-month')
        .should('be.visible')
        .should('contain.text', '‹')
        .should('have.css', 'cursor', 'pointer');

      cy.get('.usa-date-picker__calendar__next-month')
        .should('be.visible')
        .should('contain.text', '›')
        .should('have.css', 'cursor', 'pointer');

      // Month label should be visible with text
      cy.get('.usa-date-picker__calendar__month-label')
        .should('be.visible')
        .should('contain.text', /\w+\s+\d{4}/); // Should contain month name and year
    });

    it('should detect if calendar is hidden by CSS display or visibility issues', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Verify calendar is not hidden by common CSS issues
      cy.get('.usa-date-picker__calendar').should('not.have.css', 'display', 'none');
      cy.get('.usa-date-picker__calendar').should('not.have.css', 'visibility', 'hidden');
      cy.get('.usa-date-picker__calendar').should('not.have.css', 'opacity', '0');
      cy.get('.usa-date-picker__calendar').should('not.have.css', 'height', '0px');
      cy.get('.usa-date-picker__calendar').should('not.have.css', 'width', '0px');
      cy.get('.usa-date-picker__calendar').should('not.have.css', 'overflow', 'hidden');
    });
  });

  describe('Computed Styles and CSS Verification', () => {
    it('should verify calendar has proper z-index for layering above other content', () => {
      // Add some background content to test layering
      cy.mount(`
        <div>
          <div style="position: relative; z-index: 10; background: red; height: 100px;">Background Content</div>
          <usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>
        </div>
      `);

      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Calendar should have a high z-index to appear above other content
      cy.get('.usa-date-picker__calendar').then(($calendar) => {
        const zIndex = window.getComputedStyle($calendar[0]).zIndex;
        // Z-index should be numeric and reasonably high (USWDS uses specific values)
        expect(parseInt(zIndex) || 0).to.be.greaterThan(100);
      });
    });

    it('should verify calendar positioning is correct (not off-screen)', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Calendar should be positioned within viewport
      cy.get('.usa-date-picker__calendar').then(($calendar) => {
        const rect = $calendar[0].getBoundingClientRect();
        const viewportWidth = Cypress.config('viewportWidth');
        const viewportHeight = Cypress.config('viewportHeight');

        // Calendar should be visible within viewport bounds
        expect(rect.left).to.be.greaterThan(-10); // Allow small margin
        expect(rect.top).to.be.greaterThan(-10);
        expect(rect.right).to.be.lessThan(viewportWidth + 10);
        expect(rect.bottom).to.be.lessThan(viewportHeight + 10);
      });
    });

    it('should verify calendar has USWDS styling applied correctly', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Verify USWDS classes are applied and have actual styles
      cy.get('.usa-date-picker__calendar').then(($calendar) => {
        const computedStyle = window.getComputedStyle($calendar[0]);

        // Calendar should have background color (not transparent)
        expect(computedStyle.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
        expect(computedStyle.backgroundColor).to.not.equal('transparent');

        // Calendar should have border or shadow for visual separation
        const hasBorder = computedStyle.border !== 'none' && computedStyle.border !== '0px';
        const hasShadow = computedStyle.boxShadow !== 'none';
        expect(hasBorder || hasShadow).to.be.true;
      });

      // Verify calendar dates have proper styling
      cy.get('.usa-date-picker__calendar__date')
        .first()
        .then(($date) => {
          const computedStyle = window.getComputedStyle($date[0]);

          // Date buttons should have background or border
          const hasBackground = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
          const hasBorder = computedStyle.border !== 'none';
          expect(hasBackground || hasBorder).to.be.true;
        });
    });

    it('should verify button icon is visible via CSS background-image', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Button should have background-image for icon (USWDS pattern)
      cy.get('.usa-date-picker__button').then(($button) => {
        const computedStyle = window.getComputedStyle($button[0]);

        // Should have background-image for icon
        expect(computedStyle.backgroundImage).to.not.equal('none');
        expect(computedStyle.backgroundImage).to.include('url(');

        // Button should have reasonable dimensions for icon display
        const rect = $button[0].getBoundingClientRect();
        expect(rect.width).to.be.greaterThan(20);
        expect(rect.height).to.be.greaterThan(20);
      });
    });
  });

  describe('Interaction Triggers and Focus Management', () => {
    it('should verify calendar opens on multiple trigger methods', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Test 1: Mouse click on button
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Close calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('not.be.visible');

      // Test 2: Keyboard activation (Space)
      cy.get('.usa-date-picker__button').focus().type(' ');
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Close and test Enter
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('not.be.visible');

      // Test 3: Keyboard activation (Enter)
      cy.get('.usa-date-picker__button').focus().type('{enter}');
      cy.get('.usa-date-picker__calendar').should('be.visible');
    });

    it('should verify F4 key opens calendar from input field', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Focus input and press F4
      cy.get('.usa-input').focus().type('{f4}');
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Verify calendar is actually functional after F4 open
      cy.get('.usa-date-picker__calendar__date').should('be.visible');
      cy.get('.usa-date-picker__calendar__date').should('have.length.greaterThan', 0);
    });

    it('should verify Down Arrow key opens calendar from input field', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Focus input and press Down Arrow
      cy.get('.usa-input').focus().type('{downarrow}');
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Verify calendar content is rendered
      cy.get('.usa-date-picker__calendar__table').should('be.visible');
    });

    it('should verify focus management when calendar opens and closes', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Initial focus on input
      cy.get('.usa-input').focus();
      cy.get('.usa-input').should('be.focused');

      // Open calendar via button
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Select a date
      cy.get('.usa-date-picker__calendar__date').first().click();

      // Calendar should close and focus should return to input
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
      cy.get('.usa-input').should('have.value');
    });

    it('should verify click outside closes calendar', () => {
      cy.mount(`
        <div>
          <usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>
          <div id="outside-element" style="margin-top: 20px; height: 50px; background: lightgray;">Click outside area</div>
        </div>
      `);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Click outside
      cy.get('#outside-element').click();

      // Calendar should close
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
    });
  });

  describe('Date Selection and Value Updates', () => {
    it('should verify date selection updates input value and closes calendar', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Get initial input value
      cy.get('.usa-input')
        .invoke('val')
        .then((initialValue) => {
          // Click on a date
          cy.get('.usa-date-picker__calendar__date').first().click();

          // Calendar should close
          cy.get('.usa-date-picker__calendar').should('not.be.visible');

          // Input should have new value
          cy.get('.usa-input').invoke('val').should('not.equal', initialValue);
          cy.get('.usa-input').should('not.have.value', '');
        });
    });

    it('should verify selected date appears highlighted in calendar', () => {
      cy.mount(
        `<usa-date-picker id="test-date-picker" label="Test Date" value="2024-01-15"></usa-date-picker>`
      );

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // There should be a selected date with appropriate styling
      cy.get('.usa-date-picker__calendar__date--selected').should('exist');
      cy.get('.usa-date-picker__calendar__date--selected').should('be.visible');

      // Selected date should have different visual styling
      cy.get('.usa-date-picker__calendar__date--selected').then(($selected) => {
        const computedStyle = window.getComputedStyle($selected[0]);
        // Should have different background or text color
        expect(computedStyle.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
      });
    });

    it("should verify today's date is highlighted appropriately", () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Today's date should be marked if visible in current month
      cy.get('.usa-date-picker__calendar__date--today').then(($today) => {
        if ($today.length > 0) {
          cy.wrap($today).should('be.visible');
          // Today should have distinctive styling
          cy.wrap($today).then(($el) => {
            const computedStyle = window.getComputedStyle($el[0]);
            expect(computedStyle.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
          });
        }
      });
    });
  });

  describe('Month Navigation Functionality', () => {
    it('should verify month navigation actually changes calendar content', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Get current month text
      cy.get('.usa-date-picker__calendar__month-label')
        .invoke('text')
        .then((currentMonth) => {
          // Click next month
          cy.get('.usa-date-picker__calendar__next-month').click();

          // Month should change
          cy.get('.usa-date-picker__calendar__month-label').should(
            'not.contain.text',
            currentMonth
          );

          // Calendar should still be visible and functional
          cy.get('.usa-date-picker__calendar').should('be.visible');
          cy.get('.usa-date-picker__calendar__date').should('be.visible');
          cy.get('.usa-date-picker__calendar__date').should('have.length.greaterThan', 0);
        });
    });

    it('should verify previous month navigation works correctly', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Get current month text
      cy.get('.usa-date-picker__calendar__month-label')
        .invoke('text')
        .then((currentMonth) => {
          // Click previous month
          cy.get('.usa-date-picker__calendar__previous-month').click();

          // Month should change
          cy.get('.usa-date-picker__calendar__month-label').should(
            'not.contain.text',
            currentMonth
          );

          // Calendar dates should be updated
          cy.get('.usa-date-picker__calendar__date').should('be.visible');
        });
    });

    it('should verify year changes when navigating past month boundaries', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Navigate through 12 months to test year rollover
      for (let i = 0; i < 13; i++) {
        cy.get('.usa-date-picker__calendar__next-month').click();
        cy.wait(50); // Small delay for rendering
      }

      // Year should have changed
      cy.get('.usa-date-picker__calendar__month-label').should('contain.text', '2025');

      // Calendar should still be functional
      cy.get('.usa-date-picker__calendar__date').should('be.visible');
    });
  });

  describe('Error State and Edge Case Handling', () => {
    it('should verify calendar remains functional when component has error state', () => {
      cy.mount(
        `<usa-date-picker id="test-date-picker" label="Test Date" error="Please enter a valid date"></usa-date-picker>`
      );

      // Input should show error styling
      cy.get('.usa-input').should('have.class', 'usa-input--error');
      cy.get('.usa-error-message').should('be.visible');

      // Calendar should still open and function
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Should be able to select dates
      cy.get('.usa-date-picker__calendar__date').first().click();
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
      cy.get('.usa-input').should('have.value');
    });

    it('should verify disabled state prevents calendar interaction', () => {
      cy.mount(
        `<usa-date-picker id="test-date-picker" label="Test Date" disabled></usa-date-picker>`
      );

      // Button should be disabled
      cy.get('.usa-date-picker__button').should('be.disabled');
      cy.get('.usa-input').should('be.disabled');

      // Clicking disabled button should not open calendar
      cy.get('.usa-date-picker__button').click({ force: true });
      cy.get('.usa-date-picker__calendar').should('not.exist');
    });

    it('should verify calendar handles min/max date constraints visually', () => {
      const minDate = '2024-01-01';
      const maxDate = '2024-01-31';

      cy.mount(
        `<usa-date-picker id="test-date-picker" label="Test Date" min-date="${minDate}" max-date="${maxDate}"></usa-date-picker>`
      );

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Calendar should be showing January 2024 (within constraints)
      cy.get('.usa-date-picker__calendar__month-label').should('contain.text', 'January 2024');

      // All visible dates should be selectable (within range)
      cy.get('.usa-date-picker__calendar__date').each(($date) => {
        cy.wrap($date).should('not.have.attr', 'disabled');
      });
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should verify calendar opens quickly without noticeable delay', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      const startTime = Date.now();

      // Click to open calendar
      cy.get('.usa-date-picker__button').click();

      // Calendar should appear quickly (within reasonable time)
      cy.get('.usa-date-picker__calendar')
        .should('be.visible')
        .then(() => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          expect(duration).to.be.lessThan(500); // Should open within 500ms
        });
    });

    it('should verify calendar remains responsive during rapid interactions', () => {
      cy.mount(`<usa-date-picker id="test-date-picker" label="Test Date"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Rapidly navigate months
      for (let i = 0; i < 5; i++) {
        cy.get('.usa-date-picker__calendar__next-month').click();
        cy.get('.usa-date-picker__calendar__previous-month').click();
      }

      // Calendar should still be visible and functional
      cy.get('.usa-date-picker__calendar').should('be.visible');
      cy.get('.usa-date-picker__calendar__date').should('be.visible');
      cy.get('.usa-date-picker__calendar__date').first().click();
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
    });

    it('should verify multiple date pickers can coexist without interference', () => {
      cy.mount(`
        <div>
          <usa-date-picker id="picker1" label="Start Date"></usa-date-picker>
          <usa-date-picker id="picker2" label="End Date" style="margin-top: 20px;"></usa-date-picker>
        </div>
      `);

      // Open first calendar
      cy.get('#picker1 .usa-date-picker__button').click();
      cy.get('#picker1 .usa-date-picker__calendar').should('be.visible');

      // Second calendar should not be affected
      cy.get('#picker2 .usa-date-picker__calendar').should('not.exist');

      // Open second calendar (should close first)
      cy.get('#picker2 .usa-date-picker__button').click();
      cy.get('#picker2 .usa-date-picker__calendar').should('be.visible');

      // Both calendars should be independently functional
      cy.get('#picker2 .usa-date-picker__calendar__date').first().click();
      cy.get('#picker2 .usa-date-picker__calendar').should('not.be.visible');
      cy.get('#picker2 .usa-input').should('have.value');
    });
  });
});
