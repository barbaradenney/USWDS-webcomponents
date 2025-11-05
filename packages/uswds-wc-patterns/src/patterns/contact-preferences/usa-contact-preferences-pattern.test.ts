import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-contact-preferences-pattern.js';
import type {
  USAContactPreferencesPattern,
  ContactPreferencesData,
  ContactMethod,
} from './usa-contact-preferences-pattern.js';

describe('USAContactPreferencesPattern', () => {
  let pattern: USAContactPreferencesPattern;
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
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-CONTACT-PREFERENCES-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.label).toBe('Contact preferences');
      expect(pattern.hint).toBe('');
      expect(pattern.showAdditionalInfo).toBe(false);
      expect(pattern.methods).toBeUndefined();
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
      expect(legend?.textContent).toBe('Contact preferences');
    });

    it('should render default contact method checkboxes', async () => {
      await pattern.updateComplete;

      const checkboxes = pattern.querySelectorAll('usa-checkbox[name="contact-preferences"]');
      expect(checkboxes.length).toBe(4); // phone, text, email, mail
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.preferencesData).toBeDefined();
      expect(event.detail.preferencesData.preferredMethods).toEqual([]);

      newPattern.remove();
    });
  });

  describe('Default Contact Methods', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render phone option', () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]');
      expect(phoneCheckbox).toBeTruthy();
      expect(phoneCheckbox?.getAttribute('label')).toBe('Telephone call');
    });

    it('should render text option', () => {
      const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]');
      expect(textCheckbox).toBeTruthy();
      expect(textCheckbox?.getAttribute('label')).toBe('Text message');
    });

    it('should render email option', () => {
      const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]');
      expect(emailCheckbox).toBeTruthy();
      expect(emailCheckbox?.getAttribute('label')).toBe('Email');
    });

    it('should render mail option', () => {
      const mailCheckbox = pattern.querySelector('usa-checkbox[value="mail"]');
      expect(mailCheckbox).toBeTruthy();
      expect(mailCheckbox?.getAttribute('label')).toBe('Postal mail');
    });

    it('should include descriptions for some methods', () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]');
      const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]');

      expect(phoneCheckbox?.getAttribute('description')).toContain('voicemails');
      expect(textCheckbox?.getAttribute('description')).toContain('SMS');
    });
  });

  describe('Custom Contact Methods', () => {
    it('should render custom contact methods when provided', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;

      const customMethods: ContactMethod[] = [
        { value: 'fax', label: 'Fax', description: 'Fax number' },
        { value: 'video', label: 'Video call', description: 'Video conferencing' },
      ];

      pattern.methods = customMethods;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const faxCheckbox = pattern.querySelector('usa-checkbox[value="fax"]');
      const videoCheckbox = pattern.querySelector('usa-checkbox[value="video"]');

      expect(faxCheckbox).toBeTruthy();
      expect(videoCheckbox).toBeTruthy();
    });
  });

  describe('Field Visibility', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should not show additional info textarea by default', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea).toBeNull();
    });

    it('should show additional info textarea when showAdditionalInfo is true', async () => {
      pattern.showAdditionalInfo = true;
      await pattern.updateComplete;

      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea).toBeTruthy();
      expect(textarea?.getAttribute('label')).toBe('Additional information');
    });
  });

  describe('Multiple Checkbox Selection', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should allow selecting multiple contact methods', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
      const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]') as any;

      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      emailCheckbox.checked = true;
      emailCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toContain('phone');
      expect(data.preferredMethods).toContain('email');
      expect(data.preferredMethods?.length).toBe(2);
    });

    it('should remove method when unchecked', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;

      // Check
      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      let data = pattern.getPreferencesData();
      expect(data.preferredMethods).toContain('phone');

      // Uncheck
      phoneCheckbox.checked = false;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      data = pattern.getPreferencesData();
      expect(data.preferredMethods).not.toContain('phone');
    });

    it('should track all selected methods independently', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
      const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]') as any;
      const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]') as any;
      const mailCheckbox = pattern.querySelector('usa-checkbox[value="mail"]') as any;

      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      textCheckbox.checked = true;
      textCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      emailCheckbox.checked = true;
      emailCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      mailCheckbox.checked = true;
      mailCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods?.length).toBe(4);
      expect(data.preferredMethods).toContain('phone');
      expect(data.preferredMethods).toContain('text');
      expect(data.preferredMethods).toContain('email');
      expect(data.preferredMethods).toContain('mail');
    });
  });

  describe('Data Changes', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.showAdditionalInfo = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit preferences-change event when checkbox changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('preferences-change', (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });

      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.preferencesData).toBeDefined();
      expect(event.detail.field).toBe('preferredMethods');
    });

    it('should emit preferences-change event when additional info changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('preferences-change', (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });

      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]') as any;
      textarea.value = 'Please call after 5 PM';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.preferencesData).toBeDefined();
      expect(event.detail.field).toBe('additionalInfo');
      expect(event.detail.value).toBe('Please call after 5 PM');
    });

    it('should track all data changes', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]') as any;

      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      textarea.value = 'Prefer morning calls';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toContain('phone');
      expect(data.additionalInfo).toBe('Prefer morning calls');
    });
  });

  describe('Public API', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.showAdditionalInfo = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should get preferences data', () => {
      const data = pattern.getPreferencesData();
      expect(data).toBeDefined();
      expect(data.preferredMethods).toEqual([]);
    });

    it('should set preferences data', async () => {
      const preferencesData: ContactPreferencesData = {
        preferredMethods: ['phone', 'email'],
        additionalInfo: 'Please contact after 6 PM',
      };

      pattern.setPreferencesData(preferencesData);
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toEqual(['phone', 'email']);
      expect(data.additionalInfo).toBe('Please contact after 6 PM');
    });

    it('should clear preferences', async () => {
      const preferencesData: ContactPreferencesData = {
        preferredMethods: ['phone', 'email'],
        additionalInfo: 'Test info',
      };

      pattern.setPreferencesData(preferencesData);
      await pattern.updateComplete;

      pattern.clearPreferences();
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toEqual([]);
      expect(data.additionalInfo).toBeUndefined();
    });

    it('should get selected method count', async () => {
      expect(pattern.getSelectedMethodCount()).toBe(0);

      pattern.setPreferencesData({ preferredMethods: ['phone', 'email'] });
      await pattern.updateComplete;

      expect(pattern.getSelectedMethodCount()).toBe(2);
    });

    it('should check if specific method is selected', async () => {
      expect(pattern.isMethodSelected('phone')).toBe(false);

      pattern.setPreferencesData({ preferredMethods: ['phone', 'email'] });
      await pattern.updateComplete;

      expect(pattern.isMethodSelected('phone')).toBe(true);
      expect(pattern.isMethodSelected('email')).toBe(true);
      expect(pattern.isMethodSelected('text')).toBe(false);
    });
  });

  describe('Validation', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should return true when not required', () => {
      pattern.required = false;
      expect(pattern.validatePreferences()).toBe(true);
    });

    it('should return true when required and preferences are selected', async () => {
      pattern.required = true;
      pattern.setPreferencesData({ preferredMethods: ['email'] });
      await pattern.updateComplete;

      expect(pattern.validatePreferences()).toBe(true);
    });

    it('should return false when required and no preferences are selected', () => {
      pattern.required = true;
      expect(pattern.validatePreferences()).toBe(false);
    });

    it('should return true when required and multiple preferences are selected', async () => {
      pattern.required = true;
      pattern.setPreferencesData({ preferredMethods: ['email', 'phone'] });
      await pattern.updateComplete;

      expect(pattern.validatePreferences()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.hint = 'We will contact you within 5 business days';
      pattern.showAdditionalInfo = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have fieldset and legend for screen readers', () => {
      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toContain('Contact preferences');
    });

    it('should use USWDS form markup structure', () => {
      const fieldset = pattern.querySelector('.usa-fieldset');
      const legend = pattern.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });

    it('should have unique aria-describedby on fieldset', () => {
      const fieldset = pattern.querySelector('fieldset');
      const ariaDescribedBy = fieldset?.getAttribute('aria-describedby');

      expect(ariaDescribedBy).toBeTruthy();
      expect(ariaDescribedBy).not.toBe('');
    });

    it('should reference hint text in aria-describedby when present', () => {
      const fieldset = pattern.querySelector('fieldset');
      const ariaDescribedBy = fieldset?.getAttribute('aria-describedby');
      const hintElement = pattern.querySelector('.usa-hint[id]') as HTMLElement;

      expect(ariaDescribedBy).toContain(hintElement?.id);
    });

    it('should reference optional hint in aria-describedby', () => {
      const fieldset = pattern.querySelector('fieldset');
      const ariaDescribedBy = fieldset?.getAttribute('aria-describedby');
      const optionalHints = pattern.querySelectorAll('.usa-hint[id]');

      // Find the "optional" hint
      const optionalHint = Array.from(optionalHints).find((hint) =>
        hint.textContent?.includes('optional')
      );

      expect(optionalHint).toBeTruthy();
      expect(ariaDescribedBy).toContain(optionalHint?.id);
    });

    it('should have all hint elements with unique IDs', () => {
      const hints = pattern.querySelectorAll('.usa-hint[id]');
      const ids = Array.from(hints).map((hint) => hint.id);

      // Check all IDs are unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Check all IDs are non-empty
      ids.forEach((id) => {
        expect(id).toBeTruthy();
        expect(id.length).toBeGreaterThan(0);
      });
    });

    it('should have proper label associations for checkboxes', () => {
      const checkboxes = pattern.querySelectorAll('usa-checkbox');

      checkboxes.forEach((checkbox) => {
        expect(checkbox.getAttribute('label')).toBeTruthy();
      });
    });

    it('should have proper label for additional info textarea', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea?.getAttribute('label')).toBeTruthy();
      expect(textarea?.getAttribute('hint')).toBeTruthy();
    });

    it('should indicate optional nature of selections', () => {
      const optionalHint = Array.from(pattern.querySelectorAll('.usa-hint')).find((hint) =>
        hint.textContent?.includes('optional')
      );

      expect(optionalHint).toBeTruthy();
      expect(optionalHint?.textContent).toContain('Select all that apply');
    });
  });

  describe('Additional Information Textarea', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.showAdditionalInfo = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render textarea with proper attributes', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');

      expect(textarea).toBeTruthy();
      expect(textarea?.getAttribute('id')).toBe('additional-info');
      expect(textarea?.getAttribute('label')).toBe('Additional information');
    });

    it('should have descriptive hint text', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      const hint = textarea?.getAttribute('hint');

      expect(hint).toContain('accessibility');
      expect(hint).toContain('optional');
    });

    it('should have rows attribute', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea?.getAttribute('rows')).toBe('3');
    });

    it('should not be required', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea?.hasAttribute('required')).toBe(false);
    });
  });

  describe('Custom Labels and Hints', () => {
    it('should use custom label', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.label = 'How should we reach you?';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const legend = pattern.querySelector('legend');
      expect(legend?.textContent).toBe('How should we reach you?');
    });

    it('should display custom hint when provided', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.hint = 'We will contact you within 24 hours';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const hint = Array.from(pattern.querySelectorAll('.usa-hint')).find((h) =>
        h.textContent?.includes('24 hours')
      );

      expect(hint).toBeTruthy();
    });

    it('should not display hint element when hint is empty', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.hint = '';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const hints = Array.from(pattern.querySelectorAll('.usa-hint'));
      const customHint = hints.find((h) => h.id.includes('hint') && h.textContent !== '');

      // Should only have the optional hint, not a custom hint
      expect(hints.length).toBe(1);
      expect(hints[0].textContent).toContain('optional');
    });
  });

  describe('Pattern-specific Features', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render all checkboxes with same name attribute', () => {
      const checkboxes = pattern.querySelectorAll('usa-checkbox');

      checkboxes.forEach((checkbox) => {
        expect(checkbox.getAttribute('name')).toBe('contact-preferences');
      });
    });

    it('should have unique IDs for each checkbox', () => {
      const checkboxes = pattern.querySelectorAll('usa-checkbox[id]');
      const ids = Array.from(checkboxes).map((cb) => cb.id);

      // Check all IDs are unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Check all IDs follow pattern
      ids.forEach((id) => {
        expect(id).toMatch(/^contact-/);
      });
    });

    it('should maintain selection state after re-render', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;

      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      // Force re-render
      pattern.requestUpdate();
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toContain('phone');
    });
  });

  describe('Best Practices', () => {
    it('should make selections optional by default', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const checkboxes = pattern.querySelectorAll('usa-checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox.hasAttribute('required')).toBe(false);
      });
    });

    it('should clearly indicate multiple selection is allowed', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const optionalHint = Array.from(pattern.querySelectorAll('.usa-hint')).find((hint) =>
        hint.textContent?.includes('Select all that apply')
      );

      expect(optionalHint).toBeTruthy();
    });
  });
});
