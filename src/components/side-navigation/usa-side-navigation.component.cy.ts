// Component tests for usa-side-navigation
import './index.ts';

describe('USA Side Navigation Component Tests', () => {
  const basicNavItems = [
    { label: 'Home', href: '/', current: true },
    { label: 'About', href: '/about' },
    {
      label: 'Services',
      href: '/services',
      subnav: [
        { label: 'Health Services', href: '/services/health' },
        { label: 'Education Services', href: '/services/education' },
      ],
    },
    { label: 'Contact', href: '/contact' },
  ];

  it('should render side navigation with default properties', () => {
    cy.mount(`<usa-side-navigation id="test-sidenav"></usa-side-navigation>`);
    cy.get('usa-side-navigation').should('exist');
    cy.get('.usa-sidenav').should('exist');
  });

  it('should render navigation items when provided', () => {
    cy.mount(`<usa-side-navigation id="test-sidenav"></usa-side-navigation>`);

    cy.window().then((win) => {
      const sidenav = win.document.getElementById('test-sidenav') as any;
      sidenav.items = basicNavItems;
    });

    cy.get('.usa-sidenav__item').should('have.length', 4);
    cy.get('.usa-sidenav__link').should('contain.text', 'Home');
    cy.get('.usa-sidenav__link').should('contain.text', 'About');
  });

  it('should handle navigation item clicks', () => {
    cy.mount(`<usa-side-navigation id="test-sidenav"></usa-side-navigation>`);

    cy.window().then((win) => {
      const sidenav = win.document.getElementById('test-sidenav') as any;
      sidenav.items = basicNavItems;
    });

    // Click on a navigation item
    cy.get('.usa-sidenav__link').first().click();

    // Should maintain accessibility attributes
    cy.get('.usa-sidenav__link.usa-current').should('exist');
  });

  it('should handle subnav expansion', () => {
    cy.mount(`<usa-side-navigation id="test-sidenav"></usa-side-navigation>`);

    cy.window().then((win) => {
      const sidenav = win.document.getElementById('test-sidenav') as any;
      sidenav.items = basicNavItems;
    });

    // Should show subnav when expanded
    cy.get('.usa-sidenav__sublist').should('exist');
    cy.get('.usa-sidenav__sublist .usa-sidenav__item').should('have.length', 2);
  });

  it('should be accessible', () => {
    cy.mount(`<usa-side-navigation id="test-sidenav"></usa-side-navigation>`);

    cy.window().then((win) => {
      const sidenav = win.document.getElementById('test-sidenav') as any;
      sidenav.items = basicNavItems;
    });

    // Check ARIA attributes
    cy.get('nav').should('have.attr', 'aria-label');
    cy.get('.usa-current').should('have.attr', 'aria-current', 'page');

    // Check keyboard navigation
    cy.get('.usa-sidenav__link').first().focus().should('be.focused');
  });

  // Responsive Layout Testing (Critical Gap Fix)
  describe('Responsive Layout Testing', () => {
    const multiLevelNavItems = [
      { label: 'Dashboard', href: '/dashboard', current: true },
      { label: 'Profile', href: '/profile' },
      {
        label: 'Administration',
        href: '/admin',
        subnav: [
          { label: 'User Management', href: '/admin/users' },
          { label: 'System Settings', href: '/admin/settings' },
          {
            label: 'Reports',
            href: '/admin/reports',
            subnav: [
              { label: 'Monthly Reports', href: '/admin/reports/monthly' },
              { label: 'Annual Reports', href: '/admin/reports/annual' },
              { label: 'Custom Reports', href: '/admin/reports/custom' },
            ],
          },
        ],
      },
      {
        label: 'Resources',
        href: '/resources',
        subnav: [
          { label: 'Documentation', href: '/resources/docs' },
          { label: 'Help Center', href: '/resources/help' },
          { label: 'FAQ', href: '/resources/faq' },
        ],
      },
      { label: 'Support', href: '/support' },
      { label: 'Contact', href: '/contact' },
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
          cy.mount(`<usa-side-navigation id="responsive-sidenav"></usa-side-navigation>`);

          cy.window().then((win) => {
            const sidenav = win.document.getElementById('responsive-sidenav') as any;
            sidenav.items = multiLevelNavItems;
          });

          // Basic visibility test
          cy.get('usa-side-navigation').should('be.visible');
          cy.get('.usa-sidenav').should('be.visible');

          // Navigation should fit within viewport
          cy.get('usa-side-navigation').should(($el) => {
            expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 10);
          });

          // Accessibility at all sizes
          cy.injectAxe();
          cy.checkAccessibility();
        });
      });

      it('should handle viewport orientation changes', () => {
        cy.mount(`<usa-side-navigation id="orientation-sidenav"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('orientation-sidenav') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Portrait tablet
        cy.viewport(768, 1024);
        cy.get('.usa-sidenav').should('be.visible');
        cy.get('.usa-sidenav__link').should('be.visible');

        // Landscape tablet
        cy.viewport(1024, 768);
        cy.get('.usa-sidenav').should('be.visible');
        cy.get('.usa-sidenav__link').should('be.visible');

        // Component should adapt without breaking
        cy.injectAxe();
        cy.checkAccessibility();
      });
    });

    describe('Mobile Navigation Behavior', () => {
      it('should show collapsible mobile navigation', () => {
        cy.viewport(375, 667); // iPhone SE
        cy.mount(
          `<usa-side-navigation id="mobile-sidenav" mobile-collapsible></usa-side-navigation>`
        );

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('mobile-sidenav') as any;
          sidenav.items = multiLevelNavItems;
          sidenav.mobileCollapsible = true;
        });

        // Should show mobile toggle button
        cy.get('.usa-sidenav__toggle').should('be.visible');

        // Navigation should be hidden initially on mobile
        cy.get('.usa-sidenav__nav').should('not.have.class', 'is-visible');

        // Click toggle should show navigation
        cy.get('.usa-sidenav__toggle').click();
        cy.get('.usa-sidenav__nav').should('have.class', 'is-visible');

        // Click toggle again should hide navigation
        cy.get('.usa-sidenav__toggle').click();
        cy.get('.usa-sidenav__nav').should('not.have.class', 'is-visible');
      });

      it('should handle mobile subnav expansion', () => {
        cy.viewport(375, 667);
        cy.mount(`<usa-side-navigation id="mobile-subnav"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('mobile-subnav') as any;
          sidenav.items = multiLevelNavItems;
          sidenav.mobileCollapsible = true;
        });

        // Open mobile menu
        cy.get('.usa-sidenav__toggle').click();
        cy.get('.usa-sidenav__nav').should('have.class', 'is-visible');

        // Test subnav expansion on mobile
        cy.get('.usa-sidenav__item')
          .contains('Administration')
          .within(() => {
            cy.get('button, .usa-sidenav__link').click();
          });

        // Subnavigation should be visible
        cy.get('.usa-sidenav__sublist').should('be.visible');
        cy.get('.usa-sidenav__sublist .usa-sidenav__item').should('be.visible');
      });

      it('should handle touch interactions on mobile', () => {
        cy.viewport(375, 667);
        cy.mount(`<usa-side-navigation id="mobile-touch"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('mobile-touch') as any;
          sidenav.items = multiLevelNavItems;
          sidenav.mobileCollapsible = true;
        });

        // Test touch targets are at least 44px
        cy.get('.usa-sidenav__toggle').should(($el) => {
          const rect = $el[0].getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).to.be.at.least(44);
        });

        // Simulate touch on toggle button
        cy.get('.usa-sidenav__toggle')
          .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 100, clientY: 100 }] });

        cy.get('.usa-sidenav__nav').should('have.class', 'is-visible');

        // Test touch on navigation links
        cy.get('.usa-sidenav__link')
          .first()
          .trigger('touchstart', { touches: [{ clientX: 150, clientY: 150 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 150, clientY: 150 }] });

        cy.get('.usa-sidenav').should('be.visible');
      });

      it('should handle mobile navigation with long labels', () => {
        const longLabelItems = [
          {
            label: 'Very Long Navigation Item Label That Should Wrap Properly on Mobile Devices',
            href: '/long1',
          },
          {
            label: 'Another Extremely Long Navigation Label for Testing Mobile Layout',
            href: '/long2',
          },
          {
            label: 'Administration and Management Section',
            href: '/admin',
            subnav: [
              { label: 'Comprehensive User Management and Access Control', href: '/admin/users' },
              { label: 'Advanced System Configuration and Settings', href: '/admin/settings' },
            ],
          },
        ];

        cy.viewport(320, 568); // Very narrow mobile
        cy.mount(`<usa-side-navigation id="mobile-long-labels"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('mobile-long-labels') as any;
          sidenav.items = longLabelItems;
          sidenav.mobileCollapsible = true;
        });

        // Open mobile menu
        cy.get('.usa-sidenav__toggle').click();

        // Long labels should wrap and be readable
        cy.get('.usa-sidenav__link').should('be.visible');
        cy.get('.usa-sidenav__link').each(($link) => {
          expect($link.text().trim()).to.not.be.empty;
        });

        // Should not cause horizontal overflow
        cy.get('usa-side-navigation').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 20);
        });
      });

      it('should close mobile navigation when clicking outside', () => {
        cy.viewport(375, 667);
        cy.mount(`
          <div id="page-container">
            <usa-side-navigation id="mobile-outside-click"></usa-side-navigation>
            <main id="main-content">Main page content</main>
          </div>
        `);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('mobile-outside-click') as any;
          sidenav.items = multiLevelNavItems;
          sidenav.mobileCollapsible = true;
        });

        // Open mobile menu
        cy.get('.usa-sidenav__toggle').click();
        cy.get('.usa-sidenav__nav').should('have.class', 'is-visible');

        // Click outside navigation
        cy.get('#main-content').click();

        // Navigation should close
        cy.get('.usa-sidenav__nav').should('not.have.class', 'is-visible');
      });
    });

    describe('Tablet Navigation Behavior', () => {
      it('should show full navigation on tablet portrait', () => {
        cy.viewport(768, 1024);
        cy.mount(`<usa-side-navigation id="tablet-portrait"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('tablet-portrait') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Should show full navigation without toggle
        cy.get('.usa-sidenav__nav').should('be.visible');
        cy.get('.usa-sidenav__toggle').should('not.be.visible');

        // All navigation items should be visible
        cy.get('.usa-sidenav__item').should('have.length', multiLevelNavItems.length);
        cy.get('.usa-sidenav__link').should('be.visible');
      });

      it('should handle tablet subnav interactions', () => {
        cy.viewport(768, 1024);
        cy.mount(`<usa-side-navigation id="tablet-subnav"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('tablet-subnav') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Test subnav expansion with mouse
        cy.get('.usa-sidenav__item')
          .contains('Administration')
          .within(() => {
            cy.get('button, .usa-sidenav__link').click();
          });

        cy.get('.usa-sidenav__sublist').should('be.visible');

        // Test nested subnav
        cy.get('.usa-sidenav__sublist .usa-sidenav__item')
          .contains('Reports')
          .within(() => {
            cy.get('button, .usa-sidenav__link').click();
          });

        cy.get('.usa-sidenav__sublist .usa-sidenav__sublist').should('be.visible');
      });

      it('should adapt to tablet landscape orientation', () => {
        cy.viewport(1024, 768);
        cy.mount(`<usa-side-navigation id="tablet-landscape"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('tablet-landscape') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Should maintain full navigation functionality
        cy.get('.usa-sidenav__nav').should('be.visible');
        cy.get('.usa-sidenav__item').should('have.length', multiLevelNavItems.length);

        // Navigation should fit well in landscape
        cy.get('.usa-sidenav').should('be.visible');
      });
    });

    describe('Desktop Navigation Behavior', () => {
      it('should show full featured navigation on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-side-navigation id="desktop-full"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('desktop-full') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Should show full navigation
        cy.get('.usa-sidenav__nav').should('be.visible');
        cy.get('.usa-sidenav__toggle').should('not.be.visible');

        // All navigation features should be available
        cy.get('.usa-sidenav__item').should('have.length', multiLevelNavItems.length);
        cy.get('.usa-sidenav__link').should('be.visible');

        // Should support complex navigation hierarchy
        cy.get('.usa-sidenav__sublist').should('exist');
      });

      it('should handle hover states on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-side-navigation id="desktop-hover"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('desktop-hover') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Test hover interactions
        cy.get('.usa-sidenav__link').first().trigger('mouseover');
        cy.get('.usa-sidenav__link').first().should('be.visible');

        // Test subnav hover
        cy.get('.usa-sidenav__item').contains('Administration').trigger('mouseover');
        cy.get('.usa-sidenav__sublist').should('be.visible');
      });

      it('should handle keyboard navigation on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-side-navigation id="desktop-keyboard"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('desktop-keyboard') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Focus first navigation item
        cy.get('.usa-sidenav__link').first().focus();
        cy.focused().should('contain.text', 'Dashboard');

        // Tab to next item
        cy.focused().tab();
        cy.focused().should('contain.text', 'Profile');

        // Test arrow key navigation
        cy.focused().type('{downarrow}');
        cy.focused().should('contain.text', 'Administration');

        // Test enter to expand subnav
        cy.focused().type('{enter}');
        cy.get('.usa-sidenav__sublist').should('be.visible');
      });

      it('should handle large navigation sets efficiently', () => {
        const largeNavSet = Array.from({ length: 20 }, (_, i) => ({
          label: `Navigation Item ${i + 1}`,
          href: `/item-${i + 1}`,
          subnav:
            i % 3 === 0
              ? [
                  { label: `Subitem ${i + 1}.1`, href: `/item-${i + 1}/sub1` },
                  { label: `Subitem ${i + 1}.2`, href: `/item-${i + 1}/sub2` },
                ]
              : undefined,
        }));

        cy.viewport(1920, 1080); // Large desktop
        cy.mount(`<usa-side-navigation id="desktop-large"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('desktop-large') as any;
          sidenav.items = largeNavSet;
        });

        // Should render all items efficiently
        cy.get('.usa-sidenav__item').should('have.length', 20);

        // Should be scrollable if needed
        cy.get('.usa-sidenav').scrollTo('bottom');
        cy.get('.usa-sidenav__item').last().should('be.visible');

        // Performance should be maintained
        cy.get('.usa-sidenav__link').should('be.visible');
      });
    });

    describe('Responsive Navigation Features', () => {
      it('should handle sticky navigation on all viewport sizes', () => {
        viewports.slice(2).forEach((viewport) => {
          // Test tablet and desktop
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`
            <div style="height: 2000px;">
              <usa-side-navigation id="sticky-nav-${viewport.width}" sticky></usa-side-navigation>
              <div style="height: 1500px; background: linear-gradient(red, blue);"></div>
            </div>
          `);

          cy.window().then((win) => {
            const sidenav = win.document.getElementById(`sticky-nav-${viewport.width}`) as any;
            sidenav.items = multiLevelNavItems;
            sidenav.sticky = true;
          });

          // Should stick during scroll
          cy.scrollTo(0, 500);
          cy.get('.usa-sidenav').should('have.css', 'position', 'sticky');
          cy.get('.usa-sidenav__nav').should('be.visible');
        });
      });

      it('should maintain state across viewport changes', () => {
        cy.mount(`<usa-side-navigation id="state-persistence"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('state-persistence') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Start on desktop and expand subnav
        cy.viewport(1200, 800);
        cy.get('.usa-sidenav__item')
          .contains('Administration')
          .within(() => {
            cy.get('button, .usa-sidenav__link').click();
          });
        cy.get('.usa-sidenav__sublist').should('be.visible');

        // Switch to mobile
        cy.viewport(375, 667);
        cy.get('.usa-sidenav__toggle').should('be.visible');

        // Open mobile menu
        cy.get('.usa-sidenav__toggle').click();

        // Expanded state should be preserved
        cy.get('.usa-sidenav__sublist').should('be.visible');

        // Switch back to desktop
        cy.viewport(1200, 800);
        cy.get('.usa-sidenav__sublist').should('be.visible');
      });

      it('should handle responsive search integration', () => {
        cy.viewport(375, 667); // Mobile
        cy.mount(`<usa-side-navigation id="responsive-search" searchable></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('responsive-search') as any;
          sidenav.items = multiLevelNavItems;
          sidenav.searchable = true;
        });

        // Should show search functionality on mobile
        cy.get('.usa-sidenav__toggle').click();
        cy.get('.usa-sidenav__search').should('be.visible');

        // Search should filter navigation
        cy.get('.usa-sidenav__search input').type('Admin');
        cy.get('.usa-sidenav__item').should('contain.text', 'Administration');

        // Change to desktop
        cy.viewport(1200, 800);

        // Search should persist and be visible
        cy.get('.usa-sidenav__search').should('be.visible');
        cy.get('.usa-sidenav__item').should('contain.text', 'Administration');
      });
    });

    describe('Responsive Edge Cases', () => {
      it('should handle very narrow mobile screens', () => {
        cy.viewport(240, 320); // Very narrow mobile
        cy.mount(`<usa-side-navigation id="narrow-mobile"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('narrow-mobile') as any;
          sidenav.items = multiLevelNavItems;
          sidenav.mobileCollapsible = true;
        });

        // Should still function on very narrow screens
        cy.get('.usa-sidenav__toggle').should('be.visible');
        cy.get('.usa-sidenav__toggle').click();

        // Navigation should open without layout issues
        cy.get('.usa-sidenav__nav').should('have.class', 'is-visible');

        // Should not cause horizontal overflow
        cy.get('usa-side-navigation').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 30);
        });
      });

      it('should handle empty navigation state responsively', () => {
        viewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-side-navigation id="empty-nav-${viewport.width}"></usa-side-navigation>`);

          cy.window().then((win) => {
            const sidenav = win.document.getElementById(`empty-nav-${viewport.width}`) as any;
            sidenav.items = [];
          });

          // Should handle empty state gracefully
          cy.get('usa-side-navigation').should('be.visible');
          cy.get('.usa-sidenav').should('be.visible');

          // No layout issues with empty state
          cy.get('usa-side-navigation').should(($el) => {
            expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 10);
          });
        });
      });

      it('should handle dynamic navigation updates during viewport changes', () => {
        cy.mount(`<usa-side-navigation id="dynamic-nav"></usa-side-navigation>`);

        cy.window().then((win) => {
          const sidenav = win.document.getElementById('dynamic-nav') as any;
          sidenav.items = multiLevelNavItems;
        });

        // Start on desktop
        cy.viewport(1200, 800);
        cy.get('.usa-sidenav__item').should('have.length', multiLevelNavItems.length);

        // Add more navigation items while switching to mobile
        cy.window().then((win) => {
          const sidenav = win.document.getElementById('dynamic-nav') as any;
          const additionalItems = [
            { label: 'New Section', href: '/new' },
            { label: 'Another Section', href: '/another' },
          ];
          sidenav.items = [...multiLevelNavItems, ...additionalItems];
        });

        cy.viewport(375, 667); // Switch to mobile
        cy.get('.usa-sidenav__toggle').click();
        cy.get('.usa-sidenav__item').should('have.length', multiLevelNavItems.length + 2);

        // Navigation should adapt to new content and viewport
        cy.get('.usa-sidenav__nav').should('have.class', 'is-visible');
      });

      it('should maintain accessibility across all responsive states', () => {
        const testViewports = [
          { width: 375, height: 667 },
          { width: 768, height: 1024 },
          { width: 1200, height: 800 },
        ];

        testViewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-side-navigation id="a11y-nav-${viewport.width}"></usa-side-navigation>`);

          cy.window().then((win) => {
            const sidenav = win.document.getElementById(`a11y-nav-${viewport.width}`) as any;
            sidenav.items = multiLevelNavItems;
            if (viewport.width <= 768) {
              sidenav.mobileCollapsible = true;
            }
          });

          // Verify ARIA attributes at all sizes
          cy.get('nav').should('have.attr', 'aria-label');

          if (viewport.width <= 768) {
            // Mobile accessibility
            cy.get('.usa-sidenav__toggle').should('have.attr', 'aria-expanded');
            cy.get('.usa-sidenav__toggle').click();
          }

          cy.get('.usa-sidenav__link').should('be.visible');
          cy.get('.usa-current').should('have.attr', 'aria-current', 'page');

          // Check keyboard navigation works
          cy.get('.usa-sidenav__link').first().focus();
          cy.focused().tab();

          // Run accessibility test
          cy.injectAxe();
          cy.checkAccessibility();
        });
      });
    });
  });
});
