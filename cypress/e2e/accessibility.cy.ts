// cypress/e2e/accessibility.cy.ts
describe('USWDS Components Accessibility Tests', () => {
  const components = [
    { name: 'accordion', story: 'default' },
    { name: 'alert', story: 'default' },
    { name: 'button', story: 'default' },
    { name: 'tooltip', story: 'default' },
  ];

  components.forEach(({ name, story }) => {
    describe(`${name} accessibility`, () => {
      beforeEach(() => {
        cy.selectStory(`components-${name}`, story);
        // Note: Axe injection moved to individual tests to avoid race conditions
        // See Session 7 findings on axe injection pattern
      });

      it(`should meet WCAG accessibility standards`, () => {
        // Inject axe per-test to avoid race conditions
        cy.injectAxe();
        cy.wait(500); // Wait for axe to be ready

        cy.checkAccessibility({
          rules: {
            'color-contrast': { enabled: true },
            'keyboard-navigation': { enabled: true },
            'focus-management': { enabled: true },
          }
        });
      });

      it(`should be keyboard navigable`, () => {
        // Test tab navigation
        cy.get('body').tab();
        cy.focused().should('be.visible');
        
        // Test that all interactive elements can receive focus
        cy.get('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')
          .each(($el) => {
            cy.wrap($el).focus().should('be.focused');
          });
      });

      it(`should have proper ARIA attributes`, () => {
        // Check for required ARIA attributes based on component type
        cy.get('[role]').should('exist');
        
        // Verify no elements have empty or invalid ARIA attributes
        cy.get('[aria-label=""], [aria-labelledby=""], [aria-describedby=""]')
          .should('not.exist');
      });
    });
  });

  describe('Global accessibility checks', () => {
    it('should have no accessibility violations across all components', () => {
      components.forEach(({ name, story }) => {
        cy.selectStory(`components-${name}`, story);
        // Inject axe per-component to avoid race conditions
        cy.injectAxe();
        cy.wait(500); // Wait for axe to be ready
        cy.checkAccessibility();
      });
    });
  });
});