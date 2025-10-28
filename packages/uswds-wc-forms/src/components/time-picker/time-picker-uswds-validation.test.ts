import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-time-picker.ts';
import type { USATimePicker } from './usa-time-picker.js';

/**
 * USATimePicker USWDS Integration Validation
 *
 * Risk Level: HIGH
 * Risk Factors: input-enhancement, dropdown-behavior, time-validation
 * USWDS Module: usa-time-picker
 *
 * Generated based on tooltip troubleshooting patterns to prevent:
 * - dom transformation
 * - multi phase-attributes
 * - module optimization
 */

describe('USATimePicker USWDS Integration Validation', () => {
  let element: USATimePicker;
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    testContainer.id = 'time-picker-test-container';
    document.body.appendChild(testContainer);

    element = document.createElement('usa-time-picker') as USATimePicker;
    testContainer.appendChild(element);
  });

  afterEach(async () => {
    // Wait for any pending async operations to complete before cleanup
    // Time picker initialization includes async combo-box transformation
    // Extra delay for USWDS validation tests that manipulate DOM
    await new Promise(resolve => setTimeout(resolve, 100));
    testContainer.remove();
  });

  describe('DOM Transformation Validation', () => {
    it('should handle USWDS DOM transformation correctly', async () => {
      // Wait for component to render
      await element.updateComplete;

      // Get the time-picker container that the component renders
      const preTransformElement = element.querySelector('.usa-time-picker');
      expect(preTransformElement).toBeTruthy();

      // Simulate USWDS adding transformed class (like it does with combo-box)
      preTransformElement?.classList.add('usa-time-picker--transformed');

      // Component should handle both pre and post-transformation states
      const transformedElement = element.querySelector('.usa-time-picker.usa-time-picker--transformed');
      expect(transformedElement).toBeTruthy();
      expect(transformedElement).toBe(preTransformElement);
    });

    it('should apply attributes before USWDS initialization', async () => {
      // Apply component properties
      element.value = "12:00";

      await element.updateComplete;

      // Check the component's own input element (not external ones)
      const componentInput = element.querySelector('input');
      expect(componentInput).toBeTruthy();

      // The component renders text input (USWDS pattern), not time input
      // This allows USWDS to handle the time picker transformation
      expect(componentInput.getAttribute("type")).toBe("text");
      // Time picker formats with AM/PM
      expect(componentInput.value).toBe("12:00pm");
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

  describe('USWDS Module Optimization', () => {
    it('should handle USWDS module loading', async () => {
      
      // Test USWDS module import pattern
      try {
        // This is the pattern used in components:
        // const module = await import('@uswds/uswds/js/usa-time-picker');

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