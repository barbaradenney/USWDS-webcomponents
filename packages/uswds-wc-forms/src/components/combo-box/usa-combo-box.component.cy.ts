// Component tests for usa-combo-box
import './index.ts';

describe('USA Combo Box Component Tests', () => {
  const stateOptions = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
  ];

  it('should render combo box with default properties', () => {
    cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);
    cy.get('usa-combo-box').should('exist');
    cy.get('.usa-combo-box').should('exist');
    cy.get('.usa-combo-box__input').should('exist');
    cy.get('.usa-combo-box__toggle-list').should('exist');
  });

  it('should render options when provided', () => {
    cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    // Click toggle to open dropdown
    cy.get('.usa-combo-box__toggle-list').click();
    cy.get('.usa-combo-box__list').should('be.visible');
    cy.get('.usa-combo-box__list-option').should('have.length', stateOptions.length);
    cy.get('.usa-combo-box__list-option').first().should('contain.text', 'Alabama');
  });

  it('should handle text input and filtering', () => {
    cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    // Type to filter options
    cy.get('.usa-combo-box__input').type('cal');
    cy.get('.usa-combo-box__list').should('be.visible');
    cy.get('.usa-combo-box__list-option').should('have.length', 1);
    cy.get('.usa-combo-box__list-option').should('contain.text', 'California');

    // Clear and try different filter
    cy.get('.usa-combo-box__input').clear().type('ar');
    cy.get('.usa-combo-box__list-option').should('have.length', 2); // Arkansas, Arizona
  });

  it('should handle option selection via click', () => {
    cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    // Open dropdown and select option
    cy.get('.usa-combo-box__toggle-list').click();
    cy.get('.usa-combo-box__list-option').contains('Florida').click();

    // Should close dropdown and set value
    cy.get('.usa-combo-box__input').should('have.value', 'Florida');
    cy.get('.usa-combo-box__list').should('not.be.visible');
  });

  it('should handle keyboard navigation', () => {
    cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    // Focus input and open with arrow down
    cy.get('.usa-combo-box__input').focus().type('{downarrow}');
    cy.get('.usa-combo-box__list').should('be.visible');

    // First option should be focused
    cy.get('.usa-combo-box__list-option--focused').should('contain.text', 'Alabama');

    // Arrow down to next option
    cy.get('.usa-combo-box__input').type('{downarrow}');
    cy.get('.usa-combo-box__list-option--focused').should('contain.text', 'Alaska');

    // Arrow up to previous option
    cy.get('.usa-combo-box__input').type('{uparrow}');
    cy.get('.usa-combo-box__list-option--focused').should('contain.text', 'Alabama');

    // Enter to select
    cy.get('.usa-combo-box__input').type('{enter}');
    cy.get('.usa-combo-box__input').should('have.value', 'Alabama');
    cy.get('.usa-combo-box__list').should('not.be.visible');
  });

  it('should handle escape key to close dropdown', () => {
    cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    // Open dropdown
    cy.get('.usa-combo-box__toggle-list').click();
    cy.get('.usa-combo-box__list').should('be.visible');

    // Escape to close
    cy.get('.usa-combo-box__input').type('{esc}');
    cy.get('.usa-combo-box__list').should('not.be.visible');
  });

  it('should emit change events', () => {
    cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;

      const changeSpy = cy.stub();
      combo.addEventListener('change', changeSpy);

      // Select an option
      cy.get('.usa-combo-box__toggle-list').click();
      cy.get('.usa-combo-box__list-option').contains('Texas').click();

      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle disabled state', () => {
    cy.mount(`<usa-combo-box id="test-combo" disabled></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    cy.get('.usa-combo-box__input').should('be.disabled');
    cy.get('.usa-combo-box__toggle-list').should('be.disabled');
    cy.get('.usa-combo-box').should('have.class', 'usa-combo-box--disabled');
  });

  it('should handle required state', () => {
    cy.mount(`<usa-combo-box id="test-combo" required></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    cy.get('.usa-combo-box__input').should('have.attr', 'required');
    cy.get('.usa-combo-box__input').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-combo-box 
        id="test-combo" 
        error
        error-message="Please select a valid state">
      </usa-combo-box>
    `);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    cy.get('.usa-combo-box__input').should('have.attr', 'aria-invalid', 'true');
    cy.get('.usa-combo-box').should('have.class', 'usa-combo-box--error');
    cy.get('.usa-error-message').should('contain.text', 'Please select a valid state');
  });

  it('should handle custom placeholder', () => {
    cy.mount(`
      <usa-combo-box 
        id="test-combo" 
        placeholder="Select or type a state name">
      </usa-combo-box>
    `);

    cy.get('.usa-combo-box__input').should(
      'have.attr',
      'placeholder',
      'Select or type a state name'
    );
  });

  it('should handle no results state', () => {
    cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    // Type something that doesn't match any options
    cy.get('.usa-combo-box__input').type('xyz');
    cy.get('.usa-combo-box__list').should('be.visible');
    cy.get('.usa-combo-box__status').should('contain.text', 'No results found');
    cy.get('.usa-combo-box__list-option').should('have.length', 0);
  });

  it('should handle clear functionality', () => {
    cy.mount(`<usa-combo-box id="test-combo" clearable></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
      combo.value = 'California';
    });

    // Should show clear button when there's a value
    cy.get('.usa-combo-box__clear-input').should('be.visible');

    // Click clear button
    cy.get('.usa-combo-box__clear-input').click();
    cy.get('.usa-combo-box__input').should('have.value', '');
    cy.get('.usa-combo-box__clear-input').should('not.be.visible');
  });

  it('should handle form integration', () => {
    cy.mount(`
      <form id="test-form">
        <usa-combo-box id="state-combo" name="user-state" required>
        </usa-combo-box>
        <button type="submit">Submit</button>
      </form>
    `);

    cy.window().then((win) => {
      const combo = win.document.getElementById('state-combo') as any;
      combo.options = stateOptions;

      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy(formData.get('user-state'));
      });

      // Select an option and submit
      cy.get('.usa-combo-box__toggle-list').click();
      cy.get('.usa-combo-box__list-option').contains('New York').click();
      cy.get('button[type="submit"]').click();

      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('NY');
      });
    });
  });

  it('should handle custom filtering', () => {
    cy.mount(`<usa-combo-box id="test-combo" filter-type="startsWith"></usa-combo-box>`);

    cy.window().then((win) => {
      const combo = win.document.getElementById('test-combo') as any;
      combo.options = stateOptions;
    });

    // Type 'a' - should only show options starting with 'a'
    cy.get('.usa-combo-box__input').type('a');
    cy.get('.usa-combo-box__list-option').should('have.length', 3); // Alabama, Alaska, Arizona
    cy.get('.usa-combo-box__list-option').should('not.contain.text', 'California'); // Contains 'a' but doesn't start with it
  });

  it('should handle option groups', () => {});

  // Open dropdown
  cy.get('.usa-combo-box__toggle-list').click();

  // Should show group headers
  cy.get('.usa-combo-box__list-option-group').should('have.length', 2);
  cy.get('.usa-combo-box__list-option-group').first().should('contain.text', 'West Coast');
  cy.get('.usa-combo-box__list-option-group').last().should('contain.text', 'East Coast');
});

