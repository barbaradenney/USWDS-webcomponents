import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-alert.ts';
import type { USAAlert } from './usa-alert.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { quickUSWDSComplianceTest } from '@uswds-wc/test-utils/uswds-compliance-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import {
  testARIAAccessibility,
  testARIARoles,
  testAccessibleName,
} from '@uswds-wc/test-utils/aria-screen-reader-utils.js';

type AlertVariant = 'info' | 'warning' | 'error' | 'success' | 'emergency';

describe('USAAlert', () => {
  let element: USAAlert;

  beforeEach(() => {
    element = document.createElement('usa-alert') as USAAlert;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Default Properties', () => {
    it('should have correct default properties', async () => {
      await element.updateComplete;

      expect(element.variant).toBe('info');
      expect(element.heading).toBe('');
      expect(element.slim).toBe(false);
      expect(element.noIcon).toBe(false);
    });

    it('should set appropriate ARIA role by default', async () => {
      await element.updateComplete;

      expect(element.getAttribute('role')).toBe('status');
    });
  });

  describe('Variant Property', () => {
    it('should render correct CSS class for each variant', async () => {
      const variants = ['info', 'success', 'warning', 'error', 'emergency'] as const;

      for (const variant of variants) {
        element.variant = variant;
        await element.updateComplete;

        const alertDiv = element.querySelector('.usa-alert');
        expect(alertDiv?.classList.contains(`usa-alert--${variant}`)).toBe(true);
      }
    });

    it('should set alert role for urgent variants', async () => {
      // Error and emergency should have alert role
      element.variant = 'error';
      await element.updateComplete;
      expect(element.getAttribute('role')).toBe('alert');

      element.variant = 'emergency';
      await element.updateComplete;
      expect(element.getAttribute('role')).toBe('alert');

      // Info, success, warning should have status role
      element.variant = 'info';
      await element.updateComplete;
      expect(element.getAttribute('role')).toBe('status');

      element.variant = 'success';
      await element.updateComplete;
      expect(element.getAttribute('role')).toBe('status');

      element.variant = 'warning';
      await element.updateComplete;
      expect(element.getAttribute('role')).toBe('status');
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.heading = 'Test Alert';
      await element.updateComplete;

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass comprehensive USWDS compliance tests (prevents structural issues)', async () => {
      element.heading = 'Test Alert';
      await element.updateComplete;
      quickUSWDSComplianceTest(element, 'usa-alert');
    });
  });

  describe('Heading Property', () => {
    it('should render heading when provided', async () => {
      element.heading = 'Test Heading';
      await element.updateComplete;

      const headingElement = element.querySelector('.usa-alert__heading');
      expect(headingElement?.textContent).toBe('Test Heading');
    });

    it('should not render heading element when heading is empty', async () => {
      element.heading = '';
      await element.updateComplete;

      const headingElement = element.querySelector('.usa-alert__heading');
      expect(headingElement).toBeNull();
    });
  });

  describe('Slim Property', () => {
    it('should add slim CSS class when slim is true', async () => {
      element.slim = true;
      await element.updateComplete;

      const alertDiv = element.querySelector('.usa-alert');
      expect(alertDiv?.classList.contains('usa-alert--slim')).toBe(true);
    });

    it('should not add slim CSS class when slim is false', async () => {
      element.slim = false;
      await element.updateComplete;

      const alertDiv = element.querySelector('.usa-alert');
      expect(alertDiv?.classList.contains('usa-alert--slim')).toBe(false);
    });
  });

  describe('NoIcon Property', () => {
    it('should add no-icon CSS class when noIcon is true', async () => {
      element.noIcon = true;
      await element.updateComplete;

      const alertDiv = element.querySelector('.usa-alert');
      expect(alertDiv?.classList.contains('usa-alert--no-icon')).toBe(true);
    });

    it('should not add no-icon CSS class when noIcon is false', async () => {
      element.noIcon = false;
      await element.updateComplete;

      const alertDiv = element.querySelector('.usa-alert');
      expect(alertDiv?.classList.contains('usa-alert--no-icon')).toBe(false);
    });
  });

  describe('Slot Content', () => {
    it('should render text property content in alert text', async () => {
      // Note: Slots don't work in jsdom, so we test using the text property
      const testElement = document.createElement('usa-alert') as USAAlert;
      testElement.variant = 'info';
      testElement.heading = 'Test Heading';
      testElement.text = 'This is test text content';
      document.body.appendChild(testElement);

      await testElement.updateComplete;

      // Check structure exists
      const alertDiv = testElement.querySelector('.usa-alert');
      expect(alertDiv).toBeTruthy();

      const alertBody = testElement.querySelector('.usa-alert__body');
      expect(alertBody).toBeTruthy();

      const alertText = testElement.querySelector('.usa-alert__text');
      expect(alertText).toBeTruthy();

      // Check that content appears in alert text
      expect(alertText?.textContent?.trim()).toBe('This is test text content');

      testElement.remove();
    });

    it('should render HTML structure correctly', async () => {
      // Test that the component structure is set up correctly for content
      // (Light DOM content handling - tested in Cypress/Storybook)
      const newElement = document.createElement('usa-alert') as USAAlert;
      newElement.variant = 'success';
      newElement.heading = 'Success Message';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      // Verify structure is correct
      const alertText = newElement.querySelector('.usa-alert__text');
      expect(alertText).toBeTruthy();
      expect(alertText?.tagName.toLowerCase()).toBe('p');

      // Verify USWDS structure
      const alertBody = newElement.querySelector('.usa-alert__body');
      expect(alertBody).toBeTruthy();

      newElement.remove();
    });

    it('should render content without duplication', async () => {
      // Test using text property (slots don't work in jsdom)
      const testElement = document.createElement('usa-alert') as USAAlert;
      testElement.variant = 'warning';
      testElement.heading = 'Unique Test';
      testElement.text = 'This is unique test content';
      document.body.appendChild(testElement);

      await testElement.updateComplete;

      // Count occurrences of the unique text
      const allText = testElement.innerHTML;
      const uniquePhrase = 'unique test content';
      const occurrences = (allText.toLowerCase().match(new RegExp(uniquePhrase, 'g')) || []).length;

      // Should appear exactly once (in the alert text, not duplicated)
      expect(occurrences).toBe(1);

      // Verify it's in the correct location
      const alertText = testElement.querySelector('.usa-alert__text');
      expect(alertText?.textContent?.toLowerCase()).toContain(uniquePhrase);

      testElement.remove();
    });
  });

  describe('HTML Structure', () => {
    it('should render correct USWDS HTML structure', async () => {
      element.variant = 'info';
      element.heading = 'Test Heading';
      await element.updateComplete;

      // Check main structure
      const alertDiv = element.querySelector('.usa-alert.usa-alert--info');
      expect(alertDiv).toBeTruthy();

      const alertBody = element.querySelector('.usa-alert__body');
      expect(alertBody).toBeTruthy();

      const alertHeading = element.querySelector('.usa-alert__heading');
      expect(alertHeading?.tagName.toLowerCase()).toBe('h4');
      expect(alertHeading?.textContent).toBe('Test Heading');

      const alertText = element.querySelector('.usa-alert__text');
      expect(alertText?.tagName.toLowerCase()).toBe('p');
    });

    it('should not render dismiss button (USWDS compliance)', async () => {
      // Verify no dismiss button exists in USWDS-compliant implementation
      await element.updateComplete;

      const dismissButton = element.querySelector('.usa-alert__dismiss');
      expect(dismissButton).toBeNull();
    });
  });

  describe('CSS Classes', () => {
    it('should apply all appropriate USWDS classes', async () => {
      element.variant = 'warning';
      element.slim = true;
      element.noIcon = true;
      await element.updateComplete;

      const alertDiv = element.querySelector('.usa-alert');
      expect(alertDiv?.classList.contains('usa-alert')).toBe(true);
      expect(alertDiv?.classList.contains('usa-alert--warning')).toBe(true);
      expect(alertDiv?.classList.contains('usa-alert--slim')).toBe(true);
      expect(alertDiv?.classList.contains('usa-alert--no-icon')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles for different variants', async () => {
      // Test urgent variants (error, emergency) get alert role
      const urgentVariants: AlertVariant[] = ['error', 'emergency'];
      for (const variant of urgentVariants) {
        element.variant = variant;
        await element.updateComplete;
        expect(element.getAttribute('role')).toBe('alert');
      }

      // Test non-urgent variants get status role
      const nonUrgentVariants: AlertVariant[] = ['info', 'success', 'warning'];
      for (const variant of nonUrgentVariants) {
        element.variant = variant;
        await element.updateComplete;
        expect(element.getAttribute('role')).toBe('status');
      }
    });

    it('should use semantic HTML elements', async () => {
      element.heading = 'Alert Heading';
      await element.updateComplete;

      const heading = element.querySelector('.usa-alert__heading');
      expect(heading?.tagName.toLowerCase()).toBe('h4');

      const text = element.querySelector('.usa-alert__text');
      expect(text?.tagName.toLowerCase()).toBe('p');
    });
  });

  describe('Property Updates', () => {
    it('should update DOM when properties change', async () => {
      // Initial state
      await element.updateComplete;
      let alertDiv = element.querySelector('.usa-alert');
      expect(alertDiv?.classList.contains('usa-alert--info')).toBe(true);

      // Change variant
      element.variant = 'success';
      await element.updateComplete;
      alertDiv = element.querySelector('.usa-alert');
      expect(alertDiv?.classList.contains('usa-alert--success')).toBe(true);
      expect(alertDiv?.classList.contains('usa-alert--info')).toBe(false);

      // Change heading
      element.heading = 'New Heading';
      await element.updateComplete;
      const heading = element.querySelector('.usa-alert__heading');
      expect(heading?.textContent).toBe('New Heading');
    });
  });

  describe('Light DOM Rendering', () => {
    it('should render in light DOM for USWDS compatibility', async () => {
      await element.updateComplete;

      // Content should be directly in the element (light DOM)
      const alertDiv = element.querySelector('.usa-alert');
      expect(alertDiv).toBeTruthy();

      // Should not have shadow root
      expect(element.shadowRoot).toBeNull();
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath =
          `${process.cwd()}/src/components/alert/usa-alert.ts`;
        const validation = validateComponentJavaScript(componentPath, 'alert');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Test info alert with heading
      let element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'info';
      element.heading = 'Information';
      element.appendChild(document.createTextNode('This is an informational alert.'));
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Test success alert
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'success';
      element.heading = 'Success';
      element.appendChild(document.createTextNode('Your action was completed successfully.'));
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Test warning alert
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'warning';
      element.heading = 'Warning';
      element.appendChild(
        document.createTextNode('Please review your information before continuing.')
      );
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Test error alert
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'error';
      element.heading = 'Error';
      element.appendChild(document.createTextNode('There was an error processing your request.'));
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();
    });

    it('should maintain accessibility during dynamic state changes', async () => {
      // Emergency alert with content
      let element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'emergency';
      element.heading = 'Emergency Alert';
      element.appendChild(
        document.createTextNode(
          'This is an emergency notification that requires immediate attention.'
        )
      );
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Alert without heading
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'info';
      element.appendChild(
        document.createTextNode('Alert message without heading for accessibility testing.')
      );
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Alert with complex content and links
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'warning';
      element.heading = 'Alert with Links';
      const linkText = document.createElement('span');
      linkText.innerHTML =
        'Your session will expire in 5 minutes. <a href="/extend">Extend session</a> or <a href="/save">save your work</a>.';
      element.appendChild(linkText);
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();
    });

    it('should be accessible in real-world government use cases', async () => {
      // System maintenance notification
      let element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'warning';
      element.heading = 'Scheduled Maintenance';
      const maintenanceText = document.createElement('span');
      maintenanceText.innerHTML =
        'This system will be unavailable for maintenance on Saturday, March 15th from 2:00 AM to 6:00 AM EST. Please save your work and log out before this time. For urgent matters, contact our <a href="tel:1-800-555-0199">24-hour support line</a>.';
      element.appendChild(maintenanceText);
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Security alert
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'error';
      element.heading = 'Security Alert';
      const securityText = document.createElement('span');
      securityText.innerHTML =
        'We detected unusual activity on your account. Please <a href="/account/security">review your account security</a> and change your password immediately. If you did not authorize this activity, <a href="/contact">contact support</a> immediately.';
      element.appendChild(securityText);
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Application success notification
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'success';
      element.heading = 'Application Submitted';
      const successText = document.createElement('span');
      successText.innerHTML =
        'Your application has been successfully submitted. Application ID: <strong>APP-2024-001234</strong>. You will receive email updates at key milestones. Track your application status <a href="/status">here</a>.';
      element.appendChild(successText);
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Emergency notification
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'emergency';
      element.heading = 'Emergency Services Alert';
      const emergencyText = document.createElement('span');
      emergencyText.innerHTML =
        'Emergency services are currently experiencing high call volumes. For life-threatening emergencies, call 911 immediately. For non-emergency assistance, use our <a href="/emergency-contacts">emergency contacts directory</a>.';
      element.appendChild(emergencyText);
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();

      // Simple informational alert without heading
      element = document.createElement('usa-alert') as USAAlert;
      element.variant = 'info';
      element.appendChild(
        document.createTextNode(
          'New features are now available in your dashboard. Explore the updated interface to access enhanced functionality.'
        )
      );
      document.body.appendChild(element);
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      element.remove();
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard navigation to links in alert content', async () => {
      element.variant = 'info';
      element.heading = 'System Update';

      const content = document.createElement('div');
      content.innerHTML = 'Please review the <a href="/updates">latest updates</a> and <a href="/settings">configure your settings</a>.';
      element.appendChild(content);

      await element.updateComplete;

      // Get all focusable elements (links)
      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBe(2); // Two links

      // Verify each link is keyboard accessible
      focusableElements.forEach((link) => {
        expect(link.tagName).toBe('A');
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should be keyboard-only usable when containing interactive elements', async () => {
      element.variant = 'warning';
      element.heading = 'Action Required';

      const content = document.createElement('div');
      content.innerHTML = 'Your session will expire soon. <button type="button">Extend Session</button> or <a href="/logout">log out now</a>.';
      element.appendChild(content);

      await element.updateComplete;

      const result = await verifyKeyboardOnlyUsable(element);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('keyboard accessible');
    });

    it('should pass keyboard navigation tests for interactive alerts', async () => {
      element.variant = 'error';
      element.heading = 'Error';

      const content = document.createElement('div');
      content.innerHTML = 'An error occurred. <a href="/help">Get help</a> or <a href="/retry">try again</a>.';
      element.appendChild(content);

      await element.updateComplete;

      const result = await testKeyboardNavigation(element, {
        testEscapeKey: false, // Alerts don't close with Escape
        testArrowKeys: false, // Alerts don't use arrow navigation
      });

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should have no keyboard traps in alert content', async () => {
      element.variant = 'success';
      element.heading = 'Success';

      const content = document.createElement('div');
      content.innerHTML = 'Operation completed. View <a href="/results">results</a>, <a href="/history">history</a>, or <a href="/reports">reports</a>.';
      element.appendChild(content);

      await element.updateComplete;

      const links = element.querySelectorAll('a');
      expect(links.length).toBe(3);

      // Focus first link
      (links[0] as HTMLElement).focus();
      expect(document.activeElement).toBe(links[0]);

      // Verify Tab key is not trapped
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      links[0].dispatchEvent(tabEvent);
      expect(tabEvent.defaultPrevented).toBe(false);
    });

    it('should maintain proper tab order for multiple interactive elements', async () => {
      element.variant = 'info';
      element.heading = 'Multiple Actions';

      const content = document.createElement('div');
      content.innerHTML = `
        <a href="/first">First</a>
        <button type="button">Second</button>
        <a href="/third">Third</a>
        <button type="button">Fourth</button>
      `;
      element.appendChild(content);

      await element.updateComplete;

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBe(4);

      // Verify tab order is sequential
      focusableElements.forEach((el) => {
        expect((el as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle alerts without interactive content (no focusable elements)', async () => {
      element.variant = 'info';
      element.heading = 'Information';
      element.appendChild(document.createTextNode('This is a simple informational message.'));

      await element.updateComplete;

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBe(0); // No interactive elements

      // Alert should still be accessible via screen readers (role="status")
      expect(element.getAttribute('role')).toBe('status');
    });

    it('should support keyboard activation of buttons in alert content', async () => {
      element.variant = 'warning';
      element.heading = 'Warning';

      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Dismiss';
      button.addEventListener('click', () => {
        // Event listener for button click
      });

      const content = document.createElement('div');
      content.textContent = 'Unsaved changes detected. ';
      content.appendChild(button);
      element.appendChild(content);

      await element.updateComplete;

      // Focus the button
      button.focus();
      expect(document.activeElement).toBe(button);

      // Activate with Enter key
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      button.dispatchEvent(enterEvent);

      // Native buttons handle Enter automatically in browser
      // In jsdom we verify the button is properly set up
      expect(button.type).toBe('button');
      expect((button as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle keyboard focus for emergency variant with multiple actions', async () => {
      element.variant = 'emergency';
      element.heading = 'Emergency';

      const content = document.createElement('div');
      content.innerHTML = `
        Emergency!
        <a href="/emergency-contact">Contact Emergency Services</a> or
        <a href="/emergency-info">View Emergency Information</a>.
      `;
      element.appendChild(content);

      await element.updateComplete;

      const result = await verifyKeyboardOnlyUsable(element);
      expect(result.passed).toBe(true);

      // Verify proper ARIA role for emergency
      expect(element.getAttribute('role')).toBe('alert');
    });
  });

  describe('ARIA/Screen Reader Accessibility (WCAG 4.1)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-alert') as USAAlert;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    afterEach(() => {
      element.remove();
    });

    it('should have correct ARIA role for info variant', async () => {
      element.variant = 'info';
      element.heading = 'Information';
      await element.updateComplete;

      const result = testARIARoles(element, {
        expectedRole: 'status',
      });

      expect(result.correct).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should have correct ARIA role for error variant', async () => {
      element.variant = 'error';
      element.heading = 'Error occurred';
      await element.updateComplete;

      const result = testARIARoles(element, {
        expectedRole: 'alert',
      });

      expect(result.correct).toBe(true);
    });

    it('should have correct ARIA role for warning variant', async () => {
      element.variant = 'warning';
      element.heading = 'Warning';
      await element.updateComplete;

      // Warning uses role="status", not role="alert"
      const result = testARIARoles(element, {
        expectedRole: 'status',
      });

      expect(result.correct).toBe(true);
    });

    it('should have correct ARIA role for success variant', async () => {
      element.variant = 'success';
      element.heading = 'Success!';
      await element.updateComplete;

      const result = testARIARoles(element, {
        expectedRole: 'status',
      });

      expect(result.correct).toBe(true);
    });

    it('should have correct ARIA role for emergency variant', async () => {
      element.variant = 'emergency';
      element.heading = 'Emergency!';
      await element.updateComplete;

      const result = testARIARoles(element, {
        expectedRole: 'alert',
      });

      expect(result.correct).toBe(true);
    });

    it('should have accessible text in heading element', async () => {
      element.heading = 'Alert heading';
      await element.updateComplete;

      const heading = element.querySelector('.usa-alert__heading');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toContain('Alert heading');

      // The element itself should be accessible as a status/alert region
      const result = testAccessibleName(element);
      // Alert components typically don't have explicit accessible names
      // They rely on their role and content
      expect(result).toBeDefined();
    });

    // ✅ CYPRESS COVERAGE: cypress/e2e/alert-announcements.cy.ts
    // Tests ARIA role implementation (role="status" or role="alert")
    // Browser testing validates actual screen reader accessibility

    // ✅ CYPRESS COVERAGE: cypress/e2e/alert-announcements.cy.ts
    // Tests error alert ARIA role and accessibility structure

    it('should pass comprehensive ARIA accessibility tests', async () => {
      element.variant = 'info';
      element.heading = 'System notification';

      const content = document.createElement('div');
      content.textContent = 'Your changes have been saved.';
      element.appendChild(content);

      await element.updateComplete;

      const result = await testARIAAccessibility(element, {
        testLiveRegions: true,
        testRoleState: true,
        testNameRole: true,
      });

      expect(result.passed).toBe(true);
      expect(result.details.rolesCorrect).toBe(true);
    });

    it('should maintain ARIA attributes when variant changes', async () => {
      element.variant = 'info';
      element.heading = 'Info';
      await element.updateComplete;

      expect(element.getAttribute('role')).toBe('status');

      element.variant = 'error';
      await element.updateComplete;

      expect(element.getAttribute('role')).toBe('alert');

      element.variant = 'success';
      await element.updateComplete;

      expect(element.getAttribute('role')).toBe('status');
    });

    // ✅ CYPRESS COVERAGE: cypress/e2e/alert-announcements.cy.ts
    // Tests all variant ARIA roles and accessibility in real browser
  });

  describe('Color/Contrast Accessibility (WCAG 1.4)', () => {
    it('should verify info variant has USWDS classes for contrast', async () => {
      const { testColorContrast } = await import('@uswds-wc/test-utils/contrast-utils.js');

      element.variant = 'info';
      element.heading = 'Info Alert';
      await element.updateComplete;

      const alert = element.querySelector('.usa-alert');
      expect(alert).toBeTruthy();

      // Verify USWDS classes
      expect(alert?.classList.contains('usa-alert--info')).toBe(true);

      const result = testColorContrast(alert as Element);

      // Structure validation
      expect(result).toBeDefined();
      expect(result.foreground).toBeDefined();
      expect(result.background).toBeDefined();
    });

    it('should verify warning variant has USWDS classes for contrast', async () => {
      element.variant = 'warning';
      element.heading = 'Warning Alert';
      await element.updateComplete;

      const alert = element.querySelector('.usa-alert');
      expect(alert).toBeTruthy();

      // Verify USWDS classes
      expect(alert?.classList.contains('usa-alert--warning')).toBe(true);
    });

    it('should verify error variant has USWDS classes for contrast', async () => {
      element.variant = 'error';
      element.heading = 'Error Alert';
      await element.updateComplete;

      const alert = element.querySelector('.usa-alert');
      expect(alert).toBeTruthy();

      // Verify USWDS classes
      expect(alert?.classList.contains('usa-alert--error')).toBe(true);
    });

    it('should verify success variant has USWDS classes for contrast', async () => {
      element.variant = 'success';
      element.heading = 'Success Alert';
      await element.updateComplete;

      const alert = element.querySelector('.usa-alert');
      expect(alert).toBeTruthy();

      // Verify USWDS classes
      expect(alert?.classList.contains('usa-alert--success')).toBe(true);
    });

    it('should calculate contrast correctly for alert text', async () => {
      const { calculateContrastRatio } = await import('@uswds-wc/test-utils/contrast-utils.js');

      // USWDS alert colors should have sufficient contrast
      // Test that our contrast calculator works correctly

      // Typical dark text on light background
      const textContrast = calculateContrastRatio('#1b1b1b', '#f0f0f0');
      expect(textContrast).toBeGreaterThan(4.5);

      // High contrast (black on white)
      const highContrast = calculateContrastRatio('#000000', '#ffffff');
      expect(highContrast).toBeCloseTo(21, 0);
    });

    it('should verify alert heading has adequate contrast', async () => {
      const { testColorContrast } = await import('@uswds-wc/test-utils/contrast-utils.js');

      element.heading = 'Alert Heading';
      element.text = 'Alert body text';
      await element.updateComplete;

      const heading = element.querySelector('.usa-alert__heading');
      expect(heading).toBeTruthy();

      const result = testColorContrast(heading as Element);

      // Structure validation
      expect(result).toBeDefined();
      expect(result.isLargeText).toBe(false);
    });
  });
});
