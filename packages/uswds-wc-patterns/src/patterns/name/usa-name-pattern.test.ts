import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-name-pattern.js';
import type { USANamePattern, NameData, NameFormat } from './usa-name-pattern.js';

describe('USANamePattern', () => {
  let pattern: USANamePattern;
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
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-NAME-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.label).toBe('Name');
      expect(pattern.format).toBe('full');
      expect(pattern.required).toBe(false);
      expect(pattern.showMiddle).toBe(false);
      expect(pattern.showSuffix).toBe(false);
      expect(pattern.showPreferred).toBe(false);
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
      expect(legend?.textContent).toBe('Name');
    });

    it('should render full name field by default', async () => {
      await pattern.updateComplete;

      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName).toBeTruthy();
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement('usa-name-pattern') as USANamePattern;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.nameData).toBeDefined();
      expect(event.detail.nameData).toEqual({});

      newPattern.remove();
    });
  });

  describe('Name Format - Full', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'full';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render only full name field', () => {
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(fullName).toBeTruthy();
      expect(fullName?.closest('.display-none')).toBe(null); // Full name visible

      // Separate fields exist but are hidden
      expect(givenName).toBeTruthy();
      expect(familyName).toBeTruthy();
      expect(givenName?.closest('.display-none')).toBeTruthy(); // Hidden with USWDS utility class
      expect(familyName?.closest('.display-none')).toBeTruthy(); // Hidden with USWDS utility class
    });

    it('should have maxlength of 128 characters', () => {
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName?.getAttribute('maxlength')).toBe('128');
    });

    it('should have descriptive hint text', () => {
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName?.getAttribute('hint')).toContain('as you would like it to appear');
    });
  });

  describe('Name Format - Separate', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render separate name fields', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');

      expect(givenName).toBeTruthy();
      expect(familyName).toBeTruthy();
      expect(givenName?.closest('.display-none')).toBe(null); // Given name visible
      expect(familyName?.closest('.display-none')).toBe(null); // Family name visible

      // Full name field exists but is hidden
      expect(fullName).toBeTruthy();
      expect(fullName?.closest('.display-none')).toBeTruthy(); // Hidden with USWDS utility class
    });

    it('should use culturally sensitive labels', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(givenName?.getAttribute('label')).toBe('Given name');
      expect(familyName?.getAttribute('label')).toBe('Family name');
    });

    it('should have hints explaining terminology', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(givenName?.getAttribute('hint')).toContain('first name');
      expect(familyName?.getAttribute('hint')).toContain('last name');
    });

    it('should not show middle name by default', () => {
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      expect(middleName).toBeTruthy(); // Element exists
      expect(middleName?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });

    it('should not show suffix by default', () => {
      const suffix = pattern.querySelector('usa-select[name="suffix"]');
      expect(suffix).toBeTruthy(); // Element exists
      expect(suffix?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });
  });

  describe('Name Format - Flexible', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'flexible';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render both full name and separate fields', () => {
      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(fullName).toBeTruthy();
      expect(givenName).toBeTruthy();
      expect(familyName).toBeTruthy();
    });
  });

  describe('Field Visibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show middle name when showMiddle is true', async () => {
      pattern.showMiddle = true;
      await pattern.updateComplete;

      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      expect(middleName).toBeTruthy();
      expect(middleName?.getAttribute('hint')).toContain('optional');
    });

    it('should show suffix when showSuffix is true', async () => {
      pattern.showSuffix = true;
      await pattern.updateComplete;

      const suffix = pattern.querySelector('usa-select[name="suffix"]');
      expect(suffix).toBeTruthy();
      expect(suffix?.getAttribute('hint')).toContain('optional');
    });

    it('should not show preferred name by default', () => {
      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
      expect(preferredName).toBeTruthy(); // Element exists
      expect(preferredName?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });

    it('should show preferred name when showPreferred is true', async () => {
      pattern.showPreferred = true;
      await pattern.updateComplete;

      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
      expect(preferredName).toBeTruthy();
      expect(preferredName?.getAttribute('hint')).toContain('correspondence');
    });
  });

  describe('Required Fields', () => {
    it('should not mark fields as required by default - full format', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'full';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName?.hasAttribute('required')).toBe(false);
    });

    it('should mark full name as required when required prop is true', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'full';
      pattern.required = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const fullName = pattern.querySelector('usa-text-input[name="fullName"]');
      expect(fullName?.hasAttribute('required')).toBe(true);
    });

    it('should mark given and family names as required when required prop is true - separate format', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.required = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(givenName?.hasAttribute('required')).toBe(true);
      expect(familyName?.hasAttribute('required')).toBe(true);
    });

    it('should never mark middle name as required', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.required = true;
      pattern.showMiddle = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      expect(middleName?.hasAttribute('required')).toBe(false);
    });

    it('should never mark preferred name as required', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.required = true;
      pattern.showPreferred = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
      expect(preferredName?.hasAttribute('required')).toBe(false);
    });
  });

  describe('Data Changes', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showMiddle = true;
      pattern.showSuffix = true;
      pattern.showPreferred = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit name-change event when field changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('name-change', (e) => resolve(e as CustomEvent), { once: true });
      });

      const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
      givenName.value = 'John';
      givenName.dispatchEvent(new Event('input', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.nameData).toBeDefined();
      expect(event.detail.field).toBe('givenName');
    });

    it('should track all field values', async () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]') as any;
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]') as any;
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]') as any;
      const suffix = pattern.querySelector('usa-select[name="suffix"]') as any;
      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]') as any;

      givenName.value = 'John';
      givenName.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      middleName.value = 'Michael';
      middleName.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      familyName.value = 'Smith';
      familyName.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      suffix.value = 'Jr.';
      suffix.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      preferredName.value = 'Mike';
      preferredName.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getNameData();
      expect(data.givenName).toBe('John');
      expect(data.middleName).toBe('Michael');
      expect(data.familyName).toBe('Smith');
      expect(data.suffix).toBe('Jr.');
      expect(data.preferredName).toBe('Mike');
    });
  });

  describe('Public API', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showMiddle = true;
      pattern.showSuffix = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should get name data', () => {
      const data = pattern.getNameData();
      expect(data).toBeDefined();
      expect(data).toEqual({});
    });

    it('should set name data', async () => {
      const nameData: NameData = {
        givenName: 'Jane',
        middleName: 'Marie',
        familyName: 'Doe',
        suffix: 'III',
      };

      pattern.setNameData(nameData);
      await pattern.updateComplete;

      const data = pattern.getNameData();
      expect(data).toEqual(nameData);
    });

    it('should clear name', async () => {
      const nameData: NameData = {
        givenName: 'Jane',
        familyName: 'Doe',
      };

      pattern.setNameData(nameData);
      await pattern.updateComplete;

      pattern.clearName();
      await pattern.updateComplete;

      const data = pattern.getNameData();
      expect(data).toEqual({});
    });

    it('should validate required name - full format', async () => {
      pattern.format = 'full';
      pattern.required = true;
      await pattern.updateComplete;

      // Empty name should not be valid
      expect(pattern.validateName()).toBe(false);

      // Complete name should be valid
      pattern.setNameData({ fullName: 'John Doe' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);
    });

    it('should validate required name - separate format', async () => {
      pattern.format = 'separate';
      pattern.required = true;
      await pattern.updateComplete;

      // Empty name should not be valid
      expect(pattern.validateName()).toBe(false);

      // Only given name should not be valid
      pattern.setNameData({ givenName: 'John' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(false);

      // Complete name should be valid
      pattern.setNameData({
        givenName: 'John',
        familyName: 'Doe',
      });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);
    });

    it('should validate required name - flexible format', async () => {
      pattern.format = 'flexible';
      pattern.required = true;
      await pattern.updateComplete;

      // Empty name should not be valid
      expect(pattern.validateName()).toBe(false);

      // Full name should be valid
      pattern.setNameData({ fullName: 'John Doe' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);

      // Given + family should be valid
      pattern.clearName();
      pattern.setNameData({ givenName: 'John', familyName: 'Doe' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);
    });

    it('should always validate true when not required', async () => {
      pattern.required = false;
      await pattern.updateComplete;

      expect(pattern.validateName()).toBe(true);

      pattern.setNameData({ givenName: 'John' });
      await pattern.updateComplete;
      expect(pattern.validateName()).toBe(true);
    });

    it('should get formatted name from full name', async () => {
      pattern.format = 'full';
      await pattern.updateComplete;

      pattern.setNameData({ fullName: 'John Doe' });
      await pattern.updateComplete;

      expect(pattern.getFormattedName()).toBe('John Doe');
    });

    it('should get formatted name from separate fields', async () => {
      pattern.setNameData({
        givenName: 'John',
        middleName: 'Michael',
        familyName: 'Smith',
        suffix: 'Jr.',
      });
      await pattern.updateComplete;

      expect(pattern.getFormattedName()).toBe('John Michael Smith Jr.');
    });

    it('should get formatted name with only required fields', async () => {
      pattern.setNameData({
        givenName: 'John',
        familyName: 'Doe',
      });
      await pattern.updateComplete;

      expect(pattern.getFormattedName()).toBe('John Doe');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showMiddle = true;
      pattern.showSuffix = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have fieldset and legend for screen readers', () => {
      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toContain('Name');
    });

    it('should have proper label associations', async () => {
      await pattern.updateComplete;

      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');

      expect(givenName?.getAttribute('label')).toBeTruthy();
      expect(familyName?.getAttribute('label')).toBeTruthy();
      expect(middleName?.getAttribute('label')).toBeTruthy();
    });

    it('should use USWDS form markup structure', () => {
      const fieldset = pattern.querySelector('.usa-fieldset');
      const legend = pattern.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });

    it('should have descriptive hints for all fields', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');

      expect(givenName?.getAttribute('hint')).toBeTruthy();
      expect(familyName?.getAttribute('hint')).toBeTruthy();
      expect(middleName?.getAttribute('hint')).toBeTruthy();
    });

    it('should mark optional fields appropriately', () => {
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      const suffix = pattern.querySelector('usa-select[name="suffix"]');

      expect(middleName?.getAttribute('hint')).toContain('optional');
      expect(suffix?.getAttribute('hint')).toContain('optional');
    });
  });

  describe('Suffix Selection', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showSuffix = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render common name suffixes', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const options = selectComponent?.querySelectorAll('option');

      // Should have "- Select -" plus suffixes (Jr., Sr., II, III, IV, V)
      expect(options?.length).toBeGreaterThanOrEqual(7);
    });

    it('should have default empty option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const firstOption = selectComponent?.querySelector('option');

      expect(firstOption?.value).toBe('');
      expect(firstOption?.textContent).toContain('Select');
    });

    it('should have Jr. option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const jrOption = Array.from(selectComponent?.querySelectorAll('option') || [])
        .find(opt => (opt as HTMLOptionElement).value === 'Jr.');

      expect(jrOption).toBeTruthy();
    });

    it('should have Sr. option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const srOption = Array.from(selectComponent?.querySelectorAll('option') || [])
        .find(opt => (opt as HTMLOptionElement).value === 'Sr.');

      expect(srOption).toBeTruthy();
    });

    it('should have roman numeral options', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="suffix"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const iiOption = Array.from(selectComponent?.querySelectorAll('option') || [])
        .find(opt => (opt as HTMLOptionElement).value === 'II');
      const iiiOption = Array.from(selectComponent?.querySelectorAll('option') || [])
        .find(opt => (opt as HTMLOptionElement).value === 'III');

      expect(iiOption).toBeTruthy();
      expect(iiiOption).toBeTruthy();
    });
  });

  describe('Character Limits', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      pattern.showMiddle = true;
      pattern.showPreferred = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have 128 character limit for given name', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      expect(givenName?.getAttribute('maxlength')).toBe('128');
    });

    it('should have 128 character limit for middle name', () => {
      const middleName = pattern.querySelector('usa-text-input[name="middleName"]');
      expect(middleName?.getAttribute('maxlength')).toBe('128');
    });

    it('should have 128 character limit for family name', () => {
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      expect(familyName?.getAttribute('maxlength')).toBe('128');
    });

    it('should have 128 character limit for preferred name', () => {
      const preferredName = pattern.querySelector('usa-text-input[name="preferredName"]');
      expect(preferredName?.getAttribute('maxlength')).toBe('128');
    });
  });

  describe('Custom Labels', () => {
    it('should use custom label', async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.label = 'Full Legal Name';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const legend = pattern.querySelector('legend');
      expect(legend?.textContent).toBe('Full Legal Name');
    });
  });

  describe('Cultural Sensitivity', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-name-pattern') as USANamePattern;
      pattern.format = 'separate';
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should use "given name" instead of "first name"', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      expect(givenName?.getAttribute('label')).toBe('Given name');
    });

    it('should use "family name" instead of "last name"', () => {
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');
      expect(familyName?.getAttribute('label')).toBe('Family name');
    });

    it('should support long names (128 chars)', () => {
      const givenName = pattern.querySelector('usa-text-input[name="givenName"]');
      const familyName = pattern.querySelector('usa-text-input[name="familyName"]');

      expect(givenName?.getAttribute('maxlength')).toBe('128');
      expect(familyName?.getAttribute('maxlength')).toBe('128');
    });
  });
});
