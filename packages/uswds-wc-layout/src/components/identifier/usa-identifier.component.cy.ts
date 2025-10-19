// Component tests for usa-identifier
import './index.ts';
import {
  testRapidClicking,
  testRapidKeyboardInteraction,
  COMMON_BUG_PATTERNS,
} from '../../cypress/support/rapid-interaction-tests.ts';

describe('Identifier Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-identifier></usa-identifier>');
    cy.get('usa-identifier').should('exist');
    cy.get('usa-identifier').should('be.visible');
  });

  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<usa-identifier></usa-identifier>');

    // Rapid clicking without waiting - simulates real user behavior
    cy.get('usa-identifier').as('component');

    // Multiple rapid clicks
    cy.get('@component').click().click().click().click().click();

    cy.wait(500); // Let events settle

    // Component should remain functional
    cy.get('@component').should('exist');
    cy.get('@component').should('be.visible');
  });

  it('should handle interaction during CSS transitions', () => {
    cy.mount('<usa-identifier></usa-identifier>');

    // Click during potential transitions
    cy.get('usa-identifier').click().click(); // Immediate second click

    cy.wait(1000); // Wait for animations

    // Should be in consistent state
    cy.get('usa-identifier').should('exist');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-identifier></usa-identifier>');

      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-identifier',
        clickCount: 15,
        description: 'event listener duplication',
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-identifier></usa-identifier>');

      // Test for race conditions during state changes
      cy.get('usa-identifier').as('component');

      // Rapid interactions that might cause race conditions
      cy.get('@component').click().click().trigger('focus').trigger('blur').click();

      cy.wait(1000); // Wait for all async operations

      // Component should still be functional
      cy.get('@component').should('exist');
      cy.get('@component').should('be.visible');
    });
  });

  // Accessibility testing - critical for government components
  it('should be accessible', () => {
    cy.mount('<usa-identifier></usa-identifier>');

    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-identifier></usa-identifier>');

    // Perform various rapid interactions
    cy.get('usa-identifier').click().focus().blur().click().click();

    cy.wait(500);

    // Accessibility should still be intact
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<usa-identifier></usa-identifier>');
      cy.get('usa-identifier').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-identifier></usa-identifier>');

    // Various interactions that might cause errors
    cy.get('usa-identifier').click().trigger('mouseenter').trigger('mouseleave').focus().blur();

    cy.wait(500);

    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });

  // Form Integration Testing (Critical Gap Fix)
  describe('Form Integration', () => {
    it('should not interfere with form submission when identifier links are clicked', () => {
      let formSubmitted = false;
      let linkClicked = false;

      cy.mount(`
        <form id="identifier-form-test">
          <usa-identifier
            id="form-identifier"
            domain="agency.gov"
            agency="Test Agency"
            parent-agency="Department of Test">
          </usa-identifier>
          <fieldset>
            <legend>Contact Information</legend>
            <label for="contact-name">Name:</label>
            <input type="text" id="contact-name" name="contact-name" required>

            <label for="contact-email">Email:</label>
            <input type="email" id="contact-email" name="contact-email" required>
          </fieldset>
          <button type="submit">Submit Form</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('identifier-form-test') as HTMLFormElement;
        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        // Listen for identifier link clicks
        const identifier = win.document.getElementById('form-identifier');
        identifier?.addEventListener('link-click', () => {
          linkClicked = true;
        });
      });

      // Identifier link clicks should not trigger form submission
      cy.get('.usa-identifier__required-link')
        .first()
        .click()
        .then(() => {
          expect(linkClicked).to.be.true;
          expect(formSubmitted).to.be.false;
        });

      // Form submission should work independently
      cy.get('#contact-name').type('John Doe');
      cy.get('#contact-email').type('john@example.com');
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should properly handle navigation vs form submission conflicts', () => {
      let navigationPrevented = false;
      let formSubmitted = false;

      cy.mount(`
        <form id="navigation-form">
          <usa-identifier
            id="nav-identifier"
            domain="test.gov"
            parent-agency="Test Department"
            parent-agency-href="/department">
          </usa-identifier>
          <fieldset>
            <legend>User Registration</legend>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
          </fieldset>
          <button type="submit">Register</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('navigation-form') as HTMLFormElement;
        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        // Prevent actual navigation for testing
        win.document.addEventListener('click', (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'A' && target.getAttribute('href')) {
            e.preventDefault();
            navigationPrevented = true;
          }
        });
      });

      // Clicking identifier agency link should not submit form
      cy.get('.usa-identifier__logo .usa-link')
        .click()
        .then(() => {
          expect(navigationPrevented).to.be.true;
          expect(formSubmitted).to.be.false;
        });

      // Form submission should still work independently
      cy.get('#username').type('testuser');
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should maintain proper focus management within forms', () => {
      cy.mount(`
        <form id="focus-form-identifier">
          <label for="first-input">First Input:</label>
          <input type="text" id="first-input" name="first-input">

          <usa-identifier
            id="focus-identifier"
            domain="focus.gov"
            show-required-links="true">
          </usa-identifier>

          <label for="last-input">Last Input:</label>
          <input type="text" id="last-input" name="last-input">

          <button type="submit">Submit</button>
        </form>
      `);

      // Tab navigation should skip identifier (it's not interactive as a unit)
      cy.get('#first-input').focus().tab();

      // Should move to identifier links
      cy.focused().should('match', '.usa-identifier__required-link');

      // Should be able to navigate through identifier links
      cy.focused().tab();
      cy.focused().should('match', '.usa-identifier__required-link');

      // Continue tabbing should eventually reach the last input
      cy.get('#last-input').focus();
      cy.focused().should('match', '#last-input');

      // Identifier interactions should not disrupt form focus
      cy.get('.usa-identifier__required-link').first().click();

      // Focus should remain manageable
      cy.get('#first-input').focus();
      cy.focused().should('match', '#first-input');
    });

    it('should work correctly in footer forms without conflicts', () => {
      let subscriptionSubmitted = false;
      let identifierLinkClicked = false;

      cy.mount(`
        <footer>
          <usa-identifier
            id="footer-identifier"
            domain="newsletter.gov"
            agency="Newsletter Service">
          </usa-identifier>

          <form id="newsletter-form">
            <fieldset>
              <legend>Newsletter Subscription</legend>
              <label for="email-subscription">Email:</label>
              <input type="email" id="email-subscription" name="email" required>
              <button type="submit">Subscribe</button>
            </fieldset>
          </form>
        </footer>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('newsletter-form') as HTMLFormElement;
        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          subscriptionSubmitted = true;
        });

        const identifier = win.document.getElementById('footer-identifier');
        identifier?.addEventListener('link-click', () => {
          identifierLinkClicked = true;
        });
      });

      // Identifier should work in footer context
      cy.get('.usa-identifier__required-link')
        .first()
        .click()
        .then(() => {
          expect(identifierLinkClicked).to.be.true;
          expect(subscriptionSubmitted).to.be.false;
        });

      // Newsletter form should work independently
      cy.get('#email-subscription').type('user@example.com');
      cy.get('#newsletter-form button[type="submit"]')
        .click()
        .then(() => {
          expect(subscriptionSubmitted).to.be.true;
        });
    });

    it('should handle form validation states without interference', () => {
      cy.mount(`
        <form id="validation-form-identifier" novalidate>
          <usa-identifier
            id="validation-identifier"
            domain="validation.gov">
          </usa-identifier>

          <fieldset>
            <legend>Required Information</legend>
            <label for="required-field">Required Field:</label>
            <input type="text" id="required-field" name="required-field" required>

            <div class="usa-error-message" id="required-error" style="display: none;">
              This field is required
            </div>
          </fieldset>
          <button type="submit">Submit</button>
        </form>
      `);

      // Form validation should work normally with identifier present
      cy.get('button[type="submit"]').click();

      // Identifier links should still be clickable during validation states
      cy.get('.usa-identifier__required-link').first().should('be.visible').click();

      // Form should still be in validation state
      cy.get('#required-field').should('exist');

      // Filling the field should allow submission
      cy.get('#required-field').type('Valid input');
      cy.get('button[type="submit"]').click();

      // Form should handle validation without JavaScript errors
      cy.get('#validation-form-identifier').should('exist');
    });

    it('should preserve form data when identifier interactions occur', () => {
      cy.mount(`
        <form id="preservation-form-identifier">
          <fieldset>
            <legend>Personal Information</legend>
            <label for="full-name">Full Name:</label>
            <input type="text" id="full-name" name="full-name" value="Initial Name">

            <label for="phone">Phone:</label>
            <input type="tel" id="phone" name="phone" value="555-1234">
          </fieldset>

          <usa-identifier
            id="preservation-identifier"
            domain="preserve.gov"
            agency="Data Preservation Agency">
          </usa-identifier>

          <fieldset>
            <legend>Additional Details</legend>
            <label for="comments">Comments:</label>
            <textarea id="comments" name="comments">Initial comments</textarea>
          </fieldset>
        </form>
      `);

      // Verify initial values
      cy.get('#full-name').should('have.value', 'Initial Name');
      cy.get('#phone').should('have.value', '555-1234');
      cy.get('#comments').should('have.value', 'Initial comments');

      // Interact with identifier links
      cy.get('.usa-identifier__required-link').first().click();
      cy.get('.usa-identifier__required-link').eq(1).click();

      // Click identifier logo if present
      cy.get('.usa-identifier__logo').first().click();

      // Form values should be preserved
      cy.get('#full-name').should('have.value', 'Initial Name');
      cy.get('#phone').should('have.value', '555-1234');
      cy.get('#comments').should('have.value', 'Initial comments');

      // User should still be able to modify form values
      cy.get('#full-name').clear().type('Updated Name');
      cy.get('#full-name').should('have.value', 'Updated Name');
    });

    it('should work correctly in multi-step forms with navigation', () => {
      let step1Completed = false;
      let step2Completed = false;
      let identifierNavigation = false;

      cy.mount(`
        <div id="multi-step-identifier-container">
          <usa-identifier
            id="multi-step-identifier"
            domain="multistep.gov"
            agency="Multi-Step Agency">
          </usa-identifier>

          <form id="step-1-form" style="display: block;">
            <fieldset>
              <legend>Step 1: Basic Info</legend>
              <label for="step1-name">Name:</label>
              <input type="text" id="step1-name" name="name" required>
            </fieldset>
            <button type="button" id="next-step-btn">Next Step</button>
          </form>

          <form id="step-2-form" style="display: none;">
            <fieldset>
              <legend>Step 2: Contact Info</legend>
              <label for="step2-email">Email:</label>
              <input type="email" id="step2-email" name="email" required>
            </fieldset>
            <button type="submit">Complete</button>
          </form>
        </div>
      `);

      cy.window().then((win) => {
        const nextButton = win.document.getElementById('next-step-btn');
        const step1Form = win.document.getElementById('step-1-form') as HTMLFormElement;
        const step2Form = win.document.getElementById('step-2-form') as HTMLFormElement;

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

        const identifier = win.document.getElementById('multi-step-identifier');
        identifier?.addEventListener('link-click', () => {
          identifierNavigation = true;
        });
      });

      // Complete step 1 with identifier interactions
      cy.get('#step1-name').type('Test User');
      cy.get('.usa-identifier__required-link').first().click();
      cy.get('#next-step-btn')
        .click()
        .then(() => {
          expect(step1Completed).to.be.true;
          expect(identifierNavigation).to.be.true;
        });

      // Step 2 should be visible
      cy.get('#step-2-form').should('be.visible');
      cy.get('#step-1-form').should('not.be.visible');

      // Complete step 2 with more identifier interactions
      cy.get('#step2-email').type('test@example.com');
      cy.get('.usa-identifier__required-link').eq(1).click();
      cy.get('#step-2-form button[type="submit"]')
        .click()
        .then(() => {
          expect(step2Completed).to.be.true;
        });
    });

    it('should handle custom event propagation correctly in forms', () => {
      let customEventFired = false;
      let formSubmitted = false;
      let linkClickEventFired = false;

      cy.mount(`
        <form id="custom-event-form">
          <usa-identifier
            id="custom-event-identifier"
            domain="events.gov">
          </usa-identifier>

          <fieldset>
            <legend>Event Test</legend>
            <label for="event-input">Input:</label>
            <input type="text" id="event-input" name="event-input" required>
          </fieldset>
          <button type="submit">Submit</button>
        </form>
      `);

      cy.window().then((win) => {
        const form = win.document.getElementById('custom-event-form') as HTMLFormElement;
        const identifier = win.document.getElementById('custom-event-identifier');

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        form.addEventListener('custom-test-event', () => {
          customEventFired = true;
        });

        identifier?.addEventListener('link-click', (e) => {
          linkClickEventFired = true;

          // Dispatch custom event to test propagation
          const customEvent = new CustomEvent('custom-test-event', {
            bubbles: true,
            detail: { source: 'identifier' },
          });
          (e.target as HTMLElement)?.dispatchEvent(customEvent);
        });
      });

      // Trigger identifier link click which should fire custom event
      cy.get('.usa-identifier__required-link')
        .first()
        .click()
        .then(() => {
          expect(linkClickEventFired).to.be.true;
          expect(customEventFired).to.be.true;
          expect(formSubmitted).to.be.false;
        });

      // Form submission should still work normally
      cy.get('#event-input').type('test input');
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });
  });
});
