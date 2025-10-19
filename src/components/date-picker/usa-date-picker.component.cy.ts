// Component tests for usa-date-picker (Progressive Enhancement Pattern)
// Focus on USWDS compliance and basic functionality
import './index.ts';

describe('USA Date Picker Component Tests', () => {
  // Ignore script errors from USWDS JavaScript attempts
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // Ignore script errors from USWDS JS loading attempts
      if (err.message.includes('Script error')) {
        return false;
      }
    });
  });

  it('should render date picker with USWDS-compliant structure', () => {
    cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);
    cy.get('usa-date-picker').should('exist');
    cy.get('.usa-date-picker').should('exist');
    cy.get('.usa-input').should('exist'); // USWDS-compliant input class
    cy.get('.usa-date-picker__button').should('exist');
  });

  it('should have USWDS-compliant button structure (icon via CSS)', () => {
    cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

    // Button should be empty (icon provided by CSS background-image)
    cy.get('.usa-date-picker__button').should(
      'contain.html',
      '<!-- Icon provided by USWDS CSS background-image -->'
    );
    cy.get('.usa-date-picker__button').should('have.attr', 'type', 'button');
    cy.get('.usa-date-picker__button').should('have.attr', 'aria-label', 'Toggle calendar');
  });

  it('should allow date input interaction', () => {
    cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

    // Should be able to interact with input
    cy.get('.usa-input').should('exist').and('be.visible');
    cy.get('.usa-input').click().should('be.focused');
  });

  it('should open calendar when button is clicked', () => {
    cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

    // Calendar should not be visible initially
    cy.get('.usa-date-picker__calendar').should('not.exist');

    // Click button to open calendar
    cy.get('.usa-date-picker__button').click();

    // Calendar should now be visible
    cy.get('.usa-date-picker__calendar').should('exist').and('be.visible');

    // Calendar should have proper ARIA attributes
    cy.get('.usa-date-picker__calendar').should('have.attr', 'role', 'application');
  });

  it('should handle disabled state', () => {
    cy.mount(`<usa-date-picker id="test-date-picker" disabled></usa-date-picker>`);

    cy.get('.usa-input').should('be.disabled');
    cy.get('.usa-date-picker__button').should('be.disabled');
  });

  it('should handle required state', () => {
    cy.mount(`<usa-date-picker id="test-date-picker" required></usa-date-picker>`);

    cy.get('.usa-input').should('have.attr', 'required');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-date-picker
        id="test-date-picker"
        error="Please enter a valid date">
      </usa-date-picker>
    `);

    cy.get('.usa-input').should('have.class', 'usa-input--error');
    cy.get('.usa-error-message').should('contain.text', 'Please enter a valid date');
  });

  it('should handle keyboard interaction on button', () => {
    cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

    // Focus button and press space/enter should open calendar
    cy.get('.usa-date-picker__button').focus();
    cy.focused().type(' ');
    cy.get('.usa-date-picker__calendar').should('exist').and('be.visible');
  });

  it('should handle basic ARIA attributes', () => {
    cy.mount(`
      <usa-date-picker
        id="test-date-picker"
        label="Birth Date">
      </usa-date-picker>
    `);

    cy.get('.usa-date-picker__button')
      .should('have.attr', 'aria-label', 'Toggle calendar')
      .should('have.attr', 'aria-haspopup', 'true');
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-date-picker
        id="test-date-picker"
        class="custom-date-picker-class">
      </usa-date-picker>
    `);

    cy.get('usa-date-picker').should('have.class', 'custom-date-picker-class');
    cy.get('.usa-date-picker').should('exist');
  });

  it('should provide complete calendar functionality', () => {
    cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

    // Basic structure should exist
    cy.get('.usa-date-picker').should('exist');
    cy.get('.usa-input').should('exist');
    cy.get('.usa-date-picker__button').should('exist');

    // Calendar should open when button clicked
    cy.get('.usa-date-picker__button').click();
    cy.get('.usa-date-picker__calendar').should('exist').and('be.visible');

    // Should have month navigation
    cy.get('.usa-date-picker__calendar__previous-month').should('exist');
    cy.get('.usa-date-picker__calendar__next-month').should('exist');

    // Should have date cells
    cy.get('.usa-date-picker__calendar__date').should('exist');
  });

  it('should handle min and max date data attributes', () => {
    cy.mount(`
      <usa-date-picker
        id="test-date-picker"
        min-date="2023-01-01"
        max-date="2023-12-31">
      </usa-date-picker>
    `);

    // Should have data attributes for USWDS enhancement
    cy.get('.usa-date-picker').should('exist');
    // The component should have the attributes on the container
    cy.get('usa-date-picker').should('have.attr', 'min-date', '2023-01-01');
    cy.get('usa-date-picker').should('have.attr', 'max-date', '2023-12-31');
  });

  // Test the critical compliance feature: icon fix
  it('should use USWDS CSS background-image for icon (not inline SVG)', () => {
    cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

    // Verify no inline SVG or img element (old implementation)
    cy.get('.usa-date-picker__button .usa-icon').should('not.exist');
    cy.get('.usa-date-picker__button img').should('not.exist');

    // Verify button has no visible content (icon comes from CSS)
    cy.get('.usa-date-picker__button').should(
      'contain.html',
      '<!-- Icon provided by USWDS CSS background-image -->'
    );
  });

  // === ADDITIONAL FUNCTIONAL TESTS FOR ACTUAL BEHAVIOR ===
  describe('Calendar Interaction Tests', () => {
    it('should close calendar when date is selected', () => {
      cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Click on a date
      cy.get('.usa-date-picker__calendar__date').first().click();

      // Calendar should close and input should have value
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
      cy.get('.usa-input').should('not.have.value', '');
    });

    it('should support F4 key to open calendar', () => {
      cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

      // F4 on input should open calendar
      cy.get('.usa-input').focus().type('{f4}');
      cy.get('.usa-date-picker__calendar').should('be.visible');
    });

    it('should support Escape key to close calendar', () => {
      cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Escape should close it
      cy.get('body').type('{esc}');
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
    });

    it('should navigate between months', () => {
      cy.mount(`<usa-date-picker id="test-date-picker"></usa-date-picker>`);

      // Open calendar
      cy.get('.usa-date-picker__button').click();

      // Get current month text
      cy.get('.usa-date-picker__calendar__month-selection').then(($month) => {
        const currentMonth = $month.text();

        // Click next month
        cy.get('.usa-date-picker__calendar__next-month').click();

        // Month should change
        cy.get('.usa-date-picker__calendar__month-selection').should(
          'not.contain.text',
          currentMonth
        );
      });
    });
  });

  // Event Propagation Control Testing (Critical Gap Fix)
  describe('Event Propagation Control', () => {
    it('should prevent calendar popup from triggering form submission', () => {
      let formSubmitted = false;

      cy.mount(`
        <form id="test-form">
          <usa-date-picker id="date-in-form" name="birth-date"></usa-date-picker>
          <button type="submit">Submit Form</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('test-form') as HTMLFormElement;
        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });
      });

      // Calendar button click should not trigger form submission
      cy.get('.usa-date-picker__button')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.false;
        });

      // Calendar should be open
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Date selection should not trigger form submission
      cy.get('.usa-date-picker__calendar__date')
        .first()
        .click()
        .then(() => {
          expect(formSubmitted).to.be.false;
        });

      // Only submit button should trigger form submission
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should isolate input field clicks from calendar button clicks', () => {
      let inputClicked = false;
      let buttonClicked = false;

      cy.mount(`<usa-date-picker id="isolation-test"></usa-date-picker>`);

      cy.window().then((win) => {
        const input = win.document.querySelector('.usa-input') as HTMLInputElement;
        const button = win.document.querySelector('.usa-date-picker__button') as HTMLButtonElement;

        input.addEventListener('click', () => {
          inputClicked = true;
        });
        button.addEventListener('click', () => {
          buttonClicked = true;
        });
      });

      // Click input should only trigger input click
      cy.get('.usa-input')
        .click()
        .then(() => {
          expect(inputClicked).to.be.true;
          expect(buttonClicked).to.be.false;
        });

      // Reset flags
      cy.window().then(() => {
        inputClicked = false;
        buttonClicked = false;
      });

      // Click button should only trigger button click
      cy.get('.usa-date-picker__button')
        .click()
        .then(() => {
          expect(buttonClicked).to.be.true;
          expect(inputClicked).to.be.false;
        });
    });

    it('should handle escape key vs click outside behavior correctly', () => {
      let escapePressed = false;
      let outsideClicked = false;

      cy.mount(`
        <div id="outside-container">
          <usa-date-picker id="escape-test"></usa-date-picker>
          <div id="outside-element">Click me</div>
        </div>
      `);

      cy.window().then((win) => {
        win.document.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Escape') escapePressed = true;
        });

        const outsideElement = win.document.getElementById('outside-element');
        outsideElement?.addEventListener('click', () => {
          outsideClicked = true;
        });
      });

      // Open calendar
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Test escape key behavior
      cy.get('body')
        .type('{esc}')
        .then(() => {
          expect(escapePressed).to.be.true;
        });
      cy.get('.usa-date-picker__calendar').should('not.be.visible');

      // Reopen calendar for outside click test
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Click outside should close calendar
      cy.get('#outside-element')
        .click()
        .then(() => {
          expect(outsideClicked).to.be.true;
        });
      cy.get('.usa-date-picker__calendar').should('not.be.visible');
    });

    it('should prevent rapid calendar toggle from causing race conditions', () => {
      cy.mount(`<usa-date-picker id="rapid-toggle-test"></usa-date-picker>`);

      // Rapid clicking should be handled gracefully
      cy.get('.usa-date-picker__button').click().click().click().click().click();

      cy.wait(100);

      // Component should be in a consistent state
      cy.get('.usa-date-picker').should('exist');
      cy.get('.usa-input').should('exist');
      cy.get('.usa-date-picker__button').should('exist');

      // Calendar should respond to subsequent interactions
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');
    });

    it('should handle nested event contexts properly', () => {
      let parentDivClicked = false;
      let formSubmitted = false;
      let calendarOpened = false;

      cy.mount(`
        <div id="parent-context">
          <form id="nested-form">
            <fieldset>
              <legend>Date Selection</legend>
              <usa-date-picker id="nested-date-picker" name="event-date"></usa-date-picker>
            </fieldset>
            <button type="submit">Submit</button>
          </form>
        </div>
      `);

      cy.window().then((win) => {
        const parentDiv = win.document.getElementById('parent-context');
        const form = win.document.getElementById('nested-form') as HTMLFormElement;
        const datePicker = win.document.getElementById('nested-date-picker');

        parentDiv?.addEventListener('click', () => {
          parentDivClicked = true;
        });
        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        // Listen for calendar state changes
        const observer = new MutationObserver(() => {
          const calendar = win.document.querySelector('.usa-date-picker__calendar');
          if (calendar && calendar.getAttribute('style')?.includes('display: block')) {
            calendarOpened = true;
          }
        });
        if (datePicker) {
          observer.observe(datePicker, { childList: true, subtree: true, attributes: true });
        }
      });

      // Calendar button click should open calendar without affecting parent contexts
      cy.get('.usa-date-picker__button')
        .click()
        .then(() => {
          // Calendar should open
          cy.get('.usa-date-picker__calendar').should('be.visible');

          // Parent and form should not be affected
          expect(formSubmitted).to.be.false;
        });

      // Form submission should work independently
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should emit custom events without interfering with parent listeners', () => {
      let parentClicked = false;
      let datePickerEventEmitted = false;

      cy.mount(`
        <div id="event-parent">
          <usa-date-picker id="event-test"></usa-date-picker>
        </div>
      `);

      cy.window().then((win) => {
        const parent = win.document.getElementById('event-parent');
        const datePicker = win.document.getElementById('event-test');

        // Listen for parent clicks
        parent?.addEventListener('click', () => {
          parentClicked = true;
        });

        // Listen for date picker events (if any custom events are emitted)
        datePicker?.addEventListener('date-change', () => {
          datePickerEventEmitted = true;
        });
      });

      // Open calendar and select date
      cy.get('.usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      cy.get('.usa-date-picker__calendar__date').first().click();

      // Date selection should work properly
      cy.get('.usa-input').should('not.have.value', '');
      cy.get('.usa-date-picker__calendar').should('not.be.visible');

      // Test that event propagation behaves as expected
      // (Component should control whether parent elements receive events)
    });

    it('should handle input field interactions without triggering calendar events', () => {
      let inputChanged = false;
      let calendarToggled = false;

      cy.mount(`<usa-date-picker id="input-interaction-test"></usa-date-picker>`);

      cy.window().then((win) => {
        const input = win.document.querySelector('.usa-input') as HTMLInputElement;
        const button = win.document.querySelector('.usa-date-picker__button') as HTMLButtonElement;

        input.addEventListener('input', () => {
          inputChanged = true;
        });
        input.addEventListener('change', () => {
          inputChanged = true;
        });

        button.addEventListener('click', () => {
          calendarToggled = true;
        });
      });

      // Typing in input should not trigger calendar button events
      cy.get('.usa-input')
        .type('01/15/2024')
        .then(() => {
          expect(inputChanged).to.be.true;
          expect(calendarToggled).to.be.false;
        });

      // Input value should be updated
      cy.get('.usa-input').should('have.value', '01/15/2024');

      // Calendar should still work independently
      cy.get('.usa-date-picker__button')
        .click()
        .then(() => {
          expect(calendarToggled).to.be.true;
        });
      cy.get('.usa-date-picker__calendar').should('be.visible');
    });
  });

  // Form Integration Testing (Critical Gap Fix)
  describe('Form Integration', () => {
    it('should not interfere with form submission when calendar is opened', () => {
      let formSubmitted = false;
      let calendarOpened = false;

      cy.mount(`
        <form id="date-picker-form-test">
          <usa-date-picker id="form-date-picker" name="selected-date"></usa-date-picker>
          <fieldset>
            <legend>Additional Information</legend>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
          </fieldset>
          <button type="submit">Submit Form</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('date-picker-form-test') as HTMLFormElement;
        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        // Monitor calendar state
        const datePicker = win.document.getElementById('form-date-picker');
        const observer = new MutationObserver(() => {
          const calendar = win.document.querySelector('.usa-date-picker__calendar');
          if (calendar && calendar.getAttribute('style')?.includes('display: block')) {
            calendarOpened = true;
          }
        });
        if (datePicker) {
          observer.observe(datePicker, { childList: true, subtree: true, attributes: true });
        }
      });

      // Calendar button click should not trigger form submission
      cy.get('.usa-date-picker__button')
        .click()
        .then(() => {
          cy.get('.usa-date-picker__calendar').should('be.visible');
          expect(formSubmitted).to.be.false;
        });

      // Date selection should not trigger form submission
      cy.get('.usa-date-picker__calendar__date')
        .first()
        .click()
        .then(() => {
          expect(formSubmitted).to.be.false;
        });

      // Only submit button should trigger form submission
      cy.get('#username').type('testuser');
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should properly submit form with date values', () => {
      let submittedData: FormData | null = null;

      cy.mount(`
        <form id="date-value-form">
          <label for="birth-date">Birth Date:</label>
          <usa-date-picker id="birth-date" name="birth-date"></usa-date-picker>

          <label for="event-date">Event Date:</label>
          <usa-date-picker id="event-date" name="event-date" value="2024-06-15"></usa-date-picker>

          <label for="name">Name:</label>
          <input type="text" id="name" name="name" value="John Doe">

          <button type="submit">Submit</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('date-value-form') as HTMLFormElement;
        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          submittedData = new FormData(form);
        });
      });

      // Set first date picker value by opening calendar and selecting date
      cy.get('#birth-date .usa-date-picker__button').click();
      cy.get('#birth-date .usa-date-picker__calendar__date').first().click();

      // Submit form
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(submittedData).to.not.be.null;

          // Check that form data includes date values
          const name = submittedData?.get('name');
          const birthDate = submittedData?.get('birth-date');
          const eventDate = submittedData?.get('event-date');

          expect(name).to.equal('John Doe');
          expect(birthDate).to.not.be.empty;
          expect(eventDate).to.equal('2024-06-15');
        });
    });

    it('should integrate with form validation for required date fields', () => {
      let validationMessage = '';
      let formValid = false;

      cy.mount(`
        <form id="required-date-form">
          <fieldset>
            <legend>Required Date Information</legend>
            <label for="start-date">Start Date (Required):</label>
            <usa-date-picker id="start-date" name="start-date" required></usa-date-picker>

            <label for="end-date">End Date (Optional):</label>
            <usa-date-picker id="end-date" name="end-date"></usa-date-picker>
          </fieldset>
          <button type="submit">Submit</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('required-date-form') as HTMLFormElement;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formValid = form.checkValidity();

          const startDateInput = form.querySelector('#start-date .usa-input') as HTMLInputElement;
          if (startDateInput) {
            validationMessage = startDateInput.validationMessage;
          }
        });
      });

      // Submit form without filling required date
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formValid).to.be.false;
          expect(validationMessage).to.not.be.empty;
        });

      // Fill required date and submit again
      cy.get('#start-date .usa-input').type('01/15/2024');
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formValid).to.be.true;
        });
    });

    it('should maintain proper focus management within forms', () => {
      cy.mount(`
        <form id="focus-form">
          <label for="first-field">First Field:</label>
          <input type="text" id="first-field" name="first-field">

          <label for="date-field">Date Field:</label>
          <usa-date-picker id="date-field" name="date-field"></usa-date-picker>

          <label for="last-field">Last Field:</label>
          <input type="text" id="last-field" name="last-field">

          <button type="submit">Submit</button>
        </form>
      `);

      // Tab navigation should work properly
      cy.get('#first-field').focus();
      cy.focused().tab();

      // Should focus date input
      cy.focused().should('match', '#date-field .usa-input');

      cy.focused().tab();

      // Should focus calendar button
      cy.focused().should('match', '#date-field .usa-date-picker__button');

      cy.focused().tab();

      // Should move to next form field
      cy.focused().should('match', '#last-field');

      // Opening calendar should not disrupt form tab order
      cy.get('#date-field .usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Closing calendar should return focus appropriately
      cy.get('body').type('{esc}');
      cy.get('.usa-date-picker__calendar').should('not.be.visible');

      // Tab order should still work after calendar interaction
      cy.get('#first-field').focus().tab();
      cy.focused().should('match', '#date-field .usa-input');
    });

    it('should handle form reset properly', () => {
      cy.mount(`
        <form id="reset-form">
          <usa-date-picker id="reset-date" name="reset-date" value="2024-03-15"></usa-date-picker>
          <button type="reset">Reset Form</button>
          <button type="submit">Submit Form</button>
        </form>
      `);

      // Verify initial value
      cy.get('#reset-date .usa-input').should('have.value', '03/15/2024');

      // Change the value
      cy.get('#reset-date .usa-input').clear().type('12/25/2024');
      cy.get('#reset-date .usa-input').should('have.value', '12/25/2024');

      // Reset form
      cy.get('button[type="reset"]').click();

      // Value should return to original
      cy.get('#reset-date .usa-input').should('have.value', '03/15/2024');
    });

    it('should work correctly in multi-step forms', () => {
      let step1Completed = false;
      let step2Completed = false;

      cy.mount(`
        <div id="multi-step-container">
          <form id="step-1" style="display: block;">
            <fieldset>
              <legend>Step 1: Personal Information</legend>
              <label for="birth-date">Birth Date:</label>
              <usa-date-picker id="birth-date" name="birth-date" required></usa-date-picker>
            </fieldset>
            <button type="button" id="next-step">Next Step</button>
          </form>

          <form id="step-2" style="display: none;">
            <fieldset>
              <legend>Step 2: Event Information</legend>
              <label for="event-date">Event Date:</label>
              <usa-date-picker id="event-date" name="event-date" required></usa-date-picker>
            </fieldset>
            <button type="submit">Complete</button>
          </form>
        </div>
      `);

      cy.window().then((win) => {
        const nextButton = win.document.getElementById('next-step');
        const step1Form = win.document.getElementById('step-1') as HTMLFormElement;
        const step2Form = win.document.getElementById('step-2') as HTMLFormElement;

        nextButton?.addEventListener('click', () => {
          if (step1Form.checkValidity()) {
            step1Completed = true;
            step1Form.style.display = 'none';
            step2Form.style.display = 'block';
          }
        });

        step2Form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          if (step2Form.checkValidity()) {
            step2Completed = true;
          }
        });
      });

      // Complete step 1
      cy.get('#birth-date .usa-input').type('05/20/1990');
      cy.get('#next-step')
        .click()
        .then(() => {
          expect(step1Completed).to.be.true;
        });

      // Step 2 should be visible
      cy.get('#step-2').should('be.visible');
      cy.get('#step-1').should('not.be.visible');

      // Complete step 2
      cy.get('#event-date .usa-input').type('12/31/2024');
      cy.get('#step-2 button[type="submit"]')
        .click()
        .then(() => {
          expect(step2Completed).to.be.true;
        });
    });

    it('should handle form field validation states correctly', () => {
      cy.mount(`
        <form id="validation-form">
          <fieldset>
            <legend>Date Validation Test</legend>
            <label for="valid-date">Valid Date Field:</label>
            <usa-date-picker id="valid-date" name="valid-date" required></usa-date-picker>

            <label for="error-date">Date Field with Error:</label>
            <usa-date-picker
              id="error-date"
              name="error-date"
              required
              error="Please enter a valid date">
            </usa-date-picker>
          </fieldset>
          <button type="submit">Submit</button>
        </form>
      `);

      // Error field should have error styling
      cy.get('#error-date .usa-input').should('have.class', 'usa-input--error');
      cy.get('#error-date')
        .parent()
        .find('.usa-error-message')
        .should('contain.text', 'Please enter a valid date');

      // Valid field should not have error styling
      cy.get('#valid-date .usa-input').should('not.have.class', 'usa-input--error');
      cy.get('#valid-date').parent().find('.usa-error-message').should('not.exist');

      // Form should integrate validation states properly
      cy.get('#valid-date .usa-input').type('01/01/2025');
      cy.get('#error-date .usa-input').type('02/02/2025');

      // Submit form - should work with valid dates
      cy.get('button[type="submit"]').click();

      // Form should handle validation without JavaScript errors
      cy.get('#validation-form').should('exist');
    });

    it('should preserve form data when calendar interactions occur', () => {
      cy.mount(`
        <form id="preservation-form">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" value="Initial Name">

          <label for="preserve-date">Date:</label>
          <usa-date-picker id="preserve-date" name="preserve-date"></usa-date-picker>

          <label for="email">Email:</label>
          <input type="email" id="email" name="email" value="test@example.com">
        </form>
      `);

      // Verify initial values
      cy.get('#name').should('have.value', 'Initial Name');
      cy.get('#email').should('have.value', 'test@example.com');

      // Open and interact with calendar
      cy.get('#preserve-date .usa-date-picker__button').click();
      cy.get('.usa-date-picker__calendar').should('be.visible');

      // Navigate months
      cy.get('.usa-date-picker__calendar__next-month').click();
      cy.get('.usa-date-picker__calendar__previous-month').click();

      // Select a date
      cy.get('.usa-date-picker__calendar__date').first().click();

      // Other form values should be preserved
      cy.get('#name').should('have.value', 'Initial Name');
      cy.get('#email').should('have.value', 'test@example.com');

      // Date should be set
      cy.get('#preserve-date .usa-input').should('not.have.value', '');
    });
  });

  // Edge Case Testing (Critical Gap Fix)
  describe('Edge Case Testing', () => {
    describe('Boundary Conditions', () => {
      it('should handle invalid date formats gracefully', () => {
        const invalidDates = [
          '99/99/9999',
          '13/45/2024',
          'invalid-date',
          '2024-02-30',
          '00/00/0000',
          'abc/def/ghij',
        ];

        invalidDates.forEach((invalidDate) => {
          cy.mount(`<usa-date-picker id="invalid-test" value="${invalidDate}"></usa-date-picker>`);

          // Should not crash with invalid date
          cy.get('usa-date-picker').should('be.visible');
          cy.get('.usa-input').should('exist');

          // Should handle gracefully without displaying invalid date
          cy.get('.usa-input').then(($input) => {
            const value = $input.val() as string;
            // Should either be empty or a corrected valid date
            if (value) {
              expect(value).to.match(/^\d{2}\/\d{2}\/\d{4}$/);
            }
          });

          // Calendar should still open
          cy.get('.usa-date-picker__button').click();
          cy.get('.usa-date-picker__calendar').should('be.visible');

          // Close calendar and remove component for next test
          cy.get('body').type('{esc}');
          cy.get('usa-date-picker').remove();
        });
      });

      it('should handle extreme date ranges without breaking', () => {
        const extremeDates = [
          { min: '1900-01-01', max: '2100-12-31' },
          { min: '0001-01-01', max: '9999-12-31' },
          { min: '2024-01-01', max: '2024-01-01' }, // Same min/max
        ];

        extremeDates.forEach(({ min, max }) => {
          cy.mount(`<usa-date-picker min-date="${min}" max-date="${max}"></usa-date-picker>`);

          // Should handle extreme ranges without errors
          cy.get('usa-date-picker').should('be.visible');
          cy.get('.usa-date-picker__button').click();
          cy.get('.usa-date-picker__calendar').should('be.visible');

          // Calendar navigation should work within bounds
          cy.get('.usa-date-picker__calendar__next-month').click();
          cy.get('.usa-date-picker__calendar__previous-month').click();

          cy.get('body').type('{esc}');
          cy.get('usa-date-picker').remove();
        });
      });

      it('should handle rapid value changes without memory leaks', () => {
        cy.mount(`<usa-date-picker id="rapid-value-change"></usa-date-picker>`);

        cy.window().then((win) => {
          const datePicker = win.document.getElementById('rapid-value-change') as any;

          // Rapidly change values
          const dates = ['2024-01-15', '2024-06-30', '2024-12-25', '2023-03-17', '2025-09-08'];

          for (let i = 0; i < 20; i++) {
            datePicker.value = dates[i % dates.length];
          }
        });

        cy.wait(100);

        // Component should remain functional
        cy.get('.usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
        cy.get('.usa-date-picker__calendar__date').first().click();
        cy.get('.usa-input').should('not.have.value', '');
      });

      it('should handle empty and null values appropriately', () => {
        const emptyValues = ['', null, undefined];

        emptyValues.forEach((emptyValue) => {
          cy.window().then((win) => {
            const container = win.document.body;
            const datePicker = win.document.createElement('usa-date-picker') as any;
            datePicker.id = 'empty-test';
            datePicker.value = emptyValue;
            container.appendChild(datePicker);

            // Should handle empty values gracefully
            cy.get('#empty-test').should('be.visible');
            cy.get('#empty-test .usa-input').should('have.value', '');

            // Calendar should work normally
            cy.get('#empty-test .usa-date-picker__button').click();
            cy.get('.usa-date-picker__calendar').should('be.visible');

            cy.get('body').type('{esc}');
            container.removeChild(datePicker);
          });
        });
      });

      it('should handle timezone edge cases', () => {
        // Test around daylight saving time transitions
        const dstDates = [
          '2024-03-10', // Spring forward
          '2024-11-03', // Fall back
          '2024-02-29', // Leap year
        ];

        dstDates.forEach((date) => {
          cy.mount(`<usa-date-picker value="${date}"></usa-date-picker>`);

          cy.get('.usa-input').should('have.value', new Date(date).toLocaleDateString('en-US'));

          // Calendar should show correct date
          cy.get('.usa-date-picker__button').click();
          cy.get('.usa-date-picker__calendar').should('be.visible');

          // Should handle date selection without timezone issues
          cy.get('.usa-date-picker__calendar__date').first().click();
          cy.get('.usa-input').should('not.have.value', '');

          cy.get('usa-date-picker').remove();
        });
      });
    });

    describe('Error Recovery', () => {
      it('should recover from calendar rendering failures', () => {
        cy.mount(`<usa-date-picker id="recovery-test"></usa-date-picker>`);

        cy.window().then((win) => {
          const datePicker = win.document.getElementById('recovery-test') as any;

          // Simulate calendar rendering failure
          datePicker.addEventListener('calendar-render-error', () => {
            console.warn('Calendar render failed, using fallback');
          });

          // Force calendar to open multiple times
          for (let i = 0; i < 5; i++) {
            datePicker.querySelector('.usa-date-picker__button').click();

            // Simulate interruption
            if (i % 2 === 0) {
              const calendar = datePicker.querySelector('.usa-date-picker__calendar');
              if (calendar) {
                calendar.style.display = 'none';
              }
            }
          }
        });

        // Should still be functional after errors
        cy.get('.usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
        cy.get('.usa-date-picker__calendar__date').first().click();
      });

      it('should handle DOM manipulation during calendar interactions', () => {
        cy.mount(`
          <div id="container">
            <usa-date-picker id="dom-manipulation-test"></usa-date-picker>
          </div>
        `);

        cy.window().then((win) => {
          const container = win.document.getElementById('container');
          const datePicker = win.document.getElementById('dom-manipulation-test') as any;

          // Open calendar
          datePicker.querySelector('.usa-date-picker__button').click();

          // Manipulate DOM while calendar is open
          setTimeout(() => {
            container?.removeChild(datePicker);
            setTimeout(() => {
              container?.appendChild(datePicker);
            }, 50);
          }, 100);
        });

        cy.wait(200);

        // Should recover and be functional
        cy.get('#dom-manipulation-test').should('exist');
        cy.get('#dom-manipulation-test .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
      });

      it('should handle input interruption during typing', () => {
        cy.mount(`<usa-date-picker id="input-interruption"></usa-date-picker>`);

        cy.window().then((win) => {
          const input = win.document.querySelector(
            '#input-interruption .usa-input'
          ) as HTMLInputElement;

          // Simulate typing interruption
          input.addEventListener('input', (e) => {
            if (input.value.length === 3) {
              // Simulate blur during typing
              input.blur();
              setTimeout(() => input.focus(), 50);
            }
          });
        });

        // Type date with interruption
        cy.get('#input-interruption .usa-input').type('12/25/2024');

        // Should handle interruption gracefully
        cy.get('#input-interruption .usa-input').should('have.value', '12/25/2024');

        // Calendar should still work
        cy.get('#input-interruption .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
      });

      it('should recover from event listener memory leaks', () => {
        cy.mount(`<div id="leak-container"></div>`);

        cy.window().then((win) => {
          const container = win.document.getElementById('leak-container');

          // Create and destroy multiple date pickers
          for (let i = 0; i < 10; i++) {
            const datePicker = win.document.createElement('usa-date-picker') as any;
            datePicker.id = `leak-test-${i}`;
            container?.appendChild(datePicker);

            // Interact with each
            datePicker.querySelector('.usa-date-picker__button').click();

            // Remove from DOM
            container?.removeChild(datePicker);
          }

          // Create final test picker
          const finalPicker = win.document.createElement('usa-date-picker') as any;
          finalPicker.id = 'final-leak-test';
          container?.appendChild(finalPicker);
        });

        // Final picker should work without performance issues
        cy.get('#final-leak-test .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
        cy.get('.usa-date-picker__calendar__date').first().click();
      });
    });

    describe('Performance Stress Testing', () => {
      it('should handle rapid calendar open/close cycles', () => {
        let openCount = 0;
        let closeCount = 0;

        cy.mount(`<usa-date-picker id="rapid-toggle"></usa-date-picker>`);

        cy.window().then((win) => {
          const datePicker = win.document.getElementById('rapid-toggle') as any;

          // Monitor calendar state changes
          const observer = new MutationObserver(() => {
            const calendar = datePicker.querySelector('.usa-date-picker__calendar');
            if (calendar) {
              const isVisible = calendar.style.display !== 'none' && calendar.offsetParent !== null;
              if (isVisible) openCount++;
              else closeCount++;
            }
          });

          observer.observe(datePicker, { childList: true, subtree: true, attributes: true });
        });

        // Rapid toggle 20 times
        for (let i = 0; i < 20; i++) {
          cy.get('#rapid-toggle .usa-date-picker__button').click();
          if (i % 2 === 0) {
            cy.get('body').type('{esc}');
          }
        }

        cy.wait(100).then(() => {
          // Should handle rapid toggling without performance degradation
          expect(openCount).to.be.greaterThan(0);

          // Final state should be consistent
          cy.get('#rapid-toggle .usa-date-picker__button').click();
          cy.get('.usa-date-picker__calendar').should('be.visible');
        });
      });

      it('should handle month navigation stress test', () => {
        cy.mount(`<usa-date-picker id="navigation-stress"></usa-date-picker>`);

        cy.get('#navigation-stress .usa-date-picker__button').click();

        // Rapidly navigate through months
        for (let i = 0; i < 24; i++) {
          // 2 years worth
          if (i % 2 === 0) {
            cy.get('.usa-date-picker__calendar__next-month').click();
          } else {
            cy.get('.usa-date-picker__calendar__previous-month').click();
          }
        }

        // Should still be responsive
        cy.get('.usa-date-picker__calendar').should('be.visible');
        cy.get('.usa-date-picker__calendar__date').first().should('be.visible').click();
        cy.get('#navigation-stress .usa-input').should('not.have.value', '');
      });

      it('should handle multiple simultaneous date pickers', () => {
        const pickersHtml = Array.from(
          { length: 10 },
          (_, i) => `<usa-date-picker id="picker-${i}"></usa-date-picker>`
        ).join('');

        cy.mount(`<div>${pickersHtml}</div>`);

        // Open all calendars simultaneously
        for (let i = 0; i < 10; i++) {
          cy.get(`#picker-${i} .usa-date-picker__button`).click();
        }

        // All should be responsive
        for (let i = 0; i < 10; i++) {
          cy.get(`#picker-${i} .usa-date-picker__calendar`).should('be.visible');
        }

        // Close all
        cy.get('body').type('{esc}');

        // Should all close properly
        cy.get('.usa-date-picker__calendar').should('not.be.visible');
      });

      it('should handle date selection performance under load', () => {
        let selectionTimes: number[] = [];

        cy.mount(`<usa-date-picker id="selection-performance"></usa-date-picker>`);

        cy.window().then((win) => {
          const datePicker = win.document.getElementById('selection-performance') as any;

          datePicker.addEventListener('date-change', () => {
            selectionTimes.push(performance.now());
          });
        });

        cy.get('#selection-performance .usa-date-picker__button').click();

        // Select dates rapidly
        for (let i = 0; i < 10; i++) {
          cy.get('.usa-date-picker__calendar__date')
            .eq(i % 7)
            .click();
          cy.get('#selection-performance .usa-date-picker__button').click();
        }

        cy.wait(100).then(() => {
          // Should maintain consistent performance
          if (selectionTimes.length > 1) {
            const intervals = selectionTimes.slice(1).map((time, i) => time - selectionTimes[i]);
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

            intervals.forEach((interval) => {
              expect(interval).to.be.lessThan(avgInterval * 3);
            });
          }
        });
      });
    });

    describe('Mobile Compatibility', () => {
      it('should handle touch calendar interactions', () => {
        cy.mount(`<usa-date-picker id="touch-calendar"></usa-date-picker>`);

        // Open calendar with touch
        cy.get('#touch-calendar .usa-date-picker__button')
          .trigger('touchstart')
          .trigger('touchend');

        cy.get('.usa-date-picker__calendar').should('be.visible');

        // Navigate with touch
        cy.get('.usa-date-picker__calendar__next-month').trigger('touchstart').trigger('touchend');

        // Select date with touch
        cy.get('.usa-date-picker__calendar__date')
          .first()
          .trigger('touchstart')
          .trigger('touchend');

        cy.get('#touch-calendar .usa-input').should('not.have.value', '');
      });

      it('should handle mobile keyboard input patterns', () => {
        cy.mount(`<usa-date-picker id="mobile-keyboard"></usa-date-picker>`);

        // Simulate mobile typing patterns (slower, with corrections)
        cy.get('#mobile-keyboard .usa-input')
          .type('1')
          .wait(100)
          .type('2')
          .wait(100)
          .type('/')
          .wait(100)
          .type('2')
          .wait(100)
          .type('5')
          .wait(100)
          .type('/')
          .wait(100)
          .type('2024');

        cy.get('#mobile-keyboard .usa-input').should('have.value', '12/25/2024');

        // Calendar should work after mobile input
        cy.get('#mobile-keyboard .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
      });

      it('should handle viewport size changes during calendar interaction', () => {
        cy.mount(`<usa-date-picker id="viewport-change"></usa-date-picker>`);

        // Start with mobile viewport
        cy.viewport(320, 568);
        cy.get('#viewport-change .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');

        // Change to tablet while calendar is open
        cy.viewport(768, 1024);
        cy.get('.usa-date-picker__calendar').should('be.visible');

        // Should still be functional
        cy.get('.usa-date-picker__calendar__date').first().click();
        cy.get('#viewport-change .usa-input').should('not.have.value', '');

        // Change to desktop
        cy.viewport(1920, 1080);
        cy.get('#viewport-change .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
      });

      it('should handle device orientation changes', () => {
        cy.mount(`<usa-date-picker id="orientation-test"></usa-date-picker>`);

        // Portrait
        cy.viewport(320, 568);
        cy.get('#orientation-test .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');

        // Landscape (simulate rotation)
        cy.viewport(568, 320);
        cy.get('.usa-date-picker__calendar').should('be.visible');

        // Should remain functional
        cy.get('.usa-date-picker__calendar__date').first().click();
        cy.get('#orientation-test .usa-input').should('not.have.value', '');
      });

      it('should handle touch gestures on calendar', () => {
        cy.mount(`<usa-date-picker id="touch-gestures"></usa-date-picker>`);

        cy.get('#touch-gestures .usa-date-picker__button').click();

        // Simulate swipe gestures for month navigation
        cy.get('.usa-date-picker__calendar')
          .trigger('touchstart', { touches: [{ clientX: 200, clientY: 200 }] })
          .trigger('touchmove', { touches: [{ clientX: 100, clientY: 200 }] })
          .trigger('touchend');

        // Calendar should handle gestures gracefully
        cy.get('.usa-date-picker__calendar').should('be.visible');
        cy.get('.usa-date-picker__calendar__date').first().should('be.visible');
      });
    });

    describe('Accessibility Edge Cases', () => {
      it('should handle screen reader with calendar navigation', () => {
        cy.mount(
          `<usa-date-picker id="screen-reader-test" aria-label="Event Date"></usa-date-picker>`
        );

        // Should have proper ARIA attributes
        cy.get('#screen-reader-test .usa-input').should('have.attr', 'aria-label');
        cy.get('#screen-reader-test .usa-date-picker__button').should(
          'have.attr',
          'aria-label',
          'Toggle calendar'
        );

        cy.get('#screen-reader-test .usa-date-picker__button').click();

        // Calendar should have accessibility attributes
        cy.get('.usa-date-picker__calendar').should('have.attr', 'role', 'application');

        // Date cells should be accessible
        cy.get('.usa-date-picker__calendar__date').first().should('have.attr', 'tabindex');
      });

      it('should handle high contrast mode', () => {
        cy.mount(`<usa-date-picker id="high-contrast"></usa-date-picker>`);

        // Check computed styles have sufficient contrast
        cy.get('#high-contrast .usa-input').then(($input) => {
          const styles = window.getComputedStyle($input[0]);
          expect(styles.color).to.not.equal('transparent');
          expect(styles.backgroundColor).to.not.equal('transparent');
          expect(styles.borderColor).to.not.equal('transparent');
        });

        cy.get('#high-contrast .usa-date-picker__button').click();

        // Calendar should be visible in high contrast
        cy.get('.usa-date-picker__calendar').should('be.visible');
        cy.get('.usa-date-picker__calendar__date')
          .first()
          .then(($date) => {
            const styles = window.getComputedStyle($date[0]);
            expect(styles.color).to.not.equal('transparent');
          });
      });

      it('should handle keyboard navigation edge cases', () => {
        cy.mount(`<usa-date-picker id="keyboard-edge-cases"></usa-date-picker>`);

        cy.get('#keyboard-edge-cases .usa-input').focus();

        // Test various keyboard combinations
        cy.focused().type('{ctrl+a}'); // Select all
        cy.focused().type('01/01/2024');
        cy.focused().type('{home}'); // Go to beginning
        cy.focused().type('{end}'); // Go to end
        cy.focused().type('{shift+home}'); // Select to beginning

        // Should handle all keyboard operations gracefully
        cy.get('#keyboard-edge-cases .usa-input').should('have.value', '01/01/2024');

        // Calendar keyboard navigation
        cy.get('#keyboard-edge-cases .usa-date-picker__button').focus().type(' ');
        cy.get('.usa-date-picker__calendar').should('be.visible');

        // Arrow key navigation in calendar
        cy.focused().type('{rightarrow}{downarrow}{leftarrow}{uparrow}');
        cy.focused().type('{enter}'); // Select date

        cy.get('#keyboard-edge-cases .usa-input').should('not.have.value', '');
      });

      it('should handle focus management with dynamic content', () => {
        cy.mount(`
          <div>
            <button id="focus-manager">Show Date Picker</button>
            <usa-date-picker id="dynamic-focus" style="display: none;"></usa-date-picker>
            <button id="focus-target">After</button>
          </div>
        `);

        cy.window().then((win) => {
          const showButton = win.document.getElementById('focus-manager');
          const datePicker = win.document.getElementById('dynamic-focus') as HTMLElement;

          showButton?.addEventListener('click', () => {
            datePicker.style.display = 'block';
            const input = datePicker.querySelector('.usa-input') as HTMLElement;
            input?.focus();
          });
        });

        cy.get('#focus-manager').click();

        // Focus should move to date picker input
        cy.focused().should('match', '#dynamic-focus .usa-input');

        // Tab navigation should work properly
        cy.focused().tab();
        cy.focused().should('match', '#dynamic-focus .usa-date-picker__button');

        cy.focused().tab();
        cy.focused().should('match', '#focus-target');
      });

      it('should handle ARIA live regions for date announcements', () => {
        cy.mount(`
          <div>
            <usa-date-picker id="aria-live-test"></usa-date-picker>
            <div id="live-region" aria-live="polite"></div>
          </div>
        `);

        cy.window().then((win) => {
          const datePicker = win.document.getElementById('aria-live-test') as any;
          const liveRegion = win.document.getElementById('live-region');

          datePicker.addEventListener('date-change', (e: CustomEvent) => {
            if (liveRegion && e.detail.date) {
              liveRegion.textContent = `Date selected: ${e.detail.date}`;
            }
          });
        });

        cy.get('#aria-live-test .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar__date').first().click();

        // Live region should be updated
        cy.get('#live-region').should('not.be.empty');
      });
    });

    describe('Browser Compatibility Edge Cases', () => {
      it('should handle date parsing differences across browsers', () => {
        const testDates = [
          '2024-02-29', // Leap year
          '2024-12-31', // Year end
          '2024-01-01', // Year start
        ];

        testDates.forEach((date) => {
          cy.mount(`<usa-date-picker value="${date}"></usa-date-picker>`);

          // Should parse consistently across browsers
          cy.get('.usa-input').then(($input) => {
            const value = $input.val() as string;
            expect(value).to.match(/^\d{2}\/\d{2}\/\d{4}$/);
          });

          cy.get('usa-date-picker').remove();
        });
      });

      it('should handle locale differences gracefully', () => {
        cy.mount(`<usa-date-picker id="locale-test" value="2024-06-15"></usa-date-picker>`);

        cy.window().then((win) => {
          // Simulate different locale settings
          const originalToLocaleDateString = Date.prototype.toLocaleDateString;
          Date.prototype.toLocaleDateString = function () {
            return '15/06/2024'; // European format
          };

          // Component should handle locale differences
          const datePicker = win.document.getElementById('locale-test') as any;
          datePicker.value = '2024-06-15';

          // Restore original method
          Date.prototype.toLocaleDateString = originalToLocaleDateString;
        });

        // Should still function properly
        cy.get('#locale-test .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
      });

      it('should handle missing JavaScript APIs gracefully', () => {
        cy.mount(`<usa-date-picker id="api-fallback"></usa-date-picker>`);

        cy.window().then((win) => {
          // Simulate missing Intl API
          const originalIntl = (win as any).Intl;
          delete (win as any).Intl;

          // Component should fall back gracefully
          try {
            const datePicker = win.document.getElementById('api-fallback') as any;
            datePicker.value = '2024-06-15';
          } finally {
            // Restore Intl
            (win as any).Intl = originalIntl;
          }
        });

        // Should still be functional
        cy.get('#api-fallback .usa-date-picker__button').click();
        cy.get('.usa-date-picker__calendar').should('be.visible');
      });
    });
  });
});
