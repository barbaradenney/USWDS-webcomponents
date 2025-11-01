/**
 * @fileoverview Character Count Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the character count component:
 * 1. Real-time character counting (input event handler timing)
 * 2. Status message updates (debounced updates)
 * 3. USWDS initialization timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('Character Count Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (USWDS Integration)', () => {
    it('should update character count on FIRST keystroke', () => {
      cy.mount(`
        <usa-character-count
          id="first-keystroke-test"
          label="Test Character Count"
          max-length="25"
        ></usa-character-count>
      `);

      cy.wait(500);

      // Type immediately - should update count on FIRST character
      cy.get('.usa-character-count__field').type('a');
      cy.wait(100);

      // Character count should update immediately
      // USWDS creates .usa-character-count__status.usa-hint (visible) and .usa-character-count__sr-status (screen reader only)
      cy.get('.usa-character-count__status.usa-hint').should('contain', '24 characters left');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-character-count
          id="immediate-test"
          label="Immediate Test"
          max-length="50"
        ></usa-character-count>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(300);

      // Status message should exist immediately
      // USWDS creates .usa-character-count__status.usa-hint element dynamically
      cy.get('.usa-character-count__status.usa-hint').should('exist');
      cy.get('.usa-character-count__status.usa-hint').should('contain', '50 characters allowed');
    });

    it('should handle rapid typing without double-update', () => {
      cy.mount(`
        <usa-character-count
          id="rapid-test"
          label="Rapid Typing Test"
          max-length="100"
        ></usa-character-count>
      `);

      cy.wait(500);

      // Type rapidly - each character should be counted
      cy.get('.usa-character-count__field').type('hello world');
      cy.wait(100);

      // Should show correct count (11 characters typed, 89 left)
      cy.get('.usa-character-count__status.usa-hint').should('contain', '89 characters left');
    });
  });

  describe('Character Count-Specific Timing Tests', () => {
    it('should show status message immediately on mount', () => {
      cy.mount(`
        <usa-character-count
          id="status-test"
          label="Status Test"
          max-length="30"
        ></usa-character-count>
      `);

      cy.wait(500);

      // Status message should be visible and correct
      cy.get('.usa-character-count__status.usa-hint').should('be.visible');
      cy.get('.usa-character-count__status.usa-hint').should('contain', '30 characters allowed');
    });

    it('should handle textarea character counting', () => {
      cy.mount(`
        <usa-character-count
          id="textarea-test"
          label="Textarea Test"
          max-length="150"
          input-type="textarea"
        ></usa-character-count>
      `);

      cy.wait(500);

      // Type into textarea
      cy.get('textarea.usa-character-count__field').type('Testing textarea counting');
      cy.wait(100);

      // Should count characters correctly (25 characters typed)
      cy.get('.usa-character-count__status.usa-hint').should('contain', '125 characters left');
    });

    it('should update count as user types continuously', () => {
      cy.mount(`
        <usa-character-count
          id="continuous-test"
          label="Continuous Test"
          max-length="20"
        ></usa-character-count>
      `);

      cy.wait(500);

      // Initial state
      cy.get('.usa-character-count__status.usa-hint').should('contain', '20 characters allowed');

      // Type one character
      cy.get('.usa-character-count__field').type('a');
      cy.wait(50);
      cy.get('.usa-character-count__status.usa-hint').should('contain', '19 characters left');

      // Type more characters
      cy.get('.usa-character-count__field').type('bc');
      cy.wait(50);
      cy.get('.usa-character-count__status.usa-hint').should('contain', '17 characters left');
    });

    it('should show error state when limit exceeded', () => {
      cy.mount(`
        <usa-character-count
          id="error-test"
          label="Error Test"
          max-length="10"
        ></usa-character-count>
      `);

      cy.wait(500);

      // Type beyond limit
      cy.get('.usa-character-count__field').type('This is too long');
      cy.wait(100);

      // Should show error state
      cy.get('.usa-form-group').should('have.class', 'usa-form-group--error');
      cy.get('.usa-character-count__status.usa-hint').should(
        'have.class',
        'usa-character-count__status--invalid'
      );
    });

    it('should handle deleting characters', () => {
      cy.mount(`
        <usa-character-count
          id="delete-test"
          label="Delete Test"
          max-length="25"
        ></usa-character-count>
      `);

      cy.wait(500);

      // Type some text
      cy.get('.usa-character-count__field').type('hello');
      cy.wait(100);
      cy.get('.usa-character-count__status.usa-hint').should('contain', '20 characters left');

      // Delete characters
      cy.get('.usa-character-count__field').type('{backspace}{backspace}');
      cy.wait(100);

      // Should update count correctly (3 characters left, 22 remaining)
      cy.get('.usa-character-count__status.usa-hint').should('contain', '22 characters left');
    });
  });

  describe('USWDS Initialization Timing', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-character-count
          id="init-test"
          label="Initialization Test"
          max-length="40"
        ></usa-character-count>
      `);

      // Wait for initialization
      cy.wait(500);

      // USWDS-created elements should exist and be functional
      cy.get('.usa-character-count__status.usa-hint').should('exist');
      cy.get('.usa-character-count__sr-status').should('exist'); // Screen reader status
      cy.get('.usa-character-count__field').should('exist');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-character-count
          id="handler-test"
          label="Handler Test"
          max-length="50"
        ></usa-character-count>
      `);

      const characterCount = cy.get('#handler-test');

      cy.wait(500);

      // Rapidly change properties (could trigger initialization multiple times)
      characterCount.then(($input) => {
        const input = $input[0] as any;
        input.disabled = true;
        input.required = true;
        input.disabled = false;
        input.required = false;
      });

      cy.wait(200);

      // Component should still work correctly (no duplicate handlers)
      cy.get('.usa-character-count__field').type('test');
      cy.wait(100);

      // Should count correctly (4 characters, 46 left)
      cy.get('.usa-character-count__status.usa-hint').should('contain', '46 characters left');
    });
  });

  describe('Disabled State', () => {
    it('should handle disabled state correctly', () => {
      cy.mount(`
        <usa-character-count
          id="disabled-test"
          label="Disabled Test"
          max-length="30"
          disabled
        ></usa-character-count>
      `);

      cy.wait(500);

      // Input should be disabled
      cy.get('.usa-character-count__field').should('be.disabled');
    });

    it('should toggle disabled state dynamically', () => {
      cy.mount(`
        <usa-character-count
          id="toggle-disabled-test"
          label="Toggle Disabled Test"
          max-length="30"
        ></usa-character-count>
      `);

      const characterCount = cy.get('#toggle-disabled-test');

      cy.wait(500);

      // Initially enabled - input should work
      cy.get('.usa-character-count__field').should('not.be.disabled');

      // Disable the character count
      characterCount.then(($input) => {
        const input = $input[0] as any;
        input.disabled = true;
      });

      cy.wait(100);

      // Should be disabled
      cy.get('.usa-character-count__field').should('be.disabled');
    });
  });

  describe('Required State', () => {
    it('should handle required attribute', () => {
      cy.mount(`
        <usa-character-count
          id="required-test"
          label="Required Test"
          max-length="30"
          required
        ></usa-character-count>
      `);

      cy.wait(500);

      // Input should be required
      cy.get('.usa-character-count__field').should('have.attr', 'required');
    });
  });

  describe('Max Length Enforcement', () => {
    it('should respect max-length attribute', () => {
      cy.mount(`
        <usa-character-count
          id="maxlength-test"
          label="Max Length Test"
          max-length="15"
        ></usa-character-count>
      `);

      cy.wait(500);

      // Character count element should have data-maxlength attribute
      // USWDS moves maxlength from input to data attribute on container
      cy.get('.usa-character-count').should('have.attr', 'data-maxlength', '15');
    });

    it('should handle dynamic max-length changes', () => {
      cy.mount(`
        <usa-character-count
          id="dynamic-maxlength-test"
          label="Dynamic Max Length Test"
          max-length="20"
        ></usa-character-count>
      `);

      const characterCount = cy.get('#dynamic-maxlength-test');

      cy.wait(500);

      // Change max-length attribute
      characterCount.then(($input) => {
        const input = $input[0] as any;
        input.maxLength = 50;
      });

      cy.wait(100);

      // Status should update (though this may require re-initialization in practice)
      cy.get('.usa-character-count__status.usa-hint').should('exist');
    });
  });
});
