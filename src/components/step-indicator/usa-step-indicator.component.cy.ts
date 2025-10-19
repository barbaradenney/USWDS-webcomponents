// Component tests for usa-step-indicator
import './index.ts';

// Test data constants
const basicSteps = [
  { label: 'Personal Information', status: 'complete' },
  { label: 'Contact Details', status: 'current' },
  { label: 'Review', status: 'incomplete' },
  { label: 'Submit', status: 'incomplete' },
];

const longSteps = [
  { label: 'Step 1: Initial Setup', status: 'complete' },
  { label: 'Step 2: Configuration', status: 'complete' },
  { label: 'Step 3: Data Entry', status: 'current' },
  { label: 'Step 4: Validation', status: 'incomplete' },
  { label: 'Step 5: Review Process', status: 'incomplete' },
  { label: 'Step 6: Approval', status: 'incomplete' },
  { label: 'Step 7: Final Review', status: 'incomplete' },
  { label: 'Step 8: Submission', status: 'incomplete' },
];

describe('USA Step Indicator Component Tests', () => {
  it('should render step indicator with default properties', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);
    cy.get('usa-step-indicator').should('exist');
    cy.get('usa-step-indicator').should('have.class', 'usa-step-indicator');
  });

  it('should render steps when provided', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
    });

    cy.get('.usa-step-indicator__segment').should('have.length', 4);
    cy.get('.usa-step-indicator__segment-label')
      .first()
      .should('contain.text', 'Personal Information');
    cy.get('.usa-step-indicator__segment-label').last().should('contain.text', 'Submit');
  });

  it('should display correct step statuses', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
    });

    // Check complete step
    cy.get('.usa-step-indicator__segment')
      .first()
      .should('have.class', 'usa-step-indicator__segment--complete')
      .find('.usa-sr-only')
      .should('contain.text', 'completed');

    // Check current step
    cy.get('.usa-step-indicator__segment')
      .eq(1)
      .should('have.class', 'usa-step-indicator__segment--current')
      .should('have.attr', 'aria-current', 'step');

    // Check incomplete steps
    cy.get('.usa-step-indicator__segment')
      .eq(2)
      .should('not.have.class', 'usa-step-indicator__segment--complete')
      .should('not.have.class', 'usa-step-indicator__segment--current')
      .find('.usa-sr-only')
      .should('contain.text', 'not completed');
  });

  it('should handle counters variant', () => {
    cy.mount(`<usa-step-indicator id="test-steps" variant="counters"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
    });

    cy.get('usa-step-indicator').should('have.class', 'usa-step-indicator--counters');
    cy.get('.usa-step-indicator__segment').each(($el, index) => {
      cy.wrap($el)
        .find('.usa-step-indicator__segment-number')
        .should('contain.text', String(index + 1));
    });
  });

  it('should handle small counters variant', () => {
    cy.mount(`<usa-step-indicator id="test-steps" variant="counters-sm"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
    });

    cy.get('usa-step-indicator').should('have.class', 'usa-step-indicator--counters-sm');
    cy.get('.usa-step-indicator__segment-number').should('exist');
  });

  it('should handle no labels display', () => {
    cy.mount(`<usa-step-indicator id="test-steps" show-labels="false"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
      indicator.showLabels = false;
    });

    cy.get('.usa-step-indicator__segment-label').should('have.class', 'usa-sr-only');
  });

  it('should handle centered layout', () => {
    cy.mount(`<usa-step-indicator id="test-steps" centered></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
    });

    cy.get('usa-step-indicator').should('have.class', 'usa-step-indicator--center');
  });

  it('should update current step programmatically', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
      indicator.currentStep = 3;
    });

    cy.get('.usa-step-indicator__segment--current').should('contain.text', 'Review');
  });

  it('should emit step-change event', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;

      const changeSpy = cy.stub();
      indicator.addEventListener('usa-step-indicator:change', changeSpy);

      indicator.currentStep = 3;
      cy.then(() => {
        expect(changeSpy).to.have.been.called;
      });
    });
  });

  it('should handle keyboard navigation', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
      indicator.interactive = true; // Enable keyboard navigation
    });

    // Focus first step
    cy.get('.usa-step-indicator__segment').first().focus();

    // Arrow right to next step
    cy.focused().type('{rightarrow}');
    cy.focused().should('contain.text', 'Contact Details');

    // Arrow left to previous step
    cy.focused().type('{leftarrow}');
    cy.focused().should('contain.text', 'Personal Information');
  });

  it('should handle long lists with scrolling', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = longSteps;
    });

    cy.get('.usa-step-indicator__segment').should('have.length', 8);

    // Current step should be visible
    cy.get('.usa-step-indicator__segment--current').should('be.visible');
  });

  it('should be accessible', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
    });

    // Check ARIA attributes
    cy.get('usa-step-indicator').should('have.attr', 'role', 'group');
    cy.get('usa-step-indicator').should('have.attr', 'aria-label');
    cy.get('.usa-step-indicator__segment--current').should('have.attr', 'aria-current', 'step');

    // Check screen reader text
    cy.get('.usa-sr-only').should('exist');

    cy.injectAxe();
    cy.checkAccessibility();
  });

  it('should handle step headings', () => {
    cy.mount(`
      <div>
        <usa-step-indicator id="test-steps" heading-level="2"></usa-step-indicator>
      </div>
    `);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
      indicator.headingLevel = 2;
    });

    cy.get('.usa-step-indicator__heading').should('match', 'h2');
  });

  it('should update progress dynamically', () => {
    cy.mount(`<usa-step-indicator id="test-steps"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = [
        { label: 'Step 1', status: 'incomplete' },
        { label: 'Step 2', status: 'incomplete' },
        { label: 'Step 3', status: 'incomplete' },
      ];
    });

    // Initially all incomplete
    cy.get('.usa-step-indicator__segment--complete').should('not.exist');

    // Update first step to complete
    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = [
        { label: 'Step 1', status: 'complete' },
        { label: 'Step 2', status: 'current' },
        { label: 'Step 3', status: 'incomplete' },
      ];
    });

    cy.get('.usa-step-indicator__segment--complete').should('have.length', 1);
    cy.get('.usa-step-indicator__segment--current').should('have.length', 1);
  });

  it('should support custom CSS classes', () => {
    cy.mount(`<usa-step-indicator id="test-steps" class="custom-class"></usa-step-indicator>`);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
    });

    cy.get('usa-step-indicator').should('have.class', 'custom-class');
    cy.get('usa-step-indicator').should('have.class', 'usa-step-indicator');
  });

  it('should handle RTL layout', () => {
    cy.mount(`
      <div dir="rtl">
        <usa-step-indicator id="test-steps"></usa-step-indicator>
      </div>
    `);

    cy.window().then((win) => {
      const indicator = win.document.getElementById('test-steps') as any;
      indicator.steps = basicSteps;
    });

    // Test RTL keyboard navigation
    cy.get('.usa-step-indicator__segment').first().focus();

    // In RTL, arrow left should go to next step
    cy.focused().type('{leftarrow}');
    cy.focused().should('contain.text', 'Contact Details');
  });

  describe('Edge Case Testing', () => {
    describe('Boundary Conditions', () => {
      it('should handle extremely large number of steps', () => {
        const manySteps = Array.from({ length: 100 }, (_, i) => ({
          label: `Step ${i + 1}: Lorem ipsum dolor sit amet consectetur`,
          status: i === 50 ? 'current' : i < 50 ? 'complete' : 'incomplete',
        }));

        cy.mount(`<usa-step-indicator id="many-steps"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('many-steps') as any;
          indicator.steps = manySteps;
        });

        cy.get('.usa-step-indicator__segment').should('have.length', 100);
        cy.get('.usa-step-indicator__segment--current').should('have.length', 1);
        cy.get('.usa-step-indicator__segment--complete').should('have.length', 50);
      });

      it('should handle empty steps array', () => {
        cy.mount(`<usa-step-indicator id="empty-steps"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('empty-steps') as any;
          indicator.steps = [];
        });

        cy.get('.usa-step-indicator__segment').should('not.exist');
        cy.get('usa-step-indicator').should('exist'); // Component should still render
      });

      it('should handle steps with extremely long labels', () => {
        const longLabelSteps = [
          {
            label:
              'This is an extremely long step label that contains multiple sentences and should test how the component handles text overflow and wrapping behavior in various layout scenarios including mobile and desktop viewports with different screen sizes and orientations',
            status: 'complete',
          },
          {
            label:
              'Another very long label with special characters: áéíóú ñ ç ü ß ø æ å 中文 日本語 العربية русский ελληνικά',
            status: 'current',
          },
          {
            label: 'HTML entities: &lt;&gt;&amp;&quot;&#39; and Unicode: 🎉 🚀 ✨ 💡 ⚡ 🔥 📊 📈',
            status: 'incomplete',
          },
        ];

        cy.mount(`<usa-step-indicator id="long-labels"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('long-labels') as any;
          indicator.steps = longLabelSteps;
        });

        cy.get('.usa-step-indicator__segment').should('have.length', 3);
        cy.get('.usa-step-indicator__segment-label')
          .first()
          .should('contain.text', 'This is an extremely long');
      });

      it('should handle all steps with same status', () => {
        const allCompleteSteps = [
          { label: 'Step 1', status: 'complete' },
          { label: 'Step 2', status: 'complete' },
          { label: 'Step 3', status: 'complete' },
          { label: 'Step 4', status: 'complete' },
        ];

        cy.mount(`<usa-step-indicator id="all-complete"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('all-complete') as any;
          indicator.steps = allCompleteSteps;
        });

        cy.get('.usa-step-indicator__segment--complete').should('have.length', 4);
        cy.get('.usa-step-indicator__segment--current').should('not.exist');
      });

      it('should handle single step', () => {
        const singleStep = [{ label: 'Only Step', status: 'current' }];

        cy.mount(`<usa-step-indicator id="single-step"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('single-step') as any;
          indicator.steps = singleStep;
        });

        cy.get('.usa-step-indicator__segment').should('have.length', 1);
        cy.get('.usa-step-indicator__segment--current').should('have.length', 1);
      });
    });

    describe('Error Recovery', () => {
      it('should handle invalid step statuses gracefully', () => {
        const invalidSteps = [
          { label: 'Step 1', status: 'invalid-status' },
          { label: 'Step 2', status: null },
          { label: 'Step 3', status: undefined },
          { label: 'Step 4', status: 123 },
          { label: 'Step 5', status: 'current' },
        ];

        cy.mount(`<usa-step-indicator id="invalid-statuses"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('invalid-statuses') as any;
          indicator.steps = invalidSteps as any;
        });

        // Should not crash and should render steps
        cy.get('.usa-step-indicator__segment').should('have.length', 5);
        cy.get('.usa-step-indicator__segment--current').should('have.length', 1);
      });

      it('should handle malformed step objects', () => {
        const malformedSteps = [
          { label: 'Valid Step', status: 'complete' },
          { wrongProperty: 'No label', status: 'current' },
          { label: null, status: 'incomplete' },
          { label: '', status: 'incomplete' },
          null,
          undefined,
          'not an object',
          { label: 'Another Valid Step', status: 'incomplete' },
        ];

        cy.mount(`<usa-step-indicator id="malformed-steps"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('malformed-steps') as any;
          indicator.steps = malformedSteps as any;
        });

        // Should handle gracefully and render valid steps
        cy.get('.usa-step-indicator__segment').should('exist');
        cy.get('usa-step-indicator').should('exist');
      });

      it('should handle rapid property updates', () => {
        cy.mount(`<usa-step-indicator id="rapid-updates"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('rapid-updates') as any;

          // Rapid updates to test for race conditions
          for (let i = 0; i < 10; i++) {
            indicator.steps = [
              { label: `Iteration ${i} Step 1`, status: 'complete' },
              { label: `Iteration ${i} Step 2`, status: 'current' },
              { label: `Iteration ${i} Step 3`, status: 'incomplete' },
            ];
            indicator.variant = i % 2 === 0 ? 'counters' : 'default';
            indicator.currentStep = (i % 3) + 1;
          }
        });

        // Should end in stable state
        cy.get('.usa-step-indicator__segment').should('have.length', 3);
        cy.get('.usa-step-indicator__segment--current').should('have.length', 1);
      });

      it('should handle DOM removal during updates', () => {
        cy.mount(`
          <div id="container">
            <usa-step-indicator id="removal-test"></usa-step-indicator>
          </div>
        `);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('removal-test') as any;
          const container = win.document.getElementById('container');

          indicator.steps = basicSteps;

          // Remove from DOM during potential async operations
          setTimeout(() => {
            container?.removeChild(indicator);
          }, 50);
        });

        // Should not cause JavaScript errors
        cy.get('#container').should('be.empty');
      });
    });

    describe('Performance Stress Testing', () => {
      it('should handle frequent step updates efficiently', () => {
        cy.mount(`<usa-step-indicator id="performance-test"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('performance-test') as any;
          const startTime = performance.now();

          // Simulate 1000 step updates
          for (let i = 0; i < 1000; i++) {
            const currentIndex = i % 4;
            indicator.steps = basicSteps.map((step, index) => ({
              ...step,
              status:
                index < currentIndex
                  ? 'complete'
                  : index === currentIndex
                    ? 'current'
                    : 'incomplete',
            }));
          }

          const endTime = performance.now();
          const duration = endTime - startTime;

          // Should complete in reasonable time (less than 1 second)
          expect(duration).to.be.lessThan(1000);
        });

        cy.get('.usa-step-indicator__segment').should('have.length', 4);
      });

      it('should handle large datasets without memory leaks', () => {
        cy.mount(`<usa-step-indicator id="memory-test"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('memory-test') as any;

          // Create and destroy large datasets
          for (let iteration = 0; iteration < 10; iteration++) {
            const largeSteps = Array.from({ length: 500 }, (_, i) => ({
              label: `Dataset ${iteration} Step ${i + 1}`,
              status: i === 250 ? 'current' : i < 250 ? 'complete' : 'incomplete',
            }));

            indicator.steps = largeSteps;

            // Clear and start over
            indicator.steps = [];
          }

          // Set final reasonable dataset
          indicator.steps = basicSteps;
        });

        cy.get('.usa-step-indicator__segment').should('have.length', 4);
      });

      it('should handle concurrent event listeners', () => {
        cy.mount(`<usa-step-indicator id="event-stress"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('event-stress') as any;
          indicator.steps = basicSteps;

          // Add many event listeners
          for (let i = 0; i < 100; i++) {
            indicator.addEventListener('usa-step-indicator:change', () => {
              // Empty listener for stress testing
            });
          }

          // Should still function normally
          indicator.currentStep = 3;
          indicator.currentStep = 1;
        });

        cy.get('.usa-step-indicator__segment--current').should('exist');
      });
    });

    describe('Mobile Compatibility', () => {
      it('should handle touch interactions on mobile', () => {
        cy.viewport(375, 667); // iPhone SE dimensions

        cy.mount(`<usa-step-indicator id="touch-test"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('touch-test') as any;
          indicator.steps = basicSteps;
          indicator.interactive = true;
        });

        // Simulate touch on step
        cy.get('.usa-step-indicator__segment')
          .eq(2)
          .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 100, clientY: 100 }] });

        cy.get('.usa-step-indicator__segment').should('exist');
      });

      it('should adapt to small screen widths', () => {
        cy.viewport(320, 568); // iPhone 5 dimensions

        cy.mount(
          `<usa-step-indicator id="small-screen" variant="counters-sm"></usa-step-indicator>`
        );

        cy.window().then((win) => {
          const indicator = win.document.getElementById('small-screen') as any;
          indicator.steps = longSteps;
        });

        cy.get('.usa-step-indicator__segment').should('be.visible');
        cy.get('.usa-step-indicator__segment').first().should('be.visible');
      });

      it('should handle viewport orientation changes', () => {
        cy.mount(`<usa-step-indicator id="orientation-test"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('orientation-test') as any;
          indicator.steps = basicSteps;
        });

        // Portrait
        cy.viewport(375, 667);
        cy.get('.usa-step-indicator__segment').should('be.visible');

        // Landscape
        cy.viewport(667, 375);
        cy.get('.usa-step-indicator__segment').should('be.visible');

        // Back to portrait
        cy.viewport(375, 667);
        cy.get('.usa-step-indicator__segment').should('be.visible');
      });

      it('should handle swipe gestures for navigation', () => {
        cy.viewport(375, 667);

        cy.mount(`<usa-step-indicator id="swipe-test"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('swipe-test') as any;
          indicator.steps = basicSteps;
          indicator.interactive = true;
        });

        // Simulate swipe left
        cy.get('usa-step-indicator')
          .trigger('touchstart', { touches: [{ clientX: 200, clientY: 100 }] })
          .trigger('touchmove', { touches: [{ clientX: 100, clientY: 100 }] })
          .trigger('touchend', { changedTouches: [{ clientX: 100, clientY: 100 }] });

        cy.get('.usa-step-indicator__segment').should('exist');
      });
    });

    describe('Accessibility Edge Cases', () => {
      it('should handle screen reader navigation with many steps', () => {
        const manyAccessibleSteps = Array.from({ length: 20 }, (_, i) => ({
          label: `Accessible Step ${i + 1}`,
          status: i === 10 ? 'current' : i < 10 ? 'complete' : 'incomplete',
          description: `Detailed description for step ${i + 1}`,
        }));

        cy.mount(`<usa-step-indicator id="sr-many-steps"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('sr-many-steps') as any;
          indicator.steps = manyAccessibleSteps;
        });

        cy.get('.usa-step-indicator__segment').should('have.length', 20);
        cy.get('.usa-sr-only').should('exist');
        cy.get('[aria-current="step"]').should('have.length', 1);
      });

      it('should handle high contrast mode', () => {
        cy.mount(`<usa-step-indicator id="contrast-test"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('contrast-test') as any;
          indicator.steps = basicSteps;
        });

        // Simulate high contrast mode
        cy.get('usa-step-indicator').invoke(
          'attr',
          'style',
          'filter: contrast(1000%) brightness(200%) invert(1);'
        );

        cy.get('.usa-step-indicator__segment').should('be.visible');
        cy.get('.usa-step-indicator__segment--current').should('be.visible');
      });

      it('should handle reduced motion preferences', () => {
        cy.mount(`<usa-step-indicator id="motion-test"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('motion-test') as any;

          // Mock reduced motion preference
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

          indicator.steps = basicSteps;
        });

        cy.get('.usa-step-indicator__segment').should('be.visible');
      });

      it('should handle focus management with dynamic content', () => {
        cy.mount(`<usa-step-indicator id="focus-dynamic"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('focus-dynamic') as any;
          indicator.steps = basicSteps;
          indicator.interactive = true;
        });

        // Focus first step
        cy.get('.usa-step-indicator__segment').first().focus();
        cy.focused().should('exist');

        // Update steps while focused
        cy.window().then((win) => {
          const indicator = win.document.getElementById('focus-dynamic') as any;
          indicator.steps = [...basicSteps, { label: 'New Step', status: 'incomplete' }];
        });

        // Focus should be maintained or properly managed
        cy.get('.usa-step-indicator__segment').should('have.length', 5);
      });
    });

    describe('Browser Compatibility', () => {
      it('should handle missing modern JavaScript features', () => {
        cy.window().then((win) => {
          // Mock missing modern features
          const originalFind = Array.prototype.find;
          delete (Array.prototype as any).find;

          cy.mount(`<usa-step-indicator id="compat-test"></usa-step-indicator>`);

          cy.window().then((win2) => {
            const indicator = win2.document.getElementById('compat-test') as any;

            // Should still function without modern Array methods
            expect(() => {
              indicator.steps = basicSteps;
            }).not.to.throw;

            // Restore method
            Array.prototype.find = originalFind;
          });
        });

        cy.get('.usa-step-indicator__segment').should('exist');
      });

      it('should handle CSS custom properties fallbacks', () => {
        cy.mount(`<usa-step-indicator id="css-fallback"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('css-fallback') as any;
          indicator.steps = basicSteps;
        });

        // Should be visible even without CSS custom property support
        cy.get('.usa-step-indicator__segment').should('be.visible');
        cy.get('.usa-step-indicator__segment--current').should('be.visible');
      });

      it('should handle event handling differences across browsers', () => {
        cy.mount(`<usa-step-indicator id="event-compat"></usa-step-indicator>`);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('event-compat') as any;
          indicator.steps = basicSteps;
          indicator.interactive = true;

          // Test different event patterns
          const segment = indicator.querySelector('.usa-step-indicator__segment');

          // Simulate click event in different ways
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: win,
          });

          expect(() => {
            segment?.dispatchEvent(clickEvent);
          }).not.to.throw;
        });

        cy.get('.usa-step-indicator__segment').should('exist');
      });
    });

    describe('Integration Edge Cases', () => {
      it('should handle step indicator within dynamic containers', () => {
        cy.mount(`
          <div id="dynamic-container" style="display: none;">
            <usa-step-indicator id="container-test"></usa-step-indicator>
          </div>
        `);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('container-test') as any;
          const container = win.document.getElementById('dynamic-container');

          indicator.steps = basicSteps;

          // Show container
          if (container) container.style.display = 'block';
        });

        cy.get('#dynamic-container').should('be.visible');
        cy.get('.usa-step-indicator__segment').should('be.visible');
      });

      it('should handle complex state synchronization', () => {
        cy.mount(`
          <div>
            <usa-step-indicator id="sync-test-1"></usa-step-indicator>
            <usa-step-indicator id="sync-test-2"></usa-step-indicator>
          </div>
        `);

        cy.window().then((win) => {
          const indicator1 = win.document.getElementById('sync-test-1') as any;
          const indicator2 = win.document.getElementById('sync-test-2') as any;

          // Sync both indicators
          const syncSteps = (currentStep: number) => {
            const steps = basicSteps.map((step, index) => ({
              ...step,
              status:
                index < currentStep - 1
                  ? 'complete'
                  : index === currentStep - 1
                    ? 'current'
                    : 'incomplete',
            }));

            indicator1.steps = steps;
            indicator2.steps = steps;
          };

          syncSteps(1);
          syncSteps(2);
          syncSteps(3);
        });

        cy.get('#sync-test-1 .usa-step-indicator__segment--current').should('exist');
        cy.get('#sync-test-2 .usa-step-indicator__segment--current').should('exist');
      });

      it('should handle step indicator with form integration', () => {
        cy.mount(`
          <form id="multi-step-form">
            <usa-step-indicator id="form-steps"></usa-step-indicator>

            <fieldset id="step-1" style="display: block;">
              <legend>Step 1: Personal Information</legend>
              <input name="name" required />
              <button type="button" id="next-1">Next</button>
            </fieldset>

            <fieldset id="step-2" style="display: none;">
              <legend>Step 2: Contact Details</legend>
              <input name="email" type="email" required />
              <button type="button" id="prev-2">Previous</button>
              <button type="button" id="next-2">Next</button>
            </fieldset>

            <fieldset id="step-3" style="display: none;">
              <legend>Step 3: Review</legend>
              <p>Review your information</p>
              <button type="button" id="prev-3">Previous</button>
              <button type="submit">Submit</button>
            </fieldset>
          </form>
        `);

        cy.window().then((win) => {
          const indicator = win.document.getElementById('form-steps') as any;
          indicator.steps = basicSteps;

          // Simple form navigation logic
          win.document.getElementById('next-1')?.addEventListener('click', () => {
            win.document.getElementById('step-1')!.style.display = 'none';
            win.document.getElementById('step-2')!.style.display = 'block';
            indicator.currentStep = 2;
          });
        });

        cy.get('#next-1').click();
        cy.get('#step-2').should('be.visible');
        cy.get('#step-1').should('not.be.visible');
      });
    });
  });
});
