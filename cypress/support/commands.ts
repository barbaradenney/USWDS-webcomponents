// cypress/support/commands.ts

// USWDS-specific custom commands

/**
 * Wait for Storybook iframe to be ready
 *
 * Storybook 9+ uses iframe rendering where stories render directly in the document body.
 * This is different from Storybook 6 which used #storybook-root.
 */
Cypress.Commands.add('waitForStorybook', () => {
  // In iframe mode, components render directly in body
  // Wait for body to be visible (it always will be, but this ensures page load)
  cy.get('body').should('be.visible');
});

/**
 * Select and load a Storybook story using the iframe pattern
 *
 * IMPORTANT: Uses /iframe.html direct rendering (Storybook 9+ best practice)
 * This is the official recommended approach per Storybook documentation:
 * https://storybook.js.org/docs/writing-tests/integrations/stories-in-end-to-end-tests
 *
 * @param component - Component ID in kebab-case (e.g., 'components-modal')
 * @param story - Story name in kebab-case (e.g., 'default')
 *
 * @example
 * cy.selectStory('components-modal', 'default');
 * // Visits: /iframe.html?id=components-modal--default&viewMode=story
 */
Cypress.Commands.add('selectStory', (component: string, story: string) => {
  cy.visit(`/iframe.html?id=${component}--${story}&viewMode=story`);
  cy.wait(1000); // Wait for component mount + USWDS initialization
  cy.waitForStorybook();
});

Cypress.Commands.add('visualTest', (testName: string) => {
  // For visual regression testing - can be expanded with percy or other tools
  cy.screenshot(testName);
});

declare global {
  namespace Cypress {
    interface Chainable {
      waitForStorybook(): Chainable<void>;
      selectStory(component: string, story: string): Chainable<void>;
      visualTest(testName: string): Chainable<void>;
    }
  }
}