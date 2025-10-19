import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../../__tests__/test-utils.js';
import './usa-text-input.ts';
import type { USATextInput } from './usa-text-input.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '../../../__tests__/accessibility-utils.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USATextInput', () => {
  let element: USATextInput;

  beforeEach(() => {
    element = document.createElement('usa-text-input') as USATextInput;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Default Properties', () => {
    it('should have correct default properties', async () => {
      await element.updateComplete;

      expect(element.type).toBe('text');
      expect(element.name).toBe('');
      expect(element.value).toBe('');
      expect(element.placeholder).toBe('');
      expect(element.label).toBe('');
      expect(element.hint).toBe('');
      expect(element.error).toBe('');
      expect(element.width).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
      expect(element.readonly).toBe(false);
      expect(element.autocomplete).toBe('');
      expect(element.pattern).toBe('');
      expect(element.maxlength).toBeNull();
      expect(element.minlength).toBeNull();
    });
  });

  describe('Input Types', () => {
    it('should support all standard input types', async () => {
      const types = ['text', 'email', 'password', 'number', 'tel', 'url'] as const;

      for (const type of types) {
        element.type = type;
        await element.updateComplete;

        const input = element.querySelector('input');
        expect(input?.type).toBe(type);
      }
    });
  });

  describe('Width Modifiers', () => {
    it('should apply correct width classes', async () => {
      const widths = ['2xs', 'xs', 'sm', 'small', 'md', 'medium', 'lg', 'xl', '2xl'] as const;

      for (const width of widths) {
        element.width = width;
        await element.updateComplete;

        const input = element.querySelector('input');
        expect(input?.classList.contains(`usa-input--${width}`)).toBe(true);
      }
    });

    it('should not apply width class when width is empty', async () => {
      element.width = '';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.className).toBe('usa-input');
    });
  });

  describe('Label Rendering', () => {
    it('should render label when provided', async () => {
      element.label = 'Test Label';
      await element.updateComplete;

      const label = element.querySelector('label');
      expect(label).toBeTruthy();
      expect(label?.textContent?.trim()).toBe('Test Label');
      expect(label?.classList.contains('usa-label')).toBe(true);
    });

    it('should not render label when empty', async () => {
      element.label = '';
      await element.updateComplete;

      const label = element.querySelector('label');
      expect(label).toBeNull();
    });

    it('should show required indicator when required is true', async () => {
      element.label = 'Required Field';
      element.required = true;
      await element.updateComplete;

      const requiredSpan = element.querySelector('.usa-hint--required');
      expect(requiredSpan).toBeTruthy();
      expect(requiredSpan?.textContent).toBe('*');
    });
  });

  describe('Hint Text', () => {
    it('should render hint when provided', async () => {
      element.hint = 'This is a hint';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent).toBe('This is a hint');
    });

    it('should not render hint when empty', async () => {
      element.hint = '';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeNull();
    });

    it('should have correct ID for ARIA association', async () => {
      const newElement = document.createElement('usa-text-input') as USATextInput;
      newElement.id = 'test-input';
      newElement.hint = 'Test hint';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      const hint = newElement.querySelector('.usa-hint');
      expect(hint?.id).toBe('test-input-hint');

      newElement.remove();
    });
  });

  describe('Error State', () => {
    it('should render error message when provided', async () => {
      element.error = 'This is an error';
      await element.updateComplete;

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg).toBeTruthy();
      expect(errorMsg?.textContent?.includes('This is an error')).toBe(true);
      expect(errorMsg?.getAttribute('role')).toBe('alert');
    });

    it('should apply error class to input', async () => {
      element.error = 'Test error';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.classList.contains('usa-input--error')).toBe(true);
    });

    it('should set aria-invalid when error exists', async () => {
      element.error = 'Test error';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not render error message when empty', async () => {
      element.error = '';
      await element.updateComplete;

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg).toBeNull();
    });
  });

  describe('Input Properties', () => {
    it('should set basic input properties', async () => {
      element.name = 'test-name';
      element.value = 'test-value';
      element.placeholder = 'test-placeholder';
      element.disabled = true;
      element.required = true;
      element.readonly = true;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.name).toBe('test-name');
      expect(input?.value).toBe('test-value');
      expect(input?.placeholder).toBe('test-placeholder');
      expect(input?.disabled).toBe(true);
      expect(input?.required).toBe(true);
      expect(input?.readOnly).toBe(true);
    });

    it('should set length constraints', async () => {
      element.maxlength = 10;
      element.minlength = 5;
      element.pattern = '[0-9]*';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.maxLength).toBe(10);
      expect(input?.minLength).toBe(5);
      expect(input?.pattern).toBe('[0-9]*');
    });

    it('should set autocomplete attribute', async () => {
      element.autocomplete = 'email';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.getAttribute('autocomplete')).toBe('email');
    });
  });

  describe('ARIA Attributes', () => {
    it('should associate input with hint via aria-describedby', async () => {
      const newElement = document.createElement('usa-text-input') as USATextInput;
      newElement.id = 'test-input';
      newElement.hint = 'Test hint';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      const input = newElement.querySelector('input');
      expect(input?.getAttribute('aria-describedby')).toBe('test-input-hint');

      newElement.remove();
    });

    it('should associate input with error via aria-describedby', async () => {
      const newElement = document.createElement('usa-text-input') as USATextInput;
      newElement.id = 'test-input';
      newElement.error = 'Test error';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      const input = newElement.querySelector('input');
      expect(input?.getAttribute('aria-describedby')).toBe('test-input-error');

      newElement.remove();
    });

    it('should associate input with both hint and error', async () => {
      const newElement = document.createElement('usa-text-input') as USATextInput;
      newElement.id = 'test-input';
      newElement.hint = 'Test hint';
      newElement.error = 'Test error';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      const input = newElement.querySelector('input');
      expect(input?.getAttribute('aria-describedby')).toBe('test-input-hint test-input-error');

      newElement.remove();
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.label = 'Test Input';
      element.hint = 'Enter your information';
      await element.updateComplete;

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Event Handling', () => {
    it('should update value property when input event occurs', async () => {
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'new value';

      // Simulate user input
      input.dispatchEvent(new Event('input', { bubbles: true }));

      expect(element.value).toBe('new value');
    });

    it('should update value property when change event occurs', async () => {
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'changed value';

      // Simulate user change (like blur after typing)
      input.dispatchEvent(new Event('change', { bubbles: true }));

      expect(element.value).toBe('changed value');
    });

    it('should dispatch custom events with proper detail', async () => {
      await element.updateComplete;
      let inputEventFired = false;
      let changeEventFired = false;

      element.addEventListener('input', () => (inputEventFired = true));
      element.addEventListener('change', () => (changeEventFired = true));

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      expect(inputEventFired).toBe(true);
      expect(changeEventFired).toBe(true);
    });
  });

  describe('USWDS CSS Classes', () => {
    it('should always have base usa-input class', async () => {
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.classList.contains('usa-input')).toBe(true);
    });

    it('should have proper USWDS structure', async () => {
      element.label = 'Test Label';
      element.hint = 'Test Hint';
      element.error = 'Test Error';
      await element.updateComplete;

      const label = element.querySelector('.usa-label');
      const hint = element.querySelector('.usa-hint');
      const errorMsg = element.querySelector('.usa-error-message');
      const input = element.querySelector('.usa-input');

      expect(label).toBeTruthy();
      expect(hint).toBeTruthy();
      expect(errorMsg).toBeTruthy();
      expect(input).toBeTruthy();
    });
  });

  describe('Light DOM Rendering', () => {
    it('should render in light DOM for USWDS compatibility', async () => {
      await element.updateComplete;

      expect(element.shadowRoot).toBeNull();
      expect(element.querySelector('input')).toBeTruthy();
    });
  });

  describe('ID Generation', () => {
    it('should use provided ID', async () => {
      // Set ID before first render
      const newElement = document.createElement('usa-text-input') as USATextInput;
      newElement.id = 'custom-id';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      const input = newElement.querySelector('input');
      expect(input?.id).toBe('custom-id');

      newElement.remove();
    });

    it('should generate ID when not provided', async () => {
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.id).toMatch(/^input-[a-z0-9]{9}$/);
    });
  });

  describe('USWDS HTML Structure Compliance', () => {
    beforeEach(async () => {
      element.label = 'Full Name';
      element.hint = 'Enter your complete legal name';
      element.error = '';
      await element.updateComplete;
    });

    it('should maintain USWDS label structure', () => {
      const label = element.querySelector('label.usa-label');
      const input = element.querySelector('input.usa-input');

      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
      expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'));
    });

    it('should properly associate hint with input via aria-describedby', async () => {
      element.hint = 'Please include middle initial if applicable';
      await element.updateComplete;

      const input = element.querySelector('input');
      const hint = element.querySelector('.usa-hint');
      const inputId = input?.getAttribute('id');

      expect(hint?.getAttribute('id')).toBe(`${inputId}-hint`);
      expect(input?.getAttribute('aria-describedby')).toContain(`${inputId}-hint`);
    });

    it('should properly associate error with input', async () => {
      element.error = 'This field is required';
      await element.updateComplete;

      const input = element.querySelector('input');
      const errorMsg = element.querySelector('.usa-error-message');
      const inputId = input?.getAttribute('id');

      expect(errorMsg?.getAttribute('id')).toBe(`${inputId}-error`);
      expect(errorMsg?.getAttribute('role')).toBe('alert');
      expect(input?.getAttribute('aria-describedby')).toContain(`${inputId}-error`);
      expect(input?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should combine hint and error in aria-describedby', async () => {
      element.hint = 'Include spaces and punctuation';
      element.error = 'Name cannot be empty';
      await element.updateComplete;

      const input = element.querySelector('input');
      const describedBy = input?.getAttribute('aria-describedby');
      const inputId = input?.getAttribute('id');

      expect(describedBy).toContain(`${inputId}-hint`);
      expect(describedBy).toContain(`${inputId}-error`);
    });

    it('should show required indicator in label', async () => {
      element.required = true;
      await element.updateComplete;

      const requiredSpan = element.querySelector('.usa-hint--required');
      expect(requiredSpan?.textContent).toBe('*');
    });

    it('should include screen reader text in error messages', async () => {
      element.error = 'Invalid format';
      await element.updateComplete;

      const srOnly = element.querySelector('.usa-error-message .usa-sr-only');
      expect(srOnly?.textContent).toBe('Error:');
    });
  });

  describe('Form Integration and Validation', () => {
    let form: HTMLFormElement;

    beforeEach(() => {
      form = document.createElement('form');
      document.body.appendChild(form);
    });

    afterEach(() => {
      form.remove();
    });

    it('should integrate with native form validation', async () => {
      element.name = 'username';
      element.required = true;
      element.type = 'email';
      form.appendChild(element);
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.name).toBe('username');
      expect(input?.required).toBe(true);
      expect(input?.type).toBe('email');
    });

    it('should handle form reset', async () => {
      element.value = 'initial value';
      element.name = 'test-field';
      form.appendChild(element);
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'changed value';

      form.reset();
      await element.updateComplete;

      expect(input.value).toBe('');
    });

    it('should support HTML5 validation attributes', async () => {
      element.pattern = '[A-Za-z]{3}[0-9]{4}';
      element.minlength = 3;
      element.maxlength = 10;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.pattern).toBe('[A-Za-z]{3}[0-9]{4}');
      expect(input?.minLength).toBe(3);
      expect(input?.maxLength).toBe(10);
    });
  });

  describe('Application Use Cases', () => {
    it('should handle federal tax ID input (EIN)', async () => {
      element.type = 'text';
      element.pattern = '\\d{2}-\\d{7}';
      element.placeholder = '12-3456789';
      element.label = 'Federal Tax ID (EIN)';
      element.hint = 'Format: XX-XXXXXXX';
      element.required = true;
      element.autocomplete = 'organization';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.pattern).toBe('\\d{2}-\\d{7}');
      expect(input?.placeholder).toBe('12-3456789');
      expect(input?.required).toBe(true);
      expect(input?.getAttribute('autocomplete')).toBe('organization');

      const label = element.querySelector('.usa-label');
      expect(label?.textContent).toContain('Federal Tax ID (EIN)');

      const hint = element.querySelector('.usa-hint:not(.usa-hint--required)');
      expect(hint?.textContent).toBe('Format: XX-XXXXXXX');
    });

    it('should handle Social Security Number input', async () => {
      element.type = 'text';
      element.pattern = '\\d{3}-\\d{2}-\\d{4}';
      element.placeholder = '123-45-6789';
      element.label = 'Social Security Number';
      element.hint = 'We use this to verify your identity';
      element.required = true;
      element.autocomplete = 'off'; // Security best practice
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.pattern).toBe('\\d{3}-\\d{2}-\\d{4}');
      expect(input?.placeholder).toBe('123-45-6789');
      expect(input?.getAttribute('autocomplete')).toBe('off');
      expect(input?.required).toBe(true);
    });

    it('should handle federal employee ID input', async () => {
      element.type = 'text';
      element.pattern = '[A-Z]{2}\\d{8}';
      element.placeholder = 'AB12345678';
      element.label = 'Federal Employee ID';
      element.hint = 'Two letters followed by 8 digits';
      element.maxlength = 10;
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.pattern).toBe('[A-Z]{2}\\d{8}');
      expect(input?.maxLength).toBe(10);
    });

    it('should handle DUNS number input', async () => {
      element.type = 'text';
      element.pattern = '\\d{9}';
      element.placeholder = '123456789';
      element.label = 'DUNS Number';
      element.hint = 'Data Universal Numbering System identifier';
      element.minlength = 9;
      element.maxlength = 9;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.pattern).toBe('\\d{9}');
      expect(input?.minLength).toBe(9);
      expect(input?.maxLength).toBe(9);
    });

    it('should handle government email addresses', async () => {
      element.type = 'email';
      element.label = 'Official Government Email';
      element.hint = 'Use your .gov or .mil email address';
      element.pattern = '.*\\.(gov|mil)$';
      element.required = true;
      element.autocomplete = 'email';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.type).toBe('email');
      expect(input?.pattern).toBe('.*\\.(gov|mil)$');
      expect(input?.getAttribute('autocomplete')).toBe('email');
    });

    it('should handle court case numbers', async () => {
      element.type = 'text';
      element.pattern = '\\d{1,2}:\\d{2}-[a-zA-Z]{2}-\\d{5}';
      element.placeholder = '1:24-cv-12345';
      element.label = 'Case Number';
      element.hint = 'Format: D:YY-TT-NNNNN';
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.pattern).toBe('\\d{1,2}:\\d{2}-[a-zA-Z]{2}-\\d{5}');
      expect(input?.placeholder).toBe('1:24-cv-12345');
    });

    it('should handle federal grant numbers', async () => {
      element.type = 'text';
      element.pattern = '[A-Z]{2}-\\d{4}-\\d{6}';
      element.placeholder = 'HH-2024-123456';
      element.label = 'Federal Grant Number';
      element.hint = 'Agency code, year, and award number';
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.pattern).toBe('[A-Z]{2}-\\d{4}-\\d{6}');
      expect(input?.placeholder).toBe('HH-2024-123456');
    });
  });

  describe('Accessibility and Section 508 Compliance', () => {
    it('should maintain proper label association', async () => {
      element.label = 'Full Legal Name';
      await element.updateComplete;

      const label = element.querySelector('label');
      const input = element.querySelector('input');

      expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'));
    });

    it('should support screen readers with proper ARIA', async () => {
      element.label = 'Tax Year';
      element.hint = 'Enter the 4-digit tax year';
      element.error = 'Please enter a valid year';
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input');
      const describedBy = input?.getAttribute('aria-describedby');
      const inputId = input?.getAttribute('id');

      expect(input?.getAttribute('aria-invalid')).toBe('true');
      expect(describedBy).toContain(`${inputId}-hint`);
      expect(describedBy).toContain(`${inputId}-error`);
      expect(input?.hasAttribute('required')).toBe(true);
    });

    it('should announce errors to screen readers', async () => {
      element.error = 'Invalid Social Security Number format';
      await element.updateComplete;

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg?.getAttribute('role')).toBe('alert');

      const srText = errorMsg?.querySelector('.usa-sr-only');
      expect(srText?.textContent).toBe('Error:');
    });

    it('should support keyboard navigation', async () => {
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle disabled state accessibly', async () => {
      element.disabled = true;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.disabled).toBe(true);
      expect(input?.hasAttribute('aria-disabled')).toBe(false); // Native disabled is sufficient
    });

    it('should handle readonly state properly', async () => {
      element.readonly = true;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input?.readOnly).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid property changes efficiently', async () => {
      const startTime = performance.now();

      // Rapidly change properties
      for (let i = 0; i < 50; i++) {
        element.value = `value-${i}`;
        element.label = `Label ${i}`;
        element.error = i % 2 === 0 ? `Error ${i}` : '';
      }

      await element.updateComplete;
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should update efficiently
      expect(element.value).toBe('value-49');
      expect(element.label).toBe('Label 49');
    });

    it('should handle empty and null values gracefully', async () => {
      element.value = '';
      element.label = '';
      element.hint = '';
      element.error = '';
      element.placeholder = '';
      await element.updateComplete;

      expect(() => element.render()).not.toThrow();

      const input = element.querySelector('input');
      expect(input?.value).toBe('');
      expect(input?.placeholder).toBe('');
    });

    it('should handle special characters in content', async () => {
      element.label = 'Name with "quotes" & <brackets>';
      element.hint = `Hint with special chars: <>&"'\``;
      element.error = `Error with special chars: <>&"'\``;
      element.value = '<script>alert("xss")</script>';
      await element.updateComplete;

      const label = element.querySelector('label');
      const hint = element.querySelector('.usa-hint');
      const error = element.querySelector('.usa-error-message');
      const input = element.querySelector('input') as HTMLInputElement;

      // Content should be safely rendered
      expect(label?.textContent).toContain('"quotes"');
      expect(hint?.textContent).toContain('<>&"\'`');
      expect(error?.textContent).toContain('<>&"\'`');
      expect(input?.value).toBe('<script>alert("xss")</script>');
    });

    it('should maintain functionality after DOM manipulation', async () => {
      element.label = 'Test Input';
      element.value = 'test value';
      await element.updateComplete;

      // Remove and re-add element
      element.remove();
      document.body.appendChild(element);
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('input', eventSpy);

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'new value';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should clean up event listeners properly', async () => {
      await element.updateComplete;

      const input = element.querySelector('input');
      const eventSpy = vi.fn();

      element.addEventListener('input', eventSpy);

      // Trigger event
      if (input) {
        input.value = 'test';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Component dispatches custom event, native event also bubbles - expect 2 calls
      expect(eventSpy).toHaveBeenCalledTimes(2);

      // Remove element
      element.remove();

      // Should not cause memory leaks or errors
      expect(() => {
        element.value = 'after removal';
      }).not.toThrow();
    });
  });

  describe('Width Variants', () => {
    it('should apply all width variant classes correctly', async () => {
      const widths = ['2xs', 'xs', 'sm', 'small', 'md', 'medium', 'lg', 'xl', '2xl'];

      for (const width of widths) {
        element.width = width as any;
        await element.updateComplete;

        const input = element.querySelector('input');
        expect(input?.classList.contains(`usa-input--${width}`)).toBe(true);
      }
    });

    it('should remove width classes when width is cleared', async () => {
      element.width = 'lg';
      await element.updateComplete;

      let input = element.querySelector('input');
      expect(input?.classList.contains('usa-input--lg')).toBe(true);

      element.width = '';
      await element.updateComplete;

      input = element.querySelector('input');
      expect(input?.classList.contains('usa-input--lg')).toBe(false);
      expect(input?.classList.contains('usa-input')).toBe(true);
    });
  });

  // CRITICAL TESTS - Prevent auto-dismiss and lifecycle bugs
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    let element: USATextInput;

    beforeEach(() => {
      element = document.createElement('usa-text-input') as USATextInput;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      // Apply initial properties
      element.type = 'text';
      element.name = 'test-input';
      element.value = 'initial value';
      element.placeholder = 'Enter text';
      element.label = 'Test Label';
      element.hint = 'Test hint';
      element.disabled = false;
      element.required = false;
      element.readonly = false;
      element.width = '';
      await element.updateComplete;

      // Verify element exists after initial render
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Update properties (this is where bugs often occur)
      element.type = 'email';
      element.disabled = true;
      element.error = 'Test error';
      element.width = 'lg';
      await element.updateComplete;

      // CRITICAL: Element should still exist in DOM
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Multiple rapid property updates
      const propertySets = [
        {
          type: 'password' as const,
          value: 'password123',
          label: 'Password',
          hint: 'Enter password',
          disabled: false,
          required: true,
          readonly: false,
          width: 'sm' as const,
          error: '',
          maxlength: 20,
          pattern: '.{8,}',
        },
        {
          type: 'email' as const,
          value: 'test@example.com',
          label: 'Email Address',
          hint: 'Enter valid email',
          disabled: true,
          required: false,
          readonly: true,
          width: 'xl' as const,
          error: 'Invalid email',
          maxlength: null,
          pattern: '',
        },
        {
          type: 'tel' as const,
          value: '555-0123',
          label: 'Phone Number',
          hint: '',
          disabled: false,
          required: true,
          readonly: false,
          width: 'medium' as const,
          error: 'Phone required',
          maxlength: 15,
          pattern: '[0-9-]+',
        },
      ];

      for (const props of propertySets) {
        Object.assign(element, props);
        await element.updateComplete;

        // CRITICAL: Element should survive all updates
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();
      }
    });

    it('should not fire unintended events on property changes', async () => {
      const eventSpies = [
        vi.fn(), // Generic event spy
        vi.fn(), // Close/dismiss spy
        vi.fn(), // Submit/action spy
      ];

      // Common event names that might be fired accidentally
      const commonEvents = ['close', 'dismiss', 'submit', 'action'];

      commonEvents.forEach((eventName, index) => {
        if (eventSpies[index]) {
          element.addEventListener(eventName, eventSpies[index]);
        }
      });

      // Set up initial state
      element.name = 'test';
      element.label = 'Test Input';
      await element.updateComplete;

      // Update properties should NOT fire these unintended events
      element.value = 'new value';
      await element.updateComplete;

      element.disabled = true;
      await element.updateComplete;

      element.error = 'Test error';
      await element.updateComplete;

      element.type = 'email';
      await element.updateComplete;

      element.width = 'lg';
      await element.updateComplete;

      // Verify no unintended events were fired
      eventSpies.forEach((spy, _index) => {
        if (spy) {
          expect(spy).not.toHaveBeenCalled();
        }
      });

      // Verify element is still in DOM
      expect(document.body.contains(element)).toBe(true);
    });

    it('should handle rapid property updates without breaking', async () => {
      // Simulate rapid updates like form validation or dynamic form changes
      const startTime = performance.now();

      const propertySets = [
        { type: 'text' as const, value: 'text1', disabled: false, error: '', width: 'sm' as const },
        {
          type: 'email' as const,
          value: 'email@test.com',
          disabled: true,
          error: 'Error',
          width: 'lg' as const,
        },
        {
          type: 'password' as const,
          value: 'pass123',
          disabled: false,
          error: '',
          width: 'medium' as const,
        },
        {
          type: 'number' as const,
          value: '42',
          disabled: false,
          error: 'Number error',
          width: 'xl' as const,
        },
      ];

      element.label = 'Rapid Test';

      for (let i = 0; i < 20; i++) {
        const props = propertySets[i % propertySets.length];
        Object.assign(element, props);
        await element.updateComplete;

        // Element should remain stable
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

        // Verify input element is still properly connected
        const input = element.querySelector('input[type]');
        expect(input).toBeTruthy();
      }

      const endTime = performance.now();

      // Should complete updates reasonably fast (under 1000ms for text-input complexity)
      expect(endTime - startTime).toBeLessThan(1000);

      // Final verification
      expect(document.body.contains(element)).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath =
          `${process.cwd()}/src/components/text-input/usa-text-input.ts`;
        const validation = validateComponentJavaScript(componentPath, 'text-input');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Strict validation requirements

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Storybook Integration Tests (CRITICAL)', () => {
    let element: USATextInput;

    beforeEach(() => {
      element = document.createElement('usa-text-input') as USATextInput;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should render correctly when created via Storybook patterns', async () => {
      // Simulate how Storybook creates components with args
      const storybookArgs = {
        type: 'email' as const,
        name: 'storybook-input',
        value: 'user@example.com',
        placeholder: 'Enter your email',
        label: 'Email Address',
        hint: 'We will use this to contact you',
        disabled: false,
        required: true,
        width: 'lg' as const,
        maxlength: 100,
      };

      // Apply args like Storybook would
      Object.assign(element, storybookArgs);
      await element.updateComplete;

      // Should render without blank frames
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should have expected content structure
      const hasContent =
        element.querySelector('input[type]') !== null &&
        element.querySelector('label') !== null &&
        (element.textContent?.trim().length || 0) > 0;
      expect(hasContent).toBe(true);

      // Verify text-input-specific rendering
      const input = element.querySelector('input') as HTMLInputElement;
      const label = element.querySelector('label');
      const hint = element.querySelector('.usa-hint:not(.usa-hint--required)');

      expect(input?.type).toBe('email');
      expect(input?.value).toBe('user@example.com');
      expect(input?.required).toBe(true);
      expect(input?.maxLength).toBe(100);
      expect(input?.classList.contains('usa-input--lg')).toBe(true);
      expect(label).toBeTruthy();
      expect(hint?.textContent?.trim()).toBe('We will use this to contact you');
    });

    it('should handle Storybook controls updates without breaking', async () => {
      // Simulate initial Storybook state
      const initialArgs = {
        type: 'text' as const,
        name: 'controls-test',
        value: 'initial value',
        label: 'Controls Test',
        hint: '',
        disabled: false,
        required: false,
        width: '' as const,
        error: '',
      };
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Verify initial state
      expect(document.body.contains(element)).toBe(true);

      // Simulate user changing controls in Storybook
      const storybookUpdates = [
        { type: 'email' as const },
        { disabled: true },
        { value: 'updated@example.com' },
        { label: 'Updated Label' },
        { hint: 'Updated hint text' },
        { error: 'Validation error' },
        { required: true },
        { width: 'xl' as const },
        { readonly: true },
        { maxlength: 50 },
        { type: 'text' as const, disabled: false, error: '', width: '' as const },
      ];

      for (const update of storybookUpdates) {
        Object.assign(element, update);
        await element.updateComplete;

        // Should not cause blank frame or auto-dismiss
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

        // Verify input element remains functional
        const input = element.querySelector('input[type]');
        expect(input).toBeTruthy();
      }
    });

    it('should maintain visual state during hot reloads', async () => {
      const initialArgs = {
        type: 'password' as const,
        name: 'hotreload-test',
        value: 'secret123',
        placeholder: 'Enter password',
        label: 'Password',
        hint: 'Must be at least 8 characters',
        disabled: true,
        required: true,
        width: 'medium' as const,
        error: 'Password too weak',
        maxlength: 20,
        pattern: '.{8,}',
      };

      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Verify initial complex state
      const input = element.querySelector('input') as HTMLInputElement;
      const initialValue = input?.value;
      const initialDisabled = input?.disabled;
      const initialType = input?.type;

      // Simulate hot reload (property reassignment with same values)
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Should maintain state without disappearing
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should maintain form state
      const inputAfter = element.querySelector('input') as HTMLInputElement;
      expect(inputAfter?.value).toBe(initialValue);
      expect(inputAfter?.disabled).toBe(initialDisabled);
      expect(inputAfter?.type).toBe(initialType);
      expect(inputAfter?.classList.contains('usa-input--medium')).toBe(true);
      expect(element.querySelector('.usa-error-message')).toBeTruthy();
      expect(element.querySelector('.usa-hint')).toBeTruthy();
    });
  });

  /**
   * USWDS Integration Requirements Tests
   *
   * Form input validation for text input component.
   */
  describe('USWDS Integration Requirements', () => {
    it('should render placeholder attribute', async () => {
      element.placeholder = 'Enter text';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input?.getAttribute('placeholder')).toBe('Enter text');
    });

    it('should render value attribute', async () => {
      element.value = 'test';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input?.value).toBe('test');
    });

    it('should update value when changed', async () => {
      element.value = 'initial';
      await element.updateComplete;

      element.value = 'updated';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input?.value).toBe('updated');
    });

    it('should display placeholder when no value', async () => {
      element.placeholder = 'Type here';
      element.value = '';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input?.placeholder).toBe('Type here');
      expect(input?.value).toBe('');
    });
  });
});
