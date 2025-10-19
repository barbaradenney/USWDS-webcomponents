/**
 * USWDS Character Count Behavior Contract Tests - Part 5: Message Formatting
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

describe('USWDS Character Count - Contract 5: Message Formatting', () => {
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

  it('should format message as "[count] characters remaining"', async () => {
    await waitForBehaviorInit(element);

    const message = element.querySelector('.usa-character-count__message') as HTMLElement;
    // USWDS uses "remaining" not "left"
    expect(message.textContent).toMatch(/\d+ characters? remaining/i);
  });

  it('should format message as "[count] characters over limit" when exceeded', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const message = element.querySelector('.usa-character-count__message') as HTMLElement;

    input.value = 'a'.repeat(55); // 5 over limit
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    // USWDS shows "5 characters over limit"
    expect(message.textContent).toMatch(/\d+ characters? over limit/i);
  });

  it('should update visual message immediately on input', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;
    const message = element.querySelector('.usa-character-count__message') as HTMLElement;

    const initialText = message.textContent;

    input.value = 'Changed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await waitForBehaviorInit(element);

    expect(message.textContent).not.toBe(initialText);
  });
});
