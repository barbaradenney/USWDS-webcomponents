// cypress/support/e2e.ts
import 'cypress-axe';
import 'cypress-plugin-tab';

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then((win) => {
    const script = win.document.createElement('script');
    script.src = 'https://unpkg.com/axe-core@4.7.0/axe.min.js';
    script.async = false;
    win.document.head.appendChild(script);
  });
});

// Add custom commands for USWDS components
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('checkAccessibility', (options = {}) => {
  cy.checkA11y(undefined, options);
});

// Custom command to visit Storybook stories
Cypress.Commands.add('visitStory', (component: string, story: string) => {
  const storyPath = `${component}--${story}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  cy.visit(`http://localhost:6006/iframe.html?id=${storyPath}`);
  cy.wait(1000); // Wait for story to load
});

/**
 * Wait for Storybook decorator initialization to complete
 *
 * Storybook's decorator uses double requestAnimationFrame before components are ready.
 * This command waits for that timing to complete (~32ms @ 60fps).
 *
 * See: docs/STORYBOOK_CYPRESS_TIMING_ANALYSIS.md for detailed explanation
 */
Cypress.Commands.add('waitForStorybook', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      // Wait for Storybook decorator's double requestAnimationFrame
      win.requestAnimationFrame(() => {
        win.requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      injectAxe(): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      checkAccessibility(options?: any): Chainable<void>;
      visitStory(component: string, story: string): Chainable<void>;
      /**
       * Wait for Storybook decorator initialization to complete
       *
       * Waits for Storybook's double requestAnimationFrame timing (~32ms)
       * to ensure components are fully initialized before testing.
       */
      waitForStorybook(): Chainable<void>;
    }
  }
}