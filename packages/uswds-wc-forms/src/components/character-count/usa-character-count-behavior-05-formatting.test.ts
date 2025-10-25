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
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
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

  it('should format message as "[count] characters remaining" initially', async () => {
    await waitForBehaviorInit(element);

    const message = element.querySelector('.usa-character-count__status') as HTMLElement;
    // USWDS uses "remaining" for all states
    // See node_modules/@uswds/uswds/packages/usa-character-count/src/index.js
    expect(message.textContent?.trim()).toMatch(/\d+ characters? remaining/i);
  });

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: Already skipped in usa-character-count.test.ts with Cypress coverage

  // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
  // Coverage: Already skipped in usa-character-count.test.ts with Cypress coverage
});
