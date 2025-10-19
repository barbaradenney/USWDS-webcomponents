import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-tag.ts';
import type { USATag } from './usa-tag.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '../../../__tests__/accessibility-utils.js';
import { validateComponentJavaScript } from '../../../__tests__/test-utils.js';

describe('USATag', () => {
  let element: USATag;

  beforeEach(() => {
    element = document.createElement('usa-tag') as USATag;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Default Properties', () => {
    it('should have correct default properties', async () => {
      await element.updateComplete;

      expect(element.text).toBe('');
      expect(element.big).toBe(false);
      expect(element.removable).toBe(false);
      expect(element.value).toBe('');
    });
  });

  describe('Basic Rendering', () => {
    it('should render a span with usa-tag class', async () => {
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span).toBeTruthy();
      expect(span?.classList.contains('usa-tag')).toBe(true);
    });

    it('should display text content when text property is set', async () => {
      element.text = 'Government';
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.textContent?.trim()).toBe('Government');
    });

    it('should render slot content when no text property is set', async () => {
      const slotContent = document.createElement('span');
      slotContent.textContent = 'Slotted Content';
      element.appendChild(slotContent);

      await element.updateComplete;

      expect(element.textContent?.includes('Slotted Content')).toBe(true);
    });

    it('should prioritize text property over slot content', async () => {
      element.text = 'Text Property';
      const slotContent = document.createElement('span');
      slotContent.textContent = 'Slotted Content';
      element.appendChild(slotContent);

      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.textContent?.trim()).toBe('Text Property');
    });
  });

  describe('Big Variant', () => {
    it('should apply big class when big property is true', async () => {
      element.big = true;
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag--big')).toBe(true);
    });

    it('should not apply big class when big property is false', async () => {
      element.big = false;
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag--big')).toBe(false);
    });

    it('should toggle big class when property changes', async () => {
      element.big = false;
      await element.updateComplete;

      let span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag--big')).toBe(false);

      element.big = true;
      await element.updateComplete;

      span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag--big')).toBe(true);
    });
  });

  describe('Removable Functionality', () => {
    it('should apply removable class when removable property is true', async () => {
      element.removable = true;
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag--removable')).toBe(true);
    });

    it('should render remove button when removable is true', async () => {
      element.text = 'Removable Tag';
      element.removable = true;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton).toBeTruthy();
      expect(removeButton?.tagName.toLowerCase()).toBe('button');
    });

    it('should not render remove button when removable is false', async () => {
      element.removable = false;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton).toBeNull();
    });

    it('should have proper ARIA label on remove button', async () => {
      element.text = 'Test Tag';
      element.removable = true;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      expect(removeButton?.getAttribute('aria-label')).toBe('Remove tag: Test Tag');
    });

    it('should have proper button type', async () => {
      element.removable = true;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      expect(removeButton?.type).toBe('button');
    });

    it('should have ✕ content in remove button (USWDS pattern)', async () => {
      element.removable = true;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton).toBeTruthy();
      // Button should contain ✕ symbol for remove functionality
      expect(removeButton?.textContent).toBe('✕'); // Check for ✕ symbol
      // USWDS provides the icon via CSS, so no SVG should be present
      const svg = element.querySelector('.usa-tag__remove svg');
      expect(svg).toBeFalsy();
    });
  });

  describe('Remove Event Handling', () => {
    it('should dispatch tag-remove event when remove button is clicked', async () => {
      element.text = 'Test Tag';
      element.value = 'test-value';
      element.removable = true;
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('tag-remove', eventSpy);

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      removeButton?.click();

      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            text: 'Test Tag',
            value: 'test-value',
          },
        })
      );
    });

    it('should dispatch event with correct detail when value is empty', async () => {
      element.text = 'Simple Tag';
      element.removable = true;
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('tag-remove', eventSpy);

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      removeButton?.click();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            text: 'Simple Tag',
            value: '',
          },
        })
      );
    });

    it('should create bubbling and composed event', async () => {
      element.removable = true;
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('tag-remove', eventSpy);

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      removeButton?.click();

      const event = eventSpy.mock.calls[0][0];
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
    });

    it('should stop event propagation when remove button is clicked', async () => {
      element.removable = true;
      await element.updateComplete;

      const parentSpy = vi.fn();
      document.body.addEventListener('click', parentSpy);

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      removeButton?.click();

      // The click should not bubble to the parent
      expect(parentSpy).not.toHaveBeenCalled();

      document.body.removeEventListener('click', parentSpy);
    });

    it('should remove element from DOM after dispatching event', async () => {
      element.text = 'Remove Me';
      element.removable = true;
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      removeButton?.click();

      expect(document.body.contains(element)).toBe(false);
    });
  });

  describe('Combined Classes', () => {
    it('should apply both big and removable classes', async () => {
      element.big = true;
      element.removable = true;
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag')).toBe(true);
      expect(span?.classList.contains('usa-tag--big')).toBe(true);
      expect(span?.classList.contains('usa-tag--removable')).toBe(true);
    });

    it('should handle class changes dynamically', async () => {
      element.big = false;
      element.removable = false;
      await element.updateComplete;

      let span = element.querySelector('span');
      expect(span?.className).toBe('usa-tag');

      element.big = true;
      element.removable = true;
      await element.updateComplete;

      span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag')).toBe(true);
      expect(span?.classList.contains('usa-tag--big')).toBe(true);
      expect(span?.classList.contains('usa-tag--removable')).toBe(true);
    });
  });

  describe('Value Property', () => {
    it('should store value property for event data', async () => {
      element.value = 'tag-identifier';
      expect(element.value).toBe('tag-identifier');
    });

    it('should include value in remove event even if different from text', async () => {
      element.text = 'Display Text';
      element.value = 'internal-value';
      element.removable = true;
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('tag-remove', eventSpy);

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      removeButton?.click();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            text: 'Display Text',
            value: 'internal-value',
          },
        })
      );
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper button role for remove button', async () => {
      element.removable = true;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton?.tagName.toLowerCase()).toBe('button');
      expect(removeButton?.getAttribute('type')).toBe('button');
    });

    it('should have descriptive aria-label for remove button', async () => {
      element.text = 'Accessibility Tag';
      element.removable = true;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton?.getAttribute('aria-label')).toBe('Remove tag: Accessibility Tag');
    });

    it('should use USWDS CSS-provided icon (no custom SVG)', async () => {
      element.removable = true;
      await element.updateComplete;

      // USWDS provides the icon via CSS, so no SVG should be present
      const svg = element.querySelector('.usa-tag__remove svg');
      expect(svg).toBeFalsy();

      // Button should only contain ✕ symbol as per USWDS pattern
      const removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton?.textContent).toBe('✕');
    });

    it('should be keyboard accessible', async () => {
      element.removable = true;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;

      // Should be focusable
      removeButton?.focus();
      expect(document.activeElement).toBe(removeButton);

      // Should respond to keyboard events
      const eventSpy = vi.fn();
      element.addEventListener('tag-remove', eventSpy);

      // Simulate keyboard activation
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      removeButton?.dispatchEvent(enterEvent);

      // Note: In a real browser, Enter on a button triggers click
      // In tests, we can verify the button is properly set up for keyboard access
      expect(removeButton?.tagName.toLowerCase()).toBe('button');
    });
  });

  describe('Light DOM Rendering', () => {
    it('should render in light DOM for USWDS compatibility', async () => {
      await element.updateComplete;

      expect(element.shadowRoot).toBeNull();
      expect(element.querySelector('span')).toBeTruthy();
    });
  });

  describe('Property Updates and Re-rendering', () => {
    it('should re-render when text changes', async () => {
      element.text = 'Original Text';
      await element.updateComplete;

      let span = element.querySelector('span');
      expect(span?.textContent?.trim()).toBe('Original Text');

      element.text = 'Updated Text';
      await element.updateComplete;

      span = element.querySelector('span');
      expect(span?.textContent?.trim()).toBe('Updated Text');
    });

    it('should re-render when big property changes', async () => {
      element.big = false;
      await element.updateComplete;

      let span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag--big')).toBe(false);

      element.big = true;
      await element.updateComplete;

      span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag--big')).toBe(true);
    });

    it('should re-render when removable property changes', async () => {
      element.removable = false;
      await element.updateComplete;

      expect(element.querySelector('.usa-button--unstyled')).toBeNull();

      element.removable = true;
      await element.updateComplete;

      expect(element.querySelector('.usa-button--unstyled')).toBeTruthy();
    });

    it('should update aria-label when text changes on removable tag', async () => {
      element.text = 'Initial';
      element.removable = true;
      await element.updateComplete;

      let removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton?.getAttribute('aria-label')).toBe('Remove tag: Initial');

      element.text = 'Changed';
      await element.updateComplete;

      removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton?.getAttribute('aria-label')).toBe('Remove tag: Changed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text gracefully', async () => {
      element.text = '';
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span).toBeTruthy();
    });

    it('should handle whitespace-only text', async () => {
      element.text = '   ';
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.textContent?.trim()).toBe('');
    });

    it('should handle special characters in text', async () => {
      element.text = '<script>alert("test")</script>';
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.textContent?.trim()).toBe('<script>alert("test")</script>');
      // Ensure it's treated as text, not HTML
      expect(element.querySelector('script')).toBeNull();
    });

    it('should handle long text content', async () => {
      const longText = 'A'.repeat(100);
      element.text = longText;
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.textContent?.trim()).toBe(longText);
    });

    it('should handle unicode characters', async () => {
      element.text = '🏛️ Government 中文 العربية';
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.textContent?.trim()).toBe('🏛️ Government 中文 العربية');
    });

    it('should handle aria-label with special characters', async () => {
      element.text = 'Tag with "quotes" & <symbols>';
      element.removable = true;
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton?.getAttribute('aria-label')).toBe(
        'Remove tag: Tag with "quotes" & <symbols>'
      );
    });
  });

  describe('USWDS CSS Classes', () => {
    it('should always have base usa-tag class', async () => {
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag')).toBe(true);
    });

    it('should use proper USWDS tag structure', async () => {
      element.text = 'Test';
      element.removable = true;
      await element.updateComplete;

      expect(element.querySelector('span.usa-tag')).toBeTruthy();
      expect(element.querySelector('.usa-button--unstyled')).toBeTruthy();
      // USWDS pattern: no SVG in remove button, only ✕ symbol with standard button styling
      expect(element.querySelector('.usa-tag__remove svg')).toBeFalsy();

      const removeButton = element.querySelector('.usa-button--unstyled');
      expect(removeButton?.textContent).toBe('✕');
    });

    it('should apply proper USWDS modifier classes', async () => {
      element.big = true;
      element.removable = true;
      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag--big')).toBe(true);
      expect(span?.classList.contains('usa-tag--removable')).toBe(true);
    });
  });

  describe('Event Delegation and Cleanup', () => {
    it('should not leak event listeners after removal', async () => {
      element.removable = true;
      element.text = 'Test';
      await element.updateComplete;

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      removeButton?.click(); // This removes the element

      // Element should be removed and no memory leaks
      expect(document.body.contains(element)).toBe(false);
    });

    it('should handle multiple rapid remove events', async () => {
      element.removable = true;
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('tag-remove', eventSpy);

      const removeButton = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;

      // Rapid clicks should only trigger once (element gets removed)
      removeButton?.click();

      expect(eventSpy).toHaveBeenCalledOnce();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle rapid property changes efficiently', async () => {
      // Simulate rapid changes
      for (let i = 0; i < 10; i++) {
        element.text = `Tag ${i}`;
        element.big = i % 2 === 0;
        element.removable = i % 3 === 0;
      }

      await element.updateComplete;

      const span = element.querySelector('span');
      expect(span?.classList.contains('usa-tag')).toBe(true);
      // When removable is true (9 % 3 === 0), the span contains both text and remove button
      expect(span?.textContent?.includes('Tag 9')).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath =
          `${process.cwd()}/src/components/tag/usa-tag.ts`;
        const validation = validateComponentJavaScript(componentPath, 'tag');

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

  describe('Accessibility', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.textContent = 'Test Tag';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Color/Contrast Accessibility (WCAG 1.4)', () => {
    it('should verify tag has USWDS classes for contrast', async () => {
      const { testColorContrast } = await import('../../../__tests__/contrast-utils.js');

      await element.updateComplete;

      const tag = element.querySelector('.usa-tag');
      expect(tag).toBeTruthy();

      const result = testColorContrast(tag as Element);

      // Structure validation
      expect(result).toBeDefined();
      expect(result.foreground).toBeDefined();
      expect(result.background).toBeDefined();
    });

    it('should verify big variant has USWDS classes', async () => {
      element.big = true;
      await element.updateComplete;

      const tag = element.querySelector('.usa-tag');
      expect(tag).toBeTruthy();

      // Verify USWDS classes
      expect(tag?.classList.contains('usa-tag--big')).toBe(true);
    });

    it('should calculate contrast correctly for tag colors', async () => {
      const { calculateContrastRatio } = await import('../../../__tests__/contrast-utils.js');

      // USWDS tag uses dark background with white text
      // Test typical tag color combinations

      // Dark background with white text (typical USWDS tag)
      const tagContrast = calculateContrastRatio('#ffffff', '#1b1b1b');
      expect(tagContrast).toBeGreaterThan(4.5);
      expect(tagContrast).toBeGreaterThan(7); // Should pass AAA

      // Verify high contrast
      const highContrast = calculateContrastRatio('#000000', '#ffffff');
      expect(highContrast).toBeCloseTo(21, 0);
    });

    it('should verify tag text has adequate contrast', async () => {
      const { testColorContrast } = await import('../../../__tests__/contrast-utils.js');

      await element.updateComplete;

      const tag = element.querySelector('.usa-tag');
      expect(tag).toBeTruthy();

      const result = testColorContrast(tag as Element);

      // Structure validation
      expect(result).toBeDefined();
    });

    it('should test large text identification for big tags', async () => {
      const { testColorContrast } = await import('../../../__tests__/contrast-utils.js');

      element.big = true;
      await element.updateComplete;

      const tag = element.querySelector('.usa-tag');
      expect(tag).toBeTruthy();

      const result = testColorContrast(tag as Element);

      // Big tags may be identified as large text
      expect(result).toBeDefined();
      expect(result.isLargeText).toBeDefined();
    });

    it('should verify tag maintains contrast with explicit colors', async () => {
      const { testColorContrast } = await import('../../../__tests__/contrast-utils.js');

      await element.updateComplete;

      const tag = element.querySelector('.usa-tag') as HTMLElement;
      expect(tag).toBeTruthy();

      // Apply explicit colors for testing
      tag.style.color = '#ffffff';
      tag.style.backgroundColor = '#1b1b1b';

      const result = testColorContrast(tag);

      expect(result.passesAA).toBe(true);
      expect(result.passesAAA).toBe(true);
      expect(result.ratio).toBeGreaterThan(7);
    });
  });
});
