// Component tests for usa-file-input
import './index.ts';

describe('USA File Input Component Tests', () => {
  it('should render file input with default properties', () => {
    cy.mount(`<usa-file-input id="test-file-input"></usa-file-input>`);
    cy.get('usa-file-input').should('exist');
    cy.get('usa-file-input input[type="file"]').should('have.class', 'usa-file-input__input');
    cy.get('.usa-file-input__target').should('exist');
  });

  it('should handle single file selection', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="single-file"
        accept=".pdf,.doc,.docx">
      </usa-file-input>
    `);

    // Create a test file
  });

  it('should handle multiple file selection', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="multiple-files"
        multiple
        accept=".jpg,.png,.gif">
      </usa-file-input>
    `);

    cy.get('input[type="file"]').should('have.attr', 'multiple');
  });

  it('should emit change events', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="change-test">
      </usa-file-input>
    `);

    cy.window().then((win) => {
      const fileInput = win.document.getElementById('test-file-input') as any;
      const changeSpy = cy.stub();
      fileInput.addEventListener('change', changeSpy);

      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('test'),
          fileName: 'test.txt',
          mimeType: 'text/plain',
        },
        { force: true }
      );

      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle disabled state', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        disabled>
      </usa-file-input>
    `);

    cy.get('input[type="file"]').should('be.disabled');
    cy.get('.usa-file-input').should('have.class', 'usa-file-input--disabled');
    cy.get('.usa-file-input__target').should('have.attr', 'aria-disabled', 'true');
  });

  it('should handle required state', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        required
        name="required-file">
      </usa-file-input>
    `);

    cy.get('input[type="file"]').should('have.attr', 'required');
    cy.get('input[type="file"]').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        error
        error-message="Please select a valid file (PDF or DOC only)">
      </usa-file-input>
    `);

    cy.get('input[type="file"]').should('have.attr', 'aria-invalid', 'true');
    cy.get('.usa-file-input').should('have.class', 'usa-file-input--error');
    cy.get('.usa-error-message').should('contain.text', 'Please select a valid file');
  });

  it('should handle file type restrictions', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        accept=".pdf,.doc,.docx"
        name="document-upload">
      </usa-file-input>
    `);

    cy.get('input[type="file"]').should('have.attr', 'accept', '.pdf,.doc,.docx');

    // Should show accepted file types in UI
    cy.get('.usa-file-input__accepted-files-message').should('contain.text', '.pdf, .doc, .docx');
  });

  it('should handle file size validation', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        max-file-size="5242880"
        name="size-limited">
      </usa-file-input>
    `);

    // Create a large file (simulated)
    const largeFileContent = 'x'.repeat(6000000); // 6MB file

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(largeFileContent),
        fileName: 'large-file.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );

    // Should show error for file too large
    cy.get('.usa-file-input__preview-heading--error').should('contain.text', 'large-file.txt');
    cy.get('.usa-file-input__preview-heading .usa-file-input__preview-heading-error').should(
      'contain.text',
      'File is too large'
    );
  });

  it('should handle drag and drop functionality', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="drag-drop-test"
        drag-text="Drag files here or choose from folder">
      </usa-file-input>
    `);

    cy.get('.usa-file-input__drag-text').should(
      'contain.text',
      'Drag files here or choose from folder'
    );

    // Test drag events
    cy.get('.usa-file-input__target')
      .trigger('dragenter')
      .should('have.class', 'usa-file-input__target--dragged');

    cy.get('.usa-file-input__target')
      .trigger('dragleave')
      .should('not.have.class', 'usa-file-input__target--dragged');
  });

  it('should handle file removal', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="removable-files">
      </usa-file-input>
    `);

    // Add a file first
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('test content'),
        fileName: 'removable-file.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );

    cy.get('.usa-file-input__preview').should('contain.text', 'removable-file.txt');

    // Remove the file
    cy.get('.usa-file-input__preview-close').click();
    cy.get('.usa-file-input__preview').should('not.exist');
  });

  it('should be keyboard accessible', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="keyboard-accessible">
      </usa-file-input>
    `);

    // Tab to file input
    cy.get('input[type="file"]').focus();
    cy.focused().should('have.attr', 'name', 'keyboard-accessible');

    // Enter key should open file dialog (browser behavior)
    cy.focused().type('{enter}');

    // Space key should also work (browser behavior)
    cy.focused().type(' ');
  });

  it('should handle form integration', () => {
    cy.mount(`
      <form id="test-form">
        <usa-file-input 
          id="test-file-input" 
          name="uploaded-file"
          required>
        </usa-file-input>
        <button type="submit">Submit</button>
      </form>
    `);

    // Add a file
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('form test content'),
        fileName: 'form-test.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );

    cy.window().then((win) => {
      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const file = formData.get('uploaded-file') as File;
        submitSpy(file ? file.name : null);
      });

      cy.get('button[type="submit"]').click();

      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('form-test.txt');
      });
    });
  });

  it('should handle custom instructions', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        instructions="Select or drag government documents (PDF, DOC, DOCX only). Maximum file size: 10MB."
        accept=".pdf,.doc,.docx">
      </usa-file-input>
    `);

    cy.get('.usa-file-input__instructions').should(
      'contain.text',
      'Select or drag government documents'
    );
    cy.get('.usa-file-input__instructions').should('contain.text', 'Maximum file size: 10MB');
  });

  it('should handle image preview for image files', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="image-upload"
        accept="image/*"
        show-preview>
      </usa-file-input>
    `);

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake image data'),
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
      },
      { force: true }
    );

    cy.get('.usa-file-input__preview').should('contain.text', 'test-image.jpg');
    cy.get('.usa-file-input__preview-image').should('exist');
  });

  it('should handle aria attributes', () => {
    cy.mount(`
      <div>
        <label id="file-label">Document Upload</label>
        <span id="file-hint">Choose files to upload to your application</span>
        <usa-file-input 
          id="test-file-input"
          aria-labelledby="file-label"
          aria-describedby="file-hint">
        </usa-file-input>
      </div>
    `);

    cy.get('input[type="file"]')
      .should('have.attr', 'aria-labelledby', 'file-label')
      .should('have.attr', 'aria-describedby', 'file-hint');
  });

  it('should handle focus and blur events', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="focus-test">
      </usa-file-input>
    `);

    cy.window().then((win) => {
      const fileInput = win.document.getElementById('test-file-input') as any;
      const focusSpy = cy.stub();
      const blurSpy = cy.stub();
      fileInput.addEventListener('focus', focusSpy);
      fileInput.addEventListener('blur', blurSpy);

      cy.get('input[type="file"]').focus();
      cy.get('input[type="file"]').blur();

      cy.then(() => {
        expect(focusSpy).to.have.been.called;
        expect(blurSpy).to.have.been.called;
      });
    });
  });

  it('should handle validation on blur', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        required
        validate-on-blur>
      </usa-file-input>
    `);

    // Focus and blur without selecting file (should trigger validation)
    cy.get('input[type="file"]').focus().blur();
    cy.get('input[type="file"]').should('have.attr', 'aria-invalid', 'true');

    // Select file and blur (should clear validation)
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('validation test'),
        fileName: 'validation-test.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );

    cy.get('input[type="file"]').blur();
    cy.get('input[type="file"]').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should be accessible', () => {
    cy.mount(`
      <form>
        <label for="document-upload">Upload Documents</label>
        <usa-file-input 
          id="document-upload"
          name="documents"
          accept=".pdf,.doc"
          multiple
          aria-describedby="upload-hint">
        </usa-file-input>
        <div id="upload-hint">Select one or more documents to upload</div>
      </form>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        class="custom-file-input-class">
      </usa-file-input>
    `);

    cy.get('usa-file-input').should('have.class', 'custom-file-input-class');
    cy.get('.usa-file-input').should('exist');
  });

  it('should handle file validation messages', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        accept=".pdf"
        max-file-size="1048576">
      </usa-file-input>
    `);

    // Try to upload wrong file type
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('not a pdf'),
        fileName: 'document.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );

    cy.get('.usa-file-input__preview-heading--error').should('contain.text', 'document.txt');
    cy.get('.usa-file-input__preview-heading .usa-file-input__preview-heading-error').should(
      'contain.text',
      'Invalid file type'
    );
  });

  it('should handle empty file selection', () => {
    cy.mount(`
      <usa-file-input 
        id="test-file-input" 
        name="empty-test">
      </usa-file-input>
    `);

    // Add file then clear selection
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('temp'),
        fileName: 'temp.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );

    cy.get('.usa-file-input__preview').should('exist');

    // Clear file selection
    cy.get('input[type="file"]').selectFile([], { force: true });
    cy.get('.usa-file-input__preview').should('not.exist');
  });

  it('should handle progress indication during upload', () => {
    cy.mount(`
      <usa-file-input
        id="test-file-input"
        name="progress-test"
        show-progress>
      </usa-file-input>
    `);

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('upload progress test'),
        fileName: 'progress-test.pdf',
        mimeType: 'application/pdf',
      },
      { force: true }
    );

    // Should show progress indicator during processing
    cy.get('.usa-file-input__preview').should('contain.text', 'progress-test.pdf');
    cy.get('.usa-file-input__preview-progress').should('exist');
  });

  // Disabled State Robustness Testing (Critical Gap Fix)
  describe('Disabled State Protection', () => {
    it('should completely prevent file selection when disabled', () => {
      let fileChangeTriggered = false;
      let inputActivated = false;

      cy.mount(`
        <usa-file-input
          id="disabled-file-test"
          name="disabled-test"
          disabled>
        </usa-file-input>
      `);

      cy.window().then((win) => {
        const fileInput = win.document.getElementById('disabled-file-test') as any;
        const nativeInput = fileInput.querySelector('input[type="file"]') as HTMLInputElement;

        // Listen for any file change events (should not occur)
        fileInput.addEventListener('change', () => {
          fileChangeTriggered = true;
        });
        nativeInput.addEventListener('change', () => {
          fileChangeTriggered = true;
        });

        // Listen for input activation attempts
        nativeInput.addEventListener('click', () => {
          inputActivated = true;
        });
        nativeInput.addEventListener('focus', () => {
          inputActivated = true;
        });
      });

      // Attempt to select file when disabled (should be prevented)
      cy.get('input[type="file"]')
        .selectFile(
          {
            contents: Cypress.Buffer.from('disabled test'),
            fileName: 'disabled-test.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        )
        .then(() => {
          // File selection should be completely blocked
          expect(fileChangeTriggered).to.be.false;
        });

      // Click attempts should not activate input
      cy.get('.usa-file-input__target')
        .click({ force: true })
        .then(() => {
          expect(inputActivated).to.be.false;
        });

      // Input should remain disabled throughout
      cy.get('input[type="file"]').should('be.disabled');
      cy.get('.usa-file-input').should('have.class', 'usa-file-input--disabled');
    });

    it('should prevent drag-and-drop interactions when disabled', () => {
      let dragEnterTriggered = false;
      let dropTriggered = false;
      let dragStateChanged = false;

      cy.mount(`
        <usa-file-input
          id="disabled-drag-test"
          name="disabled-drag"
          disabled>
        </usa-file-input>
      `);

      cy.window().then((win) => {
        const fileInput = win.document.getElementById('disabled-drag-test') as any;
        const target = fileInput.querySelector('.usa-file-input__target') as HTMLElement;

        // Listen for drag events (should not occur when disabled)
        target.addEventListener('dragenter', () => {
          dragEnterTriggered = true;
        });
        target.addEventListener('drop', () => {
          dropTriggered = true;
        });

        // Listen for visual state changes (should not occur)
        const observer = new MutationObserver(() => {
          if (target.classList.contains('usa-file-input__target--dragged')) {
            dragStateChanged = true;
          }
        });
        observer.observe(target, { attributes: true, attributeFilter: ['class'] });
      });

      // Attempt drag events when disabled
      cy.get('.usa-file-input__target')
        .trigger('dragenter', { force: true })
        .trigger('dragover', { force: true })
        .trigger('drop', { force: true });

      cy.wait(100).then(() => {
        // All drag interactions should be prevented
        expect(dragEnterTriggered).to.be.false;
        expect(dropTriggered).to.be.false;
        expect(dragStateChanged).to.be.false;
      });

      // Target should not show drag state
      cy.get('.usa-file-input__target').should('not.have.class', 'usa-file-input__target--dragged');
    });

    it('should prevent keyboard access when disabled', () => {
      let keydownTriggered = false;
      let focusTriggered = false;
      let activationAttempted = false;

      cy.mount(`
        <usa-file-input
          id="disabled-keyboard-test"
          name="disabled-keyboard"
          disabled>
        </usa-file-input>
      `);

      cy.window().then((win) => {
        const fileInput = win.document.getElementById('disabled-keyboard-test') as any;
        const nativeInput = fileInput.querySelector('input[type="file"]') as HTMLInputElement;

        // Listen for keyboard events (should be minimal when disabled)
        nativeInput.addEventListener('keydown', () => {
          keydownTriggered = true;
        });
        nativeInput.addEventListener('focus', () => {
          focusTriggered = true;
        });

        // Listen for activation attempts
        fileInput.addEventListener('activate', () => {
          activationAttempted = true;
        });
      });

      // Attempt keyboard interactions when disabled
      cy.get('input[type="file"]').focus({ force: true });
      cy.get('input[type="file"]').type('{enter}', { force: true });
      cy.get('input[type="file"]').type(' ', { force: true });

      cy.wait(100).then(() => {
        // Focus should be prevented or ineffective
        expect(activationAttempted).to.be.false;
      });

      // Input should not be focusable when disabled
      cy.get('input[type="file"]').should('be.disabled');
      cy.get('input[type="file"]').should('have.attr', 'tabindex', '-1');
    });

    it('should maintain consistent visual disabled state', () => {
      cy.mount(`
        <usa-file-input
          id="visual-disabled-test"
          name="visual-disabled"
          disabled>
        </usa-file-input>
      `);

      // Initial disabled state verification
      cy.get('.usa-file-input').should('have.class', 'usa-file-input--disabled');
      cy.get('.usa-file-input__target').should('have.attr', 'aria-disabled', 'true');
      cy.get('input[type="file"]').should('be.disabled');

      // Attempt various interactions that might change visual state
      cy.get('.usa-file-input__target').click({ force: true });
      cy.get('.usa-file-input__target').hover();
      cy.get('.usa-file-input__target').trigger('mouseenter');
      cy.get('.usa-file-input__target').trigger('mouseleave');

      // Visual state should remain consistently disabled
      cy.get('.usa-file-input').should('have.class', 'usa-file-input--disabled');
      cy.get('.usa-file-input__target').should('have.attr', 'aria-disabled', 'true');
      cy.get('input[type="file"]').should('be.disabled');

      // Should not show hover or active states
      cy.get('.usa-file-input__target').should('not.have.class', 'usa-file-input__target--hover');
      cy.get('.usa-file-input__target').should('not.have.class', 'usa-file-input__target--active');
    });

    it('should prevent file removal when disabled', () => {
      let fileRemoved = false;
      let removeButtonClicked = false;

      // First enable and add a file
      cy.mount(`
        <usa-file-input
          id="removal-disabled-test"
          name="removal-disabled">
        </usa-file-input>
      `);

      // Add file while enabled
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('test for removal'),
          fileName: 'test-removal.txt',
          mimeType: 'text/plain',
        },
        { force: true }
      );

      cy.get('.usa-file-input__preview').should('contain.text', 'test-removal.txt');

      // Now disable the component
      cy.window().then((win) => {
        const fileInput = win.document.getElementById('removal-disabled-test') as any;
        fileInput.disabled = true;

        // Listen for removal events
        fileInput.addEventListener('file-remove', () => {
          fileRemoved = true;
        });
      });

      cy.window().then((win) => {
        const removeButton = win.document.querySelector(
          '.usa-file-input__preview-close'
        ) as HTMLButtonElement;
        if (removeButton) {
          removeButton.addEventListener('click', () => {
            removeButtonClicked = true;
          });
        }
      });

      // Attempt to remove file when disabled
      cy.get('.usa-file-input__preview-close')
        .click({ force: true })
        .then(() => {
          expect(fileRemoved).to.be.false;
        });

      // File should still be present
      cy.get('.usa-file-input__preview').should('contain.text', 'test-removal.txt');

      // Remove button should be disabled or hidden
      cy.get('.usa-file-input__preview-close').should('be.disabled');
    });

    it('should ignore all interaction types when disabled', () => {
      let anyEventTriggered = false;
      const eventTypes = [
        'click',
        'dblclick',
        'mousedown',
        'mouseup',
        'focus',
        'blur',
        'keydown',
        'keyup',
      ];

      cy.mount(`
        <usa-file-input
          id="comprehensive-disabled-test"
          name="comprehensive-disabled"
          disabled>
        </usa-file-input>
      `);

      cy.window().then((win) => {
        const fileInput = win.document.getElementById('comprehensive-disabled-test') as any;
        const nativeInput = fileInput.querySelector('input[type="file"]') as HTMLInputElement;
        const target = fileInput.querySelector('.usa-file-input__target') as HTMLElement;

        // Listen for any significant events
        eventTypes.forEach((eventType) => {
          nativeInput.addEventListener(eventType, () => {
            anyEventTriggered = true;
          });
          target.addEventListener(eventType, () => {
            anyEventTriggered = true;
          });
        });

        // Listen for component-specific events
        fileInput.addEventListener('change', () => {
          anyEventTriggered = true;
        });
        fileInput.addEventListener('file-add', () => {
          anyEventTriggered = true;
        });
        fileInput.addEventListener('file-remove', () => {
          anyEventTriggered = true;
        });
      });

      // Attempt comprehensive interactions
      cy.get('.usa-file-input__target').click({ force: true });
      cy.get('.usa-file-input__target').dblclick({ force: true });
      cy.get('input[type="file"]').focus({ force: true });
      cy.get('input[type="file"]').type('{enter}', { force: true });
      cy.get('input[type="file"]').type(' ', { force: true });

      // Attempt file selection
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('comprehensive test'),
          fileName: 'comprehensive-test.txt',
          mimeType: 'text/plain',
        },
        { force: true }
      );

      cy.wait(100).then(() => {
        // Component should have ignored all interactions
        expect(anyEventTriggered).to.be.false;
      });

      // Component should remain in disabled state
      cy.get('input[type="file"]').should('be.disabled');
      cy.get('.usa-file-input').should('have.class', 'usa-file-input--disabled');
    });

    it('should handle disabled state transitions properly', () => {
      let stateTransitionHandled = false;

      cy.mount(`
        <usa-file-input
          id="transition-test"
          name="transition-test">
        </usa-file-input>
      `);

      // Start enabled and add a file
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('transition test'),
          fileName: 'transition-test.txt',
          mimeType: 'text/plain',
        },
        { force: true }
      );

      cy.get('.usa-file-input__preview').should('contain.text', 'transition-test.txt');

      // Transition to disabled
      cy.window().then((win) => {
        const fileInput = win.document.getElementById('transition-test') as any;
        fileInput.disabled = true;
        stateTransitionHandled = true;
      });

      cy.wait(100);

      // Should be properly disabled
      cy.get('input[type="file"]').should('be.disabled');
      cy.get('.usa-file-input').should('have.class', 'usa-file-input--disabled');

      // File should still be visible but not removable
      cy.get('.usa-file-input__preview').should('contain.text', 'transition-test.txt');
      cy.get('.usa-file-input__preview-close').should('be.disabled');

      // Transition back to enabled
      cy.window().then((win) => {
        const fileInput = win.document.getElementById('transition-test') as any;
        fileInput.disabled = false;
      });

      cy.wait(100);

      // Should be properly enabled again
      cy.get('input[type="file"]').should('not.be.disabled');
      cy.get('.usa-file-input').should('not.have.class', 'usa-file-input--disabled');
      cy.get('.usa-file-input__preview-close').should('not.be.disabled');

      expect(stateTransitionHandled).to.be.true;
    });

    it('should respect disabled state in form contexts', () => {
      let formSubmitted = false;
      let disabledFieldIncluded = false;

      cy.mount(`
        <form id="disabled-form-test">
          <usa-file-input
            id="disabled-form-input"
            name="disabled-file"
            disabled>
          </usa-file-input>
          <usa-file-input
            id="enabled-form-input"
            name="enabled-file">
          </usa-file-input>
          <button type="submit">Submit</button>
        </form>
      `);

      // Add file to enabled input
      cy.get('#enabled-form-input input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('enabled form test'),
          fileName: 'enabled-test.txt',
          mimeType: 'text/plain',
        },
        { force: true }
      );

      cy.window().then((win) => {
        const form = win.document.getElementById('disabled-form-test') as HTMLFormElement;

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          formSubmitted = true;

          const formData = new FormData(form);
          if (formData.has('disabled-file')) {
            disabledFieldIncluded = true;
          }
        });
      });

      // Submit form
      cy.get('button[type="submit"]')
        .click()
        .then(() => {
          expect(formSubmitted).to.be.true;
          expect(disabledFieldIncluded).to.be.false; // Disabled field should not be included
        });
    });
  });

  // Edge Case Testing (Critical Gap Fix)
  describe('Edge Case Testing', () => {
    describe('Boundary Conditions', () => {
      it('should handle extremely large file sizes gracefully', () => {
        cy.mount(`<usa-file-input id="large-file-test" max-file-size="1MB"></usa-file-input>`);

        // Create large file that exceeds max size
        const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB > 1MB limit

        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(largeContent),
            fileName: 'large-file.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        // Should show error for file too large
        cy.get('.usa-error-message').should('contain.text', 'file is too large');

        // Component should remain functional
        cy.get('input[type="file"]').should('exist');
        cy.get('.usa-file-input__target').should('be.visible');
      });

      it('should handle maximum number of files limit', () => {
        cy.mount(`<usa-file-input id="max-files-test" multiple max-files="3"></usa-file-input>`);

        // Try to upload more files than the limit
        const files = Array.from({ length: 5 }, (_, i) => ({
          contents: Cypress.Buffer.from(`content ${i}`),
          fileName: `file-${i}.txt`,
          mimeType: 'text/plain',
        }));

        cy.get('input[type="file"]').selectFile(files, { force: true });

        // Should limit to max files and show appropriate message
        cy.get('.usa-file-input__preview').should('have.length.at.most', 3);

        // Should show error about too many files
        cy.get('.usa-error-message').should('contain.text', 'too many files');
      });

      it('should handle invalid file types without crashing', () => {
        cy.mount(
          `<usa-file-input id="invalid-type-test" accept=".pdf,.doc,.docx"></usa-file-input>`
        );

        // Upload unsupported file type
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('executable content'),
            fileName: 'virus.exe',
            mimeType: 'application/octet-stream',
          },
          { force: true }
        );

        // Should reject file and show error
        cy.get('.usa-error-message').should('contain.text', 'file type not allowed');

        // Component should remain functional
        cy.get('.usa-file-input__target').should('be.visible');
        cy.get('input[type="file"]').should('exist');
      });

      it('should handle empty and corrupt files', () => {
        const testFiles = [
          { name: 'empty.txt', content: '', description: 'empty file' },
          { name: 'null.txt', content: null, description: 'null content' },
          { name: 'corrupt.pdf', content: 'not-a-pdf', description: 'corrupt file' },
        ];

        testFiles.forEach(({ name, content, description }) => {
          cy.mount(`<usa-file-input id="corrupt-test"></usa-file-input>`);

          cy.get('input[type="file"]').selectFile(
            {
              contents: content ? Cypress.Buffer.from(content) : Cypress.Buffer.alloc(0),
              fileName: name,
              mimeType: 'application/pdf',
            },
            { force: true }
          );

          // Should handle gracefully without crashing
          cy.get('usa-file-input').should('be.visible');

          // May show warning or accept depending on validation rules
          cy.get('.usa-file-input__target').should('exist');

          cy.get('usa-file-input').remove();
        });
      });

      it('should handle files with special characters in names', () => {
        const specialFiles = [
          'file with spaces.txt',
          'file@#$%^&*().txt',
          'file[brackets].txt',
          'file(parentheses).txt',
          'файл-кириллица.txt',
          '文件中文名.txt',
          "file'quote.txt",
          'file"doublequote.txt',
        ];

        specialFiles.forEach((fileName) => {
          cy.mount(`<usa-file-input id="special-chars-test"></usa-file-input>`);

          cy.get('input[type="file"]').selectFile(
            {
              contents: Cypress.Buffer.from('test content'),
              fileName: fileName,
              mimeType: 'text/plain',
            },
            { force: true }
          );

          // Should handle special characters without breaking
          cy.get('.usa-file-input__preview').should('be.visible');
          cy.get('.usa-file-input__preview').should('contain.text', fileName);

          cy.get('usa-file-input').remove();
        });
      });
    });

    describe('Error Recovery', () => {
      it('should recover from drag and drop failures', () => {
        cy.mount(`<usa-file-input id="drag-recovery-test" multiple></usa-file-input>`);

        cy.window().then((win) => {
          const fileInput = win.document.getElementById('drag-recovery-test') as any;

          // Simulate failed drag operation
          fileInput.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            // Simulate error during drag
            throw new Error('Drag operation failed');
          });
        });

        // Should handle drag failure gracefully
        cy.get('.usa-file-input__target')
          .trigger('dragenter')
          .trigger('dragover', { force: true })
          .trigger('dragleave');

        // Component should remain functional
        cy.get('.usa-file-input__target').should('be.visible');
        cy.get('input[type="file"]').should('exist');

        // Regular file selection should still work
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('recovery test'),
            fileName: 'recovery.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        cy.get('.usa-file-input__preview').should('contain.text', 'recovery.txt');
      });

      it('should handle file reading failures gracefully', () => {
        cy.mount(`<usa-file-input id="read-failure-test" show-preview></usa-file-input>`);

        cy.window().then((win) => {
          const fileInput = win.document.getElementById('read-failure-test') as any;

          // Mock FileReader to simulate failure
          const originalFileReader = win.FileReader;
          win.FileReader = class MockFileReader {
            readAsDataURL() {
              setTimeout(() => {
                if (this.onerror) {
                  this.onerror(new Error('File read failed'));
                }
              }, 10);
            }
            readAsText() {
              setTimeout(() => {
                if (this.onerror) {
                  this.onerror(new Error('File read failed'));
                }
              }, 10);
            }
          } as any;

          // Restore after test
          setTimeout(() => {
            win.FileReader = originalFileReader;
          }, 1000);
        });

        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('test content'),
            fileName: 'read-failure.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        // Should handle read failure gracefully
        cy.get('.usa-file-input__preview').should('exist');
        cy.get('usa-file-input').should('be.visible');
      });

      it('should recover from DOM manipulation during file operations', () => {
        cy.mount(`
          <div id="container">
            <usa-file-input id="dom-manipulation-test"></usa-file-input>
          </div>
        `);

        cy.window().then((win) => {
          const container = win.document.getElementById('container');
          const fileInput = win.document.getElementById('dom-manipulation-test') as any;

          // Remove and re-add during file operation
          fileInput.addEventListener('change', () => {
            setTimeout(() => {
              container?.removeChild(fileInput);
              setTimeout(() => {
                container?.appendChild(fileInput);
              }, 50);
            }, 10);
          });
        });

        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('dom test'),
            fileName: 'dom-test.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        cy.wait(200);

        // Should recover and be functional
        cy.get('#dom-manipulation-test').should('exist');
        cy.get('#dom-manipulation-test input[type="file"]').should('exist');
      });

      it('should handle memory cleanup on file removal and re-addition', () => {
        cy.mount(`<div id="cleanup-container"></div>`);

        cy.window().then((win) => {
          const container = win.document.getElementById('cleanup-container');

          // Create and destroy multiple file inputs
          for (let i = 0; i < 10; i++) {
            const fileInput = win.document.createElement('usa-file-input') as any;
            fileInput.id = `cleanup-test-${i}`;
            fileInput.multiple = true;
            container?.appendChild(fileInput);

            // Simulate file operations
            const input = fileInput.querySelector('input[type="file"]');
            if (input) {
              const event = new Event('change');
              Object.defineProperty(event, 'target', {
                value: {
                  files: [
                    {
                      name: `file-${i}.txt`,
                      size: 1024,
                      type: 'text/plain',
                    },
                  ],
                },
                enumerable: true,
              });
              input.dispatchEvent(event);
            }

            // Remove from DOM
            container?.removeChild(fileInput);
          }

          // Create final test input
          const finalInput = win.document.createElement('usa-file-input') as any;
          finalInput.id = 'final-cleanup-test';
          container?.appendChild(finalInput);
        });

        // Final input should work without performance issues
        cy.get('#final-cleanup-test input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('final test'),
            fileName: 'final.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        cy.get('#final-cleanup-test .usa-file-input__preview').should('contain.text', 'final.txt');
      });
    });

    describe('Performance Stress Testing', () => {
      it('should handle rapid file selection and removal', () => {
        let operationTimes: number[] = [];

        cy.mount(`<usa-file-input id="rapid-operations" multiple></usa-file-input>`);

        cy.window().then((win) => {
          const fileInput = win.document.getElementById('rapid-operations') as any;

          fileInput.addEventListener('change', () => {
            operationTimes.push(performance.now());
          });
        });

        // Rapidly add and remove files
        for (let i = 0; i < 10; i++) {
          cy.get('input[type="file"]').selectFile(
            {
              contents: Cypress.Buffer.from(`content ${i}`),
              fileName: `rapid-${i}.txt`,
              mimeType: 'text/plain',
            },
            { force: true }
          );

          if (i % 2 === 0) {
            cy.get('.usa-file-input__preview-close').first().click();
          }
        }

        cy.wait(100).then(() => {
          // Should maintain consistent performance
          if (operationTimes.length > 1) {
            const intervals = operationTimes.slice(1).map((time, i) => time - operationTimes[i]);
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

            intervals.forEach((interval) => {
              expect(interval).to.be.lessThan(avgInterval * 3);
            });
          }
        });
      });

      it('should handle large numbers of simultaneous file uploads', () => {
        const largeFileSet = Array.from({ length: 50 }, (_, i) => ({
          contents: Cypress.Buffer.from(`file content ${i}`),
          fileName: `bulk-file-${i}.txt`,
          mimeType: 'text/plain',
        }));

        cy.mount(`<usa-file-input id="bulk-upload" multiple max-files="100"></usa-file-input>`);

        // Upload large number of files
        cy.get('input[type="file"]').selectFile(largeFileSet.slice(0, 25), { force: true });

        // Should handle without performance degradation
        cy.get('.usa-file-input__preview').should('have.length', 25);

        // Should still be responsive
        cy.get('.usa-file-input__preview-close').first().click();
        cy.get('.usa-file-input__preview').should('have.length', 24);
      });

      it('should handle file validation performance under load', () => {
        let validationCount = 0;

        cy.mount(
          `<usa-file-input id="validation-performance" accept=".txt,.pdf,.doc" multiple></usa-file-input>`
        );

        cy.window().then((win) => {
          const fileInput = win.document.getElementById('validation-performance') as any;

          fileInput.addEventListener('file-validation', () => {
            validationCount++;
          });
        });

        // Upload mix of valid and invalid files
        const mixedFiles = [
          { name: 'valid1.txt', type: 'text/plain' },
          { name: 'invalid1.exe', type: 'application/octet-stream' },
          { name: 'valid2.pdf', type: 'application/pdf' },
          { name: 'invalid2.zip', type: 'application/zip' },
          { name: 'valid3.doc', type: 'application/msword' },
        ].map((file) => ({
          contents: Cypress.Buffer.from('test content'),
          fileName: file.name,
          mimeType: file.type,
        }));

        cy.get('input[type="file"]').selectFile(mixedFiles, { force: true });

        // Should validate all files without performance issues
        cy.get('.usa-file-input__preview').should('have.length.at.least', 3); // Valid files
        cy.get('.usa-error-message').should('exist'); // Invalid file errors
      });

      it('should handle preview generation stress test', () => {
        cy.mount(`<usa-file-input id="preview-stress" show-preview multiple></usa-file-input>`);

        // Upload files that require different preview types
        const previewFiles = Array.from({ length: 15 }, (_, i) => {
          const types = ['text/plain', 'image/jpeg', 'application/pdf'];
          const extensions = ['.txt', '.jpg', '.pdf'];
          const type = types[i % 3];
          const ext = extensions[i % 3];

          return {
            contents: Cypress.Buffer.from(`preview content ${i}`),
            fileName: `preview-${i}${ext}`,
            mimeType: type,
          };
        });

        cy.get('input[type="file"]').selectFile(previewFiles, { force: true });

        // Should generate previews without performance degradation
        cy.get('.usa-file-input__preview').should('have.length', 15);

        // All previews should be responsive
        cy.get('.usa-file-input__preview-close').each(($closeBtn) => {
          cy.wrap($closeBtn).should('be.visible');
        });
      });
    });

    describe('Mobile Compatibility', () => {
      it('should handle touch file selection', () => {
        cy.mount(`<usa-file-input id="touch-file-input"></usa-file-input>`);

        // Touch events on file input area
        cy.get('.usa-file-input__target').trigger('touchstart').trigger('touchend');

        // Should remain functional
        cy.get('.usa-file-input__target').should('be.visible');
        cy.get('input[type="file"]').should('exist');

        // File selection should work after touch
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('touch test'),
            fileName: 'touch-test.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        cy.get('.usa-file-input__preview').should('contain.text', 'touch-test.txt');
      });

      it('should handle mobile viewport constraints', () => {
        cy.mount(`<usa-file-input id="mobile-viewport" multiple show-preview></usa-file-input>`);

        // Test mobile viewport
        cy.viewport(320, 568);

        cy.get('input[type="file"]').selectFile(
          [
            {
              contents: Cypress.Buffer.from('mobile file 1'),
              fileName: 'mobile-file-1.txt',
              mimeType: 'text/plain',
            },
            {
              contents: Cypress.Buffer.from('mobile file 2'),
              fileName: 'mobile-file-2.txt',
              mimeType: 'text/plain',
            },
          ],
          { force: true }
        );

        // Should display files appropriately in mobile layout
        cy.get('.usa-file-input__preview').should('have.length', 2);
        cy.get('.usa-file-input__preview').each(($preview) => {
          cy.wrap($preview).should('be.visible');
        });

        // Should handle file removal on mobile
        cy.get('.usa-file-input__preview-close').first().click();
        cy.get('.usa-file-input__preview').should('have.length', 1);
      });

      it('should handle orientation changes during file operations', () => {
        cy.mount(`<usa-file-input id="orientation-test" multiple></usa-file-input>`);

        // Portrait mode
        cy.viewport(320, 568);
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('orientation test'),
            fileName: 'orientation.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        cy.get('.usa-file-input__preview').should('contain.text', 'orientation.txt');

        // Landscape mode (simulate rotation)
        cy.viewport(568, 320);
        cy.get('.usa-file-input__preview').should('be.visible');

        // Should remain functional after orientation change
        cy.get('.usa-file-input__preview-close').click();
        cy.get('.usa-file-input__preview').should('not.exist');
      });

      it('should handle limited storage scenarios', () => {
        cy.mount(`<usa-file-input id="storage-test"></usa-file-input>`);

        cy.window().then((win) => {
          // Mock storage quota exceeded
          const originalCreateObjectURL = win.URL.createObjectURL;
          win.URL.createObjectURL = function () {
            throw new DOMException('Quota exceeded', 'QuotaExceededError');
          };

          // Restore after test
          setTimeout(() => {
            win.URL.createObjectURL = originalCreateObjectURL;
          }, 1000);
        });

        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('storage test'),
            fileName: 'storage-test.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        // Should handle storage limitation gracefully
        cy.get('usa-file-input').should('be.visible');
        cy.get('.usa-file-input__target').should('exist');
      });
    });

    describe('Accessibility Edge Cases', () => {
      it('should handle screen reader with file operations', () => {
        cy.mount(
          `<usa-file-input id="screen-reader-files" aria-label="Document Upload" multiple></usa-file-input>`
        );

        // Should have proper ARIA attributes
        cy.get('input[type="file"]').should('have.attr', 'aria-label', 'Document Upload');

        cy.get('input[type="file"]').selectFile(
          [
            {
              contents: Cypress.Buffer.from('accessible file 1'),
              fileName: 'accessible-1.txt',
              mimeType: 'text/plain',
            },
            {
              contents: Cypress.Buffer.from('accessible file 2'),
              fileName: 'accessible-2.txt',
              mimeType: 'text/plain',
            },
          ],
          { force: true }
        );

        // File previews should be accessible
        cy.get('.usa-file-input__preview').each(($preview) => {
          cy.wrap($preview).should('have.attr', 'role');
        });

        // Remove buttons should be accessible
        cy.get('.usa-file-input__preview-close').each(($closeBtn) => {
          cy.wrap($closeBtn).should('have.attr', 'aria-label');
        });
      });

      it('should handle high contrast mode for file interface', () => {
        cy.mount(`<usa-file-input id="high-contrast-files" multiple></usa-file-input>`);

        // Check drag area has sufficient contrast
        cy.get('.usa-file-input__target').then(($target) => {
          const styles = window.getComputedStyle($target[0]);
          expect(styles.borderColor).to.not.equal('transparent');
          expect(styles.backgroundColor).to.not.equal('transparent');
        });

        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('contrast test'),
            fileName: 'contrast.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        // File preview should have sufficient contrast
        cy.get('.usa-file-input__preview').then(($preview) => {
          const styles = window.getComputedStyle($preview[0]);
          expect(styles.color).to.not.equal('transparent');
          expect(styles.backgroundColor).to.not.equal('transparent');
        });
      });

      it('should handle keyboard navigation with multiple files', () => {
        cy.mount(`<usa-file-input id="keyboard-multiple" multiple></usa-file-input>`);

        cy.get('input[type="file"]').selectFile(
          [
            {
              contents: Cypress.Buffer.from('kbd file 1'),
              fileName: 'kbd-1.txt',
              mimeType: 'text/plain',
            },
            {
              contents: Cypress.Buffer.from('kbd file 2'),
              fileName: 'kbd-2.txt',
              mimeType: 'text/plain',
            },
            {
              contents: Cypress.Buffer.from('kbd file 3'),
              fileName: 'kbd-3.txt',
              mimeType: 'text/plain',
            },
          ],
          { force: true }
        );

        // Should be able to navigate through file remove buttons
        cy.get('.usa-file-input__preview-close').first().focus();
        cy.focused().should('match', '.usa-file-input__preview-close');

        // Tab to next remove button
        cy.focused().tab();
        cy.focused().should('match', '.usa-file-input__preview-close');

        // Space/Enter should remove file
        cy.focused().type(' ');
        cy.get('.usa-file-input__preview').should('have.length', 2);
      });

      it('should handle focus management with dynamic file list', () => {
        cy.mount(`
          <div>
            <button id="focus-before">Before</button>
            <usa-file-input id="dynamic-focus-files" multiple></usa-file-input>
            <button id="focus-after">After</button>
          </div>
        `);

        cy.get('input[type="file"]').selectFile(
          [
            {
              contents: Cypress.Buffer.from('focus 1'),
              fileName: 'focus-1.txt',
              mimeType: 'text/plain',
            },
            {
              contents: Cypress.Buffer.from('focus 2'),
              fileName: 'focus-2.txt',
              mimeType: 'text/plain',
            },
          ],
          { force: true }
        );

        // Focus should move properly through the interface
        cy.get('#focus-before').focus().tab();
        cy.focused().should('match', 'input[type="file"]');

        cy.focused().tab();
        cy.focused().should('match', '.usa-file-input__preview-close');

        cy.focused().tab();
        cy.focused().should('match', '.usa-file-input__preview-close');

        cy.focused().tab();
        cy.focused().should('match', '#focus-after');
      });

      it('should announce file operations to screen readers', () => {
        cy.mount(`
          <div>
            <usa-file-input id="sr-announce" multiple></usa-file-input>
            <div id="sr-live-region" aria-live="polite"></div>
          </div>
        `);

        cy.window().then((win) => {
          const fileInput = win.document.getElementById('sr-announce') as any;
          const liveRegion = win.document.getElementById('sr-live-region');

          fileInput.addEventListener('file-added', (e: CustomEvent) => {
            if (liveRegion) {
              liveRegion.textContent = `File added: ${e.detail.fileName}`;
            }
          });

          fileInput.addEventListener('file-removed', (e: CustomEvent) => {
            if (liveRegion) {
              liveRegion.textContent = `File removed: ${e.detail.fileName}`;
            }
          });
        });

        // Add file
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from('screen reader test'),
            fileName: 'sr-test.txt',
            mimeType: 'text/plain',
          },
          { force: true }
        );

        // Remove file
        cy.get('.usa-file-input__preview-close').click();

        // Live region should contain announcements
        cy.get('#sr-live-region').should('not.be.empty');
      });
    });

    describe('Browser Compatibility Edge Cases', () => {
      it('should handle different file API support levels', () => {
        cy.mount(`<usa-file-input id="file-api-compat"></usa-file-input>`);

        cy.window().then((win) => {
          // Mock limited File API support
          const originalFileReader = win.FileReader;
          delete (win as any).FileReader;

          // Component should fall back gracefully
          cy.get('input[type="file"]').selectFile(
            {
              contents: Cypress.Buffer.from('api compat test'),
              fileName: 'api-compat.txt',
              mimeType: 'text/plain',
            },
            { force: true }
          );

          // Should still function without full File API
          cy.get('.usa-file-input__preview').should('contain.text', 'api-compat.txt');

          // Restore FileReader
          (win as any).FileReader = originalFileReader;
        });
      });

      it('should handle drag and drop API differences', () => {
        cy.mount(`<usa-file-input id="drag-api-compat" multiple></usa-file-input>`);

        cy.window().then((win) => {
          // Mock older drag API
          const originalDataTransfer = win.DataTransfer;
          win.DataTransfer = class MockDataTransfer {
            files: FileList = [] as any;
            types: string[] = [];
            getData() {
              return '';
            }
            setData() {}
          } as any;

          // Should handle gracefully
          cy.get('.usa-file-input__target')
            .trigger('dragenter')
            .trigger('dragover')
            .trigger('drop');

          // Component should remain functional
          cy.get('.usa-file-input__target').should('be.visible');

          // Restore DataTransfer
          win.DataTransfer = originalDataTransfer;
        });
      });

      it('should handle MIME type detection variations', () => {
        const mimeVariations = [
          { fileName: 'test.txt', providedMime: 'text/plain', expectedBehavior: 'accept' },
          { fileName: 'test.pdf', providedMime: 'application/pdf', expectedBehavior: 'accept' },
          {
            fileName: 'test.unknown',
            providedMime: 'application/octet-stream',
            expectedBehavior: 'handle gracefully',
          },
          { fileName: 'test.txt', providedMime: '', expectedBehavior: 'fallback detection' },
        ];

        mimeVariations.forEach(({ fileName, providedMime, expectedBehavior }) => {
          cy.mount(`<usa-file-input id="mime-test" accept=".txt,.pdf"></usa-file-input>`);

          cy.get('input[type="file"]').selectFile(
            {
              contents: Cypress.Buffer.from('mime test'),
              fileName: fileName,
              mimeType: providedMime,
            },
            { force: true }
          );

          // Should handle MIME type variations appropriately
          cy.get('usa-file-input').should('be.visible');

          cy.get('usa-file-input').remove();
        });
      });
    });
  });
});
