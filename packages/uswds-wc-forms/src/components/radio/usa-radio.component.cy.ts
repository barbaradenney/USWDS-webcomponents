// Component tests for usa-radio
import './index.ts';

describe('USA Radio Component Tests', () => {
  it('should render radio button with default properties', () => {
    cy.mount(`
      <usa-radio id="test-radio" name="test-group" value="option1">
        Option 1
      </usa-radio>
    `);
    cy.get('usa-radio').should('exist');
    cy.get('usa-radio input[type="radio"]').should('have.class', 'usa-radio__input');
    cy.get('usa-radio .usa-radio__label').should('contain.text', 'Option 1');
  });

  it('should handle radio button selection in a group', () => {
    cy.mount(`
      <fieldset>
        <legend>Choose one option</legend>
        <usa-radio id="radio1" name="choice" value="option1">
          Option 1
        </usa-radio>
        <usa-radio id="radio2" name="choice" value="option2">
          Option 2
        </usa-radio>
        <usa-radio id="radio3" name="choice" value="option3">
          Option 3
        </usa-radio>
      </fieldset>
    `);

    // Initially none selected
    cy.get('input[name="choice"]:checked').should('have.length', 0);

    // Select option 2
    cy.get('#radio2 input').check();
    cy.get('#radio2 input').should('be.checked');
    cy.get('#radio1 input').should('not.be.checked');
    cy.get('#radio3 input').should('not.be.checked');

    // Select option 3 (should deselect option 2)
    cy.get('#radio3 input').check();
    cy.get('#radio3 input').should('be.checked');
    cy.get('#radio1 input').should('not.be.checked');
    cy.get('#radio2 input').should('not.be.checked');
  });

  it('should handle clicking on label', () => {
    cy.mount(`
      <usa-radio id="test-radio" name="label-test" value="clicked">
        Click this label
      </usa-radio>
    `);

    // Click on label should select radio
    cy.get('.usa-radio__label').click();
    cy.get('input[type="radio"]').should('be.checked');
  });

  it('should emit change events', () => {
    cy.mount(`
      <usa-radio id="test-radio" name="change-test" value="changed">
        Test change event
      </usa-radio>
    `);

    cy.window().then((win) => {
      const radio = win.document.getElementById('test-radio') as any;
      const changeSpy = cy.stub();
      radio.addEventListener('change', changeSpy);

      cy.get('input[type="radio"]').check();
      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle initial checked state', () => {
    cy.mount(`
      <fieldset>
        <usa-radio id="radio1" name="preselected" value="option1">
          Option 1
        </usa-radio>
        <usa-radio id="radio2" name="preselected" value="option2" checked>
          Option 2 (Preselected)
        </usa-radio>
        <usa-radio id="radio3" name="preselected" value="option3">
          Option 3
        </usa-radio>
      </fieldset>
    `);

    cy.get('#radio2 input').should('be.checked');
    cy.get('#radio1 input').should('not.be.checked');
    cy.get('#radio3 input').should('not.be.checked');
  });

  it('should handle disabled state', () => {
    cy.mount(`
      <fieldset>
        <usa-radio id="radio1" name="disabled-test" value="option1">
          Available option
        </usa-radio>
        <usa-radio id="radio2" name="disabled-test" value="option2" disabled>
          Disabled option
        </usa-radio>
      </fieldset>
    `);

    cy.get('#radio2 input').should('be.disabled');
    cy.get('#radio2 .usa-radio__label').should('have.class', 'usa-radio__label--disabled');

    // Should not be selectable
    cy.get('#radio2 .usa-radio__label').click({ force: true });
    cy.get('#radio2 input').should('not.be.checked');

    // Other options should still work
    cy.get('#radio1 input').check();
    cy.get('#radio1 input').should('be.checked');
  });

  it('should handle required state', () => {
    cy.mount(`
      <fieldset>
        <legend>Required selection</legend>
        <usa-radio id="radio1" name="required-group" value="option1" required>
          Option 1
        </usa-radio>
        <usa-radio id="radio2" name="required-group" value="option2" required>
          Option 2
        </usa-radio>
      </fieldset>
    `);

    cy.get('#radio1 input').should('have.attr', 'required');
    cy.get('#radio2 input').should('have.attr', 'required');
    cy.get('#radio1 input').should('have.attr', 'aria-required', 'true');
    cy.get('#radio2 input').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <fieldset>
        <usa-radio 
          id="radio1" 
          name="error-group" 
          value="option1"
          error
          error-message="Please select an option">
          Option 1
        </usa-radio>
        <usa-radio id="radio2" name="error-group" value="option2" error>
          Option 2
        </usa-radio>
      </fieldset>
    `);

    cy.get('#radio1 input').should('have.attr', 'aria-invalid', 'true');
    cy.get('#radio2 input').should('have.attr', 'aria-invalid', 'true');
    cy.get('.usa-radio').should('have.class', 'usa-radio--error');
    cy.get('.usa-error-message').should('contain.text', 'Please select an option');
  });

  it('should handle large size variant', () => {
    cy.mount(`
      <usa-radio id="test-radio" name="size-test" value="large" size="large">
        Large radio button
      </usa-radio>
    `);

    cy.get('.usa-radio').should('have.class', 'usa-radio--large');
  });

  it('should handle small size variant', () => {
    cy.mount(`
      <usa-radio id="test-radio" name="size-test" value="small" size="small">
        Small radio button
      </usa-radio>
    `);

    cy.get('.usa-radio').should('have.class', 'usa-radio--small');
  });

  it('should be keyboard accessible', () => {
    cy.mount(`
      <fieldset>
        <legend>Keyboard navigation test</legend>
        <usa-radio id="radio1" name="keyboard-group" value="option1">
          Option 1
        </usa-radio>
        <usa-radio id="radio2" name="keyboard-group" value="option2">
          Option 2
        </usa-radio>
        <usa-radio id="radio3" name="keyboard-group" value="option3">
          Option 3
        </usa-radio>
      </fieldset>
    `);

    // Tab to first radio
    cy.get('#radio1 input').focus();
    cy.focused().should('have.attr', 'name', 'keyboard-group');
    cy.focused().should('have.attr', 'value', 'option1');

    // Arrow down to next radio
    cy.focused().type('{downarrow}');
    cy.focused().should('have.attr', 'value', 'option2');
    cy.get('#radio2 input').should('be.checked');

    // Arrow up to previous radio
    cy.focused().type('{uparrow}');
    cy.focused().should('have.attr', 'value', 'option1');
    cy.get('#radio1 input').should('be.checked');

    // Space to select current radio
    cy.focused().type(' ');
    cy.get('#radio1 input').should('be.checked');
  });

  it('should handle form integration', () => {
    cy.mount(`
      <form id="test-form">
        <fieldset>
          <legend>Preferred contact method</legend>
          <usa-radio id="contact-email" name="contact-method" value="email">
            Email
          </usa-radio>
          <usa-radio id="contact-phone" name="contact-method" value="phone">
            Phone
          </usa-radio>
          <usa-radio id="contact-mail" name="contact-method" value="mail">
            Mail
          </usa-radio>
        </fieldset>
        <button type="submit">Submit</button>
      </form>
    `);

    cy.window().then((win) => {
      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy(formData.get('contact-method'));
      });

      // Select phone option
      cy.get('#contact-phone input').check();

      // Submit form
      cy.get('button[type="submit"]').click();

      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('phone');
      });
    });
  });

  it('should handle multiple radio groups independently', () => {
    cy.mount(`
      <div>
        <fieldset>
          <legend>Size preference</legend>
          <usa-radio id="size-small" name="size" value="small">Small</usa-radio>
          <usa-radio id="size-medium" name="size" value="medium">Medium</usa-radio>
          <usa-radio id="size-large" name="size" value="large">Large</usa-radio>
        </fieldset>
        
        <fieldset>
          <legend>Color preference</legend>
          <usa-radio id="color-red" name="color" value="red">Red</usa-radio>
          <usa-radio id="color-blue" name="color" value="blue">Blue</usa-radio>
          <usa-radio id="color-green" name="color" value="green">Green</usa-radio>
        </fieldset>
      </div>
    `);

    // Select from both groups independently
    cy.get('#size-medium input').check();
    cy.get('#color-red input').check();

    // Both should be selected
    cy.get('#size-medium input').should('be.checked');
    cy.get('#color-red input').should('be.checked');

    // Selecting another from same group should deselect previous
    cy.get('#size-large input').check();
    cy.get('#size-large input').should('be.checked');
    cy.get('#size-medium input').should('not.be.checked');

    // Other group should remain unchanged
    cy.get('#color-red input').should('be.checked');
  });

  it('should handle tile variant', () => {
    cy.mount(`
      <usa-radio 
        id="test-radio" 
        name="tile-test" 
        value="tile-option"
        variant="tile">
        Tile radio button with more content
      </usa-radio>
    `);

    cy.get('.usa-radio').should('have.class', 'usa-radio--tile');
  });

  it('should handle description text', () => {
    cy.mount(`
      <usa-radio 
        id="test-radio" 
        name="described-option" 
        value="with-description"
        description="This option includes additional explanatory text">
        Option with description
      </usa-radio>
    `);

    cy.get('.usa-radio__description').should(
      'contain.text',
      'This option includes additional explanatory text'
    );
  });

  it('should handle aria attributes', () => {
    cy.mount(`
      <div>
        <span id="radio-description">Additional context for this choice</span>
        <usa-radio 
          id="test-radio" 
          name="aria-test" 
          value="aria-option"
          aria-describedby="radio-description">
          Radio with ARIA attributes
        </usa-radio>
      </div>
    `);

    cy.get('input[type="radio"]').should('have.attr', 'aria-describedby', 'radio-description');
  });

  it('should handle focus and blur events', () => {
    cy.mount(`
      <usa-radio id="test-radio" name="focus-test" value="focus-option">
        Focus test radio
      </usa-radio>
    `);

    cy.window().then((win) => {
      const radio = win.document.getElementById('test-radio') as any;
      const focusSpy = cy.stub();
      const blurSpy = cy.stub();
      radio.addEventListener('focus', focusSpy);
      radio.addEventListener('blur', blurSpy);

      cy.get('input[type="radio"]').focus();
      cy.get('input[type="radio"]').blur();

      cy.then(() => {
        expect(focusSpy).to.have.been.called;
        expect(blurSpy).to.have.been.called;
      });
    });
  });

  it('should handle validation on blur', () => {
    cy.mount(`
      <fieldset>
        <usa-radio 
          id="radio1" 
          name="validation-group" 
          value="option1"
          required
          validate-on-blur>
          Required option 1
        </usa-radio>
        <usa-radio 
          id="radio2" 
          name="validation-group" 
          value="option2"
          required
          validate-on-blur>
          Required option 2
        </usa-radio>
      </fieldset>
    `);

    // Focus and blur without selecting (should trigger validation)
    cy.get('#radio1 input').focus().blur();
    cy.get('input[name="validation-group"]').should('have.attr', 'aria-invalid', 'true');

    // Select an option (should clear validation)
    cy.get('#radio2 input').check();
    cy.get('input[name="validation-group"]').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should be accessible', () => {
    cy.mount(`
      <fieldset>
        <legend>Payment Method</legend>
        <usa-radio 
          id="payment-credit"
          name="payment" 
          value="credit-card"
          aria-describedby="credit-hint">
          Credit Card
        </usa-radio>
        <div id="credit-hint">Visa, MasterCard, American Express accepted</div>
        
        <usa-radio 
          id="payment-bank"
          name="payment" 
          value="bank-transfer">
          Bank Transfer
        </usa-radio>
      </fieldset>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-radio 
        id="test-radio" 
        name="custom-test" 
        value="custom-option"
        class="custom-radio-class">
        Custom styled radio
      </usa-radio>
    `);

    cy.get('usa-radio').should('have.class', 'custom-radio-class');
    cy.get('.usa-radio').should('exist');
  });

  it('should handle programmatic selection', () => {
    cy.mount(`
      <fieldset>
        <usa-radio id="radio1" name="programmatic" value="option1">
          Option 1
        </usa-radio>
        <usa-radio id="radio2" name="programmatic" value="option2">
          Option 2
        </usa-radio>
      </fieldset>
    `);

    cy.window().then((win) => {
      const radio2 = win.document.getElementById('radio2') as any;

      // Set checked programmatically
      radio2.checked = true;
      cy.get('#radio2 input').should('be.checked');
      cy.get('#radio1 input').should('not.be.checked');
    });
  });

  it('should handle nested fieldsets properly', () => {
    cy.mount(`
      <form>
        <fieldset>
          <legend>Contact Information</legend>

          <fieldset>
            <legend>Preferred Contact Time</legend>
            <usa-radio id="time-morning" name="contact-time" value="morning">
              Morning (9 AM - 12 PM)
            </usa-radio>
            <usa-radio id="time-afternoon" name="contact-time" value="afternoon">
              Afternoon (12 PM - 5 PM)
            </usa-radio>
          </fieldset>

          <fieldset>
            <legend>Contact Method</legend>
            <usa-radio id="method-email" name="contact-method" value="email">
              Email
            </usa-radio>
            <usa-radio id="method-phone" name="contact-method" value="phone">
              Phone
            </usa-radio>
          </fieldset>
        </fieldset>
      </form>
    `);

    // Each group should work independently
    cy.get('#time-afternoon input').check();
    cy.get('#method-email input').check();

    cy.get('#time-afternoon input').should('be.checked');
    cy.get('#method-email input').should('be.checked');
    cy.get('#time-morning input').should('not.be.checked');
    cy.get('#method-phone input').should('not.be.checked');
  });

  // Responsive Layout Tests
  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE
    });

    it('should display radio groups properly stacked on mobile', () => {
      cy.mount(`
        <form class="usa-form">
          <fieldset class="usa-fieldset">
            <legend class="usa-legend">Preferred Notification Method</legend>
            <usa-radio
              id="mobile-email"
              name="notification"
              value="email">
              Email notifications
            </usa-radio>
            <usa-radio
              id="mobile-sms"
              name="notification"
              value="sms">
              SMS text messages
            </usa-radio>
            <usa-radio
              id="mobile-phone"
              name="notification"
              value="phone">
              Phone calls
            </usa-radio>
            <usa-radio
              id="mobile-mail"
              name="notification"
              value="mail">
              Physical mail
            </usa-radio>
          </fieldset>
        </form>
      `);

      // Radio buttons should stack vertically on mobile
      cy.get('usa-radio').should('have.length', 4);

      // Touch targets should be at least 44px high
      cy.get('usa-radio').each(($radio) => {
        cy.wrap($radio).should(($el) => {
          const height = $el.outerHeight();
          expect(height).to.be.at.least(44);
        });
      });

      // Labels should be readable and not wrap awkwardly
      cy.get('.usa-radio__label').each(($label) => {
        cy.wrap($label).should('be.visible');
      });
    });

    it('should handle mobile touch interactions', () => {
      cy.mount(`
        <fieldset class="usa-fieldset">
          <legend class="usa-legend">Select Payment Method</legend>
          <usa-radio
            id="mobile-credit"
            name="payment"
            value="credit"
            size="large">
            Credit Card
          </usa-radio>
          <usa-radio
            id="mobile-debit"
            name="payment"
            value="debit"
            size="large">
            Debit Card
          </usa-radio>
          <usa-radio
            id="mobile-bank"
            name="payment"
            value="bank"
            size="large">
            Bank Transfer
          </usa-radio>
        </fieldset>
      `);

      // Touch interaction should work
      cy.get('#mobile-credit .usa-radio__label').trigger('touchstart').trigger('touchend');

      cy.get('#mobile-credit input').should('be.checked');

      // Large size should be especially touch-friendly
      cy.get('.usa-radio').should('have.class', 'usa-radio--large');
    });

    it('should handle mobile tile variant', () => {
      cy.mount(`
        <fieldset class="usa-fieldset">
          <legend class="usa-legend">Choose Your Plan</legend>
          <usa-radio
            id="mobile-basic"
            name="plan"
            value="basic"
            variant="tile"
            description="Basic features for individual use">
            Basic Plan - $9.99/month
          </usa-radio>
          <usa-radio
            id="mobile-premium"
            name="plan"
            value="premium"
            variant="tile"
            description="Advanced features for power users">
            Premium Plan - $19.99/month
          </usa-radio>
          <usa-radio
            id="mobile-enterprise"
            name="plan"
            value="enterprise"
            variant="tile"
            description="Full feature set for business use">
            Enterprise Plan - $49.99/month
          </usa-radio>
        </fieldset>
      `);

      // Tile variants should be properly sized for mobile
      cy.get('.usa-radio').should('have.class', 'usa-radio--tile');

      // Description text should be visible
      cy.get('.usa-radio__description').should('be.visible');
      cy.get('.usa-radio__description').first().should('contain.text', 'Basic features');

      // Tiles should stack vertically on mobile
      cy.get('usa-radio').should('have.length', 3);
    });

    it('should handle mobile error states', () => {
      cy.mount(`
        <fieldset class="usa-fieldset usa-fieldset--error">
          <legend class="usa-legend usa-legend--error">Required Selection</legend>
          <span class="usa-error-message">Please select one option</span>
          <usa-radio
            id="mobile-error1"
            name="required-choice"
            value="option1"
            error
            required>
            Option 1
          </usa-radio>
          <usa-radio
            id="mobile-error2"
            name="required-choice"
            value="option2"
            error
            required>
            Option 2
          </usa-radio>
        </fieldset>
      `);

      cy.get('.usa-error-message').should('be.visible');
      cy.get('input[type="radio"]').should('have.attr', 'aria-invalid', 'true');

      // Error message should be readable on mobile
      cy.get('.usa-error-message').should('have.css', 'font-size');
    });

    it('should handle mobile form layout with multiple radio groups', () => {
      cy.mount(`
        <form class="usa-form">
          <fieldset class="usa-fieldset">
            <legend class="usa-legend">Shipping Options</legend>
            <usa-radio id="shipping-standard" name="shipping" value="standard">
              Standard Shipping (5-7 days)
            </usa-radio>
            <usa-radio id="shipping-express" name="shipping" value="express">
              Express Shipping (2-3 days)
            </usa-radio>
            <usa-radio id="shipping-overnight" name="shipping" value="overnight">
              Overnight Shipping
            </usa-radio>
          </fieldset>

          <fieldset class="usa-fieldset">
            <legend class="usa-legend">Gift Wrapping</legend>
            <usa-radio id="gift-yes" name="gift-wrap" value="yes">
              Yes, please gift wrap
            </usa-radio>
            <usa-radio id="gift-no" name="gift-wrap" value="no">
              No gift wrapping needed
            </usa-radio>
          </fieldset>
        </form>
      `);

      // Multiple fieldsets should stack properly on mobile
      cy.get('.usa-fieldset').should('have.length', 2);

      // Select from each group independently
      cy.get('#shipping-express input').check();
      cy.get('#gift-yes input').check();

      cy.get('#shipping-express input').should('be.checked');
      cy.get('#gift-yes input').should('be.checked');
    });
  });

  describe('Tablet Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(768, 1024); // iPad
    });

    it('should display radio groups in grid layout on tablet', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-6">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Preferred Contact Method</legend>
                <usa-radio id="tablet-email" name="contact" value="email">
                  Email
                </usa-radio>
                <usa-radio id="tablet-phone" name="contact" value="phone">
                  Phone
                </usa-radio>
                <usa-radio id="tablet-mail" name="contact" value="mail">
                  Mail
                </usa-radio>
              </fieldset>
            </div>
            <div class="tablet:grid-col-6">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Preferred Contact Time</legend>
                <usa-radio id="tablet-morning" name="time" value="morning">
                  Morning (9 AM - 12 PM)
                </usa-radio>
                <usa-radio id="tablet-afternoon" name="time" value="afternoon">
                  Afternoon (12 PM - 5 PM)
                </usa-radio>
                <usa-radio id="tablet-evening" name="time" value="evening">
                  Evening (5 PM - 8 PM)
                </usa-radio>
              </fieldset>
            </div>
          </div>
        </form>
      `);

      // Check grid layout on tablet
      cy.get('.tablet\\:grid-col-6').should('have.length', 2);
      cy.get('.tablet\\:grid-col-6').each(($col) => {
        cy.wrap($col).should('have.css', 'width').and('not.equal', '768px');
      });
    });

    it('should handle tablet tile variant with grid', () => {
      cy.mount(`
        <fieldset class="usa-fieldset">
          <legend class="usa-legend">Select Service Level</legend>
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-4">
              <usa-radio
                id="tablet-basic"
                name="service"
                value="basic"
                variant="tile"
                description="Essential features only">
                Basic Service
              </usa-radio>
            </div>
            <div class="tablet:grid-col-4">
              <usa-radio
                id="tablet-standard"
                name="service"
                value="standard"
                variant="tile"
                description="Most popular option"
                checked>
                Standard Service
              </usa-radio>
            </div>
            <div class="tablet:grid-col-4">
              <usa-radio
                id="tablet-premium"
                name="service"
                value="premium"
                variant="tile"
                description="All features included">
                Premium Service
              </usa-radio>
            </div>
          </div>
        </fieldset>
      `);

      // Tiles should be in horizontal layout on tablet
      cy.get('.tablet\\:grid-col-4').should('have.length', 3);
      cy.get('.usa-radio--tile').should('have.length', 3);

      // Standard should be preselected
      cy.get('#tablet-standard input').should('be.checked');

      // Should handle both touch and hover
      cy.get('#tablet-premium .usa-radio__label').trigger('mouseover').click();

      cy.get('#tablet-premium input').should('be.checked');
      cy.get('#tablet-standard input').should('not.be.checked');
    });

    it('should handle tablet accessibility with mixed interaction', () => {
      cy.mount(`
        <fieldset class="usa-fieldset">
          <legend class="usa-legend">Account Type</legend>
          <usa-radio
            id="tablet-personal"
            name="account-type"
            value="personal"
            description="For individual use">
            Personal Account
          </usa-radio>
          <usa-radio
            id="tablet-business"
            name="account-type"
            value="business"
            description="For business use">
            Business Account
          </usa-radio>
          <usa-radio
            id="tablet-nonprofit"
            name="account-type"
            value="nonprofit"
            description="For nonprofit organizations">
            Nonprofit Account
          </usa-radio>
        </fieldset>
      `);

      // Should work with both touch and keyboard
      cy.get('#tablet-personal input').focus();
      cy.focused().type('{downarrow}');
      cy.get('#tablet-business input').should('be.checked');

      // Touch interaction should also work
      cy.get('#tablet-nonprofit .usa-radio__label').trigger('touchstart').trigger('touchend');

      cy.get('#tablet-nonprofit input').should('be.checked');
    });
  });

  describe('Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1200, 800); // Desktop
    });

    it('should display radio groups in multi-column layout', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap-lg">
            <div class="desktop:grid-col-4">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Notification Preferences</legend>
                <usa-radio id="desktop-email" name="notifications" value="email">
                  Email notifications
                </usa-radio>
                <usa-radio id="desktop-sms" name="notifications" value="sms">
                  SMS notifications
                </usa-radio>
                <usa-radio id="desktop-push" name="notifications" value="push">
                  Push notifications
                </usa-radio>
                <usa-radio id="desktop-none" name="notifications" value="none">
                  No notifications
                </usa-radio>
              </fieldset>
            </div>
            <div class="desktop:grid-col-4">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Privacy Settings</legend>
                <usa-radio id="privacy-public" name="privacy" value="public">
                  Public profile
                </usa-radio>
                <usa-radio id="privacy-friends" name="privacy" value="friends">
                  Friends only
                </usa-radio>
                <usa-radio id="privacy-private" name="privacy" value="private">
                  Private profile
                </usa-radio>
              </fieldset>
            </div>
            <div class="desktop:grid-col-4">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Theme Preference</legend>
                <usa-radio id="theme-light" name="theme" value="light">
                  Light theme
                </usa-radio>
                <usa-radio id="theme-dark" name="theme" value="dark">
                  Dark theme
                </usa-radio>
                <usa-radio id="theme-auto" name="theme" value="auto">
                  Automatic
                </usa-radio>
              </fieldset>
            </div>
          </div>
        </form>
      `);

      // Check three-column layout on desktop
      cy.get('.desktop\\:grid-col-4').should('have.length', 3);

      // Test independent group selection
      cy.get('#desktop-sms input').check();
      cy.get('#privacy-friends input').check();
      cy.get('#theme-auto input').check();

      cy.get('#desktop-sms input').should('be.checked');
      cy.get('#privacy-friends input').should('be.checked');
      cy.get('#theme-auto input').should('be.checked');
    });

    it('should handle desktop tile variant in grid layout', () => {
      cy.mount(`
        <fieldset class="usa-fieldset">
          <legend class="usa-legend">Choose Your Subscription Plan</legend>
          <div class="grid-row grid-gap">
            <div class="desktop:grid-col-3">
              <usa-radio
                id="desktop-starter"
                name="subscription"
                value="starter"
                variant="tile"
                description="Perfect for getting started with basic features">
                Starter Plan
                <br><strong>$9.99/month</strong>
              </usa-radio>
            </div>
            <div class="desktop:grid-col-3">
              <usa-radio
                id="desktop-professional"
                name="subscription"
                value="professional"
                variant="tile"
                description="Advanced features for professional use">
                Professional Plan
                <br><strong>$19.99/month</strong>
              </usa-radio>
            </div>
            <div class="desktop:grid-col-3">
              <usa-radio
                id="desktop-business"
                name="subscription"
                value="business"
                variant="tile"
                description="Complete solution for business teams">
                Business Plan
                <br><strong>$39.99/month</strong>
              </usa-radio>
            </div>
            <div class="desktop:grid-col-3">
              <usa-radio
                id="desktop-enterprise"
                name="subscription"
                value="enterprise"
                variant="tile"
                description="Full enterprise features with priority support">
                Enterprise Plan
                <br><strong>Custom pricing</strong>
              </usa-radio>
            </div>
          </div>
        </fieldset>
      `);

      // Four-column layout on desktop
      cy.get('.desktop\\:grid-col-3').should('have.length', 4);
      cy.get('.usa-radio--tile').should('have.length', 4);

      // Should handle hover states
      cy.get('#desktop-professional .usa-radio__label')
        .trigger('mouseover')
        .should('have.css', 'cursor', 'pointer');

      // Select and verify
      cy.get('#desktop-business input').check();
      cy.get('#desktop-business input').should('be.checked');
    });

    it('should handle desktop keyboard navigation efficiently', () => {
      cy.mount(`
        <form>
          <fieldset class="usa-fieldset">
            <legend class="usa-legend">Accessibility Test</legend>
            <usa-radio id="desktop-option1" name="desktop-group" value="option1">
              Option 1
            </usa-radio>
            <usa-radio id="desktop-option2" name="desktop-group" value="option2">
              Option 2
            </usa-radio>
            <usa-radio id="desktop-option3" name="desktop-group" value="option3">
              Option 3
            </usa-radio>
            <usa-radio id="desktop-option4" name="desktop-group" value="option4">
              Option 4
            </usa-radio>
          </fieldset>
        </form>
      `);

      // Keyboard navigation should work efficiently
      cy.get('#desktop-option1 input').focus();
      cy.focused().should('have.attr', 'value', 'option1');

      // Arrow navigation
      cy.focused().type('{downarrow}');
      cy.focused().should('have.attr', 'value', 'option2');
      cy.get('#desktop-option2 input').should('be.checked');

      cy.focused().type('{downarrow}');
      cy.focused().should('have.attr', 'value', 'option3');
      cy.get('#desktop-option3 input').should('be.checked');

      // Arrow up
      cy.focused().type('{uparrow}');
      cy.focused().should('have.attr', 'value', 'option2');
      cy.get('#desktop-option2 input').should('be.checked');
    });

    it('should handle desktop hover and focus states', () => {
      cy.mount(`
        <fieldset class="usa-fieldset">
          <legend class="usa-legend">Interactive States Test</legend>
          <usa-radio
            id="desktop-hover"
            name="hover-test"
            value="hover-option">
            Hover and focus test
          </usa-radio>
        </fieldset>
      `);

      // Hover state
      cy.get('#desktop-hover .usa-radio__label')
        .trigger('mouseover')
        .should('have.css', 'cursor', 'pointer');

      // Focus state
      cy.get('#desktop-hover input')
        .focus()
        .should('have.focus')
        .should('have.css', 'outline-width')
        .and('not.equal', '0px');
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
              <div class="desktop:grid-col-6">
                <fieldset class="usa-fieldset">
                  <legend class="usa-legend">User Preferences</legend>
                  <div class="grid-row grid-gap">
                    <div class="desktop:grid-col-6">
                      <usa-radio
                        id="large-email"
                        name="contact-preference"
                        value="email">
                        Email updates
                      </usa-radio>
                      <usa-radio
                        id="large-phone"
                        name="contact-preference"
                        value="phone">
                        Phone calls
                      </usa-radio>
                    </div>
                    <div class="desktop:grid-col-6">
                      <usa-radio
                        id="large-sms"
                        name="contact-preference"
                        value="sms">
                        SMS messages
                      </usa-radio>
                      <usa-radio
                        id="large-mail"
                        name="contact-preference"
                        value="mail">
                        Physical mail
                      </usa-radio>
                    </div>
                  </div>
                </fieldset>
              </div>
              <div class="desktop:grid-col-6">
                <fieldset class="usa-fieldset">
                  <legend class="usa-legend">Account Settings</legend>
                  <usa-radio
                    id="large-public"
                    name="privacy-level"
                    value="public"
                    variant="tile"
                    description="Profile visible to everyone">
                    Public Account
                  </usa-radio>
                  <usa-radio
                    id="large-private"
                    name="privacy-level"
                    value="private"
                    variant="tile"
                    description="Profile visible to connections only">
                    Private Account
                  </usa-radio>
                </fieldset>
              </div>
            </div>
          </form>
        </div>
      `);

      // Container should be properly centered
      cy.get('.grid-container').should('have.css', 'max-width');

      // Radio groups should have adequate spacing
      cy.get('.usa-fieldset').should('have.length', 2);

      // Tile variants should be properly sized
      cy.get('.usa-radio--tile').should('have.length', 2);
    });

    it('should handle large desktop complex forms', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap-lg">
            <div class="desktop:grid-col-3">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Account Type</legend>
                <usa-radio id="large-individual" name="account-type" value="individual">
                  Individual
                </usa-radio>
                <usa-radio id="large-business" name="account-type" value="business">
                  Business
                </usa-radio>
                <usa-radio id="large-nonprofit" name="account-type" value="nonprofit">
                  Non-profit
                </usa-radio>
              </fieldset>
            </div>
            <div class="desktop:grid-col-3">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Service Level</legend>
                <usa-radio id="large-basic" name="service-level" value="basic">
                  Basic
                </usa-radio>
                <usa-radio id="large-standard" name="service-level" value="standard">
                  Standard
                </usa-radio>
                <usa-radio id="large-premium" name="service-level" value="premium">
                  Premium
                </usa-radio>
              </fieldset>
            </div>
            <div class="desktop:grid-col-3">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Billing Cycle</legend>
                <usa-radio id="large-monthly" name="billing" value="monthly">
                  Monthly
                </usa-radio>
                <usa-radio id="large-quarterly" name="billing" value="quarterly">
                  Quarterly
                </usa-radio>
                <usa-radio id="large-annual" name="billing" value="annual">
                  Annual
                </usa-radio>
              </fieldset>
            </div>
            <div class="desktop:grid-col-3">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Add-ons</legend>
                <usa-radio id="large-support" name="addons" value="support">
                  Priority Support
                </usa-radio>
                <usa-radio id="large-training" name="addons" value="training">
                  Training Package
                </usa-radio>
                <usa-radio id="large-none" name="addons" value="none">
                  No Add-ons
                </usa-radio>
              </fieldset>
            </div>
          </div>
        </form>
      `);

      // Four-column layout
      cy.get('.desktop\\:grid-col-3').should('have.length', 4);

      // Test selections across all groups
      cy.get('#large-business input').check();
      cy.get('#large-premium input').check();
      cy.get('#large-annual input').check();
      cy.get('#large-support input').check();

      // All should be independently selected
      cy.get('#large-business input').should('be.checked');
      cy.get('#large-premium input').should('be.checked');
      cy.get('#large-annual input').should('be.checked');
      cy.get('#large-support input').should('be.checked');
    });
  });

  describe('Responsive Edge Cases', () => {
    it('should handle viewport transitions smoothly', () => {
      cy.mount(`
        <div class="grid-row grid-gap">
          <div class="tablet:grid-col-6 desktop:grid-col-4">
            <fieldset class="usa-fieldset">
              <legend class="usa-legend">Responsive Test</legend>
              <usa-radio
                id="transition-option1"
                name="transition-group"
                value="option1">
                Option 1
              </usa-radio>
              <usa-radio
                id="transition-option2"
                name="transition-group"
                value="option2">
                Option 2
              </usa-radio>
            </fieldset>
          </div>
        </div>
      `);

      // Test mobile to tablet transition
      cy.viewport(375, 667);
      cy.get('#transition-option1 input').check();
      cy.get('#transition-option1 input').should('be.checked');

      cy.viewport(768, 1024);
      cy.get('#transition-option1 input').should('be.checked');

      cy.viewport(1200, 800);
      cy.get('#transition-option1 input').should('be.checked');
    });

    it('should handle long label text at different screen sizes', () => {
      const longLabels = [
        'This is a very long radio button label that might wrap to multiple lines on smaller screens',
        'Another extremely long label that tests how the component handles text wrapping and layout at various viewport sizes',
        'A third long label to test multiple radio buttons with extensive text content',
      ];

      cy.mount(`
        <fieldset class="usa-fieldset">
          <legend class="usa-legend">Long Text Test</legend>
          <usa-radio
            id="long-1"
            name="long-text"
            value="option1">
            ${longLabels[0]}
          </usa-radio>
          <usa-radio
            id="long-2"
            name="long-text"
            value="option2">
            ${longLabels[1]}
          </usa-radio>
          <usa-radio
            id="long-3"
            name="long-text"
            value="option3">
            ${longLabels[2]}
          </usa-radio>
        </fieldset>
      `);

      // Test at different viewports
      const viewports = [
        [320, 568], // Small mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        // Labels should be visible and readable
        cy.get('.usa-radio__label').each(($label) => {
          cy.wrap($label).should('be.visible');
        });

        // Should not cause horizontal overflow
        cy.get('.usa-fieldset').then(($fieldset) => {
          expect($fieldset[0].scrollWidth).to.be.at.most($fieldset[0].clientWidth + 5);
        });
      });
    });

    it('should handle dynamic radio group updates', () => {
      cy.mount(`
        <fieldset class="usa-fieldset" id="dynamic-fieldset">
          <legend class="usa-legend">Dynamic Group</legend>
          <usa-radio
            id="dynamic-initial"
            name="dynamic-group"
            value="initial">
            Initial Option
          </usa-radio>
        </fieldset>
      `);

      const scenarios = [
        { viewport: [375, 667], options: 2 },
        { viewport: [768, 1024], options: 4 },
        { viewport: [1200, 800], options: 6 },
      ];

      scenarios.forEach(({ viewport, options }) => {
        cy.viewport(viewport[0], viewport[1]);

        // Simulate adding more options based on viewport
        cy.window().then((win) => {
          const fieldset = win.document.getElementById('dynamic-fieldset');
          // Clear existing options except first
          const existingRadios = fieldset?.querySelectorAll('usa-radio');
          if (existingRadios) {
            for (let i = 1; i < existingRadios.length; i++) {
              existingRadios[i].remove();
            }
          }

          // Add options based on viewport
          for (let i = 2; i <= options; i++) {
            const radio = win.document.createElement('usa-radio');
            radio.id = `dynamic-option-${i}`;
            radio.setAttribute('name', 'dynamic-group');
            radio.setAttribute('value', `option${i}`);
            radio.textContent = `Option ${i}`;
            fieldset?.appendChild(radio);
          }
        });

        cy.get('usa-radio').should('have.length', options);
        cy.get('#dynamic-initial input').check();
        cy.get('#dynamic-initial input').should('be.checked');
      });
    });

    it('should maintain accessibility at all screen sizes', () => {
      cy.mount(`
        <fieldset class="usa-fieldset">
          <legend class="usa-legend">Accessible Radio Group</legend>
          <usa-radio
            id="accessible-1"
            name="accessible-group"
            value="option1"
            aria-describedby="option1-hint">
            Option 1
          </usa-radio>
          <div id="option1-hint">Additional information for option 1</div>
          <usa-radio
            id="accessible-2"
            name="accessible-group"
            value="option2"
            required>
            Option 2 (Required)
          </usa-radio>
        </fieldset>
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

        // Check ARIA attributes
        cy.get('#accessible-1 input').should('have.attr', 'aria-describedby', 'option1-hint');

        cy.get('#accessible-2 input')
          .should('have.attr', 'required')
          .should('have.attr', 'aria-required', 'true');

        // Check keyboard navigation
        cy.get('#accessible-1 input').focus().should('have.focus');
      });
    });

    it('should handle radio groups in responsive forms', () => {
      cy.mount(`
        <form class="usa-form">
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-12 desktop:grid-col-6">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Responsive Form Section 1</legend>
                <usa-radio id="form-radio-1" name="form-group-1" value="option1">
                  Form Option 1
                </usa-radio>
                <usa-radio id="form-radio-2" name="form-group-1" value="option2">
                  Form Option 2
                </usa-radio>
              </fieldset>
            </div>
            <div class="tablet:grid-col-12 desktop:grid-col-6">
              <fieldset class="usa-fieldset">
                <legend class="usa-legend">Responsive Form Section 2</legend>
                <usa-radio
                  id="form-radio-3"
                  name="form-group-2"
                  value="option1"
                  variant="tile">
                  Tile Option 1
                </usa-radio>
                <usa-radio
                  id="form-radio-4"
                  name="form-group-2"
                  value="option2"
                  variant="tile">
                  Tile Option 2
                </usa-radio>
              </fieldset>
            </div>
          </div>
        </form>
      `);

      const viewports = [
        [375, 667], // Mobile (stacked)
        [768, 1024], // Tablet (stacked)
        [1200, 800], // Desktop (side by side)
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        // All radio groups should work regardless of layout
        cy.get('#form-radio-1 input').check();
        cy.get('#form-radio-3 input').check();

        cy.get('#form-radio-1 input').should('be.checked');
        cy.get('#form-radio-3 input').should('be.checked');

        // Switch selections
        cy.get('#form-radio-2 input').check();
        cy.get('#form-radio-4 input').check();

        cy.get('#form-radio-2 input').should('be.checked');
        cy.get('#form-radio-4 input').should('be.checked');
        cy.get('#form-radio-1 input').should('not.be.checked');
        cy.get('#form-radio-3 input').should('not.be.checked');
      });
    });
  });
});
