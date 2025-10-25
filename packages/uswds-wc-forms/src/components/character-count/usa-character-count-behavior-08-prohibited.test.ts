/**
 * USWDS Character Count Behavior Contract Tests - Part 8: Prohibited Behaviors
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
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-character-count.js';
import type { USACharacterCount } from './usa-character-count.js';

describe('USWDS Character Count - Prohibited Behaviors (must NOT be present)', () => {
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

  it('should NOT prevent typing when over limit (browser handles this)', async () => {
    await waitForBehaviorInit(element);

    const input = element.querySelector('textarea, input') as HTMLInputElement;

    // Browser should enforce maxlength, not JavaScript
    input.value = 'a'.repeat(51);

    let inputEventPrevented = false;
    input.addEventListener('input', (event) => {
      inputEventPrevented = event.defaultPrevented;
    });

    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(inputEventPrevented).toBe(false);
  });

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: Already skipped in usa-character-count.test.ts with Cypress coverage

  it('should NOT modify USWDS class names', async () => {
    await waitForBehaviorInit(element);

    const message = element.querySelector('.usa-character-count__message');
    const status = element.querySelector('.usa-character-count__status');
    const srStatus = element.querySelector('.usa-character-count__sr-status');

    expect(message).not.toBeNull();
    expect(status).not.toBeNull();
    expect(srStatus).not.toBeNull();
  });
});
