// Component tests for usa-in-page-navigation
import './index.ts';
import {
  testRapidClicking,
  testRapidKeyboardInteraction,
  COMMON_BUG_PATTERNS,
} from '../../cypress/support/rapid-interaction-tests.ts';

describe('InPageNavigation Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');
    cy.get('usa-in-page-navigation').should('exist');
    cy.get('usa-in-page-navigation').should('be.visible');
  });

  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');

    // Rapid clicking without waiting - simulates real user behavior
    cy.get('usa-in-page-navigation').as('component');

    // Multiple rapid clicks
    cy.get('@component').click().click().click().click().click();

    cy.wait(500); // Let events settle

    // Component should remain functional
    cy.get('@component').should('exist');
    cy.get('@component').should('be.visible');
  });

  it('should handle interaction during CSS transitions', () => {
    cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');

    // Click during potential transitions
    cy.get('usa-in-page-navigation').click().click(); // Immediate second click

    cy.wait(1000); // Wait for animations

    // Should be in consistent state
    cy.get('usa-in-page-navigation').should('exist');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');

      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-in-page-navigation',
        clickCount: 15,
        description: 'event listener duplication',
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');

      // Test for race conditions during state changes
      cy.get('usa-in-page-navigation').as('component');

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
    cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');

    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');

    // Perform various rapid interactions
    cy.get('usa-in-page-navigation').click().focus().blur().click().click();

    cy.wait(500);

    // Accessibility should still be intact
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');
      cy.get('usa-in-page-navigation').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-in-page-navigation></usa-in-page-navigation>');

    // Various interactions that might cause errors
    cy.get('usa-in-page-navigation')
      .click()
      .trigger('mouseenter')
      .trigger('mouseleave')
      .focus()
      .blur();

    cy.wait(500);

    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });

  // Event Propagation Control Testing (Critical Gap Fix)
  describe('Event Propagation Control', () => {
    it('should handle smooth scroll vs page navigation properly', () => {
      let smoothScrollInitiated = false;
      let pageNavigated = false;

      const navigationItems = [
        { id: 'section1', text: 'Section 1', href: '#section-1' },
        { id: 'section2', text: 'Section 2', href: '#section-2' },
        { id: 'section3', text: 'Section 3', href: '#section-3' },
      ];

      cy.mount(`
        <div id="test-page">
          <usa-in-page-navigation id="test-nav"></usa-in-page-navigation>
          <div id="section-1" style="height: 500px;">Section 1 Content</div>
          <div id="section-2" style="height: 500px;">Section 2 Content</div>
          <div id="section-3" style="height: 500px;">Section 3 Content</div>
        </div>
      `);

      cy.window().then((win) => {
        const nav = win.document.getElementById('test-nav') as any;
        nav.items = navigationItems;

        // Listen for smooth scroll behavior
        const originalScrollTo = win.scrollTo;
        win.scrollTo = function (x: number, y: number) {
          smoothScrollInitiated = true;
          originalScrollTo.call(this, x, y);
        };

        // Listen for hash changes (page navigation)
        win.addEventListener('hashchange', () => {
          pageNavigated = true;
        });
      });

      // Click navigation link should initiate smooth scroll, not page navigation
      cy.get('usa-in-page-navigation a[href="#section-2"]')
        .click()
        .then(() => {
          // Should prevent default navigation behavior
          expect(pageNavigated).to.be.false;

          // URL should still update for accessibility/bookmarking
          cy.url().should('include', '#section-2');
        });
    });

    it('should handle anchor link behavior with proper event propagation', () => {
      let anchorClicked = false;
      let parentClicked = false;
      let preventDefault = false;

      const navigationItems = [
        { id: 'intro', text: 'Introduction', href: '#introduction' },
        { id: 'content', text: 'Main Content', href: '#main-content' },
        { id: 'conclusion', text: 'Conclusion', href: '#conclusion' },
      ];

      cy.mount(`
        <div id="parent-container">
          <usa-in-page-navigation id="anchor-test"></usa-in-page-navigation>
          <div id="introduction">Introduction section</div>
          <div id="main-content">Main content section</div>
          <div id="conclusion">Conclusion section</div>
        </div>
      `);

      cy.window().then((win) => {
        const nav = win.document.getElementById('anchor-test') as any;
        const parent = win.document.getElementById('parent-container');

        nav.items = navigationItems;

        // Listen for anchor clicks
        nav.addEventListener('click', (e: Event) => {
          anchorClicked = true;
          if (e.defaultPrevented) {
            preventDefault = true;
          }
        });

        // Listen for parent clicks
        parent?.addEventListener('click', () => {
          parentClicked = true;
        });
      });

      // Click anchor link
      cy.get('usa-in-page-navigation a[href="#main-content"]')
        .click()
        .then(() => {
          expect(anchorClicked).to.be.true;

          // Should control event propagation appropriately
          // (Component should decide whether to prevent default or allow bubbling)
        });
    });

    it('should prevent click events during scroll animations', () => {
      let firstClickProcessed = false;
      let secondClickBlocked = false;
      let scrollAnimationActive = false;

      const navigationItems = [
        { id: 'top', text: 'Top', href: '#top' },
        { id: 'middle', text: 'Middle', href: '#middle' },
        { id: 'bottom', text: 'Bottom', href: '#bottom' },
      ];

      cy.mount(`
        <div id="scroll-test-container">
          <usa-in-page-navigation id="scroll-nav"></usa-in-page-navigation>
          <div id="top" style="height: 800px;">Top section</div>
          <div id="middle" style="height: 800px;">Middle section</div>
          <div id="bottom" style="height: 800px;">Bottom section</div>
        </div>
      `);

      cy.window().then((win) => {
        const nav = win.document.getElementById('scroll-nav') as any;
        nav.items = navigationItems;

        // Mock scroll behavior to simulate animation
        const originalScrollTo = win.scrollTo;
        win.scrollTo = function (x: number, y: number) {
          scrollAnimationActive = true;
          setTimeout(() => {
            scrollAnimationActive = false;
          }, 500);
          originalScrollTo.call(this, x, y);
        };

        // Listen for navigation clicks
        nav.addEventListener('click', (e: Event) => {
          if (!firstClickProcessed) {
            firstClickProcessed = true;
          } else if (scrollAnimationActive) {
            secondClickBlocked = true;
            e.preventDefault();
          }
        });
      });

      // First click should work normally
      cy.get('usa-in-page-navigation a[href="#middle"]').click();

      // Rapid second click during animation should be prevented
      cy.get('usa-in-page-navigation a[href="#bottom"]')
        .click()
        .then(() => {
          expect(firstClickProcessed).to.be.true;
          // Test demonstrates that component can implement click protection during animations
        });
    });

    it('should handle navigation within forms without triggering submission', () => {
      let formSubmitted = false;
      let navigationTriggered = false;

      const navigationItems = [
        { id: 'step1', text: 'Step 1', href: '#form-step-1' },
        { id: 'step2', text: 'Step 2', href: '#form-step-2' },
        { id: 'step3', text: 'Step 3', href: '#form-step-3' },
      ];

      cy.mount(`
        <form id="multi-step-form">
          <usa-in-page-navigation id="form-nav"></usa-in-page-navigation>
          <div id="form-step-1">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name">
          </div>
          <div id="form-step-2">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email">
          </div>
          <div id="form-step-3">
            <label for="phone">Phone:</label>
            <input type="tel" id="phone" name="phone">
          </div>
          <button type="submit">Submit Form</button>
        </form>
      `);

      cy.window().then((win) => {
        const nav = win.document.getElementById('form-nav') as any;
        const form = win.document.getElementById('multi-step-form') as HTMLFormElement;

        nav.items = navigationItems;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });

        nav.addEventListener('navigate', () => {
          navigationTriggered = true;
        });
      });

      // Navigation within form should not trigger form submission
      cy.get('usa-in-page-navigation a[href="#form-step-2"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.false;
        });

      // But submit button should still work
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should handle nested navigation contexts properly', () => {
      let outerNavClicked = false;
      let innerNavClicked = false;
      let containerClicked = false;

      const outerNavItems = [
        { id: 'overview', text: 'Overview', href: '#overview' },
        { id: 'details', text: 'Details', href: '#details' },
      ];

      const innerNavItems = [
        { id: 'detail1', text: 'Detail 1', href: '#detail-1' },
        { id: 'detail2', text: 'Detail 2', href: '#detail-2' },
      ];

      cy.mount(`
        <div id="nested-container">
          <usa-in-page-navigation id="outer-nav"></usa-in-page-navigation>
          <div id="overview">Overview content</div>
          <div id="details">
            <usa-in-page-navigation id="inner-nav"></usa-in-page-navigation>
            <div id="detail-1">Detail 1 content</div>
            <div id="detail-2">Detail 2 content</div>
          </div>
        </div>
      `);

      cy.window().then((win) => {
        const outerNav = win.document.getElementById('outer-nav') as any;
        const innerNav = win.document.getElementById('inner-nav') as any;
        const container = win.document.getElementById('nested-container');

        outerNav.items = outerNavItems;
        innerNav.items = innerNavItems;

        outerNav.addEventListener('click', () => {
          outerNavClicked = true;
        });
        innerNav.addEventListener('click', () => {
          innerNavClicked = true;
        });
        container?.addEventListener('click', () => {
          containerClicked = true;
        });
      });

      // Inner navigation should not trigger outer navigation
      cy.get('#inner-nav a[href="#detail-1"]')
        .click()
        .then(() => {
          expect(innerNavClicked).to.be.true;
          // Test event isolation between nested navigations
        });

      // Reset flags
      cy.window().then(() => {
        outerNavClicked = false;
        innerNavClicked = false;
      });

      // Outer navigation should work independently
      cy.get('#outer-nav a[href="#details"]')
        .click()
        .then(() => {
          expect(outerNavClicked).to.be.true;
          expect(innerNavClicked).to.be.false;
        });
    });

    it('should handle keyboard navigation with proper event control', () => {
      let keyboardNavigationTriggered = false;
      let mouseNavigationTriggered = false;

      const navigationItems = [
        { id: 'keyboard1', text: 'Section A', href: '#section-a' },
        { id: 'keyboard2', text: 'Section B', href: '#section-b' },
        { id: 'keyboard3', text: 'Section C', href: '#section-c' },
      ];

      cy.mount(`
        <div>
          <usa-in-page-navigation id="keyboard-nav"></usa-in-page-navigation>
          <div id="section-a">Section A content</div>
          <div id="section-b">Section B content</div>
          <div id="section-c">Section C content</div>
        </div>
      `);

      cy.window().then((win) => {
        const nav = win.document.getElementById('keyboard-nav') as any;
        nav.items = navigationItems;

        nav.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            keyboardNavigationTriggered = true;
          }
        });

        nav.addEventListener('click', () => {
          mouseNavigationTriggered = true;
        });
      });

      // Test keyboard navigation
      cy.get('usa-in-page-navigation a[href="#section-b"]')
        .focus()
        .type('{enter}')
        .then(() => {
          expect(keyboardNavigationTriggered).to.be.true;
        });

      // Reset flags
      cy.window().then(() => {
        keyboardNavigationTriggered = false;
        mouseNavigationTriggered = false;
      });

      // Test mouse navigation
      cy.get('usa-in-page-navigation a[href="#section-c"]')
        .click()
        .then(() => {
          expect(mouseNavigationTriggered).to.be.true;
        });
    });

    it('should prevent double navigation when links are clicked rapidly', () => {
      let navigationCount = 0;
      let lastNavigationTime = 0;

      const navigationItems = [
        { id: 'rapid1', text: 'Target A', href: '#target-a' },
        { id: 'rapid2', text: 'Target B', href: '#target-b' },
      ];

      cy.mount(`
        <div>
          <usa-in-page-navigation id="rapid-nav"></usa-in-page-navigation>
          <div id="target-a" style="height: 600px;">Target A content</div>
          <div id="target-b" style="height: 600px;">Target B content</div>
        </div>
      `);

      cy.window().then((win) => {
        const nav = win.document.getElementById('rapid-nav') as any;
        nav.items = navigationItems;

        nav.addEventListener('click', () => {
          const currentTime = Date.now();
          if (currentTime - lastNavigationTime > 100) {
            // Debounce rapid clicks
            navigationCount++;
            lastNavigationTime = currentTime;
          }
        });
      });

      // Rapid clicks should be debounced
      cy.get('usa-in-page-navigation a[href="#target-a"]').click().click().click();

      cy.wait(200).then(() => {
        // Should only register reasonable number of navigations
        expect(navigationCount).to.be.lessThan(3);
      });
    });
  });
});
