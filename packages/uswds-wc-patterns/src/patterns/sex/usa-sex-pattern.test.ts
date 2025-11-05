import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { USASexPattern } from './usa-sex-pattern.js';
import type { SexData } from './usa-sex-pattern.js';

// Register the component
if (!customElements.get('usa-sex-pattern')) {
  customElements.define('usa-sex-pattern', USASexPattern);
}

describe('USASexPattern', () => {
  let element: USASexPattern;

  beforeEach(async () => {
    element = document.createElement('usa-sex-pattern') as USASexPattern;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USASexPattern);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default label', () => {
      expect(element.label).toBe('Sex');
    });

    it('should not be required by default', () => {
      expect(element.required).toBe(false);
    });

    it('should have default hint', () => {
      expect(element.hint).toBe('Please select your sex from the following options.');
    });

    it('should not show why link by default', () => {
      expect(element.showWhyLink).toBe(false);
    });

    it('should fire pattern-ready event on first update', async () => {
      const element2 = document.createElement('usa-sex-pattern') as USASexPattern;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('pattern-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('sexData');

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
  });

  describe('Properties', () => {
    it('should update label', async () => {
      element.label = 'Biological Sex';
      await element.updateComplete;

      const legend = element.querySelector('.usa-legend--large');
      expect(legend?.textContent).toBe('Biological Sex');
    });

    it('should update required', async () => {
      element.required = true;
      await element.updateComplete;

      const radios = element.querySelectorAll('usa-radio[name="sex"]');
      radios.forEach((radio) => {
        expect(radio.hasAttribute('required')).toBe(true);
      });
    });

    it('should update hint', async () => {
      element.hint = 'This helps us provide appropriate care';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint?.textContent).toContain('This helps us provide appropriate care');
    });

    it('should show hint when provided', async () => {
      element.hint = 'Required for medical records';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
    });

    it('should show why link when enabled', async () => {
      element.showWhyLink = true;
      element.whyUrl = '/why-sex-info';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a.usa-link');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/why-sex-info');
      expect(link?.textContent).toContain('Why do we ask for sex information?');
    });

    it('should not show why link when disabled', async () => {
      element.showWhyLink = false;
      element.whyUrl = '/why-sex-info';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a.usa-link');
      expect(link).toBeFalsy();
    });
  });

  describe('CRITICAL: USWDS Requirements', () => {
    it('should use "sex" terminology (NOT "gender")', () => {
      const legend = element.querySelector('.usa-legend');
      expect(legend?.textContent).toBe('Sex');

      const radios = element.querySelectorAll('usa-radio[name="sex"]');
      radios.forEach((radio) => {
        expect(radio.getAttribute('name')).toBe('sex');
      });
    });

    it('should only have Male and Female options (NO other options)', () => {
      const radios = element.querySelectorAll('usa-radio[name="sex"]');
      expect(radios.length).toBe(2);

      const values = Array.from(radios).map((radio) => radio.getAttribute('value'));
      expect(values).toEqual(['male', 'female']);
    });

    it('should NOT have "Prefer not to answer" option', () => {
      const radios = element.querySelectorAll('usa-radio[name="sex"]');
      const hasPreferNotToAnswer = Array.from(radios).some((radio) => {
        const label = radio.getAttribute('label');
        return (
          label?.toLowerCase().includes('prefer not') ||
          label?.toLowerCase().includes('decline') ||
          label?.toLowerCase().includes('other')
        );
      });

      expect(hasPreferNotToAnswer).toBe(false);
    });

    it('should NOT have non-binary or other options', () => {
      const radios = element.querySelectorAll('usa-radio[name="sex"]');
      const hasOtherOptions = Array.from(radios).some((radio) => {
        const value = radio.getAttribute('value');
        const label = radio.getAttribute('label');
        return (
          value === 'non-binary' ||
          value === 'other' ||
          value === 'x' ||
          label?.toLowerCase().includes('non-binary') ||
          label?.toLowerCase().includes('other')
        );
      });

      expect(hasOtherOptions).toBe(false);
    });
  });

  describe('Radio Button Fields', () => {
    it('should render male radio button', () => {
      const maleRadio = element.querySelector('usa-radio[value="male"]');
      expect(maleRadio).toBeTruthy();
      expect(maleRadio?.getAttribute('label')).toBe('Male');
    });

    it('should render female radio button', () => {
      const femaleRadio = element.querySelector('usa-radio[value="female"]');
      expect(femaleRadio).toBeTruthy();
      expect(femaleRadio?.getAttribute('label')).toBe('Female');
    });

    it('should update data on male selection', async () => {
      const maleRadio = element.querySelector('usa-radio[value="male"]') as any;

      maleRadio.dispatchEvent(
        new CustomEvent('change', {
          detail: { checked: true, value: 'male' },
          bubbles: true,
        })
      );
      await element.updateComplete;

      const data = element.getSexData();
      expect(data.sex).toBe('male');
    });

    it('should update data on female selection', async () => {
      const femaleRadio = element.querySelector('usa-radio[value="female"]') as any;

      femaleRadio.dispatchEvent(
        new CustomEvent('change', {
          detail: { checked: true, value: 'female' },
          bubbles: true,
        })
      );
      await element.updateComplete;

      const data = element.getSexData();
      expect(data.sex).toBe('female');
    });

    it('should fire sex-change event on selection', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('sex-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const maleRadio = element.querySelector('usa-radio[value="male"]') as any;

      maleRadio.dispatchEvent(
        new CustomEvent('change', {
          detail: { checked: true, value: 'male' },
          bubbles: true,
        })
      );
      await element.updateComplete;

      const detail = (await changePromise) as any;
      expect(detail.value).toBe('male');
      expect(detail.sexData.sex).toBe('male');
    });
  });

  describe('Public API: getSexData', () => {
    it('should return empty sex data initially', () => {
      const data = element.getSexData();
      expect(data.sex).toBe('');
    });

    it('should return current sex data', async () => {
      const maleRadio = element.querySelector('usa-radio[value="male"]') as any;

      maleRadio.dispatchEvent(
        new CustomEvent('change', {
          detail: { checked: true, value: 'male' },
          bubbles: true,
        })
      );
      await element.updateComplete;

      const data = element.getSexData();
      expect(data.sex).toBe('male');
    });

    it('should return a copy of data', () => {
      const data1 = element.getSexData();
      const data2 = element.getSexData();

      expect(data1).not.toBe(data2);
      expect(data1).toEqual(data2);
    });
  });

  describe('Public API: setSexData', () => {
    it('should set sex data to male', async () => {
      const testData: SexData = {
        sex: 'male',
      };

      element.setSexData(testData);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const data = element.getSexData();
      expect(data.sex).toBe('male');
    });

    it('should set sex data to female', async () => {
      const testData: SexData = {
        sex: 'female',
      };

      element.setSexData(testData);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const data = element.getSexData();
      expect(data.sex).toBe('female');
    });

    it('should check correct radio button', async () => {
      element.setSexData({ sex: 'female' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const femaleRadio = element.querySelector('usa-radio[value="female"]') as any;
      expect(femaleRadio?.checked).toBe(true);
    });

    it('should uncheck other radio buttons', async () => {
      element.setSexData({ sex: 'male' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const femaleRadio = element.querySelector('usa-radio[value="female"]') as any;
      expect(femaleRadio?.checked).toBe(false);
    });
  });

  describe('Public API: clearSex', () => {
    it('should clear sex data', async () => {
      element.setSexData({ sex: 'male' });
      await element.updateComplete;

      element.clearSex();
      await element.updateComplete;

      const data = element.getSexData();
      expect(data.sex).toBe('');
    });

    it('should reset radio buttons', async () => {
      element.setSexData({ sex: 'male' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      element.clearSex();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const radios = element.querySelectorAll('usa-radio[name="sex"]');
      radios.forEach((radio: any) => {
        expect(radio.checked).toBeFalsy();
      });
    });
  });

  describe('Public API: validateSex', () => {
    it('should return true if not required', () => {
      element.required = false;
      expect(element.validateSex()).toBe(true);
    });

    it('should return false for empty sex when required', () => {
      element.required = true;
      expect(element.validateSex()).toBe(false);
    });

    it('should return true for male when required', async () => {
      element.required = true;
      element.setSexData({ sex: 'male' });
      await element.updateComplete;

      expect(element.validateSex()).toBe(true);
    });

    it('should return true for female when required', async () => {
      element.required = true;
      element.setSexData({ sex: 'female' });
      await element.updateComplete;

      expect(element.validateSex()).toBe(true);
    });
  });

  describe('Public API: getSex', () => {
    it('should return empty string initially', () => {
      expect(element.getSex()).toBe('');
    });

    it('should return current sex value', async () => {
      element.setSexData({ sex: 'female' });
      await element.updateComplete;

      expect(element.getSex()).toBe('female');
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

    it('should have hint associated with fieldset', () => {
      const hint = element.querySelector('.usa-hint');
      const hintId = hint?.id;

      expect(hintId).toBeTruthy();
      expect(hintId).toContain('hint');
    });

    it('should have proper radio button names for grouping', () => {
      const radios = element.querySelectorAll('usa-radio[name="sex"]');
      expect(radios.length).toBe(2);

      radios.forEach((radio) => {
        expect(radio.getAttribute('name')).toBe('sex');
      });
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
  });
});
