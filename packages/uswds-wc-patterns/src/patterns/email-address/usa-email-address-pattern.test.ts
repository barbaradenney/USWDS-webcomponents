import { describe, it, expect, beforeEach } from 'vitest';
import { USAEmailAddressPattern } from './usa-email-address-pattern.js';
import type { EmailAddressData } from './usa-email-address-pattern.js';

// Register the component
if (!customElements.get('usa-email-address-pattern')) {
  customElements.define('usa-email-address-pattern', USAEmailAddressPattern);
}

describe('USAEmailAddressPattern', () => {
  let element: USAEmailAddressPattern;

  beforeEach(async () => {
    element = document.createElement('usa-email-address-pattern') as USAEmailAddressPattern;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USAEmailAddressPattern);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default label', () => {
      expect(element.label).toBe('Email address');
    });

    it('should be required by default', () => {
      expect(element.required).toBe(true);
    });

    it('should not show consent by default', () => {
      expect(element.showConsent).toBe(false);
    });

    it('should have default consent label', () => {
      expect(element.consentLabel).toBe('May we send sensitive information to this email?');
    });

    it('should fire pattern-ready event on first update', async () => {
      const element2 = document.createElement('usa-email-address-pattern') as USAEmailAddressPattern;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('pattern-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('emailData');

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
      element.label = 'Contact Email';
      await element.updateComplete;

      const legend = element.querySelector('.usa-legend--large');
      expect(legend?.textContent).toBe('Contact Email');
    });

    it('should update required', async () => {
      element.required = false;
      await element.updateComplete;

      const input = element.querySelector('usa-text-input[name="email"]');
      expect(input?.hasAttribute('required')).toBe(false);
    });

    it('should update hint', async () => {
      element.hint = 'We will send a verification link';
      await element.updateComplete;

      const input = element.querySelector('usa-text-input[name="email"]');
      expect(input?.getAttribute('hint')).toBe('We will send a verification link');
    });
  });

  describe('Consent Section Visibility', () => {
    it('should hide consent section by default', () => {
      const consentSection = element.querySelector('.consent-section');
      expect(consentSection?.classList.contains('display-none')).toBe(true);
    });

    it('should show consent section when showConsent is true', async () => {
      element.showConsent = true;
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for Promise.resolve()

      const consentSection = element.querySelector('.consent-section');
      expect(consentSection?.classList.contains('display-none')).toBe(false);
    });

    it('should hide consent section when showConsent is false', async () => {
      element.showConsent = true;
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      element.showConsent = false;
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      const consentSection = element.querySelector('.consent-section');
      expect(consentSection?.classList.contains('display-none')).toBe(true);
    });

    it('should update consent label', async () => {
      element.showConsent = true;
      element.consentLabel = 'Can we send sensitive data?';
      await element.updateComplete;

      const consentFieldset = element.querySelector('.consent-section .usa-fieldset');
      const legend = consentFieldset?.querySelector('.usa-legend');
      expect(legend?.textContent).toBe('Can we send sensitive data?');
    });
  });

  describe('Email Field', () => {
    it('should render email input', () => {
      const emailInput = element.querySelector('usa-text-input[name="email"]');
      expect(emailInput).toBeTruthy();
    });

    it('should have correct email input attributes', () => {
      const emailInput = element.querySelector('usa-text-input[name="email"]');
      expect(emailInput?.getAttribute('type')).toBe('email');
      expect(emailInput?.getAttribute('autocapitalize')).toBe('off');
      expect(emailInput?.getAttribute('autocorrect')).toBe('off');
      expect(emailInput?.getAttribute('maxlength')).toBe('256');
    });

    it('should update email data on input', async () => {
      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = 'test@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getEmailData();
      expect(data.email).toBe('test@example.com');
    });

    it('should fire email-change event on input', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('email-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = 'test@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const detail = await changePromise as any;
      expect(detail.field).toBe('email');
      expect(detail.value).toBe('test@example.com');
      expect(detail.emailData.email).toBe('test@example.com');
    });
  });

  describe('Consent Radio Buttons', () => {
    beforeEach(async () => {
      element.showConsent = true;
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should render consent radio buttons', () => {
      const radios = element.querySelectorAll('usa-radio[name="sensitiveInfoConsent"]');
      expect(radios.length).toBe(2);
    });

    it('should have correct radio values', () => {
      const yesRadio = element.querySelector('usa-radio[value="yes-info"]');
      const noRadio = element.querySelector('usa-radio[value="no-info"]');

      expect(yesRadio).toBeTruthy();
      expect(noRadio).toBeTruthy();
    });

    it('should update consent data on radio change', async () => {
      const yesRadio = element.querySelector('usa-radio[value="yes-info"]') as any;

      yesRadio.dispatchEvent(new CustomEvent('change', {
        detail: { checked: true, value: 'yes-info' },
        bubbles: true,
      }));
      await element.updateComplete;

      const data = element.getEmailData();
      expect(data.sensitiveInfoConsent).toBe('yes-info');
    });

    it('should fire email-change event on consent change', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('email-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const noRadio = element.querySelector('usa-radio[value="no-info"]') as any;

      noRadio.dispatchEvent(new CustomEvent('change', {
        detail: { checked: true, value: 'no-info' },
        bubbles: true,
      }));
      await element.updateComplete;

      const detail = await changePromise as any;
      expect(detail.field).toBe('sensitiveInfoConsent');
      expect(detail.value).toBe('no-info');
    });
  });

  describe('Public API: getEmailData', () => {
    it('should return empty email data initially', () => {
      const data = element.getEmailData();
      expect(data.email).toBeUndefined();
      expect(data.sensitiveInfoConsent).toBe('');
    });

    it('should return current email data', async () => {
      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = 'user@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getEmailData();
      expect(data.email).toBe('user@example.com');
    });

    it('should return a copy of data', () => {
      const data1 = element.getEmailData();
      const data2 = element.getEmailData();

      expect(data1).not.toBe(data2);
      expect(data1).toEqual(data2);
    });
  });

  describe('Public API: setEmailData', () => {
    it('should set email data', async () => {
      const testData: EmailAddressData = {
        email: 'set@example.com',
        sensitiveInfoConsent: 'yes-info',
      };

      element.setEmailData(testData);
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      const data = element.getEmailData();
      expect(data.email).toBe('set@example.com');
      expect(data.sensitiveInfoConsent).toBe('yes-info');
    });

    it('should update email input value', async () => {
      element.setEmailData({ email: 'input@example.com' });
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      expect(emailInput?.value).toBe('input@example.com');
    });

    it('should check correct radio button', async () => {
      element.showConsent = true;
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      element.setEmailData({ sensitiveInfoConsent: 'no-info' });
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      const noRadio = element.querySelector('usa-radio[value="no-info"]') as any;
      expect(noRadio?.checked).toBe(true);
    });
  });

  describe('Public API: clearEmail', () => {
    it('should clear email data', async () => {
      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = 'clear@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      element.clearEmail();
      await element.updateComplete;

      const data = element.getEmailData();
      expect(data.email).toBeUndefined();
      expect(data.sensitiveInfoConsent).toBe('');
    });

    it('should reset email input', async () => {
      element.clearEmail();
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;
      expect(input?.value).toBe('');
    });

    it('should reset radio buttons', async () => {
      element.showConsent = true;
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      element.clearEmail();
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      const radios = element.querySelectorAll('usa-radio[name="sensitiveInfoConsent"]');
      radios.forEach((radio: any) => {
        expect(radio.checked).toBeFalsy();
      });
    });
  });

  describe('Public API: validateEmail', () => {
    it('should return true if not required', () => {
      element.required = false;
      expect(element.validateEmail()).toBe(true);
    });

    it('should return false for empty email when required', () => {
      element.required = true;
      expect(element.validateEmail()).toBe(false);
    });

    it('should return true for valid email', async () => {
      element.required = true;

      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = 'valid@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateEmail()).toBe(true);
    });

    it('should return false for email without @', async () => {
      element.required = true;

      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = 'invalid.email.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateEmail()).toBe(false);
    });

    it('should return false for email without local part', async () => {
      element.required = true;

      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = '@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateEmail()).toBe(false);
    });

    it('should return false for email without domain', async () => {
      element.required = true;

      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = 'user@';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateEmail()).toBe(false);
    });

    it('should return false for email over 256 characters', async () => {
      element.required = true;

      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      const longEmail = 'a'.repeat(250) + '@test.com';
      input.value = longEmail;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.validateEmail()).toBe(false);
    });
  });

  describe('Public API: getEmail', () => {
    it('should return empty string initially', () => {
      expect(element.getEmail()).toBe('');
    });

    it('should return current email value', async () => {
      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const input = emailInput?.querySelector('input') as HTMLInputElement;

      input.value = 'get@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(element.getEmail()).toBe('get@example.com');
    });
  });

  describe('Public API: getConsent', () => {
    it('should return empty string initially', () => {
      expect(element.getConsent()).toBe('');
    });

    it('should return current consent value', async () => {
      element.showConsent = true;
      await element.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));

      const yesRadio = element.querySelector('usa-radio[value="yes-info"]') as any;

      yesRadio.dispatchEvent(new CustomEvent('change', {
        detail: { checked: true, value: 'yes-info' },
        bubbles: true,
      }));
      await element.updateComplete;

      expect(element.getConsent()).toBe('yes-info');
    });
  });

  describe('Light DOM Pattern', () => {
    it('should not re-render after initial render', async () => {
      const initialHTML = element.innerHTML;

      // Try to trigger re-render with showConsent change
      element.showConsent = true;
      await element.updateComplete;

      // HTML should be the same (class toggled manually, not re-rendered)
      expect(element.innerHTML).toBe(initialHTML);
    });

    it('should prevent re-render for visibility properties', async () => {
      const renderSpy = vi.spyOn(element, 'render');

      // After initial render
      await element.updateComplete;
      renderSpy.mockClear();

      // Change showConsent
      element.showConsent = true;
      await element.updateComplete;

      // render() should not be called
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should allow re-render for content properties', async () => {
      // After initial render
      await element.updateComplete;

      // Change label (content property)
      element.label = 'New Label';
      await element.updateComplete;

      const legend = element.querySelector('.usa-legend--large');
      expect(legend?.textContent).toBe('New Label');
    });
  });

  describe('Accessibility', () => {
    it('should have unique IDs for radio buttons', () => {
      element.showConsent = true;

      const yesRadio = element.querySelector('usa-radio[value="yes-info"]');
      const noRadio = element.querySelector('usa-radio[value="no-info"]');

      const yesId = yesRadio?.id;
      const noId = noRadio?.id;

      expect(yesId).toBeTruthy();
      expect(noId).toBeTruthy();
      expect(yesId).not.toBe(noId);
    });

    it('should use fieldset and legend for grouping', () => {
      const fieldset = element.querySelector('fieldset.usa-fieldset');
      const legend = element.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(fieldset?.contains(legend!)).toBe(true);
    });
  });
});
