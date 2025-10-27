import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-list.ts';
import type { USAList } from './usa-list.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USAList', () => {
  let element: USAList;

  beforeEach(() => {
    element = document.createElement('usa-list') as USAList;
    document.body.appendChild(element);
  });

  afterEach(async () => {
    // Wait for any pending updates to complete before cleanup
    // to avoid "ChildPart has no parentNode" errors
    if (element) {
      await element.updateComplete;
      // Give extra time for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    element.remove();
  });

  describe('Component Initialization', () => {
    it('should create component with default properties', () => {
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName).toBe('USA-LIST');
      expect(element.type).toBe('unordered');
      expect(element.unstyled).toBe(false);
    });

    it('should use light DOM rendering', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have correct default values', () => {
      expect(element.type).toBe('unordered');
      expect(element.unstyled).toBe(false);
    });
  });

  describe('List Type Property', () => {
    it('should handle type property changes', async () => {
      // Test unordered (default)
      element.type = 'unordered';
      await element.updateComplete;

      const ulElement = element.querySelector('ul.usa-list');
      expect(ulElement).not.toBeNull();
      expect(element.querySelector('ol.usa-list')).toBeNull();

      // Test ordered
      element.type = 'ordered';
      await element.updateComplete;

      const olElement = element.querySelector('ol.usa-list');
      expect(olElement).not.toBeNull();
      expect(element.querySelector('ul.usa-list')).toBeNull();
    });

    it('should reflect type changes in DOM structure', async () => {
      // Start with unordered
      element.type = 'unordered';
      await element.updateComplete;
      expect(element.querySelector('ul')).not.toBeNull();

      // Change to ordered
      element.type = 'ordered';
      await element.updateComplete;
      expect(element.querySelector('ol')).not.toBeNull();
      expect(element.querySelector('ul')).toBeNull();
    });

    it('should accept valid type values', async () => {
      const validTypes: Array<'unordered' | 'ordered'> = ['unordered', 'ordered'];

      for (const type of validTypes) {
        element.type = type;
        await element.updateComplete;
        expect(element.type).toBe(type);
      }
    });
  });

  describe('Unstyled Property', () => {
    it('should handle unstyled property', async () => {
      // Test default (styled)
      element.unstyled = false;
      await element.updateComplete;

      const listElement = element.querySelector('.usa-list');
      expect(listElement?.classList.contains('usa-list--unstyled')).toBe(false);

      // Test unstyled
      element.unstyled = true;
      await element.updateComplete;

      const unstyledElement = element.querySelector('.usa-list.usa-list--unstyled');
      expect(unstyledElement).not.toBeNull();
    });

    it('should reflect unstyled attribute', async () => {
      element.unstyled = true;
      await element.updateComplete;
      expect(element.hasAttribute('unstyled')).toBe(true);

      element.unstyled = false;
      await element.updateComplete;
      expect(element.hasAttribute('unstyled')).toBe(false);
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct base classes', async () => {
      await element.updateComplete;
      const listElement = element.querySelector('ul, ol');
      expect(listElement?.classList.contains('usa-list')).toBe(true);
    });

    it('should apply unstyled class when unstyled is true', async () => {
      element.unstyled = true;
      await element.updateComplete;

      const listElement = element.querySelector('.usa-list--unstyled');
      expect(listElement).not.toBeNull();
    });

    it('should not apply unstyled class when unstyled is false', async () => {
      element.unstyled = false;
      await element.updateComplete;

      const listElement = element.querySelector('.usa-list');
      expect(listElement?.classList.contains('usa-list--unstyled')).toBe(false);
    });
  });

  describe('ARIA and Accessibility', () => {
    it('should set role="list" for ordered lists', async () => {
      element.type = 'ordered';
      await element.updateComplete;
      expect(element.getAttribute('role')).toBe('list');
    });

    it('should not set role for unordered lists', async () => {
      element.type = 'unordered';
      await element.updateComplete;
      expect(element.hasAttribute('role')).toBe(false);
    });

    it('should update role when type changes', async () => {
      // Start unordered (no role)
      element.type = 'unordered';
      await element.updateComplete;
      expect(element.hasAttribute('role')).toBe(false);

      // Change to ordered (should have role)
      element.type = 'ordered';
      await element.updateComplete;
      expect(element.getAttribute('role')).toBe('list');

      // Change back to unordered (should remove role)
      element.type = 'unordered';
      await element.updateComplete;
      expect(element.hasAttribute('role')).toBe(false);
    });
  });

  describe('Content and Slotting', () => {
    it('should render slot element for content', async () => {
      await element.updateComplete;

      const slot = element.querySelector('slot');
      expect(slot).not.toBeNull();
    });

    it('should create list element structure', async () => {
      await element.updateComplete;

      const listElement = element.querySelector('ul, ol');
      expect(listElement).not.toBeNull();
      expect(listElement?.classList.contains('usa-list')).toBe(true);
    });

    it('should handle empty content structure', async () => {
      await element.updateComplete;

      const listElement = element.querySelector('ul, ol');
      expect(listElement).not.toBeNull();

      const slot = element.querySelector('slot');
      expect(slot).not.toBeNull();
    });
  });

  describe('List Item Organization', () => {
    it('should have reorganization method available', () => {
      expect(typeof (element as any).reorganizeListItems).toBe('function');
    });

    it('should handle reorganization without errors', async () => {
      await element.updateComplete;

      expect(() => {
        (element as any).reorganizeListItems();
      }).not.toThrow();
    });
  });

  describe('Dynamic Content Updates', () => {
    it('should handle type changes in DOM structure', async () => {
      // Start with unordered
      element.type = 'unordered';
      await element.updateComplete;
      expect(element.querySelector('ul')).not.toBeNull();
      expect(element.querySelector('ol')).toBeNull();

      // Change to ordered
      element.type = 'ordered';
      await element.updateComplete;
      expect(element.querySelector('ol')).not.toBeNull();
      expect(element.querySelector('ul')).toBeNull();
    });

    it('should handle property updates correctly', async () => {
      element.type = 'ordered';
      element.unstyled = true;
      await element.updateComplete;

      const listElement = element.querySelector('ol.usa-list.usa-list--unstyled');
      expect(listElement).not.toBeNull();
    });
  });

  // NOTE: Nested Lists tests removed - they manipulate DOM with appendChild/innerHTML
  // which conflicts with Lit's ChildPart rendering in jsdom, causing unhandled rejections.
  // These tests are fully covered in usa-list.component.cy.ts Cypress tests.

  describe('Error Handling', () => {
    it('should handle property changes gracefully', async () => {
      await element.updateComplete;

      expect(() => {
        element.type = 'ordered';
        element.unstyled = true;
      }).not.toThrow();
    });

    it('should handle multiple updates gracefully', async () => {
      element.type = 'ordered';
      await element.updateComplete;

      element.type = 'unordered';
      await element.updateComplete;

      element.unstyled = true;
      await element.updateComplete;

      expect(element.querySelector('ul.usa-list.usa-list--unstyled')).not.toBeNull();
    });
  });

  describe('Application Use Cases', () => {
    it('should support ordered lists for procedural steps', async () => {
      element.type = 'ordered';
      await element.updateComplete;

      const orderedList = element.querySelector('ol.usa-list');
      expect(orderedList).not.toBeNull();
      expect(element.getAttribute('role')).toBe('list');
    });

    it('should support unordered lists for document requirements', async () => {
      element.type = 'unordered';
      await element.updateComplete;

      const unorderedList = element.querySelector('ul.usa-list');
      expect(unorderedList).not.toBeNull();
      expect(element.hasAttribute('role')).toBe(false);
    });

    it('should support unstyled lists for agency contacts', async () => {
      element.type = 'unordered';
      element.unstyled = true;
      await element.updateComplete;

      const unstyledList = element.querySelector('ul.usa-list.usa-list--unstyled');
      expect(unstyledList).not.toBeNull();
    });

    it('should provide accessible ordered lists for eligibility criteria', async () => {
      element.type = 'ordered';
      await element.updateComplete;

      const criteriaList = element.querySelector('ol.usa-list');
      expect(criteriaList).not.toBeNull();
      expect(element.getAttribute('role')).toBe('list');
    });

    it('should handle benefits information as unordered list', async () => {
      element.type = 'unordered';
      await element.updateComplete;

      const benefitsList = element.querySelector('ul.usa-list');
      expect(benefitsList).not.toBeNull();

      const slot = benefitsList?.querySelector('slot');
      expect(slot).not.toBeNull();
    });
  });

  describe('Component Lifecycle', () => {
    it('should properly initialize on connection', async () => {
      const newElement = document.createElement('usa-list') as USAList;
      newElement.type = 'ordered';

      document.body.appendChild(newElement);
      await newElement.updateComplete;

      expect(newElement.querySelector('ol.usa-list')).not.toBeNull();
      expect(newElement.getAttribute('role')).toBe('list');

      newElement.remove();
    });
  });

  describe('Integration Scenarios', () => {
    it('should support complex government content structure', async () => {
      element.type = 'ordered';
      await element.updateComplete;

      const mainList = element.querySelector('ol.usa-list');
      expect(mainList).not.toBeNull();
      expect(element.getAttribute('role')).toBe('list');

      const slot = mainList?.querySelector('slot');
      expect(slot).not.toBeNull();
    });

    it('should maintain accessibility with ordered content', async () => {
      element.type = 'ordered';
      await element.updateComplete;

      expect(element.getAttribute('role')).toBe('list');

      const orderedList = element.querySelector('ol.usa-list');
      expect(orderedList).not.toBeNull();

      // Verify the list has proper structure for slotted content
      const slot = orderedList?.querySelector('slot');
      expect(slot).not.toBeNull();
    });
  });

  describe('CSS Class Application', () => {
    it('should apply correct USWDS classes to list elements', async () => {
      await element.updateComplete;

      const listElement = element.querySelector('ul, ol');
      expect(listElement).toBeTruthy();
      expect(listElement?.classList.contains('usa-list')).toBe(true);
    });

    it('should apply unstyled class when unstyled property is true', async () => {
      element.unstyled = true;
      await element.updateComplete;

      const listElement = element.querySelector('ul, ol');
      expect(listElement?.classList.contains('usa-list--unstyled')).toBe(true);
    });
  });

  // CRITICAL TESTS - Auto-dismiss prevention and lifecycle stability
  describe('CRITICAL: Component Lifecycle Stability', () => {
    it('should remain in DOM after property changes', async () => {
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Test critical property combinations that could cause auto-dismiss
      const criticalPropertySets = [
        { type: 'unordered', unstyled: false },
        { type: 'ordered', unstyled: false },
        { type: 'unordered', unstyled: true },
        { type: 'ordered', unstyled: true },
      ];

      for (const properties of criticalPropertySets) {
        Object.assign(element, properties);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain DOM connection during rapid property updates', async () => {
      const rapidUpdates = async () => {
        for (let i = 0; i < 10; i++) {
          element.type = i % 2 === 0 ? 'unordered' : 'ordered';
          element.unstyled = i % 3 === 0;
          await element.updateComplete;
          expect(document.body.contains(element)).toBe(true);
          expect(element.isConnected).toBe(true);
        }
      };

      await rapidUpdates();
    });

    it('should survive complete property reset cycles', async () => {
      element.type = 'ordered';
      element.unstyled = true;
      await element.updateComplete;

      // Reset all properties
      element.type = 'unordered';
      element.unstyled = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Set properties again
      element.type = 'ordered';
      element.unstyled = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    it('should not pollute global event handlers', async () => {
      const originalAddEventListener = document.addEventListener;
      const originalRemoveEventListener = document.removeEventListener;
      const addEventListenerSpy = vi.fn(originalAddEventListener);
      const removeEventListenerSpy = vi.fn(originalRemoveEventListener);

      document.addEventListener = addEventListenerSpy;
      document.removeEventListener = removeEventListenerSpy;

      element.type = 'ordered';
      await element.updateComplete;

      document.addEventListener = originalAddEventListener;
      document.removeEventListener = originalRemoveEventListener;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle custom events without side effects', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('custom-event', eventSpy);

      element.type = 'ordered';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('custom-event', eventSpy);
    });

    it('should maintain DOM connection during event handling', async () => {
      const testEvent = () => {
        element.type = 'ordered';
        element.unstyled = true;
      };

      element.addEventListener('click', testEvent);
      element.click();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('click', testEvent);
    });
  });

  describe('CRITICAL: List State Management Stability', () => {
    it('should maintain DOM connection during list type transitions', async () => {
      // Start with unordered
      element.type = 'unordered';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Change to ordered
      element.type = 'ordered';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Back to unordered
      element.type = 'unordered';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM connection during styling changes', async () => {
      const stylingConfigs = [{ unstyled: false }, { unstyled: true }, { unstyled: false }];

      for (const config of stylingConfigs) {
        Object.assign(element, config);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should handle list reorganization without DOM removal', async () => {
      element.type = 'ordered';
      await element.updateComplete;

      // Call reorganization method
      if (typeof (element as any).reorganizeListItems === 'function') {
        (element as any).reorganizeListItems();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Storybook Integration Stability', () => {
    it('should maintain DOM connection during args updates', async () => {
      const storybookArgs = [
        { type: 'unordered', unstyled: false },
        { type: 'ordered', unstyled: false },
        { type: 'unordered', unstyled: true },
        { type: 'ordered', unstyled: true },
      ];

      for (const args of storybookArgs) {
        Object.assign(element, args);
        await element.updateComplete;

        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should survive Storybook control panel interactions', async () => {
      const interactions = [
        () => {
          element.type = 'ordered';
        },
        () => {
          element.type = 'unordered';
        },
        () => {
          element.unstyled = true;
        },
        () => {
          element.unstyled = false;
        },
        () => {
          element.type = 'ordered';
          element.unstyled = true;
        },
        () => {
          element.type = 'unordered';
          element.unstyled = false;
        },
      ];

      for (const interaction of interactions) {
        interaction();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should handle Storybook story switching', async () => {
      // Simulate story 1 args - Unordered list
      element.type = 'unordered';
      element.unstyled = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 2 args - Ordered list
      element.type = 'ordered';
      element.unstyled = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 3 args - Unstyled list
      element.type = 'unordered';
      element.unstyled = true;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath =
          `${process.cwd()}/src/components/list/usa-list.ts`;
        const validation = validateComponentJavaScript(componentPath, 'list');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  // NOTE: Accessibility tests with innerHTML manipulation moved to Cypress
  // See: packages/uswds-wc-data-display/src/components/list/usa-list.component.cy.ts
  // These tests require real browser DOM manipulation which conflicts with Lit's ChildPart rendering in jsdom
  //
  // All keyboard navigation tests removed - they use appendChild with innerHTML which causes
  // Lit ChildPart errors in jsdom. These tests are fully covered in usa-list.component.cy.ts
});
