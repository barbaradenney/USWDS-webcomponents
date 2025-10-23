/**
 * Radio Layout Tests
 * Prevents regression of radio alignment, label positioning, and group layout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../radio/index.ts';
import type { USARadio } from './usa-radio.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';

describe('USARadio Layout Tests', () => {
  let element: USARadio;

  beforeEach(() => {
    element = document.createElement('usa-radio') as USARadio;
    element.label = 'Test Radio';
    element.name = 'test-radio';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS radio structure', async () => {
    await element.updateComplete;

    const radio = element.querySelector('.usa-radio');
    const input = element.querySelector('.usa-radio__input');
    const label = element.querySelector('.usa-radio__label');

    expect(radio, 'Radio container should exist').toBeTruthy();
    expect(input, 'Radio input should exist').toBeTruthy();
    expect(label, 'Radio label should exist').toBeTruthy();

    // Verify USWDS structure hierarchy
    expect(radio!.contains(input!)).toBe(true);
    expect(radio.contains(input)).toBe(true);
    expect(radio.contains(label)).toBe(true);
  });

  it('should position input and label correctly within radio', async () => {
    await element.updateComplete;

    const radio = element.querySelector('.usa-radio');
    const input = element.querySelector('.usa-radio__input');
    const label = element.querySelector('.usa-radio__label');

    // Input should appear before label in radio
    const radioChildren = Array.from(radio.children);
    const inputIndex = radioChildren.indexOf(input);
    const labelIndex = radioChildren.indexOf(label);

    expect(inputIndex, 'Input should appear before label').toBeLessThan(labelIndex);
  describe('JavaScript Implementation Validation', () => {
    it('should pass JavaScript implementation validation', async () => {
      // Validate USWDS JavaScript implementation patterns
      const componentPath = `${process.cwd()}/src/components/radio/usa-radio.ts`;
      const validation = validateComponentJavaScript(componentPath, 'radio');

      if (!validation.isValid) {
        console.warn('JavaScript validation issues:', validation.issues);
      }

      // JavaScript validation should pass for critical integration patterns
      expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

      // Critical USWDS integration should be present
      const criticalIssues = validation.issues.filter(issue =>
        issue.includes('Missing USWDS JavaScript integration')
      );
      expect(criticalIssues.length).toBe(0);
    });
  });
  });

  describe('Visual Regression Prevention', () => {
    it('should maintain radio structure integrity', async () => {
      await element.updateComplete;

      const radio = element.querySelector('.usa-radio');

      expect(radio, 'Radio container should exist').toBeTruthy();
      expect(radio!.classList.contains('usa-radio')).toBe(true);
    });

    it('should maintain proper label association', async () => {
      await element.updateComplete;

      const input = element.querySelector('.usa-radio__input');
      const label = element.querySelector('.usa-radio__label');

      if (input && label) {
        const inputId = input.getAttribute('id');
        const labelFor = label.getAttribute('for');
        expect(labelFor).toBe(inputId);
      }
    });
  });
});