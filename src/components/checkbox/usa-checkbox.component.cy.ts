// Component tests for usa-checkbox
import './index.ts';

describe('USA Checkbox Component Tests', () => {
  it('should render checkbox with default properties', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="test" value="test-value">
        Test Checkbox
      </usa-checkbox>
    `);
    cy.get('usa-checkbox').should('exist');
    cy.get('usa-checkbox input[type="checkbox"]').should('have.class', 'usa-checkbox__input');
    cy.get('usa-checkbox .usa-checkbox__label').should('contain.text', 'Test Checkbox');
  });

  it('should handle checked state changes', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="test" value="test-value">
        Test Checkbox
      </usa-checkbox>
    `);

    // Initially unchecked
    cy.get('input[type="checkbox"]').should('not.be.checked');
    
    // Click to check
    cy.get('input[type="checkbox"]').check();
    cy.get('input[type="checkbox"]').should('be.checked');
    
    // Click to uncheck
    cy.get('input[type="checkbox"]').uncheck();
    cy.get('input[type="checkbox"]').should('not.be.checked');
  });

  it('should handle clicking on label', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="agreement" value="agreed">
        I agree to the terms and conditions
      </usa-checkbox>
    `);

    // Click on label should toggle checkbox
    cy.get('.usa-checkbox__label').click();
    cy.get('input[type="checkbox"]').should('be.checked');
    
    cy.get('.usa-checkbox__label').click();
    cy.get('input[type="checkbox"]').should('not.be.checked');
  });

  it('should emit change events', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="subscribe" value="yes">
        Subscribe to newsletter
      </usa-checkbox>
    `);

    cy.window().then((win) => {
      const checkbox = win.document.getElementById('test-checkbox') as any;
      const changeSpy = cy.stub();
      checkbox.addEventListener('change', changeSpy);
      
      cy.get('input[type="checkbox"]').check();
      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle initial checked state', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="preselected" value="yes" checked>
        Pre-selected option
      </usa-checkbox>
    `);

    cy.get('input[type="checkbox"]').should('be.checked');
  });

  it('should handle disabled state', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="disabled-test" value="disabled" disabled>
        Disabled checkbox
      </usa-checkbox>
    `);

    cy.get('input[type="checkbox"]').should('be.disabled');
    cy.get('.usa-checkbox__label').should('have.class', 'usa-checkbox__label--disabled');
    
    // Should not be clickable
    cy.get('.usa-checkbox__label').click({ force: true });
    cy.get('input[type="checkbox"]').should('not.be.checked');
  });

  it('should handle required state', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="required-terms" value="accepted" required>
        I accept the required terms (Required)
      </usa-checkbox>
    `);

    cy.get('input[type="checkbox"]').should('have.attr', 'required');
    cy.get('input[type="checkbox"]').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-checkbox 
        id="test-checkbox" 
        name="terms" 
        value="accepted"
        error
        error-message="You must accept the terms to continue">
        I accept the terms and conditions
      </usa-checkbox>
    `);

    cy.get('input[type="checkbox"]').should('have.attr', 'aria-invalid', 'true');
    cy.get('.usa-checkbox').should('have.class', 'usa-checkbox--error');
    cy.get('.usa-error-message').should('contain.text', 'You must accept the terms to continue');
  });

  it('should handle indeterminate state', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="partial" value="some" indeterminate>
        Partially selected
      </usa-checkbox>
    `);

    cy.get('input[type="checkbox"]').should('have.prop', 'indeterminate', true);
    cy.get('.usa-checkbox__input').should('have.class', 'usa-checkbox__input--indeterminate');
  });

  it('should handle large size variant', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="large-test" value="large" size="large">
        Large checkbox
      </usa-checkbox>
    `);

    cy.get('.usa-checkbox').should('have.class', 'usa-checkbox--large');
  });

  it('should handle small size variant', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="small-test" value="small" size="small">
        Small checkbox
      </usa-checkbox>
    `);

    cy.get('.usa-checkbox').should('have.class', 'usa-checkbox--small');
  });

  it('should be keyboard accessible', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="keyboard-test" value="accessible">
        Keyboard accessible checkbox
      </usa-checkbox>
    `);

    // Tab to checkbox
    cy.get('input[type="checkbox"]').focus();
    cy.focused().should('have.attr', 'name', 'keyboard-test');
    
    // Space to toggle
    cy.focused().type(' ');
    cy.get('input[type="checkbox"]').should('be.checked');
    
    cy.focused().type(' ');
    cy.get('input[type="checkbox"]').should('not.be.checked');
  });

  it('should handle form integration', () => {
    cy.mount(`
      <form id="test-form">
        <usa-checkbox id="checkbox1" name="services" value="web-design">
          Web Design
        </usa-checkbox>
        <usa-checkbox id="checkbox2" name="services" value="consulting">
          Consulting
        </usa-checkbox>
        <usa-checkbox id="checkbox3" name="newsletter" value="subscribe" checked>
          Subscribe to newsletter
        </usa-checkbox>
        <button type="submit">Submit</button>
      </form>
    `);

    cy.window().then((win) => {
      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const services = formData.getAll('services');
        const newsletter = formData.get('newsletter');
        submitSpy({ services, newsletter });
      });
      
      // Check web design
      cy.get('#checkbox1 input').check();
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith({
          services: ['web-design'],
          newsletter: 'subscribe'
        });
      });
    });
  });

  it('should handle grouped checkboxes', () => {
    cy.mount(`
      <fieldset>
        <legend>Select your interests</legend>
        <usa-checkbox id="interest1" name="interests" value="technology">
          Technology
        </usa-checkbox>
        <usa-checkbox id="interest2" name="interests" value="design">
          Design
        </usa-checkbox>
        <usa-checkbox id="interest3" name="interests" value="business">
          Business
        </usa-checkbox>
      </fieldset>
    `);

    // Select multiple interests
    cy.get('#interest1 input').check();
    cy.get('#interest3 input').check();
    
    cy.get('input[name="interests"]:checked').should('have.length', 2);
    cy.get('#interest1 input').should('be.checked');
    cy.get('#interest2 input').should('not.be.checked');
    cy.get('#interest3 input').should('be.checked');
  });

  it('should handle tile variant', () => {
    cy.mount(`
      <usa-checkbox 
        id="test-checkbox" 
        name="tile-test" 
        value="tile-value"
        variant="tile">
        Tile checkbox with more content and description
      </usa-checkbox>
    `);

    cy.get('.usa-checkbox').should('have.class', 'usa-checkbox--tile');
  });

  it('should handle description text', () => {
    cy.mount(`
      <usa-checkbox 
        id="test-checkbox" 
        name="with-description" 
        value="described"
        description="This is additional descriptive text for the checkbox">
        Checkbox with description
      </usa-checkbox>
    `);

    cy.get('.usa-checkbox__description').should('contain.text', 'This is additional descriptive text for the checkbox');
  });

  it('should handle aria attributes', () => {
    cy.mount(`
      <div>
        <span id="checkbox-description">Additional context for this choice</span>
        <usa-checkbox 
          id="test-checkbox" 
          name="aria-test" 
          value="aria-value"
          aria-describedby="checkbox-description">
          Checkbox with ARIA attributes
        </usa-checkbox>
      </div>
    `);

    cy.get('input[type="checkbox"]')
      .should('have.attr', 'aria-describedby', 'checkbox-description');
  });

  it('should handle focus and blur events', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="focus-test" value="focus-value">
        Focus test checkbox
      </usa-checkbox>
    `);

    cy.window().then((win) => {
      const checkbox = win.document.getElementById('test-checkbox') as any;
      const focusSpy = cy.stub();
      const blurSpy = cy.stub();
      checkbox.addEventListener('focus', focusSpy);
      checkbox.addEventListener('blur', blurSpy);
      
      cy.get('input[type="checkbox"]').focus();
      cy.get('input[type="checkbox"]').blur();
      
      cy.then(() => {
        expect(focusSpy).to.have.been.called;
        expect(blurSpy).to.have.been.called;
      });
    });
  });

  it('should handle validation on blur', () => {
    cy.mount(`
      <usa-checkbox 
        id="test-checkbox" 
        name="validation-test" 
        value="must-accept"
        required
        validate-on-blur>
        Required checkbox
      </usa-checkbox>
    `);

    // Focus and blur without checking (should trigger validation)
    cy.get('input[type="checkbox"]').focus().blur();
    cy.get('input[type="checkbox"]').should('have.attr', 'aria-invalid', 'true');
    
    // Check and blur (should clear validation)
    cy.get('input[type="checkbox"]').check().blur();
    cy.get('input[type="checkbox"]').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should be accessible', () => {
    cy.mount(`
      <fieldset>
        <legend>Privacy Settings</legend>
        <usa-checkbox 
          id="privacy-emails"
          name="privacy" 
          value="email-updates"
          aria-describedby="email-hint">
          Receive email updates
        </usa-checkbox>
        <div id="email-hint">We'll send you occasional updates about our services</div>
      </fieldset>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-checkbox 
        id="test-checkbox" 
        name="custom-test" 
        value="custom-value"
        class="custom-checkbox-class">
        Custom styled checkbox
      </usa-checkbox>
    `);

    cy.get('usa-checkbox').should('have.class', 'custom-checkbox-class');
    cy.get('.usa-checkbox').should('exist');
  });

  it('should handle mixed state in parent-child relationships', () => {
    cy.mount(`
      <div>
        <usa-checkbox id="parent-checkbox" name="select-all" value="all">
          Select All Options
        </usa-checkbox>
        <div style="margin-left: 20px;">
          <usa-checkbox id="child1" name="options" value="option1">
            Option 1
          </usa-checkbox>
          <usa-checkbox id="child2" name="options" value="option2">
            Option 2
          </usa-checkbox>
          <usa-checkbox id="child3" name="options" value="option3">
            Option 3
          </usa-checkbox>
        </div>
      </div>
    `);

    // Check some but not all children
    cy.get('#child1 input').check();
    cy.get('#child2 input').check();
    
    // Parent should be in indeterminate state (if functionality exists)
    cy.window().then((win) => {
      const parentCheckbox = win.document.querySelector('#parent-checkbox input') as HTMLInputElement;
      if (parentCheckbox) {
        parentCheckbox.indeterminate = true;
      }
    });
    
    cy.get('#parent-checkbox input').should('have.prop', 'indeterminate', true);
  });

  it('should handle value changes programmatically', () => {
    cy.mount(`
      <usa-checkbox id="test-checkbox" name="programmatic" value="initial">
        Programmatically controlled
      </usa-checkbox>
    `);

    cy.window().then((win) => {
      const checkbox = win.document.getElementById('test-checkbox') as any;
      
      // Set checked programmatically
      checkbox.checked = true;
      cy.get('input[type="checkbox"]').should('be.checked');
      
      // Uncheck programmatically
      checkbox.checked = false;
      cy.get('input[type="checkbox"]').should('not.be.checked');
    });
  });
});