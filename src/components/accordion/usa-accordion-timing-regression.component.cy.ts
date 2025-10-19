/**
 * @fileoverview Accordion Timing and Initialization Regression Tests
 *
 * These tests specifically target the timing issues fixed in the accordion component:
 * 1. Double-click requirement (requestAnimationFrame timing fix)
 * 2. Race condition in setupEventHandlers (multiselectable broken)
 * 3. USWDS initialization timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Accordion Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (requestAnimationFrame Fix)', () => {
    it('should respond to the FIRST click without requiring double-click', () => {
      cy.mount(`
        <usa-accordion id="single-click-test"></usa-accordion>
      `);

      cy.get('#single-click-test').then(($accordion) => {
        const accordion = $accordion[0] as any;
        accordion.items = [
          {
            id: 'test-1',
            title: 'Click Me Once',
            content: '<p>Should open on first click</p>',
            expanded: false,
          },
        ];
      });

      // Wait for component to initialize
      cy.wait(200);

      // CRITICAL: First click should immediately work
      cy.get('.usa-accordion__button').click();

      // Should be expanded after FIRST click (not second)
      cy.get('.usa-accordion__content').should('be.visible');
      cy.get('.usa-accordion__content').should('not.have.attr', 'hidden');
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'true');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-accordion id="immediate-test"></usa-accordion>
      `);

      cy.get('#immediate-test').then(($accordion) => {
        const accordion = $accordion[0] as any;
        accordion.items = [
          {
            id: 'immediate-1',
            title: 'Immediate Click Test',
            content: '<p>Should work right away</p>',
            expanded: false,
          },
        ];
      });

      // Minimal wait - component should be ready quickly
      cy.wait(100);

      // Click immediately after initialization
      cy.get('.usa-accordion__button').click();

      // Should work on first try
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'true');
      cy.get('.usa-accordion__content').should('be.visible');
    });

    it('should toggle correctly on each click (no skipped clicks)', () => {
      cy.mount(`
        <usa-accordion id="toggle-test"></usa-accordion>
      `);

      cy.get('#toggle-test').then(($accordion) => {
        const accordion = $accordion[0] as any;
        accordion.items = [
          {
            id: 'toggle-1',
            title: 'Toggle Test',
            content: '<p>Toggle content</p>',
            expanded: false,
          },
        ];
      });

      cy.wait(200);

      // Click 1: Should expand
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'true');

      cy.wait(100);

      // Click 2: Should collapse
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'false');

      cy.wait(100);

      // Click 3: Should expand again
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'true');
    });
  });

  describe('Multiselectable Mode (Race Condition Fix)', () => {
    it('should allow multiple items to remain open in multiselectable mode', () => {
      cy.mount(`
        <usa-accordion id="multi-test" multiselectable></usa-accordion>
      `);

      cy.get('#multi-test').then(($accordion) => {
        const accordion = $accordion[0] as any;
        accordion.items = [
          { id: 'multi-1', title: 'Item 1', content: '<p>Content 1</p>', expanded: false },
          { id: 'multi-2', title: 'Item 2', content: '<p>Content 2</p>', expanded: false },
          { id: 'multi-3', title: 'Item 3', content: '<p>Content 3</p>', expanded: false },
        ];
      });

      cy.wait(200);

      // Verify data-allow-multiple attribute is set
      cy.get('.usa-accordion').should('have.attr', 'data-allow-multiple');

      // Open first item
      cy.get('#multi-1-button').click();
      cy.wait(100);
      cy.get('#multi-1-content').should('be.visible');
      cy.get('#multi-1-button').should('have.attr', 'aria-expanded', 'true');

      // Open second item - first should stay open
      cy.get('#multi-2-button').click();
      cy.wait(100);
      cy.get('#multi-1-content').should('be.visible'); // Still open!
      cy.get('#multi-2-content').should('be.visible');
      cy.get('#multi-1-button').should('have.attr', 'aria-expanded', 'true');
      cy.get('#multi-2-button').should('have.attr', 'aria-expanded', 'true');

      // Open third item - all should be open
      cy.get('#multi-3-button').click();
      cy.wait(100);
      cy.get('#multi-1-content').should('be.visible'); // Still open!
      cy.get('#multi-2-content').should('be.visible'); // Still open!
      cy.get('#multi-3-content').should('be.visible');
      cy.get('#multi-1-button').should('have.attr', 'aria-expanded', 'true');
      cy.get('#multi-2-button').should('have.attr', 'aria-expanded', 'true');
      cy.get('#multi-3-button').should('have.attr', 'aria-expanded', 'true');
    });

    it('should close other items in exclusive mode (multiselectable=false)', () => {
      cy.mount(`
        <usa-accordion id="exclusive-test"></usa-accordion>
      `);

      cy.get('#exclusive-test').then(($accordion) => {
        const accordion = $accordion[0] as any;
        accordion.items = [
          { id: 'excl-1', title: 'Item 1', content: '<p>Content 1</p>', expanded: false },
          { id: 'excl-2', title: 'Item 2', content: '<p>Content 2</p>', expanded: false },
          { id: 'excl-3', title: 'Item 3', content: '<p>Content 3</p>', expanded: false },
        ];
      });

      cy.wait(200);

      // Verify data-allow-multiple attribute is NOT set
      cy.get('.usa-accordion').should('not.have.attr', 'data-allow-multiple');

      // Open first item
      cy.get('#excl-1-button').click();
      cy.wait(100);
      cy.get('#excl-1-content').should('be.visible');
      cy.get('#excl-1-button').should('have.attr', 'aria-expanded', 'true');

      // Open second item - first should close
      cy.get('#excl-2-button').click();
      cy.wait(100);
      cy.get('#excl-1-content').should('not.be.visible'); // Closed!
      cy.get('#excl-2-content').should('be.visible');
      cy.get('#excl-1-button').should('have.attr', 'aria-expanded', 'false');
      cy.get('#excl-2-button').should('have.attr', 'aria-expanded', 'true');

      // Open third item - second should close
      cy.get('#excl-3-button').click();
      cy.wait(100);
      cy.get('#excl-1-content').should('not.be.visible');
      cy.get('#excl-2-content').should('not.be.visible'); // Closed!
      cy.get('#excl-3-content').should('be.visible');
      cy.get('#excl-1-button').should('have.attr', 'aria-expanded', 'false');
      cy.get('#excl-2-button').should('have.attr', 'aria-expanded', 'false');
      cy.get('#excl-3-button').should('have.attr', 'aria-expanded', 'true');
    });

    it('should handle dynamic switching between multiselectable modes', () => {
      cy.mount(`
        <usa-accordion id="dynamic-test"></usa-accordion>
      `);

      const accordion = cy.get('#dynamic-test');

      accordion.then(($accordion) => {
        const acc = $accordion[0] as any;
        acc.items = [
          { id: 'dyn-1', title: 'Item 1', content: '<p>Content 1</p>', expanded: false },
          { id: 'dyn-2', title: 'Item 2', content: '<p>Content 2</p>', expanded: false },
        ];
      });

      cy.wait(200);

      // Start in exclusive mode
      cy.get('.usa-accordion').should('not.have.attr', 'data-allow-multiple');

      // Open first item
      cy.get('#dyn-1-button').click();
      cy.wait(100);
      cy.get('#dyn-1-button').should('have.attr', 'aria-expanded', 'true');

      // Open second item - first closes in exclusive mode
      cy.get('#dyn-2-button').click();
      cy.wait(100);
      cy.get('#dyn-1-button').should('have.attr', 'aria-expanded', 'false');
      cy.get('#dyn-2-button').should('have.attr', 'aria-expanded', 'true');

      // Switch to multiselectable mode
      accordion.then(($accordion) => {
        const acc = $accordion[0] as any;
        acc.multiselectable = true;
      });

      cy.wait(100);

      // Verify attribute changed
      cy.get('.usa-accordion').should('have.attr', 'data-allow-multiple');

      // Open first item - second should stay open now
      cy.get('#dyn-1-button').click();
      cy.wait(100);
      cy.get('#dyn-1-button').should('have.attr', 'aria-expanded', 'true');
      cy.get('#dyn-2-button').should('have.attr', 'aria-expanded', 'true'); // Still open!
    });
  });

  describe('USWDS Initialization Timing', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-accordion id="init-test"></usa-accordion>
      `);

      cy.get('#init-test').then(($accordion) => {
        const accordion = $accordion[0] as any;
        accordion.items = [
          {
            id: 'init-1',
            title: 'Initialization Test',
            content: '<p>Testing initialization timing</p>',
            expanded: false,
          },
        ];
      });

      // Wait for initialization
      cy.wait(200);

      // Button should exist and be clickable
      cy.get('.usa-accordion__button').should('exist');
      cy.get('.usa-accordion__button').should('be.visible');

      // Click should work immediately
      cy.get('.usa-accordion__button').click();
      cy.get('.usa-accordion__content').should('be.visible');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-accordion id="handler-test"></usa-accordion>
      `);

      const accordion = cy.get('#handler-test');

      accordion.then(($accordion) => {
        const acc = $accordion[0] as any;
        acc.items = [
          { id: 'handler-1', title: 'Handler Test', content: '<p>Content</p>', expanded: false },
        ];
      });

      cy.wait(200);

      // Rapidly change properties (could trigger setupEventHandlers multiple times)
      accordion.then(($accordion) => {
        const acc = $accordion[0] as any;
        acc.bordered = true;
        acc.multiselectable = true;
        acc.bordered = false;
        acc.multiselectable = false;
      });

      cy.wait(100);

      // Component should still work correctly (no duplicate handlers)
      cy.get('.usa-accordion__button').click();
      cy.wait(50);
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'true');

      cy.get('.usa-accordion__button').click();
      cy.wait(50);
      cy.get('.usa-accordion__button').should('have.attr', 'aria-expanded', 'false');
    });
  });
});
