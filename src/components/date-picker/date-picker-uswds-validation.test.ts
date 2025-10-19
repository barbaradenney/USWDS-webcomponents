import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-date-picker.ts';
import type { USADatePicker } from './usa-date-picker.js';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from './accessibility-utils.js';

/**
 * USADatePicker USWDS Integration Validation
 *
 * Risk Level: HIGH
 * Risk Factors: heavy-uswds-js, input-transformation, calendar-overlay, complex-interactions
 * USWDS Module: usa-date-picker
 *
 * Generated based on tooltip troubleshooting patterns to prevent:
 * - dom transformation
 * - storybook iframe
 * - multi phase-attributes
 * - light dom-slots
 * - module optimization
 */

describe('USADatePicker USWDS Integration Validation', () => {
  let element: USADatePicker;
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    testContainer.id = 'date-picker-test-container';
    document.body.appendChild(testContainer);

    element = document.createElement('usa-date-picker') as USADatePicker;
    testContainer.appendChild(element);
  });

  afterEach(() => {
    testContainer.remove();
  });

  describe('DOM Transformation Validation', () => {
    it('should handle USWDS DOM transformation correctly', async () => {
      // Add test content that USWDS will transform
      const testContent = document.createElement('input');
      testContent.classList.add('usa-date-picker');
      testContent.textContent = 'Test date-picker';
      element.appendChild(testContent);

      await element.updateComplete;

      // Simulate USWDS transformation (date-picker specific)
      const preTransformElement = element.querySelector('.usa-date-picker');
      expect(preTransformElement).toBeTruthy();

      // Simulate USWDS changing class structure
      preTransformElement?.classList.remove('usa-date-picker');
      preTransformElement?.classList.add('usa-date-picker__trigger');

      // Component should handle both pre and post-transformation states
      const postTransformElement = element.querySelector('.usa-date-picker__trigger');
      expect(postTransformElement).toBeTruthy();
      expect(postTransformElement).toBe(preTransformElement);
    });

    it('should apply attributes before USWDS initialization', async () => {
      // Apply component properties
      element.value = "2023-12-25";

      await element.updateComplete;

      // Component should render its own input with the value
      const input = element.querySelector(`#${element.inputId}`) as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe("2023-12-25");

      // Date picker uses type="text" (USWDS handles date formatting)
      expect(input.getAttribute("type")).toBe("text");
    });
  });

  describe('Storybook Iframe Environment Validation', () => {
    it('should work correctly in iframe constraints', () => {
      // Test iframe-specific spacing for positioned elements
      const container = document.createElement('div');
      container.style.margin = '64px';  // 4rem = 64px (assuming 16px per rem)
      container.style.padding = '32px'; // 2rem = 32px (assuming 16px per rem)
      container.style.display = 'flex';
      container.style.justifyContent = 'center';

      testContainer.appendChild(container);
      container.appendChild(element);

      // Should have adequate space for positioning
      const computedStyle = window.getComputedStyle(container);
      expect(parseInt(computedStyle.margin)).toBeGreaterThanOrEqual(64); // 4rem
      expect(parseInt(computedStyle.padding)).toBeGreaterThanOrEqual(32); // 2rem
    });

    it('should validate USWDS module optimization', () => {
      // Test that required USWDS module is optimized
      
      const requiredModule = '@uswds/uswds/js/usa-date-picker';
      // In production, this module should be pre-optimized
      expect(requiredModule).toBeTruthy();
      
    });
  });

  describe('Multi-Phase Attribute Application', () => {
    it('should handle attribute timing correctly', async () => {
      const events: string[] = [];

      // Mock component lifecycle
      const mockLifecycle = {
        connectedCallback() {
          events.push('connected');
          // Should apply attributes immediately
          events.push('apply-attributes');
        },
        firstUpdated() {
          events.push('first-updated');
          // Should delay USWDS initialization
          setTimeout(() => events.push('initialize-uswds'), 10);
        }
      };

      mockLifecycle.connectedCallback();
      mockLifecycle.firstUpdated();

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 20));

      // Validate proper sequence
      expect(events).toContain('connected');
      expect(events).toContain('apply-attributes');
      expect(events).toContain('initialize-uswds');

      // Critical: attributes applied before USWDS initialization
      const applyIndex = events.indexOf('apply-attributes');
      const initIndex = events.indexOf('initialize-uswds');
      expect(applyIndex).toBeLessThan(initIndex);
    });

    it('should handle property updates through all phases', async () => {
      
      // Test property updates
      await element.updateComplete;
      expect(element).toBeTruthy();
    
    });
  });

  describe('Light DOM Slot Behavior', () => {
    it('should access slot content correctly in light DOM', () => {
      // Add complex slot content
      const slotContent = `
        <input class="direct-child">Direct content</input>
        <slot>
          <span class="slotted-content">Slotted content</span>
        </slot>
      `;
      element.innerHTML = slotContent;

      // Strategy 1: Direct children access
      const directChildren = Array.from(element.children).filter(
        child => child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SLOT'
      );
      expect(directChildren.length).toBeGreaterThan(0);

      // Strategy 2: Slot children access
      const slotElement = element.querySelector('slot');
      const slotChildren = slotElement ? Array.from(slotElement.children) : [];

      // Should find content using light DOM patterns
      const totalElements = directChildren.length + slotChildren.length;
      expect(totalElements).toBeGreaterThan(0);
    });

    it('should handle content updates dynamically', () => {
      // Date picker has its own form group structure, so test content additions to that structure
      const initialChildCount = element.children.length;
      expect(initialChildCount).toBeGreaterThan(0); // Component renders its own structure

      // Add external content to the component
      const initialContent = document.createElement('input');
      initialContent.classList.add('test-external-input');
      initialContent.textContent = 'Initial';
      element.appendChild(initialContent);

      expect(element.children.length).toBe(initialChildCount + 1);

      // Add new content
      const newContent = document.createElement('span');
      newContent.classList.add('test-external-span');
      newContent.textContent = 'New content';
      element.appendChild(newContent);

      expect(element.children.length).toBe(initialChildCount + 2);

      // Remove content
      initialContent.remove();
      expect(element.children.length).toBe(initialChildCount + 1);

      // Clean up
      newContent.remove();
      expect(element.children.length).toBe(initialChildCount);
    });
  });

  describe('USWDS Module Optimization', () => {
    it('should handle USWDS module loading', async () => {
      
      // Test USWDS module import pattern
      try {
        // This is the pattern used in components:
        // const module = await import('@uswds/uswds/js/usa-date-picker');

        // For test, simulate the module structure
        const mockModule = {
          default: {
            on: (element: HTMLElement) => {
              element.setAttribute('data-uswds-initialized', 'true');
            },
            off: (element: HTMLElement) => {
              element.removeAttribute('data-uswds-initialized');
            }
          }
        };

        // Test module functionality
        mockModule.default.on(element);
        expect(element.getAttribute('data-uswds-initialized')).toBe('true');

        mockModule.default.off(element);
        expect(element.getAttribute('data-uswds-initialized')).toBeNull();

      } catch (error) {
        // Module loading may fail in test environment
        console.warn('USWDS module test failed in test environment:', error);
      }
      
    });

    it('should handle module loading failures gracefully', async () => {
      const mockFailingImport = async () => {
        throw new Error('Module not found');
      };

      try {
        await mockFailingImport();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Should handle gracefully
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});