/**
 * Header Navigation - Browser-Dependent Tests
 *
 * These tests were migrated from Vitest because they require real browser APIs:
 * - Dropdown menu interactions
 * - Body padding compensation
 * - Focus management
 * - Click outside detection
 *
 * See: cypress/BROWSER_TESTS_MIGRATION_PLAN.md
 * Source: src/components/header/usa-header-behavior.test.ts
 */

describe('Header Navigation', () => {
  describe('Basic Navigation - Default Story', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=navigation-header--default&viewMode=story');
      cy.injectAxe();
    });

    describe('Body Padding Compensation', () => {
    it('should add padding to body when opening mobile nav', () => {
      cy.viewport('iphone-6'); // Mobile viewport

      // Get initial body padding
      cy.get('body').then(($body) => {
        const initialPadding = parseFloat(window.getComputedStyle($body[0]).paddingTop);

        // Open mobile nav
        cy.get('.usa-menu-btn').click();

        cy.wait(100);

        // Body should have additional padding
        cy.get('body').then(($body2) => {
          const newPadding = parseFloat(window.getComputedStyle($body2[0]).paddingTop);
          expect(newPadding).to.be.greaterThan(initialPadding);
        });
      });
    });

    it('should remove padding when closing mobile nav', () => {
      cy.viewport('iphone-6');

      // Open mobile nav
      cy.get('.usa-menu-btn').click();
      cy.wait(100);

      // Get padding with nav open
      cy.get('body').then(($body) => {
        const openPadding = parseFloat(window.getComputedStyle($body[0]).paddingTop);

        // Close nav
        cy.get('.usa-nav__close').click();
        cy.wait(100);

        // Padding should be removed
        cy.get('body').then(($body2) => {
          const closedPadding = parseFloat(window.getComputedStyle($body2[0]).paddingTop);
          expect(closedPadding).to.be.lessThan(openPadding);
        });
      });
    });
  });

    describe('Mobile Navigation', () => {
      beforeEach(() => {
        cy.viewport('iphone-6');
      });

      it('should toggle mobile menu on button click', () => {
        cy.get('.usa-menu-btn').click();

        cy.get('.usa-nav').should('be.visible').and('have.class', 'is-visible');
      });

      it('should close mobile menu when clicking close button', () => {
        // Open menu
        cy.get('.usa-menu-btn').click();
        cy.get('.usa-nav').should('be.visible');

        // Close menu
        cy.get('.usa-nav__close').click();

        cy.get('.usa-nav').should('not.have.class', 'is-visible');
      });

      it('should trap focus within mobile menu when open', () => {
        cy.get('.usa-menu-btn').click();

        cy.wait(100);

        // Tab through elements
        cy.focused().tab().tab().tab();

        // Focus should stay within nav
        cy.focused().parents('.usa-nav').should('exist');
      });
    });

    describe('Basic Accessibility', () => {
      it('should have proper ARIA labels', () => {
        cy.get('.usa-menu-btn').should('have.attr', 'aria-label');
        cy.get('.usa-nav__close').should('have.attr', 'aria-label');
      });

      it('should pass axe accessibility checks', () => {
        cy.checkA11y('.usa-header', {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        });
      });
    });
  });

  describe('Extended Navigation - Extended Story', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=navigation-header--extended&viewMode=story');
      cy.injectAxe();
    });

    describe('Dropdown Navigation', () => {
    it('should have nav control buttons for dropdowns', () => {
      cy.get('usa-header').within(() => {
        cy.get('.usa-nav__primary-item > button').should('exist');
      });
    });

    it('should toggle dropdown when clicking nav control', () => {
      cy.get('.usa-nav__primary-item > button').first().as('navButton');

      // Click to open
      cy.get('@navButton').click();

      cy.get('.usa-nav__submenu')
        .first()
        .should('be.visible')
        .and('have.attr', 'aria-hidden', 'false');

      // Click to close
      cy.get('@navButton').click();

      cy.get('.usa-nav__submenu')
        .first()
        .should('not.be.visible')
        .and('have.attr', 'aria-hidden', 'true');
    });

    it('should close dropdown when clicking outside', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().click();

      cy.get('.usa-nav__submenu').first().should('be.visible');

      // Click outside
      cy.get('body').click('topLeft');

      cy.wait(100);

      // Dropdown should close
      cy.get('.usa-nav__submenu').first().should('not.be.visible');
    });

    it('should close dropdown when focus leaves nav', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().click();

      cy.get('.usa-nav__submenu').first().should('be.visible');

      // Tab away from navigation
      cy.focused().tab();
      cy.focused().parents('.usa-nav').should('not.exist');

      cy.wait(100);

      // Dropdown should close
      cy.get('.usa-nav__submenu').first().should('not.be.visible');
    });
  });

  describe('Keyboard Behavior', () => {
    it('should close dropdown on Escape key', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().click();

      cy.get('.usa-nav__submenu').first().should('be.visible');

      // Press Escape
      cy.get('body').type('{esc}');

      // Dropdown should close
      cy.get('.usa-nav__submenu').first().should('not.be.visible');
    });

    it('should focus nav control button after closing with Escape', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().as('navButton').click();

      cy.get('.usa-nav__submenu').first().should('be.visible');

      // Press Escape
      cy.get('body').type('{esc}');

      // Nav control button should have focus
      cy.get('@navButton').should('have.focus');
    });

    it('should navigate dropdown items with arrow keys', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().click();

      // Focus first item
      cy.get('.usa-nav__submenu a').first().focus();

      // Use arrow down to navigate
      cy.focused().type('{downarrow}');

      // Should move to next item
      cy.focused().should('not.be', cy.get('.usa-nav__submenu a').first());
    });
  });

    describe('Dropdown Accessibility', () => {
      it('should have proper ARIA attributes on nav controls', () => {
        cy.get('.usa-nav__primary-item > button').first().as('navButton');

        // Should have aria-expanded
        cy.get('@navButton').should('have.attr', 'aria-expanded', 'false');

        // Open dropdown
        cy.get('@navButton').click();

        // aria-expanded should update
        cy.get('@navButton').should('have.attr', 'aria-expanded', 'true');
      });
    });
  });
});
