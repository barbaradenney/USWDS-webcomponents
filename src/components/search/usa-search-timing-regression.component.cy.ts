/**
 * @fileoverview Search Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the search component:
 * 1. Double-click requirement (requestAnimationFrame timing fix)
 * 2. Race condition in initialization
 * 3. USWDS search toggle button timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Search Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (Search Toggle)', () => {
    it('should toggle search on FIRST click of search button (big variant)', () => {
      cy.mount(`
        <usa-search size="big" button-text="Search">
        </usa-search>
      `);

      // Wait for component to initialize and USWDS to set up event handlers
      cy.wait(500);

      // Verify search button exists
      cy.get('.usa-search__submit').should('exist');

      // CRITICAL: First click should immediately work
      cy.get('.usa-search__submit').click();

      // Give USWDS time to toggle search visibility
      cy.wait(200);

      // Search input should be visible after FIRST click (not second)
      cy.get('.usa-search__input').should('be.visible');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-search size="big" button-text="Quick Search">
        </usa-search>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(100);

      // Click immediately after initialization
      cy.get('.usa-search__submit').click();

      // Should work on first try
      cy.wait(200);
      cy.get('.usa-search__input').should('be.visible');
    });

    it('should toggle correctly on each click (no skipped clicks)', () => {
      cy.mount(`
        <usa-search size="big" button-text="Toggle Search">
        </usa-search>
      `);

      cy.wait(200);

      // Click 1: Should show input
      cy.get('.usa-search__submit').click();
      cy.wait(100);
      cy.get('.usa-search__input').should('be.visible');

      // Click 2: Should hide input
      cy.get('.usa-search__submit').click();
      cy.wait(100);
      cy.get('.usa-search__input').should('not.be.visible');

      // Click 3: Should show input again
      cy.get('.usa-search__submit').click();
      cy.wait(100);
      cy.get('.usa-search__input').should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('should handle form submission on first try', () => {
      cy.mount(`
        <usa-search size="small" button-text="Search">
        </usa-search>
      `);

      cy.wait(200);

      // Enter search query
      cy.get('.usa-search__input').type('test query');

      // Submit form
      cy.get('.usa-search__submit').click();

      // Form should submit (no double-click requirement)
      // Note: In real app, this would navigate or trigger search
      cy.get('.usa-search__input').should('have.value', 'test query');
    });

    it('should handle Enter key submission', () => {
      cy.mount(`
        <usa-search size="small" button-text="Search">
        </usa-search>
      `);

      cy.wait(200);

      // Enter search query and press Enter
      cy.get('.usa-search__input').type('keyboard search{enter}');

      // Form should submit on first Enter press
      cy.get('.usa-search__input').should('have.value', 'keyboard search');
    });

    it('should clear search input correctly', () => {
      cy.mount(`
        <usa-search size="small" button-text="Search">
        </usa-search>
      `);

      cy.wait(200);

      // Type and clear
      cy.get('.usa-search__input').type('test');
      cy.get('.usa-search__input').clear();
      cy.get('.usa-search__input').should('have.value', '');
    });
  });

  describe('Initialization Verification', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-search size="big" button-text="Init Test">
        </usa-search>
      `);

      cy.wait(200);

      // After initialization, search should have proper structure
      cy.get('.usa-search').should('exist');
      cy.get('.usa-search__submit').should('exist');
      cy.get('.usa-search__input').should('exist');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-search id="rapid-test" size="big" button-text="Rapid Test">
        </usa-search>
      `);

      cy.wait(200);

      // Rapidly change properties
      cy.get('#rapid-test').then(($search) => {
        const search = $search[0] as any;
        search.setAttribute('button-text', 'Test 1');
        search.setAttribute('button-text', 'Test 2');
        search.setAttribute('button-text', 'Test 3');
      });

      cy.wait(100);

      // Search toggle should still work correctly (no duplicate handlers)
      cy.get('.usa-search__submit').click();
      cy.wait(100);
      cy.get('.usa-search__input').should('be.visible');

      // Toggle off
      cy.get('.usa-search__submit').click();
      cy.wait(100);
      cy.get('.usa-search__input').should('not.be.visible');

      // Toggle on again
      cy.get('.usa-search__submit').click();
      cy.wait(100);
      cy.get('.usa-search__input').should('be.visible');
    });
  });

  describe('Size Variant Testing', () => {
    it('should work correctly with small size variant', () => {
      cy.mount(`
        <usa-search size="small" button-text="Small Search">
        </usa-search>
      `);

      cy.wait(200);

      // Small variant should render correctly
      cy.get('.usa-search--small').should('exist');
      cy.get('.usa-search__input').should('exist');

      // Input should be visible by default in small variant
      cy.get('.usa-search__input').should('be.visible');
    });

    it('should work correctly with big size variant', () => {
      cy.mount(`
        <usa-search size="big" button-text="Big Search">
        </usa-search>
      `);

      cy.wait(200);

      // Big variant should render correctly
      cy.get('.usa-search--big').should('exist');

      // Input should be hidden initially in big variant
      cy.get('.usa-search__input').should('not.be.visible');

      // Click to show
      cy.get('.usa-search__submit').click();
      cy.wait(100);
      cy.get('.usa-search__input').should('be.visible');
    });
  });

  describe('Accessibility Validation', () => {
    it('should have correct ARIA attributes', () => {
      cy.mount(`
        <usa-search size="big" button-text="Accessible Search">
        </usa-search>
      `);

      cy.wait(200);

      // Search input should have proper attributes
      cy.get('.usa-search__input').should('have.attr', 'type', 'search');
      cy.get('.usa-search__input').should('have.attr', 'name');

      // Submit button should have proper attributes
      cy.get('.usa-search__submit').should('have.attr', 'type');
    });

    it('should be keyboard navigable', () => {
      cy.mount(`
        <usa-search size="small" button-text="Keyboard Search">
        </usa-search>
      `);

      cy.wait(200);

      // Tab to search input
      cy.get('.usa-search__input').focus();
      cy.get('.usa-search__input').should('have.focus');

      // Type search query
      cy.get('.usa-search__input').type('keyboard test');

      // Tab to submit button
      cy.get('.usa-search__submit').focus();
      cy.get('.usa-search__submit').should('have.focus');

      // Press Enter to submit
      cy.get('.usa-search__submit').type('{enter}');

      // Form should submit
      cy.get('.usa-search__input').should('have.value', 'keyboard test');
    });

    it('should maintain focus after toggle in big variant', () => {
      cy.mount(`
        <usa-search size="big" button-text="Focus Test">
        </usa-search>
      `);

      cy.wait(200);

      // Click to show input
      cy.get('.usa-search__submit').click();
      cy.wait(100);

      // Input should be visible and focusable
      cy.get('.usa-search__input').should('be.visible');
      cy.get('.usa-search__input').focus();
      cy.get('.usa-search__input').should('have.focus');
    });
  });

  describe('Form Integration', () => {
    it('should handle placeholder text correctly', () => {
      cy.mount(`
        <usa-search size="small" button-text="Search" placeholder="Enter keywords">
        </usa-search>
      `);

      cy.wait(200);

      // Placeholder should be set
      cy.get('.usa-search__input').should('have.attr', 'placeholder', 'Enter keywords');
    });

    it('should handle disabled state correctly', () => {
      cy.mount(`
        <usa-search id="disabled-test" size="small" button-text="Search">
        </usa-search>
      `);

      cy.wait(200);

      // Disable search
      cy.get('#disabled-test').then(($search) => {
        const search = $search[0] as any;
        search.disabled = true;
      });

      cy.wait(100);

      // Input and button should be disabled
      cy.get('.usa-search__input').should('be.disabled');
      cy.get('.usa-search__submit').should('be.disabled');
    });
  });
});
