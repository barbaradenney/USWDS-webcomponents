// Comprehensive Behavioral Tests for usa-modal
// Focus on visual rendering, interaction triggers, modal overlay behavior, and user experience
import './index.ts';

describe('USA Modal - Comprehensive Behavioral Tests', () => {
  beforeEach(() => {
    // Ignore script errors from USWDS JavaScript attempts
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Script error')) {
        return false;
      }
    });
  });

  describe('Modal Visibility and Display Verification', () => {
    it('should be completely invisible when closed and fully visible when opened', () => {
      cy.mount(`
        <div>
          <button id="open-button">Open Modal</button>
          <usa-modal
            id="test-modal"
            heading="Test Modal"
            description="This is a test modal"
            primary-button-text="Confirm"
            secondary-button-text="Cancel">
            <p>Modal content here</p>
          </usa-modal>
        </div>
      `);

      // Initially modal should be completely hidden
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');
      cy.get('#test-modal .usa-modal-wrapper').should('not.be.visible');

      // Programmatically open modal
      cy.get('#test-modal').then(($modal) => {
        $modal[0].openModal();
      });

      // Modal should now be fully visible
      cy.get('#test-modal .usa-modal-wrapper').should('not.have.class', 'is-hidden');
      cy.get('#test-modal .usa-modal-wrapper').should('be.visible');

      // Modal content should be visible
      cy.get('#test-modal .usa-modal').should('be.visible');
      cy.get('#test-modal .usa-modal__content').should('be.visible');
      cy.get('#test-modal .usa-modal__heading')
        .should('be.visible')
        .and('contain.text', 'Test Modal');
      cy.get('#test-modal .usa-modal__main')
        .should('be.visible')
        .and('contain.text', 'Modal content here');
    });

    it('should verify modal overlay is actually rendered and covers viewport', () => {
      cy.mount(`
        <div>
          <div style="height: 200px; background: red;">Background content</div>
          <usa-modal
            id="test-modal"
            heading="Test Modal"
            open
            primary-button-text="OK">
            <p>Modal content</p>
          </usa-modal>
        </div>
      `);

      // Modal wrapper should cover entire viewport
      cy.get('#test-modal .usa-modal-wrapper').then(($wrapper) => {
        const rect = $wrapper[0].getBoundingClientRect();
        const viewportWidth = Cypress.config('viewportWidth');
        const viewportHeight = Cypress.config('viewportHeight');

        // Should cover full viewport
        expect(rect.left).to.equal(0);
        expect(rect.top).to.equal(0);
        expect(rect.width).to.equal(viewportWidth);
        expect(rect.height).to.equal(viewportHeight);
      });

      // Modal should have proper overlay styling
      cy.get('#test-modal .usa-modal-wrapper').should('have.css', 'position', 'fixed');
      cy.get('#test-modal .usa-modal-wrapper')
        .should('have.css', 'z-index')
        .then((zIndex) => {
          expect(parseInt(zIndex)).to.be.greaterThan(1000); // High z-index for overlay
        });
    });

    it('should verify modal content is properly positioned and not off-screen', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Very Long Modal Heading That Might Cause Layout Issues"
          description="This is a very long description that tests whether the modal content remains properly positioned within the viewport boundaries"
          open
          primary-button-text="Primary Action"
          secondary-button-text="Secondary Action">
          <div style="height: 300px;">
            <p>This is modal content with significant height to test positioning.</p>
            <p>More content to test scrolling behavior if needed.</p>
          </div>
        </usa-modal>
      `);

      // Modal content should be centered and within viewport
      cy.get('#test-modal .usa-modal').then(($modal) => {
        const rect = $modal[0].getBoundingClientRect();
        const viewportWidth = Cypress.config('viewportWidth');
        const viewportHeight = Cypress.config('viewportHeight');

        // Modal should be within viewport bounds
        expect(rect.left).to.be.greaterThan(0);
        expect(rect.top).to.be.greaterThan(0);
        expect(rect.right).to.be.lessThan(viewportWidth);
        expect(rect.bottom).to.be.lessThan(viewportHeight);

        // Modal should be reasonably centered horizontally
        const centerX = rect.left + rect.width / 2;
        const viewportCenterX = viewportWidth / 2;
        expect(Math.abs(centerX - viewportCenterX)).to.be.lessThan(100);
      });
    });

    it('should verify all modal elements have proper dimensions and are not collapsed', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Test Modal"
          description="Modal description"
          open
          primary-button-text="Primary"
          secondary-button-text="Secondary">
          <p>Modal body content</p>
        </usa-modal>
      `);

      // Modal itself should have reasonable dimensions
      cy.get('#test-modal .usa-modal').then(($modal) => {
        const rect = $modal[0].getBoundingClientRect();
        expect(rect.width).to.be.greaterThan(300); // Minimum width
        expect(rect.height).to.be.greaterThan(200); // Minimum height
      });

      // Individual elements should have content and dimensions
      cy.get('#test-modal .usa-modal__heading')
        .should('contain.text', 'Test Modal')
        .then(($heading) => {
          const rect = $heading[0].getBoundingClientRect();
          expect(rect.height).to.be.greaterThan(20);
        });

      cy.get('#test-modal .usa-modal__main')
        .should('contain.text', 'Modal body content')
        .then(($main) => {
          const rect = $main[0].getBoundingClientRect();
          expect(rect.height).to.be.greaterThan(20);
        });

      // Buttons should be properly sized
      cy.get('#test-modal .usa-modal__footer .usa-button').each(($button) => {
        cy.wrap($button).then(($btn) => {
          const rect = $btn[0].getBoundingClientRect();
          expect(rect.width).to.be.greaterThan(60);
          expect(rect.height).to.be.greaterThan(30);
        });
      });
    });
  });

  describe('Interaction Triggers and Click Behavior', () => {
    it('should verify close button actually closes modal with visual confirmation', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Test Modal"
          open
          primary-button-text="OK">
          <p>Modal content</p>
        </usa-modal>
      `);

      // Modal should be visible initially
      cy.get('#test-modal .usa-modal-wrapper').should('be.visible');
      cy.get('#test-modal .usa-modal').should('be.visible');

      // Click close button
      cy.get('#test-modal .usa-modal__close').should('be.visible').click();

      // Modal should be completely hidden
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');
      cy.get('#test-modal .usa-modal-wrapper').should('not.be.visible');
    });

    it('should verify overlay click closes modal (click outside content)', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Test Modal"
          open
          primary-button-text="OK">
          <p>Modal content</p>
        </usa-modal>
      `);

      // Modal should be visible
      cy.get('#test-modal .usa-modal').should('be.visible');

      // Click on overlay area (outside modal content)
      cy.get('#test-modal .usa-modal-wrapper').click(10, 10); // Click near edge

      // Modal should close
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should verify primary and secondary buttons trigger correct events and close modal', () => {
      let primaryClicked = false;
      let secondaryClicked = false;
      let modalClosed = false;

      cy.mount(
        `
        <usa-modal
          id="test-modal"
          heading="Test Modal"
          open
          primary-button-text="Confirm"
          secondary-button-text="Cancel">
          <p>Choose an action</p>
        </usa-modal>
      `
      ).then(() => {
        // Set up event listeners
        cy.get('#test-modal').then(($modal) => {
          $modal[0].addEventListener('modal-primary-action', () => {
            primaryClicked = true;
          });
          $modal[0].addEventListener('modal-secondary-action', () => {
            secondaryClicked = true;
          });
          $modal[0].addEventListener('modal-close', () => {
            modalClosed = true;
          });
        });
      });

      // Test primary button
      cy.get('#test-modal .usa-button--primary').should('contain.text', 'Confirm').click();
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');

      // Reopen for secondary test
      cy.get('#test-modal').then(($modal) => {
        $modal[0].openModal();
      });
      cy.get('#test-modal .usa-modal').should('be.visible');

      // Test secondary button
      cy.get('#test-modal .usa-button')
        .not('.usa-button--primary')
        .should('contain.text', 'Cancel')
        .click();
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');

      // Verify events were triggered
      cy.then(() => {
        expect(primaryClicked).to.be.true;
        expect(secondaryClicked).to.be.true;
        expect(modalClosed).to.be.true;
      });
    });

    it('should verify keyboard navigation and escape key behavior', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Test Modal"
          open
          primary-button-text="OK"
          secondary-button-text="Cancel">
          <p>Modal content</p>
        </usa-modal>
      `);

      // Modal should be visible
      cy.get('#test-modal .usa-modal').should('be.visible');

      // ESC key should close modal
      cy.get('body').type('{esc}');
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');

      // Reopen modal
      cy.get('#test-modal').then(($modal) => {
        $modal[0].openModal();
      });

      // Tab navigation should work within modal
      cy.get('#test-modal .usa-modal__close').should('be.focused');
      cy.get('body').tab();
      cy.get('#test-modal .usa-button').first().should('be.focused');
    });

    it('should verify modal can be opened and closed programmatically', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Test Modal"
          primary-button-text="OK">
          <p>Modal content</p>
        </usa-modal>
      `);

      // Initially closed
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');

      // Open programmatically
      cy.get('#test-modal').then(($modal) => {
        $modal[0].openModal();
      });
      cy.get('#test-modal .usa-modal').should('be.visible');

      // Close programmatically
      cy.get('#test-modal').then(($modal) => {
        $modal[0].closeModal();
      });
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should verify property-based opening and closing', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Test Modal"
          primary-button-text="OK">
          <p>Modal content</p>
        </usa-modal>
      `);

      // Set open property to true
      cy.get('#test-modal').then(($modal) => {
        $modal[0].open = true;
      });
      cy.get('#test-modal .usa-modal').should('be.visible');

      // Set open property to false
      cy.get('#test-modal').then(($modal) => {
        $modal[0].open = false;
      });
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');
    });
  });

  describe('Focus Management and Accessibility', () => {
    it('should verify focus trap works correctly within modal', () => {
      cy.mount(`
        <div>
          <button id="external-button">External Button</button>
          <usa-modal
            id="test-modal"
            heading="Test Modal"
            open
            primary-button-text="OK"
            secondary-button-text="Cancel">
            <input type="text" placeholder="Test input" />
          </usa-modal>
        </div>
      `);

      // Close button should be focused initially
      cy.get('#test-modal .usa-modal__close').should('be.focused');

      // Tab through modal elements
      cy.get('body').tab();
      cy.get('#test-modal input').should('be.focused');

      cy.get('body').tab();
      cy.get('#test-modal .usa-button').first().should('be.focused');

      cy.get('body').tab();
      cy.get('#test-modal .usa-button').last().should('be.focused');

      // Tab should cycle back to close button (focus trap)
      cy.get('body').tab();
      cy.get('#test-modal .usa-modal__close').should('be.focused');

      // External button should not be focusable while modal is open
      cy.get('#external-button').should('not.be.focused');
    });

    it('should verify focus returns to triggering element when modal closes', () => {
      cy.mount(`
        <div>
          <button id="trigger-button">Open Modal</button>
          <usa-modal
            id="test-modal"
            heading="Test Modal"
            primary-button-text="OK">
            <p>Modal content</p>
          </usa-modal>
        </div>
      `);

      // Focus trigger button and open modal
      cy.get('#trigger-button')
        .focus()
        .then(($btn) => {
          // Store reference for later
          cy.get('#test-modal').then(($modal) => {
            $modal[0].openModal();
          });
        });

      // Modal should be open with focus on close button
      cy.get('#test-modal .usa-modal__close').should('be.focused');

      // Close modal with ESC
      cy.get('body').type('{esc}');

      // Focus should return to trigger button
      cy.get('#trigger-button').should('be.focused');
    });

    it('should verify modal has proper ARIA attributes and roles', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Accessible Modal"
          description="This modal tests accessibility"
          open
          primary-button-text="OK">
          <p>Modal content</p>
        </usa-modal>
      `);

      // Modal should have proper role and ARIA attributes
      cy.get('#test-modal .usa-modal').should('have.attr', 'role', 'dialog');
      cy.get('#test-modal .usa-modal').should('have.attr', 'aria-modal', 'true');
      cy.get('#test-modal .usa-modal').should('have.attr', 'aria-labelledby');
      cy.get('#test-modal .usa-modal').should('have.attr', 'aria-describedby');

      // Modal should be properly labeled
      cy.get('#test-modal .usa-modal__heading').should('have.attr', 'id');
      cy.get('#test-modal .usa-modal__heading').should('contain.text', 'Accessible Modal');
    });
  });

  describe('Body Scroll Prevention and Z-Index Layering', () => {
    it('should verify body scroll is disabled when modal is open', () => {
      cy.mount(`
        <div>
          <div style="height: 2000px; background: linear-gradient(red, blue);">
            Very tall content to enable scrolling
          </div>
          <usa-modal
            id="test-modal"
            heading="Test Modal"
            primary-button-text="OK">
            <p>Modal content</p>
          </usa-modal>
        </div>
      `);

      // Body should be scrollable initially
      cy.get('body').should('not.have.class', 'usa-modal--open');

      // Open modal
      cy.get('#test-modal').then(($modal) => {
        $modal[0].openModal();
      });

      // Body should have scroll prevention class
      cy.get('body').should('have.class', 'usa-modal--open');
      cy.get('body').should('have.css', 'overflow', 'hidden');

      // Close modal
      cy.get('#test-modal .usa-modal__close').click();

      // Body scroll should be restored
      cy.get('body').should('not.have.class', 'usa-modal--open');
    });

    it('should verify modal appears above other page content', () => {
      cy.mount(`
        <div>
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: red; z-index: 100;">
            High z-index background
          </div>
          <usa-modal
            id="test-modal"
            heading="Test Modal"
            open
            primary-button-text="OK">
            <p>Modal should appear above red background</p>
          </usa-modal>
        </div>
      `);

      // Modal should have higher z-index than background
      cy.get('#test-modal .usa-modal-wrapper').then(($wrapper) => {
        const zIndex = window.getComputedStyle($wrapper[0]).zIndex;
        expect(parseInt(zIndex)).to.be.greaterThan(100);
      });

      // Modal should be visible above red background
      cy.get('#test-modal .usa-modal').should('be.visible');
      cy.get('#test-modal .usa-modal__heading').should('be.visible');
    });
  });

  describe('Multiple Modals and Edge Cases', () => {
    it('should verify only one modal can be open at a time', () => {
      cy.mount(`
        <div>
          <usa-modal
            id="modal1"
            heading="First Modal"
            primary-button-text="OK">
            <p>First modal content</p>
          </usa-modal>
          <usa-modal
            id="modal2"
            heading="Second Modal"
            primary-button-text="OK">
            <p>Second modal content</p>
          </usa-modal>
        </div>
      `);

      // Open first modal
      cy.get('#modal1').then(($modal) => {
        $modal[0].openModal();
      });
      cy.get('#modal1 .usa-modal').should('be.visible');
      cy.get('#modal2 .usa-modal-wrapper').should('have.class', 'is-hidden');

      // Open second modal
      cy.get('#modal2').then(($modal) => {
        $modal[0].openModal();
      });
      cy.get('#modal2 .usa-modal').should('be.visible');

      // Only one body class should be applied
      cy.get('body').should('have.class', 'usa-modal--open');
    });

    it('should verify modal works correctly with force-action attribute', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Force Action Modal"
          open
          force-action
          primary-button-text="Required Action">
          <p>You must click the button to continue</p>
        </usa-modal>
      `);

      // ESC key should not close force-action modal
      cy.get('body').type('{esc}');
      cy.get('#test-modal .usa-modal').should('be.visible');

      // Overlay click should not close force-action modal
      cy.get('#test-modal .usa-modal-wrapper').click(10, 10);
      cy.get('#test-modal .usa-modal').should('be.visible');

      // Only button click should close it
      cy.get('#test-modal .usa-button--primary').click();
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should verify modal with large content handles scrolling correctly', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Large Content Modal"
          open
          primary-button-text="OK">
          <div style="height: 800px; background: linear-gradient(to bottom, lightblue, lightgreen);">
            <p>This is very tall content</p>
            <p>More content...</p>
            <p>Even more content...</p>
            <p>Content that requires scrolling</p>
            <p>Bottom content</p>
          </div>
        </usa-modal>
      `);

      // Modal content should be scrollable if needed
      cy.get('#test-modal .usa-modal__main').then(($main) => {
        const element = $main[0];
        if (element.scrollHeight > element.clientHeight) {
          // Content is scrollable
          cy.wrap($main)
            .should('have.css', 'overflow-y')
            .and('match', /(auto|scroll)/);
        }
      });

      // Modal should still be closeable
      cy.get('#test-modal .usa-modal__close').should('be.visible').click();
      cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should verify modal opens and closes quickly without delay', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Performance Test"
          primary-button-text="OK">
          <p>Modal content</p>
        </usa-modal>
      `);

      const startTime = Date.now();

      // Open modal
      cy.get('#test-modal').then(($modal) => {
        $modal[0].openModal();
      });

      cy.get('#test-modal .usa-modal')
        .should('be.visible')
        .then(() => {
          const openTime = Date.now() - startTime;
          expect(openTime).to.be.lessThan(200); // Should open quickly
        });

      const closeStartTime = Date.now();

      // Close modal
      cy.get('#test-modal .usa-modal__close').click();

      cy.get('#test-modal .usa-modal-wrapper')
        .should('have.class', 'is-hidden')
        .then(() => {
          const closeTime = Date.now() - closeStartTime;
          expect(closeTime).to.be.lessThan(200); // Should close quickly
        });
    });

    it('should verify modal remains responsive during rapid open/close cycles', () => {
      cy.mount(`
        <usa-modal
          id="test-modal"
          heading="Responsiveness Test"
          primary-button-text="OK">
          <p>Modal content</p>
        </usa-modal>
      `);

      // Rapidly open and close modal multiple times
      for (let i = 0; i < 3; i++) {
        cy.get('#test-modal').then(($modal) => {
          $modal[0].openModal();
        });
        cy.get('#test-modal .usa-modal').should('be.visible');

        cy.get('#test-modal .usa-modal__close').click();
        cy.get('#test-modal .usa-modal-wrapper').should('have.class', 'is-hidden');
      }

      // Final open should still work correctly
      cy.get('#test-modal').then(($modal) => {
        $modal[0].openModal();
      });
      cy.get('#test-modal .usa-modal').should('be.visible');
      cy.get('#test-modal .usa-modal__heading').should('contain.text', 'Responsiveness Test');
    });
  });
});
