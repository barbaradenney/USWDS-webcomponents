// Component tests for usa-tooltip
import './index.ts';

describe('USA Tooltip Component Tests', () => {
  it('should render tooltip with default properties', () => {
    cy.mount(`
      <usa-tooltip text="This is a tooltip">
        <button>Hover me</button>
      </usa-tooltip>
    `);
    
    cy.get('usa-tooltip').should('exist');
    cy.get('.usa-tooltip').should('exist');
    cy.get('.usa-tooltip__body').should('exist');
    cy.get('.usa-tooltip__trigger').should('exist');
  });

  it('should show tooltip on hover', () => {
    cy.mount(`
      <usa-tooltip text="Hover tooltip text">
        <button>Hover me</button>
      </usa-tooltip>
    `);

    // Initially hidden
    cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');
    cy.get('.usa-tooltip__body').should('not.have.class', 'is-visible');
    
    // Hover to show
    cy.get('.usa-tooltip__trigger').trigger('mouseenter');
    cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
    cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
    cy.get('.usa-tooltip__body').should('contain.text', 'Hover tooltip text');
  });

  it('should hide tooltip on mouse leave', () => {
    cy.mount(`
      <usa-tooltip text="Hover tooltip text">
        <button>Hover me</button>
      </usa-tooltip>
    `);

    // Show tooltip first
    cy.get('.usa-tooltip__trigger').trigger('mouseenter');
    cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
    
    // Hide on mouse leave
    cy.get('.usa-tooltip__trigger').trigger('mouseleave');
    cy.get('.usa-tooltip__body').should('not.have.class', 'is-visible');
    cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'true');
  });

  it('should show tooltip on focus', () => {
    cy.mount(`
      <usa-tooltip text="Focus tooltip text">
        <button>Focus me</button>
      </usa-tooltip>
    `);

    cy.get('.usa-tooltip__trigger').focus();
    cy.get('.usa-tooltip__body').should('have.attr', 'aria-hidden', 'false');
    cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
  });

  it('should hide tooltip on blur', () => {
    cy.mount(`
      <usa-tooltip text="Focus tooltip text">
        <button>Focus me</button>
      </usa-tooltip>
    `);

    // Show tooltip first
    cy.get('.usa-tooltip__trigger').focus();
    cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
    
    // Hide on blur
    cy.get('.usa-tooltip__trigger').blur();
    cy.get('.usa-tooltip__body').should('not.have.class', 'is-visible');
  });

  it('should hide tooltip on Escape key', () => {
    cy.mount(`
      <usa-tooltip text="Escape tooltip text">
        <button>Press Escape</button>
      </usa-tooltip>
    `);

    // Show tooltip first
    cy.get('.usa-tooltip__trigger').trigger('mouseenter');
    cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
    
    // Hide on Escape key
    cy.get('body').type('{esc}');
    cy.get('.usa-tooltip__body').should('not.have.class', 'is-visible');
  });

  it('should handle different positions', () => {
    const positions = ['top', 'bottom', 'left', 'right'];
    
    positions.forEach(position => {
      cy.mount(`
        <usa-tooltip text="Position test" position="${position}">
          <button>Test ${position}</button>
        </usa-tooltip>
      `);

      cy.get('.usa-tooltip__trigger').trigger('mouseenter');
      cy.get('.usa-tooltip__body').should('have.class', `usa-tooltip__body--${position}`);
      cy.get('.usa-tooltip__trigger').trigger('mouseleave');
    });
  });

  it('should emit tooltip-show event', () => {
    cy.mount(`
      <usa-tooltip text="Event test tooltip">
        <button>Trigger events</button>
      </usa-tooltip>
    `);

    cy.window().then((win) => {
      const tooltip = win.document.querySelector('usa-tooltip') as any;
      const showSpy = cy.stub();
      tooltip.addEventListener('tooltip-show', showSpy);
      
      cy.get('.usa-tooltip__trigger').trigger('mouseenter');
      
      cy.then(() => {
        expect(showSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.text', 'Event test tooltip')
        );
      });
    });
  });

  it('should emit tooltip-hide event', () => {
    cy.mount(`
      <usa-tooltip text="Event test tooltip">
        <button>Trigger events</button>
      </usa-tooltip>
    `);

    cy.window().then((win) => {
      const tooltip = win.document.querySelector('usa-tooltip') as any;
      const hideSpy = cy.stub();
      tooltip.addEventListener('tooltip-hide', hideSpy);
      
      // Show first, then hide
      cy.get('.usa-tooltip__trigger').trigger('mouseenter');
      cy.get('.usa-tooltip__trigger').trigger('mouseleave');
      
      cy.then(() => {
        expect(hideSpy).to.have.been.calledWith(
          Cypress.sinon.match.hasNested('detail.text', 'Event test tooltip')
        );
      });
    });
  });

  it('should handle multiple trigger elements', () => {
    cy.mount(`
      <usa-tooltip text="Multiple triggers">
        <button>Button 1</button>
        <span>Span element</span>
        <div>Div element</div>
      </usa-tooltip>
    `);

    // All elements should get trigger class
    cy.get('.usa-tooltip__trigger').should('have.length', 3);
    
    // Each should be able to trigger tooltip
    cy.get('.usa-tooltip__trigger').each(($trigger) => {
      cy.wrap($trigger).trigger('mouseenter');
      cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
      cy.wrap($trigger).trigger('mouseleave');
      cy.get('.usa-tooltip__body').should('not.have.class', 'is-visible');
    });
  });

  it('should add tabindex to non-focusable elements', () => {
    cy.mount(`
      <usa-tooltip text="Tabindex test">
        <span>Non-focusable span</span>
        <div>Non-focusable div</div>
        <button>Already focusable</button>
      </usa-tooltip>
    `);

    // Non-focusable elements should get tabindex
    cy.get('span.usa-tooltip__trigger').should('have.attr', 'tabindex', '0');
    cy.get('div.usa-tooltip__trigger').should('have.attr', 'tabindex', '0');
    
    // Button should not get tabindex (already focusable)
    cy.get('button.usa-tooltip__trigger').should('not.have.attr', 'tabindex');
  });

  it('should handle aria-describedby correctly', () => {
    cy.mount(`
      <usa-tooltip text="Accessibility test">
        <button>Accessible button</button>
      </usa-tooltip>
    `);

    // Trigger should have aria-describedby pointing to tooltip
    cy.get('.usa-tooltip__trigger')
      .should('have.attr', 'aria-describedby')
      .then((describedBy) => {
        cy.get('.usa-tooltip__body').should('have.id', describedBy);
      });
  });

  it('should handle tooltip role and accessibility attributes', () => {
    cy.mount(`
      <usa-tooltip text="Role test">
        <button>Test button</button>
      </usa-tooltip>
    `);

    cy.get('.usa-tooltip__body')
      .should('have.attr', 'role', 'tooltip')
      .should('have.attr', 'aria-hidden', 'true');
  });

  it('should handle custom tooltip ID', () => {
    cy.mount(`
      <usa-tooltip text="Custom ID test" tooltip-id="custom-tooltip-123">
        <button>Custom ID</button>
      </usa-tooltip>
    `);

    cy.get('.usa-tooltip__body').should('have.id', 'custom-tooltip-123');
    cy.get('.usa-tooltip__trigger').should('have.attr', 'aria-describedby', 'custom-tooltip-123');
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-tooltip text="Custom classes" classes="custom-tooltip-class">
        <button>Custom styling</button>
      </usa-tooltip>
    `);

    cy.get('.usa-tooltip').should('have.class', 'custom-tooltip-class');
  });

  it('should handle programmatic show/hide methods', () => {
    cy.mount(`
      <usa-tooltip text="Manual control">
        <button>Manual tooltip</button>
      </usa-tooltip>
    `);

    cy.window().then((win) => {
      const tooltip = win.document.querySelector('usa-tooltip') as any;
      
      // Show programmatically
      tooltip.show();
      cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
      
      // Hide programmatically
      tooltip.hide();
      cy.get('.usa-tooltip__body').should('not.have.class', 'is-visible');
    });
  });

  it('should handle toggle method', () => {
    cy.mount(`
      <usa-tooltip text="Toggle control">
        <button>Toggle tooltip</button>
      </usa-tooltip>
    `);

    cy.window().then((win) => {
      const tooltip = win.document.querySelector('usa-tooltip') as any;
      
      // Toggle to show
      tooltip.toggle();
      cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
      
      // Toggle to hide
      tooltip.toggle();
      cy.get('.usa-tooltip__body').should('not.have.class', 'is-visible');
    });
  });

  it('should handle tooltip positioning calculations', () => {
    cy.mount(`
      <div style="margin: 100px; padding: 50px;">
        <usa-tooltip text="Positioning test" position="top">
          <button style="width: 100px; height: 40px;">Position test</button>
        </usa-tooltip>
      </div>
    `);

    cy.get('.usa-tooltip__trigger').trigger('mouseenter');
    
    // Should have positioning styles applied
    cy.get('.usa-tooltip__body').should('have.class', 'usa-tooltip__body--top');
    cy.get('.usa-tooltip__body').should('have.class', 'is-set');
    
    // Check that positioning styles are applied
    cy.get('.usa-tooltip__body').should(($el) => {
      const style = $el[0].style;
      expect(style.left).to.not.be.empty;
      expect(style.margin).to.not.be.empty;
    });
  });

  it('should handle dynamic text updates', () => {
    cy.mount(`
      <usa-tooltip id="dynamic-tooltip" text="Initial text">
        <button>Dynamic text</button>
      </usa-tooltip>
    `);

    cy.get('.usa-tooltip__body').should('contain.text', 'Initial text');
    
    cy.window().then((win) => {
      const tooltip = win.document.getElementById('dynamic-tooltip') as any;
      tooltip.text = 'Updated text';
    });
    
    cy.get('.usa-tooltip__body').should('contain.text', 'Updated text');
  });

  it('should handle positioning reset when hiding', () => {
    cy.mount(`
      <usa-tooltip text="Reset positioning" position="right">
        <button>Reset test</button>
      </usa-tooltip>
    `);

    // Show tooltip
    cy.get('.usa-tooltip__trigger').trigger('mouseenter');
    cy.get('.usa-tooltip__body').should('have.class', 'is-set');
    
    // Hide tooltip
    cy.get('.usa-tooltip__trigger').trigger('mouseleave');
    
    // Positioning should be reset
    cy.get('.usa-tooltip__body').should(($el) => {
      const style = $el[0].style;
      expect(style.top).to.equal('');
      expect(style.bottom).to.equal('');
      expect(style.left).to.equal('');
      expect(style.right).to.equal('');
      expect(style.margin).to.equal('');
    });
  });

  it('should prevent multiple shows when already visible', () => {
    cy.mount(`
      <usa-tooltip text="Multiple show prevention">
        <button>Multiple triggers</button>
      </usa-tooltip>
    `);

    cy.window().then((win) => {
      const tooltip = win.document.querySelector('usa-tooltip') as any;
      const showSpy = cy.stub();
      tooltip.addEventListener('tooltip-show', showSpy);
      
      // Trigger multiple show events
      cy.get('.usa-tooltip__trigger').trigger('mouseenter');
      cy.get('.usa-tooltip__trigger').trigger('mouseenter');
      cy.get('.usa-tooltip__trigger').trigger('mouseenter');
      
      cy.then(() => {
        // Should only fire once
        expect(showSpy).to.have.been.calledOnce;
      });
    });
  });

  it('should handle complex trigger content', () => {
    cy.mount(`
      <usa-tooltip text="Complex content tooltip">
        <div class="complex-trigger">
          <span class="icon">🔧</span>
          <span class="text">Complex trigger with icon</span>
        </div>
      </usa-tooltip>
    `);

    cy.get('.complex-trigger').should('have.class', 'usa-tooltip__trigger');
    
    // Should work with complex content
    cy.get('.complex-trigger').trigger('mouseenter');
    cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
    cy.get('.usa-tooltip__body').should('contain.text', 'Complex content tooltip');
  });

  it('should handle keyboard navigation', () => {
    cy.mount(`
      <div>
        <usa-tooltip text="First tooltip">
          <button>First button</button>
        </usa-tooltip>
        <usa-tooltip text="Second tooltip">
          <button>Second button</button>
        </usa-tooltip>
      </div>
    `);

    // Tab to first tooltip trigger
    cy.get('button').first().focus();
    cy.get('.usa-tooltip__body').first().should('have.class', 'is-visible');
    
    // Tab to second tooltip trigger
    cy.get('button').first().tab();
    cy.get('.usa-tooltip__body').first().should('not.have.class', 'is-visible');
    cy.get('.usa-tooltip__body').last().should('have.class', 'is-visible');
  });

  it('should handle tooltip with form elements', () => {
    cy.mount(`
      <form>
        <usa-tooltip text="Input help text">
          <input type="text" placeholder="Enter text">
        </usa-tooltip>
        <usa-tooltip text="Select help text">
          <select>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </usa-tooltip>
      </form>
    `);

    // Form elements should not get tabindex (already focusable)
    cy.get('input.usa-tooltip__trigger').should('not.have.attr', 'tabindex');
    cy.get('select.usa-tooltip__trigger').should('not.have.attr', 'tabindex');
    
    // Should work with form elements
    cy.get('input').focus();
    cy.get('.usa-tooltip__body').first().should('have.class', 'is-visible');
    
    cy.get('select').focus();
    cy.get('.usa-tooltip__body').first().should('not.have.class', 'is-visible');
    cy.get('.usa-tooltip__body').last().should('have.class', 'is-visible');
  });

  it('should cleanup event listeners on disconnect', () => {
    cy.mount(`
      <div id="tooltip-container">
        <usa-tooltip text="Cleanup test">
          <button>Remove me</button>
        </usa-tooltip>
      </div>
    `);

    cy.window().then((_win) => {

      // Verify tooltip exists and works
      cy.get('.usa-tooltip__trigger').trigger('mouseenter');
      cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
      
      // Remove tooltip from DOM
      container!.removeChild(tooltip);
      
      // Should not cause errors when removed
      cy.get('body').type('{esc}'); // This should not cause errors
    });
  });

  it('should be accessible', () => {
    cy.mount(`
      <div>
        <h2>Accessible Tooltip Example</h2>
        <p>Hover or focus the button below for more information.</p>
        <usa-tooltip text="This button performs a critical action. Please review before clicking.">
          <button type="button" aria-label="Submit form">
            Submit
          </button>
        </usa-tooltip>
      </div>
    `);

    cy.injectAxe();
    
    // Test with tooltip hidden
    cy.checkAccessibility();
    
    // Test with tooltip visible
    cy.get('.usa-tooltip__trigger').focus();
    cy.checkAccessibility();
  });

  it('should handle responsive positioning', () => {
    cy.mount(`
      <div style="position: relative; height: 300px; width: 300px; overflow: hidden;">
        <usa-tooltip text="Responsive tooltip" position="bottom">
          <button style="position: absolute; bottom: 10px; right: 10px;">
            Edge button
          </button>
        </usa-tooltip>
      </div>
    `);

    // Set small viewport
    cy.viewport(400, 400);
    
    cy.get('.usa-tooltip__trigger').trigger('mouseenter');
    cy.get('.usa-tooltip__body').should('have.class', 'usa-tooltip__body--bottom');
    cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
  });

  it('should handle touch interactions', () => {
    cy.mount(`
      <usa-tooltip text="Touch tooltip">
        <button>Touch me</button>
      </usa-tooltip>
    `);

    // Touch events should work similar to mouse events
    cy.get('.usa-tooltip__trigger').trigger('touchstart');
    // Note: Actual touch behavior may vary by implementation
    
    // Focus should still work on touch devices
    cy.get('.usa-tooltip__trigger').focus();
    cy.get('.usa-tooltip__body').should('have.class', 'is-visible');
  });
});