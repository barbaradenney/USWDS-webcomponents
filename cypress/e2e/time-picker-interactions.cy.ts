/**
 * Time Picker Interactions - Browser-Dependent Tests
 *
 * These tests were migrated from Vitest because they require real browser APIs:
 * - Dropdown list rendering and interactions
 * - USWDS combo-box enhancement
 * - Keyboard navigation in dropdown
 * - Time filtering behavior
 *
 * See: cypress/BROWSER_TESTS_MIGRATION_PLAN.md
 * Source: src/components/time-picker/usa-time-picker.test.ts
 */

describe('Time Picker Interactions', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?id=forms-time-picker--default&viewMode=story');
    cy.injectAxe();
  });

  describe('Basic Properties and Behavior', () => {
    it('should have default properties', () => {
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        expect(element.value).to.equal('');
        expect(element.name).to.equal('time-picker');
      });
    });

    it('should handle placeholder changes', () => {
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        element.placeholder = 'Select a time';
      });

      cy.get('usa-time-picker input').should('have.attr', 'placeholder', 'Select a time');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle arrow down key', () => {
      cy.get('usa-time-picker input')
        .focus()
        .type('{downarrow}');

      // Dropdown list should appear
      cy.get('.usa-combo-box__list').should('be.visible');
    });

    it('should handle arrow up key', () => {
      cy.get('usa-time-picker input')
        .focus()
        .type('{downarrow}') // Open list
        .type('{uparrow}'); // Navigate up

      cy.get('.usa-combo-box__list').should('be.visible');
    });

    it('should handle escape key', () => {
      cy.get('usa-time-picker input')
        .focus()
        .type('{downarrow}') // Open list
        .type('{esc}'); // Close list

      cy.get('.usa-combo-box__list').should('not.be.visible');
    });

    it('should handle enter key to select option', () => {
      cy.get('usa-time-picker input')
        .focus()
        .type('{downarrow}') // Open list
        .type('{enter}'); // Select first option

      // Value should be set
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        expect(element.value).not.to.be.empty;
      });
    });
  });

  describe('Filtering Behavior', () => {
    it('should filter by hour when typing', () => {
      cy.get('usa-time-picker input')
        .focus()
        .type('2');

      cy.wait(200); // Wait for filtering

      // Should show times starting with 2
      cy.get('.usa-combo-box__list').within(() => {
        cy.get('.usa-combo-box__list-option').should('contain', '2:');
      });
    });

    it('should filter by am/pm when typing', () => {
      cy.get('usa-time-picker input')
        .focus()
        .type('pm');

      cy.wait(200);

      // Should show only PM times
      cy.get('.usa-combo-box__list').within(() => {
        cy.get('.usa-combo-box__list-option').should('contain', 'pm');
      });
    });
  });

  describe('Time Selection', () => {
    it('should select time when clicking option', () => {
      cy.get('usa-time-picker').within(() => {
        // Open dropdown
        cy.get('.usa-combo-box__toggle-list').click();

        // Click a time option
        cy.get('.usa-combo-box__list-option').first().click();
      });

      // Value should be set
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        expect(element.value).not.to.be.empty;
      });
    });

    it('should update select value when option selected', () => {
      cy.get('usa-time-picker').within(() => {
        cy.get('.usa-combo-box__toggle-list').click();
        cy.get('.usa-combo-box__list-option').first().click();
      });

      // Internal select should have value
      cy.get('usa-time-picker select').should('not.have.value', '');
    });

    it('should close list after selection', () => {
      cy.get('usa-time-picker').within(() => {
        cy.get('.usa-combo-box__toggle-list').click();
        cy.get('.usa-combo-box__list').should('be.visible');

        cy.get('.usa-combo-box__list-option').first().click();
        cy.get('.usa-combo-box__list').should('not.be.visible');
      });
    });

    it('should set default value if provided', () => {
      cy.visit('/iframe.html?id=forms-time-picker--with-default-value&viewMode=story');

      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        expect(element.value).not.to.be.empty;
      });
    });
  });

  describe('Accessibility', () => {
    it('should transfer aria attributes from original input', () => {
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        element.setAttribute('aria-label', 'Select time');
      });

      cy.get('usa-time-picker input').should('have.attr', 'aria-label', 'Select time');
    });

    it('should transfer required attribute to select', () => {
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        element.required = true;
      });

      cy.get('usa-time-picker select').should('have.attr', 'required');
    });

    it('should transfer disabled attribute to select', () => {
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        element.disabled = true;
      });

      cy.get('usa-time-picker select').should('be.disabled');
      cy.get('usa-time-picker input').should('be.disabled');
    });

    it('should pass axe accessibility checks', () => {
      cy.checkA11y('usa-time-picker', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      });
    });
  });

  describe('Combo Box Integration', () => {
    it('should toggle list when clicking toggle button', () => {
      cy.get('usa-time-picker').within(() => {
        const button = cy.get('.usa-combo-box__toggle-list');

        // List should be hidden initially
        cy.get('.usa-combo-box__list').should('not.be.visible');

        // Click to open
        button.click();
        cy.get('.usa-combo-box__list').should('be.visible');

        // Click to close
        button.click();
        cy.get('.usa-combo-box__list').should('not.be.visible');
      });
    });

    it('should clear input when clicking clear button', () => {
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        element.value = '10:30am';
      });

      cy.get('usa-time-picker').within(() => {
        cy.get('.usa-combo-box__clear-input').click();
      });

      cy.get('usa-time-picker input').should('have.value', '');
    });

    it('should support keyboard navigation in list', () => {
      cy.get('usa-time-picker input')
        .focus()
        .type('{downarrow}'); // Open list

      // Navigate through options with arrow keys
      cy.focused().type('{downarrow}{downarrow}');

      // Should highlight an option
      cy.get('.usa-combo-box__list-option--focused').should('exist');
    });
  });

  describe('Time Format Validation', () => {
    it('should store values in 24-hour format', () => {
      cy.get('usa-time-picker').then(($el) => {
        const element = $el[0] as any;
        element.value = '2:30pm';
      });

      // Internal value should be 14:30
      cy.get('usa-time-picker select').should('have.value', '14:30');
    });
  });
});
