/**
 * Site Alert DOM Manipulation - Browser-Dependent Edge Case Test
 *
 * This test covers a Lit Light DOM limitation where moving elements with innerHTML
 * can break Lit's template tracking. While this is a known edge case, testing it
 * in a real browser ensures the component handles it gracefully.
 *
 * Source: src/components/site-alert/usa-site-alert.test.ts (line 577)
 * Issue: Moving Light DOM elements with innerHTML manipulation
 * Status: Known Lit limitation, but component should still function
 */

describe('Site Alert DOM Manipulation Edge Case', () => {
  beforeEach(() => {
    // Visit the site-alert Storybook story
    cy.visit('/iframe.html?id=components-site-alert--default&viewMode=story');
    cy.injectAxe(); // For accessibility testing
  });

  describe('Light DOM Element Moving', () => {
    it('should render correctly initially', () => {
      cy.get('usa-site-alert')
        .should('be.visible')
        .within(() => {
          cy.get('.usa-site-alert').should('exist');
          cy.get('.usa-alert__body').should('exist');
        });
    });

    it('should maintain functionality after property updates', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.heading = 'Updated Heading';
        element.type = 'emergency';
      });

      cy.get('usa-site-alert').within(() => {
        cy.get('.usa-alert__heading')
          .should('exist')
          .invoke('text')
          .should('contain', 'Updated Heading');

        cy.get('.usa-site-alert')
          .should('have.class', 'usa-site-alert--emergency');
      });
    });

    it('should handle content updates gracefully', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;

        // Update heading
        element.heading = 'Test Alert';

        // Add complex content
        const complexContent = document.createElement('div');
        complexContent.innerHTML = '<p><strong>Important:</strong> This is a test message.</p>';
        element.appendChild(complexContent);
      });

      cy.wait(100); // Let Lit update

      cy.get('usa-site-alert').within(() => {
        cy.get('.usa-alert__heading')
          .invoke('text')
          .should('contain', 'Test Alert');

        // Content should be present
        cy.get('.usa-alert__text').should('exist');
      });
    });

    it('should handle DOM manipulation with appendChild', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;

        // Set initial state
        element.heading = 'Manipulation Test';
        element.type = 'info';

        // Add content via appendChild (safer than innerHTML)
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Content added via appendChild';
        element.appendChild(paragraph);
      });

      cy.wait(100);

      cy.get('usa-site-alert').within(() => {
        // Component should still function
        cy.get('.usa-site-alert').should('exist');
        cy.get('.usa-alert__heading')
          .invoke('text')
          .should('contain', 'Manipulation Test');
      });
    });

    it('should maintain structure after multiple content changes', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;

        // Multiple property changes
        element.heading = 'First';
        element.type = 'info';
        element.slim = true;
      });

      cy.wait(50);

      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;

        element.heading = 'Second';
        element.type = 'emergency';
        element.slim = false;
      });

      cy.wait(50);

      cy.get('usa-site-alert').within(() => {
        // Component should reflect latest state
        cy.get('.usa-alert__heading')
          .invoke('text')
          .should('contain', 'Second');

        cy.get('.usa-site-alert')
          .should('have.class', 'usa-site-alert--emergency')
          .and('not.have.class', 'usa-site-alert--slim');
      });
    });

    it('should handle visibility toggle without structure loss', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.heading = 'Visibility Test';
        element.visible = true;
      });

      cy.wait(50);

      // Hide
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.hide();
      });

      cy.wait(50);

      // Alert should be hidden
      cy.get('usa-site-alert').within(() => {
        cy.get('.usa-site-alert').should('not.exist');
      });

      // Show again
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.show();
      });

      cy.wait(50);

      // Alert should be visible with correct content
      cy.get('usa-site-alert').within(() => {
        cy.get('.usa-site-alert').should('exist');
        cy.get('.usa-alert__heading')
          .invoke('text')
          .should('contain', 'Visibility Test');
      });
    });
  });

  describe('Component Stability After DOM Manipulation', () => {
    it('should remain connected to DOM after property updates', () => {
      let originalParent: Element;

      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        originalParent = element.parentElement;

        // Rapid property changes
        element.type = 'info';
        element.heading = 'Rapid Change 1';
        element.slim = true;
        element.noIcon = false;
      });

      cy.wait(50);

      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.type = 'emergency';
        element.heading = 'Rapid Change 2';
        element.slim = false;
        element.noIcon = true;
      });

      cy.wait(50);

      // Element should still be connected
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        expect(element.parentElement).to.equal(originalParent);
        expect(document.body.contains(element)).to.be.true;
        expect(element.isConnected).to.be.true;
      });
    });

    it('should handle complex content structure changes', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.heading = 'Complex Content Test';

        // Add complex nested content
        const complexDiv = document.createElement('div');
        complexDiv.innerHTML = `
          <p><strong>System Update:</strong> Maintenance scheduled</p>
          <ul>
            <li>Date: March 15, 2024</li>
            <li>Time: 2:00 AM - 6:00 AM EST</li>
            <li>Impact: Limited service availability</li>
          </ul>
          <p><a href="#details">View full details</a></p>
        `;
        element.appendChild(complexDiv);
      });

      cy.wait(100);

      cy.get('usa-site-alert').within(() => {
        // Component structure should remain intact
        cy.get('.usa-site-alert').should('exist');
        cy.get('.usa-alert__heading').should('exist');
        cy.get('.usa-alert__text').should('exist');

        // Complex content should be present
        cy.contains('System Update').should('exist');
        cy.contains('Maintenance scheduled').should('exist');
        cy.get('ul').should('exist');
        cy.get('li').should('have.length', 3);
      });
    });

    it('should handle slot content updates gracefully', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.heading = 'Slot Test';

        // Clear existing content
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }

        // Add new slot content
        const paragraph = document.createElement('p');
        paragraph.textContent = 'New slotted content';
        element.appendChild(paragraph);
      });

      cy.wait(100);

      // Component should still render (though content may differ due to Lit limitation)
      cy.get('usa-site-alert').within(() => {
        cy.get('.usa-site-alert').should('exist');
      });

      // Note: We're just testing that component doesn't break
      // The Lit Light DOM limitation may affect content rendering
      // but core functionality should remain intact
    });
  });

  describe('Edge Case Resilience', () => {
    it('should not crash when moved in DOM (known limitation)', () => {
      let alertElement: any;
      let newContainer: HTMLElement;

      cy.get('usa-site-alert').then(($el) => {
        alertElement = $el[0];
        alertElement.heading = 'Moving Test';

        // Create new container
        newContainer = document.createElement('div');
        newContainer.id = 'new-container';
        document.body.appendChild(newContainer);

        // Move element to new container
        newContainer.appendChild(alertElement);
      });

      cy.wait(100);

      // Element should exist in new location
      cy.get('#new-container usa-site-alert').should('exist');

      // Component should still have basic structure
      // (Note: Lit Light DOM limitation may affect full functionality)
      cy.get('#new-container usa-site-alert').within(() => {
        cy.get('.usa-site-alert').should('exist');
      });

      // Cleanup
      cy.then(() => {
        if (newContainer && document.body.contains(newContainer)) {
          document.body.removeChild(newContainer);
        }
      });
    });

    it('should handle property updates after being moved', () => {
      let alertElement: any;
      let newContainer: HTMLElement;

      cy.get('usa-site-alert').then(($el) => {
        alertElement = $el[0];

        // Move element
        newContainer = document.createElement('div');
        newContainer.id = 'move-container';
        document.body.appendChild(newContainer);
        newContainer.appendChild(alertElement);

        // Try to update properties after moving
        alertElement.heading = 'After Move';
        alertElement.type = 'emergency';
      });

      cy.wait(100);

      // Component should still exist
      cy.get('#move-container usa-site-alert').should('exist');

      // Cleanup
      cy.then(() => {
        if (newContainer && document.body.contains(newContainer)) {
          document.body.removeChild(newContainer);
        }
      });
    });
  });

  describe('Accessibility After Manipulation', () => {
    it('should maintain ARIA attributes after content changes', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.heading = 'Accessibility Test';

        const content = document.createElement('p');
        content.textContent = 'Important accessibility message';
        element.appendChild(content);
      });

      cy.wait(100);

      cy.get('usa-site-alert').within(() => {
        cy.get('section').should('have.attr', 'aria-label', 'Site alert');
      });
    });

    it('should pass accessibility checks after DOM manipulation', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.heading = 'A11y Test';
        element.type = 'emergency';

        const paragraph = document.createElement('p');
        paragraph.textContent = 'Emergency notification content';
        element.appendChild(paragraph);
      });

      cy.wait(100);

      // Run axe checks
      cy.checkA11y('usa-site-alert', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });
    });
  });

  describe('Normal Usage (Non-Edge Case)', () => {
    it('should work correctly with normal property-based usage', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;

        // Normal usage pattern (recommended)
        element.heading = 'Standard Usage';
        element.type = 'info';
        element.slim = true;
        element.noIcon = false;
      });

      cy.wait(50);

      cy.get('usa-site-alert').within(() => {
        cy.get('.usa-site-alert')
          .should('have.class', 'usa-site-alert--info')
          .and('have.class', 'usa-site-alert--slim')
          .and('not.have.class', 'usa-site-alert--no-icon');

        cy.get('.usa-alert__heading')
          .invoke('text')
          .should('contain', 'Standard Usage');
      });
    });

    it('should handle show/hide methods correctly', () => {
      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.heading = 'Show/Hide Test';
        element.show();
      });

      cy.get('usa-site-alert .usa-site-alert').should('be.visible');

      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.hide();
      });

      cy.get('usa-site-alert .usa-site-alert').should('not.exist');

      cy.get('usa-site-alert').then(($el) => {
        const element = $el[0] as any;
        element.show();
      });

      cy.get('usa-site-alert .usa-site-alert').should('be.visible');
    });

    it('should handle all type variants correctly', () => {
      const types = ['info', 'emergency'];

      types.forEach((type) => {
        cy.get('usa-site-alert').then(($el) => {
          const element = $el[0] as any;
          element.type = type;
          element.heading = `${type.charAt(0).toUpperCase() + type.slice(1)} Alert`;
        });

        cy.wait(50);

        cy.get('usa-site-alert').within(() => {
          cy.get('.usa-site-alert')
            .should('have.class', `usa-site-alert--${type}`);
        });
      });
    });
  });
});
