// Component tests for usa-banner
import './index.ts';

describe('USA Banner Component Tests', () => {
  it('should render banner with default properties', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.get('usa-banner').should('exist');
    cy.get('.usa-banner').should('exist');
    cy.get('.usa-banner__header').should('exist');
    cy.get('.usa-banner__content').should('exist');
  });

  it('should display default header text', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.get('.usa-banner__header-text').should(
      'contain.text',
      'An official website of the United States government'
    );
    cy.get('.usa-banner__header-action').should('contain.text', "Here's how you know");
  });

  it('should display flag image with proper attributes', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.get('.usa-banner__header-flag')
      .should('have.attr', 'src', '/img/us_flag_small.png')
      .should('have.attr', 'alt', 'U.S. flag');
  });

  it('should handle custom header text', () => {
    cy.mount(`
      <usa-banner 
        id="test-banner" 
        header-text="Custom government website"
        action-text="Learn more">
      </usa-banner>
    `);

    cy.get('.usa-banner__header-text').should('contain.text', 'Custom government website');
    cy.get('.usa-banner__header-action').should('contain.text', 'Learn more');
    cy.get('.usa-banner__button-text').should('contain.text', 'Learn more');
  });

  it('should handle custom image sources', () => {
    cy.mount(`
      <usa-banner 
        id="test-banner" 
        flag-image-src="/custom/flag.png"
        flag-image-alt="Custom flag"
        dot-gov-icon-src="/custom/dotgov.svg"
        https-icon-src="/custom/https.svg">
      </usa-banner>
    `);

    cy.get('.usa-banner__header-flag')
      .should('have.attr', 'src', '/custom/flag.png')
      .should('have.attr', 'alt', 'Custom flag');

    cy.get('.usa-banner__icon').first().should('have.attr', 'src', '/custom/dotgov.svg');

    cy.get('.usa-banner__icon').last().should('have.attr', 'src', '/custom/https.svg');
  });

  it('should toggle banner content on button click', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    // Initially collapsed
    cy.get('.usa-banner__content').should('have.attr', 'hidden');
    cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'false');

    // Click to expand
    cy.get('.usa-accordion__button').click();
    cy.get('.usa-banner__content').should('not.have.attr', 'hidden');
    cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'true');

    // Click to collapse
    cy.get('.usa-accordion__button').click();
    cy.get('.usa-banner__content').should('have.attr', 'hidden');
    cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'false');
  });

  it('should toggle banner content with keyboard navigation', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    // Initially collapsed
    cy.get('.usa-banner__content').should('have.attr', 'hidden');

    // Focus and press Enter
    cy.get('.usa-accordion__button').focus();
    cy.focused().type('{enter}');
    cy.get('.usa-banner__content').should('not.have.attr', 'hidden');

    // Press Space to toggle
    cy.focused().type(' ');
    cy.get('.usa-banner__content').should('have.attr', 'hidden');
  });

  it('should emit banner-toggle events', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.window().then((win) => {
      const banner = win.document.getElementById('test-banner') as any;
      const toggleSpy = cy.stub();
      banner.addEventListener('banner-toggle', toggleSpy);

      // Expand banner
      cy.get('.usa-accordion__button').click();

      cy.then(() => {
        expect(toggleSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.expanded', true)
        );
      });

      // Collapse banner
      cy.get('.usa-accordion__button').click();

      cy.then(() => {
        expect(toggleSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.expanded', false)
        );
      });
    });
  });

  it('should handle expanded property', () => {
    cy.mount(`<usa-banner id="test-banner" expanded></usa-banner>`);

    // Should start expanded
    cy.get('.usa-banner__content').should('not.have.attr', 'hidden');
    cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'true');
  });

  it('should display .gov guidance content', () => {
    cy.mount(`<usa-banner id="test-banner" expanded></usa-banner>`);

    cy.get('.usa-banner__guidance')
      .first()
      .within(() => {
        cy.get('.usa-banner__icon').should('have.attr', 'alt', 'Dot gov');
        cy.get('strong').should('contain.text', 'Official websites use .gov');
        cy.get('p').should('contain.text', 'A .gov website belongs to an official government');
      });
  });

  it('should display HTTPS guidance content', () => {
    cy.mount(`<usa-banner id="test-banner" expanded></usa-banner>`);

    cy.get('.usa-banner__guidance')
      .last()
      .within(() => {
        cy.get('.usa-banner__icon').should('have.attr', 'alt', 'Https');
        cy.get('strong').should('contain.text', 'Secure .gov websites use HTTPS');
        cy.get('p').should('contain.text', 'A lock');
        cy.get('.usa-banner__lock-image').should('exist');
      });
  });

  it('should have proper ARIA controls', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.get('.usa-accordion__button').should('have.attr', 'aria-controls', 'gov-banner-default');

    cy.get('.usa-banner__content').should('have.id', 'gov-banner-default');
  });

  it('should handle lock icon SVG accessibility', () => {
    cy.mount(`<usa-banner id="test-banner" expanded></usa-banner>`);

    cy.get('.usa-banner__lock-image').within(() => {
      cy.get('title').should('have.id', 'banner-lock-title');
      cy.get('desc').should('have.id', 'banner-lock-description');
      cy.get('svg')
        .should('have.attr', 'aria-labelledby', 'banner-lock-title banner-lock-description')
        .should('have.attr', 'role', 'img');
    });
  });

  it('should prevent default on keyboard events', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.window().then((win) => {
      const button = win.document.querySelector('.usa-accordion__button') as HTMLElement;
      let preventDefaultCalled = false;

      const originalPreventDefault = Event.prototype.preventDefault;
      Event.prototype.preventDefault = function () {
        preventDefaultCalled = true;
        originalPreventDefault.call(this);
      };

      button.focus();
      cy.focused().type(' ');

      cy.then(() => {
        expect(preventDefaultCalled).to.be.true;
        Event.prototype.preventDefault = originalPreventDefault;
      });
    });
  });

  it('should have proper responsive grid structure', () => {
    cy.mount(`<usa-banner id="test-banner" expanded></usa-banner>`);

    cy.get('.usa-banner__inner').should('exist');
    cy.get('.grid-col-auto').should('exist');
    cy.get('.grid-col-fill').should('exist');
    cy.get('.grid-row').should('exist');
    cy.get('.tablet\\:grid-col-6').should('have.length', 2);
  });

  it('should handle programmatic expansion', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.window().then((win) => {
      const banner = win.document.getElementById('test-banner') as any;

      // Expand programmatically
      banner.expanded = true;
      cy.get('.usa-banner__content').should('not.have.attr', 'hidden');
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'true');

      // Collapse programmatically
      banner.expanded = false;
      cy.get('.usa-banner__content').should('have.attr', 'hidden');
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'false');
    });
  });

  it('should handle multiple banners independently', () => {
    cy.mount(`
      <div>
        <usa-banner id="banner1" header-text="First banner"></usa-banner>
        <usa-banner id="banner2" header-text="Second banner"></usa-banner>
      </div>
    `);

    // Expand first banner
    cy.get('#banner1 .usa-accordion__button').click();
    cy.get('#banner1 .usa-banner__content').should('not.have.attr', 'hidden');
    cy.get('#banner2 .usa-banner__content').should('have.attr', 'hidden');

    // Expand second banner
    cy.get('#banner2 .usa-accordion__button').click();
    cy.get('#banner2 .usa-banner__content').should('not.have.attr', 'hidden');
    cy.get('#banner1 .usa-banner__content').should('not.have.attr', 'hidden');
  });

  it('should handle banner button focus states', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.get('.usa-accordion__button').focus();
    cy.focused().should('have.class', 'usa-accordion__button');

    // Should be keyboard accessible
    cy.focused().should('be.visible');
  });

  it('should handle image loading errors gracefully', () => {
    cy.mount(`
      <usa-banner 
        id="test-banner" 
        flag-image-src="/nonexistent/flag.png"
        dot-gov-icon-src="/nonexistent/dotgov.svg"
        https-icon-src="/nonexistent/https.svg">
      </usa-banner>
    `);

    // Banner should still render even with missing images
    cy.get('.usa-banner').should('exist');
    cy.get('.usa-banner__header-flag').should('exist');
    cy.get('.usa-accordion__button').should('be.visible');
  });

  it('should handle content visibility toggle animation', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    // Toggle should happen smoothly
    cy.get('.usa-accordion__button').click();
    cy.get('.usa-banner__content').should('not.have.attr', 'hidden').should('be.visible');

    cy.get('.usa-accordion__button').click();
    cy.get('.usa-banner__content').should('have.attr', 'hidden');
  });

  it('should maintain proper semantics for screen readers', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    // Header action should be aria-hidden for screen readers
    cy.get('.usa-banner__header-action').should('have.attr', 'aria-hidden', 'true');

    // Button text should be visible to screen readers
    cy.get('.usa-banner__button-text').should('be.visible');
  });

  it('should handle dynamic property updates', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.window().then((win) => {
      const banner = win.document.getElementById('test-banner') as any;

      // Update header text
      banner.headerText = 'Updated government website';
      cy.get('.usa-banner__header-text').should('contain.text', 'Updated government website');

      // Update action text
      banner.actionText = 'Click to learn';
      cy.get('.usa-banner__header-action').should('contain.text', 'Click to learn');
      cy.get('.usa-banner__button-text').should('contain.text', 'Click to learn');
    });
  });

  it('should handle touch interactions', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    // Touch should work like click
    cy.get('.usa-accordion__button').trigger('touchstart').trigger('touchend');
    // Note: Actual touch behavior may be handled by click events

    cy.get('.usa-accordion__button').click(); // Verify normal interaction still works
    cy.get('.usa-banner__content').should('not.have.attr', 'hidden');
  });

  it('should handle mobile responsive behavior', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    // Set mobile viewport
    cy.viewport(375, 667);

    cy.get('.usa-banner').should('be.visible');
    cy.get('.grid-col-fill').should('exist');
    cy.get('.tablet\\:grid-col-auto').should('exist');

    // Banner should still be functional on mobile
    cy.get('.usa-accordion__button').should('be.visible').click();
    cy.get('.usa-banner__content').should('not.have.attr', 'hidden');
  });

  it('should handle edge case keyboard events', () => {
    cy.mount(`<usa-banner id="test-banner"></usa-banner>`);

    cy.get('.usa-accordion__button').focus();

    // Should not respond to other keys
    cy.focused().type('{esc}');
    cy.get('.usa-banner__content').should('have.attr', 'hidden');

    cy.focused().type('a');
    cy.get('.usa-banner__content').should('have.attr', 'hidden');

    // Should only respond to Enter and Space
    cy.focused().type('{enter}');
    cy.get('.usa-banner__content').should('not.have.attr', 'hidden');
  });

  it('should maintain USWDS class structure', () => {
    cy.mount(`<usa-banner id="test-banner" expanded></usa-banner>`);

    // Verify all required USWDS classes are present
    cy.get('.usa-banner').should('exist');
    cy.get('.usa-accordion').should('exist');
    cy.get('.usa-banner__header').should('exist');
    cy.get('.usa-banner__inner').should('exist');
    cy.get('.usa-banner__header-flag').should('exist');
    cy.get('.usa-banner__header-text').should('exist');
    cy.get('.usa-banner__header-action').should('exist');
    cy.get('.usa-accordion__button').should('exist');
    cy.get('.usa-banner__button').should('exist');
    cy.get('.usa-banner__content').should('exist');
    cy.get('.usa-accordion__content').should('exist');
    cy.get('.usa-banner__guidance').should('have.length', 2);
    cy.get('.usa-banner__icon').should('have.length', 2);
    cy.get('.usa-media-block__img').should('have.length', 2);
    cy.get('.usa-media-block__body').should('have.length', 2);
  });

  it('should be accessible', () => {
    cy.mount(`
      <main>
        <usa-banner id="government-banner" expanded></usa-banner>
        <div class="content">
          <h1>Government Website</h1>
          <p>Welcome to our official government website.</p>
        </div>
      </main>
    `);

    cy.injectAxe();

    // Test with banner expanded
    cy.checkAccessibility();

    // Test with banner collapsed
    cy.get('.usa-accordion__button').click();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-banner 
        id="test-banner" 
        class="custom-banner-class">
      </usa-banner>
    `);

    cy.get('usa-banner').should('have.class', 'custom-banner-class');
    cy.get('.usa-banner').should('exist');
  });

  it('should handle content security requirements', () => {
    cy.mount(`<usa-banner id="test-banner" expanded></usa-banner>`);

    // Content should include required government messaging
    cy.get('.usa-banner__guidance').should('contain.text', 'Official websites use .gov');
    cy.get('.usa-banner__guidance').should('contain.text', 'Secure .gov websites use HTTPS');
    cy.get('.usa-banner__guidance').should(
      'contain.text',
      'Share sensitive information only on official'
    );
  });

  // Form Integration Robustness Testing (Medium Priority Gap Fix)
  describe('Form Integration', () => {
    it('should not interfere with form submission when banner toggle is clicked', () => {
      let formSubmitted = false;
      let bannerToggled = false;

      cy.mount(`
        <form id="banner-form-test">
          <usa-banner id="form-banner"></usa-banner>
          <fieldset>
            <legend>User Information</legend>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </fieldset>
          <button type="submit">Submit Form</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('banner-form-test') as HTMLFormElement;
        const banner = win.document.getElementById('form-banner') as any;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        banner.addEventListener('banner-toggle', () => {
          bannerToggled = true;
        });
      });

      // Fill out form
      cy.get('#username').type('testuser');
      cy.get('#email').type('test@example.gov');

      // Banner toggle should not trigger form submission
      cy.get('.usa-accordion__button')
        .click()
        .then(() => {
          expect(bannerToggled).to.be.true;
          expect(formSubmitted).to.be.false;
        });

      // Form submission should work independently
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should handle banner close action without affecting form validation', () => {
      let formValidationTriggered = false;
      let bannerActionTriggered = false;

      cy.mount(`
        <form id="validation-form-test" novalidate>
          <usa-banner id="validation-banner" expanded></usa-banner>
          <fieldset>
            <legend>Required Information</legend>
            <label for="required-field">Required Field:</label>
            <input type="text" id="required-field" name="required-field" required>
          </fieldset>
          <button type="submit">Submit</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('validation-form-test') as HTMLFormElement;
        const banner = win.document.getElementById('validation-banner') as any;
        const requiredField = win.document.getElementById('required-field') as HTMLInputElement;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          if (!form.checkValidity()) {
            formValidationTriggered = true;
          }
        });

        banner.addEventListener('banner-toggle', () => {
          bannerActionTriggered = true;
        });
      });

      // Banner actions should not trigger form validation
      cy.get('.usa-accordion__button')
        .click()
        .then(() => {
          expect(bannerActionTriggered).to.be.true;
          expect(formValidationTriggered).to.be.false;
        });

      // Form validation should work independently when form is actually submitted
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formValidationTriggered).to.be.true;
        });
    });

    it('should maintain proper focus management in form contexts', () => {
      cy.mount(`
        <form id="focus-form-test">
          <input type="text" id="before-banner" placeholder="Before banner">
          <usa-banner id="focus-banner"></usa-banner>
          <input type="text" id="after-banner" placeholder="After banner">
          <button type="submit">Submit</button>
        </form>
      `);

      // Tab navigation should work properly through form elements
      cy.get('#before-banner').focus().tab();
      cy.focused().should('have.class', 'usa-accordion__button');

      // Banner interaction should not break tab flow
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-accordion__button').tab();
      cy.focused().should('have.id', 'after-banner');
    });

    it('should handle banner expansion without triggering form auto-submission', () => {
      let autoSubmitTriggered = false;

      cy.mount(`
        <form id="auto-submit-test">
          <usa-banner id="auto-banner"></usa-banner>
          <input type="text" name="single-field" placeholder="Type and press enter">
          <button type="submit" style="display: none;">Hidden Submit</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('auto-submit-test') as HTMLFormElement;
        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          autoSubmitTriggered = true;
        });
      });

      // Banner expansion should not cause implicit form submission
      cy.get('.usa-accordion__button').click();
      cy.get('input[name="single-field"]').type('test text{enter}');

      cy.wait(100).then(() => {
        // Form auto-submission from single field + enter should still work
        expect(autoSubmitTriggered).to.be.true;
      });

      // Reset and test banner doesn't interfere
      cy.window().then(() => {
        autoSubmitTriggered = false;
      });

      cy.get('.usa-accordion__button').click(); // Toggle banner
      cy.wait(100).then(() => {
        expect(autoSubmitTriggered).to.be.false; // Banner toggle should not trigger submission
      });
    });

    it('should handle keyboard navigation within nested form structures', () => {
      cy.mount(`
        <form id="nested-form-test">
          <fieldset>
            <legend>Government Site Information</legend>
            <usa-banner id="nested-banner"></usa-banner>
          </fieldset>
          <fieldset>
            <legend>User Data</legend>
            <label for="nested-input">Agency:</label>
            <input type="text" id="nested-input" name="agency">
          </fieldset>
          <button type="submit">Submit</button>
        </form>
      `);

      // Keyboard navigation should work through complex nested structures
      cy.get('.usa-accordion__button').focus();
      cy.focused().type('{enter}'); // Expand banner
      cy.get('.usa-banner__content').should('not.have.attr', 'hidden');

      // Tab should move to next form element
      cy.get('.usa-accordion__button').tab();
      cy.focused().should('have.id', 'nested-input');

      // Shift+tab should return to banner button
      cy.focused().tab({ shift: true });
      cy.focused().should('have.class', 'usa-accordion__button');
    });

    it('should preserve form data during banner interactions', () => {
      cy.mount(`
        <form id="data-preservation-test">
          <input type="text" id="preserve-field" name="preserve-data" value="important data">
          <usa-banner id="preserve-banner"></usa-banner>
          <textarea id="preserve-textarea" name="preserve-text">Important message</textarea>
          <button type="submit">Submit</button>
        </form>
      `);

      // Verify initial data
      cy.get('#preserve-field').should('have.value', 'important data');
      cy.get('#preserve-textarea').should('have.value', 'Important message');

      // Banner interactions should not affect form data
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-banner__content').should('not.have.attr', 'hidden');

      cy.get('#preserve-field').should('have.value', 'important data');
      cy.get('#preserve-textarea').should('have.value', 'Important message');

      // Collapse banner
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-banner__content').should('have.attr', 'hidden');

      // Data should still be preserved
      cy.get('#preserve-field').should('have.value', 'important data');
      cy.get('#preserve-textarea').should('have.value', 'Important message');
    });

    it('should handle banner in multi-step form contexts', () => {
      let currentStep = 1;
      let formNavigated = false;

      cy.mount(`
        <form id="multi-step-form">
          <usa-banner id="multistep-banner"></usa-banner>
          <div id="step-1" class="form-step">
            <h2>Step 1: Basic Information</h2>
            <input type="text" name="first-name" placeholder="First Name">
            <button type="button" id="next-step">Next Step</button>
          </div>
          <div id="step-2" class="form-step" style="display: none;">
            <h2>Step 2: Contact Information</h2>
            <input type="email" name="email" placeholder="Email">
            <button type="submit">Submit Application</button>
          </div>
        </form>
      `);

      cy.window().then((win) => {
        const nextButton = win.document.getElementById('next-step') as HTMLButtonElement;
        nextButton.addEventListener('click', () => {
          currentStep = 2;
          formNavigated = true;
          const step1 = win.document.getElementById('step-1') as HTMLElement;
          const step2 = win.document.getElementById('step-2') as HTMLElement;
          step1.style.display = 'none';
          step2.style.display = 'block';
        });
      });

      // Banner should work independently of multi-step navigation
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-banner__content').should('not.have.attr', 'hidden');

      // Form step navigation should work
      cy.get('#next-step')
        .click()
        .then(() => {
          expect(formNavigated).to.be.true;
        });

      cy.get('#step-2').should('be.visible');
      cy.get('#step-1').should('not.be.visible');

      // Banner should still be functional after form navigation
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-banner__content').should('have.attr', 'hidden');
    });

    it('should respect form validation state during banner interactions', () => {
      cy.mount(`
        <form id="validation-state-test" novalidate>
          <usa-banner id="validation-banner"></usa-banner>
          <label for="email-validation">Government Email:</label>
          <input
            type="email"
            id="email-validation"
            name="gov-email"
            pattern=".*\\.gov$"
            required
            aria-describedby="email-error">
          <div id="email-error" class="usa-error-message" style="display: none;">
            Please enter a valid .gov email address
          </div>
          <button type="submit">Submit</button>
        </form>
      `);

      // Invalid state
      cy.get('#email-validation').type('invalid@email.com').blur();

      cy.window().then((win) => {
        const input = win.document.getElementById('email-validation') as HTMLInputElement;
        if (!input.checkValidity()) {
          const errorDiv = win.document.getElementById('email-error') as HTMLElement;
          errorDiv.style.display = 'block';
          input.setAttribute('aria-invalid', 'true');
        }
      });

      // Banner interaction should not affect validation state
      cy.get('.usa-accordion__button').click();
      cy.get('#email-validation').should('have.attr', 'aria-invalid', 'true');
      cy.get('#email-error').should('be.visible');

      // Valid input should clear validation state independently
      cy.get('#email-validation').clear().type('valid@agency.gov').blur();

      cy.window().then((win) => {
        const input = win.document.getElementById('email-validation') as HTMLInputElement;
        if (input.checkValidity()) {
          const errorDiv = win.document.getElementById('email-error') as HTMLElement;
          errorDiv.style.display = 'none';
          input.removeAttribute('aria-invalid');
        }
      });

      cy.get('#email-validation').should('not.have.attr', 'aria-invalid');
      cy.get('#email-error').should('not.be.visible');
    });
  });
});
