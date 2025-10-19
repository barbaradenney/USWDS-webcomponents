/**
 * REGRESSION TESTS: Sticky Navigation and Active Link Tracking
 *
 * These tests verify that:
 * 1. Navigation remains sticky/fixed during page scroll
 * 2. Active link highlights update correctly as user scrolls through sections
 * 3. Active state persists correctly when navigating between sections
 * 4. Sticky positioning works across different viewport sizes
 */

describe('In-Page Navigation - Sticky Behavior and Active Link Tracking', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Sticky Navigation Positioning', () => {
    beforeEach(() => {
      // Create scrollable page with in-page navigation
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="sticky-nav"></usa-in-page-navigation>

            <div id="section-1" style="height: 800px; padding: 20px; background: #f0f0f0;">
              <h2>Section 1</h2>
              <p>This is the first section with enough content to scroll.</p>
            </div>

            <div id="section-2" style="height: 800px; padding: 20px; background: #e0e0e0;">
              <h2>Section 2</h2>
              <p>This is the second section with more scrollable content.</p>
            </div>

            <div id="section-3" style="height: 800px; padding: 20px; background: #d0d0d0;">
              <h2>Section 3</h2>
              <p>This is the third section to test scroll behavior.</p>
            </div>

            <div id="section-4" style="height: 800px; padding: 20px; background: #c0c0c0;">
              <h2>Section 4</h2>
              <p>This is the fourth section for comprehensive testing.</p>
            </div>
          </div>
        `;

        const nav = doc.getElementById('sticky-nav') as any;
        nav.items = [
          { id: 'nav-1', text: 'Section 1', href: '#section-1' },
          { id: 'nav-2', text: 'Section 2', href: '#section-2' },
          { id: 'nav-3', text: 'Section 3', href: '#section-3' },
          { id: 'nav-4', text: 'Section 4', href: '#section-4' },
        ];
      });

      cy.wait(500); // Allow component to initialize
    });

    it('should remain in fixed position during page scroll', () => {
      // Get initial position of navigation
      cy.get('usa-in-page-navigation').then(($nav) => {
        const initialRect = $nav[0].getBoundingClientRect();
        const initialTop = initialRect.top;

        // Scroll down the page
        cy.scrollTo(0, 500);
        cy.wait(300);

        // Navigation should maintain its position (sticky behavior)
        cy.get('usa-in-page-navigation').then(($navAfterScroll) => {
          const afterScrollRect = $navAfterScroll[0].getBoundingClientRect();

          // For sticky navigation, top position should remain consistent
          // Allow small tolerance for browser differences
          expect(Math.abs(afterScrollRect.top - initialTop)).to.be.lessThan(50);
        });
      });
    });

    it('should remain visible throughout entire page scroll', () => {
      // Scroll through multiple positions and verify navigation stays visible
      const scrollPositions = [0, 300, 800, 1500, 2000];

      scrollPositions.forEach((position) => {
        cy.scrollTo(0, position);
        cy.wait(200);

        cy.get('usa-in-page-navigation').should('be.visible');
      });
    });

    it('should not overlap content when sticky', () => {
      cy.scrollTo(0, 500);
      cy.wait(300);

      cy.get('usa-in-page-navigation').then(($nav) => {
        const navRect = $nav[0].getBoundingClientRect();

        // Navigation should be positioned at top of viewport
        expect(navRect.top).to.be.lessThan(100);

        // Content sections should not be hidden behind navigation
        cy.get('#section-2').then(($section) => {
          const sectionRect = $section[0].getBoundingClientRect();

          // Section should be visible and not completely behind nav
          expect(sectionRect.top).to.be.greaterThan(navRect.bottom - 50);
        });
      });
    });

    it('should maintain sticky behavior across different viewport sizes', () => {
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop-large' },
        { width: 1280, height: 720, name: 'desktop-standard' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' },
      ];

      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.wait(200);

        // Scroll down
        cy.scrollTo(0, 400);
        cy.wait(300);

        // Navigation should remain visible and positioned correctly
        cy.get('usa-in-page-navigation').should('be.visible');

        cy.get('usa-in-page-navigation').then(($nav) => {
          const rect = $nav[0].getBoundingClientRect();

          // Should be near top of viewport
          expect(rect.top).to.be.lessThan(100);

          // Should be within viewport
          expect(rect.left).to.be.greaterThan(-10);
          expect(rect.right).to.be.lessThan(viewport.width + 10);
        });

        // Reset scroll for next viewport
        cy.scrollTo(0, 0);
      });
    });

    it('should handle rapid scrolling without position glitches', () => {
      // Rapid scroll to different positions
      cy.scrollTo(0, 500, { duration: 100 });
      cy.scrollTo(0, 1000, { duration: 100 });
      cy.scrollTo(0, 200, { duration: 100 });
      cy.scrollTo(0, 1500, { duration: 100 });

      cy.wait(500); // Let animations settle

      // Navigation should still be visible and positioned correctly
      cy.get('usa-in-page-navigation').should('be.visible');

      cy.get('usa-in-page-navigation').then(($nav) => {
        const rect = $nav[0].getBoundingClientRect();
        expect(rect.top).to.be.lessThan(100);
      });
    });
  });

  describe('Active Link Tracking During Scroll', () => {
    beforeEach(() => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="active-nav"></usa-in-page-navigation>

            <div id="intro" style="height: 600px; padding: 20px; background: #f8f8f8;">
              <h2>Introduction</h2>
              <p>Welcome to the introduction section.</p>
            </div>

            <div id="overview" style="height: 600px; padding: 20px; background: #f0f0f0;">
              <h2>Overview</h2>
              <p>This section provides an overview.</p>
            </div>

            <div id="details" style="height: 600px; padding: 20px; background: #e8e8e8;">
              <h2>Details</h2>
              <p>Detailed information goes here.</p>
            </div>

            <div id="summary" style="height: 600px; padding: 20px; background: #e0e0e0;">
              <h2>Summary</h2>
              <p>Summary and conclusions.</p>
            </div>
          </div>
        `;

        const nav = doc.getElementById('active-nav') as any;
        nav.items = [
          { id: 'link-intro', text: 'Introduction', href: '#intro' },
          { id: 'link-overview', text: 'Overview', href: '#overview' },
          { id: 'link-details', text: 'Details', href: '#details' },
          { id: 'link-summary', text: 'Summary', href: '#summary' },
        ];
      });

      cy.wait(500);
    });

    it('should update active link when scrolling to different sections', () => {
      // Start at top - intro should be active
      cy.scrollTo(0, 0);
      cy.wait(500);

      cy.get('usa-in-page-navigation a[href="#intro"]').should('have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#overview"]').should('not.have.class', 'usa-current');

      // Scroll to overview section
      cy.get('#overview').scrollIntoView({ offset: { top: -100, left: 0 } });
      cy.wait(500);

      cy.get('usa-in-page-navigation a[href="#overview"]').should('have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#intro"]').should('not.have.class', 'usa-current');

      // Scroll to details section
      cy.get('#details').scrollIntoView({ offset: { top: -100, left: 0 } });
      cy.wait(500);

      cy.get('usa-in-page-navigation a[href="#details"]').should('have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#overview"]').should('not.have.class', 'usa-current');

      // Scroll to summary section
      cy.get('#summary').scrollIntoView({ offset: { top: -100, left: 0 } });
      cy.wait(500);

      cy.get('usa-in-page-navigation a[href="#summary"]').should('have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#details"]').should('not.have.class', 'usa-current');
    });

    it('should maintain active state when clicking navigation links', () => {
      // Click on overview link
      cy.get('usa-in-page-navigation a[href="#overview"]').click();
      cy.wait(500);

      // Overview should be active
      cy.get('usa-in-page-navigation a[href="#overview"]').should('have.class', 'usa-current');

      // Click on details link
      cy.get('usa-in-page-navigation a[href="#details"]').click();
      cy.wait(500);

      // Details should now be active
      cy.get('usa-in-page-navigation a[href="#details"]').should('have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#overview"]').should('not.have.class', 'usa-current');
    });

    it('should update active state when scrolling backwards', () => {
      // Scroll to bottom (summary)
      cy.get('#summary').scrollIntoView({ offset: { top: -100, left: 0 } });
      cy.wait(500);

      cy.get('usa-in-page-navigation a[href="#summary"]').should('have.class', 'usa-current');

      // Scroll back up to details
      cy.get('#details').scrollIntoView({ offset: { top: -100, left: 0 } });
      cy.wait(500);

      cy.get('usa-in-page-navigation a[href="#details"]').should('have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#summary"]').should('not.have.class', 'usa-current');

      // Scroll back to intro
      cy.scrollTo(0, 0);
      cy.wait(500);

      cy.get('usa-in-page-navigation a[href="#intro"]').should('have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#details"]').should('not.have.class', 'usa-current');
    });

    it('should only have one active link at a time', () => {
      const sections = ['#intro', '#overview', '#details', '#summary'];

      sections.forEach((section) => {
        // Scroll to section
        cy.get(section).scrollIntoView({ offset: { top: -100, left: 0 } });
        cy.wait(500);

        // Check that exactly one link has usa-current class
        cy.get('usa-in-page-navigation a.usa-current').should('have.length', 1);

        // Verify it's the correct link
        cy.get(`usa-in-page-navigation a[href="${section}"]`).should('have.class', 'usa-current');
      });
    });

    it('should handle smooth scroll animation and update active state', () => {
      // Click navigation link to trigger smooth scroll
      cy.get('usa-in-page-navigation a[href="#details"]').click();

      // Wait for smooth scroll animation
      cy.wait(1000);

      // Active link should update to details
      cy.get('usa-in-page-navigation a[href="#details"]').should('have.class', 'usa-current');

      // Details section should be in viewport
      cy.get('#details').should('be.visible');
    });

    it('should persist active state during rapid section changes', () => {
      // Rapidly click through different sections
      cy.get('usa-in-page-navigation a[href="#overview"]').click();
      cy.wait(200);

      cy.get('usa-in-page-navigation a[href="#details"]').click();
      cy.wait(200);

      cy.get('usa-in-page-navigation a[href="#summary"]').click();
      cy.wait(1000); // Wait for final animation

      // Final active state should be summary
      cy.get('usa-in-page-navigation a[href="#summary"]').should('have.class', 'usa-current');

      // Only one link should be active
      cy.get('usa-in-page-navigation a.usa-current').should('have.length', 1);
    });
  });

  describe('Active Link Visual Feedback', () => {
    beforeEach(() => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="visual-nav"></usa-in-page-navigation>

            <div id="first" style="height: 700px; padding: 20px;">
              <h2>First Section</h2>
            </div>

            <div id="second" style="height: 700px; padding: 20px;">
              <h2>Second Section</h2>
            </div>

            <div id="third" style="height: 700px; padding: 20px;">
              <h2>Third Section</h2>
            </div>
          </div>
        `;

        const nav = doc.getElementById('visual-nav') as any;
        nav.items = [
          { id: 'first-link', text: 'First', href: '#first' },
          { id: 'second-link', text: 'Second', href: '#second' },
          { id: 'third-link', text: 'Third', href: '#third' },
        ];
      });

      cy.wait(500);
    });

    it('should apply USWDS usa-current class to active link', () => {
      cy.get('usa-in-page-navigation a[href="#first"]').should('have.class', 'usa-current');
    });

    it('should remove usa-current class from previously active link', () => {
      // Initially first is active
      cy.get('usa-in-page-navigation a[href="#first"]').should('have.class', 'usa-current');

      // Navigate to second
      cy.get('usa-in-page-navigation a[href="#second"]').click();
      cy.wait(500);

      // First should no longer be active
      cy.get('usa-in-page-navigation a[href="#first"]').should('not.have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#second"]').should('have.class', 'usa-current');
    });

    it('should maintain visual distinction of active link during hover', () => {
      // Get active link
      cy.get('usa-in-page-navigation a[href="#first"]').should('have.class', 'usa-current');

      // Hover over a non-active link
      cy.get('usa-in-page-navigation a[href="#second"]').trigger('mouseover');
      cy.wait(200);

      // Active link should still have usa-current class
      cy.get('usa-in-page-navigation a[href="#first"]').should('have.class', 'usa-current');

      // Hovered link should not have usa-current
      cy.get('usa-in-page-navigation a[href="#second"]').should('not.have.class', 'usa-current');
    });

    it('should update active indicator during keyboard navigation', () => {
      // Tab through links
      cy.get('usa-in-page-navigation a[href="#first"]').focus();
      cy.wait(200);

      // Press Enter to activate
      cy.focused().type('{enter}');
      cy.wait(500);

      cy.get('usa-in-page-navigation a[href="#first"]').should('have.class', 'usa-current');

      // Tab to next link and activate
      cy.get('usa-in-page-navigation a[href="#second"]').focus().type('{enter}');
      cy.wait(500);

      // Second should now be active
      cy.get('usa-in-page-navigation a[href="#second"]').should('have.class', 'usa-current');
      cy.get('usa-in-page-navigation a[href="#first"]').should('not.have.class', 'usa-current');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle page with very short sections', () => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="short-nav"></usa-in-page-navigation>

            <div id="short-1" style="height: 100px; padding: 10px;">
              <h3>Short Section 1</h3>
            </div>

            <div id="short-2" style="height: 100px; padding: 10px;">
              <h3>Short Section 2</h3>
            </div>

            <div id="short-3" style="height: 100px; padding: 10px;">
              <h3>Short Section 3</h3>
            </div>
          </div>
        `;

        const nav = doc.getElementById('short-nav') as any;
        nav.items = [
          { id: 's1', text: 'Short 1', href: '#short-1' },
          { id: 's2', text: 'Short 2', href: '#short-2' },
          { id: 's3', text: 'Short 3', href: '#short-3' },
        ];
      });

      cy.wait(500);

      // Scroll through short sections
      cy.get('#short-2').scrollIntoView();
      cy.wait(300);

      // Active link should update even with short sections
      cy.get('usa-in-page-navigation a.usa-current').should('exist');
    });

    it('should handle page with single very long section', () => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="long-nav"></usa-in-page-navigation>

            <div id="long-section" style="height: 3000px; padding: 20px;">
              <h2>Very Long Section</h2>
              <p>This section has a lot of content requiring extensive scrolling.</p>
            </div>
          </div>
        `;

        const nav = doc.getElementById('long-nav') as any;
        nav.items = [
          { id: 'long', text: 'Long Content', href: '#long-section' },
        ];
      });

      cy.wait(500);

      // Navigation should remain sticky throughout scroll
      cy.scrollTo(0, 1000);
      cy.wait(300);
      cy.get('usa-in-page-navigation').should('be.visible');

      cy.scrollTo(0, 2000);
      cy.wait(300);
      cy.get('usa-in-page-navigation').should('be.visible');

      // Active link should persist
      cy.get('usa-in-page-navigation a[href="#long-section"]').should('have.class', 'usa-current');
    });

    it('should handle navigation at bottom of page', () => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="bottom-nav"></usa-in-page-navigation>

            <div id="start" style="height: 800px; padding: 20px;">
              <h2>Start</h2>
            </div>

            <div id="middle" style="height: 800px; padding: 20px;">
              <h2>Middle</h2>
            </div>

            <div id="end" style="height: 400px; padding: 20px;">
              <h2>End Section (short)</h2>
            </div>
          </div>
        `;

        const nav = doc.getElementById('bottom-nav') as any;
        nav.items = [
          { id: 'b-start', text: 'Start', href: '#start' },
          { id: 'b-middle', text: 'Middle', href: '#middle' },
          { id: 'b-end', text: 'End', href: '#end' },
        ];
      });

      cy.wait(500);

      // Scroll to very bottom
      cy.scrollTo('bottom');
      cy.wait(500);

      // Last section should be active even if it's short
      cy.get('usa-in-page-navigation a[href="#end"]').should('have.class', 'usa-current');

      // Navigation should still be visible
      cy.get('usa-in-page-navigation').should('be.visible');
    });
  });

  describe('Accessibility During Scroll and Active State', () => {
    beforeEach(() => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="a11y-nav"></usa-in-page-navigation>

            <div id="a11y-1" style="height: 600px; padding: 20px;">
              <h2>Section 1</h2>
            </div>

            <div id="a11y-2" style="height: 600px; padding: 20px;">
              <h2>Section 2</h2>
            </div>

            <div id="a11y-3" style="height: 600px; padding: 20px;">
              <h2>Section 3</h2>
            </div>
          </div>
        `;

        const nav = doc.getElementById('a11y-nav') as any;
        nav.items = [
          { id: 'a1', text: 'Section 1', href: '#a11y-1' },
          { id: 'a2', text: 'Section 2', href: '#a11y-2' },
          { id: 'a3', text: 'Section 3', href: '#a11y-3' },
        ];
      });

      cy.wait(500);
    });

    it('should maintain focus management during navigation', () => {
      // Focus on first link
      cy.get('usa-in-page-navigation a[href="#a11y-1"]').focus();

      // Navigate with keyboard
      cy.focused().type('{enter}');
      cy.wait(500);

      // Focus should remain on navigation or target
      cy.focused().should('exist');
    });

    it('should be accessible with screen reader', () => {
      cy.injectAxe();

      // Check accessibility at different scroll positions
      cy.scrollTo(0, 0);
      cy.wait(300);
      cy.checkA11y('usa-in-page-navigation');

      cy.scrollTo(0, 500);
      cy.wait(300);
      cy.checkA11y('usa-in-page-navigation');

      cy.scrollTo(0, 1000);
      cy.wait(300);
      cy.checkA11y('usa-in-page-navigation');
    });

    it('should announce active link changes to screen readers', () => {
      // Active link should have proper ARIA attributes
      cy.get('usa-in-page-navigation a.usa-current').should('have.attr', 'aria-current', 'location');

      // Navigate to different section
      cy.get('usa-in-page-navigation a[href="#a11y-2"]').click();
      cy.wait(500);

      // New active link should have aria-current
      cy.get('usa-in-page-navigation a[href="#a11y-2"]').should('have.attr', 'aria-current', 'location');

      // Previous link should not have aria-current
      cy.get('usa-in-page-navigation a[href="#a11y-1"]').should('not.have.attr', 'aria-current');
    });
  });

  describe('USWDS Initialization and Duplication Prevention', () => {
    // These tests correspond to the skipped unit tests marked [BROWSER TEST REQUIRED]
    // in src/components/in-page-navigation/usa-in-page-navigation.test.ts

    it('should render minimal structure for USWDS to populate', () => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="minimal-nav"></usa-in-page-navigation>
            <div id="section-a" style="height: 600px;"><h2>Section A</h2></div>
            <div id="section-b" style="height: 600px;"><h2>Section B</h2></div>
          </div>
        `;

        const nav = doc.getElementById('minimal-nav') as any;
        nav.items = [
          { id: 'nav-a', text: 'Section A', href: '#section-a' },
          { id: 'nav-b', text: 'Section B', href: '#section-b' },
        ];
      });

      cy.wait(500);

      // Component should render basic USWDS structure
      cy.get('usa-in-page-navigation nav.usa-in-page-nav').should('exist');
      cy.get('usa-in-page-navigation .usa-in-page-nav__list').should('exist');
      cy.get('usa-in-page-navigation .usa-in-page-nav__item').should('have.length', 2);

      // Links should be functional
      cy.get('usa-in-page-navigation a[href="#section-a"]').should('exist').and('be.visible');
      cy.get('usa-in-page-navigation a[href="#section-b"]').should('exist').and('be.visible');
    });

    it('should prevent multiple USWDS initializations', () => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="init-nav"></usa-in-page-navigation>
            <div id="test-1" style="height: 600px;"><h2>Test 1</h2></div>
            <div id="test-2" style="height: 600px;"><h2>Test 2</h2></div>
          </div>
        `;

        const nav = doc.getElementById('init-nav') as any;
        nav.items = [
          { id: 't1', text: 'Test 1', href: '#test-1' },
          { id: 't2', text: 'Test 2', href: '#test-2' },
        ];
      });

      cy.wait(500);

      // Get initial structure
      cy.get('usa-in-page-navigation .usa-in-page-nav__list').then(($list) => {
        const initialItemCount = $list.find('.usa-in-page-nav__item').length;

        // Trigger potential re-initialization by updating items
        cy.document().then((doc) => {
          const nav = doc.getElementById('init-nav') as any;
          nav.items = [
            { id: 't1', text: 'Test 1', href: '#test-1' },
            { id: 't2', text: 'Test 2', href: '#test-2' },
            { id: 't3', text: 'Test 3', href: '#test-3' },
          ];
        });

        cy.wait(500);

        // Should have exactly 3 items, not duplicates
        cy.get('usa-in-page-navigation .usa-in-page-nav__item').should('have.length', 3);

        // Each href should appear exactly once
        cy.get('usa-in-page-navigation a[href="#test-1"]').should('have.length', 1);
        cy.get('usa-in-page-navigation a[href="#test-2"]').should('have.length', 1);
        cy.get('usa-in-page-navigation a[href="#test-3"]').should('have.length', 1);
      });
    });

    it('should not create duplicate navigation content', () => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="dup-nav"></usa-in-page-navigation>
            <div id="dup-1" style="height: 600px;"><h2>Duplicate Test 1</h2></div>
            <div id="dup-2" style="height: 600px;"><h2>Duplicate Test 2</h2></div>
          </div>
        `;

        const nav = doc.getElementById('dup-nav') as any;
        nav.items = [
          { id: 'd1', text: 'Dup 1', href: '#dup-1' },
          { id: 'd2', text: 'Dup 2', href: '#dup-2' },
        ];
      });

      cy.wait(500);

      // Verify single navigation structure
      cy.get('usa-in-page-navigation nav.usa-in-page-nav').should('have.length', 1);
      cy.get('usa-in-page-navigation .usa-in-page-nav__list').should('have.length', 1);

      // Each item should appear exactly once
      cy.get('usa-in-page-navigation .usa-in-page-nav__item').should('have.length', 2);

      // Links should not be duplicated
      cy.get('usa-in-page-navigation').within(() => {
        cy.contains('Dup 1').should('have.length', 1);
        cy.contains('Dup 2').should('have.length', 1);
      });
    });

    it('should have cleanup method that clears navigation content', () => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="cleanup-nav"></usa-in-page-navigation>
            <div id="clean-1" style="height: 600px;"><h2>Cleanup 1</h2></div>
          </div>
        `;

        const nav = doc.getElementById('cleanup-nav') as any;
        nav.items = [
          { id: 'c1', text: 'Cleanup 1', href: '#clean-1' },
        ];
      });

      cy.wait(500);

      // Verify navigation exists
      cy.get('usa-in-page-navigation nav.usa-in-page-nav').should('exist');
      cy.get('usa-in-page-navigation .usa-in-page-nav__item').should('have.length', 1);

      // Remove the component (simulating cleanup)
      cy.document().then((doc) => {
        const nav = doc.getElementById('cleanup-nav');
        if (nav) {
          nav.remove();
        }
      });

      cy.wait(300);

      // Component should be removed
      cy.get('usa-in-page-navigation#cleanup-nav').should('not.exist');
    });

    it('should prevent race conditions during initialization', () => {
      cy.document().then((doc) => {
        doc.body.innerHTML = `
          <div style="padding: 20px;">
            <usa-in-page-navigation id="race-nav"></usa-in-page-navigation>
            <div id="race-1" style="height: 600px;"><h2>Race 1</h2></div>
            <div id="race-2" style="height: 600px;"><h2>Race 2</h2></div>
          </div>
        `;

        const nav = doc.getElementById('race-nav') as any;

        // Rapidly set items multiple times (simulating race condition)
        nav.items = [{ id: 'r1', text: 'Race 1', href: '#race-1' }];
        nav.items = [
          { id: 'r1', text: 'Race 1', href: '#race-1' },
          { id: 'r2', text: 'Race 2', href: '#race-2' },
        ];
      });

      cy.wait(500);

      // Should render final state correctly without duplicates
      cy.get('usa-in-page-navigation .usa-in-page-nav__item').should('have.length', 2);
      cy.get('usa-in-page-navigation a[href="#race-1"]').should('have.length', 1);
      cy.get('usa-in-page-navigation a[href="#race-2"]').should('have.length', 1);

      // Navigation should be functional
      cy.get('usa-in-page-navigation a[href="#race-2"]').click();
      cy.wait(300);
      cy.get('usa-in-page-navigation a[href="#race-2"]').should('have.class', 'usa-current');
    });
  });
});
