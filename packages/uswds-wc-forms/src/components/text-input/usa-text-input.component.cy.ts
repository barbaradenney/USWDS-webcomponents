// Component tests for usa-text-input
import './index.ts';

describe('USA Text Input Component Tests', () => {
  it('should render text input with default properties', () => {
    cy.mount(`<usa-text-input id="test-input"></usa-text-input>`);
    cy.get('usa-text-input').should('exist');
    cy.get('usa-text-input input').should('have.class', 'usa-input');
  });

  it('should handle different input types', () => {
    const types = ['text', 'email', 'password', 'tel', 'url', 'search'];

    types.forEach((type) => {
      cy.mount(`
        <usa-text-input 
          id="test-input-${type}"
          type="${type}"
          name="${type}-field">
        </usa-text-input>
      `);

      cy.get(`#test-input-${type} input`).should('have.attr', 'type', type);
    });
  });

  it('should handle input value changes', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        name="username"
        placeholder="Enter username">
      </usa-text-input>
    `);

    cy.get('input').type('john.doe');
    cy.get('input').should('have.value', 'john.doe');

    cy.get('input').clear().type('jane.smith@example.com');
    cy.get('input').should('have.value', 'jane.smith@example.com');
  });

  it('should emit input events', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        name="email">
      </usa-text-input>
    `);

    cy.window().then((win) => {
      const input = win.document.getElementById('test-input') as any;
      const inputSpy = cy.stub();
      input.addEventListener('input', inputSpy);

      cy.get('input').type('test@example.gov');
      cy.then(() => {
        expect(inputSpy).to.have.been.called;
      });
    });
  });

  it('should emit change events', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        name="phone">
      </usa-text-input>
    `);

    cy.window().then((win) => {
      const input = win.document.getElementById('test-input') as any;
      const changeSpy = cy.stub();
      input.addEventListener('change', changeSpy);

      cy.get('input').type('555-123-4567').blur();
      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle disabled state', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        disabled
        value="Cannot edit this">
      </usa-text-input>
    `);

    cy.get('input').should('be.disabled');
    cy.get('input').should('have.value', 'Cannot edit this');
    cy.get('input').type('new text'); // Should not change
    cy.get('input').should('have.value', 'Cannot edit this');
  });

  it('should handle readonly state', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        readonly
        value="Read only value">
      </usa-text-input>
    `);

    cy.get('input').should('have.attr', 'readonly');
    cy.get('input').type('attempt to change');
    cy.get('input').should('have.value', 'Read only value');
  });

  it('should handle required state', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        required
        name="required-field">
      </usa-text-input>
    `);

    cy.get('input').should('have.attr', 'required');
    cy.get('input').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        error
        error-message="Please enter a valid email address">
      </usa-text-input>
    `);

    cy.get('input').should('have.class', 'usa-input--error');
    cy.get('input').should('have.attr', 'aria-invalid', 'true');
    cy.get('.usa-error-message').should('contain.text', 'Please enter a valid email address');
  });

  it('should handle success state', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        success
        value="valid@example.gov">
      </usa-text-input>
    `);

    cy.get('input').should('have.class', 'usa-input--success');
  });

  it('should handle small size variant', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        size="small">
      </usa-text-input>
    `);

    cy.get('input').should('have.class', 'usa-input--small');
  });

  it('should handle large size variant', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        size="large">
      </usa-text-input>
    `);

    cy.get('input').should('have.class', 'usa-input--large');
  });

  it('should handle maxlength constraint', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        maxlength="10"
        name="username">
      </usa-text-input>
    `);

    cy.get('input').should('have.attr', 'maxlength', '10');
    cy.get('input').type('12345678901234567890');
    cy.get('input').should('have.value', '1234567890'); // Limited to 10 chars
  });

  it('should handle pattern validation', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        pattern="[A-Za-z]{3,}"
        placeholder="At least 3 letters">
      </usa-text-input>
    `);

    cy.get('input').should('have.attr', 'pattern', '[A-Za-z]{3,}');
  });

  it('should handle autocomplete attributes', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        autocomplete="email"
        type="email">
      </usa-text-input>
    `);

    cy.get('input').should('have.attr', 'autocomplete', 'email');
  });

  it('should handle spellcheck attribute', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        spellcheck="false">
      </usa-text-input>
    `);

    cy.get('input').should('have.attr', 'spellcheck', 'false');
  });

  it('should be keyboard accessible', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        name="accessible-field">
      </usa-text-input>
    `);

    // Tab to input
    cy.get('input').focus();
    cy.focused().should('have.attr', 'name', 'accessible-field');

    // Type in focused input
    cy.focused().type('accessible text');
    cy.get('input').should('have.value', 'accessible text');

    // Select all with Ctrl+A (Cmd+A on Mac)
    cy.focused().type('{cmd+a}');
    cy.focused().type('replaced');
    cy.get('input').should('have.value', 'replaced');
  });

  it('should handle aria attributes', () => {
    cy.mount(`
      <div>
        <label id="input-label">User Email</label>
        <span id="input-hint">Enter your government email address</span>
        <usa-text-input 
          id="test-input"
          type="email"
          aria-labelledby="input-label"
          aria-describedby="input-hint">
        </usa-text-input>
      </div>
    `);

    cy.get('input')
      .should('have.attr', 'aria-labelledby', 'input-label')
      .should('have.attr', 'aria-describedby', 'input-hint');
  });

  it('should work in form submission', () => {
    cy.mount(`
      <form id="test-form">
        <usa-text-input 
          id="test-input"
          name="user-email"
          value="user@agency.gov"
          required>
        </usa-text-input>
        <button type="submit">Submit</button>
      </form>
    `);

    cy.window().then((win) => {
      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy(formData.get('user-email'));
      });

      cy.get('button[type="submit"]').click();
      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('user@agency.gov');
      });
    });
  });

  it('should handle focus and blur events', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        name="focus-test">
      </usa-text-input>
    `);

    cy.window().then((win) => {
      const input = win.document.getElementById('test-input') as any;
      const focusSpy = cy.stub();
      const blurSpy = cy.stub();
      input.addEventListener('focus', focusSpy);
      input.addEventListener('blur', blurSpy);

      cy.get('input').focus();
      cy.get('input').blur();

      cy.then(() => {
        expect(focusSpy).to.have.been.called;
        expect(blurSpy).to.have.been.called;
      });
    });
  });

  it('should handle validation on blur', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        type="email"
        required
        validate-on-blur>
      </usa-text-input>
    `);

    // Enter invalid email and blur
    cy.get('input').type('invalid-email').blur();
    cy.get('input').should('have.attr', 'aria-invalid', 'true');

    // Enter valid email and blur
    cy.get('input').clear().type('valid@example.gov').blur();
    cy.get('input').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should be accessible', () => {
    cy.mount(`
      <form>
        <label for="email-input">Email Address</label>
        <usa-text-input 
          id="email-input"
          type="email"
          name="email"
          required
          aria-describedby="email-hint">
        </usa-text-input>
        <div id="email-hint">We'll never share your email</div>
      </form>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle character counting', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        maxlength="50"
        show-character-count>
      </usa-text-input>
    `);

    cy.get('input').type('This is a test message');
    cy.get('.usa-character-count').should('contain', '22 characters of 50 used');
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-text-input 
        id="test-input"
        class="custom-input-class">
      </usa-text-input>
    `);

    cy.get('usa-text-input').should('have.class', 'custom-input-class');
    cy.get('input').should('have.class', 'usa-input');
  });

  it('should handle copy and paste operations', () => {
    cy.mount(`
      <usa-text-input
        id="test-input"
        name="paste-test">
      </usa-text-input>
    `);

    // Type initial text
    cy.get('input').type('Initial text');

    // Select all and copy would work in real browser
    cy.get('input').select(); // Select all text

    // Clear and type new text (simulating paste)
    cy.get('input').clear().type('Pasted content');
    cy.get('input').should('have.value', 'Pasted content');
  });

  // Responsive Layout Tests
  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE
    });

    it('should display properly on mobile with touch targets', () => {
      cy.mount(`
        <div class="usa-form-group">
          <label class="usa-label" for="mobile-input">Email Address</label>
          <usa-text-input
            id="mobile-input"
            name="email"
            type="email"
            placeholder="Enter your email">
          </usa-text-input>
        </div>
      `);

      // Input should be at least 44px high for touch targets
      cy.get('input')
        .should('be.visible')
        .and(($input) => {
          const height = $input.outerHeight();
          expect(height).to.be.at.least(44);
        });
    });

    it('should handle mobile form layout stacking', () => {
      cy.mount(`
        <form class="usa-form">
          <div class="usa-form-group">
            <label class="usa-label" for="mobile-first-name">First Name</label>
            <usa-text-input
              id="mobile-first-name"
              name="firstName"
              required>
            </usa-text-input>
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="mobile-last-name">Last Name</label>
            <usa-text-input
              id="mobile-last-name"
              name="lastName"
              required>
            </usa-text-input>
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="mobile-email">Email</label>
            <usa-text-input
              id="mobile-email"
              name="email"
              type="email"
              required>
            </usa-text-input>
          </div>
        </form>
      `);

      // Form should stack vertically on mobile
      cy.get('.usa-form-group').should('have.length', 3);
      cy.get('.usa-form-group').each(($group) => {
        cy.wrap($group)
          .should('have.css', 'width')
          .and('match', /375px|100%/);
      });
    });

    it('should handle touch interactions properly', () => {
      cy.mount(`
        <usa-text-input
          id="touch-input"
          type="tel"
          placeholder="(555) 123-4567">
        </usa-text-input>
      `);

      // Touch events should work on mobile
      cy.get('input').trigger('touchstart').trigger('touchend').should('be.focused');

      // Virtual keyboard should be appropriate for input type
      cy.get('input').should('have.attr', 'type', 'tel');
    });

    it('should handle mobile error states', () => {
      cy.mount(`
        <div class="usa-form-group usa-form-group--error">
          <label class="usa-label usa-label--error" for="error-input">Email</label>
          <usa-text-input
            id="error-input"
            error
            error-message="Please enter a valid email address"
            type="email">
          </usa-text-input>
        </div>
      `);

      cy.get('.usa-error-message').should('be.visible');
      cy.get('input').should('have.class', 'usa-input--error');

      // Error message should be readable on mobile
      cy.get('.usa-error-message').should('have.css', 'font-size');
    });

    it('should handle mobile success states', () => {
      cy.mount(`
        <div class="usa-form-group">
          <label class="usa-label" for="success-input">Email</label>
          <usa-text-input
            id="success-input"
            success
            value="user@agency.gov"
            type="email">
          </usa-text-input>
        </div>
      `);

      cy.get('input').should('have.class', 'usa-input--success');
    });

    it('should handle character count display on mobile', () => {
      cy.mount(`
        <usa-text-input
          id="mobile-count"
          maxlength="50"
          show-character-count
          placeholder="Enter a brief message">
        </usa-text-input>
      `);

      const testText = 'This is mobile content for testing';
      cy.get('input').type(testText);

      cy.get('.usa-character-count')
        .should('be.visible')
        .should('contain', `${testText.length} characters of 50 used`);
    });

    it('should handle different mobile input types', () => {
      const mobileInputTypes = [
        { type: 'tel', placeholder: '(555) 123-4567' },
        { type: 'email', placeholder: 'user@agency.gov' },
        { type: 'url', placeholder: 'https://example.gov' },
        { type: 'search', placeholder: 'Search...' },
      ];

      mobileInputTypes.forEach(({ type, placeholder }) => {
        cy.mount(`
          <usa-text-input
            id="mobile-${type}"
            type="${type}"
            placeholder="${placeholder}">
          </usa-text-input>
        `);

        cy.get('input')
          .should('have.attr', 'type', type)
          .should('have.attr', 'placeholder', placeholder);

        // Test virtual keyboard activation
        cy.get('input').focus().should('be.focused');
      });
    });
  });

  describe('Tablet Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(768, 1024); // iPad
    });

    it('should display form in two-column layout on tablet', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-first-name">First Name</label>
              <usa-text-input
                id="tablet-first-name"
                name="firstName">
              </usa-text-input>
            </div>
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-last-name">Last Name</label>
              <usa-text-input
                id="tablet-last-name"
                name="lastName">
              </usa-text-input>
            </div>
          </div>
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-email">Email</label>
              <usa-text-input
                id="tablet-email"
                name="email"
                type="email">
              </usa-text-input>
            </div>
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-phone">Phone</label>
              <usa-text-input
                id="tablet-phone"
                name="phone"
                type="tel">
              </usa-text-input>
            </div>
          </div>
        </form>
      `);

      // Check grid layout on tablet
      cy.get('.tablet\\:grid-col-6').should('have.length', 4);
      cy.get('.tablet\\:grid-col-6').each(($col) => {
        cy.wrap($col).should('have.css', 'width').and('not.equal', '768px');
      });
    });

    it('should handle tablet touch and hover states', () => {
      cy.mount(`
        <usa-text-input
          id="tablet-input"
          placeholder="Touch or hover to interact">
        </usa-text-input>
      `);

      // Should work with both touch and mouse
      cy.get('input').trigger('touchstart').trigger('touchend').should('be.focused');

      cy.get('input').trigger('mouseover').should('have.focus');
    });

    it('should handle tablet large size variant', () => {
      cy.mount(`
        <usa-text-input
          id="tablet-large"
          size="large"
          placeholder="Large input for tablet">
        </usa-text-input>
      `);

      cy.get('input').should('have.class', 'usa-input--large');
    });

    it('should handle tablet form with validation', () => {
      cy.mount(`
        <form class="usa-form">
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-password">Password</label>
              <usa-text-input
                id="tablet-password"
                name="password"
                type="password"
                pattern=".{8,}"
                required>
              </usa-text-input>
            </div>
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-confirm">Confirm Password</label>
              <usa-text-input
                id="tablet-confirm"
                name="confirmPassword"
                type="password"
                required>
              </usa-text-input>
            </div>
          </div>
        </form>
      `);

      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');

      cy.get('input[name="password"]').should('have.value', 'password123');
      cy.get('input[name="confirmPassword"]').should('have.value', 'password123');
    });
  });

  describe('Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1200, 800); // Desktop
    });

    it('should display full desktop form layout', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap-lg">
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-first-name">First Name</label>
              <usa-text-input
                id="desktop-first-name"
                name="firstName">
              </usa-text-input>
            </div>
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-middle-name">Middle Name</label>
              <usa-text-input
                id="desktop-middle-name"
                name="middleName">
              </usa-text-input>
            </div>
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-last-name">Last Name</label>
              <usa-text-input
                id="desktop-last-name"
                name="lastName">
              </usa-text-input>
            </div>
          </div>
          <div class="grid-row grid-gap-lg">
            <div class="desktop:grid-col-6">
              <label class="usa-label" for="desktop-email">Email Address</label>
              <usa-text-input
                id="desktop-email"
                name="email"
                type="email">
              </usa-text-input>
            </div>
            <div class="desktop:grid-col-6">
              <label class="usa-label" for="desktop-phone">Phone Number</label>
              <usa-text-input
                id="desktop-phone"
                name="phone"
                type="tel">
              </usa-text-input>
            </div>
          </div>
        </form>
      `);

      // Check three-column layout on desktop
      cy.get('.desktop\\:grid-col-4').should('have.length', 3);
      cy.get('.desktop\\:grid-col-6').should('have.length', 2);
    });

    it('should handle keyboard navigation efficiently on desktop', () => {
      cy.mount(`
        <div>
          <usa-text-input id="first-input" name="first" placeholder="First"></usa-text-input>
          <usa-text-input id="second-input" name="second" placeholder="Second"></usa-text-input>
          <usa-text-input id="third-input" name="third" placeholder="Third"></usa-text-input>
        </div>
      `);

      // Tab through inputs
      cy.get('input').first().focus();
      cy.focused().should('have.attr', 'name', 'first');

      cy.focused().tab();
      cy.focused().should('have.attr', 'name', 'second');

      cy.focused().tab();
      cy.focused().should('have.attr', 'name', 'third');
    });

    it('should handle desktop hover states', () => {
      cy.mount(`
        <usa-text-input
          id="hover-input"
          placeholder="Hover over me">
        </usa-text-input>
      `);

      cy.get('input').trigger('mouseover').should('have.css', 'cursor', 'text');
    });

    it('should handle desktop focus indicators', () => {
      cy.mount(`
        <usa-text-input
          id="focus-input"
          placeholder="Focus indicator test">
        </usa-text-input>
      `);

      cy.get('input')
        .focus()
        .should('have.focus')
        .should('have.css', 'outline-width')
        .and('not.equal', '0px');
    });

    it('should handle desktop autocomplete efficiently', () => {
      cy.mount(`
        <form class="usa-form">
          <div class="grid-row grid-gap">
            <div class="desktop:grid-col-6">
              <label class="usa-label" for="auto-name">Full Name</label>
              <usa-text-input
                id="auto-name"
                name="name"
                autocomplete="name">
              </usa-text-input>
            </div>
            <div class="desktop:grid-col-6">
              <label class="usa-label" for="auto-email">Email</label>
              <usa-text-input
                id="auto-email"
                name="email"
                type="email"
                autocomplete="email">
              </usa-text-input>
            </div>
          </div>
        </form>
      `);

      cy.get('input[autocomplete="name"]').should('have.attr', 'autocomplete', 'name');
      cy.get('input[autocomplete="email"]').should('have.attr', 'autocomplete', 'email');
    });

    it('should handle desktop character counting', () => {
      cy.mount(`
        <div class="grid-row grid-gap">
          <div class="desktop:grid-col-6">
            <label class="usa-label" for="desktop-username">Username</label>
            <usa-text-input
              id="desktop-username"
              name="username"
              maxlength="20"
              show-character-count>
            </usa-text-input>
          </div>
          <div class="desktop:grid-col-6">
            <label class="usa-label" for="desktop-title">Job Title</label>
            <usa-text-input
              id="desktop-title"
              name="title"
              maxlength="50"
              show-character-count>
            </usa-text-input>
          </div>
        </div>
      `);

      const usernameText = 'john.doe';
      const titleText = 'Senior Software Engineer';

      cy.get('#desktop-username').type(usernameText);
      cy.get('#desktop-title').type(titleText);

      cy.get('.usa-character-count').should('have.length', 2);
    });
  });

  describe('Large Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1440, 900); // Large Desktop
    });

    it('should maintain proper spacing on large screens', () => {
      cy.mount(`
        <div class="grid-container">
          <form class="usa-form usa-form--large">
            <div class="grid-row grid-gap-lg">
              <div class="desktop:grid-col-3">
                <label class="usa-label" for="large-first">First Name</label>
                <usa-text-input
                  id="large-first"
                  name="firstName">
                </usa-text-input>
              </div>
              <div class="desktop:grid-col-3">
                <label class="usa-label" for="large-middle">Middle Name</label>
                <usa-text-input
                  id="large-middle"
                  name="middleName">
                </usa-text-input>
              </div>
              <div class="desktop:grid-col-3">
                <label class="usa-label" for="large-last">Last Name</label>
                <usa-text-input
                  id="large-last"
                  name="lastName">
                </usa-text-input>
              </div>
              <div class="desktop:grid-col-3">
                <label class="usa-label" for="large-suffix">Suffix</label>
                <usa-text-input
                  id="large-suffix"
                  name="suffix"
                  placeholder="Jr., Sr., III">
                </usa-text-input>
              </div>
            </div>
          </form>
        </div>
      `);

      // Should have proper four-column layout
      cy.get('.desktop\\:grid-col-3').should('have.length', 4);

      // Container should be properly centered
      cy.get('.grid-container').should('have.css', 'max-width');

      // Inputs should have adequate width on large screens
      cy.get('input').each(($input) => {
        cy.wrap($input).then(($el) => {
          const width = $el.outerWidth();
          expect(width).to.be.greaterThan(200);
        });
      });
    });

    it('should handle large desktop forms with mixed input types', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap-lg">
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="large-search">Search</label>
              <usa-text-input
                id="large-search"
                name="search"
                type="search"
                size="large">
              </usa-text-input>
            </div>
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="large-url">Website URL</label>
              <usa-text-input
                id="large-url"
                name="url"
                type="url"
                placeholder="https://example.gov">
              </usa-text-input>
            </div>
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="large-password">Password</label>
              <usa-text-input
                id="large-password"
                name="password"
                type="password">
              </usa-text-input>
            </div>
          </div>
        </form>
      `);

      // Test different input types work properly
      cy.get('input[type="search"]').should('have.class', 'usa-input--large');
      cy.get('input[type="url"]').type('https://agency.gov');
      cy.get('input[type="password"]').type('securePassword123');

      cy.get('input[type="url"]').should('have.value', 'https://agency.gov');
      cy.get('input[type="password"]').should('have.value', 'securePassword123');
    });
  });

  describe('Responsive Edge Cases', () => {
    it('should handle viewport transitions smoothly', () => {
      cy.mount(`
        <div class="grid-row grid-gap">
          <div class="tablet:grid-col-6 desktop:grid-col-4">
            <usa-text-input
              id="transition-input"
              placeholder="Responsive input">
            </usa-text-input>
          </div>
        </div>
      `);

      const transitionText = 'This text tests smooth transitions';

      // Test mobile to tablet transition
      cy.viewport(375, 667);
      cy.get('input').type(transitionText).should('be.visible');

      cy.viewport(768, 1024);
      cy.get('input').should('be.visible').should('have.value', transitionText);

      cy.viewport(1200, 800);
      cy.get('input').should('be.visible').should('have.value', transitionText);
    });

    it('should handle long placeholder text at different screen sizes', () => {
      const longPlaceholder =
        'This is a very long placeholder text that might cause layout issues on smaller screens';

      cy.mount(`
        <usa-text-input
          id="long-placeholder-input"
          placeholder="${longPlaceholder}">
        </usa-text-input>
      `);

      // Test at different viewports
      const viewports = [
        [320, 568], // Small mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.get('input').should('be.visible');

        // Should not cause horizontal overflow
        cy.get('input').then(($input) => {
          expect($input[0].scrollWidth).to.be.at.most($input[0].clientWidth + 5);
        });
      });
    });

    it('should handle dynamic value updates at different screen sizes', () => {
      cy.mount(`
        <usa-text-input
          id="dynamic-input"
          maxlength="100">
        </usa-text-input>
      `);

      const scenarios = [
        { viewport: [375, 667], value: 'Mobile input' },
        { viewport: [768, 1024], value: 'Tablet input with more content' },
        {
          viewport: [1200, 800],
          value: 'Desktop input with even more detailed content that fits well on larger screens',
        },
      ];

      scenarios.forEach(({ viewport, value }) => {
        cy.viewport(viewport[0], viewport[1]);
        cy.get('input').clear().type(value);
        cy.get('input').should('have.value', value);
      });
    });

    it('should maintain accessibility at all screen sizes', () => {
      cy.mount(`
        <div>
          <label for="accessible-input">Accessible Input</label>
          <usa-text-input
            id="accessible-input"
            aria-describedby="input-hint"
            required>
          </usa-text-input>
          <div id="input-hint">This input should be accessible at all screen sizes</div>
        </div>
      `);

      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        cy.injectAxe();
        cy.checkAccessibility();

        // Check focus indicators work at all sizes
        cy.get('input')
          .focus()
          .should('have.focus')
          .should('have.css', 'outline-width')
          .and('not.equal', '0px');
      });
    });

    it('should handle form validation at different screen sizes', () => {
      cy.mount(`
        <form class="usa-form">
          <usa-text-input
            id="validation-input"
            type="email"
            required
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}">
          </usa-text-input>
        </form>
      `);

      const scenarios = [
        { viewport: [375, 667], input: 'invalid-email' },
        { viewport: [768, 1024], input: 'user@agency.gov' },
        { viewport: [1200, 800], input: 'another.user@department.gov' },
      ];

      scenarios.forEach(({ viewport, input }) => {
        cy.viewport(viewport[0], viewport[1]);
        cy.get('input').clear().type(input);

        // Check validity
        if (input.includes('@') && input.includes('.')) {
          cy.get('input').should('satisfy', ($el) => {
            return $el[0].checkValidity();
          });
        }
      });
    });

    it('should handle copy-paste operations at different screen sizes', () => {
      cy.mount(`
        <usa-text-input
          id="copy-paste-input"
          maxlength="200">
        </usa-text-input>
      `);

      const pasteContent =
        'This is content that was copied from another source and pasted into the input field';

      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        cy.get('input').clear().type(pasteContent);
        cy.get('input').should('have.value', pasteContent);

        // Select all and replace (simulating paste)
        cy.get('input').select().type('Replaced content at different viewport');
        cy.get('input').should('have.value', 'Replaced content at different viewport');
      });
    });
  });
});
