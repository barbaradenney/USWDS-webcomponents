// Component tests for usa-tag
import './index.ts';

describe('USA Tag Component Tests', () => {
  it('should render tag with default properties', () => {
    cy.mount(`<usa-tag id="test-tag" text="Default Tag"></usa-tag>`);

    cy.get('usa-tag').should('exist');
    cy.get('.usa-tag').should('exist');
    cy.get('.usa-tag').should('contain.text', 'Default Tag');
  });

  it('should render tag with slot content', () => {
    cy.mount(`<usa-tag id="test-tag">Slotted Content</usa-tag>`);

    cy.get('.usa-tag').should('contain.text', 'Slotted Content');
  });

  it('should prefer text property over slot content', () => {
    cy.mount(`<usa-tag id="test-tag" text="Text Property">Slot Content</usa-tag>`);

    cy.get('.usa-tag').should('contain.text', 'Text Property');
    cy.get('.usa-tag').should('not.contain.text', 'Slot Content');
  });

  it('should render big tag variant', () => {
    cy.mount(`<usa-tag id="test-tag" text="Big Tag" big></usa-tag>`);

    cy.get('.usa-tag').should('have.class', 'usa-tag--big');
  });

  it('should render normal size tag by default', () => {
    cy.mount(`<usa-tag id="test-tag" text="Normal Tag"></usa-tag>`);

    cy.get('.usa-tag').should('not.have.class', 'usa-tag--big');
  });

  it('should render removable tag', () => {
    cy.mount(`<usa-tag id="test-tag" text="Removable Tag" removable></usa-tag>`);

    cy.get('.usa-tag').should('have.class', 'usa-tag--removable');
    cy.get('.usa-tag__remove').should('exist');
    cy.get('.usa-tag__remove').should('have.attr', 'type', 'button');
    cy.get('.usa-tag__remove').should('have.attr', 'aria-label', 'Remove tag: Removable Tag');
  });

  it('should not render remove button for non-removable tags', () => {
    cy.mount(`<usa-tag id="test-tag" text="Static Tag"></usa-tag>`);

    cy.get('.usa-tag').should('not.have.class', 'usa-tag--removable');
    cy.get('.usa-tag__remove').should('not.exist');
  });

  it('should emit tag-remove event when remove button is clicked', () => {
    cy.mount(`<usa-tag id="test-tag" text="Remove Me" value="tag-123" removable></usa-tag>`);

    cy.window().then((win) => {
      const tag = win.document.getElementById('test-tag') as any;
      const removeSpy = cy.stub();
      tag.addEventListener('tag-remove', removeSpy);

      cy.get('.usa-tag__remove').click();

      cy.then(() => {
        expect(removeSpy).to.have.been.calledWith(
          Cypress.sinon.match({
            detail: Cypress.sinon.match({
              text: 'Remove Me',
              value: 'tag-123',
            }),
          })
        );
      });
    });
  });

  it('should remove tag from DOM when remove button is clicked', () => {
    cy.mount(`
      <div id="container">
        <usa-tag id="test-tag" text="Disappearing Tag" removable></usa-tag>
      </div>
    `);

    cy.get('usa-tag').should('exist');
    cy.get('.usa-tag__remove').click();
    cy.get('usa-tag').should('not.exist');
  });

  it('should handle remove button with keyboard interaction', () => {
    cy.mount(`<usa-tag id="test-tag" text="Keyboard Remove" removable></usa-tag>`);

    cy.window().then((win) => {
      const tag = win.document.getElementById('test-tag') as any;
      const removeSpy = cy.stub();
      tag.addEventListener('tag-remove', removeSpy);

      cy.get('.usa-tag__remove').focus().type('{enter}');

      cy.then(() => {
        expect(removeSpy).to.have.been.called;
      });
    });
  });

  it('should stop event propagation on remove', () => {
    cy.mount(`
      <div id="container">
        <usa-tag id="test-tag" text="Stop Propagation" removable></usa-tag>
      </div>
    `);

    cy.window().then((win) => {
      const container = win.document.getElementById('container');
      const containerClickSpy = cy.stub();
      container?.addEventListener('click', containerClickSpy);

      cy.get('.usa-tag__remove').click();

      cy.then(() => {
        // Container click should not be called due to stopPropagation
        expect(containerClickSpy).not.to.have.been.called;
      });
    });
  });

  it('should render remove button with proper SVG icon', () => {
    cy.mount(`<usa-tag id="test-tag" text="Icon Test" removable></usa-tag>`);

    cy.get('.usa-tag__remove .usa-icon').should('exist');
    cy.get('.usa-tag__remove .usa-icon')
      .should('have.attr', 'aria-hidden', 'true')
      .should('have.attr', 'focusable', 'false')
      .should('have.attr', 'role', 'img')
      .should('have.attr', 'viewBox', '0 0 24 24')
      .should('have.attr', 'width', '16')
      .should('have.attr', 'height', '16');

    cy.get('.usa-tag__remove .usa-icon path').should('exist');
  });

  it('should handle big removable tag', () => {
    cy.mount(`<usa-tag id="test-tag" text="Big Removable" big removable></usa-tag>`);

    cy.get('.usa-tag')
      .should('have.class', 'usa-tag--big')
      .should('have.class', 'usa-tag--removable');
    cy.get('.usa-tag__remove').should('exist');
  });

  it('should handle value property for identification', () => {
    cy.mount(`<usa-tag id="test-tag" text="Valued Tag" value="unique-id-123"></usa-tag>`);

    cy.window().then((win) => {
      const tag = win.document.getElementById('test-tag') as any;
      expect(tag.value).to.equal('unique-id-123');
    });
  });

  it('should handle empty text gracefully', () => {
    cy.mount(`<usa-tag id="test-tag" text=""></usa-tag>`);

    cy.get('.usa-tag').should('exist');
    cy.get('.usa-tag').should('be.empty');
  });

  it('should handle complex slotted content', () => {
    cy.mount(`
      <usa-tag id="test-tag">
        <span class="custom-content">
          <strong>Important</strong> Tag
        </span>
      </usa-tag>
    `);

    cy.get('.usa-tag .custom-content').should('exist');
    cy.get('.usa-tag strong').should('contain.text', 'Important');
  });

  it('should handle dynamic property updates', () => {
    cy.mount(`<usa-tag id="test-tag" text="Dynamic Tag"></usa-tag>`);

    cy.window().then((win) => {
      const tag = win.document.getElementById('test-tag') as any;

      // Initially not big
      cy.get('.usa-tag').should('not.have.class', 'usa-tag--big');

      // Change to big
      tag.big = true;
      cy.get('.usa-tag').should('have.class', 'usa-tag--big');

      // Initially not removable
      cy.get('.usa-tag__remove').should('not.exist');

      // Change to removable
      tag.removable = true;
      cy.get('.usa-tag').should('have.class', 'usa-tag--removable');
      cy.get('.usa-tag__remove').should('exist');

      // Update text
      tag.text = 'Updated Text';
      cy.get('.usa-tag').should('contain.text', 'Updated Text');
    });
  });

  it('should handle focus states on remove button', () => {
    cy.mount(`<usa-tag id="test-tag" text="Focus Test" removable></usa-tag>`);

    cy.get('.usa-tag__remove').focus();
    cy.focused().should('have.class', 'usa-tag__remove');
    cy.focused().should('be.visible');
  });

  it('should handle multiple tags in a group', () => {
    cy.mount(`
      <div class="tag-group">
        <usa-tag id="tag1" text="Tag 1" removable></usa-tag>
        <usa-tag id="tag2" text="Tag 2" big></usa-tag>
        <usa-tag id="tag3" text="Tag 3" removable big></usa-tag>
        <usa-tag id="tag4" text="Tag 4"></usa-tag>
      </div>
    `);

    cy.get('usa-tag').should('have.length', 4);
    cy.get('.usa-tag--big').should('have.length', 2);
    cy.get('.usa-tag--removable').should('have.length', 2);
    cy.get('.usa-tag__remove').should('have.length', 2);
  });

  it('should handle removal of multiple tags', () => {
    cy.mount(`
      <div class="tag-group">
        <usa-tag id="tag1" text="First Tag" removable></usa-tag>
        <usa-tag id="tag2" text="Second Tag" removable></usa-tag>
        <usa-tag id="tag3" text="Third Tag" removable></usa-tag>
      </div>
    `);

    cy.get('usa-tag').should('have.length', 3);

    // Remove first tag
    cy.get('#tag1 .usa-tag__remove').click();
    cy.get('usa-tag').should('have.length', 2);
    cy.get('#tag1').should('not.exist');

    // Remove second tag
    cy.get('#tag2 .usa-tag__remove').click();
    cy.get('usa-tag').should('have.length', 1);
    cy.get('#tag2').should('not.exist');

    // Third tag should still exist
    cy.get('#tag3').should('exist');
  });

  it.skip('should handle tag removal events in sequence', () => {
    // TODO: Fix this test - removeEvents is not defined
    cy.mount(`
      <div id="tag-container">
        <usa-tag id="tag1" text="Tag A" value="a" removable></usa-tag>
        <usa-tag id="tag2" text="Tag B" value="b" removable></usa-tag>
      </div>
    `);

    const removeEvents: any[] = [];
    cy.window().then((win) => {
      win.document.addEventListener('tag-remove', (e: Event) => {
        const customEvent = e as CustomEvent;
        removeEvents.push(customEvent.detail);
      });
    });

    cy.get('#tag1 .usa-tag__remove').click();
    cy.get('#tag2 .usa-tag__remove').click();

    cy.then(() => {
      expect(removeEvents).to.have.length(2);
      expect(removeEvents[0]).to.deep.equal({ text: 'Tag A', value: 'a' });
      expect(removeEvents[1]).to.deep.equal({ text: 'Tag B', value: 'b' });
    });
  });

  it('should handle accessibility correctly', () => {
    cy.mount(`
      <usa-tag 
        id="accessible-tag" 
        text="Accessible Removable Tag" 
        removable>
      </usa-tag>
    `);

    cy.get('.usa-tag__remove')
      .should('have.attr', 'type', 'button')
      .should('have.attr', 'aria-label', 'Remove tag: Accessible Removable Tag');

    cy.get('.usa-tag__remove .usa-icon')
      .should('have.attr', 'aria-hidden', 'true')
      .should('have.attr', 'focusable', 'false')
      .should('have.attr', 'role', 'img');
  });

  it('should handle keyboard navigation', () => {
    cy.mount(`
      <div>
        <usa-tag id="tag1" text="First Tag" removable></usa-tag>
        <usa-tag id="tag2" text="Second Tag" removable></usa-tag>
        <button id="next-element">Next Element</button>
      </div>
    `);

    // Tab through remove buttons
    cy.get('#tag1 .usa-tag__remove').focus();
    cy.focused().should('contain.text', '');
    cy.focused().should('have.attr', 'aria-label').and('include', 'First Tag');

    cy.focused().tab();
    cy.focused().should('have.attr', 'aria-label').and('include', 'Second Tag');

    cy.focused().tab();
    cy.focused().should('have.id', 'next-element');
  });

  it('should handle edge cases for remove functionality', () => {
    cy.mount(`<usa-tag id="test-tag" text="Edge Case Tag" removable></usa-tag>`);

    cy.window().then((win) => {
      const tag = win.document.getElementById('test-tag') as any;

      // Add multiple event listeners to test event handling
      const removeSpy1 = cy.stub();
      const removeSpy2 = cy.stub();
      tag.addEventListener('tag-remove', removeSpy1);
      tag.addEventListener('tag-remove', removeSpy2);

      cy.get('.usa-tag__remove').click();

      cy.then(() => {
        expect(removeSpy1).to.have.been.called;
        expect(removeSpy2).to.have.been.called;
      });
    });
  });

  it('should handle rapid click events', () => {
    cy.mount(`<usa-tag id="test-tag" text="Rapid Click Tag" removable></usa-tag>`);

    cy.window().then((win) => {
      const tag = win.document.getElementById('test-tag') as any;
      const removeSpy = cy.stub();
      tag.addEventListener('tag-remove', removeSpy);

      // Multiple rapid clicks should only trigger once (since tag gets removed)
      cy.get('.usa-tag__remove').click().click().click();

      cy.then(() => {
        expect(removeSpy).to.have.been.calledOnce;
      });

      // Tag should be removed
      cy.get('#test-tag').should('not.exist');
    });
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-tag 
        id="test-tag" 
        text="Custom Styled Tag"
        class="custom-tag-class special-styling"
        big>
      </usa-tag>
    `);

    cy.get('usa-tag')
      .should('have.class', 'custom-tag-class')
      .should('have.class', 'special-styling');
    cy.get('.usa-tag').should('exist').should('have.class', 'usa-tag--big');
  });

  it('should handle tag collections with mixed properties', () => {
    cy.mount(`
      <div class="mixed-tag-collection">
        <usa-tag text="Regular" value="regular"></usa-tag>
        <usa-tag text="Big Tag" value="big" big></usa-tag>
        <usa-tag text="Removable" value="removable" removable></usa-tag>
        <usa-tag text="Big Removable" value="big-removable" big removable></usa-tag>
        <usa-tag value="slotted-tag">
          <em>Slotted Content</em>
        </usa-tag>
      </div>
    `);

    cy.get('usa-tag').should('have.length', 5);

    // Check regular tag
    cy.get('usa-tag[value="regular"] .usa-tag')
      .should('not.have.class', 'usa-tag--big')
      .should('not.have.class', 'usa-tag--removable');

    // Check big tag
    cy.get('usa-tag[value="big"] .usa-tag')
      .should('have.class', 'usa-tag--big')
      .should('not.have.class', 'usa-tag--removable');

    // Check removable tag
    cy.get('usa-tag[value="removable"] .usa-tag')
      .should('not.have.class', 'usa-tag--big')
      .should('have.class', 'usa-tag--removable');

    // Check big removable tag
    cy.get('usa-tag[value="big-removable"] .usa-tag')
      .should('have.class', 'usa-tag--big')
      .should('have.class', 'usa-tag--removable');

    // Check slotted content
    cy.get('usa-tag[value="slotted-tag"] .usa-tag em').should('contain.text', 'Slotted Content');
  });

  it('should be accessible', () => {
    cy.mount(`
      <div>
        <h2>Selected Tags</h2>
        <p>Click the × button to remove unwanted tags:</p>
        <div class="usa-tag-list" role="list" aria-label="Selected tags">
          <usa-tag 
            text="Government Services" 
            value="gov-services" 
            removable
            role="listitem">
          </usa-tag>
          <usa-tag 
            text="Online Applications" 
            value="online-apps" 
            removable
            role="listitem">
          </usa-tag>
          <usa-tag 
            text="Forms & Documents" 
            value="forms-docs" 
            big 
            removable
            role="listitem">
          </usa-tag>
        </div>
      </div>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });
});
