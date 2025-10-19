// Component tests for usa-time-picker
import './index.ts';

describe('USA Time Picker Component Tests', () => {
  it('should render time picker with default properties', () => {
    cy.mount(`<usa-time-picker id="test-time-picker"></usa-time-picker>`);
    cy.get('usa-time-picker').should('exist');
    cy.get('.usa-time-picker').should('exist');
    cy.get('.usa-time-picker__input').should('exist');
  });

  it('should handle time input via typing', () => {
    cy.mount(`<usa-time-picker id="test-time-picker"></usa-time-picker>`);

    // Type time in various formats
    cy.get('.usa-time-picker__input').type('2:30 PM');
    cy.get('.usa-time-picker__input').should('have.value', '2:30 PM');

    // Clear and try different format
    cy.get('.usa-time-picker__input').clear().type('14:30');
    cy.get('.usa-time-picker__input').should('have.value', '14:30');
  });

  it('should handle dropdown list when enabled', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" show-dropdown></usa-time-picker>`);

    // Should show dropdown toggle button
    cy.get('.usa-time-picker__toggle').should('exist');

    // Click to open dropdown
    cy.get('.usa-time-picker__toggle').click();
    cy.get('.usa-time-picker__list').should('be.visible');

    // Should have time options
    cy.get('.usa-time-picker__list-option').should('exist');
    cy.get('.usa-time-picker__list-option').first().should('contain.text', '12:00 AM');
  });

  it('should handle time selection from dropdown', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" show-dropdown></usa-time-picker>`);

    // Open dropdown
    cy.get('.usa-time-picker__toggle').click();

    // Select a time option
    cy.get('.usa-time-picker__list-option').contains('9:00 AM').click();

    // Should close dropdown and set value
    cy.get('.usa-time-picker__input').should('have.value', '9:00 AM');
    cy.get('.usa-time-picker__list').should('not.be.visible');
  });

  it('should handle 24-hour format', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" format="24h"></usa-time-picker>`);

    // Type 24-hour format
    cy.get('.usa-time-picker__input').type('14:30');
    cy.get('.usa-time-picker__input').should('have.value', '14:30');

    // Should accept valid 24-hour times
    cy.get('.usa-time-picker__input').clear().type('23:59');
    cy.get('.usa-time-picker__input').should('have.value', '23:59');
  });

  it('should handle 12-hour format with AM/PM', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" format="12h"></usa-time-picker>`);

    // Type 12-hour format
    cy.get('.usa-time-picker__input').type('2:30 PM');
    cy.get('.usa-time-picker__input').should('have.value', '2:30 PM');

    // Should accept different AM/PM formats
    cy.get('.usa-time-picker__input').clear().type('9:15 am');
    cy.get('.usa-time-picker__input').should('have.value', '9:15 AM');
  });

  it('should validate time input', () => {
    cy.mount(`<usa-time-picker id="test-time-picker"></usa-time-picker>`);

    // Enter invalid time
    cy.get('.usa-time-picker__input').type('25:70').blur();
    cy.get('.usa-time-picker__input').should('have.attr', 'aria-invalid', 'true');

    // Enter valid time
    cy.get('.usa-time-picker__input').clear().type('10:30 AM').blur();
    cy.get('.usa-time-picker__input').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should handle step intervals in dropdown', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" show-dropdown step="15"></usa-time-picker>`);

    // Open dropdown
    cy.get('.usa-time-picker__toggle').click();

    // Should show options in 15-minute increments
    cy.get('.usa-time-picker__list-option').eq(1).should('contain.text', '12:15 AM');
    cy.get('.usa-time-picker__list-option').eq(2).should('contain.text', '12:30 AM');
    cy.get('.usa-time-picker__list-option').eq(3).should('contain.text', '12:45 AM');
  });

  it('should emit change events', () => {
    cy.mount(`<usa-time-picker id="test-time-picker"></usa-time-picker>`);

    cy.window().then((win) => {
      const timePicker = win.document.getElementById('test-time-picker') as any;
      const changeSpy = cy.stub();
      timePicker.addEventListener('change', changeSpy);

      // Type a time
      cy.get('.usa-time-picker__input').type('3:45 PM').blur();

      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle disabled state', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" disabled></usa-time-picker>`);

    cy.get('.usa-time-picker__input').should('be.disabled');
    cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--disabled');
  });

  it('should handle required state', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" required></usa-time-picker>`);

    cy.get('.usa-time-picker__input').should('have.attr', 'required');
    cy.get('.usa-time-picker__input').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-time-picker 
        id="test-time-picker" 
        error
        error-message="Please enter a valid time">
      </usa-time-picker>
    `);

    cy.get('.usa-time-picker__input').should('have.attr', 'aria-invalid', 'true');
    cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--error');
    cy.get('.usa-error-message').should('contain.text', 'Please enter a valid time');
  });

  it('should handle time range restrictions', () => {
    cy.mount(`
      <usa-time-picker 
        id="test-time-picker" 
        min-time="9:00 AM"
        max-time="5:00 PM">
      </usa-time-picker>
    `);

    // Enter time before min time
    cy.get('.usa-time-picker__input').type('8:00 AM').blur();
    cy.get('.usa-time-picker__input').should('have.attr', 'aria-invalid', 'true');

    // Enter time after max time
    cy.get('.usa-time-picker__input').clear().type('6:00 PM').blur();
    cy.get('.usa-time-picker__input').should('have.attr', 'aria-invalid', 'true');

    // Enter time within range
    cy.get('.usa-time-picker__input').clear().type('2:00 PM').blur();
    cy.get('.usa-time-picker__input').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should handle keyboard navigation in dropdown', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" show-dropdown></usa-time-picker>`);

    // Focus input and open dropdown with arrow down
    cy.get('.usa-time-picker__input').focus().type('{downarrow}');
    cy.get('.usa-time-picker__list').should('be.visible');

    // First option should be focused
    cy.get('.usa-time-picker__list-option--focused').should('contain.text', '12:00 AM');

    // Arrow down to next option
    cy.get('.usa-time-picker__input').type('{downarrow}');
    cy.get('.usa-time-picker__list-option--focused').should('contain.text', '12:30 AM');

    // Enter to select
    cy.get('.usa-time-picker__input').type('{enter}');
    cy.get('.usa-time-picker__input').should('have.value', '12:30 AM');
    cy.get('.usa-time-picker__list').should('not.be.visible');
  });

  it('should handle escape key to close dropdown', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" show-dropdown></usa-time-picker>`);

    // Open dropdown
    cy.get('.usa-time-picker__toggle').click();
    cy.get('.usa-time-picker__list').should('be.visible');

    // Press escape to close
    cy.get('.usa-time-picker__input').type('{esc}');
    cy.get('.usa-time-picker__list').should('not.be.visible');
  });

  it('should handle form integration', () => {
    cy.mount(`
      <form id="test-form">
        <usa-time-picker id="meeting-time" name="meetingTime" required>
        </usa-time-picker>
        <button type="submit">Submit</button>
      </form>
    `);

    cy.window().then((win) => {
      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy(formData.get('meetingTime'));
      });

      // Enter a time and submit
      cy.get('.usa-time-picker__input').type('2:00 PM');
      cy.get('button[type="submit"]').click();

      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('2:00 PM');
      });
    });
  });

  it('should handle auto-complete suggestions', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" auto-complete></usa-time-picker>`);

    // Start typing partial time
    cy.get('.usa-time-picker__input').type('2');

    // Should show suggestions
    cy.get('.usa-time-picker__suggestions').should('be.visible');
    cy.get('.usa-time-picker__suggestion').should('contain.text', '2:00');

    // Click suggestion
    cy.get('.usa-time-picker__suggestion').contains('2:00 PM').click();
    cy.get('.usa-time-picker__input').should('have.value', '2:00 PM');
  });

  it('should handle custom placeholder text', () => {
    cy.mount(`
      <usa-time-picker 
        id="test-time-picker" 
        placeholder="Enter appointment time">
      </usa-time-picker>
    `);

    cy.get('.usa-time-picker__input').should('have.attr', 'placeholder', 'Enter appointment time');
  });

  it('should handle time parsing and formatting', () => {
    cy.mount(`<usa-time-picker id="test-time-picker"></usa-time-picker>`);

    // Test various input formats
    const timeInputs = [
      { input: '230p', expected: '2:30 PM' },
      { input: '1430', expected: '2:30 PM' },
      { input: '2:30', expected: '2:30 AM' },
      { input: '14:30', expected: '2:30 PM' },
    ];

    timeInputs.forEach(({ input, expected }) => {
      cy.get('.usa-time-picker__input').clear().type(input).blur();
      cy.get('.usa-time-picker__input').should('have.value', expected);
    });
  });

  it('should handle clear functionality', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" clearable></usa-time-picker>`);

    // Set a time first
    cy.get('.usa-time-picker__input').type('3:00 PM');

    // Should show clear button
    cy.get('.usa-time-picker__clear-button').should('be.visible');

    // Click clear button
    cy.get('.usa-time-picker__clear-button').click();
    cy.get('.usa-time-picker__input').should('have.value', '');
    cy.get('.usa-time-picker__clear-button').should('not.be.visible');
  });

  it('should handle focus and blur events', () => {
    cy.mount(`<usa-time-picker id="test-time-picker"></usa-time-picker>`);

    cy.window().then((win) => {
      const timePicker = win.document.getElementById('test-time-picker') as any;
      const focusSpy = cy.stub();
      const blurSpy = cy.stub();
      timePicker.addEventListener('focus', focusSpy);
      timePicker.addEventListener('blur', blurSpy);

      cy.get('.usa-time-picker__input').focus();
      cy.get('.usa-time-picker__input').blur();

      cy.then(() => {
        expect(focusSpy).to.have.been.called;
        expect(blurSpy).to.have.been.called;
      });
    });
  });

  it('should handle aria attributes correctly', () => {
    cy.mount(`
      <div>
        <label id="time-label">Meeting Time</label>
        <span id="time-hint">Enter time in HH:MM AM/PM format</span>
        <usa-time-picker 
          id="test-time-picker"
          show-dropdown
          aria-labelledby="time-label"
          aria-describedby="time-hint">
        </usa-time-picker>
      </div>
    `);

    cy.get('.usa-time-picker__input')
      .should('have.attr', 'role', 'combobox')
      .should('have.attr', 'aria-expanded', 'false')
      .should('have.attr', 'aria-labelledby', 'time-label')
      .should('have.attr', 'aria-describedby', 'time-hint');

    // Open dropdown
    cy.get('.usa-time-picker__toggle').click();
    cy.get('.usa-time-picker__input').should('have.attr', 'aria-expanded', 'true');

    cy.get('.usa-time-picker__list')
      .should('have.attr', 'role', 'listbox')
      .should('have.attr', 'aria-labelledby', 'time-label');
  });

  it('should handle validation on blur', () => {
    cy.mount(`
      <usa-time-picker 
        id="test-time-picker" 
        required
        validate-on-blur>
      </usa-time-picker>
    `);

    // Focus and blur without entering time (should trigger validation)
    cy.get('.usa-time-picker__input').focus().blur();
    cy.get('.usa-time-picker__input').should('have.attr', 'aria-invalid', 'true');

    // Enter valid time and blur (should clear validation)
    cy.get('.usa-time-picker__input').type('10:00 AM').blur();
    cy.get('.usa-time-picker__input').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should be accessible', () => {
    cy.mount(`
      <form>
        <label for="accessible-time">Appointment Time</label>
        <usa-time-picker 
          id="accessible-time"
          required
          aria-describedby="time-instructions">
        </usa-time-picker>
        <div id="time-instructions">Select your preferred appointment time</div>
      </form>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-time-picker 
        id="test-time-picker" 
        class="custom-time-picker-class">
      </usa-time-picker>
    `);

    cy.get('usa-time-picker').should('have.class', 'custom-time-picker-class');
    cy.get('.usa-time-picker').should('exist');
  });

  it('should handle programmatic time setting', () => {
    cy.mount(`<usa-time-picker id="test-time-picker"></usa-time-picker>`);

    cy.window().then((win) => {
      const timePicker = win.document.getElementById('test-time-picker') as any;

      // Set time programmatically
      timePicker.value = '15:30';
      cy.get('.usa-time-picker__input').should('have.value', '3:30 PM');

      // Clear time programmatically
      timePicker.value = '';
      cy.get('.usa-time-picker__input').should('have.value', '');
    });
  });

  it('should handle filtering dropdown options', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" show-dropdown filterable></usa-time-picker>`);

    // Open dropdown and type to filter
    cy.get('.usa-time-picker__toggle').click();
    cy.get('.usa-time-picker__input').type('2:');

    // Should show only options matching filter
    cy.get('.usa-time-picker__list-option').should('contain.text', '2:00');
    cy.get('.usa-time-picker__list-option').should('not.contain.text', '1:00');
  });

  it('should handle click outside to close dropdown', () => {
    cy.mount(`
      <div>
        <usa-time-picker id="test-time-picker" show-dropdown></usa-time-picker>
        <button id="outside-button">Outside Button</button>
      </div>
    `);

    // Open dropdown
    cy.get('.usa-time-picker__toggle').click();
    cy.get('.usa-time-picker__list').should('be.visible');

    // Click outside
    cy.get('#outside-button').click();
    cy.get('.usa-time-picker__list').should('not.be.visible');
  });

  it('should handle seconds input when enabled', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" include-seconds></usa-time-picker>`);

    // Type time with seconds
    cy.get('.usa-time-picker__input').type('2:30:45 PM');
    cy.get('.usa-time-picker__input').should('have.value', '2:30:45 PM');

    // Should validate seconds
    cy.get('.usa-time-picker__input').clear().type('2:30:75 PM').blur();
    cy.get('.usa-time-picker__input').should('have.attr', 'aria-invalid', 'true');
  });

  it('should handle touch interactions', () => {
    cy.mount(`<usa-time-picker id="test-time-picker" show-dropdown></usa-time-picker>`);

    // Touch to open dropdown
    cy.get('.usa-time-picker__toggle').trigger('touchstart');
    cy.get('.usa-time-picker__list').should('be.visible');

    // Touch option to select
    cy.get('.usa-time-picker__list-option').contains('10:00 AM').trigger('touchstart');
    cy.get('.usa-time-picker__input').should('have.value', '10:00 AM');
    cy.get('.usa-time-picker__list').should('not.be.visible');
  });

  it('should handle business hours filtering', () => {
    cy.mount(`
      <usa-time-picker
        id="test-time-picker"
        show-dropdown
        business-hours-only
        business-start="9:00 AM"
        business-end="5:00 PM">
      </usa-time-picker>
    `);

    // Open dropdown
    cy.get('.usa-time-picker__toggle').click();

    // Should only show business hours
    cy.get('.usa-time-picker__list-option').first().should('contain.text', '9:00 AM');
    cy.get('.usa-time-picker__list-option').should('not.contain.text', '8:00 AM');
    cy.get('.usa-time-picker__list-option').should('not.contain.text', '6:00 PM');
  });

  // Disabled State Robustness Testing (Critical Gap Fix)
  describe('Disabled State Protection', () => {
    it('should completely prevent time selection when disabled', () => {
      let timeChangeTriggered = false;
      let inputActivated = false;

      cy.mount(`
        <usa-time-picker
          id="disabled-time-test"
          name="disabled-test"
          disabled>
        </usa-time-picker>
      `);

      cy.window().then((win) => {
        const timePicker = win.document.getElementById('disabled-time-test') as any;
        const input = timePicker.querySelector('.usa-time-picker__input') as HTMLInputElement;

        // Listen for any time change events (should not occur)
        timePicker.addEventListener('change', () => {
          timeChangeTriggered = true;
        });
        input.addEventListener('input', () => {
          timeChangeTriggered = true;
        });

        // Listen for input activation attempts
        input.addEventListener('click', () => {
          inputActivated = true;
        });
        input.addEventListener('focus', () => {
          inputActivated = true;
        });
      });

      // Attempt to type time when disabled (should be prevented)
      cy.get('.usa-time-picker__input')
        .type('2:30 PM', { force: true })
        .then(() => {
          // Time input should be completely blocked
          expect(timeChangeTriggered).to.be.false;
        });

      // Click attempts should not activate input
      cy.get('.usa-time-picker__input')
        .click({ force: true })
        .then(() => {
          expect(inputActivated).to.be.false;
        });

      // Input should remain disabled throughout
      cy.get('.usa-time-picker__input').should('be.disabled');
      cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--disabled');
      cy.get('.usa-time-picker__input').should('have.value', '');
    });

    it('should prevent dropdown interactions when disabled', () => {
      let dropdownOpened = false;
      let toggleClicked = false;
      let optionSelected = false;

      cy.mount(`
        <usa-time-picker
          id="disabled-dropdown-test"
          name="disabled-dropdown"
          show-dropdown
          disabled>
        </usa-time-picker>
      `);

      cy.window().then((win) => {
        const timePicker = win.document.getElementById('disabled-dropdown-test') as any;
        const toggle = timePicker.querySelector('.usa-time-picker__toggle') as HTMLButtonElement;

        // Listen for dropdown events (should not occur when disabled)
        timePicker.addEventListener('dropdown-open', () => {
          dropdownOpened = true;
        });
        toggle?.addEventListener('click', () => {
          toggleClicked = true;
        });

        // Listen for option selection (should not occur)
        timePicker.addEventListener('option-select', () => {
          optionSelected = true;
        });
      });

      // Attempt to open dropdown when disabled
      cy.get('.usa-time-picker__toggle')
        .click({ force: true })
        .then(() => {
          expect(dropdownOpened).to.be.false;
          expect(toggleClicked).to.be.false;
        });

      // Dropdown should not be visible
      cy.get('.usa-time-picker__list').should('not.exist').or('not.be.visible');

      // Toggle button should be disabled
      cy.get('.usa-time-picker__toggle').should('be.disabled');
    });

    it('should prevent keyboard input when disabled', () => {
      let keydownTriggered = false;
      let inputTriggered = false;
      let focusTriggered = false;

      cy.mount(`
        <usa-time-picker
          id="disabled-keyboard-test"
          name="disabled-keyboard"
          disabled>
        </usa-time-picker>
      `);

      cy.window().then((win) => {
        const timePicker = win.document.getElementById('disabled-keyboard-test') as any;
        const input = timePicker.querySelector('.usa-time-picker__input') as HTMLInputElement;

        // Listen for keyboard events (should be minimal when disabled)
        input.addEventListener('keydown', () => {
          keydownTriggered = true;
        });
        input.addEventListener('input', () => {
          inputTriggered = true;
        });
        input.addEventListener('focus', () => {
          focusTriggered = true;
        });
      });

      // Attempt keyboard interactions when disabled
      cy.get('.usa-time-picker__input').focus({ force: true });
      cy.get('.usa-time-picker__input').type('2:30 PM', { force: true });
      cy.get('.usa-time-picker__input').type('{downarrow}', { force: true });
      cy.get('.usa-time-picker__input').type('{enter}', { force: true });

      cy.wait(100).then(() => {
        // Most keyboard interactions should be prevented
        expect(inputTriggered).to.be.false;
      });

      // Input should not accept any text
      cy.get('.usa-time-picker__input').should('have.value', '');
      cy.get('.usa-time-picker__input').should('be.disabled');
    });

    it('should manage focus properly when disabled', () => {
      cy.mount(`
        <div>
          <input id="before-input" type="text" placeholder="Before">
          <usa-time-picker
            id="disabled-focus-test"
            name="disabled-focus"
            disabled>
          </usa-time-picker>
          <input id="after-input" type="text" placeholder="After">
        </div>
      `);

      // Time picker should not be focusable when disabled
      cy.get('.usa-time-picker__input').should('be.disabled');
      cy.get('.usa-time-picker__input').should('have.attr', 'tabindex', '-1');

      // Tab navigation should skip disabled time picker
      cy.get('#before-input').focus().tab();
      cy.focused().should('have.id', 'after-input');

      // Dropdown toggle should also not be focusable
      cy.get('.usa-time-picker__toggle').should('be.disabled');
    });

    it('should maintain consistent visual disabled state', () => {
      cy.mount(`
        <usa-time-picker
          id="visual-disabled-test"
          name="visual-disabled"
          show-dropdown
          disabled>
        </usa-time-picker>
      `);

      // Initial disabled state verification
      cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--disabled');
      cy.get('.usa-time-picker__input').should('be.disabled');
      cy.get('.usa-time-picker__input').should('have.attr', 'aria-disabled', 'true');
      cy.get('.usa-time-picker__toggle').should('be.disabled');

      // Attempt various interactions that might change visual state
      cy.get('.usa-time-picker__input').click({ force: true });
      cy.get('.usa-time-picker__input').hover();
      cy.get('.usa-time-picker__toggle').click({ force: true });
      cy.get('.usa-time-picker__toggle').hover();

      // Visual state should remain consistently disabled
      cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--disabled');
      cy.get('.usa-time-picker__input').should('be.disabled');
      cy.get('.usa-time-picker__input').should('have.attr', 'aria-disabled', 'true');
      cy.get('.usa-time-picker__toggle').should('be.disabled');

      // Should not show hover or active states
      cy.get('.usa-time-picker__input').should('not.have.class', 'usa-time-picker__input--hover');
      cy.get('.usa-time-picker__input').should('not.have.class', 'usa-time-picker__input--active');
      cy.get('.usa-time-picker__toggle').should('not.have.class', 'usa-time-picker__toggle--hover');
    });

    it('should prevent time clearing when disabled', () => {
      let timeCleared = false;
      let clearButtonClicked = false;

      // First enable and set a time
      cy.mount(`
        <usa-time-picker
          id="clear-disabled-test"
          name="clear-disabled"
          clearable>
        </usa-time-picker>
      `);

      // Set time while enabled
      cy.get('.usa-time-picker__input').type('3:00 PM');
      cy.get('.usa-time-picker__input').should('have.value', '3:00 PM');

      // Now disable the component
      cy.window().then((win) => {
        const timePicker = win.document.getElementById('clear-disabled-test') as any;
        timePicker.disabled = true;

        // Listen for clear events
        timePicker.addEventListener('time-clear', () => {
          timeCleared = true;
        });
      });

      cy.window().then((win) => {
        const clearButton = win.document.querySelector(
          '.usa-time-picker__clear-button'
        ) as HTMLButtonElement;
        if (clearButton) {
          clearButton.addEventListener('click', () => {
            clearButtonClicked = true;
          });
        }
      });

      // Attempt to clear time when disabled
      cy.get('.usa-time-picker__clear-button')
        .click({ force: true })
        .then(() => {
          expect(timeCleared).to.be.false;
        });

      // Time should still be present
      cy.get('.usa-time-picker__input').should('have.value', '3:00 PM');

      // Clear button should be disabled or hidden
      cy.get('.usa-time-picker__clear-button').should('be.disabled');
    });

    it('should ignore all interaction types when disabled', () => {
      let anyEventTriggered = false;
      const eventTypes = [
        'click',
        'dblclick',
        'mousedown',
        'mouseup',
        'focus',
        'blur',
        'keydown',
        'keyup',
        'input',
      ];

      cy.mount(`
        <usa-time-picker
          id="comprehensive-disabled-test"
          name="comprehensive-disabled"
          show-dropdown
          disabled>
        </usa-time-picker>
      `);

      cy.window().then((win) => {
        const timePicker = win.document.getElementById('comprehensive-disabled-test') as any;
        const input = timePicker.querySelector('.usa-time-picker__input') as HTMLInputElement;
        const toggle = timePicker.querySelector('.usa-time-picker__toggle') as HTMLButtonElement;

        // Listen for any significant events
        eventTypes.forEach((eventType) => {
          input.addEventListener(eventType, () => {
            anyEventTriggered = true;
          });
          toggle?.addEventListener(eventType, () => {
            anyEventTriggered = true;
          });
        });

        // Listen for component-specific events
        timePicker.addEventListener('change', () => {
          anyEventTriggered = true;
        });
        timePicker.addEventListener('time-select', () => {
          anyEventTriggered = true;
        });
        timePicker.addEventListener('dropdown-open', () => {
          anyEventTriggered = true;
        });
      });

      // Attempt comprehensive interactions
      cy.get('.usa-time-picker__input').click({ force: true });
      cy.get('.usa-time-picker__input').dblclick({ force: true });
      cy.get('.usa-time-picker__input').focus({ force: true });
      cy.get('.usa-time-picker__input').type('2:30 PM', { force: true });
      cy.get('.usa-time-picker__toggle').click({ force: true });

      cy.wait(100).then(() => {
        // Component should have ignored most interactions
        expect(anyEventTriggered).to.be.false;
      });

      // Component should remain in disabled state
      cy.get('.usa-time-picker__input').should('be.disabled');
      cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--disabled');
      cy.get('.usa-time-picker__input').should('have.value', '');
    });

    it('should handle disabled state transitions properly', () => {
      let stateTransitionHandled = false;

      cy.mount(`
        <usa-time-picker
          id="transition-test"
          name="transition-test"
          show-dropdown>
        </usa-time-picker>
      `);

      // Start enabled and set a time
      cy.get('.usa-time-picker__input').type('4:15 PM');
      cy.get('.usa-time-picker__input').should('have.value', '4:15 PM');

      // Transition to disabled
      cy.window().then((win) => {
        const timePicker = win.document.getElementById('transition-test') as any;
        timePicker.disabled = true;
        stateTransitionHandled = true;
      });

      cy.wait(100);

      // Should be properly disabled
      cy.get('.usa-time-picker__input').should('be.disabled');
      cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--disabled');
      cy.get('.usa-time-picker__toggle').should('be.disabled');

      // Time should still be visible but not editable
      cy.get('.usa-time-picker__input').should('have.value', '4:15 PM');

      // Transition back to enabled
      cy.window().then((win) => {
        const timePicker = win.document.getElementById('transition-test') as any;
        timePicker.disabled = false;
      });

      cy.wait(100);

      // Should be properly enabled again
      cy.get('.usa-time-picker__input').should('not.be.disabled');
      cy.get('.usa-time-picker').should('not.have.class', 'usa-time-picker--disabled');
      cy.get('.usa-time-picker__toggle').should('not.be.disabled');

      // Should be able to edit time again
      cy.get('.usa-time-picker__input').clear().type('5:30 PM');
      cy.get('.usa-time-picker__input').should('have.value', '5:30 PM');

      expect(stateTransitionHandled).to.be.true;
    });

    it('should respect disabled state in form contexts', () => {
      let formSubmitted = false;
      let disabledFieldIncluded = false;

      cy.mount(`
        <form id="disabled-form-test">
          <usa-time-picker
            id="disabled-form-input"
            name="disabled-time"
            disabled>
          </usa-time-picker>
          <usa-time-picker
            id="enabled-form-input"
            name="enabled-time">
          </usa-time-picker>
          <button type="submit">Submit</button>
        </form>
      `);

      // Set time in enabled input
      cy.get('#enabled-form-input .usa-time-picker__input').type('2:00 PM');

      cy.window().then((win) => {
        const form = win.document.getElementById('disabled-form-test') as HTMLFormElement;

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          formSubmitted = true;

          const formData = new FormData(form);
          if (formData.has('disabled-time')) {
            disabledFieldIncluded = true;
          }
        });
      });

      // Submit form
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
          expect(disabledFieldIncluded).to.be.false; // Disabled field should not be included
        });
    });

    it('should prevent programmatic value changes when disabled', () => {
      cy.mount(`
        <usa-time-picker
          id="programmatic-disabled-test"
          name="programmatic-disabled"
          disabled>
        </usa-time-picker>
      `);

      cy.window().then((win) => {
        const timePicker = win.document.getElementById('programmatic-disabled-test') as any;

        // Attempt to set value programmatically when disabled
        timePicker.value = '10:30 AM';
      });

      // Value should not be set when disabled
      cy.get('.usa-time-picker__input').should('have.value', '');

      // Component should remain disabled
      cy.get('.usa-time-picker__input').should('be.disabled');
      cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--disabled');
    });

    it('should maintain disabled state during validation attempts', () => {
      cy.mount(`
        <usa-time-picker
          id="validation-disabled-test"
          name="validation-disabled"
          required
          disabled>
        </usa-time-picker>
      `);

      // Attempt to trigger validation when disabled
      cy.get('.usa-time-picker__input').focus({ force: true }).blur({ force: true });

      // Should not show validation errors when disabled
      cy.get('.usa-time-picker__input').should('not.have.attr', 'aria-invalid', 'true');

      // Should remain disabled
      cy.get('.usa-time-picker__input').should('be.disabled');
      cy.get('.usa-time-picker').should('have.class', 'usa-time-picker--disabled');
    });
  });
});
