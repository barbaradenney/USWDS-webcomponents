// cypress/support/component.ts
import 'cypress-axe';

// Import commands.js using ES2015 syntax:
import './commands';

// Simple mount function for web components
function mount(template: string, options?: { container?: HTMLElement }): Cypress.Chainable {
  return cy.then(() => {
    const container = options?.container || document.body;
    
    // Clear the container
    container.innerHTML = '';
    
    // Add the template
    container.innerHTML = template;
    
    // Wait for custom elements to upgrade
    return cy.wait(100).then(() => {
      // Return the mounted element(s)
      return cy.wrap(container.children);
    });
  });
}

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      injectAxe(): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      checkAccessibility(options?: any): Chainable<void>;
    }
  }
}

Cypress.Commands.add('mount', mount);
Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then((win) => {
    const script = win.document.createElement('script');
    script.src = 'https://unpkg.com/axe-core@4.7.0/axe.min.js';
    script.async = false;
    win.document.head.appendChild(script);
  });
});

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('checkAccessibility', (options = {}) => {
  cy.checkA11y(undefined, options);
});