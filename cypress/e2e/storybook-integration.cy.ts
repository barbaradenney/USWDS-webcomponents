// cypress/e2e/storybook-integration.cy.ts
describe('Storybook Integration Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006');
  });

  it('should test Button component from Storybook', () => {
    // Visit a specific story
    cy.selectStory('components-button', 'primary');
    
    // Test the component
    cy.get('usa-button').should('exist');
    cy.get('usa-button').should('contain.text', 'Button');
    cy.get('usa-button').should('have.class', 'usa-button');
    
    // Test accessibility
    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should test Alert component from Storybook', () => {
    // Visit a specific story
    cy.selectStory('components-alert', 'default');
    
    // Test the component
    cy.get('usa-alert').should('exist');
    cy.get('usa-alert').should('have.class', 'usa-alert');
    
    // Test accessibility
    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should test Accordion component interactions from Storybook', () => {
    // Visit the interactive story
    cy.selectStory('components-accordion', 'default');
    
    // Test accordion functionality
    cy.get('usa-accordion').should('exist');
    cy.get('usa-accordion .usa-accordion__button').first().click();
    cy.get('usa-accordion .usa-accordion__content').first().should('be.visible');
    
    // Test accessibility
    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should test form components from Storybook', () => {
    // Test multiple form components
    const formComponents = [
      ['components-text-input', 'default'],
      ['components-checkbox', 'default'],
      ['components-radio', 'default'],
      ['components-select', 'default']
    ];

    formComponents.forEach(([category, story]) => {
      cy.selectStory(category, story);
      
      // Basic component existence test
      cy.get('[class*="usa-"]').should('exist');
      
      // Test accessibility for each component
      cy.injectAxe();
      cy.checkAccessibility();
    });
  });

  it('should test responsive behavior from Storybook', () => {
    cy.selectStory('components-header', 'default');
    
    // Test desktop view
    cy.viewport(1280, 720);
    cy.get('usa-header').should('exist');
    
    // Test mobile view
    cy.viewport(375, 667);
    cy.get('usa-header').should('exist');
    
    // Test accessibility
    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should test all component stories load without errors', () => {
    // This test visits multiple stories to ensure they all load
    const stories = [
      ['components-banner', 'default'],
      ['components-breadcrumb', 'default'],
      ['components-card', 'default'],
      ['components-footer', 'default'],
      ['components-icon', 'default']
    ];

    stories.forEach(([category, story]) => {
      cy.selectStory(category, story);
      
      // Check for JavaScript errors
      cy.window().then((win) => {
        expect(win.console.error).to.not.have.been.called;
      });
      
      // Ensure story content loaded
      cy.get('body').should('not.contain', 'Story not found');
    });
  });
});