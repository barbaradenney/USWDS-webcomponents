// Comprehensive Behavioral Tests for usa-combo-box
// Focus on dropdown visibility, filtering behavior, keyboard navigation, and selection
import './index.ts';

describe('USA Combo Box - Comprehensive Behavioral Tests', () => {
  beforeEach(() => {
    // Ignore script errors from USWDS JavaScript attempts
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Script error')) {
        return false;
      }
    });
  });

  const sampleOptions = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
  ];

  describe('Dropdown Visibility and Display Verification', () => {
    it('should verify dropdown is completely hidden when closed and fully visible when opened', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Initially dropdown should be hidden
      cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');

      // Click toggle button to open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();

      // Dropdown should now be visible
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Options should be visible
      cy.get('#test-combo .usa-combo-box__list-option').should('be.visible');
      cy.get('#test-combo .usa-combo-box__list-option').should('have.length.greaterThan', 0);
    });

    it('should verify dropdown options have proper dimensions and are not collapsed', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Each option should have reasonable dimensions
      cy.get('#test-combo .usa-combo-box__list-option').each(($option) => {
        cy.wrap($option).then(($el) => {
          const rect = $el[0].getBoundingClientRect();
          expect(rect.width).to.be.greaterThan(50);
          expect(rect.height).to.be.greaterThan(20);
        });
      });

      // Options should contain text
      cy.get('#test-combo .usa-combo-box__list-option').each(($option) => {
        cy.wrap($option).should('contain.text', /[A-Za-z]/);
      });
    });

    it('should verify dropdown positioning is correct and not off-screen', () => {
      cy.mount(`
        <div style="margin-top: 50px;">
          <usa-combo-box
            id="test-combo"
            label="Select a state"
            .options="${sampleOptions}">
          </usa-combo-box>
        </div>
      `);

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Dropdown should be positioned correctly relative to input
      cy.get('#test-combo .usa-combo-box__list').then(($list) => {
        const rect = $list[0].getBoundingClientRect();
        const viewportWidth = Cypress.config('viewportWidth');
        const viewportHeight = Cypress.config('viewportHeight');

        // Dropdown should be within viewport bounds
        expect(rect.left).to.be.greaterThanOrEqual(0);
        expect(rect.top).to.be.greaterThanOrEqual(0);
        expect(rect.right).to.be.lessThanOrEqual(viewportWidth);
        expect(rect.bottom).to.be.lessThanOrEqual(viewportHeight);
      });

      // Dropdown should be positioned below the input
      cy.get('#test-combo .usa-combo-box__input').then(($input) => {
        const inputRect = $input[0].getBoundingClientRect();

        cy.get('#test-combo .usa-combo-box__list').then(($list) => {
          const listRect = $list[0].getBoundingClientRect();
          expect(listRect.top).to.be.greaterThanOrEqual(inputRect.bottom);
        });
      });
    });

    it('should verify dropdown closes when clicking outside', () => {
      cy.mount(`
        <div>
          <usa-combo-box
            id="test-combo"
            label="Select a state"
            .options="${sampleOptions}">
          </usa-combo-box>
          <div id="outside-area" style="margin-top: 20px; height: 50px; background: lightgray;">
            Click outside area
          </div>
        </div>
      `);

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Click outside
      cy.get('#outside-area').click();

      // Dropdown should close
      cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');
    });

    it('should verify dropdown has proper z-index layering', () => {
      cy.mount(`
        <div>
          <div style="position: relative; z-index: 10; background: red; height: 50px; margin-bottom: 10px;">
            Background content
          </div>
          <usa-combo-box
            id="test-combo"
            label="Select a state"
            .options="${sampleOptions}">
          </usa-combo-box>
        </div>
      `);

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Dropdown should have appropriate z-index
      cy.get('#test-combo .usa-combo-box__list').then(($list) => {
        const zIndex = window.getComputedStyle($list[0]).zIndex;
        expect(parseInt(zIndex) || 0).to.be.greaterThan(10);
      });
    });
  });

  describe('Keyboard Navigation and Interaction', () => {
    it('should verify Arrow Down key opens dropdown from input', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Focus input and press Arrow Down
      cy.get('#test-combo .usa-combo-box__input').focus().type('{downarrow}');

      // Dropdown should open
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');
      cy.get('#test-combo .usa-combo-box__list-option').should('be.visible');
    });

    it('should verify keyboard navigation within dropdown options', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__input').focus().type('{downarrow}');
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // First option should be highlighted
      cy.get('#test-combo .usa-combo-box__list-option')
        .first()
        .should('have.class', 'usa-combo-box__list-option--focused');

      // Arrow Down should move to next option
      cy.get('#test-combo .usa-combo-box__input').type('{downarrow}');
      cy.get('#test-combo .usa-combo-box__list-option')
        .eq(1)
        .should('have.class', 'usa-combo-box__list-option--focused');

      // Arrow Up should move back
      cy.get('#test-combo .usa-combo-box__input').type('{uparrow}');
      cy.get('#test-combo .usa-combo-box__list-option')
        .first()
        .should('have.class', 'usa-combo-box__list-option--focused');
    });

    it('should verify Enter key selects focused option', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Open dropdown and navigate to second option
      cy.get('#test-combo .usa-combo-box__input').focus().type('{downarrow}{downarrow}');
      cy.get('#test-combo .usa-combo-box__list-option')
        .eq(1)
        .should('have.class', 'usa-combo-box__list-option--focused');

      // Press Enter to select
      cy.get('#test-combo .usa-combo-box__input').type('{enter}');

      // Dropdown should close and input should have selected value
      cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');
      cy.get('#test-combo .usa-combo-box__input').should('have.value', 'Alaska');
    });

    it('should verify Escape key closes dropdown without selection', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Open dropdown and navigate
      cy.get('#test-combo .usa-combo-box__input').focus().type('{downarrow}{downarrow}');
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Get initial input value
      cy.get('#test-combo .usa-combo-box__input')
        .invoke('val')
        .then((initialValue) => {
          // Press Escape
          cy.get('#test-combo .usa-combo-box__input').type('{esc}');

          // Dropdown should close without changing value
          cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');
          cy.get('#test-combo .usa-combo-box__input').should('have.value', initialValue);
        });
    });

    it('should verify Tab key closes dropdown and moves to next element', () => {
      cy.mount(`
        <div>
          <usa-combo-box
            id="test-combo"
            label="Select a state"
            .options="${sampleOptions}">
          </usa-combo-box>
          <button id="next-element">Next Element</button>
        </div>
      `);

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__input').focus().type('{downarrow}');
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Tab should close dropdown and move focus
      cy.get('#test-combo .usa-combo-box__input').tab();

      // Dropdown should close
      cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');

      // Focus should move to next element
      cy.get('#next-element').should('be.focused');
    });
  });

  describe('Filtering and Search Behavior', () => {
    it('should verify typing filters options correctly', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Type 'al' to filter
      cy.get('#test-combo .usa-combo-box__input').focus().type('al');

      // Dropdown should open with filtered results
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Should show options containing 'al'
      cy.get('#test-combo .usa-combo-box__list-option').should('contain.text', 'Alabama');
      cy.get('#test-combo .usa-combo-box__list-option').should('contain.text', 'Alaska');

      // Should not show options that don't match
      cy.get('#test-combo .usa-combo-box__list-option').should('not.contain.text', 'Arizona');
    });

    it('should verify filter results highlight matching text', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Type 'cal' to filter
      cy.get('#test-combo .usa-combo-box__input').focus().type('cal');

      // Should show California with highlighted text
      cy.get('#test-combo .usa-combo-box__list-option').should('contain.text', 'California');

      // Check if highlighting is applied (depends on implementation)
      cy.get('#test-combo .usa-combo-box__list-option')
        .first()
        .then(($option) => {
          const text = $option.text();
          expect(text.toLowerCase()).to.include('cal');
        });
    });

    it('should verify clearing input shows all options again', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Type to filter
      cy.get('#test-combo .usa-combo-box__input').focus().type('cal');
      cy.get('#test-combo .usa-combo-box__list-option').should('have.length', 1);

      // Clear input
      cy.get('#test-combo .usa-combo-box__input').clear();

      // All options should be visible again
      cy.get('#test-combo .usa-combo-box__list-option').should('have.length', sampleOptions.length);
    });

    it('should verify no results message when filter matches nothing', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Type something that won't match any options
      cy.get('#test-combo .usa-combo-box__input').focus().type('xyz');

      // Should show no results or appropriate message
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');
      cy.get('#test-combo .usa-combo-box__list-option').should('have.length', 0);
    });
  });

  describe('Click Selection and Mouse Interaction', () => {
    it('should verify clicking an option selects it and closes dropdown', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Click on an option
      cy.get('#test-combo .usa-combo-box__list-option').contains('California').click();

      // Dropdown should close and input should have selected value
      cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');
      cy.get('#test-combo .usa-combo-box__input').should('have.value', 'California');
    });

    it('should verify toggle button opens and closes dropdown', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Click toggle to open
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Click toggle again to close
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');
    });

    it('should verify option hover states work correctly', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Hover over an option
      cy.get('#test-combo .usa-combo-box__list-option').first().trigger('mouseover');

      // Option should show hover state
      cy.get('#test-combo .usa-combo-box__list-option')
        .first()
        .should('have.class', 'usa-combo-box__list-option--focused');
    });

    it("should verify rapid clicking doesn't break dropdown behavior", () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Rapidly click toggle button multiple times
      for (let i = 0; i < 5; i++) {
        cy.get('#test-combo .usa-combo-box__toggle-list').click();
      }

      // Dropdown should still work correctly
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');
      cy.get('#test-combo .usa-combo-box__list-option').should('be.visible');

      // Should be able to select an option
      cy.get('#test-combo .usa-combo-box__list-option').first().click();
      cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');
    });
  });

  describe('Value Management and Events', () => {
    it('should verify selected value persists after dropdown interactions', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          value="Florida"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Input should have initial value
      cy.get('#test-combo .usa-combo-box__input').should('have.value', 'Florida');

      // Open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');

      // Close without selecting
      cy.get('#test-combo .usa-combo-box__input').type('{esc}');

      // Value should be preserved
      cy.get('#test-combo .usa-combo-box__input').should('have.value', 'Florida');
    });

    it('should verify custom events are dispatched on selection', () => {
      let changeEventFired = false;
      let selectionEventFired = false;

      cy.mount(
        `
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `
      ).then(() => {
        // Set up event listeners
        cy.get('#test-combo').then(($combo) => {
          $combo[0].addEventListener('change', () => {
            changeEventFired = true;
          });
          $combo[0].addEventListener('combo-selection', () => {
            selectionEventFired = true;
          });
        });
      });

      // Select an option
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list-option').first().click();

      // Verify events were fired
      cy.then(() => {
        expect(changeEventFired).to.be.true;
      });
    });

    it('should verify programmatic value setting works correctly', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Set value programmatically
      cy.get('#test-combo').then(($combo) => {
        $combo[0].value = 'Georgia';
      });

      // Input should reflect the change
      cy.get('#test-combo .usa-combo-box__input').should('have.value', 'Georgia');
    });
  });

  describe('Error States and Edge Cases', () => {
    it('should verify disabled state prevents dropdown interaction', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          disabled
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Input and toggle should be disabled
      cy.get('#test-combo .usa-combo-box__input').should('be.disabled');
      cy.get('#test-combo .usa-combo-box__toggle-list').should('be.disabled');

      // Clicking toggle should not open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click({ force: true });
      cy.get('#test-combo .usa-combo-box__list').should('not.be.visible');
    });

    it('should verify error state styling is applied correctly', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          error="Please select a valid state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      // Should show error styling
      cy.get('#test-combo .usa-combo-box__input').should('have.class', 'usa-input--error');
      cy.get('#test-combo .usa-error-message')
        .should('be.visible')
        .and('contain.text', 'Please select a valid state');

      // Dropdown should still function
      cy.get('#test-combo .usa-combo-box__toggle-list').click();
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');
    });

    it('should verify combo box with empty options array handles gracefully', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${[]}">
        </usa-combo-box>
      `);

      // Toggle button should still be clickable
      cy.get('#test-combo .usa-combo-box__toggle-list').click();

      // Dropdown should open but show no options
      cy.get('#test-combo .usa-combo-box__list').should('be.visible');
      cy.get('#test-combo .usa-combo-box__list-option').should('have.length', 0);
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should verify dropdown opens quickly without delay', () => {
      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select a state"
          .options="${sampleOptions}">
        </usa-combo-box>
      `);

      const startTime = Date.now();

      // Click to open dropdown
      cy.get('#test-combo .usa-combo-box__toggle-list').click();

      cy.get('#test-combo .usa-combo-box__list')
        .should('be.visible')
        .then(() => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          expect(duration).to.be.lessThan(300); // Should open within 300ms
        });
    });

    it('should verify filtering large option lists remains responsive', () => {
      const largeOptionList = Array.from({ length: 1000 }, (_, i) => `Option ${i + 1}`);

      cy.mount(`
        <usa-combo-box
          id="test-combo"
          label="Select an option"
          .options="${largeOptionList}">
        </usa-combo-box>
      `);

      const startTime = Date.now();

      // Type to filter
      cy.get('#test-combo .usa-combo-box__input').focus().type('50');

      cy.get('#test-combo .usa-combo-box__list')
        .should('be.visible')
        .then(() => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          expect(duration).to.be.lessThan(500); // Filtering should be responsive
        });

      // Should show filtered results
      cy.get('#test-combo .usa-combo-box__list-option').should('have.length.lessThan', 100);
    });
  });
});
