/**
 * Example Tests: Header Layout and Structure Validation
 *
 * These tests demonstrate strategies that would have caught the header search cutoff issue.
 * Tests validate DOM structure, CSS properties, component composition, and visual rendering.
 *
 * @see docs/TESTING_LAYOUT_VISUAL_REGRESSIONS.md for complete testing methodology
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { waitForUpdate } from '../../test/test-utils.js';
import type { USAHeader } from '../../components/header/usa-header.js';
import '../../components/header/index.js';

describe('Header Layout Validation (Example Tests)', () => {
  let element: USAHeader;

  beforeEach(async () => {
    element = document.createElement('usa-header') as USAHeader;
    element.logoText = 'Test Agency';
    element.showSearch = true;
    element.searchPlaceholder = 'Search';
    document.body.appendChild(element);
    await waitForUpdate(element);
  });

  afterEach(() => {
    element.remove();
  });

  // ============================================================================
  // 1. DOM STRUCTURE VALIDATION TESTS
  // ============================================================================

  describe('DOM Structure Compliance', () => {
    it('should have search directly in usa-nav__secondary (not in list item)', async () => {
      // Get search element
      const search = element.querySelector('usa-search');
      expect(search).toBeTruthy();

      // Check parent is usa-nav__secondary (not a list item)
      const parent = search?.parentElement;
      expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);

      // Ensure NOT in a list structure (this was the bug!)
      const listParent = search?.closest('ul');
      expect(listParent).toBeNull();
    });

    it('should NOT have extra wrapper elements around search', async () => {
      const search = element.querySelector('usa-search');
      const parent = search?.parentElement;

      // Parent should be usa-nav__secondary, not a section or other wrapper
      // This would have caught the <section> wrapper bug
      expect(parent?.tagName.toLowerCase()).not.toBe('section');
      expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);
    });

    it('should match USWDS reference HTML structure for search in header', async () => {
      // Expected structure from USWDS:
      // <div class="usa-nav__secondary">
      //   <ul class="usa-nav__secondary-links"></ul>
      //   <usa-search>...</usa-search>
      // </div>

      const secondary = element.querySelector('.usa-nav__secondary');
      expect(secondary).toBeTruthy();

      const secondaryLinks = secondary?.querySelector('.usa-nav__secondary-links');
      expect(secondaryLinks).toBeTruthy();

      const search = secondary?.querySelector('usa-search');
      expect(search).toBeTruthy();

      // usa-search should be sibling of usa-nav__secondary-links (not child)
      const children = Array.from(secondary?.children || []);
      const linksIndex = children.findIndex(el => el.classList.contains('usa-nav__secondary-links'));
      const searchIndex = children.findIndex(el => el.tagName.toLowerCase() === 'usa-search');

      expect(searchIndex).toBe(linksIndex + 1); // search comes after links
    });
  });

  // ============================================================================
  // 2. CSS DISPLAY PROPERTY TESTS
  // ============================================================================

  describe('CSS Display Properties', () => {
    it('should have inline-block display on usa-search', async () => {
      const search = element.querySelector('usa-search') as HTMLElement;
      const styles = window.getComputedStyle(search);

      // This would have caught the display: block bug!
      expect(styles.display).toBe('inline-block');
      expect(styles.width).toBe('100%'); // USWDS applies width: 100%
    });

    it('should not have block display that breaks layout', async () => {
      const search = element.querySelector('usa-search') as HTMLElement;
      const styles = window.getComputedStyle(search);

      // Block display would break USWDS flexbox layout
      expect(styles.display).not.toBe('block');
    });

    it('should have correct positioning for usa-nav__secondary on desktop', async () => {
      const secondary = element.querySelector('.usa-nav__secondary') as HTMLElement;

      if (secondary) {
        const styles = window.getComputedStyle(secondary);

        // On desktop, USWDS positions this absolutely
        // This test would verify the layout works correctly
        expect(['absolute', 'relative', 'static']).toContain(styles.position);
      }
    });
  });

  // ============================================================================
  // 3. COMPONENT COMPOSITION TESTS
  // ============================================================================

  describe('Component Composition', () => {
    it('should use usa-search web component (not inline HTML)', async () => {
      // Should have usa-search custom element
      const searchComponent = element.querySelector('usa-search');
      expect(searchComponent).toBeTruthy();
      expect(searchComponent?.tagName.toLowerCase()).toBe('usa-search');

      // Should NOT have inline search form with usa-search class
      // This would have caught the inline HTML duplication bug
      const inlineSearchForms = element.querySelectorAll('form.usa-search');
      expect(inlineSearchForms.length).toBe(0); // usa-search component has the form inside it
    });

    it('should have imported usa-search component', () => {
      // Verify usa-search is registered as a custom element
      const searchConstructor = customElements.get('usa-search');
      expect(searchConstructor).toBeDefined();
    });

    it('should dispatch header-search event from usa-search component', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('header-search', (e: Event) => {
        eventFired = true;
        eventDetail = (e as CustomEvent).detail;
      });

      const search = element.querySelector('usa-search');
      const form = search?.querySelector('form');

      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
        await waitForUpdate(element);
      }

      expect(eventFired).toBe(true);
      expect(eventDetail).toHaveProperty('query');
    });
  });

  // ============================================================================
  // 4. USWDS REFERENCE COMPARISON TESTS
  // ============================================================================

  describe('USWDS HTML Reference Compliance', () => {
    it('should match official USWDS header structure', async () => {
      // Official USWDS structure:
      // <header class="usa-header usa-header--basic">
      //   <div class="usa-nav-container">
      //     <div class="usa-navbar">...</div>
      //     <nav class="usa-nav">
      //       <div class="usa-nav__inner">
      //         <ul class="usa-nav__primary">...</ul>
      //         <div class="usa-nav__secondary">
      //           <ul class="usa-nav__secondary-links"></ul>
      //           <!-- search goes here, NOT in a list -->
      //         </div>
      //       </div>
      //     </nav>
      //   </div>
      // </header>

      const header = element.querySelector('.usa-header');
      const navContainer = element.querySelector('.usa-nav-container');
      const navbar = element.querySelector('.usa-navbar');
      const nav = element.querySelector('.usa-nav');
      const navInner = element.querySelector('.usa-nav__inner');
      const secondary = element.querySelector('.usa-nav__secondary');
      const secondaryLinks = element.querySelector('.usa-nav__secondary-links');

      expect(header).toBeTruthy();
      expect(navContainer).toBeTruthy();
      expect(navbar).toBeTruthy();
      expect(nav).toBeTruthy();
      expect(navInner).toBeTruthy();
      expect(secondary).toBeTruthy();
      expect(secondaryLinks).toBeTruthy();

      // Verify correct nesting
      expect(navContainer?.contains(navbar)).toBe(true);
      expect(navContainer?.contains(nav)).toBe(true);
      expect(nav?.contains(navInner)).toBe(true);
      expect(navInner?.contains(secondary)).toBe(true);
      expect(secondary?.contains(secondaryLinks)).toBe(true);
    });

    it('should have search as direct child of usa-nav__secondary', async () => {
      const secondary = element.querySelector('.usa-nav__secondary');
      const search = secondary?.querySelector('usa-search');

      // Direct child relationship
      expect(search?.parentElement).toBe(secondary);

      // Should be sibling of usa-nav__secondary-links, not nested in it
      const links = secondary?.querySelector('.usa-nav__secondary-links');
      expect(links?.contains(search as Node)).toBe(false);
    });
  });

  // ============================================================================
  // 5. VISUAL RENDERING VALIDATION
  // ============================================================================

  describe('Visual Rendering (Basic Checks)', () => {
    it('should render search element with reasonable dimensions', async () => {
      const search = element.querySelector('usa-search') as HTMLElement;

      if (search) {
        const rect = search.getBoundingClientRect();

        // Should have width (not collapsed)
        expect(rect.width).toBeGreaterThan(0);

        // Should have height (not cut off at 0)
        // This would have caught the cutoff bug!
        expect(rect.height).toBeGreaterThan(30);
      }
    });

    it('should have search input visible in viewport', async () => {
      const search = element.querySelector('usa-search');
      const input = search?.querySelector('.usa-search__input') as HTMLElement;

      if (input) {
        const rect = input.getBoundingClientRect();

        // Should be in viewport (not cut off at top)
        expect(rect.top).toBeGreaterThanOrEqual(0);
        expect(rect.height).toBeGreaterThan(0);
      }
    });
  });
});

/**
 * CYPRESS COMPONENT TEST EXAMPLES
 *
 * These would go in cypress/component/usa-header-visual.cy.ts
 *
 * describe('Header Visual Rendering', () => {
 *   it('should render search without cutoff at top of page', () => {
 *     cy.mount(`
 *       <usa-header
 *         logo-text="Test Agency"
 *         show-search="true"
 *         search-placeholder="Search"
 *       ></usa-header>
 *     `);
 *
 *     // Search should be visible
 *     cy.get('usa-search').should('be.visible');
 *
 *     // Check search is not cut off (has reasonable height)
 *     cy.get('usa-search').then(($search) => {
 *       const height = $search.height();
 *       expect(height).to.be.greaterThan(30);
 *     });
 *
 *     // Check search input is visible and clickable
 *     cy.get('.usa-search__input').should('be.visible').and('not.be.disabled');
 *
 *     // Check search button is visible
 *     cy.get('.usa-search__submit').should('be.visible');
 *   });
 *
 *   it('should have search properly positioned in header layout', () => {
 *     cy.mount(`
 *       <usa-header
 *         logo-text="Test Agency"
 *         show-search="true"
 *         extended="true"
 *       ></usa-header>
 *     `);
 *
 *     // On desktop, usa-nav__secondary should be absolutely positioned
 *     cy.viewport(1024, 768);
 *
 *     cy.get('.usa-nav__secondary').then(($secondary) => {
 *       const styles = window.getComputedStyle($secondary[0]);
 *
 *       // Should be absolutely positioned (USWDS desktop layout)
 *       expect(styles.position).to.equal('absolute');
 *
 *       // Should have bottom and right positioning
 *       expect(styles.bottom).to.not.equal('auto');
 *       expect(styles.right).to.not.equal('auto');
 *     });
 *
 *     // Search within should still be visible
 *     cy.get('usa-search').should('be.visible');
 *   });
 * });
 */
