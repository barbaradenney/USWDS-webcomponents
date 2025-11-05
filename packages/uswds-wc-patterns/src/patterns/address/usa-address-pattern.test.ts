import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-address-pattern.js';
import type { USAAddressPattern, AddressData } from './usa-address-pattern.js';

describe('USAAddressPattern', () => {
  let pattern: USAAddressPattern;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Pattern Initialization', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-ADDRESS-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.label).toBe('Address');
      expect(pattern.required).toBe(false);
      expect(pattern.showStreet2).toBe(true);
    });

    it('should use Light DOM for USWDS style compatibility', () => {
      expect(pattern.shadowRoot).toBeNull();
    });

    it('should render fieldset with legend', async () => {
      await pattern.updateComplete;
      const fieldset = pattern.querySelector('fieldset.usa-fieldset');
      const legend = pattern.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toBe('Address');
    });

    it('should render required form fields', async () => {
      await pattern.updateComplete;

      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      const city = pattern.querySelector('usa-text-input[name="city"]');
      const state = pattern.querySelector('usa-select[name="state"]');
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');

      expect(street1).toBeTruthy();
      expect(city).toBeTruthy();
      expect(state).toBeTruthy();
      expect(zipCode).toBeTruthy();
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement('usa-address-pattern') as USAAddressPattern;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.addressData).toBeDefined();
      expect(event.detail.addressData).toEqual({});

      newPattern.remove();
    });
  });

  describe('Field Visibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show street2 field by default', () => {
      const street2 = pattern.querySelector('usa-text-input[name="street2"]');
      expect(street2).toBeTruthy();
    });

    it('should hide street2 when showStreet2 is false', async () => {
      pattern.showStreet2 = false;
      await pattern.updateComplete;

      const street2 = pattern.querySelector('usa-text-input[name="street2"]');
      expect(street2).toBeTruthy(); // Element exists
      expect(street2?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });
  });

  describe('Required Fields', () => {
    it('should not mark fields as required by default', async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      expect(street1?.hasAttribute('required')).toBe(false);
    });

    it('should mark fields as required when required prop is true', async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      pattern.required = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      const city = pattern.querySelector('usa-text-input[name="city"]');
      const state = pattern.querySelector('usa-select[name="state"]');
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');

      expect(street1?.hasAttribute('required')).toBe(true);
      expect(city?.hasAttribute('required')).toBe(true);
      expect(state?.hasAttribute('required')).toBe(true);
      expect(zipCode?.hasAttribute('required')).toBe(true);
    });
  });

  describe('Data Changes', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit address-change event when field changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('address-change', (e) => resolve(e as CustomEvent), { once: true });
      });

      const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
      street1.dispatchEvent(new Event('input', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.addressData).toBeDefined();
      expect(event.detail.field).toBe('street1');
    });

    it('should track all field values', async () => {
      const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
      const city = pattern.querySelector('usa-text-input[name="city"]') as any;
      const state = pattern.querySelector('usa-select[name="state"]') as any;
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]') as any;

      // Simulate user input by setting element value and dispatching event
      street1.value = '123 Main St';
      street1.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      city.value = 'Springfield';
      city.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      state.value = 'IL';
      state.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      zipCode.value = '62701';
      zipCode.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getAddressData();
      expect(data.street1).toBe('123 Main St');
      expect(data.city).toBe('Springfield');
      expect(data.state).toBe('IL');
      expect(data.zipCode).toBe('62701');
    });
  });

  describe('Public API', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should get address data', () => {
      const data = pattern.getAddressData();
      expect(data).toBeDefined();
      expect(data).toEqual({});
    });

    it('should set address data', async () => {
      const addressData: AddressData = {
        street1: '456 Oak Ave',
        street2: 'Apt 2B',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
      };

      pattern.setAddressData(addressData);
      await pattern.updateComplete;

      const data = pattern.getAddressData();
      expect(data).toEqual(addressData);
    });

    it('should clear address', async () => {
      const addressData: AddressData = {
        street1: '456 Oak Ave',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
      };

      pattern.setAddressData(addressData);
      await pattern.updateComplete;

      pattern.clearAddress();
      await pattern.updateComplete;

      const data = pattern.getAddressData();
      expect(data).toEqual({});
    });

    it('should validate required address', async () => {
      pattern.required = true;
      await pattern.updateComplete;

      // Empty address should not be valid
      expect(pattern.validateAddress()).toBe(false);

      // Partial address should not be valid
      pattern.setAddressData({ street1: '123 Main St' });
      await pattern.updateComplete;
      expect(pattern.validateAddress()).toBe(false);

      // Complete address should be valid
      pattern.setAddressData({
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
      });
      await pattern.updateComplete;
      expect(pattern.validateAddress()).toBe(true);
    });

    it('should always validate true when not required', async () => {
      pattern.required = false;
      await pattern.updateComplete;

      expect(pattern.validateAddress()).toBe(true);

      pattern.setAddressData({ street1: '123 Main St' });
      await pattern.updateComplete;
      expect(pattern.validateAddress()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have fieldset and legend for screen readers', () => {
      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toContain('Address');
    });

    it('should have proper label associations', async () => {
      await pattern.updateComplete;

      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      const city = pattern.querySelector('usa-text-input[name="city"]');

      expect(street1?.getAttribute('label')).toBeTruthy();
      expect(city?.getAttribute('label')).toBeTruthy();
    });

    it('should use USWDS form markup structure', () => {
      const fieldset = pattern.querySelector('.usa-fieldset');
      const legend = pattern.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });
  });

  describe('ZIP Code Validation', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have pattern attribute for ZIP code validation', () => {
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
      expect(zipCode?.getAttribute('pattern')).toBe('[0-9]{5}(-[0-9]{4})?');
    });

    it('should have maxlength for ZIP code', () => {
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
      expect(zipCode?.getAttribute('maxlength')).toBe('10');
    });
  });

  describe('State Selection', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render all US states in select', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered inside the <select> element via .options property
      const select = selectComponent?.querySelector('select');
      const options = select?.querySelectorAll('option');

      // Should have "- Select -" plus 50 states
      expect(options?.length).toBeGreaterThan(50);
    });

    it('should have default empty option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered inside the <select> element via .options property
      const select = selectComponent?.querySelector('select');
      const firstOption = select?.querySelector('option');

      expect(firstOption?.value).toBe('');
      expect(firstOption?.textContent).toContain('Select');
    });
  });

  describe('Pattern Composition (CRITICAL)', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should use usa-select component with options property not slotted content', () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;

      // Verify select component receives options via .options property
      expect(selectComponent).toBeTruthy();
      expect(selectComponent.options).toBeDefined();
      expect(selectComponent.options.length).toBeGreaterThan(0);
    });

    it('should render state options inside select element not as siblings', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select') as HTMLSelectElement;
      const options = select?.querySelectorAll('option');

      // All options should be inside the select element
      expect(select?.contains(options?.[0])).toBe(true);
      expect(select?.contains(options?.[options.length - 1])).toBe(true);

      // No orphaned options outside select
      const allPatternOptions = pattern.querySelectorAll('option');
      const selectOptions = select?.querySelectorAll('option');
      expect(allPatternOptions.length).toBe(selectOptions?.length || 0);
    });

    it('should render state select in initial render without waiting', async () => {
      const freshPattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(freshPattern);

      // Wait for Lit to render (Light DOM still requires initial render cycle)
      await freshPattern.updateComplete;

      const selectComponent = freshPattern.querySelector('usa-select[name="state"]');
      expect(selectComponent).toBeTruthy();

      freshPattern.remove();
    });
  });

  describe('Custom Labels', () => {
    it('should use custom label', async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      pattern.label = 'Mailing Address';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const legend = pattern.querySelector('legend');
      expect(legend?.textContent).toBe('Mailing Address');
    });
  });
});
