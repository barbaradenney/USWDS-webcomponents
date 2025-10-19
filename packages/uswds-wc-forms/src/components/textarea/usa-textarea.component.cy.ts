// Component tests for usa-textarea
import './index.ts';

describe('USA Textarea Component Tests', () => {
  it('should render textarea with default properties', () => {
    cy.mount(`<usa-textarea id="test-textarea"></usa-textarea>`);
    cy.get('usa-textarea').should('exist');
    cy.get('usa-textarea textarea').should('have.class', 'usa-textarea');
  });

  it('should handle textarea value changes', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        name="comments"
        placeholder="Enter your comments">
      </usa-textarea>
    `);

    const longText =
      'This is a multi-line comment.\nIt spans multiple lines.\nAnd demonstrates textarea functionality.';

    cy.get('textarea').type(longText);
    cy.get('textarea').should('have.value', longText);

    cy.get('textarea').clear().type('Updated comment text');
    cy.get('textarea').should('have.value', 'Updated comment text');
  });

  it('should handle rows and columns attributes', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        rows="5"
        cols="40">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.attr', 'rows', '5').should('have.attr', 'cols', '40');
  });

  it('should emit input events', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        name="feedback">
      </usa-textarea>
    `);

    cy.window().then((win) => {
      const textarea = win.document.getElementById('test-textarea') as any;
      const inputSpy = cy.stub();
      textarea.addEventListener('input', inputSpy);

      cy.get('textarea').type('User feedback content');
      cy.then(() => {
        expect(inputSpy).to.have.been.called;
      });
    });
  });

  it('should emit change events', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        name="description">
      </usa-textarea>
    `);

    cy.window().then((win) => {
      const textarea = win.document.getElementById('test-textarea') as any;
      const changeSpy = cy.stub();
      textarea.addEventListener('change', changeSpy);

      cy.get('textarea').type('Description content').blur();
      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle disabled state', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        disabled
        value="This textarea is disabled">
      </usa-textarea>
    `);

    cy.get('textarea').should('be.disabled');
    cy.get('textarea').should('have.value', 'This textarea is disabled');
    cy.get('textarea').type('new text'); // Should not change
    cy.get('textarea').should('have.value', 'This textarea is disabled');
  });

  it('should handle readonly state', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        readonly
        value="This is read-only content that cannot be modified.">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.attr', 'readonly');
    cy.get('textarea').type('attempt to modify');
    cy.get('textarea').should('have.value', 'This is read-only content that cannot be modified.');
  });

  it('should handle required state', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        required
        name="required-comments">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.attr', 'required');
    cy.get('textarea').should('have.attr', 'aria-required', 'true');
  });

  it('should handle error state', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        error
        error-message="Please provide more detailed comments (minimum 50 characters)">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.class', 'usa-textarea--error');
    cy.get('textarea').should('have.attr', 'aria-invalid', 'true');
    cy.get('.usa-error-message').should('contain.text', 'Please provide more detailed comments');
  });

  it('should handle success state', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        success
        value="Thank you for your detailed feedback. This is very helpful.">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.class', 'usa-textarea--success');
  });

  it('should handle small size variant', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        size="small">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.class', 'usa-textarea--small');
  });

  it('should handle large size variant', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        size="large">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.class', 'usa-textarea--large');
  });

  it('should handle maxlength constraint', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        maxlength="100"
        name="brief-description">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.attr', 'maxlength', '100');

    const longText = 'A'.repeat(150); // 150 characters
    cy.get('textarea').type(longText);
    cy.get('textarea').should('have.value', 'A'.repeat(100)); // Limited to 100 chars
  });

  it('should handle character counting', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        maxlength="200"
        show-character-count>
      </usa-textarea>
    `);

    const testText = 'This is a test message for character counting.';
    cy.get('textarea').type(testText);
    cy.get('.usa-character-count').should('contain', `${testText.length} characters of 200 used`);
  });

  it('should handle resize behavior', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        resize="vertical">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.css', 'resize', 'vertical');
  });

  it('should handle auto-resize functionality', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        auto-resize
        rows="3">
      </usa-textarea>
    `);

    const multiLineText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7';
    cy.get('textarea').type(multiLineText);

    // Should expand beyond initial 3 rows
    cy.get('textarea').should('have.attr', 'rows').and('not.equal', '3');
  });

  it('should be keyboard accessible', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        name="accessible-textarea">
      </usa-textarea>
    `);

    // Tab to textarea
    cy.get('textarea').focus();
    cy.focused().should('have.attr', 'name', 'accessible-textarea');

    // Type in focused textarea
    cy.focused().type('Accessible content with {enter}line breaks');
    cy.get('textarea').should('contain.value', 'Accessible content with \nline breaks');

    // Select all with Ctrl+A (Cmd+A on Mac)
    cy.focused().type('{cmd+a}');
    cy.focused().type('Replaced content');
    cy.get('textarea').should('have.value', 'Replaced content');
  });

  it('should handle tab key properly', () => {
    cy.mount(`
      <div>
        <usa-textarea id="textarea1" name="first"></usa-textarea>
        <usa-textarea id="textarea2" name="second"></usa-textarea>
      </div>
    `);

    // Focus first textarea
    cy.get('#textarea1 textarea').focus();
    cy.focused().should('have.attr', 'name', 'first');

    // Tab should move to next textarea (not insert tab character by default)
    cy.focused().tab();
    cy.focused().should('have.attr', 'name', 'second');
  });

  it('should handle spellcheck attribute', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        spellcheck="false">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.attr', 'spellcheck', 'false');
  });

  it('should handle wrap attribute', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        wrap="hard">
      </usa-textarea>
    `);

    cy.get('textarea').should('have.attr', 'wrap', 'hard');
  });

  it('should handle aria attributes', () => {
    cy.mount(`
      <div>
        <label id="textarea-label">Detailed Comments</label>
        <span id="textarea-hint">Please provide as much detail as possible</span>
        <usa-textarea 
          id="test-textarea"
          aria-labelledby="textarea-label"
          aria-describedby="textarea-hint">
        </usa-textarea>
      </div>
    `);

    cy.get('textarea')
      .should('have.attr', 'aria-labelledby', 'textarea-label')
      .should('have.attr', 'aria-describedby', 'textarea-hint');
  });

  it('should work in form submission', () => {
    cy.mount(`
      <form id="test-form">
        <usa-textarea 
          id="test-textarea"
          name="user-feedback"
          value="This is user feedback about the service."
          required>
        </usa-textarea>
        <button type="submit">Submit</button>
      </form>
    `);

    cy.window().then((win) => {
      const form = win.document.getElementById('test-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy(formData.get('user-feedback'));
      });

      cy.get('button[type="submit"]').click();
      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith('This is user feedback about the service.');
      });
    });
  });

  it('should handle focus and blur events', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        name="focus-test">
      </usa-textarea>
    `);

    cy.window().then((win) => {
      const textarea = win.document.getElementById('test-textarea') as any;
      const focusSpy = cy.stub();
      const blurSpy = cy.stub();
      textarea.addEventListener('focus', focusSpy);
      textarea.addEventListener('blur', blurSpy);

      cy.get('textarea').focus();
      cy.get('textarea').blur();

      cy.then(() => {
        expect(focusSpy).to.have.been.called;
        expect(blurSpy).to.have.been.called;
      });
    });
  });

  it('should handle validation on blur', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        required
        minlength="10"
        validate-on-blur>
      </usa-textarea>
    `);

    // Enter text too short and blur
    cy.get('textarea').type('Short').blur();
    cy.get('textarea').should('have.attr', 'aria-invalid', 'true');

    // Enter valid length text and blur
    cy.get('textarea')
      .clear()
      .type('This is a longer message that meets the minimum length requirement')
      .blur();
    cy.get('textarea').should('not.have.attr', 'aria-invalid', 'true');
  });

  it('should be accessible', () => {
    cy.mount(`
      <form>
        <label for="comments-textarea">Additional Comments</label>
        <usa-textarea 
          id="comments-textarea"
          name="comments"
          required
          aria-describedby="comments-hint">
        </usa-textarea>
        <div id="comments-hint">Please share any additional feedback</div>
      </form>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        class="custom-textarea-class">
      </usa-textarea>
    `);

    cy.get('usa-textarea').should('have.class', 'custom-textarea-class');
    cy.get('textarea').should('have.class', 'usa-textarea');
  });

  it('should handle copy and paste operations', () => {
    cy.mount(`
      <usa-textarea 
        id="test-textarea"
        name="paste-test">
      </usa-textarea>
    `);

    const initialText = 'Initial textarea content\nWith multiple lines\nFor testing';

    // Type initial text
    cy.get('textarea').type(initialText);

    // Select all text
    cy.get('textarea').select();

    // Clear and type new text (simulating paste)
    cy.get('textarea')
      .clear()
      .type('Pasted multiline content\nFrom clipboard\nWith formatting preserved');
    cy.get('textarea').should(
      'contain.value',
      'Pasted multiline content\nFrom clipboard\nWith formatting preserved'
    );
  });

  it('should handle word counting', () => {
    cy.mount(`
      <usa-textarea
        id="test-textarea"
        show-word-count>
      </usa-textarea>
    `);

    const testText = 'This is a test message with exactly eight words.';
    cy.get('textarea').type(testText);
    cy.get('.usa-word-count').should('contain', '8 words');
  });

  // Responsive Layout Tests
  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE
    });

    it('should display properly on mobile with touch targets', () => {
      cy.mount(`
        <div class="usa-form-group">
          <label class="usa-label" for="mobile-textarea">Comments</label>
          <usa-textarea
            id="mobile-textarea"
            name="comments"
            rows="4"
            placeholder="Enter your comments">
          </usa-textarea>
        </div>
      `);

      // Textarea should be properly sized for mobile
      cy.get('textarea')
        .should('be.visible')
        .and(($textarea) => {
          const width = $textarea.outerWidth();
          const height = $textarea.outerHeight();
          expect(width).to.be.at.most(375); // Fit within mobile viewport
          expect(height).to.be.at.least(60); // Adequate height for content
        });
    });

    it('should handle mobile form layout stacking', () => {
      cy.mount(`
        <form class="usa-form">
          <div class="usa-form-group">
            <label class="usa-label" for="mobile-summary">Summary</label>
            <usa-textarea
              id="mobile-summary"
              name="summary"
              rows="3"
              maxlength="150">
            </usa-textarea>
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="mobile-details">Details</label>
            <usa-textarea
              id="mobile-details"
              name="details"
              rows="6"
              placeholder="Provide detailed information">
            </usa-textarea>
          </div>
        </form>
      `);

      // Form should stack vertically on mobile
      cy.get('.usa-form-group').should('have.length', 2);
      cy.get('.usa-form-group').each(($group) => {
        cy.wrap($group)
          .should('have.css', 'width')
          .and('match', /375px|100%/);
      });
    });

    it('should handle touch interactions and auto-resize on mobile', () => {
      cy.mount(`
        <usa-textarea
          id="touch-textarea"
          auto-resize
          rows="3"
          placeholder="Touch to start typing">
        </usa-textarea>
      `);

      // Touch events should work
      cy.get('textarea').trigger('touchstart').trigger('touchend').should('be.focused');

      // Type long content to test auto-resize
      const longContent = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8';
      cy.get('textarea').type(longContent);

      // Should expand beyond initial 3 rows
      cy.get('textarea').then(($textarea) => {
        const height = $textarea.outerHeight();
        expect(height).to.be.greaterThan(100);
      });
    });

    it('should handle mobile error states', () => {
      cy.mount(`
        <div class="usa-form-group usa-form-group--error">
          <label class="usa-label usa-label--error" for="error-textarea">Description</label>
          <usa-textarea
            id="error-textarea"
            error
            error-message="Please provide at least 10 characters"
            minlength="10">
          </usa-textarea>
        </div>
      `);

      cy.get('.usa-error-message').should('be.visible');
      cy.get('textarea').should('have.class', 'usa-textarea--error');

      // Error message should be readable on mobile
      cy.get('.usa-error-message').should('have.css', 'font-size');
    });

    it('should handle character count display on mobile', () => {
      cy.mount(`
        <usa-textarea
          id="mobile-count"
          maxlength="100"
          show-character-count
          rows="4">
        </usa-textarea>
      `);

      const testText = 'This is mobile content for testing character count display.';
      cy.get('textarea').type(testText);

      cy.get('.usa-character-count')
        .should('be.visible')
        .should('contain', `${testText.length} characters of 100 used`);
    });
  });

  describe('Tablet Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(768, 1024); // iPad
    });

    it('should display form in two-column layout on tablet', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap">
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-summary">Summary</label>
              <usa-textarea
                id="tablet-summary"
                name="summary"
                rows="4">
              </usa-textarea>
            </div>
            <div class="tablet:grid-col-6">
              <label class="usa-label" for="tablet-notes">Additional Notes</label>
              <usa-textarea
                id="tablet-notes"
                name="notes"
                rows="4">
              </usa-textarea>
            </div>
          </div>
        </form>
      `);

      // Check grid layout on tablet
      cy.get('.tablet\\:grid-col-6').should('have.length', 2);
      cy.get('.tablet\\:grid-col-6').each(($col) => {
        cy.wrap($col).should('have.css', 'width').and('not.equal', '768px');
      });
    });

    it('should handle tablet touch and hover interactions', () => {
      cy.mount(`
        <usa-textarea
          id="tablet-textarea"
          rows="5"
          resize="vertical">
        </usa-textarea>
      `);

      // Should work with both touch and mouse
      cy.get('textarea').trigger('touchstart').trigger('touchend').should('be.focused');

      cy.get('textarea').trigger('mouseover').should('have.focus');

      // Check resize handle is available
      cy.get('textarea').should('have.css', 'resize', 'vertical');
    });

    it('should handle tablet large size variant', () => {
      cy.mount(`
        <usa-textarea
          id="tablet-large"
          size="large"
          rows="6">
        </usa-textarea>
      `);

      cy.get('textarea').should('have.class', 'usa-textarea--large');
    });

    it('should handle tablet form with character counting', () => {
      cy.mount(`
        <div class="usa-form-group">
          <label class="usa-label" for="tablet-feedback">Detailed Feedback</label>
          <usa-textarea
            id="tablet-feedback"
            maxlength="500"
            show-character-count
            rows="8">
          </usa-textarea>
        </div>
      `);

      const feedbackText =
        'This is detailed feedback that will be used to test character counting on tablet devices. '.repeat(
          3
        );
      cy.get('textarea').type(feedbackText);

      cy.get('.usa-character-count')
        .should('be.visible')
        .should('contain', `${feedbackText.length} characters of 500 used`);
    });
  });

  describe('Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1200, 800); // Desktop
    });

    it('should display full desktop form layout', () => {
      cy.mount(`
        <form class="usa-form usa-form--large">
          <div class="grid-row grid-gap-lg">
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-title">Title</label>
              <usa-textarea
                id="desktop-title"
                name="title"
                rows="2">
              </usa-textarea>
            </div>
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-summary">Summary</label>
              <usa-textarea
                id="desktop-summary"
                name="summary"
                rows="4">
              </usa-textarea>
            </div>
            <div class="desktop:grid-col-4">
              <label class="usa-label" for="desktop-details">Details</label>
              <usa-textarea
                id="desktop-details"
                name="details"
                rows="6">
              </usa-textarea>
            </div>
          </div>
        </form>
      `);

      // Check three-column layout on desktop
      cy.get('.desktop\\:grid-col-4').should('have.length', 3);
    });

    it('should handle keyboard navigation efficiently on desktop', () => {
      cy.mount(`
        <div>
          <usa-textarea id="first-textarea" name="first" rows="3"></usa-textarea>
          <usa-textarea id="second-textarea" name="second" rows="3"></usa-textarea>
          <usa-textarea id="third-textarea" name="third" rows="3"></usa-textarea>
        </div>
      `);

      // Tab through textareas
      cy.get('textarea').first().focus();
      cy.focused().should('have.attr', 'name', 'first');

      cy.focused().tab();
      cy.focused().should('have.attr', 'name', 'second');

      cy.focused().tab();
      cy.focused().should('have.attr', 'name', 'third');
    });

    it('should handle desktop hover and focus states', () => {
      cy.mount(`
        <usa-textarea
          id="hover-textarea"
          rows="4">
        </usa-textarea>
      `);

      cy.get('textarea').trigger('mouseover').should('have.css', 'cursor', 'text');

      cy.get('textarea')
        .focus()
        .should('have.focus')
        .should('have.css', 'outline-width')
        .and('not.equal', '0px');
    });

    it('should handle desktop resize functionality', () => {
      cy.mount(`
        <usa-textarea
          id="resize-textarea"
          resize="both"
          rows="4"
          cols="50">
        </usa-textarea>
      `);

      cy.get('textarea').should('have.css', 'resize', 'both');

      // Verify initial size
      cy.get('textarea').then(($textarea) => {
        const initialWidth = $textarea.outerWidth();
        const initialHeight = $textarea.outerHeight();
        expect(initialWidth).to.be.greaterThan(300);
        expect(initialHeight).to.be.greaterThan(80);
      });
    });

    it('should handle desktop word and character counting', () => {
      cy.mount(`
        <div class="grid-row grid-gap">
          <div class="desktop:grid-col-6">
            <label class="usa-label" for="word-count-textarea">Word Count Test</label>
            <usa-textarea
              id="word-count-textarea"
              show-word-count
              rows="5">
            </usa-textarea>
          </div>
          <div class="desktop:grid-col-6">
            <label class="usa-label" for="char-count-textarea">Character Count Test</label>
            <usa-textarea
              id="char-count-textarea"
              maxlength="300"
              show-character-count
              rows="5">
            </usa-textarea>
          </div>
        </div>
      `);

      const wordTestText = 'This desktop textarea has exactly seven words total.';
      const charTestText = 'Character counting test for desktop layouts.';

      cy.get('#word-count-textarea').type(wordTestText);
      cy.get('.usa-word-count').should('contain', '7 words');

      cy.get('#char-count-textarea').type(charTestText);
      cy.get('.usa-character-count').should(
        'contain',
        `${charTestText.length} characters of 300 used`
      );
    });
  });

  describe('Large Desktop Responsive Behavior', () => {
    beforeEach(() => {
      cy.viewport(1440, 900); // Large Desktop
    });

    it('should maintain proper spacing on large screens', () => {
      cy.mount(`
        <div class="grid-container">
          <form class="usa-form usa-form--large">
            <div class="grid-row grid-gap-lg">
              <div class="desktop:grid-col-6">
                <label class="usa-label" for="large-description">Description</label>
                <usa-textarea
                  id="large-description"
                  name="description"
                  rows="8"
                  auto-resize>
                </usa-textarea>
              </div>
              <div class="desktop:grid-col-6">
                <label class="usa-label" for="large-notes">Additional Notes</label>
                <usa-textarea
                  id="large-notes"
                  name="notes"
                  rows="8"
                  maxlength="1000"
                  show-character-count>
                </usa-textarea>
              </div>
            </div>
          </form>
        </div>
      `);

      // Should have proper two-column layout with adequate spacing
      cy.get('.desktop\\:grid-col-6').should('have.length', 2);

      // Container should be properly centered
      cy.get('.grid-container').should('have.css', 'max-width');

      // Textareas should have adequate size on large screens
      cy.get('textarea').each(($textarea) => {
        cy.wrap($textarea).then(($el) => {
          const width = $el.outerWidth();
          const height = $el.outerHeight();
          expect(width).to.be.greaterThan(400);
          expect(height).to.be.greaterThan(150);
        });
      });
    });

    it('should handle large desktop auto-resize efficiently', () => {
      cy.mount(`
        <usa-textarea
          id="large-auto-resize"
          auto-resize
          rows="4"
          cols="80">
        </usa-textarea>
      `);

      const veryLongContent = Array(20)
        .fill(
          'This is a very long line of content that will test auto-resize functionality on large desktop screens.'
        )
        .join('\n');

      cy.get('textarea').type(veryLongContent);

      // Should expand significantly on large screens
      cy.get('textarea').then(($textarea) => {
        const height = $textarea.outerHeight();
        expect(height).to.be.greaterThan(300);
      });
    });
  });

  describe('Responsive Edge Cases', () => {
    it('should handle viewport transitions smoothly', () => {
      cy.mount(`
        <div class="grid-row grid-gap">
          <div class="tablet:grid-col-6 desktop:grid-col-4">
            <usa-textarea
              id="transition-textarea"
              rows="5"
              auto-resize>
            </usa-textarea>
          </div>
        </div>
      `);

      const transitionText = 'This text will test smooth transitions between viewport sizes.';

      // Test mobile to tablet transition
      cy.viewport(375, 667);
      cy.get('textarea').type(transitionText).should('be.visible');

      cy.viewport(768, 1024);
      cy.get('textarea').should('be.visible').should('have.value', transitionText);

      cy.viewport(1200, 800);
      cy.get('textarea').should('be.visible').should('have.value', transitionText);
    });

    it('should handle long content without horizontal overflow', () => {
      const longLineText =
        'This is an extremely long line of text that should not cause horizontal scrolling or layout issues at any viewport size regardless of screen width or device orientation.';

      cy.mount(`
        <usa-textarea
          id="long-content-textarea"
          rows="3"
          wrap="hard">
        </usa-textarea>
      `);

      // Test at different viewports
      const viewports = [
        [320, 568], // Small mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.get('textarea').clear().type(longLineText);

        // Should not cause horizontal overflow
        cy.get('textarea').then(($textarea) => {
          expect($textarea[0].scrollWidth).to.be.at.most($textarea[0].clientWidth + 10);
        });
      });
    });

    it('should handle dynamic height changes at different screen sizes', () => {
      cy.mount(`
        <usa-textarea
          id="dynamic-height-textarea"
          auto-resize
          rows="2">
        </usa-textarea>
      `);

      const scenarios = [
        { viewport: [375, 667], content: 'Short content' },
        {
          viewport: [768, 1024],
          content: 'Medium length content\nWith multiple lines\nFor tablet testing',
        },
        {
          viewport: [1200, 800],
          content:
            'Very long content\nWith many lines\nFor desktop testing\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8',
        },
      ];

      scenarios.forEach(({ viewport, content }) => {
        cy.viewport(viewport[0], viewport[1]);
        cy.get('textarea').clear().type(content);

        // Should auto-resize appropriately
        cy.get('textarea').then(($textarea) => {
          const height = $textarea.outerHeight();
          const lineCount = content.split('\n').length;
          expect(height).to.be.greaterThan(lineCount * 15); // Rough estimate
        });
      });
    });

    it('should maintain accessibility at all screen sizes', () => {
      cy.mount(`
        <div>
          <label for="accessible-textarea">Accessible Textarea</label>
          <usa-textarea
            id="accessible-textarea"
            aria-describedby="textarea-hint"
            required>
          </usa-textarea>
          <div id="textarea-hint">This textarea should be accessible at all screen sizes</div>
        </div>
      `);

      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        cy.injectAxe();
        cy.checkAccessibility();

        // Check focus indicators work at all sizes
        cy.get('textarea')
          .focus()
          .should('have.focus')
          .should('have.css', 'outline-width')
          .and('not.equal', '0px');
      });
    });

    it('should handle copy-paste operations at different screen sizes', () => {
      cy.mount(`
        <usa-textarea
          id="copy-paste-textarea"
          rows="4"
          maxlength="500">
        </usa-textarea>
      `);

      const pasteContent =
        'This is pasted content\nWith multiple lines\nThat should work consistently\nAcross all screen sizes';

      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1200, 800], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);

        cy.get('textarea').clear().type(pasteContent);
        cy.get('textarea').should('have.value', pasteContent);

        // Select all and replace (simulating paste)
        cy.get('textarea').select().type('Replaced content at different viewport');
        cy.get('textarea').should('have.value', 'Replaced content at different viewport');
      });
    });
  });
});
