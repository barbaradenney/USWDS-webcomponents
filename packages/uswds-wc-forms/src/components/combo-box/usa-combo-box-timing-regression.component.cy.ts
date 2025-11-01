/**
 * @fileoverview Combo Box Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the combo box component:
 * 1. Double-click requirement (requestAnimationFrame timing fix)
 * 2. Race condition in setupEventHandlers
 * 3. USWDS initialization timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Combo Box Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (USWDS Integration)', () => {
    it('should open dropdown on FIRST click of combo box input', () => {
      cy.mount(`
        <usa-combo-box
          id="single-click-test"
          label="Test Combo Box"
        ></usa-combo-box>
      `);

      cy.get('#single-click-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
          { value: '3', label: 'Option 3' },
        ];
      });

      // Wait for component to initialize and USWDS to transform
      cy.wait(500);

      // CRITICAL: First click should immediately work
      cy.get('.usa-combo-box__input').click();

      // Dropdown should be visible after FIRST click (not second)
      cy.get('.usa-combo-box__list').should('be.visible');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-combo-box
          id="immediate-test"
          label="Immediate Test"
        ></usa-combo-box>
      `);

      cy.get('#immediate-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ];
      });

      // Minimal wait - component should be ready quickly
      cy.wait(300);

      // Click immediately after initialization
      cy.get('.usa-combo-box__input').click();

      // Should work on first try
      cy.get('.usa-combo-box__list').should('be.visible');
    });

    it('should toggle correctly on each click (no skipped clicks)', () => {
      cy.mount(`
        <usa-combo-box
          id="toggle-test"
          label="Toggle Test"
        ></usa-combo-box>
      `);

      cy.get('#toggle-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ];
      });

      cy.wait(500);

      // Click 1: Should open
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');

      // Click 2: Should close (click outside or press escape)
      cy.get('body').type('{esc}');
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('not.be.visible');

      // Click 3: Should open again
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');
    });
  });

  describe('Combo Box-Specific Timing Tests', () => {
    it('should filter options on first keypress', () => {
      cy.mount(`
        <usa-combo-box
          id="filter-test"
          label="Filter Test"
        ></usa-combo-box>
      `);

      cy.get('#filter-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'apricot', label: 'Apricot' },
        ];
      });

      cy.wait(500);

      // Type to filter - should work on FIRST keypress
      cy.get('.usa-combo-box__input').type('ap');
      cy.wait(200);

      // Should show filtered results immediately
      cy.get('.usa-combo-box__list').should('be.visible');
      cy.get('.usa-combo-box__list-option').should('have.length', 2); // Apple and Apricot
    });

    it('should select option on first click', () => {
      cy.mount(`
        <usa-combo-box
          id="select-test"
          label="Select Test"
        ></usa-combo-box>
      `);

      cy.get('#select-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [
          { value: 'opt1', label: 'Option 1' },
          { value: 'opt2', label: 'Option 2' },
        ];
      });

      cy.wait(500);

      // Open dropdown
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');

      // Click option - should select on FIRST click
      cy.get('.usa-combo-box__list-option').first().click();
      cy.wait(100);

      // Input should have selected value
      cy.get('.usa-combo-box__input').should('have.value', 'Option 1');
      cy.get('.usa-combo-box__list').should('not.be.visible');
    });

    it('should handle keyboard navigation immediately', () => {
      cy.mount(`
        <usa-combo-box
          id="keyboard-test"
          label="Keyboard Test"
        ></usa-combo-box>
      `);

      cy.get('#keyboard-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
          { value: '3', label: 'Option 3' },
        ];
      });

      cy.wait(500);

      // Open dropdown
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);

      // Use arrow keys - should work immediately
      cy.get('.usa-combo-box__input').type('{downarrow}');
      cy.wait(50);

      // First option should be focused
      cy.get('.usa-combo-box__list-option--focused').should('exist');
    });

    it('should close dropdown on Escape key', () => {
      cy.mount(`
        <usa-combo-box
          id="escape-test"
          label="Escape Test"
        ></usa-combo-box>
      `);

      cy.get('#escape-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [{ value: '1', label: 'Option 1' }];
      });

      cy.wait(500);

      // Open dropdown
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');

      // Press Escape - should close on FIRST press
      cy.get('.usa-combo-box__input').type('{esc}');
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('not.be.visible');
    });
  });

  describe('USWDS Initialization Timing', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-combo-box
          id="init-test"
          label="Initialization Test"
        ></usa-combo-box>
      `);

      cy.get('#init-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [{ value: '1', label: 'Option 1' }];
      });

      // Wait for initialization
      cy.wait(500);

      // USWDS-created input should exist and be clickable
      cy.get('.usa-combo-box__input').should('exist');
      cy.get('.usa-combo-box__input').should('be.visible');

      // Click should work immediately
      cy.get('.usa-combo-box__input').click();
      cy.get('.usa-combo-box__list').should('be.visible');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-combo-box
          id="handler-test"
          label="Handler Test"
        ></usa-combo-box>
      `);

      const combo = cy.get('#handler-test');

      combo.then(($combo) => {
        const c = $combo[0] as any;
        c.options = [{ value: '1', label: 'Option 1' }];
      });

      cy.wait(500);

      // Rapidly change properties (could trigger initialization multiple times)
      combo.then(($combo) => {
        const c = $combo[0] as any;
        c.disabled = true;
        c.required = true;
        c.disabled = false;
        c.required = false;
      });

      cy.wait(200);

      // Component should still work correctly (no duplicate handlers)
      cy.get('.usa-combo-box__input').click();
      cy.wait(50);
      cy.get('.usa-combo-box__list').should('be.visible');

      cy.get('body').type('{esc}');
      cy.wait(50);
      cy.get('.usa-combo-box__list').should('not.be.visible');
    });
  });

  describe('Disabled State', () => {
    it('should handle disabled state correctly', () => {
      cy.mount(`
        <usa-combo-box
          id="disabled-test"
          label="Disabled Test"
          disabled
        ></usa-combo-box>
      `);

      cy.get('#disabled-test').then(($combo) => {
        const combo = $combo[0] as any;
        combo.options = [{ value: '1', label: 'Option 1' }];
      });

      cy.wait(500);

      // Input should be disabled
      cy.get('.usa-combo-box__input').should('be.disabled');

      // Should not open on click
      cy.get('.usa-combo-box__input').click({ force: true });
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('not.be.visible');
    });

    it('should toggle disabled state dynamically', () => {
      cy.mount(`
        <usa-combo-box
          id="toggle-disabled-test"
          label="Toggle Disabled Test"
        ></usa-combo-box>
      `);

      const combo = cy.get('#toggle-disabled-test');

      combo.then(($combo) => {
        const c = $combo[0] as any;
        c.options = [{ value: '1', label: 'Option 1' }];
      });

      cy.wait(500);

      // Initially enabled - should work
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');

      // Close dropdown
      cy.get('body').type('{esc}');
      cy.wait(100);

      // Disable the combo box
      combo.then(($combo) => {
        const c = $combo[0] as any;
        c.disabled = true;
      });

      cy.wait(100);

      // Should be disabled
      cy.get('.usa-combo-box__input').should('be.disabled');
    });
  });

  describe('Dynamic Options', () => {
    it('should handle option updates immediately', () => {
      cy.mount(`
        <usa-combo-box
          id="dynamic-options-test"
          label="Dynamic Options Test"
        ></usa-combo-box>
      `);

      const combo = cy.get('#dynamic-options-test');

      combo.then(($combo) => {
        const c = $combo[0] as any;
        c.options = [{ value: '1', label: 'Option 1' }];
      });

      cy.wait(500);

      // Open and verify initial options
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list-option').should('have.length', 1);

      // Close dropdown
      cy.get('body').type('{esc}');
      cy.wait(100);

      // Update options
      combo.then(($combo) => {
        const c = $combo[0] as any;
        c.options = [
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
          { value: '3', label: 'Option 3' },
        ];
      });

      cy.wait(500);

      // Open and verify updated options
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list-option').should('have.length', 3);
    });
  });
});
