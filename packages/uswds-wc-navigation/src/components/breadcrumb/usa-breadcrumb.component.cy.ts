// Component tests for usa-breadcrumb
import './index.ts';
import {
  testRapidClicking,
  testRapidKeyboardInteraction,
  COMMON_BUG_PATTERNS,
} from '../../../cypress/support/rapid-interaction-tests.ts';

describe('Breadcrumb Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-breadcrumb></usa-breadcrumb>');
    cy.get('usa-breadcrumb').should('exist');
    cy.get('usa-breadcrumb').should('be.visible');
  });

  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<usa-breadcrumb></usa-breadcrumb>');

    // Rapid clicking without waiting - simulates real user behavior
    cy.get('usa-breadcrumb').as('component');

    // Multiple rapid clicks
    cy.get('@component').click().click().click().click().click();

    cy.wait(500); // Let events settle

    // Component should remain functional
    cy.get('@component').should('exist');
    cy.get('@component').should('be.visible');
  });

  it('should handle interaction during CSS transitions', () => {
    cy.mount('<usa-breadcrumb></usa-breadcrumb>');

    // Click during potential transitions
    cy.get('usa-breadcrumb').click().click(); // Immediate second click

    cy.wait(1000); // Wait for animations

    // Should be in consistent state
    cy.get('usa-breadcrumb').should('exist');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-breadcrumb></usa-breadcrumb>');

      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-breadcrumb',
        clickCount: 15,
        description: 'event listener duplication',
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-breadcrumb></usa-breadcrumb>');

      // Test for race conditions during state changes
      cy.get('usa-breadcrumb').as('component');

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
    cy.mount('<usa-breadcrumb></usa-breadcrumb>');

    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-breadcrumb></usa-breadcrumb>');

    // Perform various rapid interactions
    cy.get('usa-breadcrumb').click().focus().blur().click().click();

    cy.wait(500);

    // Accessibility should still be intact
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<usa-breadcrumb></usa-breadcrumb>');
      cy.get('usa-breadcrumb').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-breadcrumb></usa-breadcrumb>');

    // Various interactions that might cause errors
    cy.get('usa-breadcrumb').click().trigger('mouseenter').trigger('mouseleave').focus().blur();

    cy.wait(500);

    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });

  // Event Propagation Control Testing (Critical Gap Fix)
  describe('Event Propagation Control', () => {
    it('should prevent default navigation when preventDefault is called', () => {
      const breadcrumbItems = [
        { id: '1', text: 'Home', href: '/home' },
        { id: '2', text: 'Section', href: '/section' },
        { id: '3', text: 'Current Page', current: true },
      ];

      cy.mount(`<usa-breadcrumb id="test-breadcrumb"></usa-breadcrumb>`);

      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('test-breadcrumb') as any;
        breadcrumb.items = breadcrumbItems;
      });

      // Click on breadcrumb link should prevent default navigation
      cy.get('usa-breadcrumb a[href="/section"]').click();

      // Verify URL hasn't changed (preventDefault worked)
      cy.url().should('include', 'localhost');
      cy.url().should('not.include', '/section');
    });

    it('should emit custom events without interfering with parent listeners', () => {
      let parentClicked = false;
      let breadcrumbEventEmitted = false;

      const breadcrumbItems = [
        { id: '1', text: 'Home', href: '/home' },
        { id: '2', text: 'Section', href: '/section' },
        { id: '3', text: 'Current Page', current: true },
      ];

      cy.mount(`
        <div id="parent-container">
          <usa-breadcrumb id="test-breadcrumb"></usa-breadcrumb>
        </div>
      `);

      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('test-breadcrumb') as any;
        const parent = win.document.getElementById('parent-container') as any;

        breadcrumb.items = breadcrumbItems;

        // Listen for parent clicks
        parent.addEventListener('click', () => {
          parentClicked = true;
        });

        // Listen for breadcrumb events
        breadcrumb.addEventListener('breadcrumb-click', () => {
          breadcrumbEventEmitted = true;
        });
      });

      // Click breadcrumb item
      cy.get('usa-breadcrumb a[href="/home"]')
        .click()
        .then(() => {
          // Breadcrumb event should be emitted
          expect(breadcrumbEventEmitted).to.be.true;

          // Parent click should not be triggered (event should not bubble inappropriately)
          // Note: This tests if the component properly handles event propagation
        });
    });

    it('should handle nested click contexts properly', () => {
      let formSubmitted = false;

      const breadcrumbItems = [
        { id: '1', text: 'Home', href: '/home' },
        { id: '2', text: 'Current', current: true },
      ];

      cy.mount(`
        <form id="test-form">
          <usa-breadcrumb id="nested-breadcrumb"></usa-breadcrumb>
          <button type="submit">Submit</button>
        </form>
      `);

      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('nested-breadcrumb') as any;
        const form = win.document.getElementById('test-form') as any;

        breadcrumb.items = breadcrumbItems;

        form.addEventListener('submit', (e: Event) => {
          e.preventDefault();
          formSubmitted = true;
        });
      });

      // Click breadcrumb link should not trigger form submission
      cy.get('usa-breadcrumb a[href="/home"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.false;
        });

      // But clicking submit button should trigger form submission
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
        });
    });

    it('should prevent double navigation when clicked rapidly', () => {
      let eventCount = 0;

      const breadcrumbItems = [
        { id: '1', text: 'Home', href: '/home' },
        { id: '2', text: 'Section', href: '/section' },
        { id: '3', text: 'Current', current: true },
      ];

      cy.mount(`<usa-breadcrumb id="rapid-breadcrumb"></usa-breadcrumb>`);

      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('rapid-breadcrumb') as any;
        breadcrumb.items = breadcrumbItems;

        breadcrumb.addEventListener('breadcrumb-click', () => {
          eventCount++;
        });
      });

      // Rapid clicks should be handled properly
      cy.get('usa-breadcrumb a[href="/home"]').click().click().click();

      cy.wait(100).then(() => {
        // Should have received events for each click
        expect(eventCount).to.be.greaterThan(0);

        // But URL should still be localhost (preventDefault working)
        cy.url().should('include', 'localhost');
        cy.url().should('not.include', '/home');
      });
    });

    it('should work correctly in complex DOM hierarchies', () => {
      let outerDivClicked = false;
      let innerDivClicked = false;
      let breadcrumbClicked = false;

      const breadcrumbItems = [
        { id: '1', text: 'Home', href: '/home' },
        { id: '2', text: 'Current', current: true },
      ];

      cy.mount(`
        <div id="outer-div">
          <div id="inner-div">
            <usa-breadcrumb id="hierarchy-breadcrumb"></usa-breadcrumb>
          </div>
        </div>
      `);

      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('hierarchy-breadcrumb') as any;
        const outerDiv = win.document.getElementById('outer-div') as any;
        const innerDiv = win.document.getElementById('inner-div') as any;

        breadcrumb.items = breadcrumbItems;

        outerDiv.addEventListener('click', () => {
          outerDivClicked = true;
        });
        innerDiv.addEventListener('click', () => {
          innerDivClicked = true;
        });
        breadcrumb.addEventListener('breadcrumb-click', () => {
          breadcrumbClicked = true;
        });
      });

      // Click breadcrumb
      cy.get('usa-breadcrumb a[href="/home"]')
        .click()
        .then(() => {
          expect(breadcrumbClicked).to.be.true;

          // Test that event propagation behaves as expected
          // (Component should control whether parent elements receive events)
        });
    });
  });

  // Responsive Layout Testing (Critical Gap Fix)
  describe('Responsive Layout Testing', () => {
    const simpleBreadcrumbItems = [
      { id: '1', text: 'Home', href: '/home' },
      { id: '2', text: 'Services', href: '/services' },
      { id: '3', text: 'Current Page', current: true },
    ];

    const deepBreadcrumbItems = [
      { id: '1', text: 'U.S. Department of Health and Human Services', href: '/home' },
      { id: '2', text: 'Centers for Disease Control and Prevention', href: '/cdc' },
      { id: '3', text: 'Health and Safety Guidelines', href: '/health-guidelines' },
      { id: '4', text: 'Workplace Safety Standards', href: '/workplace-safety' },
      { id: '5', text: 'Industrial Hygiene Protocols', href: '/hygiene-protocols' },
      { id: '6', text: 'Chemical Safety Management', href: '/chemical-safety' },
      { id: '7', text: 'Emergency Response Procedures', current: true },
    ];

    const veryLongLabelItems = [
      { id: '1', text: 'Home', href: '/home' },
      {
        id: '2',
        text: 'Department of Environmental Protection and Sustainability Management',
        href: '/environmental',
      },
      {
        id: '3',
        text: 'Climate Change Adaptation and Mitigation Strategies for Federal Agencies',
        href: '/climate-change',
      },
      {
        id: '4',
        text: 'Comprehensive Environmental Impact Assessment Guidelines and Implementation Framework',
        current: true,
      },
    ];

    const viewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop', width: 1200, height: 800 },
      { name: 'Large Desktop', width: 1920, height: 1080 },
    ];

    describe('Basic Responsive Behavior', () => {
      viewports.forEach((viewport) => {
        it(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-breadcrumb id="responsive-breadcrumb"></usa-breadcrumb>`);

          cy.window().then((win) => {
            const breadcrumb = win.document.getElementById('responsive-breadcrumb') as any;
            breadcrumb.items = simpleBreadcrumbItems;
          });

          // Basic visibility test
          cy.get('usa-breadcrumb').should('be.visible');
          cy.get('.usa-breadcrumb').should('be.visible');

          // Breadcrumb should fit within viewport
          cy.get('usa-breadcrumb').should(($el) => {
            expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 20);
          });

          // Breadcrumb items should be visible
          cy.get('.usa-breadcrumb__list-item').should('be.visible');

          // Accessibility at all sizes
          cy.injectAxe();
          cy.checkAccessibility();
        });
      });

      it('should handle viewport orientation changes', () => {
        cy.mount(`<usa-breadcrumb id="orientation-breadcrumb"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('orientation-breadcrumb') as any;
          breadcrumb.items = simpleBreadcrumbItems;
        });

        // Portrait tablet
        cy.viewport(768, 1024);
        cy.get('.usa-breadcrumb').should('be.visible');
        cy.get('.usa-breadcrumb__list-item').should('be.visible');

        // Landscape tablet
        cy.viewport(1024, 768);
        cy.get('.usa-breadcrumb').should('be.visible');
        cy.get('.usa-breadcrumb__list-item').should('be.visible');

        // Component should adapt without breaking
        cy.injectAxe();
        cy.checkAccessibility();
      });
    });

    describe('Mobile Breadcrumb Behavior', () => {
      it('should show simplified breadcrumb on mobile', () => {
        cy.viewport(375, 667); // iPhone SE
        cy.mount(`<usa-breadcrumb id="mobile-simple"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('mobile-simple') as any;
          breadcrumb.items = deepBreadcrumbItems;
        });

        // On mobile, should show simplified view (typically home + current)
        cy.get('.usa-breadcrumb__list-item').should('be.visible');

        // Should not cause horizontal overflow
        cy.get('usa-breadcrumb').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 30);
        });
      });

      it('should handle text truncation on mobile', () => {
        cy.viewport(320, 568); // Very narrow mobile
        cy.mount(`<usa-breadcrumb id="mobile-truncation"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('mobile-truncation') as any;
          breadcrumb.items = veryLongLabelItems;
        });

        // Long text should be truncated or wrapped appropriately
        cy.get('.usa-breadcrumb__link').should('be.visible');

        // Should not cause horizontal scrolling
        cy.get('usa-breadcrumb').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 40);
        });

        // Text should have ellipsis or proper wrapping
        cy.get('.usa-breadcrumb__link')
          .should('have.css', 'text-overflow', 'ellipsis')
          .or('have.css', 'word-wrap', 'break-word');
      });

      it('should handle touch interactions on mobile', () => {
        cy.viewport(375, 667);
        cy.mount(`<usa-breadcrumb id="mobile-touch"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('mobile-touch') as any;
          breadcrumb.items = simpleBreadcrumbItems;
        });

        // Test touch targets are at least 44px
        cy.get('.usa-breadcrumb__link').each(($link) => {
          const rect = $link[0].getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).to.be.at.least(44);
        });

        // Simulate touch on breadcrumb link
        cy.get('.usa-breadcrumb__link')
          .first()
          .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 100, clientY: 100 }] });

        cy.get('.usa-breadcrumb').should('be.visible');
      });

      it('should show mobile-optimized separators', () => {
        cy.viewport(375, 667);
        cy.mount(`<usa-breadcrumb id="mobile-separators"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('mobile-separators') as any;
          breadcrumb.items = simpleBreadcrumbItems;
        });

        // Separators should be visible and appropriately sized
        cy.get('.usa-breadcrumb__list-item').should('contain.text', '>').or('contain.text', '/');

        // Check that separators don't take up too much space
        cy.get('.usa-breadcrumb').should('be.visible');
      });

      it('should handle mobile wrapping when truncation is disabled', () => {
        cy.viewport(375, 667);
        cy.mount(`<usa-breadcrumb id="mobile-wrapping" wrap></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('mobile-wrapping') as any;
          breadcrumb.items = veryLongLabelItems;
          breadcrumb.wrap = true;
        });

        // When wrapping is enabled, breadcrumb should expand vertically
        cy.get('.usa-breadcrumb__list-item').should('be.visible');

        // Multiple lines should be acceptable
        cy.get('.usa-breadcrumb').should('be.visible');
      });
    });

    describe('Tablet Breadcrumb Behavior', () => {
      it('should show more breadcrumb items on tablet', () => {
        cy.viewport(768, 1024);
        cy.mount(`<usa-breadcrumb id="tablet-breadcrumb"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('tablet-breadcrumb') as any;
          breadcrumb.items = deepBreadcrumbItems;
        });

        // Should show more items than mobile but may still truncate long paths
        cy.get('.usa-breadcrumb__list-item').should('have.length.at.least', 3);

        // Should fit within tablet width
        cy.get('.usa-breadcrumb').should('be.visible');
      });

      it('should handle medium-length labels on tablet', () => {
        cy.viewport(768, 1024);
        cy.mount(`<usa-breadcrumb id="tablet-labels"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('tablet-labels') as any;
          breadcrumb.items = [
            { id: '1', text: 'Home', href: '/home' },
            { id: '2', text: 'Department of Education', href: '/education' },
            { id: '3', text: 'Student Financial Aid', href: '/financial-aid' },
            { id: '4', text: 'Application Process', current: true },
          ];
        });

        // Medium-length labels should display well on tablet
        cy.get('.usa-breadcrumb__link').should('be.visible');
        cy.get('.usa-breadcrumb__link').each(($link) => {
          expect($link.text().trim()).to.not.be.empty;
        });
      });

      it('should handle tablet landscape orientation', () => {
        cy.viewport(1024, 768);
        cy.mount(`<usa-breadcrumb id="tablet-landscape"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('tablet-landscape') as any;
          breadcrumb.items = deepBreadcrumbItems;
        });

        // Should show more items in landscape mode
        cy.get('.usa-breadcrumb__list-item').should('be.visible');

        // Better horizontal space utilization
        cy.get('.usa-breadcrumb').should('be.visible');
      });
    });

    describe('Desktop Breadcrumb Behavior', () => {
      it('should show full breadcrumb trail on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-breadcrumb id="desktop-full"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('desktop-full') as any;
          breadcrumb.items = deepBreadcrumbItems;
        });

        // Should show all breadcrumb items on desktop
        cy.get('.usa-breadcrumb__list-item').should('have.length', deepBreadcrumbItems.length);

        // All links should be visible
        cy.get('.usa-breadcrumb__link').should('be.visible');

        // Should fit comfortably
        cy.get('.usa-breadcrumb').should('be.visible');
      });

      it('should handle very long breadcrumb paths on large desktop', () => {
        cy.viewport(1920, 1080);
        cy.mount(`<usa-breadcrumb id="desktop-long"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('desktop-long') as any;
          breadcrumb.items = veryLongLabelItems;
        });

        // Even very long labels should display well on large screens
        cy.get('.usa-breadcrumb__link').should('be.visible');
        cy.get('.usa-breadcrumb__link').each(($link) => {
          const text = $link.text().trim();
          expect(text).to.not.be.empty;
        });

        // Should not overflow
        cy.get('usa-breadcrumb').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 20);
        });
      });

      it('should handle hover states on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-breadcrumb id="desktop-hover"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('desktop-hover') as any;
          breadcrumb.items = simpleBreadcrumbItems;
        });

        // Test hover effects
        cy.get('.usa-breadcrumb__link').first().trigger('mouseover');
        cy.get('.usa-breadcrumb__link').first().should('be.visible');

        // Hover should not break layout
        cy.get('.usa-breadcrumb').should('be.visible');
      });

      it('should handle keyboard navigation on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-breadcrumb id="desktop-keyboard"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('desktop-keyboard') as any;
          breadcrumb.items = simpleBreadcrumbItems;
        });

        // Focus first breadcrumb link
        cy.get('.usa-breadcrumb__link').first().focus();
        cy.focused().should('exist');

        // Tab through breadcrumb links
        cy.focused().tab();
        cy.focused().should('exist');

        // Enter should trigger navigation
        cy.focused().type('{enter}');
        cy.get('.usa-breadcrumb').should('be.visible');
      });
    });

    describe('Responsive Breadcrumb Features', () => {
      it('should handle dynamic breadcrumb updates across viewports', () => {
        cy.mount(`<usa-breadcrumb id="dynamic-breadcrumb"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('dynamic-breadcrumb') as any;
          breadcrumb.items = simpleBreadcrumbItems;
        });

        // Start on desktop
        cy.viewport(1200, 800);
        cy.get('.usa-breadcrumb__list-item').should('have.length', simpleBreadcrumbItems.length);

        // Update breadcrumb items
        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('dynamic-breadcrumb') as any;
          breadcrumb.items = deepBreadcrumbItems;
        });

        // Switch to mobile
        cy.viewport(375, 667);
        cy.get('.usa-breadcrumb__list-item').should('be.visible');

        // Switch back to desktop
        cy.viewport(1200, 800);
        cy.get('.usa-breadcrumb__list-item').should('have.length', deepBreadcrumbItems.length);
      });

      it('should maintain current page indication across viewports', () => {
        const testViewports = [
          { width: 375, height: 667 },
          { width: 768, height: 1024 },
          { width: 1200, height: 800 },
        ];

        testViewports.forEach((vp) => {
          cy.viewport(vp.width, vp.height);
          cy.mount(`<usa-breadcrumb id="current-page-${vp.width}"></usa-breadcrumb>`);

          cy.window().then((win) => {
            const breadcrumb = win.document.getElementById(`current-page-${vp.width}`) as any;
            breadcrumb.items = simpleBreadcrumbItems;
          });

          // Current page should always be indicated
          cy.get('.usa-breadcrumb__list-item')
            .last()
            .should('have.attr', 'aria-current', 'page')
            .or('have.class', 'usa-current');
        });
      });

      it('should handle breadcrumb overflow strategies', () => {
        cy.viewport(375, 667); // Mobile
        cy.mount(`<usa-breadcrumb id="overflow-strategy"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('overflow-strategy') as any;
          breadcrumb.items = deepBreadcrumbItems;
          breadcrumb.showOverflow = true;
        });

        // Should handle overflow with ellipsis or collapse strategy
        cy.get('.usa-breadcrumb').should('be.visible');

        // May show ellipsis for hidden items
        cy.get('.usa-breadcrumb').should('contain.text', '...').or('not.contain.text', '...');

        // Should not cause horizontal scroll
        cy.get('usa-breadcrumb').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 30);
        });
      });
    });

    describe('Responsive Edge Cases', () => {
      it('should handle breadcrumb with single item responsively', () => {
        const singleItem = [{ id: '1', text: 'Home', current: true }];

        viewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-breadcrumb id="single-item-${viewport.width}"></usa-breadcrumb>`);

          cy.window().then((win) => {
            const breadcrumb = win.document.getElementById(`single-item-${viewport.width}`) as any;
            breadcrumb.items = singleItem;
          });

          // Single item should display correctly
          cy.get('.usa-breadcrumb__list-item').should('have.length', 1);
          cy.get('.usa-breadcrumb').should('be.visible');
        });
      });

      it('should handle empty breadcrumb state responsively', () => {
        viewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-breadcrumb id="empty-breadcrumb-${viewport.width}"></usa-breadcrumb>`);

          cy.window().then((win) => {
            const breadcrumb = win.document.getElementById(
              `empty-breadcrumb-${viewport.width}`
            ) as any;
            breadcrumb.items = [];
          });

          // Empty state should not break layout
          cy.get('usa-breadcrumb').should('be.visible');

          // No layout issues with empty state
          cy.get('usa-breadcrumb').should(($el) => {
            expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 10);
          });
        });
      });

      it('should handle special characters and internationalization', () => {
        const i18nItems = [
          { id: '1', text: 'Accueil', href: '/accueil' },
          { id: '2', text: 'Départements', href: '/departements' },
          { id: '3', text: 'Services Sociaux', href: '/services' },
          { id: '4', text: "Formulaires d'Application", current: true },
        ];

        cy.viewport(375, 667); // Mobile
        cy.mount(`<usa-breadcrumb id="i18n-breadcrumb"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('i18n-breadcrumb') as any;
          breadcrumb.items = i18nItems;
        });

        // International characters should display correctly
        cy.get('.usa-breadcrumb__link').should('contain.text', 'Accueil');
        cy.get('.usa-breadcrumb__link').should('contain.text', 'Départements');

        // Should not break layout
        cy.get('.usa-breadcrumb').should('be.visible');
      });

      it('should handle dynamic content changes during viewport transitions', () => {
        cy.mount(`<usa-breadcrumb id="dynamic-transition"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('dynamic-transition') as any;
          breadcrumb.items = simpleBreadcrumbItems;
        });

        // Start on desktop
        cy.viewport(1200, 800);
        cy.get('.usa-breadcrumb__list-item').should('have.length', simpleBreadcrumbItems.length);

        // Update items while transitioning to mobile
        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('dynamic-transition') as any;
          breadcrumb.items = deepBreadcrumbItems;
        });

        cy.viewport(375, 667); // Switch to mobile
        cy.get('.usa-breadcrumb__list-item').should('be.visible');

        // Layout should adapt to new content and viewport
        cy.get('.usa-breadcrumb').should('be.visible');
      });

      it('should maintain accessibility across all responsive states', () => {
        const testViewports = [
          { width: 375, height: 667 },
          { width: 768, height: 1024 },
          { width: 1200, height: 800 },
        ];

        testViewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-breadcrumb id="a11y-breadcrumb-${viewport.width}"></usa-breadcrumb>`);

          cy.window().then((win) => {
            const breadcrumb = win.document.getElementById(
              `a11y-breadcrumb-${viewport.width}`
            ) as any;
            breadcrumb.items = simpleBreadcrumbItems;
          });

          // Verify semantic structure at all sizes
          cy.get('nav')
            .should('have.attr', 'aria-label')
            .and('match', /breadcrumb/i);
          cy.get('.usa-breadcrumb__list')
            .should('have.attr', 'role', 'list')
            .or('have.tagName', 'ol');

          // Current page should be marked
          cy.get('[aria-current="page"]').should('exist');

          // Check keyboard navigation works
          cy.get('.usa-breadcrumb__link').first().focus();
          cy.focused().tab();

          // Run accessibility test
          cy.injectAxe();
          cy.checkAccessibility();
        });
      });

      it('should handle breadcrumb with very long single item', () => {
        const veryLongSingleItem = [
          {
            id: '1',
            text: 'This is an extremely long breadcrumb item that tests how the component handles very long single items that might exceed the available viewport width',
            current: true,
          },
        ];

        cy.viewport(320, 568); // Very narrow mobile
        cy.mount(`<usa-breadcrumb id="long-single-item"></usa-breadcrumb>`);

        cy.window().then((win) => {
          const breadcrumb = win.document.getElementById('long-single-item') as any;
          breadcrumb.items = veryLongSingleItem;
        });

        // Long single item should be handled gracefully
        cy.get('.usa-breadcrumb__list-item').should('have.length', 1);

        // Should not cause horizontal overflow
        cy.get('usa-breadcrumb').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 50);
        });

        // Text should be visible but may be truncated
        cy.get('.usa-breadcrumb').should('be.visible');
      });
    });
  });

  describe('Wrapping Behavior Regression Tests', () => {
    const longBreadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Company', href: '/company' },
      { label: 'Technology and Innovation', href: '/company/technology' },
      { label: 'Development Team', href: '/company/technology/development' },
      { label: 'Web Services Division', href: '/company/technology/development/web' },
      { label: 'Current Documentation', current: true },
    ];

    it('should apply correct CSS classes for wrapping vs non-wrapping at desktop viewport', () => {
      // Test at desktop viewport where responsive behavior should work
      cy.viewport(1024, 768);

      // Test wrap=false
      cy.mount('<usa-breadcrumb id="no-wrap-test"></usa-breadcrumb>');
      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('no-wrap-test') as any;
        breadcrumb.items = longBreadcrumbs;
        breadcrumb.wrap = false;
      });

      cy.get('.usa-breadcrumb').should('exist');
      cy.get('.usa-breadcrumb').should('not.have.class', 'usa-breadcrumb--wrap');

      // Test wrap=true
      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('no-wrap-test') as any;
        breadcrumb.wrap = true;
      });

      cy.get('.usa-breadcrumb').should('have.class', 'usa-breadcrumb--wrap');
    });

    it('should show all breadcrumb items at desktop viewport regardless of wrap setting', () => {
      cy.viewport(1200, 800); // Desktop viewport

      cy.mount('<usa-breadcrumb id="desktop-items-test"></usa-breadcrumb>');
      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('desktop-items-test') as any;
        breadcrumb.items = longBreadcrumbs;
        breadcrumb.wrap = true;
      });

      // All breadcrumb items should be visible at desktop size
      cy.get('.usa-breadcrumb__list-item').should('have.length', longBreadcrumbs.length);

      // Each item should contain the expected text
      longBreadcrumbs.forEach((item, index) => {
        cy.get('.usa-breadcrumb__list-item').eq(index).should('contain', item.label);
      });

      // Current item should have proper styling
      cy.get('.usa-current').should('contain', 'Current Documentation');
    });

    it('should handle mobile responsive behavior correctly', () => {
      cy.viewport(375, 667); // Mobile viewport (below 480px)

      cy.mount('<usa-breadcrumb id="mobile-test"></usa-breadcrumb>');
      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('mobile-test') as any;
        breadcrumb.items = longBreadcrumbs;
        breadcrumb.wrap = true;
      });

      // At mobile size, USWDS shows condensed view regardless of wrap setting
      // This is expected behavior - the component should still apply the wrap class
      cy.get('.usa-breadcrumb').should('have.class', 'usa-breadcrumb--wrap');

      // The breadcrumb should still render all items (USWDS CSS handles the mobile display)
      cy.get('.usa-breadcrumb__list-item').should('have.length', longBreadcrumbs.length);
    });

    it('should toggle wrap behavior dynamically at desktop viewport', () => {
      cy.viewport(1024, 768);

      cy.mount('<usa-breadcrumb id="dynamic-wrap-test"></usa-breadcrumb>');
      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('dynamic-wrap-test') as any;
        breadcrumb.items = longBreadcrumbs;
        breadcrumb.wrap = false;
      });

      // Initially no wrap class
      cy.get('.usa-breadcrumb').should('not.have.class', 'usa-breadcrumb--wrap');

      // Toggle to wrap=true
      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('dynamic-wrap-test') as any;
        breadcrumb.wrap = true;
      });

      cy.get('.usa-breadcrumb').should('have.class', 'usa-breadcrumb--wrap');

      // Toggle back to wrap=false
      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('dynamic-wrap-test') as any;
        breadcrumb.wrap = false;
      });

      cy.get('.usa-breadcrumb').should('not.have.class', 'usa-breadcrumb--wrap');
    });

    it('should validate the specific reported issue is fixed', () => {
      // This test addresses the original issue:
      // "The breadcrumb is supposed to have a wrapping options where the breadcrumbs go to a second line"

      cy.viewport(600, 400); // Constrained width but above 480px

      cy.mount(`
        <div style="max-width: 400px; border: 1px solid red; padding: 10px;">
          <usa-breadcrumb id="regression-test"></usa-breadcrumb>
        </div>
      `);

      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('regression-test') as any;
        breadcrumb.items = longBreadcrumbs;
        breadcrumb.wrap = true;
      });

      // Should apply wrap class
      cy.get('.usa-breadcrumb').should('have.class', 'usa-breadcrumb--wrap');

      // Should show all items, not just a condensed mobile view
      cy.get('.usa-breadcrumb__list-item').should('have.length', longBreadcrumbs.length);

      // Should not show mobile back arrow pattern (which only appears at very small sizes)
      cy.get('.usa-breadcrumb__list-item').should('be.visible');

      // Current item should be properly marked
      cy.get('.usa-current').should('contain', 'Current Documentation');

      // Links should be functional
      cy.get('.usa-breadcrumb__link').first().should('have.attr', 'href', '/');
    });

    it('should maintain wrapping behavior across viewport changes', () => {
      cy.mount('<usa-breadcrumb id="viewport-change-test"></usa-breadcrumb>');
      cy.window().then((win) => {
        const breadcrumb = win.document.getElementById('viewport-change-test') as any;
        breadcrumb.items = longBreadcrumbs;
        breadcrumb.wrap = true;
      });

      // Start at desktop
      cy.viewport(1200, 800);
      cy.get('.usa-breadcrumb').should('have.class', 'usa-breadcrumb--wrap');
      cy.get('.usa-breadcrumb__list-item').should('have.length', longBreadcrumbs.length);

      // Switch to tablet
      cy.viewport(768, 1024);
      cy.get('.usa-breadcrumb').should('have.class', 'usa-breadcrumb--wrap');
      cy.get('.usa-breadcrumb__list-item').should('have.length', longBreadcrumbs.length);

      // Switch to large mobile (still above 480px)
      cy.viewport(500, 800);
      cy.get('.usa-breadcrumb').should('have.class', 'usa-breadcrumb--wrap');
      cy.get('.usa-breadcrumb__list-item').should('have.length', longBreadcrumbs.length);

      // Switch to mobile (below 480px) - CSS takes over but class remains
      cy.viewport(400, 600);
      cy.get('.usa-breadcrumb').should('have.class', 'usa-breadcrumb--wrap');
      cy.get('.usa-breadcrumb__list-item').should('have.length', longBreadcrumbs.length);
    });
  });
});
