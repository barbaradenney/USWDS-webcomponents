/**
 * USWDS Character Count Behavior Contract Tests - Part 6: Edge Cases
 *
 * These tests validate that our character count implementation EXACTLY matches
 * USWDS character count behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-character-count/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '../../../__tests__/test-utils.js';
import './usa-character-count.js';
import type { USACharacterCount } from './usa-character-count.js';

describe('USWDS Character Count - Contract 6: Edge Cases', () => {
  let element: USACharacterCount;

  beforeEach(() => {
    element = document.createElement('usa-character-count') as USACharacterCount;
    element.maxlength = 50;
    element.id = 'test-character-count';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should handle empty input correctly', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const message = element.querySelector('.usa-character-count__message') as HTMLElement;

    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(message.textContent).toContain('50');
  });

  it('should handle exactly at limit', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const message = element.querySelector('.usa-character-count__message') as HTMLElement;
    const formGroup = element.querySelector('.usa-form-group');

    input.value = 'a'.repeat(50); // Exactly at limit
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(message.textContent).toContain('Character limit reached');
    expect(formGroup?.classList.contains('usa-form-group--error')).toBe(false);
  });

  it('should handle whitespace in character count', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const message = element.querySelector('.usa-character-count__message') as HTMLElement;

    input.value = '   test   '; // 10 characters including spaces
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(message.textContent).toContain('40'); // 50 - 10
  });

  it('should handle newlines in textarea', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const message = element.querySelector('.usa-character-count__message') as HTMLElement;

    input.value = 'Line 1\nLine 2'; // 13 characters including newline
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(message.textContent).toContain('37'); // 50 - 13
  });
});
