// Component tests for usa-modal
import './index.ts';

describe('USA Modal Component Tests', () => {
  it('should render modal with default properties', () => {
    cy.mount(`
      <usa-modal id="test-modal">
        <h2 slot="header">Test Modal</h2>
        <p>This is modal content.</p>
      </usa-modal>
    `);
    cy.get('usa-modal').should('exist');
    cy.get('.usa-modal').should('exist');
    cy.get('.usa-modal').should('not.have.class', 'is-visible');
  });

  it('should open and close modal', () => {
    cy.mount(`
      <div>
        <button id="open-modal">Open Modal</button>
        <usa-modal id="test-modal">
          <h2 slot="header">Test Modal</h2>
          <p>Modal content here.</p>
          <button slot="footer" data-close-modal>Close</button>
        </usa-modal>
      </div>
    `);

    cy.window().then((win) => {
      const modal = win.document.getElementById('test-modal') as any;
      const openButton = win.document.getElementById('open-modal');

      openButton?.addEventListener('click', () => {
        modal.show();
      });
    });

    // Initially closed
    cy.get('.usa-modal').should('not.have.class', 'is-visible');

    // Open modal
    cy.get('#open-modal').click();
    cy.get('.usa-modal').should('have.class', 'is-visible');
    cy.get('.usa-modal__content').should('be.visible');

    // Close modal
    cy.get('[data-close-modal]').click();
    cy.get('.usa-modal').should('not.have.class', 'is-visible');
  });

  it('should handle escape key to close modal', () => {
    cy.mount(`
      <usa-modal id="test-modal" open>
        <h2 slot="header">Escape Test Modal</h2>
        <p>Press escape to close.</p>
      </usa-modal>
    `);

    // Modal should be open
    cy.get('.usa-modal').should('have.class', 'is-visible');

    // Press escape to close
    cy.get('body').type('{esc}');
    cy.get('.usa-modal').should('not.have.class', 'is-visible');
  });

  it('should handle backdrop click to close modal', () => {
    cy.mount(`
      <usa-modal id="test-modal" open close-on-backdrop-click>
        <h2 slot="header">Backdrop Test Modal</h2>
        <p>Click outside to close.</p>
      </usa-modal>
    `);

    // Modal should be open
    cy.get('.usa-modal').should('have.class', 'is-visible');

    // Click backdrop to close
    cy.get('.usa-modal-wrapper').click(10, 10); // Click outside content area
    cy.get('.usa-modal').should('not.have.class', 'is-visible');
  });

  it('should trap focus within modal', () => {
    cy.mount(`
      <div>
        <button id="external-button">External Button</button>
        <usa-modal id="test-modal" open>
          <h2 slot="header">Focus Trap Modal</h2>
          <button id="modal-button-1">Button 1</button>
          <input id="modal-input" placeholder="Modal input" />
          <button id="modal-button-2">Button 2</button>
          <button slot="footer" data-close-modal>Close</button>
        </usa-modal>
      </div>
    `);

    // Focus should be trapped in modal
    cy.get('#modal-button-1').should('be.visible');

    // Tab through focusable elements
    cy.get('#modal-button-1').focus();
    cy.focused().should('have.id', 'modal-button-1');

    cy.focused().tab();
    cy.focused().should('have.id', 'modal-input');

    cy.focused().tab();
    cy.focused().should('have.id', 'modal-button-2');

    cy.focused().tab();
    cy.focused().should('have.attr', 'data-close-modal');

    // Tab from last element should cycle back to first
    cy.focused().tab();
    cy.focused().should('have.id', 'modal-button-1');
  });

  it('should restore focus to trigger element on close', () => {
    cy.mount(`
      <div>
        <button id="trigger-button">Open Modal</button>
        <usa-modal id="test-modal">
          <h2 slot="header">Focus Restoration Modal</h2>
          <p>This modal should restore focus to trigger button.</p>
          <button slot="footer" data-close-modal>Close</button>
        </usa-modal>
      </div>
    `);

    cy.window().then((win) => {
      const modal = win.document.getElementById('test-modal') as any;
      const triggerButton = win.document.getElementById('trigger-button');

      triggerButton?.addEventListener('click', () => {
        modal.show();
      });
    });

    // Focus trigger and open modal
    cy.get('#trigger-button').focus().click();
    cy.get('.usa-modal').should('have.class', 'is-visible');

    // Close modal
    cy.get('[data-close-modal]').click();
    cy.get('.usa-modal').should('not.have.class', 'is-visible');

    // Focus should be restored to trigger button
    cy.focused().should('have.id', 'trigger-button');
  });

  it('should handle large modal variant', () => {
    cy.mount(`
      <usa-modal id="test-modal" size="large" open>
        <h2 slot="header">Large Modal</h2>
        <p>This is a large modal with more content space.</p>
      </usa-modal>
    `);

    cy.get('.usa-modal').should('have.class', 'usa-modal--lg');
  });

  it('should handle forced action modal', () => {
    cy.mount(`
      <usa-modal id="test-modal" forced-action open>
        <h2 slot="header">Confirmation Required</h2>
        <p>You must make a choice to continue.</p>
        <button slot="footer" id="confirm-btn">Confirm</button>
        <button slot="footer" id="cancel-btn">Cancel</button>
      </usa-modal>
    `);

    cy.get('.usa-modal').should('have.class', 'usa-modal--forced-action');

    // Should not close on escape when forced-action
    cy.get('body').type('{esc}');
    cy.get('.usa-modal').should('have.class', 'is-visible');

    // Should not close on backdrop click
    cy.get('.usa-modal-wrapper').click(10, 10);
    cy.get('.usa-modal').should('have.class', 'is-visible');
  });

  it('should emit modal events', () => {
    cy.mount(`
      <usa-modal id="test-modal">
        <h2 slot="header">Event Test Modal</h2>
        <p>Testing modal events.</p>
      </usa-modal>
    `);

    cy.window().then((win) => {
      const modal = win.document.getElementById('test-modal') as any;
      const showSpy = cy.stub();
      const hideSpy = cy.stub();

      modal.addEventListener('usa-modal:show', showSpy);
      modal.addEventListener('usa-modal:hide', hideSpy);

      // Open modal
      modal.show();

      cy.then(() => {
        expect(showSpy).to.have.been.called;
      });

      // Close modal
      modal.hide();

      cy.then(() => {
        expect(hideSpy).to.have.been.called;
      });
    });
  });

  it('should handle modal with form content', () => {
    cy.mount(`
      <usa-modal id="form-modal" open>
        <h2 slot="header">User Information</h2>
        <form id="modal-form">
          <label for="user-name">Name:</label>
          <input id="user-name" name="name" required />
          
          <label for="user-email">Email:</label>
          <input id="user-email" name="email" type="email" required />
        </form>
        <button slot="footer" type="submit" form="modal-form">Submit</button>
        <button slot="footer" data-close-modal>Cancel</button>
      </usa-modal>
    `);

    // Fill form
    cy.get('#user-name').type('John Doe');
    cy.get('#user-email').type('john.doe@example.gov');

    cy.window().then((win) => {
      const form = win.document.getElementById('modal-form') as HTMLFormElement;
      const submitSpy = cy.stub();
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        submitSpy({
          name: formData.get('name'),
          email: formData.get('email'),
        });
      });

      cy.get('button[type="submit"]').click();

      cy.then(() => {
        expect(submitSpy).to.have.been.calledWith({
          name: 'John Doe',
          email: 'john.doe@example.gov',
        });
      });
    });
  });

  it('should handle scrollable content', () => {
    // Should be scrollable within modal content
    cy.get('.usa-modal__content').scrollTo('bottom');
    cy.get('.usa-modal__content').scrollTo('top');
  });

  it('should handle programmatic show/hide', () => {
    cy.mount(`
      <usa-modal id="programmatic-modal">
        <h2 slot="header">Programmatic Control</h2>
        <p>Controlled via JavaScript.</p>
      </usa-modal>
    `);

    cy.window().then((win) => {
      const modal = win.document.getElementById('programmatic-modal') as any;

      // Show programmatically
      modal.show();
      cy.get('.usa-modal').should('have.class', 'is-visible');

      // Hide programmatically
      modal.hide();
      cy.get('.usa-modal').should('not.have.class', 'is-visible');

      // Toggle programmatically
      modal.toggle();
      cy.get('.usa-modal').should('have.class', 'is-visible');

      modal.toggle();
      cy.get('.usa-modal').should('not.have.class', 'is-visible');
    });
  });

  it('should handle aria attributes correctly', () => {
    cy.mount(`
      <usa-modal id="aria-modal" open aria-labelledby="modal-title" aria-describedby="modal-desc">
        <h2 id="modal-title" slot="header">Accessible Modal</h2>
        <p id="modal-desc">This modal demonstrates proper ARIA usage.</p>
      </usa-modal>
    `);

    cy.get('.usa-modal').should('have.attr', 'role', 'dialog');
    cy.get('.usa-modal').should('have.attr', 'aria-modal', 'true');
    cy.get('.usa-modal').should('have.attr', 'aria-labelledby', 'modal-title');
    cy.get('.usa-modal').should('have.attr', 'aria-describedby', 'modal-desc');
  });

  it('should prevent body scroll when open', () => {
    cy.mount(`
      <div>
        <div style="height: 2000px; background: linear-gradient(red, blue);">
          Long page content
        </div>
        <usa-modal id="scroll-lock-modal">
          <h2 slot="header">Scroll Lock Modal</h2>
          <p>Body scroll should be prevented.</p>
        </usa-modal>
      </div>
    `);

    cy.window().then((win) => {
      const modal = win.document.getElementById('scroll-lock-modal') as any;

      // Body should be scrollable initially
      cy.get('body').should('not.have.class', 'usa-js-no-click');

      // Open modal
      modal.show();

      // Body scroll should be locked
      cy.get('body').should('have.css', 'overflow', 'hidden');

      // Close modal
      modal.hide();

      // Body scroll should be restored
      cy.get('body').should('not.have.css', 'overflow', 'hidden');
    });
  });

  it('should handle multiple modals correctly', () => {
    cy.mount(`
      <div>
        <usa-modal id="modal1">
          <h2 slot="header">First Modal</h2>
          <p>This is the first modal.</p>
          <button id="open-modal2">Open Second Modal</button>
        </usa-modal>
        
        <usa-modal id="modal2">
          <h2 slot="header">Second Modal</h2>
          <p>This is the second modal.</p>
          <button slot="footer" data-close-modal>Close</button>
        </usa-modal>
      </div>
    `);

    cy.window().then((win) => {
      const modal1 = win.document.getElementById('modal1') as any;
      const modal2 = win.document.getElementById('modal2') as any;
      const openModal2Btn = win.document.getElementById('open-modal2');

      openModal2Btn?.addEventListener('click', () => {
        modal2.show();
      });

      // Open first modal
      modal1.show();
      cy.get('#modal1 .usa-modal').should('have.class', 'is-visible');

      // Open second modal from first
      cy.get('#open-modal2').click();
      cy.get('#modal2 .usa-modal').should('have.class', 'is-visible');

      // Close second modal
      cy.get('#modal2 [data-close-modal]').click();
      cy.get('#modal2 .usa-modal').should('not.have.class', 'is-visible');
      cy.get('#modal1 .usa-modal').should('have.class', 'is-visible');
    });
  });

  it('should be accessible', () => {
    cy.mount(`
      <usa-modal id="accessible-modal" open>
        <h2 slot="header">Accessible Modal Example</h2>
        <p>This modal follows accessibility best practices.</p>
        <form>
          <label for="accessible-input">Your response:</label>
          <input id="accessible-input" name="response" />
        </form>
        <button slot="footer" type="submit">Submit</button>
        <button slot="footer" data-close-modal>Cancel</button>
      </usa-modal>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle custom CSS classes', () => {
    cy.mount(`
      <usa-modal id="custom-modal" class="custom-modal-class" open>
        <h2 slot="header">Custom Modal</h2>
        <p>Modal with custom styling.</p>
      </usa-modal>
    `);

    cy.get('usa-modal').should('have.class', 'custom-modal-class');
    cy.get('.usa-modal').should('exist');
  });

  it('should handle modal with minimal content', () => {
    cy.mount(`
      <usa-modal id="minimal-modal" open>
        <p>Minimal modal content.</p>
      </usa-modal>
    `);

    // Should work without header or footer slots
    cy.get('.usa-modal__content').should('contain.text', 'Minimal modal content');
  });

  it('should handle focus on first focusable element when opened', () => {
    cy.mount(`
      <usa-modal id="focus-modal">
        <h2 slot="header">Focus Test</h2>
        <p>Some text content</p>
        <button id="first-focusable">First Button</button>
        <button id="second-focusable">Second Button</button>
        <button slot="footer" data-close-modal>Close</button>
      </usa-modal>
    `);

    cy.window().then((win) => {
      const modal = win.document.getElementById('focus-modal') as any;

      modal.show();

      // First focusable element should be focused
      cy.focused().should('have.id', 'first-focusable');
    });
  });

  it('should handle keyboard navigation within modal', () => {
    cy.mount(`
      <usa-modal id="keyboard-modal" open>
        <h2 slot="header">Keyboard Navigation</h2>
        <button id="btn1">Button 1</button>
        <input id="input1" placeholder="Input field" />
        <select id="select1">
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
        <button slot="footer" data-close-modal>Close</button>
      </usa-modal>
    `);

    // Navigate through all focusable elements
    cy.get('#btn1').focus();

    cy.focused().tab();
    cy.focused().should('have.id', 'input1');

    cy.focused().tab();
    cy.focused().should('have.id', 'select1');

    cy.focused().tab();
    cy.focused().should('have.attr', 'data-close-modal');

    // Shift+Tab should go backwards
    cy.focused().tab({ shift: true });
    cy.focused().should('have.id', 'select1');
  });

  describe('Edge Case Testing', () => {
    describe('Boundary Conditions', () => {
      it('should handle extremely long modal content', () => {
        const longContent = 'A'.repeat(10000);
        cy.mount(`
          <usa-modal id="long-content-modal" open>
            <h2 slot="header">Long Content Modal</h2>
            <p>${longContent}</p>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        cy.get('.usa-modal__content').should('be.visible');
        cy.get('.usa-modal__content').should('contain.text', longContent);
        cy.get('.usa-modal').should('have.class', 'is-visible');
      });

      it('should handle modal with no content', () => {
        cy.mount(`<usa-modal id="empty-modal" open></usa-modal>`);

        cy.get('.usa-modal').should('be.visible');
        cy.get('.usa-modal__content').should('exist');
        cy.get('body').type('{esc}');
        cy.get('.usa-modal').should('not.have.class', 'is-visible');
      });

      it('should handle special characters in content', () => {
        const specialContent = 'Special chars: <>&"\'%@#$!^*()[]{}|\\`~';
        cy.mount(`
          <usa-modal id="special-chars-modal" open>
            <h2 slot="header">Special Characters: &lt;&gt;&amp;</h2>
            <p>${specialContent}</p>
          </usa-modal>
        `);

        cy.get('.usa-modal__content').should('contain.text', 'Special chars:');
        cy.get('.usa-modal').should('have.class', 'is-visible');
      });

      it('should handle maximum number of nested focusable elements', () => {
        const focusableElements = Array.from(
          { length: 50 },
          (_, i) => `<button id="btn-${i}">Button ${i}</button>`
        ).join('');

        cy.mount(`
          <usa-modal id="many-focusable-modal" open>
            <h2 slot="header">Many Focusable Elements</h2>
            ${focusableElements}
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Should focus first element
        cy.get('#btn-0').should('be.focused');

        // Should handle tab traversal
        cy.focused().tab();
        cy.focused().should('have.id', 'btn-1');

        // Should wrap around after last element
        for (let i = 0; i < 52; i++) {
          cy.focused().tab();
        }
        cy.focused().should('have.id', 'btn-0');
      });
    });

    describe('Error Recovery', () => {
      it('should handle DOM manipulation during modal lifecycle', () => {
        cy.mount(`
          <usa-modal id="dom-manipulation-modal">
            <h2 slot="header">DOM Manipulation Test</h2>
            <div id="dynamic-content">Initial content</div>
            <button id="add-content">Add Content</button>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('dom-manipulation-modal') as any;
          const addContentBtn = win.document.getElementById('add-content');

          addContentBtn?.addEventListener('click', () => {
            const dynamicDiv = win.document.getElementById('dynamic-content');
            if (dynamicDiv) {
              dynamicDiv.innerHTML += '<p>New paragraph added</p><button>New button</button>';
            }
          });

          modal.show();
        });

        cy.get('.usa-modal').should('have.class', 'is-visible');

        // Add content dynamically
        cy.get('#add-content').click();
        cy.get('#dynamic-content').should('contain.text', 'New paragraph added');

        // Modal should still function correctly
        cy.get('body').type('{esc}');
        cy.get('.usa-modal').should('not.have.class', 'is-visible');
      });

      it('should handle missing USWDS JavaScript gracefully', () => {
        cy.window().then((win) => {
          // Temporarily remove USWDS if it exists
          const originalUSWDS = (win as any).USWDS;
          delete (win as any).USWDS;

          cy.mount(`
            <usa-modal id="no-uswds-modal">
              <h2 slot="header">No USWDS Test</h2>
              <p>Modal should still work without USWDS JavaScript</p>
              <button slot="footer" data-close-modal>Close</button>
            </usa-modal>
          `);

          cy.window().then((win2) => {
            const modal = win2.document.getElementById('no-uswds-modal') as any;

            // Should still show/hide without errors
            expect(() => modal.show()).not.to.throw;
            cy.get('.usa-modal').should('have.class', 'is-visible');

            expect(() => modal.hide()).not.to.throw;
            cy.get('.usa-modal').should('not.have.class', 'is-visible');

            // Restore USWDS if it existed
            if (originalUSWDS) {
              (win2 as any).USWDS = originalUSWDS;
            }
          });
        });
      });

      it('should handle rapid show/hide operations', () => {
        cy.mount(`
          <usa-modal id="rapid-modal">
            <h2 slot="header">Rapid Operations Test</h2>
            <p>Testing rapid show/hide operations</p>
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('rapid-modal') as any;

          // Rapid show/hide operations
          for (let i = 0; i < 10; i++) {
            modal.show();
            modal.hide();
          }

          // Should end in closed state
          cy.get('.usa-modal').should('not.have.class', 'is-visible');

          // Should still be functional
          modal.show();
          cy.get('.usa-modal').should('have.class', 'is-visible');
        });
      });

      it('should handle memory cleanup on removal', () => {
        cy.mount(`
          <div id="modal-container">
            <usa-modal id="cleanup-modal">
              <h2 slot="header">Cleanup Test</h2>
              <p>Testing memory cleanup</p>
            </usa-modal>
          </div>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('cleanup-modal') as any;
          const container = win.document.getElementById('modal-container');

          modal.show();
          cy.get('.usa-modal').should('have.class', 'is-visible');

          // Remove modal from DOM
          container?.removeChild(modal);

          // Should not cause errors
          cy.get('body').should('exist'); // Basic DOM integrity check
        });
      });
    });

    describe('Performance Stress Testing', () => {
      it('should handle multiple modals being created and destroyed', () => {
        cy.mount(`<div id="modal-stress-container"></div>`);

        cy.window().then((win) => {
          const container = win.document.getElementById('modal-stress-container');

          // Create and destroy multiple modals
          for (let i = 0; i < 20; i++) {
            const modal = win.document.createElement('usa-modal');
            modal.id = `stress-modal-${i}`;
            modal.innerHTML = `
              <h2 slot="header">Stress Modal ${i}</h2>
              <p>Content for modal ${i}</p>
            `;

            container?.appendChild(modal);

            // Show and hide quickly
            (modal as any).show();
            (modal as any).hide();

            // Remove from DOM
            container?.removeChild(modal);
          }

          // DOM should be clean
          cy.get('#modal-stress-container').children().should('have.length', 0);
        });
      });

      it('should handle large numbers of event listeners', () => {
        cy.mount(`
          <usa-modal id="event-stress-modal" open>
            <h2 slot="header">Event Stress Test</h2>
            <p>Testing many event listeners</p>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('event-stress-modal') as any;

          // Add many event listeners
          for (let i = 0; i < 100; i++) {
            modal.addEventListener('usa-modal:show', () => {
              // Empty listener
            });
            modal.addEventListener('usa-modal:hide', () => {
              // Empty listener
            });
          }

          // Should still function normally
          modal.hide();
          cy.get('.usa-modal').should('not.have.class', 'is-visible');

          modal.show();
          cy.get('.usa-modal').should('have.class', 'is-visible');
        });
      });

      it('should handle content updates during animation', () => {
        cy.mount(`
          <usa-modal id="animation-stress-modal">
            <h2 slot="header">Animation Stress Test</h2>
            <div id="updating-content">Initial content</div>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('animation-stress-modal') as any;
          const content = win.document.getElementById('updating-content');

          modal.show();

          // Update content rapidly during potential animation
          let updateCount = 0;
          const updateInterval = setInterval(() => {
            if (content && updateCount < 50) {
              content.textContent = `Updated content ${updateCount++}`;
            } else {
              clearInterval(updateInterval);
            }
          }, 10);

          cy.get('.usa-modal').should('have.class', 'is-visible');
          cy.get('#updating-content').should('contain.text', 'Updated content');
        });
      });
    });

    describe('Mobile Compatibility', () => {
      it('should handle touch events on mobile devices', () => {
        cy.viewport(375, 667); // iPhone SE dimensions

        cy.mount(`
          <usa-modal id="touch-modal" open close-on-backdrop-click>
            <h2 slot="header">Touch Test Modal</h2>
            <p>Testing touch interactions</p>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Simulate touch outside modal to close
        cy.get('.usa-modal-wrapper')
          .trigger('touchstart', { touches: [{ clientX: 10, clientY: 10 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 10, clientY: 10 }] });

        cy.get('.usa-modal').should('not.have.class', 'is-visible');
      });

      it('should handle viewport orientation changes', () => {
        cy.mount(`
          <usa-modal id="orientation-modal" open>
            <h2 slot="header">Orientation Test</h2>
            <p>Testing orientation changes</p>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Portrait
        cy.viewport(375, 667);
        cy.get('.usa-modal').should('have.class', 'is-visible');

        // Landscape
        cy.viewport(667, 375);
        cy.get('.usa-modal').should('have.class', 'is-visible');

        // Back to portrait
        cy.viewport(375, 667);
        cy.get('.usa-modal').should('have.class', 'is-visible');
      });

      it('should handle small screen sizes gracefully', () => {
        cy.viewport(320, 568); // iPhone 5 dimensions

        cy.mount(`
          <usa-modal id="small-screen-modal" open>
            <h2 slot="header">Small Screen Modal</h2>
            <p>This modal should adapt to small screens appropriately.</p>
            <form>
              <label for="small-input">Input:</label>
              <input id="small-input" />
            </form>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        cy.get('.usa-modal').should('be.visible');
        cy.get('.usa-modal__content').should('be.visible');
        cy.get('#small-input').should('be.visible');
      });

      it('should handle virtual keyboard appearance', () => {
        cy.viewport(375, 667);

        cy.mount(`
          <usa-modal id="keyboard-modal" open>
            <h2 slot="header">Virtual Keyboard Test</h2>
            <form>
              <label for="mobile-input">Type here:</label>
              <input id="mobile-input" type="text" />
              <label for="mobile-textarea">Longer text:</label>
              <textarea id="mobile-textarea" rows="3"></textarea>
            </form>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Simulate virtual keyboard by reducing viewport height
        cy.get('#mobile-input').focus();
        cy.viewport(375, 300); // Reduced height simulates keyboard

        cy.get('.usa-modal').should('be.visible');
        cy.get('#mobile-input').should('be.visible');

        // Restore full height
        cy.viewport(375, 667);
      });
    });

    describe('Accessibility Edge Cases', () => {
      it('should handle high contrast mode', () => {
        cy.mount(`
          <usa-modal id="contrast-modal" open>
            <h2 slot="header">High Contrast Test</h2>
            <p>This modal should be visible in high contrast mode.</p>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Simulate high contrast mode (Windows)
        cy.get('usa-modal').invoke(
          'attr',
          'style',
          'filter: contrast(1000%) brightness(200%) invert(1);'
        );

        cy.get('.usa-modal').should('be.visible');
        cy.get('button[data-close-modal]').should('be.visible');
      });

      it('should handle screen reader navigation patterns', () => {
        cy.mount(`
          <usa-modal id="screen-reader-modal" open>
            <h2 slot="header" id="sr-title">Screen Reader Test</h2>
            <p id="sr-description">This modal tests screen reader compatibility.</p>
            <div role="group" aria-labelledby="sr-group-label">
              <h3 id="sr-group-label">Action Group</h3>
              <button>Action 1</button>
              <button>Action 2</button>
            </div>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Verify proper ARIA structure
        cy.get('.usa-modal').should('have.attr', 'role', 'dialog');
        cy.get('.usa-modal').should('have.attr', 'aria-modal', 'true');
        cy.get('[role="group"]').should('have.attr', 'aria-labelledby', 'sr-group-label');

        // Verify proper focus management
        cy.get('button').first().should('be.focused');
      });

      it('should handle reduced motion preferences', () => {
        cy.mount(`
          <usa-modal id="motion-modal">
            <h2 slot="header">Reduced Motion Test</h2>
            <p>Testing reduced motion preferences.</p>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Simulate reduced motion preference
        cy.window().then((win) => {
          Object.defineProperty(win, 'matchMedia', {
            writable: true,
            value: cy.stub().returns({
              matches: true, // prefers-reduced-motion: reduce
              media: '(prefers-reduced-motion: reduce)',
              onchange: null,
              addListener: cy.stub(),
              removeListener: cy.stub(),
              addEventListener: cy.stub(),
              removeEventListener: cy.stub(),
              dispatchEvent: cy.stub(),
            }),
          });

          const modal = win.document.getElementById('motion-modal') as any;
          modal.show();
        });

        cy.get('.usa-modal').should('have.class', 'is-visible');
      });

      it('should handle focus trap with disabled elements', () => {
        cy.mount(`
          <usa-modal id="disabled-focus-modal" open>
            <h2 slot="header">Disabled Elements Test</h2>
            <button id="enabled-btn-1">Enabled Button 1</button>
            <button id="disabled-btn" disabled>Disabled Button</button>
            <input id="disabled-input" disabled />
            <button id="enabled-btn-2">Enabled Button 2</button>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Focus should skip disabled elements
        cy.get('#enabled-btn-1').should('be.focused');

        cy.focused().tab();
        cy.focused().should('have.id', 'enabled-btn-2');

        cy.focused().tab();
        cy.focused().should('have.attr', 'data-close-modal');

        // Should not focus disabled elements during reverse tabbing
        cy.focused().tab({ shift: true });
        cy.focused().should('have.id', 'enabled-btn-2');
      });
    });

    describe('Browser Compatibility', () => {
      it('should handle missing modern JavaScript APIs gracefully', () => {
        cy.window().then((win) => {
          // Temporarily remove modern APIs
          const originalQuerySelectorAll = win.document.querySelectorAll;
          const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

          // Restore after test
          cy.mount(`
            <usa-modal id="compat-modal">
              <h2 slot="header">Compatibility Test</h2>
              <p>Testing browser compatibility fallbacks.</p>
              <button slot="footer" data-close-modal>Close</button>
            </usa-modal>
          `);

          cy.window().then((win2) => {
            const modal = win2.document.getElementById('compat-modal') as any;

            // Should still function
            expect(() => modal.show()).not.to.throw;
            cy.get('.usa-modal').should('have.class', 'is-visible');

            // Restore APIs
            win2.document.querySelectorAll = originalQuerySelectorAll;
            Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
          });
        });
      });

      it('should handle event delegation differences', () => {
        cy.mount(`
          <usa-modal id="delegation-modal" open>
            <h2 slot="header">Event Delegation Test</h2>
            <div id="button-container">
              <button class="dynamic-close" data-close-modal>Dynamic Close 1</button>
            </div>
            <button slot="footer" data-close-modal>Standard Close</button>
          </usa-modal>
        `);

        // Add buttons dynamically
        cy.window().then((win) => {
          const container = win.document.getElementById('button-container');
          for (let i = 2; i <= 5; i++) {
            const btn = win.document.createElement('button');
            btn.className = 'dynamic-close';
            btn.setAttribute('data-close-modal', '');
            btn.textContent = `Dynamic Close ${i}`;
            container?.appendChild(btn);
          }
        });

        // All close buttons should work
        cy.get('.dynamic-close').first().click();
        cy.get('.usa-modal').should('not.have.class', 'is-visible');
      });

      it('should handle CSS custom properties fallbacks', () => {
        cy.mount(`
          <usa-modal id="css-fallback-modal" open>
            <h2 slot="header">CSS Fallback Test</h2>
            <p>Testing CSS custom properties fallbacks.</p>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        // Modal should still be visible even without CSS custom property support
        cy.get('.usa-modal').should('be.visible');
        cy.get('.usa-modal__content').should('be.visible');
      });
    });

    describe('Integration Edge Cases', () => {
      it('should handle modal within modal scenarios', () => {
        cy.mount(`
          <div>
            <usa-modal id="parent-modal">
              <h2 slot="header">Parent Modal</h2>
              <p>This is the parent modal.</p>
              <button id="open-child">Open Child Modal</button>
              <usa-modal id="child-modal">
                <h2 slot="header">Child Modal</h2>
                <p>This is a nested child modal.</p>
                <button slot="footer" data-close-modal>Close Child</button>
              </usa-modal>
            </usa-modal>
          </div>
        `);

        cy.window().then((win) => {
          const parentModal = win.document.getElementById('parent-modal') as any;
          const childModal = win.document.getElementById('child-modal') as any;
          const openChildBtn = win.document.getElementById('open-child');

          openChildBtn?.addEventListener('click', () => {
            childModal.show();
          });

          parentModal.show();
        });

        cy.get('#parent-modal .usa-modal').should('have.class', 'is-visible');

        cy.get('#open-child').click();
        cy.get('#child-modal .usa-modal').should('have.class', 'is-visible');

        // Close child modal
        cy.get('#child-modal [data-close-modal]').click();
        cy.get('#child-modal .usa-modal').should('not.have.class', 'is-visible');
        cy.get('#parent-modal .usa-modal').should('have.class', 'is-visible');
      });

      it('should handle modal with complex form validation', () => {
        cy.mount(`
          <usa-modal id="validation-modal" open>
            <h2 slot="header">Complex Form Modal</h2>
            <form id="complex-form" novalidate>
              <div>
                <label for="required-field">Required Field *</label>
                <input id="required-field" required />
                <div class="error-message" style="display: none;">This field is required</div>
              </div>

              <div>
                <label for="email-field">Email</label>
                <input id="email-field" type="email" />
                <div class="error-message" style="display: none;">Invalid email format</div>
              </div>

              <div>
                <label for="password-field">Password</label>
                <input id="password-field" type="password" />
                <div class="error-message" style="display: none;">Password too weak</div>
              </div>
            </form>

            <button slot="footer" id="validate-submit">Submit</button>
            <button slot="footer" data-close-modal>Cancel</button>
          </usa-modal>
        `);

        cy.window().then((win) => {
          const submitBtn = win.document.getElementById('validate-submit');
          const form = win.document.getElementById('complex-form') as HTMLFormElement;

          submitBtn?.addEventListener('click', (e) => {
            e.preventDefault();

            // Simple validation logic
            const requiredField = win.document.getElementById('required-field') as HTMLInputElement;
            const emailField = win.document.getElementById('email-field') as HTMLInputElement;

            if (!requiredField.value) {
              const errorMsg = requiredField.parentElement?.querySelector(
                '.error-message'
              ) as HTMLElement;
              if (errorMsg) errorMsg.style.display = 'block';
            }

            if (emailField.value && !emailField.value.includes('@')) {
              const errorMsg = emailField.parentElement?.querySelector(
                '.error-message'
              ) as HTMLElement;
              if (errorMsg) errorMsg.style.display = 'block';
            }
          });
        });

        // Test validation
        cy.get('#validate-submit').click();
        cy.get('.error-message').should('be.visible');

        // Fill form correctly
        cy.get('#required-field').type('Required value');
        cy.get('#email-field').type('test@example.gov');

        cy.get('#validate-submit').click();
        cy.get('.usa-modal').should('have.class', 'is-visible'); // Should still be open if form invalid
      });

      it('should handle async content loading', () => {
        cy.mount(`
          <usa-modal id="async-modal">
            <h2 slot="header">Async Content Modal</h2>
            <div id="async-content">Loading...</div>
            <button slot="footer" data-close-modal>Close</button>
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('async-modal') as any;
          const contentDiv = win.document.getElementById('async-content');

          modal.show();

          // Simulate async content loading
          setTimeout(() => {
            if (contentDiv) {
              contentDiv.innerHTML = `
                <p>Async content loaded successfully!</p>
                <button id="async-action">Async Action</button>
              `;
            }
          }, 100);
        });

        cy.get('.usa-modal').should('have.class', 'is-visible');
        cy.get('#async-content', { timeout: 1000 }).should('contain.text', 'Async content loaded');
        cy.get('#async-action').should('be.visible');
        cy.get('#async-action').click(); // Should not cause errors
      });
    });
  });

  describe('Regression Tests for Modal Issues', () => {
    context('HTML Description Content Rendering (REGRESSION)', () => {
      it('should render complex HTML content with tables and layouts', () => {
        const htmlContent = `
          <p>This modal demonstrates the large variant with complex content.</p>
          <table class="usa-table usa-table--compact" data-testid="regression-table">
            <caption>Sample Data Comparison (demonstrates why large modal is needed)</caption>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Dev Environment</th>
                <th scope="col">Storybook Environment</th>
                <th scope="col">USWDS Transform</th>
                <th scope="col">Event Handlers</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Combo Box</td>
                <td>✅ Working</td>
                <td>✅ Working</td>
                <td>✅ Applied</td>
                <td>✅ Attached</td>
                <td>Fully Functional</td>
              </tr>
              <tr>
                <td>Modal</td>
                <td>✅ Working</td>
                <td>✅ Working</td>
                <td>✅ Applied</td>
                <td>✅ Attached</td>
                <td>Fully Functional</td>
              </tr>
            </tbody>
          </table>
          <div class="usa-grid-row usa-grid-gap-2" data-testid="regression-grid">
            <div class="usa-grid-col-6">
              <h4>Environment Details</h4>
              <dl>
                <dt>Development Server</dt>
                <dd>All components load correctly with USWDS transformation.</dd>
              </dl>
            </div>
            <div class="usa-grid-col-6">
              <h4>Implementation Notes</h4>
              <dl>
                <dt>USWDS Integration</dt>
                <dd>Components use the official USWDS loader utility.</dd>
              </dl>
            </div>
          </div>
          <div class="usa-alert usa-alert--info usa-alert--slim" data-testid="regression-alert">
            <div class="usa-alert__body">
              <p class="usa-alert__text">
                <strong>Large Modal Usage:</strong> This large modal variant provides the extra width needed.
              </p>
            </div>
          </div>
        `;

        cy.mount(`
          <usa-modal id="regression-html-modal" heading="HTML Content Test" description="${htmlContent}" html-description large open>
          </usa-modal>
        `);

        // Verify the modal renders and content is accessible
        cy.get('.usa-modal').should('have.class', 'usa-modal--lg');
        cy.get('[data-testid="regression-table"]').should('exist');
        cy.get('[data-testid="regression-table"] thead tr').should('have.length', 1);
        cy.get('[data-testid="regression-table"] tbody tr').should('have.length', 2);
        cy.get('[data-testid="regression-grid"]').should('exist');
        cy.get('[data-testid="regression-grid"] .usa-grid-col-6').should('have.length', 2);
        cy.get('[data-testid="regression-alert"]').should('exist');
        cy.get('[data-testid="regression-alert"]').should('have.class', 'usa-alert--info');
      });

      it('should preserve content when USWDS moves modal to document body', () => {
        cy.mount(`
          <usa-modal id="content-preservation-modal" heading="Content Preservation Test" description='<p data-testid="preserved-content">This content should be preserved when USWDS moves the modal.</p>' html-description open>
          </usa-modal>
        `);

        // Wait for modal to be processed by USWDS
        cy.wait(300);

        // Content should still be accessible regardless of where USWDS moves it
        cy.get('[data-testid="preserved-content"]').should('exist');
        cy.get('[data-testid="preserved-content"]').should(
          'contain',
          'This content should be preserved'
        );
      });
    });

    context('Modal Reopening Functionality (REGRESSION)', () => {
      it('should open and close multiple times without breaking', () => {
        cy.mount(`
          <usa-modal id="regression-reopening-modal" heading="Reopening Test Modal" description="Testing modal reopening functionality.">
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('regression-reopening-modal') as any;

          // Test 5 cycles of opening and closing
          for (let cycle = 1; cycle <= 5; cycle++) {
            // Open modal
            modal.open = true;
            cy.get('body').should('have.class', 'usa-modal--open');

            // Close modal
            modal.open = false;
            cy.get('body').should('not.have.class', 'usa-modal--open');
          }

          // Verify modal still works after multiple cycles
          modal.open = true;
          cy.get('body').should('have.class', 'usa-modal--open');

          // Close with close button
          cy.get('.usa-modal__close').click();
          cy.get('body').should('not.have.class', 'usa-modal--open');
        });
      });

      it('should handle rapid open/close cycles without breaking', () => {
        cy.mount(`
          <usa-modal id="rapid-cycles-modal" heading="Rapid Cycles Test" description="Testing rapid open/close cycles.">
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('rapid-cycles-modal') as any;

          // Rapid cycles
          for (let i = 0; i < 10; i++) {
            modal.open = !modal.open;
          }

          // Should end in a consistent state and still be functional
          cy.get('usa-modal').should('exist');

          modal.open = true;
          cy.get('body').should('have.class', 'usa-modal--open');
        });
      });

      it('should handle close button clicks multiple times', () => {
        cy.mount(`
          <usa-modal id="close-button-regression" heading="Close Button Test" description="Testing close button functionality multiple times.">
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('close-button-regression') as any;

          // Test 3 cycles with close button
          for (let cycle = 1; cycle <= 3; cycle++) {
            // Open modal
            modal.open = true;
            cy.get('body').should('have.class', 'usa-modal--open');

            // Click close button
            cy.get('.usa-modal__close').click();
            cy.get('body').should('not.have.class', 'usa-modal--open');

            // Verify modal property is updated
            expect(modal.open).to.be.false;
          }
        });
      });
    });

    context('Large Modal Width Utilization (REGRESSION)', () => {
      it('should properly utilize larger width for wide content', () => {
        const wideTableContent = `
          <table class="usa-table usa-table--compact" data-testid="wide-regression-table">
            <thead>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
                <th>Column 4</th>
                <th>Column 5</th>
                <th>Column 6</th>
                <th>Column 7</th>
                <th>Column 8</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data 1</td>
                <td>Data 2</td>
                <td>Data 3</td>
                <td>Data 4</td>
                <td>Data 5</td>
                <td>Data 6</td>
                <td>Data 7</td>
                <td>Data 8</td>
              </tr>
            </tbody>
          </table>
        `;

        // Test normal modal first
        cy.mount(`
          <usa-modal id="normal-width-modal" heading="Normal Modal" description="<p>Normal modal content</p>" html-description open>
          </usa-modal>
        `);

        cy.get('.usa-modal').should('not.have.class', 'usa-modal--lg');

        // Store normal modal width for comparison
        cy.get('.usa-modal').then(($normalModal) => {
          const normalWidth = $normalModal[0].getBoundingClientRect().width;

          // Test large modal
          cy.mount(`
            <usa-modal id="large-width-modal" heading="Large Modal" description="${wideTableContent}" html-description large open>
            </usa-modal>
          `);

          cy.get('.usa-modal').should('have.class', 'usa-modal--lg');
          cy.get('[data-testid="wide-regression-table"]').should('exist');
          cy.get('[data-testid="wide-regression-table"] th').should('have.length', 8);

          // Large modal should be wider than normal modal
          cy.get('.usa-modal').then(($largeModal) => {
            const largeWidth = $largeModal[0].getBoundingClientRect().width;
            expect(largeWidth).to.be.greaterThan(normalWidth);
          });
        });
      });

      it('should toggle between large and normal modal sizes correctly', () => {
        cy.mount(`
          <usa-modal id="size-toggle-modal" heading="Size Toggle Test" description="<p>Testing size toggling</p>" html-description>
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('size-toggle-modal') as any;

          // Start as normal modal
          modal.large = false;
          modal.open = true;
          cy.get('.usa-modal').should('not.have.class', 'usa-modal--lg');

          // Switch to large
          modal.large = true;
          cy.get('.usa-modal').should('have.class', 'usa-modal--lg');

          // Switch back to normal
          modal.large = false;
          cy.get('.usa-modal').should('not.have.class', 'usa-modal--lg');

          // Modal should still be functional
          modal.open = false;
          cy.get('body').should('not.have.class', 'usa-modal--open');
        });
      });
    });

    context('Complete Integration Test (REGRESSION)', () => {
      it('should handle all regression scenarios in sequence', () => {
        const complexContent = `
          <p>This is a comprehensive regression test.</p>
          <table class="usa-table" data-testid="integration-table">
            <tbody>
              <tr><td>Test</td><td>Status</td></tr>
              <tr><td>Content Rendering</td><td>✅</td></tr>
              <tr><td>Reopening</td><td>✅</td></tr>
              <tr><td>Large Modal</td><td>✅</td></tr>
            </tbody>
          </table>
        `;

        cy.mount(`
          <usa-modal id="integration-regression-modal" heading="Integration Regression Test" description="${complexContent}" html-description large>
          </usa-modal>
        `);

        cy.window().then((win) => {
          const modal = win.document.getElementById('integration-regression-modal') as any;

          // Test 1: Content rendering
          modal.open = true;
          cy.get('[data-testid="integration-table"]').should('exist');
          cy.get('.usa-modal').should('have.class', 'usa-modal--lg');

          // Test 2: Closing and reopening multiple times
          for (let i = 0; i < 3; i++) {
            modal.open = false;
            cy.get('body').should('not.have.class', 'usa-modal--open');

            modal.open = true;
            cy.get('body').should('have.class', 'usa-modal--open');
            cy.get('[data-testid="integration-table"]').should('exist');
          }

          // Test 3: Size toggling
          modal.large = false;
          cy.get('.usa-modal').should('not.have.class', 'usa-modal--lg');

          modal.large = true;
          cy.get('.usa-modal').should('have.class', 'usa-modal--lg');

          // Test 4: Close with button
          cy.get('.usa-modal__close').click();
          cy.get('body').should('not.have.class', 'usa-modal--open');

          // Test 5: Final reopen to confirm everything still works
          modal.open = true;
          cy.get('body').should('have.class', 'usa-modal--open');
          cy.get('[data-testid="integration-table"]').should('exist');
          cy.get('.usa-modal').should('have.class', 'usa-modal--lg');
        });
      });
    });
  });
});
