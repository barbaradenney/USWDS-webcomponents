/**
 * In-Page Navigation Scroll Behavior - Browser-Dependent Tests
 *
 * These tests were migrated from Vitest because they require real browser APIs:
 * - Scroll behavior and offset calculations
 * - Keyboard navigation with focus management
 * - Data attribute customization with real DOM
 *
 * See: cypress/BROWSER_TESTS_MIGRATION_PLAN.md
 * Source: src/components/in-page-navigation/usa-in-page-navigation-behavior.test.ts
 */

describe('In-Page Navigation Scroll Behavior', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?id=components-in-page-navigation--default&viewMode=story');
    cy.injectAxe();
  });

  describe('Scroll Behavior', () => {
    it('should prevent default on link click', () => {
      let defaultPrevented = false;

      cy.get('usa-in-page-navigation').within(() => {
        cy.get('a').first().then(($link) => {
          $link.on('click', (e) => {
            defaultPrevented = e.isDefaultPrevented();
          });

          $link[0].click();
        });
      });

      // Default should be prevented to allow smooth scroll
      cy.wrap(null).should(() => {
        expect(defaultPrevented).to.be.true;
      });
    });

    it('should respect scroll offset data attribute', () => {
      // Set custom scroll offset
      cy.get('usa-in-page-navigation').then(($el) => {
        $el.attr('data-scroll-offset', '100');
      });

      // Get initial scroll position
      cy.window().then((win) => {
        const initialScroll = win.scrollY;

        // Click a navigation link
        cy.get('usa-in-page-navigation a').first().click();

        cy.wait(500); // Wait for scroll animation

        // Should have scrolled with offset
        cy.window().then((win2) => {
          expect(win2.scrollY).not.to.equal(initialScroll);
        });
      });
    });

    it('should smooth scroll to target section', () => {
      cy.window().then((win) => {
        const initialScroll = win.scrollY;

        cy.get('usa-in-page-navigation a').eq(1).click();

        cy.wait(500);

        // Should have scrolled
        cy.window().then((win2) => {
          expect(win2.scrollY).to.be.greaterThan(initialScroll);
        });
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should reset tabindex to -1 after heading loses focus', () => {
      // Focus a navigation link
      cy.get('usa-in-page-navigation a').first().focus();

      cy.wait(100);

      // Get the target heading ID
      cy.get('usa-in-page-navigation a').first().then(($link) => {
        const href = $link.attr('href');
        const targetId = href?.replace('#', '');

        // Click to navigate
        $link[0].click();

        cy.wait(500);

        // Target heading should be focused
        cy.get(`#${targetId}`).should('have.focus');

        // Tab away
        cy.focused().tab();

        cy.wait(100);

        // Heading should have tabindex -1
        cy.get(`#${targetId}`).should('have.attr', 'tabindex', '-1');
      });
    });

    it('should navigate with arrow keys', () => {
      cy.get('usa-in-page-navigation a').first().focus();

      // Press down arrow
      cy.focused().type('{downarrow}');

      // Should move to next link
      cy.focused().should('match', 'usa-in-page-navigation a');
      cy.focused().should('not.be', cy.get('usa-in-page-navigation a').first());
    });

    it('should navigate with up arrow', () => {
      cy.get('usa-in-page-navigation a').eq(1).focus();

      // Press up arrow
      cy.focused().type('{uparrow}');

      // Should move to previous link
      cy.get('usa-in-page-navigation a').first().should('have.focus');
    });
  });

  describe('Customization Data Attributes', () => {
    it('should use custom title from data-title-text', () => {
      cy.get('usa-in-page-navigation').then(($el) => {
        $el.attr('data-title-text', 'Custom Navigation Title');
      });

      cy.wait(100);

      cy.get('usa-in-page-navigation').within(() => {
        cy.contains('Custom Navigation Title').should('exist');
      });
    });

    it('should use custom heading level from data-title-heading-level', () => {
      cy.get('usa-in-page-navigation').then(($el) => {
        $el.attr('data-title-heading-level', 'h3');
      });

      cy.wait(100);

      // Title should be rendered as h3
      cy.get('usa-in-page-navigation h3').should('exist');
    });

    it('should use custom heading elements from data-heading-elements', () => {
      // Visit a page with custom content structure
      cy.visit('/iframe.html?id=components-in-page-navigation--custom-headings&viewMode=story');

      cy.get('usa-in-page-navigation').then(($el) => {
        $el.attr('data-heading-elements', 'h3');
      });

      cy.wait(200);

      // Should generate links from h3 elements
      cy.get('usa-in-page-navigation a').should('have.length.at.least', 1);
    });

    it('should handle multiple heading selectors', () => {
      cy.get('usa-in-page-navigation').then(($el) => {
        $el.attr('data-heading-elements', 'h2, h3');
      });

      cy.wait(200);

      // Should generate links from both h2 and h3 elements
      cy.get('usa-in-page-navigation a').should('have.length.at.least', 1);
    });
  });

  describe('Active State Management', () => {
    it('should update active link on scroll', () => {
      // Scroll to a section
      cy.window().then((win) => {
        win.scrollTo(0, 500);
      });

      cy.wait(500);

      // An active link should exist
      cy.get('usa-in-page-navigation .usa-current').should('exist');
    });

    it('should only have one active link at a time', () => {
      cy.window().then((win) => {
        win.scrollTo(0, 500);
      });

      cy.wait(500);

      // Only one link should be active
      cy.get('usa-in-page-navigation .usa-current').should('have.length', 1);
    });
  });

  describe('Sticky Behavior', () => {
    it('should stick to viewport when scrolling', () => {
      // Get initial position
      cy.get('usa-in-page-navigation').then(($el) => {
        const initialTop = $el[0].getBoundingClientRect().top;

        // Scroll down
        cy.scrollTo(0, 500);

        cy.wait(100);

        // Should maintain position (sticky)
        cy.get('usa-in-page-navigation').then(($el2) => {
          const newTop = $el2[0].getBoundingClientRect().top;
          // Top position should be similar (sticky)
          expect(Math.abs(newTop - initialTop)).to.be.lessThan(50);
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation landmark', () => {
      cy.get('usa-in-page-navigation nav').should('have.attr', 'aria-label');
    });

    it('should have proper heading hierarchy', () => {
      // Title should be a heading
      cy.get('usa-in-page-navigation').within(() => {
        cy.get('h2, h3, h4').should('exist');
      });
    });

    it('should pass axe accessibility checks', () => {
      cy.checkA11y('usa-in-page-navigation', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      });
    });
  });
});
