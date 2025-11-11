// cypress/e2e/accessibility.cy.ts
describe('USWDS Components Accessibility Tests', () => {
  const components = [
    { name: 'accordion', story: 'default', category: 'structure' },
    { name: 'alert', story: 'default', category: 'feedback' },
    { name: 'button', story: 'default', category: 'actions' },
    { name: 'tooltip', story: 'default', category: 'feedback' },
  ];

  components.forEach(({ name, story, category }) => {
    describe(`${name} accessibility`, () => {
      beforeEach(() => {
        cy.selectStory(`${category}-${name}`, story);
        // Note: Axe injection moved to individual tests to avoid race conditions
        // See Session 7 findings on axe injection pattern
      });

      it(`should meet WCAG accessibility standards`, () => {
        // Inject axe per-test to avoid race conditions
        cy.injectAxe();
        cy.wait(500); // Wait for axe to be ready

        // Run axe with standard WCAG rules
        // Note: 'keyboard-navigation' and 'focus-management' are not valid axe-core rules
        // Keyboard and focus testing is handled in separate test cases below
        cy.checkAccessibility({
          rules: {
            'color-contrast': { enabled: true },
          }
        });
      });

      it(`should be keyboard navigable`, () => {
        // Wait for component initialization
        cy.wait(300);

        // Test tab navigation
        cy.get('body').tab();
        cy.wait(200); // Wait for focus to settle
        cy.focused().should('be.visible');

        // Test that all interactive elements can receive focus
        cy.get('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')
          .each(($el) => {
            cy.wrap($el).focus();
            cy.wait(150); // Wait for focus to settle on each element
            cy.wrap($el).should('be.focused');
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
      components.forEach(({ name, story, category }) => {
        cy.selectStory(`${category}-${name}`, story);
        // Inject axe per-component to avoid race conditions
        cy.injectAxe();
        cy.wait(500); // Wait for axe to be ready
        cy.checkAccessibility();
      });
    });
  });
});