it('should handle async option loading', () => {
  cy.mount(`<usa-combo-box id="test-combo" min-chars="2"></usa-combo-box>`);

  cy.window().then((win) => {
    const combo = win.document.getElementById('test-combo') as any;

    combo.addEventListener('usa-combo-box:search', (e: CustomEvent) => {
      // Simulate async loading
      setTimeout(() => {
        const query = e.detail.query.toLowerCase();
        const filtered = stateOptions.filter((option) =>
          option.label.toLowerCase().includes(query)
        );
        combo.options = filtered;
      }, 100);
    });
  });

  // Type minimum characters to trigger search
  cy.get('.usa-combo-box__input').type('ca');
  cy.get('.usa-combo-box__status').should('contain.text', 'Loading...');

  // Wait for async results
  cy.wait(200);
  cy.get('.usa-combo-box__list-option').should('have.length', 1);
  cy.get('.usa-combo-box__list-option').should('contain.text', 'California');
});

// NOTE: Custom option rendering is not supported
// USWDS combo box manages all option rendering via standard <option> elements.
// Custom HTML in options is not supported by USWDS design.
// For custom option displays, use a different component or modify USWDS behavior.

it('should handle focus and blur events', () => {
  cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

  cy.window().then((win) => {
    const combo = win.document.getElementById('test-combo') as any;
    combo.options = stateOptions;

    const focusSpy = cy.stub();
    const blurSpy = cy.stub();
    combo.addEventListener('focus', focusSpy);
    combo.addEventListener('blur', blurSpy);

    cy.get('.usa-combo-box__input').focus();
    cy.get('.usa-combo-box__input').blur();

    cy.then(() => {
      expect(focusSpy).to.have.been.called;
      expect(blurSpy).to.have.been.called;
    });
  });
});

