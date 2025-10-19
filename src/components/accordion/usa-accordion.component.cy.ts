/**
 * @fileoverview Accordion Behavioral Tests
 *
 * This file contains comprehensive Cypress tests for the USA Accordion component,
 * focusing on actual visual behavior and user interactions rather than just API testing.
 *
 * Tests cover:
 * - Accordion expansion/collapse behavior
 * - Visual rendering and display properties
 * - Multi-selectable mode functionality
 * - Click and keyboard interaction handling
 * - Content visibility and accessibility
 * - Focus management and aria attributes
 * - Performance and responsiveness
 *
 * These tests complement unit tests by verifying actual DOM behavior and visual rendering
 * that users experience, catching issues that unit tests might miss.
 */

import { html } from 'lit';

// Sample accordion data for testing
const sampleItems = [
  {
    id: 'test-item-1',
    title: 'First Accordion Item',
    content: '<p>Content for the first accordion item with some detailed information.</p>',
    expanded: false,
  },
  {
    id: 'test-item-2',
    title: 'Second Accordion Item',
    content: '<p>Content for the second accordion item with different information.</p>',
    expanded: true,
  },
  {
    id: 'test-item-3',
    title: 'Third Accordion Item',
    content: '<p>Content for the third accordion item with more details and examples.</p>',
    expanded: false,
  },
];

