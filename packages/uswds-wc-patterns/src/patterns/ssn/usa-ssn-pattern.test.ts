import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { USASSNPattern } from './usa-ssn-pattern.js';
import type { SSNData } from './usa-ssn-pattern.js';

// Register the component
if (!customElements.get('usa-ssn-pattern')) {
  customElements.define('usa-ssn-pattern', USASSNPattern);
}

describe('USASSNPattern', () => {
  let element: USASSNPattern;

  beforeEach(async () => {
    element = document.createElement('usa-ssn-pattern') as USASSNPattern;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USASSNPattern);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default label', () => {
      expect(element.label).toBe('Social Security number');
    });

    it('should not be required by default', () => {
      expect(element.required).toBe(false);
    });

    it('should have default hint', () => {
      expect(element.hint).toBe('For example, 555 11 0000');
    });

    it('should not show why link by default', () => {
      expect(element.showWhyLink).toBe(false);
    });

    it('should fire pattern-ready event on first update', async () => {
      const element2 = document.createElement('usa-ssn-pattern') as USASSNPattern;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('pattern-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('ssnData');

      element2.remove();
    });
  });

  describe('USWDS Styling', () => {
    it('should use usa-fieldset wrapper', () => {
      const fieldset = element.querySelector('.usa-fieldset');
      expect(fieldset).toBeTruthy();
      expect(fieldset?.tagName.toLowerCase()).toBe('fieldset');
    });

    it('should use usa-legend--large for pattern header', () => {
      const legend = element.querySelector('.usa-legend');
      expect(legend).toBeTruthy();
      expect(legend?.classList.contains('usa-legend--large')).toBe(true);
    });

    it('should use usa-input--xl for SSN input', () => {
      const input = element.querySelector('usa-text-input');
      expect(input).toBeTruthy();
      expect(input?.classList.contains('usa-input--xl')).toBe(true);
    });
  });

  describe('Properties', () => {
    it('should update label', async () => {
      element.label = 'SSN';
      await element.updateComplete;

      const legend = element.querySelector('.usa-legend--large');
      expect(legend?.textContent).toBe('SSN');
    });

    it('should update required', async () => {
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('usa-text-input');
      expect(input?.hasAttribute('required')).toBe(true);
    });

    it('should update hint', async () => {
      element.hint = 'Enter your 9-digit SSN';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint?.textContent).toContain('Enter your 9-digit SSN');
    });

    it('should show hint when provided', async () => {
      element.hint = 'Required for identity verification';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
    });

    it('should show why link when enabled', async () => {
      element.showWhyLink = true;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a.usa-link');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/privacy-policy');
      expect(link?.textContent).toContain('Why do we ask for this?');
    });

    it('should not show why link when disabled', async () => {
      element.showWhyLink = false;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a.usa-link');
      expect(link).toBeFalsy();
    });
  });

  describe('CRITICAL: USWDS Requirements', () => {
    it('should use SINGLE text input (NOT three separate fields)', () => {
      const inputs = element.querySelectorAll('usa-text-input');
      expect(inputs.length).toBe(1);
    });

    it('should use type="text" with inputmode="numeric"', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.getAttribute('type')).toBe('text');
      expect(input?.getAttribute('inputmode')).toBe('numeric');
    });

    it('should NOT use placeholder text', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.hasAttribute('placeholder')).toBe(false);
    });

    it('should have autocomplete="off" for security', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.getAttribute('autocomplete')).toBe('off');
    });

    it('should have maxlength of 11 (9 digits + 2 hyphens)', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.getAttribute('maxlength')).toBe('11');
    });
  });

  describe('SSN Input Field', () => {
    it('should render SSN input', () => {
      const input = element.querySelector('usa-text-input[name="ssn"]');
      expect(input).toBeTruthy();
    });

    it('should update data on input', async () => {
      const input = element.querySelector('usa-text-input') as any;

      input.value = '123456789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('123456789');
    });

    it('should fire ssn-change event on input', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('ssn-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const input = element.querySelector('usa-text-input') as any;

      input.value = '123-45-6789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const detail = (await changePromise) as any;
      expect(detail.value).toBe('123-45-6789');
      expect(detail.ssnData.ssn).toBe('123-45-6789');
    });

    it('should accept hyphens in SSN', async () => {
      const input = element.querySelector('usa-text-input') as any;

      input.value = '123-45-6789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('123-45-6789');
    });

    it('should accept spaces in SSN', async () => {
      const input = element.querySelector('usa-text-input') as any;

      input.value = '123 45 6789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('123 45 6789');
    });
  });

  describe('Public API: getSSNData', () => {
    it('should return empty SSN data initially', () => {
      const data = element.getSSNData();
      expect(data.ssn).toBe('');
    });

    it('should return current SSN data', async () => {
      const input = element.querySelector('usa-text-input') as any;

      input.value = '123456789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('123456789');
    });

    it('should return a copy of data', () => {
      const data1 = element.getSSNData();
      const data2 = element.getSSNData();

      expect(data1).not.toBe(data2);
      expect(data1).toEqual(data2);
    });
  });

  describe('Public API: setSSNData', () => {
    it('should set SSN data', async () => {
      const testData: SSNData = {
        ssn: '123-45-6789',
      };

      element.setSSNData(testData);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const data = element.getSSNData();
      expect(data.ssn).toBe('123-45-6789');
    });

    it('should update input value', async () => {
      element.setSSNData({ ssn: '987-65-4321' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const input = element.querySelector('usa-text-input') as any;
      expect(input?.value).toBe('987-65-4321');
    });
  });

  describe('Public API: clearSSN', () => {
    it('should clear SSN data', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;

      element.clearSSN();
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('');
    });

    it('should clear input value', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      element.clearSSN();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const input = element.querySelector('usa-text-input') as any;
      expect(input?.value).toBe('');
    });
  });

  describe('Public API: validateSSN', () => {
    it('should return true if not required and empty', () => {
      element.required = false;
      expect(element.validateSSN()).toBe(true);
    });

    it('should return false for empty SSN when required', () => {
      element.required = true;
      expect(element.validateSSN()).toBe(false);
    });

    it('should return true for valid SSN', async () => {
      element.setSSNData({ ssn: '123-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(true);
    });

    it('should return false for SSN with invalid area (000)', async () => {
      element.setSSNData({ ssn: '000-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with invalid area (666)', async () => {
      element.setSSNData({ ssn: '666-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with invalid area (900+)', async () => {
      element.setSSNData({ ssn: '900-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with invalid group (00)', async () => {
      element.setSSNData({ ssn: '123-00-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with invalid serial (0000)', async () => {
      element.setSSNData({ ssn: '123-45-0000' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with wrong length', async () => {
      element.setSSNData({ ssn: '12345678' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should validate SSN with hyphens', async () => {
      element.setSSNData({ ssn: '123-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(true);
    });

    it('should validate SSN with spaces', async () => {
      element.setSSNData({ ssn: '123 45 6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(true);
    });

    it('should validate SSN without separators', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(true);
    });
  });

  describe('Public API: getSSN', () => {
    it('should return empty string initially', () => {
      expect(element.getSSN()).toBe('');
    });

    it('should return current SSN value', async () => {
      element.setSSNData({ ssn: '123-45-6789' });
      await element.updateComplete;

      expect(element.getSSN()).toBe('123-45-6789');
    });
  });

  describe('Public API: getNormalizedSSN', () => {
    it('should return empty string for empty SSN', () => {
      expect(element.getNormalizedSSN()).toBe('');
    });

    it('should remove hyphens from SSN', async () => {
      element.setSSNData({ ssn: '123-45-6789' });
      await element.updateComplete;

      expect(element.getNormalizedSSN()).toBe('123456789');
    });

    it('should remove spaces from SSN', async () => {
      element.setSSNData({ ssn: '123 45 6789' });
      await element.updateComplete;

      expect(element.getNormalizedSSN()).toBe('123456789');
    });

    it('should return as-is if already normalized', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;

      expect(element.getNormalizedSSN()).toBe('123456789');
    });
  });

  describe('Public API: getFormattedSSN', () => {
    it('should return empty string for empty SSN', () => {
      expect(element.getFormattedSSN()).toBe('');
    });

    it('should format SSN with hyphens', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;

      expect(element.getFormattedSSN()).toBe('123-45-6789');
    });

    it('should reformat SSN with spaces to hyphens', async () => {
      element.setSSNData({ ssn: '123 45 6789' });
      await element.updateComplete;

      expect(element.getFormattedSSN()).toBe('123-45-6789');
    });

    it('should handle partial SSN (first 3 digits)', async () => {
      element.setSSNData({ ssn: '123' });
      await element.updateComplete;

      expect(element.getFormattedSSN()).toBe('123');
    });

    it('should handle partial SSN (first 5 digits)', async () => {
      element.setSSNData({ ssn: '12345' });
      await element.updateComplete;

      expect(element.getFormattedSSN()).toBe('123-45');
    });
  });

  describe('Accessibility', () => {
    it('should use fieldset and legend for grouping', () => {
      const fieldset = element.querySelector('fieldset.usa-fieldset');
      const legend = element.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(fieldset?.contains(legend!)).toBe(true);
    });

    it('should have hint associated with input', () => {
      const hint = element.querySelector('.usa-hint');
      const hintId = hint?.id;

      expect(hintId).toBeTruthy();
      expect(hintId).toContain('hint');
    });

    it('should connect input to hint via aria-describedby', () => {
      const input = element.querySelector('usa-text-input');
      const hint = element.querySelector('.usa-hint');
      const hintId = hint?.id;

      expect(input?.getAttribute('aria-describedby')).toContain(hintId!);
    });
  });

  describe('USWDS Best Practices', () => {
    it('should provide explanation via hint text', () => {
      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent).toBeTruthy();
    });

    it('should allow linking to explanation page', async () => {
      element.showWhyLink = true;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/privacy-policy');
    });

    it('should use usa-input--xl for better visibility', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.classList.contains('usa-input--xl')).toBe(true);
    });
  });
});