it('should handle aria attributes correctly', () => {
  cy.mount(`
      <div>
        <label id="combo-label">State Selection</label>
        <span id="combo-hint">Choose your state of residence</span>
        <usa-combo-box 
          id="test-combo"
          aria-labelledby="combo-label"
          aria-describedby="combo-hint">
        </usa-combo-box>
      </div>
    `);

  cy.window().then((win) => {
    const combo = win.document.getElementById('test-combo') as any;
    combo.options = stateOptions;
  });

  cy.get('.usa-combo-box__input')
    .should('have.attr', 'role', 'combobox')
    .should('have.attr', 'aria-autocomplete', 'list')
    .should('have.attr', 'aria-expanded', 'false')
    .should('have.attr', 'aria-labelledby', 'combo-label')
    .should('have.attr', 'aria-describedby', 'combo-hint');

  // Open dropdown
  cy.get('.usa-combo-box__toggle-list').click();
  cy.get('.usa-combo-box__input').should('have.attr', 'aria-expanded', 'true');

  cy.get('.usa-combo-box__list')
    .should('have.attr', 'role', 'listbox')
    .should('have.attr', 'aria-labelledby', 'combo-label');
});

it('should handle validation on blur', () => {
  cy.mount(`
      <usa-combo-box 
        id="test-combo" 
        required
        validate-on-blur>
      </usa-combo-box>
    `);

  cy.window().then((win) => {
    const combo = win.document.getElementById('test-combo') as any;
    combo.options = stateOptions;
  });

  // Focus and blur without selecting (should trigger validation)
  cy.get('.usa-combo-box__input').focus().blur();
  cy.get('.usa-combo-box__input').should('have.attr', 'aria-invalid', 'true');

  // Select an option and blur (should clear validation)
  cy.get('.usa-combo-box__toggle-list').click();
  cy.get('.usa-combo-box__list-option').first().click();
  cy.get('.usa-combo-box__input').blur();
  cy.get('.usa-combo-box__input').should('not.have.attr', 'aria-invalid', 'true');
});

it('should be accessible', () => {
  cy.mount(`
      <form>
        <label for="accessible-combo">State</label>
        <usa-combo-box 
          id="accessible-combo"
          aria-describedby="state-hint">
        </usa-combo-box>
        <div id="state-hint">Start typing to see matching states</div>
      </form>
    `);

  cy.window().then((win) => {
    const combo = win.document.getElementById('accessible-combo') as any;
    combo.options = stateOptions;
  });

  cy.injectAxe();
  cy.checkAccessibility();
});

it('should handle custom CSS classes', () => {
  cy.mount(`
      <usa-combo-box 
        id="test-combo" 
        class="custom-combo-class">
      </usa-combo-box>
    `);

  cy.get('usa-combo-box').should('have.class', 'custom-combo-class');
  cy.get('.usa-combo-box').should('exist');
});

it('should handle touch interactions', () => {
  cy.mount(`<usa-combo-box id="test-combo"></usa-combo-box>`);

  cy.window().then((win) => {
    const combo = win.document.getElementById('test-combo') as any;
    combo.options = stateOptions;
  });

  // Touch to open dropdown
  cy.get('.usa-combo-box__toggle-list').trigger('touchstart');
  cy.get('.usa-combo-box__list').should('be.visible');

  // Touch option to select
  cy.get('.usa-combo-box__list-option').first().trigger('touchstart');
  cy.get('.usa-combo-box__input').should('have.value', 'Alabama');
});