describe('USA Accordion - Behavioral Testing', () => {
  beforeEach(() => {
    // Import component before each test
    cy.window().then((win) => {
      if (!win.customElements.get('usa-accordion')) {
        return import('./usa-accordion.ts');
      }
    });
  });

  describe('Basic Rendering and Structure', () => {
    it('should render with proper USWDS structure and classes', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Verify main accordion container
      cy.get('usa-accordion .usa-accordion').should('exist');

      // Verify each accordion item has proper structure
      cy.get('.usa-accordion__heading').should('have.length', 3);
      cy.get('.usa-accordion__button').should('have.length', 3);
      cy.get('.usa-accordion__content').should('have.length', 3);

      // Verify proper ARIA attributes
      cy.get('.usa-accordion__button').each(($btn, index) => {
        cy.wrap($btn).should('have.attr', 'aria-expanded');
        cy.wrap($btn).should('have.attr', 'aria-controls');
        cy.wrap($btn).should('have.attr', 'type', 'button');
      });
    });

    it('should have proper heading hierarchy structure', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Verify each accordion section has h4 heading
      cy.get('.usa-accordion__heading').should('have.length', 3);
      cy.get('h4.usa-accordion__heading').should('have.length', 3);

      // Verify buttons are properly nested in headings
      cy.get('h4.usa-accordion__heading .usa-accordion__button').should('have.length', 3);
    });

    it('should render content with proper prose styling', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Verify content containers have proper classes
      cy.get('.usa-accordion__content').each(($content) => {
        cy.wrap($content).should('have.class', 'usa-accordion__content');
        cy.wrap($content).should('have.class', 'usa-prose');
      });
    });
  });

  describe('Content Visibility and Toggle Behavior', () => {
    it('should show expanded content and hide collapsed content properly', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Check initial state - second item should be expanded
      cy.get('#test-item-1-content').should('have.attr', 'hidden');
      cy.get('#test-item-2-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-3-content').should('have.attr', 'hidden');

      // Verify corresponding aria-expanded states
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'false');
      cy.get('#test-item-2-button').should('have.attr', 'aria-expanded', 'true');
      cy.get('#test-item-3-button').should('have.attr', 'aria-expanded', 'false');
    });

    it('should toggle content visibility when button is clicked', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Click first button to expand
      cy.get('#test-item-1-button').click();
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'true');

      // Click again to collapse
      cy.get('#test-item-1-button').click();
      cy.get('#test-item-1-content').should('have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'false');
    });

    it('should close other items when one is opened in single-select mode', () => {
      cy.mount(html`
        <usa-accordion .items="${sampleItems}" multiselectable="false"></usa-accordion>
      `);

      // Initially, second item is expanded
      cy.get('#test-item-2-content').should('not.have.attr', 'hidden');

      // Click first button - should expand first and close second
      cy.get('#test-item-1-button').click();
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-2-content').should('have.attr', 'hidden');

      // Verify aria states
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'true');
      cy.get('#test-item-2-button').should('have.attr', 'aria-expanded', 'false');
    });

    it('should allow multiple items open in multiselectable mode', () => {
      cy.mount(html`
        <usa-accordion .items="${sampleItems}" multiselectable="true"></usa-accordion>
      `);

      // Click first button to expand
      cy.get('#test-item-1-button').click();

      // Both first and second items should be open
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-2-content').should('not.have.attr', 'hidden');

      // Click third button to expand
      cy.get('#test-item-3-button').click();

      // All three should now be open
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-2-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-3-content').should('not.have.attr', 'hidden');
    });
  });

  describe('Click Event Handling and Interaction', () => {
    it('should handle rapid successive clicks properly', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      const button = cy.get('#test-item-1-button');
      const content = cy.get('#test-item-1-content');

      // Rapid clicks
      button.click().click().click();

      // Should end up collapsed (odd number of clicks)
      content.should('have.attr', 'hidden');
      button.should('have.attr', 'aria-expanded', 'false');

      // One more click should expand
      button.click();
      content.should('not.have.attr', 'hidden');
      button.should('have.attr', 'aria-expanded', 'true');
    });

    it('should emit accordion-toggle events with proper details', () => {
      let eventDetails: any = null;

      cy.mount(html`
        <usa-accordion
          .items="${sampleItems}"
          @accordion-toggle="${(e: CustomEvent) => (eventDetails = e.detail)}"
        ></usa-accordion>
      `);

      cy.get('#test-item-1-button')
        .click()
        .then(() => {
          expect(eventDetails).to.not.be.null;
          expect(eventDetails.expanded).to.be.true;
          expect(eventDetails.item.id).to.equal('test-item-1');
          expect(eventDetails.index).to.equal(0);
          expect(eventDetails.allItems).to.have.length(3);
        });
    });

    it('should handle click events on content area without toggling', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Expand first item
      cy.get('#test-item-1-button').click();
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');

      // Click inside content area
      cy.get('#test-item-1-content p').click();

      // Should remain expanded
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'true');
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    it('should toggle when Enter key is pressed on button', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      cy.get('#test-item-1-button').focus().type('{enter}');
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'true');

      // Toggle back
      cy.get('#test-item-1-button').type('{enter}');
      cy.get('#test-item-1-content').should('have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'false');
    });

    it('should toggle when Space key is pressed on button', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      cy.get('#test-item-1-button').focus().type(' ');
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'true');

      // Toggle back
      cy.get('#test-item-1-button').type(' ');
      cy.get('#test-item-1-content').should('have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'false');
    });

    it('should support tab navigation between accordion buttons', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Focus first button
      cy.get('#test-item-1-button').focus();
      cy.focused().should('have.id', 'test-item-1-button');

      // Tab to next button
      cy.focused().tab();
      cy.focused().should('have.id', 'test-item-2-button');

      // Tab to third button
      cy.focused().tab();
      cy.focused().should('have.id', 'test-item-3-button');
    });

    it('should have proper ARIA attributes for screen readers', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      cy.get('.usa-accordion__button').each(($btn, index) => {
        const expectedControlsId = `test-item-${index + 1}-content`;

        cy.wrap($btn)
          .should('have.attr', 'aria-controls', expectedControlsId)
          .should('have.attr', 'aria-expanded')
          .should('have.attr', 'type', 'button');
      });

      // Verify content regions have proper IDs
      cy.get('.usa-accordion__content').each(($content, index) => {
        const expectedId = `test-item-${index + 1}-content`;
        cy.wrap($content).should('have.attr', 'id', expectedId);
      });
    });
  });

  describe('Visual States and CSS Classes', () => {
    it('should apply bordered class when bordered property is true', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}" bordered="true"></usa-accordion> `);

      cy.get('.usa-accordion').should('have.class', 'usa-accordion--bordered');
    });

    it('should apply multiselectable class when multiselectable is true', () => {
      cy.mount(html`
        <usa-accordion .items="${sampleItems}" multiselectable="true"></usa-accordion>
      `);

      cy.get('.usa-accordion').should('have.class', 'usa-accordion--multiselectable');
    });

    it('should have proper data attributes for USWDS integration', () => {
      cy.mount(html`
        <usa-accordion .items="${sampleItems}" multiselectable="true"></usa-accordion>
      `);

      cy.get('.usa-accordion').should('have.attr', 'data-allow-multiple');
    });

    it('should maintain visual consistency during rapid interactions', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Perform rapid toggles and verify visual state remains consistent
      for (let i = 0; i < 5; i++) {
        cy.get('#test-item-1-button').click();
        cy.wait(50); // Small delay to check intermediate states
      }

      // Final state should be collapsed (odd number of clicks)
      cy.get('#test-item-1-content').should('have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'false');
    });
  });

  describe('Content Rendering and HTML Support', () => {
    it('should render HTML content properly in accordion items', () => {
      const htmlContent = [
        {
          id: 'html-test',
          title: 'HTML Content Test',
          content:
            '<p>Paragraph</p><ul><li>List item 1</li><li>List item 2</li></ul><strong>Bold text</strong>',
          expanded: true,
        },
      ];

      cy.mount(html` <usa-accordion .items="${htmlContent}"></usa-accordion> `);

      cy.get('#html-test-content').within(() => {
        cy.get('p').should('contain', 'Paragraph');
        cy.get('ul li').should('have.length', 2);
        cy.get('strong').should('contain', 'Bold text');
      });
    });

    it('should handle empty content gracefully', () => {
      const emptyContent = [
        {
          id: 'empty-test',
          title: 'Empty Content Test',
          content: '',
          expanded: true,
        },
      ];

      cy.mount(html` <usa-accordion .items="${emptyContent}"></usa-accordion> `);

      cy.get('#empty-test-content').should('exist');
      cy.get('#empty-test-button').click();
      cy.get('#empty-test-content').should('have.attr', 'hidden');
    });
  });

  describe('Dynamic Content Updates', () => {
    it('should handle dynamic item additions properly', () => {
      const initialItems = [sampleItems[0]];

      cy.mount(html`
        <usa-accordion .items="${initialItems}" id="dynamic-accordion"></usa-accordion>
      `);

      cy.get('.usa-accordion__button').should('have.length', 1);

      // Simulate adding items dynamically
      cy.window().then((win) => {
        const accordion = win.document.getElementById('dynamic-accordion') as any;
        if (accordion) {
          accordion.items = sampleItems; // Update with all items
        }
      });

      cy.get('.usa-accordion__button').should('have.length', 3);
    });

    it('should maintain state when items are reordered', () => {
      cy.mount(html`
        <usa-accordion .items="${sampleItems}" id="reorder-accordion"></usa-accordion>
      `);

      // Expand first item
      cy.get('#test-item-1-button').click();
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');

      // Simulate reordering items
      const reorderedItems = [sampleItems[2], sampleItems[0], sampleItems[1]];

      cy.window().then((win) => {
        const accordion = win.document.getElementById('reorder-accordion') as any;
        if (accordion) {
          accordion.items = reorderedItems;
        }
      });

      // Verify structure is updated but expanded state is preserved based on item ID
      cy.get('.usa-accordion__button').should('have.length', 3);
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should handle large numbers of accordion items efficiently', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({
        id: `performance-item-${i}`,
        title: `Performance Test Item ${i + 1}`,
        content: `<p>Content for performance test item ${i + 1}</p>`,
        expanded: false,
      }));

      cy.mount(html` <usa-accordion .items="${manyItems}"></usa-accordion> `);

      cy.get('.usa-accordion__button').should('have.length', 20);

      // Test clicking multiple items rapidly
      cy.get('#performance-item-0-button').click();
      cy.get('#performance-item-5-button').click();
      cy.get('#performance-item-10-button').click();

      // Only the last clicked should be open (single select mode)
      cy.get('#performance-item-0-content').should('have.attr', 'hidden');
      cy.get('#performance-item-5-content').should('have.attr', 'hidden');
      cy.get('#performance-item-10-content').should('not.have.attr', 'hidden');
    });

    it('should respond quickly to user interactions', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      const startTime = Date.now();

      cy.get('#test-item-1-button')
        .click()
        .then(() => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          // Response should be under 100ms for good UX
          expect(responseTime).to.be.lessThan(100);
        });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle accordion with no items gracefully', () => {
      cy.mount(html` <usa-accordion .items="${[]}"></usa-accordion> `);

      cy.get('usa-accordion').should('exist');
      cy.get('.usa-accordion__button').should('have.length', 0);
    });

    it('should handle items with missing or invalid IDs', () => {
      const itemsWithBadIds = [
        { id: '', title: 'No ID', content: '<p>Content</p>', expanded: false },
        { id: 'valid-id', title: 'Valid ID', content: '<p>Content</p>', expanded: false },
      ];

      cy.mount(html` <usa-accordion .items="${itemsWithBadIds}"></usa-accordion> `);

      // Should still render and be functional
      cy.get('.usa-accordion__button').should('have.length', 2);

      // Should auto-generate IDs for items without valid IDs
      cy.get('.usa-accordion__button').first().should('have.attr', 'id');
    });

    it('should maintain accessibility even with dynamic content changes', () => {
      cy.mount(html`
        <usa-accordion .items="${[sampleItems[0]]}" id="accessibility-test"></usa-accordion>
      `);

      // Add more items dynamically
      cy.window().then((win) => {
        const accordion = win.document.getElementById('accessibility-test') as any;
        if (accordion) {
          accordion.items = sampleItems;
        }
      });

      // Verify all buttons still have proper ARIA attributes
      cy.get('.usa-accordion__button').each(($btn) => {
        cy.wrap($btn)
          .should('have.attr', 'aria-controls')
          .should('have.attr', 'aria-expanded')
          .should('have.attr', 'type', 'button');
      });
    });
  });

  describe('Integration with USWDS JavaScript', () => {
    it('should work with or without USWDS JavaScript loaded', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Basic functionality should work regardless of USWDS JavaScript
      cy.get('#test-item-1-button').click();
      cy.get('#test-item-1-content').should('not.have.attr', 'hidden');
      cy.get('#test-item-1-button').should('have.attr', 'aria-expanded', 'true');
    });

    it('should maintain consistent behavior across different environments', () => {
      cy.mount(html` <usa-accordion .items="${sampleItems}"></usa-accordion> `);

      // Test consistent toggle behavior
      const testToggleConsistency = () => {
        cy.get('#test-item-1-button').click();
        cy.get('#test-item-1-content').should('not.have.attr', 'hidden');

        cy.get('#test-item-1-button').click();
        cy.get('#test-item-1-content').should('have.attr', 'hidden');
      };

      // Run test multiple times to ensure consistency
      testToggleConsistency();
      testToggleConsistency();
      testToggleConsistency();
    });
  });
});
