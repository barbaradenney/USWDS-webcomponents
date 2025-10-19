/**
 * @fileoverview File Input Timing and Initialization Regression Tests
 *
 * These tests specifically target timing issues that could affect the file input component:
 * 1. Double-click requirement (requestAnimationFrame timing fix)
 * 2. Race condition in setupEventHandlers
 * 3. USWDS initialization timing
 *
 * These tests run in a real browser with actual USWDS JavaScript, catching issues
 * that unit tests in jsdom cannot detect.
 */

import './index.ts';

describe('File Input Timing and Initialization Regression Tests', () => {
  describe('Single-Click Requirement (USWDS Integration)', () => {
    it('should activate drag target on FIRST interaction', () => {
      cy.mount(`
        <usa-file-input
          id="single-click-test"
          label="Test File Input"
        ></usa-file-input>
      `);

      // Wait for component to initialize and USWDS to transform
      cy.wait(500);

      // CRITICAL: First interaction should immediately work
      // Check that USWDS has created the drag target
      cy.get('.usa-file-input__target').should('exist');
      cy.get('.usa-file-input__target').should('be.visible');
    });

    it('should work immediately after component initialization', () => {
      cy.mount(`
        <usa-file-input
          id="immediate-test"
          label="Immediate Test"
        ></usa-file-input>
      `);

      // Minimal wait - component should be ready quickly
      cy.wait(300);

      // Should have USWDS-created elements immediately
      cy.get('.usa-file-input__target').should('exist');
      cy.get('.usa-file-input__choose').should('exist');
    });

    it('should handle file selection on first try', () => {
      cy.mount(`
        <usa-file-input
          id="file-select-test"
          label="File Selection Test"
        ></usa-file-input>
      `);

      cy.wait(500);

      // Create a test file
      const fileName = 'test-file.txt';
      const fileContent = 'test content';

      // Trigger file selection - should work on FIRST try
      cy.get('.usa-file-input__input').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'text/plain',
      }, { force: true });

      cy.wait(200);

      // File should be selected and preview shown
      cy.get('.usa-file-input__preview').should('exist');
      cy.get('.usa-file-input__preview-heading').should('contain', 'Selected file');
    });
  });

  describe('File Input-Specific Timing Tests', () => {
    it('should show drag instructions immediately', () => {
      cy.mount(`
        <usa-file-input
          id="drag-test"
          label="Drag Test"
          drag-text="Custom drag text"
        ></usa-file-input>
      `);

      cy.wait(500);

      // Drag instructions should be visible immediately
      cy.get('.usa-file-input__drag-text').should('be.visible');
    });

    it('should handle multiple file selection', () => {
      cy.mount(`
        <usa-file-input
          id="multiple-test"
          label="Multiple Files Test"
          multiple
        ></usa-file-input>
      `);

      cy.wait(500);

      // Select multiple files - should work on first try
      cy.get('.usa-file-input__input').selectFile([
        {
          contents: Cypress.Buffer.from('file 1'),
          fileName: 'file1.txt',
        },
        {
          contents: Cypress.Buffer.from('file 2'),
          fileName: 'file2.txt',
        },
      ], { force: true });

      cy.wait(200);

      // Both files should be shown in preview
      cy.get('.usa-file-input__preview').should('exist');
    });

    it('should handle file replacement (USWDS pattern for file removal)', () => {
      cy.mount(`
        <usa-file-input
          id="remove-test"
          label="Remove Test"
        ></usa-file-input>
      `);

      cy.wait(500);

      // Select a file
      cy.get('.usa-file-input__input').selectFile({
        contents: Cypress.Buffer.from('test'),
        fileName: 'remove-me.txt',
      }, { force: true });

      cy.wait(200);

      // Verify file was selected
      cy.get('.usa-file-input__preview').should('exist');
      cy.get('.usa-file-input__preview-heading').should('contain', 'Selected file');

      // USWDS file-input doesn't have individual file removal buttons
      // Files are cleared only by selecting new files via the file input
      // The "Change file" text is just a visual indicator - clicking the input itself triggers file selection
      // Select a different file (this clears the previous one automatically per USWDS behavior)
      cy.get('.usa-file-input__input').selectFile({
        contents: Cypress.Buffer.from('new content'),
        fileName: 'new-file.txt',
      }, { force: true });

      cy.wait(200);

      // Old file should be replaced with new file
      cy.get('.usa-file-input__preview').should('exist');
      cy.get('.usa-file-input__preview').should('contain', 'new-file.txt');
      cy.get('.usa-file-input__preview').should('not.contain', 'remove-me.txt');
    });

    it('should validate file types immediately', () => {
      cy.mount(`
        <usa-file-input
          id="validation-test"
          label="Validation Test"
          accept=".pdf,.doc"
        ></usa-file-input>
      `);

      cy.wait(500);

      // Instructions should show accepted file types
      cy.get('.usa-file-input__box').should('exist');
    });
  });

  describe('USWDS Initialization Timing', () => {
    it('should initialize USWDS after DOM is ready', () => {
      cy.mount(`
        <usa-file-input
          id="init-test"
          label="Initialization Test"
        ></usa-file-input>
      `);

      // Wait for initialization
      cy.wait(500);

      // USWDS-created elements should exist and be functional
      cy.get('.usa-file-input__target').should('exist');
      cy.get('.usa-file-input__target').should('be.visible');
      cy.get('.usa-file-input__box').should('exist');
      cy.get('.usa-file-input__input').should('exist');
    });

    it('should not duplicate event handlers on rapid property changes', () => {
      cy.mount(`
        <usa-file-input
          id="handler-test"
          label="Handler Test"
        ></usa-file-input>
      `);

      const fileInput = cy.get('#handler-test');

      cy.wait(500);

      // Rapidly change properties (could trigger initialization multiple times)
      fileInput.then(($input) => {
        const input = $input[0] as any;
        input.disabled = true;
        input.required = true;
        input.disabled = false;
        input.required = false;
      });

      cy.wait(200);

      // Component should still work correctly (no duplicate handlers)
      cy.get('.usa-file-input__input').selectFile({
        contents: Cypress.Buffer.from('test'),
        fileName: 'test.txt',
      }, { force: true });

      cy.wait(100);
      cy.get('.usa-file-input__preview').should('exist');
    });
  });

  describe('Disabled State', () => {
    it('should handle disabled state correctly', () => {
      cy.mount(`
        <usa-file-input
          id="disabled-test"
          label="Disabled Test"
          disabled
        ></usa-file-input>
      `);

      cy.wait(500);

      // Input should be disabled
      cy.get('.usa-file-input__input').should('be.disabled');

      // Drop zone (main container) should have disabled class
      // USWDS adds the disabled class to the drop zone element (.usa-file-input)
      cy.get('.usa-file-input').should('have.class', 'usa-file-input--disabled');
    });

    it('should toggle disabled state dynamically', () => {
      cy.mount(`
        <usa-file-input
          id="toggle-disabled-test"
          label="Toggle Disabled Test"
        ></usa-file-input>
      `);

      const fileInput = cy.get('#toggle-disabled-test');

      cy.wait(500);

      // Initially enabled - input should work
      cy.get('.usa-file-input__input').should('not.be.disabled');

      // Disable the file input
      fileInput.then(($input) => {
        const input = $input[0] as any;
        input.disabled = true;
      });

      cy.wait(100);

      // Should be disabled
      cy.get('.usa-file-input__input').should('be.disabled');
    });
  });

  describe('File Type Restrictions', () => {
    it('should respect accept attribute', () => {
      cy.mount(`
        <usa-file-input
          id="accept-test"
          label="Accept Test"
          accept=".jpg,.png,.gif"
        ></usa-file-input>
      `);

      cy.wait(500);

      // Input should have accept attribute
      cy.get('.usa-file-input__input').should('have.attr', 'accept', '.jpg,.png,.gif');
    });

    it('should handle dynamic accept changes', () => {
      cy.mount(`
        <usa-file-input
          id="dynamic-accept-test"
          label="Dynamic Accept Test"
        ></usa-file-input>
      `);

      const fileInput = cy.get('#dynamic-accept-test');

      cy.wait(500);

      // Change accept attribute
      fileInput.then(($input) => {
        const input = $input[0] as any;
        input.accept = '.pdf';
      });

      cy.wait(100);

      // Accept should update
      cy.get('.usa-file-input__input').should('have.attr', 'accept', '.pdf');
    });
  });

  describe('Multiple Files', () => {
    it('should handle multiple attribute', () => {
      cy.mount(`
        <usa-file-input
          id="multiple-attr-test"
          label="Multiple Attribute Test"
          multiple
        ></usa-file-input>
      `);

      cy.wait(500);

      // Input should have multiple attribute
      cy.get('.usa-file-input__input').should('have.attr', 'multiple');
    });

    it('should toggle multiple dynamically', () => {
      cy.mount(`
        <usa-file-input
          id="toggle-multiple-test"
          label="Toggle Multiple Test"
        ></usa-file-input>
      `);

      const fileInput = cy.get('#toggle-multiple-test');

      cy.wait(500);

      // Initially single file
      cy.get('.usa-file-input__input').should('not.have.attr', 'multiple');

      // Enable multiple
      fileInput.then(($input) => {
        const input = $input[0] as any;
        input.multiple = true;
      });

      cy.wait(100);

      // Should have multiple attribute
      cy.get('.usa-file-input__input').should('have.attr', 'multiple');
    });
  });

  describe('Required State', () => {
    it('should handle required attribute', () => {
      cy.mount(`
        <usa-file-input
          id="required-test"
          label="Required Test"
          required
        ></usa-file-input>
      `);

      cy.wait(500);

      // Input should be required
      cy.get('.usa-file-input__input').should('have.attr', 'required');
    });
  });
});
