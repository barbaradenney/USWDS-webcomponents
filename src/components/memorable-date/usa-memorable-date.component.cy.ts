// Component tests for usa-memorable-date
import './index.ts';

describe('USA Memorable Date Component Tests', () => {
  it('should render memorable date with default properties', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);
    cy.get('usa-memorable-date').should('exist');
    cy.get('.usa-memorable-date').should('exist');
    cy.get('fieldset').should('exist');
    cy.get('.usa-legend').should('contain.text', 'Date');
  });

  it('should render all three date fields', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    // Month dropdown
    cy.get('select[name="memorable-date-month"]').should('exist');
    cy.get('label[for="memorable-date-month"]').should('contain.text', 'Month');
    
    // Day input
    cy.get('input[name="memorable-date-day"]').should('exist');
    cy.get('label[for="memorable-date-day"]').should('contain.text', 'Day');
    
    // Year input
    cy.get('input[name="memorable-date-year"]').should('exist');
    cy.get('label[for="memorable-date-year"]').should('contain.text', 'Year');
  });

  it('should populate month dropdown with all months', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.get('select[name="memorable-date-month"] option').should('have.length', 13);
    cy.get('select[name="memorable-date-month"] option').first().should('contain.text', '- Select -');
    cy.get('select[name="memorable-date-month"] option[value="01"]').should('contain.text', 'January');
    cy.get('select[name="memorable-date-month"] option[value="12"]').should('contain.text', 'December');
  });

  it('should handle month selection', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      const changeSpy = cy.stub();
      dateComponent.addEventListener('date-change', changeSpy);
      
      // Select March
      cy.get('select[name="memorable-date-month"]').select('03');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.month', '03')
        );
      });
    });
  });

  it('should handle day input with validation', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      const changeSpy = cy.stub();
      dateComponent.addEventListener('date-change', changeSpy);
      
      // Type valid day
      cy.get('input[name="memorable-date-day"]').type('15');
      cy.get('input[name="memorable-date-day"]').should('have.value', '15');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.day', '15')
        );
      });
    });
  });

  it('should validate day input range', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    // Try to enter day > 31
    cy.get('input[name="memorable-date-day"]').type('35');
    cy.get('input[name="memorable-date-day"]').should('have.value', '31');
    
    // Try to enter more than 2 digits
    cy.get('input[name="memorable-date-day"]').clear().type('123');
    cy.get('input[name="memorable-date-day"]').should('have.value', '12');
  });

  it('should handle year input with validation', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      const changeSpy = cy.stub();
      dateComponent.addEventListener('date-change', changeSpy);
      
      // Type valid year
      cy.get('input[name="memorable-date-year"]').type('1985');
      cy.get('input[name="memorable-date-year"]').should('have.value', '1985');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.year', '1985')
        );
      });
    });
  });

  it('should limit year input to 4 digits', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    // Try to enter more than 4 digits
    cy.get('input[name="memorable-date-year"]').type('12345');
    cy.get('input[name="memorable-date-year"]').should('have.value', '1234');
  });

  it('should prevent non-numeric input in day and year fields', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    // Try to type letters in day field
    cy.get('input[name="memorable-date-day"]').type('abc123def');
    cy.get('input[name="memorable-date-day"]').should('have.value', '12');
    
    // Try to type letters in year field
    cy.get('input[name="memorable-date-year"]').type('abc2023def');
    cy.get('input[name="memorable-date-year"]').should('have.value', '2023');
  });

  it('should handle complete date entry', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      const changeSpy = cy.stub();
      dateComponent.addEventListener('date-change', changeSpy);
      
      // Enter complete date
      cy.get('select[name="memorable-date-month"]').select('07');
      cy.get('input[name="memorable-date-day"]').type('04');
      cy.get('input[name="memorable-date-year"]').type('1976');
      
      cy.then(() => {
        // Should fire event with ISO date and validation
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match({
            detail: Cypress.sinon.match({
              month: '07',
              day: '04',
              year: '1976',
              isoDate: '1976-07-04',
              isValid: true,
              isComplete: true
            })
          })
        );
      });
    });
  });

  it('should validate date accuracy', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      const changeSpy = cy.stub();
      dateComponent.addEventListener('date-change', changeSpy);
      
      // Enter invalid date (February 30th)
      cy.get('select[name="memorable-date-month"]').select('02');
      cy.get('input[name="memorable-date-day"]').type('30');
      cy.get('input[name="memorable-date-year"]').type('2023');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.isValid', false)
        );
      });
    });
  });

  it('should handle custom label', () => {
    cy.mount(`
      <usa-memorable-date 
        id="test-date" 
        label="Date of Birth">
      </usa-memorable-date>
    `);

    cy.get('.usa-legend').should('contain.text', 'Date of Birth');
  });

  it('should handle hint text', () => {
    cy.mount(`
      <usa-memorable-date 
        id="test-date" 
        hint="Please enter your birth date">
      </usa-memorable-date>
    `);

    cy.get('.usa-hint').should('contain.text', 'Please enter your birth date');
    cy.get('.usa-hint').should('have.id', 'memorable-date-hint');
  });

  it('should handle required state', () => {
    cy.mount(`<usa-memorable-date id="test-date" required></usa-memorable-date>`);

    cy.get('fieldset').should('have.class', 'usa-form-group--required');
    cy.get('.usa-hint--required').should('exist').should('contain.text', '*');
    
    // All inputs should have required attribute
    cy.get('select[name="memorable-date-month"]').should('have.attr', 'required');
    cy.get('input[name="memorable-date-day"]').should('have.attr', 'required');
    cy.get('input[name="memorable-date-year"]').should('have.attr', 'required');
  });

  it('should handle disabled state', () => {
    cy.mount(`<usa-memorable-date id="test-date" disabled></usa-memorable-date>`);

    // All inputs should be disabled
    cy.get('select[name="memorable-date-month"]').should('be.disabled');
    cy.get('input[name="memorable-date-day"]').should('be.disabled');
    cy.get('input[name="memorable-date-year"]').should('be.disabled');
  });

  it('should handle custom name attribute', () => {
    cy.mount(`<usa-memorable-date id="test-date" name="birthdate"></usa-memorable-date>`);

    cy.get('select[name="birthdate-month"]').should('exist');
    cy.get('input[name="birthdate-day"]').should('exist');
    cy.get('input[name="birthdate-year"]').should('exist');
    cy.get('label[for="birthdate-month"]').should('exist');
    cy.get('label[for="birthdate-day"]').should('exist');
    cy.get('label[for="birthdate-year"]').should('exist');
  });

  it('should handle keyboard navigation', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    // Tab through fields
    cy.get('select[name="memorable-date-month"]').focus();
    cy.focused().should('have.attr', 'name', 'memorable-date-month');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'name', 'memorable-date-day');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'name', 'memorable-date-year');
  });

  it('should handle special keys in numeric inputs', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    // Test that special keys are allowed
    cy.get('input[name="memorable-date-day"]')
      .focus()
      .type('{backspace}{delete}{home}{end}{leftarrow}{rightarrow}')
      .type('15')
      .should('have.value', '15');
    
    // Test Ctrl+A, Ctrl+C, Ctrl+V
    cy.get('input[name="memorable-date-year"]')
      .focus()
      .type('2023')
      .type('{ctrl+a}')
      .type('1985')
      .should('have.value', '1985');
  });

  it('should programmatically set values', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      
      // Set values programmatically
      dateComponent.setValue('08', '15', '1990');
      
      cy.get('select[name="memorable-date-month"]').should('have.value', '08');
      cy.get('input[name="memorable-date-day"]').should('have.value', '15');
      cy.get('input[name="memorable-date-year"]').should('have.value', '1990');
    });
  });

  it('should set from ISO date string', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      
      // Set from ISO date
      dateComponent.setFromISODate('1965-12-25');
      
      cy.get('select[name="memorable-date-month"]').should('have.value', '12');
      cy.get('input[name="memorable-date-day"]').should('have.value', '25');
      cy.get('input[name="memorable-date-year"]').should('have.value', '1965');
    });
  });

  it('should clear all fields', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      
      // Set values first
      dateComponent.setValue('03', '10', '2000');
      
      // Then clear
      dateComponent.clear();
      
      cy.get('select[name="memorable-date-month"]').should('have.value', '');
      cy.get('input[name="memorable-date-day"]').should('have.value', '');
      cy.get('input[name="memorable-date-year"]').should('have.value', '');
    });
  });

  it('should return date value object', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      
      dateComponent.setValue('06', '18', '1983');
      
      const dateValue = dateComponent.getDateValue();
      expect(dateValue).to.deep.equal({
        month: '06',
        day: '18',
        year: '1983'
      });
    });
  });

  it('should handle leap year validation', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      const changeSpy = cy.stub();
      dateComponent.addEventListener('date-change', changeSpy);
      
      // Test leap year (Feb 29, 2020)
      cy.get('select[name="memorable-date-month"]').select('02');
      cy.get('input[name="memorable-date-day"]').type('29');
      cy.get('input[name="memorable-date-year"]').type('2020');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.isValid', true)
        );
      });
      
      // Test non-leap year (Feb 29, 2021)
      cy.get('input[name="memorable-date-year"]').clear().type('2021');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.isValid', false)
        );
      });
    });
  });

  it('should handle form integration', () => {
    cy.mount(`
      <form id="test-form">
        <usa-memorable-date 
          id="test-date" 
          name="event-date">
        </usa-memorable-date>
        <button type="submit">Submit</button>
      </form>
    `);

    // Set date values
    cy.get('select[name="event-date-month"]').select('09');
    cy.get('input[name="event-date-day"]').type('11');
    cy.get('input[name="event-date-year"]').type('2001');

    // Check that form can access values
    cy.window().then((win) => {
      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const formData = new FormData(form);
      
      expect(formData.get('event-date-month')).to.equal('09');
      expect(formData.get('event-date-day')).to.equal('11');
      expect(formData.get('event-date-year')).to.equal('2001');
    });
  });

  it('should handle aria attributes correctly', () => {
    cy.mount(`
      <usa-memorable-date 
        id="test-date" 
        hint="Enter your date of birth"
        required>
      </usa-memorable-date>
    `);

    // Check fieldset structure
    cy.get('fieldset').should('exist');
    cy.get('.usa-legend').should('exist');
    
    // Check aria-describedby references
    cy.get('select[name="memorable-date-month"]')
      .should('have.attr', 'aria-describedby', 'memorable-date-hint');
    cy.get('input[name="memorable-date-day"]')
      .should('have.attr', 'aria-describedby', 'memorable-date-hint');
    cy.get('input[name="memorable-date-year"]')
      .should('have.attr', 'aria-describedby', 'memorable-date-hint');
    
    // Check input attributes
    cy.get('input[name="memorable-date-day"]')
      .should('have.attr', 'inputmode', 'numeric')
      .should('have.attr', 'pattern', '[0-9]*');
    cy.get('input[name="memorable-date-year"]')
      .should('have.attr', 'inputmode', 'numeric')
      .should('have.attr', 'pattern', '[0-9]*');
  });

  it('should handle month padding correctly', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      
      // Set single digit month
      dateComponent.month = '5';
      
      // Should pad to 2 digits in display
      cy.get('select[name="memorable-date-month"]').should('have.value', '05');
    });
  });

  it('should handle incomplete dates', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      const changeSpy = cy.stub();
      dateComponent.addEventListener('date-change', changeSpy);
      
      // Set partial date (missing year)
      cy.get('select[name="memorable-date-month"]').select('04');
      cy.get('input[name="memorable-date-day"]').type('15');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match({
            detail: Cypress.sinon.match({
              isComplete: false,
              isValid: false,
              isoDate: ''
            })
          })
        );
      });
    });
  });

  it('should handle edge case dates', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    cy.window().then((win) => {
      const dateComponent = win.document.getElementById('test-date') as any;
      const changeSpy = cy.stub();
      dateComponent.addEventListener('date-change', changeSpy);
      
      // Test April 31st (invalid)
      cy.get('select[name="memorable-date-month"]').select('04');
      cy.get('input[name="memorable-date-day"]').type('31');
      cy.get('input[name="memorable-date-year"]').type('2023');
      
      cy.then(() => {
        expect(changeSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.isValid', false)
        );
      });
    });
  });

  it('should be accessible', () => {
    cy.mount(`
      <div>
        <h2>Event Registration</h2>
        <usa-memorable-date 
          id="event-date" 
          name="event-date"
          label="Event Date"
          hint="Please enter the date of the event"
          required>
        </usa-memorable-date>
      </div>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-memorable-date 
        id="test-date" 
        class="custom-date-class">
      </usa-memorable-date>
    `);

    cy.get('usa-memorable-date').should('have.class', 'custom-date-class');
    cy.get('.usa-memorable-date').should('exist');
  });

  it('should handle focus and blur events', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    // Focus and blur each field
    cy.get('select[name="memorable-date-month"]').focus().blur();
    cy.get('input[name="memorable-date-day"]').focus().blur();
    cy.get('input[name="memorable-date-year"]').focus().blur();
    
    // Should not cause any errors
    cy.get('usa-memorable-date').should('exist');
  });

  it('should handle mobile input behavior', () => {
    cy.mount(`<usa-memorable-date id="test-date"></usa-memorable-date>`);

    // Set mobile viewport
    cy.viewport(375, 667);
    
    // Numeric inputs should show numeric keyboard
    cy.get('input[name="memorable-date-day"]')
      .should('have.attr', 'inputmode', 'numeric')
      .should('have.attr', 'pattern', '[0-9]*');
    
    cy.get('input[name="memorable-date-year"]')
      .should('have.attr', 'inputmode', 'numeric')
      .should('have.attr', 'pattern', '[0-9]*');
  });
});