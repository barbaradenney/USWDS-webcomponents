// Component tests for usa-input-prefix-suffix
import './index.ts';

describe('USA Input Prefix Suffix Component Tests', () => {
  it('should render input with default properties', () => {
    cy.mount(`<usa-input-prefix-suffix id="test-input"></usa-input-prefix-suffix>`);
    cy.get('usa-input-prefix-suffix').should('exist');
    cy.get('usa-input-prefix-suffix input').should('have.class', 'usa-input');
  });

  it('should render with prefix only', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        name="price"
        placeholder="0.00">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-group').should('exist');
    cy.get('.usa-input-prefix').should('contain.text', '$');
    cy.get('.usa-input-suffix').should('not.exist');
    cy.get('input').should('have.attr', 'placeholder', '0.00');
  });

  it('should render with suffix only', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        suffix="%"
        name="percentage"
        placeholder="0">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-group').should('exist');
    cy.get('.usa-input-prefix').should('not.exist');
    cy.get('.usa-input-suffix').should('contain.text', '%');
  });

  it('should render with both prefix and suffix', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        suffix=".00"
        name="amount"
        value="100">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-prefix').should('contain.text', '$');
    cy.get('.usa-input-suffix').should('contain.text', '.00');
    cy.get('input').should('have.value', '100');
  });

  it('should handle icon prefix', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix-icon="search"
        name="search"
        placeholder="Search...">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-prefix .usa-icon').should('exist');
    cy.get('.usa-input-prefix svg').should('have.attr', 'aria-hidden', 'true');
  });

  it('should handle icon suffix', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        suffix-icon="credit_card"
        name="card"
        placeholder="Card number">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-suffix .usa-icon').should('exist');
    cy.get('.usa-input-suffix svg').should('have.attr', 'aria-hidden', 'true');
  });

  it('should handle input value changes', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        name="amount">
      </usa-input-prefix-suffix>
    `);

    cy.get('input').type('123.45');
    cy.get('input').should('have.value', '123.45');
    
    cy.get('input').clear().type('999.99');
    cy.get('input').should('have.value', '999.99');
  });

  it('should emit input events', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        name="amount">
      </usa-input-prefix-suffix>
    `);

    cy.window().then((win) => {
      const input = win.document.getElementById('test-input') as any;
      const inputSpy = cy.stub();
      input.addEventListener('input', inputSpy);
      
      cy.get('input').type('100');
      cy.then(() => {
        expect(inputSpy).to.have.been.called;
      });
    });
  });

  it('should emit change events', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        suffix="%"
        name="percentage">
      </usa-input-prefix-suffix>
    `);

    cy.window().then((win) => {
      const input = win.document.getElementById('test-input') as any;
      const changeSpy = cy.stub();
      input.addEventListener('change', changeSpy);
      
      cy.get('input').type('50').blur();
      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle disabled state', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        suffix=".00"
        disabled>
      </usa-input-prefix-suffix>
    `);

    cy.get('input').should('be.disabled');
    cy.get('.usa-input-prefix').should('have.class', 'usa-input-prefix--disabled');
    cy.get('.usa-input-suffix').should('have.class', 'usa-input-suffix--disabled');
  });

  it('should handle readonly state', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="ID:"
        value="12345"
        readonly>
      </usa-input-prefix-suffix>
    `);

    cy.get('input').should('have.attr', 'readonly');
    cy.get('input').type('999'); // Should not change
    cy.get('input').should('have.value', '12345');
  });

  it('should handle required state', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        required
        aria-label="Required amount field">
      </usa-input-prefix-suffix>
    `);

    cy.get('input').should('have.attr', 'required');
    cy.get('input').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        error
        error-message="Please enter a valid amount">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-group').should('have.class', 'usa-input-group--error');
    cy.get('input').should('have.class', 'usa-input--error');
    cy.get('input').should('have.attr', 'aria-invalid', 'true');
  });

  it('should handle success state', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        suffix="%"
        success
        value="100">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-group').should('have.class', 'usa-input-group--success');
    cy.get('input').should('have.class', 'usa-input--success');
  });

  it('should handle different input types', () => {
    const types = ['text', 'number', 'email', 'tel', 'url'];
    
    types.forEach(type => {
      cy.mount(`
        <usa-input-prefix-suffix 
          id="test-input-${type}"
          type="${type}"
          prefix=">"
          name="${type}-field">
        </usa-input-prefix-suffix>
      `);
      
      cy.get(`#test-input-${type} input`).should('have.attr', 'type', type);
    });
  });

  it('should handle number input with constraints', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        type="number"
        prefix="$"
        suffix=".00"
        min="0"
        max="1000"
        step="0.01">
      </usa-input-prefix-suffix>
    `);

    cy.get('input')
      .should('have.attr', 'type', 'number')
      .should('have.attr', 'min', '0')
      .should('have.attr', 'max', '1000')
      .should('have.attr', 'step', '0.01');
  });

  it('should handle pattern validation', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="+"
        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
        placeholder="123-456-7890">
      </usa-input-prefix-suffix>
    `);

    cy.get('input').should('have.attr', 'pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}');
  });

  it('should handle maxlength constraint', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        suffix="characters"
        maxlength="10">
      </usa-input-prefix-suffix>
    `);

    cy.get('input').should('have.attr', 'maxlength', '10');
    cy.get('input').type('12345678901234567890');
    cy.get('input').should('have.value', '1234567890'); // Limited to 10 chars
  });

  it('should be keyboard accessible', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        suffix=".00"
        name="amount">
      </usa-input-prefix-suffix>
    `);

    // Tab to input
    cy.get('input').focus();
    cy.focused().should('have.attr', 'name', 'amount');
    
    // Type in focused input
    cy.focused().type('100');
    cy.get('input').should('have.value', '100');
  });

  it('should handle aria-label and aria-describedby', () => {
    cy.mount(`
      <div>
        <span id="help-text">Enter the amount in dollars</span>
        <usa-input-prefix-suffix 
          id="test-input"
          prefix="$"
          aria-label="Dollar amount"
          aria-describedby="help-text">
        </usa-input-prefix-suffix>
      </div>
    `);

    cy.get('input')
      .should('have.attr', 'aria-label', 'Dollar amount')
      .should('have.attr', 'aria-describedby', 'help-text');
  });

  it('should be accessible', () => {
    cy.mount(`
      <form>
        <label for="amount">Amount</label>
        <usa-input-prefix-suffix 
          id="amount"
          prefix="$"
          suffix=".00"
          name="amount"
          required>
        </usa-input-prefix-suffix>
      </form>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should work in form submission', () => {
    cy.mount(`
      <form id="test-form">
        <usa-input-prefix-suffix 
          id="test-input"
          prefix="$"
          name="price"
          value="99.99">
        </usa-input-prefix-suffix>
        <button type="submit">Submit</button>
      </form>
    `);

    cy.window().then((win) => {
      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy(formData.get('price'));
      });
      
      cy.get('button[type="submit"]').click();
      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('99.99');
      });
    });
  });

  it('should handle small size variant', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        size="small">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-group').should('have.class', 'usa-input-group--sm');
    cy.get('input').should('have.class', 'usa-input--small');
  });

  it('should handle large size variant', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        suffix="%"
        size="large">
      </usa-input-prefix-suffix>
    `);

    cy.get('.usa-input-group').should('have.class', 'usa-input-group--lg');
    cy.get('input').should('have.class', 'usa-input--large');
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-input-prefix-suffix 
        id="test-input"
        prefix="$"
        class="custom-input-class">
      </usa-input-prefix-suffix>
    `);

    cy.get('usa-input-prefix-suffix').should('have.class', 'custom-input-class');
    cy.get('.usa-input-group').should('exist');
  });
});