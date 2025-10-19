/**
 * USWDS Character Count Behavior Contract Tests - Part 3: Validation States
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

describe('USWDS Character Count - Contract 3: Validation States', () => {
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

  it('should not show error state when under limit', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const formGroup = element.querySelector('.usa-form-group');

    input.value = 'Within limit';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(formGroup?.classList.contains('usa-form-group--error')).toBe(false);
  });

  it('should show error state when over limit', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const formGroup = element.querySelector('.usa-form-group');

    input.value = 'a'.repeat(51); // Over 50 character limit
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);
  });

  it('should add usa-input--error class to input when over limit', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLElement;

    (input as HTMLInputElement).value = 'a'.repeat(51);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(input.classList.contains('usa-input--error')).toBe(true);
  });

  it('should show negative count when over limit', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const message = element.querySelector('.usa-character-count__message') as HTMLElement;

    input.value = 'a'.repeat(55); // 5 over limit
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(message.textContent).toContain('5 characters over limit');
  });

  it('should update aria-invalid when validation state changes', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;

    // Within limit
    input.value = 'Valid';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(input.getAttribute('aria-invalid')).toBe('false');

    // Over limit
    input.value = 'a'.repeat(51);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
