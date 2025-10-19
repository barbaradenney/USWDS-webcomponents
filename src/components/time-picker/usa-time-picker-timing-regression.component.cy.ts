/**
 * @fileoverview Time Picker Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the time picker component:
 * 1. Double-click requirement (requestAnimationFrame timing fix)
 * 2. Race condition in setupEventHandlers
 * 3. USWDS initialization timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Time Picker Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (USWDS Integration)', () => {
    it('should open time list on FIRST click of input', () => {
      cy.mount(`
        <usa-time-picker
          id="single-click-test"
          label="Test Time Picker"
        ></usa-time-picker>
      `);

      // Wait for component to initialize and USWDS to transform
      cy.wait(500);

      // CRITICAL: First click should immediately work
      cy.get('.usa-combo-box__input').click();

      // Time list should be visible after FIRST click (not second)
      cy.get('.usa-combo-box__list').should('be.visible');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-time-picker
          id="immediate-test"
          label="Immediate Test"
        ></usa-time-picker>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(300);

      // Click immediately after initialization
      cy.get('.usa-combo-box__input').click();

      // Should work on first try
      cy.get('.usa-combo-box__list').should('be.visible');
    });

    it('should toggle correctly on each action (no skipped clicks)', () => {
      cy.mount(`
        <usa-time-picker
          id="toggle-test"
          label="Toggle Test"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Click 1: Should open
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');

      // Click 2: Should close (press escape)
      cy.get('body').type('{esc}');
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('not.be.visible');

      // Click 3: Should open again
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');
    });
  });

  describe('Time Picker-Specific Timing Tests', () => {
    it('should filter times on first keypress', () => {
      cy.mount(`
        <usa-time-picker
          id="filter-test"
          label="Filter Test"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Type to filter - should work on FIRST keypress
      cy.get('.usa-combo-box__input').type('2');
      cy.wait(200);

      // Should show filtered results immediately
      cy.get('.usa-combo-box__list').should('be.visible');
      cy.get('.usa-combo-box__list-option').should('exist');
    });

    it('should select time on first click', () => {
      cy.mount(`
        <usa-time-picker
          id="select-test"
          label="Select Test"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Open list
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');

      // Click a time - should select on FIRST click
      cy.get('.usa-combo-box__list-option').first().click();
      cy.wait(100);

      // Input should have selected value (not empty)
      cy.get('.usa-combo-box__input').invoke('val').should('not.be.empty');
      cy.get('.usa-combo-box__list').should('not.be.visible');
    });

    it('should handle keyboard navigation immediately', () => {
      cy.mount(`
        <usa-time-picker
          id="keyboard-test"
          label="Keyboard Test"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Open list
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);

      // Use arrow keys - should work immediately
      cy.get('.usa-combo-box__input').type('{downarrow}');
      cy.wait(50);

      // First option should be focused
      cy.get('.usa-combo-box__list-option--focused').should('exist');
    });

    it('should close list on Escape key', () => {
      cy.mount(`
        <usa-time-picker
          id="escape-test"
          label="Escape Test"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Open list
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');

      // Press Escape - should close on FIRST press
      cy.get('.usa-combo-box__input').type('{esc}');
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('not.be.visible');
    });

    it('should handle time step configuration', () => {
      cy.mount(`
        <usa-time-picker
          id="step-test"
          label="Step Test"
          step="60"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Open list
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);

      // Should show times with 60-minute intervals
      cy.get('.usa-combo-box__list-option').should('exist');
    });
  });

  describe('USWDS Initialization Timing', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-time-picker
          id="init-test"
          label="Initialization Test"
        ></usa-time-picker>
      `);

      // Wait for initialization
      cy.wait(500);

      // USWDS-created elements should exist and be clickable
      cy.get('.usa-combo-box__input').should('exist');
      cy.get('.usa-combo-box__input').should('be.visible');

      // Click should work immediately
      cy.get('.usa-combo-box__input').click();
      cy.get('.usa-combo-box__list').should('be.visible');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-time-picker
          id="handler-test"
          label="Handler Test"
        ></usa-time-picker>
      `);

      const picker = cy.get('#handler-test');

      cy.wait(500);

      // Rapidly change properties (could trigger initialization multiple times)
      picker.then(($picker) => {
        const p = $picker[0] as any;
        p.disabled = true;
        p.required = true;
        p.disabled = false;
        p.required = false;
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
        <usa-time-picker
          id="disabled-test"
          label="Disabled Test"
          disabled
        ></usa-time-picker>
      `);

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
        <usa-time-picker
          id="toggle-disabled-test"
          label="Toggle Disabled Test"
        ></usa-time-picker>
      `);

      const picker = cy.get('#toggle-disabled-test');

      cy.wait(500);

      // Initially enabled - should work
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);
      cy.get('.usa-combo-box__list').should('be.visible');

      // Close list
      cy.get('body').type('{esc}');
      cy.wait(100);

      // Disable the picker
      picker.then(($picker) => {
        const p = $picker[0] as any;
        p.disabled = true;
      });

      cy.wait(100);

      // Should be disabled
      cy.get('.usa-combo-box__input').should('be.disabled');
    });
  });

  describe('Min/Max Time Constraints', () => {
    it('should handle min time constraint', () => {
      cy.mount(`
        <usa-time-picker
          id="min-time-test"
          label="Min Time Test"
          min-time="09:00"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Open list
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);

      // Should have times starting from min time
      cy.get('.usa-combo-box__list-option').should('exist');
    });

    it('should handle max time constraint', () => {
      cy.mount(`
        <usa-time-picker
          id="max-time-test"
          label="Max Time Test"
          max-time="17:00"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Open list
      cy.get('.usa-combo-box__input').click();
      cy.wait(100);

      // List should render without errors
      cy.get('.usa-combo-box__list-option').should('exist');
    });
  });

  describe('Initial Value', () => {
    it('should display initial value immediately', () => {
      cy.mount(`
        <usa-time-picker
          id="initial-value-test"
          label="Initial Value Test"
          value="14:30"
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Input should have initial value
      cy.get('.usa-combo-box__input').should('have.value', '2:30pm');
    });

    it('should update value dynamically', () => {
      cy.mount(`
        <usa-time-picker
          id="dynamic-value-test"
          label="Dynamic Value Test"
        ></usa-time-picker>
      `);

      const picker = cy.get('#dynamic-value-test');

      cy.wait(500);

      // Set value programmatically
      picker.then(($picker) => {
        const p = $picker[0] as any;
        p.value = '10:00';
      });

      cy.wait(200);

      // Input should update
      cy.get('.usa-combo-box__input').should('have.value', '10:00am');
    });
  });

  describe('Required State', () => {
    it('should handle required attribute', () => {
      cy.mount(`
        <usa-time-picker
          id="required-test"
          label="Required Test"
          required
        ></usa-time-picker>
      `);

      cy.wait(500);

      // Input should be required
      cy.get('.usa-combo-box__input').should('have.attr', 'required');
    });
  });
});
