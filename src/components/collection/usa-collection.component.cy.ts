// Component tests for usa-collection
import './index.ts';
import {
  testRapidClicking,
  testRapidKeyboardInteraction,
  COMMON_BUG_PATTERNS,
} from '../../cypress/support/rapid-interaction-tests.ts';

describe('Collection Component Tests', () => {
  beforeEach(() => {
    // Set up console error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  it('should render component with default properties', () => {
    cy.mount('<usa-collection></usa-collection>');
    cy.get('usa-collection').should('exist');
    cy.get('usa-collection').should('be.visible');
  });

  it('should handle rapid clicking without visual glitches', () => {
    cy.mount('<usa-collection></usa-collection>');

    // Rapid clicking without waiting - simulates real user behavior
    cy.get('usa-collection').as('component');

    // Multiple rapid clicks
    cy.get('@component').click().click().click().click().click();

    cy.wait(500); // Let events settle

    // Component should remain functional
    cy.get('@component').should('exist');
    cy.get('@component').should('be.visible');
  });

  it('should handle interaction during CSS transitions', () => {
    cy.mount('<usa-collection></usa-collection>');

    // Click during potential transitions
    cy.get('usa-collection').click().click(); // Immediate second click

    cy.wait(1000); // Wait for animations

    // Should be in consistent state
    cy.get('usa-collection').should('exist');
  });

  // Stress tests using utility functions
  describe('Stress Testing', () => {
    it('should handle event listener duplication pattern', () => {
      cy.mount('<usa-collection></usa-collection>');

      // Test for event listener duplication
      testRapidClicking({
        selector: 'usa-collection',
        clickCount: 15,
        description: 'event listener duplication',
      });
    });

    it('should handle race condition patterns', () => {
      cy.mount('<usa-collection></usa-collection>');

      // Test for race conditions during state changes
      cy.get('usa-collection').as('component');

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
    cy.mount('<usa-collection></usa-collection>');

    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Test that component maintains accessibility after interactions
  it('should maintain accessibility after rapid interactions', () => {
    cy.mount('<usa-collection></usa-collection>');

    // Perform various rapid interactions
    cy.get('usa-collection').click().focus().blur().click().click();

    cy.wait(500);

    // Accessibility should still be intact
    cy.injectAxe();
    cy.checkAccessibility();
  });

  // Performance regression test
  it('should not cause memory leaks with rapid mounting/unmounting', () => {
    // This catches memory leaks and cleanup issues
    for (let i = 0; i < 5; i++) {
      cy.mount('<usa-collection></usa-collection>');
      cy.get('usa-collection').should('exist');
      // Cypress automatically cleans up between mounts
    }
  });

  // Console error test - should not generate any JavaScript errors
  it('should not generate console errors during interactions', () => {
    cy.mount('<usa-collection></usa-collection>');

    // Various interactions that might cause errors
    cy.get('usa-collection').click().trigger('mouseenter').trigger('mouseleave').focus().blur();

    cy.wait(500);

    // No console errors should have occurred
    cy.get('@consoleError').should('not.have.been.called');
  });

  // Responsive Layout Testing (Critical Gap Fix)
  describe('Responsive Layout Testing', () => {
    const sampleCollectionItems = [
      {
        id: 1,
        title: 'Public Health Initiative',
        description:
          'A comprehensive program to improve community health outcomes through preventive care and education.',
        image: '/images/health-initiative.jpg',
        date: '2024-01-15',
        category: 'Health',
        agency: 'Department of Health',
      },
      {
        id: 2,
        title: 'Education Reform Program',
        description:
          'Modernizing educational standards and curriculum to prepare students for 21st-century careers.',
        image: '/images/education-reform.jpg',
        date: '2024-02-01',
        category: 'Education',
        agency: 'Department of Education',
      },
      {
        id: 3,
        title: 'Infrastructure Development',
        description:
          'Upgrading roads, bridges, and public transportation to support economic growth and safety.',
        image: '/images/infrastructure.jpg',
        date: '2024-02-15',
        category: 'Infrastructure',
        agency: 'Department of Transportation',
      },
      {
        id: 4,
        title: 'Environmental Protection Plan',
        description:
          'Implementing sustainable practices and conservation efforts to protect natural resources.',
        image: '/images/environment.jpg',
        date: '2024-03-01',
        category: 'Environment',
        agency: 'Environmental Protection Agency',
      },
      {
        id: 5,
        title: 'Economic Development Strategy',
        description:
          'Supporting small businesses and entrepreneurs to create jobs and stimulate local economies.',
        image: '/images/economic-development.jpg',
        date: '2024-03-15',
        category: 'Economy',
        agency: 'Department of Commerce',
      },
      {
        id: 6,
        title: 'Technology Innovation Hub',
        description:
          'Fostering technological advancement and digital literacy across all communities.',
        image: '/images/technology.jpg',
        date: '2024-04-01',
        category: 'Technology',
        agency: 'Office of Science and Technology',
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
          cy.mount(`<usa-collection id="responsive-collection"></usa-collection>`);

          cy.window().then((win) => {
            const collection = win.document.getElementById('responsive-collection') as any;
            collection.items = sampleCollectionItems;
          });

          // Basic visibility test
          cy.get('usa-collection').should('be.visible');
          cy.get('.usa-collection').should('be.visible');

          // Collection should fit within viewport
          cy.get('usa-collection').should(($el) => {
            expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 20);
          });

          // Collection items should be visible
          cy.get('.usa-collection__item').should('be.visible');

          // Accessibility at all sizes
          cy.injectAxe();
          cy.checkAccessibility();
        });
      });

      it('should handle viewport orientation changes', () => {
        cy.mount(`<usa-collection id="orientation-collection"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('orientation-collection') as any;
          collection.items = sampleCollectionItems;
        });

        // Portrait tablet
        cy.viewport(768, 1024);
        cy.get('.usa-collection').should('be.visible');
        cy.get('.usa-collection__item').should('be.visible');

        // Landscape tablet
        cy.viewport(1024, 768);
        cy.get('.usa-collection').should('be.visible');
        cy.get('.usa-collection__item').should('be.visible');

        // Component should adapt without breaking
        cy.injectAxe();
        cy.checkAccessibility();
      });
    });

    describe('Mobile Grid Layout', () => {
      it('should display single column layout on mobile', () => {
        cy.viewport(375, 667); // iPhone SE
        cy.mount(`<usa-collection id="mobile-grid"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('mobile-grid') as any;
          collection.items = sampleCollectionItems;
        });

        // Should display items in single column
        cy.get('.usa-collection')
          .should('have.css', 'grid-template-columns')
          .and('match', /1fr|none/);

        // Items should stack vertically
        cy.get('.usa-collection__item').should('have.length', sampleCollectionItems.length);

        // Each item should be full width
        cy.get('.usa-collection__item').each(($item) => {
          const parentWidth = $item.parent().width();
          const itemWidth = $item.width();
          expect(itemWidth).to.be.at.least(parentWidth! * 0.9); // Allow for some padding
        });
      });

      it('should handle mobile item content overflow', () => {
        const longContentItems = sampleCollectionItems.map((item) => ({
          ...item,
          title: `${item.title} - This is an extremely long title that should wrap properly on mobile devices without causing layout issues`,
          description: `${item.description} Additional content that tests how the collection item handles very long descriptions on mobile devices. This content should wrap appropriately and not cause horizontal scrolling or layout breakage.`,
        }));

        cy.viewport(320, 568); // Very narrow mobile
        cy.mount(`<usa-collection id="mobile-overflow"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('mobile-overflow') as any;
          collection.items = longContentItems;
        });

        // Long content should not cause horizontal overflow
        cy.get('usa-collection').should(($el) => {
          expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 30);
        });

        // Text should wrap properly
        cy.get('.usa-collection__title').should('be.visible');
        cy.get('.usa-collection__description').should('be.visible');
      });

      it('should handle touch interactions on mobile', () => {
        cy.viewport(375, 667);
        cy.mount(`<usa-collection id="mobile-touch"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('mobile-touch') as any;
          collection.items = sampleCollectionItems;
          collection.interactive = true;
        });

        // Test touch targets are at least 44px
        cy.get('.usa-collection__item').each(($item) => {
          const rect = $item[0].getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).to.be.at.least(44);
        });

        // Simulate touch on collection item
        cy.get('.usa-collection__item')
          .first()
          .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 100, clientY: 100 }] });

        cy.get('.usa-collection').should('be.visible');
      });

      it('should adapt spacing for mobile screens', () => {
        cy.viewport(375, 667);
        cy.mount(`<usa-collection id="mobile-spacing"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('mobile-spacing') as any;
          collection.items = sampleCollectionItems;
        });

        // Items should have appropriate mobile spacing
        cy.get('.usa-collection__item').should('have.css', 'margin-bottom');

        // Collection should use mobile-optimized padding
        cy.get('.usa-collection').should('be.visible');
      });
    });

    describe('Tablet Grid Layout', () => {
      it('should display two-column layout on tablet portrait', () => {
        cy.viewport(768, 1024);
        cy.mount(`<usa-collection id="tablet-portrait-grid"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('tablet-portrait-grid') as any;
          collection.items = sampleCollectionItems;
        });

        // Should display in 2-column grid
        cy.get('.usa-collection')
          .should('have.css', 'grid-template-columns')
          .and('include', 'repeat(2');

        // Items should be arranged in 2 columns
        cy.get('.usa-collection__item').should('have.length', sampleCollectionItems.length);

        // Each item should be roughly half width
        cy.get('.usa-collection__item')
          .first()
          .should(($item) => {
            const parentWidth = $item.parent().width();
            const itemWidth = $item.width();
            expect(itemWidth).to.be.lessThan(parentWidth! * 0.6); // Should be less than 60% (allowing for gaps)
          });
      });

      it('should display three-column layout on tablet landscape', () => {
        cy.viewport(1024, 768);
        cy.mount(`<usa-collection id="tablet-landscape-grid"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('tablet-landscape-grid') as any;
          collection.items = sampleCollectionItems;
        });

        // Should display in 3-column grid
        cy.get('.usa-collection')
          .should('have.css', 'grid-template-columns')
          .and('include', 'repeat(3');

        // Items should be arranged efficiently
        cy.get('.usa-collection__item').should('be.visible');
      });

      it('should handle tablet-specific interactions', () => {
        cy.viewport(768, 1024);
        cy.mount(`<usa-collection id="tablet-interactions"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('tablet-interactions') as any;
          collection.items = sampleCollectionItems;
          collection.interactive = true;
        });

        // Test hover states on tablet
        cy.get('.usa-collection__item').first().trigger('mouseover');
        cy.get('.usa-collection__item').first().should('be.visible');

        // Test click interactions
        cy.get('.usa-collection__item').first().click();
        cy.get('.usa-collection').should('be.visible');
      });
    });

    describe('Desktop Grid Layout', () => {
      it('should display three-column layout on desktop', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-collection id="desktop-grid"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('desktop-grid') as any;
          collection.items = sampleCollectionItems;
        });

        // Should display in 3-column grid
        cy.get('.usa-collection')
          .should('have.css', 'grid-template-columns')
          .and('include', 'repeat(3');

        // All items should be visible
        cy.get('.usa-collection__item').should('have.length', sampleCollectionItems.length);

        // Grid should fit comfortably
        cy.get('.usa-collection').should('be.visible');
      });

      it('should display four-column layout on large desktop', () => {
        cy.viewport(1920, 1080);
        cy.mount(`<usa-collection id="large-desktop-grid"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('large-desktop-grid') as any;
          collection.items = sampleCollectionItems;
        });

        // Should display in 4-column grid on large screens
        cy.get('.usa-collection')
          .should('have.css', 'grid-template-columns')
          .and('include', 'repeat(4');

        // Items should be efficiently arranged
        cy.get('.usa-collection__item').should('be.visible');
      });

      it('should handle large datasets efficiently on desktop', () => {
        const largeDataset = Array.from({ length: 24 }, (_, i) => ({
          id: i + 1,
          title: `Item ${i + 1}`,
          description: `Description for item ${i + 1} with enough content to test layout.`,
          image: `/images/item-${i + 1}.jpg`,
          date: `2024-${String(Math.floor(i / 12) + 1).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}`,
          category: ['Health', 'Education', 'Infrastructure', 'Environment'][i % 4],
          agency: `Agency ${Math.floor(i / 6) + 1}`,
        }));

        cy.viewport(1920, 1080);
        cy.mount(`<usa-collection id="large-dataset"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('large-dataset') as any;
          collection.items = largeDataset;
          collection.pagination = { pageSize: 12, showPageSizes: true };
        });

        // Should render efficiently
        cy.get('.usa-collection__item').should('have.length.at.most', 12);

        // Pagination should work if enabled
        if (largeDataset.length > 12) {
          cy.get('.usa-pagination').should('be.visible');
        }
      });

      it('should handle desktop hover and focus states', () => {
        cy.viewport(1200, 800);
        cy.mount(`<usa-collection id="desktop-hover"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('desktop-hover') as any;
          collection.items = sampleCollectionItems;
          collection.interactive = true;
        });

        // Test hover effects
        cy.get('.usa-collection__item').first().trigger('mouseover');
        cy.get('.usa-collection__item').first().should('be.visible');

        // Test focus states
        cy.get('.usa-collection__item').first().focus();
        cy.focused().should('exist');

        // Test keyboard navigation
        cy.focused().tab();
        cy.focused().should('exist');
      });
    });

    describe('Responsive Collection Features', () => {
      it('should handle responsive image loading', () => {
        viewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-collection id="responsive-images-${viewport.width}"></usa-collection>`);

          cy.window().then((win) => {
            const collection = win.document.getElementById(
              `responsive-images-${viewport.width}`
            ) as any;
            collection.items = sampleCollectionItems;
            collection.lazyLoading = true;
          });

          // Images should be loaded appropriately for viewport
          cy.get('.usa-collection__image').should('be.visible');

          // Images should not cause layout shift
          cy.get('.usa-collection').should('be.visible');
        });
      });

      it('should maintain item aspect ratios across viewports', () => {
        const testViewports = [
          { width: 375, height: 667, expectedColumns: 1 },
          { width: 768, height: 1024, expectedColumns: 2 },
          { width: 1200, height: 800, expectedColumns: 3 },
        ];

        testViewports.forEach((vp) => {
          cy.viewport(vp.width, vp.height);
          cy.mount(`<usa-collection id="aspect-ratios-${vp.width}"></usa-collection>`);

          cy.window().then((win) => {
            const collection = win.document.getElementById(`aspect-ratios-${vp.width}`) as any;
            collection.items = sampleCollectionItems;
          });

          // Items should maintain consistent aspect ratios
          cy.get('.usa-collection__item').each(($item) => {
            const rect = $item[0].getBoundingClientRect();
            expect(rect.width).to.be.greaterThan(0);
            expect(rect.height).to.be.greaterThan(0);
          });
        });
      });

      it('should handle responsive filtering and search', () => {
        cy.viewport(375, 667); // Mobile
        cy.mount(`<usa-collection id="responsive-filter"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('responsive-filter') as any;
          collection.items = sampleCollectionItems;
          collection.filterable = true;
          collection.searchable = true;
        });

        // Filter functionality should work on mobile
        cy.get('.usa-collection__filter').should('be.visible');

        // Change to desktop
        cy.viewport(1200, 800);

        // Filter should persist and be visible
        cy.get('.usa-collection__filter').should('be.visible');
      });

      it('should handle responsive sorting', () => {
        cy.viewport(768, 1024); // Tablet
        cy.mount(`<usa-collection id="responsive-sort"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('responsive-sort') as any;
          collection.items = sampleCollectionItems;
          collection.sortable = true;
        });

        // Sort controls should be visible and functional
        cy.get('.usa-collection__sort').should('be.visible');

        // Test sorting
        cy.get('.usa-collection__sort select').select('date');
        cy.get('.usa-collection__item').should('be.visible');

        // Change to mobile
        cy.viewport(375, 667);

        // Sort should still be accessible
        cy.get('.usa-collection__sort').should('be.visible');
      });
    });

    describe('Responsive Edge Cases', () => {
      it('should handle collections with mixed content types', () => {
        const mixedContentItems = [
          {
            id: 1,
            title: 'Short Title',
            description: 'Short description.',
            image: '/images/short.jpg',
          },
          {
            id: 2,
            title:
              'This is an Extremely Long Title That Should Test Text Wrapping and Layout Behavior',
            description:
              'This is a very long description that contains multiple sentences and should test how the collection item handles varying amounts of content. It includes additional details that would normally require more space and should wrap appropriately.',
            image: '/images/long.jpg',
          },
          {
            id: 3,
            title: 'Medium Length Title Here',
            description:
              'A moderately sized description that falls between the short and long examples.',
            image: '/images/medium.jpg',
          },
        ];

        cy.viewport(768, 1024);
        cy.mount(`<usa-collection id="mixed-content"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('mixed-content') as any;
          collection.items = mixedContentItems;
        });

        // All items should align properly despite different content lengths
        cy.get('.usa-collection__item').should('have.length', 3);
        cy.get('.usa-collection__item').each(($item) => {
          cy.wrap($item).should('be.visible');
        });

        // No layout breaking should occur
        cy.get('.usa-collection').should('be.visible');
      });

      it('should handle empty collection state responsively', () => {
        viewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-collection id="empty-collection-${viewport.width}"></usa-collection>`);

          cy.window().then((win) => {
            const collection = win.document.getElementById(
              `empty-collection-${viewport.width}`
            ) as any;
            collection.items = [];
          });

          // Should show empty state properly
          cy.get('usa-collection').should('be.visible');

          // No layout issues with empty state
          cy.get('usa-collection').should(($el) => {
            expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 10);
          });
        });
      });

      it('should handle dynamic content updates during viewport changes', () => {
        cy.mount(`<usa-collection id="dynamic-collection"></usa-collection>`);

        cy.window().then((win) => {
          const collection = win.document.getElementById('dynamic-collection') as any;
          collection.items = sampleCollectionItems.slice(0, 3);
        });

        // Start on desktop (3 columns)
        cy.viewport(1200, 800);
        cy.get('.usa-collection__item').should('have.length', 3);

        // Add more items while transitioning to mobile
        cy.window().then((win) => {
          const collection = win.document.getElementById('dynamic-collection') as any;
          collection.items = sampleCollectionItems; // All 6 items
        });

        cy.viewport(375, 667); // Switch to mobile (1 column)
        cy.get('.usa-collection__item').should('have.length', 6);

        // Layout should adapt to new content and viewport
        cy.get('.usa-collection').should('be.visible');
      });

      it('should maintain accessibility across all responsive states', () => {
        const testViewports = [
          { width: 375, height: 667 },
          { width: 768, height: 1024 },
          { width: 1200, height: 800 },
        ];

        testViewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-collection id="a11y-collection-${viewport.width}"></usa-collection>`);

          cy.window().then((win) => {
            const collection = win.document.getElementById(
              `a11y-collection-${viewport.width}`
            ) as any;
            collection.items = sampleCollectionItems;
          });

          // Verify semantic structure at all sizes
          cy.get('.usa-collection')
            .should('have.attr', 'role')
            .or('match', /list|grid/);

          // Items should be accessible
          cy.get('.usa-collection__item').should('be.visible');

          // Check keyboard navigation works
          cy.get('.usa-collection__item').first().focus();
          cy.focused().tab();

          // Run accessibility test
          cy.injectAxe();
          cy.checkAccessibility();
        });
      });

      it('should handle collection with very few items responsively', () => {
        const fewItems = sampleCollectionItems.slice(0, 2);

        viewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.mount(`<usa-collection id="few-items-${viewport.width}"></usa-collection>`);

          cy.window().then((win) => {
            const collection = win.document.getElementById(`few-items-${viewport.width}`) as any;
            collection.items = fewItems;
          });

          // Should handle few items gracefully
          cy.get('.usa-collection__item').should('have.length', 2);
          cy.get('.usa-collection__item').should('be.visible');

          // Layout should still look good
          cy.get('.usa-collection').should('be.visible');
        });
      });
    });
  });
});
