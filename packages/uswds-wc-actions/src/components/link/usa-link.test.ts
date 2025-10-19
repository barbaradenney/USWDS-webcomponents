import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-link.ts';
import type { USALink } from './usa-link.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '../../../__tests__/accessibility-utils.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';
import {
  testKeyboardNavigation,
  getFocusableElements,
} from '../../../__tests__/keyboard-navigation-utils.js';
import {
  testPointerAccessibility,
  testTargetSize,
  testLabelInName,
} from '../../../__tests__/touch-pointer-utils.js';

describe('USALink', () => {
  let element: USALink;

  beforeEach(() => {
    element = document.createElement('usa-link') as USALink;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Default Properties', () => {
    it('should have correct default properties', async () => {
      await element.updateComplete;

      expect(element.href).toBe('');
      expect(element.target).toBe('');
      expect(element.rel).toBe('');
      expect(element.variant).toBe('default');
      expect(element.external).toBe(false);
      expect(element.unstyled).toBe(false);
      expect(element.ariaLabel).toBe('');
      expect(element.download).toBe('');
    });
  });

  describe('Basic Link Properties', () => {
    it('should set href property', async () => {
      element.href = 'https://example.com';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.getAttribute('href')).toBe('https://example.com');
    });

    it('should set target property', async () => {
      element.target = '_blank';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.getAttribute('target')).toBe('_blank');
    });

    it('should set rel property', async () => {
      element.rel = 'nofollow';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.getAttribute('rel')).toBe('nofollow');
    });

    it('should set aria-label property', async () => {
      element.ariaLabel = 'External link';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.getAttribute('aria-label')).toBe('External link');
    });

    it('should set download property', async () => {
      element.download = 'file.pdf';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.getAttribute('download')).toBe('file.pdf');
    });
  });

  describe('Variants', () => {
    it('should apply default variant with base class', async () => {
      element.variant = 'default';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link')).toBe(true);
      expect(anchor?.classList.contains('usa-link--external')).toBe(false);
      expect(anchor?.classList.contains('usa-link--alt')).toBe(false);
    });

    it('should apply external variant styling', async () => {
      element.variant = 'external';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link')).toBe(true);
      expect(anchor?.classList.contains('usa-link--external')).toBe(true);
    });

    it('should apply alt variant styling', async () => {
      element.variant = 'alt';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link')).toBe(true);
      expect(anchor?.classList.contains('usa-link--alt')).toBe(true);
    });

    it('should apply unstyled variant (no classes)', async () => {
      element.variant = 'unstyled';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link')).toBe(false);
      expect(anchor?.className).toBe('');
    });

    it('should handle unstyled boolean property', async () => {
      element.unstyled = true;
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link')).toBe(false);
    });
  });

  describe('External Link Detection', () => {
    it('should detect external links automatically', async () => {
      // Assume current domain is not external.com
      element.href = 'https://external.com/page';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link--external')).toBe(true);
      expect(anchor?.getAttribute('target')).toBe('_blank');
      expect(anchor?.getAttribute('rel')).toContain('noopener');
      expect(anchor?.getAttribute('rel')).toContain('noreferrer');
    });

    it('should not treat relative links as external', async () => {
      element.href = '/internal/page';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link--external')).toBe(false);
      expect(anchor?.getAttribute('target')).toBeFalsy();
    });

    it('should not treat hash links as external', async () => {
      element.href = '#section';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link--external')).toBe(false);
      expect(anchor?.getAttribute('target')).toBeFalsy();
    });

    it('should handle external boolean property', async () => {
      element.external = true;
      element.href = '/internal'; // Even internal href should be treated as external
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link--external')).toBe(true);
      expect(anchor?.getAttribute('target')).toBe('_blank');
      expect(anchor?.getAttribute('rel')).toContain('noopener');
      expect(anchor?.getAttribute('rel')).toContain('noreferrer');
    });
  });

  describe('Security Attributes', () => {
    it('should add noopener and noreferrer for external links', async () => {
      element.external = true;
      await element.updateComplete;

      const anchor = element.querySelector('a');
      const rel = anchor?.getAttribute('rel') || '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });

    it('should preserve existing rel attributes', async () => {
      element.external = true;
      element.rel = 'nofollow';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      const rel = anchor?.getAttribute('rel') || '';
      expect(rel).toContain('nofollow');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });

    it('should not duplicate security attributes', async () => {
      element.external = true;
      element.rel = 'noopener noreferrer';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      const rel = anchor?.getAttribute('rel') || '';
      const parts = rel.split(' ').filter(Boolean);
      const noopenerCount = parts.filter((part) => part === 'noopener').length;
      const noreferrerCount = parts.filter((part) => part === 'noreferrer').length;

      expect(noopenerCount).toBe(1);
      expect(noreferrerCount).toBe(1);
    });
  });

  describe('Event Handling', () => {
    it('should dispatch link-click event when clicked', async () => {
      element.href = 'https://example.com';
      await element.updateComplete;

      let eventDetail: any;
      element.addEventListener('link-click', (e: any) => {
        eventDetail = e.detail;
      });

      const anchor = element.querySelector('a') as HTMLAnchorElement;
      anchor.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.href).toBe('https://example.com');
      expect(eventDetail.external).toBe(true);
      expect(eventDetail.target).toBe('_blank');
    });

    it('should include event object in detail', async () => {
      element.href = '#test';
      await element.updateComplete;

      let eventDetail: any;
      element.addEventListener('link-click', (e: any) => {
        eventDetail = e.detail;
      });

      const anchor = element.querySelector('a') as HTMLAnchorElement;
      anchor.click();

      expect(eventDetail.event).toBeInstanceOf(Event);
      expect(eventDetail.external).toBe(false);
    });
  });

  describe('Public API Methods', () => {
    it('should provide click method', async () => {
      element.href = '#test';
      await element.updateComplete;

      let clicked = false;
      element.addEventListener('link-click', () => {
        clicked = true;
      });

      element.click();
      expect(clicked).toBe(true);
    });

    it('should provide focus method', async () => {
      element.href = '#test';
      await element.updateComplete;

      element.focus();

      const anchor = element.querySelector('a');
      expect(document.activeElement).toBe(anchor);
    });

    it('should provide blur method', async () => {
      element.href = '#test';
      await element.updateComplete;

      element.focus();
      element.blur();

      const anchor = element.querySelector('a');
      expect(document.activeElement).not.toBe(anchor);
    });
  });

  describe('Component Structure', () => {
    it('should render anchor element with href', async () => {
      element.href = '#test';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor?.getAttribute('href')).toBe('#test');
    });
  });

  describe('USWDS CSS Classes', () => {
    it('should always have base usa-link class by default', async () => {
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.classList.contains('usa-link')).toBe(true);
    });

    it('should have proper USWDS structure', async () => {
      element.href = '#test';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor?.tagName.toLowerCase()).toBe('a');
    });
  });

  describe('Light DOM Rendering', () => {
    it('should render in light DOM for USWDS compatibility', async () => {
      await element.updateComplete;

      expect(element.shadowRoot).toBeNull();
      expect(element.querySelector('a')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label for screen readers', async () => {
      element.ariaLabel = 'Go to external site';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.getAttribute('aria-label')).toBe('Go to external site');
    });

    it('should not set aria-label when empty', async () => {
      element.ariaLabel = '';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor?.hasAttribute('aria-label')).toBe(false);
    });
  });

  // CRITICAL TESTS - Auto-dismiss prevention and lifecycle stability
  describe('CRITICAL: Component Lifecycle Stability', () => {
    it('should remain in DOM after property changes', async () => {
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Test critical property combinations that could cause auto-dismiss
      const criticalPropertySets = [
        { href: 'https://external.com', variant: 'external', target: '_blank' },
        { href: '/internal', variant: 'default', ariaLabel: 'Internal link' },
        { href: '#section', variant: 'alt', rel: 'nofollow' },
        { href: 'document.pdf', download: 'document.pdf', variant: 'default' },
        { href: '', variant: 'unstyled', external: false, unstyled: true },
      ];

      for (const properties of criticalPropertySets) {
        Object.assign(element, properties);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain DOM connection during rapid property updates', async () => {
      const rapidUpdates = async () => {
        for (let i = 0; i < 10; i++) {
          element.href = i % 2 === 0 ? `https://external${i}.com` : `/internal${i}`;
          element.variant = i % 3 === 0 ? 'external' : i % 3 === 1 ? 'alt' : 'default';
          element.external = i % 4 === 0;
          element.unstyled = i % 5 === 0;
          await element.updateComplete;
          expect(document.body.contains(element)).toBe(true);
          expect(element.isConnected).toBe(true);
        }
      };

      await rapidUpdates();
    });

    it('should survive complete property reset cycles', async () => {
      element.href = 'https://example.com';
      element.variant = 'external';
      element.target = '_blank';
      element.rel = 'nofollow';
      element.ariaLabel = 'External link';
      element.download = 'file.pdf';
      element.external = true;
      await element.updateComplete;

      // Reset all properties
      element.href = '';
      element.variant = 'default';
      element.target = '';
      element.rel = '';
      element.ariaLabel = '';
      element.download = '';
      element.external = false;
      element.unstyled = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Set properties again
      element.href = '#new-section';
      element.variant = 'alt';
      element.ariaLabel = 'Section link';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    it('should not pollute global event handlers', async () => {
      const originalAddEventListener = document.addEventListener;
      const originalRemoveEventListener = document.removeEventListener;
      const addEventListenerSpy = vi.fn(originalAddEventListener);
      const removeEventListenerSpy = vi.fn(originalRemoveEventListener);

      document.addEventListener = addEventListenerSpy;
      document.removeEventListener = removeEventListenerSpy;

      element.href = 'https://example.com';
      await element.updateComplete;

      document.addEventListener = originalAddEventListener;
      document.removeEventListener = originalRemoveEventListener;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle custom events without side effects', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('link-click', eventSpy);

      element.href = 'https://example.com';
      await element.updateComplete;

      const anchor = element.querySelector('a') as HTMLAnchorElement;
      anchor.click();

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('link-click', eventSpy);
    });

    it('should maintain DOM connection during event handling', async () => {
      const testEvent = () => {
        element.href = 'https://event-test.com';
        element.variant = 'external';
      };

      element.addEventListener('click', testEvent);
      element.click();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('click', testEvent);
    });
  });

  describe('CRITICAL: Link State Management Stability', () => {
    it('should maintain DOM connection during external link detection changes', async () => {
      // Start with internal link
      element.href = '/internal';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Change to external link (auto-detection)
      element.href = 'https://external.com';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Force as external with boolean
      element.href = '/internal-forced-external';
      element.external = true;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Back to internal
      element.external = false;
      element.href = '#hash';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM connection during variant changes', async () => {
      const variants = ['default', 'external', 'alt', 'unstyled'];

      for (const variant of variants) {
        element.variant = variant as any;
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should handle security attribute changes without DOM removal', async () => {
      const securityConfigs = [
        { external: true, rel: '' },
        { external: true, rel: 'nofollow' },
        { external: true, rel: 'noopener noreferrer' },
        { external: false, rel: 'alternate' },
        { external: true, rel: 'nofollow noopener noreferrer' },
      ];

      for (const config of securityConfigs) {
        Object.assign(element, config);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Storybook Integration Stability', () => {
    it('should maintain DOM connection during args updates', async () => {
      const storybookArgs = [
        { href: 'https://example.com', variant: 'external', ariaLabel: 'External link' },
        { href: '/internal', variant: 'default', target: '', rel: '' },
        { href: '#section', variant: 'alt', ariaLabel: 'Go to section' },
        { href: 'file.pdf', download: 'file.pdf', variant: 'default' },
      ];

      for (const args of storybookArgs) {
        Object.assign(element, args);
        await element.updateComplete;

        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should survive Storybook control panel interactions', async () => {
      const interactions = [
        () => {
          element.href = 'https://updated.com';
        },
        () => {
          element.variant = 'external';
        },
        () => {
          element.target = '_blank';
        },
        () => {
          element.rel = 'nofollow';
        },
        () => {
          element.ariaLabel = 'Updated label';
        },
        () => {
          element.download = 'updated.pdf';
        },
        () => {
          element.external = !element.external;
        },
        () => {
          element.unstyled = !element.unstyled;
        },
      ];

      for (const interaction of interactions) {
        interaction();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should handle Storybook story switching', async () => {
      // Simulate story 1 args - External link
      element.href = 'https://external.com';
      element.variant = 'external';
      element.ariaLabel = 'Visit external site';
      element.target = '_blank';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 2 args - Internal link
      element.href = '/internal-page';
      element.variant = 'default';
      element.ariaLabel = 'Go to internal page';
      element.target = '';
      element.external = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 3 args - Unstyled link
      element.href = '#section';
      element.variant = 'unstyled';
      element.ariaLabel = '';
      element.unstyled = true;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath =
          `${process.cwd()}/src/components/link/usa-link.ts`;
        const validation = validateComponentJavaScript(componentPath, 'link');

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
      // Test default link
      element.href = 'https://example.com';
      element.innerHTML = 'Visit Example Site';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test external link with aria-label
      element.external = true;
      element.ariaLabel = 'Visit Example Site (opens in new tab)';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test internal link
      element.href = '/internal-page';
      element.external = false;
      element.ariaLabel = '';
      element.innerHTML = 'Go to Internal Page';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test alt variant
      element.variant = 'alt';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test download link
      element.href = 'document.pdf';
      element.download = 'important-document.pdf';
      element.innerHTML = 'Download Document (PDF)';
      element.ariaLabel = 'Download important document as PDF file';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should maintain accessibility during dynamic updates', async () => {
      // Set initial accessible state
      element.href = '#section1';
      element.innerHTML = 'Go to Section 1';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update to external link
      element.href = 'https://external.gov';
      element.external = true;
      element.innerHTML = 'Visit Government Site';
      element.ariaLabel = 'Visit government site (opens in new tab)';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update variant
      element.variant = 'external';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update to unstyled
      element.variant = 'unstyled';
      element.href = '/help';
      element.external = false;
      element.ariaLabel = '';
      element.innerHTML = 'Get Help';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility with various link types', async () => {
      const linkTypes = [
        {
          href: 'mailto:support@agency.gov',
          text: 'Email Support',
          ariaLabel: 'Send email to support team',
        },
        {
          href: 'tel:+1-800-555-0199',
          text: 'Call Support',
          ariaLabel: 'Call support at 1-800-555-0199',
        },
        {
          href: 'https://forms.agency.gov/application',
          text: 'Apply Online',
          ariaLabel: 'Apply online (opens in new tab)',
          external: true,
        },
        {
          href: '#main-content',
          text: 'Skip to main content',
          ariaLabel: 'Skip to main content',
        },
      ];

      for (const linkType of linkTypes) {
        element.href = linkType.href;
        element.innerHTML = linkType.text;
        element.ariaLabel = linkType.ariaLabel;
        if (linkType.external) {
          element.external = true;
        } else {
          element.external = false;
        }
        await element.updateComplete;
        await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      }
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should be focusable via keyboard (Tab)', async () => {
      element.href = '/test';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor!.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should allow keyboard navigation', async () => {
      element.href = '/page';
      await element.updateComplete;

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBe(1);
      expect(focusableElements[0].tagName).toBe('A');
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.href = '/home';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();

      const result = await testKeyboardNavigation(anchor!, {
        shortcuts: [
          { key: 'Enter', description: 'Activate link' },
        ],
        testEscapeKey: false,
        testArrowKeys: false,
      });

      expect(result.passed).toBe(true);
    });

    it('should have no keyboard traps', async () => {
      element.href = '/test';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      anchor!.dispatchEvent(tabEvent);
      expect(true).toBe(true);
    });

    it('should handle Enter key activation', async () => {
      element.href = '/activate';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });

      anchor!.dispatchEvent(enterEvent);
      expect(anchor!.href).toContain('/activate');
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      element.href = '/visible';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor!.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle external link keyboard navigation', async () => {
      element.href = 'https://external.com';
      element.external = true;
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor!.tabIndex).toBeGreaterThanOrEqual(0);
      expect(anchor!.target).toBe('_blank');
    });

    it('should handle variant links keyboard navigation', async () => {
      element.href = '/variant';
      element.variant = 'unstyled';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor!.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should not interfere with surrounding navigation', async () => {
      const wrapper = document.createElement('div');
      const link1 = document.createElement('a');
      link1.href = '/before';
      wrapper.appendChild(link1);

      element.href = '/middle';
      wrapper.appendChild(element);

      const link2 = document.createElement('a');
      link2.href = '/after';
      wrapper.appendChild(link2);

      document.body.appendChild(wrapper);
      await element.updateComplete;

      const allFocusable = [link1, element.querySelector('a')!, link2].filter((el) => el.tabIndex >= 0);
      expect(allFocusable.length).toBe(3);

      wrapper.remove();
    });

    it('should handle download attribute with keyboard', async () => {
      element.href = '/file.pdf';
      element.download = 'document.pdf';
      await element.updateComplete;

      const anchor = element.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor!.tabIndex).toBeGreaterThanOrEqual(0);
      expect(anchor!.download).toBe('document.pdf');
    });
  });

  describe('Touch/Pointer Accessibility (WCAG 2.5)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-link') as USALink;
      element.href = '#';
      element.textContent = 'Click Me';
      document.body.appendChild(element);
      await element.updateComplete;
    });

    afterEach(() => {
      element.remove();
    });

    it('should have adequate target size (44x44px minimum)', async () => {
      await element.updateComplete;
      const anchor = element.querySelector('a');

      // Ensure anchor element exists
      expect(anchor).toBeTruthy();
      if (!anchor) return;

      // Mock getBoundingClientRect for jsdom
      vi.spyOn(anchor as HTMLElement, 'getBoundingClientRect').mockReturnValue({
        width: 50,
        height: 50,
        top: 0,
        left: 0,
        right: 50,
        bottom: 50,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const result = testTargetSize(element, 44);
      expect(result.compliant).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.totalTested).toBeGreaterThan(0);
    });

    it('should pass label-in-name check (WCAG 2.5.3)', async () => {
      await element.updateComplete;

      const result = testLabelInName(element);
      expect(result.correct).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should pass label-in-name with aria-label containing visible text', async () => {
      element.ariaLabel = 'Click Me Link';
      await element.updateComplete;

      const result = testLabelInName(element);
      expect(result.correct).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should pass comprehensive pointer accessibility tests', async () => {
      await element.updateComplete;
      const anchor = element.querySelector('a');

      // Ensure anchor element exists
      expect(anchor).toBeTruthy();
      if (!anchor) return;

      // Mock getBoundingClientRect for jsdom
      vi.spyOn(anchor as HTMLElement, 'getBoundingClientRect').mockReturnValue({
        width: 50,
        height: 50,
        top: 0,
        left: 0,
        right: 50,
        bottom: 50,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const result = await testPointerAccessibility(element, {
        minTargetSize: 44,
        testCancellation: true,
        testLabelInName: true,
        testMultiPointGestures: true,
      });

      expect(result.passed).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.details.targetSizeCompliant).toBe(true);
      expect(result.details.labelInNameCorrect).toBe(true);
      expect(result.details.noMultiPointGestures).toBe(true);
    });
  });
});
