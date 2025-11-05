import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { USARaceEthnicityPattern } from './usa-race-ethnicity-pattern.js';
import type { RaceEthnicityData } from './usa-race-ethnicity-pattern.js';

// Register the component
if (!customElements.get('usa-race-ethnicity-pattern')) {
  customElements.define('usa-race-ethnicity-pattern', USARaceEthnicityPattern);
}

describe('USARaceEthnicityPattern', () => {
  let element: USARaceEthnicityPattern;

  beforeEach(async () => {
    element = document.createElement('usa-race-ethnicity-pattern') as USARaceEthnicityPattern;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USARaceEthnicityPattern);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default race label', () => {
      expect(element.raceLabel).toBe(
        'Which of the following race classifications best describe you?'
      );
    });

    it('should have default ethnicity label', () => {
      expect(element.ethnicityLabel).toBe('I identify my ethnicity as:');
    });

    it('should not be required by default', () => {
      expect(element.required).toBe(false);
    });

    it('should show prefer not to share option by default', () => {
      expect(element.showPreferNotToShare).toBe(true);
    });

    it('should fire pattern-ready event on first update', async () => {
      const element2 = document.createElement(
        'usa-race-ethnicity-pattern'
      ) as USARaceEthnicityPattern;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('pattern-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('raceEthnicityData');

      element2.remove();
    });
  });

  describe('USWDS Styling', () => {
    it('should use usa-fieldset wrapper for race section', () => {
      const fieldsets = element.querySelectorAll('.usa-fieldset');
      expect(fieldsets.length).toBeGreaterThanOrEqual(2); // Race and Ethnicity sections
    });

    it('should use usa-legend--large for race header', () => {
      const legends = element.querySelectorAll('.usa-legend--large');
      expect(legends.length).toBeGreaterThanOrEqual(2); // Race and Ethnicity
      expect(legends[0]?.textContent).toContain('race classifications');
    });

    it('should use usa-legend--large for ethnicity header', () => {
      const legends = element.querySelectorAll('.usa-legend--large');
      expect(legends[1]?.textContent).toContain('ethnicity');
    });

    it('should use usa-input--xl for ethnicity input', () => {
      const input = element.querySelector('usa-text-input[name="ethnicity"]');
      expect(input?.classList.contains('usa-input--xl')).toBe(true);
    });
  });

  describe('Properties', () => {
    it('should update race label', async () => {
      element.raceLabel = 'Select your race';
      await element.updateComplete;

      const legend = element.querySelector('.usa-legend--large');
      expect(legend?.textContent).toBe('Select your race');
    });

    it('should update ethnicity label', async () => {
      element.ethnicityLabel = 'Your ethnicity';
      await element.updateComplete;

      const legends = element.querySelectorAll('.usa-legend--large');
      expect(legends[1]?.textContent).toBe('Your ethnicity');
    });

    it('should update required', async () => {
      element.required = true;
      await element.updateComplete;

      expect(element.required).toBe(true);
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

    it('should hide prefer not to share when showPreferNotToShare is false', async () => {
      element.showPreferNotToShare = false;
      await element.updateComplete;

      const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
      expect(checkbox).toBeFalsy();
    });
  });

  describe('CRITICAL: USWDS OMB Requirements', () => {
    it('should have exactly 5 OMB race categories', () => {
      const raceCheckboxes = element.querySelectorAll('usa-checkbox[name="race"]');
      expect(raceCheckboxes.length).toBe(5);
    });

    it('should have American Indian or Alaska Native option', () => {
      const checkbox = element.querySelector(
        'usa-checkbox[value="american-indian-alaska-native"]'
      );
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('American Indian or Alaska Native');
    });

    it('should have Asian option', () => {
      const checkbox = element.querySelector('usa-checkbox[value="asian"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('Asian');
    });

    it('should have Black or African American option', () => {
      const checkbox = element.querySelector('usa-checkbox[value="black-african-american"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('Black or African American');
    });

    it('should have Native Hawaiian or Other Pacific Islander option', () => {
      const checkbox = element.querySelector(
        'usa-checkbox[value="native-hawaiian-pacific-islander"]'
      );
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('Native Hawaiian or Other Pacific Islander');
    });

    it('should have White option', () => {
      const checkbox = element.querySelector('usa-checkbox[value="white"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toBe('White');
    });

    it('should support multi-select for race (checkboxes not radio)', () => {
      const checkboxes = element.querySelectorAll('usa-checkbox[name="race"]');
      expect(checkboxes.length).toBe(5);

      // Should not have radio buttons for race
      const radios = element.querySelectorAll('usa-radio[name="race"]');
      expect(radios.length).toBe(0);
    });

    it('should have ethnicity text input', () => {
      const input = element.querySelector('usa-text-input[name="ethnicity"]');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('type')).toBe('text');
    });

    it('should have "Prefer not to share" option', () => {
      const checkbox = element.querySelector('usa-checkbox[name="prefer-not-to-share"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox?.getAttribute('label')).toContain('Prefer not to share');
    });

    it('should have two separate sections (race and ethnicity)', () => {
      const fieldsets = element.querySelectorAll('.usa-fieldset');
      expect(fieldsets.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Race Selection', () => {
    it('should update data when race checkbox is checked', async () => {
      const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;

      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race).toContain('asian');
    });

    it('should support multiple race selections', async () => {
      const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      const whiteCheckbox = element.querySelector('usa-checkbox[value="white"]') as any;

      asianCheckbox.checked = true;
      asianCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      whiteCheckbox.checked = true;
      whiteCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race).toContain('asian');
      expect(data.race).toContain('white');
      expect(data.race?.length).toBe(2);
    });

    it('should remove race when unchecked', async () => {
      // First check
      const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      // Then uncheck
      checkbox.checked = false;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: false } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race).not.toContain('asian');
    });

    it('should fire race-ethnicity-change event on race change', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const detail = (await changePromise) as any;
      expect(detail.raceEthnicityData.race).toContain('asian');
    });
  });

  describe('Ethnicity Input', () => {
    it('should update data on ethnicity input', async () => {
      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;

      input.value = 'Hmong and Italian';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.ethnicity).toBe('Hmong and Italian');
    });

    it('should fire race-ethnicity-change event on ethnicity change', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('race-ethnicity-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      input.value = 'Mexican and Irish';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const detail = (await changePromise) as any;
      expect(detail.raceEthnicityData.ethnicity).toBe('Mexican and Irish');
    });
  });

  describe('Prefer Not to Share', () => {
    it('should update data when prefer not to share is checked', async () => {
      const checkbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;

      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.preferNotToShare).toBe(true);
    });

    it('should clear race and ethnicity when prefer not to share is checked', async () => {
      // First set some data
      const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      asianCheckbox.checked = true;
      asianCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const ethnicityInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      ethnicityInput.value = 'Hispanic';
      ethnicityInput.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      // Now check prefer not to share
      const preferCheckbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;
      preferCheckbox.checked = true;
      preferCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race?.length).toBe(0);
      expect(data.ethnicity).toBe('');
      expect(data.preferNotToShare).toBe(true);
    });

    it('should disable race checkboxes when prefer not to share is checked', async () => {
      const preferCheckbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;
      preferCheckbox.checked = true;
      preferCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const raceCheckboxes = element.querySelectorAll('usa-checkbox[name="race"]');
      raceCheckboxes.forEach((checkbox) => {
        expect(checkbox.hasAttribute('disabled')).toBe(true);
      });
    });

    it('should disable ethnicity input when prefer not to share is checked', async () => {
      const preferCheckbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;
      preferCheckbox.checked = true;
      preferCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const ethnicityInput = element.querySelector('usa-text-input[name="ethnicity"]');
      expect(ethnicityInput?.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Public API: getRaceEthnicityData', () => {
    it('should return empty data initially', () => {
      const data = element.getRaceEthnicityData();
      expect(data.race?.length).toBe(0);
      expect(data.ethnicity).toBe('');
      expect(data.preferNotToShare).toBe(false);
    });

    it('should return current race and ethnicity data', async () => {
      const asianCheckbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      asianCheckbox.checked = true;
      asianCheckbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const ethnicityInput = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      ethnicityInput.value = 'Filipino';
      ethnicityInput.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race).toContain('asian');
      expect(data.ethnicity).toBe('Filipino');
    });

    it('should return a copy of data', () => {
      const data1 = element.getRaceEthnicityData();
      const data2 = element.getRaceEthnicityData();

      expect(data1).not.toBe(data2);
      expect(data1.race).not.toBe(data2.race); // Arrays should be different instances
      expect(data1).toEqual(data2);
    });
  });

  describe('Public API: setRaceEthnicityData', () => {
    it('should set race and ethnicity data', async () => {
      const testData: RaceEthnicityData = {
        race: ['asian', 'white'],
        ethnicity: 'Chinese and Irish',
        preferNotToShare: false,
      };

      element.setRaceEthnicityData(testData);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const data = element.getRaceEthnicityData();
      expect(data.race).toContain('asian');
      expect(data.race).toContain('white');
      expect(data.ethnicity).toBe('Chinese and Irish');
    });

    it('should update checkbox states', async () => {
      element.setRaceEthnicityData({
        race: ['black-african-american', 'native-hawaiian-pacific-islander'],
        ethnicity: '',
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const blackCheckbox = element.querySelector(
        'usa-checkbox[value="black-african-american"]'
      ) as any;
      const hawaiianCheckbox = element.querySelector(
        'usa-checkbox[value="native-hawaiian-pacific-islander"]'
      ) as any;

      expect(blackCheckbox?.checked).toBe(true);
      expect(hawaiianCheckbox?.checked).toBe(true);
    });

    it('should update ethnicity input value', async () => {
      element.setRaceEthnicityData({
        race: [],
        ethnicity: 'Puerto Rican',
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      expect(input?.value).toBe('Puerto Rican');
    });

    it('should update prefer not to share checkbox', async () => {
      element.setRaceEthnicityData({
        race: [],
        ethnicity: '',
        preferNotToShare: true,
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const checkbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;
      expect(checkbox?.checked).toBe(true);
    });
  });

  describe('Public API: clearRaceEthnicity', () => {
    it('should clear all race and ethnicity data', async () => {
      element.setRaceEthnicityData({
        race: ['asian'],
        ethnicity: 'Vietnamese',
        preferNotToShare: false,
      });
      await element.updateComplete;

      element.clearRaceEthnicity();
      await element.updateComplete;

      const data = element.getRaceEthnicityData();
      expect(data.race?.length).toBe(0);
      expect(data.ethnicity).toBe('');
      expect(data.preferNotToShare).toBe(false);
    });

    it('should clear checkbox states', async () => {
      element.setRaceEthnicityData({
        race: ['white', 'asian'],
        ethnicity: '',
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      element.clearRaceEthnicity();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const checkboxes = element.querySelectorAll('usa-checkbox[name="race"]');
      checkboxes.forEach((checkbox: any) => {
        expect(checkbox.checked).toBe(false);
      });
    });

    it('should clear ethnicity input value', async () => {
      element.setRaceEthnicityData({
        race: [],
        ethnicity: 'Korean',
      });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      element.clearRaceEthnicity();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      expect(input?.value).toBe('');
    });
  });

  describe('Public API: validateRaceEthnicity', () => {
    it('should return true if not required and empty', () => {
      element.required = false;
      expect(element.validateRaceEthnicity()).toBe(true);
    });

    it('should return true if prefer not to share is selected', async () => {
      element.required = true;

      const checkbox = element.querySelector(
        'usa-checkbox[name="prefer-not-to-share"]'
      ) as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      expect(element.validateRaceEthnicity()).toBe(true);
    });

    it('should return false if required and no data', () => {
      element.required = true;
      expect(element.validateRaceEthnicity()).toBe(false);
    });

    it('should return true if required and race is selected', async () => {
      element.required = true;

      const checkbox = element.querySelector('usa-checkbox[value="asian"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      expect(element.validateRaceEthnicity()).toBe(true);
    });

    it('should return true if required and ethnicity is provided', async () => {
      element.required = true;

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      input.value = 'Hispanic';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateRaceEthnicity()).toBe(true);
    });

    it('should return true if required and both race and ethnicity provided', async () => {
      element.required = true;

      const checkbox = element.querySelector('usa-checkbox[value="white"]') as any;
      checkbox.checked = true;
      checkbox.dispatchEvent(new CustomEvent('change', { detail: { checked: true } }));
      await element.updateComplete;

      const input = element.querySelector('usa-text-input[name="ethnicity"]') as any;
      input.value = 'Irish';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateRaceEthnicity()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should use fieldset and legend for grouping', () => {
      const fieldsets = element.querySelectorAll('fieldset.usa-fieldset');
      const legends = element.querySelectorAll('legend.usa-legend');

      expect(fieldsets.length).toBeGreaterThanOrEqual(2);
      expect(legends.length).toBeGreaterThanOrEqual(2);
    });

    it('should have hint associated with ethnicity input', () => {
      const hint = element.querySelector('#ethnicity-hint');
      const input = element.querySelector('usa-text-input[name="ethnicity"]');

      expect(hint).toBeTruthy();
      expect(input?.getAttribute('aria-describedby')).toContain('ethnicity-hint');
    });
  });

  describe('USWDS Best Practices', () => {
    it('should provide hint text for race section', () => {
      const hint = element.querySelector('#race-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent).toBeTruthy();
    });

    it('should provide hint text for ethnicity section', () => {
      const hint = element.querySelector('#ethnicity-hint');
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

    it('should use usa-input--xl for ethnicity input', () => {
      const input = element.querySelector('usa-text-input[name="ethnicity"]');
      expect(input?.classList.contains('usa-input--xl')).toBe(true);
    });
  });
});
