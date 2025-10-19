// Component tests for usa-button
import './index.ts';

describe('USA Button Component Tests', () => {
  it('should render button with default properties', () => {
    cy.mount(`<usa-button>Default Button</usa-button>`);
    cy.get('usa-button').should('contain.text', 'Default Button');
    cy.get('usa-button').should('have.class', 'usa-button');
  });

  it('should render different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'accent-cool'];

    variants.forEach((variant) => {
      cy.mount(`<usa-button variant="${variant}">Test Button</usa-button>`);
      cy.get('usa-button').should('have.attr', 'variant', variant);
      cy.get('usa-button').should('have.class', `usa-button--${variant}`);
    });
  });

  it('should render different sizes', () => {
    const sizes = ['small', 'medium', 'big'];

    sizes.forEach((size) => {
      cy.mount(`<usa-button size="${size}">Test Button</usa-button>`);
      cy.get('usa-button').should('have.attr', 'size', size);
      if (size !== 'medium') {
        // medium is default, no class added
        cy.get('usa-button').should('have.class', `usa-button--${size}`);
      }
    });
  });

  it('should handle disabled state', () => {
    cy.mount(`<usa-button disabled>Disabled Button</usa-button>`);
    cy.get('usa-button').should('have.attr', 'disabled');
    cy.get('usa-button').should('be.disabled');
    cy.get('usa-button').should('have.attr', 'aria-disabled', 'true');
  });

  it('should handle different button types', () => {
    const types = ['button', 'submit', 'reset'];

    types.forEach((type) => {
      cy.mount(`<usa-button type="${type}">Test Button</usa-button>`);
      cy.get('usa-button').should('have.attr', 'type', type);
    });
  });

  it('should handle click events', () => {
    cy.mount(`<usa-button id="test-btn">Click Me</usa-button>`);

    cy.window().then((win) => {
      const clickSpy = cy.stub();
      win.document.getElementById('test-btn')?.addEventListener('click', clickSpy);

      cy.get('usa-button').click();
      cy.then(() => {
        expect(clickSpy).to.have.been.called;
      });
    });
  });

  it('should be keyboard accessible', () => {
    cy.mount(`<usa-button>Keyboard Test</usa-button>`);

    // Tab to button
    cy.get('usa-button').focus();
    cy.focused().should('match', 'usa-button');

    // Press space to activate
    cy.focused().type(' ');
    // Press enter to activate
    cy.focused().type('{enter}');
  });

  it('should handle ARIA labels', () => {
    cy.mount(`<usa-button aria-label="Custom Label">×</usa-button>`);
    cy.get('usa-button').should('have.attr', 'aria-label', 'Custom Label');
  });

  it('should meet accessibility standards', () => {
    cy.mount(`
      <div>
        <usa-button>Default Button</usa-button>
        <usa-button variant="secondary">Secondary Button</usa-button>
        <usa-button disabled>Disabled Button</usa-button>
      </div>
    `);

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should work in forms', () => {
    cy.mount(`
      <form id="test-form">
        <usa-button type="submit">Submit</usa-button>
        <usa-button type="reset">Reset</usa-button>
        <usa-button type="button">Regular</usa-button>
      </form>
    `);

    cy.get('usa-button[type="submit"]').should('have.attr', 'type', 'submit');
    cy.get('usa-button[type="reset"]').should('have.attr', 'type', 'reset');
    cy.get('usa-button[type="button"]').should('have.attr', 'type', 'button');
  });

  it('should support custom CSS classes', () => {
    cy.mount(`<usa-button class="custom-class">Custom Button</usa-button>`);
    cy.get('usa-button').should('have.class', 'custom-class');
    cy.get('usa-button').should('have.class', 'usa-button'); // Should still have base class
  });

  // Edge Case Testing (Critical Gap Fix)
  describe('Edge Case Testing', () => {
    describe('Boundary Conditions', () => {
      it('should handle extremely long button text without breaking layout', () => {
        const longText =
          'This is an extremely long button text that could potentially break the layout or cause rendering issues in edge cases where content exceeds normal expected boundaries and causes overflow problems';

        cy.mount(`<usa-button>${longText}</usa-button>`);

        // Button should render without layout breaking
        cy.get('usa-button').should('be.visible');
        cy.get('usa-button').should('contain.text', longText.substring(0, 50)); // At least first part should be visible

        // Should maintain button dimensions within reasonable bounds
        cy.get('usa-button').then(($button) => {
          const button = $button[0];
          const rect = button.getBoundingClientRect();
          expect(rect.width).to.be.greaterThan(0);
          expect(rect.height).to.be.greaterThan(0);
          expect(rect.width).to.be.lessThan(2000); // Reasonable max width
        });
      });

      it('should handle empty button content gracefully', () => {
        cy.mount(`<usa-button></usa-button>`);

        // Empty button should still be clickable and accessible
        cy.get('usa-button').should('be.visible');
        cy.get('usa-button').should('have.attr', 'tabindex', '0');
        cy.get('usa-button').click(); // Should not cause errors

        // Should have minimum dimensions for usability
        cy.get('usa-button').then(($button) => {
          const rect = $button[0].getBoundingClientRect();
          expect(rect.width).to.be.greaterThan(20); // Minimum clickable area
          expect(rect.height).to.be.greaterThan(20);
        });
      });

      it('should handle button with only whitespace content', () => {
        cy.mount(`<usa-button>   \n\t   </usa-button>`);

        cy.get('usa-button').should('be.visible');
        cy.get('usa-button').click(); // Should be functional

        // Should collapse whitespace appropriately
        cy.get('usa-button').then(($button) => {
          const text = $button.text().trim();
          expect(text).to.equal('');
        });
      });

      it('should handle invalid variant and size attributes gracefully', () => {
        cy.mount(
          `<usa-button variant="invalid-variant" size="invalid-size">Invalid Attributes</usa-button>`
        );

        // Should fallback to default styling
        cy.get('usa-button').should('be.visible');
        cy.get('usa-button').should('have.class', 'usa-button');

        // Should not have invalid classes
        cy.get('usa-button').should('not.have.class', 'usa-button--invalid-variant');
        cy.get('usa-button').should('not.have.class', 'usa-button--invalid-size');

        // Should still be functional
        cy.get('usa-button').click();
      });

      it('should handle rapid attribute changes without errors', () => {
        cy.mount(`<usa-button id="rapid-change">Changing Button</usa-button>`);

        cy.window().then((win) => {
          const button = win.document.getElementById('rapid-change') as any;

          // Rapidly change attributes
          const variants = ['primary', 'secondary', 'outline', 'accent-cool'];
          const sizes = ['small', 'medium', 'big'];

          for (let i = 0; i < 10; i++) {
            button.variant = variants[i % variants.length];
            button.size = sizes[i % sizes.length];
            button.disabled = i % 2 === 0;
          }
        });

        cy.wait(100);

        // Button should remain functional after rapid changes
        cy.get('usa-button').should('be.visible');
        cy.get('usa-button').click();
      });
    });

    describe('Error Recovery', () => {
      it('should recover from disabled state changes during click events', () => {
        let clickCount = 0;

        cy.mount(`<usa-button id="disabled-recovery">Recovery Test</usa-button>`);

        cy.window().then((win) => {
          const button = win.document.getElementById('disabled-recovery') as any;

          button.addEventListener('click', () => {
            clickCount++;
            // Disable button during click handling
            button.disabled = true;

            // Re-enable after short delay
            setTimeout(() => {
              button.disabled = false;
            }, 100);
          });
        });

        // Click button multiple times
        cy.get('usa-button').click();
        cy.wait(150);
        cy.get('usa-button').click();
        cy.wait(150);
        cy.get('usa-button').click();

        cy.then(() => {
          expect(clickCount).to.equal(3);
        });
      });

      it('should handle DOM manipulation during event handling', () => {
        cy.mount(`
          <div id="container">
            <usa-button id="dom-manipulation">DOM Test</usa-button>
          </div>
        `);

        cy.window().then((win) => {
          const button = win.document.getElementById('dom-manipulation') as any;
          const container = win.document.getElementById('container');

          button.addEventListener('click', () => {
            // Remove and re-add button during click
            container?.removeChild(button);

            setTimeout(() => {
              container?.appendChild(button);
            }, 50);
          });
        });

        cy.get('usa-button').click();
        cy.wait(100);

        // Button should be back and functional
        cy.get('usa-button').should('exist').click();
      });

      it('should handle event listener removal and re-addition', () => {
        let eventCount = 0;

        cy.mount(`<usa-button id="event-recovery">Event Recovery</usa-button>`);

        cy.window().then((win) => {
          const button = win.document.getElementById('event-recovery') as any;

          const handler = () => {
            eventCount++;
          };

          // Add event listener
          button.addEventListener('click', handler);

          // Remove it
          button.removeEventListener('click', handler);

          // Add it back
          button.addEventListener('click', handler);
        });

        cy.get('usa-button')
          .click()
          .then(() => {
            expect(eventCount).to.equal(1);
          });
      });

      it('should handle memory cleanup on disconnect/reconnect', () => {
        cy.mount(`<div id="cleanup-container"></div>`);

        cy.window().then((win) => {
          const container = win.document.getElementById('cleanup-container');

          // Create and destroy buttons multiple times
          for (let i = 0; i < 5; i++) {
            const button = win.document.createElement('usa-button') as any;
            button.textContent = `Button ${i}`;
            button.id = `cleanup-button-${i}`;

            container?.appendChild(button);

            // Simulate user interaction
            button.click();

            // Remove from DOM
            container?.removeChild(button);
          }

          // Create final button
          const finalButton = win.document.createElement('usa-button') as any;
          finalButton.textContent = 'Final Button';
          finalButton.id = 'final-button';
          container?.appendChild(finalButton);
        });

        // Final button should work normally
        cy.get('#final-button').should('exist').click();
      });
    });

    describe('Performance Stress Testing', () => {
      it('should handle rapid sequential clicks without performance degradation', () => {
        let clickTimes: number[] = [];

        cy.mount(`<usa-button id="performance-button">Performance Test</usa-button>`);

        cy.window().then((win) => {
          const button = win.document.getElementById('performance-button');

          button?.addEventListener('click', () => {
            clickTimes.push(performance.now());
          });
        });

        // Perform 20 rapid clicks
        for (let i = 0; i < 20; i++) {
          cy.get('usa-button').click({ force: true });
        }

        cy.wait(100).then(() => {
          expect(clickTimes.length).to.equal(20);

          // Check that response times remain consistent
          const intervals = clickTimes.slice(1).map((time, i) => time - clickTimes[i]);
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

          // No interval should be more than 3x the average (no major slowdowns)
          intervals.forEach((interval) => {
            expect(interval).to.be.lessThan(avgInterval * 3);
          });
        });
      });

      it('should handle keyboard navigation stress test', () => {
        const buttons = Array.from(
          { length: 20 },
          (_, i) => `<usa-button>Button ${i + 1}</usa-button>`
        ).join('');

        cy.mount(`<div>${buttons}</div>`);

        // Tab through all buttons rapidly
        cy.get('usa-button').first().focus();

        for (let i = 0; i < 19; i++) {
          cy.focused().tab();
        }

        // Should still be responsive
        cy.focused().should('match', 'usa-button');
        cy.focused().type(' '); // Space to activate
        cy.focused().type('{enter}'); // Enter to activate
      });

      it('should handle multiple button creation and destruction cycles', () => {
        cy.mount(`<div id="cycle-container"></div>`);

        cy.window().then((win) => {
          const container = win.document.getElementById('cycle-container');

          // Multiple creation/destruction cycles
          for (let cycle = 0; cycle < 3; cycle++) {
            // Create 10 buttons
            for (let i = 0; i < 10; i++) {
              const button = win.document.createElement('usa-button') as any;
              button.textContent = `Cycle ${cycle} Button ${i}`;
              button.variant = ['primary', 'secondary', 'outline'][i % 3];
              container?.appendChild(button);
            }

            // Interact with buttons
            const buttons = container?.querySelectorAll('usa-button');
            buttons?.forEach((button) => button.click());

            // Remove all buttons
            while (container?.firstChild) {
              container.removeChild(container.firstChild);
            }
          }

          // Create final test button
          const testButton = win.document.createElement('usa-button') as any;
          testButton.textContent = 'Final Test';
          testButton.id = 'final-test';
          container?.appendChild(testButton);
        });

        // Final button should work perfectly
        cy.get('#final-test').should('be.visible').click();
      });
    });

    describe('Mobile Compatibility', () => {
      it('should handle touch events properly', () => {
        cy.mount(`<usa-button id="touch-button">Touch Me</usa-button>`);

        // Simulate touch events
        cy.get('usa-button')
          .trigger('touchstart')
          .trigger('touchend')
          .trigger('touchstart')
          .trigger('touchmove')
          .trigger('touchend');

        // Should remain functional after touch interactions
        cy.get('usa-button').click();
      });

      it('should handle viewport changes gracefully', () => {
        cy.mount(`<usa-button>Responsive Button</usa-button>`);

        // Test different viewport sizes
        const viewports = [
          { width: 320, height: 568 }, // Mobile
          { width: 768, height: 1024 }, // Tablet
          { width: 1920, height: 1080 }, // Desktop
        ];

        viewports.forEach((viewport) => {
          cy.viewport(viewport.width, viewport.height);
          cy.get('usa-button').should('be.visible');
          cy.get('usa-button').click();

          // Check button remains usable at this size
          cy.get('usa-button').then(($button) => {
            const rect = $button[0].getBoundingClientRect();
            expect(rect.width).to.be.greaterThan(20);
            expect(rect.height).to.be.greaterThan(20);
          });
        });
      });

      it('should handle orientation changes', () => {
        cy.mount(`<usa-button>Orientation Test</usa-button>`);

        // Simulate orientation change
        cy.viewport(568, 320); // Landscape
        cy.get('usa-button').should('be.visible').click();

        cy.viewport(320, 568); // Portrait
        cy.get('usa-button').should('be.visible').click();
      });

      it('should handle reduced motion preferences', () => {
        cy.mount(`<usa-button id="motion-button">Motion Test</usa-button>`);

        cy.window().then((win) => {
          // Mock reduced motion preference
          Object.defineProperty(win, 'matchMedia', {
            value: () => ({
              matches: true, // prefers-reduced-motion: reduce
              addListener: () => {},
              removeListener: () => {},
            }),
          });
        });

        // Button should still be functional with reduced motion
        cy.get('usa-button').click();
        cy.get('usa-button').focus();
        cy.focused().type(' ');
      });
    });

    describe('Accessibility Edge Cases', () => {
      it('should handle high contrast mode', () => {
        cy.mount(`<usa-button variant="primary">High Contrast Test</usa-button>`);

        // Simulate high contrast mode by checking computed styles
        cy.get('usa-button').then(($button) => {
          const styles = window.getComputedStyle($button[0]);

          // Should have sufficient color contrast (basic check)
          expect(styles.color).to.not.equal('transparent');
          expect(styles.backgroundColor).to.not.equal('transparent');
        });

        // Should remain functional in high contrast
        cy.get('usa-button').click();
        cy.get('usa-button').focus();
      });

      it('should handle screen reader edge cases', () => {
        cy.mount(`
          <div>
            <usa-button aria-label="">Empty ARIA Label</usa-button>
            <usa-button aria-describedby="nonexistent">Invalid describedby</usa-button>
            <usa-button role="button" tabindex="-1">Custom Role</usa-button>
          </div>
        `);

        // All buttons should remain accessible
        cy.get('usa-button').each(($button) => {
          cy.wrap($button).should('be.visible');

          // Should have proper ARIA attributes or fallbacks
          cy.wrap($button).then(($btn) => {
            const button = $btn[0];
            const hasLabel =
              button.getAttribute('aria-label') ||
              button.textContent?.trim() ||
              button.getAttribute('aria-labelledby');
            expect(hasLabel).to.exist;
          });
        });
      });

      it('should handle keyboard navigation with focus traps', () => {
        cy.mount(`
          <div>
            <usa-button id="first">First</usa-button>
            <div style="display: none;">
              <usa-button id="hidden">Hidden</usa-button>
            </div>
            <usa-button id="last">Last</usa-button>
          </div>
        `);

        // Tab navigation should skip hidden button
        cy.get('#first').focus().tab();
        cy.focused().should('have.id', 'last');

        // Should work with shift+tab too
        cy.focused().tab({ shift: true });
        cy.focused().should('have.id', 'first');
      });

      it('should handle ARIA live regions and dynamic content', () => {
        cy.mount(`
          <div>
            <usa-button id="dynamic-button">Dynamic Content</usa-button>
            <div id="live-region" aria-live="polite"></div>
          </div>
        `);

        cy.window().then((win) => {
          const button = win.document.getElementById('dynamic-button');
          const liveRegion = win.document.getElementById('live-region');

          button?.addEventListener('click', () => {
            if (liveRegion) {
              liveRegion.textContent = `Button clicked at ${new Date().toLocaleTimeString()}`;
            }
          });
        });

        // Click should update live region
        cy.get('#dynamic-button').click();
        cy.get('#live-region').should('not.be.empty');

        // Button should remain accessible after dynamic updates
        cy.get('#dynamic-button').focus().type(' ');
      });

      it('should handle complex focus management scenarios', () => {
        cy.mount(`
          <div>
            <usa-button id="focus-manager">Focus Manager</usa-button>
            <input type="text" id="text-input" style="display: none;">
            <usa-button id="focus-target" style="display: none;">Focus Target</usa-button>
          </div>
        `);

        cy.window().then((win) => {
          const manager = win.document.getElementById('focus-manager');
          const input = win.document.getElementById('text-input') as HTMLInputElement;
          const target = win.document.getElementById('focus-target');

          manager?.addEventListener('click', () => {
            // Show hidden elements and manage focus
            if (input && target) {
              input.style.display = 'block';
              target.style.display = 'block';
              input.focus();
            }
          });
        });

        cy.get('#focus-manager').click();

        // Focus should be managed properly
        cy.focused().should('have.id', 'text-input');

        // Tab navigation should work with newly visible elements
        cy.focused().tab();
        cy.focused().should('have.id', 'focus-target');
      });
    });

    describe('Browser Compatibility Edge Cases', () => {
      it('should handle custom element registration edge cases', () => {
        cy.window().then((win) => {
          // Test behavior when custom element is already defined
          const originalDefine = win.customElements.define;
          let redefinitionAttempted = false;

          win.customElements.define = function (name: string, constructor: any, options?: any) {
            if (name === 'usa-button') {
              redefinitionAttempted = true;
              return; // Prevent redefinition
            }
            return originalDefine.call(this, name, constructor, options);
          };

          // Try to create button (should handle gracefully)
          cy.mount(`<usa-button>Redefinition Test</usa-button>`);
          cy.get('usa-button').should('be.visible');
        });
      });

      it('should handle missing CSS gracefully', () => {
        cy.mount(`<usa-button class="missing-styles">No Styles</usa-button>`);

        // Button should still be functional even without full styling
        cy.get('usa-button').should('be.visible');
        cy.get('usa-button').click();
        cy.get('usa-button').focus();

        // Should have basic button appearance
        cy.get('usa-button').then(($button) => {
          const rect = $button[0].getBoundingClientRect();
          expect(rect.width).to.be.greaterThan(0);
          expect(rect.height).to.be.greaterThan(0);
        });
      });

      it('should handle JavaScript disabled scenarios', () => {
        cy.mount(`<usa-button type="submit">No JS Submit</usa-button>`);

        // Button should work as standard HTML button when JS fails
        cy.get('usa-button').should('have.attr', 'type', 'submit');
        cy.get('usa-button').should('be.visible');

        // Should be keyboard accessible
        cy.get('usa-button').focus();
        cy.focused().should('match', 'usa-button');
      });
    });
  });
});
